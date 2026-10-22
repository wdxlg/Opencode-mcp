// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/debug/common/nullDebugService.ts
import { Event2 } from "./module-0017.mjs";
import { Disposable } from "./module-0012.mjs";


// src/vs/workbench/contrib/debug/common/nullDebugService.ts
var nullViewModel = {
  getId() {
    return "root";
  },
  focusedSession: void 0,
  focusedThread: void 0,
  focusedStackFrame: void 0,
  setVisualizedExpression() {
  },
  getVisualizedExpression() {
    return void 0;
  },
  getSelectedExpression() {
    return void 0;
  },
  setSelectedExpression() {
  },
  updateViews() {
  },
  isMultiSessionView() {
    return false;
  },
  onDidFocusSession: Event2.None,
  onDidFocusThread: Event2.None,
  onDidFocusStackFrame: Event2.None,
  onDidSelectExpression: Event2.None,
  onDidEvaluateLazyExpression: Event2.None,
  onDidChangeVisualization: Event2.None,
  onWillUpdateViews: Event2.None,
  evaluateLazyExpression(_expression) {
  }
};

var nullDebugModel = {
  getId() {
    return "root";
  },
  getSession() {
    return void 0;
  },
  getSessions() {
    return [];
  },
  getBreakpoints() {
    return [];
  },
  areBreakpointsActivated() {
    return false;
  },
  getFunctionBreakpoints() {
    return [];
  },
  getDataBreakpoints() {
    return [];
  },
  getExceptionBreakpoints() {
    return [];
  },
  getExceptionBreakpointsForSession() {
    return [];
  },
  getInstructionBreakpoints() {
    return [];
  },
  getWatchExpressions() {
    return [];
  },
  registerBreakpointModes() {
  },
  getBreakpointModes() {
    return [];
  },
  onDidChangeBreakpoints: Event2.None,
  onDidChangeCallStack: Event2.None,
  onDidChangeWatchExpressions: Event2.None,
  onDidChangeWatchExpressionValue: Event2.None,
  async fetchCallstack() {
  }
};

var nullConfigurationManager = {
  selectedConfiguration: {
    launch: void 0,
    getConfig: () => Promise.resolve(void 0),
    name: void 0,
    type: void 0
  },
  async selectConfiguration() {
  },
  getLaunches() {
    return [];
  },
  getLaunch() {
    return void 0;
  },
  getAllConfigurations() {
    return [];
  },
  removeRecentDynamicConfigurations() {
  },
  getRecentDynamicConfigurations() {
    return [];
  },
  onDidSelectConfiguration: Event2.None,
  onDidChangeConfigurationProviders: Event2.None,
  hasDebugConfigurationProvider() {
    return false;
  },
  async getDynamicProviders() {
    return [];
  },
  async getDynamicConfigurationsByType() {
    return [];
  },
  registerDebugConfigurationProvider() {
    return Disposable.None;
  },
  unregisterDebugConfigurationProvider() {
  },
  async resolveConfigurationByProviders() {
    return void 0;
  }
};

var nullAdapterManager = {
  onDidRegisterDebugger: Event2.None,
  hasEnabledDebuggers() {
    return false;
  },
  async getDebugAdapterDescriptor() {
    return void 0;
  },
  getDebuggerLabel() {
    return void 0;
  },
  someDebuggerInterestedInLanguage() {
    return false;
  },
  getDebugger() {
    return void 0;
  },
  async activateDebuggers() {
  },
  registerDebugAdapterFactory() {
    return Disposable.None;
  },
  createDebugAdapter() {
    return void 0;
  },
  registerDebugAdapterDescriptorFactory() {
    return Disposable.None;
  },
  unregisterDebugAdapterDescriptorFactory() {
  },
  async substituteVariables(_debugType, _folder, config) {
    return config;
  },
  async runInTerminal() {
    return void 0;
  },
  getEnabledDebugger() {
    return void 0;
  },
  async guessDebugger() {
    return void 0;
  },
  get onDidDebuggersExtPointRead() {
    return Event2.None;
  }
};

var NullDebugService = class {
  constructor() {
    this.state = 0 /* Inactive */;
    this.initializingOptions = void 0;
    this.onDidChangeState = Event2.None;
    this.onWillNewSession = Event2.None;
    this.onDidNewSession = Event2.None;
    this.onDidEndSession = Event2.None;
  }
  getConfigurationManager() {
    return nullConfigurationManager;
  }
  getAdapterManager() {
    return nullAdapterManager;
  }
  getModel() {
    return nullDebugModel;
  }
  getViewModel() {
    return nullViewModel;
  }
  async focusStackFrame(_focusedStackFrame, _thread, _session, _options) {
  }
  canSetBreakpointsIn() {
    return false;
  }
  async addBreakpoints() {
    return [];
  }
  async updateBreakpoints() {
  }
  async enableOrDisableBreakpoints(_enable, _breakpoint) {
  }
  async setBreakpointsActivated(_activated) {
  }
  async removeBreakpoints(_id) {
  }
  addFunctionBreakpoint(_opts, _id) {
  }
  async updateFunctionBreakpoint(_id, _update) {
  }
  async removeFunctionBreakpoints(_id) {
  }
  async addDataBreakpoint(_opts) {
  }
  async updateDataBreakpoint(_id, _update) {
  }
  async removeDataBreakpoints(_id) {
  }
  async addInstructionBreakpoint(_opts) {
  }
  async removeInstructionBreakpoints(_instructionReference, _offset, _address) {
  }
  async setExceptionBreakpointCondition(_breakpoint, _condition) {
  }
  setExceptionBreakpointsForSession(_session, _filters) {
  }
  async sendAllBreakpoints(_session) {
  }
  async sendBreakpoints(_modelUri, _sourceModified, _session) {
  }
  addWatchExpression(_name) {
  }
  renameWatchExpression(_id, _newName) {
  }
  moveWatchExpression(_id, _position) {
  }
  removeWatchExpressions(_id) {
  }
  async startDebugging(_launch, _configOrName, _options, _saveBeforeStart) {
    return false;
  }
  async restartSession(_session, _restartData) {
  }
  async stopSession(_session, _disconnect, _suspend) {
  }
  sourceIsNotAvailable() {
  }
  async runTo() {
  }
};

var NullDebugVisualizerService = class {
  async getApplicableFor() {
    return { object: [], dispose() {
    } };
  }
  register() {
    return Disposable.None;
  }
  registerTree() {
    return Disposable.None;
  }
  async getVisualizedNodeFor() {
    return void 0;
  }
  async getVisualizedChildren() {
    return [];
  }
  async editTreeItem() {
  }
};
export { nullViewModel, nullDebugModel, nullConfigurationManager, nullAdapterManager, NullDebugService, NullDebugVisualizerService };
