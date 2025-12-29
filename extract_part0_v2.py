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
    
    # The text shows questions like "04 SLS 방식...", "05 FDM 방식...", "06 SLS 방식..."
    # Answers are like "정답 I ①" or "정답 | ①"
    
    # Strategy:
    # 1. Find all occurrences of "정답 I [①②③④]" or similar to locate questions.
    # 2. Work backwards to find the question number.
    # 3. Or, split by "Question Number" pattern if robust enough.
    
    # Let's try a more robust split based on the "Number + Space" pattern, but verified by having choices.
    
    questions = []
    
    # Regex to find "Number [Space] Text ... Choices ... Answer"
    # We'll iterate through potential matches
    
    # Pattern for the start of a question: 2 digits (or 1) followed by space or dot
    # e.g., "01 ", "01. ", "1. "
    # And ensuring it's followed by some text and eventually choices
    
    # Let's split by the "Answer" marker first, as it's very distinct ("정답 I", "정답 |")
    # Then look backwards for the start of the question.
    
    # Normalize "정답 I" to "정답 |" for easier regex
    text = text.replace("정답 I", "정답 |").replace("정답 l", "정답 |")
    
    segments = text.split("정답 |")
    
    # The last segment won't have an answer (or it's the end of file)
    # The first segment is intro text + Question 1 body
    # The second segment is Answer 1 + Explanation 1 + Question 2 body
    
    # We need to parse each segment carefully.
    
    current_q_body = segments[0] # Contains Q1 body (and intro)
    
    parsed_questions = []
    
    for i in range(1, len(segments)):
        next_part = segments[i]
        
        # current_q_body ends with the choices of the current question
        # next_part starts with the answer of the current question, then explanation, then next question body
        
        # 1. Extract Answer from start of next_part
        answer_match = re.match(r'\s*([①②③④])', next_part)
        if not answer_match:
            # Maybe something went wrong, skip
            current_q_body = next_part
            continue
            
        answer = answer_match.group(1)
        
        # 2. Extract Explanation
        # Explanation usually follows answer. It might go until the next question number.
        # Look for the next question number pattern at the end of next_part
        # Pattern: "07 " or "07." at the end? No, it's in the middle.
        
        # Let's try to find the LAST occurrence of a question number pattern in current_q_body
        # to separate "Intro/Previous Explanation" from "Current Question"
        
        # Regex for question start: "01 ", "01.", "1." followed by text
        # We search from the end of current_q_body
        
        # Reverse search for number pattern
        # Matches: "01 ", "01.", "1."
        # We assume questions are numbered 01-60 or similar.
        
        q_start_match = None
        # Search for 2 digits + space/dot, or 1 digit + dot
        matches = list(re.finditer(r'(?:^|\s)(\d{2}\.?|\d\.)\s', current_q_body))
        
        if matches:
            # The last match is likely the start of the current question
            last_match = matches[-1]
            q_start_index = last_match.start()
            
            number_str = last_match.group(1).replace('.', '').strip()
            full_q_text = current_q_body[q_start_index:]
            
            # Remove the number from text
            full_q_text = full_q_text[len(last_match.group(0)):] # approximate
            
            # Now extract choices from full_q_text
            # Choices are ①... ②...
            choices = re.findall(r'[①②③④]([^①②③④]+)', full_q_text)
            choices = [c.strip() for c in choices]
            
            # The question text is everything before the first choice
            q_text_match = re.split(r'[①②③④]', full_q_text, 1)
            question_text = q_text_match[0].strip()
            
            # 3. Extract Explanation from next_part (everything after answer until next question starts?)
            # Actually, we don't know where next question starts in next_part yet.
            # But we know the loop will handle next_part as current_q_body next time.
            # So we just need to save the answer/explanation with the CURRENT question.
            
            # Wait, the explanation is in next_part.
            # We can extract it now.
            explanation_text = next_part[len(answer_match.group(0)):]
            
            # We'll clean up explanation later or just take it all and let the next iteration cut it?
            # The next iteration will find the *start* of the next question in `explanation_text` (which becomes `current_q_body`).
            # So effectively, the text *before* the next question number IS the explanation.
            
            # But for the LAST question, we need to handle it.
            
            parsed_questions.append({
                "number": number_str,
                "question": question_text,
                "choices": choices,
                "answer": answer,
                "raw_explanation_plus_next": explanation_text # Temporary
            })
            
        current_q_body = next_part

    # Now clean up explanations
    for j in range(len(parsed_questions)):
        q = parsed_questions[j]
        raw = q["raw_explanation_plus_next"]
        
        # If there is a next question, the explanation ends where next question starts
        # But we already found the start of questions in the loop.
        # Actually, the logic above found the start of the question *within* the previous block.
        # So `raw_explanation_plus_next` contains: Explanation + Next Question Number + Next Question Body...
        
        # We need to find where the NEXT question started to cut the explanation.
        # We can use the number of the next question if available.
        
        if j < len(parsed_questions) - 1:
            next_q_num = parsed_questions[j+1]["number"]
            # Find this number in raw
            # Try "02", "02.", "2."
            # Be careful of false positives (numbers in explanation)
            
            # Regex for next number
            # We expect it to be like " 02 " or " 02."
            split_pattern = r'(?:^|\s)' + re.escape(next_q_num) + r'[\.\s]'
            split_match = re.search(split_pattern, raw)
            
            if split_match:
                q["explanation"] = raw[:split_match.start()].strip()
            else:
                q["explanation"] = raw.strip() # Fallback
        else:
            # Last question, explanation is everything until end (or some footer)
            q["explanation"] = raw.strip()
            
        # Clean up "해설" prefix if present
        q["explanation"] = re.sub(r'^해설\s*[:]?\s*', '', q["explanation"]).strip()
        
        # Remove temporary field
        del q["raw_explanation_plus_next"]

    return parsed_questions

questions = extract_all_questions('3D 프린터 운용 기능사 필기 책 스캔 2권중1_OCR_part 0 제품 스캐닝.pdf')
print(f"Found {len(questions)} potential questions.")

# Filter valid ones (must have 3+ choices)
valid_questions = [q for q in questions if len(q['choices']) >= 3]
print(f"Found {len(valid_questions)} valid questions.")

with open('part0_questions_v2.json', 'w', encoding='utf-8') as f:
    json.dump(valid_questions, f, ensure_ascii=False, indent=2)
