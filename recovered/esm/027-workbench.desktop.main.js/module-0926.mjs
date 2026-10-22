// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/notebook/common/notebookService.ts
import { createDecorator } from "./module-0077.mjs";


// src/vs/workbench/contrib/notebook/common/notebookService.ts
var INotebookService = createDecorator("notebookService");

var SimpleNotebookProviderInfo = class {
  constructor(viewType, serializer, extensionData) {
    this.viewType = viewType;
    this.serializer = serializer;
    this.extensionData = extensionData;
  }
};
export { INotebookService, SimpleNotebookProviderInfo };
