// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/code/electron-utility/sharedProcess/sharedProcessMain.js
// Original module marker: src/vs/platform/extensionManagement/common/extensionManagementUtil.ts
import { compareIgnoreCase } from "./module-0022.mjs";
import { ExtensionIdentifier, UNDEFINED_PUBLISHER } from "./module-0055.mjs";
import { TelemetryTrustedValue } from "./module-0090.mjs";
import { isLinux, platform } from "./module-0014.mjs";
import { URI } from "./module-0024.mjs";
import { getErrorMessage } from "./module-0003.mjs";
import { getTargetPlatform } from "./module-0058.mjs";
import { arch } from "./module-0016.mjs";
import { isString } from "./module-0006.mjs";


// src/vs/platform/extensionManagement/common/extensionManagementUtil.ts
function areSameExtensions(a, b) {
  if (a.uuid && b.uuid) {
    return a.uuid === b.uuid;
  }
  if (a.id === b.id) {
    return true;
  }
  return compareIgnoreCase(a.id, b.id) === 0;
}

var ExtensionKeyRegex = /^([^.]+\..+)-(\d+\.\d+\.\d+)(-(.+))?$/;

var ExtensionKey = class _ExtensionKey {
  constructor(identifier, version, targetPlatform = "undefined" /* UNDEFINED */) {
    this.identifier = identifier;
    this.version = version;
    this.targetPlatform = targetPlatform;
    this.id = identifier.id;
  }
  static create(extension) {
    const version = extension.manifest ? extension.manifest.version : extension.version;
    const targetPlatform = extension.manifest ? extension.targetPlatform : extension.properties.targetPlatform;
    return new _ExtensionKey(extension.identifier, version, targetPlatform);
  }
  static parse(key) {
    const matches = ExtensionKeyRegex.exec(key);
    return matches && matches[1] && matches[2] ? new _ExtensionKey({ id: matches[1] }, matches[2], matches[4] || void 0) : null;
  }
  toString() {
    return `${this.id}-${this.version}${this.targetPlatform !== "undefined" /* UNDEFINED */ ? `-${this.targetPlatform}` : ""}`;
  }
  equals(o) {
    if (!(o instanceof _ExtensionKey)) {
      return false;
    }
    return areSameExtensions(this, o) && this.version === o.version && this.targetPlatform === o.targetPlatform;
  }
};

var EXTENSION_IDENTIFIER_WITH_VERSION_REGEX = /^([^.]+\..+)@((prerelease)|(\d+\.\d+\.\d+(-.*)?))$/;

function getIdAndVersion(id2) {
  const matches = EXTENSION_IDENTIFIER_WITH_VERSION_REGEX.exec(id2);
  if (matches && matches[1]) {
    return [adoptToGalleryExtensionId(matches[1]), matches[2]];
  }
  return [adoptToGalleryExtensionId(id2), void 0];
}

function getExtensionId(publisher, name) {
  return `${publisher}.${name}`;
}

function adoptToGalleryExtensionId(id2) {
  return id2.toLowerCase();
}

function getGalleryExtensionId(publisher, name) {
  return adoptToGalleryExtensionId(getExtensionId(publisher ?? UNDEFINED_PUBLISHER, name));
}

function groupByExtension(extensions, getExtensionIdentifier) {
  const byExtension = [];
  const findGroup = (extension) => {
    for (const group of byExtension) {
      if (group.some((e) => areSameExtensions(getExtensionIdentifier(e), getExtensionIdentifier(extension)))) {
        return group;
      }
    }
    return null;
  };
  for (const extension of extensions) {
    const group = findGroup(extension);
    if (group) {
      group.push(extension);
    } else {
      byExtension.push([extension]);
    }
  }
  return byExtension;
}

function getLocalExtensionTelemetryData(extension) {
  return {
    id: extension.identifier.id,
    name: extension.manifest.name,
    galleryId: null,
    publisherId: extension.publisherId,
    publisherName: extension.manifest.publisher,
    publisherDisplayName: extension.publisherDisplayName,
    dependencies: extension.manifest.extensionDependencies && extension.manifest.extensionDependencies.length > 0
  };
}

function getGalleryExtensionTelemetryData(extension) {
  return {
    id: new TelemetryTrustedValue(extension.identifier.id),
    name: new TelemetryTrustedValue(extension.name),
    extensionVersion: extension.version,
    galleryId: extension.identifier.uuid,
    publisherId: extension.publisherId,
    publisherName: extension.publisher,
    publisherDisplayName: extension.publisherDisplayName,
    isPreReleaseVersion: extension.properties.isPreReleaseVersion,
    dependencies: !!(extension.properties.dependencies && extension.properties.dependencies.length > 0),
    isSigned: extension.isSigned,
    ...extension.telemetryData
  };
}

var BetterMergeId = new ExtensionIdentifier("pprice.better-merge");

async function isAlpineLinux(fileService, logService) {
  if (!isLinux) {
    return false;
  }
  let content;
  try {
    const fileContent = await fileService.readFile(URI.file("/etc/os-release"));
    content = fileContent.value.toString();
  } catch (error) {
    try {
      const fileContent = await fileService.readFile(URI.file("/usr/lib/os-release"));
      content = fileContent.value.toString();
    } catch (error2) {
      logService.debug(`Error while getting the os-release file.`, getErrorMessage(error2));
    }
  }
  return !!content && (content.match(/^ID=([^\u001b\r\n]*)/m) || [])[1] === "alpine";
}

async function computeTargetPlatform(fileService, logService) {
  const alpineLinux = await isAlpineLinux(fileService, logService);
  const targetPlatform = getTargetPlatform(alpineLinux ? "alpine" : platform, arch);
  logService.debug("ComputeTargetPlatform:", targetPlatform);
  return targetPlatform;
}

function isMalicious(identifier, malicious) {
  return findMatchingMaliciousEntry(identifier, malicious) !== void 0;
}

function findMatchingMaliciousEntry(identifier, malicious) {
  return malicious.find(({ extensionOrPublisher }) => {
    if (isString(extensionOrPublisher)) {
      return compareIgnoreCase(identifier.id.split(".")[0], extensionOrPublisher) === 0;
    }
    return areSameExtensions(identifier, extensionOrPublisher);
  });
}
export { areSameExtensions, getIdAndVersion, getExtensionId, adoptToGalleryExtensionId, getGalleryExtensionId, groupByExtension, getLocalExtensionTelemetryData, getGalleryExtensionTelemetryData, isAlpineLinux, computeTargetPlatform, isMalicious, findMatchingMaliciousEntry, ExtensionKeyRegex, ExtensionKey, EXTENSION_IDENTIFIER_WITH_VERSION_REGEX, BetterMergeId };
