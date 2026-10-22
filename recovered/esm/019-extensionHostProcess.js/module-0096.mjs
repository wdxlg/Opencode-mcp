// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/node/extensionHostProcess.js
// Original module marker: src/vs/platform/progress/common/progress.ts
import { createDecorator2 } from "./module-0048.mjs";
import { Disposable, toDisposable } from "./module-0011.mjs";
import { DeferredPromise } from "./module-0029.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";


// src/vs/platform/progress/common/progress.ts
var IProgressService = createDecorator2("progressService");

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
  constructor(options2, progressService) {
    super();
    this.deferred = new DeferredPromise();
    progressService.withProgress(options2, (reporter) => {
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

var IEditorProgressService = createDecorator2("editorProgressService");
export { IProgressService, emptyProgressRunner, Progress, UnmanagedProgress, IEditorProgressService };
