import { style } from '@vanilla-extract/css';

export const container = style({
  padding: '24px',
});

export const scenarioImage = style({
  width: '60px',
  height: '40px',
  objectFit: 'cover',
  borderRadius: '4px',
});

export const description = style({
  maxWidth: '300px',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
});

export const noTenant = style({
  textAlign: 'center',
  padding: '60px 20px',
  color: '#666',
});

export const modalFooter = style({
  display: 'flex',
  gap: '12px',
});

export const form = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '20px',
});

export const formGroup = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
});

export const label = style({
  fontSize: '14px',
  fontWeight: '600',
  color: '#333',
});

export const input = style({
  padding: '12px 16px',
  border: '2px solid #e0e0e0',
  borderRadius: '6px',
  fontSize: '14px',
  transition: 'border-color 0.3s ease',
  
  ':focus': {
    outline: 'none',
    borderColor: '#667eea',
  },
  
  ':disabled': {
    backgroundColor: '#f5f5f5',
    cursor: 'not-allowed',
  },
});

export const textarea = style({
  padding: '12px 16px',
  border: '2px solid #e0e0e0',
  borderRadius: '6px',
  fontSize: '14px',
  resize: 'vertical',
  minHeight: '100px',
  transition: 'border-color 0.3s ease',
  
  ':focus': {
    outline: 'none',
    borderColor: '#667eea',
  },
  
  ':disabled': {
    backgroundColor: '#f5f5f5',
    cursor: 'not-allowed',
  },
});

export const imagePreview = style({
  marginTop: '8px',
});

export const previewImage = style({
  maxWidth: '200px',
  maxHeight: '120px',
  objectFit: 'cover',
  borderRadius: '4px',
  border: '1px solid #e0e0e0',
});

export const cancelButton = style({
  display: 'flex',
  alignItems: 'center',
  padding: '8px 16px',
  background: '#f5f5f5',
  color: '#666',
  border: 'none',
  borderRadius: '6px',
  fontSize: '14px',
  cursor: 'pointer',
  transition: 'background-color 0.2s ease',
  
  ':hover': {
    backgroundColor: '#e8e8e8',
  },
});

export const submitButton = style({
  display: 'flex',
  alignItems: 'center',
  padding: '8px 16px',
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  color: 'white',
  border: 'none',
  borderRadius: '6px',
  fontSize: '14px',
  cursor: 'pointer',
  transition: 'opacity 0.2s ease',
  
  ':disabled': {
    opacity: 0.7,
    cursor: 'not-allowed',
  },
});

export const buttonIcon = style({
  marginRight: '6px',
}); 