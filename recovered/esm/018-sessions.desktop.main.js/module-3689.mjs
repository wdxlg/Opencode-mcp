// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/providers/copilotChatSessions/browser/copilotChatSessionsProvider.ts
import { localize } from "./module-0001.mjs";
import { Codicon } from "./module-0085.mjs";
import { constObservable } from "./module-0061.mjs";
import { MarkdownString, markdownStringEqual } from "./module-0462.mjs";
import { Disposable, DisposableMap, DisposableStore, MutableDisposable } from "./module-0012.mjs";
import { observableValue } from "./module-0048.mjs";
import { AgentSessionProviders } from "./module-0983.mjs";
import { GITHUB_REMOTE_FILE_SCHEME, SESSION_WORKSPACE_GROUP_GITHUB, SESSION_WORKSPACE_GROUP_LOCAL, gitHubInfoEqual, sessionFileChangesEqual, sessionWorkspaceEqual, toSessionId } from "./module-1767.mjs";
import { CopilotCLISessionType } from "./module-3672.mjs";
import { observableValueOpts } from "./module-0050.mjs";
import { structuralEquals } from "./module-0042.mjs";
import { autorun } from "./module-0052.mjs";
import { derived, derivedOpts } from "./module-0054.mjs";
import { CancellationToken, CancellationTokenSource } from "./module-0025.mjs";
import { transaction } from "./module-0045.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IChatSessionsService, SessionType } from "./module-0961.mjs";
import { IGitService } from "./module-1485.mjs";
import { IGitHubService } from "./module-3607.mjs";
import { IPullRequestIconCache } from "./module-3657.mjs";
import { IStorageService } from "./module-0512.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { Emitter, Event2 } from "./module-0017.mjs";
import { ContextKeyExpr, IContextKeyService } from "./module-0089.mjs";
import { URI } from "./module-0032.mjs";
import { computePullRequestRefPresentation } from "./module-3656.mjs";
import { computePullRequestIcon } from "./module-3594.mjs";
import { observableFromPromise } from "./module-0059.mjs";
import { getAgentSessionPullRequestUri } from "./module-1462.mjs";
import { basename2, dirname2, isEqual2 } from "./module-0034.mjs";
import { getRepositoryName } from "./module-2730.mjs";
import { ResourceLabelHomeStore } from "./module-3674.mjs";
import { runOnChange } from "./module-0064.mjs";
import { generateUuid } from "./module-0190.mjs";
import { isChatPermissionLevel } from "./module-0965.mjs";
import { getRegisteredLanguageModels, resolveModelIdentifier, resolveModelIdentifierFromLanguageModels } from "./module-2042.mjs";
import { ExtensionIdentifier } from "./module-0688.mjs";
import { ChatMode, IChatModeService, isBuiltinChatMode } from "./module-1469.mjs";
import { getWorkbenchContribution } from "./module-0872.mjs";
import { CloudSandboxAgentHostContribution } from "./module-3688.mjs";
import { AgentSession } from "./module-1107.mjs";
import { isCloudSandboxEnabled } from "./module-3675.mjs";
import { CancellationError } from "./module-0004.mjs";
import { raceCancellationError, raceTimeout } from "./module-0036.mjs";
import { Schemas } from "./module-0033.mjs";
import { getGitHubRemoteInfo } from "./module-3655.mjs";
import { buildLocalSessionStateUri } from "./module-1110.mjs";
import { observableSignal } from "./module-0058.mjs";
import { createChangesets2 } from "./module-3673.mjs";
import { IAgentSessionsService } from "./module-1463.mjs";
import { IChatService } from "./module-0973.mjs";
import { IDialogService } from "./module-0267.mjs";
import { ICommandService } from "./module-0087.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { ILanguageModelsService } from "./module-0968.mjs";
import { ILanguageModelToolsService } from "./module-0991.mjs";
import { IAgentHostEnablementService } from "./module-0964.mjs";
import { ILogService } from "./module-0095.mjs";
import { ILabelService } from "./module-0641.mjs";
import { IUriIdentityService } from "./module-0510.mjs";
import { IPathService } from "./module-0939.mjs";


// src/vs/sessions/contrib/providers/copilotChatSessions/browser/copilotChatSessionsProvider.ts
var CopilotCloudSessionType = {
  id: "copilot-cloud-agent",
  label: localize(5049, null),
  icon: Codicon.cloud,
  authRequirement: "github" /* GitHub */
};

var STORAGE_KEY_ISOLATION_MODE = "sessions.isolationPicker.selectedMode";

var STORAGE_KEY_USE_SANDBOX = "sessions.cloudSandboxPicker.useSandbox";

var OPEN_REPO_COMMAND = "github.copilot.chat.cloudSessions.openRepository";

var OPEN_ISSUE_COMMAND = "github.copilot.chat.cloudSessions.openIssue";

var OPEN_PULL_REQUEST_COMMAND = "github.copilot.chat.cloudSessions.openPullRequest";

var COPILOT_PROVIDER_ID = "default-copilot";

var COPILOT_MULTI_CHAT_SETTING = "sessions.github.copilot.multiChatSessions";

var REPOSITORY_OPTION_ID = "repository";

var PARENT_SESSION_OPTION_ID = "parentSessionId";

var BRANCH_OPTION_ID = "branch";

var ISOLATION_OPTION_ID = "isolation";

var AGENT_OPTION_ID = "agent";

function isNewSession(session) {
  return session instanceof CopilotCLISession || session instanceof RemoteNewSession;
}

function buildChatFromSession(chat) {
  return {
    resource: chat.resource,
    createdAt: chat.createdAt,
    title: chat.title,
    updatedAt: chat.updatedAt,
    status: chat.status,
    changes: chat.changes,
    checkpoints: chat.checkpoints,
    modelId: chat.modelId,
    modelSource: chat.modelSource,
    mode: chat.mode,
    isArchived: chat.isArchived,
    isRead: chat.isRead,
    interactivity: constObservable("full" /* Full */),
    description: chat.description,
    lastTurnEnd: chat.lastTurnEnd
  };
}

function setIfChanged(observable, value2, tx, equals5 = Object.is) {
  if (equals5(observable.get(), value2)) {
    return false;
  }
  observable.set(value2, tx, void 0);
  return true;
}

function dateEquals2(a, b) {
  return a?.getTime() === b?.getTime();
}

function markdownStringEquals2(a, b) {
  return a === b || !!a && !!b && markdownStringEqual(a, b);
}

var CopilotCLISession = class extends Disposable {
  constructor(resource, sessionWorkspace, providerId, chatSessionsService, gitService, gitHubService, pullRequestIconCache, storageService, configurationService) {
    super();
    this.resource = resource;
    this.sessionWorkspace = sessionWorkspace;
    this.chatSessionsService = chatSessionsService;
    this.gitService = gitService;
    this.gitHubService = gitHubService;
    this.pullRequestIconCache = pullRequestIconCache;
    this.storageService = storageService;
    this.configurationService = configurationService;
    this._title = observableValue(this, "");
    this.title = this._title;
    this._updatedAt = observableValue(this, /* @__PURE__ */ new Date());
    this.updatedAt = this._updatedAt;
    this._status = observableValue(this, 0 /* Untitled */);
    this.status = this._status;
    this._permissionLevel = observableValue(this, "default" /* Default */);
    this.permissionLevel = this._permissionLevel;
    this._workspaceData = observableValue(this, void 0);
    this.workspace = this._workspaceData;
    this._branchObservable = observableValue(this, void 0);
    this.branch = this._branchObservable;
    this._isolationModeObservable = observableValue(this, "worktree");
    this.isolationMode = this._isolationModeObservable;
    /** A local CLI session always runs locally, so it has no cloud sandbox choice to make. */
    this.useSandbox = constObservable(void 0);
    this._modelIdObservable = observableValue(this, void 0);
    this.modelId = this._modelIdObservable;
    this._modelSourceObservable = observableValue(this, void 0);
    this.modelSource = this._modelSourceObservable;
    this._modeObservable = observableValue(this, void 0);
    this.mode = this._modeObservable;
    this._loading = observableValue(this, true);
    this.loading = this._loading;
    this._hasGitRepository = observableValue(this, false);
    this.hasGitRepository = this._hasGitRepository;
    this._isArchived = observableValue(this, false);
    this.isArchived = this._isArchived;
    this.isRead = observableValue(this, true);
    this.lastTurnEnd = observableValue(this, void 0);
    this.gitHubInfo = observableValue(this, void 0);
    this._loadBranchesCts = this._register(new MutableDisposable());
    // -- Branch state --
    this._branches = observableValue(this, []);
    this.branches = this._branches;
    this.target = AgentSessionProviders.Background;
    this.selectedOptions = /* @__PURE__ */ new Map();
    this.sessionId = toSessionId(providerId, resource);
    this.providerId = providerId;
    this.sessionType = AgentSessionProviders.Background;
    this.icon = CopilotCLISessionType.icon;
    this.createdAt = /* @__PURE__ */ new Date();
    const repoUri = sessionWorkspace.folders[0]?.root;
    if (repoUri) {
      this._repoUri = repoUri;
      this.setOption(REPOSITORY_OPTION_ID, repoUri.fsPath);
    }
    this._workspaceData.set(sessionWorkspace, void 0);
    const storedMode = storageService.get(STORAGE_KEY_ISOLATION_MODE, 0 /* PROFILE */);
    const initialMode = storedMode === "workspace" ? "workspace" : "worktree";
    this._isolationMode = initialMode;
    this._isolationModeObservable.set(initialMode, void 0);
    this.setOption(ISOLATION_OPTION_ID, initialMode);
    this._resolveGitRepository();
    this._description = observableValue(this, void 0);
    this.description = this._description;
    this._changes = observableValueOpts({ owner: this, equalsFn: sessionFileChangesEqual }, []);
    this.changes = this._changes;
    this._checkpoints = observableValueOpts({ owner: this, equalsFn: structuralEquals }, void 0);
    this.checkpoints = this._checkpoints;
    this.mainChat = observableValue(this, buildChatFromSession(this));
  }
  static {
    this.COPILOT_WORKTREE_PATTERN = "copilot-worktree-";
  }
  get selectedModelId() {
    return this._modelId;
  }
  get chatMode() {
    return this._mode;
  }
  get query() {
    return this._query;
  }
  get attachedContext() {
    return this._attachedContext;
  }
  get gitRepository() {
    return this._gitRepository;
  }
  get disabled() {
    if (!this._repoUri) {
      return true;
    }
    if (this._isolationMode === "worktree" && !this._branch) {
      return true;
    }
    return false;
  }
  async _resolveGitRepository() {
    const repoUri = this.sessionWorkspace.folders[0]?.root;
    if (repoUri) {
      try {
        this._gitRepository = await this.gitService.openRepository(repoUri);
        if (!this._gitRepository) {
          this.setIsolationMode("workspace");
        } else if (!this._gitRepository.state.get().HEAD?.commit) {
          this.setIsolationMode("workspace");
        }
      } catch {
        this.setIsolationMode("workspace");
      }
    }
    const gitRepository = this._gitRepository;
    if (gitRepository) {
      this._register(autorun((reader) => {
        this._hasGitRepository.set(!!gitRepository.state.read(reader).HEAD?.commit, void 0);
      }));
      this._loadBranches(gitRepository);
      const currentBranchName = derived((reader) => {
        const state = gitRepository.state.read(reader);
        return state?.HEAD?.commit ? state.HEAD.name : void 0;
      });
      this._register(autorun((reader) => {
        const isolationMode = this.isolationMode.read(reader);
        if (isolationMode === "worktree") {
          return;
        }
        const currentBranch = currentBranchName.read(reader);
        this.setBranch(currentBranch ?? this._defaultBranch);
      }));
    }
    this._loading.set(false, void 0);
  }
  _loadBranches(repo) {
    this._loadBranchesCts.value?.cancel();
    const cts = this._loadBranchesCts.value = new CancellationTokenSource();
    repo.getRefs({ pattern: "refs/heads" }, cts.token).then((refs) => {
      if (cts.token.isCancellationRequested) {
        return;
      }
      const hasHeadCommit = !!repo.state.get().HEAD?.commit;
      const branches = refs.map((r2) => r2.name).filter((name) => !!name).filter((name) => !name.includes(CopilotCLISession.COPILOT_WORKTREE_PATTERN));
      const defaultBranch = hasHeadCommit ? branches.find((b) => b === "main") ?? branches.find((b) => b === "master") ?? branches.find((b) => b === repo.state.get().HEAD?.name) ?? branches[0] : void 0;
      this._defaultBranch = defaultBranch;
      transaction((tx) => {
        this._branches.set(branches, tx);
      });
      if (defaultBranch && !this._branch) {
        this.setBranch(defaultBranch);
      }
    }).catch(() => {
      if (!cts.token.isCancellationRequested) {
        transaction((tx) => {
          this._branches.set([], tx);
        });
      }
    });
  }
  setIsolationMode(mode) {
    if (this._isolationMode !== mode) {
      this._isolationMode = mode;
      this._isolationModeObservable.set(mode, void 0);
      this.setOption(ISOLATION_OPTION_ID, mode);
      this.storageService.store(STORAGE_KEY_ISOLATION_MODE, mode, 0 /* PROFILE */, 1 /* MACHINE */);
      if (mode === "workspace") {
        const head = this._gitRepository?.state.get().HEAD;
        const currentBranch = head?.commit ? head.name : void 0;
        this.setBranch(currentBranch ?? this._defaultBranch);
      } else {
        this.setBranch(this._defaultBranch);
      }
    }
  }
  setBranch(branch) {
    if (this._branch !== branch) {
      this._branch = branch;
      this._branchObservable.set(branch, void 0);
      this.setOption(BRANCH_OPTION_ID, branch ?? "");
    }
  }
  setUseSandbox(_useSandbox) {
  }
  setModelId(modelId, source) {
    this._modelId = modelId;
    transaction((tx) => {
      this._modelSourceObservable.set(modelId ? source : void 0, tx);
      this._modelIdObservable.set(modelId, tx);
    });
  }
  setModeById(modeId, modeKind) {
    this._modeObservable.set({ id: modeId, kind: modeKind }, void 0);
  }
  setPermissionLevel(level) {
    this._permissionLevel.set(level, void 0);
  }
  setTitle(title) {
    this._title.set(title, void 0);
  }
  setStatus(status2) {
    this._status.set(status2, void 0);
  }
  setArchived(archived) {
    this._isArchived.set(archived, void 0);
  }
  setMode(mode) {
    if (this._mode?.id !== mode?.id) {
      this._mode = mode;
      const modeName = mode?.isBuiltin ? void 0 : mode?.name.get();
      this.setOption(AGENT_OPTION_ID, modeName ?? "");
    }
  }
  getAgentHostSessionConfig() {
    const config = {
      ["isolation" /* Isolation */]: this._isolationMode === "worktree" ? "worktree" : "folder"
    };
    if (this._isolationMode === "worktree" && this._branch) {
      config["branch" /* Branch */] = this._branch;
      const branchPrefix = this.configurationService.getValue("git.branchPrefix", { resource: this._repoUri });
      if (typeof branchPrefix === "string" && branchPrefix.length > 0) {
        config["worktreeBranchPrefix" /* WorktreeBranchPrefix */] = branchPrefix;
      }
      const worktreeIncludeFiles = this.configurationService.getValue("git.worktreeIncludeFiles", { resource: this._repoUri });
      if (Array.isArray(worktreeIncludeFiles) && worktreeIncludeFiles.length > 0) {
        config["worktreeIncludeFiles" /* WorktreeIncludeFiles */] = worktreeIncludeFiles;
      }
    }
    return config;
  }
  setOption(optionId, value2) {
    if (typeof value2 === "string") {
      this.selectedOptions.set(optionId, { id: value2, name: value2 });
    } else {
      this.selectedOptions.set(optionId, value2);
    }
    this.chatSessionsService.setSessionOption(this.resource, optionId, value2);
  }
  update(agentSession) {
    transaction((tx) => {
      const session = new AgentSessionAdapter(agentSession, this.providerId, this.gitHubService, this.pullRequestIconCache);
      this._workspaceData.set(session.workspace.get(), tx);
      this._title.set(session.title.get(), tx);
      this._status.set(session.status.get(), tx);
      this._updatedAt.set(session.updatedAt.get(), tx);
      this._changes.set(session.changes.get(), tx);
      this._checkpoints.set(session.checkpoints.get(), tx);
      this._description.set(session.description.get(), tx);
    });
  }
};

CopilotCLISession = __decorateClass([
  __decorateParam(3, IChatSessionsService),
  __decorateParam(4, IGitService),
  __decorateParam(5, IGitHubService),
  __decorateParam(6, IPullRequestIconCache),
  __decorateParam(7, IStorageService),
  __decorateParam(8, IConfigurationService)
], CopilotCLISession);

function isModelOptionGroup(group2) {
  if (group2.id === "models") {
    return true;
  }
  const nameLower = group2.name.toLowerCase();
  return nameLower === "model" || nameLower === "models";
}

function isRepositoriesOptionGroup(group2) {
  return group2.id === "repositories";
}

var RemoteNewSession = class extends Disposable {
  constructor(resource, sessionWorkspace, target, providerId, chatSessionsService, contextKeyService, storageService) {
    super();
    this.resource = resource;
    this.sessionWorkspace = sessionWorkspace;
    this.target = target;
    this.chatSessionsService = chatSessionsService;
    this.contextKeyService = contextKeyService;
    this.storageService = storageService;
    this._title = observableValue(this, "");
    this.title = this._title;
    this._updatedAt = observableValue(this, /* @__PURE__ */ new Date());
    this.updatedAt = this._updatedAt;
    this._status = observableValue(this, 0 /* Untitled */);
    this.status = this._status;
    this._permissionLevel = observableValue(this, "default" /* Default */);
    this.permissionLevel = this._permissionLevel;
    this._workspaceData = observableValue(this, void 0);
    this.workspace = this._workspaceData;
    this.changes = observableValueOpts({ owner: this, equalsFn: sessionFileChangesEqual }, []);
    this.checkpoints = constObservable(void 0);
    this._modelIdObservable = observableValue(this, void 0);
    this.modelId = this._modelIdObservable;
    this._modelSourceObservable = observableValue(this, void 0);
    this.modelSource = this._modelSourceObservable;
    this.mode = observableValue(this, void 0);
    this.loading = observableValue(this, false);
    this._isArchived = observableValue(this, false);
    this.isArchived = this._isArchived;
    this.isRead = observableValue(this, true);
    this.description = constObservable(void 0);
    this.lastTurnEnd = constObservable(void 0);
    this.gitHubInfo = constObservable(void 0);
    this.branch = constObservable(void 0);
    this.isolationMode = constObservable(void 0);
    this._useSandbox = observableValue(this, false);
    this.useSandbox = this._useSandbox;
    this.branches = constObservable([]);
    this._hasGitRepo = observableValue(this, false);
    this.hasGitRepo = this._hasGitRepo;
    this._onDidChangeOptionGroups = this._register(new Emitter());
    this.onDidChangeOptionGroups = this._onDidChangeOptionGroups.event;
    this.selectedOptions = /* @__PURE__ */ new Map();
    this._whenClauseKeys = /* @__PURE__ */ new Set();
    this.sessionId = toSessionId(providerId, resource);
    this.providerId = providerId;
    this.sessionType = target;
    this.icon = CopilotCloudSessionType.icon;
    this.createdAt = /* @__PURE__ */ new Date();
    this._useSandbox.set(storageService.getBoolean(STORAGE_KEY_USE_SANDBOX, 0 /* PROFILE */, false), void 0);
    this._updateWhenClauseKeys();
    this._register(this.chatSessionsService.onDidChangeOptionGroups(() => {
      this._updateWhenClauseKeys();
      this._onDidChangeOptionGroups.fire();
    }));
    this._register(this.contextKeyService.onDidChangeContext((e4) => {
      if (this._whenClauseKeys.size > 0 && e4.affectsSome(this._whenClauseKeys)) {
        this._onDidChangeOptionGroups.fire();
      }
    }));
    this._workspaceData.set(sessionWorkspace, void 0);
    this._repoUri = sessionWorkspace.folders[0]?.root;
    if (this._repoUri) {
      const id2 = this._repoUri.path.substring(1);
      this.setOption("repositories", { id: id2, name: id2 });
    }
    this.mainChat = observableValue(this, buildChatFromSession(this));
  }
  get project() {
    return this._project;
  }
  get selectedModelId() {
    return this._modelId;
  }
  /**
   * The repository this session targets, as `owner/repo`. A GitHub workspace root carries a ref
   * (`/<owner>/<repo>/HEAD`, see {@link CopilotChatSessionsProvider._browseForRepo}), so this
   * takes only the first two path segments rather than the whole path.
   */
  get repoNwo() {
    return this._repoUri ? githubRemoteRepoLabel(this._repoUri) : void 0;
  }
  get chatMode() {
    return void 0;
  }
  get query() {
    return this._query;
  }
  get attachedContext() {
    return this._attachedContext;
  }
  get disabled() {
    return !this._repoUri && !this.selectedOptions.has("repositories");
  }
  setPermissionLevel(level) {
    throw new Error("Method not implemented.");
  }
  // -- New session configuration methods --
  setIsolationMode(_mode) {
  }
  setUseSandbox(useSandbox) {
    if (this._useSandbox.get() === useSandbox) {
      return;
    }
    this._useSandbox.set(useSandbox, void 0);
    this.storageService.store(STORAGE_KEY_USE_SANDBOX, useSandbox, 0 /* PROFILE */, 1 /* MACHINE */);
  }
  setBranch(_branch) {
  }
  setModelId(modelId, source) {
    this._modelId = modelId;
    transaction((tx) => {
      this._modelSourceObservable.set(modelId ? source : void 0, tx);
      this._modelIdObservable.set(modelId, tx);
    });
  }
  setTitle(title) {
    this._title.set(title, void 0);
  }
  setStatus(status2) {
    this._status.set(status2, void 0);
  }
  setArchived(archived) {
    this._isArchived.set(archived, void 0);
  }
  setMode(_mode) {
  }
  setOption(optionId, value2) {
    if (typeof value2 !== "string") {
      this.selectedOptions.set(optionId, value2);
    }
    this.chatSessionsService.setSessionOption(this.resource, optionId, value2);
  }
  // --- Option group accessors ---
  getModelOptionsSnapshot() {
    const groups = this._getOptionGroups();
    if (!groups) {
      return { modelOption: void 0, isResolved: false };
    }
    const group2 = groups.find((g) => isModelOptionGroup(g));
    if (!group2) {
      return { modelOption: void 0, isResolved: true };
    }
    return { modelOption: { group: group2, value: this._getValueForGroup(group2) }, isResolved: true };
  }
  getOtherOptionGroups() {
    const groups = this._getOptionGroups();
    if (!groups) {
      return [];
    }
    return groups.filter((g) => !isModelOptionGroup(g) && !isRepositoriesOptionGroup(g) && this._isOptionGroupVisible(g)).map((g) => ({ group: g, value: this._getValueForGroup(g) }));
  }
  getOptionValue(groupId) {
    return this.selectedOptions.get(groupId);
  }
  setOptionValue(groupId, value2) {
    this.setOption(groupId, value2);
  }
  // --- Internals ---
  _getOptionGroups() {
    return this.chatSessionsService.getOptionGroupsForSessionType(this.target);
  }
  _isOptionGroupVisible(group2) {
    if (!group2.when) {
      return true;
    }
    const expr = ContextKeyExpr.deserialize(group2.when);
    return !expr || this.contextKeyService.contextMatchesRules(expr);
  }
  _updateWhenClauseKeys() {
    this._whenClauseKeys.clear();
    const groups = this._getOptionGroups();
    if (!groups) {
      return;
    }
    for (const group2 of groups) {
      if (group2.when) {
        const expr = ContextKeyExpr.deserialize(group2.when);
        if (expr) {
          for (const key3 of expr.keys()) {
            this._whenClauseKeys.add(key3);
          }
        }
      }
    }
  }
  _getValueForGroup(group2) {
    const selected = this.selectedOptions.get(group2.id);
    if (selected) {
      return selected;
    }
    const sessionOption = this.chatSessionsService.getSessionOption(this.resource, group2.id);
    if (sessionOption && typeof sessionOption !== "string") {
      return sessionOption;
    }
    if (typeof sessionOption === "string") {
      const item = group2.items.find((i2) => i2.id === sessionOption.trim());
      if (item) {
        return item;
      }
    }
    return group2.items.find((i2) => i2.default === true) ?? group2.items[0];
  }
  update(_session) {
  }
};

RemoteNewSession = __decorateClass([
  __decorateParam(4, IChatSessionsService),
  __decorateParam(5, IContextKeyService),
  __decorateParam(6, IStorageService)
], RemoteNewSession);

function toSessionStatus(status2) {
  switch (status2) {
    case 2 /* InProgress */:
      return 1 /* InProgress */;
    case 3 /* NeedsInput */:
      return 2 /* NeedsInput */;
    case 1 /* Completed */:
      return 3 /* Completed */;
    case 0 /* Failed */:
      return 4 /* Error */;
  }
}

function githubRemoteRepoLabel(uri4) {
  if (uri4.scheme !== GITHUB_REMOTE_FILE_SCHEME) {
    return void 0;
  }
  const parts = uri4.path.replace(/^\//, "").split("/");
  return parts.length >= 2 ? `${parts[0]}/${parts[1]}` : void 0;
}

var AgentSessionAdapter = class {
  constructor(session, providerId, _gitHubService, _pullRequestIconCache) {
    this._gitHubService = _gitHubService;
    this._pullRequestIconCache = _pullRequestIconCache;
    this._modelSource = observableValue("agentSessionModelSource", void 0);
    this.modelSource = this._modelSource;
    this._pullRequestNumberCache = /* @__PURE__ */ new Map();
    this.permissionLevel = constObservable("default" /* Default */);
    this.branch = constObservable(void 0);
    this.isolationMode = constObservable(void 0);
    /** Where a committed session runs is already decided; the choice only exists before the first send. */
    this.useSandbox = constObservable(void 0);
    this.branches = constObservable([]);
    this.sessionId = toSessionId(providerId, session.resource);
    this.resource = session.resource;
    this.providerId = providerId;
    this.sessionType = session.providerType;
    this.icon = this._getSessionTypeIcon(session);
    this.createdAt = new Date(session.timing.created);
    this._baseGitHubInfo = observableValue(this, this._extractGitHubInfo(session));
    this._pullRequestBranch = observableValue(this, this._extractPullRequestBranch(session));
    this._pullRequestNumberFromBranch = derived(this, (reader) => {
      const base = this._baseGitHubInfo.read(reader);
      const branch = this._pullRequestBranch.read(reader);
      if (base?.pullRequest || !base || !branch) {
        return void 0;
      }
      return this._pullRequestNumberForBranch(base.owner, base.repo, branch);
    });
    this.gitHubInfo = derived(this, (reader) => {
      let info = this._baseGitHubInfo.read(reader);
      if (!info) {
        return void 0;
      }
      if (!info.pullRequest) {
        const pullRequestNumber = this._pullRequestNumberFromBranch.read(reader)?.read(reader).value;
        if (pullRequestNumber === void 0) {
          return info;
        }
        info = {
          ...info,
          pullRequest: {
            number: pullRequestNumber,
            uri: URI.parse(`https://github.com/${info.owner}/${info.repo}/pull/${pullRequestNumber}`)
          }
        };
      }
      const pullRequest = info.pullRequest;
      if (!pullRequest) {
        return info;
      }
      if (pullRequest.uri.authority.toLowerCase() !== "github.com") {
        return info;
      }
      const presentation2 = computePullRequestRefPresentation(reader, this._gitHubService, this._pullRequestIconCache, {
        owner: info.owner,
        repo: info.repo,
        number: pullRequest.number,
        uri: pullRequest.uri,
        icon: pullRequest.icon,
        title: pullRequest.title
      }, computePullRequestIcon("open" /* Open */));
      return {
        ...info,
        pullRequest: {
          ...pullRequest,
          ...presentation2
        }
      };
    });
    this._workspace = observableValue(this, this._buildWorkspace(session));
    this.workspace = this._workspace;
    this._title = observableValue(this, session.label);
    this.title = this._title;
    const updatedTime = session.timing.lastRequestEnded ?? session.timing.lastRequestStarted ?? session.timing.created;
    this._updatedAt = observableValue(this, new Date(updatedTime));
    this.updatedAt = this._updatedAt;
    this._status = observableValue(this, toSessionStatus(session.status));
    this.status = this._status;
    this._changes = observableValueOpts({ owner: this, equalsFn: sessionFileChangesEqual }, this._extractChanges(session));
    this.changes = this._changes;
    this._checkpoints = observableValueOpts({ owner: this, equalsFn: structuralEquals }, this._extractCheckpoints(session));
    this.checkpoints = this._checkpoints;
    this._modelId = observableValue(this, void 0);
    this.modelId = this._modelId;
    this.mode = observableValue(this, void 0);
    this.loading = observableValue(this, false);
    this._isArchived = observableValue(this, session.isArchived());
    this.isArchived = this._isArchived;
    this._isRead = observableValue(this, session.isRead());
    this.isRead = this._isRead;
    this._description = observableValue(this, this._extractDescription(session));
    this.description = this._description;
    this._lastTurnEnd = observableValue(this, session.timing.lastRequestEnded ? new Date(session.timing.lastRequestEnded) : void 0);
    this.lastTurnEnd = this._lastTurnEnd;
    this.mainChat = observableValue(this, buildChatFromSession(this));
  }
  setPermissionLevel(level) {
    throw new Error("Method not implemented.");
  }
  setBranch(branch) {
    throw new Error("Method not implemented.");
  }
  setIsolationMode(mode) {
    throw new Error("Method not implemented.");
  }
  setUseSandbox(useSandbox) {
  }
  setModelId(modelId, source) {
    transaction((tx) => {
      this._modelSource.set(modelId ? source : void 0, tx);
      this._modelId.set(modelId, tx);
    });
  }
  setMode(chatMode) {
    throw new Error("Method not implemented.");
  }
  /**
   * Update reactive properties from a refreshed agent session.
   */
  update(session) {
    let changed = false;
    transaction((tx) => {
      const gitHubInfo = this._extractGitHubInfo(session);
      const pullRequestBranch = this._extractPullRequestBranch(session);
      changed = setIfChanged(this._title, session.label, tx) || changed;
      changed = setIfChanged(this._workspace, this._buildWorkspace(session), tx, sessionWorkspaceEqual) || changed;
      const updatedTime = session.timing.lastRequestEnded ?? session.timing.lastRequestStarted ?? session.timing.created;
      changed = setIfChanged(this._updatedAt, new Date(updatedTime), tx, dateEquals2) || changed;
      changed = setIfChanged(this._status, toSessionStatus(session.status), tx) || changed;
      changed = setIfChanged(this._changes, this._extractChanges(session), tx, sessionFileChangesEqual) || changed;
      changed = setIfChanged(this._checkpoints, this._extractCheckpoints(session), tx, structuralEquals) || changed;
      changed = setIfChanged(this._isArchived, session.isArchived(), tx) || changed;
      changed = setIfChanged(this._isRead, session.isRead(), tx) || changed;
      changed = setIfChanged(this._description, this._extractDescription(session), tx, markdownStringEquals2) || changed;
      changed = setIfChanged(this._lastTurnEnd, session.timing.lastRequestEnded ? new Date(session.timing.lastRequestEnded) : void 0, tx, dateEquals2) || changed;
      changed = setIfChanged(this._baseGitHubInfo, gitHubInfo, tx, gitHubInfoEqual) || changed;
      changed = setIfChanged(this._pullRequestBranch, pullRequestBranch, tx) || changed;
    });
    return changed;
  }
  _pullRequestNumberForBranch(owner, repo, branch) {
    const key3 = `${owner}/${repo}@${branch}`;
    const cached = this._pullRequestNumberCache.get(key3);
    if (cached) {
      return cached;
    }
    const lookup = this._gitHubService.findPullRequestNumberByHeadBranch(owner, repo, branch);
    const observable = observableFromPromise(lookup);
    this._pullRequestNumberCache.set(key3, observable);
    lookup.then((pullRequestNumber) => {
      if (pullRequestNumber === void 0 && this._pullRequestNumberCache.get(key3) === observable) {
        this._pullRequestNumberCache.delete(key3);
      }
    });
    return observable;
  }
  _getSessionTypeIcon(session) {
    switch (session.providerType) {
      case AgentSessionProviders.Background:
        return CopilotCLISessionType.icon;
      case AgentSessionProviders.Cloud:
        return CopilotCloudSessionType.icon;
      default:
        return session.icon;
    }
  }
  _extractDescription(session) {
    if (!session.description) {
      return void 0;
    }
    return typeof session.description === "string" ? new MarkdownString(session.description) : session.description;
  }
  _extractGitHubInfo(session) {
    const metadata = session.metadata;
    if (!metadata) {
      return void 0;
    }
    const pullRequestUri = this._extractPullRequestUri(session);
    const pullRequestIdentity = pullRequestUri ? this._extractPullRequestIdentity(pullRequestUri) : void 0;
    const { owner, repo } = pullRequestIdentity ?? this._extractOwnerRepo(session);
    if (!owner || !repo) {
      return void 0;
    }
    if (!pullRequestUri || !pullRequestIdentity) {
      return { owner, repo };
    }
    const icon2 = this._extractPullRequestStateIcon(session);
    const baseRefOid = typeof metadata.baseRefOid === "string" ? metadata.baseRefOid : void 0;
    const headRefOid = typeof metadata.headRefOid === "string" ? metadata.headRefOid : void 0;
    return {
      owner,
      repo,
      pullRequest: {
        number: pullRequestIdentity.number,
        uri: pullRequestUri,
        icon: icon2,
        baseRefOid,
        headRefOid
      }
    };
  }
  _extractPullRequestBranch(session) {
    if (session.providerType !== AgentSessionProviders.Cloud) {
      return void 0;
    }
    if (typeof session.metadata?.host === "string" && session.metadata.host.toLowerCase() !== "github.com") {
      return void 0;
    }
    return typeof session.metadata?.branch === "string" ? session.metadata.branch : void 0;
  }
  _extractPullRequestIdentity(pullRequestUri) {
    const match2 = /^\/(?<owner>[^/]+)\/(?<repo>[^/]+)\/pull\/(?<number>\d+)\/?$/.exec(pullRequestUri.path);
    if (!match2?.groups) {
      return void 0;
    }
    return {
      owner: decodeURIComponent(match2.groups.owner),
      repo: decodeURIComponent(match2.groups.repo),
      number: parseInt(match2.groups.number, 10)
    };
  }
  _extractOwnerRepo(session) {
    const metadata = session.metadata;
    if (!metadata) {
      return { owner: void 0, repo: void 0 };
    }
    if (typeof metadata.owner === "string" && typeof metadata.name === "string") {
      return { owner: metadata.owner, repo: metadata.name };
    }
    if (typeof metadata.repositoryNwo === "string") {
      const parts = metadata.repositoryNwo.split("/");
      if (parts.length === 2) {
        return { owner: parts[0], repo: parts[1] };
      }
    }
    const repoUri = this._buildWorkspace(session)?.folders[0]?.root;
    if (repoUri && repoUri.scheme === GITHUB_REMOTE_FILE_SCHEME) {
      const parts = repoUri.path.split("/").filter(Boolean);
      if (parts.length >= 2) {
        return { owner: decodeURIComponent(parts[0]), repo: decodeURIComponent(parts[1]) };
      }
    }
    return { owner: void 0, repo: void 0 };
  }
  _extractPullRequestStateIcon(session) {
    const metadata = session.metadata;
    const state = metadata?.pullRequestState;
    if (typeof state === "string") {
      return computePullRequestIcon(state);
    }
    return void 0;
  }
  _extractPullRequestUri(session) {
    return getAgentSessionPullRequestUri(session);
  }
  _extractChanges(session) {
    if (!session.changes) {
      return [];
    }
    if (Array.isArray(session.changes)) {
      return session.changes;
    }
    const summary = session.changes;
    if (summary.insertions > 0 || summary.deletions > 0) {
      return [{
        modifiedUri: URI.parse("summary://changes"),
        insertions: summary.insertions,
        deletions: summary.deletions
      }];
    }
    return [];
  }
  _extractCheckpoints(session) {
    const metadata = session.metadata;
    if (typeof metadata?.firstCheckpointRef !== "string" || typeof metadata?.lastCheckpointRef !== "string") {
      return void 0;
    }
    return {
      firstCheckpointRef: metadata.firstCheckpointRef,
      lastCheckpointRef: metadata.lastCheckpointRef
    };
  }
  _buildWorkspace(session) {
    const {
      repoUri,
      worktreeUri,
      branchName,
      baseBranchName,
      baseBranchProtected,
      hasGitHubRemote,
      upstreamBranchName,
      incomingChanges,
      outgoingChanges,
      uncommittedChanges,
      hasGitOperationInProgress
    } = this._extractRepositoryFromMetadata(session);
    const repoUriResolved = repoUri ?? URI.parse("unknown:///");
    const gitRepository = {
      uri: repoUriResolved,
      workTreeUri: worktreeUri,
      branchName,
      baseBranchName,
      baseBranchProtected,
      hasGitHubRemote,
      upstreamBranchName,
      incomingChanges,
      outgoingChanges,
      uncommittedChanges,
      hasGitOperationInProgress,
      gitHubInfo: this.gitHubInfo
    };
    const folder = {
      root: repoUriResolved,
      workingDirectory: worktreeUri ?? repoUriResolved,
      name: basename2(repoUriResolved),
      description: branchName,
      gitRepository
    };
    return {
      uri: repoUriResolved,
      label: githubRemoteRepoLabel(repoUriResolved) ?? getRepositoryName(session) ?? basename2(repoUriResolved),
      icon: repoUri?.scheme === GITHUB_REMOTE_FILE_SCHEME ? Codicon.repo : Codicon.folder,
      group: repoUri?.scheme === GITHUB_REMOTE_FILE_SCHEME ? SESSION_WORKSPACE_GROUP_GITHUB : SESSION_WORKSPACE_GROUP_LOCAL,
      folders: [folder],
      requiresWorkspaceTrust: session.providerType !== AgentSessionProviders.Cloud,
      isVirtualWorkspace: session.providerType === AgentSessionProviders.Cloud
    };
  }
  /**
   * Extract repository/worktree information from session metadata.
   * Mirrors the logic in sessionsManagementService.getRepositoryFromMetadata().
   */
  _extractRepositoryFromMetadata(session) {
    const metadata = session.metadata;
    if (!metadata) {
      return {};
    }
    if (session.providerType === AgentSessionProviders.Cloud) {
      if (typeof metadata.owner !== "string" || typeof metadata.name !== "string") {
        return {};
      }
      const branch = typeof metadata.branch === "string" ? metadata.branch : "HEAD";
      const repositoryUri = URI.from({
        scheme: GITHUB_REMOTE_FILE_SCHEME,
        authority: "github",
        path: `/${metadata.owner}/${metadata.name}/${encodeURIComponent(branch)}`
      });
      return { repoUri: repositoryUri };
    }
    const repoUri = typeof metadata?.repositoryPath === "string" ? URI.file(metadata.repositoryPath) : void 0;
    const worktreeUri = typeof metadata?.worktreePath === "string" ? URI.file(metadata.worktreePath) : void 0;
    return {
      repoUri,
      worktreeUri,
      branchName: metadata?.branchName,
      baseBranchName: metadata?.baseBranchName,
      baseBranchProtected: metadata?.baseBranchProtected,
      hasGitHubRemote: metadata?.hasGitHubRemote,
      upstreamBranchName: metadata?.upstreamBranchName,
      incomingChanges: metadata?.incomingChanges,
      outgoingChanges: metadata?.outgoingChanges,
      uncommittedChanges: metadata?.uncommittedChanges,
      hasGitOperationInProgress: metadata?.hasGitOperationInProgress
    };
  }
};

var CopilotChatSessionsProvider = class extends Disposable {
  constructor(agentSessionsService, chatService, chatSessionsService, dialogService, commandService, instantiationService, languageModelsService, toolsService, configurationService, agentHostEnablementService, logService, gitHubService, pullRequestIconCache, labelService, chatModeService, uriIdentityService, pathService, gitService) {
    super();
    this.agentSessionsService = agentSessionsService;
    this.chatService = chatService;
    this.chatSessionsService = chatSessionsService;
    this.dialogService = dialogService;
    this.commandService = commandService;
    this.instantiationService = instantiationService;
    this.languageModelsService = languageModelsService;
    this.toolsService = toolsService;
    this.configurationService = configurationService;
    this.agentHostEnablementService = agentHostEnablementService;
    this.logService = logService;
    this.gitHubService = gitHubService;
    this.pullRequestIconCache = pullRequestIconCache;
    this.labelService = labelService;
    this.chatModeService = chatModeService;
    this.uriIdentityService = uriIdentityService;
    this.pathService = pathService;
    this.gitService = gitService;
    this.id = COPILOT_PROVIDER_ID;
    this.label = localize(5048, null);
    this.icon = Codicon.copilot;
    this.order = 0;
    this._onDidChangeSessionTypes = this._register(new Emitter());
    this.onDidChangeSessionTypes = this._onDidChangeSessionTypes.event;
    this._onDidChangeSessions = this._register(new Emitter());
    this.onDidChangeSessions = this._onDidChangeSessions.event;
    this._onDidReplaceSession = this._register(new Emitter());
    this.onDidReplaceSession = this._onDidReplaceSession.event;
    /** Cache of adapted sessions, keyed by resource URI string. */
    this._sessionCache = /* @__PURE__ */ new Map();
    /**
     * Resources of committed sessions that are currently in-flight (i.e.
     * between {@link _sendFirstChat} entering the send and the replace
     * event firing). Protected from spurious removal by
     * {@link _refreshSessionCache} so that a concurrent model re-resolve
     * cannot transiently drop them.
     */
    this._inFlightCommits = /* @__PURE__ */ new Set();
    /** Cache of ISession wrappers, keyed by session group ID. */
    this._sessionGroupCache = /* @__PURE__ */ new Map();
    /**
     * Emitter fired when the set of chats in a group changes,
     * used to update the chats observable in `_chatToSession`.
     */
    this._onDidGroupMembershipChange = this._register(new Emitter());
    /**
     * Per-group signals, keyed by `sessionId`, that invalidate a single group's
     * chats observable. A group's chats derived observes only its own signal, so a
     * membership change recomputes just the affected group rather than every observed
     * group.
     */
    this._groupMembershipSignals = /* @__PURE__ */ new Map();
    this._localGitHubInfo = /* @__PURE__ */ new Map();
    this._localGitHubInfoDisposables = this._register(new DisposableMap());
    this._localGitHubInfoResolutionStarted = /* @__PURE__ */ new Set();
    this.supportsLocalWorkspaces = true;
    // -- Session Lifecycle --
    this._newSessions = this._register(new DisposableMap());
    this._resourceLabelHomes = this._register(this.instantiationService.createInstance(ResourceLabelHomeStore));
    this._multiChatEnabled = this.configurationService.getValue(COPILOT_MULTI_CHAT_SETTING) ?? true;
    this._register(this._onDidChangeSessions.event(() => this._updateResourceLabelHomes()));
    this._register(runOnChange(this.agentHostEnablementService.enabled, () => {
      this._onDidChangeSessionTypes.fire();
      this._refreshSessionCache();
    }));
    this.browseActions = [
      {
        label: localize(5057, null),
        group: SESSION_WORKSPACE_GROUP_GITHUB,
        icon: Codicon.library,
        providerId: this.id,
        attachesContext: false,
        run: () => this._browseForRepo()
      },
      {
        label: localize(5053, null),
        group: SESSION_WORKSPACE_GROUP_GITHUB,
        icon: Codicon.issues,
        providerId: this.id,
        attachesContext: true,
        run: (workspace) => this._browseForGitHubContext(OPEN_ISSUE_COMMAND, Codicon.issues, workspace)
      },
      {
        label: localize(5056, null),
        group: SESSION_WORKSPACE_GROUP_GITHUB,
        icon: Codicon.gitPullRequest,
        providerId: this.id,
        attachesContext: true,
        run: (workspace) => this._browseForGitHubContext(OPEN_PULL_REQUEST_COMMAND, Codicon.gitPullRequest, workspace)
      }
    ];
    this._register(this.agentSessionsService.model.onDidChangeSessions(() => {
      this._refreshSessionCache();
    }));
    this._registerGroupMembershipFanOut();
    this._ensureSessionCache();
  }
  get sessionTypes() {
    const types = [];
    if (this._isCopilotCliAvailable()) {
      types.push(CopilotCLISessionType);
    }
    types.push(CopilotCloudSessionType);
    return types;
  }
  /**
   * A single subscription to `_onDidGroupMembershipChange` that fans each event out
   * to the affected group's own signal. Subscribing exactly once (instead of once per
   * session) keeps the emitter's listener count constant regardless of how many
   * sessions exist — the per-session subscriptions previously leaked listeners as
   * sessions accumulated.
   */
  _registerGroupMembershipFanOut() {
    this._register(this._onDidGroupMembershipChange.event((e4) => {
      this._groupMembershipSignals.get(e4.sessionId)?.trigger(void 0, void 0);
    }));
  }
  _isCopilotCliAvailable() {
    return !this.agentHostEnablementService.enabled.get();
  }
  // -- Sessions --
  getSessionTypes(workspaceUri) {
    if (workspaceUri.scheme === GITHUB_REMOTE_FILE_SCHEME || workspaceUri.scheme === SessionType.CopilotCloud) {
      return [CopilotCloudSessionType];
    }
    const types = [];
    if (this._isCopilotCliAvailable()) {
      types.push(CopilotCLISessionType);
    }
    return types;
  }
  getSessions() {
    this._ensureSessionCache();
    if (!this._isMultiChatEnabled()) {
      return Array.from(this._sessionCache.values()).map((chat) => this._chatToSession(chat));
    }
    const allChats = Array.from(this._sessionCache.values()).sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    const seen = /* @__PURE__ */ new Set();
    const sessions = [];
    for (const chat of allChats) {
      const groupId = this._getGroupIdForChat(chat);
      if (!seen.has(groupId)) {
        seen.add(groupId);
        sessions.push(this._chatToSession(chat));
      }
    }
    return sessions;
  }
  /**
   * Clear the tracked new session with the given session's id, but only if
   * the map still holds exactly that instance. Async flows (commit wait,
   * cache population) may complete after the entry was already replaced or
   * removed — acting unconditionally would dispose an unrelated session.
   *
   * @param session The session that initiated the async flow.
   * @param leak When `true` use {@link DisposableMap.deleteAndLeak}
   *             (the session is still referenced elsewhere, e.g. the session
   *             cache); otherwise use {@link DisposableMap.deleteAndDispose}.
   */
  _clearCurrentNewSessionIfMatch(session, leak) {
    if (this._newSessions.get(session.sessionId) === session) {
      if (leak) {
        this._newSessions.deleteAndLeak(session.sessionId);
      } else {
        this._newSessions.deleteAndDispose(session.sessionId);
      }
    }
  }
  deleteNewSession(sessionId) {
    if (this._newSessions.has(sessionId)) {
      this._newSessions.deleteAndDispose(sessionId);
    }
  }
  getSession(sessionId) {
    const newSession = this._newSessions.get(sessionId);
    if (newSession) {
      return newSession;
    }
    return this._findChatSession(sessionId);
  }
  createNewSession(workspaceUri, sessionTypeId) {
    const workspace = this.resolveWorkspace(workspaceUri);
    if (!workspace) {
      throw new Error(`Cannot resolve workspace for URI: ${workspaceUri.toString()}`);
    }
    if (workspaceUri.scheme === GITHUB_REMOTE_FILE_SCHEME) {
      if (sessionTypeId !== CopilotCloudSessionType.id) {
        throw new Error("Only Copilot Cloud sessions can be created for GitHub repositories");
      }
      const resource2 = URI.from({ scheme: AgentSessionProviders.Cloud, path: `/untitled-${generateUuid()}` });
      const session2 = this.instantiationService.createInstance(RemoteNewSession, resource2, workspace, AgentSessionProviders.Cloud, this.id);
      this._newSessions.set(session2.sessionId, session2);
      return this._chatToSession(session2);
    }
    if (sessionTypeId !== CopilotCLISessionType.id) {
      throw new Error(`Unsupported session type '${sessionTypeId}' for local workspaces`);
    }
    const resource = URI.from({ scheme: AgentSessionProviders.Background, path: `/untitled-${generateUuid()}` });
    const session = this.instantiationService.createInstance(CopilotCLISession, resource, workspace, this.id);
    session.setPermissionLevel(this._defaultPermissionLevel());
    this._newSessions.set(session.sessionId, session);
    return this._chatToSession(session);
  }
  createQuickChat(_sessionTypeId) {
    throw new Error("CopilotChatSessionsProvider does not support quick chats");
  }
  /**
   * Resolves the initial permission level for a brand-new session from
   * `chat.permissions.default`, clamped to `Default` when enterprise policy
   * disables global auto-approval.
   */
  _defaultPermissionLevel() {
    const policyRestricted = this.configurationService.inspect("chat.tools.global.autoApprove" /* GlobalAutoApprove */).policyValue === false;
    if (policyRestricted) {
      return "default" /* Default */;
    }
    const level = this.configurationService.getValue("chat.permissions.default" /* DefaultPermissionLevel */);
    return isChatPermissionLevel(level) ? level : "default" /* Default */;
  }
  get onDidChangeModels() {
    return Event2.signal(Event2.any(
      this.languageModelsService.onDidChangeLanguageModels,
      this.chatSessionsService.onDidChangeOptionGroups
    ));
  }
  getModelsSnapshot(sessionId, desiredModelId) {
    const session = this.getSession(sessionId);
    if (session instanceof RemoteNewSession) {
      const { modelOption, isResolved } = session.getModelOptionsSnapshot();
      const models2 = modelOption?.group.items.map((item) => this._toSyntheticModel(item)) ?? [];
      return { models: models2, desiredModelResolution: resolveModelIdentifier(models2, desiredModelId, isResolved), modelTarget: session.sessionType };
    }
    const sessionType = session?.sessionType;
    if (!sessionType) {
      return { models: [], desiredModelResolution: resolveModelIdentifier([], desiredModelId, false), modelTarget: void 0 };
    }
    const allModels = getRegisteredLanguageModels(this.languageModelsService);
    const models = allModels.filter((model) => model.metadata.targetChatSessionType === sessionType);
    return {
      models,
      desiredModelResolution: resolveModelIdentifierFromLanguageModels(models, desiredModelId, this.languageModelsService, allModels),
      modelTarget: sessionType
    };
  }
  getModelPickerOptions(sessionId) {
    const sessionType = this.getSession(sessionId)?.sessionType;
    const showAutoModel = !sessionType || this.chatSessionsService.supportsAutoModelForSessionType(sessionType);
    return {
      useGroupedModelPicker: true,
      showFeatured: true,
      showUnavailableFeatured: false,
      showManageModelsAction: false,
      showAutoModel
    };
  }
  _toSyntheticModel(item) {
    const modelMetadata = item.modelMetadata;
    return {
      identifier: item.id,
      metadata: {
        extension: new ExtensionIdentifier(""),
        name: modelMetadata?.name ?? item.name,
        id: modelMetadata?.id ?? item.id,
        vendor: modelMetadata?.vendor ?? "",
        version: modelMetadata?.version ?? "",
        family: modelMetadata?.family ?? "",
        tooltip: modelMetadata?.tooltip ?? item.tooltip,
        pricing: modelMetadata?.pricing,
        multiplierNumeric: modelMetadata?.multiplierNumeric,
        inputCost: modelMetadata?.inputCost,
        outputCost: modelMetadata?.outputCost,
        cacheCost: modelMetadata?.cacheCost,
        cacheWriteCost: modelMetadata?.cacheWriteCost,
        longContextInputCost: modelMetadata?.longContextInputCost,
        longContextOutputCost: modelMetadata?.longContextOutputCost,
        longContextCacheCost: modelMetadata?.longContextCacheCost,
        longContextCacheWriteCost: modelMetadata?.longContextCacheWriteCost,
        priceCategory: modelMetadata?.priceCategory,
        promo: modelMetadata?.promo,
        maxInputTokens: modelMetadata?.maxInputTokens ?? 0,
        maxOutputTokens: modelMetadata?.maxOutputTokens ?? 0,
        capabilities: modelMetadata?.capabilities ? {
          vision: modelMetadata.capabilities.vision,
          toolCalling: modelMetadata.capabilities.toolCalling
        } : void 0,
        isUserSelectable: true,
        isDefaultForLocation: {}
      }
    };
  }
  setModel(sessionId, chatResource, modelId, source) {
    const newSession = this._newSessions.get(sessionId);
    if (newSession) {
      newSession.setModelId(modelId, source);
      if (newSession instanceof RemoteNewSession) {
        const { modelOption } = newSession.getModelOptionsSnapshot();
        const item = modelOption?.group.items.find((i2) => i2.id === modelId);
        if (item) {
          newSession.setOptionValue(modelOption.group.id, item);
        }
      }
      return;
    }
    this._ensureSessionCache();
    const chatSession = this._sessionCache.get(chatResource.toString()) ?? this._findChatSession(sessionId);
    chatSession?.setModelId(modelId, source);
  }
  setMode(sessionId, modeId) {
    const setSessionMode = (session2) => {
      let mode;
      switch (modeId) {
        case "agent" /* Agent */:
          mode = ChatMode.Agent;
          break;
        case "edit" /* Edit */:
          mode = ChatMode.Edit;
          break;
        case "ask" /* Ask */:
          mode = ChatMode.Ask;
          break;
        default: {
          const modes = this.chatModeService.createModes(session2.resource);
          try {
            mode = modes.findModeById(modeId) ?? modes.findModeByName(modeId);
          } finally {
            modes.dispose();
          }
          break;
        }
      }
      if (mode) {
        session2.setMode(mode);
      }
    };
    const newSession = this._newSessions.get(sessionId);
    if (newSession) {
      setSessionMode(newSession);
      return;
    }
    this._ensureSessionCache();
    const session = this._findChatSession(sessionId);
    if (session) {
      setSessionMode(session);
    }
  }
  setPermissionLevel(sessionId, level) {
    const newSession = this._newSessions.get(sessionId);
    if (newSession) {
      if (isChatPermissionLevel(level)) {
        newSession.setPermissionLevel(level);
      }
      return;
    }
    this._ensureSessionCache();
    const session = this._findChatSession(sessionId);
    if (session && isChatPermissionLevel(level)) {
      session.setPermissionLevel(level);
    }
  }
  async setIsolationMode(sessionId, mode) {
    if (mode !== "worktree" && mode !== "workspace") {
      return;
    }
    const newSession = this._newSessions.get(sessionId);
    if (newSession) {
      newSession.setIsolationMode(mode);
      return;
    }
    this._ensureSessionCache();
    this._findChatSession(sessionId)?.setIsolationMode(mode);
  }
  async setBranch(sessionId, branch) {
    const newSession = this._newSessions.get(sessionId);
    if (newSession) {
      newSession.setBranch(branch);
      return;
    }
    this._ensureSessionCache();
    this._findChatSession(sessionId)?.setBranch(branch);
  }
  // -- Session Actions --
  async archiveSession(sessionId) {
    const chatSession = this._findChatSession(sessionId);
    if (chatSession && isNewSession(chatSession)) {
      chatSession.setArchived(true);
      this._onDidChangeSessions.fire({ added: [], removed: [], changed: [this._chatToSession(chatSession)] });
      return;
    }
    const agentSession = this._findAgentSession(sessionId);
    if (agentSession) {
      agentSession.setArchived(true);
    }
  }
  async unarchiveSession(sessionId) {
    const chatSession = this._findChatSession(sessionId);
    if (chatSession && isNewSession(chatSession)) {
      chatSession.setArchived(false);
      this._onDidChangeSessions.fire({ added: [], removed: [], changed: [this._chatToSession(chatSession)] });
      return;
    }
    const agentSession = this._findAgentSession(sessionId);
    if (agentSession) {
      agentSession.setArchived(false);
    }
  }
  async setSessionReadState(sessionId, isRead) {
    const chatIds = this._getChatIdsInGroup(sessionId);
    const targetIds = chatIds.length > 0 ? chatIds : [sessionId];
    for (const chatId of targetIds) {
      const agentSession = this._findAgentSession(chatId);
      if (agentSession && agentSession.isRead() !== isRead) {
        agentSession.setRead(isRead);
      }
    }
  }
  async deleteSession(sessionId) {
    const chatIds = this._getChatIdsInGroup(sessionId);
    const allChatIds = /* @__PURE__ */ new Set([sessionId, ...chatIds]);
    const agentSessions = [];
    for (const chatId of allChatIds) {
      const agentSession = this._findAgentSession(chatId);
      if (agentSession) {
        agentSessions.push(agentSession);
      }
    }
    if (agentSessions.length === 0) {
      this._cleanupTempSession(sessionId);
      return;
    }
    await this._deleteAgentSessions(agentSessions);
    this._sessionGroupCache.delete(sessionId);
    this._refreshSessionCache();
  }
  async deleteSessions(sessionIds) {
    for (const sessionId of sessionIds) {
      await this.deleteSession(sessionId);
    }
  }
  async renameChat(sessionId, chatUri, title) {
    const agentSession = this.agentSessionsService.getSession(chatUri);
    if (agentSession?.providerType === CopilotCLISessionType.id) {
      await this.commandService.executeCommand("github.copilot.cli.sessions.setTitle", { resource: chatUri }, title);
      return;
    }
    throw new Error("Renaming is not supported for this session type");
  }
  async renameSession(sessionId, title) {
    const session = this._findSession(sessionId);
    if (session) {
      await this.renameChat(sessionId, session.mainChat.get().resource, title);
    }
  }
  async deleteChat(sessionId, chatUri, options3) {
    const session = this._findSession(sessionId);
    if (!session?.capabilities.get().supportsMultipleChats) {
      throw new Error("Deleting individual chats is not supported when multi-chat is disabled");
    }
    const chatIds = this._getChatIdsInGroup(sessionId);
    const chatId = chatIds.find((id2) => {
      const chat = this._sessionCache.get(this._localIdFromchatId(id2));
      return chat && chat.resource.toString() === chatUri.toString();
    });
    if (!chatId) {
      return false;
    }
    if (chatIds.length <= 1) {
      await this.deleteSession(sessionId);
      return true;
    }
    const agentSession = this._findAgentSession(chatId);
    if (agentSession) {
      if (!options3?.skipConfirmation) {
        const confirmed = await this.dialogService.confirm({
          message: localize(5050, null),
          detail: localize(5052, null),
          primaryButton: localize(5051, null)
        });
        if (!confirmed.confirmed) {
          return false;
        }
      }
      await this._deleteAgentSessions([agentSession]);
    } else {
      const chat = this._findChatSession(chatId);
      if (chat) {
        const key3 = chat.resource.toString();
        this._sessionCache.delete(key3);
        this._invalidateGroupingCaches();
        if (this._newSessions.has(chatId)) {
          this._newSessions.deleteAndDispose(chatId);
        }
      }
      this._sessionGroupCache.delete(sessionId);
      this._onDidGroupMembershipChange.fire({ sessionId });
      const remainingChatIds = this._getChatIdsInGroup(sessionId);
      const primaryChatId = remainingChatIds[0];
      const primaryChat = primaryChatId ? this._sessionCache.get(this._localIdFromchatId(primaryChatId)) : void 0;
      if (primaryChat) {
        this._onDidChangeSessions.fire({ added: [], removed: [], changed: [this._chatToSession(primaryChat)] });
      }
    }
    return true;
  }
  async _deleteAgentSessions(agentSessions) {
    const cliSessionItems = [];
    for (const agentSession of agentSessions) {
      if (agentSession.providerType === CopilotCLISessionType.id) {
        cliSessionItems.push({ resource: agentSession.resource, label: agentSession.label });
      } else {
        await this.chatService.removeHistoryEntry(agentSession.resource);
      }
    }
    if (cliSessionItems.length > 0) {
      await this.commandService.executeCommand("agents.github.copilot.cli.deleteSessions", cliSessionItems, { skipConfirmation: true });
    }
  }
  async forkChat(sessionId, _sourceChat, _turnId) {
    throw new Error(`Session '${sessionId}' does not support forking into a chat`);
  }
  async createSideChat(sessionId, _sourceChat, _turnId, _selection) {
    throw new Error(`Session '${sessionId}' does not support side chats`);
  }
  async createNewChat(sessionId, _prompt) {
    const currentNewSession = this._newSessions.get(sessionId);
    if (currentNewSession) {
      const session = currentNewSession;
      (await this._createChatSession(session.resource, session)).dispose();
      const newChat = this._toChat(session);
      session.mainChat.set(newChat, void 0);
      return newChat;
    }
    if (!this._isMultiChatEnabled()) {
      throw new Error(`[CopilotChatSessionsProvider] Session '${sessionId}' does not support multiple chats`);
    }
    return this._createNewSubsequentChat(sessionId);
  }
  async _createNewSubsequentChat(sessionId) {
    const chatIds = this._getChatIdsInGroup(sessionId);
    const firstChatId = chatIds[0] ?? sessionId;
    const chat = this._sessionCache.get(this._localIdFromchatId(firstChatId));
    if (!chat) {
      throw new Error(`Session '${sessionId}' not found`);
    }
    if (chat.sessionType !== CopilotCLISessionType.id) {
      throw new Error("Multiple chats per session is only supported for Copilot CLI sessions");
    }
    const workspace = chat.workspace.get();
    if (!workspace) {
      throw new Error("Chat session has no associated workspace");
    }
    const folder = workspace.folders[0];
    if (!folder) {
      throw new Error("Workspace has no folder");
    }
    const newWorkspace = this.resolveWorkspace(folder.workingDirectory);
    if (!newWorkspace) {
      throw new Error(`Cannot resolve workspace for working directory URI: ${folder.workingDirectory.toString()}`);
    }
    const resource = URI.from({ scheme: AgentSessionProviders.Background, path: `/untitled-${generateUuid()}` });
    const session = this.instantiationService.createInstance(CopilotCLISession, resource, newWorkspace, this.id);
    session.setModelId(chat.modelId.get(), "carriedOver" /* CarriedOver */);
    session.setIsolationMode("workspace");
    session.setOption(PARENT_SESSION_OPTION_ID, chat.resource.path.slice(1));
    session.setPermissionLevel(this._defaultPermissionLevel());
    session.setTitle(localize(5054, null));
    this._newSessions.set(session.sessionId, session);
    (await this._createChatSession(session.resource, session)).dispose();
    this._sessionCache.set(session.resource.toString(), session);
    this._invalidateGroupingCaches();
    this._sessionGroupCache.delete(sessionId);
    this._onDidGroupMembershipChange.fire({ sessionId });
    this._onDidChangeSessions.fire({ added: [], removed: [], changed: [this._chatToSession(session)] });
    return this._toChat(session);
  }
  /** Test seam: the contribution registry is global, so tests override this with a stub. */
  _getCloudSandboxContribution() {
    return getWorkbenchContribution(CloudSandboxAgentHostContribution.ID);
  }
  /**
   * Commit a cloud new-session into a GitHub-managed sandbox instead of the server-run cloud
   * agent: provision the sandbox, then hand the session over to the remote-agent-host provider
   * that owns it and send the first turn there.
   *
   * The committed session belongs to that other provider, which is why this fires
   * `onDidReplaceSession` across providers — the same swap {@link _sendFirstChat} performs, just
   * landing outside this provider. Mission Control starts no run for the task it creates, so the
   * first turn has to be dispatched here rather than being picked up server-side.
   */
  async _sendFirstChatToSandbox(session, repoNwo, options3) {
    session.setTitle((options3.title || options3.query.split("\n")[0]).substring(0, 100) || localize(5055, null));
    session.setStatus(1 /* InProgress */);
    this._sessionCache.set(session.resource.toString(), session);
    this._invalidateGroupingCaches();
    const placeholder = this._chatToSession(session);
    this._onDidChangeSessions.fire({ added: [placeholder], removed: [], changed: [] });
    let provisioned;
    try {
      provisioned = await this._getCloudSandboxContribution().provisionSession({
        repoNwo,
        // No `baseRef`: cloud sessions have no branch picker; Mission Control chooses.
        prompt: options3.query
      }, CancellationToken.None);
      const chat = provisioned.session.mainChat.get();
      const committed = await provisioned.provider.sendRequest(provisioned.session.sessionId, chat.resource, options3);
      this._publishSandboxSession(provisioned, { announce: false });
      this._retirePlaceholder(session, placeholder, committed);
      return committed;
    } catch (error) {
      this.logService.error(`[CopilotChatSessionsProvider] Failed to start cloud sandbox session for ${repoNwo}:`, error);
      if (provisioned) {
        this._publishSandboxSession(provisioned);
      }
      this._sessionCache.delete(session.resource.toString());
      this._invalidateGroupingCaches();
      this._sessionGroupCache.delete(session.sessionId);
      this._clearCurrentNewSessionIfMatch(
        session,
        /* leak */
        true
      );
      this._onDidChangeSessions.fire({ added: [], removed: [placeholder], changed: [] });
      session.dispose();
      throw error;
    }
  }
  /** Reveal the sandbox session that {@link CloudSandboxAgentHostContribution.provisionSession} withheld from listings. */
  _publishSandboxSession(provisioned, options3) {
    provisioned.provider.publishWithheldSession(AgentSession.id(provisioned.session.resource), options3);
  }
  /** Retire the optimistic placeholder in favour of the session that now exists. */
  _retirePlaceholder(session, placeholder, committed) {
    this._sessionCache.delete(session.resource.toString());
    this._invalidateGroupingCaches();
    this._sessionGroupCache.delete(session.sessionId);
    this._clearCurrentNewSessionIfMatch(session);
    this._onDidReplaceSession.fire({ from: placeholder, to: committed });
  }
  async sendRequest(sessionId, chatResource, options3) {
    const newSession = this._newSessions.get(sessionId);
    if (newSession) {
      if (!this.uriIdentityService.extUri.isEqual(newSession.mainChat.get().resource, chatResource)) {
        throw new Error("Chat resource does not match the main chat of the current new session");
      }
      if (newSession instanceof RemoteNewSession && newSession.useSandbox.get() && newSession.repoNwo && isCloudSandboxEnabled(this.configurationService)) {
        return this._sendFirstChatToSandbox(newSession, newSession.repoNwo, options3);
      }
      return this._sendFirstChat(newSession, chatResource, options3);
    }
    const session = this._findSession(sessionId);
    if (!session) {
      throw new Error(`Session '${sessionId}' not found`);
    }
    if (!session.capabilities.get().supportsMultipleChats) {
      throw new Error("Multiple chats per session is not supported");
    }
    if (!session.chats.get().some((chat) => this.uriIdentityService.extUri.isEqual(chat.resource, chatResource))) {
      throw new Error(`Chat '${chatResource.toString()}' does not belong to session '${sessionId}'`);
    }
    const key3 = chatResource.toString();
    const chatSession = this._sessionCache.get(key3);
    if (!chatSession || !(chatSession instanceof CopilotCLISession)) {
      throw new Error(`Chat '${chatResource.toString()}' not found in session '${sessionId}'`);
    }
    return this._sendExistingChat(sessionId, chatSession, options3);
  }
  async _sendFirstChat(session, chatResource, options3) {
    const { query, attachedContext } = options3;
    session.setTitle((options3.title || query.split("\n")[0]).substring(0, 100) || localize(5055, null));
    session.setStatus(1 /* InProgress */);
    this._sessionCache.set(session.resource.toString(), session);
    this._invalidateGroupingCaches();
    const newSession = this._chatToSession(session);
    this._onDidChangeSessions.fire({ added: [newSession], removed: [], changed: [] });
    const contribution = this.chatSessionsService.getChatSessionContribution(session.target);
    const modeKind = session.chatMode?.kind ?? "agent" /* Agent */;
    const modeIsBuiltin = session.chatMode ? isBuiltinChatMode(session.chatMode) : true;
    const modeId = modeIsBuiltin ? modeKind : "custom";
    const rawModeInstructions = session.chatMode?.modeInstructions?.get();
    const modeInstructions = rawModeInstructions ? {
      name: session.chatMode.name.get(),
      content: rawModeInstructions.content,
      toolReferences: this.toolsService.toToolReferences(rawModeInstructions.toolReferences),
      metadata: rawModeInstructions.metadata
    } : void 0;
    const permissionLevel = session.permissionLevel.get();
    const sendOptions = {
      location: "panel" /* Chat */,
      userSelectedModelId: session.selectedModelId,
      modeInfo: {
        kind: modeKind,
        isBuiltin: modeIsBuiltin,
        modeInstructions,
        telemetryModeId: modeId,
        applyCodeBlockSuggestionId: void 0,
        permissionLevel
      },
      agentIdSilent: contribution?.type,
      attachedContext,
      hideFromTranscript: options3.hideFromTranscript,
      agentHostSessionConfig: session instanceof CopilotCLISession ? session.getAgentHostSessionConfig() : void 0
    };
    const ref = await this._updateChatSessionState(chatResource, session, sendOptions.modeInfo?.permissionLevel);
    this.logService.debug(`[CopilotChatSessionsProvider] Sending first chat for session ${session.sessionId} with options:`, {
      userSelectedModelId: sendOptions.userSelectedModelId
    });
    try {
      const result = await this.chatService.sendRequest(chatResource, query, sendOptions);
      if (result.kind === "rejected") {
        this._sessionCache.delete(session.resource.toString());
        this._invalidateGroupingCaches();
        this._sessionGroupCache.delete(session.sessionId);
        this._clearCurrentNewSessionIfMatch(
          session,
          /* leak */
          true
        );
        this._onDidChangeSessions.fire({ added: [], removed: [newSession], changed: [] });
        session.dispose();
        throw new Error(`[DefaultCopilotProvider] sendRequest rejected: ${result.reason}`);
      }
      const cts = new CancellationTokenSource();
      const responseCompletePromise = result.kind === "sent" ? result.data.responseCompletePromise : void 0;
      const responseCreatedPromise = result.kind === "sent" ? result.data.responseCreatedPromise : void 0;
      responseCreatedPromise?.then((r2) => {
        if (r2?.isCanceled) {
          cts.cancel();
        }
      });
      try {
        const committedResource = await this._waitForCommittedSession(session.resource, responseCompletePromise, responseCreatedPromise, { deferred: session instanceof RemoteNewSession });
        this._inFlightCommits.add(committedResource.toString());
        try {
          const committedChat = await this._waitForSessionInCache(committedResource, cts.token);
          this._sessionCache.delete(session.resource.toString());
          this._clearCurrentNewSessionIfMatch(session);
          const committedSession = this._chatToSession(committedChat);
          this._sessionGroupCache.delete(session.sessionId);
          this._onDidReplaceSession.fire({ from: newSession, to: committedSession });
          return committedSession;
        } finally {
          this._inFlightCommits.delete(committedResource.toString());
        }
      } catch (error) {
        this._clearCurrentNewSessionIfMatch(
          session,
          /* leak */
          true
        );
        if (error instanceof CancellationError) {
          session.setStatus(3 /* Completed */);
          this._onDidChangeSessions.fire({ added: [], removed: [], changed: [newSession] });
          return newSession;
        }
        this._sessionCache.delete(session.resource.toString());
        this._invalidateGroupingCaches();
        this._sessionGroupCache.delete(session.sessionId);
        this._onDidChangeSessions.fire({ added: [], removed: [this._chatToSession(session)], changed: [] });
        session.dispose();
        throw error;
      } finally {
        cts.dispose();
      }
    } catch (error) {
      this.logService.error(`[CopilotChatSessionsProvider] Failed to send first chat for session ${session.sessionId}:`, error);
      throw error;
    } finally {
      ref?.dispose();
    }
  }
  async _createChatSession(resource, session, permissionLevel) {
    await this.chatSessionsService.getOrCreateChatSession(resource, CancellationToken.None);
    return this._updateChatSessionState(resource, session, permissionLevel);
  }
  async _updateChatSessionState(resource, session, permissionLevel) {
    const modelRef = await this.chatService.acquireOrLoadSession(resource, "panel" /* Chat */, CancellationToken.None);
    if (!modelRef) {
      return Disposable.None;
    }
    const model = modelRef.object;
    if (session.selectedModelId) {
      const languageModel = this.languageModelsService.lookupLanguageModel(session.selectedModelId);
      if (languageModel) {
        model.inputModel.setState({ selectedModel: { identifier: session.selectedModelId, metadata: languageModel } });
      }
    }
    if (session.chatMode) {
      model.inputModel.setState({ mode: { id: session.chatMode.id, kind: session.chatMode.kind } });
    }
    if (session.selectedOptions.size > 0) {
      this.chatSessionsService.updateSessionOptions(resource, session.selectedOptions);
    }
    if (permissionLevel) {
      model.inputModel.setState({ permissionLevel });
    }
    return modelRef;
  }
  /**
   * Sends a request for an existing chat session that is already registered
   * in the cache.
   */
  async _sendExistingChat(sessionId, newChatSession, options3) {
    newChatSession.setStatus(1 /* InProgress */);
    const key3 = newChatSession.resource.toString();
    this._sessionGroupCache.delete(sessionId);
    this._onDidChangeSessions.fire({ added: [], removed: [], changed: [this._chatToSession(newChatSession)] });
    const { query, attachedContext } = options3;
    const contribution = this.chatSessionsService.getChatSessionContribution(newChatSession.target);
    const sendOptions = {
      location: "panel" /* Chat */,
      userSelectedModelId: newChatSession.selectedModelId,
      modeInfo: {
        kind: "agent" /* Agent */,
        isBuiltin: true,
        modeInstructions: void 0,
        telemetryModeId: "agent",
        applyCodeBlockSuggestionId: void 0,
        permissionLevel: newChatSession.permissionLevel.get()
      },
      agentIdSilent: contribution?.type,
      attachedContext,
      hideFromTranscript: options3.hideFromTranscript,
      agentHostSessionConfig: newChatSession.getAgentHostSessionConfig()
    };
    const ref = await this._updateChatSessionState(newChatSession.resource, newChatSession);
    try {
      const result = await this.chatService.sendRequest(newChatSession.resource, query, sendOptions);
      if (result.kind === "rejected") {
        this._sessionCache.delete(key3);
        this._invalidateGroupingCaches();
        throw new Error(`[DefaultCopilotProvider] sendRequest rejected: ${result.reason}`);
      }
      const responseCompletePromise = result.kind === "sent" ? result.data.responseCompletePromise : void 0;
      const responseCreatedPromise = result.kind === "sent" ? result.data.responseCreatedPromise : void 0;
      try {
        const committedResource = await this._waitForCommittedSession(newChatSession.resource, responseCompletePromise, responseCreatedPromise);
        const committedChat = await this._waitForSessionInCache(committedResource);
        this._sessionCache.delete(key3);
        this._invalidateGroupingCaches();
        this._clearCurrentNewSessionIfMatch(newChatSession);
        this._sessionGroupCache.delete(sessionId);
        this._onDidGroupMembershipChange.fire({ sessionId });
        const updatedSession = this._chatToSession(committedChat);
        this._onDidChangeSessions.fire({ added: [], removed: [], changed: [updatedSession] });
        return updatedSession;
      } catch (error) {
        this._clearCurrentNewSessionIfMatch(
          newChatSession,
          /* leak */
          true
        );
        if (error instanceof CancellationError) {
          newChatSession.setStatus(3 /* Completed */);
          this._sessionGroupCache.delete(sessionId);
          const updatedSession = this._chatToSession(newChatSession);
          this._onDidChangeSessions.fire({ added: [], removed: [], changed: [updatedSession] });
          return updatedSession;
        }
        this._sessionCache.delete(key3);
        this._invalidateGroupingCaches();
        this._sessionGroupCache.delete(sessionId);
        newChatSession.dispose();
        const parentChatIds = this._getChatIdsInGroup(sessionId);
        const parentChatId = parentChatIds[0];
        const parentChat = parentChatId ? this._sessionCache.get(this._localIdFromchatId(parentChatId)) : void 0;
        if (parentChat) {
          this._onDidChangeSessions.fire({ added: [], removed: [], changed: [this._chatToSession(parentChat)] });
        }
        throw error;
      }
    } finally {
      ref.dispose();
    }
  }
  /**
   * Waits for the committed (real) URI for a session by listening to the
   * {@link IChatSessionsService.onDidCommitSession} event.
   *
   * By default the wait is bounded by response completion: if the response
   * finishes before the commit event, we fall through to a short safety
   * timeout. Cloud sessions instead pass {@link IWaitForCommitOptions.deferred}
   * because their commit is delayed by a confirmation round-trip and network
   * delegation — response completion fires early (at the confirmation) and is
   * not a signal that the commit won't come — so they skip the response race
   * and use a longer timeout.
   */
  async _waitForCommittedSession(untitledResource, responseCompletePromise, responseCreatedPromise, options3) {
    const timeoutMs = options3?.deferred ? 5 * 6e4 : 5e3;
    const disposables = new DisposableStore();
    try {
      const commitPromise = new Promise((resolve3) => {
        disposables.add(this.chatSessionsService.onDidCommitSession((e4) => {
          if (isEqual2(e4.original, untitledResource)) {
            resolve3(e4.committed);
          }
        }));
      });
      if (!options3?.deferred && responseCompletePromise) {
        const committed = await Promise.race([
          commitPromise.then((uri4) => ({ committed: true, uri: uri4 })),
          responseCompletePromise.then(() => ({ committed: false }))
        ]);
        if (committed.committed) {
          return committed.uri;
        }
      }
      const candidates = [
        raceTimeout(commitPromise, timeoutMs).then((uri4) => uri4 ? { kind: "commit", uri: uri4 } : { kind: "timeout" })
      ];
      if (responseCreatedPromise) {
        candidates.push(responseCreatedPromise.then((r2) => r2?.isCanceled ? { kind: "cancelled" } : new Promise(() => {
        })));
      }
      const outcome = await Promise.race(candidates);
      if (outcome.kind === "commit") {
        return outcome.uri;
      }
      if (outcome.kind === "cancelled") {
        throw new CancellationError();
      }
      const response = responseCreatedPromise ? await responseCreatedPromise : void 0;
      if (response?.isCanceled) {
        throw new CancellationError();
      }
      throw new Error("Timed out waiting for session commit");
    } finally {
      disposables.dispose();
    }
  }
  /**
   * Waits for an {@link AgentSessionAdapter} with the given resource to appear
   * in the session cache (populated by {@link _refreshSessionCache}).
   * Only called once during session initialisation (after the commit event),
   * so the timeout has no performance impact on steady-state operations.
   */
  async _waitForSessionInCache(resource, token) {
    const key3 = resource.toString();
    const existing = this._sessionCache.get(key3);
    if (existing instanceof AgentSessionAdapter) {
      return existing;
    }
    const disposables = new DisposableStore();
    try {
      const sessionPromise = new Promise((resolve3) => {
        disposables.add(this.onDidChangeSessions((e4) => {
          const cached = this._sessionCache.get(key3);
          if (cached instanceof AgentSessionAdapter) {
            resolve3(cached);
          }
        }));
      });
      const result = await raceTimeout(
        token ? raceCancellationError(sessionPromise, token) : sessionPromise,
        3e4
      );
      if (!result) {
        throw new Error("Timed out waiting for committed session in cache");
      }
      return result;
    } finally {
      disposables.dispose();
    }
  }
  // -- Private --
  async _browseForRepo() {
    const repoId = await this.commandService.executeCommand(OPEN_REPO_COMMAND);
    if (repoId) {
      const uri4 = URI.from({ scheme: GITHUB_REMOTE_FILE_SCHEME, authority: "github", path: `/${repoId}/HEAD` });
      const folder = {
        root: uri4,
        workingDirectory: uri4,
        name: basename2(uri4),
        description: void 0,
        gitRepository: void 0
      };
      return {
        uri: URI.parse(`https://github.com/${repoId}`),
        label: this._labelFromUri(uri4),
        icon: this._iconFromUri(uri4),
        group: SESSION_WORKSPACE_GROUP_GITHUB,
        folders: [folder],
        requiresWorkspaceTrust: false,
        isVirtualWorkspace: true
      };
    }
    return void 0;
  }
  async _browseForGitHubContext(commandId, icon2, currentWorkspace) {
    const gitHubInfo = currentWorkspace?.folders.map((folder) => folder.gitRepository?.gitHubInfo.get()).find((info) => info !== void 0);
    const repoId = gitHubInfo ? `${gitHubInfo.owner}/${gitHubInfo.repo}` : currentWorkspace?.folders.map((folder) => githubRemoteRepoLabel(folder.root)).find((id2) => id2 !== void 0);
    const selection = await this.commandService.executeCommand(commandId, repoId);
    if (!selection) {
      return void 0;
    }
    const root = URI.from({ scheme: GITHUB_REMOTE_FILE_SCHEME, authority: "github", path: `/${selection.repoId}/HEAD` });
    return {
      uri: URI.parse(selection.url),
      label: selection.label,
      icon: icon2,
      group: SESSION_WORKSPACE_GROUP_GITHUB,
      folders: [{
        root,
        workingDirectory: root,
        name: basename2(root),
        description: void 0,
        gitRepository: void 0
      }],
      requiresWorkspaceTrust: false,
      isVirtualWorkspace: true
    };
  }
  resolveWorkspace(uri4) {
    if (uri4.scheme !== Schemas.file && uri4.scheme !== GITHUB_REMOTE_FILE_SCHEME) {
      return void 0;
    }
    const folder = {
      root: uri4,
      workingDirectory: uri4,
      name: basename2(uri4),
      description: void 0,
      gitRepository: uri4.scheme === Schemas.file ? this._getLocalGitRepository(uri4) : void 0
    };
    return {
      uri: uri4,
      label: this._labelFromUri(uri4),
      description: this._descriptionFromUri(uri4),
      group: uri4.scheme === GITHUB_REMOTE_FILE_SCHEME ? SESSION_WORKSPACE_GROUP_GITHUB : SESSION_WORKSPACE_GROUP_LOCAL,
      icon: this._iconFromUri(uri4),
      folders: [folder],
      requiresWorkspaceTrust: uri4.scheme !== GITHUB_REMOTE_FILE_SCHEME,
      isVirtualWorkspace: uri4.scheme === GITHUB_REMOTE_FILE_SCHEME
    };
  }
  _getLocalGitRepository(uri4) {
    const gitHubInfo = this._getLocalGitHubInfo(uri4);
    return {
      uri: uri4,
      workTreeUri: uri4,
      baseBranchName: void 0,
      gitHubInfo,
      resolveGitHubInfo: () => this._resolveLocalGitHubInfo(uri4, gitHubInfo)
    };
  }
  _getLocalGitHubInfo(uri4) {
    const key3 = this.uriIdentityService.extUri.getComparisonKey(uri4);
    let gitHubInfo = this._localGitHubInfo.get(key3);
    if (gitHubInfo) {
      return gitHubInfo;
    }
    if (this._localGitHubInfo.size >= 50) {
      const oldestKey = this._localGitHubInfo.keys().next().value;
      if (oldestKey !== void 0) {
        this._localGitHubInfo.delete(oldestKey);
        this._localGitHubInfoDisposables.deleteAndDispose(oldestKey);
        this._localGitHubInfoResolutionStarted.delete(oldestKey);
      }
    }
    gitHubInfo = observableValue(this, void 0);
    this._localGitHubInfo.set(key3, gitHubInfo);
    return gitHubInfo;
  }
  _resolveLocalGitHubInfo(uri4, gitHubInfo) {
    const key3 = this.uriIdentityService.extUri.getComparisonKey(uri4);
    if (this._localGitHubInfoResolutionStarted.has(key3)) {
      return;
    }
    this._localGitHubInfoResolutionStarted.add(key3);
    void this.gitService.openRepository(uri4).then((repository) => {
      if (!repository || this._localGitHubInfo.get(key3) !== gitHubInfo) {
        this._localGitHubInfoResolutionStarted.delete(key3);
        return;
      }
      this._localGitHubInfoDisposables.set(key3, autorun((reader) => {
        const repositoryInfo = getGitHubRemoteInfo(repository.state.read(reader));
        gitHubInfo.set(repositoryInfo ? { owner: repositoryInfo.owner, repo: repositoryInfo.repo } : void 0, void 0);
      }));
    }, (error) => {
      this._localGitHubInfoResolutionStarted.delete(key3);
      this.logService.warn(`Failed to resolve GitHub repository metadata for '${uri4.toString()}'.`, error);
    });
  }
  _labelFromUri(uri4) {
    return githubRemoteRepoLabel(uri4) ?? basename2(uri4);
  }
  _descriptionFromUri(uri4) {
    if (uri4.scheme === GITHUB_REMOTE_FILE_SCHEME) {
      const parts = uri4.path.substring(1).split("/");
      return parts.length >= 2 ? parts[0] : void 0;
    }
    return this.labelService.getUriLabel(dirname2(uri4), { relative: false });
  }
  _iconFromUri(uri4) {
    if (uri4.scheme === GITHUB_REMOTE_FILE_SCHEME) {
      return Codicon.repo;
    }
    return Codicon.folder;
  }
  _ensureSessionCache() {
    if (this._sessionCache.size > 0) {
      return;
    }
    this._refreshSessionCache();
  }
  _invalidateGroupingCaches() {
    this._chatByRawSessionIdCache = void 0;
    this._groupIdByChatIdCache = void 0;
    this._chatIdsByGroupIdCache = void 0;
  }
  _ensureGroupingCaches() {
    if (this._chatByRawSessionIdCache && this._groupIdByChatIdCache && this._chatIdsByGroupIdCache) {
      return;
    }
    const chats = Array.from(this._sessionCache.values());
    const chatByRawSessionId = /* @__PURE__ */ new Map();
    for (const chat of chats) {
      chatByRawSessionId.set(chat.resource.path.slice(1), chat);
    }
    const groupIdByChatId = /* @__PURE__ */ new Map();
    const chatsByGroupId = /* @__PURE__ */ new Map();
    const resolveGroupId = (chat) => {
      const cachedGroupId = groupIdByChatId.get(chat.sessionId);
      if (cachedGroupId) {
        return cachedGroupId;
      }
      const trail = [];
      const seen = /* @__PURE__ */ new Set();
      let current = chat;
      for (let depth = 0; depth < 100; depth++) {
        const currentCachedGroupId = groupIdByChatId.get(current.sessionId);
        if (currentCachedGroupId) {
          for (const trailChat of trail) {
            groupIdByChatId.set(trailChat.sessionId, currentCachedGroupId);
          }
          return currentCachedGroupId;
        }
        if (seen.has(current.sessionId)) {
          for (const trailChat of trail) {
            groupIdByChatId.set(trailChat.sessionId, current.sessionId);
          }
          return current.sessionId;
        }
        trail.push(current);
        seen.add(current.sessionId);
        const parentRawSessionId = this._getDirectParentRawSessionId(current);
        if (!parentRawSessionId) {
          for (const trailChat of trail) {
            groupIdByChatId.set(trailChat.sessionId, current.sessionId);
          }
          return current.sessionId;
        }
        const parentChat = chatByRawSessionId.get(parentRawSessionId);
        if (!parentChat) {
          const syntheticGroupId = this._getSyntheticGroupId(parentRawSessionId);
          for (const trailChat of trail) {
            groupIdByChatId.set(trailChat.sessionId, syntheticGroupId);
          }
          return syntheticGroupId;
        }
        current = parentChat;
      }
      groupIdByChatId.set(chat.sessionId, chat.sessionId);
      return chat.sessionId;
    };
    for (const chat of chats) {
      const groupId = resolveGroupId(chat);
      const groupChats = chatsByGroupId.get(groupId) ?? [];
      groupChats.push(chat);
      chatsByGroupId.set(groupId, groupChats);
    }
    const chatIdsByGroupId = /* @__PURE__ */ new Map();
    for (const [groupId, groupChats] of chatsByGroupId) {
      groupChats.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
      chatIdsByGroupId.set(groupId, groupChats.map((chat) => chat.sessionId));
    }
    this._chatByRawSessionIdCache = chatByRawSessionId;
    this._groupIdByChatIdCache = groupIdByChatId;
    this._chatIdsByGroupIdCache = chatIdsByGroupId;
  }
  /**
   * Cleans up a temp session (one that hasn't been committed) from the cache.
   * Used when delete/archive is invoked on a session that is still pending
   * commit (e.g. was stopped before the agent created a worktree).
   */
  _cleanupTempSession(sessionId) {
    const chatSession = this._findChatSession(sessionId);
    if (!chatSession) {
      return;
    }
    const key3 = chatSession.resource.toString();
    this._sessionCache.delete(key3);
    this._invalidateGroupingCaches();
    this._sessionGroupCache.delete(chatSession.sessionId);
    if (this._newSessions.has(chatSession.sessionId)) {
      this._newSessions.deleteAndLeak(chatSession.sessionId);
    }
    const removedSession = this._chatToSession(chatSession);
    this._sessionGroupCache.delete(chatSession.sessionId);
    this._onDidChangeSessions.fire({ added: [], removed: [removedSession], changed: [] });
    if (isNewSession(chatSession)) {
      chatSession.dispose();
    }
  }
  _refreshSessionCache() {
    const currentKeys = /* @__PURE__ */ new Set();
    const addedData = [];
    const changedData = [];
    const sessionsToMarkUnread = [];
    let cacheChanged = false;
    for (const session of this.agentSessionsService.model.sessions) {
      if (session.providerType !== AgentSessionProviders.Background && session.providerType !== AgentSessionProviders.Cloud) {
        continue;
      }
      const key3 = session.resource.toString();
      currentKeys.add(key3);
      const existing = this._sessionCache.get(key3);
      if (existing) {
        const previousStatus = existing.status.get();
        if (existing.update(session)) {
          changedData.push(existing);
        }
        const currentStatus = existing.status.get();
        if (previousStatus === 1 /* InProgress */ && currentStatus !== 1 /* InProgress */ && currentStatus !== 0 /* Untitled */ && existing.isRead.get()) {
          sessionsToMarkUnread.push(session);
        }
      } else {
        const adapter = new AgentSessionAdapter(session, this.id, this.gitHubService, this.pullRequestIconCache);
        this._sessionCache.set(key3, adapter);
        addedData.push(adapter);
        cacheChanged = true;
      }
    }
    const removedData = [];
    for (const [key3, adapter] of this._sessionCache) {
      if (!currentKeys.has(key3) && adapter instanceof AgentSessionAdapter && !this._inFlightCommits.has(key3)) {
        removedData.push(adapter);
        cacheChanged = true;
      }
    }
    let removedGroupIds;
    if (removedData.length > 0 && this._isMultiChatEnabled()) {
      removedGroupIds = /* @__PURE__ */ new Map();
      for (const removed of removedData) {
        removedGroupIds.set(removed, this._getGroupIdForChat(removed));
      }
    }
    for (const removed of removedData) {
      this._sessionCache.delete(removed.resource.toString());
    }
    if (cacheChanged) {
      this._invalidateGroupingCaches();
    }
    if (addedData.length > 0 || removedData.length > 0 || changedData.length > 0) {
      if (this._isMultiChatEnabled()) {
        this._refreshSessionCacheMultiChat(addedData, removedData, changedData, removedGroupIds);
      } else {
        this._onDidChangeSessions.fire({
          added: addedData.map((d) => this._chatToSession(d)),
          removed: removedData.map((d) => this._chatToSession(d)),
          changed: changedData.map((d) => this._chatToSession(d))
        });
      }
    }
    for (const session of sessionsToMarkUnread) {
      session.setRead(false);
    }
  }
  _updateResourceLabelHomes() {
    const sessionStateRoot = buildLocalSessionStateUri(this.pathService.userHome({ preferLocal: true }));
    const homes = [];
    for (const session of this._sessionCache.values()) {
      if (session.sessionType === SessionType.CopilotCLI) {
        const rawId = session.resource.path.replace(/^\//, "");
        if (rawId) {
          homes.push({ uri: URI.joinPath(sessionStateRoot, rawId), label: `${CopilotCLISessionType.label}/${localize(5058, null)}` });
        }
      }
    }
    this._resourceLabelHomes.set(homes);
  }
  _refreshSessionCacheMultiChat(addedData, removedData, changedData, removedGroupIds) {
    const trulyRemovedSessions = [];
    const changedSessionIds = /* @__PURE__ */ new Set();
    for (const removed of removedData) {
      const sessionId = removedGroupIds.get(removed);
      const remainingChatIds = this._getChatIdsInGroup(sessionId);
      if (remainingChatIds.length > 0) {
        this._sessionGroupCache.delete(sessionId);
        this._onDidGroupMembershipChange.fire({ sessionId });
        if (!changedSessionIds.has(sessionId)) {
          changedSessionIds.add(sessionId);
          const primaryChat = this._sessionCache.get(this._localIdFromchatId(remainingChatIds[0]));
          if (primaryChat) {
            changedData.push(primaryChat);
          }
        }
      } else {
        this._sessionGroupCache.delete(sessionId);
        trulyRemovedSessions.push({ chat: removed, groupId: sessionId });
      }
    }
    const newSessions = [];
    for (const added of addedData) {
      const groupId = this._getGroupIdForChat(added);
      const groupChatIds = this._getChatIdsInGroup(groupId);
      if (groupChatIds.length > 1) {
        this._sessionGroupCache.delete(groupId);
        this._onDidGroupMembershipChange.fire({ sessionId: groupId });
        if (!changedSessionIds.has(groupId)) {
          changedSessionIds.add(groupId);
          changedData.push(added);
        }
      } else {
        newSessions.push(added);
      }
    }
    const seenChanged = /* @__PURE__ */ new Set();
    const deduplicatedChanged = [];
    for (const d of changedData) {
      const groupId = this._getGroupIdForChat(d);
      if (!seenChanged.has(groupId)) {
        seenChanged.add(groupId);
        deduplicatedChanged.push(d);
      }
    }
    this._onDidChangeSessions.fire({
      added: newSessions.map((d) => this._chatToSession(d)),
      removed: trulyRemovedSessions.map(({ chat, groupId }) => {
        const session = this._sessionGroupCache.get(groupId);
        this._sessionGroupCache.delete(groupId);
        return session ?? this._chatToSession(chat);
      }),
      changed: deduplicatedChanged.map((d) => this._chatToSession(d))
    });
  }
  _findChatSession(chatId) {
    const directMatch = this._sessionCache.get(this._localIdFromchatId(chatId));
    if (directMatch) {
      return directMatch;
    }
    const groupChatIds = this._getChatIdsInGroup(chatId);
    const firstChatId = groupChatIds[0];
    return firstChatId ? this._sessionCache.get(this._localIdFromchatId(firstChatId)) : void 0;
  }
  _findAgentSession(chatId) {
    const adapter = this._findChatSession(chatId);
    if (!adapter) {
      return void 0;
    }
    return this.agentSessionsService.getSession(adapter.resource);
  }
  /**
   * Returns the group ID for a given chat.
   * Grouping is derived from `sessionParentId` in metadata (for committed sessions)
   * or from `PARENT_SESSION_OPTION_ID` in selected options (for uncommitted sessions).
   * If the root chat is not loaded, a synthetic provider-scoped group ID is used.
   */
  _getGroupIdForChat(chat) {
    this._ensureGroupingCaches();
    return this._groupIdByChatIdCache?.get(chat.sessionId) ?? chat.sessionId;
  }
  /**
   * Returns all chat IDs that belong to the given group,
   * ordered by creation time (root session first).
   */
  _getChatIdsInGroup(groupId) {
    this._ensureGroupingCaches();
    return this._chatIdsByGroupIdCache?.get(groupId) ?? [];
  }
  _getDirectParentRawSessionId(chat) {
    const agentSession = this.agentSessionsService.getSession(chat.resource);
    const sessionParentId = agentSession?.metadata?.sessionParentId;
    if (typeof sessionParentId === "string" && sessionParentId.length > 0) {
      return sessionParentId;
    }
    if (isNewSession(chat)) {
      const parentOption = chat.selectedOptions.get(PARENT_SESSION_OPTION_ID);
      if (parentOption?.id) {
        return parentOption.id;
      }
    }
    return void 0;
  }
  _getSyntheticGroupId(rawSessionId) {
    return `${this.id}:group:${rawSessionId}`;
  }
  _findSession(sessionId) {
    return this._sessionGroupCache.get(sessionId);
  }
  _localIdFromchatId(chatId) {
    const prefix = `${this.id}:`;
    return chatId.startsWith(prefix) ? chatId.substring(prefix.length) : chatId;
  }
  /**
   * Get (creating on first use) the membership signal for a group, keyed by
   * `sessionId`. The group's chats observable observes this signal so a membership
   * change recomputes only the affected group; the single fan-out subscription in
   * `_groupMembershipSubscription` triggers it.
   */
  _getGroupMembershipSignal(sessionId) {
    let signal = this._groupMembershipSignals.get(sessionId);
    if (!signal) {
      signal = observableSignal(this);
      this._groupMembershipSignals.set(sessionId, signal);
    }
    return signal;
  }
  /**
   * Structural equality for a group's chat list keyed on each chat's resource.
   * `_toChat` returns a fresh wrapper on every recompute, so identity comparison
   * would always differ; comparing resources lets a recompute that produced the
   * same set of chats avoid propagating downstream. Uses the URI identity comparer
   * so scheme-specific path casing and normalization are handled consistently.
   */
  _chatArraysEqual(a, b) {
    if (a === b) {
      return true;
    }
    if (!a || !b || a.length !== b.length) {
      return false;
    }
    return a.every((chat, i2) => this.uriIdentityService.extUri.isEqual(chat.resource, b[i2].resource));
  }
  /**
   * Wraps a primary {@link ICopilotChatSession} and its sibling chats into an {@link ISession}.
   * When multi-chat is enabled, the `chats` observable is derived from `sessionParentId`
   * metadata and updates when group membership changes.
   * When disabled, each session has exactly one chat.
   */
  _chatToSession(chat) {
    if (!this._isMultiChatEnabled()) {
      return this._chatToSingleChatSession(chat);
    }
    const sessionId = this._getGroupIdForChat(chat);
    const cached = this._sessionGroupCache.get(sessionId);
    if (cached) {
      return cached;
    }
    const mainChatIds = this._getChatIdsInGroup(sessionId);
    const firstChatId = mainChatIds[0];
    const primaryChat = firstChatId ? this._sessionCache.get(this._localIdFromchatId(firstChatId)) ?? chat : chat;
    const mainChat = primaryChat.mainChat;
    const membershipSignal = this._getGroupMembershipSignal(sessionId);
    const groupChatsObs = derivedOpts({
      owner: this,
      equalsFn: (a, b) => this._chatArraysEqual(a, b)
    }, (reader) => {
      membershipSignal.read(reader);
      const chatIds = this._getChatIdsInGroup(sessionId);
      if (chatIds.length === 0) {
        return void 0;
      }
      const resolved = [];
      for (const id2 of chatIds) {
        const c = this._sessionCache.get(this._localIdFromchatId(id2));
        if (c) {
          resolved.push(c);
        }
      }
      if (resolved.length === 0) {
        return void 0;
      }
      return resolved.map((c) => this._toChat(c));
    });
    const chatsObs = derived((reader) => {
      const groupChats = groupChatsObs.read(reader);
      return groupChats ?? [mainChat.read(reader)];
    });
    const session = {
      sessionId,
      resource: primaryChat.resource,
      providerId: primaryChat.providerId,
      sessionType: primaryChat.sessionType,
      icon: primaryChat.icon,
      createdAt: primaryChat.createdAt,
      workspace: primaryChat.workspace,
      hasGitRepository: primaryChat.hasGitRepository,
      title: primaryChat.title,
      updatedAt: chatsObs.map((chats, reader) => this._latestDate(chats, (c) => c.updatedAt.read(reader))),
      status: chatsObs.map((chats, reader) => this._aggregateStatus(chats, reader)),
      changesets: this._createChangesets(primaryChat.sessionType, primaryChat.workspace, chatsObs),
      changes: primaryChat.changes,
      modelId: primaryChat.modelId,
      mode: primaryChat.mode,
      loading: primaryChat.loading,
      isArchived: primaryChat.isArchived,
      isRead: chatsObs.map((chats, reader) => chats.every((c) => c.isRead.read(reader))),
      description: primaryChat.description,
      lastTurnEnd: chatsObs.map((chats, reader) => this._latestDate(chats, (c) => c.lastTurnEnd.read(reader))),
      chats: chatsObs,
      mainChat,
      capabilities: constObservable({
        supportsMultipleChats: primaryChat.sessionType === CopilotCLISessionType.id && this._isMultiChatEnabled(),
        supportsRename: this._sessionTypeSupportsRename(primaryChat.sessionType),
        supportsDelete: this._sessionTypeSupportsDelete(primaryChat.sessionType),
        // Cloud-agent sessions run worktreeCreated tasks server-side during
        // environment provisioning, so the agents-window dispatcher must
        // not re-run them. Other session types don't.
        runsWorktreeCreatedTasks: primaryChat.sessionType === CopilotCloudSessionType.id
      })
    };
    this._sessionGroupCache.set(sessionId, session);
    return session;
  }
  _chatToSingleChatSession(chat) {
    const mainChat = chat.mainChat;
    const chatsObs = mainChat.map((c) => [c]);
    const changesets = this._createChangesets(chat.sessionType, chat.workspace, chatsObs);
    return {
      sessionId: chat.sessionId,
      resource: chat.resource,
      providerId: chat.providerId,
      sessionType: chat.sessionType,
      icon: chat.icon,
      createdAt: chat.createdAt,
      workspace: chat.workspace,
      hasGitRepository: chat.hasGitRepository,
      title: chat.title,
      updatedAt: chat.updatedAt,
      status: chat.status,
      changesets,
      changes: chat.changes,
      modelId: chat.modelId,
      mode: chat.mode,
      loading: chat.loading,
      isArchived: chat.isArchived,
      isRead: chat.isRead,
      description: chat.description,
      lastTurnEnd: chat.lastTurnEnd,
      chats: chatsObs,
      mainChat,
      capabilities: constObservable({
        supportsMultipleChats: false,
        supportsRename: this._sessionTypeSupportsRename(chat.sessionType),
        supportsDelete: this._sessionTypeSupportsDelete(chat.sessionType),
        runsWorktreeCreatedTasks: chat.sessionType === CopilotCloudSessionType.id
      })
    };
  }
  /**
   * Whether {@link renameChat} can rename a session of the given type. Only
   * the CopilotCLI backend exposes a rename command; others throw.
   */
  _sessionTypeSupportsRename(sessionType) {
    return sessionType === CopilotCLISessionType.id;
  }
  _sessionTypeSupportsDelete(sessionType) {
    return sessionType === CopilotCLISessionType.id;
  }
  _toChat(chat, resource, interactivity = "full" /* Full */) {
    return {
      resource: resource ?? chat.resource,
      createdAt: chat.createdAt,
      title: chat.title,
      updatedAt: chat.updatedAt,
      status: chat.status,
      changes: chat.changes,
      checkpoints: chat.checkpoints,
      modelId: chat.modelId,
      modelSource: chat.modelSource,
      mode: chat.mode,
      isArchived: chat.isArchived,
      isRead: chat.isRead,
      interactivity: constObservable(interactivity),
      description: chat.description,
      lastTurnEnd: chat.lastTurnEnd
    };
  }
  _createChangesets(sessionType, workspaceObs, chatsObs) {
    return createChangesets2(sessionType, workspaceObs, chatsObs, this.instantiationService);
  }
  _latestDate(chats, getter) {
    let latest;
    for (const chat of chats) {
      const d = getter(chat);
      if (d && (!latest || d > latest)) {
        latest = d;
      }
    }
    return latest;
  }
  _aggregateStatus(chats, reader) {
    for (const c of chats) {
      if (c.status.read(reader) === 2 /* NeedsInput */) {
        return 2 /* NeedsInput */;
      }
    }
    for (const c of chats) {
      if (c.status.read(reader) === 1 /* InProgress */) {
        return 1 /* InProgress */;
      }
    }
    return chats[0].status.read(reader);
  }
  _isMultiChatEnabled() {
    return this._multiChatEnabled;
  }
};

CopilotChatSessionsProvider = __decorateClass([
  __decorateParam(0, IAgentSessionsService),
  __decorateParam(1, IChatService),
  __decorateParam(2, IChatSessionsService),
  __decorateParam(3, IDialogService),
  __decorateParam(4, ICommandService),
  __decorateParam(5, IInstantiationService),
  __decorateParam(6, ILanguageModelsService),
  __decorateParam(7, ILanguageModelToolsService),
  __decorateParam(8, IConfigurationService),
  __decorateParam(9, IAgentHostEnablementService),
  __decorateParam(10, ILogService),
  __decorateParam(11, IGitHubService),
  __decorateParam(12, IPullRequestIconCache),
  __decorateParam(13, ILabelService),
  __decorateParam(14, IChatModeService),
  __decorateParam(15, IUriIdentityService),
  __decorateParam(16, IPathService),
  __decorateParam(17, IGitService)
], CopilotChatSessionsProvider);
export { isNewSession, buildChatFromSession, setIfChanged, dateEquals2, markdownStringEquals2, isModelOptionGroup, isRepositoriesOptionGroup, toSessionStatus, githubRemoteRepoLabel, CopilotCloudSessionType, STORAGE_KEY_ISOLATION_MODE, STORAGE_KEY_USE_SANDBOX, OPEN_REPO_COMMAND, OPEN_ISSUE_COMMAND, OPEN_PULL_REQUEST_COMMAND, COPILOT_PROVIDER_ID, COPILOT_MULTI_CHAT_SETTING, REPOSITORY_OPTION_ID, PARENT_SESSION_OPTION_ID, BRANCH_OPTION_ID, ISOLATION_OPTION_ID, AGENT_OPTION_ID, CopilotCLISession, RemoteNewSession, AgentSessionAdapter, CopilotChatSessionsProvider };
