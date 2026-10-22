// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/node/copilot/copilotSystemNotification.ts
import { localize } from "./module-0012.mjs";
import { softAssertNever } from "./module-0007.mjs";


// src/vs/platform/agentHost/node/copilot/copilotSystemNotification.ts
function buildCopilotSystemNotification(event) {
  const data = event.data;
  const kind = data.kind;
  const content = cleanSystemNotificationContent(data.content);
  if (!content) {
    return void 0;
  }
  switch (kind.type) {
    case "shell_completed":
    case "shell_detached_completed": {
      const description = kind.description;
      return {
        messageText: description ? localize(2518, null, description) : localize(2517, null),
        startsTurn: true
      };
    }
    case "agent_completed":
      return {
        messageText: kind.status === "failed" ? localize(2509, null, kind.agentId) : localize(2508, null, kind.agentId),
        startsTurn: true
      };
    case "agent_idle":
      return {
        messageText: localize(2510, null, kind.agentId),
        startsTurn: true
      };
    case "factory_completed":
      return {
        messageText: kind.status === "error" ? localize(2513, null, kind.factoryName) : kind.status === "halted" ? localize(2514, null, kind.factoryName) : kind.status === "cancelled" ? localize(2511, null, kind.factoryName) : localize(2512, null, kind.factoryName),
        startsTurn: true
      };
    case "new_inbox_message":
      return {
        messageText: localize(2516, null, kind.senderName),
        startsTurn: false
      };
    case "instruction_discovered":
      return {
        messageText: localize(2515, null, kind.description ?? kind.sourcePath),
        startsTurn: false
      };
    case "unclassified":
      return {
        messageText: content,
        startsTurn: true
      };
    default:
      softAssertNever(kind);
      return void 0;
  }
}

function cleanSystemNotificationContent(content) {
  const trimmed = content.trim();
  const match2 = /^<system_notification>\s*([\s\S]*?)\s*<\/system_notification>$/.exec(trimmed);
  return (match2?.[1] ?? trimmed).trim();
}
export { buildCopilotSystemNotification, cleanSystemNotificationContent };
