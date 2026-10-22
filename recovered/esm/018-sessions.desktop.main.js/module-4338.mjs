// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/electron-browser/toggleRemoteConnectionsActionViewItem.ts
import { BaseActionViewItem } from "./module-0476.mjs";
import { $, append } from "./module-0075.mjs";
import { renderLabelWithIcons } from "./module-0467.mjs";
import { Codicon } from "./module-0085.mjs";
import { getDefaultHoverDelegate } from "./module-0448.mjs";
import { localize } from "./module-0001.mjs";
import { disposableTimeout } from "./module-0036.mjs";
import { RENAME_TUNNEL_ID, SHOW_TUNNEL_HOST_OUTPUT_ID } from "./module-4337.mjs";
import { MarkdownString } from "./module-0462.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ITunnelHostService } from "./module-4259.mjs";
import { IHoverService } from "./module-0520.mjs";
import { IProductService } from "./module-0875.mjs";


// src/vs/workbench/contrib/chat/electron-browser/toggleRemoteConnectionsActionViewItem.ts
var TUNNEL_ACCESS_DOCS_URL = "https://aka.ms/vscode-agent-tunnel-access";

var ToggleRemoteConnectionsActionViewItem = class extends BaseActionViewItem {
  constructor(action, _tunnelHostService, _hoverService, _productService) {
    super(void 0, action);
    this._tunnelHostService = _tunnelHostService;
    this._hoverService = _hoverService;
    this._productService = _productService;
    this._wasSharing = false;
    this._wasSharing = this._tunnelHostService.isSharing;
    this._register(this._tunnelHostService.onDidChangeStatus(() => {
      this._updateState();
    }));
  }
  render(container2) {
    super.render(container2);
    if (!this.element) {
      return;
    }
    this.element.classList.add("tunnel-host-toggle");
    this.element.tabIndex = 0;
    this.element.role = "button";
    this._iconElement = append(this.element, $("span.tunnel-host-icon"));
    this._iconElement.append(...renderLabelWithIcons(`$(${Codicon.radioTower.id})`));
    this._toastElement = append(this.element, $("span.tunnel-host-toast"));
    const hoverDelegate = getDefaultHoverDelegate("element");
    this._hover = this._register(this._hoverService.setupManagedHover(
      hoverDelegate,
      this.element,
      this._getHoverContent()
    ));
    this._updateState();
  }
  _updateState() {
    if (!this.element) {
      return;
    }
    const isSharing = this._tunnelHostService.isSharing;
    const isConnecting = this._tunnelHostService.isConnecting;
    this.element.classList.toggle("sharing", isSharing);
    this.element.classList.toggle("connecting", isConnecting);
    this._hover?.update(this._getHoverContent());
    this.element.setAttribute("aria-label", this._getAriaLabel());
    this.element.setAttribute("aria-pressed", String(isSharing));
    if (isSharing && !this._wasSharing && !isConnecting) {
      this._showToast();
    } else if (!isSharing && this._wasSharing) {
      this._hideToast();
    }
    this._wasSharing = isSharing;
  }
  _showToast() {
    if (!this._toastElement) {
      return;
    }
    this._toastElement.textContent = localize(13623, null);
    this._toastElement.classList.add("visible");
    disposableTimeout(() => {
      this._hideToast();
    }, 3e3, this._store);
  }
  _hideToast() {
    this._toastElement?.classList.remove("visible");
  }
  _getHoverContent() {
    const lines = [];
    if (this._tunnelHostService.isConnecting) {
      lines.push(localize(13612, null));
    } else if (this._tunnelHostService.isSharing) {
      const info = this._tunnelHostService.sharingInfo;
      if (info) {
        lines.push(info.viaRemoteTunnelAccess ? localize(13619, null, info.tunnelName) : localize(13621, null, info.tunnelName));
      } else {
        lines.push(localize(13613, null));
      }
    } else {
      const agentsUrl = this._productService.webUrl ? `${this._productService.webUrl.replace(/\/$/, "")}/agents` : void 0;
      lines.push(agentsUrl ? localize(13614, null, `[${agentsUrl.replace(/https?:\/\//, "")}](${agentsUrl})`) : localize(13617, null));
    }
    lines.push(`[${localize(13622, null)}](command:${SHOW_TUNNEL_HOST_OUTPUT_ID}) | [${localize(13620, null)}](command:${RENAME_TUNNEL_ID}) | [${localize(13618, null)}](${TUNNEL_ACCESS_DOCS_URL})`);
    const md = new MarkdownString(lines.join("\n\n"), { isTrusted: { enabledCommands: [SHOW_TUNNEL_HOST_OUTPUT_ID, RENAME_TUNNEL_ID] } });
    return { markdown: md, markdownNotSupportedFallback: lines[0] };
  }
  _getAriaLabel() {
    if (this._tunnelHostService.isConnecting) {
      return localize(13612, null);
    }
    if (this._tunnelHostService.isSharing) {
      const info = this._tunnelHostService.sharingInfo;
      if (info) {
        return info.viaRemoteTunnelAccess ? localize(13611, null, info.tunnelName) : localize(13621, null, info.tunnelName);
      }
      return localize(13613, null);
    }
    const agentsUrl = this._productService.webUrl ? `${this._productService.webUrl.replace(/\/$/, "")}/agents` : void 0;
    return agentsUrl ? localize(13615, null, agentsUrl.replace(/https?:\/\//, "")) : localize(13616, null);
  }
};

ToggleRemoteConnectionsActionViewItem = __decorateClass([
  __decorateParam(1, ITunnelHostService),
  __decorateParam(2, IHoverService),
  __decorateParam(3, IProductService)
], ToggleRemoteConnectionsActionViewItem);
export { TUNNEL_ACCESS_DOCS_URL, ToggleRemoteConnectionsActionViewItem };
