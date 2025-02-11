import './index.css';
import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './app/App';
import { BrowserRouter as Router } from 'react-router-dom';
import { AppStateProvider } from './app/AppContext';

const appElement = document.getElementById('app');

if (appElement) {

  const getBaseName = () => {
    const pathSegments = window.location.pathname.split('/');
    console.log('path', pathSegments);
    if (pathSegments.length > 1) {
      return `/${pathSegments[0]}`;
    }
    return '/';
  };

  createRoot(appElement).render(
    <StrictMode>
      <Router basename={getBaseName()}>
        <AppStateProvider>
          <App />
        </AppStateProvider>
      </Router>
    </StrictMode>
  );
}
