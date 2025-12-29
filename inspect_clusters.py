import fitz

pdf_path = "3D 프린터 운용 기능사 필기 책 스캔 2권중1_OCR_part 1 넙스 모델링.pdf"
doc = fitz.open(pdf_path)

pages_to_check = [12, 13, 19, 20, 32, 33, 34] # 0-indexed (Page 13 is index 12)

for i in pages_to_check:
    if i < len(doc):
        print(f"\n--- Page {i+1} ---")
        print(doc[i].get_text()[:1000]) # Print first 1000 chars
