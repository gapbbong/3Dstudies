import json
import re

# Read current data.js
with open('data.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Extract the appData object
# Find the chapters array
match = re.search(r'const appData = ({.*});', content, re.DOTALL)
if not match:
    print("ERROR: Could not find appData in data.js")
    exit(1)

# Parse the JavaScript object (convert to JSON-like format)
js_obj = match.group(1)

# Load Part 2 and Part 3 data
with open('part2_datajs_clean.json', 'r', encoding='utf-8') as f:
    part2 = json.load(f)

with open('part3_datajs_clean.json', 'r', encoding='utf-8') as f:
    part3 = json.load(f)

# Read the original data.js and parse it properly
# We'll rebuild it with Part 2 and Part 3 added

# For simplicity, let's create a new data.js with all parts
# Load existing Part 0 and Part 1 from data.js

# Actually, let's use a simpler approach: read the file, find where to insert, and insert

# Find the closing of Part 1 (last } before the closing of chapters array)
# The structure is:
# const appData = {
#     "chapters": [
#         { ... Part 0 ... },
#         { ... Part 1 ... }
#     ]
# };

# We need to add comma after Part 1 and insert Part 2 and Part 3

# Find the position to insert (after Part 1's closing brace)
# Look for the pattern: ]\n        }\n    ]\n};

# Let's find the second-to-last occurrence of "        }\n"
lines = content.split('\n')

# Find where Part 1 ends (look for the closing of its questions array and then its closing brace)
# Part 1 ends around line 412

# Strategy: Find line 412 (closing of Part 1's questions array)
# Then find the next "        }" which is Part 1's closing brace
# Insert Part 2 and Part 3 after that

part1_end_line = None
for i, line in enumerate(lines):
    if i >= 410 and line.strip() == '}':  # Around line 413
        part1_end_line = i
        break

if part1_end_line is None:
    print("ERROR: Could not find Part 1 ending")
    exit(1)

print(f"Found Part 1 ending at line {part1_end_line + 1}")

# Convert Part 2 and Part 3 to JavaScript format
def to_js_string(obj, indent=2):
    """Convert Python object to JavaScript string"""
    ind = "    " * indent
    
    if isinstance(obj, dict):
        lines_out = ["{"]
        items = list(obj.items())
        for i, (key, value) in enumerate(items):
            comma = "," if i < len(items) - 1 else ""
            val_str = to_js_string(value, indent + 1)
            # Handle multiline values
            if '\n' in val_str:
                lines_out.append(f'{ind}    "{key}": {val_str}{comma}')
            else:
                lines_out.append(f'{ind}    "{key}": {val_str}{comma}')
        lines_out.append(f'{ind}}}')
        return '\n'.join(lines_out)
    
    elif isinstance(obj, list):
        if not obj:
            return "[]"
        lines_out = ["["]
        for i, item in enumerate(obj):
            comma = "," if i < len(obj) - 1 else ""
            item_str = to_js_string(item, indent + 1)
            lines_out.append(f'{ind}    {item_str}{comma}')
        lines_out.append(f'{ind}]')
        return '\n'.join(lines_out)
    
    elif isinstance(obj, str):
        # Use template literals for multiline strings
        if '\n' in obj:
            escaped = obj.replace('`', '\\`').replace('${', '\\${')
            return f'`{escaped}`'
        else:
            escaped = obj.replace('\\', '\\\\').replace('"', '\\"')
            return f'"{escaped}"'
    
    elif obj is None:
        return "null"
    
    else:
        return json.dumps(obj)

# Generate JavaScript for Part 2 and Part 3
part2_js = to_js_string(part2, indent=2)
part3_js = to_js_string(part3, indent=2)

# Insert into lines
new_lines = lines[:part1_end_line + 1]  # Up to and including Part 1's closing brace
new_lines.append(",")  # Add comma after Part 1
new_lines.extend(["        " + line for line in part2_js.split('\n')])  # Add Part 2
new_lines.append(",")  # Add comma after Part 2
new_lines.extend(["        " + line for line in part3_js.split('\n')])  # Add Part 3
new_lines.extend(lines[part1_end_line + 1:])  # Rest of the file

# Write new data.js
with open('data_new.js', 'w', encoding='utf-8') as f:
    f.write('\n'.join(new_lines))

print("="*70)
print("SUCCESS!")
print("="*70)
print("Created data_new.js with all parts integrated")
print("Part 0: 17 questions (existing)")
print("Part 1: 20 questions (existing)")
print(f"Part 2: {len(part2['questions'])} questions (NEW)")
print(f"Part 3: {len(part3['questions'])} questions (NEW)")
print(f"Total: {17 + 20 + len(part2['questions']) + len(part3['questions'])} questions")
print("\nPlease review data_new.js and rename to data.js if correct")
