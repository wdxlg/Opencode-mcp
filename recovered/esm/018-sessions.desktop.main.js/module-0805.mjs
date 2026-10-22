// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/contrib/hover/browser/hoverActions.ts
import { EditorAction } from "./module-0097.mjs";
import { DECREASE_HOVER_VERBOSITY_ACTION_ID, DECREASE_HOVER_VERBOSITY_ACTION_LABEL, GO_TO_BOTTOM_HOVER_ACTION_ID, GO_TO_TOP_HOVER_ACTION_ID, HIDE_HOVER_ACTION_ID, INCREASE_HOVER_VERBOSITY_ACTION_ID, INCREASE_HOVER_VERBOSITY_ACTION_LABEL, PAGE_DOWN_HOVER_ACTION_ID, PAGE_UP_HOVER_ACTION_ID, SCROLL_DOWN_HOVER_ACTION_ID, SCROLL_LEFT_HOVER_ACTION_ID, SCROLL_RIGHT_HOVER_ACTION_ID, SCROLL_UP_HOVER_ACTION_ID, SHOW_DEFINITION_PREVIEW_HOVER_ACTION_ID, SHOW_OR_FOCUS_HOVER_ACTION_ID } from "./module-0579.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { EditorContextKeys } from "./module-0154.mjs";
import { KeyChord } from "./module-0019.mjs";
import { ContentHoverController } from "./module-0654.mjs";
import { Range2 } from "./module-0106.mjs";
import { GotoDefinitionAtPositionEditorContribution } from "./module-0802.mjs";


// src/vs/editor/contrib/hover/browser/hoverActions.ts
var HoverFocusBehavior = /* @__PURE__ */ ((HoverFocusBehavior2) => {
  HoverFocusBehavior2["NoAutoFocus"] = "noAutoFocus";
  HoverFocusBehavior2["FocusIfVisible"] = "focusIfVisible";
  HoverFocusBehavior2["AutoFocusImmediately"] = "autoFocusImmediately";
  return HoverFocusBehavior2;
})(HoverFocusBehavior || {});

var ShowOrFocusHoverAction = class extends EditorAction {
  constructor() {
    super({
      id: SHOW_OR_FOCUS_HOVER_ACTION_ID,
      label: localize2(1303, "Show or Focus Hover"),
      metadata: {
        description: localize2(1307, "Show or focus the editor hover which shows documentation, references, and other content for a symbol at the current cursor position."),
        args: [{
          name: "args",
          schema: {
            type: "object",
            properties: {
              "focus": {
                description: "Controls if and when the hover should take focus upon being triggered by this action.",
                enum: ["noAutoFocus" /* NoAutoFocus */, "focusIfVisible" /* FocusIfVisible */, "autoFocusImmediately" /* AutoFocusImmediately */],
                enumDescriptions: [
                  localize(1306, null),
                  localize(1305, null),
                  localize(1304, null)
                ],
                default: "focusIfVisible" /* FocusIfVisible */
              }
            }
          }
        }]
      },
      precondition: void 0,
      kbOpts: {
        kbExpr: EditorContextKeys.editorTextFocus,
        primary: KeyChord(2048 /* CtrlCmd */ | 41 /* KeyK */, 2048 /* CtrlCmd */ | 39 /* KeyI */),
        weight: 100 /* EditorContrib */
      }
    });
  }
  run(accessor, editor, args2) {
    if (!editor.hasModel()) {
      return;
    }
    const controller = ContentHoverController.get(editor);
    if (!controller) {
      return;
    }
    const focusArgument = args2?.focus;
    let focusOption = "focusIfVisible" /* FocusIfVisible */;
    if (Object.values(HoverFocusBehavior).includes(focusArgument)) {
      focusOption = focusArgument;
    } else if (typeof focusArgument === "boolean" && focusArgument) {
      focusOption = "autoFocusImmediately" /* AutoFocusImmediately */;
    }
    const showContentHover = (focus) => {
      const position2 = editor.getPosition();
      const range2 = new Range2(position2.lineNumber, position2.column, position2.lineNumber, position2.column);
      controller.showContentHover(range2, 1 /* Immediate */, 2 /* Keyboard */, focus);
    };
    const accessibilitySupportEnabled = editor.getOption(2 /* accessibilitySupport */) === 2 /* Enabled */;
    if (controller.isHoverVisible) {
      if (focusOption !== "noAutoFocus" /* NoAutoFocus */) {
        controller.focus();
      } else {
        showContentHover(accessibilitySupportEnabled);
      }
    } else {
      showContentHover(accessibilitySupportEnabled || focusOption === "autoFocusImmediately" /* AutoFocusImmediately */);
    }
  }
};

var ShowDefinitionPreviewHoverAction = class extends EditorAction {
  constructor() {
    super({
      id: SHOW_DEFINITION_PREVIEW_HOVER_ACTION_ID,
      label: localize2(1301, "Show Definition Preview Hover"),
      precondition: void 0,
      metadata: {
        description: localize2(1302, "Show the definition preview hover in the editor.")
      }
    });
  }
  run(accessor, editor) {
    const controller = ContentHoverController.get(editor);
    if (!controller) {
      return;
    }
    const position2 = editor.getPosition();
    if (!position2) {
      return;
    }
    const range2 = new Range2(position2.lineNumber, position2.column, position2.lineNumber, position2.column);
    const goto = GotoDefinitionAtPositionEditorContribution.get(editor);
    if (!goto) {
      return;
    }
    const promise = goto.startFindDefinitionFromCursor(position2);
    promise.then(() => {
      controller.showContentHover(range2, 1 /* Immediate */, 2 /* Keyboard */, true);
    });
  }
};

var HideContentHoverAction = class extends EditorAction {
  constructor() {
    super({
      id: HIDE_HOVER_ACTION_ID,
      label: localize2(1288, "Hide Hover"),
      alias: "Hide Content Hover",
      precondition: void 0
    });
  }
  run(accessor, editor) {
    ContentHoverController.get(editor)?.hideContentHover();
  }
};

var ScrollUpHoverAction = class extends EditorAction {
  constructor() {
    super({
      id: SCROLL_UP_HOVER_ACTION_ID,
      label: localize2(1299, "Scroll Up Hover"),
      precondition: EditorContextKeys.hoverFocused,
      kbOpts: {
        kbExpr: EditorContextKeys.hoverFocused,
        primary: 16 /* UpArrow */,
        weight: 100 /* EditorContrib */
      },
      metadata: {
        description: localize2(1300, "Scroll up the editor hover.")
      }
    });
  }
  run(accessor, editor) {
    const controller = ContentHoverController.get(editor);
    if (!controller) {
      return;
    }
    controller.scrollUp();
  }
};

var ScrollDownHoverAction = class extends EditorAction {
  constructor() {
    super({
      id: SCROLL_DOWN_HOVER_ACTION_ID,
      label: localize2(1293, "Scroll Down Hover"),
      precondition: EditorContextKeys.hoverFocused,
      kbOpts: {
        kbExpr: EditorContextKeys.hoverFocused,
        primary: 18 /* DownArrow */,
        weight: 100 /* EditorContrib */
      },
      metadata: {
        description: localize2(1294, "Scroll down the editor hover.")
      }
    });
  }
  run(accessor, editor) {
    const controller = ContentHoverController.get(editor);
    if (!controller) {
      return;
    }
    controller.scrollDown();
  }
};

var ScrollLeftHoverAction = class extends EditorAction {
  constructor() {
    super({
      id: SCROLL_LEFT_HOVER_ACTION_ID,
      label: localize2(1295, "Scroll Left Hover"),
      precondition: EditorContextKeys.hoverFocused,
      kbOpts: {
        kbExpr: EditorContextKeys.hoverFocused,
        primary: 15 /* LeftArrow */,
        weight: 100 /* EditorContrib */
      },
      metadata: {
        description: localize2(1296, "Scroll left the editor hover.")
      }
    });
  }
  run(accessor, editor) {
    const controller = ContentHoverController.get(editor);
    if (!controller) {
      return;
    }
    controller.scrollLeft();
  }
};

var ScrollRightHoverAction = class extends EditorAction {
  constructor() {
    super({
      id: SCROLL_RIGHT_HOVER_ACTION_ID,
      label: localize2(1297, "Scroll Right Hover"),
      precondition: EditorContextKeys.hoverFocused,
      kbOpts: {
        kbExpr: EditorContextKeys.hoverFocused,
        primary: 17 /* RightArrow */,
        weight: 100 /* EditorContrib */
      },
      metadata: {
        description: localize2(1298, "Scroll right the editor hover.")
      }
    });
  }
  run(accessor, editor) {
    const controller = ContentHoverController.get(editor);
    if (!controller) {
      return;
    }
    controller.scrollRight();
  }
};

var PageUpHoverAction = class extends EditorAction {
  constructor() {
    super({
      id: PAGE_UP_HOVER_ACTION_ID,
      label: localize2(1291, "Page Up Hover"),
      precondition: EditorContextKeys.hoverFocused,
      kbOpts: {
        kbExpr: EditorContextKeys.hoverFocused,
        primary: 11 /* PageUp */,
        secondary: [512 /* Alt */ | 16 /* UpArrow */],
        weight: 100 /* EditorContrib */
      },
      metadata: {
        description: localize2(1292, "Page up the editor hover.")
      }
    });
  }
  run(accessor, editor) {
    const controller = ContentHoverController.get(editor);
    if (!controller) {
      return;
    }
    controller.pageUp();
  }
};

var PageDownHoverAction = class extends EditorAction {
  constructor() {
    super({
      id: PAGE_DOWN_HOVER_ACTION_ID,
      label: localize2(1289, "Page Down Hover"),
      precondition: EditorContextKeys.hoverFocused,
      kbOpts: {
        kbExpr: EditorContextKeys.hoverFocused,
        primary: 12 /* PageDown */,
        secondary: [512 /* Alt */ | 18 /* DownArrow */],
        weight: 100 /* EditorContrib */
      },
      metadata: {
        description: localize2(1290, "Page down the editor hover.")
      }
    });
  }
  run(accessor, editor) {
    const controller = ContentHoverController.get(editor);
    if (!controller) {
      return;
    }
    controller.pageDown();
  }
};

var GoToTopHoverAction = class extends EditorAction {
  constructor() {
    super({
      id: GO_TO_TOP_HOVER_ACTION_ID,
      label: localize2(1286, "Go To Top Hover"),
      precondition: EditorContextKeys.hoverFocused,
      kbOpts: {
        kbExpr: EditorContextKeys.hoverFocused,
        primary: 14 /* Home */,
        secondary: [2048 /* CtrlCmd */ | 16 /* UpArrow */],
        weight: 100 /* EditorContrib */
      },
      metadata: {
        description: localize2(1287, "Go to the top of the editor hover.")
      }
    });
  }
  run(accessor, editor) {
    const controller = ContentHoverController.get(editor);
    if (!controller) {
      return;
    }
    controller.goToTop();
  }
};

var GoToBottomHoverAction = class extends EditorAction {
  constructor() {
    super({
      id: GO_TO_BOTTOM_HOVER_ACTION_ID,
      label: localize2(1284, "Go To Bottom Hover"),
      precondition: EditorContextKeys.hoverFocused,
      kbOpts: {
        kbExpr: EditorContextKeys.hoverFocused,
        primary: 13 /* End */,
        secondary: [2048 /* CtrlCmd */ | 18 /* DownArrow */],
        weight: 100 /* EditorContrib */
      },
      metadata: {
        description: localize2(1285, "Go to the bottom of the editor hover.")
      }
    });
  }
  run(accessor, editor) {
    const controller = ContentHoverController.get(editor);
    if (!controller) {
      return;
    }
    controller.goToBottom();
  }
};

var IncreaseHoverVerbosityLevel = class extends EditorAction {
  constructor() {
    super({
      id: INCREASE_HOVER_VERBOSITY_ACTION_ID,
      label: INCREASE_HOVER_VERBOSITY_ACTION_LABEL,
      alias: "Increase Hover Verbosity Level",
      precondition: EditorContextKeys.hoverVisible
    });
  }
  run(accessor, editor, args2) {
    const hoverController = ContentHoverController.get(editor);
    if (!hoverController) {
      return;
    }
    const index2 = args2?.index !== void 0 ? args2.index : hoverController.focusedHoverPartIndex();
    hoverController.updateHoverVerbosityLevel(0 /* Increase */, index2, args2?.focus);
  }
};

var DecreaseHoverVerbosityLevel = class extends EditorAction {
  constructor() {
    super({
      id: DECREASE_HOVER_VERBOSITY_ACTION_ID,
      label: DECREASE_HOVER_VERBOSITY_ACTION_LABEL,
      alias: "Decrease Hover Verbosity Level",
      precondition: EditorContextKeys.hoverVisible
    });
  }
  run(accessor, editor, args2) {
    const hoverController = ContentHoverController.get(editor);
    if (!hoverController) {
      return;
    }
    const index2 = args2?.index !== void 0 ? args2.index : hoverController.focusedHoverPartIndex();
    ContentHoverController.get(editor)?.updateHoverVerbosityLevel(1 /* Decrease */, index2, args2?.focus);
  }
};
export { HoverFocusBehavior, ShowOrFocusHoverAction, ShowDefinitionPreviewHoverAction, HideContentHoverAction, ScrollUpHoverAction, ScrollDownHoverAction, ScrollLeftHoverAction, ScrollRightHoverAction, PageUpHoverAction, PageDownHoverAction, GoToTopHoverAction, GoToBottomHoverAction, IncreaseHoverVerbosityLevel, DecreaseHoverVerbosityLevel };
