/**
 * state/sessionStore.js
 * Persists exercise session data to localStorage.
 */

const STORE_KEY = 'fitai_sessions';

export function saveSession(sessionData) {
  const sessions = getSessions();
  sessions.unshift({ ...sessionData, date: new Date().toISOString() });
  // Keep only the last 50 sessions
  localStorage.setItem(STORE_KEY, JSON.stringify(sessions.slice(0, 50)));
}

export function getSessions() {
  try {
    return JSON.parse(localStorage.getItem(STORE_KEY)) || [];
  } catch { return []; }
}

export function clearSessions() {
  localStorage.removeItem(STORE_KEY);
}
