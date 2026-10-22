// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/browser/view/viewUserInputEvents.ts
import { Position } from "./module-0079.mjs";


// src/vs/editor/browser/view/viewUserInputEvents.ts
var ViewUserInputEvents = class _ViewUserInputEvents {
  constructor(coordinatesConverter) {
    this.onKeyDown = null;
    this.onKeyUp = null;
    this.onContextMenu = null;
    this.onMouseMove = null;
    this.onMouseLeave = null;
    this.onMouseDown = null;
    this.onMouseUp = null;
    this.onMouseDrag = null;
    this.onMouseDrop = null;
    this.onMouseDropCanceled = null;
    this.onMouseWheel = null;
    this._coordinatesConverter = coordinatesConverter;
  }
  emitKeyDown(e4) {
    this.onKeyDown?.(e4);
  }
  emitKeyUp(e4) {
    this.onKeyUp?.(e4);
  }
  emitContextMenu(e4) {
    this.onContextMenu?.(this._convertViewToModelMouseEvent(e4));
  }
  emitMouseMove(e4) {
    this.onMouseMove?.(this._convertViewToModelMouseEvent(e4));
  }
  emitMouseLeave(e4) {
    this.onMouseLeave?.(this._convertViewToModelMouseEvent(e4));
  }
  emitMouseDown(e4) {
    this.onMouseDown?.(this._convertViewToModelMouseEvent(e4));
  }
  emitMouseUp(e4) {
    this.onMouseUp?.(this._convertViewToModelMouseEvent(e4));
  }
  emitMouseDrag(e4) {
    this.onMouseDrag?.(this._convertViewToModelMouseEvent(e4));
  }
  emitMouseDrop(e4) {
    this.onMouseDrop?.(this._convertViewToModelMouseEvent(e4));
  }
  emitMouseDropCanceled() {
    this.onMouseDropCanceled?.();
  }
  emitMouseWheel(e4) {
    this.onMouseWheel?.(e4);
  }
  _convertViewToModelMouseEvent(e4) {
    if (e4.target) {
      return {
        event: e4.event,
        target: this._convertViewToModelMouseTarget(e4.target)
      };
    }
    return e4;
  }
  _convertViewToModelMouseTarget(target) {
    return _ViewUserInputEvents.convertViewToModelMouseTarget(target, this._coordinatesConverter);
  }
  static convertViewToModelMouseTarget(target, coordinatesConverter) {
    const result = { ...target };
    if (result.position) {
      result.position = coordinatesConverter.convertViewPositionToModelPosition(result.position);
    }
    if (result.range) {
      result.range = coordinatesConverter.convertViewRangeToModelRange(result.range);
    }
    if (result.type === 5 /* GUTTER_VIEW_ZONE */ || result.type === 8 /* CONTENT_VIEW_ZONE */) {
      result.detail = this.convertViewToModelViewZoneData(result.detail, coordinatesConverter);
    }
    return result;
  }
  static convertViewToModelViewZoneData(data, coordinatesConverter) {
    return {
      viewZoneId: data.viewZoneId,
      positionBefore: data.positionBefore ? coordinatesConverter.convertViewPositionToModelPosition(data.positionBefore) : data.positionBefore,
      positionAfter: data.positionAfter ? coordinatesConverter.convertViewPositionToModelPosition(data.positionAfter) : data.positionAfter,
      position: coordinatesConverter.convertViewPositionToModelPosition(data.position),
      afterLineNumber: coordinatesConverter.convertViewPositionToModelPosition(new Position(data.afterLineNumber, 1)).lineNumber
    };
  }
};
export { ViewUserInputEvents };
