// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/browserView/electron-browser/features/browserWelcomeFeature.ts
import { BrowserEditor, BrowserEditorContribution } from "./module-4159.mjs";
import { $ } from "./module-0075.mjs";
import { renderIcon } from "./module-0467.mjs";
import { Codicon } from "./module-0085.mjs";
import { localize } from "./module-0001.mjs";
import { ChatContextKeys } from "./module-0966.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IContextKeyService } from "./module-0089.mjs";


// src/vs/workbench/contrib/browserView/electron-browser/features/browserWelcomeFeature.ts
var BrowserWelcomeFeature = class extends BrowserEditorContribution {
  constructor(editor, contextKeyService) {
    super(editor);
    this._container = $(".browser-welcome-container");
    const content = $(".browser-welcome-content");
    const iconContainer = $(".browser-welcome-icon");
    iconContainer.appendChild(renderIcon(Codicon.globe));
    content.appendChild(iconContainer);
    const title = $(".browser-welcome-title");
    title.textContent = localize(8215, null);
    content.appendChild(title);
    const subtitle = $(".browser-welcome-subtitle");
    const chatEnabled = contextKeyService.getContextKeyValue(ChatContextKeys.enabled.key);
    subtitle.textContent = chatEnabled ? localize(8214, null) : localize(8213, null);
    content.appendChild(subtitle);
    this._container.appendChild(content);
    this._widget = { location: "contentArea" /* ContentArea */, element: this._container, order: 50 };
  }
  get widgets() {
    return [this._widget];
  }
  prerenderInput(input) {
    this._setVisible(!input.url);
  }
  onModelAttached(model, store) {
    this._setVisible(!model.url);
    store.add(model.onDidNavigate((event) => this._setVisible(!event.url)));
  }
  onModelDetached() {
    this._setVisible(true);
  }
  _setVisible(visible) {
    this._container.style.display = visible ? "" : "none";
  }
};

BrowserWelcomeFeature = __decorateClass([
  __decorateParam(1, IContextKeyService)
], BrowserWelcomeFeature);

BrowserEditor.registerContribution(BrowserWelcomeFeature);
export { BrowserWelcomeFeature };
