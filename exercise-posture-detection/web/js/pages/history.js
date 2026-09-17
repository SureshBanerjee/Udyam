/**
 * pages/history.js
 * Session History page.
 */

import { getSessions, clearSessions } from '../state/sessionStore.js';

export function renderHistory() {
  const sessions = getSessions();

  return `
<div class="fade-in">
  <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px">
    <div class="page-title">History 📊</div>
    ${sessions.length > 0
      ? '<button class="btn btn-danger btn-sm" id="hist-clear">🗑 Clear All</button>'
      : ''}
  </div>
  <div class="page-subtitle">Your past exercise sessions</div>

  ${sessions.length === 0
    ? `<div class="card" style="text-align:center;padding:48px">
         <div style="font-size:48px;margin-bottom:16px">📊</div>
         <div style="font-size:16px;font-weight:600;margin-bottom:8px">No sessions yet</div>
         <div style="color:var(--text-secondary);font-size:13px">
           Complete a workout to see your history here.
         </div>
       </div>`
    : `<div class="card">
         <div class="section-title">All Sessions (${sessions.length})</div>
         ${sessions.map(s => `
         <div class="history-entry">
           <div class="history-icon">
             ${s.exercise === 'pushup' ? '💪' : s.exercise === 'squat' ? '🦵' : '🔥'}
           </div>
           <div class="history-info">
             <div class="history-name">${s.exerciseName || s.exercise}</div>
             <div class="history-date">${formatDate(s.date)}</div>
             ${s.formErrors?.length > 0
               ? `<div style="font-size:11px;color:var(--accent-warning);margin-top:3px">
                    ⚠ ${s.formErrors.length} form alert${s.formErrors.length > 1 ? 's' : ''}
                  </div>`
               : `<div style="font-size:11px;color:var(--accent-good);margin-top:3px">✓ Clean form</div>`}
           </div>
           <div style="text-align:right">
             <div class="history-reps">${s.reps}</div>
             <div style="font-size:11px;color:var(--text-muted)">reps</div>
           </div>
         </div>`).join('')}
       </div>`}
</div>`;
}

export function bindHistoryEvents(container, refresh) {
  container.querySelector('#hist-clear')?.addEventListener('click', () => {
    if (confirm('Clear all session history?')) {
      clearSessions();
      refresh();
    }
  });
}

function formatDate(iso) {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      weekday: 'short', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  } catch { return iso; }
}
