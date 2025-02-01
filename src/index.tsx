import './index.css';
import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './app/App';
import { BrowserRouter as Router } from 'react-router-dom';
import { SettingsProvider } from './app/settings/SettingsContext';

const appElement = document.getElementById('app');
if (appElement) {
  createRoot(appElement).render(
    <StrictMode>
      <Router>
        <SettingsProvider>
          <App />
        </SettingsProvider>
      </Router>
    </StrictMode>
  );
}
