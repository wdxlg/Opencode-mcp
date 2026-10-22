// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/terminalContrib/chatAgentTools/browser/terminal.chatAgentTools.contribution.ts
import { registerSingleton } from "./module-0135.mjs";
import { IWindowsMxcTerminalSandboxRuntime, WindowsMxcTerminalSandboxRuntime } from "./module-3121.mjs";
import { ITerminalSandboxService } from "./module-3125.mjs";
import { TerminalSandboxService } from "./module-3127.mjs";
import { Disposable, DisposableStore, MutableDisposable } from "./module-0012.mjs";
import { isNumber } from "./module-0010.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { WorkbenchPhase, registerWorkbenchContribution2 } from "./module-0872.mjs";
import { registerTerminalCompressors } from "./module-3165.mjs";
import { ConfirmTerminalCommandTool, ConfirmTerminalCommandToolData } from "./module-3157.mjs";
import { GetTerminalOutputTool, GetTerminalOutputToolData } from "./module-3154.mjs";
import { KillTerminalTool, KillTerminalToolData } from "./module-3153.mjs";
import { SendToTerminalTool, SendToTerminalToolData } from "./module-3155.mjs";
import { GetTerminalSelectionTool, GetTerminalSelectionToolData } from "./module-3156.mjs";
import { GetTerminalLastCommandTool, GetTerminalLastCommandToolData } from "./module-3104.mjs";
import { RunTaskTool, RunTaskToolData } from "./module-3162.mjs";
import { GetTaskOutputTool, GetTaskOutputToolData } from "./module-3161.mjs";
import { CreateAndRunTaskTool, CreateAndRunTaskToolData } from "./module-3160.mjs";
import { RunInTerminalTool, createRunInTerminalToolData } from "./module-3152.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { ILanguageModelToolsService } from "./module-0991.mjs";
import { IToolResultCompressor } from "./module-2717.mjs";
import { AgentHostSandboxForwarder } from "./module-3103.mjs";
import { registerActiveInstanceAction, sharedWhenClause } from "./module-3043.mjs";
import { localize } from "./module-0001.mjs";
import { ContextKeyExpr } from "./module-0089.mjs";
import { ChatContextKeys } from "./module-0966.mjs";
import { MenuId } from "./module-0092.mjs";
import { TerminalContextKeys } from "./module-1176.mjs";
import { IChatWidgetService } from "./module-0982.mjs";
import { Codicon } from "./module-0085.mjs";


// src/vs/workbench/contrib/terminalContrib/chatAgentTools/browser/terminal.chatAgentTools.contribution.ts
registerSingleton(IWindowsMxcTerminalSandboxRuntime, WindowsMxcTerminalSandboxRuntime, 1 /* Delayed */);

registerSingleton(ITerminalSandboxService, TerminalSandboxService, 1 /* Delayed */);

var ShellIntegrationTimeoutMigrationContribution = class extends Disposable {
  static {
    this.ID = "terminal.shellIntegrationTimeoutMigration";
  }
  constructor(configurationService) {
    super();
    const deprecated = configurationService.inspect("chat.tools.terminal.shellIntegrationTimeout" /* ShellIntegrationTimeout */);
    const target = configurationService.inspect("terminal.integrated.shellIntegration.timeout" /* ShellIntegrationTimeout */);
    if (deprecated.userValue !== void 0 && target.userValue === void 0 && isNumber(deprecated.userValue)) {
      configurationService.updateValue("terminal.integrated.shellIntegration.timeout" /* ShellIntegrationTimeout */, deprecated.userValue, 2 /* USER */);
    }
    if (deprecated.workspaceValue !== void 0 && target.workspaceValue === void 0 && isNumber(deprecated.workspaceValue)) {
      configurationService.updateValue("terminal.integrated.shellIntegration.timeout" /* ShellIntegrationTimeout */, deprecated.workspaceValue, 5 /* WORKSPACE */);
    }
  }
};

ShellIntegrationTimeoutMigrationContribution = __decorateClass([
  __decorateParam(0, IConfigurationService)
], ShellIntegrationTimeoutMigrationContribution);

registerWorkbenchContribution2(ShellIntegrationTimeoutMigrationContribution.ID, ShellIntegrationTimeoutMigrationContribution, WorkbenchPhase.Eventually);

var OutputLocationMigrationContribution = class extends Disposable {
  static {
    this.ID = "terminal.outputLocationMigration";
  }
  constructor(configurationService) {
    super();
    const currentValue = configurationService.getValue("chat.tools.terminal.outputLocation" /* OutputLocation */);
    if (currentValue === "none") {
      configurationService.updateValue("chat.tools.terminal.outputLocation" /* OutputLocation */, "chat");
    }
  }
};

OutputLocationMigrationContribution = __decorateClass([
  __decorateParam(0, IConfigurationService)
], OutputLocationMigrationContribution);

registerWorkbenchContribution2(OutputLocationMigrationContribution.ID, OutputLocationMigrationContribution, WorkbenchPhase.Eventually);

var ChatAgentToolsContribution = class extends Disposable {
  constructor(_instantiationService, _toolsService, _configurationService, toolResultCompressor) {
    super();
    this._instantiationService = _instantiationService;
    this._toolsService = _toolsService;
    this._configurationService = _configurationService;
    this._runInTerminalToolRegistration = this._register(new MutableDisposable());
    this._runInTerminalToolRegistrationVersion = 0;
    registerTerminalCompressors(toolResultCompressor);
    const confirmTerminalCommandTool = _instantiationService.createInstance(ConfirmTerminalCommandTool);
    this._register(_toolsService.registerTool(ConfirmTerminalCommandToolData, confirmTerminalCommandTool));
    const getTerminalOutputTool = _instantiationService.createInstance(GetTerminalOutputTool);
    this._register(_toolsService.registerTool(GetTerminalOutputToolData, getTerminalOutputTool));
    this._register(_toolsService.executeToolSet.addTool(GetTerminalOutputToolData));
    const killTerminalTool = _instantiationService.createInstance(KillTerminalTool);
    this._register(_toolsService.registerTool(KillTerminalToolData, killTerminalTool));
    this._register(_toolsService.executeToolSet.addTool(KillTerminalToolData));
    const sendToTerminalTool = _instantiationService.createInstance(SendToTerminalTool);
    this._register(_toolsService.registerTool(SendToTerminalToolData, sendToTerminalTool));
    this._register(_toolsService.executeToolSet.addTool(SendToTerminalToolData));
    this._registerRunInTerminalTool();
    const getTerminalSelectionTool = _instantiationService.createInstance(GetTerminalSelectionTool);
    this._register(_toolsService.registerTool(GetTerminalSelectionToolData, getTerminalSelectionTool));
    const getTerminalLastCommandTool = _instantiationService.createInstance(GetTerminalLastCommandTool);
    this._register(_toolsService.registerTool(GetTerminalLastCommandToolData, getTerminalLastCommandTool));
    this._register(_toolsService.readToolSet.addTool(GetTerminalSelectionToolData));
    this._register(_toolsService.readToolSet.addTool(GetTerminalLastCommandToolData));
    const runTaskTool = _instantiationService.createInstance(RunTaskTool);
    this._register(_toolsService.registerTool(RunTaskToolData, runTaskTool));
    const getTaskOutputTool = _instantiationService.createInstance(GetTaskOutputTool);
    this._register(_toolsService.registerTool(GetTaskOutputToolData, getTaskOutputTool));
    const createAndRunTaskTool = _instantiationService.createInstance(CreateAndRunTaskTool);
    this._register(_toolsService.registerTool(CreateAndRunTaskToolData, createAndRunTaskTool));
    this._register(_toolsService.executeToolSet.addTool(RunTaskToolData));
    this._register(_toolsService.executeToolSet.addTool(CreateAndRunTaskToolData));
    this._register(_toolsService.readToolSet.addTool(GetTaskOutputToolData));
    this._register(this._configurationService.onDidChangeConfiguration((e4) => {
      if (e4.affectsConfiguration("chat.agent.sandbox.enabled" /* AgentSandboxEnabled */) || e4.affectsConfiguration("chat.agent.sandbox.enabledWindows" /* AgentSandboxWindowsEnabled */) || e4.affectsConfiguration("chat.agent.sandbox.allowNetwork" /* AgentSandboxAllowNetwork */) || e4.affectsConfiguration("chat.agent.sandbox.allowUnsandboxedCommands" /* AgentSandboxAllowUnsandboxedCommands */) || e4.affectsConfiguration("chat.agent.allowedNetworkDomains" /* AllowedNetworkDomains */) || e4.affectsConfiguration("chat.agent.deniedNetworkDomains" /* DeniedNetworkDomains */) || e4.affectsConfiguration("chat.agent.sandbox.fileSystem.linux" /* AgentSandboxLinuxFileSystem */) || e4.affectsConfiguration("chat.agent.sandbox.fileSystem.mac" /* AgentSandboxMacFileSystem */) || e4.affectsConfiguration("chat.agent.sandbox.fileSystem.windows" /* AgentSandboxWindowsFileSystem */)) {
        this._registerRunInTerminalTool();
      }
    }));
  }
  static {
    this.ID = "terminal.chatAgentTools";
  }
  _registerRunInTerminalTool() {
    const version2 = ++this._runInTerminalToolRegistrationVersion;
    this._instantiationService.invokeFunction(createRunInTerminalToolData).then((runInTerminalToolData) => {
      if (this._store.isDisposed || version2 !== this._runInTerminalToolRegistrationVersion) {
        return;
      }
      if (!this._runInTerminalTool) {
        this._runInTerminalTool = this._register(this._instantiationService.createInstance(RunInTerminalTool));
      }
      this._runInTerminalToolRegistration.value = void 0;
      const store = new DisposableStore();
      store.add(this._toolsService.registerToolData(runInTerminalToolData));
      store.add(this._toolsService.registerToolImplementation(runInTerminalToolData.id, this._runInTerminalTool));
      store.add(this._toolsService.executeToolSet.addTool(runInTerminalToolData));
      this._runInTerminalToolRegistration.value = store;
    });
  }
};

ChatAgentToolsContribution = __decorateClass([
  __decorateParam(0, IInstantiationService),
  __decorateParam(1, ILanguageModelToolsService),
  __decorateParam(2, IConfigurationService),
  __decorateParam(3, IToolResultCompressor)
], ChatAgentToolsContribution);

registerWorkbenchContribution2(ChatAgentToolsContribution.ID, ChatAgentToolsContribution, WorkbenchPhase.AfterRestored);

registerWorkbenchContribution2(AgentHostSandboxForwarder.ID, AgentHostSandboxForwarder, WorkbenchPhase.AfterRestored);

registerActiveInstanceAction({
  id: "workbench.action.terminal.chat.addTerminalSelection" /* ChatAddTerminalSelection */,
  title: localize(20456, null),
  precondition: ContextKeyExpr.and(ChatContextKeys.enabled, sharedWhenClause.terminalAvailable),
  menu: [
    {
      id: MenuId.TerminalInstanceContext,
      group: "0_chat" /* Chat */,
      order: 1,
      when: ContextKeyExpr.and(ChatContextKeys.enabled, TerminalContextKeys.textSelected)
    }
  ],
  run: async (activeInstance, _c, accessor) => {
    const chatWidgetService = accessor.get(IChatWidgetService);
    const selection = activeInstance.selection;
    if (!selection) {
      return;
    }
    const chatView = chatWidgetService.lastFocusedWidget ?? await chatWidgetService.revealWidget();
    if (!chatView) {
      return;
    }
    chatView.attachmentModel.addContext({
      id: `terminal-selection-${Date.now()}`,
      kind: "generic",
      name: localize(20457, null),
      fullName: localize(20457, null),
      value: selection,
      icon: Codicon.terminal
    });
    chatView.focusInput();
  }
});
export { ShellIntegrationTimeoutMigrationContribution, OutputLocationMigrationContribution, ChatAgentToolsContribution };
