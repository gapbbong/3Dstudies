import re

file_path = r'd:\App\3d Studies\data.js'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Find all question fields with multiline content
# Pattern: "question": "...\n...\n..."
# We need to replace actual newlines with \\n escape sequences

# This regex finds "question": "..." where ... can contain newlines
pattern = r'"question":\s*"([^"]*(?:\r?\n[^"]*)*)"'

def fix_newlines(match):
    question_text = match.group(1)
    # Replace actual newlines with escaped newlines
    fixed_text = question_text.replace('\r\n', '\\n').replace('\n', '\\n')
    return f'"question": "{fixed_text}"'

# Apply the fix
fixed_content = re.sub(pattern, fix_newlines, content)

# Write back
with open(file_path, 'w', encoding='utf-8') as f:
    f.write(fixed_content)

print("Fixed multiline strings in data.js")
print("Validating JavaScript syntax...")

# Try to validate with Node.js if available
import subprocess
try:
    result = subprocess.run(['node', '-c', file_path], capture_output=True, text=True)
    if result.returncode == 0:
        print("✅ JavaScript syntax is valid!")
    else:
        print(f"❌ Syntax error: {result.stderr}")
except FileNotFoundError:
    print("⚠️  Node.js not found, skipping validation")
