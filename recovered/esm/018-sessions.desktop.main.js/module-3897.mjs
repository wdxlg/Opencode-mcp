// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/layout/browser/singlePane/singlePaneQuickChatStrategy.ts
import { SinglePaneLayoutStrategy } from "./module-3893.mjs";
import { autorun } from "./module-0052.mjs";
import { isMainPartEmpty } from "./module-3892.mjs";
import { mainWindow } from "./module-0002.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ISessionsService } from "./module-1783.mjs";
import { IAgentWorkbenchLayoutService } from "./module-3474.mjs";
import { IEditorGroupsService } from "./module-0934.mjs";
import { IEditorService } from "./module-0935.mjs";


// src/vs/sessions/contrib/layout/browser/singlePane/singlePaneQuickChatStrategy.ts
var SinglePaneQuickChatStrategy = class extends SinglePaneLayoutStrategy {
  constructor(ctx, _detailPanel, _visibilityStore, _sessionsService, _layoutService, _editorGroupsService, _editorService) {
    super(ctx);
    this._detailPanel = _detailPanel;
    this._visibilityStore = _visibilityStore;
    this._sessionsService = _sessionsService;
    this._layoutService = _layoutService;
    this._editorGroupsService = _editorGroupsService;
    this._editorService = _editorService;
    this._changingVisibility = false;
    this._register(autorun((reader) => {
      const activeSession = this._sessionsService.activeSession.read(reader);
      if (!activeSession || !(activeSession.isQuickChat?.read(reader) ?? false)) {
        this._activeQuickChatKey = void 0;
        this._pendingEditorRestoreKey = void 0;
        return;
      }
      const sessionKey = activeSession.resource.toString();
      const multipleSessionsVisible = this._ctx.multipleSessionsVisibleObs.read(reader);
      if (this._activeQuickChatKey !== sessionKey) {
        this._activeQuickChatKey = sessionKey;
        const hasSavedWorkingSet = this._ctx.hasSavedWorkingSet(activeSession.resource);
        this._pendingEditorRestoreKey = !multipleSessionsVisible && hasSavedWorkingSet ? sessionKey : void 0;
        if (!multipleSessionsVisible) {
          if (hasSavedWorkingSet) {
            this._applySharedVisibility();
          } else {
            this._hideSidePaneTransiently();
          }
        }
        this._detailPanel.sync(0 /* Hidden */);
      }
    }));
    this._register(this._ctx.onDidEndSessionLayoutRestore(() => {
      const activeSession = this._sessionsService.activeSession.get();
      const sessionKey = activeSession?.resource.toString();
      if (!activeSession || !(activeSession.isQuickChat?.get() ?? false) || this._ctx.multipleSessionsVisibleObs.get() || this._pendingEditorRestoreKey !== sessionKey) {
        return;
      }
      this._pendingEditorRestoreKey = void 0;
      if (isMainPartEmpty(this._editorGroupsService)) {
        this._hideSidePaneTransiently();
        return;
      }
      this._applySharedVisibility();
    }));
    this._register(this._layoutService.onDidChangePartVisibility((e4) => {
      if (e4.partId !== "workbench.parts.editor" /* EDITOR_PART */ && e4.partId !== "workbench.parts.auxiliarybar" /* AUXILIARYBAR_PART */) {
        return;
      }
      this._captureSharedVisibility();
    }));
    this._register(this._editorService.onDidEditorsChange(() => this._captureSharedVisibility()));
  }
  _captureSharedVisibility() {
    if (this._changingVisibility || this._ctx.isRestoringSessionLayout || this._ctx.multipleSessionsVisibleObs.get() || this._layoutService.isEditorMaximized() || this._layoutService.isVisible("workbench.parts.customViewGrid" /* CUSTOM_VIEW_GRID_PART */) || isMainPartEmpty(this._editorGroupsService)) {
      return;
    }
    const activeSession = this._sessionsService.activeSession.get();
    if (!activeSession || !(activeSession.isQuickChat?.get() ?? false)) {
      return;
    }
    this._visibilityStore.set(1 /* Existing */, {
      editorVisible: this._layoutService.isVisible("workbench.parts.editor" /* EDITOR_PART */, mainWindow),
      auxiliaryBarVisible: false
    });
  }
  _hideSidePaneTransiently() {
    this._changingVisibility = true;
    try {
      this._layoutService.hideSidePane();
    } finally {
      this._changingVisibility = false;
    }
  }
  _applySharedVisibility() {
    const sharedState = this._visibilityStore.get(1 /* Existing */);
    const sidePaneVisible = sharedState.editorVisible || sharedState.auxiliaryBarVisible;
    const suppression = this._layoutService.suppressEditorPartAutoVisibility();
    this._changingVisibility = true;
    try {
      if (this._layoutService.isVisible("workbench.parts.auxiliarybar" /* AUXILIARYBAR_PART */)) {
        this._layoutService.setPartHidden(true, "workbench.parts.auxiliarybar" /* AUXILIARYBAR_PART */);
      }
      if (sidePaneVisible !== this._layoutService.isVisible("workbench.parts.editor" /* EDITOR_PART */, mainWindow)) {
        this._layoutService.setPartHidden(!sidePaneVisible, "workbench.parts.editor" /* EDITOR_PART */);
      }
    } finally {
      this._changingVisibility = false;
      suppression.dispose();
    }
  }
};

SinglePaneQuickChatStrategy = __decorateClass([
  __decorateParam(3, ISessionsService),
  __decorateParam(4, IAgentWorkbenchLayoutService),
  __decorateParam(5, IEditorGroupsService),
  __decorateParam(6, IEditorService)
], SinglePaneQuickChatStrategy);
export { SinglePaneQuickChatStrategy };
