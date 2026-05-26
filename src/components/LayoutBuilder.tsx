import { useState, useMemo, useCallback } from 'react';
import { PinRule, PIN_RULES } from '../data/pinRules';
import { generateLayout, LayoutConfig } from '../engine/placementEngine';
import PinSelector from './PinSelector';
import RibbonDiagram from './RibbonDiagram';
import PinUploader from './PinUploader';

export default function LayoutBuilder() {
  const [rowCount, setRowCount] = useState<1 | 2 | 3 | 4>(1);
  const [ribbonLength, setRibbonLength] = useState(4);
  const ribbonWidth = 1.5 * rowCount; // 1.5" per row
  const [selectedPins, setSelectedPins] = useState<PinRule[]>([]);
  const [showDiagram, setShowDiagram] = useState(true);
  const [, setCategoryOverrides] = useState<Record<string, PinRule['category']>>({});

  const handleChangeCategory = useCallback((pinId: string, newCategory: PinRule['category']) => {
    setCategoryOverrides((prev) => ({ ...prev, [pinId]: newCategory }));
    // Also update the PIN_RULES array in-place so it persists during session
    const pin = PIN_RULES.find((p) => p.id === pinId);
    if (pin) {
      (pin as { category: string }).category = newCategory;
    }
  }, []);

  const mandatoryPins = PIN_RULES.filter((p) => p.mandatory);
  const allPinsForLayout = useMemo(
    () => [...mandatoryPins, ...selectedPins],
    [selectedPins]
  );

  const config: LayoutConfig = useMemo(
    () => ({ ribbonLengthInches: ribbonLength, ribbonWidthInches: ribbonWidth, rowCount }),
    [ribbonLength, rowCount]
  );

  const layout = useMemo(
    () => generateLayout(config, allPinsForLayout),
    [config, allPinsForLayout]
  );

  const handleTogglePin = (pin: PinRule) => {
    setSelectedPins((prev) =>
      prev.some((p) => p.id === pin.id)
        ? prev.filter((p) => p.id !== pin.id)
        : [...prev, pin]
    );
  };

  const handleUpload = (_file: File, widthInches: number, heightInches: number) => {
    const customPin: PinRule = {
      id: `custom-${Date.now()}`,
      name: 'Uploaded Pin',
      category: 'other',
      widthInches,
      heightInches,
      allowedRows: [1, 2, 3, 4],
      allowedSide: 'any',
      requiredSpacingInches: 0.0625,
      canStack: false,
      mandatory: false,
      manualCitation: 'User-provided dimensions',
    };
    setSelectedPins((prev) => [...prev, customPin]);
  };

  const inputStyle = {
    padding: '0.5rem 0.75rem',
    marginTop: '0.25rem',
    background: 'rgba(255,255,255,0.08)',
    border: '1px solid rgba(212,175,55,0.3)',
    borderRadius: '6px',
    color: '#e8edf5',
    fontSize: '0.9rem',
    outline: 'none',
  };

  return (
    <div style={{
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '3rem 2rem 2.5rem',
    }}>
      {/* Header */}
      <div style={{
        textAlign: 'center',
        marginBottom: '2rem',
        background: '#ffffff',
        margin: '0 -2rem 2rem -2rem',
        padding: '2.5rem 2rem 2rem',
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
      }}>
        <h1 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: '2rem',
          fontWeight: 700,
          color: '#1a2f5a',
          letterSpacing: '0.5px',
          marginBottom: '0.5rem',
        }}>
          DAR Pin Layout Builder
        </h1>
        <p style={{
          color: '#555',
          fontSize: '0.85rem',
          fontStyle: 'italic',
        }}>
          Placement guidance based on uploaded manuals. Confirm with current DAR Insignia rules before wearing.
        </p>
      </div>

      {/* Ribbon config card */}
      <div style={{
        background: 'rgba(255,255,255,0.1)',
        border: '1px solid rgba(255,255,255,0.2)',
        borderRadius: '12px',
        padding: '1.25rem 1.5rem',
        marginBottom: '1.5rem',
      }}>
        <h2 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: '1.1rem',
          color: '#d4af37',
          marginBottom: '1rem',
          fontWeight: 600,
        }}>
          Ribbon Configuration
        </h2>
        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
          <label style={{ display: 'flex', flexDirection: 'column', fontSize: '0.8rem', color: 'rgba(255,255,255,0.8)' }}>
            Row count
            <select
              value={rowCount}
              onChange={(e) => setRowCount(Number(e.target.value) as 1 | 2 | 3 | 4)}
              style={{ ...inputStyle, width: '7rem' }}
            >
              <option value={1}>1 row</option>
              <option value={2}>2 rows</option>
              <option value={3}>3 rows</option>
              <option value={4}>4 rows</option>
            </select>
          </label>

          <label style={{ display: 'flex', flexDirection: 'column', fontSize: '0.8rem', color: 'rgba(255,255,255,0.8)' }}>
            Length
            <select
              value={ribbonLength}
              onChange={(e) => setRibbonLength(parseFloat(e.target.value))}
              style={{ ...inputStyle, width: '8rem' }}
            >
              <option value={4}>4 inches</option>
              <option value={6}>6 inches</option>
              <option value={8}>8 inches</option>
              <option value={10}>10 inches</option>
              <option value={12}>12 inches</option>
              <option value={14}>14 inches</option>
            </select>
          </label>
        </div>
      </div>

      {/* Two-column layout: Pin selection + Generated layout */}
      <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
        {/* Left: Pin selection */}
        <div style={{ flex: '1 1 350px', minWidth: '300px' }}>
          <PinSelector selectedPins={selectedPins} onTogglePin={handleTogglePin} onChangeCategory={handleChangeCategory} />
        </div>

        {/* Right: Generate button + Diagram */}
        <div style={{ flex: '1 1 350px', minWidth: '300px' }}>
          <button
            onClick={() => setShowDiagram(true)}
            style={{
              padding: '0.65rem 2rem',
              background: 'linear-gradient(135deg, #d4af37 0%, #b8960c 100%)',
              color: '#0a1628',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '0.95rem',
              fontWeight: 600,
              letterSpacing: '0.3px',
              boxShadow: '0 4px 15px rgba(212,175,55,0.3)',
              transition: 'transform 0.1s, box-shadow 0.1s',
              marginBottom: '1rem',
            }}
          >
            Generate Layout
          </button>

          {/* Diagram */}
          {showDiagram && <RibbonDiagram layout={layout} config={config} onRemovePin={handleTogglePin} />}
        </div>
      </div>

      {/* Upload */}
      <PinUploader onUpload={handleUpload} />
    </div>
  );
}
