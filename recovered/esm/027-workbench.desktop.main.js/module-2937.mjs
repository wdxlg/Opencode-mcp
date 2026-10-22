// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/extensions/browser/extensionsDependencyChecker.ts
import { Disposable } from "./module-0012.mjs";
import { CommandsRegistry } from "./module-0087.mjs";
import { MenuId, MenuRegistry } from "./module-0092.mjs";
import { localize } from "./module-0001.mjs";
import { areSameExtensions } from "./module-0886.mjs";
import { CancellationToken } from "./module-0025.mjs";
import { Promises } from "./module-0036.mjs";
import { INotificationService, Severity2 } from "./module-0336.mjs";
import { Action } from "./module-0082.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IExtensionService } from "./module-0887.mjs";
import { IExtensionsWorkbenchService } from "./module-1022.mjs";
import { IHostService } from "./module-1117.mjs";


// src/vs/workbench/contrib/extensions/browser/extensionsDependencyChecker.ts
var ExtensionDependencyChecker = class extends Disposable {
  constructor(extensionService, extensionsWorkbenchService, notificationService, hostService) {
    super();
    this.extensionService = extensionService;
    this.extensionsWorkbenchService = extensionsWorkbenchService;
    this.notificationService = notificationService;
    this.hostService = hostService;
    CommandsRegistry.registerCommand("workbench.extensions.installMissingDependencies", () => this.installMissingDependencies());
    MenuRegistry.appendMenuItem(MenuId.CommandPalette, {
      command: {
        id: "workbench.extensions.installMissingDependencies",
        category: localize(15392, null),
        title: localize(15391, null)
      }
    });
  }
  async getUninstalledMissingDependencies() {
    const allMissingDependencies = await this.getAllMissingDependencies();
    const localExtensions = await this.extensionsWorkbenchService.queryLocal();
    return allMissingDependencies.filter((id2) => localExtensions.every((l) => !areSameExtensions(l.identifier, { id: id2 })));
  }
  async getAllMissingDependencies() {
    await this.extensionService.whenInstalledExtensionsRegistered();
    const runningExtensionsIds = this.extensionService.extensions.reduce((result, r2) => {
      result.add(r2.identifier.value.toLowerCase());
      return result;
    }, /* @__PURE__ */ new Set());
    const missingDependencies = /* @__PURE__ */ new Set();
    for (const extension of this.extensionService.extensions) {
      if (extension.extensionDependencies) {
        extension.extensionDependencies.forEach((dep) => {
          if (!runningExtensionsIds.has(dep.toLowerCase())) {
            missingDependencies.add(dep);
          }
        });
      }
    }
    return [...missingDependencies.values()];
  }
  async installMissingDependencies() {
    const missingDependencies = await this.getUninstalledMissingDependencies();
    if (missingDependencies.length) {
      const extensions = await this.extensionsWorkbenchService.getExtensions(missingDependencies.map((id2) => ({ id: id2 })), CancellationToken.None);
      if (extensions.length) {
        await Promises.settled(extensions.map((extension) => this.extensionsWorkbenchService.install(extension)));
        this.notificationService.notify({
          severity: Severity2.Info,
          message: localize(15393, null),
          actions: {
            primary: [new Action(
              "realod",
              localize(15395, null),
              "",
              true,
              () => this.hostService.reload()
            )]
          }
        });
      }
    } else {
      this.notificationService.info(localize(15394, null));
    }
  }
};

ExtensionDependencyChecker = __decorateClass([
  __decorateParam(0, IExtensionService),
  __decorateParam(1, IExtensionsWorkbenchService),
  __decorateParam(2, INotificationService),
  __decorateParam(3, IHostService)
], ExtensionDependencyChecker);
export { ExtensionDependencyChecker };
