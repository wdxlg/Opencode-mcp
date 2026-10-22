// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/editTelemetry/browser/helpers/observableWorkspace.ts
import { derived, derivedHandleChanges } from "./module-0054.mjs";
import { observableValue } from "./module-0048.mjs";
import { autorun } from "./module-0052.mjs";
import { runOnChange } from "./module-0064.mjs";
import { StringEdit, StringReplacement } from "./module-0193.mjs";
import { EditSources } from "./module-0377.mjs";


// src/vs/workbench/contrib/editTelemetry/browser/helpers/observableWorkspace.ts
var ObservableWorkspace = class {
  constructor() {
    this._version = 0;
    /**
     * Is fired when any open document changes.
    */
    this.onDidOpenDocumentChange = derivedHandleChanges({
      owner: this,
      changeTracker: {
        createChangeSummary: () => ({ didChange: false }),
        handleChange: (ctx, changeSummary) => {
          if (!ctx.didChange(this.documents)) {
            changeSummary.didChange = true;
          }
          return true;
        }
      }
    }, (reader, changeSummary) => {
      const docs = this.documents.read(reader);
      for (const d of docs) {
        d.value.read(reader);
      }
      if (changeSummary.didChange) {
        this._version++;
      }
      return this._version;
    });
    this.lastActiveDocument = derived((reader) => {
      const obs = observableValue("lastActiveDocument", void 0);
      reader.store.add(autorun((reader2) => {
        const docs = this.documents.read(reader2);
        for (const d of docs) {
          reader2.store.add(runOnChange(d.value, () => {
            obs.set(d, void 0);
          }));
        }
      }));
      return obs;
    }).flatten();
  }
  getFirstOpenDocument() {
    return this.documents.get()[0];
  }
  getDocument(documentId) {
    return this.documents.get().find((d) => d.uri.toString() === documentId.toString());
  }
};

var StringEditWithReason = class _StringEditWithReason extends StringEdit {
  constructor(replacements, reason) {
    super(replacements);
    this.reason = reason;
  }
  static replace(range2, newText, source = EditSources.unknown({})) {
    return new _StringEditWithReason([new StringReplacement(range2, newText)], source);
  }
};
export { ObservableWorkspace, StringEditWithReason };
