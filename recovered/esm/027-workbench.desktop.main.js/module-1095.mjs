// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/common/editor/sideBySideEditorInput.ts
import { EditorInput } from "./module-0928.mjs";
import { Event2 } from "./module-0017.mjs";
import { localize } from "./module-0001.mjs";
import { EditorExtensions, findViewStateForEditor, isDiffEditorInput, isEditorInput, isResourceDiffEditorInput, isResourceEditorInput, isResourceMergeEditorInput, isResourceMultiDiffEditorInput, isResourceSideBySideEditorInput } from "./module-0925.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IEditorService } from "./module-0934.mjs";
import { Registry } from "./module-0090.mjs";


// src/vs/workbench/common/editor/sideBySideEditorInput.ts
var SideBySideEditorInput = class extends EditorInput {
  constructor(preferredName, preferredDescription, secondary, primary, editorService) {
    super();
    this.preferredName = preferredName;
    this.preferredDescription = preferredDescription;
    this.secondary = secondary;
    this.primary = primary;
    this.editorService = editorService;
    this.hasIdenticalSides = this.primary.matches(this.secondary);
    this.registerListeners();
  }
  static {
    this.ID = "workbench.editorinputs.sidebysideEditorInput";
  }
  get typeId() {
    return SideBySideEditorInput.ID;
  }
  get capabilities() {
    let capabilities = this.primary.capabilities;
    capabilities &= ~32 /* CanSplitInGroup */;
    if (this.secondary.hasCapability(16 /* RequiresTrust */)) {
      capabilities |= 16 /* RequiresTrust */;
    }
    if (this.secondary.hasCapability(8 /* Singleton */)) {
      capabilities |= 8 /* Singleton */;
    }
    if (this.secondary.hasCapability(1024 /* ForceReveal */)) {
      capabilities |= 1024 /* ForceReveal */;
    }
    capabilities |= 256 /* MultipleEditors */;
    return capabilities;
  }
  get resource() {
    if (this.hasIdenticalSides) {
      return this.primary.resource;
    }
    return void 0;
  }
  registerListeners() {
    this._register(Event2.once(Event2.any(this.primary.onWillDispose, this.secondary.onWillDispose))(() => {
      if (!this.isDisposed()) {
        this.dispose();
      }
    }));
    this._register(this.primary.onDidChangeDirty(() => this._onDidChangeDirty.fire()));
    this._register(this.primary.onDidChangeCapabilities(() => this._onDidChangeCapabilities.fire()));
    this._register(this.secondary.onDidChangeCapabilities(() => this._onDidChangeCapabilities.fire()));
    this._register(this.primary.onDidChangeLabel(() => this._onDidChangeLabel.fire()));
    this._register(this.secondary.onDidChangeLabel(() => this._onDidChangeLabel.fire()));
  }
  getName() {
    const preferredName = this.getPreferredName();
    if (preferredName) {
      return preferredName;
    }
    if (this.hasIdenticalSides) {
      return this.primary.getName();
    }
    return localize(7380, null, this.secondary.getName(), this.primary.getName());
  }
  getPreferredName() {
    return this.preferredName;
  }
  getDescription(verbosity) {
    const preferredDescription = this.getPreferredDescription();
    if (preferredDescription) {
      return preferredDescription;
    }
    if (this.hasIdenticalSides) {
      return this.primary.getDescription(verbosity);
    }
    return super.getDescription(verbosity);
  }
  getPreferredDescription() {
    return this.preferredDescription;
  }
  getTitle(verbosity) {
    let title;
    if (this.hasIdenticalSides) {
      title = this.primary.getTitle(verbosity) ?? this.getName();
    } else {
      title = super.getTitle(verbosity);
    }
    const preferredTitle = this.getPreferredTitle();
    if (preferredTitle) {
      title = `${preferredTitle} (${title})`;
    }
    return title;
  }
  getPreferredTitle() {
    if (this.preferredName && this.preferredDescription) {
      return `${this.preferredName} ${this.preferredDescription}`;
    }
    if (this.preferredName || this.preferredDescription) {
      return this.preferredName ?? this.preferredDescription;
    }
    return void 0;
  }
  getLabelExtraClasses() {
    if (this.hasIdenticalSides) {
      return this.primary.getLabelExtraClasses();
    }
    return super.getLabelExtraClasses();
  }
  getAriaLabel() {
    if (this.hasIdenticalSides) {
      return this.primary.getAriaLabel();
    }
    return super.getAriaLabel();
  }
  getTelemetryDescriptor() {
    const descriptor = this.primary.getTelemetryDescriptor();
    return { ...descriptor, ...super.getTelemetryDescriptor() };
  }
  isDirty() {
    return this.primary.isDirty();
  }
  isSaving() {
    return this.primary.isSaving();
  }
  async save(group2, options3) {
    const primarySaveResult = await this.primary.save(group2, options3);
    return this.saveResultToEditor(primarySaveResult);
  }
  async saveAs(group2, options3) {
    const primarySaveResult = await this.primary.saveAs(group2, options3);
    return this.saveResultToEditor(primarySaveResult);
  }
  saveResultToEditor(primarySaveResult) {
    if (!primarySaveResult || !this.hasIdenticalSides) {
      return primarySaveResult;
    }
    if (this.primary.matches(primarySaveResult)) {
      return this;
    }
    if (primarySaveResult instanceof EditorInput) {
      return new SideBySideEditorInput(this.preferredName, this.preferredDescription, primarySaveResult, primarySaveResult, this.editorService);
    }
    if (!isResourceDiffEditorInput(primarySaveResult) && !isResourceMultiDiffEditorInput(primarySaveResult) && !isResourceSideBySideEditorInput(primarySaveResult) && !isResourceMergeEditorInput(primarySaveResult)) {
      return {
        primary: primarySaveResult,
        secondary: primarySaveResult,
        label: this.preferredName,
        description: this.preferredDescription
      };
    }
    return void 0;
  }
  revert(group2, options3) {
    return this.primary.revert(group2, options3);
  }
  async rename(group2, target) {
    if (!this.hasIdenticalSides) {
      return;
    }
    const renameResult = await this.primary.rename(group2, target);
    if (!renameResult) {
      return void 0;
    }
    if (isEditorInput(renameResult.editor)) {
      return {
        editor: new SideBySideEditorInput(this.preferredName, this.preferredDescription, renameResult.editor, renameResult.editor, this.editorService),
        options: {
          ...renameResult.options,
          viewState: findViewStateForEditor(this, group2, this.editorService)
        }
      };
    }
    if (isResourceEditorInput(renameResult.editor)) {
      return {
        editor: {
          label: this.preferredName,
          description: this.preferredDescription,
          primary: renameResult.editor,
          secondary: renameResult.editor,
          options: {
            ...renameResult.options,
            viewState: findViewStateForEditor(this, group2, this.editorService)
          }
        }
      };
    }
    return void 0;
  }
  isReadonly() {
    return this.primary.isReadonly();
  }
  toUntyped(options3) {
    const primaryResourceEditorInput = this.primary.toUntyped(options3);
    const secondaryResourceEditorInput = this.secondary.toUntyped(options3);
    if (primaryResourceEditorInput && secondaryResourceEditorInput && !isResourceDiffEditorInput(primaryResourceEditorInput) && !isResourceDiffEditorInput(secondaryResourceEditorInput) && !isResourceMultiDiffEditorInput(primaryResourceEditorInput) && !isResourceMultiDiffEditorInput(secondaryResourceEditorInput) && !isResourceSideBySideEditorInput(primaryResourceEditorInput) && !isResourceSideBySideEditorInput(secondaryResourceEditorInput) && !isResourceMergeEditorInput(primaryResourceEditorInput) && !isResourceMergeEditorInput(secondaryResourceEditorInput)) {
      const untypedInput = {
        label: this.preferredName,
        description: this.preferredDescription,
        primary: primaryResourceEditorInput,
        secondary: secondaryResourceEditorInput
      };
      if (typeof options3?.preserveViewState === "number") {
        untypedInput.options = {
          viewState: findViewStateForEditor(this, options3.preserveViewState, this.editorService)
        };
      }
      return untypedInput;
    }
    return void 0;
  }
  matches(otherInput) {
    if (this === otherInput) {
      return true;
    }
    if (isDiffEditorInput(otherInput) || isResourceDiffEditorInput(otherInput)) {
      return false;
    }
    if (otherInput instanceof SideBySideEditorInput) {
      return this.primary.matches(otherInput.primary) && this.secondary.matches(otherInput.secondary);
    }
    if (isResourceSideBySideEditorInput(otherInput)) {
      return this.primary.matches(otherInput.primary) && this.secondary.matches(otherInput.secondary);
    }
    return false;
  }
};

SideBySideEditorInput = __decorateClass([
  __decorateParam(4, IEditorService)
], SideBySideEditorInput);

var AbstractSideBySideEditorInputSerializer = class {
  canSerialize(editorInput) {
    const input = editorInput;
    if (input.primary && input.secondary) {
      const [secondaryInputSerializer, primaryInputSerializer] = this.getSerializers(input.secondary.typeId, input.primary.typeId);
      return !!(secondaryInputSerializer?.canSerialize(input.secondary) && primaryInputSerializer?.canSerialize(input.primary));
    }
    return false;
  }
  serialize(editorInput) {
    const input = editorInput;
    if (input.primary && input.secondary) {
      const [secondaryInputSerializer, primaryInputSerializer] = this.getSerializers(input.secondary.typeId, input.primary.typeId);
      if (primaryInputSerializer && secondaryInputSerializer) {
        const primarySerialized = primaryInputSerializer.serialize(input.primary);
        const secondarySerialized = secondaryInputSerializer.serialize(input.secondary);
        if (primarySerialized && secondarySerialized) {
          const serializedEditorInput = {
            name: input.getPreferredName(),
            description: input.getPreferredDescription(),
            primarySerialized,
            secondarySerialized,
            primaryTypeId: input.primary.typeId,
            secondaryTypeId: input.secondary.typeId
          };
          return JSON.stringify(serializedEditorInput);
        }
      }
    }
    return void 0;
  }
  deserialize(instantiationService, serializedEditorInput) {
    const deserialized = JSON.parse(serializedEditorInput);
    const [secondaryInputSerializer, primaryInputSerializer] = this.getSerializers(deserialized.secondaryTypeId, deserialized.primaryTypeId);
    if (primaryInputSerializer && secondaryInputSerializer) {
      const primaryInput = primaryInputSerializer.deserialize(instantiationService, deserialized.primarySerialized);
      const secondaryInput = secondaryInputSerializer.deserialize(instantiationService, deserialized.secondarySerialized);
      if (primaryInput instanceof EditorInput && secondaryInput instanceof EditorInput) {
        return this.createEditorInput(instantiationService, deserialized.name, deserialized.description, secondaryInput, primaryInput);
      }
    }
    return void 0;
  }
  getSerializers(secondaryEditorInputTypeId, primaryEditorInputTypeId) {
    const registry4 = Registry.as(EditorExtensions.EditorFactory);
    return [registry4.getEditorSerializer(secondaryEditorInputTypeId), registry4.getEditorSerializer(primaryEditorInputTypeId)];
  }
};

var SideBySideEditorInputSerializer = class extends AbstractSideBySideEditorInputSerializer {
  createEditorInput(instantiationService, name, description, secondaryInput, primaryInput) {
    return instantiationService.createInstance(SideBySideEditorInput, name, description, secondaryInput, primaryInput);
  }
};
export { SideBySideEditorInput, AbstractSideBySideEditorInputSerializer, SideBySideEditorInputSerializer };
