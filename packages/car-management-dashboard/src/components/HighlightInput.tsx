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
}

export const HighlightInput: React.FC<HighlightInputProps> = ({
  value,
  onChange,
  placeholder = { title: '特色标题', icon: '特色图标' },
}) => {
  const { currentTenant } = useAuth();
  const [inputTitle, setInputTitle] = useState('');
  const [inputIcon, setInputIcon] = useState('');

  const addHighlight = () => {
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
          />
        </div>
        <input
          type="text"
          value={inputTitle}
          onChange={(e) => setInputTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder.title}
          className={highlightInputStyles.titleInput}
        />
        <button
          type="button"
          onClick={addHighlight}
          className={highlightInputStyles.addButton}
          disabled={!inputTitle.trim() || !inputIcon.trim()}
        >
          <FontAwesomeIcon icon={faPlus} />
        </button>
      </div>
    </div>
  );
}; 