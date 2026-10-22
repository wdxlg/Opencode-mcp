// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/editTelemetry/browser/editStats/aiStatsFeature.ts
import { Disposable, toDisposable } from "./module-0012.mjs";
import { observableValue } from "./module-0048.mjs";
import { derived } from "./module-0054.mjs";
import { sumBy } from "./module-0007.mjs";
import { autorun } from "./module-0052.mjs";
import { AiStatsStatusBar } from "./module-3430.mjs";
import { mapObservableArrayCached } from "./module-0059.mjs";
import { runOnChange } from "./module-0064.mjs";
import { AnnotatedStringEdit } from "./module-0193.mjs";
import { Lazy } from "./module-0028.mjs";
import { isAiEdit, isUserEdit } from "./module-0377.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IStorageService } from "./module-0512.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { TaskQueue, timeout } from "./module-0036.mjs";


// src/vs/workbench/contrib/editTelemetry/browser/editStats/aiStatsFeature.ts
var AiStatsFeature = class extends Disposable {
  constructor(annotatedDocuments, _storageService, _instantiationService) {
    super();
    this._storageService = _storageService;
    this._instantiationService = _instantiationService;
    this._dataVersion = observableValue(this, 0);
    this.aiRate = this._dataVersion.map(() => {
      const val = this._data.getValue();
      if (!val) {
        return 0;
      }
      const r2 = average(val.sessions, (session) => {
        const sum2 = session.typedCharacters + session.aiCharacters;
        if (sum2 === 0) {
          return 0;
        }
        return session.aiCharacters / sum2;
      });
      return r2;
    });
    this.sessionCount = derived(this, (r2) => {
      this._dataVersion.read(r2);
      const val = this._data.getValue();
      if (!val) {
        return 0;
      }
      return val.sessions.length;
    });
    this.sessions = derived(this, (r2) => {
      this._dataVersion.read(r2);
      const val = this._data.getValue();
      if (!val) {
        return [];
      }
      return val.sessions;
    });
    this.acceptedInlineSuggestionsToday = derived(this, (r2) => {
      this._dataVersion.read(r2);
      const val = this._data.getValue();
      if (!val) {
        return 0;
      }
      const startOfToday = /* @__PURE__ */ new Date();
      startOfToday.setHours(0, 0, 0, 0);
      const sessionsToday = val.sessions.filter((s) => s.startTime > startOfToday.getTime());
      return sumBy(sessionsToday, (s) => s.acceptedInlineSuggestions ?? 0);
    });
    const storedValue = getStoredValue(this._storageService, "aiStats", 1 /* WORKSPACE */, 0 /* USER */);
    this._data = rateLimitWrite(storedValue, 1 / 60, this._store);
    this.aiRate.recomputeInitiallyAndOnChange(this._store);
    this._register(autorun((reader) => {
      reader.store.add(this._instantiationService.createInstance(AiStatsStatusBar.hot.read(reader), this));
    }));
    const lastRequestIds = [];
    const obs = mapObservableArrayCached(this, annotatedDocuments.documents, (doc, store) => {
      store.add(runOnChange(doc.documentWithAnnotations.value, (_val, _prev, edit3) => {
        const e4 = AnnotatedStringEdit.compose(edit3.map((e5) => e5.edit));
        const curSession = new Lazy(() => this._getDataAndSession());
        for (const r2 of e4.replacements) {
          if (isAiEdit(r2.data.editSource)) {
            curSession.value.currentSession.aiCharacters += r2.newText.length;
          } else if (isUserEdit(r2.data.editSource)) {
            curSession.value.currentSession.typedCharacters += r2.newText.length;
          }
        }
        if (e4.replacements.length > 0) {
          const sessionToUpdate = curSession.value.currentSession;
          const s = e4.replacements[0].data.editSource;
          if (s.metadata.source === "inlineCompletionAccept") {
            if (sessionToUpdate.acceptedInlineSuggestions === void 0) {
              sessionToUpdate.acceptedInlineSuggestions = 0;
            }
            sessionToUpdate.acceptedInlineSuggestions += 1;
          }
          if (s.metadata.source === "Chat.applyEdits" && s.metadata.$$requestId !== void 0) {
            const didSeeRequestId = lastRequestIds.includes(s.metadata.$$requestId);
            if (!didSeeRequestId) {
              lastRequestIds.push(s.metadata.$$requestId);
              if (lastRequestIds.length > 10) {
                lastRequestIds.shift();
              }
              if (sessionToUpdate.chatEditCount === void 0) {
                sessionToUpdate.chatEditCount = 0;
              }
              sessionToUpdate.chatEditCount += 1;
            }
          }
        }
        if (curSession.hasValue) {
          this._data.writeValue(curSession.value.data);
          this._dataVersion.set(this._dataVersion.get() + 1, void 0);
        }
      }));
    });
    obs.recomputeInitiallyAndOnChange(this._store);
  }
  _getDataAndSession() {
    const state = this._data.getValue() ?? { sessions: [] };
    const sessionLengthMs = 5 * 60 * 1e3;
    let lastSession = state.sessions.at(-1);
    const nowTime = Date.now();
    if (!lastSession || nowTime - lastSession.startTime > sessionLengthMs) {
      state.sessions.push({
        startTime: nowTime,
        typedCharacters: 0,
        aiCharacters: 0,
        acceptedInlineSuggestions: 0,
        chatEditCount: 0
      });
      lastSession = state.sessions.at(-1);
      const dayMs = 24 * 60 * 60 * 1e3;
      while (state.sessions.length > dayMs / sessionLengthMs) {
        state.sessions.shift();
      }
    }
    return { data: state, currentSession: lastSession };
  }
};

AiStatsFeature = __decorateClass([
  __decorateParam(1, IStorageService),
  __decorateParam(2, IInstantiationService)
], AiStatsFeature);

function average(arr, selector) {
  if (arr.length === 0) {
    return 0;
  }
  const s = sumBy(arr, selector);
  return s / arr.length;
}

function rateLimitWrite(targetValue, maxWritesPerSecond, store) {
  const queue = new TaskQueue();
  let _value = void 0;
  let valueVersion = 0;
  let savedVersion = 0;
  store.add(toDisposable(() => {
    if (valueVersion !== savedVersion) {
      targetValue.writeValue(_value);
      savedVersion = valueVersion;
    }
  }));
  return {
    writeValue(value2) {
      valueVersion++;
      const v2 = valueVersion;
      _value = value2;
      queue.clearPending();
      queue.schedule(async () => {
        targetValue.writeValue(value2);
        savedVersion = v2;
        await timeout(5e3);
      });
    },
    getValue() {
      if (valueVersion > 0) {
        return _value;
      }
      return targetValue.getValue();
    }
  };
}

function getStoredValue(service, key3, scope, target) {
  let lastValue = void 0;
  let hasLastValue = false;
  return {
    writeValue(value2) {
      if (value2 === void 0) {
        service.remove(key3, scope);
      } else {
        service.store(key3, JSON.stringify(value2), scope, target);
      }
      lastValue = value2;
    },
    getValue() {
      if (hasLastValue) {
        return lastValue;
      }
      const strVal = service.get(key3, scope);
      lastValue = strVal === void 0 ? void 0 : JSON.parse(strVal);
      hasLastValue = true;
      return lastValue;
    }
  };
}
export { average, rateLimitWrite, getStoredValue, AiStatsFeature };
