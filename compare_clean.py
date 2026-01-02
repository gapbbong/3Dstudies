import json

# Compare before and after
with open('part2_questions.json', 'r', encoding='utf-8') as f:
    original = json.load(f)

with open('part2_questions_clean.json', 'r', encoding='utf-8') as f:
    cleaned = json.load(f)

print("=== Comparison of cleaned questions ===\n")

# Show first 5 cleaned questions
for i in range(min(5, len(cleaned))):
    if original[i]['question'] != cleaned[i]['question']:
        print(f"Question {i+1}:")
        print(f"BEFORE: {original[i]['question'][:100]}...")
        print(f"AFTER:  {cleaned[i]['question'][:100]}...")
        print()
