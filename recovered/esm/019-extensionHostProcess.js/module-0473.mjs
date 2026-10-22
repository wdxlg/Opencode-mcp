// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/node/extensionHostProcess.js
// Original module marker: src/vs/workbench/api/common/extHostChatContext.ts
import { Disposable, DisposableStore } from "./module-0011.mjs";
import { MainContext } from "./module-0054.mjs";
import { URI } from "./module-0025.mjs";
import { MarkdownString3, TabSelector } from "./module-0245.mjs";
import { isEqual2 } from "./module-0027.mjs";
import { CancellationToken } from "./module-0018.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IExtHostRpcService } from "./module-0069.mjs";
import { IExtHostCommands } from "./module-0268.mjs";
import { IExtHostEditorTabs } from "./module-0307.mjs";


// src/vs/workbench/api/common/extHostChatContext.ts
var ExtHostChatContext = class extends Disposable {
  // providerHandle -> Set<itemHandle>
  constructor(extHostRpc, _commands, _editorTabs) {
    super();
    this._commands = _commands;
    this._editorTabs = _editorTabs;
    this._handlePool = 0;
    this._providers = /* @__PURE__ */ new Map();
    this._itemPool = 0;
    /** Global map of itemHandle -> original item for command execution with reference equality */
    this._globalItems = /* @__PURE__ */ new Map();
    /** Track which items belong to which provider for cleanup */
    this._providerItems = /* @__PURE__ */ new Map();
    this._proxy = extHostRpc.getProxy(MainContext.MainThreadChatContext);
  }
  // Workspace context provider methods
  async $provideWorkspaceChatContext(handle, token) {
    this._clearProviderItems(handle);
    const entry = this._providers.get(handle);
    if (!entry || entry.type !== "workspace") {
      throw new Error("Workspace context provider not found");
    }
    const provider = entry.provider;
    const result = await provider.provideWorkspaceChatContext?.(token) ?? [];
    return this._convertItems(handle, result);
  }
  // Explicit context provider methods
  async $provideExplicitChatContext(handle, token) {
    this._clearProviderItems(handle);
    const entry = this._providers.get(handle);
    if (!entry || entry.type !== "explicit") {
      throw new Error("Explicit context provider not found");
    }
    const provider = entry.provider;
    const result = await provider.provideAttachChatContext?.(token) ?? [];
    return this._convertItems(handle, result);
  }
  async $resolveExplicitChatContext(handle, context, token) {
    const entry = this._providers.get(handle);
    if (!entry || entry.type !== "explicit") {
      throw new Error("Explicit context provider not found");
    }
    const provider = entry.provider;
    const extItem = this._globalItems.get(context.handle);
    if (!extItem) {
      throw new Error("Chat context item not found");
    }
    return this._doResolve(provider.resolveAttachChatContext?.bind(provider), context, extItem, token);
  }
  // Resource context provider methods
  async $provideResourceChatContext(handle, options2, token) {
    const entry = this._providers.get(handle);
    if (!entry || entry.type !== "resource") {
      throw new Error("Resource context provider not found");
    }
    const provider = entry.provider;
    const resource = URI.revive(options2.resource);
    const tab = this._findTab(resource, options2.viewType);
    if (!tab) {
      return void 0;
    }
    const result = await provider.provideChatTabContext?.({ tab }, token);
    if (!result) {
      return void 0;
    }
    if (result.label === void 0 && result.resourceUri === void 0) {
      throw new Error("ChatContextItem must have either a label or a resourceUri");
    }
    const itemHandle = this._addTrackedItem(handle, result);
    const item = {
      handle: itemHandle,
      iconPath: result.iconPath,
      label: result.label,
      resourceUri: result.resourceUri,
      modelDescription: result.modelDescription,
      tooltip: result.tooltip ? MarkdownString3.from(result.tooltip) : void 0,
      value: options2.withValue ? result.value : void 0,
      command: result.command ? { id: result.command.command } : void 0
    };
    if (options2.withValue && !item.value) {
      const resolved = await provider.resolveChatTabContext?.bind(provider)(result, token);
      item.value = resolved?.value;
      item.tooltip = resolved?.tooltip ? MarkdownString3.from(resolved.tooltip) : item.tooltip;
    }
    return item;
  }
  async $resolveResourceChatContext(handle, context, token) {
    const entry = this._providers.get(handle);
    if (!entry || entry.type !== "resource") {
      throw new Error("Resource context provider not found");
    }
    const provider = entry.provider;
    const extItem = this._globalItems.get(context.handle);
    if (!extItem) {
      throw new Error("Chat context item not found");
    }
    return this._doResolve(provider.resolveChatTabContext?.bind(provider), context, extItem, token);
  }
  // Command execution
  async $executeChatContextItemCommand(itemHandle) {
    const extItem = this._globalItems.get(itemHandle);
    if (!extItem) {
      throw new Error("Chat context item not found");
    }
    if (!extItem.command) {
      throw new Error("Chat context item has no command");
    }
    const args2 = extItem.command.arguments ? [extItem, ...extItem.command.arguments] : [extItem];
    await this._commands.executeCommand(extItem.command.command, ...args2);
  }
  // Registration methods
  registerChatWorkspaceContextProvider(id2, provider) {
    const handle = this._handlePool++;
    const disposables = new DisposableStore();
    this._providers.set(handle, { type: "workspace", provider, disposables });
    this._listenForWorkspaceContextChanges(handle, provider, disposables);
    this._proxy.$registerChatWorkspaceContextProvider(handle, id2);
    return {
      dispose: () => {
        this._providers.delete(handle);
        this._clearProviderItems(handle);
        this._providerItems.delete(handle);
        this._proxy.$unregisterChatContextProvider(handle);
        disposables.dispose();
      }
    };
  }
  registerChatAttachContextProvider(id2, provider) {
    const handle = this._handlePool++;
    const disposables = new DisposableStore();
    this._providers.set(handle, { type: "explicit", provider, disposables });
    this._proxy.$registerChatExplicitContextProvider(handle, id2);
    return {
      dispose: () => {
        this._providers.delete(handle);
        this._clearProviderItems(handle);
        this._providerItems.delete(handle);
        this._proxy.$unregisterChatContextProvider(handle);
        disposables.dispose();
      }
    };
  }
  registerChatTabContextProvider(selector, id2, provider) {
    const handle = this._handlePool++;
    const disposables = new DisposableStore();
    this._providers.set(handle, { type: "resource", provider, disposables });
    this._proxy.$registerChatResourceContextProvider(handle, id2, TabSelector.from(selector));
    return {
      dispose: () => {
        this._providers.delete(handle);
        this._clearProviderItems(handle);
        this._providerItems.delete(handle);
        this._proxy.$unregisterChatContextProvider(handle);
        disposables.dispose();
      }
    };
  }
  /**
   * Finds the open {@link vscode.Tab tab} for the given resource. When a `viewType` is provided,
   * webview and custom editor tabs are matched by their view type; otherwise tabs are matched by
   * their input resource. When multiple tabs match by view type, the active tab is preferred.
   */
  _findTab(resource, viewType) {
    let viewTypeMatch;
    for (const group of this._editorTabs.tabGroups.all) {
      for (const tab of group.tabs) {
        const input = tab.input;
        if (!input) {
          continue;
        }
        if (URI.isUri(input.uri) && isEqual2(input.uri, resource)) {
          return tab;
        }
        if (viewType !== void 0 && input.viewType === viewType && (!viewTypeMatch || tab.isActive)) {
          viewTypeMatch = tab;
        }
      }
    }
    return viewTypeMatch;
  }
  _clearProviderItems(handle) {
    const itemHandles = this._providerItems.get(handle);
    if (itemHandles) {
      for (const itemHandle of itemHandles) {
        this._globalItems.delete(itemHandle);
      }
      itemHandles.clear();
    }
  }
  _addTrackedItem(providerHandle, item) {
    const itemHandle = this._itemPool++;
    this._globalItems.set(itemHandle, item);
    if (!this._providerItems.has(providerHandle)) {
      this._providerItems.set(providerHandle, /* @__PURE__ */ new Set());
    }
    this._providerItems.get(providerHandle).add(itemHandle);
    return itemHandle;
  }
  _convertItems(handle, items) {
    const result = [];
    for (const item of items) {
      if (item.label === void 0 && item.resourceUri === void 0) {
        throw new Error("ChatContextItem must have either a label or a resourceUri");
      }
      const itemHandle = this._addTrackedItem(handle, item);
      result.push({
        handle: itemHandle,
        iconPath: item.iconPath,
        label: item.label,
        resourceUri: item.resourceUri,
        modelDescription: item.modelDescription,
        tooltip: item.tooltip ? MarkdownString3.from(item.tooltip) : void 0,
        value: item.value,
        command: item.command ? { id: item.command.command } : void 0
      });
    }
    return result;
  }
  async _doResolve(resolveFn, context, extItem, token) {
    const extResult = await resolveFn(extItem, token);
    if (extResult) {
      return {
        handle: context.handle,
        iconPath: extResult.iconPath,
        label: extResult.label,
        resourceUri: extResult.resourceUri,
        modelDescription: extResult.modelDescription,
        tooltip: extResult.tooltip ? MarkdownString3.from(extResult.tooltip) : void 0,
        value: extResult.value,
        command: extResult.command ? { id: extResult.command.command } : void 0
      };
    }
    return context;
  }
  _listenForWorkspaceContextChanges(handle, provider, disposables) {
    if (!provider.onDidChangeWorkspaceChatContext) {
      return;
    }
    const provideWorkspaceContext = async () => {
      const workspaceContexts = await provider.provideWorkspaceChatContext?.(CancellationToken.None);
      const resolvedContexts = this._convertItems(handle, workspaceContexts ?? []);
      return this._proxy.$updateWorkspaceContextItems(handle, resolvedContexts);
    };
    disposables.add(provider.onDidChangeWorkspaceChatContext(async () => provideWorkspaceContext()));
    provideWorkspaceContext();
  }
  dispose() {
    super.dispose();
    for (const { disposables } of this._providers.values()) {
      disposables.dispose();
    }
  }
};

ExtHostChatContext = __decorateClass([
  __decorateParam(0, IExtHostRpcService),
  __decorateParam(1, IExtHostCommands),
  __decorateParam(2, IExtHostEditorTabs)
], ExtHostChatContext);
export { ExtHostChatContext };
