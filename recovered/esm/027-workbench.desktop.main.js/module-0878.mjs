// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/api/common/jsonValidationExtensionPoint.ts
import { ExtensionsRegistry } from "./module-0876.mjs";
import { localize } from "./module-0001.mjs";
import { isString } from "./module-0010.mjs";
import { isEqualOrParent2, joinPath } from "./module-0034.mjs";
import { Disposable } from "./module-0012.mjs";
import { MarkdownString } from "./module-0462.mjs";
import { Registry } from "./module-0090.mjs";
import { Extensions11 } from "./module-0877.mjs";
import { SyncDescriptor } from "./module-0134.mjs";


// src/vs/workbench/api/common/jsonValidationExtensionPoint.ts
var configurationExtPoint = ExtensionsRegistry.registerExtensionPoint({
  extensionPoint: "jsonValidation",
  defaultExtensionKind: ["workspace", "web"],
  jsonSchema: {
    description: localize(5895, null),
    type: "array",
    defaultSnippets: [{ body: [{ fileMatch: "${1:file.json}", url: "${2:url}" }] }],
    items: {
      type: "object",
      defaultSnippets: [{ body: { fileMatch: "${1:file.json}", url: "${2:url}" } }],
      properties: {
        fileMatch: {
          type: ["string", "array"],
          description: localize(5896, null),
          items: {
            type: ["string"]
          }
        },
        url: {
          description: localize(5897, null),
          type: "string"
        }
      }
    }
  }
});

var registryExtPoint = ExtensionsRegistry.registerExtensionPoint({
  extensionPoint: "jsonValidationRegistry",
  defaultExtensionKind: ["workspace", "web"],
  jsonSchema: {
    description: localize(5898, null),
    type: "array",
    defaultSnippets: [{ body: [{ url: "${1:url}" }] }],
    items: {
      type: "object",
      defaultSnippets: [{ body: { url: "${1:url}" } }],
      properties: {
        url: {
          description: localize(5899, null),
          type: "string"
        }
      }
    }
  }
});

var JSONValidationExtensionPoint = class {
  constructor() {
    configurationExtPoint.setHandler((extensions) => {
      for (const extension of extensions) {
        const extensionValue = extension.value;
        const collector = extension.collector;
        const extensionLocation = extension.description.extensionLocation;
        if (!extensionValue || !Array.isArray(extensionValue)) {
          collector.error(localize(5902, null));
          return;
        }
        extensionValue.forEach((extension2) => {
          if (!isString(extension2.fileMatch) && !(Array.isArray(extension2.fileMatch) && extension2.fileMatch.every(isString))) {
            collector.error(localize(5901, null));
            return;
          }
          const uri5 = extension2.url;
          if (!isString(uri5)) {
            collector.error(localize(5909, null));
            return;
          }
          if (uri5.startsWith("./")) {
            try {
              const colorThemeLocation = joinPath(extensionLocation, uri5);
              if (!isEqualOrParent2(colorThemeLocation, extensionLocation)) {
                collector.warn(localize(5908, null, configurationExtPoint.name, colorThemeLocation.toString(), extensionLocation.path));
              }
            } catch (e) {
              collector.error(localize(5910, null, e.message));
            }
          } else if (!/^[^:/?#]+:\/\//.test(uri5)) {
            collector.error(localize(5911, null));
            return;
          }
        });
      }
    });
    registryExtPoint.setHandler((extensions) => {
      for (const extension of extensions) {
        const catalogs = extension.value;
        const collector = extension.collector;
        const extensionLocation = extension.description.extensionLocation;
        if (!Array.isArray(catalogs)) {
          collector.error(localize(5903, null));
          continue;
        }
        for (const catalog of catalogs) {
          const uri5 = catalog?.url;
          if (!isString(uri5)) {
            collector.error(localize(5907, null));
            continue;
          }
          if (uri5.startsWith("./")) {
            try {
              const catalogLocation = joinPath(extensionLocation, uri5);
              if (!isEqualOrParent2(catalogLocation, extensionLocation)) {
                collector.warn(localize(5905, null, registryExtPoint.name, catalogLocation.toString(), extensionLocation.path));
              }
            } catch (e) {
              collector.error(localize(5904, null, e.message));
            }
          } else if (!/^[^:/?#]+:\/\//.test(uri5)) {
            collector.error(localize(5906, null));
          }
        }
      }
    });
  }
};

var JSONValidationDataRenderer = class extends Disposable {
  constructor() {
    super(...arguments);
    this.type = "table";
  }
  shouldRender(manifest) {
    return !!manifest.contributes?.jsonValidation;
  }
  render(manifest) {
    const contrib = manifest.contributes?.jsonValidation || [];
    if (!contrib.length) {
      return { data: { headers: [], rows: [] }, dispose: () => {
      } };
    }
    const headers = [
      localize(5900, null),
      localize(5913, null)
    ];
    const rows = contrib.map((v2) => {
      return [
        new MarkdownString().appendMarkdown(`\`${Array.isArray(v2.fileMatch) ? v2.fileMatch.join(", ") : v2.fileMatch}\``),
        v2.url
      ];
    });
    return {
      data: {
        headers,
        rows
      },
      dispose: () => {
      }
    };
  }
};

Registry.as(Extensions11.ExtensionFeaturesRegistry).registerExtensionFeature({
  id: "jsonValidation",
  label: localize(5912, null),
  access: {
    canToggle: false
  },
  renderer: new SyncDescriptor(JSONValidationDataRenderer)
});
export { configurationExtPoint, registryExtPoint, JSONValidationExtensionPoint, JSONValidationDataRenderer };
