// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/services/progress/browser/progressIndicator.ts
import { Disposable } from "./module-0012.mjs";
import { emptyProgressRunner } from "./module-0446.mjs";
import { Emitter } from "./module-0017.mjs";


// src/vs/workbench/services/progress/browser/progressIndicator.ts
var EditorProgressIndicator = class extends Disposable {
  constructor(progressBar, group2) {
    super();
    this.progressBar = progressBar;
    this.group = group2;
    this.registerListeners();
  }
  registerListeners() {
    this._register(this.group.onDidModelChange((e4) => {
      if (e4.kind === 8 /* EDITOR_ACTIVE */ || e4.kind === 6 /* EDITOR_CLOSE */ && this.group.isEmpty) {
        this.progressBar.stop().hide();
      }
    }));
  }
  show(infiniteOrTotal, delay) {
    if (this.group.isEmpty) {
      return emptyProgressRunner;
    }
    if (infiniteOrTotal === true) {
      return this.doShow(true, delay);
    }
    return this.doShow(infiniteOrTotal, delay);
  }
  doShow(infiniteOrTotal, delay) {
    if (typeof infiniteOrTotal === "boolean") {
      this.progressBar.infinite().show(delay);
    } else {
      this.progressBar.total(infiniteOrTotal).show(delay);
    }
    return {
      total: (total) => {
        this.progressBar.total(total);
      },
      worked: (worked) => {
        if (this.progressBar.hasTotal()) {
          this.progressBar.worked(worked);
        } else {
          this.progressBar.infinite().show();
        }
      },
      done: () => {
        this.progressBar.stop().hide();
      }
    };
  }
  async showWhile(promise, delay) {
    if (this.group.isEmpty) {
      try {
        await promise;
      } catch (error) {
      }
    }
    return this.doShowWhile(promise, delay);
  }
  async doShowWhile(promise, delay) {
    try {
      this.progressBar.infinite().show(delay);
      await promise;
    } catch (error) {
    } finally {
      this.progressBar.stop().hide();
    }
  }
};

var ProgressIndicatorState;

((ProgressIndicatorState2) => {
  let Type3;
  ((Type4) => {
    Type4[Type4["None"] = 0] = "None";
    Type4[Type4["Done"] = 1] = "Done";
    Type4[Type4["Infinite"] = 2] = "Infinite";
    Type4[Type4["While"] = 3] = "While";
    Type4[Type4["Work"] = 4] = "Work";
  })(Type3 = ProgressIndicatorState2.Type || (ProgressIndicatorState2.Type = {}));
  ProgressIndicatorState2.None = { type: 0 /* None */ };
  ProgressIndicatorState2.Done = { type: 1 /* Done */ };
  ProgressIndicatorState2.Infinite = { type: 2 /* Infinite */ };
  class While {
    constructor(whilePromise, whileStart, whileDelay) {
      this.whilePromise = whilePromise;
      this.whileStart = whileStart;
      this.whileDelay = whileDelay;
      this.type = 3 /* While */;
    }
  }
  ProgressIndicatorState2.While = While;
  class Work {
    constructor(total, worked) {
      this.total = total;
      this.worked = worked;
      this.type = 4 /* Work */;
    }
  }
  ProgressIndicatorState2.Work = Work;
})(ProgressIndicatorState || (ProgressIndicatorState = {}));

var ScopedProgressIndicator = class extends Disposable {
  constructor(progressBar, scope) {
    super();
    this.progressBar = progressBar;
    this.scope = scope;
    this.progressState = ProgressIndicatorState.None;
    this.registerListeners();
  }
  registerListeners() {
    this._register(this.scope.onDidChangeActive(() => {
      if (this.scope.isActive) {
        this.onDidScopeActivate();
      } else {
        this.onDidScopeDeactivate();
      }
    }));
  }
  onDidScopeActivate() {
    if (this.progressState.type === ProgressIndicatorState.Done.type) {
      return;
    }
    if (this.progressState.type === 3 /* While */) {
      let delay;
      if (this.progressState.whileDelay > 0) {
        const remainingDelay = this.progressState.whileDelay - (Date.now() - this.progressState.whileStart);
        if (remainingDelay > 0) {
          delay = remainingDelay;
        }
      }
      this.doShowWhile(delay);
    } else if (this.progressState.type === 2 /* Infinite */) {
      this.progressBar.infinite().show();
    } else if (this.progressState.type === 4 /* Work */) {
      if (this.progressState.total) {
        this.progressBar.total(this.progressState.total).show();
      }
      if (this.progressState.worked) {
        this.progressBar.worked(this.progressState.worked).show();
      }
    }
  }
  onDidScopeDeactivate() {
    this.progressBar.stop().hide();
  }
  show(infiniteOrTotal, delay) {
    if (typeof infiniteOrTotal === "boolean") {
      this.progressState = ProgressIndicatorState.Infinite;
    } else {
      this.progressState = new ProgressIndicatorState.Work(infiniteOrTotal, void 0);
    }
    if (this.scope.isActive) {
      if (this.progressState.type === 2 /* Infinite */) {
        this.progressBar.infinite().show(delay);
      } else if (this.progressState.type === 4 /* Work */ && typeof this.progressState.total === "number") {
        this.progressBar.total(this.progressState.total).show(delay);
      }
    }
    return {
      total: (total) => {
        this.progressState = new ProgressIndicatorState.Work(
          total,
          this.progressState.type === 4 /* Work */ ? this.progressState.worked : void 0
        );
        if (this.scope.isActive) {
          this.progressBar.total(total);
        }
      },
      worked: (worked) => {
        if (!this.scope.isActive || this.progressBar.hasTotal()) {
          this.progressState = new ProgressIndicatorState.Work(
            this.progressState.type === 4 /* Work */ ? this.progressState.total : void 0,
            this.progressState.type === 4 /* Work */ && typeof this.progressState.worked === "number" ? this.progressState.worked + worked : worked
          );
          if (this.scope.isActive) {
            this.progressBar.worked(worked);
          }
        } else {
          this.progressState = ProgressIndicatorState.Infinite;
          this.progressBar.infinite().show();
        }
      },
      done: () => {
        this.progressState = ProgressIndicatorState.Done;
        if (this.scope.isActive) {
          this.progressBar.stop().hide();
        }
      }
    };
  }
  async showWhile(promise, delay) {
    if (this.progressState.type === 3 /* While */) {
      promise = Promise.allSettled([promise, this.progressState.whilePromise]);
    }
    this.progressState = new ProgressIndicatorState.While(promise, delay || 0, Date.now());
    try {
      this.doShowWhile(delay);
      await promise;
    } catch (error) {
    } finally {
      if (this.progressState.type !== 3 /* While */ || this.progressState.whilePromise === promise) {
        this.progressState = ProgressIndicatorState.None;
        if (this.scope.isActive) {
          this.progressBar.stop().hide();
        }
      }
    }
  }
  doShowWhile(delay) {
    if (this.scope.isActive) {
      this.progressBar.infinite().show(delay);
    }
  }
};

var AbstractProgressScope = class extends Disposable {
  constructor(scopeId, _isActive) {
    super();
    this.scopeId = scopeId;
    this._isActive = _isActive;
    this._onDidChangeActive = this._register(new Emitter());
    this.onDidChangeActive = this._onDidChangeActive.event;
  }
  get isActive() {
    return this._isActive;
  }
  onScopeOpened(scopeId) {
    if (scopeId === this.scopeId) {
      if (!this._isActive) {
        this._isActive = true;
        this._onDidChangeActive.fire();
      }
    }
  }
  onScopeClosed(scopeId) {
    if (scopeId === this.scopeId) {
      if (this._isActive) {
        this._isActive = false;
        this._onDidChangeActive.fire();
      }
    }
  }
};
export { EditorProgressIndicator, ProgressIndicatorState, ScopedProgressIndicator, AbstractProgressScope };
