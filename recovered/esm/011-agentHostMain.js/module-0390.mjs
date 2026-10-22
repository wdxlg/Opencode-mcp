// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/node/codex/codexRolloutMetadata.ts
import { URI } from "./module-0023.mjs";
import { getCodexRolloutThreadCoordinationCall } from "./module-0385.mjs";
import { listenStream } from "./module-0028.mjs";


// src/vs/platform/agentHost/node/codex/codexRolloutMetadata.ts
import { StringDecoder } from "string_decoder";

async function readCodexRolloutMetadata(fileService, path) {
  const stream = (await fileService.readFileStream(URI.file(path))).value;
  return new Promise((resolve3, reject) => {
    const decoder = new StringDecoder("utf8");
    const modelsByTurnId = /* @__PURE__ */ new Map();
    const threadCoordinationByTurnId = /* @__PURE__ */ new Map();
    const pendingThreadCoordination = /* @__PURE__ */ new Map();
    let remainder = "";
    let isDesktop = false;
    let originModelProvider;
    let currentModel;
    const acceptLine = (line) => {
      if (!line.includes('"session_meta"') && !line.includes('"turn_context"') && !line.includes('"thread_settings_applied"') && !line.includes('"task_started"') && !line.includes("custom_tool_call")) {
        return;
      }
      let record;
      try {
        record = JSON.parse(line);
      } catch {
        return;
      }
      const payload = record.payload;
      if (!payload) {
        return;
      }
      if (record.type === "response_item") {
        if (payload.type === "custom_tool_call" && payload.call_id && payload.input) {
          const turnId = payload.internal_chat_message_metadata_passthrough?.turn_id;
          if (turnId) {
            pendingThreadCoordination.set(payload.call_id, { turnId, input: payload.input });
          }
        } else if (payload.type === "custom_tool_call_output" && payload.call_id) {
          const pending = pendingThreadCoordination.get(payload.call_id);
          pendingThreadCoordination.delete(payload.call_id);
          if (pending) {
            const output = typeof payload.output === "string" ? [payload.output] : payload.output?.flatMap((item) => item.type === "input_text" && typeof item.text === "string" ? [item.text] : []) ?? [];
            const coordination = getCodexRolloutThreadCoordinationCall(pending.input, output);
            if (coordination) {
              const calls = threadCoordinationByTurnId.get(pending.turnId);
              if (calls) {
                calls.push(coordination);
              } else {
                threadCoordinationByTurnId.set(pending.turnId, [coordination]);
              }
            }
          }
        }
        return;
      }
      if (record.type === "session_meta") {
        isDesktop = payload.originator === "Codex Desktop";
        originModelProvider = payload.model_provider;
        return;
      }
      if (record.type === "turn_context" && payload.turn_id && payload.model) {
        currentModel = {
          modelProvider: currentModel?.modelProvider ?? originModelProvider ?? "openai",
          modelId: payload.model
        };
        modelsByTurnId.set(payload.turn_id, currentModel);
        return;
      }
      if (record.type !== "event_msg") {
        return;
      }
      if (payload.type === "thread_settings_applied") {
        const settings = payload.thread_settings;
        if (settings?.model && settings.model_provider_id) {
          currentModel = { modelProvider: settings.model_provider_id, modelId: settings.model };
        }
        return;
      }
      if (payload.type === "task_started" && payload.turn_id && currentModel) {
        modelsByTurnId.set(payload.turn_id, currentModel);
      }
    };
    const acceptText = (text, flush) => {
      remainder += text;
      let newline;
      while ((newline = remainder.indexOf("\n")) >= 0) {
        acceptLine(remainder.slice(0, newline));
        remainder = remainder.slice(newline + 1);
      }
      if (flush && remainder) {
        acceptLine(remainder);
        remainder = "";
      }
    };
    listenStream(stream, {
      onData: (data) => acceptText(decoder.write(data.buffer), false),
      onError: reject,
      onEnd: () => {
        acceptText(decoder.end(), true);
        resolve3({
          isDesktop,
          originModelProvider,
          selectedModel: currentModel,
          modelsByTurnId,
          threadCoordinationByTurnId
        });
      }
    });
  });
}
export { readCodexRolloutMetadata, StringDecoder };
