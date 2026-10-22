// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/node/claude/anthropicErrors.ts



// src/vs/platform/agentHost/node/claude/anthropicErrors.ts
function buildErrorEnvelope(type, message) {
  return {
    type: "error",
    error: { type, message },
    request_id: null
  };
}

function writeJsonError(res, status, type, message) {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(buildErrorEnvelope(type, message)));
}

function writeUpstreamJsonError(res, status, envelope) {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(envelope));
}

function formatSseErrorFrame(envelope) {
  return `event: error
data: ${JSON.stringify(envelope)}

`;
}
export { buildErrorEnvelope, writeJsonError, writeUpstreamJsonError, formatSseErrorFrame };
