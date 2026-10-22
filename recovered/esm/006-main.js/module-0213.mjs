// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/main.js
// Original module marker: src/vs/platform/log/electron-main/loggerService.ts
import { __esm } from "./module-0000.mjs";
import { ResourceMap, init_map } from "./module-0014.mjs";
import { Event, init_event } from "./module-0021.mjs";
import { init_instantiation, refineServiceDecorator } from "./module-0039.mjs";
import { ILoggerService, init_log, isLogLevel } from "./module-0075.mjs";
import { LoggerService, init_loggerService } from "./module-0212.mjs";


// src/vs/platform/log/electron-main/loggerService.ts
var ILoggerMainService, LoggerMainService;

var init_loggerService2 = __esm({
  "src/vs/platform/log/electron-main/loggerService.ts"() {
    init_map();
    init_event();
    init_instantiation();
    init_log();
    init_loggerService();
    ILoggerMainService = refineServiceDecorator(ILoggerService);
    LoggerMainService = class extends LoggerService {
      constructor() {
        super(...arguments);
        this.loggerResourcesByWindow = new ResourceMap();
      }
      createLogger(idOrResource, options, windowId) {
        if (windowId !== void 0) {
          this.loggerResourcesByWindow.set(this.toResource(idOrResource), windowId);
        }
        try {
          return super.createLogger(idOrResource, options);
        } catch (error) {
          this.loggerResourcesByWindow.delete(this.toResource(idOrResource));
          throw error;
        }
      }
      registerLogger(resource, windowId) {
        if (windowId !== void 0) {
          this.loggerResourcesByWindow.set(resource.resource, windowId);
        }
        super.registerLogger(resource);
      }
      deregisterLogger(resource) {
        this.loggerResourcesByWindow.delete(resource);
        super.deregisterLogger(resource);
      }
      getGlobalLoggers() {
        const resources = [];
        for (const resource of super.getRegisteredLoggers()) {
          if (!this.loggerResourcesByWindow.has(resource.resource)) {
            resources.push(resource);
          }
        }
        return resources;
      }
      getOnDidChangeLogLevelEvent(windowId) {
        return Event.filter(this.onDidChangeLogLevel, (arg) => isLogLevel(arg) || this.isInterestedLoggerResource(arg[0], windowId));
      }
      getOnDidChangeVisibilityEvent(windowId) {
        return Event.filter(this.onDidChangeVisibility, ([resource]) => this.isInterestedLoggerResource(resource, windowId));
      }
      getOnDidChangeLoggersEvent(windowId) {
        return Event.filter(
          Event.map(this.onDidChangeLoggers, (e) => {
            const r = {
              added: [...e.added].filter((loggerResource) => this.isInterestedLoggerResource(loggerResource.resource, windowId)),
              removed: [...e.removed].filter((loggerResource) => this.isInterestedLoggerResource(loggerResource.resource, windowId))
            };
            return r;
          }),
          (e) => e.added.length > 0 || e.removed.length > 0
        );
      }
      deregisterLoggers(windowId) {
        for (const [resource, resourceWindow] of this.loggerResourcesByWindow) {
          if (resourceWindow === windowId) {
            this.deregisterLogger(resource);
          }
        }
      }
      isInterestedLoggerResource(resource, windowId) {
        const loggerWindowId = this.loggerResourcesByWindow.get(resource);
        return loggerWindowId === void 0 || loggerWindowId === windowId;
      }
      dispose() {
        super.dispose();
        this.loggerResourcesByWindow.clear();
      }
    };
  }
});
export { ILoggerMainService, LoggerMainService, init_loggerService2 };
