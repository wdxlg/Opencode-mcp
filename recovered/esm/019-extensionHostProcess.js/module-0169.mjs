// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/node/extensionHostProcess.js
// Original module marker: src/vs/platform/extensionManagement/common/extensionManagement.ts
import { createDecorator2 } from "./module-0048.mjs";
import { localize, localize2 } from "./module-0013.mjs";
import { Registry } from "./module-0097.mjs";
import { Extensions2 } from "./module-0141.mjs";


// src/vs/platform/extensionManagement/common/extensionManagement.ts
var EXTENSION_IDENTIFIER_PATTERN = "^([a-z0-9A-Z][a-z0-9-A-Z]*)\\.([a-z0-9A-Z][a-z0-9-A-Z]*)$";

var EXTENSION_IDENTIFIER_REGEX = new RegExp(EXTENSION_IDENTIFIER_PATTERN);

var IExtensionGalleryService = createDecorator2("extensionGalleryService");

var IExtensionManagementService = createDecorator2("extensionManagementService");

var IGlobalExtensionEnablementService = createDecorator2("IGlobalExtensionEnablementService");

var IExtensionTipsService = createDecorator2("IExtensionTipsService");

var IAllowedExtensionsService = createDecorator2("IAllowedExtensionsService");

var ExtensionsLocalizedLabel = localize2(2919, "Extensions");

var PreferencesLocalizedLabel = localize2(2936, "Preferences");

var AllowedExtensionsConfigKey = "extensions.allowed";

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
export { EXTENSION_IDENTIFIER_PATTERN, EXTENSION_IDENTIFIER_REGEX, IExtensionGalleryService, IExtensionManagementService, IGlobalExtensionEnablementService, IExtensionTipsService, IAllowedExtensionsService, ExtensionsLocalizedLabel, PreferencesLocalizedLabel, AllowedExtensionsConfigKey };
