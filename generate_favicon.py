from PIL import Image, ImageDraw

def create_favicon():
    img = Image.new('RGB', (32, 32), color = (52, 152, 219)) # Blue background
    d = ImageDraw.Draw(img)
    d.text((10,10), "3D", fill=(255,255,255))
    img.save('favicon.ico')

if __name__ == "__main__":
    create_favicon()
