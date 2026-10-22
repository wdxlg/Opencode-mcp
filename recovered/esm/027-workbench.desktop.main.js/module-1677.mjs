// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/services/themes/browser/fileIconThemeData.ts
import { basename } from "./module-0026.mjs";
import { ExtensionData } from "./module-0916.mjs";
import { getNodeType, parse5 } from "./module-0883.mjs";
import { localize } from "./module-0001.mjs";
import { getParseErrorMessage } from "./module-0888.mjs";
import { dirname2, joinPath } from "./module-0034.mjs";
import { Builder, asCSSUrl, className, hexColorValue, identValue, inline, sizeValue, stringValue } from "./module-0449.mjs";
import { fontColorRegex, fontSizeRegex } from "./module-0479.mjs";
import { fileIconSelectorEscape } from "./module-0755.mjs";


// src/vs/workbench/services/themes/browser/fileIconThemeData.ts
var FileIconThemeData = class _FileIconThemeData {
  static {
    this.STORAGE_KEY = "iconThemeData";
  }
  constructor(id2, label3, settingsId) {
    this.id = id2;
    this.label = label3;
    this.settingsId = settingsId;
    this.isLoaded = false;
    this.hasFileIcons = false;
    this.hasFolderIcons = false;
    this.hidesExplorerArrows = false;
  }
  ensureLoaded(themeLoader) {
    return !this.isLoaded ? this.load(themeLoader) : Promise.resolve(this.styleSheetContent);
  }
  reload(themeLoader) {
    return this.load(themeLoader);
  }
  load(themeLoader) {
    return themeLoader.load(this);
  }
  static fromExtensionTheme(iconTheme, iconThemeLocation, extensionData) {
    const id2 = extensionData.extensionId + "-" + iconTheme.id;
    const label3 = iconTheme.label || basename(iconTheme.path);
    const settingsId = iconTheme.id;
    const themeData = new _FileIconThemeData(id2, label3, settingsId);
    themeData.description = iconTheme.description;
    themeData.location = iconThemeLocation;
    themeData.extensionData = extensionData;
    themeData.watch = iconTheme._watch;
    themeData.isLoaded = false;
    return themeData;
  }
  static {
    this._noIconTheme = null;
  }
  static get noIconTheme() {
    let themeData = _FileIconThemeData._noIconTheme;
    if (!themeData) {
      themeData = _FileIconThemeData._noIconTheme = new _FileIconThemeData("", "", null);
      themeData.hasFileIcons = false;
      themeData.hasFolderIcons = false;
      themeData.hidesExplorerArrows = false;
      themeData.isLoaded = true;
      themeData.extensionData = void 0;
      themeData.watch = false;
    }
    return themeData;
  }
  static createUnloadedTheme(id2) {
    const themeData = new _FileIconThemeData(id2, "", "__" + id2);
    themeData.isLoaded = false;
    themeData.hasFileIcons = false;
    themeData.hasFolderIcons = false;
    themeData.hidesExplorerArrows = false;
    themeData.extensionData = void 0;
    themeData.watch = false;
    return themeData;
  }
  static fromStorageData(storageService) {
    const input = storageService.get(_FileIconThemeData.STORAGE_KEY, 0 /* PROFILE */);
    if (!input) {
      return void 0;
    }
    try {
      const data = JSON.parse(input);
      const theme = new _FileIconThemeData("", "", null);
      for (const key3 in data) {
        switch (key3) {
          case "id":
          case "label":
          case "description":
          case "settingsId":
          case "styleSheetContent":
          case "hasFileIcons":
          case "hidesExplorerArrows":
          case "hasFolderIcons":
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
      return theme;
    } catch (e) {
      return void 0;
    }
  }
  toStorage(storageService) {
    const data = JSON.stringify({
      id: this.id,
      label: this.label,
      description: this.description,
      settingsId: this.settingsId,
      styleSheetContent: this.styleSheetContent,
      hasFileIcons: this.hasFileIcons,
      hasFolderIcons: this.hasFolderIcons,
      hidesExplorerArrows: this.hidesExplorerArrows,
      extensionData: ExtensionData.toJSONObject(this.extensionData),
      watch: this.watch
    });
    storageService.store(_FileIconThemeData.STORAGE_KEY, data, 0 /* PROFILE */, 1 /* MACHINE */);
  }
};

var FileIconThemeLoader = class {
  constructor(fileService, languageService) {
    this.fileService = fileService;
    this.languageService = languageService;
  }
  load(data) {
    if (!data.location) {
      return Promise.resolve(data.styleSheetContent);
    }
    return this.loadIconThemeDocument(data.location).then((iconThemeDocument) => {
      const result = this.processIconThemeDocument(data.id, data.location, iconThemeDocument);
      data.styleSheetContent = result.content;
      data.hasFileIcons = result.hasFileIcons;
      data.hasFolderIcons = result.hasFolderIcons;
      data.hidesExplorerArrows = result.hidesExplorerArrows;
      data.isLoaded = true;
      return data.styleSheetContent;
    });
  }
  loadIconThemeDocument(location2) {
    return this.fileService.readExtensionResource(location2).then((content2) => {
      const errors = [];
      const contentValue = parse5(content2, errors);
      if (errors.length > 0) {
        return Promise.reject(new Error(localize(23412, null, errors.map((e) => getParseErrorMessage(e.error)).join(", "))));
      } else if (getNodeType(contentValue) !== "object") {
        return Promise.reject(new Error(localize(23413, null)));
      }
      return Promise.resolve(contentValue);
    });
  }
  processIconThemeDocument(id2, iconThemeDocumentLocation, iconThemeDocument) {
    const result = { content: "", hasFileIcons: false, hasFolderIcons: false, hidesExplorerArrows: !!iconThemeDocument.hidesExplorerArrows };
    let hasSpecificFileIcons = false;
    if (!iconThemeDocument.iconDefinitions) {
      return result;
    }
    const selectorByDefinitionId = {};
    const coveredLanguages = {};
    const iconThemeDocumentLocationDirname = dirname2(iconThemeDocumentLocation);
    function resolvePath2(path) {
      return joinPath(iconThemeDocumentLocationDirname, path);
    }
    function collectSelectors(associations, baseThemeClassName) {
      function addSelector(selector, defId) {
        if (defId) {
          let list2 = selectorByDefinitionId[defId];
          if (!list2) {
            list2 = selectorByDefinitionId[defId] = new Builder();
          }
          list2.push(selector);
        }
      }
      if (associations) {
        let qualifier = inline`.show-file-icons`;
        if (baseThemeClassName) {
          qualifier = inline`${baseThemeClassName} ${qualifier}`;
        }
        const expanded2 = inline`.monaco-tl-twistie.collapsible:not(.collapsed) + .monaco-tl-contents`;
        if (associations.folder) {
          addSelector(inline`${qualifier} .folder-icon::before`, associations.folder);
          result.hasFolderIcons = true;
        }
        if (associations.folderExpanded) {
          addSelector(inline`${qualifier} ${expanded2} .folder-icon::before`, associations.folderExpanded);
          result.hasFolderIcons = true;
        }
        const rootFolder = associations.rootFolder || associations.folder;
        const rootFolderExpanded = associations.rootFolderExpanded || associations.folderExpanded;
        if (rootFolder) {
          addSelector(inline`${qualifier} .rootfolder-icon::before`, rootFolder);
          result.hasFolderIcons = true;
        }
        if (rootFolderExpanded) {
          addSelector(inline`${qualifier} ${expanded2} .rootfolder-icon::before`, rootFolderExpanded);
          result.hasFolderIcons = true;
        }
        if (associations.file) {
          addSelector(inline`${qualifier} .file-icon::before`, associations.file);
          result.hasFileIcons = true;
        }
        const folderNames = associations.folderNames;
        if (folderNames) {
          for (const key3 in folderNames) {
            const selectors = new Builder();
            const name = handleParentFolder(key3.toLowerCase(), selectors);
            selectors.push(inline`.${classSelectorPart(name)}-name-folder-icon`);
            addSelector(inline`${qualifier} ${selectors.join("")}.folder-icon::before`, folderNames[key3]);
            result.hasFolderIcons = true;
          }
        }
        const folderNamesExpanded = associations.folderNamesExpanded;
        if (folderNamesExpanded) {
          for (const key3 in folderNamesExpanded) {
            const selectors = new Builder();
            const name = handleParentFolder(key3.toLowerCase(), selectors);
            selectors.push(inline`.${classSelectorPart(name)}-name-folder-icon`);
            addSelector(inline`${qualifier} ${expanded2} ${selectors.join("")}.folder-icon::before`, folderNamesExpanded[key3]);
            result.hasFolderIcons = true;
          }
        }
        const rootFolderNames = associations.rootFolderNames;
        if (rootFolderNames) {
          for (const key3 in rootFolderNames) {
            const name = key3.toLowerCase();
            addSelector(inline`${qualifier} .${classSelectorPart(name)}-root-name-folder-icon.rootfolder-icon::before`, rootFolderNames[key3]);
            result.hasFolderIcons = true;
          }
        }
        const rootFolderNamesExpanded = associations.rootFolderNamesExpanded;
        if (rootFolderNamesExpanded) {
          for (const key3 in rootFolderNamesExpanded) {
            const name = key3.toLowerCase();
            addSelector(inline`${qualifier} ${expanded2} .${classSelectorPart(name)}-root-name-folder-icon.rootfolder-icon::before`, rootFolderNamesExpanded[key3]);
            result.hasFolderIcons = true;
          }
        }
        const languageIds = associations.languageIds;
        if (languageIds) {
          if (!languageIds.jsonc && languageIds.json) {
            languageIds.jsonc = languageIds.json;
          }
          for (const languageId in languageIds) {
            addSelector(inline`${qualifier} .${classSelectorPart(languageId)}-lang-file-icon.file-icon::before`, languageIds[languageId]);
            result.hasFileIcons = true;
            hasSpecificFileIcons = true;
            coveredLanguages[languageId] = true;
          }
        }
        const fileExtensions = associations.fileExtensions;
        if (fileExtensions) {
          for (const key3 in fileExtensions) {
            const selectors = new Builder();
            const name = handleParentFolder(key3.toLowerCase(), selectors);
            const segments = name.split(".");
            if (segments.length) {
              for (let i2 = 0; i2 < segments.length; i2++) {
                selectors.push(inline`.${classSelectorPart(segments.slice(i2).join("."))}-ext-file-icon`);
              }
              selectors.push(inline`.ext-file-icon`);
            }
            addSelector(inline`${qualifier} ${selectors.join("")}.file-icon::before`, fileExtensions[key3]);
            result.hasFileIcons = true;
            hasSpecificFileIcons = true;
          }
        }
        const fileNames = associations.fileNames;
        if (fileNames) {
          for (const key3 in fileNames) {
            const selectors = new Builder();
            const fileName = handleParentFolder(key3.toLowerCase(), selectors);
            selectors.push(inline`.${classSelectorPart(fileName)}-name-file-icon`);
            selectors.push(inline`.name-file-icon`);
            const segments = fileName.split(".");
            if (segments.length) {
              for (let i2 = 1; i2 < segments.length; i2++) {
                selectors.push(inline`.${classSelectorPart(segments.slice(i2).join("."))}-ext-file-icon`);
              }
              selectors.push(inline`.ext-file-icon`);
            }
            addSelector(inline`${qualifier} ${selectors.join("")}.file-icon::before`, fileNames[key3]);
            result.hasFileIcons = true;
            hasSpecificFileIcons = true;
          }
        }
      }
    }
    collectSelectors(iconThemeDocument);
    collectSelectors(iconThemeDocument.light, inline`.vs`);
    collectSelectors(iconThemeDocument.highContrast, inline`.hc-black`);
    collectSelectors(iconThemeDocument.highContrast, inline`.hc-light`);
    if (!result.hasFileIcons && !result.hasFolderIcons) {
      return result;
    }
    const showLanguageModeIcons = iconThemeDocument.showLanguageModeIcons === true || hasSpecificFileIcons && iconThemeDocument.showLanguageModeIcons !== false;
    const cssRules = new Builder();
    const fonts = iconThemeDocument.fonts;
    const fontSizes = /* @__PURE__ */ new Map();
    if (Array.isArray(fonts)) {
      const defaultFontSize = this.tryNormalizeFontSize(fonts[0].size) || "150%";
      fonts.forEach((font) => {
        const fontSrcs = new Builder();
        fontSrcs.push(...font.src.map((l) => inline`${asCSSUrl(resolvePath2(l.path))} format(${stringValue(l.format)})`));
        cssRules.push(inline`@font-face { src: ${fontSrcs.join(", ")}; font-family: ${stringValue(font.id)}; font-weight: ${identValue(font.weight)}; font-style: ${identValue(font.style)}; font-display: block; }`);
        const fontSize = this.tryNormalizeFontSize(font.size);
        if (fontSize !== void 0 && fontSize !== defaultFontSize) {
          fontSizes.set(font.id, fontSize);
        }
      });
      cssRules.push(inline`.show-file-icons .file-icon::before, .show-file-icons .folder-icon::before, .show-file-icons .rootfolder-icon::before { font-family: ${stringValue(fonts[0].id)}; font-size: ${sizeValue(defaultFontSize)}; }`);
    }
    const emQuad = stringValue("\\2001");
    const imageIconStyle = (iconPath) => iconThemeDocument.usesCurrentColor ? inline`background-color: currentColor; background-image: none; mask: ${iconPath} no-repeat var(--file-icon-mask-position, left center); mask-size: var(--file-icon-mask-size, 16px); -webkit-mask: ${iconPath} no-repeat var(--file-icon-mask-position, left center); -webkit-mask-size: var(--file-icon-mask-size, 16px);` : inline`background-image: ${iconPath};`;
    for (const defId in selectorByDefinitionId) {
      const selectors = selectorByDefinitionId[defId];
      const definition = iconThemeDocument.iconDefinitions[defId];
      if (definition) {
        if (definition.iconPath) {
          const iconPath = asCSSUrl(resolvePath2(definition.iconPath));
          cssRules.push(inline`${selectors.join(", ")} { content: ${emQuad}; ${imageIconStyle(iconPath)} }`);
        } else if (definition.fontCharacter || definition.fontColor) {
          const body = new Builder();
          if (definition.fontColor && definition.fontColor.match(fontColorRegex)) {
            body.push(inline`color: ${hexColorValue(definition.fontColor)};`);
          }
          if (definition.fontCharacter) {
            body.push(inline`content: ${stringValue(definition.fontCharacter)};`);
          }
          const fontSize = definition.fontSize ?? (definition.fontId ? fontSizes.get(definition.fontId) : void 0);
          if (fontSize && fontSize.match(fontSizeRegex)) {
            body.push(inline`font-size: ${sizeValue(fontSize)};`);
          }
          if (definition.fontId) {
            body.push(inline`font-family: ${stringValue(definition.fontId)};`);
          }
          if (showLanguageModeIcons) {
            body.push(inline`background-image: unset;`);
          }
          cssRules.push(inline`${selectors.join(", ")} { ${body.join(" ")} }`);
        }
      }
    }
    if (showLanguageModeIcons) {
      for (const languageId of this.languageService.getRegisteredLanguageIds()) {
        if (!coveredLanguages[languageId]) {
          const icon2 = this.languageService.getIcon(languageId);
          if (icon2) {
            const selector = inline`.show-file-icons .${classSelectorPart(languageId)}-lang-file-icon.file-icon::before`;
            cssRules.push(inline`${selector} { content: ${emQuad}; ${imageIconStyle(asCSSUrl(icon2.dark))} }`);
            cssRules.push(inline`.vs ${selector} { content: ${emQuad}; ${imageIconStyle(asCSSUrl(icon2.light))} }`);
          }
        }
      }
    }
    result.content = cssRules.join("\n");
    return result;
  }
  /**
   * Try converting absolute font sizes to relative values.
   *
   * This allows them to be scaled nicely depending on where they are used.
   */
  tryNormalizeFontSize(size3) {
    if (!size3) {
      return void 0;
    }
    const defaultFontSizeInPx = 13;
    if (size3.endsWith("px")) {
      const value2 = parseInt(size3, 10);
      if (!isNaN(value2)) {
        return Math.round(value2 / defaultFontSizeInPx * 100) + "%";
      }
    }
    return size3;
  }
};

function handleParentFolder(key3, selectors) {
  const lastIndexOfSlash = key3.lastIndexOf("/");
  if (lastIndexOfSlash >= 0) {
    const parentFolder = key3.substring(0, lastIndexOfSlash);
    selectors.push(inline`.${classSelectorPart(parentFolder)}-name-dir-icon`);
    return key3.substring(lastIndexOfSlash + 1);
  }
  return key3;
}

function classSelectorPart(str) {
  str = fileIconSelectorEscape(str);
  return className(str, true);
}
export { handleParentFolder, classSelectorPart, FileIconThemeData, FileIconThemeLoader };
