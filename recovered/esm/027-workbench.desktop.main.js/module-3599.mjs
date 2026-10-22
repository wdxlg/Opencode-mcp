// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/outline/browser/outlinePane.ts
import { ViewPane } from "./module-1335.mjs";
import { DisposableStore, MutableDisposable, toDisposable } from "./module-0012.mjs";
import { OutlineViewState } from "./module-3598.mjs";
import { LRUCache } from "./module-0008.mjs";
import { ctxAllCollapsed, ctxFilterOnType, ctxFocused, ctxFollowsCursor, ctxSortMode } from "./module-2003.mjs";
import { $, Dimension, append } from "./module-0075.mjs";
import { ProgressBar } from "./module-1331.mjs";
import { defaultProgressBarStyles } from "./module-0513.mjs";
import { Event2 } from "./module-0017.mjs";
import { EditorResourceAccessor } from "./module-0925.mjs";
import { localize } from "./module-0001.mjs";
import { TimeoutTimer, timeout } from "./module-0036.mjs";
import { basename2 } from "./module-0034.mjs";
import { CancellationTokenSource } from "./module-0025.mjs";
import { WorkbenchDataTree } from "./module-0636.mjs";
import { AbstractTreeViewState } from "./module-0629.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IOutlineService } from "./module-0971.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IViewDescriptorService } from "./module-1093.mjs";
import { IStorageService } from "./module-0512.mjs";
import { IEditorService } from "./module-0934.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IKeybindingService } from "./module-0352.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { IContextMenuService } from "./module-0488.mjs";
import { IOpenerService } from "./module-0272.mjs";
import { IThemeService } from "./module-0287.mjs";
import { IHoverService } from "./module-0520.mjs";


// src/vs/workbench/contrib/outline/browser/outlinePane.ts
var OutlineTreeSorter2 = class {
  constructor(_comparator, order) {
    this._comparator = _comparator;
    this.order = order;
  }
  compare(a, b) {
    if (this.order === 2 /* ByKind */) {
      return this._comparator.compareByType(a, b);
    } else if (this.order === 1 /* ByName */) {
      return this._comparator.compareByName(a, b);
    } else {
      return this._comparator.compareByPosition(a, b);
    }
  }
};

var OutlinePane = class extends ViewPane {
  constructor(options3, _outlineService, _instantiationService, viewDescriptorService, _storageService, _editorService, configurationService, keybindingService, contextKeyService, contextMenuService, openerService, themeService, hoverService) {
    super(options3, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, _instantiationService, openerService, themeService, hoverService);
    this._outlineService = _outlineService;
    this._instantiationService = _instantiationService;
    this._storageService = _storageService;
    this._editorService = _editorService;
    this._disposables = new DisposableStore();
    this._editorControlDisposables = new DisposableStore();
    this._editorPaneDisposables = new DisposableStore();
    this._outlineViewState = new OutlineViewState();
    this._editorListener = new MutableDisposable();
    this._treeStates = new LRUCache(10);
    this._editorControlChangePromise = Promise.resolve();
    this._outlineViewState.restore(this._storageService);
    this._disposables.add(this._outlineViewState);
    contextKeyService.bufferChangeEvents(() => {
      this._ctxFollowsCursor = ctxFollowsCursor.bindTo(contextKeyService);
      this._ctxFilterOnType = ctxFilterOnType.bindTo(contextKeyService);
      this._ctxSortMode = ctxSortMode.bindTo(contextKeyService);
      this._ctxAllCollapsed = ctxAllCollapsed.bindTo(contextKeyService);
    });
    const updateContext = () => {
      this._ctxFollowsCursor.set(this._outlineViewState.followCursor);
      this._ctxFilterOnType.set(this._outlineViewState.filterOnType);
      this._ctxSortMode.set(this._outlineViewState.sortBy);
    };
    updateContext();
    this._disposables.add(this._outlineViewState.onDidChange(updateContext));
  }
  static {
    this.Id = "outline";
  }
  dispose() {
    this._disposables.dispose();
    this._editorPaneDisposables.dispose();
    this._editorControlDisposables.dispose();
    this._editorListener.dispose();
    super.dispose();
  }
  focus() {
    this._editorControlChangePromise.then(() => {
      super.focus();
      this._tree?.domFocus();
    });
  }
  renderBody(container3) {
    super.renderBody(container3);
    this._domNode = container3;
    container3.classList.add("outline-pane");
    const progressContainer = $(".outline-progress");
    this._message = $(".outline-message");
    this._progressBar = new ProgressBar(progressContainer, defaultProgressBarStyles);
    this._treeContainer = $(".outline-tree");
    append(container3, progressContainer, this._message, this._treeContainer);
    this._disposables.add(this.onDidChangeBodyVisibility((visible) => {
      if (!visible) {
        this._editorListener.clear();
        this._editorPaneDisposables.clear();
        this._editorControlDisposables.clear();
      } else if (!this._editorListener.value) {
        const event = Event2.any(this._editorService.onDidActiveEditorChange, this._outlineService.onDidChange);
        this._editorListener.value = event(() => this._handleEditorChanged(this._editorService.activeEditorPane));
        this._handleEditorChanged(this._editorService.activeEditorPane);
      }
    }));
  }
  layoutBody(height, width2) {
    super.layoutBody(height, width2);
    this._tree?.layout(height, width2);
    this._treeDimensions = new Dimension(width2, height);
  }
  collapseAll() {
    this._tree?.collapseAll();
  }
  expandAll() {
    this._tree?.expandAll();
  }
  get outlineViewState() {
    return this._outlineViewState;
  }
  _showMessage(message) {
    this._domNode.classList.add("message");
    this._progressBar.stop().hide();
    this._message.textContent = message;
  }
  _captureViewState(uri5) {
    if (this._tree) {
      const oldOutline = this._tree.getInput();
      if (!uri5) {
        uri5 = oldOutline?.uri;
      }
      if (oldOutline && uri5) {
        this._treeStates.set(`${oldOutline.outlineKind}/${uri5}`, this._tree.getViewState());
        return true;
      }
    }
    return false;
  }
  _handleEditorChanged(pane) {
    this._editorPaneDisposables.clear();
    if (pane) {
      this._editorPaneDisposables.add(pane.onDidChangeControl(() => {
        this._editorControlChangePromise = this._handleEditorControlChanged(pane);
      }));
    }
    this._editorControlChangePromise = this._handleEditorControlChanged(pane);
  }
  async _handleEditorControlChanged(pane) {
    const resource = EditorResourceAccessor.getOriginalUri(pane?.input);
    const didCapture = this._captureViewState();
    this._editorControlDisposables.clear();
    if (!pane || !this._outlineService.canCreateOutline(pane) || !resource) {
      return this._showMessage(localize(17973, null));
    }
    let loadingMessage;
    if (!didCapture) {
      loadingMessage = new TimeoutTimer(() => {
        this._showMessage(localize(17972, null, basename2(resource)));
      }, 100);
    }
    this._progressBar.infinite().show(500);
    const cts = new CancellationTokenSource();
    this._editorControlDisposables.add(toDisposable(() => cts.dispose(true)));
    const newOutline = await this._outlineService.createOutline(pane, 1 /* OutlinePane */, cts.token);
    loadingMessage?.dispose();
    if (!newOutline) {
      return;
    }
    if (cts.token.isCancellationRequested) {
      newOutline?.dispose();
      return;
    }
    this._editorControlDisposables.add(newOutline);
    this._progressBar.stop().hide();
    const sorter3 = new OutlineTreeSorter2(newOutline.config.comparator, this._outlineViewState.sortBy);
    const tree = this._instantiationService.createInstance(
      WorkbenchDataTree,
      "OutlinePane",
      this._treeContainer,
      newOutline.config.delegate,
      newOutline.config.renderers,
      newOutline.config.treeDataSource,
      {
        ...newOutline.config.options,
        sorter: sorter3,
        expandOnDoubleClick: false,
        expandOnlyOnTwistieClick: true,
        multipleSelectionSupport: false,
        hideTwistiesOfChildlessElements: true,
        defaultFindMode: this._outlineViewState.filterOnType ? 1 /* Filter */ : 0 /* Highlight */,
        overrideStyles: this.getLocationBasedColors().listOverrideStyles
      }
    );
    ctxFocused.bindTo(tree.contextKeyService);
    const updateTree = () => {
      if (newOutline.isEmpty) {
        this._showMessage(localize(17974, null, basename2(resource)));
        this._captureViewState(resource);
        tree.setInput(void 0);
      } else if (!tree.getInput()) {
        this._domNode.classList.remove("message");
        const state = this._treeStates.get(`${newOutline.outlineKind}/${newOutline.uri}`);
        tree.setInput(newOutline, state && AbstractTreeViewState.lift(state));
      } else {
        this._domNode.classList.remove("message");
        tree.updateChildren();
      }
    };
    updateTree();
    this._editorControlDisposables.add(newOutline.onDidChange(updateTree));
    this._editorControlDisposables.add(this.viewDescriptorService.onDidChangeLocation(({ views }) => {
      if (views.some((v2) => v2.id === this.id)) {
        tree.updateOptions({ overrideStyles: this.getLocationBasedColors().listOverrideStyles });
      }
    }));
    this._editorControlDisposables.add(tree.onDidChangeFindMode((mode) => this._outlineViewState.filterOnType = mode === 1 /* Filter */));
    let idPool = 0;
    this._editorControlDisposables.add(tree.onDidOpen(async (e) => {
      const myId = ++idPool;
      const isDoubleClick = e.browserEvent?.type === "dblclick";
      if (!isDoubleClick) {
        await timeout(150);
        if (myId !== idPool) {
          return;
        }
      }
      await newOutline.reveal(e.element, e.editorOptions, e.sideBySide, isDoubleClick);
    }));
    const revealActiveElement = () => {
      if (!this._outlineViewState.followCursor || !newOutline.activeElement) {
        return;
      }
      let item = newOutline.activeElement;
      while (item) {
        const top2 = tree.getRelativeTop(item);
        if (top2 === null) {
          tree.reveal(item, 0.5);
        }
        if (tree.getRelativeTop(item) !== null) {
          tree.setFocus([item]);
          tree.setSelection([item]);
          break;
        }
        item = tree.getParentElement(item);
      }
    };
    revealActiveElement();
    this._editorControlDisposables.add(newOutline.onDidChange(revealActiveElement));
    this._editorControlDisposables.add(this._outlineViewState.onDidChange((e) => {
      this._outlineViewState.persist(this._storageService);
      if (e.filterOnType) {
        tree.findMode = this._outlineViewState.filterOnType ? 1 /* Filter */ : 0 /* Highlight */;
      }
      if (e.followCursor) {
        revealActiveElement();
      }
      if (e.sortBy) {
        sorter3.order = this._outlineViewState.sortBy;
        tree.resort();
      }
    }));
    let viewState;
    this._editorControlDisposables.add(tree.onDidChangeFindPattern((pattern) => {
      if (tree.findMode === 0 /* Highlight */) {
        return;
      }
      if (!viewState && pattern) {
        viewState = tree.getViewState();
        tree.expandAll();
      } else if (!pattern && viewState) {
        tree.setInput(tree.getInput(), viewState);
        viewState = void 0;
      }
    }));
    const updateAllCollapsedCtx = () => {
      this._ctxAllCollapsed.set(tree.getNode(null).children.every((node) => !node.collapsible || node.collapsed));
    };
    this._editorControlDisposables.add(tree.onDidChangeCollapseState(updateAllCollapsedCtx));
    this._editorControlDisposables.add(tree.onDidChangeModel(updateAllCollapsedCtx));
    updateAllCollapsedCtx();
    tree.layout(this._treeDimensions?.height, this._treeDimensions?.width);
    this._tree = tree;
    this._editorControlDisposables.add(toDisposable(() => {
      tree.dispose();
      this._tree = void 0;
    }));
  }
};

OutlinePane = __decorateClass([
  __decorateParam(1, IOutlineService),
  __decorateParam(2, IInstantiationService),
  __decorateParam(3, IViewDescriptorService),
  __decorateParam(4, IStorageService),
  __decorateParam(5, IEditorService),
  __decorateParam(6, IConfigurationService),
  __decorateParam(7, IKeybindingService),
  __decorateParam(8, IContextKeyService),
  __decorateParam(9, IContextMenuService),
  __decorateParam(10, IOpenerService),
  __decorateParam(11, IThemeService),
  __decorateParam(12, IHoverService)
], OutlinePane);
export { OutlineTreeSorter2, OutlinePane };
