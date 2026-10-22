// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/main.js
// Original module marker: src/vs/platform/terminal/common/terminal.ts
import { __esm } from "./module-0000.mjs";
import { createDecorator, init_instantiation } from "./module-0039.mjs";
import { Registry, init_platform2 } from "./module-0042.mjs";


// src/vs/platform/terminal/common/terminal.ts
var IPtyService, TerminalExtensions, TerminalBackendRegistry, ILocalPtyService, ITerminalLogService;

var init_terminal = __esm({
  "src/vs/platform/terminal/common/terminal.ts"() {
    init_instantiation();
    init_platform2();
    IPtyService = createDecorator("ptyService");
    TerminalExtensions = {
      Backend: "workbench.contributions.terminal.processBackend"
    };
    TerminalBackendRegistry = class {
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
    ILocalPtyService = createDecorator("localPtyService");
    ITerminalLogService = createDecorator("terminalLogService");
  }
});
export { IPtyService, TerminalExtensions, TerminalBackendRegistry, ILocalPtyService, ITerminalLogService, init_terminal };
