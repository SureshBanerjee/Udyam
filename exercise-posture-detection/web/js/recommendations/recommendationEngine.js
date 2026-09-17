/**
 * recommendations/recommendationEngine.js
 * Rule-based personalized recommendation engine.
 * Modular: swap this module for an ML approach in the future.
 */

/**
 * Generate a recommendation based on session performance data.
 * @param {{ exercise: string, reps: number, formErrors: string[], duration: number }} session
 * @returns {{ summary: string, suggestions: string[], nextExercise: string }}
 */
export function getRecommendation(session) {
  const { exercise, reps, formErrors = [], duration = 0 } = session;
  const errorCounts = {};
  formErrors.forEach(e => { errorCounts[e] = (errorCounts[e] || 0) + 1; });

  const suggestions = [];
  let summary = '';
  let nextExercise = '';

  // ---- Push-up recommendations ----
  if (exercise === 'pushup' || exercise === 'Push-up') {
    if (errorCounts['Keep your back straight'] > 2) {
      suggestions.push('Practice plank holds to build core stability and improve back alignment.');
      suggestions.push('Focus on engaging your core throughout each rep before adding volume.');
    }
    if (errorCounts['Lower your body more'] > 2) {
      suggestions.push('Work on shoulder mobility and chest flexibility to achieve full depth.');
      suggestions.push('Try assisted push-ups or incline push-ups to build depth gradually.');
    }
    if (errorCounts['Keep your elbows aligned'] > 2) {
      suggestions.push('Slow down the descent — controlled movement helps elbow alignment.');
    }
    if (reps >= 15) {
      summary = `Excellent session! ${reps} push-ups with solid volume.`;
      nextExercise = 'Try dips or archer push-ups to progress.';
    } else if (reps >= 8) {
      summary = `Good session with ${reps} push-ups.`;
      nextExercise = 'Aim for 15 reps next session before increasing difficulty.';
    } else {
      summary = `${reps} push-ups completed. Focus on form consistency.`;
      nextExercise = 'Build to 10 clean reps before increasing volume.';
    }
    if (suggestions.length === 0) suggestions.push('Great form! Increase reps or try a harder push-up variation.');
  }

  // ---- Squat recommendations ----
  else if (exercise === 'squat' || exercise === 'Squat') {
    if (errorCounts['Knees are caving in — push knees out'] > 2) {
      suggestions.push('Strengthen glutes with clamshells and hip abduction exercises.');
      suggestions.push('Focus on pushing knees outward to align with toes throughout the squat.');
    }
    if (errorCounts['Go a little lower'] > 2) {
      suggestions.push('Work on hip and ankle mobility — tight hips limit squat depth.');
      suggestions.push('Practice box squats to build confidence at the bottom position.');
    }
    if (errorCounts['Keep your back straight'] > 2) {
      suggestions.push('Improve thoracic mobility and practice goblet squats for upright posture.');
    }
    if (reps >= 20) {
      summary = `Outstanding! ${reps} squats — excellent endurance.`;
      nextExercise = 'Consider adding weight or trying Bulgarian split squats.';
    } else if (reps >= 10) {
      summary = `Solid ${reps} squats in this session.`;
      nextExercise = 'Aim for 20 bodyweight squats before adding load.';
    } else {
      summary = `${reps} squats completed.`;
      nextExercise = 'Focus on depth and alignment before increasing volume.';
    }
    if (suggestions.length === 0) suggestions.push('Excellent squat form! Try single-leg variations to advance.');
  }

  // ---- Sit-up recommendations ----
  else if (exercise === 'situp' || exercise === 'Sit-up') {
    if (errorCounts['Complete the movement'] > 2) {
      suggestions.push('Focus on slow, controlled movement over fast, partial reps.');
      suggestions.push('Strengthen your hip flexors and abs with more consistent training.');
    }
    if (errorCounts['Control your movement'] > 2) {
      suggestions.push('Try a 3-second eccentric (lowering) phase for each rep.');
    }
    if (reps >= 20) {
      summary = `Great endurance! ${reps} sit-ups completed.`;
      nextExercise = 'Try decline sit-ups or weighted crunches to progress.';
    } else if (reps >= 10) {
      summary = `Good session with ${reps} sit-ups.`;
      nextExercise = 'Work towards 20 controlled reps per set.';
    } else {
      summary = `${reps} sit-ups completed.`;
      nextExercise = 'Prioritize full range of motion over speed.';
    }
    if (suggestions.length === 0) suggestions.push('Perfect sit-up form! Consider adding resistance or incline.');
  }

  // Fallback
  if (!summary) summary = `Session complete: ${reps} reps.`;
  if (!nextExercise) nextExercise = 'Keep up the consistent training!';

  // Duration note
  if (duration > 0) {
    const mins = Math.floor(duration / 60);
    const secs = duration % 60;
    summary += ` Duration: ${mins > 0 ? mins + 'm ' : ''}${secs}s.`;
  }

  return { summary, suggestions, nextExercise };
}
