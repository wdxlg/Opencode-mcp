// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/browser/parts/editor/editorActions.ts
import { Action2, MenuId } from "./module-0092.mjs";
import { ICommandService } from "./module-0087.mjs";
import { IEditorGroupsService, preferredSideBySideGroupDirection } from "./module-0934.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IEditorService } from "./module-0935.mjs";
import { IListService } from "./module-0636.mjs";
import { resolveCommandsContext } from "./module-1529.mjs";
import { CLOSE_EDITOR_COMMAND_ID, COPY_ACTIVE_EDITOR_COMMAND_ID, COPY_EDITOR_GROUP_INTO_NEW_WINDOW_COMMAND_ID, COPY_EDITOR_INTO_NEW_WINDOW_COMMAND_ID, LAYOUT_EDITOR_GROUPS_COMMAND_ID, MOVE_ACTIVE_EDITOR_COMMAND_ID, MOVE_EDITOR_GROUP_INTO_NEW_WINDOW_COMMAND_ID, MOVE_EDITOR_INTO_ABOVE_GROUP, MOVE_EDITOR_INTO_BELOW_GROUP, MOVE_EDITOR_INTO_LEFT_GROUP, MOVE_EDITOR_INTO_NEW_WINDOW_COMMAND_ID, MOVE_EDITOR_INTO_RIGHT_GROUP, NEW_EMPTY_EDITOR_WINDOW_COMMAND_ID, REOPEN_ACTIVE_EDITOR_WITH_COMMAND_ID, SPLIT_EDITOR, SPLIT_EDITOR_DOWN, SPLIT_EDITOR_LEFT, SPLIT_EDITOR_RIGHT, SPLIT_EDITOR_UP, TOGGLE_MAXIMIZE_EDITOR_GROUP, UNPIN_EDITOR_COMMAND_ID, splitEditor } from "./module-1530.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { Categories } from "./module-0847.mjs";
import { KeyChord } from "./module-0019.mjs";
import { Action } from "./module-0082.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { Codicon } from "./module-0085.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ActiveEditorAvailableEditorIdsContext, ActiveEditorCannotCloseContext, ActiveEditorContext, ActiveEditorGroupEmptyContext, AuxiliaryBarVisibleContext, EditorPartMaximizedEditorGroupContext, EditorPartMultipleEditorGroupsContext, InAutomationContext, IsAuxiliaryWindowFocusedContext, MultipleEditorGroupsContext, SideBarVisibleContext } from "./module-0950.mjs";
import { ILogService } from "./module-0095.mjs";
import { IProgressService } from "./module-0446.mjs";
import { IFilesConfigurationService } from "./module-0931.mjs";
import { IDialogService, IFileDialogService } from "./module-0267.mjs";
import { isLinux, isNative, isWindows } from "./module-0014.mjs";
import { SideBySideEditorInput } from "./module-1096.mjs";
import { ContextKeyExpr } from "./module-0089.mjs";
import { IWorkbenchLayoutService } from "./module-1119.mjs";
import { IHistoryService } from "./module-1493.mjs";
import { IWorkspacesService } from "./module-1378.mjs";
import { IQuickInputService } from "./module-0536.mjs";
import { ActiveGroupEditorsByMostRecentlyUsedQuickAccess, AllEditorsByAppearanceQuickAccess, AllEditorsByMostRecentlyUsedQuickAccess } from "./module-1523.mjs";
import { IKeybindingService } from "./module-0352.mjs";
import { getActiveDocument } from "./module-0075.mjs";
import { IEditorResolverService } from "./module-1114.mjs";
import { EditorResourceAccessor } from "./module-0926.mjs";
import { prepareMoveCopyEditors } from "./module-1089.mjs";


// src/vs/workbench/browser/parts/editor/editorActions.ts
var ExecuteCommandAction = class extends Action2 {
  constructor(desc, commandId, commandArgs) {
    super(desc);
    this.commandId = commandId;
    this.commandArgs = commandArgs;
  }
  run(accessor) {
    const commandService = accessor.get(ICommandService);
    return commandService.executeCommand(this.commandId, this.commandArgs);
  }
};

var AbstractSplitEditorAction = class extends Action2 {
  getDirection(configurationService) {
    return preferredSideBySideGroupDirection(configurationService);
  }
  async run(accessor, ...args2) {
    const editorGroupsService = accessor.get(IEditorGroupsService);
    const configurationService = accessor.get(IConfigurationService);
    const editorService = accessor.get(IEditorService);
    const listService = accessor.get(IListService);
    const direction = this.getDirection(configurationService);
    const commandContext = resolveCommandsContext(args2, editorService, editorGroupsService, listService);
    splitEditor(editorGroupsService, direction, commandContext);
  }
};

var SplitEditorAction = class _SplitEditorAction extends AbstractSplitEditorAction {
  static {
    this.ID = SPLIT_EDITOR;
  }
  constructor() {
    super({
      id: _SplitEditorAction.ID,
      title: localize2(6589, "Split Editor"),
      f1: true,
      keybinding: {
        weight: 200 /* WorkbenchContrib */,
        primary: 2048 /* CtrlCmd */ | 93 /* Backslash */
      },
      category: Categories.View
    });
  }
};

var SplitEditorOrthogonalAction = class extends AbstractSplitEditorAction {
  constructor() {
    super({
      id: "workbench.action.splitEditorOrthogonal",
      title: localize2(6596, "Split Editor Orthogonal"),
      f1: true,
      keybinding: {
        weight: 200 /* WorkbenchContrib */,
        primary: KeyChord(2048 /* CtrlCmd */ | 41 /* KeyK */, 2048 /* CtrlCmd */ | 93 /* Backslash */)
      },
      category: Categories.View
    });
  }
  getDirection(configurationService) {
    const direction = preferredSideBySideGroupDirection(configurationService);
    return direction === 3 /* RIGHT */ ? 1 /* DOWN */ : 3 /* RIGHT */;
  }
};

var SplitEditorLeftAction = class extends ExecuteCommandAction {
  constructor() {
    super({
      id: SPLIT_EDITOR_LEFT,
      title: localize2(6592, "Split Editor Left"),
      f1: true,
      keybinding: {
        weight: 200 /* WorkbenchContrib */,
        primary: KeyChord(2048 /* CtrlCmd */ | 41 /* KeyK */, 2048 /* CtrlCmd */ | 93 /* Backslash */)
      },
      category: Categories.View
    }, SPLIT_EDITOR_LEFT);
  }
};

var SplitEditorRightAction = class extends ExecuteCommandAction {
  constructor() {
    super({
      id: SPLIT_EDITOR_RIGHT,
      title: localize2(6593, "Split Editor Right"),
      f1: true,
      keybinding: {
        weight: 200 /* WorkbenchContrib */,
        primary: KeyChord(2048 /* CtrlCmd */ | 41 /* KeyK */, 2048 /* CtrlCmd */ | 93 /* Backslash */)
      },
      category: Categories.View
    }, SPLIT_EDITOR_RIGHT);
  }
};

var SplitEditorUpAction = class extends ExecuteCommandAction {
  static {
    this.LABEL = localize(6594, null);
  }
  constructor() {
    super({
      id: SPLIT_EDITOR_UP,
      title: localize2(6595, "Split Editor Up"),
      f1: true,
      keybinding: {
        weight: 200 /* WorkbenchContrib */,
        primary: KeyChord(2048 /* CtrlCmd */ | 41 /* KeyK */, 2048 /* CtrlCmd */ | 93 /* Backslash */)
      },
      category: Categories.View
    }, SPLIT_EDITOR_UP);
  }
};

var SplitEditorDownAction = class extends ExecuteCommandAction {
  static {
    this.LABEL = localize(6590, null);
  }
  constructor() {
    super({
      id: SPLIT_EDITOR_DOWN,
      title: localize2(6591, "Split Editor Down"),
      f1: true,
      keybinding: {
        weight: 200 /* WorkbenchContrib */,
        primary: KeyChord(2048 /* CtrlCmd */ | 41 /* KeyK */, 2048 /* CtrlCmd */ | 93 /* Backslash */)
      },
      category: Categories.View
    }, SPLIT_EDITOR_DOWN);
  }
};

var JoinTwoGroupsAction = class extends Action2 {
  constructor() {
    super({
      id: "workbench.action.joinTwoGroups",
      title: localize2(6518, "Join Editor Group with Next Group"),
      f1: true,
      category: Categories.View
    });
  }
  async run(accessor, context2) {
    const editorGroupService = accessor.get(IEditorGroupsService);
    let sourceGroup;
    if (context2 && typeof context2.groupId === "number") {
      sourceGroup = editorGroupService.getGroup(context2.groupId);
    } else {
      sourceGroup = editorGroupService.activeGroup;
    }
    if (sourceGroup) {
      const targetGroupDirections = [3 /* RIGHT */, 1 /* DOWN */, 2 /* LEFT */, 0 /* UP */];
      for (const targetGroupDirection of targetGroupDirections) {
        const targetGroup = editorGroupService.findGroup({ direction: targetGroupDirection }, sourceGroup);
        if (targetGroup && sourceGroup !== targetGroup) {
          editorGroupService.mergeGroup(sourceGroup, targetGroup);
          break;
        }
      }
    }
  }
};

var JoinAllGroupsAction = class extends Action2 {
  constructor() {
    super({
      id: "workbench.action.joinAllGroups",
      title: localize2(6517, "Join All Editor Groups"),
      f1: true,
      category: Categories.View
    });
  }
  async run(accessor) {
    const editorGroupService = accessor.get(IEditorGroupsService);
    editorGroupService.mergeAllGroups(editorGroupService.activeGroup);
  }
};

var NavigateBetweenGroupsAction = class extends Action2 {
  constructor() {
    super({
      id: "workbench.action.navigateEditorGroups",
      title: localize2(6553, "Navigate Between Editor Groups"),
      f1: true,
      category: Categories.View
    });
  }
  async run(accessor) {
    const editorGroupService = accessor.get(IEditorGroupsService);
    const nextGroup = editorGroupService.findGroup({ location: 2 /* NEXT */ }, editorGroupService.activeGroup, true);
    nextGroup?.focus();
  }
};

var FocusActiveGroupAction = class extends Action2 {
  constructor() {
    super({
      id: "workbench.action.focusActiveEditorGroup",
      title: localize2(6509, "Focus Active Editor Group"),
      f1: true,
      category: Categories.View
    });
  }
  async run(accessor) {
    const editorGroupService = accessor.get(IEditorGroupsService);
    editorGroupService.activeGroup.focus();
  }
};

var AbstractFocusGroupAction = class extends Action2 {
  constructor(desc, scope) {
    super(desc);
    this.scope = scope;
  }
  async run(accessor) {
    const editorGroupService = accessor.get(IEditorGroupsService);
    const group2 = editorGroupService.findGroup(this.scope, editorGroupService.activeGroup, true);
    group2?.focus();
  }
};

var FocusFirstGroupAction = class extends AbstractFocusGroupAction {
  constructor() {
    super({
      id: "workbench.action.focusFirstEditorGroup",
      title: localize2(6511, "Focus First Editor Group"),
      f1: true,
      keybinding: {
        weight: 200 /* WorkbenchContrib */,
        primary: 2048 /* CtrlCmd */ | 22 /* Digit1 */
      },
      category: Categories.View
    }, { location: 0 /* FIRST */ });
  }
};

var FocusLastGroupAction = class extends AbstractFocusGroupAction {
  constructor() {
    super({
      id: "workbench.action.focusLastEditorGroup",
      title: localize2(6512, "Focus Last Editor Group"),
      f1: true,
      category: Categories.View
    }, { location: 1 /* LAST */ });
  }
};

var FocusNextGroup = class extends AbstractFocusGroupAction {
  constructor() {
    super({
      id: "workbench.action.focusNextGroup",
      title: localize2(6514, "Focus Next Editor Group"),
      f1: true,
      category: Categories.View
    }, { location: 2 /* NEXT */ });
  }
};

var FocusPreviousGroup = class extends AbstractFocusGroupAction {
  constructor() {
    super({
      id: "workbench.action.focusPreviousGroup",
      title: localize2(6515, "Focus Previous Editor Group"),
      f1: true,
      category: Categories.View
    }, { location: 3 /* PREVIOUS */ });
  }
};

var FocusLeftGroup = class extends AbstractFocusGroupAction {
  constructor() {
    super({
      id: "workbench.action.focusLeftGroup",
      title: localize2(6513, "Focus Left Editor Group"),
      f1: true,
      keybinding: {
        weight: 200 /* WorkbenchContrib */,
        primary: KeyChord(2048 /* CtrlCmd */ | 41 /* KeyK */, 2048 /* CtrlCmd */ | 15 /* LeftArrow */)
      },
      category: Categories.View
    }, { direction: 2 /* LEFT */ });
  }
};

var FocusRightGroup = class extends AbstractFocusGroupAction {
  constructor() {
    super({
      id: "workbench.action.focusRightGroup",
      title: localize2(6516, "Focus Right Editor Group"),
      f1: true,
      keybinding: {
        weight: 200 /* WorkbenchContrib */,
        primary: KeyChord(2048 /* CtrlCmd */ | 41 /* KeyK */, 2048 /* CtrlCmd */ | 17 /* RightArrow */)
      },
      category: Categories.View
    }, { direction: 3 /* RIGHT */ });
  }
};

var FocusAboveGroup = class extends AbstractFocusGroupAction {
  constructor() {
    super({
      id: "workbench.action.focusAboveGroup",
      title: localize2(6508, "Focus Editor Group Above"),
      f1: true,
      keybinding: {
        weight: 200 /* WorkbenchContrib */,
        primary: KeyChord(2048 /* CtrlCmd */ | 41 /* KeyK */, 2048 /* CtrlCmd */ | 16 /* UpArrow */)
      },
      category: Categories.View
    }, { direction: 0 /* UP */ });
  }
};

var FocusBelowGroup = class extends AbstractFocusGroupAction {
  constructor() {
    super({
      id: "workbench.action.focusBelowGroup",
      title: localize2(6510, "Focus Editor Group Below"),
      f1: true,
      keybinding: {
        weight: 200 /* WorkbenchContrib */,
        primary: KeyChord(2048 /* CtrlCmd */ | 41 /* KeyK */, 2048 /* CtrlCmd */ | 18 /* DownArrow */)
      },
      category: Categories.View
    }, { direction: 1 /* DOWN */ });
  }
};

var CloseEditorAction = class extends Action {
  constructor(id2, label3, commandService) {
    super(id2, label3, ThemeIcon.asClassName(Codicon.close));
    this.commandService = commandService;
  }
  static {
    this.ID = "workbench.action.closeActiveEditor";
  }
  static {
    this.LABEL = localize(6483, null);
  }
  run(context2) {
    return this.commandService.executeCommand(CLOSE_EDITOR_COMMAND_ID, void 0, context2);
  }
};

CloseEditorAction = __decorateClass([
  __decorateParam(2, ICommandService)
], CloseEditorAction);

var UnpinEditorAction = class extends Action {
  constructor(id2, label3, commandService) {
    super(id2, label3, ThemeIcon.asClassName(Codicon.pinned));
    this.commandService = commandService;
  }
  static {
    this.ID = "workbench.action.unpinActiveEditor";
  }
  static {
    this.LABEL = localize(6610, null);
  }
  run(context2) {
    return this.commandService.executeCommand(UNPIN_EDITOR_COMMAND_ID, void 0, context2);
  }
};

UnpinEditorAction = __decorateClass([
  __decorateParam(2, ICommandService)
], UnpinEditorAction);

var CloseEditorTabAction = class extends Action {
  constructor(id2, label3, editorGroupService) {
    super(id2, label3, ThemeIcon.asClassName(Codicon.closeSmall));
    this.editorGroupService = editorGroupService;
  }
  static {
    this.ID = "workbench.action.closeActiveEditor";
  }
  static {
    this.LABEL = localize(6487, null);
  }
  async run(context2) {
    const group2 = context2 ? this.editorGroupService.getGroup(context2.groupId) : this.editorGroupService.activeGroup;
    if (!group2) {
      return;
    }
    const targetEditor = context2?.editorIndex !== void 0 ? group2.getEditorByIndex(context2.editorIndex) : group2.activeEditor;
    if (!targetEditor) {
      return;
    }
    const editors = [];
    if (group2.isSelected(targetEditor)) {
      editors.push(...group2.selectedEditors);
    } else {
      editors.push(targetEditor);
    }
    for (const editor of editors) {
      await group2.closeEditor(editor, { preserveFocus: context2?.preserveFocus });
    }
  }
};

CloseEditorTabAction = __decorateClass([
  __decorateParam(2, IEditorGroupsService)
], CloseEditorTabAction);

var CloseOtherEditorTabsInGroupAction = class extends Action {
  constructor(id2, label3, editorGroupService) {
    super(id2, label3, ThemeIcon.asClassName(Codicon.closeAll));
    this.editorGroupService = editorGroupService;
  }
  static {
    this.ID = "workbench.action.closeOtherEditorTabInGroup";
  }
  static {
    this.LABEL = localize(6488, null);
  }
  async run(context2) {
    const group2 = context2 ? this.editorGroupService.getGroup(context2.groupId) : this.editorGroupService.activeGroup;
    if (!group2) {
      return;
    }
    const targetEditor = context2?.editorIndex !== void 0 ? group2.getEditorByIndex(context2.editorIndex) : group2.activeEditor;
    if (!targetEditor) {
      return;
    }
    const editorsToClose = group2.getEditors(1 /* SEQUENTIAL */, { excludeSticky: true }).filter((editor) => editor !== targetEditor);
    await group2.closeEditors(editorsToClose, { preserveFocus: context2?.preserveFocus });
  }
};

CloseOtherEditorTabsInGroupAction = __decorateClass([
  __decorateParam(2, IEditorGroupsService)
], CloseOtherEditorTabsInGroupAction);

var RevertAndCloseEditorAction = class extends Action2 {
  constructor() {
    super({
      id: "workbench.action.revertAndCloseActiveEditor",
      title: localize2(6584, "Revert and Close Editor"),
      f1: true,
      category: Categories.View,
      precondition: ActiveEditorCannotCloseContext.toNegated()
    });
  }
  async run(accessor) {
    const editorService = accessor.get(IEditorService);
    const logService = accessor.get(ILogService);
    const activeEditorPane = editorService.activeEditorPane;
    if (activeEditorPane) {
      const editor = activeEditorPane.input;
      if (editor.hasCapability(8192 /* CannotClose */)) {
        return;
      }
      const group2 = activeEditorPane.group;
      try {
        await editorService.revert({ editor, groupId: group2.id });
      } catch (error) {
        logService.error(error);
        await editorService.revert({ editor, groupId: group2.id }, { soft: true });
      }
      await group2.closeEditor(editor);
    }
  }
};

var CloseLeftEditorsInGroupAction = class extends Action2 {
  constructor() {
    super({
      id: "workbench.action.closeEditorsToTheLeft",
      title: localize2(6486, "Close Editors to the Left in Group"),
      f1: true,
      category: Categories.View
    });
  }
  async run(accessor, context2) {
    const editorGroupService = accessor.get(IEditorGroupsService);
    const { group: group2, editor } = this.getTarget(editorGroupService, context2);
    if (group2 && editor) {
      await group2.closeEditors({ direction: 0 /* LEFT */, except: editor, excludeSticky: true });
    }
  }
  getTarget(editorGroupService, context2) {
    if (context2) {
      return { editor: context2.editor, group: editorGroupService.getGroup(context2.groupId) };
    }
    return { group: editorGroupService.activeGroup, editor: editorGroupService.activeGroup.activeEditor };
  }
};

var AbstractCloseAllAction = class extends Action2 {
  groupsToClose(editorGroupService) {
    const groupsToClose = [];
    const groups = editorGroupService.getGroups(2 /* GRID_APPEARANCE */);
    for (let i2 = groups.length - 1; i2 >= 0; i2--) {
      groupsToClose.push(groups[i2]);
    }
    return groupsToClose;
  }
  async run(accessor) {
    const editorService = accessor.get(IEditorService);
    const logService = accessor.get(ILogService);
    const progressService = accessor.get(IProgressService);
    const editorGroupService = accessor.get(IEditorGroupsService);
    const filesConfigurationService = accessor.get(IFilesConfigurationService);
    const fileDialogService = accessor.get(IFileDialogService);
    const dirtyEditorsWithDefaultConfirm = /* @__PURE__ */ new Set();
    const dirtyAutoSaveOnFocusChangeEditors = /* @__PURE__ */ new Set();
    const dirtyAutoSaveOnWindowChangeEditors = /* @__PURE__ */ new Set();
    const editorsWithCustomConfirm = /* @__PURE__ */ new Map();
    for (const { editor, groupId } of editorService.getEditors(1 /* SEQUENTIAL */, { excludeSticky: this.excludeSticky })) {
      if (editor.hasCapability(8192 /* CannotClose */)) {
        continue;
      }
      let confirmClose = false;
      let handlerDidError = false;
      if (editor.closeHandler) {
        try {
          confirmClose = editor.closeHandler.showConfirm();
        } catch (error) {
          logService.error(error);
          handlerDidError = true;
        }
      }
      if (!editor.closeHandler || handlerDidError) {
        confirmClose = editor.isDirty() && !editor.isSaving();
      }
      if (!confirmClose) {
        continue;
      }
      if (typeof editor.closeHandler?.confirm === "function") {
        let customEditorsToConfirm = editorsWithCustomConfirm.get(editor.typeId);
        if (!customEditorsToConfirm) {
          customEditorsToConfirm = /* @__PURE__ */ new Set();
          editorsWithCustomConfirm.set(editor.typeId, customEditorsToConfirm);
        }
        customEditorsToConfirm.add({ editor, groupId });
      } else if (!editor.hasCapability(4 /* Untitled */) && filesConfigurationService.getAutoSaveMode(editor).mode === 3 /* ON_FOCUS_CHANGE */) {
        dirtyAutoSaveOnFocusChangeEditors.add({ editor, groupId });
      } else if (isNative && (isWindows || isLinux) && !editor.hasCapability(4 /* Untitled */) && filesConfigurationService.getAutoSaveMode(editor).mode === 4 /* ON_WINDOW_CHANGE */) {
        dirtyAutoSaveOnWindowChangeEditors.add({ editor, groupId });
      } else {
        dirtyEditorsWithDefaultConfirm.add({ editor, groupId });
      }
    }
    if (dirtyEditorsWithDefaultConfirm.size > 0) {
      const editors = Array.from(dirtyEditorsWithDefaultConfirm.values());
      await this.revealEditorsToConfirm(editors, editorGroupService);
      const confirmation = await fileDialogService.showSaveConfirm(editors.map(({ editor }) => {
        if (editor instanceof SideBySideEditorInput) {
          return editor.primary.getName();
        }
        return editor.getName();
      }));
      switch (confirmation) {
        case 2 /* CANCEL */:
          return;
        case 1 /* DONT_SAVE */:
          await this.revertEditors(editorService, logService, progressService, editors);
          break;
        case 0 /* SAVE */:
          await editorService.save(editors, { reason: 1 /* EXPLICIT */ });
          break;
      }
    }
    for (const [, editorIdentifiers] of editorsWithCustomConfirm) {
      const editors = Array.from(editorIdentifiers.values());
      await this.revealEditorsToConfirm(editors, editorGroupService);
      const confirmation = await editors.at(0)?.editor.closeHandler?.confirm?.(editors);
      if (typeof confirmation === "number") {
        switch (confirmation) {
          case 2 /* CANCEL */:
            return;
          case 1 /* DONT_SAVE */:
            await this.revertEditors(editorService, logService, progressService, editors);
            break;
          case 0 /* SAVE */:
            await editorService.save(editors, { reason: 1 /* EXPLICIT */ });
            break;
        }
      }
    }
    if (dirtyAutoSaveOnFocusChangeEditors.size > 0) {
      const editors = Array.from(dirtyAutoSaveOnFocusChangeEditors.values());
      await editorService.save(editors, { reason: 3 /* FOCUS_CHANGE */ });
    }
    if (dirtyAutoSaveOnWindowChangeEditors.size > 0) {
      const editors = Array.from(dirtyAutoSaveOnWindowChangeEditors.values());
      await editorService.save(editors, { reason: 4 /* WINDOW_CHANGE */ });
    }
    return this.doCloseAll(editorGroupService);
  }
  revertEditors(editorService, logService, progressService, editors) {
    return progressService.withProgress({
      location: 10 /* Window */,
      // use window progress to not be too annoying about this operation
      delay: 800,
      // delay so that it only appears when operation takes a long time
      title: localize(6585, null)
    }, () => this.doRevertEditors(editorService, logService, editors));
  }
  async doRevertEditors(editorService, logService, editors) {
    try {
      await editorService.revert(editors);
    } catch (error) {
      logService.error(error);
      await editorService.revert(editors, { soft: true });
    }
  }
  async revealEditorsToConfirm(editors, editorGroupService) {
    try {
      const handledGroups = /* @__PURE__ */ new Set();
      for (const { editor, groupId } of editors) {
        if (handledGroups.has(groupId)) {
          continue;
        }
        handledGroups.add(groupId);
        const group2 = editorGroupService.getGroup(groupId);
        await group2?.openEditor(editor);
      }
    } catch (error) {
    }
  }
  async doCloseAll(editorGroupService) {
    await Promise.all(this.groupsToClose(editorGroupService).map((group2) => group2.closeAllEditors({ excludeSticky: this.excludeSticky })));
  }
};

var CloseAllEditorsAction = class _CloseAllEditorsAction extends AbstractCloseAllAction {
  static {
    this.ID = "workbench.action.closeAllEditors";
  }
  static {
    this.LABEL = localize2(6481, "Close All Editors");
  }
  constructor() {
    super({
      id: _CloseAllEditorsAction.ID,
      title: _CloseAllEditorsAction.LABEL,
      f1: true,
      keybinding: {
        weight: 200 /* WorkbenchContrib */,
        primary: KeyChord(2048 /* CtrlCmd */ | 41 /* KeyK */, 2048 /* CtrlCmd */ | 53 /* KeyW */)
      },
      icon: Codicon.closeAll,
      category: Categories.View
    });
  }
  get excludeSticky() {
    return true;
  }
};

var CloseAllEditorGroupsAction = class extends AbstractCloseAllAction {
  constructor() {
    super({
      id: "workbench.action.closeAllGroups",
      title: localize2(6482, "Close All Editor Groups"),
      f1: true,
      keybinding: {
        weight: 200 /* WorkbenchContrib */,
        primary: KeyChord(2048 /* CtrlCmd */ | 41 /* KeyK */, 2048 /* CtrlCmd */ | 1024 /* Shift */ | 53 /* KeyW */)
      },
      category: Categories.View
    });
  }
  get excludeSticky() {
    return false;
  }
  async doCloseAll(editorGroupService) {
    await super.doCloseAll(editorGroupService);
    for (const groupToClose of this.groupsToClose(editorGroupService)) {
      if (groupToClose.count === 0) {
        editorGroupService.removeGroup(groupToClose);
      }
    }
  }
};

var CloseEditorsInOtherGroupsAction = class extends Action2 {
  constructor() {
    super({
      id: "workbench.action.closeEditorsInOtherGroups",
      title: localize2(6485, "Close Editors in Other Groups"),
      f1: true,
      category: Categories.View
    });
  }
  async run(accessor, context2) {
    const editorGroupService = accessor.get(IEditorGroupsService);
    const groupToSkip = context2 ? editorGroupService.getGroup(context2.groupId) : editorGroupService.activeGroup;
    await Promise.all(editorGroupService.getGroups(1 /* MOST_RECENTLY_ACTIVE */).map(async (group2) => {
      if (groupToSkip && group2.id === groupToSkip.id) {
        return;
      }
      return group2.closeAllEditors({ excludeSticky: true });
    }));
  }
};

var CloseEditorInAllGroupsAction = class extends Action2 {
  constructor() {
    super({
      id: "workbench.action.closeEditorInAllGroups",
      title: localize2(6484, "Close Editor in All Groups"),
      f1: true,
      category: Categories.View
    });
  }
  async run(accessor) {
    const editorService = accessor.get(IEditorService);
    const editorGroupService = accessor.get(IEditorGroupsService);
    const activeEditor = editorService.activeEditor;
    if (activeEditor) {
      await Promise.all(editorGroupService.getGroups(1 /* MOST_RECENTLY_ACTIVE */).map((group2) => group2.closeEditor(activeEditor)));
    }
  }
};

var AbstractMoveCopyGroupAction = class extends Action2 {
  constructor(desc, direction, isMove) {
    super(desc);
    this.direction = direction;
    this.isMove = isMove;
  }
  async run(accessor, context2) {
    const editorGroupService = accessor.get(IEditorGroupsService);
    let sourceGroup;
    if (context2 && typeof context2.groupId === "number") {
      sourceGroup = editorGroupService.getGroup(context2.groupId);
    } else {
      sourceGroup = editorGroupService.activeGroup;
    }
    if (sourceGroup) {
      let resultGroup = void 0;
      if (this.isMove) {
        const targetGroup = this.findTargetGroup(editorGroupService, sourceGroup);
        if (targetGroup) {
          resultGroup = editorGroupService.moveGroup(sourceGroup, targetGroup, this.direction);
        }
      } else {
        resultGroup = editorGroupService.copyGroup(sourceGroup, sourceGroup, this.direction);
      }
      if (resultGroup) {
        editorGroupService.activateGroup(resultGroup);
      }
    }
  }
  findTargetGroup(editorGroupService, sourceGroup) {
    const targetNeighbours = [this.direction];
    switch (this.direction) {
      case 2 /* LEFT */:
      case 3 /* RIGHT */:
        targetNeighbours.push(0 /* UP */, 1 /* DOWN */);
        break;
      case 0 /* UP */:
      case 1 /* DOWN */:
        targetNeighbours.push(2 /* LEFT */, 3 /* RIGHT */);
        break;
    }
    for (const targetNeighbour of targetNeighbours) {
      const targetNeighbourGroup = editorGroupService.findGroup({ direction: targetNeighbour }, sourceGroup);
      if (targetNeighbourGroup) {
        return targetNeighbourGroup;
      }
    }
    return void 0;
  }
};

var AbstractMoveGroupAction = class extends AbstractMoveCopyGroupAction {
  constructor(desc, direction) {
    super(desc, direction, true);
  }
};

var MoveGroupLeftAction = class extends AbstractMoveGroupAction {
  constructor() {
    super({
      id: "workbench.action.moveActiveEditorGroupLeft",
      title: localize2(6532, "Move Editor Group Left"),
      f1: true,
      keybinding: {
        weight: 200 /* WorkbenchContrib */,
        primary: KeyChord(2048 /* CtrlCmd */ | 41 /* KeyK */, 15 /* LeftArrow */)
      },
      category: Categories.View
    }, 2 /* LEFT */);
  }
};

var MoveGroupRightAction = class extends AbstractMoveGroupAction {
  constructor() {
    super({
      id: "workbench.action.moveActiveEditorGroupRight",
      title: localize2(6533, "Move Editor Group Right"),
      f1: true,
      keybinding: {
        weight: 200 /* WorkbenchContrib */,
        primary: KeyChord(2048 /* CtrlCmd */ | 41 /* KeyK */, 17 /* RightArrow */)
      },
      category: Categories.View
    }, 3 /* RIGHT */);
  }
};

var MoveGroupUpAction = class extends AbstractMoveGroupAction {
  constructor() {
    super({
      id: "workbench.action.moveActiveEditorGroupUp",
      title: localize2(6534, "Move Editor Group Up"),
      f1: true,
      keybinding: {
        weight: 200 /* WorkbenchContrib */,
        primary: KeyChord(2048 /* CtrlCmd */ | 41 /* KeyK */, 16 /* UpArrow */)
      },
      category: Categories.View
    }, 0 /* UP */);
  }
};

var MoveGroupDownAction = class extends AbstractMoveGroupAction {
  constructor() {
    super({
      id: "workbench.action.moveActiveEditorGroupDown",
      title: localize2(6531, "Move Editor Group Down"),
      f1: true,
      keybinding: {
        weight: 200 /* WorkbenchContrib */,
        primary: KeyChord(2048 /* CtrlCmd */ | 41 /* KeyK */, 18 /* DownArrow */)
      },
      category: Categories.View
    }, 1 /* DOWN */);
  }
};

var AbstractDuplicateGroupAction = class extends AbstractMoveCopyGroupAction {
  constructor(desc, direction) {
    super(desc, direction, false);
  }
};

var DuplicateGroupLeftAction = class extends AbstractDuplicateGroupAction {
  constructor() {
    super({
      id: "workbench.action.duplicateActiveEditorGroupLeft",
      title: localize2(6495, "Duplicate Editor Group Left"),
      f1: true,
      category: Categories.View
    }, 2 /* LEFT */);
  }
};

var DuplicateGroupRightAction = class extends AbstractDuplicateGroupAction {
  constructor() {
    super({
      id: "workbench.action.duplicateActiveEditorGroupRight",
      title: localize2(6496, "Duplicate Editor Group Right"),
      f1: true,
      category: Categories.View
    }, 3 /* RIGHT */);
  }
};

var DuplicateGroupUpAction = class extends AbstractDuplicateGroupAction {
  constructor() {
    super({
      id: "workbench.action.duplicateActiveEditorGroupUp",
      title: localize2(6497, "Duplicate Editor Group Up"),
      f1: true,
      category: Categories.View
    }, 0 /* UP */);
  }
};

var DuplicateGroupDownAction = class extends AbstractDuplicateGroupAction {
  constructor() {
    super({
      id: "workbench.action.duplicateActiveEditorGroupDown",
      title: localize2(6494, "Duplicate Editor Group Down"),
      f1: true,
      category: Categories.View
    }, 1 /* DOWN */);
  }
};

var MinimizeOtherGroupsAction = class extends Action2 {
  constructor() {
    super({
      id: "workbench.action.minimizeOtherEditors",
      title: localize2(6528, "Expand Editor Group"),
      f1: true,
      category: Categories.View,
      precondition: MultipleEditorGroupsContext
    });
  }
  async run(accessor) {
    const editorGroupService = accessor.get(IEditorGroupsService);
    editorGroupService.arrangeGroups(1 /* EXPAND */);
  }
};

var MinimizeOtherGroupsHideSidebarAction = class extends Action2 {
  constructor() {
    super({
      id: "workbench.action.minimizeOtherEditorsHideSidebar",
      title: localize2(6529, "Expand Editor Group and Hide Side Bars"),
      f1: true,
      category: Categories.View,
      precondition: ContextKeyExpr.or(MultipleEditorGroupsContext, SideBarVisibleContext, AuxiliaryBarVisibleContext)
    });
  }
  async run(accessor) {
    const editorGroupService = accessor.get(IEditorGroupsService);
    const layoutService = accessor.get(IWorkbenchLayoutService);
    layoutService.setPartHidden(true, "workbench.parts.sidebar" /* SIDEBAR_PART */);
    layoutService.setPartHidden(true, "workbench.parts.auxiliarybar" /* AUXILIARYBAR_PART */);
    editorGroupService.arrangeGroups(1 /* EXPAND */);
  }
};

var ResetGroupSizesAction = class extends Action2 {
  constructor() {
    super({
      id: "workbench.action.evenEditorWidths",
      title: localize2(6506, "Reset Editor Group Sizes"),
      f1: true,
      category: Categories.View
    });
  }
  async run(accessor) {
    const editorGroupService = accessor.get(IEditorGroupsService);
    editorGroupService.arrangeGroups(2 /* EVEN */);
  }
};

var ToggleGroupSizesAction = class extends Action2 {
  constructor() {
    super({
      id: "workbench.action.toggleEditorWidths",
      title: localize2(6607, "Toggle Editor Group Sizes"),
      f1: true,
      category: Categories.View
    });
  }
  async run(accessor) {
    const editorGroupService = accessor.get(IEditorGroupsService);
    editorGroupService.toggleExpandGroup();
  }
};

var MaximizeGroupHideSidebarAction = class extends Action2 {
  constructor() {
    super({
      id: "workbench.action.maximizeEditorHideSidebar",
      title: localize2(6520, "Maximize Editor Group and Hide Side Bars"),
      f1: true,
      category: Categories.View,
      precondition: ContextKeyExpr.or(ContextKeyExpr.and(EditorPartMaximizedEditorGroupContext.negate(), EditorPartMultipleEditorGroupsContext), SideBarVisibleContext, AuxiliaryBarVisibleContext)
    });
  }
  async run(accessor) {
    const layoutService = accessor.get(IWorkbenchLayoutService);
    const editorGroupService = accessor.get(IEditorGroupsService);
    const editorService = accessor.get(IEditorService);
    if (editorService.activeEditor) {
      layoutService.setPartHidden(true, "workbench.parts.sidebar" /* SIDEBAR_PART */);
      layoutService.setPartHidden(true, "workbench.parts.auxiliarybar" /* AUXILIARYBAR_PART */);
      editorGroupService.arrangeGroups(0 /* MAXIMIZE */);
    }
  }
};

var ToggleMaximizeEditorGroupAction = class extends Action2 {
  constructor() {
    super({
      id: TOGGLE_MAXIMIZE_EDITOR_GROUP,
      title: localize2(6608, "Toggle Maximize Editor Group"),
      f1: true,
      category: Categories.View,
      precondition: ContextKeyExpr.or(EditorPartMultipleEditorGroupsContext, EditorPartMaximizedEditorGroupContext),
      keybinding: {
        weight: 200 /* WorkbenchContrib */,
        primary: KeyChord(2048 /* CtrlCmd */ | 41 /* KeyK */, 2048 /* CtrlCmd */ | 43 /* KeyM */)
      },
      menu: [
        {
          id: MenuId.EditorTitle,
          order: -1e4,
          // towards the front
          group: "navigation",
          when: EditorPartMaximizedEditorGroupContext
        },
        {
          id: MenuId.EmptyEditorGroup,
          order: -1e4,
          // towards the front
          group: "navigation",
          when: EditorPartMaximizedEditorGroupContext
        }
      ],
      icon: Codicon.screenFull,
      toggled: {
        condition: EditorPartMaximizedEditorGroupContext,
        title: localize(6609, null)
      }
    });
  }
  async run(accessor, ...args2) {
    const editorGroupsService = accessor.get(IEditorGroupsService);
    const editorService = accessor.get(IEditorService);
    const listService = accessor.get(IListService);
    const resolvedContext = resolveCommandsContext(args2, editorService, editorGroupsService, listService);
    if (resolvedContext.groupedEditors.length) {
      editorGroupsService.toggleMaximizeGroup(resolvedContext.groupedEditors[0].group);
    }
  }
};

var AbstractNavigateEditorAction = class extends Action2 {
  async run(accessor) {
    const editorGroupService = accessor.get(IEditorGroupsService);
    const result = this.navigate(editorGroupService);
    if (!result) {
      return;
    }
    const { groupId, editor } = result;
    if (!editor) {
      return;
    }
    const group2 = editorGroupService.getGroup(groupId);
    if (group2) {
      await group2.openEditor(editor);
    }
  }
};

var OpenNextEditor = class extends AbstractNavigateEditorAction {
  constructor() {
    super({
      id: "workbench.action.nextEditor",
      title: localize2(6570, "Open Next Editor"),
      f1: true,
      keybinding: {
        weight: 200 /* WorkbenchContrib */,
        primary: 2048 /* CtrlCmd */ | 12 /* PageDown */,
        mac: {
          primary: 2048 /* CtrlCmd */ | 512 /* Alt */ | 17 /* RightArrow */,
          secondary: [2048 /* CtrlCmd */ | 1024 /* Shift */ | 94 /* BracketRight */]
        }
      },
      category: Categories.View
    });
  }
  navigate(editorGroupService) {
    const activeGroup = editorGroupService.activeGroup;
    const activeGroupEditors = activeGroup.getEditors(1 /* SEQUENTIAL */);
    const activeEditorIndex = activeGroup.activeEditor ? activeGroupEditors.indexOf(activeGroup.activeEditor) : -1;
    if (activeEditorIndex + 1 < activeGroupEditors.length) {
      return { editor: activeGroupEditors[activeEditorIndex + 1], groupId: activeGroup.id };
    }
    const handledGroups = /* @__PURE__ */ new Set();
    let currentGroup = editorGroupService.activeGroup;
    while (currentGroup && !handledGroups.has(currentGroup.id)) {
      currentGroup = editorGroupService.findGroup({ location: 2 /* NEXT */ }, currentGroup, true);
      if (currentGroup) {
        handledGroups.add(currentGroup.id);
        const groupEditors = currentGroup.getEditors(1 /* SEQUENTIAL */);
        if (groupEditors.length > 0) {
          return { editor: groupEditors[0], groupId: currentGroup.id };
        }
      }
    }
    return void 0;
  }
};

var OpenPreviousEditor = class extends AbstractNavigateEditorAction {
  constructor() {
    super({
      id: "workbench.action.previousEditor",
      title: localize2(6573, "Open Previous Editor"),
      f1: true,
      keybinding: {
        weight: 200 /* WorkbenchContrib */,
        primary: 2048 /* CtrlCmd */ | 11 /* PageUp */,
        mac: {
          primary: 2048 /* CtrlCmd */ | 512 /* Alt */ | 15 /* LeftArrow */,
          secondary: [2048 /* CtrlCmd */ | 1024 /* Shift */ | 92 /* BracketLeft */]
        }
      },
      category: Categories.View
    });
  }
  navigate(editorGroupService) {
    const activeGroup = editorGroupService.activeGroup;
    const activeGroupEditors = activeGroup.getEditors(1 /* SEQUENTIAL */);
    const activeEditorIndex = activeGroup.activeEditor ? activeGroupEditors.indexOf(activeGroup.activeEditor) : -1;
    if (activeEditorIndex > 0) {
      return { editor: activeGroupEditors[activeEditorIndex - 1], groupId: activeGroup.id };
    }
    const handledGroups = /* @__PURE__ */ new Set();
    let currentGroup = editorGroupService.activeGroup;
    while (currentGroup && !handledGroups.has(currentGroup.id)) {
      currentGroup = editorGroupService.findGroup({ location: 3 /* PREVIOUS */ }, currentGroup, true);
      if (currentGroup) {
        handledGroups.add(currentGroup.id);
        const groupEditors = currentGroup.getEditors(1 /* SEQUENTIAL */);
        if (groupEditors.length > 0) {
          return { editor: groupEditors[groupEditors.length - 1], groupId: currentGroup.id };
        }
      }
    }
    return void 0;
  }
};

var OpenNextEditorInGroup = class extends AbstractNavigateEditorAction {
  constructor() {
    super({
      id: "workbench.action.nextEditorInGroup",
      title: localize2(6569, "Open Next Editor in Group"),
      f1: true,
      keybinding: {
        weight: 200 /* WorkbenchContrib */,
        primary: KeyChord(2048 /* CtrlCmd */ | 41 /* KeyK */, 2048 /* CtrlCmd */ | 12 /* PageDown */),
        mac: {
          primary: KeyChord(2048 /* CtrlCmd */ | 41 /* KeyK */, 2048 /* CtrlCmd */ | 512 /* Alt */ | 17 /* RightArrow */)
        }
      },
      category: Categories.View
    });
  }
  navigate(editorGroupService) {
    const group2 = editorGroupService.activeGroup;
    const editors = group2.getEditors(1 /* SEQUENTIAL */);
    const index2 = group2.activeEditor ? editors.indexOf(group2.activeEditor) : -1;
    return { editor: index2 + 1 < editors.length ? editors[index2 + 1] : editors[0], groupId: group2.id };
  }
};

var OpenPreviousEditorInGroup = class extends AbstractNavigateEditorAction {
  constructor() {
    super({
      id: "workbench.action.previousEditorInGroup",
      title: localize2(6574, "Open Previous Editor in Group"),
      f1: true,
      keybinding: {
        weight: 200 /* WorkbenchContrib */,
        primary: KeyChord(2048 /* CtrlCmd */ | 41 /* KeyK */, 2048 /* CtrlCmd */ | 11 /* PageUp */),
        mac: {
          primary: KeyChord(2048 /* CtrlCmd */ | 41 /* KeyK */, 2048 /* CtrlCmd */ | 512 /* Alt */ | 15 /* LeftArrow */)
        }
      },
      category: Categories.View
    });
  }
  navigate(editorGroupService) {
    const group2 = editorGroupService.activeGroup;
    const editors = group2.getEditors(1 /* SEQUENTIAL */);
    const index2 = group2.activeEditor ? editors.indexOf(group2.activeEditor) : -1;
    return { editor: index2 > 0 ? editors[index2 - 1] : editors[editors.length - 1], groupId: group2.id };
  }
};

var OpenFirstEditorInGroup = class extends AbstractNavigateEditorAction {
  constructor() {
    super({
      id: "workbench.action.firstEditorInGroup",
      title: localize2(6507, "Open First Editor in Group"),
      f1: true,
      category: Categories.View
    });
  }
  navigate(editorGroupService) {
    const group2 = editorGroupService.activeGroup;
    const editors = group2.getEditors(1 /* SEQUENTIAL */);
    return { editor: editors[0], groupId: group2.id };
  }
};

var OpenLastEditorInGroup = class extends AbstractNavigateEditorAction {
  constructor() {
    super({
      id: "workbench.action.lastEditorInGroup",
      title: localize2(6519, "Open Last Editor in Group"),
      f1: true,
      keybinding: {
        weight: 200 /* WorkbenchContrib */,
        primary: 512 /* Alt */ | 21 /* Digit0 */,
        secondary: [2048 /* CtrlCmd */ | 30 /* Digit9 */],
        mac: {
          primary: 256 /* WinCtrl */ | 21 /* Digit0 */,
          secondary: [2048 /* CtrlCmd */ | 30 /* Digit9 */]
        }
      },
      category: Categories.View
    });
  }
  navigate(editorGroupService) {
    const group2 = editorGroupService.activeGroup;
    const editors = group2.getEditors(1 /* SEQUENTIAL */);
    return { editor: editors[editors.length - 1], groupId: group2.id };
  }
};

var NavigateForwardAction = class _NavigateForwardAction extends Action2 {
  static {
    this.ID = "workbench.action.navigateForward";
  }
  static {
    this.LABEL = localize(6555, null);
  }
  constructor() {
    super({
      id: _NavigateForwardAction.ID,
      title: {
        ...localize2(6556, "Go Forward"),
        mnemonicTitle: localize(6524, null)
      },
      f1: true,
      icon: Codicon.arrowRight,
      precondition: ContextKeyExpr.has("canNavigateForward"),
      keybinding: {
        weight: 200 /* WorkbenchContrib */,
        win: { primary: 512 /* Alt */ | 17 /* RightArrow */, secondary: [123 /* BrowserForward */] },
        mac: { primary: 256 /* WinCtrl */ | 1024 /* Shift */ | 88 /* Minus */, secondary: [123 /* BrowserForward */] },
        linux: { primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 88 /* Minus */, secondary: [123 /* BrowserForward */] }
      },
      menu: [
        { id: MenuId.MenubarGoMenu, group: "1_history_nav", order: 2 },
        { id: MenuId.CommandCenter, order: 2, when: ContextKeyExpr.has("config.workbench.navigationControl.enabled") }
      ]
    });
  }
  async run(accessor) {
    const historyService = accessor.get(IHistoryService);
    await historyService.goForward(0 /* NONE */);
  }
};

var NavigateBackwardsAction = class _NavigateBackwardsAction extends Action2 {
  static {
    this.ID = "workbench.action.navigateBack";
  }
  static {
    this.LABEL = localize(6549, null);
  }
  constructor() {
    super({
      id: _NavigateBackwardsAction.ID,
      title: {
        ...localize2(6550, "Go Back"),
        mnemonicTitle: localize(6521, null)
      },
      f1: true,
      precondition: ContextKeyExpr.has("canNavigateBack"),
      icon: Codicon.arrowLeft,
      keybinding: {
        weight: 200 /* WorkbenchContrib */,
        win: { primary: 512 /* Alt */ | 15 /* LeftArrow */, secondary: [122 /* BrowserBack */] },
        mac: { primary: 256 /* WinCtrl */ | 88 /* Minus */, secondary: [122 /* BrowserBack */] },
        linux: { primary: 2048 /* CtrlCmd */ | 512 /* Alt */ | 88 /* Minus */, secondary: [122 /* BrowserBack */] }
      },
      menu: [
        { id: MenuId.MenubarGoMenu, group: "1_history_nav", order: 1 },
        { id: MenuId.CommandCenter, order: 1, when: ContextKeyExpr.has("config.workbench.navigationControl.enabled") }
      ]
    });
  }
  async run(accessor) {
    const historyService = accessor.get(IHistoryService);
    await historyService.goBack(0 /* NONE */);
  }
};

var NavigatePreviousAction = class extends Action2 {
  constructor() {
    super({
      id: "workbench.action.navigateLast",
      title: localize2(6559, "Go Previous"),
      f1: true
    });
  }
  async run(accessor) {
    const historyService = accessor.get(IHistoryService);
    await historyService.goPrevious(0 /* NONE */);
  }
};

var NavigateForwardInEditsAction = class extends Action2 {
  constructor() {
    super({
      id: "workbench.action.navigateForwardInEditLocations",
      title: localize2(6557, "Go Forward in Edit Locations"),
      f1: true
    });
  }
  async run(accessor) {
    const historyService = accessor.get(IHistoryService);
    await historyService.goForward(1 /* EDITS */);
  }
};

var NavigateBackwardsInEditsAction = class extends Action2 {
  constructor() {
    super({
      id: "workbench.action.navigateBackInEditLocations",
      title: localize2(6551, "Go Back in Edit Locations"),
      f1: true
    });
  }
  async run(accessor) {
    const historyService = accessor.get(IHistoryService);
    await historyService.goBack(1 /* EDITS */);
  }
};

var NavigatePreviousInEditsAction = class extends Action2 {
  constructor() {
    super({
      id: "workbench.action.navigatePreviousInEditLocations",
      title: localize2(6560, "Go Previous in Edit Locations"),
      f1: true
    });
  }
  async run(accessor) {
    const historyService = accessor.get(IHistoryService);
    await historyService.goPrevious(1 /* EDITS */);
  }
};

var NavigateToLastEditLocationAction = class extends Action2 {
  constructor() {
    super({
      id: "workbench.action.navigateToLastEditLocation",
      title: localize2(6562, "Go to Last Edit Location"),
      f1: true,
      keybinding: {
        weight: 200 /* WorkbenchContrib */,
        primary: KeyChord(2048 /* CtrlCmd */ | 41 /* KeyK */, 2048 /* CtrlCmd */ | 47 /* KeyQ */)
      }
    });
  }
  async run(accessor) {
    const historyService = accessor.get(IHistoryService);
    await historyService.goLast(1 /* EDITS */);
  }
};

var NavigateForwardInNavigationsAction = class extends Action2 {
  constructor() {
    super({
      id: "workbench.action.navigateForwardInNavigationLocations",
      title: localize2(6558, "Go Forward in Navigation Locations"),
      f1: true
    });
  }
  async run(accessor) {
    const historyService = accessor.get(IHistoryService);
    await historyService.goForward(2 /* NAVIGATION */);
  }
};

var NavigateBackwardsInNavigationsAction = class extends Action2 {
  constructor() {
    super({
      id: "workbench.action.navigateBackInNavigationLocations",
      title: localize2(6552, "Go Back in Navigation Locations"),
      f1: true
    });
  }
  async run(accessor) {
    const historyService = accessor.get(IHistoryService);
    await historyService.goBack(2 /* NAVIGATION */);
  }
};

var NavigatePreviousInNavigationsAction = class extends Action2 {
  constructor() {
    super({
      id: "workbench.action.navigatePreviousInNavigationLocations",
      title: localize2(6561, "Go Previous in Navigation Locations"),
      f1: true
    });
  }
  async run(accessor) {
    const historyService = accessor.get(IHistoryService);
    await historyService.goPrevious(2 /* NAVIGATION */);
  }
};

var NavigateToLastNavigationLocationAction = class extends Action2 {
  constructor() {
    super({
      id: "workbench.action.navigateToLastNavigationLocation",
      title: localize2(6563, "Go to Last Navigation Location"),
      f1: true
    });
  }
  async run(accessor) {
    const historyService = accessor.get(IHistoryService);
    await historyService.goLast(2 /* NAVIGATION */);
  }
};

var ReopenClosedEditorAction = class _ReopenClosedEditorAction extends Action2 {
  static {
    this.ID = "workbench.action.reopenClosedEditor";
  }
  constructor() {
    super({
      id: _ReopenClosedEditorAction.ID,
      title: localize2(6581, "Reopen Closed Editor"),
      f1: true,
      keybinding: {
        weight: 200 /* WorkbenchContrib */,
        primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 50 /* KeyT */
      },
      category: Categories.View
    });
  }
  async run(accessor) {
    const historyService = accessor.get(IHistoryService);
    await historyService.reopenLastClosedEditor();
  }
};

var ClearRecentFilesAction = class _ClearRecentFilesAction extends Action2 {
  static {
    this.ID = "workbench.action.clearRecentFiles";
  }
  constructor() {
    super({
      id: _ClearRecentFilesAction.ID,
      title: localize2(6480, "Clear Recently Opened..."),
      f1: true,
      category: Categories.File
    });
  }
  async run(accessor) {
    const dialogService = accessor.get(IDialogService);
    const workspacesService = accessor.get(IWorkspacesService);
    const historyService = accessor.get(IHistoryService);
    const { confirmed } = await dialogService.confirm({
      type: "warning",
      message: localize(6491, null),
      detail: localize(6489, null),
      primaryButton: localize(6477, null)
    });
    if (!confirmed) {
      return;
    }
    workspacesService.clearRecentlyOpened();
    historyService.clearRecentlyOpened();
  }
};

var ShowEditorsInActiveGroupByMostRecentlyUsedAction = class _ShowEditorsInActiveGroupByMostRecentlyUsedAction extends Action2 {
  static {
    this.ID = "workbench.action.showEditorsInActiveGroup";
  }
  constructor() {
    super({
      id: _ShowEditorsInActiveGroupByMostRecentlyUsedAction.ID,
      title: localize2(6588, "Show Editors in Active Group By Most Recently Used"),
      f1: true,
      category: Categories.View
    });
  }
  async run(accessor) {
    const quickInputService = accessor.get(IQuickInputService);
    quickInputService.quickAccess.show(ActiveGroupEditorsByMostRecentlyUsedQuickAccess.PREFIX);
  }
};

var ShowAllEditorsByAppearanceAction = class _ShowAllEditorsByAppearanceAction extends Action2 {
  static {
    this.ID = "workbench.action.showAllEditors";
  }
  constructor() {
    super({
      id: _ShowAllEditorsByAppearanceAction.ID,
      title: localize2(6586, "Show All Editors By Appearance"),
      f1: true,
      keybinding: {
        weight: 200 /* WorkbenchContrib */,
        primary: KeyChord(2048 /* CtrlCmd */ | 41 /* KeyK */, 2048 /* CtrlCmd */ | 46 /* KeyP */),
        mac: {
          primary: 2048 /* CtrlCmd */ | 512 /* Alt */ | 2 /* Tab */
        }
      },
      category: Categories.File
    });
  }
  async run(accessor) {
    const quickInputService = accessor.get(IQuickInputService);
    quickInputService.quickAccess.show(AllEditorsByAppearanceQuickAccess.PREFIX);
  }
};

var ShowAllEditorsByMostRecentlyUsedAction = class _ShowAllEditorsByMostRecentlyUsedAction extends Action2 {
  static {
    this.ID = "workbench.action.showAllEditorsByMostRecentlyUsed";
  }
  constructor() {
    super({
      id: _ShowAllEditorsByMostRecentlyUsedAction.ID,
      title: localize2(6587, "Show All Editors By Most Recently Used"),
      f1: true,
      category: Categories.View
    });
  }
  async run(accessor) {
    const quickInputService = accessor.get(IQuickInputService);
    quickInputService.quickAccess.show(AllEditorsByMostRecentlyUsedQuickAccess.PREFIX);
  }
};

var AbstractQuickAccessEditorAction = class extends Action2 {
  constructor(desc, prefix, itemActivation) {
    super(desc);
    this.prefix = prefix;
    this.itemActivation = itemActivation;
  }
  async run(accessor) {
    const keybindingService = accessor.get(IKeybindingService);
    const quickInputService = accessor.get(IQuickInputService);
    const keybindings = keybindingService.lookupKeybindings(this.desc.id);
    quickInputService.quickAccess.show(this.prefix, {
      quickNavigateConfiguration: { keybindings },
      itemActivation: this.itemActivation
    });
  }
};

var QuickAccessPreviousRecentlyUsedEditorAction = class extends AbstractQuickAccessEditorAction {
  constructor() {
    super({
      id: "workbench.action.quickOpenPreviousRecentlyUsedEditor",
      title: localize2(6579, "Quick Open Previous Recently Used Editor"),
      f1: true,
      category: Categories.View
    }, AllEditorsByMostRecentlyUsedQuickAccess.PREFIX, void 0);
  }
};

var QuickAccessLeastRecentlyUsedEditorAction = class extends AbstractQuickAccessEditorAction {
  constructor() {
    super({
      id: "workbench.action.quickOpenLeastRecentlyUsedEditor",
      title: localize2(6577, "Quick Open Least Recently Used Editor"),
      f1: true,
      category: Categories.View
    }, AllEditorsByMostRecentlyUsedQuickAccess.PREFIX, void 0);
  }
};

var QuickAccessPreviousRecentlyUsedEditorInGroupAction = class extends AbstractQuickAccessEditorAction {
  constructor() {
    super({
      id: "workbench.action.quickOpenPreviousRecentlyUsedEditorInGroup",
      title: localize2(6580, "Quick Open Previous Recently Used Editor in Group"),
      f1: true,
      keybinding: {
        weight: 200 /* WorkbenchContrib */,
        primary: 2048 /* CtrlCmd */ | 2 /* Tab */,
        mac: {
          primary: 256 /* WinCtrl */ | 2 /* Tab */
        }
      },
      precondition: ActiveEditorGroupEmptyContext.toNegated(),
      category: Categories.View
    }, ActiveGroupEditorsByMostRecentlyUsedQuickAccess.PREFIX, void 0);
  }
};

var QuickAccessLeastRecentlyUsedEditorInGroupAction = class extends AbstractQuickAccessEditorAction {
  constructor() {
    super({
      id: "workbench.action.quickOpenLeastRecentlyUsedEditorInGroup",
      title: localize2(6578, "Quick Open Least Recently Used Editor in Group"),
      f1: true,
      keybinding: {
        weight: 200 /* WorkbenchContrib */,
        primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 2 /* Tab */,
        mac: {
          primary: 256 /* WinCtrl */ | 1024 /* Shift */ | 2 /* Tab */
        }
      },
      precondition: ActiveEditorGroupEmptyContext.toNegated(),
      category: Categories.View
    }, ActiveGroupEditorsByMostRecentlyUsedQuickAccess.PREFIX, 3 /* LAST */);
  }
};

var QuickAccessPreviousEditorFromHistoryAction = class _QuickAccessPreviousEditorFromHistoryAction extends Action2 {
  static {
    this.ID = "workbench.action.openPreviousEditorFromHistory";
  }
  constructor() {
    super({
      id: _QuickAccessPreviousEditorFromHistoryAction.ID,
      title: localize2(6554, "Quick Open Previous Editor from History"),
      f1: true
    });
  }
  async run(accessor) {
    const keybindingService = accessor.get(IKeybindingService);
    const quickInputService = accessor.get(IQuickInputService);
    const editorGroupService = accessor.get(IEditorGroupsService);
    const keybindings = keybindingService.lookupKeybindings(_QuickAccessPreviousEditorFromHistoryAction.ID);
    let itemActivation = void 0;
    if (editorGroupService.activeGroup.count === 0) {
      itemActivation = 1 /* FIRST */;
    }
    quickInputService.quickAccess.show("", { quickNavigateConfiguration: { keybindings }, itemActivation });
  }
};

var OpenNextRecentlyUsedEditorAction = class extends Action2 {
  constructor() {
    super({
      id: "workbench.action.openNextRecentlyUsedEditor",
      title: localize2(6571, "Open Next Recently Used Editor"),
      f1: true,
      category: Categories.View
    });
  }
  async run(accessor) {
    const historyService = accessor.get(IHistoryService);
    historyService.openNextRecentlyUsedEditor();
  }
};

var OpenPreviousRecentlyUsedEditorAction = class extends Action2 {
  constructor() {
    super({
      id: "workbench.action.openPreviousRecentlyUsedEditor",
      title: localize2(6575, "Open Previous Recently Used Editor"),
      f1: true,
      category: Categories.View
    });
  }
  async run(accessor) {
    const historyService = accessor.get(IHistoryService);
    historyService.openPreviouslyUsedEditor();
  }
};

var OpenNextRecentlyUsedEditorInGroupAction = class extends Action2 {
  constructor() {
    super({
      id: "workbench.action.openNextRecentlyUsedEditorInGroup",
      title: localize2(6572, "Open Next Recently Used Editor In Group"),
      f1: true,
      category: Categories.View
    });
  }
  async run(accessor) {
    const historyService = accessor.get(IHistoryService);
    const editorGroupsService = accessor.get(IEditorGroupsService);
    historyService.openNextRecentlyUsedEditor(editorGroupsService.activeGroup.id);
  }
};

var OpenPreviousRecentlyUsedEditorInGroupAction = class extends Action2 {
  constructor() {
    super({
      id: "workbench.action.openPreviousRecentlyUsedEditorInGroup",
      title: localize2(6576, "Open Previous Recently Used Editor In Group"),
      f1: true,
      category: Categories.View
    });
  }
  async run(accessor) {
    const historyService = accessor.get(IHistoryService);
    const editorGroupsService = accessor.get(IEditorGroupsService);
    historyService.openPreviouslyUsedEditor(editorGroupsService.activeGroup.id);
  }
};

var ClearEditorHistoryWithoutConfirmAction = class extends Action2 {
  constructor() {
    super({
      id: "workbench.action.clearEditorHistoryWithoutConfirm",
      title: localize2(6479, "Clear Editor History without Confirmation"),
      f1: true,
      precondition: InAutomationContext
    });
  }
  async run(accessor) {
    const historyService = accessor.get(IHistoryService);
    historyService.clear();
  }
};

var ClearEditorHistoryAction = class extends Action2 {
  constructor() {
    super({
      id: "workbench.action.clearEditorHistory",
      title: localize2(6478, "Clear Editor History"),
      f1: true
    });
  }
  async run(accessor) {
    const dialogService = accessor.get(IDialogService);
    const historyService = accessor.get(IHistoryService);
    const { confirmed } = await dialogService.confirm({
      type: "warning",
      message: localize(6490, null),
      detail: localize(6489, null),
      primaryButton: localize(6477, null)
    });
    if (!confirmed) {
      return;
    }
    historyService.clear();
  }
};

var MoveEditorLeftInGroupAction = class extends ExecuteCommandAction {
  constructor() {
    super({
      id: "workbench.action.moveEditorLeftInGroup",
      title: localize2(6536, "Move Editor Left"),
      keybinding: {
        weight: 200 /* WorkbenchContrib */,
        primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 11 /* PageUp */,
        mac: {
          primary: KeyChord(2048 /* CtrlCmd */ | 41 /* KeyK */, 2048 /* CtrlCmd */ | 1024 /* Shift */ | 15 /* LeftArrow */)
        }
      },
      f1: true,
      category: Categories.View
    }, MOVE_ACTIVE_EDITOR_COMMAND_ID, { to: "left" });
  }
};

var MoveEditorRightInGroupAction = class extends ExecuteCommandAction {
  constructor() {
    super({
      id: "workbench.action.moveEditorRightInGroup",
      title: localize2(6537, "Move Editor Right"),
      keybinding: {
        weight: 200 /* WorkbenchContrib */,
        primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 12 /* PageDown */,
        mac: {
          primary: KeyChord(2048 /* CtrlCmd */ | 41 /* KeyK */, 2048 /* CtrlCmd */ | 1024 /* Shift */ | 17 /* RightArrow */)
        }
      },
      f1: true,
      category: Categories.View
    }, MOVE_ACTIVE_EDITOR_COMMAND_ID, { to: "right" });
  }
};

var MoveEditorToStartAction = class extends ExecuteCommandAction {
  constructor() {
    super({
      id: "workbench.action.moveEditorToStart",
      title: localize2(6548, "Move Editor to Start"),
      f1: true,
      category: Categories.View
    }, MOVE_ACTIVE_EDITOR_COMMAND_ID, { to: "first" });
  }
};

var MoveEditorToEndAction = class extends ExecuteCommandAction {
  constructor() {
    super({
      id: "workbench.action.moveEditorToEnd",
      title: localize2(6540, "Move Editor to End"),
      f1: true,
      category: Categories.View
    }, MOVE_ACTIVE_EDITOR_COMMAND_ID, { to: "last" });
  }
};

var MoveEditorToPreviousGroupAction = class extends ExecuteCommandAction {
  constructor() {
    super({
      id: "workbench.action.moveEditorToPreviousGroup",
      title: localize2(6546, "Move Editor into Previous Group"),
      keybinding: {
        weight: 200 /* WorkbenchContrib */,
        primary: 2048 /* CtrlCmd */ | 512 /* Alt */ | 15 /* LeftArrow */,
        mac: {
          primary: 2048 /* CtrlCmd */ | 256 /* WinCtrl */ | 15 /* LeftArrow */
        }
      },
      f1: true,
      category: Categories.View
    }, MOVE_ACTIVE_EDITOR_COMMAND_ID, { to: "previous", by: "group" });
  }
};

var MoveEditorToNextGroupAction = class extends ExecuteCommandAction {
  constructor() {
    super({
      id: "workbench.action.moveEditorToNextGroup",
      title: localize2(6545, "Move Editor into Next Group"),
      f1: true,
      keybinding: {
        weight: 200 /* WorkbenchContrib */,
        primary: 2048 /* CtrlCmd */ | 512 /* Alt */ | 17 /* RightArrow */,
        mac: {
          primary: 2048 /* CtrlCmd */ | 256 /* WinCtrl */ | 17 /* RightArrow */
        }
      },
      category: Categories.View
    }, MOVE_ACTIVE_EDITOR_COMMAND_ID, { to: "next", by: "group" });
  }
};

var MoveEditorToAboveGroupAction = class extends ExecuteCommandAction {
  constructor() {
    super({
      id: MOVE_EDITOR_INTO_ABOVE_GROUP,
      title: localize2(6538, "Move Editor into Group Above"),
      f1: true,
      category: Categories.View
    }, MOVE_EDITOR_INTO_ABOVE_GROUP);
  }
};

var MoveEditorToBelowGroupAction = class extends ExecuteCommandAction {
  constructor() {
    super({
      id: MOVE_EDITOR_INTO_BELOW_GROUP,
      title: localize2(6539, "Move Editor into Group Below"),
      f1: true,
      category: Categories.View
    }, MOVE_EDITOR_INTO_BELOW_GROUP);
  }
};

var MoveEditorToLeftGroupAction = class extends ExecuteCommandAction {
  constructor() {
    super({
      id: MOVE_EDITOR_INTO_LEFT_GROUP,
      title: localize2(6543, "Move Editor into Left Group"),
      f1: true,
      category: Categories.View
    }, MOVE_EDITOR_INTO_LEFT_GROUP);
  }
};

var MoveEditorToRightGroupAction = class extends ExecuteCommandAction {
  constructor() {
    super({
      id: MOVE_EDITOR_INTO_RIGHT_GROUP,
      title: localize2(6547, "Move Editor into Right Group"),
      f1: true,
      category: Categories.View
    }, MOVE_EDITOR_INTO_RIGHT_GROUP);
  }
};

var MoveEditorToFirstGroupAction = class extends ExecuteCommandAction {
  constructor() {
    super({
      id: "workbench.action.moveEditorToFirstGroup",
      title: localize2(6541, "Move Editor into First Group"),
      f1: true,
      keybinding: {
        weight: 200 /* WorkbenchContrib */,
        primary: 1024 /* Shift */ | 512 /* Alt */ | 22 /* Digit1 */,
        mac: {
          primary: 2048 /* CtrlCmd */ | 256 /* WinCtrl */ | 22 /* Digit1 */
        }
      },
      category: Categories.View
    }, MOVE_ACTIVE_EDITOR_COMMAND_ID, { to: "first", by: "group" });
  }
};

var MoveEditorToLastGroupAction = class extends ExecuteCommandAction {
  constructor() {
    super({
      id: "workbench.action.moveEditorToLastGroup",
      title: localize2(6542, "Move Editor into Last Group"),
      f1: true,
      keybinding: {
        weight: 200 /* WorkbenchContrib */,
        primary: 1024 /* Shift */ | 512 /* Alt */ | 30 /* Digit9 */,
        mac: {
          primary: 2048 /* CtrlCmd */ | 256 /* WinCtrl */ | 30 /* Digit9 */
        }
      },
      category: Categories.View
    }, MOVE_ACTIVE_EDITOR_COMMAND_ID, { to: "last", by: "group" });
  }
};

var SplitEditorToPreviousGroupAction = class extends ExecuteCommandAction {
  constructor() {
    super({
      id: "workbench.action.splitEditorToPreviousGroup",
      title: localize2(6604, "Split Editor into Previous Group"),
      f1: true,
      category: Categories.View
    }, COPY_ACTIVE_EDITOR_COMMAND_ID, { to: "previous", by: "group" });
  }
};

var SplitEditorToNextGroupAction = class extends ExecuteCommandAction {
  constructor() {
    super({
      id: "workbench.action.splitEditorToNextGroup",
      title: localize2(6603, "Split Editor into Next Group"),
      f1: true,
      category: Categories.View
    }, COPY_ACTIVE_EDITOR_COMMAND_ID, { to: "next", by: "group" });
  }
};

var SplitEditorToAboveGroupAction = class extends ExecuteCommandAction {
  constructor() {
    super({
      id: "workbench.action.splitEditorToAboveGroup",
      title: localize2(6597, "Split Editor into Group Above"),
      f1: true,
      category: Categories.View
    }, COPY_ACTIVE_EDITOR_COMMAND_ID, { to: "up", by: "group" });
  }
};

var SplitEditorToBelowGroupAction = class extends ExecuteCommandAction {
  constructor() {
    super({
      id: "workbench.action.splitEditorToBelowGroup",
      title: localize2(6598, "Split Editor into Group Below"),
      f1: true,
      category: Categories.View
    }, COPY_ACTIVE_EDITOR_COMMAND_ID, { to: "down", by: "group" });
  }
};

var SplitEditorToLeftGroupAction = class extends ExecuteCommandAction {
  static {
    this.ID = "workbench.action.splitEditorToLeftGroup";
  }
  static {
    this.LABEL = localize(6601, null);
  }
  constructor() {
    super({
      id: "workbench.action.splitEditorToLeftGroup",
      title: localize2(6602, "Split Editor into Left Group"),
      f1: true,
      category: Categories.View
    }, COPY_ACTIVE_EDITOR_COMMAND_ID, { to: "left", by: "group" });
  }
};

var SplitEditorToRightGroupAction = class extends ExecuteCommandAction {
  constructor() {
    super({
      id: "workbench.action.splitEditorToRightGroup",
      title: localize2(6605, "Split Editor into Right Group"),
      f1: true,
      category: Categories.View
    }, COPY_ACTIVE_EDITOR_COMMAND_ID, { to: "right", by: "group" });
  }
};

var SplitEditorToFirstGroupAction = class extends ExecuteCommandAction {
  constructor() {
    super({
      id: "workbench.action.splitEditorToFirstGroup",
      title: localize2(6599, "Split Editor into First Group"),
      f1: true,
      category: Categories.View
    }, COPY_ACTIVE_EDITOR_COMMAND_ID, { to: "first", by: "group" });
  }
};

var SplitEditorToLastGroupAction = class extends ExecuteCommandAction {
  constructor() {
    super({
      id: "workbench.action.splitEditorToLastGroup",
      title: localize2(6600, "Split Editor into Last Group"),
      f1: true,
      category: Categories.View
    }, COPY_ACTIVE_EDITOR_COMMAND_ID, { to: "last", by: "group" });
  }
};

var EditorLayoutSingleAction = class _EditorLayoutSingleAction extends ExecuteCommandAction {
  static {
    this.ID = "workbench.action.editorLayoutSingle";
  }
  constructor() {
    super({
      id: _EditorLayoutSingleAction.ID,
      title: localize2(6498, "Single Column Editor Layout"),
      f1: true,
      category: Categories.View
    }, LAYOUT_EDITOR_GROUPS_COMMAND_ID, { groups: [{}], orientation: 0 /* HORIZONTAL */ });
  }
};

var EditorLayoutTwoColumnsAction = class _EditorLayoutTwoColumnsAction extends ExecuteCommandAction {
  static {
    this.ID = "workbench.action.editorLayoutTwoColumns";
  }
  constructor() {
    super({
      id: _EditorLayoutTwoColumnsAction.ID,
      title: localize2(6502, "Two Columns Editor Layout"),
      f1: true,
      category: Categories.View
    }, LAYOUT_EDITOR_GROUPS_COMMAND_ID, { groups: [{}, {}], orientation: 0 /* HORIZONTAL */ });
  }
};

var EditorLayoutThreeColumnsAction = class _EditorLayoutThreeColumnsAction extends ExecuteCommandAction {
  static {
    this.ID = "workbench.action.editorLayoutThreeColumns";
  }
  constructor() {
    super({
      id: _EditorLayoutThreeColumnsAction.ID,
      title: localize2(6499, "Three Columns Editor Layout"),
      f1: true,
      category: Categories.View
    }, LAYOUT_EDITOR_GROUPS_COMMAND_ID, { groups: [{}, {}, {}], orientation: 0 /* HORIZONTAL */ });
  }
};

var EditorLayoutTwoRowsAction = class _EditorLayoutTwoRowsAction extends ExecuteCommandAction {
  static {
    this.ID = "workbench.action.editorLayoutTwoRows";
  }
  constructor() {
    super({
      id: _EditorLayoutTwoRowsAction.ID,
      title: localize2(6504, "Two Rows Editor Layout"),
      f1: true,
      category: Categories.View
    }, LAYOUT_EDITOR_GROUPS_COMMAND_ID, { groups: [{}, {}], orientation: 1 /* VERTICAL */ });
  }
};

var EditorLayoutThreeRowsAction = class _EditorLayoutThreeRowsAction extends ExecuteCommandAction {
  static {
    this.ID = "workbench.action.editorLayoutThreeRows";
  }
  constructor() {
    super({
      id: _EditorLayoutThreeRowsAction.ID,
      title: localize2(6500, "Three Rows Editor Layout"),
      f1: true,
      category: Categories.View
    }, LAYOUT_EDITOR_GROUPS_COMMAND_ID, { groups: [{}, {}, {}], orientation: 1 /* VERTICAL */ });
  }
};

var EditorLayoutTwoByTwoGridAction = class _EditorLayoutTwoByTwoGridAction extends ExecuteCommandAction {
  static {
    this.ID = "workbench.action.editorLayoutTwoByTwoGrid";
  }
  constructor() {
    super({
      id: _EditorLayoutTwoByTwoGridAction.ID,
      title: localize2(6501, "Grid Editor Layout (2x2)"),
      f1: true,
      category: Categories.View
    }, LAYOUT_EDITOR_GROUPS_COMMAND_ID, { groups: [{ groups: [{}, {}] }, { groups: [{}, {}] }], orientation: 0 /* HORIZONTAL */ });
  }
};

var EditorLayoutTwoColumnsBottomAction = class _EditorLayoutTwoColumnsBottomAction extends ExecuteCommandAction {
  static {
    this.ID = "workbench.action.editorLayoutTwoColumnsBottom";
  }
  constructor() {
    super({
      id: _EditorLayoutTwoColumnsBottomAction.ID,
      title: localize2(6503, "Two Columns Bottom Editor Layout"),
      f1: true,
      category: Categories.View
    }, LAYOUT_EDITOR_GROUPS_COMMAND_ID, { groups: [{}, { groups: [{}, {}] }], orientation: 1 /* VERTICAL */ });
  }
};

var EditorLayoutTwoRowsRightAction = class _EditorLayoutTwoRowsRightAction extends ExecuteCommandAction {
  static {
    this.ID = "workbench.action.editorLayoutTwoRowsRight";
  }
  constructor() {
    super({
      id: _EditorLayoutTwoRowsRightAction.ID,
      title: localize2(6505, "Two Rows Right Editor Layout"),
      f1: true,
      category: Categories.View
    }, LAYOUT_EDITOR_GROUPS_COMMAND_ID, { groups: [{}, { groups: [{}, {}] }], orientation: 0 /* HORIZONTAL */ });
  }
};

var AbstractCreateEditorGroupAction = class extends Action2 {
  constructor(desc, direction) {
    super(desc);
    this.direction = direction;
  }
  async run(accessor) {
    const editorGroupService = accessor.get(IEditorGroupsService);
    const layoutService = accessor.get(IWorkbenchLayoutService);
    const activeDocument = getActiveDocument();
    const focusNewGroup = layoutService.hasFocus("workbench.parts.editor" /* EDITOR_PART */) || activeDocument.activeElement === activeDocument.body;
    const group2 = editorGroupService.addGroup(editorGroupService.activeGroup, this.direction);
    editorGroupService.activateGroup(group2);
    if (focusNewGroup) {
      group2.focus();
    }
  }
};

var NewEditorGroupLeftAction = class extends AbstractCreateEditorGroupAction {
  constructor() {
    super({
      id: "workbench.action.newGroupLeft",
      title: localize2(6567, "New Editor Group to the Left"),
      f1: true,
      category: Categories.View
    }, 2 /* LEFT */);
  }
};

var NewEditorGroupRightAction = class extends AbstractCreateEditorGroupAction {
  constructor() {
    super({
      id: "workbench.action.newGroupRight",
      title: localize2(6568, "New Editor Group to the Right"),
      f1: true,
      category: Categories.View
    }, 3 /* RIGHT */);
  }
};

var NewEditorGroupAboveAction = class extends AbstractCreateEditorGroupAction {
  constructor() {
    super({
      id: "workbench.action.newGroupAbove",
      title: localize2(6565, "New Editor Group Above"),
      f1: true,
      category: Categories.View
    }, 0 /* UP */);
  }
};

var NewEditorGroupBelowAction = class extends AbstractCreateEditorGroupAction {
  constructor() {
    super({
      id: "workbench.action.newGroupBelow",
      title: localize2(6566, "New Editor Group Below"),
      f1: true,
      category: Categories.View
    }, 1 /* DOWN */);
  }
};

var ToggleEditorTypeAction = class extends Action2 {
  constructor() {
    super({
      id: "workbench.action.toggleEditorType",
      title: localize2(6606, "Toggle Editor Type"),
      f1: true,
      category: Categories.View,
      precondition: ActiveEditorAvailableEditorIdsContext
    });
  }
  async run(accessor) {
    const editorService = accessor.get(IEditorService);
    const editorResolverService = accessor.get(IEditorResolverService);
    const activeEditorPane = editorService.activeEditorPane;
    if (!activeEditorPane) {
      return;
    }
    const activeEditorResource = EditorResourceAccessor.getCanonicalUri(activeEditorPane.input);
    if (!activeEditorResource) {
      return;
    }
    const editorIds = editorResolverService.getEditors(activeEditorResource).map((editor) => editor.id).filter((id2) => id2 !== activeEditorPane.input.editorId);
    if (editorIds.length === 0) {
      return;
    }
    await editorService.replaceEditors([
      {
        editor: activeEditorPane.input,
        replacement: {
          resource: activeEditorResource,
          options: {
            override: editorIds[0]
          }
        }
      }
    ], activeEditorPane.group);
  }
};

var ReOpenInTextEditorAction = class _ReOpenInTextEditorAction extends ExecuteCommandAction {
  static {
    this.ID = "workbench.action.reopenTextEditor";
  }
  static {
    this.TITLE = localize2(6582, "Reopen Editor with Text Editor");
  }
  constructor() {
    super({
      id: _ReOpenInTextEditorAction.ID,
      title: _ReOpenInTextEditorAction.TITLE,
      f1: true,
      category: Categories.View,
      precondition: ActiveEditorAvailableEditorIdsContext
    }, REOPEN_ACTIVE_EDITOR_WITH_COMMAND_ID, "default");
  }
};

var BaseMoveCopyEditorToNewWindowAction = class extends Action2 {
  constructor(id2, title, keybinding, move2) {
    super({
      id: id2,
      title,
      category: Categories.View,
      precondition: ActiveEditorContext,
      keybinding,
      f1: true
    });
    this.move = move2;
  }
  async run(accessor, ...args2) {
    const editorGroupsService = accessor.get(IEditorGroupsService);
    const editorService = accessor.get(IEditorService);
    const listService = accessor.get(IListService);
    const resolvedContext = resolveCommandsContext(args2, editorService, editorGroupsService, listService);
    if (!resolvedContext.groupedEditors.length) {
      return;
    }
    const auxiliaryEditorPart = await editorGroupsService.createAuxiliaryEditorPart();
    const { group: group2, editors } = resolvedContext.groupedEditors[0];
    const editorsWithOptions = prepareMoveCopyEditors(group2, editors, resolvedContext.preserveFocus);
    if (this.move) {
      group2.moveEditors(editorsWithOptions, auxiliaryEditorPart.activeGroup);
    } else {
      group2.copyEditors(editorsWithOptions, auxiliaryEditorPart.activeGroup);
    }
    auxiliaryEditorPart.activeGroup.focus();
  }
};

var MoveEditorToNewWindowAction = class extends BaseMoveCopyEditorToNewWindowAction {
  constructor() {
    super(
      MOVE_EDITOR_INTO_NEW_WINDOW_COMMAND_ID,
      {
        ...localize2(6544, "Move Editor into New Window"),
        mnemonicTitle: localize(6526, null)
      },
      void 0,
      true
    );
  }
};

var CopyEditorToNewindowAction = class extends BaseMoveCopyEditorToNewWindowAction {
  constructor() {
    super(
      COPY_EDITOR_INTO_NEW_WINDOW_COMMAND_ID,
      {
        ...localize2(6493, "Copy Editor into New Window"),
        mnemonicTitle: localize(6523, null)
      },
      { primary: KeyChord(2048 /* CtrlCmd */ | 41 /* KeyK */, 45 /* KeyO */), weight: 200 /* WorkbenchContrib */ },
      false
    );
  }
};

var BaseMoveCopyEditorGroupToNewWindowAction = class extends Action2 {
  constructor(id2, title, move2) {
    super({
      id: id2,
      title,
      category: Categories.View,
      f1: true
    });
    this.move = move2;
  }
  async run(accessor) {
    const editorGroupService = accessor.get(IEditorGroupsService);
    const activeGroup = editorGroupService.activeGroup;
    const auxiliaryEditorPart = await editorGroupService.createAuxiliaryEditorPart();
    editorGroupService.mergeGroup(activeGroup, auxiliaryEditorPart.activeGroup, {
      mode: this.move ? 1 /* MOVE_EDITORS */ : 0 /* COPY_EDITORS */
    });
    auxiliaryEditorPart.activeGroup.focus();
  }
};

var MoveEditorGroupToNewWindowAction = class extends BaseMoveCopyEditorGroupToNewWindowAction {
  constructor() {
    super(
      MOVE_EDITOR_GROUP_INTO_NEW_WINDOW_COMMAND_ID,
      {
        ...localize2(6535, "Move Editor Group into New Window"),
        mnemonicTitle: localize(6525, null)
      },
      true
    );
  }
};

var CopyEditorGroupToNewWindowAction = class extends BaseMoveCopyEditorGroupToNewWindowAction {
  constructor() {
    super(
      COPY_EDITOR_GROUP_INTO_NEW_WINDOW_COMMAND_ID,
      {
        ...localize2(6492, "Copy Editor Group into New Window"),
        mnemonicTitle: localize(6522, null)
      },
      false
    );
  }
};

var RestoreEditorsToMainWindowAction = class extends Action2 {
  constructor() {
    super({
      id: "workbench.action.restoreEditorsToMainWindow",
      title: {
        ...localize2(6583, "Restore Editors into Main Window"),
        mnemonicTitle: localize(6530, null)
      },
      f1: true,
      precondition: IsAuxiliaryWindowFocusedContext,
      category: Categories.View
    });
  }
  async run(accessor) {
    const editorGroupService = accessor.get(IEditorGroupsService);
    editorGroupService.mergeAllGroups(editorGroupService.mainPart.activeGroup);
  }
};

var NewEmptyEditorWindowAction = class extends Action2 {
  constructor() {
    super({
      id: NEW_EMPTY_EDITOR_WINDOW_COMMAND_ID,
      title: {
        ...localize2(6564, "New Empty Editor Window"),
        mnemonicTitle: localize(6527, null)
      },
      f1: true,
      category: Categories.View
    });
  }
  async run(accessor) {
    const editorGroupService = accessor.get(IEditorGroupsService);
    const auxiliaryEditorPart = await editorGroupService.createAuxiliaryEditorPart();
    auxiliaryEditorPart.activeGroup.focus();
  }
};
export { ExecuteCommandAction, AbstractSplitEditorAction, SplitEditorAction, SplitEditorOrthogonalAction, SplitEditorLeftAction, SplitEditorRightAction, SplitEditorUpAction, SplitEditorDownAction, JoinTwoGroupsAction, JoinAllGroupsAction, NavigateBetweenGroupsAction, FocusActiveGroupAction, AbstractFocusGroupAction, FocusFirstGroupAction, FocusLastGroupAction, FocusNextGroup, FocusPreviousGroup, FocusLeftGroup, FocusRightGroup, FocusAboveGroup, FocusBelowGroup, CloseEditorAction, UnpinEditorAction, CloseEditorTabAction, CloseOtherEditorTabsInGroupAction, RevertAndCloseEditorAction, CloseLeftEditorsInGroupAction, AbstractCloseAllAction, CloseAllEditorsAction, CloseAllEditorGroupsAction, CloseEditorsInOtherGroupsAction, CloseEditorInAllGroupsAction, AbstractMoveCopyGroupAction, AbstractMoveGroupAction, MoveGroupLeftAction, MoveGroupRightAction, MoveGroupUpAction, MoveGroupDownAction, AbstractDuplicateGroupAction, DuplicateGroupLeftAction, DuplicateGroupRightAction, DuplicateGroupUpAction, DuplicateGroupDownAction, MinimizeOtherGroupsAction, MinimizeOtherGroupsHideSidebarAction, ResetGroupSizesAction, ToggleGroupSizesAction, MaximizeGroupHideSidebarAction, ToggleMaximizeEditorGroupAction, AbstractNavigateEditorAction, OpenNextEditor, OpenPreviousEditor, OpenNextEditorInGroup, OpenPreviousEditorInGroup, OpenFirstEditorInGroup, OpenLastEditorInGroup, NavigateForwardAction, NavigateBackwardsAction, NavigatePreviousAction, NavigateForwardInEditsAction, NavigateBackwardsInEditsAction, NavigatePreviousInEditsAction, NavigateToLastEditLocationAction, NavigateForwardInNavigationsAction, NavigateBackwardsInNavigationsAction, NavigatePreviousInNavigationsAction, NavigateToLastNavigationLocationAction, ReopenClosedEditorAction, ClearRecentFilesAction, ShowEditorsInActiveGroupByMostRecentlyUsedAction, ShowAllEditorsByAppearanceAction, ShowAllEditorsByMostRecentlyUsedAction, AbstractQuickAccessEditorAction, QuickAccessPreviousRecentlyUsedEditorAction, QuickAccessLeastRecentlyUsedEditorAction, QuickAccessPreviousRecentlyUsedEditorInGroupAction, QuickAccessLeastRecentlyUsedEditorInGroupAction, QuickAccessPreviousEditorFromHistoryAction, OpenNextRecentlyUsedEditorAction, OpenPreviousRecentlyUsedEditorAction, OpenNextRecentlyUsedEditorInGroupAction, OpenPreviousRecentlyUsedEditorInGroupAction, ClearEditorHistoryWithoutConfirmAction, ClearEditorHistoryAction, MoveEditorLeftInGroupAction, MoveEditorRightInGroupAction, MoveEditorToStartAction, MoveEditorToEndAction, MoveEditorToPreviousGroupAction, MoveEditorToNextGroupAction, MoveEditorToAboveGroupAction, MoveEditorToBelowGroupAction, MoveEditorToLeftGroupAction, MoveEditorToRightGroupAction, MoveEditorToFirstGroupAction, MoveEditorToLastGroupAction, SplitEditorToPreviousGroupAction, SplitEditorToNextGroupAction, SplitEditorToAboveGroupAction, SplitEditorToBelowGroupAction, SplitEditorToLeftGroupAction, SplitEditorToRightGroupAction, SplitEditorToFirstGroupAction, SplitEditorToLastGroupAction, EditorLayoutSingleAction, EditorLayoutTwoColumnsAction, EditorLayoutThreeColumnsAction, EditorLayoutTwoRowsAction, EditorLayoutThreeRowsAction, EditorLayoutTwoByTwoGridAction, EditorLayoutTwoColumnsBottomAction, EditorLayoutTwoRowsRightAction, AbstractCreateEditorGroupAction, NewEditorGroupLeftAction, NewEditorGroupRightAction, NewEditorGroupAboveAction, NewEditorGroupBelowAction, ToggleEditorTypeAction, ReOpenInTextEditorAction, BaseMoveCopyEditorToNewWindowAction, MoveEditorToNewWindowAction, CopyEditorToNewindowAction, BaseMoveCopyEditorGroupToNewWindowAction, MoveEditorGroupToNewWindowAction, CopyEditorGroupToNewWindowAction, RestoreEditorsToMainWindowAction, NewEmptyEditorWindowAction };
