// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/contrib/notebook/common/services/notebookWebWorkerMain.js
// Original module marker: src/vs/workbench/contrib/notebook/common/notebookCommon.ts
import { Mimes } from "./module-0048.mjs";
import { Schemas } from "./module-0044.mjs";
import { extractCellOutputDetails, generate, generateMetadataUri, parse2, parseMetadataUri } from "./module-0054.mjs";
import { RawContextKey } from "./module-0051.mjs";


// src/vs/workbench/contrib/notebook/common/notebookCommon.ts
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

var NotebookMetadataUri;

((NotebookMetadataUri2) => {
  NotebookMetadataUri2.scheme = Schemas.vscodeNotebookMetadata;
  function generate2(notebook) {
    return generateMetadataUri(notebook);
  }
  NotebookMetadataUri2.generate = generate2;
  function parse4(metadata) {
    return parseMetadataUri(metadata);
  }
  NotebookMetadataUri2.parse = parse4;
})(NotebookMetadataUri || (NotebookMetadataUri = {}));

var CellUri;

((CellUri2) => {
  CellUri2.scheme = Schemas.vscodeNotebookCell;
  function generate2(notebook, handle) {
    return generate(notebook, handle);
  }
  CellUri2.generate = generate2;
  function parse4(cell) {
    return parse2(cell);
  }
  CellUri2.parse = parse4;
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
  function parseCellOutputUri(uri) {
    return extractCellOutputDetails(uri);
  }
  CellUri2.parseCellOutputUri = parseCellOutputUri;
  function generateCellPropertyUri(notebook, handle, scheme2) {
    return CellUri2.generate(notebook, handle).with({ scheme: scheme2 });
  }
  CellUri2.generateCellPropertyUri = generateCellPropertyUri;
  function parseCellPropertyUri(uri, propertyScheme) {
    if (uri.scheme !== propertyScheme) {
      return void 0;
    }
    return CellUri2.parse(uri.with({ scheme: CellUri2.scheme }));
  }
  CellUri2.parseCellPropertyUri = parseCellPropertyUri;
})(CellUri || (CellUri = {}));

var NOTEBOOK_EDITOR_CURSOR_BOUNDARY = new RawContextKey("notebookEditorCursorAtBoundary", "none");

var NOTEBOOK_EDITOR_CURSOR_LINE_BOUNDARY = new RawContextKey("notebookEditorCursorAtLineBoundary", "none");

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

var MOVE_CURSOR_1_LINE_COMMAND = `${String.fromCharCode(27)}[A`;

var MOVE_CURSOR_1_LINE_COMMAND_BYTES = MOVE_CURSOR_1_LINE_COMMAND.split("").map((c) => c.charCodeAt(0));

var BACKSPACE_CHARACTER = "\b".charCodeAt(0);

var CARRIAGE_RETURN_CHARACTER = "\r".charCodeAt(0);
export { NOTEBOOK_DISPLAY_ORDER, ACCESSIBLE_NOTEBOOK_DISPLAY_ORDER, NotebookMetadataUri, CellUri, NOTEBOOK_EDITOR_CURSOR_BOUNDARY, NOTEBOOK_EDITOR_CURSOR_LINE_BOUNDARY, NotebookWorkingCopyTypeIdentifier, textDecoder2, MOVE_CURSOR_1_LINE_COMMAND, MOVE_CURSOR_1_LINE_COMMAND_BYTES, BACKSPACE_CHARACTER, CARRIAGE_RETURN_CHARACTER };
