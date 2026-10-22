// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/browser/config/editorConfiguration.ts
import { Disposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { ComputeOptionsMemory, ConfigurationChangedEvent, editorOptionsRegistry } from "./module-0105.mjs";
import { ElementSizeObserver } from "./module-0214.mjs";
import { getWindow, getWindowById } from "./module-0075.mjs";
import { EditorZoom } from "./module-0100.mjs";
import { TabFocus } from "./module-0219.mjs";
import { FontMeasurements } from "./module-0217.mjs";
import { PixelRatio } from "./module-0215.mjs";
import { InputMode } from "./module-0112.mjs";
import { createBareFontInfoFromValidatedSettings } from "./module-0220.mjs";
import { isFirefox2, isSafari2, isWebKit, isWebkitWebView } from "./module-0018.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IAccessibilityService } from "./module-0104.mjs";
import { isMacintosh } from "./module-0014.mjs";
import { equals } from "./module-0007.mjs";
import { deepClone } from "./module-0098.mjs";
import { migrateOptions } from "./module-0218.mjs";


// src/vs/editor/browser/config/editorConfiguration.ts
var EditorConfiguration = class extends Disposable {
  constructor(isSimpleWidget, contextMenuId, options3, container2, _accessibilityService) {
    super();
    this._accessibilityService = _accessibilityService;
    this._onDidChange = this._register(new Emitter());
    this.onDidChange = this._onDidChange.event;
    this._onDidChangeFast = this._register(new Emitter());
    this.onDidChangeFast = this._onDidChangeFast.event;
    this._isDominatedByLongLines = false;
    this._viewLineCount = 1;
    this._lineNumbersDigitCount = 1;
    this._reservedHeight = 0;
    this._glyphMarginDecorationLaneCount = 1;
    this._computeOptionsMemory = new ComputeOptionsMemory();
    this.isSimpleWidget = isSimpleWidget;
    this.contextMenuId = contextMenuId;
    this._containerObserver = this._register(new ElementSizeObserver(container2, options3.dimension));
    this._targetWindowId = getWindow(container2).vscodeWindowId;
    this._rawOptions = deepCloneAndMigrateOptions(options3);
    this._validatedOptions = EditorOptionsUtil.validateOptions(this._rawOptions);
    this.options = this._computeOptions();
    if (this.options.get(19 /* automaticLayout */)) {
      this._containerObserver.startObserving();
    }
    this._register(EditorZoom.onDidChangeZoomLevel(() => this._recomputeOptions()));
    this._register(TabFocus.onDidChangeTabFocus(() => this._recomputeOptions()));
    this._register(this._containerObserver.onDidChange(() => this._recomputeOptions()));
    this._register(FontMeasurements.onDidChange(() => this._recomputeOptions()));
    this._register(PixelRatio.getInstance(getWindow(container2)).onDidChange(() => this._recomputeOptions()));
    this._register(this._accessibilityService.onDidChangeScreenReaderOptimized(() => this._recomputeOptions()));
    this._register(InputMode.onDidChangeInputMode(() => this._recomputeOptions()));
  }
  _recomputeOptions() {
    const newOptions = this._computeOptions();
    const changeEvent = EditorOptionsUtil.checkEquals(this.options, newOptions);
    if (changeEvent === null) {
      return;
    }
    this.options = newOptions;
    this._onDidChangeFast.fire(changeEvent);
    this._onDidChange.fire(changeEvent);
  }
  _computeOptions() {
    const partialEnv = this._readEnvConfiguration();
    const bareFontInfo = createBareFontInfoFromValidatedSettings(this._validatedOptions, partialEnv.pixelRatio, this.isSimpleWidget);
    const fontInfo = this._readFontInfo(bareFontInfo);
    const env2 = {
      memory: this._computeOptionsMemory,
      outerWidth: partialEnv.outerWidth,
      outerHeight: partialEnv.outerHeight - this._reservedHeight,
      fontInfo,
      extraEditorClassName: partialEnv.extraEditorClassName,
      isDominatedByLongLines: this._isDominatedByLongLines,
      viewLineCount: this._viewLineCount,
      lineNumbersDigitCount: this._lineNumbersDigitCount,
      emptySelectionClipboard: partialEnv.emptySelectionClipboard,
      pixelRatio: partialEnv.pixelRatio,
      tabFocusMode: this._validatedOptions.get(164 /* tabFocusMode */) || TabFocus.getTabFocusMode(),
      inputMode: InputMode.getInputMode(),
      accessibilitySupport: partialEnv.accessibilitySupport,
      glyphMarginDecorationLaneCount: this._glyphMarginDecorationLaneCount,
      editContextSupported: partialEnv.editContextSupported
    };
    return EditorOptionsUtil.computeOptions(this._validatedOptions, env2);
  }
  _readEnvConfiguration() {
    return {
      extraEditorClassName: getExtraEditorClassName(),
      outerWidth: this._containerObserver.getWidth(),
      outerHeight: this._containerObserver.getHeight(),
      emptySelectionClipboard: isWebKit || isFirefox2,
      pixelRatio: PixelRatio.getInstance(getWindowById(this._targetWindowId, true).window).value,
      // eslint-disable-next-line local/code-no-any-casts, @typescript-eslint/no-explicit-any
      editContextSupported: typeof globalThis.EditContext === "function",
      accessibilitySupport: this._accessibilityService.isScreenReaderOptimized() ? 2 /* Enabled */ : this._accessibilityService.getAccessibilitySupport()
    };
  }
  _readFontInfo(bareFontInfo) {
    return FontMeasurements.readFontInfo(getWindowById(this._targetWindowId, true).window, bareFontInfo);
  }
  getRawOptions() {
    return this._rawOptions;
  }
  updateOptions(_newOptions) {
    const newOptions = deepCloneAndMigrateOptions(_newOptions);
    const didChange = EditorOptionsUtil.applyUpdate(this._rawOptions, newOptions);
    if (!didChange) {
      return;
    }
    this._validatedOptions = EditorOptionsUtil.validateOptions(this._rawOptions);
    this._recomputeOptions();
  }
  observeContainer(dimension) {
    this._containerObserver.observe(dimension);
  }
  setIsDominatedByLongLines(isDominatedByLongLines) {
    if (this._isDominatedByLongLines === isDominatedByLongLines) {
      return;
    }
    this._isDominatedByLongLines = isDominatedByLongLines;
    this._recomputeOptions();
  }
  setModelLineCount(modelLineCount) {
    const lineNumbersDigitCount = digitCount(modelLineCount);
    if (this._lineNumbersDigitCount === lineNumbersDigitCount) {
      return;
    }
    this._lineNumbersDigitCount = lineNumbersDigitCount;
    this._recomputeOptions();
  }
  setViewLineCount(viewLineCount) {
    if (this._viewLineCount === viewLineCount) {
      return;
    }
    this._viewLineCount = viewLineCount;
    this._recomputeOptions();
  }
  setReservedHeight(reservedHeight) {
    if (this._reservedHeight === reservedHeight) {
      return;
    }
    this._reservedHeight = reservedHeight;
    this._recomputeOptions();
  }
  setGlyphMarginDecorationLaneCount(decorationLaneCount) {
    if (this._glyphMarginDecorationLaneCount === decorationLaneCount) {
      return;
    }
    this._glyphMarginDecorationLaneCount = decorationLaneCount;
    this._recomputeOptions();
  }
};

EditorConfiguration = __decorateClass([
  __decorateParam(4, IAccessibilityService)
], EditorConfiguration);

function digitCount(n2) {
  let r2 = 0;
  while (n2) {
    n2 = Math.floor(n2 / 10);
    r2++;
  }
  return r2 ? r2 : 1;
}

function getExtraEditorClassName() {
  let extra = "";
  if (isSafari2 || isWebkitWebView) {
    extra += "no-minimap-shadow ";
    extra += "enable-user-select ";
  } else {
    extra += "no-user-select ";
  }
  if (isMacintosh) {
    extra += "mac ";
  }
  return extra;
}

var ValidatedEditorOptions = class {
  constructor() {
    this._values = [];
  }
  _read(option2) {
    return this._values[option2];
  }
  get(id2) {
    return this._values[id2];
  }
  _write(option2, value2) {
    this._values[option2] = value2;
  }
};

var ComputedEditorOptions = class {
  constructor() {
    this._values = [];
  }
  _read(id2) {
    if (id2 >= this._values.length) {
      throw new Error("Cannot read uninitialized value");
    }
    return this._values[id2];
  }
  get(id2) {
    return this._read(id2);
  }
  _write(id2, value2) {
    this._values[id2] = value2;
  }
};

var EditorOptionsUtil = class _EditorOptionsUtil {
  static validateOptions(options3) {
    const result = new ValidatedEditorOptions();
    for (const editorOption of editorOptionsRegistry) {
      const value2 = editorOption.name === "_never_" ? void 0 : options3[editorOption.name];
      result._write(editorOption.id, editorOption.validate(value2));
    }
    return result;
  }
  static computeOptions(options3, env2) {
    const result = new ComputedEditorOptions();
    for (const editorOption of editorOptionsRegistry) {
      result._write(editorOption.id, editorOption.compute(env2, result, options3._read(editorOption.id)));
    }
    return result;
  }
  static _deepEquals(a, b) {
    if (typeof a !== "object" || typeof b !== "object" || !a || !b) {
      return a === b;
    }
    if (Array.isArray(a) || Array.isArray(b)) {
      return Array.isArray(a) && Array.isArray(b) ? equals(a, b) : false;
    }
    if (Object.keys(a).length !== Object.keys(b).length) {
      return false;
    }
    for (const key3 in a) {
      if (!_EditorOptionsUtil._deepEquals(a[key3], b[key3])) {
        return false;
      }
    }
    return true;
  }
  static checkEquals(a, b) {
    const result = [];
    let somethingChanged = false;
    for (const editorOption of editorOptionsRegistry) {
      const changed = !_EditorOptionsUtil._deepEquals(a._read(editorOption.id), b._read(editorOption.id));
      result[editorOption.id] = changed;
      if (changed) {
        somethingChanged = true;
      }
    }
    return somethingChanged ? new ConfigurationChangedEvent(result) : null;
  }
  /**
   * Returns true if something changed.
   * Modifies `options`.
  */
  static applyUpdate(options3, update) {
    let changed = false;
    for (const editorOption of editorOptionsRegistry) {
      if (update.hasOwnProperty(editorOption.name)) {
        const result = editorOption.applyUpdate(options3[editorOption.name], update[editorOption.name]);
        options3[editorOption.name] = result.newValue;
        changed = changed || result.didChange;
      }
    }
    return changed;
  }
};

function deepCloneAndMigrateOptions(_options) {
  const options3 = deepClone(_options);
  migrateOptions(options3);
  return options3;
}
export { digitCount, getExtraEditorClassName, deepCloneAndMigrateOptions, EditorConfiguration, ValidatedEditorOptions, ComputedEditorOptions, EditorOptionsUtil };
