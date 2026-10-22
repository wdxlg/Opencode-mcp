// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/promptSyntax/pickers/askForPromptName.ts
import { IQuickInputService } from "./module-0536.mjs";
import { IFileService } from "./module-0269.mjs";
import { getPromptFileExtension } from "./module-0997.mjs";
import { localize } from "./module-0001.mjs";
import { severity_default } from "./module-0266.mjs";
import { isValidBasename } from "./module-0031.mjs";
import { URI } from "./module-0032.mjs";


// src/vs/workbench/contrib/chat/browser/promptSyntax/pickers/askForPromptName.ts
async function askForPromptFileName(accessor, type, selectedFolder, existingFileName, fileExtensionOverride) {
  const quickInputService = accessor.get(IQuickInputService);
  const fileService = accessor.get(IFileService);
  const sanitizeInput = (input) => {
    const trimmedName = input.trim();
    if (!trimmedName) {
      return void 0;
    }
    const fileExtension = fileExtensionOverride ?? getPromptFileExtension(type);
    return trimmedName.endsWith(fileExtension) ? trimmedName : `${trimmedName}${fileExtension}`;
  };
  const validateInput = async (value2) => {
    const fileName = sanitizeInput(value2);
    if (!fileName) {
      return {
        content: localize(11478, null),
        severity: severity_default.Warning
      };
    }
    if (!isValidBasename(fileName)) {
      return {
        content: localize(11480, null),
        severity: severity_default.Error
      };
    }
    const fileUri = URI.joinPath(selectedFolder, fileName);
    if (await fileService.exists(fileUri)) {
      return {
        content: localize(11479, null),
        severity: severity_default.Error
      };
    }
    return void 0;
  };
  const placeHolder = existingFileName ? getPlaceholderStringForRename(type) : getPlaceholderStringForNew(type);
  const result = await quickInputService.input({ placeHolder, validateInput, value: existingFileName });
  if (!result) {
    return void 0;
  }
  return sanitizeInput(result);
}

function getPlaceholderStringForNew(type) {
  switch (type) {
    case "instructions" /* instructions */:
      return localize(11477, null);
    case "prompt" /* prompt */:
      return localize(11481, null);
    case "agent" /* agent */:
      return localize(11476, null);
    default:
      throw new Error("Unknown prompt type");
  }
}

function getPlaceholderStringForRename(type) {
  switch (type) {
    case "instructions" /* instructions */:
      return localize(11483, null);
    case "prompt" /* prompt */:
      return localize(11484, null);
    case "agent" /* agent */:
      return localize(11482, null);
    default:
      throw new Error("Unknown prompt type");
  }
}
export { askForPromptFileName, getPlaceholderStringForNew, getPlaceholderStringForRename };
