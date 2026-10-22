// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/chatOutlineCreator.ts
import { ChatEditor } from "./module-2539.mjs";
import { ChatOutline } from "./module-0981.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IOutlineService } from "./module-0972.mjs";


// src/vs/workbench/contrib/chat/browser/chatOutlineCreator.ts
var ChatOutlineCreator = class {
  static {
    this.ID = "chat.chatOutlineCreator";
  }
  constructor(outlineService) {
    const reg2 = outlineService.registerOutlineCreator(this);
    this.dispose = () => reg2.dispose();
  }
  matches(candidate) {
    return candidate instanceof ChatEditor;
  }
  async createOutline(editor, target, _token) {
    const widget = editor.widget;
    if (!widget) {
      return void 0;
    }
    return new ChatOutline(widget, target);
  }
};

ChatOutlineCreator = __decorateClass([
  __decorateParam(0, IOutlineService)
], ChatOutlineCreator);
export { ChatOutlineCreator };
