// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/services/environment/electron-browser/shellEnvironmentService.ts
import { createDecorator } from "./module-0077.mjs";
import { process2 } from "./module-3821.mjs";
import { registerSingleton } from "./module-0135.mjs";


// src/vs/workbench/services/environment/electron-browser/shellEnvironmentService.ts
var IShellEnvironmentService = createDecorator("shellEnvironmentService");

var ShellEnvironmentService = class {
  getShellEnv() {
    return process2.shellEnv();
  }
};

registerSingleton(IShellEnvironmentService, ShellEnvironmentService, 1 /* Delayed */);
export { IShellEnvironmentService, ShellEnvironmentService };
