// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/terminal/node/ptyHostMain.js
// Original module marker: src/vs/platform/terminal/common/terminal.ts
import { createDecorator2 } from "./module-0047.mjs";
import { Registry } from "./module-0058.mjs";


// src/vs/platform/terminal/common/terminal.ts
var IPtyService = createDecorator2("ptyService");

var TerminalExtensions = {
  Backend: "workbench.contributions.terminal.processBackend"
};

var TerminalBackendRegistry = class {
  constructor() {
    this._backends = /* @__PURE__ */ new Map();
  }
  get backends() {
    return this._backends;
  }
  registerTerminalBackend(backend) {
    const key = this._sanitizeRemoteAuthority(backend.remoteAuthority);
    if (this._backends.has(key)) {
      throw new Error(`A terminal backend with remote authority '${key}' was already registered.`);
    }
    this._backends.set(key, backend);
  }
  getTerminalBackend(remoteAuthority) {
    return this._backends.get(this._sanitizeRemoteAuthority(remoteAuthority));
  }
  _sanitizeRemoteAuthority(remoteAuthority) {
    return remoteAuthority?.toLowerCase() ?? "";
  }
};

Registry.add(TerminalExtensions.Backend, new TerminalBackendRegistry());

var ILocalPtyService = createDecorator2("localPtyService");

var ITerminalLogService = createDecorator2("terminalLogService");
export { IPtyService, TerminalExtensions, TerminalBackendRegistry, ILocalPtyService, ITerminalLogService };
