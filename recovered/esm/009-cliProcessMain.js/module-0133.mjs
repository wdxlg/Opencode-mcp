// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/code/node/cliProcessMain.js
// Original module marker: src/vs/platform/policy/common/filePolicyService.ts
import { Iterable } from "./module-0010.mjs";
import { AbstractPolicyService } from "./module-0050.mjs";
import { ThrottledDelayer } from "./module-0028.mjs";
import { Event } from "./module-0017.mjs";
import { isObject } from "./module-0009.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IFileService } from "./module-0044.mjs";
import { ILogService } from "./module-0049.mjs";


// src/vs/platform/policy/common/filePolicyService.ts
function keysDiff(a, b) {
  const result = [];
  for (const key of new Set(Iterable.concat(a.keys(), b.keys()))) {
    if (a.get(key) !== b.get(key)) {
      result.push(key);
    }
  }
  return result;
}

var FilePolicyService = class extends AbstractPolicyService {
  constructor(file, fileService, logService) {
    super();
    this.file = file;
    this.fileService = fileService;
    this.logService = logService;
    this.throttledDelayer = this._register(new ThrottledDelayer(500));
    const onDidChangePolicyFile = Event.filter(fileService.onDidFilesChange, (e) => e.affects(file));
    this._register(fileService.watch(file));
    this._register(onDidChangePolicyFile(() => this.throttledDelayer.trigger(() => this.refresh())));
  }
  async _updatePolicyDefinitions() {
    await this.refresh();
  }
  async read() {
    const policies = /* @__PURE__ */ new Map();
    try {
      const content = await this.fileService.readFile(this.file);
      const raw = JSON.parse(content.value.toString());
      if (!isObject(raw)) {
        throw new Error("Policy file isn't a JSON object");
      }
      for (const key of Object.keys(raw)) {
        if (this.policyDefinitions[key]) {
          policies.set(key, raw[key]);
        }
      }
    } catch (error) {
      if (error.fileOperationResult !== 1 /* FILE_NOT_FOUND */) {
        this.logService.error(`[FilePolicyService] Failed to read policies`, error);
      }
    }
    return policies;
  }
  async refresh() {
    const policies = await this.read();
    const diff2 = keysDiff(this.policies, policies);
    this.policies = policies;
    if (diff2.length > 0) {
      this._onDidChange.fire(diff2);
    }
  }
};

FilePolicyService = __decorateClass([
  __decorateParam(1, IFileService),
  __decorateParam(2, ILogService)
], FilePolicyService);
export { keysDiff, FilePolicyService };
