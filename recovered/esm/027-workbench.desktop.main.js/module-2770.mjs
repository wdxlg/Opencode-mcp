// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/chatPetAchievementsEditorInput.ts
import { EditorInput } from "./module-0928.mjs";
import { localize } from "./module-0001.mjs";
import { Codicon } from "./module-0085.mjs";


// src/vs/workbench/contrib/chat/browser/chatPetAchievementsEditorInput.ts
var ChatPetAchievementsEditorInput = class _ChatPetAchievementsEditorInput extends EditorInput {
  constructor() {
    super(...arguments);
    this.resource = void 0;
  }
  static {
    this.ID = "workbench.editors.chatPetAchievements";
  }
  static getOrCreate() {
    if (!_ChatPetAchievementsEditorInput.instance || _ChatPetAchievementsEditorInput.instance.isDisposed()) {
      _ChatPetAchievementsEditorInput.instance = new _ChatPetAchievementsEditorInput();
    }
    return _ChatPetAchievementsEditorInput.instance;
  }
  get capabilities() {
    return super.capabilities | 8 /* Singleton */ | 2048 /* RequiresModal */;
  }
  get typeId() {
    return _ChatPetAchievementsEditorInput.ID;
  }
  getName() {
    return localize(11015, null);
  }
  getIcon() {
    return Codicon.starFull;
  }
  matches(otherInput) {
    return super.matches(otherInput) || otherInput instanceof _ChatPetAchievementsEditorInput;
  }
  getModalEditorOptions() {
    return { compactHeader: true };
  }
  async resolve() {
    return null;
  }
};
export { ChatPetAchievementsEditorInput };
