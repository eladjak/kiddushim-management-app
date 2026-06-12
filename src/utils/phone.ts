/**
 * Phone number utilities for Israeli numbers + GreenAPI chatId formatting.
 *
 * GreenAPI expects a chatId in the form `<international-number>@c.us`
 * with no leading `+` and no separators, e.g. `972501234567@c.us`.
 */

/** Default country code for Israeli numbers (no leading +). */
const DEFAULT_COUNTRY_CODE = '972';

/**
 * Normalize an Israeli phone number to international digits (no +, no separators).
 *
 * Handles common local formats:
 *  - `050-123-4567` / `0501234567` → `972501234567`
 *  - `+972 50 123 4567` / `00972...` → `972501234567`
 *  - already-international `972501234567` → unchanged
 *
 * @returns the normalized digit string, or `null` if the input can't be parsed
 *          into a plausible phone number.
 */
export function normalizeIsraeliPhone(raw: string | null | undefined): string | null {
  if (!raw) return null;

  // Strip everything that isn't a digit or a leading +
  let digits = raw.trim().replace(/[^\d+]/g, '');
  if (!digits) return null;

  // 00-prefixed international → drop the 00
  if (digits.startsWith('00')) {
    digits = digits.slice(2);
  }

  // +-prefixed international → drop the +
  if (digits.startsWith('+')) {
    digits = digits.slice(1);
  }

  // Already international Israeli (972...)
  if (digits.startsWith(DEFAULT_COUNTRY_CODE)) {
    const rest = digits.slice(DEFAULT_COUNTRY_CODE.length);
    // 972 followed by a leading 0 (e.g. 9720501234567) → drop the 0
    const cleaned = rest.startsWith('0') ? rest.slice(1) : rest;
    if (cleaned.length < 8 || cleaned.length > 9) return null;
    return DEFAULT_COUNTRY_CODE + cleaned;
  }

  // Local format with leading 0 (e.g. 0501234567)
  if (digits.startsWith('0')) {
    const local = digits.slice(1);
    if (local.length < 8 || local.length > 9) return null;
    return DEFAULT_COUNTRY_CODE + local;
  }

  // Bare local number without leading 0 (e.g. 501234567)
  if (digits.length >= 8 && digits.length <= 9) {
    return DEFAULT_COUNTRY_CODE + digits;
  }

  return null;
}

/**
 * Convert a phone number to a GreenAPI chatId (`<number>@c.us`).
 *
 * @returns the chatId, or `null` if the phone can't be normalized.
 */
export function phoneToChatId(raw: string | null | undefined): string | null {
  const normalized = normalizeIsraeliPhone(raw);
  return normalized ? `${normalized}@c.us` : null;
}
