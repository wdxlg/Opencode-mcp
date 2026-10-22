// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/chatDebug/chatDebugCacheInsights.ts
import { safeIntl } from "./module-0120.mjs";
import { localize } from "./module-0001.mjs";


// src/vs/workbench/contrib/chat/browser/chatDebug/chatDebugCacheInsights.ts
var numberFormatter5 = safeIntl.NumberFormat();

function fmt(n2) {
  return numberFormatter5.value.format(n2);
}

var CHANGED_EXCERPT_CAP = 120;

function analyzeStringDivergence(a, b) {
  if (a === b) {
    return void 0;
  }
  const aLength = a.length;
  const bLength = b.length;
  const minLength = Math.min(aLength, bLength);
  let commonPrefix = 0;
  while (commonPrefix < minLength && a.charCodeAt(commonPrefix) === b.charCodeAt(commonPrefix)) {
    commonPrefix++;
  }
  let commonSuffix = 0;
  while (commonSuffix < minLength - commonPrefix && a.charCodeAt(aLength - 1 - commonSuffix) === b.charCodeAt(bLength - 1 - commonSuffix)) {
    commonSuffix++;
  }
  let shape;
  if (commonPrefix === bLength && bLength < aLength) {
    shape = "trailingRemoved" /* TrailingRemoved */;
  } else if (commonPrefix === aLength && aLength < bLength) {
    shape = "trailingAdded" /* TrailingAdded */;
  } else if (commonSuffix === bLength && bLength < aLength) {
    shape = "leadingRemoved" /* LeadingRemoved */;
  } else if (commonSuffix === aLength && aLength < bLength) {
    shape = "leadingAdded" /* LeadingAdded */;
  } else {
    shape = "innerEdit" /* InnerEdit */;
  }
  return {
    shape,
    commonPrefix,
    commonSuffix,
    aLength,
    bLength,
    aChanged: a.substring(commonPrefix, aLength - commonSuffix).slice(0, CHANGED_EXCERPT_CAP),
    bChanged: b.substring(commonPrefix, bLength - commonSuffix).slice(0, CHANGED_EXCERPT_CAP)
  };
}

function describeStringDivergence(d) {
  switch (d.shape) {
    case "trailingAdded" /* TrailingAdded */:
      return localize(10496, null, fmt(d.bLength - d.aLength));
    case "trailingRemoved" /* TrailingRemoved */:
      return localize(10500, null, fmt(d.aLength - d.bLength));
    case "leadingAdded" /* LeadingAdded */:
      return localize(10499, null, fmt(d.bLength - d.aLength));
    case "leadingRemoved" /* LeadingRemoved */:
      return localize(10498, null, fmt(d.aLength - d.bLength));
    case "innerEdit" /* InnerEdit */:
      return localize(10497, null, fmt(d.commonPrefix), fmt(d.commonPrefix), fmt(d.commonSuffix));
  }
}

var VOLATILE_PATTERNS = [
  { kind: "uuid" /* Uuid */, re: /\b[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}\b/ },
  { kind: "timestamp" /* Timestamp */, re: /\b\d{4}-\d{2}-\d{2}(?:[T ]\d{2}:\d{2}(?::\d{2})?)?\b/ },
  { kind: "timestamp" /* Timestamp */, re: /\b\d{1,2}:\d{2}:\d{2}\b/ },
  { kind: "counter" /* Counter */, re: /\b\d{10,13}\b/ }
];

function detectVolatileValue(aChanged, bChanged) {
  for (const { kind, re } of VOLATILE_PATTERNS) {
    const aMatch = re.exec(aChanged)?.[0];
    const bMatch = re.exec(bChanged)?.[0];
    if (aMatch !== void 0 && bMatch !== void 0 && aMatch !== bMatch) {
      return kind;
    }
  }
  return void 0;
}

var VOLATILE_CONTEXT = 24;

var VOLATILE_WINDOW_CAP = 240;

function detectVolatileValueAround(a, b, dv) {
  const start = Math.max(0, dv.commonPrefix - VOLATILE_CONTEXT);
  const aWindow = a.substring(start, Math.min(dv.aLength - dv.commonSuffix + VOLATILE_CONTEXT, start + VOLATILE_WINDOW_CAP));
  const bWindow = b.substring(start, Math.min(dv.bLength - dv.commonSuffix + VOLATILE_CONTEXT, start + VOLATILE_WINDOW_CAP));
  return detectVolatileValue(aWindow, bWindow);
}

function volatileValueLabel(kind) {
  switch (kind) {
    case "timestamp" /* Timestamp */:
      return localize(10558, null);
    case "uuid" /* Uuid */:
      return localize(10559, null);
    case "counter" /* Counter */:
      return localize(10557, null);
  }
}

function parseToolList(toolsJson) {
  if (!toolsJson) {
    return void 0;
  }
  let raw;
  try {
    raw = JSON.parse(toolsJson);
  } catch {
    return void 0;
  }
  if (!Array.isArray(raw)) {
    return void 0;
  }
  const out = /* @__PURE__ */ new Map();
  for (let i2 = 0; i2 < raw.length; i2++) {
    const item = raw[i2];
    const name = item && typeof item.name === "string" && item.name || item && item.function && typeof item.function.name === "string" && item.function.name || item && typeof item.type === "string" && item.type || `#${i2}`;
    let serialized;
    try {
      serialized = JSON.stringify(item);
    } catch {
      serialized = String(item);
    }
    out.set(name, (out.get(name) ?? "") + serialized);
  }
  return out;
}

function analyzeToolCatalog(aTools, bTools) {
  const a = parseToolList(aTools);
  const b = parseToolList(bTools);
  if (!a || !b) {
    return void 0;
  }
  const added = [];
  const removed = [];
  const modified = [];
  for (const [name, def2] of b) {
    const aDef = a.get(name);
    if (aDef === void 0) {
      added.push(name);
    } else if (aDef !== def2) {
      modified.push(name);
    }
  }
  for (const name of a.keys()) {
    if (!b.has(name)) {
      removed.push(name);
    }
  }
  return {
    added,
    removed,
    modified,
    reorderedOnly: added.length === 0 && removed.length === 0 && modified.length === 0,
    aCount: a.size,
    bCount: b.size
  };
}

var severityRank = {
  ["ok" /* Ok */]: 0,
  ["info" /* Info */]: 1,
  ["warning" /* Warning */]: 2,
  ["critical" /* Critical */]: 3
};

function maxInsightSeverity(insights) {
  let max = "ok" /* Ok */;
  for (const i2 of insights) {
    if (severityRank[i2.severity] > severityRank[max]) {
      max = i2.severity;
    }
  }
  return max;
}

function primaryInsight(insights) {
  return insights.find((i2) => i2.severity === "critical" /* Critical */) ?? insights.find((i2) => i2.severity === "warning" /* Warning */);
}

var EFFECTIVE_MISS_PCT = 1;

var TYPICAL_TTL_MINUTES = 5;

var LOOKBACK_WINDOW_BLOCKS = 20;

var MIN_CACHEABLE_TOKENS = 4096;

function computeCacheInsights(input) {
  const out = [];
  const modelChanged = input.aModel !== input.bModel;
  const toolsChanged = (input.aTools ?? "") !== (input.bTools ?? "");
  const systemChanged = (input.aSystem ?? "") !== (input.bSystem ?? "");
  if (modelChanged) {
    out.push({
      severity: "critical" /* Critical */,
      title: localize(10520, null),
      detail: localize(10518, null, input.aModel ?? "\u2014", input.bModel ?? "\u2014"),
      hint: localize(10519, null),
      category: "model" /* Model */
    });
  }
  if (toolsChanged) {
    out.push(toolsInsight(input.aTools, input.bTools));
  }
  if (systemChanged) {
    out.push(systemInsight(input.aSystem, input.bSystem));
  }
  if (input.optionsDiff.length > 0) {
    out.push({
      severity: "warning" /* Warning */,
      title: localize(10522, null),
      detail: input.optionsDiff.map((d) => `${d.key}: ${d.previousLabel} \u2192 ${d.currentLabel}`).join(" \xB7 "),
      hint: localize(10521, null),
      category: "options" /* Options */
    });
  }
  if (input.compareInputMessages) {
    out.push(...messageInsights(input, modelChanged || toolsChanged || systemChanged));
    if (!modelChanged && !toolsChanged && !systemChanged && input.optionsDiff.length === 0 && !input.diff.break) {
      out.push(stablePrefixInsight(input));
    }
  } else if (input.isContinuation) {
    out.push({
      severity: "info" /* Info */,
      title: localize(10506, null),
      detail: localize(10505, null),
      category: "unknown" /* Unknown */
    });
  } else if (input.previousIsContinuation) {
    out.push({
      severity: "info" /* Info */,
      title: localize(10524, null),
      detail: localize(10523, null),
      category: "unknown" /* Unknown */
    });
  }
  return out;
}

function toolsInsight(aTools, bTools) {
  const delta2 = analyzeToolCatalog(aTools, bTools);
  const component = "tools";
  if (delta2?.reorderedOnly) {
    return {
      severity: "critical" /* Critical */,
      title: localize(10541, null),
      detail: localize(10539, null, fmt(delta2.bCount)),
      hint: localize(10540, null),
      component,
      category: "tools" /* Tools */
    };
  }
  if (delta2 && (delta2.added.length > 0 || delta2.removed.length > 0)) {
    const parts = [];
    if (delta2.added.length > 0) {
      parts.push(localize(10533, null, delta2.added.join(", ")));
    }
    if (delta2.removed.length > 0) {
      parts.push(localize(10538, null, delta2.removed.join(", ")));
    }
    if (delta2.modified.length > 0) {
      parts.push(localize(10537, null, delta2.modified.join(", ")));
    }
    return {
      severity: "critical" /* Critical */,
      title: localize(10543, null, fmt(delta2.aCount), fmt(delta2.bCount)),
      detail: parts.join(" \xB7 "),
      hint: localize(10542, null),
      component,
      category: "tools" /* Tools */
    };
  }
  if (delta2 && delta2.modified.length > 0) {
    return {
      severity: "critical" /* Critical */,
      title: localize(10536, null),
      detail: localize(10534, null, delta2.modified.join(", ")),
      hint: localize(10535, null),
      component,
      category: "tools" /* Tools */
    };
  }
  const dv = analyzeStringDivergence(aTools ?? "", bTools ?? "");
  return {
    severity: "critical" /* Critical */,
    title: localize(10532, null),
    detail: dv ? describeStringDivergence(dv) : void 0,
    hint: localize(10531, null),
    component,
    category: "tools" /* Tools */
  };
}

function systemInsight(aSystem, bSystem) {
  const dv = analyzeStringDivergence(aSystem ?? "", bSystem ?? "");
  const volatile = dv ? detectVolatileValueAround(aSystem ?? "", bSystem ?? "", dv) : void 0;
  return {
    severity: "critical" /* Critical */,
    title: localize(10529, null),
    detail: dv ? localize(10527, null, fmt(dv.aLength), fmt(dv.bLength), describeStringDivergence(dv)) : void 0,
    hint: volatile ? localize(10530, null, volatileValueLabel(volatile)) : localize(10528, null),
    component: "system",
    category: "system" /* System */
  };
}

function messageInsights(input, hasEarlierBreak) {
  const { diff: diff4 } = input;
  if (!diff4.break) {
    return [];
  }
  const out = [];
  const idx = diff4.break.index;
  const component = `messages[${idx}]`;
  const counts = diff4.counts;
  if (diff4.break.kind === "onlyInB" /* OnlyInB */) {
    out.push({
      // Downgrade to Info when an earlier tier already broke the cache:
      // the append is still fine, but it isn't the story of this request.
      severity: hasEarlierBreak ? "info" /* Info */ : "ok" /* Ok */,
      title: localize(10504, null),
      detail: localize(10503, null, fmt(counts.onlyInB), fmt(counts.identical)),
      component,
      category: "healthy" /* Healthy */
    });
    if (counts.onlyInB > LOOKBACK_WINDOW_BLOCKS) {
      out.push({
        severity: "warning" /* Warning */,
        title: localize(10517, null, fmt(counts.onlyInB)),
        detail: localize(10515, null, LOOKBACK_WINDOW_BLOCKS),
        hint: localize(10516, null)
      });
    }
    return out;
  }
  if (diff4.break.kind === "onlyInA" /* OnlyInA */) {
    out.push({
      severity: "critical" /* Critical */,
      title: localize(10549, null, idx),
      detail: localize(10547, null, fmt(counts.onlyInA)),
      hint: localize(10548, null),
      component,
      category: "history" /* History */
    });
    return out;
  }
  const tok = diff4.signature.find((t2) => t2.index === idx);
  const role = tok?.bRole ?? tok?.aRole ?? "message";
  const aMsg = input.aMessages[idx];
  const bMsg = input.bMessages[idx];
  const dv = aMsg && bMsg ? analyzeStringDivergence(aMsg.text, bMsg.text) : void 0;
  const volatile = dv && aMsg && bMsg ? detectVolatileValueAround(aMsg.text, bMsg.text, dv) : void 0;
  const detailParts = [];
  if (aMsg && bMsg) {
    detailParts.push(localize(10508, null, role, fmt(aMsg.charLength), fmt(bMsg.charLength)));
  }
  if (dv) {
    detailParts.push(describeStringDivergence(dv));
  }
  out.push({
    severity: "critical" /* Critical */,
    title: localize(10509, null, idx),
    detail: detailParts.join(" \xB7 "),
    hint: volatile ? localize(10510, null, volatileValueLabel(volatile)) : localize(10507, null, role),
    component,
    category: "history" /* History */
  });
  const changedAfterBreak = counts.contentDrift + counts.lengthChange + counts.onlyInA + counts.onlyInB - 1;
  if (changedAfterBreak > 0) {
    out.push({
      severity: "info" /* Info */,
      title: localize(10502, null, fmt(changedAfterBreak)),
      detail: localize(10501, null, idx)
    });
  }
  return out;
}

function stablePrefixInsight(input) {
  if (input.hitPct < EFFECTIVE_MISS_PCT) {
    if (input.inputTokens > 0 && input.inputTokens < MIN_CACHEABLE_TOKENS) {
      return {
        severity: "warning" /* Warning */,
        title: localize(10546, null),
        detail: localize(10544, null, fmt(input.inputTokens)),
        hint: localize(10545, null),
        category: "expiration" /* Expiration */
      };
    }
    const minutes = input.minutesSincePrevious;
    const gap = minutes !== void 0 && minutes >= 1 ? localize(10512, null, fmt(Math.round(minutes))) : "";
    return {
      severity: "warning" /* Warning */,
      title: localize(10514, null),
      detail: localize(10511, null, input.hitPct.toFixed(2), gap),
      hint: localize(10513, null, TYPICAL_TTL_MINUTES),
      category: "expiration" /* Expiration */
    };
  }
  return {
    severity: "ok" /* Ok */,
    title: localize(10526, null),
    detail: localize(10525, null, input.hitPct.toFixed(2)),
    category: "healthy" /* Healthy */
  };
}

function categorizeCacheBreak(insights) {
  const primary = primaryInsight(insights);
  if (primary?.category) {
    return primary.category;
  }
  for (const i2 of insights) {
    if (i2.category) {
      return i2.category;
    }
  }
  return "unknown" /* Unknown */;
}

function cacheBreakCategoryLabel(category9) {
  switch (category9) {
    case "healthy" /* Healthy */:
      return localize(10489, null);
    case "expiration" /* Expiration */:
      return localize(10488, null);
    case "model" /* Model */:
      return localize(10491, null);
    case "tools" /* Tools */:
      return localize(10494, null);
    case "system" /* System */:
      return localize(10493, null);
    case "options" /* Options */:
      return localize(10492, null);
    case "history" /* History */:
      return localize(10490, null);
    case "unknown" /* Unknown */:
      return localize(10495, null);
  }
}

var AVOIDABLE_CATEGORIES = [
  "model" /* Model */,
  "tools" /* Tools */,
  "system" /* System */,
  "options" /* Options */,
  "history" /* History */
];

var RECURRING_THRESHOLD = 2;

function buildSessionCacheReport(pairs2, turnTokens = []) {
  let overallInput = 0;
  let overallCached = 0;
  let overallTurns = 0;
  for (const t2 of turnTokens) {
    if (t2.inputTokens > 0) {
      overallInput += t2.inputTokens;
      overallCached += Math.min(t2.cachedTokens, t2.inputTokens);
      overallTurns++;
    }
  }
  const overall = overallInput > 0 ? { inputTokens: overallInput, cachedTokens: overallCached, hitPct: overallCached / overallInput * 100, turnCount: overallTurns } : void 0;
  const stats = /* @__PURE__ */ new Map();
  const causeByTurnIndex = /* @__PURE__ */ new Map();
  let healthyCount = 0;
  let avoidableLostTokens = 0;
  for (const pair of pairs2) {
    causeByTurnIndex.set(pair.turnIndex, pair.category);
    if (pair.category === "healthy" /* Healthy */) {
      healthyCount++;
      continue;
    }
    const stat = stats.get(pair.category) ?? { count: 0, lostTokens: 0 };
    stat.count++;
    stat.lostTokens += pair.lostTokens;
    stats.set(pair.category, stat);
    if (AVOIDABLE_CATEGORIES.includes(pair.category)) {
      avoidableLostTokens += pair.lostTokens;
    }
  }
  const byCategory = [...stats.entries()].map(([category9, s]) => ({ category: category9, count: s.count, lostTokens: s.lostTokens })).sort((a, b) => b.lostTokens - a.lostTokens);
  const findings = [];
  for (const stat of byCategory) {
    if (stat.count < RECURRING_THRESHOLD) {
      continue;
    }
    if (AVOIDABLE_CATEGORIES.includes(stat.category)) {
      findings.push({
        severity: "critical" /* Critical */,
        title: localize(10556, null, cacheBreakCategoryLabel(stat.category), fmt(stat.count), fmt(pairs2.length)),
        detail: localize(10555, null, fmt(stat.lostTokens)),
        category: stat.category
      });
    } else if (stat.category === "expiration" /* Expiration */) {
      findings.push({
        severity: "warning" /* Warning */,
        title: localize(10554, null, fmt(stat.count)),
        detail: localize(10552, null, fmt(stat.lostTokens)),
        hint: localize(10553, null),
        category: stat.category
      });
    }
  }
  if (findings.length === 0 && pairs2.length > 0 && healthyCount === pairs2.length) {
    findings.push({
      severity: "ok" /* Ok */,
      title: localize(10551, null),
      detail: localize(10550, null),
      category: "healthy" /* Healthy */
    });
  }
  return { pairCount: pairs2.length, healthyCount, avoidableLostTokens, overall, byCategory, causeByTurnIndex, findings };
}
export { fmt, analyzeStringDivergence, describeStringDivergence, detectVolatileValue, detectVolatileValueAround, volatileValueLabel, parseToolList, analyzeToolCatalog, maxInsightSeverity, primaryInsight, computeCacheInsights, toolsInsight, systemInsight, messageInsights, stablePrefixInsight, categorizeCacheBreak, cacheBreakCategoryLabel, buildSessionCacheReport, numberFormatter5, CHANGED_EXCERPT_CAP, VOLATILE_PATTERNS, VOLATILE_CONTEXT, VOLATILE_WINDOW_CAP, severityRank, EFFECTIVE_MISS_PCT, TYPICAL_TTL_MINUTES, LOOKBACK_WINDOW_BLOCKS, MIN_CACHEABLE_TOKENS, AVOIDABLE_CATEGORIES, RECURRING_THRESHOLD };
