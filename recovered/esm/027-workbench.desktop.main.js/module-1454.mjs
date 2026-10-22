// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/contextContrib/chatContextService.ts
import { createDecorator } from "./module-0077.mjs";
import { Disposable, DisposableMap } from "./module-0012.mjs";
import { basename2 } from "./module-0034.mjs";
import { score2 } from "./module-0858.mjs";
import { CancellationToken } from "./module-0025.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { URI } from "./module-0032.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IChatContextPickService } from "./module-1453.mjs";
import { IExtensionService } from "./module-0887.mjs";
import { registerSingleton } from "./module-0135.mjs";


// src/vs/workbench/contrib/chat/browser/contextContrib/chatContextService.ts
var IChatContextService = createDecorator("chatContextService");

function isViewTypeTabSelector(selector) {
  return selector.viewType !== void 0;
}

var ChatContextService = class extends Disposable {
  constructor(_contextPickService, _extensionService) {
    super();
    this._contextPickService = _contextPickService;
    this._extensionService = _extensionService;
    this._providers = /* @__PURE__ */ new Map();
    this._workspaceContext = /* @__PURE__ */ new Map();
    this._registeredPickers = this._register(new DisposableMap());
    this._lastResourceContext = /* @__PURE__ */ new Map();
  }
  setExecuteCommandCallback(callback) {
    this._executeCommandCallback = callback;
  }
  async executeChatContextItemCommand(handle2) {
    if (!this._executeCommandCallback) {
      return;
    }
    await this._executeCommandCallback(handle2);
  }
  setChatContextProvider(id2, picker) {
    const providerEntry = this._providers.get(id2) ?? {};
    providerEntry.picker = picker;
    this._providers.set(id2, providerEntry);
    this._registerWithPickService(id2);
  }
  _registerWithPickService(id2) {
    const providerEntry = this._providers.get(id2);
    if (!providerEntry || !providerEntry.picker || !providerEntry.explicitProvider) {
      return;
    }
    const title = `${providerEntry.picker.title.replace(/\.+$/, "")}...`;
    this._registeredPickers.set(id2, this._contextPickService.registerChatContextItem(this._asPicker(title, providerEntry.picker.icon, id2)));
  }
  registerChatWorkspaceContextProvider(id2, provider) {
    const providerEntry = this._providers.get(id2) ?? {};
    providerEntry.workspaceProvider = provider;
    this._providers.set(id2, providerEntry);
  }
  registerChatExplicitContextProvider(id2, provider) {
    const providerEntry = this._providers.get(id2) ?? {};
    providerEntry.explicitProvider = provider;
    this._providers.set(id2, providerEntry);
    this._registerWithPickService(id2);
  }
  registerChatResourceContextProvider(id2, selector, provider) {
    const providerEntry = this._providers.get(id2) ?? {};
    providerEntry.resourceProvider = { selector, provider };
    this._providers.set(id2, providerEntry);
  }
  unregisterChatContextProvider(id2) {
    this._providers.delete(id2);
    this._registeredPickers.deleteAndDispose(id2);
  }
  updateWorkspaceContextItems(id2, items) {
    this._workspaceContext.set(id2, items);
  }
  getWorkspaceContextItems() {
    const items = [];
    for (const workspaceContexts of this._workspaceContext.values()) {
      for (const item of workspaceContexts) {
        if (!item.value) {
          continue;
        }
        const derivedLabel = item.label ?? (item.resourceUri ? basename2(item.resourceUri) : "Unknown");
        items.push({
          value: item.value,
          name: derivedLabel,
          modelDescription: item.modelDescription,
          id: derivedLabel,
          kind: "workspace"
        });
      }
    }
    return items;
  }
  async contextForResource(uri5, language2, viewType) {
    return this._contextForResource(uri5, false, language2, viewType);
  }
  async _contextForResource(uri5, withValue, language2, viewType) {
    const scoredProviders = [];
    for (const providerEntry of this._providers.values()) {
      if (!providerEntry.resourceProvider) {
        continue;
      }
      const selector = providerEntry.resourceProvider.selector;
      const matchScore = isViewTypeTabSelector(selector) ? viewType !== void 0 && selector.viewType === viewType ? 10 : 0 : score2(selector.uri, uri5, language2 ?? "", true, void 0, void 0);
      scoredProviders.push({ score: matchScore, provider: providerEntry.resourceProvider.provider });
    }
    scoredProviders.sort((a, b) => b.score - a.score);
    if (scoredProviders.length === 0 || scoredProviders[0].score <= 0) {
      return;
    }
    const provider = scoredProviders[0].provider;
    const context2 = await provider.provideChatContext(uri5, withValue, viewType, CancellationToken.None);
    if (!context2) {
      return;
    }
    const effectiveResourceUri = context2.resourceUri ?? uri5;
    const derivedLabel = context2.label ?? basename2(effectiveResourceUri);
    const contextValue = {
      value: void 0,
      name: derivedLabel,
      iconPath: context2.iconPath,
      uri: uri5,
      resourceUri: context2.resourceUri,
      modelDescription: context2.modelDescription,
      tooltip: context2.tooltip,
      commandId: context2.command?.id,
      handle: context2.handle
    };
    this._lastResourceContext.clear();
    this._lastResourceContext.set(contextValue, { originalItem: context2, provider });
    return contextValue;
  }
  async resolveChatContext(context2, language2) {
    if (context2.value !== void 0) {
      return context2;
    }
    const item = this._lastResourceContext.get(context2);
    if (!item) {
      const resolved = await this._contextForResource(context2.uri, true, language2);
      context2.value = resolved?.value;
      context2.modelDescription = resolved?.modelDescription;
      context2.tooltip = resolved?.tooltip;
      return context2;
    } else {
      const resolved = await item.provider.resolveChatContext(item.originalItem, CancellationToken.None);
      if (resolved) {
        context2.value = resolved.value;
        context2.modelDescription = resolved.modelDescription;
        context2.tooltip = resolved.tooltip;
        return context2;
      }
    }
    return context2;
  }
  _asPicker(title, icon2, id2) {
    const asPicker = () => {
      let providerEntry = this._providers.get(id2);
      if (!providerEntry) {
        throw new Error("No chat context provider registered");
      }
      const picks = async () => {
        if (providerEntry && !providerEntry.explicitProvider) {
          await this._extensionService.activateByEvent(`onChatContextProvider:${id2}`);
          providerEntry = this._providers.get(id2);
          if (!providerEntry?.explicitProvider) {
            return [];
          }
        }
        const results = await providerEntry?.explicitProvider.provideChatContext(CancellationToken.None);
        return results || [];
      };
      return {
        picks: picks().then((items) => {
          return items.map((item) => {
            const derivedLabel = item.label ?? (item.resourceUri ? basename2(item.resourceUri) : "Unknown");
            const iconPath = item.iconPath;
            const isThemeIcon = ThemeIcon.isThemeIcon(iconPath);
            return {
              label: derivedLabel,
              iconClass: isThemeIcon ? ThemeIcon.asClassName(iconPath) : void 0,
              iconPath: !isThemeIcon && iconPath ? URI.isUri(iconPath) ? { dark: iconPath, light: iconPath } : { dark: iconPath.dark, light: iconPath.light } : void 0,
              asAttachment: async () => {
                let contextValue = item;
                if (contextValue.value === void 0 && providerEntry?.explicitProvider) {
                  contextValue = await providerEntry.explicitProvider.resolveChatContext(item, CancellationToken.None);
                }
                const resolvedLabel = contextValue.label ?? (contextValue.resourceUri ? basename2(contextValue.resourceUri) : "Unknown");
                return {
                  kind: "generic",
                  id: resolvedLabel,
                  name: resolvedLabel,
                  iconPath: contextValue.iconPath ?? item.iconPath,
                  value: contextValue.value,
                  tooltip: contextValue.tooltip ?? item.tooltip
                };
              }
            };
          });
        }),
        placeholder: title
      };
    };
    const picker = {
      asPicker,
      type: "pickerPick",
      label: title,
      icon: icon2
    };
    return picker;
  }
};

ChatContextService = __decorateClass([
  __decorateParam(0, IChatContextPickService),
  __decorateParam(1, IExtensionService)
], ChatContextService);

registerSingleton(IChatContextService, ChatContextService, 1 /* Delayed */);
export { isViewTypeTabSelector, IChatContextService, ChatContextService };
