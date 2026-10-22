// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/common/widget/chatWidgetHistoryService.ts
import { createDecorator } from "./module-0077.mjs";
import { Disposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { Memento } from "./module-1041.mjs";
import { ChatModeKind } from "./module-0964.mjs";
import { CHAT_PROVIDER_ID } from "./module-0970.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IStorageService } from "./module-0512.mjs";
import { equals } from "./module-0007.mjs";


// src/vs/workbench/contrib/chat/common/widget/chatWidgetHistoryService.ts
var IChatWidgetHistoryService = createDecorator("IChatWidgetHistoryService");

var ChatInputHistoryMaxEntries = 40;

var ChatWidgetHistoryService = class extends Disposable {
  constructor(storageService) {
    super();
    this._onDidChangeHistory = this._register(new Emitter());
    this.changed = false;
    this.onDidChangeHistory = this._onDidChangeHistory.event;
    this.memento = new Memento("interactive-session", storageService);
    const loadedState = this.memento.getMemento(1 /* WORKSPACE */, 1 /* MACHINE */);
    this.viewState = loadedState;
    this._register(storageService.onWillSaveState(() => {
      if (this.changed) {
        this.memento.saveMemento();
        this.changed = false;
      }
    }));
  }
  getHistory(location2, historyKey) {
    const key3 = this.getKey(location2, historyKey);
    const history = this.viewState.history?.[key3] ?? [];
    return history.map((entry) => this.migrateHistoryEntry(entry));
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  migrateHistoryEntry(entry) {
    if (entry.inputText !== void 0) {
      return entry;
    }
    const oldEntry = entry;
    const oldState = oldEntry.state ?? {};
    let modeId;
    let modeKind;
    if (oldState.chatMode) {
      if (typeof oldState.chatMode === "string") {
        modeId = oldState.chatMode;
        modeKind = Object.values(ChatModeKind).includes(oldState.chatMode) ? oldState.chatMode : void 0;
      } else if (typeof oldState.chatMode === "object" && oldState.chatMode !== null) {
        const oldMode = oldState.chatMode;
        modeId = oldMode.id ?? "ask" /* Ask */;
        modeKind = oldMode.id && Object.values(ChatModeKind).includes(oldMode.id) ? oldMode.id : void 0;
      } else {
        modeId = "ask" /* Ask */;
        modeKind = "ask" /* Ask */;
      }
    } else {
      modeId = "ask" /* Ask */;
      modeKind = "ask" /* Ask */;
    }
    return {
      inputText: oldEntry.text ?? "",
      attachments: oldState.chatContextAttachments ?? [],
      mode: {
        id: modeId,
        kind: modeKind
      },
      contrib: oldEntry.state || {},
      selectedModel: void 0,
      selections: []
    };
  }
  getKey(location2, historyKey) {
    const locationKey = location2 === "panel" /* Chat */ ? CHAT_PROVIDER_ID : location2;
    return historyKey === void 0 ? locationKey : `${locationKey}:${historyKey}`;
  }
  append(location2, history, historyKey) {
    this.viewState.history ??= {};
    const key3 = this.getKey(location2, historyKey);
    this.viewState.history[key3] = this.getHistory(location2, historyKey).concat(history).slice(-ChatInputHistoryMaxEntries);
    this.changed = true;
    this._onDidChangeHistory.fire({ kind: "append", location: location2, historyKey, entry: history });
  }
  moveHistory(location2, fromHistoryKey, toHistoryKey) {
    if (fromHistoryKey === toHistoryKey) {
      return;
    }
    const fromHistory = this.getHistory(location2, fromHistoryKey);
    if (fromHistory.length === 0) {
      return;
    }
    this.viewState.history ??= {};
    const fromKey = this.getKey(location2, fromHistoryKey);
    const toKey2 = this.getKey(location2, toHistoryKey);
    this.viewState.history[toKey2] = this.getHistory(location2, toHistoryKey).concat(fromHistory).slice(-ChatInputHistoryMaxEntries);
    delete this.viewState.history[fromKey];
    this.changed = true;
    this._onDidChangeHistory.fire({ kind: "move", location: location2, fromHistoryKey, toHistoryKey });
  }
  clearHistory() {
    this.viewState.history = {};
    this.changed = true;
    this._onDidChangeHistory.fire({ kind: "clear" });
  }
};

ChatWidgetHistoryService = __decorateClass([
  __decorateParam(0, IStorageService)
], ChatWidgetHistoryService);

var ChatHistoryNavigator = class extends Disposable {
  constructor(location2, chatWidgetHistoryService) {
    super();
    this.location = location2;
    this.chatWidgetHistoryService = chatWidgetHistoryService;
    this._overlay = [];
    this._history = this.chatWidgetHistoryService.getHistory(this.location, this._historyKey);
    this._currentIndex = this._history.length;
    this._register(this.chatWidgetHistoryService.onDidChangeHistory((e) => {
      if (e.kind === "append") {
        if (e.location !== this.location || e.historyKey !== this._historyKey) {
          return;
        }
        const prevLength = this._history.length;
        this._history = this.chatWidgetHistoryService.getHistory(this.location, this._historyKey);
        const newLength = this._history.length;
        if (prevLength === newLength) {
          this._overlay.shift();
          if (this._currentIndex < this._history.length) {
            this._currentIndex = Math.max(this._currentIndex - 1, 0);
          }
        } else if (this._currentIndex === prevLength) {
          this._currentIndex = newLength;
        }
      } else if (e.kind === "clear") {
        this._history = [];
        this._currentIndex = 0;
        this._overlay = [];
      } else if (e.kind === "move") {
        if (e.location !== this.location || e.fromHistoryKey !== this._historyKey && e.toHistoryKey !== this._historyKey) {
          return;
        }
        this._history = this.chatWidgetHistoryService.getHistory(this.location, this._historyKey);
        this._currentIndex = this._history.length;
        this._overlay = [];
      }
    }));
  }
  get values() {
    return this.chatWidgetHistoryService.getHistory(this.location, this._historyKey);
  }
  setHistoryKey(historyKey) {
    if (this._historyKey === historyKey) {
      return;
    }
    this._historyKey = historyKey;
    this._history = this.chatWidgetHistoryService.getHistory(this.location, this._historyKey);
    this._currentIndex = this._history.length;
    this._overlay = [];
  }
  isAtEnd() {
    return this._currentIndex === Math.max(this._history.length, this._overlay.length);
  }
  isAtStart() {
    return this._currentIndex === 0;
  }
  /**
   * Replaces a history entry at the current index in this view of the history.
   * Allows editing of old history entries while preventing accidental navigation
   * from losing the edits.
   */
  overlay(entry) {
    this._overlay[this._currentIndex] = entry;
  }
  resetCursor() {
    this._currentIndex = this._history.length;
  }
  previous() {
    this._currentIndex = Math.max(this._currentIndex - 1, 0);
    return this.current();
  }
  next() {
    this._currentIndex = Math.min(this._currentIndex + 1, this._history.length);
    return this.current();
  }
  current() {
    return this._overlay[this._currentIndex] ?? this._history[this._currentIndex];
  }
  /**
   * Appends a new entry to the navigator. Resets the state back to the end
   * and clears any overlayed entries.
   */
  append(entry) {
    this._overlay = [];
    this._currentIndex = this._history.length;
    if (!entriesEqual(this._history.at(-1), entry)) {
      this.chatWidgetHistoryService.append(this.location, entry, this._historyKey);
    }
  }
};

ChatHistoryNavigator = __decorateClass([
  __decorateParam(1, IChatWidgetHistoryService)
], ChatHistoryNavigator);

function entriesEqual(a, b) {
  if (!a || !b) {
    return false;
  }
  if (a.inputText !== b.inputText) {
    return false;
  }
  if (!equals(a.attachments, b.attachments, (x, y) => x.id === y.id)) {
    return false;
  }
  return true;
}
export { entriesEqual, IChatWidgetHistoryService, ChatInputHistoryMaxEntries, ChatWidgetHistoryService, ChatHistoryNavigator };
