import './index.css';
import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './app/App';

const appElement = document.getElementById('app');
if (appElement) {
  createRoot(appElement).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}
