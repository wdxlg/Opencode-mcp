// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/common/workingDirectory.ts
import { extUriBiasedIgnorePathCase, joinPath } from "./module-0034.mjs";


// src/vs/workbench/contrib/chat/common/workingDirectory.ts
var WorkingDirectory = class {
  constructor(_workspaceContextService, _uri) {
    this._workspaceContextService = _workspaceContextService;
    this._uri = _uri;
  }
  /** The explicit working directory URI, if set. */
  get uri() {
    return this._uri;
  }
  /** Whether an explicit working directory is set. */
  get hasExplicitWorkingDirectory() {
    return !!this._uri;
  }
  /**
   * Returns the workspace folder containing the given resource.
   * When a working directory is set, only checks against it.
   * Otherwise falls back to workspace context service.
   */
  getFolder(resource) {
    if (this._uri) {
      return extUriBiasedIgnorePathCase.isEqualOrParent(resource, this._uri) ? this._uri : void 0;
    }
    return this._workspaceContextService.getWorkspaceFolder(resource)?.uri;
  }
  /**
   * Resolves a workspace-relative file path to a URI.
   * When a working directory is set, resolves against it.
   * Otherwise resolves against the first workspace folder.
   *
   * The resolved URI is guaranteed to stay within the base directory: a
   * `filePath` containing parent-directory segments (e.g. `../outside.ts`)
   * that escapes the base directory is rejected and `undefined` is returned.
   * This prevents path traversal out of the working directory boundary.
   */
  resolveRelativePath(filePath) {
    const base = this._uri ?? this._workspaceContextService.getWorkspace().folders.at(0)?.uri;
    if (!base) {
      return void 0;
    }
    const resolved = joinPath(base, filePath);
    if (!extUriBiasedIgnorePathCase.isEqualOrParent(resolved, base)) {
      return void 0;
    }
    return resolved;
  }
};
export { WorkingDirectory };
