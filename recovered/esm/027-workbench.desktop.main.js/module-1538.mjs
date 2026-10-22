// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/browser/parts/editor/editorCommands.ts
import { isNumber, isObject, isString, isUndefined } from "./module-0010.mjs";
import { KeybindingsRegistry } from "./module-0091.mjs";
import { EditorContextKeys } from "./module-0154.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { CommandsRegistry, ICommandService } from "./module-0087.mjs";
import { resolveCommandsContext } from "./module-1537.mjs";
import { IEditorService, SIDE_GROUP } from "./module-0934.mjs";
import { IEditorGroupsService, preferredSideBySideGroupDirection } from "./module-0933.mjs";
import { IListService, RawWorkbenchListFocusContextKey, WorkbenchTreeFindOpen, WorkbenchTreeStickyScrollFocused } from "./module-0636.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { prepareMoveCopyEditors } from "./module-1088.mjs";
import { IOpenerService } from "./module-0272.mjs";
import { IPathService } from "./module-0938.mjs";
import { IUntitledTextEditorService } from "./module-1125.mjs";
import { URI } from "./module-0032.mjs";
import { Schemas, matchesScheme } from "./module-0033.mjs";
import { columnToEditorGroup } from "./module-1078.mjs";
import { extname2, isEqual2 } from "./module-0034.mjs";
import { KeyChord } from "./module-0019.mjs";
import { ContextKeyExpr } from "./module-0089.mjs";
import { ActiveEditorCanSplitInGroupContext, ActiveEditorGroupEmptyContext, ActiveEditorGroupLockedContext, ActiveEditorStickyContext, EditorPartModalContext, EditorPartModalMaximizedContext, EditorPartModalNavigationContext, EditorPartModalSidebarContext, IsSessionsWindowContext, MultipleEditorGroupsContext, SideBySideEditorActiveContext, TextCompareEditorActiveContext } from "./module-0949.mjs";
import { IEditorResolverService } from "./module-1113.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { ITextFileService } from "./module-1063.mjs";
import { IWorkingCopyService } from "./module-1072.mjs";
import { IWorkingCopyEditorService } from "./module-1396.mjs";
import { isDiffEditorInput, isEditorInputWithOptionsAndGroup } from "./module-0925.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { SideBySideEditorInput } from "./module-1095.mjs";
import { Action2, MenuId, registerAction2 } from "./module-0092.mjs";
import { Categories } from "./module-0847.mjs";
import { SideBySideEditor2 } from "./module-1532.mjs";
import { TextDiffEditor } from "./module-1534.mjs";
import { DIFF_FOCUS_OTHER_SIDE, DIFF_FOCUS_PRIMARY_SIDE, DIFF_FOCUS_SECONDARY_SIDE, registerDiffEditorCommands } from "./module-1536.mjs";
import { IQuickInputService } from "./module-0536.mjs";
import { ActiveGroupEditorsByMostRecentlyUsedQuickAccess } from "./module-1531.mjs";
import { Codicon } from "./module-0085.mjs";
import { mainWindow } from "./module-0002.mjs";


// src/vs/workbench/browser/parts/editor/editorCommands.ts
var CLOSE_SAVED_EDITORS_COMMAND_ID = "workbench.action.closeUnmodifiedEditors";

var CLOSE_EDITORS_IN_GROUP_COMMAND_ID = "workbench.action.closeEditorsInGroup";

var CLOSE_EDITORS_AND_GROUP_COMMAND_ID = "workbench.action.closeEditorsAndGroup";

var CLOSE_EDITORS_TO_THE_RIGHT_COMMAND_ID = "workbench.action.closeEditorsToTheRight";

var CLOSE_EDITOR_COMMAND_ID = "workbench.action.closeActiveEditor";

var CLOSE_PINNED_EDITOR_COMMAND_ID = "workbench.action.closeActivePinnedEditor";

var CLOSE_EDITOR_GROUP_COMMAND_ID = "workbench.action.closeGroup";

var CLOSE_OTHER_EDITORS_IN_GROUP_COMMAND_ID = "workbench.action.closeOtherEditors";

var MOVE_ACTIVE_EDITOR_COMMAND_ID = "moveActiveEditor";

var COPY_ACTIVE_EDITOR_COMMAND_ID = "copyActiveEditor";

var LAYOUT_EDITOR_GROUPS_COMMAND_ID = "layoutEditorGroups";

var KEEP_EDITOR_COMMAND_ID = "workbench.action.keepEditor";

var TOGGLE_KEEP_EDITORS_COMMAND_ID = "workbench.action.toggleKeepEditors";

var TOGGLE_LOCK_GROUP_COMMAND_ID = "workbench.action.toggleEditorGroupLock";

var LOCK_GROUP_COMMAND_ID = "workbench.action.lockEditorGroup";

var UNLOCK_GROUP_COMMAND_ID = "workbench.action.unlockEditorGroup";

var SHOW_EDITORS_IN_GROUP = "workbench.action.showEditorsInGroup";

var REOPEN_WITH_COMMAND_ID = "workbench.action.reopenWithEditor";

var REOPEN_ACTIVE_EDITOR_WITH_COMMAND_ID = "reopenActiveEditorWith";

var PIN_EDITOR_COMMAND_ID = "workbench.action.pinEditor";

var UNPIN_EDITOR_COMMAND_ID = "workbench.action.unpinEditor";

var SPLIT_EDITOR = "workbench.action.splitEditor";

var SPLIT_EDITOR_UP = "workbench.action.splitEditorUp";

var SPLIT_EDITOR_DOWN = "workbench.action.splitEditorDown";

var SPLIT_EDITOR_LEFT = "workbench.action.splitEditorLeft";

var SPLIT_EDITOR_RIGHT = "workbench.action.splitEditorRight";

var MOVE_EDITOR_INTO_ABOVE_GROUP = "workbench.action.moveEditorToAboveGroup";

var MOVE_EDITOR_INTO_BELOW_GROUP = "workbench.action.moveEditorToBelowGroup";

var MOVE_EDITOR_INTO_LEFT_GROUP = "workbench.action.moveEditorToLeftGroup";

var MOVE_EDITOR_INTO_RIGHT_GROUP = "workbench.action.moveEditorToRightGroup";

var TOGGLE_MAXIMIZE_EDITOR_GROUP = "workbench.action.toggleMaximizeEditorGroup";

var SPLIT_EDITOR_IN_GROUP = "workbench.action.splitEditorInGroup";

var TOGGLE_SPLIT_EDITOR_IN_GROUP = "workbench.action.toggleSplitEditorInGroup";

var JOIN_EDITOR_IN_GROUP = "workbench.action.joinEditorInGroup";

var TOGGLE_SPLIT_EDITOR_IN_GROUP_LAYOUT = "workbench.action.toggleSplitEditorInGroupLayout";

var FOCUS_FIRST_SIDE_EDITOR = "workbench.action.focusFirstSideEditor";

var FOCUS_SECOND_SIDE_EDITOR = "workbench.action.focusSecondSideEditor";

var FOCUS_OTHER_SIDE_EDITOR = "workbench.action.focusOtherSideEditor";

var FOCUS_LEFT_GROUP_WITHOUT_WRAP_COMMAND_ID = "workbench.action.focusLeftGroupWithoutWrap";

var FOCUS_RIGHT_GROUP_WITHOUT_WRAP_COMMAND_ID = "workbench.action.focusRightGroupWithoutWrap";

var FOCUS_ABOVE_GROUP_WITHOUT_WRAP_COMMAND_ID = "workbench.action.focusAboveGroupWithoutWrap";

var FOCUS_BELOW_GROUP_WITHOUT_WRAP_COMMAND_ID = "workbench.action.focusBelowGroupWithoutWrap";

var OPEN_EDITOR_AT_INDEX_COMMAND_ID = "workbench.action.openEditorAtIndex";

var MOVE_EDITOR_INTO_NEW_WINDOW_COMMAND_ID = "workbench.action.moveEditorToNewWindow";

var COPY_EDITOR_INTO_NEW_WINDOW_COMMAND_ID = "workbench.action.copyEditorToNewWindow";

var MOVE_EDITOR_GROUP_INTO_NEW_WINDOW_COMMAND_ID = "workbench.action.moveEditorGroupToNewWindow";

var COPY_EDITOR_GROUP_INTO_NEW_WINDOW_COMMAND_ID = "workbench.action.copyEditorGroupToNewWindow";

var NEW_EMPTY_EDITOR_WINDOW_COMMAND_ID = "workbench.action.newEmptyEditorWindow";

var CLOSE_MODAL_EDITOR_COMMAND_ID = "workbench.action.closeModalEditor";

var MOVE_MODAL_EDITOR_TO_MAIN_COMMAND_ID = "workbench.action.moveModalEditorToMain";

var MOVE_MODAL_EDITOR_TO_WINDOW_COMMAND_ID = "workbench.action.moveModalEditorToWindow";

var TOGGLE_MODAL_EDITOR_MAXIMIZED_COMMAND_ID = "workbench.action.toggleModalEditorMaximized";

var NAVIGATE_MODAL_EDITOR_PREVIOUS_COMMAND_ID = "workbench.action.navigateModalEditorPrevious";

var NAVIGATE_MODAL_EDITOR_NEXT_COMMAND_ID = "workbench.action.navigateModalEditorNext";

var TOGGLE_MODAL_EDITOR_SIDEBAR_COMMAND_ID = "workbench.action.toggleModalEditorSidebar";

var API_OPEN_EDITOR_COMMAND_ID = "_workbench.open";

var API_OPEN_DIFF_EDITOR_COMMAND_ID = "_workbench.diff";

var API_OPEN_WITH_EDITOR_COMMAND_ID = "_workbench.openWith";

var EDITOR_CORE_NAVIGATION_COMMANDS = [
  SPLIT_EDITOR,
  CLOSE_EDITOR_COMMAND_ID,
  UNPIN_EDITOR_COMMAND_ID,
  UNLOCK_GROUP_COMMAND_ID,
  TOGGLE_MAXIMIZE_EDITOR_GROUP
];

var isSelectedEditorsMoveCopyArg = function(arg) {
  if (!isObject(arg)) {
    return false;
  }
  if (!isString(arg.to)) {
    return false;
  }
  if (!isUndefined(arg.by) && !isString(arg.by)) {
    return false;
  }
  if (!isUndefined(arg.value) && !isNumber(arg.value)) {
    return false;
  }
  return true;
};

function registerEditorMoveCopyCommand() {
  const moveCopyJSONSchema = {
    "type": "object",
    "required": ["to"],
    "properties": {
      "to": {
        "type": "string",
        "enum": ["left", "right"]
      },
      "by": {
        "type": "string",
        "enum": ["tab", "group"]
      },
      "value": {
        "type": "number"
      }
    }
  };
  KeybindingsRegistry.registerCommandAndKeybindingRule({
    id: MOVE_ACTIVE_EDITOR_COMMAND_ID,
    weight: 200 /* WorkbenchContrib */,
    when: EditorContextKeys.editorTextFocus,
    primary: 0,
    handler: (accessor, args2) => moveCopySelectedEditors(true, args2, accessor),
    metadata: {
      description: localize(6617, null),
      args: [
        {
          name: localize(6616, null),
          description: localize(6615, null),
          constraint: isSelectedEditorsMoveCopyArg,
          schema: moveCopyJSONSchema
        }
      ]
    }
  });
  KeybindingsRegistry.registerCommandAndKeybindingRule({
    id: COPY_ACTIVE_EDITOR_COMMAND_ID,
    weight: 200 /* WorkbenchContrib */,
    when: EditorContextKeys.editorTextFocus,
    primary: 0,
    handler: (accessor, args2) => moveCopySelectedEditors(false, args2, accessor),
    metadata: {
      description: localize(6614, null),
      args: [
        {
          name: localize(6613, null),
          description: localize(6612, null),
          constraint: isSelectedEditorsMoveCopyArg,
          schema: moveCopyJSONSchema
        }
      ]
    }
  });
  [
    { id: MOVE_EDITOR_INTO_ABOVE_GROUP, to: "up" },
    { id: MOVE_EDITOR_INTO_BELOW_GROUP, to: "down" },
    { id: MOVE_EDITOR_INTO_LEFT_GROUP, to: "left" },
    { id: MOVE_EDITOR_INTO_RIGHT_GROUP, to: "right" }
  ].forEach(({ id: id2, to }) => {
    CommandsRegistry.registerCommand(id2, function(accessor, ...args2) {
      const resolvedContext = resolveCommandsContext(args2, accessor.get(IEditorService), accessor.get(IEditorGroupsService), accessor.get(IListService));
      if (resolvedContext.groupedEditors.length) {
        moveCopyEditorsToGroup(true, { to, by: "group" }, resolvedContext.groupedEditors[0].group, resolvedContext.groupedEditors[0].editors, accessor);
      }
    });
  });
  function moveCopySelectedEditors(isMove, args2 = /* @__PURE__ */ Object.create(null), accessor) {
    args2.to = args2.to || "right";
    args2.by = args2.by || "tab";
    args2.value = typeof args2.value === "number" ? args2.value : 1;
    const activeGroup = accessor.get(IEditorGroupsService).activeGroup;
    const selectedEditors = activeGroup.selectedEditors;
    if (selectedEditors.length > 0) {
      switch (args2.by) {
        case "tab":
          if (isMove) {
            return moveTabs(args2, activeGroup, selectedEditors);
          }
          break;
        case "group":
          return moveCopyEditorsToGroup(isMove, args2, activeGroup, selectedEditors, accessor);
      }
    }
  }
  function moveTabs(args2, group2, editors) {
    const to = args2.to;
    if (to === "first" || to === "right") {
      editors = [...editors].reverse();
    } else if (to === "position" && (args2.value ?? 1) < group2.getIndexOfEditor(editors[0])) {
      editors = [...editors].reverse();
    }
    for (const editor of editors) {
      moveTab(args2, group2, editor);
    }
  }
  function moveTab(args2, group2, editor) {
    let index2 = group2.getIndexOfEditor(editor);
    switch (args2.to) {
      case "first":
        index2 = 0;
        break;
      case "last":
        index2 = group2.count - 1;
        break;
      case "left":
        index2 = index2 - (args2.value ?? 1);
        break;
      case "right":
        index2 = index2 + (args2.value ?? 1);
        break;
      case "center":
        index2 = Math.round(group2.count / 2) - 1;
        break;
      case "position":
        index2 = (args2.value ?? 1) - 1;
        break;
    }
    index2 = index2 < 0 ? 0 : index2 >= group2.count ? group2.count - 1 : index2;
    group2.moveEditor(editor, group2, { index: index2 });
  }
  function moveCopyEditorsToGroup(isMove, args2, sourceGroup, editors, accessor) {
    const editorGroupsService = accessor.get(IEditorGroupsService);
    const configurationService = accessor.get(IConfigurationService);
    let targetGroup;
    switch (args2.to) {
      case "left":
        targetGroup = editorGroupsService.findGroup({ direction: 2 /* LEFT */ }, sourceGroup);
        if (!targetGroup) {
          targetGroup = editorGroupsService.addGroup(sourceGroup, 2 /* LEFT */);
        }
        break;
      case "right":
        targetGroup = editorGroupsService.findGroup({ direction: 3 /* RIGHT */ }, sourceGroup);
        if (!targetGroup) {
          targetGroup = editorGroupsService.addGroup(sourceGroup, 3 /* RIGHT */);
        }
        break;
      case "up":
        targetGroup = editorGroupsService.findGroup({ direction: 0 /* UP */ }, sourceGroup);
        if (!targetGroup) {
          targetGroup = editorGroupsService.addGroup(sourceGroup, 0 /* UP */);
        }
        break;
      case "down":
        targetGroup = editorGroupsService.findGroup({ direction: 1 /* DOWN */ }, sourceGroup);
        if (!targetGroup) {
          targetGroup = editorGroupsService.addGroup(sourceGroup, 1 /* DOWN */);
        }
        break;
      case "first":
        targetGroup = editorGroupsService.findGroup({ location: 0 /* FIRST */ }, sourceGroup);
        break;
      case "last":
        targetGroup = editorGroupsService.findGroup({ location: 1 /* LAST */ }, sourceGroup);
        break;
      case "previous":
        targetGroup = editorGroupsService.findGroup({ location: 3 /* PREVIOUS */ }, sourceGroup);
        if (!targetGroup) {
          const oppositeDirection2 = preferredSideBySideGroupDirection(configurationService) === 3 /* RIGHT */ ? 2 /* LEFT */ : 0 /* UP */;
          targetGroup = editorGroupsService.addGroup(sourceGroup, oppositeDirection2);
        }
        break;
      case "next":
        targetGroup = editorGroupsService.findGroup({ location: 2 /* NEXT */ }, sourceGroup);
        if (!targetGroup) {
          targetGroup = editorGroupsService.addGroup(sourceGroup, preferredSideBySideGroupDirection(configurationService));
        }
        break;
      case "center":
        targetGroup = editorGroupsService.getGroups(2 /* GRID_APPEARANCE */)[editorGroupsService.count / 2 - 1];
        break;
      case "position":
        targetGroup = editorGroupsService.getGroups(2 /* GRID_APPEARANCE */)[(args2.value ?? 1) - 1];
        break;
    }
    if (targetGroup) {
      const editorsWithOptions = prepareMoveCopyEditors(sourceGroup, editors);
      if (isMove) {
        sourceGroup.moveEditors(editorsWithOptions, targetGroup);
      } else if (sourceGroup.id !== targetGroup.id) {
        sourceGroup.copyEditors(editorsWithOptions, targetGroup);
      }
      targetGroup.focus();
    }
  }
}

function registerEditorGroupsLayoutCommands() {
  function applyEditorLayout(accessor, layout2) {
    if (!layout2 || typeof layout2 !== "object") {
      return;
    }
    const editorGroupsService = accessor.get(IEditorGroupsService);
    editorGroupsService.applyLayout(layout2);
  }
  CommandsRegistry.registerCommand(LAYOUT_EDITOR_GROUPS_COMMAND_ID, (accessor, args2) => {
    applyEditorLayout(accessor, args2);
  });
  CommandsRegistry.registerCommand({
    id: "vscode.setEditorLayout",
    handler: (accessor, args2) => applyEditorLayout(accessor, args2),
    metadata: {
      "description": `Set the editor layout. Editor layout is represented as a tree of groups in which the first group is the root group of the layout.
					The orientation of the first group is 0 (horizontal) by default unless specified otherwise. The other orientations are 1 (vertical).
					The orientation of subsequent groups is the opposite of the orientation of the group that contains it.
					Here are some examples: A layout representing 1 row and 2 columns: { orientation: 0, groups: [{}, {}] }.
					A layout representing 3 rows and 1 column: { orientation: 1, groups: [{}, {}, {}] }.
					A layout representing 3 rows and 1 column in which the second row has 2 columns: { orientation: 1, groups: [{}, { groups: [{}, {}] }, {}] }
					`,
      args: [{
        name: "args",
        schema: {
          "type": "object",
          "required": ["groups"],
          "properties": {
            "orientation": {
              "type": "number",
              "default": 0,
              "description": `The orientation of the root group in the layout. 0 for horizontal, 1 for vertical.`,
              "enum": [0, 1],
              "enumDescriptions": [
                localize(6618, null),
                localize(6619, null)
              ]
            },
            "groups": {
              "$ref": "#/definitions/editorGroupsSchema",
              "default": [{}, {}]
            }
          }
        }
      }]
    }
  });
  CommandsRegistry.registerCommand({
    id: "vscode.getEditorLayout",
    handler: (accessor) => {
      const editorGroupsService = accessor.get(IEditorGroupsService);
      return editorGroupsService.getLayout();
    },
    metadata: {
      description: "Get Editor Layout",
      args: [],
      returns: "An editor layout object, in the same format as vscode.setEditorLayout"
    }
  });
}

function registerOpenEditorAPICommands() {
  function mixinContext(context2, options3, column) {
    if (!context2) {
      return [options3, column];
    }
    return [
      { ...context2.editorOptions, ...options3 ?? /* @__PURE__ */ Object.create(null) },
      context2.sideBySide ? SIDE_GROUP : column
    ];
  }
  CommandsRegistry.registerCommand({
    id: "vscode.open",
    handler: (accessor, arg) => {
      accessor.get(ICommandService).executeCommand(API_OPEN_EDITOR_COMMAND_ID, arg);
    },
    metadata: {
      description: "Opens the provided resource in the editor.",
      args: [{ name: "Uri" }]
    }
  });
  CommandsRegistry.registerCommand(API_OPEN_EDITOR_COMMAND_ID, async function(accessor, resourceArg, columnAndOptions, label3, context2) {
    const editorService = accessor.get(IEditorService);
    const editorGroupsService = accessor.get(IEditorGroupsService);
    const openerService = accessor.get(IOpenerService);
    const pathService = accessor.get(IPathService);
    const configurationService = accessor.get(IConfigurationService);
    const untitledTextEditorService = accessor.get(IUntitledTextEditorService);
    const resourceOrString = typeof resourceArg === "string" ? resourceArg : URI.from(resourceArg, true);
    const [columnArg, optionsArg] = columnAndOptions ?? [];
    if (optionsArg || typeof columnArg === "number" || matchesScheme(resourceOrString, Schemas.untitled)) {
      const [options3, column] = mixinContext(context2, optionsArg, columnArg);
      const resource = URI.isUri(resourceOrString) ? resourceOrString : URI.parse(resourceOrString);
      let input;
      if (untitledTextEditorService.isUntitledWithAssociatedResource(resource)) {
        input = { resource: resource.with({ scheme: pathService.defaultUriScheme }), forceUntitled: true, options: options3, label: label3 };
      } else {
        input = { resource, options: options3, label: label3 };
      }
      await editorService.openEditor(input, columnToEditorGroup(editorGroupsService, configurationService, column));
    } else if (matchesScheme(resourceOrString, Schemas.command)) {
      return;
    } else {
      await openerService.open(resourceOrString, { openToSide: context2?.sideBySide, editorOptions: context2?.editorOptions });
    }
  });
  CommandsRegistry.registerCommand({
    id: "vscode.diff",
    handler: (accessor, left, right, label3) => {
      accessor.get(ICommandService).executeCommand(API_OPEN_DIFF_EDITOR_COMMAND_ID, left, right, label3);
    },
    metadata: {
      description: "Opens the provided resources in the diff editor to compare their contents.",
      args: [
        { name: "left", description: "Left-hand side resource of the diff editor" },
        { name: "right", description: "Right-hand side resource of the diff editor" },
        { name: "title", description: "Human readable title for the diff editor" }
      ]
    }
  });
  CommandsRegistry.registerCommand(API_OPEN_DIFF_EDITOR_COMMAND_ID, async function(accessor, originalResource, modifiedResource, labelAndOrDescription, columnAndOptions, context2) {
    const editorService = accessor.get(IEditorService);
    const editorGroupsService = accessor.get(IEditorGroupsService);
    const configurationService = accessor.get(IConfigurationService);
    const [columnArg, optionsArg] = columnAndOptions ?? [];
    const [options3, column] = mixinContext(context2, optionsArg, columnArg);
    let label3 = void 0;
    let description = void 0;
    if (typeof labelAndOrDescription === "string") {
      label3 = labelAndOrDescription;
    } else if (labelAndOrDescription) {
      label3 = labelAndOrDescription.label;
      description = labelAndOrDescription.description;
    }
    await editorService.openEditor({
      original: { resource: URI.from(originalResource, true) },
      modified: { resource: URI.from(modifiedResource, true) },
      label: label3,
      description,
      options: options3
    }, columnToEditorGroup(editorGroupsService, configurationService, column));
  });
  CommandsRegistry.registerCommand(API_OPEN_WITH_EDITOR_COMMAND_ID, async (accessor, resource, id2, columnAndOptions) => {
    const editorService = accessor.get(IEditorService);
    const editorGroupsService = accessor.get(IEditorGroupsService);
    const configurationService = accessor.get(IConfigurationService);
    const [columnArg, optionsArg] = columnAndOptions ?? [];
    await editorService.openEditor({ resource: URI.from(resource, true), options: { pinned: true, ...optionsArg, override: id2 } }, columnToEditorGroup(editorGroupsService, configurationService, columnArg));
  });
  CommandsRegistry.registerCommand({
    id: "vscode.changes",
    handler: (accessor, title, resources) => {
      accessor.get(ICommandService).executeCommand("_workbench.changes", title, resources);
    },
    metadata: {
      description: "Opens a list of resources in the changes editor to compare their contents.",
      args: [
        { name: "title", description: "Human readable title for the diff editor" },
        { name: "resources", description: "List of resources to open in the changes editor" }
      ]
    }
  });
  CommandsRegistry.registerCommand("_workbench.changes", async (accessor, title, resources) => {
    const editorService = accessor.get(IEditorService);
    const editor = [];
    for (const [label3, original, modified] of resources) {
      editor.push({
        resource: URI.revive(label3),
        original: { resource: URI.revive(original) },
        modified: { resource: URI.revive(modified) }
      });
    }
    await editorService.openEditor({ resources: editor, label: title });
  });
  CommandsRegistry.registerCommand("_workbench.openMultiDiffEditor", async (accessor, options3) => {
    const editorService = accessor.get(IEditorService);
    const resources = options3.resources?.map((r2) => ({ original: { resource: URI.revive(r2.originalUri) }, modified: { resource: URI.revive(r2.modifiedUri) } }));
    const revealUri = options3.reveal?.modifiedUri ? URI.revive(options3.reveal.modifiedUri) : void 0;
    const revealResource = revealUri && resources ? resources.find((r2) => isEqual2(r2.modified.resource, revealUri)) : void 0;
    if (options3.reveal && !revealResource) {
      console.error("Reveal resource not found");
    }
    const multiDiffEditorOptions = {
      viewState: revealResource ? {
        revealData: {
          resource: {
            original: revealResource.original.resource,
            modified: revealResource.modified.resource
          },
          range: options3.reveal?.range
        }
      } : void 0
    };
    await editorService.openEditor({
      multiDiffSource: options3.multiDiffSourceUri ? URI.revive(options3.multiDiffSourceUri) : void 0,
      resources,
      label: options3.title,
      options: multiDiffEditorOptions
    });
  });
}

function registerOpenEditorAtIndexCommands() {
  const openEditorAtIndex = (accessor, editorIndex) => {
    const editorService = accessor.get(IEditorService);
    const activeEditorPane = editorService.activeEditorPane;
    if (activeEditorPane && typeof editorIndex === "number") {
      const editor = activeEditorPane.group.getEditorByIndex(editorIndex);
      if (editor) {
        editorService.openEditor(editor);
      }
    }
  };
  CommandsRegistry.registerCommand({
    id: OPEN_EDITOR_AT_INDEX_COMMAND_ID,
    handler: openEditorAtIndex
  });
  for (let i2 = 0; i2 < 9; i2++) {
    const editorIndex = i2;
    const visibleIndex = i2 + 1;
    KeybindingsRegistry.registerCommandAndKeybindingRule({
      id: OPEN_EDITOR_AT_INDEX_COMMAND_ID + visibleIndex,
      weight: 200 /* WorkbenchContrib */,
      when: void 0,
      primary: 512 /* Alt */ | toKeyCode(visibleIndex),
      mac: { primary: 256 /* WinCtrl */ | toKeyCode(visibleIndex) },
      handler: (accessor) => openEditorAtIndex(accessor, editorIndex)
    });
  }
  function toKeyCode(index2) {
    switch (index2) {
      case 0:
        return 21 /* Digit0 */;
      case 1:
        return 22 /* Digit1 */;
      case 2:
        return 23 /* Digit2 */;
      case 3:
        return 24 /* Digit3 */;
      case 4:
        return 25 /* Digit4 */;
      case 5:
        return 26 /* Digit5 */;
      case 6:
        return 27 /* Digit6 */;
      case 7:
        return 28 /* Digit7 */;
      case 8:
        return 29 /* Digit8 */;
      case 9:
        return 30 /* Digit9 */;
    }
    throw new Error("invalid index");
  }
}

function registerFocusEditorGroupAtIndexCommands() {
  for (let groupIndex = 1; groupIndex < 8; groupIndex++) {
    KeybindingsRegistry.registerCommandAndKeybindingRule({
      id: toCommandId(groupIndex),
      weight: 200 /* WorkbenchContrib */,
      when: void 0,
      primary: 2048 /* CtrlCmd */ | toKeyCode(groupIndex),
      handler: (accessor) => {
        const editorGroupsService = accessor.get(IEditorGroupsService);
        const configurationService = accessor.get(IConfigurationService);
        if (groupIndex > editorGroupsService.count) {
          return;
        }
        const groups = editorGroupsService.getGroups(2 /* GRID_APPEARANCE */);
        if (groups[groupIndex]) {
          return groups[groupIndex].focus();
        }
        const direction = preferredSideBySideGroupDirection(configurationService);
        const lastGroup = editorGroupsService.findGroup({ location: 1 /* LAST */ });
        if (!lastGroup) {
          return;
        }
        const newGroup = editorGroupsService.addGroup(lastGroup, direction);
        newGroup.focus();
      }
    });
  }
  function toCommandId(index2) {
    switch (index2) {
      case 1:
        return "workbench.action.focusSecondEditorGroup";
      case 2:
        return "workbench.action.focusThirdEditorGroup";
      case 3:
        return "workbench.action.focusFourthEditorGroup";
      case 4:
        return "workbench.action.focusFifthEditorGroup";
      case 5:
        return "workbench.action.focusSixthEditorGroup";
      case 6:
        return "workbench.action.focusSeventhEditorGroup";
      case 7:
        return "workbench.action.focusEighthEditorGroup";
    }
    throw new Error("Invalid index");
  }
  function toKeyCode(index2) {
    switch (index2) {
      case 1:
        return 23 /* Digit2 */;
      case 2:
        return 24 /* Digit3 */;
      case 3:
        return 25 /* Digit4 */;
      case 4:
        return 26 /* Digit5 */;
      case 5:
        return 27 /* Digit6 */;
      case 6:
        return 28 /* Digit7 */;
      case 7:
        return 29 /* Digit8 */;
    }
    throw new Error("Invalid index");
  }
}

function splitEditor(editorGroupsService, direction, resolvedContext) {
  if (!resolvedContext.groupedEditors.length) {
    return;
  }
  const { group: group2, editors } = resolvedContext.groupedEditors[0];
  const preserveFocus = resolvedContext.preserveFocus;
  const newGroup = editorGroupsService.addGroup(group2, direction);
  for (const editorToCopy of editors) {
    if (editorToCopy && !editorToCopy.hasCapability(8 /* Singleton */)) {
      group2.copyEditor(editorToCopy, newGroup, { preserveFocus });
    }
  }
  newGroup.focus();
}

function registerSplitEditorCommands() {
  [
    { id: SPLIT_EDITOR_UP, direction: 0 /* UP */ },
    { id: SPLIT_EDITOR_DOWN, direction: 1 /* DOWN */ },
    { id: SPLIT_EDITOR_LEFT, direction: 2 /* LEFT */ },
    { id: SPLIT_EDITOR_RIGHT, direction: 3 /* RIGHT */ }
  ].forEach(({ id: id2, direction }) => {
    CommandsRegistry.registerCommand(id2, function(accessor, ...args2) {
      const resolvedContext = resolveCommandsContext(args2, accessor.get(IEditorService), accessor.get(IEditorGroupsService), accessor.get(IListService));
      splitEditor(accessor.get(IEditorGroupsService), direction, resolvedContext);
    });
  });
}

function registerCloseEditorCommands() {
  function closeEditorHandler(accessor, forceCloseStickyEditors, ...args2) {
    const editorGroupsService = accessor.get(IEditorGroupsService);
    const editorService = accessor.get(IEditorService);
    let keepStickyEditors = void 0;
    if (forceCloseStickyEditors) {
      keepStickyEditors = false;
    } else if (args2.length) {
      keepStickyEditors = false;
    } else {
      keepStickyEditors = editorGroupsService.partOptions.preventPinnedEditorClose === "keyboard" || editorGroupsService.partOptions.preventPinnedEditorClose === "keyboardAndMouse";
    }
    if (keepStickyEditors) {
      const activeGroup = editorGroupsService.activeGroup;
      const activeEditor = activeGroup.activeEditor;
      if (activeEditor && activeGroup.isSticky(activeEditor)) {
        const nextNonStickyEditorInGroup = activeGroup.getEditors(0 /* MOST_RECENTLY_ACTIVE */, { excludeSticky: true })[0];
        if (nextNonStickyEditorInGroup) {
          return activeGroup.openEditor(nextNonStickyEditorInGroup);
        }
        const nextNonStickyEditorInAllGroups = editorService.getEditors(0 /* MOST_RECENTLY_ACTIVE */, { excludeSticky: true })[0];
        if (nextNonStickyEditorInAllGroups) {
          return Promise.resolve(editorGroupsService.getGroup(nextNonStickyEditorInAllGroups.groupId)?.openEditor(nextNonStickyEditorInAllGroups.editor));
        }
      }
    }
    const resolvedContext = resolveCommandsContext(args2, accessor.get(IEditorService), accessor.get(IEditorGroupsService), accessor.get(IListService));
    const preserveFocus = resolvedContext.preserveFocus;
    return Promise.all(resolvedContext.groupedEditors.map(async ({ group: group2, editors }) => {
      const editorsToClose = editors.filter((editor) => !keepStickyEditors || !group2.isSticky(editor));
      await group2.closeEditors(editorsToClose, { preserveFocus });
    }));
  }
  KeybindingsRegistry.registerCommandAndKeybindingRule({
    id: CLOSE_EDITOR_COMMAND_ID,
    weight: 200 /* WorkbenchContrib */,
    when: void 0,
    primary: 2048 /* CtrlCmd */ | 53 /* KeyW */,
    win: { primary: 2048 /* CtrlCmd */ | 62 /* F4 */, secondary: [2048 /* CtrlCmd */ | 53 /* KeyW */] },
    handler: (accessor, ...args2) => {
      return closeEditorHandler(accessor, false, ...args2);
    }
  });
  CommandsRegistry.registerCommand(CLOSE_PINNED_EDITOR_COMMAND_ID, (accessor, ...args2) => {
    return closeEditorHandler(accessor, true, ...args2);
  });
  KeybindingsRegistry.registerCommandAndKeybindingRule({
    id: CLOSE_EDITORS_IN_GROUP_COMMAND_ID,
    weight: 200 /* WorkbenchContrib */,
    when: void 0,
    primary: KeyChord(2048 /* CtrlCmd */ | 41 /* KeyK */, 53 /* KeyW */),
    handler: (accessor, ...args2) => {
      const resolvedContext = resolveCommandsContext(args2, accessor.get(IEditorService), accessor.get(IEditorGroupsService), accessor.get(IListService));
      return Promise.all(resolvedContext.groupedEditors.map(async ({ group: group2 }) => {
        await group2.closeAllEditors({ excludeSticky: true });
      }));
    }
  });
  KeybindingsRegistry.registerCommandAndKeybindingRule({
    id: CLOSE_EDITOR_GROUP_COMMAND_ID,
    weight: 200 /* WorkbenchContrib */,
    when: ContextKeyExpr.and(ActiveEditorGroupEmptyContext, MultipleEditorGroupsContext),
    primary: 2048 /* CtrlCmd */ | 53 /* KeyW */,
    win: { primary: 2048 /* CtrlCmd */ | 62 /* F4 */, secondary: [2048 /* CtrlCmd */ | 53 /* KeyW */] },
    handler: (accessor, ...args2) => {
      const editorGroupsService = accessor.get(IEditorGroupsService);
      const commandsContext = resolveCommandsContext(args2, accessor.get(IEditorService), editorGroupsService, accessor.get(IListService));
      if (commandsContext.groupedEditors.length) {
        editorGroupsService.removeGroup(commandsContext.groupedEditors[0].group);
      }
    }
  });
  KeybindingsRegistry.registerCommandAndKeybindingRule({
    id: CLOSE_SAVED_EDITORS_COMMAND_ID,
    weight: 200 /* WorkbenchContrib */,
    when: void 0,
    primary: KeyChord(2048 /* CtrlCmd */ | 41 /* KeyK */, 51 /* KeyU */),
    handler: (accessor, ...args2) => {
      const resolvedContext = resolveCommandsContext(args2, accessor.get(IEditorService), accessor.get(IEditorGroupsService), accessor.get(IListService));
      return Promise.all(resolvedContext.groupedEditors.map(async ({ group: group2 }) => {
        await group2.closeEditors({ savedOnly: true, excludeSticky: true }, { preserveFocus: resolvedContext.preserveFocus });
      }));
    }
  });
  KeybindingsRegistry.registerCommandAndKeybindingRule({
    id: CLOSE_OTHER_EDITORS_IN_GROUP_COMMAND_ID,
    weight: 200 /* WorkbenchContrib */,
    when: void 0,
    primary: void 0,
    mac: { primary: 2048 /* CtrlCmd */ | 512 /* Alt */ | 50 /* KeyT */ },
    handler: (accessor, ...args2) => {
      const resolvedContext = resolveCommandsContext(args2, accessor.get(IEditorService), accessor.get(IEditorGroupsService), accessor.get(IListService));
      return Promise.all(resolvedContext.groupedEditors.map(async ({ group: group2, editors }) => {
        const editorsToClose = group2.getEditors(1 /* SEQUENTIAL */, { excludeSticky: true }).filter((editor) => !editors.includes(editor));
        for (const editorToKeep of editors) {
          if (editorToKeep) {
            group2.pinEditor(editorToKeep);
          }
        }
        await group2.closeEditors(editorsToClose, { preserveFocus: resolvedContext.preserveFocus });
      }));
    }
  });
  KeybindingsRegistry.registerCommandAndKeybindingRule({
    id: CLOSE_EDITORS_TO_THE_RIGHT_COMMAND_ID,
    weight: 200 /* WorkbenchContrib */,
    when: void 0,
    primary: void 0,
    handler: async (accessor, ...args2) => {
      const resolvedContext = resolveCommandsContext(args2, accessor.get(IEditorService), accessor.get(IEditorGroupsService), accessor.get(IListService));
      if (resolvedContext.groupedEditors.length) {
        const { group: group2, editors } = resolvedContext.groupedEditors[0];
        if (group2.activeEditor) {
          group2.pinEditor(group2.activeEditor);
        }
        await group2.closeEditors({ direction: 1 /* RIGHT */, except: editors[0], excludeSticky: true }, { preserveFocus: resolvedContext.preserveFocus });
      }
    }
  });
  KeybindingsRegistry.registerCommandAndKeybindingRule({
    id: REOPEN_WITH_COMMAND_ID,
    weight: 200 /* WorkbenchContrib */,
    when: void 0,
    primary: void 0,
    handler: (accessor, ...args2) => {
      return reopenEditorWith(accessor, 0 /* PICK */, ...args2);
    }
  });
  KeybindingsRegistry.registerCommandAndKeybindingRule({
    id: REOPEN_ACTIVE_EDITOR_WITH_COMMAND_ID,
    weight: 200 /* WorkbenchContrib */,
    when: void 0,
    primary: void 0,
    handler: (accessor, override, ...args2) => {
      return reopenEditorWith(accessor, override ?? 0 /* PICK */, ...args2);
    }
  });
  async function reopenEditorWith(accessor, editorOverride, ...args2) {
    const editorService = accessor.get(IEditorService);
    const editorResolverService = accessor.get(IEditorResolverService);
    const telemetryService = accessor.get(ITelemetryService);
    const textFileService = accessor.get(ITextFileService);
    const workingCopyService = accessor.get(IWorkingCopyService);
    const workingCopyEditorService = accessor.get(IWorkingCopyEditorService);
    const resolvedContext = resolveCommandsContext(args2, editorService, accessor.get(IEditorGroupsService), accessor.get(IListService));
    const editorReplacements = /* @__PURE__ */ new Map();
    for (const { group: group2, editors } of resolvedContext.groupedEditors) {
      for (const editor of editors) {
        const isDiffEditor2 = isDiffEditorInput(editor);
        const editorToResolve = isDiffEditor2 ? editor.modified : editor;
        const untypedEditor = isDiffEditor2 ? editor.toUntyped() : editorToResolve.toUntyped();
        if (!untypedEditor) {
          return;
        }
        untypedEditor.options = { ...editorService.activeEditorPane?.options, override: editorOverride };
        const resolvedEditor = await editorResolverService.resolveEditor(untypedEditor, group2);
        if (!isEditorInputWithOptionsAndGroup(resolvedEditor)) {
          return;
        }
        let editorReplacementsInGroup = editorReplacements.get(group2);
        if (!editorReplacementsInGroup) {
          editorReplacementsInGroup = [];
          editorReplacements.set(group2, editorReplacementsInGroup);
        }
        const resource = editorToResolve.resource;
        let forceReplaceDirty = !!resource && (resource.scheme === Schemas.untitled || textFileService.isDirty(resource));
        if (forceReplaceDirty && editorToResolve.isDirty()) {
          for (const workingCopy of workingCopyService.dirtyWorkingCopies) {
            if (isEqual2(workingCopy.resource, resource)) {
              continue;
            }
            if (workingCopyEditorService.findEditor(workingCopy)?.editor === editorToResolve) {
              forceReplaceDirty = false;
              break;
            }
          }
        }
        editorReplacementsInGroup.push({
          editor,
          replacement: resolvedEditor.editor,
          forceReplaceDirty,
          options: resolvedEditor.options
        });
        telemetryService.publicLog2("workbenchEditorReopen", {
          scheme: editorToResolve.resource?.scheme ?? "",
          ext: editorToResolve.resource ? extname2(editorToResolve.resource) : "",
          from: editor.editorId ?? "",
          to: resolvedEditor.editor.editorId ?? ""
        });
      }
    }
    for (const [group2, replacements] of editorReplacements) {
      await group2.replaceEditors(replacements);
      await group2.openEditor(replacements[0].replacement);
    }
  }
  CommandsRegistry.registerCommand(CLOSE_EDITORS_AND_GROUP_COMMAND_ID, async (accessor, ...args2) => {
    const editorGroupsService = accessor.get(IEditorGroupsService);
    const resolvedContext = resolveCommandsContext(args2, accessor.get(IEditorService), editorGroupsService, accessor.get(IListService));
    if (resolvedContext.groupedEditors.length) {
      const { group: group2 } = resolvedContext.groupedEditors[0];
      await group2.closeAllEditors();
      if (group2.count === 0 && editorGroupsService.getGroup(group2.id)) {
        editorGroupsService.removeGroup(group2);
      }
    }
  });
}

function registerFocusEditorGroupWihoutWrapCommands() {
  const commands = [
    {
      id: FOCUS_LEFT_GROUP_WITHOUT_WRAP_COMMAND_ID,
      direction: 2 /* LEFT */
    },
    {
      id: FOCUS_RIGHT_GROUP_WITHOUT_WRAP_COMMAND_ID,
      direction: 3 /* RIGHT */
    },
    {
      id: FOCUS_ABOVE_GROUP_WITHOUT_WRAP_COMMAND_ID,
      direction: 0 /* UP */
    },
    {
      id: FOCUS_BELOW_GROUP_WITHOUT_WRAP_COMMAND_ID,
      direction: 1 /* DOWN */
    }
  ];
  for (const command4 of commands) {
    CommandsRegistry.registerCommand(command4.id, async (accessor) => {
      const editorGroupsService = accessor.get(IEditorGroupsService);
      const group2 = editorGroupsService.findGroup({ direction: command4.direction }, editorGroupsService.activeGroup, false) ?? editorGroupsService.activeGroup;
      group2.focus();
    });
  }
}

function registerSplitEditorInGroupCommands() {
  async function splitEditorInGroup(accessor, resolvedContext) {
    const instantiationService = accessor.get(IInstantiationService);
    if (!resolvedContext.groupedEditors.length) {
      return;
    }
    const { group: group2, editors } = resolvedContext.groupedEditors[0];
    const editor = editors[0];
    if (!editor) {
      return;
    }
    await group2.replaceEditors([{
      editor,
      replacement: instantiationService.createInstance(SideBySideEditorInput, void 0, void 0, editor, editor),
      forceReplaceDirty: true
    }]);
  }
  registerAction2(class extends Action2 {
    constructor() {
      super({
        id: SPLIT_EDITOR_IN_GROUP,
        title: localize2(6630, "Split Editor in Group"),
        category: Categories.View,
        precondition: ActiveEditorCanSplitInGroupContext,
        f1: true,
        keybinding: {
          weight: 200 /* WorkbenchContrib */,
          when: ActiveEditorCanSplitInGroupContext,
          primary: KeyChord(2048 /* CtrlCmd */ | 41 /* KeyK */, 2048 /* CtrlCmd */ | 1024 /* Shift */ | 93 /* Backslash */)
        }
      });
    }
    run(accessor, ...args2) {
      return splitEditorInGroup(accessor, resolveCommandsContext(args2, accessor.get(IEditorService), accessor.get(IEditorGroupsService), accessor.get(IListService)));
    }
  });
  async function joinEditorInGroup(resolvedContext) {
    if (!resolvedContext.groupedEditors.length) {
      return;
    }
    const { group: group2, editors } = resolvedContext.groupedEditors[0];
    const editor = editors[0];
    if (!editor) {
      return;
    }
    if (!(editor instanceof SideBySideEditorInput)) {
      return;
    }
    let options3 = void 0;
    const activeEditorPane = group2.activeEditorPane;
    if (activeEditorPane instanceof SideBySideEditor2 && group2.activeEditor === editor) {
      for (const pane of [activeEditorPane.getPrimaryEditorPane(), activeEditorPane.getSecondaryEditorPane()]) {
        if (pane?.hasFocus()) {
          options3 = { viewState: pane.getViewState() };
          break;
        }
      }
    }
    await group2.replaceEditors([{
      editor,
      replacement: editor.primary,
      options: options3
    }]);
  }
  registerAction2(class extends Action2 {
    constructor() {
      super({
        id: JOIN_EDITOR_IN_GROUP,
        title: localize2(6623, "Join Editor in Group"),
        category: Categories.View,
        precondition: SideBySideEditorActiveContext,
        f1: true,
        keybinding: {
          weight: 200 /* WorkbenchContrib */,
          when: SideBySideEditorActiveContext,
          primary: KeyChord(2048 /* CtrlCmd */ | 41 /* KeyK */, 2048 /* CtrlCmd */ | 1024 /* Shift */ | 93 /* Backslash */)
        }
      });
    }
    run(accessor, ...args2) {
      return joinEditorInGroup(resolveCommandsContext(args2, accessor.get(IEditorService), accessor.get(IEditorGroupsService), accessor.get(IListService)));
    }
  });
  registerAction2(class extends Action2 {
    constructor() {
      super({
        id: TOGGLE_SPLIT_EDITOR_IN_GROUP,
        title: localize2(6632, "Toggle Split Editor in Group"),
        category: Categories.View,
        precondition: ContextKeyExpr.or(ActiveEditorCanSplitInGroupContext, SideBySideEditorActiveContext),
        f1: true
      });
    }
    async run(accessor, ...args2) {
      const resolvedContext = resolveCommandsContext(args2, accessor.get(IEditorService), accessor.get(IEditorGroupsService), accessor.get(IListService));
      if (!resolvedContext.groupedEditors.length) {
        return;
      }
      const { editors } = resolvedContext.groupedEditors[0];
      if (editors[0] instanceof SideBySideEditorInput) {
        await joinEditorInGroup(resolvedContext);
      } else if (editors[0]) {
        await splitEditorInGroup(accessor, resolvedContext);
      }
    }
  });
  registerAction2(class extends Action2 {
    constructor() {
      super({
        id: TOGGLE_SPLIT_EDITOR_IN_GROUP_LAYOUT,
        title: localize2(6635, "Toggle Layout of Split Editor in Group"),
        category: Categories.View,
        precondition: SideBySideEditorActiveContext,
        f1: true
      });
    }
    async run(accessor) {
      const configurationService = accessor.get(IConfigurationService);
      const currentSetting = configurationService.getValue(SideBySideEditor2.SIDE_BY_SIDE_LAYOUT_SETTING);
      let newSetting;
      if (currentSetting !== "horizontal") {
        newSetting = "horizontal";
      } else {
        newSetting = "vertical";
      }
      return configurationService.updateValue(SideBySideEditor2.SIDE_BY_SIDE_LAYOUT_SETTING, newSetting);
    }
  });
}

function registerFocusSideEditorsCommands() {
  registerAction2(class extends Action2 {
    constructor() {
      super({
        id: FOCUS_FIRST_SIDE_EDITOR,
        title: localize2(6620, "Focus First Side in Active Editor"),
        category: Categories.View,
        precondition: ContextKeyExpr.or(SideBySideEditorActiveContext, TextCompareEditorActiveContext),
        f1: true
      });
    }
    async run(accessor) {
      const editorService = accessor.get(IEditorService);
      const commandService = accessor.get(ICommandService);
      const activeEditorPane = editorService.activeEditorPane;
      if (activeEditorPane instanceof SideBySideEditor2) {
        activeEditorPane.getSecondaryEditorPane()?.focus();
      } else if (activeEditorPane instanceof TextDiffEditor) {
        await commandService.executeCommand(DIFF_FOCUS_SECONDARY_SIDE);
      }
    }
  });
  registerAction2(class extends Action2 {
    constructor() {
      super({
        id: FOCUS_SECOND_SIDE_EDITOR,
        title: localize2(6622, "Focus Second Side in Active Editor"),
        category: Categories.View,
        precondition: ContextKeyExpr.or(SideBySideEditorActiveContext, TextCompareEditorActiveContext),
        f1: true
      });
    }
    async run(accessor) {
      const editorService = accessor.get(IEditorService);
      const commandService = accessor.get(ICommandService);
      const activeEditorPane = editorService.activeEditorPane;
      if (activeEditorPane instanceof SideBySideEditor2) {
        activeEditorPane.getPrimaryEditorPane()?.focus();
      } else if (activeEditorPane instanceof TextDiffEditor) {
        await commandService.executeCommand(DIFF_FOCUS_PRIMARY_SIDE);
      }
    }
  });
  registerAction2(class extends Action2 {
    constructor() {
      super({
        id: FOCUS_OTHER_SIDE_EDITOR,
        title: localize2(6621, "Focus Other Side in Active Editor"),
        category: Categories.View,
        precondition: ContextKeyExpr.or(SideBySideEditorActiveContext, TextCompareEditorActiveContext),
        f1: true
      });
    }
    async run(accessor) {
      const editorService = accessor.get(IEditorService);
      const commandService = accessor.get(ICommandService);
      const activeEditorPane = editorService.activeEditorPane;
      if (activeEditorPane instanceof SideBySideEditor2) {
        if (activeEditorPane.getPrimaryEditorPane()?.hasFocus()) {
          activeEditorPane.getSecondaryEditorPane()?.focus();
        } else {
          activeEditorPane.getPrimaryEditorPane()?.focus();
        }
      } else if (activeEditorPane instanceof TextDiffEditor) {
        await commandService.executeCommand(DIFF_FOCUS_OTHER_SIDE);
      }
    }
  });
}

function registerOtherEditorCommands() {
  KeybindingsRegistry.registerCommandAndKeybindingRule({
    id: KEEP_EDITOR_COMMAND_ID,
    weight: 200 /* WorkbenchContrib */,
    when: void 0,
    primary: KeyChord(2048 /* CtrlCmd */ | 41 /* KeyK */, 3 /* Enter */),
    handler: async (accessor, ...args2) => {
      const resolvedContext = resolveCommandsContext(args2, accessor.get(IEditorService), accessor.get(IEditorGroupsService), accessor.get(IListService));
      for (const { group: group2, editors } of resolvedContext.groupedEditors) {
        for (const editor of editors) {
          group2.pinEditor(editor);
        }
      }
    }
  });
  CommandsRegistry.registerCommand({
    id: TOGGLE_KEEP_EDITORS_COMMAND_ID,
    handler: (accessor) => {
      const configurationService = accessor.get(IConfigurationService);
      const currentSetting = configurationService.getValue("workbench.editor.enablePreview");
      const newSetting = currentSetting !== true;
      configurationService.updateValue("workbench.editor.enablePreview", newSetting);
    }
  });
  function setEditorGroupLock(accessor, locked, ...args2) {
    const resolvedContext = resolveCommandsContext(args2, accessor.get(IEditorService), accessor.get(IEditorGroupsService), accessor.get(IListService));
    const group2 = resolvedContext.groupedEditors[0]?.group;
    group2?.lock(locked ?? !group2.isLocked);
  }
  registerAction2(class extends Action2 {
    constructor() {
      super({
        id: TOGGLE_LOCK_GROUP_COMMAND_ID,
        title: localize2(6631, "Toggle Editor Group Lock"),
        category: Categories.View,
        f1: true
      });
    }
    async run(accessor, ...args2) {
      setEditorGroupLock(accessor, void 0, ...args2);
    }
  });
  registerAction2(class extends Action2 {
    constructor() {
      super({
        id: LOCK_GROUP_COMMAND_ID,
        title: localize2(6624, "Lock Editor Group"),
        category: Categories.View,
        precondition: ActiveEditorGroupLockedContext.toNegated(),
        f1: true
      });
    }
    async run(accessor, ...args2) {
      setEditorGroupLock(accessor, true, ...args2);
    }
  });
  registerAction2(class extends Action2 {
    constructor() {
      super({
        id: UNLOCK_GROUP_COMMAND_ID,
        title: localize2(6636, "Unlock Editor Group"),
        precondition: ActiveEditorGroupLockedContext,
        category: Categories.View,
        f1: true
      });
    }
    async run(accessor, ...args2) {
      setEditorGroupLock(accessor, false, ...args2);
    }
  });
  KeybindingsRegistry.registerCommandAndKeybindingRule({
    id: PIN_EDITOR_COMMAND_ID,
    weight: 200 /* WorkbenchContrib */,
    when: ActiveEditorStickyContext.toNegated(),
    primary: KeyChord(2048 /* CtrlCmd */ | 41 /* KeyK */, 1024 /* Shift */ | 3 /* Enter */),
    handler: async (accessor, ...args2) => {
      const resolvedContext = resolveCommandsContext(args2, accessor.get(IEditorService), accessor.get(IEditorGroupsService), accessor.get(IListService));
      for (const { group: group2, editors } of resolvedContext.groupedEditors) {
        for (const editor of editors) {
          group2.stickEditor(editor);
        }
      }
    }
  });
  KeybindingsRegistry.registerCommandAndKeybindingRule({
    id: UNPIN_EDITOR_COMMAND_ID,
    weight: 200 /* WorkbenchContrib */,
    when: ActiveEditorStickyContext,
    primary: KeyChord(2048 /* CtrlCmd */ | 41 /* KeyK */, 1024 /* Shift */ | 3 /* Enter */),
    handler: async (accessor, ...args2) => {
      const resolvedContext = resolveCommandsContext(args2, accessor.get(IEditorService), accessor.get(IEditorGroupsService), accessor.get(IListService));
      for (const { group: group2, editors } of resolvedContext.groupedEditors) {
        for (const editor of editors) {
          group2.unstickEditor(editor);
        }
      }
    }
  });
  KeybindingsRegistry.registerCommandAndKeybindingRule({
    id: SHOW_EDITORS_IN_GROUP,
    weight: 200 /* WorkbenchContrib */,
    when: void 0,
    primary: void 0,
    handler: (accessor, ...args2) => {
      const editorGroupsService = accessor.get(IEditorGroupsService);
      const quickInputService = accessor.get(IQuickInputService);
      const commandsContext = resolveCommandsContext(args2, accessor.get(IEditorService), editorGroupsService, accessor.get(IListService));
      const group2 = commandsContext.groupedEditors[0]?.group;
      if (group2) {
        editorGroupsService.activateGroup(group2);
      }
      return quickInputService.quickAccess.show(ActiveGroupEditorsByMostRecentlyUsedQuickAccess.PREFIX);
    }
  });
}

function registerModalEditorCommands() {
  registerAction2(class extends Action2 {
    constructor() {
      super({
        id: MOVE_MODAL_EDITOR_TO_MAIN_COMMAND_ID,
        title: localize2(6626, "Open Modal Editor in Main Window"),
        category: Categories.View,
        f1: true,
        icon: Codicon.openInProduct,
        precondition: EditorPartModalContext,
        menu: {
          id: MenuId.ModalEditorTitle,
          group: "navigation",
          order: 0,
          when: IsSessionsWindowContext.negate()
        }
      });
    }
    async run(accessor) {
      const editorGroupsService = accessor.get(IEditorGroupsService);
      for (const part of editorGroupsService.parts) {
        if (isModalEditorPart(part)) {
          await part.close({ mergeAllEditorsToMainPart: true });
          break;
        }
      }
    }
  });
  registerAction2(class extends Action2 {
    constructor() {
      super({
        id: MOVE_MODAL_EDITOR_TO_WINDOW_COMMAND_ID,
        title: localize2(6625, "Open Modal Editor in New Window"),
        category: Categories.View,
        f1: true,
        icon: Codicon.emptyWindow,
        precondition: EditorPartModalContext,
        menu: [{
          id: MenuId.ModalEditorTitleContext,
          group: "1_window",
          order: 0,
          when: IsSessionsWindowContext
        }]
      });
    }
    async run(accessor) {
      const editorGroupsService = accessor.get(IEditorGroupsService);
      for (const part of editorGroupsService.parts) {
        if (isModalEditorPart(part)) {
          const auxiliaryEditorPart = await editorGroupsService.createAuxiliaryEditorPart();
          for (const group2 of part.getGroups(1 /* MOST_RECENTLY_ACTIVE */)) {
            group2.moveEditors(group2.editors.map((editor) => ({ editor, options: { preserveFocus: true } })), auxiliaryEditorPart.activeGroup);
          }
          auxiliaryEditorPart.activeGroup.focus();
          await part.close();
          break;
        }
      }
    }
  });
  registerAction2(class extends Action2 {
    constructor() {
      super({
        id: TOGGLE_MODAL_EDITOR_SIDEBAR_COMMAND_ID,
        title: localize2(6634, "Toggle Modal Editor Sidebar"),
        category: Categories.View,
        f1: true,
        precondition: ContextKeyExpr.and(EditorPartModalContext, EditorPartModalSidebarContext)
      });
    }
    run(accessor) {
      const editorGroupsService = accessor.get(IEditorGroupsService);
      for (const part of editorGroupsService.parts) {
        if (isModalEditorPart(part)) {
          part.toggleSidebar();
          break;
        }
      }
    }
  });
  registerAction2(class extends Action2 {
    constructor() {
      super({
        id: TOGGLE_MODAL_EDITOR_MAXIMIZED_COMMAND_ID,
        title: localize2(6633, "Maximize Modal Editor"),
        category: Categories.View,
        f1: true,
        precondition: EditorPartModalContext,
        icon: Codicon.screenFull,
        toggled: {
          condition: EditorPartModalMaximizedContext,
          title: localize(6629, null)
        },
        menu: {
          id: MenuId.ModalEditorTitle,
          group: "navigation",
          order: 99
        }
      });
    }
    run(accessor) {
      const editorGroupsService = accessor.get(IEditorGroupsService);
      for (const part of editorGroupsService.parts) {
        if (isModalEditorPart(part)) {
          part.toggleMaximized();
          break;
        }
      }
    }
  });
  registerAction2(class extends Action2 {
    constructor() {
      super({
        id: CLOSE_MODAL_EDITOR_COMMAND_ID,
        title: localize2(6611, "Close Modal Editor"),
        category: Categories.View,
        f1: true,
        icon: Codicon.close,
        precondition: EditorPartModalContext,
        keybinding: [{
          primary: 9 /* Escape */,
          weight: 200 /* WorkbenchContrib */ + 10,
          // higher when no text editor or list/tree is focused...
          when: ContextKeyExpr.and(EditorContextKeys.focus.toNegated(), RawWorkbenchListFocusContextKey.negate())
        }, {
          primary: 9 /* Escape */,
          weight: 100 /* EditorContrib */ - 1,
          // ...lower to prevent accidental close when text editor is focused
          when: EditorContextKeys.focus
        }, {
          primary: 9 /* Escape */,
          // When a list/tree is focused, still close the modal, but yield to the
          // list/tree's own `Escape` features that should close first (the find
          // widget and sticky scroll). The selection is intentionally not cleared
          // first so a single `Escape` closes the modal.
          weight: 200 /* WorkbenchContrib */ + 1,
          when: ContextKeyExpr.and(RawWorkbenchListFocusContextKey, WorkbenchTreeFindOpen.negate(), WorkbenchTreeStickyScrollFocused.negate())
        }],
        menu: {
          id: MenuId.ModalEditorTitle,
          group: "navigation",
          order: 100
        }
      });
    }
    async run(accessor) {
      const editorGroupsService = accessor.get(IEditorGroupsService);
      for (const part of editorGroupsService.parts) {
        if (isModalEditorPart(part)) {
          await part.close();
          break;
        }
      }
    }
  });
  registerAction2(class extends Action2 {
    constructor() {
      super({
        id: NAVIGATE_MODAL_EDITOR_PREVIOUS_COMMAND_ID,
        title: localize2(6628, "Navigate to Previous Item in Modal Editor"),
        category: Categories.View,
        precondition: ContextKeyExpr.and(EditorPartModalContext, EditorPartModalNavigationContext),
        keybinding: {
          primary: 512 /* Alt */ | 16 /* UpArrow */,
          weight: 200 /* WorkbenchContrib */ + 10,
          when: ContextKeyExpr.and(EditorPartModalContext, EditorPartModalNavigationContext)
        }
      });
    }
    run(accessor) {
      const editorGroupsService = accessor.get(IEditorGroupsService);
      for (const part of editorGroupsService.parts) {
        if (isModalEditorPart(part)) {
          const nav = part.navigation;
          if (nav && nav.current > 0) {
            nav.navigate(nav.current - 1);
          }
          break;
        }
      }
    }
  });
  registerAction2(class extends Action2 {
    constructor() {
      super({
        id: NAVIGATE_MODAL_EDITOR_NEXT_COMMAND_ID,
        title: localize2(6627, "Navigate to Next Item in Modal Editor"),
        category: Categories.View,
        precondition: ContextKeyExpr.and(EditorPartModalContext, EditorPartModalNavigationContext),
        keybinding: {
          primary: 512 /* Alt */ | 18 /* DownArrow */,
          weight: 200 /* WorkbenchContrib */ + 10,
          when: ContextKeyExpr.and(EditorPartModalContext, EditorPartModalNavigationContext)
        }
      });
    }
    run(accessor) {
      const editorGroupsService = accessor.get(IEditorGroupsService);
      for (const part of editorGroupsService.parts) {
        if (isModalEditorPart(part)) {
          const nav = part.navigation;
          if (nav && nav.current < nav.total - 1) {
            nav.navigate(nav.current + 1);
          }
          break;
        }
      }
    }
  });
}

function isModalEditorPart(obj) {
  const part = obj;
  return !!part && typeof part.close === "function" && typeof part.onWillClose === "function" && typeof part.toggleMaximized === "function" && typeof part.maximized === "boolean" && typeof part.updateOptions === "function" && !!part.modalElement && part.windowId === mainWindow.vscodeWindowId;
}

function setup() {
  registerEditorMoveCopyCommand();
  registerEditorGroupsLayoutCommands();
  registerDiffEditorCommands();
  registerOpenEditorAPICommands();
  registerOpenEditorAtIndexCommands();
  registerCloseEditorCommands();
  registerOtherEditorCommands();
  registerSplitEditorInGroupCommands();
  registerFocusSideEditorsCommands();
  registerFocusEditorGroupAtIndexCommands();
  registerSplitEditorCommands();
  registerFocusEditorGroupWihoutWrapCommands();
  registerModalEditorCommands();
}
export { registerEditorMoveCopyCommand, registerEditorGroupsLayoutCommands, registerOpenEditorAPICommands, registerOpenEditorAtIndexCommands, registerFocusEditorGroupAtIndexCommands, splitEditor, registerSplitEditorCommands, registerCloseEditorCommands, registerFocusEditorGroupWihoutWrapCommands, registerSplitEditorInGroupCommands, registerFocusSideEditorsCommands, registerOtherEditorCommands, registerModalEditorCommands, isModalEditorPart, setup, CLOSE_SAVED_EDITORS_COMMAND_ID, CLOSE_EDITORS_IN_GROUP_COMMAND_ID, CLOSE_EDITORS_AND_GROUP_COMMAND_ID, CLOSE_EDITORS_TO_THE_RIGHT_COMMAND_ID, CLOSE_EDITOR_COMMAND_ID, CLOSE_PINNED_EDITOR_COMMAND_ID, CLOSE_EDITOR_GROUP_COMMAND_ID, CLOSE_OTHER_EDITORS_IN_GROUP_COMMAND_ID, MOVE_ACTIVE_EDITOR_COMMAND_ID, COPY_ACTIVE_EDITOR_COMMAND_ID, LAYOUT_EDITOR_GROUPS_COMMAND_ID, KEEP_EDITOR_COMMAND_ID, TOGGLE_KEEP_EDITORS_COMMAND_ID, TOGGLE_LOCK_GROUP_COMMAND_ID, LOCK_GROUP_COMMAND_ID, UNLOCK_GROUP_COMMAND_ID, SHOW_EDITORS_IN_GROUP, REOPEN_WITH_COMMAND_ID, REOPEN_ACTIVE_EDITOR_WITH_COMMAND_ID, PIN_EDITOR_COMMAND_ID, UNPIN_EDITOR_COMMAND_ID, SPLIT_EDITOR, SPLIT_EDITOR_UP, SPLIT_EDITOR_DOWN, SPLIT_EDITOR_LEFT, SPLIT_EDITOR_RIGHT, MOVE_EDITOR_INTO_ABOVE_GROUP, MOVE_EDITOR_INTO_BELOW_GROUP, MOVE_EDITOR_INTO_LEFT_GROUP, MOVE_EDITOR_INTO_RIGHT_GROUP, TOGGLE_MAXIMIZE_EDITOR_GROUP, SPLIT_EDITOR_IN_GROUP, TOGGLE_SPLIT_EDITOR_IN_GROUP, JOIN_EDITOR_IN_GROUP, TOGGLE_SPLIT_EDITOR_IN_GROUP_LAYOUT, FOCUS_FIRST_SIDE_EDITOR, FOCUS_SECOND_SIDE_EDITOR, FOCUS_OTHER_SIDE_EDITOR, FOCUS_LEFT_GROUP_WITHOUT_WRAP_COMMAND_ID, FOCUS_RIGHT_GROUP_WITHOUT_WRAP_COMMAND_ID, FOCUS_ABOVE_GROUP_WITHOUT_WRAP_COMMAND_ID, FOCUS_BELOW_GROUP_WITHOUT_WRAP_COMMAND_ID, OPEN_EDITOR_AT_INDEX_COMMAND_ID, MOVE_EDITOR_INTO_NEW_WINDOW_COMMAND_ID, COPY_EDITOR_INTO_NEW_WINDOW_COMMAND_ID, MOVE_EDITOR_GROUP_INTO_NEW_WINDOW_COMMAND_ID, COPY_EDITOR_GROUP_INTO_NEW_WINDOW_COMMAND_ID, NEW_EMPTY_EDITOR_WINDOW_COMMAND_ID, CLOSE_MODAL_EDITOR_COMMAND_ID, MOVE_MODAL_EDITOR_TO_MAIN_COMMAND_ID, MOVE_MODAL_EDITOR_TO_WINDOW_COMMAND_ID, TOGGLE_MODAL_EDITOR_MAXIMIZED_COMMAND_ID, NAVIGATE_MODAL_EDITOR_PREVIOUS_COMMAND_ID, NAVIGATE_MODAL_EDITOR_NEXT_COMMAND_ID, TOGGLE_MODAL_EDITOR_SIDEBAR_COMMAND_ID, API_OPEN_EDITOR_COMMAND_ID, API_OPEN_DIFF_EDITOR_COMMAND_ID, API_OPEN_WITH_EDITOR_COMMAND_ID, EDITOR_CORE_NAVIGATION_COMMANDS, isSelectedEditorsMoveCopyArg };
