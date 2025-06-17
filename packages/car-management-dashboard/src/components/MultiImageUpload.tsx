import React from 'react';
import { ImageUpload } from './ImageUpload';
import { multiUploadStyles } from './MultiImageUpload.css';

interface MultiImageUploadProps {
  values: string[];
  onChange: (urls: string[]) => void;
  tenantId: string;
}

export const MultiImageUpload: React.FC<MultiImageUploadProps> = ({ values, onChange, tenantId }) => {
  const handleAddImage = (url: string) => {
    onChange([...values, url]);
  };

  const handleRemoveImage = (index: number) => {
    const newValues = [...values];
    newValues.splice(index, 1);
    onChange(newValues);
  };

  return (
    <div className={multiUploadStyles.container}>
      {values.map((url, index) => (
        <div key={index} className={multiUploadStyles.item}>
          <ImageUpload value={url} onChange={() => {}} tenantId={tenantId} />
          <button
            type="button"
            className={multiUploadStyles.deleteButton}
            onClick={() => handleRemoveImage(index)}
          >
            &times;
          </button>
        </div>
      ))}
      <div className={multiUploadStyles.addButton}>
        <ImageUpload value={null} onChange={handleAddImage} tenantId={tenantId} />
      </div>
    </div>
  );
}; 