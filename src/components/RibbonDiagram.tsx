import { LayoutResult, LayoutConfig } from '../engine/placementEngine';

interface Props {
  layout: LayoutResult;
  config: LayoutConfig;
}

const SCALE = 80; // pixels per inch for display

export default function RibbonDiagram({ layout, config }: Props) {
  // Vertical orientation: ribbon length goes top-to-bottom, rows go left-to-right
  const ribbonH = config.ribbonLengthInches * SCALE;
  const colWidth = config.ribbonWidthInches / config.rowCount * SCALE;
  const ribbonW = config.ribbonWidthInches * SCALE;

  // Extra space below ribbon for the insignia pin
  const hasBelowPins = layout.placements.some(
    (p) => p.xOffsetInches > config.ribbonLengthInches
  );
  const extraBelow = hasBelowPins ? 1.5 * SCALE : 0;
  const totalH = ribbonH + extraBelow;

  return (
    <div style={{ marginTop: '1rem' }}>
      <h3>Layout Diagram</h3>
      <p style={{ fontSize: '0.8rem', color: '#666', marginBottom: '0.5rem' }}>
        Scale: 1 inch = {SCALE}px | Vertical orientation (top = start of ribbon)
      </p>
      <svg
        width={ribbonW + 20}
        height={totalH + 40}
        viewBox={`0 0 ${ribbonW + 20} ${totalH + 40}`}
        role="img"
        aria-label={`Ribbon diagram showing ${layout.placements.length} pins across ${config.rowCount} rows, vertical orientation`}
        style={{ border: '1px solid #ddd', background: '#fff', borderRadius: '4px' }}
      >
        {/* Ribbon background */}
        <rect
          x={10}
          y={10}
          width={ribbonW}
          height={ribbonH}
          fill="#1a3a6b"
          rx={3}
        />

        {/* Column dividers (rows are now columns in vertical view) */}
        {Array.from({ length: config.rowCount - 1 }, (_, i) => (
          <line
            key={i}
            x1={10 + colWidth * (i + 1)}
            y1={10}
            x2={10 + colWidth * (i + 1)}
            y2={10 + ribbonH}
            stroke="rgba(255,255,255,0.3)"
            strokeDasharray="4 2"
          />
        ))}

        {/* Row labels */}
        {Array.from({ length: config.rowCount }, (_, i) => (
          <text
            key={`label-${i}`}
            x={10 + i * colWidth + colWidth / 2}
            y={ribbonH + 24}
            textAnchor="middle"
            fontSize={10}
            fill="#666"
          >
            Row {i + 1}
          </text>
        ))}

        {/* Pins — x offset becomes y offset, row becomes column */}
        {layout.placements.map((p, i) => {
          const px = 10 + (p.row - 1) * colWidth + (colWidth - p.pin.widthInches * SCALE) / 2;
          const py = 10 + p.xOffsetInches * SCALE;
          const pw = p.pin.widthInches * SCALE;
          const ph = p.pin.heightInches * SCALE;

          return (
            <g key={i}>
              <rect
                x={px}
                y={py}
                width={pw}
                height={ph}
                fill="#d4af37"
                stroke="#8b7500"
                strokeWidth={1}
                rx={2}
              />
              <text
                x={px + pw / 2}
                y={py + ph / 2}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={Math.min(9, pw / 4)}
                fill="#1a1a2e"
              >
                {p.pin.name.length > 12
                  ? p.pin.name.slice(0, 10) + '…'
                  : p.pin.name}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Warnings */}
      {layout.warnings.length > 0 && (
        <div
          style={{
            marginTop: '0.75rem',
            padding: '0.5rem',
            background: '#fff3cd',
            borderRadius: '4px',
            fontSize: '0.85rem',
          }}
          role="alert"
        >
          <strong>Warnings:</strong>
          <ul style={{ margin: '0.25rem 0 0 1rem' }}>
            {layout.warnings.map((w, i) => (
              <li key={i}>{w}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Citations */}
      {layout.citations.length > 0 && (
        <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: '#555' }}>
          <strong>Sources:</strong> {layout.citations.join('; ')}
        </div>
      )}
    </div>
  );
}
