// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/electron-browser/actions/installActions.ts
import { localize, localize2 } from "./module-0001.mjs";
import { Action2 } from "./module-0092.mjs";
import { product_default } from "./module-0139.mjs";
import { INativeHostService } from "./module-2566.mjs";
import { IDialogService } from "./module-0267.mjs";
import { IProductService } from "./module-0875.mjs";
import { isCancellationError } from "./module-0004.mjs";
import { toErrorMessage } from "./module-0094.mjs";


// src/vs/workbench/electron-browser/actions/installActions.ts
var shellCommandCategory = localize2(22422, "Shell Command");

var InstallShellScriptAction = class extends Action2 {
  constructor() {
    super({
      id: "workbench.action.installCommandLine",
      title: localize2(22421, "Install '{0}' command in PATH", product_default.applicationName),
      category: shellCommandCategory,
      f1: true
    });
  }
  async run(accessor) {
    const nativeHostService = accessor.get(INativeHostService);
    const dialogService = accessor.get(IDialogService);
    const productService = accessor.get(IProductService);
    try {
      await nativeHostService.installShellCommand();
      dialogService.info(localize(22424, null, productService.applicationName));
    } catch (error) {
      if (isCancellationError(error)) {
        return;
      }
      dialogService.error(toErrorMessage(error));
    }
  }
};

var UninstallShellScriptAction = class extends Action2 {
  constructor() {
    super({
      id: "workbench.action.uninstallCommandLine",
      title: localize2(22425, "Uninstall '{0}' command from PATH", product_default.applicationName),
      category: shellCommandCategory,
      f1: true
    });
  }
  async run(accessor) {
    const nativeHostService = accessor.get(INativeHostService);
    const dialogService = accessor.get(IDialogService);
    const productService = accessor.get(IProductService);
    try {
      await nativeHostService.uninstallShellCommand();
      dialogService.info(localize(22423, null, productService.applicationName));
    } catch (error) {
      if (isCancellationError(error)) {
        return;
      }
      dialogService.error(toErrorMessage(error));
    }
  }
};
export { shellCommandCategory, InstallShellScriptAction, UninstallShellScriptAction };
