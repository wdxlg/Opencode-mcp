// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/services/themes/common/themeExtensionPoints.ts
import { ExtensionsRegistry } from "./module-0878.mjs";
import { localize } from "./module-0001.mjs";
import { Disposable } from "./module-0012.mjs";
import { MarkdownString } from "./module-0462.mjs";
import { Registry } from "./module-0090.mjs";
import { Extensions11 } from "./module-0879.mjs";
import { SyncDescriptor } from "./module-0134.mjs";
import { Emitter } from "./module-0017.mjs";
import { ExtensionData, migrateThemeSettingsId } from "./module-0917.mjs";
import { isString } from "./module-0010.mjs";
import { isEqualOrParent2, joinPath } from "./module-0034.mjs";


// src/vs/workbench/services/themes/common/themeExtensionPoints.ts
function registerColorThemeExtensionPoint() {
  return ExtensionsRegistry.registerExtensionPoint({
    extensionPoint: "themes",
    jsonSchema: {
      description: localize(23582, null),
      type: "array",
      items: {
        type: "object",
        defaultSnippets: [{ body: { label: "${1:label}", id: "${2:id}", uiTheme: "vs-dark" /* VS_DARK */, path: "./themes/${3:id}.tmTheme." } }],
        properties: {
          id: {
            description: localize(23583, null),
            type: "string"
          },
          label: {
            description: localize(23584, null),
            type: "string"
          },
          uiTheme: {
            markdownDescription: localize(23586, null),
            enum: ["vs" /* VS */, "vs-dark" /* VS_DARK */, "hc-black" /* HC_BLACK */, "hc-light" /* HC_LIGHT */]
          },
          path: {
            markdownDescription: localize(23585, null),
            type: "string"
          }
        },
        required: ["path", "uiTheme"]
      }
    }
  });
}

function registerFileIconThemeExtensionPoint() {
  return ExtensionsRegistry.registerExtensionPoint({
    extensionPoint: "iconThemes",
    jsonSchema: {
      description: localize(23574, null),
      type: "array",
      items: {
        type: "object",
        defaultSnippets: [{ body: { id: "${1:id}", label: "${2:label}", path: "./fileicons/${3:id}-icon-theme.json" } }],
        properties: {
          id: {
            description: localize(23575, null),
            type: "string"
          },
          label: {
            description: localize(23576, null),
            type: "string"
          },
          path: {
            description: localize(23577, null),
            type: "string"
          }
        },
        required: ["path", "id"]
      }
    }
  });
}

function registerProductIconThemeExtensionPoint() {
  return ExtensionsRegistry.registerExtensionPoint({
    extensionPoint: "productIconThemes",
    jsonSchema: {
      description: localize(23578, null),
      type: "array",
      items: {
        type: "object",
        defaultSnippets: [{ body: { id: "${1:id}", label: "${2:label}", path: "./producticons/${3:id}-product-icon-theme.json" } }],
        properties: {
          id: {
            description: localize(23579, null),
            type: "string"
          },
          label: {
            description: localize(23580, null),
            type: "string"
          },
          path: {
            description: localize(23581, null),
            type: "string"
          }
        },
        required: ["path", "id"]
      }
    }
  });
}

var ThemeDataRenderer = class extends Disposable {
  constructor() {
    super(...arguments);
    this.type = "markdown";
  }
  shouldRender(manifest) {
    return !!manifest.contributes?.themes || !!manifest.contributes?.iconThemes || !!manifest.contributes?.productIconThemes;
  }
  render(manifest) {
    const markdown = new MarkdownString();
    if (manifest.contributes?.themes) {
      markdown.appendMarkdown(`### ${localize(23566, null)}

`);
      for (const theme of manifest.contributes.themes) {
        markdown.appendMarkdown(`- ${theme.label}
`);
      }
    }
    if (manifest.contributes?.iconThemes) {
      markdown.appendMarkdown(`### ${localize(23567, null)}

`);
      for (const theme of manifest.contributes.iconThemes) {
        markdown.appendMarkdown(`- ${theme.label}
`);
      }
    }
    if (manifest.contributes?.productIconThemes) {
      markdown.appendMarkdown(`### ${localize(23569, null)}

`);
      for (const theme of manifest.contributes.productIconThemes) {
        markdown.appendMarkdown(`- ${theme.label}
`);
      }
    }
    return {
      data: markdown,
      dispose: () => {
      }
    };
  }
};

Registry.as(Extensions11.ExtensionFeaturesRegistry).registerExtensionFeature({
  id: "themes",
  label: localize(23573, null),
  access: {
    canToggle: false
  },
  renderer: new SyncDescriptor(ThemeDataRenderer)
});

var ThemeRegistry = class {
  constructor(themesExtPoint, create2, idRequired = false, builtInTheme = void 0) {
    this.themesExtPoint = themesExtPoint;
    this.create = create2;
    this.idRequired = idRequired;
    this.builtInTheme = builtInTheme;
    this.onDidChangeEmitter = new Emitter();
    this.onDidChange = this.onDidChangeEmitter.event;
    this.extensionThemes = [];
    this.initialize();
  }
  dispose() {
    this.themesExtPoint.setHandler(() => {
    });
    this.onDidChangeEmitter.dispose();
  }
  initialize() {
    this.themesExtPoint.setHandler((extensions, delta2) => {
      const previousIds = {};
      const added = [];
      for (const theme of this.extensionThemes) {
        previousIds[theme.id] = theme;
      }
      this.extensionThemes.length = 0;
      for (const ext of extensions) {
        const extensionData = ExtensionData.fromName(ext.description.publisher, ext.description.name, ext.description.isBuiltin);
        this.onThemes(extensionData, ext.description.extensionLocation, ext.value, this.extensionThemes, ext.collector);
      }
      for (const theme of this.extensionThemes) {
        if (!previousIds[theme.id]) {
          added.push(theme);
        } else {
          delete previousIds[theme.id];
        }
      }
      const removed = Object.values(previousIds);
      this.onDidChangeEmitter.fire({ themes: this.extensionThemes, added, removed });
    });
  }
  onThemes(extensionData, extensionLocation, themeContributions, resultingThemes = [], log4) {
    if (!Array.isArray(themeContributions)) {
      log4?.error(localize(
        23570,
        null,
        this.themesExtPoint.name
      ));
      return resultingThemes;
    }
    themeContributions.forEach((theme) => {
      if (!theme.path || !isString(theme.path)) {
        log4?.error(localize(
          23572,
          null,
          this.themesExtPoint.name,
          String(theme.path)
        ));
        return;
      }
      if (this.idRequired && (!theme.id || !isString(theme.id))) {
        log4?.error(localize(
          23571,
          null,
          this.themesExtPoint.name,
          String(theme.id)
        ));
        return;
      }
      const themeLocation = joinPath(extensionLocation, theme.path);
      if (!isEqualOrParent2(themeLocation, extensionLocation)) {
        log4?.warn(localize(23568, null, this.themesExtPoint.name, themeLocation.path, extensionLocation.path));
      }
      const themeData = this.create(theme, themeLocation, extensionData);
      resultingThemes.push(themeData);
    });
    return resultingThemes;
  }
  findThemeById(themeId) {
    if (this.builtInTheme && this.builtInTheme.id === themeId) {
      return this.builtInTheme;
    }
    const allThemes = this.getThemes();
    for (const t2 of allThemes) {
      if (t2.id === themeId) {
        return t2;
      }
    }
    return void 0;
  }
  findThemeBySettingsId(settingsId, defaultSettingsId) {
    const migratedId = settingsId ? migrateThemeSettingsId(settingsId) : settingsId;
    if (this.builtInTheme && this.builtInTheme.settingsId === migratedId) {
      return this.builtInTheme;
    }
    const allThemes = this.getThemes();
    let defaultTheme = void 0;
    for (const t2 of allThemes) {
      if (t2.settingsId === migratedId) {
        return t2;
      }
      if (t2.settingsId === defaultSettingsId) {
        defaultTheme = t2;
      }
    }
    return defaultTheme;
  }
  findThemeByExtensionLocation(extLocation) {
    if (extLocation) {
      return this.getThemes().filter((t2) => t2.location && isEqualOrParent2(t2.location, extLocation));
    }
    return [];
  }
  getThemes() {
    return this.extensionThemes;
  }
  getMarketplaceThemes(manifest, extensionLocation, extensionData) {
    const themes = manifest?.contributes?.[this.themesExtPoint.name];
    if (Array.isArray(themes)) {
      return this.onThemes(extensionData, extensionLocation, themes);
    }
    return [];
  }
};
export { registerColorThemeExtensionPoint, registerFileIconThemeExtensionPoint, registerProductIconThemeExtensionPoint, ThemeDataRenderer, ThemeRegistry };
