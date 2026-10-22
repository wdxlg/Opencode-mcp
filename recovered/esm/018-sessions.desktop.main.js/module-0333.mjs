// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/browser/gpu/atlas/textureAtlasSlabAllocator.ts
import { NKeyMap } from "./module-0008.mjs";
import { ensureNonNullable } from "./module-0329.mjs";
import { getActiveWindow } from "./module-0075.mjs";
import { BugIndicatingError } from "./module-0004.mjs";


// src/vs/editor/browser/gpu/atlas/textureAtlasSlabAllocator.ts
var TextureAtlasSlabAllocator = class {
  constructor(_canvas, _textureIndex, options3) {
    this._canvas = _canvas;
    this._textureIndex = _textureIndex;
    this._slabs = [];
    this._activeSlabsByDims = new NKeyMap();
    this._unusedRects = [];
    this._openRegionsByHeight = /* @__PURE__ */ new Map();
    this._openRegionsByWidth = /* @__PURE__ */ new Map();
    /** A set of all glyphs allocated, this is only tracked to enable debug related functionality */
    this._allocatedGlyphs = /* @__PURE__ */ new Set();
    this._nextIndex = 0;
    this._ctx = ensureNonNullable(this._canvas.getContext("2d", {
      willReadFrequently: true
    }));
    this._slabW = Math.min(
      options3?.slabW ?? 64 << Math.max(Math.floor(getActiveWindow().devicePixelRatio) - 1, 0),
      this._canvas.width
    );
    this._slabH = Math.min(
      options3?.slabH ?? this._slabW,
      this._canvas.height
    );
    this._slabsPerRow = Math.floor(this._canvas.width / this._slabW);
    this._slabsPerColumn = Math.floor(this._canvas.height / this._slabH);
  }
  allocate(rasterizedGlyph) {
    const glyphWidth = rasterizedGlyph.boundingBox.right - rasterizedGlyph.boundingBox.left + 1;
    const glyphHeight = rasterizedGlyph.boundingBox.bottom - rasterizedGlyph.boundingBox.top + 1;
    if (glyphWidth > this._canvas.width || glyphHeight > this._canvas.height) {
      throw new BugIndicatingError("Glyph is too large for the atlas page");
    }
    if (glyphWidth > this._slabW || glyphHeight > this._slabH) {
      if (this._allocatedGlyphs.size > 0) {
        return void 0;
      }
      let sizeCandidate = this._canvas.width;
      while (glyphWidth < sizeCandidate / 2 && glyphHeight < sizeCandidate / 2) {
        sizeCandidate /= 2;
      }
      this._slabW = sizeCandidate;
      this._slabH = sizeCandidate;
      this._slabsPerRow = Math.floor(this._canvas.width / this._slabW);
      this._slabsPerColumn = Math.floor(this._canvas.height / this._slabH);
    }
    const desiredSlabSize = {
      // Nearest square number
      // TODO: This can probably be optimized
      // w: 1 << Math.ceil(Math.sqrt(glyphWidth)),
      // h: 1 << Math.ceil(Math.sqrt(glyphHeight)),
      // Nearest x px
      // w: Math.ceil(glyphWidth / nearestXPixels) * nearestXPixels,
      // h: Math.ceil(glyphHeight / nearestXPixels) * nearestXPixels,
      // Round odd numbers up
      // w: glyphWidth % 0 === 1 ? glyphWidth + 1 : glyphWidth,
      // h: glyphHeight % 0 === 1 ? glyphHeight + 1 : glyphHeight,
      // Exact number only
      w: glyphWidth,
      h: glyphHeight
    };
    let slab = this._activeSlabsByDims.get(desiredSlabSize.w, desiredSlabSize.h);
    if (slab) {
      const glyphsPerSlab = Math.floor(this._slabW / slab.entryW) * Math.floor(this._slabH / slab.entryH);
      if (slab.count >= glyphsPerSlab) {
        slab = void 0;
      }
    }
    let dx;
    let dy;
    if (!slab) {
      if (glyphWidth < glyphHeight) {
        const openRegions = this._openRegionsByWidth.get(glyphWidth);
        if (openRegions?.length) {
          for (let i2 = openRegions.length - 1; i2 >= 0; i2--) {
            const r2 = openRegions[i2];
            if (r2.w >= glyphWidth && r2.h >= glyphHeight) {
              dx = r2.x;
              dy = r2.y;
              if (glyphWidth < r2.w) {
                this._unusedRects.push({
                  x: r2.x + glyphWidth,
                  y: r2.y,
                  w: r2.w - glyphWidth,
                  h: glyphHeight
                });
              }
              r2.y += glyphHeight;
              r2.h -= glyphHeight;
              if (r2.h === 0) {
                if (i2 === openRegions.length - 1) {
                  openRegions.pop();
                } else {
                  this._unusedRects.splice(i2, 1);
                }
              }
              break;
            }
          }
        }
      } else {
        const openRegions = this._openRegionsByHeight.get(glyphHeight);
        if (openRegions?.length) {
          for (let i2 = openRegions.length - 1; i2 >= 0; i2--) {
            const r2 = openRegions[i2];
            if (r2.w >= glyphWidth && r2.h >= glyphHeight) {
              dx = r2.x;
              dy = r2.y;
              if (glyphHeight < r2.h) {
                this._unusedRects.push({
                  x: r2.x,
                  y: r2.y + glyphHeight,
                  w: glyphWidth,
                  h: r2.h - glyphHeight
                });
              }
              r2.x += glyphWidth;
              r2.w -= glyphWidth;
              if (r2.h === 0) {
                if (i2 === openRegions.length - 1) {
                  openRegions.pop();
                } else {
                  this._unusedRects.splice(i2, 1);
                }
              }
              break;
            }
          }
        }
      }
    }
    if (dx === void 0 || dy === void 0) {
      if (!slab) {
        if (this._slabs.length >= this._slabsPerRow * this._slabsPerColumn) {
          return void 0;
        }
        slab = {
          x: Math.floor(this._slabs.length % this._slabsPerRow) * this._slabW,
          y: Math.floor(this._slabs.length / this._slabsPerRow) * this._slabH,
          entryW: desiredSlabSize.w,
          entryH: desiredSlabSize.h,
          count: 0
        };
        const unusedW = this._slabW % slab.entryW;
        const unusedH = this._slabH % slab.entryH;
        if (unusedW) {
          addEntryToMapArray(this._openRegionsByWidth, unusedW, {
            x: slab.x + this._slabW - unusedW,
            w: unusedW,
            y: slab.y,
            h: this._slabH - (unusedH ?? 0)
          });
        }
        if (unusedH) {
          addEntryToMapArray(this._openRegionsByHeight, unusedH, {
            x: slab.x,
            w: this._slabW,
            y: slab.y + this._slabH - unusedH,
            h: unusedH
          });
        }
        this._slabs.push(slab);
        this._activeSlabsByDims.set(slab, desiredSlabSize.w, desiredSlabSize.h);
      }
      const glyphsPerRow = Math.floor(this._slabW / slab.entryW);
      dx = slab.x + Math.floor(slab.count % glyphsPerRow) * slab.entryW;
      dy = slab.y + Math.floor(slab.count / glyphsPerRow) * slab.entryH;
      slab.count++;
    }
    this._ctx.drawImage(
      rasterizedGlyph.source,
      // source
      rasterizedGlyph.boundingBox.left,
      rasterizedGlyph.boundingBox.top,
      glyphWidth,
      glyphHeight,
      // destination
      dx,
      dy,
      glyphWidth,
      glyphHeight
    );
    const glyph = {
      pageIndex: this._textureIndex,
      glyphIndex: this._nextIndex++,
      x: dx,
      y: dy,
      w: glyphWidth,
      h: glyphHeight,
      originOffsetX: rasterizedGlyph.originOffset.x,
      originOffsetY: rasterizedGlyph.originOffset.y,
      fontBoundingBoxAscent: rasterizedGlyph.fontBoundingBoxAscent,
      fontBoundingBoxDescent: rasterizedGlyph.fontBoundingBoxDescent
    };
    this._allocatedGlyphs.add(glyph);
    return glyph;
  }
  getUsagePreview() {
    const w = this._canvas.width;
    const h3 = this._canvas.height;
    const canvas = new OffscreenCanvas(w, h3);
    const ctx = ensureNonNullable(canvas.getContext("2d"));
    ctx.fillStyle = "#808080" /* Unused */;
    ctx.fillRect(0, 0, w, h3);
    let slabEntryPixels = 0;
    let usedPixels = 0;
    let slabEdgePixels = 0;
    let restrictedPixels = 0;
    const slabW = 64 << Math.floor(getActiveWindow().devicePixelRatio) - 1;
    const slabH = slabW;
    for (const slab of this._slabs) {
      let x = 0;
      let y = 0;
      for (let i2 = 0; i2 < slab.count; i2++) {
        if (x + slab.entryW > slabW) {
          x = 0;
          y += slab.entryH;
        }
        ctx.fillStyle = "#FF0000" /* Wasted */;
        ctx.fillRect(slab.x + x, slab.y + y, slab.entryW, slab.entryH);
        slabEntryPixels += slab.entryW * slab.entryH;
        x += slab.entryW;
      }
      const entriesPerRow = Math.floor(slabW / slab.entryW);
      const entriesPerCol = Math.floor(slabH / slab.entryH);
      const thisSlabPixels = slab.entryW * entriesPerRow * slab.entryH * entriesPerCol;
      slabEdgePixels += slabW * slabH - thisSlabPixels;
    }
    for (const g of this._allocatedGlyphs) {
      usedPixels += g.w * g.h;
      ctx.fillStyle = "#4040FF" /* Used */;
      ctx.fillRect(g.x, g.y, g.w, g.h);
    }
    const unusedRegions = Array.from(this._openRegionsByWidth.values()).flat().concat(Array.from(this._openRegionsByHeight.values()).flat());
    for (const r2 of unusedRegions) {
      ctx.fillStyle = "#FF000088" /* Restricted */;
      ctx.fillRect(r2.x, r2.y, r2.w, r2.h);
      restrictedPixels += r2.w * r2.h;
    }
    ctx.globalAlpha = 0.5;
    ctx.drawImage(this._canvas, 0, 0);
    ctx.globalAlpha = 1;
    return canvas.convertToBlob();
  }
  getStats() {
    const w = this._canvas.width;
    const h3 = this._canvas.height;
    let slabEntryPixels = 0;
    let usedPixels = 0;
    let slabEdgePixels = 0;
    let wastedPixels = 0;
    let restrictedPixels = 0;
    const totalPixels = w * h3;
    const slabW = 64 << Math.floor(getActiveWindow().devicePixelRatio) - 1;
    const slabH = slabW;
    for (const slab of this._slabs) {
      let x = 0;
      let y = 0;
      for (let i2 = 0; i2 < slab.count; i2++) {
        if (x + slab.entryW > slabW) {
          x = 0;
          y += slab.entryH;
        }
        slabEntryPixels += slab.entryW * slab.entryH;
        x += slab.entryW;
      }
      const entriesPerRow = Math.floor(slabW / slab.entryW);
      const entriesPerCol = Math.floor(slabH / slab.entryH);
      const thisSlabPixels = slab.entryW * entriesPerRow * slab.entryH * entriesPerCol;
      slabEdgePixels += slabW * slabH - thisSlabPixels;
    }
    for (const g of this._allocatedGlyphs) {
      usedPixels += g.w * g.h;
    }
    const unusedRegions = Array.from(this._openRegionsByWidth.values()).flat().concat(Array.from(this._openRegionsByHeight.values()).flat());
    for (const r2 of unusedRegions) {
      restrictedPixels += r2.w * r2.h;
    }
    const edgeUsedPixels = slabEdgePixels - restrictedPixels;
    wastedPixels = slabEntryPixels - (usedPixels - edgeUsedPixels);
    const efficiency = usedPixels / (usedPixels + wastedPixels + restrictedPixels);
    return [
      `page[${this._textureIndex}]:`,
      `     Total: ${totalPixels}px (${w}x${h3})`,
      `      Used: ${usedPixels}px (${(usedPixels / totalPixels * 100).toFixed(2)}%)`,
      `    Wasted: ${wastedPixels}px (${(wastedPixels / totalPixels * 100).toFixed(2)}%)`,
      `Restricted: ${restrictedPixels}px (${(restrictedPixels / totalPixels * 100).toFixed(2)}%) (hard to allocate)`,
      `Efficiency: ${efficiency === 1 ? "100" : (efficiency * 100).toFixed(2)}%`,
      `     Slabs: ${this._slabs.length} of ${Math.floor(this._canvas.width / slabW) * Math.floor(this._canvas.height / slabH)}`
    ].join("\n");
  }
};

function addEntryToMapArray(map, key3, entry) {
  let list2 = map.get(key3);
  if (!list2) {
    list2 = [];
    map.set(key3, list2);
  }
  list2.push(entry);
}
export { addEntryToMapArray, TextureAtlasSlabAllocator };
