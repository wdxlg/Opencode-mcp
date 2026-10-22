// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/extensions/opencode/dist/extension.js
// Original module marker: src/bridge-tool-name.ts
import { init_define_OPENCODE_BUILD_INFO } from "./module-0000.mjs";


// src/bridge-tool-name.ts
init_define_OPENCODE_BUILD_INFO();

function resolveBridgeToolName(rawName, isKnown) {
  const trimmed = rawName.trim();
  if (isKnown(trimmed)) return trimmed;
  const candidates = [];
  if (trimmed.startsWith("mcp__")) {
    const parts = trimmed.split("__");
    if (parts.length >= 3) candidates.push(parts.slice(2).join("__"));
    if (parts.length >= 2) candidates.push(parts.slice(1).join("__"));
  } else if (trimmed.startsWith("mcp_")) {
    const separator = trimmed.indexOf("_", 4);
    if (separator >= 0) candidates.push(trimmed.slice(separator + 1));
  }
  for (const candidate of candidates) {
    if (isKnown(candidate)) return candidate;
  }
  return trimmed;
}
export { resolveBridgeToolName };
