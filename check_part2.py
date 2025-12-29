import json

with open('part2_questions.json', encoding='utf-8') as f:
    data = json.load(f)

print(f"Total questions: {len(data)}")

# Show first 3 questions
for i, q in enumerate(data[:3]):
    print(f"\nQuestion {i+1}:")
    print(f"  Q: {q['question'][:80]}...")
    print(f"  Choices: {len(q['choices'])}")
    print(f"  Answer: {q['answer']}")
