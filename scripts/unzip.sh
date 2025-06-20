#!/bin/bash
# 解压 env_backup.zip

set -e

# Go to project root
cd "$(dirname "$0")/.."

ZIP_FILE="env_backup.zip"

if [ ! -f "$ZIP_FILE" ]; then
  echo "错误: $ZIP_FILE 不存在。"
  exit 1
fi

echo "正在从 $ZIP_FILE 解压文件..."

# -n: never overwrite existing files
# -d .: extract files into the specified directory, which is project root
unzip -n "$ZIP_FILE" -d .

echo "解压完成。" 