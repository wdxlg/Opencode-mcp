// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/github/common/pullRequestScheduler.ts
import { Disposable, MutableDisposable } from "./module-0010.mjs";


// src/vs/platform/github/common/pullRequestScheduler.ts
var PullRequestScheduler = class extends Disposable {
  constructor(_scheduler) {
    super();
    this._scheduler = _scheduler;
    this._tasks = /* @__PURE__ */ new Map();
    this._timer = this._register(new MutableDisposable());
    this._sequence = 0;
  }
  schedule(key, dueAt, run2) {
    this._tasks.set(key, { key, dueAt, sequence: this._sequence++, run: run2 });
    this._updateTimer();
  }
  cancel(key) {
    if (this._tasks.delete(key)) {
      this._updateTimer();
    }
  }
  cancelPrefix(prefix) {
    let changed = false;
    for (const key of this._tasks.keys()) {
      if (key.startsWith(prefix)) {
        this._tasks.delete(key);
        changed = true;
      }
    }
    if (changed) {
      this._updateTimer();
    }
  }
  clear() {
    this._tasks.clear();
    this._timer.clear();
  }
  dispose() {
    this.clear();
    super.dispose();
  }
  _updateTimer() {
    this._timer.clear();
    let next;
    for (const task of this._tasks.values()) {
      if (!next || task.dueAt < next.dueAt || task.dueAt === next.dueAt && task.sequence < next.sequence) {
        next = task;
      }
    }
    if (!next) {
      return;
    }
    this._timer.value = this._scheduler.schedule(() => {
      this._timer.clear();
      const due = [...this._tasks.values()].filter((task) => task.dueAt <= this._scheduler.now()).sort((left, right) => left.dueAt - right.dueAt || left.sequence - right.sequence);
      for (const task of due) {
        if (this._tasks.get(task.key) !== task) {
          continue;
        }
        this._tasks.delete(task.key);
        task.run();
      }
      this._updateTimer();
    }, Math.max(0, next.dueAt - this._scheduler.now()));
  }
};
export { PullRequestScheduler };
