// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/platform/remote/electron-browser/electronRemoteResourceLoader.ts
import { Disposable } from "./module-0012.mjs";
import { NODE_REMOTE_RESOURCE_CHANNEL_NAME, NODE_REMOTE_RESOURCE_IPC_METHOD_NAME } from "./module-3862.mjs";
import { URI } from "./module-0032.mjs";
import { Schemas } from "./module-0033.mjs";
import { VSBuffer, encodeBase64 } from "./module-0038.mjs";
import { FileOperationError, IFileService } from "./module-0269.mjs";
import { getMediaOrTextMime } from "./module-0136.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IMainProcessService } from "./module-3825.mjs";


// src/vs/platform/remote/electron-browser/electronRemoteResourceLoader.ts
var ElectronRemoteResourceLoader = class extends Disposable {
  constructor(windowId, mainProcessService, fileService) {
    super();
    this.windowId = windowId;
    this.fileService = fileService;
    const channel = {
      listen(_, event) {
        throw new Error(`Event not found: ${event}`);
      },
      call: (_, command4, arg) => {
        switch (command4) {
          case NODE_REMOTE_RESOURCE_IPC_METHOD_NAME:
            return this.doRequest(URI.revive(arg[0]));
        }
        throw new Error(`Call not found: ${command4}`);
      }
    };
    mainProcessService.registerChannel(NODE_REMOTE_RESOURCE_CHANNEL_NAME, channel);
  }
  async doRequest(uri4) {
    const params = new URLSearchParams(uri4.query);
    const authority = params.get("authority");
    if (!authority) {
      return { statusCode: 404, body: "" };
    }
    let content;
    try {
      const actual = uri4.with({
        scheme: Schemas.vscodeRemote,
        authority,
        query: ""
      });
      content = await this.fileService.readFile(actual);
    } catch (e4) {
      const str = encodeBase64(VSBuffer.fromString(e4.message));
      if (e4 instanceof FileOperationError && e4.fileOperationResult === 1 /* FILE_NOT_FOUND */) {
        return { statusCode: 404, body: str };
      } else {
        return { statusCode: 500, body: str };
      }
    }
    const mimeType = uri4.path && getMediaOrTextMime(uri4.path);
    return { statusCode: 200, body: encodeBase64(content.value), mimeType };
  }
  getResourceUriProvider() {
    return (uri4) => uri4.with({
      scheme: Schemas.vscodeManagedRemoteResource,
      authority: `window:${this.windowId}`,
      query: new URLSearchParams({ authority: uri4.authority, scheme: uri4.scheme }).toString()
    });
  }
};

ElectronRemoteResourceLoader = __decorateClass([
  __decorateParam(1, IMainProcessService),
  __decorateParam(2, IFileService)
], ElectronRemoteResourceLoader);
export { ElectronRemoteResourceLoader };
