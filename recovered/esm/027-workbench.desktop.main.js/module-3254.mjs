// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/output/browser/outputServices.ts
import { Disposable, DisposableMap } from "./module-0012.mjs";
import { URI } from "./module-0032.mjs";
import { Schemas } from "./module-0033.mjs";
import { ACTIVE_OUTPUT_CHANNEL_CONTEXT, CONTEXT_ACTIVE_FILE_OUTPUT, CONTEXT_ACTIVE_LOG_FILE_OUTPUT, CONTEXT_ACTIVE_OUTPUT_LEVEL, CONTEXT_ACTIVE_OUTPUT_LEVEL_IS_DEFAULT, CONTEXT_ACTIVE_OUTPUT_LEVEL_SETTABLE, Extensions15, HIDE_CATEGORY_FILTER_CONTEXT, LOG_MIME, OUTPUT_MIME, OUTPUT_VIEW_ID, SHOW_DEBUG_FILTER_CONTEXT, SHOW_ERROR_FILTER_CONTEXT, SHOW_INFO_FILTER_CONTEXT, SHOW_TRACE_FILTER_CONTEXT, SHOW_WARNING_FILTER_CONTEXT, isMultiSourceOutputChannelDescriptor, isSingleSourceOutputChannelDescriptor } from "./module-1245.mjs";
import { DelegatedOutputChannelModel, FileOutputChannelModel, MultiFileOutputChannelModel } from "./module-3253.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ILanguageService } from "./module-0133.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { Emitter, Event2 } from "./module-0017.mjs";
import { joinPath } from "./module-0034.mjs";
import { toLocalISOString } from "./module-0120.mjs";
import { OutputLinkProvider } from "./module-3252.mjs";
import { Registry } from "./module-0090.mjs";
import { telemetryLogId } from "./module-0885.mjs";
import { localize } from "./module-0001.mjs";
import { VSBuffer } from "./module-0038.mjs";
import { ILogService, ILoggerService, LogLevelToString } from "./module-0095.mjs";
import { IStorageService } from "./module-0512.mjs";
import { ITextModelService } from "./module-0081.mjs";
import { ILifecycleService } from "./module-0868.mjs";
import { IViewsService } from "./module-1246.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { IDefaultLogLevelsService } from "./module-1810.mjs";
import { IFileDialogService } from "./module-0267.mjs";
import { IFileService } from "./module-0269.mjs";
import { IWorkbenchEnvironmentService } from "./module-0935.mjs";


// src/vs/workbench/contrib/output/browser/outputServices.ts
var OUTPUT_ACTIVE_CHANNEL_KEY = "output.activechannel";

var OutputChannel = class extends Disposable {
  constructor(outputChannelDescriptor, outputLocation, outputDirPromise, languageService, instantiationService) {
    super();
    this.outputChannelDescriptor = outputChannelDescriptor;
    this.outputLocation = outputLocation;
    this.outputDirPromise = outputDirPromise;
    this.languageService = languageService;
    this.instantiationService = instantiationService;
    this.scrollLock = false;
    this.id = outputChannelDescriptor.id;
    this.label = outputChannelDescriptor.label;
    this.uri = URI.from({ scheme: Schemas.outputChannel, path: this.id });
    this.model = this._register(this.createOutputChannelModel(this.uri, outputChannelDescriptor));
  }
  createOutputChannelModel(uri5, outputChannelDescriptor) {
    const language2 = outputChannelDescriptor.languageId ? this.languageService.createById(outputChannelDescriptor.languageId) : this.languageService.createByMimeType(outputChannelDescriptor.log ? LOG_MIME : OUTPUT_MIME);
    if (isMultiSourceOutputChannelDescriptor(outputChannelDescriptor)) {
      return this.instantiationService.createInstance(MultiFileOutputChannelModel, uri5, language2, [...outputChannelDescriptor.source]);
    }
    if (isSingleSourceOutputChannelDescriptor(outputChannelDescriptor)) {
      return this.instantiationService.createInstance(FileOutputChannelModel, uri5, language2, outputChannelDescriptor.source);
    }
    return this.instantiationService.createInstance(DelegatedOutputChannelModel, this.id, uri5, language2, this.outputLocation, this.outputDirPromise);
  }
  getLogEntries() {
    return this.model.getLogEntries();
  }
  append(output) {
    this.model.append(output);
  }
  update(mode, till) {
    this.model.update(mode, till, true);
  }
  clear() {
    this.model.clear();
  }
  replace(value2) {
    this.model.replace(value2);
  }
};

OutputChannel = __decorateClass([
  __decorateParam(3, ILanguageService),
  __decorateParam(4, IInstantiationService)
], OutputChannel);

var OutputViewFilters = class extends Disposable {
  constructor(options3, contextKeyService) {
    super();
    this.contextKeyService = contextKeyService;
    this._onDidChange = this._register(new Emitter());
    this.onDidChange = this._onDidChange.event;
    this._filterText = "";
    this._includePatterns = [];
    this._excludePatterns = [];
    this._trace = SHOW_TRACE_FILTER_CONTEXT.bindTo(this.contextKeyService);
    this._trace.set(options3.trace);
    this._debug = SHOW_DEBUG_FILTER_CONTEXT.bindTo(this.contextKeyService);
    this._debug.set(options3.debug);
    this._info = SHOW_INFO_FILTER_CONTEXT.bindTo(this.contextKeyService);
    this._info.set(options3.info);
    this._warning = SHOW_WARNING_FILTER_CONTEXT.bindTo(this.contextKeyService);
    this._warning.set(options3.warning);
    this._error = SHOW_ERROR_FILTER_CONTEXT.bindTo(this.contextKeyService);
    this._error.set(options3.error);
    this._categories = HIDE_CATEGORY_FILTER_CONTEXT.bindTo(this.contextKeyService);
    this._categories.set(options3.sources);
    this.filterHistory = options3.filterHistory;
  }
  get text() {
    return this._filterText;
  }
  set text(filterText) {
    if (this._filterText !== filterText) {
      this._filterText = filterText;
      const { includePatterns, excludePatterns } = this.parseText(filterText);
      this._includePatterns = includePatterns;
      this._excludePatterns = excludePatterns;
      this._onDidChange.fire();
    }
  }
  parseText(filterText) {
    const includePatterns = [];
    const excludePatterns = [];
    const patterns = this.splitByCommaRespectingQuotes(filterText);
    for (const pattern of patterns) {
      const trimmed = pattern.trim();
      if (trimmed.length === 0) {
        continue;
      }
      if (trimmed.startsWith("!")) {
        const negativePattern = trimmed.substring(1).trim();
        if (negativePattern.length > 0) {
          excludePatterns.push(negativePattern);
        }
      } else {
        includePatterns.push(trimmed);
      }
    }
    return { includePatterns, excludePatterns };
  }
  get includePatterns() {
    return this._includePatterns;
  }
  get excludePatterns() {
    return this._excludePatterns;
  }
  splitByCommaRespectingQuotes(text2) {
    const patterns = [];
    let current = "";
    let inQuotes = false;
    let quoteChar = "";
    for (let i2 = 0; i2 < text2.length; i2++) {
      const char = text2[i2];
      if (!inQuotes && char === '"') {
        inQuotes = true;
        quoteChar = char;
        current += char;
      } else if (inQuotes && char === quoteChar) {
        inQuotes = false;
        current += char;
      } else if (!inQuotes && char === ",") {
        if (current.length > 0) {
          patterns.push(current);
        }
        current = "";
      } else {
        current += char;
      }
    }
    if (current.length > 0) {
      patterns.push(current);
    }
    return patterns;
  }
  get trace() {
    return !!this._trace.get();
  }
  set trace(trace) {
    if (this._trace.get() !== trace) {
      this._trace.set(trace);
      this._onDidChange.fire();
    }
  }
  get debug() {
    return !!this._debug.get();
  }
  set debug(debug) {
    if (this._debug.get() !== debug) {
      this._debug.set(debug);
      this._onDidChange.fire();
    }
  }
  get info() {
    return !!this._info.get();
  }
  set info(info) {
    if (this._info.get() !== info) {
      this._info.set(info);
      this._onDidChange.fire();
    }
  }
  get warning() {
    return !!this._warning.get();
  }
  set warning(warning) {
    if (this._warning.get() !== warning) {
      this._warning.set(warning);
      this._onDidChange.fire();
    }
  }
  get error() {
    return !!this._error.get();
  }
  set error(error) {
    if (this._error.get() !== error) {
      this._error.set(error);
      this._onDidChange.fire();
    }
  }
  get categories() {
    return this._categories.get() || ",";
  }
  set categories(categories) {
    this._categories.set(categories);
    this._onDidChange.fire();
  }
  toggleCategory(category11) {
    const categories = this.categories;
    if (this.hasCategory(category11)) {
      this.categories = categories.replace(`,${category11},`, ",");
    } else {
      this.categories = `${categories}${category11},`;
    }
  }
  hasCategory(category11) {
    if (category11 === ",") {
      return false;
    }
    return this.categories.includes(`,${category11},`);
  }
};

var OutputService = class extends Disposable {
  constructor(storageService, instantiationService, textModelService, logService, loggerService, lifecycleService, viewsService, contextKeyService, defaultLogLevelsService, fileDialogService, fileService, environmentService) {
    super();
    this.storageService = storageService;
    this.instantiationService = instantiationService;
    this.textModelService = textModelService;
    this.logService = logService;
    this.loggerService = loggerService;
    this.lifecycleService = lifecycleService;
    this.viewsService = viewsService;
    this.defaultLogLevelsService = defaultLogLevelsService;
    this.fileDialogService = fileDialogService;
    this.fileService = fileService;
    this.channels = this._register(new DisposableMap());
    this._onActiveOutputChannel = this._register(new Emitter());
    this.onActiveOutputChannel = this._onActiveOutputChannel.event;
    this.outputFolderCreationPromise = null;
    this.activeChannelIdInStorage = this.storageService.get(OUTPUT_ACTIVE_CHANNEL_KEY, 1 /* WORKSPACE */, "");
    this.activeOutputChannelContext = ACTIVE_OUTPUT_CHANNEL_CONTEXT.bindTo(contextKeyService);
    this.activeOutputChannelContext.set(this.activeChannelIdInStorage);
    this._register(this.onActiveOutputChannel((channel) => this.activeOutputChannelContext.set(channel)));
    this.activeFileOutputChannelContext = CONTEXT_ACTIVE_FILE_OUTPUT.bindTo(contextKeyService);
    this.activeLogOutputChannelContext = CONTEXT_ACTIVE_LOG_FILE_OUTPUT.bindTo(contextKeyService);
    this.activeOutputChannelLevelSettableContext = CONTEXT_ACTIVE_OUTPUT_LEVEL_SETTABLE.bindTo(contextKeyService);
    this.activeOutputChannelLevelContext = CONTEXT_ACTIVE_OUTPUT_LEVEL.bindTo(contextKeyService);
    this.activeOutputChannelLevelIsDefaultContext = CONTEXT_ACTIVE_OUTPUT_LEVEL_IS_DEFAULT.bindTo(contextKeyService);
    this.outputLocation = joinPath(environmentService.windowLogsPath, `output_${toLocalISOString(/* @__PURE__ */ new Date()).replace(/-|:|\.\d+Z$/g, "")}`);
    this._register(textModelService.registerTextModelContentProvider(Schemas.outputChannel, this));
    this._register(instantiationService.createInstance(OutputLinkProvider));
    const registry4 = Registry.as(Extensions15.OutputChannels);
    for (const channelIdentifier of registry4.getChannels()) {
      this.onDidRegisterChannel(channelIdentifier.id);
    }
    this._register(registry4.onDidRegisterChannel((id2) => this.onDidRegisterChannel(id2)));
    this._register(registry4.onDidUpdateChannelSources((channel) => this.onDidUpdateChannelSources(channel)));
    this._register(registry4.onDidRemoveChannel((channel) => this.onDidRemoveChannel(channel)));
    if (!this.activeChannel) {
      const channels = this.getChannelDescriptors();
      this.setActiveChannel(channels && channels.length > 0 ? this.getChannel(channels[0].id) : void 0);
    }
    this._register(Event2.filter(this.viewsService.onDidChangeViewVisibility, (e) => e.id === OUTPUT_VIEW_ID && e.visible)(() => {
      if (this.activeChannel) {
        this.viewsService.getActiveViewWithId(OUTPUT_VIEW_ID)?.showChannel(this.activeChannel, true);
      }
    }));
    this._register(this.loggerService.onDidChangeLogLevel(() => {
      this.setLevelContext();
      this.setLevelIsDefaultContext();
    }));
    this._register(this.defaultLogLevelsService.onDidChangeDefaultLogLevels(() => {
      this.setLevelIsDefaultContext();
    }));
    this._register(this.lifecycleService.onDidShutdown(() => this.dispose()));
    this.filters = this._register(new OutputViewFilters({
      filterHistory: [],
      trace: true,
      debug: true,
      info: true,
      warning: true,
      error: true,
      sources: ""
    }, contextKeyService));
  }
  provideTextContent(resource) {
    const channel = this.getChannel(resource.path);
    if (channel) {
      return channel.model.loadModel();
    }
    return null;
  }
  async showChannel(id2, preserveFocus) {
    const channel = this.getChannel(id2);
    if (this.activeChannel?.id !== channel?.id) {
      this.setActiveChannel(channel);
      this._onActiveOutputChannel.fire(id2);
    }
    const outputView = await this.viewsService.openView(OUTPUT_VIEW_ID, !preserveFocus);
    if (outputView && channel) {
      outputView.showChannel(channel, !!preserveFocus);
    }
  }
  getChannel(id2) {
    return this.channels.get(id2);
  }
  getChannelDescriptor(id2) {
    return Registry.as(Extensions15.OutputChannels).getChannel(id2);
  }
  getChannelDescriptors() {
    return Registry.as(Extensions15.OutputChannels).getChannels();
  }
  getActiveChannel() {
    return this.activeChannel;
  }
  canSetLogLevel(channel) {
    return channel.log && channel.id !== telemetryLogId;
  }
  getLogLevel(channel) {
    if (!channel.log) {
      return void 0;
    }
    const sources = isSingleSourceOutputChannelDescriptor(channel) ? [channel.source] : isMultiSourceOutputChannelDescriptor(channel) ? channel.source : [];
    if (sources.length === 0) {
      return void 0;
    }
    const logLevel = this.loggerService.getLogLevel();
    return sources.reduce((prev, curr) => Math.min(prev, this.loggerService.getLogLevel(curr.resource) ?? logLevel), 5 /* Error */);
  }
  setLogLevel(channel, logLevel) {
    if (!channel.log) {
      return;
    }
    const sources = isSingleSourceOutputChannelDescriptor(channel) ? [channel.source] : isMultiSourceOutputChannelDescriptor(channel) ? channel.source : [];
    if (sources.length === 0) {
      return;
    }
    for (const source of sources) {
      this.loggerService.setLogLevel(source.resource, logLevel);
    }
  }
  registerCompoundLogChannel(descriptors) {
    const outputChannelRegistry2 = Registry.as(Extensions15.OutputChannels);
    descriptors.sort((a, b) => a.label.localeCompare(b.label));
    const id2 = descriptors.map((r2) => r2.id.toLowerCase()).join("-");
    if (!outputChannelRegistry2.getChannel(id2)) {
      outputChannelRegistry2.registerChannel({
        id: id2,
        label: descriptors.map((r2) => r2.label).join(", "),
        log: descriptors.some((r2) => r2.log),
        user: true,
        source: descriptors.map((descriptor) => {
          if (isSingleSourceOutputChannelDescriptor(descriptor)) {
            return [{ resource: descriptor.source.resource, name: descriptor.source.name ?? descriptor.label }];
          }
          if (isMultiSourceOutputChannelDescriptor(descriptor)) {
            return descriptor.source;
          }
          const channel = this.getChannel(descriptor.id);
          if (channel) {
            return channel.model.source;
          }
          return [];
        }).flat()
      });
    }
    return id2;
  }
  async saveOutputAs(outputPath, ...channels) {
    let channel;
    if (channels.length > 1) {
      const compoundChannelId = this.registerCompoundLogChannel(channels);
      channel = this.getChannel(compoundChannelId);
    } else {
      channel = this.getChannel(channels[0].id);
    }
    if (!channel) {
      return;
    }
    try {
      let uri5 = outputPath;
      if (!uri5) {
        const name = channels.length > 1 ? "output" : channels[0].label;
        uri5 = await this.fileDialogService.showSaveDialog({
          title: localize(18038, null),
          availableFileSystems: [Schemas.file],
          defaultUri: joinPath(await this.fileDialogService.defaultFilePath(), `${name}.log`),
          filters: [{
            name,
            extensions: ["log"]
          }]
        });
      }
      if (!uri5) {
        return;
      }
      const modelRef = await this.textModelService.createModelReference(channel.uri);
      try {
        await this.fileService.writeFile(uri5, VSBuffer.fromString(modelRef.object.textEditorModel.getValue()));
      } finally {
        modelRef.dispose();
      }
      return;
    } finally {
      if (channels.length > 1) {
        Registry.as(Extensions15.OutputChannels).removeChannel(channel.id);
      }
    }
  }
  async onDidRegisterChannel(channelId) {
    const channel = this.createChannel(channelId);
    this.channels.set(channelId, channel);
    if (!this.activeChannel || this.activeChannelIdInStorage === channelId) {
      this.setActiveChannel(channel);
      this._onActiveOutputChannel.fire(channelId);
      const outputView = this.viewsService.getActiveViewWithId(OUTPUT_VIEW_ID);
      outputView?.showChannel(channel, true);
    }
  }
  onDidUpdateChannelSources(channel) {
    const outputChannel = this.channels.get(channel.id);
    if (outputChannel) {
      outputChannel.model.updateChannelSources(channel.source);
    }
  }
  onDidRemoveChannel(channel) {
    if (this.activeChannel?.id === channel.id) {
      const channels = this.getChannelDescriptors();
      if (channels[0]) {
        this.showChannel(channels[0].id);
      }
    }
    this.channels.deleteAndDispose(channel.id);
  }
  createChannel(id2) {
    const channel = this.instantiateChannel(id2);
    this._register(Event2.once(channel.model.onDispose)(() => {
      if (this.activeChannel === channel) {
        const channels = this.getChannelDescriptors();
        const channel2 = channels.length ? this.getChannel(channels[0].id) : void 0;
        if (channel2 && this.viewsService.isViewVisible(OUTPUT_VIEW_ID)) {
          this.showChannel(channel2.id);
        } else {
          this.setActiveChannel(void 0);
        }
      }
      Registry.as(Extensions15.OutputChannels).removeChannel(id2);
    }));
    return channel;
  }
  instantiateChannel(id2) {
    const channelData = Registry.as(Extensions15.OutputChannels).getChannel(id2);
    if (!channelData) {
      this.logService.error(`Channel '${id2}' is not registered yet`);
      throw new Error(`Channel '${id2}' is not registered yet`);
    }
    if (!this.outputFolderCreationPromise) {
      this.outputFolderCreationPromise = this.fileService.createFolder(this.outputLocation).then(() => void 0);
    }
    return this.instantiationService.createInstance(OutputChannel, channelData, this.outputLocation, this.outputFolderCreationPromise);
  }
  setLevelContext() {
    const descriptor = this.activeChannel?.outputChannelDescriptor;
    const channelLogLevel = descriptor ? this.getLogLevel(descriptor) : void 0;
    this.activeOutputChannelLevelContext.set(channelLogLevel !== void 0 ? LogLevelToString(channelLogLevel) : "");
  }
  async setLevelIsDefaultContext() {
    const descriptor = this.activeChannel?.outputChannelDescriptor;
    const channelLogLevel = descriptor ? this.getLogLevel(descriptor) : void 0;
    if (channelLogLevel !== void 0) {
      const channelDefaultLogLevel = this.defaultLogLevelsService.getDefaultLogLevel(descriptor?.extensionId);
      this.activeOutputChannelLevelIsDefaultContext.set(channelDefaultLogLevel === channelLogLevel);
    } else {
      this.activeOutputChannelLevelIsDefaultContext.set(false);
    }
  }
  setActiveChannel(channel) {
    this.activeChannel = channel;
    const descriptor = channel?.outputChannelDescriptor;
    this.activeFileOutputChannelContext.set(!!descriptor && isSingleSourceOutputChannelDescriptor(descriptor));
    this.activeLogOutputChannelContext.set(!!descriptor?.log);
    this.activeOutputChannelLevelSettableContext.set(descriptor !== void 0 && this.canSetLogLevel(descriptor));
    this.setLevelIsDefaultContext();
    this.setLevelContext();
    if (this.activeChannel) {
      this.storageService.store(OUTPUT_ACTIVE_CHANNEL_KEY, this.activeChannel.id, 1 /* WORKSPACE */, 1 /* MACHINE */);
    } else {
      this.storageService.remove(OUTPUT_ACTIVE_CHANNEL_KEY, 1 /* WORKSPACE */);
    }
  }
};

OutputService = __decorateClass([
  __decorateParam(0, IStorageService),
  __decorateParam(1, IInstantiationService),
  __decorateParam(2, ITextModelService),
  __decorateParam(3, ILogService),
  __decorateParam(4, ILoggerService),
  __decorateParam(5, ILifecycleService),
  __decorateParam(6, IViewsService),
  __decorateParam(7, IContextKeyService),
  __decorateParam(8, IDefaultLogLevelsService),
  __decorateParam(9, IFileDialogService),
  __decorateParam(10, IFileService),
  __decorateParam(11, IWorkbenchEnvironmentService)
], OutputService);
export { OUTPUT_ACTIVE_CHANNEL_KEY, OutputChannel, OutputViewFilters, OutputService };
