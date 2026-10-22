// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/node/agentHostTurnStarter.ts
import { IAgentHostChatContributions } from "./module-0487.mjs";
import { IAgentHostStateManager } from "./module-0103.mjs";
import { IAgentHostProviderService } from "./module-0202.mjs";
import { IAgentHostSessionTitleController } from "./module-0491.mjs";
import { IAgentHostTelemetryReporter, getMessageOriginTelemetryKind } from "./module-0253.mjs";
import { IAgentHostTurnTracker } from "./module-0493.mjs";
import { ILogService } from "./module-0084.mjs";
import { createErrorResponsePart } from "./module-0047.mjs";
import { getTurnTelemetryContext } from "./module-0495.mjs";
import { createAgentChatContext } from "./module-0479.mjs";


// src/vs/platform/agentHost/node/agentHostTurnStarter.ts
function startTurn(accessor, request) {
  const chatContributions = accessor.get(IAgentHostChatContributions);
  const stateManager = accessor.get(IAgentHostStateManager);
  const providerService = accessor.get(IAgentHostProviderService);
  const titleController = accessor.get(IAgentHostSessionTitleController);
  const telemetryReporter = accessor.get(IAgentHostTelemetryReporter);
  const turnTracker = accessor.get(IAgentHostTurnTracker);
  const logService = accessor.get(ILogService);
  const disposition = chatContributions.incomingRequest({
    session: request.session,
    chat: request.chat,
    turnChannel: request.turnChannel,
    message: request.message,
    turnId: request.turnId,
    source: request.source,
    clientId: request.clientId,
    clientContext: request.clientContext
  });
  if (disposition.kind === "handled") {
    return void 0;
  }
  if (disposition.kind === "reject") {
    stateManager.dispatchServerAction(request.turnChannel, {
      type: "chat/error" /* ChatError */,
      turnId: request.turnId,
      duration: Math.max(0, request.turnStopWatch.elapsed()),
      part: createErrorResponsePart(disposition.error)
    });
    chatContributions.turnEnd({
      session: request.session,
      channel: request.turnChannel,
      turnId: request.turnId,
      reason: { kind: "rejected", error: disposition.error },
      clientContext: request.clientContext
    });
    return void 0;
  }
  const state = stateManager.getSessionState(request.chat);
  if (!state) {
    logService.info(`[AgentHostTurnStarter] Turn started for session not in state manager: ${request.chat}, turnId=${request.turnId} - status/summary updates may be dropped unless the session is restored`);
  }
  titleController.seedTitleFromFirstMessage(request.session, request.message.text, request.chat);
  const agent = providerService.getProviderForSession(request.session);
  if (!agent) {
    const error = { errorType: "noAgent", message: "No agent found for session" };
    stateManager.dispatchServerAction(request.turnChannel, {
      type: "chat/error" /* ChatError */,
      turnId: request.turnId,
      duration: Math.max(0, request.turnStopWatch.elapsed()),
      part: createErrorResponsePart(error)
    });
    chatContributions.turnEnd({
      session: request.session,
      channel: request.turnChannel,
      turnId: request.turnId,
      reason: { kind: "rejected", error },
      clientContext: request.clientContext
    });
    return void 0;
  }
  telemetryReporter.userMessageSent(agent.id, request.clientId, request.clientContext, request.chat, request.turnId, state, request.source, request.message);
  const { model, modelTelemetryKind, modelSelectionKind, permissionLevel, interactionMode } = getTurnTelemetryContext(agent, request.chat, createAgentChatContext(stateManager, request.session, request.chat), state, request.message.model?.id);
  turnTracker.turnStarted(agent, request.chat, request.turnId, model, modelTelemetryKind, modelSelectionKind, permissionLevel, interactionMode, request.clientContext, request.clientId, void 0, void 0, getMessageOriginTelemetryKind(request.message));
  return { agent };
}
export { startTurn };
