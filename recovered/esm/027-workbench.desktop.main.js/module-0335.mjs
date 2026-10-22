// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/browser/gpu/atlas/textureAtlas.ts
import { Disposable, MutableDisposable, dispose, toDisposable } from "./module-0012.mjs";
import { NKeyMap } from "./module-0008.mjs";
import { Emitter, Event2 } from "./module-0017.mjs";
import { getActiveWindow } from "./module-0075.mjs";
import { TextureAtlasPage } from "./module-0334.mjs";
import { GlyphRasterizer } from "./module-0330.mjs";
import { BugIndicatingError } from "./module-0004.mjs";
import { IdleTaskQueue } from "./module-0331.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IThemeService } from "./module-0287.mjs";
import { IInstantiationService } from "./module-0077.mjs";


// src/vs/editor/browser/gpu/atlas/textureAtlas.ts
var TextureAtlas = class extends Disposable {
  constructor(_maxTextureSize, options3, _decorationStyleCache, _themeService, _instantiationService) {
    super();
    this._maxTextureSize = _maxTextureSize;
    this._decorationStyleCache = _decorationStyleCache;
    this._themeService = _themeService;
    this._instantiationService = _instantiationService;
    this._warmUpTask = this._register(new MutableDisposable());
    this._warmedUpRasterizers = /* @__PURE__ */ new Set();
    /**
     * The main texture atlas pages which are both larger textures and more efficiently packed
     * relative to the scratch page. The idea is the main pages are drawn to and uploaded to the GPU
     * much less frequently so as to not drop frames.
     */
    this._pages = [];
    /**
     * A maps of glyph keys to the page to start searching for the glyph. This is set before
     * searching to have as little runtime overhead (branching, intermediate variables) as possible,
     * so it is not guaranteed to be the actual page the glyph is on. But it is guaranteed that all
     * pages with a lower index do not contain the glyph.
     */
    this._glyphPageIndex = new NKeyMap();
    this._onDidDeleteGlyphs = this._register(new Emitter());
    this.onDidDeleteGlyphs = this._onDidDeleteGlyphs.event;
    this._allocatorType = options3?.allocatorType ?? "slab";
    this._register(Event2.runAndSubscribe(this._themeService.onDidColorThemeChange, () => {
      if (this._colorMap) {
        this.clear();
      }
      this._colorMap = this._themeService.getColorTheme().tokenColorMap;
    }));
    const dprFactor = Math.max(1, Math.floor(getActiveWindow().devicePixelRatio));
    this.pageSize = Math.min(1024 * dprFactor, this._maxTextureSize);
    this._initFirstPage();
    this._register(toDisposable(() => dispose(this._pages)));
  }
  static {
    /**
     * The maximum number of texture atlas pages. This is currently a hard static cap that must not
     * be reached.
     */
    this.maximumPageCount = 16;
  }
  get pages() {
    return this._pages;
  }
  _initFirstPage() {
    const firstPage = this._instantiationService.createInstance(TextureAtlasPage, 0, this.pageSize, this._allocatorType);
    this._pages.push(firstPage);
    const nullRasterizer = new GlyphRasterizer(1, "", 1, this._decorationStyleCache);
    firstPage.getGlyph(nullRasterizer, "", 0, 0);
    nullRasterizer.dispose();
  }
  clear() {
    for (const page of this._pages) {
      page.dispose();
    }
    this._pages.length = 0;
    this._glyphPageIndex.clear();
    this._warmedUpRasterizers.clear();
    this._warmUpTask.clear();
    this._initFirstPage();
    this._onDidDeleteGlyphs.fire();
  }
  getGlyph(rasterizer, chars, tokenMetadata, decorationStyleSetId, x) {
    tokenMetadata &= ~(255 /* LANGUAGEID_MASK */ | 768 /* TOKEN_TYPE_MASK */ | 1024 /* BALANCED_BRACKETS_MASK */);
    tokenMetadata |= Math.floor(x % 1 * 10);
    if (!this._warmedUpRasterizers.has(rasterizer.id)) {
      this._warmUpAtlas(rasterizer);
      this._warmedUpRasterizers.add(rasterizer.id);
    }
    return this._tryGetGlyph(this._glyphPageIndex.get(chars, tokenMetadata, decorationStyleSetId, rasterizer.cacheKey) ?? 0, rasterizer, chars, tokenMetadata, decorationStyleSetId);
  }
  _tryGetGlyph(pageIndex, rasterizer, chars, tokenMetadata, decorationStyleSetId) {
    this._glyphPageIndex.set(pageIndex, chars, tokenMetadata, decorationStyleSetId, rasterizer.cacheKey);
    return this._pages[pageIndex].getGlyph(rasterizer, chars, tokenMetadata, decorationStyleSetId) ?? (pageIndex + 1 < this._pages.length ? this._tryGetGlyph(pageIndex + 1, rasterizer, chars, tokenMetadata, decorationStyleSetId) : void 0) ?? this._getGlyphFromNewPage(rasterizer, chars, tokenMetadata, decorationStyleSetId);
  }
  _getGlyphFromNewPage(rasterizer, chars, tokenMetadata, decorationStyleSetId) {
    if (this._pages.length >= TextureAtlas.maximumPageCount) {
      throw new Error(`Attempt to create a texture atlas page past the limit ${TextureAtlas.maximumPageCount}`);
    }
    this._pages.push(this._instantiationService.createInstance(TextureAtlasPage, this._pages.length, this.pageSize, this._allocatorType));
    this._glyphPageIndex.set(this._pages.length - 1, chars, tokenMetadata, decorationStyleSetId, rasterizer.cacheKey);
    return this._pages[this._pages.length - 1].getGlyph(rasterizer, chars, tokenMetadata, decorationStyleSetId);
  }
  getUsagePreview() {
    return Promise.all(this._pages.map((e) => e.getUsagePreview()));
  }
  getStats() {
    return this._pages.map((e) => e.getStats());
  }
  /**
   * Warms up the atlas by rasterizing all printable ASCII characters for each token color. This
   * is distrubuted over multiple idle callbacks to avoid blocking the main thread.
   */
  _warmUpAtlas(rasterizer) {
    const colorMap = this._colorMap;
    if (!colorMap) {
      throw new BugIndicatingError("Cannot warm atlas without color map");
    }
    this._warmUpTask.value?.clear();
    const taskQueue = this._warmUpTask.value = this._instantiationService.createInstance(IdleTaskQueue);
    for (let code = 65 /* A */; code <= 90 /* Z */; code++) {
      for (const fgColor of colorMap.keys()) {
        taskQueue.enqueue(() => {
          for (let x = 0; x < 1; x += 0.1) {
            this.getGlyph(rasterizer, String.fromCharCode(code), fgColor << 15 /* FOREGROUND_OFFSET */ & 16744448 /* FOREGROUND_MASK */, 0, x);
          }
        });
      }
    }
    for (let code = 97 /* a */; code <= 122 /* z */; code++) {
      for (const fgColor of colorMap.keys()) {
        taskQueue.enqueue(() => {
          for (let x = 0; x < 1; x += 0.1) {
            this.getGlyph(rasterizer, String.fromCharCode(code), fgColor << 15 /* FOREGROUND_OFFSET */ & 16744448 /* FOREGROUND_MASK */, 0, x);
          }
        });
      }
    }
    for (let code = 33 /* ExclamationMark */; code <= 126 /* Tilde */; code++) {
      for (const fgColor of colorMap.keys()) {
        taskQueue.enqueue(() => {
          for (let x = 0; x < 1; x += 0.1) {
            this.getGlyph(rasterizer, String.fromCharCode(code), fgColor << 15 /* FOREGROUND_OFFSET */ & 16744448 /* FOREGROUND_MASK */, 0, x);
          }
        });
      }
    }
  }
};

TextureAtlas = __decorateClass([
  __decorateParam(3, IThemeService),
  __decorateParam(4, IInstantiationService)
], TextureAtlas);
export { TextureAtlas };
