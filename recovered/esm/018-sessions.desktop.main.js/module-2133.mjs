// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/promptSyntax/pickers/askForPromptSourceFolder.ts
import { IInstantiationService } from "./module-0077.mjs";
import { IQuickInputService } from "./module-0536.mjs";
import { IPromptsService } from "./module-0987.mjs";
import { ILabelService } from "./module-0641.mjs";
import { IWorkspaceContextService } from "./module-0509.mjs";
import { isEqual2 } from "./module-0034.mjs";
import { PROMPT_DOCUMENTATION_URL, getSourceDescription } from "./module-0986.mjs";
import { localize } from "./module-0001.mjs";
import { IOpenerService } from "./module-0272.mjs";
import { URI } from "./module-0032.mjs";


// src/vs/workbench/contrib/chat/browser/promptSyntax/pickers/askForPromptSourceFolder.ts
async function askForPromptSourceFolder(accessor, type, existingFolder, isMove = false) {
  const instantiationService = accessor.get(IInstantiationService);
  const quickInputService = accessor.get(IQuickInputService);
  const promptsService = accessor.get(IPromptsService);
  const labelService = accessor.get(ILabelService);
  const workspaceService = accessor.get(IWorkspaceContextService);
  const resolvedFolders = await promptsService.getResolvedSourceFolders(type);
  if (resolvedFolders.length === 0) {
    await instantiationService.invokeFunction((accessor2) => showNoFoldersDialog(accessor2, type));
    return;
  }
  const pickOptions = {
    placeHolder: existingFolder ? getPlaceholderStringforMove(type, isMove) : getPlaceholderStringforNew(type),
    canPickMany: false,
    matchOnDescription: true
  };
  const defaultFolder = !existingFolder ? resolvedFolders[0] : void 0;
  const { folders: workspaceFolders } = workspaceService.getWorkspace();
  const isMultiRoot = workspaceFolders.length > 1;
  const foldersList = resolvedFolders.map((resolved) => {
    const folderUri = resolved.searchRoot;
    const isDefault = defaultFolder && isEqual2(folderUri, defaultFolder.searchRoot);
    const sourceDescription = getSourceDescription(resolved.source);
    const detail2 = existingFolder && isEqual2(folderUri, existingFolder) ? localize(11497, null) : void 0;
    const basePath = isMultiRoot && resolved.storage === "local" /* local */ ? labelService.getUriLabel(folderUri, { relative: true }) : resolved.displayPath ?? labelService.getUriLabel(folderUri, { relative: resolved.storage === "local" /* local */ });
    const label3 = isDefault ? localize(11500, null, basePath) : basePath;
    const folder = { uri: folderUri, storage: resolved.storage, type };
    return {
      type: "item",
      label: label3,
      description: sourceDescription,
      detail: detail2,
      tooltip: labelService.getUriLabel(folderUri),
      picked: isDefault,
      folder
    };
  });
  if (isMultiRoot) {
    const getWorkspaceFolderIndex = (uri4, storage) => {
      if (storage !== "local" /* local */) {
        return workspaceFolders.length;
      }
      const wsFolder = workspaceService.getWorkspaceFolder(uri4);
      return wsFolder?.index ?? workspaceFolders.length;
    };
    foldersList.sort((a, b) => {
      const aIndex = getWorkspaceFolderIndex(a.folder.uri, a.folder.storage);
      const bIndex = getWorkspaceFolderIndex(b.folder.uri, b.folder.storage);
      return aIndex - bIndex;
    });
  }
  const answer = await quickInputService.pick(foldersList, pickOptions);
  if (!answer) {
    return;
  }
  return answer.folder;
}

function getPlaceholderStringforNew(type) {
  switch (type) {
    case "instructions" /* instructions */:
      return localize(11507, null);
    case "prompt" /* prompt */:
      return localize(11508, null);
    case "agent" /* agent */:
      return localize(11505, null);
    case "skill" /* skill */:
      return localize(11509, null);
    case "hook" /* hook */:
      return localize(11506, null);
    default:
      throw new Error("Unknown prompt type");
  }
}

function getPlaceholderStringforMove(type, isMove) {
  if (isMove) {
    switch (type) {
      case "instructions" /* instructions */:
        return localize(11499, null);
      case "prompt" /* prompt */:
        return localize(11502, null);
      case "agent" /* agent */:
        return localize(11486, null);
      case "skill" /* skill */:
        return localize(11504, null);
      case "hook" /* hook */:
        throw new Error("Hooks cannot be moved");
      default:
        throw new Error("Unknown prompt type");
    }
  }
  switch (type) {
    case "instructions" /* instructions */:
      return localize(11498, null);
    case "prompt" /* prompt */:
      return localize(11501, null);
    case "agent" /* agent */:
      return localize(11485, null);
    case "skill" /* skill */:
      return localize(11503, null);
    case "hook" /* hook */:
      throw new Error("Hooks cannot be copied");
    default:
      throw new Error("Unknown prompt type");
  }
}

async function showNoFoldersDialog(accessor, type) {
  const quickInputService = accessor.get(IQuickInputService);
  const openerService = accessor.get(IOpenerService);
  const docsQuickPick = {
    type: "item",
    label: getLearnLabel(type),
    description: PROMPT_DOCUMENTATION_URL,
    tooltip: PROMPT_DOCUMENTATION_URL,
    value: URI.parse(PROMPT_DOCUMENTATION_URL)
  };
  const result = await quickInputService.pick(
    [docsQuickPick],
    {
      placeHolder: getMissingSourceFolderString(type),
      canPickMany: false
    }
  );
  if (result) {
    await openerService.open(result.value);
  }
}

function getLearnLabel(type) {
  switch (type) {
    case "prompt" /* prompt */:
      return localize(11493, null);
    case "instructions" /* instructions */:
      return localize(11491, null);
    case "agent" /* agent */:
      return localize(11487, null);
    case "skill" /* skill */:
      return localize(11495, null);
    case "hook" /* hook */:
      return localize(11489, null);
    default:
      throw new Error("Unknown prompt type");
  }
}

function getMissingSourceFolderString(type) {
  switch (type) {
    case "instructions" /* instructions */:
      return localize(11492, null);
    case "prompt" /* prompt */:
      return localize(11494, null);
    case "agent" /* agent */:
      return localize(11488, null);
    case "skill" /* skill */:
      return localize(11496, null);
    case "hook" /* hook */:
      return localize(11490, null);
    default:
      throw new Error("Unknown prompt type");
  }
}
export { askForPromptSourceFolder, getPlaceholderStringforNew, getPlaceholderStringforMove, showNoFoldersDialog, getLearnLabel, getMissingSourceFolderString };
