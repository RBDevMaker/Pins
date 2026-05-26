"""
Build the complete pinRules.ts file with all pins from the catalog.
"""
import os
import re
from pathlib import Path

EXTRACTED_DIR = Path("./extracted_images")
OUTPUT = Path("./src/data/pinRules.ts")

# Skip these filenames (not actual pins)
SKIP_PATTERNS = [
    r'^DARInsigniaStore', r'^INS-', r'^dar_insignia_store', r'^celebrate_',
    r'^honor_your', r'^ordering_', r'^insignia_committee', r'^jewelry_',
    r'^spotlight', r'^northeast_', r'^pin\.', r'^chapter_pins', r'^chapter_anniversary',
    r'^insignia_is', r'^americanismdar', r'^required',
    r'^national_society_daughters', r'^new_commemorative', r'^new_membership',
    r'^new_service',
]

def should_skip(filename):
    for pattern in SKIP_PATTERNS:
        if re.match(pattern, filename):
            return True
    stem = Path(filename).stem
    # Skip very short or number-only
    if len(stem) < 3 or re.match(r'^[\d_]+$', stem):
        return True
    return False

def filename_to_id(filename):
    stem = Path(filename).stem
    stem = re.sub(r'_\d+$', '', stem)
    return stem.replace('_', '-')

def filename_to_name(filename):
    stem = Path(filename).stem
    stem = re.sub(r'_\d+$', '', stem)
    name = stem.replace('_', ' ').replace('-', ' ')
    words = name.split()
    result = []
    for w in words:
        if w.upper() in ('DAR', 'NSDAR', 'USA', 'CAR', 'GEP', 'PM'):
            result.append(w.upper())
        else:
            result.append(w.capitalize())
    return ' '.join(result)

def detect_category(name):
    lower = name.lower()
    if 'centennial' in lower:
        return 'other'
    if any(x in lower for x in ['officer', 'regent', 'chair', 'parliamentarian', 'page', 'hostess', 'credential', 'chorus']):
        return 'officer'
    if any(x in lower for x in ['ancestor', 'patriot', 'founder', 'legacy', 'lineage', 'genealog']):
        return 'ancestor'
    if any(x in lower for x in ['service', 'volunteer', 'conservation', 'school', 'training', 'friend', 'donor', 'donation', 'giving', 'club', 'guardian']):
        return 'service'
    if any(x in lower for x in ['member', 'insignia', 'life', 'junior', 'associate', 'charter']):
        return 'membership'
    if any(x in lower for x in ['honorary', 'heritage', 'liberty', 'defense', 'constitution', 'flag', 'commemorat', 'war', 'battle', 'treaty', 'revolution', 'america 250']):
        return 'honorary'
    if any(x in lower for x in ['state', 'alabama', 'alaska', 'arizona', 'arkansas', 'california', 'colorado', 'connecticut', 'delaware', 'florida', 'georgia', 'hawaii', 'idaho', 'illinois', 'indiana', 'iowa', 'kansas', 'kentucky', 'louisiana', 'maine', 'maryland', 'massachusetts', 'michigan', 'minnesota', 'mississippi', 'missouri', 'montana', 'nebraska', 'nevada', 'new hampshire', 'new jersey', 'new mexico', 'new york', 'north carolina', 'north dakota', 'ohio', 'oklahoma', 'oregon', 'pennsylvania', 'rhode island', 'south carolina', 'south dakota', 'tennessee', 'texas', 'utah', 'vermont', 'virginia', 'washington', 'west virginia', 'wisconsin', 'wyoming', 'mexico', 'district of columbia']):
        return 'other'
    return 'other'

def main():
    files = sorted(os.listdir(EXTRACTED_DIR))
    
    # Build image map and pin list (deduplicated)
    seen_ids = set()
    image_map = {}  # id -> filename
    additional_pins = []
    
    # Existing pin IDs
    existing_ids = {
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
    
    for f in files:
        if should_skip(f):
            continue
        stem = Path(f).stem
        base_stem = re.sub(r'_\d+$', '', stem)
        pin_id = base_stem.replace('_', '-')
        
        if pin_id in seen_ids:
            continue
        seen_ids.add(pin_id)
        
        # Add to image map
        image_map[pin_id] = f
        
        # Add as new pin if not existing
        if pin_id not in existing_ids:
            name = filename_to_name(f)
            category = detect_category(name)
            additional_pins.append({
                'id': pin_id,
                'name': name,
                'category': category,
                'filename': f,
            })
    
    # Also add manual mappings for existing pins
    manual_map = {
        'dar-insignia': 'insignia.jpeg',
        'chapter-regent': 'chapter_regent.jpeg',
        'chapter-vice-regent': 'chapter_officer_bar.jpeg',
        'chapter-chaplain': 'chapter_level.jpeg',
        'chapter-recording-secretary': 'chapter_officer.png',
        'chapter-treasurer': 'chapter_officer.png',
        'chapter-registrar': 'chapter_officer.png',
        'chapter-historian': 'chapter_officer.png',
        'chapter-librarian': 'chapter_officer.png',
        'state-regent': 'national.jpeg',
        'state-vice-regent': 'national.jpeg',
        'state-officer': 'national.jpeg',
        'national-officer': 'national_level.jpeg',
        'ancestor-bar': 'ancestor_bar.jpeg',
        'supplemental-ancestor-bar': 'ancestor_bar.jpeg',
        'patriot-pin': 'patriots_abroad.jpeg',
        'founders-pin': 'founders_club.jpeg',
        'sustaining-supporter': 'celebrate_your_commitment_to_service.jpeg',
        'century-club': 'celebrate_your_commitment_to_service.jpeg',
        'service-star': '25_years_of_service.jpeg',
        'outstanding-volunteer': 'volunteer.jpeg',
        'community-service': 'celebrate_your_commitment_to_service.jpeg',
        'dar-school-pin': 'celebrate_your_commitment_to_service.jpeg',
        'conservation-pin': 'celebrate_your_commitment_to_service.jpeg',
        'presidents-general-pin': 'president_generals.jpeg',
        'daughters-of-liberty': 'national_society.jpeg',
        'womens-issues': 'national_society.jpeg',
        'american-heritage': 'american_heritage.jpeg',
        'national-defense': 'national.jpeg',
        'constitution-week': 'national_society.jpeg',
        'flag-of-usa': 'national_society.jpeg',
        'life-membership': 'life_member.jpeg',
        '25-year-pin': '25_years_of_service.jpeg',
        '50-year-pin': '50_years_of_service.jpeg',
    }
    image_map.update(manual_map)
    
    # Write image map entries
    map_lines = []
    for pid, fname in sorted(image_map.items()):
        map_lines.append(f"  '{pid}': '{fname}',")
    
    # Write additional pin entries
    pin_lines = []
    for p in additional_pins:
        pin_lines.append(f"""  {{
    id: '{p["id"]}',
    name: '{p["name"].replace("'", "\\'")}',
    category: '{p["category"]}',
    widthInches: 0.375,
    heightInches: 0.375,
    allowedRows: [1, 2, 3, 4],
    allowedSide: 'any',
    requiredSpacingInches: 0.0625,
    canStack: false,
    mandatory: false,
    manualCitation: 'DAR Insignia Store Catalog, July 2022',
  }},""")
    
    print(f"Generated {len(additional_pins)} additional pins")
    print(f"Image map has {len(image_map)} entries")
    
    # Write the additional pins to a file for insertion
    with open('/tmp/additional_pins_block.ts', 'w') as f:
        f.write('\n'.join(pin_lines))
    
    # Write the image map to a file for insertion
    with open('/tmp/image_map_block.ts', 'w') as f:
        f.write('\n'.join(map_lines))

if __name__ == "__main__":
    main()
