// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/platform/agentHost/common/agentHostClientByokLmChannel.ts
import { DisposableStore } from "./module-0012.mjs";
import { Throttler } from "./module-0036.mjs";
import { Emitter, Event2 } from "./module-0017.mjs";
import { CancellationToken } from "./module-0025.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IAgentHostByokLmHandler } from "./module-2869.mjs";
import { ILogService } from "./module-0095.mjs";


// src/vs/platform/agentHost/common/agentHostClientByokLmChannel.ts
var AGENT_HOST_CLIENT_BYOK_LM_CHANNEL = "agentHostClientByokLm";

var AgentHostClientByokLmChannel = class {
  constructor(_handler, _logService) {
    this._handler = _handler;
    this._logService = _logService;
  }
  listen(_ctx, event) {
    if (event === "models") {
      return this._modelsSnapshotEvent();
    }
    throw new Error(`No event '${event}' on AgentHostClientByokLmChannel`);
  }
  /**
   * A snapshot stream of the renderer's BYOK models: emits the current models
   * when a subscriber attaches, then re-emits whenever the handler reports a
   * change. Enumeration is renderer-local, so the node side only ever receives.
   *
   * A {@link Throttler} serializes overlapping publishes and coalesces bursts,
   * so a slow enumeration can't fire a stale snapshot after a newer one.
   */
  _modelsSnapshotEvent() {
    const store = new DisposableStore();
    const throttler = store.add(new Throttler());
    const emitter = store.add(new Emitter({
      onDidAddFirstListener: () => {
        if (this._handler.onDidChangeModels) {
          store.add(this._handler.onDidChangeModels(() => void publish()));
        }
        void publish();
      },
      onDidRemoveLastListener: () => store.dispose()
    }));
    const publish = () => {
      if (store.isDisposed) {
        return;
      }
      throttler.queue(async () => {
        try {
          const models = await this._handler.listModels(CancellationToken.None);
          if (!store.isDisposed) {
            emitter.fire(models);
          }
        } catch (err) {
          this._logService.warn("AgentHostClientByokLmChannel: failed to enumerate BYOK models from the renderer", err);
        }
      });
    };
    return emitter.event;
  }
  async call(_ctx, command4, arg) {
    switch (command4) {
      case "chat": {
        const result = await this._handler.chat(arg, CancellationToken.None);
        return result;
      }
    }
    throw new Error(`Unknown command '${command4}' on AgentHostClientByokLmChannel`);
  }
};

AgentHostClientByokLmChannel = __decorateClass([
  __decorateParam(0, IAgentHostByokLmHandler),
  __decorateParam(1, ILogService)
], AgentHostClientByokLmChannel);

var NullAgentHostClientByokLmChannel = class {
  listen(_ctx, event) {
    if (event === "models") {
      return Event2.None;
    }
    throw new Error(`No event '${event}' on NullAgentHostClientByokLmChannel`);
  }
  async call(_ctx, command4) {
    throw new Error(`No command '${command4}' on NullAgentHostClientByokLmChannel`);
  }
};
export { AGENT_HOST_CLIENT_BYOK_LM_CHANNEL, AgentHostClientByokLmChannel, NullAgentHostClientByokLmChannel };
