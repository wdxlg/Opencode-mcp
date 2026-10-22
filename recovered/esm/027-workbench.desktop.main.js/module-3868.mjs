// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/services/extensionManagement/electron-browser/extensionGalleryManifestService.ts
import { ExtensionGalleryManifestService } from "./module-3867.mjs";
import { Emitter } from "./module-0017.mjs";
import { resolveMarketplaceHeaders } from "./module-1692.mjs";
import { ExtensionGalleryServiceUrlConfigKey, IExtensionGalleryManifestService } from "./module-0890.mjs";
import { localize } from "./module-0001.mjs";
import { CancellationToken } from "./module-0025.mjs";
import { IRequestService, asJson } from "./module-0946.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IProductService } from "./module-0873.mjs";
import { IEnvironmentService } from "./module-0508.mjs";
import { IFileService } from "./module-0269.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { IStorageService } from "./module-0512.mjs";
import { IRemoteAgentService } from "./module-0937.mjs";
import { ISharedProcessService } from "./module-3729.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IDefaultAccountService } from "./module-0741.mjs";
import { ILogService } from "./module-0095.mjs";
import { IDialogService } from "./module-0267.mjs";
import { IHostService } from "./module-1117.mjs";
import { registerSingleton } from "./module-0135.mjs";


// src/vs/workbench/services/extensionManagement/electron-browser/extensionGalleryManifestService.ts
var WorkbenchExtensionGalleryManifestService = class extends ExtensionGalleryManifestService {
  constructor(productService, environmentService, fileService, telemetryService, storageService, remoteAgentService, sharedProcessService, configurationService, requestService, defaultAccountService, logService, dialogService, hostService) {
    super(productService);
    this.telemetryService = telemetryService;
    this.configurationService = configurationService;
    this.requestService = requestService;
    this.defaultAccountService = defaultAccountService;
    this.logService = logService;
    this.dialogService = dialogService;
    this.hostService = hostService;
    this.extensionGalleryManifest = null;
    this._onDidChangeExtensionGalleryManifest = this._register(new Emitter());
    this.onDidChangeExtensionGalleryManifest = this._onDidChangeExtensionGalleryManifest.event;
    this.currentStatus = "unavailable" /* Unavailable */;
    this._onDidChangeExtensionGalleryManifestStatus = this._register(new Emitter());
    this.onDidChangeExtensionGalleryManifestStatus = this._onDidChangeExtensionGalleryManifestStatus.event;
    this.commonHeadersPromise = resolveMarketplaceHeaders(
      productService.version,
      productService,
      environmentService,
      configurationService,
      fileService,
      storageService,
      telemetryService
    );
    const channels = [sharedProcessService.getChannel("extensionGalleryManifest")];
    const remoteConnection = remoteAgentService.getConnection();
    if (remoteConnection) {
      channels.push(remoteConnection.getChannel("extensionGalleryManifest"));
    }
    const updateChannels = (manifest) => {
      this.logService.trace(`[Marketplace] Updating channels with manifest ${manifest ? "available" : "unavailable"}`);
      channels.forEach((channel) => channel.call("setExtensionGalleryManifest", [manifest]));
    };
    this.getExtensionGalleryManifest().then((manifest) => {
      if (this._store.isDisposed) {
        this.logService.trace("[Marketplace] Store is already disposed, skipping channel initialization");
        return;
      }
      updateChannels(manifest);
      this._register(this.onDidChangeExtensionGalleryManifest((manifest2) => updateChannels(manifest2)));
    });
  }
  get extensionGalleryManifestStatus() {
    return this.currentStatus;
  }
  async getExtensionGalleryManifest() {
    if (!this.extensionGalleryManifestPromise) {
      this.extensionGalleryManifestPromise = this.doGetExtensionGalleryManifest();
    }
    await this.extensionGalleryManifestPromise;
    return this.extensionGalleryManifest;
  }
  async doGetExtensionGalleryManifest() {
    const defaultServiceUrl = this.productService.extensionsGallery?.serviceUrl;
    if (!defaultServiceUrl) {
      return;
    }
    const configuredServiceUrl = this.configurationService.getValue(ExtensionGalleryServiceUrlConfigKey);
    if (configuredServiceUrl) {
      this.logService.trace("[Marketplace] Private marketplace configured, checking access and fetching manifest", configuredServiceUrl);
      await this.handleDefaultAccountAccess(configuredServiceUrl);
      this._register(this.defaultAccountService.onDidChangeDefaultAccount(() => this.handleDefaultAccountAccess(configuredServiceUrl)));
    } else {
      const defaultExtensionGalleryManifest = await super.getExtensionGalleryManifest();
      this.update(defaultExtensionGalleryManifest);
    }
    this._register(this.configurationService.onDidChangeConfiguration((e) => {
      if (!e.affectsConfiguration(ExtensionGalleryServiceUrlConfigKey)) {
        return;
      }
      this.requestRestart();
    }));
  }
  async handleDefaultAccountAccess(configuredServiceUrl) {
    const account = await this.defaultAccountService.getDefaultAccount();
    if (!account) {
      this.logService.debug("[Marketplace] Enterprise marketplace configured but user not signed in");
      this.update(null, "requiresSignIn" /* RequiresSignIn */);
    } else if (!this.checkAccess(account)) {
      this.logService.debug("[Marketplace] User signed in but lacks access to enterprise marketplace");
      this.update(null, "accessDenied" /* AccessDenied */);
    } else if (this.currentStatus !== "available" /* Available */) {
      try {
        const manifest = await this.getExtensionGalleryManifestFromServiceUrl(configuredServiceUrl);
        this.update(manifest);
        this.telemetryService.publicLog2("galleryservice:custom:marketplace");
      } catch (error) {
        this.logService.error("[Marketplace] Error retrieving enterprise gallery manifest", error);
        this.update(null, "accessDenied" /* AccessDenied */);
      }
    }
  }
  update(manifest, status2) {
    this.logService.debug(`[Marketplace] Updating manifest ${manifest ? "available" : "unavailable"}`);
    if (this.extensionGalleryManifest !== manifest) {
      this.extensionGalleryManifest = manifest;
      this._onDidChangeExtensionGalleryManifest.fire(manifest);
    }
    this.updateStatus(status2 ?? (this.extensionGalleryManifest ? "available" /* Available */ : "unavailable" /* Unavailable */));
  }
  updateStatus(status2) {
    if (this.currentStatus !== status2) {
      this.currentStatus = status2;
      this._onDidChangeExtensionGalleryManifestStatus.fire(status2);
    }
  }
  checkAccess(account) {
    this.logService.debug("[Marketplace] Checking Account SKU access for configured gallery", account.entitlementsData?.access_type_sku);
    if (account.entitlementsData?.access_type_sku && this.productService.extensionsGallery?.accessSKUs?.includes(account.entitlementsData.access_type_sku)) {
      this.logService.debug("[Marketplace] Account has access to configured gallery");
      return true;
    }
    this.logService.debug("[Marketplace] Checking enterprise account access for configured gallery", account.enterprise);
    return account.enterprise;
  }
  async requestRestart() {
    const confirmation = await this.dialogService.confirm({
      message: localize(23003, null, this.productService.nameLong),
      primaryButton: localize(23004, null)
    });
    if (confirmation.confirmed) {
      return this.hostService.restart();
    }
  }
  async getExtensionGalleryManifestFromServiceUrl(url) {
    const commonHeaders = await this.commonHeadersPromise;
    const headers = {
      ...commonHeaders,
      "Content-Type": "application/json",
      "Accept-Encoding": "gzip"
    };
    try {
      const context2 = await this.requestService.request({
        type: "GET",
        url,
        headers,
        callSite: "extensionGalleryManifestService.fetchManifest"
      }, CancellationToken.None);
      const extensionGalleryManifest = await asJson(context2);
      if (!extensionGalleryManifest) {
        throw new Error("Unable to retrieve extension gallery manifest.");
      }
      return extensionGalleryManifest;
    } catch (error) {
      this.logService.error("[Marketplace] Error retrieving extension gallery manifest", error);
      throw error;
    }
  }
};

WorkbenchExtensionGalleryManifestService = __decorateClass([
  __decorateParam(0, IProductService),
  __decorateParam(1, IEnvironmentService),
  __decorateParam(2, IFileService),
  __decorateParam(3, ITelemetryService),
  __decorateParam(4, IStorageService),
  __decorateParam(5, IRemoteAgentService),
  __decorateParam(6, ISharedProcessService),
  __decorateParam(7, IConfigurationService),
  __decorateParam(8, IRequestService),
  __decorateParam(9, IDefaultAccountService),
  __decorateParam(10, ILogService),
  __decorateParam(11, IDialogService),
  __decorateParam(12, IHostService)
], WorkbenchExtensionGalleryManifestService);

registerSingleton(IExtensionGalleryManifestService, WorkbenchExtensionGalleryManifestService, 0 /* Eager */);
export { WorkbenchExtensionGalleryManifestService };
