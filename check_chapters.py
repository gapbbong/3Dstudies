import fitz
import os

def check_pdf_chapters(filename):
    print(f"Checking {filename}...")
    try:
        doc = fitz.open(filename)
        toc = doc.get_toc()
        if not toc:
            print("  No Table of Contents found.")
        else:
            print(f"  Found {len(toc)} entries in TOC.")
            # Print top-level items (level 1)
            for item in toc:
                if item[0] == 1:
                    print(f"  - {item[1]}")
        doc.close()
    except Exception as e:
        print(f"  Error: {e}")

files = [
    "3D 프린터 운용 기능사 필기 책 스캔 2권중1_원본.pdf",
    "3D 프린터 운용 기능사 필기 책 스캔 2권중2_원본.pdf"
]

for f in files:
    if os.path.exists(f):
        check_pdf_chapters(f)
    else:
        print(f"File not found: {f}")
