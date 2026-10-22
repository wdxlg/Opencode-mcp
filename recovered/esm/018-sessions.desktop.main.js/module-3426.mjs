// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/editTelemetry/browser/helpers/vscodeObservableWorkspace.ts
import { ObservableWorkspace, StringEditWithReason } from "./module-3425.mjs";
import { Disposable, DisposableStore } from "./module-0012.mjs";
import { observableSignalFromEvent } from "./module-0062.mjs";
import { derived } from "./module-0054.mjs";
import { mapObservableArrayCached } from "./module-0059.mjs";
import { isDefined } from "./module-0010.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IModelService } from "./module-0080.mjs";
import { observableValue } from "./module-0048.mjs";
import { StringText } from "./module-0177.mjs";
import { transaction } from "./module-0045.mjs";
import { offsetEditFromContentChanges } from "./module-0404.mjs";
import { onUnexpectedError } from "./module-0004.mjs";


// src/vs/workbench/contrib/editTelemetry/browser/helpers/vscodeObservableWorkspace.ts
var VSCodeWorkspace = class extends ObservableWorkspace {
  constructor(_textModelService) {
    super();
    this._textModelService = _textModelService;
    this._store = new DisposableStore();
    const onModelAdded = observableSignalFromEvent(this, this._textModelService.onModelAdded);
    const onModelRemoved = observableSignalFromEvent(this, this._textModelService.onModelRemoved);
    const models = derived(this, (reader) => {
      onModelAdded.read(reader);
      onModelRemoved.read(reader);
      const models2 = this._textModelService.getModels();
      return models2;
    });
    const documents = mapObservableArrayCached(this, models, (m, store) => {
      if (m.isTooLargeForSyncing()) {
        return void 0;
      }
      return store.add(new VSCodeDocument(m));
    }).recomputeInitiallyAndOnChange(this._store).map((d) => d.filter(isDefined));
    this._documents = documents;
  }
  get documents() {
    return this._documents;
  }
  dispose() {
    this._store.dispose();
  }
};

VSCodeWorkspace = __decorateClass([
  __decorateParam(0, IModelService)
], VSCodeWorkspace);

var VSCodeDocument = class extends Disposable {
  constructor(textModel) {
    super();
    this.textModel = textModel;
    this._value = observableValue(this, new StringText(this.textModel.getValue()));
    this._version = observableValue(this, this.textModel.getVersionId());
    this._languageId = observableValue(this, this.textModel.getLanguageId());
    this._register(this.textModel.onDidChangeContent((e4) => {
      transaction((tx) => {
        const edit3 = offsetEditFromContentChanges(e4.changes);
        if (e4.detailedReasons.length !== 1) {
          onUnexpectedError(new Error(`Unexpected number of detailed reasons: ${e4.detailedReasons.length}`));
        }
        const change = new StringEditWithReason(edit3.replacements, e4.detailedReasons[0]);
        this._value.set(new StringText(this.textModel.getValue()), tx, change);
        this._version.set(this.textModel.getVersionId(), tx);
      });
    }));
    this._register(this.textModel.onDidChangeLanguage((e4) => {
      transaction((tx) => {
        this._languageId.set(this.textModel.getLanguageId(), tx);
      });
    }));
  }
  get uri() {
    return this.textModel.uri;
  }
  get value() {
    return this._value;
  }
  get version() {
    return this._version;
  }
  get languageId() {
    return this._languageId;
  }
};
export { VSCodeWorkspace, VSCodeDocument };
