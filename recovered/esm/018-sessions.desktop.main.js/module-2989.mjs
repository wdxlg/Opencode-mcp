// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/mergeEditor/browser/mergeEditorSerializer.ts
import { parse2 } from "./module-0265.mjs";
import { MergeEditorInput, MergeEditorInputData } from "./module-1145.mjs";
import { onUnexpectedError } from "./module-0004.mjs";


// src/vs/workbench/contrib/mergeEditor/browser/mergeEditorSerializer.ts
var MergeEditorSerializer = class {
  canSerialize() {
    return true;
  }
  serialize(editor) {
    return JSON.stringify(this.toJSON(editor));
  }
  toJSON(editor) {
    return {
      base: editor.base,
      input1: editor.input1,
      input2: editor.input2,
      result: editor.result
    };
  }
  deserialize(instantiationService, raw) {
    try {
      const data = parse2(raw);
      return instantiationService.createInstance(
        MergeEditorInput,
        data.base,
        new MergeEditorInputData(data.input1.uri, data.input1.title, data.input1.detail, data.input1.description),
        new MergeEditorInputData(data.input2.uri, data.input2.title, data.input2.detail, data.input2.description),
        data.result
      );
    } catch (err) {
      onUnexpectedError(err);
      return void 0;
    }
  }
};
export { MergeEditorSerializer };
