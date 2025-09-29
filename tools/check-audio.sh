#!/usr/bin/env bash

shopt -s globstar # 递归遍历子目录

for file in src-tauri/gen/android/app/src/main/assets/**/*.ogg; do
    echo -n "$file: "
    
    metadata=$(ffprobe -v quiet -show_entries format_tags:stream_tags -of default=noprint_wrappers=1 "$file")

    if [ -z "$metadata" ]; then
        echo -e "\033[32mno audio metadata tags found\033[0m"
    else
        # 如果不为空，则打印找到的元数据
        echo -e "\n$metadata"
    fi
done

echo -e "  \033[34mCheck completed\033[0m"
