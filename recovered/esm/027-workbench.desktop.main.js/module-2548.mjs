// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/promptSyntax/skillActions.ts
import { Action2, registerAction2 } from "./module-0092.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { Codicon } from "./module-0085.mjs";
import { ChatContextKeys } from "./module-0965.mjs";
import { CHAT_CATEGORY } from "./module-1476.mjs";
import { IOpenerService } from "./module-0272.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { PromptFilePickers } from "./module-2165.mjs";


// src/vs/workbench/contrib/chat/browser/promptSyntax/skillActions.ts
var CONFIGURE_SKILLS_ACTION_ID = "workbench.action.chat.configure.skills";

var ManageSkillsAction = class extends Action2 {
  constructor() {
    super({
      id: CONFIGURE_SKILLS_ACTION_ID,
      title: localize2(11570, "Configure Skills..."),
      shortTitle: localize2(11571, "Skills"),
      icon: Codicon.lightbulb,
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
      11569,
      null
    );
    const result = await pickers.selectPromptFile({ placeholder, type: "skill" /* skill */, optionEdit: false });
    if (result !== void 0) {
      await openerService.open(result.promptFile);
    }
  }
};

function registerSkillActions() {
  registerAction2(ManageSkillsAction);
}
export { registerSkillActions, CONFIGURE_SKILLS_ACTION_ID, ManageSkillsAction };
