import { PinRule } from '../data/pinRules';

export interface PlacedPin {
  pin: PinRule;
  row: number;
  xOffsetInches: number; // from left edge of ribbon
}

export interface LayoutResult {
  placements: PlacedPin[];
  warnings: string[];
  citations: string[];
}

export interface LayoutConfig {
  ribbonLengthInches: number;
  ribbonWidthInches: number;
  rowCount: 1 | 2 | 3 | 4;
}

/**
 * Rule-based placement engine. Does NOT guess — uses the rules table.
 * AI explains the rules later; this engine enforces them.
 */
export function generateLayout(
  config: LayoutConfig,
  selectedPins: PinRule[]
): LayoutResult {
  const warnings: string[] = [];
  const citations: string[] = [];
  const placements: PlacedPin[] = [];

  // Group pins by their best-fit row
  const rowBuckets: Map<number, PinRule[]> = new Map();
  for (let r = 1; r <= config.rowCount; r++) {
    rowBuckets.set(r, []);
  }

  for (const pin of selectedPins) {
    const validRows = pin.allowedRows.filter((r) => r <= config.rowCount);
    if (validRows.length === 0) {
      warnings.push(
        `"${pin.name}" requires row ${pin.allowedRows.join('/')} but only ${config.rowCount} row(s) available.`
      );
      continue;
    }
    // Place in the first allowed row that has space
    let placed = false;
    for (const row of validRows) {
      const bucket = rowBuckets.get(row)!;
      const usedWidth = bucket.reduce(
        (sum, p) => sum + p.widthInches + p.requiredSpacingInches,
        0
      );
      if (usedWidth + pin.widthInches <= config.ribbonLengthInches) {
        bucket.push(pin);
        placed = true;
        break;
      }
    }
    if (!placed) {
      warnings.push(
        `"${pin.name}" does not fit on any allowed row. Ribbon may be too short.`
      );
    }
  }

  // Convert buckets to placements with x offsets
  for (const [row, pins] of rowBuckets.entries()) {
    let xCursor = 0.125; // start with small margin
    for (const pin of pins) {
      placements.push({ pin, row, xOffsetInches: xCursor });
      citations.push(pin.manualCitation);
      xCursor += pin.widthInches + pin.requiredSpacingInches;
    }
  }

  // Deduplicate citations
  const uniqueCitations = [...new Set(citations)];

  return { placements, warnings, citations: uniqueCitations };
}
