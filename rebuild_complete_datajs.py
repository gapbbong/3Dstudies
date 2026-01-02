import json
import re

# This script will rebuild the ENTIRE data.js from scratch with corrected parts

# Read the original data.js to preserve Part 0 and Part 1
with open('data_backup.js', 'r', encoding='utf-8') as f:
    original_content = f.read()

# Load all corrected parts
parts_data = {}

# Part 2 and 3 (corrected)
for part_num in [2, 3]:
    with open(f'part{part_num}_datajs_clean.json', 'r', encoding='utf-8') as f:
        parts_data[part_num] = json.load(f)

# Part 5-8
for part_num in [5, 6, 7, 8]:
    with open(f'part{part_num}_datajs_clean.json', 'r', encoding='utf-8') as f:
        parts_data[part_num] = json.load(f)

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

# Find Part 1 ending in original
lines = original_content.split('\n')
part1_end_line = None
for i in range(len(lines) - 1, -1, -1):
    if i >= 410 and lines[i].strip() == '}':
        part1_end_line = i
        break

print(f"Found Part 1 ending at line {part1_end_line + 1}")

# Build new data.js
new_lines = lines[:part1_end_line + 1]  # Part 0 and Part 1

# Add Part 2, 3, 5, 6, 7, 8
for part_num in [2, 3, 5, 6, 7, 8]:
    part_js = to_js_string(parts_data[part_num], indent=2)
    new_lines.append(",")
    new_lines.extend(["        " + line for line in part_js.split('\n')])

# Add closing
new_lines.extend(lines[part1_end_line + 1:])

# Write final data.js
with open('data_final_corrected.js', 'w', encoding='utf-8') as f:
    f.write('\n'.join(new_lines))

print("="*70)
print("SUCCESS! Created data_final_corrected.js")
print("="*70)
print("Part 0: 17 questions")
print("Part 1: 20 questions")
print(f"Part 2: {len(parts_data[2]['questions'])} questions (CORRECTED)")
print(f"Part 3: {len(parts_data[3]['questions'])} questions (CORRECTED)")
print(f"Part 5: {len(parts_data[5]['questions'])} questions")
print(f"Part 6: {len(parts_data[6]['questions'])} questions")
print(f"Part 7: {len(parts_data[7]['questions'])} questions")
print(f"Part 8: {len(parts_data[8]['questions'])} questions")

total = 17 + 20 + sum(len(parts_data[p]['questions']) for p in [2, 3, 5, 6, 7, 8])
print(f"\nTotal: {total} questions")
