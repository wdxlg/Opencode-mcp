// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/promptSyntax/hookActions.ts
import { getCopilotCliHookTypeName, resolveCopilotCliHookType } from "./module-1014.mjs";
import { parse12 } from "./module-2175.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { buildNewHookEntry, getHookSourceFormat } from "./module-1015.mjs";
import { getClaudeHookTypeName, resolveClaudeHookType } from "./module-1013.mjs";
import { applyEdits, setProperty } from "./module-1377.mjs";
import { isEqual2 } from "./module-0034.mjs";
import { getCodeEditor } from "./module-0223.mjs";
import { findHookCommandInYaml, findHookCommandSelection, parseAllHookFiles } from "./module-2523.mjs";
import { IBulkEditService, ResourceTextEdit } from "./module-0537.mjs";
import { Range2 } from "./module-0106.mjs";
import { VSBuffer } from "./module-0038.mjs";
import { DisposableStore } from "./module-0012.mjs";
import { IPromptsService } from "./module-0987.mjs";
import { IQuickInputService } from "./module-0536.mjs";
import { IFileService } from "./module-0269.mjs";
import { ILabelService } from "./module-0641.mjs";
import { IEditorService } from "./module-0935.mjs";
import { IWorkspaceContextService } from "./module-0509.mjs";
import { IPathService } from "./module-0939.mjs";
import { INotificationService } from "./module-0336.mjs";
import { IRemoteAgentService } from "./module-0938.mjs";
import { OS } from "./module-0014.mjs";
import { CancellationToken } from "./module-0025.mjs";
import { HOOKS_BY_TARGET, HOOK_METADATA } from "./module-1011.mjs";
import { formatHookCommandLabel, getEffectiveCommandFieldKey } from "./module-1012.mjs";
import { getSourceDescription } from "./module-0986.mjs";
import { URI } from "./module-0032.mjs";
import { Action2, registerAction2 } from "./module-0092.mjs";
import { Codicon } from "./module-0085.mjs";
import { ChatContextKeys } from "./module-0966.mjs";
import { CHAT_CATEGORY } from "./module-1475.mjs";


// src/vs/workbench/contrib/chat/browser/promptSyntax/hookActions.ts
var CONFIGURE_HOOKS_ACTION_ID = "workbench.action.chat.configure.hooks";

function usesCopilotCliNaming(hooksObj) {
  for (const key3 of Object.keys(hooksObj)) {
    if (resolveCopilotCliHookType(key3) !== void 0) {
      return true;
    }
  }
  return false;
}

function getHookTypeKeyName(hookTypeId, useCopilotCliNamingConvention) {
  if (useCopilotCliNamingConvention) {
    const copilotCliName = getCopilotCliHookTypeName(hookTypeId);
    if (copilotCliName) {
      return copilotCliName;
    }
  }
  return hookTypeId;
}

async function addHookToFile(hookFileUri, hookTypeId, fileService, editorService, notificationService, bulkEditService, openEditorOverride) {
  let hooksContent;
  const fileExists = await fileService.exists(hookFileUri);
  if (fileExists) {
    const existingContent = await fileService.readFile(hookFileUri);
    try {
      hooksContent = parse12(existingContent.value.toString());
      if (!hooksContent.hooks) {
        hooksContent.hooks = {};
      }
    } catch {
      notificationService.error(localize(11452, null));
      await editorService.openEditor({ resource: hookFileUri });
      return;
    }
  } else {
    hooksContent = { hooks: {} };
  }
  const sourceFormat = getHookSourceFormat(hookFileUri);
  const isClaude = sourceFormat === "claude" /* Claude */;
  const useCopilotCliNamingConvention = !isClaude && usesCopilotCliNaming(hooksContent.hooks);
  const hookTypeKeyName = isClaude ? getClaudeHookTypeName(hookTypeId) ?? hookTypeId : getHookTypeKeyName(hookTypeId, useCopilotCliNamingConvention);
  let existingKeyForType;
  for (const key3 of Object.keys(hooksContent.hooks)) {
    const resolvedType = isClaude ? resolveClaudeHookType(key3) : resolveCopilotCliHookType(key3);
    if (resolvedType === hookTypeId || key3 === hookTypeId) {
      existingKeyForType = key3;
      break;
    }
  }
  const keyToUse = existingKeyForType ?? hookTypeKeyName;
  const newHookEntry = buildNewHookEntry(sourceFormat);
  const existingHooks = hooksContent.hooks[keyToUse];
  const newHookIndex = Array.isArray(existingHooks) ? existingHooks.length : 0;
  let jsonContent;
  if (fileExists) {
    const originalText = (await fileService.readFile(hookFileUri)).value.toString();
    const detectedEol = originalText.includes("\r\n") ? "\r\n" : "\n";
    const formattingOptions = { tabSize: 1, insertSpaces: false, eol: detectedEol };
    const edits = setProperty(originalText, ["hooks", keyToUse, newHookIndex], newHookEntry, formattingOptions);
    jsonContent = applyEdits(originalText, edits);
  } else {
    const newContent = { hooks: { [keyToUse]: [newHookEntry] } };
    jsonContent = JSON.stringify(newContent, null, "	");
  }
  const existingEditor = editorService.editors.find((e4) => isEqual2(e4.resource, hookFileUri));
  if (existingEditor) {
    await editorService.openEditor({
      resource: hookFileUri,
      options: {
        pinned: false
      }
    });
    const editor = getCodeEditor(editorService.activeTextEditorControl);
    if (editor && editor.hasModel() && isEqual2(editor.getModel().uri, hookFileUri)) {
      const model = editor.getModel();
      model.pushEditOperations([], [{
        range: model.getFullModelRange(),
        text: jsonContent
      }], () => null);
      const selection = findHookCommandSelection(jsonContent, keyToUse, newHookIndex, "command");
      if (selection && selection.endLineNumber !== void 0 && selection.endColumn !== void 0) {
        editor.setSelection({
          startLineNumber: selection.startLineNumber,
          startColumn: selection.startColumn,
          endLineNumber: selection.endLineNumber,
          endColumn: selection.endColumn
        });
        editor.revealLineInCenter(selection.startLineNumber);
      }
    } else {
      await bulkEditService.apply([
        new ResourceTextEdit(hookFileUri, { range: new Range2(1, 1, Number.MAX_SAFE_INTEGER, 1), text: jsonContent })
      ], { label: localize(11433, null) });
      const selection = findHookCommandSelection(jsonContent, keyToUse, newHookIndex, "command");
      await editorService.openEditor({
        resource: hookFileUri,
        options: {
          selection,
          pinned: false
        }
      });
    }
  } else {
    if (!fileExists) {
      await fileService.writeFile(hookFileUri, VSBuffer.fromString(jsonContent));
    } else {
      await editorService.openEditor({
        resource: hookFileUri,
        options: { pinned: false }
      });
      await bulkEditService.apply([
        new ResourceTextEdit(hookFileUri, { range: new Range2(1, 1, Number.MAX_SAFE_INTEGER, 1), text: jsonContent })
      ], { label: localize(11433, null) });
    }
    const selection = findHookCommandSelection(jsonContent, keyToUse, newHookIndex, "command");
    if (openEditorOverride) {
      await openEditorOverride(hookFileUri, { selection });
    } else {
      await editorService.openEditor({
        resource: hookFileUri,
        options: {
          selection,
          pinned: false
        }
      });
    }
  }
}

function awaitPick(picker, backButton2) {
  return new Promise((resolve3) => {
    let resolved = false;
    const done = (value2) => {
      if (!resolved) {
        resolved = true;
        disposables.dispose();
        resolve3(value2);
      }
    };
    const disposables = new DisposableStore();
    disposables.add(picker.onDidAccept(() => {
      done(picker.activeItems[0]);
    }));
    disposables.add(picker.onDidTriggerButton((button) => {
      if (button === backButton2) {
        done("back");
      }
    }));
    disposables.add(picker.onDidHide(() => {
      done(void 0);
    }));
  });
}

async function showConfigureHooksQuickPick(accessor, options3) {
  const promptsService = accessor.get(IPromptsService);
  const quickInputService = accessor.get(IQuickInputService);
  const fileService = accessor.get(IFileService);
  const labelService = accessor.get(ILabelService);
  const editorService = accessor.get(IEditorService);
  const workspaceService = accessor.get(IWorkspaceContextService);
  const pathService = accessor.get(IPathService);
  const notificationService = accessor.get(INotificationService);
  const bulkEditService = accessor.get(IBulkEditService);
  const remoteAgentService = accessor.get(IRemoteAgentService);
  const remoteEnv = await remoteAgentService.getEnvironment();
  const targetOS = remoteEnv?.os ?? OS;
  const workspaceFolder = workspaceService.getWorkspace().folders[0];
  const workspaceRootUri = workspaceFolder?.uri;
  const userHomeUri = await pathService.userHome();
  const userHome = userHomeUri.fsPath ?? userHomeUri.path;
  const hookEntries = await parseAllHookFiles(
    promptsService,
    fileService,
    labelService,
    workspaceRootUri,
    userHome,
    targetOS,
    CancellationToken.None,
    { includeAgentHooks: true, preferredStorage: options3?.preferredStorage }
  );
  const hookCountByType = /* @__PURE__ */ new Map();
  for (const entry of hookEntries) {
    hookCountByType.set(entry.hookType, (hookCountByType.get(entry.hookType) ?? 0) + 1);
  }
  const store = new DisposableStore();
  const picker = store.add(quickInputService.createQuickPick({ useSeparators: true }));
  const backButton2 = quickInputService.backButton;
  picker.show();
  let step = 1 /* SelectHookType */;
  let selectedHookType;
  let selectedHook;
  let selectedFile;
  let selectedFolder;
  const stepHistory = [];
  const goBack = () => stepHistory.pop();
  try {
    while (true) {
      switch (step) {
        case 1 /* SelectHookType */: {
          const makeItem = ([hookType, meta]) => {
            const count2 = hookCountByType.get(hookType) ?? 0;
            const countLabel = count2 > 0 ? ` (${count2})` : "";
            return {
              label: `${meta.label}${countLabel}`,
              description: meta.description,
              hookType,
              hookTypeMeta: meta
            };
          };
          let pickerItems;
          if (options3?.target) {
            const targetHookTypes = new Set(Object.values(HOOKS_BY_TARGET[options3.target]));
            pickerItems = Object.entries(HOOK_METADATA).filter(([hookType]) => targetHookTypes.has(hookType)).map(makeItem);
          } else {
            const vscodeTypes = new Set(Object.values(HOOKS_BY_TARGET["vscode" /* VSCode */]));
            const copilotTypes = new Set(Object.values(HOOKS_BY_TARGET["github-copilot" /* GitHubCopilot */]));
            const allEntries = Object.entries(HOOK_METADATA);
            const shared = allEntries.filter(([h3]) => vscodeTypes.has(h3) && copilotTypes.has(h3));
            const vscodeOnly = allEntries.filter(([h3]) => vscodeTypes.has(h3) && !copilotTypes.has(h3));
            const copilotOnly = allEntries.filter(([h3]) => !vscodeTypes.has(h3) && copilotTypes.has(h3));
            pickerItems = [];
            if (shared.length > 0) {
              pickerItems.push({ type: "separator", label: localize(11458, null) });
              pickerItems.push(...shared.map(makeItem));
            }
            if (vscodeOnly.length > 0) {
              pickerItems.push({ type: "separator", label: localize(11459, null) });
              pickerItems.push(...vscodeOnly.map(makeItem));
            }
            if (copilotOnly.length > 0) {
              pickerItems.push({ type: "separator", label: localize(11457, null) });
              pickerItems.push(...copilotOnly.map(makeItem));
            }
          }
          picker.items = pickerItems;
          picker.value = "";
          picker.placeholder = localize(11448, null);
          picker.title = localize(11451, null);
          picker.buttons = [];
          const result = await awaitPick(picker, backButton2);
          if (!result || result === "back") {
            return;
          }
          selectedHookType = result;
          stepHistory.push(1 /* SelectHookType */);
          step = 2 /* SelectHook */;
          break;
        }
        case 2 /* SelectHook */: {
          const hooksOfType = hookEntries.filter((h3) => h3.hookType === selectedHookType.hookType);
          const fileHooks = hooksOfType.filter((h3) => !h3.agentName);
          const agentHooks = hooksOfType.filter((h3) => h3.agentName);
          const hookItems = [];
          hookItems.push({
            label: `$(plus) ${localize(11435, null)}`,
            isAddNewHook: true,
            alwaysShow: true
          });
          if (fileHooks.length > 0) {
            hookItems.push({
              type: "separator",
              label: localize(11456, null)
            });
            for (const entry of fileHooks) {
              const description = labelService.getUriLabel(entry.fileUri, { relative: true });
              hookItems.push({
                label: entry.commandLabel,
                description,
                hookEntry: entry
              });
            }
          }
          if (agentHooks.length > 0) {
            const agentNames = [...new Set(agentHooks.map((h3) => h3.agentName))];
            for (const agentName of agentNames) {
              hookItems.push({
                type: "separator",
                label: localize(11434, null, agentName)
              });
              for (const entry of agentHooks.filter((h3) => h3.agentName === agentName)) {
                const description = labelService.getUriLabel(entry.fileUri, { relative: true });
                hookItems.push({
                  label: entry.commandLabel,
                  description,
                  hookEntry: entry
                });
              }
            }
          }
          if (hooksOfType.length === 0) {
            selectedHook = hookItems[0];
          } else {
            picker.items = hookItems;
            picker.value = "";
            picker.placeholder = localize(11450, null);
            picker.title = selectedHookType.hookTypeMeta.label;
            picker.buttons = [backButton2];
            const result = await awaitPick(picker, backButton2);
            if (result === "back") {
              step = goBack() ?? 1 /* SelectHookType */;
              break;
            }
            if (!result) {
              return;
            }
            selectedHook = result;
            stepHistory.push(2 /* SelectHook */);
          }
          if (selectedHook.hookEntry) {
            const entry = selectedHook.hookEntry;
            let selection;
            if (entry.agentName) {
              try {
                const content = await fileService.readFile(entry.fileUri);
                const commandText = formatHookCommandLabel(entry.command, targetOS);
                if (commandText) {
                  selection = findHookCommandInYaml(content.value.toString(), commandText);
                }
              } catch {
              }
            } else {
              const commandFieldName = getEffectiveCommandFieldKey(entry.command, targetOS);
              if (commandFieldName) {
                try {
                  const content = await fileService.readFile(entry.fileUri);
                  selection = findHookCommandSelection(
                    content.value.toString(),
                    entry.originalHookTypeId,
                    entry.index,
                    commandFieldName
                  );
                } catch {
                }
              }
            }
            if (options3?.openEditor) {
              await options3.openEditor(entry.fileUri, { selection });
            } else {
              await editorService.openEditor({
                resource: entry.fileUri,
                options: {
                  selection,
                  pinned: false
                }
              });
            }
            return;
          }
          step = 3 /* SelectFile */;
          break;
        }
        case 3 /* SelectFile */: {
          const hookStorage = options3?.preferredStorage ?? "local" /* local */;
          const hookFiles = await promptsService.listPromptFilesForStorage("hook" /* hook */, hookStorage, CancellationToken.None);
          const fileItems = [];
          fileItems.push({
            label: `$(new-file) ${localize(11436, null)}`,
            isCreateNewFile: true,
            alwaysShow: true
          });
          if (hookFiles.length > 0) {
            fileItems.push({
              type: "separator",
              label: localize(11455, null)
            });
            for (const hookFile of hookFiles) {
              const relativePath2 = labelService.getUriLabel(hookFile.uri, { relative: true });
              fileItems.push({
                label: relativePath2,
                fileUri: hookFile.uri
              });
            }
          }
          if (hookFiles.length === 0) {
            selectedFile = fileItems[0];
          } else {
            picker.items = fileItems;
            picker.value = "";
            picker.placeholder = localize(11449, null);
            picker.title = localize(11447, null);
            picker.buttons = [backButton2];
            const result = await awaitPick(picker, backButton2);
            if (result === "back") {
              step = goBack() ?? 2 /* SelectHook */;
              break;
            }
            if (!result) {
              return;
            }
            selectedFile = result;
            stepHistory.push(3 /* SelectFile */);
          }
          if (selectedFile.fileUri) {
            await addHookToFile(
              selectedFile.fileUri,
              selectedHookType.hookType,
              fileService,
              editorService,
              notificationService,
              bulkEditService,
              options3?.openEditor
            );
            return;
          }
          step = 4 /* SelectFolder */;
          break;
        }
        case 4 /* SelectFolder */: {
          const allFolders = (await promptsService.getSourceFolders("hook" /* hook */)).filter((folder) => options3?.preferredStorage === void 0 || folder.storage === options3.preferredStorage);
          if (allFolders.length === 0) {
            notificationService.error(options3?.preferredStorage === "user" /* user */ ? localize(11444, null) : localize(11443, null));
            return;
          }
          selectedFolder = allFolders[0];
          if (allFolders.length > 1) {
            const folderItems = allFolders.map((folder, index2) => {
              const basePath = labelService.getUriLabel(folder.uri, { relative: folder.storage === "local" /* local */ });
              const label3 = index2 === 0 ? localize(11437, null, basePath) : basePath;
              return {
                label: label3,
                description: folder.source ? getSourceDescription(folder.source) : void 0,
                folder
              };
            });
            picker.items = folderItems;
            picker.value = "";
            picker.placeholder = localize(11445, null);
            picker.title = localize(11446, null);
            picker.buttons = [backButton2];
            const result = await awaitPick(picker, backButton2);
            if (result === "back") {
              step = goBack() ?? 3 /* SelectFile */;
              break;
            }
            if (!result) {
              return;
            }
            selectedFolder = result.folder;
            stepHistory.push(4 /* SelectFolder */);
          }
          step = 5 /* EnterFilename */;
          break;
        }
        case 5 /* EnterFilename */: {
          picker.hide();
          const fileNameResult = await new Promise((resolve3) => {
            let resolved = false;
            const done = (value2) => {
              if (!resolved) {
                resolved = true;
                inputDisposables.dispose();
                resolve3(value2);
              }
            };
            const inputDisposables = new DisposableStore();
            const inputBox = inputDisposables.add(quickInputService.createInputBox());
            inputBox.prompt = localize(11440, null);
            inputBox.placeholder = localize(11439, null);
            inputBox.title = localize(11442, null);
            inputBox.buttons = [backButton2];
            inputBox.ignoreFocusOut = true;
            inputDisposables.add(inputBox.onDidAccept(async () => {
              const value2 = inputBox.value;
              if (!value2 || !value2.trim()) {
                inputBox.validationMessage = localize(11441, null);
                return;
              }
              const name = value2.trim();
              if (/[/\\:*?"<>|]/.test(name)) {
                inputBox.validationMessage = localize(11438, null);
                return;
              }
              done(name);
            }));
            inputDisposables.add(inputBox.onDidChangeValue(() => {
              inputBox.validationMessage = void 0;
            }));
            inputDisposables.add(inputBox.onDidTriggerButton((button) => {
              if (button === backButton2) {
                done("back");
              }
            }));
            inputDisposables.add(inputBox.onDidHide(() => {
              done(void 0);
            }));
            inputBox.show();
          });
          if (fileNameResult === "back") {
            picker.show();
            step = goBack() ?? 4 /* SelectFolder */;
            break;
          }
          if (!fileNameResult) {
            return;
          }
          await fileService.createFolder(selectedFolder.uri);
          const hookFileName = fileNameResult.endsWith(".json") ? fileNameResult : `${fileNameResult}.json`;
          const hookFileUri = URI.joinPath(selectedFolder.uri, hookFileName);
          if (await fileService.exists(hookFileUri)) {
            await addHookToFile(
              hookFileUri,
              selectedHookType.hookType,
              fileService,
              editorService,
              notificationService,
              bulkEditService,
              options3?.openEditor
            );
            return;
          }
          const newFileFormat = getHookSourceFormat(hookFileUri);
          const isClaudeNewFile = newFileFormat === "claude" /* Claude */;
          const isCopilotCliOnly = !isClaudeNewFile && !new Set(Object.values(HOOKS_BY_TARGET["vscode" /* VSCode */])).has(selectedHookType.hookType) && new Set(Object.values(HOOKS_BY_TARGET["github-copilot" /* GitHubCopilot */])).has(selectedHookType.hookType);
          const hookTypeKey = isClaudeNewFile ? getClaudeHookTypeName(selectedHookType.hookType) ?? selectedHookType.hookType : isCopilotCliOnly ? getCopilotCliHookTypeName(selectedHookType.hookType) ?? selectedHookType.hookType : selectedHookType.hookType;
          const newFileHookEntry = isCopilotCliOnly ? { type: "command", [targetOS === 1 /* Windows */ ? "powershell" : "bash"]: "" } : buildNewHookEntry(newFileFormat);
          const commandFieldKey = isCopilotCliOnly ? targetOS === 1 /* Windows */ ? "powershell" : "bash" : "command";
          const hooksContent = {
            ...isCopilotCliOnly ? { version: 1 } : {},
            hooks: {
              [hookTypeKey]: [
                newFileHookEntry
              ]
            }
          };
          const jsonContent = JSON.stringify(hooksContent, null, "	");
          await fileService.writeFile(hookFileUri, VSBuffer.fromString(jsonContent));
          options3?.onHookFileCreated?.(hookFileUri);
          const selection = findHookCommandSelection(jsonContent, hookTypeKey, 0, commandFieldKey);
          if (options3?.openEditor) {
            await options3.openEditor(hookFileUri, { selection });
          } else {
            await editorService.openEditor({
              resource: hookFileUri,
              options: {
                selection,
                pinned: false
              }
            });
          }
          return;
        }
      }
    }
  } finally {
    store.dispose();
  }
}

var ManageHooksAction = class extends Action2 {
  constructor() {
    super({
      id: CONFIGURE_HOOKS_ACTION_ID,
      title: localize2(11453, "Configure Hooks..."),
      shortTitle: localize2(11454, "Hooks"),
      icon: Codicon.zap,
      f1: true,
      precondition: ChatContextKeys.enabled,
      category: CHAT_CATEGORY
    });
  }
  async run(accessor) {
    return showConfigureHooksQuickPick(accessor);
  }
};

function registerHookActions() {
  registerAction2(ManageHooksAction);
}
export { usesCopilotCliNaming, getHookTypeKeyName, addHookToFile, awaitPick, showConfigureHooksQuickPick, registerHookActions, CONFIGURE_HOOKS_ACTION_ID, ManageHooksAction };
