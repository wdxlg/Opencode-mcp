// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/preferences/browser/keybindingsEditorContribution.ts
import { localize } from "./module-0001.mjs";
import { Disposable, MutableDisposable } from "./module-0012.mjs";
import { DefineKeybindingOverlayWidget } from "./module-1812.mjs";
import { SmartSnippetInserter } from "./module-1832.mjs";
import { SnippetController2 } from "./module-0714.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IUserDataProfileService } from "./module-0998.mjs";
import { RunOnceScheduler } from "./module-0036.mjs";
import { assertReturnsDefined } from "./module-0010.mjs";
import { parseTree } from "./module-0885.mjs";
import { WindowsNativeResolvedKeybinding } from "./module-1834.mjs";
import { KeybindingParser } from "./module-1606.mjs";
import { MarkdownString } from "./module-0462.mjs";
import { themeColorFromId2 } from "./module-0287.mjs";
import { overviewRulerError, overviewRulerInfo } from "./module-0288.mjs";
import { Range2 } from "./module-0106.mjs";
import { IKeybindingService } from "./module-0352.mjs";
import { isEqual2 } from "./module-0034.mjs";
import { registerEditorContribution } from "./module-0097.mjs";
import { DEFINE_KEYBINDING_EDITOR_CONTRIB_ID } from "./module-1293.mjs";


// src/vs/workbench/contrib/preferences/browser/keybindingsEditorContribution.ts
var NLS_KB_LAYOUT_ERROR_MESSAGE = localize(18090, null);

var DefineKeybindingEditorContribution = class extends Disposable {
  constructor(_editor, _instantiationService, _userDataProfileService) {
    super();
    this._editor = _editor;
    this._instantiationService = _instantiationService;
    this._userDataProfileService = _userDataProfileService;
    this._keybindingDecorationRenderer = this._register(new MutableDisposable());
    this._defineWidget = this._register(this._instantiationService.createInstance(DefineKeybindingOverlayWidget, this._editor));
    this._register(this._editor.onDidChangeModel((e4) => this._update()));
    this._update();
  }
  _update() {
    this._keybindingDecorationRenderer.value = isInterestingEditorModel(this._editor, this._userDataProfileService) ? this._instantiationService.createInstance(KeybindingEditorDecorationsRenderer, this._editor) : void 0;
  }
  showDefineKeybindingWidget() {
    if (isInterestingEditorModel(this._editor, this._userDataProfileService)) {
      this._defineWidget.start().then((keybinding) => this._onAccepted(keybinding));
    }
  }
  _onAccepted(keybinding) {
    this._editor.focus();
    if (keybinding && this._editor.hasModel()) {
      const regexp2 = new RegExp(/\\/g);
      const backslash = regexp2.test(keybinding);
      if (backslash) {
        keybinding = keybinding.slice(0, -1) + "\\\\";
      }
      let snippetText = [
        "{",
        '	"key": ' + JSON.stringify(keybinding) + ",",
        '	"command": "${1:commandId}",',
        '	"when": "${2:editorTextFocus}"',
        "}$0"
      ].join("\n");
      const smartInsertInfo = SmartSnippetInserter.insertSnippet(this._editor.getModel(), this._editor.getPosition());
      snippetText = smartInsertInfo.prepend + snippetText + smartInsertInfo.append;
      this._editor.setPosition(smartInsertInfo.position);
      SnippetController2.get(this._editor)?.insert(snippetText, { overwriteBefore: 0, overwriteAfter: 0 });
    }
  }
};

DefineKeybindingEditorContribution = __decorateClass([
  __decorateParam(1, IInstantiationService),
  __decorateParam(2, IUserDataProfileService)
], DefineKeybindingEditorContribution);

var KeybindingEditorDecorationsRenderer = class extends Disposable {
  constructor(_editor, _keybindingService) {
    super();
    this._editor = _editor;
    this._keybindingService = _keybindingService;
    this._dec = this._editor.createDecorationsCollection();
    this._updateDecorations = this._register(new RunOnceScheduler(() => this._updateDecorationsNow(), 500));
    const model = assertReturnsDefined(this._editor.getModel());
    this._register(model.onDidChangeContent(() => this._updateDecorations.schedule()));
    this._register(this._keybindingService.onDidUpdateKeybindings(() => this._updateDecorations.schedule()));
    this._register({
      dispose: () => {
        this._dec.clear();
        this._updateDecorations.cancel();
      }
    });
    this._updateDecorations.schedule();
  }
  _updateDecorationsNow() {
    const model = assertReturnsDefined(this._editor.getModel());
    const newDecorations = [];
    const root = parseTree(model.getValue());
    if (root && Array.isArray(root.children)) {
      for (let i2 = 0, len = root.children.length; i2 < len; i2++) {
        const entry = root.children[i2];
        const dec = this._getDecorationForEntry(model, entry);
        if (dec !== null) {
          newDecorations.push(dec);
        }
      }
    }
    this._dec.set(newDecorations);
  }
  _getDecorationForEntry(model, entry) {
    if (!Array.isArray(entry.children)) {
      return null;
    }
    for (let i2 = 0, len = entry.children.length; i2 < len; i2++) {
      const prop = entry.children[i2];
      if (prop.type !== "property") {
        continue;
      }
      if (!Array.isArray(prop.children) || prop.children.length !== 2) {
        continue;
      }
      const key3 = prop.children[0];
      if (key3.value !== "key") {
        continue;
      }
      const value2 = prop.children[1];
      if (value2.type !== "string") {
        continue;
      }
      const resolvedKeybindings = this._keybindingService.resolveUserBinding(value2.value);
      if (resolvedKeybindings.length === 0) {
        return this._createDecoration(true, null, null, model, value2);
      }
      const resolvedKeybinding = resolvedKeybindings[0];
      let usLabel = null;
      if (resolvedKeybinding instanceof WindowsNativeResolvedKeybinding) {
        usLabel = resolvedKeybinding.getUSLabel();
      }
      if (!resolvedKeybinding.isWYSIWYG()) {
        const uiLabel = resolvedKeybinding.getLabel();
        if (typeof uiLabel === "string" && value2.value.toLowerCase() === uiLabel.toLowerCase()) {
          return null;
        }
        return this._createDecoration(false, resolvedKeybinding.getLabel(), usLabel, model, value2);
      }
      if (/abnt_|oem_/.test(value2.value)) {
        return this._createDecoration(false, resolvedKeybinding.getLabel(), usLabel, model, value2);
      }
      const expectedUserSettingsLabel = resolvedKeybinding.getUserSettingsLabel();
      if (typeof expectedUserSettingsLabel === "string" && !KeybindingEditorDecorationsRenderer._userSettingsFuzzyEquals(value2.value, expectedUserSettingsLabel)) {
        return this._createDecoration(false, resolvedKeybinding.getLabel(), usLabel, model, value2);
      }
      return null;
    }
    return null;
  }
  static _userSettingsFuzzyEquals(a, b) {
    a = a.trim().toLowerCase();
    b = b.trim().toLowerCase();
    if (a === b) {
      return true;
    }
    const aKeybinding = KeybindingParser.parseKeybinding(a);
    const bKeybinding = KeybindingParser.parseKeybinding(b);
    if (aKeybinding === null && bKeybinding === null) {
      return true;
    }
    if (!aKeybinding || !bKeybinding) {
      return false;
    }
    return aKeybinding.equals(bKeybinding);
  }
  _createDecoration(isError, uiLabel, usLabel, model, keyNode) {
    let msg;
    let className2;
    let overviewRulerColor;
    if (isError) {
      msg = new MarkdownString().appendText(NLS_KB_LAYOUT_ERROR_MESSAGE);
      className2 = "keybindingError";
      overviewRulerColor = themeColorFromId2(overviewRulerError);
    } else {
      if (usLabel && uiLabel !== usLabel) {
        msg = new MarkdownString(
          localize(18091, null, uiLabel, usLabel)
        );
      } else {
        msg = new MarkdownString(
          localize(18092, null, uiLabel)
        );
      }
      className2 = "keybindingInfo";
      overviewRulerColor = themeColorFromId2(overviewRulerInfo);
    }
    const startPosition = model.getPositionAt(keyNode.offset);
    const endPosition = model.getPositionAt(keyNode.offset + keyNode.length);
    const range2 = new Range2(
      startPosition.lineNumber,
      startPosition.column,
      endPosition.lineNumber,
      endPosition.column
    );
    return {
      range: range2,
      options: {
        description: "keybindings-widget",
        stickiness: 1 /* NeverGrowsWhenTypingAtEdges */,
        className: className2,
        hoverMessage: msg,
        overviewRuler: {
          color: overviewRulerColor,
          position: 4 /* Right */
        }
      }
    };
  }
};

KeybindingEditorDecorationsRenderer = __decorateClass([
  __decorateParam(1, IKeybindingService)
], KeybindingEditorDecorationsRenderer);

function isInterestingEditorModel(editor, userDataProfileService) {
  const model = editor.getModel();
  if (!model) {
    return false;
  }
  return isEqual2(model.uri, userDataProfileService.currentProfile.keybindingsResource);
}

registerEditorContribution(DEFINE_KEYBINDING_EDITOR_CONTRIB_ID, DefineKeybindingEditorContribution, 1 /* AfterFirstRender */);
export { isInterestingEditorModel, NLS_KB_LAYOUT_ERROR_MESSAGE, DefineKeybindingEditorContribution, KeybindingEditorDecorationsRenderer };
