// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/notebook/browser/viewParts/notebookOverviewRuler.ts
import { IThemeService, Themable } from "./module-0287.mjs";
import { createFastDomNode } from "./module-0212.mjs";
import { PixelRatio } from "./module-0215.mjs";
import { getWindow } from "./module-0075.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";


// src/vs/workbench/contrib/notebook/browser/viewParts/notebookOverviewRuler.ts
var NotebookOverviewRuler = class extends Themable {
  constructor(notebookEditor, container2, themeService) {
    super(themeService);
    this.notebookEditor = notebookEditor;
    this._lanes = 3;
    this._domNode = createFastDomNode(document.createElement("canvas"));
    this._domNode.setPosition("relative");
    this._domNode.setLayerHinting(true);
    this._domNode.setContain("strict");
    container2.appendChild(this._domNode.domNode);
    this._register(notebookEditor.onDidChangeDecorations(() => {
      this.layout();
    }));
    this._register(PixelRatio.getInstance(getWindow(this._domNode.domNode)).onDidChange(() => {
      this.layout();
    }));
  }
  layout() {
    const width2 = 10;
    const layoutInfo = this.notebookEditor.getLayoutInfo();
    const scrollHeight = layoutInfo.scrollHeight;
    const height = layoutInfo.height;
    const ratio = PixelRatio.getInstance(getWindow(this._domNode.domNode)).value;
    this._domNode.setWidth(width2);
    this._domNode.setHeight(height);
    this._domNode.domNode.width = width2 * ratio;
    this._domNode.domNode.height = height * ratio;
    const ctx = this._domNode.domNode.getContext("2d");
    ctx.clearRect(0, 0, width2 * ratio, height * ratio);
    this._render(ctx, width2 * ratio, height * ratio, scrollHeight * ratio, ratio);
  }
  _render(ctx, width2, height, scrollHeight, ratio) {
    const viewModel = this.notebookEditor.getViewModel();
    const fontInfo = this.notebookEditor.getLayoutInfo().fontInfo;
    const laneWidth = width2 / this._lanes;
    let currentFrom = 0;
    if (viewModel) {
      for (let i2 = 0; i2 < viewModel.viewCells.length; i2++) {
        const viewCell = viewModel.viewCells[i2];
        const textBuffer = viewCell.textBuffer;
        const decorations = viewCell.getCellDecorations();
        const cellHeight = viewCell.layoutInfo.totalHeight / scrollHeight * ratio * height;
        decorations.filter((decoration3) => decoration3.overviewRuler).forEach((decoration3) => {
          const overviewRuler = decoration3.overviewRuler;
          const fillStyle = this.getColor(overviewRuler.color) ?? "#000000";
          const lineHeight = Math.min(fontInfo.lineHeight, viewCell.layoutInfo.editorHeight / scrollHeight / textBuffer.getLineCount() * ratio * height);
          const lineNumbers = overviewRuler.modelRanges.map((range2) => range2.startLineNumber).reduce((previous, current) => {
            if (previous.length === 0) {
              previous.push(current);
            } else {
              const last = previous[previous.length - 1];
              if (last !== current) {
                previous.push(current);
              }
            }
            return previous;
          }, []);
          let x = 0;
          switch (overviewRuler.position) {
            case 1 /* Left */:
              x = 0;
              break;
            case 2 /* Center */:
              x = laneWidth;
              break;
            case 4 /* Right */:
              x = laneWidth * 2;
              break;
            default:
              break;
          }
          const width3 = overviewRuler.position === 7 /* Full */ ? laneWidth * 3 : laneWidth;
          for (let i3 = 0; i3 < lineNumbers.length; i3++) {
            ctx.fillStyle = fillStyle;
            const lineNumber = lineNumbers[i3];
            const offset = (lineNumber - 1) * lineHeight;
            ctx.fillRect(x, currentFrom + offset, width3, lineHeight);
          }
          if (overviewRuler.includeOutput) {
            ctx.fillStyle = fillStyle;
            const outputOffset = viewCell.layoutInfo.editorHeight / scrollHeight * ratio * height;
            const decorationHeight = fontInfo.lineHeight / scrollHeight * ratio * height;
            ctx.fillRect(laneWidth, currentFrom + outputOffset, laneWidth, decorationHeight);
          }
        });
        currentFrom += cellHeight;
      }
      const overviewRulerDecorations = viewModel.getOverviewRulerDecorations();
      for (let i2 = 0; i2 < overviewRulerDecorations.length; i2++) {
        const decoration3 = overviewRulerDecorations[i2];
        if (!decoration3.options.overviewRuler) {
          continue;
        }
        const viewZoneInfo = this.notebookEditor.getViewZoneLayoutInfo(decoration3.viewZoneId);
        if (!viewZoneInfo) {
          continue;
        }
        const fillStyle = this.getColor(decoration3.options.overviewRuler.color) ?? "#000000";
        let x = 0;
        switch (decoration3.options.overviewRuler.position) {
          case 1 /* Left */:
            x = 0;
            break;
          case 2 /* Center */:
            x = laneWidth;
            break;
          case 4 /* Right */:
            x = laneWidth * 2;
            break;
          default:
            break;
        }
        const width3 = decoration3.options.overviewRuler.position === 7 /* Full */ ? laneWidth * 3 : laneWidth;
        ctx.fillStyle = fillStyle;
        const viewZoneHeight = viewZoneInfo.height / scrollHeight * ratio * height;
        const viewZoneTop = viewZoneInfo.top / scrollHeight * ratio * height;
        ctx.fillRect(x, viewZoneTop, width3, viewZoneHeight);
      }
    }
  }
};

NotebookOverviewRuler = __decorateClass([
  __decorateParam(2, IThemeService)
], NotebookOverviewRuler);
export { NotebookOverviewRuler };
