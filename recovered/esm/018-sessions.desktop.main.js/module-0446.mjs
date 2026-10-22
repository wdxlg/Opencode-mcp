// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/platform/progress/common/progress.ts
import { createDecorator } from "./module-0077.mjs";
import { Disposable, DisposableStore, toDisposable } from "./module-0012.mjs";
import { DeferredPromise } from "./module-0036.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { CancellationTokenSource } from "./module-0025.mjs";


// src/vs/platform/progress/common/progress.ts
var IProgressService = createDecorator("progressService");

var emptyProgressRunner = Object.freeze({
  total() {
  },
  worked() {
  },
  done() {
  }
});

var Progress = class {
  constructor(callback) {
    this.callback = callback;
  }
  static {
    this.None = Object.freeze({ report() {
    } });
  }
  get value() {
    return this._value;
  }
  report(item) {
    this._value = item;
    this.callback(this._value);
  }
};

var UnmanagedProgress = class extends Disposable {
  constructor(options3, progressService) {
    super();
    this.deferred = new DeferredPromise();
    progressService.withProgress(options3, (reporter) => {
      this.reporter = reporter;
      if (this.lastStep) {
        reporter.report(this.lastStep);
      }
      return this.deferred.p;
    });
    this._register(toDisposable(() => this.deferred.complete()));
  }
  report(step) {
    if (this.reporter) {
      this.reporter.report(step);
    } else {
      this.lastStep = step;
    }
  }
};

UnmanagedProgress = __decorateClass([
  __decorateParam(1, IProgressService)
], UnmanagedProgress);

var LongRunningOperation = class extends Disposable {
  constructor(progressIndicator) {
    super();
    this.progressIndicator = progressIndicator;
    this.currentOperationId = 0;
    this.currentOperationDisposables = this._register(new DisposableStore());
    this.currentProgressTimeout = void 0;
  }
  start(progressDelay) {
    this.stop();
    const newOperationId = ++this.currentOperationId;
    const newOperationToken = new CancellationTokenSource();
    this.currentProgressTimeout = setTimeout(() => {
      if (newOperationId === this.currentOperationId) {
        this.currentProgressRunner = this.progressIndicator.show(true);
      }
    }, progressDelay);
    this.currentOperationDisposables.add(toDisposable(() => clearTimeout(this.currentProgressTimeout)));
    this.currentOperationDisposables.add(toDisposable(() => newOperationToken.cancel()));
    this.currentOperationDisposables.add(toDisposable(() => this.currentProgressRunner ? this.currentProgressRunner.done() : void 0));
    return {
      id: newOperationId,
      token: newOperationToken.token,
      stop: () => this.doStop(newOperationId),
      isCurrent: () => this.currentOperationId === newOperationId
    };
  }
  stop() {
    this.doStop(this.currentOperationId);
  }
  doStop(operationId) {
    if (this.currentOperationId === operationId) {
      this.currentOperationDisposables.clear();
    }
  }
};

var IEditorProgressService = createDecorator("editorProgressService");
export { IProgressService, emptyProgressRunner, Progress, UnmanagedProgress, LongRunningOperation, IEditorProgressService };
