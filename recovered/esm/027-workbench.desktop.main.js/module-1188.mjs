// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/common/chat.ts
import { isLegacyChatTerminalToolInvocationData } from "./module-0972.mjs";
import { chatEditingSessionIsReady } from "./module-1081.mjs";
import { ResourceSet } from "./module-0008.mjs";


// src/vs/workbench/contrib/chat/common/chat.ts
function checkModeOption(mode, option2) {
  if (option2 === void 0) {
    return void 0;
  }
  if (typeof option2 === "function") {
    return option2(mode);
  }
  return option2;
}

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

async function awaitStatsForSession(model) {
  if (!model.editingSession) {
    return void 0;
  }
  await chatEditingSessionIsReady(model.editingSession);
  if (!model.editingSession) {
    return void 0;
  }
  await Promise.all(model.editingSession.entries.get().map((entry) => entry.getDiffInfo?.()));
  if (!model.editingSession) {
    return void 0;
  }
  const diffs = model.editingSession.entries.get();
  const reduceResult = diffs.reduce((acc, diff4) => {
    acc.fileUris.add(diff4.originalURI);
    acc.added += diff4.linesAdded?.get() ?? 0;
    acc.removed += diff4.linesRemoved?.get() ?? 0;
    return acc;
  }, { fileUris: new ResourceSet(), added: 0, removed: 0 });
  if (reduceResult.fileUris.size > 0 && (reduceResult.added > 0 || reduceResult.removed > 0)) {
    return {
      fileCount: reduceResult.fileUris.size,
      added: reduceResult.added,
      removed: reduceResult.removed
    };
  }
  return void 0;
}
export { checkModeOption, migrateLegacyTerminalToolSpecificData, awaitStatsForSession };
