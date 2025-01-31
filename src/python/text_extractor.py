import sys
import fitz
from flask import json
import pytesseract
from PIL import Image
import io
import os
pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"


def process_pdfs(files):
    extracted_files = []

    # Output directories
    TEXT_DIR = "extracted_texts"
    IMAGE_DIR = "extracted_images"
    os.makedirs(TEXT_DIR, exist_ok=True)
    os.makedirs(IMAGE_DIR, exist_ok=True)
    
    for PDF_FILE in files:
        # Extracted file names
        base_name = os.path.splitext(os.path.basename(PDF_FILE))[0]
        text_output_path = os.path.join(TEXT_DIR, f"{base_name}.txt")
        image_output_dir = os.path.join(IMAGE_DIR, base_name)
        os.makedirs(image_output_dir, exist_ok=True)

        full_text = ""
        image_filenames=[]
        #pdf extract
        with fitz.open(PDF_FILE) as pdf:
            for i, page in enumerate(pdf):
                # extract text from pdfs
                text = page.get_text("text")
                full_text += f"\n--- Page {i + 1} ---\n{text}\n"

        # Extract images
                images = page.get_images(full=True)
                for img_index, img in enumerate(images):
                    xref = img[0]
                    base_image = pdf.extract_image(xref)
                    image_bytes = base_image["image"]
                    img_ext = base_image["ext"]
                    img_filename = os.path.join(image_output_dir, f"page_{i + 1}_image_{img_index + 1}.{img_ext}")
                    image_filenames.append(img_filename)

                    # Sve mekata
                    with open(img_filename, "wb") as img_file:
                        img_file.write(image_bytes)

                    # OCR to extract images
                    img = Image.open(io.BytesIO(image_bytes))
                    ocr_text = pytesseract.image_to_string(img, lang='eng')
                    full_text += f"\n--- Page {i + 1}, Image {img_index + 1} ---\n{ocr_text}\n"


        with open(text_output_path, "w", encoding="utf-8") as f:
            f.write(full_text)

        extracted_files.append({
            'text_dir':text_output_path,
            'text': full_text,
            'image_dir': image_output_dir,
            'image_filenames':image_filenames
        })
    
    return json.dumps(extracted_files)
    


if __name__ == "__main__":
    files = sys.argv[1:]

    print(process_pdfs(files))


