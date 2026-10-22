// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/editTelemetry/browser/telemetry/editTracker.ts
import { Disposable, DisposableStore } from "./module-0012.mjs";
import { AnnotatedStringEdit } from "./module-0193.mjs";
import { observableSignal } from "./module-0058.mjs";
import { runOnChange } from "./module-0064.mjs";
import { EditKeySourceData, EditSourceBase } from "./module-3410.mjs";


// src/vs/workbench/contrib/editTelemetry/browser/telemetry/editTracker.ts
var EXTERNAL_OBSERVATION_KEY_PREFIX = "external-observation:";

var DocumentEditSourceTracker = class extends Disposable {
  constructor(_doc, data, _externalEditCorrelation, _externalEditCorrelationPolicy = "suppress") {
    super();
    this._doc = _doc;
    this.data = data;
    this._externalEditCorrelation = _externalEditCorrelation;
    this._externalEditCorrelationPolicy = _externalEditCorrelationPolicy;
    this._edits = AnnotatedStringEdit.empty;
    this._pendingExternalEdits = AnnotatedStringEdit.empty;
    this._update = observableSignal(this);
    this._documentStore = this._register(new DisposableStore());
    this._representativePerKey = /* @__PURE__ */ new Map();
    this._sumAddedCharactersPerKey = /* @__PURE__ */ new Map();
    this._externalObservationIds = /* @__PURE__ */ new Set();
    this._ignoredInitialExternalObservationIds = /* @__PURE__ */ new Set();
    this._suppressedExternalObservationIds = /* @__PURE__ */ new Set();
    this._invalidatedExternalObservationIds = /* @__PURE__ */ new Set();
    this._reattributedExternalObservations = /* @__PURE__ */ new Map();
    this._documentStore.add(runOnChange(this._doc.value, (_val, _prevVal, edits) => {
      let eComposed = AnnotatedStringEdit.compose(edits.map((e4) => e4.edit));
      if (eComposed.replacements.every((e4) => e4.data.source.category === "external")) {
        if (this._edits.isEmpty() && !this._externalEditCorrelation) {
        } else {
          if (this._externalEditCorrelation) {
            const observationId = this._externalEditCorrelation.register(_prevVal.value, _val.value);
            this._externalObservationIds.add(observationId);
            if (this._edits.isEmpty()) {
              this._ignoredInitialExternalObservationIds.add(observationId);
            }
            const resolution = this._externalEditCorrelation.getResolution?.(observationId);
            if (resolution) {
              this._resolveExternalObservation(resolution);
            } else if (this._externalEditCorrelationPolicy === "suppress" && this._externalEditCorrelation.isSuppressed(observationId)) {
              this._suppressedExternalObservationIds.add(observationId);
            }
            const key3 = `${EXTERNAL_OBSERVATION_KEY_PREFIX}${observationId}`;
            eComposed = eComposed.mapData((replacement) => new EditKeySourceData(key3, replacement.data.source, replacement.data.representative));
          }
          this._pendingExternalEdits = this._pendingExternalEdits.compose(eComposed);
        }
      } else {
        if (!this._pendingExternalEdits.isEmpty()) {
          this._applyEdit(this._pendingExternalEdits);
          this._pendingExternalEdits = AnnotatedStringEdit.empty;
        }
        this._applyEdit(eComposed);
      }
      this._update.trigger(void 0);
    }));
    if (this._externalEditCorrelation) {
      if (this._externalEditCorrelation.onDidResolve) {
        this._register(this._externalEditCorrelation.onDidResolve((resolution) => this._resolveExternalObservation(resolution)));
      } else {
        this._register(this._externalEditCorrelation.onDidSuppress((observationId) => {
          if (this._externalObservationIds.has(observationId) && this._externalEditCorrelationPolicy === "suppress") {
            this._suppressedExternalObservationIds.add(observationId);
            this._update.trigger(void 0);
          }
        }));
      }
      this._register(this._externalEditCorrelation.onDidInvalidate((observationId) => {
        if (this._externalObservationIds.has(observationId)) {
          this._suppressedExternalObservationIds.delete(observationId);
          this._reattributedExternalObservations.delete(observationId);
          this._invalidatedExternalObservationIds.add(observationId);
          this._update.trigger(void 0);
        }
      }));
    }
  }
  releaseExternalEditCorrelations() {
    for (const observationId of this._externalObservationIds) {
      this._externalEditCorrelation?.release(observationId);
    }
    this._externalObservationIds.clear();
  }
  stopTracking() {
    this._documentStore.clear();
  }
  async waitForExternalEditCorrelations(timeoutMs) {
    await this._externalEditCorrelation?.waitForResolution?.(Array.from(this._externalObservationIds), timeoutMs);
  }
  _applyEdit(e4) {
    for (const r2 of e4.replacements) {
      let existing = this._sumAddedCharactersPerKey.get(r2.data.key);
      if (existing === void 0) {
        existing = 0;
        this._representativePerKey.set(r2.data.key, r2.data.representative);
      }
      const newCount = existing + r2.getNewLength();
      this._sumAddedCharactersPerKey.set(r2.data.key, newCount);
    }
    this._edits = this._edits.compose(e4);
  }
  async waitForQueue() {
    await this._doc.waitForQueue();
  }
  getTotalInsertedCharactersCount(key3, includeSuppressed = false) {
    if (!this._shouldIncludeKey(key3, includeSuppressed)) {
      return 0;
    }
    const val = this._sumAddedCharactersPerKey.get(key3);
    return val ?? 0;
  }
  getAllKeys(includeSuppressed = false) {
    return Array.from(this._sumAddedCharactersPerKey.keys()).filter((key3) => this._shouldIncludeKey(key3, includeSuppressed));
  }
  getRepresentative(key3) {
    const observationId = getExternalObservationId(key3);
    if (observationId) {
      return this._reattributedExternalObservations.get(observationId) ?? this._representativePerKey.get(key3);
    }
    return this._representativePerKey.get(key3);
  }
  applyPendingExternalEdits() {
    if (this._pendingExternalEdits.isEmpty()) {
      return;
    }
    this._applyEdit(this._pendingExternalEdits);
    this._pendingExternalEdits = AnnotatedStringEdit.empty;
    this._update.trigger(void 0);
  }
  getTrackedRanges(reader, includeSuppressed = false) {
    this._update.read(reader);
    const ranges = this._edits.getNewRanges();
    return ranges.map((r2, idx) => {
      const e4 = this._edits.replacements[idx];
      const representative = this.getRepresentative(e4.data.key) ?? e4.data.representative;
      const source = representative === e4.data.representative ? e4.data.source : EditSourceBase.create(representative);
      const te = new TrackedEdit(e4.replaceRange, r2, e4.data.key, source, representative);
      return te;
    }).filter((edit3) => this._shouldIncludeKey(edit3.sourceKey, includeSuppressed));
  }
  isEmpty() {
    return this.getAllKeys().length === 0;
  }
  _shouldIncludeKey(key3, includeSuppressed) {
    const observationId = getExternalObservationId(key3);
    if (!observationId) {
      return true;
    }
    if (this._reattributedExternalObservations.has(observationId)) {
      return true;
    }
    if (this._invalidatedExternalObservationIds.has(observationId)) {
      return true;
    }
    const isSuppressed = this._suppressedExternalObservationIds.has(observationId);
    if (this._ignoredInitialExternalObservationIds.has(observationId)) {
      if (this._externalEditCorrelationPolicy === "reattribute") {
        return true;
      }
      return includeSuppressed && isSuppressed;
    }
    return includeSuppressed || !isSuppressed;
  }
  _resolveExternalObservation(resolution) {
    if (!this._externalObservationIds.has(resolution.id)) {
      return;
    }
    this._invalidatedExternalObservationIds.delete(resolution.id);
    if (this._externalEditCorrelationPolicy === "suppress") {
      this._suppressedExternalObservationIds.add(resolution.id);
    } else if (resolution.source) {
      this._reattributedExternalObservations.set(resolution.id, resolution.source);
    }
    this._update.trigger(void 0);
  }
  _getDebugVisualization() {
    const ranges = this.getTrackedRanges();
    const txt = this._doc.value.get().value;
    return {
      ...{ $fileExtension: "text.w" },
      "value": txt,
      "decorations": ranges.map((r2) => {
        return {
          range: [r2.range.start, r2.range.endExclusive],
          color: r2.source.getColor()
        };
      })
    };
  }
};

function getExternalObservationId(key3) {
  return key3.startsWith(EXTERNAL_OBSERVATION_KEY_PREFIX) ? key3.substring(EXTERNAL_OBSERVATION_KEY_PREFIX.length) : void 0;
}

var TrackedEdit = class {
  constructor(originalRange, range2, sourceKey, source, sourceRepresentative) {
    this.originalRange = originalRange;
    this.range = range2;
    this.sourceKey = sourceKey;
    this.source = source;
    this.sourceRepresentative = sourceRepresentative;
  }
};
export { getExternalObservationId, EXTERNAL_OBSERVATION_KEY_PREFIX, DocumentEditSourceTracker, TrackedEdit };
