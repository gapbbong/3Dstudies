import json
import re

def clean_question_text(question_text):
    """Clean question text by removing previous question explanations"""
    
    # Remove common explanation markers and their preceding text
    markers = ['정답', '해설', '내설', '출제예상문제']
    
    for marker in markers:
        if marker in question_text:
            parts = question_text.split(marker)
            if len(parts) > 1:
                question_text = parts[-1].strip()
                question_text = re.sub(r'^[IㅣㅏiI|:)]\s*[①②③④®]\s*', '', question_text)
                question_text = question_text.strip()
    
    # Look for question markers
    sentences = re.split(r'[?？]', question_text)
    if len(sentences) > 1:
        for i in range(len(sentences) - 1, -1, -1):
            if len(sentences[i].strip()) > 10:
                question_text = sentences[i].strip() + '?'
                break
    
    # Remove page numbers and chapter markers
    question_text = re.sub(r'\d+\s*PART\s*\d+.*?(?=\n|$)', '', question_text)
    question_text = re.sub(r'CHAPTER\s*\d+.*?(?=\n|$)', '', question_text)
    question_text = re.sub(r'출제예상문제\s*\d+', '', question_text)
    
    # Remove bullet points
    question_text = re.sub(r'^[•◦○●]\s*', '', question_text)
    
    # Clean up multiple spaces
    question_text = re.sub(r'\s+', ' ', question_text).strip()
    
    # If text is too long, try to extract core question
    if len(question_text) > 200:
        patterns = [
            r'다음.*?것은\?',
            r'다음.*?것이\?',
            r'.*?설명으로.*?것은\?',
            r'.*?대한.*?것은\?',
            r'.*?틀린.*?것은\?',
            r'.*?옳은.*?것은\?',
        ]
        
        for pattern in patterns:
            match = re.search(pattern, question_text)
            if match:
                question_text = match.group(0)
                break
    
    return question_text

def clean_all_questions(input_file, output_file):
    """Clean all questions in a JSON file"""
    with open(input_file, 'r', encoding='utf-8') as f:
        questions = json.load(f)
    
    cleaned_count = 0
    for q in questions:
        original = q['question']
        cleaned = clean_question_text(original)
        
        if cleaned != original:
            cleaned_count += 1
            q['question'] = cleaned
    
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(questions, f, ensure_ascii=False, indent=2)
    
    print(f"Cleaned {cleaned_count}/{len(questions)} questions")
    return questions

# Clean Part 5-8
for part_num in [5, 6, 7, 8]:
    print(f"\n{'='*70}")
    print(f"Cleaning Part {part_num}")
    print('='*70)
    clean_all_questions(f'part{part_num}_questions.json', f'part{part_num}_questions_clean.json')

print("\n" + "="*70)
print("All parts cleaned!")
print("="*70)
