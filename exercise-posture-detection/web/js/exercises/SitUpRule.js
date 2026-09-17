/**
 * exercises/SitUpRule.js
 * Sit-up exercise rule.
 *
 * State machine: READY (LYING) → UP (crunch) → DOWN → READY
 * Analyzes: torso elevation angle (shoulder–hip angle relative to horizontal).
 */

import { angleBetween, midpoint } from '../geometry/angles.js';
import { Phase, FormStatus, LM } from './types.js';

// ---- Thresholds ----
const T = {
  TORSO_UP_MIN:         40,  // torso angle (from horizontal) to count as UP/crunched
  TORSO_DOWN_MAX:       20,  // torso angle to count as DOWN/lying flat
  CONF_THRESHOLD:       0.45,
  UP_DEBOUNCE_FRAMES:    8,
};

export class SitUpRule {
  constructor() { this.reset(); }

  get name() { return 'Sit-up'; }

  reset() {
    this._phase          = Phase.READY;
    this._reps           = 0;
    this._formOkThisRep  = true;
    this._upFrames       = 0;
    this._upReached      = false;
    this._lastFeedback   = 'Lie down to begin';
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

    const midS = midpoint(ls, rs);
    const midH = midpoint(lh, rh);
    const midK = midpoint(lk, rk);

    // Torso angle from horizontal: high = sitting up, low = lying down.
    // We measure the angle of the shoulder–hip vector vs horizontal.
    const dx = midS[0] - midH[0];
    const dy = midS[1] - midH[1]; // y increases downward in screen coords
    // In normalised coords [0,1]: lying = shoulder and hip at similar y, sitting = shoulder above hip (lower y)
    const torsoAngle = (Math.atan2(Math.abs(dy), Math.abs(dx)) * 180) / Math.PI;
    // When lying: shoulders ~ same y as hips → atan2(small, large) ≈ 0° from horizontal = low angle
    // When sitting: shoulders well above hips → larger dy → larger torsoAngle

    // Full sit-up: shoulder Y should be significantly less than hip Y (shoulder higher on screen)
    const sittingUp = midS[1] < midH[1] && torsoAngle >= T.TORSO_UP_MIN;
    const lyingDown = torsoAngle <= T.TORSO_DOWN_MAX;

    // Also check torso-knee relationship: hip-knee angle for form
    const hipKneeAng = angleBetween(midH, midK, [midK[0], midK[1] + 0.1]); // rough

    this._debugAngles = { torsoAngle, sittingUp, lyingDown };

    let repCounted = false;

    // ================================================================
    // STATE MACHINE (READY=LYING → UP=CRUNCHED → DOWN=RETURNED)
    // ================================================================
    if (this._phase === Phase.READY) {
      if (lyingDown) {
        this._formOkThisRep = true;
        this._upReached     = false;
        this._lastFeedback   = 'Lying position — crunch up when ready';
        this._lastFormStatus = FormStatus.GOOD;
      } else {
        // Starting to come up
        this._phase      = Phase.UP;
        this._upFrames   = 0;
        this._lastFeedback   = 'Rising — keep movement controlled!';
        this._lastFormStatus = FormStatus.GOOD;
      }

    } else if (this._phase === Phase.UP) {
      this._upFrames++;

      if (sittingUp) {
        this._upReached = true;
        if (this._formOkThisRep) {
          this._lastFeedback   = 'Good — now lower slowly!';
          this._lastFormStatus = FormStatus.GOOD;
        }
      } else if (!sittingUp && this._upFrames > T.UP_DEBOUNCE_FRAMES && !this._upReached) {
        this._formOkThisRep  = false;
        this._lastFeedback   = `Complete the movement (${torsoAngle.toFixed(0)}° — need ≥${T.TORSO_UP_MIN}°)`;
        this._lastFormStatus = FormStatus.NEEDS_WORK;
      }

      // Transition to DOWN when returning to flat
      if (lyingDown && this._upFrames >= T.UP_DEBOUNCE_FRAMES) {
        this._phase = Phase.DOWN;
      }

    } else if (this._phase === Phase.DOWN) {
      // User has returned to lying position
      if (this._formOkThisRep && this._upReached) {
        this._reps++;
        repCounted           = true;
        this._lastFeedback   = `Rep ${this._reps} — great sit-up! 🔥`;
        this._lastFormStatus = FormStatus.GOOD;
      } else if (!this._upReached) {
        this._lastFeedback   = 'Rep not counted: complete the full movement';
        this._lastFormStatus = FormStatus.NEEDS_WORK;
      } else {
        this._lastFeedback   = 'Rep not counted: control your movement';
        this._lastFormStatus = FormStatus.NEEDS_WORK;
      }
      this._phase          = Phase.READY;
      this._formOkThisRep  = true;
      this._upReached      = false;
      this._upFrames       = 0;
    }

    return {
      phase:      this._phase,
      formStatus: this._lastFormStatus,
      feedback:   this._lastFeedback,
      repCounted,
    };
  }
}
