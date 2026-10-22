// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/common/model/bracketPairsTextModelPart/bracketPairsTree/bracketPairsTree.ts
import { Disposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { DenseKeyProvider } from "./module-0380.mjs";
import { LanguageAgnosticBracketTokens } from "./module-0384.mjs";
import { FastTokenizer, TextBufferTokenizer } from "./module-0383.mjs";
import { parseDocument } from "./module-0387.mjs";
import { TextEditInfo } from "./module-0382.mjs";
import { lengthAdd, lengthGreaterThanEqual, lengthLessThan, lengthLessThanEqual, lengthZero, lengthsToRange, positionToLength, toLength } from "./module-0379.mjs";
import { combineTextEditInfos } from "./module-0388.mjs";
import { CallbackIterable } from "./module-0007.mjs";
import { BracketInfo, BracketPairWithMinIndentationInfo } from "./module-0378.mjs";


// src/vs/editor/common/model/bracketPairsTextModelPart/bracketPairsTree/bracketPairsTree.ts
var BracketPairsTree = class extends Disposable {
  constructor(textModel, getLanguageConfiguration) {
    super();
    this.textModel = textModel;
    this.getLanguageConfiguration = getLanguageConfiguration;
    this.didChangeEmitter = this._register(new Emitter());
    this.denseKeyProvider = new DenseKeyProvider();
    this.brackets = new LanguageAgnosticBracketTokens(this.denseKeyProvider, this.getLanguageConfiguration);
    this.onDidChange = this.didChangeEmitter.event;
    this.queuedTextEditsForInitialAstWithoutTokens = [];
    this.queuedTextEdits = [];
    if (!textModel.tokenization.hasTokens) {
      const brackets = this.brackets.getSingleLanguageBracketTokens(this.textModel.getLanguageId());
      const tokenizer = new FastTokenizer(this.textModel.getValue(), brackets);
      this.initialAstWithoutTokens = parseDocument(tokenizer, [], void 0, true);
      this.astWithTokens = this.initialAstWithoutTokens;
    } else if (textModel.tokenization.backgroundTokenizationState === 2 /* Completed */) {
      this.initialAstWithoutTokens = void 0;
      this.astWithTokens = this.parseDocumentFromTextBuffer([], void 0, false);
    } else {
      this.initialAstWithoutTokens = this.parseDocumentFromTextBuffer([], void 0, true);
      this.astWithTokens = this.initialAstWithoutTokens;
    }
  }
  didLanguageChange(languageId) {
    return this.brackets.didLanguageChange(languageId);
  }
  //#region TextModel events
  handleDidChangeBackgroundTokenizationState() {
    if (this.textModel.tokenization.backgroundTokenizationState === 2 /* Completed */) {
      const wasUndefined = this.initialAstWithoutTokens === void 0;
      this.initialAstWithoutTokens = void 0;
      if (!wasUndefined) {
        this.didChangeEmitter.fire();
      }
    }
  }
  handleDidChangeTokens({ ranges }) {
    const edits = ranges.map(
      (r2) => new TextEditInfo(
        toLength(r2.fromLineNumber - 1, 0),
        toLength(r2.toLineNumber, 0),
        toLength(r2.toLineNumber - r2.fromLineNumber + 1, 0)
      )
    );
    this.handleEdits(edits, true);
    if (!this.initialAstWithoutTokens) {
      this.didChangeEmitter.fire();
    }
  }
  handleContentChanged(change) {
    const edits = TextEditInfo.fromModelContentChanges(change.changes);
    this.handleEdits(edits, false);
  }
  handleEdits(edits, tokenChange) {
    const result = combineTextEditInfos(this.queuedTextEdits, edits);
    this.queuedTextEdits = result;
    if (this.initialAstWithoutTokens && !tokenChange) {
      this.queuedTextEditsForInitialAstWithoutTokens = combineTextEditInfos(this.queuedTextEditsForInitialAstWithoutTokens, edits);
    }
  }
  //#endregion
  flushQueue() {
    if (this.queuedTextEdits.length > 0) {
      this.astWithTokens = this.parseDocumentFromTextBuffer(this.queuedTextEdits, this.astWithTokens, false);
      this.queuedTextEdits = [];
    }
    if (this.queuedTextEditsForInitialAstWithoutTokens.length > 0) {
      if (this.initialAstWithoutTokens) {
        this.initialAstWithoutTokens = this.parseDocumentFromTextBuffer(this.queuedTextEditsForInitialAstWithoutTokens, this.initialAstWithoutTokens, false);
      }
      this.queuedTextEditsForInitialAstWithoutTokens = [];
    }
  }
  /**
   * @pure (only if isPure = true)
  */
  parseDocumentFromTextBuffer(edits, previousAst, immutable) {
    const isPure = false;
    const previousAstClone = isPure ? previousAst?.deepClone() : previousAst;
    const tokenizer = new TextBufferTokenizer(this.textModel, this.brackets);
    const result = parseDocument(tokenizer, edits, previousAstClone, immutable);
    return result;
  }
  getBracketsInRange(range2, onlyColorizedBrackets) {
    this.flushQueue();
    const startOffset = toLength(range2.startLineNumber - 1, range2.startColumn - 1);
    const endOffset = toLength(range2.endLineNumber - 1, range2.endColumn - 1);
    return new CallbackIterable((cb) => {
      const node = this.initialAstWithoutTokens || this.astWithTokens;
      collectBrackets(node, lengthZero, node.length, startOffset, endOffset, cb, 0, 0, /* @__PURE__ */ new Map(), onlyColorizedBrackets);
    });
  }
  getBracketPairsInRange(range2, includeMinIndentation) {
    this.flushQueue();
    const startLength = positionToLength(range2.getStartPosition());
    const endLength = positionToLength(range2.getEndPosition());
    return new CallbackIterable((cb) => {
      const node = this.initialAstWithoutTokens || this.astWithTokens;
      const context2 = new CollectBracketPairsContext(cb, includeMinIndentation, this.textModel);
      collectBracketPairs(node, lengthZero, node.length, startLength, endLength, context2, 0, /* @__PURE__ */ new Map());
    });
  }
  getFirstBracketAfter(position2) {
    this.flushQueue();
    const node = this.initialAstWithoutTokens || this.astWithTokens;
    return getFirstBracketAfter(node, lengthZero, node.length, positionToLength(position2));
  }
  getFirstBracketBefore(position2) {
    this.flushQueue();
    const node = this.initialAstWithoutTokens || this.astWithTokens;
    return getFirstBracketBefore(node, lengthZero, node.length, positionToLength(position2));
  }
};

function getFirstBracketBefore(node, nodeOffsetStart, nodeOffsetEnd, position2) {
  if (node.kind === 4 /* List */ || node.kind === 2 /* Pair */) {
    const lengths = [];
    for (const child of node.children) {
      nodeOffsetEnd = lengthAdd(nodeOffsetStart, child.length);
      lengths.push({ nodeOffsetStart, nodeOffsetEnd });
      nodeOffsetStart = nodeOffsetEnd;
    }
    for (let i2 = lengths.length - 1; i2 >= 0; i2--) {
      const { nodeOffsetStart: nodeOffsetStart2, nodeOffsetEnd: nodeOffsetEnd2 } = lengths[i2];
      if (lengthLessThan(nodeOffsetStart2, position2)) {
        const result = getFirstBracketBefore(node.children[i2], nodeOffsetStart2, nodeOffsetEnd2, position2);
        if (result) {
          return result;
        }
      }
    }
    return null;
  } else if (node.kind === 3 /* UnexpectedClosingBracket */) {
    return null;
  } else if (node.kind === 1 /* Bracket */) {
    const range2 = lengthsToRange(nodeOffsetStart, nodeOffsetEnd);
    return {
      bracketInfo: node.bracketInfo,
      range: range2
    };
  }
  return null;
}

function getFirstBracketAfter(node, nodeOffsetStart, nodeOffsetEnd, position2) {
  if (node.kind === 4 /* List */ || node.kind === 2 /* Pair */) {
    for (const child of node.children) {
      nodeOffsetEnd = lengthAdd(nodeOffsetStart, child.length);
      if (lengthLessThan(position2, nodeOffsetEnd)) {
        const result = getFirstBracketAfter(child, nodeOffsetStart, nodeOffsetEnd, position2);
        if (result) {
          return result;
        }
      }
      nodeOffsetStart = nodeOffsetEnd;
    }
    return null;
  } else if (node.kind === 3 /* UnexpectedClosingBracket */) {
    return null;
  } else if (node.kind === 1 /* Bracket */) {
    const range2 = lengthsToRange(nodeOffsetStart, nodeOffsetEnd);
    return {
      bracketInfo: node.bracketInfo,
      range: range2
    };
  }
  return null;
}

function collectBrackets(node, nodeOffsetStart, nodeOffsetEnd, startOffset, endOffset, push, level, nestingLevelOfEqualBracketType, levelPerBracketType, onlyColorizedBrackets, parentPairIsIncomplete = false) {
  if (level > 200) {
    return true;
  }
  whileLoop:
    while (true) {
      switch (node.kind) {
        case 4 /* List */: {
          const childCount = node.childrenLength;
          for (let i2 = 0; i2 < childCount; i2++) {
            const child = node.getChild(i2);
            if (!child) {
              continue;
            }
            nodeOffsetEnd = lengthAdd(nodeOffsetStart, child.length);
            if (lengthLessThanEqual(nodeOffsetStart, endOffset) && lengthGreaterThanEqual(nodeOffsetEnd, startOffset)) {
              const childEndsAfterEnd = lengthGreaterThanEqual(nodeOffsetEnd, endOffset);
              if (childEndsAfterEnd) {
                node = child;
                continue whileLoop;
              }
              const shouldContinue = collectBrackets(child, nodeOffsetStart, nodeOffsetEnd, startOffset, endOffset, push, level, 0, levelPerBracketType, onlyColorizedBrackets);
              if (!shouldContinue) {
                return false;
              }
            }
            nodeOffsetStart = nodeOffsetEnd;
          }
          return true;
        }
        case 2 /* Pair */: {
          const colorize = !onlyColorizedBrackets || !node.closingBracket || node.closingBracket.bracketInfo.closesColorized(node.openingBracket.bracketInfo);
          let levelPerBracket = 0;
          if (levelPerBracketType) {
            let existing = levelPerBracketType.get(node.openingBracket.text);
            if (existing === void 0) {
              existing = 0;
            }
            levelPerBracket = existing;
            if (colorize) {
              existing++;
              levelPerBracketType.set(node.openingBracket.text, existing);
            }
          }
          const childCount = node.childrenLength;
          for (let i2 = 0; i2 < childCount; i2++) {
            const child = node.getChild(i2);
            if (!child) {
              continue;
            }
            nodeOffsetEnd = lengthAdd(nodeOffsetStart, child.length);
            if (lengthLessThanEqual(nodeOffsetStart, endOffset) && lengthGreaterThanEqual(nodeOffsetEnd, startOffset)) {
              const childEndsAfterEnd = lengthGreaterThanEqual(nodeOffsetEnd, endOffset);
              if (childEndsAfterEnd && child.kind !== 1 /* Bracket */) {
                node = child;
                if (colorize) {
                  level++;
                  nestingLevelOfEqualBracketType = levelPerBracket + 1;
                } else {
                  nestingLevelOfEqualBracketType = levelPerBracket;
                }
                continue whileLoop;
              }
              if (colorize || child.kind !== 1 /* Bracket */ || !node.closingBracket) {
                const shouldContinue = collectBrackets(
                  child,
                  nodeOffsetStart,
                  nodeOffsetEnd,
                  startOffset,
                  endOffset,
                  push,
                  colorize ? level + 1 : level,
                  colorize ? levelPerBracket + 1 : levelPerBracket,
                  levelPerBracketType,
                  onlyColorizedBrackets,
                  !node.closingBracket
                );
                if (!shouldContinue) {
                  return false;
                }
              }
            }
            nodeOffsetStart = nodeOffsetEnd;
          }
          levelPerBracketType?.set(node.openingBracket.text, levelPerBracket);
          return true;
        }
        case 3 /* UnexpectedClosingBracket */: {
          const range2 = lengthsToRange(nodeOffsetStart, nodeOffsetEnd);
          return push(new BracketInfo(range2, level - 1, 0, true));
        }
        case 1 /* Bracket */: {
          const range2 = lengthsToRange(nodeOffsetStart, nodeOffsetEnd);
          return push(new BracketInfo(range2, level - 1, nestingLevelOfEqualBracketType - 1, parentPairIsIncomplete));
        }
        case 0 /* Text */:
          return true;
      }
    }
}

var CollectBracketPairsContext = class {
  constructor(push, includeMinIndentation, textModel) {
    this.push = push;
    this.includeMinIndentation = includeMinIndentation;
    this.textModel = textModel;
  }
};

function collectBracketPairs(node, nodeOffsetStart, nodeOffsetEnd, startOffset, endOffset, context2, level, levelPerBracketType) {
  if (level > 200) {
    return true;
  }
  let shouldContinue = true;
  if (node.kind === 2 /* Pair */) {
    let levelPerBracket = 0;
    if (levelPerBracketType) {
      let existing = levelPerBracketType.get(node.openingBracket.text);
      if (existing === void 0) {
        existing = 0;
      }
      levelPerBracket = existing;
      existing++;
      levelPerBracketType.set(node.openingBracket.text, existing);
    }
    const openingBracketEnd = lengthAdd(nodeOffsetStart, node.openingBracket.length);
    let minIndentation = -1;
    if (context2.includeMinIndentation) {
      minIndentation = node.computeMinIndentation(
        nodeOffsetStart,
        context2.textModel
      );
    }
    shouldContinue = context2.push(
      new BracketPairWithMinIndentationInfo(
        lengthsToRange(nodeOffsetStart, nodeOffsetEnd),
        lengthsToRange(nodeOffsetStart, openingBracketEnd),
        node.closingBracket ? lengthsToRange(
          lengthAdd(openingBracketEnd, node.child?.length || lengthZero),
          nodeOffsetEnd
        ) : void 0,
        level,
        levelPerBracket,
        node,
        minIndentation
      )
    );
    nodeOffsetStart = openingBracketEnd;
    if (shouldContinue && node.child) {
      const child = node.child;
      nodeOffsetEnd = lengthAdd(nodeOffsetStart, child.length);
      if (lengthLessThanEqual(nodeOffsetStart, endOffset) && lengthGreaterThanEqual(nodeOffsetEnd, startOffset)) {
        shouldContinue = collectBracketPairs(
          child,
          nodeOffsetStart,
          nodeOffsetEnd,
          startOffset,
          endOffset,
          context2,
          level + 1,
          levelPerBracketType
        );
        if (!shouldContinue) {
          return false;
        }
      }
    }
    levelPerBracketType?.set(node.openingBracket.text, levelPerBracket);
  } else {
    let curOffset = nodeOffsetStart;
    for (const child of node.children) {
      const childOffset = curOffset;
      curOffset = lengthAdd(curOffset, child.length);
      if (lengthLessThanEqual(childOffset, endOffset) && lengthLessThanEqual(startOffset, curOffset)) {
        shouldContinue = collectBracketPairs(
          child,
          childOffset,
          curOffset,
          startOffset,
          endOffset,
          context2,
          level,
          levelPerBracketType
        );
        if (!shouldContinue) {
          return false;
        }
      }
    }
  }
  return shouldContinue;
}
export { getFirstBracketBefore, getFirstBracketAfter, collectBrackets, collectBracketPairs, BracketPairsTree, CollectBracketPairsContext };
