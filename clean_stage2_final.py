import re

# Read the file
with open('d:/App/3d Studies/data_practice.js', 'r', encoding='utf-8') as f:
    content = f.read()

print("Starting cleanup...")

# Simple approach: just replace the problematic patterns directly in the entire file
# 1. Replace \\n with actual newline in theory content
content = content.replace('\\\\n', '\n')

# 2. Remove answer number patterns
content = re.sub(r'[①②③④]\s*\d+\s*', '', content)

# 3. Remove number sequences like "56 57 58 59 60"
content = re.sub(r'(\d+\s+){4,}\d+', '', content)

# 4. Remove "E 423 43 44" patterns
content = re.sub(r'E\s+\d+(\s+\d+)+', '', content)

# 5. Remove "정답" lines
content = re.sub(r'정답\s+\d+.*?\n', '\n', content)

# Now clean up duplicate lines within theoryContent sections
def clean_duplicates_in_theory(match):
    prefix = match.group(1)
    theory_text = match.group(2)
    suffix = match.group(3)
    
    # Split into lines
    lines = theory_text.split('\n')
    cleaned_lines = []
    seen = set()
    
    for line in lines:
        line_stripped = line.strip()
        
        # Skip empty or very short
        if not line_stripped or len(line_stripped) < 10:
            continue
        
        # Skip duplicates
        if line_stripped in seen:
            continue
        seen.add(line_stripped)
        
        # Add bullet if needed
        if not line_stripped.startswith('-') and not line_stripped.startswith('•'):
            line_stripped = '- ' + line_stripped
        
        cleaned_lines.append(line_stripped)
    
    # Join back
    cleaned_text = '\n'.join(cleaned_lines)
    
    # Escape for JavaScript
    cleaned_text = cleaned_text.replace('\\', '\\\\').replace('"', '\\"').replace('\n', '\\n')
    
    return f'{prefix}"{cleaned_text}"{suffix}'

# Pattern to find theoryContent
pattern = r'("theoryContent"\s*:\s*)"([^"]*(?:\\.[^"]*)*)"(\s*,)'
content = re.sub(pattern, clean_duplicates_in_theory, content)

# Write back
with open('d:/App/3d Studies/data_practice.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ Successfully cleaned theory content!")
print("✅ Removed \\\\n, unwanted symbols, and duplicates")
print("✅ Added proper line breaks and bullet points")
