// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/userDataSync/electron-browser/userDataSync.contribution.ts
import { Action2, MenuId, registerAction2 } from "./module-0092.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { CONTEXT_SYNC_STATE, DOWNLOAD_ACTIVITY_ACTION_DESCRIPTOR, IUserDataSyncWorkbenchService, SYNC_TITLE } from "./module-1744.mjs";
import { IEnvironmentService } from "./module-0508.mjs";
import { INativeHostService } from "./module-2591.mjs";
import { IFileService } from "./module-0269.mjs";
import { INotificationService, Severity2 } from "./module-0336.mjs";
import { Schemas } from "./module-0033.mjs";


// src/vs/workbench/contrib/userDataSync/electron-browser/userDataSync.contribution.ts
registerAction2(class OpenSyncBackupsFolder extends Action2 {
  constructor() {
    super({
      id: "workbench.userData.actions.openSyncBackupsFolder",
      title: localize2(21822, "Open Local Backups Folder"),
      category: SYNC_TITLE,
      menu: {
        id: MenuId.CommandPalette,
        when: CONTEXT_SYNC_STATE.notEqualsTo("uninitialized" /* Uninitialized */)
      }
    });
  }
  async run(accessor) {
    const syncHome = accessor.get(IEnvironmentService).userDataSyncHome;
    const nativeHostService = accessor.get(INativeHostService);
    const fileService = accessor.get(IFileService);
    const notificationService = accessor.get(INotificationService);
    if (await fileService.exists(syncHome)) {
      const folderStat = await fileService.resolve(syncHome);
      const item = folderStat.children && folderStat.children[0] ? folderStat.children[0].resource : syncHome;
      return nativeHostService.showItemInFolder(item.with({ scheme: Schemas.file }).fsPath);
    } else {
      notificationService.info(localize(21820, null));
    }
  }
});

registerAction2(class DownloadSyncActivityAction extends Action2 {
  constructor() {
    super(DOWNLOAD_ACTIVITY_ACTION_DESCRIPTOR);
  }
  async run(accessor) {
    const userDataSyncWorkbenchService = accessor.get(IUserDataSyncWorkbenchService);
    const notificationService = accessor.get(INotificationService);
    const hostService = accessor.get(INativeHostService);
    const folder = await userDataSyncWorkbenchService.downloadSyncActivity();
    if (folder) {
      notificationService.prompt(
        Severity2.Info,
        localize(21819, null),
        [{
          label: localize(21821, null),
          run: () => hostService.showItemInFolder(folder.fsPath)
        }]
      );
    }
  }
});
export {};
