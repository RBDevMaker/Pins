"""
Generate pin entries from extracted image filenames.
Outputs TypeScript pin definitions to add to pinRules.ts
"""
import os
import re
from pathlib import Path

EXTRACTED_DIR = Path("./extracted_images")

# Existing pin IDs (already in pinRules.ts)
EXISTING_IDS = {
    'dar-insignia', 'chapter-regent', 'chapter-vice-regent', 'chapter-chaplain',
    'chapter-recording-secretary', 'chapter-treasurer', 'chapter-registrar',
    'chapter-historian', 'chapter-librarian', 'state-regent', 'state-vice-regent',
    'state-officer', 'national-officer', 'ancestor-bar', 'supplemental-ancestor-bar',
    'patriot-pin', 'founders-pin', 'sustaining-supporter', 'century-club',
    'service-star', 'outstanding-volunteer', 'community-service', 'dar-school-pin',
    'conservation-pin', 'presidents-general-pin', 'daughters-of-liberty',
    'womens-issues', 'american-heritage', 'national-defense', 'constitution-week',
    'flag-of-usa', 'life-membership', '25-year-pin', '50-year-pin',
}

# Skip these (not actual pins - decorative, headers, duplicates)
SKIP_PATTERNS = [
    r'^DARInsigniaStore', r'^INS-', r'^dar_insignia_store', r'^celebrate_',
    r'^honor_your', r'^ordering_', r'^insignia_committee', r'^jewelry_',
    r'^spotlight', r'^northeast_', r'^pin\.', r'^chapter_pins', r'^chapter_anniversary',
    r'^insignia_is', r'^americanismdar', r'^required', r'^national_society_daughters',
]

# Category detection
def detect_category(name):
    lower = name.lower()
    if 'centennial' in lower or 'state' in lower:
        return 'other'  # state pins
    if 'officer' in lower or 'regent' in lower or 'chair' in lower or 'parliamentarian' in lower:
        return 'officer'
    if 'ancestor' in lower or 'patriot' in lower or 'founder' in lower or 'legacy' in lower:
        return 'ancestor'
    if 'service' in lower or 'volunteer' in lower or 'conservation' in lower or 'school' in lower:
        return 'service'
    if 'member' in lower or 'insignia' in lower or 'life' in lower or 'junior' in lower:
        return 'membership'
    if 'honorary' in lower or 'heritage' in lower or 'liberty' in lower or 'defense' in lower:
        return 'honorary'
    if 'friend' in lower or 'donor' in lower or 'donation' in lower or 'giving' in lower or 'club' in lower:
        return 'service'
    if 'commemorative' in lower or 'war' in lower or 'battle' in lower or 'treaty' in lower:
        return 'honorary'
    return 'other'


def filename_to_name(filename):
    """Convert filename to display name."""
    stem = Path(filename).stem
    # Remove trailing _1, _2 etc (duplicates)
    stem = re.sub(r'_\d+$', '', stem)
    # Convert underscores to spaces and title case
    name = stem.replace('_', ' ').replace('-', ' ')
    # Title case but preserve acronyms
    words = name.split()
    result = []
    for w in words:
        if w.upper() in ('DAR', 'NSDAR', 'USA', 'CAR', 'GEP'):
            result.append(w.upper())
        else:
            result.append(w.capitalize())
    return ' '.join(result)


def filename_to_id(filename):
    """Convert filename to a pin ID."""
    stem = Path(filename).stem
    stem = re.sub(r'_\d+$', '', stem)
    return stem.replace('_', '-')


def main():
    files = sorted(os.listdir(EXTRACTED_DIR))
    
    # Filter out non-pin images
    pin_files = []
    seen_stems = set()
    for f in files:
        skip = False
        for pattern in SKIP_PATTERNS:
            if re.match(pattern, f):
                skip = True
                break
        if skip:
            continue
        # Skip numbered-only files
        stem = Path(f).stem
        if re.match(r'^[\d_]+$', stem):
            continue
        # Skip very short names (likely fragments)
        if len(stem) < 3:
            continue
        # Deduplicate (skip _1, _2 variants)
        base_stem = re.sub(r'_\d+$', '', stem)
        if base_stem in seen_stems:
            continue
        seen_stems.add(base_stem)
        
        # Skip if already exists
        pin_id = filename_to_id(f)
        if pin_id in EXISTING_IDS:
            continue
            
        pin_files.append(f)
    
    print(f"  // === ADDITIONAL PINS FROM CATALOG ({len(pin_files)} pins) ===")
    
    for f in pin_files:
        pin_id = filename_to_id(f)
        name = filename_to_name(f)
        category = detect_category(name)
        
        print(f"""  {{
    id: '{pin_id}',
    name: '{name}',
    category: '{category}',
    widthInches: 0.375,
    heightInches: 0.375,
    allowedRows: [1, 2, 3, 4],
    allowedSide: 'any',
    requiredSpacingInches: 0.0625,
    canStack: false,
    mandatory: false,
    manualCitation: 'DAR Insignia Store Catalog, July 2022',
  }},""")


if __name__ == "__main__":
    main()
