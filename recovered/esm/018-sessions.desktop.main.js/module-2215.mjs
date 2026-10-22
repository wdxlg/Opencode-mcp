// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/platform/agentHost/common/partialToolInput.ts
import { parse5 } from "./module-0885.mjs";


// src/vs/platform/agentHost/common/partialToolInput.ts
var MAX_PARTIAL_TOOL_INPUT_PARSE_LENGTH = 4 * 1024;

var lastDisplayInput;

var lastDisplayValue;

function parsePartialToolInput(raw, maxLength) {
  const parsed = parse5(maxLength === void 0 ? raw : raw.slice(0, maxLength));
  return parsed !== null && typeof parsed === "object" && !Array.isArray(parsed) && Object.keys(parsed).length > 0 ? { ...parsed } : void 0;
}

function parsePartialToolInputForDisplay(raw) {
  const input = raw.slice(0, MAX_PARTIAL_TOOL_INPUT_PARSE_LENGTH);
  if (input !== lastDisplayInput) {
    lastDisplayInput = input;
    lastDisplayValue = parsePartialToolInput(input);
  }
  return lastDisplayValue ? { ...lastDisplayValue } : void 0;
}
export { parsePartialToolInput, parsePartialToolInputForDisplay, MAX_PARTIAL_TOOL_INPUT_PARSE_LENGTH, lastDisplayInput, lastDisplayValue };
