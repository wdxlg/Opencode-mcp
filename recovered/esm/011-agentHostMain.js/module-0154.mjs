// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/node/shared/modelRefreshRetry.ts



// src/vs/platform/agentHost/node/shared/modelRefreshRetry.ts
var MODEL_REFRESH_MAX_ATTEMPTS = 5;

var MODEL_REFRESH_BASE_DELAY_MS = 1e3;

var MODEL_REFRESH_MAX_DELAY_MS = 3e4;

function modelRefreshBackoff(attempt, baseDelayMs, maxDelayMs) {
  const exp = Math.min(maxDelayMs, baseDelayMs * 2 ** attempt);
  return Math.round(exp / 2 + Math.random() * (exp / 2));
}
export { modelRefreshBackoff, MODEL_REFRESH_MAX_ATTEMPTS, MODEL_REFRESH_BASE_DELAY_MS, MODEL_REFRESH_MAX_DELAY_MS };
