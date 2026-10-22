// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/base/browser/animatedValue.ts
import { observableSignal } from "./module-0058.mjs";
import { getActiveWindow } from "./module-0075.mjs";


// src/vs/base/browser/animatedValue.ts
var AnimatedValue = class _AnimatedValue {
  constructor(startValue, endValue, durationMs, startTimeMs, _interpolationFunction = easeOutExpo2) {
    this.startValue = startValue;
    this.endValue = endValue;
    this.durationMs = durationMs;
    this.startTimeMs = startTimeMs;
    this._interpolationFunction = _interpolationFunction;
    if (startValue === endValue) {
      this.durationMs = 0;
    }
  }
  static const(value2) {
    return new _AnimatedValue(value2, value2, 0, Date.now());
  }
  static startNow(startValue, endValue, durationMs, interpolationFunction = easeOutExpo2) {
    return new _AnimatedValue(startValue, endValue, durationMs, Date.now(), interpolationFunction);
  }
  isFinished(nowMs) {
    return nowMs >= this.startTimeMs + this.durationMs;
  }
  getValue(nowMs) {
    const timePassed = nowMs - this.startTimeMs;
    if (timePassed >= this.durationMs) {
      return this.endValue;
    }
    const value2 = this._interpolationFunction(timePassed, this.startValue, this.endValue - this.startValue, this.durationMs);
    return value2;
  }
};

function easeOutExpo2(passedTime, start, length, totalDuration) {
  return passedTime === totalDuration ? start + length : length * (-Math.pow(2, -10 * passedTime / totalDuration) + 1) + start;
}

function easeOutCubic2(passedTime, start, length, totalDuration) {
  return length * ((passedTime = passedTime / totalDuration - 1) * passedTime * passedTime + 1) + start;
}

var ObservableAnimatedValue = class _ObservableAnimatedValue {
  constructor(_value) {
    this._value = _value;
  }
  static const(value2) {
    return new _ObservableAnimatedValue(AnimatedValue.const(value2));
  }
  getValue(reader) {
    const nowMs = Date.now();
    if (!this._value.isFinished(nowMs)) {
      AnimationFrameScheduler2.instance.invalidateOnNextAnimationFrame(reader);
    }
    return this._value.getValue(nowMs);
  }
  isFinished(reader) {
    const nowMs = Date.now();
    const isFinished = this._value.isFinished(nowMs);
    if (!isFinished) {
      AnimationFrameScheduler2.instance.invalidateOnNextAnimationFrame(reader);
    }
    return isFinished;
  }
};

var AnimationFrameScheduler2 = class _AnimationFrameScheduler {
  constructor() {
    this._counter = observableSignal(this);
    this._isScheduled = false;
  }
  static {
    this.instance = new _AnimationFrameScheduler();
  }
  invalidateOnNextAnimationFrame(reader) {
    this._counter.read(reader);
    if (!this._isScheduled) {
      this._isScheduled = true;
      getActiveWindow().requestAnimationFrame(() => {
        this._isScheduled = false;
        this._update();
      });
    }
  }
  _update() {
    this._counter.trigger(void 0);
  }
};
export { easeOutExpo2, easeOutCubic2, AnimatedValue, ObservableAnimatedValue, AnimationFrameScheduler2 };
