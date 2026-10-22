// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/api/browser/mainThreadTimeline.ts
import { ExtHostContext, MainContext } from "./module-0922.mjs";
import { Emitter } from "./module-0017.mjs";
import { revive } from "./module-0265.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { extHostNamedCustomer } from "./module-0920.mjs";
import { ILogService } from "./module-0095.mjs";
import { ITimelineService } from "./module-1422.mjs";


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
      async provideTimeline(uri4, options3, token) {
        return revive(await proxy.$getTimeline(provider.id, uri4, options3, token));
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
  $emitTimelineChangeEvent(e4) {
    this.logService.trace(`MainThreadTimeline#emitChangeEvent: id=${e4.id}, uri=${e4.uri?.toString(true)}`);
    const emitter = this._providerEmitters.get(e4.id);
    emitter?.fire(e4);
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
