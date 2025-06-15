import { faPlus, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useState } from 'react';
import { highlightInputStyles } from './HighlightInput.css';

export interface Highlight {
  title: string;
  value: string;
}

interface HighlightInputProps {
  value: Highlight[];
  onChange: (value: Highlight[]) => void;
  placeholder?: { title: string; value: string };
}

export const HighlightInput: React.FC<HighlightInputProps> = ({ 
  value, 
  onChange, 
  placeholder = { title: '特色标题', value: '特色内容' }
}) => {
  const [inputTitle, setInputTitle] = useState('');
  const [inputValue, setInputValue] = useState('');

  const addHighlight = () => {
    const trimmedTitle = inputTitle.trim();
    const trimmedValue = inputValue.trim();
    
    if (trimmedTitle && trimmedValue) {
      const exists = value.some(h => h.title === trimmedTitle);
      if (!exists) {
        onChange([...value, { title: trimmedTitle, value: trimmedValue }]);
        setInputTitle('');
        setInputValue('');
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
            <strong>{highlight.title}:</strong> {highlight.value}
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
        <input
          type="text"
          value={inputTitle}
          onChange={(e) => setInputTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder.title}
          className={highlightInputStyles.titleInput}
        />
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder.value}
          className={highlightInputStyles.valueInput}
        />
        <button
          type="button"
          onClick={addHighlight}
          className={highlightInputStyles.addButton}
          disabled={!inputTitle.trim() || !inputValue.trim()}
        >
          <FontAwesomeIcon icon={faPlus} />
        </button>
      </div>
    </div>
  );
}; 