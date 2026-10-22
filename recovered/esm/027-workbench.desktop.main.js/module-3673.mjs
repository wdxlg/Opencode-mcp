// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/meteredConnection/browser/meteredConnection.contribution.ts
import { WorkbenchPhase, registerWorkbenchContribution2 } from "./module-0870.mjs";
import { MeteredConnectionStatusContribution } from "./module-3671.mjs";
import { Action2, registerAction2 } from "./module-0092.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { IQuickInputService } from "./module-0536.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { METERED_CONNECTION_SETTING_KEY } from "./module-1021.mjs";


// src/vs/workbench/contrib/meteredConnection/browser/meteredConnection.contribution.ts
registerWorkbenchContribution2(MeteredConnectionStatusContribution.ID, MeteredConnectionStatusContribution, WorkbenchPhase.AfterRestored);

registerAction2(class ConfigureMeteredConnectionAction extends Action2 {
  static {
    this.ID = "workbench.action.configureMeteredConnection";
  }
  constructor() {
    super({
      id: ConfigureMeteredConnectionAction.ID,
      title: localize2(17355, "Configure Metered Connection"),
      f1: true
    });
  }
  async run(accessor) {
    const quickInputService = accessor.get(IQuickInputService);
    const configurationService = accessor.get(IConfigurationService);
    const currentValue = configurationService.getValue(METERED_CONNECTION_SETTING_KEY);
    const picks = [
      {
        value: "auto",
        label: localize(17356, null),
        description: localize(17357, null),
        picked: currentValue === "auto"
      },
      {
        value: "on",
        label: localize(17360, null),
        description: localize(17361, null),
        picked: currentValue === "on"
      },
      {
        value: "off",
        label: localize(17358, null),
        description: localize(17359, null),
        picked: currentValue === "off"
      }
    ];
    const pick = await quickInputService.pick(picks, {
      placeHolder: localize(17362, null),
      activeItem: picks.find((p) => p.picked)
    });
    if (pick) {
      await configurationService.updateValue(METERED_CONNECTION_SETTING_KEY, pick.value);
    }
  }
});
export {};
