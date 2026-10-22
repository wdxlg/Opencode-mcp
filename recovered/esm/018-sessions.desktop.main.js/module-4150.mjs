// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/webview/browser/resourceLoading.ts
import { IUriIdentityService } from "./module-0510.mjs";
import { FileOperationError, IFileService } from "./module-0269.mjs";
import { ILogService } from "./module-0095.mjs";
import { getWebviewContentMimeType } from "./module-4149.mjs";
import { Schemas } from "./module-0033.mjs";
import { isUNC } from "./module-0031.mjs";
import { URI } from "./module-0032.mjs";


// src/vs/workbench/contrib/webview/browser/resourceLoading.ts
var WebviewResourceResponse;

((WebviewResourceResponse2) => {
  let Type3;
  ((Type4) => {
    Type4[Type4["Success"] = 0] = "Success";
    Type4[Type4["Failed"] = 1] = "Failed";
    Type4[Type4["AccessDenied"] = 2] = "AccessDenied";
    Type4[Type4["NotModified"] = 3] = "NotModified";
  })(Type3 = WebviewResourceResponse2.Type || (WebviewResourceResponse2.Type = {}));
  class StreamSuccess {
    constructor(stream, etag2, mtime, mimeType, size3) {
      this.stream = stream;
      this.etag = etag2;
      this.mtime = mtime;
      this.mimeType = mimeType;
      this.size = size3;
      this.type = 0 /* Success */;
    }
  }
  WebviewResourceResponse2.StreamSuccess = StreamSuccess;
  WebviewResourceResponse2.Failed = { type: 1 /* Failed */ };
  WebviewResourceResponse2.AccessDenied = { type: 2 /* AccessDenied */ };
  class NotModified {
    constructor(mimeType, mtime) {
      this.mimeType = mimeType;
      this.mtime = mtime;
      this.type = 3 /* NotModified */;
    }
  }
  WebviewResourceResponse2.NotModified = NotModified;
})(WebviewResourceResponse || (WebviewResourceResponse = {}));

async function loadLocalResource(accessor, requestUri, options3, token) {
  const uriIdentityService = accessor.get(IUriIdentityService);
  const fileService = accessor.get(IFileService);
  const logService = accessor.get(ILogService);
  const resourceToLoad = getResourceToLoad(requestUri, options3.roots, uriIdentityService);
  logService.trace(`Webview.loadLocalResource - trying to load resource. requestUri=${requestUri}, resourceToLoad=${resourceToLoad}`);
  if (!resourceToLoad) {
    logService.trace(`Webview.loadLocalResource - access denied. requestUri=${requestUri}, resourceToLoad=${resourceToLoad}`);
    return WebviewResourceResponse.AccessDenied;
  }
  const mime = getWebviewContentMimeType(requestUri);
  try {
    const readOptions = { etag: options3.ifNoneMatch };
    if (options3.range) {
      readOptions.position = options3.range.start;
      if (options3.range.end !== void 0) {
        if (options3.range.end < options3.range.start) {
          return WebviewResourceResponse.Failed;
        }
        readOptions.length = options3.range.end - options3.range.start + 1;
      }
    }
    const result = await fileService.readFileStream(resourceToLoad, readOptions, token);
    logService.trace(`Webview.loadLocalResource - Loaded. requestUri=${requestUri}, resourceToLoad=${resourceToLoad}`);
    return new WebviewResourceResponse.StreamSuccess(result.value, result.etag, result.mtime, mime, result.size);
  } catch (err) {
    if (err instanceof FileOperationError) {
      const result = err.fileOperationResult;
      if (result === 2 /* FILE_NOT_MODIFIED_SINCE */) {
        logService.trace(`Webview.loadLocalResource - not modified. requestUri=${requestUri}, resourceToLoad=${resourceToLoad}`);
        return new WebviewResourceResponse.NotModified(mime, err.options?.mtime);
      }
    }
    logService.error(`Webview.loadLocalResource - Error using fileReader. requestUri=${requestUri}, resourceToLoad=${resourceToLoad}`);
    return WebviewResourceResponse.Failed;
  }
}

function getResourceToLoad(requestUri, roots, uriIdentityService) {
  const requestUriNoQueryString = requestUri.with({ query: "" });
  for (const root of roots) {
    if (containsResource(root, requestUriNoQueryString, uriIdentityService)) {
      return normalizeResourcePath(requestUri);
    }
  }
  return void 0;
}

function containsResource(root, resource, uriIdentityService) {
  if (uriIdentityService.extUri.isEqual(
    root,
    resource,
    /* ignoreFragment */
    true
  )) {
    return false;
  }
  if (root.scheme === Schemas.file && isUNC(root.fsPath)) {
    if (resource.scheme === Schemas.file && isUNC(resource.fsPath)) {
      return uriIdentityService.extUri.isEqualOrParent(
        resource.with({
          path: resource.path.toLowerCase(),
          authority: resource.authority.toLowerCase()
        }),
        root.with({
          path: root.path.toLowerCase(),
          authority: root.authority.toLowerCase()
        }),
        /* ignoreFragment */
        true
      );
    }
    return false;
  }
  return uriIdentityService.extUri.isEqualOrParent(
    resource,
    root,
    /* ignoreFragment */
    true
  );
}

function normalizeResourcePath(resource) {
  if (resource.scheme === Schemas.vscodeRemote) {
    return URI.from({
      scheme: Schemas.vscodeRemote,
      authority: resource.authority,
      path: "/vscode-resource",
      query: JSON.stringify({
        requestResourcePath: resource.path
      })
    });
  }
  return resource;
}
export { loadLocalResource, getResourceToLoad, containsResource, normalizeResourcePath, WebviewResourceResponse };
