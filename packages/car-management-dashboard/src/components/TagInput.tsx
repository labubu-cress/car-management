import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { KeyboardEvent, useState } from 'react';
import { tagInputStyles } from './TagInput.css';

interface TagInputProps {
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  maxTags?: number;
}

export const TagInput: React.FC<TagInputProps> = ({ 
  value, 
  onChange, 
  placeholder = '输入后按回车添加',
  maxTags
}) => {
  const [inputValue, setInputValue] = useState('');

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag();
    } else if (e.key === 'Backspace' && inputValue === '' && value.length > 0) {
      removeTag(value.length - 1);
    }
  };

  const addTag = () => {
    const trimmedValue = inputValue.trim();
    if (trimmedValue && !value.includes(trimmedValue)) {
      if (!maxTags || value.length < maxTags) {
        onChange([...value, trimmedValue]);
        setInputValue('');
      }
    }
  };

  const removeTag = (index: number) => {
    const newTags = value.filter((_, i) => i !== index);
    onChange(newTags);
  };

  return (
    <div className={tagInputStyles.container}>
      <div className={tagInputStyles.tagsContainer}>
        {value.map((tag, index) => (
          <span key={index} className={tagInputStyles.tag}>
            {tag}
            <button
              type="button"
              onClick={() => removeTag(index)}
              className={tagInputStyles.removeButton}
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </span>
        ))}
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={addTag}
          placeholder={value.length === 0 ? placeholder : ''}
          className={tagInputStyles.input}
          disabled={maxTags ? value.length >= maxTags : false}
        />
      </div>
    </div>
  );
}; 