import re

# Read the file
with open('d:/App/3d Studies/data_practice.js', 'r', encoding='utf-8') as f:
    content = f.read()

print("Starting careful cleanup...")

# Function to clean a single theory content string
def clean_theory_text(text):
    # 1. Replace \\n with actual newline
    text = text.replace('\\\\n', '\n')
    
    # 2. Remove answer number patterns
    text = re.sub(r'[①②③④]\s*\d+\s*', '', text)
    
    # 3. Remove number sequences
    text = re.sub(r'(\d+\s+){4,}\d+', '', text)
    
    # 4. Remove "E 423" patterns
    text = re.sub(r'E\s+\d+(\s+\d+)*', '', text)
    
    # 5. Remove "정답" lines
    text = re.sub(r'정답.*', '', text)
    
    # 6. Split and clean
    lines = text.split('\n')
    cleaned = []
    seen = set()
    
    for line in lines:
        line = line.strip()
        
        # Skip empty or too short
        if not line or len(line) < 10:
            continue
        
        # Skip duplicates
        if line in seen:
            continue
        seen.add(line)
        
        # Ensure bullet point
        if not line.startswith('-') and not line.startswith('•'):
            line = '- ' + line
        
        cleaned.append(line)
    
    result = '\n'.join(cleaned)
    
    # Escape for JavaScript string (single pass)
    result = result.replace('\\', '\\\\')
    result = result.replace('"', '\\"')
    result = result.replace('\n', '\\n')
    
    return result

# Find and replace ONLY theoryContent, preserving everything else
# Use a more careful regex that captures the exact field
pattern = r'("theoryContent"\s*:\s*)"([^"]*(?:\\.[^"]*)*)"'

def replace_theory(match):
    prefix = match.group(1)  # "theoryContent": 
    original = match.group(2)  # the content
    
    # Clean it
    cleaned = clean_theory_text(original)
    
    # Return with proper formatting
    return f'{prefix}"{cleaned}"'

# Apply replacement
new_content = re.sub(pattern, replace_theory, content)

# Verify we didn't break the structure
if 'const practiceData' in new_content and '"chapters"' in new_content:
    # Write back
    with open('d:/App/3d Studies/data_practice.js', 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("✅ Successfully cleaned theory content!")
    print("✅ File structure preserved")
else:
    print("❌ ERROR: File structure was damaged, NOT saving")
    print("❌ Original file preserved")
