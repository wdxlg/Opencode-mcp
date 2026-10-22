// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/browser/widget/openInVSCodeWidget.ts
import { BaseActionViewItem } from "./module-0476.mjs";
import { localize } from "./module-0001.mjs";
import { getDefaultHoverDelegate } from "./module-0448.mjs";
import { $, EventHelper, append } from "./module-0075.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IProductService } from "./module-0875.mjs";
import { IHoverService } from "./module-0520.mjs";
import { IKeybindingService } from "./module-0352.mjs";


// src/vs/sessions/browser/widget/openInVSCodeWidget.ts
var OpenInVSCodeTitleBarWidget = class extends BaseActionViewItem {
  constructor(action, options3, keybindingCommandId, productService, hoverService, keybindingService) {
    super(void 0, action, options3);
    this.keybindingCommandId = keybindingCommandId;
    this.productService = productService;
    this.hoverService = hoverService;
    this.keybindingService = keybindingService;
  }
  render(container2) {
    super.render(container2);
    container2.classList.add("open-in-vscode-titlebar-widget");
    container2.setAttribute("role", "button");
    const quality = this.productService.quality;
    if (quality) {
      container2.setAttribute("data-product-quality", quality);
    }
    const label3 = this.action.label;
    const hoverText = this.keybindingService.appendKeybinding(localize(3866, null), this.keybindingCommandId);
    container2.setAttribute("aria-label", hoverText);
    this._register(this.hoverService.setupManagedHover(getDefaultHoverDelegate("element"), container2, hoverText));
    const icon2 = append(container2, $("span.open-in-vscode-titlebar-widget-icon"));
    icon2.setAttribute("aria-hidden", "true");
    const labelEl = append(container2, $("span.open-in-vscode-titlebar-widget-label"));
    labelEl.textContent = label3;
  }
  onClick(event) {
    EventHelper.stop(event, true);
    this.action.run();
  }
};

OpenInVSCodeTitleBarWidget = __decorateClass([
  __decorateParam(3, IProductService),
  __decorateParam(4, IHoverService),
  __decorateParam(5, IKeybindingService)
], OpenInVSCodeTitleBarWidget);
export { OpenInVSCodeTitleBarWidget };
