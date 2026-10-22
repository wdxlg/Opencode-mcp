// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/platform/userDataSync/common/content.ts
import { setProperty } from "./module-1378.mjs";


// src/vs/platform/userDataSync/common/content.ts
function edit2(content2, originalPath, value2, formattingOptions) {
  const edit3 = setProperty(content2, originalPath, value2, formattingOptions)[0];
  if (edit3) {
    content2 = content2.substring(0, edit3.offset) + edit3.content + content2.substring(edit3.offset + edit3.length);
  }
  return content2;
}
export { edit2 };
