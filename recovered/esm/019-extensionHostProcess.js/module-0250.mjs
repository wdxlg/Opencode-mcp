// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/node/extensionHostProcess.js
// Original module marker: src/vs/workbench/services/textfile/common/textfiles.ts
import { createDecorator2 } from "./module-0048.mjs";


// src/vs/workbench/services/textfile/common/textfiles.ts
var ITextFileService = createDecorator2("textFileService");

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
