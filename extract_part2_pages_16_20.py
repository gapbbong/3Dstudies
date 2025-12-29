import fitz
import re
import json

pdf_path = "3D 프린터 운용 기능사 필기 책 스캔 2권중1_OCR_part 2 엔지니어링 모델링.pdf"
output_path = "part2_pages_16_20.json"

def extract_questions():
    doc = fitz.open(pdf_path)
    questions = []
    
    # Pages 16 to 20 (0-indexed: 15 to 19)
    start_page = 15
    end_page = 19
    
    current_question = None
    
    for page_num in range(start_page, end_page + 1):
        page = doc[page_num]
        text = page.get_text()
        
        # Split text into lines to process sequentially
        lines = text.split('\n')
        
        # Buffer to hold text that might be a question
        text_buffer = []
        
        for line in lines:
            line = line.strip()
            if not line:
                continue
            
            # Check for start of options
            if line.startswith('①'):
                # If we hit an option, the previous buffer was likely the question
                
                # If we have a current question, finalize it (if it has choices)
                if current_question and len(current_question['choices']) >= 4:
                     questions.append(current_question)
                     current_question = None
                
                if current_question is None:
                    # Create new question
                    # The text buffer contains the question text
                    # We need to filter out the previous question's answer/explanation if present
                    
                    # Join buffer
                    full_buffer = " ".join(text_buffer).strip()
                    
                    # Heuristic: The question text is usually at the end of the buffer.
                    # The start of the buffer might contain "정답 ..." or "해설 ..." from previous question.
                    
                    # Split by "정답" or "해설" if present to isolate the new question
                    # But be careful, "정답" might be part of the question text (unlikely but possible)
                    # Usually "정답" is followed by a number or symbol.
                    
                    # Let's try to find the last occurrence of "정답" or "해설"
                    # and take everything after that.
                    
                    last_split_index = -1
                    
                    # Check for "정답"
                    if "정답" in full_buffer:
                        idx = full_buffer.rfind("정답")
                        # Check if it looks like an answer section (e.g. followed by number)
                        # For now just assume it is.
                        if idx > last_split_index:
                            last_split_index = idx + len("정답") + 5 # Skip "정답" and some chars like " : ③"
                            
                    # Check for "해설"
                    if "해설" in full_buffer:
                        idx = full_buffer.rfind("해설")
                        if idx > last_split_index:
                            # Find end of explanation? Explanation might be long.
                            # Usually explanation ends before the new question starts.
                            # But we don't have a clear delimiter between explanation and new question
                            # except that the new question starts.
                            # This is tricky.
                            # Let's assume the question text is the last few lines of the buffer?
                            # No, that's risky.
                            
                            # Let's look at the structure again.
                            # [Prev Answer] [Prev Explanation] [New Question Number] [New Question Text]
                            # We might see a number like "01." or "1."
                            pass
                            
                    # If we found a split point, take the text after it
                    if last_split_index > -1 and last_split_index < len(full_buffer):
                        q_text = full_buffer[last_split_index:].strip()
                    else:
                        q_text = full_buffer
                        
                    # Further cleanup: remove leading numbers/dots if present
                    # e.g. "01. Question" -> "Question"
                    # But we want to keep the number if possible, or store it separately.
                    # The user didn't ask for separation, just extraction.
                    
                    # If the text is empty, it means we failed to capture it.
                    # This happens if the buffer was cleared or empty.
                    
                    current_question = {
                        "question": q_text,
                        "choices": [],
                        "answer": "",
                        "explanation": "",
                        "page": page_num + 1
                    }
                    text_buffer = [] # Clear buffer
                
                # Add this line as choice 1
                current_question['choices'].append(line)
            
            elif line.startswith('②') or line.startswith('③') or line.startswith('④'):
                if current_question:
                    current_question['choices'].append(line)
            
            elif line.startswith('정답'):
                if current_question:
                    current_question['answer'] = line
                    # Clear buffer because we found the answer, so subsequent text is likely next question or explanation
                    # But wait, explanation comes after answer usually.
            
            elif line.startswith('해설'):
                if current_question:
                    current_question['explanation'] = line
                    # Clear buffer because we found explanation
            
            else:
                # Regular text
                # If we are inside a question (have choices), this might be part of a choice, answer, or explanation
                if current_question:
                    if current_question['explanation']:
                        current_question['explanation'] += " " + line
                    elif current_question['answer']:
                        # Usually answer is short, so this might be explanation starting without "해설" label?
                        # Or just extra text for answer?
                        # If "정답" was found, and now we have more text, it might be explanation.
                        # Check if it looks like explanation
                        current_question['explanation'] += " " + line # Assume it's explanation if answer is already set
                    elif len(current_question['choices']) > 0:
                        # Append to last choice
                        current_question['choices'][-1] += " " + line
                    else:
                        # Should not happen if we started with ①
                        text_buffer.append(line)
                else:
                    # Not inside a question, accumulating text for the next question
                    text_buffer.append(line)
                
            elif line.startswith('②') or line.startswith('③') or line.startswith('④'):
                if current_question:
                    current_question['choices'].append(line)
            
            elif line.startswith('정답'):
                if current_question:
                    current_question['answer'] = line
            
            elif line.startswith('해설'):
                if current_question:
                    current_question['explanation'] = line
            
            else:
                # Regular text
                # If we are inside a question (have choices), this might be part of a choice, answer, or explanation
                if current_question:
                    if current_question['explanation']:
                        current_question['explanation'] += " " + line
                    elif current_question['answer']:
                        # Usually answer is short, so this might be explanation starting without "해설" label?
                        # Or just extra text for answer?
                        current_question['answer'] += " " + line
                    elif len(current_question['choices']) > 0:
                        # Append to last choice
                        current_question['choices'][-1] += " " + line
                    else:
                        # Should not happen if we started with ①
                        text_buffer.append(line)
                else:
                    # Not inside a question, accumulating text for the next question
                    text_buffer.append(line)
        
    # Append the last question
    if current_question and len(current_question['choices']) >= 4:
        questions.append(current_question)

    # Post-processing to clean up
    for q in questions:
        # Clean choices
        q['choices'] = [c.replace('①', '').replace('②', '').replace('③', '').replace('④', '').strip() for c in q['choices']]
        
        # Clean answer
        # Look for circle number in answer text
        ans_match = re.search(r'[①②③④]', q['answer'])
        if ans_match:
            q['answer'] = ans_match.group(0)
        
        # Remove "해설" prefix
        q['explanation'] = q['explanation'].replace('해설', '').replace(':', '').strip()

    print(f"Extracted {len(questions)} questions from pages {start_page+1}-{end_page+1}")
    
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(questions, f, ensure_ascii=False, indent=2)

if __name__ == "__main__":
    extract_questions()
