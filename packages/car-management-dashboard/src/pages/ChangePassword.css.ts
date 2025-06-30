import { globalStyle, style } from '@vanilla-extract/css';
import { colors } from '../styles/theme.css';

export const container = style({
  padding: '2rem',
  backgroundColor: colors.background,
  maxWidth: '600px',
  margin: '2rem auto',
  borderRadius: '8px',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
  gap: '1.5rem',
});

export const form = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '1.5rem',
});

export const formGroup = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem',
});

globalStyle(`${formGroup} label`, {
  fontWeight: 'bold',
  color: colors.text,
});

globalStyle(`${formGroup} input`, {
  padding: '0.75rem',
  borderRadius: '6px',
  border: `1px solid ${colors.border}`,
  fontSize: '1rem',
});

export const submitButton = style({
  padding: '0.75rem',
  borderRadius: '6px',
  border: 'none',
  backgroundColor: colors.primary,
  color: colors.background,
  fontSize: '1rem',
  fontWeight: 'bold',
  cursor: 'pointer',
  transition: 'background-color 0.3s ease',

  ':hover': {
    backgroundColor: colors.primaryHover,
  },
});

export const error = style({
  color: colors.error,
  textAlign: 'center',
});

export const success = style({
  color: colors.success,
  textAlign: 'center',
}); 