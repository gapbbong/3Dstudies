import re
import json

file_path = r'd:\App\3d Studies\data.js'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Extract the appData object
json_match = re.search(r'const appData = ({.*?});', content, re.DOTALL)
if not json_match:
    print("Could not find appData")
    exit(1)

# Parse the data (we'll use a simple approach since it's JS object notation)
# For each part 3-8, extract theory and questions

parts_to_check = ['part3', 'part4', 'part5', 'part6', 'part7', 'part8']

for part_id in parts_to_check:
    print(f"\n{'='*80}")
    print(f"분석: {part_id.upper()}")
    print(f"{'='*80}")
    
    # Find the part section
    part_pattern = rf'"id":\s*"{part_id}".*?"theoryContent":\s*`([^`]*)`.*?"questions":\s*\[(.*?)\]\s*\}}'
    part_match = re.search(part_pattern, content, re.DOTALL)
    
    if not part_match:
        print(f"❌ {part_id}를 찾을 수 없습니다.")
        continue
    
    theory = part_match.group(1)
    questions_section = part_match.group(2)
    
    # Extract question texts
    question_pattern = r'"question":\s*"([^"]*(?:"[^"]*"[^"]*)*)"'
    questions = re.findall(question_pattern, questions_section)
    
    print(f"\n📚 핵심이론 키워드:")
    theory_keywords = set()
    # Extract key terms from theory
    for line in theory.split('\n'):
        line = line.strip()
        if line and not line.startswith('#'):
            # Extract Korean terms and English terms
            korean_terms = re.findall(r'[가-힣]{2,}', line)
            english_terms = re.findall(r'[A-Z][A-Za-z]+', line)
            theory_keywords.update(korean_terms)
            theory_keywords.update(english_terms)
    
    print(f"  총 {len(theory_keywords)}개 키워드 추출")
    
    print(f"\n❓ 문제 분석 (총 {len(questions)}문제):")
    
    coverage_issues = []
    for i, q in enumerate(questions, 1):
        # Clean up the question text
        q_clean = q.replace('\\n', ' ').replace('\\r', '')
        
        # Extract key terms from question
        q_keywords = set()
        korean_terms = re.findall(r'[가-힣]{2,}', q_clean)
        english_terms = re.findall(r'[A-Z][A-Za-z]+', q_clean)
        q_keywords.update(korean_terms)
        q_keywords.update(english_terms)
        
        # Check if question keywords are in theory
        missing = q_keywords - theory_keywords
        
        # Filter out common words
        common_words = {'것은', '대한', '설명', '다음', '경우', '방식', '프린터', '출력', '제품', '모델', '파일', '작업'}
        missing = missing - common_words
        
        if len(missing) > 3:  # If more than 3 specific terms are missing
            coverage_issues.append((i, q_clean[:80], list(missing)[:5]))
    
    if coverage_issues:
        print(f"\n⚠️  이론에서 다루지 않은 개념이 포함된 문제들:")
        for q_num, q_text, missing_terms in coverage_issues:
            print(f"  Q{q_num:02d}: {q_text}...")
            print(f"       누락 키워드: {', '.join(missing_terms)}")
    else:
        print(f"\n✅ 모든 문제가 핵심이론으로 커버됩니다!")

print(f"\n{'='*80}")
print("분석 완료")
print(f"{'='*80}")
