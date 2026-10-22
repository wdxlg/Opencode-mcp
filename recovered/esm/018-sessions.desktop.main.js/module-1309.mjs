// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/api/browser/mainThreadChatOutputRenderer.ts
import { Disposable } from "./module-0012.mjs";
import { ExtHostContext } from "./module-0922.mjs";
import { VSBuffer } from "./module-0038.mjs";
import { URI } from "./module-0032.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IChatOutputRendererService } from "./module-1308.mjs";
import { ILogService } from "./module-0095.mjs";


// src/vs/workbench/api/browser/mainThreadChatOutputRenderer.ts
var MainThreadChatOutputRenderer = class extends Disposable {
  constructor(extHostContext, _mainThreadWebview, _rendererService, _logService) {
    super();
    this._mainThreadWebview = _mainThreadWebview;
    this._rendererService = _rendererService;
    this._logService = _logService;
    this._webviewHandlePool = 0;
    this.registeredRenderers = /* @__PURE__ */ new Map();
    this._proxy = extHostContext.getProxy(ExtHostContext.ExtHostChatOutputRenderer);
  }
  dispose() {
    super.dispose();
    this.registeredRenderers.forEach((disposable) => disposable.dispose());
    this.registeredRenderers.clear();
  }
  $registerChatOutputRenderer(viewType, extensionId, extensionLocation) {
    const existingRegistration = this.registeredRenderers.get(viewType);
    if (existingRegistration) {
      this._logService.warn(`Re-registering chat output renderer for view type '${viewType}' from extension '${extensionId.value}'.`);
      existingRegistration.dispose();
    }
    const disposable = this._rendererService.registerRenderer(viewType, {
      renderOutputPart: async (mime, data, webview, context2, token) => {
        const webviewHandle = `chat-output-${++this._webviewHandlePool}`;
        this._mainThreadWebview.addWebview(webviewHandle, webview, {
          serializeBuffersForPostMessage: true
        });
        return this._proxy.$renderChatOutput(viewType, mime, VSBuffer.wrap(data), webviewHandle, context2, token);
      }
    }, {
      extension: { id: extensionId, location: URI.revive(extensionLocation) }
    });
    this.registeredRenderers.set(viewType, disposable);
  }
  $unregisterChatOutputRenderer(viewType) {
    this.registeredRenderers.get(viewType)?.dispose();
    this.registeredRenderers.delete(viewType);
  }
};

MainThreadChatOutputRenderer = __decorateClass([
  __decorateParam(2, IChatOutputRendererService),
  __decorateParam(3, ILogService)
], MainThreadChatOutputRenderer);
export { MainThreadChatOutputRenderer };
