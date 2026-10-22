// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/api/browser/mainThreadBrowserTunnelProxy.ts
import { Disposable } from "./module-0012.mjs";
import { ExtHostContext, MainContext } from "./module-0922.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { extHostNamedCustomer } from "./module-0920.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IWorkbenchEnvironmentService } from "./module-0936.mjs";
import { IBrowserViewWorkbenchService } from "./module-1243.mjs";


// src/vs/workbench/api/browser/mainThreadBrowserTunnelProxy.ts
var browserRemoteProxyEnabledSettingId = "workbench.browser.enableRemoteProxy";

var MainThreadBrowserTunnelProxy = class extends Disposable {
  constructor(extHostContext, _configurationService, _environmentService, _browserViewWorkbenchService) {
    super();
    this._configurationService = _configurationService;
    this._environmentService = _environmentService;
    this._browserViewWorkbenchService = _browserViewWorkbenchService;
    this._proxy = extHostContext.getProxy(ExtHostContext.ExtHostBrowserTunnelProxy);
    this._updateEnabled();
    this._register(this._configurationService.onDidChangeConfiguration((e4) => {
      if (e4.affectsConfiguration(browserRemoteProxyEnabledSettingId)) {
        this._updateEnabled();
      }
    }));
  }
  _isEnabled() {
    return !!this._environmentService.remoteAuthority && this._configurationService.getValue(browserRemoteProxyEnabledSettingId) === true;
  }
  _updateEnabled() {
    this._proxy.$setEnabled(this._isEnabled());
  }
  $updateProxyInfo(info) {
    this._browserViewWorkbenchService.setRemoteProxyInfo(info);
  }
};

MainThreadBrowserTunnelProxy = __decorateClass([
  extHostNamedCustomer(MainContext.MainThreadBrowserTunnelProxy),
  __decorateParam(1, IConfigurationService),
  __decorateParam(2, IWorkbenchEnvironmentService),
  __decorateParam(3, IBrowserViewWorkbenchService)
], MainThreadBrowserTunnelProxy);
export { browserRemoteProxyEnabledSettingId, MainThreadBrowserTunnelProxy };
