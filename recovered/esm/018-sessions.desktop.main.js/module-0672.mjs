// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/contrib/dropOrPasteInto/browser/dropIntoEditorContribution.ts
import { EditorCommand, registerEditorCommand, registerEditorContribution } from "./module-0097.mjs";
import { DropIntoEditorController, changeDropTypeCommandId, dropWidgetVisibleCtx } from "./module-0671.mjs";
import { registerEditorFeature } from "./module-0574.mjs";
import { DefaultDropProvidersFeature } from "./module-0543.mjs";


// src/vs/editor/contrib/dropOrPasteInto/browser/dropIntoEditorContribution.ts
registerEditorContribution(DropIntoEditorController.ID, DropIntoEditorController, 2 /* BeforeFirstInteraction */);

registerEditorFeature(DefaultDropProvidersFeature);

registerEditorCommand(new class extends EditorCommand {
  constructor() {
    super({
      id: changeDropTypeCommandId,
      precondition: dropWidgetVisibleCtx,
      kbOpts: {
        weight: 100 /* EditorContrib */,
        primary: 2048 /* CtrlCmd */ | 89 /* Period */
      }
    });
  }
  runEditorCommand(_accessor, editor, _args) {
    DropIntoEditorController.get(editor)?.changeDropType();
  }
}());

registerEditorCommand(new class extends EditorCommand {
  constructor() {
    super({
      id: "editor.hideDropWidget",
      precondition: dropWidgetVisibleCtx,
      kbOpts: {
        weight: 100 /* EditorContrib */,
        primary: 9 /* Escape */
      }
    });
  }
  runEditorCommand(_accessor, editor, _args) {
    DropIntoEditorController.get(editor)?.clearWidgets();
  }
}());
export {};
