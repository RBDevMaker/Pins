"""
Generate the PIN_IMAGE_MAP entries for all pins that have images.
"""
import os
import re
from pathlib import Path

EXTRACTED_DIR = Path("./extracted_images")

def filename_to_id(filename):
    stem = Path(filename).stem
    stem = re.sub(r'_\d+$', '', stem)
    return stem.replace('_', '-')

def main():
    files = sorted(os.listdir(EXTRACTED_DIR))
    seen_ids = set()
    
    print("const PIN_IMAGE_MAP: Record<string, string> = {")
    for f in files:
        stem = Path(f).stem
        # Skip duplicates (_1, _2 variants)
        base_stem = re.sub(r'_\d+$', '', stem)
        pin_id = base_stem.replace('_', '-')
        if pin_id in seen_ids:
            continue
        seen_ids.add(pin_id)
        print(f"  '{pin_id}': '{f}',")
    print("};")

if __name__ == "__main__":
    main()
