// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/contrib/colorPicker/browser/standaloneColorPicker/standaloneColorPickerActions.ts
import { EditorAction, EditorAction2 } from "./module-0097.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { MenuId } from "./module-0092.mjs";
import { StandaloneColorPickerController } from "./module-0658.mjs";
import { EditorContextKeys } from "./module-0154.mjs";


// src/vs/editor/contrib/colorPicker/browser/standaloneColorPicker/standaloneColorPickerActions.ts
var ShowOrFocusStandaloneColorPicker = class extends EditorAction2 {
  constructor() {
    super({
      id: "editor.action.showOrFocusStandaloneColorPicker",
      title: {
        ...localize2(1066, "Show or Focus Standalone Color Picker"),
        mnemonicTitle: localize(1065, null)
      },
      precondition: void 0,
      menu: [
        { id: MenuId.CommandPalette }
      ],
      metadata: {
        description: localize2(1067, "Show or focus a standalone color picker which uses the default color provider. It displays hex/rgb/hsl colors.")
      }
    });
  }
  runEditorCommand(_accessor, editor) {
    StandaloneColorPickerController.get(editor)?.showOrFocus();
  }
};

var HideStandaloneColorPicker = class extends EditorAction {
  constructor() {
    super({
      id: "editor.action.hideColorPicker",
      label: localize2(1061, "Hide the Color Picker"),
      precondition: EditorContextKeys.standaloneColorPickerVisible.isEqualTo(true),
      kbOpts: {
        primary: 9 /* Escape */,
        weight: 100 /* EditorContrib */
      },
      metadata: {
        description: localize2(1062, "Hide the standalone color picker.")
      }
    });
  }
  run(_accessor, editor) {
    StandaloneColorPickerController.get(editor)?.hide();
  }
};

var InsertColorWithStandaloneColorPicker = class extends EditorAction {
  constructor() {
    super({
      id: "editor.action.insertColorWithStandaloneColorPicker",
      label: localize2(1063, "Insert Color with Standalone Color Picker"),
      precondition: EditorContextKeys.standaloneColorPickerFocused.isEqualTo(true),
      kbOpts: {
        primary: 3 /* Enter */,
        weight: 100 /* EditorContrib */
      },
      metadata: {
        description: localize2(1064, "Insert hex/rgb/hsl colors with the focused standalone color picker.")
      }
    });
  }
  run(_accessor, editor) {
    StandaloneColorPickerController.get(editor)?.insertColor();
  }
};
export { ShowOrFocusStandaloneColorPicker, HideStandaloneColorPicker, InsertColorWithStandaloneColorPicker };
