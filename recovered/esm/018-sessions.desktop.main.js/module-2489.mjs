// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/common/tools/builtinTools/runSubagentTool.ts
import { Disposable, DisposableStore } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { ILanguageModelToolsService, ToolDataSource, VSCodeToolReference, isToolSet } from "./module-0991.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { Codicon } from "./module-0085.mjs";
import { localize } from "./module-0001.mjs";
import { createToolSimpleTextResult } from "./module-2488.mjs";
import { isBuiltinAgent } from "./module-2137.mjs";
import { generateUuid } from "./module-0190.mjs";
import { MarkdownString } from "./module-0462.mjs";
import { ManageTodoListToolToolId } from "./module-2486.mjs";
import { ChatRequestVariableSet } from "./module-0980.mjs";
import { ComputeAutomaticInstructions } from "./module-2479.mjs";
import { getChatSessionType } from "./module-0962.mjs";
import { mergeHooks } from "./module-1012.mjs";
import { CancellationToken } from "./module-0025.mjs";
import { COPILOT_VENDOR_ID, ILanguageModelChatMetadata, ILanguageModelsService } from "./module-0968.mjs";
import { isByokModel } from "./module-2040.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IChatAgentService } from "./module-0975.mjs";
import { IChatService } from "./module-0973.mjs";
import { ILogService } from "./module-0095.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IPromptsService } from "./module-0987.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IProductService } from "./module-0875.mjs";


// src/vs/workbench/contrib/chat/common/tools/builtinTools/runSubagentTool.ts
var BaseModelDescription = `Launch a new agent to handle complex, multi-step tasks autonomously. This tool is good at researching complex questions, searching for code, and executing multi-step tasks. When you are searching for a keyword or file and are not confident that you will find the right match in the first few tries, use this agent to perform the search for you.

- Agents do not run async or in the background, you will wait for the agent's result.
- When the agent is done, it will return a single message back to you. The result returned by the agent is not visible to the user. To show the user the result, you should send a text message back to the user with a concise summary of the result.
- Each agent invocation is stateless. You will not be able to send additional messages to the agent, nor will the agent be able to communicate with you outside of its final report. Therefore, your prompt should contain a highly detailed task description for the agent to perform autonomously and you should specify exactly what information the agent should return back to you in its final and only message to you.
- The agent's outputs should generally be trusted
- Clearly tell the agent whether you expect it to write code or just to do research (search, file reads, web fetches, etc.), since it is not aware of the user's intent
- If the user asks for a certain agent, you MUST provide that EXACT agent name (case-sensitive) to invoke that specific agent.`;

var RUN_SUBAGENT_MAX_NESTING_DEPTH = 5;

var RunSubagentTool = class extends Disposable {
  constructor(chatAgentService, chatService, languageModelToolsService, languageModelsService, logService, configurationService, promptsService, instantiationService, productService) {
    super();
    this.chatAgentService = chatAgentService;
    this.chatService = chatService;
    this.languageModelToolsService = languageModelToolsService;
    this.languageModelsService = languageModelsService;
    this.logService = logService;
    this.configurationService = configurationService;
    this.promptsService = promptsService;
    this.instantiationService = instantiationService;
    this.productService = productService;
    this._onDidUpdateToolData = this._register(new Emitter());
    this.onDidUpdateToolData = this._onDidUpdateToolData.event;
    /** Hack to port data between prepare/invoke */
    this._resolvedModels = /* @__PURE__ */ new Map();
    /** Tracks the current subagent nesting depth per session to detect and limit recursion. */
    this._sessionDepth = /* @__PURE__ */ new Map();
  }
  static {
    this.Id = "runSubagent";
  }
  getToolData() {
    const modelDescription = BaseModelDescription;
    const properties = {
      prompt: {
        type: "string",
        description: "A detailed description of the task for the agent to perform"
      },
      description: {
        type: "string",
        description: "A short (3-5 word) description of the task"
      }
    };
    properties.agentName = {
      type: "string",
      description: "Optional name of a specific agent to invoke. If not provided, uses the current agent."
    };
    properties.model = {
      type: "string",
      description: 'Optional model for the subagent. Format: "Model Name (Vendor)", vendor is usually "copilot". Only use to enforce a specific model.'
    };
    const inputSchema3 = {
      type: "object",
      properties,
      required: ["prompt", "description"]
    };
    const runSubagentToolData = {
      id: RunSubagentTool.Id,
      toolReferenceName: VSCodeToolReference.runSubagent,
      icon: ThemeIcon.fromId(Codicon.organization.id),
      displayName: localize(13443, null),
      userDescription: localize(13444, null),
      modelDescription,
      source: ToolDataSource.Internal,
      inputSchema: inputSchema3
    };
    return runSubagentToolData;
  }
  async invoke(invocation, _countTokens, _progress, token) {
    const args2 = invocation.parameters;
    this.logService.debug(`RunSubagentTool: Invoking with prompt: ${args2.prompt.substring(0, 100)}...`);
    if (!invocation.context) {
      throw new Error("toolInvocationToken is required for this tool");
    }
    const model = this.chatService.getSession(invocation.context.sessionResource);
    if (!model) {
      throw new Error("Chat model not found for session");
    }
    const request2 = model.getRequests().at(-1);
    let subagentCredits;
    const store = new DisposableStore();
    try {
      const defaultAgent = this.chatAgentService.getDefaultAgent("panel" /* Chat */, "agent" /* Agent */);
      if (!defaultAgent) {
        return createToolSimpleTextResult("Error: No default agent available");
      }
      let modeModelId = invocation.modelId;
      let modeTools = invocation.userSelectedTools;
      let modeInstructions;
      let subagent;
      let resolvedModelName;
      const currentModeInstructions = request2.modeInfo?.modeInstructions;
      const subAgentName = this.normalizeRequestedAgentName(args2.agentName);
      const effectiveSubAgentName = subAgentName ?? currentModeInstructions?.name;
      if (subAgentName) {
        this.validateSubagentAllowed(subAgentName, currentModeInstructions);
        subagent = await this.getSubAgentByName(subAgentName);
        if (subagent) {
          const cached = this._resolvedModels.get(invocation.callId);
          if (cached) {
            this._resolvedModels.delete(invocation.callId);
            modeModelId = cached.modeModelId;
            resolvedModelName = cached.resolvedModelName;
          } else {
            const resolved = this.resolveSubagentModel(subagent, invocation.modelId, args2.model);
            modeModelId = resolved.modeModelId;
            resolvedModelName = resolved.resolvedModelName;
          }
          const modeCustomTools = subagent.tools;
          if (modeCustomTools) {
            const enablementMap = this.languageModelToolsService.toToolAndToolSetEnablementMap(modeCustomTools, void 0);
            modeTools = {};
            for (const [tool, enabled] of enablementMap) {
              if (!isToolSet(tool)) {
                modeTools[tool.id] = enabled;
              }
            }
          }
          const instructions = subagent.agentInstructions;
          modeInstructions = instructions && {
            name: subAgentName,
            content: instructions.content,
            toolReferences: instructions.toolReferences.length ? this.languageModelToolsService.toToolReferences(instructions.toolReferences) : [],
            allowedSubagents: subagent.agents,
            metadata: instructions.metadata,
            isBuiltin: isBuiltinAgent(subagent.source, subagent.uri, this.productService)
          };
        } else {
          this._resolvedModels.delete(invocation.callId);
          throw new Error(`Requested agent '${subAgentName}' not found. Try again with the correct agent name, or omit agentName to use the current agent.`);
        }
      } else {
        modeInstructions = currentModeInstructions;
        const cached = this._resolvedModels.get(invocation.callId);
        if (cached) {
          this._resolvedModels.delete(invocation.callId);
          modeModelId = cached.modeModelId;
          resolvedModelName = cached.resolvedModelName;
        } else {
          const resolved = this.resolveSubagentModel(void 0, invocation.modelId, args2.model);
          modeModelId = resolved.modeModelId;
          resolvedModelName = resolved.resolvedModelName;
        }
      }
      const markdownParts = [];
      const subAgentInvocationId = invocation.chatStreamToolCallId ?? invocation.callId ?? `subagent-${generateUuid()}`;
      let inEdit = false;
      const progressCallback = (parts) => {
        for (const part of parts) {
          if (part.kind === "usage") {
            if (typeof part.copilotCredits === "number" && Number.isFinite(part.copilotCredits) && part.copilotCredits >= 0) {
              subagentCredits = Math.max(subagentCredits ?? 0, part.copilotCredits);
            }
            continue;
          }
          if (part.kind === "textEdit" || part.kind === "notebookEdit" || part.kind === "codeblockUri") {
            if (part.kind === "codeblockUri" && !inEdit) {
              inEdit = true;
              model.acceptResponseProgress(request2, { kind: "markdownContent", content: new MarkdownString("```\n") });
            }
            if (part.kind === "codeblockUri") {
              model.acceptResponseProgress(request2, { ...part, subAgentInvocationId });
            } else {
              model.acceptResponseProgress(request2, part);
            }
          } else if (part.kind === "hook") {
            model.acceptResponseProgress(request2, { ...part, subAgentInvocationId });
          } else if (part.kind === "markdownContent") {
            if (inEdit) {
              model.acceptResponseProgress(request2, { kind: "markdownContent", content: new MarkdownString("\n```\n\n") });
              inEdit = false;
            }
            markdownParts.push(part.content.value);
          }
        }
      };
      const allowInvocationsFromSubagents = this.configurationService.getValue("chat.subagents.allowInvocationsFromSubagents" /* SubagentsAllowInvocationsFromSubagents */) ?? false;
      const maxDepth = allowInvocationsFromSubagents ? RUN_SUBAGENT_MAX_NESTING_DEPTH : 0;
      const sessionKey = invocation.context.sessionResource.toString();
      const currentDepth = this._sessionDepth.get(sessionKey) ?? 0;
      const depthAllowed = currentDepth + 1 <= maxDepth;
      if (!modeTools) {
        modeTools = {};
      }
      const existingRunSubagentEnablement = modeTools[RunSubagentTool.Id];
      if (existingRunSubagentEnablement !== false) {
        modeTools[RunSubagentTool.Id] = depthAllowed;
      }
      modeTools[ManageTodoListToolToolId] = false;
      modeTools["copilot_askQuestions"] = false;
      if (maxDepth > 0) {
        this.logService.debug(`RunSubagentTool: Nested subagents enabling ${modeTools[RunSubagentTool.Id]}: session ${sessionKey}, currentDepth: ${currentDepth}, maxDepth: ${maxDepth}, allowInvocationsFromSubagents: ${allowInvocationsFromSubagents}`);
      }
      const variableSet = new ChatRequestVariableSet();
      if (this.configurationService.getValue("chat.experimental.collectInstructionsInExtension" /* CollectInstructionsInExtension */) !== true) {
        const computer = this.instantiationService.createInstance(ComputeAutomaticInstructions, "agent" /* Agent */, modeTools, modeInstructions?.allowedSubagents, getChatSessionType(invocation.context.sessionResource));
        await computer.collect(variableSet, token);
      }
      let collectedHooks;
      try {
        const info = await this.promptsService.getHooks(token);
        collectedHooks = info?.hooks;
      } catch (error) {
        this.logService.warn("[ChatService] Failed to collect hooks:", error);
      }
      if (subagent?.hooks) {
        const remapped = { ...subagent.hooks };
        if (remapped["Stop" /* Stop */]) {
          const stopHooks = remapped["Stop" /* Stop */];
          remapped["SubagentStop" /* SubagentStop */] = remapped["SubagentStop" /* SubagentStop */] ? [...remapped["SubagentStop" /* SubagentStop */], ...stopHooks] : stopHooks;
          remapped["Stop" /* Stop */] = void 0;
        }
        collectedHooks = mergeHooks(collectedHooks, remapped);
      }
      const agentRequest = {
        sessionResource: invocation.context.sessionResource,
        requestId: invocation.callId ?? `subagent-${Date.now()}`,
        agentId: defaultAgent.id,
        message: args2.prompt,
        variables: { variables: variableSet.asArray() },
        location: "panel" /* Chat */,
        subAgentInvocationId,
        subAgentName: effectiveSubAgentName,
        userSelectedModelId: modeModelId,
        modelConfiguration: modeModelId ? this.languageModelsService.getModelConfiguration(modeModelId) : void 0,
        userSelectedTools: modeTools,
        modeInstructions,
        parentRequestId: invocation.chatRequestId,
        hooks: collectedHooks,
        hasHooksEnabled: !!collectedHooks && Object.values(collectedHooks).some((arr) => arr && arr.length > 0)
      };
      store.add(this.languageModelToolsService.onDidInvokeTool((e4) => {
        if (e4.subagentInvocationId === subAgentInvocationId) {
          markdownParts.length = 0;
        }
      }));
      this._sessionDepth.set(sessionKey, currentDepth + 1);
      let result;
      try {
        result = await this.chatAgentService.invokeAgent(
          defaultAgent.id,
          agentRequest,
          progressCallback,
          [],
          token
        );
      } finally {
        const newDepth = (this._sessionDepth.get(sessionKey) ?? 1) - 1;
        if (newDepth <= 0) {
          this._sessionDepth.delete(sessionKey);
        } else {
          this._sessionDepth.set(sessionKey, newDepth);
        }
      }
      if (result?.errorDetails) {
        return createToolSimpleTextResult(`Agent error: ${result.errorDetails.message}`);
      }
      const resultText = markdownParts.join("").replace(/^\n*```\n+```\n*/g, "").trim() || "Agent completed with no output";
      if (invocation.toolSpecificData?.kind === "subagent") {
        invocation.toolSpecificData.result = resultText;
        invocation.toolSpecificData.modelName = resolvedModelName;
      }
      return {
        content: [{
          kind: "text",
          value: resultText
        }],
        toolMetadata: {
          subAgentInvocationId,
          description: args2.description,
          agentName: agentRequest.subAgentName,
          modelName: resolvedModelName
        }
      };
    } catch (error) {
      const errorMessage = `Error invoking subagent: ${error instanceof Error ? error.message : "Unknown error"}`;
      this.logService.error(errorMessage, error);
      return createToolSimpleTextResult(errorMessage);
    } finally {
      if (subagentCredits !== void 0) {
        request2.response?.setSubagentCopilotCredits(invocation.callId, subagentCredits);
        if (invocation.toolSpecificData?.kind === "subagent") {
          invocation.toolSpecificData.credits = subagentCredits;
        }
      }
      store.dispose();
    }
  }
  async getSubAgentByName(name) {
    const agents = await this.promptsService.getCustomAgents(CancellationToken.None);
    return agents.find((agent) => agent.name === name && agent.enabled);
  }
  /**
   * Checks if a model exceeds the main model's cost tier based on multiplier.
   * @returns An object with `exceeds: true` and a reason string if blocked, or `exceeds: false` if allowed.
   */
  checkMultiplierConstraint(modelId, mainModelId) {
    if (!mainModelId || modelId === mainModelId) {
      return { exceeds: false };
    }
    const mainModelMetadata = this.languageModelsService.lookupLanguageModel(mainModelId);
    const modelMetadata = this.languageModelsService.lookupLanguageModel(modelId);
    const mainMultiplier = mainModelMetadata?.multiplierNumeric;
    const modelMultiplier = modelMetadata?.multiplierNumeric;
    if (mainMultiplier !== void 0 && modelMultiplier !== void 0 && modelMultiplier > mainMultiplier) {
      return {
        exceeds: true,
        reason: `exceeds the current model's cost tier (${modelMultiplier}x vs ${mainMultiplier}x)`
      };
    }
    return { exceeds: false };
  }
  /**
   * Returns information about available models for error messages.
   * Includes which models are unavailable due to multiplier restrictions.
   */
  getAvailableModelsInfo(mainModelId) {
    const models = this.languageModelsService.getLanguageModelIds().map((id2) => ({ id: id2, metadata: this.languageModelsService.lookupLanguageModel(id2) })).filter(
      (m) => !!m.metadata && ILanguageModelChatMetadata.suitableForAgentMode(m.metadata) && m.metadata.isUserSelectable !== false && !m.metadata.targetChatSessionType
    );
    if (models.length === 0) {
      return "No models available.";
    }
    const available = [];
    const unavailableDueToMultiplier = [];
    for (const { id: id2, metadata } of models) {
      const qualifiedName = ILanguageModelChatMetadata.asQualifiedName(metadata);
      const check = this.checkMultiplierConstraint(id2, mainModelId);
      if (check.exceeds) {
        unavailableDueToMultiplier.push(qualifiedName);
      } else {
        available.push(qualifiedName);
      }
    }
    const parts = [];
    if (available.length > 0) {
      parts.push(`Available models: ${available.join(", ")}`);
    }
    if (unavailableDueToMultiplier.length > 0) {
      parts.push(`Unavailable (exceeds current model's cost tier): ${unavailableDueToMultiplier.join(", ")}`);
    }
    return parts.join(". ") || "No models available.";
  }
  /**
   * Resolves the model to be used by a subagent.
   * @param explicitModelQualifiedName Optional explicit model specified by the caller.
   *        If provided and not found or not allowed, throws an error with available models.
   * @throws Error if the requested model is not found or exceeds the main model's cost tier.
   */
  resolveSubagentModel(subagent, mainModelId, explicitModelQualifiedName) {
    let modeModelId = mainModelId;
    let explicitModelResolved = false;
    if (explicitModelQualifiedName) {
      const lm = this.languageModelsService.lookupLanguageModelByQualifiedName(explicitModelQualifiedName);
      if (lm?.identifier) {
        modeModelId = lm.identifier;
        explicitModelResolved = true;
      } else {
        throw new Error(`Requested model '${explicitModelQualifiedName}' not found. ${this.getAvailableModelsInfo(mainModelId)}`);
      }
    }
    if (subagent && !explicitModelResolved) {
      const modeModelQualifiedNames = subagent.model;
      if (modeModelQualifiedNames) {
        const mainModelMetadata = mainModelId ? this.languageModelsService.lookupLanguageModel(mainModelId) : void 0;
        const mainModelIsByok = !!mainModelMetadata && isByokModel(mainModelMetadata);
        const skipCopilotFallbacks = mainModelIsByok && isBuiltinAgent(subagent.source, subagent.uri, this.productService);
        for (const qualifiedName of modeModelQualifiedNames) {
          const lmByQualifiedName = this.languageModelsService.lookupLanguageModelByQualifiedName(qualifiedName);
          if (lmByQualifiedName?.identifier) {
            if (skipCopilotFallbacks && lmByQualifiedName.metadata.vendor === COPILOT_VENDOR_ID) {
              continue;
            }
            modeModelId = lmByQualifiedName.identifier;
            break;
          }
        }
      }
    }
    if (modeModelId) {
      const check = this.checkMultiplierConstraint(modeModelId, mainModelId);
      if (check.exceeds) {
        const modelMetadata = this.languageModelsService.lookupLanguageModel(modeModelId);
        throw new Error(`Requested model '${modelMetadata?.name}' ${check.reason}. ${this.getAvailableModelsInfo(mainModelId)}`);
      }
    }
    const resolvedModelMetadata = modeModelId ? this.languageModelsService.lookupLanguageModel(modeModelId) : void 0;
    return { modeModelId, resolvedModelName: resolvedModelMetadata?.name };
  }
  async prepareToolInvocation(context2, _token) {
    const args2 = context2.parameters;
    const requestedAgentName = this.normalizeRequestedAgentName(args2.agentName);
    const currentModeInstructions = context2.chatSessionResource ? this.getCurrentModeInstructions(context2.chatSessionResource) : void 0;
    if (requestedAgentName) {
      this.validateSubagentAllowed(requestedAgentName, currentModeInstructions);
    }
    const subagent = requestedAgentName ? await this.getSubAgentByName(requestedAgentName) : void 0;
    const resolved = this.resolveSubagentModel(subagent, context2.modelId, args2.model);
    this._resolvedModels.set(context2.toolCallId, resolved);
    return {
      invocationMessage: args2.description,
      toolSpecificData: {
        kind: "subagent",
        description: args2.description,
        agentName: subagent?.name ?? requestedAgentName ?? currentModeInstructions?.name,
        prompt: args2.prompt,
        modelName: resolved.resolvedModelName
      }
    };
  }
  normalizeRequestedAgentName(agentName) {
    const normalized = agentName?.trim();
    return normalized ? normalized : void 0;
  }
  getCurrentModeInstructions(sessionResource) {
    if (typeof this.chatService.getSession !== "function") {
      return void 0;
    }
    const model = this.chatService.getSession(sessionResource);
    return model?.getRequests().at(-1)?.modeInfo?.modeInstructions;
  }
  validateSubagentAllowed(subAgentName, currentModeInstructions) {
    const allowedSubagents = currentModeInstructions?.allowedSubagents;
    if (allowedSubagents && !allowedSubagents.includes("*") && !allowedSubagents.includes(subAgentName)) {
      throw new Error(`Requested agent '${subAgentName}' is not allowed by the current agent.`);
    }
  }
};

RunSubagentTool = __decorateClass([
  __decorateParam(0, IChatAgentService),
  __decorateParam(1, IChatService),
  __decorateParam(2, ILanguageModelToolsService),
  __decorateParam(3, ILanguageModelsService),
  __decorateParam(4, ILogService),
  __decorateParam(5, IConfigurationService),
  __decorateParam(6, IPromptsService),
  __decorateParam(7, IInstantiationService),
  __decorateParam(8, IProductService)
], RunSubagentTool);
export { BaseModelDescription, RUN_SUBAGENT_MAX_NESTING_DEPTH, RunSubagentTool };
