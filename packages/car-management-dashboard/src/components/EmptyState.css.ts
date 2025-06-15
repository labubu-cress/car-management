import { style } from '@vanilla-extract/css';

export const emptyStateStyles = {
  container: style({
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '400px',
    padding: '40px 20px',
  }),

  content: style({
    textAlign: 'center',
    maxWidth: '400px',
  }),

  icon: style({
    marginBottom: '16px',
    fontSize: '48px',
    color: '#9ca3af',
  }),

  title: style({
    fontSize: '20px',
    fontWeight: '600',
    color: '#374151',
    marginBottom: '8px',
  }),

  description: style({
    fontSize: '16px',
    color: '#6b7280',
    marginBottom: '24px',
    lineHeight: '1.5',
  }),

  button: style({
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 24px',
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    ':hover': {
      backgroundColor: '#2563eb',
    },
  }),
}; 