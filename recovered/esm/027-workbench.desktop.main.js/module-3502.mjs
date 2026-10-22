// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/codeEditor/browser/accessibility/accessibility.ts
import { Action2, registerAction2 } from "./module-0092.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { accessibilityHelpIsShown } from "./module-1370.mjs";
import { CONTEXT_ACCESSIBILITY_MODE_ENABLED, IAccessibilityService } from "./module-0104.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { alert } from "./module-0076.mjs";
import { AccessibilityHelpNLS } from "./module-0867.mjs";
import { ContextKeyExpr } from "./module-0089.mjs";
import { EditorContextKeys } from "./module-0154.mjs";
import { ICodeEditorService } from "./module-0078.mjs";
import { CursorColumns } from "./module-0110.mjs";


// src/vs/workbench/contrib/codeEditor/browser/accessibility/accessibility.ts
var ToggleScreenReaderMode = class extends Action2 {
  constructor() {
    super({
      id: "editor.action.toggleScreenReaderAccessibilityMode",
      title: localize2(13653, "Toggle Screen Reader Accessibility Mode"),
      metadata: {
        description: localize2(13654, "Toggles an optimized mode for usage with screen readers, braille devices, and other assistive technologies.")
      },
      f1: true,
      keybinding: [
        {
          primary: 2048 /* CtrlCmd */ | 35 /* KeyE */,
          weight: 200 /* WorkbenchContrib */ + 10,
          when: accessibilityHelpIsShown
        },
        {
          primary: 512 /* Alt */ | 59 /* F1 */ | 1024 /* Shift */,
          linux: { primary: 512 /* Alt */ | 62 /* F4 */ | 1024 /* Shift */ },
          weight: 200 /* WorkbenchContrib */ + 10
        }
      ]
    });
  }
  async run(accessor) {
    const accessibiiltyService = accessor.get(IAccessibilityService);
    const configurationService = accessor.get(IConfigurationService);
    const isScreenReaderOptimized = accessibiiltyService.isScreenReaderOptimized();
    configurationService.updateValue("editor.accessibilitySupport", isScreenReaderOptimized ? "off" : "on", 2 /* USER */);
    alert(isScreenReaderOptimized ? AccessibilityHelpNLS.screenReaderModeDisabled : AccessibilityHelpNLS.screenReaderModeEnabled);
  }
};

registerAction2(ToggleScreenReaderMode);

var AnnounceCursorPosition = class extends Action2 {
  constructor() {
    super({
      id: "editor.action.announceCursorPosition",
      title: localize2(13650, "Announce Cursor Position"),
      f1: true,
      metadata: {
        description: localize2(13651, "Announce the current cursor position (line and column) via screen reader.")
      },
      keybinding: {
        primary: 2048 /* CtrlCmd */ | 512 /* Alt */ | 1024 /* Shift */ | 37 /* KeyG */,
        weight: 200 /* WorkbenchContrib */ + 10,
        when: ContextKeyExpr.and(EditorContextKeys.editorTextFocus, CONTEXT_ACCESSIBILITY_MODE_ENABLED)
      }
    });
  }
  async run(accessor) {
    const codeEditorService = accessor.get(ICodeEditorService);
    const editor = codeEditorService.getFocusedCodeEditor();
    if (!editor) {
      return;
    }
    const position2 = editor.getPosition();
    const model = editor.getModel();
    if (!position2 || !model) {
      return;
    }
    const tabSize = model.getOptions().tabSize;
    const lineContent = model.getLineContent(position2.lineNumber);
    const visibleColumn = CursorColumns.visibleColumnFromColumn(lineContent, position2.column, tabSize) + 1;
    alert(localize(13652, null, position2.lineNumber, visibleColumn));
  }
};

registerAction2(AnnounceCursorPosition);
export { ToggleScreenReaderMode, AnnounceCursorPosition };
