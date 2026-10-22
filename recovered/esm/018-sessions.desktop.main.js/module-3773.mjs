// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/terminal/browser/agentHostSessionTaskRunner.ts
import { osToTaskTargetOS, resolveTaskCommand } from "./module-3772.mjs";
import { OS } from "./module-0014.mjs";
import { localize } from "./module-0001.mjs";
import { toDisposable } from "./module-0012.mjs";
import { isAgentHostProvider } from "./module-1764.mjs";
import { AGENT_HOST_SCHEME, fromAgentHostUri } from "./module-1001.mjs";
import { Schemas } from "./module-0033.mjs";
import { basename2 } from "./module-0034.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IAgentHostTerminalService } from "./module-3090.mjs";
import { ISessionsProvidersService } from "./module-1765.mjs";
import { ISessionsTasksService } from "./module-3534.mjs";
import { IConfigurationResolverService } from "./module-1404.mjs";
import { ITerminalGroupService, ITerminalService } from "./module-1150.mjs";
import { ILogService } from "./module-0095.mjs";


// src/vs/sessions/contrib/terminal/browser/agentHostSessionTaskRunner.ts
var LOG_PREFIX13 = "[AgentHostSessionTaskRunner]";

var LOCAL_AGENT_HOST_ADDRESS = "__local__";

var AgentHostSessionTaskRunner = class {
  constructor(_agentHostTerminalService, _sessionsProvidersService, _sessionsTasksService, _configurationResolverService, _terminalService, _terminalGroupService, _logService) {
    this._agentHostTerminalService = _agentHostTerminalService;
    this._sessionsProvidersService = _sessionsProvidersService;
    this._sessionsTasksService = _sessionsTasksService;
    this._configurationResolverService = _configurationResolverService;
    this._terminalService = _terminalService;
    this._terminalGroupService = _terminalGroupService;
    this._logService = _logService;
    this.id = "agentHost";
    this.priority = 100;
  }
  canRun(session) {
    return this._getAddress(session) !== void 0;
  }
  async runTask(task, session) {
    const address = this._getAddress(session);
    if (!address) {
      return void 0;
    }
    const allTasks = await this._sessionsTasksService.getAllTasks(session);
    const byLabel = /* @__PURE__ */ new Map();
    for (const entry of allTasks) {
      byLabel.set(entry.task.label, entry.task);
    }
    const cwd2 = this._getCwd(session);
    const command4 = await resolveTaskCommand(task, {
      // Local host shares the renderer's OS, so use it to pick OS-specific
      // overrides; remote host OS is unknown, so fall back to the default.
      targetOS: address === LOCAL_AGENT_HOST_ADDRESS ? osToTaskTargetOS(OS) : void 0,
      lookup: (label3) => byLabel.get(label3),
      resolveVariables: this._createVariableResolver(address, cwd2)
    });
    if (!command4) {
      this._logService.trace(`${LOG_PREFIX13} Skipping task '${task.label}' \u2014 no command could be resolved.`);
      return void 0;
    }
    const instance2 = await this._agentHostTerminalService.createTerminalForEntry(address, {
      cwd: cwd2,
      name: localize(5621, null, task.label)
    });
    if (!instance2) {
      this._logService.warn(`${LOG_PREFIX13} Failed to create terminal for task '${task.label}' on '${address}'.`);
      return void 0;
    }
    this._terminalService.setActiveInstance(instance2);
    await this._terminalGroupService.showPanel(true);
    await instance2.sendText(
      command4,
      /*shouldExecute*/
      true
    );
    return toDisposable(() => {
      instance2.dispose(3 /* User */);
    });
  }
  _getAddress(session) {
    const provider = this._sessionsProvidersService.getProvider(session.providerId);
    if (!provider || !isAgentHostProvider(provider)) {
      return void 0;
    }
    return provider.remoteAddress ?? LOCAL_AGENT_HOST_ADDRESS;
  }
  _getCwd(session) {
    const folder = session.workspace.get()?.folders[0];
    const cwd2 = folder?.workingDirectory ?? folder?.root;
    if (!cwd2) {
      return void 0;
    }
    if (cwd2.scheme === AGENT_HOST_SCHEME) {
      return fromAgentHostUri(cwd2);
    }
    if (cwd2.scheme === Schemas.file) {
      return cwd2;
    }
    return void 0;
  }
  /**
   * Builds the `${workspaceFolder}` resolver for a task, or `undefined` when
   * there is no working directory. Remote hosts only get a literal
   * `${workspaceFolder}` substitution (their OS may differ from the
   * renderer's); local hosts use the full resolver.
   */
  _createVariableResolver(address, cwd2) {
    if (!cwd2) {
      return void 0;
    }
    if (address !== LOCAL_AGENT_HOST_ADDRESS) {
      return (value2) => Promise.resolve(value2.replaceAll("${workspaceFolder}", cwd2.path));
    }
    return async (value2) => {
      try {
        return await this._configurationResolverService.resolveAsync(this._toFolderData(cwd2), value2);
      } catch {
        return value2;
      }
    };
  }
  _toFolderData(cwd2) {
    return { uri: cwd2, name: basename2(cwd2), index: 0 };
  }
};

AgentHostSessionTaskRunner = __decorateClass([
  __decorateParam(0, IAgentHostTerminalService),
  __decorateParam(1, ISessionsProvidersService),
  __decorateParam(2, ISessionsTasksService),
  __decorateParam(3, IConfigurationResolverService),
  __decorateParam(4, ITerminalService),
  __decorateParam(5, ITerminalGroupService),
  __decorateParam(6, ILogService)
], AgentHostSessionTaskRunner);
export { LOG_PREFIX13, LOCAL_AGENT_HOST_ADDRESS, AgentHostSessionTaskRunner };
