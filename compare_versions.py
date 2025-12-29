import json

# Load both versions
with open('part2_questions.json', encoding='utf-8') as f:
    v1 = json.load(f)

with open('part2_questions_v2.json', encoding='utf-8') as f:
    v2 = json.load(f)

print(f"V1 (정답 기반): {len(v1)} questions")
print(f"V2 (선택지 기반): {len(v2)} questions")
print(f"Difference: {len(v2) - len(v1)}")

# Show first few from V2
print("\n=== First 5 questions from V2 ===")
for i, q in enumerate(v2[:5]):
    print(f"\n{i+1}. {q['question'][:80]}...")
    print(f"   Answer: {q['answer']}")
    print(f"   Choices: {len(q['choices'])}")

# Show questions that might be in V2 but not V1
print("\n=== Checking for duplicates or false positives ===")
# Simple check: look for very short questions
short_questions = [q for q in v2 if len(q['question']) < 20]
print(f"Questions with very short text (<20 chars): {len(short_questions)}")
for q in short_questions[:3]:
    print(f"  - '{q['question']}'")
