// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/platform/files/common/inMemoryFilesystemProvider.ts
import { Disposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { createFileSystemProviderError, isFileOpenForWriteOptions } from "./module-0269.mjs";
import { newWriteableStream } from "./module-0037.mjs";
import { VSBuffer } from "./module-0038.mjs";
import { basename2, dirname2 } from "./module-0034.mjs";


// src/vs/platform/files/common/inMemoryFilesystemProvider.ts
var File = class {
  constructor(name) {
    this.type = 1 /* File */;
    this.ctime = Date.now();
    this.mtime = Date.now();
    this.size = 0;
    this.name = name;
  }
};

var Directory = class {
  constructor(name) {
    this.type = 2 /* Directory */;
    this.ctime = Date.now();
    this.mtime = Date.now();
    this.size = 0;
    this.name = name;
    this.entries = /* @__PURE__ */ new Map();
  }
};

var InMemoryFileSystemProvider = class extends Disposable {
  constructor() {
    super(...arguments);
    this.memoryFdCounter = 0;
    this.fdMemory = /* @__PURE__ */ new Map();
    this._onDidChangeCapabilities = this._register(new Emitter());
    this.onDidChangeCapabilities = this._onDidChangeCapabilities.event;
    this._capabilities = 2 /* FileReadWrite */ | 4 /* FileOpenReadWriteClose */ | 524288 /* FileAppend */ | 1024 /* PathCaseSensitive */;
    this.root = new Directory("");
    // --- manage file events
    this._onDidChangeFile = this._register(new Emitter());
    this.onDidChangeFile = this._onDidChangeFile.event;
    this._bufferedChanges = [];
  }
  get capabilities() {
    return this._capabilities;
  }
  setReadOnly(readonly) {
    const isReadonly = !!(this._capabilities & 2048 /* Readonly */);
    if (readonly !== isReadonly) {
      this._capabilities = 2 /* FileReadWrite */ | 524288 /* FileAppend */ | 1024 /* PathCaseSensitive */ | (readonly ? 2048 /* Readonly */ : 0);
      this._onDidChangeCapabilities.fire();
    }
  }
  // --- manage file metadata
  async stat(resource) {
    return this._lookup(resource, false);
  }
  async readdir(resource) {
    const entry = this._lookupAsDirectory(resource, false);
    const result = [];
    entry.entries.forEach((child, name) => result.push([name, child.type]));
    return result;
  }
  // --- manage file contents
  async readFile(resource) {
    const data = this._lookupAsFile(resource, false).data;
    if (data) {
      return data;
    }
    throw createFileSystemProviderError("file not found", "EntryNotFound" /* FileNotFound */);
  }
  readFileStream(resource) {
    const data = this._lookupAsFile(resource, false).data;
    const stream = newWriteableStream((data2) => VSBuffer.concat(data2.map((data3) => VSBuffer.wrap(data3))).buffer);
    stream.end(data);
    return stream;
  }
  async writeFile(resource, content2, opts) {
    const basename3 = basename2(resource);
    const parent = this._lookupParentDirectory(resource);
    let entry = parent.entries.get(basename3);
    if (entry instanceof Directory) {
      throw createFileSystemProviderError("file is directory", "EntryIsADirectory" /* FileIsADirectory */);
    }
    if (!entry && !opts.create) {
      throw createFileSystemProviderError("file not found", "EntryNotFound" /* FileNotFound */);
    }
    if (entry && opts.create && !opts.overwrite) {
      throw createFileSystemProviderError("file exists already", "EntryExists" /* FileExists */);
    }
    if (!entry) {
      entry = new File(basename3);
      parent.entries.set(basename3, entry);
      this._fireSoon({ type: 1 /* ADDED */, resource });
    }
    entry.mtime = Date.now();
    if (opts.append) {
      entry.size += content2.byteLength;
      const oldData = entry.data ?? new Uint8Array(0);
      const newData = new Uint8Array(oldData.byteLength + content2.byteLength);
      newData.set(oldData, 0);
      newData.set(content2, oldData.byteLength);
      entry.data = newData;
    } else {
      entry.size = content2.byteLength;
      entry.data = content2;
    }
    this._fireSoon({ type: 0 /* UPDATED */, resource });
  }
  // file open/read/write/close
  open(resource, opts) {
    let file = this._lookup(resource, true);
    const write = isFileOpenForWriteOptions(opts);
    const append4 = write && !!opts.append;
    if (!file) {
      if (!write) {
        throw createFileSystemProviderError("file not found", "EntryNotFound" /* FileNotFound */);
      }
      const basename3 = basename2(resource);
      const parent = this._lookupParentDirectory(resource);
      file = new File(basename3);
      file.data = new Uint8Array(0);
      parent.entries.set(basename3, file);
      this._fireSoon({ type: 1 /* ADDED */, resource });
    } else if (file instanceof Directory) {
      throw createFileSystemProviderError("file is directory", "EntryIsADirectory" /* FileIsADirectory */);
    }
    if (!file.data) {
      file.data = new Uint8Array(0);
    }
    const fd = this.memoryFdCounter++;
    this.fdMemory.set(fd, { file, resource, write, append: append4 });
    return Promise.resolve(fd);
  }
  close(fd) {
    const fdData = this.fdMemory.get(fd);
    if (fdData?.write) {
      fdData.file.mtime = Date.now();
      fdData.file.size = fdData.file.data?.byteLength ?? 0;
      this._fireSoon({ type: 0 /* UPDATED */, resource: fdData.resource });
    }
    this.fdMemory.delete(fd);
    return Promise.resolve();
  }
  read(fd, pos, data, offset, length) {
    const fdData = this.fdMemory.get(fd);
    if (!fdData) {
      throw createFileSystemProviderError(`No file with that descriptor open`, "Unavailable" /* Unavailable */);
    }
    if (!fdData.file.data) {
      return Promise.resolve(0);
    }
    const toWrite = VSBuffer.wrap(fdData.file.data).slice(pos, pos + length);
    data.set(toWrite.buffer, offset);
    return Promise.resolve(toWrite.byteLength);
  }
  write(fd, pos, data, offset, length) {
    const fdData = this.fdMemory.get(fd);
    if (!fdData) {
      throw createFileSystemProviderError(`No file with that descriptor open`, "Unavailable" /* Unavailable */);
    }
    const toWrite = VSBuffer.wrap(data).slice(offset, offset + length);
    fdData.file.data ??= new Uint8Array(0);
    const writePos = fdData.append ? fdData.file.data.byteLength : pos;
    const endPos = writePos + toWrite.byteLength;
    if (endPos > fdData.file.data.byteLength) {
      const newData = new Uint8Array(endPos);
      newData.set(fdData.file.data, 0);
      fdData.file.data = newData;
    }
    fdData.file.data.set(toWrite.buffer, writePos);
    return Promise.resolve(toWrite.byteLength);
  }
  // --- manage files/folders
  async rename(from, to, opts) {
    if (!opts.overwrite && this._lookup(to, true)) {
      throw createFileSystemProviderError("file exists already", "EntryExists" /* FileExists */);
    }
    const entry = this._lookup(from, false);
    const oldParent = this._lookupParentDirectory(from);
    const newParent = this._lookupParentDirectory(to);
    const newName = basename2(to);
    oldParent.entries.delete(entry.name);
    entry.name = newName;
    newParent.entries.set(newName, entry);
    this._fireSoon(
      { type: 2 /* DELETED */, resource: from },
      { type: 1 /* ADDED */, resource: to }
    );
  }
  async delete(resource, opts) {
    const dirname3 = dirname2(resource);
    const basename3 = basename2(resource);
    const parent = this._lookupAsDirectory(dirname3, false);
    if (parent.entries.delete(basename3)) {
      parent.mtime = Date.now();
      parent.size -= 1;
      this._fireSoon({ type: 0 /* UPDATED */, resource: dirname3 }, { resource, type: 2 /* DELETED */ });
    }
  }
  async mkdir(resource) {
    if (this._lookup(resource, true)) {
      throw createFileSystemProviderError("file exists already", "EntryExists" /* FileExists */);
    }
    const basename3 = basename2(resource);
    const dirname3 = dirname2(resource);
    const parent = this._lookupAsDirectory(dirname3, false);
    const entry = new Directory(basename3);
    parent.entries.set(entry.name, entry);
    parent.mtime = Date.now();
    parent.size += 1;
    this._fireSoon({ type: 0 /* UPDATED */, resource: dirname3 }, { type: 1 /* ADDED */, resource });
  }
  _lookup(uri5, silent) {
    const parts = uri5.path.split("/");
    let entry = this.root;
    for (const part of parts) {
      if (!part) {
        continue;
      }
      let child;
      if (entry instanceof Directory) {
        child = entry.entries.get(part);
      }
      if (!child) {
        if (!silent) {
          throw createFileSystemProviderError("file not found", "EntryNotFound" /* FileNotFound */);
        } else {
          return void 0;
        }
      }
      entry = child;
    }
    return entry;
  }
  _lookupAsDirectory(uri5, silent) {
    const entry = this._lookup(uri5, silent);
    if (entry instanceof Directory) {
      return entry;
    }
    throw createFileSystemProviderError("file not a directory", "EntryNotADirectory" /* FileNotADirectory */);
  }
  _lookupAsFile(uri5, silent) {
    const entry = this._lookup(uri5, silent);
    if (entry instanceof File) {
      return entry;
    }
    throw createFileSystemProviderError("file is a directory", "EntryIsADirectory" /* FileIsADirectory */);
  }
  _lookupParentDirectory(uri5) {
    const dirname3 = dirname2(uri5);
    return this._lookupAsDirectory(dirname3, false);
  }
  watch(resource, opts) {
    return Disposable.None;
  }
  _fireSoon(...changes) {
    this._bufferedChanges.push(...changes);
    if (this._fireSoonHandle) {
      clearTimeout(this._fireSoonHandle);
    }
    this._fireSoonHandle = setTimeout(() => {
      this._onDidChangeFile.fire(this._bufferedChanges);
      this._bufferedChanges.length = 0;
    }, 5);
  }
  dispose() {
    super.dispose();
    this.fdMemory.clear();
  }
};
export { File, Directory, InMemoryFileSystemProvider };
