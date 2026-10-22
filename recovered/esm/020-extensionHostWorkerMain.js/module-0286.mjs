// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/worker/extensionHostWorkerMain.js
// Original module marker: src/vs/workbench/services/output/common/output.ts
import { RawContextKey } from "./module-0044.mjs";
import { createDecorator } from "./module-0038.mjs";
import { Disposable } from "./module-0011.mjs";
import { Emitter } from "./module-0019.mjs";
import { Registry } from "./module-0090.mjs";


// src/vs/workbench/services/output/common/output.ts
var CONTEXT_IN_OUTPUT = new RawContextKey("inOutput", false);

var CONTEXT_ACTIVE_FILE_OUTPUT = new RawContextKey("activeLogOutput", false);

var CONTEXT_ACTIVE_LOG_FILE_OUTPUT = new RawContextKey("activeLogOutput.isLog", false);

var CONTEXT_ACTIVE_OUTPUT_LEVEL_SETTABLE = new RawContextKey("activeLogOutput.levelSettable", false);

var CONTEXT_ACTIVE_OUTPUT_LEVEL = new RawContextKey("activeLogOutput.level", "");

var CONTEXT_ACTIVE_OUTPUT_LEVEL_IS_DEFAULT = new RawContextKey("activeLogOutput.levelIsDefault", false);

var CONTEXT_OUTPUT_SCROLL_LOCK = new RawContextKey(`outputView.scrollLock`, false);

var ACTIVE_OUTPUT_CHANNEL_CONTEXT = new RawContextKey("activeOutputChannel", "");

var SHOW_TRACE_FILTER_CONTEXT = new RawContextKey("output.filter.trace", true);

var SHOW_DEBUG_FILTER_CONTEXT = new RawContextKey("output.filter.debug", true);

var SHOW_INFO_FILTER_CONTEXT = new RawContextKey("output.filter.info", true);

var SHOW_WARNING_FILTER_CONTEXT = new RawContextKey("output.filter.warning", true);

var SHOW_ERROR_FILTER_CONTEXT = new RawContextKey("output.filter.error", true);

var OUTPUT_FILTER_FOCUS_CONTEXT = new RawContextKey("outputFilterFocus", false);

var HIDE_CATEGORY_FILTER_CONTEXT = new RawContextKey("output.filter.categories", "");

var IOutputService = createDecorator("outputService");

var Extensions4 = {
  OutputChannels: "workbench.contributions.outputChannels"
};

function isMultiSourceOutputChannelDescriptor(descriptor) {
  return Array.isArray(descriptor.source);
}

var OutputChannelRegistry = class extends Disposable {
  constructor() {
    super(...arguments);
    this.channels = /* @__PURE__ */ new Map();
    this._onDidRegisterChannel = this._register(new Emitter());
    this.onDidRegisterChannel = this._onDidRegisterChannel.event;
    this._onDidRemoveChannel = this._register(new Emitter());
    this.onDidRemoveChannel = this._onDidRemoveChannel.event;
    this._onDidUpdateChannelFiles = this._register(new Emitter());
    this.onDidUpdateChannelSources = this._onDidUpdateChannelFiles.event;
  }
  registerChannel(descriptor) {
    if (!this.channels.has(descriptor.id)) {
      this.channels.set(descriptor.id, descriptor);
      this._onDidRegisterChannel.fire(descriptor.id);
    }
  }
  getChannels() {
    const result = [];
    this.channels.forEach((value) => result.push(value));
    return result;
  }
  getChannel(id2) {
    return this.channels.get(id2);
  }
  updateChannelSources(id2, sources) {
    const channel = this.channels.get(id2);
    if (channel && isMultiSourceOutputChannelDescriptor(channel)) {
      channel.source = sources;
      this._onDidUpdateChannelFiles.fire(channel);
    }
  }
  removeChannel(id2) {
    const channel = this.channels.get(id2);
    if (channel) {
      this.channels.delete(id2);
      this._onDidRemoveChannel.fire(channel);
    }
  }
};

Registry.add(Extensions4.OutputChannels, new OutputChannelRegistry());
export { isMultiSourceOutputChannelDescriptor, CONTEXT_IN_OUTPUT, CONTEXT_ACTIVE_FILE_OUTPUT, CONTEXT_ACTIVE_LOG_FILE_OUTPUT, CONTEXT_ACTIVE_OUTPUT_LEVEL_SETTABLE, CONTEXT_ACTIVE_OUTPUT_LEVEL, CONTEXT_ACTIVE_OUTPUT_LEVEL_IS_DEFAULT, CONTEXT_OUTPUT_SCROLL_LOCK, ACTIVE_OUTPUT_CHANNEL_CONTEXT, SHOW_TRACE_FILTER_CONTEXT, SHOW_DEBUG_FILTER_CONTEXT, SHOW_INFO_FILTER_CONTEXT, SHOW_WARNING_FILTER_CONTEXT, SHOW_ERROR_FILTER_CONTEXT, OUTPUT_FILTER_FOCUS_CONTEXT, HIDE_CATEGORY_FILTER_CONTEXT, IOutputService, Extensions4, OutputChannelRegistry };
