// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/promptSyntax/newPromptFileActions.ts
import { Action2, MenuId, registerAction2 } from "./module-0092.mjs";
import { ChatContextKeys } from "./module-0965.mjs";
import { CHAT_CATEGORY } from "./module-1476.mjs";
import { ILogService } from "./module-0095.mjs";
import { IOpenerService } from "./module-0272.mjs";
import { ICommandService } from "./module-0087.mjs";
import { INotificationService, Severity2 } from "./module-0336.mjs";
import { IUserDataSyncEnablementService } from "./module-1696.mjs";
import { IEditorService } from "./module-0934.mjs";
import { IFileService } from "./module-0269.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { askForPromptSourceFolder } from "./module-2160.mjs";
import { askForPromptFileName } from "./module-2159.mjs";
import { URI } from "./module-0032.mjs";
import { SKILL_FILENAME, VALID_SKILL_NAME_REGEX, getCleanPromptName } from "./module-0996.mjs";
import { getCodeEditor } from "./module-0223.mjs";
import { isEqual2 } from "./module-0034.mjs";
import { SnippetController2 } from "./module-0714.mjs";
import { getTarget } from "./module-1015.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { CONFIGURE_SYNC_COMMAND_ID } from "./module-1744.mjs";
import { IQuickInputService } from "./module-0536.mjs";
import { getLanguageIdForPromptsType } from "./module-0985.mjs";


// src/vs/workbench/contrib/chat/browser/promptSyntax/newPromptFileActions.ts
var AbstractNewPromptFileAction = class extends Action2 {
  constructor(id2, title, type) {
    super({
      id: id2,
      title,
      f1: false,
      precondition: ChatContextKeys.enabled,
      category: CHAT_CATEGORY,
      keybinding: {
        weight: 200 /* WorkbenchContrib */
      },
      menu: {
        id: MenuId.CommandPalette,
        when: ChatContextKeys.enabled
      }
    });
    this.type = type;
  }
  async run(accessor, options3) {
    const logService = accessor.get(ILogService);
    const openerService = accessor.get(IOpenerService);
    const commandService = accessor.get(ICommandService);
    const notificationService = accessor.get(INotificationService);
    const userDataSyncEnablementService = accessor.get(IUserDataSyncEnablementService);
    const editorService = accessor.get(IEditorService);
    const fileService = accessor.get(IFileService);
    const instaService = accessor.get(IInstantiationService);
    let folderUri;
    let storage;
    if (options3?.targetFolder) {
      folderUri = options3.targetFolder;
      storage = options3.targetStorage ?? "local" /* local */;
    } else {
      const selectedFolder = await instaService.invokeFunction(askForPromptSourceFolder, this.type);
      if (!selectedFolder) {
        return;
      }
      folderUri = selectedFolder.uri;
      storage = selectedFolder.storage;
    }
    const fileName = await instaService.invokeFunction(askForPromptFileName, this.type, folderUri, void 0, options3?.fileExtension);
    if (!fileName) {
      return;
    }
    await fileService.createFolder(folderUri);
    const promptUri = URI.joinPath(folderUri, fileName);
    await fileService.createFile(promptUri);
    const cleanName = getCleanPromptName(promptUri);
    let editor;
    if (options3?.openFile) {
      editor = await options3.openFile(promptUri);
    } else {
      await openerService.open(promptUri);
      editor = getCodeEditor(editorService.activeTextEditorControl);
    }
    if (editor && editor.hasModel() && isEqual2(editor.getModel().uri, promptUri)) {
      SnippetController2.get(editor)?.apply([{
        range: editor.getModel().getFullModelRange(),
        template: getDefaultContentSnippet(this.type, cleanName, getTarget(this.type, promptUri))
      }]);
    }
    if (storage !== "user") {
      return;
    }
    const isConfigured2 = userDataSyncEnablementService.isResourceEnablementConfigured("prompts" /* Prompts */);
    const isSettingsSyncEnabled = userDataSyncEnablementService.isEnabled();
    if (isConfigured2 === true || isSettingsSyncEnabled === false) {
      return;
    }
    notificationService.prompt(
      Severity2.Info,
      localize(
        11475,
        null
      ),
      [
        {
          label: localize(11473, null),
          run: () => {
            commandService.executeCommand(CONFIGURE_SYNC_COMMAND_ID).catch((error) => {
              logService.error(`Failed to run '${CONFIGURE_SYNC_COMMAND_ID}' command: ${error}.`);
            });
          }
        },
        {
          label: localize(11474, null),
          run: () => {
            openerService.open(URI.parse("https://aka.ms/vscode-settings-sync-help"));
          }
        }
      ],
      {
        neverShowAgain: {
          id: "workbench.command.prompts.create.user.enable-sync-notification",
          scope: 1 /* PROFILE */
        }
      }
    );
  }
};

function getDefaultContentSnippet(promptType, name, target) {
  switch (promptType) {
    case "prompt" /* prompt */:
      return [
        `---`,
        `name: ${name ?? "${1:prompt-name}"}`,
        `description: \${2:Describe when to use this prompt}`,
        `---`,
        ``,
        `<!-- Tip: Use /create-prompt in chat to generate content with agent assistance -->`,
        ``,
        `\${3:Define the prompt content here. You can include instructions, examples, and any other relevant information to guide the AI's responses.}`
      ].join("\n");
    case "instructions" /* instructions */:
      if (target === "claude" /* Claude */) {
        return [
          `---`,
          `description: \${1:Describe when these instructions should be loaded}`,
          `paths:`,
          `. - "src/**/*.ts"`,
          `---`,
          ``,
          `<!-- Tip: Use /create-instructions in chat to generate content with agent assistance -->`,
          ``,
          `\${2:Provide coding guidelines that AI should follow when generating code, answering questions, or reviewing changes.}`
        ].join("\n");
      } else {
        return [
          `---`,
          `description: \${1:Describe when these instructions should be loaded by the agent based on task context}`,
          `# applyTo: '\${1|**,**/*.ts|}' # when provided, instructions will automatically be added to the request context when the pattern matches an attached file`,
          `---`,
          ``,
          `<!-- Tip: Use /create-instructions in chat to generate content with agent assistance -->`,
          ``,
          `\${2:Provide project context and coding guidelines that AI should follow when generating code, answering questions, or reviewing changes.}`
        ].join("\n");
      }
    case "agent" /* agent */:
      if (target === "claude" /* Claude */) {
        return [
          `---`,
          `name: ${name ?? "${1:agent-name}"}`,
          `description: \${2:Describe what this custom agent does and when to use it.}`,
          `tools: Read, Grep, Glob, Bash # specify the tools this agent can use. If not set, all enabled tools are allowed.`,
          `---`,
          ``,
          `<!-- Tip: Use /create-agent in chat to generate content with agent assistance -->`,
          ``,
          `\${4:Define what this custom agent does, including its behavior, capabilities, and any specific instructions for its operation.}`
        ].join("\n");
      } else {
        return [
          `---`,
          `name: ${name ?? "${1:agent-name}"}`,
          `description: \${2:Describe what this custom agent does and when to use it.}`,
          `argument-hint: \${3:The inputs this agent expects, e.g., "a task to implement" or "a question to answer".}`,
          `# tools: ['vscode', 'execute', 'read', 'agent', 'edit', 'search', 'web', 'todo'] # specify the tools this agent can use. If not set, all enabled tools are allowed.`,
          `---`,
          ``,
          `<!-- Tip: Use /create-agent in chat to generate content with agent assistance -->`,
          ``,
          `\${4:Define what this custom agent does, including its behavior, capabilities, and any specific instructions for its operation.}`
        ].join("\n");
      }
    case "skill" /* skill */:
      return [
        `---`,
        `name: ${name ?? "${1:skill-name}"}`,
        `description: \${2:Describe what this skill does and when to use it. Include keywords that help agents identify relevant tasks.}`,
        `---`,
        ``,
        `<!-- Tip: Use /create-skill in chat to generate content with agent assistance -->`,
        ``,
        `\${3:Define the functionality provided by this skill, including detailed instructions and examples}`
      ].join("\n");
    default:
      throw new Error(`Unsupported prompt type: ${promptType}`);
  }
}

var NEW_PROMPT_COMMAND_ID = "workbench.command.new.prompt";

var NEW_INSTRUCTIONS_COMMAND_ID = "workbench.command.new.instructions";

var NEW_AGENT_COMMAND_ID = "workbench.command.new.agent";

var NEW_SKILL_COMMAND_ID = "workbench.command.new.skill";

var NewPromptFileAction = class extends AbstractNewPromptFileAction {
  constructor() {
    super(NEW_PROMPT_COMMAND_ID, localize(11463, null), "prompt" /* prompt */);
  }
};

var NewInstructionsFileAction = class extends AbstractNewPromptFileAction {
  constructor() {
    super(NEW_INSTRUCTIONS_COMMAND_ID, localize(11462, null), "instructions" /* instructions */);
  }
};

var NewAgentFileAction = class extends AbstractNewPromptFileAction {
  constructor() {
    super(NEW_AGENT_COMMAND_ID, localize(11461, null), "agent" /* agent */);
  }
};

var NewSkillFileAction = class extends Action2 {
  constructor() {
    super({
      id: NEW_SKILL_COMMAND_ID,
      title: localize(11464, null),
      f1: false,
      precondition: ChatContextKeys.enabled,
      category: CHAT_CATEGORY,
      keybinding: {
        weight: 200 /* WorkbenchContrib */
      },
      menu: {
        id: MenuId.CommandPalette,
        when: ChatContextKeys.enabled
      }
    });
  }
  async run(accessor, options3) {
    const openerService = accessor.get(IOpenerService);
    const editorService = accessor.get(IEditorService);
    const fileService = accessor.get(IFileService);
    const instaService = accessor.get(IInstantiationService);
    const quickInputService = accessor.get(IQuickInputService);
    let folderUri;
    if (options3?.targetFolder) {
      folderUri = options3.targetFolder;
    } else {
      const selectedFolder = await instaService.invokeFunction(askForPromptSourceFolder, "skill" /* skill */);
      if (!selectedFolder) {
        return;
      }
      folderUri = selectedFolder.uri;
    }
    const skillName = await quickInputService.input({
      prompt: localize(11469, null),
      placeHolder: localize(11468, null),
      validateInput: async (value2) => {
        if (!value2 || !value2.trim()) {
          return localize(11470, null);
        }
        const name = value2.trim();
        if (name.length > 64) {
          return localize(11471, null);
        }
        if (!VALID_SKILL_NAME_REGEX.test(name)) {
          return localize(11467, null);
        }
        if (name.startsWith("-") || name.endsWith("-")) {
          return localize(11466, null);
        }
        if (name.includes("--")) {
          return localize(11465, null);
        }
        return void 0;
      }
    });
    if (!skillName) {
      return;
    }
    const trimmedName = skillName.trim();
    const skillFolder = URI.joinPath(folderUri, trimmedName);
    await fileService.createFolder(skillFolder);
    const skillFileUri = URI.joinPath(skillFolder, SKILL_FILENAME);
    await fileService.createFile(skillFileUri);
    let editor;
    if (options3?.openFile) {
      editor = await options3.openFile(skillFileUri);
    } else {
      await openerService.open(skillFileUri);
      editor = getCodeEditor(editorService.activeTextEditorControl);
    }
    if (editor && editor.hasModel() && isEqual2(editor.getModel().uri, skillFileUri)) {
      SnippetController2.get(editor)?.apply([{
        range: editor.getModel().getFullModelRange(),
        template: getDefaultContentSnippet("skill" /* skill */, trimmedName, "undefined" /* Undefined */)
      }]);
    }
  }
};

var NewUntitledPromptFileAction = class extends Action2 {
  constructor() {
    super({
      id: "workbench.command.new.untitled.prompt",
      title: localize2(11472, "New Untitled Prompt File"),
      f1: true,
      precondition: ChatContextKeys.enabled,
      category: CHAT_CATEGORY,
      keybinding: {
        weight: 200 /* WorkbenchContrib */
      }
    });
  }
  async run(accessor) {
    const editorService = accessor.get(IEditorService);
    const languageId = getLanguageIdForPromptsType("prompt" /* prompt */);
    const input = await editorService.openEditor({
      resource: void 0,
      languageId,
      options: {
        pinned: true
      }
    });
    const type = "prompt" /* prompt */;
    const editor = getCodeEditor(editorService.activeTextEditorControl);
    if (editor && editor.hasModel()) {
      SnippetController2.get(editor)?.apply([{
        range: editor.getModel().getFullModelRange(),
        template: getDefaultContentSnippet(type, void 0, "undefined" /* Undefined */)
      }]);
    }
    return input;
  }
};

function registerNewPromptFileActions() {
  registerAction2(NewPromptFileAction);
  registerAction2(NewInstructionsFileAction);
  registerAction2(NewAgentFileAction);
  registerAction2(NewSkillFileAction);
  registerAction2(NewUntitledPromptFileAction);
}
export { getDefaultContentSnippet, registerNewPromptFileActions, AbstractNewPromptFileAction, NEW_PROMPT_COMMAND_ID, NEW_INSTRUCTIONS_COMMAND_ID, NEW_AGENT_COMMAND_ID, NEW_SKILL_COMMAND_ID, NewPromptFileAction, NewInstructionsFileAction, NewAgentFileAction, NewSkillFileAction, NewUntitledPromptFileAction };
