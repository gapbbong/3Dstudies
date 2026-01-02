import re

# Read the file
with open('d:/App/3d Studies/data_practice.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Function to clean theory content
def clean_theory(text):
    if not text:
        return text
    
    # 1. Replace literal \\n with actual newlines
    text = text.replace('\\\\n', '\n')
    
    # 2. Remove answer numbers like "② 56 ② 57 ④ 58 ① 59 ② 60 ③"
    text = re.sub(r'[①②③④]\s*\d+\s*', '', text)
    
    # 3. Remove standalone number sequences
    text = re.sub(r'\s+\d+\s+\d+\s+\d+\s+\d+\s+\d+\s+\d+\s*', ' ', text)
    
    # 4. Remove "E 423 43 44 45" type patterns
    text = re.sub(r'E\s+\d+(\s+\d+)+', '', text)
    
    # 5. Remove patterns like "정답 01 2 02 3 032 04"
    text = re.sub(r'정답\s+\d+\s+\d+(\s+\d+\s+\d+)*', '', text)
    
    # 6. Split into sentences and remove duplicates
    sentences = []
    seen = set()
    
    for line in text.split('\n'):
        line = line.strip()
        if not line or len(line) < 10:  # Skip empty or very short lines
            continue
        
        # Normalize for duplicate detection
        normalized = re.sub(r'\s+', ' ', line).strip()
        if normalized in seen:
            continue
        seen.add(normalized)
        
        # Add bullet point if not present
        if not line.startswith('-') and not line.startswith('•'):
            line = '- ' + line
        
        sentences.append(line)
    
    return '\n'.join(sentences)

# Find and replace all theoryContent fields
def replace_theory_content(match):
    field_name = match.group(1)
    content_value = match.group(2)
    
    # Clean the content
    cleaned = clean_theory(content_value)
    
    # Escape for JavaScript string
    cleaned = cleaned.replace('\\', '\\\\').replace('"', '\\"').replace('\n', '\\n')
    
    return f'"{field_name}": "{cleaned}"'

# Replace all theoryContent fields
pattern = r'"(theoryContent)"\s*:\s*"([^"]*(?:\\.[^"]*)*)"'
new_content = re.sub(pattern, replace_theory_content, content)

# Write back
with open('d:/App/3d Studies/data_practice.js', 'w', encoding='utf-8') as f:
    f.write(new_content)

print("✅ Successfully cleaned all theory content!")
print("✅ Removed unwanted symbols, numbers, and duplicates")
print("✅ Added proper line breaks for better readability")
