/**
 * exercises/types.js
 * Shared types/constants for the exercise engine.
 */

export const Phase = {
  READY: 'READY',
  DOWN:  'DOWN',
  UP:    'UP',
};

export const FormStatus = {
  GOOD:        'GOOD',
  NEEDS_WORK:  'NEEDS CORRECTION',
  NO_PERSON:   'NO PERSON',
  LOW_CONF:    'DETECTING...',
};

/**
 * MediaPipe Pose landmark indices (BlazePose 33-point model).
 * Only the ones we use are listed.
 */
export const LM = {
  NOSE:            0,
  LEFT_SHOULDER:   11,
  RIGHT_SHOULDER:  12,
  LEFT_ELBOW:      13,
  RIGHT_ELBOW:     14,
  LEFT_WRIST:      15,
  RIGHT_WRIST:     16,
  LEFT_HIP:        23,
  RIGHT_HIP:       24,
  LEFT_KNEE:       25,
  RIGHT_KNEE:      26,
  LEFT_ANKLE:      27,
  RIGHT_ANKLE:     28,
};

/**
 * MediaPipe skeleton connections (pairs of LM indices).
 * Used for drawing the pose overlay.
 */
export const SKELETON_CONNECTIONS = [
  [LM.LEFT_SHOULDER,  LM.RIGHT_SHOULDER],
  [LM.LEFT_SHOULDER,  LM.LEFT_ELBOW],
  [LM.LEFT_ELBOW,     LM.LEFT_WRIST],
  [LM.RIGHT_SHOULDER, LM.RIGHT_ELBOW],
  [LM.RIGHT_ELBOW,    LM.RIGHT_WRIST],
  [LM.LEFT_SHOULDER,  LM.LEFT_HIP],
  [LM.RIGHT_SHOULDER, LM.RIGHT_HIP],
  [LM.LEFT_HIP,       LM.RIGHT_HIP],
  [LM.LEFT_HIP,       LM.LEFT_KNEE],
  [LM.LEFT_KNEE,      LM.LEFT_ANKLE],
  [LM.RIGHT_HIP,      LM.RIGHT_KNEE],
  [LM.RIGHT_KNEE,     LM.RIGHT_ANKLE],
];
