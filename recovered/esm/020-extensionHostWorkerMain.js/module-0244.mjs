// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/worker/extensionHostWorkerMain.js
// Original module marker: src/vs/workbench/services/textfile/common/textfiles.ts
import { createDecorator } from "./module-0038.mjs";


// src/vs/workbench/services/textfile/common/textfiles.ts
var ITextFileService = createDecorator("textFileService");

function stringToSnapshot(value) {
  let done = false;
  return {
    read() {
      if (!done) {
        done = true;
        return value;
      }
      return null;
    }
  };
}
export { stringToSnapshot, ITextFileService };
