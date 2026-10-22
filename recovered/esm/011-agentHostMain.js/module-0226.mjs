// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/common/partialToolInput.ts
import { parse3 } from "./module-0122.mjs";


// src/vs/platform/agentHost/common/partialToolInput.ts
var MAX_PARTIAL_TOOL_INPUT_PARSE_LENGTH = 4 * 1024;

function parsePartialToolInput(raw, maxLength) {
  const parsed = parse3(maxLength === void 0 ? raw : raw.slice(0, maxLength));
  return parsed !== null && typeof parsed === "object" && !Array.isArray(parsed) && Object.keys(parsed).length > 0 ? { ...parsed } : void 0;
}
export { parsePartialToolInput, MAX_PARTIAL_TOOL_INPUT_PARSE_LENGTH };
