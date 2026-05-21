import { useState, useMemo } from 'react';
import { PinRule, PIN_RULES } from '../data/pinRules';
import { generateLayout, LayoutConfig } from '../engine/placementEngine';
import PinSelector from './PinSelector';
import RibbonDiagram from './RibbonDiagram';
import PinUploader from './PinUploader';

export default function LayoutBuilder() {
  const [rowCount, setRowCount] = useState<1 | 2 | 3 | 4>(1);
  const [ribbonLength, setRibbonLength] = useState(3.5);
  const [ribbonWidth, setRibbonWidth] = useState(1.375);
  const [selectedPins, setSelectedPins] = useState<PinRule[]>([]);
  const [showDiagram, setShowDiagram] = useState(false);

  // Always include mandatory pins (DAR Insignia)
  const mandatoryPins = PIN_RULES.filter((p) => p.mandatory);
  const allPinsForLayout = useMemo(
    () => [...mandatoryPins, ...selectedPins],
    [selectedPins]
  );

  const config: LayoutConfig = useMemo(
    () => ({ ribbonLengthInches: ribbonLength, ribbonWidthInches: ribbonWidth, rowCount }),
    [ribbonLength, ribbonWidth, rowCount]
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

  return (
    <div style={{ maxWidth: '800px', margin: '2rem auto', padding: '1.5rem' }}>
      <h1 style={{ marginBottom: '0.25rem' }}>DAR Pin Layout Builder</h1>
      <p style={{ color: '#555', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
        Placement guidance based on uploaded manuals. Confirm with current DAR Insignia rules before wearing.
      </p>

      {/* Ribbon config */}
      <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
        <label style={{ display: 'flex', flexDirection: 'column', fontSize: '0.85rem' }}>
          Ribbon row count
          <select
            value={rowCount}
            onChange={(e) => setRowCount(Number(e.target.value) as 1 | 2 | 3 | 4)}
            style={{ padding: '0.3rem', marginTop: '0.25rem' }}
          >
            <option value={1}>1 row</option>
            <option value={2}>2 rows</option>
            <option value={3}>3 rows</option>
            <option value={4}>4 rows</option>
          </select>
        </label>

        <label style={{ display: 'flex', flexDirection: 'column', fontSize: '0.85rem' }}>
          Ribbon length (inches)
          <input
            type="number"
            step="0.25"
            min="1"
            max="24"
            value={ribbonLength}
            onChange={(e) => setRibbonLength(parseFloat(e.target.value))}
            style={{ width: '5rem', padding: '0.3rem', marginTop: '0.25rem' }}
          />
        </label>

        <label style={{ display: 'flex', flexDirection: 'column', fontSize: '0.85rem' }}>
          Ribbon width (inches)
          <input
            type="number"
            step="0.125"
            min="0.5"
            max="4"
            value={ribbonWidth}
            onChange={(e) => setRibbonWidth(parseFloat(e.target.value))}
            style={{ width: '5rem', padding: '0.3rem', marginTop: '0.25rem' }}
          />
        </label>
      </div>

      {/* Pin selection */}
      <PinSelector selectedPins={selectedPins} onTogglePin={handleTogglePin} />

      {/* Generate button */}
      <button
        onClick={() => setShowDiagram(true)}
        style={{
          padding: '0.5rem 1.5rem',
          background: '#0066cc',
          color: '#fff',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '0.9rem',
        }}
      >
        Generate Layout
      </button>

      {/* Diagram */}
      {showDiagram && <RibbonDiagram layout={layout} config={config} />}

      {/* Upload */}
      <PinUploader onUpload={handleUpload} />
    </div>
  );
}
