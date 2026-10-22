// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/services/untitled/common/untitledTextEditorModel.ts
import { BaseTextEditorModel } from "./module-1098.mjs";
import { Emitter } from "./module-0017.mjs";
import { NO_TYPE_ID } from "./module-1122.mjs";
import { createTextBufferFactory, createTextBufferFactoryFromStream } from "./module-0423.mjs";
import { UTF8 } from "./module-1123.mjs";
import { VSBuffer, bufferToReadable, bufferToStream } from "./module-0038.mjs";
import { assertReturnsDefined } from "./module-0010.mjs";
import { getCharContainingOffset } from "./module-0030.mjs";
import { ensureValidWordDefinition } from "./module-0103.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ILanguageService } from "./module-0133.mjs";
import { IModelService } from "./module-0080.mjs";
import { IWorkingCopyBackupService } from "./module-1121.mjs";
import { ITextResourceConfigurationService } from "./module-0204.mjs";
import { IWorkingCopyService } from "./module-1072.mjs";
import { ITextFileService } from "./module-1063.mjs";
import { ILabelService } from "./module-0641.mjs";
import { IEditorService } from "./module-0934.mjs";
import { ILanguageDetectionService } from "./module-1097.mjs";
import { IAccessibilityService } from "./module-0104.mjs";


// src/vs/workbench/services/untitled/common/untitledTextEditorModel.ts
var UntitledTextEditorModel = class extends BaseTextEditorModel {
  //#endregion
  constructor(resource, hasAssociatedFilePath, initialValue, preferredLanguageId, preferredEncoding, languageService, modelService, workingCopyBackupService, textResourceConfigurationService, workingCopyService, textFileService, labelService, editorService, languageDetectionService, accessibilityService) {
    super(modelService, languageService, languageDetectionService, accessibilityService);
    this.resource = resource;
    this.hasAssociatedFilePath = hasAssociatedFilePath;
    this.initialValue = initialValue;
    this.preferredLanguageId = preferredLanguageId;
    this.preferredEncoding = preferredEncoding;
    this.workingCopyBackupService = workingCopyBackupService;
    this.textResourceConfigurationService = textResourceConfigurationService;
    this.workingCopyService = workingCopyService;
    this.textFileService = textFileService;
    this.labelService = labelService;
    this.editorService = editorService;
    //#region Events
    this._onDidChangeContent = this._register(new Emitter());
    this.onDidChangeContent = this._onDidChangeContent.event;
    this._onDidChangeName = this._register(new Emitter());
    this.onDidChangeName = this._onDidChangeName.event;
    this._onDidChangeDirty = this._register(new Emitter());
    this.onDidChangeDirty = this._onDidChangeDirty.event;
    this._onDidChangeEncoding = this._register(new Emitter());
    this.onDidChangeEncoding = this._onDidChangeEncoding.event;
    this._onDidSave = this._register(new Emitter());
    this.onDidSave = this._onDidSave.event;
    this._onDidRevert = this._register(new Emitter());
    this.onDidRevert = this._onDidRevert.event;
    //#endregion
    this.typeId = NO_TYPE_ID;
    // IMPORTANT: never change this to not break existing assumptions (e.g. backups)
    this.capabilities = 2 /* Untitled */;
    //#region Name
    this.configuredLabelFormat = "content";
    this.cachedModelFirstLineWords = void 0;
    //#endregion
    //#region Resolve
    this.ignoreDirtyOnModelContentChange = false;
    this.dirty = this.hasAssociatedFilePath || !!this.initialValue;
    this._register(this.workingCopyService.registerWorkingCopy(this));
    if (preferredLanguageId) {
      this.setLanguageId(preferredLanguageId);
    }
    this.onConfigurationChange(void 0, false);
    this.registerListeners();
  }
  static {
    this.FIRST_LINE_NAME_MAX_LENGTH = 40;
  }
  static {
    this.FIRST_LINE_NAME_CANDIDATE_MAX_LENGTH = this.FIRST_LINE_NAME_MAX_LENGTH * 10;
  }
  static {
    // Support the special '${activeEditorLanguage}' language by
    // looking up the language id from the editor that is active
    // before the untitled editor opens. This special id is only
    // used for the initial language and can be changed after the
    // fact (either manually or through auto-detection).
    this.ACTIVE_EDITOR_LANGUAGE_ID = "${activeEditorLanguage}";
  }
  get name() {
    if (this.configuredLabelFormat === "content" && !this.hasAssociatedFilePath && this.cachedModelFirstLineWords) {
      return this.cachedModelFirstLineWords;
    }
    return this.labelService.getUriBasenameLabel(this.resource);
  }
  registerListeners() {
    this._register(this.textResourceConfigurationService.onDidChangeConfiguration((e) => this.onConfigurationChange(e, true)));
  }
  onConfigurationChange(e, fromEvent) {
    if (!e || e.affectsConfiguration(this.resource, "files.encoding")) {
      const configuredEncoding = this.textResourceConfigurationService.getValue(this.resource, "files.encoding");
      if (this.configuredEncoding !== configuredEncoding && typeof configuredEncoding === "string") {
        this.configuredEncoding = configuredEncoding;
        if (fromEvent && !this.preferredEncoding) {
          this._onDidChangeEncoding.fire();
        }
      }
    }
    if (!e || e.affectsConfiguration(this.resource, "workbench.editor.untitled.labelFormat")) {
      const configuredLabelFormat = this.textResourceConfigurationService.getValue(this.resource, "workbench.editor.untitled.labelFormat");
      if (this.configuredLabelFormat !== configuredLabelFormat && (configuredLabelFormat === "content" || configuredLabelFormat === "name")) {
        this.configuredLabelFormat = configuredLabelFormat;
        if (fromEvent) {
          this._onDidChangeName.fire();
        }
      }
    }
  }
  //#region Language
  setLanguageId(languageId, source) {
    const actualLanguage = languageId === UntitledTextEditorModel.ACTIVE_EDITOR_LANGUAGE_ID ? this.editorService.activeTextEditorLanguageId : languageId;
    this.preferredLanguageId = actualLanguage;
    if (actualLanguage) {
      super.setLanguageId(actualLanguage, source);
    }
  }
  getLanguageId() {
    if (this.textEditorModel) {
      return this.textEditorModel.getLanguageId();
    }
    return this.preferredLanguageId;
  }
  getEncoding() {
    return this.preferredEncoding || this.configuredEncoding;
  }
  async setEncoding(encoding) {
    const oldEncoding = this.getEncoding();
    this.preferredEncoding = encoding;
    if (oldEncoding !== this.preferredEncoding) {
      this._onDidChangeEncoding.fire();
    }
  }
  isDirty() {
    return this.dirty;
  }
  isModified() {
    return this.isDirty();
  }
  setDirty(dirty) {
    if (this.dirty === dirty) {
      return;
    }
    this.dirty = dirty;
    this._onDidChangeDirty.fire();
  }
  //#endregion
  //#region Save / Revert / Backup
  async save(options3) {
    const target = await this.textFileService.save(this.resource, options3);
    if (target) {
      this._onDidSave.fire({ reason: options3?.reason, source: options3?.source });
    }
    return !!target;
  }
  async revert() {
    this.ignoreDirtyOnModelContentChange = true;
    try {
      this.updateTextEditorModel(createTextBufferFactory(""));
    } finally {
      this.ignoreDirtyOnModelContentChange = false;
    }
    this.setDirty(false);
    this._onDidRevert.fire();
  }
  async backup(token) {
    let content2 = void 0;
    if (this.isResolved()) {
      content2 = await this.textFileService.getEncodedReadable(this.resource, this.createSnapshot() ?? void 0, { encoding: UTF8 });
    } else if (typeof this.initialValue === "string") {
      content2 = bufferToReadable(VSBuffer.fromString(this.initialValue));
    }
    return { content: content2 };
  }
  async resolve() {
    let createdUntitledModel = false;
    let hasBackup = false;
    if (!this.textEditorModel) {
      let untitledContents;
      const backup = await this.workingCopyBackupService.resolve(this);
      if (backup) {
        untitledContents = backup.value;
        hasBackup = true;
      } else {
        untitledContents = bufferToStream(VSBuffer.fromString(this.initialValue || ""));
      }
      const untitledContentsFactory = await createTextBufferFactoryFromStream(await this.textFileService.getDecodedStream(this.resource, untitledContents, { encoding: UTF8 }));
      this.createTextEditorModel(untitledContentsFactory, this.resource, this.preferredLanguageId);
      createdUntitledModel = true;
    } else {
      this.updateTextEditorModel(void 0, this.preferredLanguageId);
    }
    const textEditorModel = assertReturnsDefined(this.textEditorModel);
    this.installModelListeners(textEditorModel);
    if (createdUntitledModel) {
      if (hasBackup || this.initialValue) {
        this.updateNameFromFirstLine(textEditorModel);
      }
      this.setDirty(this.hasAssociatedFilePath || !!hasBackup || !!this.initialValue);
      if (hasBackup || this.initialValue) {
        this._onDidChangeContent.fire();
      }
    }
    return super.resolve();
  }
  isResolved() {
    return !!this.textEditorModelHandle;
  }
  installModelListeners(model) {
    this._register(model.onDidChangeContent((e) => this.onModelContentChanged(model, e)));
    this._register(model.onDidChangeLanguage(() => this.onConfigurationChange(void 0, true)));
    super.installModelListeners(model);
  }
  onModelContentChanged(textEditorModel, e) {
    if (!this.ignoreDirtyOnModelContentChange) {
      if (!this.hasAssociatedFilePath && textEditorModel.getLineCount() === 1 && textEditorModel.getLineLength(1) === 0) {
        this.setDirty(false);
      } else {
        this.setDirty(true);
      }
    }
    if (e.changes.some((change) => (change.range.startLineNumber === 1 || change.range.endLineNumber === 1) && change.range.startColumn <= UntitledTextEditorModel.FIRST_LINE_NAME_CANDIDATE_MAX_LENGTH)) {
      this.updateNameFromFirstLine(textEditorModel);
    }
    this._onDidChangeContent.fire();
    this.autoDetectLanguage();
  }
  updateNameFromFirstLine(textEditorModel) {
    if (this.hasAssociatedFilePath) {
      return;
    }
    let modelFirstWordsCandidate = void 0;
    let firstLineText = textEditorModel.getValueInRange({
      startLineNumber: 1,
      endLineNumber: 1,
      startColumn: 1,
      endColumn: UntitledTextEditorModel.FIRST_LINE_NAME_CANDIDATE_MAX_LENGTH + 1
      // first cap at FIRST_LINE_NAME_CANDIDATE_MAX_LENGTH
    }).trim().replace(/\s+/g, " ").replace(/\u202E/g, "");
    firstLineText = firstLineText.substr(
      0,
      getCharContainingOffset(
        // finally cap at FIRST_LINE_NAME_MAX_LENGTH (grapheme aware #111235)
        firstLineText,
        UntitledTextEditorModel.FIRST_LINE_NAME_MAX_LENGTH
      )[0]
    );
    if (firstLineText && ensureValidWordDefinition().exec(firstLineText)) {
      modelFirstWordsCandidate = firstLineText;
    }
    if (modelFirstWordsCandidate !== this.cachedModelFirstLineWords) {
      this.cachedModelFirstLineWords = modelFirstWordsCandidate;
      this._onDidChangeName.fire();
    }
  }
  //#endregion
  isReadonly() {
    return false;
  }
};

UntitledTextEditorModel = __decorateClass([
  __decorateParam(5, ILanguageService),
  __decorateParam(6, IModelService),
  __decorateParam(7, IWorkingCopyBackupService),
  __decorateParam(8, ITextResourceConfigurationService),
  __decorateParam(9, IWorkingCopyService),
  __decorateParam(10, ITextFileService),
  __decorateParam(11, ILabelService),
  __decorateParam(12, IEditorService),
  __decorateParam(13, ILanguageDetectionService),
  __decorateParam(14, IAccessibilityService)
], UntitledTextEditorModel);
export { UntitledTextEditorModel };
