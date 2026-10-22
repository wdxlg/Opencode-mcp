// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/services/localTranscription/electron-browser/localTranscriptionService.ts
import { arch, platform2 } from "./module-0015.mjs";
import { ProxyChannel, getDelayedChannel } from "./module-1230.mjs";
import { ILocalTranscriptionService, localTranscriptionChannelName } from "./module-1341.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IUtilityProcessWorkerWorkbenchService } from "./module-3733.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IProductService } from "./module-0873.mjs";
import { registerSingleton } from "./module-0135.mjs";


// src/vs/workbench/services/localTranscription/electron-browser/localTranscriptionService.ts
var SUPPORTED_TARGETS = /* @__PURE__ */ new Set([
  "darwin-arm64",
  "linux-x64",
  "linux-arm64",
  "win32-x64",
  "win32-arm64"
]);

function isOnDeviceTranscriptionSupported() {
  return !!platform2 && !!arch && SUPPORTED_TARGETS.has(`${platform2}-${arch}`);
}

var LocalTranscriptionService = class {
  constructor(utilityProcessWorkerWorkbenchService, configurationService, productService) {
    this.utilityProcessWorkerWorkbenchService = utilityProcessWorkerWorkbenchService;
    this.configurationService = configurationService;
    this.productService = productService;
    this.isSupported = isOnDeviceTranscriptionSupported();
  }
  _getChannel() {
    if (!this._channel) {
      this._channel = getDelayedChannel((async () => {
        const { client } = await this.utilityProcessWorkerWorkbenchService.createWorker({
          moduleId: "vs/platform/localTranscription/node/localTranscriptionMain",
          type: "localTranscription",
          name: "local-transcription",
          // The on-device dictation runtime is downloaded from our CDN and its
          // native addon (foundry_local_napi.node) is signed by a third party,
          // so on macOS it must load in the plugin helper (library validation
          // disabled) to avoid a Team ID mismatch dlopen failure.
          allowLoadingUnsignedLibraries: true
        });
        return client.getChannel(localTranscriptionChannelName);
      })());
    }
    return this._channel;
  }
  _getProxy() {
    if (!this._proxy) {
      this._proxy = ProxyChannel.toService(this._getChannel(), { disableMarshalling: true });
    }
    return this._proxy;
  }
  get onDidChangeModelStatus() {
    return this._getProxy().onDidChangeModelStatus;
  }
  get onDidTranscribe() {
    return this._getProxy().onDidTranscribe;
  }
  getModelStatus() {
    return this._getProxy().getModelStatus();
  }
  importModel(options3) {
    return this._getProxy().importModel(options3);
  }
  start(options3) {
    const { proxyUrl, noProxy, proxyStrictSSL, proxyAuthorization } = this._resolveProxyConfig();
    const runtime = this.productService.dictationRuntime;
    return this._getProxy().start({
      cacheDir: options3.cacheDir,
      model: options3.model,
      language: options3.language,
      proxyUrl,
      noProxy,
      proxyStrictSSL,
      proxyAuthorization,
      runtimeUrlTemplate: runtime?.urlTemplate,
      runtimeVersion: runtime?.version
    });
  }
  pushAudio(chunk) {
    return this._getProxy().pushAudio(chunk);
  }
  stop() {
    return this._getProxy().stop();
  }
  cancel() {
    return this._getProxy().cancel();
  }
  /**
   * Read VS Code's `http.proxy`/`http.noProxy`/`http.proxyStrictSSL`/
   * `http.proxyAuthorization` settings so the utility process can honor a proxy
   * configured only in VS Code (not in the OS environment). Returns empty values
   * when unset, in which case the process's inherited environment proxy still
   * applies and TLS verification stays on.
   */
  _resolveProxyConfig() {
    const proxyUrl = this.configurationService.getValue("http.proxy")?.trim() || void 0;
    const noProxyList = this.configurationService.getValue("http.noProxy");
    const noProxy = Array.isArray(noProxyList) && noProxyList.length ? noProxyList.join(",") : void 0;
    const strictSSL = this.configurationService.getValue("http.proxyStrictSSL");
    const proxyStrictSSL = strictSSL === false ? false : void 0;
    const proxyAuthorization = this.configurationService.getValue("http.proxyAuthorization")?.trim() || void 0;
    return { proxyUrl, noProxy, proxyStrictSSL, proxyAuthorization };
  }
};

LocalTranscriptionService = __decorateClass([
  __decorateParam(0, IUtilityProcessWorkerWorkbenchService),
  __decorateParam(1, IConfigurationService),
  __decorateParam(2, IProductService)
], LocalTranscriptionService);

registerSingleton(ILocalTranscriptionService, LocalTranscriptionService, 1 /* Delayed */);
export { isOnDeviceTranscriptionSupported, SUPPORTED_TARGETS, LocalTranscriptionService };
