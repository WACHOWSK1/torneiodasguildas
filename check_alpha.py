from PIL import Image
import sys

def check_alpha(image_path):
    try:
        img = Image.open(image_path)
        print(f"{image_path}: mode={img.mode}, format={img.format}")
        if img.mode in ('RGBA', 'LA') or (img.mode == 'P' and 'transparency' in img.info):
            print(f"{image_path} HAS transparency.")
        else:
            print(f"{image_path} does NOT have transparency.")
    except Exception as e:
        print(f"Error checking {image_path}: {e}")

check_alpha(sys.argv[1])
check_alpha(sys.argv[2])
