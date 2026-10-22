// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/chatTerminalCommandPaste.ts
import { localize } from "./module-0001.mjs";


// src/vs/workbench/contrib/chat/browser/chatTerminalCommandPaste.ts
var terminalCommandPasteDontAskAgainStorageKey = "chat.terminalCommandPaste.dontAskAgain";

function isTerminalCommandInput(value2, prefix) {
  return !!prefix && value2.startsWith(prefix);
}

function isTerminalCommandPaste(paste) {
  const selectionStartOffset = Math.max(0, Math.min(paste.selectionStartOffset, paste.currentValue.length));
  const selectionEndOffset = Math.max(selectionStartOffset, Math.min(paste.selectionEndOffset, paste.currentValue.length));
  if (paste.currentValue.length !== 0 && selectionStartOffset !== 0) {
    return false;
  }
  const resultingText = paste.currentValue.slice(0, selectionStartOffset) + paste.pastedText + paste.currentValue.slice(selectionEndOffset);
  return resultingText.startsWith(paste.prefix);
}

function isTerminalCommandPasteWarningSuppressed(storageService) {
  return storageService.getBoolean(terminalCommandPasteDontAskAgainStorageKey, -1 /* APPLICATION */, false);
}

async function shouldPasteTerminalCommand(dialogService, storageService, prefix) {
  if (isTerminalCommandPasteWarningSuppressed(storageService)) {
    return "paste";
  }
  const { result } = await dialogService.prompt({
    type: "warning",
    message: localize(11288, null, prefix),
    buttons: [
      {
        label: localize(11286, null),
        run: () => "paste"
      },
      {
        label: localize(11287, null),
        run: () => "pasteAndDontAskAgain"
      }
    ],
    custom: true,
    cancelButton: true
  });
  if (result === "pasteAndDontAskAgain") {
    storageService.store(terminalCommandPasteDontAskAgainStorageKey, true, -1 /* APPLICATION */, 0 /* USER */);
    return "paste";
  }
  return result === "paste" ? "paste" : "cancel";
}

function handleTerminalCommandPaste(e4, editor, prefix, dialogService, storageService) {
  if (e4.defaultPrevented || !prefix) {
    return;
  }
  const pastedText = e4.clipboardData?.getData("text");
  const model = editor.getModel();
  const selection = editor.getSelection();
  if (!pastedText || !model || !selection) {
    return;
  }
  const paste = {
    prefix,
    pastedText,
    currentValue: model.getValue(),
    selectionStartOffset: model.getOffsetAt(selection.getStartPosition()),
    selectionEndOffset: model.getOffsetAt(selection.getEndPosition())
  };
  if (!isTerminalCommandPaste(paste) || isTerminalCommandPasteWarningSuppressed(storageService)) {
    return;
  }
  e4.preventDefault();
  e4.stopImmediatePropagation();
  shouldPasteTerminalCommand(dialogService, storageService, prefix).then((result) => {
    if (result === "paste") {
      editor.trigger("keyboard", "paste" /* Paste */, { text: pastedText });
    }
  });
}
export { isTerminalCommandInput, isTerminalCommandPaste, isTerminalCommandPasteWarningSuppressed, shouldPasteTerminalCommand, handleTerminalCommandPaste, terminalCommandPasteDontAskAgainStorageKey };
