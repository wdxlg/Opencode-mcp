// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/common/editor/diffEditorInput.ts
import { AbstractSideBySideEditorInputSerializer, SideBySideEditorInput } from "./module-1095.mjs";
import { localize } from "./module-0001.mjs";
import { shorten } from "./module-0711.mjs";
import { BINARY_DIFF_EDITOR_ID, TEXT_DIFF_EDITOR_ID, isResourceDiffEditorInput } from "./module-0925.mjs";
import { BaseTextEditorModel } from "./module-1098.mjs";
import { TextDiffEditorModel } from "./module-1100.mjs";
import { DiffEditorModel } from "./module-1099.mjs";
import { isResolvedEditorModel } from "./module-0156.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IEditorService } from "./module-0934.mjs";


// src/vs/workbench/common/editor/diffEditorInput.ts
var DiffEditorInput = class extends SideBySideEditorInput {
  constructor(preferredName, preferredDescription, original, modified, forceOpenAsBinary, editorService) {
    super(preferredName, preferredDescription, original, modified, editorService);
    this.original = original;
    this.modified = modified;
    this.forceOpenAsBinary = forceOpenAsBinary;
    this.cachedModel = void 0;
    this.labels = this.computeLabels();
  }
  static {
    this.ID = "workbench.editors.diffEditorInput";
  }
  get typeId() {
    return DiffEditorInput.ID;
  }
  get editorId() {
    return this.modified.editorId === this.original.editorId ? this.modified.editorId : void 0;
  }
  get capabilities() {
    let capabilities = super.capabilities;
    if (this.labels.forceDescription) {
      capabilities |= 64 /* ForceDescription */;
    }
    return capabilities;
  }
  computeLabels() {
    let name;
    let forceDescription = false;
    if (this.preferredName) {
      name = this.preferredName;
    } else {
      const originalName = this.original.getName();
      const modifiedName = this.modified.getName();
      name = localize(7379, null, originalName, modifiedName);
      forceDescription = originalName === modifiedName;
    }
    let shortDescription;
    let mediumDescription;
    let longDescription;
    if (this.preferredDescription) {
      shortDescription = this.preferredDescription;
      mediumDescription = this.preferredDescription;
      longDescription = this.preferredDescription;
    } else {
      shortDescription = this.computeLabel(this.original.getDescription(0 /* SHORT */), this.modified.getDescription(0 /* SHORT */));
      longDescription = this.computeLabel(this.original.getDescription(2 /* LONG */), this.modified.getDescription(2 /* LONG */));
      const originalMediumDescription = this.original.getDescription(1 /* MEDIUM */);
      const modifiedMediumDescription = this.modified.getDescription(1 /* MEDIUM */);
      forceDescription = forceDescription && !!originalMediumDescription && !!modifiedMediumDescription && originalMediumDescription !== modifiedMediumDescription;
      if (typeof originalMediumDescription === "string" && typeof modifiedMediumDescription === "string" && // we can only `shorten` when both sides are strings...
      (originalMediumDescription || modifiedMediumDescription)) {
        const [shortenedOriginalMediumDescription, shortenedModifiedMediumDescription] = shorten([originalMediumDescription, modifiedMediumDescription]);
        mediumDescription = this.computeLabel(shortenedOriginalMediumDescription, shortenedModifiedMediumDescription);
      }
    }
    let shortTitle = this.computeLabel(this.original.getTitle(0 /* SHORT */) ?? this.original.getName(), this.modified.getTitle(0 /* SHORT */) ?? this.modified.getName(), " \u2194 ");
    let mediumTitle = this.computeLabel(this.original.getTitle(1 /* MEDIUM */) ?? this.original.getName(), this.modified.getTitle(1 /* MEDIUM */) ?? this.modified.getName(), " \u2194 ");
    let longTitle = this.computeLabel(this.original.getTitle(2 /* LONG */) ?? this.original.getName(), this.modified.getTitle(2 /* LONG */) ?? this.modified.getName(), " \u2194 ");
    const preferredTitle = this.getPreferredTitle();
    if (preferredTitle) {
      shortTitle = `${preferredTitle} (${shortTitle})`;
      mediumTitle = `${preferredTitle} (${mediumTitle})`;
      longTitle = `${preferredTitle} (${longTitle})`;
    }
    return { name, shortDescription, mediumDescription, longDescription, forceDescription, shortTitle, mediumTitle, longTitle };
  }
  computeLabel(originalLabel, modifiedLabel, separator2 = " - ") {
    if (!originalLabel || !modifiedLabel) {
      return void 0;
    }
    if (originalLabel === modifiedLabel) {
      return modifiedLabel;
    }
    return `${originalLabel}${separator2}${modifiedLabel}`;
  }
  getName() {
    return this.labels.name;
  }
  getDescription(verbosity = 1 /* MEDIUM */) {
    switch (verbosity) {
      case 0 /* SHORT */:
        return this.labels.shortDescription;
      case 2 /* LONG */:
        return this.labels.longDescription;
      case 1 /* MEDIUM */:
      default:
        return this.labels.mediumDescription;
    }
  }
  getTitle(verbosity) {
    switch (verbosity) {
      case 0 /* SHORT */:
        return this.labels.shortTitle;
      case 2 /* LONG */:
        return this.labels.longTitle;
      default:
      case 1 /* MEDIUM */:
        return this.labels.mediumTitle;
    }
  }
  async resolve() {
    const resolvedModel = await this.createModel();
    this.cachedModel?.dispose();
    this.cachedModel = resolvedModel;
    return this.cachedModel;
  }
  prefersEditorPane(editorPanes) {
    if (this.forceOpenAsBinary) {
      return editorPanes.find((editorPane) => editorPane.typeId === BINARY_DIFF_EDITOR_ID);
    }
    return editorPanes.find((editorPane) => editorPane.typeId === TEXT_DIFF_EDITOR_ID);
  }
  async createModel() {
    const [originalEditorModel, modifiedEditorModel] = await Promise.all([
      this.original.resolve(),
      this.modified.resolve()
    ]);
    if (modifiedEditorModel instanceof BaseTextEditorModel && originalEditorModel instanceof BaseTextEditorModel) {
      return new TextDiffEditorModel(originalEditorModel, modifiedEditorModel);
    }
    return new DiffEditorModel(isResolvedEditorModel(originalEditorModel) ? originalEditorModel : void 0, isResolvedEditorModel(modifiedEditorModel) ? modifiedEditorModel : void 0);
  }
  toUntyped(options3) {
    const untyped = super.toUntyped(options3);
    if (untyped) {
      return {
        ...untyped,
        modified: untyped.primary,
        original: untyped.secondary
      };
    }
    return void 0;
  }
  matches(otherInput) {
    if (this === otherInput) {
      return true;
    }
    if (otherInput instanceof DiffEditorInput) {
      return this.modified.matches(otherInput.modified) && this.original.matches(otherInput.original) && otherInput.forceOpenAsBinary === this.forceOpenAsBinary;
    }
    if (isResourceDiffEditorInput(otherInput)) {
      return this.modified.matches(otherInput.modified) && this.original.matches(otherInput.original);
    }
    return false;
  }
  dispose() {
    if (this.cachedModel) {
      this.cachedModel.dispose();
      this.cachedModel = void 0;
    }
    super.dispose();
  }
};

DiffEditorInput = __decorateClass([
  __decorateParam(5, IEditorService)
], DiffEditorInput);

var DiffEditorInputSerializer = class extends AbstractSideBySideEditorInputSerializer {
  createEditorInput(instantiationService, name, description, secondaryInput, primaryInput) {
    return instantiationService.createInstance(DiffEditorInput, name, description, secondaryInput, primaryInput, void 0);
  }
};
export { DiffEditorInput, DiffEditorInputSerializer };
