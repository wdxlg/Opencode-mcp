// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/url/browser/url.contribution.ts
import { Action2, MenuId, MenuRegistry, registerAction2 } from "./module-0092.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { Categories } from "./module-0847.mjs";
import { IQuickInputService } from "./module-0536.mjs";
import { IURLService } from "./module-1286.mjs";
import { IStorageService } from "./module-0512.mjs";
import { URI } from "./module-0032.mjs";
import { CommandsRegistry } from "./module-0087.mjs";
import { manageTrustedDomainSettingsCommand } from "./module-1288.mjs";
import { Registry } from "./module-0090.mjs";
import { Extensions10, WorkbenchPhase, registerWorkbenchContribution2 } from "./module-0870.mjs";
import { OpenerValidatorContributions } from "./module-3239.mjs";
import { TrustedDomainsFileSystemProvider } from "./module-3238.mjs";
import { ExternalUriResolverContribution } from "./module-3237.mjs";
import { Extensions4 } from "./module-0140.mjs";
import { workbenchConfigurationNodeBase } from "./module-1112.mjs";
import { registerSingleton } from "./module-0135.mjs";
import { ITrustedDomainService } from "./module-1289.mjs";
import { TrustedDomainService } from "./module-1290.mjs";


// src/vs/workbench/contrib/url/browser/url.contribution.ts
var OpenUrlAction = class _OpenUrlAction extends Action2 {
  static {
    this.STORAGE_KEY = "workbench.action.url.openUrl.lastInput";
  }
  constructor() {
    super({
      id: "workbench.action.url.openUrl",
      title: localize2(21584, "Open URL"),
      category: Categories.Developer,
      f1: true
    });
  }
  async run(accessor) {
    const quickInputService = accessor.get(IQuickInputService);
    const urlService = accessor.get(IURLService);
    const storageService = accessor.get(IStorageService);
    const value2 = storageService.get(_OpenUrlAction.STORAGE_KEY, 1 /* WORKSPACE */, "");
    return quickInputService.input({ prompt: localize(21585, null), value: value2 }).then((input) => {
      if (input) {
        const uri5 = URI.parse(input);
        urlService.open(uri5, { originalUrl: input });
        storageService.store(_OpenUrlAction.STORAGE_KEY, input, 1 /* WORKSPACE */, 1 /* MACHINE */);
      }
    });
  }
};

registerAction2(OpenUrlAction);

CommandsRegistry.registerCommand(manageTrustedDomainSettingsCommand);

MenuRegistry.appendMenuItem(MenuId.CommandPalette, {
  command: {
    id: manageTrustedDomainSettingsCommand.id,
    title: manageTrustedDomainSettingsCommand.description.description
  }
});

Registry.as(Extensions10.Workbench).registerWorkbenchContribution(
  OpenerValidatorContributions,
  3 /* Restored */
);

registerWorkbenchContribution2(
  TrustedDomainsFileSystemProvider.ID,
  TrustedDomainsFileSystemProvider,
  WorkbenchPhase.BlockRestore
  // registration only
);

registerWorkbenchContribution2(
  ExternalUriResolverContribution.ID,
  ExternalUriResolverContribution,
  WorkbenchPhase.BlockRestore
  // registration only
);

var configurationRegistry18 = Registry.as(Extensions4.Configuration);

configurationRegistry18.registerConfiguration({
  ...workbenchConfigurationNodeBase,
  properties: {
    "workbench.trustedDomains.promptInTrustedWorkspace": {
      scope: 1 /* APPLICATION */,
      type: "boolean",
      default: false,
      description: localize(21586, null)
    }
  }
});

registerSingleton(ITrustedDomainService, TrustedDomainService, 1 /* Delayed */);
export { OpenUrlAction, configurationRegistry18 };
