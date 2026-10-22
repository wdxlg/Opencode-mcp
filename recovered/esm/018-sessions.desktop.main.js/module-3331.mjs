// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/callHierarchy/browser/callHierarchyPeek.ts
import { WorkbenchAsyncDataTree } from "./module-0636.mjs";
import { IPeekViewService, PeekViewWidget, peekViewBorder, peekViewEditorMatchHighlight, peekViewResultsBackground, peekViewTitleBackground, peekViewTitleForeground, peekViewTitleInfoForeground } from "./module-0623.mjs";
import { DisposableStore, toDisposable } from "./module-0012.mjs";
import { IMenuService, MenuId } from "./module-0092.mjs";
import { Color } from "./module-0197.mjs";
import { getFlatActionBarActions } from "./module-0516.mjs";
import { Dimension, isKeyboardEvent } from "./module-0075.mjs";
import { Sizing, SplitView } from "./module-0625.mjs";
import { EmbeddedCodeEditorWidget } from "./module-0621.mjs";
import { AccessibilityProvider3, CallRenderer, DataSource2, IdentityProvider2, Sorter, VirtualDelegate } from "./module-3330.mjs";
import { Event2 } from "./module-0017.mjs";
import { IThemeService, themeColorFromId2 } from "./module-0287.mjs";
import { Range2 } from "./module-0106.mjs";
import { localize } from "./module-0001.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IEditorService } from "./module-0935.mjs";
import { ITextModelService } from "./module-0081.mjs";
import { IStorageService } from "./module-0512.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { IInstantiationService } from "./module-0077.mjs";


// src/vs/workbench/contrib/callHierarchy/browser/callHierarchyPeek.ts
var LayoutInfo = class {
  constructor(ratio, height) {
    this.ratio = ratio;
    this.height = height;
  }
  static store(info, storageService) {
    storageService.store("callHierarchyPeekLayout", JSON.stringify(info), 0 /* PROFILE */, 1 /* MACHINE */);
  }
  static retrieve(storageService) {
    const value2 = storageService.get("callHierarchyPeekLayout", 0 /* PROFILE */, "{}");
    const defaultInfo = { ratio: 0.7, height: 17 };
    try {
      return { ...defaultInfo, ...JSON.parse(value2) };
    } catch {
      return defaultInfo;
    }
  }
};

var CallHierarchyTree = class extends WorkbenchAsyncDataTree {
};

var CallHierarchyTreePeekWidget = class extends PeekViewWidget {
  constructor(editor, _where, _direction, themeService, _peekViewService, _editorService, _textModelService, _storageService, _menuService, _contextKeyService, _instantiationService) {
    super(editor, { showFrame: true, showArrow: true, isResizeable: true, isAccessible: true }, _instantiationService);
    this._where = _where;
    this._direction = _direction;
    this._peekViewService = _peekViewService;
    this._editorService = _editorService;
    this._textModelService = _textModelService;
    this._storageService = _storageService;
    this._menuService = _menuService;
    this._contextKeyService = _contextKeyService;
    this._instantiationService = _instantiationService;
    this._treeViewStates = /* @__PURE__ */ new Map();
    this._previewDisposable = new DisposableStore();
    this.create();
    this._peekViewService.addExclusiveWidget(editor, this);
    this._applyTheme(themeService.getColorTheme());
    this._disposables.add(themeService.onDidColorThemeChange(this._applyTheme, this));
    this._disposables.add(this._previewDisposable);
  }
  static {
    this.TitleMenu = new MenuId("callhierarchy/title");
  }
  dispose() {
    LayoutInfo.store(this._layoutInfo, this._storageService);
    this._splitView.dispose();
    this._tree.dispose();
    this._editor.dispose();
    super.dispose();
  }
  get direction() {
    return this._direction;
  }
  _applyTheme(theme) {
    const borderColor = theme.getColor(peekViewBorder) || Color.transparent;
    this.style({
      arrowColor: borderColor,
      frameColor: borderColor,
      headerBackgroundColor: theme.getColor(peekViewTitleBackground) || Color.transparent,
      primaryHeadingColor: theme.getColor(peekViewTitleForeground),
      secondaryHeadingColor: theme.getColor(peekViewTitleInfoForeground)
    });
  }
  _fillHead(container2) {
    super._fillHead(container2, true);
    const menu = this._menuService.createMenu(CallHierarchyTreePeekWidget.TitleMenu, this._contextKeyService);
    const updateToolbar = () => {
      const actions = getFlatActionBarActions(menu.getActions());
      this._actionbarWidget.clear();
      this._actionbarWidget.push(actions, { label: false, icon: true });
    };
    this._disposables.add(menu);
    this._disposables.add(menu.onDidChange(updateToolbar));
    updateToolbar();
  }
  _fillBody(parent) {
    this._layoutInfo = LayoutInfo.retrieve(this._storageService);
    this._dim = new Dimension(0, 0);
    this._parent = parent;
    parent.classList.add("call-hierarchy");
    const message = document.createElement("div");
    message.classList.add("message");
    parent.appendChild(message);
    this._message = message;
    this._message.tabIndex = 0;
    const container2 = document.createElement("div");
    container2.classList.add("results");
    parent.appendChild(container2);
    this._splitView = new SplitView(container2, { orientation: 1 /* HORIZONTAL */ });
    const editorContainer = document.createElement("div");
    editorContainer.classList.add("editor");
    container2.appendChild(editorContainer);
    const editorOptions = {
      scrollBeyondLastLine: false,
      scrollbar: {
        verticalScrollbarSize: 14,
        horizontal: "auto",
        useShadows: true,
        verticalHasArrows: false,
        horizontalHasArrows: false,
        alwaysConsumeMouseWheel: false
      },
      overviewRulerLanes: 2,
      fixedOverflowWidgets: true,
      minimap: {
        enabled: false
      }
    };
    this._editor = this._instantiationService.createInstance(
      EmbeddedCodeEditorWidget,
      editorContainer,
      editorOptions,
      {},
      this.editor
    );
    const treeContainer = document.createElement("div");
    treeContainer.classList.add("tree");
    container2.appendChild(treeContainer);
    const options3 = {
      sorter: new Sorter(),
      accessibilityProvider: new AccessibilityProvider3(() => this._direction),
      identityProvider: new IdentityProvider2(() => this._direction),
      expandOnlyOnTwistieClick: true,
      overrideStyles: {
        listBackground: peekViewResultsBackground
      }
    };
    this._tree = this._instantiationService.createInstance(
      CallHierarchyTree,
      "CallHierarchyPeek",
      treeContainer,
      new VirtualDelegate(),
      [this._instantiationService.createInstance(CallRenderer)],
      this._instantiationService.createInstance(DataSource2, () => this._direction),
      options3
    );
    this._splitView.addView({
      onDidChange: Event2.None,
      element: editorContainer,
      minimumSize: 200,
      maximumSize: Number.MAX_VALUE,
      layout: (width2) => {
        if (this._dim.height) {
          this._editor.layout({ height: this._dim.height, width: width2 });
        }
      }
    }, Sizing.Distribute);
    this._splitView.addView({
      onDidChange: Event2.None,
      element: treeContainer,
      minimumSize: 100,
      maximumSize: Number.MAX_VALUE,
      layout: (width2) => {
        if (this._dim.height) {
          this._tree.layout(this._dim.height, width2);
        }
      }
    }, Sizing.Distribute);
    this._disposables.add(this._splitView.onDidSashChange(() => {
      if (this._dim.width) {
        this._layoutInfo.ratio = this._splitView.getViewSize(0) / this._dim.width;
      }
    }));
    this._disposables.add(this._tree.onDidChangeFocus(this._updatePreview, this));
    this._disposables.add(this._editor.onMouseDown((e4) => {
      const { event, target } = e4;
      if (event.detail !== 2) {
        return;
      }
      const [focus] = this._tree.getFocus();
      if (!focus) {
        return;
      }
      this.dispose();
      this._editorService.openEditor({
        resource: focus.item.uri,
        options: { selection: target.range }
      });
    }));
    this._disposables.add(this._tree.onMouseDblClick((e4) => {
      if (e4.target === 1 /* Twistie */) {
        return;
      }
      if (e4.element) {
        this.dispose();
        this._editorService.openEditor({
          resource: e4.element.item.uri,
          options: { selection: e4.element.item.selectionRange, pinned: true }
        });
      }
    }));
    this._disposables.add(this._tree.onDidChangeSelection((e4) => {
      const [element] = e4.elements;
      if (element && isKeyboardEvent(e4.browserEvent)) {
        this.dispose();
        this._editorService.openEditor({
          resource: element.item.uri,
          options: { selection: element.item.selectionRange, pinned: true }
        });
      }
    }));
  }
  async _updatePreview() {
    const [element] = this._tree.getFocus();
    if (!element) {
      return;
    }
    this._previewDisposable.clear();
    const options3 = {
      description: "call-hierarchy-decoration",
      stickiness: 1 /* NeverGrowsWhenTypingAtEdges */,
      className: "call-decoration",
      overviewRuler: {
        color: themeColorFromId2(peekViewEditorMatchHighlight),
        position: 2 /* Center */
      }
    };
    let previewUri;
    if (this._direction === "outgoingCalls" /* CallsFrom */) {
      previewUri = element.parent ? element.parent.item.uri : element.model.root.uri;
    } else {
      previewUri = element.item.uri;
    }
    const value2 = await this._textModelService.createModelReference(previewUri);
    this._editor.setModel(value2.object.textEditorModel);
    const decorations = [];
    let fullRange;
    let locations = element.locations;
    if (!locations) {
      locations = [{ uri: element.item.uri, range: element.item.selectionRange }];
    }
    for (const loc of locations) {
      if (loc.uri.toString() === previewUri.toString()) {
        decorations.push({ range: loc.range, options: options3 });
        fullRange = !fullRange ? loc.range : Range2.plusRange(loc.range, fullRange);
      }
    }
    if (fullRange) {
      this._editor.revealRangeInCenter(fullRange, 1 /* Immediate */);
      const decorationsCollection = this._editor.createDecorationsCollection(decorations);
      this._previewDisposable.add(toDisposable(() => decorationsCollection.clear()));
    }
    this._previewDisposable.add(value2);
    const title = this._direction === "outgoingCalls" /* CallsFrom */ ? localize(8376, null, element.model.root.name) : localize(8377, null, element.model.root.name);
    this.setTitle(title);
  }
  showLoading() {
    this._parent.dataset["state"] = "loading" /* Loading */;
    this.setTitle(localize(8380, null));
    this._show();
  }
  showMessage(message) {
    this._parent.dataset["state"] = "message" /* Message */;
    this.setTitle("");
    this.setMetaTitle("");
    this._message.innerText = message;
    this._show();
    this._message.focus();
  }
  async showModel(model) {
    this._show();
    const viewState = this._treeViewStates.get(this._direction);
    await this._tree.setInput(model, viewState);
    const root = this._tree.getNode(model).children[0];
    await this._tree.expand(root.element);
    if (root.children.length === 0) {
      this.showMessage(this._direction === "outgoingCalls" /* CallsFrom */ ? localize(8378, null, model.root.name) : localize(8379, null, model.root.name));
    } else {
      this._parent.dataset["state"] = "data" /* Data */;
      if (!viewState || this._tree.getFocus().length === 0) {
        this._tree.setFocus([root.children[0].element]);
      }
      this._tree.domFocus();
      this._updatePreview();
    }
  }
  getModel() {
    return this._tree.getInput();
  }
  getFocused() {
    return this._tree.getFocus()[0];
  }
  async updateDirection(newDirection) {
    const model = this._tree.getInput();
    if (model && newDirection !== this._direction) {
      this._treeViewStates.set(this._direction, this._tree.getViewState());
      this._direction = newDirection;
      await this.showModel(model);
    }
  }
  _show() {
    if (!this._isShowing) {
      this.editor.revealLineInCenterIfOutsideViewport(this._where.lineNumber, 0 /* Smooth */);
      super.show(Range2.fromPositions(this._where), this._layoutInfo.height);
    }
  }
  _onWidth(width2) {
    if (this._dim) {
      this._doLayoutBody(this._dim.height, width2);
    }
  }
  _doLayoutBody(height, width2) {
    if (this._dim.height !== height || this._dim.width !== width2) {
      super._doLayoutBody(height, width2);
      this._dim = new Dimension(width2, height);
      this._layoutInfo.height = this._viewZone ? this._viewZone.heightInLines : this._layoutInfo.height;
      this._splitView.layout(width2);
      this._splitView.resizeView(0, width2 * this._layoutInfo.ratio);
    }
  }
};

CallHierarchyTreePeekWidget = __decorateClass([
  __decorateParam(3, IThemeService),
  __decorateParam(4, IPeekViewService),
  __decorateParam(5, IEditorService),
  __decorateParam(6, ITextModelService),
  __decorateParam(7, IStorageService),
  __decorateParam(8, IMenuService),
  __decorateParam(9, IContextKeyService),
  __decorateParam(10, IInstantiationService)
], CallHierarchyTreePeekWidget);
export { LayoutInfo, CallHierarchyTree, CallHierarchyTreePeekWidget };
