import React from 'react';
import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import { App } from './App';

test('renders an element with class "tile"', () => {
  const { container } = render(<App />);
  const tileElement = container.querySelector('.tile');
  expect(tileElement).toBeInTheDocument();
});