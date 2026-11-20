// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/widgetHosts/viewPane/bridgeTaskPresentation.ts

// src/vs/workbench/contrib/chat/browser/widgetHosts/viewPane/bridgeTaskPresentation.ts
var BridgeTaskViewState = class {
  constructor() {
    this.completed = false;
    this.inactive = false;
    this.expanded = true;
  }
  update(taskId, complete, inactive = false) {
    if (this.taskId !== taskId) {
      this.taskId = taskId;
      this.expanded = true;
      this.completed = false;
      this.inactive = false;
    }
    if (complete && !this.completed || inactive && !this.inactive) {
      this.expanded = false;
    } else if (this.inactive && !inactive && !complete) {
      this.expanded = true;
    }
    this.completed = complete;
    this.inactive = inactive;
  }
};
var BRIDGE_TASK_DISPLAY_HISTORY_MS = Number.POSITIVE_INFINITY;
function isBridgeTaskDisplayInactive(state) {
  return state !== void 0 && state !== "running" && state !== "waiting_plan" && state !== "awaiting_user";
}
function isBridgeTaskDisplayExpired(_task, _now) { return false; }
function partitionBridgeTaskDisplay(tasks, _now) {
  const slots = [], unfinished = [], history = [];
  for (const task of tasks) {
    if (task.state === "completed") history.push(task);
    // task-card-multi-conv: 「进行中」 only lists work with current evidence (running / planning / waiting on the user).
    // awaiting_sync means no card write and no attributable tool call for 20+ minutes (cards) or 3+ minutes (untracked
    // activity rows): it is shown under 未完成 as 已停滞, never as 进行中. Interrupted, blocked and cancelled are 未完成 too.
    else if (["running", "waiting_plan", "awaiting_user"].includes(task.state) && !task.executionUnverified) slots.push(task);
    else unfinished.push(task);
  }
  return { slots, unfinished, history };
}
export { BridgeTaskViewState, BRIDGE_TASK_DISPLAY_HISTORY_MS, isBridgeTaskDisplayInactive, isBridgeTaskDisplayExpired, partitionBridgeTaskDisplay };
