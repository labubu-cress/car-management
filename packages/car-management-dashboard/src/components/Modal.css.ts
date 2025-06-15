import { style } from '@vanilla-extract/css';

export const overlay = style({
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
  padding: '20px',
});

export const modal = style({
  backgroundColor: 'white',
  borderRadius: '8px',
  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)',
  maxHeight: '90vh',
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
});

export const header = style({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '20px 24px',
  borderBottom: '1px solid #f0f0f0',
});

export const title = style({
  margin: 0,
  fontSize: '18px',
  fontWeight: '600',
  color: '#333',
});

export const closeButton = style({
  background: 'none',
  border: 'none',
  fontSize: '16px',
  color: '#666',
  cursor: 'pointer',
  padding: '4px',
  borderRadius: '4px',
  transition: 'color 0.2s ease, background-color 0.2s ease',
  
  ':hover': {
    color: '#333',
    backgroundColor: '#f5f5f5',
  },
});

export const content = style({
  padding: '24px',
  flex: 1,
  overflowY: 'auto',
});

export const footer = style({
  padding: '16px 24px',
  borderTop: '1px solid #f0f0f0',
  display: 'flex',
  justifyContent: 'flex-end',
  gap: '12px',
}); 
 