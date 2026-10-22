// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/mcp/common/mcpRegistry.ts
import { Disposable, DisposableStore } from "./module-0012.mjs";
import { observableValue } from "./module-0048.mjs";
import { derived } from "./module-0054.mjs";
import { Lazy } from "./module-0028.mjs";
import { McpRegistryInputStorage } from "./module-2854.mjs";
import { Emitter } from "./module-0017.mjs";
import { observableConfigValue } from "./module-0444.mjs";
import { mcpAccessConfig } from "./module-1196.mjs";
import { COPILOT_STRICT_PLUGIN_ONLY_CUSTOMIZATION_CONFIG } from "./module-0956.mjs";
import { ConfigurationResolverExpression } from "./module-1405.mjs";
import { McpServerLaunch, McpServerTrust, McpStartServerInteraction, UserInteractionRequiredError } from "./module-1206.mjs";
import { localize } from "./module-0001.mjs";
import { assertNever } from "./module-0009.mjs";
import { autorunSelfDisposable } from "./module-0052.mjs";
import { Iterable } from "./module-0011.mjs";
import { isDefined } from "./module-0010.mjs";
import { ExtensionIdentifier } from "./module-0688.mjs";
import { Codicon } from "./module-0085.mjs";
import { MarkdownString } from "./module-0462.mjs";
import { AUX_WINDOW_GROUP, IEditorService } from "./module-0935.mjs";
import { URI } from "./module-0032.mjs";
import { isStrictPluginOnlyCustomizationEnabled } from "./module-1021.mjs";
import { IMcpDevModeDebugging } from "./module-2304.mjs";
import { INotificationService, Severity2 } from "./module-0336.mjs";
import { McpServerConnection } from "./module-2858.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IConfigurationResolverService } from "./module-1404.mjs";
import { IDialogService } from "./module-0267.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IQuickInputService } from "./module-0536.mjs";
import { ILabelService } from "./module-0641.mjs";
import { ILogService } from "./module-0095.mjs";
import { IMcpSandboxService } from "./module-2306.mjs";
import { IWorkspaceTrustManagementService, IWorkspaceTrustRequestService } from "./module-0854.mjs";


// src/vs/workbench/contrib/mcp/common/mcpRegistry.ts
var notTrustedNonce = "__vscode_not_trusted";

var McpRegistry = class extends Disposable {
  constructor(_instantiationService, _configurationResolverService, _dialogService, _notificationService, _editorService, configurationService, _quickInputService, _labelService, _logService, _mcpSandboxService, _workspaceTrustManagementService, _workspaceTrustRequestService) {
    super();
    this._instantiationService = _instantiationService;
    this._configurationResolverService = _configurationResolverService;
    this._dialogService = _dialogService;
    this._notificationService = _notificationService;
    this._editorService = _editorService;
    this._quickInputService = _quickInputService;
    this._labelService = _labelService;
    this._logService = _logService;
    this._mcpSandboxService = _mcpSandboxService;
    this._workspaceTrustManagementService = _workspaceTrustManagementService;
    this._workspaceTrustRequestService = _workspaceTrustRequestService;
    this._collections = observableValue("collections", []);
    this._delegates = observableValue("delegates", []);
    this.collections = derived((reader) => {
      if (this._mcpAccessValue.read(reader) === "none" /* None */) {
        return [];
      }
      const strictPluginOnly = this._strictPluginOnlyCustomization.read(reader);
      return this._collections.read(reader).filter((collection) => this.isCollectionAllowed(collection, strictPluginOnly));
    });
    this._workspaceStorage = new Lazy(() => this._register(this._instantiationService.createInstance(McpRegistryInputStorage, 1 /* WORKSPACE */, 0 /* USER */)));
    this._profileStorage = new Lazy(() => this._register(this._instantiationService.createInstance(McpRegistryInputStorage, 0 /* PROFILE */, 0 /* USER */)));
    this._ongoingLazyActivations = observableValue(this, 0);
    this.lazyCollectionState = derived((reader) => {
      if (this._mcpAccessValue.read(reader) === "none" /* None */) {
        return { state: 2 /* AllKnown */, collections: [] };
      }
      if (this._ongoingLazyActivations.read(reader) > 0) {
        return { state: 1 /* LoadingUnknown */, collections: [] };
      }
      const strictPluginOnly = this._strictPluginOnlyCustomization.read(reader);
      const collections = this._collections.read(reader).filter((collection) => this.isCollectionAllowed(collection, strictPluginOnly));
      const hasUnknown = collections.some((c) => c.lazy && c.lazy.isCached === false);
      return hasUnknown ? { state: 0 /* HasUnknown */, collections: collections.filter((c) => c.lazy && c.lazy.isCached === false) } : { state: 2 /* AllKnown */, collections: [] };
    });
    this._onDidChangeInputs = this._register(new Emitter());
    this.onDidChangeInputs = this._onDidChangeInputs.event;
    this._mcpAccessValue = observableConfigValue(mcpAccessConfig, "all" /* All */, configurationService);
    this._strictPluginOnlyCustomization = observableConfigValue(COPILOT_STRICT_PLUGIN_ONLY_CUSTOMIZATION_CONFIG, void 0, configurationService);
  }
  get delegates() {
    return this._delegates;
  }
  registerDelegate(delegate) {
    const delegates = this._delegates.get().slice();
    delegates.push(delegate);
    delegates.sort((a, b) => b.priority - a.priority);
    this._delegates.set(delegates, void 0);
    return {
      dispose: () => {
        const delegates2 = this._delegates.get().filter((d) => d !== delegate);
        this._delegates.set(delegates2, void 0);
      }
    };
  }
  registerCollection(collection) {
    const currentCollections = this._collections.get();
    const toReplace = currentCollections.find((c) => c.id === collection.id);
    if (toReplace && !toReplace.lazy) {
      return Disposable.None;
    } else if (toReplace) {
      this._collections.set(currentCollections.map((c) => c === toReplace ? collection : c), void 0);
    } else {
      this._collections.set([...currentCollections, collection].sort((a, b) => a.order - b.order), void 0);
    }
    return {
      dispose: () => {
        const currentCollections2 = this._collections.get();
        this._collections.set(currentCollections2.filter((c) => c !== collection), void 0);
      }
    };
  }
  getServerDefinition(collectionRef, definitionRef) {
    const collectionObs = this._collections.map((cols) => cols.find((c) => c.id === collectionRef.id));
    return collectionObs.map((collection, reader) => {
      if (collection && !this.isCollectionAllowed(collection, this._strictPluginOnlyCustomization.read(reader))) {
        return { collection: void 0, server: void 0 };
      }
      const server = collection?.serverDefinitions.read(reader).find((s) => s.id === definitionRef.id);
      return { collection, server };
    });
  }
  async discoverCollections() {
    const strictPluginOnly = this._strictPluginOnlyCustomization.get();
    const toDiscover = this._collections.get().filter((c) => this.isCollectionAllowed(c, strictPluginOnly) && c.lazy && !c.lazy.isCached);
    this._ongoingLazyActivations.set(this._ongoingLazyActivations.get() + 1, void 0);
    await Promise.all(toDiscover.map((c) => c.lazy?.load())).finally(() => {
      this._ongoingLazyActivations.set(this._ongoingLazyActivations.get() - 1, void 0);
    });
    const found = [];
    const current = this._collections.get();
    for (const collection of toDiscover) {
      const rec = current.find((c) => c.id === collection.id);
      if (!rec) {
      } else if (rec.lazy) {
        rec.lazy.removed?.();
      } else {
        found.push(rec);
      }
    }
    return found;
  }
  _getInputStorage(scope) {
    return scope === 1 /* WORKSPACE */ ? this._workspaceStorage.value : this._profileStorage.value;
  }
  _getInputStorageInConfigTarget(configTarget) {
    return this._getInputStorage(
      configTarget === 5 /* WORKSPACE */ || configTarget === 6 /* WORKSPACE_FOLDER */ ? 1 /* WORKSPACE */ : 0 /* PROFILE */
    );
  }
  async clearSavedInputs(scope, inputId) {
    const storage = this._getInputStorage(scope);
    if (inputId) {
      await storage.clear(inputId);
    } else {
      storage.clearAll();
    }
    this._onDidChangeInputs.fire();
  }
  async editSavedInput(inputId, folderData, configSection, target) {
    const storage = this._getInputStorageInConfigTarget(target);
    const expr = ConfigurationResolverExpression.parse(inputId);
    const stored = await storage.getMap();
    const previous = stored[inputId].value;
    await this._configurationResolverService.resolveWithInteraction(folderData, expr, configSection, previous ? { [inputId.slice(2, -1)]: previous } : {}, target);
    await this._updateStorageWithExpressionInputs(storage, expr);
  }
  async setSavedInput(inputId, target, value2) {
    const storage = this._getInputStorageInConfigTarget(target);
    const expr = ConfigurationResolverExpression.parse(inputId);
    for (const unresolved of expr.unresolved()) {
      expr.resolve(unresolved, value2);
      break;
    }
    await this._updateStorageWithExpressionInputs(storage, expr);
  }
  getSavedInputs(scope) {
    return this._getInputStorage(scope).getMap();
  }
  async _checkTrust(collection, definition, {
    trustNonceBearer,
    interaction,
    promptType = "only-new",
    autoTrustChanges = false,
    errorOnUserInteraction = false
  }) {
    if (collection.scope === 1 /* WORKSPACE */ && !this._workspaceTrustManagementService.isWorkspaceTrusted()) {
      if (errorOnUserInteraction) {
        throw new UserInteractionRequiredError("workspaceTrust");
      } else if (!await this._workspaceTrustRequestService.requestWorkspaceTrust({ message: localize(17167, null) })) {
        return false;
      }
    }
    if (collection.trustBehavior === McpServerTrust.Kind.Trusted) {
      this._logService.trace(`MCP server ${definition.id} is trusted, no trust prompt needed`);
      return true;
    } else if (collection.trustBehavior === McpServerTrust.Kind.TrustedOnNonce) {
      if (definition.cacheNonce === trustNonceBearer.trustedAtNonce) {
        this._logService.trace(`MCP server ${definition.id} is unchanged, no trust prompt needed`);
        return true;
      }
      if (autoTrustChanges) {
        this._logService.trace(`MCP server ${definition.id} is was changed but user explicitly executed`);
        trustNonceBearer.trustedAtNonce = definition.cacheNonce;
        return true;
      }
      if (trustNonceBearer.trustedAtNonce === notTrustedNonce) {
        if (promptType === "all-untrusted") {
          if (errorOnUserInteraction) {
            throw new UserInteractionRequiredError("serverTrust");
          }
          return this._promptForTrust(definition, collection, interaction, trustNonceBearer);
        } else {
          this._logService.trace(`MCP server ${definition.id} is untrusted, denying trust prompt`);
          return false;
        }
      }
      if (promptType === "never") {
        this._logService.trace(`MCP server ${definition.id} trust state is unknown, skipping prompt`);
        return false;
      }
      if (errorOnUserInteraction) {
        throw new UserInteractionRequiredError("serverTrust");
      }
      const didTrust = await this._promptForTrust(definition, collection, interaction, trustNonceBearer);
      if (didTrust) {
        return true;
      }
      if (didTrust === void 0) {
        return void 0;
      }
      trustNonceBearer.trustedAtNonce = notTrustedNonce;
      return false;
    } else {
      assertNever(collection.trustBehavior);
    }
  }
  async _promptForTrust(definition, collection, interaction, trustNonceBearer) {
    interaction ??= new McpStartServerInteraction();
    interaction.participants.set(definition.id, { s: "waiting", definition, collection });
    const trustedDefinitionIds = await new Promise((resolve3) => {
      autorunSelfDisposable((reader) => {
        const map = interaction.participants.observable.read(reader);
        if (Iterable.some(map.values(), (p) => p.s === "unknown")) {
          return;
        }
        reader.dispose();
        interaction.choice ??= this._promptForTrustOpenDialog(
          [...map.values()].map((v2) => v2.s === "waiting" ? v2 : void 0).filter(isDefined)
        );
        resolve3(interaction.choice);
      });
    });
    this._logService.trace(`MCP trusted servers:`, trustedDefinitionIds);
    if (trustedDefinitionIds) {
      trustNonceBearer.trustedAtNonce = trustedDefinitionIds.includes(definition.id) ? definition.cacheNonce : notTrustedNonce;
    }
    return !!trustedDefinitionIds?.includes(definition.id);
  }
  /**
   * Confirms with the user which of the provided definitions should be trusted.
   * Returns undefined if the user cancelled the flow, or the list of trusted
   * definition IDs otherwise.
   */
  async _promptForTrustOpenDialog(definitions3) {
    function labelFor(r2) {
      const originURI = r2.definition.presentation?.origin?.uri || r2.collection.presentation?.origin;
      let labelWithOrigin = originURI ? `[\`${r2.definition.label}\`](${originURI})` : "`" + r2.definition.label + "`";
      if (r2.collection.source instanceof ExtensionIdentifier) {
        labelWithOrigin += ` (${localize(17168, null, r2.collection.source.value)})`;
      }
      return labelWithOrigin;
    }
    if (definitions3.length === 1) {
      const def2 = definitions3[0];
      const originURI = def2.definition.presentation?.origin?.uri;
      const { result: result2 } = await this._dialogService.prompt(
        {
          message: localize(17169, null, def2.definition.label),
          custom: {
            icon: Codicon.shield,
            markdownDetails: [{
              markdown: new MarkdownString(localize(17162, null, labelFor(def2))),
              actionHandler: () => {
                const editor = this._editorService.openEditor({ resource: originURI }, AUX_WINDOW_GROUP);
                return editor.then(Boolean);
              }
            }]
          },
          buttons: [
            { label: localize(17166, null), run: () => true },
            { label: localize(17164, null), run: () => false }
          ]
        }
      );
      return result2 === void 0 ? void 0 : result2 ? [def2.definition.id] : [];
    }
    const list2 = definitions3.map((d) => `- ${labelFor(d)}`).join("\n");
    const { result } = await this._dialogService.prompt(
      {
        message: localize(17170, null, definitions3.length),
        custom: {
          icon: Codicon.shield,
          markdownDetails: [{
            markdown: new MarkdownString(localize(17163, null, list2)),
            actionHandler: (uri4) => {
              const editor = this._editorService.openEditor({ resource: URI.parse(uri4) }, AUX_WINDOW_GROUP);
              return editor.then(Boolean);
            }
          }]
        },
        buttons: [
          { label: localize(17166, null), run: () => "all" },
          { label: localize(17165, null), run: () => "pick" },
          { label: localize(17164, null), run: () => "none" }
        ]
      }
    );
    if (result === void 0) {
      return void 0;
    } else if (result === "all") {
      return definitions3.map((d) => d.definition.id);
    } else if (result === "none") {
      return [];
    }
    function isActionableButton(obj) {
      return typeof obj.action === "function";
    }
    const store = new DisposableStore();
    const picker = store.add(this._quickInputService.createQuickPick({ useSeparators: false }));
    picker.canSelectMany = true;
    picker.items = definitions3.map(({ definition, collection }) => {
      const buttons = [];
      if (definition.presentation?.origin) {
        const origin = definition.presentation.origin;
        buttons.push({
          iconClass: "codicon-go-to-file",
          tooltip: "Go to Definition",
          action: () => this._editorService.openEditor({ resource: origin.uri, options: { selection: origin.range } })
        });
      }
      return {
        type: "item",
        label: definition.label,
        definitonId: definition.id,
        description: collection.source instanceof ExtensionIdentifier ? collection.source.value : definition.presentation?.origin ? this._labelService.getUriLabel(definition.presentation.origin.uri) : void 0,
        picked: false,
        buttons
      };
    });
    picker.placeholder = "Select MCP servers to trust";
    picker.ignoreFocusOut = true;
    store.add(picker.onDidTriggerItemButton((e4) => {
      if (isActionableButton(e4.button)) {
        e4.button.action();
      }
    }));
    return new Promise((resolve3) => {
      store.add(picker.onDidAccept(() => {
        resolve3(picker.selectedItems.map((item) => item.definitonId));
        picker.hide();
      }));
      store.add(picker.onDidHide(() => {
        resolve3(void 0);
      }));
      picker.show();
    }).finally(() => store.dispose());
  }
  async _updateStorageWithExpressionInputs(inputStorage, expr) {
    const secrets = {};
    const inputs = {};
    for (const [replacement, resolved] of expr.resolved()) {
      if (resolved.input?.type === "promptString" && resolved.input.password) {
        secrets[replacement.id] = resolved;
      } else {
        inputs[replacement.id] = resolved;
      }
    }
    inputStorage.setPlainText(inputs);
    await inputStorage.setSecrets(secrets);
    this._onDidChangeInputs.fire();
  }
  async _replaceVariablesInLaunch(delegate, definition, launch, errorOnUserInteraction) {
    if (!definition.variableReplacement) {
      return launch;
    }
    const { section, target, folder } = definition.variableReplacement;
    const inputStorage = this._getInputStorageInConfigTarget(target);
    const [previouslyStored, withRemoteFilled] = await Promise.all([
      inputStorage.getMap(),
      delegate.substituteVariables(definition, launch)
    ]);
    const expr = ConfigurationResolverExpression.parse(McpServerLaunch.toSerialized(withRemoteFilled));
    for (const replacement of expr.unresolved()) {
      if (previouslyStored.hasOwnProperty(replacement.id)) {
        expr.resolve(replacement, previouslyStored[replacement.id]);
      }
    }
    if (errorOnUserInteraction) {
      const unresolved = Array.from(expr.unresolved());
      if (unresolved.length > 0) {
        throw new UserInteractionRequiredError("variables");
      }
    }
    await this._configurationResolverService.resolveWithInteraction(folder, expr, section, void 0, target);
    await this._updateStorageWithExpressionInputs(inputStorage, expr);
    const resolved = await this._configurationResolverService.resolveAsync(folder, expr);
    return McpServerLaunch.fromSerialized(resolved);
  }
  isCollectionAllowed(collection, strictPluginOnly) {
    return !isStrictPluginOnlyCustomizationEnabled(strictPluginOnly) || collection.provenance === "plugin" /* Plugin */;
  }
  async resolveConnection(opts) {
    const { collectionRef, definitionRef, interaction, logger, debug } = opts;
    let collection = this._collections.get().find((c) => c.id === collectionRef.id);
    if (collection && !this.isCollectionAllowed(collection, this._strictPluginOnlyCustomization.get())) {
      throw new Error(`MCP collection ${collectionRef.id} is blocked by enterprise customization policy`);
    }
    if (collection?.lazy) {
      await collection.lazy.load();
      collection = this._collections.get().find((c) => c.id === collectionRef.id);
    }
    if (collection && !this.isCollectionAllowed(collection, this._strictPluginOnlyCustomization.get())) {
      throw new Error(`MCP collection ${collectionRef.id} is blocked by enterprise customization policy`);
    }
    const definition = collection?.serverDefinitions.get().find((s) => s.id === definitionRef.id);
    if (!collection || !definition) {
      throw new Error(`Collection or definition not found for ${collectionRef.id} and ${definitionRef.id}`);
    }
    const delegate = this._delegates.get().find((d) => d.canStart(collection, definition));
    if (!delegate) {
      throw new Error("No delegate found that can handle the connection");
    }
    const trusted = await this._checkTrust(collection, definition, opts);
    interaction?.participants.set(definition.id, { s: "resolved" });
    if (!trusted) {
      return void 0;
    }
    let launch = definition.launch;
    if (collection.resolveServerLanch) {
      launch = await collection.resolveServerLanch(definition);
      if (!launch) {
        return void 0;
      }
    }
    try {
      launch = await this._replaceVariablesInLaunch(delegate, definition, launch, opts.errorOnUserInteraction);
      if (definition.devMode && debug) {
        launch = await this._instantiationService.invokeFunction((accessor) => accessor.get(IMcpDevModeDebugging).transform(definition, launch));
      }
      launch = await this._mcpSandboxService.launchInSandboxIfEnabled(definition, launch, collection.remoteAuthority ?? void 0, collection.configTarget);
    } catch (e4) {
      if (e4 instanceof UserInteractionRequiredError) {
        throw e4;
      }
      this._notificationService.notify({
        severity: Severity2.Error,
        message: localize(17160, null, definition.label, String(e4)),
        actions: {
          primary: collection.presentation?.origin && [
            {
              id: "mcp.launchError.openConfig",
              class: void 0,
              enabled: true,
              tooltip: "",
              label: localize(17161, null),
              run: () => this._editorService.openEditor({
                resource: collection.presentation.origin,
                options: { selection: definition.presentation?.origin?.range }
              })
            }
          ]
        }
      });
      return;
    }
    return this._instantiationService.createInstance(
      McpServerConnection,
      collection,
      definition,
      delegate,
      launch,
      logger,
      opts.errorOnUserInteraction,
      opts.taskManager
    );
  }
};

McpRegistry = __decorateClass([
  __decorateParam(0, IInstantiationService),
  __decorateParam(1, IConfigurationResolverService),
  __decorateParam(2, IDialogService),
  __decorateParam(3, INotificationService),
  __decorateParam(4, IEditorService),
  __decorateParam(5, IConfigurationService),
  __decorateParam(6, IQuickInputService),
  __decorateParam(7, ILabelService),
  __decorateParam(8, ILogService),
  __decorateParam(9, IMcpSandboxService),
  __decorateParam(10, IWorkspaceTrustManagementService),
  __decorateParam(11, IWorkspaceTrustRequestService)
], McpRegistry);
export { notTrustedNonce, McpRegistry };
