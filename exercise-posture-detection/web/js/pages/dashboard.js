/**
 * pages/dashboard.js
 * Dashboard page renderer.
 */

import { getSessions } from '../state/sessionStore.js';

export function renderDashboard() {
  const sessions = getSessions();
  const totalReps   = sessions.reduce((s, x) => s + (x.reps || 0), 0);
  const totalSessions = sessions.length;
  const streak = computeStreak(sessions);
  const lastSession = sessions[0];

  return `
<div class="fade-in">
  <div class="page-title">Good evening, Athlete 👋</div>
  <div class="page-subtitle">Ready to crush your workout today?</div>

  <div class="welcome-card">
    <div class="welcome-title">Your AI Fitness Coach is Ready</div>
    <div class="welcome-sub">Real-time pose detection • Form analysis • Rep counting • Personalized recommendations</div>
    <div style="margin-top:20px">
      <button class="btn btn-primary btn-lg" id="dash-go-workout">
        🏋️ Start Workout
      </button>
    </div>
  </div>

  <div class="quick-stats">
    <div class="quick-stat">
      <div class="qs-icon">🏆</div>
      <div class="qs-value">${totalSessions}</div>
      <div class="qs-label">Sessions</div>
    </div>
    <div class="quick-stat">
      <div class="qs-icon">🔁</div>
      <div class="qs-value">${totalReps}</div>
      <div class="qs-label">Total Reps</div>
    </div>
    <div class="quick-stat">
      <div class="qs-icon">🔥</div>
      <div class="qs-value">${streak}</div>
      <div class="qs-label">Day Streak</div>
    </div>
    <div class="quick-stat">
      <div class="qs-icon">💪</div>
      <div class="qs-value">${lastSession ? lastSession.reps : '—'}</div>
      <div class="qs-label">Last Session Reps</div>
    </div>
  </div>

  <div class="grid-2" style="gap:20px">
    <div class="card">
      <div class="section-title">🎯 Supported Exercises</div>
      <div style="display:flex;flex-direction:column;gap:10px">
        ${[['💪','Push-up','Elbow, shoulder, back alignment tracking'],
           ['🦵','Squat','Knee angle, depth, valgus detection'],
           ['🔥','Sit-up','Torso angle, full range of motion']].map(([icon,name,desc]) => `
        <div style="display:flex;align-items:center;gap:12px;padding:10px 14px;
                    background:var(--bg-primary);border:1px solid var(--border);border-radius:var(--radius-sm)">
          <span style="font-size:22px">${icon}</span>
          <div>
            <div style="font-weight:600;font-size:14px">${name}</div>
            <div style="font-size:12px;color:var(--text-secondary)">${desc}</div>
          </div>
        </div>`).join('')}
      </div>
    </div>

    <div class="card">
      <div class="section-title">📈 Recent Activity</div>
      ${sessions.length === 0
        ? '<div style="color:var(--text-muted);font-size:13px;text-align:center;padding:20px">No sessions yet — start your first workout!</div>'
        : sessions.slice(0, 4).map(s => `
        <div class="history-entry">
          <div class="history-icon">
            ${s.exercise === 'pushup' ? '💪' : s.exercise === 'squat' ? '🦵' : '🔥'}
          </div>
          <div class="history-info">
            <div class="history-name">${s.exerciseName || s.exercise}</div>
            <div class="history-date">${formatDate(s.date)}</div>
          </div>
          <div class="history-reps">${s.reps}</div>
        </div>`).join('')}
    </div>
  </div>
</div>`;
}

export function bindDashboardEvents(container, navigate) {
  container.querySelector('#dash-go-workout')?.addEventListener('click', () => navigate('workout'));
}

function computeStreak(sessions) {
  if (!sessions.length) return 0;
  const days = new Set(sessions.map(s => s.date ? s.date.split('T')[0] : null).filter(Boolean));
  let streak = 0;
  let d = new Date();
  while (days.has(d.toISOString().split('T')[0])) {
    streak++;
    d.setDate(d.getDate() - 1);
  }
  return streak;
}

function formatDate(iso) {
  if (!iso) return 'Unknown';
  try {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  } catch { return iso; }
}
