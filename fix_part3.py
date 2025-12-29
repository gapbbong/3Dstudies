import json

# Load current data.js and parse it
with open('data.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Load Part 2 and Part 3 clean data
with open('part2_questions_clean.json', 'r', encoding='utf-8') as f:
    part2_data = json.load(f)

with open('part3_questions_clean.json', 'r', encoding='utf-8') as f:
    part3_data = json.load(f)

print("="*70)
print("Current Status")
print("="*70)
print(f"Part 2: {len(part2_data)} questions")
print(f"Part 3: {len(part3_data)} questions")

print("\n" + "="*70)
print("Part 3 First Two Questions")
print("="*70)
for i in range(min(2, len(part3_data))):
    print(f"\nQuestion {i+1}:")
    print(f"Q: {part3_data[i]['question'][:100]}...")
    print(f"A: {part3_data[i]['answer']}")

print("\n" + "="*70)
print("Moving first 2 questions from Part 3 to Part 2")
print("="*70)

# Move first 2 questions from Part 3 to Part 2
questions_to_move = part3_data[:2]
part2_data.extend(questions_to_move)
part3_data = part3_data[2:]

print(f"New Part 2: {len(part2_data)} questions (was 32, now {len(part2_data)})")
print(f"New Part 3: {len(part3_data)} questions (was 17, now {len(part3_data)})")

# Save updated files
with open('part2_questions_clean.json', 'w', encoding='utf-8') as f:
    json.dump(part2_data, f, ensure_ascii=False, indent=2)

with open('part3_questions_clean.json', 'w', encoding='utf-8') as f:
    json.dump(part3_data, f, ensure_ascii=False, indent=2)

print("\nUpdated files saved!")
print("Now regenerating data.js with corrected parts...")
