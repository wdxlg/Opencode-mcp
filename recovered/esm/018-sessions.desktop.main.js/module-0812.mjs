// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/contrib/indentation/common/indentation.ts
import { ProcessedIndentRulesSupport } from "./module-0146.mjs";
import { ShiftCommand } from "./module-0148.mjs";
import { getLeadingWhitespace } from "./module-0030.mjs";
import { EditOperation } from "./module-0162.mjs";
import { Selection } from "./module-0107.mjs";
import { normalizeIndentation } from "./module-0111.mjs";


// src/vs/editor/contrib/indentation/common/indentation.ts
function getReindentEditOperations(model, languageConfigurationService, startLineNumber, endLineNumber) {
  if (model.getLineCount() === 1 && model.getLineMaxColumn(1) === 1) {
    return [];
  }
  const indentationRulesSupport = languageConfigurationService.getLanguageConfiguration(model.getLanguageId()).indentRulesSupport;
  if (!indentationRulesSupport) {
    return [];
  }
  const processedIndentRulesSupport = new ProcessedIndentRulesSupport(model, indentationRulesSupport, languageConfigurationService);
  endLineNumber = Math.min(endLineNumber, model.getLineCount());
  while (startLineNumber <= endLineNumber) {
    if (!processedIndentRulesSupport.shouldIgnore(startLineNumber)) {
      break;
    }
    startLineNumber++;
  }
  if (startLineNumber > endLineNumber - 1) {
    return [];
  }
  const { tabSize, indentSize, insertSpaces } = model.getOptions();
  const shiftIndent2 = (indentation, count2) => {
    count2 = count2 || 1;
    return ShiftCommand.shiftIndent(indentation, indentation.length + count2, tabSize, indentSize, insertSpaces);
  };
  const unshiftIndent2 = (indentation, count2) => {
    count2 = count2 || 1;
    return ShiftCommand.unshiftIndent(indentation, indentation.length + count2, tabSize, indentSize, insertSpaces);
  };
  const indentEdits = [];
  const currentLineText = model.getLineContent(startLineNumber);
  let globalIndent = getLeadingWhitespace(currentLineText);
  let idealIndentForNextLine = globalIndent;
  if (processedIndentRulesSupport.shouldIncrease(startLineNumber)) {
    idealIndentForNextLine = shiftIndent2(idealIndentForNextLine);
    globalIndent = shiftIndent2(globalIndent);
  } else if (processedIndentRulesSupport.shouldIndentNextLine(startLineNumber)) {
    idealIndentForNextLine = shiftIndent2(idealIndentForNextLine);
  }
  startLineNumber++;
  for (let lineNumber = startLineNumber; lineNumber <= endLineNumber; lineNumber++) {
    if (doesLineStartWithString(model, lineNumber)) {
      continue;
    }
    const text2 = model.getLineContent(lineNumber);
    const oldIndentation = getLeadingWhitespace(text2);
    const currentIdealIndent = idealIndentForNextLine;
    if (processedIndentRulesSupport.shouldDecrease(lineNumber, currentIdealIndent)) {
      idealIndentForNextLine = unshiftIndent2(idealIndentForNextLine);
      globalIndent = unshiftIndent2(globalIndent);
    }
    if (oldIndentation !== idealIndentForNextLine) {
      indentEdits.push(EditOperation.replaceMove(new Selection(lineNumber, 1, lineNumber, oldIndentation.length + 1), normalizeIndentation(idealIndentForNextLine, indentSize, insertSpaces)));
    }
    if (processedIndentRulesSupport.shouldIgnore(lineNumber)) {
      continue;
    } else if (processedIndentRulesSupport.shouldIncrease(lineNumber, currentIdealIndent)) {
      globalIndent = shiftIndent2(globalIndent);
      idealIndentForNextLine = globalIndent;
    } else if (processedIndentRulesSupport.shouldIndentNextLine(lineNumber, currentIdealIndent)) {
      idealIndentForNextLine = shiftIndent2(idealIndentForNextLine);
    } else {
      idealIndentForNextLine = globalIndent;
    }
  }
  return indentEdits;
}

function doesLineStartWithString(model, lineNumber) {
  if (!model.tokenization.isCheapToTokenize(lineNumber)) {
    return false;
  }
  const lineTokens = model.tokenization.getLineTokens(lineNumber);
  return lineTokens.getStandardTokenType(0) === 2 /* String */;
}
export { getReindentEditOperations, doesLineStartWithString };
