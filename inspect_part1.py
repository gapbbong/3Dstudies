import fitz
import json
import re

def extract_part1_data(pdf_path):
    doc = fitz.open(pdf_path)
    text = ""
    for page in doc:
        text += page.get_text()
    
    # 1. Extract Theory (Simple extraction for now, can be refined)
    # Looking for "Part 1" or similar headers to start, but for now taking a chunk.
    # Actually, let's just take the first 2000 characters as a placeholder for theory if we can't parse perfectly.
    # Better: Look for "1. 넙스 모델링" etc.
    
    theory_content = "1. 넙스(NURBS) 모델링의 이해\n"
    # Attempt to find some key sections.
    # This is a heuristic.
    
    # 2. Extract Questions
    # Looking for patterns like "01", "02" followed by question text and choices.
    questions = []
    # Regex for questions: Number, Question, Choices, Answer, Explanation
    # This is tricky without visual layout, but let's try a simple pattern.
    
    # For this task, since I can't easily debug complex extraction in one go, 
    # I will create a dummy Part 1 with placeholders if extraction fails, 
    # OR I will try to read the file first to understand structure. 
    # But the user wants "Part 1 filled".
    
    # Let's try to find "출제예상문제" section.
    
    return text

if __name__ == "__main__":
    path = "3D 프린터 운용 기능사 필기 책 스캔 2권중1_OCR_part 1 넙스 모델링.pdf"
    try:
        content = extract_part1_data(path)
        print(content[:2000]) # Print first 2000 chars to inspect
    except Exception as e:
        print(f"Error: {e}")
