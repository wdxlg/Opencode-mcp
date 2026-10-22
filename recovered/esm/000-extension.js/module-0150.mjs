// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/extensions/opencode/dist/extension.js
// Original module marker: src/adaptive-concurrency.ts
import { init_define_OPENCODE_BUILD_INFO } from "./module-0000.mjs";


// src/adaptive-concurrency.ts
init_define_OPENCODE_BUILD_INFO();

var DEFAULT_WINDOW = 12;

var DEFAULT_SLOW_CALL_MS = 3e4;

var AdaptiveConcurrencyController = class {
  min;
  max;
  windowSize;
  slowCallMs;
  limit_;
  samples = [];
  constructor(options) {
    const { min, max } = options;
    if (!Number.isInteger(min) || min < 1) throw new Error("min must be a positive integer");
    if (!Number.isInteger(max) || max < min) throw new Error("max must be an integer >= min");
    this.min = min;
    this.max = max;
    this.windowSize = Math.max(1, options.windowSize ?? DEFAULT_WINDOW);
    this.slowCallMs = Math.max(1, options.slowCallMs ?? DEFAULT_SLOW_CALL_MS);
    this.limit_ = Math.min(max,Math.max(min,options.initial ?? min));
  }
  get limit() {
    return this.limit_;
  }
  /** Samples collected since the last decision. */
  get pending() {
    return this.samples.length;
  }
  /**
   * Record one completion. Returns a decision once a full window is available;
   * until then the current limit is reported unchanged.
   */
  record(sample) {
    this.samples.push(sample);
    if (this.samples.length < this.windowSize) {
      return { limit: this.limit_, changed: false, reason: "hold" };
    }
    const window14 = this.samples;
    this.samples = [];
    const failures = window14.filter((s) => s.failed).length;
    const slow = window14.filter((s) => s.durationMs >= (s.slowCallMs ?? this.slowCallMs)).length;
    const strained = window14.filter(s=>s.failed || s.durationMs >= (s.slowCallMs ?? this.slowCallMs) || s.pressure).length;
    const queuedCalls = window14.filter((s) => s.queued > 0 || s.queueWaitMs > 5).length;
    const previous = this.limit_;
    if (window14.some(s=>s.pressure) || strained * 3 >= window14.length) {
      this.limit_ = Math.max(this.min, Math.floor(this.limit_ / 2));
      return { limit: this.limit_, changed: this.limit_ !== previous, reason: "shrink" };
    }
    if (queuedCalls * 2 >= window14.length && this.limit_ < this.max) {
      this.limit_ = Math.min(this.max, this.limit_ + 1);
      return { limit: this.limit_, changed: this.limit_ !== previous, reason: "grow" };
    }
    return { limit: this.limit_, changed: false, reason: "hold" };
  }
  /** Drop partial-window state, e.g. after a manual limit change. */
  reset(limit) {
    this.samples = [];
    if (limit !== void 0) {
      this.limit_ = Math.min(this.max, Math.max(this.min, Math.trunc(limit)));
    }
  }
};
export { DEFAULT_WINDOW, DEFAULT_SLOW_CALL_MS, AdaptiveConcurrencyController };
