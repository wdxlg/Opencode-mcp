// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/platform/userDataSync/common/content.ts
import { setProperty } from "./module-1377.mjs";


// src/vs/platform/userDataSync/common/content.ts
function edit2(content, originalPath, value2, formattingOptions) {
  const edit3 = setProperty(content, originalPath, value2, formattingOptions)[0];
  if (edit3) {
    content = content.substring(0, edit3.offset) + edit3.content + content.substring(edit3.offset + edit3.length);
  }
  return content;
}
export { edit2 };
