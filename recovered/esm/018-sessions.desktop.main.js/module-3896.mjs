// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/layout/browser/singlePane/singlePaneExistingSessionStrategy.ts
import { SinglePaneLayoutStrategy } from "./module-3893.mjs";
import { isChangesEditorInput, isEditorWithoutDockedDetails, isFileEditorInput, isMainPartEmpty } from "./module-3892.mjs";
import { autorun } from "./module-0052.mjs";
import { isEqual2 } from "./module-0034.mjs";
import { mainWindow } from "./module-0002.mjs";
import { observableFromEvent } from "./module-0057.mjs";
import { Event2 } from "./module-0017.mjs";
import { Action2, registerAction2 } from "./module-0092.mjs";
import { localize2 } from "./module-0001.mjs";
import { Codicon } from "./module-0085.mjs";
import { AuxiliaryBarVisibleContext, IsAuxiliaryWindowContext, IsSessionsWindowContext, IsTopRightEditorGroupContext, MainEditorAreaVisibleContext } from "./module-0950.mjs";
import { ContextKeyExpr } from "./module-0089.mjs";
import { HasDockedDetailsContext, SinglePaneLayoutEnabledContext } from "./module-1770.mjs";
import { Menus } from "./module-3437.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IAgentWorkbenchLayoutService } from "./module-3474.mjs";
import { ISessionsService } from "./module-1783.mjs";
import { IEditorService } from "./module-0935.mjs";
import { IEditorGroupsService } from "./module-0934.mjs";
import { ISessionChangesService } from "./module-3646.mjs";


// src/vs/sessions/contrib/layout/browser/singlePane/singlePaneExistingSessionStrategy.ts
var TOGGLE_DETAILS_COMMAND_ID = "workbench.action.agentSessions.toggleDetails";

var singlePaneHeaderToggleDetailsOrder = 10;

var SinglePaneExistingSessionStrategy = class extends SinglePaneLayoutStrategy {
  constructor(ctx, _visibilityStore, _detailPanel, _layoutService, _sessionsService, _editorService, _editorGroupsService, _sessionChangesService) {
    super(ctx);
    this._visibilityStore = _visibilityStore;
    this._detailPanel = _detailPanel;
    this._layoutService = _layoutService;
    this._sessionsService = _sessionsService;
    this._editorService = _editorService;
    this._editorGroupsService = _editorGroupsService;
    this._sessionChangesService = _sessionChangesService;
    this._detailHiddenTransiently = false;
    this._detailHiddenByEditor = false;
    this._changingDetailTransiently = false;
    this._registerVisibility();
    this._registerEmptyGroupClose();
    this._registerDetailPanel();
    this._register(this._registerToggleDetailsAction());
  }
  /** Toggle the detail panel and return whether it is now visible. */
  toggleDetails() {
    const nowVisible = !this._layoutService.isVisible("workbench.parts.auxiliarybar" /* AUXILIARYBAR_PART */);
    this._layoutService.setPartHidden(!nowVisible, "workbench.parts.auxiliarybar" /* AUXILIARYBAR_PART */);
    return nowVisible;
  }
  _registerEmptyGroupClose() {
    this._register(this._editorService.onDidEditorsChange((event) => {
      if (!event || event.event.kind !== 6 /* EDITOR_CLOSE */) {
        return;
      }
      const session = this._sessionsService.activeSession.get();
      if (this._ctx.isRestoringSessionLayout || this._ctx.multipleSessionsVisibleObs.get() || this._layoutService.isEditorPartAutoVisibilitySuppressed() || !session || session.isQuickChat?.get() || !session.isCreated.get() || !session.workspace.get() || !isMainPartEmpty(this._editorGroupsService)) {
        return;
      }
      this._layoutService.hideSidePane();
    }));
  }
  /**
   * Constructs and owns the shared managed-tabs coordinator, and registers this strategy's
   * "activate Changes on submit" supplement to it. Deferred to `LifecyclePhase.Restored` by
   * the controller (mirrors the original managed-tabs/editor-collapse strategies' timing) so
   * the reconcile pipeline only starts once the workbench's restored editor group exists.
   */
  registerManagedTabs(managedTabs) {
    this._managedTabs = managedTabs;
    this._registerManagedTabsSupplement();
  }
  get managedTabs() {
    if (!this._managedTabs) {
      throw new Error("SinglePaneExistingSessionStrategy: managed tabs accessed before registerManagedTabs()");
    }
    return this._managedTabs;
  }
  // --- Side-pane visibility ------------------------------------------------------------
  _registerVisibility() {
    let initialized = false;
    let wasExistingActive = false;
    let wasQuickChatActive = false;
    let previousIsCreated;
    let previousSession;
    let togglingSidePane = false;
    this._register(autorun((reader) => {
      const multipleSessionsVisible = this._ctx.multipleSessionsVisibleObs.read(reader);
      if (multipleSessionsVisible) {
        const activeSession2 = this._sessionsService.activeSession.read(reader);
        const isQuickChat3 = activeSession2?.isQuickChat?.read(reader) ?? false;
        const workspace = activeSession2?.workspace.read(reader);
        const isCreated2 = activeSession2?.isCreated.read(reader);
        if (activeSession2 && !isQuickChat3 && workspace && isCreated2 === true) {
          this._ctx.withSessionLayoutRestore(() => this._reveal(this._visibilityStore.get(1 /* Existing */)));
        }
        wasExistingActive = false;
        return;
      }
      const activeSession = this._sessionsService.activeSession.read(reader);
      if (!activeSession) {
        return;
      }
      const isQuickChat2 = activeSession.isQuickChat?.read(reader) ?? false;
      if (isQuickChat2) {
        wasQuickChatActive = true;
        wasExistingActive = false;
        return;
      }
      const isCreated = activeSession.isCreated.read(reader);
      const sessionChanged = previousSession !== void 0 && !isEqual2(previousSession.resource, activeSession.resource);
      const isSubmit = !wasQuickChatActive && previousIsCreated === false && isCreated && (previousSession === activeSession || previousSession?.isCreated.read(void 0) === true);
      if (isSubmit) {
        this._captureExistingProfile();
      }
      if (isCreated) {
        if (!isSubmit && (!initialized || !wasExistingActive || wasQuickChatActive || sessionChanged)) {
          this._ctx.withSessionLayoutRestore(() => this._apply(this._visibilityStore.get(1 /* Existing */)));
        }
        wasExistingActive = true;
      } else {
        wasExistingActive = false;
      }
      previousIsCreated = isCreated;
      previousSession = activeSession;
      wasQuickChatActive = false;
      initialized = true;
    }));
    this._register(this._layoutService.onDidChangePartVisibility((e4) => {
      if (e4.partId !== "workbench.parts.editor" /* EDITOR_PART */ && e4.partId !== "workbench.parts.auxiliarybar" /* AUXILIARYBAR_PART */) {
        return;
      }
      if (togglingSidePane || e4.partId === "workbench.parts.auxiliarybar" /* AUXILIARYBAR_PART */ && this._changingDetailTransiently) {
        return;
      }
      this._captureExistingProfileIfApplicable();
    }));
    this._register(this._layoutService.onWillToggleSidePane(() => {
      togglingSidePane = true;
    }));
    this._register(this._layoutService.onDidToggleSidePane(() => {
      try {
        this._captureExistingProfileIfApplicable();
      } finally {
        togglingSidePane = false;
      }
    }));
  }
  _captureExistingProfileIfApplicable() {
    if (this._ctx.isRestoringSessionLayout || this._ctx.multipleSessionsVisibleObs.get()) {
      return;
    }
    const activeSession = this._sessionsService.activeSession.get();
    if (!activeSession || activeSession.isQuickChat?.get() || !activeSession.isCreated.get() || this._layoutService.isEditorMaximized() || this._layoutService.isVisible("workbench.parts.customViewGrid" /* CUSTOM_VIEW_GRID_PART */)) {
      return;
    }
    this._captureExistingProfile();
  }
  /** On submit, seed the Existing profile from the current on-screen composition so the view never jumps. */
  _captureExistingProfile() {
    const state = {
      editorVisible: this._layoutService.isVisible("workbench.parts.editor" /* EDITOR_PART */, mainWindow),
      auxiliaryBarVisible: this._layoutService.isVisible("workbench.parts.auxiliarybar" /* AUXILIARYBAR_PART */)
    };
    this._visibilityStore.set(1 /* Existing */, state);
  }
  _apply(state) {
    const suppression = this._layoutService.suppressEditorPartAutoVisibility();
    try {
      if (!state.editorVisible && this._layoutService.isVisible("workbench.parts.editor" /* EDITOR_PART */, mainWindow)) {
        this._layoutService.setPartHidden(true, "workbench.parts.editor" /* EDITOR_PART */);
      }
      if (!state.auxiliaryBarVisible && this._layoutService.isVisible("workbench.parts.auxiliarybar" /* AUXILIARYBAR_PART */)) {
        this._layoutService.setPartHidden(true, "workbench.parts.auxiliarybar" /* AUXILIARYBAR_PART */);
      }
      if (state.auxiliaryBarVisible && !this._layoutService.isVisible("workbench.parts.auxiliarybar" /* AUXILIARYBAR_PART */)) {
        this._layoutService.setPartHidden(false, "workbench.parts.auxiliarybar" /* AUXILIARYBAR_PART */);
      }
      if (state.editorVisible && !this._layoutService.isVisible("workbench.parts.editor" /* EDITOR_PART */, mainWindow)) {
        this._layoutService.setPartHidden(false, "workbench.parts.editor" /* EDITOR_PART */);
      }
    } finally {
      suppression.dispose();
    }
  }
  _reveal(state) {
    const suppression = this._layoutService.suppressEditorPartAutoVisibility();
    try {
      if (state.auxiliaryBarVisible && !this._layoutService.isVisible("workbench.parts.auxiliarybar" /* AUXILIARYBAR_PART */)) {
        this._layoutService.setPartHidden(false, "workbench.parts.auxiliarybar" /* AUXILIARYBAR_PART */);
      }
      if (state.editorVisible && !this._layoutService.isVisible("workbench.parts.editor" /* EDITOR_PART */, mainWindow)) {
        this._layoutService.setPartHidden(false, "workbench.parts.editor" /* EDITOR_PART */);
      }
    } finally {
      suppression.dispose();
    }
  }
  // --- Detail panel ----------------------------------------------------------------------
  _registerDetailPanel() {
    const activeEditorObs = observableFromEvent(this, this._editorService.onDidActiveEditorChange, () => this._editorService.activeEditor);
    const mainPartEmptyObs = observableFromEvent(this, Event2.any(this._editorService.onDidActiveEditorChange, this._editorService.onDidEditorsChange, this._editorService.onDidCloseEditor), () => isMainPartEmpty(this._editorGroupsService));
    const editorPartVisibleObs = observableFromEvent(this, this._layoutService.onDidChangePartVisibility, () => this._layoutService.isVisible("workbench.parts.editor" /* EDITOR_PART */, mainWindow));
    const editorMaximizedObs = observableFromEvent(this, this._layoutService.onDidChangeEditorMaximized, () => this._layoutService.isEditorMaximized());
    let initialized = false;
    let wasExistingActive = false;
    let activeSessionKey;
    let pendingSessionKey;
    let pendingOutgoingEditor;
    const sync = (reader) => {
      const activeSession = this._sessionsService.activeSession.read(reader);
      if (!activeSession || (activeSession.isQuickChat?.read(reader) ?? false) || !activeSession.workspace.read(reader) || !activeSession.isCreated.read(reader)) {
        wasExistingActive = false;
        return;
      }
      const sessionKey = activeSession.resource.toString();
      const sessionChanged = activeSessionKey !== void 0 && activeSessionKey !== sessionKey;
      if (!wasExistingActive || sessionChanged) {
        activeSessionKey = sessionKey;
        wasExistingActive = true;
        if (initialized) {
          pendingSessionKey = sessionKey;
          pendingOutgoingEditor = this._editorService.activeEditor;
        }
        initialized = true;
      }
      const activeEditor = activeEditorObs.read(reader);
      const mainPartEmpty = mainPartEmptyObs.read(reader);
      const editorMaximized = editorMaximizedObs.read(reader);
      const editorPartVisible = editorPartVisibleObs.read(reader);
      if (pendingSessionKey && activeEditor && activeEditor !== pendingOutgoingEditor) {
        pendingSessionKey = void 0;
        pendingOutgoingEditor = void 0;
      }
      if (pendingSessionKey) {
        return;
      }
      const target = this._computeTarget(activeEditor, mainPartEmpty, editorMaximized, editorPartVisible);
      const revealOnly = this._ctx.multipleSessionsVisibleObs.read(reader);
      this._syncDetailVisibility(target, revealOnly);
      this._detailPanel.sync(target);
    };
    this._register(autorun(sync));
    this._register(this._ctx.onDidEndSessionLayoutRestore(() => {
      const activeSession = this._sessionsService.activeSession.get();
      if (!activeSession || activeSession.resource.toString() !== pendingSessionKey) {
        return;
      }
      pendingSessionKey = void 0;
      pendingOutgoingEditor = void 0;
      sync(void 0);
    }));
    this._register(this._layoutService.onDidChangePartVisibility((event) => {
      if (event.partId === "workbench.parts.auxiliarybar" /* AUXILIARYBAR_PART */ && event.source !== "resize") {
        this._detailHiddenTransiently = false;
        this._detailHiddenByEditor = false;
      }
    }));
  }
  _syncDetailVisibility(target, revealOnly) {
    if (this._ctx.isRestoringSessionLayout || target === 6 /* Preserve */) {
      return;
    }
    const detailVisible = this._layoutService.isVisible("workbench.parts.auxiliarybar" /* AUXILIARYBAR_PART */);
    if (target === 0 /* Hidden */ || target === 1 /* EditorHidden */) {
      if ((target === 1 /* EditorHidden */ || !revealOnly) && detailVisible) {
        this._detailHiddenTransiently = true;
        this._detailHiddenByEditor = target === 1 /* EditorHidden */;
        this._setDetailHiddenTransiently(true);
      }
      return;
    }
    if (!this._detailHiddenTransiently || revealOnly && !this._detailHiddenByEditor || !this._layoutService.isVisible("workbench.parts.editor" /* EDITOR_PART */, mainWindow)) {
      return;
    }
    this._detailHiddenTransiently = false;
    this._detailHiddenByEditor = false;
    this._setDetailHiddenTransiently(false);
  }
  _setDetailHiddenTransiently(hidden) {
    this._changingDetailTransiently = true;
    try {
      this._layoutService.setAuxiliaryBarHiddenForResize(hidden);
    } finally {
      this._changingDetailTransiently = false;
    }
  }
  _computeTarget(activeEditor, mainPartEmpty, editorMaximized, editorPartVisible) {
    if (mainPartEmpty) {
      return this._ctx.isRestoringSessionLayout ? 6 /* Preserve */ : 0 /* Hidden */;
    }
    if (activeEditor && isEditorWithoutDockedDetails(activeEditor)) {
      return editorPartVisible ? 1 /* EditorHidden */ : 2 /* Changes */;
    }
    if (editorMaximized) {
      return 2 /* Changes */;
    }
    if (!activeEditor) {
      return 2 /* Changes */;
    }
    if (isChangesEditorInput(activeEditor, this._sessionChangesService)) {
      return 3 /* ChangesForced */;
    }
    if (isFileEditorInput(activeEditor)) {
      return 5 /* FilesForced */;
    }
    return 6 /* Preserve */;
  }
  // --- Managed-tabs supplement (submit "activate Changes" nuance) ------------------------
  _registerManagedTabsSupplement() {
    let previousSessionKey;
    let previousIsCreated;
    let previousSession;
    let changesActivationPendingForSession;
    this._register(autorun((reader) => {
      const session = this._sessionsService.activeSession.read(reader);
      const isQuickChat2 = session?.isQuickChat?.read(reader) ?? false;
      const isCreated = session && !isQuickChat2 ? session.isCreated.read(reader) : false;
      const sessionKey = session?.resource.toString();
      const isSubmit = !isQuickChat2 && previousIsCreated === false && isCreated && (previousSession === session || previousSession?.isCreated.read(void 0) === true);
      if (isSubmit) {
        changesActivationPendingForSession = sessionKey;
      } else if (sessionKey !== previousSessionKey) {
        changesActivationPendingForSession = void 0;
      }
      if (session && !isQuickChat2 && isCreated) {
        const target = this.managedTabs.readTarget(reader);
        const hasChanges = (session.changes.read(reader).length ?? 0) > 0;
        const ensureChangesActive = changesActivationPendingForSession === sessionKey && hasChanges;
        if (ensureChangesActive) {
          changesActivationPendingForSession = void 0;
        }
        if (isSubmit || ensureChangesActive) {
          this.managedTabs.queueReconcile(target, { openDefaultsIfEmpty: isSubmit, ensureChangesActive });
        }
      }
      previousIsCreated = session && !isQuickChat2 ? isCreated : void 0;
      previousSession = session;
      previousSessionKey = sessionKey;
    }));
  }
  _registerToggleDetailsAction() {
    const that = this;
    return registerAction2(class extends Action2 {
      constructor() {
        super({
          id: TOGGLE_DETAILS_COMMAND_ID,
          title: localize2(4846, "Toggle Details"),
          icon: Codicon.listSelection,
          f1: false,
          toggled: AuxiliaryBarVisibleContext,
          keybinding: {
            weight: 250 /* SessionsContrib */,
            primary: 2048 /* CtrlCmd */ | 512 /* Alt */ | 42 /* KeyL */,
            when: ContextKeyExpr.and(
              IsSessionsWindowContext,
              IsAuxiliaryWindowContext.toNegated(),
              SinglePaneLayoutEnabledContext
            )
          },
          menu: {
            id: Menus.SessionsEditorHeaderLayout,
            group: "navigation",
            order: singlePaneHeaderToggleDetailsOrder,
            // Not every tab type has a detail panel to show/hide (e.g. browser and
            // search tabs), so only surface the toggle for tab types that do.
            when: ContextKeyExpr.and(
              IsSessionsWindowContext,
              IsAuxiliaryWindowContext.toNegated(),
              IsTopRightEditorGroupContext,
              SinglePaneLayoutEnabledContext,
              MainEditorAreaVisibleContext,
              HasDockedDetailsContext
            )
          }
        });
      }
      run() {
        that.toggleDetails();
      }
    });
  }
};

SinglePaneExistingSessionStrategy = __decorateClass([
  __decorateParam(3, IAgentWorkbenchLayoutService),
  __decorateParam(4, ISessionsService),
  __decorateParam(5, IEditorService),
  __decorateParam(6, IEditorGroupsService),
  __decorateParam(7, ISessionChangesService)
], SinglePaneExistingSessionStrategy);
export { TOGGLE_DETAILS_COMMAND_ID, singlePaneHeaderToggleDetailsOrder, SinglePaneExistingSessionStrategy };
