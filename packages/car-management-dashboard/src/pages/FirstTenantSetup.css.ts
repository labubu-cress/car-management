import { style } from '@vanilla-extract/css';

export const container = style({
  minHeight: '100vh',
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '20px',
});

export const setupBox = style({
  background: 'white',
  borderRadius: '16px',
  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
  padding: '40px',
  width: '100%',
  maxWidth: '600px',
});

export const header = style({
  textAlign: 'center',
  marginBottom: '40px',
});

export const iconWrapper = style({
  width: '80px',
  height: '80px',
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  margin: '0 auto 20px',
});

export const headerIcon = style({
  fontSize: '32px',
  color: 'white',
});

export const title = style({
  fontSize: '28px',
  fontWeight: 'bold',
  color: '#333',
  marginBottom: '10px',
});

export const subtitle = style({
  fontSize: '16px',
  color: '#666',
  lineHeight: '1.5',
});

export const stepsContainer = style({
  display: 'flex',
  justifyContent: 'space-between',
  marginBottom: '40px',
  padding: '0 20px',
});

export const step = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  flex: 1,
  position: 'relative',
});

export const stepNumber = style({
  width: '40px',
  height: '40px',
  borderRadius: '50%',
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  color: 'white',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontWeight: 'bold',
  marginBottom: '10px',
  position: 'relative',
  zIndex: 1,
});

export const stepContent = style({
  textAlign: 'center',
});

export const form = style({
  marginBottom: '30px',
});

export const inputGroup = style({
  marginBottom: '24px',
});

export const label = style({
  display: 'flex',
  alignItems: 'center',
  fontSize: '14px',
  fontWeight: '600',
  color: '#333',
  marginBottom: '8px',
});

export const labelIcon = style({
  marginRight: '8px',
  color: '#667eea',
});

export const input = style({
  width: '100%',
  padding: '12px 16px',
  border: '2px solid #e0e0e0',
  borderRadius: '8px',
  fontSize: '16px',
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

export const submitButton = style({
  width: '100%',
  padding: '16px',
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  color: 'white',
  border: 'none',
  borderRadius: '8px',
  fontSize: '16px',
  fontWeight: '600',
  cursor: 'pointer',
  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  
  ':hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 20px rgba(102, 126, 234, 0.3)',
  },
  
  ':disabled': {
    opacity: 0.7,
    cursor: 'not-allowed',
    transform: 'none',
  },
});

export const buttonIcon = style({
  marginRight: '8px',
});

export const tips = style({
  background: '#f8f9fa',
  borderRadius: '8px',
  padding: '20px',
});

export const tipsTitle = style({
  margin: '0 0 12px 0',
  color: '#333',
  fontSize: '16px',
});

export const tipsList = style({
  margin: 0,
  paddingLeft: '20px',
});

export const tipsItem = style({
  color: '#666',
  fontSize: '14px',
  lineHeight: '1.6',
  marginBottom: '8px',
}); 