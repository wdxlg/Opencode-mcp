// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/platform/webview/common/webviewPortMapping.ts
import { URI } from "./module-0032.mjs";
import { extractLocalHostUriMetaDataForPortMapping } from "./module-1409.mjs";
import { Schemas } from "./module-0033.mjs";


// src/vs/platform/webview/common/webviewPortMapping.ts
var WebviewPortMappingManager = class {
  constructor(_getExtensionLocation, _getMappings, tunnelService) {
    this._getExtensionLocation = _getExtensionLocation;
    this._getMappings = _getMappings;
    this.tunnelService = tunnelService;
    this._tunnels = /* @__PURE__ */ new Map();
  }
  async getRedirect(resolveAuthority, url) {
    const uri5 = URI.parse(url);
    const requestLocalHostInfo = extractLocalHostUriMetaDataForPortMapping(uri5);
    if (!requestLocalHostInfo) {
      return void 0;
    }
    for (const mapping2 of this._getMappings()) {
      if (mapping2.webviewPort === requestLocalHostInfo.port) {
        const extensionLocation = this._getExtensionLocation();
        if (extensionLocation && extensionLocation.scheme === Schemas.vscodeRemote) {
          const tunnel = resolveAuthority && await this.getOrCreateTunnel(resolveAuthority, mapping2.extensionHostPort);
          if (tunnel) {
            if (tunnel.tunnelLocalPort === mapping2.webviewPort) {
              return void 0;
            }
            return encodeURI(uri5.with({
              authority: `127.0.0.1:${tunnel.tunnelLocalPort}`
            }).toString(true));
          }
        }
        if (mapping2.webviewPort !== mapping2.extensionHostPort) {
          return encodeURI(uri5.with({
            authority: `${requestLocalHostInfo.address}:${mapping2.extensionHostPort}`
          }).toString(true));
        }
      }
    }
    return void 0;
  }
  async dispose() {
    for (const tunnel of this._tunnels.values()) {
      await tunnel.dispose();
    }
    this._tunnels.clear();
  }
  async getOrCreateTunnel(remoteAuthority, remotePort) {
    const existing = this._tunnels.get(remotePort);
    if (existing) {
      return existing;
    }
    const tunnelOrError = await this.tunnelService.openTunnel({ getAddress: async () => remoteAuthority }, void 0, remotePort);
    let tunnel;
    if (typeof tunnelOrError === "string") {
      tunnel = void 0;
    }
    if (tunnel) {
      this._tunnels.set(remotePort, tunnel);
    }
    return tunnel;
  }
};
export { WebviewPortMappingManager };
