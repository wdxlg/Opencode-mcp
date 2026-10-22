// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/platform/agentHost/common/taskEventReplay.ts
import { Reassembler } from "./module-4277.mjs";
import { sessionReducer } from "./module-2199.mjs";
import { chatReducer } from "./module-2201.mjs";


// src/vs/platform/agentHost/common/taskEventReplay.ts
var MAX_RESTART_EPOCH_INITIAL_SEQUENCE = 1;

var TaskEventReplayError = class extends Error {
  constructor(message) {
    super(message);
    this.name = "TaskEventReplayError";
  }
};

function isRecord8(value2) {
  return typeof value2 === "object" && value2 !== null && !Array.isArray(value2);
}

function requireNonEmptyString(value2, field, eventIndex) {
  if (typeof value2 !== "string" || !value2.trim()) {
    throw new TaskEventReplayError(`Task AHP event ${eventIndex} has an invalid ${field}.`);
  }
  return value2;
}

function requireNonNegativeInteger(value2, field, eventIndex) {
  if (!Number.isInteger(value2) || value2 < 0) {
    throw new TaskEventReplayError(`Task AHP event ${eventIndex} has an invalid ${field}.`);
  }
  return value2;
}

function parseActionEnvelope(value2, eventIndex) {
  if (!isRecord8(value2)) {
    throw new TaskEventReplayError(`Task AHP event ${eventIndex} did not contain an ActionEnvelope object.`);
  }
  requireNonEmptyString(value2["channel"], "payload.data.channel", eventIndex);
  requireNonNegativeInteger(value2["serverSeq"], "payload.data.serverSeq", eventIndex);
  const action = value2["action"];
  if (!isRecord8(action)) {
    throw new TaskEventReplayError(`Task AHP event ${eventIndex} has an invalid payload.data.action.`);
  }
  requireNonEmptyString(action["type"], "payload.data.action.type", eventIndex);
  const rejectionReason = value2["rejectionReason"];
  if (rejectionReason !== void 0 && rejectionReason !== null) {
    requireNonEmptyString(rejectionReason, "payload.data.rejectionReason", eventIndex);
  }
  return value2;
}

function sessionChannelFor(sessionId) {
  return sessionId.startsWith("ahp-session:/") ? sessionId : `ahp-session:/${sessionId}`;
}

function seedSessionState() {
  return {
    provider: "",
    title: "",
    status: 1 /* Idle */,
    lifecycle: "ready" /* Ready */,
    activeClients: [],
    chats: []
  };
}

function seedChatState(chatChannel, modifiedAt) {
  return {
    resource: chatChannel,
    title: "",
    status: 1 /* Idle */,
    modifiedAt,
    turns: []
  };
}

function decodeEvents(events) {
  const sessions = /* @__PURE__ */ new Map();
  for (const [eventIndex, value2] of events.entries()) {
    if (!isRecord8(value2)) {
      throw new TaskEventReplayError(`Task AHP event ${eventIndex} must be an object.`);
    }
    if (value2["ns"] !== "ahp") {
      throw new TaskEventReplayError(`Task AHP event ${eventIndex} has an invalid ns.`);
    }
    const session = sessionChannelFor(requireNonEmptyString(value2["session_id"], "session_id", eventIndex));
    const seq = requireNonNegativeInteger(value2["seq"], "seq", eventIndex);
    const at = requireNonEmptyString(value2["at"], "at", eventIndex);
    let entry = sessions.get(session);
    if (!entry) {
      entry = { envelopes: [], modifiedAt: at, nextSeq: seq, reassembler: new Reassembler(), abandonedChunkGroup: false };
      sessions.set(session, entry);
    }
    entry.modifiedAt = at;
    const startsRestartEpoch = seq !== entry.nextSeq && seq < entry.nextSeq && seq <= MAX_RESTART_EPOCH_INITIAL_SEQUENCE;
    if (seq !== entry.nextSeq && !startsRestartEpoch) {
      throw new TaskEventReplayError(
        `Task AHP event ${eventIndex} for session '${session}' has sequence ${seq}; expected ${entry.nextSeq}.`
      );
    }
    if (startsRestartEpoch) {
      entry.abandonedChunkGroup ||= entry.reassembler.inFlightGroupCount > 0;
      entry.nextSeq = seq;
      entry.reassembler = new Reassembler();
    }
    entry.nextSeq += 1;
    let reassembled;
    try {
      reassembled = entry.reassembler.ingest(value2["payload"]);
    } catch (error) {
      const message = error instanceof Error ? error.message : "unknown chunking failure";
      throw new TaskEventReplayError(
        `Task AHP event ${eventIndex} for session '${session}' could not be reassembled: ${message}`
      );
    }
    if (reassembled === null) {
      continue;
    }
    const envelope = parseActionEnvelope(reassembled, eventIndex);
    if (!envelope.rejectionReason) {
      entry.envelopes.push(envelope);
    }
  }
  return sessions;
}

function foldSession(session, entry) {
  let state = seedSessionState();
  const chats = /* @__PURE__ */ new Map();
  let defaultChat9 = `${session}/chat`;
  for (const envelope of entry.envelopes) {
    const channel = envelope.channel;
    const action = envelope.action;
    if (action.type.startsWith("session/") && channel === session) {
      state = sessionReducer(state, action);
      if (action.type === "session/defaultChatChanged" /* SessionDefaultChatChanged */) {
        defaultChat9 = action.defaultChat || `${session}/chat`;
      }
      continue;
    }
    if (action.type.startsWith("chat/")) {
      const current = chats.get(channel) ?? seedChatState(channel, entry.modifiedAt);
      chats.set(channel, chatReducer(current, action));
    }
  }
  if (!chats.has(defaultChat9)) {
    chats.set(defaultChat9, seedChatState(defaultChat9, entry.modifiedAt));
  }
  return { session, state, chats, defaultChat: defaultChat9, modifiedAt: entry.modifiedAt };
}

function replayTaskAhpEvents(events) {
  const decoded = decodeEvents(events);
  if (decoded.size === 0) {
    return void 0;
  }
  const sessions = [];
  let truncated = false;
  for (const [session, entry] of decoded) {
    sessions.push(foldSession(session, entry));
    truncated ||= entry.abandonedChunkGroup || entry.reassembler.inFlightGroupCount > 0;
  }
  return { sessions, truncated };
}

function parseTaskEventsResponse(body) {
  if (!isRecord8(body) || !Array.isArray(body["events"])) {
    throw new TaskEventReplayError("Task AHP history response is malformed.");
  }
  const total = body["total"];
  if (!Number.isInteger(total) || total < 0) {
    throw new TaskEventReplayError("Task AHP history response has an invalid total.");
  }
  if (total !== body["events"].length) {
    throw new TaskEventReplayError("Task AHP history response has an inconsistent total.");
  }
  return body["events"];
}
export { isRecord8, requireNonEmptyString, requireNonNegativeInteger, parseActionEnvelope, sessionChannelFor, seedSessionState, seedChatState, decodeEvents, foldSession, replayTaskAhpEvents, parseTaskEventsResponse, MAX_RESTART_EPOCH_INITIAL_SEQUENCE, TaskEventReplayError };
