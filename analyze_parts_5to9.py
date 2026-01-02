import fitz
import re

# List all parts to extract
parts_to_extract = [
    ("Part 5", "3D 프린터 운용 기능사 필기 책 스캔 2권중2_OCR_05 3D프린터 HW 설정.pdf"),
    ("Part 6", "3D 프린터 운용 기능사 필기 책 스캔 2권중2_OCR_06 출력용 데이터 확정.pdf"),
    ("Part 7", "3D 프린터 운용 기능사 필기 책 스캔 2권중2_OCR_07 제품 출력.pdf"),
    ("Part 8", "3D 프린터 운용 기능사 필기 책 스캔 2권중2_OCR_08 3D프린터 안전관리.pdf"),
    ("Part 9", "3D 프린터 운용 기능사 필기 책 스캔 2권중2_OCR_09 최신기출문제.pdf"),
]

for name, pdf_path in parts_to_extract:
    print(f"\n{'='*70}")
    print(f"{name}: {pdf_path}")
    print('='*70)
    
    try:
        doc = fitz.open(pdf_path)
        print(f"Total Pages: {len(doc)}")
        
        # Count answer markers
        total_answers = 0
        pages_with_answers = []
        
        for i in range(len(doc)):
            page = doc[i]
            text = page.get_text()
            
            # Count answer markers (including OCR variations)
            answer_count = len(re.findall(r'[정성][답][)\s]*[IㅣㅏiI|:)]\s*[①②③④®]', text))
            if answer_count > 0:
                pages_with_answers.append((i+1, answer_count))
                total_answers += answer_count
        
        print(f"Pages with answer markers: {len(pages_with_answers)}")
        if pages_with_answers:
            print(f"First few: {pages_with_answers[:3]}")
            print(f"Last few: {pages_with_answers[-3:]}")
        print(f"Total answer markers: {total_answers}")
        
        # Look for problem section markers
        problem_sections = []
        for i in range(len(doc)):
            page = doc[i]
            text = page.get_text()
            
            if '출제' in text and '예상' in text and '문제' in text:
                problem_sections.append(i+1)
        
        if problem_sections:
            print(f"Problem section markers on pages: {problem_sections[:5]}")
        
    except Exception as e:
        print(f"ERROR: {e}")
