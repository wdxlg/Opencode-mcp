// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/widget/chatContentParts/chatReferencesContentPart.ts
import { $, EventHelper, hide } from "./module-0075.mjs";
import { ChatCollapsibleContentPart } from "./module-2116.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { Codicon } from "./module-0085.mjs";
import { URI } from "./module-0032.mjs";
import { Action2, IMenuService, MenuId, registerAction2 } from "./module-0092.mjs";
import { getFlatContextMenuActions } from "./module-0516.mjs";
import { ResourceContextKey } from "./module-0950.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IOpenerService } from "./module-0272.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IContextMenuService } from "./module-0488.mjs";
import { IHoverService } from "./module-0520.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { Disposable, DisposableStore } from "./module-0012.mjs";
import { ResourcePool } from "./module-2126.mjs";
import { ResourceLabels } from "./module-1322.mjs";
import { createFileIconThemableTreeContainerScope } from "./module-2125.mjs";
import { WorkbenchList } from "./module-0636.mjs";
import { basename } from "./module-0026.mjs";
import { coalesce } from "./module-0007.mjs";
import { fillEditorsDragData } from "./module-1380.mjs";
import { IThemeService } from "./module-0287.mjs";
import { ILabelService } from "./module-0641.mjs";
import { ServiceCollection } from "./module-0440.mjs";
import { ContextKeyExpr, IContextKeyService } from "./module-0089.mjs";
import { MenuWorkbenchToolBar } from "./module-0519.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { isDark } from "./module-0247.mjs";
import { basenameOrAuthority, isEqualAuthority } from "./module-0034.mjs";
import { SETTINGS_AUTHORITY } from "./module-1293.mjs";
import { Schemas, matchesSomeScheme } from "./module-0033.mjs";
import { chatEditingWidgetFileStateContextKey } from "./module-1082.mjs";
import { IProductService } from "./module-0875.mjs";
import { ExplorerFolderContext } from "./module-1534.mjs";
import { IChatWidgetService } from "./module-0982.mjs";
import { IClipboardService } from "./module-0487.mjs";


// src/vs/workbench/contrib/chat/browser/widget/chatContentParts/chatReferencesContentPart.ts
var $36 = $;

var ChatCollapsibleListContentPart = class extends ChatCollapsibleContentPart {
  constructor(data, labelOverride, context2, contentReferencesListPool, hoverMessage, openerService, menuService, instantiationService, contextMenuService, hoverService, configurationService) {
    super(
      labelOverride ?? (data.length > 1 ? localize(12048, null, data.length) : localize(12049, null, 1)),
      context2,
      hoverMessage,
      hoverService,
      configurationService
    );
    this.data = data;
    this.contentReferencesListPool = contentReferencesListPool;
    this.openerService = openerService;
    this.menuService = menuService;
    this.instantiationService = instantiationService;
    this.contextMenuService = contextMenuService;
    this.icon = Codicon.check;
  }
  initContent() {
    const ref = this._register(this.contentReferencesListPool.get());
    const list2 = ref.object;
    this._register(list2.onDidOpen((e4) => {
      if (e4.element && "reference" in e4.element && typeof e4.element.reference === "object") {
        const uriOrLocation = "variableName" in e4.element.reference ? e4.element.reference.value : e4.element.reference;
        const uri4 = URI.isUri(uriOrLocation) ? uriOrLocation : uriOrLocation?.uri;
        if (uri4) {
          this.openerService.open(
            uri4,
            {
              fromUserGesture: true,
              editorOptions: {
                ...e4.editorOptions,
                ...{
                  selection: uriOrLocation && "range" in uriOrLocation ? uriOrLocation.range : void 0
                }
              }
            }
          );
        }
      }
    }));
    this._register(list2.onContextMenu((e4) => {
      EventHelper.stop(e4.browserEvent, true);
      const uri4 = e4.element && getResourceForElement(e4.element);
      if (!uri4) {
        return;
      }
      this.contextMenuService.showContextMenu({
        getAnchor: () => e4.anchor,
        getActions: () => {
          const menu = this.menuService.getMenuActions(MenuId.ChatAttachmentsContext, list2.contextKeyService, { shouldForwardArgs: true, arg: uri4 });
          return getFlatContextMenuActions(menu);
        }
      });
    }));
    const resourceContextKey = this._register(this.instantiationService.createInstance(ResourceContextKey));
    this._register(list2.onDidChangeFocus((e4) => {
      resourceContextKey.reset();
      const element = e4.elements.length ? e4.elements[0] : void 0;
      const uri4 = element && getResourceForElement(element);
      resourceContextKey.set(uri4 ?? null);
    }));
    const maxItemsShown = 6;
    const itemsShown = Math.min(this.data.length, maxItemsShown);
    const height = itemsShown * 22;
    list2.layout(height);
    list2.getHTMLElement().style.height = `${height}px`;
    list2.splice(0, list2.length, this.data);
    return list2.getHTMLElement().parentElement;
  }
  hasSameContent(other, followingContent, element) {
    return other.kind === "references" && other.references.length === this.data.length && !!followingContent.length === this.hasFollowingContent;
  }
};

ChatCollapsibleListContentPart = __decorateClass([
  __decorateParam(5, IOpenerService),
  __decorateParam(6, IMenuService),
  __decorateParam(7, IInstantiationService),
  __decorateParam(8, IContextMenuService),
  __decorateParam(9, IHoverService),
  __decorateParam(10, IConfigurationService)
], ChatCollapsibleListContentPart);

var ChatUsedReferencesListContentPart = class extends ChatCollapsibleListContentPart {
  constructor(data, labelOverride, context2, contentReferencesListPool, options3, openerService, menuService, instantiationService, contextMenuService, hoverService, configurationService) {
    super(data, labelOverride, context2, contentReferencesListPool, void 0, openerService, menuService, instantiationService, contextMenuService, hoverService, configurationService);
    this.options = options3;
    if (data.length === 0) {
      hide(this.domNode);
    }
  }
  isExpanded() {
    const element = this.element;
    return element.usedReferencesExpanded ?? !!(this.options.expandedWhenEmptyResponse && element.response.value.length === 0);
  }
  setExpanded(value2) {
    const element = this.element;
    element.usedReferencesExpanded = !this.isExpanded();
  }
};

ChatUsedReferencesListContentPart = __decorateClass([
  __decorateParam(5, IOpenerService),
  __decorateParam(6, IMenuService),
  __decorateParam(7, IInstantiationService),
  __decorateParam(8, IContextMenuService),
  __decorateParam(9, IHoverService),
  __decorateParam(10, IConfigurationService)
], ChatUsedReferencesListContentPart);

var CollapsibleListPool = class extends Disposable {
  constructor(_onDidChangeVisibility, menuId, listOptions, instantiationService, themeService, labelService) {
    super();
    this._onDidChangeVisibility = _onDidChangeVisibility;
    this.menuId = menuId;
    this.listOptions = listOptions;
    this.instantiationService = instantiationService;
    this.themeService = themeService;
    this.labelService = labelService;
    this._pool = this._register(new ResourcePool(() => this.listFactory()));
  }
  get inUse() {
    return this._pool.inUse;
  }
  listFactory() {
    const store = new DisposableStore();
    const resourceLabels = store.add(this.instantiationService.createInstance(ResourceLabels, { onDidChangeVisibility: this._onDidChangeVisibility }));
    const container2 = $36(".chat-used-context-list");
    store.add(createFileIconThemableTreeContainerScope(container2, this.themeService));
    const list2 = store.add(this.instantiationService.createInstance(
      WorkbenchList,
      "ChatListRenderer",
      container2,
      new CollapsibleListDelegate(),
      [this.instantiationService.createInstance(CollapsibleListRenderer, resourceLabels, this.menuId)],
      {
        ...this.listOptions,
        alwaysConsumeMouseWheel: false,
        accessibilityProvider: {
          getAriaLabel: (element) => {
            if (element.kind === "warning") {
              return element.content.value;
            }
            const reference = element.reference;
            if (typeof reference === "string") {
              return reference;
            } else if ("variableName" in reference) {
              return reference.variableName;
            } else if (URI.isUri(reference)) {
              return basename(reference.path);
            } else {
              return basename(reference.uri.path);
            }
          },
          getWidgetAriaLabel: () => localize(12044, null)
        },
        dnd: {
          getDragURI: (element) => getResourceForElement(element)?.toString() ?? null,
          getDragLabel: (elements, originalEvent) => {
            const uris = coalesce(elements.map(getResourceForElement));
            if (!uris.length) {
              return void 0;
            } else if (uris.length === 1) {
              return this.labelService.getUriLabel(uris[0], { relative: true });
            } else {
              return `${uris.length}`;
            }
          },
          dispose: () => {
          },
          onDragOver: () => false,
          drop: () => {
          },
          onDragStart: (data, originalEvent) => {
            try {
              const elements = data.getData();
              const uris = coalesce(elements.map(getResourceForElement));
              this.instantiationService.invokeFunction((accessor) => fillEditorsDragData(accessor, uris, originalEvent));
            } catch {
            }
          }
        }
      }
    ));
    return {
      list: list2,
      dispose: () => store.dispose()
    };
  }
  get() {
    const wrapper = this._pool.get();
    let stale = false;
    return {
      object: wrapper.list,
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

CollapsibleListPool = __decorateClass([
  __decorateParam(3, IInstantiationService),
  __decorateParam(4, IThemeService),
  __decorateParam(5, ILabelService)
], CollapsibleListPool);

var CollapsibleListDelegate = class {
  getHeight(element) {
    return 22;
  }
  getTemplateId(element) {
    return CollapsibleListRenderer.TEMPLATE_ID;
  }
};

var CollapsibleListRenderer = class {
  constructor(labels, menuId, themeService, productService, instantiationService, contextKeyService) {
    this.labels = labels;
    this.menuId = menuId;
    this.themeService = themeService;
    this.productService = productService;
    this.instantiationService = instantiationService;
    this.contextKeyService = contextKeyService;
    this.templateId = CollapsibleListRenderer.TEMPLATE_ID;
  }
  static {
    this.TEMPLATE_ID = "chatCollapsibleListRenderer";
  }
  renderTemplate(container2) {
    const templateDisposables = new DisposableStore();
    const label3 = templateDisposables.add(this.labels.create(container2, { supportHighlights: true, supportIcons: true }));
    const fileDiffsContainer = $36(".working-set-line-counts");
    const addedSpan = $(".working-set-lines-added");
    const removedSpan = $(".working-set-lines-removed");
    fileDiffsContainer.appendChild(addedSpan);
    fileDiffsContainer.appendChild(removedSpan);
    label3.element.appendChild(fileDiffsContainer);
    let toolbar;
    let actionBarContainer;
    let contextKeyService;
    if (this.menuId) {
      actionBarContainer = $36(".chat-collapsible-list-action-bar");
      contextKeyService = templateDisposables.add(this.contextKeyService.createScoped(actionBarContainer));
      const scopedInstantiationService = templateDisposables.add(this.instantiationService.createChild(new ServiceCollection([IContextKeyService, contextKeyService])));
      toolbar = templateDisposables.add(scopedInstantiationService.createInstance(MenuWorkbenchToolBar, actionBarContainer, this.menuId, { menuOptions: { shouldForwardArgs: true, arg: void 0 } }));
      label3.element.appendChild(actionBarContainer);
    }
    return { templateDisposables, label: label3, toolbar, actionBarContainer, contextKeyService, fileDiffsContainer, addedSpan, removedSpan };
  }
  getReferenceIcon(data) {
    if (ThemeIcon.isThemeIcon(data.iconPath)) {
      return data.iconPath;
    } else {
      return isDark(this.themeService.getColorTheme().type) && data.iconPath?.dark ? data.iconPath?.dark : data.iconPath?.light;
    }
  }
  renderElement(data, index2, templateData) {
    if (data.kind === "warning") {
      templateData.label.setResource({ name: data.content.value }, { icon: Codicon.warning });
      return;
    }
    const reference = data.reference;
    const icon2 = this.getReferenceIcon(data);
    templateData.label.element.style.display = "flex";
    let arg;
    if (typeof reference === "object" && "variableName" in reference) {
      if (reference.value) {
        const uri4 = URI.isUri(reference.value) ? reference.value : reference.value.uri;
        templateData.label.setResource(
          {
            resource: uri4,
            name: basenameOrAuthority(uri4),
            description: `#${reference.variableName}`,
            range: "range" in reference.value ? reference.value.range : void 0
          },
          { icon: icon2, title: data.options?.status?.description ?? data.title }
        );
      } else if (reference.variableName.startsWith("kernelVariable")) {
        const variable = reference.variableName.split(":")[1];
        const asVariableName = `${variable}`;
        const label3 = `Kernel variable`;
        templateData.label.setLabel(label3, asVariableName, { title: data.options?.status?.description });
      } else {
        templateData.label.setLabel(reference.variableName, void 0, { title: data.options?.status?.description ?? data.title });
      }
    } else if (typeof reference === "string") {
      templateData.label.setLabel(reference, void 0, { iconPath: URI.isUri(icon2) ? icon2 : void 0, title: data.options?.status?.description ?? data.title });
    } else {
      const uri4 = "uri" in reference ? reference.uri : reference;
      arg = uri4;
      const extraClasses = data.excluded ? ["excluded"] : [];
      if (uri4.scheme === "https" && isEqualAuthority(uri4.authority, "github.com") && uri4.path.includes("/tree/")) {
        templateData.label.setResource(getResourceLabelForGithubUri(uri4), { icon: Codicon.github, title: data.title, strikethrough: data.excluded, extraClasses });
      } else if (uri4.scheme === this.productService.urlProtocol && isEqualAuthority(uri4.authority, SETTINGS_AUTHORITY)) {
        const settingId = uri4.path.substring(1);
        templateData.label.setResource({ resource: uri4, name: settingId }, { icon: Codicon.settingsGear, title: localize(12047, null, settingId), strikethrough: data.excluded, extraClasses });
      } else if (matchesSomeScheme(uri4, Schemas.mailto, Schemas.http, Schemas.https)) {
        templateData.label.setResource({ resource: uri4, name: uri4.toString(true) }, { icon: icon2 ?? Codicon.globe, title: data.options?.status?.description ?? data.title ?? uri4.toString(true), strikethrough: data.excluded, extraClasses });
      } else {
        templateData.label.setFile(uri4, {
          fileKind: 0 /* FILE */,
          // Should not have this live-updating data on a historical reference
          fileDecorations: void 0,
          range: "range" in reference ? reference.range : void 0,
          title: data.options?.status?.description ?? data.title,
          strikethrough: data.excluded,
          extraClasses
        });
      }
    }
    for (const selector of [".monaco-icon-suffix-container", ".monaco-icon-name-container"]) {
      const element = templateData.label.element.querySelector(selector);
      if (element) {
        if (data.options?.status?.kind === 3 /* Omitted */ || data.options?.status?.kind === 2 /* Partial */) {
          element.classList.add("warning");
        } else {
          element.classList.remove("warning");
        }
      }
    }
    if (data.state !== void 0) {
      if (templateData.actionBarContainer || data.showModifiedState) {
        const diffMeta = data?.options?.diffMeta;
        if (diffMeta) {
          if (!templateData.fileDiffsContainer || !templateData.addedSpan || !templateData.removedSpan) {
            return;
          }
          templateData.addedSpan.textContent = `+${diffMeta.added}`;
          templateData.removedSpan.textContent = `-${diffMeta.removed}`;
          templateData.fileDiffsContainer.setAttribute("aria-label", localize(12045, null, diffMeta.added, diffMeta.removed));
        }
        templateData.label.element.querySelector(".monaco-icon-name-container")?.classList.add("modified");
      }
      if (templateData.toolbar) {
        templateData.toolbar.context = arg;
      }
      if (templateData.contextKeyService) {
        if (data.state !== void 0) {
          chatEditingWidgetFileStateContextKey.bindTo(templateData.contextKeyService).set(data.state);
        }
      }
    }
  }
  disposeTemplate(templateData) {
    templateData.templateDisposables.dispose();
  }
};

CollapsibleListRenderer = __decorateClass([
  __decorateParam(2, IThemeService),
  __decorateParam(3, IProductService),
  __decorateParam(4, IInstantiationService),
  __decorateParam(5, IContextKeyService)
], CollapsibleListRenderer);

function getResourceLabelForGithubUri(uri4) {
  const repoPath = uri4.path.split("/").slice(1, 3).join("/");
  const filePath = uri4.path.split("/").slice(5);
  const fileName = filePath.at(-1);
  const range2 = getLineRangeFromGithubUri(uri4);
  return {
    resource: uri4,
    name: fileName ?? filePath.join("/"),
    description: [repoPath, ...filePath.slice(0, -1)].join("/"),
    range: range2
  };
}

function getLineRangeFromGithubUri(uri4) {
  if (!uri4.fragment) {
    return void 0;
  }
  const match2 = uri4.fragment.match(/\bL(\d+)(?:-L(\d+))?/);
  if (!match2) {
    return void 0;
  }
  const startLine = parseInt(match2[1]);
  if (isNaN(startLine)) {
    return void 0;
  }
  const endLine = match2[2] ? parseInt(match2[2]) : startLine;
  if (isNaN(endLine)) {
    return void 0;
  }
  return {
    startLineNumber: startLine,
    startColumn: 1,
    endLineNumber: endLine,
    endColumn: 1
  };
}

function getResourceForElement(element) {
  if (element.kind === "warning") {
    return null;
  }
  const { reference } = element;
  if (typeof reference === "string" || "variableName" in reference) {
    return null;
  } else if (URI.isUri(reference)) {
    return reference;
  } else {
    return reference.uri;
  }
}

registerAction2(class AddToChatAction extends Action2 {
  static {
    this.id = "workbench.action.chat.addToChatAction";
  }
  constructor() {
    super({
      id: AddToChatAction.id,
      title: {
        ...localize2(12043, "Add File to Chat")
      },
      f1: false,
      menu: [{
        id: MenuId.ChatAttachmentsContext,
        group: "chat",
        order: 1,
        when: ContextKeyExpr.and(ResourceContextKey.IsFileSystemResource, ExplorerFolderContext.negate())
      }]
    });
  }
  async run(accessor, resource) {
    const chatWidgetService = accessor.get(IChatWidgetService);
    if (!resource) {
      return;
    }
    const widget = chatWidgetService.lastFocusedWidget;
    if (widget) {
      widget.attachmentModel.addFile(resource);
    }
  }
});

registerAction2(class OpenChatReferenceLinkAction extends Action2 {
  static {
    this.id = "workbench.action.chat.copyLink";
  }
  constructor() {
    super({
      id: OpenChatReferenceLinkAction.id,
      title: {
        ...localize2(12046, "Copy Link")
      },
      f1: false,
      menu: [{
        id: MenuId.ChatAttachmentsContext,
        group: "chat",
        order: 0,
        when: ContextKeyExpr.or(ResourceContextKey.Scheme.isEqualTo(Schemas.http), ResourceContextKey.Scheme.isEqualTo(Schemas.https))
      }]
    });
  }
  async run(accessor, resource) {
    await accessor.get(IClipboardService).writeResources([resource]);
  }
});
export { getResourceLabelForGithubUri, getLineRangeFromGithubUri, getResourceForElement, $36, ChatCollapsibleListContentPart, ChatUsedReferencesListContentPart, CollapsibleListPool, CollapsibleListDelegate, CollapsibleListRenderer };
