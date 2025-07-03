#!/bin/bash
# 检查 ts, tsx 超过 200 行的文件，并输出相关信息

echo "正在检查超过 200 行的 ts/tsx 文件..."

find . -type f \( -name "*.ts" -o -name "*.tsx" \) \
-not -path "*/node_modules/*" \
-not -path "*/dist/*" \
-not -path "*/.turbo/*" \
-not -path "*/tmp/*" \
-not -path "*/migrations/*" \
-print0 | while IFS= read -r -d $'\0' file; do
    lines=$(wc -l < "$file" | tr -d ' ')
    if [ "$lines" -gt 200 ]; then
        echo "文件: $file, 行数: $lines"
    fi
done

echo "检查完成."