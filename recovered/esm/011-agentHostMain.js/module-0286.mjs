// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/node/copilot/copilotSlashCommandProvider.ts
import { raceTimeout } from "./module-0027.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ILogService } from "./module-0084.mjs";


// src/vs/platform/agentHost/node/copilot/copilotSlashCommandProvider.ts
var CopilotSlashCommandProvider = class {
  constructor(listCommands, _logService) {
    this.listCommands = listCommands;
    this._logService = _logService;
  }
  async getSlashCommands(options) {
    try {
      const maxWaitMs = options?.maxWaitMs;
      const catalog = await this._getRuntimeSlashCommandCatalog(maxWaitMs === void 0 ? void 0 : Math.max(0, maxWaitMs));
      return catalog.commands;
    } catch (err) {
      this._logService.warn(`[Copilot] rpc.commands.list failed`, err);
      return [];
    }
  }
  async resolveSlashCommand(command, maxWaitMs = void 0) {
    const key = this._normalizeSlashCommandKey(command);
    if (!key) {
      return void 0;
    }
    const catalog = await this._getRuntimeSlashCommandCatalog(maxWaitMs);
    return catalog.byName.get(key) ?? catalog.byAlias.get(key);
  }
  clearCache() {
    if (this._runtimeSlashCommandCache) {
      this._runtimeSlashCommandCache = void 0;
    }
  }
  async _getRuntimeSlashCommandCatalog(maxWaitMs = void 0) {
    const cache3 = this._runtimeSlashCommandCache ??= {};
    if (cache3.value) {
      return cache3.value;
    }
    const inFlight = this._refreshRuntimeSlashCommandCatalog(cache3);
    if (maxWaitMs === void 0) {
      return inFlight;
    }
    const settled = await raceTimeout(inFlight, maxWaitMs);
    if (settled) {
      return settled;
    }
    if (cache3.value) {
      return cache3.value;
    }
    return {
      commands: [],
      byName: /* @__PURE__ */ new Map(),
      byAlias: /* @__PURE__ */ new Map()
    };
  }
  async _refreshRuntimeSlashCommandCatalog(cache3) {
    if (cache3.inFlight) {
      return cache3.inFlight;
    }
    const inFlight = this.listCommands().then((result) => this._toRuntimeSlashCommandCatalog(result));
    cache3.inFlight = inFlight;
    inFlight.then((catalog) => {
      if (this._runtimeSlashCommandCache === cache3) {
        cache3.value = catalog;
        cache3.inFlight = void 0;
      }
    }, () => {
      if (this._runtimeSlashCommandCache === cache3) {
        cache3.inFlight = void 0;
        if (!cache3.value) {
          this._runtimeSlashCommandCache = void 0;
        }
      }
    });
    return inFlight;
  }
  _toRuntimeSlashCommandCatalog(commands) {
    const byName = /* @__PURE__ */ new Map();
    const byAlias = /* @__PURE__ */ new Map();
    const deduped = [];
    for (const command of commands) {
      const nameKey = this._normalizeSlashCommandKey(command.name);
      if (!nameKey) {
        continue;
      }
      let canonical = byName.get(nameKey);
      if (!canonical) {
        canonical = command;
        byName.set(nameKey, canonical);
        deduped.push(canonical);
      }
      for (const alias of command.aliases ?? []) {
        const aliasKey = this._normalizeSlashCommandKey(alias);
        if (!aliasKey || byAlias.has(aliasKey)) {
          continue;
        }
        byAlias.set(aliasKey, canonical);
      }
    }
    return { commands: deduped, byName, byAlias };
  }
  _normalizeSlashCommandKey(command) {
    const trimmed = command.trim();
    if (!trimmed) {
      return void 0;
    }
    const slashStripped = trimmed.charCodeAt(0) === 47 ? trimmed.slice(1) : trimmed;
    return slashStripped.toLowerCase();
  }
};

CopilotSlashCommandProvider = __decorateClass([
  __decorateParam(1, ILogService)
], CopilotSlashCommandProvider);
export { CopilotSlashCommandProvider };
