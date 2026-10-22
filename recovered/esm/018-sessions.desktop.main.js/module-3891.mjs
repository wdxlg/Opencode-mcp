// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/layout/browser/singlePane/singlePaneDockedTabsCoordinator.ts
import { Disposable } from "./module-0012.mjs";
import { Sequencer } from "./module-0036.mjs";
import { SinglePaneChangesTabAvailableContext, SinglePaneChangesTabMissingContext, SinglePaneFilesTabAvailableContext, SinglePaneFilesTabMissingContext } from "./module-1770.mjs";
import { autorun } from "./module-0052.mjs";
import { isEqual2 } from "./module-0034.mjs";
import { observableSignalFromEvent } from "./module-0062.mjs";
import { Event2 } from "./module-0017.mjs";
import { EmptyFileEditorInput } from "./module-3767.mjs";
import { onUnexpectedError } from "./module-0004.mjs";
import { mainWindow } from "./module-0002.mjs";
import { SessionChangesEditorInput } from "./module-3586.mjs";
import { DockedEditorInput } from "./module-3585.mjs";
import { EditorResourceAccessor } from "./module-0926.mjs";
import { Schemas } from "./module-0033.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IAgentWorkbenchLayoutService } from "./module-3474.mjs";
import { ISessionsService } from "./module-1783.mjs";
import { IEditorService } from "./module-0935.mjs";
import { IEditorGroupsService } from "./module-0934.mjs";
import { ISessionChangesService } from "./module-3646.mjs";
import { IChangesViewService } from "./module-3645.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { IInstantiationService } from "./module-0077.mjs";


// src/vs/sessions/contrib/layout/browser/singlePane/singlePaneDockedTabsCoordinator.ts
var CHANGES_TAB_OPTIONS = { pinned: true, index: 0, inactive: true, preserveFocus: true, activation: 3 /* PRESERVE */, isExplicit: false };

var CHANGES_TAB_ACTIVE_OPTIONS = { pinned: true, index: 0, preserveFocus: true, isExplicit: false };

var FILES_TAB_OPTIONS = { pinned: true, inactive: true, preserveFocus: true, activation: 3 /* PRESERVE */, isExplicit: false };

function mergeTriggers(a, b) {
  return {
    openDefaultsIfEmpty: a.openDefaultsIfEmpty || b.openDefaultsIfEmpty,
    ensureChanges: a.ensureChanges || b.ensureChanges,
    ensureChangesActive: a.ensureChangesActive || b.ensureChangesActive,
    workingSetRestored: a.workingSetRestored || b.workingSetRestored
  };
}

var SinglePaneDockedTabsCoordinator = class extends Disposable {
  constructor(_ctx, _layoutService, _sessionsService, _editorService, _editorGroupsService, _sessionChangesService, _changesViewService, contextKeyService, _instantiationService) {
    super();
    this._ctx = _ctx;
    this._layoutService = _layoutService;
    this._sessionsService = _sessionsService;
    this._editorService = _editorService;
    this._editorGroupsService = _editorGroupsService;
    this._sessionChangesService = _sessionChangesService;
    this._changesViewService = _changesViewService;
    this._instantiationService = _instantiationService;
    this._sequencer = new Sequencer();
    this._generation = 0;
    this._filesTabDismissed = false;
    this._changingFilesInternally = false;
    this._changesTabMissingContext = SinglePaneChangesTabMissingContext.bindTo(contextKeyService);
    this._filesTabMissingContext = SinglePaneFilesTabMissingContext.bindTo(contextKeyService);
    this._changesTabAvailableContext = SinglePaneChangesTabAvailableContext.bindTo(contextKeyService);
    this._filesTabAvailableContext = SinglePaneFilesTabAvailableContext.bindTo(contextKeyService);
    let previousChangesSessionResource;
    this._register(autorun((reader) => {
      const target = this._readTarget(reader);
      const ensureChanges = !!target.changesSessionResource && (!previousChangesSessionResource || !isEqual2(previousChangesSessionResource, target.changesSessionResource));
      previousChangesSessionResource = target.changesSessionResource;
      if (!target.wantsChangesTab) {
        this._filesTabDismissed = false;
      }
      this.queueReconcile(target, { openDefaultsIfEmpty: true, ensureChanges });
    }));
    this._register(this._layoutService.onDidRevealSidePane(() => {
      this.queueReconcile(this._readTarget(void 0), { openDefaultsIfEmpty: true });
    }));
    const partVisibilityChangedSignal = observableSignalFromEvent(this, this._layoutService.onDidChangePartVisibility);
    const editorsChangedSignal = observableSignalFromEvent(this, Event2.any(this._editorService.onDidActiveEditorChange, this._editorService.onDidEditorsChange));
    this._register(autorun((reader) => {
      partVisibilityChangedSignal.read(reader);
      editorsChangedSignal.read(reader);
      this.queueReconcile(this._readTarget(void 0), {});
    }));
    this._register(this._ctx.onDidEndSessionLayoutRestore(() => {
      const session = this._sessionsService.activeSession.get();
      const target = this._readTarget(void 0);
      const ensureChanges = target.wantsChangesTab && session?.isCreated.get() === false;
      this.queueReconcile(target, { openDefaultsIfEmpty: true, ensureChanges, workingSetRestored: true });
    }));
    this._register(this._editorService.onWillOpenEditor((e4) => {
      if (e4.editor instanceof EmptyFileEditorInput && !this._changingFilesInternally && !this._ctx.isRestoringSessionLayout) {
        this._filesTabDismissed = false;
      }
      if (this._ctx.isRestoringSessionLayout || !this._isWorkspaceFileEditor(e4.editor)) {
        return;
      }
      const group2 = this._editorGroupsService.mainPart.getGroup(e4.groupId);
      if (!group2 || group2.contains(e4.editor)) {
        return;
      }
      void this._sequencer.queue(() => this._removeFilesTab(this._editorGroupsService.mainPart.activeGroup)).catch(onUnexpectedError);
    }));
    this._register(this._editorService.onDidCloseEditor((e4) => {
      if (e4.editor instanceof EmptyFileEditorInput && !this._changingFilesInternally && !this._ctx.isRestoringSessionLayout && !this._layoutService.isEditorPartAutoVisibilitySuppressed() && this._readTarget(void 0).wantsChangesTab) {
        this._filesTabDismissed = true;
      }
    }));
    const editorAreaVisibleObs = observableSignalFromEvent(this, this._layoutService.onDidChangePartVisibility);
    this._register(autorun((reader) => {
      editorAreaVisibleObs.read(reader);
      const visible = this._layoutService.isVisible("workbench.parts.editor" /* EDITOR_PART */, mainWindow);
      if (this._editorAreaVisible === void 0) {
        this._editorAreaVisible = visible;
        return;
      }
      if (visible === this._editorAreaVisible) {
        return;
      }
      this._editorAreaVisible = visible;
      if (this._ctx.isRestoringSessionLayout) {
        return;
      }
      if (visible) {
        void this._sequencer.queue(() => this._restoreCollapsedTabs()).catch(onUnexpectedError);
        return;
      }
      if (this._ctx.togglingSidePane) {
        return;
      }
      if (this._layoutService.isVisible("workbench.parts.auxiliarybar" /* AUXILIARYBAR_PART */)) {
        void this._sequencer.queue(() => this._collapseNonManagedTabs()).catch(onUnexpectedError);
      }
    }));
    this._register(this._ctx.onDidEndSessionLayoutRestore(() => this._queueCollapseIfDetailsOnly()));
    this._register(this._editorService.onDidEditorsChange(() => {
      if (!this._ctx.isRestoringSessionLayout) {
        this._queueCollapseIfDetailsOnly();
      }
    }));
  }
  /** The resource this managed Changes editor input shows, if it is one. */
  getChangesEditorResource(editor) {
    const resource = editor.resource;
    return resource && this._sessionChangesService.getSessionResource(resource) ? resource : void 0;
  }
  prepareWorkingSetRestore(hasSavedWorkingSet) {
    const sessionKey = this._sessionsService.activeSession.get()?.resource.toString();
    this._preserveMissingFilesForSessionKey = hasSavedWorkingSet && this._filesTabDismissed ? sessionKey : void 0;
  }
  // --- Trigger plumbing (called by the New/Existing lifecycle strategies) -----------------
  /** Reads the current managed-tabs target for the active session (or for `reader`'s transaction, if given). */
  readTarget(reader) {
    return this._readTarget(reader);
  }
  /** Queues a reconcile for the active session, merging `trigger` with any not-yet-applied pending intents for that session. */
  queueReconcile(target, trigger) {
    const sessionKey = this._sessionsService.activeSession.get()?.resource.toString();
    const mergedTrigger = this._pending && this._pending.sessionKey === sessionKey ? mergeTriggers(this._pending.trigger, trigger) : trigger;
    this._pending = { sessionKey, target, trigger: mergedTrigger };
    const generation = ++this._generation;
    void this._sequencer.queue(() => this._reconcile(generation)).catch(onUnexpectedError);
  }
  _readTarget(reader) {
    const read = (obs) => reader ? obs.read(reader) : obs.get();
    const session = read(this._sessionsService.activeSession);
    const isQuickChat2 = session?.isQuickChat ? read(session.isQuickChat) : false;
    const workspace = session ? read(session.workspace) : void 0;
    if (!session || isQuickChat2 || !workspace) {
      return { changesSessionResource: void 0, workspace: void 0, wantsChangesTab: false, wantsFilesTab: false };
    }
    return { changesSessionResource: session.resource, workspace, wantsChangesTab: true, wantsFilesTab: true };
  }
  // --- Reconcile --------------------------------------------------------
  async _reconcile(generation) {
    if (generation !== this._generation || !this._pending) {
      return;
    }
    const pending = this._pending;
    this._pending = void 0;
    try {
      await this._reconcileCore(pending.target, pending.trigger, generation);
    } finally {
      const successor = this._pending;
      if (generation !== this._generation && successor && successor.sessionKey === pending.sessionKey) {
        this._pending = { ...successor, trigger: mergeTriggers(successor.trigger, pending.trigger) };
      }
    }
  }
  async _reconcileCore(target, trigger, generation) {
    const group2 = this._editorGroupsService.mainPart.activeGroup;
    this._resetCollapsedEditorsOnSessionChange();
    const changesResource = target.changesSessionResource ? this._sessionChangesService.getChangesEditorResource(target.changesSessionResource) : void 0;
    const suppression = this._layoutService.suppressEditorPartAutoVisibility();
    try {
      await this._reconcileForeignChangesEditors(group2, changesResource);
      if (generation !== this._generation) {
        return;
      }
      this._updateFilesEditors(group2, target.workspace);
      const sessionKey = this._sessionsService.activeSession.get()?.resource.toString();
      const preserveMissingFiles = !!trigger.workingSetRestored && this._preserveMissingFilesForSessionKey === sessionKey;
      if (preserveMissingFiles) {
        await this._removeFilesTab(group2);
        if (generation !== this._generation) {
          return;
        }
      }
      const openIntoEmpty = !!trigger.openDefaultsIfEmpty && group2.editors.length === 0;
      const changesPresent = !!changesResource && !!this._findChangesEditor(group2, changesResource);
      const filesPresent = group2.editors.some((editor) => editor instanceof EmptyFileEditorInput);
      const activeChangesResource = this._editorService.activeEditor && this.getChangesEditorResource(this._editorService.activeEditor);
      const activateChanges = !!trigger.ensureChangesActive && !!changesResource && (!activeChangesResource || !isEqual2(activeChangesResource, changesResource));
      const ensureAllInputs = this._layoutService.isVisible("workbench.parts.auxiliarybar" /* AUXILIARYBAR_PART */) && !this._layoutService.isVisible("workbench.parts.editor" /* EDITOR_PART */, mainWindow);
      const openChanges = target.wantsChangesTab && !!changesResource && (activateChanges || !changesPresent && (openIntoEmpty || ensureAllInputs || trigger.ensureChanges));
      const openFiles = target.wantsFilesTab && !filesPresent && !preserveMissingFiles && (openIntoEmpty || ensureAllInputs);
      const isCreated = this._sessionsService.activeSession.get()?.isCreated.get() ?? false;
      const openFilesFirst = openChanges && openFiles && !isCreated && group2.editors.length === 0;
      if (openFilesFirst) {
        await this._openFilesTab(group2, target.workspace);
        if (generation !== this._generation) {
          return;
        }
      }
      if (openChanges && changesResource) {
        if (!await this._openChangesTab(target.changesSessionResource, changesResource, group2, generation, activateChanges)) {
          return;
        }
      }
      if (openFiles && !openFilesFirst) {
        await this._openFilesTab(group2, target.workspace);
        if (generation !== this._generation) {
          return;
        }
      }
    } finally {
      suppression.dispose();
      if (generation === this._generation) {
        if (trigger.workingSetRestored) {
          this._preserveMissingFilesForSessionKey = void 0;
        }
        this._updateAddTabContexts(target);
      }
    }
  }
  /** On a session change, drop editors captured while the previous session's editor area was hidden so they are not reopened here. */
  _resetCollapsedEditorsOnSessionChange() {
    const sessionKey = this._sessionsService.activeSession.get()?.resource.toString();
    if (sessionKey !== this._lastSyncedSessionKey) {
      this._collapsedEditors = void 0;
      this._lastSyncedSessionKey = sessionKey;
    }
  }
  // --- Tab operations ---------------------------------------------------
  /** Opens the Changes editor pinned first (active on submit). Returns `false` if a newer reconcile superseded this one mid-open. */
  async _openChangesTab(sessionResource, changesResource, group2, generation, active) {
    this._changesViewService.setChangesetId(void 0);
    await this._sessionChangesService.openChangesEditor(sessionResource, active ? CHANGES_TAB_ACTIVE_OPTIONS : CHANGES_TAB_OPTIONS, group2);
    if (generation !== this._generation) {
      return false;
    }
    const changesEditor = this._findChangesEditor(group2, changesResource);
    if (changesEditor) {
      this._pinFirst(group2, changesEditor);
    }
    return true;
  }
  async _openFilesTab(group2, workspace) {
    const suppression = this._layoutService.suppressEditorPartAutoVisibility();
    this._changingFilesInternally = true;
    try {
      await this._editorService.openEditor(this._instantiationService.createInstance(EmptyFileEditorInput, workspace), FILES_TAB_OPTIONS, group2);
      this._filesTabDismissed = false;
    } finally {
      this._changingFilesInternally = false;
      suppression.dispose();
    }
  }
  async _removeFilesTab(group2) {
    const placeholder = group2.editors.find((editor) => editor instanceof EmptyFileEditorInput);
    if (placeholder) {
      this._changingFilesInternally = true;
      try {
        await this._closeManagedEditors(group2, [placeholder]);
      } finally {
        this._changingFilesInternally = false;
      }
    }
  }
  async _reconcileForeignChangesEditors(group2, activeChangesResource) {
    const foreign = group2.editors.filter((editor) => {
      const resource = this.getChangesEditorResource(editor);
      return resource && (!activeChangesResource || !isEqual2(resource, activeChangesResource));
    });
    if (foreign.length === 0) {
      return;
    }
    if (!activeChangesResource) {
      await this._closeManagedEditors(group2, foreign);
      return;
    }
    const [editorToReplace, ...editorsToClose] = foreign;
    const wasActive = group2.activeEditor === editorToReplace;
    await group2.replaceEditors([{
      editor: editorToReplace,
      replacement: this._instantiationService.createInstance(SessionChangesEditorInput, activeChangesResource),
      options: wasActive ? CHANGES_TAB_ACTIVE_OPTIONS : CHANGES_TAB_OPTIONS
    }]);
    if (editorsToClose.length > 0) {
      await this._closeManagedEditors(group2, editorsToClose);
    }
  }
  _updateFilesEditors(group2, workspace) {
    for (const editor of group2.editors) {
      if (editor instanceof EmptyFileEditorInput) {
        editor.setWorkspace(workspace);
      }
    }
  }
  /** Closes editors we own, preserving focus so a transient close never steals it. */
  async _closeManagedEditors(group2, editors) {
    await this._editorService.closeEditors(editors.map((editor) => ({ groupId: group2.id, editor })), { preserveFocus: true, force: true });
  }
  _pinFirst(group2, editor) {
    if (!group2.isPinned(editor)) {
      group2.pinEditor(editor);
    }
    if (group2.getIndexOfEditor(editor) !== 0) {
      group2.moveEditor(editor, group2, CHANGES_TAB_OPTIONS);
    }
  }
  // --- Queries ----------------------------------------------------------
  _findChangesEditor(group2, changesResource) {
    return group2.editors.find((editor) => {
      const resource = this.getChangesEditorResource(editor);
      return !!resource && isEqual2(resource, changesResource);
    });
  }
  /** Whether the editor shows a workspace file (a file-system resource), excluding managed docked placeholders. */
  _isWorkspaceFileEditor(editor) {
    if (editor instanceof DockedEditorInput) {
      return false;
    }
    const resource = EditorResourceAccessor.getCanonicalUri(editor, { supportSideBySide: 1 /* PRIMARY */ });
    return resource?.scheme === Schemas.file || resource?.scheme === Schemas.vscodeRemote;
  }
  /** Offer the `+` "Changes"/"Files" entries when the session supports them but their tabs are closed. */
  _updateAddTabContexts(target) {
    const group2 = this._editorGroupsService.mainPart.activeGroup;
    const changesPresent = group2.editors.some((editor) => this.getChangesEditorResource(editor) !== void 0);
    const filesPresent = group2.editors.some((editor) => editor instanceof EmptyFileEditorInput);
    this._changesTabAvailableContext.set(target.wantsChangesTab);
    this._filesTabAvailableContext.set(target.wantsFilesTab);
    this._changesTabMissingContext.set(target.wantsChangesTab && !changesPresent);
    this._filesTabMissingContext.set(target.wantsFilesTab && !filesPresent);
  }
  // --- Editor-area collapse ----------------------------------------------
  _queueCollapseIfDetailsOnly() {
    if (!this._layoutService.isVisible("workbench.parts.editor" /* EDITOR_PART */, mainWindow) && this._layoutService.isVisible("workbench.parts.auxiliarybar" /* AUXILIARYBAR_PART */)) {
      void this._sequencer.queue(() => this._collapseNonManagedTabs()).catch(onUnexpectedError);
    }
  }
  async _collapseNonManagedTabs() {
    const group2 = this._editorGroupsService.mainPart.activeGroup;
    const captured = [...this._collapsedEditors ?? []];
    const toClose = [];
    group2.editors.forEach((editor, index2) => {
      if (editor instanceof DockedEditorInput || this.getChangesEditorResource(editor)) {
        return;
      }
      const untyped = editor.toUntyped();
      if (untyped) {
        captured.push({ editor: untyped, index: index2 });
      }
      toClose.push(editor);
    });
    if (toClose.length === 0) {
      return;
    }
    this._collapsedEditors = captured;
    const suppressEditorPartAutoVisibility = this._layoutService.suppressEditorPartAutoVisibility();
    try {
      await this._editorService.closeEditors(toClose.map((editor) => ({ groupId: group2.id, editor })), { preserveFocus: true });
    } finally {
      suppressEditorPartAutoVisibility.dispose();
    }
  }
  async _restoreCollapsedTabs() {
    const captured = this._collapsedEditors;
    this._collapsedEditors = void 0;
    if (!captured || captured.length === 0) {
      return;
    }
    const group2 = this._editorGroupsService.mainPart.activeGroup;
    const suppressEditorPartAutoVisibility = this._layoutService.suppressEditorPartAutoVisibility();
    try {
      await this._editorService.openEditors(
        [...captured].sort((a, b) => a.index - b.index).map(({ editor, index: index2 }) => ({ ...editor, options: { ...editor.options, index: index2, inactive: true, preserveFocus: true, pinned: true } })),
        group2
      );
    } finally {
      suppressEditorPartAutoVisibility.dispose();
    }
  }
};

SinglePaneDockedTabsCoordinator = __decorateClass([
  __decorateParam(1, IAgentWorkbenchLayoutService),
  __decorateParam(2, ISessionsService),
  __decorateParam(3, IEditorService),
  __decorateParam(4, IEditorGroupsService),
  __decorateParam(5, ISessionChangesService),
  __decorateParam(6, IChangesViewService),
  __decorateParam(7, IContextKeyService),
  __decorateParam(8, IInstantiationService)
], SinglePaneDockedTabsCoordinator);
export { mergeTriggers, CHANGES_TAB_OPTIONS, CHANGES_TAB_ACTIVE_OPTIONS, FILES_TAB_OPTIONS, SinglePaneDockedTabsCoordinator };
