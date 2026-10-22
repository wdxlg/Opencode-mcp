// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/bulkEdit/browser/bulkFileEdits.ts
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IWorkingCopyFileService } from "./module-1076.mjs";
import { IFileService } from "./module-0269.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { Schemas } from "./module-0033.mjs";
import { ITextFileService } from "./module-1064.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { ILogService } from "./module-0095.mjs";
import { CancellationToken } from "./module-0025.mjs";
import { IUndoRedoService } from "./module-0374.mjs";


// src/vs/workbench/contrib/bulkEdit/browser/bulkFileEdits.ts
var Noop = class {
  constructor() {
    this.uris = [];
  }
  async perform() {
    return this;
  }
  toString() {
    return "(noop)";
  }
};

var RenameEdit = class {
  constructor(newUri, oldUri, options3) {
    this.newUri = newUri;
    this.oldUri = oldUri;
    this.options = options3;
    this.type = "rename";
  }
};

var RenameOperation = class {
  constructor(_edits, _undoRedoInfo, _workingCopyFileService, _fileService) {
    this._edits = _edits;
    this._undoRedoInfo = _undoRedoInfo;
    this._workingCopyFileService = _workingCopyFileService;
    this._fileService = _fileService;
  }
  get uris() {
    return this._edits.flatMap((edit3) => [edit3.newUri, edit3.oldUri]);
  }
  async perform(token) {
    const moves = [];
    const undoes = [];
    for (const edit3 of this._edits) {
      const skip = edit3.options.overwrite === void 0 && edit3.options.ignoreIfExists && await this._fileService.exists(edit3.newUri);
      if (!skip) {
        moves.push({
          file: { source: edit3.oldUri, target: edit3.newUri },
          overwrite: edit3.options.overwrite
        });
        undoes.push(new RenameEdit(edit3.oldUri, edit3.newUri, edit3.options));
      }
    }
    if (moves.length === 0) {
      return new Noop();
    }
    await this._workingCopyFileService.move(moves, token, this._undoRedoInfo);
    return new RenameOperation(undoes, { isUndoing: true }, this._workingCopyFileService, this._fileService);
  }
  toString() {
    return `(rename ${this._edits.map((edit3) => `${edit3.oldUri} to ${edit3.newUri}`).join(", ")})`;
  }
};

RenameOperation = __decorateClass([
  __decorateParam(2, IWorkingCopyFileService),
  __decorateParam(3, IFileService)
], RenameOperation);

var CopyEdit = class {
  constructor(newUri, oldUri, options3) {
    this.newUri = newUri;
    this.oldUri = oldUri;
    this.options = options3;
    this.type = "copy";
  }
};

var CopyOperation = class {
  constructor(_edits, _undoRedoInfo, _workingCopyFileService, _fileService, _instaService) {
    this._edits = _edits;
    this._undoRedoInfo = _undoRedoInfo;
    this._workingCopyFileService = _workingCopyFileService;
    this._fileService = _fileService;
    this._instaService = _instaService;
  }
  get uris() {
    return this._edits.flatMap((edit3) => [edit3.newUri, edit3.oldUri]);
  }
  async perform(token) {
    const copies = [];
    for (const edit3 of this._edits) {
      const skip = edit3.options.overwrite === void 0 && edit3.options.ignoreIfExists && await this._fileService.exists(edit3.newUri);
      if (!skip) {
        copies.push({ file: { source: edit3.oldUri, target: edit3.newUri }, overwrite: edit3.options.overwrite });
      }
    }
    if (copies.length === 0) {
      return new Noop();
    }
    const stats = await this._workingCopyFileService.copy(copies, token, this._undoRedoInfo);
    const undoes = [];
    for (let i2 = 0; i2 < stats.length; i2++) {
      const stat = stats[i2];
      const edit3 = this._edits[i2];
      undoes.push(new DeleteEdit(stat.resource, { recursive: true, folder: this._edits[i2].options.folder || stat.isDirectory, ...edit3.options }, false));
    }
    return this._instaService.createInstance(DeleteOperation, undoes, { isUndoing: true });
  }
  toString() {
    return `(copy ${this._edits.map((edit3) => `${edit3.oldUri} to ${edit3.newUri}`).join(", ")})`;
  }
};

CopyOperation = __decorateClass([
  __decorateParam(2, IWorkingCopyFileService),
  __decorateParam(3, IFileService),
  __decorateParam(4, IInstantiationService)
], CopyOperation);

var CreateEdit = class {
  constructor(newUri, options3, contents) {
    this.newUri = newUri;
    this.options = options3;
    this.contents = contents;
    this.type = "create";
  }
};

var CreateOperation = class {
  constructor(_edits, _undoRedoInfo, _fileService, _workingCopyFileService, _instaService, _textFileService) {
    this._edits = _edits;
    this._undoRedoInfo = _undoRedoInfo;
    this._fileService = _fileService;
    this._workingCopyFileService = _workingCopyFileService;
    this._instaService = _instaService;
    this._textFileService = _textFileService;
  }
  get uris() {
    return this._edits.map((edit3) => edit3.newUri);
  }
  async perform(token) {
    const folderCreates = [];
    const fileCreates = [];
    const undoes = [];
    for (const edit3 of this._edits) {
      if (edit3.newUri.scheme === Schemas.untitled) {
        continue;
      }
      if (edit3.options.overwrite === void 0 && edit3.options.ignoreIfExists && await this._fileService.exists(edit3.newUri)) {
        continue;
      }
      if (edit3.options.folder) {
        folderCreates.push({ resource: edit3.newUri });
      } else {
        const encodedReadable = typeof edit3.contents !== "undefined" ? edit3.contents : await this._textFileService.getEncodedReadable(edit3.newUri);
        fileCreates.push({ resource: edit3.newUri, contents: encodedReadable, overwrite: edit3.options.overwrite });
      }
      undoes.push(new DeleteEdit(edit3.newUri, edit3.options, !edit3.options.folder && !edit3.contents));
    }
    if (folderCreates.length === 0 && fileCreates.length === 0) {
      return new Noop();
    }
    await this._workingCopyFileService.createFolder(folderCreates, token, this._undoRedoInfo);
    await this._workingCopyFileService.create(fileCreates, token, this._undoRedoInfo);
    return this._instaService.createInstance(DeleteOperation, undoes, { isUndoing: true });
  }
  toString() {
    return `(create ${this._edits.map((edit3) => edit3.options.folder ? `folder ${edit3.newUri}` : `file ${edit3.newUri} with ${edit3.contents?.byteLength || 0} bytes`).join(", ")})`;
  }
};

CreateOperation = __decorateClass([
  __decorateParam(2, IFileService),
  __decorateParam(3, IWorkingCopyFileService),
  __decorateParam(4, IInstantiationService),
  __decorateParam(5, ITextFileService)
], CreateOperation);

var DeleteEdit = class {
  constructor(oldUri, options3, undoesCreate) {
    this.oldUri = oldUri;
    this.options = options3;
    this.undoesCreate = undoesCreate;
    this.type = "delete";
  }
};

var DeleteOperation = class {
  constructor(_edits, _undoRedoInfo, _workingCopyFileService, _fileService, _configurationService, _instaService, _logService) {
    this._edits = _edits;
    this._undoRedoInfo = _undoRedoInfo;
    this._workingCopyFileService = _workingCopyFileService;
    this._fileService = _fileService;
    this._configurationService = _configurationService;
    this._instaService = _instaService;
    this._logService = _logService;
  }
  get uris() {
    return this._edits.map((edit3) => edit3.oldUri);
  }
  async perform(token) {
    const deletes = [];
    const undoes = [];
    for (const edit3 of this._edits) {
      let fileStat;
      try {
        fileStat = await this._fileService.resolve(edit3.oldUri, { resolveMetadata: true });
      } catch (err) {
        if (!edit3.options.ignoreIfNotExists) {
          throw new Error(`${edit3.oldUri} does not exist and can not be deleted`);
        }
        continue;
      }
      deletes.push({
        resource: edit3.oldUri,
        recursive: edit3.options.recursive,
        useTrash: !edit3.options.skipTrashBin && this._fileService.hasCapability(edit3.oldUri, 4096 /* Trash */) && this._configurationService.getValue("files.enableTrash")
      });
      let fileContent;
      let fileContentExceedsMaxSize = false;
      if (!edit3.undoesCreate && !edit3.options.folder) {
        fileContentExceedsMaxSize = typeof edit3.options.maxSize === "number" && fileStat.size > edit3.options.maxSize;
        if (!fileContentExceedsMaxSize) {
          try {
            fileContent = await this._fileService.readFile(edit3.oldUri);
          } catch (err) {
            this._logService.error(err);
          }
        }
      }
      if (!fileContentExceedsMaxSize) {
        undoes.push(new CreateEdit(edit3.oldUri, edit3.options, fileContent?.value));
      }
    }
    if (deletes.length === 0) {
      return new Noop();
    }
    await this._workingCopyFileService.delete(deletes, token, this._undoRedoInfo);
    if (undoes.length === 0) {
      return new Noop();
    }
    return this._instaService.createInstance(CreateOperation, undoes, { isUndoing: true });
  }
  toString() {
    return `(delete ${this._edits.map((edit3) => edit3.oldUri).join(", ")})`;
  }
};

DeleteOperation = __decorateClass([
  __decorateParam(2, IWorkingCopyFileService),
  __decorateParam(3, IFileService),
  __decorateParam(4, IConfigurationService),
  __decorateParam(5, IInstantiationService),
  __decorateParam(6, ILogService)
], DeleteOperation);

var FileUndoRedoElement = class {
  constructor(label3, code, operations, confirmBeforeUndo) {
    this.label = label3;
    this.code = code;
    this.operations = operations;
    this.confirmBeforeUndo = confirmBeforeUndo;
    this.type = 1 /* Workspace */;
    this.resources = operations.flatMap((op) => op.uris);
  }
  async undo() {
    await this._reverse();
  }
  async redo() {
    await this._reverse();
  }
  async _reverse() {
    for (let i2 = 0; i2 < this.operations.length; i2++) {
      const op = this.operations[i2];
      const undo = await op.perform(CancellationToken.None);
      this.operations[i2] = undo;
    }
  }
  toString() {
    return this.operations.map((op) => String(op)).join(", ");
  }
};

var BulkFileEdits = class {
  constructor(_label, _code, _undoRedoGroup, _undoRedoSource, _confirmBeforeUndo, _progress, _token, _edits, _instaService, _undoRedoService) {
    this._label = _label;
    this._code = _code;
    this._undoRedoGroup = _undoRedoGroup;
    this._undoRedoSource = _undoRedoSource;
    this._confirmBeforeUndo = _confirmBeforeUndo;
    this._progress = _progress;
    this._token = _token;
    this._edits = _edits;
    this._instaService = _instaService;
    this._undoRedoService = _undoRedoService;
  }
  async apply() {
    const undoOperations = [];
    const undoRedoInfo = { undoRedoGroupId: this._undoRedoGroup.id };
    const edits = [];
    for (const edit3 of this._edits) {
      if (edit3.newResource && edit3.oldResource && !edit3.options?.copy) {
        edits.push(new RenameEdit(edit3.newResource, edit3.oldResource, edit3.options ?? {}));
      } else if (edit3.newResource && edit3.oldResource && edit3.options?.copy) {
        edits.push(new CopyEdit(edit3.newResource, edit3.oldResource, edit3.options ?? {}));
      } else if (!edit3.newResource && edit3.oldResource) {
        edits.push(new DeleteEdit(edit3.oldResource, edit3.options ?? {}, false));
      } else if (edit3.newResource && !edit3.oldResource) {
        edits.push(new CreateEdit(edit3.newResource, edit3.options ?? {}, await edit3.options.contents));
      }
    }
    if (edits.length === 0) {
      return [];
    }
    const groups = [];
    groups[0] = [edits[0]];
    for (let i2 = 1; i2 < edits.length; i2++) {
      const edit3 = edits[i2];
      const lastGroup = groups.at(-1);
      if (lastGroup?.[0].type === edit3.type) {
        lastGroup.push(edit3);
      } else {
        groups.push([edit3]);
      }
    }
    for (const group2 of groups) {
      if (this._token.isCancellationRequested) {
        break;
      }
      let op;
      switch (group2[0].type) {
        case "rename":
          op = this._instaService.createInstance(RenameOperation, group2, undoRedoInfo);
          break;
        case "copy":
          op = this._instaService.createInstance(CopyOperation, group2, undoRedoInfo);
          break;
        case "delete":
          op = this._instaService.createInstance(DeleteOperation, group2, undoRedoInfo);
          break;
        case "create":
          op = this._instaService.createInstance(CreateOperation, group2, undoRedoInfo);
          break;
      }
      if (op) {
        const undoOp = await op.perform(this._token);
        undoOperations.push(undoOp);
      }
      this._progress.report(void 0);
    }
    const undoRedoElement = new FileUndoRedoElement(this._label, this._code, undoOperations, this._confirmBeforeUndo);
    this._undoRedoService.pushElement(undoRedoElement, this._undoRedoGroup, this._undoRedoSource);
    return undoRedoElement.resources;
  }
};

BulkFileEdits = __decorateClass([
  __decorateParam(8, IInstantiationService),
  __decorateParam(9, IUndoRedoService)
], BulkFileEdits);
export { Noop, RenameEdit, RenameOperation, CopyEdit, CopyOperation, CreateEdit, CreateOperation, DeleteEdit, DeleteOperation, FileUndoRedoElement, BulkFileEdits };
