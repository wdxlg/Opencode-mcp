// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/platform/extensionManagement/common/extensionsProfileScannerService.ts
import { createDecorator } from "./module-0077.mjs";
import { Disposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { ResourceMap } from "./module-0008.mjs";
import { areSameExtensions } from "./module-0888.mjs";
import { IFileService, toFileOperationResult } from "./module-0269.mjs";
import { getErrorMessage } from "./module-0004.mjs";
import { isObject, isString, isUndefined } from "./module-0010.mjs";
import { URI } from "./module-0032.mjs";
import { VSBuffer } from "./module-0038.mjs";
import { Queue } from "./module-0036.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IUserDataProfilesService } from "./module-0511.mjs";
import { IUriIdentityService } from "./module-0510.mjs";
import { ILogService } from "./module-0095.mjs";
import { isIExtensionIdentifier } from "./module-0874.mjs";


// src/vs/platform/extensionManagement/common/extensionsProfileScannerService.ts
var ExtensionsProfileScanningError = class extends Error {
  constructor(message, code) {
    super(message);
    this.code = code;
  }
};

var IExtensionsProfileScannerService = createDecorator("IExtensionsProfileScannerService");

var AbstractExtensionsProfileScannerService = class extends Disposable {
  constructor(extensionsLocation, fileService, userDataProfilesService, uriIdentityService, logService) {
    super();
    this.extensionsLocation = extensionsLocation;
    this.fileService = fileService;
    this.userDataProfilesService = userDataProfilesService;
    this.uriIdentityService = uriIdentityService;
    this.logService = logService;
    this._onAddExtensions = this._register(new Emitter());
    this.onAddExtensions = this._onAddExtensions.event;
    this._onDidAddExtensions = this._register(new Emitter());
    this.onDidAddExtensions = this._onDidAddExtensions.event;
    this._onRemoveExtensions = this._register(new Emitter());
    this.onRemoveExtensions = this._onRemoveExtensions.event;
    this._onDidRemoveExtensions = this._register(new Emitter());
    this.onDidRemoveExtensions = this._onDidRemoveExtensions.event;
    this.resourcesAccessQueueMap = new ResourceMap();
  }
  scanProfileExtensions(profileLocation, options3) {
    return this.withProfileExtensions(profileLocation, void 0, options3);
  }
  async addExtensionsToProfile(extensions, profileLocation, keepExistingVersions) {
    const extensionsToRemove = [];
    const extensionsToAdd = [];
    try {
      await this.withProfileExtensions(profileLocation, (existingExtensions) => {
        const result = [];
        if (keepExistingVersions) {
          result.push(...existingExtensions);
        } else {
          for (const existing of existingExtensions) {
            if (extensions.some(([e4]) => areSameExtensions(e4.identifier, existing.identifier) && e4.manifest.version !== existing.version)) {
              extensionsToRemove.push(existing);
            } else {
              result.push(existing);
            }
          }
        }
        for (const [extension, metadata] of extensions) {
          const index2 = result.findIndex((e4) => areSameExtensions(e4.identifier, extension.identifier) && e4.version === extension.manifest.version);
          const extensionToAdd = { identifier: extension.identifier, version: extension.manifest.version, location: extension.location, metadata };
          if (index2 === -1) {
            extensionsToAdd.push(extensionToAdd);
            result.push(extensionToAdd);
          } else {
            result.splice(index2, 1, extensionToAdd);
          }
        }
        if (extensionsToAdd.length) {
          this._onAddExtensions.fire({ extensions: extensionsToAdd, profileLocation });
        }
        if (extensionsToRemove.length) {
          this._onRemoveExtensions.fire({ extensions: extensionsToRemove, profileLocation });
        }
        return result;
      });
      if (extensionsToAdd.length) {
        this._onDidAddExtensions.fire({ extensions: extensionsToAdd, profileLocation });
      }
      if (extensionsToRemove.length) {
        this._onDidRemoveExtensions.fire({ extensions: extensionsToRemove, profileLocation });
      }
      return extensionsToAdd;
    } catch (error) {
      if (extensionsToAdd.length) {
        this._onDidAddExtensions.fire({ extensions: extensionsToAdd, error, profileLocation });
      }
      if (extensionsToRemove.length) {
        this._onDidRemoveExtensions.fire({ extensions: extensionsToRemove, error, profileLocation });
      }
      throw error;
    }
  }
  async updateMetadata(extensions, profileLocation) {
    const updatedExtensions = [];
    await this.withProfileExtensions(profileLocation, (profileExtensions) => {
      const result = [];
      for (const profileExtension of profileExtensions) {
        const extension = extensions.find(([e4]) => areSameExtensions({ id: e4.identifier.id }, { id: profileExtension.identifier.id }) && e4.manifest.version === profileExtension.version);
        if (extension) {
          profileExtension.metadata = { ...profileExtension.metadata, ...extension[1] };
          updatedExtensions.push(profileExtension);
          result.push(profileExtension);
        } else {
          result.push(profileExtension);
        }
      }
      return result;
    });
    return updatedExtensions;
  }
  async removeExtensionsFromProfile(extensions, profileLocation) {
    const extensionsToRemove = [];
    try {
      await this.withProfileExtensions(profileLocation, (profileExtensions) => {
        const result = [];
        for (const e4 of profileExtensions) {
          if (extensions.some((extension) => areSameExtensions(e4.identifier, extension))) {
            extensionsToRemove.push(e4);
          } else {
            result.push(e4);
          }
        }
        if (extensionsToRemove.length) {
          this._onRemoveExtensions.fire({ extensions: extensionsToRemove, profileLocation });
        }
        return result;
      });
      if (extensionsToRemove.length) {
        this._onDidRemoveExtensions.fire({ extensions: extensionsToRemove, profileLocation });
      }
    } catch (error) {
      if (extensionsToRemove.length) {
        this._onDidRemoveExtensions.fire({ extensions: extensionsToRemove, error, profileLocation });
      }
      throw error;
    }
  }
  async withProfileExtensions(file, updateFn, options3) {
    return this.getResourceAccessQueue(file).queue(async () => {
      let extensions = [];
      let storedProfileExtensions;
      try {
        const content = await this.fileService.readFile(file);
        storedProfileExtensions = JSON.parse(content.value.toString().trim() || "[]");
      } catch (error) {
        if (toFileOperationResult(error) !== 1 /* FILE_NOT_FOUND */) {
          throw error;
        }
        if (this.uriIdentityService.extUri.isEqual(file, this.userDataProfilesService.defaultProfile.extensionsResource)) {
          storedProfileExtensions = await this.migrateFromOldDefaultProfileExtensionsLocation();
        }
        if (!storedProfileExtensions && options3?.bailOutWhenFileNotFound) {
          throw new ExtensionsProfileScanningError(getErrorMessage(error), "ERROR_PROFILE_NOT_FOUND" /* ERROR_PROFILE_NOT_FOUND */);
        }
      }
      if (storedProfileExtensions) {
        if (!Array.isArray(storedProfileExtensions)) {
          this.throwInvalidConentError(file);
        }
        let migrate = false;
        for (const e4 of storedProfileExtensions) {
          if (!isStoredProfileExtension(e4)) {
            this.throwInvalidConentError(file);
          }
          let location2;
          if (isString(e4.relativeLocation) && e4.relativeLocation) {
            location2 = this.resolveExtensionLocation(e4.relativeLocation);
          } else if (isString(e4.location)) {
            this.logService.warn(`Extensions profile: Ignoring extension with invalid location: ${e4.location}`);
            continue;
          } else {
            location2 = URI.revive(e4.location);
            const relativePath2 = this.toRelativePath(location2);
            if (relativePath2) {
              migrate = true;
              e4.relativeLocation = relativePath2;
            }
          }
          if (isUndefined(e4.metadata?.hasPreReleaseVersion) && e4.metadata?.preRelease) {
            migrate = true;
            e4.metadata.hasPreReleaseVersion = true;
          }
          const uuid = e4.metadata?.id ?? e4.identifier.uuid;
          extensions.push({
            identifier: uuid ? { id: e4.identifier.id, uuid } : { id: e4.identifier.id },
            location: location2,
            version: e4.version,
            metadata: e4.metadata
          });
        }
        if (migrate) {
          await this.fileService.writeFile(file, VSBuffer.fromString(JSON.stringify(storedProfileExtensions)));
        }
      }
      if (updateFn) {
        extensions = updateFn(extensions);
        const storedProfileExtensions2 = extensions.map((e4) => ({
          identifier: e4.identifier,
          version: e4.version,
          // retain old format so that old clients can read it
          location: e4.location.toJSON(),
          relativeLocation: this.toRelativePath(e4.location),
          metadata: e4.metadata
        }));
        await this.fileService.writeFile(file, VSBuffer.fromString(JSON.stringify(storedProfileExtensions2)));
      }
      return extensions;
    });
  }
  throwInvalidConentError(file) {
    throw new ExtensionsProfileScanningError(`Invalid extensions content in ${file.toString()}`, "ERROR_INVALID_CONTENT" /* ERROR_INVALID_CONTENT */);
  }
  toRelativePath(extensionLocation) {
    return this.uriIdentityService.extUri.isEqual(this.uriIdentityService.extUri.dirname(extensionLocation), this.extensionsLocation) ? this.uriIdentityService.extUri.basename(extensionLocation) : void 0;
  }
  resolveExtensionLocation(path) {
    return this.uriIdentityService.extUri.joinPath(this.extensionsLocation, path);
  }
  async migrateFromOldDefaultProfileExtensionsLocation() {
    if (!this._migrationPromise) {
      this._migrationPromise = (async () => {
        const oldDefaultProfileExtensionsLocation = this.uriIdentityService.extUri.joinPath(this.userDataProfilesService.defaultProfile.location, "extensions.json");
        const oldDefaultProfileExtensionsInitLocation = this.uriIdentityService.extUri.joinPath(this.extensionsLocation, ".init-default-profile-extensions");
        let content;
        try {
          content = (await this.fileService.readFile(oldDefaultProfileExtensionsLocation)).value.toString();
        } catch (error) {
          if (toFileOperationResult(error) === 1 /* FILE_NOT_FOUND */) {
            return void 0;
          }
          throw error;
        }
        this.logService.info("Migrating extensions from old default profile location", oldDefaultProfileExtensionsLocation.toString());
        let storedProfileExtensions;
        try {
          const parsedData = JSON.parse(content);
          if (Array.isArray(parsedData) && parsedData.every((candidate) => isStoredProfileExtension(candidate))) {
            storedProfileExtensions = parsedData;
          } else {
            this.logService.warn("Skipping migrating from old default profile locaiton: Found invalid data", parsedData);
          }
        } catch (error) {
          this.logService.error(error);
        }
        if (storedProfileExtensions) {
          try {
            await this.fileService.createFile(this.userDataProfilesService.defaultProfile.extensionsResource, VSBuffer.fromString(JSON.stringify(storedProfileExtensions)), { overwrite: false });
            this.logService.info("Migrated extensions from old default profile location to new location", oldDefaultProfileExtensionsLocation.toString(), this.userDataProfilesService.defaultProfile.extensionsResource.toString());
          } catch (error) {
            if (toFileOperationResult(error) === 3 /* FILE_MODIFIED_SINCE */) {
              this.logService.info("Migration from old default profile location to new location is done by another window", oldDefaultProfileExtensionsLocation.toString(), this.userDataProfilesService.defaultProfile.extensionsResource.toString());
            } else {
              throw error;
            }
          }
        }
        try {
          await this.fileService.del(oldDefaultProfileExtensionsLocation);
        } catch (error) {
          if (toFileOperationResult(error) !== 1 /* FILE_NOT_FOUND */) {
            this.logService.error(error);
          }
        }
        try {
          await this.fileService.del(oldDefaultProfileExtensionsInitLocation);
        } catch (error) {
          if (toFileOperationResult(error) !== 1 /* FILE_NOT_FOUND */) {
            this.logService.error(error);
          }
        }
        return storedProfileExtensions;
      })();
    }
    return this._migrationPromise;
  }
  getResourceAccessQueue(file) {
    let resourceQueue = this.resourcesAccessQueueMap.get(file);
    if (!resourceQueue) {
      resourceQueue = new Queue();
      this.resourcesAccessQueueMap.set(file, resourceQueue);
    }
    return resourceQueue;
  }
};

AbstractExtensionsProfileScannerService = __decorateClass([
  __decorateParam(1, IFileService),
  __decorateParam(2, IUserDataProfilesService),
  __decorateParam(3, IUriIdentityService),
  __decorateParam(4, ILogService)
], AbstractExtensionsProfileScannerService);

function isStoredProfileExtension(obj) {
  const candidate = obj;
  return isObject(candidate) && isIExtensionIdentifier(candidate.identifier) && (isUriComponents2(candidate.location) || isString(candidate.location) && !!candidate.location) && (isUndefined(candidate.relativeLocation) || isString(candidate.relativeLocation)) && !!candidate.version && isString(candidate.version);
}

function isUriComponents2(obj) {
  if (!obj) {
    return false;
  }
  const thing = obj;
  return typeof thing?.path === "string" && typeof thing?.scheme === "string";
}
export { isStoredProfileExtension, isUriComponents2, ExtensionsProfileScanningError, IExtensionsProfileScannerService, AbstractExtensionsProfileScannerService };
