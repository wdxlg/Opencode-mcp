// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/platform/notification/common/notification.ts
import { severity_default } from "./module-0266.mjs";
import { createDecorator } from "./module-0077.mjs";
import { Event2 } from "./module-0017.mjs";
import { localize } from "./module-0001.mjs";


// src/vs/platform/notification/common/notification.ts
var Severity2 = severity_default;

var INotificationService = createDecorator("notificationService");

function isNotificationSource(thing) {
  if (thing) {
    const candidate = thing;
    return typeof candidate.id === "string" && typeof candidate.label === "string";
  }
  return false;
}

var NoOpNotification = class {
  constructor() {
    this.progress = new NoOpProgress();
    this.onDidClose = Event2.None;
    this.onDidChangeVisibility = Event2.None;
  }
  updateSeverity(severity) {
  }
  updateMessage(message) {
  }
  updateActions(actions) {
  }
  close() {
  }
};

var NoOpProgress = class {
  infinite() {
  }
  done() {
  }
  total(value2) {
  }
  worked(value2) {
  }
};

function withSeverityPrefix(label3, severity) {
  if (severity === Severity2.Error) {
    return localize(3178, null, label3);
  }
  if (severity === Severity2.Warning) {
    return localize(3180, null, label3);
  }
  return localize(3179, null, label3);
}
export { isNotificationSource, withSeverityPrefix, Severity2, INotificationService, NoOpNotification, NoOpProgress };
