import { describe, it, expect } from 'vitest';
import { normalizeIsraeliPhone, phoneToChatId } from '../phone';

describe('normalizeIsraeliPhone', () => {
  it('normalizes a local mobile with dashes', () => {
    expect(normalizeIsraeliPhone('050-123-4567')).toBe('972501234567');
  });

  it('normalizes a local mobile without separators', () => {
    expect(normalizeIsraeliPhone('0501234567')).toBe('972501234567');
  });

  it('normalizes a +972 international number with spaces', () => {
    expect(normalizeIsraeliPhone('+972 50 123 4567')).toBe('972501234567');
  });

  it('normalizes a 00972 international number', () => {
    expect(normalizeIsraeliPhone('00972501234567')).toBe('972501234567');
  });

  it('passes through an already-international number', () => {
    expect(normalizeIsraeliPhone('972501234567')).toBe('972501234567');
  });

  it('drops a redundant 0 after the country code', () => {
    expect(normalizeIsraeliPhone('9720501234567')).toBe('972501234567');
  });

  it('normalizes a bare local number without leading 0', () => {
    expect(normalizeIsraeliPhone('501234567')).toBe('972501234567');
  });

  it('normalizes a landline (8-digit local)', () => {
    expect(normalizeIsraeliPhone('04-123-4567')).toBe('97241234567');
  });

  it('returns null for empty / nullish input', () => {
    expect(normalizeIsraeliPhone('')).toBeNull();
    expect(normalizeIsraeliPhone(null)).toBeNull();
    expect(normalizeIsraeliPhone(undefined)).toBeNull();
  });

  it('returns null for clearly invalid input', () => {
    expect(normalizeIsraeliPhone('abc')).toBeNull();
    expect(normalizeIsraeliPhone('12')).toBeNull();
    expect(normalizeIsraeliPhone('0501')).toBeNull();
  });
});

describe('phoneToChatId', () => {
  it('appends @c.us to a normalized number', () => {
    expect(phoneToChatId('050-123-4567')).toBe('972501234567@c.us');
  });

  it('returns null when the phone cannot be normalized', () => {
    expect(phoneToChatId('not-a-phone')).toBeNull();
    expect(phoneToChatId(null)).toBeNull();
  });
});
