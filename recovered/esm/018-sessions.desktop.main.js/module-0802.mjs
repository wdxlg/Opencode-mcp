// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/contrib/gotoSymbol/browser/link/goToDefinitionAtPosition.ts
import { DisposableStore } from "./module-0012.mjs";
import { ClickLinkGesture } from "./module-0619.mjs";
import { onUnexpectedError } from "./module-0004.mjs";
import { EditorState } from "./module-0539.mjs";
import { createCancelablePromise } from "./module-0036.mjs";
import { Range2 } from "./module-0106.mjs";
import { MarkdownString } from "./module-0462.mjs";
import { localize } from "./module-0001.mjs";
import { ModelDecorationInjectedTextOptions } from "./module-0423.mjs";
import { getDefinitionsAtPosition } from "./module-0646.mjs";
import { DefinitionAction } from "./module-0647.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { PeekContext } from "./module-0623.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ITextModelService } from "./module-0081.mjs";
import { ILanguageService } from "./module-0133.mjs";
import { ILanguageFeaturesService } from "./module-0205.mjs";
import { registerEditorContribution } from "./module-0097.mjs";


// src/vs/editor/contrib/gotoSymbol/browser/link/goToDefinitionAtPosition.ts
var GotoDefinitionAtPositionEditorContribution = class {
  constructor(editor, textModelResolverService, languageService, languageFeaturesService) {
    this.textModelResolverService = textModelResolverService;
    this.languageService = languageService;
    this.languageFeaturesService = languageFeaturesService;
    this.toUnhook = new DisposableStore();
    this.toUnhookForKeyboard = new DisposableStore();
    this.currentWordAtPosition = null;
    this.previousPromise = null;
    this.editor = editor;
    this.linkDecorations = this.editor.createDecorationsCollection();
    const linkGesture = new ClickLinkGesture(editor);
    this.toUnhook.add(linkGesture);
    this.toUnhook.add(linkGesture.onMouseMoveOrRelevantKeyDown(([mouseEvent, keyboardEvent]) => {
      this.startFindDefinitionFromMouse(mouseEvent, keyboardEvent ?? void 0);
    }));
    this.toUnhook.add(linkGesture.onExecute((mouseEvent) => {
      if (this.isEnabled(mouseEvent)) {
        this.gotoDefinition(mouseEvent.target.position, mouseEvent.hasSideBySideModifier).catch((error) => {
          onUnexpectedError(error);
        }).finally(() => {
          this.removeLinkDecorations();
        });
      }
    }));
    this.toUnhook.add(linkGesture.onCancel(() => {
      this.removeLinkDecorations();
      this.currentWordAtPosition = null;
    }));
  }
  static {
    this.ID = "editor.contrib.gotodefinitionatposition";
  }
  static {
    this.MAX_SOURCE_PREVIEW_LINES = 8;
  }
  static get(editor) {
    return editor.getContribution(GotoDefinitionAtPositionEditorContribution.ID);
  }
  async startFindDefinitionFromCursor(position2) {
    await this.startFindDefinition(position2);
    this.toUnhookForKeyboard.add(this.editor.onDidChangeCursorPosition(() => {
      this.currentWordAtPosition = null;
      this.removeLinkDecorations();
      this.toUnhookForKeyboard.clear();
    }));
    this.toUnhookForKeyboard.add(this.editor.onKeyDown((e4) => {
      if (e4) {
        this.currentWordAtPosition = null;
        this.removeLinkDecorations();
        this.toUnhookForKeyboard.clear();
      }
    }));
  }
  startFindDefinitionFromMouse(mouseEvent, withKey) {
    if (mouseEvent.target.type === 9 /* CONTENT_WIDGET */ && this.linkDecorations.length > 0) {
      return;
    }
    if (!this.editor.hasModel() || !this.isEnabled(mouseEvent, withKey)) {
      this.currentWordAtPosition = null;
      this.removeLinkDecorations();
      return;
    }
    const position2 = mouseEvent.target.position;
    this.startFindDefinition(position2);
  }
  async startFindDefinition(position2) {
    this.toUnhookForKeyboard.clear();
    const word = position2 ? this.editor.getModel()?.getWordAtPosition(position2) : null;
    if (!word) {
      this.currentWordAtPosition = null;
      this.removeLinkDecorations();
      return;
    }
    if (this.currentWordAtPosition && this.currentWordAtPosition.startColumn === word.startColumn && this.currentWordAtPosition.endColumn === word.endColumn && this.currentWordAtPosition.word === word.word) {
      return;
    }
    this.currentWordAtPosition = word;
    const state = new EditorState(this.editor, 4 /* Position */ | 1 /* Value */ | 2 /* Selection */ | 8 /* Scroll */);
    if (this.previousPromise) {
      this.previousPromise.cancel();
      this.previousPromise = null;
    }
    this.previousPromise = createCancelablePromise((token) => this.findDefinition(position2, token));
    let results;
    try {
      results = await this.previousPromise;
    } catch (error) {
      onUnexpectedError(error);
      return;
    }
    if (!results || !results.length || !state.validate(this.editor)) {
      this.removeLinkDecorations();
      return;
    }
    const linkRange = results[0].originSelectionRange ? Range2.lift(results[0].originSelectionRange) : new Range2(position2.lineNumber, word.startColumn, position2.lineNumber, word.endColumn);
    if (results.length > 1) {
      let combinedRange = linkRange;
      for (const { originSelectionRange } of results) {
        if (originSelectionRange) {
          combinedRange = Range2.plusRange(combinedRange, originSelectionRange);
        }
      }
      this.addDecoration(
        combinedRange,
        new MarkdownString().appendText(localize(1252, null, results.length))
      );
    } else {
      const result = results[0];
      if (!result.uri) {
        return;
      }
      return this.textModelResolverService.createModelReference(result.uri).then((ref) => {
        if (!ref.object || !ref.object.textEditorModel) {
          ref.dispose();
          return;
        }
        const { object: { textEditorModel } } = ref;
        const { startLineNumber } = result.range;
        if (startLineNumber < 1 || startLineNumber > textEditorModel.getLineCount()) {
          ref.dispose();
          return;
        }
        const previewValue = this.getPreviewValue(textEditorModel, startLineNumber, result);
        const languageId = this.languageService.guessLanguageIdByFilepathOrFirstLine(textEditorModel.uri);
        this.addDecoration(
          linkRange,
          previewValue ? new MarkdownString().appendCodeblock(languageId ? languageId : "", previewValue) : void 0
        );
        ref.dispose();
      });
    }
  }
  getPreviewValue(textEditorModel, startLineNumber, result) {
    let rangeToUse = result.range;
    const numberOfLinesInRange = rangeToUse.endLineNumber - rangeToUse.startLineNumber;
    if (numberOfLinesInRange >= GotoDefinitionAtPositionEditorContribution.MAX_SOURCE_PREVIEW_LINES) {
      rangeToUse = this.getPreviewRangeBasedOnIndentation(textEditorModel, startLineNumber);
    }
    rangeToUse = textEditorModel.validateRange(rangeToUse);
    const previewValue = this.stripIndentationFromPreviewRange(textEditorModel, startLineNumber, rangeToUse);
    return previewValue;
  }
  stripIndentationFromPreviewRange(textEditorModel, startLineNumber, previewRange) {
    const startIndent = textEditorModel.getLineFirstNonWhitespaceColumn(startLineNumber);
    let minIndent = startIndent;
    for (let endLineNumber = startLineNumber + 1; endLineNumber < previewRange.endLineNumber; endLineNumber++) {
      const endIndent = textEditorModel.getLineFirstNonWhitespaceColumn(endLineNumber);
      minIndent = Math.min(minIndent, endIndent);
    }
    const previewValue = textEditorModel.getValueInRange(previewRange).replace(new RegExp(`^\\s{${minIndent - 1}}`, "gm"), "").trim();
    return previewValue;
  }
  getPreviewRangeBasedOnIndentation(textEditorModel, startLineNumber) {
    const startIndent = textEditorModel.getLineFirstNonWhitespaceColumn(startLineNumber);
    const maxLineNumber = Math.min(textEditorModel.getLineCount(), startLineNumber + GotoDefinitionAtPositionEditorContribution.MAX_SOURCE_PREVIEW_LINES);
    let endLineNumber = startLineNumber + 1;
    for (; endLineNumber < maxLineNumber; endLineNumber++) {
      const endIndent = textEditorModel.getLineFirstNonWhitespaceColumn(endLineNumber);
      if (startIndent === endIndent) {
        break;
      }
    }
    return new Range2(startLineNumber, 1, endLineNumber + 1, 1);
  }
  addDecoration(range2, hoverMessage) {
    const newDecorations = {
      range: range2,
      options: {
        description: "goto-definition-link",
        inlineClassName: "goto-definition-link",
        hoverMessage
      }
    };
    this.linkDecorations.set([newDecorations]);
  }
  removeLinkDecorations() {
    this.linkDecorations.clear();
  }
  isEnabled(mouseEvent, withKey) {
    return this.editor.hasModel() && mouseEvent.isLeftClick && mouseEvent.isNoneOrSingleMouseDown && mouseEvent.target.type === 6 /* CONTENT_TEXT */ && !(mouseEvent.target.detail.injectedText?.options instanceof ModelDecorationInjectedTextOptions) && (mouseEvent.hasTriggerModifier || (withKey ? withKey.keyCodeIsTriggerKey : false)) && this.languageFeaturesService.definitionProvider.has(this.editor.getModel());
  }
  findDefinition(position2, token) {
    const model = this.editor.getModel();
    if (!model) {
      return Promise.resolve(null);
    }
    return getDefinitionsAtPosition(this.languageFeaturesService.definitionProvider, model, position2, false, token);
  }
  async gotoDefinition(position2, openToSide) {
    this.editor.setPosition(position2);
    return this.editor.invokeWithinContext((accessor) => {
      const canPeek = !openToSide && this.editor.getOption(101 /* definitionLinkOpensInPeek */) && !this.isInPeekEditor(accessor);
      const action = new DefinitionAction({ openToSide, openInPeek: canPeek, muteMessage: true }, { title: { value: "", original: "" }, id: "", precondition: void 0 });
      return action.run(accessor);
    });
  }
  isInPeekEditor(accessor) {
    const contextKeyService = accessor.get(IContextKeyService);
    return PeekContext.inPeekEditor.getValue(contextKeyService);
  }
  dispose() {
    this.toUnhook.dispose();
    this.toUnhookForKeyboard.dispose();
  }
};

GotoDefinitionAtPositionEditorContribution = __decorateClass([
  __decorateParam(1, ITextModelService),
  __decorateParam(2, ILanguageService),
  __decorateParam(3, ILanguageFeaturesService)
], GotoDefinitionAtPositionEditorContribution);

registerEditorContribution(GotoDefinitionAtPositionEditorContribution.ID, GotoDefinitionAtPositionEditorContribution, 2 /* BeforeFirstInteraction */);
export { GotoDefinitionAtPositionEditorContribution };
