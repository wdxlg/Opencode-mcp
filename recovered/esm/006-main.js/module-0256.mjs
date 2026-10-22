// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/main.js
// Original module marker: src/vs/platform/extensionManagement/common/extensionManagementUtil.ts
import { compareIgnoreCase, init_strings } from "./module-0027.mjs";
import { ExtensionIdentifier, UNDEFINED_PUBLISHER, init_extensions } from "./module-0254.mjs";
import { init_platform, isLinux, platform } from "./module-0006.mjs";
import { URI, init_uri } from "./module-0030.mjs";
import { getErrorMessage, init_errors } from "./module-0010.mjs";
import { getTargetPlatform, init_extensionManagement } from "./module-0255.mjs";
import { arch, init_process } from "./module-0007.mjs";
import { __esm } from "./module-0000.mjs";
import { init_telemetryUtils } from "./module-0215.mjs";
import { init_types } from "./module-0016.mjs";


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

function getExtensionId(publisher, name) {
  return `${publisher}.${name}`;
}

function adoptToGalleryExtensionId(id2) {
  return id2.toLowerCase();
}

function getGalleryExtensionId(publisher, name) {
  return adoptToGalleryExtensionId(getExtensionId(publisher ?? UNDEFINED_PUBLISHER, name));
}

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

var BetterMergeId;

var init_extensionManagementUtil = __esm({
  "src/vs/platform/extensionManagement/common/extensionManagementUtil.ts"() {
    init_strings();
    init_extensionManagement();
    init_extensions();
    init_platform();
    init_uri();
    init_errors();
    init_process();
    init_telemetryUtils();
    init_types();
    BetterMergeId = new ExtensionIdentifier("pprice.better-merge");
  }
});
export { areSameExtensions, getExtensionId, adoptToGalleryExtensionId, getGalleryExtensionId, isAlpineLinux, computeTargetPlatform, BetterMergeId, init_extensionManagementUtil };
