// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/services/textMate/browser/backgroundTokenization/worker/textMateTokenizationWorker.workerMain.js
// Original module marker: src/vs/editor/common/textModelEvents.ts



// src/vs/editor/common/textModelEvents.ts
function serializeFontTokenOptions() {
  return (annotation) => {
    return {
      fontFamily: annotation.fontFamily ?? "",
      fontSizeMultiplier: annotation.fontSizeMultiplier ?? 0,
      lineHeightMultiplier: annotation.lineHeightMultiplier ?? 0
    };
  };
}
export { serializeFontTokenOptions };
