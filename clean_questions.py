import json
import re

def clean_question_text(question_text):
    """Clean question text by removing previous question explanations"""
    
    # Remove common explanation markers and their preceding text
    # Pattern: Look for "정답", "해설", "내설" followed by content, then actual question
    
    # Strategy 1: If text contains "정답" or "해설", take text after it
    markers = ['정답', '해설', '내설', '출제예상문제']
    
    for marker in markers:
        if marker in question_text:
            # Find the last occurrence of the marker
            parts = question_text.split(marker)
            if len(parts) > 1:
                # Take the last part (most likely the actual question)
                question_text = parts[-1].strip()
                # Remove leading separators like "I ①", ":", etc.
                question_text = re.sub(r'^[IㅣㅏiI|:)]\s*[①②③④®]\s*', '', question_text)
                question_text = question_text.strip()
    
    # Strategy 2: Remove numbered prefixes from previous questions
    # If text starts with a number pattern like "01", "02", remove everything before it
    # But keep if it's part of the actual question
    
    # Strategy 3: Look for question markers (?, 것은, 것이)
    # If there are multiple question-like sentences, take the last one
    sentences = re.split(r'[?？]', question_text)
    if len(sentences) > 1:
        # Find the last meaningful question
        for i in range(len(sentences) - 1, -1, -1):
            if len(sentences[i].strip()) > 10:
                # Reconstruct with question mark
                question_text = sentences[i].strip() + '?'
                break
    
    # Strategy 4: Remove page numbers and chapter markers
    question_text = re.sub(r'\d+\s*PART\s*\d+.*?(?=\n|$)', '', question_text)
    question_text = re.sub(r'CHAPTER\s*\d+.*?(?=\n|$)', '', question_text)
    question_text = re.sub(r'출제예상문제\s*\d+', '', question_text)
    
    # Strategy 5: Remove bullet points and list markers at the start
    question_text = re.sub(r'^[•◦○●]\s*', '', question_text)
    
    # Strategy 6: Clean up multiple spaces
    question_text = re.sub(r'\s+', ' ', question_text).strip()
    
    # Strategy 7: If text is too long (>200 chars), try to extract the core question
    if len(question_text) > 200:
        # Look for common question patterns
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

# Clean all parts
print("="*70)
print("Cleaning Part 1")
print("="*70)
part1_cleaned = clean_all_questions('part1_questions.json', 'part1_questions_clean.json')

print("\n" + "="*70)
print("Cleaning Part 2")
print("="*70)
part2_cleaned = clean_all_questions('part2_questions.json', 'part2_questions_clean.json')

print("\n" + "="*70)
print("Cleaning Part 3")
print("="*70)
part3_cleaned = clean_all_questions('part3_questions.json', 'part3_questions_clean.json')

print("\n" + "="*70)
print("SUMMARY")
print("="*70)
print(f"Part 1: {len(part1_cleaned)} questions cleaned")
print(f"Part 2: {len(part2_cleaned)} questions cleaned")
print(f"Part 3: {len(part3_cleaned)} questions cleaned")
print(f"Total: {len(part1_cleaned) + len(part2_cleaned) + len(part3_cleaned)} questions")
print("\nSaved to *_clean.json files")
