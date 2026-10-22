// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/common/attachments/chatVariables.ts
import { createDecorator } from "./module-0077.mjs";


// src/vs/workbench/contrib/chat/common/attachments/chatVariables.ts
var IChatVariablesService = createDecorator("IChatVariablesService");

function toAttachedContextDynamicVariable(entry, range2) {
  return {
    id: entry.id,
    fullName: entry.name,
    icon: entry.icon,
    modelDescription: entry.modelDescription,
    isFile: entry.kind === "file",
    isDirectory: entry.kind === "directory",
    isAttachmentReference: true,
    range: range2,
    data: void 0
  };
}
export { toAttachedContextDynamicVariable, IChatVariablesService };
