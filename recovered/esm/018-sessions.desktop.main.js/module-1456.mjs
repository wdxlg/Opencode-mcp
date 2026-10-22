// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/api/browser/mainThreadChatDebug.ts
import { Disposable, DisposableStore, MutableDisposable } from "./module-0012.mjs";
import { ExtHostContext, MainContext } from "./module-0922.mjs";
import { VSBuffer } from "./module-0038.mjs";
import { URI } from "./module-0032.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { extHostNamedCustomer } from "./module-0920.mjs";
import { IChatDebugService } from "./module-1455.mjs";
import { IChatService } from "./module-0973.mjs";


// src/vs/workbench/api/browser/mainThreadChatDebug.ts
var MainThreadChatDebug = class extends Disposable {
  constructor(extHostContext, _chatDebugService, _chatService) {
    super();
    this._chatDebugService = _chatDebugService;
    this._chatService = _chatService;
    this._providerDisposables = /* @__PURE__ */ new Map();
    this._activeSessionResources = /* @__PURE__ */ new Map();
    this._coreEventForwarder = this._register(new MutableDisposable());
    this._proxy = extHostContext.getProxy(ExtHostContext.ExtHostChatDebug);
  }
  $subscribeToCoreDebugEvents() {
    this._coreEventForwarder.value = this._chatDebugService.onDidAddEvent((event) => {
      if (this._chatDebugService.isCoreEvent(event)) {
        this._proxy.$onCoreDebugEvent(this._serializeEvent(event));
      }
    });
  }
  $unsubscribeFromCoreDebugEvents() {
    this._coreEventForwarder.clear();
  }
  $registerChatDebugLogProvider(handle2) {
    const disposables = new DisposableStore();
    this._providerDisposables.set(handle2, disposables);
    disposables.add(this._chatDebugService.registerProvider({
      provideChatDebugLog: async (sessionResource, token) => {
        this._activeSessionResources.set(handle2, sessionResource);
        const dtos = await this._proxy.$provideChatDebugLog(handle2, sessionResource, token);
        return dtos?.map((dto) => this._reviveEvent(dto, sessionResource));
      },
      resolveChatDebugLogEvent: async (eventId, token) => {
        const dto = await this._proxy.$resolveChatDebugLogEvent(handle2, eventId, token);
        return dto ? this._reviveResolvedContent(dto) : void 0;
      },
      provideChatDebugLogExport: async (sessionResource, token) => {
        const coreEventDtos = this._chatDebugService.getEvents(sessionResource).filter((e4) => this._chatDebugService.isCoreEvent(e4)).map((e4) => this._serializeEvent(e4));
        const sessionTitle = this._chatService.getSessionTitle(sessionResource);
        const result = await this._proxy.$exportChatDebugLog(handle2, sessionResource, coreEventDtos, sessionTitle, token);
        return result?.buffer;
      },
      resolveChatDebugLogImport: async (data, token) => {
        const result = await this._proxy.$importChatDebugLog(handle2, VSBuffer.wrap(data), token);
        if (!result) {
          return void 0;
        }
        const uri4 = URI.revive(result.uri);
        if (result.sessionTitle) {
          this._chatDebugService.setImportedSessionTitle(uri4, result.sessionTitle);
        }
        return uri4;
      }
    }));
    disposables.add(this._chatDebugService.registerAvailableSessionsFetcher(async (token) => {
      const entries2 = await this._proxy.$getAvailableDebugSessionResources(handle2, token);
      return entries2.map((e4) => ({ uri: URI.revive(e4.uri), title: e4.title }));
    }));
  }
  $unregisterChatDebugLogProvider(handle2) {
    const disposables = this._providerDisposables.get(handle2);
    disposables?.dispose();
    this._providerDisposables.delete(handle2);
    this._activeSessionResources.delete(handle2);
  }
  $acceptChatDebugEvent(handle2, dto) {
    const sessionResource = (dto.sessionResource ? URI.revive(dto.sessionResource) : void 0) ?? this._activeSessionResources.get(handle2) ?? this._chatDebugService.activeSessionResource;
    if (!sessionResource) {
      return;
    }
    const revived = this._reviveEvent(dto, sessionResource);
    this._chatDebugService.addProviderEvent(revived);
  }
  _serializeEvent(event) {
    const base = {
      id: event.id,
      sessionResource: event.sessionResource,
      created: event.created.getTime(),
      parentEventId: event.parentEventId
    };
    switch (event.kind) {
      case "toolCall":
        return { ...base, kind: "toolCall", toolName: event.toolName, toolCallId: event.toolCallId, input: event.input, output: event.output, result: event.result, durationInMillis: event.durationInMillis };
      case "modelTurn":
        return { ...base, kind: "modelTurn", model: event.model, requestName: event.requestName, inputTokens: event.inputTokens, outputTokens: event.outputTokens, cachedTokens: event.cachedTokens, totalTokens: event.totalTokens, copilotUsageNanoAiu: event.copilotUsageNanoAiu, durationInMillis: event.durationInMillis };
      case "generic":
        return { ...base, kind: "generic", name: event.name, details: event.details, level: event.level, category: event.category };
      case "subagentInvocation":
        return { ...base, kind: "subagentInvocation", agentName: event.agentName, description: event.description, status: event.status, durationInMillis: event.durationInMillis, toolCallCount: event.toolCallCount, modelTurnCount: event.modelTurnCount };
      case "userMessage":
        return { ...base, kind: "userMessage", message: event.message, sections: event.sections.map((s) => ({ name: s.name, content: s.content })) };
      case "agentResponse":
        return { ...base, kind: "agentResponse", message: event.message, sections: event.sections.map((s) => ({ name: s.name, content: s.content })) };
    }
  }
  _reviveEvent(dto, sessionResource) {
    const base = {
      id: dto.id,
      sessionResource,
      created: new Date(dto.created),
      parentEventId: dto.parentEventId
    };
    switch (dto.kind) {
      case "toolCall":
        return {
          ...base,
          kind: "toolCall",
          toolName: dto.toolName,
          toolCallId: dto.toolCallId,
          input: dto.input,
          output: dto.output,
          result: dto.result,
          durationInMillis: dto.durationInMillis
        };
      case "modelTurn":
        return {
          ...base,
          kind: "modelTurn",
          model: dto.model,
          requestName: dto.requestName,
          inputTokens: dto.inputTokens,
          outputTokens: dto.outputTokens,
          cachedTokens: dto.cachedTokens,
          totalTokens: dto.totalTokens,
          copilotUsageNanoAiu: dto.copilotUsageNanoAiu,
          durationInMillis: dto.durationInMillis
        };
      case "generic":
        return {
          ...base,
          kind: "generic",
          name: dto.name,
          details: dto.details,
          level: dto.level,
          category: dto.category
        };
      case "subagentInvocation":
        return {
          ...base,
          kind: "subagentInvocation",
          agentName: dto.agentName,
          description: dto.description,
          status: dto.status,
          durationInMillis: dto.durationInMillis,
          toolCallCount: dto.toolCallCount,
          modelTurnCount: dto.modelTurnCount
        };
      case "userMessage":
        return {
          ...base,
          kind: "userMessage",
          message: dto.message,
          sections: dto.sections
        };
      case "agentResponse":
        return {
          ...base,
          kind: "agentResponse",
          message: dto.message,
          sections: dto.sections
        };
    }
  }
  _reviveResolvedContent(dto) {
    switch (dto.kind) {
      case "text":
        return { kind: "text", value: dto.value };
      case "message":
        return {
          kind: "message",
          type: dto.type,
          message: dto.message,
          sections: dto.sections
        };
      case "toolCall":
        return {
          kind: "toolCall",
          toolName: dto.toolName,
          result: dto.result,
          durationInMillis: dto.durationInMillis,
          input: dto.input,
          output: dto.output
        };
      case "modelTurn":
        return {
          kind: "modelTurn",
          requestName: dto.requestName,
          model: dto.model,
          status: dto.status,
          durationInMillis: dto.durationInMillis,
          timeToFirstTokenInMillis: dto.timeToFirstTokenInMillis,
          requestId: dto.requestId,
          maxInputTokens: dto.maxInputTokens,
          maxOutputTokens: dto.maxOutputTokens,
          inputTokens: dto.inputTokens,
          outputTokens: dto.outputTokens,
          cachedTokens: dto.cachedTokens,
          totalTokens: dto.totalTokens,
          requestOptions: dto.requestOptions,
          errorMessage: dto.errorMessage,
          sections: dto.sections
        };
      case "hook":
        return {
          kind: "hook",
          hookType: dto.hookType,
          command: dto.command,
          result: dto.result === "success" ? 0 /* Success */ : dto.result === "error" ? 1 /* Error */ : dto.result === "nonBlockingError" ? 2 /* NonBlockingError */ : void 0,
          durationInMillis: dto.durationInMillis,
          input: dto.input,
          output: dto.output,
          exitCode: dto.exitCode,
          errorMessage: dto.errorMessage
        };
    }
  }
};

MainThreadChatDebug = __decorateClass([
  extHostNamedCustomer(MainContext.MainThreadChatDebug),
  __decorateParam(1, IChatDebugService),
  __decorateParam(2, IChatService)
], MainThreadChatDebug);
export { MainThreadChatDebug };
