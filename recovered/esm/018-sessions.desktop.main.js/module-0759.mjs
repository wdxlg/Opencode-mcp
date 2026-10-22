// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/contrib/inlineCompletions/browser/model/suggestWidgetAdapter.ts
import { Disposable } from "./module-0012.mjs";
import { Emitter, Event2 } from "./module-0017.mjs";
import { SuggestController } from "./module-0758.mjs";
import { singleTextEditAugments, singleTextRemoveCommonPrefix } from "./module-0719.mjs";
import { Position } from "./module-0079.mjs";
import { findFirstMax } from "./module-0006.mjs";
import { compareBy, numberComparator } from "./module-0007.mjs";
import { SnippetParser } from "./module-0544.mjs";
import { SnippetSession } from "./module-0713.mjs";
import { Range2 } from "./module-0106.mjs";
import { SelectedSuggestionInfo } from "./module-0164.mjs";
import { TextReplacement } from "./module-0178.mjs";
import { observableFromEvent } from "./module-0057.mjs";


// src/vs/editor/contrib/inlineCompletions/browser/model/suggestWidgetAdapter.ts
var SuggestWidgetAdaptor = class extends Disposable {
  constructor(editor, suggestControllerPreselector, onWillAccept) {
    super();
    this.editor = editor;
    this.suggestControllerPreselector = suggestControllerPreselector;
    this.onWillAccept = onWillAccept;
    this.isSuggestWidgetVisible = false;
    this.isShiftKeyPressed = false;
    this._isActive = false;
    this._currentSuggestItemInfo = void 0;
    this._onDidSelectedItemChange = this._register(new Emitter());
    this.onDidSelectedItemChange = this._onDidSelectedItemChange.event;
    this._register(editor.onKeyDown((e4) => {
      if (e4.shiftKey && !this.isShiftKeyPressed) {
        this.isShiftKeyPressed = true;
        this.update(this._isActive);
      }
    }));
    this._register(editor.onKeyUp((e4) => {
      if (e4.shiftKey && this.isShiftKeyPressed) {
        this.isShiftKeyPressed = false;
        this.update(this._isActive);
      }
    }));
    const suggestController = SuggestController.get(this.editor);
    if (suggestController) {
      this._register(suggestController.registerSelector({
        priority: 100,
        select: (model, pos, suggestItems) => {
          const textModel = this.editor.getModel();
          if (!textModel) {
            return -1;
          }
          const i2 = this.suggestControllerPreselector();
          const itemToPreselect = i2 ? singleTextRemoveCommonPrefix(i2, textModel) : void 0;
          if (!itemToPreselect) {
            return -1;
          }
          const position2 = Position.lift(pos);
          const candidates = suggestItems.map((suggestItem, index2) => {
            const suggestItemInfo = SuggestItemInfo.fromSuggestion(suggestController, textModel, position2, suggestItem, this.isShiftKeyPressed);
            const suggestItemTextEdit = singleTextRemoveCommonPrefix(suggestItemInfo.getSingleTextEdit(), textModel);
            const valid2 = singleTextEditAugments(itemToPreselect, suggestItemTextEdit);
            return { index: index2, valid: valid2, prefixLength: suggestItemTextEdit.text.length, suggestItem };
          }).filter((item) => item && item.valid && item.prefixLength > 0);
          const result = findFirstMax(
            candidates,
            compareBy((s) => s.prefixLength, numberComparator)
          );
          return result ? result.index : -1;
        }
      }));
      let isBoundToSuggestWidget = false;
      const bindToSuggestWidget = () => {
        if (isBoundToSuggestWidget) {
          return;
        }
        isBoundToSuggestWidget = true;
        this._register(suggestController.widget.value.onDidShow(() => {
          this.isSuggestWidgetVisible = true;
          this.update(true);
        }));
        this._register(suggestController.widget.value.onDidHide(() => {
          this.isSuggestWidgetVisible = false;
          this.update(false);
        }));
        this._register(suggestController.widget.value.onDidFocus(() => {
          this.isSuggestWidgetVisible = true;
          this.update(true);
        }));
      };
      this._register(Event2.once(suggestController.model.onDidTrigger)((e4) => {
        bindToSuggestWidget();
      }));
      this._register(suggestController.onWillInsertSuggestItem((e4) => {
        const position2 = this.editor.getPosition();
        const model = this.editor.getModel();
        if (!position2 || !model) {
          return void 0;
        }
        const suggestItemInfo = SuggestItemInfo.fromSuggestion(
          suggestController,
          model,
          position2,
          e4.item,
          this.isShiftKeyPressed
        );
        this.onWillAccept(suggestItemInfo);
      }));
    }
    this.update(this._isActive);
  }
  get selectedItem() {
    return this._currentSuggestItemInfo;
  }
  update(newActive) {
    const newInlineCompletion = this.getSuggestItemInfo();
    if (this._isActive !== newActive || !suggestItemInfoEquals(this._currentSuggestItemInfo, newInlineCompletion)) {
      this._isActive = newActive;
      this._currentSuggestItemInfo = newInlineCompletion;
      this._onDidSelectedItemChange.fire();
    }
  }
  getSuggestItemInfo() {
    const suggestController = SuggestController.get(this.editor);
    if (!suggestController || !this.isSuggestWidgetVisible) {
      return void 0;
    }
    const focusedItem = suggestController.widget.value.getFocusedItem();
    const position2 = this.editor.getPosition();
    const model = this.editor.getModel();
    if (!focusedItem || !position2 || !model) {
      return void 0;
    }
    return SuggestItemInfo.fromSuggestion(
      suggestController,
      model,
      position2,
      focusedItem.item,
      this.isShiftKeyPressed
    );
  }
  stopForceRenderingAbove() {
    const suggestController = SuggestController.get(this.editor);
    suggestController?.stopForceRenderingAbove();
  }
  forceRenderingAbove() {
    const suggestController = SuggestController.get(this.editor);
    suggestController?.forceRenderingAbove();
  }
};

var SuggestItemInfo = class _SuggestItemInfo {
  constructor(range2, insertText, completionItemKind, isSnippetText, listIncomplete) {
    this.range = range2;
    this.insertText = insertText;
    this.completionItemKind = completionItemKind;
    this.isSnippetText = isSnippetText;
    this.listIncomplete = listIncomplete;
  }
  static fromSuggestion(suggestController, model, position2, item, toggleMode) {
    let { insertText } = item.completion;
    let isSnippetText = false;
    if (item.completion.insertTextRules & 4 /* InsertAsSnippet */) {
      const snippet = new SnippetParser().parse(insertText);
      if (snippet.children.length < 100) {
        SnippetSession.adjustWhitespace(model, position2, true, snippet);
      }
      insertText = snippet.toString();
      isSnippetText = true;
    }
    const info = suggestController.getOverwriteInfo(item, toggleMode);
    return new _SuggestItemInfo(
      Range2.fromPositions(
        position2.delta(0, -info.overwriteBefore),
        position2.delta(0, Math.max(info.overwriteAfter, 0))
      ),
      insertText,
      item.completion.kind,
      isSnippetText,
      item.container.incomplete ?? false
    );
  }
  equals(other) {
    return this.range.equalsRange(other.range) && this.insertText === other.insertText && this.completionItemKind === other.completionItemKind && this.isSnippetText === other.isSnippetText;
  }
  toSelectedSuggestionInfo() {
    return new SelectedSuggestionInfo(this.range, this.insertText, this.completionItemKind, this.isSnippetText);
  }
  getSingleTextEdit() {
    return new TextReplacement(this.range, this.insertText);
  }
};

function suggestItemInfoEquals(a, b) {
  if (a === b) {
    return true;
  }
  if (!a || !b) {
    return false;
  }
  return a.equals(b);
}

var ObservableSuggestWidgetAdapter = class extends Disposable {
  constructor(_editorObs, _handleSuggestAccepted, _suggestControllerPreselector) {
    super();
    this._editorObs = _editorObs;
    this._handleSuggestAccepted = _handleSuggestAccepted;
    this._suggestControllerPreselector = _suggestControllerPreselector;
    this._suggestWidgetAdaptor = this._register(new SuggestWidgetAdaptor(
      this._editorObs.editor,
      () => {
        this._editorObs.forceUpdate();
        return this._suggestControllerPreselector();
      },
      (item) => this._editorObs.forceUpdate((_tx) => {
        this._handleSuggestAccepted(item);
      })
    ));
    this.selectedItem = observableFromEvent(this, (cb) => this._suggestWidgetAdaptor.onDidSelectedItemChange(() => {
      this._editorObs.forceUpdate((_tx) => cb(void 0));
    }), () => this._suggestWidgetAdaptor.selectedItem);
  }
  stopForceRenderingAbove() {
    this._suggestWidgetAdaptor.stopForceRenderingAbove();
  }
  forceRenderingAbove() {
    this._suggestWidgetAdaptor.forceRenderingAbove();
  }
};
export { suggestItemInfoEquals, SuggestWidgetAdaptor, SuggestItemInfo, ObservableSuggestWidgetAdapter };
