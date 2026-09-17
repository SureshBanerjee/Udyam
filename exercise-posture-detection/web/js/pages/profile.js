/**
 * pages/profile.js
 * Profile page.
 */

import { getSessions } from '../state/sessionStore.js';

export function renderProfile() {
  const sessions = getSessions();
  const byType = { pushup: 0, squat: 0, situp: 0 };
  let totalReps = 0;
  sessions.forEach(s => {
    byType[s.exercise] = (byType[s.exercise] || 0) + (s.reps || 0);
    totalReps += s.reps || 0;
  });
  const favourite = Object.entries(byType).sort((a,b) => b[1]-a[1])[0];

  return `
<div class="fade-in">
  <div class="page-title">Profile 👤</div>
  <div class="page-subtitle">Your fitness overview and preferences</div>

  <div class="profile-header">
    <div class="profile-avatar">A</div>
    <div class="profile-name">Athlete</div>
    <div class="profile-level">Pro Member · FitAI Beta</div>
    <div style="margin-top:16px;display:flex;gap:12px;justify-content:center">
      <span class="badge badge-good">✓ AI Vision Enabled</span>
      <span class="badge badge-info">MediaPipe Pose</span>
    </div>
  </div>

  <div class="grid-2" style="gap:16px">
    <div class="card">
      <div class="section-title">📊 Performance Stats</div>
      <div style="display:flex;flex-direction:column;gap:10px">
        ${[
          ['Total Sessions', sessions.length],
          ['Total Reps',     totalReps],
          ['Push-up Reps',   byType.pushup || 0],
          ['Squat Reps',     byType.squat  || 0],
          ['Sit-up Reps',    byType.situp  || 0],
        ].map(([label, val]) => `
        <div style="display:flex;justify-content:space-between;align-items:center;
                    padding:8px 0;border-bottom:1px solid var(--border)">
          <span style="font-size:13px;color:var(--text-secondary)">${label}</span>
          <span style="font-weight:700;font-size:15px">${val}</span>
        </div>`).join('')}
        <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0">
          <span style="font-size:13px;color:var(--text-secondary)">Favourite Exercise</span>
          <span style="font-weight:700;font-size:15px">
            ${favourite && favourite[1] > 0 
              ? (favourite[0] === 'pushup' ? '💪 Push-up' : favourite[0] === 'squat' ? '🦵 Squat' : '🔥 Sit-up')
              : '—'}
          </span>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="section-title">🤖 AI System</div>
      <div style="display:flex;flex-direction:column;gap:8px">
        ${[
          ['Pose Model',      'MediaPipe Pose Landmarker Lite'],
          ['Inference',       'Browser (client-side WASM)'],
          ['Landmarks',       '33 body keypoints'],
          ['Exercises',       'Push-up, Squat, Sit-up'],
          ['Frame Upload',    'None — fully client-side'],
          ['Latency',         '~30ms per frame (GPU)'],
        ].map(([k, v]) => `
        <div style="display:flex;justify-content:space-between;align-items:center;
                    padding:6px 0;border-bottom:1px solid var(--border);font-size:12px">
          <span style="color:var(--text-secondary)">${k}</span>
          <span style="font-weight:500;text-align:right;max-width:55%">${v}</span>
        </div>`).join('')}
      </div>
      <div class="msg-box info" style="margin-top:12px;font-size:12px">
        ℹ This system provides assistive fitness feedback, not medical-grade diagnosis.
      </div>
    </div>
  </div>
</div>`;
}
