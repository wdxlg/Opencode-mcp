// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/contrib/dropOrPasteInto/browser/copyPasteContribution.ts
import { EditorAction, EditorCommand, registerEditorAction, registerEditorCommand, registerEditorContribution } from "./module-0097.mjs";
import { CopyPasteController, changePasteTypeCommandId, pasteWidgetVisibleCtx } from "./module-0555.mjs";
import { registerEditorFeature } from "./module-0574.mjs";
import { DefaultPasteProvidersFeature, DefaultTextPasteOrDropEditProvider } from "./module-0543.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { EditorContextKeys } from "./module-0154.mjs";
import { HierarchicalKind } from "./module-0535.mjs";


// src/vs/editor/contrib/dropOrPasteInto/browser/copyPasteContribution.ts
var pasteAsCommandId = "editor.action.pasteAs";

registerEditorContribution(CopyPasteController.ID, CopyPasteController, 0 /* Eager */);

registerEditorFeature(DefaultPasteProvidersFeature);

registerEditorCommand(new class extends EditorCommand {
  constructor() {
    super({
      id: changePasteTypeCommandId,
      precondition: pasteWidgetVisibleCtx,
      kbOpts: {
        weight: 100 /* EditorContrib */,
        primary: 2048 /* CtrlCmd */ | 89 /* Period */
      }
    });
  }
  runEditorCommand(_accessor, editor) {
    return CopyPasteController.get(editor)?.changePasteType();
  }
}());

registerEditorCommand(new class extends EditorCommand {
  constructor() {
    super({
      id: "editor.hidePasteWidget",
      precondition: pasteWidgetVisibleCtx,
      kbOpts: {
        weight: 100 /* EditorContrib */,
        primary: 9 /* Escape */
      }
    });
  }
  runEditorCommand(_accessor, editor) {
    CopyPasteController.get(editor)?.clearWidgets();
  }
}());

registerEditorAction(class PasteAsAction extends EditorAction {
  static {
    this.argsSchema = {
      oneOf: [
        {
          type: "object",
          required: ["kind"],
          properties: {
            kind: {
              type: "string",
              description: localize(1090, null)
            }
          }
        },
        {
          type: "object",
          required: ["preferences"],
          properties: {
            preferences: {
              type: "array",
              description: localize(1091, null),
              items: { type: "string" }
            }
          }
        }
      ]
    };
  }
  constructor() {
    super({
      id: pasteAsCommandId,
      label: localize2(1089, "Paste As..."),
      precondition: EditorContextKeys.writable,
      metadata: {
        description: "Paste as",
        args: [{
          name: "args",
          schema: PasteAsAction.argsSchema
        }]
      },
      canTriggerInlineEdits: true
    });
  }
  run(_accessor, editor, args2) {
    let preference;
    if (args2) {
      if ("kind" in args2) {
        preference = { only: new HierarchicalKind(args2.kind) };
      } else if ("preferences" in args2) {
        preference = { preferences: args2.preferences.map((kind) => new HierarchicalKind(kind)) };
      }
    }
    return CopyPasteController.get(editor)?.pasteAs(preference);
  }
});

registerEditorAction(class extends EditorAction {
  constructor() {
    super({
      id: "editor.action.pasteAsText",
      label: localize2(1092, "Paste as Text"),
      precondition: EditorContextKeys.writable,
      canTriggerInlineEdits: true
    });
  }
  run(_accessor, editor) {
    return CopyPasteController.get(editor)?.pasteAs({ providerId: DefaultTextPasteOrDropEditProvider.id });
  }
});
export { pasteAsCommandId };
