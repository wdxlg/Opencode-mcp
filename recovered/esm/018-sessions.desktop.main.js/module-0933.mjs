// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/common/editor/resourceEditorInput.ts
import { EditorInput } from "./module-0929.mjs";
import { dirname2, isEqual2 } from "./module-0034.mjs";
import { ByteSize, IFileService, getLargeFileConfirmationLimit } from "./module-0269.mjs";
import { isConfigured } from "./module-0132.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ILabelService } from "./module-0641.mjs";
import { IFilesConfigurationService } from "./module-0931.mjs";
import { ITextResourceConfigurationService } from "./module-0204.mjs";
import { ICustomEditorLabelService } from "./module-0932.mjs";


// src/vs/workbench/common/editor/resourceEditorInput.ts
var AbstractResourceEditorInput = class extends EditorInput {
  constructor(resource, preferredResource, labelService, fileService, filesConfigurationService, textResourceConfigurationService, customEditorLabelService) {
    super();
    this.resource = resource;
    this.labelService = labelService;
    this.fileService = fileService;
    this.filesConfigurationService = filesConfigurationService;
    this.textResourceConfigurationService = textResourceConfigurationService;
    this.customEditorLabelService = customEditorLabelService;
    this._name = void 0;
    this._shortDescription = void 0;
    this._mediumDescription = void 0;
    this._longDescription = void 0;
    this._shortTitle = void 0;
    this._mediumTitle = void 0;
    this._longTitle = void 0;
    this._preferredResource = preferredResource || resource;
    this.registerListeners();
  }
  get capabilities() {
    let capabilities = 32 /* CanSplitInGroup */;
    if (this.fileService.hasProvider(this.resource)) {
      if (this.filesConfigurationService.isReadonly(this.resource)) {
        capabilities |= 2 /* Readonly */;
      }
    } else {
      capabilities |= 4 /* Untitled */;
    }
    if (!(capabilities & 2 /* Readonly */)) {
      capabilities |= 128 /* CanDropIntoEditor */;
    }
    return capabilities;
  }
  get preferredResource() {
    return this._preferredResource;
  }
  registerListeners() {
    this._register(this.labelService.onDidChangeFormatters((e4) => this.onLabelEvent(e4.scheme)));
    this._register(this.fileService.onDidChangeFileSystemProviderRegistrations((e4) => this.onLabelEvent(e4.scheme)));
    this._register(this.fileService.onDidChangeFileSystemProviderCapabilities((e4) => this.onLabelEvent(e4.scheme)));
    this._register(this.customEditorLabelService.onDidChange(() => this.updateLabel()));
    this._register(this.filesConfigurationService.onDidChangeReadonly(() => this._onDidChangeCapabilities.fire()));
  }
  onLabelEvent(scheme) {
    if (scheme === this._preferredResource.scheme) {
      this.updateLabel();
    }
  }
  updateLabel() {
    this._name = void 0;
    this._shortDescription = void 0;
    this._mediumDescription = void 0;
    this._longDescription = void 0;
    this._shortTitle = void 0;
    this._mediumTitle = void 0;
    this._longTitle = void 0;
    this._onDidChangeLabel.fire();
  }
  setPreferredResource(preferredResource) {
    if (!isEqual2(preferredResource, this._preferredResource)) {
      this._preferredResource = preferredResource;
      this.updateLabel();
    }
  }
  getName() {
    if (typeof this._name !== "string") {
      this._name = this.customEditorLabelService.getName(this._preferredResource) ?? this.labelService.getUriBasenameLabel(this._preferredResource);
    }
    return this._name;
  }
  getDescription(verbosity = 1 /* MEDIUM */) {
    switch (verbosity) {
      case 0 /* SHORT */:
        return this.shortDescription;
      case 2 /* LONG */:
        return this.longDescription;
      case 1 /* MEDIUM */:
      default:
        return this.mediumDescription;
    }
  }
  get shortDescription() {
    if (typeof this._shortDescription !== "string") {
      this._shortDescription = this.labelService.getUriBasenameLabel(dirname2(this._preferredResource));
    }
    return this._shortDescription;
  }
  get mediumDescription() {
    if (typeof this._mediumDescription !== "string") {
      this._mediumDescription = this.labelService.getUriLabel(dirname2(this._preferredResource), { relative: true });
    }
    return this._mediumDescription;
  }
  get longDescription() {
    if (typeof this._longDescription !== "string") {
      this._longDescription = this.labelService.getUriLabel(dirname2(this._preferredResource));
    }
    return this._longDescription;
  }
  get shortTitle() {
    if (typeof this._shortTitle !== "string") {
      this._shortTitle = this.getName();
    }
    return this._shortTitle;
  }
  get mediumTitle() {
    if (typeof this._mediumTitle !== "string") {
      this._mediumTitle = this.labelService.getUriLabel(this._preferredResource, { relative: true });
    }
    return this._mediumTitle;
  }
  get longTitle() {
    if (typeof this._longTitle !== "string") {
      this._longTitle = this.labelService.getUriLabel(this._preferredResource);
    }
    return this._longTitle;
  }
  getTitle(verbosity) {
    switch (verbosity) {
      case 0 /* SHORT */:
        return this.shortTitle;
      case 2 /* LONG */:
        return this.longTitle;
      default:
      case 1 /* MEDIUM */:
        return this.mediumTitle;
    }
  }
  isReadonly() {
    return this.filesConfigurationService.isReadonly(this.resource);
  }
  ensureLimits(options3) {
    if (options3?.limits) {
      return options3.limits;
    }
    const defaultSizeLimit = getLargeFileConfirmationLimit(this.resource);
    let configuredSizeLimit;
    const configuredSizeLimitMb = this.textResourceConfigurationService.inspect(this.resource, null, "workbench.editorLargeFileConfirmation");
    if (isConfigured(configuredSizeLimitMb)) {
      configuredSizeLimit = configuredSizeLimitMb.value * ByteSize.MB;
    }
    return {
      size: configuredSizeLimit ?? defaultSizeLimit
    };
  }
};

AbstractResourceEditorInput = __decorateClass([
  __decorateParam(2, ILabelService),
  __decorateParam(3, IFileService),
  __decorateParam(4, IFilesConfigurationService),
  __decorateParam(5, ITextResourceConfigurationService),
  __decorateParam(6, ICustomEditorLabelService)
], AbstractResourceEditorInput);
export { AbstractResourceEditorInput };
