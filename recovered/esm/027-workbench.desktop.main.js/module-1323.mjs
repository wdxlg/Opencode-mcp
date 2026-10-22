// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/browser/labels.ts
import { URI } from "./module-0032.mjs";
import { Emitter, Event2 } from "./module-0017.mjs";
import { Disposable, MutableDisposable, dispose } from "./module-0012.mjs";
import { FILES_ASSOCIATIONS_CONFIG } from "./module-0269.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IModelService } from "./module-0080.mjs";
import { IWorkspaceContextService } from "./module-0509.mjs";
import { ILanguageService } from "./module-0133.mjs";
import { DECORATION_LABEL_COLOR_CLASS, IDecorationsService } from "./module-1067.mjs";
import { IThemeService } from "./module-0287.mjs";
import { ILabelService } from "./module-0641.mjs";
import { ITextFileService } from "./module-1063.mjs";
import { IconLabel } from "./module-0640.mjs";
import { basenameOrAuthority, dirname2, isEqual2 } from "./module-0034.mjs";
import { normalizeDriveLetter } from "./module-0711.mjs";
import { Schemas } from "./module-0033.mjs";
import { localize } from "./module-0001.mjs";
import { INotebookDocumentService, extractCellOutputDetails } from "./module-0908.mjs";
import { getIconClasses } from "./module-0755.mjs";


// src/vs/workbench/browser/labels.ts
function toResource(props) {
  if (!props?.resource) {
    return void 0;
  }
  if (URI.isUri(props.resource)) {
    return props.resource;
  }
  return props.resource.primary;
}

var DEFAULT_LABELS_CONTAINER = {
  onDidChangeVisibility: Event2.None
};

var ResourceLabels = class extends Disposable {
  constructor(container3, instantiationService, configurationService, modelService, workspaceService, languageService, decorationsService, themeService, labelService, textFileService) {
    super();
    this.instantiationService = instantiationService;
    this.configurationService = configurationService;
    this.modelService = modelService;
    this.workspaceService = workspaceService;
    this.languageService = languageService;
    this.decorationsService = decorationsService;
    this.themeService = themeService;
    this.labelService = labelService;
    this.textFileService = textFileService;
    this._onDidChangeDecorations = this._register(new Emitter());
    this.widgets = [];
    this.labels = [];
    this.registerListeners(container3);
  }
  get onDidChangeDecorations() {
    return this._onDidChangeDecorations.event;
  }
  registerListeners(container3) {
    this._register(container3.onDidChangeVisibility((visible) => {
      this.widgets.forEach((widget) => widget.notifyVisibilityChanged(visible));
    }));
    this._register(this.languageService.onDidChange(() => this.widgets.forEach((widget) => widget.notifyExtensionsRegistered())));
    this._register(this.modelService.onModelLanguageChanged((e) => {
      if (!e.model.uri) {
        return;
      }
      this.widgets.forEach((widget) => widget.notifyModelLanguageChanged(e.model));
    }));
    this._register(this.modelService.onModelAdded((model) => {
      if (!model.uri) {
        return;
      }
      this.widgets.forEach((widget) => widget.notifyModelAdded(model));
    }));
    this._register(this.workspaceService.onDidChangeWorkspaceFolders(() => {
      this.widgets.forEach((widget) => widget.notifyWorkspaceFoldersChange());
    }));
    this._register(this.decorationsService.onDidChangeDecorations((e) => {
      let notifyDidChangeDecorations = false;
      this.widgets.forEach((widget) => {
        if (widget.notifyFileDecorationsChanges(e)) {
          notifyDidChangeDecorations = true;
        }
      });
      if (notifyDidChangeDecorations) {
        this._onDidChangeDecorations.fire();
      }
    }));
    this._register(this.themeService.onDidColorThemeChange(() => this.widgets.forEach((widget) => widget.notifyThemeChange())));
    this._register(this.configurationService.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration(FILES_ASSOCIATIONS_CONFIG)) {
        this.widgets.forEach((widget) => widget.notifyFileAssociationsChange());
      }
    }));
    this._register(this.labelService.onDidChangeFormatters((e) => {
      this.widgets.forEach((widget) => widget.notifyFormattersChange(e.scheme));
    }));
    this._register(this.textFileService.untitled.onDidChangeLabel((model) => {
      this.widgets.forEach((widget) => widget.notifyUntitledLabelChange(model.resource));
    }));
  }
  get(index2) {
    return this.labels[index2];
  }
  create(container3, options3) {
    const widget = this.instantiationService.createInstance(ResourceLabelWidget, container3, options3);
    const label3 = {
      element: widget.element,
      get onDidRender() {
        return widget.onDidRender;
      },
      setLabel: (label4, description, options4) => widget.setLabel(label4, description, options4),
      setResource: (label4, options4) => widget.setResource(label4, options4),
      setFile: (resource, options4) => widget.setFile(resource, options4),
      clear: () => widget.clear(),
      dispose: () => this.disposeWidget(widget)
    };
    this.labels.push(label3);
    this.widgets.push(widget);
    return label3;
  }
  disposeWidget(widget) {
    const index2 = this.widgets.indexOf(widget);
    if (index2 > -1) {
      this.widgets.splice(index2, 1);
      this.labels.splice(index2, 1);
    }
    dispose(widget);
  }
  clear() {
    this.widgets = dispose(this.widgets);
    this.labels = [];
  }
  dispose() {
    super.dispose();
    this.clear();
  }
};

ResourceLabels = __decorateClass([
  __decorateParam(1, IInstantiationService),
  __decorateParam(2, IConfigurationService),
  __decorateParam(3, IModelService),
  __decorateParam(4, IWorkspaceContextService),
  __decorateParam(5, ILanguageService),
  __decorateParam(6, IDecorationsService),
  __decorateParam(7, IThemeService),
  __decorateParam(8, ILabelService),
  __decorateParam(9, ITextFileService)
], ResourceLabels);

var ResourceLabel = class extends ResourceLabels {
  get element() {
    return this.label;
  }
  constructor(container3, options3, instantiationService, configurationService, modelService, workspaceService, languageService, decorationsService, themeService, labelService, textFileService) {
    super(DEFAULT_LABELS_CONTAINER, instantiationService, configurationService, modelService, workspaceService, languageService, decorationsService, themeService, labelService, textFileService);
    this.label = this._register(this.create(container3, options3));
  }
};

ResourceLabel = __decorateClass([
  __decorateParam(2, IInstantiationService),
  __decorateParam(3, IConfigurationService),
  __decorateParam(4, IModelService),
  __decorateParam(5, IWorkspaceContextService),
  __decorateParam(6, ILanguageService),
  __decorateParam(7, IDecorationsService),
  __decorateParam(8, IThemeService),
  __decorateParam(9, ILabelService),
  __decorateParam(10, ITextFileService)
], ResourceLabel);

var ResourceLabelWidget = class extends IconLabel {
  constructor(container3, options3, languageService, modelService, decorationsService, labelService, textFileService, contextService, notebookDocumentService) {
    super(container3, options3);
    this.languageService = languageService;
    this.modelService = modelService;
    this.decorationsService = decorationsService;
    this.labelService = labelService;
    this.textFileService = textFileService;
    this.contextService = contextService;
    this.notebookDocumentService = notebookDocumentService;
    this._onDidRender = this._register(new Emitter());
    this.label = void 0;
    this.decoration = this._register(new MutableDisposable());
    this.options = void 0;
    this.computedIconClasses = void 0;
    this.computedLanguageId = void 0;
    this.computedPathLabel = void 0;
    this.computedWorkspaceFolderLabel = void 0;
    this.needsRedraw = void 0;
    this.isHidden = false;
  }
  get onDidRender() {
    return this._onDidRender.event;
  }
  notifyVisibilityChanged(visible) {
    if (visible === this.isHidden) {
      this.isHidden = !visible;
      if (visible && this.needsRedraw) {
        this.render({
          updateIcon: this.needsRedraw === 2 /* Full */,
          updateDecoration: this.needsRedraw === 2 /* Full */
        });
        this.needsRedraw = void 0;
      }
    }
  }
  notifyModelLanguageChanged(model) {
    this.handleModelEvent(model);
  }
  notifyModelAdded(model) {
    this.handleModelEvent(model);
  }
  handleModelEvent(model) {
    const resource = toResource(this.label);
    if (!resource) {
      return;
    }
    if (isEqual2(model.uri, resource)) {
      if (this.computedLanguageId !== model.getLanguageId()) {
        this.computedLanguageId = model.getLanguageId();
        this.render({ updateIcon: true, updateDecoration: false });
      }
    }
  }
  notifyFileDecorationsChanges(e) {
    if (!this.options) {
      return false;
    }
    const resource = toResource(this.label);
    if (!resource) {
      return false;
    }
    if (this.options.fileDecorations && e.affectsResource(resource)) {
      return this.render({ updateIcon: false, updateDecoration: true });
    }
    return false;
  }
  notifyExtensionsRegistered() {
    this.render({ updateIcon: true, updateDecoration: false });
  }
  notifyThemeChange() {
    this.render({ updateIcon: false, updateDecoration: false });
  }
  notifyFileAssociationsChange() {
    this.render({ updateIcon: true, updateDecoration: false });
  }
  notifyFormattersChange(scheme) {
    if (toResource(this.label)?.scheme === scheme) {
      this.render({ updateIcon: false, updateDecoration: false });
    }
  }
  notifyUntitledLabelChange(resource) {
    if (isEqual2(resource, toResource(this.label))) {
      this.render({ updateIcon: false, updateDecoration: false });
    }
  }
  notifyWorkspaceFoldersChange() {
    if (typeof this.computedWorkspaceFolderLabel === "string") {
      const resource = toResource(this.label);
      if (URI.isUri(resource) && this.label?.name === this.computedWorkspaceFolderLabel) {
        this.setFile(resource, this.options);
      }
    }
  }
  setFile(resource, options3) {
    const hideLabel = options3?.hideLabel;
    let name;
    if (!hideLabel) {
      if (options3?.fileKind === 2 /* ROOT_FOLDER */) {
        const workspaceFolder = this.contextService.getWorkspaceFolder(resource);
        if (workspaceFolder) {
          name = workspaceFolder.name;
          this.computedWorkspaceFolderLabel = name;
        }
      }
      if (!name) {
        name = normalizeDriveLetter(basenameOrAuthority(resource));
      }
    }
    let description;
    if (!options3?.hidePath) {
      const descriptionCandidate = this.labelService.getUriLabel(dirname2(resource), { relative: true });
      if (descriptionCandidate && descriptionCandidate !== ".") {
        description = descriptionCandidate;
      }
    }
    this.setResource({ resource, name, description, range: options3?.range }, options3);
  }
  setResource(label3, options3 = /* @__PURE__ */ Object.create(null)) {
    const resource = toResource(label3);
    const isSideBySideEditor = label3?.resource && !URI.isUri(label3.resource);
    if (!options3.forceLabel && !isSideBySideEditor && resource?.scheme === Schemas.untitled) {
      const untitledModel = this.textFileService.untitled.get(resource);
      if (untitledModel && !untitledModel.hasAssociatedFilePath) {
        if (typeof label3.name === "string") {
          label3.name = untitledModel.name;
        }
        if (typeof label3.description === "string") {
          const untitledDescription = untitledModel.resource.path;
          if (label3.name !== untitledDescription) {
            label3.description = untitledDescription;
          } else {
            label3.description = void 0;
          }
        }
        const untitledTitle = untitledModel.resource.path;
        if (untitledModel.name !== untitledTitle) {
          options3.title = `${untitledModel.name} \u2022 ${untitledTitle}`;
        } else {
          options3.title = untitledTitle;
        }
      }
    }
    if (!options3.forceLabel && !isSideBySideEditor && resource?.scheme === Schemas.vscodeNotebookCell) {
      const notebookDocument = this.notebookDocumentService.getNotebook(resource);
      const cellIndex = notebookDocument?.getCellIndex(resource);
      if (notebookDocument && cellIndex !== void 0 && typeof label3.name === "string") {
        options3.title = localize(6196, null, label3.name, `${cellIndex + 1}`);
      }
      if (typeof label3.name === "string" && notebookDocument && cellIndex !== void 0 && typeof label3.name === "string") {
        label3.name = localize(6196, null, label3.name, `${cellIndex + 1}`);
      }
    }
    if (!options3.forceLabel && !isSideBySideEditor && resource?.scheme === Schemas.vscodeNotebookCellOutput) {
      const notebookDocument = this.notebookDocumentService.getNotebook(resource);
      const outputUriData = extractCellOutputDetails(resource);
      if (outputUriData?.cellFragment) {
        if (!outputUriData.notebook) {
          return;
        }
        const cellUri = outputUriData.notebook.with({
          scheme: Schemas.vscodeNotebookCell,
          fragment: outputUriData.cellFragment
        });
        const cellIndex = notebookDocument?.getCellIndex(cellUri);
        const outputIndex = outputUriData.outputIndex;
        if (cellIndex !== void 0 && outputIndex !== void 0 && typeof label3.name === "string") {
          label3.name = localize(
            6197,
            null,
            label3.name,
            `${cellIndex + 1}`,
            `${outputIndex + 1}`
          );
        } else if (cellIndex !== void 0 && typeof label3.name === "string") {
          label3.name = localize(
            6198,
            null,
            label3.name,
            `${cellIndex + 1}`
          );
        }
      }
    }
    if (options3.namePrefix) {
      if (typeof label3.name === "string") {
        label3.name = options3.namePrefix + label3.name;
      } else if (Array.isArray(label3.name) && label3.name.length > 0) {
        label3.name = [options3.namePrefix + label3.name[0], ...label3.name.slice(1)];
      }
    }
    if (options3.nameSuffix) {
      if (typeof label3.name === "string") {
        label3.name = label3.name + options3.nameSuffix;
      } else if (Array.isArray(label3.name) && label3.name.length > 0) {
        label3.name = [...label3.name.slice(0, label3.name.length - 1), label3.name[label3.name.length - 1] + options3.nameSuffix];
      }
    }
    const hasResourceChanged = this.hasResourceChanged(label3);
    const hasPathLabelChanged = hasResourceChanged || this.hasPathLabelChanged(label3);
    const hasFileKindChanged = this.hasFileKindChanged(options3);
    const hasIconChanged = this.hasIconChanged(options3);
    this.label = label3;
    this.options = options3;
    if (hasResourceChanged) {
      this.computedLanguageId = void 0;
    }
    if (hasPathLabelChanged) {
      this.computedPathLabel = void 0;
    }
    this.render({
      updateIcon: hasResourceChanged || hasFileKindChanged || hasIconChanged,
      updateDecoration: hasResourceChanged || hasFileKindChanged
    });
  }
  hasFileKindChanged(newOptions) {
    const newFileKind = newOptions?.fileKind;
    const oldFileKind = this.options?.fileKind;
    return newFileKind !== oldFileKind;
  }
  hasResourceChanged(newLabel) {
    const newResource = toResource(newLabel);
    const oldResource = toResource(this.label);
    if (newResource && oldResource) {
      return newResource.toString() !== oldResource.toString();
    }
    if (!newResource && !oldResource) {
      return false;
    }
    return true;
  }
  hasPathLabelChanged(newLabel) {
    const newResource = toResource(newLabel);
    return !!newResource && this.computedPathLabel !== this.labelService.getUriLabel(newResource);
  }
  hasIconChanged(newOptions) {
    return this.options?.icon !== newOptions?.icon;
  }
  clear() {
    this.label = void 0;
    this.options = void 0;
    this.computedLanguageId = void 0;
    this.computedIconClasses = void 0;
    this.computedPathLabel = void 0;
    this.setLabel("");
  }
  render(options3) {
    if (this.isHidden) {
      if (this.needsRedraw !== 2 /* Full */) {
        this.needsRedraw = options3.updateIcon || options3.updateDecoration ? 2 /* Full */ : 1 /* Basic */;
      }
      return false;
    }
    if (options3.updateIcon) {
      this.computedIconClasses = void 0;
    }
    if (!this.label) {
      return false;
    }
    const iconLabelOptions = {
      title: "",
      bold: this.options?.bold,
      italic: this.options?.italic,
      strikethrough: this.options?.strikethrough,
      matches: this.options?.matches,
      descriptionMatches: this.options?.descriptionMatches,
      extraClasses: [],
      separator: this.options?.separator,
      domId: this.options?.domId,
      disabledCommand: this.options?.disabledCommand,
      labelEscapeNewLines: this.options?.labelEscapeNewLines,
      descriptionTitle: this.options?.descriptionTitle,
      supportIcons: this.options?.supportIcons
    };
    const resource = toResource(this.label);
    if (this.options?.title !== void 0) {
      iconLabelOptions.title = this.options.title;
    }
    if (resource && resource.scheme !== Schemas.data && (!this.options?.title || typeof this.options.title !== "string" && !this.options.title.markdownNotSupportedFallback)) {
      if (!this.computedPathLabel) {
        this.computedPathLabel = this.labelService.getUriLabel(resource);
      }
      if (!iconLabelOptions.title || typeof iconLabelOptions.title === "string") {
        iconLabelOptions.title = this.computedPathLabel;
      } else if (!iconLabelOptions.title.markdownNotSupportedFallback) {
        iconLabelOptions.title.markdownNotSupportedFallback = this.computedPathLabel;
      }
    }
    if (this.options && !this.options.hideIcon) {
      if (!this.computedIconClasses) {
        this.computedIconClasses = getIconClasses(this.modelService, this.languageService, resource, this.options.fileKind, this.options.icon);
      }
      if (URI.isUri(this.options.icon)) {
        iconLabelOptions.iconPath = this.options.icon;
      }
      iconLabelOptions.extraClasses = this.computedIconClasses.slice(0);
    }
    if (this.options?.extraClasses) {
      iconLabelOptions.extraClasses.push(...this.options.extraClasses);
    }
    if (this.options?.fileDecorations && resource) {
      if (options3.updateDecoration) {
        this.decoration.value = this.decorationsService.getDecoration(resource, this.options.fileKind !== 0 /* FILE */);
      }
      const decoration3 = this.decoration.value;
      if (decoration3) {
        if (decoration3.tooltip) {
          if (typeof iconLabelOptions.title === "string") {
            iconLabelOptions.title = `${iconLabelOptions.title} \u2022 ${decoration3.tooltip}`;
          } else if (typeof iconLabelOptions.title?.markdown === "string") {
            const title = `${iconLabelOptions.title.markdown} \u2022 ${decoration3.tooltip}`;
            iconLabelOptions.title = { markdown: title, markdownNotSupportedFallback: title };
          }
        }
        if (decoration3.strikethrough) {
          iconLabelOptions.strikethrough = true;
        }
        if (this.options.fileDecorations.colors) {
          iconLabelOptions.extraClasses.push(DECORATION_LABEL_COLOR_CLASS, decoration3.labelClassName);
        }
        if (this.options.fileDecorations.badges) {
          iconLabelOptions.extraClasses.push(decoration3.badgeClassName);
          iconLabelOptions.extraClasses.push(decoration3.iconClassName);
        }
      }
    }
    if (this.label.range) {
      iconLabelOptions.suffix = this.label.range.startLineNumber !== this.label.range.endLineNumber ? `:${this.label.range.startLineNumber}-${this.label.range.endLineNumber}` : `:${this.label.range.startLineNumber}`;
    }
    this.setLabel(this.label.name ?? "", this.label.description, iconLabelOptions);
    this._onDidRender.fire();
    return true;
  }
  dispose() {
    super.dispose();
    this.label = void 0;
    this.options = void 0;
    this.computedLanguageId = void 0;
    this.computedIconClasses = void 0;
    this.computedPathLabel = void 0;
    this.computedWorkspaceFolderLabel = void 0;
  }
};

ResourceLabelWidget = __decorateClass([
  __decorateParam(2, ILanguageService),
  __decorateParam(3, IModelService),
  __decorateParam(4, IDecorationsService),
  __decorateParam(5, ILabelService),
  __decorateParam(6, ITextFileService),
  __decorateParam(7, IWorkspaceContextService),
  __decorateParam(8, INotebookDocumentService)
], ResourceLabelWidget);
export { toResource, DEFAULT_LABELS_CONTAINER, ResourceLabels, ResourceLabel, ResourceLabelWidget };
