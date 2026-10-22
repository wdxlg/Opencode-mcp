// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/layout/browser/singlePane/singlePaneNewSessionStrategy.ts
import { SinglePaneLayoutStrategy } from "./module-3893.mjs";
import { observableSignalFromEvent } from "./module-0062.mjs";
import { Event2 } from "./module-0017.mjs";
import { EmptyFileEditorInput } from "./module-3767.mjs";
import { isChangesEditorInput, isEditorWithoutDockedDetails, isFileEditorInput, isMainPartEmpty } from "./module-3892.mjs";
import { mainWindow } from "./module-0002.mjs";
import { autorun } from "./module-0052.mjs";
import { onUnexpectedError } from "./module-0004.mjs";
import { observableFromEvent } from "./module-0057.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IAgentWorkbenchLayoutService } from "./module-3474.mjs";
import { ISessionsService } from "./module-1783.mjs";
import { IEditorService } from "./module-0935.mjs";
import { IEditorGroupsService } from "./module-0934.mjs";
import { ISessionChangesService } from "./module-3646.mjs";
import { IInstantiationService } from "./module-0077.mjs";


// src/vs/sessions/contrib/layout/browser/singlePane/singlePaneNewSessionStrategy.ts
var SinglePaneNewSessionStrategy = class extends SinglePaneLayoutStrategy {
  constructor(ctx, _detailPanel, _layoutService, _sessionsService, _editorService, _editorGroupsService, _sessionChangesService, _instantiationService) {
    super(ctx);
    this._detailPanel = _detailPanel;
    this._layoutService = _layoutService;
    this._sessionsService = _sessionsService;
    this._editorService = _editorService;
    this._editorGroupsService = _editorGroupsService;
    this._sessionChangesService = _sessionChangesService;
    this._instantiationService = _instantiationService;
    this._detailHiddenTransiently = false;
    this._detailHiddenByEditor = false;
    this._registerEntryEditorHide();
    this._registerSidePaneOpenEditorHide();
    this._registerEmptyFilesCloseFallback();
    this._registerDetailPanel();
  }
  // --- Editor visibility ---------------------------------------------------------------
  _registerEntryEditorHide() {
    const editorSetChanged = observableSignalFromEvent(
      this,
      Event2.any(
        this._editorService.onDidActiveEditorChange,
        this._editorService.onDidEditorsChange,
        this._editorService.onDidCloseEditor,
        this._ctx.onDidEndSessionLayoutRestore
      )
    );
    let activeNewSessionKey;
    this._register(
      this._editorService.onWillOpenEditor((event) => {
        if (!this._getActiveNewSessionKey()) {
          return;
        }
        if (!(event.editor instanceof EmptyFileEditorInput)) {
          this._pendingEntryHideSessionKey = void 0;
        }
      })
    );
    const applyPendingEntry = () => {
      const pendingSessionKey = this._pendingEntryHideSessionKey;
      if (!pendingSessionKey || this._ctx.isRestoringSessionLayout) {
        return;
      }
      if (this._getActiveNewSessionKey() !== pendingSessionKey) {
        this._pendingEntryHideSessionKey = void 0;
        return;
      }
      const editors = this._getMainPartEditors();
      if (editors.length === 0) {
        return;
      }
      if (!editors.every((editor) => editor instanceof EmptyFileEditorInput || isChangesEditorInput(editor, this._sessionChangesService))) {
        return;
      }
      this._pendingEntryHideSessionKey = void 0;
      if (!this._layoutService.isVisible("workbench.parts.editor" /* EDITOR_PART */, mainWindow)) {
        return;
      }
      const suppression = this._layoutService.suppressEditorPartAutoVisibility();
      try {
        this._layoutService.setPartHidden(true, "workbench.parts.editor" /* EDITOR_PART */);
      } finally {
        suppression.dispose();
      }
    };
    this._register(
      autorun((reader) => {
        editorSetChanged.read(reader);
        const sessionKey = this._readActiveNewSessionKey(reader);
        if (!sessionKey) {
          activeNewSessionKey = void 0;
          this._pendingEntryHideSessionKey = void 0;
          return;
        }
        if (activeNewSessionKey !== sessionKey) {
          activeNewSessionKey = sessionKey;
          this._pendingSidePaneOpenHideSessionKey = void 0;
          this._pendingEntryHideSessionKey = sessionKey;
        }
        applyPendingEntry();
      })
    );
  }
  _registerSidePaneOpenEditorHide() {
    const applyPendingSidePaneOpen = () => {
      const pendingSessionKey = this._pendingSidePaneOpenHideSessionKey;
      if (!pendingSessionKey || this._ctx.isRestoringSessionLayout) {
        return;
      }
      if (this._getActiveNewSessionKey() !== pendingSessionKey) {
        this._pendingSidePaneOpenHideSessionKey = void 0;
        return;
      }
      const editors = this._getMainPartEditors();
      if (editors.length === 0) {
        return;
      }
      this._pendingSidePaneOpenHideSessionKey = void 0;
      if (!editors.every((editor) => editor instanceof EmptyFileEditorInput || isChangesEditorInput(editor, this._sessionChangesService))) {
        return;
      }
      const suppression = this._layoutService.suppressEditorPartAutoVisibility();
      try {
        if (!this._layoutService.isVisible("workbench.parts.auxiliarybar" /* AUXILIARYBAR_PART */)) {
          this._layoutService.setPartHidden(false, "workbench.parts.auxiliarybar" /* AUXILIARYBAR_PART */);
        }
        if (this._layoutService.isVisible("workbench.parts.editor" /* EDITOR_PART */, mainWindow)) {
          this._layoutService.setPartHidden(true, "workbench.parts.editor" /* EDITOR_PART */);
        }
      } finally {
        suppression.dispose();
      }
    };
    this._register(
      this._editorService.onWillOpenEditor((event) => {
        if (!this._getActiveNewSessionKey()) {
          return;
        }
        if (!(event.editor instanceof EmptyFileEditorInput)) {
          this._pendingSidePaneOpenHideSessionKey = void 0;
        }
      })
    );
    this._register(
      Event2.any(
        this._editorService.onDidActiveEditorChange,
        this._editorService.onDidEditorsChange,
        this._editorService.onDidCloseEditor,
        this._ctx.onDidEndSessionLayoutRestore
      )(applyPendingSidePaneOpen)
    );
    this._register(
      this._layoutService.onDidToggleSidePane(({ before, after: after2 }) => {
        const sessionKey = this._getActiveNewSessionKey();
        if (!sessionKey) {
          return;
        }
        const opened = !before.editor && !before.auxiliaryBar && (after2.editor || after2.auxiliaryBar);
        if (!opened) {
          this._pendingSidePaneOpenHideSessionKey = void 0;
          return;
        }
        this._pendingEntryHideSessionKey = void 0;
        this._pendingSidePaneOpenHideSessionKey = sessionKey;
        applyPendingSidePaneOpen();
      })
    );
    this._register(
      autorun((reader) => {
        const activeSessionKey = this._readActiveNewSessionKey(reader);
        if (this._pendingSidePaneOpenHideSessionKey && this._pendingSidePaneOpenHideSessionKey !== activeSessionKey) {
          this._pendingSidePaneOpenHideSessionKey = void 0;
        }
      })
    );
  }
  _registerEmptyFilesCloseFallback() {
    this._register(
      this._editorService.onDidCloseEditor((event) => {
        const sessionKey = this._getActiveNewSessionKey();
        if (!sessionKey || this._ctx.multipleSessionsVisibleObs.get() || this._ctx.isRestoringSessionLayout || this._layoutService.isEditorPartAutoVisibilitySuppressed() || !isMainPartEmpty(this._editorGroupsService)) {
          return;
        }
        this._pendingEntryHideSessionKey = void 0;
        this._pendingSidePaneOpenHideSessionKey = void 0;
        if (event.editor instanceof EmptyFileEditorInput) {
          this._hideSidePane();
          return;
        }
        const group2 = this._editorGroupsService.mainPart.getGroup(
          event.groupId
        );
        if (!group2) {
          return;
        }
        const suppression = this._layoutService.suppressEditorPartAutoVisibility();
        void this._openEmptyFiles(
          group2,
          sessionKey,
          this._layoutService.isVisible("workbench.parts.editor" /* EDITOR_PART */, mainWindow)
        ).finally(() => suppression.dispose()).catch(onUnexpectedError);
      })
    );
  }
  _hideSidePane() {
    this._layoutService.hideSidePane();
  }
  async _openEmptyFiles(group2, sessionKey, editorVisible) {
    const session = this._sessionsService.activeSession.get();
    const workspace = session?.workspace.get();
    if (!session || this._getActiveNewSessionKey() !== sessionKey || !workspace || !isMainPartEmpty(this._editorGroupsService)) {
      return;
    }
    await this._editorService.openEditor(
      this._instantiationService.createInstance(
        EmptyFileEditorInput,
        workspace
      ),
      {
        pinned: true,
        inactive: true,
        preserveFocus: true,
        activation: 3 /* PRESERVE */,
        isExplicit: false
      },
      group2
    );
    if (this._getActiveNewSessionKey() !== sessionKey) {
      return;
    }
    if (this._layoutService.isVisible("workbench.parts.editor" /* EDITOR_PART */, mainWindow) !== editorVisible) {
      this._layoutService.setPartHidden(!editorVisible, "workbench.parts.editor" /* EDITOR_PART */);
    }
    if (!this._layoutService.isVisible("workbench.parts.auxiliarybar" /* AUXILIARYBAR_PART */)) {
      this._layoutService.setPartHidden(false, "workbench.parts.auxiliarybar" /* AUXILIARYBAR_PART */);
    }
    this._detailPanel.sync(5 /* FilesForced */);
  }
  _getMainPartEditors() {
    return this._editorGroupsService.mainPart.groups.flatMap((group2) => [
      ...group2.editors
    ]);
  }
  _getActiveNewSessionKey() {
    const session = this._sessionsService.activeSession.get();
    if (!session || session.isCreated.get() || session.isQuickChat?.get() || !session.workspace.get() || this._ctx.multipleSessionsVisibleObs.get()) {
      return void 0;
    }
    return session.resource.toString();
  }
  _readActiveNewSessionKey(reader) {
    const session = this._sessionsService.activeSession.read(reader);
    if (!session || session.isCreated.read(reader) || (session.isQuickChat?.read(reader) ?? false) || !session.workspace.read(reader) || this._ctx.multipleSessionsVisibleObs.read(reader)) {
      return void 0;
    }
    return session.resource.toString();
  }
  // --- Detail panel ----------------------------------------------------------------------
  _registerDetailPanel() {
    const activeEditorObs = observableFromEvent(
      this,
      this._editorService.onDidActiveEditorChange,
      () => this._editorService.activeEditor
    );
    const editorPartVisibleObs = observableFromEvent(
      this,
      this._layoutService.onDidChangePartVisibility,
      () => this._layoutService.isVisible("workbench.parts.editor" /* EDITOR_PART */, mainWindow)
    );
    const editorMaximizedObs = observableFromEvent(
      this,
      this._layoutService.onDidChangeEditorMaximized,
      () => this._layoutService.isEditorMaximized()
    );
    this._register(
      autorun((reader) => {
        const activeSession = this._sessionsService.activeSession.read(reader);
        if (!activeSession) {
          return;
        }
        const isQuickChat2 = activeSession.isQuickChat?.read(reader) ?? false;
        const workspace = activeSession.workspace.read(reader);
        if (isQuickChat2 || !workspace || activeSession.isCreated.read(reader)) {
          return;
        }
        const activeEditor = activeEditorObs.read(reader);
        const target = this._computeTarget(
          reader,
          activeEditor,
          editorMaximizedObs,
          editorPartVisibleObs
        );
        const revealOnly = this._ctx.multipleSessionsVisibleObs.read(reader);
        this._syncDetailVisibility(target, revealOnly);
        this._detailPanel.sync(target);
      })
    );
    this._register(
      this._layoutService.onDidChangePartVisibility((event) => {
        if (event.partId === "workbench.parts.auxiliarybar" /* AUXILIARYBAR_PART */ && event.source !== "resize") {
          this._detailHiddenTransiently = false;
          this._detailHiddenByEditor = false;
        }
      })
    );
  }
  _syncDetailVisibility(target, revealOnly) {
    if (this._ctx.isRestoringSessionLayout || target === 6 /* Preserve */) {
      return;
    }
    const detailVisible = this._layoutService.isVisible(
      "workbench.parts.auxiliarybar" /* AUXILIARYBAR_PART */
    );
    if (target === 0 /* Hidden */ || target === 1 /* EditorHidden */) {
      if ((target === 1 /* EditorHidden */ || !revealOnly) && detailVisible) {
        this._detailHiddenTransiently = true;
        this._detailHiddenByEditor = target === 1 /* EditorHidden */;
        this._layoutService.setAuxiliaryBarHiddenForResize(true);
      }
      return;
    }
    if (!this._detailHiddenTransiently || revealOnly && !this._detailHiddenByEditor || !this._layoutService.isVisible("workbench.parts.editor" /* EDITOR_PART */, mainWindow)) {
      return;
    }
    this._detailHiddenTransiently = false;
    this._detailHiddenByEditor = false;
    this._layoutService.setAuxiliaryBarHiddenForResize(false);
  }
  _computeTarget(reader, activeEditor, editorMaximizedObs, editorPartVisibleObs) {
    if (activeEditor && isEditorWithoutDockedDetails(activeEditor)) {
      return editorPartVisibleObs.read(reader) ? 1 /* EditorHidden */ : 4 /* Files */;
    }
    if (editorMaximizedObs.read(reader)) {
      return 2 /* Changes */;
    }
    if (!activeEditor) {
      return 4 /* Files */;
    }
    if (isChangesEditorInput(activeEditor, this._sessionChangesService)) {
      return 3 /* ChangesForced */;
    }
    if (isFileEditorInput(activeEditor)) {
      return 5 /* FilesForced */;
    }
    return 6 /* Preserve */;
  }
};

SinglePaneNewSessionStrategy = __decorateClass([
  __decorateParam(2, IAgentWorkbenchLayoutService),
  __decorateParam(3, ISessionsService),
  __decorateParam(4, IEditorService),
  __decorateParam(5, IEditorGroupsService),
  __decorateParam(6, ISessionChangesService),
  __decorateParam(7, IInstantiationService)
], SinglePaneNewSessionStrategy);
export { SinglePaneNewSessionStrategy };
