// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/promptSyntax/attachInstructionsAction.ts
import { Action2, registerAction2 } from "./module-0092.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { Codicon } from "./module-0085.mjs";
import { ChatContextKeys } from "./module-0965.mjs";
import { CHAT_CATEGORY } from "./module-1476.mjs";
import { IOpenerService } from "./module-0272.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { PromptFilePickers } from "./module-2165.mjs";
import { CancellationToken } from "./module-0025.mjs";
import { compare } from "./module-0030.mjs";
import { getCleanPromptName } from "./module-0996.mjs";
import { toPromptFileVariableEntry } from "./module-0979.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IPromptsService } from "./module-0986.mjs";


// src/vs/workbench/contrib/chat/browser/promptSyntax/attachInstructionsAction.ts
var ATTACH_INSTRUCTIONS_ACTION_ID = "workbench.action.chat.attach.instructions";

var CONFIGURE_INSTRUCTIONS_ACTION_ID = "workbench.action.chat.configure.instructions";

var ManageInstructionsFilesAction = class extends Action2 {
  constructor() {
    super({
      id: CONFIGURE_INSTRUCTIONS_ACTION_ID,
      title: localize2(11427, "Configure Instructions & Rules..."),
      shortTitle: localize2(11428, "Instructions & Rules"),
      icon: Codicon.bookmark,
      f1: true,
      precondition: ChatContextKeys.enabled,
      category: CHAT_CATEGORY
    });
  }
  async run(accessor) {
    const openerService = accessor.get(IOpenerService);
    const instaService = accessor.get(IInstantiationService);
    const pickers = instaService.createInstance(PromptFilePickers);
    const placeholder = localize(
      11426,
      null
    );
    const result = await pickers.selectPromptFile({ placeholder, type: "instructions" /* instructions */, optionEdit: false });
    if (result !== void 0) {
      await openerService.open(result.promptFile);
    }
  }
};

function registerAttachPromptActions() {
  registerAction2(ManageInstructionsFilesAction);
}

var ChatInstructionsPickerPick = class {
  constructor(promptsService) {
    this.promptsService = promptsService;
    this.type = "pickerPick";
    this.label = localize(11425, null);
    this.icon = Codicon.bookmark;
    this.commandId = ATTACH_INSTRUCTIONS_ACTION_ID;
  }
  isEnabled(widget) {
    return !!widget.attachmentCapabilities.supportsInstructionAttachments;
  }
  asPicker() {
    const picks = this.promptsService.listPromptFiles("instructions" /* instructions */, CancellationToken.None).then((value2) => {
      const result = [];
      value2 = value2.slice(0).sort((a, b) => compare(a.storage, b.storage));
      let storageType;
      for (const promptsPath of value2) {
        if (storageType !== promptsPath.storage) {
          storageType = promptsPath.storage;
          result.push({
            type: "separator",
            label: this.promptsService.getPromptLocationLabel(promptsPath)
          });
        }
        result.push({
          label: promptsPath.name ?? getCleanPromptName(promptsPath.uri),
          asAttachment: () => {
            return toPromptFileVariableEntry(promptsPath.uri, "vscode.instructions.file.root" /* Instruction */);
          }
        });
      }
      return result;
    });
    return {
      placeholder: localize(11430, null),
      picks,
      configure: {
        label: localize(11429, null),
        commandId: CONFIGURE_INSTRUCTIONS_ACTION_ID
      }
    };
  }
};

ChatInstructionsPickerPick = __decorateClass([
  __decorateParam(0, IPromptsService)
], ChatInstructionsPickerPick);
export { registerAttachPromptActions, ATTACH_INSTRUCTIONS_ACTION_ID, CONFIGURE_INSTRUCTIONS_ACTION_ID, ManageInstructionsFilesAction, ChatInstructionsPickerPick };
