// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/workspaces/browser/workspaces.contribution.ts
import { Disposable } from "./module-0012.mjs";
import { isVirtualWorkspace } from "./module-0936.mjs";
import { IWorkspaceContextService, WORKSPACE_SUFFIX, hasWorkspaceFileExtension } from "./module-0509.mjs";
import { INotificationService, Severity2 } from "./module-0336.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { isEqual2, joinPath } from "./module-0034.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IFileService } from "./module-0269.mjs";
import { IQuickInputService } from "./module-0536.mjs";
import { IHostService } from "./module-1117.mjs";
import { IStorageService } from "./module-0512.mjs";
import { Registry } from "./module-0090.mjs";
import { Extensions10 } from "./module-0870.mjs";
import { Action2, MenuId, registerAction2 } from "./module-0092.mjs";
import { ContextKeyExpr } from "./module-0089.mjs";
import { ActiveEditorContext, IsSessionsWindowContext, ResourceContextKey, TemporaryWorkspaceContext } from "./module-0949.mjs";
import { TEXT_FILE_EDITOR_ID } from "./module-1542.mjs";


// src/vs/workbench/contrib/workspaces/browser/workspaces.contribution.ts
var WorkspacesFinderContribution = class extends Disposable {
  constructor(contextService, notificationService, fileService, quickInputService, hostService, storageService) {
    super();
    this.contextService = contextService;
    this.notificationService = notificationService;
    this.fileService = fileService;
    this.quickInputService = quickInputService;
    this.hostService = hostService;
    this.storageService = storageService;
    this.findWorkspaces();
  }
  async findWorkspaces() {
    const folder = this.contextService.getWorkspace().folders[0];
    if (!folder || this.contextService.getWorkbenchState() !== 2 /* FOLDER */ || isVirtualWorkspace(this.contextService.getWorkspace())) {
      return;
    }
    const rootFileNames = (await this.fileService.resolve(folder.uri)).children?.map((child) => child.name);
    if (Array.isArray(rootFileNames)) {
      const workspaceFiles = rootFileNames.filter(hasWorkspaceFileExtension);
      if (workspaceFiles.length > 0) {
        this.doHandleWorkspaceFiles(folder.uri, workspaceFiles);
      }
    }
  }
  doHandleWorkspaceFiles(folder, workspaces) {
    const neverShowAgain = { id: "workspaces.dontPromptToOpen", scope: 0 /* WORKSPACE */, isSecondary: true };
    if (workspaces.length === 1) {
      const workspaceFile = workspaces[0];
      this.notificationService.prompt(Severity2.Info, localize(
        22398,
        null,
        workspaceFile,
        "https://go.microsoft.com/fwlink/?linkid=2025315"
      ), [{
        label: localize(22400, null),
        run: () => this.hostService.openWindow([{ workspaceUri: joinPath(folder, workspaceFile) }])
      }], {
        neverShowAgain,
        priority: !this.storageService.isNew(1 /* WORKSPACE */) ? 2 /* SILENT */ : 1 /* OPTIONAL */
        // https://github.com/microsoft/vscode/issues/125315
      });
    } else if (workspaces.length > 1) {
      this.notificationService.prompt(Severity2.Info, localize(22399, null, "https://go.microsoft.com/fwlink/?linkid=2025315"), [{
        label: localize(22403, null),
        run: () => {
          this.quickInputService.pick(
            workspaces.map((workspace) => ({ label: workspace })),
            { placeHolder: localize(22402, null) }
          ).then((pick) => {
            if (pick) {
              this.hostService.openWindow([{ workspaceUri: joinPath(folder, pick.label) }]);
            }
          });
        }
      }], {
        neverShowAgain,
        priority: !this.storageService.isNew(1 /* WORKSPACE */) ? 2 /* SILENT */ : 1 /* OPTIONAL */
        // https://github.com/microsoft/vscode/issues/125315
      });
    }
  }
};

WorkspacesFinderContribution = __decorateClass([
  __decorateParam(0, IWorkspaceContextService),
  __decorateParam(1, INotificationService),
  __decorateParam(2, IFileService),
  __decorateParam(3, IQuickInputService),
  __decorateParam(4, IHostService),
  __decorateParam(5, IStorageService)
], WorkspacesFinderContribution);

Registry.as(Extensions10.Workbench).registerWorkbenchContribution(WorkspacesFinderContribution, 4 /* Eventually */);

registerAction2(class extends Action2 {
  constructor() {
    super({
      id: "workbench.action.openWorkspaceFromEditor",
      title: localize2(22401, "Open Workspace"),
      f1: false,
      menu: {
        id: MenuId.EditorContent,
        when: ContextKeyExpr.and(
          ResourceContextKey.Extension.isEqualTo(WORKSPACE_SUFFIX),
          ActiveEditorContext.isEqualTo(TEXT_FILE_EDITOR_ID),
          TemporaryWorkspaceContext.toNegated(),
          IsSessionsWindowContext.toNegated()
        )
      }
    });
  }
  async run(accessor, uri5) {
    const hostService = accessor.get(IHostService);
    const contextService = accessor.get(IWorkspaceContextService);
    const notificationService = accessor.get(INotificationService);
    if (contextService.getWorkbenchState() === 3 /* WORKSPACE */) {
      const workspaceConfiguration = contextService.getWorkspace().configuration;
      if (workspaceConfiguration && isEqual2(workspaceConfiguration, uri5)) {
        notificationService.info(localize(22397, null));
        return;
      }
    }
    return hostService.openWindow([{ workspaceUri: uri5 }]);
  }
});
export { WorkspacesFinderContribution };
