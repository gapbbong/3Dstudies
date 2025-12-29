import re

# Read the file
with open('d:/App/3d Studies/data_practice.js', 'r', encoding='utf-8') as f:
    lines = f.readlines()

print("Processing data_practice.js...")

# Process line by line to preserve structure
new_lines = []
in_theory_content = False
theory_buffer = []

for i, line in enumerate(lines):
    # Check if this line contains theoryContent
    if '"theoryContent":' in line:
        in_theory_content = True
        # Extract the content part
        match = re.search(r'"theoryContent"\s*:\s*"(.+)"', line)
        if match:
            theory_text = match.group(1)
            
            # Clean the theory text
            # 1. Split by \n (the literal characters in the string)
            parts = theory_text.split('\\n')
            
            # 2. Clean each part
            cleaned_parts = []
            seen = set()
            
            for part in parts:
                part = part.strip()
                
                # Remove unwanted patterns
                part = re.sub(r'[①②③④]\s*\d+\s*', '', part)
                part = re.sub(r'(\d+\s+){4,}\d+', '', part)
                part = re.sub(r'E\s+\d+(\s+\d+)*', '', part)
                part = re.sub(r'정답.*', '', part)
                part = part.strip()
                
                # Skip empty or too short
                if not part or len(part) < 10:
                    continue
                
                # Skip duplicates
                if part in seen:
                    continue
                seen.add(part)
                
                # Ensure bullet
                if not part.startswith('-') and not part.startswith('•'):
                    part = '- ' + part
                
                cleaned_parts.append(part)
            
            # Join with actual \n for JavaScript
            cleaned_theory = '\\n\\n'.join(cleaned_parts)
            
            # Escape quotes
            cleaned_theory = cleaned_theory.replace('"', '\\"')
            
            # Reconstruct the line
            new_line = f'    "theoryContent": "{cleaned_theory}",\n'
            new_lines.append(new_line)
            in_theory_content = False
        else:
            new_lines.append(line)
    else:
        new_lines.append(line)

# Write back
with open('d:/App/3d Studies/data_practice.js', 'w', encoding='utf-8') as f:
    f.writelines(new_lines)

print("✅ Successfully cleaned theory content!")
print("✅ Removed \\n characters and added proper line breaks")
print("✅ Removed unwanted symbols and numbers")
print("✅ Added blank lines between bullet points")
