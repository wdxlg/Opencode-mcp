// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/main.js
// Original module marker: src/vs/platform/workspaces/electron-main/workspacesHistoryMainService.ts
import { __decorateClass, __decorateParam, __esm } from "./module-0000.mjs";
import { coalesce, init_arrays } from "./module-0013.mjs";
import { ThrottledDelayer, init_async } from "./module-0034.mjs";
import { Emitter, init_event } from "./module-0021.mjs";
import { init_labels, normalizeDriveLetter, splitRecentLabel } from "./module-0048.mjs";
import { Disposable, init_lifecycle } from "./module-0018.mjs";
import { Schemas, init_network } from "./module-0031.mjs";
import { init_platform, isMacintosh, isWindows2 } from "./module-0006.mjs";
import { basename2, dirname4, extUriBiasedIgnorePathCase, init_resources, isEqual2, originalFSPath } from "./module-0032.mjs";
import { URI, init_uri } from "./module-0030.mjs";
import { Promises2, init_pfs } from "./module-0036.mjs";
import { init_nls, localize } from "./module-0005.mjs";
import { createDecorator, init_instantiation } from "./module-0039.mjs";
import { ILifecycleMainService, init_lifecycleMainService } from "./module-0102.mjs";
import { ILogService, init_log } from "./module-0075.mjs";
import { init_storage2 } from "./module-0079.mjs";
import { IApplicationStorageMainService, init_storageMainService } from "./module-0109.mjs";
import { init_workspaces2, isRecentFile, isRecentFolder, isRecentWorkspace, restoreRecentlyOpened, toStoreData } from "./module-0128.mjs";
import { WORKSPACE_EXTENSION, init_workspace } from "./module-0076.mjs";
import { getWorkspaceIdentifier2, init_workspaceIdentifier } from "./module-0202.mjs";
import { IWorkspacesManagementMainService, init_workspacesManagementMainService } from "./module-0129.mjs";
import { ResourceMap, init_map } from "./module-0014.mjs";
import { IDialogMainService, init_dialogMainService } from "./module-0123.mjs";
import { IEnvironmentMainService, init_environmentMainService } from "./module-0094.mjs";


// src/vs/platform/workspaces/electron-main/workspacesHistoryMainService.ts
import { app as app7 } from "electron";

var IWorkspacesHistoryMainService, WorkspacesHistoryMainService;

var init_workspacesHistoryMainService = __esm({
  "src/vs/platform/workspaces/electron-main/workspacesHistoryMainService.ts"() {
    init_arrays();
    init_async();
    init_event();
    init_labels();
    init_lifecycle();
    init_network();
    init_platform();
    init_resources();
    init_uri();
    init_pfs();
    init_nls();
    init_instantiation();
    init_lifecycleMainService();
    init_log();
    init_storage2();
    init_storageMainService();
    init_workspaces2();
    init_workspace();
    init_workspaceIdentifier();
    init_workspacesManagementMainService();
    init_map();
    init_dialogMainService();
    init_environmentMainService();
    IWorkspacesHistoryMainService = createDecorator("workspacesHistoryMainService");
    WorkspacesHistoryMainService = class extends Disposable {
      constructor(logService, workspacesManagementMainService, lifecycleMainService, applicationStorageMainService, dialogMainService, environmentMainService) {
        super();
        this.logService = logService;
        this.workspacesManagementMainService = workspacesManagementMainService;
        this.lifecycleMainService = lifecycleMainService;
        this.applicationStorageMainService = applicationStorageMainService;
        this.dialogMainService = dialogMainService;
        this.environmentMainService = environmentMainService;
        this._onDidChangeRecentlyOpened = this._register(new Emitter());
        this.onDidChangeRecentlyOpened = this._onDidChangeRecentlyOpened.event;
        this.macOSRecentDocumentsUpdater = this._register(new ThrottledDelayer(800));
        this.registerListeners();
      }
      static {
        this.MAX_TOTAL_RECENT_ENTRIES = 500;
      }
      static {
        this.RECENTLY_OPENED_STORAGE_KEY = "history.recentlyOpenedPathsList";
      }
      registerListeners() {
        this.lifecycleMainService.when(4 /* Eventually */).then(() => this.handleWindowsJumpList());
        this._register(this.workspacesManagementMainService.onDidEnterWorkspace((event) => this.addRecentlyOpened([{ workspace: event.workspace, remoteAuthority: event.window.remoteAuthority }])));
      }
      //#region Workspaces History
      async addRecentlyOpened(recentToAdd) {
        let workspaces = [];
        let files = [];
        for (const recent of recentToAdd) {
          if (isRecentWorkspace(recent)) {
            if (!this.workspacesManagementMainService.isUntitledWorkspace(recent.workspace) && !this.containsWorkspace(workspaces, recent.workspace)) {
              workspaces.push(recent);
            }
          } else if (isRecentFolder(recent)) {
            if (!this.containsFolder(workspaces, recent.folderUri)) {
              workspaces.push(recent);
            }
          } else {
            const alreadyExistsInHistory = this.containsFile(files, recent.fileUri);
            const shouldBeFiltered = recent.fileUri.scheme === Schemas.file && WorkspacesHistoryMainService.COMMON_FILES_FILTER.indexOf(basename2(recent.fileUri)) >= 0;
            if (!alreadyExistsInHistory && !shouldBeFiltered) {
              files.push(recent);
              if (isWindows2 && recent.fileUri.scheme === Schemas.file && !this.environmentMainService.isPortable) {
                app7.addRecentDocument(recent.fileUri.fsPath);
              }
            }
          }
        }
        const mergedEntries = await this.mergeEntriesFromStorage({ workspaces, files });
        workspaces = this.canonicalizeAgentSessionsWorkspaces(mergedEntries.workspaces);
        files = mergedEntries.files;
        if (workspaces.length > WorkspacesHistoryMainService.MAX_TOTAL_RECENT_ENTRIES) {
          workspaces.length = WorkspacesHistoryMainService.MAX_TOTAL_RECENT_ENTRIES;
        }
        if (files.length > WorkspacesHistoryMainService.MAX_TOTAL_RECENT_ENTRIES) {
          files.length = WorkspacesHistoryMainService.MAX_TOTAL_RECENT_ENTRIES;
        }
        await this.saveRecentlyOpened({ workspaces, files });
        this._onDidChangeRecentlyOpened.fire();
        if (isMacintosh && !this.environmentMainService.isPortable) {
          this.macOSRecentDocumentsUpdater.trigger(() => this.updateMacOSRecentDocuments());
        }
      }
      async removeRecentlyOpened(recentToRemove) {
        const keep = (recent) => {
          const uri = this.location(recent);
          for (const resourceToRemove of recentToRemove) {
            if (extUriBiasedIgnorePathCase.isEqual(resourceToRemove, uri)) {
              return false;
            }
          }
          return true;
        };
        const mru = await this.getRecentlyOpened();
        const workspaces = mru.workspaces.filter(keep);
        const files = mru.files.filter(keep);
        if (workspaces.length !== mru.workspaces.length || files.length !== mru.files.length) {
          await this.saveRecentlyOpened({ files, workspaces });
          this._onDidChangeRecentlyOpened.fire();
          if (isMacintosh && !this.environmentMainService.isPortable) {
            this.macOSRecentDocumentsUpdater.trigger(() => this.updateMacOSRecentDocuments());
          }
        }
      }
      async clearRecentlyOpened(options) {
        if (options?.confirm) {
          const { response } = await this.dialogMainService.showMessageBox({
            type: "warning",
            buttons: [
              localize(3724, null),
              localize(3723, null)
            ],
            message: localize(3726, null),
            detail: localize(3725, null),
            cancelId: 1
          });
          if (response !== 0) {
            return;
          }
        }
        await this.saveRecentlyOpened({ workspaces: [], files: [] });
        if (!this.environmentMainService.isPortable) {
          app7.clearRecentDocuments();
        }
        this._onDidChangeRecentlyOpened.fire();
      }
      async getRecentlyOpened() {
        const recentlyOpened = await this.mergeEntriesFromStorage();
        return {
          workspaces: this.canonicalizeAgentSessionsWorkspaces(recentlyOpened.workspaces),
          files: recentlyOpened.files
        };
      }
      canonicalizeAgentSessionsWorkspaces(workspaces) {
        const result = [];
        let agentsWindowAdded = false;
        for (const recent of workspaces) {
          if (isRecentWorkspace(recent) && this.isAgentSessionsWorkspace(recent.workspace)) {
            if (!agentsWindowAdded) {
              agentsWindowAdded = true;
              result.push({
                workspace: getWorkspaceIdentifier2(this.environmentMainService.agentSessionsWorkspace),
                label: localize(3722, null)
              });
            }
          } else {
            result.push(recent);
          }
        }
        return result;
      }
      isAgentSessionsWorkspace(workspace) {
        if (isEqual2(workspace.configPath, this.environmentMainService.agentSessionsWorkspace)) {
          return true;
        }
        const agentSessionsWorkspace = this.environmentMainService.agentSessionsWorkspace;
        return basename2(workspace.configPath) === basename2(agentSessionsWorkspace) && basename2(dirname4(workspace.configPath)) === basename2(dirname4(agentSessionsWorkspace));
      }
      async mergeEntriesFromStorage(existingEntries) {
        const mapWorkspaceIdToWorkspace = new ResourceMap((uri) => extUriBiasedIgnorePathCase.getComparisonKey(uri));
        if (existingEntries?.workspaces) {
          for (const workspace of existingEntries.workspaces) {
            mapWorkspaceIdToWorkspace.set(this.location(workspace), workspace);
          }
        }
        const mapFileIdToFile = new ResourceMap((uri) => extUriBiasedIgnorePathCase.getComparisonKey(uri));
        if (existingEntries?.files) {
          for (const file of existingEntries.files) {
            mapFileIdToFile.set(this.location(file), file);
          }
        }
        const recentFromStorage = await this.getRecentlyOpenedFromStorage();
        for (const recentWorkspaceFromStorage of recentFromStorage.workspaces) {
          const existingRecentWorkspace = mapWorkspaceIdToWorkspace.get(this.location(recentWorkspaceFromStorage));
          if (existingRecentWorkspace) {
            existingRecentWorkspace.label = existingRecentWorkspace.label ?? recentWorkspaceFromStorage.label;
          } else {
            mapWorkspaceIdToWorkspace.set(this.location(recentWorkspaceFromStorage), recentWorkspaceFromStorage);
          }
        }
        for (const recentFileFromStorage of recentFromStorage.files) {
          const existingRecentFile = mapFileIdToFile.get(this.location(recentFileFromStorage));
          if (existingRecentFile) {
            existingRecentFile.label = existingRecentFile.label ?? recentFileFromStorage.label;
          } else {
            mapFileIdToFile.set(this.location(recentFileFromStorage), recentFileFromStorage);
          }
        }
        return {
          workspaces: [...mapWorkspaceIdToWorkspace.values()],
          files: [...mapFileIdToFile.values()]
        };
      }
      async getRecentlyOpenedFromStorage() {
        await this.applicationStorageMainService.whenReady;
        let storedRecentlyOpened = void 0;
        const storedRecentlyOpenedRaw = this.applicationStorageMainService.get(WorkspacesHistoryMainService.RECENTLY_OPENED_STORAGE_KEY, -2 /* APPLICATION_SHARED */);
        if (typeof storedRecentlyOpenedRaw === "string") {
          try {
            storedRecentlyOpened = JSON.parse(storedRecentlyOpenedRaw);
          } catch (error) {
            this.logService.error("Unexpected error parsing opened paths list", error);
          }
        }
        return restoreRecentlyOpened(storedRecentlyOpened, this.logService);
      }
      async saveRecentlyOpened(recent) {
        await this.applicationStorageMainService.whenReady;
        this.applicationStorageMainService.store(WorkspacesHistoryMainService.RECENTLY_OPENED_STORAGE_KEY, JSON.stringify(toStoreData(recent)), -2 /* APPLICATION_SHARED */, 1 /* MACHINE */);
      }
      location(recent) {
        if (isRecentFolder(recent)) {
          return recent.folderUri;
        }
        if (isRecentFile(recent)) {
          return recent.fileUri;
        }
        return recent.workspace.configPath;
      }
      containsWorkspace(recents, candidate) {
        return !!recents.find((recent) => isRecentWorkspace(recent) && recent.workspace.id === candidate.id);
      }
      containsFolder(recents, candidate) {
        return !!recents.find((recent) => isRecentFolder(recent) && extUriBiasedIgnorePathCase.isEqual(recent.folderUri, candidate));
      }
      containsFile(recents, candidate) {
        return !!recents.find((recent) => extUriBiasedIgnorePathCase.isEqual(recent.fileUri, candidate));
      }
      static {
        //#endregion
        //#region macOS Dock / Windows JumpList
        this.MAX_MACOS_DOCK_RECENT_WORKSPACES = 7;
      }
      static {
        // prefer higher number of workspaces...
        this.MAX_MACOS_DOCK_RECENT_ENTRIES_TOTAL = 10;
      }
      static {
        // ...over number of files
        // Exclude some very common files from the dock/taskbar
        this.COMMON_FILES_FILTER = [
          "COMMIT_EDITMSG",
          "MERGE_MSG",
          "git-rebase-todo"
        ];
      }
      async handleWindowsJumpList() {
        if (!isWindows2) {
          return;
        }
        if (this.environmentMainService.isPortable) {
          return;
        }
        await this.updateWindowsJumpList();
        this._register(this.onDidChangeRecentlyOpened(() => this.updateWindowsJumpList()));
      }
      async updateWindowsJumpList() {
        if (!isWindows2) {
          return;
        }
        const jumpList = [];
        jumpList.push({
          type: "tasks",
          items: [
            {
              type: "task",
              title: localize(3727, null),
              description: localize(3728, null),
              program: process.execPath,
              args: "-n",
              // force new window
              iconPath: process.execPath,
              iconIndex: 0
            }
          ]
        });
        if ((await this.getRecentlyOpened()).workspaces.length > 0) {
          const jumpListSettings = app7.getJumpListSettings();
          const toRemove = [];
          for (const item of jumpListSettings.removedItems) {
            const args2 = item.args;
            if (args2) {
              const match = /^--(folder|file)-uri\s+"([^"]+)"$/.exec(args2);
              if (match) {
                toRemove.push(URI.parse(match[2]));
              }
            }
          }
          await this.removeRecentlyOpened(toRemove);
          let hasWorkspaces = false;
          const items = coalesce((await this.getRecentlyOpened()).workspaces.slice(0, jumpListSettings.minItems).map((recent) => {
            const workspace = isRecentWorkspace(recent) ? recent.workspace : recent.folderUri;
            const { title, description } = this.getWindowsJumpListLabel(workspace, recent.label);
            let args2;
            if (URI.isUri(workspace)) {
              args2 = `--folder-uri "${workspace.toString()}"`;
            } else {
              hasWorkspaces = true;
              args2 = `--file-uri "${workspace.configPath.toString()}"`;
            }
            return {
              type: "task",
              title: title.substr(0, 255),
              // Windows seems to be picky around the length of entries
              description: description.substr(0, 255),
              // (see https://github.com/microsoft/vscode/issues/111177)
              program: process.execPath,
              args: args2,
              iconPath: "explorer.exe",
              // simulate folder icon
              iconIndex: 0
            };
          }));
          if (items.length > 0) {
            jumpList.push({
              type: "custom",
              name: hasWorkspaces ? localize(3730, null) : localize(3729, null),
              items
            });
          }
        }
        jumpList.push({
          type: "recent"
          // this enables to show files in the "recent" category
        });
        try {
          const res = app7.setJumpList(jumpList);
          if (res && res !== "ok") {
            this.logService.warn(`updateWindowsJumpList#setJumpList unexpected result: ${res}`);
          }
        } catch (error) {
          this.logService.warn("updateWindowsJumpList#setJumpList", error);
        }
      }
      getWindowsJumpListLabel(workspace, recentLabel) {
        if (recentLabel) {
          return { title: splitRecentLabel(recentLabel).name, description: recentLabel };
        }
        if (URI.isUri(workspace)) {
          return { title: basename2(workspace), description: this.renderJumpListPathDescription(workspace) };
        }
        if (this.workspacesManagementMainService.isUntitledWorkspace(workspace)) {
          return { title: localize(3731, null), description: "" };
        }
        let filename = basename2(workspace.configPath);
        if (filename.endsWith(WORKSPACE_EXTENSION)) {
          filename = filename.substr(0, filename.length - WORKSPACE_EXTENSION.length - 1);
        }
        return { title: localize(3732, null, filename), description: this.renderJumpListPathDescription(workspace.configPath) };
      }
      renderJumpListPathDescription(uri) {
        return uri.scheme === "file" ? normalizeDriveLetter(uri.fsPath) : uri.toString();
      }
      async updateMacOSRecentDocuments() {
        if (!isMacintosh) {
          return;
        }
        app7.clearRecentDocuments();
        const mru = await this.getRecentlyOpened();
        const workspaceEntries = [];
        let entries = 0;
        for (let i = 0; i < mru.workspaces.length && entries < WorkspacesHistoryMainService.MAX_MACOS_DOCK_RECENT_WORKSPACES; i++) {
          const loc = this.location(mru.workspaces[i]);
          if (loc.scheme === Schemas.file) {
            const workspacePath = originalFSPath(loc);
            if (await Promises2.exists(workspacePath)) {
              workspaceEntries.push(workspacePath);
              entries++;
            }
          }
        }
        const fileEntries = [];
        for (let i = 0; i < mru.files.length && entries < WorkspacesHistoryMainService.MAX_MACOS_DOCK_RECENT_ENTRIES_TOTAL; i++) {
          const loc = this.location(mru.files[i]);
          if (loc.scheme === Schemas.file) {
            const filePath = originalFSPath(loc);
            if (WorkspacesHistoryMainService.COMMON_FILES_FILTER.includes(basename2(loc)) || // skip some well known file entries
            workspaceEntries.includes(filePath)) {
              continue;
            }
            if (await Promises2.exists(filePath)) {
              fileEntries.push(filePath);
              entries++;
            }
          }
        }
        fileEntries.reverse().forEach((fileEntry) => app7.addRecentDocument(fileEntry));
        workspaceEntries.reverse().forEach((workspaceEntry) => app7.addRecentDocument(workspaceEntry));
      }
      //#endregion
    };
    WorkspacesHistoryMainService = __decorateClass([
      __decorateParam(0, ILogService),
      __decorateParam(1, IWorkspacesManagementMainService),
      __decorateParam(2, ILifecycleMainService),
      __decorateParam(3, IApplicationStorageMainService),
      __decorateParam(4, IDialogMainService),
      __decorateParam(5, IEnvironmentMainService)
    ], WorkspacesHistoryMainService);
  }
});
export { app7, IWorkspacesHistoryMainService, WorkspacesHistoryMainService, init_workspacesHistoryMainService };
