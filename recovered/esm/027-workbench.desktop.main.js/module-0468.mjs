// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/base/browser/markdownRenderer.ts
import { URI } from "./module-0032.mjs";
import { FileAccess, Schemas } from "./module-0033.mjs";
import { escapeDoubleQuotes, isPortableLinkTarget, parseHrefAndDimensions, removeMarkdownEscapes } from "./module-0462.mjs";
import { renderIcon, renderLabelWithIcons } from "./module-0467.mjs";
import { DisposableStore } from "./module-0012.mjs";
import { Marked, _Lexer, _Renderer, lexer, parse3 } from "./module-0464.mjs";
import { basicMarkupHtmlTags, convertTagToPlaintext, safeSetInnerHtml, sanitizeHtml } from "./module-0466.mjs";
import { $, addDisposableListener, getWindow, isHTMLElement, reset } from "./module-0075.mjs";
import { StandardMouseEvent } from "./module-0024.mjs";
import { StandardKeyboardEvent } from "./module-0022.mjs";
import { defaultGenerator } from "./module-0463.mjs";
import { escape } from "./module-0030.mjs";
import { markdownEscapeEscapedIcons } from "./module-0461.mjs";
import { onUnexpectedError } from "./module-0004.mjs";
import { parse2 } from "./module-0265.mjs";
import { cloneAndChange } from "./module-0098.mjs";
import { basename2, dirname2, resolvePath } from "./module-0034.mjs";
import { basename } from "./module-0026.mjs";


// src/vs/base/browser/markdownRenderer.ts
function getLinkTitle(href) {
  try {
    const parsed = URI.parse(href);
    if (parsed.scheme === Schemas.file) {
      const path = parsed.fsPath;
      const fragment = parsed.fragment;
      return escapeDoubleQuotes(fragment ? `${path}#${fragment}` : path);
    }
  } catch {
  }
  return "";
}

function renderImage({ href, title, text: text2 }, transformUri2) {
  let dimensions = [];
  let attributes = [];
  if (href) {
    ({ href, dimensions } = parseHrefAndDimensions(href));
    href = transformUri2?.(href) ?? href;
    attributes.push(`src="${escapeDoubleQuotes(href)}"`);
  }
  if (text2) {
    attributes.push(`alt="${escapeDoubleQuotes(text2)}"`);
  }
  if (title) {
    attributes.push(`title="${escapeDoubleQuotes(title)}"`);
  }
  if (dimensions.length) {
    attributes = attributes.concat(dimensions);
  }
  return "<img " + attributes.join(" ") + ">";
}

var defaultMarkedRenderers = Object.freeze({
  image: renderImage,
  paragraph({ tokens }) {
    return `<p>${this.parser.parseInline(tokens)}</p>`;
  },
  link({ href, title, tokens }) {
    let text2 = this.parser.parseInline(tokens);
    if (typeof href !== "string") {
      return "";
    }
    if (href === text2) {
      text2 = removeMarkdownEscapes(text2);
    }
    title = typeof title === "string" ? escapeDoubleQuotes(removeMarkdownEscapes(title)) : "";
    href = removeMarkdownEscapes(href);
    if (!title && href.startsWith(`${Schemas.file}:`)) {
      title = getLinkTitle(href);
    }
    const isCommandUri = href.startsWith(`${Schemas.command}:`);
    href = href.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
    const effectiveTitle = title || (isCommandUri ? "" : href);
    return `<a href="${href}" title="${effectiveTitle}" draggable="false">${text2}</a>`;
  }
});

function createAlertBlockquoteRenderer(fallbackRenderer) {
  return function(token) {
    const { tokens } = token;
    const firstToken = tokens[0];
    if (firstToken?.type !== "paragraph") {
      return fallbackRenderer.call(this, token);
    }
    const paragraphTokens = firstToken.tokens;
    if (!paragraphTokens || paragraphTokens.length === 0) {
      return fallbackRenderer.call(this, token);
    }
    const firstTextToken = paragraphTokens[0];
    if (firstTextToken?.type !== "text") {
      return fallbackRenderer.call(this, token);
    }
    const pattern = /^\s*\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*?\n*/i;
    const match2 = firstTextToken.raw.match(pattern);
    if (!match2) {
      return fallbackRenderer.call(this, token);
    }
    firstTextToken.raw = firstTextToken.raw.replace(pattern, "");
    firstTextToken.text = firstTextToken.text.replace(pattern, "");
    const alertIcons = {
      "note": "info",
      "tip": "light-bulb",
      "important": "comment",
      "warning": "alert",
      "caution": "stop"
    };
    const type = match2[1];
    const typeCapitalized = type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
    const severity = type.toLowerCase();
    const iconHtml = renderIcon({ id: alertIcons[severity] }).outerHTML;
    const content2 = this.parser.parse(tokens);
    return `<blockquote data-severity="${severity}"><p><span>${iconHtml}${typeCapitalized}</span>${content2.substring(3)}</blockquote>
`;
  };
}

function renderMarkdown(markdown, options3 = {}, target) {
  const disposables = new DisposableStore();
  let isDisposed = false;
  const markedInstance2 = new Marked(...options3.markedExtensions ?? []);
  const { renderer, codeBlocks, syncCodeBlocks } = createMarkdownRenderer(markedInstance2, options3, markdown);
  const value2 = preprocessMarkdownString(markdown);
  let renderedMarkdown;
  if (options3.fillInIncompleteTokens) {
    const opts = {
      ...markedInstance2.defaults,
      ...options3.markedOptions,
      renderer
    };
    const tokens = markedInstance2.lexer(value2, opts);
    const newTokens = fillInIncompleteTokens(tokens);
    renderedMarkdown = markedInstance2.parser(newTokens, opts);
  } else {
    renderedMarkdown = markedInstance2.parse(value2, { ...options3?.markedOptions, renderer, async: false });
  }
  if (markdown.supportThemeIcons) {
    const elements = renderLabelWithIcons(renderedMarkdown);
    renderedMarkdown = elements.map((e) => typeof e === "string" ? e : e.outerHTML).join("");
  }
  const renderedContent = document.createElement("div");
  const sanitizerConfig = getDomSanitizerConfig(markdown, options3.sanitizerConfig ?? {});
  safeSetInnerHtml(renderedContent, renderedMarkdown, sanitizerConfig);
  rewriteRenderedLinks(markdown, options3, renderedContent);
  let outElement;
  if (target) {
    outElement = target;
    reset(target, ...renderedContent.childNodes);
  } else {
    outElement = renderedContent;
  }
  if (codeBlocks.length > 0) {
    Promise.all(codeBlocks).then((tuples) => {
      if (isDisposed) {
        return;
      }
      const renderedElements = new Map(tuples);
      const placeholderElements = outElement.querySelectorAll(`div[data-code]`);
      for (const placeholderElement of placeholderElements) {
        const renderedElement = renderedElements.get(placeholderElement.dataset["code"] ?? "");
        if (renderedElement) {
          reset(placeholderElement, renderedElement);
        }
      }
      options3.asyncRenderCallback?.();
    });
  } else if (syncCodeBlocks.length > 0) {
    const renderedElements = new Map(syncCodeBlocks);
    const placeholderElements = outElement.querySelectorAll(`div[data-code]`);
    for (const placeholderElement of placeholderElements) {
      const renderedElement = renderedElements.get(placeholderElement.dataset["code"] ?? "");
      if (renderedElement) {
        reset(placeholderElement, renderedElement);
      }
    }
  }
  if (options3.asyncRenderCallback) {
    for (const img of outElement.getElementsByTagName("img")) {
      const listener = disposables.add(addDisposableListener(img, "load", () => {
        listener.dispose();
        options3.asyncRenderCallback();
      }));
    }
  }
  if (options3.actionHandler) {
    const clickCb = (e) => {
      const mouseEvent = new StandardMouseEvent(getWindow(outElement), e);
      if (!mouseEvent.leftButton && !mouseEvent.middleButton) {
        return;
      }
      activateLink(markdown, options3, mouseEvent);
    };
    disposables.add(addDisposableListener(outElement, "click", clickCb));
    disposables.add(addDisposableListener(outElement, "auxclick", clickCb));
    disposables.add(addDisposableListener(outElement, "keydown", (e) => {
      const keyboardEvent = new StandardKeyboardEvent(e);
      if (!keyboardEvent.equals(10 /* Space */) && !keyboardEvent.equals(3 /* Enter */)) {
        return;
      }
      activateLink(markdown, options3, keyboardEvent);
    }));
  }
  for (const input of [...outElement.getElementsByTagName("input")]) {
    if (input.attributes.getNamedItem("type")?.value === "checkbox") {
      input.setAttribute("disabled", "");
    } else {
      if (options3.sanitizerConfig?.replaceWithPlaintext) {
        const replacement = convertTagToPlaintext(input);
        if (replacement) {
          input.parentElement?.replaceChild(replacement, input);
        } else {
          input.remove();
        }
      } else {
        input.remove();
      }
    }
  }
  return {
    element: outElement,
    dispose: () => {
      isDisposed = true;
      disposables.dispose();
    }
  };
}

function rewriteRenderedLinks(markdown, options3, root) {
  for (const el of root.querySelectorAll("img, audio, video, source")) {
    const src = el.getAttribute("src");
    if (src) {
      let href = src;
      try {
        if (markdown.baseUri) {
          href = resolveWithBaseUri(URI.from(markdown.baseUri), href);
        }
      } catch (err) {
      }
      el.setAttribute("src", massageHref(markdown, href, true));
      if (options3.sanitizerConfig?.remoteImageIsAllowed) {
        const uri5 = URI.parse(href);
        if (uri5.scheme !== Schemas.file && uri5.scheme !== Schemas.data && !options3.sanitizerConfig.remoteImageIsAllowed(uri5)) {
          el.replaceWith($("", void 0, el.outerHTML));
        }
      }
    }
  }
  for (const el of root.querySelectorAll("a")) {
    const href = el.getAttribute("href");
    el.setAttribute("href", "");
    if (!href || /^data:|javascript:/i.test(href) || /^command:/i.test(href) && !markdown.isTrusted || /^command:(\/\/\/)?_workbench\.downloadResource/i.test(href)) {
      el.replaceWith(...el.childNodes);
    } else {
      let resolvedHref = massageHref(markdown, href, false);
      if (markdown.baseUri) {
        resolvedHref = resolveWithBaseUri(URI.from(markdown.baseUri), href);
      }
      el.dataset.href = resolvedHref;
      if (options3.actionHandler && isPortableLinkTarget(resolvedHref)) {
        el.setAttribute("href", resolvedHref);
      }
    }
  }
}

function createMarkdownRenderer(marked2, options3, markdown) {
  const renderer = new marked2.Renderer(options3.markedOptions);
  renderer.image = (token) => renderImage(token, (href) => options3.transformUri?.(href, "image") ?? href);
  renderer.link = (token) => defaultMarkedRenderers.link.call(renderer, {
    ...token,
    href: options3.transformUri?.(token.href, "link") ?? token.href
  });
  renderer.paragraph = defaultMarkedRenderers.paragraph;
  if (markdown.supportAlertSyntax) {
    renderer.blockquote = createAlertBlockquoteRenderer(renderer.blockquote);
  }
  const codeBlocks = [];
  const syncCodeBlocks = [];
  if (options3.codeBlockRendererSync) {
    renderer.code = ({ text: text2, lang, raw }) => {
      const id2 = defaultGenerator.nextId();
      const value2 = options3.codeBlockRendererSync(postProcessCodeBlockLanguageId(lang), text2, raw);
      syncCodeBlocks.push([id2, value2]);
      return `<div class="code" data-code="${id2}">${escape(text2)}</div>`;
    };
  } else if (options3.codeBlockRenderer) {
    renderer.code = ({ text: text2, lang }) => {
      const id2 = defaultGenerator.nextId();
      const value2 = options3.codeBlockRenderer(postProcessCodeBlockLanguageId(lang), text2);
      codeBlocks.push(value2.then((element) => [id2, element]));
      return `<div class="code" data-code="${id2}">${escape(text2)}</div>`;
    };
  }
  if (!markdown.supportHtml) {
    renderer.html = ({ text: text2 }) => {
      if (options3.sanitizerConfig?.replaceWithPlaintext) {
        return escape(text2);
      }
      const match2 = markdown.isTrusted ? text2.match(/^(<span[^>]+>)|(<\/\s*span>)$/) : void 0;
      return match2 ? text2 : "";
    };
  }
  return { renderer, codeBlocks, syncCodeBlocks };
}

function preprocessMarkdownString(markdown) {
  let value2 = markdown.value;
  if (value2.length > 1e5) {
    value2 = `${value2.substr(0, 1e5)}\u2026`;
  }
  if (markdown.supportThemeIcons) {
    value2 = markdownEscapeEscapedIcons(value2);
  }
  return value2;
}

function activateLink(mdStr, options3, event) {
  const target = event.target.closest("a[data-href]");
  if (!isHTMLElement(target)) {
    return;
  }
  try {
    let href = target.dataset["href"];
    if (href) {
      if (mdStr.baseUri) {
        href = resolveWithBaseUri(URI.from(mdStr.baseUri), href);
      }
      options3.actionHandler?.(href, mdStr);
    }
  } catch (err) {
    onUnexpectedError(err);
  } finally {
    event.preventDefault();
    event.stopPropagation();
  }
}

function uriMassage(markdown, part) {
  let data;
  try {
    data = parse2(decodeURIComponent(part));
  } catch (e) {
  }
  if (!data) {
    return part;
  }
  data = cloneAndChange(data, (value2) => {
    if (markdown.uris && markdown.uris[value2]) {
      return URI.revive(markdown.uris[value2]);
    } else {
      return void 0;
    }
  });
  return encodeURIComponent(JSON.stringify(data));
}

function massageHref(markdown, href, isDomUri) {
  const data = markdown.uris && markdown.uris[href];
  let uri5 = URI.revive(data);
  if (isDomUri) {
    if (href.startsWith(Schemas.data + ":")) {
      return href;
    }
    if (!uri5) {
      uri5 = URI.parse(href);
    }
    return FileAccess.uriToBrowserUri(uri5).toString(true);
  }
  if (!uri5) {
    return href;
  }
  if (URI.parse(href).toString() === uri5.toString()) {
    return href;
  }
  if (uri5.query) {
    uri5 = uri5.with({ query: uriMassage(markdown, uri5.query) });
  }
  return uri5.toString();
}

function postProcessCodeBlockLanguageId(lang) {
  if (!lang) {
    return "";
  }
  const parts = lang.split(/[\s+|:|,|\{|\?]/, 1);
  if (parts.length) {
    return parts[0];
  }
  return lang;
}

function resolveWithBaseUri(baseUri, href) {
  const hasScheme = /^\w[\w\d+.-]*:/.test(href);
  if (hasScheme) {
    return href;
  }
  if (baseUri.path.endsWith("/")) {
    return resolvePath(baseUri, href).toString();
  } else {
    return resolvePath(dirname2(baseUri), href).toString();
  }
}

function sanitizeRenderedMarkdown(renderedMarkdown, originalMdStrConfig, options3 = {}) {
  const sanitizerConfig = getDomSanitizerConfig(originalMdStrConfig, options3);
  return sanitizeHtml(renderedMarkdown, sanitizerConfig);
}

var allowedMarkdownHtmlTags = Object.freeze([
  ...basicMarkupHtmlTags,
  "input"
  // Allow inputs for rendering checkboxes. Other types of inputs are removed and the inputs are always disabled
]);

var allowedMarkdownHtmlAttributes = Object.freeze([
  "align",
  "autoplay",
  "alt",
  "colspan",
  "controls",
  "draggable",
  "height",
  "href",
  "loop",
  "muted",
  "playsinline",
  "poster",
  "rowspan",
  "src",
  "target",
  "title",
  "type",
  "width",
  "start",
  // Input (For disabled inputs)
  "checked",
  "disabled",
  "value",
  // Custom markdown attributes
  "data-code",
  "data-href",
  "data-severity",
  // Only allow very specific styles
  {
    attributeName: "style",
    shouldKeep: (element, data) => {
      if (element.tagName === "SPAN") {
        if (data.attrName === "style") {
          return /^(color\:(#[0-9a-fA-F]+|var\(--vscode(-[a-zA-Z0-9]+)+\));)?(background-color\:(#[0-9a-fA-F]+|var\(--vscode(-[a-zA-Z0-9]+)+\));)?(border-radius:[0-9]+px;)?$/.test(data.attrValue);
        }
      }
      return false;
    }
  },
  // Only allow codicons for classes
  {
    attributeName: "class",
    shouldKeep: (element, data) => {
      if (element.tagName === "SPAN") {
        if (data.attrName === "class") {
          return /^codicon codicon-[a-z\-]+( codicon-modifier-[a-z\-]+)?$/.test(data.attrValue);
        }
      }
      return false;
    }
  }
]);

function getDomSanitizerConfig(mdStrConfig, options3) {
  const isTrusted = mdStrConfig.isTrusted ?? false;
  const allowedLinkSchemes = [
    Schemas.http,
    Schemas.https,
    Schemas.mailto,
    Schemas.file,
    Schemas.vscodeFileResource,
    Schemas.vscodeRemote,
    Schemas.vscodeRemoteResource,
    Schemas.vscodeNotebookCell,
    // For links that are handled entirely by the action handler
    Schemas.internal
  ];
  if (isTrusted) {
    allowedLinkSchemes.push(Schemas.command);
  }
  if (options3.allowedLinkSchemes?.augment) {
    allowedLinkSchemes.push(...options3.allowedLinkSchemes.augment);
  }
  return {
    // allowedTags should included everything that markdown renders to.
    // Since we have our own sanitize function for marked, it's possible we missed some tag so let dompurify make sure.
    // HTML tags that can result from markdown are from reading https://spec.commonmark.org/0.29/
    // HTML table tags that can result from markdown are from https://github.github.com/gfm/#tables-extension-
    allowedTags: {
      override: options3.allowedTags?.override ?? allowedMarkdownHtmlTags
    },
    allowedAttributes: {
      override: options3.allowedAttributes?.override ?? allowedMarkdownHtmlAttributes
    },
    allowedLinkProtocols: {
      override: allowedLinkSchemes
    },
    allowRelativeLinkPaths: !!mdStrConfig.baseUri,
    allowedMediaProtocols: {
      override: [
        Schemas.http,
        Schemas.https,
        Schemas.data,
        Schemas.file,
        Schemas.vscodeFileResource,
        Schemas.vscodeRemote,
        Schemas.vscodeRemoteResource
      ]
    },
    allowRelativeMediaPaths: !!mdStrConfig.baseUri,
    replaceWithPlaintext: options3.replaceWithPlaintext
  };
}

function renderAsPlaintext(str, options3) {
  if (typeof str === "string") {
    return str;
  }
  let value2 = str.value ?? "";
  if (value2.length > 1e5) {
    value2 = `${value2.substr(0, 1e5)}\u2026`;
  }
  const renderer = createPlainTextRenderer();
  if (options3?.includeCodeBlocksFences) {
    renderer.code = codeBlockFences;
  }
  if (options3?.useLinkFormatter) {
    renderer.link = linkFormatter;
  }
  if (options3?.omitMarkdownSyntax) {
    renderer.listitem = parsedListItem;
    renderer.text = parsedText;
  }
  const html3 = parse3(value2, { async: false, renderer });
  return sanitizeRenderedMarkdown(html3, { isTrusted: false }, {}).toString().replace(/&(#\d+|[a-zA-Z]+);/g, (m) => unescapeInfo.get(m) ?? m).trim();
}

var unescapeInfo = /* @__PURE__ */ new Map([
  ["&quot;", '"'],
  ["&nbsp;", " "],
  ["&amp;", "&"],
  ["&#39;", "'"],
  ["&lt;", "<"],
  ["&gt;", ">"]
]);

function createPlainTextRenderer() {
  const renderer = new _Renderer();
  renderer.code = ({ text: text2 }) => {
    return escape(text2);
  };
  renderer.blockquote = ({ text: text2 }) => {
    return text2 + "\n";
  };
  renderer.html = (_) => {
    return "";
  };
  renderer.heading = function({ tokens }) {
    return this.parser.parseInline(tokens) + "\n";
  };
  renderer.hr = () => {
    return "";
  };
  renderer.list = function({ items }) {
    return items.map((x) => this.listitem(x)).join("\n") + "\n";
  };
  renderer.listitem = ({ text: text2 }) => {
    return text2 + "\n";
  };
  renderer.paragraph = function({ tokens }) {
    return this.parser.parseInline(tokens) + "\n";
  };
  renderer.table = function({ header: header2, rows }) {
    return header2.map((cell) => this.tablecell(cell)).join(" ") + "\n" + rows.map((cells) => cells.map((cell) => this.tablecell(cell)).join(" ")).join("\n") + "\n";
  };
  renderer.tablerow = ({ text: text2 }) => {
    return text2;
  };
  renderer.tablecell = function({ tokens }) {
    return this.parser.parseInline(tokens);
  };
  renderer.strong = ({ text: text2 }) => {
    return text2;
  };
  renderer.em = ({ text: text2 }) => {
    return text2;
  };
  renderer.codespan = ({ text: text2 }) => {
    return text2;
  };
  renderer.br = (_) => {
    return "\n";
  };
  renderer.del = ({ text: text2 }) => {
    return text2;
  };
  renderer.image = (_) => {
    return "";
  };
  renderer.text = ({ text: text2 }) => {
    return text2;
  };
  renderer.link = ({ text: text2 }) => {
    return text2;
  };
  return renderer;
}

var codeBlockFences = ({ text: text2 }) => {
  return `
\`\`\`
${escape(text2)}
\`\`\`
`;
};

var linkFormatter = ({ text: text2, href }) => {
  try {
    if (href) {
      const uri5 = URI.parse(href);
      return text2.trim() || basename2(uri5);
    }
  } catch (e) {
    return text2.trim() || basename(href);
  }
  return text2;
};

var parsedListItem = function({ tokens }) {
  return this.parser.parse(tokens, true);
};

var parsedText = function(token) {
  return token.tokens ? this.parser.parseInline(token.tokens) : token.text;
};

function mergeRawTokenText(tokens) {
  let mergedTokenText = "";
  tokens.forEach((token) => {
    mergedTokenText += token.raw;
  });
  return mergedTokenText;
}

function completeSingleLinePattern(token) {
  if (!token.tokens) {
    return void 0;
  }
  for (let i2 = token.tokens.length - 1; i2 >= 0; i2--) {
    const subtoken = token.tokens[i2];
    if (subtoken.type === "text") {
      const lines = subtoken.raw.split("\n");
      const lastLine = lines[lines.length - 1];
      if (
        // Text with start of link target
        hasLinkTextAndStartOfLinkTarget(lastLine) || // This token doesn't have the link text, eg if it contains other markdown constructs that are in other subtokens.
        // But some preceding token does have an unbalanced [ at least
        hasStartOfLinkTargetAndNoLinkText(lastLine) && token.tokens.slice(0, i2).some((t2) => t2.type === "text" && t2.raw.match(/\[[^\]]*$/))
      ) {
        const nextTwoSubTokens = token.tokens.slice(i2 + 1);
        if (
          // If the link was parsed as a link, then look for a link token and a text token with a quote
          nextTwoSubTokens[0]?.type === "link" && nextTwoSubTokens[1]?.type === "text" && nextTwoSubTokens[1].raw.match(/^ *"[^"]*$/) || // And if the link was not parsed as a link (eg command link), just look for a single quote in this token
          lastLine.match(/^[^"]* +"[^"]*$/)
        ) {
          return completeLinkTargetArg(token);
        }
        return completeLinkTarget(token);
      } else if (lastLine.includes("`")) {
        return completeCodespan(token);
      } else if (lastLine.includes("**")) {
        return completeDoublestar(token);
      } else if (lastLine.match(/\*\w/)) {
        return completeStar(token);
      } else if (lastLine.match(/(^|\s)__\w/)) {
        return completeDoubleUnderscore(token);
      } else if (lastLine.match(/(^|\s)_\w/)) {
        return completeUnderscore(token);
      } else if (lastLine.match(/(^|\s)\[\w*[^\]]*$/)) {
        return completeLinkText(token);
      }
    }
  }
  return void 0;
}

function hasLinkTextAndStartOfLinkTarget(str) {
  return !!str.match(/(?:^|[\s(*_~])\[.*\]\(\w*/);
}

function hasStartOfLinkTargetAndNoLinkText(str) {
  return !!str.match(/^[^\[]*\]\([^\)]*$/);
}

function completeBlockquotePattern(blockquote2, links) {
  let lastInterestingIndex = blockquote2.tokens.length - 1;
  while (lastInterestingIndex >= 0 && blockquote2.tokens[lastInterestingIndex].type === "space") {
    lastInterestingIndex--;
  }
  const lastToken = blockquote2.tokens[lastInterestingIndex];
  if (lastToken?.type !== "paragraph") {
    return void 0;
  }
  const completedToken = completeSingleLinePattern(lastToken);
  if (!completedToken) {
    return void 0;
  }
  const completion = completedToken.raw.slice(lastToken.raw.trimEnd().length);
  const trailingQuoteOnlyLines = blockquote2.raw.match(/(?:\n[ \t]*>[ \t]*(?=\n|$))+\n?$/)?.[0] ?? "";
  const insertionIndex = blockquote2.raw.length - trailingQuoteOnlyLines.length;
  const completedRaw = blockquote2.raw.slice(0, insertionIndex) + completion + trailingQuoteOnlyLines;
  const lexer2 = new _Lexer();
  lexer2.tokens.links = links;
  const completedBlockquote = lexer2.lex(completedRaw)[0];
  if (completedBlockquote.type === "blockquote") {
    return completedBlockquote;
  }
  return void 0;
}

function completeListItemPattern(list2) {
  const lastListItem = list2.items[list2.items.length - 1];
  const lastListSubToken = lastListItem.tokens ? lastListItem.tokens[lastListItem.tokens.length - 1] : void 0;
  const listEndsInHeading = (list3) => {
    const lastItem = list3.items.at(-1);
    const lastToken = lastItem?.tokens.at(-1);
    return lastToken?.type === "heading" || lastToken?.type === "list" && listEndsInHeading(lastToken);
  };
  let newToken;
  if (lastListSubToken?.type === "text" && !("inRawBlock" in lastListItem)) {
    newToken = completeSingleLinePattern(lastListSubToken);
  } else if (listEndsInHeading(list2)) {
    const newList2 = lexer(list2.raw.trim() + " &nbsp;")[0];
    if (newList2.type !== "list") {
      return;
    }
    return newList2;
  }
  if (!newToken || newToken.type !== "paragraph") {
    return;
  }
  const previousListItemsText = mergeRawTokenText(list2.items.slice(0, -1));
  const lastListItemLead = lastListItem.raw.match(/^(\s*(-|\d+\.|\*) +)/)?.[0];
  if (!lastListItemLead) {
    return;
  }
  const newListItemText = lastListItemLead + mergeRawTokenText(lastListItem.tokens.slice(0, -1)) + newToken.raw;
  const newList = lexer(previousListItemsText + newListItemText)[0];
  if (newList.type !== "list") {
    return;
  }
  return newList;
}

function completeHeading(token, fullRawText) {
  if (token.raw.match(/-\s*$/)) {
    return lexer(fullRawText + " &nbsp;");
  }
}

var maxIncompleteTokensFixRounds = 3;

function fillInIncompleteTokens(tokens) {
  for (let i2 = 0; i2 < maxIncompleteTokensFixRounds; i2++) {
    const newTokens = fillInIncompleteTokensOnce(tokens);
    if (newTokens) {
      tokens = newTokens;
    } else {
      break;
    }
  }
  return tokens;
}

function fillInIncompleteTokensOnce(tokens) {
  let i2;
  let newTokens;
  for (i2 = 0; i2 < tokens.length; i2++) {
    const token = tokens[i2];
    if (token.type === "paragraph" && token.raw.match(/(\n|^)\|/)) {
      newTokens = completeTable(tokens.slice(i2));
      break;
    }
  }
  let lastInterestingIdx = tokens.length - 1;
  while (lastInterestingIdx >= 0 && (tokens[lastInterestingIdx].type === "space" || tokens[lastInterestingIdx].type === "html")) {
    lastInterestingIdx--;
  }
  const lastInterestingToken = lastInterestingIdx >= 0 ? tokens[lastInterestingIdx] : void 0;
  const trailingTokens = tokens.slice(lastInterestingIdx + 1);
  if (!newTokens && lastInterestingToken?.type === "list") {
    const newListToken = completeListItemPattern(lastInterestingToken);
    if (newListToken) {
      newTokens = [newListToken, ...trailingTokens];
      i2 = lastInterestingIdx;
    }
  }
  if (!newTokens && lastInterestingToken?.type === "blockquote") {
    const newBlockquoteToken = completeBlockquotePattern(lastInterestingToken, tokens.links);
    if (newBlockquoteToken) {
      newTokens = [newBlockquoteToken, ...trailingTokens];
      i2 = lastInterestingIdx;
    }
  }
  if (!newTokens && lastInterestingToken?.type === "paragraph") {
    const newToken = completeSingleLinePattern(lastInterestingToken);
    if (newToken) {
      newTokens = [newToken, ...trailingTokens];
      i2 = lastInterestingIdx;
    }
  }
  if (newTokens) {
    const newTokensList = [
      ...tokens.slice(0, i2),
      ...newTokens
    ];
    newTokensList.links = tokens.links;
    return newTokensList;
  }
  const lastToken = tokens.at(-1);
  if (lastToken?.type === "heading") {
    const completeTokens = completeHeading(lastToken, mergeRawTokenText(tokens));
    if (completeTokens) {
      return completeTokens;
    }
  }
  return null;
}

function completeCodespan(token) {
  return completeWithString(token, "`");
}

function completeStar(tokens) {
  return completeWithString(tokens, "*");
}

function completeUnderscore(tokens) {
  return completeWithString(tokens, "_");
}

function completeLinkTarget(tokens) {
  return completeWithString(tokens, ")", false);
}

function completeLinkTargetArg(tokens) {
  return completeWithString(tokens, '")', false);
}

function completeLinkText(tokens) {
  return completeWithString(tokens, "](https://microsoft.com)", false);
}

function completeDoublestar(tokens) {
  return completeWithString(tokens, "**");
}

function completeDoubleUnderscore(tokens) {
  return completeWithString(tokens, "__");
}

function completeWithString(tokens, closingString, shouldTrim = true) {
  const mergedRawText = mergeRawTokenText(Array.isArray(tokens) ? tokens : [tokens]);
  const trimmedRawText = shouldTrim ? mergedRawText.trimEnd() : mergedRawText;
  return lexer(trimmedRawText + closingString)[0];
}

function completeTable(tokens) {
  const mergedRawText = mergeRawTokenText(tokens);
  const lines = mergedRawText.split("\n");
  let numCols;
  let hasSeparatorRow = false;
  for (let i2 = 0; i2 < lines.length; i2++) {
    const line = lines[i2].trim();
    if (typeof numCols === "undefined" && line.match(/^\s*\|/)) {
      const line1Matches = line.match(/(\|[^\|]+)(?=\||$)/g);
      if (line1Matches) {
        numCols = line1Matches.length;
      }
    } else if (typeof numCols === "number") {
      if (line.match(/^\s*\|/)) {
        if (i2 !== lines.length - 1) {
          return void 0;
        }
        hasSeparatorRow = true;
      } else {
        return void 0;
      }
    }
  }
  if (typeof numCols === "number" && numCols > 0) {
    const prefixText = hasSeparatorRow ? lines.slice(0, -1).join("\n") : mergedRawText;
    const line1EndsInPipe = !!prefixText.match(/\|\s*$/);
    const newRawText = prefixText + (line1EndsInPipe ? "" : "|") + `
|${" --- |".repeat(numCols)}`;
    return lexer(newRawText);
  }
  return void 0;
}
export { getLinkTitle, renderImage, createAlertBlockquoteRenderer, renderMarkdown, rewriteRenderedLinks, createMarkdownRenderer, preprocessMarkdownString, activateLink, uriMassage, massageHref, postProcessCodeBlockLanguageId, resolveWithBaseUri, sanitizeRenderedMarkdown, getDomSanitizerConfig, renderAsPlaintext, createPlainTextRenderer, mergeRawTokenText, completeSingleLinePattern, hasLinkTextAndStartOfLinkTarget, hasStartOfLinkTargetAndNoLinkText, completeBlockquotePattern, completeListItemPattern, completeHeading, fillInIncompleteTokens, fillInIncompleteTokensOnce, completeCodespan, completeStar, completeUnderscore, completeLinkTarget, completeLinkTargetArg, completeLinkText, completeDoublestar, completeDoubleUnderscore, completeWithString, completeTable, defaultMarkedRenderers, allowedMarkdownHtmlTags, allowedMarkdownHtmlAttributes, unescapeInfo, codeBlockFences, linkFormatter, parsedListItem, parsedText, maxIncompleteTokensFixRounds };
