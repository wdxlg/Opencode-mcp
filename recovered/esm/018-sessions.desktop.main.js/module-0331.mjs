// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/browser/gpu/taskQueue.ts
import { Disposable, toDisposable } from "./module-0012.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ILogService } from "./module-0095.mjs";
import { getActiveWindow } from "./module-0075.mjs";
import { IInstantiationService } from "./module-0077.mjs";


// src/vs/editor/browser/gpu/taskQueue.ts
var TaskQueue2 = class extends Disposable {
  constructor(_logService) {
    super();
    this._logService = _logService;
    this._tasks = [];
    this._i = 0;
    this._register(toDisposable(() => this.clear()));
  }
  enqueue(task) {
    this._tasks.push(task);
    this._start();
  }
  flush() {
    while (this._i < this._tasks.length) {
      if (!this._tasks[this._i]()) {
        this._i++;
      }
    }
    this.clear();
  }
  clear() {
    if (this._idleCallback) {
      this._cancelCallback(this._idleCallback);
      this._idleCallback = void 0;
    }
    this._i = 0;
    this._tasks.length = 0;
  }
  _start() {
    if (!this._idleCallback) {
      this._idleCallback = this._requestCallback(this._process.bind(this));
    }
  }
  _process(deadline) {
    this._idleCallback = void 0;
    let taskDuration = 0;
    let longestTask = 0;
    let lastDeadlineRemaining = deadline.timeRemaining();
    let deadlineRemaining = 0;
    while (this._i < this._tasks.length) {
      taskDuration = Date.now();
      if (!this._tasks[this._i]()) {
        this._i++;
      }
      taskDuration = Math.max(1, Date.now() - taskDuration);
      longestTask = Math.max(taskDuration, longestTask);
      deadlineRemaining = deadline.timeRemaining();
      if (longestTask * 1.5 > deadlineRemaining) {
        if (lastDeadlineRemaining - taskDuration < -20) {
          this._logService.warn(`task queue exceeded allotted deadline by ${Math.abs(Math.round(lastDeadlineRemaining - taskDuration))}ms`);
        }
        this._start();
        return;
      }
      lastDeadlineRemaining = deadlineRemaining;
    }
    this.clear();
  }
};

TaskQueue2 = __decorateClass([
  __decorateParam(0, ILogService)
], TaskQueue2);

var PriorityTaskQueue = class extends TaskQueue2 {
  _requestCallback(callback) {
    return getActiveWindow().setTimeout(() => callback(this._createDeadline(16)));
  }
  _cancelCallback(identifier2) {
    getActiveWindow().clearTimeout(identifier2);
  }
  _createDeadline(duration) {
    const end = Date.now() + duration;
    return {
      timeRemaining: () => Math.max(0, end - Date.now())
    };
  }
};

var IdleTaskQueueInternal = class extends TaskQueue2 {
  _requestCallback(callback) {
    return getActiveWindow().requestIdleCallback(callback);
  }
  _cancelCallback(identifier2) {
    getActiveWindow().cancelIdleCallback(identifier2);
  }
};

var IdleTaskQueue = "requestIdleCallback" in getActiveWindow() ? IdleTaskQueueInternal : PriorityTaskQueue;

var DebouncedIdleTask = class {
  constructor(instantiationService) {
    this._queue = instantiationService.createInstance(IdleTaskQueue);
  }
  set(task) {
    this._queue.clear();
    this._queue.enqueue(task);
  }
  flush() {
    this._queue.flush();
  }
};

DebouncedIdleTask = __decorateClass([
  __decorateParam(0, IInstantiationService)
], DebouncedIdleTask);
export { TaskQueue2, PriorityTaskQueue, IdleTaskQueueInternal, IdleTaskQueue, DebouncedIdleTask };
