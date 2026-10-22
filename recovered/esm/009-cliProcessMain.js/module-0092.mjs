// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/code/node/cliProcessMain.js
// Original module marker: src/vs/platform/extensionManagement/node/extensionManagementService.ts
import { IInstantiationService, refineServiceDecorator } from "./module-0030.mjs";
import { EXTENSION_INSTALL_CLIENT_TARGET_PLATFORM_CONTEXT, ExtensionManagementError, IAllowedExtensionsService, IExtensionGalleryService, IExtensionManagementService, VerifyExtensionSignatureConfigKey, computeSize, shouldRequireRepositorySignatureFor } from "./module-0066.mjs";
import { AbstractExtensionManagementService, AbstractExtensionTask, toExtensionManagementError } from "./module-0104.mjs";
import { ResourceMap, ResourceSet } from "./module-0007.mjs";
import { ExtensionsLifecycle } from "./module-0107.mjs";
import { ExtensionsManifestCache } from "./module-0108.mjs";
import { ExtensionsDownloader } from "./module-0106.mjs";
import { ExtensionsWatcher } from "./module-0109.mjs";
import { ExtensionKey, areSameExtensions, computeTargetPlatform, getGalleryExtensionId, groupByExtension } from "./module-0071.mjs";
import { extract, zip } from "./module-0095.mjs";
import { joinPath } from "./module-0026.mjs";
import { generateUuid } from "./module-0067.mjs";
import { URI } from "./module-0024.mjs";
import { join, relative, resolve } from "./module-0019.mjs";
import { fromExtractError, getManifest } from "./module-0105.mjs";
import { isEngineValid } from "./module-0073.mjs";
import { localize } from "./module-0013.mjs";
import { Schemas } from "./module-0025.mjs";
import { CancellationError, getErrorMessage } from "./module-0003.mjs";
import { isBoolean, isDefined, isUndefined } from "./module-0009.mjs";
import { Promises2 } from "./module-0093.mjs";
import { IFileService, toFileOperationResult } from "./module-0044.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ITelemetryService } from "./module-0069.mjs";
import { ILogService } from "./module-0049.mjs";
import { IEnvironmentService, INativeEnvironmentService } from "./module-0056.mjs";
import { IExtensionsScannerService, uninstallBuiltinExtension } from "./module-0091.mjs";
import { IExtensionsProfileScannerService } from "./module-0088.mjs";
import { IDownloadService } from "./module-0053.mjs";
import { IConfigurationService } from "./module-0031.mjs";
import { IExtensionGalleryManifestService } from "./module-0084.mjs";
import { IProductService } from "./module-0074.mjs";
import { IUriIdentityService } from "./module-0079.mjs";
import { IUserDataProfilesService } from "./module-0080.mjs";
import { Disposable } from "./module-0011.mjs";
import { Emitter } from "./module-0017.mjs";
import { Promises, Queue } from "./module-0028.mjs";
import { hash } from "./module-0046.mjs";
import { VSBuffer } from "./module-0033.mjs";
import { gt, lt, rcompare } from "./module-0062.mjs";


// src/vs/platform/extensionManagement/node/extensionManagementService.ts
import * as fs2 from "fs";


// src/vs/platform/extensionManagement/node/extensionManagementService.ts
var INativeServerExtensionManagementService = refineServiceDecorator(IExtensionManagementService);

var DELETED_FOLDER_POSTFIX = ".vsctmp";

var ExtensionManagementService = class extends AbstractExtensionManagementService {
  constructor(galleryService, telemetryService, logService, environmentService, extensionsScannerService, extensionsProfileScannerService, downloadService, instantiationService, fileService, configurationService, extensionGalleryManifestService, productService, allowedExtensionsService, uriIdentityService, userDataProfilesService) {
    super(galleryService, telemetryService, uriIdentityService, logService, productService, allowedExtensionsService, userDataProfilesService);
    this.environmentService = environmentService;
    this.extensionsScannerService = extensionsScannerService;
    this.extensionsProfileScannerService = extensionsProfileScannerService;
    this.downloadService = downloadService;
    this.instantiationService = instantiationService;
    this.fileService = fileService;
    this.configurationService = configurationService;
    this.extensionGalleryManifestService = extensionGalleryManifestService;
    this.extractingGalleryExtensions = /* @__PURE__ */ new Map();
    this.knownDirectories = new ResourceSet();
    const extensionLifecycle = this._register(instantiationService.createInstance(ExtensionsLifecycle));
    this.extensionsScanner = this._register(instantiationService.createInstance(ExtensionsScanner2, (extension) => extensionLifecycle.postUninstall(extension)));
    this.manifestCache = this._register(new ExtensionsManifestCache(userDataProfilesService, fileService, uriIdentityService, this, this.logService));
    this.extensionsDownloader = this._register(instantiationService.createInstance(ExtensionsDownloader));
    const extensionsWatcher = this._register(new ExtensionsWatcher(this, this.extensionsScannerService, userDataProfilesService, extensionsProfileScannerService, uriIdentityService, fileService, logService));
    this._register(extensionsWatcher.onDidChangeExtensionsByAnotherSource((e) => this.onDidChangeExtensionsFromAnotherSource(e)));
    this.watchForExtensionsNotInstalledBySystem();
  }
  getTargetPlatform() {
    if (!this._targetPlatformPromise) {
      this._targetPlatformPromise = computeTargetPlatform(this.fileService, this.logService);
    }
    return this._targetPlatformPromise;
  }
  async zip(extension) {
    this.logService.trace("ExtensionManagementService#zip", extension.identifier.id);
    const files = await this.collectFiles(extension);
    const location = await zip(joinPath(this.extensionsDownloader.extensionsDownloadDir, generateUuid()).fsPath, files);
    return URI.file(location);
  }
  async getManifest(vsix) {
    const { location, cleanup } = await this.downloadVsix(vsix);
    const zipPath = resolve(location.fsPath);
    try {
      return await getManifest(zipPath);
    } finally {
      await cleanup();
    }
  }
  getInstalled(type, profileLocation = this.userDataProfilesService.defaultProfile.extensionsResource, productVersion = { version: this.productService.version, date: this.productService.date }, language2) {
    return this.extensionsScanner.scanExtensions(type ?? null, profileLocation, productVersion, language2);
  }
  scanAllUserInstalledExtensions() {
    return this.extensionsScanner.scanAllUserExtensions();
  }
  scanInstalledExtensionAtLocation(location) {
    return this.extensionsScanner.scanUserExtensionAtLocation(location);
  }
  async install(vsix, options = {}) {
    this.logService.trace("ExtensionManagementService#install", vsix.toString());
    const { location, cleanup } = await this.downloadVsix(vsix);
    try {
      const manifest = await getManifest(resolve(location.fsPath));
      const extensionId = getGalleryExtensionId(manifest.publisher, manifest.name);
      if (manifest.engines && manifest.engines.vscode && !isEngineValid(manifest.engines.vscode, this.productService.version, this.productService.date)) {
        throw new Error(localize(2979, null, extensionId, this.productService.version));
      }
      const allowedToInstall = this.allowedExtensionsService.isAllowed({ id: extensionId, version: manifest.version, publisherDisplayName: void 0 });
      if (allowedToInstall !== true) {
        throw new Error(localize(2981, null, allowedToInstall.value));
      }
      const results = await this.installExtensions([{ manifest, extension: location, options }]);
      const result = results.find(({ identifier }) => areSameExtensions(identifier, { id: extensionId }));
      if (result?.local) {
        return result.local;
      }
      if (result?.error) {
        throw result.error;
      }
      throw toExtensionManagementError(new Error(`Unknown error while installing extension ${extensionId}`));
    } finally {
      await cleanup();
    }
  }
  async installFromLocation(location, profileLocation) {
    this.logService.trace("ExtensionManagementService#installFromLocation", location.toString());
    const local = await this.extensionsScanner.scanUserExtensionAtLocation(location);
    if (!local || !local.manifest.name || !local.manifest.version) {
      throw new Error(`Cannot find a valid extension from the location ${location.toString()}`);
    }
    await this.addExtensionsToProfile([[local, { source: "resource" }]], profileLocation);
    this.logService.info("Successfully installed extension", local.identifier.id, profileLocation.toString());
    return local;
  }
  async installExtensionsFromProfile(extensions, fromProfileLocation, toProfileLocation) {
    this.logService.trace("ExtensionManagementService#installExtensionsFromProfile", extensions, fromProfileLocation.toString(), toProfileLocation.toString());
    const extensionsToInstall = (await this.getInstalled(1 /* User */, fromProfileLocation)).filter((e) => extensions.some((id2) => areSameExtensions(id2, e.identifier)));
    if (extensionsToInstall.length) {
      const metadata = await Promise.all(extensionsToInstall.map((e) => this.extensionsScanner.scanMetadata(e, fromProfileLocation)));
      await this.addExtensionsToProfile(extensionsToInstall.map((e, index) => [e, metadata[index]]), toProfileLocation);
      this.logService.info("Successfully installed extensions", extensionsToInstall.map((e) => e.identifier.id), toProfileLocation.toString());
    }
    return extensionsToInstall;
  }
  async updateMetadata(local, metadata, profileLocation) {
    this.logService.trace("ExtensionManagementService#updateMetadata", local.identifier.id);
    if (metadata.isPreReleaseVersion) {
      metadata.preRelease = true;
      metadata.hasPreReleaseVersion = true;
    }
    if (metadata.isMachineScoped === false) {
      metadata.isMachineScoped = void 0;
    }
    if (metadata.isBuiltin === false) {
      metadata.isBuiltin = void 0;
    }
    if (metadata.pinned === false) {
      metadata.pinned = void 0;
    }
    local = await this.extensionsScanner.updateMetadata(local, metadata, profileLocation);
    this.manifestCache.invalidate(profileLocation);
    this._onDidUpdateExtensionMetadata.fire({ local, profileLocation });
    return local;
  }
  deleteExtension(extension) {
    return this.extensionsScanner.deleteExtension(extension, "remove");
  }
  copyExtension(extension, fromProfileLocation, toProfileLocation, metadata) {
    return this.extensionsScanner.copyExtension(extension, fromProfileLocation, toProfileLocation, metadata);
  }
  moveExtension(extension, fromProfileLocation, toProfileLocation, metadata) {
    return this.extensionsScanner.moveExtension(extension, fromProfileLocation, toProfileLocation, metadata);
  }
  removeExtension(extension, fromProfileLocation) {
    return this.extensionsScanner.removeExtension(extension.identifier, fromProfileLocation);
  }
  copyExtensions(fromProfileLocation, toProfileLocation) {
    return this.extensionsScanner.copyExtensions(fromProfileLocation, toProfileLocation, { version: this.productService.version, date: this.productService.date });
  }
  deleteExtensions(...extensions) {
    return this.extensionsScanner.setExtensionsForRemoval(...extensions);
  }
  async cleanUp() {
    this.logService.trace("ExtensionManagementService#cleanUp");
    try {
      await this.extensionsScanner.cleanUp();
    } catch (error) {
      this.logService.error(error);
    }
  }
  async download(extension, operation, donotVerifySignature) {
    const { location } = await this.downloadExtension(extension, operation, !donotVerifySignature);
    return location;
  }
  async downloadVsix(vsix) {
    if (vsix.scheme === Schemas.file) {
      return { location: vsix, async cleanup() {
      } };
    }
    this.logService.trace("Downloading extension from", vsix.toString());
    const location = joinPath(this.extensionsDownloader.extensionsDownloadDir, generateUuid());
    await this.downloadService.download(vsix, location, "extensionManagement.downloadVsix");
    this.logService.info("Downloaded extension to", location.toString());
    const cleanup = async () => {
      try {
        await this.fileService.del(location);
      } catch (error) {
        this.logService.error(error);
      }
    };
    return { location, cleanup };
  }
  getCurrentExtensionsManifestLocation() {
    return this.userDataProfilesService.defaultProfile.extensionsResource;
  }
  createInstallExtensionTask(manifest, extension, options) {
    const extensionKey = extension instanceof URI ? new ExtensionKey({ id: getGalleryExtensionId(manifest.publisher, manifest.name) }, manifest.version) : ExtensionKey.create(extension);
    return this.instantiationService.createInstance(InstallExtensionInProfileTask, extensionKey, manifest, extension, options, (operation, token) => {
      if (extension instanceof URI) {
        return this.extractVSIX(extensionKey, extension, options, token);
      }
      let promise = this.extractingGalleryExtensions.get(extensionKey.toString());
      if (!promise) {
        this.extractingGalleryExtensions.set(extensionKey.toString(), promise = this.downloadAndExtractGalleryExtension(extensionKey, extension, operation, options, token));
        promise.finally(() => this.extractingGalleryExtensions.delete(extensionKey.toString()));
      }
      return promise;
    }, this.extensionsScanner);
  }
  createUninstallExtensionTask(extension, options) {
    return new UninstallExtensionInProfileTask(extension, options, this.extensionsProfileScannerService, this.extensionsScannerService, this.fileService, this.productService);
  }
  async downloadAndExtractGalleryExtension(extensionKey, gallery, operation, options, token) {
    const { verificationStatus, location } = await this.downloadExtension(gallery, operation, !options.donotVerifySignature, options.context?.[EXTENSION_INSTALL_CLIENT_TARGET_PLATFORM_CONTEXT]);
    try {
      if (token.isCancellationRequested) {
        throw new CancellationError();
      }
      const manifest = await getManifest(location.fsPath);
      if (!new ExtensionKey(gallery.identifier, gallery.version).equals(new ExtensionKey({ id: getGalleryExtensionId(manifest.publisher, manifest.name) }, manifest.version))) {
        throw new ExtensionManagementError(localize(2980, null, gallery.identifier.id), "Invalid" /* Invalid */);
      }
      const local = await this.extensionsScanner.extractUserExtension(
        extensionKey,
        location.fsPath,
        false,
        token
      );
      if (verificationStatus !== "Success" /* Success */ && this.environmentService.isBuilt) {
        try {
          await this.extensionsDownloader.delete(location);
        } catch (e) {
          this.logService.warn(`Error while deleting the downloaded file`, location.toString(), getErrorMessage(e));
        }
      }
      return { local, verificationStatus };
    } catch (error) {
      try {
        await this.extensionsDownloader.delete(location);
      } catch (e) {
        this.logService.warn(`Error while deleting the downloaded file`, location.toString(), getErrorMessage(e));
      }
      throw toExtensionManagementError(error);
    }
  }
  async downloadExtension(extension, operation, verifySignature, clientTargetPlatform) {
    if (verifySignature) {
      const value = this.configurationService.getValue(VerifyExtensionSignatureConfigKey);
      verifySignature = isBoolean(value) ? value : true;
    }
    const { location, verificationStatus } = await this.extensionsDownloader.download(extension, operation, verifySignature, clientTargetPlatform);
    const shouldRequireSignature = shouldRequireRepositorySignatureFor(extension.private, await this.extensionGalleryManifestService.getExtensionGalleryManifest());
    if (verificationStatus !== "Success" /* Success */ && !(verificationStatus === "NotSigned" /* NotSigned */ && !shouldRequireSignature) && verifySignature && this.environmentService.isBuilt && await this.getTargetPlatform() !== "linux-armhf" /* LINUX_ARMHF */) {
      try {
        await this.extensionsDownloader.delete(location);
      } catch (e) {
        this.logService.warn(`Error while deleting the downloaded file`, location.toString(), getErrorMessage(e));
      }
      if (!verificationStatus) {
        throw new ExtensionManagementError(localize(2984, null), "SignatureVerificationInternal" /* SignatureVerificationInternal */);
      }
      switch (verificationStatus) {
        case "PackageIntegrityCheckFailed" /* PackageIntegrityCheckFailed */:
        case "SignatureIsInvalid" /* SignatureIsInvalid */:
        case "SignatureManifestIsInvalid" /* SignatureManifestIsInvalid */:
        case "SignatureIntegrityCheckFailed" /* SignatureIntegrityCheckFailed */:
        case "EntryIsMissing" /* EntryIsMissing */:
        case "EntryIsTampered" /* EntryIsTampered */:
        case "Untrusted" /* Untrusted */:
        case "CertificateRevoked" /* CertificateRevoked */:
        case "SignatureIsNotValid" /* SignatureIsNotValid */:
        case "SignatureArchiveHasTooManyEntries" /* SignatureArchiveHasTooManyEntries */:
        case "NotSigned" /* NotSigned */:
          throw new ExtensionManagementError(localize(2983, null, verificationStatus), "SignatureVerificationFailed" /* SignatureVerificationFailed */);
      }
      throw new ExtensionManagementError(localize(2983, null, verificationStatus), "SignatureVerificationInternal" /* SignatureVerificationInternal */);
    }
    return { location, verificationStatus };
  }
  async extractVSIX(extensionKey, location, options, token) {
    const local = await this.extensionsScanner.extractUserExtension(
      extensionKey,
      resolve(location.fsPath),
      isBoolean(options.keepExisting) ? !options.keepExisting : true,
      token
    );
    return { local };
  }
  async collectFiles(extension) {
    const collectFilesFromDirectory = async (dir) => {
      let entries = await Promises2.readdir(dir);
      entries = entries.map((e) => join(dir, e));
      const stats = await Promise.all(entries.map((e) => fs2.promises.stat(e)));
      let promise = Promise.resolve([]);
      stats.forEach((stat, index) => {
        const entry = entries[index];
        if (stat.isFile()) {
          promise = promise.then((result) => [...result, entry]);
        }
        if (stat.isDirectory()) {
          promise = promise.then((result) => collectFilesFromDirectory(entry).then((files2) => [...result, ...files2]));
        }
      });
      return promise;
    };
    const files = await collectFilesFromDirectory(extension.location.fsPath);
    return files.map((f) => ({ path: `extension/${relative(extension.location.fsPath, f)}`, localPath: f }));
  }
  async onDidChangeExtensionsFromAnotherSource({ added, removed }) {
    if (removed) {
      const removedExtensions = added && this.uriIdentityService.extUri.isEqual(removed.profileLocation, added.profileLocation) ? removed.extensions.filter((e) => added.extensions.every((identifier) => !areSameExtensions(identifier, e))) : removed.extensions;
      for (const identifier of removedExtensions) {
        this.logService.info("Extensions removed from another source", identifier.id, removed.profileLocation.toString());
        this._onDidUninstallExtension.fire({ identifier, profileLocation: removed.profileLocation });
      }
    }
    if (added) {
      const extensions = await this.getInstalled(1 /* User */, added.profileLocation);
      const addedExtensions = extensions.filter((e) => added.extensions.some((identifier) => areSameExtensions(identifier, e.identifier)));
      this._onDidInstallExtensions.fire(addedExtensions.map((local) => {
        this.logService.info("Extensions added from another source", local.identifier.id, added.profileLocation.toString());
        return { identifier: local.identifier, local, profileLocation: added.profileLocation, operation: 1 /* None */ };
      }));
    }
  }
  async watchForExtensionsNotInstalledBySystem() {
    this._register(this.extensionsScanner.onExtract((resource) => this.knownDirectories.add(resource)));
    const stat = await this.fileService.resolve(this.extensionsScannerService.userExtensionsLocation);
    for (const childStat of stat.children ?? []) {
      if (childStat.isDirectory) {
        this.knownDirectories.add(childStat.resource);
      }
    }
    this._register(this.fileService.watch(this.extensionsScannerService.userExtensionsLocation));
    this._register(this.fileService.onDidFilesChange((e) => this.onDidFilesChange(e)));
  }
  async onDidFilesChange(e) {
    if (!e.affects(this.extensionsScannerService.userExtensionsLocation, 1 /* ADDED */)) {
      return;
    }
    const added = [];
    for (const resource of e.rawAdded) {
      if (this.knownDirectories.has(resource)) {
        continue;
      }
      if (!this.uriIdentityService.extUri.isEqual(this.uriIdentityService.extUri.dirname(resource), this.extensionsScannerService.userExtensionsLocation)) {
        continue;
      }
      if (this.uriIdentityService.extUri.isEqual(resource, this.uriIdentityService.extUri.joinPath(this.extensionsScannerService.userExtensionsLocation, ".obsolete"))) {
        continue;
      }
      if (this.uriIdentityService.extUri.basename(resource).startsWith(".")) {
        continue;
      }
      if (this.uriIdentityService.extUri.basename(resource).endsWith(DELETED_FOLDER_POSTFIX)) {
        continue;
      }
      try {
        if (!(await this.fileService.stat(resource)).isDirectory) {
          continue;
        }
      } catch (error) {
        if (toFileOperationResult(error) !== 1 /* FILE_NOT_FOUND */) {
          this.logService.error(error);
        }
        continue;
      }
      const extension = await this.extensionsScanner.scanUserExtensionAtLocation(resource);
      if (extension && extension.installedTimestamp === void 0) {
        this.knownDirectories.add(resource);
        added.push(extension);
      }
    }
    if (added.length) {
      await this.addExtensionsToProfile(added.map((e2) => [e2, void 0]), this.userDataProfilesService.defaultProfile.extensionsResource);
      this.logService.info("Added extensions to default profile from external source", added.map((e2) => e2.identifier.id));
    }
  }
  async addExtensionsToProfile(extensions, profileLocation) {
    const localExtensions = extensions.map((e) => e[0]);
    await this.extensionsScanner.unsetExtensionsForRemoval(...localExtensions.map((extension) => ExtensionKey.create(extension)));
    await this.extensionsProfileScannerService.addExtensionsToProfile(extensions, profileLocation);
    this._onDidInstallExtensions.fire(localExtensions.map((local) => ({ local, identifier: local.identifier, operation: 1 /* None */, profileLocation })));
  }
};

ExtensionManagementService = __decorateClass([
  __decorateParam(0, IExtensionGalleryService),
  __decorateParam(1, ITelemetryService),
  __decorateParam(2, ILogService),
  __decorateParam(3, INativeEnvironmentService),
  __decorateParam(4, IExtensionsScannerService),
  __decorateParam(5, IExtensionsProfileScannerService),
  __decorateParam(6, IDownloadService),
  __decorateParam(7, IInstantiationService),
  __decorateParam(8, IFileService),
  __decorateParam(9, IConfigurationService),
  __decorateParam(10, IExtensionGalleryManifestService),
  __decorateParam(11, IProductService),
  __decorateParam(12, IAllowedExtensionsService),
  __decorateParam(13, IUriIdentityService),
  __decorateParam(14, IUserDataProfilesService)
], ExtensionManagementService);

var ExtensionsScanner2 = class extends Disposable {
  constructor(beforeRemovingExtension, environmentService, fileService, extensionsScannerService, extensionsProfileScannerService, uriIdentityService, telemetryService, productService, userDataProfilesService, logService) {
    super();
    this.beforeRemovingExtension = beforeRemovingExtension;
    this.environmentService = environmentService;
    this.fileService = fileService;
    this.extensionsScannerService = extensionsScannerService;
    this.extensionsProfileScannerService = extensionsProfileScannerService;
    this.uriIdentityService = uriIdentityService;
    this.telemetryService = telemetryService;
    this.productService = productService;
    this.userDataProfilesService = userDataProfilesService;
    this.logService = logService;
    this._onExtract = this._register(new Emitter());
    this.onExtract = this._onExtract.event;
    this.scanAllExtensionPromise = new ResourceMap();
    this.scanUserExtensionsPromise = new ResourceMap();
    this.obsoletedResource = joinPath(this.extensionsScannerService.userExtensionsLocation, ".obsolete");
    this.obsoleteFileLimiter = new Queue();
  }
  async cleanUp() {
    await this.removeTemporarilyDeletedFolders();
    await this.removeStaleAutoUpdateBuiltinExtensions();
    await this.deleteExtensionsMarkedForRemoval();
    await this.initializeExtensionSize();
  }
  async scanExtensions(type, profileLocation, productVersion, language2) {
    try {
      const cacheKey = profileLocation.with({ query: language2 });
      const userScanOptions = { includeInvalid: true, profileLocation, productVersion, language: language2 };
      let scannedExtensions = [];
      if (type === null || type === 0 /* System */) {
        let scanAllExtensionsPromise = this.scanAllExtensionPromise.get(cacheKey);
        if (!scanAllExtensionsPromise) {
          scanAllExtensionsPromise = this.extensionsScannerService.scanAllExtensions({ language: language2 }, userScanOptions).finally(() => this.scanAllExtensionPromise.delete(cacheKey));
          this.scanAllExtensionPromise.set(cacheKey, scanAllExtensionsPromise);
        }
        scannedExtensions.push(...await scanAllExtensionsPromise);
      } else if (type === 1 /* User */) {
        let scanUserExtensionsPromise = this.scanUserExtensionsPromise.get(cacheKey);
        if (!scanUserExtensionsPromise) {
          scanUserExtensionsPromise = this.extensionsScannerService.scanUserExtensions(userScanOptions).finally(() => this.scanUserExtensionsPromise.delete(cacheKey));
          this.scanUserExtensionsPromise.set(cacheKey, scanUserExtensionsPromise);
        }
        scannedExtensions.push(...await scanUserExtensionsPromise);
      }
      scannedExtensions = type !== null ? scannedExtensions.filter((r) => r.type === type) : scannedExtensions;
      return await Promise.all(scannedExtensions.map((extension) => this.toLocalExtension(extension)));
    } catch (error) {
      throw toExtensionManagementError(error, "Scanning" /* Scanning */);
    }
  }
  async scanAllUserExtensions() {
    try {
      const scannedExtensions = await this.extensionsScannerService.scanAllUserExtensions();
      return await Promise.all(scannedExtensions.map((extension) => this.toLocalExtension(extension)));
    } catch (error) {
      throw toExtensionManagementError(error, "Scanning" /* Scanning */);
    }
  }
  async scanUserExtensionAtLocation(location) {
    try {
      const scannedExtension = await this.extensionsScannerService.scanExistingExtension(location, 1 /* User */, { includeInvalid: true });
      if (scannedExtension) {
        return await this.toLocalExtension(scannedExtension);
      }
    } catch (error) {
      this.logService.error(error);
    }
    return null;
  }
  async extractUserExtension(extensionKey, zipPath, removeIfExists, token) {
    const folderName = extensionKey.toString();
    const tempLocation = URI.file(join(this.extensionsScannerService.userExtensionsLocation.fsPath, `.${generateUuid()}`));
    const extensionLocation = URI.file(join(this.extensionsScannerService.userExtensionsLocation.fsPath, folderName));
    if (await this.fileService.exists(extensionLocation)) {
      if (!removeIfExists) {
        try {
          return await this.scanLocalExtension(extensionLocation, 1 /* User */);
        } catch (error) {
          this.logService.warn(`Error while scanning the existing extension at ${extensionLocation.path}. Deleting the existing extension and extracting it.`, getErrorMessage(error));
        }
      }
      try {
        await this.deleteExtensionFromLocation(extensionKey.id, extensionLocation, "removeExisting");
      } catch (error) {
        throw new ExtensionManagementError(localize(2978, null, extensionLocation.fsPath, extensionKey.id), "Delete" /* Delete */);
      }
    }
    try {
      if (token.isCancellationRequested) {
        throw new CancellationError();
      }
      try {
        this.logService.trace(`Started extracting the extension from ${zipPath} to ${extensionLocation.fsPath}`);
        await extract(zipPath, tempLocation.fsPath, { sourcePath: "extension", overwrite: true }, token);
        this.logService.info(`Extracted extension to ${extensionLocation}:`, extensionKey.id);
      } catch (e) {
        throw fromExtractError(e);
      }
      const metadata = { installedTimestamp: Date.now(), targetPlatform: extensionKey.targetPlatform };
      try {
        metadata.size = await computeSize(tempLocation, this.fileService);
      } catch (error) {
        this.logService.warn(`Error while getting the size of the extracted extension : ${tempLocation.fsPath}`, getErrorMessage(error));
      }
      try {
        await this.extensionsScannerService.updateManifestMetadata(tempLocation, metadata);
      } catch (error) {
        this.telemetryService.publicLog2("extension:extract", { extensionId: extensionKey.id, code: `${toFileOperationResult(error)}` });
        throw toExtensionManagementError(error, "UpdateMetadata" /* UpdateMetadata */);
      }
      if (token.isCancellationRequested) {
        throw new CancellationError();
      }
      try {
        this.logService.trace(`Started renaming the extension from ${tempLocation.fsPath} to ${extensionLocation.fsPath}`);
        await this.rename(tempLocation.fsPath, extensionLocation.fsPath);
        this.logService.info("Renamed to", extensionLocation.fsPath);
      } catch (error) {
        if (error.code === "ENOTEMPTY") {
          this.logService.info(`Rename failed because extension was installed by another source. So ignoring renaming.`, extensionKey.id);
          try {
            await this.fileService.del(tempLocation, { recursive: true });
          } catch (e) {
          }
        } else {
          this.logService.info(`Rename failed because of ${getErrorMessage(error)}. Deleted from extracted location`, tempLocation);
          throw error;
        }
      }
      this._onExtract.fire(extensionLocation);
    } catch (error) {
      try {
        await this.fileService.del(tempLocation, { recursive: true });
      } catch (e) {
      }
      throw error;
    }
    return this.scanLocalExtension(extensionLocation, 1 /* User */);
  }
  async scanMetadata(local, profileLocation) {
    const extension = await this.getScannedExtension(local, profileLocation);
    return extension?.metadata;
  }
  async getScannedExtension(local, profileLocation) {
    const extensions = await this.extensionsProfileScannerService.scanProfileExtensions(profileLocation);
    return extensions.find((e) => areSameExtensions(e.identifier, local.identifier));
  }
  async updateMetadata(local, metadata, profileLocation) {
    try {
      await this.extensionsProfileScannerService.updateMetadata([[local, metadata]], profileLocation);
    } catch (error) {
      this.telemetryService.publicLog2("extension:extract", { extensionId: local.identifier.id, code: `${toFileOperationResult(error)}`, isProfile: !!profileLocation });
      throw toExtensionManagementError(error, "UpdateMetadata" /* UpdateMetadata */);
    }
    return this.scanLocalExtension(local.location, local.type, profileLocation);
  }
  async setExtensionsForRemoval(...extensions) {
    const extensionsToRemove = [];
    for (const extension of extensions) {
      if (await this.fileService.exists(extension.location)) {
        extensionsToRemove.push(extension);
      }
    }
    const extensionKeys = extensionsToRemove.map((e) => ExtensionKey.create(e));
    await this.withRemovedExtensions((removedExtensions) => extensionKeys.forEach((extensionKey) => {
      removedExtensions[extensionKey.toString()] = true;
      this.logService.info("Marked extension as removed", extensionKey.toString());
    }));
  }
  async unsetExtensionsForRemoval(...extensionKeys) {
    try {
      const results = [];
      await this.withRemovedExtensions((removedExtensions) => extensionKeys.forEach((extensionKey) => {
        if (removedExtensions[extensionKey.toString()]) {
          results.push(true);
          delete removedExtensions[extensionKey.toString()];
        } else {
          results.push(false);
        }
      }));
      return results;
    } catch (error) {
      throw toExtensionManagementError(error, "UnsetRemoved" /* UnsetRemoved */);
    }
  }
  async deleteExtension(extension, type) {
    if (this.uriIdentityService.extUri.isEqualOrParent(extension.location, this.extensionsScannerService.userExtensionsLocation)) {
      await this.deleteExtensionFromLocation(extension.identifier.id, extension.location, type);
      await this.unsetExtensionsForRemoval(ExtensionKey.create(extension));
    }
  }
  async copyExtension(extension, fromProfileLocation, toProfileLocation, metadata) {
    const source = await this.getScannedExtension(extension, fromProfileLocation);
    const target = await this.getScannedExtension(extension, toProfileLocation);
    metadata = { ...source?.metadata, ...metadata };
    if (target) {
      if (this.uriIdentityService.extUri.isEqual(target.location, extension.location)) {
        await this.extensionsProfileScannerService.updateMetadata([[extension, { ...target.metadata, ...metadata }]], toProfileLocation);
      } else {
        const targetExtension = await this.scanLocalExtension(target.location, extension.type, toProfileLocation);
        await this.extensionsProfileScannerService.removeExtensionsFromProfile([targetExtension.identifier], toProfileLocation);
        await this.extensionsProfileScannerService.addExtensionsToProfile([[extension, { ...target.metadata, ...metadata }]], toProfileLocation);
      }
    } else {
      await this.extensionsProfileScannerService.addExtensionsToProfile([[extension, metadata]], toProfileLocation);
    }
    return this.scanLocalExtension(extension.location, extension.type, toProfileLocation);
  }
  async moveExtension(extension, fromProfileLocation, toProfileLocation, metadata) {
    const source = await this.getScannedExtension(extension, fromProfileLocation);
    const target = await this.getScannedExtension(extension, toProfileLocation);
    metadata = { ...source?.metadata, ...metadata };
    if (target) {
      if (this.uriIdentityService.extUri.isEqual(target.location, extension.location)) {
        await this.extensionsProfileScannerService.updateMetadata([[extension, { ...target.metadata, ...metadata }]], toProfileLocation);
      } else {
        const targetExtension = await this.scanLocalExtension(target.location, extension.type, toProfileLocation);
        await this.removeExtension(targetExtension.identifier, toProfileLocation);
        await this.extensionsProfileScannerService.addExtensionsToProfile([[extension, { ...target.metadata, ...metadata }]], toProfileLocation);
      }
    } else {
      await this.extensionsProfileScannerService.addExtensionsToProfile([[extension, metadata]], toProfileLocation);
      if (source) {
        await this.removeExtension(source.identifier, fromProfileLocation);
      }
    }
    return this.scanLocalExtension(extension.location, extension.type, toProfileLocation);
  }
  async removeExtension(identifier, fromProfileLocation) {
    await this.extensionsProfileScannerService.removeExtensionsFromProfile([identifier], fromProfileLocation);
  }
  async copyExtensions(fromProfileLocation, toProfileLocation, productVersion) {
    const fromExtensions = await this.scanExtensions(1 /* User */, fromProfileLocation, productVersion);
    const extensions = await Promise.all(fromExtensions.filter((e) => !e.isApplicationScoped).map(async (e) => [e, await this.scanMetadata(e, fromProfileLocation)]));
    await this.extensionsProfileScannerService.addExtensionsToProfile(extensions, toProfileLocation);
  }
  async deleteExtensionFromLocation(id2, location, type) {
    this.logService.trace(`Deleting ${type} extension from disk`, id2, location.fsPath);
    const renamedLocation = this.uriIdentityService.extUri.joinPath(this.uriIdentityService.extUri.dirname(location), `${this.uriIdentityService.extUri.basename(location)}.${hash(generateUuid()).toString(16)}${DELETED_FOLDER_POSTFIX}`);
    await this.rename(location.fsPath, renamedLocation.fsPath);
    await this.fileService.del(renamedLocation, { recursive: true });
    this.logService.info(`Deleted ${type} extension from disk`, id2, location.fsPath);
  }
  withRemovedExtensions(updateFn) {
    return this.obsoleteFileLimiter.queue(async () => {
      let raw;
      try {
        const content = await this.fileService.readFile(this.obsoletedResource, "utf8");
        raw = content.value.toString();
      } catch (error) {
        if (toFileOperationResult(error) !== 1 /* FILE_NOT_FOUND */) {
          throw error;
        }
      }
      let removed = {};
      if (raw) {
        try {
          removed = JSON.parse(raw);
        } catch (e) {
        }
      }
      if (updateFn) {
        updateFn(removed);
        if (Object.keys(removed).length) {
          await this.fileService.writeFile(this.obsoletedResource, VSBuffer.fromString(JSON.stringify(removed)));
        } else {
          try {
            await this.fileService.del(this.obsoletedResource);
          } catch (error) {
            if (toFileOperationResult(error) !== 1 /* FILE_NOT_FOUND */) {
              throw error;
            }
          }
        }
      }
      return removed;
    });
  }
  async rename(extractPath, renamePath) {
    try {
      await Promises2.rename(
        extractPath,
        renamePath,
        2 * 60 * 1e3
        /* Retry for 2 minutes */
      );
    } catch (error) {
      throw toExtensionManagementError(error, "Rename" /* Rename */);
    }
  }
  async scanLocalExtension(location, type, profileLocation) {
    try {
      if (profileLocation) {
        const scannedExtensions = await this.extensionsScannerService.scanUserExtensions({ profileLocation });
        const scannedExtension = scannedExtensions.find((e) => this.uriIdentityService.extUri.isEqual(e.location, location));
        if (scannedExtension) {
          return await this.toLocalExtension(scannedExtension);
        }
      } else {
        const scannedExtension = await this.extensionsScannerService.scanExistingExtension(location, type, { includeInvalid: true });
        if (scannedExtension) {
          return await this.toLocalExtension(scannedExtension);
        }
      }
      throw new ExtensionManagementError(localize(2977, null, location.path), "ScanningExtension" /* ScanningExtension */);
    } catch (error) {
      throw toExtensionManagementError(error, "ScanningExtension" /* ScanningExtension */);
    }
  }
  async toLocalExtension(extension) {
    let stat;
    try {
      stat = await this.fileService.resolve(extension.location);
    } catch (error) {
    }
    let readmeUrl;
    let changelogUrl;
    if (stat?.children) {
      readmeUrl = stat.children.find(({ name }) => /^readme(\.txt|\.md|)$/i.test(name))?.resource;
      changelogUrl = stat.children.find(({ name }) => /^changelog(\.txt|\.md|)$/i.test(name))?.resource;
    }
    return {
      identifier: extension.identifier,
      type: extension.type,
      isBuiltin: extension.isBuiltin || !!extension.metadata?.isBuiltin,
      location: extension.location,
      manifest: extension.manifest,
      targetPlatform: extension.targetPlatform,
      validations: extension.validations,
      isValid: extension.isValid,
      readmeUrl,
      changelogUrl,
      publisherDisplayName: extension.metadata?.publisherDisplayName,
      publisherId: extension.metadata?.publisherId || null,
      isApplicationScoped: !!extension.metadata?.isApplicationScoped,
      isMachineScoped: !!extension.metadata?.isMachineScoped,
      isPreReleaseVersion: !!extension.metadata?.isPreReleaseVersion,
      hasPreReleaseVersion: !!extension.metadata?.hasPreReleaseVersion,
      preRelease: extension.preRelease,
      installedTimestamp: extension.metadata?.installedTimestamp,
      updated: !!extension.metadata?.updated,
      pinned: !!extension.metadata?.pinned,
      forceAutoUpdate: extension.forceAutoUpdate,
      private: !!extension.metadata?.private,
      isWorkspaceScoped: false,
      source: extension.metadata?.source ?? (extension.identifier.uuid ? "gallery" : "vsix"),
      size: extension.metadata?.size ?? 0
    };
  }
  async initializeExtensionSize() {
    const extensions = await this.extensionsScannerService.scanAllUserExtensions();
    await Promise.all(extensions.map(async (extension) => {
      if (isDefined(extension.metadata?.installedTimestamp) && isUndefined(extension.metadata?.size)) {
        const size = await computeSize(extension.location, this.fileService);
        await this.extensionsScannerService.updateManifestMetadata(extension.location, { size });
      }
    }));
  }
  async removeStaleAutoUpdateBuiltinExtensions() {
    if (this.environmentService.extensionTestsLocationURI) {
      return;
    }
    const builtinExtensions = await this.extensionsScannerService.scanSystemExtensions({});
    const userExtensions = await this.extensionsScannerService.scanAllUserExtensions();
    const staleExtensions = userExtensions.filter((userExtension) => {
      if (!this.productService.builtInExtensionsEnabledWithAutoUpdates.some((id2) => id2.toLowerCase() === userExtension.identifier.id.toLowerCase())) {
        return false;
      }
      const builtinExtension = builtinExtensions.find((e) => areSameExtensions(e.identifier, userExtension.identifier));
      return builtinExtension && lt(userExtension.manifest.version, builtinExtension.manifest.version);
    });
    if (staleExtensions.length) {
      this.logService.info("Removing stale auto-update builtin extensions:", staleExtensions.map((e) => `${e.identifier.id}@${e.manifest.version}`).join(", "));
      await this.extensionsProfileScannerService.removeExtensionsFromProfile(staleExtensions.map((e) => e.identifier), this.userDataProfilesService.defaultProfile.extensionsResource);
      await Promise.allSettled(staleExtensions.map((e) => this.deleteExtension(e, "stale auto-update builtin")));
    }
  }
  async deleteExtensionsMarkedForRemoval() {
    let removed;
    try {
      removed = await this.withRemovedExtensions();
    } catch (error) {
      throw toExtensionManagementError(error, "ReadRemoved" /* ReadRemoved */);
    }
    if (Object.keys(removed).length === 0) {
      this.logService.debug(`No extensions are marked as removed.`);
      return;
    }
    this.logService.debug(`Deleting extensions marked as removed:`, Object.keys(removed));
    const extensions = await this.scanAllUserExtensions();
    const installed = /* @__PURE__ */ new Set();
    for (const e of extensions) {
      if (!removed[ExtensionKey.create(e).toString()]) {
        installed.add(e.identifier.id.toLowerCase());
      }
    }
    try {
      const byExtension = groupByExtension(extensions, (e) => e.identifier);
      await Promises.settled(byExtension.map(async (e) => {
        const latest = e.sort((a, b) => rcompare(a.manifest.version, b.manifest.version))[0];
        if (!installed.has(latest.identifier.id.toLowerCase())) {
          await this.beforeRemovingExtension(latest);
        }
      }));
    } catch (error) {
      this.logService.error(error);
    }
    const toRemove = extensions.filter((e) => e.installedTimestamp && removed[ExtensionKey.create(e).toString()]);
    await Promise.allSettled(toRemove.map((e) => this.deleteExtension(e, "marked for removal")));
  }
  async removeTemporarilyDeletedFolders() {
    this.logService.trace("ExtensionManagementService#removeTempDeleteFolders");
    let stat;
    try {
      stat = await this.fileService.resolve(this.extensionsScannerService.userExtensionsLocation);
    } catch (error) {
      if (toFileOperationResult(error) !== 1 /* FILE_NOT_FOUND */) {
        this.logService.error(error);
      }
      return;
    }
    if (!stat?.children) {
      return;
    }
    try {
      await Promise.allSettled(stat.children.map(async (child) => {
        if (!child.isDirectory || !child.name.endsWith(DELETED_FOLDER_POSTFIX)) {
          return;
        }
        this.logService.trace("Deleting the temporarily deleted folder", child.resource.toString());
        try {
          await this.fileService.del(child.resource, { recursive: true });
          this.logService.trace("Deleted the temporarily deleted folder", child.resource.toString());
        } catch (error) {
          if (toFileOperationResult(error) !== 1 /* FILE_NOT_FOUND */) {
            this.logService.error(error);
          }
        }
      }));
    } catch (error) {
    }
  }
};

ExtensionsScanner2 = __decorateClass([
  __decorateParam(1, IEnvironmentService),
  __decorateParam(2, IFileService),
  __decorateParam(3, IExtensionsScannerService),
  __decorateParam(4, IExtensionsProfileScannerService),
  __decorateParam(5, IUriIdentityService),
  __decorateParam(6, ITelemetryService),
  __decorateParam(7, IProductService),
  __decorateParam(8, IUserDataProfilesService),
  __decorateParam(9, ILogService)
], ExtensionsScanner2);

var InstallExtensionInProfileTask = class extends AbstractExtensionTask {
  constructor(extensionKey, manifest, source, options, extractExtensionFn, extensionsScanner, uriIdentityService, galleryService, userDataProfilesService, extensionsScannerService, extensionsProfileScannerService, productService, logService) {
    super();
    this.extensionKey = extensionKey;
    this.manifest = manifest;
    this.source = source;
    this.options = options;
    this.extractExtensionFn = extractExtensionFn;
    this.extensionsScanner = extensionsScanner;
    this.uriIdentityService = uriIdentityService;
    this.galleryService = galleryService;
    this.userDataProfilesService = userDataProfilesService;
    this.extensionsScannerService = extensionsScannerService;
    this.extensionsProfileScannerService = extensionsProfileScannerService;
    this.productService = productService;
    this.logService = logService;
    this._operation = 2 /* Install */;
    this.identifier = this.extensionKey.identifier;
  }
  get operation() {
    return this.options.operation ?? this._operation;
  }
  get verificationStatus() {
    return this._verificationStatus;
  }
  async doRun(token) {
    const installed = await this.extensionsScanner.scanExtensions(1 /* User */, this.options.profileLocation, this.options.productVersion);
    const existingExtension = installed.find((i) => areSameExtensions(i.identifier, this.identifier));
    if (existingExtension) {
      this._operation = 3 /* Update */;
    }
    const system = await this.extensionsScanner.scanExtensions(0 /* System */, this.options.profileLocation, this.options.productVersion);
    const existingSystemExtension = system.find((i) => areSameExtensions(i.identifier, this.identifier));
    if (existingSystemExtension) {
      if (!existingSystemExtension.forceAutoUpdate) {
        throw new ExtensionManagementError(localize(2975, null, existingSystemExtension.identifier.id, this.productService.quality), "Incompatible" /* Incompatible */);
      }
      if (gt(existingSystemExtension.manifest.version, this.manifest.version)) {
        throw new ExtensionManagementError(localize(2976, null, existingSystemExtension.identifier.id, existingSystemExtension.manifest.version, this.manifest.version), "Incompatible" /* Incompatible */);
      }
    }
    const metadata = {
      isApplicationScoped: this.options.isApplicationScoped || existingExtension?.isApplicationScoped,
      isMachineScoped: this.options.isMachineScoped || existingExtension?.isMachineScoped,
      isBuiltin: this.options.isBuiltin || existingExtension?.isBuiltin,
      isSystem: existingExtension?.type === 0 /* System */ ? true : void 0,
      installedTimestamp: Date.now(),
      pinned: this.options.installGivenVersion ? true : this.options.pinned ?? existingExtension?.pinned,
      source: this.source instanceof URI ? "vsix" : "gallery"
    };
    let local;
    if (this.source instanceof URI) {
      if (existingExtension) {
        if (this.extensionKey.equals(new ExtensionKey(existingExtension.identifier, existingExtension.manifest.version))) {
          try {
            await this.extensionsScanner.deleteExtension(existingExtension, "existing");
          } catch (e) {
            throw new Error(localize(2982, null, this.manifest.displayName || this.manifest.name));
          }
        }
      }
      const existingWithSameVersion = await this.unsetIfRemoved(this.extensionKey);
      if (existingWithSameVersion) {
        try {
          await this.extensionsScanner.deleteExtension(existingWithSameVersion, "existing");
        } catch (e) {
          throw new Error(localize(2982, null, this.manifest.displayName || this.manifest.name));
        }
      }
    } else {
      metadata.id = this.source.identifier.uuid;
      metadata.publisherId = this.source.publisherId;
      metadata.publisherDisplayName = this.source.publisherDisplayName;
      metadata.targetPlatform = this.source.properties.targetPlatform;
      metadata.updated = !!existingExtension;
      metadata.private = this.source.private;
      metadata.isPreReleaseVersion = this.source.properties.isPreReleaseVersion;
      metadata.hasPreReleaseVersion = existingExtension?.hasPreReleaseVersion || this.source.properties.isPreReleaseVersion;
      metadata.preRelease = isBoolean(this.options.preRelease) ? this.options.preRelease : this.options.installPreReleaseVersion || this.source.properties.isPreReleaseVersion || existingExtension?.preRelease;
      if (existingExtension && existingExtension.type !== 0 /* System */ && existingExtension.manifest.version === this.source.version) {
        return this.extensionsScanner.updateMetadata(existingExtension, metadata, this.options.profileLocation);
      }
      local = await this.unsetIfRemoved(this.extensionKey);
    }
    if (token.isCancellationRequested) {
      throw toExtensionManagementError(new CancellationError());
    }
    if (!local) {
      const result2 = await this.extractExtensionFn(this.operation, token);
      local = result2.local;
      this._verificationStatus = result2.verificationStatus;
    }
    if (this.uriIdentityService.extUri.isEqual(this.userDataProfilesService.defaultProfile.extensionsResource, this.options.profileLocation)) {
      try {
        await this.extensionsScannerService.initializeDefaultProfileExtensions();
      } catch (error) {
        throw toExtensionManagementError(error, "IntializeDefaultProfile" /* IntializeDefaultProfile */);
      }
    }
    if (token.isCancellationRequested) {
      throw toExtensionManagementError(new CancellationError());
    }
    try {
      await this.extensionsProfileScannerService.addExtensionsToProfile([[local, metadata]], this.options.profileLocation, !local.isValid);
    } catch (error) {
      throw toExtensionManagementError(error, "AddToProfile" /* AddToProfile */);
    }
    const result = await this.extensionsScanner.scanLocalExtension(local.location, 1 /* User */, this.options.profileLocation);
    if (!result) {
      throw new ExtensionManagementError("Cannot find the installed extension", "InstalledExtensionNotFound" /* InstalledExtensionNotFound */);
    }
    if (this.source instanceof URI) {
      this.updateMetadata(local, token);
    }
    return result;
  }
  async unsetIfRemoved(extensionKey) {
    const [removed] = await this.extensionsScanner.unsetExtensionsForRemoval(extensionKey);
    if (removed) {
      this.logService.info("Removed the extension from removed list:", extensionKey.id);
      const userExtensions = await this.extensionsScanner.scanAllUserExtensions();
      return userExtensions.find((i) => ExtensionKey.create(i).equals(extensionKey));
    }
    return void 0;
  }
  async updateMetadata(extension, token) {
    try {
      let [galleryExtension] = await this.galleryService.getExtensions([{ id: extension.identifier.id, version: extension.manifest.version }], token);
      if (!galleryExtension) {
        [galleryExtension] = await this.galleryService.getExtensions([{ id: extension.identifier.id }], token);
      }
      if (galleryExtension) {
        const metadata = {
          id: galleryExtension.identifier.uuid,
          publisherDisplayName: galleryExtension.publisherDisplayName,
          publisherId: galleryExtension.publisherId,
          isPreReleaseVersion: galleryExtension.properties.isPreReleaseVersion,
          hasPreReleaseVersion: extension.hasPreReleaseVersion || galleryExtension.properties.isPreReleaseVersion,
          preRelease: galleryExtension.properties.isPreReleaseVersion || this.options.installPreReleaseVersion
        };
        await this.extensionsScanner.updateMetadata(extension, metadata, this.options.profileLocation);
      }
    } catch (error) {
    }
  }
};

InstallExtensionInProfileTask = __decorateClass([
  __decorateParam(6, IUriIdentityService),
  __decorateParam(7, IExtensionGalleryService),
  __decorateParam(8, IUserDataProfilesService),
  __decorateParam(9, IExtensionsScannerService),
  __decorateParam(10, IExtensionsProfileScannerService),
  __decorateParam(11, IProductService),
  __decorateParam(12, ILogService)
], InstallExtensionInProfileTask);

var UninstallExtensionInProfileTask = class extends AbstractExtensionTask {
  constructor(extension, options, extensionsProfileScannerService, extensionsScannerService, fileService, productService) {
    super();
    this.extension = extension;
    this.options = options;
    this.extensionsProfileScannerService = extensionsProfileScannerService;
    this.extensionsScannerService = extensionsScannerService;
    this.fileService = fileService;
    this.productService = productService;
  }
  async doRun(token) {
    if (this.extension.type === 0 /* System */) {
      await uninstallBuiltinExtension(this.extension.identifier.id, this.extensionsScannerService, this.fileService, this.productService);
      return;
    }
    return this.extensionsProfileScannerService.removeExtensionsFromProfile([this.extension.identifier], this.options.profileLocation);
  }
};
export { fs2, INativeServerExtensionManagementService, DELETED_FOLDER_POSTFIX, ExtensionManagementService, ExtensionsScanner2, InstallExtensionInProfileTask, UninstallExtensionInProfileTask };
