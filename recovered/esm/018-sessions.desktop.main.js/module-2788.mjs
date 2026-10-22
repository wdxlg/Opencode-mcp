// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/tools/toolResultCompressorService.ts
import { Disposable } from "./module-0012.mjs";
import { getErrorMessage } from "./module-0004.mjs";
import { MIN_COMPRESSIBLE_LENGTH, formatCompressionBanner, isProtectedFromCompression } from "./module-2717.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { ILogService } from "./module-0095.mjs";


// src/vs/workbench/contrib/chat/browser/tools/toolResultCompressorService.ts
var ToolResultCompressorService = class extends Disposable {
  constructor(_configurationService, _telemetryService, _logService) {
    super();
    this._configurationService = _configurationService;
    this._telemetryService = _telemetryService;
    this._logService = _logService;
    this._filters = /* @__PURE__ */ new Map();
    this._caches = /* @__PURE__ */ new Map();
  }
  registerFilter(filter2) {
    for (const id2 of filter2.toolIds) {
      let bucket = this._filters.get(id2);
      if (!bucket) {
        bucket = [];
        this._filters.set(id2, bucket);
      }
      bucket.push(filter2);
    }
  }
  registerCache(cache2) {
    for (const id2 of cache2.toolIds) {
      let bucket = this._caches.get(id2);
      if (!bucket) {
        bucket = [];
        this._caches.set(id2, bucket);
      }
      bucket.push(cache2);
    }
  }
  maybeCompress(toolId, input, result) {
    if (!this._configurationService.getValue("chat.tools.compressOutput.enabled" /* CompressOutputEnabled */)) {
      return void 0;
    }
    const caches = this._caches.get(toolId);
    if (caches && caches.length > 0) {
      for (const c of caches) {
        try {
          c.observe(toolId, input);
        } catch (err) {
          this._logService.warn(`[ToolResultCompressor] cache ${c.id} threw in observe on tool ${toolId}: ${getErrorMessage(err)}`, err);
        }
      }
      for (const c of caches) {
        let hit;
        try {
          hit = c.lookup(toolId, input);
        } catch (err) {
          this._logService.warn(`[ToolResultCompressor] cache ${c.id} threw in lookup on tool ${toolId}: ${getErrorMessage(err)}`, err);
          continue;
        }
        if (hit) {
          const totalBefore2 = result.content.reduce((acc, p) => acc + (p.kind === "text" ? p.value.length : 0), 0);
          if (totalBefore2 < MIN_COMPRESSIBLE_LENGTH) {
            continue;
          }
          const hasProtectedContent = result.content.some((p) => p.kind === "text" && isProtectedFromCompression(p.value));
          if (hasProtectedContent) {
            continue;
          }
          const cachedResult = this._buildCacheHitResult(result, hit);
          const totalAfter2 = cachedResult.content.reduce((acc, p) => acc + (p.kind === "text" ? p.value.length : 0), 0);
          if (totalAfter2 >= totalBefore2) {
            continue;
          }
          this._sendTelemetry(toolId, [`cache:${c.id}`], totalBefore2, totalAfter2, true);
          return cachedResult;
        }
      }
    }
    const filters2 = this._filters.get(toolId);
    const matchingFilters = filters2?.filter((f) => {
      try {
        return f.matches(toolId, input);
      } catch (err) {
        this._logService.warn(`[ToolResultCompressor] filter ${f.id} threw in matches on tool ${toolId}: ${getErrorMessage(err)}`, err);
        return false;
      }
    }) ?? [];
    if (matchingFilters.length === 0) {
      this._recordInCaches(toolId, input, result, caches);
      return void 0;
    }
    const activeFilters = matchingFilters.slice();
    const disabledFilterIds = /* @__PURE__ */ new Set();
    let totalBefore = 0;
    let totalAfter = 0;
    let anyCompressed = false;
    const usedFilterIds = /* @__PURE__ */ new Set();
    const newContent = result.content.map((part) => {
      if (part.kind !== "text") {
        return part;
      }
      const original = part.value;
      totalBefore += original.length;
      if (original.length < MIN_COMPRESSIBLE_LENGTH) {
        totalAfter += original.length;
        return part;
      }
      if (isProtectedFromCompression(original)) {
        totalAfter += original.length;
        return part;
      }
      let current = original;
      const partFilterIds = [];
      for (let i2 = 0; i2 < activeFilters.length; ) {
        const filter2 = activeFilters[i2];
        try {
          const out = filter2.apply(current, input);
          if (out.compressed && out.text.length < current.length) {
            current = out.text;
            usedFilterIds.add(filter2.id);
            partFilterIds.push(filter2.id);
          }
          i2++;
        } catch (err) {
          activeFilters.splice(i2, 1);
          if (!disabledFilterIds.has(filter2.id)) {
            disabledFilterIds.add(filter2.id);
            this._logService.warn(`[ToolResultCompressor] filter ${filter2.id} threw on tool ${toolId}; disabled for this pass: ${getErrorMessage(err)}`, err);
          }
        }
      }
      totalAfter += current.length;
      if (current !== original) {
        anyCompressed = true;
        const banner = formatCompressionBanner(partFilterIds, original.length, current.length);
        const annotated = `${banner}
${current}`;
        const rewritten = {
          kind: "text",
          value: annotated,
          audience: part.audience,
          title: part.title
        };
        return rewritten;
      }
      return part;
    });
    if (!anyCompressed) {
      this._recordInCaches(toolId, input, result, caches);
      return void 0;
    }
    this._sendTelemetry(toolId, [...usedFilterIds], totalBefore, totalAfter, false);
    const finalResult = {
      ...result,
      content: newContent
    };
    this._recordInCaches(toolId, input, finalResult, caches);
    return finalResult;
  }
  _buildCacheHitResult(original, hit) {
    const iso = new Date(hit.timestamp).toISOString();
    const text2 = `Same output as last run (${iso}). To disable, set ${"chat.tools.compressOutput.enabled" /* CompressOutputEnabled */} to false.`;
    const firstText = original.content.find((p) => p.kind === "text");
    const replacement = {
      kind: "text",
      value: text2,
      audience: firstText?.audience,
      title: firstText?.title
    };
    const nonText = original.content.filter((p) => p.kind !== "text");
    return { ...original, content: [replacement, ...nonText] };
  }
  _recordInCaches(toolId, input, result, caches) {
    if (!caches || caches.length === 0) {
      return;
    }
    const text2 = result.content.filter((p) => p.kind === "text").map((p) => p.value).join("\n");
    if (!text2) {
      return;
    }
    for (const c of caches) {
      try {
        c.record(toolId, input, text2);
      } catch (err) {
        this._logService.warn(`[ToolResultCompressor] cache ${c.id} threw in record on tool ${toolId}: ${getErrorMessage(err)}`, err);
      }
    }
  }
  _sendTelemetry(toolId, filterIds, beforeChars, afterChars, cacheHit) {
    this._telemetryService.publicLog2(
      "toolResultCompressed",
      {
        toolId,
        filters: filterIds.join(","),
        beforeChars,
        afterChars,
        cacheHit
      }
    );
  }
};

ToolResultCompressorService = __decorateClass([
  __decorateParam(0, IConfigurationService),
  __decorateParam(1, ITelemetryService),
  __decorateParam(2, ILogService)
], ToolResultCompressorService);
export { ToolResultCompressorService };
