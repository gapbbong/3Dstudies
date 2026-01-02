import fitz
import re
import json

pdf_path = "3D 프린터 운용 기능사 필기 책 스캔 2권중1_OCR_part 2 엔지니어링 모델링.pdf"
output_path = "part2_questions_v2.json"

def extract_by_choice_pattern():
    doc = fitz.open(pdf_path)
    questions = []
    
    # Process pages 16-48
    start_page = 16
    end_page = 48
    
    # Get full text
    full_text = ""
    for i in range(start_page-1, end_page):
        page = doc[i]
        full_text += page.get_text() + "\n"
    
    # Normalize whitespace but keep newlines for structure
    full_text = re.sub(r'[ \t]+', ' ', full_text)
    
    # Strategy: Find all occurrences of ① and check if ②③④ follow
    # This identifies question blocks
    
    choice_blocks = []
    pos = 0
    while True:
        # Find next ①
        pos = full_text.find('①', pos)
        if pos == -1:
            break
        
        # Check if ②③④ appear within reasonable distance (500 chars)
        window = full_text[pos:pos+500]
        
        has_all_choices = ('②' in window and '③' in window and '④' in window)
        
        if has_all_choices:
            # Find positions of all choices
            pos_1 = pos
            pos_2 = full_text.find('②', pos)
            pos_3 = full_text.find('③', pos)
            pos_4 = full_text.find('④', pos)
            
            # Make sure they're in order and close together
            if pos_2 > pos_1 and pos_3 > pos_2 and pos_4 > pos_3:
                if pos_4 - pos_1 < 500:  # All within 500 chars
                    choice_blocks.append({
                        'start': pos_1,
                        'end': pos_4 + 1,
                        'pos_1': pos_1,
                        'pos_2': pos_2,
                        'pos_3': pos_3,
                        'pos_4': pos_4
                    })
                    pos = pos_4 + 1  # Skip past this block
                    continue
        
        pos += 1
    
    print(f"Found {len(choice_blocks)} choice blocks")
    
    # For each choice block, extract question and answer
    for idx, block in enumerate(choice_blocks):
        # Question text: look backwards from ① to find question start
        # Usually after previous answer or at reasonable distance
        
        question_start = max(0, block['start'] - 300)
        if idx > 0:
            # Start after previous block's end
            prev_end = choice_blocks[idx-1]['end']
            question_start = max(question_start, prev_end)
        
        question_block = full_text[question_start:block['end']]
        
        # Extract question text (before ①)
        first_choice_pos = question_block.find('①')
        question_text = question_block[:first_choice_pos].strip()
        
        # Clean question text - remove previous answer/explanation
        # Look for common separators
        for separator in ['정답', '성답', '해설']:
            if separator in question_text:
                # Take text after last occurrence
                parts = question_text.split(separator)
                if len(parts) > 1:
                    # Skip the separator and answer, take the rest
                    question_text = parts[-1].strip()
                    # Remove leading answer markers like "I ①"
                    question_text = re.sub(r'^[IㅣㅏiI|:)]\s*[①②③④®]\s*', '', question_text)
                    question_text = question_text.strip()
        
        # Extract choices
        choices = []
        choice_positions = [
            (block['pos_1'], '①'),
            (block['pos_2'], '②'),
            (block['pos_3'], '③'),
            (block['pos_4'], '④')
        ]
        
        for i, (pos, marker) in enumerate(choice_positions):
            # Find start and end of this choice
            start = pos + 1  # After marker
            if i < 3:
                end = choice_positions[i+1][0]  # Before next marker
            else:
                # Last choice - find reasonable end
                end = min(pos + 200, block['end'] + 200)
            
            choice_text = full_text[start:end].strip()
            # Clean up - remove newlines, extra spaces
            choice_text = re.sub(r'\s+', ' ', choice_text).strip()
            # Stop at answer marker if present
            for sep in ['정답', '성답']:
                if sep in choice_text:
                    choice_text = choice_text.split(sep)[0].strip()
            choices.append(choice_text)
        
        # Extract answer - look after ④
        answer = ""
        answer_search = full_text[block['end']:block['end']+100]
        answer_match = re.search(r'[정성][답][)\s]*[IㅣㅏiI|:)]\s*([①②③④®])', answer_search)
        if answer_match:
            answer = answer_match.group(1)
            if answer == '®':
                answer = '①'
        
        # Extract explanation
        explanation = ""
        if answer_match:
            exp_start = block['end'] + answer_match.end()
            exp_end = exp_start + 200
            if idx < len(choice_blocks) - 1:
                exp_end = min(exp_end, choice_blocks[idx+1]['start'] - block['start'] + question_start)
            explanation = full_text[exp_start:exp_end].strip()
            explanation = re.sub(r'\s+', ' ', explanation)[:200]
        
        # Only add if we have valid question and 4 choices
        # Filter out false positives:
        # 1. Question text must be at least 10 characters
        # 2. Question should not start with common explanation markers
        # 3. At least one choice should have reasonable length
        
        if not question_text or len(question_text) < 10:
            continue
        
        if len(choices) != 4:
            continue
        
        # Check if this looks like an explanation rather than a question
        explanation_markers = ['①', '②', '③', '④', '•', ':', '：']
        if question_text.strip()[0] in explanation_markers and len(question_text) < 30:
            continue
        
        # Check if at least one choice has reasonable content
        if max(len(c) for c in choices) < 5:
            continue
        
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
    extract_by_choice_pattern()
