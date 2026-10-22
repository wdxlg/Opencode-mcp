// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/services/themes/common/iconExtensionPoint.ts
import { Registry } from "./module-0090.mjs";
import { Extensions9 } from "./module-0479.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { ExtensionsRegistry } from "./module-0878.mjs";
import { localize } from "./module-0001.mjs";
import { extname, posix } from "./module-0026.mjs";
import { isEqualOrParent2, joinPath } from "./module-0034.mjs";


// src/vs/workbench/services/themes/common/iconExtensionPoint.ts
var iconRegistry2 = Registry.as(Extensions9.IconContribution);

var iconReferenceSchema = iconRegistry2.getIconReferenceSchema();

var iconIdPattern = `^${ThemeIcon.iconNameSegment}(-${ThemeIcon.iconNameSegment})+$`;

var iconConfigurationExtPoint = ExtensionsRegistry.registerExtensionPoint({
  extensionPoint: "icons",
  jsonSchema: {
    description: localize(23520, null),
    type: "object",
    propertyNames: {
      pattern: iconIdPattern,
      description: localize(23518, null),
      patternErrorMessage: localize(23519, null)
    },
    additionalProperties: {
      type: "object",
      properties: {
        description: {
          type: "string",
          description: localize(23517, null)
        },
        default: {
          anyOf: [
            iconReferenceSchema,
            {
              type: "object",
              properties: {
                fontPath: {
                  description: localize(23516, null),
                  type: "string"
                },
                fontCharacter: {
                  description: localize(23515, null),
                  type: "string"
                }
              },
              required: ["fontPath", "fontCharacter"],
              defaultSnippets: [{ body: { fontPath: "${1:myiconfont.woff}", fontCharacter: "${2:\\\\E001}" } }]
            }
          ],
          description: localize(23514, null)
        }
      },
      required: ["description", "default"],
      defaultSnippets: [{ body: { description: "${1:my icon}", default: { fontPath: "${2:myiconfont.woff}", fontCharacter: "${3:\\\\E001}" } } }]
    },
    defaultSnippets: [{ body: { "${1:my-icon-id}": { description: "${2:my icon}", default: { fontPath: "${3:myiconfont.woff}", fontCharacter: "${4:\\\\E001}" } } } }]
  }
});

var IconExtensionPoint = class {
  constructor() {
    iconConfigurationExtPoint.setHandler((extensions, delta2) => {
      for (const extension of delta2.added) {
        const extensionValue = extension.value;
        const collector = extension.collector;
        if (!extensionValue || typeof extensionValue !== "object") {
          collector.error(localize(23521, null));
          return;
        }
        for (const id2 in extensionValue) {
          if (!id2.match(iconIdPattern)) {
            collector.error(localize(23526, null));
            return;
          }
          const iconContribution = extensionValue[id2];
          if (typeof iconContribution.description !== "string" || iconContribution.description.length === 0) {
            collector.error(localize(23525, null));
            return;
          }
          const defaultIcon = iconContribution.default;
          if (typeof defaultIcon === "string") {
            iconRegistry2.registerIcon(id2, { id: defaultIcon }, iconContribution.description);
          } else if (typeof defaultIcon === "object" && typeof defaultIcon.fontPath === "string" && typeof defaultIcon.fontCharacter === "string") {
            const fileExt = extname(defaultIcon.fontPath).substring(1);
            const format5 = formatMap[fileExt];
            if (!format5) {
              collector.warn(localize(23523, null, fileExt));
              return;
            }
            const extensionLocation = extension.description.extensionLocation;
            const iconFontLocation = joinPath(extensionLocation, defaultIcon.fontPath);
            const fontId = getFontId(extension.description, defaultIcon.fontPath);
            const definition = iconRegistry2.registerIconFont(fontId, { src: [{ location: iconFontLocation, format: format5 }] });
            if (!isEqualOrParent2(iconFontLocation, extensionLocation)) {
              collector.warn(localize(23524, null, iconFontLocation.path, extensionLocation.path));
              return;
            }
            iconRegistry2.registerIcon(id2, {
              fontCharacter: defaultIcon.fontCharacter,
              font: {
                id: fontId,
                definition
              }
            }, iconContribution.description);
          } else {
            collector.error(localize(23522, null));
          }
        }
      }
      for (const extension of delta2.removed) {
        const extensionValue = extension.value;
        for (const id2 in extensionValue) {
          iconRegistry2.deregisterIcon(id2);
        }
      }
    });
  }
};

var formatMap = {
  "ttf": "truetype",
  "woff": "woff",
  "woff2": "woff2"
};

function getFontId(description, fontPath) {
  return posix.join(description.identifier.value, fontPath);
}
export { getFontId, iconRegistry2, iconReferenceSchema, iconIdPattern, iconConfigurationExtPoint, IconExtensionPoint, formatMap };
