// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/browser/parts/editor/editorGroupView.ts
import { IThemeService, Themable } from "./module-0287.mjs";
import { Emitter, Relay } from "./module-0017.mjs";
import { DeferredPromise, Promises, RunOnceWorker } from "./module-0036.mjs";
import { MutableDisposable, toDisposable } from "./module-0012.mjs";
import { $, Dimension, EventHelper, EventType, addDisposableListener, findParentWithClass, getActiveElement, getWindow, isActiveElement, isAncestor, isMouseEvent, trackFocus } from "./module-0075.mjs";
import { EditorGroupModel, isGroupEditorCloseEvent, isGroupEditorOpenEvent, isSerializedEditorGroupModel } from "./module-1102.mjs";
import { coalesce } from "./module-0007.mjs";
import { EditorGroupWatermark } from "./module-1569.mjs";
import { ProgressBar } from "./module-1331.mjs";
import { defaultProgressBarStyles } from "./module-0513.mjs";
import { ServiceCollection } from "./module-0440.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { IEditorProgressService } from "./module-0446.mjs";
import { EditorProgressIndicator } from "./module-1332.mjs";
import { ActiveCompareEditorCanSwapContext, ActiveEditorAvailableEditorIdsContext, ActiveEditorCanRevertContext, ActiveEditorCanSplitInGroupContext, ActiveEditorCanToggleReadonlyContext, ActiveEditorCannotCloseContext, ActiveEditorContext, ActiveEditorDirtyContext, ActiveEditorFirstInGroupContext, ActiveEditorGroupLockedContext, ActiveEditorLastInGroupContext, ActiveEditorPinnedContext, ActiveEditorReadonlyContext, ActiveEditorStickyContext, EditorGroupEditorsCountContext, MultipleEditorsSelectedInGroupContext, ResourceContextKey, SelectedEditorsInGroupFileOrUntitledResourceContextKey, SideBySideEditorActiveContext, TextCompareEditorActiveContext, TextCompareEditorVisibleContext, TwoEditorsSelectedInGroupContext, applyAvailableEditorIds } from "./module-0949.mjs";
import { EditorTitleControl } from "./module-1583.mjs";
import { EditorPanes } from "./module-1567.mjs";
import { DEFAULT_EDITOR_ASSOCIATION, EditorResourceAccessor, TEXT_DIFF_EDITOR_ID } from "./module-0925.mjs";
import { SideBySideEditorInput } from "./module-1095.mjs";
import { DiffEditorInput } from "./module-1101.mjs";
import { Schemas } from "./module-0033.mjs";
import { ActionBar } from "./module-0477.mjs";
import { localize } from "./module-0001.mjs";
import { IMenuService, MenuId } from "./module-0092.mjs";
import { getActionBarActions } from "./module-0516.mjs";
import { EventType2 } from "./module-0251.mjs";
import { StandardMouseEvent } from "./module-0024.mjs";
import { isLinux, isMacintosh, isNative, isWindows } from "./module-0014.mjs";
import { fillActiveEditorViewState } from "./module-1088.mjs";
import { extname2, isEqual2 } from "./module-0034.mjs";
import { TelemetryTrustedValue } from "./module-0885.mjs";
import { getMimeTypes } from "./module-1354.mjs";
import { hash } from "./module-0039.mjs";
import { URI } from "./module-0032.mjs";
import { EditorPane } from "./module-1089.mjs";
import { createEditorTypeActions, getAvailableEditorTypes } from "./module-1568.mjs";
import { Separator, SubmenuAction } from "./module-0082.mjs";
import { EDITOR_GROUP_EMPTY_BACKGROUND, EDITOR_GROUP_HEADER_BORDER, EDITOR_GROUP_HEADER_NO_TABS_BACKGROUND, EDITOR_GROUP_HEADER_TABS_BACKGROUND } from "./module-0912.mjs";
import { contrastBorder } from "./module-0227.mjs";
import { editorBackground } from "./module-0229.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { IKeybindingService } from "./module-0352.mjs";
import { IContextMenuService } from "./module-0488.mjs";
import { IDialogService, IFileDialogService } from "./module-0267.mjs";
import { IEditorService } from "./module-0934.mjs";
import { IFilesConfigurationService } from "./module-0930.mjs";
import { IUriIdentityService } from "./module-0510.mjs";
import { ILogService } from "./module-0095.mjs";
import { IEditorResolverService } from "./module-1113.mjs";
import { IHostService } from "./module-1117.mjs";
import { IFileService } from "./module-0269.mjs";
import { ICommandService } from "./module-0087.mjs";


// src/vs/workbench/browser/parts/editor/editorGroupView.ts
var EditorGroupView = class extends Themable {
  constructor(from, editorPartsView, groupsView, groupsLabel, _index, options3, instantiationService, contextKeyService, themeService, telemetryService, keybindingService, menuService, contextMenuService, fileDialogService, editorService, filesConfigurationService, uriIdentityService, logService, editorResolverService, hostService, dialogService, fileService, commandService) {
    super(themeService);
    this.editorPartsView = editorPartsView;
    this.groupsView = groupsView;
    this.groupsLabel = groupsLabel;
    this._index = _index;
    this.instantiationService = instantiationService;
    this.contextKeyService = contextKeyService;
    this.telemetryService = telemetryService;
    this.keybindingService = keybindingService;
    this.menuService = menuService;
    this.contextMenuService = contextMenuService;
    this.fileDialogService = fileDialogService;
    this.editorService = editorService;
    this.filesConfigurationService = filesConfigurationService;
    this.uriIdentityService = uriIdentityService;
    this.logService = logService;
    this.editorResolverService = editorResolverService;
    this.hostService = hostService;
    this.dialogService = dialogService;
    this.fileService = fileService;
    this.commandService = commandService;
    //#region events
    this._onDidFocus = this._register(new Emitter());
    this.onDidFocus = this._onDidFocus.event;
    this._onWillDispose = this._register(new Emitter());
    this.onWillDispose = this._onWillDispose.event;
    this._onDidModelChange = this._register(new Emitter());
    this.onDidModelChange = this._onDidModelChange.event;
    this._onDidActiveEditorChange = this._register(new Emitter());
    this.onDidActiveEditorChange = this._onDidActiveEditorChange.event;
    this._onDidOpenEditorFail = this._register(new Emitter());
    this.onDidOpenEditorFail = this._onDidOpenEditorFail.event;
    this._onWillCloseEditor = this._register(new Emitter());
    this.onWillCloseEditor = this._onWillCloseEditor.event;
    this._onDidCloseEditor = this._register(new Emitter());
    this.onDidCloseEditor = this._onDidCloseEditor.event;
    this._onWillMoveEditor = this._register(new Emitter());
    this.onWillMoveEditor = this._onWillMoveEditor.event;
    this._onWillOpenEditor = this._register(new Emitter());
    this.onWillOpenEditor = this._onWillOpenEditor.event;
    /**
     * Optional inset (in px) reserved on the right of the editor pane while the
     * title control keeps the full group width. Used by the Agents window to dock
     * the detail panel beside the editor content under one full-width tab bar.
     * `0` (default) is a no-op for all other layouts.
     */
    this._contentRightInset = 0;
    this._onDidRelayout = this._register(new Emitter());
    this.onDidRelayout = this._onDidRelayout.event;
    this.disposedEditorsWorker = this._register(new RunOnceWorker((editors) => this.handleDisposedEditors(editors), 0));
    this.mapEditorToPendingConfirmation = /* @__PURE__ */ new Map();
    this.containerToolBarMenuDisposable = this._register(new MutableDisposable());
    this.whenRestoredPromise = new DeferredPromise();
    this.whenRestored = this.whenRestoredPromise.p;
    this._disposed = false;
    //#endregion
    //#region ISerializableView
    this.element = $("div");
    this._onDidChange = this._register(new Relay());
    this.onDidChange = this._onDidChange.event;
    if (from instanceof EditorGroupView) {
      this.model = this._register(from.model.clone());
    } else if (isSerializedEditorGroupModel(from)) {
      this.model = this._register(instantiationService.createInstance(EditorGroupModel, from));
    } else {
      this.model = this._register(instantiationService.createInstance(EditorGroupModel, void 0));
    }
    {
      this.scopedContextKeyService = this._register(this.contextKeyService.createScoped(this.element));
      this.element.classList.add(...coalesce(["editor-group-container", this.model.isLocked ? "locked" : void 0]));
      this.registerContainerListeners();
      this.createContainerToolbar();
      this.createContainerContextMenu();
      this._register(this.instantiationService.createInstance(EditorGroupWatermark, this.element));
      this.progressBar = this._register(new ProgressBar(this.element, defaultProgressBarStyles));
      this.progressBar.hide();
      this.scopedInstantiationService = this._register(this.instantiationService.createChild(new ServiceCollection(
        [IContextKeyService, this.scopedContextKeyService],
        [IEditorProgressService, this._register(new EditorProgressIndicator(this.progressBar, this))]
      )));
      this.resourceContext = this._register(this.scopedInstantiationService.createInstance(ResourceContextKey));
      this.handleGroupContextKeys();
      this.titleContainer = $(".title");
      this.element.appendChild(this.titleContainer);
      this.titleControl = this._register(this.scopedInstantiationService.createInstance(EditorTitleControl, this.titleContainer, this.editorPartsView, this.groupsView, this, this.model, options3?.menuIds, options3?.showHeader === true));
      this.editorContainer = $(".editor-container");
      this.element.appendChild(this.editorContainer);
      this.editorPane = this._register(this.scopedInstantiationService.createInstance(EditorPanes, this.element, this.editorContainer, this));
      this._onDidChange.input = this.editorPane.onDidChangeSizeConstraints;
      this.doTrackFocus();
      this.updateTitleContainer();
      this.updateContainer();
      this.updateStyles();
    }
    const restoreEditorsPromise = this.restoreEditors(from, options3) ?? Promise.resolve();
    restoreEditorsPromise.finally(() => {
      this.whenRestoredPromise.complete();
    });
    this.registerListeners();
  }
  //#region factory
  static createNew(editorPartsView, groupsView, groupsLabel, groupIndex, instantiationService, options3) {
    return instantiationService.createInstance(EditorGroupView, null, editorPartsView, groupsView, groupsLabel, groupIndex, options3);
  }
  static createFromSerialized(serialized, editorPartsView, groupsView, groupsLabel, groupIndex, instantiationService, options3) {
    return instantiationService.createInstance(EditorGroupView, serialized, editorPartsView, groupsView, groupsLabel, groupIndex, options3);
  }
  static createCopy(copyFrom, editorPartsView, groupsView, groupsLabel, groupIndex, instantiationService, options3) {
    return instantiationService.createInstance(EditorGroupView, copyFrom, editorPartsView, groupsView, groupsLabel, groupIndex, options3);
  }
  handleGroupContextKeys() {
    const groupActiveEditorDirtyContext = this.editorPartsView.bind(ActiveEditorDirtyContext, this);
    const groupActiveEditorPinnedContext = this.editorPartsView.bind(ActiveEditorPinnedContext, this);
    const groupActiveEditorFirstContext = this.editorPartsView.bind(ActiveEditorFirstInGroupContext, this);
    const groupActiveEditorLastContext = this.editorPartsView.bind(ActiveEditorLastInGroupContext, this);
    const groupActiveEditorStickyContext = this.editorPartsView.bind(ActiveEditorStickyContext, this);
    const groupEditorsCountContext = this.editorPartsView.bind(EditorGroupEditorsCountContext, this);
    const groupLockedContext = this.editorPartsView.bind(ActiveEditorGroupLockedContext, this);
    const multipleEditorsSelectedContext = MultipleEditorsSelectedInGroupContext.bindTo(this.scopedContextKeyService);
    const twoEditorsSelectedContext = TwoEditorsSelectedInGroupContext.bindTo(this.scopedContextKeyService);
    const selectedEditorsHaveFileOrUntitledResourceContext = SelectedEditorsInGroupFileOrUntitledResourceContextKey.bindTo(this.scopedContextKeyService);
    const groupActiveEditorContext = this.editorPartsView.bind(ActiveEditorContext, this);
    const groupActiveEditorIsReadonly = this.editorPartsView.bind(ActiveEditorReadonlyContext, this);
    const groupActiveEditorCanRevert = this.editorPartsView.bind(ActiveEditorCanRevertContext, this);
    const groupActiveEditorCanToggleReadonly = this.editorPartsView.bind(ActiveEditorCanToggleReadonlyContext, this);
    const groupActiveCompareEditorCanSwap = this.editorPartsView.bind(ActiveCompareEditorCanSwapContext, this);
    const groupTextCompareEditorVisibleContext = this.editorPartsView.bind(TextCompareEditorVisibleContext, this);
    const groupTextCompareEditorActiveContext = this.editorPartsView.bind(TextCompareEditorActiveContext, this);
    const groupActiveEditorAvailableEditorIds = this.editorPartsView.bind(ActiveEditorAvailableEditorIdsContext, this);
    const groupActiveEditorCanSplitInGroupContext = this.editorPartsView.bind(ActiveEditorCanSplitInGroupContext, this);
    const groupActiveEditorCannotCloseContext = this.editorPartsView.bind(ActiveEditorCannotCloseContext, this);
    const groupActiveEditorIsSideBySideEditorContext = this.editorPartsView.bind(SideBySideEditorActiveContext, this);
    const activeEditorListener = this._register(new MutableDisposable());
    const observeActiveEditor = () => {
      activeEditorListener.clear();
      this.scopedContextKeyService.bufferChangeEvents(() => {
        const activeEditor = this.activeEditor;
        const activeEditorPane = this.activeEditorPane;
        this.resourceContext.set(EditorResourceAccessor.getOriginalUri(activeEditor, { supportSideBySide: 1 /* PRIMARY */ }));
        applyAvailableEditorIds(groupActiveEditorAvailableEditorIds, activeEditor, this.editorResolverService);
        if (activeEditor) {
          groupActiveEditorCanSplitInGroupContext.set(activeEditor.hasCapability(32 /* CanSplitInGroup */));
          groupActiveEditorCannotCloseContext.set(activeEditor.hasCapability(8192 /* CannotClose */));
          groupActiveEditorIsSideBySideEditorContext.set(activeEditor.typeId === SideBySideEditorInput.ID);
          groupActiveEditorDirtyContext.set(activeEditor.isDirty() && !activeEditor.isSaving());
          activeEditorListener.value = activeEditor.onDidChangeDirty(() => {
            groupActiveEditorDirtyContext.set(activeEditor.isDirty() && !activeEditor.isSaving());
          });
        } else {
          groupActiveEditorCanSplitInGroupContext.set(false);
          groupActiveEditorCannotCloseContext.set(false);
          groupActiveEditorIsSideBySideEditorContext.set(false);
          groupActiveEditorDirtyContext.set(false);
        }
        if (activeEditorPane) {
          groupActiveEditorContext.set(activeEditorPane.getId());
          groupActiveEditorCanRevert.set(!activeEditorPane.input.hasCapability(4 /* Untitled */));
          groupActiveEditorIsReadonly.set(!!activeEditorPane.input.isReadonly());
          const primaryEditorResource = EditorResourceAccessor.getOriginalUri(activeEditorPane.input, { supportSideBySide: 1 /* PRIMARY */ });
          const secondaryEditorResource = EditorResourceAccessor.getOriginalUri(activeEditorPane.input, { supportSideBySide: 2 /* SECONDARY */ });
          groupActiveCompareEditorCanSwap.set(activeEditorPane.input instanceof DiffEditorInput && !activeEditorPane.input.original.isReadonly() && !!primaryEditorResource && (this.fileService.hasProvider(primaryEditorResource) || primaryEditorResource.scheme === Schemas.untitled) && !!secondaryEditorResource && (this.fileService.hasProvider(secondaryEditorResource) || secondaryEditorResource.scheme === Schemas.untitled));
          groupActiveEditorCanToggleReadonly.set(!!primaryEditorResource && this.fileService.hasProvider(primaryEditorResource) && !this.fileService.hasCapability(primaryEditorResource, 2048 /* Readonly */));
          const activePaneDiffEditor = activeEditorPane?.getId() === TEXT_DIFF_EDITOR_ID;
          groupTextCompareEditorActiveContext.set(activePaneDiffEditor);
          groupTextCompareEditorVisibleContext.set(activePaneDiffEditor);
        } else {
          groupActiveEditorContext.reset();
          groupActiveEditorCanRevert.reset();
          groupActiveEditorIsReadonly.reset();
          groupActiveCompareEditorCanSwap.reset();
          groupActiveEditorCanToggleReadonly.reset();
        }
      });
    };
    const updateGroupContextKeys = (e) => {
      switch (e.kind) {
        case 3 /* GROUP_LOCKED */:
          groupLockedContext.set(this.isLocked);
          break;
        case 8 /* EDITOR_ACTIVE */:
          groupActiveEditorFirstContext.set(this.model.isFirst(this.model.activeEditor));
          groupActiveEditorLastContext.set(this.model.isLast(this.model.activeEditor));
          groupActiveEditorPinnedContext.set(this.model.activeEditor ? this.model.isPinned(this.model.activeEditor) : false);
          groupActiveEditorStickyContext.set(this.model.activeEditor ? this.model.isSticky(this.model.activeEditor) : false);
          break;
        case 6 /* EDITOR_CLOSE */:
          groupActiveEditorPinnedContext.set(this.model.activeEditor ? this.model.isPinned(this.model.activeEditor) : false);
          groupActiveEditorStickyContext.set(this.model.activeEditor ? this.model.isSticky(this.model.activeEditor) : false);
          break;
        case 5 /* EDITOR_OPEN */:
        case 7 /* EDITOR_MOVE */:
          groupActiveEditorFirstContext.set(this.model.isFirst(this.model.activeEditor));
          groupActiveEditorLastContext.set(this.model.isLast(this.model.activeEditor));
          break;
        case 11 /* EDITOR_PIN */:
          if (e.editor && e.editor === this.model.activeEditor) {
            groupActiveEditorPinnedContext.set(this.model.isPinned(this.model.activeEditor));
          }
          break;
        case 13 /* EDITOR_STICKY */:
          if (e.editor && e.editor === this.model.activeEditor) {
            groupActiveEditorStickyContext.set(this.model.isSticky(this.model.activeEditor));
          }
          break;
        case 10 /* EDITOR_CAPABILITIES */:
          if (e.editor && e.editor === this.model.activeEditor) {
            observeActiveEditor();
          }
          break;
        case 4 /* EDITORS_SELECTION */:
          multipleEditorsSelectedContext.set(this.model.selectedEditors.length > 1);
          twoEditorsSelectedContext.set(this.model.selectedEditors.length === 2);
          selectedEditorsHaveFileOrUntitledResourceContext.set(this.model.selectedEditors.every((e2) => e2.resource && (this.fileService.hasProvider(e2.resource) || e2.resource.scheme === Schemas.untitled)));
          break;
      }
      groupEditorsCountContext.set(this.count);
    };
    this._register(this.onDidModelChange((e) => updateGroupContextKeys(e)));
    this._register(this.onDidActiveEditorChange(() => observeActiveEditor()));
    observeActiveEditor();
    updateGroupContextKeys({ kind: 8 /* EDITOR_ACTIVE */ });
    updateGroupContextKeys({ kind: 3 /* GROUP_LOCKED */ });
  }
  registerContainerListeners() {
    this._register(addDisposableListener(this.element, EventType.DBLCLICK, (e) => {
      if (this.isEmpty) {
        EventHelper.stop(e);
        this.editorService.openEditor({
          resource: void 0,
          options: {
            pinned: true,
            override: DEFAULT_EDITOR_ASSOCIATION.id
          }
        }, this.id);
      }
    }));
    this._register(addDisposableListener(this.element, EventType.AUXCLICK, (e) => {
      if (this.isEmpty && e.button === 1) {
        EventHelper.stop(e, true);
        this.groupsView.removeGroup(this);
      }
    }));
  }
  createContainerToolbar() {
    const toolbarContainer = $(".editor-group-container-toolbar");
    this.element.appendChild(toolbarContainer);
    const containerToolbar = this._register(new ActionBar(toolbarContainer, {
      ariaLabel: localize(6647, null),
      highlightToggledItems: true
    }));
    const containerToolbarMenu = this._register(this.menuService.createMenu(MenuId.EmptyEditorGroup, this.scopedContextKeyService));
    const updateContainerToolbar = () => {
      this.containerToolBarMenuDisposable.value = toDisposable(() => containerToolbar.clear());
      const actions = getActionBarActions(
        containerToolbarMenu.getActions({ arg: { groupId: this.id }, shouldForwardArgs: true }),
        "navigation"
      );
      for (const action of [...actions.primary, ...actions.secondary]) {
        const keybinding = this.keybindingService.lookupKeybinding(action.id);
        containerToolbar.push(action, { icon: true, label: false, keybinding: keybinding?.getLabel() });
      }
    };
    updateContainerToolbar();
    this._register(containerToolbarMenu.onDidChange(updateContainerToolbar));
  }
  createContainerContextMenu() {
    this._register(addDisposableListener(this.element, EventType.CONTEXT_MENU, (e) => this.onShowContainerContextMenu(e)));
    this._register(addDisposableListener(this.element, EventType2.Contextmenu, () => this.onShowContainerContextMenu()));
  }
  onShowContainerContextMenu(e) {
    if (!this.isEmpty) {
      return;
    }
    let anchor = this.element;
    if (e) {
      anchor = new StandardMouseEvent(getWindow(this.element), e);
    }
    this.contextMenuService.showContextMenu({
      menuId: MenuId.EmptyEditorGroupContext,
      contextKeyService: this.contextKeyService,
      getAnchor: () => anchor,
      onHide: () => this.focus()
    });
  }
  doTrackFocus() {
    const containerFocusTracker = this._register(trackFocus(this.element));
    this._register(containerFocusTracker.onDidFocus(() => {
      if (this.isEmpty) {
        this._onDidFocus.fire();
      }
    }));
    const handleTitleClickOrTouch = (e) => {
      let target;
      if (isMouseEvent(e)) {
        if (e.button !== 0 || isMacintosh && e.ctrlKey) {
          return void 0;
        }
        target = e.target;
      } else {
        target = e.initialTarget;
      }
      if (findParentWithClass(target, "monaco-action-bar", this.titleContainer) || findParentWithClass(target, "monaco-breadcrumb-item", this.titleContainer)) {
        return;
      }
      setTimeout(() => {
        this.focus();
      });
    };
    this._register(addDisposableListener(this.titleContainer, EventType.MOUSE_DOWN, (e) => handleTitleClickOrTouch(e)));
    this._register(addDisposableListener(this.titleContainer, EventType2.Tap, (e) => handleTitleClickOrTouch(e)));
    this._register(this.editorPane.onDidFocus(() => {
      this._onDidFocus.fire();
    }));
  }
  updateContainer() {
    if (this.isEmpty) {
      this.element.classList.add("empty");
      this.element.tabIndex = 0;
      this.element.setAttribute("aria-label", localize(6648, null, this.ariaLabel));
    } else {
      this.element.classList.remove("empty");
      this.element.removeAttribute("tabIndex");
      this.element.removeAttribute("aria-label");
    }
    this.updateStyles();
  }
  updateTitleContainer() {
    this.titleContainer.classList.toggle("tabs", this.groupsView.partOptions.showTabs === "multiple");
    this.titleContainer.classList.toggle("show-file-icons", this.groupsView.partOptions.showIcons);
  }
  restoreEditors(from, groupViewOptions) {
    if (this.count === 0) {
      return;
    }
    let options3;
    if (from instanceof EditorGroupView) {
      options3 = fillActiveEditorViewState(from);
    } else {
      options3 = /* @__PURE__ */ Object.create(null);
    }
    const activeEditor = this.model.activeEditor;
    if (!activeEditor) {
      return;
    }
    options3.pinned = this.model.isPinned(activeEditor);
    options3.sticky = this.model.isSticky(activeEditor);
    options3.preserveFocus = true;
    const internalOptions = {
      preserveWindowOrder: true,
      // handle window order after editor is restored
      skipTitleUpdate: true
      // update the title later for all editors at once
    };
    const activeElement = getActiveElement();
    const result = this.doShowEditor(activeEditor, {
      active: true,
      isNew: false
      /* restored */
    }, options3, internalOptions).then(() => {
      if (this.groupsView.activeGroup === this && activeElement && isActiveElement(activeElement) && !groupViewOptions?.preserveFocus) {
        this.focus();
      }
    });
    this.titleControl.openEditors(this.editors);
    return result;
  }
  //#region event handling
  registerListeners() {
    this._register(this.model.onDidModelChange((e) => this.onDidGroupModelChange(e)));
    this._register(this.groupsView.onDidChangeEditorPartOptions((e) => this.onDidChangeEditorPartOptions(e)));
    this._register(this.groupsView.onDidVisibilityChange((e) => this.onDidVisibilityChange(e)));
    this._register(this.onDidFocus(() => this.onDidGainFocus()));
  }
  onDidGroupModelChange(e) {
    this._onDidModelChange.fire(e);
    switch (e.kind) {
      case 3 /* GROUP_LOCKED */:
        this.element.classList.toggle("locked", this.isLocked);
        break;
      case 4 /* EDITORS_SELECTION */:
        this.onDidChangeEditorSelection();
        break;
    }
    if (!e.editor) {
      return;
    }
    switch (e.kind) {
      case 5 /* EDITOR_OPEN */:
        if (isGroupEditorOpenEvent(e)) {
          this.onDidOpenEditor(e.editor, e.editorIndex);
        }
        break;
      case 6 /* EDITOR_CLOSE */:
        if (isGroupEditorCloseEvent(e)) {
          this.handleOnDidCloseEditor(e.editor, e.editorIndex, e.context, e.sticky);
        }
        break;
      case 15 /* EDITOR_WILL_DISPOSE */:
        this.onWillDisposeEditor(e.editor);
        break;
      case 14 /* EDITOR_DIRTY */:
        this.onDidChangeEditorDirty(e.editor);
        break;
      case 12 /* EDITOR_TRANSIENT */:
        this.onDidChangeEditorTransient(e.editor);
        break;
      case 9 /* EDITOR_LABEL */:
        this.onDidChangeEditorLabel(e.editor);
        break;
      case 10 /* EDITOR_CAPABILITIES */:
        this.onDidChangeEditorCapabilities(e.editor);
        break;
    }
  }
  onDidOpenEditor(editor, editorIndex) {
    this.telemetryService.publicLog("editorOpened", this.toEditorTelemetryDescriptor(editor));
    this.updateContainer();
  }
  handleOnDidCloseEditor(editor, editorIndex, context2, sticky) {
    this._onWillCloseEditor.fire({ groupId: this.id, editor, context: context2, index: editorIndex, sticky });
    const editorsToClose = [editor];
    if (editor instanceof SideBySideEditorInput) {
      editorsToClose.push(editor.primary, editor.secondary);
    }
    for (const editor2 of editorsToClose) {
      if (this.canDispose(editor2)) {
        editor2.dispose();
      }
    }
    this.updateContainer();
    this._onDidCloseEditor.fire({ groupId: this.id, editor, context: context2, index: editorIndex, sticky });
  }
  canDispose(editor) {
    for (const groupView of this.editorPartsView.groups) {
      if (groupView instanceof EditorGroupView && groupView.model.contains(editor, {
        strictEquals: true,
        // only if this input is not shared across editor groups
        supportSideBySide: 4 /* ANY */
        // include any side of an opened side by side editor
      })) {
        return false;
      }
    }
    return true;
  }
  toResourceTelemetryDescriptor(resource) {
    if (!resource) {
      return void 0;
    }
    const path = resource ? resource.scheme === Schemas.file ? resource.fsPath : resource.path : void 0;
    if (!path) {
      return void 0;
    }
    let resourceExt = extname2(resource);
    const queryStringLocation = resourceExt.indexOf("?");
    resourceExt = queryStringLocation !== -1 ? resourceExt.substr(0, queryStringLocation) : resourceExt;
    return {
      mimeType: new TelemetryTrustedValue(getMimeTypes(resource).join(", ")),
      scheme: resource.scheme,
      ext: resourceExt,
      path: hash(path)
    };
  }
  toEditorTelemetryDescriptor(editor) {
    const descriptor = editor.getTelemetryDescriptor();
    const resource = EditorResourceAccessor.getOriginalUri(editor, { supportSideBySide: 3 /* BOTH */ });
    if (URI.isUri(resource)) {
      descriptor["resource"] = this.toResourceTelemetryDescriptor(resource);
      return descriptor;
    } else if (resource) {
      if (resource.primary) {
        descriptor["resource"] = this.toResourceTelemetryDescriptor(resource.primary);
      }
      if (resource.secondary) {
        descriptor["resourceSecondary"] = this.toResourceTelemetryDescriptor(resource.secondary);
      }
      return descriptor;
    }
    return descriptor;
  }
  onWillDisposeEditor(editor) {
    this.disposedEditorsWorker.work(editor);
  }
  handleDisposedEditors(disposedEditors) {
    let activeEditor;
    const inactiveEditors = [];
    for (const disposedEditor of disposedEditors) {
      const editorFindResult = this.model.findEditor(disposedEditor);
      if (!editorFindResult) {
        continue;
      }
      const editor = editorFindResult[0];
      if (!editor.isDisposed()) {
        continue;
      }
      if (this.model.isActive(editor)) {
        activeEditor = editor;
      } else {
        inactiveEditors.push(editor);
      }
    }
    for (const inactiveEditor of inactiveEditors) {
      this.doCloseEditor(inactiveEditor, true);
    }
    if (activeEditor) {
      this.doCloseEditor(activeEditor, true);
    }
  }
  onDidChangeEditorPartOptions(event) {
    this.updateTitleContainer();
    this.titleControl.updateOptions(event.oldPartOptions, event.newPartOptions);
    if (event.oldPartOptions.showTabs !== event.newPartOptions.showTabs || event.oldPartOptions.tabHeight !== event.newPartOptions.tabHeight || event.oldPartOptions.showTabs === "multiple" && event.oldPartOptions.pinnedTabsOnSeparateRow !== event.newPartOptions.pinnedTabsOnSeparateRow) {
      this.relayout();
      if (this.model.activeEditor) {
        this.titleControl.openEditors(this.model.getEditors(1 /* SEQUENTIAL */));
      }
    }
    this.updateStyles();
    if (event.oldPartOptions.enablePreview && !event.newPartOptions.enablePreview) {
      if (this.model.previewEditor) {
        this.pinEditor(this.model.previewEditor);
      }
    }
  }
  onDidChangeEditorDirty(editor) {
    this.pinEditor(editor);
    this.titleControl.updateEditorDirty(editor);
  }
  onDidChangeEditorTransient(editor) {
    const transient = this.model.isTransient(editor);
    if (!transient && !this.groupsView.partOptions.enablePreview) {
      this.pinEditor(editor);
    }
  }
  onDidChangeEditorLabel(editor) {
    this.titleControl.updateEditorLabel(editor);
  }
  onDidChangeEditorCapabilities(editor) {
    this.titleControl.updateEditorCapabilities(editor);
  }
  onDidChangeEditorSelection() {
    this.titleControl.updateEditorSelections();
  }
  onDidVisibilityChange(visible) {
    this.editorPane.setVisible(visible);
  }
  onDidGainFocus() {
    if (this.activeEditor) {
      this.model.setTransient(this.activeEditor, false);
    }
  }
  //#endregion
  //#region IEditorGroupView
  get index() {
    return this._index;
  }
  get label() {
    if (this.groupsLabel) {
      return localize(6652, null, this.groupsLabel, this._index + 1);
    }
    return localize(6651, null, this._index + 1);
  }
  get ariaLabel() {
    if (this.groupsLabel) {
      return localize(6650, null, this.groupsLabel, this._index + 1);
    }
    return localize(6649, null, this._index + 1);
  }
  get disposed() {
    return this._disposed;
  }
  get isEmpty() {
    return this.count === 0;
  }
  get titleHeight() {
    return this.titleControl.getHeight();
  }
  notifyIndexChanged(newIndex) {
    if (this._index !== newIndex) {
      this._index = newIndex;
      this.model.setIndex(newIndex);
    }
  }
  notifyLabelChanged(newLabel) {
    if (this.groupsLabel !== newLabel) {
      this.groupsLabel = newLabel;
      this.model.setLabel(newLabel);
    }
  }
  setActive(isActive2) {
    this.active = isActive2;
    if (!isActive2 && this.activeEditor && this.selectedEditors.length > 1) {
      this.setSelection(this.activeEditor, []);
    }
    this.element.classList.toggle("active", isActive2);
    this.element.classList.toggle("inactive", !isActive2);
    this.titleControl.setActive(isActive2);
    this.updateStyles();
    this.model.setActive(
      void 0
      /* entire group got active */
    );
  }
  //#endregion
  //#region basics()
  get id() {
    return this.model.id;
  }
  get windowId() {
    return this.groupsView.windowId;
  }
  get editors() {
    return this.model.getEditors(1 /* SEQUENTIAL */);
  }
  get count() {
    return this.model.count;
  }
  get stickyCount() {
    return this.model.stickyCount;
  }
  /** The container that bounds the editor pane, excluding any docked content inset. */
  get editorPaneContainer() {
    return this.editorContainer;
  }
  get activeEditorPane() {
    return this.editorPane ? this.editorPane.activeEditorPane ?? void 0 : void 0;
  }
  get activeEditor() {
    return this.model.activeEditor;
  }
  get selectedEditors() {
    return this.model.selectedEditors;
  }
  get previewEditor() {
    return this.model.previewEditor;
  }
  isPinned(editorOrIndex) {
    return this.model.isPinned(editorOrIndex);
  }
  isSticky(editorOrIndex) {
    return this.model.isSticky(editorOrIndex);
  }
  isSelected(editor) {
    return this.model.isSelected(editor);
  }
  isTransient(editorOrIndex) {
    return this.model.isTransient(editorOrIndex);
  }
  isActive(editor) {
    return this.model.isActive(editor);
  }
  async setSelection(activeSelectedEditor, inactiveSelectedEditors) {
    if (!this.isActive(activeSelectedEditor)) {
      await this.openEditor(activeSelectedEditor, { activation: 1 /* ACTIVATE */ }, { inactiveSelection: inactiveSelectedEditors });
    } else {
      this.model.setSelection(activeSelectedEditor, inactiveSelectedEditors);
    }
  }
  contains(candidate, options3) {
    return this.model.contains(candidate, options3);
  }
  getEditors(order, options3) {
    return this.model.getEditors(order, options3);
  }
  findEditors(resource, options3) {
    const canonicalResource = this.uriIdentityService.asCanonicalUri(resource);
    return this.getEditors(options3?.order ?? 1 /* SEQUENTIAL */).filter((editor) => {
      if (editor.resource && isEqual2(editor.resource, canonicalResource)) {
        return true;
      }
      if (options3?.supportSideBySide === 1 /* PRIMARY */ || options3?.supportSideBySide === 4 /* ANY */) {
        const primaryResource = EditorResourceAccessor.getCanonicalUri(editor, { supportSideBySide: 1 /* PRIMARY */ });
        if (primaryResource && isEqual2(primaryResource, canonicalResource)) {
          return true;
        }
      }
      if (options3?.supportSideBySide === 2 /* SECONDARY */ || options3?.supportSideBySide === 4 /* ANY */) {
        const secondaryResource = EditorResourceAccessor.getCanonicalUri(editor, { supportSideBySide: 2 /* SECONDARY */ });
        if (secondaryResource && isEqual2(secondaryResource, canonicalResource)) {
          return true;
        }
      }
      return false;
    });
  }
  getEditorByIndex(index2) {
    return this.model.getEditorByIndex(index2);
  }
  getIndexOfEditor(editor) {
    return this.model.indexOf(editor);
  }
  isFirst(editor) {
    return this.model.isFirst(editor);
  }
  isLast(editor) {
    return this.model.isLast(editor);
  }
  focus() {
    if (this.activeEditorPane) {
      this.activeEditorPane.focus();
    } else {
      this.element.focus();
    }
    this._onDidFocus.fire();
  }
  pinEditor(candidate = this.activeEditor || void 0) {
    if (candidate && !this.model.isPinned(candidate)) {
      const editor = this.model.pin(candidate);
      if (editor) {
        this.titleControl.pinEditor(editor);
      }
    }
  }
  stickEditor(candidate = this.activeEditor || void 0) {
    this.doStickEditor(candidate, true);
  }
  unstickEditor(candidate = this.activeEditor || void 0) {
    this.doStickEditor(candidate, false);
  }
  doStickEditor(candidate, sticky) {
    if (candidate && this.model.isSticky(candidate) !== sticky) {
      const oldIndexOfEditor = this.getIndexOfEditor(candidate);
      const editor = sticky ? this.model.stick(candidate) : this.model.unstick(candidate);
      if (!editor) {
        return;
      }
      const newIndexOfEditor = this.getIndexOfEditor(editor);
      if (newIndexOfEditor !== oldIndexOfEditor) {
        this.titleControl.moveEditor(editor, oldIndexOfEditor, newIndexOfEditor, true);
      }
      if (sticky) {
        this.titleControl.stickEditor(editor);
      } else {
        this.titleControl.unstickEditor(editor);
      }
    }
  }
  //#endregion
  //#region openEditor()
  async openEditor(editor, options3, internalOptions) {
    return this.doOpenEditor(editor, options3, {
      // Appply given internal open options
      ...internalOptions,
      // Allow to match on a side-by-side editor when same
      // editor is opened on both sides. In that case we
      // do not want to open a new editor but reuse that one.
      supportSideBySide: 3 /* BOTH */
    });
  }
  async doOpenEditor(editor, options3, internalOptions) {
    if (!editor || editor.isDisposed()) {
      return;
    }
    this._onWillOpenEditor.fire({ editor, groupId: this.id });
    const pinned = options3?.sticky || !this.groupsView.partOptions.enablePreview && !options3?.transient || editor.isDirty() || (options3?.pinned ?? typeof options3?.index === "number") || typeof options3?.index === "number" && this.model.isSticky(options3.index) || editor.hasCapability(512 /* Scratchpad */);
    const openEditorOptions = {
      index: options3 ? options3.index : void 0,
      pinned,
      sticky: options3?.sticky || typeof options3?.index === "number" && this.model.isSticky(options3.index),
      transient: !!options3?.transient,
      inactiveSelection: internalOptions?.inactiveSelection,
      active: this.count === 0 || !options3?.inactive,
      supportSideBySide: internalOptions?.supportSideBySide
    };
    if (!openEditorOptions.active && !openEditorOptions.pinned && this.model.activeEditor && !this.model.isPinned(this.model.activeEditor)) {
      openEditorOptions.active = true;
    }
    let activateGroup = false;
    let restoreGroup = false;
    if (options3?.activation === 1 /* ACTIVATE */) {
      activateGroup = true;
    } else if (options3?.activation === 2 /* RESTORE */) {
      restoreGroup = true;
    } else if (options3?.activation === 3 /* PRESERVE */) {
      activateGroup = false;
      restoreGroup = false;
    } else if (openEditorOptions.active) {
      activateGroup = !options3?.preserveFocus;
      restoreGroup = !activateGroup;
    }
    if (typeof openEditorOptions.index === "number") {
      const indexOfEditor = this.model.indexOf(editor);
      if (indexOfEditor !== -1 && indexOfEditor !== openEditorOptions.index) {
        this.doMoveEditorInsideGroup(editor, openEditorOptions);
      }
    }
    const { editor: openedEditor, isNew } = this.model.openEditor(editor, openEditorOptions);
    if (isNew && // only if this editor was new for the group
    this.count === 1 && // only when this editor was the first editor in the group
    this.editorPartsView.groups.length > 1) {
      if (openedEditor.editorId && this.groupsView.partOptions.autoLockGroups?.has(openedEditor.editorId)) {
        this.lock(true);
      }
    }
    const showEditorResult = this.doShowEditor(openedEditor, { active: !!openEditorOptions.active, isNew }, options3, internalOptions);
    if (activateGroup) {
      this.groupsView.activateGroup(this);
    } else if (restoreGroup) {
      this.groupsView.restoreGroup(this);
    }
    return showEditorResult;
  }
  doShowEditor(editor, context2, options3, internalOptions) {
    let openEditorPromise;
    if (context2.active) {
      openEditorPromise = (async () => {
        const { pane, changed, cancelled, error } = await this.editorPane.openEditor(editor, options3, internalOptions, { newInGroup: context2.isNew });
        if (cancelled) {
          return void 0;
        }
        if (changed) {
          this._onDidActiveEditorChange.fire({ editor, isExplicit: options3?.isExplicit });
        }
        if (error) {
          this._onDidOpenEditorFail.fire(editor);
        }
        if (!pane && this.activeEditor === editor) {
          this.doCloseEditor(editor, options3?.preserveFocus, { fromError: true });
        }
        return pane;
      })();
    } else {
      openEditorPromise = Promise.resolve(void 0);
    }
    if (!internalOptions?.skipTitleUpdate) {
      this.titleControl.openEditor(editor, internalOptions);
    }
    return openEditorPromise;
  }
  //#endregion
  //#region openEditors()
  async openEditors(editors) {
    const editorsToOpen = coalesce(editors).filter(({ editor }) => !editor.isDisposed());
    const firstEditor = editorsToOpen.at(0);
    if (!firstEditor) {
      return;
    }
    const openEditorsOptions = {
      // Allow to match on a side-by-side editor when same
      // editor is opened on both sides. In that case we
      // do not want to open a new editor but reuse that one.
      supportSideBySide: 3 /* BOTH */
    };
    await this.doOpenEditor(firstEditor.editor, firstEditor.options, openEditorsOptions);
    const inactiveEditors = editorsToOpen.slice(1);
    const startingIndex = this.getIndexOfEditor(firstEditor.editor) + 1;
    await Promises.settled(inactiveEditors.map(({ editor, options: options3 }, index2) => {
      return this.doOpenEditor(editor, {
        ...options3,
        inactive: true,
        pinned: true,
        index: startingIndex + index2
      }, {
        ...openEditorsOptions,
        // optimization: update the title control later
        // https://github.com/microsoft/vscode/issues/130634
        skipTitleUpdate: true
      });
    }));
    this.titleControl.openEditors(inactiveEditors.map(({ editor }) => editor));
    return this.editorPane.activeEditorPane ?? void 0;
  }
  //#endregion
  //#region moveEditor()
  moveEditors(editors, target) {
    const internalOptions = {
      skipTitleUpdate: this !== target
    };
    let moveFailed = false;
    const movedEditors = /* @__PURE__ */ new Set();
    for (const { editor, options: options3 } of editors) {
      if (this.moveEditor(editor, target, options3, internalOptions)) {
        movedEditors.add(editor);
      } else {
        moveFailed = true;
      }
    }
    if (internalOptions.skipTitleUpdate) {
      target.titleControl.openEditors(Array.from(movedEditors));
      this.titleControl.closeEditors(Array.from(movedEditors));
    }
    return !moveFailed;
  }
  moveEditor(editor, target, options3, internalOptions) {
    if (this === target) {
      this.doMoveEditorInsideGroup(editor, options3);
      return true;
    } else {
      return this.doMoveOrCopyEditorAcrossGroups(editor, target, options3, { ...internalOptions, keepCopy: false });
    }
  }
  doMoveEditorInsideGroup(candidate, options3) {
    const moveToIndex = options3 ? options3.index : void 0;
    if (typeof moveToIndex !== "number") {
      return;
    }
    const currentIndex = this.model.indexOf(candidate);
    const editor = this.model.getEditorByIndex(currentIndex);
    if (!editor) {
      return;
    }
    if (currentIndex !== moveToIndex) {
      const oldStickyCount = this.model.stickyCount;
      this.model.moveEditor(editor, moveToIndex);
      this.model.pin(editor);
      this.titleControl.moveEditor(editor, currentIndex, moveToIndex, oldStickyCount !== this.model.stickyCount);
      this.titleControl.pinEditor(editor);
    }
    if (options3?.sticky) {
      this.stickEditor(editor);
    }
  }
  doMoveOrCopyEditorAcrossGroups(editor, target, openOptions, internalOptions) {
    const keepCopy = internalOptions?.keepCopy;
    if (!keepCopy || editor.hasCapability(8 /* Singleton */)) {
      const canMoveVeto = editor.canMove(this.id, target.id);
      if (typeof canMoveVeto === "string") {
        this.dialogService.error(canMoveVeto, localize(6653, null));
        return false;
      }
    }
    const options3 = fillActiveEditorViewState(this, editor, {
      ...openOptions,
      pinned: true,
      // always pin moved editor
      sticky: openOptions?.sticky ?? (!keepCopy && this.model.isSticky(editor))
      // preserve sticky state only if editor is moved or explicitly wanted (https://github.com/microsoft/vscode/issues/99035)
    });
    if (!keepCopy) {
      this._onWillMoveEditor.fire({
        groupId: this.id,
        editor,
        target: target.id
      });
    }
    target.doOpenEditor(keepCopy ? editor.copy() : editor, options3, internalOptions);
    if (!keepCopy) {
      this.doCloseEditor(editor, true, { ...internalOptions, context: 2 /* MOVE */ });
    }
    return true;
  }
  //#endregion
  //#region copyEditor()
  copyEditors(editors, target) {
    const internalOptions = {
      skipTitleUpdate: this !== target
    };
    for (const { editor, options: options3 } of editors) {
      this.copyEditor(editor, target, options3, internalOptions);
    }
    if (internalOptions.skipTitleUpdate) {
      const copiedEditors = editors.map(({ editor }) => editor);
      target.titleControl.openEditors(copiedEditors);
    }
  }
  copyEditor(editor, target, options3, internalOptions) {
    if (this === target) {
      this.doMoveEditorInsideGroup(editor, options3);
    } else {
      this.doMoveOrCopyEditorAcrossGroups(editor, target, options3, { ...internalOptions, keepCopy: true });
    }
  }
  //#endregion
  //#region closeEditor()
  async closeEditor(editor = this.activeEditor || void 0, options3) {
    return this.doCloseEditorWithConfirmationHandling(editor, options3);
  }
  async doCloseEditorWithConfirmationHandling(editor = this.activeEditor || void 0, options3, internalOptions) {
    if (!editor) {
      return false;
    }
    if (!options3?.force && !internalOptions?.force && editor.hasCapability(8192 /* CannotClose */)) {
      return false;
    }
    const veto = await this.handleCloseConfirmation([editor]);
    if (veto) {
      return false;
    }
    this.doCloseEditor(editor, options3?.preserveFocus, internalOptions);
    return true;
  }
  doCloseEditor(editor, preserveFocus = this.groupsView.activeGroup !== this, internalOptions) {
    if (!internalOptions?.skipTitleUpdate) {
      this.titleControl.beforeCloseEditor(editor);
    }
    if (this.model.isActive(editor)) {
      this.doCloseActiveEditor(preserveFocus, internalOptions);
    } else {
      this.doCloseInactiveEditor(editor, internalOptions);
    }
    if (!internalOptions?.skipTitleUpdate) {
      this.titleControl.closeEditor(editor);
    }
  }
  doCloseActiveEditor(preserveFocus = this.groupsView.activeGroup !== this, internalOptions) {
    const editorToClose = this.activeEditor;
    const restoreFocus = !preserveFocus && this.shouldRestoreFocus(this.element);
    const closeEmptyGroup = this.groupsView.partOptions.closeEmptyGroups;
    if (closeEmptyGroup && this.active && this.count === 1) {
      const mostRecentlyActiveGroups = this.groupsView.getGroups(1 /* MOST_RECENTLY_ACTIVE */);
      const nextActiveGroup = mostRecentlyActiveGroups[1];
      if (nextActiveGroup) {
        if (restoreFocus) {
          nextActiveGroup.focus();
        } else {
          this.groupsView.activateGroup(nextActiveGroup, true);
        }
      }
    }
    if (editorToClose) {
      this.model.closeEditor(editorToClose, internalOptions?.context);
    }
    const nextActiveEditor = this.model.activeEditor;
    if (nextActiveEditor) {
      let activation = void 0;
      if (preserveFocus && this.groupsView.activeGroup !== this) {
        activation = 3 /* PRESERVE */;
      }
      const options3 = {
        preserveFocus,
        activation,
        // When closing an editor due to an error we can end up in a loop where we continue closing
        // editors that fail to open (e.g. when the file no longer exists). We do not want to show
        // repeated errors in this case to the user. As such, if we open the next editor and we are
        // in a scope of a previous editor failing, we silence the input errors until the editor is
        // opened by setting ignoreError: true.
        ignoreError: internalOptions?.fromError
      };
      const internalEditorOpenOptions = {
        // When closing an editor, we reveal the next one in the group.
        // However, this can be a result of moving an editor to another
        // window so we explicitly disable window reordering in this case.
        preserveWindowOrder: true
      };
      this.doOpenEditor(nextActiveEditor, options3, internalEditorOpenOptions);
    } else {
      if (editorToClose) {
        this.editorPane.closeEditor(editorToClose);
      }
      if (restoreFocus && !closeEmptyGroup) {
        this.focus();
      }
      this._onDidActiveEditorChange.fire({ editor: void 0 });
      if (closeEmptyGroup) {
        this.groupsView.removeGroup(this, preserveFocus);
      }
    }
  }
  shouldRestoreFocus(target) {
    const activeElement = getActiveElement();
    if (activeElement === target.ownerDocument.body) {
      return true;
    }
    return isAncestor(activeElement, target);
  }
  doCloseInactiveEditor(editor, internalOptions) {
    this.model.closeEditor(editor, internalOptions?.context);
  }
  async handleCloseConfirmation(editors) {
    if (!editors.length) {
      return false;
    }
    const editor = editors.shift();
    let handleCloseConfirmationPromise = this.mapEditorToPendingConfirmation.get(editor);
    if (!handleCloseConfirmationPromise) {
      handleCloseConfirmationPromise = this.doHandleCloseConfirmation(editor);
      this.mapEditorToPendingConfirmation.set(editor, handleCloseConfirmationPromise);
    }
    let veto;
    try {
      veto = await handleCloseConfirmationPromise;
    } finally {
      this.mapEditorToPendingConfirmation.delete(editor);
    }
    if (veto) {
      return veto;
    }
    return this.handleCloseConfirmation(editors);
  }
  async doHandleCloseConfirmation(editor, options3) {
    if (!this.shouldConfirmClose(editor)) {
      return false;
    }
    if (editor instanceof SideBySideEditorInput && this.model.contains(editor.primary)) {
      return false;
    }
    if (this.editorPartsView.groups.some((groupView) => {
      if (groupView === this) {
        return false;
      }
      const otherGroup = groupView;
      if (otherGroup.contains(editor, { supportSideBySide: 3 /* BOTH */ })) {
        return true;
      }
      if (editor instanceof SideBySideEditorInput && otherGroup.contains(editor.primary)) {
        return true;
      }
      return false;
    })) {
      return false;
    }
    let confirmation = 2 /* CANCEL */;
    let saveReason = 1 /* EXPLICIT */;
    let autoSave = false;
    if (!editor.hasCapability(4 /* Untitled */) && !options3?.skipAutoSave && !editor.closeHandler) {
      if (this.filesConfigurationService.getAutoSaveMode(editor).mode === 3 /* ON_FOCUS_CHANGE */) {
        autoSave = true;
        confirmation = 0 /* SAVE */;
        saveReason = 3 /* FOCUS_CHANGE */;
      } else if (isNative && (isWindows || isLinux) && this.filesConfigurationService.getAutoSaveMode(editor).mode === 4 /* ON_WINDOW_CHANGE */) {
        autoSave = true;
        confirmation = 0 /* SAVE */;
        saveReason = 4 /* WINDOW_CHANGE */;
      }
    }
    if (!autoSave) {
      if (!this.activeEditor?.matches(editor)) {
        await this.doOpenEditor(editor);
      }
      await this.hostService.focus(getWindow(this.element));
      let handlerDidError = false;
      if (typeof editor.closeHandler?.confirm === "function") {
        try {
          confirmation = await editor.closeHandler.confirm([{ editor, groupId: this.id }]);
        } catch (e) {
          this.logService.error(e);
          handlerDidError = true;
        }
      }
      if (typeof editor.closeHandler?.confirm !== "function" || handlerDidError) {
        let name;
        if (editor instanceof SideBySideEditorInput) {
          name = editor.primary.getName();
        } else {
          name = editor.getName();
        }
        confirmation = await this.fileDialogService.showSaveConfirm([name]);
      }
    }
    if (!editor.closeHandler && !this.shouldConfirmClose(editor)) {
      return confirmation === 2 /* CANCEL */;
    }
    switch (confirmation) {
      case 0 /* SAVE */: {
        const result = await editor.save(this.id, { reason: saveReason });
        if (!result && autoSave) {
          return this.doHandleCloseConfirmation(editor, { skipAutoSave: true });
        }
        return editor.isDirty();
      }
      case 1 /* DONT_SAVE */:
        try {
          await editor.revert(this.id);
          return editor.isDirty();
        } catch (error) {
          this.logService.error(error);
          await editor.revert(this.id, { soft: true });
          return editor.isDirty();
        }
      case 2 /* CANCEL */:
        return true;
    }
  }
  shouldConfirmClose(editor) {
    if (editor.closeHandler) {
      try {
        return editor.closeHandler.showConfirm();
      } catch (error) {
        this.logService.error(error);
      }
    }
    return editor.isDirty() && !editor.isSaving();
  }
  //#endregion
  //#region closeEditors()
  async closeEditors(args2, options3) {
    if (this.isEmpty) {
      return true;
    }
    const editors = this.doGetEditorsToClose(args2).filter((editor) => options3?.force || !editor.hasCapability(8192 /* CannotClose */));
    if (!editors.length) {
      return true;
    }
    const veto = await this.handleCloseConfirmation(editors.slice(0));
    if (veto) {
      return false;
    }
    this.doCloseEditors(editors, options3);
    return true;
  }
  doGetEditorsToClose(args2) {
    if (Array.isArray(args2)) {
      return args2;
    }
    const filter2 = args2;
    const hasDirection = typeof filter2.direction === "number";
    let editorsToClose = this.model.getEditors(hasDirection ? 1 /* SEQUENTIAL */ : 0 /* MOST_RECENTLY_ACTIVE */, filter2);
    if (filter2.savedOnly) {
      editorsToClose = editorsToClose.filter((editor) => !editor.isDirty() || editor.isSaving());
    } else if (hasDirection && filter2.except) {
      editorsToClose = filter2.direction === 0 /* LEFT */ ? editorsToClose.slice(0, this.model.indexOf(filter2.except, editorsToClose)) : editorsToClose.slice(this.model.indexOf(filter2.except, editorsToClose) + 1);
    } else if (filter2.except) {
      editorsToClose = editorsToClose.filter((editor) => filter2.except && !editor.matches(filter2.except));
    }
    return editorsToClose;
  }
  doCloseEditors(editors, options3) {
    let closeActiveEditor = false;
    for (const editor of editors) {
      if (!this.isActive(editor)) {
        this.doCloseInactiveEditor(editor);
      } else {
        closeActiveEditor = true;
      }
    }
    if (closeActiveEditor) {
      this.doCloseActiveEditor(options3?.preserveFocus);
    }
    if (editors.length) {
      this.titleControl.closeEditors(editors);
    }
  }
  closeAllEditors(options3) {
    if (this.isEmpty) {
      if (this.groupsView.partOptions.closeEmptyGroups) {
        this.groupsView.removeGroup(this);
      }
      return true;
    }
    if (options3?.excludeConfirming) {
      this.doCloseAllEditors(options3);
      return true;
    }
    const editors = this.model.getEditors(0 /* MOST_RECENTLY_ACTIVE */, options3).filter((editor) => options3?.force || !editor.hasCapability(8192 /* CannotClose */));
    if (!editors.length) {
      return true;
    }
    return this.handleCloseConfirmation(editors).then((veto) => {
      if (veto) {
        return false;
      }
      this.doCloseAllEditors(options3);
      return true;
    });
  }
  doCloseAllEditors(options3) {
    let editors = this.model.getEditors(1 /* SEQUENTIAL */, options3).filter((editor) => options3?.force || !editor.hasCapability(8192 /* CannotClose */));
    if (options3?.excludeConfirming) {
      editors = editors.filter((editor) => !this.shouldConfirmClose(editor));
    }
    const editorsToClose = [];
    for (const editor of editors) {
      if (!this.isActive(editor)) {
        this.doCloseInactiveEditor(editor);
      }
      editorsToClose.push(editor);
    }
    if (this.activeEditor && editorsToClose.includes(this.activeEditor)) {
      this.doCloseActiveEditor();
    }
    if (editorsToClose.length) {
      this.titleControl.closeEditors(editorsToClose);
    }
  }
  //#endregion
  //#region replaceEditors()
  async replaceEditors(editors) {
    let activeReplacement;
    const inactiveReplacements = [];
    for (let { editor, replacement, forceReplaceDirty, options: options3 } of editors) {
      const index2 = this.getIndexOfEditor(editor);
      if (index2 >= 0) {
        const isActiveEditor = this.isActive(editor);
        if (options3) {
          options3.index = index2;
        } else {
          options3 = { index: index2 };
        }
        options3.inactive = !isActiveEditor;
        options3.pinned = options3.pinned ?? true;
        const editorToReplace = { editor, replacement, forceReplaceDirty, options: options3 };
        if (isActiveEditor) {
          activeReplacement = editorToReplace;
        } else {
          inactiveReplacements.push(editorToReplace);
        }
      }
    }
    for (const { editor, replacement, forceReplaceDirty, options: options3 } of inactiveReplacements) {
      await this.doOpenEditor(replacement, options3);
      if (!editor.matches(replacement)) {
        let closed = false;
        if (forceReplaceDirty) {
          this.doCloseEditor(editor, true, { context: 1 /* REPLACE */ });
          closed = true;
        } else {
          closed = await this.doCloseEditorWithConfirmationHandling(editor, { preserveFocus: true }, { context: 1 /* REPLACE */, force: true });
        }
        if (!closed) {
          return;
        }
      }
    }
    if (activeReplacement) {
      const openEditorResult = this.doOpenEditor(activeReplacement.replacement, activeReplacement.options);
      if (!activeReplacement.editor.matches(activeReplacement.replacement)) {
        if (activeReplacement.forceReplaceDirty) {
          this.doCloseEditor(activeReplacement.editor, true, { context: 1 /* REPLACE */ });
        } else {
          await this.doCloseEditorWithConfirmationHandling(activeReplacement.editor, { preserveFocus: true }, { context: 1 /* REPLACE */, force: true });
        }
      }
      await openEditorResult;
    }
  }
  //#endregion
  //#region Locking
  get isLocked() {
    return this.model.isLocked;
  }
  lock(locked) {
    this.model.lock(locked);
  }
  //#endregion
  //#region Editor Actions
  createEditorActions(disposables, menuId = MenuId.EditorTitle) {
    let actions = { primary: [], secondary: [] };
    let onDidChange;
    const activeEditorPane = this.activeEditorPane;
    if (activeEditorPane instanceof EditorPane) {
      const editorScopedContextKeyService = activeEditorPane.scopedContextKeyService ?? this.scopedContextKeyService;
      const editorTitleMenu = disposables.add(this.menuService.createMenu(menuId, editorScopedContextKeyService, { emitEventsForSubmenuChanges: true, eventDebounceDelay: 0 }));
      onDidChange = editorTitleMenu.onDidChange;
      const shouldInlineGroup = (action, group2) => group2 === "navigation" && action.actions.length <= 1;
      actions = getActionBarActions(
        editorTitleMenu.getActions({ arg: this.resourceContext.get(), shouldForwardArgs: true, renderShortTitle: true }),
        "navigation",
        shouldInlineGroup
      );
      if (menuId === MenuId.EditorTitle) {
        const available = getAvailableEditorTypes(this.activeEditor, this.editorResolverService);
        if (available) {
          const editorTypeActions = createEditorTypeActions(available, this.editorResolverService, this.commandService, this.editorService);
          const reopenWithSubmenu = new SubmenuAction("editor.reopenWith", localize(6654, null), editorTypeActions);
          if (actions.secondary.length) {
            actions.secondary.push(new Separator());
          }
          actions.secondary.push(reopenWithSubmenu);
        }
      }
    } else {
      const onDidChangeEmitter = disposables.add(new Emitter());
      onDidChange = onDidChangeEmitter.event;
      disposables.add(this.onDidActiveEditorChange(() => onDidChangeEmitter.fire()));
    }
    return { actions, onDidChange };
  }
  //#endregion
  //#region Themable
  updateStyles() {
    const isEmpty = this.isEmpty;
    if (isEmpty) {
      this.element.style.backgroundColor = this.getColor(EDITOR_GROUP_EMPTY_BACKGROUND) || "";
    } else {
      this.element.style.backgroundColor = "";
    }
    const borderColor = this.getColor(EDITOR_GROUP_HEADER_BORDER) || this.getColor(contrastBorder);
    if (!isEmpty && borderColor) {
      this.titleContainer.classList.add("title-border-bottom");
      this.titleContainer.style.setProperty("--title-border-bottom-color", borderColor);
    } else {
      this.titleContainer.classList.remove("title-border-bottom");
      this.titleContainer.style.removeProperty("--title-border-bottom-color");
    }
    const { showTabs } = this.groupsView.partOptions;
    this.titleContainer.style.backgroundColor = this.getColor(showTabs === "multiple" ? EDITOR_GROUP_HEADER_TABS_BACKGROUND : EDITOR_GROUP_HEADER_NO_TABS_BACKGROUND) || "";
    this.editorContainer.style.backgroundColor = this.getColor(editorBackground) || "";
  }
  get minimumWidth() {
    return this.editorPane.minimumWidth;
  }
  get minimumHeight() {
    return this.editorPane.minimumHeight;
  }
  get maximumWidth() {
    return this.editorPane.maximumWidth;
  }
  get maximumHeight() {
    return this.editorPane.maximumHeight;
  }
  get proportionalLayout() {
    if (!this.lastLayout) {
      return true;
    }
    return !(this.lastLayout.width === this.minimumWidth || this.lastLayout.height === this.minimumHeight);
  }
  layout(width2, height, top2, left) {
    this.lastLayout = { width: width2, height, top: top2, left };
    this.element.classList.toggle("max-height-478px", height <= 478);
    const titleControlSize = this.titleControl.layout({
      container: new Dimension(width2, height),
      available: new Dimension(width2, height - this.editorPane.minimumHeight)
    });
    this.progressBar.getContainer().style.top = `${Math.max(this.titleHeight.offset - 2, 0)}px`;
    const contentWidth = Math.max(0, width2 - this._contentRightInset);
    const editorHeight = Math.max(0, height - titleControlSize.height);
    this.editorContainer.style.width = `${contentWidth}px`;
    this.editorContainer.style.height = `${editorHeight}px`;
    this.editorPane.layout({ width: contentWidth, height: editorHeight, top: top2 + titleControlSize.height, left });
  }
  /**
   * Sets the right inset reserved beside the breadcrumbs and editor pane while tabs remain full-width.
   * `0` restores the default full-width content.
   */
  setContentRightInset(inset) {
    const next = Math.max(0, Math.round(inset));
    if (next === this._contentRightInset) {
      return;
    }
    this._contentRightInset = next;
    this.relayout();
  }
  relayout() {
    if (this.lastLayout) {
      const { width: width2, height, top: top2, left } = this.lastLayout;
      this.layout(width2, height, top2, left);
      this._onDidRelayout.fire();
    }
  }
  setBoundarySashes(sashes) {
    this.editorPane.setBoundarySashes(sashes);
  }
  toJSON() {
    return this.model.serialize();
  }
  //#endregion
  dispose() {
    this._disposed = true;
    this._onWillDispose.fire();
    super.dispose();
  }
};

EditorGroupView = __decorateClass([
  __decorateParam(6, IInstantiationService),
  __decorateParam(7, IContextKeyService),
  __decorateParam(8, IThemeService),
  __decorateParam(9, ITelemetryService),
  __decorateParam(10, IKeybindingService),
  __decorateParam(11, IMenuService),
  __decorateParam(12, IContextMenuService),
  __decorateParam(13, IFileDialogService),
  __decorateParam(14, IEditorService),
  __decorateParam(15, IFilesConfigurationService),
  __decorateParam(16, IUriIdentityService),
  __decorateParam(17, ILogService),
  __decorateParam(18, IEditorResolverService),
  __decorateParam(19, IHostService),
  __decorateParam(20, IDialogService),
  __decorateParam(21, IFileService),
  __decorateParam(22, ICommandService)
], EditorGroupView);
export { EditorGroupView };
