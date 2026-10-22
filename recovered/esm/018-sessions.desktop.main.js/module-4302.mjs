// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/agentSessions/agentHost/agentHostByokLmHandler.ts
import { ChatEntitlementContextKeys, IChatEntitlementService } from "./module-0954.mjs";
import { Disposable } from "./module-0012.mjs";
import { Emitter, Event2 } from "./module-0017.mjs";
import { SessionType } from "./module-0961.mjs";
import { getByokLmAgentModelId } from "./module-4229.mjs";
import { VSBuffer, decodeBase64 } from "./module-0038.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ILanguageModelsService } from "./module-0968.mjs";
import { ILogService } from "./module-0095.mjs";
import { IContextKeyService } from "./module-0089.mjs";


// src/vs/workbench/contrib/chat/browser/agentSessions/agentHost/agentHostByokLmHandler.ts
var STATEFUL_MARKER_MIME_TYPE = "stateful_marker";

var USAGE_MIME_TYPE = "usage";

var REASONING_METADATA_PREFIX = "vscode-reasoning-metadata:";

var VSCODE_REASONING_SUMMARY_PART_DONE = "vscode_reasoning_summary_part_done";

var CLIENT_BYOK_CONTEXT_KEYS = /* @__PURE__ */ new Set([ChatEntitlementContextKeys.clientByokEnabled.key]);

var AgentHostByokLmHandler = class extends Disposable {
  constructor(_languageModelsService, _logService, _chatEntitlementService, contextKeyService) {
    super();
    this._languageModelsService = _languageModelsService;
    this._logService = _logService;
    this._chatEntitlementService = _chatEntitlementService;
    this._onDidChangeModels = this._register(new Emitter());
    /** Fires when the renderer's BYOK models change, so the node agent host re-enumerates. */
    this.onDidChangeModels = this._onDidChangeModels.event;
    this._register(Event2.debounce(this._languageModelsService.onDidChangeLanguageModels, () => void 0, 500)(() => {
      this._onDidChangeModels.fire();
    }));
    this._register(this._languageModelsService.onDidChangeModelVisibility(() => {
      this._onDidChangeModels.fire();
    }));
    this._register(Event2.filter(contextKeyService.onDidChangeContext, (event) => event.affectsSome(CLIENT_BYOK_CONTEXT_KEYS))(() => {
      this._onDidChangeModels.fire();
    }));
  }
  async chat(request2, token) {
    if (!this._chatEntitlementService.clientByokEnabled) {
      return { output: [], error: "BYOK models are disabled by policy." };
    }
    const modelIdentifier = this._resolveModelIdentifier(request2.vendor, request2.modelId);
    if (!modelIdentifier) {
      return { output: [], error: `No BYOK model found for ${request2.vendor}/${request2.modelId}` };
    }
    const messages = this._toChatMessages(request2);
    const tools = request2.tools?.length ? request2.tools.map((tool) => ({
      name: tool.name,
      description: tool.description ?? "",
      inputSchema: tool.type === "function" ? tool.parametersSchema : { type: "object", properties: { input: { type: "string" } }, required: ["input"] }
    })) : void 0;
    const options3 = {
      modelOptions: request2.modelOptions,
      includeEncryptedThinking: true,
      ...request2.reasoningEffort ? { configuration: { reasoningEffort: request2.reasoningEffort } } : {},
      ...tools ? { tools } : {}
    };
    try {
      const response = await this._languageModelsService.sendChatRequest(modelIdentifier, void 0, messages, options3, token);
      const output = [];
      const customToolNames = new Set(request2.tools?.filter((tool) => tool.type === "custom").map((tool) => tool.name));
      const completedReasoningSummaryParts = /* @__PURE__ */ new Set();
      let responseId;
      let usage;
      const streaming = (async () => {
        for await (const part of response.stream) {
          const parts = Array.isArray(part) ? part : [part];
          for (const p of parts) {
            if (p.type === "text") {
              this._appendTextOutput(output, p.value);
            } else if (p.type === "thinking") {
              if (p.metadata?.[VSCODE_REASONING_SUMMARY_PART_DONE] === true) {
                completedReasoningSummaryParts.add(p.id);
              } else {
                const startsNewSummaryPart = p.value.length > 0 && completedReasoningSummaryParts.delete(p.id);
                this._appendReasoningOutput(output, p, startsNewSummaryPart);
              }
            } else if (p.type === "tool_use") {
              if (customToolNames.has(p.name)) {
                output.push({
                  type: "custom_tool_call",
                  callId: p.toolCallId,
                  name: p.name,
                  input: this._customToolInput(p.parameters)
                });
              } else {
                output.push({
                  type: "function_call",
                  callId: p.toolCallId,
                  name: p.name,
                  argumentsJson: JSON.stringify(p.parameters ?? {})
                });
              }
            } else if (p.type === "data" && p.mimeType === STATEFUL_MARKER_MIME_TYPE) {
              responseId = this._decodeStatefulMarker(p.data, request2.modelId);
            } else if (p.type === "data" && p.mimeType === USAGE_MIME_TYPE) {
              usage = this._decodeUsage(p.data);
            }
          }
        }
      })();
      await Promise.all([response.result, streaming]);
      return { output, responseId, usage };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this._logService.warn(`[AgentHostByokLmHandler] chat request failed for ${request2.vendor}/${request2.modelId}: ${message}`);
      return { output: [], error: message };
    }
  }
  async listModels(_token) {
    if (!this._chatEntitlementService.clientByokEnabled) {
      return [];
    }
    const models = [];
    for (const identifier2 of this._languageModelsService.getLanguageModelIds()) {
      const metadata = this._languageModelsService.lookupLanguageModel(identifier2);
      if (metadata?.isBYOK && !metadata.targetChatSessionType) {
        const reasoningEffortSchema = metadata.configurationSchema?.properties?.reasoningEffort;
        const supportedReasoningEfforts = reasoningEffortSchema?.enum?.filter((value2) => typeof value2 === "string");
        const defaultReasoningEffort = typeof reasoningEffortSchema?.default === "string" ? reasoningEffortSchema.default : void 0;
        const model = {
          vendor: metadata.vendor,
          id: metadata.id,
          name: metadata.name,
          modelIdentifier: identifier2,
          maxContextWindowTokens: metadata.maxInputTokens + metadata.maxOutputTokens,
          supportsVision: !!metadata.capabilities?.vision,
          ...supportedReasoningEfforts?.length ? { supportedReasoningEfforts } : {},
          ...defaultReasoningEffort !== void 0 ? { defaultReasoningEffort } : {}
        };
        const agentHostModelIdentifier = `${SessionType.AgentHostCopilot}:${getByokLmAgentModelId(model)}`;
        if (!this._languageModelsService.isModelHidden(identifier2) && !this._languageModelsService.isModelHidden(agentHostModelIdentifier)) {
          models.push(model);
        }
      }
    }
    return models;
  }
  /**
   * Find the LM API identifier for a BYOK model addressed by its vendor and
   * provider-local id (the `provider/id` selection id the picker surfaced).
   */
  _resolveModelIdentifier(vendor, modelId) {
    const exactIdentifier = `${vendor}/${modelId}`;
    const exactMetadata = this._languageModelsService.lookupLanguageModel(exactIdentifier);
    if (exactMetadata?.isBYOK && exactMetadata.vendor === vendor) {
      return exactIdentifier;
    }
    for (const identifier2 of this._languageModelsService.getLanguageModelIds()) {
      const metadata = this._languageModelsService.lookupLanguageModel(identifier2);
      if (metadata?.isBYOK && metadata.vendor === vendor && metadata.id === modelId) {
        return identifier2;
      }
    }
    return void 0;
  }
  _toChatMessages(request2) {
    const messages = [];
    if (request2.previousResponseId) {
      messages.push({
        role: 2 /* Assistant */,
        content: [{
          type: "data",
          mimeType: STATEFUL_MARKER_MIME_TYPE,
          data: VSBuffer.fromString(`${request2.modelId}\\${request2.previousResponseId}`)
        }]
      });
    }
    if (request2.instructions) {
      messages.push({
        role: 0 /* System */,
        content: [{ type: "text", value: request2.instructions }]
      });
    }
    for (const item of request2.input) {
      const message = this._toChatMessage(item);
      const previous = messages.at(-1);
      if (message.role === 2 /* Assistant */ && previous?.role === 2 /* Assistant */) {
        messages[messages.length - 1] = {
          ...previous,
          content: [...previous.content, ...message.content]
        };
      } else {
        messages.push(message);
      }
    }
    return messages;
  }
  _toChatMessage(item) {
    switch (item.type) {
      case "message":
        return {
          role: this._toChatRole(item.role),
          content: this._toChatMessageParts(item.content)
        };
      case "reasoning": {
        return {
          role: 2 /* Assistant */,
          content: [{
            type: "thinking",
            value: item.summary,
            id: item.id,
            metadata: {
              ...item.metadata,
              ...item.encryptedContent ? this._decodeReasoningMetadata(item.encryptedContent) : {}
            }
          }]
        };
      }
      case "function_call":
        return {
          role: 2 /* Assistant */,
          content: [{
            type: "tool_use",
            name: item.name,
            toolCallId: item.callId,
            parameters: this._safeParseJson(item.argumentsJson)
          }]
        };
      case "custom_tool_call":
        return {
          role: 2 /* Assistant */,
          content: [{
            type: "tool_use",
            name: item.name,
            toolCallId: item.callId,
            parameters: { input: item.input }
          }]
        };
      case "function_call_output":
      case "custom_tool_call_output":
        return {
          role: 1 /* User */,
          content: [{
            type: "tool_result",
            toolCallId: item.callId,
            value: [{ type: "text", value: item.output }]
          }]
        };
    }
  }
  _toChatMessageParts(parts) {
    const result = [];
    for (const part of parts) {
      if (part.type === "text") {
        const previous = result.at(-1);
        if (previous?.type === "text") {
          previous.value += part.text;
        } else {
          result.push({ type: "text", value: part.text });
        }
      } else {
        result.push({ type: "image_url", value: { mimeType: this._toChatImageMimeType(part.mimeType), data: decodeBase64(part.data) } });
      }
    }
    return result.length ? result : [{ type: "text", value: "" }];
  }
  _toChatImageMimeType(mimeType) {
    switch (mimeType) {
      case "image/png":
        return "image/png" /* PNG */;
      case "image/jpeg":
        return "image/jpeg" /* JPEG */;
      case "image/gif":
        return "image/gif" /* GIF */;
      case "image/webp":
        return "image/webp" /* WEBP */;
      case "image/bmp":
        return "image/bmp" /* BMP */;
    }
  }
  _appendTextOutput(output, value2) {
    const previous = output.at(-1);
    if (previous?.type === "message") {
      output[output.length - 1] = {
        ...previous,
        content: [{ type: "text", text: previous.content.map((part) => part.text).join("") + value2 }]
      };
    } else {
      output.push({ type: "message", content: [{ type: "text", text: value2 }] });
    }
  }
  _appendReasoningOutput(output, part, startsNewSummaryPart) {
    if (part.metadata?.vscode_reasoning_done === true) {
      return;
    }
    const summary = Array.isArray(part.value) ? part.value : [part.value];
    const encryptedContent = this._encodeReasoningMetadata(part.metadata);
    const reasoning = {
      type: "reasoning",
      id: part.id,
      summary,
      encryptedContent,
      metadata: part.metadata
    };
    const previous = output.at(-1);
    if (previous?.type === "reasoning" && previous.id === reasoning.id) {
      output[output.length - 1] = {
        ...previous,
        summary: startsNewSummaryPart || Array.isArray(part.value) ? [...previous.summary, ...reasoning.summary] : this._mergeReasoningSummary(previous.summary, part.value),
        encryptedContent: reasoning.encryptedContent ?? previous.encryptedContent,
        metadata: previous.metadata || reasoning.metadata ? { ...previous.metadata, ...reasoning.metadata } : void 0
      };
    } else {
      output.push(reasoning);
    }
  }
  _mergeReasoningSummary(summary, value2) {
    if (summary.length === 0) {
      return [value2];
    }
    return [...summary.slice(0, -1), summary[summary.length - 1] + value2];
  }
  _encodeReasoningMetadata(metadata) {
    const encryptedContent = this._stringMetadata(metadata, "encrypted_content") ?? this._stringMetadata(metadata, "encrypted");
    if (encryptedContent) {
      return encryptedContent;
    }
    const continuationMetadata = {
      ...this._stringMetadata(metadata, "signature") ? { signature: this._stringMetadata(metadata, "signature") } : {},
      ...this._stringMetadata(metadata, "_completeThinking") ? { _completeThinking: this._stringMetadata(metadata, "_completeThinking") } : {},
      ...this._stringMetadata(metadata, "redactedData") ? { redactedData: this._stringMetadata(metadata, "redactedData") } : {}
    };
    return Object.keys(continuationMetadata).length > 0 ? `${REASONING_METADATA_PREFIX}${JSON.stringify(continuationMetadata)}` : void 0;
  }
  _decodeReasoningMetadata(value2) {
    if (!value2.startsWith(REASONING_METADATA_PREFIX)) {
      return { encrypted_content: value2 };
    }
    const metadata = JSON.parse(value2.slice(REASONING_METADATA_PREFIX.length));
    if (typeof metadata !== "object" || metadata === null || Array.isArray(metadata)) {
      throw new Error("Invalid Agent Host BYOK reasoning metadata");
    }
    return metadata;
  }
  _customToolInput(parameters) {
    if (typeof parameters === "object" && parameters !== null) {
      const input = Object.getOwnPropertyDescriptor(parameters, "input")?.value;
      if (typeof input === "string") {
        return input;
      }
    }
    return typeof parameters === "string" ? parameters : JSON.stringify(parameters ?? {});
  }
  _decodeStatefulMarker(data, expectedModelId) {
    const decoded = data.toString();
    const separator2 = decoded.indexOf("\\");
    if (separator2 === -1 || decoded.slice(0, separator2) !== expectedModelId) {
      return void 0;
    }
    return decoded.slice(separator2 + 1) || void 0;
  }
  _decodeUsage(data) {
    try {
      const value2 = JSON.parse(data.toString());
      const outputDetails = typeof value2.completion_tokens_details === "object" && value2.completion_tokens_details !== null ? value2.completion_tokens_details : void 0;
      return {
        inputTokens: this._numberProperty(value2, "prompt_tokens"),
        outputTokens: this._numberProperty(value2, "completion_tokens"),
        reasoningTokens: outputDetails ? this._numberProperty(outputDetails, "reasoning_tokens") : void 0
      };
    } catch {
      return void 0;
    }
  }
  _numberProperty(value2, key3) {
    const property = value2[key3];
    return typeof property === "number" ? property : void 0;
  }
  _stringMetadata(metadata, key3) {
    const value2 = metadata?.[key3];
    return typeof value2 === "string" ? value2 : void 0;
  }
  _toChatRole(role) {
    switch (role) {
      case "system":
      case "developer":
        return 0 /* System */;
      case "assistant":
        return 2 /* Assistant */;
      case "user":
        return 1 /* User */;
    }
  }
  _safeParseJson(json) {
    try {
      return JSON.parse(json);
    } catch {
      return {};
    }
  }
};

AgentHostByokLmHandler = __decorateClass([
  __decorateParam(0, ILanguageModelsService),
  __decorateParam(1, ILogService),
  __decorateParam(2, IChatEntitlementService),
  __decorateParam(3, IContextKeyService)
], AgentHostByokLmHandler);
export { STATEFUL_MARKER_MIME_TYPE, USAGE_MIME_TYPE, REASONING_METADATA_PREFIX, VSCODE_REASONING_SUMMARY_PART_DONE, CLIENT_BYOK_CONTEXT_KEYS, AgentHostByokLmHandler };
