/**
 * geometry/angles.js
 * Reusable geometric utilities for pose analysis.
 * Ported from the Python prototype (main.py).
 */

/**
 * Compute the angle at vertex B formed by the points A-B-C.
 * @param {[number,number]} a
 * @param {[number,number]} b  (vertex)
 * @param {[number,number]} c
 * @returns {number} angle in degrees [0, 180]
 */
export function angleBetween(a, b, c) {
  const ba = [a[0] - b[0], a[1] - b[1]];
  const bc = [c[0] - b[0], c[1] - b[1]];
  const dot = ba[0] * bc[0] + ba[1] * bc[1];
  const magBa = Math.sqrt(ba[0] ** 2 + ba[1] ** 2) + 1e-6;
  const magBc = Math.sqrt(bc[0] ** 2 + bc[1] ** 2) + 1e-6;
  const cosVal = Math.max(-1, Math.min(1, dot / (magBa * magBc)));
  return (Math.acos(cosVal) * 180) / Math.PI;
}

/**
 * Midpoint between two points.
 */
export function midpoint(p1, p2) {
  return [(p1[0] + p2[0]) / 2, (p1[1] + p2[1]) / 2];
}

/**
 * Returns true only if ALL supplied [x,y] points are visible
 * (non-zero and above the threshold).
 * @param {Array<[number,number]>} pts
 * @param {number} threshold
 */
export function isVisible(pts, threshold = 0.05) {
  return pts.every(([x, y]) => x > threshold && y > threshold);
}

/**
 * Euclidean distance between two points.
 */
export function distance(a, b) {
  return Math.sqrt((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2);
}

/**
 * Returns the vertical angle (degrees from horizontal) of the line
 * from p1 to p2. 0 = horizontal, 90 = vertical.
 */
export function verticalAngle(p1, p2) {
  const dx = p2[0] - p1[0];
  const dy = p2[1] - p1[1];
  return Math.abs((Math.atan2(Math.abs(dy), Math.abs(dx)) * 180) / Math.PI);
}
