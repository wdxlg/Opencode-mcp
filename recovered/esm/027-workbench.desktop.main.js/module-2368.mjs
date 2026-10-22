// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/widget/chatContentParts/chatTreeContentPart.ts
import { $ } from "./module-0075.mjs";
import { Disposable, DisposableStore } from "./module-0012.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IOpenerService } from "./module-0272.mjs";
import { ResourcePool } from "./module-2153.mjs";
import { ResourceLabels } from "./module-1323.mjs";
import { createFileIconThemableTreeContainerScope } from "./module-2152.mjs";
import { WorkbenchCompressibleAsyncDataTree } from "./module-0636.mjs";
import { localize } from "./module-0001.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IThemeService } from "./module-0287.mjs";


// src/vs/workbench/contrib/chat/browser/widget/chatContentParts/chatTreeContentPart.ts
var $54 = $;

var ChatTreeContentPart = class extends Disposable {
  constructor(data, treePool, openerService) {
    super();
    this.openerService = openerService;
    const ref = this._register(treePool.get());
    this.tree = ref.object;
    this.onDidFocus = this.tree.onDidFocus;
    this._register(this.tree.onDidOpen((e) => {
      if (e.element && !("children" in e.element)) {
        this.openerService.open(e.element.uri);
      }
    }));
    this._register(this.tree.onContextMenu((e) => {
      e.browserEvent.preventDefault();
      e.browserEvent.stopPropagation();
    }));
    this.tree.setInput(data).then(() => {
      if (!ref.isStale()) {
        this.tree.layout();
      }
    });
    this.domNode = this.tree.getHTMLElement().parentElement;
  }
  domFocus() {
    this.tree.domFocus();
  }
  hasSameContent(other) {
    return other.kind === "treeData";
  }
  addDisposable(disposable) {
    this._register(disposable);
  }
};

ChatTreeContentPart = __decorateClass([
  __decorateParam(2, IOpenerService)
], ChatTreeContentPart);

var TreePool = class extends Disposable {
  constructor(_onDidChangeVisibility, instantiationService, configService, themeService) {
    super();
    this._onDidChangeVisibility = _onDidChangeVisibility;
    this.instantiationService = instantiationService;
    this.configService = configService;
    this.themeService = themeService;
    this._pool = this._register(new ResourcePool(() => this.treeFactory()));
  }
  get inUse() {
    return this._pool.inUse;
  }
  treeFactory() {
    const store = new DisposableStore();
    const resourceLabels = store.add(this.instantiationService.createInstance(ResourceLabels, { onDidChangeVisibility: this._onDidChangeVisibility }));
    const container3 = $54(".interactive-response-progress-tree");
    store.add(createFileIconThemableTreeContainerScope(container3, this.themeService));
    const tree = this.instantiationService.createInstance(
      WorkbenchCompressibleAsyncDataTree,
      "ChatListRenderer",
      container3,
      new ChatListTreeDelegate(),
      new ChatListTreeCompressionDelegate(),
      [new ChatListTreeRenderer(resourceLabels, this.configService.getValue("explorer.decorations"))],
      new ChatListTreeDataSource(),
      {
        collapseByDefault: () => false,
        expandOnlyOnTwistieClick: () => false,
        identityProvider: {
          getId: (e) => e.uri.toString()
        },
        accessibilityProvider: {
          getAriaLabel: (element) => element.label,
          getWidgetAriaLabel: () => localize(12176, null)
        },
        alwaysConsumeMouseWheel: false
      }
    );
    return {
      tree,
      dispose: () => store.dispose()
    };
  }
  get() {
    const wrapper = this._pool.get();
    let stale = false;
    return {
      object: wrapper.tree,
      isStale: () => stale,
      dispose: () => {
        stale = true;
        this._pool.release(wrapper);
      }
    };
  }
  clear() {
    this._pool.clear();
  }
};

TreePool = __decorateClass([
  __decorateParam(1, IInstantiationService),
  __decorateParam(2, IConfigurationService),
  __decorateParam(3, IThemeService)
], TreePool);

var ChatListTreeDelegate = class _ChatListTreeDelegate {
  static {
    this.ITEM_HEIGHT = 22;
  }
  getHeight(element) {
    return _ChatListTreeDelegate.ITEM_HEIGHT;
  }
  getTemplateId(element) {
    return "chatListTreeTemplate";
  }
};

var ChatListTreeCompressionDelegate = class {
  isIncompressible(element) {
    return !element.children;
  }
};

var ChatListTreeRenderer = class {
  constructor(labels2, decorations) {
    this.labels = labels2;
    this.decorations = decorations;
    this.templateId = "chatListTreeTemplate";
  }
  renderCompressedElements(element, index2, templateData) {
    templateData.label.element.style.display = "flex";
    const label3 = element.element.elements.map((e) => e.label);
    templateData.label.setResource({ resource: element.element.elements[0].uri, name: label3 }, {
      title: element.element.elements[0].label,
      fileKind: element.children ? 1 /* FOLDER */ : 0 /* FILE */,
      extraClasses: ["explorer-item"],
      fileDecorations: this.decorations
    });
  }
  renderTemplate(container3) {
    const templateDisposables = new DisposableStore();
    const label3 = templateDisposables.add(this.labels.create(container3, { supportHighlights: true }));
    return { templateDisposables, label: label3 };
  }
  renderElement(element, index2, templateData) {
    templateData.label.element.style.display = "flex";
    if (!element.children.length && element.element.type !== 2 /* Directory */) {
      templateData.label.setFile(element.element.uri, {
        fileKind: 0 /* FILE */,
        hidePath: true,
        fileDecorations: this.decorations
      });
    } else {
      templateData.label.setResource({ resource: element.element.uri, name: element.element.label }, {
        title: element.element.label,
        fileKind: 1 /* FOLDER */,
        fileDecorations: this.decorations
      });
    }
  }
  disposeTemplate(templateData) {
    templateData.templateDisposables.dispose();
  }
};

var ChatListTreeDataSource = class {
  hasChildren(element) {
    return !!element.children;
  }
  async getChildren(element) {
    return element.children ?? [];
  }
};
export { $54, ChatTreeContentPart, TreePool, ChatListTreeDelegate, ChatListTreeCompressionDelegate, ChatListTreeRenderer, ChatListTreeDataSource };
