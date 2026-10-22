// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/platform/extensionManagement/common/extensionManagement.ts
import { createDecorator } from "./module-0077.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { Registry } from "./module-0090.mjs";
import { Extensions4 } from "./module-0140.mjs";


// src/vs/platform/extensionManagement/common/extensionManagement.ts
var EXTENSION_IDENTIFIER_PATTERN = "^([a-z0-9A-Z][a-z0-9-A-Z]*)\\.([a-z0-9A-Z][a-z0-9-A-Z]*)$";

var EXTENSION_IDENTIFIER_REGEX = new RegExp(EXTENSION_IDENTIFIER_PATTERN);

var WEB_EXTENSION_TAG = "__web_extension";

var EXTENSION_INSTALL_SKIP_WALKTHROUGH_CONTEXT = "skipWalkthrough";

var EXTENSION_INSTALL_SKIP_PUBLISHER_TRUST_CONTEXT = "skipPublisherTrust";

var EXTENSION_INSTALL_SOURCE_CONTEXT = "extensionInstallSource";

var EXTENSION_INSTALL_DEP_PACK_CONTEXT = "dependecyOrPackExtensionInstall";

var EXTENSION_INSTALL_CLIENT_TARGET_PLATFORM_CONTEXT = "clientTargetPlatform";

function TargetPlatformToString(targetPlatform) {
  switch (targetPlatform) {
    case "win32-x64" /* WIN32_X64 */:
      return "Windows 64 bit";
    case "win32-arm64" /* WIN32_ARM64 */:
      return "Windows ARM";
    case "linux-x64" /* LINUX_X64 */:
      return "Linux 64 bit";
    case "linux-arm64" /* LINUX_ARM64 */:
      return "Linux ARM 64";
    case "linux-armhf" /* LINUX_ARMHF */:
      return "Linux ARM";
    case "alpine-x64" /* ALPINE_X64 */:
      return "Alpine Linux 64 bit";
    case "alpine-arm64" /* ALPINE_ARM64 */:
      return "Alpine ARM 64";
    case "darwin-x64" /* DARWIN_X64 */:
      return "Mac";
    case "darwin-arm64" /* DARWIN_ARM64 */:
      return "Mac Silicon";
    case "web" /* WEB */:
      return "Web";
    case "universal" /* UNIVERSAL */:
      return "universal" /* UNIVERSAL */;
    case "unknown" /* UNKNOWN */:
      return "unknown" /* UNKNOWN */;
    case "undefined" /* UNDEFINED */:
      return "undefined" /* UNDEFINED */;
  }
}

function toTargetPlatform(targetPlatform) {
  switch (targetPlatform) {
    case "win32-x64" /* WIN32_X64 */:
      return "win32-x64" /* WIN32_X64 */;
    case "win32-arm64" /* WIN32_ARM64 */:
      return "win32-arm64" /* WIN32_ARM64 */;
    case "linux-x64" /* LINUX_X64 */:
      return "linux-x64" /* LINUX_X64 */;
    case "linux-arm64" /* LINUX_ARM64 */:
      return "linux-arm64" /* LINUX_ARM64 */;
    case "linux-armhf" /* LINUX_ARMHF */:
      return "linux-armhf" /* LINUX_ARMHF */;
    case "alpine-x64" /* ALPINE_X64 */:
      return "alpine-x64" /* ALPINE_X64 */;
    case "alpine-arm64" /* ALPINE_ARM64 */:
      return "alpine-arm64" /* ALPINE_ARM64 */;
    case "darwin-x64" /* DARWIN_X64 */:
      return "darwin-x64" /* DARWIN_X64 */;
    case "darwin-arm64" /* DARWIN_ARM64 */:
      return "darwin-arm64" /* DARWIN_ARM64 */;
    case "web" /* WEB */:
      return "web" /* WEB */;
    case "universal" /* UNIVERSAL */:
      return "universal" /* UNIVERSAL */;
    default:
      return "unknown" /* UNKNOWN */;
  }
}

function getTargetPlatform(platform3, arch2) {
  switch (platform3) {
    case 3 /* Windows */:
      if (arch2 === "x64") {
        return "win32-x64" /* WIN32_X64 */;
      }
      if (arch2 === "arm64") {
        return "win32-arm64" /* WIN32_ARM64 */;
      }
      return "unknown" /* UNKNOWN */;
    case 2 /* Linux */:
      if (arch2 === "x64") {
        return "linux-x64" /* LINUX_X64 */;
      }
      if (arch2 === "arm64") {
        return "linux-arm64" /* LINUX_ARM64 */;
      }
      if (arch2 === "arm") {
        return "linux-armhf" /* LINUX_ARMHF */;
      }
      return "unknown" /* UNKNOWN */;
    case "alpine":
      if (arch2 === "x64") {
        return "alpine-x64" /* ALPINE_X64 */;
      }
      if (arch2 === "arm64") {
        return "alpine-arm64" /* ALPINE_ARM64 */;
      }
      return "unknown" /* UNKNOWN */;
    case 1 /* Mac */:
      if (arch2 === "x64") {
        return "darwin-x64" /* DARWIN_X64 */;
      }
      if (arch2 === "arm64") {
        return "darwin-arm64" /* DARWIN_ARM64 */;
      }
      return "unknown" /* UNKNOWN */;
    case 0 /* Web */:
      return "web" /* WEB */;
  }
}

function isNotWebExtensionInWebTargetPlatform(allTargetPlatforms, productTargetPlatform) {
  return productTargetPlatform === "web" /* WEB */ && !allTargetPlatforms.includes("web" /* WEB */);
}

function isTargetPlatformCompatible(extensionTargetPlatform, allTargetPlatforms, productTargetPlatform) {
  if (isNotWebExtensionInWebTargetPlatform(allTargetPlatforms, productTargetPlatform)) {
    return false;
  }
  if (extensionTargetPlatform === "undefined" /* UNDEFINED */) {
    return true;
  }
  if (extensionTargetPlatform === "universal" /* UNIVERSAL */) {
    return true;
  }
  if (extensionTargetPlatform === "unknown" /* UNKNOWN */) {
    return false;
  }
  if (extensionTargetPlatform === productTargetPlatform) {
    return true;
  }
  return false;
}

function isIExtensionIdentifier(obj) {
  const thing = obj;
  return !!thing && typeof thing === "object" && typeof thing.id === "string" && (!thing.uuid || typeof thing.uuid === "string");
}

var IExtensionGalleryService = createDecorator("extensionGalleryService");

var ExtensionGalleryError = class extends Error {
  constructor(message, code) {
    super(message);
    this.code = code;
    this.name = code;
  }
};

var ExtensionManagementError = class extends Error {
  constructor(message, code) {
    super(message);
    this.code = code;
    this.name = code;
  }
};

var IExtensionManagementService = createDecorator("extensionManagementService");

var DISABLED_EXTENSIONS_STORAGE_PATH = "extensionsIdentifiers/disabled";

var ENABLED_EXTENSIONS_STORAGE_PATH = "extensionsIdentifiers/enabled";

var IGlobalExtensionEnablementService = createDecorator("IGlobalExtensionEnablementService");

var IExtensionTipsService = createDecorator("IExtensionTipsService");

var IAllowedExtensionsService = createDecorator("IAllowedExtensionsService");

async function computeSize(location2, fileService) {
  let stat;
  try {
    stat = await fileService.resolve(location2);
  } catch (e) {
    if (e.fileOperationResult === 1 /* FILE_NOT_FOUND */) {
      return 0;
    }
    throw e;
  }
  if (stat.children) {
    const sizes = await Promise.all(stat.children.map((c) => computeSize(c.resource, fileService)));
    return sizes.reduce((r2, s) => r2 + s, 0);
  }
  return stat.size ?? 0;
}

var ExtensionsLocalizedLabel = localize2(2919, "Extensions");

var PreferencesLocalizedLabel = localize2(2936, "Preferences");

var AllowedExtensionsConfigKey = "extensions.allowed";

var VerifyExtensionSignatureConfigKey = "extensions.verifySignature";

var ExtensionRequestsTimeoutConfigKey = "extensions.requestTimeout";

Registry.as(Extensions4.Configuration).registerConfiguration({
  id: "extensions",
  order: 30,
  title: localize(2935, null),
  type: "object",
  properties: {
    [AllowedExtensionsConfigKey]: {
      // Note: Type is set only to object because to support policies generation during build time, where single type is expected.
      type: "object",
      markdownDescription: localize(2925, null),
      default: "*",
      defaultSnippets: [{
        body: {},
        description: localize(2930, null)
      }, {
        body: {
          "*": true
        },
        description: localize(2926, null)
      }],
      scope: 1 /* APPLICATION */,
      policy: {
        name: "AllowedExtensions",
        category: "Extensions" /* Extensions */,
        minimumVersion: "1.96",
        localization: {
          description: {
            key: "extensions.allowed.policy",
            value: localize(2931, null)
          }
        }
      },
      additionalProperties: false,
      patternProperties: {
        "([a-z0-9A-Z][a-z0-9-A-Z]*)\\.([a-z0-9A-Z][a-z0-9-A-Z]*)$": {
          anyOf: [
            {
              type: ["boolean", "string"],
              enum: [true, false, "stable"],
              description: localize(2923, null),
              enumDescriptions: [
                localize(2929, null),
                localize(2927, null),
                localize(2928, null)
              ]
            },
            {
              type: "array",
              items: {
                type: "string"
              },
              description: localize(2924, null)
            }
          ]
        },
        "([a-z0-9A-Z][a-z0-9-A-Z]*)$": {
          type: ["boolean", "string"],
          enum: [true, false, "stable"],
          description: localize(2918, null),
          enumDescriptions: [
            localize(2934, null),
            localize(2932, null),
            localize(2933, null)
          ]
        },
        "\\*": {
          type: "boolean",
          enum: [true, false],
          description: localize(2920, null),
          enumDescriptions: [
            localize(2922, null),
            localize(2921, null)
          ]
        }
      }
    }
  }
});

function shouldRequireRepositorySignatureFor(isPrivate, galleryManifest) {
  if (isPrivate) {
    return galleryManifest?.capabilities.signing?.allPrivateRepositorySigned === true;
  }
  return galleryManifest?.capabilities.signing?.allPublicRepositorySigned === true;
}
export { TargetPlatformToString, toTargetPlatform, getTargetPlatform, isNotWebExtensionInWebTargetPlatform, isTargetPlatformCompatible, isIExtensionIdentifier, computeSize, shouldRequireRepositorySignatureFor, EXTENSION_IDENTIFIER_PATTERN, EXTENSION_IDENTIFIER_REGEX, WEB_EXTENSION_TAG, EXTENSION_INSTALL_SKIP_WALKTHROUGH_CONTEXT, EXTENSION_INSTALL_SKIP_PUBLISHER_TRUST_CONTEXT, EXTENSION_INSTALL_SOURCE_CONTEXT, EXTENSION_INSTALL_DEP_PACK_CONTEXT, EXTENSION_INSTALL_CLIENT_TARGET_PLATFORM_CONTEXT, IExtensionGalleryService, ExtensionGalleryError, ExtensionManagementError, IExtensionManagementService, DISABLED_EXTENSIONS_STORAGE_PATH, ENABLED_EXTENSIONS_STORAGE_PATH, IGlobalExtensionEnablementService, IExtensionTipsService, IAllowedExtensionsService, ExtensionsLocalizedLabel, PreferencesLocalizedLabel, AllowedExtensionsConfigKey, VerifyExtensionSignatureConfigKey, ExtensionRequestsTimeoutConfigKey };
