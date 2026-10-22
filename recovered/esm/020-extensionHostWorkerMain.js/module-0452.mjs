// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/worker/extensionHostWorkerMain.js
// Original module marker: src/vs/workbench/api/worker/extHostExtensionService.ts
import { RequireInterceptor } from "./module-0449.mjs";
import { AbstractExtHostExtensionService } from "./module-0282.mjs";
import { ExtHostConsoleForwarder } from "./module-0451.mjs";
import { createApiFactoryAndRegisterActors } from "./module-0448.mjs";
import { URI } from "./module-0023.mjs";
import { timeout } from "./module-0034.mjs";
import { extname } from "./module-0022.mjs";


// src/vs/workbench/api/worker/extHostExtensionService.ts
var WorkerRequireInterceptor = class extends RequireInterceptor {
  _installInterceptor() {
  }
  getModule(request, parent) {
    for (const alternativeModuleName of this._alternatives) {
      const alternative = alternativeModuleName(request);
      if (alternative) {
        request = alternative;
        break;
      }
    }
    if (this._factories.has(request)) {
      return this._factories.get(request).load(request, parent, () => {
        throw new Error("CANNOT LOAD MODULE from here.");
      });
    }
    return void 0;
  }
};

var ExtHostExtensionService = class extends AbstractExtHostExtensionService {
  constructor() {
    super(...arguments);
    this.extensionRuntime = 2 /* Webworker */;
  }
  async _beforeAlmostReadyToRunExtensions() {
    this._instaService.createInstance(ExtHostConsoleForwarder);
    const apiFactory = this._instaService.invokeFunction(createApiFactoryAndRegisterActors);
    this._fakeModules = this._instaService.createInstance(WorkerRequireInterceptor, apiFactory, { mine: this._myRegistry, all: this._globalRegistry });
    await this._fakeModules.install();
    performance.mark("code/extHost/didInitAPI");
    await this._waitForDebuggerAttachment();
  }
  _getEntryPoint(extensionDescription) {
    return extensionDescription.browser;
  }
  async _loadCommonJSModule(extension, module2, activationTimesBuilder) {
    module2 = module2.with({ path: ensureSuffix(module2.path, ".js") });
    const extensionId = extension?.identifier.value;
    if (extensionId) {
      performance.mark(`code/extHost/willFetchExtensionCode/${extensionId}`);
    }
    const browserUri = URI.revive(await this._mainThreadExtensionsProxy.$asBrowserUri(module2));
    const response = await fetch(browserUri.toString(true));
    if (extensionId) {
      performance.mark(`code/extHost/didFetchExtensionCode/${extensionId}`);
    }
    if (response.status !== 200) {
      throw new Error(response.statusText);
    }
    const source = await response.text();
    const sourceURL = `${module2.toString(true)}#vscode-extension`;
    const fullSource = `${source}
//# sourceURL=${sourceURL}`;
    let initFn;
    try {
      initFn = new Function("module", "exports", "require", fullSource);
    } catch (err) {
      if (extensionId) {
        console.error(`Loading code for extension ${extensionId} failed: ${err.message}`);
      } else {
        console.error(`Loading code failed: ${err.message}`);
      }
      console.error(`${module2.toString(true)}${typeof err.line === "number" ? ` line ${err.line}` : ""}${typeof err.column === "number" ? ` column ${err.column}` : ""}`);
      console.error(err);
      throw err;
    }
    if (extension) {
      await this._extHostLocalizationService.initializeLocalizedMessages(extension);
    }
    const _exports = {};
    const _module = { exports: _exports };
    const _require = (request) => {
      const result = this._fakeModules.getModule(request, module2);
      if (result === void 0) {
        throw new Error(`Cannot load module '${request}'`);
      }
      return result;
    };
    try {
      activationTimesBuilder.codeLoadingStart();
      if (extensionId) {
        performance.mark(`code/extHost/willLoadExtensionCode/${extensionId}`);
      }
      initFn(_module, _exports, _require);
      return _module.exports !== _exports ? _module.exports : _exports;
    } finally {
      if (extensionId) {
        performance.mark(`code/extHost/didLoadExtensionCode/${extensionId}`);
      }
      activationTimesBuilder.codeLoadingStop();
    }
  }
  _loadESMModule(extension, module2, activationTimesBuilder) {
    throw new Error("ESM modules are not supported in the web worker extension host");
  }
  async $setRemoteEnvironment(_env) {
    return;
  }
  async _waitForDebuggerAttachment(waitTimeout = 5e3) {
    if (!this._initData.environment.isExtensionDevelopmentDebug) {
      return;
    }
    const deadline = Date.now() + waitTimeout;
    while (Date.now() < deadline && !("__jsDebugIsReady" in globalThis)) {
      await timeout(10);
    }
  }
};

function ensureSuffix(path, suffix) {
  const extName = extname(path);
  return extName ? path : path + suffix;
}
export { ensureSuffix, WorkerRequireInterceptor, ExtHostExtensionService };
