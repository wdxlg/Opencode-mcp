// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/node/extensionHostProcess.js
// Original module marker: src/vs/workbench/contrib/chat/common/editing/chatEditingService.ts
import { createDecorator2 } from "./module-0048.mjs";
import { RawContextKey } from "./module-0049.mjs";
import { localize } from "./module-0013.mjs";


// src/vs/workbench/contrib/chat/common/editing/chatEditingService.ts
var IChatEditingService = createDecorator2("chatEditingService");

var chatEditingWidgetFileStateContextKey = new RawContextKey("chatEditingWidgetFileState", void 0, localize(12948, null));

var chatEditingAgentSupportsReadonlyReferencesContextKey = new RawContextKey("chatEditingAgentSupportsReadonlyReferences", void 0, localize(12947, null));

var decidedChatEditingResourceContextKey = new RawContextKey("decidedChatEditingResource", []);

var chatEditingResourceContextKey = new RawContextKey("chatEditingResource", void 0);

var inChatEditingSessionContextKey = new RawContextKey("inChatEditingSession", void 0);

var hasUndecidedChatEditingResourceContextKey = new RawContextKey("hasUndecidedChatEditingResource", false);

var hasAppliedChatEditsContextKey = new RawContextKey("hasAppliedChatEdits", false);

var applyingChatEditsFailedContextKey = new RawContextKey("applyingChatEditsFailed", false);
export { IChatEditingService, chatEditingWidgetFileStateContextKey, chatEditingAgentSupportsReadonlyReferencesContextKey, decidedChatEditingResourceContextKey, chatEditingResourceContextKey, inChatEditingSessionContextKey, hasUndecidedChatEditingResourceContextKey, hasAppliedChatEditsContextKey, applyingChatEditsFailedContextKey };
