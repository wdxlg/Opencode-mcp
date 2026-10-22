// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/common/languages/enterAction.ts
import { IndentationContextProcessor } from "./module-0146.mjs";
import { getIndentationAtPosition } from "./module-0143.mjs";


// src/vs/editor/common/languages/enterAction.ts
function getEnterAction(autoIndent, model, range2, languageConfigurationService) {
  model.tokenization.forceTokenization(range2.startLineNumber);
  const languageId = model.getLanguageIdAtPosition(range2.startLineNumber, range2.startColumn);
  const richEditSupport = languageConfigurationService.getLanguageConfiguration(languageId);
  if (!richEditSupport) {
    return null;
  }
  const indentationContextProcessor = new IndentationContextProcessor(model, languageConfigurationService);
  const processedContextTokens = indentationContextProcessor.getProcessedTokenContextAroundRange(range2);
  const previousLineText = processedContextTokens.previousLineProcessedTokens.getLineContent();
  const beforeEnterText = processedContextTokens.beforeRangeProcessedTokens.getLineContent();
  const afterEnterText = processedContextTokens.afterRangeProcessedTokens.getLineContent();
  const enterResult = richEditSupport.onEnter(autoIndent, previousLineText, beforeEnterText, afterEnterText);
  if (!enterResult) {
    return null;
  }
  const indentAction = enterResult.indentAction;
  let appendText = enterResult.appendText;
  const removeText = enterResult.removeText || 0;
  if (!appendText) {
    if (indentAction === 1 /* Indent */ || indentAction === 2 /* IndentOutdent */) {
      appendText = "	";
    } else {
      appendText = "";
    }
  } else if (indentAction === 1 /* Indent */) {
    appendText = "	" + appendText;
  }
  let indentation = getIndentationAtPosition(model, range2.startLineNumber, range2.startColumn);
  if (removeText) {
    indentation = indentation.substring(0, indentation.length - removeText);
  }
  return {
    indentAction,
    appendText,
    removeText,
    indentation
  };
}
export { getEnterAction };
