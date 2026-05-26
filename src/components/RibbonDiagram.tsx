import { LayoutResult, LayoutConfig } from '../engine/placementEngine';
import { PinRule, getPinImageUrl } from '../data/pinRules';

interface Props {
  layout: LayoutResult;
  config: LayoutConfig;
  onRemovePin?: (pin: PinRule) => void;
}

const SCALE = 160; // pixels per inch for length
const WIDTH_SCALE = 300; // pixels per inch for width

export default function RibbonDiagram({ layout, config, onRemovePin }: Props) {
  const ribbonH = config.ribbonLengthInches * SCALE;
  const colWidth = 150; // fixed column width per row in pixels
  const ribbonW = colWidth * config.rowCount;

  const hasBelowPins = layout.placements.some(
    (p) => p.xOffsetInches > config.ribbonLengthInches
  );
  const extraBelow = hasBelowPins ? 1.5 * SCALE : 0;
  const totalH = ribbonH + extraBelow;

  return (
    <div style={{ marginTop: '1rem' }}>
      <h3 style={{ color: '#fff' }}>Layout Diagram</h3>
      <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)', marginBottom: '0.5rem' }}>
        {config.ribbonLengthInches}" × {config.ribbonWidthInches}" ribbon
      </p>

      {/* Ribbon container */}
      <div
        role="img"
        aria-label={`Ribbon diagram showing ${layout.placements.length} pins across ${config.rowCount} rows`}
        style={{
          position: 'relative',
          width: ribbonW,
          height: totalH,
          borderRadius: '4px',
          overflow: 'visible',
        }}
      >
        {/* Ribbon background */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: ribbonW,
          height: ribbonH,
          background: 'linear-gradient(180deg, #1a3a6b 0%, #1e4080 100%)',
          borderRadius: '4px',
          border: '2px solid rgba(212,175,55,0.5)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
        }} />

        {/* Column dividers */}
        {Array.from({ length: config.rowCount - 1 }, (_, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: colWidth * (i + 1),
              top: 0,
              width: '1px',
              height: ribbonH,
              borderLeft: '1px dashed rgba(255,255,255,0.3)',
            }}
          />
        ))}

        {/* Row labels */}
        {Array.from({ length: config.rowCount }, (_, i) => (
          <div
            key={`label-${i}`}
            style={{
              position: 'absolute',
              left: i * colWidth,
              top: ribbonH + 4,
              width: colWidth,
              textAlign: 'center',
              fontSize: '10px',
              color: 'rgba(255,255,255,0.7)',
            }}
          >
            Row {i + 1}
          </div>
        ))}

        {/* Pins */}
        {layout.placements.map((p, i) => {
          const pw = Math.min(p.pin.widthInches * WIDTH_SCALE, colWidth - 10);
          const ph = p.pin.heightInches * SCALE;
          const px = (p.row - 1) * colWidth + (colWidth - pw) / 2;
          const py = p.xOffsetInches * SCALE;
          const imgUrl = p.pin.imageUrl || getPinImageUrl(p.pin);

          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: px,
                top: py,
                width: pw,
                height: ph,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              <img
                src={imgUrl}
                alt={p.pin.name}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.4))',
                }}
              />
              <span style={{
                fontSize: Math.min(9, pw / 6) + 'px',
                color: '#fff',
                textAlign: 'center',
                marginTop: '2px',
                textShadow: '0 1px 2px rgba(0,0,0,0.5)',
                whiteSpace: 'nowrap',
              }}>
                {p.pin.name.length > 14
                  ? p.pin.name.slice(0, 12) + '…'
                  : p.pin.name}
              </span>
              {onRemovePin && !p.pin.mandatory && (
                <button
                  onClick={() => onRemovePin(p.pin)}
                  aria-label={`Remove ${p.pin.name}`}
                  style={{
                    position: 'absolute',
                    top: -6,
                    right: -6,
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    background: '#e53935',
                    color: '#fff',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '11px',
                    lineHeight: '18px',
                    textAlign: 'center',
                    padding: 0,
                    boxShadow: '0 1px 3px rgba(0,0,0,0.4)',
                  }}
                >
                  ×
                </button>
              )}
            </div>
          );
        })}
      </div>

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
        <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)' }}>
          <strong>Sources:</strong> {layout.citations.join('; ')}
        </div>
      )}
    </div>
  );
}
