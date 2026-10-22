// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/node/extensionHostProcess.js
// Original module marker: src/vs/base/common/htmlContent.ts
import { URI } from "./module-0025.mjs";
import { illegalArgument } from "./module-0003.mjs";
import { escapeIcons } from "./module-0085.mjs";
import { escapeRegExpCharacters } from "./module-0023.mjs";


// src/vs/base/common/htmlContent.ts
var MarkdownString = class _MarkdownString {
  static lift(dto) {
    const markdownString = new _MarkdownString(dto.value, dto);
    markdownString.uris = dto.uris;
    markdownString.baseUri = dto.baseUri ? URI.revive(dto.baseUri) : void 0;
    return markdownString;
  }
  constructor(value = "", isTrustedOrOptions = false) {
    this.value = value;
    if (typeof this.value !== "string") {
      throw illegalArgument("value");
    }
    if (typeof isTrustedOrOptions === "boolean") {
      this.isTrusted = isTrustedOrOptions;
      this.supportThemeIcons = false;
      this.supportHtml = false;
      this.supportAlertSyntax = false;
    } else {
      this.isTrusted = isTrustedOrOptions.isTrusted ?? void 0;
      this.supportThemeIcons = isTrustedOrOptions.supportThemeIcons ?? false;
      this.supportHtml = isTrustedOrOptions.supportHtml ?? false;
      this.supportAlertSyntax = isTrustedOrOptions.supportAlertSyntax ?? false;
    }
  }
  appendText(value, newlineStyle = 0 /* Paragraph */) {
    this.value += escapeMarkdownSyntaxTokens(this.supportThemeIcons ? escapeIcons(value) : value).replace(/([ \t]+)/g, (_match, g1) => "&nbsp;".repeat(g1.length)).replace(/\>/gm, "\\>").replace(/\n/g, newlineStyle === 1 /* Break */ ? "\\\n" : "\n\n");
    return this;
  }
  appendMarkdown(value) {
    this.value += value;
    return this;
  }
  appendCodeblock(langId, code) {
    this.value += `
${appendEscapedMarkdownCodeBlockFence(code, langId)}
`;
    return this;
  }
  appendLink(target, label, title) {
    this.value += "[";
    this.value += this._escape(label, "]");
    this.value += "](";
    this.value += this._escape(String(target), ")");
    if (title) {
      this.value += ` "${this._escape(this._escape(title, '"'), ")")}"`;
    }
    this.value += ")";
    return this;
  }
  _escape(value, ch) {
    const r2 = new RegExp(escapeRegExpCharacters(ch), "g");
    return value.replace(r2, (match2, offset) => {
      if (value.charAt(offset - 1) !== "\\") {
        return `\\${match2}`;
      } else {
        return match2;
      }
    });
  }
};

function isMarkdownString(thing) {
  if (thing instanceof MarkdownString) {
    return true;
  } else if (thing && typeof thing === "object") {
    return typeof thing.value === "string" && (typeof thing.isTrusted === "boolean" || typeof thing.isTrusted === "object" || thing.isTrusted === void 0) && (typeof thing.supportThemeIcons === "boolean" || thing.supportThemeIcons === void 0) && (typeof thing.supportAlertSyntax === "boolean" || thing.supportAlertSyntax === void 0);
  }
  return false;
}

function escapeMarkdownSyntaxTokens(text) {
  return text.replace(/[\\`*_{}[\]()#+!~]/g, "\\$&").replace(/^([ \t]*)-/gm, "$1\\-");
}

function appendEscapedMarkdownCodeBlockFence(code, langId) {
  const longestFenceLength = code.match(/^`+/gm)?.reduce((a, b) => a.length > b.length ? a : b).length ?? 0;
  const desiredFenceLength = longestFenceLength >= 3 ? longestFenceLength + 1 : 3;
  return [
    `${"`".repeat(desiredFenceLength)}${langId}`,
    code,
    `${"`".repeat(desiredFenceLength)}`
  ].join("\n");
}

function appendEscapedMarkdownInlineCode(text) {
  const longestBacktickRun = Math.max(0, ...(text.match(/`+/g) ?? []).map((m) => m.length));
  const fence = "`".repeat(longestBacktickRun + 1);
  const needsSpace = text.startsWith("`") || text.endsWith("`");
  const content = needsSpace ? ` ${text} ` : text;
  return `${fence}${content}${fence}`;
}

function parseHrefAndDimensions(href) {
  const dimensions = [];
  const splitted = href.split("|").map((s) => s.trim());
  href = splitted[0];
  const parameters = splitted[1];
  if (parameters) {
    const heightFromParams = /height=(\d+)/.exec(parameters);
    const widthFromParams = /width=(\d+)/.exec(parameters);
    const height = heightFromParams ? heightFromParams[1] : "";
    const width = widthFromParams ? widthFromParams[1] : "";
    const widthIsFinite = isFinite(parseInt(width));
    const heightIsFinite = isFinite(parseInt(height));
    if (widthIsFinite) {
      dimensions.push(`width="${width}"`);
    }
    if (heightIsFinite) {
      dimensions.push(`height="${height}"`);
    }
  }
  return { href, dimensions };
}
export { isMarkdownString, escapeMarkdownSyntaxTokens, appendEscapedMarkdownCodeBlockFence, appendEscapedMarkdownInlineCode, parseHrefAndDimensions, MarkdownString };
