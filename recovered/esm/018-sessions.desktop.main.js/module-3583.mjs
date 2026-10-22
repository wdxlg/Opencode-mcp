// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/chat/browser/noAgentHostEmptyState.ts
import { $, EventType, addDisposableListener, append } from "./module-0075.mjs";
import { Disposable } from "./module-0012.mjs";
import { localize } from "./module-0001.mjs";
import { isMobile } from "./module-0014.mjs";
import { renderLabelWithIcons } from "./module-0467.mjs";
import { Codicon } from "./module-0085.mjs";
import { renderFormattedText } from "./module-0597.mjs";
import { URI } from "./module-0032.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IOpenerService } from "./module-0272.mjs";
import { IProductService } from "./module-0875.mjs";


// src/vs/sessions/contrib/chat/browser/noAgentHostEmptyState.ts
var $117 = $;

var LEARN_MORE_URL = "https://aka.ms/VSCode/Agents/docs";

var NoAgentHostEmptyState = class extends Disposable {
  constructor(_openerService, _productService) {
    super();
    this._openerService = _openerService;
    this._productService = _productService;
  }
  render(parent) {
    this._root = append(parent, $117(".no-agent-host-empty-state"));
    this._root.setAttribute("role", "group");
    this._root.setAttribute("aria-label", localize(4496, null));
    this._root.tabIndex = -1;
    if (!isMobile) {
      const iconWrap = append(this._root, $117(".no-agent-host-icon"));
      iconWrap.append(...renderLabelWithIcons(`$(${Codicon.remote.id})`));
    }
    const heading2 = append(this._root, $117("h2.no-agent-host-title"));
    heading2.textContent = localize(4499, null);
    const cliBinary = this._productService.quality === "stable" ? "code" : "code-insiders";
    const command4 = `${cliBinary} tunnel`;
    const description = append(this._root, $117("p.no-agent-host-description"));
    renderFormattedText(
      localize(
        4497,
        null,
        command4
      ),
      { renderCodeSegments: true },
      description
    );
    description.appendChild(document.createTextNode(" "));
    const learnMore = append(description, $117("a.no-agent-host-link"));
    learnMore.textContent = localize(4498, null);
    learnMore.href = LEARN_MORE_URL;
    this._register(addDisposableListener(learnMore, EventType.CLICK, (e4) => {
      e4.preventDefault();
      this._openerService.open(URI.parse(LEARN_MORE_URL));
    }));
  }
  focus() {
    this._root?.focus();
  }
  dispose() {
    this._root?.remove();
    this._root = void 0;
    super.dispose();
  }
};

NoAgentHostEmptyState = __decorateClass([
  __decorateParam(0, IOpenerService),
  __decorateParam(1, IProductService)
], NoAgentHostEmptyState);
export { $117, LEARN_MORE_URL, NoAgentHostEmptyState };
