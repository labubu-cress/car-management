#!/bin/bash
# 将所有的 .env 以及 .env.* , 以及 .certificates/* , .ssh/* 打包到 zip ,  要保持目录结构

set -e

# Go to project root
cd "$(dirname "$0")/.."

ZIP_FILE="env_backup.zip"

echo "正在查找 .env, .env.*, .certificates, .ssh 文件..."

# Find .env and .env.* files, excluding node_modules and .git, and zip them
# The paths in the zip will be like ./packages/api/.env
files=$(find . -path '*/node_modules/*' -prune -o -path '*/.git/*' -prune -o \( -name ".env" -o -name ".env.*" -o -name ".certificates" -o -name ".ssh" \) -print)

if [ -z "$files" ]; then
  echo "没有找到任何要备份的文件。"
  exit 0
fi

echo "找到以下文件:"
echo "$files"
echo ""
echo "正在创建压缩包 $ZIP_FILE..."

# remove old zip file if it exists
rm -f "$ZIP_FILE"

echo "$files" | zip -r "$ZIP_FILE" -@

echo "成功创建 $ZIP_FILE"
