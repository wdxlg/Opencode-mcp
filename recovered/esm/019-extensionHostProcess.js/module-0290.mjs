// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/node/extensionHostProcess.js
// Original module marker: src/vs/workbench/api/common/extensionHostMain.ts
import { ILogService } from "./module-0062.mjs";
import { ExtHostRpcService, IExtHostRpcService } from "./module-0069.mjs";
import { MainContext } from "./module-0054.mjs";
import { PendingMigrationError, errorHandler, setUnexpectedErrorHandler, transformErrorForSerialization } from "./module-0003.mjs";
import { IExtHostExtensionService, IHostUtils } from "./module-0288.mjs";
import { IExtHostTelemetry } from "./module-0267.mjs";
import { IExtHostApiDeprecationService } from "./module-0289.mjs";
import { URI } from "./module-0025.mjs";
import { ExtensionError } from "./module-0059.mjs";
import { RPCProtocol } from "./module-0057.mjs";
import { ServiceCollection } from "./module-0065.mjs";
import { getSingletonServiceDescriptors } from "./module-0064.mjs";
import { IExtHostInitDataService } from "./module-0066.mjs";
import { IURITransformerService, URITransformerService } from "./module-0070.mjs";
import { InstantiationService } from "./module-0068.mjs";
import { mark } from "./module-0032.mjs";


// src/vs/workbench/api/common/extensionHostMain.ts
var ErrorHandler2 = class {
  static async installEarlyHandler(accessor) {
    Error.stackTraceLimit = 100;
    const logService = accessor.get(ILogService);
    const rpcService = accessor.get(IExtHostRpcService);
    const mainThreadErrors = rpcService.getProxy(MainContext.MainThreadErrors);
    setUnexpectedErrorHandler((err) => {
      logService.error(err);
      const data = transformErrorForSerialization(err);
      mainThreadErrors.$onUnexpectedError(data);
    });
  }
  static async installFullHandler(accessor) {
    const logService = accessor.get(ILogService);
    const rpcService = accessor.get(IExtHostRpcService);
    const extensionService = accessor.get(IExtHostExtensionService);
    const extensionTelemetry = accessor.get(IExtHostTelemetry);
    const apiDeprecationService = accessor.get(IExtHostApiDeprecationService);
    const mainThreadExtensions = rpcService.getProxy(MainContext.MainThreadExtensionService);
    const mainThreadErrors = rpcService.getProxy(MainContext.MainThreadErrors);
    const extensionsRegistry = await extensionService.getExtensionRegistry();
    const extensionsMap = await extensionService.getExtensionPathIndex();
    const extensionErrors = /* @__PURE__ */ new WeakMap();
    function prepareStackTraceAndFindExtension(error, stackTrace) {
      if (extensionErrors.has(error)) {
        return extensionErrors.get(error).stack;
      }
      let stackTraceMessage = "";
      let extension;
      let fileName;
      for (const call of stackTrace) {
        stackTraceMessage += `
	at ${call.toString()}`;
        fileName = call.getFileName();
        if (!extension && fileName) {
          extension = extensionsMap.findSubstr(URI.file(fileName));
        }
      }
      const result = `${error.name || "Error"}: ${error.message || ""}${stackTraceMessage}`;
      extensionErrors.set(error, { extensionIdentifier: extension?.identifier, stack: result });
      return result;
    }
    const _wasWrapped = /* @__PURE__ */ Symbol("prepareStackTrace wrapped");
    let _prepareStackTrace = prepareStackTraceAndFindExtension;
    Object.defineProperty(Error, "prepareStackTrace", {
      configurable: false,
      get() {
        return _prepareStackTrace;
      },
      set(v) {
        if (v === prepareStackTraceAndFindExtension || !v || v[_wasWrapped]) {
          _prepareStackTrace = v || prepareStackTraceAndFindExtension;
          return;
        }
        _prepareStackTrace = function(error, stackTrace) {
          prepareStackTraceAndFindExtension(error, stackTrace);
          return v.call(Error, error, stackTrace);
        };
        Object.assign(_prepareStackTrace, { [_wasWrapped]: true });
      }
    });
    setUnexpectedErrorHandler((err) => {
      if (!PendingMigrationError.is(err)) {
        logService.error(err);
      }
      const errorData = transformErrorForSerialization(err);
      let extension;
      if (err instanceof ExtensionError) {
        extension = err.extension;
      } else {
        const stackData = extensionErrors.get(err);
        extension = stackData?.extensionIdentifier;
      }
      if (!extension) {
        return;
      }
      if (PendingMigrationError.is(err)) {
        const extensionDesc = extensionsRegistry.getExtensionDescription(extension);
        if (extensionDesc) {
          apiDeprecationService.report(err.name, extensionDesc, `${err.message}
 FROM: ${err.stack}`);
        }
      } else {
        mainThreadExtensions.$onExtensionRuntimeError(extension, errorData);
        const reported = extensionTelemetry.onExtensionError(extension, err);
        logService.trace("forwarded error to extension?", reported, extension);
      }
    });
    errorHandler.addListener((err) => {
      mainThreadErrors.$onUnexpectedError(err);
    });
  }
};

var ExtensionHostMain = class _ExtensionHostMain {
  constructor(protocol, initData, hostUtils, uriTransformer, messagePorts) {
    this._hostUtils = hostUtils;
    this._rpcProtocol = new RPCProtocol(protocol, null, uriTransformer);
    initData = _ExtensionHostMain._transform(initData, this._rpcProtocol);
    const services = new ServiceCollection(...getSingletonServiceDescriptors());
    services.set(IExtHostInitDataService, { _serviceBrand: void 0, ...initData, messagePorts });
    services.set(IExtHostRpcService, new ExtHostRpcService(this._rpcProtocol));
    services.set(IURITransformerService, new URITransformerService(uriTransformer));
    services.set(IHostUtils, hostUtils);
    const instaService = new InstantiationService(services, true);
    instaService.invokeFunction(ErrorHandler2.installEarlyHandler);
    this._logService = instaService.invokeFunction((accessor) => accessor.get(ILogService));
    mark(`code/extHost/didCreateServices`);
    if (this._hostUtils.pid) {
      this._logService.info(`Extension host with pid ${this._hostUtils.pid} started`);
    } else {
      this._logService.info(`Extension host started`);
    }
    this._logService.trace("initData", initData);
    this._extensionService = instaService.invokeFunction((accessor) => accessor.get(IExtHostExtensionService));
    this._extensionService.initialize();
    instaService.invokeFunction(ErrorHandler2.installFullHandler);
  }
  async asBrowserUri(uri2) {
    const mainThreadExtensionsProxy = this._rpcProtocol.getProxy(MainContext.MainThreadExtensionService);
    return URI.revive(await mainThreadExtensionsProxy.$asBrowserUri(uri2));
  }
  terminate(reason) {
    this._extensionService.terminate(reason);
  }
  static _transform(initData, rpcProtocol) {
    initData.extensions.allExtensions.forEach((ext) => {
      ext.extensionLocation = URI.revive(rpcProtocol.transformIncomingURIs(ext.extensionLocation));
    });
    initData.environment.appRoot = URI.revive(rpcProtocol.transformIncomingURIs(initData.environment.appRoot));
    const extDevLocs = initData.environment.extensionDevelopmentLocationURI;
    if (extDevLocs) {
      initData.environment.extensionDevelopmentLocationURI = extDevLocs.map((url) => URI.revive(rpcProtocol.transformIncomingURIs(url)));
    }
    initData.environment.extensionTestsLocationURI = URI.revive(rpcProtocol.transformIncomingURIs(initData.environment.extensionTestsLocationURI));
    initData.environment.globalStorageHome = URI.revive(rpcProtocol.transformIncomingURIs(initData.environment.globalStorageHome));
    initData.environment.workspaceStorageHome = URI.revive(rpcProtocol.transformIncomingURIs(initData.environment.workspaceStorageHome));
    initData.nlsBaseUrl = URI.revive(rpcProtocol.transformIncomingURIs(initData.nlsBaseUrl));
    initData.logsLocation = URI.revive(rpcProtocol.transformIncomingURIs(initData.logsLocation));
    initData.workspace = rpcProtocol.transformIncomingURIs(initData.workspace);
    return initData;
  }
};
export { ErrorHandler2, ExtensionHostMain };
