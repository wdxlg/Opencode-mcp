// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/claudePluginRecommendations.ts
import { Disposable } from "./module-0012.mjs";
import { CancellationToken } from "./module-0025.mjs";
import { INotificationService, Severity2 } from "./module-0336.mjs";
import { localize } from "./module-0001.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IChatService } from "./module-0973.mjs";
import { IPluginMarketplaceService } from "./module-1029.mjs";
import { IExtensionsWorkbenchService } from "./module-1023.mjs";


// src/vs/workbench/contrib/chat/browser/claudePluginRecommendations.ts
var AgentPluginRecommendations = class extends Disposable {
  constructor(_chatService, _pluginMarketplaceService, _notificationService, _extensionsWorkbenchService) {
    super();
    this._chatService = _chatService;
    this._pluginMarketplaceService = _pluginMarketplaceService;
    this._notificationService = _notificationService;
    this._extensionsWorkbenchService = _extensionsWorkbenchService;
    this._hasNotified = false;
    this._register(this._chatService.onDidSubmitRequest(() => {
      if (!this._hasNotified) {
        this._hasNotified = true;
        this._checkForRecommendedPlugins();
      }
    }));
  }
  static {
    this.ID = "workbench.contrib.agentPluginRecommendations";
  }
  async _checkForRecommendedPlugins() {
    const recommended = this._pluginMarketplaceService.recommendedPlugins.get();
    if (recommended.size === 0) {
      return;
    }
    const installedKeys = /* @__PURE__ */ new Set();
    for (const entry of this._pluginMarketplaceService.installedPlugins.get()) {
      const key3 = `${entry.plugin.name}@${entry.plugin.marketplace}`;
      installedKeys.add(key3);
    }
    let fetched = this._pluginMarketplaceService.lastFetchedPlugins.get();
    if (fetched.length === 0) {
      try {
        fetched = await this._pluginMarketplaceService.fetchMarketplacePlugins(CancellationToken.None);
      } catch {
        return;
      }
    }
    const knownKeys = /* @__PURE__ */ new Set();
    for (const plugin of fetched) {
      knownKeys.add(`${plugin.name}@${plugin.marketplace}`);
    }
    let uninstalledCount = 0;
    for (const key3 of recommended) {
      if (!installedKeys.has(key3) && knownKeys.has(key3)) {
        uninstalledCount++;
      }
    }
    if (uninstalledCount === 0) {
      return;
    }
    this._notificationService.prompt(
      Severity2.Info,
      uninstalledCount === 1 ? localize(11317, null) : localize(11316, null, uninstalledCount),
      [{
        label: localize(11318, null),
        run: () => {
          this._extensionsWorkbenchService.openSearch("@agentPlugins @recommended");
        }
      }],
      {
        neverShowAgain: {
          id: "agentPluginRecommendations.dismissed",
          scope: 0 /* WORKSPACE */,
          isSecondary: true
        }
      }
    );
  }
};

AgentPluginRecommendations = __decorateClass([
  __decorateParam(0, IChatService),
  __decorateParam(1, IPluginMarketplaceService),
  __decorateParam(2, INotificationService),
  __decorateParam(3, IExtensionsWorkbenchService)
], AgentPluginRecommendations);
export { AgentPluginRecommendations };
