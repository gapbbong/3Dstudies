import fitz
import re

pdfs = [
    ("Part 1", "3D 프린터 운용 기능사 필기 책 스캔 2권중1_OCR_part 1 넙스 모델링.pdf"),
    ("Part 3", "3D 프린터 운용 기능사 필기 책 스캔 2권중1_OCR_part 3 3D프린터 SW 설정.pdf")
]

for name, pdf_path in pdfs:
    print(f"\n{'='*70}")
    print(f"{name}: {pdf_path}")
    print('='*70)
    
    doc = fitz.open(pdf_path)
    print(f"Total Pages: {len(doc)}")
    
    # Look for "출제 예상 문제" or similar markers
    sections = []
    for i in range(len(doc)):
        page = doc[i]
        text = page.get_text()
        
        if '출제' in text or '예상' in text or '문제' in text:
            # Check if this looks like a problem section start
            if '출제 예상 문제' in text or '출제예상문제' in text:
                sections.append(i+1)
                print(f"  Found '출제 예상 문제' on page {i+1}")
    
    if sections:
        print(f"\nProblem sections found on pages: {sections}")
    else:
        print("\nNo clear problem section markers found")
        print("Checking for '정답' markers...")
        
        # Count pages with answers
        pages_with_answers = []
        for i in range(len(doc)):
            page = doc[i]
            text = page.get_text()
            
            # Count answer markers
            answer_count = len(re.findall(r'[정성][답][)\s]*[IㅣㅏiI|:)]\s*[①②③④®]', text))
            if answer_count > 0:
                pages_with_answers.append((i+1, answer_count))
        
        if pages_with_answers:
            print(f"Pages with answer markers: {len(pages_with_answers)}")
            print(f"First few: {pages_with_answers[:5]}")
            print(f"Last few: {pages_with_answers[-5:]}")
            total_answers = sum(count for _, count in pages_with_answers)
            print(f"Total answer markers: {total_answers}")
