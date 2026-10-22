// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/node/agentHostCompletions.ts
import { createDecorator } from "./module-0044.mjs";
import { Disposable, toDisposable } from "./module-0010.mjs";
import { CancellationToken } from "./module-0017.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ILogService } from "./module-0084.mjs";


// src/vs/platform/agentHost/node/agentHostCompletions.ts
var IAgentHostCompletions = createDecorator("agentHostCompletions");

var AgentHostCompletions = class extends Disposable {
  constructor(_logService) {
    super();
    this._logService = _logService;
    this._providers = /* @__PURE__ */ new Set();
  }
  get triggerCharacters() {
    const seen = /* @__PURE__ */ new Set();
    for (const provider of this._providers) {
      if (provider.triggerCharacters) {
        for (const ch of provider.triggerCharacters) {
          seen.add(ch);
        }
      }
    }
    return [...seen];
  }
  registerProvider(provider) {
    this._providers.add(provider);
    return toDisposable(() => this._providers.delete(provider));
  }
  async completions(params, token = CancellationToken.None) {
    const matching = [...this._providers].filter((p) => p.kinds.has(params.kind));
    if (matching.length === 0) {
      return { items: [] };
    }
    const settled = await Promise.allSettled(
      matching.map((p) => p.provideCompletionItems(params, token))
    );
    const items = [];
    for (let i = 0; i < settled.length; i++) {
      const result = settled[i];
      if (result.status === "fulfilled") {
        items.push(...result.value);
      } else {
        this._logService.error(result.reason, `[AgentHostCompletions] Provider failed for kind=${params.kind}`);
      }
    }
    return { items };
  }
};

AgentHostCompletions = __decorateClass([
  __decorateParam(0, ILogService)
], AgentHostCompletions);
export { IAgentHostCompletions, AgentHostCompletions };
