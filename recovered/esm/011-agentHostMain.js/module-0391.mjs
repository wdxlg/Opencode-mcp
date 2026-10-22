// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/node/codex/codexAccountState.ts



// src/vs/platform/agentHost/node/codex/codexAccountState.ts
function codexAccountStateFromResponse(response) {
  if (response.account?.type === "chatgpt") {
    return { usageSource: "openai", status: "signedIn", authType: "chatgpt", email: response.account.email ?? void 0, planType: response.account.planType, requiresOpenaiAuth: response.requiresOpenaiAuth };
  }
  if (response.account?.type === "apiKey") {
    return { usageSource: "openai", status: "unavailable", authType: "apiKey", requiresOpenaiAuth: response.requiresOpenaiAuth };
  }
  if (response.account) {
    return { usageSource: "openai", status: "unavailable", authType: "other", requiresOpenaiAuth: response.requiresOpenaiAuth };
  }
  return { usageSource: "openai", status: response.requiresOpenaiAuth ? "signedOut" : "unavailable", requiresOpenaiAuth: response.requiresOpenaiAuth };
}

function codexAccountRateLimitFromResponse(response) {
  const codexSnapshot = response.rateLimitsByLimitId?.codex;
  const snapshot = codexSnapshot?.primary || codexSnapshot?.secondary ? codexSnapshot : response.rateLimits;
  const windows = [snapshot.primary, snapshot.secondary].filter((window3) => !!window3);
  if (windows.length === 0) {
    return void 0;
  }
  const weeklyWindowMins = 7 * 24 * 60;
  const window2 = windows.reduce((best, candidate) => {
    if (candidate.windowDurationMins === null) {
      return best;
    }
    if (best.windowDurationMins === null) {
      return candidate;
    }
    return Math.abs(candidate.windowDurationMins - weeklyWindowMins) < Math.abs(best.windowDurationMins - weeklyWindowMins) ? candidate : best;
  });
  if (!Number.isFinite(window2.usedPercent)) {
    return void 0;
  }
  return {
    usedPercent: Math.min(100, Math.max(0, window2.usedPercent)),
    windowDurationMins: window2.windowDurationMins !== null && window2.windowDurationMins > 0 ? window2.windowDurationMins : void 0,
    resetsAt: window2.resetsAt !== null && window2.resetsAt > 0 ? window2.resetsAt : void 0
  };
}
export { codexAccountStateFromResponse, codexAccountRateLimitFromResponse };
