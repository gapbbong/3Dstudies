import re

file_path = r'd:\App\3d Studies\data.js'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

def format_theory(match):
    text = match.group(1)
    # Remove existing excessive newlines to start clean
    text = re.sub(r'\n+', '\n', text).strip()
    
    # Add double newline before main sections (1. 2. 3.)
    text = re.sub(r'(?<!^)(\d+\.)', r'\n\n\1', text)
    
    # Add single newline before subsections (가. 나. 다.)
    text = re.sub(r'(?<!^)([가-하]\.)', r'\n\1', text)
    
    # Add single newline before bullet points (-)
    text = re.sub(r'(?<!^)(-\s)', r'\n\1', text)
    
    # Fix potential triple newlines
    text = re.sub(r'\n{3,}', '\n\n', text)
    
    return f': `{text}`'

# Apply theory formatting to Parts 4-8
# We look for "id": "part[4-8]"... "theoryContent": `...`
# Since regex lookbehind is fixed width, we'll iterate.

parts_to_format = ['part4', 'part5', 'part6', 'part7', 'part8']

for part in parts_to_format:
    # Regex to find the theoryContent block for the specific part
    # We assume the structure is standard: "id": "partX", ... "theoryContent": `...`
    # We capture the content inside backticks
    pattern = re.compile(r'("id":\s*"' + part + r'".*?"theoryContent":\s*)`([^`]*)`', re.DOTALL)
    content = pattern.sub(format_theory, content)

def format_question(match):
    q_text = match.group(1)
    
    # Check if there is a "Bogi" (Example text in quotes)
    # Pattern: Question ending with ? followed by ' or "
    # Or just ' or " appearing after ?
    
    # We want to insert \n\n before the quote if it follows a ?
    new_q_text = re.sub(r'\?(\s*)([\'"])', r'?\n\n\2', q_text)
    
    # If we made a change (meaning there is a Bogi), we might want to add space at the end too
    if new_q_text != q_text:
        # User asked for space before choices too.
        # Adding \n\n at the end of the string.
        # Check if it already ends with newline
        if not new_q_text.endswith('\n\n'):
             new_q_text += '\n\n'
    
    return f'"question": "{new_q_text}"'

# Apply question formatting
# We look for "question": "..."
# We need to be careful not to match other fields.
# The questions are simple strings, but might contain escaped quotes.
# We'll assume standard double quotes for the JSON value.
content = re.sub(r'"question":\s*"(.*?)"', format_question, content)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Formatting complete.")
