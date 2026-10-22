// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/common/textModelBracketPairs.ts



// src/vs/editor/common/textModelBracketPairs.ts
var BracketInfo = class {
  constructor(range2, nestingLevel, nestingLevelOfEqualBracketType, isInvalid) {
    this.range = range2;
    this.nestingLevel = nestingLevel;
    this.nestingLevelOfEqualBracketType = nestingLevelOfEqualBracketType;
    this.isInvalid = isInvalid;
  }
};

var BracketPairInfo = class {
  constructor(range2, openingBracketRange, closingBracketRange, nestingLevel, nestingLevelOfEqualBracketType, bracketPairNode) {
    this.range = range2;
    this.openingBracketRange = openingBracketRange;
    this.closingBracketRange = closingBracketRange;
    this.nestingLevel = nestingLevel;
    this.nestingLevelOfEqualBracketType = nestingLevelOfEqualBracketType;
    this.bracketPairNode = bracketPairNode;
  }
  get openingBracketInfo() {
    return this.bracketPairNode.openingBracket.bracketInfo;
  }
  get closingBracketInfo() {
    return this.bracketPairNode.closingBracket?.bracketInfo;
  }
};

var BracketPairWithMinIndentationInfo = class extends BracketPairInfo {
  constructor(range2, openingBracketRange, closingBracketRange, nestingLevel, nestingLevelOfEqualBracketType, bracketPairNode, minVisibleColumnIndentation) {
    super(range2, openingBracketRange, closingBracketRange, nestingLevel, nestingLevelOfEqualBracketType, bracketPairNode);
    this.minVisibleColumnIndentation = minVisibleColumnIndentation;
  }
};
export { BracketInfo, BracketPairInfo, BracketPairWithMinIndentationInfo };
