// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/services/themes/common/colorExtensionPoint.ts
import { Registry } from "./module-0090.mjs";
import { Extensions6 } from "./module-0226.mjs";
import { ExtensionsRegistry } from "./module-0878.mjs";
import { localize } from "./module-0001.mjs";
import { Color } from "./module-0197.mjs";
import { Disposable } from "./module-0012.mjs";
import { MarkdownString } from "./module-0462.mjs";
import { Extensions11 } from "./module-0879.mjs";
import { SyncDescriptor } from "./module-0134.mjs";


// src/vs/workbench/services/themes/common/colorExtensionPoint.ts
var colorRegistry2 = Registry.as(Extensions6.ColorContribution);

var colorReferenceSchema = colorRegistry2.getColorReferenceSchema();

var colorIdPattern = "^\\w+[.\\w+]*$";

var configurationExtPoint2 = ExtensionsRegistry.registerExtensionPoint({
  extensionPoint: "colors",
  jsonSchema: {
    description: localize(23431, null),
    type: "array",
    items: {
      type: "object",
      properties: {
        id: {
          type: "string",
          description: localize(23433, null),
          pattern: colorIdPattern,
          patternErrorMessage: localize(23434, null)
        },
        description: {
          type: "string",
          description: localize(23432, null)
        },
        defaults: {
          type: "object",
          properties: {
            light: {
              description: localize(23438, null),
              type: "string",
              anyOf: [
                colorReferenceSchema,
                { type: "string", format: "color-hex" }
              ]
            },
            dark: {
              description: localize(23435, null),
              type: "string",
              anyOf: [
                colorReferenceSchema,
                { type: "string", format: "color-hex" }
              ]
            },
            highContrast: {
              description: localize(23436, null),
              type: "string",
              anyOf: [
                colorReferenceSchema,
                { type: "string", format: "color-hex" }
              ]
            },
            highContrastLight: {
              description: localize(23437, null),
              type: "string",
              anyOf: [
                colorReferenceSchema,
                { type: "string", format: "color-hex" }
              ]
            }
          },
          required: ["light", "dark"]
        }
      }
    }
  }
});

var ColorExtensionPoint = class {
  constructor() {
    configurationExtPoint2.setHandler((extensions, delta2) => {
      for (const extension of delta2.added) {
        const extensionValue = extension.value;
        const collector = extension.collector;
        if (!extensionValue || !Array.isArray(extensionValue)) {
          collector.error(localize(23444, null));
          return;
        }
        const parseColorValue = (s, name) => {
          if (s.length > 0) {
            if (s[0] === "#") {
              return Color.Format.CSS.parseHex(s);
            } else {
              return s;
            }
          }
          collector.error(localize(23445, null, name));
          return Color.red;
        };
        for (const colorContribution of extensionValue) {
          if (typeof colorContribution.id !== "string" || colorContribution.id.length === 0) {
            collector.error(localize(23450, null));
            return;
          }
          if (!colorContribution.id.match(colorIdPattern)) {
            collector.error(localize(23451, null));
            return;
          }
          if (typeof colorContribution.description !== "string" || colorContribution.id.length === 0) {
            collector.error(localize(23449, null));
            return;
          }
          const defaults = colorContribution.defaults;
          if (!defaults || typeof defaults !== "object" || typeof defaults.light !== "string" || typeof defaults.dark !== "string") {
            collector.error(localize(23446, null));
            return;
          }
          if (defaults.highContrast && typeof defaults.highContrast !== "string") {
            collector.error(localize(23447, null));
            return;
          }
          if (defaults.highContrastLight && typeof defaults.highContrastLight !== "string") {
            collector.error(localize(23448, null));
            return;
          }
          colorRegistry2.registerColor(colorContribution.id, {
            light: parseColorValue(defaults.light, "configuration.colors.defaults.light"),
            dark: parseColorValue(defaults.dark, "configuration.colors.defaults.dark"),
            hcDark: parseColorValue(defaults.highContrast ?? defaults.dark, "configuration.colors.defaults.highContrast"),
            hcLight: parseColorValue(defaults.highContrastLight ?? defaults.light, "configuration.colors.defaults.highContrastLight")
          }, colorContribution.description);
        }
      }
      for (const extension of delta2.removed) {
        const extensionValue = extension.value;
        for (const colorContribution of extensionValue) {
          colorRegistry2.deregisterColor(colorContribution.id);
        }
      }
    });
  }
};

var ColorDataRenderer = class extends Disposable {
  constructor() {
    super(...arguments);
    this.type = "table";
  }
  shouldRender(manifest) {
    return !!manifest.contributes?.colors;
  }
  render(manifest) {
    const colors = manifest.contributes?.colors || [];
    if (!colors.length) {
      return { data: { headers: [], rows: [] }, dispose: () => {
      } };
    }
    const headers = [
      localize(23443, null),
      localize(23442, null),
      localize(23439, null),
      localize(23441, null),
      localize(23440, null)
    ];
    const toColor = (colorReference) => colorReference[0] === "#" ? Color.fromHex(colorReference) : void 0;
    const rows = colors.sort((a, b) => a.id.localeCompare(b.id)).map((color2) => {
      return [
        new MarkdownString().appendMarkdown(`\`${color2.id}\``),
        color2.description,
        toColor(color2.defaults.dark) ?? new MarkdownString().appendMarkdown(`\`${color2.defaults.dark}\``),
        toColor(color2.defaults.light) ?? new MarkdownString().appendMarkdown(`\`${color2.defaults.light}\``),
        toColor(color2.defaults.highContrast) ?? new MarkdownString().appendMarkdown(`\`${color2.defaults.highContrast}\``)
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
  id: "colors",
  label: localize(23430, null),
  access: {
    canToggle: false
  },
  renderer: new SyncDescriptor(ColorDataRenderer)
});
export { colorRegistry2, colorReferenceSchema, colorIdPattern, configurationExtPoint2, ColorExtensionPoint, ColorDataRenderer };
