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

  return (
    <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#fff', borderRadius: '6px', border: '1px solid #ddd' }}>
      <h3 style={{ marginBottom: '0.5rem' }}>Upload Old Pin Image</h3>
      <p style={{ fontSize: '0.8rem', color: '#666', marginBottom: '0.75rem' }}>
        Upload a photo of a pin and enter its real-world dimensions.
      </p>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'flex-end' }}>
        <label style={{ display: 'flex', flexDirection: 'column', fontSize: '0.85rem' }}>
          Pin image
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            style={{ marginTop: '0.25rem' }}
          />
        </label>
        <label style={{ display: 'flex', flexDirection: 'column', fontSize: '0.85rem' }}>
          Width (inches)
          <input
            type="number"
            step="0.0625"
            min="0.1"
            value={width}
            onChange={(e) => setWidth(e.target.value)}
            style={{ width: '5rem', padding: '0.3rem', marginTop: '0.25rem' }}
          />
        </label>
        <label style={{ display: 'flex', flexDirection: 'column', fontSize: '0.85rem' }}>
          Height (inches)
          <input
            type="number"
            step="0.0625"
            min="0.1"
            value={height}
            onChange={(e) => setHeight(e.target.value)}
            style={{ width: '5rem', padding: '0.3rem', marginTop: '0.25rem' }}
          />
        </label>
        <button
          type="submit"
          disabled={!file || !width || !height}
          style={{
            padding: '0.4rem 1rem',
            background: '#0066cc',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            opacity: !file || !width || !height ? 0.5 : 1,
          }}
        >
          Add Pin
        </button>
      </form>
      {preview && (
        <img
          src={preview}
          alt="Pin preview"
          style={{ marginTop: '0.75rem', maxWidth: '120px', borderRadius: '4px', border: '1px solid #ccc' }}
        />
      )}
    </div>
  );
}
