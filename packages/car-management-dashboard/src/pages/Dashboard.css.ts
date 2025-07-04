import { style } from '@vanilla-extract/css';

const colors = {
  background: '#ffffff',
  text: '#333333',
  textSecondary: '#666666',
  border: '#d9d9d9',
};

export const dashboard = style({
  padding: '0',
});

export const header = style({
  marginBottom: '32px',
});

export const title = style({
  fontSize: '32px',
  fontWeight: 700,
  color: colors.text,
  marginBottom: '8px',
});

export const subtitle = style({
  fontSize: '16px',
  color: colors.textSecondary,
});

export const statsGrid = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
  gap: '24px',
  marginBottom: '32px',
});

export const statCard = style({
  display: 'flex',
  alignItems: 'center',
  gap: '16px',
  padding: '24px',
  backgroundColor: colors.background,
  borderRadius: '12px',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
  transition: 'transform 0.2s',
  cursor: 'pointer',
  ':hover': {
    transform: 'translateY(-2px)',
  },
});

export const statIcon = style({
  width: '48px',
  height: '48px',
  borderRadius: '12px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '20px',
});

export const statContent = style({
  flex: 1,
});

export const statValue = style({
  fontSize: '24px',
  fontWeight: 700,
  color: colors.text,
  marginBottom: '4px',
});

export const statTitle = style({
  fontSize: '14px',
  color: colors.textSecondary,
});

export const content = style({
  display: 'grid',
  gap: '24px',
});

export const card = style({
  backgroundColor: colors.background,
  borderRadius: '12px',
  padding: '24px',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
});

export const cardTitle = style({
  fontSize: '20px',
  fontWeight: 600,
  color: colors.text,
  marginBottom: '20px',
});

export const quickActions = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
  gap: '20px',
});

export const quickAction = style({
  padding: '20px',
  border: `1px solid ${colors.border}`,
  borderRadius: '8px',
  transition: 'border-color 0.2s',
  cursor: 'pointer',
  ':hover': {
    borderColor: '#1890ff',
  },
});

export const quickAction_h3 = style({
  fontSize: '16px',
  fontWeight: 600,
  color: colors.text,
  marginBottom: '8px',
});

export const quickAction_p = style({
  fontSize: '14px',
  color: colors.textSecondary,
  lineHeight: 1.5,
}); 