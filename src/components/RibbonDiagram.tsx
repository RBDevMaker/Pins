import { useState } from 'react';
import { LayoutResult, LayoutConfig } from '../engine/placementEngine';
import { PinRule, getPinImageUrl } from '../data/pinRules';

interface Props {
  layout: LayoutResult;
  config: LayoutConfig;
  onRemovePin?: (pin: PinRule) => void;
}

const RIBBON_WIDTH_PX = 160;
const RIBBON_GAP = 4;

export default function RibbonDiagram({ layout, config, onRemovePin }: Props) {
  const pxPerInch = RIBBON_WIDTH_PX / 1.5;
  const ribbonH = config.ribbonLengthInches * pxPerInch;
  const totalW = config.rowCount * RIBBON_WIDTH_PX + (config.rowCount - 1) * RIBBON_GAP;
  const [hoveredPin, setHoveredPin] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const hasBelowPins = layout.placements.some(
    (p) => p.xOffsetInches > config.ribbonLengthInches
  );
  const extraBelow = hasBelowPins ? 1.5 * pxPerInch : 0;
  const LABEL_HEIGHT = 20;
  const totalH = LABEL_HEIGHT + ribbonH + extraBelow + 30;

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
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
        }}
      >
        {/* Ribbon strips */}
        {Array.from({ length: config.rowCount }, (_, i) => {
          const cornerCut = 28;
          const clipPath = config.rowCount === 1
            ? `polygon(0 0, 100% 0, 100% calc(100% - ${cornerCut * 1.5}px), 50% 100%, 0 calc(100% - ${cornerCut * 1.5}px))`
            : `polygon(0 0, 100% 0, 100% calc(100% - ${cornerCut}px), calc(100% - ${cornerCut}px) 100%, ${cornerCut}px 100%, 0 calc(100% - ${cornerCut}px))`;
          return (
            <div
              key={`ribbon-${i}`}
              style={{
                position: 'absolute',
                left: i * (RIBBON_WIDTH_PX + RIBBON_GAP),
                top: LABEL_HEIGHT,
                width: RIBBON_WIDTH_PX,
                height: ribbonH,
                background: 'linear-gradient(180deg, #1a3a6b 0%, #162f58 100%)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)',
                borderLeft: '30px solid #fff',
                borderRight: '30px solid #fff',
                borderTop: '1px solid rgba(212,175,55,0.3)',
                clipPath,
              }}
            />
          );
        })}

        {/* Row labels at top */}
        {Array.from({ length: config.rowCount }, (_, i) => (
          <div
            key={`label-${i}`}
            style={{
              position: 'absolute',
              left: i * (RIBBON_WIDTH_PX + RIBBON_GAP),
              top: 0,
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
          const pinScale = p.pin.mandatory ? 2.6 : 2;
          const pinW = p.pin.widthInches * pxPerInch * pinScale;
          const pinH = p.pin.heightInches * pxPerInch * pinScale;
          const stripLeft = (p.row - 1) * (RIBBON_WIDTH_PX + RIBBON_GAP);
          const px = stripLeft + (RIBBON_WIDTH_PX - pinW) / 2;
          const py = LABEL_HEIGHT + p.xOffsetInches * pxPerInch;
          const imgUrl = p.pin.imageUrl || getPinImageUrl(p.pin);
          const isHovered = hoveredPin === p.pin.id + '-' + i;

          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: px,
                top: py,
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                cursor: 'pointer',
                transition: 'transform 0.15s ease',
                transform: isHovered ? 'scale(1.08)' : 'scale(1)',
              }}
              onMouseEnter={() => setHoveredPin(p.pin.id + '-' + i)}
              onMouseLeave={() => setHoveredPin(null)}
            >
              <img
                src={imgUrl}
                alt={p.pin.name}
                style={{
                  width: pinW,
                  height: 'auto',
                  maxHeight: pinH * 1.5,
                  objectFit: 'contain',
                  filter: isHovered
                    ? 'drop-shadow(0 3px 8px rgba(212,175,55,0.6))'
                    : 'drop-shadow(0 1px 3px rgba(0,0,0,0.4))',
                  transition: 'filter 0.15s ease',
                }}
              />
              {/* Only show label for DAR Insignia */}
              {p.pin.mandatory && (
                <span style={{
                  fontSize: '11px',
                  color: '#fff',
                  textShadow: '0 1px 2px rgba(0,0,0,0.6)',
                  whiteSpace: 'nowrap',
                  marginLeft: '4px',
                }}>
                  {p.pin.name}
                </span>
              )}
              {onRemovePin && !p.pin.mandatory && (
                <button
                  onClick={() => onRemovePin(p.pin)}
                  aria-label={`Remove ${p.pin.name}`}
                  style={{
                    width: '16px',
                    height: '16px',
                    borderRadius: '50%',
                    background: '#e53935',
                    color: '#fff',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '10px',
                    lineHeight: '16px',
                    textAlign: 'center',
                    padding: 0,
                    marginLeft: '3px',
                    flexShrink: 0,
                    boxShadow: '0 1px 3px rgba(0,0,0,0.4)',
                    opacity: isHovered ? 1 : 0.6,
                    transition: 'opacity 0.15s ease',
                  }}
                >
                  ×
                </button>
              )}
            </div>
          );
        })}

        {/* Tooltip following cursor */}
        {hoveredPin && (
          <div style={{
            position: 'absolute',
            left: mousePos.x + 12,
            top: mousePos.y - 28,
            background: 'rgba(26,47,90,0.95)',
            color: '#fff',
            padding: '4px 10px',
            borderRadius: '6px',
            fontSize: '11px',
            fontWeight: 500,
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
            boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
            border: '1px solid rgba(212,175,55,0.4)',
            zIndex: 10,
          }}>
            {layout.placements.find((p, i) => p.pin.id + '-' + i === hoveredPin)?.pin.name}
          </div>
        )}
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
    </div>
  );
}
