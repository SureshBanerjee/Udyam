/**
 * exercises/SquatRule.js
 * Squat exercise rule.
 *
 * State machine: READY (STANDING) → DOWN → UP → READY
 * Analyzes: knee angle, back lean, knee alignment (valgus/varus).
 */

import { angleBetween, midpoint } from '../geometry/angles.js';
import { Phase, FormStatus, LM } from './types.js';

// ---- Thresholds ----
const T = {
  KNEE_DOWN_MAX:        100, // knee angle at squat depth (hip-knee-ankle)
  KNEE_UP_MIN:          160, // knee angle at standing
  BACK_LEAN_MAX:         35, // max forward lean angle (shoulder–hip vertical deviation)
  KNEE_VALGUS_RATIO:   0.08, // knee must not cave in more than 8% of hip width
  CONF_THRESHOLD:       0.45,
  DOWN_DEBOUNCE_FRAMES:  8,
};

export class SquatRule {
  constructor() { this.reset(); }

  get name() { return 'Squat'; }

  reset() {
    this._phase          = Phase.READY;
    this._reps           = 0;
    this._formOkThisRep  = true;
    this._downFrames     = 0;
    this._depthReached   = false;
    this._lastFeedback   = 'Stand tall to begin';
    this._lastFormStatus = FormStatus.GOOD;
    this._debugAngles    = {};
  }

  get reps()       { return this._reps; }
  get phase()      { return this._phase; }
  get debugAngles(){ return this._debugAngles; }

  analyze(landmarks, frameH) {
    const required = [
      LM.LEFT_SHOULDER, LM.RIGHT_SHOULDER,
      LM.LEFT_HIP, LM.RIGHT_HIP,
      LM.LEFT_KNEE, LM.RIGHT_KNEE,
      LM.LEFT_ANKLE, LM.RIGHT_ANKLE,
    ];

    const lowConf = required.some(i => (landmarks[i]?.visibility ?? 0) < T.CONF_THRESHOLD);
    if (lowConf) {
      return {
        phase: this._phase,
        formStatus: FormStatus.LOW_CONF,
        feedback: 'Position yourself clearly in front of the camera',
        repCounted: false,
      };
    }

    const lm = (i) => [landmarks[i].x, landmarks[i].y];
    const ls = lm(LM.LEFT_SHOULDER),  rs = lm(LM.RIGHT_SHOULDER);
    const lh = lm(LM.LEFT_HIP),       rh = lm(LM.RIGHT_HIP);
    const lk = lm(LM.LEFT_KNEE),      rk = lm(LM.RIGHT_KNEE);
    const la = lm(LM.LEFT_ANKLE),     ra = lm(LM.RIGHT_ANKLE);

    // Knee angle: hip–knee–ankle
    const leftKneeAng  = angleBetween(lh, lk, la);
    const rightKneeAng = angleBetween(rh, rk, ra);
    const avgKneeAng   = (leftKneeAng + rightKneeAng) / 2;

    // Back lean: shoulder–hip vertical (we compare shoulder Y relative to hip Y)
    // A simple heuristic: angle of midShoulder–midHip vs vertical
    const midS = midpoint(ls, rs);
    const midH = midpoint(lh, rh);
    // backLeanAng: 0 = upright (y delta large, x delta small), 90 = horizontal
    const dx = Math.abs(midS[0] - midH[0]);
    const dy = Math.abs(midS[1] - midH[1]);
    const backLeanAng = (Math.atan2(dx, dy) * 180) / Math.PI;

    // Knee valgus: left knee x should be >= left ankle x (knees not caving in)
    const hipWidth   = Math.abs(rh[0] - lh[0]) + 1e-4;
    const leftValgus  = (lk[0] - la[0]) / hipWidth;  // positive = knee outside ankle = good
    const rightValgus = (ra[0] - rk[0]) / hipWidth;
    const kneeAlignOk = leftValgus > -T.KNEE_VALGUS_RATIO && rightValgus > -T.KNEE_VALGUS_RATIO;

    const backOk     = backLeanAng <= T.BACK_LEAN_MAX;
    const atDepth    = avgKneeAng  <= T.KNEE_DOWN_MAX;
    const isStanding = avgKneeAng  >= T.KNEE_UP_MIN;

    this._debugAngles = { leftKneeAng, rightKneeAng, avgKneeAng, backLeanAng };

    let repCounted = false;

    // ================================================================
    // STATE MACHINE
    // ================================================================
    if (this._phase === Phase.READY) {
      if (isStanding) {
        this._formOkThisRep = true;
        this._depthReached  = false;

        if (!backOk) {
          this._lastFeedback   = `Keep your back straight (${backLeanAng.toFixed(0)}° lean)`;
          this._lastFormStatus = FormStatus.NEEDS_WORK;
        } else {
          this._lastFeedback   = 'Stand tall — squat when ready';
          this._lastFormStatus = FormStatus.GOOD;
        }
      } else {
        // Started going down
        this._phase      = Phase.DOWN;
        this._downFrames = 0;
        this._lastFeedback   = 'Descending — keep back straight!';
        this._lastFormStatus = FormStatus.GOOD;
      }

    } else if (this._phase === Phase.DOWN) {
      this._downFrames++;

      if (!backOk) {
        this._formOkThisRep  = false;
        this._lastFeedback   = `Keep your back straight (${backLeanAng.toFixed(0)}° lean)`;
        this._lastFormStatus = FormStatus.NEEDS_WORK;
      } else if (!kneeAlignOk) {
        this._formOkThisRep  = false;
        this._lastFeedback   = 'Knees are caving in — push knees out';
        this._lastFormStatus = FormStatus.NEEDS_WORK;
      } else if (!atDepth && this._downFrames > T.DOWN_DEBOUNCE_FRAMES && avgKneeAng < 140) {
        // They're starting to come up without reaching depth
        if (!this._depthReached) {
          this._formOkThisRep = false;
          this._lastFeedback   = `Go a little lower (${avgKneeAng.toFixed(0)}° — need ≤${T.KNEE_DOWN_MAX}°)`;
          this._lastFormStatus = FormStatus.NEEDS_WORK;
        }
      } else if (this._formOkThisRep) {
        this._lastFeedback   = 'Good form — drive through heels!';
        this._lastFormStatus = FormStatus.GOOD;
      }

      if (atDepth) this._depthReached = true;

      // Transition to UP
      if (isStanding && this._downFrames >= T.DOWN_DEBOUNCE_FRAMES) {
        this._phase = Phase.UP;
      }

    } else if (this._phase === Phase.UP) {
      if (this._formOkThisRep && this._depthReached) {
        this._reps++;
        repCounted           = true;
        this._lastFeedback   = `Rep ${this._reps} — excellent squat! 🦵`;
        this._lastFormStatus = FormStatus.GOOD;
      } else if (!this._depthReached) {
        this._lastFeedback   = 'Rep not counted: go deeper next time';
        this._lastFormStatus = FormStatus.NEEDS_WORK;
      } else {
        this._lastFeedback   = 'Rep not counted: fix form and retry';
        this._lastFormStatus = FormStatus.NEEDS_WORK;
      }
      this._phase          = Phase.READY;
      this._formOkThisRep  = true;
      this._depthReached   = false;
      this._downFrames     = 0;
    }

    return {
      phase:      this._phase,
      formStatus: this._lastFormStatus,
      feedback:   this._lastFeedback,
      repCounted,
    };
  }
}
