// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/agentSessions/agentHost/agentHostMcpServerSupportScope.ts
import { Disposable } from "./module-0012.mjs";
import { observableValue } from "./module-0048.mjs";
import { DeferredPromise, Delayer } from "./module-0036.mjs";
import { assessMcpServersForCopilotAgentHost, mergeInstalledMcpServersIntoAgentHostSupportAssessment } from "./module-1750.mjs";
import { mcpAccessConfig } from "./module-1196.mjs";
import { COPILOT_STRICT_PLUGIN_ONLY_CUSTOMIZATION_CONFIG } from "./module-0956.mjs";
import { transaction } from "./module-0045.mjs";
import { isStrictPluginOnlyCustomizationEnabled } from "./module-1021.mjs";
import { onUnexpectedError } from "./module-0004.mjs";
import { autorun } from "./module-0052.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IMcpService, IMcpWorkbenchService } from "./module-1206.mjs";
import { IConfigurationResolverService } from "./module-1404.mjs";
import { IConfigurationService } from "./module-0132.mjs";


// src/vs/workbench/contrib/chat/browser/agentSessions/agentHost/agentHostMcpServerSupportScope.ts
var MCP_SUPPORT_UPDATE_DEBOUNCE_DELAY = 50;

var AgentHostMcpServerSupportScope = class extends Disposable {
  constructor(_sessionType, _roots, _onDispose, _mcpService, _mcpWorkbenchService, _configurationResolverService, _configurationService) {
    super();
    this._sessionType = _sessionType;
    this._roots = _roots;
    this._onDispose = _onDispose;
    this._mcpService = _mcpService;
    this._mcpWorkbenchService = _mcpWorkbenchService;
    this._configurationResolverService = _configurationResolverService;
    this._configurationService = _configurationService;
    this._support = observableValue("agentHostMcpServerSupport", {
      servers: [],
      discoveryComplete: false,
      coverage: {
        restrictedByMcpAccess: false,
        restrictedByCustomizationPolicy: false
      }
    });
    this._isResolved = observableValue("agentHostMcpServerSupportResolved", false);
    this._initialResolution = new DeferredPromise();
    this._refCount = 0;
    this._updateSequence = 0;
    this._isDisposed = false;
    this._updateDelayer = this._register(new Delayer(MCP_SUPPORT_UPDATE_DEBOUNCE_DELAY));
    const update = async () => {
      const sequence2 = ++this._updateSequence;
      try {
        const lazyState = this._mcpService.lazyCollectionState.get();
        const initialAssessment = await assessMcpServersForCopilotAgentHost(
          this._mcpService.servers.get(),
          this._configurationResolverService,
          this._sessionType,
          this._roots,
          lazyState.state
        );
        if (!initialAssessment) {
          return;
        }
        await this._mcpWorkbenchService.whenInitialLocalMcpServersLoaded;
        const installedServers = this._mcpWorkbenchService.local.flatMap((server) => {
          const local = server.local;
          return local ? [{
            id: local.id,
            name: server.name,
            label: server.label,
            configuration: local.config,
            configPath: this._mcpWorkbenchService.getMcpConfigPath(local),
            sandbox: local.rootSandbox,
            runtimeState: server.runtimeStatus?.state
          }] : [];
        });
        const assessment = await mergeInstalledMcpServersIntoAgentHostSupportAssessment(
          initialAssessment,
          installedServers,
          this._configurationResolverService,
          this._roots
        );
        if (sequence2 !== this._updateSequence) {
          return;
        }
        const access = this._configurationService.getValue(mcpAccessConfig);
        const strictPluginOnly = this._configurationService.getValue(COPILOT_STRICT_PLUGIN_ONLY_CUSTOMIZATION_CONFIG);
        transaction((tx) => {
          this._support.set({
            ...assessment,
            coverage: {
              restrictedByMcpAccess: access !== "all" /* All */,
              restrictedByCustomizationPolicy: isStrictPluginOnlyCustomizationEnabled(strictPluginOnly)
            }
          }, tx);
          this._isResolved.set(true, tx);
        });
      } catch (error) {
        onUnexpectedError(error);
        if (sequence2 === this._updateSequence) {
          transaction((tx) => this._isResolved.set(true, tx));
        }
      } finally {
        if (sequence2 === this._updateSequence && !this._initialResolution.isSettled) {
          this._initialResolution.complete();
        }
      }
    };
    const scheduleUpdate = () => {
      this._updateDelayer.trigger(() => update()).catch(() => {
      });
    };
    this._register(autorun((reader) => {
      for (const server of this._mcpService.servers.read(reader)) {
        server.readDefinitions().read(reader);
        server.enablement.read(reader);
      }
      this._mcpService.lazyCollectionState.read(reader);
      scheduleUpdate();
    }));
    this._register(this._mcpWorkbenchService.onChange(scheduleUpdate));
    this._register(this._configurationService.onDidChangeConfiguration((event) => {
      if (event.affectsConfiguration(mcpAccessConfig) || event.affectsConfiguration(COPILOT_STRICT_PLUGIN_ONLY_CUSTOMIZATION_CONFIG)) {
        scheduleUpdate();
      }
    }));
  }
  acquire() {
    this._refCount++;
    let released = false;
    return {
      support: this._support,
      isResolved: this._isResolved,
      whenResolved: () => this._initialResolution.p,
      dispose: () => {
        if (!released) {
          released = true;
          this._release();
        }
      }
    };
  }
  dispose() {
    if (this._isDisposed) {
      return;
    }
    this._isDisposed = true;
    this._updateSequence++;
    if (!this._initialResolution.isSettled) {
      this._initialResolution.complete();
    }
    super.dispose();
    this._onDispose();
  }
  _release() {
    if (--this._refCount === 0) {
      this.dispose();
    }
  }
};

AgentHostMcpServerSupportScope = __decorateClass([
  __decorateParam(3, IMcpService),
  __decorateParam(4, IMcpWorkbenchService),
  __decorateParam(5, IConfigurationResolverService),
  __decorateParam(6, IConfigurationService)
], AgentHostMcpServerSupportScope);
export { MCP_SUPPORT_UPDATE_DEBOUNCE_DELAY, AgentHostMcpServerSupportScope };
