// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/debug/browser/debugMemory.ts
import { Disposable, DisposableStore, toDisposable } from "./module-0012.mjs";
import { Emitter, Event2 } from "./module-0017.mjs";
import { createFileSystemProviderError } from "./module-0269.mjs";
import { assertNever } from "./module-0009.mjs";
import { VSBuffer } from "./module-0038.mjs";
import { DEBUG_MEMORY_SCHEME } from "./module-1057.mjs";
import { clamp } from "./module-0040.mjs";


// src/vs/workbench/contrib/debug/browser/debugMemory.ts
var rangeRe = /range=([0-9]+):([0-9]+)/;

var DebugMemoryFileSystemProvider = class extends Disposable {
  constructor(debugService) {
    super();
    this.debugService = debugService;
    this.memoryFdCounter = 0;
    this.fdMemory = /* @__PURE__ */ new Map();
    this.changeEmitter = this._register(new Emitter());
    /** @inheritdoc */
    this.onDidChangeCapabilities = Event2.None;
    /** @inheritdoc */
    this.onDidChangeFile = this.changeEmitter.event;
    /** @inheritdoc */
    this.capabilities = 0 | 1024 /* PathCaseSensitive */ | 4 /* FileOpenReadWriteClose */;
    this._register(debugService.onDidEndSession(({ session }) => {
      for (const [fd, memory] of this.fdMemory) {
        if (memory.session === session) {
          this.close(fd);
        }
      }
    }));
  }
  watch(resource, opts) {
    if (opts.recursive) {
      return toDisposable(() => {
      });
    }
    const { session, memoryReference, offset } = this.parseUri(resource);
    const disposable = new DisposableStore();
    disposable.add(session.onDidChangeState(() => {
      if (session.state === 3 /* Running */ || session.state === 0 /* Inactive */) {
        this.changeEmitter.fire([{ type: 2 /* DELETED */, resource }]);
      }
    }));
    disposable.add(session.onDidInvalidateMemory((e) => {
      if (e.body.memoryReference !== memoryReference) {
        return;
      }
      if (offset && (e.body.offset >= offset.toOffset || e.body.offset + e.body.count < offset.fromOffset)) {
        return;
      }
      this.changeEmitter.fire([{ resource, type: 0 /* UPDATED */ }]);
    }));
    return disposable;
  }
  /** @inheritdoc */
  stat(file) {
    const { readOnly } = this.parseUri(file);
    return Promise.resolve({
      type: 1 /* File */,
      mtime: 0,
      ctime: 0,
      size: 0,
      permissions: readOnly ? 1 /* Readonly */ : void 0
    });
  }
  /** @inheritdoc */
  mkdir() {
    throw createFileSystemProviderError(`Not allowed`, "NoPermissions" /* NoPermissions */);
  }
  /** @inheritdoc */
  readdir() {
    throw createFileSystemProviderError(`Not allowed`, "NoPermissions" /* NoPermissions */);
  }
  /** @inheritdoc */
  delete() {
    throw createFileSystemProviderError(`Not allowed`, "NoPermissions" /* NoPermissions */);
  }
  /** @inheritdoc */
  rename() {
    throw createFileSystemProviderError(`Not allowed`, "NoPermissions" /* NoPermissions */);
  }
  /** @inheritdoc */
  open(resource, _opts) {
    const { session, memoryReference, offset } = this.parseUri(resource);
    const fd = this.memoryFdCounter++;
    let region = session.getMemory(memoryReference);
    if (offset) {
      region = new MemoryRegionView(region, offset);
    }
    this.fdMemory.set(fd, { session, region });
    return Promise.resolve(fd);
  }
  /** @inheritdoc */
  close(fd) {
    this.fdMemory.get(fd)?.region.dispose();
    this.fdMemory.delete(fd);
    return Promise.resolve();
  }
  /** @inheritdoc */
  async writeFile(resource, content2) {
    const { offset } = this.parseUri(resource);
    if (!offset) {
      throw createFileSystemProviderError(`Range must be present to read a file`, "EntryNotFound" /* FileNotFound */);
    }
    const fd = await this.open(resource, { create: false });
    try {
      await this.write(fd, offset.fromOffset, content2, 0, content2.length);
    } finally {
      this.close(fd);
    }
  }
  /** @inheritdoc */
  async readFile(resource) {
    const { offset } = this.parseUri(resource);
    if (!offset) {
      throw createFileSystemProviderError(`Range must be present to read a file`, "EntryNotFound" /* FileNotFound */);
    }
    const data = new Uint8Array(offset.toOffset - offset.fromOffset);
    const fd = await this.open(resource, { create: false });
    try {
      await this.read(fd, offset.fromOffset, data, 0, data.length);
      return data;
    } finally {
      this.close(fd);
    }
  }
  /** @inheritdoc */
  async read(fd, pos, data, offset, length) {
    const memory = this.fdMemory.get(fd);
    if (!memory) {
      throw createFileSystemProviderError(`No file with that descriptor open`, "Unavailable" /* Unavailable */);
    }
    const ranges = await memory.region.read(pos, length);
    let readSoFar = 0;
    for (const range2 of ranges) {
      switch (range2.type) {
        case 1 /* Unreadable */:
          return readSoFar;
        case 2 /* Error */:
          if (readSoFar > 0) {
            return readSoFar;
          } else {
            throw createFileSystemProviderError(range2.error, "Unknown" /* Unknown */);
          }
        case 0 /* Valid */: {
          const start = Math.max(0, pos - range2.offset);
          const toWrite = range2.data.slice(start, Math.min(range2.data.byteLength, start + (length - readSoFar)));
          data.set(toWrite.buffer, offset + readSoFar);
          readSoFar += toWrite.byteLength;
          break;
        }
        default:
          assertNever(range2);
      }
    }
    return readSoFar;
  }
  /** @inheritdoc */
  write(fd, pos, data, offset, length) {
    const memory = this.fdMemory.get(fd);
    if (!memory) {
      throw createFileSystemProviderError(`No file with that descriptor open`, "Unavailable" /* Unavailable */);
    }
    return memory.region.write(pos, VSBuffer.wrap(data).slice(offset, offset + length));
  }
  parseUri(uri5) {
    if (uri5.scheme !== DEBUG_MEMORY_SCHEME) {
      throw createFileSystemProviderError(`Cannot open file with scheme ${uri5.scheme}`, "EntryNotFound" /* FileNotFound */);
    }
    const session = this.debugService.getModel().getSession(uri5.authority);
    if (!session) {
      throw createFileSystemProviderError(`Debug session not found`, "EntryNotFound" /* FileNotFound */);
    }
    let offset;
    const rangeMatch = rangeRe.exec(uri5.query);
    if (rangeMatch) {
      offset = { fromOffset: Number(rangeMatch[1]), toOffset: Number(rangeMatch[2]) };
    }
    const [, memoryReference] = uri5.path.split("/");
    return {
      session,
      offset,
      readOnly: !session.capabilities.supportsWriteMemoryRequest,
      sessionId: uri5.authority,
      memoryReference: decodeURIComponent(memoryReference)
    };
  }
};

var MemoryRegionView = class extends Disposable {
  constructor(parent, range2) {
    super();
    this.parent = parent;
    this.range = range2;
    this.invalidateEmitter = this._register(new Emitter());
    this.onDidInvalidate = this.invalidateEmitter.event;
    this.writable = parent.writable;
    this.width = range2.toOffset - range2.fromOffset;
    this._register(parent);
    this._register(parent.onDidInvalidate((e) => {
      const fromOffset = clamp(e.fromOffset - range2.fromOffset, 0, this.width);
      const toOffset = clamp(e.toOffset - range2.fromOffset, 0, this.width);
      if (toOffset > fromOffset) {
        this.invalidateEmitter.fire({ fromOffset, toOffset });
      }
    }));
  }
  read(fromOffset, toOffset) {
    if (fromOffset < 0) {
      throw new RangeError(`Invalid fromOffset: ${fromOffset}`);
    }
    return this.parent.read(
      this.range.fromOffset + fromOffset,
      this.range.fromOffset + Math.min(toOffset, this.width)
    );
  }
  write(offset, data) {
    return this.parent.write(this.range.fromOffset + offset, data);
  }
};
export { rangeRe, DebugMemoryFileSystemProvider, MemoryRegionView };
