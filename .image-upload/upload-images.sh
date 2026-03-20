#!/bin/bash
# 图片上传脚本包装器

cd "$(dirname "$0")"
yarn upload-images "$@"
