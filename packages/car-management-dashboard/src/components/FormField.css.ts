import { style } from '@vanilla-extract/css';

export const formFieldStyles = {
  container: style({
    marginBottom: '20px',
  }),

  label: style({
    display: 'block',
    marginBottom: '6px',
    fontSize: '14px',
    fontWeight: '500',
    color: '#374151',
  }),

  required: style({
    color: '#ef4444',
    marginLeft: '4px',
  }),

  inputContainer: style({
    marginBottom: '4px',
  }),

  error: style({
    fontSize: '12px',
    color: '#ef4444',
    display: 'block',
  }),

  input: style({
    width: '100%',
    padding: '8px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.2s',
    ':focus': {
      borderColor: '#3b82f6',
      boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)',
    },
  }),

  textarea: style({
    width: '100%',
    padding: '8px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.2s',
    resize: 'vertical',
    minHeight: '80px',
    ':focus': {
      borderColor: '#3b82f6',
      boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)',
    },
  }),

  select: style({
    width: '100%',
    padding: '8px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.2s',
    backgroundColor: 'white',
    ':focus': {
      borderColor: '#3b82f6',
      boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)',
    },
  }),
}; 