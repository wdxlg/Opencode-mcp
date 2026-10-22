// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/common/model/tokens/treeSitter/treeSitterSyntaxTokenBackend.ts
import { AbstractSyntaxTokenBackend } from "./module-0399.mjs";
import { Emitter } from "./module-0017.mjs";
import { ObservablePromise } from "./module-0055.mjs";
import { derived } from "./module-0054.mjs";
import { toDisposable } from "./module-0012.mjs";
import { TreeSitterTree } from "./module-0407.mjs";
import { TreeSitterTokenizationImpl } from "./module-0416.mjs";
import { autorun } from "./module-0052.mjs";
import { LineTokens } from "./module-0145.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ITreeSitterLibraryService } from "./module-0417.mjs";
import { IInstantiationService } from "./module-0077.mjs";


// src/vs/editor/common/model/tokens/treeSitter/treeSitterSyntaxTokenBackend.ts
var TreeSitterSyntaxTokenBackend = class extends AbstractSyntaxTokenBackend {
  constructor(_languageIdObs, languageIdCodec, textModel, visibleLineRanges, _treeSitterLibraryService, _instantiationService) {
    super(languageIdCodec, textModel);
    this._languageIdObs = _languageIdObs;
    this._treeSitterLibraryService = _treeSitterLibraryService;
    this._instantiationService = _instantiationService;
    this._backgroundTokenizationState = 1 /* InProgress */;
    this._onDidChangeBackgroundTokenizationState = this._register(new Emitter());
    this.onDidChangeBackgroundTokenizationState = this._onDidChangeBackgroundTokenizationState.event;
    const parserClassPromise = new ObservablePromise(this._treeSitterLibraryService.getParserClass());
    const parserClassObs = derived(this, (reader) => {
      const parser2 = parserClassPromise.promiseResult?.read(reader)?.getDataOrThrow();
      return parser2;
    });
    this._tree = derived(this, (reader) => {
      const parserClass = parserClassObs.read(reader);
      if (!parserClass) {
        return void 0;
      }
      const currentLanguage = this._languageIdObs.read(reader);
      const treeSitterLang = this._treeSitterLibraryService.getLanguage(currentLanguage, false, reader);
      if (!treeSitterLang) {
        return void 0;
      }
      const parser2 = new parserClass();
      reader.store.add(toDisposable(() => {
        parser2.delete();
      }));
      parser2.setLanguage(treeSitterLang);
      const queries = this._treeSitterLibraryService.getInjectionQueries(currentLanguage, reader);
      if (queries === void 0) {
        return void 0;
      }
      return reader.store.add(this._instantiationService.createInstance(
        TreeSitterTree,
        currentLanguage,
        void 0,
        parser2,
        parserClass,
        /*queries, */
        this._textModel
      ));
    });
    this._tokenizationImpl = derived(this, (reader) => {
      const treeModel = this._tree.read(reader);
      if (!treeModel) {
        return void 0;
      }
      const queries = this._treeSitterLibraryService.getHighlightingQueries(treeModel.languageId, reader);
      if (!queries) {
        return void 0;
      }
      return reader.store.add(this._instantiationService.createInstance(TreeSitterTokenizationImpl, treeModel, queries, this._languageIdCodec, visibleLineRanges));
    });
    this._register(autorun((reader) => {
      const tokModel = this._tokenizationImpl.read(reader);
      if (!tokModel) {
        return;
      }
      reader.store.add(tokModel.onDidChangeTokens((e) => {
        this._onDidChangeTokens.fire(e.changes);
      }));
      reader.store.add(tokModel.onDidChangeBackgroundTokenization((e) => {
        this._backgroundTokenizationState = 2 /* Completed */;
        this._onDidChangeBackgroundTokenizationState.fire();
      }));
    }));
  }
  get tree() {
    return this._tree;
  }
  get tokenizationImpl() {
    return this._tokenizationImpl;
  }
  getLineTokens(lineNumber) {
    const model = this._tokenizationImpl.get();
    if (!model) {
      const content2 = this._textModel.getLineContent(lineNumber);
      return LineTokens.createEmpty(content2, this._languageIdCodec);
    }
    return model.getLineTokens(lineNumber);
  }
  todo_resetTokenization(fireTokenChangeEvent = true) {
    if (fireTokenChangeEvent) {
      this._onDidChangeTokens.fire({
        semanticTokensApplied: false,
        ranges: [
          {
            fromLineNumber: 1,
            toLineNumber: this._textModel.getLineCount()
          }
        ]
      });
    }
  }
  handleDidChangeAttached() {
  }
  handleDidChangeContent(e) {
    if (e.isFlush) {
      this.todo_resetTokenization(false);
    } else {
      const model = this._tokenizationImpl.get();
      model?.handleContentChanged(e);
    }
    const treeModel = this._tree.get();
    treeModel?.handleContentChange(e);
  }
  forceTokenization(lineNumber) {
    const model = this._tokenizationImpl.get();
    if (!model) {
      return;
    }
    if (!model.hasAccurateTokensForLine(lineNumber)) {
      model.tokenizeEncoded(lineNumber);
    }
  }
  hasAccurateTokensForLine(lineNumber) {
    const model = this._tokenizationImpl.get();
    if (!model) {
      return false;
    }
    return model.hasAccurateTokensForLine(lineNumber);
  }
  isCheapToTokenize(lineNumber) {
    return true;
  }
  getTokenTypeIfInsertingCharacter(lineNumber, column, character) {
    return 0 /* Other */;
  }
  tokenizeLinesAt(lineNumber, lines) {
    const model = this._tokenizationImpl.get();
    if (!model) {
      return null;
    }
    return model.tokenizeLinesAt(lineNumber, lines);
  }
  get hasTokens() {
    const model = this._tokenizationImpl.get();
    if (!model) {
      return false;
    }
    return model.hasTokens();
  }
};

TreeSitterSyntaxTokenBackend = __decorateClass([
  __decorateParam(4, ITreeSitterLibraryService),
  __decorateParam(5, IInstantiationService)
], TreeSitterSyntaxTokenBackend);
export { TreeSitterSyntaxTokenBackend };
