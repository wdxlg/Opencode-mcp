// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/platform/extensionManagement/common/extensionManagementUtil.ts
import { compareIgnoreCase } from "./module-0030.mjs";
import { ExtensionIdentifier, UNDEFINED_PUBLISHER } from "./module-0688.mjs";
import { TelemetryTrustedValue } from "./module-0885.mjs";
import { isLinux, platform } from "./module-0014.mjs";
import { URI } from "./module-0032.mjs";
import { getErrorMessage } from "./module-0004.mjs";
import { getTargetPlatform } from "./module-0872.mjs";
import { arch } from "./module-0015.mjs";
import { isString } from "./module-0010.mjs";


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
  constructor(identifier2, version2, targetPlatform = "undefined" /* UNDEFINED */) {
    this.identifier = identifier2;
    this.version = version2;
    this.targetPlatform = targetPlatform;
    this.id = identifier2.id;
  }
  static create(extension) {
    const version2 = extension.manifest ? extension.manifest.version : extension.version;
    const targetPlatform = extension.manifest ? extension.targetPlatform : extension.properties.targetPlatform;
    return new _ExtensionKey(extension.identifier, version2, targetPlatform);
  }
  static parse(key3) {
    const matches2 = ExtensionKeyRegex.exec(key3);
    return matches2 && matches2[1] && matches2[2] ? new _ExtensionKey({ id: matches2[1] }, matches2[2], matches2[4] || void 0) : null;
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
  const matches2 = EXTENSION_IDENTIFIER_WITH_VERSION_REGEX.exec(id2);
  if (matches2 && matches2[1]) {
    return [adoptToGalleryExtensionId(matches2[1]), matches2[2]];
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
  const findGroup2 = (extension) => {
    for (const group2 of byExtension) {
      if (group2.some((e) => areSameExtensions(getExtensionIdentifier(e), getExtensionIdentifier(extension)))) {
        return group2;
      }
    }
    return null;
  };
  for (const extension of extensions) {
    const group2 = findGroup2(extension);
    if (group2) {
      group2.push(extension);
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

function getExtensionDependencies(installedExtensions, extension) {
  const dependencies = [];
  const extensions = extension.manifest.extensionDependencies?.slice(0) ?? [];
  while (extensions.length) {
    const id2 = extensions.shift();
    if (id2 && dependencies.every((e) => !areSameExtensions(e.identifier, { id: id2 }))) {
      const ext = installedExtensions.filter((e) => areSameExtensions(e.identifier, { id: id2 }));
      if (ext.length === 1) {
        dependencies.push(ext[0]);
        extensions.push(...ext[0].manifest.extensionDependencies?.slice(0) ?? []);
      }
    }
  }
  return dependencies;
}

async function isAlpineLinux(fileService, logService) {
  if (!isLinux) {
    return false;
  }
  let content2;
  try {
    const fileContent = await fileService.readFile(URI.file("/etc/os-release"));
    content2 = fileContent.value.toString();
  } catch (error) {
    try {
      const fileContent = await fileService.readFile(URI.file("/usr/lib/os-release"));
      content2 = fileContent.value.toString();
    } catch (error2) {
      logService.debug(`Error while getting the os-release file.`, getErrorMessage(error2));
    }
  }
  return !!content2 && (content2.match(/^ID=([^\u001b\r\n]*)/m) || [])[1] === "alpine";
}

async function computeTargetPlatform(fileService, logService) {
  const alpineLinux = await isAlpineLinux(fileService, logService);
  const targetPlatform = getTargetPlatform(alpineLinux ? "alpine" : platform, arch);
  logService.debug("ComputeTargetPlatform:", targetPlatform);
  return targetPlatform;
}

function isMalicious(identifier2, malicious) {
  return findMatchingMaliciousEntry(identifier2, malicious) !== void 0;
}

function findMatchingMaliciousEntry(identifier2, malicious) {
  return malicious.find(({ extensionOrPublisher }) => {
    if (isString(extensionOrPublisher)) {
      return compareIgnoreCase(identifier2.id.split(".")[0], extensionOrPublisher) === 0;
    }
    return areSameExtensions(identifier2, extensionOrPublisher);
  });
}
export { areSameExtensions, getIdAndVersion, getExtensionId, adoptToGalleryExtensionId, getGalleryExtensionId, groupByExtension, getLocalExtensionTelemetryData, getGalleryExtensionTelemetryData, getExtensionDependencies, isAlpineLinux, computeTargetPlatform, isMalicious, findMatchingMaliciousEntry, ExtensionKeyRegex, ExtensionKey, EXTENSION_IDENTIFIER_WITH_VERSION_REGEX, BetterMergeId };
