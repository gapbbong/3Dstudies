import json

# Load both versions
with open('part2_questions.json', encoding='utf-8') as f:
    v1 = json.load(f)  # 32 questions (정답 기반)

with open('part2_questions_v2.json', encoding='utf-8') as f:
    v2 = json.load(f)  # 33 questions (선택지 기반)

print(f"V1 (정답 기반): {len(v1)} questions")
print(f"V2 (선택지 기반): {len(v2)} questions")

# Merge strategy: Use V2 as base (has more), but verify with V1
# Create a merged version that takes the best of both

merged = []
seen_questions = set()

# First, add all from V2
for q in v2:
    # Normalize question text for comparison
    q_norm = q['question'][:50].strip()
    if q_norm not in seen_questions:
        merged.append(q)
        seen_questions.add(q_norm)

# Then, add any from V1 that weren't in V2
for q in v1:
    q_norm = q['question'][:50].strip()
    if q_norm not in seen_questions:
        merged.append(q)
        seen_questions.add(q_norm)
        print(f"Added from V1: {q['question'][:60]}...")

print(f"\nMerged total: {len(merged)} questions")

# Save merged version
with open('part2_questions_merged.json', 'w', encoding='utf-8') as f:
    json.dump(merged, f, ensure_ascii=False, indent=2)

print("Saved to part2_questions_merged.json")

# Show summary
print("\n=== Summary ===")
print(f"Target: 36 questions")
print(f"Achieved: {len(merged)} questions")
print(f"Missing: {36 - len(merged)} questions")
