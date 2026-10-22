// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/promptSyntax/saveAsPromptFileActions.ts
import { Action2, MenuId } from "./module-0092.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { ICodeEditorService } from "./module-0078.mjs";
import { ITextFileService } from "./module-1064.mjs";
import { IFileService } from "./module-0269.mjs";
import { askForPromptSourceFolder } from "./module-2133.mjs";
import { askForPromptFileName } from "./module-2132.mjs";
import { getCleanPromptName } from "./module-0997.mjs";
import { joinPath } from "./module-0034.mjs";
import { Schemas } from "./module-0033.mjs";
import { CHAT_CATEGORY } from "./module-1475.mjs";
import { ContextKeyExpr } from "./module-0089.mjs";
import { ResourceContextKey } from "./module-0950.mjs";
import { chatEditingWidgetFileStateContextKey } from "./module-1082.mjs";
import { localize2 } from "./module-0001.mjs";
import { AGENT_LANGUAGE_ID, INSTRUCTIONS_LANGUAGE_ID, PROMPT_LANGUAGE_ID } from "./module-0986.mjs";


// src/vs/workbench/contrib/chat/browser/promptSyntax/saveAsPromptFileActions.ts
var BaseSaveAsPromptFileAction = class extends Action2 {
  constructor(opts, promptType) {
    super(opts);
    this.promptType = promptType;
  }
  async run(accessor, configUri) {
    const instantiationService = accessor.get(IInstantiationService);
    const codeEditorService = accessor.get(ICodeEditorService);
    const textFileService = accessor.get(ITextFileService);
    const fileService = accessor.get(IFileService);
    const activeCodeEditor = codeEditorService.getActiveCodeEditor();
    if (!activeCodeEditor) {
      return;
    }
    const model = activeCodeEditor.getModel();
    if (!model) {
      return;
    }
    const newFolder = await instantiationService.invokeFunction(askForPromptSourceFolder, this.promptType, void 0, true);
    if (!newFolder) {
      return;
    }
    const newName = await instantiationService.invokeFunction(askForPromptFileName, this.promptType, newFolder.uri, getCleanPromptName(model.uri));
    if (!newName) {
      return;
    }
    const newFile = joinPath(newFolder.uri, newName);
    if (model.uri.scheme === Schemas.untitled) {
      await textFileService.saveAs(model.uri, newFile, { from: model.uri });
    } else {
      await fileService.copy(model.uri, newFile);
    }
    await codeEditorService.openCodeEditor({ resource: newFile }, activeCodeEditor);
  }
};

function createOptions2(id2, title, description, languageId) {
  return {
    id: id2,
    title,
    metadata: {
      description
    },
    category: CHAT_CATEGORY,
    f1: false,
    menu: {
      id: MenuId.EditorContent,
      when: ContextKeyExpr.and(
        ContextKeyExpr.equals(ResourceContextKey.Scheme.key, Schemas.untitled),
        ContextKeyExpr.equals(ResourceContextKey.LangId.key, languageId),
        ContextKeyExpr.notEquals(chatEditingWidgetFileStateContextKey.key, 0 /* Modified */)
      )
    }
  };
}

var SAVE_AS_PROMPT_FILE_ACTION_ID = "workbench.action.chat.save-as-prompt";

var SaveAsPromptFileAction = class extends BaseSaveAsPromptFileAction {
  constructor() {
    super(createOptions2(SAVE_AS_PROMPT_FILE_ACTION_ID, localize2(11567, "Save As Prompt File"), localize2(11568, "Save as prompt file"), PROMPT_LANGUAGE_ID), "prompt" /* prompt */);
  }
};

var SAVE_AS_AGENT_FILE_ACTION_ID = "workbench.action.chat.save-as-agent";

var SaveAsAgentFileAction = class extends BaseSaveAsPromptFileAction {
  constructor() {
    super(createOptions2(SAVE_AS_AGENT_FILE_ACTION_ID, localize2(11563, "Save As Agent File"), localize2(11564, "Save as agent file"), AGENT_LANGUAGE_ID), "agent" /* agent */);
  }
};

var SAVE_AS_INSTRUCTIONS_FILE_ACTION_ID = "workbench.action.chat.save-as-instructions";

var SaveAsInstructionsFileAction = class extends BaseSaveAsPromptFileAction {
  constructor() {
    super(createOptions2(SAVE_AS_INSTRUCTIONS_FILE_ACTION_ID, localize2(11565, "Save As Instructions File"), localize2(11566, "Save as instructions file"), INSTRUCTIONS_LANGUAGE_ID), "instructions" /* instructions */);
  }
};
export { createOptions2, BaseSaveAsPromptFileAction, SAVE_AS_PROMPT_FILE_ACTION_ID, SaveAsPromptFileAction, SAVE_AS_AGENT_FILE_ACTION_ID, SaveAsAgentFileAction, SAVE_AS_INSTRUCTIONS_FILE_ACTION_ID, SaveAsInstructionsFileAction };
