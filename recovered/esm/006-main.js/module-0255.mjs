// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/main.js
// Original module marker: src/vs/platform/extensionManagement/common/extensionManagement.ts
import { __esm } from "./module-0000.mjs";
import { init_platform } from "./module-0006.mjs";
import { init_policy } from "./module-0038.mjs";
import { init_nls, localize, localize2 } from "./module-0005.mjs";
import { Extensions2, init_configurationRegistry } from "./module-0045.mjs";
import { init_extensions } from "./module-0254.mjs";
import { init_files } from "./module-0072.mjs";
import { createDecorator, init_instantiation } from "./module-0039.mjs";
import { Registry, init_platform2 } from "./module-0042.mjs";


// src/vs/platform/extensionManagement/common/extensionManagement.ts
function getTargetPlatform(platform5, arch5) {
  switch (platform5) {
    case 3 /* Windows */:
      if (arch5 === "x64") {
        return "win32-x64" /* WIN32_X64 */;
      }
      if (arch5 === "arm64") {
        return "win32-arm64" /* WIN32_ARM64 */;
      }
      return "unknown" /* UNKNOWN */;
    case 2 /* Linux */:
      if (arch5 === "x64") {
        return "linux-x64" /* LINUX_X64 */;
      }
      if (arch5 === "arm64") {
        return "linux-arm64" /* LINUX_ARM64 */;
      }
      if (arch5 === "arm") {
        return "linux-armhf" /* LINUX_ARMHF */;
      }
      return "unknown" /* UNKNOWN */;
    case "alpine":
      if (arch5 === "x64") {
        return "alpine-x64" /* ALPINE_X64 */;
      }
      if (arch5 === "arm64") {
        return "alpine-arm64" /* ALPINE_ARM64 */;
      }
      return "unknown" /* UNKNOWN */;
    case 1 /* Mac */:
      if (arch5 === "x64") {
        return "darwin-x64" /* DARWIN_X64 */;
      }
      if (arch5 === "arm64") {
        return "darwin-arm64" /* DARWIN_ARM64 */;
      }
      return "unknown" /* UNKNOWN */;
    case 0 /* Web */:
      return "web" /* WEB */;
  }
}

function isIExtensionIdentifier(obj) {
  const thing = obj;
  return !!thing && typeof thing === "object" && typeof thing.id === "string" && (!thing.uuid || typeof thing.uuid === "string");
}

var EXTENSION_IDENTIFIER_PATTERN, EXTENSION_IDENTIFIER_REGEX, IExtensionGalleryService, IExtensionManagementService, IGlobalExtensionEnablementService, IExtensionTipsService, IAllowedExtensionsService, ExtensionsLocalizedLabel, PreferencesLocalizedLabel, AllowedExtensionsConfigKey;

var init_extensionManagement = __esm({
  "src/vs/platform/extensionManagement/common/extensionManagement.ts"() {
    init_platform();
    init_policy();
    init_nls();
    init_configurationRegistry();
    init_extensions();
    init_files();
    init_instantiation();
    init_platform2();
    EXTENSION_IDENTIFIER_PATTERN = "^([a-z0-9A-Z][a-z0-9-A-Z]*)\\.([a-z0-9A-Z][a-z0-9-A-Z]*)$";
    EXTENSION_IDENTIFIER_REGEX = new RegExp(EXTENSION_IDENTIFIER_PATTERN);
    IExtensionGalleryService = createDecorator("extensionGalleryService");
    IExtensionManagementService = createDecorator("extensionManagementService");
    IGlobalExtensionEnablementService = createDecorator("IGlobalExtensionEnablementService");
    IExtensionTipsService = createDecorator("IExtensionTipsService");
    IAllowedExtensionsService = createDecorator("IAllowedExtensionsService");
    ExtensionsLocalizedLabel = localize2(2919, "Extensions");
    PreferencesLocalizedLabel = localize2(2936, "Preferences");
    AllowedExtensionsConfigKey = "extensions.allowed";
    Registry.as(Extensions2.Configuration).registerConfiguration({
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
  }
});
export { getTargetPlatform, isIExtensionIdentifier, EXTENSION_IDENTIFIER_PATTERN, EXTENSION_IDENTIFIER_REGEX, IExtensionGalleryService, IExtensionManagementService, IGlobalExtensionEnablementService, IExtensionTipsService, IAllowedExtensionsService, ExtensionsLocalizedLabel, PreferencesLocalizedLabel, AllowedExtensionsConfigKey, init_extensionManagement };
