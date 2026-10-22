// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/services/aiRelatedInformation/common/aiRelatedInformationService.ts
import { StopWatch } from "./module-0016.mjs";
import { createCancelablePromise, raceTimeout } from "./module-0036.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ILogService } from "./module-0095.mjs";
import { registerSingleton } from "./module-0135.mjs";
import { IAiRelatedInformationService } from "./module-1440.mjs";


// src/vs/workbench/services/aiRelatedInformation/common/aiRelatedInformationService.ts
var AiRelatedInformationService = class {
  constructor(logService) {
    this.logService = logService;
    // 10 seconds
    this._providers = /* @__PURE__ */ new Map();
  }
  static {
    this.DEFAULT_TIMEOUT = 1e3 * 10;
  }
  isEnabled() {
    return this._providers.size > 0;
  }
  registerAiRelatedInformationProvider(type, provider) {
    const providers2 = this._providers.get(type) ?? [];
    providers2.push(provider);
    this._providers.set(type, providers2);
    return {
      dispose: () => {
        const providers3 = this._providers.get(type) ?? [];
        const index2 = providers3.indexOf(provider);
        if (index2 !== -1) {
          providers3.splice(index2, 1);
        }
        if (providers3.length === 0) {
          this._providers.delete(type);
        }
      }
    };
  }
  async getRelatedInformation(query, types, token) {
    if (this._providers.size === 0) {
      throw new Error("No related information providers registered");
    }
    const providers2 = [];
    for (const type of types) {
      const typeProviders = this._providers.get(type);
      if (typeProviders) {
        providers2.push(...typeProviders);
      }
    }
    if (providers2.length === 0) {
      throw new Error("No related information providers registered for the given types");
    }
    const stopwatch = StopWatch.create();
    const cancellablePromises = providers2.map((provider) => {
      return createCancelablePromise(async (t2) => {
        try {
          const result = await provider.provideAiRelatedInformation(query, t2);
          return result.filter((r2) => types.includes(r2.type));
        } catch (e4) {
        }
        return [];
      });
    });
    try {
      const results = await raceTimeout(
        Promise.allSettled(cancellablePromises),
        AiRelatedInformationService.DEFAULT_TIMEOUT,
        () => {
          cancellablePromises.forEach((p) => p.cancel());
          this.logService.warn("[AiRelatedInformationService]: Related information provider timed out");
        }
      );
      if (!results) {
        return [];
      }
      const result = results.filter((r2) => r2.status === "fulfilled").flatMap((r2) => r2.value);
      return result;
    } finally {
      stopwatch.stop();
      this.logService.trace(`[AiRelatedInformationService]: getRelatedInformation took ${stopwatch.elapsed()}ms`);
    }
  }
};

AiRelatedInformationService = __decorateClass([
  __decorateParam(0, ILogService)
], AiRelatedInformationService);

registerSingleton(IAiRelatedInformationService, AiRelatedInformationService, 1 /* Delayed */);
export { AiRelatedInformationService };
