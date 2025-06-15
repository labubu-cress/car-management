import { globalStyle } from '@vanilla-extract/css';

// 重置样式
globalStyle('*', {
  margin: 0,
  padding: 0,
  boxSizing: 'border-box',
});

globalStyle('html, body', {
  height: '100%',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  fontSize: '14px',
  lineHeight: 1.5,
  color: '#333',
  backgroundColor: '#f5f5f5',
});

globalStyle('#root', {
  height: '100%',
});

globalStyle('button', {
  cursor: 'pointer',
  border: 'none',
  outline: 'none',
  fontFamily: 'inherit',
});

globalStyle('input, textarea, select', {
  fontFamily: 'inherit',
  fontSize: 'inherit',
  outline: 'none',
});

globalStyle('a', {
  textDecoration: 'none',
  color: 'inherit',
});

globalStyle('ul, ol', {
  listStyle: 'none',
});

// 滚动条样式
globalStyle('::-webkit-scrollbar', {
  width: '6px',
  height: '6px',
});

globalStyle('::-webkit-scrollbar-track', {
  backgroundColor: '#f1f1f1',
});

globalStyle('::-webkit-scrollbar-thumb', {
  backgroundColor: '#c1c1c1',
  borderRadius: '3px',
});

globalStyle('::-webkit-scrollbar-thumb:hover', {
  backgroundColor: '#a8a8a8',
}); 