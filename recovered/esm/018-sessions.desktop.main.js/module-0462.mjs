// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/base/common/htmlContent.ts
import { URI } from "./module-0032.mjs";
import { illegalArgument } from "./module-0004.mjs";
import { escapeIcons } from "./module-0461.mjs";
import { escapeRegExpCharacters } from "./module-0030.mjs";
import { isEqual2 } from "./module-0034.mjs";
import { Schemas, matchesSomeScheme } from "./module-0033.mjs";


// src/vs/base/common/htmlContent.ts
var MarkdownString = class _MarkdownString {
  static lift(dto) {
    const markdownString = new _MarkdownString(dto.value, dto);
    markdownString.uris = dto.uris;
    markdownString.baseUri = dto.baseUri ? URI.revive(dto.baseUri) : void 0;
    return markdownString;
  }
  constructor(value2 = "", isTrustedOrOptions = false) {
    this.value = value2;
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
  appendText(value2, newlineStyle = 0 /* Paragraph */) {
    this.value += escapeMarkdownSyntaxTokens(this.supportThemeIcons ? escapeIcons(value2) : value2).replace(/([ \t]+)/g, (_match, g1) => "&nbsp;".repeat(g1.length)).replace(/\>/gm, "\\>").replace(/\n/g, newlineStyle === 1 /* Break */ ? "\\\n" : "\n\n");
    return this;
  }
  appendMarkdown(value2) {
    this.value += value2;
    return this;
  }
  appendCodeblock(langId, code) {
    this.value += `
${appendEscapedMarkdownCodeBlockFence(code, langId)}
`;
    return this;
  }
  appendLink(target, label3, title) {
    this.value += "[";
    this.value += this._escape(label3, "]");
    this.value += "](";
    this.value += this._escape(String(target), ")");
    if (title) {
      this.value += ` "${this._escape(this._escape(title, '"'), ")")}"`;
    }
    this.value += ")";
    return this;
  }
  _escape(value2, ch) {
    const r2 = new RegExp(escapeRegExpCharacters(ch), "g");
    return value2.replace(r2, (match2, offset) => {
      if (value2.charAt(offset - 1) !== "\\") {
        return `\\${match2}`;
      } else {
        return match2;
      }
    });
  }
};

function isEmptyMarkdownString(oneOrMany) {
  if (isMarkdownString(oneOrMany)) {
    return !oneOrMany.value;
  } else if (Array.isArray(oneOrMany)) {
    return oneOrMany.every(isEmptyMarkdownString);
  } else {
    return true;
  }
}

function isMarkdownString(thing) {
  if (thing instanceof MarkdownString) {
    return true;
  } else if (thing && typeof thing === "object") {
    return typeof thing.value === "string" && (typeof thing.isTrusted === "boolean" || typeof thing.isTrusted === "object" || thing.isTrusted === void 0) && (typeof thing.supportThemeIcons === "boolean" || thing.supportThemeIcons === void 0) && (typeof thing.supportAlertSyntax === "boolean" || thing.supportAlertSyntax === void 0);
  }
  return false;
}

function markdownStringEqual(a, b) {
  if (a === b) {
    return true;
  } else if (!a || !b) {
    return false;
  } else {
    return a.value === b.value && a.isTrusted === b.isTrusted && a.supportThemeIcons === b.supportThemeIcons && a.supportHtml === b.supportHtml && a.supportAlertSyntax === b.supportAlertSyntax && (a.baseUri === b.baseUri || !!a.baseUri && !!b.baseUri && isEqual2(URI.from(a.baseUri), URI.from(b.baseUri)));
  }
}

function escapeMarkdownSyntaxTokens(text2) {
  return text2.replace(/[\\`*_{}[\]()#+!~]/g, "\\$&").replace(/^([ \t]*)-/gm, "$1\\-");
}

function escapeMarkdownLinkLabel(text2) {
  return text2.replace(/[\\\]]/g, "\\$&");
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

function appendEscapedMarkdownInlineCode(text2) {
  const longestBacktickRun = Math.max(0, ...(text2.match(/`+/g) ?? []).map((m) => m.length));
  const fence = "`".repeat(longestBacktickRun + 1);
  const needsSpace = text2.startsWith("`") || text2.endsWith("`");
  const content = needsSpace ? ` ${text2} ` : text2;
  return `${fence}${content}${fence}`;
}

function escapeDoubleQuotes(input) {
  return input.replace(/"/g, "&quot;");
}

function removeMarkdownEscapes(text2) {
  if (!text2) {
    return text2;
  }
  return text2.replace(/\\([\\`*_{}[\]()#+\-.!~])/g, "$1");
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
    const width2 = widthFromParams ? widthFromParams[1] : "";
    const widthIsFinite = isFinite(parseInt(width2));
    const heightIsFinite = isFinite(parseInt(height));
    if (widthIsFinite) {
      dimensions.push(`width="${width2}"`);
    }
    if (heightIsFinite) {
      dimensions.push(`height="${height}"`);
    }
  }
  return { href, dimensions };
}

function createMarkdownLink(text2, href, title, escapeTokens = true) {
  return `[${escapeTokens ? escapeMarkdownSyntaxTokens(text2) : text2}](${href}${title ? ` "${escapeMarkdownSyntaxTokens(title)}"` : ""})`;
}

function createMarkdownCommandLink(command4, escapeTokens = true) {
  const uri4 = createCommandUri(command4.id, ...command4.arguments || []).toString();
  return createMarkdownLink(command4.text, uri4, command4.tooltip, escapeTokens);
}

function createCommandUri(commandId, ...commandArgs) {
  return URI.from({
    scheme: Schemas.command,
    path: commandId,
    query: commandArgs.length ? encodeURIComponent(JSON.stringify(commandArgs)) : void 0
  });
}

var placeholderAuthority = /^https?:\/\/_[^/?#]*_(?:[/?#]|$)/i;

var absolutePath = /^(?:[/\\]|[a-z]:[/\\])/i;

function isPortableLinkTarget(target) {
  const trimmed = target.trim();
  return matchesSomeScheme(trimmed, Schemas.http, Schemas.https, Schemas.mailto) && !placeholderAuthority.test(trimmed);
}

function isPortableMarkdownTarget(target) {
  const trimmed = target.trim();
  return isPortableLinkTarget(trimmed) || !!trimmed && !/^[a-z][a-z0-9.+-]*:/i.test(trimmed) && !absolutePath.test(trimmed);
}
export { isEmptyMarkdownString, isMarkdownString, markdownStringEqual, escapeMarkdownSyntaxTokens, escapeMarkdownLinkLabel, appendEscapedMarkdownCodeBlockFence, appendEscapedMarkdownInlineCode, escapeDoubleQuotes, removeMarkdownEscapes, parseHrefAndDimensions, createMarkdownLink, createMarkdownCommandLink, createCommandUri, isPortableLinkTarget, isPortableMarkdownTarget, MarkdownString, placeholderAuthority, absolutePath };
