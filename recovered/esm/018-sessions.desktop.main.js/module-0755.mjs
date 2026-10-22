// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/common/services/getIconClasses.ts
import { ThemeIcon } from "./module-0086.mjs";
import { URI } from "./module-0032.mjs";
import { Schemas } from "./module-0033.mjs";
import { DataUri } from "./module-0034.mjs";
import { PLAINTEXT_LANGUAGE_ID } from "./module-0141.mjs";


// src/vs/editor/common/services/getIconClasses.ts
var fileIconDirectoryRegex = /(?:\/|^)(?:([^\/]+)\/)?([^\/]+)$/;

function getIconClasses(modelService, languageService, resource, fileKind, icon2) {
  if (ThemeIcon.isThemeIcon(icon2)) {
    return [`codicon-${icon2.id}`, "predefined-file-icon"];
  }
  if (URI.isUri(icon2)) {
    return [];
  }
  const classes2 = fileKind === 2 /* ROOT_FOLDER */ ? ["rootfolder-icon"] : fileKind === 1 /* FOLDER */ ? ["folder-icon"] : ["file-icon"];
  if (resource) {
    let name;
    if (resource.scheme === Schemas.data) {
      const metadata = DataUri.parseMetaData(resource);
      name = metadata.get(DataUri.META_DATA_LABEL);
    } else {
      const match2 = resource.path.match(fileIconDirectoryRegex);
      if (match2) {
        name = fileIconSelectorEscape(match2[2].toLowerCase());
        if (match2[1]) {
          classes2.push(`${fileIconSelectorEscape(match2[1].toLowerCase())}-name-dir-icon`);
        }
      } else {
        name = fileIconSelectorEscape(resource.authority.toLowerCase());
      }
    }
    if (fileKind === 2 /* ROOT_FOLDER */) {
      classes2.push(`${name}-root-name-folder-icon`);
    } else if (fileKind === 1 /* FOLDER */) {
      classes2.push(`${name}-name-folder-icon`);
    } else {
      if (name) {
        classes2.push(`${name}-name-file-icon`);
        classes2.push(`name-file-icon`);
        if (name.length <= 255) {
          const dotSegments = name.split(".");
          for (let i2 = 1; i2 < dotSegments.length; i2++) {
            classes2.push(`${dotSegments.slice(i2).join(".")}-ext-file-icon`);
          }
        }
        classes2.push(`ext-file-icon`);
      }
      const detectedLanguageId = detectLanguageId(modelService, languageService, resource);
      if (detectedLanguageId) {
        classes2.push(`${fileIconSelectorEscape(detectedLanguageId)}-lang-file-icon`);
      }
    }
  }
  return classes2;
}

function getIconClassesForLanguageId(languageId) {
  return ["file-icon", `${fileIconSelectorEscape(languageId)}-lang-file-icon`];
}

function detectLanguageId(modelService, languageService, resource) {
  if (!resource) {
    return null;
  }
  let languageId = null;
  if (resource.scheme === Schemas.data) {
    const metadata = DataUri.parseMetaData(resource);
    const mime = metadata.get(DataUri.META_DATA_MIME);
    if (mime) {
      languageId = languageService.getLanguageIdByMimeType(mime);
    }
  } else {
    const model = modelService.getModel(resource);
    if (model) {
      languageId = model.getLanguageId();
    }
  }
  if (languageId && languageId !== PLAINTEXT_LANGUAGE_ID) {
    return languageId;
  }
  return languageService.guessLanguageIdByFilepathOrFirstLine(resource);
}

function fileIconSelectorEscape(str) {
  return str.replace(/[\s]/g, "/");
}
export { getIconClasses, getIconClassesForLanguageId, detectLanguageId, fileIconSelectorEscape, fileIconDirectoryRegex };
