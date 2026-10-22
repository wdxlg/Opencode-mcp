// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/terminalContrib/wslRecommendation/browser/terminal.wslRecommendation.contribution.ts
import { Disposable } from "./module-0012.mjs";
import { isWindows } from "./module-0014.mjs";
import { basename } from "./module-0026.mjs";
import { INotificationService, Severity2 } from "./module-0336.mjs";
import { localize } from "./module-0001.mjs";
import { InstallRecommendedExtensionAction } from "./module-1854.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IExtensionManagementService } from "./module-0874.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IProductService } from "./module-0875.mjs";
import { ITerminalService } from "./module-1150.mjs";
import { WorkbenchPhase, registerWorkbenchContribution2 } from "./module-0872.mjs";


// src/vs/workbench/contrib/terminalContrib/wslRecommendation/browser/terminal.wslRecommendation.contribution.ts
var TerminalWslRecommendationContribution = class extends Disposable {
  static {
    this.ID = "terminalWslRecommendation";
  }
  constructor(extensionManagementService, instantiationService, notificationService, productService, terminalService) {
    super();
    if (!isWindows) {
      return;
    }
    const exeBasedExtensionTips = productService.exeBasedExtensionTips;
    if (!exeBasedExtensionTips || !exeBasedExtensionTips.wsl) {
      return;
    }
    let listener = terminalService.onDidCreateInstance(async (instance2) => {
      async function isExtensionInstalled(id2) {
        const extensions = await extensionManagementService.getInstalled();
        return extensions.some((e4) => e4.identifier.id === id2);
      }
      if (!instance2.shellLaunchConfig.executable || basename(instance2.shellLaunchConfig.executable).toLowerCase() !== "wsl.exe") {
        return;
      }
      listener?.dispose();
      listener = void 0;
      const extId = Object.keys(exeBasedExtensionTips.wsl.recommendations).find((extId2) => exeBasedExtensionTips.wsl.recommendations[extId2].important);
      if (!extId || await isExtensionInstalled(extId)) {
        return;
      }
      notificationService.prompt(
        Severity2.Info,
        localize(20984, null, exeBasedExtensionTips.wsl.friendlyName),
        [
          {
            label: localize(20983, null),
            run: () => {
              instantiationService.createInstance(InstallRecommendedExtensionAction, extId).run();
            }
          }
        ],
        {
          priority: 1 /* OPTIONAL */,
          neverShowAgain: { id: "terminalConfigHelper/launchRecommendationsIgnore", scope: 2 /* APPLICATION */ },
          onCancel: () => {
          }
        }
      );
    });
  }
};

TerminalWslRecommendationContribution = __decorateClass([
  __decorateParam(0, IExtensionManagementService),
  __decorateParam(1, IInstantiationService),
  __decorateParam(2, INotificationService),
  __decorateParam(3, IProductService),
  __decorateParam(4, ITerminalService)
], TerminalWslRecommendationContribution);

registerWorkbenchContribution2(TerminalWslRecommendationContribution.ID, TerminalWslRecommendationContribution, WorkbenchPhase.Eventually);
export { TerminalWslRecommendationContribution };
