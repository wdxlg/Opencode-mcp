// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/platform/extensionResourceLoader/common/extensionResourceLoader.ts
import { createDecorator } from "./module-0077.mjs";
import { Disposable } from "./module-0012.mjs";
import { getExtensionGalleryManifestResourceUri } from "./module-0892.mjs";
import { URI } from "./module-0032.mjs";
import { format22 } from "./module-0030.mjs";
import { RemoteAuthorities } from "./module-0033.mjs";
import { isWeb } from "./module-0014.mjs";
import { getTelemetryLevel, supportsTelemetry } from "./module-0887.mjs";
import { getServiceMachineId } from "./module-0891.mjs";


// src/vs/platform/extensionResourceLoader/common/extensionResourceLoader.ts
var WEB_EXTENSION_RESOURCE_END_POINT_SEGMENT = "/web-extension-resource/";

var IExtensionResourceLoaderService = createDecorator("extensionResourceLoaderService");

var AbstractExtensionResourceLoaderService = class extends Disposable {
  constructor(_fileService, _storageService, _productService, _environmentService, _configurationService, _extensionGalleryManifestService, _logService) {
    super();
    this._fileService = _fileService;
    this._storageService = _storageService;
    this._productService = _productService;
    this._environmentService = _environmentService;
    this._configurationService = _configurationService;
    this._extensionGalleryManifestService = _extensionGalleryManifestService;
    this._logService = _logService;
    this._initPromise = this._init();
  }
  async _init() {
    try {
      const manifest = await this._extensionGalleryManifestService.getExtensionGalleryManifest();
      this.resolve(manifest);
      this._register(this._extensionGalleryManifestService.onDidChangeExtensionGalleryManifest(() => this.resolve(manifest)));
    } catch (error) {
      this._logService.error(error);
    }
  }
  resolve(manifest) {
    this._extensionGalleryResourceUrlTemplate = manifest ? getExtensionGalleryManifestResourceUri(manifest, "ExtensionResourceUriTemplate" /* ExtensionResourceUri */) : void 0;
    this._extensionGalleryAuthority = this._extensionGalleryResourceUrlTemplate ? this._getExtensionGalleryAuthority(URI.parse(this._extensionGalleryResourceUrlTemplate)) : void 0;
  }
  async supportsExtensionGalleryResources() {
    await this._initPromise;
    return this._extensionGalleryResourceUrlTemplate !== void 0;
  }
  async getExtensionGalleryResourceURL({ publisher, name, version: version2, targetPlatform }, path) {
    await this._initPromise;
    if (this._extensionGalleryResourceUrlTemplate) {
      const uri4 = URI.parse(format22(this._extensionGalleryResourceUrlTemplate, {
        publisher,
        name,
        version: targetPlatform !== void 0 && targetPlatform !== "undefined" /* UNDEFINED */ && targetPlatform !== "unknown" /* UNKNOWN */ && targetPlatform !== "universal" /* UNIVERSAL */ ? `${version2}+${targetPlatform}` : version2,
        path: "extension"
      }));
      return this._isWebExtensionResourceEndPoint(uri4) ? uri4.with({ scheme: RemoteAuthorities.getPreferredWebSchema() }) : uri4;
    }
    return void 0;
  }
  async isExtensionGalleryResource(uri4) {
    await this._initPromise;
    return !!this._extensionGalleryAuthority && this._extensionGalleryAuthority === this._getExtensionGalleryAuthority(uri4);
  }
  async getExtensionGalleryRequestHeaders() {
    const headers = {
      "X-Client-Name": `${this._productService.applicationName}${isWeb ? "-web" : ""}`,
      "X-Client-Version": this._productService.version
    };
    if (supportsTelemetry(this._productService, this._environmentService) && getTelemetryLevel(this._configurationService) === 3 /* USAGE */) {
      headers["X-Machine-Id"] = await this._getServiceMachineId();
    }
    if (this._productService.commit) {
      headers["X-Client-Commit"] = this._productService.commit;
    }
    return headers;
  }
  _getServiceMachineId() {
    if (!this._serviceMachineIdPromise) {
      this._serviceMachineIdPromise = getServiceMachineId(this._environmentService, this._fileService, this._storageService);
    }
    return this._serviceMachineIdPromise;
  }
  _getExtensionGalleryAuthority(uri4) {
    if (this._isWebExtensionResourceEndPoint(uri4)) {
      return uri4.authority;
    }
    const index2 = uri4.authority.indexOf(".");
    return index2 !== -1 ? uri4.authority.substring(index2 + 1) : void 0;
  }
  _isWebExtensionResourceEndPoint(uri4) {
    const uriPath = uri4.path, serverRootPath = RemoteAuthorities.getServerRootPath();
    return uriPath.startsWith(serverRootPath) && uriPath.startsWith(WEB_EXTENSION_RESOURCE_END_POINT_SEGMENT, serverRootPath.length);
  }
};
export { WEB_EXTENSION_RESOURCE_END_POINT_SEGMENT, IExtensionResourceLoaderService, AbstractExtensionResourceLoaderService };
