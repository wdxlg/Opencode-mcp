// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/tools/languageModelToolsService.ts
import { Registry } from "./module-0090.mjs";
import { Extensions3 } from "./module-0138.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { Disposable, DisposableStore, combinedDisposable, toDisposable } from "./module-0012.mjs";
import { Emitter, Event2 } from "./module-0017.mjs";
import { RunOnceScheduler, timeout } from "./module-0036.mjs";
import { ObservableSet } from "./module-0066.mjs";
import { derived, derivedOpts } from "./module-0054.mjs";
import { observableFromEventOpts } from "./module-0057.mjs";
import { arrayEqualsC } from "./module-0042.mjs";
import { observableConfigValue } from "./module-0444.mjs";
import { ChatContextKeys } from "./module-0966.mjs";
import { SpecedToolAliases, ToolAndToolSetEnablementMap, ToolDataSource, ToolSet, ToolSetForModel, VSCodeToolReference, createToolSchemaUri, isToolSet, stringifyPromptTsxPart, toolMatchesModel } from "./module-0991.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { Codicon } from "./module-0085.mjs";
import { Iterable } from "./module-0011.mjs";
import { observableSignal } from "./module-0058.mjs";
import { transaction } from "./module-0045.mjs";
import { ChatToolInvocation } from "./module-1190.mjs";
import { toErrorMessage } from "./module-0094.mjs";
import { CancellationError, isCancellationError } from "./module-0004.mjs";
import { CancellationToken, CancellationTokenSource } from "./module-0025.mjs";
import { IChatService, IChatToolInvocation } from "./module-0973.mjs";
import { StopWatch } from "./module-0016.mjs";
import { MarkdownString, createMarkdownCommandLink } from "./module-0462.mjs";
import { renderAsPlaintext } from "./module-0468.mjs";
import { chatSessionResourceToId, getChatSessionType } from "./module-0962.mjs";
import { localChatSessionType } from "./module-0961.mjs";
import { isAutoApproveLevel, isAutopilotLevel } from "./module-0965.mjs";
import { AccessibilitySignal, IAccessibilitySignalService } from "./module-0445.mjs";
import { getToolConfirmationAlert } from "./module-2184.mjs";
import { URI } from "./module-0032.mjs";
import { getMediaMime } from "./module-0136.mjs";
import { encodeBase64 } from "./module-0038.mjs";
import { assertNever } from "./module-0009.mjs";
import { severity_default } from "./module-0266.mjs";
import { toToolSetVariableEntry, toToolVariableEntry } from "./module-0980.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IExtensionService } from "./module-0889.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { IDialogService } from "./module-0267.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { ILogService } from "./module-0095.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IAccessibilityService } from "./module-0104.mjs";
import { IStorageService } from "./module-0512.mjs";
import { ILanguageModelToolsConfirmationService } from "./module-1473.mjs";
import { ICommandService } from "./module-0087.mjs";
import { IChatWidgetService } from "./module-0982.mjs";
import { IToolResultCompressor } from "./module-2717.mjs";
import { IChatToolRiskAssessmentService } from "./module-2279.mjs";


// src/vs/workbench/contrib/chat/browser/tools/languageModelToolsService.ts
var jsonSchemaRegistry = Registry.as(Extensions3.JSONContribution);

var SkipAutoApproveConfirmationKey = "vscode.chat.tools.global.autoApprove.testMode";

var autoApproveAllReason = "auto-approve-all";

var toolIdsThatCannotBeAutoApproved = /* @__PURE__ */ new Set([
  "vscode_get_confirmation_with_options",
  "vscode_get_modified_files_confirmation"
]);

var fetchWebPageToolIds = /* @__PURE__ */ new Set([
  "copilot_fetchWebPage",
  "vscode_fetchWebPage_internal"
]);

var globalAutoApproveDescription = localize2(
  11713,
  'Global auto approve also known as "YOLO mode" disables manual approval completely for _all tools in all workspaces_, allowing the agent to act fully autonomously. This is extremely dangerous and is *never* recommended, even containerized environments like [Codespaces](https://github.com/features/codespaces) and [Dev Containers](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers) have user keys forwarded into the container that could be compromised.\n\n**This feature disables [critical security protections](https://code.visualstudio.com/docs/agents/run/security) and makes it much easier for an attacker to compromise the machine.**\n\nNote: This setting only controls tool approval and does not prevent the agent from asking questions. To automatically answer agent questions, use the [`chat.autoReply`](command:workbench.action.openSettings?%5B%22chat.autoReply%22%5D) setting.'
);

var OPENCODE_TERMINAL_TOOL_IDS = /* @__PURE__ */ new Set([
  "opencode_run_command",
  "opencode_get_command_output",
  "opencode_send_command_input"
]);

function isOpenCodeTerminalTool(toolId) {
  return OPENCODE_TERMINAL_TOOL_IDS.has(toolId);
}

function extractOpenCodeOutputBlock(text2) {
  const match2 = text2.match(/--- OUTPUT BEGIN ---\r?\n([\s\S]*?)\r?\n--- OUTPUT END ---/);
  if (!match2) {
    return void 0;
  }
  const output = match2[1].replace(/\r\n/g, "\n").replace(/\r/g, "\n").trimEnd();
  return output || void 0;
}

function parseOpenCodeExitCode(text2) {
  const match2 = text2.match(/^exit_code: (-?\d+|null)$/m);
  if (!match2) {
    return void 0;
  }
  return match2[1] === "null" ? null : Number.parseInt(match2[1], 10);
}

var LanguageModelToolsService = class extends Disposable {
  constructor(_instantiationService, _extensionService, _contextKeyService, _chatService, _dialogService, _telemetryService, _logService, _configurationService, _accessibilityService, _accessibilitySignalService, _storageService, _confirmationService, _commandService, _chatWidgetService, _toolResultCompressor, _riskAssessmentService) {
    super();
    this._instantiationService = _instantiationService;
    this._extensionService = _extensionService;
    this._contextKeyService = _contextKeyService;
    this._chatService = _chatService;
    this._dialogService = _dialogService;
    this._telemetryService = _telemetryService;
    this._logService = _logService;
    this._configurationService = _configurationService;
    this._accessibilityService = _accessibilityService;
    this._accessibilitySignalService = _accessibilitySignalService;
    this._storageService = _storageService;
    this._confirmationService = _confirmationService;
    this._commandService = _commandService;
    this._chatWidgetService = _chatWidgetService;
    this._toolResultCompressor = _toolResultCompressor;
    this._riskAssessmentService = _riskAssessmentService;
    this._onDidChangeTools = this._register(new Emitter());
    this.onDidChangeTools = this._onDidChangeTools.event;
    this._onDidPrepareToolCallBecomeUnresponsive = this._register(new Emitter());
    this.onDidPrepareToolCallBecomeUnresponsive = this._onDidPrepareToolCallBecomeUnresponsive.event;
    this._onDidInvokeTool = this._register(new Emitter());
    this.onDidInvokeTool = this._onDidInvokeTool.event;
    /** Throttle tools updates because it sends all tools and runs on context key updates */
    this._onDidChangeToolsScheduler = this._register(new RunOnceScheduler(() => this._onDidChangeTools.fire(), 750));
    this._tools = /* @__PURE__ */ new Map();
    this._toolContextKeys = /* @__PURE__ */ new Set();
    this._callsByRequestId = /* @__PURE__ */ new Map();
    /** Pending tool calls in the streaming phase, keyed by toolCallId */
    this._pendingToolCalls = /* @__PURE__ */ new Map();
    this._toolSets = new ObservableSet();
    this.toolSets = derived(this, (reader) => {
      const allToolSets = Array.from(this._toolSets.observable.read(reader));
      return allToolSets.filter((toolSet) => this.isPermitted(toolSet, reader));
    });
    this.allToolsIncludingDisableObs = observableFromEventOpts(
      { equalsFn: arrayEqualsC() },
      this.onDidChangeTools,
      () => Array.from(this.getAllToolsIncludingDisabled())
    );
    this.toolsWithFullReferenceName = derived((reader) => {
      const result = [];
      const coveredByToolSets = /* @__PURE__ */ new Set();
      for (const toolSet of this.toolSets.read(reader)) {
        if (toolSet.source.type !== "user") {
          result.push([toolSet, getToolSetFullReferenceName(toolSet)]);
          for (const tool of toolSet.getTools()) {
            result.push([tool, getToolFullReferenceName(tool, toolSet)]);
            coveredByToolSets.add(tool);
          }
        }
      }
      for (const tool of this.allToolsIncludingDisableObs.read(reader)) {
        if (tool.when && !this._contextKeyService.contextMatchesRules(tool.when)) {
          continue;
        }
        if (tool.canBeReferencedInPrompt && !coveredByToolSets.has(tool) && this.isPermitted(tool, reader)) {
          result.push([tool, getToolFullReferenceName(tool)]);
        }
      }
      return result;
    });
    this._isAgentModeEnabled = observableConfigValue("chat.agent.enabled" /* AgentEnabled */, true, this._configurationService);
    this._register(this._contextKeyService.onDidChangeContext((e4) => {
      if (e4.affectsSome(this._toolContextKeys)) {
        this._onDidChangeToolsScheduler.schedule();
      }
    }));
    this._register(this._configurationService.onDidChangeConfiguration((e4) => {
      if (e4.affectsConfiguration("chat.extensionTools.enabled" /* ExtensionToolsEnabled */) || e4.affectsConfiguration("chat.agent.enabled" /* AgentEnabled */) || e4.affectsConfiguration("github.copilot.chat.gpt55ReadFileTool.enabled" /* Gpt55ReadFileToolEnabled */)) {
        this._onDidChangeToolsScheduler.schedule();
      }
    }));
    this._register(Event2.runAndSubscribe(this._configurationService.onDidChangeConfiguration, (e4) => {
      if (!e4 || e4.affectsConfiguration("chat.tools.global.autoApprove" /* GlobalAutoApprove */)) {
        if (this._configurationService.getValue("chat.tools.global.autoApprove" /* GlobalAutoApprove */) !== true) {
          this._storageService.remove("chat.tools.global.autoApprove.optIn" /* GlobalAutoApproveOptIn */, -1 /* APPLICATION */);
        }
      }
    }));
    this._ctxToolsCount = ChatContextKeys.Tools.toolsCount.bindTo(_contextKeyService);
    this.vscodeToolSet = this._register(this.createToolSet(
      ToolDataSource.Internal,
      "vscode",
      VSCodeToolReference.vscode,
      {
        icon: ThemeIcon.fromId(Codicon.vscode.id),
        description: localize(11719, null),
        deprecated: true
      }
    ));
    this.executeToolSet = this._register(this.createToolSet(
      ToolDataSource.Internal,
      "execute",
      SpecedToolAliases.execute,
      {
        icon: ThemeIcon.fromId(Codicon.terminal.id),
        description: localize(11717, null),
        deprecated: true
      }
    ));
    this.readToolSet = this._register(this.createToolSet(
      ToolDataSource.Internal,
      "read",
      SpecedToolAliases.read,
      {
        icon: ThemeIcon.fromId(Codicon.book.id),
        description: localize(11718, null),
        deprecated: true
      }
    ));
    this.agentToolSet = this._register(this.createToolSet(
      ToolDataSource.Internal,
      "agent",
      SpecedToolAliases.agent,
      {
        icon: ThemeIcon.fromId(Codicon.agent.id),
        description: localize(11716, null),
        deprecated: true
      }
    ));
  }
  isToolEnabledForModel(toolData, model) {
    if (!toolMatchesModel(toolData, model)) {
      return false;
    }
    if (toolData.id === "copilot_readFile" /* ReadFile */ && model?.family.startsWith("gpt-5.5") && this._configurationService.getValue("github.copilot.chat.gpt55ReadFileTool.enabled" /* Gpt55ReadFileToolEnabled */) === false) {
      return false;
    }
    return true;
  }
  /**
   * Returns if the given tool or toolset is permitted in the current context.
   * When agent mode is enabled, all tools are permitted (no restriction)
   * When agent mode is disabled only a subset of read-only tools are permitted in agentic-loop contexts.
   */
  isPermitted(toolOrToolSet, reader) {
    const agentModeEnabled = this._isAgentModeEnabled.read(reader);
    if (agentModeEnabled !== false) {
      return true;
    }
    if (!isToolSet(toolOrToolSet) && toolOrToolSet.canBeReferencedInPrompt === false && toolOrToolSet.source.type === "internal") {
      return true;
    }
    const permittedInternalToolSetIds = [SpecedToolAliases.read, SpecedToolAliases.search, SpecedToolAliases.web];
    if (isToolSet(toolOrToolSet)) {
      const permitted = toolOrToolSet.source.type === "internal" && permittedInternalToolSetIds.includes(toolOrToolSet.referenceName);
      this._logService.trace(`LanguageModelToolsService#isPermitted: ToolSet ${toolOrToolSet.id} (${toolOrToolSet.referenceName}) permitted=${permitted}`);
      return permitted;
    }
    for (const toolSet of this._toolSets) {
      if (toolSet.source.type === "internal" && permittedInternalToolSetIds.includes(toolSet.referenceName)) {
        for (const memberTool of toolSet.getTools()) {
          if (memberTool.id === toolOrToolSet.id) {
            this._logService.trace(`LanguageModelToolsService#isPermitted: Tool ${toolOrToolSet.id} (${toolOrToolSet.toolReferenceName}) permitted=true (member of ${toolSet.referenceName})`);
            return true;
          }
        }
      }
    }
    if (toolOrToolSet.id === "vscode_fetchWebPage_internal" && permittedInternalToolSetIds.includes(SpecedToolAliases.web)) {
      this._logService.trace(`LanguageModelToolsService#isPermitted: Tool ${toolOrToolSet.id} (${toolOrToolSet.toolReferenceName}) permitted=true (special case)`);
      return true;
    }
    this._logService.trace(`LanguageModelToolsService#isPermitted: Tool ${toolOrToolSet.id} (${toolOrToolSet.toolReferenceName}) permitted=false`);
    return false;
  }
  dispose() {
    super.dispose();
    this._callsByRequestId.forEach((calls) => calls.forEach((call) => call.store.dispose()));
    this._pendingToolCalls.clear();
    this._ctxToolsCount.reset();
  }
  registerToolData(toolData) {
    if (this._tools.has(toolData.id)) {
      throw new Error(`Tool "${toolData.id}" is already registered.`);
    }
    this._tools.set(toolData.id, { data: toolData });
    this._ctxToolsCount.set(this._tools.size);
    if (!this._onDidChangeToolsScheduler.isScheduled()) {
      this._onDidChangeToolsScheduler.schedule();
    }
    toolData.when?.keys().forEach((key3) => this._toolContextKeys.add(key3));
    let store;
    if (toolData.inputSchema) {
      store = new DisposableStore();
      const schemaUrl = createToolSchemaUri(toolData.id).toString();
      jsonSchemaRegistry.registerSchema(schemaUrl, toolData.inputSchema, store);
      store.add(jsonSchemaRegistry.registerSchemaAssociation(schemaUrl, `/lm/tool/${toolData.id}/tool_input.json`));
    }
    return toDisposable(() => {
      store?.dispose();
      this._tools.delete(toolData.id);
      this._ctxToolsCount.set(this._tools.size);
      this._refreshAllToolContextKeys();
      if (!this._onDidChangeToolsScheduler.isScheduled()) {
        this._onDidChangeToolsScheduler.schedule();
      }
    });
  }
  flushToolUpdates() {
    this._onDidChangeToolsScheduler.flush();
  }
  _refreshAllToolContextKeys() {
    this._toolContextKeys.clear();
    for (const tool of this._tools.values()) {
      tool.data.when?.keys().forEach((key3) => this._toolContextKeys.add(key3));
    }
  }
  registerToolImplementation(id2, tool) {
    const entry = this._tools.get(id2);
    if (!entry) {
      throw new Error(`Tool "${id2}" was not contributed.`);
    }
    if (entry.impl) {
      throw new Error(`Tool "${id2}" already has an implementation.`);
    }
    entry.impl = tool;
    return toDisposable(() => {
      entry.impl = void 0;
    });
  }
  registerTool(toolData, tool) {
    return combinedDisposable(
      this.registerToolData(toolData),
      this.registerToolImplementation(toolData.id, tool)
    );
  }
  getTools(model) {
    const toolDatas = Iterable.map(this._tools.values(), (i2) => i2.data);
    const extensionToolsEnabled = this._configurationService.getValue("chat.extensionTools.enabled" /* ExtensionToolsEnabled */);
    return Iterable.filter(
      toolDatas,
      (toolData) => {
        const satisfiesWhenClause = !toolData.when || this._contextKeyService.contextMatchesRules(toolData.when);
        const satisfiesExternalToolCheck = toolData.source.type !== "extension" || !!extensionToolsEnabled;
        const satisfiesPermittedCheck = this.isPermitted(toolData);
        const satisfiesModelFilter = this.isToolEnabledForModel(toolData, model);
        return satisfiesWhenClause && satisfiesExternalToolCheck && satisfiesPermittedCheck && satisfiesModelFilter;
      }
    );
  }
  observeTools(model) {
    const meta = derived((reader) => {
      const signal = observableSignal("observeToolsContext");
      const trigger = () => transaction((tx) => signal.trigger(tx));
      reader.store.add(this.onDidChangeTools(trigger));
      return signal;
    });
    return derivedOpts({ equalsFn: arrayEqualsC() }, (reader) => {
      meta.read(reader).read(reader);
      return Array.from(this.getTools(model));
    });
  }
  getAllToolsIncludingDisabled() {
    const toolDatas = Iterable.map(this._tools.values(), (i2) => i2.data);
    const extensionToolsEnabled = this._configurationService.getValue("chat.extensionTools.enabled" /* ExtensionToolsEnabled */);
    return Iterable.filter(
      toolDatas,
      (toolData) => {
        const satisfiesExternalToolCheck = toolData.source.type !== "extension" || !!extensionToolsEnabled;
        const satisfiesPermittedCheck = this.isPermitted(toolData);
        return satisfiesExternalToolCheck && satisfiesPermittedCheck;
      }
    );
  }
  getTool(id2) {
    return this._tools.get(id2)?.data;
  }
  getToolByName(name) {
    for (const tool of this.getAllToolsIncludingDisabled()) {
      if (tool.toolReferenceName === name) {
        return tool;
      }
    }
    return void 0;
  }
  _handlePreToolUseDenial(dto, hookResult, toolData, pendingInvocation, request2) {
    const hookReason = hookResult.permissionDecisionReason ?? localize(11725, null);
    const reason = localize(11723, null, "PreToolUse" /* PreToolUse */, hookReason);
    this._logService.debug(`[LanguageModelToolsService#invokeTool] Tool ${dto.toolId} denied by preToolUse hook: ${hookReason}`);
    if (toolData) {
      if (pendingInvocation) {
        pendingInvocation.presentation = "hidden" /* Hidden */;
        pendingInvocation.cancelFromStreaming(0 /* Denied */, reason);
      } else if (request2) {
        const cancelledInvocation = ChatToolInvocation.createCancelled(
          { toolCallId: dto.callId, toolId: dto.toolId, toolData, subagentInvocationId: dto.subAgentInvocationId, chatRequestId: dto.chatRequestId },
          dto.parameters,
          0 /* Denied */,
          reason
        );
        cancelledInvocation.presentation = "hidden" /* Hidden */;
        this._chatService.appendProgress(request2, cancelledInvocation);
      }
    }
    return {
      content: [{ kind: "text", value: `Tool execution denied: ${hookReason}` }],
      toolResultError: hookReason
    };
  }
  /**
   * Validate updatedInput from a preToolUse hook against the tool's input schema
   * using the json.validate command from the JSON extension.
   * @returns An error message string if validation fails, or undefined if valid.
   */
  async _validateUpdatedInput(toolId, toolData, updatedInput) {
    if (!toolData?.inputSchema) {
      return void 0;
    }
    try {
      const schemaUri = createToolSchemaUri(toolId);
      const inputJson = JSON.stringify(updatedInput);
      const diagnostics = await this._commandService.executeCommand("json.validate", schemaUri, inputJson) || [];
      if (diagnostics.length > 0) {
        return diagnostics.map((d) => d.message).join("; ");
      }
    } catch (e4) {
      this._logService.debug(`[LanguageModelToolsService#_validateUpdatedInput] json.validate command failed, skipping validation: ${toErrorMessage(e4)}`);
    }
    return void 0;
  }
  async invokeTool(dto, countTokens, token) {
    this._logService.trace(`[LanguageModelToolsService#invokeTool] Invoking tool ${dto.toolId} with parameters ${JSON.stringify(dto.parameters)}`);
    const toolData = this._tools.get(dto.toolId)?.data;
    let model;
    let request2;
    if (dto.context?.sessionResource) {
      model = this._chatService.getSession(dto.context.sessionResource);
      request2 = model?.getRequests().at(-1);
      if (request2?.response?.isCanceled || request2?.response?.isComplete) {
        this._logService.debug(`[LanguageModelToolsService#invokeTool] Ignoring tool ${dto.toolId} for cancelled/complete request ${request2.id}`);
        throw new CancellationError();
      }
      if (model?.workingDirectory && !dto.context.workingDirectory) {
        dto = { ...dto, context: { ...dto.context, workingDirectory: model.workingDirectory } };
      }
    }
    let pendingToolCallKey;
    let toolInvocation;
    if (this._pendingToolCalls.has(dto.callId)) {
      pendingToolCallKey = dto.callId;
      toolInvocation = this._pendingToolCalls.get(dto.callId);
    } else if (dto.chatStreamToolCallId && this._pendingToolCalls.has(dto.chatStreamToolCallId)) {
      pendingToolCallKey = dto.chatStreamToolCallId;
      toolInvocation = this._pendingToolCalls.get(dto.chatStreamToolCallId);
    }
    let requestId;
    let store;
    if (dto.context && request2) {
      requestId = request2.id;
      store = new DisposableStore();
      if (!this._callsByRequestId.has(requestId)) {
        this._callsByRequestId.set(requestId, []);
      }
      const trackedCall = { store };
      this._callsByRequestId.get(requestId).push(trackedCall);
      const source = new CancellationTokenSource();
      store.add(toDisposable(() => {
        source.dispose(true);
      }));
      store.add(token.onCancellationRequested((() => {
        IChatToolInvocation.confirmWith(toolInvocation, { type: 0 /* Denied */ });
        source.cancel();
      })));
      store.add(source.token.onCancellationRequested(() => {
        IChatToolInvocation.confirmWith(toolInvocation, { type: 0 /* Denied */ });
      }));
      token = source.token;
    }
    const preToolUseHookResult = dto.preToolUseResult;
    if (preToolUseHookResult?.permissionDecision === "deny") {
      const denialResult = this._handlePreToolUseDenial(dto, preToolUseHookResult, toolData, toolInvocation, request2);
      if (pendingToolCallKey) {
        this._pendingToolCalls.delete(pendingToolCallKey);
      }
      return denialResult;
    }
    if (preToolUseHookResult?.updatedInput) {
      const validationError = await this._validateUpdatedInput(dto.toolId, toolData, preToolUseHookResult.updatedInput);
      if (validationError) {
        this._logService.warn(`[LanguageModelToolsService#invokeTool] Tool ${dto.toolId} updatedInput from preToolUse hook failed schema validation: ${validationError}`);
      } else {
        this._logService.debug(`[LanguageModelToolsService#invokeTool] Tool ${dto.toolId} input modified by preToolUse hook`);
        dto.parameters = preToolUseHookResult.updatedInput;
      }
    }
    this._onDidInvokeTool.fire({
      toolId: dto.toolId,
      sessionResource: dto.context?.sessionResource,
      requestId: dto.chatRequestId,
      subagentInvocationId: dto.subAgentInvocationId
    });
    let tool = this._tools.get(dto.toolId);
    if (!tool) {
      throw new Error(`Tool ${dto.toolId} was not contributed`);
    }
    if (!tool.impl) {
      await this._extensionService.activateByEvent(`onLanguageModelTool:${dto.toolId}`);
      tool = this._tools.get(dto.toolId);
      if (!tool?.impl) {
        throw new Error(`Tool ${dto.toolId} does not have an implementation registered.`);
      }
    }
    const hadPendingInvocation = !!toolInvocation;
    if (hadPendingInvocation && pendingToolCallKey) {
      this._pendingToolCalls.delete(pendingToolCallKey);
    }
    let toolResult;
    let prepareTimeWatch;
    let invocationTimeWatch;
    let preparedInvocation;
    let activeTool = tool;
    try {
      if (dto.context) {
        if (!model) {
          throw new Error(`Tool called for unknown chat session`);
        }
        if (!request2) {
          throw new Error(`Tool called for unknown chat request`);
        }
        dto.modelId = request2.modelId;
        dto.userSelectedTools = request2.userSelectedTools && { ...request2.userSelectedTools };
        prepareTimeWatch = StopWatch.create(true);
        preparedInvocation = await this.prepareToolInvocationWithHookResult(tool, dto, preToolUseHookResult, token);
        prepareTimeWatch.stop();
        const { autoConfirmed: resolvedAutoConfirmed, preparedInvocation: updatedPreparedInvocation } = await this.resolveAutoConfirmFromHook(preToolUseHookResult, tool, dto, preparedInvocation, dto.context?.sessionResource);
        preparedInvocation = updatedPreparedInvocation;
        const preResolvedAutoConfirmed = resolvedAutoConfirmed ?? (preToolUseHookResult?.permissionDecision === "ask" ? void 0 : dto.preApproved);
        const { autoConfirmed, skipExplanation: riskSkipExplanation } = await this._maybeApplyAutopilotRiskGate(tool, dto, preparedInvocation, preResolvedAutoConfirmed, token);
        if (hadPendingInvocation && toolInvocation) {
          if (toolInvocation.state.get().type === IChatToolInvocation.StateKind.Streaming) {
            toolInvocation.transitionFromStreaming(preparedInvocation, dto.parameters, autoConfirmed);
          } else {
            toolInvocation.updatePreparedInvocation(preparedInvocation, dto.parameters);
          }
        } else {
          toolInvocation = new ChatToolInvocation(preparedInvocation, tool.data, dto.chatStreamToolCallId ?? dto.callId, dto.subAgentInvocationId, dto.parameters);
          if (autoConfirmed) {
            IChatToolInvocation.confirmWith(toolInvocation, autoConfirmed);
          }
          this._chatService.appendProgress(request2, toolInvocation);
        }
        dto.toolSpecificData = toolInvocation?.toolSpecificData;
        if (riskSkipExplanation) {
          this._logToolApprovalTelemetry(tool, dto, { type: 5 /* Skipped */ });
          this._chatService.appendProgress(request2, {
            kind: "info",
            content: new MarkdownString(localize(11715, null, tool.data.displayName, riskSkipExplanation))
          });
          toolResult = {
            content: [{
              kind: "text",
              value: `Autopilot skipped this tool call because it was automatically assessed as high-risk: ${riskSkipExplanation} The action was not performed. Do not retry it as-is \u2014 choose a safer approach or leave it for the user to run manually.`
            }]
          };
          return toolResult;
        }
        if (preparedInvocation?.confirmationMessages?.title) {
          if (!IChatToolInvocation.executionConfirmedOrDenied(toolInvocation) && !autoConfirmed) {
            this.playAccessibilitySignal([toolInvocation], dto.context?.sessionResource);
          }
          const userConfirmed = await IChatToolInvocation.awaitConfirmation(toolInvocation, token);
          this._logToolApprovalTelemetry(tool, dto, userConfirmed);
          if (userConfirmed.type === 0 /* Denied */) {
            throw new CancellationError();
          }
          if (userConfirmed.type === 5 /* Skipped */) {
            toolResult = {
              content: [{
                kind: "text",
                value: "The user chose to skip the tool call, they want to proceed without running it"
              }]
            };
            return toolResult;
          }
          if (userConfirmed.type === 4 /* UserAction */ && userConfirmed.selectedButton) {
            dto.selectedCustomButton = userConfirmed.selectedButton;
          }
          if (dto.toolSpecificData?.kind === "input") {
            dto.parameters = dto.toolSpecificData.rawInput;
            dto.toolSpecificData = void 0;
          }
        } else {
          this._logToolApprovalTelemetry(tool, dto, autoConfirmed ?? { type: 1 /* ConfirmationNotNeeded */ });
        }
      } else {
        prepareTimeWatch = StopWatch.create(true);
        preparedInvocation = await this.prepareToolInvocationWithHookResult(tool, dto, preToolUseHookResult, token);
        prepareTimeWatch.stop();
        const { autoConfirmed: fallbackAutoConfirmed, preparedInvocation: updatedPreparedInvocation } = await this.resolveAutoConfirmFromHook(preToolUseHookResult, tool, dto, preparedInvocation, void 0);
        preparedInvocation = updatedPreparedInvocation;
        const autoConfirmed = fallbackAutoConfirmed ?? (preToolUseHookResult?.permissionDecision === "ask" ? void 0 : dto.preApproved);
        if (preparedInvocation?.confirmationMessages?.title && !autoConfirmed) {
          const result = await this._dialogService.confirm({ message: renderAsPlaintext(preparedInvocation.confirmationMessages.title), detail: renderAsPlaintext(preparedInvocation.confirmationMessages.message) });
          if (!result.confirmed) {
            throw new CancellationError();
          }
        }
        dto.toolSpecificData = preparedInvocation?.toolSpecificData;
      }
      if (token.isCancellationRequested) {
        throw new CancellationError();
      }
      invocationTimeWatch = StopWatch.create(true);
      const currentTool = this._tools.get(dto.toolId);
      if (!currentTool) {
        throw new Error(`Tool ${dto.toolId} was not contributed`);
      }
      if (!currentTool.impl) {
        throw new Error(`Tool ${dto.toolId} does not have an implementation registered.`);
      }
      activeTool = currentTool;
      toolResult = await currentTool.impl.invoke(dto, countTokens, {
        report: (step) => {
          toolInvocation?.acceptProgress(step);
        }
      }, token);
      invocationTimeWatch.stop();
      const compressed = this._toolResultCompressor.maybeCompress(activeTool.data.id, dto.parameters, toolResult);
      if (compressed) {
        toolResult = compressed;
      }
      this.ensureToolDetails(dto, toolResult, activeTool.data, toolInvocation);
      const afterExecuteState = await toolInvocation?.didExecuteTool(toolResult, void 0, () => this.shouldAutoConfirmPostExecution(activeTool.data.id, activeTool.data.runsInWorkspace, activeTool.data.source, dto.parameters, dto.context?.sessionResource, dto.chatRequestId, dto.context?.workingDirectory));
      if (toolInvocation && afterExecuteState?.type === IChatToolInvocation.StateKind.WaitingForPostApproval) {
        const postConfirm = await IChatToolInvocation.awaitPostConfirmation(toolInvocation, token);
        if (postConfirm.type === 0 /* Denied */) {
          throw new CancellationError();
        }
        if (postConfirm.type === 5 /* Skipped */) {
          toolResult = {
            content: [{
              kind: "text",
              value: "The tool executed but the user chose not to share the results"
            }]
          };
        }
      }
      this._telemetryService.publicLog2(
        "languageModelToolInvoked",
        {
          result: "success",
          chatSessionId: dto.context?.sessionResource ? chatSessionResourceToId(dto.context.sessionResource) : void 0,
          toolId: activeTool.data.id,
          toolExtensionId: activeTool.data.source.type === "extension" ? activeTool.data.source.extensionId.value : void 0,
          toolSourceKind: activeTool.data.source.type,
          prepareTimeMs: prepareTimeWatch?.elapsed(),
          invocationTimeMs: invocationTimeWatch?.elapsed()
        }
      );
      return toolResult;
    } catch (err) {
      const result = isCancellationError(err) ? "userCancelled" : "error";
      this._telemetryService.publicLog2(
        "languageModelToolInvoked",
        {
          result,
          chatSessionId: dto.context?.sessionResource ? chatSessionResourceToId(dto.context.sessionResource) : void 0,
          toolId: activeTool.data.id,
          toolExtensionId: activeTool.data.source.type === "extension" ? activeTool.data.source.extensionId.value : void 0,
          toolSourceKind: activeTool.data.source.type,
          prepareTimeMs: prepareTimeWatch?.elapsed(),
          invocationTimeMs: invocationTimeWatch?.elapsed()
        }
      );
      if (!isCancellationError(err)) {
        this._logService.error(`[LanguageModelToolsService#invokeTool] Error from tool ${dto.toolId} with parameters ${JSON.stringify(dto.parameters)}:
${toErrorMessage(err, true)}`);
      }
      toolResult ??= { content: [] };
      toolResult.toolResultError = err instanceof Error ? err.message : String(err);
      if (activeTool.data.alwaysDisplayInputOutput) {
        toolResult.toolResultDetails = { input: this.formatToolInput(dto), output: [{ type: "embed", isText: true, value: String(err) }], isError: true };
      }
      throw err;
    } finally {
      toolInvocation?.didExecuteTool(toolResult, true);
      if (store) {
        this.cleanupCallDisposables(requestId, store);
      }
    }
  }
  async prepareToolInvocationWithHookResult(tool, dto, hookResult, token) {
    let forceConfirmationReason;
    if (hookResult?.permissionDecision === "ask") {
      const hookMessage = localize(11732, null, "PreToolUse" /* PreToolUse */);
      forceConfirmationReason = hookResult.permissionDecisionReason ? `${hookMessage}: ${hookResult.permissionDecisionReason}` : hookMessage;
    }
    return this.prepareToolInvocation(tool, dto, forceConfirmationReason, token);
  }
  _logToolApprovalTelemetry(tool, dto, reason) {
    const confirmKindNames = {
      [0 /* Denied */]: "denied",
      [1 /* ConfirmationNotNeeded */]: "confirmationNotNeeded",
      [2 /* Setting */]: "setting",
      [3 /* LmServicePerTool */]: "lmServicePerTool",
      [4 /* UserAction */]: "userAction",
      [5 /* Skipped */]: "skipped"
    };
    const allowedConfirmationNotNeededReasons = /* @__PURE__ */ new Set([autoApproveAllReason, "inlineChat"]);
    let confirmationNotNeededReason;
    if (reason.type === 1 /* ConfirmationNotNeeded */ && reason.reason) {
      const raw = typeof reason.reason === "string" ? reason.reason : reason.reason.value;
      confirmationNotNeededReason = allowedConfirmationNotNeededReasons.has(raw) ? raw : "other";
    }
    const terminalData = dto.toolSpecificData?.kind === "terminal" ? dto.toolSpecificData : void 0;
    this._telemetryService.publicLog2(
      "chat.toolApproval",
      {
        confirmKind: confirmKindNames[reason.type],
        requestId: dto.chatRequestId,
        settingId: reason.type === 2 /* Setting */ ? reason.id : void 0,
        lmServiceScope: reason.type === 3 /* LmServicePerTool */ ? reason.scope : void 0,
        customButtonKind: reason.type === 4 /* UserAction */ ? reason.selectedButtonKind : void 0,
        confirmationNotNeededReason,
        sandboxWrapped: terminalData?.commandLine.isSandboxWrapped,
        requestUnsandboxedExecution: terminalData?.requestUnsandboxedExecution,
        chatSessionId: dto.context?.sessionResource ? chatSessionResourceToId(dto.context.sessionResource) : void 0,
        toolId: tool.data.id,
        toolExtensionId: tool.data.source.type === "extension" ? tool.data.source.extensionId.value : void 0,
        toolSourceKind: tool.data.source.type
      }
    );
  }
  /**
   * Determines the auto-confirm decision based on a preToolUse hook result.
   * If the hook returned 'allow', auto-approves. If 'ask', forces confirmation
   * and ensures confirmation messages exist on `preparedInvocation`. Otherwise
   * falls back to normal auto-confirm logic.
   *
   * Returns the possibly-updated preparedInvocation along with the auto-confirm decision,
   * since when the hook returns 'ask' and preparedInvocation was undefined, we create one.
   */
  async resolveAutoConfirmFromHook(hookResult, tool, dto, preparedInvocation, sessionResource) {
    if (hookResult?.permissionDecision === "allow") {
      this._logService.debug(`[LanguageModelToolsService#invokeTool] Tool ${dto.toolId} auto-approved by preToolUse hook`);
      return { autoConfirmed: { type: 1 /* ConfirmationNotNeeded */, reason: localize(11724, null) }, preparedInvocation };
    }
    if (hookResult?.permissionDecision === "ask") {
      this._logService.debug(`[LanguageModelToolsService#invokeTool] Tool ${dto.toolId} requires confirmation (preToolUse hook returned 'ask')`);
      if (!preparedInvocation?.confirmationMessages?.title) {
        if (!preparedInvocation) {
          preparedInvocation = {};
        }
        const fullReferenceName = getToolFullReferenceName(tool.data);
        const hookReason = hookResult.permissionDecisionReason;
        const hookNote = hookReason ? localize(11727, null, "PreToolUse" /* PreToolUse */, hookReason) : localize(11726, null, "PreToolUse" /* PreToolUse */);
        preparedInvocation.confirmationMessages = {
          ...preparedInvocation.confirmationMessages,
          title: localize(11730, null, fullReferenceName),
          message: new MarkdownString(`_${hookNote}_`),
          allowAutoConfirm: false
        };
        preparedInvocation.toolSpecificData = {
          kind: "input",
          rawInput: dto.parameters
        };
      } else {
        const hookReason = hookResult.permissionDecisionReason;
        const hookNote = hookReason ? localize(11728, null, "PreToolUse" /* PreToolUse */, hookReason) : localize(11729, null, "PreToolUse" /* PreToolUse */);
        const existing = preparedInvocation.confirmationMessages;
        if (preparedInvocation.toolSpecificData?.kind === "terminal") {
          const existingDisclaimerText = existing.disclaimer ? typeof existing.disclaimer === "string" ? existing.disclaimer : existing.disclaimer.value : void 0;
          const combinedDisclaimer = existingDisclaimerText ? `${hookNote}

${existingDisclaimerText}` : hookNote;
          preparedInvocation.confirmationMessages = {
            ...existing,
            disclaimer: combinedDisclaimer,
            allowAutoConfirm: false
          };
        } else {
          const msgText = typeof existing.message === "string" ? existing.message : existing.message?.value ?? "";
          preparedInvocation.confirmationMessages = {
            ...existing,
            message: new MarkdownString(`_${hookNote}_

${msgText}`),
            allowAutoConfirm: false
          };
        }
      }
      return { autoConfirmed: void 0, preparedInvocation };
    }
    const approveCombination = preparedInvocation?.confirmationMessages?.approveCombination;
    let combination;
    if (approveCombination) {
      combination = {
        label: typeof approveCombination.label === "string" ? approveCombination.label : approveCombination.label.value,
        key: approveCombination.key
      };
    }
    const autoConfirmed = await this.shouldAutoConfirm(tool.data.id, tool.data.runsInWorkspace, tool.data.source, dto.parameters, sessionResource, dto.chatRequestId, combination, dto.context?.workingDirectory);
    return { autoConfirmed, preparedInvocation };
  }
  /**
   * In Autopilot, runs the risk classifier on an auto-approved call and skips it when the rating
   * is {@link ToolRiskLevel.Red}. Any other result returns the original auto-confirmation
   * unchanged.
   *
   * To keep the classifier off the hot path, it only runs when all of these hold:
   * - the call was auto-approved by the session approving everything, or is a `run_in_terminal` /
   *   fetch call that self-approved (these can run risky commands or prompt-injected URLs without
   *   ever showing a confirmation);
   * - it would otherwise show a confirmation (the self-approving tools above are the exception);
   * - the session is a local panel session at the Autopilot level with Advanced Autopilot on.
   *
   * This is independent of `chat.tools.riskAssessment.enabled`, which only controls the
   * confirmation risk badge. CLI and agent-host sessions handle their own confirmations and are
   * excluded.
   *
   * Fails open: a cancelled, unavailable, or failed assessment keeps the original
   * auto-confirmation so Autopilot keeps moving.
   */
  async _maybeApplyAutopilotRiskGate(tool, dto, preparedInvocation, autoConfirmed, token) {
    const isTerminalTool = tool.data.id === "run_in_terminal" /* RunInTerminal */;
    const isFetchTool = fetchWebPageToolIds.has(tool.data.id);
    const isAlwaysClassifyTool = isTerminalTool || isFetchTool;
    const isBlanketSessionApprove = autoConfirmed?.type === 1 /* ConfirmationNotNeeded */ && autoConfirmed.reason === autoApproveAllReason;
    const isSelfApprovedAlwaysClassify = isAlwaysClassifyTool && autoConfirmed === void 0 && !preparedInvocation?.confirmationMessages?.title;
    if (!isBlanketSessionApprove && !isSelfApprovedAlwaysClassify) {
      return { autoConfirmed };
    }
    if (!isAlwaysClassifyTool && !preparedInvocation?.confirmationMessages?.title) {
      return { autoConfirmed };
    }
    if (this._configurationService.getValue("chat.autopilot.advanced.enabled" /* AutopilotAdvancedEnabled */) !== true) {
      return { autoConfirmed };
    }
    const sessionResource = dto.context?.sessionResource;
    if (!sessionResource || getChatSessionType(sessionResource) !== localChatSessionType) {
      return { autoConfirmed };
    }
    if (!this._isSessionInAutopilotLevel(sessionResource)) {
      return { autoConfirmed };
    }
    try {
      const assessment = await this._riskAssessmentService.assess(tool.data, dto.parameters, token, void 0, { ignoreEnablement: true });
      if (token.isCancellationRequested) {
        return { autoConfirmed };
      }
      if (assessment?.risk === "red" /* Red */) {
        const fallbackExplanation = localize(11714, null);
        const explanation = assessment.explanation.trim() || fallbackExplanation;
        this._logService.info(`[LanguageModelToolsService#invokeTool] Autopilot skipping high-risk tool ${tool.data.id}: ${explanation}`);
        return { autoConfirmed: { type: 5 /* Skipped */ }, skipExplanation: explanation };
      }
    } catch (err) {
      this._logService.warn(`[LanguageModelToolsService#invokeTool] Autopilot risk assessment failed for tool ${tool.data.id}, allowing: ${toErrorMessage(err)}`);
    }
    return { autoConfirmed };
  }
  async prepareToolInvocation(tool, dto, forceConfirmationReason, token) {
    let prepared;
    if (tool.impl.prepareToolInvocation) {
      const preparePromise = tool.impl.prepareToolInvocation({
        parameters: dto.parameters,
        toolCallId: dto.callId,
        chatRequestId: dto.chatRequestId,
        chatSessionResource: dto.context?.sessionResource,
        chatInteractionId: dto.chatInteractionId,
        modelId: dto.modelId,
        forceConfirmationReason,
        workingDirectory: dto.context?.workingDirectory
      }, token);
      const raceResult = await Promise.race([
        timeout(3e3, token).then(() => "timeout"),
        preparePromise
      ]);
      if (raceResult === "timeout" && dto.context) {
        this._onDidPrepareToolCallBecomeUnresponsive.fire({
          sessionResource: dto.context.sessionResource,
          toolData: tool.data
        });
      }
      prepared = await preparePromise;
    }
    const isEligibleForAutoApproval = this.isToolEligibleForAutoApproval(tool.data);
    if (!isEligibleForAutoApproval && !prepared?.confirmationMessages?.title) {
      if (!prepared) {
        prepared = {};
      }
      const fullReferenceName = getToolFullReferenceName(tool.data);
      prepared.confirmationMessages = {
        ...prepared.confirmationMessages,
        title: localize(11722, null),
        message: localize(11721, null, fullReferenceName),
        disclaimer: toolIdsThatCannotBeAutoApproved.has(tool.data.id) ? void 0 : new MarkdownString(localize(11720, null, getToolFullReferenceName(tool.data), createMarkdownCommandLink({ text: "`" + "chat.tools.eligibleForAutoApproval" /* EligibleForAutoApproval */ + "`", id: "workbench.action.openSettings", arguments: ["chat.tools.eligibleForAutoApproval" /* EligibleForAutoApproval */], tooltip: localize(11731, null) }, false)), { isTrusted: true }),
        allowAutoConfirm: false
      };
    }
    if (!isEligibleForAutoApproval && prepared?.confirmationMessages?.title) {
      prepared.confirmationMessages.disclaimer = toolIdsThatCannotBeAutoApproved.has(tool.data.id) ? void 0 : new MarkdownString(localize(11720, null, getToolFullReferenceName(tool.data), createMarkdownCommandLink({ text: "`" + "chat.tools.eligibleForAutoApproval" /* EligibleForAutoApproval */ + "`", id: "workbench.action.openSettings", arguments: ["chat.tools.eligibleForAutoApproval" /* EligibleForAutoApproval */], tooltip: localize(11731, null) }, false)), { isTrusted: true });
    }
    if (prepared?.confirmationMessages?.title) {
      if (this._isAutoApprovePolicyRestricted()) {
        prepared.confirmationMessages.allowAutoConfirm = false;
      } else if (prepared.toolSpecificData?.kind !== "terminal" && prepared.confirmationMessages.allowAutoConfirm !== false) {
        prepared.confirmationMessages.allowAutoConfirm = isEligibleForAutoApproval;
      }
      if (!prepared.toolSpecificData && tool.data.alwaysDisplayInputOutput) {
        prepared.toolSpecificData = {
          kind: "input",
          rawInput: dto.parameters
        };
      }
    }
    return prepared;
  }
  beginToolCall(options3) {
    const toolEntry = this._tools.get(options3.toolId);
    if (!toolEntry) {
      return void 0;
    }
    if (!options3.force && !toolEntry.impl?.handleToolStream) {
      return void 0;
    }
    const invocation = ChatToolInvocation.createStreaming({
      toolCallId: options3.toolCallId,
      toolId: options3.toolId,
      toolData: toolEntry.data,
      subagentInvocationId: options3.subagentInvocationId,
      chatRequestId: options3.chatRequestId
    });
    this._pendingToolCalls.set(options3.toolCallId, invocation);
    if (options3.sessionResource) {
      const model = this._chatService.getSession(options3.sessionResource);
      if (model) {
        const request2 = (options3.chatRequestId ? model.getRequests().find((r2) => r2.id === options3.chatRequestId) : void 0) ?? model.getRequests().at(-1);
        if (request2) {
          this._chatService.appendProgress(request2, invocation);
        }
      }
    }
    this._callHandleToolStream(toolEntry, invocation, options3.toolCallId, void 0, CancellationToken.None);
    return invocation;
  }
  async _callHandleToolStream(toolEntry, invocation, toolCallId, rawInput, token) {
    if (!toolEntry.impl?.handleToolStream) {
      return;
    }
    try {
      const result = await toolEntry.impl.handleToolStream({
        toolCallId,
        rawInput,
        chatRequestId: invocation.chatRequestId
      }, token);
      if (result?.invocationMessage) {
        invocation.updateStreamingMessage(result.invocationMessage);
      }
    } catch (error) {
      this._logService.error(`[LanguageModelToolsService#_callHandleToolStream] Error calling handleToolStream for tool ${toolEntry.data.id}:`, error);
    }
  }
  async updateToolStream(toolCallId, partialInput, token) {
    const invocation = this._pendingToolCalls.get(toolCallId);
    if (!invocation) {
      return;
    }
    invocation.updatePartialInput(partialInput);
    const toolEntry = this._tools.get(invocation.toolId);
    if (toolEntry) {
      await this._callHandleToolStream(toolEntry, invocation, toolCallId, partialInput, token);
    }
  }
  playAccessibilitySignal(toolInvocations, chatSessionResource) {
    const autoApproved = this._configurationService.getValue("chat.tools.global.autoApprove" /* GlobalAutoApprove */);
    if (autoApproved) {
      return;
    }
    if (chatSessionResource) {
      const model = this._chatService.getSession(chatSessionResource);
      const request2 = model?.getRequests().at(-1);
      if (isAutoApproveLevel(request2?.modeInfo?.permissionLevel) || this._isSessionLiveAutoApproveLevel(chatSessionResource)) {
        return;
      }
    }
    const pendingInvocations = toolInvocations.filter((inv) => !IChatToolInvocation.executionConfirmedOrDenied(inv));
    if (pendingInvocations.length === 0) {
      return;
    }
    const setting = this._configurationService.getValue(AccessibilitySignal.chatUserActionRequired.settingsKey);
    if (!setting) {
      return;
    }
    const soundEnabled = setting.sound === "on" || setting.sound === "auto" && this._accessibilityService.isScreenReaderOptimized();
    const announcementEnabled = this._accessibilityService.isScreenReaderOptimized() && setting.announcement === "auto";
    if (soundEnabled || announcementEnabled) {
      this._accessibilitySignalService.playSignal(AccessibilitySignal.chatUserActionRequired, { customAlertMessage: this._instantiationService.invokeFunction(getToolConfirmationAlert, pendingInvocations), userGesture: true, modality: !soundEnabled ? "announcement" : void 0 });
    }
  }
  ensureToolDetails(dto, toolResult, toolData, toolInvocation) {
    if (!toolResult.toolResultDetails) {
      const terminalDetails = this.getOpenCodeTerminalDetails(dto, toolResult);
      if (terminalDetails) {
        toolResult.toolResultDetails = terminalDetails;
        return;
      }
    }
    if (!toolResult.toolResultDetails && (toolData.alwaysDisplayInputOutput || this.toolResultHasImages(toolResult) && !this.toolResultMessageHasImageFileWidgets(toolResult, toolInvocation))) {
      toolResult.toolResultDetails = {
        input: this.formatToolInput(dto),
        output: this.toolResultToIO(toolResult)
      };
    }
  }
  /**
   * OpenCode terminal tools (`opencode_run_command`, `opencode_get_command_output`,
   * `opencode_send_command_input`) return the full terminal transcript as plain text.
   * Shape it as structured input/output details so the Chat UI renders a compact,
   * collapsible terminal step: the command as the input block (shell syntax), the captured
   * output as the output block, and a failure state derived from the exit code. Without
   * this the raw transcript would otherwise surface as unstructured text and break the
   * step-list layout.
   */
  getOpenCodeTerminalDetails(dto, toolResult) {
    if (!isOpenCodeTerminalTool(dto.toolId)) {
      return void 0;
    }
    const text2 = toolResult.content.map((part) => part.kind === "text" ? part.value : "").join("\n");
    const parameters = dto.parameters;
    const input = dto.toolId === "opencode_run_command" ? typeof parameters.command === "string" ? parameters.command : "" : dto.toolId === "opencode_send_command_input" ? typeof parameters.input === "string" ? parameters.input : "" : typeof parameters.command_id === "string" ? parameters.command_id : "";
    const output = extractOpenCodeOutputBlock(text2) ?? text2;
    const exitCode = parseOpenCodeExitCode(text2);
    return {
      input,
      inputLanguage: "shell",
      output: [{ type: "embed", isText: true, value: output }],
      isError: exitCode !== void 0 && exitCode !== null && exitCode !== 0
    };
  }
  toolResultHasImages(toolResult) {
    return toolResult.content.some((part) => part.kind === "data" && part.value.mimeType?.startsWith("image/"));
  }
  /**
   * Returns true if the tool result message (or falling back to the tool invocation's
   * pastTenseMessage from streaming) contains empty markdown links pointing to image
   * files (the `[](imageUri)` pattern) that will be rendered as file pills by renderFileWidgets.
   */
  toolResultMessageHasImageFileWidgets(toolResult, toolInvocation) {
    const message = toolResult.toolResultMessage ?? toolInvocation?.pastTenseMessage;
    if (!message) {
      return false;
    }
    const value2 = typeof message === "string" ? message : message.value;
    const linkPattern2 = /\[\s*\]\((?<uri>[^)]+)\)/g;
    let match2;
    while ((match2 = linkPattern2.exec(value2)) !== null) {
      try {
        const parsed = URI.parse(match2.groups.uri);
        const mime = getMediaMime(parsed.path);
        if (mime?.startsWith("image/")) {
          return true;
        }
      } catch {
      }
    }
    return false;
  }
  formatToolInput(dto) {
    return JSON.stringify(dto.parameters, void 0, 2);
  }
  toolResultToIO(toolResult) {
    return toolResult.content.map((part) => {
      if (part.kind === "text") {
        return { type: "embed", isText: true, value: part.value };
      } else if (part.kind === "promptTsx") {
        return { type: "embed", isText: true, value: stringifyPromptTsxPart(part) };
      } else if (part.kind === "data") {
        return { type: "embed", value: encodeBase64(part.value.data), mimeType: part.value.mimeType };
      } else {
        assertNever(part);
      }
    });
  }
  /**
   * Returns true if enterprise policy has explicitly disabled the global auto-approve setting.
   * When this is the case, Bypass Approvals and Autopilot permission levels should not auto-approve tools.
   */
  _isAutoApprovePolicyRestricted() {
    const inspected = this._configurationService.inspect("chat.tools.global.autoApprove" /* GlobalAutoApprove */);
    return inspected.policyValue === false;
  }
  /**
   * Returns true if the session's current (live) permission picker level is auto-approve.
   * This checks the widget's current state, not what was stamped on the request,
   * so switching to Autopilot mid-session takes effect immediately.
   */
  _isSessionLiveAutoApproveLevel(chatSessionResource) {
    const widget = this._chatWidgetService.getWidgetBySessionResource(chatSessionResource) ?? this._chatWidgetService.lastFocusedWidget;
    return !!widget && isAutoApproveLevel(widget.input.currentModeInfo.permissionLevel);
  }
  /**
   * True if the session is in an auto-approve level (Auto-Approve / Autopilot),
   * via either the last request's stamped level or the live picker level.
   */
  _isSessionInAutoApproveLevel(chatSessionResource) {
    if (!chatSessionResource) {
      return false;
    }
    const model = this._chatService.getSession(chatSessionResource);
    const request2 = model?.getRequests().at(-1);
    return isAutoApproveLevel(request2?.modeInfo?.permissionLevel) || this._isSessionLiveAutoApproveLevel(chatSessionResource);
  }
  /**
   * True if the session's live permission picker level is Autopilot. Like
   * {@link _isSessionLiveAutoApproveLevel}, but excludes plain Auto-Approve.
   */
  _isSessionLiveAutopilotLevel(chatSessionResource) {
    const widget = this._chatWidgetService.getWidgetBySessionResource(chatSessionResource) ?? this._chatWidgetService.lastFocusedWidget;
    return !!widget && isAutopilotLevel(widget.input.currentModeInfo.permissionLevel);
  }
  /**
   * True if the session is at the Autopilot level (not plain Auto-Approve), via either the last
   * request's stamped level or the live picker level.
   */
  _isSessionInAutopilotLevel(chatSessionResource) {
    if (!chatSessionResource) {
      return false;
    }
    const model = this._chatService.getSession(chatSessionResource);
    const request2 = model?.getRequests().at(-1);
    return isAutopilotLevel(request2?.modeInfo?.permissionLevel) || this._isSessionLiveAutopilotLevel(chatSessionResource);
  }
  getEligibleForAutoApprovalSpecialCase(toolData) {
    if (toolData.id === "vscode_fetchWebPage_internal") {
      return "fetch";
    }
    return void 0;
  }
  isToolEligibleForAutoApproval(toolData) {
    const fullReferenceName = this.getEligibleForAutoApprovalSpecialCase(toolData) ?? getToolFullReferenceName(toolData);
    if (toolData.id === "copilot_fetchWebPage") {
      return true;
    }
    if (toolIdsThatCannotBeAutoApproved.has(toolData.id)) {
      return false;
    }
    const eligibilityConfig = this._configurationService.getValue("chat.tools.eligibleForAutoApproval" /* EligibleForAutoApproval */);
    if (eligibilityConfig && typeof eligibilityConfig === "object" && fullReferenceName) {
      if (Object.prototype.hasOwnProperty.call(eligibilityConfig, fullReferenceName)) {
        return eligibilityConfig[fullReferenceName];
      }
      if (toolData.legacyToolReferenceFullNames) {
        for (const legacyName of toolData.legacyToolReferenceFullNames) {
          if (Object.prototype.hasOwnProperty.call(eligibilityConfig, legacyName)) {
            return eligibilityConfig[legacyName];
          }
          if (legacyName.includes("/")) {
            const trimmedLegacyName = legacyName.split("/").pop();
            if (trimmedLegacyName && Object.prototype.hasOwnProperty.call(eligibilityConfig, trimmedLegacyName)) {
              return eligibilityConfig[trimmedLegacyName];
            }
          }
        }
      }
    }
    return true;
  }
  async shouldAutoConfirm(toolId, runsInWorkspace, source, parameters, chatSessionResource, chatRequestId, combination, workingDirectory) {
    const tool = this._tools.get(toolId);
    if (!tool) {
      return void 0;
    }
    if (chatSessionResource && !this._isAutoApprovePolicyRestricted() && this._isSessionInAutoApproveLevel(chatSessionResource)) {
      if (!(toolIdsThatCannotBeAutoApproved.has(tool.data.id) && getChatSessionType(chatSessionResource) !== localChatSessionType)) {
        return { type: 1 /* ConfirmationNotNeeded */, reason: autoApproveAllReason };
      }
    }
    if (!this.isToolEligibleForAutoApproval(tool.data)) {
      return void 0;
    }
    const reason = this._confirmationService.getPreConfirmAction({ toolId, source, parameters, chatSessionResource, workingDirectory, combination });
    if (reason) {
      return reason;
    }
    const config = this._configurationService.inspect("chat.tools.global.autoApprove" /* GlobalAutoApprove */);
    let value2 = config.value ?? config.defaultValue;
    if (typeof runsInWorkspace === "boolean") {
      value2 = config.userLocalValue ?? config.applicationValue;
      if (runsInWorkspace) {
        value2 = config.workspaceValue ?? config.workspaceFolderValue ?? config.userRemoteValue ?? value2;
      }
    }
    const autoConfirm = value2 === true || typeof value2 === "object" && value2.hasOwnProperty(toolId) && value2[toolId] === true;
    if (autoConfirm) {
      if (await this._checkGlobalAutoApprove()) {
        return { type: 2 /* Setting */, id: "chat.tools.global.autoApprove" /* GlobalAutoApprove */ };
      }
    }
    return void 0;
  }
  async shouldAutoConfirmPostExecution(toolId, runsInWorkspace, source, parameters, chatSessionResource, chatRequestId, workingDirectory) {
    const sessionAutoApprove = chatSessionResource && !this._isAutoApprovePolicyRestricted() && this._isSessionInAutoApproveLevel(chatSessionResource);
    if (sessionAutoApprove) {
      if (!(toolIdsThatCannotBeAutoApproved.has(toolId) && getChatSessionType(chatSessionResource) !== localChatSessionType)) {
        return { type: 1 /* ConfirmationNotNeeded */, reason: autoApproveAllReason };
      }
    }
    if (this._configurationService.getValue("chat.tools.global.autoApprove" /* GlobalAutoApprove */) && !sessionAutoApprove && await this._checkGlobalAutoApprove()) {
      return { type: 2 /* Setting */, id: "chat.tools.global.autoApprove" /* GlobalAutoApprove */ };
    }
    return this._confirmationService.getPostConfirmAction({ toolId, source, parameters, chatSessionResource, workingDirectory });
  }
  async _checkGlobalAutoApprove() {
    const optedIn = this._storageService.getBoolean("chat.tools.global.autoApprove.optIn" /* GlobalAutoApproveOptIn */, -1 /* APPLICATION */, false);
    if (optedIn) {
      return true;
    }
    if (this._contextKeyService.getContextKeyValue(SkipAutoApproveConfirmationKey) === true) {
      return true;
    }
    if (this._pendingGlobalAutoApproveCheck) {
      return this._pendingGlobalAutoApproveCheck;
    }
    this._pendingGlobalAutoApproveCheck = this._doCheckGlobalAutoApprove();
    try {
      return await this._pendingGlobalAutoApproveCheck;
    } finally {
      this._pendingGlobalAutoApproveCheck = void 0;
    }
  }
  async _doCheckGlobalAutoApprove() {
    const store = new DisposableStore();
    try {
      const cts = new CancellationTokenSource();
      store.add(cts);
      store.add(this._storageService.onDidChangeValue(-1 /* APPLICATION */, "chat.tools.global.autoApprove.optIn" /* GlobalAutoApproveOptIn */, store)(() => {
        if (this._storageService.getBoolean("chat.tools.global.autoApprove.optIn" /* GlobalAutoApproveOptIn */, -1 /* APPLICATION */, false)) {
          cts.cancel();
        }
      }));
      const promptResult = await this._dialogService.prompt({
        type: severity_default.Warning,
        message: localize(11712, null),
        buttons: [
          {
            label: localize(11711, null),
            run: () => true
          },
          {
            label: localize(11710, null),
            run: () => false
          }
        ],
        custom: {
          icon: Codicon.warning,
          markdownDetails: [{
            markdown: new MarkdownString(globalAutoApproveDescription.value, { isTrusted: { enabledCommands: ["workbench.action.openSettings"] } })
          }]
        },
        token: cts.token
      });
      if (cts.token.isCancellationRequested) {
        return true;
      }
      if (promptResult.result !== true) {
        await this._configurationService.updateValue("chat.tools.global.autoApprove" /* GlobalAutoApprove */, false);
        return false;
      }
      this._storageService.store("chat.tools.global.autoApprove.optIn" /* GlobalAutoApproveOptIn */, true, -1 /* APPLICATION */, 0 /* USER */);
      return true;
    } finally {
      store.dispose();
    }
  }
  cleanupCallDisposables(requestId, store) {
    if (requestId) {
      const disposables = this._callsByRequestId.get(requestId);
      if (disposables) {
        const index2 = disposables.findIndex((d) => d.store === store);
        if (index2 > -1) {
          disposables.splice(index2, 1);
        }
        if (disposables.length === 0) {
          this._callsByRequestId.delete(requestId);
        }
      }
    }
    store.dispose();
  }
  cancelToolCallsForRequest(requestId) {
    const calls = this._callsByRequestId.get(requestId);
    if (calls) {
      calls.forEach((call) => call.store.dispose());
      this._callsByRequestId.delete(requestId);
    }
    for (const [toolCallId, invocation] of this._pendingToolCalls) {
      if (invocation.chatRequestId === requestId) {
        this._pendingToolCalls.delete(toolCallId);
      }
    }
  }
  static {
    this.githubMCPServerAliases = ["github/github-mcp-server", "io.github.github/github-mcp-server", "github-mcp-server"];
  }
  static {
    this.playwrightMCPServerAliases = ["microsoft/playwright-mcp", "com.microsoft/playwright-mcp"];
  }
  *getToolSetAliases(toolSet, fullReferenceName) {
    if (fullReferenceName !== toolSet.referenceName) {
      yield toolSet.referenceName;
    }
    if (toolSet.legacyFullNames) {
      yield* toolSet.legacyFullNames;
    }
    switch (toolSet.referenceName) {
      case "github":
        for (const alias of LanguageModelToolsService.githubMCPServerAliases) {
          yield alias + "/*";
        }
        break;
      case "playwright":
        for (const alias of LanguageModelToolsService.playwrightMCPServerAliases) {
          yield alias + "/*";
        }
        break;
      case SpecedToolAliases.execute:
        yield "shell";
        break;
      case SpecedToolAliases.agent:
        yield VSCodeToolReference.runSubagent;
        yield "custom-agent";
        break;
    }
  }
  *getToolAliases(toolSet, fullReferenceName) {
    const referenceName = toolSet.toolReferenceName ?? toolSet.displayName;
    if (fullReferenceName !== referenceName && referenceName !== VSCodeToolReference.runSubagent) {
      yield referenceName;
    }
    if (toolSet.legacyToolReferenceFullNames) {
      for (const legacyName of toolSet.legacyToolReferenceFullNames) {
        yield legacyName;
        const lastSlashIndex = legacyName.lastIndexOf("/");
        if (lastSlashIndex !== -1) {
          yield legacyName.substring(lastSlashIndex + 1);
        }
      }
    }
    const slashIndex = fullReferenceName.lastIndexOf("/");
    if (slashIndex !== -1) {
      switch (fullReferenceName.substring(0, slashIndex)) {
        case "github":
          for (const alias of LanguageModelToolsService.githubMCPServerAliases) {
            yield alias + fullReferenceName.substring(slashIndex);
          }
          break;
        case "playwright":
          for (const alias of LanguageModelToolsService.playwrightMCPServerAliases) {
            yield alias + fullReferenceName.substring(slashIndex);
          }
          break;
      }
    }
  }
  /**
   * Create a map that contains all tools and toolsets with their enablement state.
   * @param fullReferenceNames A list of tool or toolset by their full reference names that are enabled.
   * @returns A map of tool or toolset instances to their enablement state.
   */
  toToolAndToolSetEnablementMap(fullReferenceNames, model) {
    const toolOrToolSetNames = new Set(fullReferenceNames);
    const result = /* @__PURE__ */ new Map();
    for (const [tool, fullReferenceName] of this.toolsWithFullReferenceName.get()) {
      if (isToolSet(tool)) {
        const enabled = toolOrToolSetNames.has(fullReferenceName) || Iterable.some(this.getToolSetAliases(tool, fullReferenceName), (name) => toolOrToolSetNames.has(name));
        const scoped = model ? new ToolSetForModel(tool, model) : tool;
        result.set(scoped, enabled);
        if (enabled) {
          for (const memberTool of scoped.getTools()) {
            result.set(memberTool, true);
          }
        }
      } else {
        if (!this.isToolEnabledForModel(tool, model)) {
          continue;
        }
        if (!result.has(tool)) {
          const enabled = toolOrToolSetNames.has(fullReferenceName) || Iterable.some(this.getToolAliases(tool, fullReferenceName), (name) => toolOrToolSetNames.has(name)) || !!tool.legacyToolReferenceFullNames?.some((toolFullName) => {
            const index2 = toolFullName.lastIndexOf("/");
            return index2 !== -1 && toolOrToolSetNames.has(toolFullName.substring(0, index2));
          });
          result.set(tool, enabled);
        }
      }
    }
    for (const toolSet of this._toolSets) {
      if (toolSet.source.type === "user") {
        const enabled = Iterable.every(toolSet.getTools(), (t2) => result.get(t2) === true);
        result.set(toolSet, enabled);
      }
    }
    return ToolAndToolSetEnablementMap.fromMap(result);
  }
  toFullReferenceNames(map) {
    const result = [];
    const toolsCoveredByEnabledToolSet = /* @__PURE__ */ new Set();
    const enabledToolSetIds = /* @__PURE__ */ new Set();
    const enabledToolIds = /* @__PURE__ */ new Set();
    for (const [tool, enabled] of map) {
      if (enabled) {
        if (isToolSet(tool)) {
          enabledToolSetIds.add(tool.id);
        } else {
          enabledToolIds.add(tool.id);
        }
      }
    }
    for (const [tool, fullReferenceName] of this.toolsWithFullReferenceName.get()) {
      if (isToolSet(tool)) {
        if (enabledToolSetIds.has(tool.id)) {
          result.push(fullReferenceName);
          for (const memberTool of tool.getTools()) {
            toolsCoveredByEnabledToolSet.add(memberTool);
          }
        }
      } else {
        if (enabledToolIds.has(tool.id) && !toolsCoveredByEnabledToolSet.has(tool)) {
          result.push(fullReferenceName);
        }
      }
    }
    return result;
  }
  toToolReferences(variableReferences) {
    const toolsOrToolSetByName = /* @__PURE__ */ new Map();
    for (const [tool, fullReferenceName] of this.toolsWithFullReferenceName.get()) {
      toolsOrToolSetByName.set(fullReferenceName, tool);
    }
    const result = [];
    for (const ref of variableReferences) {
      const toolOrToolSet = toolsOrToolSetByName.get(ref.name);
      if (toolOrToolSet) {
        if (isToolSet(toolOrToolSet)) {
          result.push(toToolSetVariableEntry(toolOrToolSet, ref.range));
        } else {
          result.push(toToolVariableEntry(toolOrToolSet, ref.range));
        }
      }
    }
    return result;
  }
  getToolSetsForModel(model, reader) {
    if (!model) {
      return this.toolSets.read(reader);
    }
    return Iterable.map(this.toolSets.read(reader), (ts) => new ToolSetForModel(ts, model, (toolData) => this.isToolEnabledForModel(toolData, model)));
  }
  getToolSet(id2) {
    for (const toolSet of this._toolSets) {
      if (toolSet.id === id2) {
        return toolSet;
      }
    }
    return void 0;
  }
  getToolSetByName(name) {
    for (const toolSet of this._toolSets) {
      if (toolSet.referenceName === name) {
        return toolSet;
      }
    }
    return void 0;
  }
  getSpecedToolSetName(referenceName) {
    if (LanguageModelToolsService.githubMCPServerAliases.includes(referenceName)) {
      return "github";
    }
    if (LanguageModelToolsService.playwrightMCPServerAliases.includes(referenceName)) {
      return "playwright";
    }
    return referenceName;
  }
  createToolSet(source, id2, referenceName, options3) {
    const that = this;
    referenceName = this.getSpecedToolSetName(referenceName);
    const result = new class extends ToolSet {
      dispose() {
        if (that._toolSets.has(result)) {
          this._tools.clear();
          that._toolSets.delete(result);
        }
      }
    }(id2, referenceName, options3?.icon ?? Codicon.tools, source, options3?.description, options3?.detail, options3?.legacyFullNames, options3?.deprecated, options3?.hiddenInToolsPicker, this._contextKeyService);
    this._toolSets.add(result);
    return result;
  }
  *getFullReferenceNames() {
    for (const [, fullReferenceName] of this.toolsWithFullReferenceName.get()) {
      yield fullReferenceName;
    }
  }
  getDeprecatedFullReferenceNames() {
    const result = /* @__PURE__ */ new Map();
    const knownToolSetNames = /* @__PURE__ */ new Set();
    const add = (name, fullReferenceName) => {
      if (name !== fullReferenceName) {
        if (!result.has(name)) {
          result.set(name, /* @__PURE__ */ new Set());
        }
        result.get(name).add(fullReferenceName);
      }
    };
    for (const [tool, _] of this.toolsWithFullReferenceName.get()) {
      if (isToolSet(tool)) {
        knownToolSetNames.add(tool.referenceName);
        if (tool.legacyFullNames) {
          for (const legacyName of tool.legacyFullNames) {
            knownToolSetNames.add(legacyName);
          }
        }
      }
    }
    for (const [tool, fullReferenceName] of this.toolsWithFullReferenceName.get()) {
      if (isToolSet(tool)) {
        for (const alias of this.getToolSetAliases(tool, fullReferenceName)) {
          add(alias, fullReferenceName);
        }
      } else {
        for (const alias of this.getToolAliases(tool, fullReferenceName)) {
          add(alias, fullReferenceName);
        }
        if (tool.legacyToolReferenceFullNames) {
          const slashIndex = fullReferenceName.lastIndexOf("/");
          const toolSetPrefix = slashIndex !== -1 ? fullReferenceName.substring(0, slashIndex + 1) : void 0;
          for (const legacyName of tool.legacyToolReferenceFullNames) {
            if (toolSetPrefix && !legacyName.includes("/")) {
              add(toolSetPrefix + legacyName, fullReferenceName);
            }
            if (legacyName.includes("/")) {
              const toolSetFullName = legacyName.substring(0, legacyName.lastIndexOf("/"));
              if (!knownToolSetNames.has(toolSetFullName)) {
                add(toolSetFullName, fullReferenceName);
              }
            }
          }
        }
      }
    }
    return result;
  }
  getToolByFullReferenceName(fullReferenceName) {
    for (const [tool, toolFullReferenceName] of this.toolsWithFullReferenceName.get()) {
      if (fullReferenceName === toolFullReferenceName) {
        return tool;
      }
      const aliases = isToolSet(tool) ? this.getToolSetAliases(tool, toolFullReferenceName) : this.getToolAliases(tool, toolFullReferenceName);
      if (Iterable.some(aliases, (alias) => fullReferenceName === alias)) {
        return tool;
      }
    }
    return void 0;
  }
  getFullReferenceName(tool, toolSet) {
    for (const [item, toolFullReferenceName] of this.toolsWithFullReferenceName.get()) {
      if (item === tool) {
        return toolFullReferenceName;
      }
    }
    if (isToolSet(tool)) {
      return getToolSetFullReferenceName(tool);
    }
    return getToolFullReferenceName(tool, toolSet);
  }
  getFullReferenceNameMap() {
    const result = /* @__PURE__ */ new Map();
    for (const [item, toolFullReferenceName] of this.toolsWithFullReferenceName.get()) {
      result.set(item, toolFullReferenceName);
    }
    return result;
  }
};

LanguageModelToolsService = __decorateClass([
  __decorateParam(0, IInstantiationService),
  __decorateParam(1, IExtensionService),
  __decorateParam(2, IContextKeyService),
  __decorateParam(3, IChatService),
  __decorateParam(4, IDialogService),
  __decorateParam(5, ITelemetryService),
  __decorateParam(6, ILogService),
  __decorateParam(7, IConfigurationService),
  __decorateParam(8, IAccessibilityService),
  __decorateParam(9, IAccessibilitySignalService),
  __decorateParam(10, IStorageService),
  __decorateParam(11, ILanguageModelToolsConfirmationService),
  __decorateParam(12, ICommandService),
  __decorateParam(13, IChatWidgetService),
  __decorateParam(14, IToolResultCompressor),
  __decorateParam(15, IChatToolRiskAssessmentService)
], LanguageModelToolsService);

function getToolFullReferenceName(tool, toolSet) {
  const toolName = tool.toolReferenceName ?? tool.displayName;
  if (toolSet) {
    return `${toolSet.referenceName}/${toolName}`;
  } else if (tool.source.type === "extension") {
    return `${tool.source.extensionId.value.toLowerCase()}/${toolName}`;
  }
  return toolName;
}

function getToolSetFullReferenceName(toolSet) {
  if (toolSet.source.type === "mcp") {
    return `${toolSet.referenceName}/*`;
  }
  return toolSet.referenceName;
}
export { isOpenCodeTerminalTool, extractOpenCodeOutputBlock, parseOpenCodeExitCode, getToolFullReferenceName, getToolSetFullReferenceName, jsonSchemaRegistry, SkipAutoApproveConfirmationKey, autoApproveAllReason, toolIdsThatCannotBeAutoApproved, fetchWebPageToolIds, globalAutoApproveDescription, OPENCODE_TERMINAL_TOOL_IDS, LanguageModelToolsService };
