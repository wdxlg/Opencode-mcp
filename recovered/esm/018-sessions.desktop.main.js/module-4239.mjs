// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/platform/agentHost/common/sshHostKeyPolicy.ts



// src/vs/platform/agentHost/common/sshHostKeyPolicy.ts
function decideHostKeyTrust(request2, trustedKeys) {
  const strict = request2.strictHostKeyChecking;
  if (request2.knownHostsMatch === "revoked") {
    return { kind: "deny", reason: "revoked" };
  }
  if (strict === "no" || strict === "off") {
    const storedUnderOptOut = trustedKeys.find((key3) => key3.keyType === request2.keyType);
    if (storedUnderOptOut && storedUnderOptOut.fingerprint !== request2.fingerprint) {
      return { kind: "deny", reason: "mismatch", source: "stored" };
    }
    if (request2.knownHostsMatch === "mismatch") {
      return { kind: "deny", reason: "mismatch", source: "known-hosts" };
    }
    return { kind: "trust", persist: false, reason: "strict-disabled" };
  }
  const storedForKeyType = trustedKeys.find((key3) => key3.keyType === request2.keyType);
  if (storedForKeyType) {
    return storedForKeyType.fingerprint === request2.fingerprint ? { kind: "trust", persist: false, reason: "stored" } : { kind: "deny", reason: "mismatch", source: "stored" };
  }
  if (request2.knownHostsMatch === "mismatch") {
    return { kind: "deny", reason: "mismatch", source: "known-hosts" };
  }
  if (request2.knownHostsMatch === "match") {
    return { kind: "trust", persist: true, reason: "known-hosts" };
  }
  if (strict === "yes") {
    return { kind: "deny", reason: "strict-yes" };
  }
  if (strict === "accept-new") {
    return { kind: "trust", persist: true, reason: "strict-accept-new" };
  }
  if (!request2.userInitiated) {
    return { kind: "deny", reason: "not-user-initiated" };
  }
  return { kind: "prompt", reason: request2.knownHostsMatch === "ca-only" ? "ca-only" : "unknown" };
}
export { decideHostKeyTrust };
