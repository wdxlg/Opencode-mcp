// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/browser/parts/editor/editor.ts
import { Dimension } from "./module-0075.mjs";
import { isObject } from "./module-0010.mjs";
import { BooleanVerifier, EnumVerifier, NumberVerifier, ObjectVerifier, SetVerifier, verifyObject } from "./module-1087.mjs";
import { coalesce } from "./module-0007.mjs";


// src/vs/workbench/browser/parts/editor/editor.ts
var DEFAULT_EDITOR_MIN_DIMENSIONS = new Dimension(220, 70);

var DEFAULT_EDITOR_MAX_DIMENSIONS = new Dimension(Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY);

var DEFAULT_EDITOR_PART_OPTIONS = {
  showTabs: "multiple",
  highlightModifiedTabs: false,
  tabActionLocation: "right",
  tabActionReserveSpace: true,
  tabActionCloseVisibility: true,
  tabActionUnpinVisibility: true,
  showTabIndex: false,
  alwaysShowEditorActions: false,
  tabSizing: "fit",
  tabSizingFixedMinWidth: 50,
  tabSizingFixedMaxWidth: 160,
  pinnedTabSizing: "normal",
  pinnedTabsOnSeparateRow: false,
  tabHeight: "default",
  preventPinnedEditorClose: "keyboardAndMouse",
  titleScrollbarSizing: "default",
  titleScrollbarVisibility: "auto",
  focusRecentEditorAfterClose: true,
  showIcons: true,
  hasIcons: true,
  // 'vs-seti' is our default icon theme
  enablePreview: true,
  openPositioning: "right",
  openSideBySideDirection: "right",
  closeEmptyGroups: true,
  labelFormat: "default",
  splitSizing: "auto",
  splitOnDragAndDrop: true,
  allowDropIntoGroup: true,
  dragToOpenWindow: true,
  centeredLayoutFixedWidth: false,
  doubleClickTabToToggleEditorGroupSizes: "expand",
  editorActionsLocation: "default",
  wrapTabs: false,
  enablePreviewFromQuickOpen: false,
  scrollToSwitchTabs: false,
  enablePreviewFromCodeNavigation: false,
  closeOnFileDelete: false,
  swipeToNavigate: false,
  mouseBackForwardToNavigate: true,
  restoreViewState: true,
  splitInGroupLayout: "horizontal",
  revealIfOpen: false,
  // Properties that are Objects have to be defined as getters
  // to ensure no consumer modifies the default values
  get limit() {
    return { enabled: false, value: 10, perEditorGroup: false, excludeDirty: false };
  },
  get decorations() {
    return { badges: true, colors: true };
  },
  get autoLockGroups() {
    return /* @__PURE__ */ new Set();
  }
};

function impactsEditorPartOptions(event) {
  return event.affectsConfiguration("workbench.editor") || event.affectsConfiguration("workbench.iconTheme") || event.affectsConfiguration("window.density");
}

function getEditorPartOptions(configurationService, themeService) {
  const options3 = {
    ...DEFAULT_EDITOR_PART_OPTIONS,
    hasIcons: themeService.getFileIconTheme().hasFileIcons
  };
  const config = configurationService.getValue();
  if (config?.workbench?.editor) {
    Object.assign(options3, config.workbench.editor);
    if (isObject(config.workbench.editor.autoLockGroups)) {
      options3.autoLockGroups = DEFAULT_EDITOR_PART_OPTIONS.autoLockGroups;
      for (const [editorId, enablement] of Object.entries(config.workbench.editor.autoLockGroups)) {
        if (enablement === true) {
          options3.autoLockGroups.add(editorId);
        }
      }
    } else {
      options3.autoLockGroups = DEFAULT_EDITOR_PART_OPTIONS.autoLockGroups;
    }
  }
  const windowConfig = configurationService.getValue();
  if (windowConfig?.window?.density?.editorTabHeight) {
    options3.tabHeight = windowConfig.window.density.editorTabHeight;
  }
  return validateEditorPartOptions(options3);
}

function validateEditorPartOptions(options3) {
  if (typeof options3.showTabs === "boolean") {
    options3.showTabs = options3.showTabs ? "multiple" : "single";
  }
  return verifyObject({
    "wrapTabs": new BooleanVerifier(DEFAULT_EDITOR_PART_OPTIONS["wrapTabs"]),
    "scrollToSwitchTabs": new BooleanVerifier(DEFAULT_EDITOR_PART_OPTIONS["scrollToSwitchTabs"]),
    "highlightModifiedTabs": new BooleanVerifier(DEFAULT_EDITOR_PART_OPTIONS["highlightModifiedTabs"]),
    "tabActionReserveSpace": new BooleanVerifier(DEFAULT_EDITOR_PART_OPTIONS["tabActionReserveSpace"]),
    "tabActionCloseVisibility": new BooleanVerifier(DEFAULT_EDITOR_PART_OPTIONS["tabActionCloseVisibility"]),
    "tabActionUnpinVisibility": new BooleanVerifier(DEFAULT_EDITOR_PART_OPTIONS["tabActionUnpinVisibility"]),
    "showTabIndex": new BooleanVerifier(DEFAULT_EDITOR_PART_OPTIONS["showTabIndex"]),
    "alwaysShowEditorActions": new BooleanVerifier(DEFAULT_EDITOR_PART_OPTIONS["alwaysShowEditorActions"]),
    "pinnedTabsOnSeparateRow": new BooleanVerifier(DEFAULT_EDITOR_PART_OPTIONS["pinnedTabsOnSeparateRow"]),
    "focusRecentEditorAfterClose": new BooleanVerifier(DEFAULT_EDITOR_PART_OPTIONS["focusRecentEditorAfterClose"]),
    "showIcons": new BooleanVerifier(DEFAULT_EDITOR_PART_OPTIONS["showIcons"]),
    "enablePreview": new BooleanVerifier(DEFAULT_EDITOR_PART_OPTIONS["enablePreview"]),
    "enablePreviewFromQuickOpen": new BooleanVerifier(DEFAULT_EDITOR_PART_OPTIONS["enablePreviewFromQuickOpen"]),
    "enablePreviewFromCodeNavigation": new BooleanVerifier(DEFAULT_EDITOR_PART_OPTIONS["enablePreviewFromCodeNavigation"]),
    "closeOnFileDelete": new BooleanVerifier(DEFAULT_EDITOR_PART_OPTIONS["closeOnFileDelete"]),
    "closeEmptyGroups": new BooleanVerifier(DEFAULT_EDITOR_PART_OPTIONS["closeEmptyGroups"]),
    "revealIfOpen": new BooleanVerifier(DEFAULT_EDITOR_PART_OPTIONS["revealIfOpen"]),
    "swipeToNavigate": new BooleanVerifier(DEFAULT_EDITOR_PART_OPTIONS["swipeToNavigate"]),
    "mouseBackForwardToNavigate": new BooleanVerifier(DEFAULT_EDITOR_PART_OPTIONS["mouseBackForwardToNavigate"]),
    "restoreViewState": new BooleanVerifier(DEFAULT_EDITOR_PART_OPTIONS["restoreViewState"]),
    "splitOnDragAndDrop": new BooleanVerifier(DEFAULT_EDITOR_PART_OPTIONS["splitOnDragAndDrop"]),
    "allowDropIntoGroup": new BooleanVerifier(DEFAULT_EDITOR_PART_OPTIONS["allowDropIntoGroup"]),
    "dragToOpenWindow": new BooleanVerifier(DEFAULT_EDITOR_PART_OPTIONS["dragToOpenWindow"]),
    "centeredLayoutFixedWidth": new BooleanVerifier(DEFAULT_EDITOR_PART_OPTIONS["centeredLayoutFixedWidth"]),
    "hasIcons": new BooleanVerifier(DEFAULT_EDITOR_PART_OPTIONS["hasIcons"]),
    "tabSizingFixedMinWidth": new NumberVerifier(DEFAULT_EDITOR_PART_OPTIONS["tabSizingFixedMinWidth"]),
    "tabSizingFixedMaxWidth": new NumberVerifier(DEFAULT_EDITOR_PART_OPTIONS["tabSizingFixedMaxWidth"]),
    "showTabs": new EnumVerifier(DEFAULT_EDITOR_PART_OPTIONS["showTabs"], ["multiple", "single", "none"]),
    "tabActionLocation": new EnumVerifier(DEFAULT_EDITOR_PART_OPTIONS["tabActionLocation"], ["left", "right"]),
    "tabSizing": new EnumVerifier(DEFAULT_EDITOR_PART_OPTIONS["tabSizing"], ["fit", "shrink", "fixed"]),
    "pinnedTabSizing": new EnumVerifier(DEFAULT_EDITOR_PART_OPTIONS["pinnedTabSizing"], ["normal", "compact", "shrink"]),
    "tabHeight": new EnumVerifier(DEFAULT_EDITOR_PART_OPTIONS["tabHeight"], ["default", "compact"]),
    "preventPinnedEditorClose": new EnumVerifier(DEFAULT_EDITOR_PART_OPTIONS["preventPinnedEditorClose"], ["keyboardAndMouse", "keyboard", "mouse", "never"]),
    "titleScrollbarSizing": new EnumVerifier(DEFAULT_EDITOR_PART_OPTIONS["titleScrollbarSizing"], ["default", "large"]),
    "titleScrollbarVisibility": new EnumVerifier(DEFAULT_EDITOR_PART_OPTIONS["titleScrollbarVisibility"], ["auto", "visible", "hidden"]),
    "openPositioning": new EnumVerifier(DEFAULT_EDITOR_PART_OPTIONS["openPositioning"], ["left", "right", "first", "last"]),
    "openSideBySideDirection": new EnumVerifier(DEFAULT_EDITOR_PART_OPTIONS["openSideBySideDirection"], ["right", "down"]),
    "labelFormat": new EnumVerifier(DEFAULT_EDITOR_PART_OPTIONS["labelFormat"], ["default", "short", "medium", "long"]),
    "splitInGroupLayout": new EnumVerifier(DEFAULT_EDITOR_PART_OPTIONS["splitInGroupLayout"], ["vertical", "horizontal"]),
    "splitSizing": new EnumVerifier(DEFAULT_EDITOR_PART_OPTIONS["splitSizing"], ["distribute", "split", "auto"]),
    "doubleClickTabToToggleEditorGroupSizes": new EnumVerifier(DEFAULT_EDITOR_PART_OPTIONS["doubleClickTabToToggleEditorGroupSizes"], ["maximize", "expand", "off"]),
    "editorActionsLocation": new EnumVerifier(DEFAULT_EDITOR_PART_OPTIONS["editorActionsLocation"], ["default", "titleBar", "hidden"]),
    "autoLockGroups": new SetVerifier(DEFAULT_EDITOR_PART_OPTIONS["autoLockGroups"]),
    "limit": new ObjectVerifier(DEFAULT_EDITOR_PART_OPTIONS["limit"], {
      "enabled": new BooleanVerifier(DEFAULT_EDITOR_PART_OPTIONS["limit"]["enabled"]),
      "value": new NumberVerifier(DEFAULT_EDITOR_PART_OPTIONS["limit"]["value"]),
      "perEditorGroup": new BooleanVerifier(DEFAULT_EDITOR_PART_OPTIONS["limit"]["perEditorGroup"]),
      "excludeDirty": new BooleanVerifier(DEFAULT_EDITOR_PART_OPTIONS["limit"]["excludeDirty"])
    }),
    "decorations": new ObjectVerifier(DEFAULT_EDITOR_PART_OPTIONS["decorations"], {
      "badges": new BooleanVerifier(DEFAULT_EDITOR_PART_OPTIONS["decorations"]["badges"]),
      "colors": new BooleanVerifier(DEFAULT_EDITOR_PART_OPTIONS["decorations"]["colors"])
    })
  }, options3);
}

function fillActiveEditorViewState(group2, expectedActiveEditor, presetOptions) {
  if (!expectedActiveEditor || !group2.activeEditor || expectedActiveEditor.matches(group2.activeEditor)) {
    const options3 = {
      ...presetOptions,
      viewState: group2.activeEditorPane?.getViewState()
    };
    return options3;
  }
  return presetOptions || /* @__PURE__ */ Object.create(null);
}

function prepareMoveCopyEditors(sourceGroup, editors, preserveFocus) {
  if (editors.length === 0) {
    return [];
  }
  const editorsWithOptions = [];
  let activeEditor;
  const inactiveEditors = [];
  for (const editor of editors) {
    if (!activeEditor && sourceGroup.isActive(editor)) {
      activeEditor = editor;
    } else {
      inactiveEditors.push(editor);
    }
  }
  if (!activeEditor) {
    activeEditor = inactiveEditors.shift();
  }
  inactiveEditors.sort((a, b) => sourceGroup.getIndexOfEditor(b) - sourceGroup.getIndexOfEditor(a));
  const sortedEditors = coalesce([activeEditor, ...inactiveEditors]);
  for (let i2 = 0; i2 < sortedEditors.length; i2++) {
    const editor = sortedEditors[i2];
    editorsWithOptions.push({
      editor,
      options: {
        pinned: true,
        sticky: sourceGroup.isSticky(editor),
        inactive: i2 > 0,
        preserveFocus
      }
    });
  }
  return editorsWithOptions;
}
export { impactsEditorPartOptions, getEditorPartOptions, validateEditorPartOptions, fillActiveEditorViewState, prepareMoveCopyEditors, DEFAULT_EDITOR_MIN_DIMENSIONS, DEFAULT_EDITOR_MAX_DIMENSIONS, DEFAULT_EDITOR_PART_OPTIONS };
