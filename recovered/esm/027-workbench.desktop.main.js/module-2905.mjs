// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/agentSessions/agentHost/agentHostTerminalContribution.ts
import { Disposable, DisposableStore, MutableDisposable } from "./module-0012.mjs";
import { AgentHostCustomTerminalToolEnabledSettingId } from "./module-2104.mjs";
import { AgentHostRootConfigForwarder } from "./module-2871.mjs";
import { autorun } from "./module-0052.mjs";
import { localize } from "./module-0001.mjs";
import { OS } from "./module-0014.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IAgentHostService } from "./module-1107.mjs";
import { IAgentHostTerminalService } from "./module-2889.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { ITerminalProfileResolverService, ITerminalProfileService } from "./module-1173.mjs";
import { IDefaultAccountService } from "./module-0741.mjs";
import { IAgentHostEnablementService } from "./module-0963.mjs";
import { IWorkbenchEnvironmentService } from "./module-0935.mjs";


// src/vs/workbench/contrib/chat/browser/agentSessions/agentHost/agentHostTerminalContribution.ts
var AGENT_HOST_SHELL_DEPENDENT_SETTINGS = [
  "terminal.integrated.agentHostProfile.linux" /* AgentHostProfileLinux */,
  "terminal.integrated.agentHostProfile.osx" /* AgentHostProfileMacOs */,
  "terminal.integrated.agentHostProfile.windows" /* AgentHostProfileWindows */,
  "terminal.integrated.defaultProfile.linux" /* DefaultProfileLinux */,
  "terminal.integrated.defaultProfile.osx" /* DefaultProfileMacOs */,
  "terminal.integrated.defaultProfile.windows" /* DefaultProfileWindows */,
  "terminal.integrated.profiles.linux" /* ProfilesLinux */,
  "terminal.integrated.profiles.osx" /* ProfilesMacOs */,
  "terminal.integrated.profiles.windows" /* ProfilesWindows */
];

var AgentHostTerminalContribution = class extends Disposable {
  constructor(_agentHostService, _agentHostTerminalService, _configurationService, _terminalProfileService, _terminalProfileResolverService, _defaultAccountService, _agentHostEnablementService, environmentService) {
    super();
    this._agentHostService = _agentHostService;
    this._agentHostTerminalService = _agentHostTerminalService;
    this._configurationService = _configurationService;
    this._terminalProfileService = _terminalProfileService;
    this._terminalProfileResolverService = _terminalProfileResolverService;
    this._defaultAccountService = _defaultAccountService;
    this._agentHostEnablementService = _agentHostEnablementService;
    this._localEntry = this._register(new MutableDisposable());
    this._conditionalListeners = this._register(new MutableDisposable());
    const defaultShellKey = {
      key: "defaultShell" /* DefaultShell */,
      computeValue: () => this._resolveDefaultShell(),
      registerTriggers: (store, push) => {
        store.add(this._configurationService.onDidChangeConfiguration((e) => {
          if (AGENT_HOST_SHELL_DEPENDENT_SETTINGS.some((s) => e.affectsConfiguration(s))) {
            push();
          }
        }));
        store.add(this._terminalProfileService.onDidChangeAvailableProfiles(() => push()));
      }
    };
    const keys = [
      ...environmentService.remoteAuthority ? [] : [defaultShellKey],
      {
        key: "enableCustomTerminalTool" /* EnableCustomTerminalTool */,
        computeValue: () => this._configurationService.getValue(AgentHostCustomTerminalToolEnabledSettingId) === true,
        registerTriggers: (store, push) => {
          store.add(this._configurationService.onDidChangeConfiguration((e) => {
            if (e.affectsConfiguration(AgentHostCustomTerminalToolEnabledSettingId)) {
              push();
            }
          }));
        }
      },
      {
        // Mirror the connected GitHub Enterprise host to the agent host so its
        // GitHub resources / CAPI calls target the enterprise instance. Sourced
        // from the account service — the authoritative "am I signed in to GHE"
        // state — rather than reading the setting directly. Push `''` (not
        // `undefined`) for github.com: the push pipeline skips `undefined`,
        // which would strand a stale host on the agent host.
        key: "githubEnterpriseUri" /* GithubEnterpriseUri */,
        computeValue: () => {
          const provider = this._defaultAccountService.getDefaultAccountAuthenticationProvider();
          return provider.enterprise ? this._defaultAccountService.resolveGitHubUrl("").replace(/\/+$/, "") : "";
        },
        registerTriggers: (store, push) => {
          store.add(this._defaultAccountService.onDidChangeDefaultAccount(() => push()));
        }
      }
    ];
    this._forwarder = this._register(new AgentHostRootConfigForwarder(keys, this._agentHostService));
    this._register(autorun((reader) => this._updateEnabled(this._agentHostEnablementService.enabled.read(reader))));
  }
  static {
    this.ID = "workbench.contrib.agentHostTerminal";
  }
  _updateEnabled(enabled) {
    if (enabled) {
      if (!this._conditionalListeners.value) {
        const store = new DisposableStore();
        store.add(this._agentHostService.onAgentHostStart(() => this._registerLocalEntry()));
        this._conditionalListeners.value = store;
        this._registerLocalEntry();
        this._forwarder.start();
      }
    } else {
      this._conditionalListeners.value = void 0;
      this._localEntry.value = void 0;
      this._forwarder.stop();
    }
  }
  _registerLocalEntry() {
    if (!this._localEntry.value) {
      this._localEntry.value = this._agentHostTerminalService.registerEntry({
        name: localize(9028, null),
        address: "__local__",
        getConnection: () => this._agentHostService
      });
    }
  }
  /**
   * Resolve the agent host terminal profile (with `defaultProfile.<os>`
   * fallback) so its host-managed shells inherit the user's preferred terminal
   * binary. Returns `undefined` when no usable path can be resolved.
   */
  async _resolveDefaultShell() {
    let profile;
    try {
      profile = await this._terminalProfileResolverService.getDefaultProfile({
        remoteAuthority: void 0,
        os: OS,
        allowAgentHostShell: true
      });
    } catch {
      return void 0;
    }
    return profile.path || void 0;
  }
};

AgentHostTerminalContribution = __decorateClass([
  __decorateParam(0, IAgentHostService),
  __decorateParam(1, IAgentHostTerminalService),
  __decorateParam(2, IConfigurationService),
  __decorateParam(3, ITerminalProfileService),
  __decorateParam(4, ITerminalProfileResolverService),
  __decorateParam(5, IDefaultAccountService),
  __decorateParam(6, IAgentHostEnablementService),
  __decorateParam(7, IWorkbenchEnvironmentService)
], AgentHostTerminalContribution);
export { AGENT_HOST_SHELL_DEPENDENT_SETTINGS, AgentHostTerminalContribution };
