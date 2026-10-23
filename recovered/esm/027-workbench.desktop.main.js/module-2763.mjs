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
function isBridgeTaskDisplayExpired(task, now = Date.now()) {
  return false;
}
function partitionBridgeTaskDisplay(tasks2, now = Date.now()) {
  const all = [...tasks2].sort((a, b) => (b.updatedAt || b.createdAt || 0) - (a.updatedAt || a.createdAt || 0));
  const slots = all.filter((task) => ["running", "waiting_plan", "awaiting_sync", "awaiting_user"].includes(task.state));
  return { slots, history: all.filter((task) => !slots.includes(task)) };
}
export { BridgeTaskViewState, BRIDGE_TASK_DISPLAY_HISTORY_MS, isBridgeTaskDisplayInactive, isBridgeTaskDisplayExpired, partitionBridgeTaskDisplay };
