// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/browser/widget/diffEditor/components/diffEditorSash.ts
import { derivedWithSetter } from "./module-0054.mjs";
import { observableValue } from "./module-0048.mjs";
import { Disposable } from "./module-0012.mjs";
import { Sash } from "./module-0496.mjs";
import { autorun } from "./module-0052.mjs";


// src/vs/editor/browser/widget/diffEditor/components/diffEditorSash.ts
var SashLayout = class {
  constructor(_options, dimensions) {
    this._options = _options;
    this.dimensions = dimensions;
    this.sashLeft = derivedWithSetter(this, (reader) => {
      const ratio = this._sashRatio.read(reader) ?? this._options.splitViewDefaultRatio.read(reader);
      return this._computeSashLeft(ratio, reader);
    }, (value2, tx) => {
      const contentWidth = this.dimensions.width.get();
      this._sashRatio.set(value2 / contentWidth, tx);
    });
    this._sashRatio = observableValue(this, void 0);
  }
  resetSash() {
    this._sashRatio.set(void 0, void 0);
  }
  /** @pure */
  _computeSashLeft(desiredRatio, reader) {
    const contentWidth = this.dimensions.width.read(reader);
    const midPoint = Math.floor(this._options.splitViewDefaultRatio.read(reader) * contentWidth);
    const sashLeft = this._options.enableSplitViewResizing.read(reader) ? Math.floor(desiredRatio * contentWidth) : midPoint;
    const MINIMUM_EDITOR_WIDTH = 100;
    if (contentWidth <= MINIMUM_EDITOR_WIDTH * 2) {
      return midPoint;
    }
    if (sashLeft < MINIMUM_EDITOR_WIDTH) {
      return MINIMUM_EDITOR_WIDTH;
    }
    if (sashLeft > contentWidth - MINIMUM_EDITOR_WIDTH) {
      return contentWidth - MINIMUM_EDITOR_WIDTH;
    }
    return sashLeft;
  }
};

var DiffEditorSash = class extends Disposable {
  constructor(_domNode, _dimensions, _enabled, _boundarySashes, sashLeft, _resetSash) {
    super();
    this._domNode = _domNode;
    this._dimensions = _dimensions;
    this._enabled = _enabled;
    this._boundarySashes = _boundarySashes;
    this.sashLeft = sashLeft;
    this._resetSash = _resetSash;
    this._sash = this._register(new Sash(this._domNode, {
      getVerticalSashTop: (_sash) => 0,
      getVerticalSashLeft: (_sash) => this.sashLeft.get(),
      getVerticalSashHeight: (_sash) => this._dimensions.height.get()
    }, { orientation: 0 /* VERTICAL */ }));
    this._startSashPosition = void 0;
    this._register(this._sash.onDidStart(() => {
      this._startSashPosition = this.sashLeft.get();
    }));
    this._register(this._sash.onDidChange((e4) => {
      this.sashLeft.set(this._startSashPosition + (e4.currentX - e4.startX), void 0);
    }));
    this._register(this._sash.onDidEnd(() => this._sash.layout()));
    this._register(this._sash.onDidReset(() => this._resetSash()));
    this._register(autorun((reader) => {
      const sashes = this._boundarySashes.read(reader);
      if (sashes) {
        this._sash.orthogonalEndSash = sashes.bottom;
      }
    }));
    this._register(autorun((reader) => {
      const enabled = this._enabled.read(reader);
      this._sash.state = enabled ? 3 /* Enabled */ : 0 /* Disabled */;
      this.sashLeft.read(reader);
      this._dimensions.height.read(reader);
      this._sash.layout();
    }));
  }
};
export { SashLayout, DiffEditorSash };
