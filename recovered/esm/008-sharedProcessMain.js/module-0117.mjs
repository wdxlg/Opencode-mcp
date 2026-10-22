// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/code/electron-utility/sharedProcess/sharedProcessMain.js
// Original module marker: src/vs/platform/extensionManagement/common/extensionManagementIpc.ts
import { URI } from "./module-0024.mjs";
import { DefaultURITransformer, transformAndReviveIncomingURIs } from "./module-0107.mjs";
import { cloneAndChange } from "./module-0074.mjs";
import { Event } from "./module-0018.mjs";


// src/vs/platform/extensionManagement/common/extensionManagementIpc.ts
function transformIncomingURI(uri, transformer) {
  return uri ? URI.revive(transformer ? transformer.transformIncoming(uri) : uri) : void 0;
}

function transformOutgoingURI(uri, transformer) {
  return transformer ? transformer.transformOutgoingURI(uri) : uri;
}

function transformIncomingExtension(extension, transformer) {
  transformer = transformer ? transformer : DefaultURITransformer;
  const manifest = extension.manifest;
  const transformed = transformAndReviveIncomingURIs({ ...extension, ...{ manifest: void 0 } }, transformer);
  return { ...transformed, ...{ manifest } };
}

function transformIncomingOptions(options, transformer) {
  return options?.profileLocation ? transformAndReviveIncomingURIs(options, transformer ?? DefaultURITransformer) : options;
}

function transformOutgoingExtension(extension, transformer) {
  return transformer ? cloneAndChange(extension, (value) => value instanceof URI ? transformer.transformOutgoingURI(value) : void 0) : extension;
}

var ExtensionManagementChannel = class {
  constructor(service, getUriTransformer) {
    this.service = service;
    this.getUriTransformer = getUriTransformer;
    this.onInstallExtension = Event.buffer(service.onInstallExtension, "onInstallExtension", true);
    this.onDidInstallExtensions = Event.buffer(service.onDidInstallExtensions, "onDidInstallExtensions", true);
    this.onUninstallExtension = Event.buffer(service.onUninstallExtension, "onUninstallExtension", true);
    this.onDidUninstallExtension = Event.buffer(service.onDidUninstallExtension, "onDidUninstallExtension", true);
    this.onDidUpdateExtensionMetadata = Event.buffer(service.onDidUpdateExtensionMetadata, "onDidUpdateExtensionMetadata", true);
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  listen(context, event) {
    const uriTransformer = this.getUriTransformer(context);
    switch (event) {
      case "onInstallExtension": {
        return Event.map(this.onInstallExtension, (e) => {
          return {
            ...e,
            profileLocation: e.profileLocation ? transformOutgoingURI(e.profileLocation, uriTransformer) : e.profileLocation
          };
        });
      }
      case "onDidInstallExtensions": {
        return Event.map(this.onDidInstallExtensions, (results) => results.map((i) => ({
          ...i,
          local: i.local ? transformOutgoingExtension(i.local, uriTransformer) : i.local,
          profileLocation: i.profileLocation ? transformOutgoingURI(i.profileLocation, uriTransformer) : i.profileLocation
        })));
      }
      case "onUninstallExtension": {
        return Event.map(this.onUninstallExtension, (e) => {
          return {
            ...e,
            profileLocation: e.profileLocation ? transformOutgoingURI(e.profileLocation, uriTransformer) : e.profileLocation
          };
        });
      }
      case "onDidUninstallExtension": {
        return Event.map(this.onDidUninstallExtension, (e) => {
          return {
            ...e,
            profileLocation: e.profileLocation ? transformOutgoingURI(e.profileLocation, uriTransformer) : e.profileLocation
          };
        });
      }
      case "onDidUpdateExtensionMetadata": {
        return Event.map(this.onDidUpdateExtensionMetadata, (e) => {
          return {
            local: transformOutgoingExtension(e.local, uriTransformer),
            profileLocation: transformOutgoingURI(e.profileLocation, uriTransformer)
          };
        });
      }
    }
    throw new Error("Invalid listen");
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async call(context, command, args) {
    const uriTransformer = this.getUriTransformer(context);
    switch (command) {
      case "zip": {
        const extension = transformIncomingExtension(args[0], uriTransformer);
        const uri = await this.service.zip(extension);
        return transformOutgoingURI(uri, uriTransformer);
      }
      case "install": {
        return this.service.install(transformIncomingURI(args[0], uriTransformer), transformIncomingOptions(args[1], uriTransformer));
      }
      case "installFromLocation": {
        return this.service.installFromLocation(transformIncomingURI(args[0], uriTransformer), transformIncomingURI(args[1], uriTransformer));
      }
      case "installExtensionsFromProfile": {
        return this.service.installExtensionsFromProfile(args[0], transformIncomingURI(args[1], uriTransformer), transformIncomingURI(args[2], uriTransformer));
      }
      case "getManifest": {
        return this.service.getManifest(transformIncomingURI(args[0], uriTransformer));
      }
      case "getTargetPlatform": {
        return this.service.getTargetPlatform();
      }
      case "installFromGallery": {
        return this.service.installFromGallery(args[0], transformIncomingOptions(args[1], uriTransformer));
      }
      case "installGalleryExtensions": {
        const arg = args[0];
        return this.service.installGalleryExtensions(arg.map(({ extension, options }) => ({ extension, options: transformIncomingOptions(options, uriTransformer) ?? {} })));
      }
      case "uninstall": {
        return this.service.uninstall(transformIncomingExtension(args[0], uriTransformer), transformIncomingOptions(args[1], uriTransformer));
      }
      case "uninstallExtensions": {
        const arg = args[0];
        return this.service.uninstallExtensions(arg.map(({ extension, options }) => ({ extension: transformIncomingExtension(extension, uriTransformer), options: transformIncomingOptions(options, uriTransformer) })));
      }
      case "getInstalled": {
        const extensions = await this.service.getInstalled(args[0], transformIncomingURI(args[1], uriTransformer), args[2], args[3]);
        return extensions.map((e) => transformOutgoingExtension(e, uriTransformer));
      }
      case "toggleApplicationScope": {
        const extension = await this.service.toggleApplicationScope(transformIncomingExtension(args[0], uriTransformer), transformIncomingURI(args[1], uriTransformer));
        return transformOutgoingExtension(extension, uriTransformer);
      }
      case "copyExtensions": {
        return this.service.copyExtensions(transformIncomingURI(args[0], uriTransformer), transformIncomingURI(args[1], uriTransformer));
      }
      case "updateMetadata": {
        const e = await this.service.updateMetadata(transformIncomingExtension(args[0], uriTransformer), args[1], transformIncomingURI(args[2], uriTransformer));
        return transformOutgoingExtension(e, uriTransformer);
      }
      case "resetPinnedStateForAllUserExtensions": {
        return this.service.resetPinnedStateForAllUserExtensions(args[0]);
      }
      case "getExtensionsControlManifest": {
        return this.service.getExtensionsControlManifest();
      }
      case "download": {
        return this.service.download(args[0], args[1], args[2]);
      }
      case "cleanUp": {
        return this.service.cleanUp();
      }
    }
    throw new Error("Invalid call");
  }
};

var ExtensionTipsChannel = class {
  constructor(service) {
    this.service = service;
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  listen(context, event) {
    throw new Error("Invalid listen");
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  call(context, command, args) {
    switch (command) {
      case "getConfigBasedTips":
        return this.service.getConfigBasedTips(URI.revive(args[0]));
      case "getImportantExecutableBasedTips":
        return this.service.getImportantExecutableBasedTips();
      case "getOtherExecutableBasedTips":
        return this.service.getOtherExecutableBasedTips();
    }
    throw new Error("Invalid call");
  }
};
export { transformIncomingURI, transformOutgoingURI, transformIncomingExtension, transformIncomingOptions, transformOutgoingExtension, ExtensionManagementChannel, ExtensionTipsChannel };
