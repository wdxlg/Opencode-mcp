// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/platform/agentHost/common/reconnectPolicy.ts



// src/vs/platform/agentHost/common/reconnectPolicy.ts
var DEFAULT_RECONNECT_POLICY = {
  autoRestore: true,
  initialDelayMs: 1e3,
  maxDelayMs: 3e4,
  maxAttempts: 10
};

function computeReconnectDelay(policy, attempt) {
  return Math.min(policy.initialDelayMs * Math.pow(2, attempt - 1), policy.maxDelayMs);
}

function hasExhaustedReconnectAttempts(policy, attempt) {
  return attempt >= policy.maxAttempts;
}
export { computeReconnectDelay, hasExhaustedReconnectAttempts, DEFAULT_RECONNECT_POLICY };
