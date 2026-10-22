// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/chatEditing/notebook/chatEditingNewNotebookContentEdits.ts
import { VSBuffer } from "./module-0038.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { INotebookService } from "./module-0927.mjs";


// src/vs/workbench/contrib/chat/browser/chatEditing/notebook/chatEditingNewNotebookContentEdits.ts
var ChatEditingNewNotebookContentEdits = class {
  constructor(notebook, _notebookService) {
    this.notebook = notebook;
    this._notebookService = _notebookService;
    this.textEdits = [];
  }
  acceptTextEdits(edits) {
    if (edits.length) {
      this.textEdits.push(...edits);
    }
  }
  async generateEdits() {
    if (this.notebook.cells.length) {
      console.error(`Notebook edits not generated as notebook already has cells`);
      return [];
    }
    const content = this.generateContent();
    if (!content) {
      return [];
    }
    const notebookEdits = [];
    try {
      const { serializer } = await this._notebookService.withNotebookDataProvider(this.notebook.viewType);
      const data = await serializer.dataToNotebook(VSBuffer.fromString(content));
      for (let i2 = 0; i2 < data.cells.length; i2++) {
        notebookEdits.push({
          editType: 1 /* Replace */,
          index: i2,
          count: 0,
          cells: [data.cells[i2]]
        });
      }
    } catch (ex) {
      console.error(`Failed to generate notebook edits from text edits ${content}`, ex);
      return [];
    }
    return notebookEdits;
  }
  generateContent() {
    try {
      return applyTextEdits(this.textEdits);
    } catch (ex) {
      console.error("Failed to generate content from text edits", ex);
      return "";
    }
  }
};

ChatEditingNewNotebookContentEdits = __decorateClass([
  __decorateParam(1, INotebookService)
], ChatEditingNewNotebookContentEdits);

function applyTextEdits(edits) {
  let output = "";
  for (const edit3 of edits) {
    output = output.slice(0, edit3.range.startColumn) + edit3.text + output.slice(edit3.range.endColumn);
  }
  return output;
}
export { applyTextEdits, ChatEditingNewNotebookContentEdits };
