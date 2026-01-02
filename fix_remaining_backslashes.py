import re

# Read the file
with open('d:/App/3d Studies/data_practice.js', 'r', encoding='utf-8') as f:
    content = f.read()

print("Fixing remaining \\\\\\\\n patterns...")

# Replace \\\\\\\\n with \\n\\n (quadruple backslash-n to double backslash-n-n)
content = content.replace('\\\\\\\\n', '\\n')

# Also clean up any remaining triple backslash patterns
content = content.replace('\\\\\\n', '\\n')

# Write back
with open('d:/App/3d Studies/data_practice.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ Fixed all remaining backslash-n patterns!")
print("✅ All theory content should now display with proper line breaks")
