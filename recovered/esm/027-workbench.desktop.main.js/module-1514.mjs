// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/browser/actions/listCommands.ts
import { isActiveElement } from "./module-0075.mjs";
import { IListService, RawWorkbenchListFocusContextKey, WorkbenchListFocusContextKey, WorkbenchListHasSelectionOrFocus, WorkbenchListScrollAtBottomContextKey, WorkbenchListScrollAtTopContextKey, WorkbenchListSelectionNavigation, WorkbenchListSupportsFind, WorkbenchListSupportsMultiSelectContextKey, WorkbenchTreeElementCanCollapse, WorkbenchTreeElementCanExpand, WorkbenchTreeElementHasChild, WorkbenchTreeElementHasParent, WorkbenchTreeFindOpen, WorkbenchTreeStickyScrollFocused, getSelectionKeyboardEvent } from "./module-0636.mjs";
import { equals, range } from "./module-0007.mjs";
import { KeybindingsRegistry } from "./module-0091.mjs";
import { List } from "./module-0460.mjs";
import { PagedList } from "./module-0624.mjs";
import { Table } from "./module-0626.mjs";
import { ObjectTree } from "./module-0632.mjs";
import { DataTree } from "./module-0634.mjs";
import { AsyncDataTree } from "./module-0633.mjs";
import { ContextKeyExpr } from "./module-0089.mjs";
import { KeyChord } from "./module-0019.mjs";
import { IHoverService } from "./module-0520.mjs";
import { CommandsRegistry } from "./module-0087.mjs";
import { AbstractTree } from "./module-0629.mjs";
import { Action2, registerAction2 } from "./module-0092.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { IConfigurationService } from "./module-0132.mjs";


// src/vs/workbench/browser/actions/listCommands.ts
function ensureDOMFocus(widget) {
  const element = widget?.getHTMLElement();
  if (element && !isActiveElement(element)) {
    widget?.domFocus();
  }
}

async function updateFocus(widget, updateFocusFn) {
  if (!WorkbenchListSelectionNavigation.getValue(widget.contextKeyService)) {
    return updateFocusFn(widget);
  }
  const focus = widget.getFocus();
  const selection = widget.getSelection();
  await updateFocusFn(widget);
  const newFocus = widget.getFocus();
  if (selection.length > 1 || !equals(focus, selection) || equals(focus, newFocus)) {
    return;
  }
  const fakeKeyboardEvent = new KeyboardEvent("keydown");
  widget.setSelection(newFocus, fakeKeyboardEvent);
}

async function navigate(widget, updateFocusFn) {
  if (!widget) {
    return;
  }
  await updateFocus(widget, updateFocusFn);
  const listFocus = widget.getFocus();
  if (listFocus.length) {
    widget.reveal(listFocus[0]);
  }
  widget.setAnchor(listFocus[0]);
  ensureDOMFocus(widget);
}

KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: "list.focusDown",
  weight: 200 /* WorkbenchContrib */,
  when: WorkbenchListFocusContextKey,
  primary: 18 /* DownArrow */,
  mac: {
    primary: 18 /* DownArrow */,
    secondary: [256 /* WinCtrl */ | 44 /* KeyN */]
  },
  handler: (accessor, arg2) => {
    navigate(accessor.get(IListService).lastFocusedList, async (widget) => {
      const fakeKeyboardEvent = new KeyboardEvent("keydown");
      await widget.focusNext(typeof arg2 === "number" ? arg2 : 1, false, fakeKeyboardEvent);
    });
  }
});

KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: "list.focusUp",
  weight: 200 /* WorkbenchContrib */,
  when: WorkbenchListFocusContextKey,
  primary: 16 /* UpArrow */,
  mac: {
    primary: 16 /* UpArrow */,
    secondary: [256 /* WinCtrl */ | 46 /* KeyP */]
  },
  handler: (accessor, arg2) => {
    navigate(accessor.get(IListService).lastFocusedList, async (widget) => {
      const fakeKeyboardEvent = new KeyboardEvent("keydown");
      await widget.focusPrevious(typeof arg2 === "number" ? arg2 : 1, false, fakeKeyboardEvent);
    });
  }
});

KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: "list.focusAnyDown",
  weight: 200 /* WorkbenchContrib */,
  when: WorkbenchListFocusContextKey,
  primary: 512 /* Alt */ | 18 /* DownArrow */,
  mac: {
    primary: 512 /* Alt */ | 18 /* DownArrow */,
    secondary: [256 /* WinCtrl */ | 512 /* Alt */ | 44 /* KeyN */]
  },
  handler: (accessor, arg2) => {
    navigate(accessor.get(IListService).lastFocusedList, async (widget) => {
      const fakeKeyboardEvent = new KeyboardEvent("keydown", { altKey: true });
      await widget.focusNext(typeof arg2 === "number" ? arg2 : 1, false, fakeKeyboardEvent);
    });
  }
});

KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: "list.focusAnyUp",
  weight: 200 /* WorkbenchContrib */,
  when: WorkbenchListFocusContextKey,
  primary: 512 /* Alt */ | 16 /* UpArrow */,
  mac: {
    primary: 512 /* Alt */ | 16 /* UpArrow */,
    secondary: [256 /* WinCtrl */ | 512 /* Alt */ | 46 /* KeyP */]
  },
  handler: (accessor, arg2) => {
    navigate(accessor.get(IListService).lastFocusedList, async (widget) => {
      const fakeKeyboardEvent = new KeyboardEvent("keydown", { altKey: true });
      await widget.focusPrevious(typeof arg2 === "number" ? arg2 : 1, false, fakeKeyboardEvent);
    });
  }
});

KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: "list.focusPageDown",
  weight: 200 /* WorkbenchContrib */,
  when: WorkbenchListFocusContextKey,
  primary: 12 /* PageDown */,
  handler: (accessor) => {
    navigate(accessor.get(IListService).lastFocusedList, async (widget) => {
      const fakeKeyboardEvent = new KeyboardEvent("keydown");
      await widget.focusNextPage(fakeKeyboardEvent);
    });
  }
});

KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: "list.focusPageUp",
  weight: 200 /* WorkbenchContrib */,
  when: WorkbenchListFocusContextKey,
  primary: 11 /* PageUp */,
  handler: (accessor) => {
    navigate(accessor.get(IListService).lastFocusedList, async (widget) => {
      const fakeKeyboardEvent = new KeyboardEvent("keydown");
      await widget.focusPreviousPage(fakeKeyboardEvent);
    });
  }
});

KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: "list.focusFirst",
  weight: 200 /* WorkbenchContrib */,
  when: WorkbenchListFocusContextKey,
  primary: 14 /* Home */,
  handler: (accessor) => {
    navigate(accessor.get(IListService).lastFocusedList, async (widget) => {
      const fakeKeyboardEvent = new KeyboardEvent("keydown");
      await widget.focusFirst(fakeKeyboardEvent);
    });
  }
});

KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: "list.focusLast",
  weight: 200 /* WorkbenchContrib */,
  when: WorkbenchListFocusContextKey,
  primary: 13 /* End */,
  handler: (accessor) => {
    navigate(accessor.get(IListService).lastFocusedList, async (widget) => {
      const fakeKeyboardEvent = new KeyboardEvent("keydown");
      await widget.focusLast(fakeKeyboardEvent);
    });
  }
});

KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: "list.focusAnyFirst",
  weight: 200 /* WorkbenchContrib */,
  when: WorkbenchListFocusContextKey,
  primary: 512 /* Alt */ | 14 /* Home */,
  handler: (accessor) => {
    navigate(accessor.get(IListService).lastFocusedList, async (widget) => {
      const fakeKeyboardEvent = new KeyboardEvent("keydown", { altKey: true });
      await widget.focusFirst(fakeKeyboardEvent);
    });
  }
});

KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: "list.focusAnyLast",
  weight: 200 /* WorkbenchContrib */,
  when: WorkbenchListFocusContextKey,
  primary: 512 /* Alt */ | 13 /* End */,
  handler: (accessor) => {
    navigate(accessor.get(IListService).lastFocusedList, async (widget) => {
      const fakeKeyboardEvent = new KeyboardEvent("keydown", { altKey: true });
      await widget.focusLast(fakeKeyboardEvent);
    });
  }
});

function expandMultiSelection(focused, previousFocus) {
  if (focused instanceof List || focused instanceof PagedList || focused instanceof Table) {
    const list2 = focused;
    const focus = list2.getFocus() ? list2.getFocus()[0] : void 0;
    const selection = list2.getSelection();
    if (selection && typeof focus === "number" && selection.indexOf(focus) >= 0) {
      list2.setSelection(selection.filter((s) => s !== previousFocus));
    } else {
      if (typeof focus === "number") {
        list2.setSelection(selection.concat(focus));
      }
    }
  } else if (focused instanceof ObjectTree || focused instanceof DataTree || focused instanceof AsyncDataTree) {
    const list2 = focused;
    const focus = list2.getFocus() ? list2.getFocus()[0] : void 0;
    if (previousFocus === focus) {
      return;
    }
    const selection = list2.getSelection();
    const fakeKeyboardEvent = new KeyboardEvent("keydown", { shiftKey: true });
    if (selection && selection.indexOf(focus) >= 0) {
      list2.setSelection(selection.filter((s) => s !== previousFocus), fakeKeyboardEvent);
    } else {
      list2.setSelection(selection.concat(focus), fakeKeyboardEvent);
    }
  }
}

function revealFocusedStickyScroll(tree, postRevealAction) {
  const focus = tree.getStickyScrollFocus();
  if (focus.length === 0) {
    throw new Error(`StickyScroll has no focus`);
  }
  if (focus.length > 1) {
    throw new Error(`StickyScroll can only have a single focused item`);
  }
  tree.reveal(focus[0]);
  tree.getHTMLElement().focus();
  tree.setFocus(focus);
  postRevealAction?.(focus[0]);
}

KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: "list.expandSelectionDown",
  weight: 200 /* WorkbenchContrib */,
  when: ContextKeyExpr.and(WorkbenchListFocusContextKey, WorkbenchListSupportsMultiSelectContextKey),
  primary: 1024 /* Shift */ | 18 /* DownArrow */,
  handler: (accessor, arg2) => {
    const widget = accessor.get(IListService).lastFocusedList;
    if (!widget) {
      return;
    }
    const previousFocus = widget.getFocus() ? widget.getFocus()[0] : void 0;
    const fakeKeyboardEvent = new KeyboardEvent("keydown");
    widget.focusNext(typeof arg2 === "number" ? arg2 : 1, false, fakeKeyboardEvent);
    expandMultiSelection(widget, previousFocus);
    const focus = widget.getFocus();
    if (focus.length) {
      widget.reveal(focus[0]);
    }
    ensureDOMFocus(widget);
  }
});

KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: "list.expandSelectionUp",
  weight: 200 /* WorkbenchContrib */,
  when: ContextKeyExpr.and(WorkbenchListFocusContextKey, WorkbenchListSupportsMultiSelectContextKey),
  primary: 1024 /* Shift */ | 16 /* UpArrow */,
  handler: (accessor, arg2) => {
    const widget = accessor.get(IListService).lastFocusedList;
    if (!widget) {
      return;
    }
    const previousFocus = widget.getFocus() ? widget.getFocus()[0] : void 0;
    const fakeKeyboardEvent = new KeyboardEvent("keydown");
    widget.focusPrevious(typeof arg2 === "number" ? arg2 : 1, false, fakeKeyboardEvent);
    expandMultiSelection(widget, previousFocus);
    const focus = widget.getFocus();
    if (focus.length) {
      widget.reveal(focus[0]);
    }
    ensureDOMFocus(widget);
  }
});

KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: "list.collapse",
  weight: 200 /* WorkbenchContrib */,
  when: ContextKeyExpr.and(WorkbenchListFocusContextKey, ContextKeyExpr.or(WorkbenchTreeElementCanCollapse, WorkbenchTreeElementHasParent)),
  primary: 15 /* LeftArrow */,
  mac: {
    primary: 15 /* LeftArrow */,
    secondary: [2048 /* CtrlCmd */ | 16 /* UpArrow */]
  },
  handler: (accessor) => {
    const widget = accessor.get(IListService).lastFocusedList;
    if (!widget || !(widget instanceof ObjectTree || widget instanceof DataTree || widget instanceof AsyncDataTree)) {
      return;
    }
    const tree = widget;
    const focusedElements = tree.getFocus();
    if (focusedElements.length === 0) {
      return;
    }
    const focus = focusedElements[0];
    if (!tree.collapse(focus)) {
      const parent = tree.getParentElement(focus);
      if (parent) {
        navigate(widget, (widget2) => {
          const fakeKeyboardEvent = new KeyboardEvent("keydown");
          widget2.setFocus([parent], fakeKeyboardEvent);
        });
      }
    }
  }
});

KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: "list.stickyScroll.collapse",
  weight: 200 /* WorkbenchContrib */ + 50,
  when: WorkbenchTreeStickyScrollFocused,
  primary: 15 /* LeftArrow */,
  mac: {
    primary: 15 /* LeftArrow */,
    secondary: [2048 /* CtrlCmd */ | 16 /* UpArrow */]
  },
  handler: (accessor) => {
    const widget = accessor.get(IListService).lastFocusedList;
    if (!widget || !(widget instanceof ObjectTree || widget instanceof DataTree || widget instanceof AsyncDataTree)) {
      return;
    }
    revealFocusedStickyScroll(widget, (focus) => widget.collapse(focus));
  }
});

KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: "list.collapseAll",
  weight: 200 /* WorkbenchContrib */,
  when: WorkbenchListFocusContextKey,
  primary: 2048 /* CtrlCmd */ | 15 /* LeftArrow */,
  mac: {
    primary: 2048 /* CtrlCmd */ | 15 /* LeftArrow */,
    secondary: [2048 /* CtrlCmd */ | 1024 /* Shift */ | 16 /* UpArrow */]
  },
  handler: (accessor) => {
    const focused = accessor.get(IListService).lastFocusedList;
    if (focused && !(focused instanceof List || focused instanceof PagedList || focused instanceof Table)) {
      focused.collapseAll();
    }
  }
});

KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: "list.collapseAllToFocus",
  weight: 200 /* WorkbenchContrib */,
  when: WorkbenchListFocusContextKey,
  handler: (accessor) => {
    const focused = accessor.get(IListService).lastFocusedList;
    const fakeKeyboardEvent = getSelectionKeyboardEvent("keydown", true);
    if (focused instanceof ObjectTree || focused instanceof DataTree || focused instanceof AsyncDataTree) {
      const tree = focused;
      const focus = tree.getFocus();
      if (focus.length > 0) {
        tree.collapse(focus[0], true);
      }
      tree.setSelection(focus, fakeKeyboardEvent);
      tree.setAnchor(focus[0]);
    }
  }
});

KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: "list.focusParent",
  weight: 200 /* WorkbenchContrib */,
  when: WorkbenchListFocusContextKey,
  handler: (accessor) => {
    const widget = accessor.get(IListService).lastFocusedList;
    if (!widget || !(widget instanceof ObjectTree || widget instanceof DataTree || widget instanceof AsyncDataTree)) {
      return;
    }
    const tree = widget;
    const focusedElements = tree.getFocus();
    if (focusedElements.length === 0) {
      return;
    }
    const focus = focusedElements[0];
    const parent = tree.getParentElement(focus);
    if (parent) {
      navigate(widget, (widget2) => {
        const fakeKeyboardEvent = new KeyboardEvent("keydown");
        widget2.setFocus([parent], fakeKeyboardEvent);
      });
    }
  }
});

KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: "list.expand",
  weight: 200 /* WorkbenchContrib */,
  when: ContextKeyExpr.and(WorkbenchListFocusContextKey, ContextKeyExpr.or(WorkbenchTreeElementCanExpand, WorkbenchTreeElementHasChild)),
  primary: 17 /* RightArrow */,
  handler: (accessor) => {
    const widget = accessor.get(IListService).lastFocusedList;
    if (!widget) {
      return;
    }
    if (widget instanceof ObjectTree || widget instanceof DataTree) {
      const focusedElements = widget.getFocus();
      if (focusedElements.length === 0) {
        return;
      }
      const focus = focusedElements[0];
      if (!widget.expand(focus)) {
        const child = widget.getFirstElementChild(focus);
        if (child) {
          const node = widget.getNode(child);
          if (node.visible) {
            navigate(widget, (widget2) => {
              const fakeKeyboardEvent = new KeyboardEvent("keydown");
              widget2.setFocus([child], fakeKeyboardEvent);
            });
          }
        }
      }
    } else if (widget instanceof AsyncDataTree) {
      const focusedElements = widget.getFocus();
      if (focusedElements.length === 0) {
        return;
      }
      const focus = focusedElements[0];
      widget.expand(focus).then((didExpand) => {
        if (focus && !didExpand) {
          const child = widget.getFirstElementChild(focus);
          if (child) {
            const node = widget.getNode(child);
            if (node.visible) {
              navigate(widget, (widget2) => {
                const fakeKeyboardEvent = new KeyboardEvent("keydown");
                widget2.setFocus([child], fakeKeyboardEvent);
              });
            }
          }
        }
      });
    }
  }
});

function selectElement(accessor, retainCurrentFocus) {
  const focused = accessor.get(IListService).lastFocusedList;
  const fakeKeyboardEvent = getSelectionKeyboardEvent("keydown", retainCurrentFocus);
  if (focused instanceof List || focused instanceof PagedList || focused instanceof Table) {
    const list2 = focused;
    list2.setAnchor(list2.getFocus()[0]);
    list2.setSelection(list2.getFocus(), fakeKeyboardEvent);
  } else if (focused instanceof ObjectTree || focused instanceof DataTree || focused instanceof AsyncDataTree) {
    const tree = focused;
    const focus = tree.getFocus();
    if (focus.length > 0) {
      let toggleCollapsed = true;
      if (tree.expandOnlyOnTwistieClick === true) {
        toggleCollapsed = false;
      } else if (typeof tree.expandOnlyOnTwistieClick !== "boolean" && tree.expandOnlyOnTwistieClick(focus[0])) {
        toggleCollapsed = false;
      }
      if (toggleCollapsed) {
        tree.toggleCollapsed(focus[0]);
      }
    }
    tree.setAnchor(focus[0]);
    tree.setSelection(focus, fakeKeyboardEvent);
  }
}

KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: "list.select",
  weight: 200 /* WorkbenchContrib */,
  when: WorkbenchListFocusContextKey,
  primary: 3 /* Enter */,
  mac: {
    primary: 3 /* Enter */,
    secondary: [2048 /* CtrlCmd */ | 18 /* DownArrow */]
  },
  handler: (accessor) => {
    selectElement(accessor, false);
  }
});

KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: "list.stickyScrollselect",
  weight: 200 /* WorkbenchContrib */ + 50,
  // priorities over file explorer
  when: WorkbenchTreeStickyScrollFocused,
  primary: 3 /* Enter */,
  mac: {
    primary: 3 /* Enter */,
    secondary: [2048 /* CtrlCmd */ | 18 /* DownArrow */]
  },
  handler: (accessor) => {
    const widget = accessor.get(IListService).lastFocusedList;
    if (!widget || !(widget instanceof ObjectTree || widget instanceof DataTree || widget instanceof AsyncDataTree)) {
      return;
    }
    revealFocusedStickyScroll(widget, (focus) => widget.setSelection([focus]));
  }
});

KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: "list.selectAndPreserveFocus",
  weight: 200 /* WorkbenchContrib */,
  when: WorkbenchListFocusContextKey,
  handler: (accessor) => {
    selectElement(accessor, true);
  }
});

KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: "list.selectAll",
  weight: 200 /* WorkbenchContrib */,
  when: ContextKeyExpr.and(WorkbenchListFocusContextKey, WorkbenchListSupportsMultiSelectContextKey),
  primary: 2048 /* CtrlCmd */ | 31 /* KeyA */,
  handler: (accessor) => {
    const focused = accessor.get(IListService).lastFocusedList;
    if (focused instanceof List || focused instanceof PagedList || focused instanceof Table) {
      const list2 = focused;
      const fakeKeyboardEvent = new KeyboardEvent("keydown");
      list2.setSelection(range(list2.length), fakeKeyboardEvent);
    } else if (focused instanceof ObjectTree || focused instanceof DataTree || focused instanceof AsyncDataTree) {
      const tree = focused;
      const focus = tree.getFocus();
      const selection = tree.getSelection();
      let start = void 0;
      if (focus.length > 0 && (selection.length === 0 || !selection.includes(focus[0]))) {
        start = focus[0];
      }
      if (!start && selection.length > 0) {
        start = selection[0];
      }
      let scope = void 0;
      if (!start) {
        scope = void 0;
      } else {
        scope = tree.getParentElement(start);
      }
      const newSelection = [];
      const visit2 = (node) => {
        for (const child of node.children) {
          if (child.visible) {
            newSelection.push(child.element);
            if (!child.collapsed) {
              visit2(child);
            }
          }
        }
      };
      visit2(tree.getNode(scope));
      if (scope && selection.length === newSelection.length) {
        newSelection.unshift(scope);
      }
      const fakeKeyboardEvent = new KeyboardEvent("keydown");
      tree.setSelection(newSelection, fakeKeyboardEvent);
    }
  }
});

KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: "list.toggleSelection",
  weight: 200 /* WorkbenchContrib */,
  when: WorkbenchListFocusContextKey,
  primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 3 /* Enter */,
  handler: (accessor) => {
    const widget = accessor.get(IListService).lastFocusedList;
    if (!widget) {
      return;
    }
    const focus = widget.getFocus();
    if (focus.length === 0) {
      return;
    }
    const selection = widget.getSelection();
    const index2 = selection.indexOf(focus[0]);
    if (index2 > -1) {
      widget.setSelection([...selection.slice(0, index2), ...selection.slice(index2 + 1)]);
    } else {
      widget.setSelection([...selection, focus[0]]);
    }
  }
});

KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: "list.showHover",
  weight: 200 /* WorkbenchContrib */,
  primary: KeyChord(2048 /* CtrlCmd */ | 41 /* KeyK */, 2048 /* CtrlCmd */ | 39 /* KeyI */),
  when: WorkbenchListFocusContextKey,
  handler: async (accessor) => {
    const listService = accessor.get(IListService);
    const lastFocusedList = listService.lastFocusedList;
    if (!lastFocusedList) {
      return;
    }
    const focus = lastFocusedList.getFocus();
    if (!focus || focus.length === 0) {
      return;
    }
    const treeDOM = lastFocusedList.getHTMLElement();
    const scrollableElement = treeDOM.querySelector(".monaco-scrollable-element");
    const listRows = scrollableElement?.querySelector(".monaco-list-rows");
    const focusedElement = listRows?.querySelector(".focused");
    if (!focusedElement) {
      return;
    }
    const elementWithHover = getCustomHoverForElement(focusedElement);
    if (elementWithHover) {
      accessor.get(IHoverService).showManagedHover(elementWithHover);
    }
  }
});

function getCustomHoverForElement(element) {
  if (element.matches('[custom-hover="true"]')) {
    return element;
  }
  const noneFocusableElementWithHover = element.querySelector('[custom-hover="true"]:not([tabindex]):not(.action-item)');
  if (noneFocusableElementWithHover) {
    return noneFocusableElementWithHover;
  }
  return void 0;
}

KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: "list.toggleExpand",
  weight: 200 /* WorkbenchContrib */,
  when: WorkbenchListFocusContextKey,
  primary: 10 /* Space */,
  handler: (accessor) => {
    const focused = accessor.get(IListService).lastFocusedList;
    if (focused instanceof ObjectTree || focused instanceof DataTree || focused instanceof AsyncDataTree) {
      const tree = focused;
      const focus = tree.getFocus();
      if (!tree.options.disableExpandOnSpacebar && focus.length > 0 && tree.isCollapsible(focus[0])) {
        tree.toggleCollapsed(focus[0]);
        return;
      }
    }
    selectElement(accessor, true);
  }
});

KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: "list.stickyScrolltoggleExpand",
  weight: 200 /* WorkbenchContrib */ + 50,
  // priorities over file explorer
  when: WorkbenchTreeStickyScrollFocused,
  primary: 10 /* Space */,
  handler: (accessor) => {
    const widget = accessor.get(IListService).lastFocusedList;
    if (!widget || !(widget instanceof ObjectTree || widget instanceof DataTree || widget instanceof AsyncDataTree)) {
      return;
    }
    revealFocusedStickyScroll(widget);
  }
});

KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: "list.clear",
  weight: 200 /* WorkbenchContrib */,
  when: ContextKeyExpr.and(WorkbenchListFocusContextKey, WorkbenchListHasSelectionOrFocus),
  primary: 9 /* Escape */,
  handler: (accessor) => {
    const widget = accessor.get(IListService).lastFocusedList;
    if (!widget) {
      return;
    }
    const selection = widget.getSelection();
    const fakeKeyboardEvent = new KeyboardEvent("keydown");
    if (selection.length > 1) {
      const useSelectionNavigation = WorkbenchListSelectionNavigation.getValue(widget.contextKeyService);
      if (useSelectionNavigation) {
        const focus = widget.getFocus();
        widget.setSelection([focus[0]], fakeKeyboardEvent);
      } else {
        widget.setSelection([], fakeKeyboardEvent);
      }
    } else {
      widget.setSelection([], fakeKeyboardEvent);
      widget.setFocus([], fakeKeyboardEvent);
    }
    widget.setAnchor(void 0);
  }
});

CommandsRegistry.registerCommand({
  id: "list.triggerTypeNavigation",
  handler: (accessor) => {
    const widget = accessor.get(IListService).lastFocusedList;
    widget?.triggerTypeNavigation();
  }
});

CommandsRegistry.registerCommand({
  id: "list.toggleFindMode",
  handler: (accessor) => {
    const widget = accessor.get(IListService).lastFocusedList;
    if (widget instanceof AbstractTree || widget instanceof AsyncDataTree) {
      const tree = widget;
      tree.findMode = tree.findMode === 1 /* Filter */ ? 0 /* Highlight */ : 1 /* Filter */;
    }
  }
});

CommandsRegistry.registerCommand({
  id: "list.toggleFindMatchType",
  handler: (accessor) => {
    const widget = accessor.get(IListService).lastFocusedList;
    if (widget instanceof AbstractTree || widget instanceof AsyncDataTree) {
      const tree = widget;
      tree.findMatchType = tree.findMatchType === 1 /* Contiguous */ ? 0 /* Fuzzy */ : 1 /* Contiguous */;
    }
  }
});

CommandsRegistry.registerCommandAlias("list.toggleKeyboardNavigation", "list.triggerTypeNavigation");

CommandsRegistry.registerCommandAlias("list.toggleFilterOnType", "list.toggleFindMode");

KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: "list.find",
  weight: 200 /* WorkbenchContrib */,
  when: ContextKeyExpr.and(RawWorkbenchListFocusContextKey, WorkbenchListSupportsFind),
  primary: 2048 /* CtrlCmd */ | 512 /* Alt */ | 36 /* KeyF */,
  secondary: [61 /* F3 */],
  handler: (accessor) => {
    const widget = accessor.get(IListService).lastFocusedList;
    if (widget instanceof List || widget instanceof PagedList || widget instanceof Table) {
    } else if (widget instanceof AbstractTree || widget instanceof AsyncDataTree) {
      const tree = widget;
      tree.openFind();
    }
  }
});

KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: "list.closeFind",
  weight: 200 /* WorkbenchContrib */,
  when: ContextKeyExpr.and(RawWorkbenchListFocusContextKey, WorkbenchTreeFindOpen),
  primary: 9 /* Escape */,
  handler: (accessor) => {
    const widget = accessor.get(IListService).lastFocusedList;
    if (widget instanceof AbstractTree || widget instanceof AsyncDataTree) {
      const tree = widget;
      tree.closeFind();
    }
  }
});

KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: "list.scrollUp",
  weight: 200 /* WorkbenchContrib */,
  // Since the default keybindings for list.scrollUp and widgetNavigation.focusPrevious
  // are both Ctrl+UpArrow, we disable this command when the scrollbar is at
  // top-most position. This will give chance for widgetNavigation.focusPrevious to execute
  when: ContextKeyExpr.and(
    WorkbenchListFocusContextKey,
    WorkbenchListScrollAtTopContextKey?.negate()
  ),
  primary: 2048 /* CtrlCmd */ | 16 /* UpArrow */,
  handler: (accessor) => {
    const focused = accessor.get(IListService).lastFocusedList;
    if (!focused) {
      return;
    }
    focused.scrollTop -= 10;
  }
});

KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: "list.scrollDown",
  weight: 200 /* WorkbenchContrib */,
  // same as above
  when: ContextKeyExpr.and(
    WorkbenchListFocusContextKey,
    WorkbenchListScrollAtBottomContextKey?.negate()
  ),
  primary: 2048 /* CtrlCmd */ | 18 /* DownArrow */,
  handler: (accessor) => {
    const focused = accessor.get(IListService).lastFocusedList;
    if (!focused) {
      return;
    }
    focused.scrollTop += 10;
  }
});

KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: "list.scrollLeft",
  weight: 200 /* WorkbenchContrib */,
  when: WorkbenchListFocusContextKey,
  handler: (accessor) => {
    const focused = accessor.get(IListService).lastFocusedList;
    if (!focused) {
      return;
    }
    focused.scrollLeft -= 10;
  }
});

KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: "list.scrollRight",
  weight: 200 /* WorkbenchContrib */,
  when: WorkbenchListFocusContextKey,
  handler: (accessor) => {
    const focused = accessor.get(IListService).lastFocusedList;
    if (!focused) {
      return;
    }
    focused.scrollLeft += 10;
  }
});

registerAction2(class ToggleStickyScroll2 extends Action2 {
  constructor() {
    super({
      id: "tree.toggleStickyScroll",
      title: {
        ...localize2(6113, "Toggle Tree Sticky Scroll"),
        mnemonicTitle: localize(6112, null)
      },
      category: "View",
      metadata: { description: localize(6114, null) },
      f1: true
    });
  }
  run(accessor) {
    const configurationService = accessor.get(IConfigurationService);
    const newValue = !configurationService.getValue("workbench.tree.enableStickyScroll");
    configurationService.updateValue("workbench.tree.enableStickyScroll", newValue);
  }
});
export { ensureDOMFocus, updateFocus, navigate, expandMultiSelection, revealFocusedStickyScroll, selectElement, getCustomHoverForElement };
