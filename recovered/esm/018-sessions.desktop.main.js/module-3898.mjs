// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/layout/browser/singlePaneLayoutController.ts
import { BaseLayoutController } from "./module-3887.mjs";
import { SinglePaneVisibilityProfileStore } from "./module-3895.mjs";
import { SinglePaneDetailPanelCoordinator } from "./module-3890.mjs";
import { SinglePaneExistingSessionStrategy } from "./module-3896.mjs";
import { SinglePaneNewSessionStrategy } from "./module-3894.mjs";
import { SinglePaneQuickChatStrategy } from "./module-3897.mjs";
import { SinglePaneDockedTabsCoordinator } from "./module-3891.mjs";


// src/vs/sessions/contrib/layout/browser/singlePaneLayoutController.ts
var SINGLE_PANE_LAYOUT_STATE_KEY = "sessions.singlePane.layoutState";

var SinglePaneLayoutController = class extends BaseLayoutController {
  get _layoutStateStorageKey() {
    return SINGLE_PANE_LAYOUT_STATE_KEY;
  }
  get _legacyWorkingSetsStorageKey() {
    return void 0;
  }
  get _ctx() {
    if (!this._context) {
      const that = this;
      this._context = {
        get isRestoringSessionLayout() {
          return that._isRestoringSessionLayout;
        },
        withSessionLayoutRestore: (work) => that._withSessionLayoutRestore(work),
        onDidEndSessionLayoutRestore: that.onDidEndSessionLayoutRestore,
        get togglingSidePane() {
          return that._togglingSidePane;
        },
        get multipleSessionsVisibleObs() {
          return that.multipleSessionsVisibleObs;
        },
        get activeSessionResourceObs() {
          return that.activeSessionResourceObs;
        },
        hasSavedWorkingSet: (sessionResource) => that._workingSets.has(sessionResource)
      };
    }
    return this._context;
  }
  // --- Side-pane visibility + detail content + Toggle Details ---
  _registerViewStateManagement() {
    const visibilityStore = this._instantiationService.createInstance(SinglePaneVisibilityProfileStore);
    const detailPanel = this._register(this._instantiationService.createInstance(SinglePaneDetailPanelCoordinator));
    this._existingSession = this._register(this._instantiationService.createInstance(SinglePaneExistingSessionStrategy, this._ctx, visibilityStore, detailPanel));
    this._register(this._instantiationService.createInstance(SinglePaneNewSessionStrategy, this._ctx, detailPanel));
    this._register(this._instantiationService.createInstance(SinglePaneQuickChatStrategy, this._ctx, detailPanel, visibilityStore));
  }
  // --- Managed tabs + editor-area collapse (deferred to Restored so they reconcile on top of the restored group) ---
  _registerAuxiliaryControllers() {
    this._lifecycleService.when(3 /* Restored */).then(() => {
      if (this._store.isDisposed) {
        return;
      }
      this._managedTabs = this._register(this._instantiationService.createInstance(SinglePaneDockedTabsCoordinator, this._ctx));
      this._existingSession?.registerManagedTabs(this._managedTabs);
    });
  }
  /** Toggle the detail panel and return whether it is now visible. */
  toggleDetails() {
    return this._existingSession?.toggleDetails() ?? false;
  }
  // --- Base hooks ---
  /**
   * A session-switch restore closes/opens the docked editors (empty working-set
   * apply, managed-tab reconciliation), so suppress editor-part auto-visibility
   * for the whole restore to avoid closing the side pane or mistaking a
   * layout-driven close for a user dismissing a managed tab.
   */
  _suppressEditorVisibilityDuringRestore() {
    return this._layoutService.suppressEditorPartAutoVisibility();
  }
  get _isEditorPartVisibilityPerSession() {
    return false;
  }
  get _isViewStatePerSession() {
    return false;
  }
  /**
   * Governs the panel at the workbench level (like the side pane). Flipping this
   * single gate off makes the base remember the panel's *view* per session instead
   * (defaulting to the Terminal).
   */
  get _isPanelVisibilityPerSession() {
    return false;
  }
  _shouldRevealEditorPartOnApply(_editorPartHidden, _isModal) {
    return false;
  }
  _shouldHideEditorPartOnApply(_editorPartHidden) {
    return false;
  }
  _onWillApplyWorkingSet(workingSet) {
    this._managedTabs?.prepareWorkingSetRestore(workingSet !== "empty");
  }
};
export { SINGLE_PANE_LAYOUT_STATE_KEY, SinglePaneLayoutController };
