import React, { useState } from 'react';

interface Props {
  onUpload: (file: File, widthInches: number, heightInches: number) => void;
}

export default function PinUploader({ onUpload }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setFile(f);
      setPreview(URL.createObjectURL(f));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (file && width && height) {
      onUpload(file, parseFloat(width), parseFloat(height));
    }
  };

  const inputStyle = {
    padding: '0.5rem 0.75rem',
    marginTop: '0.25rem',
    background: 'rgba(255,255,255,0.08)',
    border: '1px solid rgba(212,175,55,0.3)',
    borderRadius: '6px',
    color: '#e8edf5',
    fontSize: '0.85rem',
    outline: 'none',
  };

  return (
    <div style={{
      marginTop: '1.5rem',
      padding: '1.25rem 1.5rem',
      background: '#ffffff',
      borderRadius: '12px',
      border: '1px solid rgba(212,175,55,0.3)',
    }}>
      <h3 style={{
        marginBottom: '0.5rem',
        fontFamily: "'Playfair Display', serif",
        color: '#1a2f5a',
        fontSize: '1.1rem',
        fontWeight: 600,
      }}>Upload Old Pin Image</h3>
      <p style={{ fontSize: '0.8rem', color: '#444', marginBottom: '0.75rem' }}>
        Upload a photo of a pin and enter its real-world dimensions.
      </p>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'flex-end' }}>
        <label style={{ display: 'flex', flexDirection: 'column', fontSize: '0.8rem', color: '#333' }}>
          Pin image
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            style={{ marginTop: '0.25rem', color: '#333' }}
          />
        </label>
        <label style={{ display: 'flex', flexDirection: 'column', fontSize: '0.8rem', color: '#333' }}>
          Width (inches)
          <input
            type="number"
            step="0.0625"
            min="0.1"
            value={width}
            onChange={(e) => setWidth(e.target.value)}
            style={{ ...inputStyle, width: '5rem', color: '#333', background: '#f5f5f5' }}
          />
        </label>
        <label style={{ display: 'flex', flexDirection: 'column', fontSize: '0.8rem', color: '#333' }}>
          Height (inches)
          <input
            type="number"
            step="0.0625"
            min="0.1"
            value={height}
            onChange={(e) => setHeight(e.target.value)}
            style={{ ...inputStyle, width: '5rem', color: '#333', background: '#f5f5f5' }}
          />
        </label>
        <button
          type="submit"
          disabled={!file || !width || !height}
          style={{
            padding: '0.5rem 1.25rem',
            background: 'linear-gradient(135deg, #d4af37 0%, #b8960c 100%)',
            color: '#0a1628',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '0.85rem',
            opacity: !file || !width || !height ? 0.4 : 1,
          }}
        >
          Add Pin
        </button>
      </form>
      {preview && (
        <img
          src={preview}
          alt="Pin preview"
          style={{ marginTop: '0.75rem', maxWidth: '120px', borderRadius: '6px', border: '1px solid rgba(212,175,55,0.3)' }}
        />
      )}
    </div>
  );
}
