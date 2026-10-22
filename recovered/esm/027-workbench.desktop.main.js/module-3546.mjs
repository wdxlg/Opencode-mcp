// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/update/browser/update.contribution.ts
import { Registry } from "./module-0090.mjs";
import { Extensions10 } from "./module-0870.mjs";
import { CONTEXT_UPDATE_STATE, DefaultAccountUpdateContribution, ProductContribution, SwitchProductQualityContribution, UpdateContribution, showReleaseNotesInEditor } from "./module-3541.mjs";
import { UpdateTitleBarContribution } from "./module-3543.mjs";
import { PostUpdateWidgetContribution } from "./module-3545.mjs";
import { Action2, MenuId, registerAction2 } from "./module-0092.mjs";
import { product_default } from "./module-0139.mjs";
import { ShowCurrentReleaseNotesActionId, ShowCurrentReleaseNotesFromCurrentFileActionId } from "./module-2777.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IProductService } from "./module-0873.mjs";
import { IOpenerService } from "./module-0272.mjs";
import { URI } from "./module-0032.mjs";
import { IUpdateService } from "./module-1181.mjs";
import { IsWebContext } from "./module-0635.mjs";
import { isWindows } from "./module-0014.mjs";
import { Categories } from "./module-0847.mjs";
import { IFileDialogService } from "./module-0267.mjs";
import { mnemonicButtonLabel } from "./module-0711.mjs";
import { ICommandService } from "./module-0087.mjs";
import { IQuickInputService } from "./module-0536.mjs";


// src/vs/workbench/contrib/update/browser/update.contribution.ts
var workbench = Registry.as(Extensions10.Workbench);

workbench.registerWorkbenchContribution(ProductContribution, 3 /* Restored */);

workbench.registerWorkbenchContribution(UpdateContribution, 3 /* Restored */);

workbench.registerWorkbenchContribution(SwitchProductQualityContribution, 3 /* Restored */);

workbench.registerWorkbenchContribution(DefaultAccountUpdateContribution, 4 /* Eventually */);

workbench.registerWorkbenchContribution(UpdateTitleBarContribution, 3 /* Restored */);

workbench.registerWorkbenchContribution(PostUpdateWidgetContribution, 3 /* Restored */);

var ShowReleaseNotesAction = class extends Action2 {
  static {
    this.AVAILABLE = !!product_default.releaseNotesUrl;
  }
  constructor() {
    super({
      id: ShowCurrentReleaseNotesActionId,
      title: {
        ...localize2(21505, "Show Release Notes"),
        mnemonicTitle: localize(21500, null)
      },
      category: { value: product_default.nameShort, original: product_default.nameShort },
      f1: true,
      menu: [{
        id: MenuId.MenubarHelpMenu,
        group: "1_welcome",
        order: 5
      }]
    });
  }
  async run(accessor, version2) {
    const instantiationService = accessor.get(IInstantiationService);
    const productService = accessor.get(IProductService);
    const openerService = accessor.get(IOpenerService);
    const targetVersion = version2 ?? productService.version;
    try {
      await showReleaseNotesInEditor(instantiationService, targetVersion, false);
    } catch (err) {
      if (productService.releaseNotesUrl) {
        await openerService.open(URI.parse(productService.releaseNotesUrl));
      } else {
        throw new Error(localize(21509, null, productService.nameLong));
      }
    }
  }
};

var ShowCurrentReleaseNotesFromCurrentFileAction = class extends Action2 {
  constructor() {
    super({
      id: ShowCurrentReleaseNotesFromCurrentFileActionId,
      title: {
        ...localize2(21506, "Open Current File as Release Notes"),
        mnemonicTitle: localize(21500, null)
      },
      category: localize2(21497, "Developer"),
      f1: true
    });
  }
  async run(accessor) {
    const instantiationService = accessor.get(IInstantiationService);
    const productService = accessor.get(IProductService);
    try {
      await showReleaseNotesInEditor(instantiationService, productService.version, true);
    } catch (err) {
      throw new Error(localize(21503, null));
    }
  }
};

if (ShowReleaseNotesAction.AVAILABLE) {
  registerAction2(ShowReleaseNotesAction);
}

registerAction2(ShowCurrentReleaseNotesFromCurrentFileAction);

var CheckForUpdateAction = class extends Action2 {
  constructor() {
    super({
      id: "update.checkForUpdate",
      title: localize2(21496, "Check for Updates..."),
      category: { value: product_default.nameShort, original: product_default.nameShort },
      f1: true,
      precondition: CONTEXT_UPDATE_STATE.isEqualTo("idle" /* Idle */)
    });
  }
  async run(accessor) {
    const updateService = accessor.get(IUpdateService);
    return updateService.checkForUpdates(true);
  }
};

var DownloadUpdateAction = class extends Action2 {
  constructor() {
    super({
      id: "update.downloadUpdate",
      title: localize2(21498, "Download Update"),
      category: { value: product_default.nameShort, original: product_default.nameShort },
      f1: true,
      precondition: CONTEXT_UPDATE_STATE.isEqualTo("available for download" /* AvailableForDownload */)
    });
  }
  async run(accessor) {
    await accessor.get(IUpdateService).downloadUpdate(true);
  }
};

var InstallUpdateAction = class extends Action2 {
  constructor() {
    super({
      id: "update.installUpdate",
      title: localize2(21499, "Install Update"),
      category: { value: product_default.nameShort, original: product_default.nameShort },
      f1: true,
      precondition: CONTEXT_UPDATE_STATE.isEqualTo("downloaded" /* Downloaded */)
    });
  }
  async run(accessor) {
    await accessor.get(IUpdateService).applyUpdate();
  }
};

var RestartToUpdateAction = class extends Action2 {
  constructor() {
    super({
      id: "update.restartToUpdate",
      title: localize2(21504, "Restart to Update"),
      category: { value: product_default.nameShort, original: product_default.nameShort },
      f1: true,
      precondition: CONTEXT_UPDATE_STATE.isEqualTo("ready" /* Ready */)
    });
  }
  async run(accessor) {
    await accessor.get(IUpdateService).quitAndInstall();
  }
};

var DownloadAction = class _DownloadAction extends Action2 {
  static {
    this.ID = "workbench.action.download";
  }
  static {
    this.AVAILABLE = !!product_default.downloadUrl;
  }
  constructor() {
    super({
      id: _DownloadAction.ID,
      title: localize2(21501, "Download {0}", product_default.nameLong),
      precondition: IsWebContext,
      // Only show when running in a web browser
      f1: true,
      menu: [{
        id: MenuId.StatusBarWindowIndicatorMenu,
        when: IsWebContext
      }]
    });
  }
  run(accessor) {
    const productService = accessor.get(IProductService);
    const openerService = accessor.get(IOpenerService);
    if (productService.downloadUrl) {
      openerService.open(URI.parse(productService.downloadUrl));
    }
  }
};

if (DownloadAction.AVAILABLE) {
  registerAction2(DownloadAction);
}

registerAction2(CheckForUpdateAction);

registerAction2(DownloadUpdateAction);

registerAction2(InstallUpdateAction);

registerAction2(RestartToUpdateAction);

if (isWindows) {
  class DeveloperApplyUpdateAction extends Action2 {
    constructor() {
      super({
        id: "_update.applyupdate",
        title: localize2(21495, "Apply Update from File..."),
        category: Categories.Developer,
        f1: true,
        precondition: CONTEXT_UPDATE_STATE.isEqualTo("idle" /* Idle */)
      });
    }
    async run(accessor) {
      const updateService = accessor.get(IUpdateService);
      const fileDialogService = accessor.get(IFileDialogService);
      const updatePath = await fileDialogService.showOpenDialog({
        title: localize(21502, null),
        filters: [{ name: "Setup", extensions: ["exe"] }],
        canSelectFiles: true,
        openLabel: mnemonicButtonLabel(localize(21510, null))
      });
      if (!updatePath || !updatePath[0]) {
        return;
      }
      await updateService._applySpecificUpdate(updatePath[0].fsPath);
    }
  }
  registerAction2(DeveloperApplyUpdateAction);
}

registerAction2(class ShowUpdateInfoAction extends Action2 {
  constructor() {
    super({
      id: "update.showUpdateInfo",
      title: localize2(21507, "Show Update Info"),
      category: Categories.Developer,
      f1: true,
      precondition: IsWebContext.negate()
    });
  }
  async run(accessor) {
    const commandService = accessor.get(ICommandService);
    const quickInputService = accessor.get(IQuickInputService);
    const markdown = await quickInputService.input({ prompt: localize(21508, null) });
    if (markdown === void 0) {
      return;
    }
    await commandService.executeCommand("_update.showUpdateInfo", markdown || void 0);
  }
});
export { workbench, ShowReleaseNotesAction, ShowCurrentReleaseNotesFromCurrentFileAction, CheckForUpdateAction, DownloadUpdateAction, InstallUpdateAction, RestartToUpdateAction, DownloadAction };
