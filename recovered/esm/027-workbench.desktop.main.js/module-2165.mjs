// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/promptSyntax/pickers/promptFilePickers.ts
import { ThemeIcon } from "./module-0086.mjs";
import { Codicon } from "./module-0085.mjs";
import { localize } from "./module-0001.mjs";
import { URI } from "./module-0032.mjs";
import { AGENT_DOCUMENTATION_URL, HOOK_DOCUMENTATION_URL, INSTRUCTIONS_DOCUMENTATION_URL, PROMPT_DOCUMENTATION_URL, SKILL_DOCUMENTATION_URL } from "./module-0985.mjs";
import { NEW_AGENT_COMMAND_ID, NEW_INSTRUCTIONS_COMMAND_ID, NEW_PROMPT_COMMAND_ID, NEW_SKILL_COMMAND_ID } from "./module-2161.mjs";
import { GENERATE_AGENT_COMMAND_ID, GENERATE_AGENT_INSTRUCTIONS_COMMAND_ID, GENERATE_ON_DEMAND_INSTRUCTIONS_COMMAND_ID, GENERATE_PROMPT_COMMAND_ID, GENERATE_SKILL_COMMAND_ID } from "./module-1476.mjs";
import { CancellationToken, CancellationTokenSource } from "./module-0025.mjs";
import { basename2, dirname2, extUri, joinPath } from "./module-0034.mjs";
import { DisposableStore } from "./module-0012.mjs";
import { isOrganizationPromptFile } from "./module-2164.mjs";
import { getCleanPromptName, getSkillFolderName } from "./module-0996.mjs";
import { assertNever } from "./module-0009.mjs";
import { askForPromptSourceFolder } from "./module-2160.mjs";
import { askForPromptFileName } from "./module-2159.mjs";
import { PromptFileRewriter } from "./module-2163.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IQuickInputService } from "./module-0536.mjs";
import { IOpenerService } from "./module-0272.mjs";
import { IFileService } from "./module-0269.mjs";
import { IDialogService } from "./module-0267.mjs";
import { ICommandService } from "./module-0087.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IPromptsService } from "./module-0986.mjs";
import { ILabelService } from "./module-0641.mjs";
import { IProductService } from "./module-0873.mjs";


// src/vs/workbench/contrib/chat/browser/promptSyntax/pickers/promptFilePickers.ts
function newHelpButton(type) {
  const iconClass = ThemeIcon.asClassName(Codicon.question);
  switch (type) {
    case "prompt" /* prompt */:
      return {
        tooltip: localize(11525, null),
        helpURI: URI.parse(PROMPT_DOCUMENTATION_URL),
        iconClass
      };
    case "instructions" /* instructions */:
      return {
        tooltip: localize(11524, null),
        helpURI: URI.parse(INSTRUCTIONS_DOCUMENTATION_URL),
        iconClass
      };
    case "agent" /* agent */:
      return {
        tooltip: localize(11522, null),
        helpURI: URI.parse(AGENT_DOCUMENTATION_URL),
        iconClass
      };
    case "skill" /* skill */:
      return {
        tooltip: localize(11526, null),
        helpURI: URI.parse(SKILL_DOCUMENTATION_URL),
        iconClass
      };
    case "hook" /* hook */:
      return {
        tooltip: localize(11523, null),
        helpURI: URI.parse(HOOK_DOCUMENTATION_URL),
        iconClass
      };
  }
}

function isHelpButton(button) {
  return button.helpURI !== void 0;
}

function isPromptFileItem(item) {
  return item.type === "item" && !!item.promptFileUri;
}

function isExtensionPromptPath(prompt) {
  return prompt.storage === "extension" /* extension */ && !!prompt.extension;
}

var NEW_PROMPT_FILE_OPTION = {
  type: "item",
  label: `$(plus) ${localize(
    11517,
    null
  )}`,
  pickable: false,
  alwaysShow: true,
  buttons: [newHelpButton("prompt" /* prompt */)],
  commandId: NEW_PROMPT_COMMAND_ID
};

var NEW_INSTRUCTIONS_FILE_OPTION = {
  type: "item",
  label: `$(plus) ${localize(
    11516,
    null
  )}`,
  pickable: false,
  alwaysShow: true,
  buttons: [newHelpButton("instructions" /* instructions */)],
  commandId: NEW_INSTRUCTIONS_COMMAND_ID
};

var GENERATE_AGENT_INSTRUCTIONS_OPTION = {
  type: "item",
  label: `$(sparkle) ${localize(
    11510,
    null
  )}`,
  pickable: false,
  alwaysShow: true,
  buttons: [newHelpButton("instructions" /* instructions */)],
  commandId: GENERATE_AGENT_INSTRUCTIONS_COMMAND_ID
};

var GENERATE_ON_DEMAND_INSTRUCTIONS_OPTION = {
  type: "item",
  label: `$(sparkle) ${localize(
    11512,
    null
  )}`,
  pickable: false,
  alwaysShow: true,
  buttons: [newHelpButton("instructions" /* instructions */)],
  commandId: GENERATE_ON_DEMAND_INSTRUCTIONS_COMMAND_ID
};

var NEW_AGENT_FILE_OPTION = {
  type: "item",
  label: `$(plus) ${localize(
    11515,
    null
  )}`,
  pickable: false,
  alwaysShow: true,
  buttons: [newHelpButton("agent" /* agent */)],
  commandId: NEW_AGENT_COMMAND_ID
};

var NEW_SKILL_FILE_OPTION = {
  type: "item",
  label: `$(plus) ${localize(
    11518,
    null
  )}`,
  pickable: false,
  alwaysShow: true,
  buttons: [newHelpButton("skill" /* skill */)],
  commandId: NEW_SKILL_COMMAND_ID
};

var GENERATE_PROMPT_OPTION = {
  type: "item",
  label: `$(sparkle) ${localize(
    11513,
    null
  )}`,
  pickable: false,
  alwaysShow: true,
  buttons: [newHelpButton("prompt" /* prompt */)],
  commandId: GENERATE_PROMPT_COMMAND_ID
};

var GENERATE_SKILL_OPTION = {
  type: "item",
  label: `$(sparkle) ${localize(
    11514,
    null
  )}`,
  pickable: false,
  alwaysShow: true,
  buttons: [newHelpButton("skill" /* skill */)],
  commandId: GENERATE_SKILL_COMMAND_ID
};

var GENERATE_AGENT_OPTION = {
  type: "item",
  label: `$(sparkle) ${localize(
    11511,
    null
  )}`,
  pickable: false,
  alwaysShow: true,
  buttons: [newHelpButton("agent" /* agent */)],
  commandId: GENERATE_AGENT_COMMAND_ID
};

var EDIT_BUTTON = {
  tooltip: localize(11532, null),
  iconClass: ThemeIcon.asClassName(Codicon.fileCode)
};

var DELETE_BUTTON = {
  tooltip: localize(11521, null),
  iconClass: ThemeIcon.asClassName(Codicon.trash)
};

var RENAME_BUTTON = {
  tooltip: localize(11533, null),
  iconClass: ThemeIcon.asClassName(Codicon.replace)
};

var COPY_BUTTON = {
  tooltip: localize(11529, null),
  iconClass: ThemeIcon.asClassName(Codicon.copy)
};

var MAKE_VISIBLE_BUTTON = {
  tooltip: localize(11531, null),
  iconClass: ThemeIcon.asClassName(Codicon.eyeClosed),
  alwaysVisible: true
};

var MAKE_INVISIBLE_BUTTON = {
  tooltip: localize(11530, null),
  iconClass: ThemeIcon.asClassName(Codicon.eye)
};

var RUN_IN_CHAT_BUTTON = {
  tooltip: localize(11534, null),
  iconClass: ThemeIcon.asClassName(Codicon.play)
};

var PromptFilePickers = class {
  constructor(_quickInputService, _openerService, _fileService, _dialogService, _commandService, _instaService, _promptsService, _labelService, _productService) {
    this._quickInputService = _quickInputService;
    this._openerService = _openerService;
    this._fileService = _fileService;
    this._dialogService = _dialogService;
    this._commandService = _commandService;
    this._instaService = _instaService;
    this._promptsService = _promptsService;
    this._labelService = _labelService;
    this._productService = _productService;
  }
  /**
   * Shows the prompt file selection dialog to the user that allows to run a prompt file(s).
   *
   * If {@link ISelectOptions.resource resource} is provided, the dialog will have
   * the resource pre-selected in the prompts list.
   */
  async selectPromptFile(options3) {
    const cts = new CancellationTokenSource();
    const quickPick = this._quickInputService.createQuickPick({ useSeparators: true });
    quickPick.busy = true;
    quickPick.placeholder = localize(11535, null);
    try {
      const fileOptions = await this._createPromptPickItems(options3, cts.token);
      const activeItem = options3.resource && fileOptions.find((f) => f.type === "item" && extUri.isEqual(f.promptFileUri, options3.resource));
      if (activeItem) {
        quickPick.activeItems = [activeItem];
      }
      quickPick.placeholder = options3.placeholder;
      quickPick.matchOnDescription = true;
      quickPick.items = fileOptions;
    } finally {
      quickPick.busy = false;
    }
    return new Promise((resolve3) => {
      const disposables = new DisposableStore();
      let isResolved = false;
      let isClosed = false;
      disposables.add(quickPick);
      disposables.add(cts);
      const refreshItems = async () => {
        const active = quickPick.activeItems;
        const newItems = await this._createPromptPickItems(options3, CancellationToken.None);
        quickPick.items = newItems;
        quickPick.activeItems = active;
      };
      disposables.add(quickPick.onDidAccept(async () => {
        const { selectedItems } = quickPick;
        const { keyMods } = quickPick;
        const selectedItem = selectedItems[0];
        if (isPromptFileItem(selectedItem)) {
          resolve3({ promptFile: selectedItem.promptFileUri, keyMods: { ...keyMods } });
          isResolved = true;
        } else {
          if (selectedItem.commandId) {
            await this._commandService.executeCommand(selectedItem.commandId);
            return;
          }
        }
        quickPick.hide();
      }));
      disposables.add(quickPick.onDidTriggerItemButton(async (e) => {
        const shouldRefresh = await this._handleButtonClick(quickPick, e, options3);
        if (!isClosed && shouldRefresh) {
          await refreshItems();
        }
      }));
      disposables.add(quickPick.onDidHide(() => {
        if (!quickPick.ignoreFocusOut) {
          disposables.dispose();
          isClosed = true;
          if (!isResolved) {
            resolve3(void 0);
            isResolved = true;
          }
        }
      }));
      quickPick.show();
    });
  }
  async _createPromptPickItems(options3, token) {
    const buttons = [];
    if (options3.type === "prompt" /* prompt */ && options3.optionRun !== false) {
      buttons.push(RUN_IN_CHAT_BUTTON);
    }
    if (options3.optionEdit !== false) {
      buttons.push(EDIT_BUTTON);
    }
    if (options3.optionCopy !== false) {
      buttons.push(COPY_BUTTON);
    }
    if (options3.optionRename !== false) {
      buttons.push(RENAME_BUTTON);
    }
    if (options3.optionDelete !== false) {
      buttons.push(DELETE_BUTTON);
    }
    const result = [];
    if (options3.optionNew !== false) {
      result.push(...this._getNewItems(options3.type));
    }
    let getVisibility2 = () => void 0;
    if (options3.optionVisibility) {
      const disabled = this._promptsService.getDisabledPromptFiles(options3.type);
      getVisibility2 = (p) => !disabled.has(p.uri);
    }
    const sortByLabel = (items) => items.sort((a, b) => a.label.localeCompare(b.label));
    const locals = await this._promptsService.listPromptFilesForStorage(options3.type, "local" /* local */, token);
    if (locals.length) {
      result.push({ type: "separator", label: localize(11540, null) });
      result.push(...sortByLabel(await Promise.all(locals.map((l) => this._createPromptPickItem(l, buttons, getVisibility2(l), token)))));
    }
    let agentInstructionFiles = [];
    if (options3.type === "instructions" /* instructions */) {
      const agentInstructionUris = await this._promptsService.listAgentInstructions(token);
      agentInstructionFiles = agentInstructionUris.map((agentInstructionFile) => {
        const folderName = this._labelService.getUriLabel(dirname2(agentInstructionFile.uri), { relative: true });
        return {
          uri: agentInstructionFile.uri,
          description: agentInstructionFile.type !== "copilotInstructionsMd" /* copilotInstructionsMd */ ? folderName : void 0,
          storage: "local" /* local */,
          type: options3.type
        };
      });
    }
    if (agentInstructionFiles.length) {
      const agentButtons = buttons.filter((b) => b !== RENAME_BUTTON);
      result.push({ type: "separator", label: localize(11541, null) });
      result.push(...sortByLabel(await Promise.all(agentInstructionFiles.map((l) => this._createPromptPickItem(l, agentButtons, getVisibility2(l), token)))));
    }
    const exts = (await this._promptsService.listPromptFilesForStorage(options3.type, "extension" /* extension */, token)).filter(isExtensionPromptPath);
    if (exts.length) {
      const extButtons = [];
      if (options3.type === "prompt" /* prompt */ && options3.optionRun !== false) {
        extButtons.push(RUN_IN_CHAT_BUTTON);
      }
      if (options3.optionEdit !== false) {
        extButtons.push(EDIT_BUTTON);
      }
      if (options3.optionCopy !== false) {
        extButtons.push(COPY_BUTTON);
      }
      const groupedExts = /* @__PURE__ */ new Map();
      for (const ext of exts) {
        const groupLabel = this._getExtensionGroupLabel(ext);
        if (!groupedExts.has(groupLabel)) {
          groupedExts.set(groupLabel, []);
        }
        groupedExts.get(groupLabel).push(ext);
      }
      const sortedGroupedExts = Array.from(groupedExts.entries()).sort((a, b) => a[0].localeCompare(b[0]));
      for (const [groupLabel, groupExts] of sortedGroupedExts) {
        result.push({ type: "separator", label: groupLabel });
        result.push(...sortByLabel(await Promise.all(groupExts.map((e) => this._createPromptPickItem(e, extButtons, getVisibility2(e), token)))));
      }
    }
    const users = await this._promptsService.listPromptFilesForStorage(options3.type, "user" /* user */, token);
    if (users.length) {
      result.push({ type: "separator", label: localize(11539, null) });
      result.push(...sortByLabel(await Promise.all(users.map((u) => this._createPromptPickItem(u, buttons, getVisibility2(u), token)))));
    }
    const plugins = await this._promptsService.listPromptFilesForStorage(options3.type, "plugin" /* plugin */, token);
    if (plugins.length) {
      const pluginButtons = [];
      if (options3.optionCopy !== false) {
        pluginButtons.push(COPY_BUTTON);
      }
      result.push({ type: "separator", label: localize(11538, null) });
      result.push(...sortByLabel(await Promise.all(plugins.map((p) => this._createPromptPickItem(p, pluginButtons, getVisibility2(p), token)))));
    }
    return result;
  }
  _getExtensionGroupLabel(extPath) {
    if (isOrganizationPromptFile(extPath.uri, extPath.extension.identifier, this._productService)) {
      return localize(11537, null);
    }
    return localize(11536, null);
  }
  _getNewItems(type) {
    switch (type) {
      case "prompt" /* prompt */:
        return [NEW_PROMPT_FILE_OPTION, GENERATE_PROMPT_OPTION];
      case "instructions" /* instructions */:
        return [NEW_INSTRUCTIONS_FILE_OPTION, GENERATE_ON_DEMAND_INSTRUCTIONS_OPTION, GENERATE_AGENT_INSTRUCTIONS_OPTION];
      case "agent" /* agent */:
        return [NEW_AGENT_FILE_OPTION, GENERATE_AGENT_OPTION];
      case "skill" /* skill */:
        return [NEW_SKILL_FILE_OPTION, GENERATE_SKILL_OPTION];
      default:
        throw new Error(`Unknown prompt type '${type}'.`);
    }
  }
  async _createPromptPickItem(promptFile, buttons, visibility, token) {
    const parsedPromptFile = await this._promptsService.parseNew(promptFile.uri, token).catch(() => void 0);
    let promptName = (parsedPromptFile?.header?.name ?? promptFile.name) || (promptFile.type === "skill" /* skill */ ? getSkillFolderName(promptFile.uri) : getCleanPromptName(promptFile.uri));
    const promptDescription = parsedPromptFile?.header?.description ?? promptFile.description;
    let tooltip;
    switch (promptFile.storage) {
      case "extension" /* extension */:
        tooltip = promptFile.extension.displayName ?? promptFile.extension.id;
        break;
      case "local" /* local */:
        tooltip = this._labelService.getUriLabel(dirname2(promptFile.uri), { relative: true });
        break;
      case "user" /* user */:
        tooltip = void 0;
        break;
      case "plugin" /* plugin */:
        tooltip = promptFile.name;
        break;
      case "builtin" /* builtIn */:
        tooltip = void 0;
        break;
      default:
        assertNever(promptFile);
    }
    let iconClass;
    if (visibility === false) {
      buttons = (buttons ?? []).concat(MAKE_VISIBLE_BUTTON);
      promptName = localize(11528, null, promptName);
      tooltip = localize(11527, null);
    } else if (visibility === true) {
      buttons = (buttons ?? []).concat(MAKE_INVISIBLE_BUTTON);
    }
    return {
      id: promptFile.uri.toString(),
      type: "item",
      label: promptName,
      description: promptDescription,
      iconClass,
      tooltip,
      promptFileUri: promptFile.uri,
      buttons
    };
  }
  async keepQuickPickOpen(quickPick, work) {
    const previousIgnoreFocusOut = quickPick.ignoreFocusOut;
    quickPick.ignoreFocusOut = true;
    try {
      return await work();
    } finally {
      quickPick.ignoreFocusOut = previousIgnoreFocusOut;
      quickPick.show();
    }
  }
  async _handleButtonClick(quickPick, context2, options3) {
    const { item, button } = context2;
    if (!isPromptFileItem(item)) {
      if (isHelpButton(button)) {
        await this._openerService.open(button.helpURI);
        return false;
      }
      throw new Error(`Unknown button '${JSON.stringify(button)}'.`);
    }
    const value2 = item.promptFileUri;
    if (button === RUN_IN_CHAT_BUTTON) {
      const commandId = quickPick.keyMods.ctrlCmd === true ? "workbench.action.chat.run-in-new-chat.prompt.current" : "workbench.action.chat.run.prompt.current";
      await this._commandService.executeCommand(commandId, value2);
      quickPick.hide();
      return false;
    }
    if (button === EDIT_BUTTON) {
      await this._openerService.open(value2);
      return false;
    }
    if (button === RENAME_BUTTON || button === COPY_BUTTON) {
      return await this.keepQuickPickOpen(quickPick, async () => {
        const currentFolder = dirname2(value2);
        const isMove = button === RENAME_BUTTON && quickPick.keyMods.ctrlCmd;
        const newFolder = await this._instaService.invokeFunction(askForPromptSourceFolder, options3.type, currentFolder, isMove);
        if (!newFolder) {
          return false;
        }
        const newName = await this._instaService.invokeFunction(askForPromptFileName, options3.type, newFolder.uri, item.label);
        if (!newName) {
          return false;
        }
        const newFile = joinPath(newFolder.uri, newName);
        if (isMove) {
          await this._fileService.move(value2, newFile);
        } else {
          await this._fileService.copy(value2, newFile);
        }
        await this._openerService.open(newFile);
        await this._instaService.createInstance(PromptFileRewriter).openAndRewriteName(newFile, getCleanPromptName(newFile), CancellationToken.None);
        return true;
      });
    }
    if (button === DELETE_BUTTON) {
      return await this.keepQuickPickOpen(quickPick, async () => {
        const isSkill = options3.type === "skill" /* skill */;
        const filename = isSkill ? basename2(dirname2(value2)) : item.label;
        const message = isSkill ? localize(11520, null, filename) : localize(11519, null, filename);
        const { confirmed } = await this._dialogService.confirm({ message });
        if (!confirmed) {
          return false;
        }
        const deleteTarget = isSkill ? dirname2(value2) : value2;
        await this._fileService.del(deleteTarget, { recursive: isSkill, useTrash: true });
        return true;
      });
    }
    if (button === MAKE_VISIBLE_BUTTON || button === MAKE_INVISIBLE_BUTTON) {
      const disabled = this._promptsService.getDisabledPromptFiles(options3.type);
      if (button === MAKE_VISIBLE_BUTTON) {
        disabled.delete(value2);
      } else {
        disabled.add(value2);
      }
      this._promptsService.setDisabledPromptFiles(options3.type, disabled);
      return true;
    }
    throw new Error(`Unknown button '${JSON.stringify(button)}'.`);
  }
  // --- Enablement Configuration -------------------------------------------------------
  /**
   * Shows a multi-select (checkbox) quick pick to configure which prompt files of the given
   * type are enabled. Currently only used for agent prompt files.
   */
  async managePromptFiles(type, placeholder) {
    const cts = new CancellationTokenSource();
    const quickPick = this._quickInputService.createQuickPick({ useSeparators: true });
    quickPick.placeholder = placeholder;
    quickPick.canSelectMany = true;
    quickPick.matchOnDescription = true;
    quickPick.sortByLabel = false;
    quickPick.busy = true;
    const options3 = {
      placeholder: "",
      type,
      optionNew: true,
      optionEdit: true,
      optionDelete: true,
      optionRename: true,
      optionCopy: true,
      optionVisibility: false,
      optionRun: false
    };
    try {
      const items = await this._createPromptPickItems(options3, cts.token);
      quickPick.items = items;
    } finally {
      quickPick.busy = false;
    }
    return new Promise((resolve3) => {
      const disposables = new DisposableStore();
      disposables.add(quickPick);
      disposables.add(cts);
      let isClosed = false;
      let isResolved = false;
      const refreshItems = async () => {
        const active = quickPick.activeItems;
        const newItems = await this._createPromptPickItems(options3, CancellationToken.None);
        quickPick.items = newItems;
        quickPick.activeItems = active;
      };
      disposables.add(quickPick.onDidAccept(async () => {
        const clickedItem = quickPick.activeItems;
        if (clickedItem.length === 1 && clickedItem[0].commandId) {
          const commandId = clickedItem[0].commandId;
          await this.keepQuickPickOpen(quickPick, async () => {
            await this._commandService.executeCommand(commandId);
          });
          if (!isClosed) {
            await refreshItems();
          }
          return;
        }
        isResolved = true;
        resolve3(true);
        quickPick.hide();
      }));
      disposables.add(quickPick.onDidTriggerItemButton(async (e) => {
        const shouldRefresh = await this._handleButtonClick(quickPick, e, options3);
        if (!isClosed && shouldRefresh) {
          await refreshItems();
        }
      }));
      disposables.add(quickPick.onDidHide(() => {
        if (!quickPick.ignoreFocusOut) {
          disposables.dispose();
          isClosed = true;
          if (!isResolved) {
            resolve3(false);
            isResolved = true;
          }
        }
      }));
      quickPick.show();
    });
  }
};

PromptFilePickers = __decorateClass([
  __decorateParam(0, IQuickInputService),
  __decorateParam(1, IOpenerService),
  __decorateParam(2, IFileService),
  __decorateParam(3, IDialogService),
  __decorateParam(4, ICommandService),
  __decorateParam(5, IInstantiationService),
  __decorateParam(6, IPromptsService),
  __decorateParam(7, ILabelService),
  __decorateParam(8, IProductService)
], PromptFilePickers);
export { newHelpButton, isHelpButton, isPromptFileItem, isExtensionPromptPath, NEW_PROMPT_FILE_OPTION, NEW_INSTRUCTIONS_FILE_OPTION, GENERATE_AGENT_INSTRUCTIONS_OPTION, GENERATE_ON_DEMAND_INSTRUCTIONS_OPTION, NEW_AGENT_FILE_OPTION, NEW_SKILL_FILE_OPTION, GENERATE_PROMPT_OPTION, GENERATE_SKILL_OPTION, GENERATE_AGENT_OPTION, EDIT_BUTTON, DELETE_BUTTON, RENAME_BUTTON, COPY_BUTTON, MAKE_VISIBLE_BUTTON, MAKE_INVISIBLE_BUTTON, RUN_IN_CHAT_BUTTON, PromptFilePickers };
