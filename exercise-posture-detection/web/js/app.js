/**
 * app.js
 * Main application router. Manages page navigation and lifecycle.
 */

import { renderDashboard, bindDashboardEvents } from './pages/dashboard.js';
import { renderWorkout, mountWorkoutFeatures, unmountWorkoutFeatures } from './pages/workout.js';
import { renderHistory, bindHistoryEvents } from './pages/history.js';
import { renderProfile } from './pages/profile.js';

// ---- State ----
let currentPage  = 'dashboard';
let workoutActive = false;

const mainContent = document.getElementById('main-content');
const sidebarEl   = document.getElementById('sidebar');
const overlayEl   = document.createElement('div');
overlayEl.className = 'sidebar-overlay';
document.body.appendChild(overlayEl);

// ---- Navigation ----
function navigate(page) {
  if (page === currentPage && page !== 'history') return;

  // Unmount previous page
  if (workoutActive) {
    unmountWorkoutFeatures();
    workoutActive = false;
  }

  currentPage = page;

  // Update nav highlight
  document.querySelectorAll('.nav-item').forEach(el => {
    el.classList.toggle('active', el.dataset.page === page);
  });

  // Render new page
  switch (page) {
    case 'dashboard':
      mainContent.innerHTML = renderDashboard();
      bindDashboardEvents(mainContent, navigate);
      break;
    case 'workout':
      mainContent.innerHTML = renderWorkout();
      mountWorkoutFeatures(mainContent);
      workoutActive = true;
      break;
    case 'history':
      mainContent.innerHTML = renderHistory();
      bindHistoryEvents(mainContent, () => navigate('history'));
      break;
    case 'profile':
      mainContent.innerHTML = renderProfile();
      break;
  }

  // Scroll to top
  mainContent.scrollTop = 0;
  window.scrollTo(0, 0);

  // Close mobile sidebar
  closeSidebar();
}

// ---- Sidebar Nav listeners ----
document.querySelectorAll('.nav-item').forEach(item => {
  item.addEventListener('click', () => navigate(item.dataset.page));
});

// ---- Mobile sidebar toggle ----
const menuBtn = document.getElementById('menu-btn');
menuBtn?.addEventListener('click', toggleSidebar);
overlayEl.addEventListener('click', closeSidebar);

function toggleSidebar() {
  sidebarEl.classList.toggle('open');
  overlayEl.classList.toggle('show');
}

function closeSidebar() {
  sidebarEl.classList.remove('open');
  overlayEl.classList.remove('show');
}

// ---- Init ----
navigate('dashboard');
