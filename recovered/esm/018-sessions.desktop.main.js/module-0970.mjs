// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/api/browser/mainThreadLanguageModels.ts
import { Disposable, DisposableMap, DisposableStore, toDisposable } from "./module-0012.mjs";
import { CancellationTokenSource } from "./module-0025.mjs";
import { Emitter, Event2 } from "./module-0017.mjs";
import { ExtHostContext, MainContext } from "./module-0922.mjs";
import { equalSets } from "./module-0003.mjs";
import { ExtensionIdentifier } from "./module-0688.mjs";
import { AsyncIterableSource, DeferredPromise } from "./module-0036.mjs";
import { VSBuffer } from "./module-0038.mjs";
import { resizeImage } from "./module-0945.mjs";
import { CancellationError, transformErrorForSerialization, transformErrorFromSerialization } from "./module-0004.mjs";
import { SerializableObjectWithBuffers } from "./module-0921.mjs";
import { LanguageModelError } from "./module-0913.mjs";
import { toErrorMessage } from "./module-0094.mjs";
import { IAuthenticationService, INTERNAL_AUTH_PROVIDER_PREFIX } from "./module-0952.mjs";
import { localize } from "./module-0001.mjs";
import { URI } from "./module-0032.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { extHostNamedCustomer } from "./module-0920.mjs";
import { ILanguageModelsService } from "./module-0968.mjs";
import { ILogService } from "./module-0095.mjs";
import { IProductService } from "./module-0875.mjs";
import { IAuthenticationAccessService } from "./module-0969.mjs";
import { IExtensionService } from "./module-0889.mjs";
import { ILanguageModelIgnoredFilesService } from "./module-0946.mjs";


// src/vs/workbench/api/browser/mainThreadLanguageModels.ts
var RequestCancellationTokenSource = class extends Disposable {
  constructor(parent, onCancellationRequested) {
    super();
    this._source = this._register(new CancellationTokenSource(parent));
    if (onCancellationRequested) {
      this._register(this._source.token.onCancellationRequested(onCancellationRequested));
    }
  }
  get token() {
    return this._source.token;
  }
  cancel() {
    this._source.cancel();
  }
};

var MainThreadLanguageModels = class {
  constructor(extHostContext, _chatProviderService, _logService, _productService, _authenticationService, _authenticationAccessService, _extensionService, _ignoredFilesService) {
    this._chatProviderService = _chatProviderService;
    this._logService = _logService;
    this._productService = _productService;
    this._authenticationService = _authenticationService;
    this._authenticationAccessService = _authenticationAccessService;
    this._extensionService = _extensionService;
    this._ignoredFilesService = _ignoredFilesService;
    this._store = new DisposableStore();
    this._providerRegistrations = new DisposableMap();
    this._lmProviderChange = new Emitter();
    this._pendingProgress = /* @__PURE__ */ new Map();
    this._pendingCancelCTS = new DisposableMap();
    this._ignoredFileProviderRegistrations = new DisposableMap();
    this._proxy = extHostContext.getProxy(ExtHostContext.ExtHostChatProvider);
    let lastModelIds = new Set(this._chatProviderService.getLanguageModelIds());
    this._store.add(this._chatProviderService.onDidChangeLanguageModels(() => {
      const currentModelIds = new Set(this._chatProviderService.getLanguageModelIds());
      if (equalSets(lastModelIds, currentModelIds)) {
        return;
      }
      lastModelIds = currentModelIds;
      this._proxy.$onChatModelsChange();
    }));
  }
  dispose() {
    this._lmProviderChange.dispose();
    this._providerRegistrations.dispose();
    this._pendingProgress.clear();
    this._pendingCancelCTS.dispose();
    this._ignoredFileProviderRegistrations.dispose();
    this._store.dispose();
  }
  $registerLanguageModelProvider(vendor) {
    const disposables = new DisposableStore();
    try {
      disposables.add(this._chatProviderService.registerLanguageModelProvider(vendor, {
        onDidChange: Event2.filter(this._lmProviderChange.event, (e4) => e4.vendor === vendor, disposables),
        provideLanguageModelChatInfo: async (options3, token) => {
          const modelsAndIdentifiers = await this._proxy.$provideLanguageModelChatInfo(vendor, options3, token);
          const copilotExtensionId = this._productService.defaultChatAgent?.chatExtensionId;
          return modelsAndIdentifiers.map((m) => {
            if (m.metadata.auth) {
              disposables.add(this._registerAuthenticationProvider(m.metadata.extension, m.metadata.auth));
            }
            if (m.metadata.isBYOK !== void 0) {
              return m;
            }
            const isBuiltinCopilot = !!copilotExtensionId && ExtensionIdentifier.equals(m.metadata.extension, copilotExtensionId);
            return { ...m, metadata: { ...m.metadata, isBYOK: !isBuiltinCopilot } };
          });
        },
        sendChatRequest: async (modelId, messages, from, options3, token) => {
          const requestId = Math.random() * 1e6 | 0;
          const defer = new DeferredPromise();
          defer.p.catch(() => {
          });
          const stream = new AsyncIterableSource();
          try {
            this._pendingProgress.set(requestId, { defer, stream });
            const cts = new RequestCancellationTokenSource(token, () => {
              this._proxy.$cancelLanguageModelChatRequest(requestId);
            });
            this._pendingCancelCTS.set(requestId, cts);
            await Promise.all(
              messages.flatMap((msg) => msg.content).filter((part) => part.type === "image_url").map(async (part) => {
                part.value.data = VSBuffer.wrap(await resizeImage(part.value.data.buffer));
              })
            );
            if (token.isCancellationRequested) {
              this._pendingProgress.delete(requestId);
              this._pendingCancelCTS.deleteAndDispose(requestId);
              const err = new CancellationError();
              stream.reject(err);
              defer.error(err);
              return {
                result: defer.p,
                stream: stream.asyncIterable
              };
            }
            await this._proxy.$startChatRequest(modelId, requestId, from, new SerializableObjectWithBuffers(messages), options3, cts.token);
          } catch (err) {
            this._pendingProgress.delete(requestId);
            this._pendingCancelCTS.deleteAndDispose(requestId);
            throw err;
          }
          return {
            result: defer.p,
            stream: stream.asyncIterable
          };
        },
        provideTokenCount: (modelId, str, token) => {
          return this._proxy.$provideTokenLength(modelId, str, token);
        }
      }));
      this._providerRegistrations.set(vendor, disposables);
    } catch (err) {
      disposables.dispose();
      throw err;
    }
  }
  $onLMProviderChange(vendor) {
    this._lmProviderChange.fire({ vendor });
  }
  async $reportResponsePart(requestId, chunk2) {
    const data = this._pendingProgress.get(requestId);
    this._logService.trace("[LM] report response PART", Boolean(data), requestId, chunk2);
    if (data) {
      data.stream.emitOne(chunk2.value);
    }
  }
  async $reportResponseDone(requestId, err) {
    const data = this._pendingProgress.get(requestId);
    this._logService.trace("[LM] report response DONE", Boolean(data), requestId, err);
    if (data) {
      this._pendingProgress.delete(requestId);
      this._pendingCancelCTS.deleteAndDispose(requestId);
      if (err) {
        const error = LanguageModelError.tryDeserialize(err) ?? transformErrorFromSerialization(err);
        data.stream.reject(error);
        data.defer.error(error);
      } else {
        data.stream.resolve();
        data.defer.complete(void 0);
      }
    }
  }
  $unregisterProvider(vendor) {
    this._providerRegistrations.deleteAndDispose(vendor);
  }
  $cancelLanguageModelChatRequest(requestId) {
    this._pendingCancelCTS.get(requestId)?.cancel();
  }
  $selectChatModels(selector) {
    return this._chatProviderService.selectLanguageModels(selector);
  }
  async $tryStartChatRequest(extension, modelIdentifier, requestId, messages, options3, token) {
    this._logService.trace("[CHAT] request STARTED", extension.value, requestId);
    const cts = new RequestCancellationTokenSource(token);
    this._pendingCancelCTS.set(requestId, cts);
    let response;
    try {
      response = await this._chatProviderService.sendChatRequest(modelIdentifier, extension, messages.value, options3, cts.token);
    } catch (err) {
      this._logService.error("[CHAT] request FAILED", extension.value, requestId, err);
      this._pendingCancelCTS.deleteAndDispose(requestId);
      throw err;
    }
    const streaming = (async () => {
      try {
        for await (const part of response.stream) {
          this._logService.trace("[CHAT] request PART", extension.value, requestId, part);
          await this._proxy.$acceptResponsePart(requestId, new SerializableObjectWithBuffers(part));
        }
        this._logService.trace("[CHAT] request DONE", extension.value, requestId);
      } catch (err) {
        this._logService.error("[CHAT] extension request ERRORED in STREAM", toErrorMessage(err, true), extension.value, requestId);
        this._proxy.$acceptResponseDone(requestId, transformErrorForSerialization(err));
      }
    })();
    Promise.allSettled([response.result, streaming]).then(() => {
      this._logService.debug("[CHAT] extension request DONE", extension.value, requestId);
      this._pendingCancelCTS.deleteAndDispose(requestId);
      this._proxy.$acceptResponseDone(requestId, void 0);
    }, (err) => {
      this._logService.error("[CHAT] extension request ERRORED", toErrorMessage(err, true), extension.value, requestId);
      this._pendingCancelCTS.deleteAndDispose(requestId);
      this._proxy.$acceptResponseDone(requestId, transformErrorForSerialization(err));
    });
  }
  $countTokens(modelId, value2, token) {
    return this._chatProviderService.computeTokenLength(modelId, value2, token);
  }
  _registerAuthenticationProvider(extension, auth) {
    const authProviderId = INTERNAL_AUTH_PROVIDER_PREFIX + extension.value;
    if (this._authenticationService.getProviderIds().includes(authProviderId)) {
      return Disposable.None;
    }
    const accountLabel = auth.accountLabel ?? localize(5711, null);
    const disposables = new DisposableStore();
    const provider = new LanguageModelAccessAuthProvider(authProviderId, auth.providerLabel, accountLabel);
    this._authenticationService.registerAuthenticationProvider(authProviderId, provider);
    disposables.add(toDisposable(() => {
      this._authenticationService.unregisterAuthenticationProvider(authProviderId);
      provider.dispose();
    }));
    disposables.add(this._authenticationAccessService.onDidChangeExtensionSessionAccess(async (e4) => {
      const allowedExtensions = this._authenticationAccessService.readAllowedExtensions(authProviderId, accountLabel);
      const accessList = [];
      for (const allowedExtension of allowedExtensions) {
        const from = await this._extensionService.getExtension(allowedExtension.id);
        if (from) {
          accessList.push({
            from: from.identifier,
            to: extension,
            enabled: allowedExtension.allowed ?? true
          });
        }
      }
      this._proxy.$updateModelAccesslist(accessList);
    }));
    return disposables;
  }
  $fileIsIgnored(uri4, token) {
    return this._ignoredFilesService.fileIsIgnored(URI.revive(uri4), token);
  }
  $registerFileIgnoreProvider(handle2) {
    this._ignoredFileProviderRegistrations.set(handle2, this._ignoredFilesService.registerIgnoredFileProvider({
      isFileIgnored: async (uri4, token) => this._proxy.$isFileIgnored(handle2, uri4, token)
    }));
  }
  $unregisterFileIgnoreProvider(handle2) {
    this._ignoredFileProviderRegistrations.deleteAndDispose(handle2);
  }
};

MainThreadLanguageModels = __decorateClass([
  extHostNamedCustomer(MainContext.MainThreadLanguageModels),
  __decorateParam(1, ILanguageModelsService),
  __decorateParam(2, ILogService),
  __decorateParam(3, IProductService),
  __decorateParam(4, IAuthenticationService),
  __decorateParam(5, IAuthenticationAccessService),
  __decorateParam(6, IExtensionService),
  __decorateParam(7, ILanguageModelIgnoredFilesService)
], MainThreadLanguageModels);

var LanguageModelAccessAuthProvider = class {
  constructor(id2, label3, _accountLabel) {
    this.id = id2;
    this.label = label3;
    this._accountLabel = _accountLabel;
    this.supportsMultipleAccounts = false;
    // Important for updating the UI
    this._onDidChangeSessions = new Emitter();
    this.onDidChangeSessions = this._onDidChangeSessions.event;
  }
  async getSessions(scopes) {
    if (scopes === void 0 && !this._session) {
      return [];
    }
    if (this._session) {
      return [this._session];
    }
    return [await this.createSession(scopes || [])];
  }
  async createSession(scopes) {
    this._session = this._createFakeSession(scopes);
    this._onDidChangeSessions.fire({ added: [this._session], changed: [], removed: [] });
    return this._session;
  }
  removeSession(sessionId) {
    if (this._session) {
      this._onDidChangeSessions.fire({ added: [], changed: [], removed: [this._session] });
      this._session = void 0;
    }
    return Promise.resolve();
  }
  confirmation(extensionName, _recreatingSession) {
    return localize(5710, null, extensionName, this.label);
  }
  _createFakeSession(scopes) {
    return {
      id: "fake-session",
      account: {
        id: this.id,
        label: this._accountLabel
      },
      accessToken: "fake-access-token",
      scopes
    };
  }
  dispose() {
    this._onDidChangeSessions.dispose();
  }
};
export { RequestCancellationTokenSource, MainThreadLanguageModels, LanguageModelAccessAuthProvider };
