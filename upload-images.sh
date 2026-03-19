#!/bin/bash

# Wiki 图片上传工具的便捷包装脚本
# 用法: ./upload-images.sh docs/your-document.md [options]

set -e

# 颜色定义
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 显示帮助信息
show_help() {
    echo -e "${BLUE}Wiki 图片上传工具${NC}"
    echo ""
    echo "用法:"
    echo "  ./upload-images.sh <file|directory> [options]"
    echo ""
    echo "示例:"
    echo "  ./upload-images.sh docs/guide.md"
    echo "  ./upload-images.sh docs/ --dry-run"
    echo "  ./upload-images.sh docs/guide.md --force"
    echo ""
    echo "选项:"
    echo "  --dry-run       预览模式，仅扫描不上传"
    echo "  --force         强制上传，忽略缓存"
    echo "  --no-cache      禁用缓存"
    echo "  --help, -h      显示此帮助信息"
    echo ""
    echo "首次使用："
    echo -e "  1. ${GREEN}cd .image-upload${NC}"
    echo -e "  2. ${GREEN}cp .env.example .env${NC}"
    echo -e "  3. ${GREEN}编辑 .env 文件，填写 FILE_BROWSER_USERNAME 和 FILE_BROWSER_PASSWORD${NC}"
    echo -e "  4. ${GREEN}yarn install${NC}"
    echo ""
    exit 0
}

# 检查参数
if [ $# -eq 0 ] || [ "$1" == "--help" ] || [ "$1" == "-h" ]; then
    show_help
fi

# 检查 .image-upload 目录是否存在
if [ ! -d ".image-upload" ]; then
    echo -e "${RED}错误: .image-upload 目录不存在${NC}"
    echo "请确保在 wiki-documents 根目录运行此脚本"
    exit 1
fi

# 检查 .env 文件是否存在
if [ ! -f ".image-upload/.env" ]; then
    echo -e "${RED}错误: .env 文件不存在${NC}"
    echo ""
    echo "首次使用请按以下步骤配置："
    echo -e "  1. ${GREEN}cd .image-upload${NC}"
    echo -e "  2. ${GREEN}cp .env.example .env${NC}"
    echo -e "  3. ${GREEN}编辑 .env 文件，填写真实的认证信息${NC}"
    echo -e "  4. ${GREEN}cd ..${NC}"
    echo ""
    exit 1
fi

# 检查 node_modules 是否存在
if [ ! -d ".image-upload/node_modules" ]; then
    echo -e "${BLUE}→ 首次运行，正在安装依赖...${NC}"
    cd .image-upload && yarn install && cd ..
    echo ""
fi

# 获取脚本所在目录的绝对路径
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# 转换输入路径为绝对路径（如果不是选项参数）
INPUT_PATH=""
OPTIONS=()

for arg in "$@"; do
    if [[ "$arg" == --* ]]; then
        # 是选项参数
        OPTIONS+=("$arg")
    elif [ -z "$INPUT_PATH" ]; then
        # 是第一个非选项参数，即输入路径
        if [[ "$arg" == /* ]]; then
            # 已经是绝对路径
            INPUT_PATH="$arg"
        else
            # 转换为绝对路径
            INPUT_PATH="$(cd "$(dirname "$arg")" 2>/dev/null && pwd)/$(basename "$arg")"
        fi
    else
        # 其他参数
        OPTIONS+=("$arg")
    fi
done

# 运行上传工具
cd "$SCRIPT_DIR/.image-upload"
node scripts/upload-images.js "$INPUT_PATH" "${OPTIONS[@]}"
exit_code=$?
cd "$SCRIPT_DIR"

exit $exit_code
