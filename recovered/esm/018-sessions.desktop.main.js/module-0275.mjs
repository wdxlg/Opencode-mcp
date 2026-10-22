// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/browser/controller/editContext/clipboardUtils.ts
import { generateUuid } from "./module-0190.mjs";
import { isWindows } from "./module-0014.mjs";
import { Mimes } from "./module-0136.mjs";
import { toExternalVSDataTransfer } from "./module-0274.mjs";


// src/vs/editor/browser/controller/editContext/clipboardUtils.ts
function generateDataToCopyAndStoreInMemory(viewModel, id2, isFirefox3) {
  const { dataToCopy, metadata } = generateDataToCopy(viewModel);
  storeMetadataInMemory(dataToCopy.text, metadata, isFirefox3);
  return { dataToCopy, metadata };
}

function storeMetadataInMemory(textToCopy, metadata, isFirefox3) {
  InMemoryClipboardMetadataManager.INSTANCE.set(
    // When writing "LINE\r\n" to the clipboard and then pasting,
    // Firefox pastes "LINE\n", so let's work around this quirk
    isFirefox3 ? textToCopy.replace(/\r\n/g, "\n") : textToCopy,
    metadata
  );
}

function generateDataToCopy(viewModel) {
  const emptySelectionClipboard = viewModel.getEditorOption(45 /* emptySelectionClipboard */);
  const copyWithSyntaxHighlighting = viewModel.getEditorOption(31 /* copyWithSyntaxHighlighting */);
  const selections = viewModel.getCursorStates().map((cursorState) => cursorState.modelState.selection);
  const dataToCopy = getDataToCopy(viewModel, selections, emptySelectionClipboard, copyWithSyntaxHighlighting);
  const metadata = {
    version: 1,
    id: generateUuid(),
    isFromEmptySelection: dataToCopy.isFromEmptySelection,
    multicursorText: dataToCopy.multicursorText,
    mode: dataToCopy.mode
  };
  return { dataToCopy, metadata };
}

function getDataToCopy(viewModel, modelSelections, emptySelectionClipboard, copyWithSyntaxHighlighting) {
  const { sourceRanges, sourceText } = viewModel.getPlainTextToCopy(modelSelections, emptySelectionClipboard, isWindows);
  const newLineCharacter = viewModel.model.getEOL();
  const isFromEmptySelection = emptySelectionClipboard && modelSelections.length === 1 && modelSelections[0].isEmpty();
  const multicursorText = Array.isArray(sourceText) ? sourceText : null;
  const text2 = Array.isArray(sourceText) ? sourceText.join(newLineCharacter) : sourceText;
  let html3 = void 0;
  let mode = null;
  if (CopyOptions.forceCopyWithSyntaxHighlighting || copyWithSyntaxHighlighting && sourceText.length < 65536) {
    const richText = viewModel.getRichTextToCopy(modelSelections, emptySelectionClipboard);
    if (richText) {
      html3 = richText.html;
      mode = richText.mode;
    }
  }
  const dataToCopy = {
    isFromEmptySelection,
    sourceRanges,
    multicursorText,
    text: text2,
    html: html3,
    mode
  };
  return dataToCopy;
}

var InMemoryClipboardMetadataManager = class _InMemoryClipboardMetadataManager {
  static {
    this.INSTANCE = new _InMemoryClipboardMetadataManager();
  }
  constructor() {
    this._lastState = null;
  }
  set(lastCopiedValue, data) {
    this._lastState = { lastCopiedValue, data };
  }
  get(pastedText) {
    if (this._lastState && this._lastState.lastCopiedValue === pastedText) {
      return this._lastState.data;
    }
    this._lastState = null;
    return null;
  }
};

var CopyOptions = {
  forceCopyWithSyntaxHighlighting: false,
  electronBugWorkaroundCopyEventHasFired: false
};

var ClipboardEventUtils = {
  getTextData(clipboardData) {
    const text2 = clipboardData.getData(Mimes.text);
    let metadata = null;
    const rawmetadata = clipboardData.getData("vscode-editor-data");
    if (typeof rawmetadata === "string") {
      try {
        metadata = JSON.parse(rawmetadata);
        if (metadata.version !== 1) {
          metadata = null;
        }
      } catch (err) {
      }
    }
    if (text2.length === 0 && metadata === null && clipboardData.files.length > 0) {
      const files = Array.prototype.slice.call(clipboardData.files, 0);
      return [files.map((file) => file.name).join("\n"), null];
    }
    return [text2, metadata];
  },
  setTextData(clipboardData, text2, html3, metadata) {
    clipboardData.setData(Mimes.text, text2);
    if (typeof html3 === "string") {
      clipboardData.setData("text/html", html3);
    }
    clipboardData.setData("vscode-editor-data", JSON.stringify(metadata));
  }
};

function createClipboardCopyEvent(e4, isCut, context2, logService, isFirefox3) {
  const { dataToCopy, metadata } = generateDataToCopy(context2.viewModel);
  let handled = false;
  return {
    isCut,
    clipboardData: {
      setData: (type, value2) => {
        e4.clipboardData?.setData(type, value2);
      }
    },
    dataToCopy,
    ensureClipboardGetsEditorData: () => {
      e4.preventDefault();
      if (e4.clipboardData) {
        ClipboardEventUtils.setTextData(e4.clipboardData, dataToCopy.text, dataToCopy.html, metadata);
      }
      storeMetadataInMemory(dataToCopy.text, metadata, isFirefox3);
      logService.trace("ensureClipboardGetsEditorSelection with id : ", metadata.id, " with text.length: ", dataToCopy.text.length);
    },
    setHandled: () => {
      handled = true;
      e4.preventDefault();
      e4.stopImmediatePropagation();
    },
    get isHandled() {
      return handled;
    }
  };
}

function createClipboardPasteEvent(e4) {
  let handled = false;
  let [text2, metadata] = e4.clipboardData ? ClipboardEventUtils.getTextData(e4.clipboardData) : ["", null];
  metadata = metadata || InMemoryClipboardMetadataManager.INSTANCE.get(text2);
  return {
    clipboardData: createReadableClipboardData(e4.clipboardData),
    metadata,
    text: text2,
    toExternalVSDataTransfer: () => e4.clipboardData ? toExternalVSDataTransfer(e4.clipboardData) : void 0,
    browserEvent: e4,
    setHandled: () => {
      handled = true;
      e4.preventDefault();
      e4.stopImmediatePropagation();
    },
    get isHandled() {
      return handled;
    }
  };
}

function createReadableClipboardData(dataTransfer) {
  return {
    types: Array.from(dataTransfer?.types ?? []),
    files: Array.prototype.slice.call(dataTransfer?.files ?? [], 0),
    getData: (type) => dataTransfer?.getData(type) ?? ""
  };
}
export { generateDataToCopyAndStoreInMemory, storeMetadataInMemory, generateDataToCopy, getDataToCopy, createClipboardCopyEvent, createClipboardPasteEvent, createReadableClipboardData, InMemoryClipboardMetadataManager, CopyOptions, ClipboardEventUtils };
