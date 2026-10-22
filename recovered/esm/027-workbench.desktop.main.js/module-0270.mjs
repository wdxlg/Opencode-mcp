// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/platform/files/browser/webFileSystemAccess.ts



// src/vs/platform/files/browser/webFileSystemAccess.ts
var WebFileSystemAccess;

((WebFileSystemAccess2) => {
  function supported3(obj) {
    if (typeof obj?.showDirectoryPicker === "function") {
      return true;
    }
    return false;
  }
  WebFileSystemAccess2.supported = supported3;
  function isFileSystemHandle(handle2) {
    const candidate = handle2;
    if (!candidate) {
      return false;
    }
    return typeof candidate.kind === "string" && typeof candidate.queryPermission === "function" && typeof candidate.requestPermission === "function";
  }
  WebFileSystemAccess2.isFileSystemHandle = isFileSystemHandle;
  function isFileSystemFileHandle(handle2) {
    return handle2.kind === "file";
  }
  WebFileSystemAccess2.isFileSystemFileHandle = isFileSystemFileHandle;
  function isFileSystemDirectoryHandle(handle2) {
    return handle2.kind === "directory";
  }
  WebFileSystemAccess2.isFileSystemDirectoryHandle = isFileSystemDirectoryHandle;
})(WebFileSystemAccess || (WebFileSystemAccess = {}));

var WebFileSystemObserver;

((WebFileSystemObserver2) => {
  function supported3(obj) {
    return typeof obj?.FileSystemObserver === "function";
  }
  WebFileSystemObserver2.supported = supported3;
})(WebFileSystemObserver || (WebFileSystemObserver = {}));
export { WebFileSystemAccess, WebFileSystemObserver };
