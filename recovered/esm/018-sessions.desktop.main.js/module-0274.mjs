// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/browser/dataTransfer.ts
import { UriList, VSDataTransfer, createFileDataTransferItem, createStringDataTransferItem } from "./module-0264.mjs";
import { CodeDataTransfers, getPathForFile } from "./module-0273.mjs";
import { URI } from "./module-0032.mjs";
import { DataTransfers } from "./module-0263.mjs";
import { Mimes } from "./module-0136.mjs";


// src/vs/editor/browser/dataTransfer.ts
function toVSDataTransfer(dataTransfer) {
  const vsDataTransfer = new VSDataTransfer();
  for (const item of dataTransfer.items) {
    const type = item.type;
    if (item.kind === "string") {
      const asStringValue = new Promise((resolve3) => item.getAsString(resolve3));
      vsDataTransfer.append(type, createStringDataTransferItem(asStringValue));
    } else if (item.kind === "file") {
      const file = item.getAsFile();
      if (file) {
        vsDataTransfer.append(type, createFileDataTransferItemFromFile(file));
      }
    }
  }
  return vsDataTransfer;
}

function createFileDataTransferItemFromFile(file) {
  const path = getPathForFile(file);
  const uri4 = path ? URI.parse(path) : void 0;
  return createFileDataTransferItem(file.name, uri4, async () => {
    return new Uint8Array(await file.arrayBuffer());
  });
}

var INTERNAL_DND_MIME_TYPES = Object.freeze([
  CodeDataTransfers.EDITORS,
  CodeDataTransfers.FILES,
  DataTransfers.RESOURCES,
  DataTransfers.INTERNAL_URI_LIST
]);

function toExternalVSDataTransfer(sourceDataTransfer, overwriteUriList = false) {
  const vsDataTransfer = toVSDataTransfer(sourceDataTransfer);
  const uriList = vsDataTransfer.get(DataTransfers.INTERNAL_URI_LIST);
  if (uriList) {
    vsDataTransfer.replace(Mimes.uriList, uriList);
  } else {
    if (overwriteUriList || !vsDataTransfer.has(Mimes.uriList)) {
      const editorData = [];
      for (const item of sourceDataTransfer.items) {
        const file = item.getAsFile();
        if (file) {
          const path = getPathForFile(file);
          try {
            if (path) {
              editorData.push(URI.file(path).toString());
            } else {
              editorData.push(URI.parse(file.name, true).toString());
            }
          } catch {
          }
        }
      }
      if (editorData.length) {
        vsDataTransfer.replace(Mimes.uriList, createStringDataTransferItem(UriList.create(editorData)));
      }
    }
  }
  for (const internal of INTERNAL_DND_MIME_TYPES) {
    vsDataTransfer.delete(internal);
  }
  return vsDataTransfer;
}
export { toVSDataTransfer, createFileDataTransferItemFromFile, toExternalVSDataTransfer, INTERNAL_DND_MIME_TYPES };
