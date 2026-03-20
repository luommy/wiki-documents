#!/bin/bash

# 批量上传 docs 目录下的所有图片
# 用法:
#   ./batch-upload-docs.sh              # 上传所有文档图片
#   ./batch-upload-docs.sh --dry-run    # 仅预览，不实际上传
#   ./batch-upload-docs.sh --no-cache   # 忽略缓存，重新上传
#   ./batch-upload-docs.sh docs/1-series # 上传指定目录

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 默认目标目录
TARGET_DIR="docs"
SCRIPT_DIR=".image-upload"

# 解析参数
DRY_RUN=""
NO_CACHE=""
FORCE=""

for arg in "$@"; do
  case $arg in
    --dry-run|-d) DRY_RUN="--dry-run" ;;
    --no-cache|-n) NO_CACHE="--no-cache" ;;
    --force|-f) FORCE="--force" ;;
    -h|--help)
      echo "用法: $0 [选项] [目录]"
      echo ""
      echo "选项:"
      echo "  --dry-run, -d    仅预览，不实际上传"
      echo "  --no-cache, -n   忽略缓存，重新上传"
      echo "  --force, -f      强制上传所有图片"
      echo ""
      echo "示例:"
      echo "  $0                                # 上传所有文档"
      echo "  $0 --dry-run                      # 预览"
      echo "  $0 docs/1-neoedge-ng4500-series   # 上传指定目录"
      exit 0
      ;;
    docs/*) TARGET_DIR="$arg" ;;
    *)
      echo -e "${RED}错误: 未知参数 '$arg'${NC}"
      exit 1
      ;;
  esac
done

# 检查上传脚本是否存在
UPLOAD_SCRIPT="$SCRIPT_DIR/upload-images.sh"
if [[ ! -f "$UPLOAD_SCRIPT" ]]; then
  echo -e "${RED}错误: 找不到上传脚本 $UPLOAD_SCRIPT${NC}"
  exit 1
fi

# 统计文件数量
TOTAL=$(find "$TARGET_DIR" -name "*.md" -type f | wc -l | tr -d ' ')

if [[ $TOTAL -eq 0 ]]; then
  echo -e "${YELLOW}未找到 Markdown 文件${NC}"
  exit 0
fi

echo -e "${BLUE}════════════════════════════════════════${NC}"
echo -e "${BLUE}批量上传文档图片${NC}"
echo -e "${BLUE}════════════════════════════════════════${NC}"
echo ""
echo -e "目标目录: ${GREEN}$TARGET_DIR${NC}"
echo -e "Markdown 文件数: ${GREEN}$TOTAL${NC}"
[[ -n "$DRY_RUN" ]] && echo -e "${YELLOW}模式: 预览模式${NC}"
[[ -n "$NO_CACHE" ]] && echo -e "${YELLOW}模式: 忽略缓存${NC}"
[[ -n "$FORCE" ]] && echo -e "${YELLOW}模式: 强制上传${NC}"
echo ""

# 处理每个文件
SUCCESS=0
FAILED=0
COUNT=0

while IFS= read -r file; do
  COUNT=$((COUNT + 1))
  printf "\r[%3d/%3d] 处理: %-60s" $COUNT $TOTAL "$(basename $file)"

  # 转换为绝对路径
  ABS_FILE="$(cd "$(dirname "$file")" && pwd)/$(basename "$file")"

  if (cd "$SCRIPT_DIR" && ./upload-images.sh "$ABS_FILE" $DRY_RUN $NO_CACHE $FORCE > /dev/null 2>&1); then
    SUCCESS=$((SUCCESS + 1))
  else
    FAILED=$((FAILED + 1))
    echo -e "\n${RED}✗ 失败: $file${NC}"
  fi
done < <(find "$TARGET_DIR" -name "*.md" -type f | sort)

# 输出结果
echo ""
echo ""
echo -e "${BLUE}════════════════════════════════════════${NC}"
echo -e "${BLUE}处理完成${NC}"
echo -e "${BLUE}════════════════════════════════════════${NC}"
echo ""
echo -e "总计: ${TOTAL} 个文件"
echo -e "${GREEN}✓ 成功: ${SUCCESS}${NC}"
[[ $FAILED -gt 0 ]] && echo -e "${RED}✗ 失败: ${FAILED}${NC}"
echo ""

[[ $FAILED -gt 0 ]] && exit 1