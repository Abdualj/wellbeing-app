import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Register from './Register';
import React from 'react';
import '@testing-library/jest-dom';


test('renders register form correctly', () => {
  render(<Register />);

  expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
});


test('registers successfully', async () => {
  global.fetch.mockResolvedValue({
    ok: true,
    json: async () => ({
      data: {
        accessToken: 'abc123',
        user: { id: '1' }
      }
    })
  });

  render(<Register />);

  fireEvent.change(screen.getByLabelText(/first name/i), {
    target: { name: 'firstname', value: 'John' }
  });

  fireEvent.change(screen.getByLabelText(/last name/i), {
    target: { name: 'lastname', value: 'Doe' }
  });

  fireEvent.change(screen.getByLabelText(/email/i), {
    target: { name: 'email', value: 'test@test.com' }
  });

  fireEvent.change(screen.getByLabelText('Password'), {
    target: { name: 'password', value: 'password123' }
  });

  fireEvent.change(screen.getByLabelText('Confirm Password'), {
    target: { name: 'confirmPassword', value: 'password123' }
  });
    
fireEvent.click(screen.getByLabelText(/i agree/i));
fireEvent.click(screen.getByRole('button', { name: /register/i }));

  await waitFor(() => {
    expect(localStorage.getItem('token')).toBe('abc123');
  });
});