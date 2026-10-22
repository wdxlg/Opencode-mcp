// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/promptSyntax/runPromptAction.ts
import { ContextKeyExpr } from "./module-0089.mjs";
import { ChatContextKeys } from "./module-0966.mjs";
import { ResourceContextKey } from "./module-0950.mjs";
import { PROMPT_LANGUAGE_ID } from "./module-0986.mjs";
import { Action2, MenuId, registerAction2 } from "./module-0092.mjs";
import { ACTION_ID_NEW_CHAT, CHAT_CATEGORY } from "./module-1475.mjs";
import { EditorContextKeys } from "./module-0154.mjs";
import { ICommandService } from "./module-0087.mjs";
import { IPromptsService } from "./module-0987.mjs";
import { IChatWidgetService } from "./module-0982.mjs";
import { assertDefined } from "./module-0010.mjs";
import { CancellationToken } from "./module-0025.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { Codicon } from "./module-0085.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { PromptFilePickers } from "./module-2138.mjs";
import { UILabelProvider } from "./module-0504.mjs";
import { OS } from "./module-0014.mjs";
import { IOpenerService } from "./module-0272.mjs";
import { ICodeEditorService } from "./module-0078.mjs";


// src/vs/workbench/contrib/chat/browser/promptSyntax/runPromptAction.ts
var EDITOR_ACTIONS_CONDITION = ContextKeyExpr.and(
  ChatContextKeys.enabled,
  ResourceContextKey.HasResource,
  ResourceContextKey.LangId.isEqualTo(PROMPT_LANGUAGE_ID)
);

var COMMAND_KEY_BINDING = 256 /* WinCtrl */ | 90 /* Slash */ | 512 /* Alt */;

var RUN_CURRENT_PROMPT_ACTION_ID = "workbench.action.chat.run.prompt.current";

var RUN_SELECTED_PROMPT_ACTION_ID = "workbench.action.chat.run.prompt";

var CONFIGURE_PROMPTS_ACTION_ID = "workbench.action.chat.configure.prompts";

var RunPromptBaseAction = class extends Action2 {
  constructor(options3) {
    super({
      id: options3.id,
      title: options3.title,
      f1: false,
      precondition: ChatContextKeys.enabled,
      category: CHAT_CATEGORY,
      icon: options3.icon,
      keybinding: {
        when: ContextKeyExpr.and(
          EditorContextKeys.editorTextFocus,
          EDITOR_ACTIONS_CONDITION
        ),
        weight: 200 /* WorkbenchContrib */,
        primary: options3.keybinding
      },
      menu: [
        {
          id: MenuId.EditorTitleRun,
          group: "navigation",
          order: options3.alt ? 0 : 1,
          alt: options3.alt,
          when: EDITOR_ACTIONS_CONDITION
        }
      ]
    });
  }
  /**
   * Executes the run prompt action with provided options.
   */
  async execute(resource, inNewChat, accessor) {
    const commandService = accessor.get(ICommandService);
    const promptsService = accessor.get(IPromptsService);
    const widgetService = accessor.get(IChatWidgetService);
    resource ||= getActivePromptFileUri(accessor);
    assertDefined(
      resource,
      "Cannot find URI resource for an active text editor."
    );
    if (inNewChat === true) {
      await commandService.executeCommand(ACTION_ID_NEW_CHAT);
    }
    const widget = await widgetService.revealWidget();
    if (widget) {
      widget.setInput(`/${await promptsService.getPromptSlashCommandName(resource, CancellationToken.None)}`);
      await widget.acceptInput();
    }
    return widget;
  }
};

var RUN_CURRENT_PROMPT_ACTION_TITLE = localize2(
  11561,
  "Run Prompt in Current Chat"
);

var RUN_CURRENT_PROMPT_ACTION_ICON = Codicon.playCircle;

var RunCurrentPromptAction = class extends RunPromptBaseAction {
  constructor() {
    super({
      id: RUN_CURRENT_PROMPT_ACTION_ID,
      title: RUN_CURRENT_PROMPT_ACTION_TITLE,
      icon: RUN_CURRENT_PROMPT_ACTION_ICON,
      keybinding: COMMAND_KEY_BINDING
    });
  }
  async run(accessor, resource) {
    return await super.execute(
      resource,
      false,
      accessor
    );
  }
};

var RunSelectedPromptAction = class extends Action2 {
  constructor() {
    super({
      id: RUN_SELECTED_PROMPT_ACTION_ID,
      title: localize2(11562, "Run Prompt..."),
      icon: Codicon.bookmark,
      f1: true,
      precondition: ChatContextKeys.enabled,
      keybinding: {
        when: ChatContextKeys.enabled,
        weight: 200 /* WorkbenchContrib */,
        primary: COMMAND_KEY_BINDING
      },
      category: CHAT_CATEGORY
    });
  }
  async run(accessor) {
    const commandService = accessor.get(ICommandService);
    const instaService = accessor.get(IInstantiationService);
    const promptsService = accessor.get(IPromptsService);
    const widgetService = accessor.get(IChatWidgetService);
    const pickers = instaService.createInstance(PromptFilePickers);
    const placeholder = localize(
      11557,
      null,
      UILabelProvider.modifierLabels[OS].ctrlKey
    );
    const result = await pickers.selectPromptFile({ placeholder, type: "prompt" /* prompt */ });
    if (result === void 0) {
      return;
    }
    const { promptFile, keyMods } = result;
    if (keyMods.ctrlCmd === true) {
      await commandService.executeCommand(ACTION_ID_NEW_CHAT);
    }
    const widget = await widgetService.revealWidget();
    if (widget) {
      widget.setInput(`/${await promptsService.getPromptSlashCommandName(promptFile, CancellationToken.None)}`);
      await widget.acceptInput();
      widget.focusInput();
    }
  }
};

var ManagePromptFilesAction = class extends Action2 {
  constructor() {
    super({
      id: CONFIGURE_PROMPTS_ACTION_ID,
      title: localize2(11558, "Configure Prompt Files..."),
      shortTitle: localize2(11559, "Prompt Files"),
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
      11556,
      null
    );
    const result = await pickers.selectPromptFile({ placeholder, type: "prompt" /* prompt */, optionEdit: false });
    if (result !== void 0) {
      await openerService.open(result.promptFile);
    }
  }
};

function getActivePromptFileUri(accessor) {
  const codeEditorService = accessor.get(ICodeEditorService);
  const model = codeEditorService.getActiveCodeEditor()?.getModel();
  if (model?.getLanguageId() === PROMPT_LANGUAGE_ID) {
    return model.uri;
  }
  return void 0;
}

var RUN_CURRENT_PROMPT_IN_NEW_CHAT_ACTION_ID = "workbench.action.chat.run-in-new-chat.prompt.current";

var RUN_IN_NEW_CHAT_ACTION_TITLE = localize2(
  11560,
  "Run Prompt In New Chat"
);

var RUN_IN_NEW_CHAT_ACTION_ICON = Codicon.play;

var RunCurrentPromptInNewChatAction = class extends RunPromptBaseAction {
  constructor() {
    super({
      id: RUN_CURRENT_PROMPT_IN_NEW_CHAT_ACTION_ID,
      title: RUN_IN_NEW_CHAT_ACTION_TITLE,
      icon: RUN_IN_NEW_CHAT_ACTION_ICON,
      keybinding: COMMAND_KEY_BINDING | 2048 /* CtrlCmd */,
      alt: {
        id: RUN_CURRENT_PROMPT_ACTION_ID,
        title: RUN_CURRENT_PROMPT_ACTION_TITLE,
        icon: RUN_CURRENT_PROMPT_ACTION_ICON
      }
    });
  }
  async run(accessor, resource) {
    return await super.execute(
      resource,
      true,
      accessor
    );
  }
};

function registerRunPromptActions() {
  registerAction2(RunCurrentPromptInNewChatAction);
  registerAction2(RunCurrentPromptAction);
  registerAction2(RunSelectedPromptAction);
  registerAction2(ManagePromptFilesAction);
}
export { getActivePromptFileUri, registerRunPromptActions, EDITOR_ACTIONS_CONDITION, COMMAND_KEY_BINDING, RUN_CURRENT_PROMPT_ACTION_ID, RUN_SELECTED_PROMPT_ACTION_ID, CONFIGURE_PROMPTS_ACTION_ID, RunPromptBaseAction, RUN_CURRENT_PROMPT_ACTION_TITLE, RUN_CURRENT_PROMPT_ACTION_ICON, RunCurrentPromptAction, RunSelectedPromptAction, ManagePromptFilesAction, RUN_CURRENT_PROMPT_IN_NEW_CHAT_ACTION_ID, RUN_IN_NEW_CHAT_ACTION_TITLE, RUN_IN_NEW_CHAT_ACTION_ICON, RunCurrentPromptInNewChatAction };
