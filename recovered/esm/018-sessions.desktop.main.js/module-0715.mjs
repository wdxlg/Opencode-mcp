// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/common/core/text/getPositionOffsetTransformerFromTextModel.ts
import { PositionOffsetTransformerBase } from "./module-0176.mjs";


// src/vs/editor/common/core/text/getPositionOffsetTransformerFromTextModel.ts
function getPositionOffsetTransformerFromTextModel(textModel) {
  return new PositionOffsetTransformerWithTextModel(textModel);
}

var PositionOffsetTransformerWithTextModel = class extends PositionOffsetTransformerBase {
  constructor(_textModel) {
    super();
    this._textModel = _textModel;
  }
  getOffset(position2) {
    return this._textModel.getOffsetAt(position2);
  }
  getPosition(offset) {
    return this._textModel.getPositionAt(offset);
  }
};
export { getPositionOffsetTransformerFromTextModel, PositionOffsetTransformerWithTextModel };
