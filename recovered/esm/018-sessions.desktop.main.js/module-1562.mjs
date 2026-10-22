// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/browser/parts/editor/editor.contribution.ts
import { Registry } from "./module-0090.mjs";
import { EditorExtensions } from "./module-0926.mjs";
import { EditorPaneDescriptor } from "./module-1085.mjs";
import { TextResourceEditor } from "./module-1543.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { SyncDescriptor } from "./module-0134.mjs";
import { UntitledTextEditorInput } from "./module-1541.mjs";
import { TextResourceEditorInput } from "./module-1105.mjs";
import { TextDiffEditor } from "./module-1526.mjs";
import { DiffEditorInput, DiffEditorInputSerializer } from "./module-1102.mjs";
import { BinaryResourceDiffEditor } from "./module-1548.mjs";
import { SideBySideEditor2 } from "./module-1524.mjs";
import { SideBySideEditorInput, SideBySideEditorInputSerializer } from "./module-1096.mjs";
import { UntitledTextEditorInputSerializer, UntitledTextEditorWorkingCopyEditorHandler } from "./module-1554.mjs";
import { WorkbenchPhase, registerWorkbenchContribution2 } from "./module-0872.mjs";
import { EditorAutoSave } from "./module-1551.mjs";
import { ChangeEOLAction, ChangeEncodingAction, ChangeLanguageAction, EditorStatusContribution } from "./module-1549.mjs";
import { DynamicEditorConfigurations } from "./module-1555.mjs";
import { Extensions18 } from "./module-1552.mjs";
import { ContextKeyExpr } from "./module-0089.mjs";
import { getQuickNavigateHandler, inQuickPickContext } from "./module-1510.mjs";
import { ActiveGroupEditorsByMostRecentlyUsedQuickAccess, AllEditorsByAppearanceQuickAccess, AllEditorsByMostRecentlyUsedQuickAccess } from "./module-1523.mjs";
import { ClearEditorHistoryAction, ClearEditorHistoryWithoutConfirmAction, ClearRecentFilesAction, CloseAllEditorGroupsAction, CloseAllEditorsAction, CloseEditorInAllGroupsAction, CloseEditorsInOtherGroupsAction, CloseLeftEditorsInGroupAction, CopyEditorGroupToNewWindowAction, CopyEditorToNewindowAction, DuplicateGroupDownAction, DuplicateGroupLeftAction, DuplicateGroupRightAction, DuplicateGroupUpAction, EditorLayoutSingleAction, EditorLayoutThreeColumnsAction, EditorLayoutThreeRowsAction, EditorLayoutTwoByTwoGridAction, EditorLayoutTwoColumnsAction, EditorLayoutTwoColumnsBottomAction, EditorLayoutTwoRowsAction, EditorLayoutTwoRowsRightAction, FocusAboveGroup, FocusActiveGroupAction, FocusBelowGroup, FocusFirstGroupAction, FocusLastGroupAction, FocusLeftGroup, FocusNextGroup, FocusPreviousGroup, FocusRightGroup, JoinAllGroupsAction, JoinTwoGroupsAction, MaximizeGroupHideSidebarAction, MinimizeOtherGroupsAction, MinimizeOtherGroupsHideSidebarAction, MoveEditorGroupToNewWindowAction, MoveEditorLeftInGroupAction, MoveEditorRightInGroupAction, MoveEditorToAboveGroupAction, MoveEditorToBelowGroupAction, MoveEditorToEndAction, MoveEditorToFirstGroupAction, MoveEditorToLastGroupAction, MoveEditorToLeftGroupAction, MoveEditorToNewWindowAction, MoveEditorToNextGroupAction, MoveEditorToPreviousGroupAction, MoveEditorToRightGroupAction, MoveEditorToStartAction, MoveGroupDownAction, MoveGroupLeftAction, MoveGroupRightAction, MoveGroupUpAction, NavigateBackwardsAction, NavigateBackwardsInEditsAction, NavigateBackwardsInNavigationsAction, NavigateBetweenGroupsAction, NavigateForwardAction, NavigateForwardInEditsAction, NavigateForwardInNavigationsAction, NavigatePreviousAction, NavigatePreviousInEditsAction, NavigatePreviousInNavigationsAction, NavigateToLastEditLocationAction, NavigateToLastNavigationLocationAction, NewEditorGroupAboveAction, NewEditorGroupBelowAction, NewEditorGroupLeftAction, NewEditorGroupRightAction, NewEmptyEditorWindowAction, OpenFirstEditorInGroup, OpenLastEditorInGroup, OpenNextEditor, OpenNextEditorInGroup, OpenNextRecentlyUsedEditorAction, OpenNextRecentlyUsedEditorInGroupAction, OpenPreviousEditor, OpenPreviousEditorInGroup, OpenPreviousRecentlyUsedEditorAction, OpenPreviousRecentlyUsedEditorInGroupAction, QuickAccessLeastRecentlyUsedEditorAction, QuickAccessLeastRecentlyUsedEditorInGroupAction, QuickAccessPreviousEditorFromHistoryAction, QuickAccessPreviousRecentlyUsedEditorAction, QuickAccessPreviousRecentlyUsedEditorInGroupAction, ReOpenInTextEditorAction, ReopenClosedEditorAction, ResetGroupSizesAction, RestoreEditorsToMainWindowAction, RevertAndCloseEditorAction, ShowAllEditorsByAppearanceAction, ShowAllEditorsByMostRecentlyUsedAction, ShowEditorsInActiveGroupByMostRecentlyUsedAction, SplitEditorAction, SplitEditorDownAction, SplitEditorLeftAction, SplitEditorOrthogonalAction, SplitEditorRightAction, SplitEditorToAboveGroupAction, SplitEditorToBelowGroupAction, SplitEditorToFirstGroupAction, SplitEditorToLastGroupAction, SplitEditorToLeftGroupAction, SplitEditorToNextGroupAction, SplitEditorToPreviousGroupAction, SplitEditorToRightGroupAction, SplitEditorUpAction, ToggleEditorTypeAction, ToggleGroupSizesAction, ToggleMaximizeEditorGroupAction } from "./module-1550.mjs";
import { MenuId, MenuRegistry, registerAction2 } from "./module-0092.mjs";
import { KeybindingsRegistry } from "./module-0091.mjs";
import { CLOSE_EDITORS_AND_GROUP_COMMAND_ID, CLOSE_EDITORS_IN_GROUP_COMMAND_ID, CLOSE_EDITORS_TO_THE_RIGHT_COMMAND_ID, CLOSE_EDITOR_COMMAND_ID, CLOSE_EDITOR_GROUP_COMMAND_ID, CLOSE_OTHER_EDITORS_IN_GROUP_COMMAND_ID, CLOSE_PINNED_EDITOR_COMMAND_ID, CLOSE_SAVED_EDITORS_COMMAND_ID, COPY_EDITOR_GROUP_INTO_NEW_WINDOW_COMMAND_ID, COPY_EDITOR_INTO_NEW_WINDOW_COMMAND_ID, FOCUS_FIRST_SIDE_EDITOR, FOCUS_SECOND_SIDE_EDITOR, JOIN_EDITOR_IN_GROUP, KEEP_EDITOR_COMMAND_ID, LOCK_GROUP_COMMAND_ID, MOVE_EDITOR_GROUP_INTO_NEW_WINDOW_COMMAND_ID, MOVE_EDITOR_INTO_ABOVE_GROUP, MOVE_EDITOR_INTO_BELOW_GROUP, MOVE_EDITOR_INTO_LEFT_GROUP, MOVE_EDITOR_INTO_NEW_WINDOW_COMMAND_ID, MOVE_EDITOR_INTO_RIGHT_GROUP, NEW_EMPTY_EDITOR_WINDOW_COMMAND_ID, PIN_EDITOR_COMMAND_ID, REOPEN_WITH_COMMAND_ID, SHOW_EDITORS_IN_GROUP, SPLIT_EDITOR, SPLIT_EDITOR_DOWN, SPLIT_EDITOR_IN_GROUP, SPLIT_EDITOR_LEFT, SPLIT_EDITOR_RIGHT, SPLIT_EDITOR_UP, TOGGLE_KEEP_EDITORS_COMMAND_ID, TOGGLE_LOCK_GROUP_COMMAND_ID, TOGGLE_MAXIMIZE_EDITOR_GROUP, TOGGLE_SPLIT_EDITOR_IN_GROUP_LAYOUT, UNLOCK_GROUP_COMMAND_ID, UNPIN_EDITOR_COMMAND_ID, setup } from "./module-1530.mjs";
import { isMacintosh } from "./module-0014.mjs";
import { FileAccess } from "./module-0033.mjs";
import { Codicon } from "./module-0085.mjs";
import { ActiveCompareEditorCanSwapContext, ActiveCustomEditorDiffCanToggleLayoutContext, ActiveCustomEditorTextDiffContext, ActiveEditorAvailableEditorIdsContext, ActiveEditorCanSplitInGroupContext, ActiveEditorCannotCloseContext, ActiveEditorDirtyContext, ActiveEditorGroupLockedContext, ActiveEditorLastInGroupContext, ActiveEditorPinnedContext, ActiveEditorStickyContext, EditorGroupEditorsCountContext, EditorPartMaximizedEditorGroupContext, EditorPartModalContext, EditorPartMultipleEditorGroupsContext, EditorTabsVisibleContext, InEditorZenModeContext, IsAuxiliaryWindowContext, IsSessionsWindowContext, MultipleEditorGroupsContext, MultipleEditorsSelectedInGroupContext, SideBySideEditorActiveContext, SplitEditorsVertically, TextCompareEditorActiveContext } from "./module-0950.mjs";
import { ConfigureEditorAction, ConfigureEditorTabsAction, EditorActionsDefaultAction, EditorActionsTitleBarAction, HideEditorActionsAction, HideEditorTabsAction, ShowMultipleEditorTabsAction, ShowSingleEditorTabAction, ZenHideEditorTabsAction, ZenShowMultipleEditorTabsAction, ZenShowSingleEditorTabAction } from "./module-1561.mjs";
import { DIFF_SWAP_SIDES, GOTO_NEXT_CHANGE, GOTO_PREVIOUS_CHANGE, TOGGLE_DIFF_IGNORE_TRIM_WHITESPACE, TOGGLE_DIFF_SIDE_BY_SIDE } from "./module-1528.mjs";
import { registerIcon } from "./module-0479.mjs";
import { EditorContextKeys } from "./module-0154.mjs";
import { Categories } from "./module-0847.mjs";
import { registerEditorFontConfigurations } from "./module-0557.mjs";
import { getFontSnippets } from "./module-0312.mjs";


// src/vs/workbench/browser/parts/editor/editor.contribution.ts
Registry.as(EditorExtensions.EditorPane).registerEditorPane(
  EditorPaneDescriptor.create(
    TextResourceEditor,
    TextResourceEditor.ID,
    localize(6466, null)
  ),
  [
    new SyncDescriptor(UntitledTextEditorInput),
    new SyncDescriptor(TextResourceEditorInput)
  ]
);

Registry.as(EditorExtensions.EditorPane).registerEditorPane(
  EditorPaneDescriptor.create(
    TextDiffEditor,
    TextDiffEditor.ID,
    localize(6465, null)
  ),
  [
    new SyncDescriptor(DiffEditorInput)
  ]
);

Registry.as(EditorExtensions.EditorPane).registerEditorPane(
  EditorPaneDescriptor.create(
    BinaryResourceDiffEditor,
    BinaryResourceDiffEditor.ID,
    localize(6343, null)
  ),
  [
    new SyncDescriptor(DiffEditorInput)
  ]
);

Registry.as(EditorExtensions.EditorPane).registerEditorPane(
  EditorPaneDescriptor.create(
    SideBySideEditor2,
    SideBySideEditor2.ID,
    localize(6453, null)
  ),
  [
    new SyncDescriptor(SideBySideEditorInput)
  ]
);

Registry.as(EditorExtensions.EditorFactory).registerEditorSerializer(UntitledTextEditorInput.ID, UntitledTextEditorInputSerializer);

Registry.as(EditorExtensions.EditorFactory).registerEditorSerializer(SideBySideEditorInput.ID, SideBySideEditorInputSerializer);

Registry.as(EditorExtensions.EditorFactory).registerEditorSerializer(DiffEditorInput.ID, DiffEditorInputSerializer);

registerWorkbenchContribution2(EditorAutoSave.ID, EditorAutoSave, WorkbenchPhase.BlockRestore);

registerWorkbenchContribution2(EditorStatusContribution.ID, EditorStatusContribution, WorkbenchPhase.BlockRestore);

registerWorkbenchContribution2(UntitledTextEditorWorkingCopyEditorHandler.ID, UntitledTextEditorWorkingCopyEditorHandler, WorkbenchPhase.BlockRestore);

registerWorkbenchContribution2(DynamicEditorConfigurations.ID, DynamicEditorConfigurations, WorkbenchPhase.BlockRestore);

var quickAccessRegistry = Registry.as(Extensions18.Quickaccess);

var editorPickerContextKey = "inEditorsPicker";

var editorPickerContext = ContextKeyExpr.and(inQuickPickContext, ContextKeyExpr.has(editorPickerContextKey));

quickAccessRegistry.registerQuickAccessProvider({
  ctor: ActiveGroupEditorsByMostRecentlyUsedQuickAccess,
  prefix: ActiveGroupEditorsByMostRecentlyUsedQuickAccess.PREFIX,
  contextKey: editorPickerContextKey,
  placeholder: localize(6363, null),
  helpEntries: [{ description: localize(6340, null), commandId: ShowEditorsInActiveGroupByMostRecentlyUsedAction.ID }]
});

quickAccessRegistry.registerQuickAccessProvider({
  ctor: AllEditorsByAppearanceQuickAccess,
  prefix: AllEditorsByAppearanceQuickAccess.PREFIX,
  contextKey: editorPickerContextKey,
  placeholder: localize(6363, null),
  helpEntries: [{ description: localize(6341, null), commandId: ShowAllEditorsByAppearanceAction.ID }]
});

quickAccessRegistry.registerQuickAccessProvider({
  ctor: AllEditorsByMostRecentlyUsedQuickAccess,
  prefix: AllEditorsByMostRecentlyUsedQuickAccess.PREFIX,
  contextKey: editorPickerContextKey,
  placeholder: localize(6363, null),
  helpEntries: [{ description: localize(6342, null), commandId: ShowAllEditorsByMostRecentlyUsedAction.ID }]
});

registerAction2(ChangeLanguageAction);

registerAction2(ChangeEOLAction);

registerAction2(ChangeEncodingAction);

registerAction2(NavigateForwardAction);

registerAction2(NavigateBackwardsAction);

registerAction2(OpenNextEditor);

registerAction2(OpenPreviousEditor);

registerAction2(OpenNextEditorInGroup);

registerAction2(OpenPreviousEditorInGroup);

registerAction2(OpenFirstEditorInGroup);

registerAction2(OpenLastEditorInGroup);

registerAction2(OpenNextRecentlyUsedEditorAction);

registerAction2(OpenPreviousRecentlyUsedEditorAction);

registerAction2(OpenNextRecentlyUsedEditorInGroupAction);

registerAction2(OpenPreviousRecentlyUsedEditorInGroupAction);

registerAction2(ReopenClosedEditorAction);

registerAction2(ClearRecentFilesAction);

registerAction2(ShowAllEditorsByAppearanceAction);

registerAction2(ShowAllEditorsByMostRecentlyUsedAction);

registerAction2(ShowEditorsInActiveGroupByMostRecentlyUsedAction);

registerAction2(CloseAllEditorsAction);

registerAction2(CloseAllEditorGroupsAction);

registerAction2(CloseLeftEditorsInGroupAction);

registerAction2(CloseEditorsInOtherGroupsAction);

registerAction2(CloseEditorInAllGroupsAction);

registerAction2(RevertAndCloseEditorAction);

registerAction2(SplitEditorAction);

registerAction2(SplitEditorOrthogonalAction);

registerAction2(SplitEditorLeftAction);

registerAction2(SplitEditorRightAction);

registerAction2(SplitEditorUpAction);

registerAction2(SplitEditorDownAction);

registerAction2(JoinTwoGroupsAction);

registerAction2(JoinAllGroupsAction);

registerAction2(NavigateBetweenGroupsAction);

registerAction2(ResetGroupSizesAction);

registerAction2(ToggleGroupSizesAction);

registerAction2(MaximizeGroupHideSidebarAction);

registerAction2(ToggleMaximizeEditorGroupAction);

registerAction2(MinimizeOtherGroupsAction);

registerAction2(MinimizeOtherGroupsHideSidebarAction);

registerAction2(MoveEditorLeftInGroupAction);

registerAction2(MoveEditorRightInGroupAction);

registerAction2(MoveEditorToStartAction);

registerAction2(MoveEditorToEndAction);

registerAction2(MoveGroupLeftAction);

registerAction2(MoveGroupRightAction);

registerAction2(MoveGroupUpAction);

registerAction2(MoveGroupDownAction);

registerAction2(DuplicateGroupLeftAction);

registerAction2(DuplicateGroupRightAction);

registerAction2(DuplicateGroupUpAction);

registerAction2(DuplicateGroupDownAction);

registerAction2(MoveEditorToPreviousGroupAction);

registerAction2(MoveEditorToNextGroupAction);

registerAction2(MoveEditorToFirstGroupAction);

registerAction2(MoveEditorToLastGroupAction);

registerAction2(MoveEditorToLeftGroupAction);

registerAction2(MoveEditorToRightGroupAction);

registerAction2(MoveEditorToAboveGroupAction);

registerAction2(MoveEditorToBelowGroupAction);

registerAction2(SplitEditorToPreviousGroupAction);

registerAction2(SplitEditorToNextGroupAction);

registerAction2(SplitEditorToFirstGroupAction);

registerAction2(SplitEditorToLastGroupAction);

registerAction2(SplitEditorToLeftGroupAction);

registerAction2(SplitEditorToRightGroupAction);

registerAction2(SplitEditorToAboveGroupAction);

registerAction2(SplitEditorToBelowGroupAction);

registerAction2(FocusActiveGroupAction);

registerAction2(FocusFirstGroupAction);

registerAction2(FocusLastGroupAction);

registerAction2(FocusPreviousGroup);

registerAction2(FocusNextGroup);

registerAction2(FocusLeftGroup);

registerAction2(FocusRightGroup);

registerAction2(FocusAboveGroup);

registerAction2(FocusBelowGroup);

registerAction2(NewEditorGroupLeftAction);

registerAction2(NewEditorGroupRightAction);

registerAction2(NewEditorGroupAboveAction);

registerAction2(NewEditorGroupBelowAction);

registerAction2(NavigatePreviousAction);

registerAction2(NavigateForwardInEditsAction);

registerAction2(NavigateBackwardsInEditsAction);

registerAction2(NavigatePreviousInEditsAction);

registerAction2(NavigateToLastEditLocationAction);

registerAction2(NavigateForwardInNavigationsAction);

registerAction2(NavigateBackwardsInNavigationsAction);

registerAction2(NavigatePreviousInNavigationsAction);

registerAction2(NavigateToLastNavigationLocationAction);

registerAction2(ClearEditorHistoryAction);

registerAction2(ClearEditorHistoryWithoutConfirmAction);

registerAction2(EditorLayoutSingleAction);

registerAction2(EditorLayoutTwoColumnsAction);

registerAction2(EditorLayoutThreeColumnsAction);

registerAction2(EditorLayoutTwoRowsAction);

registerAction2(EditorLayoutThreeRowsAction);

registerAction2(EditorLayoutTwoByTwoGridAction);

registerAction2(EditorLayoutTwoRowsRightAction);

registerAction2(EditorLayoutTwoColumnsBottomAction);

registerAction2(ToggleEditorTypeAction);

registerAction2(ReOpenInTextEditorAction);

registerAction2(QuickAccessPreviousRecentlyUsedEditorAction);

registerAction2(QuickAccessLeastRecentlyUsedEditorAction);

registerAction2(QuickAccessPreviousRecentlyUsedEditorInGroupAction);

registerAction2(QuickAccessLeastRecentlyUsedEditorInGroupAction);

registerAction2(QuickAccessPreviousEditorFromHistoryAction);

registerAction2(MoveEditorToNewWindowAction);

registerAction2(CopyEditorToNewindowAction);

registerAction2(MoveEditorGroupToNewWindowAction);

registerAction2(CopyEditorGroupToNewWindowAction);

registerAction2(RestoreEditorsToMainWindowAction);

registerAction2(NewEmptyEditorWindowAction);

var quickAccessNavigateNextInEditorPickerId = "workbench.action.quickOpenNavigateNextInEditorPicker";

KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: quickAccessNavigateNextInEditorPickerId,
  weight: 200 /* WorkbenchContrib */ + 50,
  handler: getQuickNavigateHandler(quickAccessNavigateNextInEditorPickerId, true),
  when: editorPickerContext,
  primary: 2048 /* CtrlCmd */ | 2 /* Tab */,
  mac: { primary: 256 /* WinCtrl */ | 2 /* Tab */ }
});

var quickAccessNavigatePreviousInEditorPickerId = "workbench.action.quickOpenNavigatePreviousInEditorPicker";

KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: quickAccessNavigatePreviousInEditorPickerId,
  weight: 200 /* WorkbenchContrib */ + 50,
  handler: getQuickNavigateHandler(quickAccessNavigatePreviousInEditorPickerId, false),
  when: editorPickerContext,
  primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 2 /* Tab */,
  mac: { primary: 256 /* WinCtrl */ | 1024 /* Shift */ | 2 /* Tab */ }
});

setup();

if (isMacintosh) {
  MenuRegistry.appendMenuItem(MenuId.TouchBarContext, {
    command: { id: NavigateBackwardsAction.ID, title: NavigateBackwardsAction.LABEL, icon: { dark: FileAccess.asFileUri("vs/workbench/browser/parts/editor/media/back-tb.png") } },
    group: "navigation",
    order: 0
  });
  MenuRegistry.appendMenuItem(MenuId.TouchBarContext, {
    command: { id: NavigateForwardAction.ID, title: NavigateForwardAction.LABEL, icon: { dark: FileAccess.asFileUri("vs/workbench/browser/parts/editor/media/forward-tb.png") } },
    group: "navigation",
    order: 1
  });
}

MenuRegistry.appendMenuItem(MenuId.EmptyEditorGroup, { command: { id: LOCK_GROUP_COMMAND_ID, title: localize(6373, null), icon: Codicon.unlock }, group: "navigation", order: 10, when: ContextKeyExpr.and(IsAuxiliaryWindowContext, ActiveEditorGroupLockedContext.toNegated()) });

MenuRegistry.appendMenuItem(MenuId.EmptyEditorGroup, { command: { id: UNLOCK_GROUP_COMMAND_ID, title: localize(6473, null), icon: Codicon.lock, toggled: ContextKeyExpr.true() }, group: "navigation", order: 10, when: ActiveEditorGroupLockedContext });

MenuRegistry.appendMenuItem(MenuId.EmptyEditorGroup, { command: { id: CLOSE_EDITOR_GROUP_COMMAND_ID, title: localize(6350, null), icon: Codicon.close }, group: "navigation", order: 20, when: ContextKeyExpr.or(IsAuxiliaryWindowContext, EditorPartMultipleEditorGroupsContext) });

MenuRegistry.appendMenuItem(MenuId.EmptyEditorGroupContext, { command: { id: SPLIT_EDITOR_UP, title: localize(6462, null) }, group: "2_split", order: 10 });

MenuRegistry.appendMenuItem(MenuId.EmptyEditorGroupContext, { command: { id: SPLIT_EDITOR_DOWN, title: localize(6456, null) }, group: "2_split", order: 20 });

MenuRegistry.appendMenuItem(MenuId.EmptyEditorGroupContext, { command: { id: SPLIT_EDITOR_LEFT, title: localize(6460, null) }, group: "2_split", order: 30 });

MenuRegistry.appendMenuItem(MenuId.EmptyEditorGroupContext, { command: { id: SPLIT_EDITOR_RIGHT, title: localize(6461, null) }, group: "2_split", order: 40 });

MenuRegistry.appendMenuItem(MenuId.EmptyEditorGroupContext, { command: { id: NEW_EMPTY_EDITOR_WINDOW_COMMAND_ID, title: localize(6443, null) }, group: "3_window", order: 10 });

MenuRegistry.appendMenuItem(MenuId.EmptyEditorGroupContext, {
  command: { id: TOGGLE_LOCK_GROUP_COMMAND_ID, title: localize(6468, null), toggled: ActiveEditorGroupLockedContext },
  group: "4_lock",
  order: 10,
  when: IsAuxiliaryWindowContext.toNegated()
  /* already a primary action for aux windows */
});

MenuRegistry.appendMenuItem(MenuId.EmptyEditorGroupContext, { command: { id: CLOSE_EDITOR_GROUP_COMMAND_ID, title: localize(6344, null) }, group: "5_close", order: 10, when: MultipleEditorGroupsContext });

MenuRegistry.appendMenuItem(MenuId.EditorTabsBarContext, { command: { id: SPLIT_EDITOR_UP, title: localize(6462, null) }, group: "2_split", order: 10 });

MenuRegistry.appendMenuItem(MenuId.EditorTabsBarContext, { command: { id: SPLIT_EDITOR_DOWN, title: localize(6456, null) }, group: "2_split", order: 20 });

MenuRegistry.appendMenuItem(MenuId.EditorTabsBarContext, { command: { id: SPLIT_EDITOR_LEFT, title: localize(6460, null) }, group: "2_split", order: 30 });

MenuRegistry.appendMenuItem(MenuId.EditorTabsBarContext, { command: { id: SPLIT_EDITOR_RIGHT, title: localize(6461, null) }, group: "2_split", order: 40 });

MenuRegistry.appendMenuItem(MenuId.EditorTabsBarContext, { command: { id: MOVE_EDITOR_GROUP_INTO_NEW_WINDOW_COMMAND_ID, title: localize(6435, null) }, group: "3_window", order: 10 });

MenuRegistry.appendMenuItem(MenuId.EditorTabsBarContext, { command: { id: COPY_EDITOR_GROUP_INTO_NEW_WINDOW_COMMAND_ID, title: localize(6359, null) }, group: "3_window", order: 20 });

MenuRegistry.appendMenuItem(MenuId.EditorTabsBarContext, { submenu: MenuId.EditorTabsBarShowTabsSubmenu, title: localize(6464, null), group: "4_config", order: 10, when: InEditorZenModeContext.negate() });

MenuRegistry.appendMenuItem(MenuId.EditorTabsBarShowTabsSubmenu, { command: { id: ShowMultipleEditorTabsAction.ID, title: localize(6440, null), toggled: ContextKeyExpr.equals("config.workbench.editor.showTabs", "multiple") }, group: "1_config", order: 10 });

MenuRegistry.appendMenuItem(MenuId.EditorTabsBarShowTabsSubmenu, { command: { id: ShowSingleEditorTabAction.ID, title: localize(6454, null), toggled: ContextKeyExpr.equals("config.workbench.editor.showTabs", "single") }, group: "1_config", order: 20 });

MenuRegistry.appendMenuItem(MenuId.EditorTabsBarShowTabsSubmenu, { command: { id: HideEditorTabsAction.ID, title: localize(6365, null), toggled: ContextKeyExpr.equals("config.workbench.editor.showTabs", "none") }, group: "1_config", order: 30 });

MenuRegistry.appendMenuItem(MenuId.EditorTabsBarContext, { submenu: MenuId.EditorTabsBarShowTabsZenModeSubmenu, title: localize(6464, null), group: "4_config", order: 10, when: InEditorZenModeContext });

MenuRegistry.appendMenuItem(MenuId.EditorTabsBarShowTabsZenModeSubmenu, { command: { id: ZenShowMultipleEditorTabsAction.ID, title: localize(6440, null), toggled: ContextKeyExpr.equals("config.zenMode.showTabs", "multiple") }, group: "1_config", order: 10 });

MenuRegistry.appendMenuItem(MenuId.EditorTabsBarShowTabsZenModeSubmenu, { command: { id: ZenShowSingleEditorTabAction.ID, title: localize(6454, null), toggled: ContextKeyExpr.equals("config.zenMode.showTabs", "single") }, group: "1_config", order: 20 });

MenuRegistry.appendMenuItem(MenuId.EditorTabsBarShowTabsZenModeSubmenu, { command: { id: ZenHideEditorTabsAction.ID, title: localize(6365, null), toggled: ContextKeyExpr.equals("config.zenMode.showTabs", "none") }, group: "1_config", order: 30 });

MenuRegistry.appendMenuItem(MenuId.EditorTabsBarContext, { submenu: MenuId.EditorActionsPositionSubmenu, title: localize(6362, null), group: "4_config", order: 20 });

MenuRegistry.appendMenuItem(MenuId.EditorActionsPositionSubmenu, { command: { id: EditorActionsDefaultAction.ID, title: localize(6464, null), toggled: ContextKeyExpr.equals("config.workbench.editor.editorActionsLocation", "default") }, group: "1_config", order: 10, when: ContextKeyExpr.equals("config.workbench.editor.showTabs", "none").negate() });

MenuRegistry.appendMenuItem(MenuId.EditorActionsPositionSubmenu, { command: { id: EditorActionsTitleBarAction.ID, title: localize(6467, null), toggled: ContextKeyExpr.or(ContextKeyExpr.equals("config.workbench.editor.editorActionsLocation", "titleBar"), ContextKeyExpr.and(ContextKeyExpr.equals("config.workbench.editor.showTabs", "none"), ContextKeyExpr.equals("config.workbench.editor.editorActionsLocation", "default"))) }, group: "1_config", order: 20 });

MenuRegistry.appendMenuItem(MenuId.EditorActionsPositionSubmenu, { command: { id: HideEditorActionsAction.ID, title: localize(6364, null), toggled: ContextKeyExpr.equals("config.workbench.editor.editorActionsLocation", "hidden") }, group: "1_config", order: 30 });

MenuRegistry.appendMenuItem(MenuId.EditorTabsBarContext, { command: { id: ConfigureEditorTabsAction.ID, title: localize(6358, null) }, group: "9_configure", order: 10 });

MenuRegistry.appendMenuItem(MenuId.EditorTitleContext, { command: { id: CLOSE_EDITOR_COMMAND_ID, title: localize(6344, null) }, group: "1_close", order: 10, when: ActiveEditorCannotCloseContext.toNegated() });

MenuRegistry.appendMenuItem(MenuId.EditorTitleContext, { command: { id: CLOSE_OTHER_EDITORS_IN_GROUP_COMMAND_ID, title: localize(6352, null), precondition: EditorGroupEditorsCountContext.notEqualsTo("1") }, group: "1_close", order: 20 });

MenuRegistry.appendMenuItem(MenuId.EditorTitleContext, { command: { id: CLOSE_EDITORS_TO_THE_RIGHT_COMMAND_ID, title: localize(6354, null), precondition: ContextKeyExpr.and(ActiveEditorLastInGroupContext.toNegated(), MultipleEditorsSelectedInGroupContext.negate()) }, group: "1_close", order: 30, when: EditorTabsVisibleContext });

MenuRegistry.appendMenuItem(MenuId.EditorTitleContext, { command: { id: CLOSE_SAVED_EDITORS_COMMAND_ID, title: localize(6346, null) }, group: "1_close", order: 40 });

MenuRegistry.appendMenuItem(MenuId.EditorTitleContext, { command: { id: CLOSE_EDITORS_IN_GROUP_COMMAND_ID, title: localize(6345, null) }, group: "1_close", order: 50 });

MenuRegistry.appendMenuItem(MenuId.EditorTitleContext, { command: { id: REOPEN_WITH_COMMAND_ID, title: localize(6449, null) }, group: "1_open", order: 10, when: ActiveEditorAvailableEditorIdsContext });

MenuRegistry.appendMenuItem(MenuId.EditorTitleContext, { command: { id: KEEP_EDITOR_COMMAND_ID, title: localize(6370, null), precondition: ActiveEditorPinnedContext.toNegated() }, group: "3_preview", order: 10, when: ContextKeyExpr.has("config.workbench.editor.enablePreview") });

MenuRegistry.appendMenuItem(MenuId.EditorTitleContext, { command: { id: PIN_EDITOR_COMMAND_ID, title: localize(6445, null) }, group: "3_preview", order: 20, when: ActiveEditorStickyContext.toNegated() });

MenuRegistry.appendMenuItem(MenuId.EditorTitleContext, { command: { id: UNPIN_EDITOR_COMMAND_ID, title: localize(6475, null) }, group: "3_preview", order: 20, when: ActiveEditorStickyContext });

MenuRegistry.appendMenuItem(MenuId.EditorTitleContext, { command: { id: SPLIT_EDITOR, title: localize(6461, null) }, group: "5_split", order: 10, when: SplitEditorsVertically.negate() });

MenuRegistry.appendMenuItem(MenuId.EditorTitleContext, { command: { id: SPLIT_EDITOR, title: localize(6456, null) }, group: "5_split", order: 10, when: SplitEditorsVertically });

MenuRegistry.appendMenuItem(MenuId.EditorTitleContext, { submenu: MenuId.EditorSplitMoveSubmenu, title: localize(6455, null), group: "5_split", order: 15 });

MenuRegistry.appendMenuItem(MenuId.EditorTitleContext, { command: { id: MOVE_EDITOR_INTO_NEW_WINDOW_COMMAND_ID, title: localize(6439, null) }, group: "7_new_window", order: 10 });

MenuRegistry.appendMenuItem(MenuId.EditorTitleContext, { command: { id: COPY_EDITOR_INTO_NEW_WINDOW_COMMAND_ID, title: localize(6361, null) }, group: "7_new_window", order: 20 });

MenuRegistry.appendMenuItem(MenuId.EditorTitleContext, { submenu: MenuId.EditorTitleContextShare, title: localize(6451, null), group: "11_share", order: -1, when: MultipleEditorsSelectedInGroupContext.negate() });

MenuRegistry.appendMenuItem(MenuId.EditorSplitMoveSubmenu, { command: { id: SPLIT_EDITOR_UP, title: localize(6462, null) }, group: "1_split", order: 10 });

MenuRegistry.appendMenuItem(MenuId.EditorSplitMoveSubmenu, { command: { id: SPLIT_EDITOR_DOWN, title: localize(6456, null) }, group: "1_split", order: 20 });

MenuRegistry.appendMenuItem(MenuId.EditorSplitMoveSubmenu, { command: { id: SPLIT_EDITOR_LEFT, title: localize(6460, null) }, group: "1_split", order: 30 });

MenuRegistry.appendMenuItem(MenuId.EditorSplitMoveSubmenu, { command: { id: SPLIT_EDITOR_RIGHT, title: localize(6461, null) }, group: "1_split", order: 40 });

MenuRegistry.appendMenuItem(MenuId.EditorSplitMoveSubmenu, { command: { id: MOVE_EDITOR_INTO_ABOVE_GROUP, title: localize(6433, null) }, group: "2_move", order: 10 });

MenuRegistry.appendMenuItem(MenuId.EditorSplitMoveSubmenu, { command: { id: MOVE_EDITOR_INTO_BELOW_GROUP, title: localize(6434, null) }, group: "2_move", order: 20 });

MenuRegistry.appendMenuItem(MenuId.EditorSplitMoveSubmenu, { command: { id: MOVE_EDITOR_INTO_LEFT_GROUP, title: localize(6437, null) }, group: "2_move", order: 30 });

MenuRegistry.appendMenuItem(MenuId.EditorSplitMoveSubmenu, { command: { id: MOVE_EDITOR_INTO_RIGHT_GROUP, title: localize(6438, null) }, group: "2_move", order: 40 });

MenuRegistry.appendMenuItem(MenuId.EditorSplitMoveSubmenu, { command: { id: SPLIT_EDITOR_IN_GROUP, title: localize(6459, null), precondition: MultipleEditorsSelectedInGroupContext.negate() }, group: "3_split_in_group", order: 10, when: ActiveEditorCanSplitInGroupContext });

MenuRegistry.appendMenuItem(MenuId.EditorSplitMoveSubmenu, { command: { id: JOIN_EDITOR_IN_GROUP, title: localize(6368, null), precondition: MultipleEditorsSelectedInGroupContext.negate() }, group: "3_split_in_group", order: 10, when: SideBySideEditorActiveContext });

MenuRegistry.appendMenuItem(MenuId.EditorTitle, { command: { id: TOGGLE_DIFF_SIDE_BY_SIDE, title: localize(6367, null), toggled: ContextKeyExpr.equals("config.diffEditor.renderSideBySide", false) }, group: "1_diff", order: 10, when: ContextKeyExpr.or(ContextKeyExpr.has("isInDiffEditor"), ActiveCustomEditorDiffCanToggleLayoutContext) });

MenuRegistry.appendMenuItem(MenuId.EditorTitle, {
  command: { id: SHOW_EDITORS_IN_GROUP, title: localize(6452, null) },
  group: "3_open",
  order: 10,
  when: EditorPartModalContext.toNegated()
  /* not applicable to modal editor */
});

MenuRegistry.appendMenuItem(MenuId.EditorTitle, {
  command: { id: CLOSE_EDITORS_IN_GROUP_COMMAND_ID, title: localize(6345, null) },
  group: "5_close",
  order: 10,
  when: EditorPartModalContext.toNegated()
  /* not applicable to modal editor */
});

MenuRegistry.appendMenuItem(MenuId.EditorTitle, {
  command: { id: CLOSE_SAVED_EDITORS_COMMAND_ID, title: localize(6346, null) },
  group: "5_close",
  order: 20,
  when: EditorPartModalContext.toNegated()
  /* not applicable to modal editor */
});

MenuRegistry.appendMenuItem(MenuId.EditorTitle, {
  command: { id: TOGGLE_KEEP_EDITORS_COMMAND_ID, title: localize(6469, null), toggled: ContextKeyExpr.has("config.workbench.editor.enablePreview") },
  group: "7_settings",
  order: 10,
  when: EditorPartModalContext.toNegated()
  /* not applicable to modal editor */
});

MenuRegistry.appendMenuItem(MenuId.EditorTitle, { command: { id: TOGGLE_MAXIMIZE_EDITOR_GROUP, title: localize(6374, null) }, group: "8_group_operations", order: 5, when: ContextKeyExpr.and(EditorPartMaximizedEditorGroupContext.negate(), EditorPartMultipleEditorGroupsContext) });

MenuRegistry.appendMenuItem(MenuId.EditorTitle, { command: { id: TOGGLE_MAXIMIZE_EDITOR_GROUP, title: localize(6474, null) }, group: "8_group_operations", order: 5, when: EditorPartMaximizedEditorGroupContext });

MenuRegistry.appendMenuItem(MenuId.EditorTitle, {
  command: { id: TOGGLE_LOCK_GROUP_COMMAND_ID, title: localize(6372, null), toggled: ActiveEditorGroupLockedContext },
  group: "8_group_operations",
  order: 10,
  when: ContextKeyExpr.and(IsAuxiliaryWindowContext.toNegated(), EditorPartModalContext.toNegated())
  /* already a primary action for aux windows, not applicable to modal editor */
});

MenuRegistry.appendMenuItem(MenuId.EditorTitle, {
  command: { id: ConfigureEditorAction.ID, title: localize(6357, null) },
  group: "9_configure",
  order: 10,
  when: EditorPartModalContext.toNegated()
  /* not applicable to modal editor */
});

function appendEditorToolItem(primary, when, order, alternative, precondition2, enableInCompactMode, enableInModalMode) {
  const item = {
    command: {
      id: primary.id,
      title: primary.title,
      icon: primary.icon,
      toggled: primary.toggled,
      precondition: precondition2
    },
    group: "navigation",
    when,
    order
  };
  if (alternative) {
    item.alt = {
      id: alternative.id,
      title: alternative.title,
      icon: alternative.icon
    };
  }
  MenuRegistry.appendMenuItem(MenuId.EditorTitle, item);
  if (enableInCompactMode) {
    MenuRegistry.appendMenuItem(MenuId.CompactWindowEditorTitle, item);
  }
  if (enableInModalMode) {
    MenuRegistry.appendMenuItem(MenuId.ModalEditorEditorTitle, item);
  }
}

var SPLIT_ORDER = 1e5;

var CLOSE_ORDER = 1e6;

appendEditorToolItem(
  {
    id: SPLIT_EDITOR,
    title: localize(6458, null),
    icon: Codicon.splitHorizontal
  },
  ContextKeyExpr.and(SplitEditorsVertically.negate(), IsSessionsWindowContext.toNegated()),
  SPLIT_ORDER,
  {
    id: SPLIT_EDITOR_DOWN,
    title: localize(6457, null),
    icon: Codicon.splitVertical
  }
);

appendEditorToolItem(
  {
    id: SPLIT_EDITOR,
    title: localize(6457, null),
    icon: Codicon.splitVertical
  },
  ContextKeyExpr.and(SplitEditorsVertically, IsSessionsWindowContext.toNegated()),
  SPLIT_ORDER,
  {
    id: SPLIT_EDITOR_RIGHT,
    title: localize(6458, null),
    icon: Codicon.splitHorizontal
  }
);

MenuRegistry.appendMenuItem(MenuId.EditorTitle, {
  command: {
    id: SPLIT_EDITOR,
    title: localize(6458, null),
    icon: Codicon.splitHorizontal
  },
  group: "4_split",
  order: 10,
  when: ContextKeyExpr.and(IsSessionsWindowContext, SplitEditorsVertically.negate())
});

MenuRegistry.appendMenuItem(MenuId.EditorTitle, {
  command: {
    id: SPLIT_EDITOR,
    title: localize(6457, null),
    icon: Codicon.splitVertical
  },
  group: "4_split",
  order: 10,
  when: ContextKeyExpr.and(IsSessionsWindowContext, SplitEditorsVertically)
});

appendEditorToolItem(
  {
    id: TOGGLE_SPLIT_EDITOR_IN_GROUP_LAYOUT,
    title: localize(6470, null),
    icon: Codicon.editorLayout
  },
  SideBySideEditorActiveContext,
  SPLIT_ORDER - 1
  // left to split actions
);

appendEditorToolItem(
  {
    id: CLOSE_EDITOR_COMMAND_ID,
    title: localize(6344, null),
    icon: Codicon.close
  },
  ContextKeyExpr.and(EditorTabsVisibleContext.toNegated(), ActiveEditorDirtyContext.toNegated(), ActiveEditorStickyContext.toNegated(), ActiveEditorCannotCloseContext.toNegated()),
  CLOSE_ORDER,
  {
    id: CLOSE_EDITORS_IN_GROUP_COMMAND_ID,
    title: localize(6345, null),
    icon: Codicon.closeAll
  }
);

appendEditorToolItem(
  {
    id: CLOSE_EDITOR_COMMAND_ID,
    title: localize(6344, null),
    icon: Codicon.closeDirty
  },
  ContextKeyExpr.and(EditorTabsVisibleContext.toNegated(), ActiveEditorDirtyContext, ActiveEditorStickyContext.toNegated(), ActiveEditorCannotCloseContext.toNegated()),
  CLOSE_ORDER,
  {
    id: CLOSE_EDITORS_IN_GROUP_COMMAND_ID,
    title: localize(6345, null),
    icon: Codicon.closeAll
  }
);

appendEditorToolItem(
  {
    id: UNPIN_EDITOR_COMMAND_ID,
    title: localize(6475, null),
    icon: Codicon.pinned
  },
  ContextKeyExpr.and(EditorTabsVisibleContext.toNegated(), ActiveEditorDirtyContext.toNegated(), ActiveEditorStickyContext),
  CLOSE_ORDER,
  {
    id: CLOSE_EDITOR_COMMAND_ID,
    title: localize(6344, null),
    icon: Codicon.close
  }
);

appendEditorToolItem(
  {
    id: UNPIN_EDITOR_COMMAND_ID,
    title: localize(6475, null),
    icon: Codicon.pinnedDirty
  },
  ContextKeyExpr.and(EditorTabsVisibleContext.toNegated(), ActiveEditorDirtyContext, ActiveEditorStickyContext),
  CLOSE_ORDER,
  {
    id: CLOSE_EDITOR_COMMAND_ID,
    title: localize(6344, null),
    icon: Codicon.close
  }
);

appendEditorToolItem(
  {
    id: LOCK_GROUP_COMMAND_ID,
    title: localize(6371, null),
    icon: Codicon.unlock
  },
  ContextKeyExpr.and(IsAuxiliaryWindowContext, ActiveEditorGroupLockedContext.toNegated()),
  CLOSE_ORDER - 1
  // immediately to the left of close action
);

appendEditorToolItem(
  {
    id: UNLOCK_GROUP_COMMAND_ID,
    title: localize(6472, null),
    icon: Codicon.lock,
    toggled: ContextKeyExpr.true()
  },
  ActiveEditorGroupLockedContext,
  CLOSE_ORDER - 1
  // immediately to the left of close action
);

var previousChangeIcon = registerIcon("diff-editor-previous-change", Codicon.arrowUp, localize(6447, null));

appendEditorToolItem(
  {
    id: GOTO_PREVIOUS_CHANGE,
    title: localize(6442, null),
    icon: previousChangeIcon
  },
  TextCompareEditorActiveContext,
  10,
  void 0,
  EditorContextKeys.hasChanges,
  true,
  true
);

var nextChangeIcon = registerIcon("diff-editor-next-change", Codicon.arrowDown, localize(6444, null));

appendEditorToolItem(
  {
    id: GOTO_NEXT_CHANGE,
    title: localize(6441, null),
    icon: nextChangeIcon
  },
  TextCompareEditorActiveContext,
  11,
  void 0,
  EditorContextKeys.hasChanges,
  true,
  true
);

appendEditorToolItem(
  {
    id: DIFF_SWAP_SIDES,
    title: localize(6463, null),
    icon: Codicon.arrowSwap
  },
  ContextKeyExpr.and(TextCompareEditorActiveContext, ActiveCompareEditorCanSwapContext),
  15,
  void 0,
  void 0
);

appendEditorToolItem(
  {
    id: ReOpenInTextEditorAction.ID,
    title: localize(6448, null),
    icon: Codicon.fileCode
  },
  ActiveCustomEditorTextDiffContext,
  16,
  void 0,
  void 0,
  void 0,
  true
);

var toggleWhitespace = registerIcon("diff-editor-toggle-whitespace", Codicon.whitespace, localize(6471, null));

MenuRegistry.appendMenuItem(MenuId.EditorTitle, {
  command: {
    id: TOGGLE_DIFF_IGNORE_TRIM_WHITESPACE,
    title: localize(6366, null),
    icon: toggleWhitespace,
    precondition: TextCompareEditorActiveContext,
    toggled: ContextKeyExpr.equals("config.diffEditor.ignoreTrimWhitespace", false)
  },
  group: "navigation",
  when: TextCompareEditorActiveContext,
  order: 20
});

MenuRegistry.appendMenuItem(MenuId.CommandPalette, { command: { id: KEEP_EDITOR_COMMAND_ID, title: localize2(6369, "Keep Editor"), category: Categories.View }, when: ContextKeyExpr.has("config.workbench.editor.enablePreview") });

MenuRegistry.appendMenuItem(MenuId.CommandPalette, { command: { id: PIN_EDITOR_COMMAND_ID, title: localize2(6446, "Pin Editor"), category: Categories.View } });

MenuRegistry.appendMenuItem(MenuId.CommandPalette, { command: { id: UNPIN_EDITOR_COMMAND_ID, title: localize2(6476, "Unpin Editor"), category: Categories.View } });

MenuRegistry.appendMenuItem(MenuId.CommandPalette, { command: { id: CLOSE_EDITOR_COMMAND_ID, title: localize2(6347, "Close Editor"), category: Categories.View } });

MenuRegistry.appendMenuItem(MenuId.CommandPalette, { command: { id: CLOSE_PINNED_EDITOR_COMMAND_ID, title: localize2(6353, "Close Pinned Editor"), category: Categories.View } });

MenuRegistry.appendMenuItem(MenuId.CommandPalette, { command: { id: CLOSE_EDITORS_IN_GROUP_COMMAND_ID, title: localize2(6349, "Close All Editors in Group"), category: Categories.View } });

MenuRegistry.appendMenuItem(MenuId.CommandPalette, { command: { id: CLOSE_SAVED_EDITORS_COMMAND_ID, title: localize2(6356, "Close Saved Editors in Group"), category: Categories.View } });

MenuRegistry.appendMenuItem(MenuId.CommandPalette, { command: { id: CLOSE_OTHER_EDITORS_IN_GROUP_COMMAND_ID, title: localize2(6351, "Close Other Editors in Group"), category: Categories.View } });

MenuRegistry.appendMenuItem(MenuId.CommandPalette, { command: { id: CLOSE_EDITORS_TO_THE_RIGHT_COMMAND_ID, title: localize2(6355, "Close Editors to the Right in Group"), category: Categories.View }, when: ActiveEditorLastInGroupContext.toNegated() });

MenuRegistry.appendMenuItem(MenuId.CommandPalette, { command: { id: CLOSE_EDITORS_AND_GROUP_COMMAND_ID, title: localize2(6348, "Close Editor Group"), category: Categories.View }, when: MultipleEditorGroupsContext });

MenuRegistry.appendMenuItem(MenuId.CommandPalette, { command: { id: REOPEN_WITH_COMMAND_ID, title: localize2(6450, "Reopen Editor With..."), category: Categories.View }, when: ActiveEditorAvailableEditorIdsContext });

MenuRegistry.appendMenuItem(MenuId.MenubarRecentMenu, {
  group: "1_editor",
  command: {
    id: ReopenClosedEditorAction.ID,
    title: localize(6402, null),
    precondition: ContextKeyExpr.has("canReopenClosedEditor")
  },
  order: 1
});

MenuRegistry.appendMenuItem(MenuId.MenubarRecentMenu, {
  group: "z_clear",
  command: {
    id: ClearRecentFilesAction.ID,
    title: localize(6375, null)
  },
  order: 1
});

MenuRegistry.appendMenuItem(MenuId.MenubarFileMenu, {
  title: localize(6404, null),
  submenu: MenuId.MenubarShare,
  group: "45_share",
  order: 1,
  when: IsSessionsWindowContext.negate()
});

MenuRegistry.appendMenuItem(MenuId.MenubarViewMenu, {
  group: "2_appearance",
  title: localize(6377, null),
  submenu: MenuId.MenubarLayoutMenu,
  order: 2,
  when: IsSessionsWindowContext.negate()
});

MenuRegistry.appendMenuItem(MenuId.MenubarLayoutMenu, {
  group: "1_split",
  command: {
    id: SPLIT_EDITOR_UP,
    title: {
      ...localize2(6416, "Split Up"),
      mnemonicTitle: localize(6415, null)
    }
  },
  order: 1
});

MenuRegistry.appendMenuItem(MenuId.MenubarLayoutMenu, {
  group: "1_split",
  command: {
    id: SPLIT_EDITOR_DOWN,
    title: {
      ...localize2(6408, "Split Down"),
      mnemonicTitle: localize(6407, null)
    }
  },
  order: 2
});

MenuRegistry.appendMenuItem(MenuId.MenubarLayoutMenu, {
  group: "1_split",
  command: {
    id: SPLIT_EDITOR_LEFT,
    title: {
      ...localize2(6412, "Split Left"),
      mnemonicTitle: localize(6411, null)
    }
  },
  order: 3
});

MenuRegistry.appendMenuItem(MenuId.MenubarLayoutMenu, {
  group: "1_split",
  command: {
    id: SPLIT_EDITOR_RIGHT,
    title: {
      ...localize2(6414, "Split Right"),
      mnemonicTitle: localize(6413, null)
    }
  },
  order: 4
});

MenuRegistry.appendMenuItem(MenuId.MenubarLayoutMenu, {
  group: "2_split_in_group",
  command: {
    id: SPLIT_EDITOR_IN_GROUP,
    title: {
      ...localize2(6410, "Split in Group"),
      mnemonicTitle: localize(6409, null)
    }
  },
  when: ActiveEditorCanSplitInGroupContext,
  order: 1
});

MenuRegistry.appendMenuItem(MenuId.MenubarLayoutMenu, {
  group: "2_split_in_group",
  command: {
    id: JOIN_EDITOR_IN_GROUP,
    title: {
      ...localize2(6389, "Join in Group"),
      mnemonicTitle: localize(6388, null)
    }
  },
  when: SideBySideEditorActiveContext,
  order: 1
});

MenuRegistry.appendMenuItem(MenuId.MenubarLayoutMenu, {
  group: "3_new_window",
  command: {
    id: MOVE_EDITOR_INTO_NEW_WINDOW_COMMAND_ID,
    title: {
      ...localize2(6436, "Move Editor into New Window"),
      mnemonicTitle: localize(6391, null)
    }
  },
  order: 1
});

MenuRegistry.appendMenuItem(MenuId.MenubarLayoutMenu, {
  group: "3_new_window",
  command: {
    id: COPY_EDITOR_INTO_NEW_WINDOW_COMMAND_ID,
    title: {
      ...localize2(6360, "Copy Editor into New Window"),
      mnemonicTitle: localize(6376, null)
    }
  },
  order: 2
});

MenuRegistry.appendMenuItem(MenuId.MenubarLayoutMenu, {
  group: "4_layouts",
  command: {
    id: EditorLayoutSingleAction.ID,
    title: {
      ...localize2(6406, "Single"),
      mnemonicTitle: localize(6405, null)
    }
  },
  order: 1
});

MenuRegistry.appendMenuItem(MenuId.MenubarLayoutMenu, {
  group: "4_layouts",
  command: {
    id: EditorLayoutTwoColumnsAction.ID,
    title: {
      ...localize2(6428, "Two Columns"),
      mnemonicTitle: localize(6427, null)
    }
  },
  order: 3
});

MenuRegistry.appendMenuItem(MenuId.MenubarLayoutMenu, {
  group: "4_layouts",
  command: {
    id: EditorLayoutThreeColumnsAction.ID,
    title: {
      ...localize2(6420, "Three Columns"),
      mnemonicTitle: localize(6419, null)
    }
  },
  order: 4
});

MenuRegistry.appendMenuItem(MenuId.MenubarLayoutMenu, {
  group: "4_layouts",
  command: {
    id: EditorLayoutTwoRowsAction.ID,
    title: {
      ...localize2(6430, "Two Rows"),
      mnemonicTitle: localize(6429, null)
    }
  },
  order: 5
});

MenuRegistry.appendMenuItem(MenuId.MenubarLayoutMenu, {
  group: "4_layouts",
  command: {
    id: EditorLayoutThreeRowsAction.ID,
    title: {
      ...localize2(6422, "Three Rows"),
      mnemonicTitle: localize(6421, null)
    }
  },
  order: 6
});

MenuRegistry.appendMenuItem(MenuId.MenubarLayoutMenu, {
  group: "4_layouts",
  command: {
    id: EditorLayoutTwoByTwoGridAction.ID,
    title: {
      ...localize2(6424, "Grid (2x2)"),
      mnemonicTitle: localize(6423, null)
    }
  },
  order: 7
});

MenuRegistry.appendMenuItem(MenuId.MenubarLayoutMenu, {
  group: "4_layouts",
  command: {
    id: EditorLayoutTwoRowsRightAction.ID,
    title: {
      ...localize2(6432, "Two Rows Right"),
      mnemonicTitle: localize(6431, null)
    }
  },
  order: 8
});

MenuRegistry.appendMenuItem(MenuId.MenubarLayoutMenu, {
  group: "4_layouts",
  command: {
    id: EditorLayoutTwoColumnsBottomAction.ID,
    title: {
      ...localize2(6426, "Two Columns Bottom"),
      mnemonicTitle: localize(6425, null)
    }
  },
  order: 9
});

MenuRegistry.appendMenuItem(MenuId.MenubarGoMenu, {
  group: "1_history_nav",
  command: {
    id: "workbench.action.navigateToLastEditLocation",
    title: localize(6390, null),
    precondition: ContextKeyExpr.has("canNavigateToLastEditLocation")
  },
  order: 3
});

MenuRegistry.appendMenuItem(MenuId.MenubarSwitchEditorMenu, {
  group: "1_sideBySide",
  command: {
    id: FOCUS_FIRST_SIDE_EDITOR,
    title: localize(6378, null)
  },
  when: ContextKeyExpr.or(SideBySideEditorActiveContext, TextCompareEditorActiveContext),
  order: 1
});

MenuRegistry.appendMenuItem(MenuId.MenubarSwitchEditorMenu, {
  group: "1_sideBySide",
  command: {
    id: FOCUS_SECOND_SIDE_EDITOR,
    title: localize(6403, null)
  },
  when: ContextKeyExpr.or(SideBySideEditorActiveContext, TextCompareEditorActiveContext),
  order: 2
});

MenuRegistry.appendMenuItem(MenuId.MenubarSwitchEditorMenu, {
  group: "2_any",
  command: {
    id: "workbench.action.nextEditor",
    title: localize(6392, null)
  },
  order: 1
});

MenuRegistry.appendMenuItem(MenuId.MenubarSwitchEditorMenu, {
  group: "2_any",
  command: {
    id: "workbench.action.previousEditor",
    title: localize(6397, null)
  },
  order: 2
});

MenuRegistry.appendMenuItem(MenuId.MenubarSwitchEditorMenu, {
  group: "3_any_used",
  command: {
    id: "workbench.action.openNextRecentlyUsedEditor",
    title: localize(6395, null)
  },
  order: 1
});

MenuRegistry.appendMenuItem(MenuId.MenubarSwitchEditorMenu, {
  group: "3_any_used",
  command: {
    id: "workbench.action.openPreviousRecentlyUsedEditor",
    title: localize(6400, null)
  },
  order: 2
});

MenuRegistry.appendMenuItem(MenuId.MenubarSwitchEditorMenu, {
  group: "4_group",
  command: {
    id: "workbench.action.nextEditorInGroup",
    title: localize(6393, null)
  },
  order: 1
});

MenuRegistry.appendMenuItem(MenuId.MenubarSwitchEditorMenu, {
  group: "4_group",
  command: {
    id: "workbench.action.previousEditorInGroup",
    title: localize(6398, null)
  },
  order: 2
});

MenuRegistry.appendMenuItem(MenuId.MenubarSwitchEditorMenu, {
  group: "5_group_used",
  command: {
    id: "workbench.action.openNextRecentlyUsedEditorInGroup",
    title: localize(6396, null)
  },
  order: 1
});

MenuRegistry.appendMenuItem(MenuId.MenubarSwitchEditorMenu, {
  group: "5_group_used",
  command: {
    id: "workbench.action.openPreviousRecentlyUsedEditorInGroup",
    title: localize(6401, null)
  },
  order: 2
});

MenuRegistry.appendMenuItem(MenuId.MenubarGoMenu, {
  group: "2_editor_nav",
  title: localize(6417, null),
  submenu: MenuId.MenubarSwitchEditorMenu,
  order: 1
});

MenuRegistry.appendMenuItem(MenuId.MenubarSwitchGroupMenu, {
  group: "1_focus_index",
  command: {
    id: "workbench.action.focusFirstEditorGroup",
    title: localize(6382, null)
  },
  order: 1
});

MenuRegistry.appendMenuItem(MenuId.MenubarSwitchGroupMenu, {
  group: "1_focus_index",
  command: {
    id: "workbench.action.focusSecondEditorGroup",
    title: localize(6386, null)
  },
  order: 2
});

MenuRegistry.appendMenuItem(MenuId.MenubarSwitchGroupMenu, {
  group: "1_focus_index",
  command: {
    id: "workbench.action.focusThirdEditorGroup",
    title: localize(6387, null),
    precondition: MultipleEditorGroupsContext
  },
  order: 3
});

MenuRegistry.appendMenuItem(MenuId.MenubarSwitchGroupMenu, {
  group: "1_focus_index",
  command: {
    id: "workbench.action.focusFourthEditorGroup",
    title: localize(6383, null),
    precondition: MultipleEditorGroupsContext
  },
  order: 4
});

MenuRegistry.appendMenuItem(MenuId.MenubarSwitchGroupMenu, {
  group: "1_focus_index",
  command: {
    id: "workbench.action.focusFifthEditorGroup",
    title: localize(6381, null),
    precondition: MultipleEditorGroupsContext
  },
  order: 5
});

MenuRegistry.appendMenuItem(MenuId.MenubarSwitchGroupMenu, {
  group: "2_next_prev",
  command: {
    id: "workbench.action.focusNextGroup",
    title: localize(6394, null),
    precondition: MultipleEditorGroupsContext
  },
  order: 1
});

MenuRegistry.appendMenuItem(MenuId.MenubarSwitchGroupMenu, {
  group: "2_next_prev",
  command: {
    id: "workbench.action.focusPreviousGroup",
    title: localize(6399, null),
    precondition: MultipleEditorGroupsContext
  },
  order: 2
});

MenuRegistry.appendMenuItem(MenuId.MenubarSwitchGroupMenu, {
  group: "3_directional",
  command: {
    id: "workbench.action.focusLeftGroup",
    title: localize(6384, null),
    precondition: MultipleEditorGroupsContext
  },
  order: 1
});

MenuRegistry.appendMenuItem(MenuId.MenubarSwitchGroupMenu, {
  group: "3_directional",
  command: {
    id: "workbench.action.focusRightGroup",
    title: localize(6385, null),
    precondition: MultipleEditorGroupsContext
  },
  order: 2
});

MenuRegistry.appendMenuItem(MenuId.MenubarSwitchGroupMenu, {
  group: "3_directional",
  command: {
    id: "workbench.action.focusAboveGroup",
    title: localize(6379, null),
    precondition: MultipleEditorGroupsContext
  },
  order: 3
});

MenuRegistry.appendMenuItem(MenuId.MenubarSwitchGroupMenu, {
  group: "3_directional",
  command: {
    id: "workbench.action.focusBelowGroup",
    title: localize(6380, null),
    precondition: MultipleEditorGroupsContext
  },
  order: 4
});

MenuRegistry.appendMenuItem(MenuId.MenubarGoMenu, {
  group: "2_editor_nav",
  title: localize(6418, null),
  submenu: MenuId.MenubarSwitchGroupMenu,
  order: 2
});

registerEditorFontConfigurations(getFontSnippets);
export { appendEditorToolItem, quickAccessRegistry, editorPickerContextKey, editorPickerContext, quickAccessNavigateNextInEditorPickerId, quickAccessNavigatePreviousInEditorPickerId, SPLIT_ORDER, CLOSE_ORDER, previousChangeIcon, nextChangeIcon, toggleWhitespace };
