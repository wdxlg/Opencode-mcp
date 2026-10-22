// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/common/config/fontInfo.ts
import { isMacintosh, isWindows } from "./module-0014.mjs";
import { EditorZoom } from "./module-0100.mjs";


// src/vs/editor/common/config/fontInfo.ts
var GOLDEN_LINE_HEIGHT_RATIO = isMacintosh ? 1.5 : 1.35;

var MINIMUM_LINE_HEIGHT = 8;

var BareFontInfo = class _BareFontInfo {
  /**
   * @internal
   */
  constructor(opts) {
    this._bareFontInfoBrand = void 0;
    this.pixelRatio = opts.pixelRatio;
    this.fontFamily = String(opts.fontFamily);
    this.fontWeight = String(opts.fontWeight);
    this.fontSize = opts.fontSize;
    this.fontFeatureSettings = opts.fontFeatureSettings;
    this.fontVariationSettings = opts.fontVariationSettings;
    this.lineHeight = opts.lineHeight | 0;
    this.letterSpacing = opts.letterSpacing;
  }
  /**
   * @internal
   */
  static _create(fontFamily, fontWeight, fontSize, fontFeatureSettings, fontVariationSettings, lineHeight, letterSpacing, pixelRatio, ignoreEditorZoom) {
    if (lineHeight === 0) {
      lineHeight = GOLDEN_LINE_HEIGHT_RATIO * fontSize;
    } else if (lineHeight < MINIMUM_LINE_HEIGHT) {
      lineHeight = lineHeight * fontSize;
    }
    lineHeight = Math.round(lineHeight);
    if (lineHeight < MINIMUM_LINE_HEIGHT) {
      lineHeight = MINIMUM_LINE_HEIGHT;
    }
    const editorZoomLevelMultiplier = 1 + (ignoreEditorZoom ? 0 : EditorZoom.getZoomLevel() * 0.1);
    fontSize *= editorZoomLevelMultiplier;
    lineHeight *= editorZoomLevelMultiplier;
    if (fontVariationSettings === FONT_VARIATION_TRANSLATE) {
      if (fontWeight === "normal" || fontWeight === "bold") {
        fontVariationSettings = FONT_VARIATION_OFF;
      } else {
        const fontWeightAsNumber = parseInt(fontWeight, 10);
        fontVariationSettings = `'wght' ${fontWeightAsNumber}`;
        fontWeight = "normal";
      }
    }
    return new _BareFontInfo({
      pixelRatio,
      fontFamily,
      fontWeight,
      fontSize,
      fontFeatureSettings,
      fontVariationSettings,
      lineHeight,
      letterSpacing
    });
  }
  /**
   * @internal
   */
  getId() {
    return `${this.pixelRatio}-${this.fontFamily}-${this.fontWeight}-${this.fontSize}-${this.fontFeatureSettings}-${this.fontVariationSettings}-${this.lineHeight}-${this.letterSpacing}`;
  }
  /**
   * @internal
   */
  getMassagedFontFamily() {
    const fallbackFontFamily = EDITOR_FONT_DEFAULTS.fontFamily;
    const fontFamily = _BareFontInfo._wrapInQuotes(this.fontFamily);
    if (fallbackFontFamily && this.fontFamily !== fallbackFontFamily) {
      return `${fontFamily}, ${fallbackFontFamily}`;
    }
    return fontFamily;
  }
  static _wrapInQuotes(fontFamily) {
    if (/[,"']/.test(fontFamily)) {
      return fontFamily;
    }
    if (/[+ ]/.test(fontFamily)) {
      return `"${fontFamily}"`;
    }
    return fontFamily;
  }
};

var SERIALIZED_FONT_INFO_VERSION = 2;

var FontInfo = class extends BareFontInfo {
  /**
   * @internal
   */
  constructor(opts, isTrusted) {
    super(opts);
    this._editorStylingBrand = void 0;
    this.version = SERIALIZED_FONT_INFO_VERSION;
    this.isTrusted = isTrusted;
    this.isMonospace = opts.isMonospace;
    this.typicalHalfwidthCharacterWidth = opts.typicalHalfwidthCharacterWidth;
    this.typicalFullwidthCharacterWidth = opts.typicalFullwidthCharacterWidth;
    this.canUseHalfwidthRightwardsArrow = opts.canUseHalfwidthRightwardsArrow;
    this.spaceWidth = opts.spaceWidth;
    this.middotWidth = opts.middotWidth;
    this.wsmiddotWidth = opts.wsmiddotWidth;
    this.maxDigitWidth = opts.maxDigitWidth;
  }
  /**
   * @internal
   */
  equals(other) {
    return this.fontFamily === other.fontFamily && this.fontWeight === other.fontWeight && this.fontSize === other.fontSize && this.fontFeatureSettings === other.fontFeatureSettings && this.fontVariationSettings === other.fontVariationSettings && this.lineHeight === other.lineHeight && this.letterSpacing === other.letterSpacing && this.typicalHalfwidthCharacterWidth === other.typicalHalfwidthCharacterWidth && this.typicalFullwidthCharacterWidth === other.typicalFullwidthCharacterWidth && this.canUseHalfwidthRightwardsArrow === other.canUseHalfwidthRightwardsArrow && this.spaceWidth === other.spaceWidth && this.middotWidth === other.middotWidth && this.wsmiddotWidth === other.wsmiddotWidth && this.maxDigitWidth === other.maxDigitWidth;
  }
};

var FONT_VARIATION_OFF = "normal";

var FONT_VARIATION_TRANSLATE = "translate";

var DEFAULT_WINDOWS_FONT_FAMILY = "Consolas, 'Courier New', monospace";

var DEFAULT_MAC_FONT_FAMILY = "Menlo, Monaco, 'Courier New', monospace";

var DEFAULT_LINUX_FONT_FAMILY = "'Droid Sans Mono', monospace";

var EDITOR_FONT_DEFAULTS = {
  fontFamily: isMacintosh ? DEFAULT_MAC_FONT_FAMILY : isWindows ? DEFAULT_WINDOWS_FONT_FAMILY : DEFAULT_LINUX_FONT_FAMILY,
  fontWeight: "normal",
  fontSize: isMacintosh ? 12 : 14,
  lineHeight: 0,
  letterSpacing: 0
};
export { GOLDEN_LINE_HEIGHT_RATIO, MINIMUM_LINE_HEIGHT, BareFontInfo, SERIALIZED_FONT_INFO_VERSION, FontInfo, FONT_VARIATION_OFF, FONT_VARIATION_TRANSLATE, DEFAULT_WINDOWS_FONT_FAMILY, DEFAULT_MAC_FONT_FAMILY, DEFAULT_LINUX_FONT_FAMILY, EDITOR_FONT_DEFAULTS };
