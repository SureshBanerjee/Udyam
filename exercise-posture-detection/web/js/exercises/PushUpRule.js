/**
 * exercises/PushUpRule.js
 * Push-up exercise rule — ported and enhanced from main.py
 *
 * State machine: READY → DOWN → UP → READY
 * A rep is counted ONLY when:
 *  1. User starts in valid UP position (elbows extended, back straight)
 *  2. Descends (elbows bend)
 *  3. Reaches sufficient depth
 *  4. form_ok_this_rep remains true throughout DOWN
 *  5. Returns to UP with back straight
 */

import { angleBetween, midpoint, isVisible } from '../geometry/angles.js';
import { Phase, FormStatus, LM } from './types.js';

// ---- Thresholds (tunable) ----
const T = {
  BACK_STRAIGHT_TOL:   20,   // degrees from 180° allowed (shoulder–hip–knee)
  ELBOW_DOWN_MAX:      115,  // max elbow angle at bottom (fully bent)
  ELBOW_DOWN_MIN:      55,   // min elbow angle (not too wide / collapsed)
  ELBOW_UP_MIN:        145,  // min elbow angle to qualify as UP/READY
  DEPTH_FRACTION:      0.05, // shoulder Y must descend at least 5% of frame height
  CONF_THRESHOLD:      0.45, // landmark confidence below this → skip
  DOWN_DEBOUNCE_FRAMES: 8,   // minimum frames in DOWN before returning to UP counts
};

export class PushUpRule {
  constructor() { this.reset(); }

  get name() { return 'Push-up'; }

  reset() {
    this._phase            = Phase.READY;
    this._reps             = 0;
    this._formOkThisRep    = true;
    this._shoulderYAtTop   = null;
    this._downFrames       = 0;
    this._lastFeedback     = 'Get into push-up position';
    this._lastFormStatus   = FormStatus.GOOD;
    this._debugAngles      = {};
  }

  get reps()       { return this._reps; }
  get phase()      { return this._phase; }
  get debugAngles(){ return this._debugAngles; }

  /**
   * Analyse a single frame.
   * @param {object[]} landmarks  — array of { x, y, z, visibility } (normalised 0-1)
   * @param {number} frameH       — frame height in pixels (for depth check)
   * @returns {{ phase, formStatus, feedback, repCounted }}
   */
  analyze(landmarks, frameH) {
    const required = [
      LM.LEFT_SHOULDER, LM.RIGHT_SHOULDER,
      LM.LEFT_ELBOW, LM.RIGHT_ELBOW,
      LM.LEFT_WRIST, LM.RIGHT_WRIST,
      LM.LEFT_HIP, LM.RIGHT_HIP,
      LM.LEFT_KNEE, LM.RIGHT_KNEE,
    ];

    // Confidence guard
    const lowConf = required.some(i => (landmarks[i]?.visibility ?? 0) < T.CONF_THRESHOLD);
    if (lowConf) {
      return {
        phase: this._phase,
        formStatus: FormStatus.LOW_CONF,
        feedback: 'Position yourself clearly in front of the camera',
        repCounted: false,
      };
    }

    // Extract xy (normalised → pixel-like, but we only need ratios so normalised is fine)
    const lm = (i) => [landmarks[i].x, landmarks[i].y];
    const ls = lm(LM.LEFT_SHOULDER),  rs = lm(LM.RIGHT_SHOULDER);
    const le = lm(LM.LEFT_ELBOW),     re = lm(LM.RIGHT_ELBOW);
    const lw = lm(LM.LEFT_WRIST),     rw = lm(LM.RIGHT_WRIST);
    const lh = lm(LM.LEFT_HIP),       rh = lm(LM.RIGHT_HIP);
    const lk = lm(LM.LEFT_KNEE),      rk = lm(LM.RIGHT_KNEE);

    // ---- Compute angles ----
    const midS  = midpoint(ls, rs);
    const midH  = midpoint(lh, rh);
    const midK  = midpoint(lk, rk);
    const backAng        = angleBetween(midS, midH, midK);
    const leftElbowAng   = angleBetween(ls, le, lw);
    const rightElbowAng  = angleBetween(rs, re, rw);
    const avgElbowAng    = (leftElbowAng + rightElbowAng) / 2;

    this._debugAngles = { backAng, leftElbowAng, rightElbowAng, avgElbowAng };

    const backOk       = Math.abs(backAng - 180) <= T.BACK_STRAIGHT_TOL;
    const elbowUpOk    = leftElbowAng >= T.ELBOW_UP_MIN && rightElbowAng >= T.ELBOW_UP_MIN;
    const elbowDownOk  = avgElbowAng >= T.ELBOW_DOWN_MIN && avgElbowAng <= T.ELBOW_DOWN_MAX;

    const midShoulderY = (ls[1] + rs[1]) / 2;  // normalised 0-1

    let repCounted = false;

    // ================================================================
    // STATE MACHINE
    // ================================================================
    if (this._phase === Phase.READY) {
      if (backOk && elbowUpOk) {
        this._shoulderYAtTop = midShoulderY;
        this._formOkThisRep  = true;
        this._lastFeedback   = 'Good position — lower into push-up';
        this._lastFormStatus = FormStatus.GOOD;
      } else if (backOk && !elbowUpOk && this._shoulderYAtTop !== null) {
        // Transition: elbows bending → start DOWN
        this._phase          = Phase.DOWN;
        this._formOkThisRep  = true;
        this._downFrames     = 0;
        this._lastFeedback   = 'Descending — maintain form!';
        this._lastFormStatus = FormStatus.GOOD;
      } else if (!backOk) {
        this._lastFeedback   = `Keep your back straight (${backAng.toFixed(0)}°)`;
        this._lastFormStatus = FormStatus.NEEDS_WORK;
        this._shoulderYAtTop = null;
      } else {
        this._lastFeedback   = 'Extend arms fully to start';
        this._lastFormStatus = FormStatus.GOOD;
        this._shoulderYAtTop = null;
      }

    } else if (this._phase === Phase.DOWN) {
      this._downFrames++;

      // Form check 1: back
      if (!backOk) {
        this._formOkThisRep  = false;
        this._lastFeedback   = `Keep your back straight (${backAng.toFixed(0)}°)`;
        this._lastFormStatus = FormStatus.NEEDS_WORK;
      }
      // Form check 2: elbow alignment at bottom
      else if (!elbowDownOk && avgElbowAng <= T.ELBOW_DOWN_MAX) {
        this._formOkThisRep  = false;
        if (avgElbowAng > T.ELBOW_DOWN_MAX) {
          this._lastFeedback = `Keep your elbows aligned (${avgElbowAng.toFixed(0)}°)`;
        } else {
          this._lastFeedback = `Lower your body more (${avgElbowAng.toFixed(0)}°)`;
        }
        this._lastFormStatus = FormStatus.NEEDS_WORK;
      } else if (this._formOkThisRep) {
        this._lastFeedback   = 'Good form — push back up!';
        this._lastFormStatus = FormStatus.GOOD;
      }

      // Form check 3: depth (only once near bottom)
      if (this._shoulderYAtTop !== null) {
        const descent = midShoulderY - this._shoulderYAtTop;  // +ve = moved down in frame
        const atBottom = avgElbowAng <= T.ELBOW_DOWN_MAX;
        if (atBottom && descent < T.DEPTH_FRACTION) {
          this._formOkThisRep  = false;
          this._lastFeedback   = 'Lower your body more';
          this._lastFormStatus = FormStatus.NEEDS_WORK;
        }
      }

      // Transition to UP when elbows extend (with debounce)
      if (elbowUpOk && this._downFrames >= T.DOWN_DEBOUNCE_FRAMES) {
        this._phase = Phase.UP;
      }

    } else if (this._phase === Phase.UP) {
      if (backOk && this._formOkThisRep) {
        this._reps++;
        repCounted           = true;
        this._lastFeedback   = `Rep ${this._reps} — great push-up! 💪`;
        this._lastFormStatus = FormStatus.GOOD;
      } else {
        if (!backOk) {
          this._lastFeedback = `Rep not counted: keep back straight (${backAng.toFixed(0)}°)`;
        } else {
          this._lastFeedback = 'Rep not counted: fix form and retry';
        }
        this._lastFormStatus = FormStatus.NEEDS_WORK;
      }
      // Reset to READY
      this._phase           = Phase.READY;
      this._formOkThisRep   = true;
      this._shoulderYAtTop  = null;
      this._downFrames      = 0;
    }

    return {
      phase:      this._phase,
      formStatus: this._lastFormStatus,
      feedback:   this._lastFeedback,
      repCounted,
    };
  }
}
