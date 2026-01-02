import fitz
import re
import json

def extract_questions(pdf_path, output_path):
    """Extract questions using answer marker method"""
    doc = fitz.open(pdf_path)
    questions = []
    
    # Get full text
    full_text = ""
    for i in range(len(doc)):
        page = doc[i]
        full_text += page.get_text() + "\n"
    
    # Normalize whitespace
    full_text = re.sub(r'\s+', ' ', full_text)
    
    # Find all '정답' markers with their answers
    answer_pattern = r'[정성][답][)\s]*[IㅣㅏiI|:)]\s*([①②③④®])'
    answer_matches = list(re.finditer(answer_pattern, full_text))
    
    print(f"Found {len(answer_matches)} '정답' markers")
    
    # Normalize OCR errors in answers
    normalized_answers = []
    for match in answer_matches:
        answer = match.group(1)
        if answer == '®':
            answer = '①'
        normalized_answers.append((match, answer))
    
    # For each answer, work backwards to find the question
    for idx, (match, answer) in enumerate(normalized_answers):
        answer_pos = match.start()
        
        # Find the start of this question
        if idx > 0:
            prev_answer_end = normalized_answers[idx-1][0].end()
            question_start = prev_answer_end
        else:
            question_start = 0
        
        # Extract the text between question_start and answer_pos
        question_block = full_text[question_start:answer_pos].strip()
        
        # Find choices (①②③④)
        choice_pattern = r'[①②③④]\s*([^①②③④]+?)(?=[①②③④]|정답|$)'
        choice_matches = re.findall(choice_pattern, question_block)
        
        if len(choice_matches) < 4:
            # Try alternative: split by choice markers
            choices = []
            for marker in ['①', '②', '③', '④']:
                if marker in question_block:
                    start = question_block.find(marker)
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
            last_choice_marker = '④'
            last_choice_pos = full_text.rfind(last_choice_marker, answer_pos - 200, answer_pos)
            if last_choice_pos != -1:
                explanation_text = full_text[match.end():next_question_start].strip()
                explanation = explanation_text[:200].strip()
        
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

# Extract Part 5-8
parts = [
    (5, "3D 프린터 운용 기능사 필기 책 스캔 2권중2_OCR_05 3D프린터 HW 설정.pdf"),
    (6, "3D 프린터 운용 기능사 필기 책 스캔 2권중2_OCR_06 출력용 데이터 확정.pdf"),
    (7, "3D 프린터 운용 기능사 필기 책 스캔 2권중2_OCR_07 제품 출력.pdf"),
    (8, "3D 프린터 운용 기능사 필기 책 스캔 2권중2_OCR_08 3D프린터 안전관리.pdf"),
]

results = {}
for part_num, pdf_path in parts:
    print("\n" + "="*70)
    print(f"PART {part_num}")
    print("="*70)
    questions = extract_questions(pdf_path, f"part{part_num}_questions.json")
    results[f"part{part_num}"] = len(questions)

print("\n" + "="*70)
print("SUMMARY")
print("="*70)
for part, count in results.items():
    print(f"{part}: {count} questions")
print(f"Total: {sum(results.values())} questions")
