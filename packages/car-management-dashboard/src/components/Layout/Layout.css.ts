import { style } from '@vanilla-extract/css';

export const layout = style({
  display: 'flex',
  height: '100vh',
});

export const main = style({
  flex: 1,
  marginLeft: '250px',
  display: 'flex',
  flexDirection: 'column',
});

export const content = style({
  flex: 1,
  padding: '24px',
  backgroundColor: '#f5f5f5',
  overflow: 'auto',
}); 