// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/browser/parts/mobile/contributions/mobileDiffHelpers.ts
import { basename2 } from "./module-0034.mjs";
import { tokenizeToString } from "./module-0430.mjs";
import { linesDiffComputers } from "./module-0196.mjs";


// src/vs/sessions/browser/parts/mobile/contributions/mobileDiffHelpers.ts
var EXTENSION_LANGUAGE_MAP2 = {
  ".js": "javascript",
  ".mjs": "javascript",
  ".cjs": "javascript",
  ".jsx": "javascriptreact",
  ".ts": "typescript",
  ".mts": "typescript",
  ".cts": "typescript",
  ".tsx": "typescriptreact",
  ".py": "python",
  ".pyw": "python",
  ".java": "java",
  ".c": "c",
  ".h": "c",
  ".cpp": "cpp",
  ".cc": "cpp",
  ".cxx": "cpp",
  ".hpp": "cpp",
  ".cs": "csharp",
  ".go": "go",
  ".rs": "rust",
  ".rb": "ruby",
  ".php": "php",
  ".html": "html",
  ".htm": "html",
  ".css": "css",
  ".scss": "scss",
  ".less": "less",
  ".json": "json",
  ".jsonc": "jsonc",
  ".md": "markdown",
  ".sh": "shellscript",
  ".bash": "shellscript",
  ".zsh": "shellscript",
  ".yaml": "yaml",
  ".yml": "yaml",
  ".xml": "xml",
  ".sql": "sql",
  ".swift": "swift",
  ".kt": "kotlin",
  ".kts": "kotlin",
  ".r": "r",
  ".lua": "lua",
  ".dart": "dart"
};

function resolveMobileDiffLanguageId(languageService, diff4) {
  const uri4 = diff4.modifiedURI ?? diff4.originalURI;
  if (!uri4) {
    return "plaintext";
  }
  const guessed = languageService.guessLanguageIdByFilepathOrFirstLine(uri4);
  if (guessed && guessed !== "unknown") {
    return guessed;
  }
  const name = basename2(uri4);
  const ext = name.includes(".") ? name.slice(name.lastIndexOf(".")).toLowerCase() : "";
  return EXTENSION_LANGUAGE_MAP2[ext] ?? "plaintext";
}

async function tokenizeFileLines2(languageService, text2, languageId) {
  if (!text2) {
    return [""];
  }
  const html3 = await tokenizeToString(languageService, text2, languageId);
  const inner = stripTokenizedWrapper2(html3);
  return inner.split("<br/>");
}

function stripTokenizedWrapper2(html3) {
  const openTag = '<div class="monaco-tokenized-source">';
  const closeTag = "</div>";
  if (html3.startsWith(openTag) && html3.endsWith(closeTag)) {
    return html3.slice(openTag.length, html3.length - closeTag.length);
  }
  return html3;
}

function hasMultipleTokenClasses2(lines) {
  for (const line of lines) {
    if (line && /class="mtk[2-9]|class="mtk[1-9][0-9]/.test(line)) {
      return true;
    }
  }
  return false;
}

var LANG_FAMILY2 = {
  javascript: "js",
  javascriptreact: "js",
  typescript: "js",
  typescriptreact: "js",
  java: "js",
  csharp: "js",
  go: "js",
  rust: "js",
  cpp: "js",
  c: "js",
  swift: "js",
  kotlin: "js",
  dart: "js",
  php: "js",
  ruby: "js",
  python: "python",
  css: "css",
  scss: "css",
  less: "css",
  html: "html",
  xml: "html",
  json: "json",
  jsonc: "json",
  shellscript: "shell",
  powershell: "shell"
};

var JS_KEYWORDS2 = /* @__PURE__ */ new Set([
  "break",
  "case",
  "catch",
  "class",
  "const",
  "continue",
  "debugger",
  "default",
  "delete",
  "do",
  "else",
  "export",
  "extends",
  "false",
  "finally",
  "for",
  "function",
  "if",
  "import",
  "in",
  "instanceof",
  "let",
  "new",
  "null",
  "of",
  "return",
  "static",
  "super",
  "switch",
  "this",
  "throw",
  "true",
  "try",
  "typeof",
  "undefined",
  "var",
  "void",
  "while",
  "with",
  "yield",
  "async",
  "await",
  "from",
  "as",
  "interface",
  "type",
  "enum",
  "declare",
  "abstract",
  "override",
  "readonly",
  "namespace",
  "module",
  "public",
  "private",
  "protected"
]);

var PY_KEYWORDS2 = /* @__PURE__ */ new Set([
  "False",
  "None",
  "True",
  "and",
  "as",
  "assert",
  "async",
  "await",
  "break",
  "class",
  "continue",
  "def",
  "del",
  "elif",
  "else",
  "except",
  "finally",
  "for",
  "from",
  "global",
  "if",
  "import",
  "in",
  "is",
  "lambda",
  "nonlocal",
  "not",
  "or",
  "pass",
  "raise",
  "return",
  "try",
  "while",
  "with",
  "yield"
]);

function escapeHtml2(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function buildSpan2(kind, text2) {
  if (kind === "default" || !text2) {
    return escapeHtml2(text2);
  }
  return `<span class="mobile-diff-tok-${kind}">${escapeHtml2(text2)}</span>`;
}

function regexTokenizeLine2(line, lang) {
  const tokens = [];
  let pos = 0;
  const len = line.length;
  while (pos < len) {
    let matched = false;
    const commentPfx = lang === "python" ? "#" : lang === "shell" ? "#" : "//";
    if (line.startsWith(commentPfx, pos) || lang === "generic" && line.startsWith("#", pos)) {
      tokens.push({ start: pos, end: len, kind: "comment" });
      pos = len;
      matched = true;
    }
    if (!matched && lang !== "python" && lang !== "shell" && line.startsWith("/*", pos)) {
      const end = line.indexOf("*/", pos + 2);
      const tokenEnd = end === -1 ? len : end + 2;
      tokens.push({ start: pos, end: tokenEnd, kind: "comment" });
      pos = tokenEnd;
      matched = true;
    }
    if (!matched && lang === "js" && line[pos] === "`") {
      let i2 = pos + 1;
      while (i2 < len) {
        if (line[i2] === "\\") {
          i2 += 2;
          continue;
        }
        if (line[i2] === "`") {
          i2++;
          break;
        }
        i2++;
      }
      tokens.push({ start: pos, end: i2, kind: "string" });
      pos = i2;
      matched = true;
    }
    if (!matched && (line[pos] === '"' || line[pos] === "'")) {
      const q = line[pos];
      let i2 = pos + 1;
      while (i2 < len) {
        if (line[i2] === "\\") {
          i2 += 2;
          continue;
        }
        if (line[i2] === q) {
          i2++;
          break;
        }
        i2++;
      }
      tokens.push({ start: pos, end: i2, kind: "string" });
      pos = i2;
      matched = true;
    }
    if (!matched && /[0-9]/.test(line[pos])) {
      const m = line.slice(pos).match(/^0x[0-9a-fA-F]+|^[0-9]+\.?[0-9]*(?:[eE][+-]?[0-9]+)?/);
      if (m) {
        tokens.push({ start: pos, end: pos + m[0].length, kind: "number" });
        pos += m[0].length;
        matched = true;
      }
    }
    if (!matched && /[a-zA-Z_$]/.test(line[pos])) {
      const m = line.slice(pos).match(/^[a-zA-Z_$][a-zA-Z0-9_$]*/);
      if (m) {
        const word = m[0];
        const keywords = lang === "python" ? PY_KEYWORDS2 : JS_KEYWORDS2;
        const kind = keywords.has(word) ? "keyword" : "default";
        tokens.push({ start: pos, end: pos + word.length, kind });
        pos += word.length;
        matched = true;
      }
    }
    if (!matched) {
      const prevTok = tokens[tokens.length - 1];
      if (prevTok && prevTok.kind === "default") {
        prevTok.end = pos + 1;
      } else {
        tokens.push({ start: pos, end: pos + 1, kind: "default" });
      }
      pos++;
    }
  }
  return tokens.map((t2) => buildSpan2(t2.kind, line.slice(t2.start, t2.end))).join("");
}

function regexTokenizeLines2(text2, languageId) {
  if (!text2) {
    return [""];
  }
  const lang = LANG_FAMILY2[languageId] ?? "generic";
  return text2.split(/\r?\n/).map((line) => regexTokenizeLine2(line, lang));
}

var CONTEXT_LINES2 = 3;

function computeUnifiedDiff2(original, modified) {
  const origLines = original.split(/\r?\n/);
  const modLines = modified.split(/\r?\n/);
  const result = linesDiffComputers.getDefault().computeDiff(origLines, modLines, {
    ignoreTrimWhitespace: false,
    maxComputationTimeMs: 1e3,
    computeMoves: false
  });
  if (result.changes.length === 0) {
    return [];
  }
  const groups = [];
  for (const change of result.changes) {
    const sub = {
      origStart: change.original.startLineNumber,
      origEnd: change.original.endLineNumberExclusive,
      modStart: change.modified.startLineNumber,
      modEnd: change.modified.endLineNumberExclusive
    };
    const last = groups[groups.length - 1];
    const lastSub = last?.subs[last.subs.length - 1];
    if (lastSub && sub.origStart - lastSub.origEnd <= CONTEXT_LINES2 * 2) {
      last.subs.push(sub);
    } else {
      groups.push({ subs: [sub] });
    }
  }
  const hunks = [];
  for (const group2 of groups) {
    const first2 = group2.subs[0];
    const last = group2.subs[group2.subs.length - 1];
    const origLeading = Math.max(1, first2.origStart - CONTEXT_LINES2);
    const modLeading = Math.max(1, first2.modStart - CONTEXT_LINES2);
    const origTrailing = Math.min(origLines.length + 1, last.origEnd + CONTEXT_LINES2);
    const modTrailing = Math.min(modLines.length + 1, last.modEnd + CONTEXT_LINES2);
    const lines = [];
    for (let i2 = origLeading; i2 < first2.origStart; i2++) {
      lines.push({ type: "context", lineNum: i2, text: origLines[i2 - 1] ?? "" });
    }
    for (let s = 0; s < group2.subs.length; s++) {
      const sub = group2.subs[s];
      for (let i2 = sub.origStart; i2 < sub.origEnd; i2++) {
        lines.push({ type: "removed", lineNum: i2, text: origLines[i2 - 1] ?? "" });
      }
      for (let i2 = sub.modStart; i2 < sub.modEnd; i2++) {
        lines.push({ type: "added", lineNum: i2, text: modLines[i2 - 1] ?? "" });
      }
      const next = group2.subs[s + 1];
      if (next) {
        for (let i2 = sub.origEnd; i2 < next.origStart; i2++) {
          lines.push({ type: "context", lineNum: i2, text: origLines[i2 - 1] ?? "" });
        }
      }
    }
    for (let i2 = last.origEnd; i2 < origTrailing; i2++) {
      lines.push({ type: "context", lineNum: i2, text: origLines[i2 - 1] ?? "" });
    }
    const origCount = origTrailing - origLeading;
    const modCount = modTrailing - modLeading;
    hunks.push({
      header: `@@ -${origLeading},${origCount} +${modLeading},${modCount} @@`,
      lines
    });
  }
  return hunks;
}
export { resolveMobileDiffLanguageId, tokenizeFileLines2, stripTokenizedWrapper2, hasMultipleTokenClasses2, escapeHtml2, buildSpan2, regexTokenizeLine2, regexTokenizeLines2, computeUnifiedDiff2, EXTENSION_LANGUAGE_MAP2, LANG_FAMILY2, JS_KEYWORDS2, PY_KEYWORDS2, CONTEXT_LINES2 };
