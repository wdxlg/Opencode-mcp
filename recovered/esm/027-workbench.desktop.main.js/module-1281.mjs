// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/api/browser/mainThreadTerminalShellIntegration.ts
import { Disposable, toDisposable } from "./module-0012.mjs";
import { ExtHostContext, MainContext } from "./module-0921.mjs";
import { Event2 } from "./module-0017.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { extHostNamedCustomer } from "./module-0919.mjs";
import { ITerminalService } from "./module-1149.mjs";
import { IWorkbenchEnvironmentService } from "./module-0935.mjs";
import { IExtensionService } from "./module-0887.mjs";


// src/vs/workbench/api/browser/mainThreadTerminalShellIntegration.ts
var MainThreadTerminalShellIntegration = class extends Disposable {
  constructor(extHostContext, _terminalService, workbenchEnvironmentService, _extensionService) {
    super();
    this._terminalService = _terminalService;
    this._extensionService = _extensionService;
    this._proxy = extHostContext.getProxy(ExtHostContext.ExtHostTerminalShellIntegration);
    const instanceDataListeners = /* @__PURE__ */ new Map();
    this._register(toDisposable(() => {
      for (const listener of instanceDataListeners.values()) {
        listener.dispose();
      }
    }));
    for (const terminal2 of this._terminalService.instances) {
      const cmdDetection = terminal2.capabilities.get(2 /* CommandDetection */);
      if (cmdDetection) {
        this._enableShellIntegration(terminal2);
      }
    }
    const onDidAddCommandDetection = this._store.add(this._terminalService.createOnInstanceEvent((instance2) => {
      return Event2.map(
        instance2.capabilities.onDidAddCommandDetectionCapability,
        () => instance2
      );
    })).event;
    this._store.add(onDidAddCommandDetection((e) => this._enableShellIntegration(e)));
    const cwdChangeEvent = this._store.add(this._terminalService.createOnInstanceCapabilityEvent(0 /* CwdDetection */, (e) => e.onDidChangeCwd));
    this._store.add(cwdChangeEvent.event((e) => {
      this._proxy.$cwdChange(e.instance.instanceId, e.data);
    }));
    const envChangeEvent = this._store.add(this._terminalService.createOnInstanceCapabilityEvent(5 /* ShellEnvDetection */, (e) => e.onDidChangeEnv));
    this._store.add(envChangeEvent.event((e) => {
      if (e.data.value && typeof e.data.value === "object") {
        const envValue = e.data.value;
        const keysArr = Object.keys(envValue);
        const valuesArr = Object.values(envValue);
        this._proxy.$shellEnvChange(e.instance.instanceId, keysArr, valuesArr, e.data.isTrusted);
      }
    }));
    const commandDetectionStartEvent = this._store.add(this._terminalService.createOnInstanceCapabilityEvent(2 /* CommandDetection */, (e) => e.onCommandExecuted));
    let currentCommand;
    this._store.add(commandDetectionStartEvent.event((e) => {
      if (e.data === currentCommand) {
        return;
      }
      currentCommand = e.data;
      const instanceId = e.instance.instanceId;
      this._proxy.$shellExecutionStart(instanceId, instanceSupportsExecuteCommandApi(e.instance), e.data.command, convertToExtHostCommandLineConfidence(e.data), e.data.isTrusted, e.data.cwd);
      instanceDataListeners.get(instanceId)?.dispose();
      instanceDataListeners.set(instanceId, Event2.accumulate(e.instance.onData, 50, true, this._store)((events) => {
        this._proxy.$shellExecutionData(instanceId, events.join(""));
      }));
    }));
    const commandDetectionEndEvent = this._store.add(this._terminalService.createOnInstanceCapabilityEvent(2 /* CommandDetection */, (e) => e.onCommandFinished));
    this._store.add(commandDetectionEndEvent.event((e) => {
      currentCommand = void 0;
      const instanceId = e.instance.instanceId;
      instanceDataListeners.get(instanceId)?.dispose();
      this._proxy.$shellExecutionEnd(instanceId, e.data.command, convertToExtHostCommandLineConfidence(e.data), e.data.isTrusted, e.data.exitCode);
    }));
    this._store.add(this._terminalService.onDidDisposeInstance((e) => this._proxy.$closeTerminal(e.instanceId)));
  }
  $executeCommand(terminalId, commandLine) {
    this._terminalService.getInstanceFromId(terminalId)?.runCommand(commandLine, true);
  }
  _enableShellIntegration(instance2) {
    this._extensionService.activateByEvent("onTerminalShellIntegration:*");
    if (instance2.shellType) {
      this._extensionService.activateByEvent(`onTerminalShellIntegration:${instance2.shellType}`);
    }
    this._proxy.$shellIntegrationChange(instance2.instanceId, instanceSupportsExecuteCommandApi(instance2));
    const cwdDetection = instance2.capabilities.get(0 /* CwdDetection */);
    if (cwdDetection) {
      this._proxy.$cwdChange(instance2.instanceId, cwdDetection.getCwd());
    }
  }
};

MainThreadTerminalShellIntegration = __decorateClass([
  extHostNamedCustomer(MainContext.MainThreadTerminalShellIntegration),
  __decorateParam(1, ITerminalService),
  __decorateParam(2, IWorkbenchEnvironmentService),
  __decorateParam(3, IExtensionService)
], MainThreadTerminalShellIntegration);

function convertToExtHostCommandLineConfidence(command4) {
  switch (command4.commandLineConfidence) {
    case "high":
      return 2 /* High */;
    case "medium":
      return 1 /* Medium */;
    case "low":
    default:
      return 0 /* Low */;
  }
}

function instanceSupportsExecuteCommandApi(instance2) {
  return instance2.shellLaunchConfig.type !== "Task";
}
export { convertToExtHostCommandLineConfidence, instanceSupportsExecuteCommandApi, MainThreadTerminalShellIntegration };
