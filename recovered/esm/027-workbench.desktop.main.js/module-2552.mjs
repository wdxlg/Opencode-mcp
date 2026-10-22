// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/promptSyntax/promptFileActions.ts
import { registerRunPromptActions } from "./module-2547.mjs";
import { registerAttachPromptActions } from "./module-2166.mjs";
import { registerSkillActions } from "./module-2548.mjs";
import { registerHookActions } from "./module-2550.mjs";
import { registerAction2 } from "./module-0092.mjs";
import { SaveAsAgentFileAction, SaveAsInstructionsFileAction, SaveAsPromptFileAction } from "./module-2551.mjs";
import { registerAgentActions } from "./module-2546.mjs";
import { registerNewPromptFileActions } from "./module-2161.mjs";


// src/vs/workbench/contrib/chat/browser/promptSyntax/promptFileActions.ts
function registerPromptActions() {
  registerRunPromptActions();
  registerAttachPromptActions();
  registerSkillActions();
  registerHookActions();
  registerAction2(SaveAsPromptFileAction);
  registerAction2(SaveAsInstructionsFileAction);
  registerAction2(SaveAsAgentFileAction);
  registerAgentActions();
  registerNewPromptFileActions();
}
export { registerPromptActions };
