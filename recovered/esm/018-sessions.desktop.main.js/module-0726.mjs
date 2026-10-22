// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/common/model/bracketPairsTextModelPart/fixBrackets.ts
import { DenseKeyProvider } from "./module-0380.mjs";
import { LanguageAgnosticBracketTokens } from "./module-0384.mjs";
import { TextBufferTokenizer } from "./module-0383.mjs";
import { parseDocument } from "./module-0387.mjs";
import { lengthAdd, lengthGetColumnCountIfZeroLineCount, lengthZero } from "./module-0379.mjs";


// src/vs/editor/common/model/bracketPairsTextModelPart/fixBrackets.ts
function fixBracketsInLine(tokens, languageConfigurationService) {
  const denseKeyProvider = new DenseKeyProvider();
  const bracketTokens = new LanguageAgnosticBracketTokens(
    denseKeyProvider,
    (languageId) => languageConfigurationService.getLanguageConfiguration(languageId)
  );
  const tokenizer = new TextBufferTokenizer(
    new StaticTokenizerSource([tokens]),
    bracketTokens
  );
  const node = parseDocument(tokenizer, [], void 0, true);
  let str = "";
  const line = tokens.getLineContent();
  function processNode(node2, offset) {
    if (node2.kind === 2 /* Pair */) {
      processNode(node2.openingBracket, offset);
      offset = lengthAdd(offset, node2.openingBracket.length);
      if (node2.child) {
        processNode(node2.child, offset);
        offset = lengthAdd(offset, node2.child.length);
      }
      if (node2.closingBracket) {
        processNode(node2.closingBracket, offset);
        offset = lengthAdd(offset, node2.closingBracket.length);
      } else {
        const singleLangBracketTokens = bracketTokens.getSingleLanguageBracketTokens(node2.openingBracket.languageId);
        const closingTokenText = singleLangBracketTokens.findClosingTokenText(node2.openingBracket.bracketIds);
        str += closingTokenText;
      }
    } else if (node2.kind === 3 /* UnexpectedClosingBracket */) {
    } else if (node2.kind === 0 /* Text */ || node2.kind === 1 /* Bracket */) {
      str += line.substring(
        lengthGetColumnCountIfZeroLineCount(offset),
        lengthGetColumnCountIfZeroLineCount(lengthAdd(offset, node2.length))
      );
    } else if (node2.kind === 4 /* List */) {
      for (const child of node2.children) {
        processNode(child, offset);
        offset = lengthAdd(offset, child.length);
      }
    }
  }
  processNode(node, lengthZero);
  return str;
}

var StaticTokenizerSource = class {
  constructor(lines) {
    this.lines = lines;
    this.tokenization = {
      getLineTokens: (lineNumber) => {
        return this.lines[lineNumber - 1];
      }
    };
  }
  getValue() {
    return this.lines.map((l) => l.getLineContent()).join("\n");
  }
  getLineCount() {
    return this.lines.length;
  }
  getLineLength(lineNumber) {
    return this.lines[lineNumber - 1].getLineContent().length;
  }
};
export { fixBracketsInLine, StaticTokenizerSource };
