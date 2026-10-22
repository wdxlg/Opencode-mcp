// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/attachments/chatAttachmentModel.ts
import { Disposable, DisposableMap, combinedDisposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { URI } from "./module-0032.mjs";
import { Schemas } from "./module-0033.mjs";
import { basename2 } from "./module-0034.mjs";
import { IChatRequestVariableEntry, isPromptFileVariableEntry } from "./module-0979.mjs";
import { Iterable } from "./module-0011.mjs";
import { equals4 } from "./module-0098.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IFileService } from "./module-0269.mjs";
import { IChatAttachmentResolveService } from "./module-2092.mjs";


// src/vs/workbench/contrib/chat/browser/attachments/chatAttachmentModel.ts
var ChatAttachmentModel = class extends Disposable {
  constructor(fileService, chatAttachmentResolveService) {
    super();
    this.fileService = fileService;
    this.chatAttachmentResolveService = chatAttachmentResolveService;
    this._attachments = /* @__PURE__ */ new Map();
    this._fileWatchers = this._register(new DisposableMap());
    this._onDidChange = this._register(new Emitter());
    this.onDidChange = this._onDidChange.event;
  }
  get attachments() {
    return Array.from(this._attachments.values());
  }
  get size() {
    return this._attachments.size;
  }
  get fileAttachments() {
    return this.attachments.filter((file) => file.kind === "file" && URI.isUri(file.value)).map((file) => file.value);
  }
  getAttachmentIDs() {
    return new Set(this._attachments.keys());
  }
  async addFile(uri5, range2) {
    if (uri5.scheme === Schemas.vscodeBrowser) {
      const entry = await this.chatAttachmentResolveService.resolveEditorAttachContext({ resource: uri5 });
      if (entry) {
        this.addContext(entry);
      }
      return;
    } else {
      this.addContext(this.asFileVariableEntry(uri5, range2));
    }
  }
  addFolder(uri5) {
    const entry = {
      kind: "directory",
      value: uri5,
      id: uri5.toString(),
      name: basename2(uri5),
      modelDescription: "Folder path reference"
    };
    this.addContext(entry);
  }
  clear(clearStickyAttachments = false) {
    if (clearStickyAttachments) {
      const deleted = Array.from(this._attachments.keys());
      this._attachments.clear();
      this._fileWatchers.clearAndDisposeAll();
      this._onDidChange.fire({ deleted, added: [], updated: [] });
    } else {
      const deleted = [];
      const allIds = Array.from(this._attachments.keys());
      for (const id2 of allIds) {
        const entry = this._attachments.get(id2);
        if (entry && !isPromptFileVariableEntry(entry)) {
          this._attachments.delete(id2);
          this._fileWatchers.deleteAndDispose(id2);
          deleted.push(id2);
        }
      }
      this._onDidChange.fire({ deleted, added: [], updated: [] });
    }
  }
  addContext(...attachments) {
    attachments = attachments.filter((attachment) => !this._attachments.has(attachment.id));
    this.updateContext(Iterable.empty(), attachments);
  }
  clearAndSetContext(...attachments) {
    this.updateContext(Array.from(this._attachments.keys()), attachments);
  }
  delete(...variableEntryIds) {
    this.updateContext(variableEntryIds, Iterable.empty());
  }
  updateContext(toDelete, upsert) {
    const deleted = [];
    const added = [];
    const updated = [];
    for (const id2 of toDelete) {
      const item = this._attachments.get(id2);
      if (item) {
        this._attachments.delete(id2);
        deleted.push(id2);
        this._fileWatchers.deleteAndDispose(id2);
      }
    }
    for (const item of upsert) {
      const oldItem = this._attachments.get(item.id);
      if (!oldItem) {
        this._attachments.set(item.id, item);
        added.push(item);
        this._watchAttachment(item);
      } else if (!equals4(oldItem, item)) {
        this._fileWatchers.deleteAndDispose(item.id);
        this._attachments.set(item.id, item);
        updated.push(item);
        this._watchAttachment(item);
      }
    }
    if (deleted.length > 0 || added.length > 0 || updated.length > 0) {
      this._onDidChange.fire({ deleted, added, updated });
    }
  }
  _watchAttachment(attachment) {
    const uri5 = IChatRequestVariableEntry.toUri(attachment);
    if (!uri5 || uri5.scheme !== Schemas.file) {
      return;
    }
    const watcher = this.fileService.createWatcher(uri5, { recursive: false, excludes: [] });
    const onDidChangeListener = watcher.onDidChange((e) => {
      if (e.contains(uri5, 2 /* DELETED */)) {
        this.updateContext([attachment.id], Iterable.empty());
      }
    });
    this._fileWatchers.set(attachment.id, combinedDisposable(onDidChangeListener, watcher));
  }
  // ---- create utils
  asFileVariableEntry(uri5, range2) {
    return {
      kind: "file",
      value: range2 ? { uri: uri5, range: range2 } : uri5,
      id: uri5.toString() + (range2?.toString() ?? ""),
      name: basename2(uri5),
      modelDescription: "File path reference"
    };
  }
};

ChatAttachmentModel = __decorateClass([
  __decorateParam(0, IFileService),
  __decorateParam(1, IChatAttachmentResolveService)
], ChatAttachmentModel);
export { ChatAttachmentModel };
