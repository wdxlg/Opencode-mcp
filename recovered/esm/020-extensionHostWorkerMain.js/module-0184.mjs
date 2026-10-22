// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/worker/extensionHostWorkerMain.js
// Original module marker: src/vs/workbench/contrib/chat/common/chatRequestOrigin.ts
import { URI } from "./module-0023.mjs";
import { createDecorator } from "./module-0038.mjs";


// src/vs/workbench/contrib/chat/common/chatRequestOrigin.ts
function serializeChatRequestOrigin(origin) {
  return {
    kind: origin.kind,
    sourceSessionResource: origin.sourceSessionResource.toJSON(),
    ...origin.delegationScope ? { delegationScope: origin.delegationScope } : {}
  };
}

function reviveChatRequestOrigin(origin) {
  if (origin?.kind !== "delegation" /* Delegation */) {
    return void 0;
  }
  const sourceSessionResource = URI.revive(origin.sourceSessionResource);
  return sourceSessionResource ? {
    kind: origin.kind,
    sourceSessionResource,
    ...origin.delegationScope ? { delegationScope: origin.delegationScope } : {}
  } : void 0;
}

var IChatRequestOriginService = createDecorator("chatRequestOriginService");
export { serializeChatRequestOrigin, reviveChatRequestOrigin, IChatRequestOriginService };
