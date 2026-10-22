// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/contrib/clipboard/browser/clipboard.ts
import { isNative, isWeb } from "./module-0014.mjs";
import { isFirefox2 } from "./module-0018.mjs";
import { EditorAction, MultiCommand, registerEditorAction } from "./module-0097.mjs";
import { MenuId, MenuRegistry } from "./module-0092.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { EditorContextKeys } from "./module-0154.mjs";
import { ContextKeyExpr } from "./module-0089.mjs";
import { ILogService } from "./module-0095.mjs";
import { IClipboardService } from "./module-0487.mjs";
import { CopyOptions, InMemoryClipboardMetadataManager, generateDataToCopyAndStoreInMemory } from "./module-0275.mjs";
import { ICodeEditorService } from "./module-0078.mjs";
import { getActiveDocument, getActiveWindow } from "./module-0075.mjs";
import { NativeEditContextRegistry } from "./module-0362.mjs";
import { CopyPasteController } from "./module-0555.mjs";


// src/vs/editor/contrib/clipboard/browser/clipboard.ts
var CLIPBOARD_CONTEXT_MENU_GROUP = "9_cutcopypaste";

var supportsCut = isNative || document.queryCommandSupported && document.queryCommandSupported("cut");

var supportsCopy = isNative || document.queryCommandSupported && document.queryCommandSupported("copy");

var supportsPaste = typeof navigator.clipboard === "undefined" || isFirefox2 ? document.queryCommandSupported && document.queryCommandSupported("paste") : true;

function registerCommand3(command4) {
  command4.register();
  return command4;
}

var CutAction = supportsCut ? registerCommand3(new MultiCommand({
  id: "editor.action.clipboardCutAction",
  precondition: void 0,
  kbOpts: (
    // Do not bind cut keybindings in the browser,
    // since browsers do that for us and it avoids security prompts
    isNative ? {
      primary: 2048 /* CtrlCmd */ | 54 /* KeyX */,
      win: { primary: 2048 /* CtrlCmd */ | 54 /* KeyX */, secondary: [1024 /* Shift */ | 20 /* Delete */] },
      weight: 100 /* EditorContrib */
    } : void 0
  ),
  menuOpts: [{
    menuId: MenuId.MenubarEditMenu,
    group: "2_ccp",
    title: localize(1000, null),
    order: 1
  }, {
    menuId: MenuId.EditorContext,
    group: CLIPBOARD_CONTEXT_MENU_GROUP,
    title: localize(996, null),
    when: EditorContextKeys.writable,
    order: 1
  }, {
    menuId: MenuId.CommandPalette,
    group: "",
    title: localize(996, null),
    order: 1
  }, {
    menuId: MenuId.SimpleEditorContext,
    group: CLIPBOARD_CONTEXT_MENU_GROUP,
    title: localize(996, null),
    when: EditorContextKeys.writable,
    order: 1
  }]
})) : void 0;

var CopyAction = supportsCopy ? registerCommand3(new MultiCommand({
  id: "editor.action.clipboardCopyAction",
  precondition: void 0,
  kbOpts: (
    // Do not bind copy keybindings in the browser,
    // since browsers do that for us and it avoids security prompts
    isNative ? {
      primary: 2048 /* CtrlCmd */ | 33 /* KeyC */,
      win: { primary: 2048 /* CtrlCmd */ | 33 /* KeyC */, secondary: [2048 /* CtrlCmd */ | 19 /* Insert */] },
      weight: 100 /* EditorContrib */
    } : void 0
  ),
  menuOpts: [{
    menuId: MenuId.MenubarEditMenu,
    group: "2_ccp",
    title: localize(999, null),
    order: 2
  }, {
    menuId: MenuId.EditorContext,
    group: CLIPBOARD_CONTEXT_MENU_GROUP,
    title: localize(994, null),
    order: 2
  }, {
    menuId: MenuId.CommandPalette,
    group: "",
    title: localize(994, null),
    order: 1
  }, {
    menuId: MenuId.SimpleEditorContext,
    group: CLIPBOARD_CONTEXT_MENU_GROUP,
    title: localize(994, null),
    order: 2
  }]
})) : void 0;

MenuRegistry.appendMenuItem(MenuId.MenubarEditMenu, { submenu: MenuId.MenubarCopy, title: localize2(998, "Copy As"), group: "2_ccp", order: 3 });

MenuRegistry.appendMenuItem(MenuId.EditorContext, { submenu: MenuId.EditorContextCopy, title: localize2(998, "Copy As"), group: CLIPBOARD_CONTEXT_MENU_GROUP, order: 3 });

MenuRegistry.appendMenuItem(MenuId.EditorContext, { submenu: MenuId.EditorContextShare, title: localize2(1002, "Share"), group: "11_share", order: -1, when: ContextKeyExpr.and(ContextKeyExpr.notEquals("resourceScheme", "output"), EditorContextKeys.editorTextFocus) });

MenuRegistry.appendMenuItem(MenuId.ExplorerContext, { submenu: MenuId.ExplorerContextShare, title: localize2(1002, "Share"), group: "11_share", order: -1 });

var PasteAction = supportsPaste ? registerCommand3(new MultiCommand({
  id: "editor.action.clipboardPasteAction",
  precondition: void 0,
  kbOpts: (
    // Do not bind paste keybindings in the browser,
    // since browsers do that for us and it avoids security prompts
    isNative ? {
      primary: 2048 /* CtrlCmd */ | 52 /* KeyV */,
      win: { primary: 2048 /* CtrlCmd */ | 52 /* KeyV */, secondary: [1024 /* Shift */ | 19 /* Insert */] },
      linux: { primary: 2048 /* CtrlCmd */ | 52 /* KeyV */, secondary: [1024 /* Shift */ | 19 /* Insert */] },
      weight: 100 /* EditorContrib */
    } : void 0
  ),
  menuOpts: [{
    menuId: MenuId.MenubarEditMenu,
    group: "2_ccp",
    title: localize(1001, null),
    order: 4
  }, {
    menuId: MenuId.EditorContext,
    group: CLIPBOARD_CONTEXT_MENU_GROUP,
    title: localize(997, null),
    when: EditorContextKeys.writable,
    order: 4
  }, {
    menuId: MenuId.CommandPalette,
    group: "",
    title: localize(997, null),
    order: 1
  }, {
    menuId: MenuId.SimpleEditorContext,
    group: CLIPBOARD_CONTEXT_MENU_GROUP,
    title: localize(997, null),
    when: EditorContextKeys.writable,
    order: 4
  }]
})) : void 0;

var ExecCommandCopyWithSyntaxHighlightingAction = class extends EditorAction {
  constructor() {
    super({
      id: "editor.action.clipboardCopyWithSyntaxHighlightingAction",
      label: localize2(995, "Copy with Syntax Highlighting"),
      precondition: void 0,
      kbOpts: {
        kbExpr: EditorContextKeys.textInputFocus,
        primary: 0,
        weight: 100 /* EditorContrib */
      }
    });
  }
  run(accessor, editor) {
    const logService = accessor.get(ILogService);
    const clipboardService = accessor.get(IClipboardService);
    logService.trace("ExecCommandCopyWithSyntaxHighlightingAction#run");
    if (!editor.hasModel()) {
      return;
    }
    const emptySelectionClipboard = editor.getOption(45 /* emptySelectionClipboard */);
    if (!emptySelectionClipboard && editor.getSelection().isEmpty()) {
      return;
    }
    CopyOptions.forceCopyWithSyntaxHighlighting = true;
    editor.focus();
    logService.trace("ExecCommandCopyWithSyntaxHighlightingAction (before execCommand copy)");
    executeClipboardCopyWithWorkaround(editor, clipboardService);
    logService.trace("ExecCommandCopyWithSyntaxHighlightingAction (after execCommand copy)");
    CopyOptions.forceCopyWithSyntaxHighlighting = false;
  }
};

function executeClipboardCopyWithWorkaround(editor, clipboardService) {
  CopyOptions.electronBugWorkaroundCopyEventHasFired = false;
  editor.getContainerDomNode().ownerDocument.execCommand("copy");
  if (isNative && CopyOptions.electronBugWorkaroundCopyEventHasFired === false) {
    const { dataToCopy } = generateDataToCopyAndStoreInMemory(editor._getViewModel(), void 0, isFirefox2);
    clipboardService.writeText(dataToCopy.text);
  }
}

function registerExecCommandImpl(target, browserCommand) {
  if (!target) {
    return;
  }
  target.addImplementation(1e4, "code-editor", (accessor, args2) => {
    const logService = accessor.get(ILogService);
    const clipboardService = accessor.get(IClipboardService);
    logService.trace("registerExecCommandImpl (addImplementation code-editor for : ", browserCommand, ")");
    const focusedEditor = accessor.get(ICodeEditorService).getFocusedCodeEditor();
    if (focusedEditor && focusedEditor.hasTextFocus() && focusedEditor.hasModel()) {
      const emptySelectionClipboard = focusedEditor.getOption(45 /* emptySelectionClipboard */);
      const selection = focusedEditor.getSelection();
      if (selection && selection.isEmpty() && !emptySelectionClipboard) {
        return true;
      }
      if (focusedEditor.getOption(170 /* effectiveEditContext */) && browserCommand === "cut") {
        logCopyCommand(focusedEditor);
        logService.trace("registerExecCommandImpl (before execCommand copy)");
        executeClipboardCopyWithWorkaround(focusedEditor, clipboardService);
        focusedEditor.trigger(void 0, "cut" /* Cut */, void 0);
        logService.trace("registerExecCommandImpl (after execCommand copy)");
      } else {
        logCopyCommand(focusedEditor);
        logService.trace("registerExecCommandImpl (before execCommand " + browserCommand + ")");
        if (browserCommand === "copy") {
          executeClipboardCopyWithWorkaround(focusedEditor, clipboardService);
        } else {
          focusedEditor.getContainerDomNode().ownerDocument.execCommand(browserCommand);
        }
        logService.trace("registerExecCommandImpl (after execCommand " + browserCommand + ")");
      }
      return true;
    }
    return false;
  });
  target.addImplementation(0, "generic-dom", (accessor, args2) => {
    const logService = accessor.get(ILogService);
    logService.trace("registerExecCommandImpl (addImplementation generic-dom for : ", browserCommand, ")");
    logService.trace("registerExecCommandImpl (before execCommand " + browserCommand + ")");
    getActiveDocument().execCommand(browserCommand);
    logService.trace("registerExecCommandImpl (after execCommand " + browserCommand + ")");
    return true;
  });
}

function logCopyCommand(editor) {
  const editContextEnabled = editor.getOption(170 /* effectiveEditContext */);
  if (editContextEnabled) {
    const nativeEditContext = NativeEditContextRegistry.get(editor.getId());
    if (nativeEditContext) {
      nativeEditContext.handleWillCopy();
    }
  }
}

registerExecCommandImpl(CutAction, "cut");

registerExecCommandImpl(CopyAction, "copy");

if (PasteAction) {
  PasteAction.addImplementation(1e4, "code-editor", (accessor, args2) => {
    const logService = accessor.get(ILogService);
    logService.trace("registerExecCommandImpl (addImplementation code-editor for : paste)");
    const codeEditorService = accessor.get(ICodeEditorService);
    const clipboardService = accessor.get(IClipboardService);
    const focusedEditor = codeEditorService.getFocusedCodeEditor();
    if (focusedEditor && focusedEditor.hasModel() && focusedEditor.hasTextFocus()) {
      const editContextEnabled = focusedEditor.getOption(170 /* effectiveEditContext */);
      if (editContextEnabled) {
        const nativeEditContext = NativeEditContextRegistry.get(focusedEditor.getId());
        if (nativeEditContext) {
          nativeEditContext.handleWillPaste();
        }
      }
      logService.trace("registerExecCommandImpl (before triggerPaste)");
      const triggerPaste = clipboardService.triggerPaste(getActiveWindow().vscodeWindowId);
      if (triggerPaste) {
        logService.trace("registerExecCommandImpl (triggerPaste defined)");
        return triggerPaste.then(async () => {
          logService.trace("registerExecCommandImpl (after triggerPaste)");
          return CopyPasteController.get(focusedEditor)?.finishedPaste() ?? Promise.resolve();
        });
      } else {
        logService.trace("registerExecCommandImpl (triggerPaste undefined)");
      }
      if (isWeb) {
        logService.trace("registerExecCommandImpl (Paste handling on web)");
        return (async () => {
          const clipboardText = await clipboardService.readText();
          if (clipboardText !== "") {
            const metadata = InMemoryClipboardMetadataManager.INSTANCE.get(clipboardText);
            let pasteOnNewLine = false;
            let multicursorText = null;
            let mode = null;
            if (metadata) {
              pasteOnNewLine = focusedEditor.getOption(45 /* emptySelectionClipboard */) && !!metadata.isFromEmptySelection;
              multicursorText = typeof metadata.multicursorText !== "undefined" ? metadata.multicursorText : null;
              mode = metadata.mode;
            }
            logService.trace("registerExecCommandImpl (clipboardText.length : ", clipboardText.length, " id : ", metadata?.id, ")");
            focusedEditor.trigger("keyboard", "paste" /* Paste */, {
              text: clipboardText,
              pasteOnNewLine,
              multicursorText,
              mode
            });
          }
        })();
      }
      return true;
    }
    return false;
  });
  PasteAction.addImplementation(0, "generic-dom", (accessor, args2) => {
    const logService = accessor.get(ILogService);
    logService.trace("registerExecCommandImpl (addImplementation generic-dom for : paste)");
    const triggerPaste = accessor.get(IClipboardService).triggerPaste(getActiveWindow().vscodeWindowId);
    return triggerPaste ?? false;
  });
}

if (supportsCopy) {
  registerEditorAction(ExecCommandCopyWithSyntaxHighlightingAction);
}
export { registerCommand3, executeClipboardCopyWithWorkaround, registerExecCommandImpl, logCopyCommand, CLIPBOARD_CONTEXT_MENU_GROUP, supportsCut, supportsCopy, supportsPaste, CutAction, CopyAction, PasteAction, ExecCommandCopyWithSyntaxHighlightingAction };
