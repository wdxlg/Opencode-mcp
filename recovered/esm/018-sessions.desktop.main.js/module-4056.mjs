// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/electron-browser/pluginGitCommandService.ts
import { generateUuid } from "./module-0190.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ILocalGitService } from "./module-4042.mjs";


// src/vs/workbench/contrib/chat/electron-browser/pluginGitCommandService.ts
var NativePluginGitCommandService = class {
  constructor(_localGitService) {
    this._localGitService = _localGitService;
  }
  _withCancel(token, fn) {
    const operationId = generateUuid();
    const listener = token?.onCancellationRequested(() => {
      this._localGitService.cancel(operationId).catch(() => {
      });
    });
    return fn(operationId).finally(() => listener?.dispose());
  }
  async cloneRepository(cloneUrl, targetDir, ref, token) {
    await this._withCancel(token, (id2) => this._localGitService.clone(id2, cloneUrl, targetDir.fsPath, ref));
  }
  async pull(repoDir, token) {
    return this._withCancel(token, (id2) => this._localGitService.pull(id2, repoDir.fsPath, { allowHardResetOnDivergence: true }));
  }
  async checkout(repoDir, treeish, detached, token) {
    await this._withCancel(token, (id2) => this._localGitService.checkout(id2, repoDir.fsPath, treeish, detached));
  }
  async checkoutCommit(repoDir, commit, token) {
    await this._withCancel(token, (id2) => this._localGitService.checkoutCommit(id2, repoDir.fsPath, commit));
  }
  async revParse(repoDir, ref) {
    return this._localGitService.revParse(repoDir.fsPath, ref);
  }
  async fetch(repoDir, token) {
    await this._withCancel(token, (id2) => this._localGitService.fetch(id2, repoDir.fsPath));
  }
  async fetchRepository(repoDir, token) {
    await this._withCancel(token, (id2) => this._localGitService.fetch(id2, repoDir.fsPath));
  }
  async revListCount(repoDir, fromRef, toRef) {
    return this._localGitService.revListCount(repoDir.fsPath, fromRef, toRef);
  }
};

NativePluginGitCommandService = __decorateClass([
  __decorateParam(0, ILocalGitService)
], NativePluginGitCommandService);
export { NativePluginGitCommandService };
