// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/common/model/decorationProvider.ts



// src/vs/editor/common/model/decorationProvider.ts
var LineHeightChangingDecoration = class {
  constructor(ownerId2, decorationId, lineNumber, lineHeight) {
    this.ownerId = ownerId2;
    this.decorationId = decorationId;
    this.lineNumber = lineNumber;
    this.lineHeight = lineHeight;
  }
  static toKey(obj) {
    return `${obj.ownerId};${obj.decorationId};${obj.lineNumber}`;
  }
};

var LineFontChangingDecoration = class {
  constructor(ownerId2, decorationId, lineNumber) {
    this.ownerId = ownerId2;
    this.decorationId = decorationId;
    this.lineNumber = lineNumber;
  }
  static toKey(obj) {
    return `${obj.ownerId};${obj.decorationId};${obj.lineNumber}`;
  }
};
export { LineHeightChangingDecoration, LineFontChangingDecoration };
