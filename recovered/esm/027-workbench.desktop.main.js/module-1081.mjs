// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/common/editing/chatEditingService.ts
import { createDecorator } from "./module-0077.mjs";
import { autorunSelfDisposable } from "./module-0052.mjs";
import { RawContextKey } from "./module-0089.mjs";
import { localize } from "./module-0001.mjs";
import { hasKey } from "./module-0010.mjs";
import { URI } from "./module-0032.mjs";
import { VSBuffer, decodeHex, encodeHex } from "./module-0038.mjs";


// src/vs/workbench/contrib/chat/common/editing/chatEditingService.ts
var IChatEditingService = createDecorator("chatEditingService");

function chatEditingSessionIsReady(session) {
  return new Promise((resolve3) => {
    autorunSelfDisposable((reader) => {
      const state = session.state.read(reader);
      if (state !== 0 /* Initial */) {
        reader.dispose();
        resolve3();
      }
    });
  });
}

function emptySessionEntryDiff(originalURI, modifiedURI) {
  return {
    originalURI,
    modifiedURI,
    added: 0,
    removed: 0,
    quitEarly: false,
    identical: false,
    isFinal: false,
    isBusy: false
  };
}

var CHAT_EDITING_MULTI_DIFF_SOURCE_RESOLVER_SCHEME = "chat-editing-multi-diff-source";

var chatEditingWidgetFileStateContextKey = new RawContextKey("chatEditingWidgetFileState", void 0, localize(12948, null));

var chatEditingAgentSupportsReadonlyReferencesContextKey = new RawContextKey("chatEditingAgentSupportsReadonlyReferences", void 0, localize(12947, null));

var decidedChatEditingResourceContextKey = new RawContextKey("decidedChatEditingResource", []);

var chatEditingResourceContextKey = new RawContextKey("chatEditingResource", void 0);

var inChatEditingSessionContextKey = new RawContextKey("inChatEditingSession", void 0);

var hasUndecidedChatEditingResourceContextKey = new RawContextKey("hasUndecidedChatEditingResource", false);

var hasAppliedChatEditsContextKey = new RawContextKey("hasAppliedChatEdits", false);

var applyingChatEditsFailedContextKey = new RawContextKey("applyingChatEditsFailed", false);

function isChatEditingActionContext(thing) {
  return typeof thing === "object" && !!thing && hasKey(thing, { sessionResource: true });
}

function getMultiDiffSourceUri(session, showPreviousChanges) {
  return URI.from({
    scheme: CHAT_EDITING_MULTI_DIFF_SOURCE_RESOLVER_SCHEME,
    authority: encodeHex(VSBuffer.fromString(session.chatSessionResource.toString())),
    query: showPreviousChanges ? "previous" : void 0
  });
}

function parseChatMultiDiffUri(uri5) {
  const chatSessionResource = URI.parse(decodeHex(uri5.authority).toString());
  const showPreviousChanges = uri5.query === "previous";
  return { chatSessionResource, showPreviousChanges };
}
export { chatEditingSessionIsReady, emptySessionEntryDiff, isChatEditingActionContext, getMultiDiffSourceUri, parseChatMultiDiffUri, IChatEditingService, CHAT_EDITING_MULTI_DIFF_SOURCE_RESOLVER_SCHEME, chatEditingWidgetFileStateContextKey, chatEditingAgentSupportsReadonlyReferencesContextKey, decidedChatEditingResourceContextKey, chatEditingResourceContextKey, inChatEditingSessionContextKey, hasUndecidedChatEditingResourceContextKey, hasAppliedChatEditsContextKey, applyingChatEditsFailedContextKey };
