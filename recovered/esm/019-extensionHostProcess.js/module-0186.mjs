// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/node/extensionHostProcess.js
// Original module marker: src/vs/workbench/services/notebook/common/notebookDocumentService.ts
import { createDecorator2 } from "./module-0048.mjs";
import { Schemas } from "./module-0026.mjs";
import { VSBuffer, decodeBase64, encodeBase64 } from "./module-0031.mjs";
import { ResourceMap } from "./module-0007.mjs";
import { registerSingleton } from "./module-0064.mjs";


// src/vs/workbench/services/notebook/common/notebookDocumentService.ts
var INotebookDocumentService = createDecorator2("notebookDocumentService");

var _lengths = ["W", "X", "Y", "Z", "a", "b", "c", "d", "e", "f"];

var _padRegexp = new RegExp(`^[${_lengths.join("")}]+`);

var _radix = 7;

function parse4(cell) {
  if (cell.scheme !== Schemas.vscodeNotebookCell) {
    return void 0;
  }
  const idx = cell.fragment.indexOf("s");
  if (idx < 0) {
    return void 0;
  }
  const handle = parseInt(cell.fragment.substring(0, idx).replace(_padRegexp, ""), _radix);
  const _scheme = decodeBase64(cell.fragment.substring(idx + 1)).toString();
  if (isNaN(handle)) {
    return void 0;
  }
  return {
    handle,
    notebook: cell.with({ scheme: _scheme, fragment: null })
  };
}

function generate(notebook, handle) {
  const s = handle.toString(_radix);
  const p = s.length < _lengths.length ? _lengths[s.length - 1] : "z";
  const fragment = `${p}${s}s${encodeBase64(VSBuffer.fromString(notebook.scheme), true, true)}`;
  return notebook.with({ scheme: Schemas.vscodeNotebookCell, fragment });
}

function parseMetadataUri(metadata) {
  if (metadata.scheme !== Schemas.vscodeNotebookMetadata) {
    return void 0;
  }
  const _scheme = decodeBase64(metadata.fragment).toString();
  return metadata.with({ scheme: _scheme, fragment: null });
}

function generateMetadataUri(notebook) {
  const fragment = `${encodeBase64(VSBuffer.fromString(notebook.scheme), true, true)}`;
  return notebook.with({ scheme: Schemas.vscodeNotebookMetadata, fragment });
}

function extractCellOutputDetails(uri2) {
  if (uri2.scheme !== Schemas.vscodeNotebookCellOutput) {
    return;
  }
  const params = new URLSearchParams(uri2.query);
  const openIn = params.get("openIn");
  if (!openIn) {
    return;
  }
  const outputId = params.get("outputId") ?? void 0;
  const parsedCell = parse4(uri2.with({ scheme: Schemas.vscodeNotebookCell, query: null }));
  const outputIndex = params.get("outputIndex") ? parseInt(params.get("outputIndex") || "", 10) : void 0;
  const notebookUri = parsedCell ? parsedCell.notebook : uri2.with({
    scheme: params.get("notebookScheme") || Schemas.file,
    fragment: null,
    query: null
  });
  const cellIndex = params.get("cellIndex") ? parseInt(params.get("cellIndex") || "", 10) : void 0;
  return {
    notebook: notebookUri,
    openIn,
    outputId,
    outputIndex,
    cellHandle: parsedCell?.handle,
    cellFragment: uri2.fragment,
    cellIndex
  };
}

var NotebookDocumentWorkbenchService = class {
  constructor() {
    this._documents = new ResourceMap();
  }
  getNotebook(uri2) {
    if (uri2.scheme === Schemas.vscodeNotebookCell) {
      const cellUri = parse4(uri2);
      if (cellUri) {
        const document2 = this._documents.get(cellUri.notebook);
        if (document2) {
          return document2;
        }
      }
    }
    if (uri2.scheme === Schemas.vscodeNotebookCellOutput) {
      const parsedData = extractCellOutputDetails(uri2);
      if (parsedData) {
        const document2 = this._documents.get(parsedData.notebook);
        if (document2) {
          return document2;
        }
      }
    }
    return this._documents.get(uri2);
  }
  addNotebookDocument(document2) {
    this._documents.set(document2.uri, document2);
  }
  removeNotebookDocument(document2) {
    this._documents.delete(document2.uri);
  }
};

registerSingleton(INotebookDocumentService, NotebookDocumentWorkbenchService, 1 /* Delayed */);
export { parse4, generate, parseMetadataUri, generateMetadataUri, extractCellOutputDetails, INotebookDocumentService, _lengths, _padRegexp, _radix, NotebookDocumentWorkbenchService };
