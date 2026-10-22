// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/notebook/browser/view/cellParts/cellDecorations.ts
import { CellContentPart } from "./module-1896.mjs";
import { $ } from "./module-0075.mjs";


// src/vs/workbench/contrib/notebook/browser/view/cellParts/cellDecorations.ts
var CellDecorations = class extends CellContentPart {
  constructor(notebookEditor, rootContainer, decorationContainer) {
    super();
    this.notebookEditor = notebookEditor;
    this.rootContainer = rootContainer;
    this.decorationContainer = decorationContainer;
  }
  didRenderCell(element) {
    const removedClassNames = [];
    this.rootContainer.classList.forEach((className2) => {
      if (/^nb\-.*$/.test(className2)) {
        removedClassNames.push(className2);
      }
    });
    removedClassNames.forEach((className2) => {
      this.rootContainer.classList.remove(className2);
    });
    this.decorationContainer.innerText = "";
    const generateCellTopDecorations = () => {
      this.decorationContainer.innerText = "";
      element.getCellDecorations().filter((options3) => options3.topClassName !== void 0).forEach((options3) => {
        this.decorationContainer.append($(`.${options3.topClassName}`));
      });
    };
    this.cellDisposables.add(element.onCellDecorationsChanged((e) => {
      const modified = e.added.find((e2) => e2.topClassName) || e.removed.find((e2) => e2.topClassName);
      if (modified) {
        generateCellTopDecorations();
      }
    }));
    generateCellTopDecorations();
    this.registerDecorations();
  }
  registerDecorations() {
    if (!this.currentCell) {
      return;
    }
    this.cellDisposables.add(this.currentCell.onCellDecorationsChanged((e) => {
      e.added.forEach((options3) => {
        if (options3.className && this.currentCell) {
          this.rootContainer.classList.add(options3.className);
        }
      });
      e.removed.forEach((options3) => {
        if (options3.className && this.currentCell) {
          this.rootContainer.classList.remove(options3.className);
        }
      });
    }));
    this.currentCell.getCellDecorations().forEach((options3) => {
      if (options3.className && this.currentCell) {
        this.rootContainer.classList.add(options3.className);
        this.notebookEditor.deltaCellContainerClassNames(this.currentCell.id, [options3.className], [], this.currentCell.cellKind);
      }
      if (options3.outputClassName && this.currentCell) {
        this.notebookEditor.deltaCellContainerClassNames(this.currentCell.id, [options3.outputClassName], [], this.currentCell.cellKind);
      }
    });
  }
};
export { CellDecorations };
