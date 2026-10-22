// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/api/browser/mainThreadWindow.ts
import { DisposableStore } from "./module-0012.mjs";
import { ExtHostContext, MainContext } from "./module-0922.mjs";
import { Event2 } from "./module-0017.mjs";
import { encodeBase64 } from "./module-0038.mjs";
import { URI } from "./module-0032.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { extHostNamedCustomer } from "./module-0920.mjs";
import { IHostService } from "./module-1118.mjs";
import { IOpenerService } from "./module-0272.mjs";
import { IUserActivityService } from "./module-1297.mjs";


// src/vs/workbench/api/browser/mainThreadWindow.ts
var MainThreadWindow = class {
  constructor(extHostContext, hostService, openerService, userActivityService) {
    this.hostService = hostService;
    this.openerService = openerService;
    this.userActivityService = userActivityService;
    this.disposables = new DisposableStore();
    this.proxy = extHostContext.getProxy(ExtHostContext.ExtHostWindow);
    Event2.latch(hostService.onDidChangeFocus)(this.proxy.$onDidChangeWindowFocus, this.proxy, this.disposables);
    userActivityService.onDidChangeIsActive(this.proxy.$onDidChangeWindowActive, this.proxy, this.disposables);
    this.registerNativeHandle();
  }
  dispose() {
    this.disposables.dispose();
  }
  registerNativeHandle() {
    Event2.latch(this.hostService.onDidChangeActiveWindow)(
      async (windowId) => {
        const handle2 = await this.hostService.getNativeWindowHandle(windowId);
        this.proxy.$onDidChangeActiveNativeWindowHandle(handle2 ? encodeBase64(handle2) : void 0);
      },
      this,
      this.disposables
    );
  }
  $getInitialState() {
    return Promise.resolve({
      isFocused: this.hostService.hasFocus,
      isActive: this.userActivityService.isActive
    });
  }
  async $openUri(uriComponents, uriString, options3) {
    const uri4 = URI.from(uriComponents);
    let target;
    if (uriString && URI.parse(uriString).toString() === uri4.toString()) {
      target = uriString;
    } else {
      target = uri4;
    }
    return this.openerService.open(target, {
      openExternal: true,
      allowTunneling: options3.allowTunneling,
      allowContributedOpeners: options3.allowContributedOpeners
    });
  }
  async $asExternalUri(uriComponents, options3) {
    const result = await this.openerService.resolveExternalUri(URI.revive(uriComponents), options3);
    return result.resolved;
  }
};

MainThreadWindow = __decorateClass([
  extHostNamedCustomer(MainContext.MainThreadWindow),
  __decorateParam(1, IHostService),
  __decorateParam(2, IOpenerService),
  __decorateParam(3, IUserActivityService)
], MainThreadWindow);
export { MainThreadWindow };
