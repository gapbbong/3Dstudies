import fitz
import re
import json

pdf_path = "3D 프린터 운용 기능사 필기 책 스캔 2권중1_OCR_part 2 엔지니어링 모델링.pdf"

def count_answers_per_page():
    doc = fitz.open(pdf_path)
    
    # Expected counts per section
    expected = {
        "Section 1 (16-27)": 18,
        "Section 2 (28-34)": 6,
        "Section 3 (35-39)": 4,
        "Section 4 (40-47)": 6,
        "Section 5 (48)": 2
    }
    
    print("=== Answer Pattern Analysis ===\n")
    
    # Define page ranges for each section
    sections = [
        ("Section 1", 16, 27, 18),
        ("Section 2", 28, 34, 6),
        ("Section 3", 35, 39, 4),
        ("Section 4", 40, 47, 6),
        ("Section 5", 48, 48, 2)
    ]
    
    for section_name, start, end, expected_count in sections:
        print(f"\n{section_name} (Pages {start}-{end}): Expected {expected_count} questions")
        print("-" * 60)
        
        total_found = 0
        for page_num in range(start, end+1):
            page = doc[page_num-1]
            text = page.get_text()
            
            # Try multiple patterns
            patterns = {
                '정답': r'정답\s*[IㅣㅏiI|:)]\s*[①②③④]',
                '성답': r'성답\s*[IㅣㅏiI|:)]\s*[①②③④]',
                'Combined': r'[정성][답][)\s]*[IㅣㅏiI|:)]\s*[①②③④]',
            }
            
            counts = {}
            for name, pattern in patterns.items():
                matches = re.findall(pattern, text)
                counts[name] = len(matches)
            
            max_count = max(counts.values())
            if max_count > 0:
                print(f"  Page {page_num}: {max_count} answers", end="")
                if counts['성답'] > 0:
                    print(f" (includes {counts['성답']} '성답' OCR errors)", end="")
                print()
                total_found += max_count
        
        print(f"  Total found: {total_found}")
        if total_found < expected_count:
            print(f"  ⚠️  MISSING: {expected_count - total_found} questions")
        elif total_found > expected_count:
            print(f"  ⚠️  EXTRA: {total_found - expected_count} (possible false positives)")

if __name__ == "__main__":
    count_answers_per_page()
