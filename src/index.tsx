import './index.css';
import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './app/App';
import { HashRouter as Router } from 'react-router-dom';
import { AppStateProvider } from './app/AppContext';

const appElement = document.getElementById('app');

if (appElement) {
  createRoot(appElement).render(
    <StrictMode>
      <Router>
        <AppStateProvider>
          <App />
        </AppStateProvider>
      </Router>
    </StrictMode>
  );
}
