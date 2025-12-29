import fitz
import re

pdf_path = "3D 프린터 운용 기능사 필기 책 스캔 2권중1_OCR_part 1 넙스 모델링.pdf"
doc = fitz.open(pdf_path)

print(f"Scanning {pdf_path} ({len(doc)} pages)...")

# Pattern for question numbers (e.g., "1.", "01.", "1 .")
q_pattern = re.compile(r'^\s*(\d+)\s*[.．]', re.MULTILINE)
header_pattern = re.compile(r'출제\s*예상\s*문제', re.MULTILINE)

clusters = []
current_cluster = []
last_page = -1

for i, page in enumerate(doc):
    text = page.get_text()
    
    # Check for header
    if header_pattern.search(text):
        print(f"[Page {i+1}] Found '출제예상문제' Header")
        if current_cluster:
            clusters.append(current_cluster)
            current_cluster = []
            
    # Find question numbers
    matches = q_pattern.findall(text)
    if matches:
        # Filter out page numbers or other noise (simple heuristic: must be < 100)
        nums = [int(m) for m in matches if int(m) < 100]
        if nums:
            # If gap in pages, assume new cluster? No, questions might span pages.
            # But if we see "1" again, it's definitely a new cluster.
            if 1 in nums and current_cluster and current_cluster[-1]['max_num'] > 1:
                 clusters.append(current_cluster)
                 current_cluster = []
            
            if not current_cluster:
                current_cluster = {'start_page': i+1, 'end_page': i+1, 'count': 0, 'max_num': 0, 'nums': []}
            
            current_cluster['end_page'] = i+1
            current_cluster['nums'].extend(nums)
            current_cluster['max_num'] = max(current_cluster['max_num'], max(nums))
            current_cluster['count'] = len(set(current_cluster['nums'])) # Unique count

if current_cluster:
    clusters.append(current_cluster)

print("\n--- Found Clusters ---")
for idx, c in enumerate(clusters):
    print(f"Cluster {idx+1}: Pages {c['start_page']}-{c['end_page']}, Count: {c['count']}, Max Num: {c['max_num']}")
    print(f"  Numbers found: {sorted(list(set(c['nums'])))}")
