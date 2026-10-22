// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/files/browser/workspaceWatcher.ts
import { Disposable, DisposableStore, dispose } from "./module-0012.mjs";
import { ResourceMap } from "./module-0008.mjs";
import { INotificationService, Severity2 } from "./module-0336.mjs";
import { localize } from "./module-0001.mjs";
import { URI } from "./module-0032.mjs";
import { isAbsolute } from "./module-0026.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IFileService } from "./module-0269.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IWorkspaceContextService } from "./module-0509.mjs";
import { IOpenerService } from "./module-0272.mjs";
import { IUriIdentityService } from "./module-0510.mjs";
import { IHostService } from "./module-1118.mjs";
import { ITelemetryService } from "./module-0093.mjs";


// src/vs/workbench/contrib/files/browser/workspaceWatcher.ts
var WorkspaceWatcher = class extends Disposable {
  constructor(fileService, configurationService, contextService, notificationService, openerService, uriIdentityService, hostService, telemetryService) {
    super();
    this.fileService = fileService;
    this.configurationService = configurationService;
    this.contextService = contextService;
    this.notificationService = notificationService;
    this.openerService = openerService;
    this.uriIdentityService = uriIdentityService;
    this.hostService = hostService;
    this.telemetryService = telemetryService;
    this.watchedWorkspaces = new ResourceMap((resource) => this.uriIdentityService.extUri.getComparisonKey(resource));
    this.registerListeners();
    this.refresh();
  }
  static {
    this.ID = "workbench.contrib.workspaceWatcher";
  }
  registerListeners() {
    this._register(this.contextService.onDidChangeWorkspaceFolders((e4) => this.onDidChangeWorkspaceFolders(e4)));
    this._register(this.contextService.onDidChangeWorkbenchState(() => this.onDidChangeWorkbenchState()));
    this._register(this.configurationService.onDidChangeConfiguration((e4) => this.onDidChangeConfiguration(e4)));
    this._register(this.fileService.onDidWatchError((error) => this.onDidWatchError(error)));
  }
  onDidChangeWorkspaceFolders(e4) {
    for (const removed of e4.removed) {
      this.unwatchWorkspace(removed);
    }
    for (const added of e4.added) {
      this.watchWorkspace(added);
    }
  }
  onDidChangeWorkbenchState() {
    this.refresh();
  }
  onDidChangeConfiguration(e4) {
    if (e4.affectsConfiguration("files.watcherExclude") || e4.affectsConfiguration("files.watcherInclude")) {
      this.refresh();
    }
  }
  onDidWatchError(error) {
    const msg = error.toString();
    let reason = void 0;
    if (msg.indexOf("ENOSPC") >= 0) {
      reason = "ENOSPC";
      this.notificationService.prompt(
        Severity2.Warning,
        localize(16037, null),
        [{
          label: localize(16039, null),
          run: () => this.openerService.open(URI.parse("https://go.microsoft.com/fwlink/?linkid=867693"))
        }],
        {
          sticky: true,
          neverShowAgain: { id: "ignoreEnospcError", isSecondary: true, scope: 0 /* WORKSPACE */ }
        }
      );
    } else if (msg.indexOf("EUNKNOWN") >= 0) {
      reason = "EUNKNOWN";
      this.notificationService.prompt(
        Severity2.Warning,
        localize(16038, null),
        [{
          label: localize(16040, null),
          run: () => this.hostService.reload()
        }],
        {
          sticky: true,
          priority: 2 /* SILENT */
          // reduce potential spam since we don't really know how often this fires
        }
      );
    } else if (msg.indexOf("ETERM") >= 0) {
      reason = "ETERM";
    }
    if (reason) {
      this.telemetryService.publicLog2("fileWatcherError", { reason });
    }
  }
  watchWorkspace(workspace) {
    const excludes = [];
    const config = this.configurationService.getValue({ resource: workspace.uri });
    if (config.files?.watcherExclude) {
      for (const key3 in config.files.watcherExclude) {
        if (key3 && config.files.watcherExclude[key3] === true) {
          excludes.push(key3);
        }
      }
    }
    const pathsToWatch = new ResourceMap((uri4) => this.uriIdentityService.extUri.getComparisonKey(uri4));
    pathsToWatch.set(workspace.uri, workspace.uri);
    if (config.files?.watcherInclude) {
      for (const includePath of config.files.watcherInclude) {
        if (!includePath) {
          continue;
        }
        if (isAbsolute(includePath)) {
          const candidate = URI.file(includePath).with({ scheme: workspace.uri.scheme });
          if (this.uriIdentityService.extUri.isEqualOrParent(candidate, workspace.uri)) {
            pathsToWatch.set(candidate, candidate);
          }
        } else {
          const candidate = workspace.toResource(includePath);
          pathsToWatch.set(candidate, candidate);
        }
      }
    }
    const disposables = new DisposableStore();
    for (const [, pathToWatch] of pathsToWatch) {
      disposables.add(this.fileService.watch(pathToWatch, { recursive: true, excludes }));
    }
    this.watchedWorkspaces.set(workspace.uri, disposables);
  }
  unwatchWorkspace(workspace) {
    if (this.watchedWorkspaces.has(workspace.uri)) {
      dispose(this.watchedWorkspaces.get(workspace.uri));
      this.watchedWorkspaces.delete(workspace.uri);
    }
  }
  refresh() {
    this.unwatchWorkspaces();
    for (const folder of this.contextService.getWorkspace().folders) {
      this.watchWorkspace(folder);
    }
  }
  unwatchWorkspaces() {
    for (const [, disposable] of this.watchedWorkspaces) {
      disposable.dispose();
    }
    this.watchedWorkspaces.clear();
  }
  dispose() {
    super.dispose();
    this.unwatchWorkspaces();
  }
};

WorkspaceWatcher = __decorateClass([
  __decorateParam(0, IFileService),
  __decorateParam(1, IConfigurationService),
  __decorateParam(2, IWorkspaceContextService),
  __decorateParam(3, INotificationService),
  __decorateParam(4, IOpenerService),
  __decorateParam(5, IUriIdentityService),
  __decorateParam(6, IHostService),
  __decorateParam(7, ITelemetryService)
], WorkspaceWatcher);
export { WorkspaceWatcher };
