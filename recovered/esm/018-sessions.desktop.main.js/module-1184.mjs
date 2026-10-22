// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/api/browser/mainThreadExtensionService.ts
import { ExtHostContext, MainContext } from "./module-0922.mjs";
import { transformErrorFromSerialization } from "./module-0004.mjs";
import { areSameExtensions } from "./module-0888.mjs";
import { severity_default } from "./module-0266.mjs";
import { localize } from "./module-0001.mjs";
import { toAction } from "./module-0082.mjs";
import { CancellationToken } from "./module-0025.mjs";
import { FileAccess } from "./module-0033.mjs";
import { URI } from "./module-0032.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { extHostNamedCustomer } from "./module-0920.mjs";
import { IExtensionService } from "./module-0889.mjs";
import { INotificationService } from "./module-0336.mjs";
import { IExtensionsWorkbenchService } from "./module-1023.mjs";
import { IHostService } from "./module-1118.mjs";
import { IWorkbenchExtensionEnablementService } from "./module-1047.mjs";
import { ITimerService } from "./module-1183.mjs";
import { ICommandService } from "./module-0087.mjs";
import { IWorkbenchEnvironmentService } from "./module-0936.mjs";
import { ManagedRemoteConnection, WebSocketRemoteConnection } from "./module-0896.mjs";


// src/vs/workbench/api/browser/mainThreadExtensionService.ts
var MainThreadExtensionService = class {
  constructor(extHostContext, _extensionService, _notificationService, _extensionsWorkbenchService, _hostService, _extensionEnablementService, _timerService, _commandService, _environmentService) {
    this._extensionService = _extensionService;
    this._notificationService = _notificationService;
    this._extensionsWorkbenchService = _extensionsWorkbenchService;
    this._hostService = _hostService;
    this._extensionEnablementService = _extensionEnablementService;
    this._timerService = _timerService;
    this._commandService = _commandService;
    this._environmentService = _environmentService;
    this._extensionHostKind = extHostContext.extensionHostKind;
    const internalExtHostContext = extHostContext;
    this._internalExtensionService = internalExtHostContext.internalExtensionService;
    internalExtHostContext._setExtensionHostProxy(
      new ExtensionHostProxy(extHostContext.getProxy(ExtHostContext.ExtHostExtensionService))
    );
    internalExtHostContext._setAllMainProxyIdentifiers(Object.keys(MainContext).map((key3) => MainContext[key3]));
  }
  dispose() {
  }
  $getExtension(extensionId) {
    return this._extensionService.getExtension(extensionId);
  }
  $activateExtension(extensionId, reason) {
    return this._internalExtensionService._activateById(extensionId, reason);
  }
  async $onWillActivateExtension(extensionId) {
    this._internalExtensionService._onWillActivateExtension(extensionId);
  }
  $onDidActivateExtension(extensionId, codeLoadingTime, activateCallTime, activateResolvedTime, activationReason) {
    this._internalExtensionService._onDidActivateExtension(extensionId, codeLoadingTime, activateCallTime, activateResolvedTime, activationReason);
  }
  $onExtensionRuntimeError(extensionId, data) {
    const error = transformErrorFromSerialization(data);
    this._internalExtensionService._onExtensionRuntimeError(extensionId, error);
    console.error(`[${extensionId.value}]${error.message}`);
    console.error(error.stack);
  }
  async $onExtensionActivationError(extensionId, data, missingExtensionDependency) {
    const error = transformErrorFromSerialization(data);
    this._internalExtensionService._onDidActivateExtensionError(extensionId, error);
    if (missingExtensionDependency) {
      const extension = await this._extensionService.getExtension(extensionId.value);
      if (extension) {
        const local = await this._extensionsWorkbenchService.queryLocal();
        const installedDependency = local.find((i2) => areSameExtensions(i2.identifier, { id: missingExtensionDependency.dependency }));
        if (installedDependency?.local) {
          await this._handleMissingInstalledDependency(extension, installedDependency.local);
          return;
        } else {
          await this._handleMissingNotInstalledDependency(extension, missingExtensionDependency.dependency);
          return;
        }
      }
    }
    const isDev = !this._environmentService.isBuilt || this._environmentService.isExtensionDevelopment;
    if (isDev) {
      this._notificationService.error(error);
      return;
    }
    console.error(error.message);
  }
  async _handleMissingInstalledDependency(extension, missingInstalledDependency) {
    const extName = extension.displayName || extension.name;
    if (this._extensionEnablementService.isEnabled(missingInstalledDependency)) {
      this._notificationService.notify({
        severity: severity_default.Error,
        message: localize(5688, null, extName, missingInstalledDependency.manifest.displayName || missingInstalledDependency.manifest.name),
        actions: {
          primary: [toAction({ id: "reload", label: localize(5687, null), run: () => this._hostService.reload() })]
        }
      });
    } else {
      const enablementState = this._extensionEnablementService.getEnablementState(missingInstalledDependency);
      if (enablementState === 5 /* DisabledByVirtualWorkspace */) {
        this._notificationService.notify({
          severity: severity_default.Error,
          message: localize(5686, null, extName, missingInstalledDependency.manifest.displayName || missingInstalledDependency.manifest.name)
        });
      } else if (enablementState === 0 /* DisabledByTrustRequirement */) {
        this._notificationService.notify({
          severity: severity_default.Error,
          message: localize(5689, null, extName, missingInstalledDependency.manifest.displayName || missingInstalledDependency.manifest.name),
          actions: {
            primary: [toAction({ id: "manageWorkspaceTrust", label: localize(5685, null), run: () => this._commandService.executeCommand("workbench.trust.manage") })]
          }
        });
      } else if (this._extensionEnablementService.canChangeEnablement(missingInstalledDependency)) {
        this._notificationService.notify({
          severity: severity_default.Error,
          message: localize(5681, null, extName, missingInstalledDependency.manifest.displayName || missingInstalledDependency.manifest.name),
          actions: {
            primary: [toAction({
              id: "enable",
              label: localize(5683, null),
              enabled: true,
              run: () => this._extensionEnablementService.setEnablement([missingInstalledDependency], enablementState === 10 /* DisabledGlobally */ ? 12 /* EnabledGlobally */ : 13 /* EnabledWorkspace */).then(() => this._hostService.reload(), (e4) => this._notificationService.error(e4))
            })]
          }
        });
      } else {
        this._notificationService.notify({
          severity: severity_default.Error,
          message: localize(5682, null, extName, missingInstalledDependency.manifest.displayName || missingInstalledDependency.manifest.name)
        });
      }
    }
  }
  async _handleMissingNotInstalledDependency(extension, missingDependency) {
    const extName = extension.displayName || extension.name;
    let dependencyExtension = null;
    try {
      dependencyExtension = (await this._extensionsWorkbenchService.getExtensions([{ id: missingDependency }], CancellationToken.None))[0];
    } catch (err) {
    }
    if (dependencyExtension) {
      this._notificationService.notify({
        severity: severity_default.Error,
        message: localize(5690, null, extName, dependencyExtension.displayName, dependencyExtension.publisherDisplayName),
        actions: {
          primary: [toAction({
            id: "install",
            label: localize(5684, null),
            run: () => this._extensionsWorkbenchService.install(dependencyExtension).then(() => this._hostService.reload(), (e4) => this._notificationService.error(e4))
          })]
        }
      });
    } else {
      this._notificationService.error(localize(5691, null, extName, missingDependency));
    }
  }
  async $setPerformanceMarks(marks) {
    if (this._extensionHostKind === 1 /* LocalProcess */) {
      this._timerService.setPerformanceMarks("localExtHost", marks);
    } else if (this._extensionHostKind === 2 /* LocalWebWorker */) {
      this._timerService.setPerformanceMarks("workerExtHost", marks);
    } else {
      this._timerService.setPerformanceMarks("remoteExtHost", marks);
    }
  }
  async $asBrowserUri(uri4) {
    return FileAccess.uriToBrowserUri(URI.revive(uri4));
  }
};

MainThreadExtensionService = __decorateClass([
  extHostNamedCustomer(MainContext.MainThreadExtensionService),
  __decorateParam(1, IExtensionService),
  __decorateParam(2, INotificationService),
  __decorateParam(3, IExtensionsWorkbenchService),
  __decorateParam(4, IHostService),
  __decorateParam(5, IWorkbenchExtensionEnablementService),
  __decorateParam(6, ITimerService),
  __decorateParam(7, ICommandService),
  __decorateParam(8, IWorkbenchEnvironmentService)
], MainThreadExtensionService);

var ExtensionHostProxy = class {
  constructor(_actual) {
    this._actual = _actual;
  }
  async resolveAuthority(remoteAuthority, resolveAttempt) {
    const resolved = reviveResolveAuthorityResult(await this._actual.$resolveAuthority(remoteAuthority, resolveAttempt));
    return resolved;
  }
  async getCanonicalURI(remoteAuthority, uri4) {
    const uriComponents = await this._actual.$getCanonicalURI(remoteAuthority, uri4);
    return uriComponents ? URI.revive(uriComponents) : uriComponents;
  }
  startExtensionHost(extensionsDelta) {
    return this._actual.$startExtensionHost(extensionsDelta);
  }
  extensionTestsExecute() {
    return this._actual.$extensionTestsExecute();
  }
  activateByEvent(activationEvent, activationKind) {
    return this._actual.$activateByEvent(activationEvent, activationKind);
  }
  activate(extensionId, reason) {
    return this._actual.$activate(extensionId, reason);
  }
  setRemoteEnvironment(env2) {
    return this._actual.$setRemoteEnvironment(env2);
  }
  updateRemoteConnectionData(connectionData) {
    return this._actual.$updateRemoteConnectionData(connectionData);
  }
  deltaExtensions(extensionsDelta) {
    return this._actual.$deltaExtensions(extensionsDelta);
  }
  test_latency(n2) {
    return this._actual.$test_latency(n2);
  }
  test_up(b) {
    return this._actual.$test_up(b);
  }
  test_down(size3) {
    return this._actual.$test_down(size3);
  }
};

function reviveResolveAuthorityResult(result) {
  if (result.type === "ok") {
    return {
      type: "ok",
      value: {
        ...result.value,
        authority: reviveResolvedAuthority(result.value.authority)
      }
    };
  } else {
    return result;
  }
}

function reviveResolvedAuthority(resolvedAuthority) {
  return {
    ...resolvedAuthority,
    connectTo: reviveConnection(resolvedAuthority.connectTo)
  };
}

function reviveConnection(connection) {
  if (connection.type === 0 /* WebSocket */) {
    return new WebSocketRemoteConnection(connection.host, connection.port);
  }
  return new ManagedRemoteConnection(connection.id);
}
export { reviveResolveAuthorityResult, reviveResolvedAuthority, reviveConnection, MainThreadExtensionService, ExtensionHostProxy };
