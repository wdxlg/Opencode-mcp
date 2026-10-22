// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/node/codex/codexThreadCoordination.ts
import { buildOpenSessionLinkUri } from "./module-0230.mjs";
import { AgentSession, CODEX_AGENT_PROVIDER_ID } from "./module-0048.mjs";


// src/vs/platform/agentHost/node/codex/codexThreadCoordination.ts
var CREATE_THREAD_CALL_MARKER = "tools.codex_app__create_thread";

var SEND_MESSAGE_CALL_MARKER = "tools.codex_app__send_message_to_thread";

function buildCodexThreadOpenLink(threadId) {
  return buildOpenSessionLinkUri(AgentSession.uri(CODEX_AGENT_PROVIDER_ID, threadId));
}

function getCodexThreadCoordinationCall(item) {
  if (item.namespace !== "codex_app" || item.success === false || item.status !== "completed") {
    return void 0;
  }
  let toolName;
  let targetThreadId;
  if (item.tool === "create_thread") {
    toolName = "create_session" /* CreateSession */;
    const result = readThreadResult(item);
    if (result?.hostId && result.hostId !== "local") {
      return void 0;
    }
    targetThreadId = result?.threadId ?? result?.clientThreadId;
  } else if (item.tool === "send_message_to_thread") {
    toolName = "send_message" /* SendMessage */;
    const hostId = readStringProperty2(item.arguments, "hostId");
    if (hostId && hostId !== "local") {
      return void 0;
    }
    targetThreadId = readStringProperty2(item.arguments, "threadId");
  } else {
    return void 0;
  }
  if (!targetThreadId) {
    return void 0;
  }
  return {
    toolName,
    targetThreadId,
    openLink: buildCodexThreadOpenLink(targetThreadId),
    toolInput: item.arguments
  };
}

function getCodexRolloutThreadCoordinationCall(input, output) {
  const result = readThreadResultText(output);
  const targetThreadId = result?.threadId ?? result?.clientThreadId;
  if (!targetThreadId) {
    return void 0;
  }
  let toolName;
  let label;
  if (input.includes(CREATE_THREAD_CALL_MARKER)) {
    toolName = "create_session" /* CreateSession */;
    label = readScriptStringProperty(input, "title") ?? readScriptStringProperty(input, "prompt");
  } else if (input.includes(SEND_MESSAGE_CALL_MARKER)) {
    toolName = "send_message" /* SendMessage */;
    label = readScriptStringProperty(input, "prompt");
  } else {
    return void 0;
  }
  const hostId = result?.hostId ?? readScriptStringProperty(input, "hostId");
  if (hostId && hostId !== "local") {
    return void 0;
  }
  return {
    toolName,
    targetThreadId,
    openLink: buildCodexThreadOpenLink(targetThreadId),
    toolInput: { prompt: label ?? targetThreadId }
  };
}

function extractCodexCreatedThreadDirectives(text) {
  const threadIds = [];
  const output = [];
  let fence;
  const lines = text.split(/\r?\n/);
  for (let index = 0; index < lines.length; index++) {
    const line = lines[index];
    const fenceMatch = /^ {0,3}(?<marker>`{3,}|~{3,})(?<remainder>.*)$/.exec(line)?.groups;
    const fenceMarker = fenceMatch?.["marker"];
    if (fenceMarker) {
      if (!fence) {
        fence = fenceMarker;
      } else if (fenceMarker[0] === fence[0] && fenceMarker.length >= fence.length && !fenceMatch?.["remainder"]?.trim()) {
        fence = void 0;
      }
      output.push(line);
      continue;
    }
    const directive = !fence ? /^ {0,3}::created-thread\{\s*(?:threadId|clientThreadId)="(?<threadId>[^"\r\n]+)"\s*\}\s*$/.exec(line)?.groups : void 0;
    const threadId = directive?.["threadId"]?.trim();
    if (threadId) {
      threadIds.push(threadId);
      if (output.at(-1)?.trim() === "" && lines[index + 1]?.trim() === "") {
        index++;
      }
    } else {
      output.push(line);
    }
  }
  return {
    text: threadIds.length > 0 ? output.join("\n").trimEnd() : text,
    threadIds
  };
}

function readThreadResult(item) {
  return readThreadResultText((item.contentItems ?? []).flatMap((contentItem) => contentItem.type === "inputText" ? [contentItem.text] : []));
}

function readThreadResultText(output) {
  for (const text of output) {
    for (const candidate of [text, ...text.split(/\r?\n/).reverse()]) {
      try {
        const parsed = JSON.parse(candidate);
        const threadId = readStringProperty2(parsed, "threadId");
        const clientThreadId = readStringProperty2(parsed, "clientThreadId");
        if (threadId || clientThreadId) {
          return {
            threadId,
            clientThreadId,
            hostId: readStringProperty2(parsed, "hostId")
          };
        }
      } catch {
      }
    }
  }
  return void 0;
}

function readScriptStringProperty(input, key) {
  const literal = new RegExp(`\\b${key}\\s*:\\s*(?<literal>"(?:\\\\.|[^"\\\\])*")`).exec(input)?.groups?.["literal"];
  if (!literal) {
    return void 0;
  }
  try {
    const value = JSON.parse(literal);
    return typeof value === "string" && value.length > 0 ? value : void 0;
  } catch {
    return void 0;
  }
}

function readStringProperty2(value, key) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return void 0;
  }
  const property = value[key];
  return typeof property === "string" && property.length > 0 ? property : void 0;
}
export { buildCodexThreadOpenLink, getCodexThreadCoordinationCall, getCodexRolloutThreadCoordinationCall, extractCodexCreatedThreadDirectives, readThreadResult, readThreadResultText, readScriptStringProperty, readStringProperty2, CREATE_THREAD_CALL_MARKER, SEND_MESSAGE_CALL_MARKER };
