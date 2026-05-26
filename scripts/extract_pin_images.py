"""
Extract labeled images from DAR catalog PDFs and upload to S3.

This version uses a wider search area and smarter label detection
for catalog-style PDFs with complex layouts.

Usage:
  source .venv/bin/activate
  python scripts/extract_pin_images.py pdfs/DARInsigniaStoreCatalogJuly2022.pdf

Images are saved locally to ./extracted_images/ and optionally uploaded to S3.
"""

import sys
import os
import re
import fitz  # PyMuPDF
import boto3
from pathlib import Path

# --- Configuration ---
S3_BUCKET = "pins1776"
S3_PREFIX = "pin-images/"
OUTPUT_DIR = Path("./extracted_images")
UPLOAD_TO_S3 = True  # Set to True when ready to upload

# Minimum image size in bytes to skip tiny icons/decorations
MIN_IMAGE_BYTES = 2000
# Minimum image dimensions (pixels)
MIN_IMAGE_DIM = 40


def sanitize_filename(text: str) -> str:
    """Turn a label into a safe filename."""
    text = text.strip().lower()
    text = re.sub(r'[^\w\s-]', '', text)
    text = re.sub(r'[\s]+', '_', text)
    return text[:80]


def get_page_text_blocks(page):
    """Get all text blocks on a page with their bounding boxes."""
    blocks = page.get_text("dict", flags=fitz.TEXT_PRESERVE_WHITESPACE)["blocks"]
    text_blocks = []
    for block in blocks:
        if block["type"] == 0:  # text block
            text = ""
            for line in block["lines"]:
                for span in line["spans"]:
                    text += span["text"]
                text += "\n"
            text = text.strip()
            if text and len(text) > 1:
                text_blocks.append({
                    "text": text,
                    "rect": fitz.Rect(block["bbox"]),
                })
    return text_blocks


def find_best_label(image_rect, text_blocks, page_width):
    """
    Find the best label for an image by looking at nearby text blocks.
    Prioritizes:
    1. Text directly below the image (captions)
    2. Text directly above the image (titles)
    3. Text to the right (catalog item names)
    """
    candidates = []

    for block in text_blocks:
        text = block["text"].strip()
        rect = block["rect"]

        # Skip very long text (paragraphs, not labels)
        if len(text) > 100:
            continue
        # Skip very short text (single chars, page numbers)
        if len(text) < 3:
            continue
        # Skip text that's just numbers
        if re.match(r'^[\d\s\.\$,]+$', text):
            continue

        # Calculate distances
        # Below image
        if rect.y0 >= image_rect.y1 - 5 and rect.y0 <= image_rect.y1 + 80:
            h_overlap = max(0, min(rect.x1, image_rect.x1) - max(rect.x0, image_rect.x0))
            if h_overlap > 0 or abs(rect.x0 - image_rect.x0) < 50:
                candidates.append(("below", text, rect.y0 - image_rect.y1))

        # Above image
        if rect.y1 <= image_rect.y0 + 5 and rect.y1 >= image_rect.y0 - 60:
            h_overlap = max(0, min(rect.x1, image_rect.x1) - max(rect.x0, image_rect.x0))
            if h_overlap > 0 or abs(rect.x0 - image_rect.x0) < 50:
                candidates.append(("above", text, image_rect.y0 - rect.y1))

        # Right of image
        if rect.x0 >= image_rect.x1 - 5 and rect.x0 <= image_rect.x1 + 100:
            v_overlap = max(0, min(rect.y1, image_rect.y1) - max(rect.y0, image_rect.y0))
            if v_overlap > 0:
                candidates.append(("right", text, rect.x0 - image_rect.x1))

    if not candidates:
        return ""

    # Prioritize: below > above > right, then by distance
    priority = {"below": 0, "above": 1, "right": 2}
    candidates.sort(key=lambda c: (priority[c[0]], c[2]))

    best_text = candidates[0][1]
    # Clean up: take first meaningful line
    lines = [l.strip() for l in best_text.split('\n') if l.strip()]
    if lines:
        return lines[0]
    return best_text


def extract_images_from_pdf(pdf_path: str):
    """Extract all images from a PDF with their labels."""
    doc = fitz.open(pdf_path)
    pdf_name = Path(pdf_path).stem
    extracted = []
    seen_xrefs = set()

    print(f"\nProcessing: {pdf_path}")
    print(f"  Pages: {len(doc)}")

    for page_num in range(len(doc)):
        page = doc[page_num]
        page_width = page.rect.width
        text_blocks = get_page_text_blocks(page)
        image_list = page.get_images(full=True)

        for img_index, img_info in enumerate(image_list):
            xref = img_info[0]

            # Skip duplicates (same image referenced multiple times)
            if xref in seen_xrefs:
                continue
            seen_xrefs.add(xref)

            # Get image data
            try:
                base_image = doc.extract_image(xref)
            except Exception:
                continue
            if not base_image:
                continue

            image_bytes = base_image["image"]
            image_ext = base_image["ext"]
            img_width = base_image.get("width", 0)
            img_height = base_image.get("height", 0)

            # Skip very small images (icons/decorations)
            if len(image_bytes) < MIN_IMAGE_BYTES:
                continue
            if img_width < MIN_IMAGE_DIM or img_height < MIN_IMAGE_DIM:
                continue

            # Find where this image is on the page
            image_rects = page.get_image_rects(xref)
            if not image_rects:
                continue

            image_rect = image_rects[0]

            # Skip images that are full-page backgrounds
            if (image_rect.width > page_width * 0.9 and
                image_rect.height > page.rect.height * 0.9):
                continue

            # Find the label
            label = find_best_label(image_rect, text_blocks, page_width)

            if label:
                filename = f"{sanitize_filename(label)}.{image_ext}"
            else:
                filename = f"{pdf_name}_page{page_num + 1}_img{img_index + 1}.{image_ext}"

            extracted.append({
                "filename": filename,
                "label": label or "(no label found)",
                "bytes": image_bytes,
                "page": page_num + 1,
                "size": f"{img_width}x{img_height}",
            })

    doc.close()
    return extracted


def save_and_upload(extracted_images: list):
    """Save images locally and optionally upload to S3."""
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    s3_client = None
    if UPLOAD_TO_S3:
        s3_client = boto3.client("s3", region_name="us-east-1")

    print(f"\n  Saving {len(extracted_images)} images to {OUTPUT_DIR}/")

    for img in extracted_images:
        # Save locally
        local_path = OUTPUT_DIR / img["filename"]

        # Handle duplicate filenames
        counter = 1
        while local_path.exists():
            stem = Path(img["filename"]).stem
            ext = Path(img["filename"]).suffix
            local_path = OUTPUT_DIR / f"{stem}_{counter}{ext}"
            counter += 1

        local_path.write_bytes(img["bytes"])
        print(f"    Page {img['page']} [{img['size']}]: {img['label']} -> {local_path.name}")

        # Upload to S3
        if s3_client:
            s3_key = f"{S3_PREFIX}{local_path.name}"
            try:
                s3_client.put_object(
                    Bucket=S3_BUCKET,
                    Key=s3_key,
                    Body=img["bytes"],
                    ContentType=f"image/{local_path.suffix.lstrip('.')}",
                    Metadata={"label": img["label"]},
                )
                print(f"      -> s3://{S3_BUCKET}/{s3_key}")
            except Exception as e:
                print(f"      -> S3 upload failed: {e}")


def main():
    if len(sys.argv) < 2:
        print("Usage: python extract_pin_images.py <pdf_file> [pdf_file2 ...]")
        print("\nSet UPLOAD_TO_S3 = True in the script to upload to S3.")
        sys.exit(1)

    all_images = []
    for pdf_path in sys.argv[1:]:
        if not os.path.exists(pdf_path):
            print(f"  File not found: {pdf_path}")
            continue
        images = extract_images_from_pdf(pdf_path)
        all_images.extend(images)

    if all_images:
        save_and_upload(all_images)
        print(f"\nDone! {len(all_images)} images extracted to {OUTPUT_DIR}/")
        if not UPLOAD_TO_S3:
            print("Set UPLOAD_TO_S3 = True and re-run to upload to S3.")
    else:
        print("\nNo images found in the provided PDFs.")


if __name__ == "__main__":
    main()
