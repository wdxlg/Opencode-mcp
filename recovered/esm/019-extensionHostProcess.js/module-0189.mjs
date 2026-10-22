// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/node/extensionHostProcess.js
// Original module marker: src/vs/workbench/contrib/chat/common/chat.ts
import { isLegacyChatTerminalToolInvocationData } from "./module-0130.mjs";


// src/vs/workbench/contrib/chat/common/chat.ts
function migrateLegacyTerminalToolSpecificData(data) {
  if (isLegacyChatTerminalToolInvocationData(data)) {
    data = {
      kind: "terminal",
      commandLine: {
        original: data.command,
        toolEdited: void 0,
        userEdited: void 0
      },
      language: data.language
    };
  }
  return data;
}
export { migrateLegacyTerminalToolSpecificData };
