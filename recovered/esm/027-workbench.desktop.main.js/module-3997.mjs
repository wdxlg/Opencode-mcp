// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/issue/electron-browser/nativeIssueFormService.ts
import { IssueFormService } from "./module-3995.mjs";
import { MutableDisposable } from "./module-0012.mjs";
import { IssueReporterEditorInput } from "./module-3980.mjs";
import { IssueReporter } from "./module-3996.mjs";
import { product_default } from "./module-0139.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IAuxiliaryWindowService } from "./module-1594.mjs";
import { ILogService } from "./module-0095.mjs";
import { IDialogService } from "./module-0267.mjs";
import { IMenuService } from "./module-0092.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { IHostService } from "./module-1117.mjs";
import { IOpenerService } from "./module-0272.mjs";
import { IFileService } from "./module-0269.mjs";
import { IEnvironmentService } from "./module-0508.mjs";
import { IGitHubUploadService } from "./module-3994.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IEditorService } from "./module-0934.mjs";
import { IClipboardService } from "./module-0487.mjs";
import { INativeHostService } from "./module-2591.mjs";
import { IEditorGroupsService } from "./module-0933.mjs";


// src/vs/workbench/contrib/issue/electron-browser/nativeIssueFormService.ts
var NativeIssueFormService = class extends IssueFormService {
  constructor(instantiationService, auxiliaryWindowService, logService, dialogService, menuService, contextKeyService, hostService, openerService, fileService, environmentService, githubUploadService, configurationService, editorService, clipboardService, nativeHostService, editorGroupService) {
    super(instantiationService, auxiliaryWindowService, menuService, contextKeyService, logService, dialogService, hostService, openerService, fileService, githubUploadService, editorService, clipboardService);
    this.environmentService = environmentService;
    this.configurationService = configurationService;
    this.nativeHostService = nativeHostService;
    this.editorGroupService = editorGroupService;
    /**
     * Holds the currently-rendered legacy IssueReporter so its listeners on long-lived services
     * (e.g. authentication onDidChangeSessions) are released when the aux window closes or a new
     * reporter is opened.
     */
    this.legacyReporter = this._register(new MutableDisposable());
  }
  async openReporter(data) {
    if (this.hasToReload(data)) {
      return;
    }
    const useWizard = this.configurationService.getValue("issueReporter.wizard.enabled");
    if (!useWizard) {
      const { arch: arch2, release, type } = await this.nativeHostService.getOSProperties();
      this.arch = arch2;
      this.release = release;
      this.type = type;
      return this.openAuxIssueReporterLegacy(data);
    }
    const input = this.instantiationService.createInstance(IssueReporterEditorInput, data);
    const preferredGroup = data.isSessionsWindow ? this.editorGroupService.mainPart.activeGroup : void 0;
    await this.editorService.openEditor(input, { pinned: true }, preferredGroup);
  }
  /**
   * Desktop legacy path uses the native `IssueReporter` (so it can populate
   * system/performance info via `IProcessService`) and centers the auxiliary
   * window on the active window via `getActiveWindowPosition()`.
   */
  async openAuxIssueReporterLegacy(data) {
    const bounds = await this.nativeHostService.getActiveWindowPosition();
    await this.openAuxIssueReporter(data, bounds);
    if (this.issueReporterWindow) {
      const issueReporter = this.instantiationService.createInstance(
        IssueReporter,
        !!this.environmentService.disableExtensions,
        data,
        { type: this.type, arch: this.arch, release: this.release },
        product_default,
        this.issueReporterWindow
      );
      this.legacyReporter.value = issueReporter;
      this.issueReporterWindow.addEventListener("beforeunload", () => this.legacyReporter.clear(), { once: true });
      issueReporter.render();
    }
  }
};

NativeIssueFormService = __decorateClass([
  __decorateParam(0, IInstantiationService),
  __decorateParam(1, IAuxiliaryWindowService),
  __decorateParam(2, ILogService),
  __decorateParam(3, IDialogService),
  __decorateParam(4, IMenuService),
  __decorateParam(5, IContextKeyService),
  __decorateParam(6, IHostService),
  __decorateParam(7, IOpenerService),
  __decorateParam(8, IFileService),
  __decorateParam(9, IEnvironmentService),
  __decorateParam(10, IGitHubUploadService),
  __decorateParam(11, IConfigurationService),
  __decorateParam(12, IEditorService),
  __decorateParam(13, IClipboardService),
  __decorateParam(14, INativeHostService),
  __decorateParam(15, IEditorGroupsService)
], NativeIssueFormService);
export { NativeIssueFormService };
