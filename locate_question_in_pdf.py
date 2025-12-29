import fitz  # PyMuPDF

pdf_paths = [
    "D:/App/3d Studies/3D 프린터 운용 기능사 필기 책 스캔 2권중1_OCR_part 3 3D프린터 SW 설정.pdf",
    "D:/App/3d Studies/3D 프린터 운용 기능사 필기 책 스캔 2권중1_OCR_part 2 엔지니어링 모델링.pdf"
]
search_text = "한 화면을"

for pdf_path in pdf_paths:
    print(f"Searching in {pdf_path}...")
    doc = fitz.open(pdf_path)
    for page_num, page in enumerate(doc):
        text = page.get_text()
        if search_text in text:
            print(f"Found '{search_text}' on page {page_num + 1} of {pdf_path}")
            print("-" * 20)
            print(text[:300])
            print("-" * 20)
            break
    else:
        print("Not found in this file.")
