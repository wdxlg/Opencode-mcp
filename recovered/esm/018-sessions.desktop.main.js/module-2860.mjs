// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/mcp/common/mcpResourceFilesystem.ts
import { Disposable, DisposableStore, MutableDisposable } from "./module-0012.mjs";
import { Lazy } from "./module-0028.mjs";
import { IMcpService, McpResourceURI } from "./module-1206.mjs";
import { ResourceMap } from "./module-0008.mjs";
import { Emitter, Event2 } from "./module-0017.mjs";
import { newWriteableStream } from "./module-0037.mjs";
import { VSBuffer, decodeBase64 } from "./module-0038.mjs";
import { autorun } from "./module-0052.mjs";
import { CancellationToken, CancellationTokenPool, CancellationTokenSource } from "./module-0025.mjs";
import { IFileService, createFileSystemProviderError } from "./module-0269.mjs";
import { sumBy } from "./module-0007.mjs";
import { URI } from "./module-0032.mjs";
import { equalsIgnoreCase } from "./module-0030.mjs";
import { disposableTimeout } from "./module-0036.mjs";
import { canLoadMcpNetworkResourceDirectly } from "./module-2174.mjs";
import { McpServer } from "./module-2309.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IWebContentExtractorService } from "./module-2039.mjs";


// src/vs/workbench/contrib/mcp/common/mcpResourceFilesystem.ts
var MOMENTARY_CACHE_DURATION = 3e3;

var McpResourceFilesystem = class extends Disposable {
  constructor(_instantiationService, _fileService, _webContentExtractorService) {
    super();
    this._instantiationService = _instantiationService;
    this._fileService = _fileService;
    this._webContentExtractorService = _webContentExtractorService;
    /** Defer getting the MCP service since this is a BlockRestore and no need to make it unnecessarily. */
    this._mcpServiceLazy = new Lazy(() => this._instantiationService.invokeFunction((a) => a.get(IMcpService)));
    /**
     * For many file operations we re-read the resources quickly (e.g. stat
     * before reading the file) and would prefer to avoid spamming the MCP
     * with multiple reads. This is a very short-duration cache
     * to solve that.
     */
    this._momentaryCache = new ResourceMap();
    this.onDidChangeCapabilities = Event2.None;
    this._onDidChangeFile = this._register(new Emitter());
    this.onDidChangeFile = this._onDidChangeFile.event;
    this.capabilities = 0 /* None */ | 2048 /* Readonly */ | 1024 /* PathCaseSensitive */ | 16 /* FileReadStream */ | 16384 /* FileAtomicRead */ | 2 /* FileReadWrite */;
    this._register(this._fileService.registerProvider(McpResourceURI.scheme, this));
  }
  get _mcpService() {
    return this._mcpServiceLazy.value;
  }
  //#region Filesystem API
  async readFile(resource) {
    return this._readFile(resource);
  }
  readFileStream(resource, opts, token) {
    const stream = newWriteableStream((data) => VSBuffer.concat(data.map((data2) => VSBuffer.wrap(data2))).buffer);
    this._readFile(resource, token).then(
      (data) => {
        if (opts.position) {
          data = data.slice(opts.position);
        }
        if (opts.length) {
          data = data.slice(0, opts.length);
        }
        stream.end(data);
      },
      (err) => stream.error(err)
    );
    return stream;
  }
  watch(uri4, _opts) {
    const { resourceURI, server } = this._decodeURI(uri4);
    const cap = server.capabilities.get();
    if (cap !== void 0 && !(cap & 32 /* ResourcesSubscribe */)) {
      return Disposable.None;
    }
    server.start();
    const store = new DisposableStore();
    let watchedOnHandler;
    const watchListener = store.add(new MutableDisposable());
    const callCts = store.add(new MutableDisposable());
    store.add(autorun((reader) => {
      const connection = server.connection.read(reader);
      if (!connection) {
        return;
      }
      const handler = connection.handler.read(reader);
      if (!handler || watchedOnHandler === handler) {
        return;
      }
      callCts.value?.dispose(true);
      callCts.value = new CancellationTokenSource();
      watchedOnHandler = handler;
      const token = callCts.value.token;
      handler.subscribe({ uri: resourceURI.toString() }, token).then(
        () => {
          if (!token.isCancellationRequested) {
            watchListener.value = handler.onDidUpdateResource((e4) => {
              if (equalsUrlPath(e4.params.uri, resourceURI)) {
                this._onDidChangeFile.fire([{ resource: uri4, type: 0 /* UPDATED */ }]);
              }
            });
          }
        },
        (err) => {
          handler.logger.warn(`Failed to subscribe to resource changes for ${resourceURI}: ${err}`);
          watchedOnHandler = void 0;
        }
      );
    }));
    return store;
  }
  async stat(resource) {
    const { forSameURI, contents } = await this._readURI(resource);
    if (!contents.length) {
      throw createFileSystemProviderError(`File not found`, "EntryNotFound" /* FileNotFound */);
    }
    return {
      ctime: 0,
      mtime: 0,
      size: sumBy(contents, (c) => contentToBuffer(c).byteLength),
      type: forSameURI.length ? 1 /* File */ : 2 /* Directory */
    };
  }
  async readdir(resource) {
    const { forSameURI, contents, resourceURI } = await this._readURI(resource);
    if (forSameURI.length > 0) {
      throw createFileSystemProviderError(`File is not a directory`, "EntryNotADirectory" /* FileNotADirectory */);
    }
    const resourcePathParts = resourceURI.pathname.split("/");
    const output = /* @__PURE__ */ new Map();
    for (const content of contents) {
      const contentURI = URI.parse(content.uri);
      const contentPathParts = contentURI.path.split("/");
      if (contentPathParts.length <= resourcePathParts.length || !resourcePathParts.every((part, index2) => equalsIgnoreCase(part, contentPathParts[index2]))) {
        continue;
      } else if (contentPathParts.length > resourcePathParts.length + 1) {
        output.set(contentPathParts[resourcePathParts.length], 2 /* Directory */);
      } else {
        const name = contentPathParts[contentPathParts.length - 1];
        output.set(name, contentToBuffer(content).byteLength > 0 ? 1 /* File */ : 2 /* Directory */);
      }
    }
    return [...output];
  }
  mkdir(resource) {
    throw createFileSystemProviderError("write is not supported", "NoPermissions" /* NoPermissions */);
  }
  writeFile(resource, content, opts) {
    throw createFileSystemProviderError("write is not supported", "NoPermissions" /* NoPermissions */);
  }
  delete(resource, opts) {
    throw createFileSystemProviderError("delete is not supported", "NoPermissions" /* NoPermissions */);
  }
  rename(from, to, opts) {
    throw createFileSystemProviderError("rename is not supported", "NoPermissions" /* NoPermissions */);
  }
  //#endregion
  async _readFile(resource, token) {
    const { forSameURI, contents } = await this._readURI(resource);
    if (!forSameURI.length) {
      if (!contents.length) {
        throw createFileSystemProviderError(`File not found`, "EntryNotFound" /* FileNotFound */);
      } else {
        throw createFileSystemProviderError(`File is a directory`, "EntryIsADirectory" /* FileIsADirectory */);
      }
    }
    return contentToBuffer(forSameURI[0]);
  }
  _decodeURI(uri4) {
    let definitionId;
    let resourceURL;
    try {
      ({ definitionId, resourceURL } = McpResourceURI.toServer(uri4));
    } catch (e4) {
      throw createFileSystemProviderError(String(e4), "EntryNotFound" /* FileNotFound */);
    }
    if (resourceURL.pathname.endsWith("/")) {
      resourceURL.pathname = resourceURL.pathname.slice(0, -1);
    }
    const server = this._mcpService.servers.get().find((s) => s.definition.id === definitionId);
    if (!server) {
      throw createFileSystemProviderError(`MCP server ${definitionId} not found`, "EntryNotFound" /* FileNotFound */);
    }
    const cap = server.capabilities.get();
    if (cap !== void 0 && !(cap & 16 /* Resources */)) {
      throw createFileSystemProviderError(`MCP server ${definitionId} does not support resources`, "EntryNotFound" /* FileNotFound */);
    }
    return { definitionId, resourceURI: resourceURL, server };
  }
  async _readURI(uri4, token) {
    const cached = this._momentaryCache.get(uri4);
    if (cached) {
      cached.pool.add(token || CancellationToken.None);
      return cached.promise;
    }
    const pool = this._store.add(new CancellationTokenPool());
    pool.add(token || CancellationToken.None);
    const promise = this._readURIInner(uri4, pool.token);
    this._momentaryCache.set(uri4, { pool, promise });
    const disposable = this._store.add(disposableTimeout(() => {
      this._momentaryCache.delete(uri4);
      this._store.delete(disposable);
      this._store.delete(pool);
    }, MOMENTARY_CACHE_DURATION));
    return promise;
  }
  async _readURIInner(uri4, token) {
    const { resourceURI, server } = this._decodeURI(uri4);
    const matchedServer = this._mcpService.servers.get().find((s) => s.definition.id === server.definition.id);
    if (canLoadMcpNetworkResourceDirectly(resourceURI, matchedServer)) {
      const extractURI3 = URI.parse(resourceURI.toString());
      const result = (await this._webContentExtractorService.extract([extractURI3], { followRedirects: false })).at(0);
      if (result?.status === "ok") {
        return {
          contents: [{ uri: resourceURI.toString(), text: result.result }],
          resourceURI,
          forSameURI: [{ uri: resourceURI.toString(), text: result.result }]
        };
      }
    }
    const res = await McpServer.callOn(server, (r2) => r2.readResource({ uri: resourceURI.toString() }, token), token);
    return {
      contents: res.contents,
      resourceURI,
      forSameURI: res.contents.filter((c) => equalsUrlPath(c.uri, resourceURI))
    };
  }
};

McpResourceFilesystem = __decorateClass([
  __decorateParam(0, IInstantiationService),
  __decorateParam(1, IFileService),
  __decorateParam(2, IWebContentExtractorService)
], McpResourceFilesystem);

function equalsUrlPath(a, b) {
  return equalsIgnoreCase(new URL(a).pathname, b.pathname);
}

function contentToBuffer(content) {
  if ("text" in content) {
    return VSBuffer.fromString(content.text).buffer;
  } else if ("blob" in content) {
    return decodeBase64(content.blob).buffer;
  } else {
    throw createFileSystemProviderError("Unknown content type", "Unknown" /* Unknown */);
  }
}
export { equalsUrlPath, contentToBuffer, MOMENTARY_CACHE_DURATION, McpResourceFilesystem };
