// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/debug/browser/debugQuickAccess.ts
import { PickerQuickAccessProvider } from "./module-1528.mjs";
import { ADD_CONFIGURATION_ID, DEBUG_QUICK_ACCESS_PREFIX } from "./module-2406.mjs";
import { localize } from "./module-0001.mjs";
import { matchesFuzzy } from "./module-0453.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { debugConfigure, debugRemoveConfig } from "./module-1891.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IDebugService } from "./module-1057.mjs";
import { IWorkspaceContextService } from "./module-0509.mjs";
import { ICommandService } from "./module-0087.mjs";
import { INotificationService } from "./module-0336.mjs";


// src/vs/workbench/contrib/debug/browser/debugQuickAccess.ts
var StartDebugQuickAccessProvider = class extends PickerQuickAccessProvider {
  constructor(debugService, contextService, commandService, notificationService) {
    super(DEBUG_QUICK_ACCESS_PREFIX, {
      noResultsPick: {
        label: localize(14533, null)
      }
    });
    this.debugService = debugService;
    this.contextService = contextService;
    this.commandService = commandService;
    this.notificationService = notificationService;
  }
  async _getPicks(filter2) {
    const picks = [];
    if (!this.debugService.getAdapterManager().hasEnabledDebuggers()) {
      return [];
    }
    picks.push({ type: "separator", label: "launch.json" });
    const configManager = this.debugService.getConfigurationManager();
    const selectedConfiguration = configManager.selectedConfiguration;
    let lastGroup;
    for (const config of configManager.getAllConfigurations()) {
      const highlights = matchesFuzzy(filter2, config.name, true);
      if (highlights) {
        const pick = {
          label: config.name,
          description: this.contextService.getWorkbenchState() === 3 /* WORKSPACE */ ? config.launch.name : "",
          highlights: { label: highlights },
          buttons: [{
            iconClass: ThemeIcon.asClassName(debugConfigure),
            tooltip: localize(14531, null)
          }],
          trigger: () => {
            config.launch.openConfigFile({ preserveFocus: false });
            return 1 /* CLOSE_PICKER */;
          },
          accept: async () => {
            await configManager.selectConfiguration(config.launch, config.name);
            try {
              await this.debugService.startDebugging(config.launch, void 0, { startedByUser: true });
            } catch (error) {
              this.notificationService.error(error);
            }
          }
        };
        if (selectedConfiguration.name === config.name && selectedConfiguration.launch === config.launch) {
          const separator2 = { type: "separator", label: localize(14532, null) };
          picks.unshift(separator2, pick);
          continue;
        }
        if (lastGroup !== config.presentation?.group) {
          picks.push({ type: "separator" });
          lastGroup = config.presentation?.group;
        }
        picks.push(pick);
      }
    }
    const dynamicProviders = await configManager.getDynamicProviders();
    if (dynamicProviders.length > 0) {
      picks.push({
        type: "separator",
        label: localize(14530, null)
      });
    }
    configManager.getRecentDynamicConfigurations().forEach(({ name, type }) => {
      const highlights = matchesFuzzy(filter2, name, true);
      if (highlights) {
        picks.push({
          label: name,
          highlights: { label: highlights },
          buttons: [{
            iconClass: ThemeIcon.asClassName(debugRemoveConfig),
            tooltip: localize(14535, null)
          }],
          trigger: () => {
            configManager.removeRecentDynamicConfigurations(name, type);
            return 1 /* CLOSE_PICKER */;
          },
          accept: async () => {
            await configManager.selectConfiguration(void 0, name, void 0, { type });
            try {
              const { launch, getConfig } = configManager.selectedConfiguration;
              const config = await getConfig();
              await this.debugService.startDebugging(launch, config, { startedByUser: true });
            } catch (error) {
              this.notificationService.error(error);
            }
          }
        });
      }
    });
    dynamicProviders.forEach((provider) => {
      picks.push({
        label: `$(folder) ${provider.label}...`,
        ariaLabel: localize(14534, null, provider.label),
        accept: async () => {
          const pick = await provider.pick();
          if (pick) {
            await configManager.selectConfiguration(pick.launch, pick.config.name, pick.config, { type: provider.type });
            this.debugService.startDebugging(pick.launch, pick.config, { startedByUser: true });
          }
        }
      });
    });
    const visibleLaunches = configManager.getLaunches().filter((launch) => !launch.hidden);
    if (visibleLaunches.length > 0) {
      picks.push({ type: "separator", label: localize(14529, null) });
    }
    for (const launch of visibleLaunches) {
      const label3 = this.contextService.getWorkbenchState() === 3 /* WORKSPACE */ ? localize(14527, null, launch.name) : localize(14528, null);
      picks.push({
        label: label3,
        description: this.contextService.getWorkbenchState() === 3 /* WORKSPACE */ ? launch.name : "",
        highlights: { label: matchesFuzzy(filter2, label3, true) ?? void 0 },
        accept: () => this.commandService.executeCommand(ADD_CONFIGURATION_ID, launch.uri.toString())
      });
    }
    return picks;
  }
};

StartDebugQuickAccessProvider = __decorateClass([
  __decorateParam(0, IDebugService),
  __decorateParam(1, IWorkspaceContextService),
  __decorateParam(2, ICommandService),
  __decorateParam(3, INotificationService)
], StartDebugQuickAccessProvider);
export { StartDebugQuickAccessProvider };
