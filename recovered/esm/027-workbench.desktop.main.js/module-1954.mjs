// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/notebook/browser/viewModel/notebookOutlineEntryFactory.ts
import { getMarkdownHeadersInCell } from "./module-1936.mjs";
import { createDecorator } from "./module-0077.mjs";
import { OutlineEntry } from "./module-1953.mjs";
import { renderAsPlaintext } from "./module-0468.mjs";
import { localize } from "./module-0001.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { INotebookExecutionStateService } from "./module-1387.mjs";
import { IOutlineModelService } from "./module-0691.mjs";
import { ITextModelService } from "./module-0081.mjs";


// src/vs/workbench/contrib/notebook/browser/viewModel/notebookOutlineEntryFactory.ts
function getMarkdownHeadersInCellFallbackToHtmlTags(fullContent) {
  const headers = Array.from(getMarkdownHeadersInCell(fullContent));
  if (headers.length) {
    return headers;
  }
  const match2 = fullContent.match(/<h([1-6]).*>(.*)<\/h\1>/i);
  if (match2) {
    const level = parseInt(match2[1]);
    const text2 = match2[2].trim();
    headers.push({ depth: level, text: text2 });
  }
  return headers;
}

var INotebookOutlineEntryFactory = createDecorator("INotebookOutlineEntryFactory");

var NotebookOutlineEntryFactory = class {
  constructor(executionStateService, outlineModelService, textModelService) {
    this.executionStateService = executionStateService;
    this.outlineModelService = outlineModelService;
    this.textModelService = textModelService;
    this.cellOutlineEntryCache = {};
    this.cachedMarkdownOutlineEntries = /* @__PURE__ */ new WeakMap();
  }
  getOutlineEntries(cell, index2) {
    const entries2 = [];
    const isMarkdown = cell.cellKind === 1 /* Markup */;
    let content2 = getCellFirstNonEmptyLine(cell);
    let hasHeader = false;
    if (isMarkdown) {
      const fullContent = cell.getText().substring(0, 1e4);
      const cache2 = this.cachedMarkdownOutlineEntries.get(cell);
      const headers = cache2?.alternativeId === cell.getAlternativeId() ? cache2.headers : Array.from(getMarkdownHeadersInCellFallbackToHtmlTags(fullContent));
      this.cachedMarkdownOutlineEntries.set(cell, { alternativeId: cell.getAlternativeId(), headers });
      for (const { depth, text: text2 } of headers) {
        hasHeader = true;
        entries2.push(new OutlineEntry(index2++, depth, cell, text2, false, false));
      }
      if (!hasHeader) {
        content2 = renderAsPlaintext({ value: content2 });
      }
    }
    if (!hasHeader) {
      const exeState = !isMarkdown && this.executionStateService.getCellExecution(cell.uri);
      let preview = content2.trim();
      if (!isMarkdown) {
        const cached = this.cellOutlineEntryCache[cell.id];
        if (cached) {
          entries2.push(new OutlineEntry(index2++, 7 /* NonHeaderOutlineLevel */, cell, preview, !!exeState, exeState ? exeState.isPaused : false));
          cached.forEach((entry) => {
            entries2.push(new OutlineEntry(index2++, entry.level, cell, entry.name, false, false, entry.range, entry.kind));
          });
        }
      }
      if (entries2.length === 0) {
        if (preview.length === 0) {
          preview = localize(17899, null);
        }
        entries2.push(new OutlineEntry(index2++, 7 /* NonHeaderOutlineLevel */, cell, preview, !!exeState, exeState ? exeState.isPaused : false));
      }
    }
    return entries2;
  }
  async cacheSymbols(cell, cancelToken) {
    if (cell.cellKind === 1 /* Markup */) {
      return;
    }
    const ref = await this.textModelService.createModelReference(cell.uri);
    try {
      const textModel = ref.object.textEditorModel;
      const outlineModel = await this.outlineModelService.getOrCreate(textModel, cancelToken);
      const entries2 = createOutlineEntries(outlineModel.getTopLevelSymbols(), 8);
      this.cellOutlineEntryCache[cell.id] = entries2;
    } finally {
      ref.dispose();
    }
  }
};

NotebookOutlineEntryFactory = __decorateClass([
  __decorateParam(0, INotebookExecutionStateService),
  __decorateParam(1, IOutlineModelService),
  __decorateParam(2, ITextModelService)
], NotebookOutlineEntryFactory);

function createOutlineEntries(symbols, level) {
  const entries2 = [];
  symbols.forEach((symbol) => {
    entries2.push({ name: symbol.name, range: symbol.range, level, kind: symbol.kind });
    if (symbol.children) {
      entries2.push(...createOutlineEntries(symbol.children, level + 1));
    }
  });
  return entries2;
}

function getCellFirstNonEmptyLine(cell) {
  const textBuffer = cell.textBuffer;
  for (let i2 = 0; i2 < textBuffer.getLineCount(); i2++) {
    const firstNonWhitespace = textBuffer.getLineFirstNonWhitespaceColumn(i2 + 1);
    const lineLength = textBuffer.getLineLength(i2 + 1);
    if (firstNonWhitespace < lineLength) {
      return textBuffer.getLineContent(i2 + 1);
    }
  }
  return cell.getText().substring(0, 100);
}
export { getMarkdownHeadersInCellFallbackToHtmlTags, createOutlineEntries, getCellFirstNonEmptyLine, INotebookOutlineEntryFactory, NotebookOutlineEntryFactory };
