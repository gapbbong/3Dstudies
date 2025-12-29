import fitz
import os

pdf_path = "D:/App/3d Studies/3D 프린터 운용 기능사 필기 책 스캔 2권중1_OCR_part 2 엔지니어링 모델링.pdf"
page_num = 7  # 0-indexed, so Page 8 is index 7
output_dir = "D:/App/3d Studies/images/extracted_page8"

if not os.path.exists(output_dir):
    os.makedirs(output_dir)

doc = fitz.open(pdf_path)
page = doc[page_num]

# 1. Print full text
print("--- Full Text of Page 7 ---")
print(page.get_text())
print("---------------------------")

# 2. Extract images
image_list = page.get_images(full=True)
print(f"Found {len(image_list)} images on page 7.")

for img_index, img in enumerate(image_list):
    xref = img[0]
    base_image = doc.extract_image(xref)
    image_bytes = base_image["image"]
    image_ext = base_image["ext"]
    image_filename = f"{output_dir}/img_{img_index}.{image_ext}"
    
    with open(image_filename, "wb") as f:
        f.write(image_bytes)
    print(f"Saved {image_filename}")
