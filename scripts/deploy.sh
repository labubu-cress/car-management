#!/bin/bash

# --- 部署脚本说明 ---
#
# 用法:
#   bash scripts/deploy.sh [environment] [remote_host]
#
#   [environment] - 必需参数，指定部署环境。可选值为 `staging` 或 `production`。
#                   例如: `bash scripts/deploy.sh staging`
#
# 脚本功能:
#   1. 环境检查: 检查是否提供了部署环境参数 (staging/production)。
#   2. 配置文件检查: 检查本地是否存在对应环境的 `.env` 文件 (e.g., `packages/car-management-api/.env.staging`)。
#   3. 环境变量加载: 从项目根目录的 `.env` 文件加载 `VPC_IMAGE_REGISTRY` 和 `IMAGE_NAME`。
#   4. 远程配置文件同步:
#      - 检查远程服务器上是否存在对应的 `.env` 文件。
#      - 如果远程文件不存在，则上传本地的 `.env` 文件。
#      - 如果远程文件存在，则比较本地和远程文件的 checksum。如果 checksum不匹配，脚本会中止并提示用户手动同步，防止配置错误。
#   5. Docker 镜像部署:
#      - 根据环境确定 Docker 镜像的 tag (`latest` for staging, version from `package.json` for production)。
#      - SSH 连接到远程主机 (`aliyun-car`)。
#      - 拉取最新的 Docker 镜像。
#      - 停止并删除同名的旧容器。
#      - 使用新的镜像和远程的 `.env` 文件启动新容器。
#      - 清理无用的旧 Docker 镜像。
#
# 副作用 (Side Effects):
#   - 会在远程服务器上创建目录 (`/apps/car-management`)。
#   - 会上传或覆盖远程服务器上的 `.env.[environment]` 文件。
#   - 会停止并删除名为 `car-management` 的 Docker 容器。
#   - 会从远程 Docker 仓库拉取镜像，可能会产生网络流量费用。
#   - 会删除远程服务器上未被任何容器使用的 Docker 镜像。
#
# 风险 (Risks):
#   - **配置覆盖**: 如果远程 `.env` 文件有未同步到本地的重要修改，直接运行此脚本（在远程文件不存在的情况下）会导致这些修改被本地文件覆盖。
#   - **服务中断**: 部署过程中，从停止旧容器到启动新容器会有短暂的服务中断。
#   - **部署失败**: 如果新镜像有问题（例如，无法启动或运行出错），服务将保持中断状态，需要手动干预恢复。
#   - **环境错误**: 错误地将 staging 环境部署到 production 主机（或反之）可能导致数据错误或服务不可用。请确保脚本中的 `REMOTE_HOST` 等配置正确无误。
#   - **依赖根 .env 文件**: 脚本依赖项目根目录下的 `.env` 文件来获取镜像仓库信息。如果该文件缺失或配置错误，部署会失败。

# 如果任何命令失败，立即退出脚本
set -e

# --- 配置 ---
ENV=$1
REMOTE_HOST=$2
REMOTE_APP_DIR="/apps/car-management" # 远程服务器上的应用目录
CONTAINER_NAME="car-management"
LOCAL_ENV_FILE="packages/car-management-api/.env.${ENV}"
REMOTE_ENV_FILE_PATH="${REMOTE_APP_DIR}/.env.${ENV}"
LOCAL_CERT_DIR="packages/car-management-api/.certificates"
REMOTE_CERT_DIR="${REMOTE_APP_DIR}/.certificates"

# --- 检查环境参数 ---
if [ -z "$ENV" ] || [ -z "$REMOTE_HOST" ]; then
  echo "错误: 未指定部署环境或远程主机。用法: $0 [staging|production] [remote_host]"
  exit 1
fi

# --- 检查本地 .env 文件 ---
if [ ! -f "$LOCAL_ENV_FILE" ]; then
  echo "错误: 找不到环境 '$ENV' 的配置文件: '$LOCAL_ENV_FILE'"
  exit 1
fi

# --- 加载根目录的 .env 文件以获取 VPC_IMAGE_REGISTRY 和 IMAGE_NAME ---
# 确保此脚本与 package.json 中的脚本具有相同的环境变量
if [ ! -f ".env" ]; then
    echo "错误: 根目录下的 .env 文件不存在。"
    exit 1
fi
export $(grep -v '^#' .env | xargs)

# --- 同步证书文件 ---
echo "正在检查远程证书文件..."
if [ -d "$LOCAL_CERT_DIR" ]; then
  # 确保远程目录存在
  ssh "$REMOTE_HOST" "mkdir -p $REMOTE_CERT_DIR"
  echo "正在同步证书文件到 ${REMOTE_HOST}:${REMOTE_CERT_DIR}"
  # 最好使用 rsync，但为了简单起见，并且与现有脚本保持一致，这里使用 scp
  scp -r "${LOCAL_CERT_DIR}/." "${REMOTE_HOST}:${REMOTE_CERT_DIR}/"
  echo "证书文件同步完成。"
else
  echo "警告: 本地证书目录 '$LOCAL_CERT_DIR' 未找到。如果启用了 HTTPS，部署可能会失败。"
fi

# --- 环境文件同步 ---
echo "正在检查远程环境文件..."
LOCAL_CHECKSUM=$(shasum -a 256 "$LOCAL_ENV_FILE" | awk '{print $1}')

REMOTE_CHECKSUM=$(ssh "$REMOTE_HOST" "
  mkdir -p $REMOTE_APP_DIR && \\
  if [ -f \\"$REMOTE_ENV_FILE_PATH\\" ]; then
    sha256sum \\"$REMOTE_ENV_FILE_PATH\\" | awk '{print \\\$1}'
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
if [ -z "$VPC_IMAGE_REGISTRY" ] || [ -z "$IMAGE_NAME" ]; then
  echo "错误: 根目录的 .env 文件中未设置 VPC_IMAGE_REGISTRY 和/或 IMAGE_NAME。"
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

FULL_IMAGE_NAME="${VPC_IMAGE_REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG}"

echo "使用镜像: $FULL_IMAGE_NAME"

ssh "$REMOTE_HOST" "
  set -e
  echo '正在拉取最新镜像...'
  docker pull $FULL_IMAGE_NAME

  echo '正在停止并删除旧容器...'
  (docker stop $CONTAINER_NAME || true) && (docker rm $CONTAINER_NAME || true)

  echo '正在启动新容器...'
  docker run -d \
    --restart always \
    --name $CONTAINER_NAME \
    -p 443:443 \
    --env-file $REMOTE_ENV_FILE_PATH \
    -v ${REMOTE_CERT_DIR}:/app/packages/car-management-api/.certificates:ro \
    $FULL_IMAGE_NAME

  echo '正在清理旧镜像...'
  docker image prune -f

  echo '部署成功！'
" 