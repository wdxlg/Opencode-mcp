// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/widget/input/chatInputStatePersistence.ts
import { parse2, stringify } from "./module-0265.mjs";
import { IChatRequestVariableEntry } from "./module-0979.mjs";


// src/vs/workbench/contrib/chat/browser/widget/input/chatInputStatePersistence.ts
function serializeUntitledInputState(value2) {
  return stringify(value2 && { ...value2, attachments: [] });
}

function deserializeUntitledInputState(value2) {
  return parse2(value2);
}

function serializeUntitledInputAttachments(attachments) {
  return stringify(attachments.map(IChatRequestVariableEntry.toExport));
}

function deserializeUntitledInputAttachments(value2) {
  return parse2(value2).map(IChatRequestVariableEntry.fromExport);
}
export { serializeUntitledInputState, deserializeUntitledInputState, serializeUntitledInputAttachments, deserializeUntitledInputAttachments };
