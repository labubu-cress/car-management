import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';

console.log(`%c App Version: ${import.meta.env.APP_VERSION}`, 'color: #007bff; font-weight: bold;');
console.log(`%c Build Time: ${import.meta.env.BUILD_TIME}`, 'color: #28a745; font-weight: bold;');

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
) 