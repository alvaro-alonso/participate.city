import React from 'react';
import { render } from '@testing-library/react';
import Election from './Election';

test('renders learn react link', () => {
  const { getByText } = render(<Election />);
  const linkElement = getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});
