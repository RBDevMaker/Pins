import { PinRule, getPinImageUrlOriginal } from '../data/pinRules';

interface Props {
  pin: PinRule;
  isSelected: boolean;
  onToggle: () => void;
  onClose: () => void;
  onChangeCategory: (pinId: string, newCategory: PinRule['category']) => void;
}

const CATEGORY_LABELS: Record<string, string> = {
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

export default function PinDetailModal({ pin, isSelected, onToggle, onClose, onChangeCategory }: Props) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '1rem',
      }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Pin details: ${pin.name}`}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: '12px',
          maxWidth: '420px',
          width: '100%',
          padding: '1.5rem',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          aria-label="Close"
          style={{
            position: 'absolute',
            top: '0.75rem',
            right: '0.75rem',
            background: 'none',
            border: 'none',
            fontSize: '1.5rem',
            cursor: 'pointer',
            color: '#666',
            lineHeight: 1,
          }}
        >
          ×
        </button>

        {/* Pin image */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          marginBottom: '1rem',
          padding: '1rem',
          background: '#f9f9f9',
          borderRadius: '8px',
        }}>
          <img
            src={pin.imageUrl || getPinImageUrlOriginal(pin)}
            alt={pin.name}
            style={{
              maxWidth: '400px',
              maxHeight: '400px',
              objectFit: 'contain',
            }}
            onError={(e) => {
              (e.target as HTMLImageElement).alt = 'Image not available';
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        </div>

        {/* Pin name */}
        <h2 style={{
          fontSize: '1.25rem',
          fontWeight: 700,
          color: '#1a2f5a',
          marginBottom: '0.75rem',
          fontFamily: "'Playfair Display', serif",
        }}>
          {pin.name}
        </h2>

        {/* Details */}
        <div style={{ fontSize: '0.85rem', color: '#444', lineHeight: 1.6 }}>
          <p>
            <strong>Category:</strong>{' '}
            <select
              value={pin.category}
              onChange={(e) => onChangeCategory(pin.id, e.target.value as PinRule['category'])}
              style={{
                padding: '0.2rem 0.4rem',
                borderRadius: '4px',
                border: '1px solid #ccc',
                fontSize: '0.85rem',
              }}
            >
              {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </p>
          <p><strong>Size:</strong> {pin.widthInches}" × {pin.heightInches}"</p>
          <p><strong>Allowed rows:</strong> {pin.allowedRows.join(', ')}</p>
          <p><strong>Placement:</strong> {pin.allowedSide === 'any' ? 'Any side' : pin.allowedSide.charAt(0).toUpperCase() + pin.allowedSide.slice(1)}</p>
          <p><strong>Spacing:</strong> {pin.requiredSpacingInches}" minimum</p>
          <p><strong>Stackable:</strong> {pin.canStack ? 'Yes' : 'No'}</p>
          <p style={{ marginTop: '0.5rem', fontStyle: 'italic', color: '#666' }}>
            <strong>Source:</strong> {pin.manualCitation}
          </p>
        </div>

        {/* Add/Remove button */}
        <button
          onClick={onToggle}
          style={{
            marginTop: '1rem',
            width: '100%',
            padding: '0.6rem',
            background: isSelected
              ? '#e53935'
              : 'linear-gradient(135deg, #d4af37 0%, #b8960c 100%)',
            color: isSelected ? '#fff' : '#0a1628',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: 600,
          }}
        >
          {isSelected ? '✓ Remove from Layout' : '+ Add to Layout'}
        </button>
      </div>
    </div>
  );
}
