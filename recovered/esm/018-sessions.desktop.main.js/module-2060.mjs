// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/common/voiceClient/voiceCloseCodes.ts



// src/vs/workbench/contrib/chat/common/voiceClient/voiceCloseCodes.ts
var INFO = /* @__PURE__ */ new Map([
  [4001 /* Unauthenticated */, { kind: "fatal", action: "signIn" }],
  // No action: there is nothing the user can do in-product about this one.
  [4003 /* Forbidden */, { kind: "fatal" }],
  [4008 /* SessionReplaced */, { kind: "expected" }],
  // Capacity clears on its own, so keep reconnecting and explain meanwhile.
  [4029 /* ServerBusy */, { kind: "transient" }],
  [4500 /* InternalError */, { kind: "transient" }],
  [4503 /* AuthUnavailable */, { kind: "transient" }],
  // 1001 is the backend's idle timeout, which keeps that code on purpose.
  [1e3, { kind: "expected" }],
  [1001, { kind: "expected" }],
  // Emitted by backends that predate this registry.
  [1011, { kind: "transient" }],
  [1013, { kind: "transient" }]
]);

function voiceCloseCodeInfo(code) {
  return INFO.get(code);
}

function isTerminalCloseCode(code) {
  const info = INFO.get(code);
  return info !== void 0 && info.kind !== "transient";
}
export { voiceCloseCodeInfo, isTerminalCloseCode, INFO };
