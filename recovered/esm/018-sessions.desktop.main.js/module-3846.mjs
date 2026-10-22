// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/platform/uriIdentity/common/uriIdentityService.ts
import { DisposableStore } from "./module-0012.mjs";
import { Event2 } from "./module-0017.mjs";
import { URI } from "./module-0032.mjs";
import { ExtUri, normalizePath } from "./module-0034.mjs";
import { quickSelect } from "./module-0007.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IFileService } from "./module-0269.mjs";
import { registerSingleton } from "./module-0135.mjs";
import { IUriIdentityService } from "./module-0510.mjs";


// src/vs/platform/uriIdentity/common/uriIdentityService.ts
var Entry = class _Entry {
  constructor(uri4) {
    this.uri = uri4;
    this.time = _Entry._clock++;
  }
  static {
    this._clock = 0;
  }
  touch() {
    this.time = _Entry._clock++;
    return this;
  }
};

var UriIdentityService = class {
  constructor(_fileService) {
    this._fileService = _fileService;
    this._dispooables = new DisposableStore();
    this._limit = 2 ** 16;
    const schemeIgnoresPathCasingCache = /* @__PURE__ */ new Map();
    const ignorePathCasing = (uri4) => {
      let ignorePathCasing2 = schemeIgnoresPathCasingCache.get(uri4.scheme);
      if (ignorePathCasing2 === void 0) {
        ignorePathCasing2 = _fileService.hasProvider(uri4) && !this._fileService.hasCapability(uri4, 1024 /* PathCaseSensitive */);
        schemeIgnoresPathCasingCache.set(uri4.scheme, ignorePathCasing2);
      }
      return ignorePathCasing2;
    };
    this._dispooables.add(Event2.any(
      _fileService.onDidChangeFileSystemProviderRegistrations,
      _fileService.onDidChangeFileSystemProviderCapabilities
    )((e4) => {
      const oldIgnorePathCasingValue = schemeIgnoresPathCasingCache.get(e4.scheme);
      if (oldIgnorePathCasingValue === void 0) {
        return;
      }
      schemeIgnoresPathCasingCache.delete(e4.scheme);
      const newIgnorePathCasingValue = ignorePathCasing(URI.from({ scheme: e4.scheme }));
      if (newIgnorePathCasingValue === newIgnorePathCasingValue) {
        return;
      }
      for (const [key3, entry] of this._canonicalUris.entries()) {
        if (entry.uri.scheme !== e4.scheme) {
          continue;
        }
        this._canonicalUris.delete(key3);
      }
    }));
    this.extUri = new ExtUri(ignorePathCasing);
    this._canonicalUris = /* @__PURE__ */ new Map();
  }
  dispose() {
    this._dispooables.dispose();
    this._canonicalUris.clear();
  }
  asCanonicalUri(uri4) {
    if (this._fileService.hasProvider(uri4)) {
      uri4 = normalizePath(uri4);
    }
    const uriKey = this.extUri.getComparisonKey(uri4, true);
    const item = this._canonicalUris.get(uriKey);
    if (item) {
      return item.touch().uri.with({ fragment: uri4.fragment });
    }
    this._canonicalUris.set(uriKey, new Entry(uri4));
    this._checkTrim();
    return uri4;
  }
  _checkTrim() {
    if (this._canonicalUris.size < this._limit) {
      return;
    }
    Entry._clock = 1;
    const times = [...this._canonicalUris.values()].map((e4) => e4.time);
    const median = quickSelect(
      Math.floor(times.length / 2),
      times,
      (a, b) => a - b
    );
    for (const [key3, entry] of this._canonicalUris.entries()) {
      if (entry.time <= median) {
        this._canonicalUris.delete(key3);
      } else {
        entry.time = 0;
      }
    }
  }
};

UriIdentityService = __decorateClass([
  __decorateParam(0, IFileService)
], UriIdentityService);

registerSingleton(IUriIdentityService, UriIdentityService, 1 /* Delayed */);
export { Entry, UriIdentityService };
