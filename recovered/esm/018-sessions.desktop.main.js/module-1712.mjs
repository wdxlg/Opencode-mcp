// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/services/textMate/browser/backgroundTokenization/threadedBackgroundTokenizerFactory.ts
import { DisposableStore, toDisposable } from "./module-0012.mjs";
import { TextMateWorkerTokenizerController } from "./module-1711.mjs";
import { FileAccess, nodeModulesAsarPath, nodeModulesPath } from "./module-0033.mjs";
import { isWeb } from "./module-0014.mjs";
import { WebWorkerDescriptor } from "./module-0160.mjs";
import { TextMateWorkerHost } from "./module-1709.mjs";
import { URI } from "./module-0032.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IExtensionResourceLoaderService } from "./module-0893.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { ILanguageService } from "./module-0133.mjs";
import { IEnvironmentService } from "./module-0508.mjs";
import { INotificationService } from "./module-0336.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { IWebWorkerService } from "./module-0161.mjs";


// src/vs/workbench/services/textMate/browser/backgroundTokenization/threadedBackgroundTokenizerFactory.ts
var ThreadedBackgroundTokenizerFactory = class {
  constructor(_reportTokenizationTime, _shouldTokenizeAsync, _extensionResourceLoaderService, _configurationService, _languageService, _environmentService, _notificationService, _telemetryService, _webWorkerService) {
    this._reportTokenizationTime = _reportTokenizationTime;
    this._shouldTokenizeAsync = _shouldTokenizeAsync;
    this._extensionResourceLoaderService = _extensionResourceLoaderService;
    this._configurationService = _configurationService;
    this._languageService = _languageService;
    this._environmentService = _environmentService;
    this._notificationService = _notificationService;
    this._telemetryService = _telemetryService;
    this._webWorkerService = _webWorkerService;
    this._workerProxyPromise = null;
    this._worker = null;
    this._workerProxy = null;
    this._workerTokenizerControllers = /* @__PURE__ */ new Map();
    this._currentTheme = null;
    this._currentTokenColorMap = null;
    this._grammarDefinitions = [];
  }
  static {
    this._reportedMismatchingTokens = false;
  }
  dispose() {
    this._disposeWorker();
  }
  // Will be recreated after worker is disposed (because tokenizer is re-registered when languages change)
  createBackgroundTokenizer(textModel, tokenStore, maxTokenizationLineLength) {
    if (!this._shouldTokenizeAsync() || textModel.isTooLargeForSyncing()) {
      return void 0;
    }
    const store = new DisposableStore();
    const controllerContainer = this._getWorkerProxy().then((workerProxy) => {
      if (store.isDisposed || !workerProxy) {
        return void 0;
      }
      const controllerContainer2 = { controller: void 0, worker: this._worker };
      store.add(keepAliveWhenAttached(textModel, () => {
        const controller = new TextMateWorkerTokenizerController(textModel, workerProxy, this._languageService.languageIdCodec, tokenStore, this._configurationService, maxTokenizationLineLength);
        controllerContainer2.controller = controller;
        this._workerTokenizerControllers.set(controller.controllerId, controller);
        return toDisposable(() => {
          controllerContainer2.controller = void 0;
          this._workerTokenizerControllers.delete(controller.controllerId);
          controller.dispose();
        });
      }));
      return controllerContainer2;
    });
    return {
      dispose() {
        store.dispose();
      },
      requestTokens: async (startLineNumber, endLineNumberExclusive) => {
        const container2 = await controllerContainer;
        if (container2?.controller && container2.worker === this._worker) {
          container2.controller.requestTokens(startLineNumber, endLineNumberExclusive);
        }
      },
      reportMismatchingTokens: (lineNumber) => {
        if (ThreadedBackgroundTokenizerFactory._reportedMismatchingTokens) {
          return;
        }
        ThreadedBackgroundTokenizerFactory._reportedMismatchingTokens = true;
        this._notificationService.error({
          message: "Async Tokenization Token Mismatch in line " + lineNumber,
          name: "Async Tokenization Token Mismatch"
        });
        this._telemetryService.publicLog2("asyncTokenizationMismatchingTokens", {});
      }
    };
  }
  setGrammarDefinitions(grammarDefinitions) {
    this._grammarDefinitions = grammarDefinitions;
    this._disposeWorker();
  }
  acceptTheme(theme, colorMap) {
    this._currentTheme = theme;
    this._currentTokenColorMap = colorMap;
    if (this._currentTheme && this._currentTokenColorMap && this._workerProxy) {
      this._workerProxy.$acceptTheme(this._currentTheme, this._currentTokenColorMap);
    }
  }
  _getWorkerProxy() {
    if (!this._workerProxyPromise) {
      this._workerProxyPromise = this._createWorkerProxy();
    }
    return this._workerProxyPromise;
  }
  async _createWorkerProxy() {
    const onigurumaModuleLocation = `${nodeModulesPath}/vscode-oniguruma`;
    const onigurumaModuleLocationAsar = `${nodeModulesAsarPath}/vscode-oniguruma`;
    const useAsar = this._environmentService.isBuilt && !isWeb;
    const onigurumaLocation = useAsar ? onigurumaModuleLocationAsar : onigurumaModuleLocation;
    const onigurumaWASM = `${onigurumaLocation}/release/onig.wasm`;
    const createData = {
      grammarDefinitions: this._grammarDefinitions,
      onigurumaWASMUri: FileAccess.asBrowserUri(onigurumaWASM).toString(true)
    };
    const worker = this._worker = this._webWorkerService.createWorkerClient(
      new WebWorkerDescriptor({
        esmModuleLocation: FileAccess.asBrowserUri("vs/workbench/services/textMate/browser/backgroundTokenization/worker/textMateTokenizationWorker.workerMain.js"),
        label: "TextMateWorker"
      })
    );
    TextMateWorkerHost.setChannel(worker, {
      $readFile: async (_resource) => {
        const resource = URI.revive(_resource);
        return this._extensionResourceLoaderService.readExtensionResource(resource);
      },
      $setTokensAndStates: async (controllerId, versionId, tokens, fontTokens, lineEndStateDeltas) => {
        const controller = this._workerTokenizerControllers.get(controllerId);
        if (controller) {
          controller.setTokensAndStates(controllerId, versionId, tokens, fontTokens, lineEndStateDeltas);
        }
      },
      $reportTokenizationTime: (timeMs, languageId, sourceExtensionId, lineLength, isRandomSample) => {
        this._reportTokenizationTime(timeMs, languageId, sourceExtensionId, lineLength, isRandomSample);
      }
    });
    await worker.proxy.$init(createData);
    if (this._worker !== worker) {
      return null;
    }
    this._workerProxy = worker.proxy;
    if (this._currentTheme && this._currentTokenColorMap) {
      this._workerProxy.$acceptTheme(this._currentTheme, this._currentTokenColorMap);
    }
    return worker.proxy;
  }
  _disposeWorker() {
    for (const controller of this._workerTokenizerControllers.values()) {
      controller.dispose();
    }
    this._workerTokenizerControllers.clear();
    if (this._worker) {
      this._worker.dispose();
      this._worker = null;
    }
    this._workerProxy = null;
    this._workerProxyPromise = null;
  }
};

ThreadedBackgroundTokenizerFactory = __decorateClass([
  __decorateParam(2, IExtensionResourceLoaderService),
  __decorateParam(3, IConfigurationService),
  __decorateParam(4, ILanguageService),
  __decorateParam(5, IEnvironmentService),
  __decorateParam(6, INotificationService),
  __decorateParam(7, ITelemetryService),
  __decorateParam(8, IWebWorkerService)
], ThreadedBackgroundTokenizerFactory);

function keepAliveWhenAttached(textModel, factory) {
  const disposableStore = new DisposableStore();
  const subStore = disposableStore.add(new DisposableStore());
  function checkAttached() {
    if (textModel.isAttachedToEditor()) {
      subStore.add(factory());
    } else {
      subStore.clear();
    }
  }
  checkAttached();
  disposableStore.add(textModel.onDidChangeAttached(() => {
    checkAttached();
  }));
  return disposableStore;
}
export { keepAliveWhenAttached, ThreadedBackgroundTokenizerFactory };
