import { faPlus, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { highlightInputStyles } from './HighlightInput.css';
import { ImageUpload } from './ImageUpload';

export interface Highlight {
  title: string;
  icon: string;
}

interface HighlightInputProps {
  value: Highlight[];
  onChange: (value: Highlight[]) => void;
  placeholder?: { title: string; icon: string };
  disabled?: boolean;
}

export const HighlightInput: React.FC<HighlightInputProps> = ({
  value,
  onChange,
  placeholder = { title: '特色标题', icon: '特色图标' },
  disabled = false,
}) => {
  const { currentTenant } = useAuth();
  const [inputTitle, setInputTitle] = useState('');
  const [inputIcon, setInputIcon] = useState('');

  const addHighlight = () => {
    if (disabled) return;
    const trimmedTitle = inputTitle.trim();
    const trimmedIcon = inputIcon.trim();

    if (trimmedTitle && trimmedIcon) {
      const exists = value.some(h => h.title === trimmedTitle);
      if (!exists) {
        onChange([...value, { title: trimmedTitle, icon: trimmedIcon }]);
        setInputTitle('');
        setInputIcon('');
      }
    }
  };

  const removeHighlight = (index: number) => {
    if (disabled) return;
    const newHighlights = value.filter((_, i) => i !== index);
    onChange(newHighlights);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addHighlight();
    }
  };

  return (
    <div className={highlightInputStyles.container}>
      {value.map((highlight, index) => (
        <div key={index} className={highlightInputStyles.highlight}>
          <div className={highlightInputStyles.highlightContent}>
            <img src={highlight.icon} alt={highlight.title} className={highlightInputStyles.icon} />
            <strong>{highlight.title}</strong>
          </div>
          <button
            type="button"
            onClick={() => removeHighlight(index)}
            className={highlightInputStyles.removeButton}
            disabled={disabled}
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>
      ))}
      
      <div className={highlightInputStyles.inputRow}>
        <div className={highlightInputStyles.valueInput}>
          <ImageUpload
            value={inputIcon}
            onChange={(url) => setInputIcon(url)}
            tenantId={currentTenant!.id}
            size={40}
            placeholder="图标"
            disabled={disabled}
          />
        </div>
        <input
          type="text"
          value={inputTitle}
          onChange={(e) => setInputTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder.title}
          className={highlightInputStyles.titleInput}
          disabled={disabled}
        />
        <button
          type="button"
          onClick={addHighlight}
          className={highlightInputStyles.addButton}
          disabled={disabled || !inputTitle.trim() || !inputIcon.trim()}
        >
          <FontAwesomeIcon icon={faPlus} />
        </button>
      </div>
    </div>
  );
}; 