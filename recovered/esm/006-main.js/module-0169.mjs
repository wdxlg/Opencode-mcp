// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/main.js
// Original module marker: src/vs/platform/extensions/common/extensionHostStarter.ts
import { __esm } from "./module-0000.mjs";
import { createDecorator, init_instantiation } from "./module-0039.mjs";


// src/vs/platform/extensions/common/extensionHostStarter.ts
var IExtensionHostStarter, ipcExtensionHostStarterChannelName, extensionHostGraceTimeMs;

var init_extensionHostStarter = __esm({
  "src/vs/platform/extensions/common/extensionHostStarter.ts"() {
    init_instantiation();
    IExtensionHostStarter = createDecorator("extensionHostStarter");
    ipcExtensionHostStarterChannelName = "extensionHostStarter";
    extensionHostGraceTimeMs = 6e3;
  }
});
export { IExtensionHostStarter, ipcExtensionHostStarterChannelName, extensionHostGraceTimeMs, init_extensionHostStarter };
