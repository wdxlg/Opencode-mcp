// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/extensions/browser/extensionsViewer.ts
import { localize } from "./module-0001.mjs";
import { Disposable, DisposableStore, MutableDisposable, dispose, isDisposable, toDisposable } from "./module-0012.mjs";
import { Action, ActionRunner, Separator } from "./module-0082.mjs";
import { Delegate3, Renderer } from "./module-2281.mjs";
import { IListService, WorkbenchAsyncDataTree, WorkbenchPagedList } from "./module-0636.mjs";
import { getLocationBasedViewColors } from "./module-1335.mjs";
import { Event2 } from "./module-0017.mjs";
import { DelayedPagedModel } from "./module-2282.mjs";
import { areSameExtensions } from "./module-0886.mjs";
import { ExtensionAction, ManageExtensionAction2, getContextMenuActions2 } from "./module-1877.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IExtensionsWorkbenchService } from "./module-1022.mjs";
import { IViewDescriptorService } from "./module-1093.mjs";
import { IWorkbenchLayoutService } from "./module-1118.mjs";
import { INotificationService } from "./module-0336.mjs";
import { IContextMenuService } from "./module-0488.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { ILogService } from "./module-0095.mjs";
import { $, EventType, addDisposableListener, append, getWindow, isKeyboardEvent } from "./module-0075.mjs";
import { StandardKeyboardEvent } from "./module-0022.mjs";
import { StandardMouseEvent } from "./module-0024.mjs";
import { ExtensionIconWidget } from "./module-2280.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { isNonEmptyArray } from "./module-0007.mjs";
import { CancellationToken, CancellationTokenSource } from "./module-0025.mjs";
import { isCancellationError } from "./module-0004.mjs";
import { registerThemingParticipant } from "./module-0287.mjs";
import { listFocusBackground, listFocusForeground } from "./module-0232.mjs";
import { foreground } from "./module-0227.mjs";
import { editorBackground } from "./module-0229.mjs";


// src/vs/workbench/contrib/extensions/browser/extensionsViewer.ts
function getAriaLabelForExtension(extension) {
  if (!extension) {
    return "";
  }
  const publisher = extension.publisherDomain?.verified ? localize(15429, null, extension.publisherDisplayName) : localize(15427, null, extension.publisherDisplayName);
  const deprecated = extension?.deprecationInfo ? localize(15426, null) : "";
  const rating = extension?.rating ? localize(15428, null, extension.rating.toFixed(2), extension.ratingCount) : "";
  return `${extension.displayName}, ${deprecated ? `${deprecated}, ` : ""}${extension.version}, ${publisher}, ${extension.description} ${rating ? `, ${rating}` : ""}`;
}

var ExtensionsList = class extends Disposable {
  constructor(parent, viewId, options3, extensionsViewState, extensionsWorkbenchService, viewDescriptorService, layoutService, notificationService, contextMenuService, contextKeyService, instantiationService, logService) {
    super();
    this.extensionsWorkbenchService = extensionsWorkbenchService;
    this.contextMenuService = contextMenuService;
    this.contextKeyService = contextKeyService;
    this.instantiationService = instantiationService;
    this.logService = logService;
    this.contextMenuActionRunner = this._register(new ActionRunner());
    this.modalNavigationDisposable = this._register(new MutableDisposable());
    this._register(this.contextMenuActionRunner.onDidRun(({ error }) => error && notificationService.error(error)));
    const delegate = new Delegate3();
    const renderer = instantiationService.createInstance(Renderer, extensionsViewState, {
      hoverOptions: {
        position: () => {
          const viewLocation = viewDescriptorService.getViewLocationById(viewId);
          if (viewLocation === 0 /* Sidebar */) {
            return layoutService.getSideBarPosition() === 0 /* LEFT */ ? 1 /* RIGHT */ : 0 /* LEFT */;
          }
          if (viewLocation === 2 /* AuxiliaryBar */) {
            return layoutService.getSideBarPosition() === 0 /* LEFT */ ? 0 /* LEFT */ : 1 /* RIGHT */;
          }
          return 1 /* RIGHT */;
        }
      }
    });
    this.list = instantiationService.createInstance(WorkbenchPagedList, `${viewId}-Extensions`, parent, delegate, [renderer], {
      multipleSelectionSupport: false,
      setRowLineHeight: false,
      horizontalScrolling: false,
      accessibilityProvider: {
        getAriaLabel(extension) {
          return getAriaLabelForExtension(extension);
        },
        getWidgetAriaLabel() {
          return localize(15430, null);
        }
      },
      overrideStyles: getLocationBasedViewColors(viewDescriptorService.getViewLocationById(viewId)).listOverrideStyles,
      openOnSingleClick: true,
      ...options3
    });
    this._register(this.list.onContextMenu((e) => this.onContextMenu(e), this));
    this._register(this.list);
    this._register(Event2.debounce(Event2.filter(this.list.onDidOpen, (e) => e.element !== null), (_, event) => event, 75, true)((options4) => {
      this.openExtension(options4.element, { sideByside: options4.sideBySide, ...options4.editorOptions });
    }));
  }
  setModel(model) {
    this.list.model = new DelayedPagedModel(model);
  }
  layout(height, width2) {
    this.list.layout(height, width2);
  }
  openExtension(extension, options3) {
    extension = this.extensionsWorkbenchService.local.filter((e) => areSameExtensions(e.identifier, extension.identifier))[0] || extension;
    this.extensionsWorkbenchService.open(extension, {
      ...options3,
      modal: options3.sideByside ? void 0 : buildModalNavigationForPagedList(
        extension,
        () => this.list.model,
        (extA, extB) => areSameExtensions(extA.identifier, extB.identifier),
        (ext, modal) => this.extensionsWorkbenchService.open(ext, { pinned: false, modal }),
        this.modalNavigationDisposable,
        this.logService
      )
    });
  }
  async onContextMenu(e) {
    if (e.element) {
      const disposables = new DisposableStore();
      const manageExtensionAction = disposables.add(this.instantiationService.createInstance(ManageExtensionAction2));
      const extension = e.element ? this.extensionsWorkbenchService.local.find((local) => areSameExtensions(local.identifier, e.element.identifier) && (!e.element.server || e.element.server === local.server)) || e.element : e.element;
      manageExtensionAction.extension = extension;
      let groups = [];
      if (manageExtensionAction.enabled) {
        groups = await manageExtensionAction.getActionGroups();
      } else if (extension) {
        groups = await getContextMenuActions2(extension, this.contextKeyService, this.instantiationService);
        groups.forEach((group2) => group2.forEach((extensionAction) => {
          if (extensionAction instanceof ExtensionAction) {
            extensionAction.extension = extension;
          }
        }));
      }
      const actions = [];
      for (const menuActions of groups) {
        for (const menuAction of menuActions) {
          actions.push(menuAction);
          if (isDisposable(menuAction)) {
            disposables.add(menuAction);
          }
        }
        actions.push(new Separator());
      }
      actions.pop();
      this.contextMenuService.showContextMenu({
        getAnchor: () => e.anchor,
        getActions: () => actions,
        actionRunner: this.contextMenuActionRunner,
        onHide: () => disposables.dispose()
      });
    }
  }
};

ExtensionsList = __decorateClass([
  __decorateParam(4, IExtensionsWorkbenchService),
  __decorateParam(5, IViewDescriptorService),
  __decorateParam(6, IWorkbenchLayoutService),
  __decorateParam(7, INotificationService),
  __decorateParam(8, IContextMenuService),
  __decorateParam(9, IContextKeyService),
  __decorateParam(10, IInstantiationService),
  __decorateParam(11, ILogService)
], ExtensionsList);

var ExtensionsGridView = class extends Disposable {
  constructor(parent, delegate, instantiationService) {
    super();
    this.instantiationService = instantiationService;
    this.element = append(parent, $(".extensions-grid-view"));
    this.renderer = this.instantiationService.createInstance(Renderer, { onFocus: Event2.None, onBlur: Event2.None, filters: {} }, { hoverOptions: { position() {
      return 2 /* BELOW */;
    } } });
    this.delegate = delegate;
    this.disposableStore = this._register(new DisposableStore());
  }
  setExtensions(extensions) {
    this.disposableStore.clear();
    extensions.forEach((e, index2) => this.renderExtension(e, index2));
  }
  renderExtension(extension, index2) {
    const extensionContainer = append(this.element, $(".extension-container"));
    extensionContainer.style.height = `${this.delegate.getHeight()}px`;
    extensionContainer.setAttribute("tabindex", "0");
    const template2 = this.renderer.renderTemplate(extensionContainer);
    this.disposableStore.add(toDisposable(() => this.renderer.disposeTemplate(template2)));
    const openExtensionAction = this.instantiationService.createInstance(OpenExtensionAction);
    openExtensionAction.extension = extension;
    template2.name.setAttribute("tabindex", "0");
    const handleEvent = (e) => {
      if (e instanceof StandardKeyboardEvent && e.keyCode !== 3 /* Enter */) {
        return;
      }
      openExtensionAction.run(e.ctrlKey || e.metaKey);
      e.stopPropagation();
      e.preventDefault();
    };
    this.disposableStore.add(addDisposableListener(template2.name, EventType.CLICK, (e) => handleEvent(new StandardMouseEvent(getWindow(template2.name), e))));
    this.disposableStore.add(addDisposableListener(template2.name, EventType.KEY_DOWN, (e) => handleEvent(new StandardKeyboardEvent(e))));
    this.disposableStore.add(addDisposableListener(extensionContainer, EventType.KEY_DOWN, (e) => handleEvent(new StandardKeyboardEvent(e))));
    this.renderer.renderElement(extension, index2, template2);
  }
};

ExtensionsGridView = __decorateClass([
  __decorateParam(2, IInstantiationService)
], ExtensionsGridView);

var AsyncDataSource = class {
  hasChildren({ hasChildren }) {
    return hasChildren;
  }
  getChildren(extensionData) {
    return extensionData.getChildren();
  }
};

var VirualDelegate = class {
  getHeight(element) {
    return 62;
  }
  getTemplateId({ extension }) {
    return extension ? ExtensionRenderer.TEMPLATE_ID : UnknownExtensionRenderer.TEMPLATE_ID;
  }
};

var ExtensionRenderer = class {
  constructor(instantiationService) {
    this.instantiationService = instantiationService;
  }
  static {
    this.TEMPLATE_ID = "extension-template";
  }
  get templateId() {
    return ExtensionRenderer.TEMPLATE_ID;
  }
  renderTemplate(container3) {
    container3.classList.add("extension");
    const iconWidget = this.instantiationService.createInstance(ExtensionIconWidget, container3);
    const details = append(container3, $(".details"));
    const header2 = append(details, $(".header"));
    const name = append(header2, $("span.name"));
    const openExtensionAction = this.instantiationService.createInstance(OpenExtensionAction);
    const extensionDisposables = [addDisposableListener(name, "click", (e) => {
      openExtensionAction.run(e.ctrlKey || e.metaKey);
      e.stopPropagation();
      e.preventDefault();
    }), iconWidget, openExtensionAction];
    const identifier2 = append(header2, $("span.identifier"));
    const footer = append(details, $(".footer"));
    const author = append(footer, $(".author"));
    return {
      name,
      identifier: identifier2,
      author,
      extensionDisposables,
      set extensionData(extensionData) {
        iconWidget.extension = extensionData.extension;
        openExtensionAction.extension = extensionData.extension;
      }
    };
  }
  renderElement(node, index2, data) {
    const extension = node.element.extension;
    data.name.textContent = extension.displayName;
    data.identifier.textContent = extension.identifier.id;
    data.author.textContent = extension.publisherDisplayName;
    data.extensionData = node.element;
  }
  disposeTemplate(templateData) {
    templateData.extensionDisposables = dispose(templateData.extensionDisposables);
  }
};

ExtensionRenderer = __decorateClass([
  __decorateParam(0, IInstantiationService)
], ExtensionRenderer);

var UnknownExtensionRenderer = class _UnknownExtensionRenderer {
  static {
    this.TEMPLATE_ID = "unknown-extension-template";
  }
  get templateId() {
    return _UnknownExtensionRenderer.TEMPLATE_ID;
  }
  renderTemplate(container3) {
    const messageContainer = append(container3, $("div.unknown-extension"));
    append(messageContainer, $("span.error-marker")).textContent = localize(15425, null);
    append(messageContainer, $("span.message")).textContent = localize(15431, null);
    const identifier2 = append(messageContainer, $("span.message"));
    return { identifier: identifier2 };
  }
  renderElement(node, index2, data) {
    data.identifier.textContent = node.element.extension.identifier.id;
  }
  disposeTemplate(data) {
  }
};

var OpenExtensionAction = class extends Action {
  constructor(extensionsWorkdbenchService) {
    super("extensions.action.openExtension", "");
    this.extensionsWorkdbenchService = extensionsWorkdbenchService;
  }
  set extension(extension) {
    this._extension = extension;
  }
  run(sideByside) {
    if (this._extension) {
      return this.extensionsWorkdbenchService.open(this._extension, { sideByside });
    }
    return Promise.resolve();
  }
};

OpenExtensionAction = __decorateClass([
  __decorateParam(0, IExtensionsWorkbenchService)
], OpenExtensionAction);

var ExtensionsTree = class extends WorkbenchAsyncDataTree {
  constructor(input, container3, overrideStyles2, contextKeyService, listService, instantiationService, configurationService, extensionsWorkdbenchService) {
    const delegate = new VirualDelegate();
    const dataSource = new AsyncDataSource();
    const renderers = [instantiationService.createInstance(ExtensionRenderer), instantiationService.createInstance(UnknownExtensionRenderer)];
    const identityProvider3 = {
      getId({ extension, parent }) {
        return parent ? this.getId(parent) + "/" + extension.identifier.id : extension.identifier.id;
      }
    };
    super(
      "ExtensionsTree",
      container3,
      delegate,
      renderers,
      dataSource,
      {
        indent: 40,
        identityProvider: identityProvider3,
        multipleSelectionSupport: false,
        overrideStyles: overrideStyles2,
        accessibilityProvider: {
          getAriaLabel(extensionData) {
            return getAriaLabelForExtension(extensionData.extension);
          },
          getWidgetAriaLabel() {
            return localize(15430, null);
          }
        }
      },
      instantiationService,
      contextKeyService,
      listService,
      configurationService
    );
    this.setInput(input);
    this.disposables.add(this.onDidChangeSelection((event) => {
      if (isKeyboardEvent(event.browserEvent)) {
        extensionsWorkdbenchService.open(event.elements[0].extension, { sideByside: false });
      }
    }));
  }
};

ExtensionsTree = __decorateClass([
  __decorateParam(3, IContextKeyService),
  __decorateParam(4, IListService),
  __decorateParam(5, IInstantiationService),
  __decorateParam(6, IConfigurationService),
  __decorateParam(7, IExtensionsWorkbenchService)
], ExtensionsTree);

var ExtensionData2 = class _ExtensionData {
  constructor(extension, parent, getChildrenExtensionIds, extensionsWorkbenchService) {
    this.extension = extension;
    this.parent = parent;
    this.getChildrenExtensionIds = getChildrenExtensionIds;
    this.extensionsWorkbenchService = extensionsWorkbenchService;
    this.childrenExtensionIds = this.getChildrenExtensionIds(extension);
  }
  get hasChildren() {
    return isNonEmptyArray(this.childrenExtensionIds);
  }
  async getChildren() {
    if (this.hasChildren) {
      const result = await getExtensions2(this.childrenExtensionIds, this.extensionsWorkbenchService);
      return result.map((extension) => new _ExtensionData(extension, this, this.getChildrenExtensionIds, this.extensionsWorkbenchService));
    }
    return null;
  }
};

async function getExtensions2(extensions, extensionsWorkbenchService) {
  const localById = extensionsWorkbenchService.local.reduce((result2, e) => {
    result2.set(e.identifier.id.toLowerCase(), e);
    return result2;
  }, /* @__PURE__ */ new Map());
  const result = [];
  const toQuery = [];
  for (const extensionId of extensions) {
    const id2 = extensionId.toLowerCase();
    const local = localById.get(id2);
    if (local) {
      result.push(local);
    } else {
      toQuery.push(id2);
    }
  }
  if (toQuery.length) {
    const galleryResult = await extensionsWorkbenchService.getExtensions(toQuery.map((id2) => ({ id: id2 })), CancellationToken.None);
    result.push(...galleryResult);
  }
  return result;
}

function buildModalNavigationForPagedList(openedItem, getModel, isSame, openItem, cancellationStore, logService) {
  const model = getModel();
  if (!model) {
    return void 0;
  }
  const total = model.length;
  if (total <= 1) {
    return void 0;
  }
  let current = -1;
  for (let i2 = 0; i2 < total; i2++) {
    if (model.isResolved(i2) && isSame(model.get(i2), openedItem)) {
      current = i2;
      break;
    }
  }
  if (current === -1) {
    return void 0;
  }
  const openAtIndex = (index2, item) => {
    const currentTotal = getModel()?.length ?? 0;
    openItem(item, { navigation: { total: currentTotal, current: index2, navigate: navigate2 } });
  };
  let cts;
  const navigate2 = (index2) => {
    cts?.cancel();
    cts = cancellationStore.value = new CancellationTokenSource();
    const token = cts.token;
    const currentModel = getModel();
    if (!currentModel || index2 < 0 || index2 >= currentModel.length) {
      return;
    }
    if (currentModel.isResolved(index2)) {
      openAtIndex(index2, currentModel.get(index2));
    } else {
      currentModel.resolve(index2, token).then((item) => {
        if (token.isCancellationRequested) {
          return;
        }
        openAtIndex(index2, item);
      }, (error) => {
        if (!isCancellationError(error)) {
          logService.error(`Error while resolving item at index ${index2} for modal navigation`, error);
        }
      });
    }
  };
  return { navigation: { total, current, navigate: navigate2 } };
}

registerThemingParticipant((theme, collector) => {
  const focusBackground = theme.getColor(listFocusBackground);
  if (focusBackground) {
    collector.addRule(`.extensions-grid-view .extension-container:focus { background-color: ${focusBackground}; outline: none; }`);
  }
  const focusForeground = theme.getColor(listFocusForeground);
  if (focusForeground) {
    collector.addRule(`.extensions-grid-view .extension-container:focus { color: ${focusForeground}; }`);
  }
  const foregroundColor = theme.getColor(foreground);
  const editorBackgroundColor = theme.getColor(editorBackground);
  if (foregroundColor && editorBackgroundColor) {
    const authorForeground = foregroundColor.transparent(0.9).makeOpaque(editorBackgroundColor);
    collector.addRule(`.extensions-grid-view .extension-container:not(.disabled) .author { color: ${authorForeground}; }`);
    const disabledExtensionForeground = foregroundColor.transparent(0.5).makeOpaque(editorBackgroundColor);
    collector.addRule(`.extensions-grid-view .extension-container.disabled { color: ${disabledExtensionForeground}; }`);
  }
});
export { getAriaLabelForExtension, getExtensions2, buildModalNavigationForPagedList, ExtensionsList, ExtensionsGridView, AsyncDataSource, VirualDelegate, ExtensionRenderer, UnknownExtensionRenderer, OpenExtensionAction, ExtensionsTree, ExtensionData2 };
