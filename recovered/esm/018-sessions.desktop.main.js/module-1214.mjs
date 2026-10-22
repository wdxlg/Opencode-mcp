// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/common/languageFeatureRegistry.ts
import { Emitter } from "./module-0017.mjs";
import { toDisposable } from "./module-0012.mjs";
import { score2, selectLanguageIds } from "./module-0858.mjs";
import { shouldSynchronizeModel } from "./module-0117.mjs";


// src/vs/editor/common/languageFeatureRegistry.ts
function isExclusive(selector) {
  if (typeof selector === "string") {
    return false;
  } else if (Array.isArray(selector)) {
    return selector.every(isExclusive);
  } else {
    return !!selector.exclusive;
  }
}

var MatchCandidate = class {
  constructor(uri4, languageId, notebookUri, notebookType, recursive) {
    this.uri = uri4;
    this.languageId = languageId;
    this.notebookUri = notebookUri;
    this.notebookType = notebookType;
    this.recursive = recursive;
  }
  equals(other) {
    return this.notebookType === other.notebookType && this.languageId === other.languageId && this.uri.toString() === other.uri.toString() && this.notebookUri?.toString() === other.notebookUri?.toString() && this.recursive === other.recursive;
  }
};

var LanguageFeatureRegistry = class _LanguageFeatureRegistry {
  constructor(_notebookInfoResolver) {
    this._notebookInfoResolver = _notebookInfoResolver;
    this._clock = 0;
    this._entries = [];
    this._onDidChange = new Emitter();
  }
  get onDidChange() {
    return this._onDidChange.event;
  }
  register(selector, provider) {
    let entry = {
      selector,
      provider,
      _score: -1,
      _time: this._clock++
    };
    this._entries.push(entry);
    this._lastCandidate = void 0;
    this._onDidChange.fire(this._entries.length);
    return toDisposable(() => {
      if (entry) {
        const idx = this._entries.indexOf(entry);
        if (idx >= 0) {
          this._entries.splice(idx, 1);
          this._lastCandidate = void 0;
          this._onDidChange.fire(this._entries.length);
          entry = void 0;
        }
      }
    });
  }
  has(model) {
    return this.all(model).length > 0;
  }
  all(model) {
    if (!model) {
      return [];
    }
    this._updateScores(model, false);
    const result = [];
    for (const entry of this._entries) {
      if (entry._score > 0) {
        result.push(entry.provider);
      }
    }
    return result;
  }
  allNoModel() {
    return this._entries.map((entry) => entry.provider);
  }
  get registeredLanguageIds() {
    const result = /* @__PURE__ */ new Set();
    for (const entry of this._entries) {
      selectLanguageIds(entry.selector, result);
    }
    return result;
  }
  ordered(model, recursive = false) {
    const result = [];
    this._orderedForEach(model, recursive, (entry) => result.push(entry.provider));
    return result;
  }
  orderedGroups(model) {
    const result = [];
    let lastBucket;
    let lastBucketScore;
    this._orderedForEach(model, false, (entry) => {
      if (lastBucket && lastBucketScore === entry._score) {
        lastBucket.push(entry.provider);
      } else {
        lastBucketScore = entry._score;
        lastBucket = [entry.provider];
        result.push(lastBucket);
      }
    });
    return result;
  }
  _orderedForEach(model, recursive, callback) {
    this._updateScores(model, recursive);
    for (const entry of this._entries) {
      if (entry._score > 0) {
        callback(entry);
      }
    }
  }
  _updateScores(model, recursive) {
    const notebookInfo = this._notebookInfoResolver?.(model.uri);
    const candidate = notebookInfo ? new MatchCandidate(model.uri, model.getLanguageId(), notebookInfo.uri, notebookInfo.type, recursive) : new MatchCandidate(model.uri, model.getLanguageId(), void 0, void 0, recursive);
    if (this._lastCandidate?.equals(candidate)) {
      return;
    }
    this._lastCandidate = candidate;
    for (const entry of this._entries) {
      entry._score = score2(entry.selector, candidate.uri, candidate.languageId, shouldSynchronizeModel(model), candidate.notebookUri, candidate.notebookType);
      if (isExclusive(entry.selector) && entry._score > 0) {
        if (recursive) {
          entry._score = 0;
        } else {
          for (const entry2 of this._entries) {
            entry2._score = 0;
          }
          entry._score = 1e3;
          break;
        }
      }
    }
    this._entries.sort(_LanguageFeatureRegistry._compareByScoreAndTime);
  }
  static _compareByScoreAndTime(a, b) {
    if (a._score < b._score) {
      return 1;
    } else if (a._score > b._score) {
      return -1;
    }
    if (isBuiltinSelector(a.selector) && !isBuiltinSelector(b.selector)) {
      return 1;
    } else if (!isBuiltinSelector(a.selector) && isBuiltinSelector(b.selector)) {
      return -1;
    }
    if (a._time < b._time) {
      return 1;
    } else if (a._time > b._time) {
      return -1;
    } else {
      return 0;
    }
  }
};

function isBuiltinSelector(selector) {
  if (typeof selector === "string") {
    return false;
  }
  if (Array.isArray(selector)) {
    return selector.some(isBuiltinSelector);
  }
  return Boolean(selector.isBuiltin);
}
export { isExclusive, isBuiltinSelector, MatchCandidate, LanguageFeatureRegistry };
