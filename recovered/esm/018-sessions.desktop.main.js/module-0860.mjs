// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/contrib/wordHighlighter/browser/wordHighlighter.ts
import { IContextKeyService, RawContextKey } from "./module-0089.mjs";
import { Delayer, createCancelablePromise, first } from "./module-0036.mjs";
import { onUnexpectedError, onUnexpectedExternalError } from "./module-0004.mjs";
import { ResourceMap } from "./module-0008.mjs";
import { shouldSynchronizeModel } from "./module-0117.mjs";
import { score2 } from "./module-0858.mjs";
import { Range2 } from "./module-0106.mjs";
import { EditorAction, registerEditorAction, registerEditorContribution, registerModelAndPositionCommand } from "./module-0097.mjs";
import { ILanguageFeaturesService } from "./module-0205.mjs";
import { CancellationToken } from "./module-0025.mjs";
import { Disposable, DisposableStore } from "./module-0012.mjs";
import { Schemas, matchesScheme } from "./module-0033.mjs";
import { alert } from "./module-0076.mjs";
import { isEqual2 } from "./module-0034.mjs";
import { isDiffEditor } from "./module-0223.mjs";
import { getHighlightDecorationOptions } from "./module-0826.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ITextModelService } from "./module-0081.mjs";
import { ICodeEditorService } from "./module-0078.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { ILogService } from "./module-0095.mjs";
import { localize2 } from "./module-0001.mjs";
import { EditorContextKeys } from "./module-0154.mjs";
import { registerEditorFeature } from "./module-0574.mjs";
import { TextualMultiDocumentHighlightFeature } from "./module-0859.mjs";


// src/vs/editor/contrib/wordHighlighter/browser/wordHighlighter.ts
var ctxHasWordHighlights = new RawContextKey("hasWordHighlights", false);

function getOccurrencesAtPosition(registry4, model, position2, token) {
  const orderedByScore = registry4.ordered(model);
  return first(orderedByScore.map((provider) => () => {
    return Promise.resolve(provider.provideDocumentHighlights(model, position2, token)).then(void 0, onUnexpectedExternalError);
  }), (result) => result !== void 0 && result !== null).then((result) => {
    if (result) {
      const map = new ResourceMap();
      map.set(model.uri, result);
      return map;
    }
    return new ResourceMap();
  });
}

function getOccurrencesAcrossMultipleModels(registry4, model, position2, token, otherModels) {
  const orderedByScore = registry4.ordered(model);
  return first(orderedByScore.map((provider) => () => {
    const filteredModels = otherModels.filter((otherModel) => {
      return shouldSynchronizeModel(otherModel);
    }).filter((otherModel) => {
      return score2(provider.selector, otherModel.uri, otherModel.getLanguageId(), true, void 0, void 0) > 0;
    });
    return Promise.resolve(provider.provideMultiDocumentHighlights(model, position2, filteredModels, token)).then(void 0, onUnexpectedExternalError);
  }), (result) => result !== void 0 && result !== null);
}

var OccurenceAtPositionRequest = class {
  constructor(_model, _selection, _wordSeparators) {
    this._model = _model;
    this._selection = _selection;
    this._wordSeparators = _wordSeparators;
    this._wordRange = this._getCurrentWordRange(_model, _selection);
    this._result = null;
  }
  get result() {
    if (!this._result) {
      this._result = createCancelablePromise((token) => this._compute(this._model, this._selection, this._wordSeparators, token));
    }
    return this._result;
  }
  _getCurrentWordRange(model, selection) {
    const word = model.getWordAtPosition(selection.getPosition());
    if (word) {
      return new Range2(selection.startLineNumber, word.startColumn, selection.startLineNumber, word.endColumn);
    }
    return null;
  }
  isValid(model, selection, decorations) {
    const lineNumber = selection.startLineNumber;
    const startColumn = selection.startColumn;
    const endColumn = selection.endColumn;
    const currentWordRange = this._getCurrentWordRange(model, selection);
    let requestIsValid = Boolean(this._wordRange && this._wordRange.equalsRange(currentWordRange));
    for (let i2 = 0, len = decorations.length; !requestIsValid && i2 < len; i2++) {
      const range2 = decorations.getRange(i2);
      if (range2 && range2.startLineNumber === lineNumber) {
        if (range2.startColumn <= startColumn && range2.endColumn >= endColumn) {
          requestIsValid = true;
        }
      }
    }
    return requestIsValid;
  }
  cancel() {
    this.result.cancel();
  }
};

var SemanticOccurenceAtPositionRequest = class extends OccurenceAtPositionRequest {
  constructor(model, selection, wordSeparators2, providers2) {
    super(model, selection, wordSeparators2);
    this._providers = providers2;
  }
  _compute(model, selection, wordSeparators2, token) {
    return getOccurrencesAtPosition(this._providers, model, selection.getPosition(), token).then((value2) => {
      if (!value2) {
        return new ResourceMap();
      }
      return value2;
    });
  }
};

var MultiModelOccurenceRequest = class extends OccurenceAtPositionRequest {
  constructor(model, selection, wordSeparators2, providers2, otherModels) {
    super(model, selection, wordSeparators2);
    this._providers = providers2;
    this._otherModels = otherModels;
  }
  _compute(model, selection, wordSeparators2, token) {
    return getOccurrencesAcrossMultipleModels(this._providers, model, selection.getPosition(), token, this._otherModels).then((value2) => {
      if (!value2) {
        return new ResourceMap();
      }
      return value2;
    });
  }
};

function computeOccurencesAtPosition(registry4, model, selection, wordSeparators2) {
  return new SemanticOccurenceAtPositionRequest(model, selection, wordSeparators2, registry4);
}

function computeOccurencesMultiModel(registry4, model, selection, wordSeparators2, otherModels) {
  return new MultiModelOccurenceRequest(model, selection, wordSeparators2, registry4, otherModels);
}

registerModelAndPositionCommand("_executeDocumentHighlights", async (accessor, model, position2) => {
  const languageFeaturesService = accessor.get(ILanguageFeaturesService);
  const map = await getOccurrencesAtPosition(languageFeaturesService.documentHighlightProvider, model, position2, CancellationToken.None);
  return map?.get(model.uri);
});

var WordHighlighter = class {
  constructor(editor, providers2, multiProviders, contextKeyService, textModelService, codeEditorService, configurationService, logService) {
    this.toUnhook = new DisposableStore();
    this.workerRequestTokenId = 0;
    this.workerRequestCompleted = false;
    this.workerRequestValue = new ResourceMap();
    this.lastCursorPositionChangeTime = 0;
    this.renderDecorationsTimer = void 0;
    this.runDelayer = this.toUnhook.add(new Delayer(50));
    this.editor = editor;
    this.providers = providers2;
    this.multiDocumentProviders = multiProviders;
    this.codeEditorService = codeEditorService;
    this.textModelService = textModelService;
    this.configurationService = configurationService;
    this.logService = logService;
    this._hasWordHighlights = ctxHasWordHighlights.bindTo(contextKeyService);
    this._ignorePositionChangeEvent = false;
    this.occurrencesHighlightEnablement = this.editor.getOption(90 /* occurrencesHighlight */);
    this.occurrencesHighlightDelay = this.configurationService.getValue("editor.occurrencesHighlightDelay");
    this.model = this.editor.getModel();
    this.toUnhook.add(editor.onDidChangeCursorPosition((e4) => {
      if (this._ignorePositionChangeEvent) {
        return;
      }
      if (this.occurrencesHighlightEnablement === "off") {
        return;
      }
      this.runDelayer.trigger(() => {
        this._onPositionChanged(e4);
      }).catch(onUnexpectedError);
    }));
    this.toUnhook.add(editor.onDidFocusEditorText((e4) => {
      if (this.occurrencesHighlightEnablement === "off") {
        return;
      }
      if (!this.workerRequest) {
        this.runDelayer.trigger(() => {
          this._run();
        }).catch(onUnexpectedError);
      }
    }));
    this.toUnhook.add(editor.onDidChangeModelContent((e4) => {
      if (!matchesScheme(this.model.uri, "output")) {
        this._stopAll();
      }
    }));
    this.toUnhook.add(editor.onDidChangeModel((e4) => {
      if (!e4.newModelUrl && e4.oldModelUrl) {
        this._stopSingular();
      } else if (WordHighlighter.query) {
        this._run();
      }
    }));
    this.toUnhook.add(editor.onDidChangeConfiguration((e4) => {
      const newEnablement = this.editor.getOption(90 /* occurrencesHighlight */);
      if (this.occurrencesHighlightEnablement !== newEnablement) {
        this.occurrencesHighlightEnablement = newEnablement;
        switch (newEnablement) {
          case "off":
            this._stopAll();
            break;
          case "singleFile":
            this._stopAll(WordHighlighter.query?.modelInfo?.modelURI);
            break;
          case "multiFile":
            if (WordHighlighter.query) {
              this._run(true);
            }
            break;
          default:
            console.warn("Unknown occurrencesHighlight setting value:", newEnablement);
            break;
        }
      }
    }));
    this.toUnhook.add(this.configurationService.onDidChangeConfiguration((e4) => {
      if (e4.affectsConfiguration("editor.occurrencesHighlightDelay")) {
        const newDelay = configurationService.getValue("editor.occurrencesHighlightDelay");
        if (this.occurrencesHighlightDelay !== newDelay) {
          this.occurrencesHighlightDelay = newDelay;
        }
      }
    }));
    this.toUnhook.add(editor.onDidBlurEditorWidget(() => {
      const activeEditor = this.codeEditorService.getFocusedCodeEditor();
      if (!activeEditor) {
        this._stopAll();
      } else if (activeEditor.getModel()?.uri.scheme === Schemas.vscodeNotebookCell && this.editor.getModel()?.uri.scheme !== Schemas.vscodeNotebookCell) {
        this._stopAll();
      }
    }));
    this.decorations = this.editor.createDecorationsCollection();
    this.workerRequestTokenId = 0;
    this.workerRequest = null;
    this.workerRequestCompleted = false;
    this.lastCursorPositionChangeTime = 0;
    this.renderDecorationsTimer = void 0;
    if (WordHighlighter.query) {
      this._run();
    }
  }
  static {
    this.storedDecorationIDs = new ResourceMap();
  }
  static {
    this.query = null;
  }
  hasDecorations() {
    return this.decorations.length > 0;
  }
  restore(delay) {
    if (this.occurrencesHighlightEnablement === "off") {
      return;
    }
    this.runDelayer.cancel();
    this.runDelayer.trigger(() => {
      this._run(false, delay);
    }).catch(onUnexpectedError);
  }
  trigger() {
    this.runDelayer.cancel();
    this._run(false, 0);
  }
  stop() {
    if (this.occurrencesHighlightEnablement === "off") {
      return;
    }
    this._stopAll();
  }
  _getSortedHighlights() {
    return this.decorations.getRanges().sort(Range2.compareRangesUsingStarts);
  }
  moveNext() {
    const highlights = this._getSortedHighlights();
    const index2 = highlights.findIndex((range2) => range2.containsPosition(this.editor.getPosition()));
    const newIndex = (index2 + 1) % highlights.length;
    const dest = highlights[newIndex];
    try {
      this._ignorePositionChangeEvent = true;
      this.editor.setPosition(dest.getStartPosition());
      this.editor.revealRangeInCenterIfOutsideViewport(dest);
      const word = this._getWord();
      if (word) {
        const lineContent = this.editor.getModel().getLineContent(dest.startLineNumber);
        alert(`${lineContent}, ${newIndex + 1} of ${highlights.length} for '${word.word}'`);
      }
    } finally {
      this._ignorePositionChangeEvent = false;
    }
  }
  moveBack() {
    const highlights = this._getSortedHighlights();
    const index2 = highlights.findIndex((range2) => range2.containsPosition(this.editor.getPosition()));
    const newIndex = (index2 - 1 + highlights.length) % highlights.length;
    const dest = highlights[newIndex];
    try {
      this._ignorePositionChangeEvent = true;
      this.editor.setPosition(dest.getStartPosition());
      this.editor.revealRangeInCenterIfOutsideViewport(dest);
      const word = this._getWord();
      if (word) {
        const lineContent = this.editor.getModel().getLineContent(dest.startLineNumber);
        alert(`${lineContent}, ${newIndex + 1} of ${highlights.length} for '${word.word}'`);
      }
    } finally {
      this._ignorePositionChangeEvent = false;
    }
  }
  _removeSingleDecorations() {
    if (!this.editor.hasModel()) {
      return;
    }
    const currentDecorationIDs = WordHighlighter.storedDecorationIDs.get(this.editor.getModel().uri);
    if (!currentDecorationIDs) {
      return;
    }
    this.editor.removeDecorations(currentDecorationIDs);
    WordHighlighter.storedDecorationIDs.delete(this.editor.getModel().uri);
    if (this.decorations.length > 0) {
      this.decorations.clear();
      this._hasWordHighlights.set(false);
    }
  }
  _removeAllDecorations(preservedModel) {
    const currentEditors = this.codeEditorService.listCodeEditors();
    const deleteURI = [];
    for (const editor of currentEditors) {
      if (!editor.hasModel() || isEqual2(editor.getModel().uri, preservedModel)) {
        continue;
      }
      const currentDecorationIDs = WordHighlighter.storedDecorationIDs.get(editor.getModel().uri);
      if (!currentDecorationIDs) {
        continue;
      }
      editor.removeDecorations(currentDecorationIDs);
      deleteURI.push(editor.getModel().uri);
      const editorHighlighterContrib = WordHighlighterContribution.get(editor);
      if (!editorHighlighterContrib?.wordHighlighter) {
        continue;
      }
      if (editorHighlighterContrib.wordHighlighter.decorations.length > 0) {
        editorHighlighterContrib.wordHighlighter.decorations.clear();
        editorHighlighterContrib.wordHighlighter.workerRequest = null;
        editorHighlighterContrib.wordHighlighter._hasWordHighlights.set(false);
      }
    }
    for (const uri4 of deleteURI) {
      WordHighlighter.storedDecorationIDs.delete(uri4);
    }
  }
  _stopSingular() {
    this._removeSingleDecorations();
    if (this.editor.hasTextFocus()) {
      if (this.editor.getModel()?.uri.scheme !== Schemas.vscodeNotebookCell && WordHighlighter.query?.modelInfo?.modelURI.scheme !== Schemas.vscodeNotebookCell) {
        WordHighlighter.query = null;
        this._run();
      } else {
        if (WordHighlighter.query?.modelInfo) {
          WordHighlighter.query.modelInfo = null;
        }
      }
    }
    if (this.renderDecorationsTimer !== void 0) {
      clearTimeout(this.renderDecorationsTimer);
      this.renderDecorationsTimer = void 0;
    }
    if (this.workerRequest !== null) {
      this.workerRequest.cancel();
      this.workerRequest = null;
    }
    if (!this.workerRequestCompleted) {
      this.workerRequestTokenId++;
      this.workerRequestCompleted = true;
    }
  }
  _stopAll(preservedModel) {
    this._removeAllDecorations(preservedModel);
    if (this.renderDecorationsTimer !== void 0) {
      clearTimeout(this.renderDecorationsTimer);
      this.renderDecorationsTimer = void 0;
    }
    if (this.workerRequest !== null) {
      this.workerRequest.cancel();
      this.workerRequest = null;
    }
    if (!this.workerRequestCompleted) {
      this.workerRequestTokenId++;
      this.workerRequestCompleted = true;
    }
  }
  _onPositionChanged(e4) {
    if (this.occurrencesHighlightEnablement === "off") {
      this._stopAll();
      return;
    }
    if (e4.source !== "api" && e4.reason !== 3 /* Explicit */) {
      this._stopAll();
      return;
    }
    this._run();
  }
  _getWord() {
    const editorSelection = this.editor.getSelection();
    const lineNumber = editorSelection.startLineNumber;
    const startColumn = editorSelection.startColumn;
    if (this.model.isDisposed()) {
      return null;
    }
    return this.model.getWordAtPosition({
      lineNumber,
      column: startColumn
    });
  }
  getOtherModelsToHighlight(model) {
    if (!model) {
      return [];
    }
    const isNotebookEditor = model.uri.scheme === Schemas.vscodeNotebookCell;
    if (isNotebookEditor) {
      const currentModels2 = [];
      const currentEditors2 = this.codeEditorService.listCodeEditors();
      for (const editor of currentEditors2) {
        const tempModel = editor.getModel();
        if (tempModel && tempModel !== model && tempModel.uri.scheme === Schemas.vscodeNotebookCell) {
          currentModels2.push(tempModel);
        }
      }
      return currentModels2;
    }
    const currentModels = [];
    const currentEditors = this.codeEditorService.listCodeEditors();
    for (const editor of currentEditors) {
      if (!isDiffEditor(editor)) {
        continue;
      }
      const diffModel = editor.getModel();
      if (!diffModel) {
        continue;
      }
      if (model === diffModel.modified) {
        currentModels.push(diffModel.modified);
      }
    }
    if (currentModels.length) {
      return currentModels;
    }
    if (this.occurrencesHighlightEnablement === "singleFile") {
      return [];
    }
    for (const editor of currentEditors) {
      const tempModel = editor.getModel();
      const isValidModel = tempModel && tempModel !== model;
      if (isValidModel) {
        currentModels.push(tempModel);
      }
    }
    return currentModels;
  }
  async _run(multiFileConfigChange, delay) {
    const hasTextFocus = this.editor.hasTextFocus();
    if (!hasTextFocus) {
      if (!WordHighlighter.query) {
        this._stopAll();
        return;
      }
    } else {
      const editorSelection = this.editor.getSelection();
      if (!editorSelection || editorSelection.startLineNumber !== editorSelection.endLineNumber) {
        WordHighlighter.query = null;
        this._stopAll();
        return;
      }
      const startColumn = editorSelection.startColumn;
      const endColumn = editorSelection.endColumn;
      const word = this._getWord();
      if (!word || word.startColumn > startColumn || word.endColumn < endColumn) {
        WordHighlighter.query = null;
        this._stopAll();
        return;
      }
      WordHighlighter.query = {
        modelInfo: {
          modelURI: this.model.uri,
          selection: editorSelection
        }
      };
    }
    this.lastCursorPositionChangeTime = (/* @__PURE__ */ new Date()).getTime();
    if (isEqual2(this.editor.getModel().uri, WordHighlighter.query.modelInfo?.modelURI)) {
      if (!multiFileConfigChange) {
        const currentModelDecorationRanges = this.decorations.getRanges();
        for (const storedRange of currentModelDecorationRanges) {
          if (storedRange.containsPosition(this.editor.getPosition())) {
            return;
          }
        }
      }
      this._stopAll(multiFileConfigChange ? this.model.uri : void 0);
      const myRequestId = ++this.workerRequestTokenId;
      this.workerRequestCompleted = false;
      const otherModelsToHighlight = this.getOtherModelsToHighlight(this.editor.getModel());
      if (!WordHighlighter.query || !WordHighlighter.query.modelInfo) {
        return;
      }
      const queryModelRef = await this.textModelService.createModelReference(WordHighlighter.query.modelInfo.modelURI);
      try {
        this.workerRequest = this.computeWithModel(queryModelRef.object.textEditorModel, WordHighlighter.query.modelInfo.selection, otherModelsToHighlight);
        this.workerRequest?.result.then((data) => {
          if (myRequestId === this.workerRequestTokenId) {
            this.workerRequestCompleted = true;
            this.workerRequestValue = data || [];
            this._beginRenderDecorations(delay ?? this.occurrencesHighlightDelay);
          }
        }, onUnexpectedError);
      } catch (e4) {
        this.logService.error("Unexpected error during occurrence request. Log: ", e4);
      } finally {
        queryModelRef.dispose();
      }
    } else if (this.model.uri.scheme === Schemas.vscodeNotebookCell) {
      const myRequestId = ++this.workerRequestTokenId;
      this.workerRequestCompleted = false;
      if (!WordHighlighter.query || !WordHighlighter.query.modelInfo) {
        return;
      }
      const queryModelRef = await this.textModelService.createModelReference(WordHighlighter.query.modelInfo.modelURI);
      try {
        this.workerRequest = this.computeWithModel(queryModelRef.object.textEditorModel, WordHighlighter.query.modelInfo.selection, [this.model]);
        this.workerRequest?.result.then((data) => {
          if (myRequestId === this.workerRequestTokenId) {
            this.workerRequestCompleted = true;
            this.workerRequestValue = data || [];
            this._beginRenderDecorations(delay ?? this.occurrencesHighlightDelay);
          }
        }, onUnexpectedError);
      } catch (e4) {
        this.logService.error("Unexpected error during occurrence request. Log: ", e4);
      } finally {
        queryModelRef.dispose();
      }
    }
  }
  computeWithModel(model, selection, otherModels) {
    if (!otherModels.length) {
      return computeOccurencesAtPosition(this.providers, model, selection, this.editor.getOption(148 /* wordSeparators */));
    } else {
      return computeOccurencesMultiModel(this.multiDocumentProviders, model, selection, this.editor.getOption(148 /* wordSeparators */), otherModels);
    }
  }
  _beginRenderDecorations(delay) {
    const currentTime = (/* @__PURE__ */ new Date()).getTime();
    const minimumRenderTime = this.lastCursorPositionChangeTime + delay;
    if (currentTime >= minimumRenderTime) {
      this.renderDecorationsTimer = void 0;
      this.renderDecorations();
    } else {
      this.renderDecorationsTimer = setTimeout(() => {
        this.renderDecorations();
      }, minimumRenderTime - currentTime);
    }
  }
  renderDecorations() {
    this.renderDecorationsTimer = void 0;
    const currentEditors = this.codeEditorService.listCodeEditors();
    for (const editor of currentEditors) {
      const editorHighlighterContrib = WordHighlighterContribution.get(editor);
      if (!editorHighlighterContrib) {
        continue;
      }
      const newDecorations = [];
      const uri4 = editor.getModel()?.uri;
      if (uri4 && this.workerRequestValue.has(uri4)) {
        const oldDecorationIDs = WordHighlighter.storedDecorationIDs.get(uri4);
        const newDocumentHighlights = this.workerRequestValue.get(uri4);
        if (newDocumentHighlights) {
          for (const highlight of newDocumentHighlights) {
            if (!highlight.range) {
              continue;
            }
            newDecorations.push({
              range: highlight.range,
              options: getHighlightDecorationOptions(highlight.kind)
            });
          }
        }
        let newDecorationIDs = [];
        editor.changeDecorations((changeAccessor) => {
          newDecorationIDs = changeAccessor.deltaDecorations(oldDecorationIDs ?? [], newDecorations);
        });
        WordHighlighter.storedDecorationIDs = WordHighlighter.storedDecorationIDs.set(uri4, newDecorationIDs);
        if (newDecorations.length > 0) {
          editorHighlighterContrib.wordHighlighter?.decorations.set(newDecorations);
          editorHighlighterContrib.wordHighlighter?._hasWordHighlights.set(true);
        }
      }
    }
    this.workerRequest = null;
  }
  dispose() {
    this._stopSingular();
    this.toUnhook.dispose();
  }
};

WordHighlighter = __decorateClass([
  __decorateParam(4, ITextModelService),
  __decorateParam(5, ICodeEditorService),
  __decorateParam(6, IConfigurationService),
  __decorateParam(7, ILogService)
], WordHighlighter);

var WordHighlighterContribution = class extends Disposable {
  static {
    this.ID = "editor.contrib.wordHighlighter";
  }
  static get(editor) {
    return editor.getContribution(WordHighlighterContribution.ID);
  }
  constructor(editor, contextKeyService, languageFeaturesService, codeEditorService, textModelService, configurationService, logService) {
    super();
    this._wordHighlighter = null;
    const createWordHighlighterIfPossible = () => {
      if (editor.hasModel() && !editor.getModel().isTooLargeForTokenization() && editor.getModel().uri.scheme !== Schemas.accessibleView) {
        this._wordHighlighter = new WordHighlighter(editor, languageFeaturesService.documentHighlightProvider, languageFeaturesService.multiDocumentHighlightProvider, contextKeyService, textModelService, codeEditorService, configurationService, logService);
      }
    };
    this._register(editor.onDidChangeModel((e4) => {
      if (this._wordHighlighter) {
        if (!e4.newModelUrl && e4.oldModelUrl?.scheme !== Schemas.vscodeNotebookCell) {
          this.wordHighlighter?.stop();
        }
        this._wordHighlighter.dispose();
        this._wordHighlighter = null;
      }
      createWordHighlighterIfPossible();
    }));
    createWordHighlighterIfPossible();
  }
  get wordHighlighter() {
    return this._wordHighlighter;
  }
  saveViewState() {
    if (this._wordHighlighter && this._wordHighlighter.hasDecorations()) {
      return true;
    }
    return false;
  }
  moveNext() {
    this._wordHighlighter?.moveNext();
  }
  moveBack() {
    this._wordHighlighter?.moveBack();
  }
  restoreViewState(state) {
    if (this._wordHighlighter && state) {
      this._wordHighlighter.restore(250);
    }
  }
  stopHighlighting() {
    this._wordHighlighter?.stop();
  }
  dispose() {
    if (this._wordHighlighter) {
      this._wordHighlighter.dispose();
      this._wordHighlighter = null;
    }
    super.dispose();
  }
};

WordHighlighterContribution = __decorateClass([
  __decorateParam(1, IContextKeyService),
  __decorateParam(2, ILanguageFeaturesService),
  __decorateParam(3, ICodeEditorService),
  __decorateParam(4, ITextModelService),
  __decorateParam(5, IConfigurationService),
  __decorateParam(6, ILogService)
], WordHighlighterContribution);

var WordHighlightNavigationAction = class extends EditorAction {
  constructor(next, opts) {
    super(opts);
    this._isNext = next;
  }
  run(accessor, editor) {
    const controller = WordHighlighterContribution.get(editor);
    if (!controller) {
      return;
    }
    if (this._isNext) {
      controller.moveNext();
    } else {
      controller.moveBack();
    }
  }
};

var NextWordHighlightAction = class extends WordHighlightNavigationAction {
  constructor() {
    super(true, {
      id: "editor.action.wordHighlight.next",
      label: localize2(1758, "Go to Next Symbol Highlight"),
      precondition: ctxHasWordHighlights,
      kbOpts: {
        kbExpr: EditorContextKeys.editorTextFocus,
        primary: 65 /* F7 */,
        weight: 100 /* EditorContrib */
      }
    });
  }
};

var PrevWordHighlightAction = class extends WordHighlightNavigationAction {
  constructor() {
    super(false, {
      id: "editor.action.wordHighlight.prev",
      label: localize2(1759, "Go to Previous Symbol Highlight"),
      precondition: ctxHasWordHighlights,
      kbOpts: {
        kbExpr: EditorContextKeys.editorTextFocus,
        primary: 1024 /* Shift */ | 65 /* F7 */,
        weight: 100 /* EditorContrib */
      }
    });
  }
};

var TriggerWordHighlightAction = class extends EditorAction {
  constructor() {
    super({
      id: "editor.action.wordHighlight.trigger",
      label: localize2(1760, "Trigger Symbol Highlight"),
      precondition: void 0,
      kbOpts: {
        kbExpr: EditorContextKeys.editorTextFocus,
        primary: 0,
        weight: 100 /* EditorContrib */
      }
    });
  }
  run(accessor, editor) {
    const controller = WordHighlighterContribution.get(editor);
    if (!controller) {
      return;
    }
    controller.restoreViewState(true);
  }
};

registerEditorContribution(WordHighlighterContribution.ID, WordHighlighterContribution, 0 /* Eager */);

registerEditorAction(NextWordHighlightAction);

registerEditorAction(PrevWordHighlightAction);

registerEditorAction(TriggerWordHighlightAction);

registerEditorFeature(TextualMultiDocumentHighlightFeature);
export { getOccurrencesAtPosition, getOccurrencesAcrossMultipleModels, computeOccurencesAtPosition, computeOccurencesMultiModel, ctxHasWordHighlights, OccurenceAtPositionRequest, SemanticOccurenceAtPositionRequest, MultiModelOccurenceRequest, WordHighlighter, WordHighlighterContribution, WordHighlightNavigationAction, NextWordHighlightAction, PrevWordHighlightAction, TriggerWordHighlightAction };
