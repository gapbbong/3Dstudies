import re
import json

# Read file
with open('d:/App/3d Studies/data_practice.js', 'r', encoding='utf-8') as f:
    content = f.read()

print("Deep cleaning theory content...")

def deep_clean_theory(text):
    """Thoroughly clean theory content"""
    
    # Step 1: Split by \\n\\n to get individual items
    items = text.split('\\n\\n')
    
    cleaned_items = []
    seen = set()
    
    for item in items:
        # Remove \\n within the item (join broken lines)
        item = item.replace('\\n', ' ')
        
        # Clean up the item
        item = item.strip()
        
        # Remove all number/symbol patterns
        item = re.sub(r'[①②③④⑤⑥⑦⑧⑨⑩]\s*', '', item)  # Remove circled numbers
        item = re.sub(r'^\d+\s+', '', item)  # Remove leading numbers
        item = re.sub(r'\s+\d+\s+\d+\s+\d+\s+\d+', '', item)  # Remove number sequences
        item = re.sub(r'E\s+\d+(\s+\d+)*', '', item)  # Remove "E 423 43"
        item = re.sub(r'정답.*', '', item)  # Remove "정답..."
        item = re.sub(r'I\s+', '', item)  # Remove standalone "I"
        
        # Fix spacing issues
        item = re.sub(r'\s+', ' ', item)  # Multiple spaces to single
        item = item.strip()
        
        # Skip if too short or empty
        if not item or len(item) < 15:
            continue
        
        # Skip duplicates (normalize for comparison)
        normalized = re.sub(r'[^\w가-힣]', '', item)
        if normalized in seen:
            continue
        seen.add(normalized)
        
        # Ensure bullet point
        if not item.startswith('-') and not item.startswith('•'):
            item = '- ' + item
        
        # Clean up any remaining issues
        item = item.replace('  ', ' ')  # Double spaces
        item = item.replace('- -', '-')  # Double dashes
        
        cleaned_items.append(item)
    
    # Join with double newline for readability
    return '\\n\\n'.join(cleaned_items)

# Process each theoryContent
def replace_theory(match):
    prefix = match.group(1)
    original = match.group(2)
    
    cleaned = deep_clean_theory(original)
    
    # Escape for JavaScript
    cleaned = cleaned.replace('\\', '\\\\')
    cleaned = cleaned.replace('"', '\\"')
    
    return f'{prefix}"{cleaned}"'

# Pattern to match theoryContent
pattern = r'("theoryContent"\s*:\s*)"([^"]*(?:\\.[^"]*)*)"'

new_content = re.sub(pattern, replace_theory, content)

# Verify structure
if '"chapters"' in new_content and 'const practiceData' in new_content:
    with open('d:/App/3d Studies/data_practice.js', 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("✅ Deep cleaning completed!")
    print("✅ Removed all symbols and numbers")
    print("✅ Joined broken sentences")
    print("✅ Removed duplicates")
    print("✅ Added proper spacing")
else:
    print("❌ ERROR: Structure damaged, not saving")
