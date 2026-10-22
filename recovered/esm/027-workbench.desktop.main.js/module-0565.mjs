// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/contrib/codeAction/browser/lightBulbWidget.ts
import { registerIcon } from "./module-0479.mjs";
import { Codicon } from "./module-0085.mjs";
import { localize } from "./module-0001.mjs";
import { Disposable } from "./module-0012.mjs";
import { Emitter, Event2 } from "./module-0017.mjs";
import { observableValue } from "./module-0048.mjs";
import { derived } from "./module-0054.mjs";
import { $, addDisposableListener, addStandardDisposableGenericMouseDownListener, getDomNodePagePosition } from "./module-0075.mjs";
import { Gesture } from "./module-0251.mjs";
import { autoFixCommandId, quickFixCommandId } from "./module-0559.mjs";
import { autorun } from "./module-0052.mjs";
import { ModelDecorationOptions } from "./module-0423.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { computeIndentLevel } from "./module-0294.mjs";
import { Range2 } from "./module-0106.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IKeybindingService } from "./module-0352.mjs";


// src/vs/editor/contrib/codeAction/browser/lightBulbWidget.ts
var GUTTER_LIGHTBULB_ICON = registerIcon("gutter-lightbulb", Codicon.lightBulb, localize(1054, null));

var GUTTER_LIGHTBULB_AUTO_FIX_ICON = registerIcon("gutter-lightbulb-auto-fix", Codicon.lightbulbAutofix, localize(1052, null));

var GUTTER_LIGHTBULB_AIFIX_ICON = registerIcon("gutter-lightbulb-sparkle", Codicon.lightbulbSparkle, localize(1051, null));

var GUTTER_LIGHTBULB_AIFIX_AUTO_FIX_ICON = registerIcon("gutter-lightbulb-aifix-auto-fix", Codicon.lightbulbSparkleAutofix, localize(1050, null));

var GUTTER_SPARKLE_FILLED_ICON = registerIcon("gutter-lightbulb-sparkle-filled", Codicon.sparkleFilled, localize(1053, null));

var LightBulbState;

((LightBulbState2) => {
  let Type3;
  ((Type4) => {
    Type4[Type4["Hidden"] = 0] = "Hidden";
    Type4[Type4["Showing"] = 1] = "Showing";
  })(Type3 = LightBulbState2.Type || (LightBulbState2.Type = {}));
  LightBulbState2.Hidden = { type: 0 /* Hidden */ };
  class Showing {
    constructor(actions, trigger, editorPosition, widgetPosition) {
      this.actions = actions;
      this.trigger = trigger;
      this.editorPosition = editorPosition;
      this.widgetPosition = widgetPosition;
      this.type = 1 /* Showing */;
    }
  }
  LightBulbState2.Showing = Showing;
})(LightBulbState || (LightBulbState = {}));

function computeLightBulbInfo(actions, trigger, preferredKbLabel, quickFixKbLabel, forGutter = false) {
  if (actions.validActions.length <= 0) {
    return void 0;
  }
  let icon2;
  let autoRun = false;
  if (actions.allAIFixes) {
    icon2 = forGutter ? GUTTER_SPARKLE_FILLED_ICON : Codicon.sparkleFilled;
    if (actions.validActions.length === 1) {
      autoRun = true;
    }
  } else if (actions.hasAutoFix) {
    if (actions.hasAIFix) {
      icon2 = forGutter ? GUTTER_LIGHTBULB_AIFIX_AUTO_FIX_ICON : Codicon.lightbulbSparkleAutofix;
    } else {
      icon2 = forGutter ? GUTTER_LIGHTBULB_AUTO_FIX_ICON : Codicon.lightbulbAutofix;
    }
  } else if (actions.hasAIFix) {
    icon2 = forGutter ? GUTTER_LIGHTBULB_AIFIX_ICON : Codicon.lightbulbSparkle;
  } else {
    icon2 = forGutter ? GUTTER_LIGHTBULB_ICON : Codicon.lightBulb;
  }
  let title;
  if (autoRun) {
    title = localize(1048, null, actions.validActions[0].action.title);
  } else if (actions.hasAutoFix && preferredKbLabel) {
    title = localize(1055, null, preferredKbLabel);
  } else if (!actions.hasAutoFix && quickFixKbLabel) {
    title = localize(1049, null, quickFixKbLabel);
  } else {
    title = localize(1047, null);
  }
  return { actions, trigger, icon: icon2, autoRun, title, isGutter: forGutter };
}

var LightBulbWidget = class extends Disposable {
  constructor(_editor, _keybindingService) {
    super();
    this._editor = _editor;
    this._keybindingService = _keybindingService;
    this.onlyWithEmptySelection = false;
    this._onClick = this._register(new Emitter());
    this.onClick = this._onClick.event;
    this._state = observableValue(this, LightBulbState.Hidden);
    this._gutterState = observableValue(this, LightBulbState.Hidden);
    this._combinedInfo = derived(this, (reader) => {
      const gutterState = this._gutterState.read(reader);
      if (gutterState.type === 1 /* Showing */) {
        return LightBulbWidget._computeLightBulbInfo(gutterState, true, this._preferredKbLabel.read(reader), this._quickFixKbLabel.read(reader));
      }
      const state = this._state.read(reader);
      if (state.type === 1 /* Showing */) {
        return LightBulbWidget._computeLightBulbInfo(state, false, this._preferredKbLabel.read(reader), this._quickFixKbLabel.read(reader));
      }
      return void 0;
    });
    this.lightBulbInfo = this._combinedInfo;
    this._iconClasses = [];
    this.lightbulbClasses = [
      "codicon-" + GUTTER_LIGHTBULB_ICON.id,
      "codicon-" + GUTTER_LIGHTBULB_AIFIX_AUTO_FIX_ICON.id,
      "codicon-" + GUTTER_LIGHTBULB_AUTO_FIX_ICON.id,
      "codicon-" + GUTTER_LIGHTBULB_AIFIX_ICON.id,
      "codicon-" + GUTTER_SPARKLE_FILLED_ICON.id
    ];
    this._preferredKbLabel = observableValue(this, void 0);
    this._quickFixKbLabel = observableValue(this, void 0);
    this.gutterDecoration = LightBulbWidget.GUTTER_DECORATION;
    this._domNode = $("div.lightBulbWidget");
    this._domNode.role = "listbox";
    this._register(Gesture.ignoreTarget(this._domNode));
    this._editor.addContentWidget(this);
    this._register(this._editor.onDidChangeModelContent((_) => {
      const editorModel = this._editor.getModel();
      const state = this._state.get();
      if (state.type !== 1 /* Showing */ || !editorModel || state.editorPosition.lineNumber >= editorModel.getLineCount()) {
        this.hide();
      }
      const gutterState = this._gutterState.get();
      if (gutterState.type !== 1 /* Showing */ || !editorModel || gutterState.editorPosition.lineNumber >= editorModel.getLineCount()) {
        this.gutterHide();
      }
    }));
    this._register(addStandardDisposableGenericMouseDownListener(this._domNode, (e) => {
      const state = this._state.get();
      if (state.type !== 1 /* Showing */) {
        return;
      }
      this._editor.focus();
      e.preventDefault();
      const { top: top2, height } = getDomNodePagePosition(this._domNode);
      const lineHeight = this._editor.getOption(75 /* lineHeight */);
      let pad = Math.floor(lineHeight / 3);
      if (state.widgetPosition.position !== null && state.widgetPosition.position.lineNumber < state.editorPosition.lineNumber) {
        pad += lineHeight;
      }
      this._onClick.fire({
        x: e.posx,
        y: top2 + height + pad,
        actions: state.actions,
        trigger: state.trigger
      });
    }));
    this._register(addDisposableListener(this._domNode, "mouseenter", (e) => {
      if ((e.buttons & 1) !== 1) {
        return;
      }
      this.hide();
    }));
    this._register(Event2.runAndSubscribe(this._keybindingService.onDidUpdateKeybindings, () => {
      this._preferredKbLabel.set(this._keybindingService.lookupKeybinding(autoFixCommandId)?.getLabel() ?? void 0, void 0);
      this._quickFixKbLabel.set(this._keybindingService.lookupKeybinding(quickFixCommandId)?.getLabel() ?? void 0, void 0);
    }));
    this._register(autorun((reader) => {
      const info = this._combinedInfo.read(reader);
      this._updateLightBulbTitleAndIcon(info);
      this._updateGutterDecorationOptions(info);
    }));
    this._register(this._editor.onMouseDown(async (e) => {
      if (!e.target.element || !this.lightbulbClasses.some((cls) => e.target.element && e.target.element.classList.contains(cls))) {
        return;
      }
      const gutterState = this._gutterState.get();
      if (gutterState.type !== 1 /* Showing */) {
        return;
      }
      this._editor.focus();
      const { top: top2, height } = getDomNodePagePosition(e.target.element);
      const lineHeight = this._editor.getOption(75 /* lineHeight */);
      let pad = Math.floor(lineHeight / 3);
      if (gutterState.widgetPosition.position !== null && gutterState.widgetPosition.position.lineNumber < gutterState.editorPosition.lineNumber) {
        pad += lineHeight;
      }
      this._onClick.fire({
        x: e.event.posx,
        y: top2 + height + pad,
        actions: gutterState.actions,
        trigger: gutterState.trigger
      });
    }));
  }
  static {
    this.GUTTER_DECORATION = ModelDecorationOptions.register({
      description: "codicon-gutter-lightbulb-decoration",
      glyphMarginClassName: ThemeIcon.asClassName(Codicon.lightBulb),
      glyphMargin: { position: 1 /* Left */ },
      stickiness: 1 /* NeverGrowsWhenTypingAtEdges */
    });
  }
  static {
    this.ID = "editor.contrib.lightbulbWidget";
  }
  static {
    this._posPref = [0 /* EXACT */];
  }
  static _computeLightBulbInfo(state, forGutter, preferredKbLabel, quickFixKbLabel) {
    if (state.type !== 1 /* Showing */) {
      return void 0;
    }
    return computeLightBulbInfo(state.actions, state.trigger, preferredKbLabel, quickFixKbLabel, forGutter);
  }
  dispose() {
    super.dispose();
    this._editor.removeContentWidget(this);
    if (this._gutterDecorationID) {
      this._removeGutterDecoration(this._gutterDecorationID);
    }
  }
  getId() {
    return "LightBulbWidget";
  }
  getDomNode() {
    return this._domNode;
  }
  getPosition() {
    const state = this._state.get();
    return state.type === 1 /* Showing */ ? state.widgetPosition : null;
  }
  update(actions, trigger, atPosition) {
    if (actions.validActions.length <= 0) {
      this.gutterHide();
      return this.hide();
    }
    if (this.onlyWithEmptySelection && !this._editor.getSelection()?.isEmpty()) {
      this.gutterHide();
      return this.hide();
    }
    const hasTextFocus = this._editor.hasTextFocus();
    if (!hasTextFocus) {
      this.gutterHide();
      return this.hide();
    }
    const options3 = this._editor.getOptions();
    if (options3.get(73 /* lightbulb */).enabled === "off" /* Off */) {
      this.gutterHide();
      return this.hide();
    }
    const model = this._editor.getModel();
    if (!model) {
      this.gutterHide();
      return this.hide();
    }
    const { lineNumber, column } = model.validatePosition(atPosition);
    const tabSize = model.getOptions().tabSize;
    const fontInfo = this._editor.getOptions().get(59 /* fontInfo */);
    const lineContent = model.getLineContent(lineNumber);
    const indent = computeIndentLevel(lineContent, tabSize);
    const lineHasSpace = fontInfo.spaceWidth * indent > 22;
    const isFolded = (lineNumber2) => {
      return lineNumber2 > 2 && this._editor.getTopForLineNumber(lineNumber2) === this._editor.getTopForLineNumber(lineNumber2 - 1);
    };
    const currLineDecorations = this._editor.getLineDecorations(lineNumber);
    let hasDecoration = false;
    if (currLineDecorations) {
      for (const decoration3 of currLineDecorations) {
        const glyphClass = decoration3.options.glyphMarginClassName;
        if (glyphClass && !this.lightbulbClasses.some((className2) => glyphClass.includes(className2))) {
          hasDecoration = true;
          break;
        }
      }
    }
    let effectiveLineNumber = lineNumber;
    let effectiveColumnNumber = 1;
    if (!lineHasSpace) {
      const isLineEmptyOrIndented = (lineNumber2) => {
        const lineContent2 = model.getLineContent(lineNumber2);
        return /^\s*$|^\s+/.test(lineContent2) || lineContent2.length <= effectiveColumnNumber;
      };
      if (lineNumber > 1 && !isFolded(lineNumber - 1)) {
        const lineCount = model.getLineCount();
        const endLine = lineNumber === lineCount;
        const prevLineEmptyOrIndented = lineNumber > 1 && isLineEmptyOrIndented(lineNumber - 1);
        const nextLineEmptyOrIndented = !endLine && isLineEmptyOrIndented(lineNumber + 1);
        const currLineEmptyOrIndented = isLineEmptyOrIndented(lineNumber);
        const notEmpty = !nextLineEmptyOrIndented && !prevLineEmptyOrIndented;
        if (!nextLineEmptyOrIndented && !prevLineEmptyOrIndented && !hasDecoration) {
          this._gutterState.set(new LightBulbState.Showing(actions, trigger, atPosition, {
            position: { lineNumber: effectiveLineNumber, column: effectiveColumnNumber },
            preference: LightBulbWidget._posPref
          }), void 0);
          this.renderGutterLightbub();
          return this.hide();
        } else if (prevLineEmptyOrIndented || endLine || prevLineEmptyOrIndented && !currLineEmptyOrIndented) {
          effectiveLineNumber -= 1;
        } else if (nextLineEmptyOrIndented || notEmpty && currLineEmptyOrIndented) {
          effectiveLineNumber += 1;
        }
      } else if (lineNumber === 1 && (lineNumber === model.getLineCount() || !isLineEmptyOrIndented(lineNumber + 1) && !isLineEmptyOrIndented(lineNumber))) {
        this._gutterState.set(new LightBulbState.Showing(actions, trigger, atPosition, {
          position: { lineNumber: effectiveLineNumber, column: effectiveColumnNumber },
          preference: LightBulbWidget._posPref
        }), void 0);
        if (hasDecoration) {
          this.gutterHide();
        } else {
          this.renderGutterLightbub();
          return this.hide();
        }
      } else if (lineNumber < model.getLineCount() && !isFolded(lineNumber + 1)) {
        effectiveLineNumber += 1;
      } else if (column * fontInfo.spaceWidth < 22) {
        return this.hide();
      }
      effectiveColumnNumber = /^\S\s*$/.test(model.getLineContent(effectiveLineNumber)) ? 2 : 1;
    }
    this._state.set(new LightBulbState.Showing(actions, trigger, atPosition, {
      position: { lineNumber: effectiveLineNumber, column: effectiveColumnNumber },
      preference: LightBulbWidget._posPref
    }), void 0);
    if (this._gutterDecorationID) {
      this._removeGutterDecoration(this._gutterDecorationID);
      this.gutterHide();
    }
    const validActions = actions.validActions;
    const actionKind = actions.validActions[0].action.kind;
    if (validActions.length !== 1 || !actionKind) {
      this._editor.layoutContentWidget(this);
      return;
    }
    this._editor.layoutContentWidget(this);
  }
  hide() {
    if (this._state.get() === LightBulbState.Hidden) {
      return;
    }
    this._state.set(LightBulbState.Hidden, void 0);
    this._editor.layoutContentWidget(this);
  }
  gutterHide() {
    if (this._gutterState.get() === LightBulbState.Hidden) {
      return;
    }
    if (this._gutterDecorationID) {
      this._removeGutterDecoration(this._gutterDecorationID);
    }
    this._gutterState.set(LightBulbState.Hidden, void 0);
  }
  _updateLightBulbTitleAndIcon(info) {
    this._domNode.classList.remove(...this._iconClasses);
    this._iconClasses = [];
    if (!info || info.isGutter) {
      return;
    }
    this._domNode.title = info.title;
    this._iconClasses = ThemeIcon.asClassNameArray(info.icon);
    this._domNode.classList.add(...this._iconClasses);
  }
  _updateGutterDecorationOptions(info) {
    if (!info || !info.isGutter) {
      return;
    }
    this.gutterDecoration = ModelDecorationOptions.register({
      description: "codicon-gutter-lightbulb-decoration",
      glyphMarginClassName: ThemeIcon.asClassName(info.icon),
      glyphMargin: { position: 1 /* Left */ },
      stickiness: 1 /* NeverGrowsWhenTypingAtEdges */
    });
  }
  /* Gutter Helper Functions */
  renderGutterLightbub() {
    const selection = this._editor.getSelection();
    if (!selection) {
      return;
    }
    if (this._gutterDecorationID === void 0) {
      this._addGutterDecoration(selection.startLineNumber);
    } else {
      this._updateGutterDecoration(this._gutterDecorationID, selection.startLineNumber);
    }
  }
  _addGutterDecoration(lineNumber) {
    this._editor.changeDecorations((accessor) => {
      this._gutterDecorationID = accessor.addDecoration(new Range2(lineNumber, 0, lineNumber, 0), this.gutterDecoration);
    });
  }
  _removeGutterDecoration(decorationId) {
    this._editor.changeDecorations((accessor) => {
      accessor.removeDecoration(decorationId);
      this._gutterDecorationID = void 0;
    });
  }
  _updateGutterDecoration(decorationId, lineNumber) {
    this._editor.changeDecorations((accessor) => {
      accessor.changeDecoration(decorationId, new Range2(lineNumber, 0, lineNumber, 0));
      accessor.changeDecorationOptions(decorationId, this.gutterDecoration);
    });
  }
};

LightBulbWidget = __decorateClass([
  __decorateParam(1, IKeybindingService)
], LightBulbWidget);
export { computeLightBulbInfo, GUTTER_LIGHTBULB_ICON, GUTTER_LIGHTBULB_AUTO_FIX_ICON, GUTTER_LIGHTBULB_AIFIX_ICON, GUTTER_LIGHTBULB_AIFIX_AUTO_FIX_ICON, GUTTER_SPARKLE_FILLED_ICON, LightBulbState, LightBulbWidget };
