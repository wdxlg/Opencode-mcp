// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/widget/chatContentParts/chatInlineAnchorWidget.ts
import { URI } from "./module-0032.mjs";
import { Disposable } from "./module-0012.mjs";
import { getIconClasses } from "./module-0755.mjs";
import { SymbolKinds } from "./module-0164.mjs";
import { chatAttachmentResourceContextKey, hookUpSymbolAttachmentDragAndContextMenu } from "./module-2027.mjs";
import { Action2, IMenuService, MenuId, registerAction2 } from "./module-0092.mjs";
import { $, EventHelper, EventType, addDisposableListener, getWindow } from "./module-0075.mjs";
import { Schemas } from "./module-0033.mjs";
import { Codicon } from "./module-0085.mjs";
import { BrowserEditorInput } from "./module-1489.mjs";
import { FolderThemeIcon, IThemeService } from "./module-0287.mjs";
import { ExplorerFolderContext } from "./module-1534.mjs";
import { StandardMouseEvent } from "./module-0024.mjs";
import { StaticResourceContextKey } from "./module-0950.mjs";
import { getFlatContextMenuActions } from "./module-0516.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { getDefaultHoverDelegate } from "./module-0448.mjs";
import { fillEditorsDragData } from "./module-1380.mjs";
import { getEditorOverrideForChatResource } from "./module-2114.mjs";
import { getMediaMime } from "./module-0136.mjs";
import { ChatPetAchievementIds } from "./module-2111.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IChatImageCarouselService } from "./module-2026.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { IContextMenuService } from "./module-0488.mjs";
import { IFileService } from "./module-0269.mjs";
import { IHoverService } from "./module-0520.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { ILabelService } from "./module-0641.mjs";
import { ILanguageService } from "./module-0133.mjs";
import { IModelService } from "./module-0080.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { INotebookDocumentService } from "./module-0910.mjs";
import { IOpenerService } from "./module-0272.mjs";
import { IEditorService, SIDE_GROUP } from "./module-0935.mjs";
import { IChatPetService } from "./module-2112.mjs";
import { IChatWidgetService } from "./module-0982.mjs";
import { IChatMarkdownAnchorService } from "./module-2113.mjs";
import { IClipboardService } from "./module-0487.mjs";
import { EditorContextKeys } from "./module-0154.mjs";
import { ICodeEditorService } from "./module-0078.mjs";
import { DefinitionAction } from "./module-0647.mjs";
import { ICommandService } from "./module-0087.mjs";


// src/vs/workbench/contrib/chat/browser/widget/chatContentParts/chatInlineAnchorWidget.ts
function renderFileWidgets(element, instantiationService, chatMarkdownAnchorService, disposables, options3) {
  const links = element.querySelectorAll("a");
  links.forEach((a) => {
    const linkText = a.textContent?.trim();
    let shouldRenderWidget = false;
    let metadata;
    const href = a.getAttribute("data-href");
    let uri4;
    if (href) {
      try {
        uri4 = URI.parse(href);
      } catch {
      }
    }
    if (!linkText) {
      shouldRenderWidget = true;
    } else if (uri4) {
      const searchParams = new URLSearchParams(uri4.query);
      const vscodeLinkType = searchParams.get("vscodeLinkType");
      if (vscodeLinkType) {
        metadata = {
          vscodeLinkType,
          linkText
        };
        shouldRenderWidget = true;
        searchParams.delete("vscodeLinkType");
        const remainingQuery = searchParams.toString();
        uri4 = uri4.with({ query: remainingQuery });
      }
    }
    if (shouldRenderWidget && uri4?.scheme) {
      const widget = instantiationService.createInstance(InlineAnchorWidget, a, { kind: "inlineReference", inlineReference: uri4 }, metadata, options3);
      disposables.add(chatMarkdownAnchorService.register(widget));
      disposables.add(widget);
    }
  });
}

var InlineAnchorWidget = class extends Disposable {
  constructor(element, inlineReference, metadata, options3, chatImageCarouselService, configurationService, originalContextKeyService, contextMenuService, fileService, hoverService, instantiationService, labelService, languageService, menuService, modelService, telemetryService, themeService, notebookDocumentService, openerService, editorService, chatPetService) {
    super();
    this.element = element;
    this.inlineReference = inlineReference;
    this.metadata = metadata;
    this.options = options3;
    this.chatImageCarouselService = chatImageCarouselService;
    this.configurationService = configurationService;
    this.notebookDocumentService = notebookDocumentService;
    this.openerService = openerService;
    this.editorService = editorService;
    this.chatPetService = chatPetService;
    this.data = "uri" in inlineReference.inlineReference ? inlineReference.inlineReference : "name" in inlineReference.inlineReference ? { kind: "symbol", symbol: inlineReference.inlineReference } : { uri: inlineReference.inlineReference };
    element.classList.add(InlineAnchorWidget.className, "show-file-icons");
    let iconText;
    let iconClasses;
    let location2;
    if (this.data.kind === "symbol") {
      const symbol = this.data.symbol;
      location2 = this.data.symbol.location;
      iconText = [this.data.symbol.name];
      iconClasses = ["codicon", ...getIconClasses(modelService, languageService, void 0, void 0, SymbolKinds.toIcon(symbol.kind))];
      this._store.add(instantiationService.invokeFunction((accessor) => hookUpSymbolAttachmentDragAndContextMenu(accessor, element, originalContextKeyService, { value: symbol.location, name: symbol.name, kind: symbol.kind }, MenuId.ChatInlineSymbolAnchorContext)));
    } else {
      location2 = this.data;
      const filePathLabel = this.metadata?.linkText ?? labelService.getUriBasenameLabel(location2.uri);
      let defaultIcon;
      if (location2.range && this.data.kind !== "symbol") {
        const suffix = location2.range.startLineNumber === location2.range.endLineNumber ? `:${location2.range.startLineNumber}` : `:${location2.range.startLineNumber}-${location2.range.endLineNumber}`;
        iconText = [filePathLabel, $("span.label-suffix", void 0, suffix)];
      } else if (location2.uri.scheme === "vscode-notebook-cell" && this.data.kind !== "symbol") {
        iconText = [`${filePathLabel} \u2022 cell${this.getCellIndex(location2.uri)}`];
      } else if (location2.uri.scheme === Schemas.vscodeBrowser) {
        defaultIcon = Codicon.globe;
        const editorName = this.editorService.findEditors(location2.uri)[0]?.editor?.getName() ?? BrowserEditorInput.DEFAULT_LABEL;
        iconText = [editorName];
      } else {
        iconText = [filePathLabel];
      }
      let fileKind = location2.uri.path.endsWith("/") ? 1 /* FOLDER */ : 0 /* FILE */;
      const recomputeIconClasses = () => getIconClasses(modelService, languageService, location2.uri, fileKind, fileKind === 1 /* FOLDER */ && !themeService.getFileIconTheme().hasFolderIcons ? FolderThemeIcon : defaultIcon);
      iconClasses = recomputeIconClasses();
      const refreshIconClasses = () => {
        iconEl.classList.remove(...iconClasses);
        iconClasses = recomputeIconClasses();
        iconEl.classList.add(...iconClasses);
      };
      let isDirectory = false;
      fileService.stat(location2.uri).then((stat) => {
        isDirectory = stat.isDirectory;
        if (stat.isDirectory) {
          fileKind = 1 /* FOLDER */;
          refreshIconClasses();
        }
      }).catch(() => {
      });
      let contextKeyService;
      let isFolderContext;
      let contextMenuInitialized = false;
      const ensureContextKeyService = () => {
        if (!contextKeyService) {
          contextKeyService = this._register(originalContextKeyService.createScoped(element));
          chatAttachmentResourceContextKey.bindTo(contextKeyService).set(location2.uri.toString());
          isFolderContext = ExplorerFolderContext.bindTo(contextKeyService);
        }
        return contextKeyService;
      };
      this._register(addDisposableListener(element, EventType.CONTEXT_MENU, async (domEvent) => {
        const event = new StandardMouseEvent(getWindow(domEvent), domEvent);
        EventHelper.stop(domEvent, true);
        const cks = ensureContextKeyService();
        if (!contextMenuInitialized) {
          contextMenuInitialized = true;
          const resourceContextKey = new StaticResourceContextKey(cks, fileService, languageService, modelService);
          resourceContextKey.set(location2.uri);
        }
        isFolderContext.set(isDirectory);
        if (this._store.isDisposed) {
          return;
        }
        contextMenuService.showContextMenu({
          contextKeyService: cks,
          getAnchor: () => event,
          getActions: () => {
            const menu = menuService.getMenuActions(MenuId.ChatInlineResourceAnchorContext, cks, { arg: location2.uri });
            return getFlatContextMenuActions(menu);
          }
        });
      }));
      if (location2.range) {
        if (location2.range.startLineNumber === location2.range.endLineNumber) {
          element.setAttribute("aria-label", localize(11919, null, filePathLabel, location2.range.startLineNumber));
        } else {
          element.setAttribute("aria-label", localize(11920, null, filePathLabel, location2.range.startLineNumber, location2.range.endLineNumber));
        }
      }
    }
    const iconEl = $("span.icon");
    iconEl.classList.add(...iconClasses);
    element.replaceChildren(iconEl, $("span.icon-label", {}, ...iconText));
    const fragment = location2.range ? `${location2.range.startLineNumber},${location2.range.startColumn}` : "";
    element.setAttribute("data-href", (fragment ? location2.uri.with({ fragment }) : location2.uri).toString());
    const relativeLabel = labelService.getUriLabel(location2.uri, { relative: true });
    this._register(hoverService.setupManagedHover(getDefaultHoverDelegate("element"), element, relativeLabel));
    if (this.data.kind !== "symbol") {
      element.draggable = true;
      this._register(addDisposableListener(element, "dragstart", (e4) => {
        const stat = {
          resource: location2.uri,
          selection: location2.range
        };
        instantiationService.invokeFunction((accessor) => fillEditorsDragData(accessor, [stat], e4));
        e4.dataTransfer?.setDragImage(element, 0, 0);
      }));
    }
    this._register(addDisposableListener(element, "click", async (e4) => {
      EventHelper.stop(e4, true);
      const editorOverride = getEditorOverrideForChatResource(location2.uri, this.configurationService);
      const editorOptions = {
        override: editorOverride,
        selection: location2.range
      };
      let opened = false;
      const open2 = async () => {
        if (this.options?.openResource && await this.options.openResource(location2.uri, editorOptions)) {
          opened = true;
          return;
        }
        const mimeType = getMediaMime(location2.uri.path);
        if (mimeType?.startsWith("image/") && this.configurationService.getValue("imageCarousel.chat.enabled" /* ImageCarouselEnabled */)) {
          await this.chatImageCarouselService.openCarouselAtResource(location2.uri);
          opened = true;
          return;
        }
        opened = await this.openerService.open(location2.uri, {
          fromUserGesture: true,
          editorOptions
        });
      };
      if (this.options?.trackOpen) {
        await this.options.trackOpen(open2);
      } else {
        await open2();
      }
      if (opened) {
        this.chatPetService.unlockAchievement(ChatPetAchievementIds.ChatReferenceOpened);
      }
    }));
  }
  static {
    this.className = "chat-inline-anchor-widget";
  }
  getHTMLElement() {
    return this.element;
  }
  getCellIndex(location2) {
    const notebook = this.notebookDocumentService.getNotebook(location2);
    const index2 = notebook?.getCellIndex(location2) ?? -1;
    return index2 >= 0 ? ` ${index2 + 1}` : "";
  }
};

InlineAnchorWidget = __decorateClass([
  __decorateParam(4, IChatImageCarouselService),
  __decorateParam(5, IConfigurationService),
  __decorateParam(6, IContextKeyService),
  __decorateParam(7, IContextMenuService),
  __decorateParam(8, IFileService),
  __decorateParam(9, IHoverService),
  __decorateParam(10, IInstantiationService),
  __decorateParam(11, ILabelService),
  __decorateParam(12, ILanguageService),
  __decorateParam(13, IMenuService),
  __decorateParam(14, IModelService),
  __decorateParam(15, ITelemetryService),
  __decorateParam(16, IThemeService),
  __decorateParam(17, INotebookDocumentService),
  __decorateParam(18, IOpenerService),
  __decorateParam(19, IEditorService),
  __decorateParam(20, IChatPetService)
], InlineAnchorWidget);

registerAction2(class AddFileToChatAction extends Action2 {
  static {
    this.id = "chat.inlineResourceAnchor.addFileToChat";
  }
  constructor() {
    super({
      id: AddFileToChatAction.id,
      title: localize2(11915, "Add File to Chat"),
      menu: [{
        id: MenuId.ChatInlineResourceAnchorContext,
        group: "chat",
        order: 1,
        when: ExplorerFolderContext.negate()
      }]
    });
  }
  async run(accessor, resource) {
    const chatWidgetService = accessor.get(IChatWidgetService);
    const widget = chatWidgetService.lastFocusedWidget;
    if (widget) {
      widget.attachmentModel.addFile(resource);
    }
  }
});

registerAction2(class CopyResourceAction extends Action2 {
  static {
    this.id = "chat.inlineResourceAnchor.copyResource";
  }
  constructor() {
    super({
      id: CopyResourceAction.id,
      title: localize2(11916, "Copy"),
      f1: false,
      precondition: chatAttachmentResourceContextKey,
      keybinding: {
        weight: 200 /* WorkbenchContrib */,
        primary: 2048 /* CtrlCmd */ | 33 /* KeyC */
      }
    });
  }
  async run(accessor) {
    const chatWidgetService = accessor.get(IChatMarkdownAnchorService);
    const clipboardService = accessor.get(IClipboardService);
    const anchor = chatWidgetService.lastFocusedAnchor;
    if (!anchor) {
      return;
    }
    const resource = anchor.data.kind === "symbol" ? anchor.data.symbol.location.uri : anchor.data.uri;
    clipboardService.writeResources([resource]);
  }
});

registerAction2(class OpenToSideResourceAction extends Action2 {
  static {
    this.id = "chat.inlineResourceAnchor.openToSide";
  }
  constructor() {
    super({
      id: OpenToSideResourceAction.id,
      title: localize2(11918, "Open to the Side"),
      f1: false,
      precondition: chatAttachmentResourceContextKey,
      keybinding: {
        weight: 400 /* ExternalExtension */ + 2,
        primary: 2048 /* CtrlCmd */ | 3 /* Enter */,
        mac: {
          primary: 256 /* WinCtrl */ | 3 /* Enter */
        }
      },
      menu: [MenuId.ChatInlineSymbolAnchorContext, MenuId.ChatInputSymbolAttachmentContext].map((id2) => ({
        id: id2,
        group: "navigation",
        order: 1
      }))
    });
  }
  async run(accessor, arg) {
    const editorService = accessor.get(IEditorService);
    const configurationService = accessor.get(IConfigurationService);
    const target = this.getTarget(accessor, arg);
    if (!target) {
      return;
    }
    const targetUri = URI.isUri(target) ? target : target.uri;
    const editorOverride = getEditorOverrideForChatResource(targetUri, configurationService);
    const input = URI.isUri(target) ? { resource: target, options: { override: editorOverride } } : {
      resource: target.uri,
      options: {
        override: editorOverride,
        selection: {
          startColumn: target.range.startColumn,
          startLineNumber: target.range.startLineNumber
        }
      }
    };
    await editorService.openEditors([input], SIDE_GROUP);
  }
  getTarget(accessor, arg) {
    const chatWidgetService = accessor.get(IChatMarkdownAnchorService);
    if (arg) {
      return arg;
    }
    const anchor = chatWidgetService.lastFocusedAnchor;
    if (!anchor) {
      return void 0;
    }
    return anchor.data.kind === "symbol" ? anchor.data.symbol.location : anchor.data.uri;
  }
});

registerAction2(class GoToDefinitionAction2 extends Action2 {
  static {
    this.id = "chat.inlineSymbolAnchor.goToDefinition";
  }
  constructor() {
    super({
      id: GoToDefinitionAction2.id,
      title: {
        ...localize2(11917, "Go to Definition"),
        mnemonicTitle: localize(11924, null)
      },
      menu: [MenuId.ChatInlineSymbolAnchorContext, MenuId.ChatInputSymbolAttachmentContext].map((id2) => ({
        id: id2,
        group: "4_symbol_nav",
        order: 1.1,
        when: EditorContextKeys.hasDefinitionProvider
      }))
    });
  }
  async run(accessor, location2) {
    const editorService = accessor.get(ICodeEditorService);
    const instantiationService = accessor.get(IInstantiationService);
    await openEditorWithSelection(editorService, location2);
    const action = new DefinitionAction({ openToSide: false, openInPeek: false, muteMessage: true }, { title: { value: "", original: "" }, id: "", precondition: void 0 });
    return instantiationService.invokeFunction((accessor2) => action.run(accessor2));
  }
});

async function openEditorWithSelection(editorService, location2) {
  await editorService.openCodeEditor({
    resource: location2.uri,
    options: {
      selection: {
        startColumn: location2.range.startColumn,
        startLineNumber: location2.range.startLineNumber
      }
    }
  }, null);
}

async function runGoToCommand(accessor, command4, location2) {
  const editorService = accessor.get(ICodeEditorService);
  const commandService = accessor.get(ICommandService);
  await openEditorWithSelection(editorService, location2);
  return commandService.executeCommand(command4);
}

registerAction2(class GoToTypeDefinitionsAction extends Action2 {
  static {
    this.id = "chat.inlineSymbolAnchor.goToTypeDefinitions";
  }
  constructor() {
    super({
      id: GoToTypeDefinitionsAction.id,
      title: {
        ...localize2(11923, "Go to Type Definitions"),
        mnemonicTitle: localize(11927, null)
      },
      menu: [MenuId.ChatInlineSymbolAnchorContext, MenuId.ChatInputSymbolAttachmentContext].map((id2) => ({
        id: id2,
        group: "4_symbol_nav",
        order: 1.1,
        when: EditorContextKeys.hasTypeDefinitionProvider
      }))
    });
  }
  async run(accessor, location2) {
    await runGoToCommand(accessor, "editor.action.goToTypeDefinition", location2);
  }
});

registerAction2(class GoToImplementations extends Action2 {
  static {
    this.id = "chat.inlineSymbolAnchor.goToImplementations";
  }
  constructor() {
    super({
      id: GoToImplementations.id,
      title: {
        ...localize2(11921, "Go to Implementations"),
        mnemonicTitle: localize(11925, null)
      },
      menu: [MenuId.ChatInlineSymbolAnchorContext, MenuId.ChatInputSymbolAttachmentContext].map((id2) => ({
        id: id2,
        group: "4_symbol_nav",
        order: 1.2,
        when: EditorContextKeys.hasImplementationProvider
      }))
    });
  }
  async run(accessor, location2) {
    await runGoToCommand(accessor, "editor.action.goToImplementation", location2);
  }
});

registerAction2(class GoToReferencesAction2 extends Action2 {
  static {
    this.id = "chat.inlineSymbolAnchor.goToReferences";
  }
  constructor() {
    super({
      id: GoToReferencesAction2.id,
      title: {
        ...localize2(11922, "Go to References"),
        mnemonicTitle: localize(11926, null)
      },
      menu: [MenuId.ChatInlineSymbolAnchorContext, MenuId.ChatInputSymbolAttachmentContext].map((id2) => ({
        id: id2,
        group: "4_symbol_nav",
        order: 1.3,
        when: EditorContextKeys.hasReferenceProvider
      }))
    });
  }
  async run(accessor, location2) {
    await runGoToCommand(accessor, "editor.action.goToReferences", location2);
  }
});
export { renderFileWidgets, openEditorWithSelection, runGoToCommand, InlineAnchorWidget };
