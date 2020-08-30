import React from 'react';
import Deployer from './Deployer';
import { render, fireEvent, cleanup, waitFor, queryByAttribute } from '@testing-library/react'

afterEach(cleanup);
const getById = queryByAttribute.bind(null, 'id');

test('Deployer: Test budget input', () => {
  const deployer = render(<Deployer/>);
  const input = getById(deployer.container, 'budget');
  expect(input.value).toBe('');

  // fireEvent.change(input, { target: { value: '23a3' }});
  // const status = deployer.getByText('budget must be an integer');
  // expect(status).toBeInTheDocument();

  fireEvent.change(input, { target: { value: 1000 }});
  expect(input.value).toBe('1000');
  
});