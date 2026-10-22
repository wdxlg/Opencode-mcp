// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/browserView/electron-browser/browserViewCDPService.ts
import { Disposable } from "./module-0012.mjs";
import { ipcBrowserViewGroupChannelName } from "./module-4163.mjs";
import { ProxyChannel } from "./module-1230.mjs";
import { mainWindow } from "./module-0002.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IMainProcessService } from "./module-3825.mjs";


// src/vs/workbench/contrib/browserView/electron-browser/browserViewCDPService.ts
var BrowserViewCDPService = class extends Disposable {
  constructor(mainProcessService) {
    super();
    const channel = mainProcessService.getChannel(ipcBrowserViewGroupChannelName);
    this._groupService = ProxyChannel.toService(channel);
  }
  async createSessionGroup(browserId) {
    return this._groupService.createGroup(
      { browserIds: [browserId] },
      {
        hostWindowId: mainWindow.vscodeWindowId,
        owner: { type: "user" },
        session: { scope: "ephemeral" /* Ephemeral */ }
      }
    );
  }
  async destroySessionGroup(groupId) {
    await this._groupService.destroyGroup(groupId);
  }
  async sendCDPMessage(groupId, message) {
    await this._groupService.sendCDPMessage(groupId, message);
  }
  onCDPMessage(groupId) {
    return this._groupService.onDynamicCDPMessage(groupId);
  }
  onDidDestroy(groupId) {
    return this._groupService.onDynamicDidDestroy(groupId);
  }
};

BrowserViewCDPService = __decorateClass([
  __decorateParam(0, IMainProcessService)
], BrowserViewCDPService);
export { BrowserViewCDPService };
