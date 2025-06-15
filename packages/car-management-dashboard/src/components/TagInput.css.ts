import { style } from '@vanilla-extract/css';

export const tagInputStyles = {
  container: style({
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    padding: '4px',
    backgroundColor: 'white',
    minHeight: '40px',
    ':focus-within': {
      borderColor: '#3b82f6',
      boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)',
    },
  }),

  tagsContainer: style({
    display: 'flex',
    flexWrap: 'wrap',
    gap: '4px',
    alignItems: 'center',
  }),

  tag: style({
    display: 'inline-flex',
    alignItems: 'center',
    backgroundColor: '#e5e7eb',
    borderRadius: '4px',
    padding: '4px 8px',
    fontSize: '13px',
    color: '#374151',
    gap: '4px',
  }),

  removeButton: style({
    border: 'none',
    background: 'none',
    cursor: 'pointer',
    padding: '0',
    color: '#6b7280',
    fontSize: '10px',
    ':hover': {
      color: '#ef4444',
    },
  }),

  input: style({
    border: 'none',
    outline: 'none',
    padding: '4px',
    fontSize: '14px',
    minWidth: '120px',
    flex: '1',
    backgroundColor: 'transparent',
  }),
}; 