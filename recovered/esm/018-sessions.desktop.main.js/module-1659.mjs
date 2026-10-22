// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/services/userDataProfile/browser/extensionsResource.ts
import { areSameExtensions } from "./module-0888.mjs";
import { CancellationToken } from "./module-0025.mjs";
import { EXTENSION_INSTALL_SKIP_PUBLISHER_TRUST_CONTEXT, EXTENSION_INSTALL_SKIP_WALKTHROUGH_CONTEXT, IExtensionGalleryService, IExtensionManagementService, IGlobalExtensionEnablementService } from "./module-0874.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IUserDataProfileService } from "./module-0998.mjs";
import { ILogService } from "./module-0095.mjs";
import { localize } from "./module-0001.mjs";
import { DisposableStore } from "./module-0012.mjs";
import { ServiceCollection } from "./module-0440.mjs";
import { IStorageService } from "./module-0512.mjs";
import { GlobalExtensionEnablementService } from "./module-1638.mjs";
import { IWorkbenchExtensionManagementService } from "./module-1047.mjs";
import { IUserDataProfileStorageService } from "./module-1658.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { Codicon } from "./module-0085.mjs";


// src/vs/workbench/services/userDataProfile/browser/extensionsResource.ts
var ExtensionsResourceInitializer = class {
  constructor(userDataProfileService, extensionManagementService, extensionGalleryService, extensionEnablementService, logService) {
    this.userDataProfileService = userDataProfileService;
    this.extensionManagementService = extensionManagementService;
    this.extensionGalleryService = extensionGalleryService;
    this.extensionEnablementService = extensionEnablementService;
    this.logService = logService;
  }
  async initialize(content) {
    const profileExtensions = JSON.parse(content);
    const installedExtensions = await this.extensionManagementService.getInstalled(void 0, this.userDataProfileService.currentProfile.extensionsResource);
    const extensionsToEnableOrDisable = [];
    const extensionsToInstall = [];
    for (const e4 of profileExtensions) {
      const isDisabled = this.extensionEnablementService.getDisabledExtensions().some((disabledExtension) => areSameExtensions(disabledExtension, e4.identifier));
      const installedExtension = installedExtensions.find((installed) => areSameExtensions(installed.identifier, e4.identifier));
      if (!installedExtension || !installedExtension.isBuiltin && installedExtension.preRelease !== e4.preRelease) {
        extensionsToInstall.push(e4);
      }
      if (isDisabled !== !!e4.disabled) {
        extensionsToEnableOrDisable.push({ extension: e4.identifier, enable: !e4.disabled });
      }
    }
    const extensionsToUninstall = installedExtensions.filter((extension) => !extension.isBuiltin && !profileExtensions.some(({ identifier: identifier2 }) => areSameExtensions(identifier2, extension.identifier)));
    for (const { extension, enable } of extensionsToEnableOrDisable) {
      if (enable) {
        this.logService.trace(`Initializing Profile: Enabling extension...`, extension.id);
        await this.extensionEnablementService.enableExtension(extension);
        this.logService.info(`Initializing Profile: Enabled extension...`, extension.id);
      } else {
        this.logService.trace(`Initializing Profile: Disabling extension...`, extension.id);
        await this.extensionEnablementService.disableExtension(extension);
        this.logService.info(`Initializing Profile: Disabled extension...`, extension.id);
      }
    }
    if (extensionsToInstall.length) {
      const galleryExtensions = await this.extensionGalleryService.getExtensions(extensionsToInstall.map((e4) => ({ ...e4.identifier, version: e4.version, hasPreRelease: e4.version ? void 0 : e4.preRelease })), CancellationToken.None);
      await Promise.all(extensionsToInstall.map(async (e4) => {
        const extension = galleryExtensions.find((galleryExtension) => areSameExtensions(galleryExtension.identifier, e4.identifier));
        if (!extension) {
          return;
        }
        if (await this.extensionManagementService.canInstall(extension) === true) {
          this.logService.trace(`Initializing Profile: Installing extension...`, extension.identifier.id, extension.version);
          await this.extensionManagementService.installFromGallery(extension, {
            isMachineScoped: false,
            /* set isMachineScoped value to prevent install and sync dialog in web */
            donotIncludePackAndDependencies: true,
            installGivenVersion: !!e4.version,
            installPreReleaseVersion: e4.preRelease,
            profileLocation: this.userDataProfileService.currentProfile.extensionsResource,
            context: { [EXTENSION_INSTALL_SKIP_WALKTHROUGH_CONTEXT]: true, [EXTENSION_INSTALL_SKIP_PUBLISHER_TRUST_CONTEXT]: true }
          });
          this.logService.info(`Initializing Profile: Installed extension...`, extension.identifier.id, extension.version);
        } else {
          this.logService.info(`Initializing Profile: Skipped installing extension because it cannot be installed.`, extension.identifier.id);
        }
      }));
    }
    if (extensionsToUninstall.length) {
      await Promise.all(extensionsToUninstall.map((e4) => this.extensionManagementService.uninstall(e4)));
    }
  }
};

ExtensionsResourceInitializer = __decorateClass([
  __decorateParam(0, IUserDataProfileService),
  __decorateParam(1, IExtensionManagementService),
  __decorateParam(2, IExtensionGalleryService),
  __decorateParam(3, IGlobalExtensionEnablementService),
  __decorateParam(4, ILogService)
], ExtensionsResourceInitializer);

var ExtensionsResource = class {
  constructor(extensionManagementService, extensionGalleryService, userDataProfileStorageService, instantiationService, logService) {
    this.extensionManagementService = extensionManagementService;
    this.extensionGalleryService = extensionGalleryService;
    this.userDataProfileStorageService = userDataProfileStorageService;
    this.instantiationService = instantiationService;
    this.logService = logService;
  }
  async getContent(profile, exclude) {
    const extensions = await this.getLocalExtensions(profile);
    return this.toContent(extensions, exclude);
  }
  toContent(extensions, exclude) {
    return JSON.stringify(exclude?.length ? extensions.filter((e4) => !exclude.includes(e4.identifier.id.toLowerCase())) : extensions);
  }
  async apply(content, profile, progress, token) {
    return this.withProfileScopedServices(profile, async (extensionEnablementService) => {
      const profileExtensions = await this.getProfileExtensions(content);
      const installedExtensions = await this.extensionManagementService.getInstalled(void 0, profile.extensionsResource);
      const extensionsToEnableOrDisable = [];
      const extensionsToInstall = [];
      for (const e4 of profileExtensions) {
        const isDisabled = extensionEnablementService.getDisabledExtensions().some((disabledExtension) => areSameExtensions(disabledExtension, e4.identifier));
        const installedExtension = installedExtensions.find((installed) => areSameExtensions(installed.identifier, e4.identifier));
        if (!installedExtension || !installedExtension.isBuiltin && installedExtension.preRelease !== e4.preRelease) {
          extensionsToInstall.push(e4);
        }
        if (isDisabled !== !!e4.disabled) {
          extensionsToEnableOrDisable.push({ extension: e4.identifier, enable: !e4.disabled });
        }
      }
      const extensionsToUninstall = installedExtensions.filter((extension) => !extension.isBuiltin && !profileExtensions.some(({ identifier: identifier2 }) => areSameExtensions(identifier2, extension.identifier)) && !extension.isApplicationScoped);
      for (const { extension, enable } of extensionsToEnableOrDisable) {
        if (enable) {
          this.logService.trace(`Importing Profile (${profile.name}): Enabling extension...`, extension.id);
          await extensionEnablementService.enableExtension(extension);
          this.logService.info(`Importing Profile (${profile.name}): Enabled extension...`, extension.id);
        } else {
          this.logService.trace(`Importing Profile (${profile.name}): Disabling extension...`, extension.id);
          await extensionEnablementService.disableExtension(extension);
          this.logService.info(`Importing Profile (${profile.name}): Disabled extension...`, extension.id);
        }
      }
      if (extensionsToInstall.length) {
        this.logService.info(`Importing Profile (${profile.name}): Started installing extensions.`);
        const galleryExtensions = await this.extensionGalleryService.getExtensions(extensionsToInstall.map((e4) => ({ ...e4.identifier, version: e4.version, hasPreRelease: e4.version ? void 0 : e4.preRelease })), CancellationToken.None);
        const installExtensionInfos = [];
        await Promise.all(extensionsToInstall.map(async (e4) => {
          const extension = galleryExtensions.find((galleryExtension) => areSameExtensions(galleryExtension.identifier, e4.identifier));
          if (!extension) {
            return;
          }
          if (await this.extensionManagementService.canInstall(extension) === true) {
            installExtensionInfos.push({
              extension,
              options: {
                isMachineScoped: false,
                /* set isMachineScoped value to prevent install and sync dialog in web */
                donotIncludePackAndDependencies: true,
                installGivenVersion: !!e4.version,
                installPreReleaseVersion: e4.preRelease,
                profileLocation: profile.extensionsResource,
                context: { [EXTENSION_INSTALL_SKIP_WALKTHROUGH_CONTEXT]: true }
              }
            });
          } else {
            this.logService.info(`Importing Profile (${profile.name}): Skipped installing extension because it cannot be installed.`, extension.identifier.id);
          }
        }));
        if (installExtensionInfos.length) {
          if (token) {
            await this.extensionManagementService.requestPublisherTrust(installExtensionInfos);
            for (const installExtensionInfo of installExtensionInfos) {
              if (token.isCancellationRequested) {
                return;
              }
              progress?.(localize(23619, null, installExtensionInfo.extension.displayName ?? installExtensionInfo.extension.identifier.id));
              await this.extensionManagementService.installFromGallery(installExtensionInfo.extension, installExtensionInfo.options);
            }
          } else {
            await this.extensionManagementService.installGalleryExtensions(installExtensionInfos);
          }
        }
        this.logService.info(`Importing Profile (${profile.name}): Finished installing extensions.`);
      }
      if (extensionsToUninstall.length) {
        await Promise.all(extensionsToUninstall.map((e4) => this.extensionManagementService.uninstall(e4)));
      }
    });
  }
  async copy(from, to, disableExtensions) {
    await this.extensionManagementService.copyExtensions(from.extensionsResource, to.extensionsResource);
    const extensionsToDisable = await this.withProfileScopedServices(from, async (extensionEnablementService) => extensionEnablementService.getDisabledExtensions());
    if (disableExtensions) {
      const extensions = await this.extensionManagementService.getInstalled(1 /* User */, to.extensionsResource);
      for (const extension of extensions) {
        extensionsToDisable.push(extension.identifier);
      }
    }
    await this.withProfileScopedServices(to, async (extensionEnablementService) => Promise.all(extensionsToDisable.map((extension) => extensionEnablementService.disableExtension(extension))));
  }
  async getLocalExtensions(profile) {
    return this.withProfileScopedServices(profile, async (extensionEnablementService) => {
      const result = /* @__PURE__ */ new Map();
      const installedExtensions = await this.extensionManagementService.getInstalled(void 0, profile.extensionsResource);
      const disabledExtensions = extensionEnablementService.getDisabledExtensions();
      for (const extension of installedExtensions) {
        const { identifier: identifier2, preRelease } = extension;
        const disabled = disabledExtensions.some((disabledExtension) => areSameExtensions(disabledExtension, identifier2));
        if (extension.isBuiltin && !disabled) {
          continue;
        }
        if (!extension.isBuiltin) {
          if (!extension.identifier.uuid) {
            continue;
          }
        }
        const existing = result.get(identifier2.id.toLowerCase());
        if (existing?.disabled) {
          result.delete(identifier2.id.toLowerCase());
        }
        const profileExtension = { identifier: identifier2, displayName: extension.manifest.displayName };
        if (disabled) {
          profileExtension.disabled = true;
        }
        if (!extension.isBuiltin && extension.pinned) {
          profileExtension.version = extension.manifest.version;
        }
        if (!profileExtension.version && preRelease) {
          profileExtension.preRelease = true;
        }
        profileExtension.applicationScoped = extension.isApplicationScoped;
        result.set(profileExtension.identifier.id.toLowerCase(), profileExtension);
      }
      return [...result.values()];
    });
  }
  async getProfileExtensions(content) {
    return JSON.parse(content);
  }
  async withProfileScopedServices(profile, fn) {
    return this.userDataProfileStorageService.withProfileScopedStorageService(
      profile,
      async (storageService) => {
        const disposables = new DisposableStore();
        const instantiationService = disposables.add(this.instantiationService.createChild(new ServiceCollection([IStorageService, storageService])));
        const extensionEnablementService = disposables.add(instantiationService.createInstance(GlobalExtensionEnablementService));
        try {
          return await fn(extensionEnablementService);
        } finally {
          disposables.dispose();
        }
      }
    );
  }
};

ExtensionsResource = __decorateClass([
  __decorateParam(0, IWorkbenchExtensionManagementService),
  __decorateParam(1, IExtensionGalleryService),
  __decorateParam(2, IUserDataProfileStorageService),
  __decorateParam(3, IInstantiationService),
  __decorateParam(4, ILogService)
], ExtensionsResource);

var ExtensionsResourceTreeItem = class {
  constructor() {
    this.type = "extensions" /* Extensions */;
    this.handle = "extensions" /* Extensions */;
    this.label = { label: localize(23618, null) };
    this.collapsibleState = 2 /* Expanded */;
    this.contextValue = "extensions" /* Extensions */;
    this.excludedExtensions = /* @__PURE__ */ new Set();
  }
  async getChildren() {
    const extensions = (await this.getExtensions()).sort((a, b) => (a.displayName ?? a.identifier.id).localeCompare(b.displayName ?? b.identifier.id));
    const that = this;
    return extensions.map((e4) => ({
      ...e4,
      handle: e4.identifier.id.toLowerCase(),
      parent: this,
      label: { label: e4.displayName || e4.identifier.id },
      description: e4.applicationScoped ? localize(23616, null) : void 0,
      collapsibleState: 0 /* None */,
      checkbox: that.checkbox ? {
        get isChecked() {
          return !that.excludedExtensions.has(e4.identifier.id.toLowerCase());
        },
        set isChecked(value2) {
          if (value2) {
            that.excludedExtensions.delete(e4.identifier.id.toLowerCase());
          } else {
            that.excludedExtensions.add(e4.identifier.id.toLowerCase());
          }
        },
        tooltip: localize(23617, null, e4.displayName || e4.identifier.id),
        accessibilityInformation: {
          label: localize(23617, null, e4.displayName || e4.identifier.id)
        }
      } : void 0,
      themeIcon: Codicon.extensions,
      command: {
        id: "extension.open",
        title: "",
        arguments: [e4.identifier.id, void 0, true]
      }
    }));
  }
  async hasContent() {
    const extensions = await this.getExtensions();
    return extensions.length > 0;
  }
};

var ExtensionsResourceExportTreeItem = class extends ExtensionsResourceTreeItem {
  constructor(profile, instantiationService) {
    super();
    this.profile = profile;
    this.instantiationService = instantiationService;
  }
  isFromDefaultProfile() {
    return !this.profile.isDefault && !!this.profile.useDefaultFlags?.extensions;
  }
  getExtensions() {
    return this.instantiationService.createInstance(ExtensionsResource).getLocalExtensions(this.profile);
  }
  async getContent() {
    return this.instantiationService.createInstance(ExtensionsResource).getContent(this.profile, [...this.excludedExtensions.values()]);
  }
};

ExtensionsResourceExportTreeItem = __decorateClass([
  __decorateParam(1, IInstantiationService)
], ExtensionsResourceExportTreeItem);

var ExtensionsResourceImportTreeItem = class extends ExtensionsResourceTreeItem {
  constructor(content, instantiationService) {
    super();
    this.content = content;
    this.instantiationService = instantiationService;
  }
  isFromDefaultProfile() {
    return false;
  }
  getExtensions() {
    return this.instantiationService.createInstance(ExtensionsResource).getProfileExtensions(this.content);
  }
  async getContent() {
    const extensionsResource = this.instantiationService.createInstance(ExtensionsResource);
    const extensions = await extensionsResource.getProfileExtensions(this.content);
    return extensionsResource.toContent(extensions, [...this.excludedExtensions.values()]);
  }
};

ExtensionsResourceImportTreeItem = __decorateClass([
  __decorateParam(1, IInstantiationService)
], ExtensionsResourceImportTreeItem);
export { ExtensionsResourceInitializer, ExtensionsResource, ExtensionsResourceTreeItem, ExtensionsResourceExportTreeItem, ExtensionsResourceImportTreeItem };
