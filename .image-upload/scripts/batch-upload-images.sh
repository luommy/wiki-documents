#!/bin/bash

# 批量上传文档图片脚本
# 用法:
#   ./batch-upload-images.sh              # 上传所有文档
#   ./batch-upload-images.sh --dry-run    # 仅预览，不实际上传
#   ./batch-upload-images.sh --no-cache   # 强制重新上传
#   ./batch-upload-images.sh docs/1-series  # 上传指定目录

set -e  # 遇到错误立即退出

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 默认参数
DRY_RUN=""
NO_CACHE=""
FORCE=""
TARGET_DIR="docs"

# 解析命令行参数
while [[ $# -gt 0 ]]; do
  case $1 in
    --dry-run|-d)
      DRY_RUN="--dry-run"
      shift
      ;;
    --no-cache|-n)
      NO_CACHE="--no-cache"
      shift
      ;;
    --force|-f)
      FORCE="--force"
      shift
      ;;
    -h|--help)
      echo "用法: $0 [选项] [目录]"
      echo ""
      echo "选项:"
      echo "  --dry-run, -d      仅预览要上传的文件，不实际上传"
      echo "  --no-cache, -n     忽略缓存，强制重新上传"
      echo "  --force, -f        强制上传所有图片（包括已存在的）"
      echo "  -h, --help         显示此帮助信息"
      echo ""
      echo "示例:"
      echo "  $0                                    # 上传所有文档"
      echo "  $0 --dry-run                          # 预览所有文档的上传计划"
      echo "  $0 docs/1-neoedge-ng4500-series       # 上传指定目录"
      echo "  $0 --no-cache docs/                   # 强制重新上传所有图片"
      exit 0
      ;;
    *)
      # 如果是目录参数
      if [[ -d "$1" ]] || [[ "$1" == docs* ]]; then
        TARGET_DIR="$1"
      else
        echo -e "${RED}错误: 未知参数 '$1'${NC}"
        exit 1
      fi
      shift
      ;;
  esac
done

# 检查 upload-images.sh 是否存在
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
UPLOAD_SCRIPT="$SCRIPT_DIR/upload-images.sh"

if [[ ! -f "$UPLOAD_SCRIPT" ]]; then
  echo -e "${RED}错误: 找不到上传脚本 $UPLOAD_SCRIPT${NC}"
  exit 1
fi

# 检查目标目录是否存在
if [[ ! -d "$TARGET_DIR" ]]; then
  echo -e "${RED}错误: 目录不存在: $TARGET_DIR${NC}"
  exit 1
fi

# 统计信息
TOTAL_FILES=0
SUCCESS_FILES=0
FAILED_FILES=0
SKIPPED_FILES=0

# 创建临时文件存储文件列表
TEMP_FILE=$(mktemp)
trap "rm -f $TEMP_FILE" EXIT

# 查找所有 markdown 文件
echo -e "${BLUE}正在扫描目录: $TARGET_DIR${NC}"
echo ""

find "$TARGET_DIR" -name "*.md" -type f | sort > "$TEMP_FILE"
TOTAL_FILES=$(wc -l < "$TEMP_FILE")

if [[ $TOTAL_FILES -eq 0 ]]; then
  echo -e "${YELLOW}未找到任何 Markdown 文件${NC}"
  exit 0
fi

echo -e "${BLUE}找到 ${TOTAL_FILES} 个 Markdown 文件${NC}"
echo ""

# 显示参数信息
if [[ -n "$DRY_RUN" ]]; then
  echo -e "${YELLOW}模式: 预览模式 (--dry-run)${NC}"
fi
if [[ -n "$NO_CACHE" ]]; then
  echo -e "${YELLOW}模式: 忽略缓存 (--no-cache)${NC}"
fi
if [[ -n "$FORCE" ]]; then
  echo -e "${YELLOW}模式: 强制上传 (--force)${NC}"
fi
echo ""

# 进度条函数
show_progress() {
  local current=$1
  local total=$2
  local percent=$((current * 100 / total))
  local filled=$((percent / 2))
  local empty=$((50 - filled))

  printf "\r进度: ["
  printf "%0.s=" $(seq 1 $filled)
  printf "%0.s " $(seq 1 $empty)
  printf "] %3d%% (%d/%d)" $percent $current $total
}

echo -e "${GREEN}开始批量上传...${NC}"
echo ""

# 处理每个文件
CURRENT=0
while IFS= read -r md_file; do
  CURRENT=$((CURRENT + 1))

  # 显示进度
  show_progress $CURRENT $TOTAL_FILES

  # 执行上传
  if "$UPLOAD_SCRIPT" "$md_file" $DRY_RUN $NO_CACHE $FORCE > /dev/null 2>&1; then
    SUCCESS_FILES=$((SUCCESS_FILES + 1))
  else
    FAILED_FILES=$((FAILED_FILES + 1))
    echo -e "\n${RED}失败: $md_file${NC}"
  fi
done < "$TEMP_FILE"

# 完成提示
echo ""
echo ""
echo -e "${BLUE}════════════════════════════════════════${NC}"
echo -e "${BLUE}批量上传完成${NC}"
echo -e "${BLUE}════════════════════════════════════════${NC}"
echo ""
echo -e "总计文件: ${TOTAL_FILES}"
echo -e "${GREEN}成功: ${SUCCESS_FILES}${NC}"
if [[ $FAILED_FILES -gt 0 ]]; then
  echo -e "${RED}失败: ${FAILED_FILES}${NC}"
fi
echo ""

# 如果有失败，返回非零退出码
if [[ $FAILED_FILES -gt 0 ]]; then
  exit 1
fi