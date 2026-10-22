// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/common/chatRequestOrigin.ts
import { URI } from "./module-0032.mjs";
import { createDecorator } from "./module-0077.mjs";
import { Disposable, toDisposable } from "./module-0012.mjs";


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

var ChatRequestOriginService = class extends Disposable {
  constructor() {
    super(...arguments);
    this._openers = /* @__PURE__ */ new Set();
  }
  registerOpener(opener) {
    this._openers.add(opener);
    return toDisposable(() => this._openers.delete(opener));
  }
  async open(origin) {
    for (const opener of this._openers) {
      if (await opener.open(origin)) {
        return true;
      }
    }
    return false;
  }
};
export { serializeChatRequestOrigin, reviveChatRequestOrigin, IChatRequestOriginService, ChatRequestOriginService };
