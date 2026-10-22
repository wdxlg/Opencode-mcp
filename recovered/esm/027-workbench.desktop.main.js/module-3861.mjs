// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/platform/extensionManagement/common/extensionManagementIpc.ts
import { DefaultURITransformer, transformAndReviveIncomingURIs } from "./module-1199.mjs";
import { CommontExtensionManagementService } from "./module-3839.mjs";
import { Emitter } from "./module-0017.mjs";
import { URI } from "./module-0032.mjs";
import { language } from "./module-0014.mjs";


// src/vs/platform/extensionManagement/common/extensionManagementIpc.ts
function transformIncomingExtension(extension, transformer) {
  transformer = transformer ? transformer : DefaultURITransformer;
  const manifest = extension.manifest;
  const transformed = transformAndReviveIncomingURIs({ ...extension, ...{ manifest: void 0 } }, transformer);
  return { ...transformed, ...{ manifest } };
}

var ExtensionManagementChannelClient = class extends CommontExtensionManagementService {
  constructor(channel, productService, allowedExtensionsService) {
    super(productService, allowedExtensionsService);
    this.channel = channel;
    this._onInstallExtension = this._register(new Emitter());
    this._onDidInstallExtensions = this._register(new Emitter());
    this._onUninstallExtension = this._register(new Emitter());
    this._onDidUninstallExtension = this._register(new Emitter());
    this._onDidUpdateExtensionMetadata = this._register(new Emitter());
    this._register(this.channel.listen("onInstallExtension")((e) => this.onInstallExtensionEvent({ ...e, source: this.isUriComponents(e.source) ? URI.revive(e.source) : e.source, profileLocation: URI.revive(e.profileLocation) })));
    this._register(this.channel.listen("onDidInstallExtensions")((results) => this.onDidInstallExtensionsEvent(results.map((e) => ({ ...e, local: e.local ? transformIncomingExtension(e.local, null) : e.local, source: this.isUriComponents(e.source) ? URI.revive(e.source) : e.source, profileLocation: URI.revive(e.profileLocation) })))));
    this._register(this.channel.listen("onUninstallExtension")((e) => this.onUninstallExtensionEvent({ ...e, profileLocation: URI.revive(e.profileLocation) })));
    this._register(this.channel.listen("onDidUninstallExtension")((e) => this.onDidUninstallExtensionEvent({ ...e, profileLocation: URI.revive(e.profileLocation) })));
    this._register(this.channel.listen("onDidUpdateExtensionMetadata")((e) => this.onDidUpdateExtensionMetadataEvent({ profileLocation: URI.revive(e.profileLocation), local: transformIncomingExtension(e.local, null) })));
  }
  get onInstallExtension() {
    return this._onInstallExtension.event;
  }
  get onDidInstallExtensions() {
    return this._onDidInstallExtensions.event;
  }
  get onUninstallExtension() {
    return this._onUninstallExtension.event;
  }
  get onDidUninstallExtension() {
    return this._onDidUninstallExtension.event;
  }
  get onDidUpdateExtensionMetadata() {
    return this._onDidUpdateExtensionMetadata.event;
  }
  onInstallExtensionEvent(event) {
    this._onInstallExtension.fire(event);
  }
  onDidInstallExtensionsEvent(results) {
    this._onDidInstallExtensions.fire(results);
  }
  onUninstallExtensionEvent(event) {
    this._onUninstallExtension.fire(event);
  }
  onDidUninstallExtensionEvent(event) {
    this._onDidUninstallExtension.fire(event);
  }
  onDidUpdateExtensionMetadataEvent(event) {
    this._onDidUpdateExtensionMetadata.fire(event);
  }
  isUriComponents(obj) {
    if (!obj) {
      return false;
    }
    const thing = obj;
    return typeof thing?.path === "string" && typeof thing?.scheme === "string";
  }
  getTargetPlatform() {
    if (!this._targetPlatformPromise) {
      this._targetPlatformPromise = this.channel.call("getTargetPlatform");
    }
    return this._targetPlatformPromise;
  }
  zip(extension) {
    return Promise.resolve(this.channel.call("zip", [extension]).then((result) => URI.revive(result)));
  }
  install(vsix, options3) {
    return Promise.resolve(this.channel.call("install", [vsix, options3])).then((local) => transformIncomingExtension(local, null));
  }
  installFromLocation(location2, profileLocation) {
    return Promise.resolve(this.channel.call("installFromLocation", [location2, profileLocation])).then((local) => transformIncomingExtension(local, null));
  }
  async installExtensionsFromProfile(extensions, fromProfileLocation, toProfileLocation) {
    const result = await this.channel.call("installExtensionsFromProfile", [extensions, fromProfileLocation, toProfileLocation]);
    return result.map((local) => transformIncomingExtension(local, null));
  }
  getManifest(vsix) {
    return Promise.resolve(this.channel.call("getManifest", [vsix]));
  }
  installFromGallery(extension, installOptions) {
    return Promise.resolve(this.channel.call("installFromGallery", [extension, installOptions])).then((local) => transformIncomingExtension(local, null));
  }
  async installGalleryExtensions(extensions) {
    const results = await this.channel.call("installGalleryExtensions", [extensions]);
    return results.map((e) => ({ ...e, local: e.local ? transformIncomingExtension(e.local, null) : e.local, source: this.isUriComponents(e.source) ? URI.revive(e.source) : e.source, profileLocation: URI.revive(e.profileLocation) }));
  }
  uninstall(extension, options3) {
    if (extension.isWorkspaceScoped) {
      throw new Error("Cannot uninstall a workspace extension");
    }
    return Promise.resolve(this.channel.call("uninstall", [extension, options3]));
  }
  uninstallExtensions(extensions) {
    if (extensions.some((e) => e.extension.isWorkspaceScoped)) {
      throw new Error("Cannot uninstall a workspace extension");
    }
    return Promise.resolve(this.channel.call("uninstallExtensions", [extensions]));
  }
  getInstalled(type = null, extensionsProfileResource, productVersion) {
    return Promise.resolve(this.channel.call("getInstalled", [type, extensionsProfileResource, productVersion, language])).then((extensions) => extensions.map((extension) => transformIncomingExtension(extension, null)));
  }
  updateMetadata(local, metadata, extensionsProfileResource) {
    return Promise.resolve(this.channel.call("updateMetadata", [local, metadata, extensionsProfileResource])).then((extension) => transformIncomingExtension(extension, null));
  }
  resetPinnedStateForAllUserExtensions(pinned) {
    return this.channel.call("resetPinnedStateForAllUserExtensions", [pinned]);
  }
  toggleApplicationScope(local, fromProfileLocation) {
    return this.channel.call("toggleApplicationScope", [local, fromProfileLocation]).then((extension) => transformIncomingExtension(extension, null));
  }
  copyExtensions(fromProfileLocation, toProfileLocation) {
    return this.channel.call("copyExtensions", [fromProfileLocation, toProfileLocation]);
  }
  getExtensionsControlManifest() {
    return Promise.resolve(this.channel.call("getExtensionsControlManifest"));
  }
  async download(extension, operation, donotVerifySignature) {
    const result = await this.channel.call("download", [extension, operation, donotVerifySignature]);
    return URI.revive(result);
  }
  async cleanUp() {
    return this.channel.call("cleanUp");
  }
  registerParticipant() {
    throw new Error("Not Supported");
  }
};
export { transformIncomingExtension, ExtensionManagementChannelClient };
