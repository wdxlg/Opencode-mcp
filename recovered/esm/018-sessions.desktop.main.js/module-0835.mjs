// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/contrib/sectionHeaders/browser/sectionHeaders.ts
import { Disposable } from "./module-0012.mjs";
import { RunOnceScheduler } from "./module-0036.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ILanguageConfigurationService } from "./module-0143.mjs";
import { IEditorWorkerService } from "./module-0158.mjs";
import { ModelDecorationOptions } from "./module-0423.mjs";
import { registerEditorContribution } from "./module-0097.mjs";


// src/vs/editor/contrib/sectionHeaders/browser/sectionHeaders.ts
var SectionHeaderDetector = class extends Disposable {
  constructor(editor, languageConfigurationService, editorWorkerService) {
    super();
    this.editor = editor;
    this.languageConfigurationService = languageConfigurationService;
    this.editorWorkerService = editorWorkerService;
    this.decorations = this.editor.createDecorationsCollection();
    this.options = this.createOptions(editor.getOption(81 /* minimap */));
    this.computePromise = null;
    this.currentOccurrences = {};
    this._register(editor.onDidChangeModel((e4) => {
      this.currentOccurrences = {};
      this.options = this.createOptions(editor.getOption(81 /* minimap */));
      this.stop();
      this.computeSectionHeaders.schedule(0);
    }));
    this._register(editor.onDidChangeModelLanguage((e4) => {
      this.currentOccurrences = {};
      this.options = this.createOptions(editor.getOption(81 /* minimap */));
      this.stop();
      this.computeSectionHeaders.schedule(0);
    }));
    this._register(languageConfigurationService.onDidChange((e4) => {
      const editorLanguageId = this.editor.getModel()?.getLanguageId();
      if (editorLanguageId && e4.affects(editorLanguageId)) {
        this.currentOccurrences = {};
        this.options = this.createOptions(editor.getOption(81 /* minimap */));
        this.stop();
        this.computeSectionHeaders.schedule(0);
      }
    }));
    this._register(editor.onDidChangeConfiguration((e4) => {
      if (this.options && !e4.hasChanged(81 /* minimap */)) {
        return;
      }
      this.options = this.createOptions(editor.getOption(81 /* minimap */));
      this.updateDecorations([]);
      this.stop();
      this.computeSectionHeaders.schedule(0);
    }));
    this._register(this.editor.onDidChangeModelContent((e4) => {
      this.computeSectionHeaders.schedule();
    }));
    this._register(editor.onDidChangeModelTokens((e4) => {
      if (!this.computeSectionHeaders.isScheduled()) {
        this.computeSectionHeaders.schedule(1e3);
      }
    }));
    this.computeSectionHeaders = this._register(new RunOnceScheduler(() => {
      this.findSectionHeaders();
    }, 250));
    this.computeSectionHeaders.schedule(0);
  }
  static {
    this.ID = "editor.sectionHeaderDetector";
  }
  createOptions(minimap) {
    if (!minimap || !this.editor.hasModel()) {
      return void 0;
    }
    const languageId = this.editor.getModel().getLanguageId();
    if (!languageId) {
      return void 0;
    }
    const commentsConfiguration = this.languageConfigurationService.getLanguageConfiguration(languageId).comments;
    const foldingRules = this.languageConfigurationService.getLanguageConfiguration(languageId).foldingRules;
    if (!commentsConfiguration && !foldingRules?.markers) {
      return void 0;
    }
    return {
      foldingRules,
      markSectionHeaderRegex: minimap.markSectionHeaderRegex,
      findMarkSectionHeaders: minimap.showMarkSectionHeaders,
      findRegionSectionHeaders: minimap.showRegionSectionHeaders
    };
  }
  findSectionHeaders() {
    if (!this.editor.hasModel() || !this.options?.findMarkSectionHeaders && !this.options?.findRegionSectionHeaders) {
      return;
    }
    const model = this.editor.getModel();
    if (model.isDisposed() || model.isTooLargeForSyncing()) {
      return;
    }
    const modelVersionId = model.getVersionId();
    this.editorWorkerService.findSectionHeaders(model.uri, this.options).then((sectionHeaders) => {
      if (model.isDisposed() || model.getVersionId() !== modelVersionId) {
        return;
      }
      this.updateDecorations(sectionHeaders);
    });
  }
  updateDecorations(sectionHeaders) {
    const model = this.editor.getModel();
    if (model) {
      sectionHeaders = sectionHeaders.filter((sectionHeader) => {
        if (!sectionHeader.shouldBeInComments) {
          return true;
        }
        const validRange2 = model.validateRange(sectionHeader.range);
        const tokens = model.tokenization.getLineTokens(validRange2.startLineNumber);
        const idx = tokens.findTokenIndexAtOffset(validRange2.startColumn - 1);
        const tokenType = tokens.getStandardTokenType(idx);
        const languageIdAtPosition = model.getLanguageIdAtPosition(validRange2.startLineNumber, validRange2.startColumn);
        const tokenLanguageId = tokens.getLanguageId(idx);
        return tokenLanguageId === languageIdAtPosition && tokenType === 1 /* Comment */;
      });
    }
    const oldDecorations = Object.values(this.currentOccurrences).map((occurrence) => occurrence.decorationId);
    const newDecorations = sectionHeaders.map((sectionHeader) => decoration2(sectionHeader));
    this.editor.changeDecorations((changeAccessor) => {
      const decorations = changeAccessor.deltaDecorations(oldDecorations, newDecorations);
      this.currentOccurrences = {};
      for (let i2 = 0, len = decorations.length; i2 < len; i2++) {
        const occurrence = { sectionHeader: sectionHeaders[i2], decorationId: decorations[i2] };
        this.currentOccurrences[occurrence.decorationId] = occurrence;
      }
    });
  }
  stop() {
    this.computeSectionHeaders.cancel();
    if (this.computePromise) {
      this.computePromise.cancel();
      this.computePromise = null;
    }
  }
  dispose() {
    super.dispose();
    this.stop();
    this.decorations.clear();
  }
};

SectionHeaderDetector = __decorateClass([
  __decorateParam(1, ILanguageConfigurationService),
  __decorateParam(2, IEditorWorkerService)
], SectionHeaderDetector);

function decoration2(sectionHeader) {
  return {
    range: sectionHeader.range,
    options: ModelDecorationOptions.createDynamic({
      description: "section-header",
      stickiness: 3 /* GrowsOnlyWhenTypingAfter */,
      collapseOnReplaceEdit: true,
      minimap: {
        color: void 0,
        position: 1 /* Inline */,
        sectionHeaderStyle: sectionHeader.hasSeparatorLine ? 2 /* Underlined */ : 1 /* Normal */,
        sectionHeaderText: sectionHeader.text
      }
    })
  };
}

registerEditorContribution(SectionHeaderDetector.ID, SectionHeaderDetector, 1 /* AfterFirstRender */);
export { decoration2, SectionHeaderDetector };
