import { useState } from 'react';
import { PinRule, PIN_RULES } from '../data/pinRules';

interface Props {
  selectedPins: PinRule[];
  onTogglePin: (pin: PinRule) => void;
}

const CATEGORIES: Record<string, string> = {
  membership: 'Membership',
  officer: 'Officer',
  ancestor: 'Ancestor',
  service: 'Service',
  honorary: 'Honorary',
  other: 'Other',
};

const CATEGORY_COLORS: Record<string, string> = {
  membership: '#1565c0',
  officer: '#6a1b9a',
  ancestor: '#2e7d32',
  service: '#e65100',
  honorary: '#c62828',
  other: '#546e7a',
};

export default function PinSelector({ selectedPins, onTogglePin }: Props) {
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const isSelected = (pin: PinRule) =>
    selectedPins.some((p) => p.id === pin.id);

  const filtered = PIN_RULES.filter((pin) => {
    if (pin.mandatory) return false;
    const matchesSearch = pin.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = filterCategory === 'all' || pin.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  // Group filtered pins by category
  const grouped: Record<string, PinRule[]> = {};
  for (const pin of filtered) {
    if (!grouped[pin.category]) grouped[pin.category] = [];
    grouped[pin.category].push(pin);
  }

  const mandatoryPins = PIN_RULES.filter((p) => p.mandatory);

  return (
    <div style={{ marginBottom: '1rem' }}>
      {/* Mandatory pins notice */}
      {mandatoryPins.length > 0 && (
        <div style={{
          padding: '0.5rem 0.75rem',
          background: '#e8f5e9',
          border: '1px solid #a5d6a7',
          borderRadius: '4px',
          marginBottom: '0.75rem',
          fontSize: '0.85rem',
        }}>
          <strong>Always included:</strong>{' '}
          {mandatoryPins.map((p) => p.name).join(', ')}
          <span style={{ color: '#555', marginLeft: '0.5rem' }}>
            (required on all ribbon bars)
          </span>
        </div>
      )}

      <h3 style={{ marginBottom: '0.5rem' }}>Select Pins</h3>

      {/* Search and filter row */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
        <input
          type="search"
          placeholder="Search pins..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Search pins"
          style={{
            flex: '1 1 200px',
            padding: '0.4rem 0.75rem',
            border: '1px solid #ccc',
            borderRadius: '4px',
            fontSize: '0.9rem',
          }}
        />
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          aria-label="Filter by category"
          style={{ padding: '0.4rem', borderRadius: '4px', border: '1px solid #ccc' }}
        >
          <option value="all">All Categories</option>
          {Object.entries(CATEGORIES).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
      </div>

      {/* Results count */}
      <p style={{ fontSize: '0.8rem', color: '#666', marginBottom: '0.5rem' }}>
        {filtered.length} pin{filtered.length !== 1 ? 's' : ''} found
        {selectedPins.filter(p => !p.mandatory).length > 0 &&
          ` · ${selectedPins.filter(p => !p.mandatory).length} selected`}
      </p>

      {/* Scrollable pin list grouped by category */}
      <div style={{
        maxHeight: '360px',
        overflowY: 'scroll',
        border: '1px solid #ddd',
        borderRadius: '4px',
        background: '#fff',
      }}>
        {filtered.length === 0 ? (
          <p style={{ padding: '1rem', color: '#999', textAlign: 'center' }}>
            No pins match your search.
          </p>
        ) : (
          Object.entries(CATEGORIES).map(([catKey, catLabel]) => {
            const pins = grouped[catKey];
            if (!pins || pins.length === 0) return null;
            return (
              <div key={catKey}>
                {/* Category header */}
                <div style={{
                  position: 'sticky',
                  top: 0,
                  padding: '0.4rem 0.75rem',
                  background: '#f5f5f5',
                  borderBottom: '1px solid #ddd',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  color: CATEGORY_COLORS[catKey] || '#333',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  zIndex: 1,
                }}>
                  <span style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: CATEGORY_COLORS[catKey] || '#333',
                    display: 'inline-block',
                  }} />
                  {catLabel} ({pins.length})
                </div>
                {/* Pins in this category */}
                {pins.map((pin) => (
                  <button
                    key={pin.id}
                    onClick={() => onTogglePin(pin)}
                    aria-pressed={isSelected(pin)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      width: '100%',
                      padding: '0.5rem 0.75rem',
                      border: 'none',
                      borderBottom: '1px solid #eee',
                      background: isSelected(pin) ? '#e6f0ff' : '#fff',
                      cursor: 'pointer',
                      textAlign: 'left',
                      fontSize: '0.85rem',
                    }}
                  >
                    <span>
                      <strong>{pin.name}</strong>
                      <span style={{ color: '#888', marginLeft: '0.5rem' }}>
                        {pin.widthInches}" × {pin.heightInches}"
                      </span>
                    </span>
                    <span style={{
                      fontSize: '0.75rem',
                      padding: '0.15rem 0.4rem',
                      borderRadius: '3px',
                      background: isSelected(pin) ? '#0066cc' : '#eee',
                      color: isSelected(pin) ? '#fff' : '#666',
                    }}>
                      {isSelected(pin) ? '✓ Added' : '+'}
                    </span>
                  </button>
                ))}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
