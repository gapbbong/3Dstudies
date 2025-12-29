import fitz
import re

pdf_path = "3D 프린터 운용 기능사 필기 책 스캔 2권중1_OCR_part 2 엔지니어링 모델링.pdf"

def analyze_pdf(path):
    doc = fitz.open(path)
    
    # Inspect Pages 28 and 29 for Section 2
    pages_to_inspect = [28, 29]
    
    for p_num in pages_to_inspect:
        print(f"\n--- Text of Page {p_num} ---")
        text = doc[p_num-1].get_text()
        print(text)
        print("-----------------------------")
        
        # Use the same regex as before
        matches = re.finditer(r"^\s*(?:[◦oO0]?\s*)?(\d+)[. ](.*?)(?=\n|$)", text, re.MULTILINE)
        
        found_on_page = False
        for m in matches:
            num = m.group(1)
            content = m.group(2).strip()
            if len(num) <= 2:
                print(f"[Page {p_num}] No. {num}: {content[:50]}...")
                found_on_page = True
                
        if not found_on_page:
            # Check for '정답' if no numbered questions found, to see if we missed unnumbered ones
            if "정답" in text:
                print(f"[Page {p_num}] (Unnumbered question found via '정답' marker)")
                # Try to print context around '정답'
                idx = text.find("정답")
                print(f"  Context: ...{text[max(0, idx-50):idx]}...")

if __name__ == "__main__":
    analyze_pdf(pdf_path)

if __name__ == "__main__":
    analyze_pdf(pdf_path)
