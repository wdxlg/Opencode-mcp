// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/browser/viewParts/minimap/minimapCharRendererFactory.ts
import { prebakedMiniMaps } from "./module-0310.mjs";
import { MinimapCharRenderer } from "./module-0309.mjs";
import { allCharCodes } from "./module-0307.mjs";
import { toUint8 } from "./module-0029.mjs";


// src/vs/editor/browser/viewParts/minimap/minimapCharRendererFactory.ts
var MinimapCharRendererFactory = class _MinimapCharRendererFactory {
  /**
   * Creates a new character renderer factory with the given scale.
   */
  static create(scale, fontFamily) {
    if (this.lastCreated && scale === this.lastCreated.scale && fontFamily === this.lastFontFamily) {
      return this.lastCreated;
    }
    let factory;
    if (prebakedMiniMaps[scale]) {
      factory = new MinimapCharRenderer(prebakedMiniMaps[scale](), scale);
    } else {
      factory = _MinimapCharRendererFactory.createFromSampleData(
        _MinimapCharRendererFactory.createSampleData(fontFamily).data,
        scale
      );
    }
    this.lastFontFamily = fontFamily;
    this.lastCreated = factory;
    return factory;
  }
  /**
   * Creates the font sample data, writing to a canvas.
   */
  static createSampleData(fontFamily) {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.style.height = `${16 /* SAMPLED_CHAR_HEIGHT */}px`;
    canvas.height = 16 /* SAMPLED_CHAR_HEIGHT */;
    canvas.width = 96 /* CHAR_COUNT */ * 10 /* SAMPLED_CHAR_WIDTH */;
    canvas.style.width = 96 /* CHAR_COUNT */ * 10 /* SAMPLED_CHAR_WIDTH */ + "px";
    ctx.fillStyle = "#ffffff";
    ctx.font = `bold ${16 /* SAMPLED_CHAR_HEIGHT */}px ${fontFamily}`;
    ctx.textBaseline = "middle";
    let x = 0;
    for (const code of allCharCodes) {
      ctx.fillText(String.fromCharCode(code), x, 16 /* SAMPLED_CHAR_HEIGHT */ / 2);
      x += 10 /* SAMPLED_CHAR_WIDTH */;
    }
    return ctx.getImageData(0, 0, 96 /* CHAR_COUNT */ * 10 /* SAMPLED_CHAR_WIDTH */, 16 /* SAMPLED_CHAR_HEIGHT */);
  }
  /**
   * Creates a character renderer from the canvas sample data.
   */
  static createFromSampleData(source, scale) {
    const expectedLength = 16 /* SAMPLED_CHAR_HEIGHT */ * 10 /* SAMPLED_CHAR_WIDTH */ * 4 /* RGBA_CHANNELS_CNT */ * 96 /* CHAR_COUNT */;
    if (source.length !== expectedLength) {
      throw new Error("Unexpected source in MinimapCharRenderer");
    }
    const charData = _MinimapCharRendererFactory._downsample(source, scale);
    return new MinimapCharRenderer(charData, scale);
  }
  static _downsampleChar(source, sourceOffset, dest, destOffset, scale) {
    const width2 = 1 /* BASE_CHAR_WIDTH */ * scale;
    const height = 2 /* BASE_CHAR_HEIGHT */ * scale;
    let targetIndex = destOffset;
    let brightest = 0;
    for (let y = 0; y < height; y++) {
      const sourceY1 = y / height * 16 /* SAMPLED_CHAR_HEIGHT */;
      const sourceY2 = (y + 1) / height * 16 /* SAMPLED_CHAR_HEIGHT */;
      for (let x = 0; x < width2; x++) {
        const sourceX1 = x / width2 * 10 /* SAMPLED_CHAR_WIDTH */;
        const sourceX2 = (x + 1) / width2 * 10 /* SAMPLED_CHAR_WIDTH */;
        let value2 = 0;
        let samples = 0;
        for (let sy = sourceY1; sy < sourceY2; sy++) {
          const sourceRow = sourceOffset + Math.floor(sy) * 3840 /* RGBA_SAMPLED_ROW_WIDTH */;
          const yBalance = 1 - (sy - Math.floor(sy));
          for (let sx = sourceX1; sx < sourceX2; sx++) {
            const xBalance = 1 - (sx - Math.floor(sx));
            const sourceIndex = sourceRow + Math.floor(sx) * 4 /* RGBA_CHANNELS_CNT */;
            const weight5 = xBalance * yBalance;
            samples += weight5;
            value2 += source[sourceIndex] * source[sourceIndex + 3] / 255 * weight5;
          }
        }
        const final = value2 / samples;
        brightest = Math.max(brightest, final);
        dest[targetIndex++] = toUint8(final);
      }
    }
    return brightest;
  }
  static _downsample(data, scale) {
    const pixelsPerCharacter = 2 /* BASE_CHAR_HEIGHT */ * scale * 1 /* BASE_CHAR_WIDTH */ * scale;
    const resultLen = pixelsPerCharacter * 96 /* CHAR_COUNT */;
    const result = new Uint8ClampedArray(resultLen);
    let resultOffset = 0;
    let sourceOffset = 0;
    let brightest = 0;
    for (let charIndex = 0; charIndex < 96 /* CHAR_COUNT */; charIndex++) {
      brightest = Math.max(brightest, this._downsampleChar(data, sourceOffset, result, resultOffset, scale));
      resultOffset += pixelsPerCharacter;
      sourceOffset += 10 /* SAMPLED_CHAR_WIDTH */ * 4 /* RGBA_CHANNELS_CNT */;
    }
    if (brightest > 0) {
      const adjust = 255 / brightest;
      for (let i2 = 0; i2 < resultLen; i2++) {
        result[i2] *= adjust;
      }
    }
    return result;
  }
};
export { MinimapCharRendererFactory };
