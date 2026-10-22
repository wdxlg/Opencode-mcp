// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/notebook/common/notebookCommon.ts
import { Mimes } from "./module-0136.mjs";
import { Schemas } from "./module-0033.mjs";
import { extractCellOutputDetails, generate, generateMetadataUri, parse6, parseMetadataUri } from "./module-0908.mjs";
import { isWindows } from "./module-0014.mjs";
import { isRelativePattern, parse4 } from "./module-0857.mjs";
import { Iterable } from "./module-0011.mjs";
import { RawContextKey } from "./module-0089.mjs";
import { VSBuffer } from "./module-0038.mjs";


// src/vs/workbench/contrib/notebook/common/notebookCommon.ts
var NOTEBOOK_EDITOR_ID = "workbench.editor.notebook";

var NOTEBOOK_DIFF_EDITOR_ID = "workbench.editor.notebookTextDiffEditor";

var NOTEBOOK_MULTI_DIFF_EDITOR_ID = "workbench.editor.notebookMultiTextDiffEditor";

var INTERACTIVE_WINDOW_EDITOR_ID = "workbench.editor.interactive";

var REPL_EDITOR_ID = "workbench.editor.repl";

var NOTEBOOK_OUTPUT_EDITOR_ID = "workbench.editor.notebookOutputEditor";

var NOTEBOOK_DISPLAY_ORDER = [
  "application/json",
  "application/javascript",
  "text/html",
  "image/svg+xml",
  Mimes.latex,
  Mimes.markdown,
  "image/png",
  "image/jpeg",
  Mimes.text
];

var ACCESSIBLE_NOTEBOOK_DISPLAY_ORDER = [
  Mimes.latex,
  Mimes.markdown,
  "application/json",
  "text/html",
  "image/svg+xml",
  "image/png",
  "image/jpeg",
  Mimes.text
];

var RENDERER_EQUIVALENT_EXTENSIONS = /* @__PURE__ */ new Map([
  ["ms-toolsai.jupyter", /* @__PURE__ */ new Set(["jupyter-notebook", "interactive"])],
  ["ms-toolsai.jupyter-renderers", /* @__PURE__ */ new Set(["jupyter-notebook", "interactive"])]
]);

var RENDERER_NOT_AVAILABLE = "_notAvailable";

var NotebookMetadataUri;

((NotebookMetadataUri2) => {
  NotebookMetadataUri2.scheme = Schemas.vscodeNotebookMetadata;
  function generate2(notebook) {
    return generateMetadataUri(notebook);
  }
  NotebookMetadataUri2.generate = generate2;
  function parse14(metadata) {
    return parseMetadataUri(metadata);
  }
  NotebookMetadataUri2.parse = parse14;
})(NotebookMetadataUri || (NotebookMetadataUri = {}));

var CellUri;

((CellUri2) => {
  CellUri2.scheme = Schemas.vscodeNotebookCell;
  function generate2(notebook, handle2) {
    return generate(notebook, handle2);
  }
  CellUri2.generate = generate2;
  function parse14(cell) {
    return parse6(cell);
  }
  CellUri2.parse = parse14;
  function generateCellOutputUriWithId(notebook, outputId) {
    return notebook.with({
      scheme: Schemas.vscodeNotebookCellOutput,
      query: new URLSearchParams({
        openIn: "editor",
        outputId: outputId ?? "",
        notebookScheme: notebook.scheme !== Schemas.file ? notebook.scheme : ""
      }).toString()
    });
  }
  CellUri2.generateCellOutputUriWithId = generateCellOutputUriWithId;
  function generateCellOutputUriWithIndex(notebook, cellUri, outputIndex) {
    return notebook.with({
      scheme: Schemas.vscodeNotebookCellOutput,
      fragment: cellUri.fragment,
      query: new URLSearchParams({
        openIn: "notebook",
        outputIndex: String(outputIndex)
      }).toString()
    });
  }
  CellUri2.generateCellOutputUriWithIndex = generateCellOutputUriWithIndex;
  function generateOutputEditorUri(notebook, cellId, cellIndex, outputId, outputIndex) {
    return notebook.with({
      scheme: Schemas.vscodeNotebookCellOutput,
      query: new URLSearchParams({
        openIn: "notebookOutputEditor",
        notebook: notebook.toString(),
        cellIndex: String(cellIndex),
        outputId,
        outputIndex: String(outputIndex)
      }).toString()
    });
  }
  CellUri2.generateOutputEditorUri = generateOutputEditorUri;
  function parseCellOutputUri(uri5) {
    return extractCellOutputDetails(uri5);
  }
  CellUri2.parseCellOutputUri = parseCellOutputUri;
  function generateCellPropertyUri(notebook, handle2, scheme2) {
    return CellUri2.generate(notebook, handle2).with({ scheme: scheme2 });
  }
  CellUri2.generateCellPropertyUri = generateCellPropertyUri;
  function parseCellPropertyUri(uri5, propertyScheme) {
    if (uri5.scheme !== propertyScheme) {
      return void 0;
    }
    return CellUri2.parse(uri5.with({ scheme: CellUri2.scheme }));
  }
  CellUri2.parseCellPropertyUri = parseCellPropertyUri;
})(CellUri || (CellUri = {}));

var normalizeSlashes = (str) => isWindows ? str.replace(/\//g, "\\") : str;

var MimeTypeDisplayOrder = class {
  constructor(initialValue = [], defaultOrder = NOTEBOOK_DISPLAY_ORDER) {
    this.defaultOrder = defaultOrder;
    this.order = [...new Set(initialValue)].map((pattern) => ({
      pattern,
      matches: parse4(normalizeSlashes(pattern), { ignoreCase: true })
    }));
  }
  /**
   * Returns a sorted array of the input mimeTypes.
   */
  sort(mimeTypes) {
    const remaining = new Map(Iterable.map(mimeTypes, (m) => [m, normalizeSlashes(m)]));
    let sorted = [];
    for (const { matches: matches2 } of this.order) {
      for (const [original, normalized] of remaining) {
        if (matches2(normalized)) {
          sorted.push(original);
          remaining.delete(original);
          break;
        }
      }
    }
    if (remaining.size) {
      sorted = sorted.concat([...remaining.keys()].sort(
        (a, b) => this.defaultOrder.indexOf(a) - this.defaultOrder.indexOf(b)
      ));
    }
    return sorted;
  }
  /**
   * Records that the user selected the given mimetype over the other
   * possible mimeTypes, prioritizing it for future reference.
   */
  prioritize(chosenMimetype, otherMimeTypes) {
    const chosenIndex = this.findIndex(chosenMimetype);
    if (chosenIndex === -1) {
      this.order.unshift({ pattern: chosenMimetype, matches: parse4(normalizeSlashes(chosenMimetype), { ignoreCase: true }) });
      return;
    }
    const uniqueIndices = new Set(otherMimeTypes.map((m) => this.findIndex(m, chosenIndex)));
    uniqueIndices.delete(-1);
    const otherIndices = Array.from(uniqueIndices).sort((a, b) => a - b);
    this.order.splice(chosenIndex + 1, 0, ...otherIndices.map((i2) => this.order[i2]));
    for (let oi = otherIndices.length - 1; oi >= 0; oi--) {
      this.order.splice(otherIndices[oi], 1);
    }
  }
  /**
   * Gets an array of in-order mimetype preferences.
   */
  toArray() {
    return this.order.map((o) => o.pattern);
  }
  findIndex(mimeType, maxIndex = this.order.length) {
    const normalized = normalizeSlashes(mimeType);
    for (let i2 = 0; i2 < maxIndex; i2++) {
      if (this.order[i2].matches(normalized)) {
        return i2;
      }
    }
    return -1;
  }
};

function diff(before, after2, contains2, equal = (a, b) => a === b) {
  const result = [];
  function pushSplice(start, deleteCount, toInsert) {
    if (deleteCount === 0 && toInsert.length === 0) {
      return;
    }
    const latest = result[result.length - 1];
    if (latest && latest.start + latest.deleteCount === start) {
      latest.deleteCount += deleteCount;
      latest.toInsert.push(...toInsert);
    } else {
      result.push({ start, deleteCount, toInsert });
    }
  }
  let beforeIdx = 0;
  let afterIdx = 0;
  while (true) {
    if (beforeIdx === before.length) {
      pushSplice(beforeIdx, 0, after2.slice(afterIdx));
      break;
    }
    if (afterIdx === after2.length) {
      pushSplice(beforeIdx, before.length - beforeIdx, []);
      break;
    }
    const beforeElement = before[beforeIdx];
    const afterElement = after2[afterIdx];
    if (equal(beforeElement, afterElement)) {
      beforeIdx += 1;
      afterIdx += 1;
      continue;
    }
    if (contains2(afterElement)) {
      pushSplice(beforeIdx, 1, []);
      beforeIdx += 1;
    } else {
      pushSplice(beforeIdx, 0, [afterElement]);
      afterIdx += 1;
    }
  }
  return result;
}

var NOTEBOOK_EDITOR_CURSOR_BOUNDARY = new RawContextKey("notebookEditorCursorAtBoundary", "none");

var NOTEBOOK_EDITOR_CURSOR_LINE_BOUNDARY = new RawContextKey("notebookEditorCursorAtLineBoundary", "none");

function isDocumentExcludePattern(filenamePattern) {
  const arg = filenamePattern;
  if ((typeof arg.include === "string" || isRelativePattern(arg.include)) && (typeof arg.exclude === "string" || isRelativePattern(arg.exclude))) {
    return true;
  }
  return false;
}

var NotebookSetting = {
  displayOrder: "notebook.displayOrder",
  cellToolbarLocation: "notebook.cellToolbarLocation",
  cellToolbarVisibility: "notebook.cellToolbarVisibility",
  showCellStatusBar: "notebook.showCellStatusBar",
  cellExecutionTimeVerbosity: "notebook.cellExecutionTimeVerbosity",
  textDiffEditorPreview: "notebook.diff.enablePreview",
  diffOverviewRuler: "notebook.diff.overviewRuler",
  experimentalInsertToolbarAlignment: "notebook.experimental.insertToolbarAlignment",
  compactView: "notebook.compactView",
  focusIndicator: "notebook.cellFocusIndicator",
  insertToolbarLocation: "notebook.insertToolbarLocation",
  globalToolbar: "notebook.globalToolbar",
  stickyScrollEnabled: "notebook.stickyScroll.enabled",
  stickyScrollMode: "notebook.stickyScroll.mode",
  undoRedoPerCell: "notebook.undoRedoPerCell",
  consolidatedOutputButton: "notebook.consolidatedOutputButton",
  showFoldingControls: "notebook.showFoldingControls",
  dragAndDropEnabled: "notebook.dragAndDropEnabled",
  cellEditorOptionsCustomizations: "notebook.editorOptionsCustomizations",
  consolidatedRunButton: "notebook.consolidatedRunButton",
  openGettingStarted: "notebook.experimental.openGettingStarted",
  globalToolbarShowLabel: "notebook.globalToolbarShowLabel",
  markupFontSize: "notebook.markup.fontSize",
  markdownLineHeight: "notebook.markdown.lineHeight",
  interactiveWindowCollapseCodeCells: "interactiveWindow.collapseCellInputCode",
  outputScrolling: "notebook.output.scrolling",
  textOutputLineLimit: "notebook.output.textLineLimit",
  LinkifyOutputFilePaths: "notebook.output.linkifyFilePaths",
  minimalErrorRendering: "notebook.output.minimalErrorRendering",
  formatOnSave: "notebook.formatOnSave.enabled",
  insertFinalNewline: "notebook.insertFinalNewline",
  defaultFormatter: "notebook.defaultFormatter",
  formatOnCellExecution: "notebook.formatOnCellExecution",
  codeActionsOnSave: "notebook.codeActionsOnSave",
  outputWordWrap: "notebook.output.wordWrap",
  outputLineHeight: "notebook.output.lineHeight",
  outputFontSize: "notebook.output.fontSize",
  outputFontFamily: "notebook.output.fontFamily",
  findFilters: "notebook.find.filters",
  confirmDeleteRunningCell: "notebook.confirmDeleteRunningCell",
  remoteSaving: "notebook.experimental.remoteSave",
  gotoSymbolsAllSymbols: "notebook.gotoSymbols.showAllSymbols",
  outlineShowMarkdownHeadersOnly: "notebook.outline.showMarkdownHeadersOnly",
  outlineShowCodeCells: "notebook.outline.showCodeCells",
  outlineShowCodeCellSymbols: "notebook.outline.showCodeCellSymbols",
  breadcrumbsShowCodeCells: "notebook.breadcrumbs.showCodeCells",
  scrollToRevealCell: "notebook.scrolling.revealNextCellOnExecute",
  cellChat: "notebook.experimental.cellChat",
  cellGenerate: "notebook.experimental.generate",
  notebookVariablesView: "notebook.variablesView",
  notebookInlineValues: "notebook.inlineValues",
  InteractiveWindowPromptToSave: "interactiveWindow.promptToSaveOnClose",
  cellFailureDiagnostics: "notebook.cellFailureDiagnostics",
  outputBackupSizeLimit: "notebook.backup.sizeLimit",
  multiCursor: "notebook.multiCursor.enabled",
  markupFontFamily: "notebook.markup.fontFamily"
};

var NotebookWorkingCopyTypeIdentifier = class _NotebookWorkingCopyTypeIdentifier {
  static {
    this._prefix = "notebook/";
  }
  static create(notebookType, viewType) {
    return `${_NotebookWorkingCopyTypeIdentifier._prefix}${notebookType}/${viewType ?? notebookType}`;
  }
  static parse(candidate) {
    if (candidate.startsWith(_NotebookWorkingCopyTypeIdentifier._prefix)) {
      const split = candidate.substring(_NotebookWorkingCopyTypeIdentifier._prefix.length).split("/");
      if (split.length === 2) {
        return { notebookType: split[0], viewType: split[1] };
      }
    }
    return void 0;
  }
};

var textDecoder2 = new TextDecoder();

function compressOutputItemStreams(outputs) {
  const buffers = [];
  let startAppending = false;
  for (const output of outputs) {
    if (buffers.length === 0 || startAppending) {
      buffers.push(output);
      startAppending = true;
    }
  }
  let didCompression = compressStreamBuffer(buffers);
  const concatenated = VSBuffer.concat(buffers.map((buffer) => VSBuffer.wrap(buffer)));
  const data = formatStreamText(concatenated);
  didCompression = didCompression || data.byteLength !== concatenated.byteLength;
  return { data, didCompression };
}

var MOVE_CURSOR_1_LINE_COMMAND = `${String.fromCharCode(27)}[A`;

var MOVE_CURSOR_1_LINE_COMMAND_BYTES = MOVE_CURSOR_1_LINE_COMMAND.split("").map((c) => c.charCodeAt(0));

var LINE_FEED = 10;

function compressStreamBuffer(streams) {
  let didCompress = false;
  streams.forEach((stream, index2) => {
    if (index2 === 0 || stream.length < MOVE_CURSOR_1_LINE_COMMAND.length) {
      return;
    }
    const previousStream = streams[index2 - 1];
    const command4 = stream.subarray(0, MOVE_CURSOR_1_LINE_COMMAND.length);
    if (command4[0] === MOVE_CURSOR_1_LINE_COMMAND_BYTES[0] && command4[1] === MOVE_CURSOR_1_LINE_COMMAND_BYTES[1] && command4[2] === MOVE_CURSOR_1_LINE_COMMAND_BYTES[2]) {
      const lastIndexOfLineFeed = previousStream.lastIndexOf(LINE_FEED);
      if (lastIndexOfLineFeed === -1) {
        return;
      }
      didCompress = true;
      streams[index2 - 1] = previousStream.subarray(0, lastIndexOfLineFeed);
      streams[index2] = stream.subarray(MOVE_CURSOR_1_LINE_COMMAND.length);
    }
  });
  return didCompress;
}

function fixBackspace(txt) {
  let tmp = txt;
  do {
    txt = tmp;
    tmp = txt.replace(/[^\n]\x08/gm, "");
  } while (tmp.length < txt.length);
  return txt;
}

function fixCarriageReturn(txt) {
  txt = txt.replace(/\r+\n/gm, "\n");
  while (txt.search(/\r[^$]/g) > -1) {
    const base = txt.match(/^(.*)\r+/m)[1];
    let insert2 = txt.match(/\r+(.*)$/m)[1];
    insert2 = insert2 + base.slice(insert2.length, base.length);
    txt = txt.replace(/\r+.*$/m, "\r").replace(/^.*\r/m, insert2);
  }
  return txt;
}

var BACKSPACE_CHARACTER = "\b".charCodeAt(0);

var CARRIAGE_RETURN_CHARACTER = "\r".charCodeAt(0);

function formatStreamText(buffer) {
  if (!buffer.buffer.includes(BACKSPACE_CHARACTER) && !buffer.buffer.includes(CARRIAGE_RETURN_CHARACTER)) {
    return buffer;
  }
  return VSBuffer.fromString(fixCarriageReturn(fixBackspace(textDecoder2.decode(buffer.buffer))));
}
export { diff, isDocumentExcludePattern, compressOutputItemStreams, compressStreamBuffer, fixBackspace, fixCarriageReturn, formatStreamText, NOTEBOOK_EDITOR_ID, NOTEBOOK_DIFF_EDITOR_ID, NOTEBOOK_MULTI_DIFF_EDITOR_ID, INTERACTIVE_WINDOW_EDITOR_ID, REPL_EDITOR_ID, NOTEBOOK_OUTPUT_EDITOR_ID, NOTEBOOK_DISPLAY_ORDER, ACCESSIBLE_NOTEBOOK_DISPLAY_ORDER, RENDERER_EQUIVALENT_EXTENSIONS, RENDERER_NOT_AVAILABLE, NotebookMetadataUri, CellUri, normalizeSlashes, MimeTypeDisplayOrder, NOTEBOOK_EDITOR_CURSOR_BOUNDARY, NOTEBOOK_EDITOR_CURSOR_LINE_BOUNDARY, NotebookSetting, NotebookWorkingCopyTypeIdentifier, textDecoder2, MOVE_CURSOR_1_LINE_COMMAND, MOVE_CURSOR_1_LINE_COMMAND_BYTES, LINE_FEED, BACKSPACE_CHARACTER, CARRIAGE_RETURN_CHARACTER };
