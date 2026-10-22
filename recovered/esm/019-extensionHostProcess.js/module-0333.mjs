// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/node/extensionHostProcess.js
// Original module marker: src/vs/workbench/api/node/extHostTerminalService.ts
import { BaseExtHostTerminalService, ExtHostTerminal } from "./module-0269.mjs";
import { generateUuid } from "./module-0040.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IExtHostCommands } from "./module-0268.mjs";
import { IExtHostRpcService } from "./module-0069.mjs";


// src/vs/workbench/api/node/extHostTerminalService.ts
var ExtHostTerminalService = class extends BaseExtHostTerminalService {
  constructor(extHostCommands, extHostRpc) {
    super(true, extHostCommands, extHostRpc);
  }
  createTerminal(name, shellPath, shellArgs) {
    return this.createTerminalFromOptions({ name, shellPath, shellArgs });
  }
  createTerminalFromOptions(options2, internalOptions) {
    const terminal = new ExtHostTerminal(this._proxy, generateUuid(), options2, options2.name);
    this._terminals.push(terminal);
    terminal.create(options2, this._serializeParentTerminal(options2, internalOptions));
    return terminal.value;
  }
};

ExtHostTerminalService = __decorateClass([
  __decorateParam(0, IExtHostCommands),
  __decorateParam(1, IExtHostRpcService)
], ExtHostTerminalService);
export { ExtHostTerminalService };
