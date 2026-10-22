// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/services/aiEmbeddingVector/common/aiEmbeddingVectorService.ts
import { createDecorator } from "./module-0077.mjs";
import { StopWatch } from "./module-0016.mjs";
import { createCancelablePromise, raceCancellablePromises, timeout } from "./module-0036.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ILogService } from "./module-0095.mjs";
import { registerSingleton } from "./module-0135.mjs";


// src/vs/workbench/services/aiEmbeddingVector/common/aiEmbeddingVectorService.ts
var IAiEmbeddingVectorService = createDecorator("IAiEmbeddingVectorService");

var AiEmbeddingVectorService = class {
  constructor(logService) {
    this.logService = logService;
    // 10 seconds
    this._providers = [];
  }
  static {
    this.DEFAULT_TIMEOUT = 1e3 * 10;
  }
  isEnabled() {
    return this._providers.length > 0;
  }
  registerAiEmbeddingVectorProvider(model, provider) {
    this._providers.push(provider);
    return {
      dispose: () => {
        const index2 = this._providers.indexOf(provider);
        if (index2 >= 0) {
          this._providers.splice(index2, 1);
        }
      }
    };
  }
  async getEmbeddingVector(strings, token) {
    if (this._providers.length === 0) {
      throw new Error("No embedding vector providers registered");
    }
    const stopwatch = StopWatch.create();
    const cancellablePromises = [];
    const timer = timeout(AiEmbeddingVectorService.DEFAULT_TIMEOUT);
    const disposable = token.onCancellationRequested(() => {
      disposable.dispose();
      timer.cancel();
    });
    for (const provider of this._providers) {
      cancellablePromises.push(createCancelablePromise(async (t2) => {
        try {
          return await provider.provideAiEmbeddingVector(
            Array.isArray(strings) ? strings : [strings],
            t2
          );
        } catch (e4) {
        }
        await timer;
        throw new Error("Embedding vector provider timed out");
      }));
    }
    cancellablePromises.push(createCancelablePromise(async (t2) => {
      const disposable2 = t2.onCancellationRequested(() => {
        timer.cancel();
        disposable2.dispose();
      });
      await timer;
      throw new Error("Embedding vector provider timed out");
    }));
    try {
      const result = await raceCancellablePromises(cancellablePromises);
      if (result.length === 1) {
        return result[0];
      }
      return result;
    } finally {
      stopwatch.stop();
      this.logService.trace(`[AiEmbeddingVectorService]: getEmbeddingVector took ${stopwatch.elapsed()}ms`);
    }
  }
};

AiEmbeddingVectorService = __decorateClass([
  __decorateParam(0, ILogService)
], AiEmbeddingVectorService);

registerSingleton(IAiEmbeddingVectorService, AiEmbeddingVectorService, 1 /* Delayed */);
export { IAiEmbeddingVectorService, AiEmbeddingVectorService };
