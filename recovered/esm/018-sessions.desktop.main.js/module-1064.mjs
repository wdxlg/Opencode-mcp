// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/services/textfile/common/textfiles.ts
import { createDecorator } from "./module-0077.mjs";
import { FileOperationError } from "./module-0269.mjs";
import { areFunctions, isUndefinedOrNull } from "./module-0010.mjs";
import { VSBuffer } from "./module-0038.mjs";


// src/vs/workbench/services/textfile/common/textfiles.ts
var ITextFileService = createDecorator("textFileService");

var TextFileOperationError = class extends FileOperationError {
  constructor(message, textFileOperationResult, options3) {
    super(message, 10 /* FILE_OTHER_ERROR */);
    this.textFileOperationResult = textFileOperationResult;
    this.options = options3;
  }
  static isTextFileOperationError(obj) {
    return obj instanceof Error && !isUndefinedOrNull(obj.textFileOperationResult);
  }
};

function isTextFileEditorModel(model) {
  const candidate = model;
  return areFunctions(candidate.setEncoding, candidate.getEncoding, candidate.save, candidate.revert, candidate.isDirty, candidate.getLanguageId);
}

function stringToSnapshot(value2) {
  let done = false;
  return {
    read() {
      if (!done) {
        done = true;
        return value2;
      }
      return null;
    }
  };
}

function toBufferOrReadable(value2) {
  if (typeof value2 === "undefined") {
    return void 0;
  }
  if (typeof value2 === "string") {
    return VSBuffer.fromString(value2);
  }
  return {
    read: () => {
      const chunk2 = value2.read();
      if (typeof chunk2 === "string") {
        return VSBuffer.fromString(chunk2);
      }
      return null;
    }
  };
}
export { isTextFileEditorModel, stringToSnapshot, toBufferOrReadable, ITextFileService, TextFileOperationError };
