// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/common/model/bracketPairsTextModelPart/bracketPairsTree/parser.ts
import { NodeReader } from "./module-0386.mjs";
import { BeforeEditPositionMapper } from "./module-0382.mjs";
import { SmallImmutableSet } from "./module-0380.mjs";
import { InvalidBracketAstNode, ListAstNode, PairAstNode, TextAstNode } from "./module-0381.mjs";
import { concat23Trees, concat23TreesOfSameHeight } from "./module-0385.mjs";
import { lengthIsZero, lengthLessThan } from "./module-0379.mjs";


// src/vs/editor/common/model/bracketPairsTextModelPart/bracketPairsTree/parser.ts
function parseDocument(tokenizer, edits, oldNode, createImmutableLists) {
  const parser2 = new Parser2(tokenizer, edits, oldNode, createImmutableLists);
  return parser2.parseDocument();
}

var Parser2 = class {
  constructor(tokenizer, edits, oldNode, createImmutableLists) {
    this.tokenizer = tokenizer;
    this.createImmutableLists = createImmutableLists;
    this._itemsConstructed = 0;
    this._itemsFromCache = 0;
    if (oldNode && createImmutableLists) {
      throw new Error("Not supported");
    }
    this.oldNodeReader = oldNode ? new NodeReader(oldNode) : void 0;
    this.positionMapper = new BeforeEditPositionMapper(edits);
  }
  /**
   * Reports how many nodes were constructed in the last parse operation.
  */
  get nodesConstructed() {
    return this._itemsConstructed;
  }
  /**
   * Reports how many nodes were reused in the last parse operation.
  */
  get nodesReused() {
    return this._itemsFromCache;
  }
  parseDocument() {
    this._itemsConstructed = 0;
    this._itemsFromCache = 0;
    let result = this.parseList(SmallImmutableSet.getEmpty(), 0);
    if (!result) {
      result = ListAstNode.getEmpty();
    }
    return result;
  }
  parseList(openedBracketIds, level) {
    const items = [];
    while (true) {
      let child = this.tryReadChildFromCache(openedBracketIds);
      if (!child) {
        const token = this.tokenizer.peek();
        if (!token || token.kind === 2 /* ClosingBracket */ && token.bracketIds.intersects(openedBracketIds)) {
          break;
        }
        child = this.parseChild(openedBracketIds, level + 1);
      }
      if (child.kind === 4 /* List */ && child.childrenLength === 0) {
        continue;
      }
      items.push(child);
    }
    const result = this.oldNodeReader ? concat23Trees(items) : concat23TreesOfSameHeight(items, this.createImmutableLists);
    return result;
  }
  tryReadChildFromCache(openedBracketIds) {
    if (this.oldNodeReader) {
      const maxCacheableLength = this.positionMapper.getDistanceToNextChange(this.tokenizer.offset);
      if (maxCacheableLength === null || !lengthIsZero(maxCacheableLength)) {
        const cachedNode = this.oldNodeReader.readLongestNodeAt(this.positionMapper.getOffsetBeforeChange(this.tokenizer.offset), (curNode) => {
          if (maxCacheableLength !== null && !lengthLessThan(curNode.length, maxCacheableLength)) {
            return false;
          }
          const canBeReused = curNode.canBeReused(openedBracketIds);
          return canBeReused;
        });
        if (cachedNode) {
          this._itemsFromCache++;
          this.tokenizer.skip(cachedNode.length);
          return cachedNode;
        }
      }
    }
    return void 0;
  }
  parseChild(openedBracketIds, level) {
    this._itemsConstructed++;
    const token = this.tokenizer.read();
    switch (token.kind) {
      case 2 /* ClosingBracket */:
        return new InvalidBracketAstNode(token.bracketIds, token.length);
      case 0 /* Text */:
        return token.astNode;
      case 1 /* OpeningBracket */: {
        if (level > 300) {
          return new TextAstNode(token.length);
        }
        const set = openedBracketIds.merge(token.bracketIds);
        const child = this.parseList(set, level + 1);
        const nextToken = this.tokenizer.peek();
        if (nextToken && nextToken.kind === 2 /* ClosingBracket */ && (nextToken.bracketId === token.bracketId || nextToken.bracketIds.intersects(token.bracketIds))) {
          this.tokenizer.read();
          return PairAstNode.create(
            token.astNode,
            child,
            nextToken.astNode
          );
        } else {
          return PairAstNode.create(
            token.astNode,
            child,
            null
          );
        }
      }
      default:
        throw new Error("unexpected");
    }
  }
};
export { parseDocument, Parser2 };
