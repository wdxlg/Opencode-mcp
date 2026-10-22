// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/terminal/common/terminalContextKey.ts
import { ContextKeyExpr, RawContextKey } from "./module-0089.mjs";
import { localize } from "./module-0001.mjs";
import { TERMINAL_VIEW_ID } from "./module-1174.mjs";
import { TerminalContribContextKeyStrings } from "./module-1173.mjs";


// src/vs/workbench/contrib/terminal/common/terminalContextKey.ts
var TerminalContextKeys;

((TerminalContextKeys2) => {
  TerminalContextKeys2.isOpen = new RawContextKey("terminalIsOpen" /* IsOpen */, false, true);
  TerminalContextKeys2.focus = new RawContextKey("terminalFocus" /* Focus */, false, localize(20328, null));
  TerminalContextKeys2.focusInAny = new RawContextKey("terminalFocusInAny" /* FocusInAny */, false, localize(20329, null));
  TerminalContextKeys2.editorFocus = new RawContextKey("terminalEditorFocus" /* EditorFocus */, false, localize(20327, null));
  TerminalContextKeys2.count = new RawContextKey("terminalCount" /* Count */, 0, localize(20326, null));
  TerminalContextKeys2.groupCount = new RawContextKey("terminalGroupCount" /* GroupCount */, 0, true);
  TerminalContextKeys2.tabsNarrow = new RawContextKey("isTerminalTabsNarrow" /* TabsNarrow */, false, true);
  TerminalContextKeys2.terminalHasFixedWidth = new RawContextKey("terminalHasFixedWidth" /* HasFixedWidth */, false, true);
  TerminalContextKeys2.tabsFocus = new RawContextKey("terminalTabsFocus" /* TabsFocus */, false, localize(20334, null));
  TerminalContextKeys2.webExtensionContributedProfile = new RawContextKey("terminalWebExtensionContributedProfile" /* WebExtensionContributedProfile */, false, true);
  TerminalContextKeys2.terminalHasBeenCreated = new RawContextKey("terminalHasBeenCreated" /* TerminalHasBeenCreated */, false, true);
  TerminalContextKeys2.terminalEditorActive = new RawContextKey("terminalEditorActive" /* TerminalEditorActive */, false, true);
  TerminalContextKeys2.tabsMouse = new RawContextKey("terminalTabsMouse" /* TabsMouse */, false, true);
  TerminalContextKeys2.shellType = new RawContextKey("terminalShellType" /* ShellType */, void 0, { type: "string", description: localize(20332, null) });
  TerminalContextKeys2.altBufferActive = new RawContextKey("terminalAltBufferActive" /* AltBufferActive */, false, localize(20325, null));
  TerminalContextKeys2.suggestWidgetVisible = new RawContextKey("terminalSuggestWidgetVisible" /* SuggestWidgetVisible */, false, localize(20333, null));
  TerminalContextKeys2.notFocus = TerminalContextKeys2.focus.toNegated();
  TerminalContextKeys2.viewShowing = new RawContextKey("terminalViewShowing" /* ViewShowing */, false, localize(20338, null));
  TerminalContextKeys2.textSelected = new RawContextKey("terminalTextSelected" /* TextSelected */, false, localize(20336, null));
  TerminalContextKeys2.textSelectedInFocused = new RawContextKey("terminalTextSelectedInFocused" /* TextSelectedInFocused */, false, localize(20337, null));
  TerminalContextKeys2.notTextSelected = TerminalContextKeys2.textSelected.toNegated();
  TerminalContextKeys2.findVisible = new RawContextKey("terminalFindVisible" /* FindVisible */, false, true);
  TerminalContextKeys2.notFindVisible = TerminalContextKeys2.findVisible.toNegated();
  TerminalContextKeys2.findInputFocus = new RawContextKey("terminalFindInputFocused" /* FindInputFocused */, false, true);
  TerminalContextKeys2.findFocus = new RawContextKey("terminalFindFocused" /* FindFocused */, false, true);
  TerminalContextKeys2.notFindFocus = TerminalContextKeys2.findInputFocus.toNegated();
  TerminalContextKeys2.processSupported = new RawContextKey("terminalProcessSupported" /* ProcessSupported */, false, localize(20330, null));
  TerminalContextKeys2.tabsSingularSelection = new RawContextKey("terminalTabsSingularSelection" /* TabsSingularSelection */, false, localize(20335, null));
  TerminalContextKeys2.splitTerminalTabFocused = new RawContextKey("terminalSplitTerminal" /* SplitTerminal */, false, localize(20323, null));
  TerminalContextKeys2.splitTerminalActive = new RawContextKey("terminalSplitPaneActive" /* SplitPaneActive */, false, localize(20324, null));
  TerminalContextKeys2.inTerminalRunCommandPicker = new RawContextKey("inTerminalRunCommandPicker" /* InTerminalRunCommandPicker */, false, localize(20322, null));
  TerminalContextKeys2.terminalShellIntegrationEnabled = new RawContextKey("terminalShellIntegrationEnabled" /* TerminalShellIntegrationEnabled */, false, localize(20331, null));
  TerminalContextKeys2.terminalDictationInProgress = new RawContextKey("terminalDictationInProgress" /* DictationInProgress */, false);
  TerminalContextKeys2.shouldShowViewInlineActions = ContextKeyExpr.and(
    ContextKeyExpr.equals("view", TERMINAL_VIEW_ID),
    ContextKeyExpr.notEquals(`config.${"terminal.integrated.tabs.hideCondition" /* TabsHideCondition */}`, "never"),
    ContextKeyExpr.not(TerminalContribContextKeyStrings.ChatHasHiddenTerminals),
    ContextKeyExpr.or(
      ContextKeyExpr.not(`config.${"terminal.integrated.tabs.enabled" /* TabsEnabled */}`),
      ContextKeyExpr.and(
        ContextKeyExpr.equals(`config.${"terminal.integrated.tabs.showActions" /* TabsShowActions */}`, "singleTerminal"),
        ContextKeyExpr.equals("terminalGroupCount" /* GroupCount */, 1)
      ),
      ContextKeyExpr.and(
        ContextKeyExpr.equals(`config.${"terminal.integrated.tabs.showActions" /* TabsShowActions */}`, "singleTerminalOrNarrow"),
        ContextKeyExpr.or(
          ContextKeyExpr.equals("terminalGroupCount" /* GroupCount */, 1),
          ContextKeyExpr.has("isTerminalTabsNarrow" /* TabsNarrow */)
        )
      ),
      ContextKeyExpr.and(
        ContextKeyExpr.equals(`config.${"terminal.integrated.tabs.showActions" /* TabsShowActions */}`, "singleGroup"),
        ContextKeyExpr.equals("terminalGroupCount" /* GroupCount */, 1)
      ),
      ContextKeyExpr.equals(`config.${"terminal.integrated.tabs.showActions" /* TabsShowActions */}`, "always")
    )
  );
})(TerminalContextKeys || (TerminalContextKeys = {}));
export { TerminalContextKeys };
