// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/main.js
// Original module marker: src/vs/platform/policy/common/filePolicyService.ts
import { Iterable, init_iterator } from "./module-0017.mjs";
import { __decorateClass, __decorateParam, __esm } from "./module-0000.mjs";
import { ThrottledDelayer, init_async } from "./module-0034.mjs";
import { Event, init_event } from "./module-0021.mjs";
import { init_types, isObject } from "./module-0016.mjs";
import { IFileService, init_files } from "./module-0072.mjs";
import { ILogService, init_log } from "./module-0075.mjs";
import { AbstractPolicyService, init_policy2 } from "./module-0210.mjs";


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

var FilePolicyService;

var init_filePolicyService = __esm({
  "src/vs/platform/policy/common/filePolicyService.ts"() {
    init_async();
    init_event();
    init_iterator();
    init_types();
    init_files();
    init_log();
    init_policy2();
    FilePolicyService = class extends AbstractPolicyService {
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
  }
});
export { keysDiff, FilePolicyService, init_filePolicyService };
