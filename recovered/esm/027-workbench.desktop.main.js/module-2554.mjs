// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/actions/chatContextActions.ts
import { DisposableStore, toDisposable } from "./module-0012.mjs";
import { Action2, MenuId, registerAction2 } from "./module-0092.mjs";
import { registerCreatePluginAction } from "./module-2553.mjs";
import { registerPromptActions } from "./module-2552.mjs";
import { IChatWidgetService, IQuickChatService, isOpenCodeChatWidget } from "./module-0981.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IEditorService } from "./module-0934.mjs";
import { EditorResourceAccessor, isEditorCommandsContext, isEditorInput } from "./module-0925.mjs";
import { URI } from "./module-0032.mjs";
import { isSearchTreeFileMatch, isSearchTreeMatch } from "./module-2545.mjs";
import { Schemas } from "./module-0033.mjs";
import { resolveCommandsContext } from "./module-1537.mjs";
import { IEditorGroupsService } from "./module-0933.mjs";
import { IListService } from "./module-0636.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { CHAT_CATEGORY } from "./module-1476.mjs";
import { Codicon } from "./module-0085.mjs";
import { ChatContextKeys } from "./module-0965.mjs";
import { ContextKeyExpr, IContextKeyService } from "./module-0089.mjs";
import { SearchContext } from "./module-1262.mjs";
import { ExplorerFolderContext } from "./module-1542.mjs";
import { ResourceContextKey } from "./module-0949.mjs";
import { EditorContextKeys } from "./module-0154.mjs";
import { Range2 } from "./module-0106.mjs";
import { ILogService } from "./module-0095.mjs";
import { isObject } from "./module-0010.mjs";
import { BrowserEditorInput } from "./module-1490.mjs";
import { CTX_INLINE_CHAT_V2_ENABLED } from "./module-2001.mjs";
import { IKeybindingService } from "./module-0352.mjs";
import { CHAT_CONTEXT_FILES_AND_FOLDERS_ID, CHAT_CONTEXT_TERMINAL_ID, IChatContextPickService, isChatContextPickerPickItem } from "./module-1453.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { IQuickInputService } from "./module-0536.mjs";
import { ICommandService } from "./module-0087.mjs";
import { isSupportedChatFileScheme } from "./module-0964.mjs";
import { isQuickChat } from "./module-2394.mjs";
import { AnythingQuickAccessProvider } from "./module-2544.mjs";
import { SymbolsQuickAccessProvider } from "./module-2541.mjs";
import { AbstractGotoSymbolQuickAccessProvider } from "./module-2539.mjs";
import { IFileService } from "./module-0269.mjs";
import { ITextModelService } from "./module-0081.mjs";
import { IChatAttachmentResolveService } from "./module-2092.mjs";
import { resizeImage } from "./module-0944.mjs";
import { CancellationTokenSource } from "./module-0025.mjs";
import { DeferredPromise, isThenable } from "./module-0036.mjs";
import { observableValue } from "./module-0048.mjs";
import { autorun } from "./module-0052.mjs";
import { asArray } from "./module-0007.mjs";


// src/vs/workbench/contrib/chat/browser/actions/chatContextActions.ts
function registerChatContextActions() {
  const store = new DisposableStore();
  store.add(registerAction2(AttachContextAction));
  store.add(registerAction2(AttachFileToChatAction));
  store.add(registerAction2(AttachFolderToChatAction));
  store.add(registerAction2(AttachSelectionToChatAction));
  store.add(registerAction2(AttachSearchResultAction));
  store.add(registerAction2(AttachPinnedEditorsToChatAction));
  store.add(registerCreatePluginAction());
  registerPromptActions();
  return store;
}

async function withChatView(accessor) {
  const chatWidgetService = accessor.get(IChatWidgetService);
  const lastFocusedWidget2 = chatWidgetService.lastFocusedWidget;
  if (!lastFocusedWidget2 || lastFocusedWidget2.location === "panel" /* Chat */) {
    return chatWidgetService.revealWidget();
  }
  return lastFocusedWidget2;
}

var AttachResourceAction = class extends Action2 {
  async run(accessor, ...args2) {
    const instaService = accessor.get(IInstantiationService);
    const widget = await instaService.invokeFunction(withChatView);
    if (!widget) {
      return;
    }
    return instaService.invokeFunction(this.runWithWidget.bind(this), widget, ...args2);
  }
  _getResources(accessor, ...args2) {
    const editorService = accessor.get(IEditorService);
    const contexts = isEditorCommandsContext(args2[1]) ? this._getEditorResources(accessor, ...args2) : Array.isArray(args2[1]) ? args2[1] : [args2[0]];
    const files = [];
    for (const context2 of contexts) {
      let uri5;
      if (URI.isUri(context2)) {
        uri5 = context2;
      } else if (isSearchTreeFileMatch(context2)) {
        uri5 = context2.resource;
      } else if (isSearchTreeMatch(context2)) {
        uri5 = context2.parent().resource;
      } else if (!context2 && editorService.activeTextEditorControl) {
        uri5 = EditorResourceAccessor.getCanonicalUri(editorService.activeEditor, { supportSideBySide: 1 /* PRIMARY */ });
      }
      if (uri5 && [Schemas.file, Schemas.vscodeRemote, Schemas.untitled].includes(uri5.scheme)) {
        files.push(uri5);
      }
    }
    return files;
  }
  _getEditorResources(accessor, ...args2) {
    const resolvedContext = resolveCommandsContext(args2, accessor.get(IEditorService), accessor.get(IEditorGroupsService), accessor.get(IListService));
    return resolvedContext.groupedEditors.flatMap((groupedEditor) => groupedEditor.editors).map((editor) => EditorResourceAccessor.getCanonicalUri(editor, { supportSideBySide: 1 /* PRIMARY */ })).filter((uri5) => uri5 !== void 0);
  }
};

var AttachFileToChatAction = class _AttachFileToChatAction extends AttachResourceAction {
  static {
    this.ID = "workbench.action.chat.attachFile";
  }
  constructor() {
    super({
      id: _AttachFileToChatAction.ID,
      title: localize2(8611, "Add File to Chat"),
      category: CHAT_CATEGORY,
      icon: Codicon.attach,
      precondition: ChatContextKeys.enabled,
      f1: true,
      menu: [{
        id: MenuId.SearchContext,
        group: "z_chat",
        order: 1,
        when: ContextKeyExpr.and(ChatContextKeys.enabled, SearchContext.FileMatchOrMatchFocusKey, SearchContext.SearchResultHeaderFocused.negate())
      }, {
        id: MenuId.ExplorerContext,
        group: "5_chat",
        order: 1,
        when: ContextKeyExpr.and(
          ChatContextKeys.enabled,
          ExplorerFolderContext.negate(),
          ContextKeyExpr.or(
            ResourceContextKey.Scheme.isEqualTo(Schemas.file),
            ResourceContextKey.Scheme.isEqualTo(Schemas.vscodeRemote)
          )
        )
      }, {
        id: MenuId.EditorTitleContext,
        group: "2_chat",
        order: 1,
        when: ContextKeyExpr.and(
          ChatContextKeys.enabled,
          ContextKeyExpr.or(
            ResourceContextKey.Scheme.isEqualTo(Schemas.file),
            ResourceContextKey.Scheme.isEqualTo(Schemas.vscodeRemote)
          )
        )
      }, {
        id: MenuId.EditorContext,
        group: "1_chat",
        order: 2,
        when: ContextKeyExpr.and(
          ChatContextKeys.enabled,
          EditorContextKeys.hasNonEmptySelection.negate(),
          ContextKeyExpr.or(
            ResourceContextKey.Scheme.isEqualTo(Schemas.file),
            ResourceContextKey.Scheme.isEqualTo(Schemas.vscodeRemote),
            ResourceContextKey.Scheme.isEqualTo(Schemas.untitled),
            ResourceContextKey.Scheme.isEqualTo(Schemas.vscodeUserData)
          )
        )
      }, {
        id: MenuId.InlineChatEditorAffordance,
        group: "0_chat",
        order: 3,
        when: ContextKeyExpr.and(ChatContextKeys.enabled, EditorContextKeys.hasNonEmptySelection.negate())
      }, {
        id: MenuId.ChatEditorInlineMenu,
        group: "0_chat",
        order: 3,
        when: ContextKeyExpr.and(ChatContextKeys.enabled, EditorContextKeys.hasNonEmptySelection.negate())
      }]
    });
  }
  async runWithWidget(accessor, widget, ...args2) {
    const files = this._getResources(accessor, ...args2);
    if (!files.length) {
      return;
    }
    if (widget) {
      widget.focusInput();
      for (const file of files) {
        widget.attachmentModel.addFile(file);
      }
    }
  }
};

var AttachFolderToChatAction = class _AttachFolderToChatAction extends AttachResourceAction {
  static {
    this.ID = "workbench.action.chat.attachFolder";
  }
  constructor() {
    super({
      id: _AttachFolderToChatAction.ID,
      title: localize2(8612, "Add Folder to Chat"),
      category: CHAT_CATEGORY,
      f1: false,
      menu: {
        id: MenuId.ExplorerContext,
        group: "5_chat",
        order: 1,
        when: ContextKeyExpr.and(
          ChatContextKeys.enabled,
          ExplorerFolderContext,
          ContextKeyExpr.or(
            ResourceContextKey.Scheme.isEqualTo(Schemas.file),
            ResourceContextKey.Scheme.isEqualTo(Schemas.vscodeRemote)
          )
        )
      }
    });
  }
  async runWithWidget(accessor, widget, ...args2) {
    const folders = this._getResources(accessor, ...args2);
    if (!folders.length) {
      return;
    }
    if (widget) {
      widget.focusInput();
      for (const folder of folders) {
        widget.attachmentModel.addFolder(folder);
      }
    }
  }
};

var AttachPinnedEditorsToChatAction = class _AttachPinnedEditorsToChatAction extends Action2 {
  static {
    this.ID = "workbench.action.chat.attachPinnedEditors";
  }
  constructor() {
    super({
      id: _AttachPinnedEditorsToChatAction.ID,
      title: localize2(8613, "Add Pinned Editors to Chat"),
      category: CHAT_CATEGORY,
      precondition: ChatContextKeys.enabled,
      f1: true
    });
  }
  async run(accessor) {
    const editorGroupsService = accessor.get(IEditorGroupsService);
    const instaService = accessor.get(IInstantiationService);
    const widget = await instaService.invokeFunction(withChatView);
    if (!widget) {
      return;
    }
    const files = [];
    for (const group2 of editorGroupsService.groups) {
      for (const editor of group2.editors) {
        if (group2.isPinned(editor)) {
          const uri5 = EditorResourceAccessor.getCanonicalUri(editor, { supportSideBySide: 1 /* PRIMARY */ });
          if (uri5 && [Schemas.file, Schemas.vscodeRemote, Schemas.untitled].includes(uri5.scheme)) {
            files.push(uri5);
          }
        }
      }
    }
    if (!files.length) {
      return;
    }
    widget.focusInput();
    for (const file of files) {
      widget.attachmentModel.addFile(file);
    }
  }
};

var AttachSelectionToChatAction = class _AttachSelectionToChatAction extends Action2 {
  static {
    this.ID = "workbench.action.chat.attachSelection";
  }
  constructor() {
    super({
      id: _AttachSelectionToChatAction.ID,
      title: localize2(8614, "Add Selection to Chat"),
      category: CHAT_CATEGORY,
      icon: Codicon.attach,
      f1: true,
      precondition: ChatContextKeys.enabled,
      menu: [{
        id: MenuId.EditorContext,
        group: "1_chat",
        order: 1,
        when: ContextKeyExpr.and(
          ChatContextKeys.enabled,
          EditorContextKeys.hasNonEmptySelection,
          ContextKeyExpr.or(
            ResourceContextKey.Scheme.isEqualTo(Schemas.file),
            ResourceContextKey.Scheme.isEqualTo(Schemas.vscodeRemote),
            ResourceContextKey.Scheme.isEqualTo(Schemas.untitled),
            ResourceContextKey.Scheme.isEqualTo(Schemas.vscodeUserData)
          )
        )
      }, {
        id: MenuId.InlineChatEditorAffordance,
        group: "0_chat",
        order: 2,
        when: ContextKeyExpr.and(ChatContextKeys.enabled, EditorContextKeys.hasNonEmptySelection)
      }, {
        id: MenuId.ChatEditorInlineMenu,
        group: "0_chat",
        order: 2,
        when: ContextKeyExpr.and(ChatContextKeys.enabled, EditorContextKeys.hasNonEmptySelection)
      }]
    });
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async run(accessor, ...args2) {
    const editorService = accessor.get(IEditorService);
    const widget = await accessor.get(IInstantiationService).invokeFunction(withChatView);
    if (!widget) {
      return;
    }
    const [_, matches2] = args2;
    if (matches2 && matches2.length > 0) {
      const uris = /* @__PURE__ */ new Map();
      for (const match2 of matches2) {
        if (isSearchTreeFileMatch(match2)) {
          uris.set(match2.resource, void 0);
        } else {
          const context2 = { uri: match2._parent.resource, range: match2._range };
          const range2 = uris.get(context2.uri);
          if (!range2 || range2.startLineNumber !== context2.range.startLineNumber && range2.endLineNumber !== context2.range.endLineNumber) {
            uris.set(context2.uri, context2.range);
            widget.attachmentModel.addFile(context2.uri, context2.range);
          }
        }
      }
      for (const uri5 of uris) {
        const [resource, range2] = uri5;
        if (!range2) {
          widget.attachmentModel.addFile(resource);
        }
      }
    } else {
      const activeEditor = editorService.activeTextEditorControl;
      const activeUri = EditorResourceAccessor.getCanonicalUri(editorService.activeEditor, { supportSideBySide: 1 /* PRIMARY */ });
      if (activeEditor && activeUri && [Schemas.file, Schemas.vscodeRemote, Schemas.untitled].includes(activeUri.scheme)) {
        const selection = activeEditor.getSelection();
        if (selection) {
          widget.focusInput();
          const range2 = selection.isEmpty() ? new Range2(selection.startLineNumber, 1, selection.startLineNumber + 1, 1) : selection;
          widget.attachmentModel.addFile(activeUri, range2);
        }
      }
    }
  }
};

var AttachSearchResultAction = class _AttachSearchResultAction extends Action2 {
  static {
    this.Name = "searchResults";
  }
  constructor() {
    super({
      id: "workbench.action.chat.insertSearchResults",
      title: localize2(8606, "Add Search Results to Chat"),
      category: CHAT_CATEGORY,
      f1: false,
      menu: [{
        id: MenuId.SearchContext,
        group: "z_chat",
        order: 3,
        when: ContextKeyExpr.and(
          ChatContextKeys.enabled,
          SearchContext.SearchResultHeaderFocused
        )
      }]
    });
  }
  async run(accessor) {
    const logService = accessor.get(ILogService);
    const widget = await accessor.get(IInstantiationService).invokeFunction(withChatView);
    if (!widget) {
      logService.trace("InsertSearchResultAction: no chat view available");
      return;
    }
    const editor = widget.inputEditor;
    const originalRange = editor.getSelection() ?? editor.getModel()?.getFullModelRange().collapseToEnd();
    if (!originalRange) {
      logService.trace("InsertSearchResultAction: no selection");
      return;
    }
    let insertText = `#${_AttachSearchResultAction.Name}`;
    const varRange = new Range2(originalRange.startLineNumber, originalRange.startColumn, originalRange.endLineNumber, originalRange.startLineNumber + insertText.length);
    const model = editor.getModel();
    if (model && model.getValueInRange(new Range2(originalRange.startLineNumber, originalRange.startColumn - 1, originalRange.startLineNumber, originalRange.startColumn)) !== " ") {
      insertText = " " + insertText;
    }
    const success = editor.executeEdits("chatInsertSearch", [{ range: varRange, text: insertText + " " }]);
    if (!success) {
      logService.trace(`InsertSearchResultAction: failed to insert "${insertText}"`);
      return;
    }
  }
};

function isIContextPickItemItem(obj) {
  return isObject(obj) && typeof obj.kind === "string" && obj.kind === "contextPick";
}

function isIGotoSymbolQuickPickItem(obj) {
  return isObject(obj) && typeof obj.symbolName === "string" && !!obj.uri && !!obj.range;
}

function isIQuickPickItemWithResource(obj) {
  return isObject(obj) && URI.isUri(obj.resource);
}

function isAnythingQuickPickItemWithBrowserEditor(obj) {
  const editor = obj?.editor;
  return editor instanceof BrowserEditorInput || !!editor && !isEditorInput(editor) && editor.options?.override === BrowserEditorInput.EDITOR_ID;
}

var AttachContextAction = class extends Action2 {
  constructor() {
    super({
      id: "workbench.action.chat.attachContext",
      title: localize2(8610, "Add Context..."),
      icon: Codicon.addCompact,
      category: CHAT_CATEGORY,
      keybinding: {
        when: ContextKeyExpr.and(ChatContextKeys.inChatInput, ChatContextKeys.location.isEqualTo("panel" /* Chat */)),
        primary: 2048 /* CtrlCmd */ | 90 /* Slash */,
        weight: 100 /* EditorContrib */
      },
      menu: [{
        when: ContextKeyExpr.and(
          // OpenCode: 隐藏聊天输入栏的 "+" (Add Context...) 按钮，仅从菜单渲染中移除，
          // 保留命令本身（⌘/ 快捷键仍可用）。恢复时删除下面这一行即可。
          ContextKeyExpr.false(),
          ChatContextKeys.inQuickChat.negate(),
          ChatContextKeys.location.isEqualTo("panel" /* Chat */),
          ContextKeyExpr.or(
            ChatContextKeys.lockedToCodingAgent.negate(),
            ChatContextKeys.agentSupportsAttachments
          )
        ),
        id: MenuId.ChatInput,
        group: "navigation",
        order: -1
      }, {
        when: ContextKeyExpr.and(
          ChatContextKeys.inQuickChat.negate(),
          ChatContextKeys.location.isEqualTo("editor" /* EditorInline */),
          CTX_INLINE_CHAT_V2_ENABLED,
          ContextKeyExpr.or(
            ChatContextKeys.lockedToCodingAgent.negate(),
            ChatContextKeys.agentSupportsAttachments
          )
        ),
        id: MenuId.ChatInput,
        group: "navigation",
        order: 2
      }, {
        when: ContextKeyExpr.and(
          ChatContextKeys.inQuickChat,
          ContextKeyExpr.or(
            ChatContextKeys.lockedToCodingAgent.negate(),
            ChatContextKeys.agentSupportsAttachments
          )
        ),
        id: MenuId.ChatExecute,
        group: "navigation",
        order: -1
      }]
    });
  }
  async run(accessor, ...args2) {
    const instantiationService = accessor.get(IInstantiationService);
    const widgetService = accessor.get(IChatWidgetService);
    const contextKeyService = accessor.get(IContextKeyService);
    const keybindingService = accessor.get(IKeybindingService);
    const contextPickService = accessor.get(IChatContextPickService);
    const context2 = args2[0];
    const widget = context2?.widget ?? widgetService.lastFocusedWidget;
    if (!widget) {
      return;
    }
    const openCodeContextOnly = isOpenCodeChatWidget(widget);
    const quickPickItems = [];
    for (const item of contextPickService.items) {
      if (openCodeContextOnly && item.id !== CHAT_CONTEXT_FILES_AND_FOLDERS_ID && item.id !== CHAT_CONTEXT_TERMINAL_ID) {
        continue;
      }
      if (item.isEnabled && !await item.isEnabled(widget)) {
        continue;
      }
      quickPickItems.push({
        kind: "contextPick",
        item,
        label: item.label,
        iconClass: ThemeIcon.asClassName(item.icon),
        keybinding: item.commandId ? keybindingService.lookupKeybinding(item.commandId, contextKeyService) : void 0
      });
    }
    instantiationService.invokeFunction(this._show.bind(this), widget, quickPickItems, context2?.placeholder, void 0, openCodeContextOnly);
  }
  _show(accessor, widget, additionPicks, placeholder, quickInputServiceOverride, openCodeContextOnly = false) {
    const quickInputService = quickInputServiceOverride ?? accessor.get(IQuickInputService);
    const quickChatService = accessor.get(IQuickChatService);
    const instantiationService = accessor.get(IInstantiationService);
    const commandService = accessor.get(ICommandService);
    const providerOptions = {
      filter: (pick) => {
        if (openCodeContextOnly) {
          return false;
        }
        if (isIQuickPickItemWithResource(pick) && pick.resource) {
          return instantiationService.invokeFunction((accessor2) => isSupportedChatFileScheme(accessor2, pick.resource.scheme));
        }
        return true;
      },
      additionPicks,
      handleAccept: async (item, isBackgroundAccept) => {
        if (isIContextPickItemItem(item)) {
          let isDone = true;
          if (item.item.type === "valuePick") {
            this._handleContextPick(item.item, widget);
          } else if (item.item.type === "pickerPick") {
            isDone = await this._handleContextPickerItem(quickInputService, commandService, item.item, widget);
          }
          if (!isDone) {
            instantiationService.invokeFunction(this._show.bind(this), widget, additionPicks, placeholder, quickInputServiceOverride, openCodeContextOnly);
            return;
          }
        } else {
          instantiationService.invokeFunction(this._handleQPPick.bind(this), widget, isBackgroundAccept, item);
        }
        if (isQuickChat(widget)) {
          quickChatService.open();
        }
      }
    };
    quickInputService.quickAccess.show("", {
      enabledProviderPrefixes: openCodeContextOnly ? [AnythingQuickAccessProvider.PREFIX] : [
        AnythingQuickAccessProvider.PREFIX,
        SymbolsQuickAccessProvider.PREFIX,
        AbstractGotoSymbolQuickAccessProvider.PREFIX
      ],
      placeholder: placeholder ?? (openCodeContextOnly ? localize(8608, null) : localize(8607, null)),
      providerOptions
    });
  }
  async _handleQPPick(accessor, widget, isInBackground, pick) {
    const fileService = accessor.get(IFileService);
    const textModelService = accessor.get(ITextModelService);
    const chatAttachmentResolveService = accessor.get(IChatAttachmentResolveService);
    const toAttach = [];
    if (isAnythingQuickPickItemWithBrowserEditor(pick)) {
      const entry = await chatAttachmentResolveService.resolveEditorAttachContext(pick.editor);
      if (entry) {
        toAttach.push(entry);
      }
    } else if (isIQuickPickItemWithResource(pick) && pick.resource) {
      if (!isOpenCodeChatWidget(widget) && /\.(png|jpg|jpeg|bmp|gif|tiff)$/i.test(pick.resource.path)) {
        if (URI.isUri(pick.resource)) {
          const readFile = await fileService.readFile(pick.resource);
          const resizedImage = await resizeImage(readFile.value.buffer);
          toAttach.push({
            id: pick.resource.toString(),
            name: pick.label,
            fullName: pick.label,
            value: resizedImage,
            kind: "image",
            references: [{ reference: pick.resource, kind: "reference" }]
          });
        }
      } else if (pick.resource.scheme === Schemas.vscodeBrowser) {
        const entry = await chatAttachmentResolveService.resolveEditorAttachContext({ resource: pick.resource });
        if (entry) {
          toAttach.push(entry);
        }
      } else {
        let omittedState = 0 /* NotOmitted */;
        try {
          const createdModel = await textModelService.createModelReference(pick.resource);
          createdModel.dispose();
        } catch {
          omittedState = 2 /* Full */;
        }
        toAttach.push({
          kind: "file",
          id: pick.resource.toString(),
          value: pick.resource,
          name: pick.label,
          omittedState
        });
      }
    } else if (isIGotoSymbolQuickPickItem(pick) && pick.uri && pick.range) {
      toAttach.push({
        kind: "generic",
        id: JSON.stringify({ uri: pick.uri, range: pick.range.decoration }),
        value: { uri: pick.uri, range: pick.range.decoration },
        fullName: pick.label,
        name: pick.symbolName
      });
    }
    widget.attachmentModel.addContext(...toAttach);
    if (!isInBackground) {
      widget.focusInput();
    }
  }
  async _handleContextPick(item, widget) {
    const value2 = await item.asAttachment(widget);
    if (Array.isArray(value2)) {
      widget.attachmentModel.addContext(...value2);
    } else if (value2) {
      widget.attachmentModel.addContext(value2);
    }
  }
  async _handleContextPickerItem(quickInputService, commandService, item, widget) {
    const pickerConfig = item.asPicker(widget);
    const store = new DisposableStore();
    const goBackItem = {
      label: localize(8609, null),
      alwaysShow: true
    };
    const configureItem = pickerConfig.configure ? {
      label: pickerConfig.configure.label,
      commandId: pickerConfig.configure.commandId,
      alwaysShow: true
    } : void 0;
    const extraPicks = [{ type: "separator" }];
    if (configureItem) {
      extraPicks.push(configureItem);
    }
    extraPicks.push(goBackItem);
    const qp = store.add(quickInputService.createQuickPick({ useSeparators: true }));
    const cts = new CancellationTokenSource();
    store.add(qp.onDidHide(() => cts.cancel()));
    store.add(toDisposable(() => cts.dispose(true)));
    qp.placeholder = pickerConfig.placeholder;
    qp.matchOnDescription = true;
    qp.matchOnDetail = true;
    qp.canAcceptInBackground = true;
    qp.busy = true;
    qp.show();
    if (isThenable(pickerConfig.picks)) {
      const items = await pickerConfig.picks.then((value2) => {
        return [].concat(value2, extraPicks);
      });
      qp.items = items;
      qp.busy = false;
    } else {
      const query = observableValue("attachContext.query", qp.value);
      store.add(qp.onDidChangeValue(() => query.set(qp.value, void 0)));
      const picksObservable = pickerConfig.picks(query, cts.token);
      store.add(autorun((reader) => {
        const { busy, picks } = picksObservable.read(reader);
        qp.items = [].concat(picks, extraPicks);
        qp.busy = busy;
      }));
    }
    if (cts.token.isCancellationRequested) {
      pickerConfig.dispose?.();
      return true;
    }
    const defer = new DeferredPromise();
    const addPromises = [];
    store.add(qp.onDidAccept(async (e) => {
      const noop = "noop";
      const [selected] = qp.selectedItems;
      if (isChatContextPickerPickItem(selected)) {
        const attachment = selected.asAttachment();
        if (!attachment || attachment === noop) {
          return;
        }
        if (isThenable(attachment)) {
          addPromises.push(attachment.then((v2) => {
            if (v2 !== noop) {
              widget.attachmentModel.addContext(...asArray(v2));
            }
          }));
        } else {
          widget.attachmentModel.addContext(...asArray(attachment));
        }
      }
      if (selected === goBackItem) {
        if (pickerConfig.goBack?.()) {
          return;
        }
        defer.complete(false);
      }
      if (selected === configureItem) {
        defer.complete(true);
        commandService.executeCommand(configureItem.commandId);
      }
      if (!e.inBackground) {
        defer.complete(true);
      }
    }));
    store.add(qp.onDidHide(() => {
      defer.complete(true);
      pickerConfig.dispose?.();
    }));
    try {
      const result = await defer.p;
      qp.busy = true;
      await Promise.all(addPromises);
      return result;
    } finally {
      store.dispose();
    }
  }
};
export { registerChatContextActions, withChatView, isIContextPickItemItem, isIGotoSymbolQuickPickItem, isIQuickPickItemWithResource, isAnythingQuickPickItemWithBrowserEditor, AttachResourceAction, AttachFileToChatAction, AttachFolderToChatAction, AttachPinnedEditorsToChatAction, AttachSelectionToChatAction, AttachSearchResultAction, AttachContextAction };
