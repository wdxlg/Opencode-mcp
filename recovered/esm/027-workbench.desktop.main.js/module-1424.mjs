// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/api/browser/mainThreadTimeline.ts
import { ExtHostContext, MainContext } from "./module-0921.mjs";
import { Emitter } from "./module-0017.mjs";
import { revive } from "./module-0265.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { extHostNamedCustomer } from "./module-0919.mjs";
import { ILogService } from "./module-0095.mjs";
import { ITimelineService } from "./module-1423.mjs";


// src/vs/workbench/api/browser/mainThreadTimeline.ts
var MainThreadTimeline = class {
  constructor(context2, logService, _timelineService) {
    this.logService = logService;
    this._timelineService = _timelineService;
    this._providerEmitters = /* @__PURE__ */ new Map();
    this._proxy = context2.getProxy(ExtHostContext.ExtHostTimeline);
  }
  $registerTimelineProvider(provider) {
    this.logService.trace(`MainThreadTimeline#registerTimelineProvider: id=${provider.id}`);
    const proxy = this._proxy;
    const emitters = this._providerEmitters;
    let onDidChange = emitters.get(provider.id);
    if (onDidChange === void 0) {
      onDidChange = new Emitter();
      emitters.set(provider.id, onDidChange);
    }
    this._timelineService.registerTimelineProvider({
      ...provider,
      onDidChange: onDidChange.event,
      async provideTimeline(uri5, options3, token) {
        return revive(await proxy.$getTimeline(provider.id, uri5, options3, token));
      },
      dispose() {
        emitters.delete(provider.id);
        onDidChange?.dispose();
      }
    });
  }
  $unregisterTimelineProvider(id2) {
    this.logService.trace(`MainThreadTimeline#unregisterTimelineProvider: id=${id2}`);
    this._timelineService.unregisterTimelineProvider(id2);
  }
  $emitTimelineChangeEvent(e) {
    this.logService.trace(`MainThreadTimeline#emitChangeEvent: id=${e.id}, uri=${e.uri?.toString(true)}`);
    const emitter = this._providerEmitters.get(e.id);
    emitter?.fire(e);
  }
  dispose() {
  }
};

MainThreadTimeline = __decorateClass([
  extHostNamedCustomer(MainContext.MainThreadTimeline),
  __decorateParam(1, ILogService),
  __decorateParam(2, ITimelineService)
], MainThreadTimeline);
export { MainThreadTimeline };
