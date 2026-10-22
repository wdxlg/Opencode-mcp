// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/bulkEdit/browser/preview/bulkEdit.contribution.ts
import { BulkEditPane } from "./module-3107.mjs";
import { EditorResourceAccessor } from "./module-0925.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IPaneCompositePartService } from "./module-1092.mjs";
import { IEditorGroupsService } from "./module-0933.mjs";
import { CancellationTokenSource } from "./module-0025.mjs";
import { ContextKeyExpr, IContextKeyService, RawContextKey } from "./module-0089.mjs";
import { severity_default } from "./module-0266.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { IViewsService } from "./module-1246.mjs";
import { IDialogService } from "./module-0267.mjs";
import { IBulkEditService } from "./module-0537.mjs";
import { Action2, MenuId, registerAction2 } from "./module-0092.mjs";
import { Codicon } from "./module-0085.mjs";
import { FocusedViewContext } from "./module-0949.mjs";
import { WorkbenchListFocusContextKey } from "./module-0636.mjs";
import { WorkbenchPhase, registerWorkbenchContribution2 } from "./module-0870.mjs";
import { registerIcon } from "./module-0479.mjs";
import { Registry } from "./module-0090.mjs";
import { Extensions13 } from "./module-1093.mjs";
import { SyncDescriptor } from "./module-0134.mjs";
import { ViewPaneContainer } from "./module-1382.mjs";


// src/vs/workbench/contrib/bulkEdit/browser/preview/bulkEdit.contribution.ts
async function getBulkEditPane(viewsService) {
  const view = await viewsService.openView(BulkEditPane.ID, true);
  if (view instanceof BulkEditPane) {
    return view;
  }
  return void 0;
}

var UXState = class {
  constructor(_paneCompositeService, _editorGroupsService) {
    this._paneCompositeService = _paneCompositeService;
    this._editorGroupsService = _editorGroupsService;
    this._activePanel = _paneCompositeService.getActivePaneComposite(1 /* Panel */)?.getId();
  }
  async restore(panels, editors) {
    if (panels) {
      if (typeof this._activePanel === "string") {
        await this._paneCompositeService.openPaneComposite(this._activePanel, 1 /* Panel */);
      } else {
        this._paneCompositeService.hideActivePaneComposite(1 /* Panel */);
      }
    }
    if (editors) {
      for (const group2 of this._editorGroupsService.groups) {
        const previewEditors = [];
        for (const input of group2.editors) {
          const resource = EditorResourceAccessor.getCanonicalUri(input, { supportSideBySide: 1 /* PRIMARY */ });
          if (resource?.scheme === BulkEditPane.Schema) {
            previewEditors.push(input);
          }
        }
        if (previewEditors.length) {
          group2.closeEditors(previewEditors, { preserveFocus: true });
        }
      }
    }
  }
};

UXState = __decorateClass([
  __decorateParam(0, IPaneCompositePartService),
  __decorateParam(1, IEditorGroupsService)
], UXState);

var PreviewSession = class {
  constructor(uxState, cts = new CancellationTokenSource()) {
    this.uxState = uxState;
    this.cts = cts;
  }
};

var BulkEditPreviewContribution = class {
  constructor(_paneCompositeService, _viewsService, _editorGroupsService, _dialogService, bulkEditService, contextKeyService) {
    this._paneCompositeService = _paneCompositeService;
    this._viewsService = _viewsService;
    this._editorGroupsService = _editorGroupsService;
    this._dialogService = _dialogService;
    bulkEditService.setPreviewHandler((edits) => this._previewEdit(edits));
    this._ctxEnabled = BulkEditPreviewContribution.ctxEnabled.bindTo(contextKeyService);
  }
  static {
    this.ID = "workbench.contrib.bulkEditPreview";
  }
  static {
    this.ctxEnabled = new RawContextKey("refactorPreview.enabled", false);
  }
  async _previewEdit(edits) {
    this._ctxEnabled.set(true);
    const uxState = this._activeSession?.uxState ?? new UXState(this._paneCompositeService, this._editorGroupsService);
    const view = await getBulkEditPane(this._viewsService);
    if (!view) {
      this._ctxEnabled.set(false);
      return edits;
    }
    if (view.hasInput()) {
      const { confirmed } = await this._dialogService.confirm({
        type: severity_default.Info,
        message: localize(8338, null),
        detail: localize(8334, null),
        primaryButton: localize(8333, null)
      });
      if (!confirmed) {
        return [];
      }
    }
    let session;
    if (this._activeSession) {
      await this._activeSession.uxState.restore(false, true);
      this._activeSession.cts.dispose(true);
      session = new PreviewSession(uxState);
    } else {
      session = new PreviewSession(uxState);
    }
    this._activeSession = session;
    try {
      return await view.setInput(edits, session.cts.token) ?? [];
    } finally {
      if (this._activeSession === session) {
        await this._activeSession.uxState.restore(true, true);
        this._activeSession.cts.dispose();
        this._ctxEnabled.set(false);
        this._activeSession = void 0;
      }
    }
  }
};

BulkEditPreviewContribution = __decorateClass([
  __decorateParam(0, IPaneCompositePartService),
  __decorateParam(1, IViewsService),
  __decorateParam(2, IEditorGroupsService),
  __decorateParam(3, IDialogService),
  __decorateParam(4, IBulkEditService),
  __decorateParam(5, IContextKeyService)
], BulkEditPreviewContribution);

registerAction2(class ApplyAction extends Action2 {
  constructor() {
    super({
      id: "refactorPreview.apply",
      title: localize2(8331, "Apply Refactoring"),
      category: localize2(8332, "Refactor Preview"),
      icon: Codicon.check,
      precondition: ContextKeyExpr.and(BulkEditPreviewContribution.ctxEnabled, BulkEditPane.ctxHasCheckedChanges),
      menu: [{
        id: MenuId.BulkEditContext,
        order: 1
      }],
      keybinding: {
        weight: 100 /* EditorContrib */ - 10,
        when: ContextKeyExpr.and(BulkEditPreviewContribution.ctxEnabled, FocusedViewContext.isEqualTo(BulkEditPane.ID)),
        primary: 2048 /* CtrlCmd */ + 3 /* Enter */
      }
    });
  }
  async run(accessor) {
    const viewsService = accessor.get(IViewsService);
    const view = await getBulkEditPane(viewsService);
    view?.accept();
  }
});

registerAction2(class DiscardAction2 extends Action2 {
  constructor() {
    super({
      id: "refactorPreview.discard",
      title: localize2(8335, "Discard Refactoring"),
      category: localize2(8332, "Refactor Preview"),
      icon: Codicon.clearAll,
      precondition: BulkEditPreviewContribution.ctxEnabled,
      menu: [{
        id: MenuId.BulkEditContext,
        order: 2
      }]
    });
  }
  async run(accessor) {
    const viewsService = accessor.get(IViewsService);
    const view = await getBulkEditPane(viewsService);
    view?.discard();
  }
});

registerAction2(class ToggleAction extends Action2 {
  constructor() {
    super({
      id: "refactorPreview.toggleCheckedState",
      title: localize2(8341, "Toggle Change"),
      category: localize2(8332, "Refactor Preview"),
      precondition: BulkEditPreviewContribution.ctxEnabled,
      keybinding: {
        weight: 200 /* WorkbenchContrib */,
        when: WorkbenchListFocusContextKey,
        primary: 10 /* Space */
      },
      menu: {
        id: MenuId.BulkEditContext,
        group: "navigation"
      }
    });
  }
  async run(accessor) {
    const viewsService = accessor.get(IViewsService);
    const view = await getBulkEditPane(viewsService);
    view?.toggleChecked();
  }
});

registerAction2(class GroupByFile extends Action2 {
  constructor() {
    super({
      id: "refactorPreview.groupByFile",
      title: localize2(8336, "Group Changes By File"),
      category: localize2(8332, "Refactor Preview"),
      icon: Codicon.ungroupByRefType,
      precondition: ContextKeyExpr.and(BulkEditPane.ctxHasCategories, BulkEditPane.ctxGroupByFile.negate(), BulkEditPreviewContribution.ctxEnabled),
      menu: [{
        id: MenuId.BulkEditTitle,
        when: ContextKeyExpr.and(BulkEditPane.ctxHasCategories, BulkEditPane.ctxGroupByFile.negate()),
        group: "navigation",
        order: 3
      }]
    });
  }
  async run(accessor) {
    const viewsService = accessor.get(IViewsService);
    const view = await getBulkEditPane(viewsService);
    view?.groupByFile();
  }
});

registerAction2(class GroupByType extends Action2 {
  constructor() {
    super({
      id: "refactorPreview.groupByType",
      title: localize2(8337, "Group Changes By Type"),
      category: localize2(8332, "Refactor Preview"),
      icon: Codicon.groupByRefType,
      precondition: ContextKeyExpr.and(BulkEditPane.ctxHasCategories, BulkEditPane.ctxGroupByFile, BulkEditPreviewContribution.ctxEnabled),
      menu: [{
        id: MenuId.BulkEditTitle,
        when: ContextKeyExpr.and(BulkEditPane.ctxHasCategories, BulkEditPane.ctxGroupByFile),
        group: "navigation",
        order: 3
      }]
    });
  }
  async run(accessor) {
    const viewsService = accessor.get(IViewsService);
    const view = await getBulkEditPane(viewsService);
    view?.groupByType();
  }
});

registerAction2(class ToggleGrouping extends Action2 {
  constructor() {
    super({
      id: "refactorPreview.toggleGrouping",
      title: localize2(8337, "Group Changes By Type"),
      category: localize2(8332, "Refactor Preview"),
      icon: Codicon.listTree,
      toggled: BulkEditPane.ctxGroupByFile.negate(),
      precondition: ContextKeyExpr.and(BulkEditPane.ctxHasCategories, BulkEditPreviewContribution.ctxEnabled),
      menu: [{
        id: MenuId.BulkEditContext,
        order: 3
      }]
    });
  }
  async run(accessor) {
    const viewsService = accessor.get(IViewsService);
    const view = await getBulkEditPane(viewsService);
    view?.toggleGrouping();
  }
});

registerWorkbenchContribution2(
  BulkEditPreviewContribution.ID,
  BulkEditPreviewContribution,
  WorkbenchPhase.BlockRestore
);

var refactorPreviewViewIcon = registerIcon("refactor-preview-view-icon", Codicon.lightbulb, localize(8340, null));

var container2 = Registry.as(Extensions13.ViewContainersRegistry).registerViewContainer({
  id: BulkEditPane.ID,
  title: localize2(8339, "Refactor Preview"),
  hideIfEmpty: true,
  ctorDescriptor: new SyncDescriptor(
    ViewPaneContainer,
    [BulkEditPane.ID, { mergeViewWithContainerWhenSingleView: true }]
  ),
  icon: refactorPreviewViewIcon,
  storageId: BulkEditPane.ID
}, 1 /* Panel */);

Registry.as(Extensions13.ViewsRegistry).registerViews([{
  id: BulkEditPane.ID,
  name: localize2(8339, "Refactor Preview"),
  when: BulkEditPreviewContribution.ctxEnabled,
  ctorDescriptor: new SyncDescriptor(BulkEditPane),
  containerIcon: refactorPreviewViewIcon
}], container2);
export { getBulkEditPane, UXState, PreviewSession, BulkEditPreviewContribution, refactorPreviewViewIcon, container2 };
