// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/services/history/browser/historyService.ts
import { Disposable, DisposableMap, DisposableStore } from "./module-0012.mjs";
import { Emitter, Event2 } from "./module-0017.mjs";
import { EventHelper, EventType, WindowIdleValue, addDisposableListener } from "./module-0075.mjs";
import { mainWindow } from "./module-0002.mjs";
import { ResourceGlobMatcher } from "./module-0930.mjs";
import { SEARCH_EXCLUDE_CONFIG, getExcludes } from "./module-1000.mjs";
import { FILES_EXCLUDE_CONFIG, FileChangesEvent, FileOperationEvent, IFileService } from "./module-0269.mjs";
import { IContextKeyService, RawContextKey } from "./module-0089.mjs";
import { localize } from "./module-0001.mjs";
import { IHistoryService, MOUSE_BACK_FORWARD_NAVIGATION_SETTING } from "./module-1493.mjs";
import { EditorResourceAccessor, isEditorInput, isEditorPaneWithSelection, isResourceEditorInput, isSideBySideEditorInput } from "./module-0926.mjs";
import { URI } from "./module-0032.mjs";
import { coalesce } from "./module-0007.mjs";
import { onUnexpectedError } from "./module-0004.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IEditorService } from "./module-0935.mjs";
import { IEditorGroupsService } from "./module-0934.mjs";
import { IWorkspaceContextService } from "./module-0509.mjs";
import { IStorageService } from "./module-0512.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IWorkspacesService } from "./module-1378.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IWorkbenchLayoutService } from "./module-1119.mjs";
import { ILogService } from "./module-0095.mjs";
import { registerSingleton } from "./module-0135.mjs";
import { Schemas } from "./module-0033.mjs";
import { IUriIdentityService } from "./module-0510.mjs";
import { ILifecycleService } from "./module-0870.mjs";
import { IPathService } from "./module-0939.mjs";


// src/vs/workbench/services/history/browser/historyService.ts
var HistoryService = class extends Disposable {
  constructor(editorService, editorGroupService, contextService, storageService, configurationService, fileService, workspacesService, instantiationService, layoutService, contextKeyService, logService) {
    super();
    this.editorService = editorService;
    this.editorGroupService = editorGroupService;
    this.contextService = contextService;
    this.storageService = storageService;
    this.configurationService = configurationService;
    this.fileService = fileService;
    this.workspacesService = workspacesService;
    this.instantiationService = instantiationService;
    this.layoutService = layoutService;
    this.contextKeyService = contextKeyService;
    this.logService = logService;
    this.activeEditorListeners = this._register(new DisposableStore());
    this.lastActiveEditor = void 0;
    //#endregion
    //#region Editor History Navigation (limit: 50)
    this._onDidChangeEditorNavigationStack = this._register(new Emitter());
    this.onDidChangeEditorNavigationStack = this._onDidChangeEditorNavigationStack.event;
    this.defaultScopedEditorNavigationStack = void 0;
    this.editorGroupScopedNavigationStacks = /* @__PURE__ */ new Map();
    this.editorScopedNavigationStacks = /* @__PURE__ */ new Map();
    this.editorNavigationScope = 0 /* DEFAULT */;
    //#endregion
    //#region Navigation: Next/Previous Used Editor
    this.recentlyUsedEditorsStack = void 0;
    this.recentlyUsedEditorsStackIndex = 0;
    this.recentlyUsedEditorsInGroupStack = void 0;
    this.recentlyUsedEditorsInGroupStackIndex = 0;
    this.navigatingInRecentlyUsedEditorsStack = false;
    this.navigatingInRecentlyUsedEditorsInGroupStack = false;
    this.recentlyClosedEditors = [];
    this.ignoreEditorCloseEvent = false;
    this.recentlyClosedEditorsBatchId = 0;
    this.recentlyClosedEditorsBatchScheduled = false;
    this.history = void 0;
    this.editorHistoryListeners = this._register(new DisposableMap());
    this.resourceExcludeMatcher = this._register(new WindowIdleValue(mainWindow, () => {
      const matcher = this._register(this.instantiationService.createInstance(
        ResourceGlobMatcher,
        (root) => getExcludes(root ? this.configurationService.getValue({ resource: root }) : this.configurationService.getValue()) || /* @__PURE__ */ Object.create(null),
        (event) => event.affectsConfiguration(FILES_EXCLUDE_CONFIG) || event.affectsConfiguration(SEARCH_EXCLUDE_CONFIG)
      ));
      this._register(matcher.onExpressionChange(() => this.removeExcludedFromHistory()));
      return matcher;
    }));
    this.editorHelper = this.instantiationService.createInstance(EditorHelper);
    this.canNavigateBackContextKey = new RawContextKey("canNavigateBack", false, localize(23164, null)).bindTo(this.contextKeyService);
    this.canNavigateForwardContextKey = new RawContextKey("canNavigateForward", false, localize(23167, null)).bindTo(this.contextKeyService);
    this.canNavigateBackInNavigationsContextKey = new RawContextKey("canNavigateBackInNavigationLocations", false, localize(23166, null)).bindTo(this.contextKeyService);
    this.canNavigateForwardInNavigationsContextKey = new RawContextKey("canNavigateForwardInNavigationLocations", false, localize(23169, null)).bindTo(this.contextKeyService);
    this.canNavigateToLastNavigationLocationContextKey = new RawContextKey("canNavigateToLastNavigationLocation", false, localize(23171, null)).bindTo(this.contextKeyService);
    this.canNavigateBackInEditsContextKey = new RawContextKey("canNavigateBackInEditLocations", false, localize(23165, null)).bindTo(this.contextKeyService);
    this.canNavigateForwardInEditsContextKey = new RawContextKey("canNavigateForwardInEditLocations", false, localize(23168, null)).bindTo(this.contextKeyService);
    this.canNavigateToLastEditLocationContextKey = new RawContextKey("canNavigateToLastEditLocation", false, localize(23170, null)).bindTo(this.contextKeyService);
    this.canReopenClosedEditorContextKey = new RawContextKey("canReopenClosedEditor", false, localize(23172, null)).bindTo(this.contextKeyService);
    this.registerListeners();
    if (this.editorService.activeEditorPane) {
      this.onDidActiveEditorChange();
    }
  }
  static {
    this.NAVIGATION_SCOPE_SETTING = "workbench.editor.navigationScope";
  }
  registerListeners() {
    this.registerMouseNavigationListener();
    this._register(this.editorService.onDidActiveEditorChange(() => this.onDidActiveEditorChange()));
    this._register(this.editorService.onDidOpenEditorFail((event) => this.remove(event.editor)));
    this._register(this.editorService.onDidCloseEditor((event) => this.onDidCloseEditor(event)));
    this._register(this.editorService.onDidMostRecentlyActiveEditorsChange(() => this.handleEditorEventInRecentEditorsStack()));
    this._register(this.editorGroupService.onDidRemoveGroup((e4) => this.onDidRemoveGroup(e4)));
    this._register(this.fileService.onDidFilesChange((event) => this.onDidFilesChange(event)));
    this._register(this.fileService.onDidRunOperation((event) => this.onDidFilesChange(event)));
    this._register(this.storageService.onWillSaveState(() => this.saveState()));
    this.registerEditorNavigationScopeChangeListener();
    this._register(this.onDidChangeEditorNavigationStack(() => this.updateContextKeys()));
    this._register(this.editorGroupService.onDidChangeActiveGroup(() => this.updateContextKeys()));
  }
  onDidCloseEditor(e4) {
    this.handleEditorCloseEventInHistory(e4);
    this.handleEditorCloseEventInReopen(e4);
  }
  registerMouseNavigationListener() {
    const mouseBackForwardSupportListener = this._register(new DisposableStore());
    const handleMouseBackForwardSupport = () => {
      mouseBackForwardSupportListener.clear();
      if (this.configurationService.getValue(MOUSE_BACK_FORWARD_NAVIGATION_SETTING)) {
        this._register(Event2.runAndSubscribe(this.layoutService.onDidAddContainer, ({ container: container2, disposables }) => {
          const eventDisposables = disposables.add(new DisposableStore());
          eventDisposables.add(addDisposableListener(container2, EventType.MOUSE_DOWN, (e4) => this.onMouseDownOrUp(e4, true)));
          eventDisposables.add(addDisposableListener(container2, EventType.MOUSE_UP, (e4) => this.onMouseDownOrUp(e4, false)));
          mouseBackForwardSupportListener.add(eventDisposables);
        }, { container: this.layoutService.mainContainer, disposables: this._store }));
      }
    };
    this._register(this.configurationService.onDidChangeConfiguration((event) => {
      if (event.affectsConfiguration(MOUSE_BACK_FORWARD_NAVIGATION_SETTING)) {
        handleMouseBackForwardSupport();
      }
    }));
    handleMouseBackForwardSupport();
  }
  onMouseDownOrUp(event, isMouseDown) {
    switch (event.button) {
      case 3:
        EventHelper.stop(event);
        if (isMouseDown) {
          this.goBack();
        }
        break;
      case 4:
        EventHelper.stop(event);
        if (isMouseDown) {
          this.goForward();
        }
        break;
    }
  }
  onDidRemoveGroup(group2) {
    this.handleEditorGroupRemoveInNavigationStacks(group2);
  }
  onDidActiveEditorChange() {
    const activeEditorGroup = this.editorGroupService.activeGroup;
    const activeEditorPane = activeEditorGroup.activeEditorPane;
    if (this.lastActiveEditor && this.editorHelper.matchesEditorIdentifier(this.lastActiveEditor, activeEditorPane)) {
      return;
    }
    this.lastActiveEditor = activeEditorPane?.input ? { editor: activeEditorPane.input, groupId: activeEditorPane.group.id } : void 0;
    this.activeEditorListeners.clear();
    if (!activeEditorPane?.group.isTransient(activeEditorPane.input)) {
      this.handleActiveEditorChange(activeEditorGroup, activeEditorPane);
    } else {
      this.logService.trace(`[History]: ignoring transient editor change until becoming non-transient (editor: ${activeEditorPane.input?.resource?.toString()}})`);
      const transientListener = activeEditorGroup.onDidModelChange((e4) => {
        if (e4.kind === 12 /* EDITOR_TRANSIENT */ && e4.editor === activeEditorPane.input && !activeEditorPane.group.isTransient(activeEditorPane.input)) {
          transientListener.dispose();
          this.handleActiveEditorChange(activeEditorGroup, activeEditorPane);
        }
      });
      this.activeEditorListeners.add(transientListener);
    }
    if (isEditorPaneWithSelection(activeEditorPane)) {
      this.activeEditorListeners.add(activeEditorPane.onDidChangeSelection((e4) => {
        if (!activeEditorPane.group.isTransient(activeEditorPane.input)) {
          this.handleActiveEditorSelectionChangeEvent(activeEditorGroup, activeEditorPane, e4);
        } else {
          this.logService.trace(`[History]: ignoring transient editor selection change (editor: ${activeEditorPane.input?.resource?.toString()}})`);
        }
      }));
    }
    this.updateContextKeys();
  }
  onDidFilesChange(event) {
    if (event instanceof FileChangesEvent) {
      if (event.gotDeleted()) {
        this.remove(event);
      }
    } else {
      if (event.isOperation(1 /* DELETE */)) {
        this.remove(event);
      } else if (event.isOperation(2 /* MOVE */) && event.target.isFile) {
        this.move(event);
      }
    }
  }
  handleActiveEditorChange(group2, editorPane) {
    this.handleActiveEditorChangeInHistory(editorPane);
    this.handleActiveEditorChangeInNavigationStacks(group2, editorPane);
  }
  handleActiveEditorSelectionChangeEvent(group2, editorPane, event) {
    this.handleActiveEditorSelectionChangeInNavigationStacks(group2, editorPane, event);
  }
  move(event) {
    this.moveInHistory(event);
    this.moveInEditorNavigationStacks(event);
  }
  remove(arg1) {
    this.removeFromHistory(arg1);
    this.removeFromEditorNavigationStacks(arg1);
    this.removeFromRecentlyClosedEditors(arg1);
    this.removeFromRecentlyOpened(arg1);
  }
  removeFromRecentlyOpened(arg1) {
    let resource = void 0;
    if (isEditorInput(arg1)) {
      resource = EditorResourceAccessor.getOriginalUri(arg1);
    } else if (arg1 instanceof FileChangesEvent) {
    } else {
      resource = arg1.resource;
    }
    if (resource) {
      this.workspacesService.removeRecentlyOpened([resource]);
    }
  }
  clear() {
    this.clearRecentlyOpened();
    this.clearEditorNavigationStacks();
    this.recentlyClosedEditors = [];
    this.updateContextKeys();
  }
  updateContextKeys() {
    this.contextKeyService.bufferChangeEvents(() => {
      const activeStack = this.getStack();
      this.canNavigateBackContextKey.set(activeStack.canGoBack(0 /* NONE */));
      this.canNavigateForwardContextKey.set(activeStack.canGoForward(0 /* NONE */));
      this.canNavigateBackInNavigationsContextKey.set(activeStack.canGoBack(2 /* NAVIGATION */));
      this.canNavigateForwardInNavigationsContextKey.set(activeStack.canGoForward(2 /* NAVIGATION */));
      this.canNavigateToLastNavigationLocationContextKey.set(activeStack.canGoLast(2 /* NAVIGATION */));
      this.canNavigateBackInEditsContextKey.set(activeStack.canGoBack(1 /* EDITS */));
      this.canNavigateForwardInEditsContextKey.set(activeStack.canGoForward(1 /* EDITS */));
      this.canNavigateToLastEditLocationContextKey.set(activeStack.canGoLast(1 /* EDITS */));
      this.canReopenClosedEditorContextKey.set(this.recentlyClosedEditors.length > 0);
    });
  }
  registerEditorNavigationScopeChangeListener() {
    const handleEditorNavigationScopeChange = () => {
      this.disposeEditorNavigationStacks();
      const configuredScope = this.configurationService.getValue(HistoryService.NAVIGATION_SCOPE_SETTING);
      if (configuredScope === "editorGroup") {
        this.editorNavigationScope = 1 /* EDITOR_GROUP */;
      } else if (configuredScope === "editor") {
        this.editorNavigationScope = 2 /* EDITOR */;
      } else {
        this.editorNavigationScope = 0 /* DEFAULT */;
      }
    };
    this._register(this.configurationService.onDidChangeConfiguration((event) => {
      if (event.affectsConfiguration(HistoryService.NAVIGATION_SCOPE_SETTING)) {
        handleEditorNavigationScopeChange();
      }
    }));
    handleEditorNavigationScopeChange();
  }
  getStack(group2 = this.editorGroupService.activeGroup, editor = group2.activeEditor) {
    switch (this.editorNavigationScope) {
      // Per Editor
      case 2 /* EDITOR */: {
        if (!editor) {
          return new NoOpEditorNavigationStacks();
        }
        let stacksForGroup = this.editorScopedNavigationStacks.get(group2.id);
        if (!stacksForGroup) {
          stacksForGroup = /* @__PURE__ */ new Map();
          this.editorScopedNavigationStacks.set(group2.id, stacksForGroup);
        }
        let stack = stacksForGroup.get(editor)?.stack;
        if (!stack) {
          const disposable = new DisposableStore();
          stack = disposable.add(this.instantiationService.createInstance(EditorNavigationStacks, 2 /* EDITOR */));
          disposable.add(stack.onDidChange(() => this._onDidChangeEditorNavigationStack.fire()));
          stacksForGroup.set(editor, { stack, disposable });
        }
        return stack;
      }
      // Per Editor Group
      case 1 /* EDITOR_GROUP */: {
        let stack = this.editorGroupScopedNavigationStacks.get(group2.id)?.stack;
        if (!stack) {
          const disposable = new DisposableStore();
          stack = disposable.add(this.instantiationService.createInstance(EditorNavigationStacks, 1 /* EDITOR_GROUP */));
          disposable.add(stack.onDidChange(() => this._onDidChangeEditorNavigationStack.fire()));
          this.editorGroupScopedNavigationStacks.set(group2.id, { stack, disposable });
        }
        return stack;
      }
      // Global
      case 0 /* DEFAULT */: {
        if (!this.defaultScopedEditorNavigationStack) {
          this.defaultScopedEditorNavigationStack = this._register(this.instantiationService.createInstance(EditorNavigationStacks, 0 /* DEFAULT */));
          this._register(this.defaultScopedEditorNavigationStack.onDidChange(() => this._onDidChangeEditorNavigationStack.fire()));
        }
        return this.defaultScopedEditorNavigationStack;
      }
    }
  }
  goForward(filter2) {
    return this.getStack().goForward(filter2);
  }
  goBack(filter2) {
    return this.getStack().goBack(filter2);
  }
  goPrevious(filter2) {
    return this.getStack().goPrevious(filter2);
  }
  goLast(filter2) {
    return this.getStack().goLast(filter2);
  }
  handleActiveEditorChangeInNavigationStacks(group2, editorPane) {
    this.getStack(group2, editorPane?.input).handleActiveEditorChange(editorPane);
  }
  handleActiveEditorSelectionChangeInNavigationStacks(group2, editorPane, event) {
    this.getStack(group2, editorPane.input).handleActiveEditorSelectionChange(editorPane, event);
  }
  handleEditorCloseEventInHistory(e4) {
    const editors = this.editorScopedNavigationStacks.get(e4.groupId);
    if (editors) {
      const editorStack = editors.get(e4.editor);
      if (editorStack) {
        editorStack.disposable.dispose();
        editors.delete(e4.editor);
      }
      if (editors.size === 0) {
        this.editorScopedNavigationStacks.delete(e4.groupId);
      }
    }
  }
  handleEditorGroupRemoveInNavigationStacks(group2) {
    this.defaultScopedEditorNavigationStack?.remove(group2.id);
    const editorGroupStack = this.editorGroupScopedNavigationStacks.get(group2.id);
    if (editorGroupStack) {
      editorGroupStack.disposable.dispose();
      this.editorGroupScopedNavigationStacks.delete(group2.id);
    }
  }
  clearEditorNavigationStacks() {
    this.withEachEditorNavigationStack((stack) => stack.clear());
  }
  removeFromEditorNavigationStacks(arg1) {
    this.withEachEditorNavigationStack((stack) => stack.remove(arg1));
  }
  moveInEditorNavigationStacks(event) {
    this.withEachEditorNavigationStack((stack) => stack.move(event));
  }
  withEachEditorNavigationStack(fn) {
    if (this.defaultScopedEditorNavigationStack) {
      fn(this.defaultScopedEditorNavigationStack);
    }
    for (const [, entry] of this.editorGroupScopedNavigationStacks) {
      fn(entry.stack);
    }
    for (const [, entries2] of this.editorScopedNavigationStacks) {
      for (const [, entry] of entries2) {
        fn(entry.stack);
      }
    }
  }
  disposeEditorNavigationStacks() {
    this.defaultScopedEditorNavigationStack?.dispose();
    this.defaultScopedEditorNavigationStack = void 0;
    for (const [, stack] of this.editorGroupScopedNavigationStacks) {
      stack.disposable.dispose();
    }
    this.editorGroupScopedNavigationStacks.clear();
    for (const [, stacks] of this.editorScopedNavigationStacks) {
      for (const [, stack] of stacks) {
        stack.disposable.dispose();
      }
    }
    this.editorScopedNavigationStacks.clear();
  }
  openNextRecentlyUsedEditor(groupId) {
    const [stack, index2] = this.ensureRecentlyUsedStack((index3) => index3 - 1, groupId);
    return this.doNavigateInRecentlyUsedEditorsStack(stack[index2], groupId);
  }
  openPreviouslyUsedEditor(groupId) {
    const [stack, index2] = this.ensureRecentlyUsedStack((index3) => index3 + 1, groupId);
    return this.doNavigateInRecentlyUsedEditorsStack(stack[index2], groupId);
  }
  async doNavigateInRecentlyUsedEditorsStack(editorIdentifier, groupId) {
    if (editorIdentifier) {
      const acrossGroups = typeof groupId !== "number" || !this.editorGroupService.getGroup(groupId);
      if (acrossGroups) {
        this.navigatingInRecentlyUsedEditorsStack = true;
      } else {
        this.navigatingInRecentlyUsedEditorsInGroupStack = true;
      }
      const group2 = this.editorGroupService.getGroup(editorIdentifier.groupId) ?? this.editorGroupService.activeGroup;
      try {
        await group2.openEditor(editorIdentifier.editor);
      } finally {
        if (acrossGroups) {
          this.navigatingInRecentlyUsedEditorsStack = false;
        } else {
          this.navigatingInRecentlyUsedEditorsInGroupStack = false;
        }
      }
    }
  }
  ensureRecentlyUsedStack(indexModifier, groupId) {
    let editors;
    let index2;
    const group2 = typeof groupId === "number" ? this.editorGroupService.getGroup(groupId) : void 0;
    if (!group2) {
      editors = this.recentlyUsedEditorsStack || this.editorService.getEditors(0 /* MOST_RECENTLY_ACTIVE */);
      index2 = this.recentlyUsedEditorsStackIndex;
    } else {
      editors = this.recentlyUsedEditorsInGroupStack || group2.getEditors(0 /* MOST_RECENTLY_ACTIVE */).map((editor) => ({ groupId: group2.id, editor }));
      index2 = this.recentlyUsedEditorsInGroupStackIndex;
    }
    let newIndex = indexModifier(index2);
    if (newIndex < 0) {
      newIndex = 0;
    } else if (newIndex > editors.length - 1) {
      newIndex = editors.length - 1;
    }
    if (!group2) {
      this.recentlyUsedEditorsStack = editors;
      this.recentlyUsedEditorsStackIndex = newIndex;
    } else {
      this.recentlyUsedEditorsInGroupStack = editors;
      this.recentlyUsedEditorsInGroupStackIndex = newIndex;
    }
    return [editors, newIndex];
  }
  handleEditorEventInRecentEditorsStack() {
    if (!this.navigatingInRecentlyUsedEditorsStack) {
      this.recentlyUsedEditorsStack = void 0;
      this.recentlyUsedEditorsStackIndex = 0;
    }
    if (!this.navigatingInRecentlyUsedEditorsInGroupStack) {
      this.recentlyUsedEditorsInGroupStack = void 0;
      this.recentlyUsedEditorsInGroupStackIndex = 0;
    }
  }
  static {
    //#endregion
    //#region File: Reopen Closed Editor (limit: 20)
    this.MAX_RECENTLY_CLOSED_EDITORS = 20;
  }
  handleEditorCloseEventInReopen(event) {
    if (this.ignoreEditorCloseEvent) {
      return;
    }
    const { editor, context: context2 } = event;
    if (context2 === 1 /* REPLACE */ || context2 === 2 /* MOVE */) {
      return;
    }
    if (!editor.canReopen()) {
      return;
    }
    const untypedEditor = editor.toUntyped();
    if (!untypedEditor) {
      return;
    }
    const associatedResources = [];
    const editorResource = EditorResourceAccessor.getOriginalUri(editor, { supportSideBySide: 3 /* BOTH */ });
    if (URI.isUri(editorResource)) {
      associatedResources.push(editorResource);
    } else if (editorResource) {
      associatedResources.push(...coalesce([editorResource.primary, editorResource.secondary]));
    }
    this.removeFromRecentlyClosedEditors(editor);
    this.recentlyClosedEditors.push({
      editorId: editor.editorId,
      editor: untypedEditor,
      resource: EditorResourceAccessor.getOriginalUri(editor),
      associatedResources,
      index: event.index,
      sticky: event.sticky,
      batchId: this.currentRecentlyClosedEditorsBatchId()
    });
    if (this.recentlyClosedEditors.length > HistoryService.MAX_RECENTLY_CLOSED_EDITORS) {
      this.recentlyClosedEditors.shift();
    }
    this.canReopenClosedEditorContextKey.set(true);
  }
  currentRecentlyClosedEditorsBatchId() {
    if (!this.recentlyClosedEditorsBatchScheduled) {
      this.recentlyClosedEditorsBatchScheduled = true;
      this.recentlyClosedEditorsBatchId++;
      queueMicrotask(() => this.recentlyClosedEditorsBatchScheduled = false);
    }
    return this.recentlyClosedEditorsBatchId;
  }
  async reopenLastClosedEditor() {
    const lastClosedEditors = this.takeLastClosedEditorsBatch();
    let reopenClosedEditorPromise = void 0;
    if (lastClosedEditors.length) {
      reopenClosedEditorPromise = this.doReopenLastClosedEditors(lastClosedEditors);
    }
    this.canReopenClosedEditorContextKey.set(this.recentlyClosedEditors.length > 0);
    return reopenClosedEditorPromise;
  }
  takeLastClosedEditorsBatch() {
    const lastClosedEditor = this.recentlyClosedEditors.at(-1);
    if (!lastClosedEditor) {
      return [];
    }
    const batch = [];
    while (this.recentlyClosedEditors.length && this.recentlyClosedEditors[this.recentlyClosedEditors.length - 1].batchId === lastClosedEditor.batchId) {
      batch.unshift(this.recentlyClosedEditors.pop());
    }
    return batch;
  }
  async doReopenLastClosedEditors(lastClosedEditors) {
    let anyReopened = false;
    for (const lastClosedEditor of lastClosedEditors) {
      const editorPane = await this.doReopenLastClosedEditor(lastClosedEditor);
      if (editorPane) {
        anyReopened = true;
      }
    }
    if (!anyReopened && this.recentlyClosedEditors.length) {
      return this.reopenLastClosedEditor();
    }
  }
  async doReopenLastClosedEditor(lastClosedEditor) {
    const options3 = { pinned: true, sticky: lastClosedEditor.sticky, index: lastClosedEditor.index, ignoreError: true };
    if (lastClosedEditor.sticky && !this.editorGroupService.activeGroup.isSticky(lastClosedEditor.index) || !lastClosedEditor.sticky && this.editorGroupService.activeGroup.isSticky(lastClosedEditor.index)) {
      options3.index = void 0;
    }
    let editorPane = void 0;
    if (!this.editorGroupService.activeGroup.contains(lastClosedEditor.editor)) {
      this.ignoreEditorCloseEvent = true;
      try {
        editorPane = await this.editorService.openEditor({
          ...lastClosedEditor.editor,
          options: {
            ...lastClosedEditor.editor.options,
            ...options3
          }
        });
      } finally {
        this.ignoreEditorCloseEvent = false;
      }
    }
    return editorPane;
  }
  removeFromRecentlyClosedEditors(arg1) {
    this.recentlyClosedEditors = this.recentlyClosedEditors.filter((recentlyClosedEditor) => {
      if (isEditorInput(arg1) && recentlyClosedEditor.editorId !== arg1.editorId) {
        return true;
      }
      if (recentlyClosedEditor.resource && this.editorHelper.matchesFile(recentlyClosedEditor.resource, arg1)) {
        return false;
      }
      if (recentlyClosedEditor.associatedResources.some((associatedResource) => this.editorHelper.matchesFile(associatedResource, arg1))) {
        return false;
      }
      return true;
    });
    this.canReopenClosedEditorContextKey.set(this.recentlyClosedEditors.length > 0);
  }
  static {
    //#endregion
    //#region Go to: Recently Opened Editor (limit: 200, persisted)
    this.MAX_HISTORY_ITEMS = 200;
  }
  static {
    this.HISTORY_STORAGE_KEY = "history.entries";
  }
  handleActiveEditorChangeInHistory(editorPane) {
    const editor = editorPane?.input;
    if (!editor || editor.isDisposed() || !this.includeInHistory(editor)) {
      return;
    }
    this.removeFromHistory(editor);
    this.addToHistory(editor);
  }
  addToHistory(editor, insertFirst = true) {
    this.ensureHistoryLoaded(this.history);
    const historyInput = this.editorHelper.preferResourceEditorInput(editor);
    if (!historyInput) {
      return;
    }
    if (insertFirst) {
      this.history.unshift(historyInput);
    } else {
      this.history.push(historyInput);
    }
    if (this.history.length > HistoryService.MAX_HISTORY_ITEMS) {
      this.editorHelper.clearOnEditorDispose(this.history.pop(), this.editorHistoryListeners);
    }
    if (isEditorInput(editor)) {
      this.editorHelper.onEditorDispose(editor, () => this.updateHistoryOnEditorDispose(historyInput), this.editorHistoryListeners);
    }
  }
  updateHistoryOnEditorDispose(editor) {
    if (isEditorInput(editor)) {
      if (!isSideBySideEditorInput(editor)) {
        this.removeFromHistory(editor);
      } else {
        const resourceInputs = [];
        const sideInputs = editor.primary.matches(editor.secondary) ? [editor.primary] : [editor.primary, editor.secondary];
        for (const sideInput of sideInputs) {
          const candidateResourceInput = this.editorHelper.preferResourceEditorInput(sideInput);
          if (isResourceEditorInput(candidateResourceInput) && this.includeInHistory(candidateResourceInput)) {
            resourceInputs.push(candidateResourceInput);
          }
        }
        this.replaceInHistory(editor, ...resourceInputs);
      }
    } else {
      if (!this.includeInHistory(editor)) {
        this.removeFromHistory(editor);
      }
    }
  }
  includeInHistory(editor) {
    if (isEditorInput(editor)) {
      return true;
    }
    return !this.resourceExcludeMatcher.value.matches(editor.resource);
  }
  removeExcludedFromHistory() {
    this.ensureHistoryLoaded(this.history);
    this.history = this.history.filter((entry) => {
      const include = this.includeInHistory(entry);
      if (!include) {
        this.editorHelper.clearOnEditorDispose(entry, this.editorHistoryListeners);
      }
      return include;
    });
  }
  moveInHistory(event) {
    if (event.isOperation(2 /* MOVE */)) {
      const removed = this.removeFromHistory(event);
      if (removed) {
        this.addToHistory({ resource: event.target.resource });
      }
    }
  }
  removeFromHistory(arg1) {
    let removed = false;
    this.ensureHistoryLoaded(this.history);
    this.history = this.history.filter((entry) => {
      const matches2 = this.editorHelper.matchesEditor(arg1, entry);
      if (matches2) {
        this.editorHelper.clearOnEditorDispose(arg1, this.editorHistoryListeners);
        removed = true;
      }
      return !matches2;
    });
    return removed;
  }
  replaceInHistory(editor, ...replacements) {
    this.ensureHistoryLoaded(this.history);
    let replaced = false;
    const newHistory = [];
    for (const entry of this.history) {
      if (this.editorHelper.matchesEditor(editor, entry)) {
        this.editorHelper.clearOnEditorDispose(editor, this.editorHistoryListeners);
        if (!replaced) {
          newHistory.push(...replacements);
          replaced = true;
        }
      } else if (!replacements.some((replacement) => this.editorHelper.matchesEditor(replacement, entry))) {
        newHistory.push(entry);
      }
    }
    if (!replaced) {
      newHistory.push(...replacements);
    }
    this.history = newHistory;
  }
  clearRecentlyOpened() {
    this.history = [];
    this.editorHistoryListeners.clearAndDisposeAll();
  }
  getHistory() {
    this.ensureHistoryLoaded(this.history);
    return this.history;
  }
  ensureHistoryLoaded(history) {
    if (!this.history) {
      this.history = [];
      if (this.editorGroupService.isReady) {
        this.loadHistory();
      } else {
        (async () => {
          await this.editorGroupService.whenReady;
          this.loadHistory();
        })();
      }
    }
  }
  loadHistory() {
    this.history = [];
    const storedEditorHistory = this.loadHistoryFromStorage();
    const openedEditorsLru = [...this.editorService.getEditors(0 /* MOST_RECENTLY_ACTIVE */)].reverse();
    const handledEditors = /* @__PURE__ */ new Set();
    for (const { editor } of openedEditorsLru) {
      if (!this.includeInHistory(editor)) {
        continue;
      }
      if (editor.resource) {
        const historyEntryId = `${editor.resource.toString()}/${editor.editorId}`;
        if (handledEditors.has(historyEntryId)) {
          continue;
        }
        handledEditors.add(historyEntryId);
      }
      this.addToHistory(editor);
    }
    for (const editor of storedEditorHistory) {
      const historyEntryId = `${editor.resource.toString()}/${editor.options?.override}`;
      if (!handledEditors.has(historyEntryId) && this.includeInHistory(editor)) {
        handledEditors.add(historyEntryId);
        this.addToHistory(
          editor,
          false
          /* at the end */
        );
      }
    }
  }
  loadHistoryFromStorage() {
    const entries2 = [];
    const entriesRaw = this.storageService.get(HistoryService.HISTORY_STORAGE_KEY, 1 /* WORKSPACE */);
    if (entriesRaw) {
      try {
        const entriesParsed = JSON.parse(entriesRaw);
        for (const entryParsed of entriesParsed) {
          if (!entryParsed.editor || !entryParsed.editor.resource) {
            continue;
          }
          try {
            entries2.push({
              ...entryParsed.editor,
              resource: typeof entryParsed.editor.resource === "string" ? URI.parse(entryParsed.editor.resource) : (
                //  from 1.67.x: URI is stored efficiently as URI.toString()
                URI.from(entryParsed.editor.resource)
              )
              // until 1.66.x: URI was stored very verbose as URI.toJSON()
            });
          } catch (error) {
            onUnexpectedError(error);
          }
        }
      } catch (error) {
        onUnexpectedError(error);
      }
    }
    return entries2;
  }
  saveState() {
    if (!this.history) {
      return;
    }
    const entries2 = [];
    for (const editor of this.history) {
      if (isEditorInput(editor) || !isResourceEditorInput(editor)) {
        continue;
      }
      entries2.push({
        editor: {
          ...editor,
          resource: editor.resource.toString()
        }
      });
    }
    this.storageService.store(HistoryService.HISTORY_STORAGE_KEY, JSON.stringify(entries2), 1 /* WORKSPACE */, 1 /* MACHINE */);
  }
  //#endregion
  //#region Last Active Workspace/File
  getLastActiveWorkspaceRoot(schemeFilter, authorityFilter) {
    const folders = this.contextService.getWorkspace().folders;
    if (folders.length === 0) {
      return void 0;
    }
    if (folders.length === 1) {
      const resource = folders[0].uri;
      if ((!schemeFilter || resource.scheme === schemeFilter) && (!authorityFilter || resource.authority === authorityFilter)) {
        return resource;
      }
      return void 0;
    }
    for (const input of this.getHistory()) {
      if (isEditorInput(input)) {
        continue;
      }
      if (schemeFilter && input.resource.scheme !== schemeFilter) {
        continue;
      }
      if (authorityFilter && input.resource.authority !== authorityFilter) {
        continue;
      }
      const resourceWorkspace = this.contextService.getWorkspaceFolder(input.resource);
      if (resourceWorkspace) {
        return resourceWorkspace.uri;
      }
    }
    for (const folder of folders) {
      const resource = folder.uri;
      if ((!schemeFilter || resource.scheme === schemeFilter) && (!authorityFilter || resource.authority === authorityFilter)) {
        return resource;
      }
    }
    return void 0;
  }
  getLastActiveFile(filterByScheme, filterByAuthority) {
    for (const input of this.getHistory()) {
      let resource;
      if (isEditorInput(input)) {
        resource = EditorResourceAccessor.getOriginalUri(input, { filterByScheme });
      } else {
        resource = input.resource;
      }
      if (resource && resource.scheme === filterByScheme && (!filterByAuthority || resource.authority === filterByAuthority)) {
        return resource;
      }
    }
    return void 0;
  }
  //#endregion
  dispose() {
    super.dispose();
    for (const [, stack] of this.editorGroupScopedNavigationStacks) {
      stack.disposable.dispose();
    }
    for (const [, editors] of this.editorScopedNavigationStacks) {
      for (const [, stack] of editors) {
        stack.disposable.dispose();
      }
    }
    for (const [, listener] of this.editorHistoryListeners) {
      listener.dispose();
    }
  }
};

HistoryService = __decorateClass([
  __decorateParam(0, IEditorService),
  __decorateParam(1, IEditorGroupsService),
  __decorateParam(2, IWorkspaceContextService),
  __decorateParam(3, IStorageService),
  __decorateParam(4, IConfigurationService),
  __decorateParam(5, IFileService),
  __decorateParam(6, IWorkspacesService),
  __decorateParam(7, IInstantiationService),
  __decorateParam(8, IWorkbenchLayoutService),
  __decorateParam(9, IContextKeyService),
  __decorateParam(10, ILogService)
], HistoryService);

registerSingleton(IHistoryService, HistoryService, 0 /* Eager */);

var EditorSelectionState = class {
  constructor(editorIdentifier, selection, reason) {
    this.editorIdentifier = editorIdentifier;
    this.selection = selection;
    this.reason = reason;
  }
  justifiesNewNavigationEntry(other) {
    if (this.editorIdentifier.groupId !== other.editorIdentifier.groupId) {
      return true;
    }
    if (!this.editorIdentifier.editor.matches(other.editorIdentifier.editor)) {
      return true;
    }
    if (!this.selection || !other.selection) {
      return true;
    }
    const result = this.selection.compare(other.selection);
    if (result === 2 /* SIMILAR */ && (other.reason === 4 /* NAVIGATION */ || other.reason === 5 /* JUMP */)) {
      return true;
    }
    return result === 3 /* DIFFERENT */;
  }
};

var EditorNavigationStacks = class extends Disposable {
  constructor(scope, instantiationService) {
    super();
    this.scope = scope;
    this.instantiationService = instantiationService;
    this.selectionsStack = this._register(this.instantiationService.createInstance(EditorNavigationStack, 0 /* NONE */, this.scope));
    this.editsStack = this._register(this.instantiationService.createInstance(EditorNavigationStack, 1 /* EDITS */, this.scope));
    this.navigationsStack = this._register(this.instantiationService.createInstance(EditorNavigationStack, 2 /* NAVIGATION */, this.scope));
    this.stacks = [
      this.selectionsStack,
      this.editsStack,
      this.navigationsStack
    ];
    this.onDidChange = Event2.any(
      this.selectionsStack.onDidChange,
      this.editsStack.onDidChange,
      this.navigationsStack.onDidChange
    );
  }
  canGoForward(filter2) {
    return this.getStack(filter2).canGoForward();
  }
  goForward(filter2) {
    return this.getStack(filter2).goForward();
  }
  canGoBack(filter2) {
    return this.getStack(filter2).canGoBack();
  }
  goBack(filter2) {
    return this.getStack(filter2).goBack();
  }
  goPrevious(filter2) {
    return this.getStack(filter2).goPrevious();
  }
  canGoLast(filter2) {
    return this.getStack(filter2).canGoLast();
  }
  goLast(filter2) {
    return this.getStack(filter2).goLast();
  }
  getStack(filter2 = 0 /* NONE */) {
    switch (filter2) {
      case 0 /* NONE */:
        return this.selectionsStack;
      case 1 /* EDITS */:
        return this.editsStack;
      case 2 /* NAVIGATION */:
        return this.navigationsStack;
    }
  }
  handleActiveEditorChange(editorPane) {
    this.selectionsStack.notifyNavigation(editorPane);
  }
  handleActiveEditorSelectionChange(editorPane, event) {
    const previous = this.selectionsStack.current;
    this.selectionsStack.notifyNavigation(editorPane, event);
    if (event.reason === 3 /* EDIT */) {
      this.editsStack.notifyNavigation(editorPane, event);
    } else if ((event.reason === 4 /* NAVIGATION */ || event.reason === 5 /* JUMP */) && !this.selectionsStack.isNavigating()) {
      if (event.reason === 5 /* JUMP */ && !this.navigationsStack.isNavigating()) {
        if (previous) {
          this.navigationsStack.addOrReplace(previous.groupId, previous.editor, previous.selection);
        }
      }
      this.navigationsStack.notifyNavigation(editorPane, event);
    }
  }
  clear() {
    for (const stack of this.stacks) {
      stack.clear();
    }
  }
  remove(arg1) {
    for (const stack of this.stacks) {
      stack.remove(arg1);
    }
  }
  move(event) {
    for (const stack of this.stacks) {
      stack.move(event);
    }
  }
};

EditorNavigationStacks = __decorateClass([
  __decorateParam(1, IInstantiationService)
], EditorNavigationStacks);

var NoOpEditorNavigationStacks = class {
  constructor() {
    this.onDidChange = Event2.None;
  }
  canGoForward() {
    return false;
  }
  async goForward() {
  }
  canGoBack() {
    return false;
  }
  async goBack() {
  }
  async goPrevious() {
  }
  canGoLast() {
    return false;
  }
  async goLast() {
  }
  handleActiveEditorChange() {
  }
  handleActiveEditorSelectionChange() {
  }
  clear() {
  }
  remove() {
  }
  move() {
  }
  dispose() {
  }
};

var EditorNavigationStack = class extends Disposable {
  constructor(filter2, scope, instantiationService, editorService, editorGroupService, logService) {
    super();
    this.filter = filter2;
    this.scope = scope;
    this.editorService = editorService;
    this.editorGroupService = editorGroupService;
    this.logService = logService;
    this._onDidChange = this._register(new Emitter());
    this.onDidChange = this._onDidChange.event;
    this.mapEditorToDisposable = this._register(new DisposableMap());
    this.mapGroupToDisposable = this._register(new DisposableMap());
    this.stack = [];
    this.index = -1;
    this.previousIndex = -1;
    this.navigating = false;
    this.currentSelectionState = void 0;
    this.editorHelper = instantiationService.createInstance(EditorHelper);
    this.registerListeners();
  }
  static {
    this.MAX_STACK_SIZE = 50;
  }
  get current() {
    return this.stack[this.index];
  }
  set current(entry) {
    if (entry) {
      this.stack[this.index] = entry;
    }
  }
  registerListeners() {
    this._register(this.onDidChange(() => this.traceStack()));
    this._register(this.logService.onDidChangeLogLevel(() => this.traceStack()));
    this._register(this.editorGroupService.onDidRemoveGroup((group2) => {
      this.mapGroupToDisposable.deleteAndDispose(group2.id);
    }));
  }
  traceStack() {
    if (this.logService.getLevel() !== 1 /* Trace */) {
      return;
    }
    const entryLabels = [];
    for (const entry of this.stack) {
      if (typeof entry.selection?.log === "function") {
        entryLabels.push(`- group: ${entry.groupId}, editor: ${entry.editor.resource?.toString()}, selection: ${entry.selection.log()}`);
      } else {
        entryLabels.push(`- group: ${entry.groupId}, editor: ${entry.editor.resource?.toString()}, selection: <none>`);
      }
    }
    if (entryLabels.length === 0) {
      this.trace(`index: ${this.index}, navigating: ${this.isNavigating()}: <empty>`);
    } else {
      this.trace(`index: ${this.index}, navigating: ${this.isNavigating()}
${entryLabels.join("\n")}
			`);
    }
  }
  trace(msg, editor = null, event) {
    if (this.logService.getLevel() !== 1 /* Trace */) {
      return;
    }
    let filterLabel;
    switch (this.filter) {
      case 0 /* NONE */:
        filterLabel = "global";
        break;
      case 1 /* EDITS */:
        filterLabel = "edits";
        break;
      case 2 /* NAVIGATION */:
        filterLabel = "navigation";
        break;
    }
    let scopeLabel;
    switch (this.scope) {
      case 0 /* DEFAULT */:
        scopeLabel = "default";
        break;
      case 1 /* EDITOR_GROUP */:
        scopeLabel = "editorGroup";
        break;
      case 2 /* EDITOR */:
        scopeLabel = "editor";
        break;
    }
    if (editor !== null) {
      this.logService.trace(`[History stack ${filterLabel}-${scopeLabel}]: ${msg} (editor: ${editor?.resource?.toString()}, event: ${this.traceEvent(event)})`);
    } else {
      this.logService.trace(`[History stack ${filterLabel}-${scopeLabel}]: ${msg}`);
    }
  }
  traceEvent(event) {
    if (!event) {
      return "<none>";
    }
    switch (event.reason) {
      case 3 /* EDIT */:
        return "edit";
      case 4 /* NAVIGATION */:
        return "navigation";
      case 5 /* JUMP */:
        return "jump";
      case 1 /* PROGRAMMATIC */:
        return "programmatic";
      case 2 /* USER */:
        return "user";
    }
  }
  registerGroupListeners(groupId) {
    if (!this.mapGroupToDisposable.has(groupId)) {
      const group2 = this.editorGroupService.getGroup(groupId);
      if (group2) {
        this.mapGroupToDisposable.set(groupId, group2.onWillMoveEditor((e4) => this.onWillMoveEditor(e4)));
      }
    }
  }
  onWillMoveEditor(e4) {
    this.trace("onWillMoveEditor()", e4.editor);
    if (this.scope === 1 /* EDITOR_GROUP */) {
      return;
    }
    for (const entry of this.stack) {
      if (entry.groupId !== e4.groupId) {
        continue;
      }
      if (!this.editorHelper.matchesEditor(e4.editor, entry.editor)) {
        continue;
      }
      entry.groupId = e4.target;
    }
  }
  //#region Stack Mutation
  notifyNavigation(editorPane, event) {
    this.trace("notifyNavigation()", editorPane?.input, event);
    const isSelectionAwareEditorPane = isEditorPaneWithSelection(editorPane);
    const hasValidEditor = editorPane?.input && !editorPane.input.isDisposed();
    if (this.navigating) {
      this.trace(`notifyNavigation() ignoring (navigating)`, editorPane?.input, event);
      if (isSelectionAwareEditorPane && hasValidEditor) {
        this.trace("notifyNavigation() updating current selection state", editorPane?.input, event);
        this.currentSelectionState = new EditorSelectionState({ groupId: editorPane.group.id, editor: editorPane.input }, editorPane.getSelection(), event?.reason);
      } else {
        this.trace("notifyNavigation() dropping current selection state", editorPane?.input, event);
        this.currentSelectionState = void 0;
      }
    } else {
      this.trace(`notifyNavigation() not ignoring`, editorPane?.input, event);
      if (isSelectionAwareEditorPane && hasValidEditor) {
        this.onSelectionAwareEditorNavigation(editorPane.group.id, editorPane.input, editorPane.getSelection(), event);
      } else {
        this.currentSelectionState = void 0;
        if (hasValidEditor) {
          this.onNonSelectionAwareEditorNavigation(editorPane.group.id, editorPane.input);
        }
      }
    }
  }
  onSelectionAwareEditorNavigation(groupId, editor, selection, event) {
    if (this.current?.groupId === groupId && !selection && this.editorHelper.matchesEditor(this.current.editor, editor)) {
      return;
    }
    this.trace("onSelectionAwareEditorNavigation()", editor, event);
    const stateCandidate = new EditorSelectionState({ groupId, editor }, selection, event?.reason);
    if (!this.currentSelectionState || this.currentSelectionState.justifiesNewNavigationEntry(stateCandidate)) {
      this.doAdd(groupId, editor, stateCandidate.selection);
    } else {
      this.doReplace(groupId, editor, stateCandidate.selection);
    }
    this.currentSelectionState = stateCandidate;
  }
  onNonSelectionAwareEditorNavigation(groupId, editor) {
    if (this.current?.groupId === groupId && this.editorHelper.matchesEditor(this.current.editor, editor)) {
      return;
    }
    this.trace("onNonSelectionAwareEditorNavigation()", editor);
    this.doAdd(groupId, editor);
  }
  doAdd(groupId, editor, selection) {
    if (!this.navigating) {
      this.addOrReplace(groupId, editor, selection);
    }
  }
  doReplace(groupId, editor, selection) {
    if (!this.navigating) {
      this.addOrReplace(
        groupId,
        editor,
        selection,
        true
        /* force replace */
      );
    }
  }
  addOrReplace(groupId, editorCandidate, selection, forceReplace) {
    this.registerGroupListeners(groupId);
    let replace = false;
    if (this.current) {
      if (forceReplace) {
        replace = true;
      } else if (this.shouldReplaceStackEntry(this.current, { groupId, editor: editorCandidate, selection })) {
        replace = true;
      }
    }
    const editor = this.editorHelper.preferResourceEditorInput(editorCandidate);
    if (!editor) {
      return;
    }
    if (replace) {
      this.trace("replace()", editor);
    } else {
      this.trace("add()", editor);
    }
    const newStackEntry = { groupId, editor, selection };
    const removedEntries = [];
    if (replace) {
      if (this.current) {
        removedEntries.push(this.current);
      }
      this.current = newStackEntry;
    } else {
      if (this.stack.length > this.index + 1) {
        for (let i2 = this.index + 1; i2 < this.stack.length; i2++) {
          removedEntries.push(this.stack[i2]);
        }
        this.stack = this.stack.slice(0, this.index + 1);
      }
      this.stack.splice(this.index + 1, 0, newStackEntry);
      if (this.stack.length > EditorNavigationStack.MAX_STACK_SIZE) {
        removedEntries.push(this.stack.shift());
        if (this.previousIndex >= 0) {
          this.previousIndex--;
        }
      } else {
        this.setIndex(
          this.index + 1,
          true
          /* skip event, we fire it later */
        );
      }
    }
    for (const removedEntry of removedEntries) {
      this.editorHelper.clearOnEditorDispose(removedEntry.editor, this.mapEditorToDisposable);
    }
    if (isEditorInput(editor)) {
      this.editorHelper.onEditorDispose(editor, () => this.remove(editor), this.mapEditorToDisposable);
    }
    this._onDidChange.fire();
  }
  shouldReplaceStackEntry(entry, candidate) {
    if (entry.groupId !== candidate.groupId) {
      return false;
    }
    if (!this.editorHelper.matchesEditor(entry.editor, candidate.editor)) {
      return false;
    }
    if (!entry.selection) {
      return true;
    }
    if (!candidate.selection) {
      return false;
    }
    return entry.selection.compare(candidate.selection) === 1 /* IDENTICAL */;
  }
  move(event) {
    if (event.isOperation(2 /* MOVE */)) {
      for (const entry of this.stack) {
        if (this.editorHelper.matchesEditor(event, entry.editor)) {
          entry.editor = { resource: event.target.resource };
        }
      }
    }
  }
  remove(arg1) {
    const previousStackSize = this.stack.length;
    this.stack = this.stack.filter((entry) => {
      const matches2 = typeof arg1 === "number" ? entry.groupId === arg1 : this.editorHelper.matchesEditor(arg1, entry.editor);
      if (matches2) {
        this.editorHelper.clearOnEditorDispose(entry.editor, this.mapEditorToDisposable);
      }
      return !matches2;
    });
    if (previousStackSize === this.stack.length) {
      return;
    }
    this.flatten();
    this.index = this.stack.length - 1;
    this.previousIndex = -1;
    if (typeof arg1 === "number") {
      this.mapGroupToDisposable.deleteAndDispose(arg1);
    }
    this._onDidChange.fire();
  }
  flatten() {
    const flattenedStack = [];
    let previousEntry = void 0;
    for (const entry of this.stack) {
      if (previousEntry && this.shouldReplaceStackEntry(entry, previousEntry)) {
        continue;
      }
      previousEntry = entry;
      flattenedStack.push(entry);
    }
    this.stack = flattenedStack;
  }
  clear() {
    this.index = -1;
    this.previousIndex = -1;
    this.stack.splice(0);
    this.mapEditorToDisposable.clearAndDisposeAll();
    this.mapGroupToDisposable.clearAndDisposeAll();
  }
  dispose() {
    this.clear();
    super.dispose();
  }
  //#endregion
  //#region Navigation
  canGoForward() {
    return this.stack.length > this.index + 1;
  }
  async goForward() {
    const navigated = await this.maybeGoCurrent();
    if (navigated) {
      return;
    }
    if (!this.canGoForward()) {
      return;
    }
    this.setIndex(this.index + 1);
    return this.navigate();
  }
  canGoBack() {
    return this.index > 0;
  }
  async goBack() {
    const navigated = await this.maybeGoCurrent();
    if (navigated) {
      return;
    }
    if (!this.canGoBack()) {
      return;
    }
    this.setIndex(this.index - 1);
    return this.navigate();
  }
  async goPrevious() {
    const navigated = await this.maybeGoCurrent();
    if (navigated) {
      return;
    }
    if (this.previousIndex === -1) {
      return this.goBack();
    }
    this.setIndex(this.previousIndex);
    return this.navigate();
  }
  canGoLast() {
    return this.stack.length > 0;
  }
  async goLast() {
    if (!this.canGoLast()) {
      return;
    }
    this.setIndex(this.stack.length - 1);
    return this.navigate();
  }
  async maybeGoCurrent() {
    if (this.filter === 0 /* NONE */) {
      return false;
    }
    if (this.isCurrentSelectionActive()) {
      return false;
    }
    await this.navigate();
    return true;
  }
  isCurrentSelectionActive() {
    if (!this.current?.selection) {
      return false;
    }
    const pane = this.editorService.activeEditorPane;
    if (!isEditorPaneWithSelection(pane)) {
      return false;
    }
    if (pane.group.id !== this.current.groupId) {
      return false;
    }
    if (!pane.input || !this.editorHelper.matchesEditor(pane.input, this.current.editor)) {
      return false;
    }
    const paneSelection = pane.getSelection();
    if (!paneSelection) {
      return false;
    }
    return paneSelection.compare(this.current.selection) === 1 /* IDENTICAL */;
  }
  setIndex(newIndex, skipEvent) {
    this.previousIndex = this.index;
    this.index = newIndex;
    if (!skipEvent) {
      this._onDidChange.fire();
    }
  }
  async navigate() {
    this.navigating = true;
    try {
      if (this.current) {
        await this.doNavigate(this.current);
      }
    } finally {
      this.navigating = false;
    }
  }
  doNavigate(location2) {
    let options3 = /* @__PURE__ */ Object.create(null);
    if (location2.selection) {
      options3 = location2.selection.restore(options3);
    }
    if (isEditorInput(location2.editor)) {
      return this.editorService.openEditor(location2.editor, options3, location2.groupId);
    }
    return this.editorService.openEditor({
      ...location2.editor,
      options: {
        ...location2.editor.options,
        ...options3
      }
    }, location2.groupId);
  }
  isNavigating() {
    return this.navigating;
  }
  //#endregion
};

EditorNavigationStack = __decorateClass([
  __decorateParam(2, IInstantiationService),
  __decorateParam(3, IEditorService),
  __decorateParam(4, IEditorGroupsService),
  __decorateParam(5, ILogService)
], EditorNavigationStack);

var EditorHelper = class {
  constructor(uriIdentityService, lifecycleService, fileService, pathService) {
    this.uriIdentityService = uriIdentityService;
    this.lifecycleService = lifecycleService;
    this.fileService = fileService;
    this.pathService = pathService;
  }
  preferResourceEditorInput(editor) {
    const resource = EditorResourceAccessor.getOriginalUri(editor);
    const hasValidResourceEditorInputScheme = resource?.scheme === Schemas.file || resource?.scheme === Schemas.vscodeRemote || resource?.scheme === Schemas.vscodeUserData || resource?.scheme === this.pathService.defaultUriScheme;
    if (hasValidResourceEditorInputScheme) {
      if (isEditorInput(editor)) {
        const untypedInput = editor.toUntyped();
        if (isResourceEditorInput(untypedInput)) {
          return untypedInput;
        }
      }
      return editor;
    } else {
      return isEditorInput(editor) ? editor : void 0;
    }
  }
  matchesEditor(arg1, inputB) {
    if (arg1 instanceof FileChangesEvent || arg1 instanceof FileOperationEvent) {
      if (isEditorInput(inputB)) {
        return false;
      }
      if (arg1 instanceof FileChangesEvent) {
        return arg1.contains(inputB.resource, 2 /* DELETED */);
      }
      return this.matchesFile(inputB.resource, arg1);
    }
    if (isEditorInput(arg1)) {
      if (isEditorInput(inputB)) {
        return arg1.matches(inputB);
      }
      return this.matchesFile(inputB.resource, arg1);
    }
    if (isEditorInput(inputB)) {
      return this.matchesFile(arg1.resource, inputB);
    }
    return arg1 && inputB && this.uriIdentityService.extUri.isEqual(arg1.resource, inputB.resource);
  }
  matchesFile(resource, arg2) {
    if (arg2 instanceof FileChangesEvent) {
      return arg2.contains(resource, 2 /* DELETED */);
    }
    if (arg2 instanceof FileOperationEvent) {
      return this.uriIdentityService.extUri.isEqualOrParent(resource, arg2.resource);
    }
    if (isEditorInput(arg2)) {
      const inputResource = arg2.resource;
      if (!inputResource) {
        return false;
      }
      if (this.lifecycleService.phase >= 3 /* Restored */ && !this.fileService.hasProvider(inputResource)) {
        return false;
      }
      return this.uriIdentityService.extUri.isEqual(inputResource, resource);
    }
    return this.uriIdentityService.extUri.isEqual(arg2?.resource, resource);
  }
  matchesEditorIdentifier(identifier2, editorPane) {
    if (!editorPane?.group) {
      return false;
    }
    if (identifier2.groupId !== editorPane.group.id) {
      return false;
    }
    return editorPane.input ? identifier2.editor.matches(editorPane.input) : false;
  }
  onEditorDispose(editor, listener, mapEditorToDispose) {
    const toDispose = Event2.once(editor.onWillDispose)(() => {
      mapEditorToDispose.deleteAndDispose(editor);
      listener();
    });
    let disposables = mapEditorToDispose.get(editor);
    if (!disposables) {
      disposables = new DisposableStore();
      mapEditorToDispose.set(editor, disposables);
    }
    disposables.add(toDispose);
  }
  clearOnEditorDispose(editor, mapEditorToDispose) {
    if (!isEditorInput(editor)) {
      return;
    }
    mapEditorToDispose.deleteAndDispose(editor);
  }
};

EditorHelper = __decorateClass([
  __decorateParam(0, IUriIdentityService),
  __decorateParam(1, ILifecycleService),
  __decorateParam(2, IFileService),
  __decorateParam(3, IPathService)
], EditorHelper);
export { HistoryService, EditorSelectionState, EditorNavigationStacks, NoOpEditorNavigationStacks, EditorNavigationStack, EditorHelper };
