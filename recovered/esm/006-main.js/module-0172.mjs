// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/main.js
// Original module marker: src/vs/platform/externalTerminal/common/externalTerminal.ts
import { __esm } from "./module-0000.mjs";
import { createDecorator, init_instantiation } from "./module-0039.mjs";


// src/vs/platform/externalTerminal/common/externalTerminal.ts
var IExternalTerminalService, DEFAULT_TERMINAL_OSX;

var init_externalTerminal2 = __esm({
  "src/vs/platform/externalTerminal/common/externalTerminal.ts"() {
    init_instantiation();
    IExternalTerminalService = createDecorator("externalTerminal");
    DEFAULT_TERMINAL_OSX = "Terminal.app";
  }
});
export { IExternalTerminalService, DEFAULT_TERMINAL_OSX, init_externalTerminal2 };
