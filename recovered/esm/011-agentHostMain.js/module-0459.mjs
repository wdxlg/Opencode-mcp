// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/github/common/githubBackoff.ts
import { Disposable } from "./module-0010.mjs";
import { schedulerDelay } from "./module-0458.mjs";


// src/vs/platform/github/common/githubBackoff.ts
function gitHubBackoffDelay(policy, scheduler, attempts, minimum = 0) {
  const escalated = attempts <= policy.immediateRetries ? 0 : Math.min(policy.base * 2 ** (attempts - policy.immediateRetries - 1), policy.maximum);
  const delay = Math.max(escalated, minimum);
  return delay === 0 ? 0 : delay + scheduler.jitter(policy.jitter);
}

var GitHubBackoffGate = class extends Disposable {
  constructor(_label, _policy, _scheduler, _logService) {
    super();
    this._label = _label;
    this._policy = _policy;
    this._scheduler = _scheduler;
    this._logService = _logService;
    this._lifetime = new AbortController();
    this._changed = new AbortController();
  }
  /**
   * Waits until an attempt for `key` may run and reports whether it had to.
   * A key this gate holds no failure for proceeds at once.
   */
  async wait(key, signal) {
    let waited = false;
    while (this._state) {
      const state = this._state;
      if (state.key !== key) {
        this._set(void 0);
        return waited;
      }
      const remaining = state.blockedUntil - this._scheduler.now();
      if (remaining <= 0) {
        return waited;
      }
      this._logService?.debug(`[GitHubBackoffGate] Delaying ${this._label} by ${remaining}ms after ${state.attempts} consecutive failure(s)`);
      const changed = this._changed.signal;
      waited = true;
      try {
        await schedulerDelay(this._scheduler, remaining, AbortSignal.any([signal, this._lifetime.signal, changed]));
      } catch (error) {
        if (!changed.aborted || signal.aborted || this._lifetime.signal.aborted) {
          throw error;
        }
      }
    }
    return waited;
  }
  /** Records a failure for `key`, so the next attempt for it waits longer. */
  fail(key) {
    const now = this._scheduler.now();
    const state = this._state;
    const continues = state !== void 0 && state.key === key && now - state.recordedAt <= (this._policy.decay ?? Number.POSITIVE_INFINITY);
    const attempts = (continues ? state.attempts : 0) + 1;
    const delay = gitHubBackoffDelay(this._policy, this._scheduler, attempts);
    this._set({ key, attempts, recordedAt: now, blockedUntil: now + delay });
    if (delay > 0) {
      this._logService?.warn(`[GitHubBackoffGate] Backing off ${this._label} by ${delay}ms after ${attempts} consecutive failure(s)`);
    }
  }
  /** Forgets the recorded failures, releasing anyone already waiting. */
  reset() {
    if (this._state) {
      this._set(void 0);
    }
  }
  dispose() {
    this._state = void 0;
    this._lifetime.abort(new Error(`GitHub ${this._label} backoff was disposed`));
    super.dispose();
  }
  /** Replaces the record and wakes every caller waiting on the previous one. */
  _set(state) {
    this._state = state;
    this._changed.abort();
    this._changed = new AbortController();
  }
};
export { gitHubBackoffDelay, GitHubBackoffGate };
