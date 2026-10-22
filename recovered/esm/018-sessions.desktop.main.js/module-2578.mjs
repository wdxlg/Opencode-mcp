// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/chatDebug/chatDebugEventDetailRenderer.ts
import { safeIntl } from "./module-0120.mjs";
import { localize } from "./module-0001.mjs";


// src/vs/workbench/contrib/chat/browser/chatDebug/chatDebugEventDetailRenderer.ts
var numberFormatter3 = safeIntl.NumberFormat();

function formatEventDetail(event) {
  switch (event.kind) {
    case "toolCall": {
      const parts = [localize(10582, null, event.toolName)];
      if (event.toolCallId) {
        parts.push(localize(10571, null, event.toolCallId));
      }
      if (event.result) {
        parts.push(localize(10580, null, event.result));
      }
      if (event.durationInMillis !== void 0) {
        parts.push(localize(10573, null, numberFormatter3.value.format(event.durationInMillis)));
      }
      if (event.input) {
        parts.push(`
${localize(10574, null)}
${event.input}`);
      }
      if (event.output) {
        parts.push(`
${localize(10578, null)}
${event.output}`);
      }
      return parts.join("\n");
    }
    case "modelTurn": {
      const parts = [event.model ?? localize(10576, null)];
      if (event.inputTokens !== void 0) {
        parts.push(localize(10575, null, numberFormatter3.value.format(event.inputTokens)));
      }
      if (event.outputTokens !== void 0) {
        parts.push(localize(10579, null, numberFormatter3.value.format(event.outputTokens)));
      }
      if (event.cachedTokens !== void 0) {
        parts.push(localize(10570, null, numberFormatter3.value.format(event.cachedTokens)));
      }
      if (event.totalTokens !== void 0) {
        parts.push(localize(10584, null, numberFormatter3.value.format(event.totalTokens)));
      }
      if (event.durationInMillis !== void 0) {
        parts.push(localize(10573, null, numberFormatter3.value.format(event.durationInMillis)));
      }
      return parts.join("\n");
    }
    case "generic":
      return `${event.name}
${event.details ?? ""}`;
    case "subagentInvocation": {
      const parts = [localize(10568, null, event.agentName)];
      if (event.description) {
        parts.push(localize(10572, null, event.description));
      }
      if (event.status) {
        parts.push(localize(10581, null, event.status));
      }
      if (event.durationInMillis !== void 0) {
        parts.push(localize(10573, null, numberFormatter3.value.format(event.durationInMillis)));
      }
      if (event.toolCallCount !== void 0) {
        parts.push(localize(10583, null, numberFormatter3.value.format(event.toolCallCount)));
      }
      if (event.modelTurnCount !== void 0) {
        parts.push(localize(10577, null, numberFormatter3.value.format(event.modelTurnCount)));
      }
      return parts.join("\n");
    }
    case "userMessage": {
      const parts = [localize(10585, null, event.message)];
      for (const section of event.sections) {
        parts.push(`
--- ${section.name} ---
${section.content}`);
      }
      return parts.join("\n");
    }
    case "agentResponse": {
      const parts = [localize(10569, null, event.message)];
      for (const section of event.sections) {
        parts.push(`
--- ${section.name} ---
${section.content}`);
      }
      return parts.join("\n");
    }
  }
}
export { formatEventDetail, numberFormatter3 };
