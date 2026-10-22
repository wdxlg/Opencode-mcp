// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/extensions/opencode/runtime/mcp-server.js
// Original module marker: src/mcp-protocol.ts
import { SUPPORTED_PROTOCOL_VERSIONS } from "./module-0082.mjs";


// src/mcp-protocol.ts
var MODERN_ERA_MIN_VERSION = "2026-01-01";

var MODERN_PROTOCOL_VERSION = "2026-07-28";

var LEGACY_PROTOCOL_VERSIONS = Object.freeze(
  [...SUPPORTED_PROTOCOL_VERSIONS].sort((a, b) => a < b ? 1 : a > b ? -1 : 0)
);

var NEGOTIABLE_LATEST_PROTOCOL_VERSION = MODERN_PROTOCOL_VERSION;

var NEGOTIABLE_PROTOCOL_VERSIONS = Object.freeze(
  [MODERN_PROTOCOL_VERSION, ...LEGACY_PROTOCOL_VERSIONS]
);

function classifyProtocolEra(version2) {
  if (!version2) return "legacy";
  return version2 >= MODERN_ERA_MIN_VERSION ? "modern" : "legacy";
}

var SUPPORTS_STATELESS_TRANSPORT = NEGOTIABLE_PROTOCOL_VERSIONS.some(
  (version2) => classifyProtocolEra(version2) === "modern"
);

var PROTOCOL_TRANSPORT_MODE = SUPPORTS_STATELESS_TRANSPORT ? "stateless+stateful (auto-negotiate)" : "stateful (session-affine)";
export { classifyProtocolEra, MODERN_ERA_MIN_VERSION, MODERN_PROTOCOL_VERSION, LEGACY_PROTOCOL_VERSIONS, NEGOTIABLE_LATEST_PROTOCOL_VERSION, NEGOTIABLE_PROTOCOL_VERSIONS, SUPPORTS_STATELESS_TRANSPORT, PROTOCOL_TRANSPORT_MODE };
