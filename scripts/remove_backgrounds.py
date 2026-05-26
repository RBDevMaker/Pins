"""
Remove backgrounds from pin images using AI (rembg).
Converts all images to PNG with transparent backgrounds.

Usage:
  source .venv/bin/activate
  python scripts/remove_backgrounds.py
"""

import os
from pathlib import Path
from rembg import remove
from PIL import Image
import io

INPUT_DIR = Path("./src/public/pin-images")
OUTPUT_DIR = Path("./src/public/pin-images")  # overwrite in place with PNGs

# Skip these (not actual pin images)
SKIP_PREFIXES = ['DARInsignia', 'INS-1003', 'ordering', 'insignia_committee',
                 'jewelry', 'spotlight', 'northeast_regents', 'celebrate_',
                 'honor_your', 'new_membership', 'new_service', 'new_commemorative',
                 'chapter_pins', 'chapter_anniversary', 'dar_insignia_store']


def should_skip(filename):
    for prefix in SKIP_PREFIXES:
        if filename.startswith(prefix):
            return True
    return False


def main():
    files = sorted(os.listdir(INPUT_DIR))
    pin_files = [f for f in files if not should_skip(f) and f.lower().endswith(('.jpeg', '.jpg', '.png', '.webp'))]

    print(f"Processing {len(pin_files)} pin images...")

    for i, filename in enumerate(pin_files):
        input_path = INPUT_DIR / filename
        # Output as PNG for transparency
        output_name = Path(filename).stem + '.png'
        output_path = OUTPUT_DIR / output_name

        # Skip if already processed (PNG exists and is newer)
        if output_path.exists() and output_path.stat().st_mtime > input_path.stat().st_mtime:
            continue

        try:
            with open(input_path, 'rb') as f:
                input_data = f.read()

            output_data = remove(input_data)

            # Save as PNG
            with open(output_path, 'wb') as f:
                f.write(output_data)

            # Remove original if it was jpeg/jpg (now we have the png)
            if filename.lower().endswith(('.jpeg', '.jpg')) and output_path.exists():
                os.remove(input_path)

            print(f"  [{i+1}/{len(pin_files)}] {filename} -> {output_name}")
        except Exception as e:
            print(f"  [{i+1}/{len(pin_files)}] FAILED {filename}: {e}")

    print("\nDone! All pin images now have transparent backgrounds.")


if __name__ == "__main__":
    main()
