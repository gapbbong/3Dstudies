import os
from PIL import Image

image_dir = "D:/App/3d Studies/images/extracted_page8"
files = os.listdir(image_dir)

print(f"Checking images in {image_dir}...")
for f in files:
    if f.lower().endswith(('.png', '.jpg', '.jpeg')):
        path = os.path.join(image_dir, f)
        try:
            with Image.open(path) as img:
                print(f"{f}: {img.size} (Width x Height)")
        except Exception as e:
            print(f"Error reading {f}: {e}")
