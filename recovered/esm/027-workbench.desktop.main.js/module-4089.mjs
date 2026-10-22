// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/browserView/electron-browser/features/browserRemoteFeatures.ts
import { BrowserEditor, BrowserEditorContribution } from "./module-4048.mjs";
import { $ } from "./module-0075.mjs";
import { renderIcon } from "./module-0467.mjs";
import { Codicon } from "./module-0085.mjs";
import { localize } from "./module-0001.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IHoverService } from "./module-0520.mjs";
import { IBrowserViewWorkbenchService } from "./module-1243.mjs";
import { Registry } from "./module-0090.mjs";
import { Extensions4 } from "./module-0140.mjs";
import { workbenchConfigurationNodeBase } from "./module-1112.mjs";
import { BrowserRemoteProxyEnabledSettingId } from "./module-4051.mjs";
import { product_default } from "./module-0139.mjs";


// src/vs/workbench/contrib/browserView/electron-browser/features/browserRemoteFeatures.ts
var BrowserRemoteIndicatorContribution = class extends BrowserEditorContribution {
  constructor(editor, hoverService, browserViewWorkbenchService) {
    super(editor);
    this.browserViewWorkbenchService = browserViewWorkbenchService;
    this._message = "";
    this._container = $(".browser-remote-indicator");
    this._container.setAttribute("role", "img");
    const icon2 = renderIcon(Codicon.remote);
    this._container.appendChild(icon2);
    this._register(hoverService.setupDelayedHover(
      this._container,
      () => ({
        content: this._message
      })
    ));
    this.refresh(null);
  }
  get widgets() {
    return [{ location: "preUrl" /* PreUrl */, element: this._container, order: 0 }];
  }
  onModelAttached(model, store) {
    this.refresh(model);
    store.add(model.onDidNavigate(() => this.refresh(model)));
    store.add(model.onDidChangeRemoteStatus(() => this.refresh(model)));
  }
  onModelDetached() {
    this.refresh(null);
  }
  refresh(model) {
    let statusMessage = "";
    let isConnected = false;
    let isWarning = false;
    if (model) {
      if (model.url.startsWith("file://")) {
        isConnected = false;
        statusMessage = localize(8159, null);
        isWarning = true;
      } else if (model.isRemoteSession) {
        isConnected = true;
        statusMessage = localize(8161, null);
      } else {
        isConnected = false;
        statusMessage = localize(8160, null);
      }
    }
    this._container.classList.toggle("connected", isConnected);
    this._container.classList.toggle("warning", isWarning);
    this._container.style.display = isConnected || this.browserViewWorkbenchService.willUseRemoteProxy() ? "" : "none";
    this._container.setAttribute("aria-label", statusMessage);
    this._message = statusMessage;
  }
};

BrowserRemoteIndicatorContribution = __decorateClass([
  __decorateParam(1, IHoverService),
  __decorateParam(2, IBrowserViewWorkbenchService)
], BrowserRemoteIndicatorContribution);

BrowserEditor.registerContribution(BrowserRemoteIndicatorContribution);

Registry.as(Extensions4.Configuration).registerConfiguration({
  ...workbenchConfigurationNodeBase,
  properties: {
    [BrowserRemoteProxyEnabledSettingId]: {
      type: "boolean",
      default: product_default.quality !== "stable",
      tags: ["experimental"],
      scope: 4 /* WINDOW */,
      experiment: { mode: "startup" },
      markdownDescription: localize(8162, null)
    }
  }
});
export { BrowserRemoteIndicatorContribution };
