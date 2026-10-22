// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/common/state/protocol/version/negotiation.ts
import { compareProtocolVersions } from "./module-0405.mjs";


// src/vs/platform/agentHost/common/state/protocol/version/negotiation.ts
function tryParseSemver(version) {
  const match2 = /^(\d+)\.(\d+)\.(\d+)$/.exec(version);
  if (!match2) {
    return void 0;
  }
  return [Number(match2[1]), Number(match2[2]), Number(match2[3])];
}

function isCompatibleProtocolVersion(offered, current) {
  const a = tryParseSemver(offered);
  const b = tryParseSemver(current);
  if (!a || !b) {
    return false;
  }
  if (a[0] !== b[0]) {
    return false;
  }
  if (a[0] === 0 && a[1] !== b[1]) {
    return false;
  }
  return compareProtocolVersions(offered, current) <= 0;
}

function negotiateProtocolVersion(offered, current) {
  let best;
  for (const v of offered) {
    if (!isCompatibleProtocolVersion(v, current)) {
      continue;
    }
    if (best === void 0 || compareProtocolVersions(v, best) > 0) {
      best = v;
    }
  }
  return best;
}
export { tryParseSemver, isCompatibleProtocolVersion, negotiateProtocolVersion };
