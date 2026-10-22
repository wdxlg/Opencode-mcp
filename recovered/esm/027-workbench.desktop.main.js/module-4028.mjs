// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/performance/browser/startupTimings.ts
import { ILifecycleService, StartupKindToString } from "./module-0868.mjs";
import { VIEWLET_ID5 } from "./module-1542.mjs";
import { isCodeEditor } from "./module-0223.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IEditorService } from "./module-0934.mjs";
import { IPaneCompositePartService } from "./module-1092.mjs";
import { IUpdateService } from "./module-1181.mjs";
import { IWorkspaceTrustManagementService } from "./module-0854.mjs";
import { ITimerService } from "./module-1183.mjs";
import { ILogService } from "./module-0095.mjs";
import { IBrowserWorkbenchEnvironmentService } from "./module-0915.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { IProductService } from "./module-0873.mjs";
import { posix } from "./module-0026.mjs";
import { hash } from "./module-0039.mjs";


// src/vs/workbench/contrib/performance/browser/startupTimings.ts
var StartupTimings = class {
  constructor(_editorService, _paneCompositeService, _lifecycleService, _updateService, _workspaceTrustService) {
    this._editorService = _editorService;
    this._paneCompositeService = _paneCompositeService;
    this._lifecycleService = _lifecycleService;
    this._updateService = _updateService;
    this._workspaceTrustService = _workspaceTrustService;
  }
  async _isStandardStartup() {
    if (this._lifecycleService.startupKind !== 1 /* NewWindow */) {
      return StartupKindToString(this._lifecycleService.startupKind);
    }
    if (!this._workspaceTrustService.isWorkspaceTrusted()) {
      return "Workspace not trusted";
    }
    const activeViewlet = this._paneCompositeService.getActivePaneComposite(0 /* Sidebar */);
    if (!activeViewlet || activeViewlet.getId() !== VIEWLET_ID5) {
      return "Explorer viewlet not visible";
    }
    const visibleEditorPanes = this._editorService.visibleEditorPanes;
    if (visibleEditorPanes.length !== 1) {
      return `Expected text editor count : 1, Actual : ${visibleEditorPanes.length}`;
    }
    if (!isCodeEditor(visibleEditorPanes[0].getControl())) {
      return "Active editor is not a text editor";
    }
    const activePanel = this._paneCompositeService.getActivePaneComposite(1 /* Panel */);
    if (activePanel) {
      return `Current active panel : ${this._paneCompositeService.getPaneComposite(activePanel.getId(), 1 /* Panel */)?.name}`;
    }
    const isLatestVersion = await this._updateService.isLatestVersion();
    if (isLatestVersion === false) {
      return "Not on latest version, updates available";
    }
    return void 0;
  }
};

StartupTimings = __decorateClass([
  __decorateParam(0, IEditorService),
  __decorateParam(1, IPaneCompositePartService),
  __decorateParam(2, ILifecycleService),
  __decorateParam(3, IUpdateService),
  __decorateParam(4, IWorkspaceTrustManagementService)
], StartupTimings);

var BrowserStartupTimings = class extends StartupTimings {
  constructor(editorService, paneCompositeService, lifecycleService, updateService, workspaceTrustService, timerService, logService, environmentService, telemetryService, productService) {
    super(editorService, paneCompositeService, lifecycleService, updateService, workspaceTrustService);
    this.timerService = timerService;
    this.logService = logService;
    this.environmentService = environmentService;
    this.telemetryService = telemetryService;
    this.productService = productService;
    this.logPerfMarks();
  }
  async logPerfMarks() {
    if (!this.environmentService.profDurationMarkers) {
      return;
    }
    await this.timerService.whenReady();
    const standardStartupError = await this._isStandardStartup();
    const perfBaseline = await this.timerService.perfBaseline;
    const [from, to] = this.environmentService.profDurationMarkers;
    const content2 = `${this.timerService.getDuration(from, to)}	${this.productService.nameShort}	${(this.productService.commit || "").slice(0, 10) || "0000000000"}	${this.telemetryService.sessionId}	${standardStartupError === void 0 ? "standard_start" : "NO_standard_start : " + standardStartupError}	${String(perfBaseline).padStart(4, "0")}ms
`;
    this.logService.info(`[prof-timers] ${content2}`);
  }
};

BrowserStartupTimings = __decorateClass([
  __decorateParam(0, IEditorService),
  __decorateParam(1, IPaneCompositePartService),
  __decorateParam(2, ILifecycleService),
  __decorateParam(3, IUpdateService),
  __decorateParam(4, IWorkspaceTrustManagementService),
  __decorateParam(5, ITimerService),
  __decorateParam(6, ILogService),
  __decorateParam(7, IBrowserWorkbenchEnvironmentService),
  __decorateParam(8, ITelemetryService),
  __decorateParam(9, IProductService)
], BrowserStartupTimings);

var BrowserResourcePerformanceMarks = class {
  constructor(telemetryService) {
    for (const item of performance.getEntriesByType("resource")) {
      try {
        const url = new URL(item.name);
        const name = posix.basename(url.pathname);
        telemetryService.publicLog2("startup.resource.perf", {
          hosthash: `H${hash(url.host).toString(16)}`,
          name,
          duration: item.duration
        });
      } catch {
      }
    }
  }
};

BrowserResourcePerformanceMarks = __decorateClass([
  __decorateParam(0, ITelemetryService)
], BrowserResourcePerformanceMarks);
export { StartupTimings, BrowserStartupTimings, BrowserResourcePerformanceMarks };
