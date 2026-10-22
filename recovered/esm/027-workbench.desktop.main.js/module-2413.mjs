// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/notebook/browser/contrib/notebookVariables/notebookInlineVariables.ts
import { Disposable } from "./module-0012.mjs";
import { ResourceMap } from "./module-0008.mjs";
import { NotebookSetting } from "./module-0909.mjs";
import { Event2 } from "./module-0017.mjs";
import { CancellationTokenSource } from "./module-0025.mjs";
import { isEqual2 } from "./module-0034.mjs";
import { Range2 } from "./module-0106.mjs";
import { format2 } from "./module-0030.mjs";
import { onUnexpectedExternalError } from "./module-0004.mjs";
import { createInlineValueDecoration } from "./module-2412.mjs";
import { Position } from "./module-0079.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { INotebookKernelService } from "./module-1388.mjs";
import { INotebookExecutionStateService } from "./module-1387.mjs";
import { ILanguageFeaturesService } from "./module-0205.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IDebugService } from "./module-1057.mjs";
import { registerNotebookContribution } from "./module-1893.mjs";
import { registerAction2 } from "./module-0092.mjs";
import { NotebookAction } from "./module-1869.mjs";
import { localize } from "./module-0001.mjs";


// src/vs/workbench/contrib/notebook/browser/contrib/notebookVariables/notebookInlineVariables.ts
var InlineSegment2 = class {
  constructor(column, text2) {
    this.column = column;
    this.text = text2;
  }
};

var NotebookInlineVariablesController = class extends Disposable {
  // Skip extremely large cells
  constructor(notebookEditor, notebookKernelService, notebookExecutionStateService, languageFeaturesService, configurationService, debugService) {
    super();
    this.notebookEditor = notebookEditor;
    this.notebookKernelService = notebookKernelService;
    this.notebookExecutionStateService = notebookExecutionStateService;
    this.languageFeaturesService = languageFeaturesService;
    this.configurationService = configurationService;
    this.debugService = debugService;
    this.cellDecorationIds = /* @__PURE__ */ new Map();
    this.cellContentListeners = new ResourceMap();
    this.currentCancellationTokenSources = new ResourceMap();
    this._register(this.notebookExecutionStateService.onDidChangeExecution(async (e) => {
      const inlineValuesSetting = this.configurationService.getValue(NotebookSetting.notebookInlineValues);
      if (inlineValuesSetting === "off") {
        return;
      }
      if (e.type === 0 /* cell */) {
        await this.updateInlineVariables(e);
      }
    }));
    this._register(Event2.runAndSubscribe(this.configurationService.onDidChangeConfiguration, (e) => {
      if (!e || e.affectsConfiguration(NotebookSetting.notebookInlineValues)) {
        if (this.configurationService.getValue(NotebookSetting.notebookInlineValues) === "off") {
          this.clearNotebookInlineDecorations();
        }
      }
    }));
  }
  static {
    this.id = "notebook.inlineVariablesController";
  }
  static {
    this.MAX_CELL_LINES = 5e3;
  }
  async updateInlineVariables(event) {
    if (event.changed) {
      return;
    }
    const cell = this.notebookEditor.getCellByHandle(event.cellHandle);
    if (!cell) {
      return;
    }
    const existingSource = this.currentCancellationTokenSources.get(cell.uri);
    if (existingSource) {
      existingSource.cancel();
    }
    this.currentCancellationTokenSources.set(cell.uri, new CancellationTokenSource());
    const token = this.currentCancellationTokenSources.get(cell.uri).token;
    if (this.debugService.state !== 0 /* Inactive */) {
      this._clearNotebookInlineDecorations();
      return;
    }
    if (!this.notebookEditor.textModel?.uri || !isEqual2(this.notebookEditor.textModel.uri, event.notebook)) {
      return;
    }
    const model = await cell.resolveTextModel();
    if (!model) {
      return;
    }
    const inlineValuesSetting = this.configurationService.getValue(NotebookSetting.notebookInlineValues);
    const hasInlineValueProvider = this.languageFeaturesService.inlineValuesProvider.has(model);
    if (inlineValuesSetting === "off" || inlineValuesSetting === "auto" && !hasInlineValueProvider) {
      return;
    }
    this.clearCellInlineDecorations(cell);
    const inlineDecorations = [];
    if (hasInlineValueProvider) {
      const lastLine = model.getLineCount();
      const lastColumn = model.getLineMaxColumn(lastLine);
      const ctx = {
        frameId: 0,
        // ignored, we won't have a stack from since not in a debug session
        stoppedLocation: new Range2(lastLine, lastColumn, lastLine, lastColumn)
        // executing cell by cell, so "stopped" location would just be the end of document
      };
      const providers2 = this.languageFeaturesService.inlineValuesProvider.ordered(model).reverse();
      const lineDecorations = /* @__PURE__ */ new Map();
      const fullCellRange = new Range2(1, 1, lastLine, lastColumn);
      const promises = providers2.flatMap((provider) => Promise.resolve(provider.provideInlineValues(model, fullCellRange, ctx, token)).then(async (result) => {
        if (!result) {
          return;
        }
        const notebook = this.notebookEditor.textModel;
        if (!notebook) {
          return;
        }
        const kernel = this.notebookKernelService.getMatchingKernel(notebook);
        const kernelVars = [];
        if (result.some((iv) => iv.type === "variable")) {
          if (!this.notebookEditor.hasModel()) {
            return;
          }
          const variables = kernel.selected?.provideVariables(event.notebook, void 0, "named", 0, token);
          if (variables) {
            for await (const v2 of variables) {
              kernelVars.push(v2);
            }
          }
        }
        for (const iv of result) {
          let text2 = void 0;
          switch (iv.type) {
            case "text":
              text2 = iv.text;
              break;
            case "variable": {
              const name = iv.variableName;
              if (!name) {
                continue;
              }
              const value2 = kernelVars.find((v2) => v2.name === name)?.value;
              if (!value2) {
                continue;
              }
              text2 = format2("{0} = {1}", name, value2);
              break;
            }
            case "expression": {
              continue;
            }
          }
          if (text2) {
            const line = iv.range.startLineNumber;
            let lineSegments = lineDecorations.get(line);
            if (!lineSegments) {
              lineSegments = [];
              lineDecorations.set(line, lineSegments);
            }
            if (!lineSegments.some((iv2) => iv2.text === text2)) {
              lineSegments.push(new InlineSegment2(iv.range.startColumn, text2));
            }
          }
        }
      }, (err) => {
        onUnexpectedExternalError(err);
      }));
      await Promise.all(promises);
      lineDecorations.forEach((segments, line) => {
        if (segments.length > 0) {
          segments.sort((a, b) => a.column - b.column);
          const text2 = segments.map((s) => s.text).join(", ");
          const editorWidth = cell.layoutInfo.editorWidth;
          const fontInfo = cell.layoutInfo.fontInfo;
          if (fontInfo && cell.textModel) {
            const base = Math.floor((editorWidth - 50) / fontInfo.typicalHalfwidthCharacterWidth);
            const lineLength = cell.textModel.getLineLength(line);
            const available = Math.max(0, base - lineLength);
            inlineDecorations.push(...createInlineValueDecoration(line, text2, "nb", void 0, available));
          } else {
            inlineDecorations.push(...createInlineValueDecoration(line, text2, "nb"));
          }
        }
      });
    } else if (inlineValuesSetting === "on") {
      if (!this.notebookEditor.hasModel()) {
        return;
      }
      const kernel = this.notebookKernelService.getMatchingKernel(this.notebookEditor.textModel);
      const variables = kernel?.selected?.provideVariables(event.notebook, void 0, "named", 0, token);
      if (!variables) {
        return;
      }
      const vars = [];
      for await (const v2 of variables) {
        vars.push(v2);
      }
      const varNames = vars.map((v2) => v2.name);
      const document2 = cell.textModel;
      if (!document2) {
        return;
      }
      if (document2.getLineCount() > NotebookInlineVariablesController.MAX_CELL_LINES) {
        return;
      }
      const processedVars = /* @__PURE__ */ new Set();
      const functionRanges = this.getFunctionRanges(document2);
      const commentedRanges = this.getCommentedRanges(document2);
      const ignoredRanges = [...functionRanges, ...commentedRanges];
      const lineDecorations = /* @__PURE__ */ new Map();
      for (const varName of varNames) {
        if (processedVars.has(varName)) {
          continue;
        }
        const regex = new RegExp(`\\b${varName}\\b(?!\\w)`, "g");
        let lastMatchOutsideIgnored = null;
        let foundMatch = false;
        const lines = document2.getValue().split("\n");
        for (let lineNumber = lines.length - 1; lineNumber >= 0; lineNumber--) {
          const line = lines[lineNumber];
          let match2;
          while ((match2 = regex.exec(line)) !== null) {
            const startIndex = match2.index;
            const pos = new Position(lineNumber + 1, startIndex + 1);
            if (!this.isPositionInRanges(pos, ignoredRanges)) {
              lastMatchOutsideIgnored = {
                line: lineNumber + 1,
                column: startIndex + 1
              };
              foundMatch = true;
              break;
            }
          }
          if (foundMatch) {
            break;
          }
        }
        if (lastMatchOutsideIgnored) {
          const inlineVal = varName + " = " + vars.find((v2) => v2.name === varName)?.value;
          let lineSegments = lineDecorations.get(lastMatchOutsideIgnored.line);
          if (!lineSegments) {
            lineSegments = [];
            lineDecorations.set(lastMatchOutsideIgnored.line, lineSegments);
          }
          if (!lineSegments.some((iv) => iv.text === inlineVal)) {
            lineSegments.push(new InlineSegment2(lastMatchOutsideIgnored.column, inlineVal));
          }
        }
        processedVars.add(varName);
      }
      lineDecorations.forEach((segments, line) => {
        if (segments.length > 0) {
          segments.sort((a, b) => a.column - b.column);
          const text2 = segments.map((s) => s.text).join(", ");
          const editorWidth = cell.layoutInfo.editorWidth;
          const fontInfo = cell.layoutInfo.fontInfo;
          if (fontInfo && cell.textModel) {
            const base = Math.floor((editorWidth - 50) / fontInfo.typicalHalfwidthCharacterWidth);
            const lineLength = cell.textModel.getLineLength(line);
            const available = Math.max(0, base - lineLength);
            inlineDecorations.push(...createInlineValueDecoration(line, text2, "nb", void 0, available));
          } else {
            inlineDecorations.push(...createInlineValueDecoration(line, text2, "nb"));
          }
        }
      });
    }
    if (inlineDecorations.length > 0) {
      this.updateCellInlineDecorations(cell, inlineDecorations);
      this.initCellContentListener(cell);
    }
  }
  getFunctionRanges(document2) {
    return document2.getLanguageId() === "python" ? this.getPythonFunctionRanges(document2.getValue()) : this.getBracedFunctionRanges(document2.getValue());
  }
  getPythonFunctionRanges(code) {
    const functionRanges = [];
    const lines = code.split("\n");
    let functionStartLine = -1;
    let inFunction = false;
    let pythonIndentLevel = -1;
    const pythonFunctionDeclRegex = /^(\s*)(async\s+)?(?:def\s+\w+|class\s+\w+)\s*\([^)]*\)\s*:/;
    for (let lineNumber = 0; lineNumber < lines.length; lineNumber++) {
      const line = lines[lineNumber];
      const pythonMatch = line.match(pythonFunctionDeclRegex);
      if (pythonMatch) {
        if (inFunction) {
          const currentIndent = pythonMatch[1].length;
          if (currentIndent <= pythonIndentLevel) {
            functionRanges.push(new Range2(functionStartLine + 1, 1, lineNumber, line.length + 1));
            inFunction = false;
          }
        }
        if (!inFunction) {
          inFunction = true;
          functionStartLine = lineNumber;
          pythonIndentLevel = pythonMatch[1].length;
        }
        continue;
      }
      if (inFunction) {
        if (line.trim() === "") {
          continue;
        }
        const currentIndent = line.match(/^\s*/)?.[0].length ?? 0;
        if (currentIndent <= pythonIndentLevel) {
          functionRanges.push(new Range2(functionStartLine + 1, 1, lineNumber, line.length + 1));
          inFunction = false;
          pythonIndentLevel = -1;
        }
      }
    }
    if (inFunction) {
      functionRanges.push(new Range2(functionStartLine + 1, 1, lines.length, lines[lines.length - 1].length + 1));
    }
    return functionRanges;
  }
  getBracedFunctionRanges(code) {
    const functionRanges = [];
    const lines = code.split("\n");
    let braceDepth = 0;
    let functionStartLine = -1;
    let inFunction = false;
    const functionDeclRegex = /\b(?:function\s+\w+|(?:async\s+)?(?:\w+\s*=\s*)?\([^)]*\)\s*=>|class\s+\w+|(?:public|private|protected|static)?\s*\w+\s*\([^)]*\)\s*{)/;
    for (let lineNumber = 0; lineNumber < lines.length; lineNumber++) {
      const line = lines[lineNumber];
      for (const char of line) {
        if (char === "{") {
          if (!inFunction && functionDeclRegex.test(line)) {
            inFunction = true;
            functionStartLine = lineNumber;
          }
          braceDepth++;
        } else if (char === "}") {
          braceDepth--;
          if (braceDepth === 0 && inFunction) {
            functionRanges.push(new Range2(functionStartLine + 1, 1, lineNumber + 1, line.length + 1));
            inFunction = false;
          }
        }
      }
    }
    return functionRanges;
  }
  getCommentedRanges(document2) {
    return this._getCommentedRanges(document2);
  }
  _getCommentedRanges(document2) {
    try {
      return this.getCommentedRangesByAccurateTokenization(document2);
    } catch (e) {
      return this.getCommentedRangesByManualParsing(document2);
    }
  }
  getCommentedRangesByAccurateTokenization(document2) {
    const commentRanges = [];
    const lineCount = document2.getLineCount();
    if (lineCount > NotebookInlineVariablesController.MAX_CELL_LINES) {
      return commentRanges;
    }
    for (let lineNumber = 1; lineNumber <= lineCount; lineNumber++) {
      if (!document2.tokenization.hasAccurateTokensForLine(lineNumber)) {
        document2.tokenization.forceTokenization(lineNumber);
      }
      const lineTokens = document2.tokenization.getLineTokens(lineNumber);
      if (lineTokens.getCount() === 0) {
        continue;
      }
      let startCharacter;
      for (let tokenIndex = 0; tokenIndex < lineTokens.getCount(); tokenIndex++) {
        const tokenType = lineTokens.getStandardTokenType(tokenIndex);
        if (tokenType === 1 /* Comment */ || tokenType === 2 /* String */ || tokenType === 3 /* RegEx */) {
          if (startCharacter === void 0) {
            startCharacter = lineTokens.getStartOffset(tokenIndex);
          }
          const endCharacter = lineTokens.getEndOffset(tokenIndex);
          const isLastToken = tokenIndex === lineTokens.getCount() - 1;
          const nextTokenDifferent = !isLastToken && lineTokens.getStandardTokenType(tokenIndex + 1) !== tokenType;
          if (isLastToken || nextTokenDifferent) {
            commentRanges.push(new Range2(lineNumber, startCharacter + 1, lineNumber, endCharacter + 1));
            startCharacter = void 0;
          }
        } else {
          startCharacter = void 0;
        }
      }
    }
    return commentRanges;
  }
  getCommentedRangesByManualParsing(document2) {
    const commentRanges = [];
    const lines = document2.getValue().split("\n");
    const languageId = document2.getLanguageId();
    const lineCommentToken = languageId === "python" ? "#" : languageId === "javascript" || languageId === "typescript" ? "//" : null;
    const blockComments = languageId === "javascript" || languageId === "typescript" ? { start: "/*", end: "*/" } : null;
    let inBlockComment = false;
    let blockCommentStartLine = -1;
    let blockCommentStartCol = -1;
    for (let lineNumber = 0; lineNumber < lines.length; lineNumber++) {
      const line = lines[lineNumber];
      const trimmedLine = line.trim();
      if (trimmedLine.length === 0) {
        continue;
      }
      if (blockComments) {
        if (!inBlockComment) {
          const startIndex = line.indexOf(blockComments.start);
          if (startIndex !== -1) {
            inBlockComment = true;
            blockCommentStartLine = lineNumber;
            blockCommentStartCol = startIndex;
          }
        }
        if (inBlockComment) {
          const endIndex = line.indexOf(blockComments.end);
          if (endIndex !== -1) {
            commentRanges.push(new Range2(
              blockCommentStartLine + 1,
              blockCommentStartCol + 1,
              lineNumber + 1,
              endIndex + blockComments.end.length + 1
            ));
            inBlockComment = false;
          }
          continue;
        }
      }
      if (!inBlockComment && lineCommentToken && line.trimLeft().startsWith(lineCommentToken)) {
        const startCol = line.indexOf(lineCommentToken);
        commentRanges.push(new Range2(
          lineNumber + 1,
          startCol + 1,
          lineNumber + 1,
          line.length + 1
        ));
      }
    }
    if (inBlockComment) {
      commentRanges.push(new Range2(
        blockCommentStartLine + 1,
        blockCommentStartCol + 1,
        lines.length,
        lines[lines.length - 1].length + 1
      ));
    }
    return commentRanges;
  }
  isPositionInRanges(position2, ranges) {
    return ranges.some((range2) => range2.containsPosition(position2));
  }
  updateCellInlineDecorations(cell, decorations) {
    const oldDecorations = this.cellDecorationIds.get(cell) ?? [];
    this.cellDecorationIds.set(cell, cell.deltaModelDecorations(
      oldDecorations,
      decorations
    ));
  }
  initCellContentListener(cell) {
    const cellModel = cell.textModel;
    if (!cellModel) {
      return;
    }
    this.cellContentListeners.set(cell.uri, cellModel.onDidChangeContent(() => {
      this.clearCellInlineDecorations(cell);
    }));
  }
  clearCellInlineDecorations(cell) {
    const cellDecorations = this.cellDecorationIds.get(cell) ?? [];
    if (cellDecorations) {
      cell.deltaModelDecorations(cellDecorations, []);
      this.cellDecorationIds.delete(cell);
    }
    const listener = this.cellContentListeners.get(cell.uri);
    if (listener) {
      listener.dispose();
      this.cellContentListeners.delete(cell.uri);
    }
  }
  _clearNotebookInlineDecorations() {
    this.cellDecorationIds.forEach((_, cell) => {
      this.clearCellInlineDecorations(cell);
    });
  }
  clearNotebookInlineDecorations() {
    this._clearNotebookInlineDecorations();
  }
  dispose() {
    super.dispose();
    this._clearNotebookInlineDecorations();
    this.currentCancellationTokenSources.forEach((source) => source.cancel());
    this.currentCancellationTokenSources.clear();
    this.cellContentListeners.forEach((listener) => listener.dispose());
    this.cellContentListeners.clear();
  }
};

NotebookInlineVariablesController = __decorateClass([
  __decorateParam(1, INotebookKernelService),
  __decorateParam(2, INotebookExecutionStateService),
  __decorateParam(3, ILanguageFeaturesService),
  __decorateParam(4, IConfigurationService),
  __decorateParam(5, IDebugService)
], NotebookInlineVariablesController);

registerNotebookContribution(NotebookInlineVariablesController.id, NotebookInlineVariablesController);

registerAction2(class ClearNotebookInlineValues extends NotebookAction {
  constructor() {
    super({
      id: "notebook.clearAllInlineValues",
      title: localize(17482, null)
    });
  }
  runWithContext(accessor, context2) {
    const editor = context2.notebookEditor;
    const controller = editor.getContribution(NotebookInlineVariablesController.id);
    controller.clearNotebookInlineDecorations();
    return Promise.resolve();
  }
});
export { InlineSegment2, NotebookInlineVariablesController };
