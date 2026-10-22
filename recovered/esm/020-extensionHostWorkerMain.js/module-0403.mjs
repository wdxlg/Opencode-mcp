// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/worker/extensionHostWorkerMain.js
// Original module marker: src/vs/workbench/api/common/extHostLanguageModelTools.ts
import { IconPath, LanguageModelToolResult3, LanguageModelToolSource, MarkdownString3 } from "./module-0239.mjs";
import { MainContext } from "./module-0025.mjs";
import { revive } from "./module-0074.mjs";
import { generateUuid } from "./module-0062.mjs";
import { isToolInvocationContext } from "./module-0185.mjs";
import { ExtensionEditToolId, InternalEditToolId } from "./module-0373.mjs";
import { checkProposedApiEnabled, isProposedApiEnabled } from "./module-0167.mjs";
import { SerializableObjectWithBuffers } from "./module-0024.mjs";
import { InternalFetchWebPageToolId } from "./module-0395.mjs";
import { SearchExtensionsToolId } from "./module-0402.mjs";
import { URI } from "./module-0023.mjs";
import { CancellationToken } from "./module-0026.mjs";
import { raceCancellation } from "./module-0034.mjs";
import { CancellationError } from "./module-0002.mjs";
import { computeCombinationKey } from "./module-0370.mjs";
import { toDisposable } from "./module-0011.mjs";


// src/vs/workbench/api/common/extHostLanguageModelTools.ts
var Tool = class {
  constructor(data2) {
    this._data = data2;
  }
  update(newData) {
    this._data = newData;
    this._apiObject = void 0;
    this._apiObjectWithChatParticipantAdditions = void 0;
  }
  get data() {
    return this._data;
  }
  get apiObject() {
    if (!this._apiObject) {
      this._apiObject = Object.freeze({
        name: this._data.id,
        description: this._data.modelDescription,
        inputSchema: this._data.inputSchema,
        fullReferenceName: this._data.fullReferenceName,
        tags: this._data.tags ?? [],
        source: void 0
      });
    }
    return this._apiObject;
  }
  get apiObjectWithChatParticipantAdditions() {
    if (!this._apiObjectWithChatParticipantAdditions) {
      this._apiObjectWithChatParticipantAdditions = Object.freeze({
        name: this._data.id,
        description: this._data.modelDescription,
        inputSchema: this._data.inputSchema,
        tags: this._data.tags ?? [],
        source: LanguageModelToolSource.to(this._data.source),
        fullReferenceName: this._data.fullReferenceName
      });
    }
    return this._apiObjectWithChatParticipantAdditions;
  }
};

var ExtHostLanguageModelTools = class {
  constructor(mainContext, _languageModels) {
    this._languageModels = _languageModels;
    /** A map of tools that were registered in this EH */
    this._registeredTools = /* @__PURE__ */ new Map();
    this._tokenCountFuncs = /* @__PURE__ */ new Map();
    /** A map of all known tools, from other EHs or registered in vscode core */
    this._allTools = /* @__PURE__ */ new Map();
    this._proxy = mainContext.getProxy(MainContext.MainThreadLanguageModelTools);
    this._proxy.$getTools().then((tools) => {
      for (const tool of tools) {
        this._allTools.set(tool.id, new Tool(revive(tool)));
      }
    });
  }
  async $countTokensForInvocation(callId, input, token) {
    const fn = this._tokenCountFuncs.get(callId);
    if (!fn) {
      throw new Error(`Tool invocation call ${callId} not found`);
    }
    return await fn(input, token);
  }
  async invokeTool(extension, toolIdOrInfo, options2, token) {
    const toolId = typeof toolIdOrInfo === "string" ? toolIdOrInfo : toolIdOrInfo.name;
    const callId = generateUuid();
    if (options2.tokenizationOptions) {
      this._tokenCountFuncs.set(callId, options2.tokenizationOptions.countTokens);
    }
    try {
      if (options2.toolInvocationToken && !isToolInvocationContext(options2.toolInvocationToken)) {
        throw new Error(`Invalid tool invocation token`);
      }
      if ((toolId === InternalEditToolId || toolId === ExtensionEditToolId) && !isProposedApiEnabled(extension, "chatParticipantPrivate")) {
        throw new Error(`Invalid tool: ${toolId}`);
      }
      const result = await this._proxy.$invokeTool({
        toolId,
        callId,
        parameters: options2.input,
        tokenBudget: options2.tokenizationOptions?.tokenBudget,
        context: options2.toolInvocationToken,
        chatRequestId: isProposedApiEnabled(extension, "chatParticipantPrivate") ? options2.chatRequestId : void 0,
        chatInteractionId: isProposedApiEnabled(extension, "chatParticipantPrivate") ? options2.chatInteractionId : void 0,
        subAgentInvocationId: isProposedApiEnabled(extension, "chatParticipantPrivate") ? options2.subAgentInvocationId : void 0,
        chatStreamToolCallId: isProposedApiEnabled(extension, "chatParticipantAdditions") ? options2.chatStreamToolCallId : void 0,
        preToolUseResult: isProposedApiEnabled(extension, "chatParticipantPrivate") ? options2.preToolUseResult : void 0,
        traceparent: isProposedApiEnabled(extension, "chatParticipantPrivate") ? options2.traceparent : void 0,
        tracestate: isProposedApiEnabled(extension, "chatParticipantPrivate") ? options2.tracestate : void 0
      }, token);
      const dto = result instanceof SerializableObjectWithBuffers ? result.value : result;
      return LanguageModelToolResult3.to(revive(dto));
    } finally {
      this._tokenCountFuncs.delete(callId);
    }
  }
  $onDidChangeTools(tools) {
    const oldTools = new Set(this._allTools.keys());
    for (const tool of tools) {
      oldTools.delete(tool.id);
      const existing = this._allTools.get(tool.id);
      if (existing) {
        existing.update(tool);
      } else {
        this._allTools.set(tool.id, new Tool(revive(tool)));
      }
    }
    for (const id2 of oldTools) {
      this._allTools.delete(id2);
    }
  }
  getTools(extension) {
    const hasParticipantAdditions = isProposedApiEnabled(extension, "chatParticipantPrivate");
    return Array.from(this._allTools.values()).map((tool) => hasParticipantAdditions ? tool.apiObjectWithChatParticipantAdditions : tool.apiObject).filter((tool) => {
      switch (tool.name) {
        case InternalEditToolId:
        case ExtensionEditToolId:
        case InternalFetchWebPageToolId:
        case SearchExtensionsToolId:
          return isProposedApiEnabled(extension, "chatParticipantPrivate");
        default:
          return true;
      }
    });
  }
  async $invokeTool(dto, token) {
    const item = this._registeredTools.get(dto.toolId);
    if (!item) {
      throw new Error(`Unknown tool ${dto.toolId}`);
    }
    const options2 = {
      input: dto.parameters,
      toolInvocationToken: revive(dto.context)
    };
    if (isProposedApiEnabled(item.extension, "chatParticipantPrivate")) {
      options2.chatRequestId = dto.chatRequestId;
      options2.chatInteractionId = dto.chatInteractionId;
      options2.chatSessionResource = URI.revive(dto.context?.sessionResource);
      options2.workingDirectory = URI.revive(dto.context?.workingDirectory);
      options2.subAgentInvocationId = dto.subAgentInvocationId;
      options2.traceparent = dto.traceparent;
      options2.tracestate = dto.tracestate;
    }
    if (isProposedApiEnabled(item.extension, "chatParticipantAdditions") && dto.modelId) {
      options2.model = await this.getModel(dto.modelId, item.extension);
    }
    if (isProposedApiEnabled(item.extension, "chatParticipantAdditions") && dto.chatStreamToolCallId) {
      options2.chatStreamToolCallId = dto.chatStreamToolCallId;
    }
    if (dto.tokenBudget !== void 0) {
      options2.tokenizationOptions = {
        tokenBudget: dto.tokenBudget,
        countTokens: this._tokenCountFuncs.get(dto.callId) || ((value, token2 = CancellationToken.None) => this._proxy.$countTokensForInvocation(dto.callId, value, token2))
      };
    }
    let progress;
    if (isProposedApiEnabled(item.extension, "toolProgress")) {
      let lastProgress;
      progress = {
        report: (value) => {
          if (value.increment !== void 0) {
            lastProgress = (lastProgress ?? 0) + value.increment;
          }
          this._proxy.$acceptToolProgress(dto.callId, {
            message: MarkdownString3.fromStrict(value.message),
            progress: lastProgress === void 0 ? void 0 : lastProgress / 100
          });
        }
      };
    }
    const extensionResult = await raceCancellation(Promise.resolve(item.tool.invoke(options2, token, progress)), token);
    if (!extensionResult) {
      throw new CancellationError();
    }
    return LanguageModelToolResult3.from(extensionResult, item.extension);
  }
  async getModel(modelId, extension) {
    let model;
    if (modelId) {
      model = await this._languageModels.getLanguageModelByIdentifier(extension, modelId);
    }
    if (!model) {
      model = await this._languageModels.getDefaultLanguageModel(extension);
      if (!model) {
        throw new Error("Language model unavailable");
      }
    }
    return model;
  }
  async $handleToolStream(toolId, context, token) {
    const item = this._registeredTools.get(toolId);
    if (!item) {
      throw new Error(`Unknown tool ${toolId}`);
    }
    if (!item.tool.handleToolStream) {
      return void 0;
    }
    checkProposedApiEnabled(item.extension, "chatParticipantAdditions");
    const options2 = {
      rawInput: context.rawInput,
      chatRequestId: context.chatRequestId,
      chatSessionResource: context.chatSessionResource,
      chatInteractionId: context.chatInteractionId
    };
    const result = await item.tool.handleToolStream(options2, token);
    if (!result) {
      return void 0;
    }
    return {
      invocationMessage: MarkdownString3.fromStrict(result.invocationMessage)
    };
  }
  async $prepareToolInvocation(toolId, context, token) {
    const item = this._registeredTools.get(toolId);
    if (!item) {
      throw new Error(`Unknown tool ${toolId}`);
    }
    const options2 = {
      input: context.parameters,
      chatRequestId: context.chatRequestId,
      chatSessionResource: context.chatSessionResource,
      chatInteractionId: context.chatInteractionId,
      workingDirectory: URI.revive(context.workingDirectory),
      forceConfirmationReason: context.forceConfirmationReason
    };
    if (context.forceConfirmationReason) {
      checkProposedApiEnabled(item.extension, "chatParticipantPrivate");
    }
    if (item.tool.prepareInvocation) {
      const result = await item.tool.prepareInvocation(options2, token);
      if (!result) {
        return void 0;
      }
      if (result.pastTenseMessage || result.presentation) {
        checkProposedApiEnabled(item.extension, "chatParticipantPrivate");
      }
      if (result.confirmationMessages?.approveCombination !== void 0) {
        checkProposedApiEnabled(item.extension, "toolInvocationApproveCombination");
      }
      const approveCombination = result.confirmationMessages?.approveCombination;
      const approveCombinationLabel = approveCombination ? MarkdownString3.fromStrict(approveCombination.message) : void 0;
      const approveCombinationKey = approveCombinationLabel ? await computeCombinationKey(toolId, context.parameters) : void 0;
      return {
        confirmationMessages: result.confirmationMessages ? {
          title: typeof result.confirmationMessages.title === "string" ? result.confirmationMessages.title : MarkdownString3.from(result.confirmationMessages.title),
          message: typeof result.confirmationMessages.message === "string" ? result.confirmationMessages.message : MarkdownString3.from(result.confirmationMessages.message),
          approveCombination: approveCombinationLabel && approveCombinationKey ? { label: approveCombinationLabel, key: approveCombinationKey, arguments: approveCombination.arguments } : void 0
        } : void 0,
        invocationMessage: MarkdownString3.fromStrict(result.invocationMessage),
        pastTenseMessage: MarkdownString3.fromStrict(result.pastTenseMessage),
        presentation: result.presentation
      };
    }
    return void 0;
  }
  registerTool(extension, id2, tool) {
    this._registeredTools.set(id2, { extension, tool });
    this._proxy.$registerTool(id2, typeof tool.handleToolStream === "function");
    return toDisposable(() => {
      this._registeredTools.delete(id2);
      this._proxy.$unregisterTool(id2);
    });
  }
  registerToolDefinition(extension, definition, tool) {
    checkProposedApiEnabled(extension, "languageModelToolSupportsModel");
    const id2 = definition.name;
    const dto = {
      id: id2,
      displayName: definition.displayName,
      toolReferenceName: definition.toolReferenceName,
      userDescription: definition.userDescription,
      modelDescription: definition.description,
      inputSchema: definition.inputSchema,
      source: {
        type: "extension",
        label: extension.displayName ?? extension.name,
        extensionId: extension.identifier
      },
      icon: IconPath.from(definition.icon),
      models: definition.models,
      toolSet: definition.toolSet,
      tags: definition.tags,
      fullReferenceName: void 0
      // will be filled in on the main thread based on the extension ID and tool reference name
    };
    this._registeredTools.set(id2, { extension, tool });
    this._proxy.$registerToolWithDefinition(extension.identifier, dto, typeof tool.handleToolStream === "function");
    return toDisposable(() => {
      this._registeredTools.delete(id2);
      this._proxy.$unregisterTool(id2);
    });
  }
};
export { Tool, ExtHostLanguageModelTools };
