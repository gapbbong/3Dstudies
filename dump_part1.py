import fitz
import json
import re

def extract_all_part1_questions(pdf_path):
    doc = fitz.open(pdf_path)
    text = ""
    for page in doc:
        text += page.get_text()
    
    # Regex to find questions
    # Pattern: Number (01, 02...) -> Question Text -> Choices -> Answer -> Explanation
    # The text dump showed questions starting around index 3000-6000.
    
    # Let's try a more robust regex based on the observed format.
    # "01 Question..."
    # "① ... ② ... ③ ... ④ ..."
    # "정답 | ..."
    # "해설 | ..." (sometimes "내설" due to OCR error)
    
    questions = []
    
    # Split text by "01", "02" etc. is risky if those numbers appear in text.
    # But looking at the dump: "07 경로를...", "08 작업..."
    # It seems consistent.
    
    # Let's find all occurrences of "digit digit space" that look like question starters.
    # And "정답"
    
    # Strategy: Find all "정답 | X" or "정답 I X" blocks, then look backwards for the question number.
    
    # Regex for Answer block: 정답\s*[|I!l]\s*([①②③④1234])
    answer_pattern = re.compile(r"정답\s*[|I!l]\s*([①②③④1234])")
    
    matches = list(answer_pattern.finditer(text))
    print(f"Found {len(matches)} potential questions based on 'Answer' markers.")
    
    current_pos = 0
    
    for i, match in enumerate(matches):
        answer_start = match.start()
        answer_char = match.group(1)
        
        # Explanation is usually after answer
        explanation_start = match.end()
        # Find next question start or end of text
        next_q_start = len(text)
        if i < len(matches) - 1:
            # The next answer block gives us a hint, but we need the START of the next question.
            # Usually there is a number like "09" before the next answer.
            pass
            
        # Let's try to find the Question Number *before* the answer.
        # We look backwards from answer_start for a pattern like "\n\d{2}"
        
        # This is tricky. Let's try a different approach.
        # Split by "정답" might be easier.
        pass

    # Alternative: Just dump the text again with indices to manually verify if script fails.
    # But I need to automate this.
    
    # Let's try to extract based on the "01", "02" pattern we saw.
    # The text had: "07 경로를...", "08 작업..."
    # It seems questions are numbered 01 to maybe 20?
    
    extracted_questions = []
    
    # We will search for each number 01, 02, ... sequentially.
    for num in range(1, 30):
        q_num_str = f"{num:02d}"
        # Search for "\n01 " or just "01 "
        # The dump showed "07 " at start of line.
        
        pattern = re.compile(f"(^|\\n){q_num_str}\\s+(.+?)(?=(?:^|\\n){num+1:02d}\\s+|정답)", re.DOTALL)
        # This is hard because choices and answer are in between.
        
    # Let's go with the manual dump inspection approach again but for the WHOLE file, 
    # then I will write the JSON manually. It's safer and higher quality than a flaky script.
    # I will dump the text specifically looking for the question area.
    
    print(text)

if __name__ == "__main__":
    path = "3D 프린터 운용 기능사 필기 책 스캔 2권중1_OCR_part 1 넙스 모델링.pdf"
    extract_all_part1_questions(path)
