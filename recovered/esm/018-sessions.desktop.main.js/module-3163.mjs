// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/terminalContrib/chatAgentTools/browser/tools/terminalCommandParser.ts



// src/vs/workbench/contrib/terminalContrib/chatAgentTools/browser/tools/terminalCommandParser.ts
var WRAPPER_PROGRAMS = /* @__PURE__ */ new Set([
  "sudo",
  "doas",
  "time",
  "command",
  "builtin",
  "exec",
  "nice",
  "ionice",
  "nohup",
  "env",
  "xargs",
  "stdbuf",
  "unbuffer",
  "script",
  "timeout"
]);

var ENV_ASSIGN_RE = /^[A-Za-z_][A-Za-z0-9_]*=.*$/;

function tokenize(segment) {
  const tokens = [];
  let cur = "";
  let inSingle = false;
  let inDouble = false;
  let hasContent = false;
  for (let i2 = 0; i2 < segment.length; i2++) {
    const ch = segment[i2];
    if (inSingle) {
      if (ch === "'") {
        inSingle = false;
      } else {
        cur += ch;
      }
      continue;
    }
    if (inDouble) {
      if (ch === "\\" && i2 + 1 < segment.length) {
        const next = segment[i2 + 1];
        if (next === "\\" || next === '"' || next === "$" || next === "`") {
          cur += next;
          i2++;
          continue;
        }
        cur += ch;
        continue;
      }
      if (ch === '"') {
        inDouble = false;
      } else {
        cur += ch;
      }
      continue;
    }
    if (ch === "\\" && i2 + 1 < segment.length) {
      cur += segment[i2 + 1];
      i2++;
      hasContent = true;
      continue;
    }
    if (ch === "'") {
      inSingle = true;
      hasContent = true;
      continue;
    }
    if (ch === '"') {
      inDouble = true;
      hasContent = true;
      continue;
    }
    if (/\s/.test(ch)) {
      if (cur.length > 0 || hasContent) {
        tokens.push(cur);
        cur = "";
        hasContent = false;
      }
      continue;
    }
    cur += ch;
    hasContent = true;
  }
  if (cur.length > 0 || hasContent) {
    tokens.push(cur);
  }
  return tokens;
}

function splitSegments(command4) {
  const out = [];
  let cur = "";
  let inSingle = false;
  let inDouble = false;
  const push = (sep2) => {
    const trimmed = cur.trim();
    if (trimmed.length > 0 || sep2 !== void 0) {
      out.push({ raw: trimmed, sep: sep2 });
    }
    cur = "";
  };
  for (let i2 = 0; i2 < command4.length; i2++) {
    const ch = command4[i2];
    if (inSingle) {
      cur += ch;
      if (ch === "'") {
        inSingle = false;
      }
      continue;
    }
    if (inDouble) {
      if (ch === "\\" && i2 + 1 < command4.length) {
        cur += ch + command4[i2 + 1];
        i2++;
        continue;
      }
      cur += ch;
      if (ch === '"') {
        inDouble = false;
      }
      continue;
    }
    if (ch === "\\" && i2 + 1 < command4.length) {
      cur += ch + command4[i2 + 1];
      i2++;
      continue;
    }
    if (ch === "'") {
      inSingle = true;
      cur += ch;
      continue;
    }
    if (ch === '"') {
      inDouble = true;
      cur += ch;
      continue;
    }
    if (ch === "|" && command4[i2 + 1] === "|") {
      push("||");
      i2++;
      continue;
    }
    if (ch === "|" && command4[i2 + 1] === "&") {
      push("|&");
      i2++;
      continue;
    }
    if (ch === "|") {
      push("|");
      continue;
    }
    if (ch === "&" && command4[i2 + 1] === "&") {
      push("&&");
      i2++;
      continue;
    }
    if (ch === ";") {
      push(";");
      continue;
    }
    cur += ch;
  }
  push(void 0);
  return out;
}

function stripPrefixesAndWrappers(rawTokens) {
  const envPrefixes = [];
  const wrappers = [];
  let i2 = 0;
  while (i2 < rawTokens.length && ENV_ASSIGN_RE.test(rawTokens[i2])) {
    envPrefixes.push(rawTokens[i2]);
    i2++;
  }
  while (i2 < rawTokens.length) {
    const tok = rawTokens[i2];
    if (WRAPPER_PROGRAMS.has(tok)) {
      wrappers.push(tok);
      i2++;
      while (i2 < rawTokens.length) {
        const next = rawTokens[i2];
        if (next === "--") {
          i2++;
          break;
        }
        if (next.startsWith("-")) {
          i2++;
          continue;
        }
        if (ENV_ASSIGN_RE.test(next)) {
          envPrefixes.push(next);
          i2++;
          continue;
        }
        if ((tok === "timeout" || tok === "nice" || tok === "ionice") && /^\d/.test(next)) {
          i2++;
          continue;
        }
        break;
      }
      continue;
    }
    break;
  }
  return {
    tokens: rawTokens.slice(i2),
    envPrefixes,
    wrappers
  };
}

function parseCommand(command4) {
  if (!command4) {
    return void 0;
  }
  const trimmed = command4.trim();
  if (!trimmed) {
    return void 0;
  }
  const rawSegments = splitSegments(trimmed);
  if (rawSegments.length === 0) {
    return void 0;
  }
  const segments = rawSegments.map((seg) => {
    const rawTokens = tokenize(seg.raw);
    const { tokens, envPrefixes, wrappers } = stripPrefixesAndWrappers(rawTokens);
    return {
      raw: seg.raw,
      rawTokens,
      tokens,
      envPrefixes,
      wrappers,
      trailingSeparator: seg.sep
    };
  });
  return { raw: trimmed, segments };
}

function segmentHead(segment) {
  const tokens = segment.tokens;
  if (tokens.length === 0) {
    return void 0;
  }
  const head = tokens[0];
  let sub;
  for (let i2 = 1; i2 < tokens.length; i2++) {
    if (tokens[i2].startsWith("--")) {
      continue;
    }
    sub = tokens[i2];
    break;
  }
  return { head, sub };
}

function segmentHasFlag(segment, flags) {
  const longFlags = flags.filter((f) => f.length > 1).map((f) => `--${f}`);
  const shortFlags = flags.filter((f) => f.length === 1);
  for (const tok of segment.tokens) {
    if (!tok.startsWith("-") || tok === "--") {
      continue;
    }
    if (tok.startsWith("--")) {
      const name = tok.slice(2).split("=")[0];
      if (longFlags.includes(`--${name}`)) {
        return true;
      }
      continue;
    }
    const bundled = tok.slice(1);
    for (const f of shortFlags) {
      if (bundled.includes(f)) {
        return true;
      }
    }
  }
  return false;
}
export { tokenize, splitSegments, stripPrefixesAndWrappers, parseCommand, segmentHead, segmentHasFlag, WRAPPER_PROGRAMS, ENV_ASSIGN_RE };
