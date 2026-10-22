// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/agentSessions/agentSessionsOpener.ts
import { getChatSessionType } from "./module-0962.mjs";
import { migratedCopilotCliResource } from "./module-1110.mjs";
import { ILogService } from "./module-0095.mjs";
import { IAgentSessionsService } from "./module-1463.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IAgentHostConnectionsService } from "./module-0960.mjs";
import { IProgressService } from "./module-0446.mjs";
import { localize } from "./module-0001.mjs";
import { LEGACY_MIGRATION_OPEN_TIMEOUT_MS, adoptLegacyCopilotCliResource, reportLegacyMigrationOpen } from "./module-1111.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IChatSessionsService, localChatSessionType } from "./module-0961.mjs";
import { ChatViewPaneTarget, IChatWidgetService } from "./module-0982.mjs";
import { INotificationService } from "./module-0336.mjs";
import { isLocalAgentSessionItem } from "./module-1462.mjs";
import { ACTIVE_GROUP, SIDE_GROUP } from "./module-0935.mjs";
import { Schemas } from "./module-0033.mjs";
import { toErrorMessage } from "./module-0094.mjs";


// src/vs/workbench/contrib/chat/browser/agentSessions/agentSessionsOpener.ts
var SessionOpenerRegistry = class {
  constructor() {
    this.participants = /* @__PURE__ */ new Set();
  }
  registerParticipant(participant) {
    this.participants.add(participant);
    return {
      dispose: () => {
        this.participants.delete(participant);
      }
    };
  }
  getParticipants() {
    return Array.from(this.participants);
  }
};

var sessionOpenerRegistry = new SessionOpenerRegistry();

async function resolveMigratedSession(agentSessionsService, migrated) {
  const existing = agentSessionsService.getSession(migrated);
  if (existing) {
    return existing;
  }
  await agentSessionsService.model.resolve(getChatSessionType(migrated));
  return agentSessionsService.getSession(migrated);
}

async function resolveMigratedSessionForOpen(accessor, resource) {
  if (!migratedCopilotCliResource(resource)) {
    return void 0;
  }
  const logService = accessor.get(ILogService);
  const agentSessionsService = accessor.get(IAgentSessionsService);
  const telemetryService = accessor.get(ITelemetryService);
  const configurationService = accessor.get(IConfigurationService);
  const connection = accessor.get(IAgentHostConnectionsService).ambientConnection;
  return accessor.get(IProgressService).withProgress(
    { location: 10 /* Window */, title: localize(9148, null) },
    async () => {
      const migrated = await adoptLegacyCopilotCliResource(connection, resource, logService, configurationService, telemetryService, "open", LEGACY_MIGRATION_OPEN_TIMEOUT_MS);
      if (!migrated) {
        return void 0;
      }
      const surfaced = await resolveMigratedSession(agentSessionsService, migrated);
      reportLegacyMigrationOpen(telemetryService, "open", !!surfaced);
      if (!surfaced) {
        logService.warn(`[AgentHost] migrated ${resource.toString()} to ${migrated.toString()} but it is not in this window's list after refreshing provider '${getChatSessionType(migrated)}'; opening the legacy session instead.`);
      }
      return surfaced;
    }
  );
}

async function openSessionByResource(accessor, resource, openOptions) {
  const instantiationService = accessor.get(IInstantiationService);
  const logService = accessor.get(ILogService);
  const migratedSession = await resolveMigratedSessionForOpen(accessor, resource);
  if (migratedSession) {
    resource = migratedSession.resource;
  }
  for (const participant of sessionOpenerRegistry.getParticipants()) {
    if (!participant.handleOpenSessionResource) {
      continue;
    }
    try {
      const handled = await instantiationService.invokeFunction((accessor2) => participant.handleOpenSessionResource?.(accessor2, resource, openOptions));
      if (handled) {
        return void 0;
      }
    } catch (error) {
      logService.error(error);
    }
  }
  const session = instantiationService.invokeFunction((accessor2) => accessor2.get(IAgentSessionsService).getSession(resource));
  if (!session) {
    throw new Error(`Chat session not found: ${resource.toString()}`);
  }
  return instantiationService.invokeFunction(
    openSession,
    session,
    openOptions,
    /* alreadyResolved */
    true
  );
}

async function openSession(accessor, session, openOptions, alreadyResolved) {
  const instantiationService = accessor.get(IInstantiationService);
  const logService = accessor.get(ILogService);
  logService.trace(`[AgentSessions] openSession start: ${session.resource.toString()}`);
  if (!alreadyResolved) {
    const migratedSession = await resolveMigratedSessionForOpen(accessor, session.resource);
    if (migratedSession) {
      session = migratedSession;
    }
  }
  for (const participant of sessionOpenerRegistry.getParticipants()) {
    try {
      const handled = await instantiationService.invokeFunction((accessor2) => participant.handleOpenSession(accessor2, session, openOptions));
      if (handled) {
        logService.trace(`[AgentSessions] openSession handled by participant: ${session.resource.toString()}`);
        return void 0;
      }
    } catch (error) {
      logService.error(error);
    }
  }
  return instantiationService.invokeFunction((accessor2) => openSessionDefault(accessor2, session, openOptions));
}

async function openSessionDefault(accessor, session, openOptions) {
  const chatSessionsService = accessor.get(IChatSessionsService);
  const chatWidgetService = accessor.get(IChatWidgetService);
  const notificationService = accessor.get(INotificationService);
  const logService = accessor.get(ILogService);
  try {
    session.setRead(true);
    let sessionOptions;
    if (isLocalAgentSessionItem(session)) {
      sessionOptions = {};
    } else {
      sessionOptions = { title: { preferred: session.label } };
    }
    let options3 = {
      ...sessionOptions,
      ...openOptions?.editorOptions,
      revealIfOpened: true
      // always try to reveal if already opened
    };
    await chatSessionsService.activateChatSessionItemProvider(session.providerType);
    logService.trace(`[AgentSessions] openSession: provider '${session.providerType}' activated for ${session.resource.toString()}`);
    let target;
    if (openOptions?.sideBySide) {
      target = ACTIVE_GROUP;
    } else {
      target = ChatViewPaneTarget;
    }
    const isLocalChatSession = session.resource.scheme === Schemas.vscodeChatEditor || getChatSessionType(session.resource) === localChatSessionType;
    if (!isLocalChatSession && !await chatSessionsService.canResolveChatSession(getChatSessionType(session.resource))) {
      target = openOptions?.sideBySide ? SIDE_GROUP : ACTIVE_GROUP;
      options3 = { ...options3, revealIfOpened: true };
    }
    return await chatWidgetService.openSession(session.resource, target, options3);
  } catch (error) {
    logService.error(`[AgentSessions] openSession failed: ${session.resource.toString()}`, error);
    notificationService.error(localize(9149, null, toErrorMessage(error)));
    return void 0;
  }
}
export { resolveMigratedSession, resolveMigratedSessionForOpen, openSessionByResource, openSession, openSessionDefault, SessionOpenerRegistry, sessionOpenerRegistry };
