// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/contrib/stickyScroll/browser/stickyScrollModelProvider.ts
import { Disposable, DisposableStore, MutableDisposable } from "./module-0012.mjs";
import { Delayer, createCancelablePromise } from "./module-0036.mjs";
import { onUnexpectedError } from "./module-0004.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { ILanguageFeaturesService } from "./module-0205.mjs";
import { OutlineElement, OutlineGroup, OutlineModel } from "./module-0691.mjs";
import { StickyElement, StickyModel, StickyRange } from "./module-0767.mjs";
import { Iterable } from "./module-0011.mjs";
import { FoldingController, RangesLimitReporter } from "./module-0684.mjs";
import { IndentRangeProvider } from "./module-0681.mjs";
import { ILanguageConfigurationService } from "./module-0143.mjs";
import { SyntaxRangeProvider } from "./module-0683.mjs";


// src/vs/editor/contrib/stickyScroll/browser/stickyScrollModelProvider.ts
var StickyModelProvider = class extends Disposable {
  constructor(_editor, onProviderUpdate, _languageConfigurationService, _languageFeaturesService) {
    super();
    this._editor = _editor;
    this._modelProviders = [];
    this._modelPromise = null;
    this._updateScheduler = this._register(new Delayer(300));
    this._updateOperation = this._register(new DisposableStore());
    switch (this._editor.getOption(131 /* stickyScroll */).defaultModel) {
      case "outlineModel" /* OUTLINE_MODEL */:
        this._modelProviders.push(new StickyModelFromCandidateOutlineProvider(this._editor, _languageFeaturesService));
      // fall through
      case "foldingProviderModel" /* FOLDING_PROVIDER_MODEL */:
        this._modelProviders.push(new StickyModelFromCandidateSyntaxFoldingProvider(this._editor, onProviderUpdate, _languageFeaturesService));
      // fall through
      case "indentationModel" /* INDENTATION_MODEL */:
        this._modelProviders.push(new StickyModelFromCandidateIndentationFoldingProvider(this._editor, _languageConfigurationService));
        break;
    }
  }
  dispose() {
    this._modelProviders.forEach((provider) => provider.dispose());
    this._updateOperation.clear();
    this._cancelModelPromise();
    super.dispose();
  }
  _cancelModelPromise() {
    if (this._modelPromise) {
      this._modelPromise.cancel();
      this._modelPromise = null;
    }
  }
  async update(token) {
    this._updateOperation.clear();
    this._updateOperation.add({
      dispose: () => {
        this._cancelModelPromise();
        this._updateScheduler.cancel();
      }
    });
    this._cancelModelPromise();
    return await this._updateScheduler.trigger(async () => {
      for (const modelProvider of this._modelProviders) {
        const { statusPromise, modelPromise } = modelProvider.computeStickyModel(token);
        this._modelPromise = modelPromise;
        const status2 = await statusPromise;
        if (this._modelPromise !== modelPromise) {
          return null;
        }
        switch (status2) {
          case 2 /* CANCELED */:
            this._updateOperation.clear();
            return null;
          case 0 /* VALID */:
            return modelProvider.stickyModel;
        }
      }
      return null;
    }).catch((error) => {
      onUnexpectedError(error);
      return null;
    });
  }
};

StickyModelProvider = __decorateClass([
  __decorateParam(2, IInstantiationService),
  __decorateParam(3, ILanguageFeaturesService)
], StickyModelProvider);

var StickyModelCandidateProvider = class extends Disposable {
  constructor(_editor) {
    super();
    this._editor = _editor;
    this._stickyModel = null;
  }
  get stickyModel() {
    return this._stickyModel;
  }
  _invalid() {
    this._stickyModel = null;
    return 1 /* INVALID */;
  }
  computeStickyModel(token) {
    if (token.isCancellationRequested || !this.isProviderValid()) {
      return { statusPromise: this._invalid(), modelPromise: null };
    }
    const providerModelPromise = createCancelablePromise((token2) => this.createModelFromProvider(token2));
    return {
      statusPromise: providerModelPromise.then((providerModel) => {
        if (!this.isModelValid(providerModel)) {
          return this._invalid();
        }
        if (token.isCancellationRequested) {
          return 2 /* CANCELED */;
        }
        this._stickyModel = this.createStickyModel(token, providerModel);
        return 0 /* VALID */;
      }).then(void 0, (err) => {
        onUnexpectedError(err);
        return 2 /* CANCELED */;
      }),
      modelPromise: providerModelPromise
    };
  }
  /**
   * Method which checks whether the model returned by the provider is valid and can be used to compute a sticky model.
   * This method by default returns true.
   * @param model model returned by the provider
   * @returns boolean indicating whether the model is valid
   */
  isModelValid(model) {
    return true;
  }
  /**
   * Method which checks whether the provider is valid before applying it to find the provider model.
   * This method by default returns true.
   * @returns boolean indicating whether the provider is valid
   */
  isProviderValid() {
    return true;
  }
};

var StickyModelFromCandidateOutlineProvider = class extends StickyModelCandidateProvider {
  constructor(_editor, _languageFeaturesService) {
    super(_editor);
    this._languageFeaturesService = _languageFeaturesService;
  }
  createModelFromProvider(token) {
    return OutlineModel.create(this._languageFeaturesService.documentSymbolProvider, this._editor.getModel(), token);
  }
  createStickyModel(token, model) {
    const { stickyOutlineElement, providerID } = this._stickyModelFromOutlineModel(model, this._stickyModel?.outlineProviderId);
    const textModel = this._editor.getModel();
    return new StickyModel(textModel.uri, textModel.getVersionId(), stickyOutlineElement, providerID);
  }
  isModelValid(model) {
    return model && model.children.size > 0;
  }
  _stickyModelFromOutlineModel(outlineModel, preferredProvider) {
    let outlineElements;
    if (Iterable.first(outlineModel.children.values()) instanceof OutlineGroup) {
      const provider = Iterable.find(outlineModel.children.values(), (outlineGroupOfModel) => outlineGroupOfModel.id === preferredProvider);
      if (provider) {
        outlineElements = provider.children;
      } else {
        let tempID = "";
        let maxTotalSumOfRanges = -1;
        let optimalOutlineGroup = void 0;
        for (const [_key, outlineGroup] of outlineModel.children.entries()) {
          const totalSumRanges = this._findSumOfRangesOfGroup(outlineGroup);
          if (totalSumRanges > maxTotalSumOfRanges) {
            optimalOutlineGroup = outlineGroup;
            maxTotalSumOfRanges = totalSumRanges;
            tempID = outlineGroup.id;
          }
        }
        preferredProvider = tempID;
        outlineElements = optimalOutlineGroup.children;
      }
    } else {
      outlineElements = outlineModel.children;
    }
    const stickyChildren = [];
    const outlineElementsArray = Array.from(outlineElements.values()).sort((element1, element2) => {
      const range1 = new StickyRange(element1.symbol.range.startLineNumber, element1.symbol.range.endLineNumber);
      const range2 = new StickyRange(element2.symbol.range.startLineNumber, element2.symbol.range.endLineNumber);
      return this._comparator(range1, range2);
    });
    for (const outlineElement of outlineElementsArray) {
      stickyChildren.push(this._stickyModelFromOutlineElement(outlineElement, outlineElement.symbol.selectionRange.startLineNumber));
    }
    const stickyOutlineElement = new StickyElement(void 0, stickyChildren, void 0);
    return {
      stickyOutlineElement,
      providerID: preferredProvider
    };
  }
  _stickyModelFromOutlineElement(outlineElement, previousStartLine) {
    const children = [];
    for (const child of outlineElement.children.values()) {
      if (child.symbol.selectionRange.startLineNumber !== child.symbol.range.endLineNumber) {
        if (child.symbol.selectionRange.startLineNumber !== previousStartLine) {
          children.push(this._stickyModelFromOutlineElement(child, child.symbol.selectionRange.startLineNumber));
        } else {
          for (const subchild of child.children.values()) {
            children.push(this._stickyModelFromOutlineElement(subchild, child.symbol.selectionRange.startLineNumber));
          }
        }
      }
    }
    children.sort((child1, child2) => this._comparator(child1.range, child2.range));
    const range2 = new StickyRange(outlineElement.symbol.selectionRange.startLineNumber, outlineElement.symbol.range.endLineNumber);
    return new StickyElement(range2, children, void 0);
  }
  _comparator(range1, range2) {
    if (range1.startLineNumber !== range2.startLineNumber) {
      return range1.startLineNumber - range2.startLineNumber;
    } else {
      return range2.endLineNumber - range1.endLineNumber;
    }
  }
  _findSumOfRangesOfGroup(outline) {
    let res = 0;
    for (const child of outline.children.values()) {
      res += this._findSumOfRangesOfGroup(child);
    }
    if (outline instanceof OutlineElement) {
      return res + outline.symbol.range.endLineNumber - outline.symbol.selectionRange.startLineNumber;
    } else {
      return res;
    }
  }
};

StickyModelFromCandidateOutlineProvider = __decorateClass([
  __decorateParam(1, ILanguageFeaturesService)
], StickyModelFromCandidateOutlineProvider);

var StickyModelFromCandidateFoldingProvider = class extends StickyModelCandidateProvider {
  constructor(editor) {
    super(editor);
    this._foldingLimitReporter = this._register(new RangesLimitReporter(editor));
  }
  createStickyModel(token, model) {
    const foldingElement = this._fromFoldingRegions(model);
    const textModel = this._editor.getModel();
    return new StickyModel(textModel.uri, textModel.getVersionId(), foldingElement, void 0);
  }
  isModelValid(model) {
    return model !== null;
  }
  _fromFoldingRegions(foldingRegions) {
    const length = foldingRegions.length;
    const orderedStickyElements = [];
    const stickyOutlineElement = new StickyElement(
      void 0,
      [],
      void 0
    );
    for (let i2 = 0; i2 < length; i2++) {
      const parentIndex = foldingRegions.getParentIndex(i2);
      let parentNode;
      if (parentIndex !== -1) {
        parentNode = orderedStickyElements[parentIndex];
      } else {
        parentNode = stickyOutlineElement;
      }
      const child = new StickyElement(
        new StickyRange(foldingRegions.getStartLineNumber(i2), foldingRegions.getEndLineNumber(i2) + 1),
        [],
        parentNode
      );
      parentNode.children.push(child);
      orderedStickyElements.push(child);
    }
    return stickyOutlineElement;
  }
};

var StickyModelFromCandidateIndentationFoldingProvider = class extends StickyModelFromCandidateFoldingProvider {
  constructor(editor, _languageConfigurationService) {
    super(editor);
    this._languageConfigurationService = _languageConfigurationService;
    this.provider = this._register(new IndentRangeProvider(editor.getModel(), this._languageConfigurationService, this._foldingLimitReporter));
  }
  async createModelFromProvider(token) {
    return this.provider.compute(token);
  }
};

StickyModelFromCandidateIndentationFoldingProvider = __decorateClass([
  __decorateParam(1, ILanguageConfigurationService)
], StickyModelFromCandidateIndentationFoldingProvider);

var StickyModelFromCandidateSyntaxFoldingProvider = class extends StickyModelFromCandidateFoldingProvider {
  constructor(editor, onProviderUpdate, _languageFeaturesService) {
    super(editor);
    this._languageFeaturesService = _languageFeaturesService;
    this.provider = this._register(new MutableDisposable());
    this._register(this._languageFeaturesService.foldingRangeProvider.onDidChange(() => {
      this._updateProvider(editor, onProviderUpdate);
    }));
    this._updateProvider(editor, onProviderUpdate);
  }
  _updateProvider(editor, onProviderUpdate) {
    const selectedProviders = FoldingController.getFoldingRangeProviders(this._languageFeaturesService, editor.getModel());
    if (selectedProviders.length === 0) {
      return;
    }
    this.provider.value = new SyntaxRangeProvider(editor.getModel(), selectedProviders, onProviderUpdate, this._foldingLimitReporter, void 0);
  }
  isProviderValid() {
    return this.provider !== void 0;
  }
  async createModelFromProvider(token) {
    return this.provider.value?.compute(token) ?? null;
  }
};

StickyModelFromCandidateSyntaxFoldingProvider = __decorateClass([
  __decorateParam(2, ILanguageFeaturesService)
], StickyModelFromCandidateSyntaxFoldingProvider);
export { StickyModelProvider, StickyModelCandidateProvider, StickyModelFromCandidateOutlineProvider, StickyModelFromCandidateFoldingProvider, StickyModelFromCandidateIndentationFoldingProvider, StickyModelFromCandidateSyntaxFoldingProvider };
