import re

file_path = r"e:\CamthinkCode\wiki-documents\docs\5-neoeyes-ne301-series\3-application-guide\6-pest-control-monitoring-in-chain-restaurants.md"

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

lines = content.split('\n')
new_lines = []

# Header images buffer
header_images = []
header_processed = False

# Regex for finding images in the format we just created: <div ... <img src="..." ... /> </div>
img_pattern = re.compile(r'<div.*?<img src="(.*?)" alt="(.*?)".*?/>.*?</div>', re.DOTALL)

# Standard style for body images
body_img_style = 'style={{display: "block", margin: "20px auto", maxWidth: "80%", borderRadius: "8px", boxShadow: "0 4px 8px rgba(0,0,0,0.1)"}}'

# Header container style
header_container_style = "<div style={{display: 'flex', gap: '10px', justifyContent: 'center', margin: '20px 0'}}>"
header_img_style = "style={{width: '48%', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)'}}"

iterator = iter(lines)
for line in iterator:
    # 1. Convert headers
    # Matches "1. Preface", "3. Configuration ", etc.
    if re.match(r'^\d+\.\s+.*?$', line.strip()):
        new_lines.append("## " + line.strip() + "\n")
        continue
    # Matches "3.1 Install...", "3.2 Configure..."
    if re.match(r'^\d+\.\d+\s+.*?$', line.strip()):
        new_lines.append("### " + line.strip() + "\n")
        continue
        
    # 2. Process Images
    # We need to detect if multiple lines form our image div block
    if line.strip().startswith('<div style={{textAlign: "center"}}>'):
        # This is likely start of an image block
        # Read next few lines to get the full block
        block = line
        while not block.strip().endswith('</div>'):
            try:
                next_line = next(iterator)
                block += "\n" + next_line
            except StopIteration:
                break
        
        # Extract src and alt
        match = img_pattern.search(block)
        if match:
            src = match.group(1)
            alt = match.group(2)
            
            # Special handling for first two images -> Header
            if not header_processed and len(header_images) < 2:
                header_images.append({'src': src, 'alt': alt})
                if len(header_images) == 2:
                    # Output the header block
                    new_lines.append(header_container_style)
                    new_lines.append(f'  <img src="{header_images[0]["src"]}" alt="{header_images[0]["alt"]}" {header_img_style} />')
                    new_lines.append(f'  <img src="{header_images[1]["src"]}" alt="{header_images[1]["alt"]}" {header_img_style} />')
                    new_lines.append("</div>\n")
                    header_processed = True
            else:
                # Body image
                new_img = f'<img src="{src}" alt="{alt}" {body_img_style} />'
                new_lines.append(new_img + "\n")
        else:
            # Fallback if regex fails, keep original block
            new_lines.append(block)
    else:
        new_lines.append(line)

# Write back
print(f"Standardizing {file_path}")
with open(file_path, 'w', encoding='utf-8') as f:
    f.write('\n'.join(new_lines))
