/**
 * pose/poseOverlay.js
 * Draws pose skeleton over the canvas element.
 */

import { SKELETON_CONNECTIONS, LM } from '../exercises/types.js';

const LANDMARK_RADIUS  = 5;
const LANDMARK_COLOR   = '#00d4aa';
const BONE_COLOR       = 'rgba(108,99,255,0.75)';
const BONE_WIDTH       = 2.5;
const HIGHLIGHT_COLOR  = '#6c63ff';

/**
 * Draw the pose skeleton on a canvas.
 * @param {CanvasRenderingContext2D} ctx
 * @param {object[]} landmarks  — array of { x, y, z, visibility } normalised [0,1]
 * @param {number} w  canvas width
 * @param {number} h  canvas height
 * @param {number} confThreshold  skip landmark if visibility < this
 */
export function drawPoseSkeleton(ctx, landmarks, w, h, confThreshold = 0.4) {
  if (!landmarks || landmarks.length === 0) return;

  ctx.clearRect(0, 0, w, h);

  // Convert normalised → pixel, mirrored to match the flipped video
  const px = (lm) => [(1 - lm.x) * w, lm.y * h];

  // Draw bones (connections)
  ctx.lineWidth      = BONE_WIDTH;
  ctx.strokeStyle    = BONE_COLOR;
  ctx.lineCap        = 'round';

  for (const [a, b] of SKELETON_CONNECTIONS) {
    const la = landmarks[a];
    const lb = landmarks[b];
    if (!la || !lb) continue;
    if ((la.visibility ?? 1) < confThreshold) continue;
    if ((lb.visibility ?? 1) < confThreshold) continue;
    const [ax, ay] = px(la);
    const [bx, by] = px(lb);
    ctx.beginPath();
    ctx.moveTo(ax, ay);
    ctx.lineTo(bx, by);
    ctx.stroke();
  }

  // Draw landmark dots
  for (let i = 0; i < landmarks.length; i++) {
    const lm = landmarks[i];
    if (!lm) continue;
    if ((lm.visibility ?? 1) < confThreshold) continue;
    const [x, y] = px(lm);

    // Highlight key joints
    const isKey = [
      LM.LEFT_SHOULDER,  LM.RIGHT_SHOULDER,
      LM.LEFT_ELBOW,     LM.RIGHT_ELBOW,
      LM.LEFT_WRIST,     LM.RIGHT_WRIST,
      LM.LEFT_HIP,       LM.RIGHT_HIP,
      LM.LEFT_KNEE,      LM.RIGHT_KNEE,
      LM.LEFT_ANKLE,     LM.RIGHT_ANKLE,
    ].includes(i);

    ctx.beginPath();
    ctx.arc(x, y, isKey ? LANDMARK_RADIUS + 1 : LANDMARK_RADIUS - 1, 0, Math.PI * 2);
    ctx.fillStyle = isKey ? HIGHLIGHT_COLOR : LANDMARK_COLOR;
    ctx.fill();

    if (isKey) {
      ctx.strokeStyle = 'rgba(255,255,255,0.6)';
      ctx.lineWidth   = 1.5;
      ctx.stroke();
    }
  }
}
