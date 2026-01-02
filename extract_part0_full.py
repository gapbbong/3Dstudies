import fitz
import re
import json

def extract_all_questions(pdf_path):
    doc = fitz.open(pdf_path)
    text = ""
    for page in doc:
        text += page.get_text()
    
    # Normalize text
    text = re.sub(r'\s+', ' ', text).strip()
    
    # Find "출제예상문제" sections or just look for numbered questions
    # Pattern: Number + . + Question Text + Choices + Answer + Explanation
    # This is a heuristic approach based on previous observations
    
    questions = []
    
    # Regex for finding questions starting with a number like "01." or "1."
    # We look for patterns that have choices (①...) and an answer/explanation later
    
    # Split by potential question numbers (e.g., "01.", "02.", "1.", "2.")
    # We use a lookahead to split but keep the delimiter
    segments = re.split(r'(?=\d+\.\s)', text)
    
    for segment in segments:
        # Check if this segment looks like a question
        if not re.match(r'\d+\.\s', segment):
            continue
            
        # Extract Number and Question
        match_q = re.match(r'(\d+)\.\s(.*?)(?=[①②③④]|$)', segment)
        if not match_q:
            continue
            
        number = match_q.group(1)
        question_text = match_q.group(2).strip()
        
        # Extract Choices
        choices = re.findall(r'[①②③④]([^①②③④]+)', segment)
        choices = [c.strip() for c in choices]
        
        # Extract Answer and Explanation
        # These might be at the end of the segment or in a separate "Answer" section
        # In this specific book, answers seem to be near the question or at the bottom
        # Based on previous `quiz.json`, we had "answer" and "explanation" fields.
        # Let's try to find "정답" or "해설" within the segment
        
        answer = ""
        explanation = ""
        
        if "정답" in segment:
            ans_match = re.search(r'정답\s*[:]?\s*([①②③④])', segment)
            if ans_match:
                answer = ans_match.group(1)
        
        if "해설" in segment:
            exp_match = re.search(r'해설\s*[:]?\s*(.*)', segment)
            if exp_match:
                explanation = exp_match.group(1).strip()
        
        # If choices are found, it's likely a valid question
        if len(choices) >= 3:
            questions.append({
                "number": number,
                "question": question_text,
                "choices": choices,
                "answer": answer,
                "explanation": explanation,
                "image": None # No images as requested
            })
            
    return questions

questions = extract_all_questions('3D 프린터 운용 기능사 필기 책 스캔 2권중1_OCR_part 0 제품 스캐닝.pdf')
print(f"Found {len(questions)} potential questions.")

# Save to json for inspection
with open('part0_questions.json', 'w', encoding='utf-8') as f:
    json.dump(questions, f, ensure_ascii=False, indent=2)
