// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/api/browser/mainThreadDocuments.ts
import { Disposable, dispose } from "./module-0012.mjs";
import { ErrorNoTelemetry, onUnexpectedError } from "./module-0004.mjs";
import { Emitter, Event2 } from "./module-0017.mjs";
import { ResourceMap } from "./module-0008.mjs";
import { ExtHostContext } from "./module-0921.mjs";
import { shouldSynchronizeModel } from "./module-0117.mjs";
import { URI } from "./module-0032.mjs";
import { Schemas } from "./module-0033.mjs";
import { toErrorMessage } from "./module-0094.mjs";
import { extUri, toLocalResource } from "./module-0034.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IModelService } from "./module-0080.mjs";
import { ITextFileService } from "./module-1063.mjs";
import { IFileService } from "./module-0269.mjs";
import { ITextModelService } from "./module-0081.mjs";
import { IWorkbenchEnvironmentService } from "./module-0935.mjs";
import { IUriIdentityService } from "./module-0510.mjs";
import { IWorkingCopyFileService } from "./module-1075.mjs";
import { IPathService } from "./module-0938.mjs";


// src/vs/workbench/api/browser/mainThreadDocuments.ts
var BoundModelReferenceCollection = class {
  constructor(_extUri, _maxAge = 1e3 * 60 * 3, _maxLength = 1024 * 1024 * 80, _maxSize = 50) {
    this._extUri = _extUri;
    this._maxAge = _maxAge;
    this._maxLength = _maxLength;
    this._maxSize = _maxSize;
    this._data = new Array();
    this._length = 0;
  }
  dispose() {
    this._data = dispose(this._data);
  }
  remove(uri5) {
    for (const entry of [...this._data]) {
      if (this._extUri.isEqualOrParent(entry.uri, uri5)) {
        entry.dispose();
      }
    }
  }
  add(uri5, ref, length = 0) {
    const dispose2 = () => {
      const idx = this._data.indexOf(entry);
      if (idx >= 0) {
        this._length -= length;
        ref.dispose();
        clearTimeout(handle2);
        this._data.splice(idx, 1);
      }
    };
    const handle2 = setTimeout(dispose2, this._maxAge);
    const entry = { uri: uri5, length, dispose: dispose2 };
    this._data.push(entry);
    this._length += length;
    this._cleanup();
  }
  _cleanup() {
    while (this._length > this._maxLength) {
      this._data[0].dispose();
    }
    const extraSize = Math.ceil(this._maxSize * 1.2);
    if (this._data.length >= extraSize) {
      dispose(this._data.slice(0, extraSize - this._maxSize));
    }
  }
};

var ModelTracker = class extends Disposable {
  constructor(_model, _onIsCaughtUpWithContentChanges, _proxy, _textFileService) {
    super();
    this._model = _model;
    this._onIsCaughtUpWithContentChanges = _onIsCaughtUpWithContentChanges;
    this._proxy = _proxy;
    this._textFileService = _textFileService;
    this._knownVersionId = this._model.getVersionId();
    this._store.add(this._model.onDidChangeContent((e) => {
      this._knownVersionId = e.versionId;
      if (e.detailedReasonsChangeLengths.length !== 1) {
        onUnexpectedError(new Error(`Unexpected reasons: ${e.detailedReasons.map((r2) => r2.toString())}`));
      }
      const evt = {
        changes: e.changes,
        isEolChange: e.isEolChange,
        isUndoing: e.isUndoing,
        isRedoing: e.isRedoing,
        isFlush: e.isFlush,
        eol: e.eol,
        versionId: e.versionId,
        detailedReason: e.detailedReasons[0].metadata
      };
      this._proxy.$acceptModelChanged(this._model.uri, evt, this._textFileService.isDirty(this._model.uri));
      if (this.isCaughtUpWithContentChanges()) {
        this._onIsCaughtUpWithContentChanges.fire(this._model.uri);
      }
    }));
  }
  isCaughtUpWithContentChanges() {
    return this._model.getVersionId() === this._knownVersionId;
  }
};

var MainThreadDocuments = class extends Disposable {
  constructor(extHostContext, _modelService, _textFileService, _fileService, _textModelResolverService, _environmentService, _uriIdentityService, workingCopyFileService, _pathService) {
    super();
    this._modelService = _modelService;
    this._textFileService = _textFileService;
    this._fileService = _fileService;
    this._textModelResolverService = _textModelResolverService;
    this._environmentService = _environmentService;
    this._uriIdentityService = _uriIdentityService;
    this._pathService = _pathService;
    this._onIsCaughtUpWithContentChanges = this._store.add(new Emitter());
    this.onIsCaughtUpWithContentChanges = this._onIsCaughtUpWithContentChanges.event;
    this._modelTrackers = new ResourceMap();
    this._modelReferenceCollection = this._store.add(new BoundModelReferenceCollection(_uriIdentityService.extUri));
    this._proxy = extHostContext.getProxy(ExtHostContext.ExtHostDocuments);
    this._store.add(_modelService.onModelLanguageChanged(this._onModelModeChanged, this));
    this._store.add(_textFileService.files.onDidSave((e) => {
      if (this._shouldHandleFileEvent(e.model.resource)) {
        this._proxy.$acceptModelSaved(e.model.resource);
      }
    }));
    this._store.add(_textFileService.files.onDidChangeDirty((m) => {
      if (this._shouldHandleFileEvent(m.resource)) {
        this._proxy.$acceptDirtyStateChanged(m.resource, m.isDirty());
      }
    }));
    this._store.add(Event2.any(_textFileService.files.onDidChangeEncoding, _textFileService.untitled.onDidChangeEncoding)((m) => {
      if (this._shouldHandleFileEvent(m.resource)) {
        const encoding = m.getEncoding();
        if (encoding) {
          this._proxy.$acceptEncodingChanged(m.resource, encoding);
        }
      }
    }));
    this._store.add(workingCopyFileService.onDidRunWorkingCopyFileOperation((e) => {
      const isMove = e.operation === 2 /* MOVE */;
      if (isMove || e.operation === 1 /* DELETE */) {
        for (const pair of e.files) {
          const removed = isMove ? pair.source : pair.target;
          if (removed) {
            this._modelReferenceCollection.remove(removed);
          }
        }
      }
    }));
  }
  dispose() {
    dispose(this._modelTrackers.values());
    this._modelTrackers.clear();
    super.dispose();
  }
  isCaughtUpWithContentChanges(resource) {
    const tracker2 = this._modelTrackers.get(resource);
    if (tracker2) {
      return tracker2.isCaughtUpWithContentChanges();
    }
    return true;
  }
  _shouldHandleFileEvent(resource) {
    const model = this._modelService.getModel(resource);
    return !!model && shouldSynchronizeModel(model);
  }
  handleModelAdded(model) {
    if (!shouldSynchronizeModel(model)) {
      return;
    }
    this._modelTrackers.set(model.uri, new ModelTracker(model, this._onIsCaughtUpWithContentChanges, this._proxy, this._textFileService));
  }
  _onModelModeChanged(event) {
    const { model } = event;
    if (!this._modelTrackers.has(model.uri)) {
      return;
    }
    this._proxy.$acceptModelLanguageChanged(model.uri, model.getLanguageId());
  }
  handleModelRemoved(modelUrl) {
    if (!this._modelTrackers.has(modelUrl)) {
      return;
    }
    this._modelTrackers.get(modelUrl).dispose();
    this._modelTrackers.delete(modelUrl);
  }
  // --- from extension host process
  async $trySaveDocument(uri5) {
    const target = await this._textFileService.save(URI.revive(uri5));
    return Boolean(target);
  }
  async $tryOpenDocument(uriData, options3) {
    const inputUri = URI.revive(uriData);
    if (!inputUri.scheme || !(inputUri.fsPath || inputUri.authority)) {
      throw new ErrorNoTelemetry(`Invalid uri. Scheme and authority or path must be set.`);
    }
    const canonicalUri = this._uriIdentityService.asCanonicalUri(inputUri);
    let promise;
    switch (canonicalUri.scheme) {
      case Schemas.untitled:
        promise = this._handleUntitledScheme(canonicalUri, options3);
        break;
      case Schemas.file:
      default:
        promise = this._handleAsResourceInput(canonicalUri, options3);
        break;
    }
    let documentUri;
    try {
      documentUri = await promise;
    } catch (err) {
      throw new ErrorNoTelemetry(`cannot open ${canonicalUri.toString()}. Detail: ${toErrorMessage(err)}`);
    }
    if (!documentUri) {
      throw new ErrorNoTelemetry(`cannot open ${canonicalUri.toString()}`);
    } else if (!extUri.isEqual(documentUri, canonicalUri)) {
      throw new ErrorNoTelemetry(`cannot open ${canonicalUri.toString()}. Detail: Actual document opened as ${documentUri.toString()}`);
    } else if (!this._modelTrackers.has(canonicalUri)) {
      throw new ErrorNoTelemetry(`cannot open ${canonicalUri.toString()}. Detail: Files above 50MB cannot be synchronized with extensions.`);
    } else {
      return canonicalUri;
    }
  }
  $tryCreateDocument(options3) {
    return this._doCreateUntitled(void 0, options3);
  }
  async _handleAsResourceInput(uri5, options3) {
    if (options3?.encoding) {
      const model = await this._textFileService.files.resolve(uri5, { encoding: options3.encoding, reason: 2 /* REFERENCE */ });
      if (model.isDirty()) {
        throw new ErrorNoTelemetry(`Cannot re-open a dirty text document with different encoding. Save it first.`);
      }
      await model.setEncoding(options3.encoding, 1 /* Decode */);
    }
    const ref = await this._textModelResolverService.createModelReference(uri5);
    this._modelReferenceCollection.add(uri5, ref, ref.object.textEditorModel.getValueLength());
    return ref.object.textEditorModel.uri;
  }
  async _handleUntitledScheme(uri5, options3) {
    const asLocalUri = toLocalResource(uri5, this._environmentService.remoteAuthority, this._pathService.defaultUriScheme);
    const exists = await this._fileService.exists(asLocalUri);
    if (exists) {
      return Promise.reject(new Error("file already exists"));
    }
    return await this._doCreateUntitled(Boolean(uri5.path) ? uri5 : void 0, options3);
  }
  async _doCreateUntitled(associatedResource, options3) {
    const model = this._textFileService.untitled.create({
      associatedResource,
      languageId: options3?.language,
      initialValue: options3?.content,
      encoding: options3?.encoding
    });
    if (options3?.encoding) {
      await model.setEncoding(options3.encoding);
    }
    const resource = model.resource;
    const ref = await this._textModelResolverService.createModelReference(resource);
    if (!this._modelTrackers.has(resource)) {
      ref.dispose();
      throw new Error(`expected URI ${resource.toString()} to have come to LIFE`);
    }
    this._modelReferenceCollection.add(resource, ref, ref.object.textEditorModel.getValueLength());
    Event2.once(model.onDidRevert)(() => this._modelReferenceCollection.remove(resource));
    this._proxy.$acceptDirtyStateChanged(resource, true);
    return resource;
  }
};

MainThreadDocuments = __decorateClass([
  __decorateParam(1, IModelService),
  __decorateParam(2, ITextFileService),
  __decorateParam(3, IFileService),
  __decorateParam(4, ITextModelService),
  __decorateParam(5, IWorkbenchEnvironmentService),
  __decorateParam(6, IUriIdentityService),
  __decorateParam(7, IWorkingCopyFileService),
  __decorateParam(8, IPathService)
], MainThreadDocuments);
export { BoundModelReferenceCollection, ModelTracker, MainThreadDocuments };
