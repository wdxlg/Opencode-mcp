// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/sessions/browser/sessionsTypedCharactersTracker.ts
import { Disposable, DisposableMap, toDisposable } from "./module-0012.mjs";
import { RunOnceScheduler } from "./module-0036.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IModelService } from "./module-0080.mjs";
import { isUserEdit } from "./module-0377.mjs";


// src/vs/sessions/contrib/sessions/browser/sessionsTypedCharactersTracker.ts
var TYPED_CHARACTERS_REPORT_DELAY = 5e3;

var MAX_TYPED_CHARACTERS_RETRIES = 3;

var SessionsTypedCharactersTracker = class extends Disposable {
  /**
   * @param _report Consumes a batch and returns the entries it could not
   * attribute yet, which are retried instead of being dropped.
   */
  constructor(_getActiveSession, _report, modelService) {
    super();
    this._getActiveSession = _getActiveSession;
    this._report = _report;
    this._pending = /* @__PURE__ */ new Map();
    this._modelListeners = this._register(new DisposableMap());
    this._register(toDisposable(() => this.flush()));
    this._reportScheduler = this._register(new RunOnceScheduler(() => this.flush(), TYPED_CHARACTERS_REPORT_DELAY));
    for (const model of modelService.getModels()) {
      this._trackModel(model);
    }
    this._register(modelService.onModelAdded((model) => this._trackModel(model)));
    this._register(modelService.onModelRemoved((model) => this._modelListeners.deleteAndDispose(model)));
  }
  /** Reports everything buffered so far, retaining whatever the consumer could not attribute yet. */
  flush() {
    if (this._pending.size === 0) {
      return;
    }
    const flushed = new Map(this._pending);
    this._pending.clear();
    for (const entry of this._report([...flushed.values()])) {
      const key3 = toKey2(entry.session.sessionId, entry.resource);
      const deferred = flushed.get(key3);
      if (!deferred || deferred.retries >= MAX_TYPED_CHARACTERS_RETRIES) {
        continue;
      }
      deferred.retries++;
      this._add(key3, deferred);
    }
    if (this._pending.size > 0) {
      this._reportScheduler.schedule();
    }
  }
  _trackModel(model) {
    this._modelListeners.set(model, model.onDidChangeContent((e4) => this._handleContentChange(model, e4)));
  }
  _handleContentChange(model, e4) {
    const characters = countTypedCharacters(e4);
    if (characters === 0) {
      return;
    }
    const session = this._getActiveSession();
    if (!session) {
      return;
    }
    this._add(toKey2(session.sessionId, model.uri), { session, resource: model.uri, characters, retries: 0 });
    if (!this._reportScheduler.isScheduled()) {
      this._reportScheduler.schedule();
    }
  }
  _add(key3, entry) {
    const existing = this._pending.get(key3);
    if (existing) {
      existing.characters += entry.characters;
    } else {
      this._pending.set(key3, entry);
    }
  }
};

SessionsTypedCharactersTracker = __decorateClass([
  __decorateParam(2, IModelService)
], SessionsTypedCharactersTracker);

function toKey2(sessionId, resource) {
  return `${sessionId}\0${resource.toString()}`;
}

function countTypedCharacters(e4) {
  if (e4.isUndoing || e4.isRedoing) {
    return 0;
  }
  let characters = 0;
  let changeIndex = 0;
  for (let i2 = 0; i2 < e4.detailedReasons.length; i2++) {
    const changeEnd = Math.min(changeIndex + e4.detailedReasonsChangeLengths[i2], e4.changes.length);
    if (isUserEdit(e4.detailedReasons[i2])) {
      for (let j = changeIndex; j < changeEnd; j++) {
        characters += e4.changes[j].text.length;
      }
    }
    changeIndex = changeEnd;
  }
  return characters;
}
export { toKey2, countTypedCharacters, TYPED_CHARACTERS_REPORT_DELAY, MAX_TYPED_CHARACTERS_RETRIES, SessionsTypedCharactersTracker };
