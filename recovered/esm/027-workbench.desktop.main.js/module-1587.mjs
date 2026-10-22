// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/services/editor/common/editorGroupFinder.ts
import { IEditorGroupsService, preferredSideBySideGroupDirection } from "./module-0933.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { AUX_WINDOW_GROUP, MODAL_GROUP, SIDE_GROUP, USE_MODAL_EDITOR_SETTING } from "./module-0934.mjs";
import { isEditorInput, isEditorInputWithOptions } from "./module-0925.mjs";
import { EditorInput } from "./module-0928.mjs";


// src/vs/workbench/services/editor/common/editorGroupFinder.ts
function findGroup(accessor, editor, preferredGroup) {
  const editorGroupService = accessor.get(IEditorGroupsService);
  const configurationService = accessor.get(IConfigurationService);
  const group2 = doFindGroup(editor, preferredGroup, editorGroupService, configurationService);
  if (group2 instanceof Promise) {
    return group2.then((group3) => handleGroupResult(group3, editor, preferredGroup, editorGroupService, configurationService));
  }
  return handleGroupResult(group2, editor, preferredGroup, editorGroupService, configurationService);
}

function handleGroupResult(group2, editor, preferredGroup, editorGroupService, configurationService) {
  const modalEditorPart = editorGroupService.activeModalEditorPart;
  const modalEditorMode = configurationService.getValue(USE_MODAL_EDITOR_SETTING);
  const editorInput = isEditorInputWithOptions(editor) ? editor.editor : isEditorInput(editor) ? editor : void 0;
  const requiresModal = editorInput instanceof EditorInput && editorInput.hasCapability(2048 /* RequiresModal */) && modalEditorMode !== "off";
  if (modalEditorPart && preferredGroup !== MODAL_GROUP && modalEditorMode !== "all" && !requiresModal) {
    return handleModalEditorPart(group2, editor, modalEditorPart, editorGroupService, preferredGroup);
  }
  return handleGroupActivation(group2, editor, preferredGroup, editorGroupService);
}

async function handleModalEditorPart(group2, editor, modalEditorPart, editorGroupService, preferredGroup) {
  const options3 = editor.options;
  if (modalEditorPart.groups.some((modalGroup) => modalGroup.id === group2.id)) {
    group2 = editorGroupService.mainPart.activeGroup;
  }
  if (!options3?.preserveFocus) {
    await modalEditorPart.close();
  }
  return handleGroupActivation(group2, editor, preferredGroup, editorGroupService);
}

function handleGroupActivation(group2, editor, preferredGroup, editorGroupService) {
  let activation = void 0;
  if (editorGroupService.activeGroup !== group2 && // only if target group is not already active
  editor.options && !editor.options.inactive && // never for inactive editors
  editor.options.preserveFocus && // only if preserveFocus
  typeof editor.options.activation !== "number" && // only if activation is not already defined (either true or false)
  preferredGroup !== SIDE_GROUP) {
    activation = 1 /* ACTIVATE */;
  }
  return [group2, activation];
}

function doFindGroup(input, preferredGroup, editorGroupService, configurationService) {
  let group2;
  const editor = isEditorInputWithOptions(input) ? input.editor : input;
  const options3 = input.options;
  if (isEditorInput(editor) && editor.hasCapability(2048 /* RequiresModal */) && configurationService.getValue(USE_MODAL_EDITOR_SETTING) !== "off") {
    group2 = editorGroupService.createModalEditorPart(options3?.modal).then((part) => part.activeGroup);
  } else if (preferredGroup && typeof preferredGroup !== "number") {
    group2 = preferredGroup;
  } else if (typeof preferredGroup === "number" && preferredGroup >= 0) {
    group2 = editorGroupService.getGroup(preferredGroup);
  } else if (preferredGroup === SIDE_GROUP) {
    const direction = preferredSideBySideGroupDirection(configurationService);
    let candidateGroup = editorGroupService.findGroup({ direction });
    if (!candidateGroup || isGroupLockedForEditor(candidateGroup, editor)) {
      candidateGroup = editorGroupService.addGroup(editorGroupService.activeGroup, direction);
    }
    group2 = candidateGroup;
  } else if (preferredGroup === AUX_WINDOW_GROUP) {
    group2 = editorGroupService.createAuxiliaryEditorPart(options3?.auxiliary).then((group3) => group3.activeGroup);
  } else if (preferredGroup === MODAL_GROUP && configurationService.getValue(USE_MODAL_EDITOR_SETTING) !== "off") {
    group2 = editorGroupService.createModalEditorPart(options3?.modal).then((part) => part.activeGroup);
  } else if (!options3 || typeof options3.index !== "number") {
    const groupsByLastActive = editorGroupService.getGroups(1 /* MOST_RECENTLY_ACTIVE */);
    if (options3?.revealIfVisible) {
      for (const lastActiveGroup of groupsByLastActive) {
        if (isActive(lastActiveGroup, editor)) {
          group2 = lastActiveGroup;
          break;
        }
      }
    }
    if (!group2) {
      if (options3?.revealIfOpened || configurationService.getValue("workbench.editor.revealIfOpen") || isEditorInput(editor) && (editor.hasCapability(1024 /* ForceReveal */) || editor.hasCapability(8 /* Singleton */))) {
        let groupWithInputActive = void 0;
        let groupWithInputOpened = void 0;
        for (const group3 of groupsByLastActive) {
          if (isOpened(group3, editor)) {
            if (!groupWithInputOpened) {
              groupWithInputOpened = group3;
            }
            if (!groupWithInputActive && group3.isActive(editor)) {
              groupWithInputActive = group3;
            }
          }
          if (groupWithInputOpened && groupWithInputActive) {
            break;
          }
        }
        group2 = groupWithInputActive || groupWithInputOpened;
      }
    }
  }
  if (!group2 && configurationService.getValue(USE_MODAL_EDITOR_SETTING) === "all") {
    group2 = editorGroupService.createModalEditorPart(options3?.modal).then((part) => part.activeGroup);
  }
  if (!group2) {
    let candidateGroup = editorGroupService.activeGroup;
    if (isGroupLockedForEditor(candidateGroup, editor)) {
      for (const group3 of editorGroupService.getGroups(1 /* MOST_RECENTLY_ACTIVE */)) {
        if (isGroupLockedForEditor(group3, editor)) {
          continue;
        }
        candidateGroup = group3;
        break;
      }
      if (isGroupLockedForEditor(candidateGroup, editor)) {
        group2 = editorGroupService.addGroup(candidateGroup, preferredSideBySideGroupDirection(configurationService));
      } else {
        group2 = candidateGroup;
      }
    } else {
      group2 = candidateGroup;
    }
  }
  return group2;
}

function isGroupLockedForEditor(group2, editor) {
  if (!group2.isLocked) {
    return false;
  }
  if (isOpened(group2, editor)) {
    return false;
  }
  return true;
}

function isActive(group2, editor) {
  if (!group2.activeEditor) {
    return false;
  }
  return group2.activeEditor.matches(editor);
}

function isOpened(group2, editor) {
  for (const typedEditor of group2.editors) {
    if (typedEditor.matches(editor)) {
      return true;
    }
  }
  return false;
}
export { findGroup, handleGroupResult, handleModalEditorPart, handleGroupActivation, doFindGroup, isGroupLockedForEditor, isActive, isOpened };
