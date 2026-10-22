// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/code/electron-utility/sharedProcess/sharedProcessMain.js
// Original module marker: src/vs/platform/browserView/node/browserViewGroupRemoteService.ts
import { Disposable } from "./module-0013.mjs";
import { ipcBrowserViewGroupChannelName } from "./module-0295.mjs";
import { ProxyChannel } from "./module-0034.mjs";
import { Event } from "./module-0018.mjs";


// src/vs/platform/browserView/node/browserViewGroupRemoteService.ts
var RemoteBrowserViewGroup = class extends Disposable {
  constructor(id2, groupService) {
    super();
    this.id = id2;
    this.groupService = groupService;
    this._register(groupService.onDynamicDidDestroy(this.id)(() => {
      this.dispose(true);
    }));
  }
  get onDidDestroy() {
    return this.groupService.onDynamicDidDestroy(this.id);
  }
  async sendCDPMessage(msg) {
    return this.groupService.sendCDPMessage(this.id, msg);
  }
  get onCDPMessage() {
    return this.groupService.onDynamicCDPMessage(this.id);
  }
  dispose(fromService = false) {
    if (!fromService) {
      this.groupService.destroyGroup(this.id);
    }
    super.dispose();
  }
};

var BrowserViewGroupRemoteService = class {
  constructor(mainProcessService) {
    this._groups = /* @__PURE__ */ new Map();
    const channel = mainProcessService.getChannel(ipcBrowserViewGroupChannelName);
    this._groupService = ProxyChannel.toService(channel);
  }
  async createGroup(filter, targetContext) {
    const id2 = await this._groupService.createGroup(filter, targetContext);
    return this._wrap(id2);
  }
  _wrap(id2) {
    const group = new RemoteBrowserViewGroup(id2, this._groupService);
    this._groups.set(id2, group);
    Event.once(group.onDidDestroy)(() => {
      this._groups.delete(id2);
    });
    return group;
  }
};
export { RemoteBrowserViewGroup, BrowserViewGroupRemoteService };
