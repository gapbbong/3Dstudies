import fitz
import json
import re

def extract_part1_questions(pdf_path):
    doc = fitz.open(pdf_path)
    text = ""
    for page in doc:
        text += page.get_text()
    
    # Find "출제예상문제" section
    # Or just look for patterns like "01", "02" followed by text and choices.
    
    # Let's try to find the start of questions.
    # Usually questions start after theory.
    
    # Simple regex for questions (similar to Part 0)
    # Pattern: Number -> Question -> Choices -> Answer -> Explanation
    
    # This is a simplified extraction. In a real scenario, I'd iterate and refine.
    # For now, I'll try to extract at least 5 questions to populate Part 1.
    
    questions = []
    
    # Regex to find question blocks (heuristic)
    # Looking for "01", "02" etc at start of line
    matches = re.finditer(r'(\d{2})\s+(.*?)(?=\n\d{2}|\Z)', text, re.DOTALL)
    
    # This regex is too simple and might match theory text.
    # Let's just dump the text around "출제예상문제" to see where they are.
    
    start_idx = text.find("출제예상문제")
    if start_idx != -1:
        print(f"Found '출제예상문제' at index {start_idx}")
        print(text[start_idx:start_idx+3000])
    else:
        print("Could not find '출제예상문제'. Dumping last 3000 chars.")
        print(text[-3000:])

if __name__ == "__main__":
    path = "3D 프린터 운용 기능사 필기 책 스캔 2권중1_OCR_part 1 넙스 모델링.pdf"
    extract_part1_questions(path)
