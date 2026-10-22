// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/extensions/electron-browser/remoteExtensionsInit.ts
import { REMOTE_DEFAULT_IF_LOCAL_EXTENSIONS } from "./module-3271.mjs";
import { areSameExtensions } from "./module-0888.mjs";
import { CancellationToken } from "./module-0025.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IRemoteAgentService } from "./module-0938.mjs";
import { IRemoteExtensionsScannerService } from "./module-1664.mjs";
import { EXTENSION_INSTALL_SKIP_PUBLISHER_TRUST_CONTEXT, IExtensionGalleryService, IExtensionManagementService } from "./module-0874.mjs";
import { IExtensionManagementServerService } from "./module-1047.mjs";
import { IExtensionsWorkbenchService } from "./module-1023.mjs";
import { ILogService } from "./module-0095.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IS_NEW_KEY, IStorageService } from "./module-0512.mjs";
import { UserDataSyncStoreClient } from "./module-1688.mjs";
import { ServiceCollection } from "./module-0440.mjs";
import { IUserDataSyncEnablementService, IUserDataSyncStoreManagementService } from "./module-1639.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IAuthenticationService } from "./module-0952.mjs";
import { IRemoteAuthorityResolverService } from "./module-0896.mjs";
import { AbstractExtensionsInitializer } from "./module-4088.mjs";
import { IIgnoredExtensionsManagementService } from "./module-1792.mjs";
import { IFileService } from "./module-0269.mjs";
import { IUserDataProfilesService } from "./module-0511.mjs";
import { IEnvironmentService } from "./module-0508.mjs";
import { IUriIdentityService } from "./module-0510.mjs";
import { IExtensionManifestPropertiesService } from "./module-1049.mjs";


// src/vs/workbench/contrib/extensions/electron-browser/remoteExtensionsInit.ts
var InstallRemoteExtensionsContribution = class {
  constructor(remoteAgentService, remoteExtensionsScannerService, extensionGalleryService, extensionManagementServerService, extensionsWorkbenchService, logService, configurationService) {
    this.remoteAgentService = remoteAgentService;
    this.remoteExtensionsScannerService = remoteExtensionsScannerService;
    this.extensionGalleryService = extensionGalleryService;
    this.extensionManagementServerService = extensionManagementServerService;
    this.extensionsWorkbenchService = extensionsWorkbenchService;
    this.logService = logService;
    this.configurationService = configurationService;
    this.installExtensionsIfInstalledLocallyInRemote();
    this.installFailedRemoteExtensions();
  }
  async installExtensionsIfInstalledLocallyInRemote() {
    if (!this.remoteAgentService.getConnection()) {
      return;
    }
    if (!this.extensionManagementServerService.remoteExtensionManagementServer) {
      this.logService.error("No remote extension management server available");
      return;
    }
    if (!this.extensionManagementServerService.localExtensionManagementServer) {
      this.logService.error("No local extension management server available");
      return;
    }
    const settingValue = this.configurationService.getValue(REMOTE_DEFAULT_IF_LOCAL_EXTENSIONS);
    if (!settingValue?.length) {
      return;
    }
    const alreadyInstalledLocally = await this.extensionsWorkbenchService.queryLocal(this.extensionManagementServerService.localExtensionManagementServer);
    const alreadyInstalledRemotely = await this.extensionsWorkbenchService.queryLocal(this.extensionManagementServerService.remoteExtensionManagementServer);
    const extensionsToInstall = alreadyInstalledLocally.filter((ext) => settingValue.some((id2) => areSameExtensions(ext.identifier, { id: id2 }))).filter((ext) => !alreadyInstalledRemotely.some((e4) => areSameExtensions(e4.identifier, ext.identifier)));
    if (!extensionsToInstall.length) {
      return;
    }
    await Promise.allSettled(extensionsToInstall.map((ext) => {
      this.extensionsWorkbenchService.installInServer(ext, this.extensionManagementServerService.remoteExtensionManagementServer, { donotIncludePackAndDependencies: true });
    }));
  }
  async installFailedRemoteExtensions() {
    if (!this.remoteAgentService.getConnection()) {
      return;
    }
    const { failed } = await this.remoteExtensionsScannerService.whenExtensionsReady();
    if (failed.length === 0) {
      this.logService.trace("No extensions relayed from server");
      return;
    }
    if (!this.extensionManagementServerService.remoteExtensionManagementServer) {
      this.logService.error("No remote extension management server available");
      return;
    }
    this.logService.info(`Installing '${failed.length}' extensions relayed from server`);
    const galleryExtensions = await this.extensionGalleryService.getExtensions(failed.map(({ id: id2 }) => ({ id: id2 })), CancellationToken.None);
    const installExtensionInfo = [];
    for (const { id: id2, installOptions } of failed) {
      const extension = galleryExtensions.find((e4) => areSameExtensions(e4.identifier, { id: id2 }));
      if (extension) {
        installExtensionInfo.push({
          extension,
          options: {
            ...installOptions,
            downloadExtensionsLocally: true
          }
        });
      } else {
        this.logService.warn(`Relayed failed extension '${id2}' from server is not found in the gallery`);
      }
    }
    if (installExtensionInfo.length) {
      await Promise.allSettled(installExtensionInfo.map((e4) => this.extensionManagementServerService.remoteExtensionManagementServer.extensionManagementService.installFromGallery(e4.extension, e4.options)));
    }
  }
};

InstallRemoteExtensionsContribution = __decorateClass([
  __decorateParam(0, IRemoteAgentService),
  __decorateParam(1, IRemoteExtensionsScannerService),
  __decorateParam(2, IExtensionGalleryService),
  __decorateParam(3, IExtensionManagementServerService),
  __decorateParam(4, IExtensionsWorkbenchService),
  __decorateParam(5, ILogService),
  __decorateParam(6, IConfigurationService)
], InstallRemoteExtensionsContribution);

var RemoteExtensionsInitializerContribution = class {
  constructor(extensionManagementServerService, storageService, remoteAgentService, userDataSyncStoreManagementService, instantiationService, logService, authenticationService, remoteAuthorityResolverService, userDataSyncEnablementService) {
    this.extensionManagementServerService = extensionManagementServerService;
    this.storageService = storageService;
    this.remoteAgentService = remoteAgentService;
    this.userDataSyncStoreManagementService = userDataSyncStoreManagementService;
    this.instantiationService = instantiationService;
    this.logService = logService;
    this.authenticationService = authenticationService;
    this.remoteAuthorityResolverService = remoteAuthorityResolverService;
    this.userDataSyncEnablementService = userDataSyncEnablementService;
    this.initializeRemoteExtensions();
  }
  async initializeRemoteExtensions() {
    const connection = this.remoteAgentService.getConnection();
    const localExtensionManagementServer = this.extensionManagementServerService.localExtensionManagementServer;
    const remoteExtensionManagementServer = this.extensionManagementServerService.remoteExtensionManagementServer;
    if (!connection || !remoteExtensionManagementServer) {
      return;
    }
    if (!localExtensionManagementServer) {
      return;
    }
    if (!this.userDataSyncStoreManagementService.userDataSyncStore) {
      return;
    }
    const newRemoteConnectionKey = `${IS_NEW_KEY}.${connection.remoteAuthority}`;
    if (!this.storageService.getBoolean(newRemoteConnectionKey, -1 /* APPLICATION */, true)) {
      this.logService.trace(`Skipping initializing remote extensions because the window with this remote authority was opened before.`);
      return;
    }
    this.storageService.store(newRemoteConnectionKey, false, -1 /* APPLICATION */, 1 /* MACHINE */);
    if (!this.storageService.isNew(1 /* WORKSPACE */)) {
      this.logService.trace(`Skipping initializing remote extensions because this workspace was opened before.`);
      return;
    }
    if (!this.userDataSyncEnablementService.isEnabled()) {
      return;
    }
    const resolvedAuthority = await this.remoteAuthorityResolverService.resolveAuthority(connection.remoteAuthority);
    if (!resolvedAuthority.options?.authenticationSession) {
      return;
    }
    const sessions = await this.authenticationService.getSessions(resolvedAuthority.options?.authenticationSession.providerId);
    const session = sessions.find((s) => s.id === resolvedAuthority.options?.authenticationSession?.id);
    if (!session) {
      this.logService.info("Skipping initializing remote extensions because the account with given session id is not found", resolvedAuthority.options.authenticationSession.id);
      return;
    }
    const userDataSyncStoreClient = this.instantiationService.createInstance(UserDataSyncStoreClient, this.userDataSyncStoreManagementService.userDataSyncStore.url);
    userDataSyncStoreClient.setAuthToken(session.accessToken, resolvedAuthority.options.authenticationSession.providerId);
    const userData = await userDataSyncStoreClient.readResource("extensions" /* Extensions */, null);
    const serviceCollection = new ServiceCollection();
    serviceCollection.set(IExtensionManagementService, remoteExtensionManagementServer.extensionManagementService);
    const instantiationService = this.instantiationService.createChild(serviceCollection);
    const extensionsToInstallInitializer = instantiationService.createInstance(RemoteExtensionsInitializer);
    await extensionsToInstallInitializer.initialize(userData);
  }
};

RemoteExtensionsInitializerContribution = __decorateClass([
  __decorateParam(0, IExtensionManagementServerService),
  __decorateParam(1, IStorageService),
  __decorateParam(2, IRemoteAgentService),
  __decorateParam(3, IUserDataSyncStoreManagementService),
  __decorateParam(4, IInstantiationService),
  __decorateParam(5, ILogService),
  __decorateParam(6, IAuthenticationService),
  __decorateParam(7, IRemoteAuthorityResolverService),
  __decorateParam(8, IUserDataSyncEnablementService)
], RemoteExtensionsInitializerContribution);

var RemoteExtensionsInitializer = class extends AbstractExtensionsInitializer {
  constructor(extensionManagementService, ignoredExtensionsManagementService, fileService, userDataProfilesService, environmentService, logService, uriIdentityService, extensionGalleryService, storageService, extensionManifestPropertiesService) {
    super(extensionManagementService, ignoredExtensionsManagementService, fileService, userDataProfilesService, environmentService, logService, storageService, uriIdentityService);
    this.extensionGalleryService = extensionGalleryService;
    this.extensionManifestPropertiesService = extensionManifestPropertiesService;
  }
  async doInitialize(remoteUserData) {
    const remoteExtensions = await this.parseExtensions(remoteUserData);
    if (!remoteExtensions) {
      this.logService.info("No synced extensions exist while initializing remote extensions.");
      return;
    }
    const installedExtensions = await this.extensionManagementService.getInstalled();
    const { newExtensions } = this.generatePreview(remoteExtensions, installedExtensions);
    if (!newExtensions.length) {
      this.logService.trace("No new remote extensions to install.");
      return;
    }
    const targetPlatform = await this.extensionManagementService.getTargetPlatform();
    const extensionsToInstall = await this.extensionGalleryService.getExtensions(newExtensions, { targetPlatform, compatible: true }, CancellationToken.None);
    if (extensionsToInstall.length) {
      await Promise.allSettled(extensionsToInstall.map(async (e4) => {
        const manifest = await this.extensionGalleryService.getManifest(e4, CancellationToken.None);
        if (manifest && this.extensionManifestPropertiesService.canExecuteOnWorkspace(manifest)) {
          const syncedExtension = remoteExtensions.find((e5) => areSameExtensions(e5.identifier, e5.identifier));
          await this.extensionManagementService.installFromGallery(e4, { installPreReleaseVersion: syncedExtension?.preRelease, donotIncludePackAndDependencies: true, context: { [EXTENSION_INSTALL_SKIP_PUBLISHER_TRUST_CONTEXT]: true } });
        }
      }));
    }
  }
};

RemoteExtensionsInitializer = __decorateClass([
  __decorateParam(0, IExtensionManagementService),
  __decorateParam(1, IIgnoredExtensionsManagementService),
  __decorateParam(2, IFileService),
  __decorateParam(3, IUserDataProfilesService),
  __decorateParam(4, IEnvironmentService),
  __decorateParam(5, ILogService),
  __decorateParam(6, IUriIdentityService),
  __decorateParam(7, IExtensionGalleryService),
  __decorateParam(8, IStorageService),
  __decorateParam(9, IExtensionManifestPropertiesService)
], RemoteExtensionsInitializer);
export { InstallRemoteExtensionsContribution, RemoteExtensionsInitializerContribution, RemoteExtensionsInitializer };
