import React from 'react';
import './App.css';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

document.documentElement.setAttribute(
  'data-theme',
  localStorage.getItem('theme') || 'dark'
);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
