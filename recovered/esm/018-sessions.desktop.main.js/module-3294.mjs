// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/codeEditor/browser/editorFindAccessibilityHelp.ts
import { CONTEXT_FIND_WIDGET_FOCUSED } from "./module-0595.mjs";
import { ICodeEditorService } from "./module-0078.mjs";
import { CommonFindController } from "./module-0677.mjs";
import { Disposable } from "./module-0012.mjs";
import { localize } from "./module-0001.mjs";
import { isMacintosh } from "./module-0014.mjs";
import { AccessibleViewRegistry } from "./module-0693.mjs";


// src/vs/workbench/contrib/codeEditor/browser/editorFindAccessibilityHelp.ts
var EditorFindAccessibilityHelp = class {
  constructor() {
    this.priority = 105;
    this.name = "editor-find";
    this.when = CONTEXT_FIND_WIDGET_FOCUSED;
    this.type = "help" /* Help */;
  }
  /**
   * Creates an accessible view content provider for the active code editor's Find/Replace dialog.
   * @param accessor Service accessor for retrieving the code editor service
   * @returns The provider instance, or undefined if no active editor or find controller is found
   */
  getProvider(accessor) {
    const codeEditorService = accessor.get(ICodeEditorService);
    const codeEditor = codeEditorService.getActiveCodeEditor() || codeEditorService.getFocusedCodeEditor();
    if (!codeEditor) {
      return;
    }
    const findController = CommonFindController.get(codeEditor);
    if (!findController) {
      return;
    }
    return new EditorFindAccessibilityHelpProvider(findController);
  }
};

var EditorFindAccessibilityHelpProvider = class extends Disposable {
  constructor(_findController) {
    super();
    this._findController = _findController;
    this.id = "editorFindHelp" /* EditorFindHelp */;
    this.verbositySettingKey = "accessibility.verbosity.find" /* Find */;
    this.options = { type: "help" /* Help */ };
  }
  /**
   * Returns focus to the last focused element in the Find widget when the accessibility help is closed.
   * This handles focus restoration for any element (inputs, checkboxes, buttons) not just the text inputs.
   */
  onClose() {
    this._findController.focusLastElement();
  }
  /**
   * Generates the complete accessibility help content for Find and Replace.
   * The content structure varies based on whether Replace mode is visible:
   *
   * Replace Mode Content:
   * - Header identifying the dialog
   * - Context explaining what the dialog does
   * - Current search and replace status
   * - Focus behavior explanation
   * - Keyboard shortcuts for Find, Replace, and Editor contexts
   * - Find and Replace options explanation
   * - Configurable settings documentation
   * - Platform-specific settings (macOS)
   *
   * Find-Only Mode Content:
   * - Similar structure but without Replace-specific sections
   *
   * @returns The complete help text as a newline-joined string for audio announcement
   */
  provideContent() {
    const state = this._findController.getState();
    const isReplaceVisible = state.isReplaceRevealed;
    const searchString = state.searchString;
    const matchCount = state.matchesCount;
    const matchPosition = state.matchesPosition;
    const content = [];
    if (isReplaceVisible) {
      content.push(localize(13733, null));
      content.push(localize(13726, null));
      content.push("");
      content.push(localize(13782, null));
      if (searchString) {
        content.push(localize(13765, null, searchString));
        if (matchCount !== void 0 && matchPosition !== void 0) {
          if (matchCount === 0) {
            content.push(localize(13755, null));
          } else {
            content.push(localize(13754, null, matchPosition, matchCount));
          }
        }
      } else {
        content.push(localize(13757, null));
      }
      const replaceString = state.replaceString;
      if (replaceString) {
        content.push(localize(13764, null, replaceString));
      } else {
        content.push(localize(13756, null));
      }
      content.push("");
      content.push(localize(13728, null));
      content.push(localize(13727, null));
      content.push("");
      content.push(localize(13738, null));
      content.push(localize(13737, null));
      content.push(localize(13734, null));
      content.push(localize(13735, null));
      content.push(localize(13736, null));
      content.push("");
      content.push(localize(13732, null));
      content.push(localize(13729, null));
      content.push(localize(13730, null));
      content.push(localize(13731, null));
      content.push("");
      content.push(localize(13739, null));
      content.push("");
      content.push(localize(13743, null));
      content.push(localize(13740, null));
      content.push(localize(13749, null));
      content.push(localize(13751, null));
      content.push("");
      content.push(localize(13745, null));
      content.push(localize(13747, null));
      content.push(localize(13748, null, "<keybinding:editor.action.replaceOne>"));
      content.push(localize(13746, null, "<keybinding:editor.action.replaceAll>"));
      content.push("");
      content.push(localize(13742, null));
      content.push(localize(13741, null, "<keybinding:editor.action.nextMatchFindAction>"));
      content.push(localize(13750, null, "<keybinding:editor.action.previousMatchFindAction>"));
      content.push("");
      content.push(localize(13744, null));
      content.push("");
      content.push(localize(13762, null));
      content.push(localize(13758, null));
      content.push(localize(13763, null));
      content.push(localize(13760, null));
      content.push(localize(13761, null));
      content.push(localize(13759, null));
      content.push("");
      content.push(localize(13779, null, "<keybinding:workbench.action.openSettings>"));
      content.push(localize(13780, null));
      content.push(localize(13781, null));
      content.push(localize(13770, null));
      content.push(localize(13767, null));
      content.push(localize(13775, null));
      content.push(localize(13766, null));
      content.push(localize(13771, null));
      content.push(localize(13768, null));
      content.push(localize(13769, null));
      content.push(localize(13774, null));
      content.push(localize(13772, null));
      content.push(localize(13773, null));
      content.push(localize(13776, null));
      content.push(localize(13777, null));
      content.push(localize(13778, null));
      if (isMacintosh) {
        content.push("");
        content.push(localize(13753, null));
        content.push(localize(13752, null));
      }
      content.push("");
      content.push(localize(13725, null));
      content.push(localize(13724, null));
    } else {
      content.push(localize(13676, null));
      content.push(localize(13670, null));
      content.push("");
      content.push(localize(13723, null));
      if (searchString) {
        content.push(localize(13706, null, searchString));
        if (matchCount !== void 0 && matchPosition !== void 0) {
          if (matchCount === 0) {
            content.push(localize(13694, null));
          } else {
            content.push(localize(13693, null, matchPosition, matchCount));
          }
        }
      } else {
        content.push(localize(13695, null));
      }
      content.push("");
      content.push(localize(13672, null));
      content.push(localize(13671, null));
      content.push("");
      content.push(localize(13682, null));
      content.push(localize(13681, null));
      content.push(localize(13677, null));
      content.push(localize(13678, null));
      content.push(localize(13679, null));
      content.push(localize(13680, null));
      content.push("");
      content.push(localize(13704, null));
      content.push(localize(13702, null));
      content.push(localize(13703, null, "<keybinding:editor.action.nextMatchFindAction>"));
      content.push(localize(13705, null, "<keybinding:editor.action.previousMatchFindAction>"));
      content.push(localize(13701, null));
      content.push("");
      content.push(localize(13675, null));
      content.push(localize(13673, null));
      content.push(localize(13674, null));
      content.push("");
      content.push(localize(13683, null));
      content.push("");
      content.push(localize(13687, null));
      content.push(localize(13684, null));
      content.push(localize(13689, null));
      content.push("");
      content.push(localize(13686, null));
      content.push(localize(13685, null, "<keybinding:editor.action.nextMatchFindAction>"));
      content.push(localize(13690, null, "<keybinding:editor.action.previousMatchFindAction>"));
      content.push("");
      content.push(localize(13688, null));
      content.push("");
      content.push(localize(13699, null));
      content.push(localize(13696, null));
      content.push(localize(13700, null));
      content.push(localize(13697, null));
      content.push(localize(13698, null));
      content.push("");
      content.push(localize(13720, null, "<keybinding:workbench.action.openSettings>"));
      content.push(localize(13721, null));
      content.push(localize(13722, null));
      content.push(localize(13711, null));
      content.push(localize(13709, null));
      content.push(localize(13716, null));
      content.push(localize(13707, null));
      content.push(localize(13713, null));
      content.push(localize(13708, null));
      content.push(localize(13710, null));
      content.push(localize(13712, null));
      content.push(localize(13714, null));
      content.push(localize(13715, null));
      content.push(localize(13717, null));
      content.push(localize(13718, null));
      content.push(localize(13719, null));
      if (isMacintosh) {
        content.push("");
        content.push(localize(13692, null));
        content.push(localize(13691, null));
      }
      content.push("");
      content.push(localize(13669, null));
      content.push(localize(13668, null));
    }
    return content.join("\n");
  }
};

AccessibleViewRegistry.register(new EditorFindAccessibilityHelp());
export { EditorFindAccessibilityHelp, EditorFindAccessibilityHelpProvider };
