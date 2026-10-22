// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/notebook/browser/view/cellParts/cellDragRenderer.ts
import { createTrustedTypesPolicy } from "./module-0280.mjs";
import { $, reset } from "./module-0075.mjs";
import { tokenizeLineToHTML } from "./module-0430.mjs";
import { isWindows } from "./module-0014.mjs";
import { TokenizationRegistry2 } from "./module-0164.mjs";
import { Color } from "./module-0197.mjs";
import { Range2 } from "./module-0106.mjs";


// src/vs/workbench/contrib/notebook/browser/view/cellParts/cellDragRenderer.ts
var EditorTextRenderer = class _EditorTextRenderer {
  static {
    this._ttPolicy = createTrustedTypesPolicy("cellRendererEditorText", {
      createHTML(input) {
        return input;
      }
    });
  }
  getRichText(editor, modelRange) {
    const model = editor.getModel();
    if (!model) {
      return null;
    }
    const colorMap = this.getDefaultColorMap();
    const fontInfo = editor.getOptions().get(59 /* fontInfo */);
    const fontFamilyVar = "--notebook-editor-font-family";
    const fontSizeVar = "--notebook-editor-font-size";
    const fontWeightVar = "--notebook-editor-font-weight";
    const style = `color: ${colorMap[1 /* DefaultForeground */]};background-color: ${colorMap[2 /* DefaultBackground */]};font-family: var(${fontFamilyVar});font-weight: var(${fontWeightVar});font-size: var(${fontSizeVar});line-height: ${fontInfo.lineHeight}px;white-space: pre;`;
    const element = $("div", { style });
    const fontSize = fontInfo.fontSize;
    const fontWeight = fontInfo.fontWeight;
    element.style.setProperty(fontFamilyVar, fontInfo.fontFamily);
    element.style.setProperty(fontSizeVar, `${fontSize}px`);
    element.style.setProperty(fontWeightVar, fontWeight);
    const linesHtml = this.getRichTextLinesAsHtml(model, modelRange, colorMap);
    element.innerHTML = linesHtml;
    return element;
  }
  getRichTextLinesAsHtml(model, modelRange, colorMap) {
    const startLineNumber = modelRange.startLineNumber;
    const startColumn = modelRange.startColumn;
    const endLineNumber = modelRange.endLineNumber;
    const endColumn = modelRange.endColumn;
    const tabSize = model.getOptions().tabSize;
    let result = "";
    for (let lineNumber = startLineNumber; lineNumber <= endLineNumber; lineNumber++) {
      const lineTokens = model.tokenization.getLineTokens(lineNumber);
      const lineContent = lineTokens.getLineContent();
      const startOffset = lineNumber === startLineNumber ? startColumn - 1 : 0;
      const endOffset = lineNumber === endLineNumber ? endColumn - 1 : lineContent.length;
      if (lineContent === "") {
        result += "<br>";
      } else {
        result += tokenizeLineToHTML(lineContent, lineTokens.inflate(), colorMap, startOffset, endOffset, tabSize, isWindows);
      }
    }
    return _EditorTextRenderer._ttPolicy?.createHTML(result) ?? result;
  }
  getDefaultColorMap() {
    const colorMap = TokenizationRegistry2.getColorMap();
    const result = ["#000000"];
    if (colorMap) {
      for (let i2 = 1, len = colorMap.length; i2 < len; i2++) {
        result[i2] = Color.Format.CSS.formatHex(colorMap[i2]);
      }
    }
    return result;
  }
};

var CodeCellDragImageRenderer = class {
  getDragImage(templateData, editor, type) {
    let dragImage = this.getDragImageImpl(templateData, editor, type);
    if (!dragImage) {
      dragImage = document.createElement("div");
      dragImage.textContent = "1 cell";
    }
    return dragImage;
  }
  getDragImageImpl(templateData, editor, type) {
    const dragImageContainer = templateData.container.cloneNode(true);
    dragImageContainer.classList.forEach((c) => dragImageContainer.classList.remove(c));
    dragImageContainer.classList.add("cell-drag-image", "monaco-list-row", "focused", `${type}-cell-row`);
    const editorContainer = dragImageContainer.querySelector(".cell-editor-container");
    if (!editorContainer) {
      return null;
    }
    const richEditorText = new EditorTextRenderer().getRichText(editor, new Range2(1, 1, 1, 1e3));
    if (!richEditorText) {
      return null;
    }
    reset(editorContainer, richEditorText);
    return dragImageContainer;
  }
};
export { EditorTextRenderer, CodeCellDragImageRenderer };
