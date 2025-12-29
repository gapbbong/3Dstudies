import fitz
import re
import json

pdf_path = "3D 프린터 운용 기능사 필기 책 스캔 2권중1_OCR_part 1 넙스 모델링.pdf"
doc = fitz.open(pdf_path)

# Define cluster ranges based on inspection and user info
# Cluster 1: ~Page 13 (8 questions)
# Cluster 2: ~Page 20 (5 questions - user said 5, I saw more numbers, maybe some are examples?)
# Cluster 3: ~Page 33 (10 questions)

# Let's just scan the whole doc and group by "출제 예상 문제" header
clusters = []
current_questions = []
in_questions = False

# Regex patterns
header_pattern = re.compile(r'출제\s*예상\s*문제')
# Matches "01.", "1.", "01 ", "1 " at start of line or after newline
q_start_pattern = re.compile(r'(?:^|\n)\s*(\d{1,2})\s*[.．\s]\s*(.*?)(?=(?:^|\n)\s*\d{1,2}\s*[.．\s]|$)', re.DOTALL)
# Choice pattern: ① ... ② ...
choice_pattern = re.compile(r'[①❶](.*?)[②❷](.*?)[③❸](.*?)[④❹](.*)', re.DOTALL)
# Answer pattern: Handle |, I, 1, !, l
answer_pattern = re.compile(r'정답\s*[|I1l!]\s*([①②③④❶❷❸❹])')
# Explanation pattern
exp_pattern = re.compile(r'(?:해설|내설)\s*[|I1l!]\s*(.*?)(?=(?:^|\n)\s*\d{1,2}\s*[.．\s]|$)', re.DOTALL)

def parse_page_questions(text):
    questions = []
    # Split by question numbers roughly
    # This is hard because text is columnar.
    # Better to just find all "Start of Question" indices and slice.
    
    matches = list(q_start_pattern.finditer(text))
    for i, match in enumerate(matches):
        q_num = match.group(1)
        full_q_text = match.group(2)
        
        # If next match exists, cut text there
        if i < len(matches) - 1:
            # This is tricky with regex findall/finditer on overlapping text.
            # The regex above consumes text.
            pass
            
        # Let's try a simpler block approach.
        # The text is likely messy.
        
        # Extract Answer
        ans_match = answer_pattern.search(full_q_text)
        answer = ans_match.group(1) if ans_match else ""
        
        # Extract Explanation
        exp_match = exp_pattern.search(full_q_text)
        explanation = exp_match.group(1).strip() if exp_match else ""
        
        # Extract Choices
        # Choices might be in the question text
        choices = []
        c_match = choice_pattern.search(full_q_text)
        if c_match:
            choices = [c.strip() for c in c_match.groups()]
            # Remove choices from question text
            q_text_only = full_q_text[:c_match.start()].strip()
        else:
            q_text_only = full_q_text.strip()
            
        # Clean up question text (remove answer/explanation if they leaked in)
        if "정답 |" in q_text_only:
            q_text_only = q_text_only.split("정답 |")[0].strip()
            
        if choices and answer:
            questions.append({
                "number": int(q_num),
                "question": q_text_only,
                "choices": choices,
                "answer": answer,
                "explanation": explanation
            })
            
    return questions

all_extracted = []
current_cluster_qs = []

# We know the pages from previous step
cluster_pages = [
    [12, 13, 14], # Cluster 1
    [19, 20, 21], # Cluster 2
    [32, 33, 34, 35] # Cluster 3
]

for cluster_idx, pages in enumerate(cluster_pages):
    cluster_data = []
    print(f"Processing Cluster {cluster_idx + 1} (Pages {pages})...")
    
    full_text = ""
    for p in pages:
        if p < len(doc):
            full_text += doc[p].get_text() + "\n"
            
    # Naive parsing: split by "01", "02" etc.
    # We'll use a custom parser for the accumulated text of the cluster
    
    # Normalize text
    full_text = re.sub(r'\n+', '\n', full_text)
    print(f"  Text length: {len(full_text)}")
    print(f"  Sample text: {full_text[:200]}")
    
    # Try finding numbers directly
    # Look for "01", "02", "1.", "2." at start of lines
    # The inspection showed "0 2" for "02".
    
    # Let's try a very loose split: any number 1-99 at start of line
    # tokens = re.split(r'\n\s*(\d{1,2})\s*[.．\s]', '\n' + full_text)
    
    # Debug: just find all potential starts
    starts = list(re.finditer(r'(?:^|\n)\s*(\d\s*\d|\d{1,2})\s', full_text))
    print(f"  Potential question starts found: {len(starts)}")
    for s in starts[:5]:
        print(f"    Match: '{s.group(0).strip()}' at {s.start()}")

    # Use a more robust pattern that handles "0 2"
    # Split by: newline + (digit + optional space + digit) + space/dot
    tokens = re.split(r'(?:^|\n)\s*(\d\s*\d|\d{1,2})\s', full_text)
    
    print(f"  Tokens found: {len(tokens)}")
    
    # tokens[0] is pre-text
    # tokens[1] is num, tokens[2] is content...
    
    for i in range(1, len(tokens), 2):
        num_str = tokens[i].replace(' ', '') # Handle "0 2" -> "02"
        if not num_str.isdigit(): continue
        
        num = int(num_str)
        content = tokens[i+1]
        
        # Debug
        # print(f"    Checking Q{num}: {content[:30]}...")
        
        # Basic validation: content must contain choices or answer
        if not (choice_pattern.search(content) or answer_pattern.search(content)):
            continue
            
        # Extract details
        ans_match = answer_pattern.search(content)
        answer = ans_match.group(1) if ans_match else ""
        
        exp_match = exp_pattern.search(content)
        explanation = exp_match.group(1).strip() if exp_match else ""
        
        choices = []
        c_match = choice_pattern.search(content)
        q_text = content
        if c_match:
            choices = [c.strip() for c in c_match.groups()]
            q_text = content[:c_match.start()].strip()
        
        # Clean q_text
        q_text = q_text.replace('\n', ' ').strip()
        
        if choices and answer:
            cluster_data.append({
                "id": f"p1_c{cluster_idx+1}_{num}",
                "number": num,
                "question": q_text,
                "choices": choices,
                "answer": answer,
                "explanation": explanation
            })
            
    print(f"  Found {len(cluster_data)} questions.")
    all_extracted.extend(cluster_data)

# Save to JSON
with open('part1_clusters.json', 'w', encoding='utf-8') as f:
    json.dump(all_extracted, f, ensure_ascii=False, indent=2)

print(f"Saved {len(all_extracted)} questions to part1_clusters.json")
