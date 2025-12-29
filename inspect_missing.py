import fitz
import re

pdf_path = "3D 프린터 운용 기능사 필기 책 스캔 2권중1_OCR_part 2 엔지니어링 모델링.pdf"

def inspect_problem_pages():
    doc = fitz.open(pdf_path)
    
    # Pages with missing questions
    problem_pages = [17, 19, 29, 36]
    
    for page_num in problem_pages:
        page = doc[page_num-1]
        text = page.get_text()
        
        print(f"\n{'='*70}")
        print(f"PAGE {page_num}")
        print('='*70)
        
        # Find all lines with ①②③④ (choices)
        lines = text.split('\n')
        choice_lines = []
        for i, line in enumerate(lines):
            if any(marker in line for marker in ['①', '②', '③', '④']):
                choice_lines.append((i, line))
        
        print(f"\nFound {len(choice_lines)} lines with choice markers")
        
        # Find answer patterns
        answer_patterns = [
            (r'정답\s*[IㅣㅏiI|:)]\s*[①②③④]', '정답'),
            (r'성답\s*[IㅣㅏiI|:)]\s*[①②③④]', '성답'),
            (r'답\s*[IㅣㅏiI|:)]\s*[①②③④]', '답 (alone)'),
        ]
        
        print(f"\nAnswer markers:")
        for pattern, name in answer_patterns:
            matches = list(re.finditer(pattern, text))
            if matches:
                print(f"  {name}: {len(matches)} found")
                for m in matches:
                    start = max(0, m.start()-30)
                    end = min(len(text), m.end()+20)
                    context = text[start:end].replace('\n', ' ')
                    print(f"    ...{context}...")
        
        # Look for question numbers
        print(f"\nQuestion numbers:")
        number_pattern = r'^\s*(\d+)[.\s]'
        for i, line in enumerate(lines[:50]):  # First 50 lines
            match = re.match(number_pattern, line)
            if match and len(match.group(1)) <= 2:
                print(f"  Line {i}: {line[:60]}")

if __name__ == "__main__":
    inspect_problem_pages()
