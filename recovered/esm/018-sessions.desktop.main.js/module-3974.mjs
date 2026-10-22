// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/services/extensionManagement/common/extensionManagementChannelClient.ts
import { ExtensionManagementChannelClient } from "./module-3973.mjs";
import { Emitter } from "./module-0017.mjs";
import { ExtensionIdentifier } from "./module-0688.mjs";
import { delta } from "./module-0007.mjs";
import { compare } from "./module-0030.mjs";


// src/vs/workbench/services/extensionManagement/common/extensionManagementChannelClient.ts
var ProfileAwareExtensionManagementChannelClient = class extends ExtensionManagementChannelClient {
  constructor(channel, productService, allowedExtensionsService, userDataProfileService, uriIdentityService) {
    super(channel, productService, allowedExtensionsService);
    this.userDataProfileService = userDataProfileService;
    this.uriIdentityService = uriIdentityService;
    this._onDidChangeProfile = this._register(new Emitter());
    this.onDidChangeProfile = this._onDidChangeProfile.event;
    this._onDidProfileAwareInstallExtensions = this._register(new Emitter());
    this._onDidProfileAwareUninstallExtension = this._register(new Emitter());
    this._onDidProfileAwareUpdateExtensionMetadata = this._register(new Emitter());
    this._register(userDataProfileService.onDidChangeCurrentProfile((e4) => {
      if (!this.uriIdentityService.extUri.isEqual(e4.previous.extensionsResource, e4.profile.extensionsResource)) {
        e4.join(this.whenProfileChanged(e4));
      }
    }));
  }
  get onProfileAwareDidInstallExtensions() {
    return this._onDidProfileAwareInstallExtensions.event;
  }
  get onProfileAwareDidUninstallExtension() {
    return this._onDidProfileAwareUninstallExtension.event;
  }
  get onProfileAwareDidUpdateExtensionMetadata() {
    return this._onDidProfileAwareUpdateExtensionMetadata.event;
  }
  async onInstallExtensionEvent(data) {
    const result = this.filterEvent(data.profileLocation, data.applicationScoped ?? false);
    if (result instanceof Promise ? await result : result) {
      this._onInstallExtension.fire(data);
    }
  }
  async onDidInstallExtensionsEvent(results) {
    const filtered = [];
    for (const e4 of results) {
      const result = this.filterEvent(e4.profileLocation, e4.applicationScoped ?? e4.local?.isApplicationScoped ?? false);
      if (result instanceof Promise ? await result : result) {
        filtered.push(e4);
      }
    }
    if (filtered.length) {
      this._onDidInstallExtensions.fire(filtered);
    }
    this._onDidProfileAwareInstallExtensions.fire(results);
  }
  async onUninstallExtensionEvent(data) {
    const result = this.filterEvent(data.profileLocation, data.applicationScoped ?? false);
    if (result instanceof Promise ? await result : result) {
      this._onUninstallExtension.fire(data);
    }
  }
  async onDidUninstallExtensionEvent(data) {
    const result = this.filterEvent(data.profileLocation, data.applicationScoped ?? false);
    if (result instanceof Promise ? await result : result) {
      this._onDidUninstallExtension.fire(data);
    }
    this._onDidProfileAwareUninstallExtension.fire(data);
  }
  async onDidUpdateExtensionMetadataEvent(data) {
    const result = this.filterEvent(data.profileLocation, data.local?.isApplicationScoped ?? false);
    if (result instanceof Promise ? await result : result) {
      this._onDidUpdateExtensionMetadata.fire(data);
    }
    this._onDidProfileAwareUpdateExtensionMetadata.fire(data);
  }
  async install(vsix, installOptions) {
    installOptions = { ...installOptions, profileLocation: await this.getProfileLocation(installOptions?.profileLocation) };
    return super.install(vsix, installOptions);
  }
  async installFromLocation(location2, profileLocation) {
    return super.installFromLocation(location2, await this.getProfileLocation(profileLocation));
  }
  async installFromGallery(extension, installOptions) {
    installOptions = { ...installOptions, profileLocation: await this.getProfileLocation(installOptions?.profileLocation) };
    return super.installFromGallery(extension, installOptions);
  }
  async installGalleryExtensions(extensions) {
    const infos = [];
    for (const extension of extensions) {
      infos.push({ ...extension, options: { ...extension.options, profileLocation: await this.getProfileLocation(extension.options?.profileLocation) } });
    }
    return super.installGalleryExtensions(infos);
  }
  async uninstall(extension, options3) {
    options3 = { ...options3, profileLocation: await this.getProfileLocation(options3?.profileLocation) };
    return super.uninstall(extension, options3);
  }
  async uninstallExtensions(extensions) {
    const infos = [];
    for (const { extension, options: options3 } of extensions) {
      infos.push({ extension, options: { ...options3, profileLocation: await this.getProfileLocation(options3?.profileLocation) } });
    }
    return super.uninstallExtensions(infos);
  }
  async getInstalled(type = null, extensionsProfileResource, productVersion) {
    return super.getInstalled(type, await this.getProfileLocation(extensionsProfileResource), productVersion);
  }
  async updateMetadata(local, metadata, extensionsProfileResource) {
    return super.updateMetadata(local, metadata, await this.getProfileLocation(extensionsProfileResource));
  }
  async toggleApplicationScope(local, fromProfileLocation) {
    return super.toggleApplicationScope(local, await this.getProfileLocation(fromProfileLocation));
  }
  async copyExtensions(fromProfileLocation, toProfileLocation) {
    return super.copyExtensions(await this.getProfileLocation(fromProfileLocation), await this.getProfileLocation(toProfileLocation));
  }
  async whenProfileChanged(e4) {
    const previousProfileLocation = await this.getProfileLocation(e4.previous.extensionsResource);
    const currentProfileLocation = await this.getProfileLocation(e4.profile.extensionsResource);
    if (this.uriIdentityService.extUri.isEqual(previousProfileLocation, currentProfileLocation)) {
      return;
    }
    const eventData = await this.switchExtensionsProfile(previousProfileLocation, currentProfileLocation);
    this._onDidChangeProfile.fire(eventData);
  }
  async switchExtensionsProfile(previousProfileLocation, currentProfileLocation, preserveExtensions) {
    const oldExtensions = await this.getInstalled(1 /* User */, previousProfileLocation);
    const newExtensions = await this.getInstalled(1 /* User */, currentProfileLocation);
    if (preserveExtensions?.length) {
      const extensionsToInstall = [];
      for (const extension of oldExtensions) {
        if (preserveExtensions.some((id2) => ExtensionIdentifier.equals(extension.identifier.id, id2)) && !newExtensions.some((e4) => ExtensionIdentifier.equals(e4.identifier.id, extension.identifier.id))) {
          extensionsToInstall.push(extension.identifier);
        }
      }
      if (extensionsToInstall.length) {
        await this.installExtensionsFromProfile(extensionsToInstall, previousProfileLocation, currentProfileLocation);
      }
    }
    return delta(oldExtensions, newExtensions, (a, b) => compare(`${ExtensionIdentifier.toKey(a.identifier.id)}@${a.manifest.version}`, `${ExtensionIdentifier.toKey(b.identifier.id)}@${b.manifest.version}`));
  }
  async getProfileLocation(profileLocation) {
    return profileLocation ?? this.userDataProfileService.currentProfile.extensionsResource;
  }
};
export { ProfileAwareExtensionManagementChannelClient };
