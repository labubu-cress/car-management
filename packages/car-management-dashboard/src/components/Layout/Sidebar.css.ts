import { style } from '@vanilla-extract/css';

const colors = {
  primary: '#1890ff',
  primaryHover: '#40a9ff',
  background: '#ffffff',
  backgroundDark: '#001529',
};

export const sidebar = style({
  width: '250px',
  height: '100vh',
  backgroundColor: colors.backgroundDark,
  color: colors.background,
  display: 'flex',
  flexDirection: 'column',
  position: 'fixed',
  left: 0,
  top: 0,
  zIndex: 100,
});

export const logo = style({
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  padding: '24px 20px',
  borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
});

export const logoIcon = style({
  fontSize: '24px',
  color: colors.primary,
});

export const logoText = style({
  fontSize: '20px',
  fontWeight: 700,
});

export const nav = style({
  flex: 1,
  padding: '20px 0',
});

export const navItem = style({
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  padding: '12px 20px',
  color: 'rgba(255, 255, 255, 0.7)',
  textDecoration: 'none',
  transition: 'all 0.2s',
  ':hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    color: colors.background,
  },
});

export const navItemActive = style({
  backgroundColor: colors.primary,
  color: colors.background,
  ':hover': {
    backgroundColor: colors.primaryHover,
  },
});

export const navIcon = style({
  fontSize: '16px',
  width: '16px',
});

export const navText = style({
  fontSize: '14px',
  fontWeight: 500,
}); 