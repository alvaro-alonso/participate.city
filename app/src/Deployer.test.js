import React from 'react';
import Deployer from './Deployer';
import { render, fireEvent, cleanup, queryByAttribute } from '@testing-library/react'

// afterEach(cleanup);
const getById = queryByAttribute.bind(null, 'id');

describe('Deployer: Input validation', () => {
  const deployer = render(<Deployer/>);
  const status = getById(deployer.container, 'status');

  test('Test budget input', () => {
    const budget = getById(deployer.container, 'budget');
    expect(budget.value).toBe('');

    fireEvent.change(budget, { target: { value: '23' }});
    expect(budget.value).toBe('23');

    fireEvent.change(budget, { target: { value: '23a' }});
    expect(budget.value).toBe('');
    expect(status.textContent).toBe('budget must be a positive integer');

    fireEvent.change(budget, { target: { value: '1' }});
    expect(budget.value).toBe('1');
    expect(status.textContent).toBe('');
    
    fireEvent.change(budget, { target: { value: '-1' }});
    expect(budget.value).toBe('');
    expect(status.textContent).toBe('budget must be a positive integer');
  });

  // test('Test candidates input', () => {
  //   const newCandidateInput = getById(deployer.container, 'candidate');
  //   const addCandidateButton = getById(deployer.container, 'addCandidateButton');
  //   console.log(deployer.container);
  //   expect(newCandidateInput).toBe('');

  //   fireEvent.change(newCandidateInput, { target: { value: 'Juan' }});
  //   fireEvent.click(addCandidateButton);
  //   fireEvent.change(newCandidateInput, { target: { value: 'Juan' }});
  //   fireEvent.click(addCandidateButton);
  //   expect(status.textContent).toBe('Candidate Name already inserted. Make sure candidates names are unique'); 

  // });
});