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
var BRIDGE_TASK_DISPLAY_HISTORY_MS = 60 * 6e4;
function isBridgeTaskDisplayInactive(state) {
  return state !== void 0 && state !== "running" && state !== "waiting_plan";
}
function isBridgeTaskDisplayExpired(task, now = Date.now()) {
  return isBridgeTaskDisplayInactive(task.state) && Number.isFinite(task.updatedAt) && task.updatedAt > 0 && now - task.updatedAt >= BRIDGE_TASK_DISPLAY_HISTORY_MS;
}
function partitionBridgeTaskDisplay(tasks2, now = Date.now()) {
  const retained = tasks2.filter((task) => !isBridgeTaskDisplayExpired(task, now));
  const candidates = retained.filter((task) => !["awaiting_sync", "blocked", "cancelled", "interrupted", "cleared"].includes(task.state));
  const slots = candidates.filter((task) => !task.createdAt || !Number.isFinite(task.createdAt));
  const dated = candidates.filter((task) => !!task.createdAt && Number.isFinite(task.createdAt)).sort((a, b) => a.createdAt - b.createdAt || tasks2.indexOf(b) - tasks2.indexOf(a));
  for (const task of dated) {
    let oldest = -1;
    const finishedSlots = [];
    for (let index2 = 0; index2 < slots.length; index2++) {
      const previous = slots[index2];
      if (previous.state === "completed" && Number.isFinite(previous.updatedAt) && previous.updatedAt > 0 && previous.updatedAt < task.createdAt) {
        finishedSlots.push(index2);
        if (oldest < 0 || previous.updatedAt < slots[oldest].updatedAt) {
          oldest = index2;
        }
      }
    }
    if (oldest >= 0) {
      slots[oldest] = task;
      for (const index2 of finishedSlots.reverse()) {
        if (index2 !== oldest) {
          slots.splice(index2, 1);
        }
      }
    } else {
      slots.push(task);
    }
  }
  const slotIds = new Set(slots.map((task) => task.id));
  return { slots, history: retained.filter((task) => !slotIds.has(task.id)) };
}
export { BridgeTaskViewState, BRIDGE_TASK_DISPLAY_HISTORY_MS, isBridgeTaskDisplayInactive, isBridgeTaskDisplayExpired, partitionBridgeTaskDisplay };
