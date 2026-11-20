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
// OpenCode ctxui1808: 添加上下文窗口用的终端上下文（复用聊天自带的 TerminalContext）
import { TerminalContext } from "./module-2167.mjs";
import { ITerminalService } from "./module-1149.mjs";
// OpenCode ctxdrop1850: 「添加上下文」下拉（挂在 "+" 按钮上）用到的工作台服务
import { renderIcon } from "./module-0467.mjs";
import { addDisposableListener, getWindow } from "./module-0075.mjs";
import { IMarkerService } from "./module-0560.mjs";
import { IFileDialogService } from "./module-0267.mjs";
import { ISearchService } from "./module-0999.mjs";
import { QueryBuilder } from "./module-1312.mjs";
import { getWorkspaceSymbols } from "./module-1216.mjs";
import { SymbolKinds } from "./module-0164.mjs";
import { IWorkspaceContextService } from "./module-0509.mjs";
import { ILabelService } from "./module-0641.mjs";


// src/vs/workbench/contrib/chat/browser/actions/chatContextActions.ts
function registerChatContextActions() {
  const store = new DisposableStore();
  store.add(registerAction2(AttachContextAction));
  store.add(registerAction2(AttachFileToChatAction));
  store.add(registerAction2(AttachFolderToChatAction));
  store.add(registerAction2(AttachSelectionToChatAction));
  store.add(registerAction2(AttachSearchResultAction));
  store.add(registerAction2(AttachPinnedEditorsToChatAction));
  store.add(registerAction2(OpenCodeAttachContextItemsAction));
  store.add(registerAction2(OpenCodeListChatTerminalsAction));
  store.add(registerAction2(OpenCodeOpenAttachContextDropdownAction));
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

// OpenCode ctxui1808: 给扩展里的「添加上下文」窗口用的两个内部命令（不进命令面板）。
// opencode.chat.attachContextItems(items)：items 里每项 {type:"file",uri,range?:[起始行,起始列,结束行,结束列](1 起),name?}
//   | {type:"folder",uri} | {type:"terminal",id}；都走聊天自带的 attachmentModel / TerminalContext，返回 {added, failed}。
// opencode.chat.listChatTerminals()：列出终端 {id,title,hasSelection,lastCommand}。
var OpenCodeAttachContextItemsAction = class extends Action2 {
  constructor() {
    super({ id: "opencode.chat.attachContextItems", title: { value: "OpenCode: Attach Context Items", original: "OpenCode: Attach Context Items" }, f1: false });
  }
  async run(accessor, items) {
    const instaService = accessor.get(IInstantiationService);
    const terminalService = accessor.get(ITerminalService);
    const list = Array.isArray(items) ? items : [];
    const widget = await instaService.invokeFunction(withChatView);
    if (!widget) {
      return { added: 0, failed: list.length, reason: "no-chat-widget" };
    }
    // OpenCode ctxdrop1850: 附加逻辑移到 ocCtxAttachItems，下拉和旧窗口共用
    const res = await ocCtxAttachItems(instaService, terminalService, widget, list);
    if (res.added) {
      widget.focusInput();
    }
    return res;
  }
};

var OpenCodeListChatTerminalsAction = class extends Action2 {
  constructor() {
    super({ id: "opencode.chat.listChatTerminals", title: { value: "OpenCode: List Chat Terminals", original: "OpenCode: List Chat Terminals" }, f1: false });
  }
  run(accessor) {
    return ocCtxListTerminals(accessor.get(ITerminalService));
  }
};

// OpenCode ctxdrop1850: 「添加上下文」改为挂在聊天输入栏 "+" 按钮上的下拉框（与「配置模型」下拉同一种实现：
// 工作台容器内的 position:fixed DOM 弹层，默认在按钮上方展开，样式变量与模型下拉一致）。
// 分组：文件（当前文件 / 当前选区 / 已打开的编辑器 / 搜索结果 / 文件夹 / 选择文件… / 选择文件夹…）、
// 符号（输入 2 个字符以上）、问题（错误和警告）、终端。可多选：↑↓ 移动、空格勾选、Enter 添加、Esc 关闭。
// 附加统一走 ocCtxAttachItems（聊天自带的 attachmentModel / TerminalContext）。
// 下拉打不开时（找不到聊天输入等）返回 false，由调用方退回到扩展里的旧窗口（opencode.attachContext）。
var ocCtxDropdownHandle;
var ocCtxDropdownFailedAt = 0;
var OC_CTX_FILE_SCHEMES = /* @__PURE__ */ new Set([Schemas.file, Schemas.vscodeRemote, Schemas.untitled]);
async function ocCtxAttachItems(instaService, terminalService, widget, list) {
  let added = 0, failed = 0;
  for (const item of list) {
    try {
      if (!item || typeof item !== "object") { failed++; continue; }
      if (item.type === "file" || item.type === "folder") {
        const uri5 = typeof item.uri === "string" ? URI.parse(item.uri) : URI.revive(item.uri);
        if (!uri5) { failed++; continue; }
        if (item.type === "folder") {
          widget.attachmentModel.addFolder(uri5);
        } else if (Array.isArray(item.range) && item.range.length === 4) {
          const [sl, sc, el, ec] = item.range.map((n) => Math.max(1, Number(n) || 1));
          const entry = widget.attachmentModel.asFileVariableEntry(uri5, new Range2(sl, sc, el, ec));
          if (typeof item.name === "string" && item.name.trim()) {
            entry.name = item.name.trim().slice(0, 300);
          }
          widget.attachmentModel.addContext(entry);
        } else {
          await widget.attachmentModel.addFile(uri5);
        }
        added++;
      } else if (item.type === "terminal") {
        if (!widget.attachmentCapabilities?.supportsTerminalAttachments) { failed++; continue; }
        const instance = terminalService.instances.find((t) => t.instanceId === Number(item.id));
        if (!instance || instance.isDisposed) { failed++; continue; }
        const terminalContext = instaService.createInstance(TerminalContext, instance.resource);
        const attachment = await terminalContext.asAttachment(widget);
        if (attachment) { widget.attachmentModel.addContext(attachment); added++; } else { failed++; }
      } else {
        failed++;
      }
    } catch (err) {
      failed++;
    }
  }
  return { added, failed };
}
function ocCtxListTerminals(terminalService) {
  return terminalService.instances.filter((t) => !t.isDisposed).map((t) => {
    let lastCommand = "";
    try {
      const cmds = t.capabilities.get(2 /* CommandDetection */)?.commands ?? [];
      for (let i = cmds.length - 1; i >= 0; i--) {
        if (cmds[i].command?.trim()) { lastCommand = cmds[i].command.trim(); break; }
      }
    } catch {}
    let hasSelection = false;
    try { hasSelection = !!t.selection?.trim(); } catch {}
    return { id: t.instanceId, title: String(t.title ?? ""), hasSelection, lastCommand: lastCommand.slice(0, 200) };
  });
}
function ocCtxEnsureStyle(doc) {
  if (doc.getElementById("oc-ctx-dropdown-style-v1")) return;
  const style = doc.createElement("style");
  style.id = "oc-ctx-dropdown-style-v1";
  // 与「配置模型」下拉（.oc-mp，module-2192）同一套颜色/尺寸，只是换了类名前缀，并加上复选框、灰色路径和底栏按钮。
  style.textContent = [
    ".oc-cx{position:fixed;z-index:2600;box-sizing:border-box;display:flex;flex-direction:column;width:340px;max-width:calc(100vw - 16px);background-color:var(--vscode-menu-background,var(--vscode-quickInput-background,var(--vscode-editorWidget-background,#252526)));color:var(--vscode-menu-foreground,var(--vscode-quickInput-foreground,var(--vscode-foreground,#cccccc)));border:1px solid var(--vscode-menu-border,var(--vscode-widget-border,var(--vscode-contrastBorder,rgba(128,128,128,.35))));border-radius:8px;box-shadow:0 6px 20px var(--vscode-widget-shadow,rgba(0,0,0,.45));font-family:var(--vscode-font-family,inherit);font-size:13px;line-height:normal;overflow:hidden;outline:none;opacity:1}",
    ".oc-cx *{box-sizing:border-box}",
    ".oc-cx-search{flex:none;padding:6px 6px 4px;background-color:inherit}",
    ".oc-cx-search input{display:block;width:100%;height:24px;margin:0;padding:0 8px;border-radius:4px;border:1px solid var(--vscode-input-border,rgba(128,128,128,.35));background-color:var(--vscode-input-background,#3c3c3c);color:var(--vscode-input-foreground,#cccccc);font-family:inherit;font-size:13px;outline:none}",
    ".oc-cx-search input:focus{border-color:var(--vscode-focusBorder,#007fd4)}",
    ".oc-cx-search input::placeholder{color:var(--vscode-input-placeholderForeground,rgba(204,204,204,.5))}",
    ".oc-cx-list{position:relative;flex:1 1 auto;min-height:0;overflow-y:auto;overflow-x:hidden;padding:2px 0 4px;background-color:inherit}",
    ".oc-cx-h{display:flex;align-items:center;gap:6px;height:22px;margin-top:2px;padding:0 10px;font-size:11px;font-weight:600;letter-spacing:.02em;color:var(--vscode-descriptionForeground,#9d9d9d);white-space:nowrap;overflow:hidden}",
    ".oc-cx-h .codicon{font-size:14px}",
    ".oc-cx-h .oc-cx-count{margin-left:auto;font-weight:400;opacity:.8}",
    ".oc-cx-row{display:flex;align-items:center;gap:6px;height:22px;padding:0 10px;margin:0 4px;border-radius:4px;cursor:pointer;white-space:nowrap;color:inherit;min-width:0}",
    ".oc-cx-row>.codicon{flex:none;width:16px;font-size:14px;color:inherit}",
    ".oc-cx-row .oc-cx-name{flex:0 1 auto;overflow:hidden;text-overflow:ellipsis;min-width:0}",
    ".oc-cx-row .oc-cx-path{flex:1 1 0;overflow:hidden;text-overflow:ellipsis;min-width:0;font-size:12px;opacity:.7;color:var(--vscode-descriptionForeground,inherit)}",
    ".oc-cx-cb{flex:none;display:inline-flex;align-items:center;justify-content:center;width:16px;height:16px;border-radius:3px;border:1px solid var(--vscode-checkbox-border,rgba(128,128,128,.6));background-color:var(--vscode-checkbox-background,transparent);color:var(--vscode-checkbox-foreground,inherit)}",
    ".oc-cx-cb .codicon{font-size:12px;visibility:hidden}",
    ".oc-cx-row.checked .oc-cx-cb{background-color:var(--vscode-checkbox-selectBackground,var(--vscode-button-background,#0e639c));border-color:var(--vscode-checkbox-selectBorder,var(--vscode-button-background,#0e639c));color:var(--vscode-button-foreground,#ffffff)}",
    ".oc-cx-row.checked .oc-cx-cb .codicon{visibility:visible}",
    ".oc-cx-row.action .oc-cx-cb{visibility:hidden}",
    ".oc-cx-row:hover{background-color:var(--vscode-list-hoverBackground,rgba(128,128,128,.18));color:var(--vscode-list-hoverForeground,inherit)}",
    ".oc-cx-row.focused{background-color:var(--vscode-menu-selectionBackground,var(--vscode-list-activeSelectionBackground,#04395e));color:var(--vscode-menu-selectionForeground,var(--vscode-list-activeSelectionForeground,#ffffff))}",
    ".oc-cx-row.focused .oc-cx-path{color:inherit}",
    ".oc-cx-row .oc-cx-err{color:var(--vscode-problemsErrorIcon-foreground,#f14c4c)}",
    ".oc-cx-row .oc-cx-warn{color:var(--vscode-problemsWarningIcon-foreground,#cca700)}",
    ".oc-cx-row.focused .oc-cx-err,.oc-cx-row.focused .oc-cx-warn{color:inherit}",
    ".oc-cx-empty{padding:2px 12px 4px 32px;font-size:12px;white-space:normal;color:var(--vscode-descriptionForeground,#9d9d9d)}",
    ".oc-cx-foot{flex:none;display:flex;align-items:center;gap:8px;height:28px;padding:0 6px 0 12px;background-color:inherit;border-top:1px solid var(--vscode-menu-separatorBackground,var(--vscode-widget-border,rgba(128,128,128,.25)))}",
    ".oc-cx-foot .oc-cx-sum{flex:1 1 auto;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:12px;color:var(--vscode-descriptionForeground,#9d9d9d)}",
    ".oc-cx-foot button{flex:none;height:20px;padding:0 12px;border-radius:4px;border:1px solid var(--vscode-button-border,transparent);background-color:var(--vscode-button-background,#0e639c);color:var(--vscode-button-foreground,#ffffff);font-family:inherit;font-size:12px;cursor:pointer}",
    ".oc-cx-foot button:hover{background-color:var(--vscode-button-hoverBackground,#1177bb)}",
    ".oc-cx-foot button:disabled{opacity:.5;cursor:default}",
    ".oc-cx .oc-cx-hide{display:none!important}",
    ".oc-cx-list::-webkit-scrollbar{width:10px;height:10px}",
    ".oc-cx-list::-webkit-scrollbar-track,.oc-cx-list::-webkit-scrollbar-corner{background:transparent}",
    ".oc-cx-list::-webkit-scrollbar-button{display:none;width:0;height:0}",
    ".oc-cx-list::-webkit-scrollbar-thumb{background-color:var(--vscode-scrollbarSlider-background,rgba(121,121,121,.4));border:none;border-radius:0;min-height:20px}",
    ".oc-cx-list::-webkit-scrollbar-thumb:hover{background-color:var(--vscode-scrollbarSlider-hoverBackground,rgba(100,100,100,.7))}"
  ].join("\n");
  (doc.head || doc.documentElement).appendChild(style);
}
// 锚点：当前聊天输入栏里的 "+"（Add Context...，图标 add-compact）按钮；找不到时退回到输入框容器。
function ocCtxFindAnchor(widget) {
  const roots = [widget?.inputPart?.element, widget?.inputPart?.inputContainerElement, widget?.domNode].filter((e) => e && typeof e.querySelectorAll === "function");
  for (const root of roots) {
    for (const el of root.querySelectorAll(".codicon-add-compact")) {
      const item = el.closest(".action-item") ?? el;
      const r = item.getBoundingClientRect();
      if (r.width > 0 && r.height > 0) return { el: item, button: true };
    }
  }
  for (const root of roots) {
    const r = root.getBoundingClientRect?.();
    if (r && r.width > 0 && r.height > 0) return { el: widget?.inputPart?.inputContainerElement ?? root, button: false };
  }
  return void 0;
}
async function ocCtxOpenDropdown(accessor, widgetHint) {
  if (Date.now() - ocCtxDropdownFailedAt < 1500) return false;
  const instaService = accessor.get(IInstantiationService);
  const widgetService = accessor.get(IChatWidgetService);
  const editorService = accessor.get(IEditorService);
  const terminalService = accessor.get(ITerminalService);
  const markerService = accessor.get(IMarkerService);
  const searchService = accessor.get(ISearchService);
  const contextService = accessor.get(IWorkspaceContextService);
  const labelService = accessor.get(ILabelService);
  const fileDialogService = accessor.get(IFileDialogService);
  const logService = accessor.get(ILogService);
  try {
    let widget = widgetHint ?? widgetService.lastFocusedWidget;
    if (!widget) widget = await instaService.invokeFunction(withChatView);
    if (!widget || !widget.attachmentModel) { ocCtxDropdownFailedAt = Date.now(); return false; }
    const anchor = ocCtxFindAnchor(widget);
    if (!anchor) { ocCtxDropdownFailedAt = Date.now(); return false; }
    if (ocCtxDropdownHandle) {
      // 再按一次 "+" 收起（与模型下拉一致）
      const same = ocCtxDropdownHandle.widget === widget;
      ocCtxDropdownHandle.dispose();
      if (same) return true;
    }
    ocCtxBuildDropdown({ instaService, editorService, terminalService, markerService, searchService, contextService, labelService, fileDialogService, logService }, widget, anchor);
    return true;
  } catch (err) {
    ocCtxDropdownFailedAt = Date.now();
    try { ocCtxDropdownHandle?.dispose(); } catch {}
    logService.error("[OpenCode] attach context dropdown failed", err);
    return false;
  }
}
function ocCtxBuildDropdown(svc, widget, anchor) {
  const anchorElement = anchor.el;
  const doc = anchorElement.ownerDocument;
  const win = getWindow(anchorElement);
  const host = anchorElement.closest?.(".monaco-workbench") ?? doc.querySelector(".monaco-workbench") ?? doc.body;
  ocCtxEnsureStyle(doc);
  const icon = (name, fallback = "file") => renderIcon(Codicon[name] ?? Codicon[fallback] ?? Codicon.file);
  const rel = (uri5) => { try { return svc.labelService.getUriLabel(uri5, { relative: true }); } catch { return uri5.fsPath || uri5.toString(); } };
  const base = (uri5) => { const p = (uri5.path || "").replace(/\/+$/, ""); return p.slice(p.lastIndexOf("/") + 1) || uri5.toString(); };
  const fileLike = (uri5) => !!uri5 && OC_CTX_FILE_SCHEMES.has(uri5.scheme);
  // ---- 数据（打开时取一次；文件搜索和符号随输入异步刷新）----
  let current;
  const openEditors = [];
  {
    const seen = /* @__PURE__ */ new Set();
    let activeUri;
    try { activeUri = EditorResourceAccessor.getOriginalUri(svc.editorService.activeEditor, { supportSideBySide: 1 /* PRIMARY */ }); } catch {}
    const mru = [];
    try { for (const e of svc.editorService.getEditors(0 /* MOST_RECENTLY_USED */)) { const u = EditorResourceAccessor.getOriginalUri(e.editor, { supportSideBySide: 1 /* PRIMARY */ }); if (fileLike(u)) mru.push(u); } } catch {}
    current = fileLike(activeUri) ? activeUri : mru[0];
    if (current) seen.add(current.toString());
    for (const u of mru) { if (!seen.has(u.toString())) { seen.add(u.toString()); openEditors.push(u); } if (openEditors.length >= 30) break; }
  }
  let selection;
  {
    const asCode = (c) => { try { if (c && typeof c.getModifiedEditor === "function") c = c.getModifiedEditor(); } catch {} return c && typeof c.getSelection === "function" && typeof c.getModel === "function" ? c : void 0; };
    const controls = [svc.editorService.activeTextEditorControl, ...(svc.editorService.visibleTextEditorControls ?? [])];
    for (const c0 of controls) {
      const c = asCode(c0);
      const sel = c?.getSelection?.();
      const uri5 = c?.getModel?.()?.uri;
      if (sel && !sel.isEmpty() && fileLike(uri5)) { selection = { uri: uri5, range: [sel.startLineNumber, sel.startColumn, sel.endLineNumber, sel.endColumn] }; break; }
    }
  }
  const roots = svc.contextService.getWorkspace().folders.map((f) => ({ uri: f.uri, name: f.name }));
  const problems = [];
  try {
    const markers = svc.markerService.read({ severities: 8 /* Error */ | 4 /* Warning */ });
    for (const m of markers) {
      if (!fileLike(m.resource) || (m.severity !== 8 && m.severity !== 4)) continue;
      problems.push({ uri: m.resource, err: m.severity === 8, line: m.startLineNumber, range: [m.startLineNumber, m.startColumn, m.endLineNumber, m.endColumn], msg: String(m.message || "").split(/\r?\n/)[0].slice(0, 240), src: m.source ? String(m.source) : "" });
    }
    problems.sort((a, b) => (a.err === b.err ? 0 : a.err ? -1 : 1) || a.uri.toString().localeCompare(b.uri.toString()) || a.line - b.line);
    problems.splice(300);
  } catch {}
  let terminals = [];
  try { terminals = ocCtxListTerminals(svc.terminalService); } catch {}
  // ---- DOM ----
  const root = doc.createElement("div");
  root.className = "oc-cx";
  root.tabIndex = -1;
  root.setAttribute("role", "listbox");
  root.setAttribute("aria-multiselectable", "true");
  root.setAttribute("aria-label", "\u6DFB\u52A0\u4E0A\u4E0B\u6587");
  const searchBox = doc.createElement("div");
  searchBox.className = "oc-cx-search";
  const search = doc.createElement("input");
  search.type = "text";
  search.placeholder = "\u641C\u7D22\u6587\u4EF6\u3001\u7B26\u53F7\u3001\u95EE\u9898\u3001\u7EC8\u7AEF";
  search.spellcheck = false;
  search.setAttribute("autocomplete", "off");
  search.setAttribute("aria-label", search.placeholder);
  searchBox.appendChild(search);
  const list = doc.createElement("div");
  list.className = "oc-cx-list";
  const foot = doc.createElement("div");
  foot.className = "oc-cx-foot";
  const sum = doc.createElement("span");
  sum.className = "oc-cx-sum";
  const addBtn = doc.createElement("button");
  addBtn.type = "button";
  addBtn.textContent = "\u6DFB\u52A0";
  foot.append(sum, addBtn);
  root.append(searchBox, list, foot);
  const checked = /* @__PURE__ */ new Map();
  let rows = [];
  let focusIndex = -1;
  let navMode = false;
  const updateFoot = (msg) => {
    sum.textContent = msg ?? (checked.size ? "\u5DF2\u9009 " + checked.size + " \u9879" : "\u672A\u9009\u62E9\uFF08Enter \u6DFB\u52A0\u5F53\u524D\u884C\uFF09");
    addBtn.disabled = !checked.size && !(rows[focusIndex] && !rows[focusIndex]._oc.action);
    addBtn.textContent = checked.size ? "\u6DFB\u52A0 (" + checked.size + ")" : "\u6DFB\u52A0";
  };
  const focusRow = (index, reveal) => {
    if (!rows.length) { focusIndex = -1; updateFoot(); return; }
    focusIndex = Math.max(0, Math.min(rows.length - 1, index));
    rows.forEach((r, i) => r.classList.toggle("focused", i === focusIndex));
    if (reveal) rows[focusIndex].scrollIntoView({ block: "nearest" });
    updateFoot();
  };
  const toggle = (row) => {
    const it = row._oc;
    if (it.action) return;
    if (checked.has(it.key)) checked.delete(it.key); else checked.set(it.key, it.item);
    row.classList.toggle("checked", checked.has(it.key));
    row.setAttribute("aria-selected", String(checked.has(it.key)));
    updateFoot();
  };
  const header = (iconName, label3, count) => {
    const h = doc.createElement("div");
    h.className = "oc-cx-h";
    const t = doc.createElement("span");
    t.textContent = label3;
    const c = doc.createElement("span");
    c.className = "oc-cx-count";
    c.textContent = String(count);
    h.append(icon(iconName), t, c);
    list.appendChild(h);
  };
  // it: {key, item, iconEl, name, path, title?, action?}
  const addRow = (it) => {
    const row = doc.createElement("div");
    row.className = "oc-cx-row" + (it.action ? " action" : "") + (checked.has(it.key) ? " checked" : "");
    row.setAttribute("role", "option");
    if (!it.action) row.setAttribute("aria-selected", String(checked.has(it.key)));
    row.title = it.title ?? (it.path ? it.name + " \u2014 " + it.path : it.name);
    const cb = doc.createElement("span");
    cb.className = "oc-cx-cb";
    cb.appendChild(icon("check"));
    const name = doc.createElement("span");
    name.className = "oc-cx-name";
    name.textContent = it.name;
    const path = doc.createElement("span");
    path.className = "oc-cx-path";
    path.textContent = it.path ?? "";
    row.append(cb, it.iconEl, name, path);
    row._oc = it;
    row.addEventListener("mousedown", (e) => { e.preventDefault(); e.stopPropagation(); });
    row.addEventListener("click", () => {
      focusRow(rows.indexOf(row), false);
      if (it.action) it.action(); else toggle(row);
      search.focus();
    });
    row.addEventListener("mousemove", () => { if (rows[focusIndex] !== row) focusRow(rows.indexOf(row), false); });
    list.appendChild(row);
    rows.push(row);
  };
  const empty = (text) => { const d = doc.createElement("div"); d.className = "oc-cx-empty"; d.textContent = text; list.appendChild(d); };
  const match = (q, ...parts) => !q || parts.some((p) => p && String(p).toLowerCase().includes(q));
  let remote = { q: "", files: [], folders: [], symbols: [], pending: false };
  const fileItem = (uri5, tag) => ({ key: "file:" + uri5.toString(), item: { type: "file", uri: uri5.toString() }, iconEl: icon("file"), name: base(uri5), path: (tag ? tag + " \xB7 " : "") + rel(uri5) });
  const render = () => {
    const q = search.value.trim().toLowerCase();
    const prevKey = rows[focusIndex]?._oc.key;
    list.textContent = "";
    rows = [];
    // 文件
    const fileRows = [];
    const shown = /* @__PURE__ */ new Set();
    if (current && match(q, base(current), rel(current), "\u5F53\u524D\u6587\u4EF6")) { fileRows.push(fileItem(current, "\u5F53\u524D\u6587\u4EF6")); shown.add(current.toString()); }
    if (selection) {
      const [sl, , el] = selection.range;
      const nm = base(selection.uri) + ":" + sl + (el !== sl ? "-" + el : "");
      if (match(q, nm, rel(selection.uri), "\u9009\u533A")) fileRows.push({ key: "sel:" + selection.uri.toString() + ":" + selection.range.join(","), item: { type: "file", uri: selection.uri.toString(), range: selection.range, name: nm }, iconEl: icon("listSelection", "selection"), name: nm, path: "\u5F53\u524D\u9009\u533A \xB7 " + rel(selection.uri) });
    }
    for (const u of openEditors) if (match(q, base(u), rel(u))) { fileRows.push(fileItem(u, "\u5DF2\u6253\u5F00")); shown.add(u.toString()); }
    if (q && remote.q === q) {
      for (const u of remote.files) if (!shown.has(u.toString())) { shown.add(u.toString()); fileRows.push(fileItem(u, "")); }
    }
    const folderSeen = /* @__PURE__ */ new Set();
    for (const r of roots) if (match(q, r.name, rel(r.uri))) { folderSeen.add(r.uri.toString()); fileRows.push({ key: "folder:" + r.uri.toString(), item: { type: "folder", uri: r.uri.toString() }, iconEl: icon("rootFolder", "folder"), name: r.name, path: "\u5DE5\u4F5C\u533A\u6587\u4EF6\u5939" }); }
    if (q && remote.q === q) for (const u of remote.folders) if (!folderSeen.has(u.toString())) { folderSeen.add(u.toString()); fileRows.push({ key: "folder:" + u.toString(), item: { type: "folder", uri: u.toString() }, iconEl: icon("folder"), name: base(u), path: rel(u) }); }
    const actions = [
      { key: "act:file", action: () => pick(false), iconEl: icon("goToFile", "file"), name: "\u9009\u62E9\u6587\u4EF6\u2026", path: "" },
      { key: "act:folder", action: () => pick(true), iconEl: icon("folderOpened", "folder"), name: "\u9009\u62E9\u6587\u4EF6\u5939\u2026", path: "" }
    ].filter((a) => match(q, a.name, "\u9009\u62E9", "file", "folder", "\u6587\u4EF6"));
    header("files", "\u6587\u4EF6", fileRows.length);
    fileRows.forEach(addRow);
    if (q && remote.pending && remote.q !== q) empty("\u6B63\u5728\u641C\u7D22\u2026");
    actions.forEach(addRow);
    // 符号（输入 2 个字符以上）
    if (q.length >= 2) {
      const syms = remote.q === q ? remote.symbols : [];
      header("symbolClass", "\u7B26\u53F7", syms.length);
      for (const s of syms) addRow({ key: "sym:" + s.uri.toString() + ":" + (s.range ? s.range.join(",") : "") + ":" + s.name, item: { type: "file", uri: s.uri.toString(), range: s.range ?? void 0, name: s.name, _resolve: s.resolve }, iconEl: renderIcon(SymbolKinds.toIcon(s.kind)), name: s.name, path: (s.container ? s.container + " \xB7 " : "") + rel(s.uri) + (s.line ? ":" + s.line : "") });
      if (!syms.length) empty(remote.q === q && !remote.pending ? "\u6CA1\u6709\u5339\u914D\u7684\u7B26\u53F7" : "\u6B63\u5728\u67E5\u627E\u7B26\u53F7\u2026");
    }
    // 问题
    const probs = problems.filter((p) => match(q, p.msg, base(p.uri), rel(p.uri), p.src));
    if (probs.length || !q) {
      header("warning", "\u95EE\u9898", probs.length);
      for (const p of probs.slice(0, 100)) {
        const ic = icon(p.err ? "error" : "warning");
        ic.classList.add(p.err ? "oc-cx-err" : "oc-cx-warn");
        const nm = base(p.uri) + ":" + p.line + " " + p.msg;
        addRow({ key: "prob:" + p.uri.toString() + ":" + p.range.join(",") + ":" + p.msg, item: { type: "file", uri: p.uri.toString(), range: p.range, name: nm.slice(0, 160) }, iconEl: ic, name: p.msg || base(p.uri), path: rel(p.uri) + ":" + p.line + (p.src ? " \xB7 " + p.src : ""), title: (p.err ? "\u9519\u8BEF" : "\u8B66\u544A") + "\uFF1A" + p.msg + "\n" + rel(p.uri) + ":" + p.line });
      }
      if (!probs.length) empty("\u6CA1\u6709\u9519\u8BEF\u6216\u8B66\u544A");
    }
    // 终端
    const terms = terminals.filter((t) => match(q, t.title, t.lastCommand, "\u7EC8\u7AEF", "terminal"));
    if (terms.length || !q) {
      header("terminal", "\u7EC8\u7AEF", terms.length);
      for (const t of terms) addRow({ key: "term:" + t.id, item: { type: "terminal", id: t.id }, iconEl: icon("terminal"), name: t.title || "\u7EC8\u7AEF " + t.id, path: t.hasSelection ? "\u542B\u9009\u4E2D\u5185\u5BB9" : t.lastCommand ? "$ " + t.lastCommand : "" });
      if (!terms.length) empty(widget.attachmentCapabilities?.supportsTerminalAttachments === false ? "\u5F53\u524D\u5BF9\u8BDD\u4E0D\u652F\u6301\u9644\u52A0\u7EC8\u7AEF" : "\u6CA1\u6709\u6253\u5F00\u7684\u7EC8\u7AEF");
    }
    if (!rows.length && q) empty("\u6CA1\u6709\u5339\u914D\u300C" + search.value.trim() + "\u300D\u7684\u5185\u5BB9");
    const keep = prevKey ? rows.findIndex((r) => r._oc.key === prevKey) : -1;
    focusRow(keep >= 0 ? keep : 0, false);
  };
  // ---- 异步：工作区文件搜索 + 工作区符号 ----
  let cts;
  let timer;
  const queryBuilder = svc.instaService.createInstance(QueryBuilder);
  const runRemote = (rawQ) => {
    cts?.dispose(true);
    const q = rawQ.trim().toLowerCase();
    if (!q) { remote = { q: "", files: [], folders: [], symbols: [], pending: false }; return; }
    const src = cts = new CancellationTokenSource();
    remote = { ...remote, pending: true };
    const folders = svc.contextService.getWorkspace().folders;
    const filesP = folders.length ? svc.searchService.fileSearch(queryBuilder.file(folders, { filePattern: rawQ.trim(), maxResults: 60, sortByScore: true }), src.token).then((r) => r.results.map((x) => x.resource)).catch(() => []) : Promise.resolve([]);
    const symsP = q.length >= 2 ? getWorkspaceSymbols(rawQ.trim(), src.token).catch(() => []) : Promise.resolve([]);
    Promise.all([filesP, symsP]).then(([files, syms]) => {
      if (src.token.isCancellationRequested || !ocCtxDropdownHandle || ocCtxDropdownHandle !== handle) return;
      const dirs = /* @__PURE__ */ new Map();
      const rootKeys = new Set(folders.map((f) => f.uri.toString()));
      for (const u of files) {
        let d = u.with({ path: u.path.replace(/\/[^/]*$/, "") || "/" });
        for (let i = 0; i < 6 && !dirs.has(d.toString()); i++) {
          if (rootKeys.has(d.toString()) || !svc.contextService.getWorkspaceFolder(d)) break;
          if (base(d).toLowerCase().includes(q)) dirs.set(d.toString(), d);
          d = d.with({ path: d.path.replace(/\/[^/]*$/, "") || "/" });
        }
      }
      const symbols = [];
      for (const s of syms.slice(0, 80)) {
        const loc = s.symbol?.location;
        if (!loc?.uri || !fileLike(loc.uri)) continue;
        const r = loc.range;
        symbols.push({ uri: loc.uri, name: String(s.symbol.name), kind: s.symbol.kind, container: s.symbol.containerName ? String(s.symbol.containerName) : "", line: r ? r.startLineNumber : 0, range: r ? [r.startLineNumber, r.startColumn, r.endLineNumber, r.endColumn] : void 0, resolve: r ? void 0 : s });
        if (symbols.length >= 40) break;
      }
      remote = { q, files: files.filter(fileLike), folders: [...dirs.values()].slice(0, 10), symbols, pending: false };
      render();
    });
  };
  // ---- 附加 ----
  const resolveItems = async (items) => {
    const out = [];
    for (const it of items) {
      if (it._resolve && !it.range) {
        try {
          const s = it._resolve;
          const resolved = typeof s.provider?.resolveWorkspaceSymbol === "function" ? await s.provider.resolveWorkspaceSymbol(s.symbol, new CancellationTokenSource().token) : void 0;
          const r = resolved?.location?.range;
          if (r) { out.push({ type: "file", uri: it.uri, name: it.name, range: [r.startLineNumber, r.startColumn, r.endLineNumber, r.endColumn] }); continue; }
        } catch {}
        out.push({ type: "file", uri: it.uri });
        continue;
      }
      const { _resolve, ...rest } = it;
      out.push(rest);
    }
    return out;
  };
  let busy = false;
  const addItems = async (items) => {
    if (busy || !items.length) return;
    busy = true;
    updateFoot("\u6B63\u5728\u6DFB\u52A0\u2026");
    let res = { added: 0, failed: items.length };
    try { res = await ocCtxAttachItems(svc.instaService, svc.terminalService, widget, await resolveItems(items)); } catch (err) { svc.logService.error("[OpenCode] attach context items failed", err); }
    busy = false;
    if (res.added) {
      close();
      try { widget.focusInput(); } catch {}
      if (res.failed) svc.logService.warn("[OpenCode] attach context: " + res.failed + " item(s) failed");
    } else {
      updateFoot("\u6CA1\u80FD\u6DFB\u52A0\uFF08" + res.failed + " \u9879\u5931\u8D25\uFF09");
    }
  };
  const addSelected = () => {
    if (checked.size) return addItems([...checked.values()]);
    const row = rows[focusIndex];
    if (!row) return;
    if (row._oc.action) return row._oc.action();
    return addItems([row._oc.item]);
  };
  const pick = async (folder) => {
    const keep = [...checked.values()];
    close();
    let picked;
    try {
      picked = await svc.fileDialogService.showOpenDialog({ canSelectFiles: !folder, canSelectFolders: folder, canSelectMany: true, title: folder ? "\u9009\u62E9\u6587\u4EF6\u5939" : "\u9009\u62E9\u6587\u4EF6", openLabel: "\u6DFB\u52A0\u5230\u5BF9\u8BDD", defaultUri: roots[0]?.uri });
    } catch (err) { svc.logService.error("[OpenCode] attach context pick failed", err); }
    const items = [...keep, ...(picked ?? []).map((u) => ({ type: folder ? "folder" : "file", uri: u.toString() }))];
    if (!items.length) { try { widget.focusInput(); } catch {} return; }
    const res = await ocCtxAttachItems(svc.instaService, svc.terminalService, widget, await resolveItems(items)).catch(() => ({ added: 0 }));
    try { widget.focusInput(); } catch {}
    if (!res.added) svc.logService.warn("[OpenCode] attach context: picked items not added");
  };
  // ---- 打开/关闭 ----
  const disposables = new DisposableStore();
  const close = () => {
    if (ocCtxDropdownHandle !== handle) return;
    ocCtxDropdownHandle = void 0;
    clearTimeout(timer);
    cts?.dispose(true);
    disposables.dispose();
    root.remove();
    anchorElement.querySelector?.("[aria-expanded]")?.setAttribute("aria-expanded", "false");
  };
  const handle = { dispose: close, widget };
  ocCtxDropdownHandle = handle;
  addBtn.addEventListener("mousedown", (e) => { e.preventDefault(); e.stopPropagation(); });
  addBtn.addEventListener("click", () => { void addSelected(); });
  foot.addEventListener("mousedown", (e) => { if (e.target !== search) e.preventDefault(); });
  root.addEventListener("keydown", (e) => {
    if (e.isComposing || e.keyCode === 229) return; // 输入法组字中：方向键/回车/空格交给输入法
    if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); close(); try { widget.focusInput(); } catch {} }
    else if (e.key === "ArrowDown") { e.preventDefault(); e.stopPropagation(); navMode = true; focusRow(focusIndex + 1, true); }
    else if (e.key === "ArrowUp") { e.preventDefault(); e.stopPropagation(); navMode = true; focusRow(focusIndex - 1, true); }
    else if (e.key === "PageDown") { e.preventDefault(); e.stopPropagation(); navMode = true; focusRow(focusIndex + 10, true); }
    else if (e.key === "PageUp") { e.preventDefault(); e.stopPropagation(); navMode = true; focusRow(focusIndex - 10, true); }
    else if (e.key === " " && (navMode || !search.value) && rows[focusIndex]) {
      // 空格：用方向键选过行（或搜索框为空）时勾选当前行，否则照常输入空格
      e.preventDefault();
      e.stopPropagation();
      const row = rows[focusIndex];
      if (row._oc.action) row._oc.action(); else toggle(row);
    }
    else if (e.key === "Enter") { e.preventDefault(); e.stopPropagation(); void addSelected(); }
  });
  search.addEventListener("input", () => {
    navMode = false;
    clearTimeout(timer);
    const value = search.value;
    if (value.trim()) { remote = { ...remote, pending: true }; timer = setTimeout(() => runRemote(value), 150); }
    else { cts?.dispose(true); remote = { q: "", files: [], folders: [], symbols: [], pending: false }; }
    render();
    list.scrollTop = 0;
  });
  disposables.add(addDisposableListener(doc, "mousedown", (e) => {
    if (!root.contains(e.target) && !(anchor.button && anchorElement.contains(e.target))) close();
  }, true));
  disposables.add(addDisposableListener(win, "resize", () => close()));
  disposables.add(addDisposableListener(win, "blur", () => close()));
  host.appendChild(root);
  // 定位：与模型下拉一致——默认在按钮上方展开（输入框在底部），上方空间不足且下方更大时才向下；左边与按钮对齐。
  const rect = anchorElement.getBoundingClientRect();
  const spaceAbove = rect.top - 8;
  const spaceBelow = win.innerHeight - rect.bottom - 8;
  const above = spaceAbove >= 240 || spaceAbove >= spaceBelow;
  root.style.maxHeight = Math.max(160, Math.min(340, above ? spaceAbove : spaceBelow)) + "px";
  // 高度随内容，不再固定撑满（19:35 用户嫌太大）
  const width = Math.min(340, win.innerWidth - 16);
  root.style.width = width + "px";
  root.style.left = Math.max(8, Math.min(rect.left, win.innerWidth - width - 8)) + "px";
  if (above) root.style.bottom = win.innerHeight - rect.top + 4 + "px";
  else root.style.top = rect.bottom + 4 + "px";
  render();
  anchorElement.querySelector?.("[aria-expanded]")?.setAttribute("aria-expanded", "true");
  search.focus();
}

var OpenCodeOpenAttachContextDropdownAction = class extends Action2 {
  constructor() {
    super({ id: "opencode.chat.openAttachContextDropdown", title: { value: "OpenCode: Attach Context Dropdown", original: "OpenCode: Attach Context Dropdown" }, f1: false });
  }
  // 返回 true 表示下拉已打开（或已收起）；false 表示打不开，调用方自行退回旧窗口。
  run(accessor, context2) {
    return accessor.get(IInstantiationService).invokeFunction(ocCtxOpenDropdown, context2?.widget);
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
          ChatContextKeys.inQuickChat.negate(), // OpenCode: "+" 已改为打开独立窗口，恢复显示
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
    // OpenCode ctxdrop1850: 添加上下文改为挂在 "+" 按钮上的下拉框（同「配置模型」下拉）；
    // 下拉打不开时才退回扩展里的独立窗口（opencode.attachContext，扩展那边会因失败标记直接开窗口）。
    const instaService = accessor.get(IInstantiationService);
    const commandService = accessor.get(ICommandService);
    const context2 = args2[0];
    let opened = false;
    try {
      opened = await instaService.invokeFunction(ocCtxOpenDropdown, context2?.widget);
    } catch {
      opened = false;
    }
    if (opened) {
      return;
    }
    return commandService.executeCommand("opencode.attachContext");
  }
  async runLegacyQuickPick(accessor, ...args2) {
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
