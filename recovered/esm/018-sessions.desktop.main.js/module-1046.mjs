// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/platform/extensionManagement/common/extensionManagementCLI.ts
import { localize } from "./module-0001.mjs";
import { EXTENSION_CATEGORIES } from "./module-0688.mjs";
import { URI } from "./module-0032.mjs";
import { areSameExtensions, getExtensionId, getGalleryExtensionId, getIdAndVersion } from "./module-0888.mjs";
import { getErrorMessage, isCancellationError } from "./module-0004.mjs";
import { CancellationToken } from "./module-0025.mjs";
import { gt } from "./module-1045.mjs";
import { basename2 } from "./module-0034.mjs";
import { EXTENSION_IDENTIFIER_REGEX, IExtensionGalleryService, IExtensionManagementService } from "./module-0874.mjs";
import { Schemas } from "./module-0033.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IProductService } from "./module-0875.mjs";


// src/vs/platform/extensionManagement/common/extensionManagementCLI.ts
var notFound = (id2) => localize(2955, null, id2);

var useId = localize(2968, null, "ms-dotnettools.csharp");

var ExtensionManagementCLI = class {
  constructor(extensionsForceVersionByQuality, logger, extensionManagementService, extensionGalleryService, productService) {
    this.extensionsForceVersionByQuality = extensionsForceVersionByQuality;
    this.logger = logger;
    this.extensionManagementService = extensionManagementService;
    this.extensionGalleryService = extensionGalleryService;
    this.productService = productService;
    this.extensionsForceVersionByQuality = this.extensionsForceVersionByQuality.map((e4) => e4.toLowerCase());
  }
  get location() {
    return void 0;
  }
  async listExtensions(showVersions, category9, profileLocation) {
    let extensions = await this.extensionManagementService.getInstalled(1 /* User */, profileLocation);
    const categories = EXTENSION_CATEGORIES.map((c) => c.toLowerCase());
    if (category9 && category9 !== "") {
      if (categories.indexOf(category9.toLowerCase()) < 0) {
        this.logger.info("Invalid category please enter a valid category. To list valid categories run --category without a category specified");
        return;
      }
      extensions = extensions.filter((e4) => {
        if (e4.manifest.categories) {
          const lowerCaseCategories = e4.manifest.categories.map((c) => c.toLowerCase());
          return lowerCaseCategories.indexOf(category9.toLowerCase()) > -1;
        }
        return false;
      });
    } else if (category9 === "") {
      this.logger.info("Possible Categories: ");
      categories.forEach((category10) => {
        this.logger.info(category10);
      });
      return;
    }
    if (this.location) {
      this.logger.info(localize(2954, null, this.location));
    }
    extensions = extensions.sort((e1, e22) => e1.identifier.id.localeCompare(e22.identifier.id));
    let lastId = void 0;
    for (const extension of extensions) {
      if (lastId !== extension.identifier.id) {
        lastId = extension.identifier.id;
        this.logger.info(showVersions ? `${lastId}@${extension.manifest.version}` : lastId);
      }
    }
  }
  async installExtensions(extensions, builtinExtensions, installOptions, force) {
    const failed = [];
    try {
      if (extensions.length) {
        this.logger.info(this.location ? localize(2953, null, this.location) : localize(2952, null));
      }
      const installVSIXInfos = [];
      const installExtensionInfos = [];
      const addInstallExtensionInfo = (id2, version2, isBuiltin) => {
        if (this.extensionsForceVersionByQuality?.some((e4) => e4 === id2.toLowerCase())) {
          version2 = this.productService.quality !== "stable" ? "prerelease" : void 0;
        }
        installExtensionInfos.push({ id: id2, version: version2 !== "prerelease" ? version2 : void 0, installOptions: { ...installOptions, isBuiltin, installPreReleaseVersion: version2 === "prerelease" || installOptions.installPreReleaseVersion } });
      };
      for (const extension of extensions) {
        if (extension instanceof URI) {
          installVSIXInfos.push({ vsix: extension, installOptions });
        } else {
          const [id2, version2] = getIdAndVersion(extension);
          addInstallExtensionInfo(id2, version2, false);
        }
      }
      for (const extension of builtinExtensions) {
        if (extension instanceof URI) {
          installVSIXInfos.push({ vsix: extension, installOptions: { ...installOptions, isBuiltin: true, donotIncludePackAndDependencies: true } });
        } else {
          const [id2, version2] = getIdAndVersion(extension);
          addInstallExtensionInfo(id2, version2, true);
        }
      }
      const installed = await this.extensionManagementService.getInstalled(void 0, installOptions.profileLocation);
      if (installVSIXInfos.length) {
        await Promise.all(installVSIXInfos.map(async ({ vsix, installOptions: installOptions2 }) => {
          try {
            await this.installVSIX(vsix, installOptions2, force, installed);
          } catch (err) {
            this.logger.error(err);
            failed.push(vsix.toString());
          }
        }));
      }
      if (installExtensionInfos.length) {
        const failedGalleryExtensions = await this.installGalleryExtensions(installExtensionInfos, installed, force);
        failed.push(...failedGalleryExtensions);
      }
    } catch (error) {
      this.logger.error(localize(2942, null, getErrorMessage(error)));
      throw error;
    }
    if (failed.length) {
      throw new Error(localize(2947, null, failed.join(", ")));
    }
  }
  async updateExtensions(profileLocation) {
    const installedExtensions = await this.extensionManagementService.getInstalled(1 /* User */, profileLocation);
    const installedExtensionsQuery = [];
    for (const extension of installedExtensions) {
      if (!!extension.identifier.uuid) {
        installedExtensionsQuery.push({ ...extension.identifier, preRelease: extension.preRelease });
      }
    }
    this.logger.trace(localize(2966, null, installedExtensionsQuery.length));
    const availableVersions = await this.extensionGalleryService.getExtensions(installedExtensionsQuery, { compatible: true }, CancellationToken.None);
    const extensionsToUpdate = [];
    for (const newVersion of availableVersions) {
      for (const oldVersion of installedExtensions) {
        if (areSameExtensions(oldVersion.identifier, newVersion.identifier) && gt(newVersion.version, oldVersion.manifest.version)) {
          extensionsToUpdate.push({
            extension: newVersion,
            options: { operation: 3 /* Update */, installPreReleaseVersion: oldVersion.preRelease, profileLocation, isApplicationScoped: oldVersion.isApplicationScoped }
          });
        }
      }
    }
    if (!extensionsToUpdate.length) {
      this.logger.info(localize(2965, null));
      return;
    }
    this.logger.info(localize(2964, null, extensionsToUpdate.map((ext) => ext.extension.identifier.id).join(", ")));
    const installationResult = await this.extensionManagementService.installGalleryExtensions(extensionsToUpdate);
    for (const extensionResult of installationResult) {
      if (extensionResult.error) {
        this.logger.error(localize(2944, null, extensionResult.identifier.id, getErrorMessage(extensionResult.error)));
      } else {
        this.logger.info(localize(2961, null, extensionResult.identifier.id, extensionResult.local?.manifest.version));
      }
    }
  }
  async installGalleryExtensions(installExtensionInfos, installed, force) {
    installExtensionInfos = installExtensionInfos.filter((installExtensionInfo) => {
      const { id: id2, version: version2, installOptions } = installExtensionInfo;
      const installedExtension = installed.find((i2) => areSameExtensions(i2.identifier, { id: id2 }));
      if (installedExtension) {
        const builtinAutoUpdateMessage = this.validateBuiltinExtensionEnabledWithAutoUpdates(installedExtension);
        if (builtinAutoUpdateMessage) {
          this.logger.info(builtinAutoUpdateMessage);
          return false;
        }
        if (!force && (!version2 || version2 === "prerelease" && installedExtension.preRelease)) {
          this.logger.info(localize(2938, null, id2, installedExtension.manifest.version, id2));
          return false;
        }
        if (version2 && installedExtension.manifest.version === version2) {
          this.logger.info(localize(2937, null, `${id2}@${version2}`));
          return false;
        }
        if (installedExtension.preRelease && version2 !== "prerelease") {
          installOptions.preRelease = false;
        }
      }
      return true;
    });
    if (!installExtensionInfos.length) {
      return [];
    }
    const failed = [];
    const extensionsToInstall = [];
    const galleryExtensions = await this.getGalleryExtensions(installExtensionInfos);
    await Promise.all(installExtensionInfos.map(async ({ id: id2, version: version2, installOptions }) => {
      const gallery = galleryExtensions.get(id2.toLowerCase());
      if (!gallery) {
        this.logger.error(`${notFound(version2 ? `${id2}@${version2}` : id2)}
${useId}`);
        failed.push(id2);
        return;
      }
      try {
        const manifest = await this.extensionGalleryService.getManifest(gallery, CancellationToken.None);
        if (manifest && !this.validateExtensionKind(manifest)) {
          return;
        }
      } catch (err) {
        this.logger.error(err.message || err.stack || err);
        failed.push(id2);
        return;
      }
      const installedExtension = installed.find((e4) => areSameExtensions(e4.identifier, gallery.identifier));
      if (installedExtension) {
        if (gallery.version === installedExtension.manifest.version) {
          this.logger.info(localize(2937, null, version2 ? `${id2}@${version2}` : id2));
          return;
        }
        this.logger.info(localize(2967, null, id2, gallery.version));
      }
      if (installOptions.isBuiltin) {
        this.logger.info(version2 ? localize(2950, null, id2, version2) : localize(2949, null, id2));
      } else {
        this.logger.info(version2 ? localize(2951, null, id2, version2) : localize(2948, null, id2));
      }
      extensionsToInstall.push({
        extension: gallery,
        options: { ...installOptions, installGivenVersion: !!version2, isApplicationScoped: installOptions.isApplicationScoped || installedExtension?.isApplicationScoped }
      });
    }));
    if (extensionsToInstall.length) {
      const installationResult = await this.extensionManagementService.installGalleryExtensions(extensionsToInstall);
      for (const extensionResult of installationResult) {
        if (extensionResult.error) {
          this.logger.error(localize(2943, null, extensionResult.identifier.id, getErrorMessage(extensionResult.error)));
          failed.push(extensionResult.identifier.id);
        } else {
          this.logger.info(localize(2958, null, extensionResult.identifier.id, extensionResult.local?.manifest.version));
        }
      }
    }
    return failed;
  }
  async installVSIX(vsix, installOptions, force, installedExtensions) {
    const manifest = await this.extensionManagementService.getManifest(vsix);
    if (!manifest) {
      throw new Error("Invalid vsix");
    }
    const valid2 = await this.validateVSIX(manifest, force, installOptions.profileLocation, installedExtensions);
    if (valid2) {
      try {
        await this.extensionManagementService.install(vsix, { ...installOptions, installGivenVersion: true });
        this.logger.info(localize(2962, null, basename2(vsix)));
      } catch (error) {
        if (isCancellationError(error)) {
          this.logger.info(localize(2941, null, basename2(vsix)));
        } else {
          throw error;
        }
      }
    }
  }
  async getGalleryExtensions(extensions) {
    const galleryExtensions = /* @__PURE__ */ new Map();
    const preRelease = extensions.some((e4) => e4.installOptions.installPreReleaseVersion);
    const targetPlatform = await this.extensionManagementService.getTargetPlatform();
    const extensionInfos = [];
    for (const extension of extensions) {
      if (EXTENSION_IDENTIFIER_REGEX.test(extension.id)) {
        extensionInfos.push({ ...extension, preRelease });
      }
    }
    if (extensionInfos.length) {
      const result = await this.extensionGalleryService.getExtensions(extensionInfos, { targetPlatform }, CancellationToken.None);
      for (const extension of result) {
        galleryExtensions.set(extension.identifier.id.toLowerCase(), extension);
      }
    }
    return galleryExtensions;
  }
  validateExtensionKind(_manifest) {
    return true;
  }
  async validateVSIX(manifest, force, profileLocation, installedExtensions) {
    const extensionIdentifier = { id: getGalleryExtensionId(manifest.publisher, manifest.name) };
    const existingExtension = installedExtensions.find((local) => areSameExtensions(extensionIdentifier, local.identifier));
    if (existingExtension) {
      const builtinAutoUpdateMessage = this.validateBuiltinExtensionEnabledWithAutoUpdates(existingExtension);
      if (builtinAutoUpdateMessage) {
        this.logger.info(builtinAutoUpdateMessage);
        return false;
      }
      if (!force) {
        if (gt(existingExtension.manifest.version, manifest.version)) {
          this.logger.info(localize(2945, null, existingExtension.identifier.id, existingExtension.manifest.version, manifest.version));
          return false;
        }
      }
    }
    return this.validateExtensionKind(manifest);
  }
  async uninstallExtensions(extensions, force, profileLocation) {
    const getId = async (extensionDescription) => {
      if (extensionDescription instanceof URI) {
        const manifest = await this.extensionManagementService.getManifest(extensionDescription);
        return getExtensionId(manifest.publisher, manifest.name);
      }
      return extensionDescription;
    };
    const uninstalledExtensions = [];
    for (const extension of extensions) {
      const id2 = await getId(extension);
      const installed = await this.extensionManagementService.getInstalled(void 0, profileLocation);
      const extensionsToUninstall = installed.filter((e4) => areSameExtensions(e4.identifier, { id: id2 }));
      if (!extensionsToUninstall.length) {
        throw new Error(`${this.notInstalled(id2)}
${useId}`);
      }
      if (extensionsToUninstall.some((e4) => e4.type === 0 /* System */)) {
        this.logger.info(localize(2939, null, id2));
        return;
      }
      if (!force && extensionsToUninstall.some((e4) => e4.isBuiltin)) {
        this.logger.info(localize(2946, null, id2));
        return;
      }
      this.logger.info(localize(2963, null, id2));
      for (const extensionToUninstall of extensionsToUninstall) {
        await this.extensionManagementService.uninstall(extensionToUninstall, { profileLocation });
        uninstalledExtensions.push(extensionToUninstall);
      }
      if (this.location) {
        this.logger.info(localize(2960, null, id2, this.location));
      } else {
        this.logger.info(localize(2959, null, id2));
      }
    }
  }
  async locateExtension(extensions) {
    const installed = await this.extensionManagementService.getInstalled();
    extensions.forEach((e4) => {
      installed.forEach((i2) => {
        if (i2.identifier.id === e4) {
          if (i2.location.scheme === Schemas.file) {
            this.logger.info(i2.location.fsPath);
            return;
          }
        }
      });
    });
  }
  notInstalled(id2) {
    return this.location ? localize(2957, null, id2, this.location) : localize(2956, null, id2);
  }
  validateBuiltinExtensionEnabledWithAutoUpdates(extension) {
    if (extension.isBuiltin && this.productService.builtInExtensionsEnabledWithAutoUpdates.some((e4) => e4.toLowerCase() === extension.identifier.id.toLowerCase()) && !extension.forceAutoUpdate) {
      return localize(2940, null, extension.identifier.id, this.productService.quality);
    }
    return void 0;
  }
};

ExtensionManagementCLI = __decorateClass([
  __decorateParam(2, IExtensionManagementService),
  __decorateParam(3, IExtensionGalleryService),
  __decorateParam(4, IProductService)
], ExtensionManagementCLI);
export { notFound, useId, ExtensionManagementCLI };
