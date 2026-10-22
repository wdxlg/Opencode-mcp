// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/common/promptSyntax/service/promptsServiceImpl.ts
import { Disposable, DisposableStore, MutableDisposable } from "./module-0012.mjs";
import { Delayer, Limiter, raceCancellationError } from "./module-0036.mjs";
import { Emitter, Event2 } from "./module-0017.mjs";
import { ResourceMap, ResourceSet } from "./module-0008.mjs";
import { ExtensionPromptFileService } from "./module-1020.mjs";
import { COPILOT_ALLOW_MANAGED_HOOKS_ONLY_CONFIG, COPILOT_STRICT_PLUGIN_ONLY_CUSTOMIZATION_CONFIG } from "./module-0956.mjs";
import { PromptsConfig } from "./module-0999.mjs";
import { observableFromEvent } from "./module-0057.mjs";
import { autorun } from "./module-0052.mjs";
import { isContributionEnabled } from "./module-1019.mjs";
import { isAgentPluginForceEnabledByPolicy } from "./module-1030.mjs";
import { IAgentPluginService, getCanonicalPluginCommandId } from "./module-1017.mjs";
import { PromptFilesLocator } from "./module-1002.mjs";
import { PromptFileParser, PromptHeaderAttributes, evaluateApplyToPattern } from "./module-1004.mjs";
import { isPromptTypeBlocked } from "./module-1021.mjs";
import { basename2, dirname2, isEqual2, joinPath } from "./module-0034.mjs";
import { StopWatch } from "./module-0016.mjs";
import { AGENT_MD_FILENAME, CLAUDE_CONFIG_FOLDER, CLAUDE_LOCAL_MD_FILENAME, CLAUDE_MD_FILENAME, COPILOT_CONFIG_FOLDER, COPILOT_CUSTOM_INSTRUCTIONS_FILENAME, DICTATION_INSTRUCTIONS_FILENAME, GITHUB_CONFIG_FOLDER, VOICE_INSTRUCTIONS_FILENAME, getCleanPromptName, getSkillFolderName, isInClaudeRulesFolder } from "./module-0997.mjs";
import { CancellationError, isCancellationError } from "./module-0004.mjs";
import { PROMPT_LANGUAGE_ID, getPromptsTypeForLanguageId } from "./module-0986.mjs";
import { Schemas } from "./module-0033.mjs";
import { CancellationToken, CancellationTokenPool } from "./module-0025.mjs";
import { IAgentSource, matchesSessionType } from "./module-0987.mjs";
import { getTarget, mapClaudeModels, mapClaudeTools } from "./module-1016.mjs";
import { parseSubagentHooksFromYaml } from "./module-1012.mjs";
import { FileOperationError, IFileService } from "./module-0269.mjs";
import { localize } from "./module-0001.mjs";
import { assertNever } from "./module-0009.mjs";
import { URI } from "./module-0032.mjs";
import { parse5 } from "./module-0885.mjs";
import { getParseErrorMessage } from "./module-0890.mjs";
import { parseHooksFromFile } from "./module-1015.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ILogService } from "./module-0095.mjs";
import { ILabelService } from "./module-0641.mjs";
import { IModelService } from "./module-0080.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IUserDataProfileService } from "./module-0998.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IStorageService } from "./module-0512.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { IWorkspaceContextService } from "./module-0509.mjs";
import { IPathService } from "./module-0939.mjs";
import { IWorkspaceTrustManagementService } from "./module-0854.mjs";
import { OffsetRange } from "./module-0144.mjs";


// src/vs/workbench/contrib/chat/common/promptSyntax/service/promptsServiceImpl.ts
var PROMPT_FILE_DISCOVERY_CONCURRENCY = 10;

var PromptsService = class extends Disposable {
  constructor(logger, labelService, modelService, instantiationService, userDataService, configurationService, fileService, storageService, telemetryService, workspaceService, pathService, agentPluginService, workspaceTrustService) {
    super();
    this.logger = logger;
    this.labelService = labelService;
    this.modelService = modelService;
    this.instantiationService = instantiationService;
    this.userDataService = userDataService;
    this.configurationService = configurationService;
    this.fileService = fileService;
    this.storageService = storageService;
    this.telemetryService = telemetryService;
    this.workspaceService = workspaceService;
    this.pathService = pathService;
    this.agentPluginService = agentPluginService;
    this.workspaceTrustService = workspaceTrustService;
    /**
     * Bounds how many prompt files discovery reads in parallel.
     *
     * Owned by the service rather than created per invocation on purpose: an
     * invalidation clears the cached discovery promise without cancelling the
     * computation it was tracking, so several passes can run at once. A limiter
     * per invocation would give each pass its own quota and the aggregate would
     * still grow with the number of passes, which is the exhaustion this bound
     * exists to prevent.
     */
    this._discoveryLimiter = this._register(new Limiter(PROMPT_FILE_DISCOVERY_CONCURRENCY));
    this.agentInstructionsWatcher = this._register(new MutableDisposable());
    this._onDidChangeAgentInstructions = this._register(new Emitter({
      onWillAddFirstListener: () => {
        const store = new DisposableStore();
        const agentInstructionsUpdatedEvent = this.fileLocator.createAgentInstructionsUpdatedEvent();
        store.add(agentInstructionsUpdatedEvent);
        store.add(agentInstructionsUpdatedEvent.event(() => this._onDidChangeAgentInstructions.fire()));
        this.agentInstructionsWatcher.value = store;
      },
      onDidRemoveLastListener: () => {
        this.agentInstructionsWatcher.clear();
      }
    }));
    /**
     * Synchronous mirror of the names exposed by {@link getPromptSlashCommands},
     * maintained for {@link hasPromptSlashCommand} so callers (e.g. the chat request
     * parser) can disambiguate `<cmd>:<sub>` vs bare `<cmd>` without an async hop.
     */
    this.knownPromptSlashCommandNames = /* @__PURE__ */ new Set();
    /**
     * Cache for parsed prompt files keyed by URI.
     * The number in the returned tuple is textModel.getVersionId(), which is an internal VS Code counter that increments every time the text model's content changes.
     */
    this.cachedParsedPromptFromModels = new ResourceMap();
    /**
     * Cached file locations commands. Caching only happens if the corresponding `fileLocatorEvents` event is used.
     */
    this.cachedFileLocations = {};
    /**
     * Lazily created events that notify listeners when the file locations for a given prompt type change.
     * An event is created on demand for each prompt type and can be used by consumers to react to updates
     * in the set of prompt files (e.g., when prompt files are added, removed, or modified).
     */
    this.fileLocatorEvents = {};
    this._onDidPluginPromptFilesChange = this._register(new Emitter());
    this._onDidPluginHooksChange = this._register(new Emitter());
    this._pluginPromptFilesByType = /* @__PURE__ */ new Map();
    this.knownPromptSlashCommandsHydrationStarted = false;
    // --- Enabled Prompt Files -----------------------------------------------------------
    this.disabledPromptsStorageKeyPrefix = "chat.disabledPromptFiles.";
    this.fileLocator = this.createPromptFilesLocator();
    this._register(this.modelService.onModelRemoved((model) => {
      this.cachedParsedPromptFromModels.delete(model.uri);
    }));
    this.extensionPromptFiles = this._register(this.instantiationService.createInstance(ExtensionPromptFileService));
    const onDidChangeExtensionPromptFiles = this.extensionPromptFiles.onDidChange;
    const onDidChangeCustomizationLockdown = Event2.filter(
      this.configurationService.onDidChangeConfiguration,
      (e4) => e4.affectsConfiguration(COPILOT_STRICT_PLUGIN_ONLY_CUSTOMIZATION_CONFIG) || e4.affectsConfiguration(COPILOT_ALLOW_MANAGED_HOOKS_ONLY_CONFIG)
    );
    this._register(onDidChangeCustomizationLockdown(() => {
      this.cachedFileLocations["agent" /* agent */] = void 0;
      this.cachedFileLocations["skill" /* skill */] = void 0;
      this.cachedFileLocations["hook" /* hook */] = void 0;
      this.cachedFileLocations["instructions" /* instructions */] = void 0;
      this._onDidChangeAgentInstructions.fire();
    }));
    this._register(onDidChangeExtensionPromptFiles((e4) => {
      this.cachedFileLocations[e4.type] = void 0;
    }));
    const modelChangeEvent = this._register(new ModelChangeTracker(this.modelService)).onDidPromptChange;
    this.cachedCustomAgents = this._register(new CachedPromise(
      (token) => this.computeAgentDiscoveryInfo(token),
      () => Event2.any(
        this.getFileLocatorEvent("agent" /* agent */),
        Event2.filter(modelChangeEvent, (e4) => e4.promptType === "agent" /* agent */),
        Event2.filter(this.configurationService.onDidChangeConfiguration, (e4) => e4.affectsConfiguration(PromptsConfig.USE_CHAT_HOOKS)),
        Event2.filter(onDidChangeExtensionPromptFiles, (e4) => e4.type === "agent" /* agent */),
        Event2.filter(this._onDidPluginPromptFilesChange.event, (t2) => t2 === "agent" /* agent */),
        onDidChangeCustomizationLockdown,
        this.workspaceTrustService.onDidChangeTrust
      )
    ));
    this.cachedSlashCommands = this._register(new CachedPromise(
      (token) => this.computeSlashCommandDiscoveryInfo(token),
      () => Event2.any(
        this.getFileLocatorEvent("prompt" /* prompt */),
        this.getFileLocatorEvent("skill" /* skill */),
        Event2.filter(modelChangeEvent, (e4) => e4.promptType === "prompt" /* prompt */),
        Event2.filter(modelChangeEvent, (e4) => e4.promptType === "skill" /* skill */),
        Event2.filter(onDidChangeExtensionPromptFiles, (e4) => e4.type === "prompt" /* prompt */ || e4.type === "skill" /* skill */),
        Event2.filter(this._onDidPluginPromptFilesChange.event, (t2) => t2 === "prompt" /* prompt */ || t2 === "skill" /* skill */),
        onDidChangeCustomizationLockdown
      )
    ));
    this.cachedSkills = this._register(new CachedPromise(
      (token) => this.computeSkillDiscovery(token),
      () => Event2.any(
        this.getFileLocatorEvent("skill" /* skill */),
        Event2.filter(modelChangeEvent, (e4) => e4.promptType === "skill" /* skill */),
        Event2.filter(onDidChangeExtensionPromptFiles, (e4) => e4.type === "skill" /* skill */),
        Event2.filter(this._onDidPluginPromptFilesChange.event, (t2) => t2 === "skill" /* skill */),
        onDidChangeCustomizationLockdown
      )
    ));
    this.cachedHooks = this._register(new CachedPromise(
      (token) => this.computeHooks(token),
      () => Event2.any(
        this.getFileLocatorEvent("hook" /* hook */),
        Event2.filter(this.configurationService.onDidChangeConfiguration, (e4) => e4.affectsConfiguration(PromptsConfig.USE_CHAT_HOOKS) || e4.affectsConfiguration(PromptsConfig.USE_CLAUDE_HOOKS)),
        onDidChangeCustomizationLockdown,
        this._onDidPluginHooksChange.event,
        this.workspaceTrustService.onDidChangeTrust
      )
    ));
    this.cachedInstructions = this._register(new CachedPromise(
      (token) => this.computeInstructionFiles(token),
      () => Event2.any(
        this.getFileLocatorEvent("instructions" /* instructions */),
        Event2.filter(onDidChangeExtensionPromptFiles, (e4) => e4.type === "instructions" /* instructions */),
        Event2.filter(this._onDidPluginPromptFilesChange.event, (t2) => t2 === "instructions" /* instructions */),
        onDidChangeCustomizationLockdown
      )
    ));
    this._register(this.watchPluginPromptFilesForType(
      "prompt" /* prompt */,
      (plugin, reader) => plugin.commands.read(reader)
    ));
    this._register(this.watchPluginPromptFilesForType(
      "skill" /* skill */,
      (plugin, reader) => plugin.skills.read(reader)
    ));
    this._register(this.watchPluginPromptFilesForType(
      "agent" /* agent */,
      (plugin, reader) => plugin.agents.read(reader)
    ));
    this._register(this.watchPluginPromptFilesForType(
      "instructions" /* instructions */,
      (plugin, reader) => plugin.instructions.read(reader)
    ));
    const managedHooksOnly = observableFromEvent(
      this,
      onDidChangeCustomizationLockdown,
      () => this.configurationService.getValue(COPILOT_ALLOW_MANAGED_HOOKS_ONLY_CONFIG) === true
    );
    const enabledPluginsPolicy = observableFromEvent(
      this,
      Event2.filter(this.configurationService.onDidChangeConfiguration, (e4) => e4.affectsConfiguration("chat.plugins.enabledPlugins" /* EnabledPlugins */)),
      () => this.configurationService.inspect("chat.plugins.enabledPlugins" /* EnabledPlugins */).policyValue
    );
    this._register(autorun((reader) => {
      const plugins = this.agentPluginService.plugins.read(reader);
      const managedHooksOnlyValue = managedHooksOnly.read(reader);
      const enabledPluginsPolicyValue = enabledPluginsPolicy.read(reader);
      const hookFiles = [];
      for (const plugin of plugins) {
        if (isContributionEnabled(plugin.enablement.read(reader)) && (!managedHooksOnlyValue || isAgentPluginForceEnabledByPolicy(plugin, enabledPluginsPolicyValue))) {
          for (const hook of plugin.hooks.read(reader)) {
            hookFiles.push({
              uri: hook.uri,
              storage: "plugin" /* plugin */,
              type: "hook" /* hook */,
              name: getCanonicalPluginCommandId(plugin, hook.originalId),
              pluginUri: plugin.uri,
              pluginLabel: plugin.label,
              source: "plugin" /* Plugin */
            });
          }
        }
      }
      this._pluginPromptFilesByType.set("hook" /* hook */, hookFiles);
      this.cachedFileLocations["hook" /* hook */] = void 0;
      this._onDidPluginHooksChange.fire();
    }));
  }
  /**
   * Queues a discovery file read on the shared, service-wide limiter.
   */
  queueDiscoveryRead(task) {
    return this._discoveryLimiter.queue(task);
  }
  watchPluginPromptFilesForType(type, getItems) {
    return autorun((reader) => {
      const plugins = this.agentPluginService.plugins.read(reader);
      const nextFiles = [];
      for (const plugin of plugins) {
        if (!isContributionEnabled(plugin.enablement.read(reader))) {
          continue;
        }
        for (const item of getItems(plugin, reader)) {
          nextFiles.push({
            uri: item.uri,
            storage: "plugin" /* plugin */,
            type,
            name: getCanonicalPluginCommandId(plugin, item.name),
            pluginUri: plugin.uri,
            pluginLabel: plugin.label,
            source: "plugin" /* Plugin */
          });
        }
      }
      nextFiles.sort((a, b) => `${a.name ?? ""}|${a.uri.toString()}`.localeCompare(`${b.name ?? ""}|${b.uri.toString()}`));
      this._pluginPromptFilesByType.set(type, nextFiles);
      this.cachedFileLocations[type] = void 0;
      this._onDidPluginPromptFilesChange.fire(type);
    });
  }
  createPromptFilesLocator() {
    return this.instantiationService.createInstance(PromptFilesLocator);
  }
  getFileLocatorEvent(type) {
    let event = this.fileLocatorEvents[type];
    if (!event) {
      event = this.fileLocatorEvents[type] = this._register(this.fileLocator.createFilesUpdatedEvent(type)).event;
      this._register(event(() => {
        this.cachedFileLocations[type] = void 0;
      }));
    }
    return event;
  }
  getParsedPromptFile(textModel) {
    const cached = this.cachedParsedPromptFromModels.get(textModel.uri);
    if (cached && cached[0] === textModel.getVersionId()) {
      return cached[1];
    }
    const ast = new PromptFileParser().parse(textModel.uri, textModel.getValue());
    if (!cached || cached[0] < textModel.getVersionId()) {
      this.cachedParsedPromptFromModels.set(textModel.uri, [textModel.getVersionId(), ast]);
    }
    return ast;
  }
  async listPromptFiles(type, token) {
    let listPromise = this.cachedFileLocations[type];
    if (!listPromise) {
      listPromise = this.computeListPromptFiles(type, token);
      if (!this.fileLocatorEvents[type]) {
        return listPromise;
      }
      this.cachedFileLocations[type] = listPromise;
      return listPromise;
    }
    return listPromise;
  }
  async computeListPromptFiles(type, token) {
    const allowStandalone = !this.areStandalonePromptFilesBlocked(type);
    const prompts = await Promise.all([
      allowStandalone ? this.fileLocator.listFilesWithSource(type, "user" /* user */, token).then((files) => files.map((file) => ({ ...file, storage: "user" /* user */, type }))) : [],
      allowStandalone ? this.fileLocator.listFilesWithSource(type, "local" /* local */, token).then((files) => files.map((file) => ({ ...file, storage: "local" /* local */, type }))) : [],
      this.getExtensionPromptFiles(type, token),
      this._pluginPromptFilesByType.get(type) ?? [],
      this.getBuiltinPromptFiles(type, token)
    ]);
    return prompts.flat();
  }
  /**
   * Collects diagnostic information about which source folders were searched for display in the debug panel.
   */
  async _collectSourceFolderDiagnostics(type) {
    if (this.areStandalonePromptFilesBlocked(type)) {
      return [];
    }
    const resolvedFolders = await this.fileLocator.getSourceFoldersInDiscoveryOrder(type);
    return resolvedFolders.map((folder) => ({
      uri: folder.uri,
      storage: folder.storage
    }));
  }
  /**
   * Registers a prompt file provider (CustomAgentProvider, InstructionsProvider, or PromptFileProvider).
   * This will be called by the extension host bridge when
   * an extension registers a provider via vscode.chat.registerCustomAgentProvider(),
   * registerInstructionsProvider(), or registerPromptFileProvider().
   */
  registerPromptFileProvider(extension, type, provider) {
    return this.extensionPromptFiles.registerPromptFileProvider(extension, type, provider);
  }
  async listPromptFilesForStorage(type, storage, token, root) {
    let promptPaths;
    switch (storage) {
      case "extension" /* extension */:
        promptPaths = await this.getExtensionPromptFiles(type, token);
        break;
      case "local" /* local */:
        promptPaths = this.areStandalonePromptFilesBlocked(type) ? [] : await this.fileLocator.listFilesWithSource(type, "local" /* local */, token, root).then((files) => files.map((file) => ({ ...file, storage: "local" /* local */, type })));
        break;
      case "user" /* user */:
        promptPaths = this.areStandalonePromptFilesBlocked(type) ? [] : await this.fileLocator.listFilesWithSource(type, "user" /* user */, token).then((files) => files.map((file) => ({ ...file, storage: "user" /* user */, type })));
        break;
      case "plugin" /* plugin */:
        promptPaths = this._pluginPromptFilesByType.get(type) ?? [];
        break;
      case "builtin" /* builtIn */:
        promptPaths = await this.getBuiltinPromptFiles(type, token);
        break;
      default:
        throw new Error(`[listPromptFilesForStorage] Unsupported prompt storage type: ${storage}`);
    }
    return promptPaths;
  }
  getExtensionPromptFiles(type, token) {
    return this.extensionPromptFiles.getExtensionPromptFiles(type, token);
  }
  /**
   * Returns the built-in prompt files of the given type. The base service ships
   * no built-in prompts; subclasses (e.g. the Agents app) override this to
   * contribute bundled prompts such as built-in skills.
   */
  async getBuiltinPromptFiles(type, token) {
    return [];
  }
  async getSourceFolders(type) {
    if (this.areStandalonePromptFilesBlocked(type)) {
      return [];
    }
    const result = [];
    if (type === "hook" /* hook */) {
      const hooksFolders = await this.fileLocator.getHookSourceFolders();
      for (const folder of hooksFolders) {
        result.push({ uri: folder.uri, storage: folder.storage, type, source: folder.source });
      }
      return result;
    }
    if (type === "skill" /* skill */) {
      const resolvedFolders = await this.fileLocator.getResolvedSourceFolders(type);
      for (const folder of resolvedFolders) {
        result.push({ uri: folder.searchRoot, storage: folder.storage, type, source: folder.source });
      }
      return result;
    }
    for (const uri4 of await this.fileLocator.getConfigBasedSourceFolders(type)) {
      result.push({ uri: uri4, storage: "local" /* local */, type });
    }
    const userHome = this.userDataService.currentProfile.promptsHome;
    result.push({ uri: userHome, storage: "user" /* user */, type });
    return result;
  }
  async getResolvedSourceFolders(type) {
    if (this.areStandalonePromptFilesBlocked(type)) {
      return [];
    }
    return this.fileLocator.getResolvedSourceFolders(type);
  }
  areStandalonePromptFilesBlocked(type) {
    const strictPluginOnly = this.configurationService.getValue(COPILOT_STRICT_PLUGIN_ONLY_CUSTOMIZATION_CONFIG);
    return isPromptTypeBlocked(strictPluginOnly, type) || type === "hook" /* hook */ && this.configurationService.getValue(COPILOT_ALLOW_MANAGED_HOOKS_ONLY_CONFIG) === true;
  }
  areAgentHooksAllowed(promptPath) {
    if (this.configurationService.getValue(COPILOT_ALLOW_MANAGED_HOOKS_ONLY_CONFIG) === true) {
      if (promptPath.storage !== "plugin" /* plugin */ || !promptPath.pluginUri) {
        return false;
      }
      const plugin = this.agentPluginService.plugins.get().find((candidate) => isEqual2(candidate.uri, promptPath.pluginUri));
      const enabledPluginsPolicy = this.configurationService.inspect("chat.plugins.enabledPlugins" /* EnabledPlugins */).policyValue;
      return plugin !== void 0 && isAgentPluginForceEnabledByPolicy(plugin, enabledPluginsPolicy);
    }
    const strictPluginOnly = this.configurationService.getValue(COPILOT_STRICT_PLUGIN_ONLY_CUSTOMIZATION_CONFIG);
    return !isPromptTypeBlocked(strictPluginOnly, "hook" /* hook */) || promptPath.storage !== "local" /* local */ && promptPath.storage !== "user" /* user */;
  }
  // slash prompt commands
  /**
   * Emitter for slash commands change events.
   */
  get onDidChangeSlashCommands() {
    return this.cachedSlashCommands.onDidChangePromise;
  }
  async getPromptSlashCommands(token) {
    const discoveryInfo = await this.cachedSlashCommands.get(token);
    const result = this.slashCommandsFromDiscoveryInfo(discoveryInfo);
    return result;
  }
  /**
   * Computes discovery info for slash commands, combining prompts and skills.
   */
  async computeSlashCommandDiscoveryInfo(token) {
    const stopWatch = StopWatch.create(true);
    const promptFiles = await this.listPromptFiles("prompt" /* prompt */, token);
    const useAgentSkills = this.configurationService.getValue(PromptsConfig.USE_AGENT_SKILLS);
    const skills = useAgentSkills ? await this.listPromptFiles("skill" /* skill */, token) : [];
    const disabledSkills = this.getDisabledPromptFiles("skill" /* skill */);
    const enabledSkills = skills.filter((s) => !disabledSkills.has(s.uri)).sort((a, b) => this.getSkillPriority(a) - this.getSkillPriority(b));
    const slashCommandFiles = [
      ...promptFiles,
      ...enabledSkills
    ];
    const parseResults = await Promise.all(slashCommandFiles.map((promptPath) => this.queueDiscoveryRead(async () => {
      try {
        const parsedPromptFile = await this.parseNew(promptPath.uri, token);
        let rawName;
        if (promptPath.type === "skill" /* skill */) {
          rawName = getSkillFolderName(promptPath.uri);
        } else {
          rawName = parsedPromptFile?.header?.name ?? promptPath.name ?? getCleanPromptName(promptPath.uri);
        }
        const name = promptPath.source === "plugin" /* Plugin */ && promptPath.pluginUri ? getCanonicalPluginCommandId({ uri: promptPath.pluginUri, label: promptPath.pluginLabel }, rawName) : rawName;
        const description = parsedPromptFile?.header?.description ?? promptPath.description;
        const argumentHint = parsedPromptFile?.header?.argumentHint;
        const userInvocable = parsedPromptFile?.header?.userInvocable;
        return { status: "loaded", promptPath: this.withPromptPathMetadata(promptPath, name, description), argumentHint, userInvocable };
      } catch (e4) {
        if (!isCancellationError(e4)) {
          this.logger.error(`[computeSlashCommandDiscoveryInfo] Failed to parse prompt file for slash command: ${promptPath.uri}`, e4 instanceof Error ? e4.message : String(e4));
        }
        return { status: "skipped", skipReason: "parse-error", errorMessage: e4 instanceof Error ? e4.message : String(e4), promptPath };
      }
    })));
    const seenSkillNames = /* @__PURE__ */ new Set();
    const files = [];
    for (const result of parseResults) {
      if (result.status === "loaded" && result.promptPath.type === "skill" /* skill */) {
        const name = result.promptPath.name;
        if (name !== void 0) {
          if (seenSkillNames.has(name)) {
            files.push({ status: "skipped", skipReason: "duplicate-name", promptPath: result.promptPath });
            continue;
          }
          seenSkillNames.add(name);
        }
      }
      files.push(result);
    }
    const promptSourceFolders = await this._collectSourceFolderDiagnostics("prompt" /* prompt */);
    const sourceFolders = [...promptSourceFolders];
    if (useAgentSkills) {
      const skillSourceFolders = await this._collectSourceFolderDiagnostics("skill" /* skill */);
      sourceFolders.push(...skillSourceFolders);
    }
    return { type: "prompt" /* prompt */, files, sourceFolders, durationInMillis: stopWatch.elapsed() };
  }
  /**
   * Derives IChatPromptSlashCommand[] from cached discovery info.
   */
  slashCommandsFromDiscoveryInfo(discoveryInfo) {
    const result = [];
    const seen = new ResourceSet();
    for (const file of discoveryInfo.files) {
      if (file.status === "loaded") {
        result.push(this.asChatPromptSlashCommand(file.argumentHint, file.userInvocable, file.promptPath));
        seen.add(file.promptPath.uri);
      }
    }
    for (const model of this.modelService.getModels()) {
      if (model.getLanguageId() === PROMPT_LANGUAGE_ID && model.uri.scheme === Schemas.untitled && !seen.has(model.uri)) {
        const parsedPromptFile = this.getParsedPromptFile(model);
        const name = parsedPromptFile?.header?.name ?? getCleanPromptName(model.uri);
        const description = parsedPromptFile?.header?.description;
        result.push(this.asChatPromptSlashCommand(parsedPromptFile?.header?.argumentHint, parsedPromptFile?.header?.userInvocable, { uri: model.uri, storage: "local" /* local */, type: "prompt" /* prompt */, name, description }));
      }
    }
    return result;
  }
  isValidSlashCommandName(command4) {
    return command4.match(/^[\p{L}\d_\-\.:]+$/u) !== null;
  }
  hasPromptSlashCommand(name) {
    if (!this.knownPromptSlashCommandsHydrationStarted) {
      this.knownPromptSlashCommandsHydrationStarted = true;
      this.refreshKnownPromptSlashCommandNames();
      this._register(this.onDidChangeSlashCommands(() => this.refreshKnownPromptSlashCommandNames()));
    }
    return this.knownPromptSlashCommandNames.has(name);
  }
  refreshKnownPromptSlashCommandNames() {
    this.getPromptSlashCommands(CancellationToken.None).then((commands) => {
      this.knownPromptSlashCommandNames.clear();
      for (const cmd of commands) {
        this.knownPromptSlashCommandNames.add(cmd.name);
      }
    }, () => {
    });
  }
  async resolvePromptSlashCommand(name, sessionType, token) {
    const commands = await this.getPromptSlashCommands(token);
    const command4 = commands.find((cmd) => cmd.name === name && matchesSessionType(cmd.sessionTypes, sessionType));
    if (command4) {
      return {
        ...command4,
        parsedPromptFile: await this.parseNew(command4.uri, token)
      };
    }
    return void 0;
  }
  asChatPromptSlashCommand(argumentHint, userInvocable, promptPath) {
    let name = promptPath.name ?? getCleanPromptName(promptPath.uri);
    name = name.replace(/[^\p{L}\d_\-\.:]+/gu, "-");
    return {
      uri: promptPath.uri,
      name,
      source: promptPath.source,
      storage: promptPath.storage,
      type: promptPath.type,
      extension: promptPath.extension,
      pluginUri: promptPath.pluginUri,
      pluginLabel: promptPath.pluginLabel,
      description: promptPath.description,
      argumentHint,
      userInvocable: userInvocable ?? true,
      sessionTypes: promptPath.sessionTypes
    };
  }
  async getPromptSlashCommandName(uri4, token) {
    const slashCommands = await this.getPromptSlashCommands(token);
    const slashCommand = slashCommands.find((c) => isEqual2(c.uri, uri4));
    if (!slashCommand) {
      return getCleanPromptName(uri4);
    }
    return slashCommand.name;
  }
  // custom agents
  /**
   * Emitter for custom agents change events.
   */
  get onDidChangeCustomAgents() {
    return this.cachedCustomAgents.onDidChangePromise;
  }
  get onDidChangeInstructions() {
    return this.cachedInstructions.onDidChangePromise;
  }
  get onDidChangeAgentInstructions() {
    return this._onDidChangeAgentInstructions.event;
  }
  async getCustomAgents(token) {
    const discoveryInfo = await this.cachedCustomAgents.get(token);
    const result = this.agentsFromDiscoveryInfo(discoveryInfo);
    return result;
  }
  /**
   * Derives ICustomAgent[] from cached discovery info.
   */
  agentsFromDiscoveryInfo(discoveryInfo) {
    const result = [];
    for (const file of discoveryInfo.files) {
      if (file.agent) {
        result.push(file.agent);
      }
    }
    return result;
  }
  async computeAgentDiscoveryInfo(token) {
    const stopWatch = StopWatch.create(true);
    const allAgentFiles = await this.listPromptFiles("agent" /* agent */, token);
    const disabledAgents = this.getDisabledPromptFiles("agent" /* agent */);
    const useChatHooks = this.configurationService.getValue(PromptsConfig.USE_CHAT_HOOKS);
    const isWorkspaceTrusted = this.workspaceTrustService.isWorkspaceTrusted();
    const userHomeUri = await this.pathService.userHome();
    const userHome = userHomeUri.scheme === Schemas.file ? userHomeUri.fsPath : userHomeUri.path;
    const defaultFolder = this.workspaceService.getWorkspace().folders[0];
    const files = await Promise.all(allAgentFiles.map((promptPath) => this.queueDiscoveryRead(async () => {
      const uri4 = promptPath.uri;
      const isEnabled = !disabledAgents.has(uri4);
      try {
        const ast = await this.parseNew(uri4, token);
        let hooks;
        const hooksRaw = ast.header?.hooksRaw;
        if (useChatHooks && isWorkspaceTrusted && hooksRaw && this.areAgentHooksAllowed(promptPath)) {
          const hookWorkspaceFolder = this.workspaceService.getWorkspaceFolder(uri4) ?? defaultFolder;
          const workspaceRootUri = hookWorkspaceFolder?.uri;
          const target = getTarget("agent" /* agent */, ast.header ?? promptPath.uri);
          hooks = parseSubagentHooksFromYaml(hooksRaw, workspaceRootUri, userHome, target);
        }
        const extra = {
          sessionTypes: promptPath.sessionTypes,
          hooks,
          name: promptPath.name,
          description: promptPath.description,
          source: IAgentSource.fromPromptPath(promptPath),
          enabled: isEnabled
        };
        const agent = CustomAgent.fromParsedPromptFile(ast, extra);
        const status2 = isEnabled ? "loaded" : "skipped";
        const skipReason = isEnabled ? void 0 : "disabled";
        return { status: status2, skipReason, promptPath: this.withPromptPathMetadata(promptPath, agent.name, agent.description), agent };
      } catch (e4) {
        const error = e4 instanceof Error ? e4 : new Error(String(e4));
        if (error instanceof FileOperationError && error.fileOperationResult === 1 /* FILE_NOT_FOUND */) {
          this.logger.warn(`[computeAgentDiscoveryInfo] Skipping agent file that does not exist: ${uri4}`, error.message);
        } else if (!isCancellationError(e4)) {
          this.logger.error(`[computeAgentDiscoveryInfo] Failed to parse agent file: ${uri4}`, error);
        }
        return {
          status: "skipped",
          skipReason: "parse-error",
          errorMessage: error.message,
          promptPath
        };
      }
    })));
    const sourceFolders = await this._collectSourceFolderDiagnostics("agent" /* agent */);
    return { type: "agent" /* agent */, files, sourceFolders, durationInMillis: stopWatch.elapsed() };
  }
  async parseNew(uri4, token) {
    const model = this.modelService.getModel(uri4);
    if (model) {
      return this.getParsedPromptFile(model);
    }
    const fileContent = await this.fileService.readFile(uri4);
    if (token.isCancellationRequested) {
      throw new CancellationError();
    }
    return new PromptFileParser().parse(uri4, fileContent.value.toString());
  }
  registerContributedFile(type, uri4, extension, name, description, when, sessionTypes) {
    return this.extensionPromptFiles.registerContributedFile(type, uri4, extension, name, description, when, sessionTypes);
  }
  getPromptLocationLabel(promptPath) {
    switch (promptPath.storage) {
      case "local" /* local */:
        return this.labelService.getUriLabel(dirname2(promptPath.uri), { relative: true });
      case "user" /* user */:
        return localize(13389, null);
      case "extension" /* extension */: {
        return localize(13387, null, promptPath.extension.displayName ?? promptPath.extension.id);
      }
      case "plugin" /* plugin */:
        return localize(13388, null);
      case "builtin" /* builtIn */:
        return localize(13386, null);
      default:
        assertNever(promptPath, "Unknown prompt storage type");
    }
  }
  async listNestedAgentMDs(token) {
    if (this.areStandalonePromptFilesBlocked("instructions" /* instructions */)) {
      return [];
    }
    const useAgentMD = this.configurationService.getValue(PromptsConfig.USE_AGENT_MD);
    if (!useAgentMD) {
      return [];
    }
    const useNestedAgentMD = this.configurationService.getValue(PromptsConfig.USE_NESTED_AGENT_MD);
    if (useNestedAgentMD) {
      return await this.fileLocator.findAgentMDsInWorkspace(token);
    }
    return [];
  }
  async listAgentInstructions(token, logger) {
    if (this.areStandalonePromptFilesBlocked("instructions" /* instructions */)) {
      return [];
    }
    const resolvedAgentFiles = [];
    const promises = [];
    const includeParents = this.configurationService.getValue(PromptsConfig.USE_CUSTOMIZATIONS_IN_PARENT_REPOS) === true;
    const rootFolders = await this.fileLocator.getWorkspaceFolderRoots(includeParents, logger);
    const rootFiles = [];
    const useAgentMD = this.configurationService.getValue(PromptsConfig.USE_AGENT_MD);
    if (!useAgentMD) {
      logger?.logInfo("Agent MD files are disabled via configuration.");
    } else {
      rootFiles.push({ fileName: AGENT_MD_FILENAME, type: "agentsMd" /* agentsMd */ });
    }
    const useClaudeMD = this.configurationService.getValue(PromptsConfig.USE_CLAUDE_MD);
    if (!useClaudeMD) {
      logger?.logInfo("Claude MD files are disabled via configuration.");
    } else {
      const claudeMdFile = { fileName: CLAUDE_MD_FILENAME, type: "claudeMd" /* claudeMd */ };
      rootFiles.push(claudeMdFile);
      rootFiles.push({ fileName: CLAUDE_LOCAL_MD_FILENAME, type: "claudeMd" /* claudeMd */ });
      promises.push(this.fileLocator.findFilesInRoots(rootFolders, CLAUDE_CONFIG_FOLDER, [claudeMdFile], token, resolvedAgentFiles));
      promises.push(this.fileLocator.findFilesInRoots([await this.pathService.userHome()], CLAUDE_CONFIG_FOLDER, [claudeMdFile], token, resolvedAgentFiles));
    }
    const useCopilotInstructionsFiles = this.configurationService.getValue(PromptsConfig.USE_COPILOT_INSTRUCTION_FILES);
    if (!useCopilotInstructionsFiles) {
      logger?.logInfo("Copilot instructions files are disabled via configuration.");
    } else {
      const copilotInstructionsFile = { fileName: COPILOT_CUSTOM_INSTRUCTIONS_FILENAME, type: "copilotInstructionsMd" /* copilotInstructionsMd */ };
      promises.push(this.fileLocator.findFilesInRoots(rootFolders, GITHUB_CONFIG_FOLDER, [copilotInstructionsFile], token, resolvedAgentFiles));
      promises.push(this.fileLocator.findFilesInRoots([await this.pathService.userHome()], COPILOT_CONFIG_FOLDER, [copilotInstructionsFile], token, resolvedAgentFiles));
    }
    promises.push(this.fileLocator.findFilesInRoots(rootFolders, void 0, rootFiles, token, resolvedAgentFiles));
    await Promise.all(promises);
    if (token.isCancellationRequested) {
      return [];
    }
    const seenFileURI = new ResourceSet();
    const symlinks = [];
    const result = [];
    const add = (file) => {
      if (file.realPath) {
        symlinks.push(file);
      } else {
        result.push(file);
        seenFileURI.add(file.uri);
      }
      return true;
    };
    resolvedAgentFiles.forEach(add);
    for (const symlink of symlinks) {
      if (seenFileURI.has(symlink.realPath)) {
        logger?.logInfo(`Skipping symlinked agent instructions file ${symlink.uri} as target already included: ${symlink.realPath}`);
      } else {
        result.push(symlink);
        seenFileURI.add(symlink.realPath);
      }
    }
    return result.sort((a, b) => a.uri.toString().localeCompare(b.uri.toString()));
  }
  async getVoiceInstructions(token) {
    return this.getSpeechInstructions(VOICE_INSTRUCTIONS_FILENAME, "voice", token);
  }
  async getDictationInstructions(token) {
    return this.getSpeechInstructions(DICTATION_INSTRUCTIONS_FILENAME, "dictation", token);
  }
  async getSpeechInstructions(fileName, kind, token) {
    const userHome = await this.pathService.userHome();
    if (token.isCancellationRequested) {
      return void 0;
    }
    const candidates = [joinPath(userHome, COPILOT_CONFIG_FOLDER, fileName)];
    if (this.workspaceTrustService.isWorkspaceTrusted()) {
      const workspaceRoots = await this.fileLocator.getWorkspaceFolderRoots(false);
      if (token.isCancellationRequested) {
        return void 0;
      }
      candidates.push(...workspaceRoots.map((root) => joinPath(root, GITHUB_CONFIG_FOLDER, fileName)));
    }
    const contents = [];
    for (const candidate of candidates) {
      if (token.isCancellationRequested) {
        return void 0;
      }
      try {
        const content = (await this.fileService.readFile(candidate, void 0, token)).value.toString().trim();
        if (token.isCancellationRequested) {
          return void 0;
        }
        if (content) {
          contents.push(content);
        }
      } catch (error) {
        if (token.isCancellationRequested || isCancellationError(error)) {
          return void 0;
        }
        if (!(error instanceof FileOperationError && error.fileOperationResult === 1 /* FILE_NOT_FOUND */)) {
          this.logger.warn(`[PromptsService] Failed to read ${kind} instructions from ${candidate.toString()}: ${error}`);
        }
      }
    }
    return contents.length > 0 ? contents.join("\n\n") : void 0;
  }
  getAgentFileURIFromModeFile(oldURI) {
    return this.fileLocator.getAgentFileURIFromModeFile(oldURI);
  }
  getDisabledPromptFiles(type) {
    const disabledKey = this.disabledPromptsStorageKeyPrefix + type;
    const value2 = this.storageService.get(disabledKey, 0 /* PROFILE */, "[]");
    const result = new ResourceSet();
    try {
      const arr = JSON.parse(value2);
      if (Array.isArray(arr)) {
        for (const s of arr) {
          try {
            result.add(URI.revive(s));
          } catch {
          }
        }
      }
    } catch {
    }
    return result;
  }
  setDisabledPromptFiles(type, uris) {
    const disabled = Array.from(uris).map((uri4) => uri4.toJSON());
    this.storageService.store(this.disabledPromptsStorageKeyPrefix + type, JSON.stringify(disabled), 0 /* PROFILE */, 0 /* USER */);
    if (type === "agent" /* agent */) {
      this.cachedCustomAgents.refresh();
    } else if (type === "skill" /* skill */) {
      this.cachedSkills.refresh();
      this.cachedSlashCommands.refresh();
    }
  }
  // Agent skills
  sanitizeAgentSkillText(text2) {
    return text2.replace(/<[^>]+>/g, "");
  }
  truncateAgentSkillName(name, uri4) {
    const MAX_NAME_LENGTH = 64;
    const sanitized = this.sanitizeAgentSkillText(name);
    if (sanitized !== name) {
      this.logger.debug(`[findAgentSkills] Agent skill name contains XML tags, removed: ${uri4}`);
    }
    if (sanitized.length > MAX_NAME_LENGTH) {
      this.logger.debug(`[findAgentSkills] Agent skill name exceeds ${MAX_NAME_LENGTH} characters, truncated: ${uri4}`);
      return sanitized.substring(0, MAX_NAME_LENGTH);
    }
    return sanitized;
  }
  truncateAgentSkillDescription(description, uri4) {
    if (!description) {
      return void 0;
    }
    const MAX_DESCRIPTION_LENGTH2 = 1024;
    const sanitized = this.sanitizeAgentSkillText(description);
    if (sanitized !== description) {
      this.logger.debug(`[findAgentSkills] Agent skill description contains XML tags, removed: ${uri4}`);
    }
    if (sanitized.length > MAX_DESCRIPTION_LENGTH2) {
      this.logger.debug(`[findAgentSkills] Agent skill description exceeds ${MAX_DESCRIPTION_LENGTH2} characters, truncated: ${uri4}`);
      return sanitized.substring(0, MAX_DESCRIPTION_LENGTH2);
    }
    return sanitized;
  }
  get onDidChangeSkills() {
    return this.cachedSkills.onDidChangePromise;
  }
  get onDidChangeHooks() {
    return this.cachedHooks.onDidChangePromise;
  }
  async findAgentSkills(token) {
    const useAgentSkills = this.configurationService.getValue(PromptsConfig.USE_AGENT_SKILLS);
    if (!useAgentSkills) {
      return void 0;
    }
    const discoveryInfo = await this.cachedSkills.get(token);
    const result = this.skillsFromDiscoveryInfo(discoveryInfo);
    return result;
  }
  /**
   * Derives IAgentSkill[] from cached discovery info.
   */
  skillsFromDiscoveryInfo(discoveryInfo) {
    const result = [];
    for (const file of discoveryInfo.files) {
      if (file.status === "loaded" && file.promptPath.name) {
        const sanitizedDescription = this.truncateAgentSkillDescription(file.promptPath.description, file.promptPath.uri);
        result.push({
          uri: file.promptPath.uri,
          storage: file.promptPath.storage,
          name: file.promptPath.name,
          description: sanitizedDescription,
          disableModelInvocation: file.disableModelInvocation ?? false,
          userInvocable: file.userInvocable ?? true,
          pluginUri: file.promptPath.pluginUri,
          pluginLabel: file.promptPath.pluginLabel,
          extension: file.promptPath.extension,
          sessionTypes: file.promptPath.sessionTypes
        });
      }
    }
    return result;
  }
  /**
   * Computes the full skill discovery info, including source folders and telemetry.
   */
  async computeSkillDiscovery(token) {
    const stopWatch = StopWatch.create(true);
    const files = await this.computeSkillDiscoveryInfo(token);
    const sourceFolders = await this._collectSourceFolderDiagnostics("skill" /* skill */);
    const skillsBySource = /* @__PURE__ */ new Map();
    for (const file of files) {
      if (file.status === "loaded" && file.promptPath.name) {
        const source = file.promptPath.source;
        if (source) {
          skillsBySource.set(source, (skillsBySource.get(source) || 0) + 1);
        }
      }
    }
    let skippedMissingName = 0;
    let skippedMissingDescription = 0;
    let skippedDuplicateName = 0;
    let skippedParseFailed = 0;
    let skippedNameMismatch = 0;
    for (const file of files) {
      if (file.status === "skipped") {
        switch (file.skipReason) {
          case "missing-name":
            skippedMissingName++;
            break;
          case "missing-description":
            skippedMissingDescription++;
            break;
          case "duplicate-name":
            skippedDuplicateName++;
            break;
          case "name-mismatch":
            skippedNameMismatch++;
            break;
          case "parse-error":
            skippedParseFailed++;
            break;
        }
      }
    }
    const totalSkillsFound = files.filter((f) => f.status === "loaded" && f.promptPath.name).length;
    this.telemetryService.publicLog2("agentSkillsFound", {
      totalSkillsFound,
      claudePersonal: skillsBySource.get("claude-personal" /* ClaudePersonal */) ?? 0,
      claudeWorkspace: skillsBySource.get("claude-workspace" /* ClaudeWorkspace */) ?? 0,
      copilotPersonal: skillsBySource.get("copilot-personal" /* CopilotPersonal */) ?? 0,
      githubWorkspace: skillsBySource.get("github-workspace" /* GitHubWorkspace */) ?? 0,
      agentsPersonal: skillsBySource.get("agents-personal" /* AgentsPersonal */) ?? 0,
      agentsWorkspace: skillsBySource.get("agents-workspace" /* AgentsWorkspace */) ?? 0,
      configWorkspace: skillsBySource.get("config-workspace" /* ConfigWorkspace */) ?? 0,
      configPersonal: skillsBySource.get("config-personal" /* ConfigPersonal */) ?? 0,
      extensionContribution: skillsBySource.get("extension-contribution" /* ExtensionContribution */) ?? 0,
      extensionAPI: skillsBySource.get("extension-api" /* ExtensionAPI */) ?? 0,
      plugin: skillsBySource.get("plugin" /* Plugin */) ?? 0,
      skippedDuplicateName,
      skippedMissingName,
      skippedMissingDescription,
      skippedNameMismatch,
      skippedParseFailed
    });
    return { type: "skill" /* skill */, files, sourceFolders, durationInMillis: stopWatch.elapsed() };
  }
  async getHooks(token) {
    const discoveryInfo = await this.cachedHooks.get(token);
    const result = discoveryInfo.hooksInfo;
    return result;
  }
  async getDiscoveryInfo(type, token) {
    switch (type) {
      case "instructions" /* instructions */:
        return this.cachedInstructions.get(token);
      case "prompt" /* prompt */:
        return this.cachedSlashCommands.get(token);
      case "agent" /* agent */:
        return this.cachedCustomAgents.get(token);
      case "skill" /* skill */:
        return this.cachedSkills.get(token);
      case "hook" /* hook */:
        return this.cachedHooks.get(token);
    }
  }
  async getInstructionFiles(token) {
    const discoveryInfo = await this.cachedInstructions.get(token);
    const result = this.instructionsFromDiscoveryInfo(discoveryInfo);
    return result;
  }
  instructionsFromDiscoveryInfo(discoveryInfo) {
    const result = [];
    for (const file of discoveryInfo.files) {
      if (file.status === "loaded" && file.promptPath.name) {
        result.push({
          uri: file.promptPath.uri,
          storage: file.promptPath.storage,
          extension: file.promptPath.extension,
          pluginUri: file.promptPath.pluginUri,
          source: file.promptPath.source,
          name: file.promptPath.name,
          description: file.promptPath.description,
          pattern: file.pattern,
          sessionTypes: file.promptPath.sessionTypes
        });
      }
    }
    return result;
  }
  withPromptPathMetadata(promptPath, name, description) {
    return { ...promptPath, name, description };
  }
  async computeInstructionFiles(token) {
    return await this.getInstructionsDiscoveryInfo(token);
  }
  async computeHooks(token) {
    const stopWatch = StopWatch.create(true);
    const useChatHooks = this.configurationService.getValue(PromptsConfig.USE_CHAT_HOOKS);
    if (!useChatHooks || !this.workspaceTrustService.isWorkspaceTrusted()) {
      const hookFiles2 = await this.listPromptFiles("hook" /* hook */, token);
      const skipReason = !useChatHooks ? "disabled" : "workspace-untrusted";
      const files2 = hookFiles2.map((promptPath) => ({
        status: "skipped",
        skipReason,
        promptPath: this.withPromptPathMetadata(promptPath, basename2(promptPath.uri), promptPath.description)
      }));
      const sourceFolders2 = await this._collectSourceFolderDiagnostics("hook" /* hook */);
      return { type: "hook" /* hook */, files: files2, sourceFolders: sourceFolders2, hooksInfo: void 0, durationInMillis: stopWatch.elapsed() };
    }
    const useClaudeHooks = this.configurationService.getValue(PromptsConfig.USE_CLAUDE_HOOKS);
    const hookFiles = await this.listPromptFiles("hook" /* hook */, token);
    this.logger.trace(`[PromptsService] Found ${hookFiles.length} hook file(s).`);
    const userHomeUri = await this.pathService.userHome();
    const userHome = userHomeUri.scheme === Schemas.file ? userHomeUri.fsPath : userHomeUri.path;
    const defaultFolder = this.workspaceService.getWorkspace().folders[0];
    const fileResults = await Promise.all(hookFiles.map((hookFile) => this.queueDiscoveryRead(async () => {
      const name = basename2(hookFile.uri);
      if (hookFile.storage === "plugin" /* plugin */) {
        return {
          file: {
            status: "loaded",
            promptPath: this.withPromptPathMetadata(hookFile, name, hookFile.description)
          }
        };
      }
      try {
        const content = await this.fileService.readFile(hookFile.uri);
        const parseErrors = [];
        const json = parse5(content.value.toString(), parseErrors);
        if (parseErrors.length > 0) {
          const first2 = parseErrors[0];
          const message = getParseErrorMessage(first2.error) || "Invalid JSON";
          return {
            file: {
              status: "skipped",
              skipReason: "parse-error",
              errorMessage: `${message} at offset ${first2.offset}`,
              promptPath: this.withPromptPathMetadata(hookFile, name, hookFile.description)
            }
          };
        }
        if (!json || typeof json !== "object") {
          return {
            file: {
              status: "skipped",
              skipReason: "parse-error",
              errorMessage: "Invalid hooks file: must be a JSON object",
              promptPath: this.withPromptPathMetadata(hookFile, name, hookFile.description)
            }
          };
        }
        const hookWorkspaceFolder = this.workspaceService.getWorkspaceFolder(hookFile.uri) ?? defaultFolder;
        const workspaceRootUri = hookWorkspaceFolder?.uri;
        const { format: format5, hooks: parsedHooks, disabledAllHooks } = parseHooksFromFile(hookFile.uri, json, workspaceRootUri, userHome);
        if (disabledAllHooks) {
          this.logger.trace(`[PromptsService] Skipping hook file with disableAllHooks: ${hookFile.uri}`);
          return {
            file: {
              status: "skipped",
              skipReason: "all-hooks-disabled",
              promptPath: this.withPromptPathMetadata(hookFile, name, hookFile.description)
            }
          };
        }
        if (format5 === "claude" /* Claude */ && useClaudeHooks === false) {
          const hasAnyCommands = [...parsedHooks.values()].some(({ hooks: cmds }) => cmds.length > 0);
          this.logger.trace(`[PromptsService] Skipping Claude hook file (disabled via setting): ${hookFile.uri}`);
          return {
            file: {
              status: "skipped",
              skipReason: "claude-hooks-disabled",
              promptPath: this.withPromptPathMetadata(hookFile, name, hookFile.description)
            },
            hasDisabledClaudeHooks: hasAnyCommands
          };
        }
        const hooks = /* @__PURE__ */ new Map();
        for (const [hookType, { hooks: commands }] of parsedHooks) {
          for (const command4 of commands) {
            let bucket = hooks.get(hookType);
            if (!bucket) {
              bucket = [];
              hooks.set(hookType, bucket);
            }
            bucket.push(command4);
            this.logger.trace(`[PromptsService] Collected ${hookType} hook from ${hookFile.uri} (format: ${format5})`);
          }
        }
        return {
          file: { status: "loaded", promptPath: this.withPromptPathMetadata(hookFile, name, hookFile.description) },
          hooks,
          sourceUri: hookFile.uri
        };
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        this.logger.warn(`[PromptsService] Failed to parse hook file: ${hookFile.uri}`, error);
        return {
          file: {
            status: "skipped",
            skipReason: "parse-error",
            errorMessage: msg,
            promptPath: this.withPromptPathMetadata(hookFile, name, hookFile.description)
          }
        };
      }
    })));
    const files = [];
    let hasDisabledClaudeHooks = false;
    const collectedHooks = /* @__PURE__ */ new Map();
    for (const { file, hooks, sourceUri, hasDisabledClaudeHooks: disabled } of fileResults) {
      if (file) {
        files.push(file);
      }
      if (disabled) {
        hasDisabledClaudeHooks = true;
      }
      if (hooks && sourceUri) {
        for (const [hookType, commands] of hooks) {
          let bucket = collectedHooks.get(hookType);
          if (!bucket) {
            bucket = [];
            collectedHooks.set(hookType, bucket);
          }
          for (const command4 of commands) {
            bucket.push({ ...command4, sourceUri });
          }
        }
      }
    }
    const plugins = this.agentPluginService.plugins.get();
    const managedHooksOnlyValue = this.configurationService.getValue(COPILOT_ALLOW_MANAGED_HOOKS_ONLY_CONFIG) === true;
    const enabledPluginsPolicyValue = this.configurationService.inspect("chat.plugins.enabledPlugins" /* EnabledPlugins */).policyValue;
    for (const plugin of plugins) {
      if (!isContributionEnabled(plugin.enablement.get()) || managedHooksOnlyValue && !isAgentPluginForceEnabledByPolicy(plugin, enabledPluginsPolicyValue)) {
        continue;
      }
      for (const hook of plugin.hooks.get()) {
        let bucket = collectedHooks.get(hook.type);
        if (!bucket) {
          bucket = [];
          collectedHooks.set(hook.type, bucket);
        }
        for (const command4 of hook.hooks) {
          bucket.push({ ...command4, sourceUri: hook.uri });
        }
      }
    }
    const sourceFolders = await this._collectSourceFolderDiagnostics("hook" /* hook */);
    if (collectedHooks.size === 0) {
      this.logger.trace("[PromptsService] No valid hooks collected.");
      return { type: "hook" /* hook */, files, sourceFolders, hooksInfo: void 0, durationInMillis: stopWatch.elapsed() };
    }
    const result = Object.fromEntries(collectedHooks);
    this.logger.trace(`[PromptsService] Collected hooks: ${JSON.stringify(Object.keys(result))}`);
    return { type: "hook" /* hook */, files, sourceFolders, hooksInfo: { hooks: result, hasDisabledClaudeHooks }, durationInMillis: stopWatch.elapsed() };
  }
  /**
   * Precedence used when deduplicating skills that share the same canonical
   * name: workspace > personal > plugin > extension API > extension contribution.
   * Lower numbers win.
   */
  getSkillPriority(skill) {
    if (skill.storage === "local" /* local */) {
      return 0;
    }
    if (skill.storage === "user" /* user */) {
      return 1;
    }
    if (skill.storage === "plugin" /* plugin */) {
      return 2;
    }
    if (skill.source === "extension-api" /* ExtensionAPI */) {
      return 3;
    }
    if (skill.source === "extension-contribution" /* ExtensionContribution */) {
      return 4;
    }
    return 5;
  }
  /**
   * Returns the discovery results for skill files.
   */
  async computeSkillDiscoveryInfo(token) {
    const files = [];
    const seenNames = /* @__PURE__ */ new Set();
    const nameToUri = /* @__PURE__ */ new Map();
    const allSkills = [];
    const standaloneSkills = this.areStandalonePromptFilesBlocked("skill" /* skill */) ? [] : await this.fileLocator.findAgentSkills(token);
    const skills = await Promise.all([
      Promise.resolve(standaloneSkills),
      this.getExtensionPromptFiles("skill" /* skill */, token),
      Promise.resolve(this._pluginPromptFilesByType.get("skill" /* skill */) ?? []),
      this.getBuiltinPromptFiles("skill" /* skill */, token)
    ]);
    for (const skillList of skills) {
      allSkills.push(...skillList);
    }
    allSkills.sort((a, b) => this.getSkillPriority(a) - this.getSkillPriority(b));
    for (const skill of allSkills) {
      const uri4 = skill.uri;
      const promptPath = skill;
      try {
        const parsedFile = await this.parseNew(uri4, token);
        const folderName = getSkillFolderName(uri4);
        let name = parsedFile.header?.name;
        const description = parsedFile.header?.description;
        if (!name) {
          this.logger.debug(`[computeSkillDiscoveryInfo] Agent skill file missing name attribute, using folder name "${folderName}": ${uri4}`);
          name = folderName;
        }
        let sanitizedName = this.truncateAgentSkillName(name, uri4);
        if (sanitizedName !== folderName) {
          this.logger.debug(`[computeSkillDiscoveryInfo] Agent skill name "${sanitizedName}" does not match folder name "${folderName}", using folder name: ${uri4}`);
          sanitizedName = folderName;
        }
        if (seenNames.has(sanitizedName)) {
          this.logger.debug(`[computeSkillDiscoveryInfo] Skipping duplicate agent skill name: ${sanitizedName} at ${uri4}`);
          files.push({ status: "skipped", skipReason: "duplicate-name", duplicateOf: nameToUri.get(sanitizedName), promptPath: this.withPromptPathMetadata(promptPath, sanitizedName, description) });
          continue;
        }
        seenNames.add(sanitizedName);
        nameToUri.set(sanitizedName, uri4);
        const disableModelInvocation = parsedFile.header?.disableModelInvocation === true;
        const userInvocable = parsedFile.header?.userInvocable !== false;
        files.push({ status: "loaded", promptPath: this.withPromptPathMetadata(promptPath, sanitizedName, description), disableModelInvocation, userInvocable });
      } catch (e4) {
        const msg = e4 instanceof Error ? e4.message : String(e4);
        this.logger.error(`[computeSkillDiscoveryInfo] Failed to validate Agent skill file: ${uri4}`, msg);
        files.push({
          status: "skipped",
          skipReason: "parse-error",
          errorMessage: msg,
          promptPath
        });
      }
    }
    return files;
  }
  async getInstructionsDiscoveryInfo(token) {
    const stopWatch = StopWatch.create(true);
    const files = [];
    const instructionsFiles = await this.listPromptFiles("instructions" /* instructions */, token);
    for (const promptPath of instructionsFiles) {
      const uri4 = promptPath.uri;
      try {
        const parsedPromptFile = await this.parseNew(uri4, token);
        const name = parsedPromptFile?.header?.name ?? promptPath.name ?? getCleanPromptName(uri4);
        const description = parsedPromptFile?.header?.description ?? promptPath.description;
        const pattern = evaluateApplyToPattern(parsedPromptFile.header, isInClaudeRulesFolder(uri4));
        files.push({
          status: "loaded",
          pattern,
          promptPath: this.withPromptPathMetadata(promptPath, name, description)
        });
      } catch (e4) {
        files.push({
          status: "skipped",
          skipReason: "parse-error",
          errorMessage: e4 instanceof Error ? e4.message : String(e4),
          promptPath
        });
      }
    }
    const sourceFolders = await this._collectSourceFolderDiagnostics("instructions" /* instructions */);
    return { type: "instructions" /* instructions */, files, sourceFolders, durationInMillis: stopWatch.elapsed() };
  }
};

PromptsService = __decorateClass([
  __decorateParam(0, ILogService),
  __decorateParam(1, ILabelService),
  __decorateParam(2, IModelService),
  __decorateParam(3, IInstantiationService),
  __decorateParam(4, IUserDataProfileService),
  __decorateParam(5, IConfigurationService),
  __decorateParam(6, IFileService),
  __decorateParam(7, IStorageService),
  __decorateParam(8, ITelemetryService),
  __decorateParam(9, IWorkspaceContextService),
  __decorateParam(10, IPathService),
  __decorateParam(11, IAgentPluginService),
  __decorateParam(12, IWorkspaceTrustManagementService)
], PromptsService);

var CachedPromise = class extends Disposable {
  constructor(computeFn, getEvent, delay = 0) {
    super();
    this.computeFn = computeFn;
    this.getEvent = getEvent;
    this.delay = delay;
    this.cachedPromise = void 0;
    this.cachedPool = void 0;
    this.onDidUpdatePromiseEmitter = this._register(new Emitter());
    const delayer5 = this._register(new Delayer(this.delay));
    this._register(this.getEvent()(() => {
      this.cachedPromise = void 0;
      delayer5.trigger(() => this.onDidUpdatePromiseEmitter.fire());
    }));
  }
  get onDidChangePromise() {
    return this.onDidUpdatePromiseEmitter.event;
  }
  get(token) {
    if (this.cachedPool?.token.isCancellationRequested) {
      this.cachedPromise = void 0;
      this.cachedPool = void 0;
    }
    let pool = this.cachedPool;
    if (this.cachedPromise === void 0) {
      pool = new CancellationTokenPool();
      const promise = this.computeFn(pool.token).catch((err) => {
        if (this.cachedPromise === promise) {
          this.cachedPromise = void 0;
        }
        throw err;
      });
      promise.finally(() => {
        if (this.cachedPool === pool) {
          this.cachedPool = void 0;
        }
        pool.dispose();
      });
      this.cachedPromise = promise;
      this.cachedPool = pool;
    }
    pool?.add(token);
    return raceCancellationError(this.cachedPromise, token);
  }
  refresh() {
    this.cachedPromise = void 0;
    this.onDidUpdatePromiseEmitter?.fire();
  }
};

var ModelChangeTracker = class extends Disposable {
  constructor(modelService) {
    super();
    this.listeners = new ResourceMap();
    this.onDidPromptModelChange = this._register(new Emitter());
    const onAdd = (model) => {
      const promptType = getPromptsTypeForLanguageId(model.getLanguageId());
      if (promptType !== void 0) {
        this.listeners.set(model.uri, model.onDidChangeContent(() => this.onDidPromptModelChange.fire({ uri: model.uri, promptType })));
      }
      return promptType;
    };
    const onRemove = (languageId, uri4) => {
      const promptType = getPromptsTypeForLanguageId(languageId);
      if (promptType !== void 0) {
        this.listeners.get(uri4)?.dispose();
        this.listeners.delete(uri4);
      }
      return promptType;
    };
    this._register(modelService.onModelAdded((model) => onAdd(model)));
    this._register(modelService.onModelLanguageChanged((e4) => {
      const removedPromptType = onRemove(e4.oldLanguageId, e4.model.uri);
      const addedPromptType = onAdd(e4.model);
      if (removedPromptType !== addedPromptType) {
        if (removedPromptType) {
          this.onDidPromptModelChange.fire({ uri: e4.model.uri, promptType: removedPromptType });
        }
        if (addedPromptType) {
          this.onDidPromptModelChange.fire({ uri: e4.model.uri, promptType: addedPromptType });
        }
      }
    }));
    this._register(modelService.onModelRemoved((model) => onRemove(model.getLanguageId(), model.uri)));
  }
  get onDidPromptChange() {
    return this.onDidPromptModelChange.event;
  }
  dispose() {
    super.dispose();
    this.listeners.forEach((listener) => listener.dispose());
    this.listeners.clear();
  }
};

var CustomAgent;

((CustomAgent2) => {
  function fromParsedPromptFile(ast, extra) {
    const uri4 = ast.uri;
    const { hooks, sessionTypes, enabled } = extra;
    let metadata;
    if (ast.header) {
      const advanced = ast.header.getAttribute(PromptHeaderAttributes.advancedOptions);
      if (advanced && advanced.value.type === "map") {
        metadata = {};
        for (const [key3, value2] of Object.entries(advanced.value)) {
          if (value2.type === "scalar") {
            metadata[key3] = value2;
          }
        }
      }
    }
    const toolReferences = [];
    if (ast.body) {
      const bodyOffset = ast.body.offset;
      const bodyVarRefs = ast.body.variableReferences;
      for (let i2 = bodyVarRefs.length - 1; i2 >= 0; i2--) {
        const { name: name2, offset, fullLength } = bodyVarRefs[i2];
        const range2 = new OffsetRange(offset - bodyOffset, offset - bodyOffset + fullLength);
        toolReferences.push({ name: name2, range: range2 });
      }
    }
    const agentInstructions = { content: ast.body?.getContent() ?? "", toolReferences, metadata };
    const name = ast.header?.name ?? extra.name ?? getCleanPromptName(uri4);
    const description = ast.header?.description ?? extra.description;
    const target = getTarget("agent" /* agent */, ast.header ?? uri4);
    const id2 = uri4.toString();
    const source = extra.source;
    if (!ast.header) {
      return { id: id2, uri: uri4, name, agentInstructions, source, target, visibility: { userInvocable: true, agentInvocable: true }, sessionTypes, hooks, enabled };
    }
    const visibility = {
      userInvocable: ast.header.userInvocable !== false,
      agentInvocable: ast.header.infer !== void 0 ? ast.header.infer === true : ast.header.disableModelInvocation !== true
    };
    let model = ast.header.model;
    if (target === "claude" /* Claude */ && model) {
      model = mapClaudeModels(model);
    }
    let { tools, handOffs, argumentHint, agents } = ast.header;
    if (target === "claude" /* Claude */ && tools) {
      tools = mapClaudeTools(tools);
    }
    return { id: id2, uri: uri4, name, description, model, tools, handOffs, argumentHint, target, visibility, agents, agentInstructions, source, sessionTypes, hooks, enabled };
  }
  CustomAgent2.fromParsedPromptFile = fromParsedPromptFile;
})(CustomAgent || (CustomAgent = {}));
export { PROMPT_FILE_DISCOVERY_CONCURRENCY, PromptsService, CachedPromise, ModelChangeTracker, CustomAgent };
