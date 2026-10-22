// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/files/browser/files.ts
import { createDecorator } from "./module-0077.mjs";
import { isActiveElement } from "./module-0075.mjs";
import { List } from "./module-0460.mjs";
import { AsyncDataTree } from "./module-0633.mjs";
import { URI } from "./module-0032.mjs";
import { ExplorerItem } from "./module-2019.mjs";
import { OpenEditor } from "./module-1542.mjs";
import { EditorResourceAccessor } from "./module-0925.mjs";
import { coalesce } from "./module-0007.mjs";
import { IListService } from "./module-0636.mjs";


// src/vs/workbench/contrib/files/browser/files.ts
var IExplorerService = createDecorator("explorerService");

function getFocus(listService) {
  const list2 = listService.lastFocusedList;
  const element = list2?.getHTMLElement();
  if (element && isActiveElement(element)) {
    let focus;
    if (list2 instanceof List) {
      const focused = list2.getFocusedElements();
      if (focused.length) {
        focus = focused[0];
      }
    } else if (list2 instanceof AsyncDataTree) {
      const focused = list2.getFocus();
      if (focused.length) {
        focus = focused[0];
      }
    }
    return focus;
  }
  return void 0;
}

function getResourceForCommand(commandArg, editorService, listService) {
  if (URI.isUri(commandArg)) {
    return commandArg;
  }
  const focus = getFocus(listService);
  if (focus instanceof ExplorerItem) {
    return focus.resource;
  } else if (focus instanceof OpenEditor) {
    return focus.getResource();
  }
  return EditorResourceAccessor.getOriginalUri(editorService.activeEditor, { supportSideBySide: 1 /* PRIMARY */ });
}

function getMultiSelectedResources(commandArg, listService, editorSerice, editorGroupService, explorerService) {
  const list2 = listService.lastFocusedList;
  const element = list2?.getHTMLElement();
  if (element && isActiveElement(element)) {
    if (list2 instanceof AsyncDataTree && list2.getFocus().every((item) => item instanceof ExplorerItem)) {
      const context2 = explorerService.getContext(true, true);
      if (context2.length) {
        return context2.map((c) => c.resource);
      }
    }
    if (list2 instanceof List) {
      const selection2 = coalesce(list2.getSelectedElements().filter((s) => s instanceof OpenEditor).map((oe) => oe.getResource()));
      const focusedElements = list2.getFocusedElements();
      const focus = focusedElements.length ? focusedElements[0] : void 0;
      let mainUriStr = void 0;
      if (URI.isUri(commandArg)) {
        mainUriStr = commandArg.toString();
      } else if (focus instanceof OpenEditor) {
        const focusedResource = focus.getResource();
        mainUriStr = focusedResource ? focusedResource.toString() : void 0;
      }
      const mainIndex = selection2.findIndex((s) => s.toString() === mainUriStr);
      if (mainIndex !== -1) {
        const mainResource = selection2[mainIndex];
        selection2.splice(mainIndex, 1);
        selection2.unshift(mainResource);
        return selection2;
      }
    }
  }
  const activeGroup = editorGroupService.activeGroup;
  const selection = activeGroup.selectedEditors;
  if (selection.length > 1 && URI.isUri(commandArg)) {
    const mainEditorSelectionIndex = selection.findIndex((e) => e.matches({ resource: commandArg }));
    if (mainEditorSelectionIndex !== -1) {
      const mainEditor = selection[mainEditorSelectionIndex];
      selection.splice(mainEditorSelectionIndex, 1);
      selection.unshift(mainEditor);
      return selection.map((editor) => EditorResourceAccessor.getOriginalUri(editor)).filter((uri5) => !!uri5);
    }
  }
  const result = getResourceForCommand(commandArg, editorSerice, listService);
  return result ? [result] : [];
}

function getOpenEditorsViewMultiSelection(accessor) {
  const list2 = accessor.get(IListService).lastFocusedList;
  const element = list2?.getHTMLElement();
  if (element && isActiveElement(element)) {
    if (list2 instanceof List) {
      const selection = coalesce(list2.getSelectedElements().filter((s) => s instanceof OpenEditor));
      const focusedElements = list2.getFocusedElements();
      const focus = focusedElements.length ? focusedElements[0] : void 0;
      let mainEditor = void 0;
      if (focus instanceof OpenEditor) {
        mainEditor = focus;
      }
      if (selection.some((s) => s === mainEditor)) {
        return selection;
      }
      return mainEditor ? [mainEditor] : void 0;
    }
  }
  return void 0;
}
export { getFocus, getResourceForCommand, getMultiSelectedResources, getOpenEditorsViewMultiSelection, IExplorerService };
