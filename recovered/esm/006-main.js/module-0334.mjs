// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/main.js
// Original module marker: src/vs/platform/agentHost/electron-main/electronAgentHostStarter.ts
import { __decorateClass, __decorateParam, __esm } from "./module-0000.mjs";
import { Disposable, DisposableMap, DisposableStore, init_lifecycle, toDisposable } from "./module-0018.mjs";
import { Emitter, init_event } from "./module-0021.mjs";
import { init_ipcMain, validatedIpcMain } from "./module-0059.mjs";
import { Client3, init_ipc_mp2 } from "./module-0066.mjs";
import { ProxyChannel, init_ipc } from "./module-0054.mjs";
import { AiAgentEnvValue, AiAgentEnvVar, init_aiAgentEnv } from "./module-0280.mjs";
import { IConfigurationService, init_configuration } from "./module-0040.mjs";
import { IEnvironmentMainService, init_environmentMainService } from "./module-0094.mjs";
import { init_environmentService2, parseAgentHostDebugPort } from "./module-0093.mjs";
import { ILifecycleMainService, init_lifecycleMainService } from "./module-0102.mjs";
import { ILogService, init_log } from "./module-0075.mjs";
import { Schemas, init_network } from "./module-0031.mjs";
import { getResolvedShellEnv, init_shellEnv } from "./module-0168.mjs";
import { ITelemetryService, init_telemetry } from "./module-0104.mjs";
import { NullTelemetryService, init_telemetryUtils } from "./module-0215.mjs";
import { UtilityProcess, init_utilityProcess } from "./module-0132.mjs";
import { AgentHostStartError, init_agent, isFatalAgentHostStartError, toFatalAgentHostStartError } from "./module-0316.mjs";
import { buildAgentHostTelemetryIdEnv, init_agentHostTelemetryEnv } from "./module-0317.mjs";
import { AgentHostLaunchKindEnvVar, init_agentHostTelemetry, telemetryLevelToAgentHostValue } from "./module-0318.mjs";
import { AgentHostClaudeAgentEnabledSettingId, AgentHostCodexAgentBinaryArgsSettingId, AgentHostCodexAgentCodexHomeSettingId, AgentHostCodexAgentEnabledSettingId, AgentHostCodexAgentSdkRootSettingId, AgentHostOTelCaptureContentSettingId, AgentHostOTelDbSpanExporterEnabledSettingId, AgentHostOTelEnabledSettingId, AgentHostOTelExporterTypeSettingId, AgentHostOTelOtlpEndpointSettingId, AgentHostOTelOtlpProtocolSettingId, AgentHostOTelOutfileSettingId, AgentHostOTelPolicyIpcChannel, AgentHostOTelResourceAttributesSettingId, AgentHostOTelServiceNameSettingId, AgentHostRestartIpcChannel, AgentHostWillRestartIpcChannel, buildAgentHostOTelEnv, buildAgentSdkEnv, init_agentService, sanitizeAgentHostOTelPolicySettings } from "./module-0320.mjs";
import { deepClone, init_objects } from "./module-0121.mjs";
import { init_agentHostStarter_config_contribution } from "./module-0333.mjs";


// src/vs/platform/agentHost/electron-main/electronAgentHostStarter.ts
var ElectronAgentHostStarter;

var init_electronAgentHostStarter = __esm({
  "src/vs/platform/agentHost/electron-main/electronAgentHostStarter.ts"() {
    init_lifecycle();
    init_event();
    init_ipcMain();
    init_ipc_mp2();
    init_ipc();
    init_aiAgentEnv();
    init_configuration();
    init_environmentMainService();
    init_environmentService2();
    init_lifecycleMainService();
    init_log();
    init_network();
    init_shellEnv();
    init_telemetry();
    init_telemetryUtils();
    init_utilityProcess();
    init_agent();
    init_agentHostTelemetryEnv();
    init_agentHostTelemetry();
    init_agentService();
    init_objects();
    init_agentHostStarter_config_contribution();
    ElectronAgentHostStarter = class extends Disposable {
      constructor(_telemetryIds, _configurationService, _environmentMainService, _lifecycleMainService, _logService, _telemetryService) {
        super();
        this._telemetryIds = _telemetryIds;
        this._configurationService = _configurationService;
        this._environmentMainService = _environmentMainService;
        this._lifecycleMainService = _lifecycleMainService;
        this._logService = _logService;
        this._telemetryService = _telemetryService;
        this.utilityProcess = void 0;
        this._windowSenders = /* @__PURE__ */ new Map();
        this._windowSenderCleanup = this._register(new DisposableMap());
        this._onRequestConnection = this._register(new Emitter());
        this.onRequestConnection = this._onRequestConnection.event;
        this._onRequestRestart = this._register(new Emitter());
        this.onRequestRestart = this._onRequestRestart.event;
        this._onWillShutdown = this._register(new Emitter());
        this.onWillShutdown = this._onWillShutdown.event;
        /**
         * Enterprise OTel policy forwarded by the renderer (see `AgentHostOTelPolicyIpcChannel`).
         * The main-process config service lacks the managed-settings (`AccountPolicyService`) policy
         * layer, so the renderer — which has it — sends the resolved values here before requesting
         * the connection that lazily spawns the host. Used as the `policySettings` of
         * `buildAgentHostOTelEnv` in `start()`, falling back to main-process policy when absent.
         */
        this._otelPolicyFromRenderer = void 0;
        this._register(toDisposable(() => {
          if (this.utilityProcess) {
            this._disposeUtilityProcess(this.utilityProcess);
          }
        }));
        this._register(this._lifecycleMainService.onWillShutdown((event) => this._onWillShutdown.fire({
          join: (promise) => event.join("join.agentHost", promise)
        })));
        const onOTelPolicy = (_e, policy) => {
          this._otelPolicyFromRenderer = sanitizeAgentHostOTelPolicySettings(policy);
        };
        validatedIpcMain.on(AgentHostOTelPolicyIpcChannel, onOTelPolicy);
        this._register(toDisposable(() => {
          validatedIpcMain.removeListener(AgentHostOTelPolicyIpcChannel, onOTelPolicy);
        }));
        const onWindowConnection = (e, nonce) => {
          void this._onWindowConnection(e, nonce);
        };
        validatedIpcMain.on("vscode:createAgentHostMessageChannel", onWindowConnection);
        this._register(toDisposable(() => {
          validatedIpcMain.removeListener("vscode:createAgentHostMessageChannel", onWindowConnection);
        }));
        const onRestart = () => {
          this._notifyWindowsWillRestart();
          this._onRequestRestart.fire();
        };
        validatedIpcMain.on(AgentHostRestartIpcChannel, onRestart);
        this._register(toDisposable(() => {
          validatedIpcMain.removeListener(AgentHostRestartIpcChannel, onRestart);
        }));
      }
      async start() {
        if (this.utilityProcess) {
          throw new Error("Agent Host utility process is already running.");
        }
        const inspectParams = parseAgentHostDebugPort(this._environmentMainService.args, this._environmentMainService.isBuilt);
        const execArgv = inspectParams.port ? [
          "--nolazy",
          `--inspect${inspectParams.break ? "-brk" : ""}=${inspectParams.port}`
        ] : void 0;
        const shellEnv = await this._resolveShellEnv();
        if (this._store.isDisposed) {
          throw new Error("Agent Host starter was disposed during startup.");
        }
        if (this.utilityProcess) {
          throw new Error("Agent Host utility process was started concurrently.");
        }
        const sdkEnv = buildAgentSdkEnv({
          codexSdkRoot: this._configurationService.getValue(AgentHostCodexAgentSdkRootSettingId),
          codexHome: this._configurationService.getValue(AgentHostCodexAgentCodexHomeSettingId),
          codexBinaryArgs: this._configurationService.getValue(AgentHostCodexAgentBinaryArgsSettingId),
          claudeAgentEnabled: this._configurationService.getValue(AgentHostClaudeAgentEnabledSettingId),
          codexAgentEnabled: this._configurationService.getValue(AgentHostCodexAgentEnabledSettingId)
        }, process.env);
        const policyValue = (key) => this._configurationService.inspect(key).policyValue;
        const policySettings = this._otelPolicyFromRenderer ?? {
          enabled: policyValue(AgentHostOTelEnabledSettingId),
          exporterType: policyValue(AgentHostOTelExporterTypeSettingId),
          otlpProtocol: policyValue(AgentHostOTelOtlpProtocolSettingId),
          otlpEndpoint: policyValue(AgentHostOTelOtlpEndpointSettingId),
          captureContent: policyValue(AgentHostOTelCaptureContentSettingId),
          outfile: policyValue(AgentHostOTelOutfileSettingId),
          serviceName: policyValue(AgentHostOTelServiceNameSettingId),
          resourceAttributes: policyValue(AgentHostOTelResourceAttributesSettingId)
        };
        const otelEnv = buildAgentHostOTelEnv({
          enabled: this._configurationService.getValue(AgentHostOTelEnabledSettingId),
          exporterType: this._configurationService.getValue(AgentHostOTelExporterTypeSettingId),
          otlpEndpoint: this._configurationService.getValue(AgentHostOTelOtlpEndpointSettingId),
          captureContent: this._configurationService.getValue(AgentHostOTelCaptureContentSettingId),
          outfile: this._configurationService.getValue(AgentHostOTelOutfileSettingId),
          dbSpanExporterEnabled: this._configurationService.getValue(AgentHostOTelDbSpanExporterEnabledSettingId)
        }, process.env, policySettings);
        const args2 = [
          "--logsPath",
          this._environmentMainService.logsHome.with({ scheme: Schemas.file }).fsPath,
          "--user-data-dir",
          this._environmentMainService.userDataPath,
          "--telemetry-level",
          telemetryLevelToAgentHostValue(this._telemetryService.telemetryLevel)
        ];
        const telemetryIdEnv = buildAgentHostTelemetryIdEnv(this._telemetryIds);
        const utilityProcess2 = new UtilityProcess(this._logService, NullTelemetryService, this._lifecycleMainService);
        this.utilityProcess = utilityProcess2;
        try {
          if (!utilityProcess2.start({
            type: "agentHost",
            name: "agent-host",
            entryPoint: "vs/platform/agentHost/node/agentHostMain",
            execArgv,
            args: args2,
            env: {
              ...deepClone(process.env),
              ...shellEnv,
              // Announce that everything spawned below this process is driven by
              // VS Code's agent, so `gh` inherits it. Set after the inherited
              // env so it wins.
              [AiAgentEnvVar]: AiAgentEnvValue,
              VSCODE_ESM_ENTRYPOINT: "vs/platform/agentHost/node/agentHostMain",
              VSCODE_PIPE_LOGGING: "true",
              VSCODE_VERBOSE_LOGGING: "true",
              [AgentHostLaunchKindEnvVar]: "vscode_main_process" /* VSCodeMainProcess */,
              ...sdkEnv,
              ...otelEnv,
              ...telemetryIdEnv
            }
          })) {
            throw new Error("Agent Host utility process did not start.");
          }
          const port = utilityProcess2.connect();
          const client = new Client3(port, "agentHost");
          const managementService = ProxyChannel.toService(client.getChannel("agentHostManagement" /* Management */));
          const store = new DisposableStore();
          store.add(client);
          store.add(utilityProcess2.onStderr((data) => {
            if (this._isExpectedStderr(data)) {
              return;
            }
            this._logService.error(`[AgentHost:stderr] ${data}`);
          }));
          store.add(utilityProcess2.onExit(() => this._notifyWindowsWillRestart()));
          store.add(toDisposable(() => this._disposeUtilityProcess(utilityProcess2)));
          return {
            client,
            store,
            onDidProcessExit: utilityProcess2.onExit,
            shutdown: () => managementService.shutdown()
          };
        } catch (error) {
          this._disposeUtilityProcess(utilityProcess2);
          if (isFatalAgentHostStartError(error)) {
            throw toFatalAgentHostStartError(error);
          }
          throw error;
        }
      }
      async _resolveShellEnv() {
        try {
          return await getResolvedShellEnv(this._configurationService, this._logService, this._environmentMainService.args, process.env);
        } catch (error) {
          this._logService.error("AgentHostStarter was unable to resolve shell environment", error);
          return {};
        }
      }
      async _onWindowConnection(e, nonce) {
        if (e.sender.isDestroyed()) {
          return;
        }
        this._trackWindowSender(e.sender);
        let startPromise;
        try {
          this._onRequestConnection.fire({
            waitUntil: (promise) => {
              if (startPromise) {
                throw new Error("Agent Host start request was handled more than once.");
              }
              startPromise = promise;
            }
          });
          if (!startPromise) {
            throw new Error("Agent Host process manager is unavailable.");
          }
          await startPromise;
          const utilityProcess2 = this.utilityProcess;
          if (!utilityProcess2) {
            throw new Error("Agent Host process is not running.");
          }
          const port = utilityProcess2.connect();
          if (e.sender.isDestroyed()) {
            port.close();
            return;
          }
          e.sender.postMessage("vscode:createAgentHostMessageChannelResult", nonce, [port]);
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          this._logService.error(`AgentHostStarter: cannot create window connection: ${message}`);
          if (!e.sender.isDestroyed()) {
            e.sender.send("vscode:createAgentHostMessageChannelResult", {
              nonce,
              error: message,
              fatal: error instanceof AgentHostStartError && error.fatal
            });
          }
        }
      }
      _disposeUtilityProcess(utilityProcess2) {
        utilityProcess2.kill();
        utilityProcess2.dispose();
        if (this.utilityProcess === utilityProcess2) {
          this.utilityProcess = void 0;
        }
      }
      _notifyWindowsWillRestart() {
        for (const sender of this._windowSenders.values()) {
          if (!sender.isDestroyed()) {
            sender.send(AgentHostWillRestartIpcChannel);
          }
        }
      }
      _trackWindowSender(sender) {
        if (this._windowSenders.has(sender.id)) {
          return;
        }
        this._windowSenders.set(sender.id, sender);
        const onDestroyed = () => this._windowSenderCleanup.deleteAndDispose(sender.id);
        sender.once("destroyed", onDestroyed);
        this._windowSenderCleanup.set(sender.id, toDisposable(() => {
          sender.removeListener("destroyed", onDestroyed);
          this._windowSenders.delete(sender.id);
        }));
      }
      static {
        this._expectedStderrPatterns = [
          "Most NODE_OPTIONs are not supported in packaged apps",
          "Debugger listening on ws://",
          "For help, see: https://nodejs.org/en/docs/inspector",
          "ExperimentalWarning: SQLite is an experimental feature",
          "[copilot-sdk] CopilotClient.stop runtime shutdown complete."
        ];
      }
      _isExpectedStderr(data) {
        return ElectronAgentHostStarter._expectedStderrPatterns.some((pattern) => data.includes(pattern));
      }
    };
    ElectronAgentHostStarter = __decorateClass([
      __decorateParam(1, IConfigurationService),
      __decorateParam(2, IEnvironmentMainService),
      __decorateParam(3, ILifecycleMainService),
      __decorateParam(4, ILogService),
      __decorateParam(5, ITelemetryService)
    ], ElectronAgentHostStarter);
  }
});
export { ElectronAgentHostStarter, init_electronAgentHostStarter };
