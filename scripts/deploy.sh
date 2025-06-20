#!/bin/bash

# 如果任何命令失败，立即退出脚本
set -e

# --- 配置 ---
ENV=$1
REMOTE_HOST="aliyun-car"
REMOTE_APP_DIR="/apps/car-management" # 远程服务器上的应用目录
CONTAINER_NAME="car-management"
LOCAL_ENV_FILE="packages/car-management-api/.env.${ENV}"
REMOTE_ENV_FILE_PATH="${REMOTE_APP_DIR}/.env.${ENV}"

# --- 检查环境参数 ---
if [ -z "$ENV" ]; then
  echo "错误: 未指定部署环境。用法: $0 [staging|production]"
  exit 1
fi

# --- 检查本地 .env 文件 ---
if [ ! -f "$LOCAL_ENV_FILE" ]; then
  echo "错误: 找不到环境 '$ENV' 的配置文件: '$LOCAL_ENV_FILE'"
  exit 1
fi

# --- 加载根目录的 .env 文件以获取 IMAGE_REGISTRY 和 IMAGE_NAME ---
# 确保此脚本与 package.json 中的脚本具有相同的环境变量
if [ ! -f ".env" ]; then
    echo "错误: 根目录下的 .env 文件不存在。"
    exit 1
fi
export $(grep -v '^#' .env | xargs)

# --- 环境文件同步 ---
echo "正在检查远程环境文件..."
LOCAL_CHECKSUM=$(shasum -a 256 "$LOCAL_ENV_FILE" | awk '{print $1}')

REMOTE_CHECKSUM=$(ssh "$REMOTE_HOST" "
  mkdir -p $REMOTE_APP_DIR && \
  if [ -f \"$REMOTE_ENV_FILE_PATH\" ]; then
    shasum -a 256 \"$REMOTE_ENV_FILE_PATH\" | awk '{print \\\$1}'
  else
    echo 'NOT_FOUND'
  fi
")

if [ "$REMOTE_CHECKSUM" == "NOT_FOUND" ]; then
  echo "远程 .env 文件未找到，正在上传..."
  scp "$LOCAL_ENV_FILE" "${REMOTE_HOST}:${REMOTE_ENV_FILE_PATH}"
  echo "上传完成。"
elif [ "$LOCAL_CHECKSUM" != "$REMOTE_CHECKSUM" ]; then
  echo "--------------------------------------------------------------------------"
  echo "!!! 部署中止 !!!"
  echo "远程环境 '$ENV' 的配置文件与本地版本不同步。"
  echo "本地文件:  $LOCAL_ENV_FILE"
  echo "远程文件: ${REMOTE_HOST}:${REMOTE_ENV_FILE_PATH}"
  echo "请手动解决差异后重试。"
  echo "--------------------------------------------------------------------------"
  exit 1
else
  echo "远程环境文件已是最新。"
fi

# --- Docker 部署 ---
echo "正在部署环境 '${ENV}' 到主机 '${REMOTE_HOST}'..."

# 从根 .env 文件加载镜像名称
if [ -z "$IMAGE_REGISTRY" ] || [ -z "$IMAGE_NAME" ]; then
  echo "错误: 根目录的 .env 文件中未设置 IMAGE_REGISTRY 和/或 IMAGE_NAME。"
  exit 1
fi

IMAGE_TAG="latest"
if [ "$ENV" == "production" ]; then
  # 对于生产环境，我们使用从 package.json 中获取的版本号作为镜像标签
  VERSION=$(node -p "require('./package.json').version")
  if [ -z "$VERSION" ]; then
    echo "错误: 无法从 package.json 获取版本号。"
    exit 1
  fi
  IMAGE_TAG="$VERSION"
fi

FULL_IMAGE_NAME="${IMAGE_REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG}"

echo "使用镜像: $FULL_IMAGE_NAME"

ssh "$REMOTE_HOST" "
  set -e
  echo '正在拉取最新镜像...'
  docker pull \$FULL_IMAGE_NAME

  echo '正在停止并删除旧容器...'
  (docker stop $CONTAINER_NAME || true) && (docker rm $CONTAINER_NAME || true)

  echo '正在启动新容器...'
  docker run -d \\
    --restart always \\
    --name $CONTAINER_NAME \\
    -p 3000:3000 \\
    --env-file $REMOTE_ENV_FILE_PATH \\
    \$FULL_IMAGE_NAME

  echo '正在清理旧镜像...'
  docker image prune -f

  echo '部署成功！'
" 