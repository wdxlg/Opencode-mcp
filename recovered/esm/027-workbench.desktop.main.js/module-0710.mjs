// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/contrib/inlineCompletions/browser/model/changeRecorder.ts
import { Disposable } from "./module-0012.mjs";
import { StructuredLogger } from "./module-0709.mjs";
import { observableFromEvent } from "./module-0057.mjs";
import { autorun } from "./module-0052.mjs";
import { ILoggerService, canLog } from "./module-0095.mjs";
import { CodeEditorWidget } from "./module-0441.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";


// src/vs/editor/contrib/inlineCompletions/browser/model/changeRecorder.ts
var TextModelChangeRecorder = class extends Disposable {
  constructor(_editor, _instantiationService, _loggerService) {
    super();
    this._editor = _editor;
    this._instantiationService = _instantiationService;
    this._loggerService = _loggerService;
    this._structuredLogger = this._register(this._instantiationService.createInstance(
      StructuredLogger.cast(),
      "editor.inlineSuggest.logChangeReason.commandId"
    ));
    const logger = this._loggerService?.createLogger("textModelChanges", { hidden: false, name: "Text Model Changes Reason" });
    const loggingLevel = observableFromEvent(this, logger.onDidChangeLogLevel, () => logger.getLevel());
    this._register(autorun((reader) => {
      if (!canLog(loggingLevel.read(reader), 1 /* Trace */)) {
        return;
      }
      reader.store.add(this._editor.onDidChangeModelContent((e) => {
        if (this._editor.getModel()?.uri.scheme === "output") {
          return;
        }
        logger.trace("onDidChangeModelContent: " + e.detailedReasons.map((r2) => r2.toKey(Number.MAX_VALUE)).join(", "));
      }));
    }));
    this._register(autorun((reader) => {
      if (!(this._editor instanceof CodeEditorWidget)) {
        return;
      }
      if (!this._structuredLogger.isEnabled.read(reader)) {
        return;
      }
      reader.store.add(this._editor.onDidChangeModelContent((e) => {
        const tm = this._editor.getModel();
        if (!tm) {
          return;
        }
        const reason = e.detailedReasons[0];
        const data = {
          ...reason.metadata,
          sourceId: "TextModel.setChangeReason",
          source: reason.metadata.source,
          time: Date.now(),
          modelUri: tm.uri,
          modelVersion: tm.getVersionId()
        };
        setTimeout(() => {
          this._structuredLogger.log(data);
        }, 0);
      }));
    }));
  }
};

TextModelChangeRecorder = __decorateClass([
  __decorateParam(1, IInstantiationService),
  __decorateParam(2, ILoggerService)
], TextModelChangeRecorder);
export { TextModelChangeRecorder };
