import re
import json

# Read file
with open('d:/App/3d Studies/data_practice.js', 'r', encoding='utf-8') as f:
    content = f.read()

print("Analyzing theoryContent patterns...")

# First, let's understand what we have
sample = content[content.find('"theoryContent"'):content.find('"theoryContent"')+500]
print("Sample:", repr(sample[:200]))

# Count patterns
single_n = content.count('\\n')
double_n = content.count('\\\\n')
print(f"Found \\n: {single_n}")
print(f"Found \\\\n: {double_n}")

def clean_theory_carefully(text):
    """Clean theory content step by step"""
    
    # Step 1: Handle both \\n and \\\\n
    # In the file, \\n is the actual newline escape in JavaScript string
    # We DON'T want to replace it in Python, we want it to STAY as \\n for JavaScript
    # But we need to make it render as actual newline in browser
    
    # The issue: text already has \\n which JavaScript will interpret
    # We need to keep it that way
    
    # Step 2: Remove unwanted patterns
    text = re.sub(r'[①②③④]\s*\d+\s*', '', text)  # Remove ①56 ②57 etc
    text = re.sub(r'(\d+\s+){4,}\d+', '', text)  # Remove "56 57 58 59 60"
    text = re.sub(r'E\s+\d+(\s+\d+)*', '', text)  # Remove "E 423 43 44"
    text = re.sub(r'정답.*', '', text)  # Remove "정답..." lines
    
    # Step 3: Split by \\n to process lines
    lines = text.split('\\n')
    
    cleaned_lines = []
    seen = set()
    
    for line in lines:
        # Clean the line
        line = line.strip()
        
        # Skip empty or very short
        if not line or len(line) < 10:
            continue
        
        # Skip duplicates
        if line in seen:
            continue
        seen.add(line)
        
        # Ensure bullet point
        if not line.startswith('-') and not line.startswith('•'):
            line = '- ' + line
        
        cleaned_lines.append(line)
    
    # Join with \\n (which will be interpreted by JavaScript as newline)
    result = '\\n\\n'.join(cleaned_lines)  # Add blank line between items
    
    return result

# Process the file
def replace_theory(match):
    prefix = match.group(1)
    original_content = match.group(2)
    
    # Clean it
    cleaned = clean_theory_carefully(original_content)
    
    # Return with proper escaping for JavaScript string
    # We need to escape quotes and backslashes
    cleaned = cleaned.replace('\\\\', '\\\\\\\\')  # Escape backslashes
    cleaned = cleaned.replace('"', '\\\\"')  # Escape quotes
    
    return f'{prefix}"{cleaned}"'

# Pattern to match theoryContent
pattern = r'("theoryContent"\s*:\s*)"([^"]*(?:\\.[^"]*)*)"'

new_content = re.sub(pattern, replace_theory, content)

# Verify structure
if '"chapters"' in new_content and 'const practiceData' in new_content:
    with open('d:/App/3d Studies/data_practice.js', 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("✅ Successfully cleaned theory content!")
    print("✅ Added blank lines between bullet points")
    print("✅ File structure preserved")
else:
    print("❌ ERROR: Structure damaged, not saving")
