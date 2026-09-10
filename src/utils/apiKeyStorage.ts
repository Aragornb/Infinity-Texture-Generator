const STORAGE_KEY = 'infinity_gemini_api_key';

/**
 * Retrieves the user-provided GEMINI_API_KEY from browser localStorage.
 */
export function getStoredApiKey(): string {
  try {
    return (localStorage.getItem(STORAGE_KEY) || '').trim();
  } catch {
    return '';
  }
}

/**
 * Saves or updates the user-provided GEMINI_API_KEY into browser localStorage.
 */
export function setStoredApiKey(key: string): void {
  try {
    const trimmed = (key || '').trim();
    if (!trimmed) {
      localStorage.removeItem(STORAGE_KEY);
    } else {
      localStorage.setItem(STORAGE_KEY, trimmed);
    }
    window.dispatchEvent(new CustomEvent('infinity_api_key_changed'));
  } catch (e) {
    console.warn('Failed to save API key to localStorage:', e);
  }
}

/**
 * Removes the stored GEMINI_API_KEY from browser localStorage.
 */
export function removeStoredApiKey(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new CustomEvent('infinity_api_key_changed'));
  } catch (e) {
    console.warn('Failed to remove API key from localStorage:', e);
  }
}

/**
 * Generates API request headers including x-gemini-api-key if stored in localStorage.
 */
export function getApiHeaders(additionalHeaders?: Record<string, string>): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(additionalHeaders || {}),
  };
  const key = getStoredApiKey();
  if (key) {
    headers['x-gemini-api-key'] = key;
  }
  return headers;
}
