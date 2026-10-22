// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/api/browser/mainThreadChatCodeMapper.ts
import { Disposable, DisposableMap } from "./module-0012.mjs";
import { ExtHostContext, MainContext } from "./module-0922.mjs";
import { URI } from "./module-0032.mjs";
import { TextEdit } from "./module-0164.mjs";
import { NotebookDto } from "./module-0995.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { extHostNamedCustomer } from "./module-0920.mjs";
import { ICodeMapperService } from "./module-1034.mjs";


// src/vs/workbench/api/browser/mainThreadChatCodeMapper.ts
var MainThreadChatCodemapper = class extends Disposable {
  constructor(extHostContext, codeMapperService) {
    super();
    this.codeMapperService = codeMapperService;
    this.providers = this._register(new DisposableMap());
    this._responseMap = /* @__PURE__ */ new Map();
    this._proxy = extHostContext.getProxy(ExtHostContext.ExtHostCodeMapper);
  }
  $registerCodeMapperProvider(handle2, displayName) {
    const impl = {
      displayName,
      mapCode: async (uiRequest, response, token) => {
        const requestId = String(MainThreadChatCodemapper._requestHandlePool++);
        this._responseMap.set(requestId, response);
        const extHostRequest = {
          requestId,
          codeBlocks: uiRequest.codeBlocks,
          chatRequestId: uiRequest.chatRequestId,
          chatRequestModel: uiRequest.chatRequestModel,
          chatSessionResource: uiRequest.chatSessionResource,
          location: uiRequest.location
        };
        try {
          return await this._proxy.$mapCode(handle2, extHostRequest, token).then((result) => result ?? void 0);
        } finally {
          this._responseMap.delete(requestId);
        }
      }
    };
    const disposable = this.codeMapperService.registerCodeMapperProvider(handle2, impl);
    this.providers.set(handle2, disposable);
  }
  $unregisterCodeMapperProvider(handle2) {
    this.providers.deleteAndDispose(handle2);
  }
  $handleProgress(requestId, data) {
    const response = this._responseMap.get(requestId);
    if (response) {
      const edits = data.edits;
      const resource = URI.revive(data.uri);
      if (!edits.length) {
        response.textEdit(resource, []);
      } else if (edits.every(TextEdit.isTextEdit)) {
        response.textEdit(resource, edits);
      } else {
        response.notebookEdit(resource, edits.map(NotebookDto.fromCellEditOperationDto));
      }
    }
    return Promise.resolve();
  }
};

MainThreadChatCodemapper._requestHandlePool = 0;

MainThreadChatCodemapper = __decorateClass([
  extHostNamedCustomer(MainContext.MainThreadCodeMapper),
  __decorateParam(1, ICodeMapperService)
], MainThreadChatCodemapper);
export { MainThreadChatCodemapper };
