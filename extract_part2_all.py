import fitz
import re
import json

pdf_path = "3D 프린터 운용 기능사 필기 책 스캔 2권중1_OCR_part 2 엔지니어링 모델링.pdf"
output_path = "part2_questions.json"

def extract_all_questions():
    doc = fitz.open(pdf_path)
    questions = []
    
    # Process pages 16-48 (Section 1-5)
    start_page = 16
    end_page = 48
    
    # Get full text
    full_text = ""
    for i in range(start_page-1, end_page):
        page = doc[i]
        full_text += page.get_text() + "\n"
    
    # Normalize whitespace
    full_text = re.sub(r'\s+', ' ', full_text)
    
    # Find all '정답' markers with their answers
    # Pattern: 정답/성답 [separator] [answer]
    # OCR variations: 정답, 성답
    # Separators: I, ㅣ, ㅏ, i, |, :, ), space
    # Answer markers: ①②③④ or OCR errors like ®
    answer_pattern = r'[정성][답][)\s]*[IㅣㅏiI|:)]\s*([①②③④®])'
    answer_matches = list(re.finditer(answer_pattern, full_text))
    
    print(f"Found {len(answer_matches)} '정답' markers")
    
    # Normalize OCR errors in answers
    normalized_answers = []
    for match in answer_matches:
        answer = match.group(1)
        # Convert OCR errors to correct symbols
        if answer == '®':
            answer = '①'
        normalized_answers.append((match, answer))
    
    # For each answer, work backwards to find the question
    for idx, (match, answer) in enumerate(normalized_answers):
        answer_pos = match.start()
        
        # Find the start of this question
        # It's either after the previous answer or at the beginning
        if idx > 0:
            prev_answer_end = normalized_answers[idx-1][0].end()
            question_start = prev_answer_end
        else:
            question_start = 0
        
        # Extract the text between question_start and answer_pos
        question_block = full_text[question_start:answer_pos].strip()
        
        # Find choices (①②③④)
        # They should appear in order
        choice_pattern = r'[①②③④]\s*([^①②③④]+?)(?=[①②③④]|정답|$)'
        choice_matches = re.findall(choice_pattern, question_block)
        
        if len(choice_matches) < 4:
            # Try alternative: split by choice markers
            choices = []
            for marker in ['①', '②', '③', '④']:
                if marker in question_block:
                    start = question_block.find(marker)
                    # Find next marker
                    next_pos = len(question_block)
                    for next_marker in ['①', '②', '③', '④']:
                        if next_marker != marker:
                            pos = question_block.find(next_marker, start+1)
                            if pos != -1 and pos < next_pos:
                                next_pos = pos
                    
                    choice_text = question_block[start+1:next_pos].strip()
                    choices.append(choice_text)
            
            if len(choices) >= 4:
                choice_matches = choices[:4]
        
        # Clean choices
        choices = [c.strip() for c in choice_matches[:4]]
        
        # Extract question text (before first ①)
        first_choice_pos = question_block.find('①')
        if first_choice_pos == -1:
            continue
            
        question_text = question_block[:first_choice_pos].strip()
        
        # Extract explanation (after answer marker)
        explanation = ""
        if idx < len(normalized_answers) - 1:
            next_question_start = normalized_answers[idx+1][0].start()
            # Find where choices end
            last_choice_marker = '④'
            last_choice_pos = full_text.rfind(last_choice_marker, answer_pos - 200, answer_pos)
            if last_choice_pos != -1:
                explanation_text = full_text[match.end():next_question_start].strip()
                # Clean up
                explanation = explanation_text[:200].strip()  # Limit length
        
        # Only add if we have valid data
        if question_text and len(choices) == 4:
            questions.append({
                "question": question_text,
                "choices": choices,
                "answer": answer,
                "explanation": explanation
            })
    
    print(f"Extracted {len(questions)} questions")
    
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(questions, f, ensure_ascii=False, indent=2)
    
    print(f"Saved to {output_path}")
    return questions

if __name__ == "__main__":
    extract_all_questions()
