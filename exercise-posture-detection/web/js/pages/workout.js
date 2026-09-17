/**
 * pages/workout.js
 * Workout page — hosts the Live Exercise Detection feature.
 */

import { mountLiveExercise, unmountLiveExercise } from '../features/liveExercise.js';

export function renderWorkout() {
  return `
<div class="fade-in">
  <div class="page-title">Workout 🏋️</div>
  <div class="page-subtitle">AI-powered form analysis and real-time repetition counting</div>

  <!-- Live Exercise Feature Card (main feature) -->
  <div id="live-exercise-mount"></div>

  <!-- Other workout categories -->
  <div class="section-title" style="margin-top:8px">Other Training Modes</div>
  <div class="workout-categories">
    <div class="workout-cat-card">
      <div class="cat-icon">🏃</div>
      <div class="cat-name">Cardio</div>
      <div class="cat-desc">Running, cycling & HIIT tracking</div>
      <div style="margin-top:14px"><span class="badge badge-info">Coming soon</span></div>
    </div>
    <div class="workout-cat-card">
      <div class="cat-icon">🧘</div>
      <div class="cat-name">Flexibility</div>
      <div class="cat-desc">Yoga & stretching sessions</div>
      <div style="margin-top:14px"><span class="badge badge-info">Coming soon</span></div>
    </div>
    <div class="workout-cat-card">
      <div class="cat-icon">⚖️</div>
      <div class="cat-name">Strength</div>
      <div class="cat-desc">Weighted exercise tracking</div>
      <div style="margin-top:14px"><span class="badge badge-info">Coming soon</span></div>
    </div>
  </div>
</div>`;
}

export function mountWorkoutFeatures(container) {
  const mountPoint = container.querySelector('#live-exercise-mount');
  if (mountPoint) mountLiveExercise(mountPoint);
}

export function unmountWorkoutFeatures() {
  unmountLiveExercise();
}
