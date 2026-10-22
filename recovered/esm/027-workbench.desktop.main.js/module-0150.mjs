// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/common/languages/autoIndent.ts
import { IndentationContextProcessor, ProcessedIndentRulesSupport, isLanguageDifferentFromLineStart } from "./module-0146.mjs";
import { getLeadingWhitespace } from "./module-0030.mjs";


// src/vs/editor/common/languages/autoIndent.ts
function getPrecedingValidLine(model, lineNumber, processedIndentRulesSupport) {
  const languageId = model.tokenization.getLanguageIdAtPosition(lineNumber, 0);
  if (lineNumber > 1) {
    let lastLineNumber;
    let resultLineNumber = -1;
    for (lastLineNumber = lineNumber - 1; lastLineNumber >= 1; lastLineNumber--) {
      if (model.tokenization.getLanguageIdAtPosition(lastLineNumber, 0) !== languageId) {
        return resultLineNumber;
      }
      const text2 = model.getLineContent(lastLineNumber);
      if (processedIndentRulesSupport.shouldIgnore(lastLineNumber) || /^\s+$/.test(text2) || text2 === "") {
        resultLineNumber = lastLineNumber;
        continue;
      }
      return lastLineNumber;
    }
  }
  return -1;
}

function getInheritIndentForLine(autoIndent, model, lineNumber, honorIntentialIndent = true, languageConfigurationService) {
  if (autoIndent < 4 /* Full */) {
    return null;
  }
  const indentRulesSupport = languageConfigurationService.getLanguageConfiguration(model.tokenization.getLanguageId()).indentRulesSupport;
  if (!indentRulesSupport) {
    return null;
  }
  const processedIndentRulesSupport = new ProcessedIndentRulesSupport(model, indentRulesSupport, languageConfigurationService);
  if (lineNumber <= 1) {
    return {
      indentation: "",
      action: null
    };
  }
  for (let priorLineNumber = lineNumber - 1; priorLineNumber > 0; priorLineNumber--) {
    if (model.getLineContent(priorLineNumber) !== "") {
      break;
    }
    if (priorLineNumber === 1) {
      return {
        indentation: "",
        action: null
      };
    }
  }
  const precedingUnIgnoredLine = getPrecedingValidLine(model, lineNumber, processedIndentRulesSupport);
  if (precedingUnIgnoredLine < 0) {
    return null;
  } else if (precedingUnIgnoredLine < 1) {
    return {
      indentation: "",
      action: null
    };
  }
  if (processedIndentRulesSupport.shouldIncrease(precedingUnIgnoredLine) || processedIndentRulesSupport.shouldIndentNextLine(precedingUnIgnoredLine)) {
    const precedingUnIgnoredLineContent = model.getLineContent(precedingUnIgnoredLine);
    return {
      indentation: getLeadingWhitespace(precedingUnIgnoredLineContent),
      action: 1 /* Indent */,
      line: precedingUnIgnoredLine
    };
  } else if (processedIndentRulesSupport.shouldDecrease(precedingUnIgnoredLine)) {
    const precedingUnIgnoredLineContent = model.getLineContent(precedingUnIgnoredLine);
    return {
      indentation: getLeadingWhitespace(precedingUnIgnoredLineContent),
      action: null,
      line: precedingUnIgnoredLine
    };
  } else {
    if (precedingUnIgnoredLine === 1) {
      return {
        indentation: getLeadingWhitespace(model.getLineContent(precedingUnIgnoredLine)),
        action: null,
        line: precedingUnIgnoredLine
      };
    }
    const previousLine = precedingUnIgnoredLine - 1;
    const previousLineIndentMetadata = indentRulesSupport.getIndentMetadata(model.getLineContent(previousLine));
    if (!(previousLineIndentMetadata & (1 /* INCREASE_MASK */ | 2 /* DECREASE_MASK */)) && previousLineIndentMetadata & 4 /* INDENT_NEXTLINE_MASK */) {
      let stopLine = 0;
      for (let i2 = previousLine - 1; i2 > 0; i2--) {
        if (processedIndentRulesSupport.shouldIndentNextLine(i2)) {
          continue;
        }
        stopLine = i2;
        break;
      }
      return {
        indentation: getLeadingWhitespace(model.getLineContent(stopLine + 1)),
        action: null,
        line: stopLine + 1
      };
    }
    if (honorIntentialIndent) {
      return {
        indentation: getLeadingWhitespace(model.getLineContent(precedingUnIgnoredLine)),
        action: null,
        line: precedingUnIgnoredLine
      };
    } else {
      for (let i2 = precedingUnIgnoredLine; i2 > 0; i2--) {
        if (processedIndentRulesSupport.shouldIncrease(i2)) {
          return {
            indentation: getLeadingWhitespace(model.getLineContent(i2)),
            action: 1 /* Indent */,
            line: i2
          };
        } else if (processedIndentRulesSupport.shouldIndentNextLine(i2)) {
          let stopLine = 0;
          for (let j = i2 - 1; j > 0; j--) {
            if (processedIndentRulesSupport.shouldIndentNextLine(i2)) {
              continue;
            }
            stopLine = j;
            break;
          }
          return {
            indentation: getLeadingWhitespace(model.getLineContent(stopLine + 1)),
            action: null,
            line: stopLine + 1
          };
        } else if (processedIndentRulesSupport.shouldDecrease(i2)) {
          return {
            indentation: getLeadingWhitespace(model.getLineContent(i2)),
            action: null,
            line: i2
          };
        }
      }
      return {
        indentation: getLeadingWhitespace(model.getLineContent(1)),
        action: null,
        line: 1
      };
    }
  }
}

function getGoodIndentForLine(autoIndent, virtualModel, languageId, lineNumber, indentConverter, languageConfigurationService) {
  if (autoIndent < 4 /* Full */) {
    return null;
  }
  const richEditSupport = languageConfigurationService.getLanguageConfiguration(languageId);
  if (!richEditSupport) {
    return null;
  }
  const indentRulesSupport = languageConfigurationService.getLanguageConfiguration(languageId).indentRulesSupport;
  if (!indentRulesSupport) {
    return null;
  }
  const processedIndentRulesSupport = new ProcessedIndentRulesSupport(virtualModel, indentRulesSupport, languageConfigurationService);
  const indent = getInheritIndentForLine(autoIndent, virtualModel, lineNumber, void 0, languageConfigurationService);
  if (indent) {
    const inheritLine = indent.line;
    if (inheritLine !== void 0) {
      let shouldApplyEnterRules = true;
      for (let inBetweenLine = inheritLine; inBetweenLine < lineNumber - 1; inBetweenLine++) {
        if (!/^\s*$/.test(virtualModel.getLineContent(inBetweenLine))) {
          shouldApplyEnterRules = false;
          break;
        }
      }
      if (shouldApplyEnterRules) {
        const enterResult = richEditSupport.onEnter(autoIndent, "", virtualModel.getLineContent(inheritLine), "");
        if (enterResult) {
          let indentation = getLeadingWhitespace(virtualModel.getLineContent(inheritLine));
          if (enterResult.removeText) {
            indentation = indentation.substring(0, indentation.length - enterResult.removeText);
          }
          if (enterResult.indentAction === 1 /* Indent */ || enterResult.indentAction === 2 /* IndentOutdent */) {
            indentation = indentConverter.shiftIndent(indentation);
          } else if (enterResult.indentAction === 3 /* Outdent */) {
            indentation = indentConverter.unshiftIndent(indentation);
          }
          if (processedIndentRulesSupport.shouldDecrease(lineNumber)) {
            indentation = indentConverter.unshiftIndent(indentation);
          }
          if (enterResult.appendText) {
            indentation += enterResult.appendText;
          }
          return getLeadingWhitespace(indentation);
        }
      }
    }
    if (processedIndentRulesSupport.shouldDecrease(lineNumber)) {
      if (indent.action === 1 /* Indent */) {
        return indent.indentation;
      } else {
        return indentConverter.unshiftIndent(indent.indentation);
      }
    } else {
      if (indent.action === 1 /* Indent */) {
        return indentConverter.shiftIndent(indent.indentation);
      } else {
        return indent.indentation;
      }
    }
  }
  return null;
}

function getIndentForEnter(autoIndent, model, range2, indentConverter, languageConfigurationService) {
  if (autoIndent < 4 /* Full */) {
    return null;
  }
  const languageId = model.getLanguageIdAtPosition(range2.startLineNumber, range2.startColumn);
  const indentRulesSupport = languageConfigurationService.getLanguageConfiguration(languageId).indentRulesSupport;
  if (!indentRulesSupport) {
    return null;
  }
  model.tokenization.forceTokenization(range2.startLineNumber);
  const indentationContextProcessor = new IndentationContextProcessor(model, languageConfigurationService);
  const processedContextTokens = indentationContextProcessor.getProcessedTokenContextAroundRange(range2);
  const afterEnterProcessedTokens = processedContextTokens.afterRangeProcessedTokens;
  const beforeEnterProcessedTokens = processedContextTokens.beforeRangeProcessedTokens;
  const beforeEnterIndent = getLeadingWhitespace(beforeEnterProcessedTokens.getLineContent());
  const virtualModel = createVirtualModelWithModifiedTokensAtLine(model, range2.startLineNumber, beforeEnterProcessedTokens);
  const languageIsDifferentFromLineStart = isLanguageDifferentFromLineStart(model, range2.getStartPosition());
  const currentLine = model.getLineContent(range2.startLineNumber);
  const currentLineIndent = getLeadingWhitespace(currentLine);
  const afterEnterAction = getInheritIndentForLine(autoIndent, virtualModel, range2.startLineNumber + 1, void 0, languageConfigurationService);
  if (!afterEnterAction) {
    const beforeEnter = languageIsDifferentFromLineStart ? currentLineIndent : beforeEnterIndent;
    return {
      beforeEnter,
      afterEnter: beforeEnter
    };
  }
  let afterEnterIndent = languageIsDifferentFromLineStart ? currentLineIndent : afterEnterAction.indentation;
  if (afterEnterAction.action === 1 /* Indent */) {
    afterEnterIndent = indentConverter.shiftIndent(afterEnterIndent);
  }
  if (indentRulesSupport.shouldDecrease(afterEnterProcessedTokens.getLineContent())) {
    afterEnterIndent = indentConverter.unshiftIndent(afterEnterIndent);
  }
  return {
    beforeEnter: languageIsDifferentFromLineStart ? currentLineIndent : beforeEnterIndent,
    afterEnter: afterEnterIndent
  };
}

function getIndentActionForType(cursorConfig, model, range2, ch, indentConverter, languageConfigurationService) {
  const autoIndent = cursorConfig.autoIndent;
  if (autoIndent < 4 /* Full */) {
    return null;
  }
  const languageIsDifferentFromLineStart = isLanguageDifferentFromLineStart(model, range2.getStartPosition());
  if (languageIsDifferentFromLineStart) {
    return null;
  }
  const languageId = model.getLanguageIdAtPosition(range2.startLineNumber, range2.startColumn);
  const indentRulesSupport = languageConfigurationService.getLanguageConfiguration(languageId).indentRulesSupport;
  if (!indentRulesSupport) {
    return null;
  }
  const indentationContextProcessor = new IndentationContextProcessor(model, languageConfigurationService);
  const processedContextTokens = indentationContextProcessor.getProcessedTokenContextAroundRange(range2);
  const beforeRangeText = processedContextTokens.beforeRangeProcessedTokens.getLineContent();
  const afterRangeText = processedContextTokens.afterRangeProcessedTokens.getLineContent();
  const textAroundRange = beforeRangeText + afterRangeText;
  const textAroundRangeWithCharacter = beforeRangeText + ch + afterRangeText;
  if (!indentRulesSupport.shouldDecrease(textAroundRange) && indentRulesSupport.shouldDecrease(textAroundRangeWithCharacter)) {
    const r2 = getInheritIndentForLine(autoIndent, model, range2.startLineNumber, false, languageConfigurationService);
    if (!r2) {
      return null;
    }
    let indentation = r2.indentation;
    if (r2.action !== 1 /* Indent */) {
      indentation = indentConverter.unshiftIndent(indentation);
    }
    return indentation;
  }
  const previousLineNumber = range2.startLineNumber - 1;
  if (previousLineNumber > 0) {
    const previousLine = model.getLineContent(previousLineNumber);
    if (indentRulesSupport.shouldIndentNextLine(previousLine) && indentRulesSupport.shouldIncrease(textAroundRangeWithCharacter)) {
      const inheritedIndentationData = getInheritIndentForLine(autoIndent, model, range2.startLineNumber, false, languageConfigurationService);
      const inheritedIndentation = inheritedIndentationData?.indentation;
      if (inheritedIndentation !== void 0) {
        const currentLine = model.getLineContent(range2.startLineNumber);
        const actualCurrentIndentation = getLeadingWhitespace(currentLine);
        const inferredCurrentIndentation = indentConverter.shiftIndent(inheritedIndentation);
        const inferredIndentationEqualsActual = inferredCurrentIndentation === actualCurrentIndentation;
        const textAroundRangeContainsOnlyWhitespace = /^\s*$/.test(textAroundRange);
        const autoClosingPairs = cursorConfig.autoClosingPairs.autoClosingPairsOpenByEnd.get(ch);
        const autoClosingPairExists = autoClosingPairs && autoClosingPairs.length > 0;
        const isChFirstNonWhitespaceCharacterAndInAutoClosingPair = autoClosingPairExists && textAroundRangeContainsOnlyWhitespace;
        if (inferredIndentationEqualsActual && isChFirstNonWhitespaceCharacterAndInAutoClosingPair) {
          return inheritedIndentation;
        }
      }
    }
  }
  return null;
}

function getIndentMetadata(model, lineNumber, languageConfigurationService) {
  const indentRulesSupport = languageConfigurationService.getLanguageConfiguration(model.getLanguageId()).indentRulesSupport;
  if (!indentRulesSupport) {
    return null;
  }
  if (lineNumber < 1 || lineNumber > model.getLineCount()) {
    return null;
  }
  return indentRulesSupport.getIndentMetadata(model.getLineContent(lineNumber));
}

function createVirtualModelWithModifiedTokensAtLine(model, modifiedLineNumber, modifiedTokens) {
  const virtualModel = {
    tokenization: {
      getLineTokens: (lineNumber) => {
        if (lineNumber === modifiedLineNumber) {
          return modifiedTokens;
        } else {
          return model.tokenization.getLineTokens(lineNumber);
        }
      },
      getLanguageId: () => {
        return model.getLanguageId();
      },
      getLanguageIdAtPosition: (lineNumber, column) => {
        return model.getLanguageIdAtPosition(lineNumber, column);
      }
    },
    getLineContent: (lineNumber) => {
      if (lineNumber === modifiedLineNumber) {
        return modifiedTokens.getLineContent();
      } else {
        return model.getLineContent(lineNumber);
      }
    }
  };
  return virtualModel;
}
export { getPrecedingValidLine, getInheritIndentForLine, getGoodIndentForLine, getIndentForEnter, getIndentActionForType, getIndentMetadata, createVirtualModelWithModifiedTokensAtLine };
