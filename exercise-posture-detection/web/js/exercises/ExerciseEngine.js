/**
 * exercises/ExerciseEngine.js
 * Selects the active exercise rule and delegates analysis.
 */

import { PushUpRule } from './PushUpRule.js';
import { SquatRule }  from './SquatRule.js';
import { SitUpRule }  from './SitUpRule.js';

const RULES = {
  pushup: PushUpRule,
  squat:  SquatRule,
  situp:  SitUpRule,
};

export class ExerciseEngine {
  constructor() {
    this._rule = null;
    this._key  = null;
  }

  get activeRule() { return this._rule; }
  get exerciseName() { return this._rule?.name ?? '—'; }
  get reps()  { return this._rule?.reps ?? 0; }
  get phase() { return this._rule?.phase ?? 'READY'; }

  /**
   * Select / change exercise. Resets all state.
   * @param {'pushup'|'squat'|'situp'} key
   */
  setExercise(key) {
    const RuleClass = RULES[key];
    if (!RuleClass) throw new Error(`Unknown exercise key: ${key}`);
    this._key  = key;
    this._rule = new RuleClass();
  }

  reset() {
    this._rule?.reset();
  }

  /**
   * @param {object[]} landmarks
   * @param {number}   frameH
   * @returns {{ phase, formStatus, feedback, repCounted }}
   */
  analyze(landmarks, frameH) {
    if (!this._rule) {
      return {
        phase:      'READY',
        formStatus: 'NO_EXERCISE',
        feedback:   'Select an exercise to begin',
        repCounted: false,
      };
    }
    return this._rule.analyze(landmarks, frameH);
  }
}
