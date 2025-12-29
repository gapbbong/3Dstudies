import re

# Read the file
with open('d:/App/3d Studies/data_practice.js', 'r', encoding='utf-8') as f:
    content = f.read()

print("Starting cleanup...")

# Function to clean theory content
def clean_theory(text):
    # 1. Replace \\n with actual newline
    text = text.replace('\\\\n', '\n')
    
    # 2. Remove answer number patterns like "② 56 ② 57"
    text = re.sub(r'[①②③④]\s*\d+\s*', '', text)
    text = re.sub(r'[①②③④]\s*', '', text)
    
    # 3. Remove number sequences
    text = re.sub(r'\s+\d+\s+\d+\s+\d+\s+\d+', '', text)
    
    # 4. Remove "E 423 43 44" patterns
    text = re.sub(r'E\s+\d+(\s+\d+)+', '', text)
    
    # 5. Remove "정답" patterns
    text = re.sub(r'정답\s+\d+.*', '', text)
    
    # 6. Split by newlines and clean
    lines = text.split('\n')
    cleaned_lines = []
    seen = set()
    
    for line in lines:
        line = line.strip()
        
        # Skip empty or very short lines
        if not line or len(line) < 10:
            continue
        
        # Skip if duplicate
        if line in seen:
            continue
        seen.add(line)
        
        # Add bullet if needed
        if not line.startswith('-') and not line.startswith('•'):
            line = '- ' + line
        
        cleaned_lines.append(line)
    
    return '\n'.join(cleaned_lines)

# Find and replace theoryContent
count = 0
def replace_match(match):
    global count
    original = match.group(2)
    cleaned = clean_theory(original)
    count += 1
    
    # Properly escape for JavaScript string
    cleaned = cleaned.replace('\\', '\\\\')
    cleaned = cleaned.replace('"', '\\"')
    cleaned = cleaned.replace('\n', '\\n')
    
    return f'"theoryContent": "{cleaned}"'

# Pattern to match theoryContent fields
pattern = r'"theoryContent"\s*:\s*"((?:[^"\\\\]|\\\\.)*)?"'

new_content = re.sub(pattern, replace_match, content)

# Write back
with open('d:/App/3d Studies/data_practice.js', 'w', encoding='utf-8') as f:
    f.write(new_content)

print(f"✅ Cleaned {count} theory content sections!")
print("✅ Removed \\\\n, unwanted symbols, and duplicates")
print("✅ Added proper line breaks")
