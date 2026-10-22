// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/platform/markdown/browser/markdownRenderer.ts
import { createDecorator } from "./module-0077.mjs";
import { renderMarkdown } from "./module-0468.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IOpenerService } from "./module-0272.mjs";
import { onUnexpectedError } from "./module-0004.mjs";
import { registerSingleton } from "./module-0135.mjs";


// src/vs/platform/markdown/browser/markdownRenderer.ts
var IMarkdownRendererService = createDecorator("markdownRendererService");

var MarkdownRendererService = class {
  constructor(_openerService) {
    this._openerService = _openerService;
  }
  render(markdown, options3, outElement) {
    const resolvedOptions = { ...options3 };
    if (!resolvedOptions.actionHandler) {
      resolvedOptions.actionHandler = (link2, mdStr) => {
        return openLinkFromMarkdown(this._openerService, link2, mdStr.isTrusted);
      };
    }
    if (!resolvedOptions.codeBlockRenderer) {
      resolvedOptions.codeBlockRenderer = (alias, value2) => {
        return this._defaultCodeBlockRenderer?.renderCodeBlock(alias, value2, resolvedOptions ?? {}) ?? Promise.resolve(document.createElement("span"));
      };
    }
    const rendered = renderMarkdown(markdown, resolvedOptions, outElement);
    rendered.element.classList.add("rendered-markdown");
    return rendered;
  }
  setDefaultCodeBlockRenderer(renderer) {
    this._defaultCodeBlockRenderer = renderer;
  }
};

MarkdownRendererService = __decorateClass([
  __decorateParam(0, IOpenerService)
], MarkdownRendererService);

async function openLinkFromMarkdown(openerService, link2, isTrusted, skipValidation) {
  try {
    return await openerService.open(link2, {
      fromUserGesture: true,
      allowContributedOpeners: true,
      allowCommands: toAllowCommandsOption(isTrusted),
      skipValidation
    });
  } catch (e4) {
    onUnexpectedError(e4);
    return false;
  }
}

function toAllowCommandsOption(isTrusted) {
  if (isTrusted === true) {
    return true;
  }
  if (isTrusted && Array.isArray(isTrusted.enabledCommands)) {
    return isTrusted.enabledCommands;
  }
  return false;
}

registerSingleton(IMarkdownRendererService, MarkdownRendererService, 1 /* Delayed */);
export { openLinkFromMarkdown, toAllowCommandsOption, IMarkdownRendererService, MarkdownRendererService };
