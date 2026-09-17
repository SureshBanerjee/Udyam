/**
 * features/liveExercise.js
 * Complete Live AI Exercise Detection feature.
 *
 * Manages:
 *  - Exercise selection UI
 *  - Camera lifecycle
 *  - MediaPipe pose inference loop
 *  - Exercise engine (state machine + form check)
 *  - Pose overlay rendering
 *  - Real-time stats panel
 *  - Session summary + recommendation
 */

import { loadPoseLandmarker, detectPose } from '../pose/mediapipe.js';
import { drawPoseSkeleton }               from '../pose/poseOverlay.js';
import { ExerciseEngine }                 from '../exercises/ExerciseEngine.js';
import { FormStatus }                     from '../exercises/types.js';
import { saveSession }                    from '../state/sessionStore.js';
import { getRecommendation }              from '../recommendations/recommendationEngine.js';

// ---- State ----
let engine       = new ExerciseEngine();
let stream       = null;      // MediaStream
let rafId        = null;      // requestAnimationFrame ID
let sessionStart = null;
let formErrors   = [];        // collected string errors for recommendation
let isRunning    = false;
let selectedExercise = null;  // 'pushup' | 'squat' | 'situp'

// ---- DOM refs (populated in mount) ----
let videoEl, canvasEl, ctx;

// ====================================================
// Public API
// ====================================================

export function mountLiveExercise(container) {
  container.innerHTML = buildHTML();
  bindElements(container);
  bindEvents(container);
}

export function unmountLiveExercise() {
  stopCamera();
}

// ====================================================
// HTML Builder
// ====================================================

function buildHTML() {
  return `
<div class="live-exercise-card" id="le-card">
  <!-- Header -->
  <div class="live-exercise-header">
    <div style="display:flex;align-items:center;gap:12px">
      <div class="live-badge" id="le-live-badge" style="display:none">
        <div class="live-dot"></div> LIVE
      </div>
      <div>
        <div style="font-family:'Space Grotesk',sans-serif;font-size:18px;font-weight:700">
          Live AI Exercise
        </div>
        <div style="font-size:12px;color:var(--text-secondary);margin-top:2px">
          Real-time pose detection & form analysis
        </div>
      </div>
    </div>
    <div style="display:flex;gap:8px;align-items:center">
      <span id="le-model-status" style="font-size:11px;color:var(--text-muted)"></span>
    </div>
  </div>

  <!-- Body -->
  <div class="live-exercise-body">

    <!-- Step 1: Exercise Selection -->
    <div id="le-step-select">
      <div class="exercise-selector">
        <div class="exercise-selector-title">Which exercise do you want to perform?</div>
        <div class="exercise-selector-sub">
          Select an exercise, then start your camera. The AI will track your form and count reps.
        </div>
        <div class="exercise-options">
          <div class="exercise-option" data-ex="pushup" tabindex="0" role="button" aria-label="Push-up">
            <div class="ex-icon">💪</div>
            <div class="ex-name">Push-up</div>
            <div class="ex-desc">Upper body<br>strength</div>
          </div>
          <div class="exercise-option" data-ex="squat" tabindex="0" role="button" aria-label="Squat">
            <div class="ex-icon">🦵</div>
            <div class="ex-name">Squat</div>
            <div class="ex-desc">Lower body<br>strength</div>
          </div>
          <div class="exercise-option" data-ex="situp" tabindex="0" role="button" aria-label="Sit-up">
            <div class="ex-icon">🔥</div>
            <div class="ex-name">Sit-up</div>
            <div class="ex-desc">Core<br>strength</div>
          </div>
        </div>
        <div id="le-select-error" class="msg-box error" style="display:none">
          ⚠ Please select an exercise before starting.
        </div>
        <div style="text-align:center">
          <button class="btn btn-primary btn-lg" id="le-btn-start-camera">
            📷 Start Camera
          </button>
        </div>
      </div>
    </div>

    <!-- Step 2: Live Camera + Stats -->
    <div id="le-step-live" style="display:none">
      <div class="live-layout">
        <!-- Camera -->
        <div>
          <div class="camera-container" id="le-cam-container">
            <div class="camera-placeholder" id="le-cam-placeholder">
              <div class="camera-placeholder-icon">📷</div>
              <div class="camera-placeholder-text" id="le-cam-msg">Initializing camera…</div>
            </div>
            <video id="le-video" class="camera-video" playsinline muted autoplay style="display:none"></video>
            <canvas id="le-canvas" class="camera-canvas" style="display:none"></canvas>
          </div>
          <div class="controls-row" style="margin-top:14px">
            <button class="btn btn-danger"     id="le-btn-stop">⏹ Stop</button>
            <button class="btn btn-secondary"  id="le-btn-reset">↺ Reset Reps</button>
            <button class="btn btn-secondary"  id="le-btn-change">🔄 Change Exercise</button>
          </div>
        </div>

        <!-- Stats Panel -->
        <div class="live-right">
          <!-- Exercise name -->
          <div class="stat-box">
            <div class="stat-box-label">Exercise</div>
            <div style="font-size:18px;font-weight:700;color:var(--accent-primary)" id="le-stat-name">—</div>
          </div>
          <!-- Reps -->
          <div class="stat-box" style="text-align:center">
            <div class="stat-box-label">Repetitions</div>
            <div class="stat-box-value rep" id="le-stat-reps">0</div>
          </div>
          <!-- Phase + Form -->
          <div class="live-stats-grid">
            <div class="stat-box">
              <div class="stat-box-label">Phase</div>
              <div class="stat-box-value info" id="le-stat-phase">READY</div>
            </div>
            <div class="stat-box">
              <div class="stat-box-label">Form</div>
              <div class="stat-box-value good" id="le-stat-form">—</div>
            </div>
          </div>
          <!-- Feedback -->
          <div class="feedback-box" id="le-feedback-box">
            <span id="le-feedback-text">Select an exercise and start camera</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Step 3: Session Summary -->
    <div id="le-step-summary" style="display:none"></div>

  </div>
</div>`;
}

// ====================================================
// DOM Binding
// ====================================================

function bindElements(container) {
  videoEl  = container.querySelector('#le-video');
  canvasEl = container.querySelector('#le-canvas');
  ctx      = canvasEl?.getContext('2d');
}

function bindEvents(container) {
  // Exercise option selection
  container.querySelectorAll('.exercise-option').forEach(opt => {
    opt.addEventListener('click', () => selectExercise(opt.dataset.ex, container));
    opt.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') selectExercise(opt.dataset.ex, container);
    });
  });

  // Start camera
  container.querySelector('#le-btn-start-camera').addEventListener('click', () => {
    startCamera(container);
  });

  // Stop exercise
  container.querySelector('#le-btn-stop').addEventListener('click', () => {
    stopSession(container);
  });

  // Reset reps
  container.querySelector('#le-btn-reset').addEventListener('click', () => {
    engine.reset();
    formErrors = [];
    sessionStart = Date.now();
    updateStatsUI(container, { phase: 'READY', formStatus: FormStatus.GOOD, feedback: 'Reps reset — begin when ready' });
  });

  // Change exercise
  container.querySelector('#le-btn-change').addEventListener('click', () => {
    stopCamera();
    isRunning = false;
    formErrors = [];
    selectedExercise = null;
    showStep(container, 'select');
  });
}

// ====================================================
// Exercise Selection
// ====================================================

function selectExercise(key, container) {
  selectedExercise = key;
  container.querySelectorAll('.exercise-option').forEach(o => o.classList.remove('selected'));
  container.querySelector(`[data-ex="${key}"]`)?.classList.add('selected');
  container.querySelector('#le-select-error').style.display = 'none';
}

// ====================================================
// Camera Lifecycle
// ====================================================

async function startCamera(container) {
  if (!selectedExercise) {
    container.querySelector('#le-select-error').style.display = 'flex';
    return;
  }

  // Set up engine for selected exercise
  engine = new ExerciseEngine();
  engine.setExercise(selectedExercise);
  formErrors   = [];
  sessionStart = Date.now();

  showStep(container, 'live');
  setMsg(container, 'Requesting camera permission…');

  // Load MediaPipe model (show progress)
  const statusEl = container.querySelector('#le-model-status');
  try {
    await loadPoseLandmarker((msg) => { if (statusEl) statusEl.textContent = msg; });
    if (statusEl) statusEl.textContent = '✓ AI ready';
  } catch (err) {
    setMsg(container, '⚠ Failed to load AI model. Please refresh and try again.');
    console.error('MediaPipe load error:', err);
    return;
  }

  // Request webcam
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
      audio: false,
    });
  } catch (err) {
    handleCameraError(err, container);
    return;
  }

  videoEl.srcObject = stream;
  videoEl.style.display = 'block';
  canvasEl.style.display = 'block';

  videoEl.onloadedmetadata = () => {
    videoEl.play();
    canvasEl.width  = videoEl.videoWidth;
    canvasEl.height = videoEl.videoHeight;
    container.querySelector('#le-cam-placeholder').style.display = 'none';
    container.querySelector('#le-live-badge').style.display      = 'flex';
    isRunning = true;
    updateStatsUI(container, { phase: 'READY', formStatus: FormStatus.GOOD, feedback: 'Get into position' });
    container.querySelector('#le-stat-name').textContent = engine.exerciseName;
    inferenceLoop(container);
  };
}

function stopCamera() {
  isRunning = false;
  if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
  if (stream) {
    stream.getTracks().forEach(t => t.stop());
    stream = null;
  }
  if (videoEl)  { videoEl.srcObject = null; videoEl.style.display = 'none'; }
  if (canvasEl) { ctx?.clearRect(0, 0, canvasEl.width, canvasEl.height); canvasEl.style.display = 'none'; }
}

function handleCameraError(err, container) {
  let msg = 'Camera error. Please try again.';
  if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
    msg = '🚫 Camera permission denied. Please allow camera access in your browser settings.';
  } else if (err.name === 'NotFoundError') {
    msg = '📷 No camera found. Please connect a camera and try again.';
  } else if (err.name === 'NotReadableError') {
    msg = '⚠ Camera is in use by another application. Please close it and retry.';
  }
  setMsg(container, msg);
  showStep(container, 'live'); // Keep live step visible to show error
  console.error('Camera error:', err);
}

// ====================================================
// Inference Loop
// ====================================================

function inferenceLoop(container) {
  if (!isRunning) return;

  rafId = requestAnimationFrame(() => {
    if (!isRunning) return;

    if (videoEl.readyState >= 2) {
      const timestamp = performance.now();
      const landmarks = detectPose(videoEl, timestamp);

      let result;
      if (!landmarks) {
        result = {
          phase:      engine.phase,
          formStatus: FormStatus.NO_PERSON,
          feedback:   'No person detected — move into camera view',
          repCounted: false,
        };
      } else {
        result = engine.analyze(landmarks, videoEl.videoHeight || 480);
        if (result.formStatus === FormStatus.NEEDS_WORK && result.feedback) {
          formErrors.push(result.feedback);
        }
      }

      // Draw skeleton overlay
      if (canvasEl.width !== videoEl.videoWidth) {
        canvasEl.width  = videoEl.videoWidth;
        canvasEl.height = videoEl.videoHeight;
      }
      if (landmarks) {
        drawPoseSkeleton(ctx, landmarks, canvasEl.width, canvasEl.height);
      } else {
        ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);
      }

      updateStatsUI(container, result);
    }

    inferenceLoop(container);
  });
}

// ====================================================
// Stats UI Update
// ====================================================

function updateStatsUI(container, { phase, formStatus, feedback }) {
  const repEl      = container.querySelector('#le-stat-reps');
  const phaseEl    = container.querySelector('#le-stat-phase');
  const formEl     = container.querySelector('#le-stat-form');
  const feedbackEl = container.querySelector('#le-feedback-text');
  const feedbackBox= container.querySelector('#le-feedback-box');

  if (!repEl) return;

  // Reps — animate on change
  const newReps = engine.reps;
  if (repEl.textContent !== String(newReps)) {
    repEl.textContent = newReps;
    repEl.style.animation = 'none';
    requestAnimationFrame(() => { repEl.style.animation = 'countUp 0.3s ease'; });
  }

  // Phase
  phaseEl.textContent = phase || 'READY';
  phaseEl.className   = 'stat-box-value info';

  // Form status
  const isGood    = formStatus === FormStatus.GOOD;
  const isWarn    = formStatus === FormStatus.NEEDS_WORK;
  const isNoConf  = formStatus === FormStatus.LOW_CONF || formStatus === FormStatus.NO_PERSON;
  formEl.textContent  = formStatus === FormStatus.GOOD        ? '✓ GOOD'
                      : formStatus === FormStatus.NEEDS_WORK  ? '⚠ NEEDS CORRECTION'
                      : formStatus === FormStatus.LOW_CONF    ? '🔍 DETECTING'
                      : formStatus === FormStatus.NO_PERSON   ? '— NO PERSON'
                      : '—';
  formEl.className = `stat-box-value ${isGood ? 'good' : isWarn ? 'warn' : 'info'}`;

  // Feedback box
  feedbackEl.textContent = feedback || '';
  feedbackBox.className  = `feedback-box ${isGood ? 'good' : isWarn ? 'warn' : isNoConf ? '' : ''}`;
}

// ====================================================
// Session Stop + Summary
// ====================================================

function stopSession(container) {
  stopCamera();
  isRunning = false;
  container.querySelector('#le-live-badge').style.display = 'none';

  const duration = sessionStart ? Math.floor((Date.now() - sessionStart) / 1000) : 0;
  const session  = {
    exercise:   selectedExercise,
    exerciseName: engine.exerciseName,
    reps:       engine.reps,
    formErrors,
    duration,
  };

  saveSession(session);
  const rec = getRecommendation(session);
  renderSummary(container, session, rec);
  showStep(container, 'summary');
}

function renderSummary(container, session, rec) {
  const summaryEl = container.querySelector('#le-step-summary');
  const exIcon = session.exercise === 'pushup' ? '💪'
               : session.exercise === 'squat'  ? '🦵' : '🔥';

  const issueSet = {};
  session.formErrors.forEach(e => { issueSet[e] = (issueSet[e] || 0) + 1; });
  const topIssues = Object.entries(issueSet)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  summaryEl.innerHTML = `
<div class="session-summary fade-in">
  <div class="summary-header">
    <div style="font-size:48px;margin-bottom:12px">${exIcon}</div>
    <div class="summary-title">Session Complete!</div>
    <div style="color:var(--text-secondary);font-size:13px">${session.exerciseName} session</div>
  </div>
  <div class="summary-stats">
    <div class="summary-stat">
      <div class="summary-stat-val">${session.reps}</div>
      <div class="summary-stat-lbl">Total Reps</div>
    </div>
    <div class="summary-stat">
      <div class="summary-stat-val">${formatDuration(session.duration)}</div>
      <div class="summary-stat-lbl">Duration</div>
    </div>
    <div class="summary-stat">
      <div class="summary-stat-val">${session.formErrors.length}</div>
      <div class="summary-stat-lbl">Form Alerts</div>
    </div>
  </div>

  ${topIssues.length > 0 ? `
  <div style="margin-bottom:20px">
    <div class="section-title" style="font-size:14px;margin-bottom:12px">📋 Common Form Issues</div>
    ${topIssues.map(([issue, count]) => `
      <div style="display:flex;justify-content:space-between;align-items:center;
                  padding:8px 12px;background:var(--bg-primary);border:1px solid var(--border);
                  border-radius:var(--radius-sm);margin-bottom:6px;font-size:13px">
        <span>${issue}</span>
        <span class="badge badge-warn">${count}×</span>
      </div>`).join('')}
  </div>` : `
  <div class="msg-box success" style="margin-bottom:20px">🎉 Excellent form throughout the session!</div>`}

  <div class="recommendation-card">
    <div class="rec-title">🤖 Personalized Recommendation</div>
    <div style="font-size:13px;color:var(--text-secondary);margin-bottom:12px">${rec.summary}</div>
    ${rec.suggestions.map(s => `
      <div class="rec-item">
        <span class="rec-bullet">→</span>
        <span>${s}</span>
      </div>`).join('')}
    <div class="rec-item" style="border-bottom:none">
      <span class="rec-bullet">🎯</span>
      <span><strong>Next:</strong> ${rec.nextExercise}</span>
    </div>
  </div>

  <div class="controls-row" style="margin-top:20px;justify-content:center">
    <button class="btn btn-primary" id="le-btn-new-session">
      ▶ New Session
    </button>
    <button class="btn btn-secondary" id="le-btn-same-exercise">
      ↺ Same Exercise
    </button>
  </div>
</div>`;

  summaryEl.querySelector('#le-btn-new-session').addEventListener('click', () => {
    formErrors = [];
    selectedExercise = null;
    engine = new ExerciseEngine();
    showStep(container, 'select');
    container.querySelectorAll('.exercise-option').forEach(o => o.classList.remove('selected'));
  });

  summaryEl.querySelector('#le-btn-same-exercise').addEventListener('click', () => {
    const key = session.exercise;
    engine = new ExerciseEngine();
    engine.setExercise(key);
    formErrors   = [];
    sessionStart = Date.now();
    showStep(container, 'live');
    container.querySelector('#le-cam-placeholder').style.display = 'flex';
    container.querySelector('#le-cam-msg').textContent = 'Starting camera…';
    container.querySelector('#le-stat-name').textContent = engine.exerciseName;
    updateStatsUI(container, { phase: 'READY', formStatus: FormStatus.GOOD, feedback: 'Get into position' });
    startCamera(container);
  });
}

// ====================================================
// Helpers
// ====================================================

function showStep(container, step) {
  container.querySelector('#le-step-select').style.display  = step === 'select'  ? 'block' : 'none';
  container.querySelector('#le-step-live').style.display    = step === 'live'    ? 'block' : 'none';
  container.querySelector('#le-step-summary').style.display = step === 'summary' ? 'block' : 'none';
}

function setMsg(container, msg) {
  const el = container.querySelector('#le-cam-msg');
  if (el) el.textContent = msg;
  const ph = container.querySelector('#le-cam-placeholder');
  if (ph) ph.style.display = 'flex';
}

function formatDuration(seconds) {
  if (seconds < 60) return `${seconds}s`;
  return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
}
