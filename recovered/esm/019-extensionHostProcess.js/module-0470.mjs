// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/node/extensionHostProcess.js
// Original module marker: src/vs/workbench/api/common/extHostUriOpener.ts
import { MainContext } from "./module-0054.mjs";
import { Schemas } from "./module-0026.mjs";
import { toDisposable } from "./module-0011.mjs";
import { URI } from "./module-0025.mjs";


// src/vs/workbench/api/common/extHostUriOpener.ts
var ExtHostUriOpeners = class _ExtHostUriOpeners {
  constructor(mainContext) {
    this._openers = /* @__PURE__ */ new Map();
    this._proxy = mainContext.getProxy(MainContext.MainThreadUriOpeners);
  }
  static {
    this.supportedSchemes = /* @__PURE__ */ new Set([Schemas.http, Schemas.https]);
  }
  registerExternalUriOpener(extensionId, id2, opener, metadata) {
    if (this._openers.has(id2)) {
      throw new Error(`Opener with id '${id2}' already registered`);
    }
    const invalidScheme = metadata.schemes.find((scheme) => !_ExtHostUriOpeners.supportedSchemes.has(scheme));
    if (invalidScheme) {
      throw new Error(`Scheme '${invalidScheme}' is not supported. Only http and https are currently supported.`);
    }
    this._openers.set(id2, opener);
    this._proxy.$registerUriOpener(id2, metadata.schemes, extensionId, metadata.label);
    return toDisposable(() => {
      this._openers.delete(id2);
      this._proxy.$unregisterUriOpener(id2);
    });
  }
  async $canOpenUri(id2, uriComponents, token) {
    const opener = this._openers.get(id2);
    if (!opener) {
      throw new Error(`Unknown opener with id: ${id2}`);
    }
    const uri2 = URI.revive(uriComponents);
    return opener.canOpenExternalUri(uri2, token);
  }
  async $openUri(id2, context, token) {
    const opener = this._openers.get(id2);
    if (!opener) {
      throw new Error(`Unknown opener id: '${id2}'`);
    }
    return opener.openExternalUri(URI.revive(context.resolvedUri), {
      sourceUri: URI.revive(context.sourceUri)
    }, token);
  }
};
export { ExtHostUriOpeners };
