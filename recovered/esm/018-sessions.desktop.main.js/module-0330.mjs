// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/browser/gpu/raster/glyphRasterizer.ts
import { Disposable } from "./module-0012.mjs";
import { isMacintosh } from "./module-0014.mjs";
import { ensureNonNullable } from "./module-0329.mjs";
import { TokenMetadata } from "./module-0108.mjs";
import { StringBuilder } from "./module-0127.mjs";
import { __decorateClass } from "./module-0000.mjs";
import { memoize } from "./module-0250.mjs";


// src/vs/editor/browser/gpu/raster/glyphRasterizer.ts
var nextId = 0;

var GlyphRasterizer = class extends Disposable {
  constructor(fontSize, fontFamily, devicePixelRatio, _decorationStyleCache) {
    super();
    this.fontSize = fontSize;
    this.fontFamily = fontFamily;
    this.devicePixelRatio = devicePixelRatio;
    this._decorationStyleCache = _decorationStyleCache;
    this.id = nextId++;
    this._workGlyph = {
      source: null,
      boundingBox: {
        left: 0,
        bottom: 0,
        right: 0,
        top: 0
      },
      originOffset: {
        x: 0,
        y: 0
      },
      fontBoundingBoxAscent: 0,
      fontBoundingBoxDescent: 0
    };
    this._workGlyphConfig = { chars: void 0, tokenMetadata: 0, decorationStyleSetId: 0 };
    // TODO: Support workbench.fontAliasing correctly
    this._antiAliasing = isMacintosh ? "greyscale" : "subpixel";
    const devicePixelFontSize = Math.ceil(this.fontSize * devicePixelRatio);
    this._canvas = new OffscreenCanvas(devicePixelFontSize * 3, devicePixelFontSize * 3);
    this._ctx = ensureNonNullable(this._canvas.getContext("2d", {
      willReadFrequently: true,
      alpha: this._antiAliasing === "greyscale"
    }));
    this._ctx.textBaseline = "top";
    this._ctx.fillStyle = "#FFFFFF";
    this._ctx.font = `${devicePixelFontSize}px ${this.fontFamily}`;
    this._textMetrics = this._ctx.measureText("A");
  }
  get cacheKey() {
    return `${this.fontFamily}_${this.fontSize}px`;
  }
  /**
   * Rasterizes a glyph. Note that the returned object is reused across different glyphs and
   * therefore is only safe for synchronous access.
   */
  rasterizeGlyph(chars, tokenMetadata, decorationStyleSetId, colorMap) {
    if (chars === "") {
      return {
        source: this._canvas,
        boundingBox: { top: 0, left: 0, bottom: -1, right: -1 },
        originOffset: { x: 0, y: 0 },
        fontBoundingBoxAscent: 0,
        fontBoundingBoxDescent: 0
      };
    }
    if (this._workGlyphConfig.chars === chars && this._workGlyphConfig.tokenMetadata === tokenMetadata && this._workGlyphConfig.decorationStyleSetId === decorationStyleSetId) {
      return this._workGlyph;
    }
    this._workGlyphConfig.chars = chars;
    this._workGlyphConfig.tokenMetadata = tokenMetadata;
    this._workGlyphConfig.decorationStyleSetId = decorationStyleSetId;
    return this._rasterizeGlyph(chars, tokenMetadata, decorationStyleSetId, colorMap);
  }
  _rasterizeGlyph(chars, tokenMetadata, decorationStyleSetId, colorMap) {
    const devicePixelFontSize = Math.ceil(this.fontSize * this.devicePixelRatio);
    const canvasDim = devicePixelFontSize * 3;
    if (this._canvas.width !== canvasDim) {
      this._canvas.width = canvasDim;
      this._canvas.height = canvasDim;
    }
    this._ctx.save();
    const subPixelXOffset = (tokenMetadata & 15) / 10;
    const bgId = TokenMetadata.getBackground(tokenMetadata);
    const bg = colorMap[bgId] ?? colorMap[2 /* DefaultBackground */];
    const decorationStyleSet = this._decorationStyleCache.getStyleSet(decorationStyleSetId);
    if (this._antiAliasing === "subpixel") {
      this._ctx.fillStyle = bg;
      this._ctx.fillRect(0, 0, this._canvas.width, this._canvas.height);
    } else {
      this._ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);
    }
    const fontSb = new StringBuilder(200);
    const fontStyle = TokenMetadata.getFontStyle(tokenMetadata);
    if (fontStyle & 1 /* Italic */) {
      fontSb.appendString("italic ");
    }
    if (decorationStyleSet?.bold !== void 0) {
      if (decorationStyleSet.bold) {
        fontSb.appendString("bold ");
      }
    } else if (fontStyle & 2 /* Bold */) {
      fontSb.appendString("bold ");
    }
    fontSb.appendString(`${devicePixelFontSize}px ${this.fontFamily}`);
    this._ctx.font = fontSb.build();
    const originX = devicePixelFontSize;
    const originY = devicePixelFontSize;
    if (decorationStyleSet?.color !== void 0) {
      this._ctx.fillStyle = `#${decorationStyleSet.color.toString(16).padStart(8, "0")}`;
    } else {
      this._ctx.fillStyle = colorMap[TokenMetadata.getForeground(tokenMetadata)];
    }
    if (decorationStyleSet?.opacity !== void 0) {
      this._ctx.globalAlpha = decorationStyleSet.opacity;
    }
    this._ctx.textBaseline = "top";
    this._ctx.fillText(chars, originX + subPixelXOffset, originY);
    if (decorationStyleSet?.strikethrough) {
      const strikethroughY = Math.round(originY - this._textMetrics.alphabeticBaseline * 0.65);
      const lineWidth = decorationStyleSet?.strikethroughThickness !== void 0 ? Math.round(decorationStyleSet.strikethroughThickness * this.devicePixelRatio) : Math.max(1, Math.floor(devicePixelFontSize / 10));
      if (decorationStyleSet?.strikethroughColor !== void 0) {
        this._ctx.fillStyle = `#${decorationStyleSet.strikethroughColor.toString(16).padStart(8, "0")}`;
      }
      this._ctx.fillRect(originX, strikethroughY - Math.floor(lineWidth / 2), Math.ceil(this._textMetrics.width), lineWidth);
    }
    this._ctx.restore();
    const imageData = this._ctx.getImageData(0, 0, this._canvas.width, this._canvas.height);
    if (this._antiAliasing === "subpixel") {
      const bgR = parseInt(bg.substring(1, 3), 16);
      const bgG = parseInt(bg.substring(3, 5), 16);
      const bgB = parseInt(bg.substring(5, 7), 16);
      this._clearColor(imageData, bgR, bgG, bgB);
      this._ctx.putImageData(imageData, 0, 0);
    }
    this._findGlyphBoundingBox(imageData, this._workGlyph.boundingBox);
    this._workGlyph.source = this._canvas;
    this._workGlyph.originOffset.x = this._workGlyph.boundingBox.left - originX;
    this._workGlyph.originOffset.y = this._workGlyph.boundingBox.top - originY;
    this._workGlyph.fontBoundingBoxAscent = this._textMetrics.fontBoundingBoxAscent;
    this._workGlyph.fontBoundingBoxDescent = this._textMetrics.fontBoundingBoxDescent;
    return this._workGlyph;
  }
  _clearColor(imageData, r2, g, b) {
    for (let offset = 0; offset < imageData.data.length; offset += 4) {
      if (imageData.data[offset] === r2 && imageData.data[offset + 1] === g && imageData.data[offset + 2] === b) {
        imageData.data[offset + 3] = 0;
      }
    }
  }
  // TODO: Does this even need to happen when measure text is used?
  _findGlyphBoundingBox(imageData, outBoundingBox) {
    const height = this._canvas.height;
    const width2 = this._canvas.width;
    let found = false;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width2; x++) {
        const alphaOffset = y * width2 * 4 + x * 4 + 3;
        if (imageData.data[alphaOffset] !== 0) {
          outBoundingBox.top = y;
          found = true;
          break;
        }
      }
      if (found) {
        break;
      }
    }
    outBoundingBox.left = 0;
    found = false;
    for (let x = 0; x < width2; x++) {
      for (let y = 0; y < height; y++) {
        const alphaOffset = y * width2 * 4 + x * 4 + 3;
        if (imageData.data[alphaOffset] !== 0) {
          outBoundingBox.left = x;
          found = true;
          break;
        }
      }
      if (found) {
        break;
      }
    }
    outBoundingBox.right = width2;
    found = false;
    for (let x = width2 - 1; x >= outBoundingBox.left; x--) {
      for (let y = 0; y < height; y++) {
        const alphaOffset = y * width2 * 4 + x * 4 + 3;
        if (imageData.data[alphaOffset] !== 0) {
          outBoundingBox.right = x;
          found = true;
          break;
        }
      }
      if (found) {
        break;
      }
    }
    outBoundingBox.bottom = outBoundingBox.top;
    found = false;
    for (let y = height - 1; y >= 0; y--) {
      for (let x = 0; x < width2; x++) {
        const alphaOffset = y * width2 * 4 + x * 4 + 3;
        if (imageData.data[alphaOffset] !== 0) {
          outBoundingBox.bottom = y;
          found = true;
          break;
        }
      }
      if (found) {
        break;
      }
    }
  }
  getTextMetrics(text2) {
    return this._ctx.measureText(text2);
  }
};

__decorateClass([
  memoize
], GlyphRasterizer.prototype, "cacheKey", 1);
export { nextId, GlyphRasterizer };
