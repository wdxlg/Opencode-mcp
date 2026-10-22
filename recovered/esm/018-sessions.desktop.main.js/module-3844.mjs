// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/platform/files/common/diskFileSystemProviderClient.ts
import { Disposable, DisposableStore, toDisposable } from "./module-0012.mjs";
import { Emitter, Event2 } from "./module-0017.mjs";
import { generateUuid } from "./module-0190.mjs";
import { newWriteableStream } from "./module-0037.mjs";
import { VSBuffer } from "./module-0038.mjs";
import { createFileSystemProviderError } from "./module-0269.mjs";
import { toErrorMessage } from "./module-0094.mjs";
import { canceled } from "./module-0004.mjs";
import { reviveFileChanges } from "./module-3843.mjs";


// src/vs/platform/files/common/diskFileSystemProviderClient.ts
var LOCAL_FILE_SYSTEM_CHANNEL_NAME = "localFilesystem";

var DiskFileSystemProviderClient = class extends Disposable {
  constructor(channel, extraCapabilities) {
    super();
    this.channel = channel;
    this.extraCapabilities = extraCapabilities;
    //#region File Capabilities
    this.onDidChangeCapabilities = Event2.None;
    //#endregion
    //#region File Watching
    this._onDidChange = this._register(new Emitter());
    this.onDidChangeFile = this._onDidChange.event;
    this._onDidWatchError = this._register(new Emitter());
    this.onDidWatchError = this._onDidWatchError.event;
    // The contract for file watching via remote is to identify us
    // via a unique but readonly session ID. Since the remote is
    // managing potentially many watchers from different clients,
    // this helps the server to properly partition events to the right
    // clients.
    this.sessionId = generateUuid();
    this.registerFileChangeListeners();
  }
  get capabilities() {
    if (!this._capabilities) {
      this._capabilities = 2 /* FileReadWrite */ | 4 /* FileOpenReadWriteClose */ | 16 /* FileReadStream */ | 8 /* FileFolderCopy */ | 8192 /* FileWriteUnlock */ | 16384 /* FileAtomicRead */ | 32768 /* FileAtomicWrite */ | 65536 /* FileAtomicDelete */ | 524288 /* FileAppend */ | 131072 /* FileClone */ | 262144 /* FileRealpath */;
      if (this.extraCapabilities.pathCaseSensitive) {
        this._capabilities |= 1024 /* PathCaseSensitive */;
      }
      if (this.extraCapabilities.trash) {
        this._capabilities |= 4096 /* Trash */;
      }
    }
    return this._capabilities;
  }
  //#endregion
  //#region File Metadata Resolving
  stat(resource) {
    return this.channel.call("stat", [resource]);
  }
  realpath(resource) {
    return this.channel.call("realpath", [resource]);
  }
  readdir(resource) {
    return this.channel.call("readdir", [resource]);
  }
  //#endregion
  //#region File Reading/Writing
  async readFile(resource, opts) {
    const { buffer } = await this.channel.call("readFile", [resource, opts]);
    return buffer;
  }
  readFileStream(resource, opts, token) {
    const stream = newWriteableStream((data) => VSBuffer.concat(data.map((data2) => VSBuffer.wrap(data2))).buffer);
    const disposables = new DisposableStore();
    disposables.add(this.channel.listen("readFileStream", [resource, opts])((dataOrErrorOrEnd) => {
      if (dataOrErrorOrEnd instanceof VSBuffer) {
        stream.write(dataOrErrorOrEnd.buffer);
      } else {
        if (dataOrErrorOrEnd === "end") {
          stream.end();
        } else {
          let error;
          if (dataOrErrorOrEnd instanceof Error) {
            error = dataOrErrorOrEnd;
          } else {
            const errorCandidate = dataOrErrorOrEnd;
            error = createFileSystemProviderError(errorCandidate.message ?? toErrorMessage(errorCandidate), errorCandidate.code ?? "Unknown" /* Unknown */);
          }
          stream.error(error);
          stream.end();
        }
        disposables.dispose();
      }
    }));
    disposables.add(token.onCancellationRequested(() => {
      stream.error(canceled());
      stream.end();
      disposables.dispose();
    }));
    return stream;
  }
  writeFile(resource, content, opts) {
    return this.channel.call("writeFile", [resource, VSBuffer.wrap(content), opts]);
  }
  open(resource, opts) {
    return this.channel.call("open", [resource, opts]);
  }
  close(fd) {
    return this.channel.call("close", [fd]);
  }
  async read(fd, pos, data, offset, length) {
    const [bytes, bytesRead] = await this.channel.call("read", [fd, pos, length]);
    data.set(bytes.buffer.slice(0, bytesRead), offset);
    return bytesRead;
  }
  write(fd, pos, data, offset, length) {
    return this.channel.call("write", [fd, pos, VSBuffer.wrap(data), offset, length]);
  }
  //#endregion
  //#region Move/Copy/Delete/Create Folder
  mkdir(resource) {
    return this.channel.call("mkdir", [resource]);
  }
  delete(resource, opts) {
    return this.channel.call("delete", [resource, opts]);
  }
  rename(resource, target, opts) {
    return this.channel.call("rename", [resource, target, opts]);
  }
  copy(resource, target, opts) {
    return this.channel.call("copy", [resource, target, opts]);
  }
  //#endregion
  //#region Clone File
  cloneFile(resource, target) {
    return this.channel.call("cloneFile", [resource, target]);
  }
  registerFileChangeListeners() {
    this._register(this.channel.listen("fileChange", [this.sessionId])((eventsOrError) => {
      if (Array.isArray(eventsOrError)) {
        const events = eventsOrError;
        this._onDidChange.fire(reviveFileChanges(events));
      } else {
        const error = eventsOrError;
        this._onDidWatchError.fire(error);
      }
    }));
  }
  watch(resource, opts) {
    const req = generateUuid();
    this.channel.call("watch", [this.sessionId, req, resource, opts]);
    return toDisposable(() => this.channel.call("unwatch", [this.sessionId, req]));
  }
  //#endregion
};
export { LOCAL_FILE_SYSTEM_CHANNEL_NAME, DiskFileSystemProviderClient };
