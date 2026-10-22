// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/browser/config/fontMeasurements.ts
import { Disposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { getWindowId } from "./module-0075.mjs";
import { FontInfo, SERIALIZED_FONT_INFO_VERSION } from "./module-0101.mjs";
import { PixelRatio } from "./module-0215.mjs";
import { CharWidthRequest, readCharWidths } from "./module-0216.mjs";
import { EditorFontLigatures } from "./module-0105.mjs";


// src/vs/editor/browser/config/fontMeasurements.ts
var FontMeasurementsImpl = class extends Disposable {
  constructor() {
    super(...arguments);
    this._cache = /* @__PURE__ */ new Map();
    this._evictUntrustedReadingsTimeout = -1;
    this._onDidChange = this._register(new Emitter());
    this.onDidChange = this._onDidChange.event;
  }
  dispose() {
    if (this._evictUntrustedReadingsTimeout !== -1) {
      clearTimeout(this._evictUntrustedReadingsTimeout);
      this._evictUntrustedReadingsTimeout = -1;
    }
    super.dispose();
  }
  /**
   * Clear all cached font information and trigger a change event.
   */
  clearAllFontInfos() {
    this._cache.clear();
    this._onDidChange.fire();
  }
  _ensureCache(targetWindow) {
    const windowId = getWindowId(targetWindow);
    let cache2 = this._cache.get(windowId);
    if (!cache2) {
      cache2 = new FontMeasurementsCache();
      this._cache.set(windowId, cache2);
    }
    return cache2;
  }
  _writeToCache(targetWindow, item, value2) {
    const cache2 = this._ensureCache(targetWindow);
    cache2.put(item, value2);
    if (!value2.isTrusted && this._evictUntrustedReadingsTimeout === -1) {
      this._evictUntrustedReadingsTimeout = targetWindow.setTimeout(() => {
        this._evictUntrustedReadingsTimeout = -1;
        this._evictUntrustedReadings(targetWindow);
      }, 5e3);
    }
  }
  _evictUntrustedReadings(targetWindow) {
    const cache2 = this._ensureCache(targetWindow);
    const values = cache2.getValues();
    let somethingRemoved = false;
    for (const item of values) {
      if (!item.isTrusted) {
        somethingRemoved = true;
        cache2.remove(item);
      }
    }
    if (somethingRemoved) {
      this._onDidChange.fire();
    }
  }
  /**
   * Serialized currently cached font information.
   */
  serializeFontInfo(targetWindow) {
    const cache2 = this._ensureCache(targetWindow);
    return cache2.getValues().filter((item) => item.isTrusted);
  }
  /**
   * Restore previously serialized font informations.
   */
  restoreFontInfo(targetWindow, savedFontInfos) {
    for (const savedFontInfo of savedFontInfos) {
      if (savedFontInfo.version !== SERIALIZED_FONT_INFO_VERSION) {
        continue;
      }
      const fontInfo = new FontInfo(savedFontInfo, false);
      this._writeToCache(targetWindow, fontInfo, fontInfo);
    }
  }
  /**
   * Read font information.
   */
  readFontInfo(targetWindow, bareFontInfo) {
    const cache2 = this._ensureCache(targetWindow);
    if (!cache2.has(bareFontInfo)) {
      let readConfig = this._actualReadFontInfo(targetWindow, bareFontInfo);
      if (readConfig.typicalHalfwidthCharacterWidth <= 2 || readConfig.typicalFullwidthCharacterWidth <= 2 || readConfig.spaceWidth <= 2 || readConfig.maxDigitWidth <= 2) {
        readConfig = new FontInfo({
          pixelRatio: PixelRatio.getInstance(targetWindow).value,
          fontFamily: readConfig.fontFamily,
          fontWeight: readConfig.fontWeight,
          fontSize: readConfig.fontSize,
          fontFeatureSettings: readConfig.fontFeatureSettings,
          fontVariationSettings: readConfig.fontVariationSettings,
          lineHeight: readConfig.lineHeight,
          letterSpacing: readConfig.letterSpacing,
          isMonospace: readConfig.isMonospace,
          typicalHalfwidthCharacterWidth: Math.max(readConfig.typicalHalfwidthCharacterWidth, 5),
          typicalFullwidthCharacterWidth: Math.max(readConfig.typicalFullwidthCharacterWidth, 5),
          canUseHalfwidthRightwardsArrow: readConfig.canUseHalfwidthRightwardsArrow,
          spaceWidth: Math.max(readConfig.spaceWidth, 5),
          middotWidth: Math.max(readConfig.middotWidth, 5),
          wsmiddotWidth: Math.max(readConfig.wsmiddotWidth, 5),
          maxDigitWidth: Math.max(readConfig.maxDigitWidth, 5)
        }, false);
      }
      this._writeToCache(targetWindow, bareFontInfo, readConfig);
    }
    return cache2.get(bareFontInfo);
  }
  _createRequest(chr, type, all, monospace) {
    const result = new CharWidthRequest(chr, type);
    all.push(result);
    monospace?.push(result);
    return result;
  }
  _actualReadFontInfo(targetWindow, bareFontInfo) {
    const all = [];
    const monospace = [];
    const typicalHalfwidthCharacter = this._createRequest("n", 0 /* Regular */, all, monospace);
    const typicalFullwidthCharacter = this._createRequest("\uFF4D", 0 /* Regular */, all, null);
    const space = this._createRequest(" ", 0 /* Regular */, all, monospace);
    const digit0 = this._createRequest("0", 0 /* Regular */, all, monospace);
    const digit1 = this._createRequest("1", 0 /* Regular */, all, monospace);
    const digit2 = this._createRequest("2", 0 /* Regular */, all, monospace);
    const digit3 = this._createRequest("3", 0 /* Regular */, all, monospace);
    const digit4 = this._createRequest("4", 0 /* Regular */, all, monospace);
    const digit5 = this._createRequest("5", 0 /* Regular */, all, monospace);
    const digit6 = this._createRequest("6", 0 /* Regular */, all, monospace);
    const digit7 = this._createRequest("7", 0 /* Regular */, all, monospace);
    const digit8 = this._createRequest("8", 0 /* Regular */, all, monospace);
    const digit9 = this._createRequest("9", 0 /* Regular */, all, monospace);
    const rightwardsArrow = this._createRequest("\u2192", 0 /* Regular */, all, monospace);
    const halfwidthRightwardsArrow = this._createRequest("\uFFEB", 0 /* Regular */, all, null);
    const middot = this._createRequest("\xB7", 0 /* Regular */, all, monospace);
    const wsmiddotWidth = this._createRequest(String.fromCharCode(11825), 0 /* Regular */, all, null);
    const monospaceTestChars = "|/-_ilm%";
    for (let i2 = 0, len = monospaceTestChars.length; i2 < len; i2++) {
      this._createRequest(monospaceTestChars.charAt(i2), 0 /* Regular */, all, monospace);
      this._createRequest(monospaceTestChars.charAt(i2), 1 /* Italic */, all, monospace);
      this._createRequest(monospaceTestChars.charAt(i2), 2 /* Bold */, all, monospace);
    }
    readCharWidths(targetWindow, bareFontInfo, all);
    const maxDigitWidth = Math.max(digit0.width, digit1.width, digit2.width, digit3.width, digit4.width, digit5.width, digit6.width, digit7.width, digit8.width, digit9.width);
    let isMonospace = bareFontInfo.fontFeatureSettings === EditorFontLigatures.OFF;
    const referenceWidth = monospace[0].width;
    for (let i2 = 1, len = monospace.length; isMonospace && i2 < len; i2++) {
      const diff4 = referenceWidth - monospace[i2].width;
      if (diff4 < -1e-3 || diff4 > 1e-3) {
        isMonospace = false;
        break;
      }
    }
    let canUseHalfwidthRightwardsArrow = true;
    if (isMonospace && halfwidthRightwardsArrow.width !== referenceWidth) {
      canUseHalfwidthRightwardsArrow = false;
    }
    if (halfwidthRightwardsArrow.width > rightwardsArrow.width) {
      canUseHalfwidthRightwardsArrow = false;
    }
    return new FontInfo({
      pixelRatio: PixelRatio.getInstance(targetWindow).value,
      fontFamily: bareFontInfo.fontFamily,
      fontWeight: bareFontInfo.fontWeight,
      fontSize: bareFontInfo.fontSize,
      fontFeatureSettings: bareFontInfo.fontFeatureSettings,
      fontVariationSettings: bareFontInfo.fontVariationSettings,
      lineHeight: bareFontInfo.lineHeight,
      letterSpacing: bareFontInfo.letterSpacing,
      isMonospace,
      typicalHalfwidthCharacterWidth: typicalHalfwidthCharacter.width,
      typicalFullwidthCharacterWidth: typicalFullwidthCharacter.width,
      canUseHalfwidthRightwardsArrow,
      spaceWidth: space.width,
      middotWidth: middot.width,
      wsmiddotWidth: wsmiddotWidth.width,
      maxDigitWidth
    }, true);
  }
};

var FontMeasurementsCache = class {
  constructor() {
    this._keys = /* @__PURE__ */ Object.create(null);
    this._values = /* @__PURE__ */ Object.create(null);
  }
  has(item) {
    const itemId = item.getId();
    return !!this._values[itemId];
  }
  get(item) {
    const itemId = item.getId();
    return this._values[itemId];
  }
  put(item, value2) {
    const itemId = item.getId();
    this._keys[itemId] = item;
    this._values[itemId] = value2;
  }
  remove(item) {
    const itemId = item.getId();
    delete this._keys[itemId];
    delete this._values[itemId];
  }
  getValues() {
    return Object.keys(this._keys).map((id2) => this._values[id2]);
  }
};

var FontMeasurements = new FontMeasurementsImpl();
export { FontMeasurementsImpl, FontMeasurementsCache, FontMeasurements };
