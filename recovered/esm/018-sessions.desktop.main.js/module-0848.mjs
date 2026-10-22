// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/contrib/stickyScroll/browser/stickyScrollActions.ts
import { EditorAction2 } from "./module-0097.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { Categories } from "./module-0847.mjs";
import { ContextKeyExpr } from "./module-0089.mjs";
import { MenuId } from "./module-0092.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { StickyScrollController2 } from "./module-0770.mjs";
import { EditorContextKeys } from "./module-0154.mjs";


// src/vs/editor/contrib/stickyScroll/browser/stickyScrollActions.ts
var ToggleStickyScroll = class extends EditorAction2 {
  constructor() {
    super({
      id: "editor.action.toggleStickyScroll",
      title: {
        ...localize2(1639, "Toggle Editor Sticky Scroll"),
        mnemonicTitle: localize(1634, null)
      },
      metadata: {
        description: localize2(1640, "Toggle/enable the editor sticky scroll which shows the nested scopes at the top of the viewport")
      },
      category: Categories.View,
      toggled: {
        condition: ContextKeyExpr.equals("config.editor.stickyScroll.enabled", true),
        title: localize(1638, null),
        mnemonicTitle: localize(1633, null)
      },
      menu: [
        { id: MenuId.CommandPalette },
        { id: MenuId.MenubarAppearanceMenu, group: "4_editor", order: 3 },
        { id: MenuId.StickyScrollContext }
      ]
    });
  }
  async runEditorCommand(accessor, editor) {
    const configurationService = accessor.get(IConfigurationService);
    const newValue = !configurationService.getValue("editor.stickyScroll.enabled");
    const isFocused = StickyScrollController2.get(editor)?.isFocused();
    configurationService.updateValue("editor.stickyScroll.enabled", newValue);
    if (isFocused) {
      editor.focus();
    }
  }
};

var weight4 = 100 /* EditorContrib */;

var FocusStickyScroll = class extends EditorAction2 {
  constructor() {
    super({
      id: "editor.action.focusStickyScroll",
      title: {
        ...localize2(1630, "Focus Editor Sticky Scroll"),
        mnemonicTitle: localize(1632, null)
      },
      precondition: ContextKeyExpr.and(ContextKeyExpr.has("config.editor.stickyScroll.enabled"), EditorContextKeys.stickyScrollVisible),
      menu: [
        { id: MenuId.CommandPalette }
      ]
    });
  }
  runEditorCommand(_accessor, editor) {
    StickyScrollController2.get(editor)?.focus();
  }
};

var SelectNextStickyScrollLine = class extends EditorAction2 {
  constructor() {
    super({
      id: "editor.action.selectNextStickyScrollLine",
      title: localize2(1636, "Select the next editor sticky scroll line"),
      precondition: EditorContextKeys.stickyScrollFocused.isEqualTo(true),
      keybinding: {
        weight: weight4,
        primary: 18 /* DownArrow */
      }
    });
  }
  runEditorCommand(_accessor, editor) {
    StickyScrollController2.get(editor)?.focusNext();
  }
};

var SelectPreviousStickyScrollLine = class extends EditorAction2 {
  constructor() {
    super({
      id: "editor.action.selectPreviousStickyScrollLine",
      title: localize2(1637, "Select the previous sticky scroll line"),
      precondition: EditorContextKeys.stickyScrollFocused.isEqualTo(true),
      keybinding: {
        weight: weight4,
        primary: 16 /* UpArrow */
      }
    });
  }
  runEditorCommand(_accessor, editor) {
    StickyScrollController2.get(editor)?.focusPrevious();
  }
};

var GoToStickyScrollLine = class extends EditorAction2 {
  constructor() {
    super({
      id: "editor.action.goToFocusedStickyScrollLine",
      title: localize2(1631, "Go to the focused sticky scroll line"),
      precondition: EditorContextKeys.stickyScrollFocused.isEqualTo(true),
      keybinding: {
        weight: weight4,
        primary: 3 /* Enter */
      }
    });
  }
  runEditorCommand(_accessor, editor) {
    StickyScrollController2.get(editor)?.goToFocused();
  }
};

var SelectEditor = class extends EditorAction2 {
  constructor() {
    super({
      id: "editor.action.selectEditor",
      title: localize2(1635, "Select Editor"),
      precondition: EditorContextKeys.stickyScrollFocused.isEqualTo(true),
      keybinding: {
        weight: weight4,
        primary: 9 /* Escape */
      }
    });
  }
  runEditorCommand(_accessor, editor) {
    StickyScrollController2.get(editor)?.selectEditor();
  }
};
export { ToggleStickyScroll, weight4, FocusStickyScroll, SelectNextStickyScrollLine, SelectPreviousStickyScrollLine, GoToStickyScrollLine, SelectEditor };
