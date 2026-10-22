// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/common/state/agentSubscription.ts
import { isAhpRootChannel } from "./module-0047.mjs";


// src/vs/platform/agentHost/common/state/agentSubscription.ts
function isActionEnvelopeRelevantToSubscriptionUris(envelope, subscribedUris) {
  if (isAhpRootChannel(envelope.channel)) {
    for (const uri of subscribedUris) {
      if (isAhpRootChannel(uri)) {
        return true;
      }
    }
    return false;
  }
  for (const uri of subscribedUris) {
    if (uri === envelope.channel) {
      return true;
    }
  }
  return false;
}
export { isActionEnvelopeRelevantToSubscriptionUris };
