// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/attachments/chatScreenshotContext.ts
import { localize } from "./module-0001.mjs";


// src/vs/workbench/contrib/chat/browser/attachments/chatScreenshotContext.ts
var ScreenshotVariableId = "screenshot-focused-window";

function convertBufferToScreenshotVariable(buffer) {
  return {
    id: ScreenshotVariableId,
    name: localize(9914, null),
    value: buffer.buffer,
    kind: "image"
  };
}
export { convertBufferToScreenshotVariable, ScreenshotVariableId };
