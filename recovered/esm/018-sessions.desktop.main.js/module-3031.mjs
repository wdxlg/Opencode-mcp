// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/terminal/browser/baseTerminalBackend.ts
import { Disposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { localize } from "./module-0001.mjs";
import { TerminalContribCommandId } from "./module-1173.mjs";
import { Schemas } from "./module-0033.mjs";
import { isNumber, isObject } from "./module-0010.mjs";


// src/vs/workbench/contrib/terminal/browser/baseTerminalBackend.ts
var BaseTerminalBackend = class extends Disposable {
  constructor(_ptyHostController, _logService, historyService, configurationResolverService, statusBarService, _workspaceContextService) {
    super();
    this._ptyHostController = _ptyHostController;
    this._logService = _logService;
    this._workspaceContextService = _workspaceContextService;
    this._isPtyHostUnresponsive = false;
    this._onPtyHostConnected = this._register(new Emitter());
    this.onPtyHostConnected = this._onPtyHostConnected.event;
    this._onPtyHostRestart = this._register(new Emitter());
    this.onPtyHostRestart = this._onPtyHostRestart.event;
    this._onPtyHostUnresponsive = this._register(new Emitter());
    this.onPtyHostUnresponsive = this._onPtyHostUnresponsive.event;
    this._onPtyHostResponsive = this._register(new Emitter());
    this.onPtyHostResponsive = this._onPtyHostResponsive.event;
    let unresponsiveStatusBarEntry;
    let statusBarAccessor;
    let hasStarted = false;
    this._register(this._ptyHostController.onPtyHostExit(() => {
      this._logService.error(`The terminal's pty host process exited, the connection to all terminal processes was lost`);
    }));
    this._register(this.onPtyHostConnected(() => hasStarted = true));
    this._register(this._ptyHostController.onPtyHostStart(() => {
      this._logService.debug(`The terminal's pty host process is starting`);
      if (hasStarted) {
        this._logService.trace("IPtyHostController#onPtyHostRestart");
        this._onPtyHostRestart.fire();
      }
      statusBarAccessor?.dispose();
      this._isPtyHostUnresponsive = false;
    }));
    this._register(this._ptyHostController.onPtyHostUnresponsive(() => {
      statusBarAccessor?.dispose();
      if (!unresponsiveStatusBarEntry) {
        unresponsiveStatusBarEntry = {
          name: localize(19912, null),
          text: `$(debug-disconnect) ${localize(19914, null)}`,
          tooltip: localize(19911, null),
          ariaLabel: localize(19913, null),
          command: TerminalContribCommandId.DeveloperRestartPtyHost,
          kind: "warning"
        };
      }
      statusBarAccessor = statusBarService.addEntry(unresponsiveStatusBarEntry, "ptyHostStatus", 0 /* LEFT */);
      this._isPtyHostUnresponsive = true;
      this._onPtyHostUnresponsive.fire();
    }));
    this._register(this._ptyHostController.onPtyHostResponsive(() => {
      if (!this._isPtyHostUnresponsive) {
        return;
      }
      this._logService.info("The pty host became responsive again");
      statusBarAccessor?.dispose();
      this._isPtyHostUnresponsive = false;
      this._onPtyHostResponsive.fire();
    }));
    this._register(this._ptyHostController.onPtyHostRequestResolveVariables(async (e4) => {
      if (e4.workspaceId !== this._workspaceContextService.getWorkspace().id) {
        return;
      }
      const activeWorkspaceRootUri = historyService.getLastActiveWorkspaceRoot(Schemas.file);
      const lastActiveWorkspaceRoot = activeWorkspaceRootUri ? this._workspaceContextService.getWorkspaceFolder(activeWorkspaceRootUri) ?? void 0 : void 0;
      const resolveCalls = e4.originalText.map((t2) => {
        return configurationResolverService.resolveAsync(lastActiveWorkspaceRoot, t2);
      });
      const result = await Promise.all(resolveCalls);
      this._ptyHostController.acceptPtyHostResolvedVariables(e4.requestId, result);
    }));
  }
  get isResponsive() {
    return !this._isPtyHostUnresponsive;
  }
  restartPtyHost() {
    this._ptyHostController.restartPtyHost();
  }
  _deserializeTerminalState(serializedState) {
    if (serializedState === void 0) {
      return void 0;
    }
    const crossVersionState = JSON.parse(serializedState);
    if (!isCrossVersionSerializedTerminalState(crossVersionState)) {
      this._logService.warn("Could not revive serialized processes, wrong format", crossVersionState);
      return void 0;
    }
    if (crossVersionState.version !== 1) {
      this._logService.warn(`Could not revive serialized processes, wrong version "${crossVersionState.version}"`, crossVersionState);
      return void 0;
    }
    return crossVersionState.state;
  }
  _getWorkspaceId() {
    return this._workspaceContextService.getWorkspace().id;
  }
};

function isCrossVersionSerializedTerminalState(obj) {
  return isObject(obj) && "version" in obj && isNumber(obj.version) && "state" in obj && Array.isArray(obj.state);
}
export { isCrossVersionSerializedTerminalState, BaseTerminalBackend };
