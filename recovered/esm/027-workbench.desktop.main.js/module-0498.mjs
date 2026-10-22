// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/browser/widget/diffEditor/delegatingEditorImpl.ts
import { Disposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";


// src/vs/editor/browser/widget/diffEditor/delegatingEditorImpl.ts
var DelegatingEditor = class _DelegatingEditor extends Disposable {
  constructor() {
    super(...arguments);
    this._id = ++_DelegatingEditor.idCounter;
    this._onDidDispose = this._register(new Emitter());
    this.onDidDispose = this._onDidDispose.event;
  }
  static {
    this.idCounter = 0;
  }
  getId() {
    return this.getEditorType() + ":v2:" + this._id;
  }
  // #region editorBrowser.IDiffEditor: Delegating to modified Editor
  getVisibleColumnFromPosition(position2) {
    return this._targetEditor.getVisibleColumnFromPosition(position2);
  }
  getStatusbarColumn(position2) {
    return this._targetEditor.getStatusbarColumn(position2);
  }
  getPosition() {
    return this._targetEditor.getPosition();
  }
  setPosition(position2, source = "api") {
    this._targetEditor.setPosition(position2, source);
  }
  revealLine(lineNumber, scrollType = 0 /* Smooth */) {
    this._targetEditor.revealLine(lineNumber, scrollType);
  }
  revealLineInCenter(lineNumber, scrollType = 0 /* Smooth */) {
    this._targetEditor.revealLineInCenter(lineNumber, scrollType);
  }
  revealLineInCenterIfOutsideViewport(lineNumber, scrollType = 0 /* Smooth */) {
    this._targetEditor.revealLineInCenterIfOutsideViewport(lineNumber, scrollType);
  }
  revealLineNearTop(lineNumber, scrollType = 0 /* Smooth */) {
    this._targetEditor.revealLineNearTop(lineNumber, scrollType);
  }
  revealPosition(position2, scrollType = 0 /* Smooth */) {
    this._targetEditor.revealPosition(position2, scrollType);
  }
  revealPositionInCenter(position2, scrollType = 0 /* Smooth */) {
    this._targetEditor.revealPositionInCenter(position2, scrollType);
  }
  revealPositionInCenterIfOutsideViewport(position2, scrollType = 0 /* Smooth */) {
    this._targetEditor.revealPositionInCenterIfOutsideViewport(position2, scrollType);
  }
  revealPositionNearTop(position2, scrollType = 0 /* Smooth */) {
    this._targetEditor.revealPositionNearTop(position2, scrollType);
  }
  getSelection() {
    return this._targetEditor.getSelection();
  }
  getSelections() {
    return this._targetEditor.getSelections();
  }
  setSelection(something, source = "api") {
    this._targetEditor.setSelection(something, source);
  }
  setSelections(ranges, source = "api") {
    this._targetEditor.setSelections(ranges, source);
  }
  revealLines(startLineNumber, endLineNumber, scrollType = 0 /* Smooth */) {
    this._targetEditor.revealLines(startLineNumber, endLineNumber, scrollType);
  }
  revealLinesInCenter(startLineNumber, endLineNumber, scrollType = 0 /* Smooth */) {
    this._targetEditor.revealLinesInCenter(startLineNumber, endLineNumber, scrollType);
  }
  revealLinesInCenterIfOutsideViewport(startLineNumber, endLineNumber, scrollType = 0 /* Smooth */) {
    this._targetEditor.revealLinesInCenterIfOutsideViewport(startLineNumber, endLineNumber, scrollType);
  }
  revealLinesNearTop(startLineNumber, endLineNumber, scrollType = 0 /* Smooth */) {
    this._targetEditor.revealLinesNearTop(startLineNumber, endLineNumber, scrollType);
  }
  revealRange(range2, scrollType = 0 /* Smooth */, revealVerticalInCenter = false, revealHorizontal = true) {
    this._targetEditor.revealRange(range2, scrollType, revealVerticalInCenter, revealHorizontal);
  }
  revealRangeInCenter(range2, scrollType = 0 /* Smooth */) {
    this._targetEditor.revealRangeInCenter(range2, scrollType);
  }
  revealRangeInCenterIfOutsideViewport(range2, scrollType = 0 /* Smooth */) {
    this._targetEditor.revealRangeInCenterIfOutsideViewport(range2, scrollType);
  }
  revealRangeNearTop(range2, scrollType = 0 /* Smooth */) {
    this._targetEditor.revealRangeNearTop(range2, scrollType);
  }
  revealRangeNearTopIfOutsideViewport(range2, scrollType = 0 /* Smooth */) {
    this._targetEditor.revealRangeNearTopIfOutsideViewport(range2, scrollType);
  }
  revealRangeAtTop(range2, scrollType = 0 /* Smooth */) {
    this._targetEditor.revealRangeAtTop(range2, scrollType);
  }
  getSupportedActions() {
    return this._targetEditor.getSupportedActions();
  }
  focus() {
    this._targetEditor.focus();
  }
  trigger(source, handlerId, payload) {
    this._targetEditor.trigger(source, handlerId, payload);
  }
  createDecorationsCollection(decorations) {
    return this._targetEditor.createDecorationsCollection(decorations);
  }
  changeDecorations(callback) {
    return this._targetEditor.changeDecorations(callback);
  }
  // #endregion
};
export { DelegatingEditor };
