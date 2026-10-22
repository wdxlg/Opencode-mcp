// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/base/browser/dnd.ts
import { Disposable } from "./module-0012.mjs";
import { addDisposableListener } from "./module-0075.mjs";
import { Mimes } from "./module-0136.mjs";


// src/vs/base/browser/dnd.ts
var DelayedDragHandler = class extends Disposable {
  constructor(container3, callback) {
    super();
    this.timeout = void 0;
    this._register(addDisposableListener(container3, "dragover", (e) => {
      e.preventDefault();
      if (!this.timeout) {
        this.timeout = setTimeout(() => {
          callback();
          this.timeout = void 0;
        }, 800);
      }
    }));
    ["dragleave", "drop", "dragend"].forEach((type) => {
      this._register(addDisposableListener(container3, type, () => {
        this.clearDragTimeout();
      }));
    });
  }
  clearDragTimeout() {
    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = void 0;
    }
  }
  dispose() {
    super.dispose();
    this.clearDragTimeout();
  }
};

var DataTransfers = {
  /**
   * Application specific resource transfer type
   */
  RESOURCES: "ResourceURLs",
  /**
   * Browser specific transfer type to download
   */
  DOWNLOAD_URL: "DownloadURL",
  /**
   * Browser specific transfer type for files
   */
  FILES: "Files",
  /**
   * Typically transfer type for copy/paste transfers.
   */
  TEXT: Mimes.text,
  /**
   * Internal type used to pass around text/uri-list data.
   *
   * This is needed to work around https://bugs.chromium.org/p/chromium/issues/detail?id=239745.
   */
  INTERNAL_URI_LIST: "application/vnd.code.uri-list"
};
export { DelayedDragHandler, DataTransfers };
