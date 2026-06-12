import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SendMessageDialog } from '../SendMessageDialog';

// Mock the WhatsApp hook so we can assert on sendMessage calls
const sendMessage = vi.fn();
vi.mock('@/hooks/whatsapp/useWhatsApp', () => ({
  useWhatsApp: () => ({
    sendMessage,
    sendNotification: vi.fn(),
    isLoading: false,
    error: null,
  }),
}));

describe('SendMessageDialog', () => {
  beforeEach(() => {
    sendMessage.mockReset();
    sendMessage.mockResolvedValue({ success: true, messageId: 'abc' });
  });

  it('shows an error state when the volunteer has no valid phone', () => {
    render(
      <SendMessageDialog
        open
        onOpenChange={vi.fn()}
        name="דנה"
        phone={null}
      />,
    );

    expect(screen.getByRole('alert')).toBeInTheDocument();
    // send button is disabled
    const sendBtn = screen.getByRole('button', { name: /שלח הודעה/ });
    expect(sendBtn).toBeDisabled();
  });

  it('disables send until a message is typed, then sends to the correct chatId', async () => {
    render(
      <SendMessageDialog
        open
        onOpenChange={vi.fn()}
        name="דנה"
        phone="050-123-4567"
      />,
    );

    const sendBtn = screen.getByRole('button', { name: /שלח הודעה/ });
    expect(sendBtn).toBeDisabled();

    const textarea = screen.getByLabelText('תוכן ההודעה');
    fireEvent.change(textarea, { target: { value: 'שלום!' } });

    expect(sendBtn).toBeEnabled();
    fireEvent.click(sendBtn);

    await waitFor(() => {
      expect(sendMessage).toHaveBeenCalledWith('972501234567@c.us', 'שלום!');
    });
  });

  it('does not send an empty / whitespace-only message', () => {
    render(
      <SendMessageDialog
        open
        onOpenChange={vi.fn()}
        name="דנה"
        phone="0501234567"
      />,
    );

    const textarea = screen.getByLabelText('תוכן ההודעה');
    fireEvent.change(textarea, { target: { value: '   ' } });

    const sendBtn = screen.getByRole('button', { name: /שלח הודעה/ });
    expect(sendBtn).toBeDisabled();
    expect(sendMessage).not.toHaveBeenCalled();
  });
});
