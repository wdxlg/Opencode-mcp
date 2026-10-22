// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/debug/browser/loadedScriptsView.ts
import { isAbsolute, normalize, posix } from "./module-0026.mjs";
import { URI } from "./module-0032.mjs";
import { ltrim } from "./module-0030.mjs";
import { isWindows } from "./module-0014.mjs";
import { normalizeDriveLetter, tildify } from "./module-0711.mjs";
import { ViewAction, ViewPane } from "./module-1335.mjs";
import { CONTEXT_LOADED_SCRIPTS_ITEM_TYPE, IDebugService, LOADED_SCRIPTS_VIEW_ID } from "./module-1057.mjs";
import { renderViewTree } from "./module-2399.mjs";
import { ResourceLabels } from "./module-1323.mjs";
import { WorkbenchCompressibleObjectTree } from "./module-0636.mjs";
import { RunOnceScheduler } from "./module-0036.mjs";
import { DisposableMap, DisposableStore, dispose } from "./module-0012.mjs";
import { DebugContentProvider } from "./module-3157.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IContextMenuService } from "./module-0488.mjs";
import { IKeybindingService } from "./module-0352.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IViewDescriptorService } from "./module-1093.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IEditorService } from "./module-0934.mjs";
import { ContextKeyExpr, IContextKeyService } from "./module-0089.mjs";
import { IWorkspaceContextService } from "./module-0509.mjs";
import { ILabelService } from "./module-0641.mjs";
import { IPathService } from "./module-0938.mjs";
import { IOpenerService } from "./module-0272.mjs";
import { IThemeService } from "./module-0287.mjs";
import { IHoverService } from "./module-0520.mjs";
import { localize } from "./module-0001.mjs";
import { createMatches } from "./module-0453.mjs";
import { MenuId, registerAction2 } from "./module-0092.mjs";
import { Codicon } from "./module-0085.mjs";


// src/vs/workbench/contrib/debug/browser/loadedScriptsView.ts
var NEW_STYLE_COMPRESS = true;

var URI_SCHEMA_PATTERN = /^[a-zA-Z][a-zA-Z0-9\+\-\.]+:/;

var BaseTreeItem = class _BaseTreeItem {
  constructor(_parent, _label, isIncompressible = false) {
    this._parent = _parent;
    this._label = _label;
    this.isIncompressible = isIncompressible;
    this._children = /* @__PURE__ */ new Map();
    this._showedMoreThanOne = false;
  }
  updateLabel(label3) {
    this._label = label3;
  }
  isLeaf() {
    return this._children.size === 0;
  }
  getSession() {
    if (this._parent) {
      return this._parent.getSession();
    }
    return void 0;
  }
  setSource(session, source) {
    this._source = source;
    this._children.clear();
    if (source.raw && source.raw.sources) {
      for (const src of source.raw.sources) {
        if (src.name && src.path) {
          const s = new _BaseTreeItem(this, src.name);
          this._children.set(src.path, s);
          const ss = session.getSource(src);
          s.setSource(session, ss);
        }
      }
    }
  }
  createIfNeeded(key3, factory) {
    let child = this._children.get(key3);
    if (!child) {
      child = factory(this, key3);
      this._children.set(key3, child);
    }
    return child;
  }
  getChild(key3) {
    return this._children.get(key3);
  }
  remove(key3) {
    this._children.delete(key3);
  }
  removeFromParent() {
    if (this._parent) {
      this._parent.remove(this._label);
      if (this._parent._children.size === 0) {
        this._parent.removeFromParent();
      }
    }
  }
  getTemplateId() {
    return "id";
  }
  // a dynamic ID based on the parent chain; required for reparenting (see #55448)
  getId() {
    const parent = this.getParent();
    return parent ? `${parent.getId()}/${this.getInternalId()}` : this.getInternalId();
  }
  getInternalId() {
    return this._label;
  }
  // skips intermediate single-child nodes
  getParent() {
    if (this._parent) {
      if (this._parent.isSkipped()) {
        return this._parent.getParent();
      }
      return this._parent;
    }
    return void 0;
  }
  isSkipped() {
    if (this._parent) {
      if (this._parent.oneChild()) {
        return true;
      }
      return false;
    }
    return true;
  }
  // skips intermediate single-child nodes
  hasChildren() {
    const child = this.oneChild();
    if (child) {
      return child.hasChildren();
    }
    return this._children.size > 0;
  }
  // skips intermediate single-child nodes
  getChildren() {
    const child = this.oneChild();
    if (child) {
      return child.getChildren();
    }
    const array3 = [];
    for (const child2 of this._children.values()) {
      array3.push(child2);
    }
    return array3.sort((a, b) => this.compare(a, b));
  }
  // skips intermediate single-child nodes
  getLabel(separateRootFolder = true) {
    const child = this.oneChild();
    if (child) {
      const sep2 = this instanceof RootFolderTreeItem && separateRootFolder ? " \u2022 " : posix.sep;
      return `${this._label}${sep2}${child.getLabel()}`;
    }
    return this._label;
  }
  // skips intermediate single-child nodes
  getHoverLabel() {
    if (this._source && this._parent && this._parent._source) {
      return this._source.raw.path || this._source.raw.name;
    }
    const label3 = this.getLabel(false);
    const parent = this.getParent();
    if (parent) {
      const hover = parent.getHoverLabel();
      if (hover) {
        return `${hover}/${label3}`;
      }
    }
    return label3;
  }
  // skips intermediate single-child nodes
  getSource() {
    const child = this.oneChild();
    if (child) {
      return child.getSource();
    }
    return this._source;
  }
  compare(a, b) {
    if (a._label && b._label) {
      return a._label.localeCompare(b._label);
    }
    return 0;
  }
  oneChild() {
    if (!this._source && !this._showedMoreThanOne && this.skipOneChild()) {
      if (this._children.size === 1) {
        return this._children.values().next().value;
      }
      if (this._children.size > 1) {
        this._showedMoreThanOne = true;
      }
    }
    return void 0;
  }
  skipOneChild() {
    if (NEW_STYLE_COMPRESS) {
      return this instanceof RootTreeItem;
    } else {
      return !(this instanceof RootFolderTreeItem) && !(this instanceof SessionTreeItem);
    }
  }
};

var RootFolderTreeItem = class extends BaseTreeItem {
  constructor(parent, folder) {
    super(parent, folder.name, true);
    this.folder = folder;
  }
};

var RootTreeItem = class extends BaseTreeItem {
  constructor(_pathService, _contextService, _labelService) {
    super(void 0, "Root");
    this._pathService = _pathService;
    this._contextService = _contextService;
    this._labelService = _labelService;
  }
  add(session) {
    return this.createIfNeeded(session.getId(), () => new SessionTreeItem(this._labelService, this, session, this._pathService, this._contextService));
  }
  find(session) {
    return this.getChild(session.getId());
  }
};

var SessionTreeItem = class _SessionTreeItem extends BaseTreeItem {
  constructor(labelService, parent, session, _pathService, rootProvider) {
    super(parent, session.getLabel(), true);
    this._pathService = _pathService;
    this.rootProvider = rootProvider;
    this._map = /* @__PURE__ */ new Map();
    this._labelService = labelService;
    this._session = session;
  }
  static {
    this.URL_REGEXP = /^(https?:\/\/[^/]+)(\/.*)$/;
  }
  getInternalId() {
    return this._session.getId();
  }
  getSession() {
    return this._session;
  }
  getHoverLabel() {
    return void 0;
  }
  hasChildren() {
    return true;
  }
  compare(a, b) {
    const acat = this.category(a);
    const bcat = this.category(b);
    if (acat !== bcat) {
      return acat - bcat;
    }
    return super.compare(a, b);
  }
  category(item) {
    if (item instanceof RootFolderTreeItem) {
      return item.folder.index;
    }
    const l = item.getLabel();
    if (l && /^<.+>$/.test(l)) {
      return 1e3;
    }
    return 999;
  }
  async addPath(source) {
    let folder;
    let url;
    let path = source.raw.path;
    if (!path) {
      return;
    }
    if (this._labelService && URI_SCHEMA_PATTERN.test(path)) {
      path = this._labelService.getUriLabel(URI.parse(path));
    }
    const match2 = _SessionTreeItem.URL_REGEXP.exec(path);
    if (match2 && match2.length === 3) {
      url = match2[1];
      path = decodeURI(match2[2]);
    } else {
      if (isAbsolute(path)) {
        const resource = URI.file(path);
        folder = this.rootProvider ? this.rootProvider.getWorkspaceFolder(resource) : null;
        if (folder) {
          path = normalize(ltrim(resource.path.substring(folder.uri.path.length), posix.sep));
          const hasMultipleRoots = this.rootProvider.getWorkspace().folders.length > 1;
          if (hasMultipleRoots) {
            path = posix.sep + path;
          } else {
            folder = null;
          }
        } else {
          path = normalize(path);
          if (isWindows) {
            path = normalizeDriveLetter(path);
          } else {
            path = tildify(path, (await this._pathService.userHome()).fsPath);
          }
        }
      }
    }
    let leaf = this;
    path.split(/[\/\\]/).forEach((segment, i2) => {
      if (i2 === 0 && folder) {
        const f = folder;
        leaf = leaf.createIfNeeded(folder.name, (parent) => new RootFolderTreeItem(parent, f));
      } else if (i2 === 0 && url) {
        leaf = leaf.createIfNeeded(url, (parent) => new BaseTreeItem(parent, url));
      } else {
        leaf = leaf.createIfNeeded(segment, (parent) => new BaseTreeItem(parent, segment));
      }
    });
    leaf.setSource(this._session, source);
    if (source.raw.path) {
      this._map.set(source.raw.path, leaf);
    }
  }
  removePath(source) {
    if (source.raw.path) {
      const leaf = this._map.get(source.raw.path);
      if (leaf) {
        leaf.removeFromParent();
        return true;
      }
    }
    return false;
  }
};

function asTreeElement(item, viewState) {
  const children = item.getChildren();
  const collapsed2 = viewState ? !viewState.expanded.has(item.getId()) : !(item instanceof SessionTreeItem);
  return {
    element: item,
    collapsed: collapsed2,
    collapsible: item.hasChildren(),
    children: children.map((i2) => asTreeElement(i2, viewState))
  };
}

var LoadedScriptsView = class extends ViewPane {
  constructor(options3, contextMenuService, keybindingService, instantiationService, viewDescriptorService, configurationService, editorService, contextKeyService, contextService, debugService, labelService, pathService, openerService, themeService, hoverService) {
    super(options3, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, hoverService);
    this.editorService = editorService;
    this.contextService = contextService;
    this.debugService = debugService;
    this.labelService = labelService;
    this.pathService = pathService;
    this.treeNeedsRefreshOnVisible = false;
    this.loadedScriptsItemType = CONTEXT_LOADED_SCRIPTS_ITEM_TYPE.bindTo(contextKeyService);
  }
  renderBody(container3) {
    super.renderBody(container3);
    this.element.classList.add("debug-pane");
    container3.classList.add("debug-loaded-scripts", "show-file-icons");
    this.treeContainer = renderViewTree(container3);
    this.filter = new LoadedScriptsFilter();
    const root = new RootTreeItem(this.pathService, this.contextService, this.labelService);
    this.treeLabels = this.instantiationService.createInstance(ResourceLabels, { onDidChangeVisibility: this.onDidChangeBodyVisibility });
    this._register(this.treeLabels);
    const onFileIconThemeChange = (fileIconTheme) => {
      this.treeContainer.classList.toggle("align-icons-and-twisties", fileIconTheme.hasFileIcons && !fileIconTheme.hasFolderIcons);
      this.treeContainer.classList.toggle("hide-arrows", fileIconTheme.hidesExplorerArrows === true);
    };
    this._register(this.themeService.onDidFileIconThemeChange(onFileIconThemeChange));
    onFileIconThemeChange(this.themeService.getFileIconTheme());
    this.tree = this.instantiationService.createInstance(
      WorkbenchCompressibleObjectTree,
      "LoadedScriptsView",
      this.treeContainer,
      new LoadedScriptsDelegate(),
      [new LoadedScriptsRenderer(this.treeLabels)],
      {
        compressionEnabled: NEW_STYLE_COMPRESS,
        collapseByDefault: true,
        hideTwistiesOfChildlessElements: true,
        identityProvider: {
          getId: (element) => element.getId()
        },
        keyboardNavigationLabelProvider: {
          getKeyboardNavigationLabel: (element) => {
            return element.getLabel();
          },
          getCompressedNodeKeyboardNavigationLabel: (elements) => {
            return elements.map((e) => e.getLabel()).join("/");
          }
        },
        filter: this.filter,
        accessibilityProvider: new LoadedSciptsAccessibilityProvider(),
        overrideStyles: this.getLocationBasedColors().listOverrideStyles
      }
    );
    const updateView = (viewState2) => this.tree.setChildren(null, asTreeElement(root, viewState2).children);
    updateView();
    this.changeScheduler = new RunOnceScheduler(() => {
      this.treeNeedsRefreshOnVisible = false;
      if (this.tree) {
        updateView();
      }
    }, 300);
    this._register(this.changeScheduler);
    this._register(this.tree.onDidOpen((e) => {
      if (e.element instanceof BaseTreeItem) {
        const source = e.element.getSource();
        if (source && source.available) {
          const nullRange2 = { startLineNumber: 0, startColumn: 0, endLineNumber: 0, endColumn: 0 };
          source.openInEditor(this.editorService, nullRange2, e.editorOptions.preserveFocus, e.sideBySide, e.editorOptions.pinned);
        }
      }
    }));
    this._register(this.tree.onDidChangeFocus(() => {
      const focus = this.tree.getFocus();
      if (focus instanceof SessionTreeItem) {
        this.loadedScriptsItemType.set("session");
      } else {
        this.loadedScriptsItemType.reset();
      }
    }));
    const scheduleRefreshOnVisible = () => {
      if (this.isBodyVisible()) {
        this.changeScheduler.schedule();
      } else {
        this.treeNeedsRefreshOnVisible = true;
      }
    };
    const addSourcePathsToSession = async (session) => {
      if (session.capabilities.supportsLoadedSourcesRequest) {
        const sessionNode = root.add(session);
        const paths = await session.getLoadedSources();
        for (const path of paths) {
          await sessionNode.addPath(path);
        }
        scheduleRefreshOnVisible();
      }
    };
    const sessionListeners = this._register(new DisposableMap());
    const registerSessionListeners = (session) => {
      const store = new DisposableStore();
      sessionListeners.set(session.getId(), store);
      store.add(session.onDidChangeName(async () => {
        const sessionRoot = root.find(session);
        if (sessionRoot) {
          sessionRoot.updateLabel(session.getLabel());
          scheduleRefreshOnVisible();
        }
      }));
      store.add(session.onDidLoadedSource(async (event) => {
        let sessionRoot;
        switch (event.reason) {
          case "new":
          case "changed":
            sessionRoot = root.add(session);
            await sessionRoot.addPath(event.source);
            scheduleRefreshOnVisible();
            if (event.reason === "changed") {
              DebugContentProvider.refreshDebugContent(event.source.uri);
            }
            break;
          case "removed":
            sessionRoot = root.find(session);
            if (sessionRoot && sessionRoot.removePath(event.source)) {
              scheduleRefreshOnVisible();
            }
            break;
          default:
            this.filter.setFilter(event.source.name);
            this.tree.refilter();
            break;
        }
      }));
    };
    this._register(this.debugService.onDidNewSession(registerSessionListeners));
    this.debugService.getModel().getSessions().forEach(registerSessionListeners);
    this._register(this.debugService.onDidEndSession(({ session }) => {
      sessionListeners.deleteAndDispose(session.getId());
      root.remove(session.getId());
      this.changeScheduler.schedule();
    }));
    this.changeScheduler.schedule(0);
    this._register(this.onDidChangeBodyVisibility((visible) => {
      if (visible && this.treeNeedsRefreshOnVisible) {
        this.changeScheduler.schedule();
      }
    }));
    let viewState;
    this._register(this.tree.onDidChangeFindPattern((pattern) => {
      if (this.tree.findMode === 0 /* Highlight */) {
        return;
      }
      if (!viewState && pattern) {
        const expanded2 = /* @__PURE__ */ new Set();
        const visit2 = (node) => {
          if (node.element && !node.collapsed) {
            expanded2.add(node.element.getId());
          }
          for (const child of node.children) {
            visit2(child);
          }
        };
        visit2(this.tree.getNode());
        viewState = { expanded: expanded2 };
        this.tree.expandAll();
      } else if (!pattern && viewState) {
        this.tree.setFocus([]);
        updateView(viewState);
        viewState = void 0;
      }
    }));
    this.debugService.getModel().getSessions().forEach((session) => addSourcePathsToSession(session));
  }
  layoutBody(height, width2) {
    super.layoutBody(height, width2);
    this.tree.layout(height, width2);
  }
  collapseAll() {
    this.tree.collapseAll();
  }
  dispose() {
    dispose(this.tree);
    dispose(this.treeLabels);
    super.dispose();
  }
};

LoadedScriptsView = __decorateClass([
  __decorateParam(1, IContextMenuService),
  __decorateParam(2, IKeybindingService),
  __decorateParam(3, IInstantiationService),
  __decorateParam(4, IViewDescriptorService),
  __decorateParam(5, IConfigurationService),
  __decorateParam(6, IEditorService),
  __decorateParam(7, IContextKeyService),
  __decorateParam(8, IWorkspaceContextService),
  __decorateParam(9, IDebugService),
  __decorateParam(10, ILabelService),
  __decorateParam(11, IPathService),
  __decorateParam(12, IOpenerService),
  __decorateParam(13, IThemeService),
  __decorateParam(14, IHoverService)
], LoadedScriptsView);

var LoadedScriptsDelegate = class {
  getHeight(element) {
    return 22;
  }
  getTemplateId(element) {
    return LoadedScriptsRenderer.ID;
  }
};

var LoadedScriptsRenderer = class _LoadedScriptsRenderer {
  constructor(labels2) {
    this.labels = labels2;
  }
  static {
    this.ID = "lsrenderer";
  }
  get templateId() {
    return _LoadedScriptsRenderer.ID;
  }
  renderTemplate(container3) {
    const label3 = this.labels.create(container3, { supportHighlights: true });
    return { label: label3 };
  }
  renderElement(node, index2, data) {
    const element = node.element;
    const label3 = element.getLabel();
    this.render(element, label3, data, node.filterData);
  }
  renderCompressedElements(node, index2, data) {
    const element = node.element.elements[node.element.elements.length - 1];
    const labels2 = node.element.elements.map((e) => e.getLabel());
    this.render(element, labels2, data, node.filterData);
  }
  render(element, labels2, data, filterData) {
    const label3 = {
      name: labels2
    };
    const options3 = {
      title: element.getHoverLabel()
    };
    if (element instanceof RootFolderTreeItem) {
      options3.fileKind = 2 /* ROOT_FOLDER */;
    } else if (element instanceof SessionTreeItem) {
      options3.title = localize(14617, null);
      options3.hideIcon = true;
    } else if (element instanceof BaseTreeItem) {
      const src = element.getSource();
      if (src && src.uri) {
        label3.resource = src.uri;
        options3.fileKind = 0 /* FILE */;
      } else {
        options3.fileKind = 1 /* FOLDER */;
      }
    }
    options3.matches = createMatches(filterData);
    data.label.setResource(label3, options3);
  }
  disposeTemplate(templateData) {
    templateData.label.dispose();
  }
};

var LoadedSciptsAccessibilityProvider = class {
  getWidgetAriaLabel() {
    return localize(14614, null);
  }
  getAriaLabel(element) {
    if (element instanceof RootFolderTreeItem) {
      return localize(14616, null, element.getLabel());
    }
    if (element instanceof SessionTreeItem) {
      return localize(14618, null, element.getLabel());
    }
    if (element.hasChildren()) {
      return localize(14615, null, element.getLabel());
    } else {
      return localize(14619, null, element.getLabel());
    }
  }
};

var LoadedScriptsFilter = class {
  setFilter(filterText) {
    this.filterText = filterText;
  }
  filter(element, parentVisibility) {
    if (!this.filterText) {
      return 1 /* Visible */;
    }
    if (element.isLeaf()) {
      const name = element.getLabel();
      if (name.indexOf(this.filterText) >= 0) {
        return 1 /* Visible */;
      }
      return 0 /* Hidden */;
    }
    return 2 /* Recurse */;
  }
};

registerAction2(class Collapse2 extends ViewAction {
  constructor() {
    super({
      id: "loadedScripts.collapse",
      viewId: LOADED_SCRIPTS_VIEW_ID,
      title: localize(14613, null),
      f1: false,
      icon: Codicon.collapseAll,
      menu: {
        id: MenuId.ViewTitle,
        order: 30,
        group: "navigation",
        when: ContextKeyExpr.equals("view", LOADED_SCRIPTS_VIEW_ID)
      }
    });
  }
  runInView(_accessor, view) {
    view.collapseAll();
  }
});
export { asTreeElement, NEW_STYLE_COMPRESS, URI_SCHEMA_PATTERN, BaseTreeItem, RootFolderTreeItem, RootTreeItem, SessionTreeItem, LoadedScriptsView, LoadedScriptsDelegate, LoadedScriptsRenderer, LoadedSciptsAccessibilityProvider, LoadedScriptsFilter };
