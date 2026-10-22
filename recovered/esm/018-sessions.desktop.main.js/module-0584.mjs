// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/contrib/hover/browser/hoverOperation.ts
import { Disposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { RunOnceScheduler, createCancelableAsyncIterableProducer } from "./module-0036.mjs";
import { onUnexpectedError } from "./module-0004.mjs";


// src/vs/editor/contrib/hover/browser/hoverOperation.ts
var HoverResult = class {
  constructor(value2, isComplete, hasLoadingMessage, options3) {
    this.value = value2;
    this.isComplete = isComplete;
    this.hasLoadingMessage = hasLoadingMessage;
    this.options = options3;
  }
};

var HoverOperation = class extends Disposable {
  constructor(_editor, _computer) {
    super();
    this._editor = _editor;
    this._computer = _computer;
    this._onResult = this._register(new Emitter());
    this.onResult = this._onResult.event;
    this._asyncComputationScheduler = this._register(new Debouncer((options3) => this._triggerAsyncComputation(options3), 0));
    this._syncComputationScheduler = this._register(new Debouncer((options3) => this._triggerSyncComputation(options3), 0));
    this._loadingMessageScheduler = this._register(new Debouncer((options3) => this._triggerLoadingMessage(options3), 0));
    this._state = 0 /* Idle */;
    this._asyncIterable = null;
    this._asyncIterableDone = false;
    this._result = [];
  }
  dispose() {
    if (this._asyncIterable) {
      this._asyncIterable.cancel();
      this._asyncIterable = null;
    }
    this._options = void 0;
    super.dispose();
  }
  get _hoverTime() {
    return this._editor.getOption(69 /* hover */).delay;
  }
  get _firstWaitTime() {
    return this._hoverTime / 2;
  }
  get _secondWaitTime() {
    return this._hoverTime - this._firstWaitTime;
  }
  get _loadingMessageTime() {
    return 3 * this._hoverTime;
  }
  _setState(state, options3) {
    this._options = options3;
    this._state = state;
    this._fireResult(options3);
  }
  _triggerAsyncComputation(options3) {
    this._setState(2 /* SecondWait */, options3);
    this._syncComputationScheduler.schedule(options3, this._secondWaitTime);
    if (this._computer.computeAsync) {
      this._asyncIterableDone = false;
      this._asyncIterable = createCancelableAsyncIterableProducer((token) => this._computer.computeAsync(options3, token));
      (async () => {
        try {
          for await (const item of this._asyncIterable) {
            if (item) {
              this._result.push(item);
              this._fireResult(options3);
            }
          }
          this._asyncIterableDone = true;
          if (this._state === 3 /* WaitingForAsync */ || this._state === 4 /* WaitingForAsyncShowingLoading */) {
            this._setState(0 /* Idle */, options3);
          }
        } catch (e4) {
          onUnexpectedError(e4);
        }
      })();
    } else {
      this._asyncIterableDone = true;
    }
  }
  _triggerSyncComputation(options3) {
    if (this._computer.computeSync) {
      this._result = this._result.concat(this._computer.computeSync(options3));
    }
    this._setState(this._asyncIterableDone ? 0 /* Idle */ : 3 /* WaitingForAsync */, options3);
  }
  _triggerLoadingMessage(options3) {
    if (this._state === 3 /* WaitingForAsync */) {
      this._setState(4 /* WaitingForAsyncShowingLoading */, options3);
    }
  }
  _fireResult(options3) {
    if (this._state === 1 /* FirstWait */ || this._state === 2 /* SecondWait */) {
      return;
    }
    const isComplete = this._state === 0 /* Idle */;
    const hasLoadingMessage = this._state === 4 /* WaitingForAsyncShowingLoading */;
    this._onResult.fire(new HoverResult(this._result.slice(0), isComplete, hasLoadingMessage, options3));
  }
  start(mode, options3) {
    if (mode === 0 /* Delayed */) {
      if (this._state === 0 /* Idle */) {
        this._setState(1 /* FirstWait */, options3);
        this._asyncComputationScheduler.schedule(options3, this._firstWaitTime);
        this._loadingMessageScheduler.schedule(options3, this._loadingMessageTime);
      }
    } else {
      switch (this._state) {
        case 0 /* Idle */:
          this._triggerAsyncComputation(options3);
          this._syncComputationScheduler.cancel();
          this._triggerSyncComputation(options3);
          break;
        case 2 /* SecondWait */:
          this._syncComputationScheduler.cancel();
          this._triggerSyncComputation(options3);
          break;
      }
    }
  }
  cancel() {
    this._asyncComputationScheduler.cancel();
    this._syncComputationScheduler.cancel();
    this._loadingMessageScheduler.cancel();
    if (this._asyncIterable) {
      this._asyncIterable.cancel();
      this._asyncIterable = null;
    }
    this._result = [];
    this._options = void 0;
    this._state = 0 /* Idle */;
  }
  get options() {
    return this._options;
  }
};

var Debouncer = class extends Disposable {
  constructor(runner, debounceTimeMs) {
    super();
    this._scheduler = this._register(new RunOnceScheduler(() => runner(this._options), debounceTimeMs));
  }
  schedule(options3, debounceTimeMs) {
    this._options = options3;
    this._scheduler.schedule(debounceTimeMs);
  }
  cancel() {
    this._scheduler.cancel();
  }
};
export { HoverResult, HoverOperation, Debouncer };
