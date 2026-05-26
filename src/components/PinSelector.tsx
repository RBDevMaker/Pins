import { useState } from 'react';
import { PinRule, PIN_RULES, getPinImageUrl } from '../data/pinRules';
import PinDetailModal from './PinDetailModal';

interface Props {
  selectedPins: PinRule[];
  onTogglePin: (pin: PinRule) => void;
  onChangeCategory: (pinId: string, newCategory: PinRule['category']) => void;
}

const CATEGORIES: Record<string, string> = {
  member: 'Member',
  officer: 'Officer',
  service: 'Service',
  honorary: 'Honorary',
  commemorative: 'Commemorative',
  training: 'Training & Volunteer Service',
  clubs: 'Clubs & Boards',
  junior: 'Junior & Page',
  congress: 'Continental Congress',
  states: 'States',
  donation: 'Donation',
  other: 'Other',
};

const CATEGORY_COLORS: Record<string, string> = {
  member: '#1565c0',
  officer: '#6a1b9a',
  service: '#e65100',
  honorary: '#c62828',
  commemorative: '#00695c',
  training: '#f57f17',
  clubs: '#4527a0',
  junior: '#d81b60',
  congress: '#1a237e',
  states: '#33691e',
  donation: '#bf360c',
  other: '#546e7a',
};

export default function PinSelector({ selectedPins, onTogglePin, onChangeCategory }: Props) {
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [detailPin, setDetailPin] = useState<PinRule | null>(null);

  const isSelected = (pin: PinRule) =>
    selectedPins.some((p) => p.id === pin.id);

  const filtered = PIN_RULES.filter((pin) => {
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

  return (
    <div style={{ marginBottom: '1rem' }}>
      <h3 style={{ marginBottom: '0.5rem', color: '#fff' }}>Select Pins</h3>

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
        maxHeight: '700px',
        overflowY: 'auto',
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
                  <div
                    key={pin.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.6rem',
                      width: '100%',
                      padding: '0.5rem 0.75rem',
                      borderBottom: '1px solid #eee',
                      background: isSelected(pin) ? '#e6f0ff' : '#fff',
                      fontSize: '0.85rem',
                    }}
                  >
                    {/* Clickable area to open detail */}
                    <button
                      onClick={() => setDetailPin(pin)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.6rem',
                        flex: 1,
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        textAlign: 'left',
                        padding: 0,
                        fontSize: '0.85rem',
                      }}
                      aria-label={`View details for ${pin.name}`}
                    >
                      {/* Pin image thumbnail */}
                      <img
                        src={pin.imageUrl || getPinImageUrl(pin)}
                        alt={pin.name}
                        style={{
                          width: '90px',
                          height: '90px',
                          objectFit: 'contain',
                          flexShrink: 0,
                        }}
                      />
                      <span style={{ flex: 1 }}>
                        <strong>{pin.name}</strong>
                        <span style={{ color: '#888', marginLeft: '0.5rem' }}>
                          {pin.widthInches}" × {pin.heightInches}"
                        </span>
                      </span>
                    </button>
                    {/* Add/remove toggle button */}
                    <button
                      onClick={() => onTogglePin(pin)}
                      aria-pressed={isSelected(pin)}
                      aria-label={isSelected(pin) ? `Remove ${pin.name}` : `Add ${pin.name}`}
                      style={{
                        fontSize: '0.75rem',
                        padding: '0.15rem 0.4rem',
                        borderRadius: '3px',
                        background: isSelected(pin) ? '#0066cc' : '#eee',
                        color: isSelected(pin) ? '#fff' : '#666',
                        border: 'none',
                        cursor: 'pointer',
                        flexShrink: 0,
                      }}
                    >
                      {isSelected(pin) ? '✓ Added' : '+'}
                    </button>
                  </div>
                ))}
              </div>
            );
          })
        )}
      </div>

      {/* Pin detail modal */}
      {detailPin && (
        <PinDetailModal
          pin={detailPin}
          isSelected={isSelected(detailPin)}
          onToggle={() => onTogglePin(detailPin)}
          onClose={() => setDetailPin(null)}
          onChangeCategory={onChangeCategory}
        />
      )}
    </div>
  );
}
