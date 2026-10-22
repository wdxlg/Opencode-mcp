// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/debug/browser/debugAdapterManager.ts
import { Registry } from "./module-0090.mjs";
import { Extensions3 } from "./module-0138.mjs";
import { Disposable } from "./module-0012.mjs";
import { Emitter, Event2 } from "./module-0017.mjs";
import { CONTEXT_DEBUGGERS_AVAILABLE, CONTEXT_DEBUG_EXTENSION_AVAILABLE, INTERNAL_CONSOLE_OPTIONS_SCHEMA } from "./module-1057.mjs";
import { RunOnceScheduler } from "./module-0036.mjs";
import { breakpointsExtPoint, debuggersExtPoint, launchSchema, presentationSchema } from "./module-3186.mjs";
import { localize } from "./module-0001.mjs";
import { Debugger } from "./module-3185.mjs";
import { Breakpoints } from "./module-3183.mjs";
import { TaskDefinitionRegistry } from "./module-1402.mjs";
import { launchSchemaId } from "./module-1198.mjs";
import { equalsIgnoreCase } from "./module-0030.mjs";
import { isCodeEditor } from "./module-0223.mjs";
import { severity_default } from "./module-0266.mjs";
import { IMenuService, MenuId, MenuItemAction } from "./module-0092.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IEditorService } from "./module-0934.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IQuickInputService } from "./module-0536.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { ICommandService } from "./module-0087.mjs";
import { IExtensionService } from "./module-0887.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { ILanguageService } from "./module-0133.mjs";
import { IDialogService } from "./module-0267.mjs";
import { ILifecycleService } from "./module-0868.mjs";
import { ITaskService } from "./module-1404.mjs";


// src/vs/workbench/contrib/debug/browser/debugAdapterManager.ts
var jsonRegistry4 = Registry.as(Extensions3.JSONContribution);

var AdapterManager = class extends Disposable {
  constructor(delegate, editorService, configurationService, quickInputService, instantiationService, commandService, extensionService, contextKeyService, languageService, dialogService, lifecycleService, tasksService, menuService) {
    super();
    this.delegate = delegate;
    this.editorService = editorService;
    this.configurationService = configurationService;
    this.quickInputService = quickInputService;
    this.instantiationService = instantiationService;
    this.commandService = commandService;
    this.extensionService = extensionService;
    this.contextKeyService = contextKeyService;
    this.languageService = languageService;
    this.dialogService = dialogService;
    this.lifecycleService = lifecycleService;
    this.tasksService = tasksService;
    this.menuService = menuService;
    this.debugAdapterFactories = /* @__PURE__ */ new Map();
    this._onDidRegisterDebugger = this._register(new Emitter());
    this._onDidDebuggersExtPointRead = this._register(new Emitter());
    this.breakpointContributions = [];
    this.debuggerWhenKeys = /* @__PURE__ */ new Set();
    this.taskLabels = [];
    this.usedDebugTypes = /* @__PURE__ */ new Set();
    this.adapterDescriptorFactories = [];
    this.debuggers = [];
    this.registerListeners();
    this.contextKeyService.bufferChangeEvents(() => {
      this.debuggersAvailable = CONTEXT_DEBUGGERS_AVAILABLE.bindTo(contextKeyService);
      this.debugExtensionsAvailable = CONTEXT_DEBUG_EXTENSION_AVAILABLE.bindTo(contextKeyService);
    });
    this._register(this.contextKeyService.onDidChangeContext((e) => {
      if (e.affectsSome(this.debuggerWhenKeys)) {
        this.debuggersAvailable.set(this.hasEnabledDebuggers());
        this.updateDebugAdapterSchema();
      }
    }));
    this._register(this.onDidDebuggersExtPointRead(() => {
      this.debugExtensionsAvailable.set(this.debuggers.length > 0);
    }));
    const updateTaskScheduler = this._register(new RunOnceScheduler(() => this.updateTaskLabels(), 5e3));
    this._register(Event2.any(tasksService.onDidChangeTaskConfig, tasksService.onDidChangeTaskProviders)(() => {
      updateTaskScheduler.cancel();
      updateTaskScheduler.schedule();
    }));
    this.lifecycleService.when(4 /* Eventually */).then(() => this.debugExtensionsAvailable.set(this.debuggers.length > 0));
    this._register(delegate.onDidNewSession((s) => {
      this.usedDebugTypes.add(s.configuration.type);
    }));
    updateTaskScheduler.schedule();
  }
  registerListeners() {
    debuggersExtPoint.setHandler((extensions, delta2) => {
      delta2.added.forEach((added) => {
        added.value.forEach((rawAdapter) => {
          if (!rawAdapter.type || typeof rawAdapter.type !== "string") {
            added.collector.error(localize(14363, null));
          }
          if (rawAdapter.type !== "*") {
            const existing = this.getDebugger(rawAdapter.type);
            if (existing) {
              existing.merge(rawAdapter, added.description);
            } else {
              const dbg = this.instantiationService.createInstance(Debugger, this, rawAdapter, added.description);
              dbg.when?.keys().forEach((key3) => this.debuggerWhenKeys.add(key3));
              this.debuggers.push(dbg);
            }
          }
        });
      });
      extensions.forEach((extension) => {
        extension.value.forEach((rawAdapter) => {
          if (rawAdapter.type === "*") {
            this.debuggers.forEach((dbg) => dbg.merge(rawAdapter, extension.description));
          }
        });
      });
      delta2.removed.forEach((removed) => {
        const removedTypes = removed.value.map((rawAdapter) => rawAdapter.type);
        this.debuggers = this.debuggers.filter((d) => removedTypes.indexOf(d.type) === -1);
      });
      this.updateDebugAdapterSchema();
      this._onDidDebuggersExtPointRead.fire();
    });
    breakpointsExtPoint.setHandler((extensions) => {
      this.breakpointContributions = extensions.flatMap((ext) => ext.value.map((breakpoint2) => this.instantiationService.createInstance(Breakpoints, breakpoint2)));
    });
  }
  updateTaskLabels() {
    this.tasksService.getKnownTasks().then((tasks2) => {
      this.taskLabels = tasks2.map((task) => task._label);
      this.updateDebugAdapterSchema();
    });
  }
  updateDebugAdapterSchema() {
    const items = launchSchema.properties["configurations"].items;
    const taskSchema = TaskDefinitionRegistry.getJsonSchema();
    const definitions3 = {
      "common": {
        properties: {
          "name": {
            type: "string",
            description: localize(14362, null),
            default: "Launch"
          },
          "debugServer": {
            type: "number",
            description: localize(14366, null),
            default: 4711
          },
          "preLaunchTask": {
            anyOf: [taskSchema, {
              type: ["string"]
            }],
            default: "",
            defaultSnippets: [{ body: { task: "", type: "" } }],
            description: localize(14365, null),
            examples: this.taskLabels
          },
          "postDebugTask": {
            anyOf: [taskSchema, {
              type: ["string"]
            }],
            default: "",
            defaultSnippets: [{ body: { task: "", type: "" } }],
            description: localize(14364, null),
            examples: this.taskLabels
          },
          "presentation": presentationSchema,
          "internalConsoleOptions": INTERNAL_CONSOLE_OPTIONS_SCHEMA,
          "suppressMultipleSessionWarning": {
            type: "boolean",
            description: localize(14373, null),
            default: true
          }
        }
      }
    };
    launchSchema.definitions = definitions3;
    items.oneOf = [];
    items.defaultSnippets = [];
    this.debuggers.forEach((adapter) => {
      const schemaAttributes = adapter.getSchemaAttributes(definitions3);
      if (schemaAttributes && items.oneOf) {
        items.oneOf.push(...schemaAttributes);
      }
      const configurationSnippets = adapter.configurationSnippets;
      if (configurationSnippets && items.defaultSnippets) {
        items.defaultSnippets.push(...configurationSnippets);
      }
    });
    jsonRegistry4.registerSchema(launchSchemaId, launchSchema);
  }
  registerDebugAdapterFactory(debugTypes, debugAdapterLauncher) {
    debugTypes.forEach((debugType) => this.debugAdapterFactories.set(debugType, debugAdapterLauncher));
    this.debuggersAvailable.set(this.hasEnabledDebuggers());
    this._onDidRegisterDebugger.fire();
    return {
      dispose: () => {
        debugTypes.forEach((debugType) => this.debugAdapterFactories.delete(debugType));
      }
    };
  }
  hasEnabledDebuggers() {
    for (const [type] of this.debugAdapterFactories) {
      const dbg = this.getDebugger(type);
      if (dbg && dbg.enabled) {
        return true;
      }
    }
    return false;
  }
  createDebugAdapter(session) {
    const factory = this.debugAdapterFactories.get(session.configuration.type);
    if (factory) {
      return factory.createDebugAdapter(session);
    }
    return void 0;
  }
  substituteVariables(debugType, folder, config) {
    const factory = this.debugAdapterFactories.get(debugType);
    if (factory) {
      return factory.substituteVariables(folder, config);
    }
    return Promise.resolve(config);
  }
  runInTerminal(debugType, args2, sessionId) {
    const factory = this.debugAdapterFactories.get(debugType);
    if (factory) {
      return factory.runInTerminal(args2, sessionId);
    }
    return Promise.resolve(void 0);
  }
  registerDebugAdapterDescriptorFactory(debugAdapterProvider) {
    this.adapterDescriptorFactories.push(debugAdapterProvider);
    return {
      dispose: () => {
        this.unregisterDebugAdapterDescriptorFactory(debugAdapterProvider);
      }
    };
  }
  unregisterDebugAdapterDescriptorFactory(debugAdapterProvider) {
    const ix = this.adapterDescriptorFactories.indexOf(debugAdapterProvider);
    if (ix >= 0) {
      this.adapterDescriptorFactories.splice(ix, 1);
    }
  }
  getDebugAdapterDescriptor(session) {
    const config = session.configuration;
    const providers2 = this.adapterDescriptorFactories.filter((p) => p.type === config.type && p.createDebugAdapterDescriptor);
    if (providers2.length === 1) {
      return providers2[0].createDebugAdapterDescriptor(session);
    } else {
    }
    return Promise.resolve(void 0);
  }
  getDebuggerLabel(type) {
    const dbgr = this.getDebugger(type);
    if (dbgr) {
      return dbgr.label;
    }
    return void 0;
  }
  get onDidRegisterDebugger() {
    return this._onDidRegisterDebugger.event;
  }
  get onDidDebuggersExtPointRead() {
    return this._onDidDebuggersExtPointRead.event;
  }
  canSetBreakpointsIn(model) {
    const languageId = model.getLanguageId();
    if (!languageId || languageId === "jsonc" || languageId === "log") {
      return false;
    }
    if (this.configurationService.getValue("debug").allowBreakpointsEverywhere) {
      return true;
    }
    return this.breakpointContributions.some((breakpoints) => breakpoints.language === languageId && breakpoints.enabled);
  }
  getDebugger(type) {
    return this.debuggers.find((dbg) => equalsIgnoreCase(dbg.type, type));
  }
  getEnabledDebugger(type) {
    const adapter = this.getDebugger(type);
    return adapter && adapter.enabled ? adapter : void 0;
  }
  someDebuggerInterestedInLanguage(languageId) {
    return !!this.debuggers.filter((d) => d.enabled).find((a) => a.interestedInLanguage(languageId));
  }
  async guessDebugger(gettingConfigurations) {
    const activeTextEditorControl = this.editorService.activeTextEditorControl;
    let candidates = [];
    let languageLabel = null;
    let model = null;
    if (isCodeEditor(activeTextEditorControl)) {
      model = activeTextEditorControl.getModel();
      const language2 = model ? model.getLanguageId() : void 0;
      if (language2) {
        languageLabel = this.languageService.getLanguageName(language2);
      }
      const adapters = this.debuggers.filter((a) => a.enabled).filter((a) => language2 && a.interestedInLanguage(language2));
      if (adapters.length === 1) {
        return { debugger: adapters[0] };
      }
      if (adapters.length > 1) {
        candidates = adapters;
      }
    }
    if ((!languageLabel || gettingConfigurations || model && this.canSetBreakpointsIn(model)) && candidates.length === 0) {
      await this.activateDebuggers("onDebugInitialConfigurations");
      candidates = this.debuggers.filter((a) => a.enabled).filter((dbg) => dbg.hasInitialConfiguration() || dbg.hasDynamicConfigurationProviders() || dbg.hasConfigurationProvider());
    }
    if (candidates.length === 0 && languageLabel) {
      if (languageLabel.indexOf(" ") >= 0) {
        languageLabel = `'${languageLabel}'`;
      }
      const { confirmed } = await this.dialogService.confirm({
        type: severity_default.Warning,
        message: localize(14361, null, languageLabel),
        primaryButton: localize(14367, null, languageLabel)
      });
      if (confirmed) {
        await this.commandService.executeCommand("debug.installAdditionalDebuggers", languageLabel);
      }
      return void 0;
    }
    this.initExtensionActivationsIfNeeded();
    candidates.sort((first2, second) => first2.label.localeCompare(second.label));
    candidates = candidates.filter((a) => !a.isHiddenFromDropdown);
    const suggestedCandidates = [];
    const otherCandidates = [];
    candidates.forEach((d) => {
      const descriptor = d.getMainExtensionDescriptor();
      if (descriptor.id && !!this.earlyActivatedExtensions?.has(descriptor.id)) {
        suggestedCandidates.push(d);
      } else if (this.usedDebugTypes.has(d.type)) {
        suggestedCandidates.push(d);
      } else {
        otherCandidates.push(d);
      }
    });
    const picks = [];
    const dynamic = await this.delegate.configurationManager().getDynamicProviders();
    if (suggestedCandidates.length > 0) {
      picks.push(
        { type: "separator", label: localize(14372, null) },
        ...suggestedCandidates.map((c) => ({ label: c.label, pick: () => ({ debugger: c }) }))
      );
    }
    if (otherCandidates.length > 0) {
      if (picks.length > 0) {
        picks.push({ type: "separator", label: "" });
      }
      picks.push(...otherCandidates.map((c) => ({ label: c.label, pick: () => ({ debugger: c }) })));
    }
    if (dynamic.length) {
      if (picks.length) {
        picks.push({ type: "separator", label: "" });
      }
      for (const d of dynamic) {
        picks.push({
          label: localize(14370, null, d.label),
          pick: async () => {
            const cfg = await d.pick();
            if (!cfg) {
              return void 0;
            }
            return cfg && { debugger: this.getDebugger(d.type), withConfig: cfg };
          }
        });
      }
    }
    picks.push(
      { type: "separator", label: "" },
      { label: languageLabel ? localize(14369, null, languageLabel) : localize(14368, null) }
    );
    const contributed = this.menuService.getMenuActions(MenuId.DebugCreateConfiguration, this.contextKeyService);
    for (const [, action] of contributed) {
      for (const item of action) {
        picks.push(item);
      }
    }
    const placeHolder = localize(14371, null);
    return this.quickInputService.pick(picks, { activeItem: picks[0], placeHolder }).then(async (picked) => {
      if (picked && "pick" in picked && typeof picked.pick === "function") {
        return await picked.pick();
      }
      if (picked instanceof MenuItemAction) {
        picked.run();
        return;
      }
      if (picked) {
        this.commandService.executeCommand("debug.installAdditionalDebuggers", languageLabel);
      }
      return void 0;
    });
  }
  initExtensionActivationsIfNeeded() {
    if (!this.earlyActivatedExtensions) {
      this.earlyActivatedExtensions = /* @__PURE__ */ new Set();
      const status2 = this.extensionService.getExtensionsStatus();
      for (const id2 in status2) {
        if (!!status2[id2].activationTimes) {
          this.earlyActivatedExtensions.add(id2);
        }
      }
    }
  }
  async activateDebuggers(activationEvent, debugType) {
    this.initExtensionActivationsIfNeeded();
    const promises = [
      this.extensionService.activateByEvent(activationEvent),
      this.extensionService.activateByEvent("onDebug")
    ];
    if (debugType) {
      promises.push(this.extensionService.activateByEvent(`${activationEvent}:${debugType}`));
    }
    await Promise.all(promises);
  }
};

AdapterManager = __decorateClass([
  __decorateParam(1, IEditorService),
  __decorateParam(2, IConfigurationService),
  __decorateParam(3, IQuickInputService),
  __decorateParam(4, IInstantiationService),
  __decorateParam(5, ICommandService),
  __decorateParam(6, IExtensionService),
  __decorateParam(7, IContextKeyService),
  __decorateParam(8, ILanguageService),
  __decorateParam(9, IDialogService),
  __decorateParam(10, ILifecycleService),
  __decorateParam(11, ITaskService),
  __decorateParam(12, IMenuService)
], AdapterManager);
export { jsonRegistry4, AdapterManager };
