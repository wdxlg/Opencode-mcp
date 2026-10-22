// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/terminalContrib/chatAgentTools/browser/tools/terminalOutputCache.ts
import { parseCommand, segmentHead } from "./module-3374.mjs";


// src/vs/workbench/contrib/terminalContrib/chatAgentTools/browser/tools/terminalOutputCache.ts
var TTL_MS = {
  ["fast" /* Fast */]: 3e4,
  ["medium" /* Medium */]: 12e4,
  ["slow" /* Slow */]: 3e5
};

var MAX_ENTRIES = 256;

function classifyCommand(command4) {
  const parsed = parseCommand(command4);
  if (!parsed || parsed.segments.length === 0) {
    return { cls: void 0, invalidates: [] };
  }
  if (parsed.segments.length > 1) {
    const allInvalidates = [];
    for (const seg of parsed.segments) {
      const h3 = segmentHead(seg);
      if (h3) {
        const sub = classifySingleHead(h3);
        allInvalidates.push(...sub.invalidates);
      }
    }
    return { cls: void 0, invalidates: allInvalidates };
  }
  const head = segmentHead(parsed.segments[0]);
  if (!head) {
    return { cls: void 0, invalidates: [] };
  }
  return classifySingleHead(head);
}

function classifySingleHead(head) {
  switch (head.head) {
    case "git": {
      if (head.sub && /^(add|commit|push|pull|fetch|merge|rebase|reset|checkout|switch|restore|cherry-pick|revert|stash|tag|branch|am|apply|clean|rm|mv)$/.test(head.sub)) {
        return { cls: void 0, invalidates: ["git"] };
      }
      if (head.sub === "status" || head.sub === "diff" || head.sub === "show" || head.sub === "blame") {
        return { cls: "fast" /* Fast */, invalidates: [] };
      }
      if (head.sub === "log" || head.sub === "reflog" || head.sub === "shortlog") {
        return { cls: "slow" /* Slow */, invalidates: [] };
      }
      return { cls: void 0, invalidates: [] };
    }
    case "ls":
    case "pwd":
    case "tree":
    case "find":
      return { cls: head.head === "find" || head.head === "tree" ? "slow" /* Slow */ : "fast" /* Fast */, invalidates: [] };
    case "npm":
    case "pnpm":
    case "yarn":
      if (head.sub === "ls" || head.sub === "list" || head.sub === "outdated") {
        return { cls: "slow" /* Slow */, invalidates: [] };
      }
      if (head.sub === "install" || head.sub === "i" || head.sub === "ci" || head.sub === "add" || head.sub === "remove" || head.sub === "uninstall" || head.sub === "update") {
        return { cls: void 0, invalidates: ["npm", "pnpm", "yarn"] };
      }
      if (head.sub === "test" || head.sub === "run" || head.sub === void 0) {
        return { cls: "medium" /* Medium */, invalidates: [] };
      }
      return { cls: void 0, invalidates: [] };
    case "pytest":
    case "jest":
    case "vitest":
    case "cargo":
      if (head.head === "cargo" && head.sub && /^(test|nextest|check|build)$/.test(head.sub)) {
        return { cls: "medium" /* Medium */, invalidates: [] };
      }
      if (head.head !== "cargo") {
        return { cls: "medium" /* Medium */, invalidates: [] };
      }
      return { cls: void 0, invalidates: [] };
    case "go":
      if (head.sub === "test" || head.sub === "build" || head.sub === "vet") {
        return { cls: "medium" /* Medium */, invalidates: [] };
      }
      return { cls: void 0, invalidates: [] };
    case "docker":
    case "kubectl":
      if (head.sub === "ps" || head.sub === "images" || head.sub === "get" || head.sub === "describe") {
        return { cls: "fast" /* Fast */, invalidates: [] };
      }
      return { cls: void 0, invalidates: [] };
    case "env":
    case "printenv":
      return { cls: "slow" /* Slow */, invalidates: [] };
    case "gh":
      return { cls: "medium" /* Medium */, invalidates: [] };
  }
  return { cls: void 0, invalidates: [] };
}

function getInput(input) {
  if (typeof input !== "object" || input === null) {
    return void 0;
  }
  const i2 = input;
  if (typeof i2.command !== "string" || !i2.command.trim()) {
    return void 0;
  }
  const cwd2 = typeof i2.cwd === "string" ? i2.cwd : "";
  return { command: i2.command, cwd: cwd2 };
}

var TerminalOutputCache = class {
  constructor(now = () => Date.now()) {
    this.id = "terminal.session-dedup";
    this.toolIds = ["run_in_terminal" /* RunInTerminal */];
    this._entries = /* @__PURE__ */ new Map();
    this._now = now;
  }
  _key(cwd2, command4) {
    return `${cwd2}::${command4.trim()}`;
  }
  observe(_toolId, input) {
    const parsed = getInput(input);
    if (!parsed) {
      return;
    }
    const { invalidates } = classifyCommand(parsed.command);
    if (invalidates.length === 0) {
      return;
    }
    this._invalidateByProgram(parsed.cwd, invalidates);
  }
  lookup(_toolId, input) {
    const parsed = getInput(input);
    if (!parsed) {
      return void 0;
    }
    const { cls } = classifyCommand(parsed.command);
    if (cls === void 0) {
      return void 0;
    }
    const key3 = this._key(parsed.cwd, parsed.command);
    const entry = this._entries.get(key3);
    if (!entry) {
      return void 0;
    }
    const ttl = TTL_MS[entry.cls];
    if (this._now() - entry.timestamp > ttl) {
      this._entries.delete(key3);
      return void 0;
    }
    return { text: entry.text, timestamp: entry.timestamp };
  }
  record(_toolId, input, text2) {
    const parsed = getInput(input);
    if (!parsed) {
      return;
    }
    const { cls } = classifyCommand(parsed.command);
    if (cls === void 0) {
      return;
    }
    const key3 = this._key(parsed.cwd, parsed.command);
    if (this._entries.has(key3)) {
      this._entries.delete(key3);
    }
    this._entries.set(key3, {
      cwd: parsed.cwd,
      command: parsed.command,
      text: text2,
      timestamp: this._now(),
      cls
    });
    while (this._entries.size > MAX_ENTRIES) {
      const oldestKey = this._entries.keys().next().value;
      if (oldestKey === void 0) {
        break;
      }
      this._entries.delete(oldestKey);
    }
  }
  /** External hook for editor file-write notifications etc. */
  invalidateCwd(cwd2) {
    for (const key3 of [...this._entries.keys()]) {
      const e = this._entries.get(key3);
      if (e.cwd === cwd2) {
        this._entries.delete(key3);
      }
    }
  }
  _invalidateByProgram(cwd2, programs) {
    const progSet = new Set(programs);
    for (const key3 of [...this._entries.keys()]) {
      const e = this._entries.get(key3);
      if (e.cwd !== cwd2) {
        continue;
      }
      const head = segmentHead(parseCommand(e.command)?.segments[0] ?? { raw: "", tokens: [], rawTokens: [], envPrefixes: [], wrappers: [], trailingSeparator: void 0 });
      if (head && progSet.has(head.head)) {
        this._entries.delete(key3);
      }
    }
  }
};
export { classifyCommand, classifySingleHead, getInput, TTL_MS, MAX_ENTRIES, TerminalOutputCache };
