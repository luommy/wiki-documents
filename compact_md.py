import re

file_path = r"e:\CamthinkCode\wiki-documents\docs\5-neoeyes-ne301-series\3-application-guide\6-pest-control-monitoring-in-chain-restaurants.md"

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Strip zero-width spaces and other invisible weirdness if any
content = content.replace('\u200b', '')

lines = content.split('\n')

# 2. Function to determine if a line is a "text line" (not a header, list item, code block fence, html tag, table, etc.)
def is_text_line(line):
    stripped = line.strip()
    if not stripped: return False
    if stripped.startswith('#'): return False
    if stripped.startswith('- '): return False
    if stripped.startswith('* '): return False
    if stripped.startswith('1. ') or re.match(r'^\d+\.', stripped): return False
    if stripped.startswith('```'): return False
    if stripped.startswith('<'): return False
    if stripped.startswith('!['): return False
    if stripped.startswith('>'): return False
    if stripped == "代码块": return False # Remove this artifact
    return True

# 3. Pre-processing: Remove "代码块" lines and excessive blank lines
cleaned_lines = []
in_code_block = False
last_line_was_blank = False

for line in lines:
    stripped = line.strip()
    
    # Handle code blocks: preserve everything inside
    if stripped.startswith('```'):
        in_code_block = not in_code_block
        cleaned_lines.append(line)
        last_line_was_blank = False
        continue
    
    if in_code_block:
        cleaned_lines.append(line)
        continue

    # Remove specific artifact
    if stripped == "代码块":
        continue

    if not stripped:
        if not last_line_was_blank:
            cleaned_lines.append("")
            last_line_was_blank = True
        continue
    else:
        cleaned_lines.append(line)
        last_line_was_blank = False


# 4. Merge Logic
# We will iterate through cleaned_lines and merge text paragraphs.
merged_lines = []
buffer = ""

for i, line in enumerate(cleaned_lines):
    # If in code block, just append (we need to track state again or rely on structure)
    # The cleaned_lines logic preserved code blocks but let's be careful.
    # It's easier to do a second pass where we just look at neighbors.
    pass

# Let's try a different approach: grouping
final_lines = []
in_code_block = False
i = 0
while i < len(cleaned_lines):
    line = cleaned_lines[i]
    stripped = line.strip()
    
    if stripped.startswith('```'):
        in_code_block = not in_code_block
        final_lines.append(line)
        i += 1
        continue
    
    if in_code_block:
        final_lines.append(line)
        i += 1
        continue

    # If it's a text line, check if we should merge with NEXT line
    # We explicitly look ahead.
    if is_text_line(line):
        current_text = line.rstrip() # keep leading indent if any, but strip trailing
        
        # Look ahead for loop
        while True:
            # Check if next line exists
            if i + 1 >= len(cleaned_lines):
                break
                
            next_l = cleaned_lines[i+1]
            next_stripped = next_l.strip()
            
            # If next line is empty, check the line AFTER that (p_next_l)
            if not next_stripped:
                if i + 2 >= len(cleaned_lines):
                    break
                p_next_l = cleaned_lines[i+2]
                
                # If p_next_l is also text, and current_text doesn't end with punctuation...
                # Sentence ending punctuation: . ? ! : " (english) or 。 ？ ！ ： ” (chinese)
                # But be careful with "..."
                if not is_text_line(p_next_l):
                    break
                    
                if not re.search(r'[.?!:。？！：”"]\s*$', current_text):
                     # Merge! Skip the blank line (i+1) and append (i+2)
                     current_text += " " + p_next_l.strip()
                     i += 2 # Skip next line and the one after
                     continue
                else:
                    break
            
            # If next line is immediately adjacent (no blank line)
            elif is_text_line(next_l):
                 # Always merge adjacent text lines unless bullet points etc (which is_text_line handles)
                 current_text += " " + next_stripped
                 i += 1
                 continue
            else:
                break
        
        final_lines.append(current_text)
        i += 1
    else:
        final_lines.append(line)
        i += 1

# 5. Post-processing: Compact huge gaps of images
# We might have <img ...> \n \n <img ...>
# The current cleaned_lines already reduced multiple blank lines to 1.
# Let's see if we can reduce <div ...>\n\n<div ...> to <div ...>\n<div ...>
# Actually, 1 blank line is fine.

print(f"Compacting {file_path}")
with open(file_path, 'w', encoding='utf-8') as f:
    f.write('\n'.join(final_lines))
