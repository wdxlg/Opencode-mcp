// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/widget/chatContentMarkdownRenderer.ts
import { $, reset } from "./module-0075.mjs";
import { product_default } from "./module-0139.mjs";
import { Schemas } from "./module-0033.mjs";
import { AGENT_HOST_SCHEME } from "./module-1001.mjs";
import { AGENT_HOST_SESSION_LINK_SCHEME } from "./module-2024.mjs";
import { DisposableStore } from "./module-0012.mjs";
import { getDefaultHoverDelegate } from "./module-0448.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ILanguageService } from "./module-0133.mjs";
import { IOpenerService } from "./module-0272.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IHoverService } from "./module-0520.mjs";
import { IMarkdownRendererService } from "./module-0541.mjs";


// src/vs/workbench/contrib/chat/browser/widget/chatContentMarkdownRenderer.ts
var _remoteImageDisallowed = () => false;

var nonPlainTextMarkdownSyntax = /[\\`*_[\]<>|&$]/;

var gfmAutolink = /\b(?:https?:\/\/|www\.)/i;

var gfmStrikethrough = /~~/;

var blockMarkdownSyntax = /(^|\n)\s{0,3}(?:#{1,6}\s|>\s?|[-+]\s|\d+[.)]\s|---+\s*$)/;

var literalSingleTildeExtension = {
  extensions: [{
    name: "literalSingleTilde",
    level: "inline",
    tokenizer: (source) => {
      if (source[0] === "~" && source[1] !== "~") {
        return { type: "text", raw: "~", text: "~" };
      }
      return void 0;
    }
  }]
};

function renderPlainTextMarkdown(markdown, outElement) {
  const value2 = markdown.value;
  if (!value2 || value2.includes("\n") || nonPlainTextMarkdownSyntax.test(value2) || gfmAutolink.test(value2) || gfmStrikethrough.test(value2) || blockMarkdownSyntax.test(value2)) {
    return void 0;
  }
  const element = outElement ?? $("div");
  element.classList.add("rendered-markdown");
  reset(element, $("p", void 0, value2.length > 1e5 ? `${value2.substr(0, 1e5)}\u2026` : value2));
  return {
    element,
    dispose: () => {
    }
  };
}

var allowedChatMarkdownHtmlTags = Object.freeze([
  "b",
  "blockquote",
  "br",
  "code",
  "del",
  "em",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "hr",
  "i",
  "ins",
  "li",
  "ol",
  "p",
  "pre",
  "s",
  "strong",
  "sub",
  "sup",
  "table",
  "tbody",
  "td",
  "th",
  "thead",
  "tr",
  "ul",
  "a",
  "img",
  // TODO@roblourens when we sanitize attributes in markdown source, we can ban these elements at that step. microsoft/vscode-copilot#5091
  // Not in the official list, but used for codicons and other vscode markdown extensions
  "span",
  "div",
  "input"
  // Allowed for rendering checkboxes. Other types of inputs are removed and the inputs are always disabled
]);

function getChatMarkdownRenderOptions(options3) {
  return {
    ...options3,
    markedExtensions: options3?.markedExtensions?.includes(literalSingleTildeExtension) ? options3.markedExtensions : [...options3?.markedExtensions ?? [], literalSingleTildeExtension],
    sanitizerConfig: {
      replaceWithPlaintext: true,
      allowedTags: {
        override: allowedChatMarkdownHtmlTags
      },
      ...options3?.sanitizerConfig,
      allowedLinkSchemes: { augment: [product_default.urlProtocol, "copilot-skill", Schemas.vscodeBrowser, AGENT_HOST_SCHEME, AGENT_HOST_SESSION_LINK_SCHEME] },
      remoteImageIsAllowed: _remoteImageDisallowed
    }
  };
}

var ChatContentMarkdownRenderer = class {
  constructor(languageService, openerService, configurationService, hoverService, markdownRendererService) {
    this.hoverService = hoverService;
    this.markdownRendererService = markdownRendererService;
  }
  render(markdown, options3, outElement) {
    const plainTextResult = renderPlainTextMarkdown(markdown, outElement);
    if (plainTextResult) {
      return plainTextResult;
    }
    options3 = getChatMarkdownRenderOptions(options3);
    const mdWithBody = markdown && markdown.supportHtml ? {
      ...markdown,
      // dompurify uses DOMParser, which strips leading comments. Wrapping it all in 'body' prevents this.
      // The \n\n prevents marked.js from parsing the body contents as just text in an 'html' token, instead of actual markdown.
      value: `<body>

${markdown.value}

</body>`
    } : markdown;
    const result = this.markdownRendererService.render(mdWithBody, options3, outElement);
    result.element.normalize();
    for (const child of result.element.childNodes) {
      if (child.nodeType === Node.TEXT_NODE && child.textContent?.trim()) {
        child.replaceWith($("p", void 0, child.textContent));
      }
    }
    return this.attachCustomHover(result);
  }
  attachCustomHover(result) {
    const store = new DisposableStore();
    result.element.querySelectorAll("a").forEach((element) => {
      if (element.title) {
        const title = element.title;
        element.title = "";
        store.add(this.hoverService.setupManagedHover(getDefaultHoverDelegate("element"), element, title));
      }
    });
    return {
      element: result.element,
      dispose: () => {
        result.dispose();
        store.dispose();
      }
    };
  }
};

ChatContentMarkdownRenderer = __decorateClass([
  __decorateParam(0, ILanguageService),
  __decorateParam(1, IOpenerService),
  __decorateParam(2, IConfigurationService),
  __decorateParam(3, IHoverService),
  __decorateParam(4, IMarkdownRendererService)
], ChatContentMarkdownRenderer);
export { renderPlainTextMarkdown, getChatMarkdownRenderOptions, _remoteImageDisallowed, nonPlainTextMarkdownSyntax, gfmAutolink, gfmStrikethrough, blockMarkdownSyntax, literalSingleTildeExtension, allowedChatMarkdownHtmlTags, ChatContentMarkdownRenderer };
