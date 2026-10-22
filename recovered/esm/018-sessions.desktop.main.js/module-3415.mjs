// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/editTelemetry/browser/telemetry/arcTelemetryReporter.ts
import { Disposable } from "./module-0012.mjs";
import { ArcTracker } from "./module-3414.mjs";
import { runOnChange } from "./module-0064.mjs";
import { BaseStringEdit } from "./module-0193.mjs";
import { TimeoutTimer } from "./module-0036.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ITelemetryService } from "./module-0093.mjs";


// src/vs/workbench/contrib/editTelemetry/browser/telemetry/arcTelemetryReporter.ts
var ArcTelemetryReporter = class extends Disposable {
  constructor(_timesMs, _documentValueBeforeTrackedEdit, _document, _gitRepo, _trackedEdit, _sendTelemetryEvent, _dispose, _telemetryService) {
    super();
    this._timesMs = _timesMs;
    this._documentValueBeforeTrackedEdit = _documentValueBeforeTrackedEdit;
    this._document = _document;
    this._gitRepo = _gitRepo;
    this._trackedEdit = _trackedEdit;
    this._sendTelemetryEvent = _sendTelemetryEvent;
    this._dispose = _dispose;
    this._telemetryService = _telemetryService;
    this._arcTracker = new ArcTracker(this._documentValueBeforeTrackedEdit, this._trackedEdit);
    this._store.add(runOnChange(this._document.value, (_val, _prevVal, changes) => {
      const edit3 = BaseStringEdit.composeOrUndefined(changes.map((c) => c.edit));
      if (edit3) {
        this._arcTracker.handleEdits(edit3);
      }
    }));
    this._initialLineCounts = this._arcTracker.getLineCountInfo();
    this._initialBranchName = this._gitRepo.get()?.headBranchNameObs.get();
    for (let i2 = 0; i2 < this._timesMs.length; i2++) {
      const timeMs = this._timesMs[i2];
      if (timeMs <= 0) {
        this._report(timeMs);
      } else {
        this._reportAfter(timeMs, i2 === this._timesMs.length - 1 ? () => {
          this._dispose();
        } : void 0);
      }
    }
  }
  _reportAfter(timeoutMs, cb) {
    const timer = new TimeoutTimer(() => {
      this._report(timeoutMs);
      timer.dispose();
      if (cb) {
        cb();
      }
    }, timeoutMs);
    this._store.add(timer);
  }
  _report(timeMs) {
    const currentBranch = this._gitRepo.get()?.headBranchNameObs.get();
    const didBranchChange = currentBranch !== this._initialBranchName;
    const currentLineCounts = this._arcTracker.getLineCountInfo();
    this._sendTelemetryEvent({
      telemetryService: this._telemetryService,
      timeDelayMs: timeMs,
      didBranchChange,
      arc: this._arcTracker.getAcceptedRestrainedCharactersCount(),
      originalCharCount: this._arcTracker.getOriginalCharacterCount(),
      currentLineCount: currentLineCounts.insertedLineCounts,
      currentDeletedLineCount: currentLineCounts.deletedLineCounts,
      originalLineCount: this._initialLineCounts.insertedLineCounts,
      originalDeletedLineCount: this._initialLineCounts.deletedLineCounts
    });
  }
};

ArcTelemetryReporter = __decorateClass([
  __decorateParam(7, ITelemetryService)
], ArcTelemetryReporter);
export { ArcTelemetryReporter };
