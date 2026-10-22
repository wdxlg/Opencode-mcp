// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/contrib/stickyScroll/browser/stickyScrollProvider.ts
import { Disposable, DisposableStore, toDisposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { RunOnceScheduler } from "./module-0036.mjs";
import { StickyModelProvider } from "./module-0768.mjs";
import { CancellationTokenSource } from "./module-0025.mjs";
import { binarySearch } from "./module-0007.mjs";
import { Range2 } from "./module-0106.mjs";
import { Position } from "./module-0079.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ILanguageFeaturesService } from "./module-0205.mjs";
import { ILanguageConfigurationService } from "./module-0143.mjs";


// src/vs/editor/contrib/stickyScroll/browser/stickyScrollProvider.ts
var StickyLineCandidate = class {
  constructor(startLineNumber, endLineNumber, top2, height) {
    this.startLineNumber = startLineNumber;
    this.endLineNumber = endLineNumber;
    this.top = top2;
    this.height = height;
  }
};

var StickyLineCandidateProvider = class extends Disposable {
  constructor(editor, _languageFeaturesService, _languageConfigurationService) {
    super();
    this._languageFeaturesService = _languageFeaturesService;
    this._languageConfigurationService = _languageConfigurationService;
    this._onDidChangeStickyScroll = this._register(new Emitter());
    this.onDidChangeStickyScroll = this._onDidChangeStickyScroll.event;
    this._model = null;
    this._cts = null;
    this._stickyModelProvider = null;
    this._editor = editor;
    this._sessionStore = this._register(new DisposableStore());
    this._updateSoon = this._register(new RunOnceScheduler(() => this.update(), 50));
    this._register(this._editor.onDidChangeConfiguration((e4) => {
      if (e4.hasChanged(131 /* stickyScroll */)) {
        this.readConfiguration();
      }
    }));
    this.readConfiguration();
  }
  static {
    this.ID = "store.contrib.stickyScrollController";
  }
  /**
   * Read and apply the sticky scroll configuration.
   */
  readConfiguration() {
    this._sessionStore.clear();
    const options3 = this._editor.getOption(131 /* stickyScroll */);
    if (!options3.enabled) {
      return;
    }
    this._sessionStore.add(this._editor.onDidChangeModel(() => {
      this._model = null;
      this.updateStickyModelProvider();
      this._onDidChangeStickyScroll.fire();
      this.update();
    }));
    this._sessionStore.add(this._editor.onDidChangeHiddenAreas(() => this.update()));
    this._sessionStore.add(this._editor.onDidChangeModelContent(() => this._updateSoon.schedule()));
    this._sessionStore.add(this._languageFeaturesService.documentSymbolProvider.onDidChange(() => this.update()));
    this._sessionStore.add(toDisposable(() => {
      this._stickyModelProvider?.dispose();
      this._stickyModelProvider = null;
    }));
    this.updateStickyModelProvider();
    this.update();
  }
  /**
   * Get the version ID of the sticky model.
   */
  getVersionId() {
    return this._model?.version;
  }
  /**
   * Update the sticky model provider.
   */
  updateStickyModelProvider() {
    this._stickyModelProvider?.dispose();
    this._stickyModelProvider = null;
    if (this._editor.hasModel()) {
      this._stickyModelProvider = new StickyModelProvider(
        this._editor,
        () => this._updateSoon.schedule(),
        this._languageConfigurationService,
        this._languageFeaturesService
      );
    }
  }
  /**
   * Update the sticky line candidates.
   */
  async update() {
    this._cts?.dispose(true);
    this._cts = new CancellationTokenSource();
    await this.updateStickyModel(this._cts.token);
    this._onDidChangeStickyScroll.fire();
  }
  /**
   * Update the sticky model based on the current editor state.
   */
  async updateStickyModel(token) {
    if (!this._editor.hasModel() || !this._stickyModelProvider || this._editor.getModel().isTooLargeForTokenization()) {
      this._model = null;
      return;
    }
    const model = await this._stickyModelProvider.update(token);
    if (!token.isCancellationRequested) {
      this._model = model;
    }
  }
  /**
   * Get sticky line candidates intersecting a given range.
   */
  getCandidateStickyLinesIntersecting(range2) {
    if (!this._model?.element) {
      return [];
    }
    const stickyLineCandidates = [];
    this.getCandidateStickyLinesIntersectingFromStickyModel(range2, this._model.element, stickyLineCandidates, 0, 0, -1);
    return this.filterHiddenRanges(stickyLineCandidates);
  }
  /**
   * Get sticky line candidates intersecting a given range from the sticky model.
   */
  getCandidateStickyLinesIntersectingFromStickyModel(range2, outlineModel, result, depth, top2, lastStartLineNumber) {
    const textModel = this._editor.getModel();
    if (!textModel) {
      return;
    }
    if (outlineModel.children.length === 0) {
      return;
    }
    let lastLine = lastStartLineNumber;
    const childrenStartLines = [];
    for (let i2 = 0; i2 < outlineModel.children.length; i2++) {
      const child = outlineModel.children[i2];
      if (child.range) {
        childrenStartLines.push(child.range.startLineNumber);
      }
    }
    const lowerBound = this.updateIndex(binarySearch(childrenStartLines, range2.startLineNumber, (a, b) => {
      return a - b;
    }));
    const upperBound = this.updateIndex(binarySearch(childrenStartLines, range2.endLineNumber, (a, b) => {
      return a - b;
    }));
    for (let i2 = lowerBound; i2 <= upperBound; i2++) {
      const child = outlineModel.children[i2];
      if (!child || !child.range) {
        continue;
      }
      const { startLineNumber, endLineNumber } = child.range;
      if (endLineNumber > startLineNumber + 1 && range2.startLineNumber <= endLineNumber + 1 && startLineNumber - 1 <= range2.endLineNumber && startLineNumber !== lastLine && textModel.isValidRange(new Range2(startLineNumber, 1, endLineNumber, 1))) {
        lastLine = startLineNumber;
        const lineHeight = this._editor.getLineHeightForPosition(new Position(startLineNumber, 1));
        result.push(new StickyLineCandidate(startLineNumber, endLineNumber - 1, top2, lineHeight));
        this.getCandidateStickyLinesIntersectingFromStickyModel(range2, child, result, depth + 1, top2 + lineHeight, startLineNumber);
      }
    }
  }
  /**
   * Filter out sticky line candidates that are within hidden ranges.
   */
  filterHiddenRanges(stickyLineCandidates) {
    const hiddenRanges = this._editor._getViewModel()?.getHiddenAreas();
    if (!hiddenRanges) {
      return stickyLineCandidates;
    }
    return stickyLineCandidates.filter((candidate) => {
      return !hiddenRanges.some(
        (hiddenRange) => candidate.startLineNumber >= hiddenRange.startLineNumber && candidate.endLineNumber <= hiddenRange.endLineNumber + 1
      );
    });
  }
  /**
   * Update the binary search index.
   */
  updateIndex(index2) {
    if (index2 === -1) {
      return 0;
    } else if (index2 < 0) {
      return -index2 - 2;
    }
    return index2;
  }
};

StickyLineCandidateProvider = __decorateClass([
  __decorateParam(1, ILanguageFeaturesService),
  __decorateParam(2, ILanguageConfigurationService)
], StickyLineCandidateProvider);
export { StickyLineCandidate, StickyLineCandidateProvider };
