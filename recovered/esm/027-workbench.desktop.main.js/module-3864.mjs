// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/services/extensionManagement/electron-browser/remoteExtensionManagementService.ts
import { RemoteExtensionManagementService } from "./module-3863.mjs";
import { isBoolean, isUndefined } from "./module-0010.mjs";
import { EXTENSION_INSTALL_CLIENT_TARGET_PLATFORM_CONTEXT, ExtensionManagementError, IAllowedExtensionsService, IExtensionGalleryService, VerifyExtensionSignatureConfigKey } from "./module-0872.mjs";
import { toErrorMessage } from "./module-0094.mjs";
import { CancellationToken } from "./module-0025.mjs";
import { areSameExtensions } from "./module-0886.mjs";
import { localize } from "./module-0001.mjs";
import { Promises } from "./module-0036.mjs";
import { isNonEmptyArray } from "./module-0007.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IProductService } from "./module-0873.mjs";
import { IUserDataProfileService } from "./module-0997.mjs";
import { IUserDataProfilesService } from "./module-0511.mjs";
import { IRemoteUserDataProfilesService } from "./module-1203.mjs";
import { IUriIdentityService } from "./module-0510.mjs";
import { ILogService } from "./module-0095.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IFileService } from "./module-0269.mjs";
import { IExtensionManifestPropertiesService } from "./module-1048.mjs";


// src/vs/workbench/services/extensionManagement/electron-browser/remoteExtensionManagementService.ts
var NativeRemoteExtensionManagementService = class extends RemoteExtensionManagementService {
  constructor(channel, localExtensionManagementServer, productService, userDataProfileService, userDataProfilesService, remoteUserDataProfilesService, uriIdentityService, logService, galleryService, configurationService, allowedExtensionsService, fileService, extensionManifestPropertiesService) {
    super(channel, productService, allowedExtensionsService, userDataProfileService, userDataProfilesService, remoteUserDataProfilesService, uriIdentityService);
    this.localExtensionManagementServer = localExtensionManagementServer;
    this.logService = logService;
    this.galleryService = galleryService;
    this.configurationService = configurationService;
    this.fileService = fileService;
    this.extensionManifestPropertiesService = extensionManifestPropertiesService;
  }
  async install(vsix, options3) {
    const local = await super.install(vsix, options3);
    await this.installUIDependenciesAndPackedExtensions(local);
    return local;
  }
  async installFromGallery(extension, installOptions = {}) {
    if (isUndefined(installOptions.donotVerifySignature)) {
      const value2 = this.configurationService.getValue(VerifyExtensionSignatureConfigKey);
      installOptions.donotVerifySignature = isBoolean(value2) ? !value2 : void 0;
    }
    const local = await this.doInstallFromGallery(extension, installOptions);
    await this.installUIDependenciesAndPackedExtensions(local);
    return local;
  }
  async doInstallFromGallery(extension, installOptions) {
    if (installOptions.downloadExtensionsLocally || this.configurationService.getValue("remote.downloadExtensionsLocally")) {
      return this.downloadAndInstall(extension, installOptions);
    }
    try {
      const clientTargetPlatform = await this.localExtensionManagementServer.extensionManagementService.getTargetPlatform();
      return await super.installFromGallery(extension, { ...installOptions, context: { ...installOptions?.context, [EXTENSION_INSTALL_CLIENT_TARGET_PLATFORM_CONTEXT]: clientTargetPlatform } });
    } catch (error) {
      switch (error.name) {
        case "Download" /* Download */:
        case "DownloadSignature" /* DownloadSignature */:
        case "Gallery" /* Gallery */:
        case "Internal" /* Internal */:
        case "Unknown" /* Unknown */:
          try {
            this.logService.error(`Error while installing '${extension.identifier.id}' extension in the remote server.`, toErrorMessage(error));
            return await this.downloadAndInstall(extension, installOptions);
          } catch (e) {
            this.logService.error(e);
            throw e;
          }
        default:
          this.logService.debug("Remote Install Error Name", error.name);
          throw error;
      }
    }
  }
  async downloadAndInstall(extension, installOptions) {
    this.logService.info(`Downloading the '${extension.identifier.id}' extension locally and install`);
    const compatible = await this.checkAndGetCompatible(extension, !!installOptions.installPreReleaseVersion);
    installOptions = { ...installOptions, donotIncludePackAndDependencies: true };
    const installed = await this.getInstalled(1 /* User */, void 0, installOptions.productVersion);
    const workspaceExtensions = await this.getAllWorkspaceDependenciesAndPackedExtensions(compatible, CancellationToken.None);
    if (workspaceExtensions.length) {
      this.logService.info(`Downloading the workspace dependencies and packed extensions of '${compatible.identifier.id}' locally and install`);
      for (const workspaceExtension of workspaceExtensions) {
        await this.downloadCompatibleAndInstall(workspaceExtension, installed, installOptions);
      }
    }
    return await this.downloadCompatibleAndInstall(compatible, installed, installOptions);
  }
  async downloadCompatibleAndInstall(extension, installed, installOptions) {
    const compatible = await this.checkAndGetCompatible(extension, !!installOptions.installPreReleaseVersion);
    this.logService.trace("Downloading extension:", compatible.identifier.id);
    const location2 = await this.localExtensionManagementServer.extensionManagementService.download(compatible, installed.filter((i2) => areSameExtensions(i2.identifier, compatible.identifier))[0] ? 3 /* Update */ : 2 /* Install */, !!installOptions.donotVerifySignature);
    this.logService.info("Downloaded extension:", compatible.identifier.id, location2.path);
    try {
      const local = await super.install(location2, { ...installOptions, keepExisting: true });
      this.logService.info(`Successfully installed '${compatible.identifier.id}' extension`);
      return local;
    } finally {
      try {
        await this.fileService.del(location2);
      } catch (error) {
        this.logService.error(error);
      }
    }
  }
  async checkAndGetCompatible(extension, includePreRelease) {
    const targetPlatform = await this.getTargetPlatform();
    let compatibleExtension = null;
    if (extension.hasPreReleaseVersion && extension.properties.isPreReleaseVersion !== includePreRelease) {
      compatibleExtension = (await this.galleryService.getExtensions([{ ...extension.identifier, preRelease: includePreRelease }], { targetPlatform, compatible: true }, CancellationToken.None))[0] || null;
    }
    if (!compatibleExtension && await this.galleryService.isExtensionCompatible(extension, includePreRelease, targetPlatform)) {
      compatibleExtension = extension;
    }
    if (!compatibleExtension) {
      compatibleExtension = await this.galleryService.getCompatibleExtension(extension, includePreRelease, targetPlatform);
    }
    if (!compatibleExtension) {
      if (!includePreRelease && extension.properties.isPreReleaseVersion && (await this.galleryService.getExtensions([extension.identifier], CancellationToken.None))[0]) {
        throw new ExtensionManagementError(localize(23008, null, extension.identifier.id), "ReleaseVersionNotFound" /* ReleaseVersionNotFound */);
      }
      throw new ExtensionManagementError(localize(23007, null, extension.identifier.id, this.productService.nameLong, this.productService.version), "Incompatible" /* Incompatible */);
    }
    return compatibleExtension;
  }
  async installUIDependenciesAndPackedExtensions(local) {
    const uiExtensions = await this.getAllUIDependenciesAndPackedExtensions(local.manifest, CancellationToken.None);
    const installed = await this.localExtensionManagementServer.extensionManagementService.getInstalled();
    const toInstall = uiExtensions.filter((e) => installed.every((i2) => !areSameExtensions(i2.identifier, e.identifier)));
    if (toInstall.length) {
      this.logService.info(`Installing UI dependencies and packed extensions of '${local.identifier.id}' locally`);
      await Promises.settled(toInstall.map((d) => this.localExtensionManagementServer.extensionManagementService.installFromGallery(d)));
    }
  }
  async getAllUIDependenciesAndPackedExtensions(manifest, token) {
    const result = /* @__PURE__ */ new Map();
    const extensions = [...manifest.extensionPack || [], ...manifest.extensionDependencies || []];
    await this.getDependenciesAndPackedExtensionsRecursively(extensions, result, true, token);
    return [...result.values()];
  }
  async getAllWorkspaceDependenciesAndPackedExtensions(extension, token) {
    const result = /* @__PURE__ */ new Map();
    result.set(extension.identifier.id.toLowerCase(), extension);
    const manifest = await this.galleryService.getManifest(extension, token);
    if (manifest) {
      const extensions = [...manifest.extensionPack || [], ...manifest.extensionDependencies || []];
      await this.getDependenciesAndPackedExtensionsRecursively(extensions, result, false, token);
    }
    result.delete(extension.identifier.id);
    return [...result.values()];
  }
  async getDependenciesAndPackedExtensionsRecursively(toGet, result, uiExtension, token) {
    if (toGet.length === 0) {
      return Promise.resolve();
    }
    const extensions = await this.galleryService.getExtensions(toGet.map((id2) => ({ id: id2 })), token);
    const manifests = await Promise.all(extensions.map((e) => this.galleryService.getManifest(e, token)));
    const extensionsManifests = [];
    for (let idx = 0; idx < extensions.length; idx++) {
      const extension = extensions[idx];
      const manifest = manifests[idx];
      if (manifest && this.extensionManifestPropertiesService.prefersExecuteOnUI(manifest) === uiExtension) {
        result.set(extension.identifier.id.toLowerCase(), extension);
        extensionsManifests.push(manifest);
      }
    }
    toGet = [];
    for (const extensionManifest of extensionsManifests) {
      if (isNonEmptyArray(extensionManifest.extensionDependencies)) {
        for (const id2 of extensionManifest.extensionDependencies) {
          if (!result.has(id2.toLowerCase())) {
            toGet.push(id2);
          }
        }
      }
      if (isNonEmptyArray(extensionManifest.extensionPack)) {
        for (const id2 of extensionManifest.extensionPack) {
          if (!result.has(id2.toLowerCase())) {
            toGet.push(id2);
          }
        }
      }
    }
    return this.getDependenciesAndPackedExtensionsRecursively(toGet, result, uiExtension, token);
  }
};

NativeRemoteExtensionManagementService = __decorateClass([
  __decorateParam(2, IProductService),
  __decorateParam(3, IUserDataProfileService),
  __decorateParam(4, IUserDataProfilesService),
  __decorateParam(5, IRemoteUserDataProfilesService),
  __decorateParam(6, IUriIdentityService),
  __decorateParam(7, ILogService),
  __decorateParam(8, IExtensionGalleryService),
  __decorateParam(9, IConfigurationService),
  __decorateParam(10, IAllowedExtensionsService),
  __decorateParam(11, IFileService),
  __decorateParam(12, IExtensionManifestPropertiesService)
], NativeRemoteExtensionManagementService);
export { NativeRemoteExtensionManagementService };
