// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/pluginAutoUpdate.ts
import { Disposable } from "./module-0012.mjs";
import { autorun } from "./module-0052.mjs";
import { CancellationToken } from "./module-0025.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IPluginMarketplaceService } from "./module-1029.mjs";
import { IPluginInstallService } from "./module-2544.mjs";
import { ILogService } from "./module-0095.mjs";
import { IMeteredConnectionService } from "./module-1022.mjs";


// src/vs/workbench/contrib/chat/browser/pluginAutoUpdate.ts
var PluginAutoUpdate = class extends Disposable {
  constructor(_pluginMarketplaceService, _pluginInstallService, _logService, _meteredConnectionService) {
    super();
    this._pluginMarketplaceService = _pluginMarketplaceService;
    this._pluginInstallService = _pluginInstallService;
    this._logService = _logService;
    this._meteredConnectionService = _meteredConnectionService;
    this._updateInFlight = false;
    this._register(autorun((reader) => {
      const marketplaceIds = this._pluginMarketplaceService.marketplacesWithUpdates.read(reader);
      if (marketplaceIds.size === 0) {
        return;
      }
      void this._triggerAutoUpdate(marketplaceIds);
    }));
    this._register(this._meteredConnectionService.onDidChangeIsConnectionMetered((isMetered) => {
      if (!isMetered) {
        this._triggerQueuedAutoUpdate();
      }
    }));
  }
  static {
    this.ID = "workbench.contrib.pluginAutoUpdate";
  }
  _triggerQueuedAutoUpdate() {
    const marketplaceIds = this._pluginMarketplaceService.marketplacesWithUpdates.get();
    if (marketplaceIds.size > 0) {
      void this._triggerAutoUpdate(marketplaceIds);
    }
  }
  async _triggerAutoUpdate(marketplaceIds) {
    if (this._store.isDisposed || this._updateInFlight || this._meteredConnectionService.isConnectionMetered) {
      return;
    }
    this._updateInFlight = true;
    try {
      await this._pluginInstallService.updateAllPlugins({ silent: true, automatic: true, marketplaceIds }, CancellationToken.None);
    } catch (err) {
      this._logService.error("[PluginAutoUpdate] Failed to auto-update plugins:", err);
    } finally {
      this._pluginMarketplaceService.clearUpdatesAvailable(marketplaceIds);
      this._updateInFlight = false;
      if (!this._store.isDisposed && !this._meteredConnectionService.isConnectionMetered) {
        this._triggerQueuedAutoUpdate();
      }
    }
  }
};

PluginAutoUpdate = __decorateClass([
  __decorateParam(0, IPluginMarketplaceService),
  __decorateParam(1, IPluginInstallService),
  __decorateParam(2, ILogService),
  __decorateParam(3, IMeteredConnectionService)
], PluginAutoUpdate);
export { PluginAutoUpdate };
