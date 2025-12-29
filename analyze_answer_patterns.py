import fitz
import re

pdf_path = "3D 프린터 운용 기능사 필기 책 스캔 2권중1_OCR_part 2 엔지니어링 모델링.pdf"

def analyze_answer_patterns():
    doc = fitz.open(pdf_path)
    
    # Check pages across all sections
    for page_num in [16, 17, 18, 28, 29, 30, 35, 36, 40, 41, 48]:
        page = doc[page_num-1]
        text = page.get_text()
        
        print(f"\n=== Page {page_num} ===")
        
        # Find all variations of "정답"
        patterns = [
            r'정답',
            r'답',
            r'[Aa]nswer',
            r'정 답',
            r'[IㅣㅏI|:]\s*[①②③④]'
        ]
        
        for pattern in patterns:
            matches = list(re.finditer(pattern, text, re.IGNORECASE))
            if matches:
                print(f"Pattern '{pattern}': {len(matches)} matches")
                for m in matches[:3]:  # Show first 3
                    start = max(0, m.start()-20)
                    end = min(len(text), m.end()+30)
                    context = text[start:end].replace('\n', ' ')
                    print(f"  ...{context}...")

if __name__ == "__main__":
    analyze_answer_patterns()
