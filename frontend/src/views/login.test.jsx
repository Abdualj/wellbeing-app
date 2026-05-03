import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Login from './Login';
import React from 'react';
import '@testing-library/jest-dom';

test('renders the login form correctly', () => {
  render(<Login />);

  expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
});

test('allows typing in email field', () => {
  render(<Login />);

  fireEvent.change(screen.getByLabelText(/email/i), {
    target: { value: 'test@example.com' }
  });

  expect(screen.getByLabelText(/email/i).value).toBe('test@example.com');
});

test('logs in successfully', async () => {
  global.fetch.mockResolvedValue({
    ok: true,
    json: async () => ({
      data: {
        accessToken: '123',
        user: { id: '1' }
      }
    })
  });

  render(<Login />);

  fireEvent.change(screen.getByLabelText(/email/i), {
    target: { name: 'email', value: 'test@test.com' }
  });

  fireEvent.change(screen.getByLabelText(/password/i), {
    target: { name: 'password', value: '123456' }
  });

  fireEvent.click(screen.getByRole('button', { name: /login/i }));

  await waitFor(() => {
    expect(localStorage.getItem('token')).toBe('123');
  });
});