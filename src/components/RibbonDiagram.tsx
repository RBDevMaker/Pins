import { LayoutResult, LayoutConfig } from '../engine/placementEngine';
import { PinRule, getPinImageUrl } from '../data/pinRules';

interface Props {
  layout: LayoutResult;
  config: LayoutConfig;
  onRemovePin?: (pin: PinRule) => void;
}

const SCALE = 96; // pixels per inch — true scale
const RIBBON_WIDTH_PX = 140; // ribbon strip width
const RIBBON_GAP = 4; // gap between ribbon strips in pixels

export default function RibbonDiagram({ layout, config, onRemovePin }: Props) {
  const ribbonH = config.ribbonLengthInches * SCALE;
  const totalW = config.rowCount * RIBBON_WIDTH_PX + (config.rowCount - 1) * RIBBON_GAP;

  // Extra space below ribbon for the insignia pin
  const hasBelowPins = layout.placements.some(
    (p) => p.xOffsetInches > config.ribbonLengthInches
  );
  const extraBelow = hasBelowPins ? 1.2 * SCALE : 0;
  const totalH = ribbonH + extraBelow + 30;

  return (
    <div style={{ marginTop: '1rem' }}>
      <h3 style={{ color: '#fff' }}>Layout Diagram</h3>
      <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)', marginBottom: '0.75rem' }}>
        {config.ribbonLengthInches}" × {config.ribbonWidthInches}" ribbon · {config.rowCount} {config.rowCount === 1 ? 'row' : 'rows'}
      </p>

      {/* Ribbon container */}
      <div
        role="img"
        aria-label={`Ribbon diagram showing ${layout.placements.length} pins across ${config.rowCount} rows`}
        style={{
          position: 'relative',
          width: totalW,
          height: totalH,
          margin: '0 auto',
        }}
      >
        {/* Ribbon strips */}
        {Array.from({ length: config.rowCount }, (_, i) => {
          const cornerCut = 36; // pixels for the diagonal corner clip
          return (
            <div
              key={`ribbon-${i}`}
              style={{
                position: 'absolute',
                left: i * (RIBBON_WIDTH_PX + RIBBON_GAP),
                top: 0,
                width: RIBBON_WIDTH_PX,
                height: ribbonH,
                background: 'linear-gradient(180deg, #1a3a6b 0%, #162f58 100%)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)',
                borderLeft: '22px solid #fff',
                borderRight: '22px solid #fff',
                borderTop: '1px solid rgba(212,175,55,0.3)',
                clipPath: `polygon(0 0, 100% 0, 100% calc(100% - ${cornerCut}px), calc(100% - ${cornerCut}px) 100%, ${cornerCut}px 100%, 0 calc(100% - ${cornerCut}px))`,
              }}
            />
          );
        })}

        {/* Row labels at bottom */}
        {Array.from({ length: config.rowCount }, (_, i) => (
          <div
            key={`label-${i}`}
            style={{
              position: 'absolute',
              left: i * (RIBBON_WIDTH_PX + RIBBON_GAP),
              top: ribbonH + 4,
              width: RIBBON_WIDTH_PX,
              textAlign: 'center',
              fontSize: '10px',
              color: 'rgba(255,255,255,0.6)',
            }}
          >
            Row {i + 1}
          </div>
        ))}

        {/* Pins */}
        {layout.placements.map((p, i) => {
          const pinW = Math.min(p.pin.widthInches * SCALE * 1.2, RIBBON_WIDTH_PX - 16);
          const pinH = p.pin.heightInches * SCALE * 1.2;
          const stripLeft = (p.row - 1) * (RIBBON_WIDTH_PX + RIBBON_GAP);
          const px = stripLeft + (RIBBON_WIDTH_PX - pinW) / 2;
          const py = p.xOffsetInches * SCALE;
          const imgUrl = p.pin.imageUrl || getPinImageUrl(p.pin);

          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: px,
                top: py,
                width: pinW,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              <img
                src={imgUrl}
                alt={p.pin.name}
                style={{
                  width: pinW,
                  height: pinH,
                  objectFit: 'contain',
                  filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.4))',
                }}
              />
              <span style={{
                fontSize: '8px',
                color: '#fff',
                textAlign: 'center',
                marginTop: '1px',
                textShadow: '0 1px 2px rgba(0,0,0,0.6)',
                whiteSpace: 'nowrap',
                maxWidth: RIBBON_WIDTH_PX - 8,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}>
                {p.pin.name.length > 16
                  ? p.pin.name.slice(0, 14) + '…'
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
