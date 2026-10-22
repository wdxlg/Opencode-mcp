// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/api/browser/mainThreadChatContext.ts
import { IconPath } from "./module-1212.mjs";
import { URI } from "./module-0032.mjs";
import { Disposable } from "./module-0012.mjs";
import { ExtHostContext, MainContext } from "./module-0922.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { extHostNamedCustomer } from "./module-0920.mjs";
import { IChatContextService } from "./module-1453.mjs";


// src/vs/workbench/api/browser/mainThreadChatContext.ts
function reviveContextItem(item) {
  return {
    ...item,
    iconPath: IconPath.to(item.iconPath),
    resourceUri: item.resourceUri ? URI.revive(item.resourceUri) : void 0
  };
}

function reviveContextItems(items) {
  return items.map(reviveContextItem);
}

var MainThreadChatContext = class extends Disposable {
  constructor(extHostContext, _chatContextService) {
    super();
    this._chatContextService = _chatContextService;
    this._providers = /* @__PURE__ */ new Map();
    this._proxy = extHostContext.getProxy(ExtHostContext.ExtHostChatContext);
    this._chatContextService.setExecuteCommandCallback((itemHandle) => this._proxy.$executeChatContextItemCommand(itemHandle));
  }
  $registerChatWorkspaceContextProvider(handle2, id2) {
    this._providers.set(handle2, { id: id2 });
    this._chatContextService.registerChatWorkspaceContextProvider(id2, {
      provideWorkspaceChatContext: async (token) => {
        const items = await this._proxy.$provideWorkspaceChatContext(handle2, token);
        return reviveContextItems(items);
      }
    });
  }
  $registerChatExplicitContextProvider(handle2, id2) {
    this._providers.set(handle2, { id: id2 });
    this._chatContextService.registerChatExplicitContextProvider(id2, {
      provideChatContext: async (token) => {
        const items = await this._proxy.$provideExplicitChatContext(handle2, token);
        return reviveContextItems(items);
      },
      resolveChatContext: async (context2, token) => {
        const result = await this._proxy.$resolveExplicitChatContext(handle2, context2, token);
        return reviveContextItem(result);
      }
    });
  }
  $registerChatResourceContextProvider(handle2, id2, selector) {
    this._providers.set(handle2, { id: id2, selector });
    this._chatContextService.registerChatResourceContextProvider(id2, selector, {
      provideChatContext: async (resource, withValue, viewType, token) => {
        const result = await this._proxy.$provideResourceChatContext(handle2, { resource, withValue, viewType }, token);
        return result ? reviveContextItem(result) : void 0;
      },
      resolveChatContext: async (context2, token) => {
        const result = await this._proxy.$resolveResourceChatContext(handle2, context2, token);
        return reviveContextItem(result);
      }
    });
  }
  $unregisterChatContextProvider(handle2) {
    const provider = this._providers.get(handle2);
    if (!provider) {
      return;
    }
    this._chatContextService.unregisterChatContextProvider(provider.id);
    this._providers.delete(handle2);
  }
  $updateWorkspaceContextItems(handle2, items) {
    const provider = this._providers.get(handle2);
    if (!provider) {
      return;
    }
    this._chatContextService.updateWorkspaceContextItems(provider.id, reviveContextItems(items));
  }
  $executeChatContextItemCommand(itemHandle) {
    return this._proxy.$executeChatContextItemCommand(itemHandle);
  }
};

MainThreadChatContext = __decorateClass([
  extHostNamedCustomer(MainContext.MainThreadChatContext),
  __decorateParam(1, IChatContextService)
], MainThreadChatContext);
export { reviveContextItem, reviveContextItems, MainThreadChatContext };
