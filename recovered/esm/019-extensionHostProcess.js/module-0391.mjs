// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/node/extensionHostProcess.js
// Original module marker: src/vs/workbench/api/common/extHostFileSystem.ts
import { commonPrefixLength } from "./module-0023.mjs";
import { LinkComputer, StateMachine } from "./module-0390.mjs";
import { DocumentLink2 } from "./module-0245.mjs";
import { MainContext } from "./module-0054.mjs";
import { checkProposedApiEnabled } from "./module-0173.mjs";
import { isMarkdownString } from "./module-0086.mjs";
import { toDisposable } from "./module-0011.mjs";
import { URI } from "./module-0025.mjs";
import { VSBuffer } from "./module-0031.mjs";


// src/vs/workbench/api/common/extHostFileSystem.ts
var FsLinkProvider = class {
  constructor() {
    this._schemes = [];
  }
  add(scheme) {
    this._stateMachine = void 0;
    this._schemes.push(scheme);
  }
  delete(scheme) {
    const idx = this._schemes.indexOf(scheme);
    if (idx >= 0) {
      this._schemes.splice(idx, 1);
      this._stateMachine = void 0;
    }
  }
  _initStateMachine() {
    if (!this._stateMachine) {
      const schemes = this._schemes.sort();
      const edges = [];
      let prevScheme;
      let prevState;
      let lastState = 14 /* LastKnownState */;
      let nextState = 14 /* LastKnownState */;
      for (const scheme of schemes) {
        let pos = !prevScheme ? 0 : commonPrefixLength(prevScheme, scheme);
        if (pos === 0) {
          prevState = 1 /* Start */;
        } else {
          prevState = nextState;
        }
        for (; pos < scheme.length; pos++) {
          if (pos + 1 === scheme.length) {
            lastState = nextState;
            nextState = 9 /* BeforeColon */;
          } else {
            nextState += 1;
          }
          edges.push([prevState, scheme.toUpperCase().charCodeAt(pos), nextState]);
          edges.push([prevState, scheme.toLowerCase().charCodeAt(pos), nextState]);
          prevState = nextState;
        }
        prevScheme = scheme;
        nextState = lastState;
      }
      edges.push([9 /* BeforeColon */, 58 /* Colon */, 10 /* AfterColon */]);
      edges.push([10 /* AfterColon */, 47 /* Slash */, 12 /* End */]);
      this._stateMachine = new StateMachine(edges);
    }
  }
  provideDocumentLinks(document2) {
    this._initStateMachine();
    const result = [];
    const links = LinkComputer.computeLinks({
      getLineContent(lineNumber) {
        return document2.lineAt(lineNumber - 1).text;
      },
      getLineCount() {
        return document2.lineCount;
      }
    }, this._stateMachine);
    for (const link2 of links) {
      const docLink = DocumentLink2.to(link2);
      if (docLink.target) {
        result.push(docLink);
      }
    }
    return result;
  }
};

var ExtHostFileSystem = class _ExtHostFileSystem {
  constructor(mainContext, _extHostLanguageFeatures) {
    this._extHostLanguageFeatures = _extHostLanguageFeatures;
    this._linkProvider = new FsLinkProvider();
    this._fsProvider = /* @__PURE__ */ new Map();
    this._registeredSchemes = /* @__PURE__ */ new Set();
    this._watches = /* @__PURE__ */ new Map();
    this._handlePool = 0;
    this._proxy = mainContext.getProxy(MainContext.MainThreadFileSystem);
  }
  dispose() {
    this._linkProviderRegistration?.dispose();
  }
  registerFileSystemProvider(extension, scheme, provider, options2 = {}) {
    _ExtHostFileSystem._validateFileSystemProvider(provider);
    if (this._registeredSchemes.has(scheme)) {
      throw new Error(`a provider for the scheme '${scheme}' is already registered`);
    }
    if (!this._linkProviderRegistration) {
      this._linkProviderRegistration = this._extHostLanguageFeatures.registerDocumentLinkProvider(extension, "*", this._linkProvider);
    }
    const handle = this._handlePool++;
    this._linkProvider.add(scheme);
    this._registeredSchemes.add(scheme);
    this._fsProvider.set(handle, provider);
    let capabilities = 2 /* FileReadWrite */;
    if (options2.isCaseSensitive) {
      capabilities += 1024 /* PathCaseSensitive */;
    }
    if (options2.isReadonly) {
      capabilities += 2048 /* Readonly */;
    }
    if (typeof provider.copy === "function") {
      capabilities += 8 /* FileFolderCopy */;
    }
    if (typeof provider.open === "function" && typeof provider.close === "function" && typeof provider.read === "function" && typeof provider.write === "function") {
      checkProposedApiEnabled(extension, "fsChunks");
      capabilities += 4 /* FileOpenReadWriteClose */;
    }
    let readOnlyMessage;
    if (options2.isReadonly && isMarkdownString(options2.isReadonly) && options2.isReadonly.value !== "") {
      readOnlyMessage = {
        value: options2.isReadonly.value,
        isTrusted: options2.isReadonly.isTrusted,
        supportThemeIcons: options2.isReadonly.supportThemeIcons,
        supportHtml: options2.isReadonly.supportHtml,
        baseUri: options2.isReadonly.baseUri,
        uris: options2.isReadonly.uris
      };
    }
    this._proxy.$registerFileSystemProvider(handle, scheme, capabilities, readOnlyMessage).catch((err) => {
      console.error(`FAILED to register filesystem provider of ${extension.identifier.value}-extension for the scheme ${scheme}`);
      console.error(err);
    });
    const subscription = provider.onDidChangeFile((event) => {
      const mapped = [];
      for (const e of event) {
        const { uri: resource, type } = e;
        if (resource.scheme !== scheme) {
          continue;
        }
        let newType;
        switch (type) {
          case 1 /* Changed */:
            newType = 0 /* UPDATED */;
            break;
          case 2 /* Created */:
            newType = 1 /* ADDED */;
            break;
          case 3 /* Deleted */:
            newType = 2 /* DELETED */;
            break;
          default:
            throw new Error("Unknown FileChangeType");
        }
        mapped.push({ resource, type: newType });
      }
      this._proxy.$onFileSystemChange(handle, mapped);
    });
    return toDisposable(() => {
      subscription.dispose();
      this._linkProvider.delete(scheme);
      this._registeredSchemes.delete(scheme);
      this._fsProvider.delete(handle);
      this._proxy.$unregisterProvider(handle);
    });
  }
  static _validateFileSystemProvider(provider) {
    if (!provider) {
      throw new Error("MISSING provider");
    }
    if (typeof provider.watch !== "function") {
      throw new Error("Provider does NOT implement watch");
    }
    if (typeof provider.stat !== "function") {
      throw new Error("Provider does NOT implement stat");
    }
    if (typeof provider.readDirectory !== "function") {
      throw new Error("Provider does NOT implement readDirectory");
    }
    if (typeof provider.createDirectory !== "function") {
      throw new Error("Provider does NOT implement createDirectory");
    }
    if (typeof provider.readFile !== "function") {
      throw new Error("Provider does NOT implement readFile");
    }
    if (typeof provider.writeFile !== "function") {
      throw new Error("Provider does NOT implement writeFile");
    }
    if (typeof provider.delete !== "function") {
      throw new Error("Provider does NOT implement delete");
    }
    if (typeof provider.rename !== "function") {
      throw new Error("Provider does NOT implement rename");
    }
  }
  static _asIStat(stat2) {
    const { type, ctime, mtime, size, permissions } = stat2;
    return { type, ctime, mtime, size, permissions };
  }
  $stat(handle, resource) {
    return Promise.resolve(this._getFsProvider(handle).stat(URI.revive(resource))).then((stat2) => _ExtHostFileSystem._asIStat(stat2));
  }
  $readdir(handle, resource) {
    return Promise.resolve(this._getFsProvider(handle).readDirectory(URI.revive(resource)));
  }
  $readFile(handle, resource) {
    return Promise.resolve(this._getFsProvider(handle).readFile(URI.revive(resource))).then((data) => VSBuffer.wrap(data));
  }
  $writeFile(handle, resource, content, opts) {
    return Promise.resolve(this._getFsProvider(handle).writeFile(URI.revive(resource), content.buffer, opts));
  }
  $delete(handle, resource, opts) {
    return Promise.resolve(this._getFsProvider(handle).delete(URI.revive(resource), opts));
  }
  $rename(handle, oldUri, newUri, opts) {
    return Promise.resolve(this._getFsProvider(handle).rename(URI.revive(oldUri), URI.revive(newUri), opts));
  }
  $copy(handle, oldUri, newUri, opts) {
    const provider = this._getFsProvider(handle);
    if (!provider.copy) {
      throw new Error('FileSystemProvider does not implement "copy"');
    }
    return Promise.resolve(provider.copy(URI.revive(oldUri), URI.revive(newUri), opts));
  }
  $mkdir(handle, resource) {
    return Promise.resolve(this._getFsProvider(handle).createDirectory(URI.revive(resource)));
  }
  $watch(handle, session, resource, opts) {
    const subscription = this._getFsProvider(handle).watch(URI.revive(resource), opts);
    this._watches.set(session, subscription);
  }
  $unwatch(_handle, session) {
    const subscription = this._watches.get(session);
    if (subscription) {
      subscription.dispose();
      this._watches.delete(session);
    }
  }
  $open(handle, resource, opts) {
    const provider = this._getFsProvider(handle);
    if (!provider.open) {
      throw new Error('FileSystemProvider does not implement "open"');
    }
    return Promise.resolve(provider.open(URI.revive(resource), opts));
  }
  $close(handle, fd) {
    const provider = this._getFsProvider(handle);
    if (!provider.close) {
      throw new Error('FileSystemProvider does not implement "close"');
    }
    return Promise.resolve(provider.close(fd));
  }
  $read(handle, fd, pos, length) {
    const provider = this._getFsProvider(handle);
    if (!provider.read) {
      throw new Error('FileSystemProvider does not implement "read"');
    }
    const data = VSBuffer.alloc(length);
    return Promise.resolve(provider.read(fd, pos, data.buffer, 0, length)).then((read2) => {
      return data.slice(0, read2);
    });
  }
  $write(handle, fd, pos, data) {
    const provider = this._getFsProvider(handle);
    if (!provider.write) {
      throw new Error('FileSystemProvider does not implement "write"');
    }
    return Promise.resolve(provider.write(fd, pos, data.buffer, 0, data.byteLength));
  }
  _getFsProvider(handle) {
    const provider = this._fsProvider.get(handle);
    if (!provider) {
      const err = new Error();
      err.name = "ENOPRO";
      err.message = `no provider`;
      throw err;
    }
    return provider;
  }
};
export { FsLinkProvider, ExtHostFileSystem };
