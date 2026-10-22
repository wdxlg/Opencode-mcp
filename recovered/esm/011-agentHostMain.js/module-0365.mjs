// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/node/claude/anthropicBetas.ts



// src/vs/platform/agentHost/node/claude/anthropicBetas.ts
var SUPPORTED_ANTHROPIC_BETAS = [
  "interleaved-thinking",
  "context-management",
  "advanced-tool-use"
];

function filterSupportedBetas(headerValue) {
  const filtered = headerValue.split(",").map((b) => b.trim()).filter((b) => b && SUPPORTED_ANTHROPIC_BETAS.some((supported) => b.startsWith(supported + "-")));
  return filtered.length > 0 ? filtered.join(",") : void 0;
}
export { filterSupportedBetas, SUPPORTED_ANTHROPIC_BETAS };
