// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/browser/parts/editor/editorCommandsContext.ts
import { List } from "./module-0460.mjs";
import { getActiveElement } from "./module-0075.mjs";
import { isEditorCommandsContext, isEditorIdentifier } from "./module-0925.mjs";
import { URI } from "./module-0032.mjs";
import { isEditorGroup } from "./module-0933.mjs";


// src/vs/workbench/browser/parts/editor/editorCommandsContext.ts
function resolveCommandsContext(commandArgs, editorService, editorGroupsService, listService) {
  const commandContext = getCommandsContext(commandArgs, editorService, editorGroupsService, listService);
  const preserveFocus = commandContext.length ? commandContext[0].preserveFocus || false : false;
  const resolvedContext = { groupedEditors: [], preserveFocus };
  for (const editorContext of commandContext) {
    const groupAndEditor = getEditorAndGroupFromContext(editorContext, editorGroupsService);
    if (!groupAndEditor) {
      continue;
    }
    const { group: group2, editor } = groupAndEditor;
    let groupContext = void 0;
    for (const targetGroupContext of resolvedContext.groupedEditors) {
      if (targetGroupContext.group.id === group2.id) {
        groupContext = targetGroupContext;
        break;
      }
    }
    if (!groupContext) {
      groupContext = { group: group2, editors: [] };
      resolvedContext.groupedEditors.push(groupContext);
    }
    if (editor) {
      groupContext.editors.push(editor);
    }
  }
  return resolvedContext;
}

function getCommandsContext(commandArgs, editorService, editorGroupsService, listService) {
  const list2 = listService.lastFocusedList;
  let isListAction = list2 instanceof List && list2.getHTMLElement() === getActiveElement();
  let editorContext = getEditorContextFromCommandArgs(commandArgs, isListAction, editorService, editorGroupsService, listService);
  if (!editorContext) {
    const modalEditorPart = editorGroupsService.activeModalEditorPart;
    const activeGroup = modalEditorPart?.activeGroup ?? editorGroupsService.activeGroup;
    const activeEditor = activeGroup.activeEditor;
    editorContext = { groupId: activeGroup.id, editorIndex: activeEditor ? activeGroup.getIndexOfEditor(activeEditor) : void 0 };
    isListAction = false;
  }
  const multiEditorContext = getMultiSelectContext(editorContext, isListAction, editorService, editorGroupsService, listService);
  return moveCurrentEditorContextToFront(editorContext, multiEditorContext);
}

function moveCurrentEditorContextToFront(editorContext, multiEditorContext) {
  if (multiEditorContext.length <= 1) {
    return multiEditorContext;
  }
  const editorContextIndex = multiEditorContext.findIndex(
    (context2) => context2.groupId === editorContext.groupId && context2.editorIndex === editorContext.editorIndex
  );
  if (editorContextIndex !== -1) {
    multiEditorContext.splice(editorContextIndex, 1);
    multiEditorContext.unshift(editorContext);
  } else if (editorContext.editorIndex === void 0) {
    multiEditorContext.unshift(editorContext);
  } else {
    throw new Error("Editor context not found in multi editor context");
  }
  return multiEditorContext;
}

function getEditorContextFromCommandArgs(commandArgs, isListAction, editorService, editorGroupsService, listService) {
  const filteredArgs = commandArgs.filter((arg) => isEditorCommandsContext(arg) || URI.isUri(arg));
  for (const arg of filteredArgs) {
    if (isEditorCommandsContext(arg)) {
      return arg;
    }
  }
  for (const uri5 of filteredArgs) {
    const editorIdentifiers = editorService.findEditors(uri5);
    if (editorIdentifiers.length) {
      const editorIdentifier = editorIdentifiers[0];
      const group2 = editorGroupsService.getGroup(editorIdentifier.groupId);
      return { groupId: editorIdentifier.groupId, editorIndex: group2?.getIndexOfEditor(editorIdentifier.editor) };
    }
  }
  if (isListAction) {
    const list2 = listService.lastFocusedList;
    for (const focusedElement of list2.getFocusedElements()) {
      if (isGroupOrEditor(focusedElement)) {
        return groupOrEditorToEditorContext(focusedElement, void 0, editorGroupsService);
      }
    }
  }
  return void 0;
}

function getMultiSelectContext(editorContext, isListAction, editorService, editorGroupsService, listService) {
  if (isListAction) {
    const list2 = listService.lastFocusedList;
    const selection = list2.getSelectedElements().filter(isGroupOrEditor);
    if (selection.length > 1) {
      return selection.map((e) => groupOrEditorToEditorContext(e, editorContext.preserveFocus, editorGroupsService));
    }
    if (selection.length === 0) {
      return getMultiSelectContext(editorContext, false, editorService, editorGroupsService, listService);
    }
  } else {
    const group2 = editorGroupsService.getGroup(editorContext.groupId);
    const editor = editorContext.editorIndex !== void 0 ? group2?.getEditorByIndex(editorContext.editorIndex) : group2?.activeEditor;
    if (group2 && editor && group2.isSelected(editor)) {
      return group2.selectedEditors.map((editor2) => groupOrEditorToEditorContext({ editor: editor2, groupId: group2.id }, editorContext.preserveFocus, editorGroupsService));
    }
  }
  return [editorContext];
}

function groupOrEditorToEditorContext(element, preserveFocus, editorGroupsService) {
  if (isEditorGroup(element)) {
    return { groupId: element.id, editorIndex: void 0, preserveFocus };
  }
  const group2 = editorGroupsService.getGroup(element.groupId);
  return { groupId: element.groupId, editorIndex: group2 ? group2.getIndexOfEditor(element.editor) : -1, preserveFocus };
}

function isGroupOrEditor(element) {
  return isEditorGroup(element) || isEditorIdentifier(element);
}

function getEditorAndGroupFromContext(commandContext, editorGroupsService) {
  const group2 = editorGroupsService.getGroup(commandContext.groupId);
  if (!group2) {
    return void 0;
  }
  if (commandContext.editorIndex === void 0) {
    return { group: group2, editor: void 0 };
  }
  const editor = group2.getEditorByIndex(commandContext.editorIndex);
  return { group: group2, editor };
}
export { resolveCommandsContext, getCommandsContext, moveCurrentEditorContextToFront, getEditorContextFromCommandArgs, getMultiSelectContext, groupOrEditorToEditorContext, isGroupOrEditor, getEditorAndGroupFromContext };
