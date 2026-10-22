// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/worker/extensionHostWorkerMain.js
// Original module marker: src/vs/workbench/contrib/chat/common/tools/builtinTools/toolHelpers.ts



// src/vs/workbench/contrib/chat/common/tools/builtinTools/toolHelpers.ts
function createToolSimpleTextResult(value) {
  return {
    content: [{
      kind: "text",
      value
    }]
  };
}
export { createToolSimpleTextResult };
