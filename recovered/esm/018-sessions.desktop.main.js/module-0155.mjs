// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/common/viewEvents.ts



// src/vs/editor/common/viewEvents.ts
var ViewCompositionStartEvent = class {
  constructor() {
    this.type = 0 /* ViewCompositionStart */;
  }
};

var ViewCompositionEndEvent = class {
  constructor() {
    this.type = 1 /* ViewCompositionEnd */;
  }
};

var ViewConfigurationChangedEvent = class {
  constructor(source) {
    this.type = 2 /* ViewConfigurationChanged */;
    this._source = source;
  }
  hasChanged(id2) {
    return this._source.hasChanged(id2);
  }
};

var ViewCursorStateChangedEvent = class {
  constructor(selections, modelSelections, reason) {
    this.selections = selections;
    this.modelSelections = modelSelections;
    this.reason = reason;
    this.type = 3 /* ViewCursorStateChanged */;
  }
};

var ViewDecorationsChangedEvent = class {
  constructor(source) {
    this.type = 4 /* ViewDecorationsChanged */;
    if (source) {
      this.affectsMinimap = source.affectsMinimap;
      this.affectsOverviewRuler = source.affectsOverviewRuler;
      this.affectsGlyphMargin = source.affectsGlyphMargin;
      this.affectsLineNumber = source.affectsLineNumber;
    } else {
      this.affectsMinimap = true;
      this.affectsOverviewRuler = true;
      this.affectsGlyphMargin = true;
      this.affectsLineNumber = true;
    }
  }
};

var ViewFlushedEvent = class {
  constructor() {
    this.type = 5 /* ViewFlushed */;
  }
};

var ViewFocusChangedEvent = class {
  constructor(isFocused) {
    this.type = 6 /* ViewFocusChanged */;
    this.isFocused = isFocused;
  }
};

var ViewLanguageConfigurationEvent = class {
  constructor() {
    this.type = 7 /* ViewLanguageConfigurationChanged */;
  }
};

var ViewLineMappingChangedEvent = class {
  constructor() {
    this.type = 8 /* ViewLineMappingChanged */;
  }
};

var ViewLinesChangedEvent = class {
  constructor(fromLineNumber, count2) {
    this.fromLineNumber = fromLineNumber;
    this.count = count2;
    this.type = 9 /* ViewLinesChanged */;
  }
};

var ViewLinesDeletedEvent = class {
  constructor(fromLineNumber, toLineNumber) {
    this.type = 10 /* ViewLinesDeleted */;
    this.fromLineNumber = fromLineNumber;
    this.toLineNumber = toLineNumber;
  }
};

var ViewLinesInsertedEvent = class {
  constructor(fromLineNumber, toLineNumber) {
    this.type = 11 /* ViewLinesInserted */;
    this.fromLineNumber = fromLineNumber;
    this.toLineNumber = toLineNumber;
  }
};

var ViewRevealRangeRequestEvent = class {
  constructor(source, minimalReveal, range2, selections, verticalType, revealHorizontal, scrollType) {
    this.source = source;
    this.minimalReveal = minimalReveal;
    this.range = range2;
    this.selections = selections;
    this.verticalType = verticalType;
    this.revealHorizontal = revealHorizontal;
    this.scrollType = scrollType;
    this.type = 12 /* ViewRevealRangeRequest */;
  }
};

var ViewScrollChangedEvent = class {
  constructor(source) {
    this.type = 13 /* ViewScrollChanged */;
    this.scrollWidth = source.scrollWidth;
    this.scrollLeft = source.scrollLeft;
    this.scrollHeight = source.scrollHeight;
    this.scrollTop = source.scrollTop;
    this.scrollWidthChanged = source.scrollWidthChanged;
    this.scrollLeftChanged = source.scrollLeftChanged;
    this.scrollHeightChanged = source.scrollHeightChanged;
    this.scrollTopChanged = source.scrollTopChanged;
  }
};

var ViewThemeChangedEvent = class {
  constructor(theme) {
    this.theme = theme;
    this.type = 14 /* ViewThemeChanged */;
  }
};

var ViewTokensChangedEvent = class {
  constructor(ranges) {
    this.type = 15 /* ViewTokensChanged */;
    this.ranges = ranges;
  }
};

var ViewTokensColorsChangedEvent = class {
  constructor() {
    this.type = 16 /* ViewTokensColorsChanged */;
  }
};

var ViewZonesChangedEvent = class {
  constructor() {
    this.type = 17 /* ViewZonesChanged */;
  }
};
export { ViewCompositionStartEvent, ViewCompositionEndEvent, ViewConfigurationChangedEvent, ViewCursorStateChangedEvent, ViewDecorationsChangedEvent, ViewFlushedEvent, ViewFocusChangedEvent, ViewLanguageConfigurationEvent, ViewLineMappingChangedEvent, ViewLinesChangedEvent, ViewLinesDeletedEvent, ViewLinesInsertedEvent, ViewRevealRangeRequestEvent, ViewScrollChangedEvent, ViewThemeChangedEvent, ViewTokensChangedEvent, ViewTokensColorsChangedEvent, ViewZonesChangedEvent };
