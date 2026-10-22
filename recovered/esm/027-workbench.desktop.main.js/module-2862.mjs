// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/widget/input/editor/editorHoverWrapper.ts
import { $, h } from "./module-0075.mjs";
import { HoverAction } from "./module-0469.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IKeybindingService } from "./module-0352.mjs";


// src/vs/workbench/contrib/chat/browser/widget/input/editor/editorHoverWrapper.ts
var $99 = $;

var h2 = h;

var ChatEditorHoverWrapper = class {
  constructor(hoverContentElement, actions, keybindingService) {
    this.keybindingService = keybindingService;
    const hoverElement = h2(
      ".chat-editor-hover-wrapper@root",
      [h2(".chat-editor-hover-wrapper-content@content")]
    );
    this.domNode = hoverElement.root;
    hoverElement.content.appendChild(hoverContentElement);
    if (actions && actions.length > 0) {
      const statusBarElement = $99(".hover-row.status-bar");
      const actionsElement = $99(".actions");
      actions.forEach((action) => {
        const keybinding = this.keybindingService.lookupKeybinding(action.commandId);
        const keybindingLabel2 = keybinding ? keybinding.getLabel() : null;
        HoverAction.render(actionsElement, {
          label: action.label,
          commandId: action.commandId,
          run: (e) => {
            action.run(e);
          },
          iconClass: action.iconClass
        }, keybindingLabel2);
      });
      statusBarElement.appendChild(actionsElement);
      this.domNode.appendChild(statusBarElement);
    }
  }
};

ChatEditorHoverWrapper = __decorateClass([
  __decorateParam(2, IKeybindingService)
], ChatEditorHoverWrapper);
export { $99, h2, ChatEditorHoverWrapper };
