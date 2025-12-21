import React from 'react';
import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import { HashRouter as Router } from 'react-router-dom';
import { App } from './App';
import { AppStateProvider } from './AppContext';

test('renders an element with class "musicbox"', () => {
  const { container } = render(
    <Router>
      <AppStateProvider>
        <App />
      </AppStateProvider>
    </Router>
  );
  const element = container.querySelector('.musicbox');
  expect(element).toBeInTheDocument();
});
