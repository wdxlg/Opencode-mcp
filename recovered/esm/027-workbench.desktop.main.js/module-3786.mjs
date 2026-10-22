// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/services/textfile/browser/textFileService.ts
import { Disposable } from "./module-0012.mjs";
import { TextFileEditorModelManager } from "./module-3785.mjs";
import { SaveSourceRegistry } from "./module-0925.mjs";
import { localize } from "./module-0001.mjs";
import { Emitter } from "./module-0017.mjs";
import { listErrorForeground } from "./module-0232.mjs";
import { Codicon } from "./module-0085.mjs";
import { UTF16be, UTF16le, UTF8, UTF8_with_bom, encodingExists, toDecodeStream, toEncodeReadable } from "./module-1123.mjs";
import { consumeStream } from "./module-0037.mjs";
import { createTextBufferFactoryFromSnapshot, createTextBufferFactoryFromStream } from "./module-0423.mjs";
import { CancellationToken, CancellationTokenSource } from "./module-0025.mjs";
import { bufferToStream } from "./module-0038.mjs";
import { TextFileOperationError, stringToSnapshot, toBufferOrReadable } from "./module-1063.mjs";
import { Schemas } from "./module-0033.mjs";
import { basename2, dirname2, extname2, isEqual2, joinPath, toLocalResource } from "./module-0034.mjs";
import { UntitledTextEditorModel } from "./module-1124.mjs";
import { BaseTextEditorModel } from "./module-1098.mjs";
import { PLAINTEXT_LANGUAGE_ID } from "./module-0141.mjs";
import { extname } from "./module-0026.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IFileService } from "./module-0269.mjs";
import { IUntitledTextEditorService } from "./module-1125.mjs";
import { ILifecycleService } from "./module-0868.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IModelService } from "./module-0080.mjs";
import { IWorkbenchEnvironmentService } from "./module-0935.mjs";
import { IDialogService, IFileDialogService } from "./module-0267.mjs";
import { ITextResourceConfigurationService } from "./module-0204.mjs";
import { IFilesConfigurationService } from "./module-0930.mjs";
import { ICodeEditorService } from "./module-0078.mjs";
import { IPathService } from "./module-0938.mjs";
import { IWorkingCopyFileService } from "./module-1075.mjs";
import { IUriIdentityService } from "./module-0510.mjs";
import { ILanguageService } from "./module-0133.mjs";
import { ILogService } from "./module-0095.mjs";
import { IElevatedFileService } from "./module-1397.mjs";
import { IDecorationsService } from "./module-1067.mjs";
import { IWorkspaceContextService, WORKSPACE_EXTENSION } from "./module-0509.mjs";


// src/vs/workbench/services/textfile/browser/textFileService.ts
var AbstractTextFileService = class extends Disposable {
  constructor(fileService, untitledTextEditorService, lifecycleService, instantiationService, modelService, environmentService, dialogService, fileDialogService, textResourceConfigurationService, filesConfigurationService, codeEditorService, pathService, workingCopyFileService, uriIdentityService, languageService, logService, elevatedFileService, decorationsService) {
    super();
    this.fileService = fileService;
    this.lifecycleService = lifecycleService;
    this.instantiationService = instantiationService;
    this.modelService = modelService;
    this.environmentService = environmentService;
    this.dialogService = dialogService;
    this.fileDialogService = fileDialogService;
    this.textResourceConfigurationService = textResourceConfigurationService;
    this.filesConfigurationService = filesConfigurationService;
    this.codeEditorService = codeEditorService;
    this.pathService = pathService;
    this.workingCopyFileService = workingCopyFileService;
    this.uriIdentityService = uriIdentityService;
    this.languageService = languageService;
    this.logService = logService;
    this.elevatedFileService = elevatedFileService;
    this.decorationsService = decorationsService;
    this.files = this._register(this.instantiationService.createInstance(TextFileEditorModelManager));
    this.untitled = untitledTextEditorService;
    this.provideDecorations();
  }
  static {
    this.TEXTFILE_SAVE_CREATE_SOURCE = SaveSourceRegistry.registerSource("textFileCreate.source", localize(23377, null));
  }
  static {
    this.TEXTFILE_SAVE_REPLACE_SOURCE = SaveSourceRegistry.registerSource("textFileOverwrite.source", localize(23379, null));
  }
  //#region decorations
  provideDecorations() {
    const provider = this._register(new class extends Disposable {
      constructor(files) {
        super();
        this.files = files;
        this.label = localize(23378, null);
        this._onDidChange = this._register(new Emitter());
        this.onDidChange = this._onDidChange.event;
        this.registerListeners();
      }
      registerListeners() {
        this._register(this.files.onDidResolve(({ model }) => {
          if (model.isReadonly() || model.hasState(4 /* ORPHAN */)) {
            this._onDidChange.fire([model.resource]);
          }
        }));
        this._register(this.files.onDidRemove((modelUri) => this._onDidChange.fire([modelUri])));
        this._register(this.files.onDidChangeReadonly((model) => this._onDidChange.fire([model.resource])));
        this._register(this.files.onDidChangeOrphaned((model) => this._onDidChange.fire([model.resource])));
      }
      provideDecorations(uri5) {
        const model = this.files.get(uri5);
        if (!model || model.isDisposed()) {
          return void 0;
        }
        const isReadonly = model.isReadonly();
        const isOrphaned = model.hasState(4 /* ORPHAN */);
        if (isReadonly && isOrphaned) {
          return {
            color: listErrorForeground,
            letter: Codicon.lockSmall,
            strikethrough: true,
            tooltip: localize(23375, null)
          };
        } else if (isReadonly) {
          return {
            letter: Codicon.lockSmall,
            tooltip: localize(23374, null)
          };
        } else if (isOrphaned) {
          return {
            color: listErrorForeground,
            strikethrough: true,
            tooltip: localize(23370, null)
          };
        }
        return void 0;
      }
    }(this.files));
    this._register(this.decorationsService.registerDecorationsProvider(provider));
  }
  get encoding() {
    if (!this._encoding) {
      this._encoding = this._register(this.instantiationService.createInstance(EncodingOracle));
    }
    return this._encoding;
  }
  async read(resource, options3) {
    const [bufferStream, decoder2] = await this.doRead(resource, {
      ...options3,
      // optimization: since we know that the caller does not
      // care about buffering, we indicate this to the reader.
      // this reduces all the overhead the buffered reading
      // has (open, read, close) if the provider supports
      // unbuffered reading.
      preferUnbuffered: true
    });
    return {
      ...bufferStream,
      encoding: decoder2.detected.encoding || UTF8,
      value: await consumeStream(decoder2.stream, (strings) => strings.join(""))
    };
  }
  async readStream(resource, options3) {
    const [bufferStream, decoder2] = await this.doRead(resource, options3);
    return {
      ...bufferStream,
      encoding: decoder2.detected.encoding || UTF8,
      value: await createTextBufferFactoryFromStream(decoder2.stream)
    };
  }
  async doRead(resource, options3) {
    const cts = new CancellationTokenSource();
    let bufferStream;
    if (options3?.preferUnbuffered) {
      const content2 = await this.fileService.readFile(resource, options3, cts.token);
      bufferStream = {
        ...content2,
        value: bufferToStream(content2.value)
      };
    } else {
      bufferStream = await this.fileService.readFileStream(resource, options3, cts.token);
    }
    try {
      const decoder2 = await this.doGetDecodedStream(resource, bufferStream.value, options3);
      return [bufferStream, decoder2];
    } catch (error) {
      cts.dispose(true);
      if (error.decodeStreamErrorKind === 1 /* STREAM_IS_BINARY */) {
        throw new TextFileOperationError(localize(23371, null), 0 /* FILE_IS_BINARY */, options3);
      } else {
        throw error;
      }
    }
  }
  async create(operations, undoInfo) {
    const operationsWithContents = await Promise.all(operations.map(async (operation) => {
      const contents = await this.getEncodedReadable(operation.resource, operation.value);
      return {
        resource: operation.resource,
        contents,
        overwrite: operation.options?.overwrite
      };
    }));
    return this.workingCopyFileService.create(operationsWithContents, CancellationToken.None, undoInfo);
  }
  async write(resource, value2, options3) {
    const readable = await this.getEncodedReadable(resource, value2, options3);
    if (options3?.writeElevated && this.elevatedFileService.isSupported(resource)) {
      return this.elevatedFileService.writeFileElevated(resource, readable, options3);
    }
    return this.fileService.writeFile(resource, readable, options3);
  }
  async getEncodedReadable(resource, value2, options3) {
    const { encoding, addBOM } = await this.encoding.getWriteEncoding(resource, options3);
    if (encoding === UTF8 && !addBOM) {
      return typeof value2 === "undefined" ? void 0 : toBufferOrReadable(value2);
    }
    value2 = value2 || "";
    const snapshot = typeof value2 === "string" ? stringToSnapshot(value2) : value2;
    return toEncodeReadable(snapshot, encoding, { addBOM });
  }
  async getDecodedStream(resource, value2, options3) {
    return (await this.doGetDecodedStream(resource, value2, options3)).stream;
  }
  doGetDecodedStream(resource, stream, options3) {
    return toDecodeStream(stream, {
      acceptTextOnly: options3?.acceptTextOnly ?? false,
      guessEncoding: options3?.autoGuessEncoding || this.textResourceConfigurationService.getValue(resource, "files.autoGuessEncoding"),
      candidateGuessEncodings: options3?.candidateGuessEncodings || this.textResourceConfigurationService.getValue(resource, "files.candidateGuessEncodings"),
      overwriteEncoding: async (detectedEncoding) => this.validateDetectedEncoding(resource, detectedEncoding ?? void 0, options3)
    });
  }
  getEncoding(resource) {
    const model = resource.scheme === Schemas.untitled ? this.untitled.get(resource) : this.files.get(resource);
    return model?.getEncoding() ?? this.encoding.getUnvalidatedEncodingForResource(resource);
  }
  async resolveDecoding(resource, options3) {
    return {
      preferredEncoding: (await this.encoding.getPreferredReadEncoding(resource, options3, void 0)).encoding,
      guessEncoding: options3?.autoGuessEncoding || this.textResourceConfigurationService.getValue(resource, "files.autoGuessEncoding"),
      candidateGuessEncodings: options3?.candidateGuessEncodings || this.textResourceConfigurationService.getValue(resource, "files.candidateGuessEncodings")
    };
  }
  async validateDetectedEncoding(resource, detectedEncoding, options3) {
    const { encoding } = await this.encoding.getPreferredReadEncoding(resource, options3, detectedEncoding);
    return encoding;
  }
  resolveEncoding(resource, options3) {
    return this.encoding.getWriteEncoding(resource, options3);
  }
  //#endregion
  //#region save
  async save(resource, options3) {
    if (resource.scheme === Schemas.untitled) {
      const model = this.untitled.get(resource);
      if (model) {
        let targetUri;
        if (model.hasAssociatedFilePath) {
          targetUri = await this.suggestSavePath(resource);
        } else {
          targetUri = await this.fileDialogService.pickFileToSave(await this.suggestSavePath(resource), options3?.availableFileSystems);
        }
        if (targetUri) {
          return this.saveAs(resource, targetUri, options3);
        }
      }
    } else {
      const model = this.files.get(resource);
      if (model) {
        return await model.save(options3) ? resource : void 0;
      }
    }
    return void 0;
  }
  async saveAs(source, target, options3) {
    if (!target) {
      target = await this.fileDialogService.pickFileToSave(await this.suggestSavePath(options3?.suggestedTarget ?? source), options3?.availableFileSystems);
    }
    if (!target) {
      return;
    }
    if (this.filesConfigurationService.isReadonly(target)) {
      const confirmed = await this.confirmMakeWriteable(target);
      if (!confirmed) {
        return;
      } else {
        this.filesConfigurationService.updateReadonly(target, false);
      }
    }
    if (isEqual2(source, target)) {
      return this.save(source, {
        ...options3,
        force: true
        /* force to save, even if not dirty (https://github.com/microsoft/vscode/issues/99619) */
      });
    }
    if (this.fileService.hasProvider(source) && this.uriIdentityService.extUri.isEqual(source, target) && await this.fileService.exists(source)) {
      await this.workingCopyFileService.move([{ file: { source, target } }], CancellationToken.None);
      const success = await this.save(source, options3);
      if (!success) {
        await this.save(target, options3);
      }
      return target;
    }
    return this.doSaveAs(source, target, options3);
  }
  async doSaveAs(source, target, options3) {
    let success = false;
    let resolvedTextModel;
    if (source.scheme !== Schemas.untitled) {
      const textFileModel = this.files.get(source);
      if (textFileModel?.isResolved()) {
        resolvedTextModel = textFileModel;
      }
    } else {
      const untitledTextModel = this.untitled.get(source);
      if (untitledTextModel?.isResolved()) {
        resolvedTextModel = untitledTextModel;
      }
    }
    if (resolvedTextModel) {
      success = await this.doSaveAsTextFile(resolvedTextModel, source, target, options3);
    } else if (this.fileService.hasProvider(source)) {
      await this.fileService.copy(source, target, true);
      success = true;
    } else {
      const textModel = this.modelService.getModel(source);
      if (textModel) {
        success = await this.doSaveAsTextFile(textModel, source, target, options3);
      }
    }
    if (!success) {
      return void 0;
    }
    try {
      await this.revert(source);
    } catch (error) {
      this.logService.error(error);
    }
    if (source.scheme === Schemas.untitled) {
      this.untitled.notifyDidSave(source, target);
    }
    return target;
  }
  async doSaveAsTextFile(sourceModel, source, target, options3) {
    let sourceModelEncoding = void 0;
    const sourceModelWithEncodingSupport = sourceModel;
    if (typeof sourceModelWithEncodingSupport.getEncoding === "function") {
      sourceModelEncoding = sourceModelWithEncodingSupport.getEncoding();
    }
    let targetExists = false;
    let targetModel = this.files.get(target);
    if (targetModel?.isResolved()) {
      targetExists = true;
    } else {
      targetExists = await this.fileService.exists(target);
      if (!targetExists) {
        await this.create([{ resource: target, value: "" }]);
      }
      try {
        targetModel = await this.files.resolve(target, { encoding: sourceModelEncoding });
      } catch (error) {
        if (targetExists) {
          if (error.textFileOperationResult === 0 /* FILE_IS_BINARY */ || error.fileOperationResult === 7 /* FILE_TOO_LARGE */) {
            await this.fileService.del(target);
            return this.doSaveAsTextFile(sourceModel, source, target, options3);
          }
        }
        throw error;
      }
    }
    let write;
    if (sourceModel instanceof UntitledTextEditorModel && sourceModel.hasAssociatedFilePath && targetExists && this.uriIdentityService.extUri.isEqual(target, toLocalResource(sourceModel.resource, this.environmentService.remoteAuthority, this.pathService.defaultUriScheme))) {
      write = await this.confirmOverwrite(target);
    } else {
      write = true;
    }
    if (!write) {
      return false;
    }
    let sourceTextModel = void 0;
    if (sourceModel instanceof BaseTextEditorModel) {
      if (sourceModel.isResolved()) {
        sourceTextModel = sourceModel.textEditorModel ?? void 0;
      }
    } else {
      sourceTextModel = sourceModel;
    }
    let targetTextModel = void 0;
    if (targetModel.isResolved()) {
      targetTextModel = targetModel.textEditorModel;
    }
    if (sourceTextModel && targetTextModel) {
      targetModel.updatePreferredEncoding(sourceModelEncoding);
      this.modelService.updateModel(targetTextModel, createTextBufferFactoryFromSnapshot(sourceTextModel.createSnapshot()));
      const sourceLanguageId = sourceTextModel.getLanguageId();
      const targetLanguageId = targetTextModel.getLanguageId();
      if (sourceLanguageId !== PLAINTEXT_LANGUAGE_ID && targetLanguageId === PLAINTEXT_LANGUAGE_ID) {
        targetTextModel.setLanguage(sourceLanguageId);
      }
      const sourceOptions = sourceTextModel.getOptions();
      targetTextModel.updateOptions({
        tabSize: sourceOptions.tabSize,
        indentSize: sourceOptions.indentSize,
        insertSpaces: sourceOptions.insertSpaces
      });
      const sourceEOL = sourceTextModel.getEndOfLineSequence();
      targetTextModel.setEOL(sourceEOL);
      const sourceTransientProperties = this.codeEditorService.getTransientModelProperties(sourceTextModel);
      if (sourceTransientProperties) {
        for (const [key3, value2] of sourceTransientProperties) {
          this.codeEditorService.setTransientModelProperty(targetTextModel, key3, value2);
        }
      }
    }
    if (!options3?.source) {
      options3 = {
        ...options3,
        source: targetExists ? AbstractTextFileService.TEXTFILE_SAVE_REPLACE_SOURCE : AbstractTextFileService.TEXTFILE_SAVE_CREATE_SOURCE
      };
    }
    return targetModel.save({
      ...options3,
      from: source
    });
  }
  async confirmOverwrite(resource) {
    const { confirmed } = await this.dialogService.confirm({
      type: "warning",
      message: localize(23369, null, basename2(resource)),
      detail: localize(23373, null, basename2(resource), basename2(dirname2(resource))),
      primaryButton: localize(23376, null)
    });
    return confirmed;
  }
  async confirmMakeWriteable(resource) {
    const { confirmed } = await this.dialogService.confirm({
      type: "warning",
      message: localize(23367, null, basename2(resource)),
      detail: localize(23368, null),
      primaryButton: localize(23372, null)
    });
    return confirmed;
  }
  async suggestSavePath(resource) {
    if (this.fileService.hasProvider(resource)) {
      return resource;
    }
    const remoteAuthority = this.environmentService.remoteAuthority;
    const defaultFilePath = await this.fileDialogService.defaultFilePath();
    let suggestedFilename = void 0;
    if (resource.scheme === Schemas.untitled) {
      const model = this.untitled.get(resource);
      if (model) {
        if (model.hasAssociatedFilePath) {
          return toLocalResource(resource, remoteAuthority, this.pathService.defaultUriScheme);
        }
        let nameCandidate;
        if (await this.pathService.hasValidBasename(joinPath(defaultFilePath, model.name), model.name)) {
          nameCandidate = model.name;
        } else {
          nameCandidate = basename2(resource);
        }
        const languageId = model.getLanguageId();
        if (languageId && languageId !== PLAINTEXT_LANGUAGE_ID) {
          suggestedFilename = this.suggestFilename(languageId, nameCandidate);
        } else {
          suggestedFilename = nameCandidate;
        }
      }
    }
    if (!suggestedFilename) {
      suggestedFilename = basename2(resource);
    }
    return joinPath(defaultFilePath, suggestedFilename);
  }
  suggestFilename(languageId, untitledName) {
    const languageName = this.languageService.getLanguageName(languageId);
    if (!languageName) {
      return untitledName;
    }
    const untitledExtension = extname(untitledName);
    const extensions = this.languageService.getExtensions(languageId);
    if (extensions.includes(untitledExtension)) {
      return untitledName;
    }
    const primaryExtension = extensions.at(0);
    if (primaryExtension) {
      if (untitledExtension) {
        return `${untitledName.substring(0, untitledName.indexOf(untitledExtension))}${primaryExtension}`;
      }
      return `${untitledName}${primaryExtension}`;
    }
    const filenames = this.languageService.getFilenames(languageId);
    if (filenames.includes(untitledName)) {
      return untitledName;
    }
    return filenames.at(0) ?? untitledName;
  }
  //#endregion
  //#region revert
  async revert(resource, options3) {
    if (resource.scheme === Schemas.untitled) {
      const model = this.untitled.get(resource);
      if (model) {
        return model.revert(options3);
      }
    } else {
      const model = this.files.get(resource);
      if (model && (model.isDirty() || options3?.force)) {
        return model.revert(options3);
      }
    }
  }
  //#endregion
  //#region dirty
  isDirty(resource) {
    const model = resource.scheme === Schemas.untitled ? this.untitled.get(resource) : this.files.get(resource);
    if (model) {
      return model.isDirty();
    }
    return false;
  }
  //#endregion
};

AbstractTextFileService = __decorateClass([
  __decorateParam(0, IFileService),
  __decorateParam(1, IUntitledTextEditorService),
  __decorateParam(2, ILifecycleService),
  __decorateParam(3, IInstantiationService),
  __decorateParam(4, IModelService),
  __decorateParam(5, IWorkbenchEnvironmentService),
  __decorateParam(6, IDialogService),
  __decorateParam(7, IFileDialogService),
  __decorateParam(8, ITextResourceConfigurationService),
  __decorateParam(9, IFilesConfigurationService),
  __decorateParam(10, ICodeEditorService),
  __decorateParam(11, IPathService),
  __decorateParam(12, IWorkingCopyFileService),
  __decorateParam(13, IUriIdentityService),
  __decorateParam(14, ILanguageService),
  __decorateParam(15, ILogService),
  __decorateParam(16, IElevatedFileService),
  __decorateParam(17, IDecorationsService)
], AbstractTextFileService);

var EncodingOracle = class extends Disposable {
  constructor(textResourceConfigurationService, environmentService, contextService, uriIdentityService) {
    super();
    this.textResourceConfigurationService = textResourceConfigurationService;
    this.environmentService = environmentService;
    this.contextService = contextService;
    this.uriIdentityService = uriIdentityService;
    this._encodingOverrides = this.getDefaultEncodingOverrides();
    this.registerListeners();
  }
  get encodingOverrides() {
    return this._encodingOverrides;
  }
  set encodingOverrides(value2) {
    this._encodingOverrides = value2;
  }
  registerListeners() {
    this._register(this.contextService.onDidChangeWorkspaceFolders(() => this.encodingOverrides = this.getDefaultEncodingOverrides()));
  }
  getDefaultEncodingOverrides() {
    const defaultEncodingOverrides = [];
    defaultEncodingOverrides.push({ parent: this.environmentService.userRoamingDataHome, encoding: UTF8 });
    defaultEncodingOverrides.push({ extension: WORKSPACE_EXTENSION, encoding: UTF8 });
    defaultEncodingOverrides.push({ parent: this.environmentService.untitledWorkspacesHome, encoding: UTF8 });
    this.contextService.getWorkspace().folders.forEach((folder) => {
      defaultEncodingOverrides.push({ parent: joinPath(folder.uri, ".vscode"), encoding: UTF8 });
    });
    return defaultEncodingOverrides;
  }
  async getWriteEncoding(resource, options3) {
    const { encoding, hasBOM } = await this.getPreferredWriteEncoding(resource, options3 ? options3.encoding : void 0);
    return { encoding, addBOM: hasBOM };
  }
  async getPreferredWriteEncoding(resource, preferredEncoding) {
    const resourceEncoding = await this.getValidatedEncodingForResource(resource, preferredEncoding);
    return {
      encoding: resourceEncoding,
      hasBOM: resourceEncoding === UTF16be || resourceEncoding === UTF16le || resourceEncoding === UTF8_with_bom
      // enforce BOM for certain encodings
    };
  }
  async getPreferredReadEncoding(resource, options3, detectedEncoding) {
    let preferredEncoding;
    if (options3?.encoding) {
      if (detectedEncoding === UTF8_with_bom && options3.encoding === UTF8) {
        preferredEncoding = UTF8_with_bom;
      } else {
        preferredEncoding = options3.encoding;
      }
    } else if (typeof detectedEncoding === "string") {
      preferredEncoding = detectedEncoding;
    } else if (this.textResourceConfigurationService.getValue(resource, "files.encoding") === UTF8_with_bom) {
      preferredEncoding = UTF8;
    }
    const encoding = await this.getValidatedEncodingForResource(resource, preferredEncoding);
    return {
      encoding,
      hasBOM: encoding === UTF16be || encoding === UTF16le || encoding === UTF8_with_bom
      // enforce BOM for certain encodings
    };
  }
  getUnvalidatedEncodingForResource(resource, preferredEncoding) {
    let fileEncoding;
    const override = this.getEncodingOverride(resource);
    if (override) {
      fileEncoding = override;
    } else if (preferredEncoding) {
      fileEncoding = preferredEncoding;
    } else {
      fileEncoding = this.textResourceConfigurationService.getValue(resource, "files.encoding");
    }
    return fileEncoding || UTF8;
  }
  async getValidatedEncodingForResource(resource, preferredEncoding) {
    let fileEncoding = this.getUnvalidatedEncodingForResource(resource, preferredEncoding);
    if (fileEncoding !== UTF8 && !await encodingExists(fileEncoding)) {
      fileEncoding = UTF8;
    }
    return fileEncoding;
  }
  getEncodingOverride(resource) {
    if (resource && this.encodingOverrides?.length) {
      for (const override of this.encodingOverrides) {
        if (override.parent && this.uriIdentityService.extUri.isEqualOrParent(resource, override.parent)) {
          return override.encoding;
        }
        if (override.extension && extname2(resource) === `.${override.extension}`) {
          return override.encoding;
        }
      }
    }
    return void 0;
  }
};

EncodingOracle = __decorateClass([
  __decorateParam(0, ITextResourceConfigurationService),
  __decorateParam(1, IWorkbenchEnvironmentService),
  __decorateParam(2, IWorkspaceContextService),
  __decorateParam(3, IUriIdentityService)
], EncodingOracle);
export { AbstractTextFileService, EncodingOracle };
