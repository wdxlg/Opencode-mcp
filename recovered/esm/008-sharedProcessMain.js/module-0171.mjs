// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/code/electron-utility/sharedProcess/sharedProcessMain.js
// Original module marker: src/vs/platform/userDataSync/common/content.ts
import { setProperty } from "./module-0073.mjs";


// src/vs/platform/userDataSync/common/content.ts
function edit(content, originalPath, value, formattingOptions) {
  const edit2 = setProperty(content, originalPath, value, formattingOptions)[0];
  if (edit2) {
    content = content.substring(0, edit2.offset) + edit2.content + content.substring(edit2.offset + edit2.length);
  }
  return content;
}
export { edit };
