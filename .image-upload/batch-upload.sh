#!/bin/bash

# 批量上传文档图片 - 便捷入口
# 用法:
#   ./batch-upload.sh              # 上传所有文档
#   ./batch-upload.sh --dry-run    # 仅预览

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
exec "$SCRIPT_DIR/scripts/batch-upload-images.sh" "$@"