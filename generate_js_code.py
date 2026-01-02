import json

# Load cleaned data.js format files
with open('part2_datajs_clean.json', 'r', encoding='utf-8') as f:
    part2_data = json.load(f)

with open('part3_datajs_clean.json', 'r', encoding='utf-8') as f:
    part3_data = json.load(f)

# Convert to JavaScript format
def dict_to_js(data, indent=0):
    """Convert Python dict to JavaScript object string"""
    ind = "    " * indent
    if isinstance(data, dict):
        lines = ["{"]
        for key, value in data.items():
            js_value = dict_to_js(value, indent + 1)
            lines.append(f'{ind}    "{key}": {js_value},')
        lines.append(f'{ind}}}')
        return "\n".join(lines)
    elif isinstance(data, list):
        if not data:
            return "[]"
        lines = ["["]
        for item in data:
            js_item = dict_to_js(item, indent + 1)
            lines.append(f'{ind}    {js_item},')
        lines.append(f'{ind}]')
        return "\n".join(lines)
    elif isinstance(data, str):
        # Escape special characters
        escaped = data.replace('\\', '\\\\').replace('"', '\\"').replace('\n', '\\n')
        return f'"{escaped}"'
    elif data is None:
        return "null"
    else:
        return str(data)

# Generate JavaScript code for Part 2 and Part 3
part2_js = dict_to_js(part2_data, indent=2)
part3_js = dict_to_js(part3_data, indent=2)

# Save to separate files for manual integration
with open('part2_for_datajs.txt', 'w', encoding='utf-8') as f:
    f.write(",\n        " + part2_js)

with open('part3_for_datajs.txt', 'w', encoding='utf-8') as f:
    f.write(",\n        " + part3_js)

print("="*70)
print("JavaScript code generated!")
print("="*70)
print("Part 2 saved to: part2_for_datajs.txt")
print("Part 3 saved to: part3_for_datajs.txt")
print("\nTo integrate:")
print("1. Open data.js")
print("2. Find the closing of Part 1 (around line 412)")
print("3. Add comma after Part 1's closing brace")
print("4. Paste content from part2_for_datajs.txt")
print("5. Paste content from part3_for_datajs.txt")
print("6. Ensure proper closing of chapters array and appData object")
