// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/common/expPayload.ts



// src/vs/workbench/contrib/chat/common/expPayload.ts
var MAX_SELECTORS = 32;

var MAX_ID_LENGTH = 64;

var ID_PATTERN = /^[a-z0-9][a-z0-9._-]*$/;

function isObject4(value2) {
  return typeof value2 === "object" && value2 !== null && !Array.isArray(value2);
}

function parseExpPayloadEnvelope(raw, version2) {
  if (typeof raw !== "string" || !raw.trim()) {
    return "empty payload";
  }
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    return `payload is not valid JSON: ${err instanceof Error ? err.message : String(err)}`;
  }
  if (!isObject4(parsed)) {
    return "payload is not an object";
  }
  if (parsed.version !== version2) {
    return `unsupported version ${JSON.stringify(parsed.version)}, expected ${version2}`;
  }
  return parsed;
}

function readText(raw, maxLength, pattern) {
  if (typeof raw !== "string") {
    return void 0;
  }
  const trimmed = pattern ? raw.trim().toLowerCase() : raw.trim();
  if (!trimmed || trimmed.length > maxLength || pattern && !pattern.test(trimmed)) {
    return void 0;
  }
  return trimmed;
}

function normalizeSelector(value2) {
  return value2.trim().toLowerCase().replace(/[\s_]+/g, "-");
}

function readSelectorList(raw, path) {
  if (raw === void 0) {
    return [];
  }
  if (!Array.isArray(raw)) {
    return `${path} must be an array of strings`;
  }
  if (raw.length > MAX_SELECTORS) {
    return `${path} exceeds ${MAX_SELECTORS} entries`;
  }
  const out = [];
  for (const entry of raw) {
    if (typeof entry !== "string") {
      return `${path} must contain only strings`;
    }
    const normalized = normalizeSelector(entry);
    if (!normalized) {
      return `${path} must not contain empty strings`;
    }
    out.push(normalized);
  }
  return out;
}

function expandModelMatchCandidates(modelId, aliases) {
  const candidates = /* @__PURE__ */ new Set();
  const add = (value2) => {
    const normalized = value2 === void 0 ? "" : normalizeSelector(value2);
    if (normalized) {
      candidates.add(normalized);
    }
  };
  if (modelId) {
    add(modelId);
    for (const segment of modelId.split(/[/:]/)) {
      add(segment);
    }
  }
  for (const alias of aliases ?? []) {
    add(alias);
  }
  return candidates;
}

function modelSelectorAliases(metadata) {
  return [metadata.id, metadata.family, metadata.name, metadata.vendor];
}
export { isObject4, parseExpPayloadEnvelope, readText, normalizeSelector, readSelectorList, expandModelMatchCandidates, modelSelectorAliases, MAX_SELECTORS, MAX_ID_LENGTH, ID_PATTERN };
