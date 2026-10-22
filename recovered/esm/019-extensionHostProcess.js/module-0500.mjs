// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/node/extensionHostProcess.js
// Original module marker: src/vs/workbench/api/node/extHostExtensionService.ts
import { RequireInterceptor } from "./module-0476.mjs";
import { DisposableStore, toDisposable } from "./module-0011.mjs";
import { URI } from "./module-0025.mjs";
import { realpathSync2 } from "./module-0033.mjs";
import { BidirectionalMap } from "./module-0007.mjs";
import { assertType } from "./module-0009.mjs";
import { generateUuid } from "./module-0040.mjs";
import { AbstractExtHostExtensionService } from "./module-0288.mjs";
import { ExtHostConsoleForwarder } from "./module-0488.mjs";
import { createApiFactoryAndRegisterActors } from "./module-0475.mjs";
import { ExtHostDownloadService } from "./module-0485.mjs";
import { CLIServer } from "./module-0486.mjs";
import { ExtHostDiskFileSystemProvider } from "./module-0499.mjs";
import { mark } from "./module-0032.mjs";
import { connectProxyResolver } from "./module-0477.mjs";
import { Schemas } from "./module-0026.mjs";


// src/vs/workbench/api/node/extHostExtensionService.ts
import nodeModule from "node:module";

var require3 = nodeModule.createRequire(import.meta.url);

var NodeModuleRequireInterceptor = class _NodeModuleRequireInterceptor extends RequireInterceptor {
  constructor() {
    super(...arguments);
    this._store = new DisposableStore();
  }
  static _createDataUri(scriptContent) {
    return `data:text/javascript;base64,${Buffer.from(scriptContent).toString("base64")}`;
  }
  static {
    this._vscodeImportFnName = `_VSCODE_IMPORT_VSCODE_API`;
  }
  dispose() {
    this._store.dispose();
  }
  _installInterceptor() {
    const that = this;
    const node_module = require3("module");
    const originalLoad = node_module._load;
    node_module._load = function load(request, parent, isMain) {
      request = applyAlternatives(request);
      if (!that._factories.has(request)) {
        return originalLoad.apply(this, arguments);
      }
      return that._factories.get(request).load(
        request,
        URI.file(realpathSync2(parent.filename)),
        (request2) => originalLoad.apply(this, [request2, parent, isMain])
      );
    };
    const originalLookup = node_module._resolveLookupPaths;
    node_module._resolveLookupPaths = (request, parent) => {
      return originalLookup.call(this, applyAlternatives(request), parent);
    };
    const originalResolveFilename = node_module._resolveFilename;
    node_module._resolveFilename = function resolveFilename(request, parent, isMain, options2) {
      if (request === "vsda" && Array.isArray(options2?.paths) && options2.paths.length === 0) {
        options2.paths = node_module._nodeModulePaths(import.meta.dirname);
      }
      return originalResolveFilename.call(this, request, parent, isMain, options2);
    };
    const applyAlternatives = (request) => {
      for (const alternativeModuleName of that._alternatives) {
        const alternative = alternativeModuleName(request);
        if (alternative) {
          request = alternative;
          break;
        }
      }
      return request;
    };
    const apiInstances = new BidirectionalMap();
    const apiImportDataUrl = /* @__PURE__ */ new Map();
    Object.defineProperty(globalThis, _NodeModuleRequireInterceptor._vscodeImportFnName, {
      enumerable: false,
      configurable: false,
      writable: false,
      value: (key) => {
        return apiInstances.getKey(key);
      }
    });
    let apiModuleFactory;
    const lookup = (url) => {
      if (!apiModuleFactory) {
        apiModuleFactory = this._factories.get("vscode");
        assertType(apiModuleFactory);
      }
      const uri2 = URI.parse(url);
      const apiInstance = apiModuleFactory.load("_not_used", uri2, () => {
        throw new Error("CANNOT LOAD MODULE from here.");
      });
      let key = apiInstances.get(apiInstance);
      if (!key) {
        key = generateUuid();
        apiInstances.set(apiInstance, key);
      }
      let scriptDataUrlSrc = apiImportDataUrl.get(key);
      if (!scriptDataUrlSrc) {
        const jsCode = `const _vscodeInstance = globalThis.${_NodeModuleRequireInterceptor._vscodeImportFnName}('${key}');

${Object.keys(apiInstance).map(((name) => `export const ${name} = _vscodeInstance['${name}'];`)).join("\n")}`;
        scriptDataUrlSrc = _NodeModuleRequireInterceptor._createDataUri(jsCode);
        apiImportDataUrl.set(key, scriptDataUrlSrc);
      }
      return scriptDataUrlSrc;
    };
    const hooks = nodeModule.registerHooks({
      resolve: (specifier, context, nextResolve) => {
        if (specifier !== "vscode" || !context.parentURL) {
          return nextResolve(specifier, context);
        }
        const otherUrl = lookup(context.parentURL);
        return {
          url: otherUrl,
          shortCircuit: true
        };
      }
    });
    this._store.add(toDisposable(() => hooks.deregister()));
  }
};

var ExtHostExtensionService = class extends AbstractExtHostExtensionService {
  constructor() {
    super(...arguments);
    this.extensionRuntime = 1 /* Node */;
  }
  async _beforeAlmostReadyToRunExtensions() {
    this._instaService.createInstance(ExtHostConsoleForwarder);
    const extensionApiFactory = this._instaService.invokeFunction(createApiFactoryAndRegisterActors);
    this._instaService.createInstance(ExtHostDownloadService);
    if (this._initData.remote.isRemote && this._initData.remote.authority) {
      const cliServer = this._instaService.createInstance(CLIServer);
      process.env["VSCODE_IPC_HOOK_CLI"] = cliServer.ipcHandlePath;
    }
    this._instaService.createInstance(ExtHostDiskFileSystemProvider);
    await this._store.add(this._instaService.createInstance(NodeModuleRequireInterceptor, extensionApiFactory, { mine: this._myRegistry, all: this._globalRegistry })).install();
    mark("code/extHost/didInitAPI");
    const configProvider = await this._extHostConfiguration.getConfigProvider();
    await connectProxyResolver(this._extHostWorkspace, configProvider, this, this._logService, this._mainThreadTelemetryProxy, this._initData, this._store);
    mark("code/extHost/didInitProxyResolver");
  }
  _getEntryPoint(extensionDescription) {
    return extensionDescription.main;
  }
  async _doLoadModule(extension, module2, activationTimesBuilder, mode) {
    if (module2.scheme !== Schemas.file) {
      throw new Error(`Cannot load URI: '${module2}', must be of file-scheme`);
    }
    let r2 = null;
    activationTimesBuilder.codeLoadingStart();
    this._logService.trace(`ExtensionService#loadModule [${mode}] -> ${module2.toString(true)}`);
    this._logService.flush();
    const extensionId = extension?.identifier.value;
    if (extension) {
      await this._extHostLocalizationService.initializeLocalizedMessages(extension);
    }
    try {
      if (extensionId) {
        mark(`code/extHost/willLoadExtensionCode/${extensionId}`);
      }
      if (mode === "esm") {
        r2 = await import(module2.toString(true));
      } else {
        r2 = require3(module2.fsPath);
      }
    } finally {
      if (extensionId) {
        mark(`code/extHost/didLoadExtensionCode/${extensionId}`);
      }
      activationTimesBuilder.codeLoadingStop();
    }
    return r2;
  }
  async _loadCommonJSModule(extension, module2, activationTimesBuilder) {
    return this._doLoadModule(extension, module2, activationTimesBuilder, "cjs");
  }
  async _loadESMModule(extension, module2, activationTimesBuilder) {
    return this._doLoadModule(extension, module2, activationTimesBuilder, "esm");
  }
  async $setRemoteEnvironment(env2) {
    if (!this._initData.remote.isRemote) {
      return;
    }
    for (const key in env2) {
      const value = env2[key];
      if (value === null) {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    }
  }
};
export { nodeModule, require3, NodeModuleRequireInterceptor, ExtHostExtensionService };
