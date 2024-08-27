// src/index.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import PingWidget from './components/ping.tsx';
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <React.StrictMode>
    <PingWidget />
  </React.StrictMode>
);