// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/services/themes/browser/productIconThemeData.ts
import { localize } from "./module-0001.mjs";
import { basename } from "./module-0026.mjs";
import { ExtensionData, ThemeSettingDefaults } from "./module-0917.mjs";
import { isObject, isString } from "./module-0010.mjs";
import { IconFontDefinition, fontFormatRegex, fontIdRegex, fontStyleRegex, fontWeightRegex, getIconRegistry } from "./module-0479.mjs";
import { getNodeType, parse5 } from "./module-0885.mjs";
import { getParseErrorMessage } from "./module-0890.mjs";
import { dirname2, joinPath } from "./module-0034.mjs";
import { ThemeIcon } from "./module-0086.mjs";


// src/vs/workbench/services/themes/browser/productIconThemeData.ts
var DEFAULT_PRODUCT_ICON_THEME_ID = "";

var ProductIconThemeData = class _ProductIconThemeData {
  constructor(id2, label3, settingsId) {
    this.iconThemeDocument = { iconDefinitions: /* @__PURE__ */ new Map() };
    this.id = id2;
    this.label = label3;
    this.settingsId = settingsId;
    this.isLoaded = false;
  }
  static {
    this.STORAGE_KEY = "productIconThemeData";
  }
  getIcon(iconContribution) {
    return _resolveIconDefinition(iconContribution, this.iconThemeDocument);
  }
  ensureLoaded(fileService, logService) {
    return !this.isLoaded ? this.load(fileService, logService) : Promise.resolve(this.styleSheetContent);
  }
  reload(fileService, logService) {
    return this.load(fileService, logService);
  }
  async load(fileService, logService) {
    const location2 = this.location;
    if (!location2) {
      return Promise.resolve(this.styleSheetContent);
    }
    const warnings = [];
    this.iconThemeDocument = await _loadProductIconThemeDocument(fileService, location2, warnings);
    this.isLoaded = true;
    if (warnings.length) {
      logService.error(localize(23425, null, location2.toString(), warnings.join("\n")));
    }
    return this.styleSheetContent;
  }
  static fromExtensionTheme(iconTheme, iconThemeLocation, extensionData) {
    const id2 = extensionData.extensionId + "-" + iconTheme.id;
    const label3 = iconTheme.label || basename(iconTheme.path);
    const settingsId = iconTheme.id;
    const themeData = new _ProductIconThemeData(id2, label3, settingsId);
    themeData.description = iconTheme.description;
    themeData.location = iconThemeLocation;
    themeData.extensionData = extensionData;
    themeData.watch = iconTheme._watch;
    themeData.isLoaded = false;
    return themeData;
  }
  static createUnloadedTheme(id2) {
    const themeData = new _ProductIconThemeData(id2, "", "__" + id2);
    themeData.isLoaded = false;
    themeData.extensionData = void 0;
    themeData.watch = false;
    return themeData;
  }
  static {
    this._defaultProductIconTheme = null;
  }
  static get defaultTheme() {
    let themeData = _ProductIconThemeData._defaultProductIconTheme;
    if (!themeData) {
      themeData = _ProductIconThemeData._defaultProductIconTheme = new _ProductIconThemeData(DEFAULT_PRODUCT_ICON_THEME_ID, localize(23414, null), ThemeSettingDefaults.PRODUCT_ICON_THEME);
      themeData.isLoaded = true;
      themeData.extensionData = void 0;
      themeData.watch = false;
    }
    return themeData;
  }
  static fromStorageData(storageService) {
    const input = storageService.get(_ProductIconThemeData.STORAGE_KEY, 0 /* PROFILE */);
    if (!input) {
      return void 0;
    }
    try {
      const data = JSON.parse(input);
      const theme = new _ProductIconThemeData("", "", "");
      for (const key3 in data) {
        switch (key3) {
          case "id":
          case "label":
          case "description":
          case "settingsId":
          case "styleSheetContent":
          case "watch":
            theme[key3] = data[key3];
            break;
          case "location":
            break;
          case "extensionData":
            theme.extensionData = ExtensionData.fromJSONObject(data.extensionData);
            break;
        }
      }
      const { iconDefinitions, iconFontDefinitions } = data;
      if (Array.isArray(iconDefinitions) && isObject(iconFontDefinitions)) {
        const restoredIconDefinitions = /* @__PURE__ */ new Map();
        for (const entry of iconDefinitions) {
          const { id: id2, fontCharacter, fontId } = entry;
          if (isString(id2) && isString(fontCharacter)) {
            if (isString(fontId)) {
              const iconFontDefinition = IconFontDefinition.fromJSONObject(iconFontDefinitions[fontId]);
              if (iconFontDefinition) {
                restoredIconDefinitions.set(id2, { fontCharacter, font: { id: fontId, definition: iconFontDefinition } });
              }
            } else {
              restoredIconDefinitions.set(id2, { fontCharacter });
            }
          }
        }
        theme.iconThemeDocument = { iconDefinitions: restoredIconDefinitions };
      }
      return theme;
    } catch (e4) {
      return void 0;
    }
  }
  toStorage(storageService) {
    const iconDefinitions = [];
    const iconFontDefinitions = {};
    for (const entry of this.iconThemeDocument.iconDefinitions.entries()) {
      const font = entry[1].font;
      iconDefinitions.push({ id: entry[0], fontCharacter: entry[1].fontCharacter, fontId: font?.id });
      if (font && iconFontDefinitions[font.id] === void 0) {
        iconFontDefinitions[font.id] = IconFontDefinition.toJSONObject(font.definition);
      }
    }
    const data = JSON.stringify({
      id: this.id,
      label: this.label,
      description: this.description,
      settingsId: this.settingsId,
      styleSheetContent: this.styleSheetContent,
      watch: this.watch,
      extensionData: ExtensionData.toJSONObject(this.extensionData),
      iconDefinitions,
      iconFontDefinitions
    });
    storageService.store(_ProductIconThemeData.STORAGE_KEY, data, 0 /* PROFILE */, 1 /* MACHINE */);
  }
};

function _loadProductIconThemeDocument(fileService, location2, warnings) {
  return fileService.readExtensionResource(location2).then((content) => {
    const parseErrors = [];
    const contentValue = parse5(content, parseErrors);
    if (parseErrors.length > 0) {
      return Promise.reject(new Error(localize(23415, null, parseErrors.map((e4) => getParseErrorMessage(e4.error)).join(", "))));
    } else if (getNodeType(contentValue) !== "object") {
      return Promise.reject(new Error(localize(23422, null)));
    } else if (!contentValue.iconDefinitions || !Array.isArray(contentValue.fonts) || !contentValue.fonts.length) {
      return Promise.reject(new Error(localize(23423, null)));
    }
    const iconThemeDocumentLocationDirname = dirname2(location2);
    const sanitizedFonts = /* @__PURE__ */ new Map();
    for (const font of contentValue.fonts) {
      const fontId = font.id;
      if (isString(fontId) && fontId.match(fontIdRegex)) {
        let fontWeight = void 0;
        if (isString(font.weight) && font.weight.match(fontWeightRegex)) {
          fontWeight = font.weight;
        } else {
          warnings.push(localize(23419, null, font.id));
        }
        let fontStyle = void 0;
        if (isString(font.style) && font.style.match(fontStyleRegex)) {
          fontStyle = font.style;
        } else {
          warnings.push(localize(23418, null, font.id));
        }
        const sanitizedSrc = [];
        if (Array.isArray(font.src)) {
          for (const s of font.src) {
            if (isString(s.path) && isString(s.format) && s.format.match(fontFormatRegex)) {
              const iconFontLocation = joinPath(iconThemeDocumentLocationDirname, s.path);
              sanitizedSrc.push({ location: iconFontLocation, format: s.format });
            } else {
              warnings.push(localize(23417, null, font.id));
            }
          }
        }
        if (sanitizedSrc.length) {
          sanitizedFonts.set(fontId, { weight: fontWeight, style: fontStyle, src: sanitizedSrc });
        } else {
          warnings.push(localize(23424, null, font.id));
        }
      } else {
        warnings.push(localize(23416, null, font.id));
      }
    }
    const iconDefinitions = /* @__PURE__ */ new Map();
    const primaryFontId = contentValue.fonts[0].id;
    for (const iconId in contentValue.iconDefinitions) {
      const definition = contentValue.iconDefinitions[iconId];
      if (isString(definition.fontCharacter)) {
        const fontId = definition.fontId ?? primaryFontId;
        const fontDefinition = sanitizedFonts.get(fontId);
        if (fontDefinition) {
          const font = { id: `pi-${fontId}`, definition: fontDefinition };
          iconDefinitions.set(iconId, { fontCharacter: definition.fontCharacter, font });
        } else {
          warnings.push(localize(23420, null, iconId));
        }
      } else {
        warnings.push(localize(23421, null, iconId));
      }
    }
    return { iconDefinitions };
  });
}

var iconRegistry3 = getIconRegistry();

function _resolveIconDefinition(iconContribution, iconThemeDocument) {
  const iconDefinitions = iconThemeDocument.iconDefinitions;
  let definition = iconDefinitions.get(iconContribution.id);
  let defaults = iconContribution.defaults;
  while (!definition && ThemeIcon.isThemeIcon(defaults)) {
    const ic = iconRegistry3.getIcon(defaults.id);
    if (ic) {
      definition = iconDefinitions.get(ic.id);
      defaults = ic.defaults;
    } else {
      return void 0;
    }
  }
  if (definition) {
    return definition;
  }
  if (!ThemeIcon.isThemeIcon(defaults)) {
    return defaults;
  }
  return void 0;
}
export { _loadProductIconThemeDocument, _resolveIconDefinition, DEFAULT_PRODUCT_ICON_THEME_ID, ProductIconThemeData, iconRegistry3 };
