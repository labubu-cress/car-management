import { style } from '@vanilla-extract/css';

export const carTrimFormStyles = {
  container: style({
    maxWidth: '800px',
    margin: '0 auto',
    padding: '20px',
    backgroundColor: '#f9fafb',
    minHeight: '100vh',
  }),

  loading: style({
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '200px',
    fontSize: '16px',
    color: '#6b7280',
  }),

  emptyState: style({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '400px',
    padding: '40px',
    backgroundColor: 'white',
    borderRadius: '8px',
    textAlign: 'center',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
  }),

  createCategoryButton: style({
    padding: '12px 24px',
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '16px',
    fontWeight: '500',
    cursor: 'pointer',
    marginTop: '16px',
    ':hover': {
      backgroundColor: '#2563eb',
    },
  }),

  header: style({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
    padding: '0 0 16px 0',
    borderBottom: '1px solid #e5e7eb',
  }),

  title: style({
    fontSize: '24px',
    fontWeight: '600',
    color: '#111827',
    margin: '0',
  }),

  backButton: style({
    padding: '8px 16px',
    backgroundColor: '#6b7280',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    cursor: 'pointer',
    ':hover': {
      backgroundColor: '#4b5563',
    },
  }),

  form: style({
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '24px',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
  }),

  section: style({
    marginBottom: '32px',
    paddingBottom: '24px',
    borderBottom: '1px solid #f3f4f6',
    ':last-child': {
      borderBottom: 'none',
      marginBottom: '0',
      paddingBottom: '0',
    },
  }),

  sectionTitle: style({
    fontSize: '18px',
    fontWeight: '600',
    color: '#374151',
    marginBottom: '16px',
    margin: '0 0 16px 0',
  }),

  actions: style({
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    marginTop: '32px',
    paddingTop: '24px',
    borderTop: '1px solid #e5e7eb',
  }),

  cancelButton: style({
    padding: '10px 20px',
    backgroundColor: '#f3f4f6',
    color: '#374151',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    ':hover': {
      backgroundColor: '#e5e7eb',
    },
    ':disabled': {
      opacity: '0.5',
      cursor: 'not-allowed',
    },
  }),

  submitButton: style({
    padding: '10px 20px',
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    ':hover': {
      backgroundColor: '#2563eb',
    },
    ':disabled': {
      opacity: '0.5',
      cursor: 'not-allowed',
    },
  }),
}; 