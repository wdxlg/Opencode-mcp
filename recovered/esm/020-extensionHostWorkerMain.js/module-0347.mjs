// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/worker/extensionHostWorkerMain.js
// Original module marker: src/vs/workbench/api/common/extHostCodeMapper.ts
import { MainContext } from "./module-0025.mjs";
import { asArray } from "./module-0004.mjs";
import { NotebookEdit2, TextEdit2 } from "./module-0239.mjs";
import { LocalChatSessionUri } from "./module-0095.mjs";
import { URI } from "./module-0023.mjs";


// src/vs/workbench/api/common/extHostCodeMapper.ts
var ExtHostCodeMapper = class _ExtHostCodeMapper {
  constructor(mainContext) {
    this.providers = /* @__PURE__ */ new Map();
    this._proxy = mainContext.getProxy(MainContext.MainThreadCodeMapper);
  }
  static {
    this._providerHandlePool = 0;
  }
  async $mapCode(handle, internalRequest, token) {
    const provider = this.providers.get(handle);
    if (!provider) {
      throw new Error(`Received request to map code for unknown provider handle ${handle}`);
    }
    const stream = {
      textEdit: (target, edits) => {
        edits = asArray(edits);
        this._proxy.$handleProgress(internalRequest.requestId, {
          uri: target,
          edits: edits.map(TextEdit2.from)
        });
      },
      notebookEdit: (target, edits) => {
        edits = asArray(edits);
        this._proxy.$handleProgress(internalRequest.requestId, {
          uri: target,
          edits: edits.map(NotebookEdit2.from)
        });
      }
    };
    const request = {
      location: internalRequest.location,
      chatRequestId: internalRequest.chatRequestId,
      chatRequestModel: internalRequest.chatRequestModel,
      chatSessionId: internalRequest.chatSessionResource ? LocalChatSessionUri.parseLocalSessionId(URI.revive(internalRequest.chatSessionResource)) : void 0,
      codeBlocks: internalRequest.codeBlocks.map((block2) => {
        return {
          code: block2.code,
          resource: URI.revive(block2.resource),
          markdownBeforeBlock: block2.markdownBeforeBlock
        };
      })
    };
    const result = await provider.provideMappedEdits(request, stream, token);
    return result ?? null;
  }
  registerMappedEditsProvider(extension, provider) {
    const handle = _ExtHostCodeMapper._providerHandlePool++;
    this._proxy.$registerCodeMapperProvider(handle, extension.displayName ?? extension.name);
    this.providers.set(handle, provider);
    return {
      dispose: () => {
        return this._proxy.$unregisterCodeMapperProvider(handle);
      }
    };
  }
};
export { ExtHostCodeMapper };
