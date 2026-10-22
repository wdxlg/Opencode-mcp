// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/services/extensions/browser/extensionUrlHandler.ts
import { createDecorator } from "./module-0077.mjs";
import { combinedDisposable, toDisposable } from "./module-0012.mjs";
import { disposableWindowInterval } from "./module-0075.mjs";
import { mainWindow } from "./module-0002.mjs";
import { URI } from "./module-0032.mjs";
import { ExtensionIdentifier } from "./module-0688.mjs";
import { equalsIgnoreCase } from "./module-0030.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { MarkdownString } from "./module-0462.mjs";
import { isCancellationError } from "./module-0004.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IURLService } from "./module-1286.mjs";
import { IExtensionService } from "./module-0887.mjs";
import { IDialogService } from "./module-0267.mjs";
import { ICommandService } from "./module-0087.mjs";
import { IHostService } from "./module-1117.mjs";
import { IStorageService } from "./module-0512.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { INotificationService } from "./module-0336.mjs";
import { IProductService } from "./module-0873.mjs";
import { registerSingleton } from "./module-0135.mjs";
import { WorkbenchPhase, registerWorkbenchContribution2 } from "./module-0870.mjs";
import { Action2, MenuId, registerAction2 } from "./module-0092.mjs";
import { IsWebContext } from "./module-0635.mjs";
import { IQuickInputService } from "./module-0536.mjs";


// src/vs/workbench/services/extensions/browser/extensionUrlHandler.ts
var FIVE_MINUTES = 5 * 60 * 1e3;

var THIRTY_SECONDS = 30 * 1e3;

var URL_TO_HANDLE = "extensionUrlHandler.urlToHandle";

var USER_TRUSTED_EXTENSIONS_CONFIGURATION_KEY = "extensions.confirmedUriHandlerExtensionIds";

var USER_TRUSTED_EXTENSIONS_STORAGE_KEY = "extensionUrlHandler.confirmedExtensions";

function isExtensionId(value2) {
  return /^[a-z0-9][a-z0-9\-]*\.[a-z0-9][a-z0-9\-]*$/i.test(value2);
}

var UserTrustedExtensionIdStorage = class {
  constructor(storageService) {
    this.storageService = storageService;
  }
  get extensions() {
    const userTrustedExtensionIdsJson = this.storageService.get(USER_TRUSTED_EXTENSIONS_STORAGE_KEY, 0 /* PROFILE */, "[]");
    try {
      return JSON.parse(userTrustedExtensionIdsJson);
    } catch {
      return [];
    }
  }
  has(id2) {
    return this.extensions.indexOf(id2) > -1;
  }
  add(id2) {
    this.set([...this.extensions, id2]);
  }
  set(ids) {
    this.storageService.store(USER_TRUSTED_EXTENSIONS_STORAGE_KEY, JSON.stringify(ids), 0 /* PROFILE */, 1 /* MACHINE */);
  }
};

var IExtensionUrlHandler = createDecorator("extensionUrlHandler");

var ExtensionUrlHandlerOverrideRegistry = class {
  static {
    this.handlers = /* @__PURE__ */ new Set();
  }
  static registerHandler(handler) {
    this.handlers.add(handler);
    return toDisposable(() => this.handlers.delete(handler));
  }
  static getHandler(uri5) {
    for (const handler of this.handlers) {
      if (handler.canHandleURL(uri5)) {
        return handler;
      }
    }
    return void 0;
  }
};

var ExtensionUrlHandler = class {
  constructor(urlService, extensionService, dialogService, commandService, hostService, storageService, configurationService, notificationService, productService) {
    this.extensionService = extensionService;
    this.dialogService = dialogService;
    this.commandService = commandService;
    this.hostService = hostService;
    this.storageService = storageService;
    this.configurationService = configurationService;
    this.notificationService = notificationService;
    this.productService = productService;
    this.extensionHandlers = /* @__PURE__ */ new Map();
    this.uriBuffer = /* @__PURE__ */ new Map();
    this.userTrustedExtensionsStorage = new UserTrustedExtensionIdStorage(storageService);
    const interval = disposableWindowInterval(mainWindow, () => this.garbageCollect(), THIRTY_SECONDS);
    const urlToHandleValue = this.storageService.get(URL_TO_HANDLE, 1 /* WORKSPACE */);
    if (urlToHandleValue) {
      this.storageService.remove(URL_TO_HANDLE, 1 /* WORKSPACE */);
      this.handleURL(URI.revive(JSON.parse(urlToHandleValue)), { trusted: true });
    }
    const cache2 = ExtensionUrlBootstrapHandler.cache;
    const drainTimeout = setTimeout(() => cache2.forEach(([uri5, option2]) => this.handleURL(uri5, option2)));
    this.disposable = combinedDisposable(
      urlService.registerHandler(this),
      interval,
      toDisposable(() => clearTimeout(drainTimeout))
    );
  }
  async handleURL(uri5, options3) {
    if (!isExtensionId(uri5.authority)) {
      return false;
    }
    const overrideHandler = ExtensionUrlHandlerOverrideRegistry.getHandler(uri5);
    const extensionId = uri5.authority;
    const initialHandler = this.extensionHandlers.get(ExtensionIdentifier.toKey(extensionId));
    let extensionDisplayName;
    let extensionInstalled = !!initialHandler;
    if (!initialHandler) {
      const extension = await this.extensionService.getExtension(extensionId);
      extensionInstalled = !!extension;
      if (!extension && !overrideHandler) {
        await this.handleUnhandledURL(uri5, extensionId, options3);
        return true;
      }
      extensionDisplayName = extension?.displayName ?? extensionId;
    } else {
      extensionDisplayName = initialHandler.extensionDisplayName;
    }
    const trusted = options3?.trusted || this.productService.trustedExtensionProtocolHandlers?.some((value2) => equalsIgnoreCase(value2, extensionId)) || this.didUserTrustExtension(ExtensionIdentifier.toKey(extensionId));
    if (!trusted) {
      const uriString = uri5.toString(false);
      let uriLabel = uriString;
      if (uriLabel.length > 40) {
        uriLabel = `${uriLabel.substring(0, 30)}...${uriLabel.substring(uriLabel.length - 5)}`;
      }
      const result = await this.dialogService.confirm({
        message: localize(23013, null, extensionDisplayName),
        checkbox: {
          label: localize(23022, null)
        },
        primaryButton: localize(23018, null),
        custom: {
          markdownDetails: [{
            markdown: new MarkdownString(`<div title="${uriString}" aria-label='${uriString}'>${uriLabel}</div>`, { supportHtml: true })
          }]
        }
      });
      if (!result.confirmed) {
        return true;
      }
      if (result.checkboxChecked) {
        this.userTrustedExtensionsStorage.add(ExtensionIdentifier.toKey(extensionId));
      }
    }
    if (overrideHandler) {
      const handled = await overrideHandler.handleURL(uri5);
      if (handled) {
        return handled;
      }
    }
    if (!extensionInstalled) {
      await this.handleUnhandledURL(uri5, extensionId, { ...options3, trusted: true });
      return true;
    }
    const handler = this.extensionHandlers.get(ExtensionIdentifier.toKey(extensionId));
    if (handler) {
      if (!initialHandler) {
        return await this.handleURLByExtension(extensionId, handler, uri5, options3);
      }
      return false;
    }
    const timestamp = (/* @__PURE__ */ new Date()).getTime();
    let uris = this.uriBuffer.get(ExtensionIdentifier.toKey(extensionId));
    if (!uris) {
      uris = [];
      this.uriBuffer.set(ExtensionIdentifier.toKey(extensionId), uris);
    }
    uris.push({ timestamp, uri: uri5 });
    await this.extensionService.activateByEvent(`onUri:${ExtensionIdentifier.toKey(extensionId)}`, 1 /* Immediate */);
    return true;
  }
  registerExtensionHandler(extensionId, handler) {
    this.extensionHandlers.set(ExtensionIdentifier.toKey(extensionId), handler);
    const uris = this.uriBuffer.get(ExtensionIdentifier.toKey(extensionId)) || [];
    for (const { uri: uri5 } of uris) {
      this.handleURLByExtension(extensionId, handler, uri5);
    }
    this.uriBuffer.delete(ExtensionIdentifier.toKey(extensionId));
  }
  unregisterExtensionHandler(extensionId) {
    this.extensionHandlers.delete(ExtensionIdentifier.toKey(extensionId));
  }
  async handleURLByExtension(extensionId, handler, uri5, options3) {
    return await handler.handleURL(uri5, options3);
  }
  async handleUnhandledURL(uri5, extensionId, options3) {
    try {
      await this.commandService.executeCommand("workbench.extensions.installExtension", extensionId, {
        justification: {
          reason: `${localize(23015, null)}
${uri5.toString()}`,
          action: localize(23019, null)
        },
        enable: true,
        installPreReleaseVersion: this.productService.quality !== "stable"
      });
    } catch (error) {
      if (!isCancellationError(error)) {
        this.notificationService.error(error);
      }
      return;
    }
    const extension = await this.extensionService.getExtension(extensionId);
    if (extension) {
      await this.handleURL(uri5, { ...options3, trusted: true });
    } else {
      const result = await this.dialogService.confirm({
        message: localize(23020, null, extensionId),
        primaryButton: localize(23021, null)
      });
      if (!result.confirmed) {
        return;
      }
      this.storageService.store(URL_TO_HANDLE, JSON.stringify(uri5.toJSON()), 1 /* WORKSPACE */, 1 /* MACHINE */);
      await this.hostService.reload();
    }
  }
  // forget about all uris buffered more than 5 minutes ago
  garbageCollect() {
    const now = (/* @__PURE__ */ new Date()).getTime();
    const uriBuffer = /* @__PURE__ */ new Map();
    this.uriBuffer.forEach((uris, extensionId) => {
      uris = uris.filter(({ timestamp }) => now - timestamp < FIVE_MINUTES);
      if (uris.length > 0) {
        uriBuffer.set(extensionId, uris);
      }
    });
    this.uriBuffer = uriBuffer;
  }
  didUserTrustExtension(id2) {
    if (this.userTrustedExtensionsStorage.has(id2)) {
      return true;
    }
    return this.getConfirmedTrustedExtensionIdsFromConfiguration().indexOf(id2) > -1;
  }
  getConfirmedTrustedExtensionIdsFromConfiguration() {
    const trustedExtensionIds = this.configurationService.getValue(USER_TRUSTED_EXTENSIONS_CONFIGURATION_KEY);
    if (!Array.isArray(trustedExtensionIds)) {
      return [];
    }
    return trustedExtensionIds;
  }
  dispose() {
    this.disposable.dispose();
    this.extensionHandlers.clear();
    this.uriBuffer.clear();
  }
};

ExtensionUrlHandler = __decorateClass([
  __decorateParam(0, IURLService),
  __decorateParam(1, IExtensionService),
  __decorateParam(2, IDialogService),
  __decorateParam(3, ICommandService),
  __decorateParam(4, IHostService),
  __decorateParam(5, IStorageService),
  __decorateParam(6, IConfigurationService),
  __decorateParam(7, INotificationService),
  __decorateParam(8, IProductService)
], ExtensionUrlHandler);

registerSingleton(IExtensionUrlHandler, ExtensionUrlHandler, 0 /* Eager */);

var ExtensionUrlBootstrapHandler = class {
  static {
    this.ID = "workbench.contrib.extensionUrlBootstrapHandler";
  }
  static {
    this._cache = [];
  }
  static get cache() {
    ExtensionUrlBootstrapHandler.disposable.dispose();
    const result = ExtensionUrlBootstrapHandler._cache;
    ExtensionUrlBootstrapHandler._cache = [];
    return result;
  }
  constructor(urlService) {
    ExtensionUrlBootstrapHandler.disposable = urlService.registerHandler(this);
  }
  async handleURL(uri5, options3) {
    if (!isExtensionId(uri5.authority)) {
      return false;
    }
    ExtensionUrlBootstrapHandler._cache.push([uri5, options3]);
    return true;
  }
};

ExtensionUrlBootstrapHandler = __decorateClass([
  __decorateParam(0, IURLService)
], ExtensionUrlBootstrapHandler);

registerWorkbenchContribution2(
  ExtensionUrlBootstrapHandler.ID,
  ExtensionUrlBootstrapHandler,
  WorkbenchPhase.BlockRestore
  /* registration only */
);

var ManageAuthorizedExtensionURIsAction = class extends Action2 {
  constructor() {
    super({
      id: "workbench.extensions.action.manageAuthorizedExtensionURIs",
      title: localize2(23016, "Manage Authorized Extension URIs..."),
      category: localize2(23014, "Extensions"),
      menu: {
        id: MenuId.CommandPalette,
        when: IsWebContext.toNegated()
      }
    });
  }
  async run(accessor) {
    const storageService = accessor.get(IStorageService);
    const quickInputService = accessor.get(IQuickInputService);
    const storage = new UserTrustedExtensionIdStorage(storageService);
    const items = storage.extensions.map((label3) => ({ label: label3, picked: true }));
    if (items.length === 0) {
      await quickInputService.pick([{ label: localize(23017, null) }]);
      return;
    }
    const result = await quickInputService.pick(items, { canPickMany: true });
    if (!result) {
      return;
    }
    storage.set(result.map((item) => item.label));
  }
};

registerAction2(ManageAuthorizedExtensionURIsAction);
export { isExtensionId, FIVE_MINUTES, THIRTY_SECONDS, URL_TO_HANDLE, USER_TRUSTED_EXTENSIONS_CONFIGURATION_KEY, USER_TRUSTED_EXTENSIONS_STORAGE_KEY, UserTrustedExtensionIdStorage, IExtensionUrlHandler, ExtensionUrlHandlerOverrideRegistry, ExtensionUrlHandler, ExtensionUrlBootstrapHandler, ManageAuthorizedExtensionURIsAction };
