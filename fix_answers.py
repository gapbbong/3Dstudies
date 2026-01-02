import re

# Read the file
with open('d:/App/3D studies/data_practice.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Pattern to find "answer": "" followed by explanation and full_block with answer
pattern = r'("answer":\s*""),\s*("explanation".*?)"full_block":\s*"({[^}]*\\"answer\\":\s*(\d+)[^}]*})'

fixed_count = 0

def replace_answer(match):
    global fixed_count
    answer_field = match.group(1)  # "answer": ""
    explanation_part = match.group(2)  # explanation field
    full_block_start = match.group(3)  # full_block content
    answer_num = match.group(4)  # the answer number from full_block
    
    # Replace empty answer with the number from full_block
    new_answer = f'"answer": "{answer_num}"'
    fixed_count += 1
    
    return f'{new_answer}, {explanation_part}"full_block": "{full_block_start}'

# Apply the replacement
new_content = re.sub(pattern, replace_answer, content, flags=re.DOTALL)

print(f"Total questions fixed: {fixed_count}")

# Write back
with open('d:/App/3D studies/data_practice.js', 'w', encoding='utf-8') as f:
    f.write(new_content)

print("File updated successfully!")
