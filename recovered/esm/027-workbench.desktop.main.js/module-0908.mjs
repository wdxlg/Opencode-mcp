// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/services/notebook/common/notebookDocumentService.ts
import { createDecorator } from "./module-0077.mjs";
import { Schemas } from "./module-0033.mjs";
import { VSBuffer, decodeBase64, encodeBase64 } from "./module-0038.mjs";
import { ResourceMap } from "./module-0008.mjs";
import { registerSingleton } from "./module-0135.mjs";


// src/vs/workbench/services/notebook/common/notebookDocumentService.ts
var INotebookDocumentService = createDecorator("notebookDocumentService");

var _lengths = ["W", "X", "Y", "Z", "a", "b", "c", "d", "e", "f"];

var _padRegexp = new RegExp(`^[${_lengths.join("")}]+`);

var _radix = 7;

function parse6(cell) {
  if (cell.scheme !== Schemas.vscodeNotebookCell) {
    return void 0;
  }
  const idx = cell.fragment.indexOf("s");
  if (idx < 0) {
    return void 0;
  }
  const handle2 = parseInt(cell.fragment.substring(0, idx).replace(_padRegexp, ""), _radix);
  const _scheme = decodeBase64(cell.fragment.substring(idx + 1)).toString();
  if (isNaN(handle2)) {
    return void 0;
  }
  return {
    handle: handle2,
    notebook: cell.with({ scheme: _scheme, fragment: null })
  };
}

function generate(notebook, handle2) {
  const s = handle2.toString(_radix);
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

function extractCellOutputDetails(uri5) {
  if (uri5.scheme !== Schemas.vscodeNotebookCellOutput) {
    return;
  }
  const params = new URLSearchParams(uri5.query);
  const openIn = params.get("openIn");
  if (!openIn) {
    return;
  }
  const outputId = params.get("outputId") ?? void 0;
  const parsedCell = parse6(uri5.with({ scheme: Schemas.vscodeNotebookCell, query: null }));
  const outputIndex = params.get("outputIndex") ? parseInt(params.get("outputIndex") || "", 10) : void 0;
  const notebookUri = parsedCell ? parsedCell.notebook : uri5.with({
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
    cellFragment: uri5.fragment,
    cellIndex
  };
}

var NotebookDocumentWorkbenchService = class {
  constructor() {
    this._documents = new ResourceMap();
  }
  getNotebook(uri5) {
    if (uri5.scheme === Schemas.vscodeNotebookCell) {
      const cellUri = parse6(uri5);
      if (cellUri) {
        const document2 = this._documents.get(cellUri.notebook);
        if (document2) {
          return document2;
        }
      }
    }
    if (uri5.scheme === Schemas.vscodeNotebookCellOutput) {
      const parsedData = extractCellOutputDetails(uri5);
      if (parsedData) {
        const document2 = this._documents.get(parsedData.notebook);
        if (document2) {
          return document2;
        }
      }
    }
    return this._documents.get(uri5);
  }
  addNotebookDocument(document2) {
    this._documents.set(document2.uri, document2);
  }
  removeNotebookDocument(document2) {
    this._documents.delete(document2.uri);
  }
};

registerSingleton(INotebookDocumentService, NotebookDocumentWorkbenchService, 1 /* Delayed */);
export { parse6, generate, parseMetadataUri, generateMetadataUri, extractCellOutputDetails, INotebookDocumentService, _lengths, _padRegexp, _radix, NotebookDocumentWorkbenchService };
