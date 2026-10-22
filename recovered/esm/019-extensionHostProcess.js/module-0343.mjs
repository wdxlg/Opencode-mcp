// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/node/extensionHostProcess.js
// Original module marker: src/vs/workbench/api/node/extHostDebugService.ts
import { ExtHostDebugServiceBase } from "./module-0314.mjs";
import { DebugAdapterExecutable, DebugAdapterNamedPipeServer, DebugAdapterServer, ThemeIcon2 } from "./module-0244.mjs";
import { ExecutableDebugAdapter, NamedPipeDebugAdapter, SocketDebugAdapter } from "./module-0341.mjs";
import { SignService } from "./module-0340.mjs";
import { localize } from "./module-0013.mjs";
import { DisposableStore } from "./module-0011.mjs";
import { RunOnceScheduler, createCancelablePromise, disposableTimeout, firstParallel, timeout } from "./module-0029.mjs";
import { isLinux, isMacintosh, isWindows } from "./module-0014.mjs";
import { hasChildProcesses, prepareCommand } from "./module-0342.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IExtHostRpcService } from "./module-0069.mjs";
import { IExtHostWorkspace } from "./module-0251.mjs";
import { IExtHostExtensionService } from "./module-0288.mjs";
import { IExtHostConfiguration } from "./module-0253.mjs";
import { IExtHostTerminalService } from "./module-0269.mjs";
import { IExtHostTerminalShellIntegration } from "./module-0323.mjs";
import { IExtHostEditorTabs } from "./module-0307.mjs";
import { IExtHostVariableResolverProvider } from "./module-0313.mjs";
import { IExtHostCommands } from "./module-0268.mjs";
import { IExtHostTesting } from "./module-0309.mjs";
import { LinuxExternalTerminalService, MacExternalTerminalService, WindowsExternalTerminalService } from "./module-0337.mjs";


// src/vs/workbench/api/node/extHostDebugService.ts
var ExtHostDebugService = class extends ExtHostDebugServiceBase {
  constructor(extHostRpcService, workspaceService, extensionService, configurationService, _terminalService, _terminalShellIntegrationService, editorTabs, variableResolver, commands, testing) {
    super(extHostRpcService, workspaceService, extensionService, configurationService, editorTabs, variableResolver, commands, testing);
    this._terminalService = _terminalService;
    this._terminalShellIntegrationService = _terminalShellIntegrationService;
    this._integratedTerminalInstances = new DebugTerminalCollection();
  }
  createDebugAdapter(adapter, session) {
    if (adapter instanceof DebugAdapterExecutable) {
      return new ExecutableDebugAdapter(this.convertExecutableToDto(adapter), session.type);
    } else if (adapter instanceof DebugAdapterServer) {
      return new SocketDebugAdapter(this.convertServerToDto(adapter));
    } else if (adapter instanceof DebugAdapterNamedPipeServer) {
      return new NamedPipeDebugAdapter(this.convertPipeServerToDto(adapter));
    } else {
      return super.createDebugAdapter(adapter, session);
    }
  }
  daExecutableFromPackage(session, extensionRegistry) {
    const dae = ExecutableDebugAdapter.platformAdapterExecutable(extensionRegistry.getAllExtensionDescriptions(), session.type);
    if (dae) {
      return new DebugAdapterExecutable(dae.command, dae.args, dae.options);
    }
    return void 0;
  }
  createSignService() {
    return new SignService();
  }
  async $runInTerminal(args2, sessionId) {
    if (args2.kind === "integrated") {
      if (!this._terminalDisposedListener) {
        this._terminalDisposedListener = this._register(this._terminalService.onDidCloseTerminal((terminal2) => {
          this._integratedTerminalInstances.onTerminalClosed(terminal2);
        }));
      }
      const configProvider = await this._configurationService.getConfigProvider();
      const shell = this._terminalService.getDefaultShell(true);
      const shellArgs = this._terminalService.getDefaultShellArgs(true);
      const terminalName = args2.title || localize(5918, null);
      const shellConfig = JSON.stringify({ shell, shellArgs, cwd: args2.cwd });
      let terminal = await this._integratedTerminalInstances.checkout(shellConfig, terminalName);
      let cwdForPrepareCommand;
      let giveShellTimeToInitialize = false;
      if (!terminal) {
        const options2 = {
          shellPath: shell,
          shellArgs,
          cwd: args2.cwd,
          name: terminalName,
          iconPath: new ThemeIcon2("debug")
        };
        giveShellTimeToInitialize = true;
        terminal = this._terminalService.createTerminalFromOptions(options2, {
          isFeatureTerminal: true,
          // Since debug termnials are REPLs, we want shell integration to be enabled.
          // Ignore isFeatureTerminal when evaluating shell integration enablement.
          forceShellIntegration: true,
          useShellEnvironment: true
        });
        this._integratedTerminalInstances.insert(terminal, shellConfig);
      } else {
        cwdForPrepareCommand = args2.cwd;
      }
      terminal.show(true);
      const shellProcessId = await terminal.processId;
      if (giveShellTimeToInitialize) {
        let Timing;
        ((Timing2) => {
          Timing2[Timing2["DataDebounce"] = 500] = "DataDebounce";
          Timing2[Timing2["MaxDelay"] = 5e3] = "MaxDelay";
        })(Timing || (Timing = {}));
        const ds = new DisposableStore();
        await new Promise((resolve2) => {
          const scheduler = ds.add(new RunOnceScheduler(resolve2, 500 /* DataDebounce */));
          ds.add(this._terminalService.onDidWriteTerminalData((e) => {
            if (e.terminal === terminal) {
              scheduler.schedule();
            }
          }));
          ds.add(this._terminalShellIntegrationService.onDidChangeTerminalShellIntegration((e) => {
            if (e.terminal === terminal) {
              resolve2();
            }
          }));
          ds.add(disposableTimeout(resolve2, 5e3 /* MaxDelay */));
        });
        ds.dispose();
      } else {
        if (terminal.state.isInteractedWith && !terminal.shellIntegration) {
          terminal.sendText("");
          await timeout(200);
        }
        if (configProvider.getConfiguration("debug.terminal").get("clearBeforeReusing")) {
          let clearCommand;
          if (shell.indexOf("powershell") >= 0 || shell.indexOf("pwsh") >= 0 || shell.indexOf("cmd.exe") >= 0) {
            clearCommand = "cls";
          } else if (shell.indexOf("bash") >= 0) {
            clearCommand = "clear";
          } else if (isWindows) {
            clearCommand = "cls";
          } else {
            clearCommand = "clear";
          }
          if (terminal.shellIntegration) {
            const ds = new DisposableStore();
            const execution = terminal.shellIntegration.executeCommand(clearCommand);
            await new Promise((resolve2) => {
              ds.add(this._terminalShellIntegrationService.onDidEndTerminalShellExecution((e) => {
                if (e.execution === execution) {
                  resolve2();
                }
              }));
              ds.add(disposableTimeout(resolve2, 500));
            });
            ds.dispose();
          } else {
            terminal.sendText(clearCommand);
            await timeout(200);
          }
        }
      }
      const command = prepareCommand(shell, args2.args, !!args2.argsCanBeInterpretedByShell, cwdForPrepareCommand, args2.env);
      if (terminal.shellIntegration) {
        terminal.shellIntegration.executeCommand(command);
      } else {
        terminal.sendText(command);
      }
      const sessionListener = this.onDidTerminateDebugSession((s) => {
        if (s.id === sessionId) {
          this._integratedTerminalInstances.free(terminal);
          sessionListener.dispose();
        }
      });
      return shellProcessId;
    } else if (args2.kind === "external") {
      return runInExternalTerminal(args2, await this._configurationService.getConfigProvider());
    }
    return super.$runInTerminal(args2, sessionId);
  }
};

ExtHostDebugService = __decorateClass([
  __decorateParam(0, IExtHostRpcService),
  __decorateParam(1, IExtHostWorkspace),
  __decorateParam(2, IExtHostExtensionService),
  __decorateParam(3, IExtHostConfiguration),
  __decorateParam(4, IExtHostTerminalService),
  __decorateParam(5, IExtHostTerminalShellIntegration),
  __decorateParam(6, IExtHostEditorTabs),
  __decorateParam(7, IExtHostVariableResolverProvider),
  __decorateParam(8, IExtHostCommands),
  __decorateParam(9, IExtHostTesting)
], ExtHostDebugService);

var externalTerminalService = void 0;

function runInExternalTerminal(args2, configProvider) {
  if (!externalTerminalService) {
    if (isWindows) {
      externalTerminalService = new WindowsExternalTerminalService();
    } else if (isMacintosh) {
      externalTerminalService = new MacExternalTerminalService();
    } else if (isLinux) {
      externalTerminalService = new LinuxExternalTerminalService();
    } else {
      throw new Error("external terminals not supported on this platform");
    }
  }
  const config = configProvider.getConfiguration("terminal");
  return externalTerminalService.runInTerminal(args2.title, args2.cwd, args2.args, args2.env || {}, config.external || {});
}

var DebugTerminalCollection = class _DebugTerminalCollection {
  constructor() {
    this._terminalInstances = /* @__PURE__ */ new Map();
  }
  static {
    /**
     * Delay before a new terminal is a candidate for reuse. See #71850
     */
    this.minUseDelay = 1e3;
  }
  async checkout(config, name, cleanupOthersByName = false) {
    const entries = [...this._terminalInstances.entries()];
    const promises7 = entries.map(([terminal, termInfo]) => createCancelablePromise(async (ct) => {
      if (terminal.name !== name) {
        return null;
      }
      if (termInfo.lastUsedAt !== -1 && await hasChildProcesses(await terminal.processId)) {
        return null;
      }
      const now = Date.now();
      if (termInfo.lastUsedAt + _DebugTerminalCollection.minUseDelay > now || ct.isCancellationRequested) {
        return null;
      }
      if (termInfo.config !== config) {
        if (cleanupOthersByName) {
          terminal.dispose();
        }
        return null;
      }
      termInfo.lastUsedAt = now;
      return terminal;
    }));
    return await firstParallel(promises7, (t) => !!t);
  }
  insert(terminal, termConfig) {
    this._terminalInstances.set(terminal, { lastUsedAt: Date.now(), config: termConfig });
  }
  free(terminal) {
    const info = this._terminalInstances.get(terminal);
    if (info) {
      info.lastUsedAt = -1;
    }
  }
  onTerminalClosed(terminal) {
    this._terminalInstances.delete(terminal);
  }
};
export { runInExternalTerminal, ExtHostDebugService, externalTerminalService, DebugTerminalCollection };
