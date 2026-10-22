// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/node/claude/claudeSdkMessageRouter.ts
import { Disposable } from "./module-0010.mjs";
import { Emitter } from "./module-0016.mjs";
import { ClaudeMapperState, mapSDKMessageToAgentSignals } from "./module-0356.mjs";
import { ClaudeFileEditObserver } from "./module-0352.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0044.mjs";
import { ILogService } from "./module-0084.mjs";


// src/vs/platform/agentHost/node/claude/claudeSdkMessageRouter.ts
var ClaudeSdkMessageRouter = class extends Disposable {
  constructor(_chatChannelUri, resource, dbRef, _subagents, clientToolOwner = void 0, instantiationService, _logService) {
    super();
    this._chatChannelUri = _chatChannelUri;
    this._subagents = _subagents;
    this._logService = _logService;
    this._onDidProduceSignal = this._register(new Emitter());
    this.onDidProduceSignal = this._onDidProduceSignal.event;
    this._mapperState = new ClaudeMapperState();
    this._clientToolOwner = clientToolOwner;
    this._editObserver = this._register(
      instantiationService.createInstance(ClaudeFileEditObserver, resource.toString(), dbRef)
    );
  }
  setClientToolOwner(clientToolOwner) {
    this._clientToolOwner = clientToolOwner;
  }
  async handle(message, turnId, context) {
    if (message.type === "assistant") {
      this._editObserver.observeAssistant(message, context?.mode, context?.clientContext);
    } else if (message.type === "user" && turnId !== void 0) {
      await this._editObserver.observeUser(message, turnId, this._mapperState);
    }
    if (turnId === void 0) {
      return;
    }
    try {
      const signals = mapSDKMessageToAgentSignals(
        message,
        this._chatChannelUri,
        turnId,
        this._mapperState,
        this._logService,
        this._subagents,
        this._clientToolOwner,
        context?.turnDuration
      );
      for (const signal of signals) {
        this._onDidProduceSignal.fire(signal);
      }
    } catch (mapperErr) {
      this._logService.warn(`[ClaudeSdkMessageRouter] mapper threw, skipping message: ${mapperErr}`);
    }
  }
};

ClaudeSdkMessageRouter = __decorateClass([
  __decorateParam(5, IInstantiationService),
  __decorateParam(6, ILogService)
], ClaudeSdkMessageRouter);
export { ClaudeSdkMessageRouter };
