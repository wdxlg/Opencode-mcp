// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/services/browserView/electron-browser/playwrightWorkbenchService.ts
import { mainWindow } from "./module-0002.mjs";
import { ProxyChannel } from "./module-1230.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ILogService } from "./module-0095.mjs";
import { registerSharedProcessRemoteService } from "./module-3826.mjs";
import { IPlaywrightService } from "./module-4035.mjs";


// src/vs/workbench/services/browserView/electron-browser/playwrightWorkbenchService.ts
var PlaywrightChannelClient = class {
  constructor(channel, logService) {
    const options3 = {
      windowId: mainWindow.vscodeWindowId
    };
    void channel.call("__initialize", options3).catch((e4) => {
      logService.error(`Failed to initialize Playwright service`, e4);
    });
    return ProxyChannel.toService(channel);
  }
};

PlaywrightChannelClient = __decorateClass([
  __decorateParam(1, ILogService)
], PlaywrightChannelClient);

registerSharedProcessRemoteService(IPlaywrightService, "playwright", { channelClientCtor: PlaywrightChannelClient });
export { PlaywrightChannelClient };
