import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';
import ShareModal from './ShareModal';

describe('ShareModal', () => {
  beforeEach(() => {
    global.alert.mockClear();
  });

  test('renders share modal when open', () => {
    render(
      <ShareModal
        isOpen={true}
        onClose={() => {}}
        user={{ firstName: 'John', lastName: 'Doe' }}
        onSubmitPost={() => {}}
        groups={[]}
      />
    );

    expect(screen.getByText(/share your journey/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/share your experience/i)).toBeInTheDocument();
  });

  test('allows typing in textarea', () => {
    render(
      <ShareModal
        isOpen={true}
        onClose={() => {}}
        user={{}}
        onSubmitPost={() => {}}
        groups={[]}
      />
    );

    const textarea = screen.getByPlaceholderText(/share your experience/i);

    fireEvent.change(textarea, {
      target: { value: 'My test post' }
    });

    expect(textarea.value).toBe('My test post');
  });

  test('submits post successfully', async () => {
    const mockSubmit = jest.fn();

    render(
      <ShareModal
        isOpen={true}
        onClose={() => {}}
        user={{}}
        onSubmitPost={mockSubmit}
        groups={[]}
      />
    );

    fireEvent.change(screen.getByPlaceholderText(/share your experience/i), {
      target: { value: 'Hello world' }
    });

    fireEvent.click(screen.getByRole('button', { name: /share/i }));

    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          content: 'Hello world',
          visibility: 'PUBLIC'
        })
      );
    });
  });

  test('shows error if content is empty', async () => {
    render(
      <ShareModal
        isOpen={true}
        onClose={() => {}}
        user={{}}
        onSubmitPost={() => {}}
        groups={[]}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /share/i }));

    expect(await screen.findByText(/content is required/i)).toBeInTheDocument();
  });

  test('requires group when visibility is GROUP', async () => {
    render(
      <ShareModal
        isOpen={true}
        onClose={() => {}}
        user={{}}
        onSubmitPost={() => {}}
        groups={[{ id: '1', name: 'Test Group' }]}
      />
    );

    fireEvent.click(screen.getByText(/community feed/i));

    const textarea = screen.getByPlaceholderText(/share your experience/i);
    fireEvent.change(textarea, {
      target: { value: 'Group post', name: 'content' }
    });

    fireEvent.click(screen.getByRole('button', { name: /share/i }));

    expect(global.alert).toHaveBeenCalledWith('Please select a group for community posts');
  });
});