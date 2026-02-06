import re
import os

file_path = r"e:\CamthinkCode\wiki-documents\docs\5-neoeyes-ne301-series\3-application-guide\6-pest-control-monitoring-in-chain-restaurants.md"

with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_lines = []
# Add frontmatter
new_lines.append("---\n")
new_lines.append("sidebar_label: 连锁餐厅捕虫箱监测\n")
new_lines.append("title: 连锁餐厅捕虫箱监测\n")
new_lines.append("---\n\n")

# Track if we are inside a code block to avoid stripping numbers that might be valid code (though unlikely given the previous view)
in_code_block = False

for line in lines:
    stripped = line.strip()
    
    # Check for code block fences
    if stripped.startswith("```"):
        in_code_block = not in_code_block
        new_lines.append(line)
        continue
    
    # 1. Skip pure number lines (garbage) identifying page numbers/line numbers
    # Only skip if NOT in code block (safety check, though the garbage looked mostly outside)
    if not in_code_block and re.match(r'^\d+$', stripped):
        continue
        
    # 2. Fix H1 title
    if line.startswith("# 案例-连锁餐厅捕虫箱监测"):
        new_lines.append("# 连锁餐厅捕虫箱监测\n")
        continue
    
    # 3. Remove "案例-连锁餐厅捕虫箱监测" text line if it appears as plain text (sometimes duplicate title)
    if stripped == "案例-连锁餐厅捕虫箱监测" and not line.startswith("#"):
        continue

    # 4. Optimize Images
    # Match markdown images: ![alt](...static/img/...)
    img_match = re.search(r'!\[(.*?)\]\(.*?(static/img/.*)\)', line)
    if img_match:
        alt_text = img_match.group(1)
        full_suffix = img_match.group(2) # static/img/...
        # Convert static/img/... to /img/...
        # path is static/img/ne301/... -> we want /img/ne301/...
        # Removing "static" prefix
        src_path = "/" + full_suffix.replace('\\', '/').split('static/', 1)[1]
        
        new_img_tag = (
            f'<div style={{{{textAlign: "center"}}}}>\n'
            f'  <img src="{src_path}" alt="{alt_text}" '
            f'style={{{{maxWidth: "640px", width: "100%", border: "1px solid #eee", borderRadius: "8px"}}}} />\n'
            f'</div>\n'
        )
        new_lines.append("\n" + new_img_tag + "\n")
    else:
        new_lines.append(line)

print(f"Writing optimized content to {file_path}")
with open(file_path, 'w', encoding='utf-8') as f:
    f.writelines(new_lines)
