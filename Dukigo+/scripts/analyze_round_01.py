import json
import re
import os

def analyze_round_01():
    text_path = "data/2015_01회차.txt"
    json_path = "data/2015_01_questions.json"
    
    # Diagram keywords
    keywords = ["그림", "회로", "표", "그래프", "곡선", "브리지", "어드미턴스", "리액턴스", "기호", "다음과 같은"]
    
    if not os.path.exists(text_path) or not os.path.exists(json_path):
        print("Files not found.")
        return

    with open(json_path, 'r', encoding='utf-8') as f:
        json_data = json.load(f)
        tagged_nums = {q['question_num'] for q in json_data if '[그림 참고]' in q['question']}

    with open(text_path, 'r', encoding='utf-8') as f:
        content = f.read()
        
    # Split by common question headers in 2015_01
    q_blocks = re.split(r'## \*\*(\d+)\.', content)
    
    missing_tags = []
    already_tagged = []
    
    for i in range(1, len(q_blocks), 2):
        q_num = int(q_blocks[i])
        q_body = q_blocks[i+1]
        
        has_keyword = any(kw in q_body for kw in keywords)
        
        if has_keyword:
            if q_num not in tagged_nums:
                missing_tags.append((q_num, q_body.split('\n')[0:2])) # Just first 2 lines for context
            else:
                already_tagged.append(q_num)
                
    print(f"Already Tagged: {sorted(list(already_tagged))}")
    print("\nMissing Tags (Keywords found but tag not in JSON):")
    for q_num, context in missing_tags:
        print(f"Q{q_num}: {' '.join(context).strip()}")

if __name__ == "__main__":
    analyze_round_01()
