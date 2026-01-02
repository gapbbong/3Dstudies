import json
import re

# Load both versions
with open('part2_questions.json', encoding='utf-8') as f:
    v1 = json.load(f)  # 32 questions (정답 기반)

with open('part2_questions_v2.json', encoding='utf-8') as f:
    v2 = json.load(f)  # 33 questions (선택지 기반)

print(f"V1 (정답 기반): {len(v1)} questions")
print(f"V2 (선택지 기반): {len(v2)} questions")

# Better deduplication: use question text + first choice
def make_key(q):
    # Normalize: remove whitespace, take first 100 chars of question + first choice
    q_text = re.sub(r'\s+', '', q['question'][:100])
    c_text = re.sub(r'\s+', '', q['choices'][0][:50]) if q['choices'] else ''
    return q_text + '|' + c_text

# Create sets
v1_keys = {make_key(q): q for q in v1}
v2_keys = {make_key(q): q for q in v2}

print(f"\nUnique in V1: {len(v1_keys)}")
print(f"Unique in V2: {len(v2_keys)}")

# Find questions only in V2
only_in_v2 = []
for key, q in v2_keys.items():
    if key not in v1_keys:
        only_in_v2.append(q)

print(f"\nQuestions only in V2: {len(only_in_v2)}")
for i, q in enumerate(only_in_v2[:5]):
    print(f"\n{i+1}. Q: {q['question'][:80]}...")
    print(f"   A: {q['answer']}")
    print(f"   C1: {q['choices'][0][:40]}...")

# Find questions only in V1
only_in_v1 = []
for key, q in v1_keys.items():
    if key not in v2_keys:
        only_in_v1.append(q)

print(f"\nQuestions only in V1: {len(only_in_v1)}")
for i, q in enumerate(only_in_v1[:5]):
    print(f"\n{i+1}. Q: {q['question'][:80]}...")
    print(f"   A: {q['answer']}")

# Create best merged version
# Use V1 as base (more reliable), add unique from V2
merged = list(v1)
for q in only_in_v2:
    # Only add if it looks like a real question
    if len(q['question']) > 15 and q['answer']:
        merged.append(q)

print(f"\n=== Final Merged ===")
print(f"Total: {len(merged)} questions")
print(f"Target: 36")
print(f"Difference: {len(merged) - 36}")

with open('part2_questions_final.json', 'w', encoding='utf-8') as f:
    json.dump(merged, f, ensure_ascii=False, indent=2)

print("Saved to part2_questions_final.json")
