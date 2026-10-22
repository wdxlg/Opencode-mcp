// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/files/browser/views/explorerView.ts
import { ExplorerItem, NewExplorerItem } from "./module-2019.mjs";
import { IWorkspaceContextService, isUntitledWorkspace } from "./module-0509.mjs";
import { ViewPane } from "./module-1335.mjs";
import { EnterMultiRootWorkspaceSupportContext, ResourceContextKey, WorkbenchStateContext } from "./module-0949.mjs";
import { ADD_ROOT_FOLDER_COMMAND_ID, ADD_ROOT_FOLDER_LABEL } from "./module-1521.mjs";
import { ExplorerCompressedFirstFocusContext, ExplorerCompressedFocusContext, ExplorerCompressedLastFocusContext, ExplorerFindProviderActive, ExplorerFocusedContext, ExplorerFolderContext, ExplorerResourceAvailableEditorIdsContext, ExplorerResourceCut, ExplorerResourceMoveableToTrash, ExplorerResourceParentReadOnlyContext, ExplorerResourceReadonlyContext, ExplorerResourceWritableContext, ExplorerRootContext, FilesExplorerFocusedContext, FoldersViewVisibleContext, VIEW_ID2, ViewHasSomeCollapsibleRootItemContext } from "./module-1542.mjs";
import { toDisposable } from "./module-0012.mjs";
import { FileCopiedContext, NEW_FILE_COMMAND_ID2, NEW_FOLDER_COMMAND_ID } from "./module-2022.mjs";
import { DelayedDragHandler } from "./module-0263.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { $, EventType, addDisposableListener, append, findParentWithClass, getLargestChildWidth, getWindow, isAncestorOfActiveElement, isEditableElement, isHTMLElement, isKeyboardEvent } from "./module-0075.mjs";
import { EditorResourceAccessor } from "./module-0925.mjs";
import { ExplorerCompressionDelegate, ExplorerDataSource, ExplorerDelegate, ExplorerFindProvider, FileDragAndDrop, FileSorter2, FilesFilter, FilesRenderer, isCompressedFolderName } from "./module-2151.mjs";
import { ResourceLabels } from "./module-1323.mjs";
import { WorkbenchCompressibleAsyncDataTree } from "./module-0636.mjs";
import { Event2 } from "./module-0017.mjs";
import { ACTIVE_GROUP, IEditorService, SIDE_GROUP } from "./module-0934.mjs";
import { Action2, MenuId, registerAction2 } from "./module-0092.mjs";
import { mark } from "./module-0506.mjs";
import { ResourceMap } from "./module-0008.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { memoize } from "./module-0250.mjs";
import { IContextMenuService } from "./module-0488.mjs";
import { IViewDescriptorService } from "./module-1093.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IProgressService } from "./module-0446.mjs";
import { IEditorResolverService } from "./module-1113.mjs";
import { IWorkbenchLayoutService } from "./module-1118.mjs";
import { IKeybindingService } from "./module-0352.mjs";
import { ContextKeyExpr, IContextKeyService } from "./module-0089.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { ILabelService } from "./module-0641.mjs";
import { IThemeService } from "./module-0287.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { IHoverService } from "./module-0520.mjs";
import { IExplorerService } from "./module-2020.mjs";
import { IStorageService } from "./module-0512.mjs";
import { IClipboardService } from "./module-0487.mjs";
import { IFileService } from "./module-0269.mjs";
import { IUriIdentityService } from "./module-0510.mjs";
import { ICommandService } from "./module-0087.mjs";
import { IOpenerService } from "./module-0272.mjs";
import { IAccessibilityService } from "./module-0104.mjs";
import { IEnvironmentService } from "./module-0508.mjs";
import { Codicon } from "./module-0085.mjs";
import { IViewsService } from "./module-1246.mjs";


// src/vs/workbench/contrib/files/browser/views/explorerView.ts
function hasExpandedRootChild(tree, treeInput) {
  for (const folder of treeInput) {
    if (tree.hasNode(folder) && !tree.isCollapsed(folder)) {
      for (const [, child] of folder.children.entries()) {
        if (tree.hasNode(child) && tree.isCollapsible(child) && !tree.isCollapsed(child)) {
          return true;
        }
      }
    }
  }
  return false;
}

function hasExpandedNode(tree, treeInput) {
  for (const folder of treeInput) {
    if (tree.hasNode(folder) && !tree.isCollapsed(folder)) {
      return true;
    }
  }
  return false;
}

var identityProvider = {
  getId: (stat) => {
    if (stat instanceof NewExplorerItem) {
      return `new:${stat.getId()}`;
    }
    return stat.getId();
  }
};

function getContext(focus, selection, respectMultiSelection, compressedNavigationControllerProvider) {
  let focusedStat;
  focusedStat = focus.length ? focus[0] : void 0;
  if (respectMultiSelection && selection.length > 1) {
    focusedStat = void 0;
  }
  const compressedNavigationControllers = focusedStat && compressedNavigationControllerProvider.getCompressedNavigationController(focusedStat);
  const compressedNavigationController = compressedNavigationControllers?.length ? compressedNavigationControllers[0] : void 0;
  focusedStat = compressedNavigationController ? compressedNavigationController.current : focusedStat;
  const selectedStats = [];
  for (const stat of selection) {
    const controllers = compressedNavigationControllerProvider.getCompressedNavigationController(stat);
    const controller = controllers?.at(0);
    if (controller && focusedStat && controller === compressedNavigationController) {
      if (stat === focusedStat) {
        selectedStats.push(stat);
      }
      continue;
    }
    if (controller) {
      selectedStats.push(...controller.items);
    } else {
      selectedStats.push(stat);
    }
  }
  if (!focusedStat) {
    if (respectMultiSelection) {
      return selectedStats;
    } else {
      return [];
    }
  }
  if (respectMultiSelection && selectedStats.indexOf(focusedStat) >= 0) {
    return selectedStats;
  }
  return [focusedStat];
}

var PRESERVE_WORKSPACE_NAME_CASE_CLASS = "preserve-workspace-name-case";

var PRESERVE_MERGED_WORKSPACE_NAME_CASE_CLASS = "preserve-merged-workspace-name-case";

function shouldPreserveWorkspaceNameCase(workbenchState, workspace, environmentService) {
  if (workbenchState === 1 /* EMPTY */) {
    return false;
  }
  return !workspace.configuration || !isUntitledWorkspace(workspace.configuration, environmentService);
}

var ExplorerView = class extends ViewPane {
  constructor(options3, contextMenuService, viewDescriptorService, instantiationService, contextService, progressService, editorService, editorResolverService, layoutService, keybindingService, contextKeyService, configurationService, labelService, themeService, telemetryService, hoverService, explorerService, storageService, clipboardService, fileService, uriIdentityService, commandService, openerService, accessibilityService, environmentService) {
    super(options3, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, hoverService);
    this.contextService = contextService;
    this.progressService = progressService;
    this.editorService = editorService;
    this.editorResolverService = editorResolverService;
    this.layoutService = layoutService;
    this.labelService = labelService;
    this.telemetryService = telemetryService;
    this.explorerService = explorerService;
    this.storageService = storageService;
    this.clipboardService = clipboardService;
    this.fileService = fileService;
    this.uriIdentityService = uriIdentityService;
    this.commandService = commandService;
    this.accessibilityService = accessibilityService;
    this.environmentService = environmentService;
    this._autoReveal = false;
    this.delegate = options3.delegate;
    this.resourceContext = instantiationService.createInstance(ResourceContextKey);
    this._register(this.resourceContext);
    this.parentReadonlyContext = ExplorerResourceParentReadOnlyContext.bindTo(contextKeyService);
    this.folderContext = ExplorerFolderContext.bindTo(contextKeyService);
    this.readonlyContext = ExplorerResourceReadonlyContext.bindTo(contextKeyService);
    this.availableEditorIdsContext = ExplorerResourceAvailableEditorIdsContext.bindTo(contextKeyService);
    this.rootContext = ExplorerRootContext.bindTo(contextKeyService);
    this.resourceMoveableToTrash = ExplorerResourceMoveableToTrash.bindTo(contextKeyService);
    this.compressedFocusContext = ExplorerCompressedFocusContext.bindTo(contextKeyService);
    this.compressedFocusFirstContext = ExplorerCompressedFirstFocusContext.bindTo(contextKeyService);
    this.compressedFocusLastContext = ExplorerCompressedLastFocusContext.bindTo(contextKeyService);
    this.viewHasSomeCollapsibleRootItem = ViewHasSomeCollapsibleRootItemContext.bindTo(contextKeyService);
    this.viewVisibleContextKey = FoldersViewVisibleContext.bindTo(contextKeyService);
    this.explorerService.registerView(this);
    this._register(toDisposable(() => this.clearWorkspaceTitleContainer()));
  }
  static {
    this.TREE_VIEW_STATE_STORAGE_KEY = "workbench.explorer.treeViewState";
  }
  get singleViewPaneContainerTitle() {
    return this.name;
  }
  get autoReveal() {
    return this._autoReveal;
  }
  set autoReveal(autoReveal) {
    this._autoReveal = autoReveal;
  }
  get name() {
    return this.labelService.getWorkspaceLabel(this.contextService.getWorkspace());
  }
  get title() {
    return this.name;
  }
  set title(_) {
  }
  get headerVisible() {
    return super.headerVisible;
  }
  set headerVisible(visible) {
    super.headerVisible = visible;
    this.updateWorkspaceTitleCase();
  }
  setVisible(visible) {
    if (!visible) {
      this.clearWorkspaceTitleContainer();
    }
    this.viewVisibleContextKey.set(visible);
    super.setVisible(visible);
    if (visible) {
      this.updateWorkspaceTitleContainer();
    }
  }
  get fileCopiedContextKey() {
    return FileCopiedContext.bindTo(this.contextKeyService);
  }
  get resourceCutContextKey() {
    return ExplorerResourceCut.bindTo(this.contextKeyService);
  }
  // Split view methods
  renderHeader(container3) {
    super.renderHeader(container3);
    this.dragHandler = new DelayedDragHandler(container3, () => this.setExpanded(true));
    const titleElement = container3.querySelector(".title");
    const setHeader = () => {
      titleElement.textContent = this.name;
      this.updateTitle(this.name);
      this.ariaHeaderLabel = localize(16009, null, this.name);
      titleElement.setAttribute("aria-label", this.ariaHeaderLabel);
    };
    this._register(this.contextService.onDidChangeWorkspaceName(() => {
      setHeader();
      this.updateWorkspaceTitleCase();
    }));
    this._register(this.contextService.onDidChangeWorkbenchState(() => this.updateWorkspaceTitleCase()));
    this._register(this.labelService.onDidChangeFormatters(setHeader));
    setHeader();
  }
  updateWorkspaceTitleContainer() {
    const workspaceTitleContainer = findParentWithClass(this.element, "part") ?? void 0;
    if (this.workspaceTitleContainer !== workspaceTitleContainer) {
      this.workspaceTitleContainer?.classList.remove(PRESERVE_MERGED_WORKSPACE_NAME_CASE_CLASS);
      this.workspaceTitleContainer = workspaceTitleContainer;
    }
    this.updateWorkspaceTitleCase();
  }
  clearWorkspaceTitleContainer() {
    this.workspaceTitleContainer?.classList.remove(PRESERVE_MERGED_WORKSPACE_NAME_CASE_CLASS);
    this.workspaceTitleContainer = void 0;
  }
  updateWorkspaceTitleCase() {
    const preserveWorkspaceNameCase = shouldPreserveWorkspaceNameCase(this.contextService.getWorkbenchState(), this.contextService.getWorkspace(), this.environmentService);
    this.element.classList.toggle(PRESERVE_WORKSPACE_NAME_CASE_CLASS, preserveWorkspaceNameCase);
    this.workspaceTitleContainer?.classList.toggle(PRESERVE_MERGED_WORKSPACE_NAME_CASE_CLASS, preserveWorkspaceNameCase && this.isVisible() && !this.headerVisible);
  }
  layoutBody(height, width2) {
    super.layoutBody(height, width2);
    this.tree.layout(height, width2);
  }
  renderBody(container3) {
    super.renderBody(container3);
    this.container = container3;
    this.treeContainer = append(container3, $(".explorer-folders-view"));
    this.createTree(this.treeContainer);
    this._register(this.labelService.onDidChangeFormatters(() => {
      this._onDidChangeTitleArea.fire();
    }));
    this.onConfigurationUpdated(void 0);
    this._register(this.editorService.onDidActiveEditorChange(() => {
      this.selectActiveFile();
    }));
    this._register(this.configurationService.onDidChangeConfiguration((e) => this.onConfigurationUpdated(e)));
    this._register(this.onDidChangeBodyVisibility(async (visible) => {
      if (visible) {
        await this.setTreeInput();
        this.updateAnyCollapsedContext();
        this.selectActiveFile(true);
      }
    }));
    this._register(addDisposableListener(getWindow(this.container), EventType.PASTE, async (event) => {
      if (!this.hasFocus() || this.readonlyContext.get()) {
        return;
      }
      if (event.clipboardData?.files?.length) {
        await this.commandService.executeCommand("filesExplorer.paste", event.clipboardData?.files);
      }
    }));
  }
  focus() {
    super.focus();
    this.tree.domFocus();
    if (this.tree.getFocusedPart() === 0 /* Tree */) {
      const focused = this.tree.getFocus();
      if (focused.length === 1 && this._autoReveal) {
        this.tree.reveal(focused[0], 0.5);
      }
    }
  }
  hasFocus() {
    return isAncestorOfActiveElement(this.container);
  }
  getFocus() {
    return this.tree.getFocus();
  }
  focusNext() {
    this.tree.focusNext();
  }
  focusLast() {
    this.tree.focusLast();
  }
  getContext(respectMultiSelection) {
    const focusedItems = this.tree.getFocusedPart() === 1 /* StickyScroll */ ? this.tree.getStickyScrollFocus() : this.tree.getFocus();
    return getContext(focusedItems, this.tree.getSelection(), respectMultiSelection, this.renderer);
  }
  isItemVisible(item) {
    if (!this.filter) {
      return false;
    }
    return this.filter.filter(item, 1 /* Visible */);
  }
  isItemCollapsed(item) {
    return this.tree.isCollapsed(item);
  }
  async setEditable(stat, isEditing) {
    if (isEditing) {
      this.horizontalScrolling = this.tree.options.horizontalScrolling;
      if (this.horizontalScrolling) {
        this.tree.updateOptions({ horizontalScrolling: false });
      }
      await this.tree.expand(stat.parent);
    } else {
      if (this.horizontalScrolling !== void 0) {
        this.tree.updateOptions({ horizontalScrolling: this.horizontalScrolling });
      }
      this.horizontalScrolling = void 0;
      this.treeContainer.classList.remove("highlight");
    }
    await this.refresh(false, stat.parent, false);
    if (isEditing) {
      this.treeContainer.classList.add("highlight");
      this.tree.reveal(stat);
    } else {
      this.tree.domFocus();
    }
  }
  async selectActiveFile(reveal = this._autoReveal) {
    if (this._autoReveal) {
      const activeFile = EditorResourceAccessor.getCanonicalUri(this.editorService.activeEditor, { supportSideBySide: 1 /* PRIMARY */ });
      if (activeFile) {
        const focus = this.tree.getFocus();
        const selection = this.tree.getSelection();
        if (focus.length === 1 && this.uriIdentityService.extUri.isEqual(focus[0].resource, activeFile) && selection.length === 1 && this.uriIdentityService.extUri.isEqual(selection[0].resource, activeFile)) {
          return;
        }
        return this.explorerService.select(activeFile, reveal);
      }
    }
  }
  createTree(container3) {
    this.filter = this.instantiationService.createInstance(FilesFilter);
    this._register(this.filter);
    this._register(this.filter.onDidChange(() => this.refresh(true)));
    const explorerLabels = this.instantiationService.createInstance(ResourceLabels, { onDidChangeVisibility: this.onDidChangeBodyVisibility });
    this._register(explorerLabels);
    this.findProvider = this.instantiationService.createInstance(ExplorerFindProvider, this.filter, () => this.tree);
    const updateWidth = (stat) => this.tree.updateWidth(stat);
    this.renderer = this.instantiationService.createInstance(FilesRenderer, container3, explorerLabels, this.findProvider.highlightTree, updateWidth);
    this._register(this.renderer);
    this._register(createFileIconThemableTreeContainerScope(container3, this.themeService));
    const isCompressionEnabled = () => {
      const configValue = this.configurationService.getValue("explorer.compactFolders");
      if (this.accessibilityService.isScreenReaderOptimized()) {
        return false;
      }
      return configValue;
    };
    const getFileNestingSettings = (item) => this.configurationService.getValue({ resource: item?.root.resource }).explorer.fileNesting;
    this.tree = this.instantiationService.createInstance(
      WorkbenchCompressibleAsyncDataTree,
      "FileExplorer",
      container3,
      new ExplorerDelegate(),
      new ExplorerCompressionDelegate(),
      [this.renderer],
      this.instantiationService.createInstance(ExplorerDataSource, this.filter, this.findProvider),
      {
        compressionEnabled: isCompressionEnabled(),
        accessibilityProvider: this.renderer,
        identityProvider,
        keyboardNavigationLabelProvider: {
          getKeyboardNavigationLabel: (stat) => {
            if (this.explorerService.isEditable(stat)) {
              return void 0;
            }
            return stat.name;
          },
          getCompressedNodeKeyboardNavigationLabel: (stats) => {
            if (stats.some((stat) => this.explorerService.isEditable(stat))) {
              return void 0;
            }
            return stats.map((stat) => stat.name).join("/");
          }
        },
        multipleSelectionSupport: true,
        filter: this.filter,
        sorter: this.instantiationService.createInstance(FileSorter2),
        dnd: this.instantiationService.createInstance(FileDragAndDrop, (item) => this.isItemCollapsed(item)),
        collapseByDefault: (e) => {
          if (e instanceof ExplorerItem) {
            if (e.hasNests && getFileNestingSettings(e).expand) {
              return false;
            }
            if (this.findProvider.isShowingFilterResults()) {
              return false;
            }
          }
          return true;
        },
        autoExpandSingleChildren: true,
        expandOnlyOnTwistieClick: (e) => {
          if (e instanceof ExplorerItem) {
            if (e.hasNests) {
              return true;
            } else if (this.configurationService.getValue("workbench.tree.expandMode") === "doubleClick") {
              return true;
            }
          }
          return false;
        },
        paddingBottom: ExplorerDelegate.ITEM_HEIGHT,
        overrideStyles: this.getLocationBasedColors().listOverrideStyles,
        findProvider: this.findProvider
      }
    );
    this._register(this.tree);
    this._register(this.themeService.onDidColorThemeChange(() => this.tree.rerender()));
    const onDidChangeCompressionConfiguration = Event2.filter(this.configurationService.onDidChangeConfiguration, (e) => e.affectsConfiguration("explorer.compactFolders"));
    this._register(onDidChangeCompressionConfiguration((_) => this.tree.updateOptions({ compressionEnabled: isCompressionEnabled() })));
    this._register(this.accessibilityService.onDidChangeScreenReaderOptimized(() => {
      this.tree.updateOptions({ compressionEnabled: isCompressionEnabled() });
    }));
    FilesExplorerFocusedContext.bindTo(this.tree.contextKeyService);
    ExplorerFocusedContext.bindTo(this.tree.contextKeyService);
    this._register(this.tree.onDidChangeFocus((e) => this.onFocusChanged(e.elements)));
    this.onFocusChanged([]);
    this._register(this.tree.onDidOpen(async (e) => {
      const element = e.element;
      if (!element) {
        return;
      }
      const shiftDown = isKeyboardEvent(e.browserEvent) && e.browserEvent.shiftKey;
      if (!shiftDown) {
        if (element.isDirectory || this.explorerService.isEditable(void 0)) {
          return;
        }
        this.telemetryService.publicLog2("workbenchActionExecuted", { id: "workbench.files.openFile", from: "explorer" });
        try {
          this.delegate?.willOpenElement(e.browserEvent);
          await this.editorService.openEditor({ resource: element.resource, options: { preserveFocus: e.editorOptions.preserveFocus, pinned: e.editorOptions.pinned, source: 1 /* USER */ } }, e.sideBySide ? SIDE_GROUP : ACTIVE_GROUP);
        } finally {
          this.delegate?.didOpenElement();
        }
      }
    }));
    this._register(this.tree.onContextMenu((e) => this.onContextMenu(e)));
    this._register(this.tree.onDidScroll(async (e) => {
      const editable = this.explorerService.getEditable();
      if (e.scrollTopChanged && editable && this.tryGetRelativeTop(editable.stat) === null) {
        await editable.data.onFinish("", false);
      }
    }));
    this._register(this.tree.onDidChangeCollapseState((e) => {
      const element = e.node.element?.element;
      if (element) {
        const navigationControllers = this.renderer.getCompressedNavigationController(Array.isArray(element) ? element[0] : element);
        navigationControllers?.forEach((controller) => controller.updateCollapsed(e.node.collapsed));
      }
      this.updateAnyCollapsedContext();
    }));
    this.updateAnyCollapsedContext();
    this._register(this.tree.onMouseDblClick((e) => {
      const scrollingByPage = this.configurationService.getValue("workbench.list.scrollByPage");
      if (e.element === null && !scrollingByPage) {
        this.commandService.executeCommand(NEW_FILE_COMMAND_ID2);
      }
    }));
    this._register(this.storageService.onWillSaveState(() => {
      this.storeTreeViewState();
    }));
  }
  // React on events
  onConfigurationUpdated(event) {
    if (!event || event.affectsConfiguration("explorer.autoReveal")) {
      const configuration2 = this.configurationService.getValue();
      this._autoReveal = configuration2?.explorer?.autoReveal;
    }
    if (event && (event.affectsConfiguration("explorer.decorations.colors") || event.affectsConfiguration("explorer.decorations.badges"))) {
      this.refresh(true);
    }
  }
  storeTreeViewState() {
    this.storageService.store(ExplorerView.TREE_VIEW_STATE_STORAGE_KEY, JSON.stringify(this.tree.getViewState()), 1 /* WORKSPACE */, 1 /* MACHINE */);
  }
  setContextKeys(stat) {
    const folders = this.contextService.getWorkspace().folders;
    const resource = stat ? stat.resource : folders[folders.length - 1].uri;
    stat = stat || this.explorerService.findClosest(resource);
    this.resourceContext.set(resource);
    this.folderContext.set(!!stat && stat.isDirectory);
    this.readonlyContext.set(!!stat && !!stat.isReadonly);
    this.parentReadonlyContext.set(Boolean(stat?.parent?.isReadonly));
    this.rootContext.set(!!stat && stat.isRoot);
    if (resource) {
      const overrides = resource ? this.editorResolverService.getEditors(resource).map((editor) => editor.id) : [];
      this.availableEditorIdsContext.set(overrides.join(","));
    } else {
      this.availableEditorIdsContext.reset();
    }
  }
  async onContextMenu(e) {
    if (isEditableElement(e.browserEvent.target)) {
      return;
    }
    const stat = e.element;
    let anchor = e.anchor;
    if (isHTMLElement(anchor)) {
      if (stat) {
        const controllers = this.renderer.getCompressedNavigationController(stat);
        if (controllers && controllers.length > 0) {
          if (isKeyboardEvent(e.browserEvent) || isCompressedFolderName(e.browserEvent.target)) {
            anchor = controllers[0].labels[controllers[0].index];
          } else {
            controllers.forEach((controller) => controller.last());
          }
        }
      }
    }
    this.fileCopiedContextKey.set(await this.clipboardService.hasResources());
    this.setContextKeys(stat);
    const selection = this.tree.getSelection();
    const roots = this.explorerService.roots;
    let arg;
    if (stat instanceof ExplorerItem) {
      const compressedControllers = this.renderer.getCompressedNavigationController(stat);
      arg = compressedControllers?.length ? compressedControllers[0].current.resource : stat.resource;
    } else {
      arg = roots.length === 1 ? roots[0].resource : {};
    }
    this.contextMenuService.showContextMenu({
      menuId: MenuId.ExplorerContext,
      menuActionOptions: { arg, shouldForwardArgs: true },
      contextKeyService: this.tree.contextKeyService,
      getAnchor: () => anchor,
      onHide: (wasCancelled) => {
        if (wasCancelled) {
          this.tree.domFocus();
        }
      },
      getActionsContext: () => stat && selection && selection.indexOf(stat) >= 0 ? selection.map((fs) => fs.resource) : stat instanceof ExplorerItem ? [stat.resource] : []
    });
  }
  onFocusChanged(elements) {
    const stat = elements.at(0);
    this.setContextKeys(stat);
    if (stat) {
      const enableTrash = Boolean(this.configurationService.getValue().files?.enableTrash);
      const hasCapability = this.fileService.hasCapability(stat.resource, 4096 /* Trash */);
      this.resourceMoveableToTrash.set(enableTrash && hasCapability);
    } else {
      this.resourceMoveableToTrash.reset();
    }
    const compressedNavigationControllers = stat && this.renderer.getCompressedNavigationController(stat);
    if (!compressedNavigationControllers) {
      this.compressedFocusContext.set(false);
      return;
    }
    this.compressedFocusContext.set(true);
    compressedNavigationControllers.forEach((controller) => {
      this.updateCompressedNavigationContextKeys(controller);
    });
  }
  // General methods
  /**
   * Safely queries the file explorer tree for the relative top of an element.
   *
   * `hasNode()` and `getRelativeTop()` consult different internal maps in the
   * compressible async data tree. During an async refresh (e.g. when the
   * underlying file system provider changes, or file nesting settings update)
   * there is a microtask gap where one map has been updated but the other has
   * not. In that window `getRelativeTop()` can throw
   * `TreeError [FileExplorer] Tree element not found` (issue #188365) even
   * though the caller reasonably believed the element was still present.
   *
   * Treat such a failure as "not currently visible" so that callers fall back
   * to their not-visible branch (e.g. finishing editable state, or calling
   * `reveal()`), which is safe when the element is still in the data source
   * even if the view has not caught up yet.
   */
  tryGetRelativeTop(element) {
    if (!this.tree) {
      return null;
    }
    try {
      return this.tree.getRelativeTop(element);
    } catch {
      return null;
    }
  }
  /**
   * Refresh the contents of the explorer to get up to date data from the disk about the file structure.
   * If the item is passed we refresh only that level of the tree, otherwise we do a full refresh.
   */
  refresh(recursive, item, cancelEditing = true) {
    if (!this.tree || !this.isBodyVisible() || item && !this.tree.hasNode(item) || this.findProvider?.isShowingFilterResults() && recursive) {
      return Promise.resolve(void 0);
    }
    if (cancelEditing && this.explorerService.isEditable(void 0)) {
      this.tree.domFocus();
    }
    const toRefresh = item || this.tree.getInput();
    return this.tree.updateChildren(toRefresh, recursive, !!item);
  }
  getOptimalWidth() {
    const parentNode = this.tree.getHTMLElement();
    const childNodes = [].slice.call(parentNode.querySelectorAll(".explorer-item .label-name"));
    return getLargestChildWidth(parentNode, childNodes);
  }
  async setTreeInput() {
    if (!this.isBodyVisible()) {
      return Promise.resolve(void 0);
    }
    if (this.setTreeInputPromise) {
      await this.setTreeInputPromise;
    }
    const initialInputSetup = !this.tree.getInput();
    if (initialInputSetup) {
      mark("code/willResolveExplorer");
    }
    const roots = this.explorerService.roots;
    let input = roots[0];
    if (this.contextService.getWorkbenchState() !== 2 /* FOLDER */ || roots[0].error) {
      input = roots;
    }
    let viewState;
    if (this.tree?.getInput()) {
      viewState = this.tree.getViewState();
    } else {
      const rawViewState = this.storageService.get(ExplorerView.TREE_VIEW_STATE_STORAGE_KEY, 1 /* WORKSPACE */);
      if (rawViewState) {
        viewState = JSON.parse(rawViewState);
      }
    }
    const previousInput = this.tree.getInput();
    const promise = this.setTreeInputPromise = this.tree.setInput(input, viewState).then(async () => {
      if (Array.isArray(input)) {
        if (!viewState || previousInput instanceof ExplorerItem) {
          for (let i2 = 0; i2 < Math.min(input.length, 5); i2++) {
            try {
              await this.tree.expand(input[i2]);
            } catch (e) {
            }
          }
        }
        if (!previousInput && input.length === 1 && this.configurationService.getValue().explorer.expandSingleFolderWorkspaces) {
          await this.tree.expand(input[0]).catch(() => {
          });
        }
        if (Array.isArray(previousInput)) {
          const previousRoots = new ResourceMap();
          previousInput.forEach((previousRoot) => previousRoots.set(previousRoot.resource, true));
          await Promise.all(input.map(async (item) => {
            if (!previousRoots.has(item.resource)) {
              try {
                await this.tree.expand(item);
              } catch (e) {
              }
            }
          }));
        }
      }
      if (initialInputSetup) {
        mark("code/didResolveExplorer");
      }
    });
    this.progressService.withProgress({
      location: 1 /* Explorer */,
      delay: this.layoutService.isRestored() ? 800 : 1500
      // reduce progress visibility when still restoring
    }, (_progress) => promise);
    await promise;
  }
  async selectResource(resource, reveal = this._autoReveal, retry2 = 0) {
    if (retry2 === 2) {
      return;
    }
    if (!resource || !this.isBodyVisible()) {
      return;
    }
    if (this.setTreeInputPromise) {
      await this.setTreeInputPromise;
    }
    let item = this.explorerService.findClosestRoot(resource);
    while (item && item.resource.toString() !== resource.toString()) {
      try {
        await this.tree.expand(item);
      } catch (e) {
        return this.selectResource(resource, reveal, retry2 + 1);
      }
      if (!item.children.size) {
        item = null;
      } else {
        for (const child of item.children.values()) {
          if (this.uriIdentityService.extUri.isEqualOrParent(resource, child.resource)) {
            item = child;
            break;
          }
          item = null;
        }
      }
    }
    if (item) {
      if (item === this.tree.getInput()) {
        this.tree.setFocus([]);
        this.tree.setSelection([]);
        return;
      }
      try {
        if (item.nestedParent) {
          await this.tree.expand(item.nestedParent);
        }
        if ((reveal === true || reveal === "force") && this.tree.getRelativeTop(item) === null) {
          this.tree.reveal(item, 0.5);
        }
        this.tree.setFocus([item]);
        this.tree.setSelection([item]);
      } catch (e) {
        return this.selectResource(resource, reveal, retry2 + 1);
      }
    }
  }
  itemsCopied(stats, cut, previousCut) {
    this.fileCopiedContextKey.set(stats.length > 0);
    this.resourceCutContextKey.set(cut && stats.length > 0);
    previousCut?.forEach((item) => this.tree.rerender(item));
    if (cut) {
      stats.forEach((s) => this.tree.rerender(s));
    }
  }
  expandAll() {
    if (this.explorerService.isEditable(void 0)) {
      this.tree.domFocus();
    }
    this.tree.expandAll();
  }
  collapseAll() {
    if (this.explorerService.isEditable(void 0)) {
      this.tree.domFocus();
    }
    const treeInput = this.tree.getInput();
    if (Array.isArray(treeInput)) {
      if (hasExpandedRootChild(this.tree, treeInput)) {
        treeInput.forEach((folder) => {
          folder.children.forEach((child) => this.tree.hasNode(child) && this.tree.collapse(child, true));
        });
        return;
      }
    }
    this.tree.collapseAll();
  }
  previousCompressedStat() {
    const focused = this.tree.getFocus();
    if (!focused.length) {
      return;
    }
    const compressedNavigationControllers = this.renderer.getCompressedNavigationController(focused[0]);
    compressedNavigationControllers.forEach((controller) => {
      controller.previous();
      this.updateCompressedNavigationContextKeys(controller);
    });
  }
  nextCompressedStat() {
    const focused = this.tree.getFocus();
    if (!focused.length) {
      return;
    }
    const compressedNavigationControllers = this.renderer.getCompressedNavigationController(focused[0]);
    compressedNavigationControllers.forEach((controller) => {
      controller.next();
      this.updateCompressedNavigationContextKeys(controller);
    });
  }
  firstCompressedStat() {
    const focused = this.tree.getFocus();
    if (!focused.length) {
      return;
    }
    const compressedNavigationControllers = this.renderer.getCompressedNavigationController(focused[0]);
    compressedNavigationControllers.forEach((controller) => {
      controller.first();
      this.updateCompressedNavigationContextKeys(controller);
    });
  }
  lastCompressedStat() {
    const focused = this.tree.getFocus();
    if (!focused.length) {
      return;
    }
    const compressedNavigationControllers = this.renderer.getCompressedNavigationController(focused[0]);
    compressedNavigationControllers.forEach((controller) => {
      controller.last();
      this.updateCompressedNavigationContextKeys(controller);
    });
  }
  updateCompressedNavigationContextKeys(controller) {
    this.compressedFocusFirstContext.set(controller.index === 0);
    this.compressedFocusLastContext.set(controller.index === controller.count - 1);
  }
  updateAnyCollapsedContext() {
    const treeInput = this.tree.getInput();
    if (treeInput === void 0) {
      return;
    }
    const treeInputArray = Array.isArray(treeInput) ? treeInput : Array.from(treeInput.children.values());
    this.viewHasSomeCollapsibleRootItem.set(hasExpandedNode(this.tree, treeInputArray));
    this.storeTreeViewState();
  }
  hasPhantomElements() {
    return !!this.findProvider?.isShowingFilterResults();
  }
  dispose() {
    this.dragHandler?.dispose();
    super.dispose();
  }
};

__decorateClass([
  memoize
], ExplorerView.prototype, "fileCopiedContextKey", 1);

__decorateClass([
  memoize
], ExplorerView.prototype, "resourceCutContextKey", 1);

ExplorerView = __decorateClass([
  __decorateParam(1, IContextMenuService),
  __decorateParam(2, IViewDescriptorService),
  __decorateParam(3, IInstantiationService),
  __decorateParam(4, IWorkspaceContextService),
  __decorateParam(5, IProgressService),
  __decorateParam(6, IEditorService),
  __decorateParam(7, IEditorResolverService),
  __decorateParam(8, IWorkbenchLayoutService),
  __decorateParam(9, IKeybindingService),
  __decorateParam(10, IContextKeyService),
  __decorateParam(11, IConfigurationService),
  __decorateParam(12, ILabelService),
  __decorateParam(13, IThemeService),
  __decorateParam(14, ITelemetryService),
  __decorateParam(15, IHoverService),
  __decorateParam(16, IExplorerService),
  __decorateParam(17, IStorageService),
  __decorateParam(18, IClipboardService),
  __decorateParam(19, IFileService),
  __decorateParam(20, IUriIdentityService),
  __decorateParam(21, ICommandService),
  __decorateParam(22, IOpenerService),
  __decorateParam(23, IAccessibilityService),
  __decorateParam(24, IEnvironmentService)
], ExplorerView);

function createFileIconThemableTreeContainerScope(container3, themeService) {
  container3.classList.add("file-icon-themable-tree");
  container3.classList.add("show-file-icons");
  const onDidChangeFileIconTheme = (theme) => {
    container3.classList.toggle("align-icons-and-twisties", theme.hasFileIcons && !theme.hasFolderIcons);
    container3.classList.toggle("hide-arrows", theme.hidesExplorerArrows === true);
  };
  onDidChangeFileIconTheme(themeService.getFileIconTheme());
  return themeService.onDidFileIconThemeChange(onDidChangeFileIconTheme);
}

var CanCreateContext = ContextKeyExpr.or(
  // Folder: can create unless readonly
  ContextKeyExpr.and(ExplorerFolderContext, ExplorerResourceWritableContext),
  // File: can create unless parent is readonly
  ContextKeyExpr.and(ExplorerFolderContext.toNegated(), ExplorerResourceParentReadOnlyContext.toNegated())
);

registerAction2(class extends Action2 {
  constructor() {
    super({
      id: "workbench.files.action.createFileFromExplorer",
      title: localize(16007, null),
      f1: false,
      icon: Codicon.newFile,
      precondition: CanCreateContext,
      menu: {
        id: MenuId.ViewTitle,
        group: "navigation",
        when: ContextKeyExpr.equals("view", VIEW_ID2),
        order: 10
      }
    });
  }
  run(accessor) {
    const commandService = accessor.get(ICommandService);
    commandService.executeCommand(NEW_FILE_COMMAND_ID2);
  }
});

registerAction2(class extends Action2 {
  constructor() {
    super({
      id: "workbench.files.action.addFolderToWorkspaceFromExplorer",
      title: ADD_ROOT_FOLDER_LABEL,
      f1: false,
      icon: Codicon.newFolder,
      precondition: ContextKeyExpr.or(EnterMultiRootWorkspaceSupportContext, WorkbenchStateContext.isEqualTo("workspace")),
      menu: {
        id: MenuId.ViewTitle,
        group: "navigation",
        when: ContextKeyExpr.equals("view", VIEW_ID2),
        order: 20
      }
    });
  }
  run(accessor) {
    const commandService = accessor.get(ICommandService);
    commandService.executeCommand(ADD_ROOT_FOLDER_COMMAND_ID);
  }
});

registerAction2(class extends Action2 {
  constructor() {
    super({
      id: "workbench.files.action.refreshFilesExplorer",
      title: localize2(16010, "Refresh Explorer"),
      f1: true,
      icon: Codicon.refresh,
      menu: {
        id: MenuId.ViewTitle,
        group: "navigation",
        when: ContextKeyExpr.equals("view", VIEW_ID2),
        order: 30
      },
      metadata: {
        description: localize2(16011, "Forces a refresh of the Explorer.")
      },
      precondition: ExplorerFindProviderActive.negate()
    });
  }
  async run(accessor) {
    const viewsService = accessor.get(IViewsService);
    const explorerService = accessor.get(IExplorerService);
    await viewsService.openView(VIEW_ID2);
    await explorerService.refresh();
  }
});

registerAction2(class extends Action2 {
  constructor() {
    super({
      id: "workbench.files.action.collapseExplorerFolders",
      title: localize2(16005, "Collapse Folders in Explorer"),
      f1: true,
      icon: Codicon.collapseAll,
      menu: {
        id: MenuId.ViewTitle,
        group: "navigation",
        when: ContextKeyExpr.equals("view", VIEW_ID2),
        order: 40
      },
      metadata: {
        description: localize2(16006, "Folds all folders in the Explorer.")
      }
    });
  }
  run(accessor) {
    const viewsService = accessor.get(IViewsService);
    const view = viewsService.getViewWithId(VIEW_ID2);
    if (view !== null) {
      const explorerView = view;
      explorerView.collapseAll();
    }
  }
});

export { hasExpandedRootChild, hasExpandedNode, getContext, shouldPreserveWorkspaceNameCase, createFileIconThemableTreeContainerScope, identityProvider, PRESERVE_WORKSPACE_NAME_CASE_CLASS, PRESERVE_MERGED_WORKSPACE_NAME_CASE_CLASS, ExplorerView, CanCreateContext };
