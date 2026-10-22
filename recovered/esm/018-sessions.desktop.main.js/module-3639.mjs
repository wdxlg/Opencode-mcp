// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/browser/parts/mobile/contributions/mobileDiffView.ts
import { $, EventType, addDisposableListener, append, clearNode } from "./module-0075.mjs";
import { Disposable, DisposableStore, toDisposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { localize } from "./module-0001.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { Codicon } from "./module-0085.mjs";
import { EventType2, Gesture } from "./module-0251.mjs";
import { basename2 } from "./module-0034.mjs";
import { TokenizationRegistry2 } from "./module-0164.mjs";
import { generateTokensCSSForColorMap } from "./module-0401.mjs";
import { tokenizeToString } from "./module-0430.mjs";
import { linesDiffComputers } from "./module-0196.mjs";


// src/vs/sessions/browser/parts/mobile/contributions/mobileDiffView.ts
var $119 = $;

var EXTENSION_LANGUAGE_MAP = {
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

var MOBILE_OPEN_DIFF_VIEW_COMMAND_ID = "sessions.mobile.openDiffView";

var MobileDiffView = class extends Disposable {
  constructor(workbenchContainer, data, textFileService, languageService) {
    super();
    this.textFileService = textFileService;
    this.languageService = languageService;
    this._onDidDispose = this._register(new Emitter());
    /**
     * Fires when this view has been disposed (either externally or
     * because the user tapped Back). Used by the mobile overlay
     * contribution to clear its `MutableDisposable<MobileDiffView>` slot.
     */
    this.onDidDispose = this._onDidDispose.event;
    this.viewStore = this._register(new DisposableStore());
    this.disposed = false;
    /** Bumped on every body render so late-arriving `textFileService.read`
     *  promises know to drop their results when the user navigated away. */
    this.renderGeneration = 0;
    this.siblings = data.siblings && data.siblings.length > 0 ? data.siblings : [data.diff];
    const startIndex = data.index ?? this.siblings.indexOf(data.diff);
    this.currentIndex = startIndex >= 0 ? startIndex : 0;
    this.render(workbenchContainer);
    this.renderBodyForCurrent();
  }
  render(workbenchContainer) {
    const overlay = append(workbenchContainer, $119("div.mobile-overlay-view"));
    this.viewStore.add(addDisposableListener(overlay, EventType.CONTEXT_MENU, (e4) => e4.preventDefault()));
    this.viewStore.add(toDisposable(() => overlay.remove()));
    const header2 = append(overlay, $119("div.mobile-overlay-header"));
    const backBtn = append(header2, $119("button.mobile-overlay-back-btn", { type: "button" }));
    backBtn.setAttribute("aria-label", localize(3802, null));
    append(backBtn, $119("span")).classList.add(...ThemeIcon.asClassNameArray(Codicon.chevronLeft));
    this.viewStore.add(Gesture.addTarget(backBtn));
    this.viewStore.add(addDisposableListener(backBtn, EventType.CLICK, () => this.dispose()));
    this.viewStore.add(addDisposableListener(backBtn, EventType2.Tap, () => this.dispose()));
    const info = append(header2, $119("div.mobile-overlay-header-info.inline"));
    this.titleEl = append(info, $119("div.mobile-overlay-header-title"));
    this.subtitleEl = append(info, $119("div.mobile-overlay-header-subtitle"));
    const nav = append(header2, $119("div.mobile-diff-nav"));
    this.prevBtn = append(nav, $119("button.mobile-diff-nav-btn.prev", { type: "button" }));
    this.prevBtn.setAttribute("aria-label", localize(3807, null));
    append(this.prevBtn, $119("span")).classList.add(...ThemeIcon.asClassNameArray(Codicon.chevronUp));
    this.positionEl = append(nav, $119("span.mobile-diff-nav-position"));
    this.nextBtn = append(nav, $119("button.mobile-diff-nav-btn.next", { type: "button" }));
    this.nextBtn.setAttribute("aria-label", localize(3804, null));
    append(this.nextBtn, $119("span")).classList.add(...ThemeIcon.asClassNameArray(Codicon.chevronDown));
    this.viewStore.add(Gesture.addTarget(this.prevBtn));
    this.viewStore.add(Gesture.addTarget(this.nextBtn));
    const onPrev = () => this.navigate(-1);
    const onNext = () => this.navigate(1);
    this.viewStore.add(addDisposableListener(this.prevBtn, EventType.CLICK, onPrev));
    this.viewStore.add(addDisposableListener(this.prevBtn, EventType2.Tap, onPrev));
    this.viewStore.add(addDisposableListener(this.nextBtn, EventType.CLICK, onNext));
    this.viewStore.add(addDisposableListener(this.nextBtn, EventType2.Tap, onNext));
    nav.style.display = this.siblings.length > 1 ? "" : "none";
    const body = append(overlay, $119("div.mobile-overlay-body"));
    this.scrollWrapper = append(body, $119("div.mobile-overlay-scroll"));
    this.contentArea = append(this.scrollWrapper, $119("div.mobile-diff-output"));
    this.viewStore.add(this.attachSwipeNavigation(this.scrollWrapper));
  }
  attachSwipeNavigation(target) {
    const store = new DisposableStore();
    if (this.siblings.length <= 1) {
      return store;
    }
    let startX = 0;
    let startY = 0;
    let startTime = 0;
    let tracking = false;
    const onPointerDown = (e4) => {
      if (e4.pointerType !== "touch") {
        return;
      }
      tracking = true;
      startX = e4.clientX;
      startY = e4.clientY;
      startTime = Date.now();
    };
    const onPointerUp = (e4) => {
      if (!tracking) {
        return;
      }
      tracking = false;
      const dx = e4.clientX - startX;
      const dy = e4.clientY - startY;
      const dt = Date.now() - startTime;
      const absDx = Math.abs(dx);
      const absDy = Math.abs(dy);
      const viewportWidth = target.clientWidth;
      const minDistance = viewportWidth * 0.3;
      const velocity = absDx / Math.max(dt, 1);
      if (absDx <= absDy * 1.5) {
        return;
      }
      if (absDx < minDistance && velocity < 0.5) {
        return;
      }
      this.navigate(dx < 0 ? 1 : -1);
    };
    store.add(addDisposableListener(target, "pointerdown", onPointerDown));
    store.add(addDisposableListener(target, "pointerup", onPointerUp));
    store.add(addDisposableListener(target, "pointercancel", () => {
      tracking = false;
    }));
    return store;
  }
  navigate(delta2) {
    const next = this.currentIndex + delta2;
    if (next < 0 || next >= this.siblings.length) {
      return;
    }
    this.currentIndex = next;
    this.renderBodyForCurrent();
  }
  renderBodyForCurrent() {
    this.renderGeneration++;
    const diff4 = this.siblings[this.currentIndex];
    const fileNameUri = diff4.modifiedURI ?? diff4.originalURI;
    const fileName = fileNameUri ? basename2(fileNameUri) : "";
    this.titleEl.textContent = fileName;
    clearNode(this.subtitleEl);
    if (!diff4.identical) {
      if (diff4.added) {
        append(this.subtitleEl, $119("span.mobile-changes-row-added")).textContent = `+${diff4.added}`;
      }
      if (diff4.added && diff4.removed) {
        append(this.subtitleEl, document.createTextNode(" "));
      }
      if (diff4.removed) {
        append(this.subtitleEl, $119("span.mobile-changes-row-removed")).textContent = `-${diff4.removed}`;
      }
    }
    if (this.siblings.length > 1) {
      this.positionEl.textContent = localize(
        3806,
        null,
        this.currentIndex + 1,
        this.siblings.length
      );
      this.prevBtn.disabled = this.currentIndex === 0;
      this.nextBtn.disabled = this.currentIndex === this.siblings.length - 1;
      this.prevBtn.setAttribute("aria-disabled", String(this.prevBtn.disabled));
      this.nextBtn.setAttribute("aria-disabled", String(this.nextBtn.disabled));
    }
    this.scrollWrapper.scrollTop = 0;
    this.scrollWrapper.scrollLeft = 0;
    clearNode(this.contentArea);
    this.loadDiffContent(this.contentArea, diff4);
  }
  loadDiffContent(container2, diff4) {
    if (diff4.identical) {
      const empty = append(container2, $119("div.mobile-diff-empty-state"));
      empty.textContent = localize(3805, null);
      return;
    }
    const loadingEl = append(container2, $119("div.mobile-diff-empty-state"));
    loadingEl.textContent = localize(3803, null);
    const generation = this.renderGeneration;
    const languageId = this.resolveLanguageId(diff4);
    void this.loadAndRender(container2, diff4, languageId, generation);
  }
  async loadAndRender(container2, diff4, languageId, generation) {
    const [originalText, modifiedText] = await Promise.all([
      diff4.originalURI ? this.textFileService.read(diff4.originalURI, { acceptTextOnly: true }).then((m) => m.value).catch(() => "") : Promise.resolve(""),
      diff4.modifiedURI ? this.textFileService.read(diff4.modifiedURI, { acceptTextOnly: true }).then((m) => m.value).catch(() => "") : Promise.resolve("")
    ]);
    if (this.disposed || generation !== this.renderGeneration) {
      return;
    }
    const hunks = computeUnifiedDiff(originalText, modifiedText);
    if (hunks.length === 0) {
      clearNode(container2);
      const empty = append(container2, $119("div.mobile-diff-empty-state"));
      empty.textContent = localize(3805, null);
      return;
    }
    const [origLineHtml, modLineHtml] = await Promise.all([
      tokenizeFileLines(this.languageService, originalText, languageId),
      tokenizeFileLines(this.languageService, modifiedText, languageId)
    ]);
    const hasRealTokens = hasMultipleTokenClasses(origLineHtml) || hasMultipleTokenClasses(modLineHtml);
    const origLines = hasRealTokens ? origLineHtml : regexTokenizeLines(originalText, languageId);
    const modLines = hasRealTokens ? modLineHtml : regexTokenizeLines(modifiedText, languageId);
    if (this.disposed || generation !== this.renderGeneration) {
      return;
    }
    clearNode(container2);
    const colorMap = TokenizationRegistry2.getColorMap();
    if (colorMap && hasRealTokens) {
      const styleEl = document.createElement("style");
      styleEl.textContent = generateTokensCSSForColorMap(colorMap);
      container2.appendChild(styleEl);
    }
    this.renderHunks(container2, hunks, origLines, modLines);
  }
  resolveLanguageId(diff4) {
    const uri4 = diff4.modifiedURI ?? diff4.originalURI;
    if (!uri4) {
      return "plaintext";
    }
    const guessed = this.languageService.guessLanguageIdByFilepathOrFirstLine(uri4);
    if (guessed && guessed !== "unknown") {
      return guessed;
    }
    const name = basename2(uri4);
    const ext = name.includes(".") ? name.slice(name.lastIndexOf(".")).toLowerCase() : "";
    return EXTENSION_LANGUAGE_MAP[ext] ?? "plaintext";
  }
  renderHunks(container2, hunks, origLineHtml, modLineHtml) {
    for (const hunk of hunks) {
      const headerEl = append(container2, $119("div.mobile-diff-hunk-header"));
      headerEl.textContent = hunk.header;
      for (const line of hunk.lines) {
        const row = append(container2, $119("div.mobile-diff-line"));
        row.classList.add(line.type);
        const numEl = append(row, $119("span.mobile-diff-line-num"));
        numEl.textContent = line.lineNum !== void 0 ? String(line.lineNum) : "";
        const gutter = append(row, $119("span.mobile-diff-gutter"));
        gutter.textContent = line.type === "added" ? "+" : line.type === "removed" ? "-" : " ";
        const content = append(row, $119("span.mobile-diff-content"));
        if (line.lineNum !== void 0) {
          const source = line.type === "added" ? modLineHtml : origLineHtml;
          const html3 = source[line.lineNum - 1];
          if (html3 !== void 0) {
            content.innerHTML = html3;
          } else if (line.text) {
            content.textContent = line.text;
          }
        } else if (line.text) {
          content.textContent = line.text;
        }
      }
    }
  }
  dispose() {
    this.disposed = true;
    this._onDidDispose.fire();
    this.viewStore.dispose();
    super.dispose();
  }
};

async function tokenizeFileLines(languageService, text2, languageId) {
  if (!text2) {
    return [""];
  }
  const html3 = await tokenizeToString(languageService, text2, languageId);
  const inner = stripTokenizedWrapper(html3);
  return inner.split("<br/>");
}

function stripTokenizedWrapper(html3) {
  const openTag = '<div class="monaco-tokenized-source">';
  const closeTag = "</div>";
  if (html3.startsWith(openTag) && html3.endsWith(closeTag)) {
    return html3.slice(openTag.length, html3.length - closeTag.length);
  }
  return html3;
}

function hasMultipleTokenClasses(lines) {
  for (const line of lines) {
    if (line && /class="mtk[2-9]|class="mtk[1-9][0-9]/.test(line)) {
      return true;
    }
  }
  return false;
}

var LANG_FAMILY = {
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

var JS_KEYWORDS = /* @__PURE__ */ new Set([
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

var PY_KEYWORDS = /* @__PURE__ */ new Set([
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

function escapeHtml(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function buildSpan(kind, text2) {
  if (kind === "default" || !text2) {
    return escapeHtml(text2);
  }
  return `<span class="mobile-diff-tok-${kind}">${escapeHtml(text2)}</span>`;
}

function regexTokenizeLine(line, lang) {
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
        const keywords = lang === "python" ? PY_KEYWORDS : JS_KEYWORDS;
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
  return tokens.map((t2) => buildSpan(t2.kind, line.slice(t2.start, t2.end))).join("");
}

function regexTokenizeLines(text2, languageId) {
  if (!text2) {
    return [""];
  }
  const lang = LANG_FAMILY[languageId] ?? "generic";
  return text2.split(/\r?\n/).map((line) => regexTokenizeLine(line, lang));
}

var CONTEXT_LINES = 3;

function computeUnifiedDiff(original, modified) {
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
    if (lastSub && sub.origStart - lastSub.origEnd <= CONTEXT_LINES * 2) {
      last.subs.push(sub);
    } else {
      groups.push({ subs: [sub] });
    }
  }
  const hunks = [];
  for (const group2 of groups) {
    const first2 = group2.subs[0];
    const last = group2.subs[group2.subs.length - 1];
    const origLeading = Math.max(1, first2.origStart - CONTEXT_LINES);
    const modLeading = Math.max(1, first2.modStart - CONTEXT_LINES);
    const origTrailing = Math.min(origLines.length + 1, last.origEnd + CONTEXT_LINES);
    const modTrailing = Math.min(modLines.length + 1, last.modEnd + CONTEXT_LINES);
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

function openMobileDiffView(workbenchContainer, data, textFileService, languageService) {
  return new MobileDiffView(workbenchContainer, data, textFileService, languageService);
}
export { tokenizeFileLines, stripTokenizedWrapper, hasMultipleTokenClasses, escapeHtml, buildSpan, regexTokenizeLine, regexTokenizeLines, computeUnifiedDiff, openMobileDiffView, $119, EXTENSION_LANGUAGE_MAP, MOBILE_OPEN_DIFF_VIEW_COMMAND_ID, MobileDiffView, LANG_FAMILY, JS_KEYWORDS, PY_KEYWORDS, CONTEXT_LINES };
