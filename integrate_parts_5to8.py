import json
import re

# Read current data.js
with open('data.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Load Part 5-8 data
parts_to_add = {}
for part_num in [5, 6, 7, 8]:
    with open(f'part{part_num}_datajs_clean.json', 'r', encoding='utf-8') as f:
        parts_to_add[part_num] = json.load(f)

# Find where to insert (after Part 3's closing brace)
lines = content.split('\n')

# Find Part 3's ending (should be after Part 2)
# Look for the last closing brace before the final closing of chapters array
part3_end_line = None
for i in range(len(lines) - 1, -1, -1):
    if '        }' in lines[i] and i > 400:  # After Part 3
        part3_end_line = i
        break

if part3_end_line is None:
    print("ERROR: Could not find Part 3 ending")
    exit(1)

print(f"Found Part 3 ending at line {part3_end_line + 1}")

# Convert to JavaScript format
def to_js_string(obj, indent=2):
    """Convert Python object to JavaScript string"""
    ind = "    " * indent
    
    if isinstance(obj, dict):
        lines_out = ["{"]
        items = list(obj.items())
        for i, (key, value) in enumerate(items):
            comma = "," if i < len(items) - 1 else ""
            val_str = to_js_string(value, indent + 1)
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

# Generate JavaScript for Part 5-8
parts_js = []
for part_num in [5, 6, 7, 8]:
    part_js = to_js_string(parts_to_add[part_num], indent=2)
    parts_js.append(part_js)

# Insert into lines
new_lines = lines[:part3_end_line + 1]  # Up to and including Part 3's closing brace

# Add Part 5-8
for part_js in parts_js:
    new_lines.append(",")  # Add comma
    new_lines.extend(["        " + line for line in part_js.split('\n')])

new_lines.extend(lines[part3_end_line + 1:])  # Rest of the file

# Write new data.js
with open('data_with_5to8.js', 'w', encoding='utf-8') as f:
    f.write('\n'.join(new_lines))

print("="*70)
print("SUCCESS!")
print("="*70)
print("Created data_with_5to8.js with all parts integrated")
print("Part 0: 17 questions")
print("Part 1: 20 questions")
print("Part 2: 32 questions")
print("Part 3: 17 questions")
print(f"Part 5: {len(parts_to_add[5]['questions'])} questions (NEW)")
print(f"Part 6: {len(parts_to_add[6]['questions'])} questions (NEW)")
print(f"Part 7: {len(parts_to_add[7]['questions'])} questions (NEW)")
print(f"Part 8: {len(parts_to_add[8]['questions'])} questions (NEW)")

total = 17 + 20 + 32 + 17 + sum(len(parts_to_add[p]['questions']) for p in [5,6,7,8])
print(f"\nTotal: {total} questions")
print("\nVerifying JavaScript syntax...")
