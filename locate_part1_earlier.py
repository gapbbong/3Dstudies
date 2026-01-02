import fitz

def extract_earlier_questions(pdf_path):
    doc = fitz.open(pdf_path)
    text = ""
    for page in doc:
        text += page.get_text()
    
    # "출제예상문제" was at 6084. Let's look at 3000-6100.
    print(text[3000:6100])

if __name__ == "__main__":
    path = "3D 프린터 운용 기능사 필기 책 스캔 2권중1_OCR_part 1 넙스 모델링.pdf"
    extract_earlier_questions(path)
