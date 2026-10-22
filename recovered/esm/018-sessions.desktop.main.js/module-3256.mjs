// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/tasks/common/taskSystem.ts



// src/vs/workbench/contrib/tasks/common/taskSystem.ts
var VerifiedTask = class {
  constructor(task, resolver, trigger) {
    this.task = task;
    this.resolver = resolver;
    this.trigger = trigger;
  }
  verify() {
    let verified = false;
    if (this.trigger && this.resolvedVariables && this.workspaceFolder && this.shellLaunchConfig !== void 0) {
      verified = true;
    }
    return verified;
  }
  getVerifiedTask() {
    if (this.verify()) {
      return { task: this.task, resolver: this.resolver, trigger: this.trigger, resolvedVariables: this.resolvedVariables, systemInfo: this.systemInfo, workspaceFolder: this.workspaceFolder, shellLaunchConfig: this.shellLaunchConfig };
    } else {
      throw new Error("VerifiedTask was not checked. verify must be checked before getVerifiedTask.");
    }
  }
};

var TaskError = class {
  constructor(severity, message, code) {
    this.severity = severity;
    this.message = message;
    this.code = code;
  }
};

var Triggers;

((Triggers2) => {
  Triggers2.shortcut = "shortcut";
  Triggers2.command = "command";
  Triggers2.reconnect = "reconnect";
})(Triggers || (Triggers = {}));
export { VerifiedTask, TaskError, Triggers };
