// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/debug/common/debugStorage.ts
import { Disposable } from "./module-0012.mjs";
import { observableValue } from "./module-0048.mjs";
import { URI } from "./module-0032.mjs";
import { Breakpoint2, DataBreakpoint2, ExceptionBreakpoint, Expression, FunctionBreakpoint2 } from "./module-1064.mjs";
import { mapValues } from "./module-0098.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IStorageService } from "./module-0512.mjs";
import { ITextFileService } from "./module-1063.mjs";
import { IUriIdentityService } from "./module-0510.mjs";
import { ILogService } from "./module-0095.mjs";


// src/vs/workbench/contrib/debug/common/debugStorage.ts
var DEBUG_BREAKPOINTS_KEY = "debug.breakpoint";

var DEBUG_FUNCTION_BREAKPOINTS_KEY = "debug.functionbreakpoint";

var DEBUG_DATA_BREAKPOINTS_KEY = "debug.databreakpoint";

var DEBUG_EXCEPTION_BREAKPOINTS_KEY = "debug.exceptionbreakpoint";

var DEBUG_WATCH_EXPRESSIONS_KEY = "debug.watchexpressions";

var DEBUG_CHOSEN_ENVIRONMENTS_KEY = "debug.chosenenvironment";

var DEBUG_UX_STATE_KEY = "debug.uxstate";

var DebugStorage = class extends Disposable {
  constructor(storageService, textFileService, uriIdentityService, logService) {
    super();
    this.storageService = storageService;
    this.textFileService = textFileService;
    this.uriIdentityService = uriIdentityService;
    this.logService = logService;
    this.breakpoints = observableValue(this, this.loadBreakpoints());
    this.functionBreakpoints = observableValue(this, this.loadFunctionBreakpoints());
    this.exceptionBreakpoints = observableValue(this, this.loadExceptionBreakpoints());
    this.dataBreakpoints = observableValue(this, this.loadDataBreakpoints());
    this.watchExpressions = observableValue(this, this.loadWatchExpressions());
    this._register(storageService.onDidChangeValue(1 /* WORKSPACE */, void 0, this._store)((e) => {
      if (e.external) {
        switch (e.key) {
          case DEBUG_BREAKPOINTS_KEY:
            return this.breakpoints.set(this.loadBreakpoints(), void 0);
          case DEBUG_FUNCTION_BREAKPOINTS_KEY:
            return this.functionBreakpoints.set(this.loadFunctionBreakpoints(), void 0);
          case DEBUG_EXCEPTION_BREAKPOINTS_KEY:
            return this.exceptionBreakpoints.set(this.loadExceptionBreakpoints(), void 0);
          case DEBUG_DATA_BREAKPOINTS_KEY:
            return this.dataBreakpoints.set(this.loadDataBreakpoints(), void 0);
          case DEBUG_WATCH_EXPRESSIONS_KEY:
            return this.watchExpressions.set(this.loadWatchExpressions(), void 0);
        }
      }
    }));
  }
  loadDebugUxState() {
    return this.storageService.get(DEBUG_UX_STATE_KEY, 1 /* WORKSPACE */, "default");
  }
  storeDebugUxState(value2) {
    this.storageService.store(DEBUG_UX_STATE_KEY, value2, 1 /* WORKSPACE */, 1 /* MACHINE */);
  }
  loadBreakpoints() {
    let result;
    try {
      result = JSON.parse(this.storageService.get(DEBUG_BREAKPOINTS_KEY, 1 /* WORKSPACE */, "[]")).map((breakpoint2) => {
        breakpoint2.uri = URI.revive(breakpoint2.uri);
        return new Breakpoint2(breakpoint2, this.textFileService, this.uriIdentityService, this.logService, breakpoint2.id);
      });
    } catch (e) {
      this.logService.error("Failed to load breakpoints from storage", e);
    }
    return result || [];
  }
  loadFunctionBreakpoints() {
    let result;
    try {
      result = JSON.parse(this.storageService.get(DEBUG_FUNCTION_BREAKPOINTS_KEY, 1 /* WORKSPACE */, "[]")).map((fb) => {
        return new FunctionBreakpoint2(fb, fb.id);
      });
    } catch (e) {
      this.logService.error("Failed to load function breakpoints from storage", e);
    }
    return result || [];
  }
  loadExceptionBreakpoints() {
    let result;
    try {
      result = JSON.parse(this.storageService.get(DEBUG_EXCEPTION_BREAKPOINTS_KEY, 1 /* WORKSPACE */, "[]")).map((exBreakpoint) => {
        return new ExceptionBreakpoint(exBreakpoint, exBreakpoint.id);
      });
    } catch (e) {
      this.logService.error("Failed to load exception breakpoints from storage", e);
    }
    return result || [];
  }
  loadDataBreakpoints() {
    let result;
    try {
      result = JSON.parse(this.storageService.get(DEBUG_DATA_BREAKPOINTS_KEY, 1 /* WORKSPACE */, "[]")).map((dbp) => {
        return new DataBreakpoint2(dbp, dbp.id);
      });
    } catch (e) {
      this.logService.error("Failed to load data breakpoints from storage", e);
    }
    return result || [];
  }
  loadWatchExpressions() {
    let result;
    try {
      result = JSON.parse(this.storageService.get(DEBUG_WATCH_EXPRESSIONS_KEY, 1 /* WORKSPACE */, "[]")).map((watchStoredData) => {
        return new Expression(watchStoredData.name, watchStoredData.id);
      });
    } catch (e) {
      this.logService.error("Failed to load watch expressions from storage", e);
    }
    return result || [];
  }
  loadChosenEnvironments() {
    const obj = JSON.parse(this.storageService.get(DEBUG_CHOSEN_ENVIRONMENTS_KEY, 1 /* WORKSPACE */, "{}"));
    return mapValues(obj, (value2) => typeof value2 === "string" ? { type: value2 } : value2);
  }
  storeChosenEnvironments(environments) {
    this.storageService.store(DEBUG_CHOSEN_ENVIRONMENTS_KEY, JSON.stringify(environments), 1 /* WORKSPACE */, 1 /* MACHINE */);
  }
  storeWatchExpressions(watchExpressions) {
    if (watchExpressions.length) {
      this.storageService.store(DEBUG_WATCH_EXPRESSIONS_KEY, JSON.stringify(watchExpressions.map((we) => ({ name: we.name, id: we.getId() }))), 1 /* WORKSPACE */, 1 /* MACHINE */);
    } else {
      this.storageService.remove(DEBUG_WATCH_EXPRESSIONS_KEY, 1 /* WORKSPACE */);
    }
  }
  storeBreakpoints(debugModel) {
    const breakpoints = debugModel.getBreakpoints();
    if (breakpoints.length) {
      this.storageService.store(DEBUG_BREAKPOINTS_KEY, JSON.stringify(breakpoints), 1 /* WORKSPACE */, 1 /* MACHINE */);
    } else {
      this.storageService.remove(DEBUG_BREAKPOINTS_KEY, 1 /* WORKSPACE */);
    }
    const functionBreakpoints = debugModel.getFunctionBreakpoints();
    if (functionBreakpoints.length) {
      this.storageService.store(DEBUG_FUNCTION_BREAKPOINTS_KEY, JSON.stringify(functionBreakpoints), 1 /* WORKSPACE */, 1 /* MACHINE */);
    } else {
      this.storageService.remove(DEBUG_FUNCTION_BREAKPOINTS_KEY, 1 /* WORKSPACE */);
    }
    const dataBreakpoints = debugModel.getDataBreakpoints().filter((dbp) => dbp.canPersist);
    if (dataBreakpoints.length) {
      this.storageService.store(DEBUG_DATA_BREAKPOINTS_KEY, JSON.stringify(dataBreakpoints), 1 /* WORKSPACE */, 1 /* MACHINE */);
    } else {
      this.storageService.remove(DEBUG_DATA_BREAKPOINTS_KEY, 1 /* WORKSPACE */);
    }
    const exceptionBreakpoints = debugModel.getExceptionBreakpoints();
    if (exceptionBreakpoints.length) {
      this.storageService.store(DEBUG_EXCEPTION_BREAKPOINTS_KEY, JSON.stringify(exceptionBreakpoints), 1 /* WORKSPACE */, 1 /* MACHINE */);
    } else {
      this.storageService.remove(DEBUG_EXCEPTION_BREAKPOINTS_KEY, 1 /* WORKSPACE */);
    }
  }
};

DebugStorage = __decorateClass([
  __decorateParam(0, IStorageService),
  __decorateParam(1, ITextFileService),
  __decorateParam(2, IUriIdentityService),
  __decorateParam(3, ILogService)
], DebugStorage);
export { DEBUG_BREAKPOINTS_KEY, DEBUG_FUNCTION_BREAKPOINTS_KEY, DEBUG_DATA_BREAKPOINTS_KEY, DEBUG_EXCEPTION_BREAKPOINTS_KEY, DEBUG_WATCH_EXPRESSIONS_KEY, DEBUG_CHOSEN_ENVIRONMENTS_KEY, DEBUG_UX_STATE_KEY, DebugStorage };
