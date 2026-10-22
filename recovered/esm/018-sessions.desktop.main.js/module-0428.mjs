// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/common/viewModelEventDispatcher.ts
import { Disposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";


// src/vs/editor/common/viewModelEventDispatcher.ts
var ViewModelEventDispatcher = class extends Disposable {
  constructor() {
    super();
    this._onEvent = this._register(new Emitter());
    this.onEvent = this._onEvent.event;
    this._eventHandlers = [];
    this._viewEventQueue = null;
    this._isConsumingViewEventQueue = false;
    this._collector = null;
    this._collectorCnt = 0;
    this._outgoingEvents = [];
  }
  emitOutgoingEvent(e4) {
    this._addOutgoingEvent(e4);
    this._emitOutgoingEvents();
  }
  _addOutgoingEvent(e4) {
    for (let i2 = 0, len = this._outgoingEvents.length; i2 < len; i2++) {
      const mergeResult = this._outgoingEvents[i2].kind === e4.kind ? this._outgoingEvents[i2].attemptToMerge(e4) : null;
      if (mergeResult) {
        this._outgoingEvents[i2] = mergeResult;
        return;
      }
    }
    this._outgoingEvents.push(e4);
  }
  _emitOutgoingEvents() {
    while (this._outgoingEvents.length > 0) {
      if (this._collector || this._isConsumingViewEventQueue) {
        return;
      }
      const event = this._outgoingEvents.shift();
      if (event.isNoOp()) {
        continue;
      }
      this._onEvent.fire(event);
    }
  }
  addViewEventHandler(eventHandler) {
    for (let i2 = 0, len = this._eventHandlers.length; i2 < len; i2++) {
      if (this._eventHandlers[i2] === eventHandler) {
        console.warn("Detected duplicate listener in ViewEventDispatcher", eventHandler);
      }
    }
    this._eventHandlers.push(eventHandler);
  }
  removeViewEventHandler(eventHandler) {
    for (let i2 = 0; i2 < this._eventHandlers.length; i2++) {
      if (this._eventHandlers[i2] === eventHandler) {
        this._eventHandlers.splice(i2, 1);
        break;
      }
    }
  }
  beginEmitViewEvents() {
    this._collectorCnt++;
    if (this._collectorCnt === 1) {
      this._collector = new ViewModelEventsCollector();
    }
    return this._collector;
  }
  endEmitViewEvents() {
    this._collectorCnt--;
    if (this._collectorCnt === 0) {
      const outgoingEvents = this._collector.outgoingEvents;
      const viewEvents = this._collector.viewEvents;
      this._collector = null;
      for (const outgoingEvent of outgoingEvents) {
        this._addOutgoingEvent(outgoingEvent);
      }
      if (viewEvents.length > 0) {
        this._emitMany(viewEvents);
      }
    }
    this._emitOutgoingEvents();
  }
  emitSingleViewEvent(event) {
    try {
      const eventsCollector = this.beginEmitViewEvents();
      eventsCollector.emitViewEvent(event);
    } finally {
      this.endEmitViewEvents();
    }
  }
  _emitMany(events) {
    if (this._viewEventQueue) {
      this._viewEventQueue = this._viewEventQueue.concat(events);
    } else {
      this._viewEventQueue = events;
    }
    if (!this._isConsumingViewEventQueue) {
      this._consumeViewEventQueue();
    }
  }
  _consumeViewEventQueue() {
    try {
      this._isConsumingViewEventQueue = true;
      this._doConsumeQueue();
    } finally {
      this._isConsumingViewEventQueue = false;
    }
  }
  _doConsumeQueue() {
    while (this._viewEventQueue) {
      const events = this._viewEventQueue;
      this._viewEventQueue = null;
      const eventHandlers = this._eventHandlers.slice(0);
      for (const eventHandler of eventHandlers) {
        eventHandler.handleEvents(events);
      }
    }
  }
};

var ViewModelEventsCollector = class {
  constructor() {
    this.viewEvents = [];
    this.outgoingEvents = [];
  }
  emitViewEvent(event) {
    this.viewEvents.push(event);
  }
  emitOutgoingEvent(e4) {
    this.outgoingEvents.push(e4);
  }
};

var ContentSizeChangedEvent = class _ContentSizeChangedEvent {
  constructor(oldContentWidth, oldContentHeight, contentWidth, contentHeight) {
    this.kind = 0 /* ContentSizeChanged */;
    this._oldContentWidth = oldContentWidth;
    this._oldContentHeight = oldContentHeight;
    this.contentWidth = contentWidth;
    this.contentHeight = contentHeight;
    this.contentWidthChanged = this._oldContentWidth !== this.contentWidth;
    this.contentHeightChanged = this._oldContentHeight !== this.contentHeight;
  }
  isNoOp() {
    return !this.contentWidthChanged && !this.contentHeightChanged;
  }
  attemptToMerge(other) {
    if (other.kind !== this.kind) {
      return null;
    }
    return new _ContentSizeChangedEvent(this._oldContentWidth, this._oldContentHeight, other.contentWidth, other.contentHeight);
  }
};

var FocusChangedEvent = class _FocusChangedEvent {
  constructor(oldHasFocus, hasFocus) {
    this.kind = 1 /* FocusChanged */;
    this.oldHasFocus = oldHasFocus;
    this.hasFocus = hasFocus;
  }
  isNoOp() {
    return this.oldHasFocus === this.hasFocus;
  }
  attemptToMerge(other) {
    if (other.kind !== this.kind) {
      return null;
    }
    return new _FocusChangedEvent(this.oldHasFocus, other.hasFocus);
  }
};

var WidgetFocusChangedEvent = class {
  constructor(oldHasFocus, hasFocus) {
    this.kind = 2 /* WidgetFocusChanged */;
    this.oldHasFocus = oldHasFocus;
    this.hasFocus = hasFocus;
  }
  isNoOp() {
    return this.oldHasFocus === this.hasFocus;
  }
  attemptToMerge(other) {
    if (other.kind !== this.kind) {
      return null;
    }
    return new FocusChangedEvent(this.oldHasFocus, other.hasFocus);
  }
};

var ScrollChangedEvent = class _ScrollChangedEvent {
  constructor(oldScrollWidth, oldScrollLeft, oldScrollHeight, oldScrollTop, scrollWidth, scrollLeft, scrollHeight, scrollTop) {
    this.kind = 3 /* ScrollChanged */;
    this._oldScrollWidth = oldScrollWidth;
    this._oldScrollLeft = oldScrollLeft;
    this._oldScrollHeight = oldScrollHeight;
    this._oldScrollTop = oldScrollTop;
    this.scrollWidth = scrollWidth;
    this.scrollLeft = scrollLeft;
    this.scrollHeight = scrollHeight;
    this.scrollTop = scrollTop;
    this.scrollWidthChanged = this._oldScrollWidth !== this.scrollWidth;
    this.scrollLeftChanged = this._oldScrollLeft !== this.scrollLeft;
    this.scrollHeightChanged = this._oldScrollHeight !== this.scrollHeight;
    this.scrollTopChanged = this._oldScrollTop !== this.scrollTop;
  }
  isNoOp() {
    return !this.scrollWidthChanged && !this.scrollLeftChanged && !this.scrollHeightChanged && !this.scrollTopChanged;
  }
  attemptToMerge(other) {
    if (other.kind !== this.kind) {
      return null;
    }
    return new _ScrollChangedEvent(
      this._oldScrollWidth,
      this._oldScrollLeft,
      this._oldScrollHeight,
      this._oldScrollTop,
      other.scrollWidth,
      other.scrollLeft,
      other.scrollHeight,
      other.scrollTop
    );
  }
};

var ViewZonesChangedEvent2 = class {
  constructor() {
    this.kind = 4 /* ViewZonesChanged */;
  }
  isNoOp() {
    return false;
  }
  attemptToMerge(other) {
    if (other.kind !== this.kind) {
      return null;
    }
    return this;
  }
};

var HiddenAreasChangedEvent = class {
  constructor() {
    this.kind = 5 /* HiddenAreasChanged */;
  }
  isNoOp() {
    return false;
  }
  attemptToMerge(other) {
    if (other.kind !== this.kind) {
      return null;
    }
    return this;
  }
};

var CursorStateChangedEvent = class _CursorStateChangedEvent {
  constructor(oldSelections, selections, oldModelVersionId, modelVersionId, source, reason, reachedMaxCursorCount) {
    this.kind = 7 /* CursorStateChanged */;
    this.oldSelections = oldSelections;
    this.selections = selections;
    this.oldModelVersionId = oldModelVersionId;
    this.modelVersionId = modelVersionId;
    this.source = source;
    this.reason = reason;
    this.reachedMaxCursorCount = reachedMaxCursorCount;
  }
  static _selectionsAreEqual(a, b) {
    if (!a && !b) {
      return true;
    }
    if (!a || !b) {
      return false;
    }
    const aLen = a.length;
    const bLen = b.length;
    if (aLen !== bLen) {
      return false;
    }
    for (let i2 = 0; i2 < aLen; i2++) {
      if (!a[i2].equalsSelection(b[i2])) {
        return false;
      }
    }
    return true;
  }
  isNoOp() {
    return _CursorStateChangedEvent._selectionsAreEqual(this.oldSelections, this.selections) && this.oldModelVersionId === this.modelVersionId;
  }
  attemptToMerge(other) {
    if (other.kind !== this.kind) {
      return null;
    }
    return new _CursorStateChangedEvent(
      this.oldSelections,
      other.selections,
      this.oldModelVersionId,
      other.modelVersionId,
      other.source,
      other.reason,
      this.reachedMaxCursorCount || other.reachedMaxCursorCount
    );
  }
};

var ReadOnlyEditAttemptEvent = class {
  constructor() {
    this.kind = 6 /* ReadOnlyEditAttempt */;
  }
  isNoOp() {
    return false;
  }
  attemptToMerge(other) {
    if (other.kind !== this.kind) {
      return null;
    }
    return this;
  }
};

var ModelDecorationsChangedEvent = class {
  constructor(event) {
    this.event = event;
    this.kind = 8 /* ModelDecorationsChanged */;
  }
  isNoOp() {
    return false;
  }
  attemptToMerge(other) {
    return null;
  }
};

var ModelLanguageChangedEvent = class {
  constructor(event) {
    this.event = event;
    this.kind = 9 /* ModelLanguageChanged */;
  }
  isNoOp() {
    return false;
  }
  attemptToMerge(other) {
    return null;
  }
};

var ModelLanguageConfigurationChangedEvent = class {
  constructor(event) {
    this.event = event;
    this.kind = 10 /* ModelLanguageConfigurationChanged */;
  }
  isNoOp() {
    return false;
  }
  attemptToMerge(other) {
    return null;
  }
};

var ModelContentChangedEvent = class {
  constructor(event) {
    this.event = event;
    this.kind = 11 /* ModelContentChanged */;
  }
  isNoOp() {
    return false;
  }
  attemptToMerge(other) {
    return null;
  }
};

var ModelOptionsChangedEvent = class {
  constructor(event) {
    this.event = event;
    this.kind = 12 /* ModelOptionsChanged */;
  }
  isNoOp() {
    return false;
  }
  attemptToMerge(other) {
    return null;
  }
};

var ModelTokensChangedEvent = class {
  constructor(event) {
    this.event = event;
    this.kind = 13 /* ModelTokensChanged */;
  }
  isNoOp() {
    return false;
  }
  attemptToMerge(other) {
    return null;
  }
};

var ModelLineHeightChangedEvent2 = class {
  constructor(event) {
    this.event = event;
    this.kind = 14 /* ModelLineHeightChanged */;
  }
  isNoOp() {
    return false;
  }
  attemptToMerge(other) {
    return null;
  }
};

var ModelFontChangedEvent2 = class {
  constructor(event) {
    this.event = event;
    this.kind = 15 /* ModelFontChangedEvent */;
  }
  isNoOp() {
    return false;
  }
  attemptToMerge(other) {
    return null;
  }
};
export { ViewModelEventDispatcher, ViewModelEventsCollector, ContentSizeChangedEvent, FocusChangedEvent, WidgetFocusChangedEvent, ScrollChangedEvent, ViewZonesChangedEvent2, HiddenAreasChangedEvent, CursorStateChangedEvent, ReadOnlyEditAttemptEvent, ModelDecorationsChangedEvent, ModelLanguageChangedEvent, ModelLanguageConfigurationChangedEvent, ModelContentChangedEvent, ModelOptionsChangedEvent, ModelTokensChangedEvent, ModelLineHeightChangedEvent2, ModelFontChangedEvent2 };
