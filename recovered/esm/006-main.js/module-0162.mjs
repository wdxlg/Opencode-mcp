// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/main.js
// Original module marker: src/vs/platform/browserView/electron-main/browserViewGroupMainService.ts
import { __decorateClass, __decorateParam, __esm } from "./module-0000.mjs";
import { Disposable, DisposableMap, init_lifecycle } from "./module-0018.mjs";
import { Event, init_event } from "./module-0021.mjs";
import { IInstantiationService, createDecorator, init_instantiation } from "./module-0039.mjs";
import { generateUuid, init_uuid } from "./module-0055.mjs";
import { BrowserViewGroup, init_browserViewGroup2 } from "./module-0161.mjs";


// src/vs/platform/browserView/electron-main/browserViewGroupMainService.ts
var IBrowserViewGroupMainService, BrowserViewGroupMainService;

var init_browserViewGroupMainService = __esm({
  "src/vs/platform/browserView/electron-main/browserViewGroupMainService.ts"() {
    init_lifecycle();
    init_event();
    init_instantiation();
    init_uuid();
    init_browserViewGroup2();
    IBrowserViewGroupMainService = createDecorator("browserViewGroupMainService");
    BrowserViewGroupMainService = class extends Disposable {
      constructor(instantiationService) {
        super();
        this.instantiationService = instantiationService;
        this.groups = this._register(new DisposableMap());
      }
      async createGroup(filter, targetContext) {
        const id2 = generateUuid();
        const group = this.instantiationService.createInstance(BrowserViewGroup, id2, filter, targetContext);
        this.groups.set(id2, group);
        Event.once(group.onDidDestroy)(() => {
          this.groups.deleteAndLeak(id2);
        });
        try {
          await group.activate();
          return id2;
        } catch (error) {
          this.groups.deleteAndDispose(id2);
          throw error;
        }
      }
      async destroyGroup(groupId) {
        this.groups.deleteAndDispose(groupId);
      }
      async sendCDPMessage(groupId, message) {
        return this._getGroup(groupId).debugger.sendMessage(message);
      }
      onDynamicDidDestroy(groupId) {
        return this._getGroup(groupId).onDidDestroy;
      }
      onDynamicCDPMessage(groupId) {
        return this._getGroup(groupId).debugger.onMessage;
      }
      /**
       * Get a group or throw if not found.
       */
      _getGroup(groupId) {
        const group = this.groups.get(groupId);
        if (!group) {
          throw new Error(`Browser view group ${groupId} not found`);
        }
        return group;
      }
    };
    BrowserViewGroupMainService = __decorateClass([
      __decorateParam(0, IInstantiationService)
    ], BrowserViewGroupMainService);
  }
});
export { IBrowserViewGroupMainService, BrowserViewGroupMainService, init_browserViewGroupMainService };
