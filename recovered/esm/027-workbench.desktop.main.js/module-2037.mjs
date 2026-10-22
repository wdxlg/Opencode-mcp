// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/actions/configureVoiceInstructionsAction.ts
import { Action2, MenuId, registerAction2 } from "./module-0092.mjs";
import { ChatContextKeys } from "./module-0965.mjs";
import { IPathService } from "./module-0938.mjs";
import { IWorkspaceContextService } from "./module-0509.mjs";
import { IWorkspaceTrustManagementService } from "./module-0854.mjs";
import { IQuickInputService } from "./module-0536.mjs";
import { IFileService } from "./module-0269.mjs";
import { IEditorService } from "./module-0934.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { dirname2, joinPath } from "./module-0034.mjs";
import { COPILOT_CONFIG_FOLDER, DICTATION_INSTRUCTIONS_FILENAME, GITHUB_CONFIG_FOLDER, VOICE_INSTRUCTIONS_FILENAME } from "./module-0996.mjs";


// src/vs/workbench/contrib/chat/browser/actions/configureVoiceInstructionsAction.ts
var CONFIGURE_VOICE_INSTRUCTIONS_ACTION_ID = "workbench.action.chat.configureVoiceInstructions";

var CONFIGURE_DICTATION_INSTRUCTIONS_ACTION_ID = "workbench.action.chat.configureDictationInstructions";

var ConfigureSpeechInstructionsAction = class extends Action2 {
  constructor(id2, title, fileName) {
    super({
      id: id2,
      title,
      precondition: ChatContextKeys.enabled,
      f1: false,
      menu: {
        id: MenuId.CommandPalette,
        when: ChatContextKeys.enabled
      }
    });
    this.fileName = fileName;
  }
  async run(accessor) {
    const pathService = accessor.get(IPathService);
    const workspaceContextService = accessor.get(IWorkspaceContextService);
    const workspaceTrustService = accessor.get(IWorkspaceTrustManagementService);
    const quickInputService = accessor.get(IQuickInputService);
    const fileService = accessor.get(IFileService);
    const editorService = accessor.get(IEditorService);
    const userHome = await pathService.userHome();
    const items = [{
      label: localize(8838, null),
      description: `~/.copilot/${this.fileName}`,
      detail: localize(8839, null),
      resource: joinPath(userHome, COPILOT_CONFIG_FOLDER, this.fileName)
    }];
    const workspaceFolders = workspaceContextService.getWorkspace().folders;
    if (workspaceTrustService.isWorkspaceTrusted()) {
      for (const folder of workspaceFolders) {
        items.push({
          label: workspaceFolders.length === 1 ? localize(8840, null) : localize(8842, null, folder.name),
          description: `.github/${this.fileName}`,
          detail: localize(8841, null),
          resource: joinPath(folder.uri, GITHUB_CONFIG_FOLDER, this.fileName)
        });
      }
    }
    const selected = await quickInputService.pick(items, {
      placeHolder: workspaceFolders.length > 0 && !workspaceTrustService.isWorkspaceTrusted() ? localize(8837, null, this.fileName) : localize(8836, null, this.fileName),
      matchOnDescription: true,
      matchOnDetail: true
    });
    if (!selected) {
      return;
    }
    if (!await fileService.exists(selected.resource)) {
      await fileService.createFolder(dirname2(selected.resource));
      await fileService.createFile(selected.resource);
    }
    await editorService.openEditor({ resource: selected.resource });
  }
};

function registerConfigureSpeechInstructionsActions() {
  registerAction2(class extends ConfigureSpeechInstructionsAction {
    constructor() {
      super(
        CONFIGURE_VOICE_INSTRUCTIONS_ACTION_ID,
        localize2(8835, "Voice: Configure Voice Mode Instructions"),
        VOICE_INSTRUCTIONS_FILENAME
      );
    }
  });
  registerAction2(class extends ConfigureSpeechInstructionsAction {
    constructor() {
      super(
        CONFIGURE_DICTATION_INSTRUCTIONS_ACTION_ID,
        localize2(8834, "Voice: Configure Dictation Instructions"),
        DICTATION_INSTRUCTIONS_FILENAME
      );
    }
  });
}
export { registerConfigureSpeechInstructionsActions, CONFIGURE_VOICE_INSTRUCTIONS_ACTION_ID, CONFIGURE_DICTATION_INSTRUCTIONS_ACTION_ID, ConfigureSpeechInstructionsAction };
