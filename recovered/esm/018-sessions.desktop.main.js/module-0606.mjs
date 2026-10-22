// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/contrib/hover/browser/hoverCopyButton.ts
import { Disposable } from "./module-0012.mjs";
import { SimpleButton } from "./module-0605.mjs";
import { localize } from "./module-0001.mjs";
import { Codicon } from "./module-0085.mjs";
import { status } from "./module-0076.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IClipboardService } from "./module-0487.mjs";
import { IHoverService } from "./module-0520.mjs";


// src/vs/editor/contrib/hover/browser/hoverCopyButton.ts
var HoverCopyButton = class extends Disposable {
  constructor(_container, _getContent, _clipboardService, _hoverService) {
    super();
    this._container = _container;
    this._getContent = _getContent;
    this._clipboardService = _clipboardService;
    this._hoverService = _hoverService;
    this._container.classList.add("hover-row-with-copy");
    this._button = this._register(new SimpleButton({
      label: localize(1309, null),
      icon: Codicon.copy,
      onTrigger: () => this._copyContent(),
      className: "hover-copy-button"
    }, this._hoverService));
    this._container.appendChild(this._button.domNode);
  }
  async _copyContent() {
    const content = this._getContent();
    if (content) {
      await this._clipboardService.writeText(content);
      status(localize(1308, null));
    }
  }
};

HoverCopyButton = __decorateClass([
  __decorateParam(2, IClipboardService),
  __decorateParam(3, IHoverService)
], HoverCopyButton);
export { HoverCopyButton };
