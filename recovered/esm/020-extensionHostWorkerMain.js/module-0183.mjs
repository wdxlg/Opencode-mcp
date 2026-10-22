// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/worker/extensionHostWorkerMain.js
// Original module marker: src/vs/workbench/contrib/chat/common/chat.ts
import { isLegacyChatTerminalToolInvocationData } from "./module-0123.mjs";


// src/vs/workbench/contrib/chat/common/chat.ts
function migrateLegacyTerminalToolSpecificData(data2) {
  if (isLegacyChatTerminalToolInvocationData(data2)) {
    data2 = {
      kind: "terminal",
      commandLine: {
        original: data2.command,
        toolEdited: void 0,
        userEdited: void 0
      },
      language: data2.language
    };
  }
  return data2;
}
export { migrateLegacyTerminalToolSpecificData };
