// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/providers/agentHost/browser/agentHostSessionCustomizations.ts
import { getInlineToolInput } from "./module-1008.mjs";
import { URI } from "./module-0032.mjs";


// src/vs/sessions/contrib/providers/agentHost/browser/agentHostSessionCustomizations.ts
function customizationRefsEqual(a, b) {
  return a === b || a.length === b.length && a.every((ref, i2) => ref.kind === b[i2].kind && ref.value === b[i2].value);
}

function sessionChatCustomizationsEqual(a, b) {
  return a === b || a.length === b.length && a.every((customization, i2) => customization.id === b[i2].id && customization.kind === b[i2].kind && customization.name === b[i2].name && customization.uri?.toString() === b[i2].uri?.toString());
}

var skillToolNames = /* @__PURE__ */ new Set(["skill", "runskill", "invokeskill"]);

var skillNameFields = ["skill", "name", "skillName", "command"];

var pathTokenPattern = /[\w.~@$():[\]+-]*(?:[/\\]+[\w.~@$():[\]+-]+)+/g;

function readSkillName(input) {
  let parsed;
  try {
    parsed = JSON.parse(input);
  } catch {
    return input.trim() || void 0;
  }
  if (!parsed || typeof parsed !== "object") {
    return typeof parsed === "string" ? parsed : void 0;
  }
  const record = parsed;
  for (const field of skillNameFields) {
    const value2 = record[field];
    if (typeof value2 === "string" && value2.length > 0) {
      return value2;
    }
  }
  return void 0;
}

function pushRef(refs, seen, kind, value2) {
  const key3 = `${kind}\0${value2}`;
  if (!seen.has(key3)) {
    seen.add(key3);
    refs.push({ kind, value: value2 });
  }
}

function parseToolCall(toolCall, refs, seen) {
  if (toolCall.contributor?.kind === "mcp" /* MCP */) {
    pushRef(refs, seen, "mcp" /* Mcp */, toolCall.contributor.customizationId);
  }
  if (toolCall.status === "streaming" /* Streaming */) {
    return;
  }
  const input = getInlineToolInput(toolCall.toolInput);
  if (!input) {
    return;
  }
  if (skillToolNames.has(toolCall.toolName.toLowerCase())) {
    const name = readSkillName(input);
    if (name) {
      pushRef(refs, seen, "skill" /* Skill */, name);
    }
  }
  for (const match2 of input.matchAll(pathTokenPattern)) {
    pushRef(refs, seen, "path" /* Path */, match2[0]);
  }
}

function parseTurnCustomizationRefs(responseParts) {
  const refs = [];
  const seen = /* @__PURE__ */ new Set();
  for (const part of responseParts) {
    if (part.kind === "toolCall" /* ToolCall */) {
      parseToolCall(part.toolCall, refs, seen);
    }
  }
  return refs;
}

function createIncrementalChatCustomizationRefsParser(parseTurn = parseTurnCustomizationRefs) {
  const completedTurnCache = /* @__PURE__ */ new Map();
  return (chatState) => {
    const turns = chatState.turns ?? [];
    const completedIds = new Set(turns.map((turn) => turn.id));
    for (const id2 of completedTurnCache.keys()) {
      if (!completedIds.has(id2)) {
        completedTurnCache.delete(id2);
      }
    }
    const refs = [];
    const seen = /* @__PURE__ */ new Set();
    const append4 = (parsed) => {
      for (const ref of parsed) {
        const key3 = `${ref.kind}\0${ref.value}`;
        if (!seen.has(key3)) {
          seen.add(key3);
          refs.push(ref);
        }
      }
    };
    for (const turn of turns) {
      let parsed = completedTurnCache.get(turn.id);
      if (!parsed) {
        parsed = parseTurn(turn.responseParts);
        completedTurnCache.set(turn.id, parsed);
      }
      append4(parsed);
    }
    if (chatState.activeTurn) {
      append4(parseTurn(chatState.activeTurn.responseParts));
    }
    return refs;
  };
}

var kindByType2 = /* @__PURE__ */ new Map([
  ["agent" /* Agent */, "agent" /* Agent */],
  ["skill" /* Skill */, "skill" /* Skill */],
  ["rule" /* Rule */, "instruction" /* Instruction */],
  ["hook" /* Hook */, "hook" /* Hook */],
  ["prompt" /* Prompt */, "prompt" /* Prompt */],
  ["mcpServer" /* McpServer */, "mcpServer" /* McpServer */],
  ["plugin" /* Plugin */, "plugin" /* Plugin */]
]);

function normalizePath2(path) {
  return path.replace(/\\/g, "/").replace(/\/{2,}/g, "/").replace(/\/$/, "").toLowerCase();
}

function toFsPath(uri4) {
  try {
    const parsed = URI.parse(uri4);
    return parsed.scheme === "file" ? normalizePath2(parsed.path) : void 0;
  } catch {
    return void 0;
  }
}

var CustomizationIndex = class {
  constructor(customizations, workspaceRoots = []) {
    this._byId = /* @__PURE__ */ new Map();
    this._byPath = /* @__PURE__ */ new Map();
    this._byContainerPath = /* @__PURE__ */ new Map();
    this._bySkillName = /* @__PURE__ */ new Map();
    this._roots = workspaceRoots.map((root) => normalizePath2(root.path));
    for (const customization of customizations ?? []) {
      this._add(customization);
      for (const child of customization.children ?? []) {
        this._add(child);
      }
    }
  }
  get isEmpty() {
    return this._byId.size === 0;
  }
  _add(customization) {
    const kind = kindByType2.get(customization.type);
    if (!kind) {
      return;
    }
    const uri4 = customization.uri ? URI.parse(customization.uri) : void 0;
    const entry = { id: customization.id, kind, name: customization.name, ...uri4 ? { uri: uri4 } : {} };
    this._byId.set(customization.id, entry);
    if (kind === "skill" /* Skill */) {
      this._bySkillName.set(customization.name.toLowerCase(), entry);
    }
    const path = customization.uri ? toFsPath(customization.uri) : void 0;
    if (!path) {
      return;
    }
    this._byPath.set(path, entry);
    if (kind === "plugin" /* Plugin */) {
      this._byContainerPath.set(path, entry);
    } else if (kind === "skill" /* Skill */) {
      const container2 = path.slice(0, path.lastIndexOf("/"));
      if (container2) {
        this._byContainerPath.set(container2, entry);
      }
    }
  }
  _resolvePath(token) {
    const candidates = [];
    const normalized = normalizePath2(token.startsWith("file://") ? toFsPath(token) ?? token : token);
    if (!normalized) {
      return void 0;
    }
    candidates.push(normalized.startsWith("/") ? normalized : `/${normalized}`);
    for (const root of this._roots) {
      candidates.push(`${root}/${normalized.replace(/^\.\//, "")}`);
    }
    for (const candidate of candidates) {
      const direct = this._byPath.get(candidate);
      if (direct) {
        return direct;
      }
      for (let parent = candidate; parent.includes("/"); parent = parent.slice(0, parent.lastIndexOf("/"))) {
        const container2 = this._byContainerPath.get(parent);
        if (container2) {
          return container2;
        }
      }
    }
    return void 0;
  }
  resolve(ref) {
    switch (ref.kind) {
      case "mcp" /* Mcp */:
        return this._byId.get(ref.value);
      case "skill" /* Skill */:
        return this._bySkillName.get(ref.value.toLowerCase());
      case "path" /* Path */:
        return this._resolvePath(ref.value);
    }
  }
};

function resolveChatCustomizations(refs, index2) {
  if (index2.isEmpty || refs.length === 0) {
    return [];
  }
  const resolved = [];
  const seen = /* @__PURE__ */ new Set();
  for (const ref of refs) {
    const customization = index2.resolve(ref);
    if (customization && !seen.has(customization.id)) {
      seen.add(customization.id);
      resolved.push(customization);
    }
  }
  return resolved;
}
export { customizationRefsEqual, sessionChatCustomizationsEqual, readSkillName, pushRef, parseToolCall, parseTurnCustomizationRefs, createIncrementalChatCustomizationRefsParser, normalizePath2, toFsPath, resolveChatCustomizations, skillToolNames, skillNameFields, pathTokenPattern, kindByType2, CustomizationIndex };
