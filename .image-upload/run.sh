#!/bin/bash

# 图片上传工具便捷执行脚本
# 从项目根目录运行此脚本,自动切换到 .image-upload 目录并执行上传工具

# 切换到 .image-upload 目录
cd "$(dirname "$0")" || exit 1

# 执行 upload-images 脚本,传递所有参数
yarn upload-images "$@"
