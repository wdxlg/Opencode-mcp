// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/markers/browser/markersViewActions.ts
import { Disposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { MarkersContextKeys } from "./module-3192.mjs";
import { Action } from "./module-0082.mjs";
import { Messages } from "./module-3200.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { Codicon } from "./module-0085.mjs";
import { ActionViewItem } from "./module-0476.mjs";
import { EventHelper, getDomNodePagePosition } from "./module-0075.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IContextMenuService } from "./module-0488.mjs";


// src/vs/workbench/contrib/markers/browser/markersViewActions.ts
var MarkersFilters = class extends Disposable {
  constructor(options3, contextKeyService) {
    super();
    this._onDidChange = this._register(new Emitter());
    this.onDidChange = this._onDidChange.event;
    this._excludedFiles = MarkersContextKeys.ShowExcludedFilesFilterContextKey.bindTo(contextKeyService);
    this._excludedFiles.set(options3.excludedFiles);
    this._activeFile = MarkersContextKeys.ShowActiveFileFilterContextKey.bindTo(contextKeyService);
    this._activeFile.set(options3.activeFile);
    this._showWarnings = MarkersContextKeys.ShowWarningsFilterContextKey.bindTo(contextKeyService);
    this._showWarnings.set(options3.showWarnings);
    this._showInfos = MarkersContextKeys.ShowInfoFilterContextKey.bindTo(contextKeyService);
    this._showInfos.set(options3.showInfos);
    this._showErrors = MarkersContextKeys.ShowErrorsFilterContextKey.bindTo(contextKeyService);
    this._showErrors.set(options3.showErrors);
    this.filterHistory = options3.filterHistory;
  }
  get excludedFiles() {
    return !!this._excludedFiles.get();
  }
  set excludedFiles(filesExclude) {
    if (this._excludedFiles.get() !== filesExclude) {
      this._excludedFiles.set(filesExclude);
      this._onDidChange.fire({ excludedFiles: true });
    }
  }
  get activeFile() {
    return !!this._activeFile.get();
  }
  set activeFile(activeFile) {
    if (this._activeFile.get() !== activeFile) {
      this._activeFile.set(activeFile);
      this._onDidChange.fire({ activeFile: true });
    }
  }
  get showWarnings() {
    return !!this._showWarnings.get();
  }
  set showWarnings(showWarnings) {
    if (this._showWarnings.get() !== showWarnings) {
      this._showWarnings.set(showWarnings);
      this._onDidChange.fire({ showWarnings: true });
    }
  }
  get showErrors() {
    return !!this._showErrors.get();
  }
  set showErrors(showErrors) {
    if (this._showErrors.get() !== showErrors) {
      this._showErrors.set(showErrors);
      this._onDidChange.fire({ showErrors: true });
    }
  }
  get showInfos() {
    return !!this._showInfos.get();
  }
  set showInfos(showInfos) {
    if (this._showInfos.get() !== showInfos) {
      this._showInfos.set(showInfos);
      this._onDidChange.fire({ showInfos: true });
    }
  }
};

var QuickFixAction2 = class _QuickFixAction extends Action {
  constructor(marker) {
    super(_QuickFixAction.ID, Messages.MARKERS_PANEL_ACTION_TOOLTIP_QUICKFIX, _QuickFixAction.CLASS, false);
    this.marker = marker;
    this._onShowQuickFixes = this._register(new Emitter());
    this.onShowQuickFixes = this._onShowQuickFixes.event;
    this._quickFixes = [];
  }
  static {
    this.ID = "workbench.actions.problems.quickfix";
  }
  static {
    this.CLASS = "markers-panel-action-quickfix " + ThemeIcon.asClassName(Codicon.lightBulb);
  }
  static {
    this.AUTO_FIX_CLASS = _QuickFixAction.CLASS + " autofixable";
  }
  get quickFixes() {
    return this._quickFixes;
  }
  set quickFixes(quickFixes) {
    this._quickFixes = quickFixes;
    this.enabled = this._quickFixes.length > 0;
  }
  autoFixable(autofixable) {
    this.class = autofixable ? _QuickFixAction.AUTO_FIX_CLASS : _QuickFixAction.CLASS;
  }
  run() {
    this._onShowQuickFixes.fire();
    return Promise.resolve();
  }
};

var QuickFixActionViewItem2 = class extends ActionViewItem {
  constructor(action, options3, contextMenuService) {
    super(null, action, { ...options3, icon: true, label: false });
    this.contextMenuService = contextMenuService;
  }
  onClick(event) {
    EventHelper.stop(event, true);
    this.showQuickFixes();
  }
  showQuickFixes() {
    if (!this.element) {
      return;
    }
    if (!this.isEnabled()) {
      return;
    }
    const elementPosition = getDomNodePagePosition(this.element);
    const quickFixes = this.action.quickFixes;
    if (quickFixes.length) {
      this.contextMenuService.showContextMenu({
        getAnchor: () => ({ x: elementPosition.left + 10, y: elementPosition.top + elementPosition.height + 4 }),
        getActions: () => quickFixes
      });
    }
  }
};

QuickFixActionViewItem2 = __decorateClass([
  __decorateParam(2, IContextMenuService)
], QuickFixActionViewItem2);
export { MarkersFilters, QuickFixAction2, QuickFixActionViewItem2 };
