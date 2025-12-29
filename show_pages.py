import fitz
import re

pdf_path = "3D 프린터 운용 기능사 필기 책 스캔 2권중1_OCR_part 2 엔지니어링 모델링.pdf"

def show_full_text(page_num):
    doc = fitz.open(pdf_path)
    page = doc[page_num-1]
    text = page.get_text()
    
    print(f"\n{'='*70}")
    print(f"FULL TEXT OF PAGE {page_num}")
    print('='*70)
    print(text)
    print('='*70)

if __name__ == "__main__":
    # Show pages with missing answers
    for page in [29, 36]:
        show_full_text(page)
