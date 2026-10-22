// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/node/extensionHostProcess.js
// Original module marker: src/vs/workbench/contrib/notebook/common/notebookCommon.ts
import { Mimes } from "./module-0088.mjs";
import { Schemas } from "./module-0026.mjs";
import { extractCellOutputDetails, generate, generateMetadataUri, parse4, parseMetadataUri } from "./module-0186.mjs";
import { RawContextKey } from "./module-0049.mjs";
import { VSBuffer } from "./module-0031.mjs";


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
  function parse8(metadata) {
    return parseMetadataUri(metadata);
  }
  NotebookMetadataUri2.parse = parse8;
})(NotebookMetadataUri || (NotebookMetadataUri = {}));

var CellUri;

((CellUri2) => {
  CellUri2.scheme = Schemas.vscodeNotebookCell;
  function generate2(notebook, handle) {
    return generate(notebook, handle);
  }
  CellUri2.generate = generate2;
  function parse8(cell) {
    return parse4(cell);
  }
  CellUri2.parse = parse8;
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
  function parseCellOutputUri(uri2) {
    return extractCellOutputDetails(uri2);
  }
  CellUri2.parseCellOutputUri = parseCellOutputUri;
  function generateCellPropertyUri(notebook, handle, scheme2) {
    return CellUri2.generate(notebook, handle).with({ scheme: scheme2 });
  }
  CellUri2.generateCellPropertyUri = generateCellPropertyUri;
  function parseCellPropertyUri(uri2, propertyScheme) {
    if (uri2.scheme !== propertyScheme) {
      return void 0;
    }
    return CellUri2.parse(uri2.with({ scheme: CellUri2.scheme }));
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
  streams.forEach((stream, index) => {
    if (index === 0 || stream.length < MOVE_CURSOR_1_LINE_COMMAND.length) {
      return;
    }
    const previousStream = streams[index - 1];
    const command = stream.subarray(0, MOVE_CURSOR_1_LINE_COMMAND.length);
    if (command[0] === MOVE_CURSOR_1_LINE_COMMAND_BYTES[0] && command[1] === MOVE_CURSOR_1_LINE_COMMAND_BYTES[1] && command[2] === MOVE_CURSOR_1_LINE_COMMAND_BYTES[2]) {
      const lastIndexOfLineFeed = previousStream.lastIndexOf(LINE_FEED);
      if (lastIndexOfLineFeed === -1) {
        return;
      }
      didCompress = true;
      streams[index - 1] = previousStream.subarray(0, lastIndexOfLineFeed);
      streams[index] = stream.subarray(MOVE_CURSOR_1_LINE_COMMAND.length);
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
export { compressOutputItemStreams, compressStreamBuffer, fixBackspace, fixCarriageReturn, formatStreamText, NOTEBOOK_DISPLAY_ORDER, ACCESSIBLE_NOTEBOOK_DISPLAY_ORDER, NotebookMetadataUri, CellUri, NOTEBOOK_EDITOR_CURSOR_BOUNDARY, NOTEBOOK_EDITOR_CURSOR_LINE_BOUNDARY, NotebookWorkingCopyTypeIdentifier, textDecoder2, MOVE_CURSOR_1_LINE_COMMAND, MOVE_CURSOR_1_LINE_COMMAND_BYTES, LINE_FEED, BACKSPACE_CHARACTER, CARRIAGE_RETURN_CHARACTER };
