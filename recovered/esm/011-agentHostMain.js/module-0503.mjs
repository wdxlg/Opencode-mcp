// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/node/sessionPermissions.ts
import { localize } from "./module-0012.mjs";
import { URI } from "./module-0023.mjs";
import { isMacintosh, isWindows } from "./module-0013.mjs";
import { isDefined } from "./module-0008.mjs";
import { basename, dirname, isAbsolute, join, resolve } from "./module-0018.mjs";
import { Disposable } from "./module-0010.mjs";
import { CommandAutoApprover } from "./module-0505.mjs";
import { IAgentConfigurationService, getEffectiveWorkingDirectories } from "./module-0104.mjs";
import { extUri, extUriBiasedIgnorePathCase, normalizePath } from "./module-0025.mjs";
import { isAhpChatChannel, parseRequiredSessionUriFromChatUri } from "./module-0047.mjs";
import { ISessionDataService, isSessionAttachmentPath } from "./module-0139.mjs";
import { AgentHostEditAutoApprovePatternsConfigKey, AgentHostGlobalAutoApproveEnabledConfigKey, AgentHostTerminalAutoApproveEnabledConfigKey, AgentHostTerminalAutoApproveRulesConfigKey, platformRootSchema, platformSessionSchema } from "./module-0057.mjs";
import { firstParallel } from "./module-0027.mjs";
import { untildify } from "./module-0210.mjs";
import { containsCmdDelayedExpansion } from "./module-0504.mjs";
import { Schemas } from "./module-0024.mjs";
import { ALWAYS_CHECKED_EDIT_PATTERNS, DEFAULT_EDIT_AUTO_APPROVE_PATTERNS } from "./module-0052.mjs";
import { match } from "./module-0214.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ILogService } from "./module-0084.mjs";


// src/vs/platform/agentHost/node/sessionPermissions.ts
import { realpath as fsRealpath } from "fs";

import { homedir as homedir7 } from "os";

import { promisify as promisify4 } from "util";


// src/vs/platform/agentHost/node/sessionPermissions.ts
var ALLOW_SESSION_OPTION_ID = "allow-session";

var ALLOW_ONCE_OPTION = { id: "allow-once", label: localize(2634, null), kind: "approve" /* Approve */ };

var SKIP_OPTION = { id: "skip", label: localize(2636, null), kind: "deny" /* Deny */, group: 2 };

var CONFIRMATION_OPTIONS = [
  { id: ALLOW_SESSION_OPTION_ID, label: localize(2635, null), kind: "approve" /* Approve */, group: 1 },
  ALLOW_ONCE_OPTION,
  SKIP_OPTION
];

var MANAGED_CONFIRMATION_OPTIONS = [ALLOW_ONCE_OPTION, SKIP_OPTION];

var HOME_DIR = URI.file(homedir7());

var PLATFORM_RESTRICTED_DIRS = (isWindows ? [process.env.APPDATA, process.env.LOCALAPPDATA] : isMacintosh ? [homedir7() + "/Library"] : []).filter(isDefined);

var realpath3 = promisify4(fsRealpath);

function assertPathIsSafe(fsPath, _isWindows2 = isWindows) {
  if (fsPath.includes("\0")) {
    throw new Error(`Path contains null bytes: ${fsPath}`);
  }
  if (!_isWindows2) {
    return;
  }
  const colonIndex = fsPath.indexOf(":", 2);
  if (colonIndex !== -1) {
    throw new Error(`Path contains invalid characters (alternate data stream): ${fsPath}`);
  }
  const invalidChars = /[<>"|?*]/;
  const pathAfterDrive = fsPath.length > 2 ? fsPath.substring(2) : fsPath;
  if (invalidChars.test(pathAfterDrive)) {
    throw new Error(`Path contains invalid characters: ${fsPath}`);
  }
  if (fsPath.startsWith("\\\\.") || fsPath.startsWith("\\\\?")) {
    throw new Error(`Path is a reserved device path: ${fsPath}`);
  }
  const reserved = /^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])(\.|$)/i;
  const parts = fsPath.split("\\");
  for (const part of parts) {
    if (part.length === 0) {
      continue;
    }
    if (reserved.test(part)) {
      throw new Error(`Reserved device name in path: ${fsPath}`);
    }
    if (part.endsWith(".") || part.endsWith(" ")) {
      throw new Error(`Path contains invalid trailing characters: ${fsPath}`);
    }
    const tildeIndex = part.indexOf("~");
    if (tildeIndex !== -1) {
      const afterTilde = part.substring(tildeIndex + 1);
      if (afterTilde.length > 0 && /^\d/.test(afterTilde)) {
        throw new Error(`Path appears to use short filename format (8.3 names): ${fsPath}. Please use the full path.`);
      }
    }
  }
}

async function resolveRealPathForNonexistent(resource, realpath5) {
  const fsPath = resource.fsPath;
  try {
    return URI.file(await realpath5(fsPath));
  } catch (e) {
    if (e.code !== "ENOENT") {
      throw e;
    }
  }
  const tail = [basename(fsPath)];
  let current = dirname(fsPath);
  while (true) {
    const parent = dirname(current);
    if (parent === current) {
      return resource;
    }
    try {
      const resolved = await realpath5(current);
      return URI.file(join(resolved, ...tail));
    } catch (e) {
      const code = e.code;
      if (code !== "ENOENT" && code !== "ENOTDIR") {
        throw e;
      }
    }
    tail.unshift(basename(current));
    current = parent;
  }
}

var SessionPermissionManager = class extends Disposable {
  constructor(_stateManager, options, _configService, _logService, _sessionDataService) {
    super();
    this._stateManager = _stateManager;
    this._configService = _configService;
    this._logService = _logService;
    this._sessionDataService = _sessionDataService;
    this._realpath = options?.realpath ?? realpath3;
    this._commandAutoApprover = this._register(new CommandAutoApprover(this._logService));
  }
  /**
   * Initializes async resources (tree-sitter WASM) used for shell command
   * auto-approval. Await this before any session events can arrive so that
   * shell command parsing within {@link getAutoApproval} is synchronous.
   */
  initialize() {
    return this._commandAutoApprover.initialize();
  }
  // ---- Auto-approval (analogous to getPreConfirmAction) -------------------
  /**
   * Checks whether a `tool_ready` event should be auto-approved. Returns a
   * {@link ToolCallConfirmationReason} when the tool call should proceed
   * without user interaction, or `undefined` when user confirmation is
   * required.
   *
   * Checks are evaluated in order:
   * 1. Global auto-approve setting (`chat.tools.global.autoApprove`)
   * 2. Session-level bypass (`autoApprove` config)
   * 3. Per-tool session permissions (`permissions.allow`)
   * 4. Read path rules (within working directory)
   * 5. Write path rules (within working directory + glob patterns)
   * 6. Shell command rules (tree-sitter parsed, default allow/deny)
   */
  async getAutoApproval(e, sessionKey) {
    const workDirs = getEffectiveWorkingDirectories(this._stateManager, sessionKey);
    const workingDirectories = workDirs?.map((d) => URI.parse(d));
    if (e.requestSandboxBypass) {
      return void 0;
    }
    if (this.isGlobalAutoApproveEnabled()) {
      return "setting" /* Setting */;
    }
    if (this.isSessionAutoApproveEnabled(sessionKey)) {
      return "setting" /* Setting */;
    }
    if (this._isToolAllowedByPermissions(sessionKey, e.toolCallId)) {
      return "setting" /* Setting */;
    }
    const surfaceScope = this._getSurfaceEditScope(sessionKey);
    if (surfaceScope) {
      if ((e.permissionKind === "write" || e.permissionKind === "read") && e.permissionPath && surfaceScope.target && extUriBiasedIgnorePathCase.isEqual(URI.file(e.permissionPath), surfaceScope.target)) {
        this._logService.trace(`[SessionPermissionManager] Auto-approving in-scope surface ${e.permissionKind} of ${e.permissionPath}`);
        return "not-needed" /* NotNeeded */;
      }
      if (e.permissionKind === "write" || e.permissionKind === "shell") {
        this._logService.trace(`[SessionPermissionManager] Requiring confirmation for out-of-scope surface ${e.permissionKind}`);
        return void 0;
      }
    }
    if (e.permissionKind === "read" && e.permissionPath) {
      const sessionUri = URI.parse(isAhpChatChannel(sessionKey) ? parseRequiredSessionUriFromChatUri(sessionKey) : sessionKey);
      if (isSessionAttachmentPath(this._sessionDataService, sessionUri, e.permissionPath)) {
        this._logService.trace(`[SessionPermissionManager] Auto-approving session attachment read of ${e.permissionPath}`);
        return "not-needed" /* NotNeeded */;
      }
      if (await this._isReadAutoApproved(URI.file(e.permissionPath), workingDirectories)) {
        this._logService.trace(`[SessionPermissionManager] Auto-approving read of ${e.permissionPath}`);
        return "not-needed" /* NotNeeded */;
      }
      return void 0;
    }
    if (e.permissionKind === "write" && e.permissionPath) {
      if (await this._isEditAutoApproved(URI.file(e.permissionPath), workingDirectories)) {
        this._logService.trace(`[SessionPermissionManager] Auto-approving write to ${e.permissionPath}`);
        return "not-needed" /* NotNeeded */;
      }
      return void 0;
    }
    if (e.permissionKind === "shell" && e.toolInput) {
      if (!e.shellLanguage) {
        this._logService.trace("[SessionPermissionManager] Shell language is missing, requiring confirmation");
        return void 0;
      }
      if (this._configService.getRootValue(platformRootSchema, AgentHostTerminalAutoApproveEnabledConfigKey) === false) {
        return void 0;
      }
      const result = this._commandAutoApprover.shouldAutoApprove(e.toolInput, {
        autoApproveRules: this._configService.getRootValue(platformRootSchema, AgentHostTerminalAutoApproveRulesConfigKey),
        isWriteDestApproved: (dest) => this._isShellWriteDestApproved(dest, workingDirectories),
        language: e.shellLanguage
      });
      if (result === "approved") {
        this._logService.trace("[SessionPermissionManager] Auto-approving shell command");
        return "not-needed" /* NotNeeded */;
      }
      if (result === "denied") {
        this._logService.trace("[SessionPermissionManager] Shell command denied by rule");
      }
      return void 0;
    }
    return void 0;
  }
  /**
   * The edit scope of a session created by a file-bound chat surface, or
   * `undefined` for surfaces that are not file-bound.
   *
   * Returning a scope whose `target` is `undefined` is deliberate and fails
   * closed: an inline-chat session that did not record a usable target must
   * not fall back to unscoped editing, so no write auto-approves for it.
   */
  _getSurfaceEditScope(sessionKey) {
    const session = isAhpChatChannel(sessionKey) ? parseRequiredSessionUriFromChatUri(sessionKey) : sessionKey;
    const surface = this._stateManager.getSessionSurfaceMeta(session);
    if (surface?.surface !== "editorInline") {
      return void 0;
    }
    if (surface.targetUri === void 0) {
      return { target: void 0 };
    }
    try {
      return { target: URI.parse(surface.targetUri) };
    } catch {
      this._logService.warn(`[SessionPermissionManager] Ignoring malformed inline chat target ${surface.targetUri}`);
      return { target: void 0 };
    }
  }
  /**
   * Whether a write targets a file under the session attachments directory. Those files are
   * host-created **read-only snapshots** of client/derived content (pasted text/images, unsaved
   * editors, `git:` diff views); the model must never edit the copy (#331154).
   *
   * {@link _handleToolReady} hard-denies such writes when a provider raises an interactive
   * `pending_confirmation` (the auto-approve checks in {@link getAutoApproval} would otherwise
   * approve first). Note this only fires for the interactive / managed-approval flow — providers
   * that auto-approve upstream (Copilot SDK `'on'`, Claude bypass/acceptEdits, or Codex, which never
   * routes through the host permission layer) don't reach it, so the read-only presentation is the
   * primary defense there.
   */
  isForbiddenSnapshotWrite(e, sessionKey) {
    if (e.permissionKind !== "write" || !e.permissionPath) {
      return false;
    }
    const sessionUri = URI.parse(isAhpChatChannel(sessionKey) ? parseRequiredSessionUriFromChatUri(sessionKey) : sessionKey);
    return isSessionAttachmentPath(this._sessionDataService, sessionUri, e.permissionPath);
  }
  /** Whether adding a persistent terminal auto-approve rule can suppress future prompts for this shell event. */
  isAutoApproveRuleResolvable(e, sessionKey) {
    if (e.permissionKind !== "shell" || !e.toolInput || e.requestSandboxBypass || !e.shellLanguage) {
      return false;
    }
    if (this._configService.getRootValue(platformRootSchema, AgentHostTerminalAutoApproveEnabledConfigKey) === false) {
      return false;
    }
    const workDirs = getEffectiveWorkingDirectories(this._stateManager, sessionKey);
    const workingDirectories = workDirs?.map((d) => URI.parse(d));
    return this._commandAutoApprover.evaluate(e.toolInput, {
      autoApproveRules: this._configService.getRootValue(platformRootSchema, AgentHostTerminalAutoApproveRulesConfigKey),
      isWriteDestApproved: (dest) => this._isShellWriteDestApproved(dest, workingDirectories),
      language: e.shellLanguage
    }).autoApproveRuleResolvable;
  }
  /**
   * Returns whether VS Code's global auto-approve setting (`chat.tools.global.autoApprove`) is enabled.
   * When enabled, every tool call is auto-approved without changing the session's approval level in the permissions picker.
   */
  isGlobalAutoApproveEnabled() {
    return this._configService.getRootValue(platformRootSchema, AgentHostGlobalAutoApproveEnabledConfigKey) === true;
  }
  getEffectiveApprovalLevel(sessionKey) {
    return this._configService.getEffectiveValue(sessionKey, platformSessionSchema, "autoApprove" /* AutoApprove */) ?? "default";
  }
  isSessionAutoApproveEnabled(sessionKey) {
    return this.getEffectiveApprovalLevel(sessionKey) === "autoApprove";
  }
  // ---- Action construction (analogous to getPreConfirmActions) -------------
  /**
   * Constructs a `ChatToolCallReady` action from an agent
   * `pending_confirmation` signal. When the tool needs user confirmation
   * (the protocol state carries `confirmationTitle`), the standard
   * confirmation options are baked in so clients can render them directly.
   */
  createToolReadyAction(e, _sessionKey, turnId) {
    const state = e.state;
    if (state.confirmationTitle) {
      return {
        type: "chat/toolCallReady" /* ChatToolCallReady */,
        turnId,
        toolCallId: state.toolCallId,
        ...state.contributor ? { contributor: state.contributor } : {},
        ...state.intention !== void 0 ? { intention: state.intention } : {},
        invocationMessage: state.invocationMessage,
        toolInput: state.toolInput,
        confirmationTitle: state.confirmationTitle,
        riskAssessment: state.riskAssessment,
        edits: state.edits,
        editable: state.editable,
        ...state._meta ? { _meta: state._meta } : {},
        // Managed asks are one-time only. Other agents can supply tool-specific
        // buttons (e.g. ExitPlanMode's `Approve`/`Deny`) via `state.options`;
        // otherwise the standard session/once/skip set is used.
        options: e.managedApprovalRequired ? MANAGED_CONFIRMATION_OPTIONS.slice() : state.options ? state.options.slice() : CONFIRMATION_OPTIONS.slice()
      };
    }
    return {
      type: "chat/toolCallReady" /* ChatToolCallReady */,
      turnId,
      toolCallId: state.toolCallId,
      ...state.contributor ? { contributor: state.contributor } : {},
      ...state.intention !== void 0 ? { intention: state.intention } : {},
      invocationMessage: state.invocationMessage,
      toolInput: state.toolInput,
      confirmed: "not-needed" /* NotNeeded */,
      ...state._meta ? { _meta: state._meta } : {}
    };
  }
  // ---- Post-confirmation side effects -------------------------------------
  /**
   * Handles the side effect of a `ChatToolCallConfirmed` action when the
   * user selected "Allow in this Session". Adds the tool to the session's
   * permission allow list so future calls are auto-approved.
   */
  handleToolCallConfirmed(chatChannel, toolCallId, selectedOptionId) {
    if (!isAhpChatChannel(chatChannel)) {
      throw new Error(`Tool call confirmations must be handled on an AHP chat channel: ${chatChannel}`);
    }
    const sessionKey = parseRequiredSessionUriFromChatUri(chatChannel);
    if (selectedOptionId === ALLOW_SESSION_OPTION_ID) {
      const toolName = this._getToolNameForToolCall(chatChannel, toolCallId);
      if (toolName) {
        this._addToolToSessionPermissions(sessionKey, toolName);
      }
    }
  }
  // ---- Internal helpers ---------------------------------------------------
  /**
   * Whether a read of `resource` auto-approves against the session's working
   * directories: it must be contained by **at least one** root. The read's
   * symlink-resolved real path is compared too, so a symlink that crosses
   * from one root into another is *not* auto-approved (fail-closed). With a
   * single root this is identical to the previous behaviour.
   */
  async _isReadAutoApproved(resource, workingDirectories) {
    if (!workingDirectories || workingDirectories.length === 0) {
      return false;
    }
    const resourcesToCheck = this._resolveResourcesForApproval(resource);
    const match2 = await firstParallel(
      workingDirectories.map((directory) => this._isReadContainedByRoot(resourcesToCheck, directory)),
      (approved) => approved
    );
    return match2 === true;
  }
  /** Whether every resolved read candidate is contained by `workingDirectory` (or its real path). */
  async _isReadContainedByRoot(resourcesToCheckPromise, workingDirectory) {
    const [resourcesToCheck, workingDirectories] = await Promise.all([resourcesToCheckPromise, this._resolveResourcesForApproval(workingDirectory)]);
    return resourcesToCheck !== void 0 && workingDirectories !== void 0 && resourcesToCheck.every((candidate) => workingDirectories.some((directory) => this._isResourceInDirectory(candidate, directory)));
  }
  _isResourceInWorkingDirectory(resource, workingDirectory) {
    return workingDirectory !== void 0 && this._isResourceInDirectory(resource, workingDirectory);
  }
  _isResourceInDirectory(resource, directory) {
    return extUriBiasedIgnorePathCase.isEqualOrParent(normalizePath(resource), normalizePath(directory));
  }
  /**
   * Checks whether a shell write-redirection destination (e.g. the `out.txt`
   * in `echo hi > out.txt`) should be auto-approved by reusing the same
   * rules that govern write tool calls: the destination must resolve to a
   * path inside the working directory and must not match a denied glob.
   */
  _isShellWriteDestApproved(dest, workingDirectories) {
    const resource = this._resolveShellRedirectResource(dest, workingDirectories?.[0]);
    if (!resource) {
      return false;
    }
    return (workingDirectories ?? []).some((workingDirectory) => this._checkWriteResource(resource, workingDirectory));
  }
  static {
    /**
     * Matches redirect destinations whose final path is decided by the shell
     * rather than by the text: variable expansions (`$HOME/x`, `$env:TEMP/x`,
     * `%APPDATA%\x`, `!APPDATA!\x`), command substitutions (`$(pwd)/x`,
     * `` `pwd`/x ``), brace expansions, and `~` in a position {@link untildify}
     * does not handle.
     * Mirrors the workbench's file-write analyzer guard.
     *
     * See https://github.com/microsoft/vscode/issues/274166 and
     * https://github.com/microsoft/vscode/issues/274167
     */
    this._dynamicRedirectDestRegex = /[$(){}`~%]/;
  }
  /**
   * Resolves the raw text of a shell redirect destination to an absolute
   * filesystem path. `~` is expanded to the user's home directory; the
   * downstream working-directory check rejects paths that end up outside
   * the workspace. Returns `undefined` when resolution would require a
   * working directory that isn't configured, or when the destination expands
   * at runtime and therefore cannot be resolved from its text alone.
   */
  _resolveShellRedirectResource(dest, workingDirectory) {
    const trimmed = untildify(dest.trim(), homedir7());
    if (!trimmed) {
      return void 0;
    }
    if (SessionPermissionManager._dynamicRedirectDestRegex.test(trimmed) || containsCmdDelayedExpansion(trimmed)) {
      this._logService.trace(`[SessionPermissionManager] Redirect destination expands at runtime, requiring confirmation: ${dest}`);
      return void 0;
    }
    if (isAbsolute(trimmed)) {
      return URI.file(trimmed);
    }
    if (!workingDirectory) {
      return void 0;
    }
    return URI.file(resolve(workingDirectory.fsPath, trimmed));
  }
  /**
   * Determines whether a write to `resource` can be auto-approved. Mirrors the
   * checks performed by the workbench edit-confirmation pipeline:
   *
   * 1. The path is resolved through any symlinks (following ancestors that do
   *    not yet exist) so a link can't redirect an edit outside the working
   *    directory. Both the literal and resolved paths must pass every check.
   * 2. The path must be free of suspicious characters (see {@link assertPathIsSafe}).
   * 3. The path must live inside the working directory.
   * 4. The path must not target a platform-restricted location (home dotfiles,
   *    `~/Library`, `%APPDATA%`, ...).
   * 5. The path must match the edit auto-approve glob rules.
   */
  async _isEditAutoApproved(resource, workingDirectories) {
    if (!workingDirectories || workingDirectories.length === 0) {
      return false;
    }
    const resourcesToCheck = await this._resolveResourcesForApproval(resource);
    if (resourcesToCheck === void 0) {
      return false;
    }
    return workingDirectories.some((workingDirectory) => resourcesToCheck.every((candidate) => this._checkWriteResource(candidate, workingDirectory)));
  }
  /**
   * Returns the literal path plus, for absolute paths, the symlink-resolved
   * real path. Returns `undefined` when the path cannot be resolved due to
   * missing permissions, signalling that confirmation is required.
   */
  async _resolveResourcesForApproval(resource) {
    const resourcesToCheck = [resource];
    if (resource.scheme !== Schemas.file) {
      return resourcesToCheck;
    }
    try {
      const resolved = await resolveRealPathForNonexistent(resource, this._realpath);
      if (!extUri.isEqual(resolved, resource)) {
        resourcesToCheck.push(resolved);
      }
    } catch (e) {
      const code = e.code;
      if (code === "EPERM" || code === "EACCES") {
        return void 0;
      }
    }
    return resourcesToCheck;
  }
  /** Runs the write checks for a single (already symlink-resolved) resource. */
  _checkWriteResource(resource, workingDirectory) {
    try {
      assertPathIsSafe(resource.fsPath);
    } catch {
      return false;
    }
    if (!this._isResourceInWorkingDirectory(resource, workingDirectory)) {
      return false;
    }
    if (this._isPlatformRestrictedResource(resource, workingDirectory)) {
      return false;
    }
    return this._matchesEditAutoApprovePatterns(resource);
  }
  /**
   * Returns whether `resource` targets a platform-restricted location that
   * should always require confirmation. Edits within home-directory dotfiles
   * are never auto-approved. Edits within platform config directories are
   * allowed only when the working directory itself lives inside them.
   */
  _isPlatformRestrictedResource(resource, workingDirectory) {
    const relativeToHome = extUriBiasedIgnorePathCase.relativePath(HOME_DIR, resource);
    const topLevelName = relativeToHome?.split("/")[0];
    if (extUriBiasedIgnorePathCase.isEqualOrParent(resource, HOME_DIR) && topLevelName?.startsWith(".")) {
      return true;
    }
    for (const restricted of PLATFORM_RESTRICTED_DIRS) {
      const parentURI = URI.file(restricted);
      if (extUriBiasedIgnorePathCase.isEqualOrParent(resource, parentURI)) {
        return !(workingDirectory && extUriBiasedIgnorePathCase.isEqualOrParent(workingDirectory, parentURI));
      }
    }
    return false;
  }
  _matchesEditAutoApprovePatterns(resource) {
    let approved = true;
    const patterns = this._configService.getRootValue(platformRootSchema, AgentHostEditAutoApprovePatternsConfigKey) ?? DEFAULT_EDIT_AUTO_APPROVE_PATTERNS;
    const ignoreCase = extUriBiasedIgnorePathCase.ignorePathCasing(resource);
    for (const patternSet of [patterns, ALWAYS_CHECKED_EDIT_PATTERNS]) {
      for (const [pattern, configuredApproval] of Object.entries(patternSet)) {
        const isApproved = configuredApproval === true;
        if (isApproved !== approved && match(pattern, resource.fsPath, { ignoreCase })) {
          approved = isApproved;
        }
      }
    }
    return approved;
  }
  _isToolAllowedByPermissions(sessionKey, toolCallId) {
    const toolName = this._getToolNameForToolCall(sessionKey, toolCallId);
    if (!toolName) {
      return false;
    }
    const permissions = this._configService.getEffectiveValue(sessionKey, platformSessionSchema, "permissions" /* Permissions */);
    const allowed = permissions?.allow.includes(toolName) ?? false;
    if (allowed) {
      this._logService.trace(`[SessionPermissionManager] Auto-approving "${toolName}" via permissions`);
    }
    return allowed;
  }
  _getToolNameForToolCall(sessionKey, toolCallId) {
    const sessionState = this._stateManager.getSessionState(sessionKey);
    const parts = sessionState?.activeTurn?.responseParts;
    if (!parts) {
      return void 0;
    }
    for (const rp of parts) {
      if (rp.kind === "toolCall" /* ToolCall */ && rp.toolCall.toolCallId === toolCallId) {
        return rp.toolCall.toolName;
      }
    }
    return void 0;
  }
  _addToolToSessionPermissions(sessionKey, toolName) {
    const permissions = this._configService.getEffectiveValue(sessionKey, platformSessionSchema, "permissions" /* Permissions */) ?? { allow: [], deny: [] };
    if (permissions.allow.includes(toolName)) {
      return;
    }
    this._configService.updateSessionConfig(sessionKey, {
      ["permissions" /* Permissions */]: {
        allow: [...permissions.allow, toolName],
        deny: [...permissions.deny]
      }
    });
    this._logService.info(`[SessionPermissionManager] Added "${toolName}" to session permissions for ${sessionKey}`);
  }
};

SessionPermissionManager = __decorateClass([
  __decorateParam(2, IAgentConfigurationService),
  __decorateParam(3, ILogService),
  __decorateParam(4, ISessionDataService)
], SessionPermissionManager);
export { assertPathIsSafe, resolveRealPathForNonexistent, fsRealpath, homedir7, promisify4, ALLOW_SESSION_OPTION_ID, ALLOW_ONCE_OPTION, SKIP_OPTION, CONFIRMATION_OPTIONS, MANAGED_CONFIRMATION_OPTIONS, HOME_DIR, PLATFORM_RESTRICTED_DIRS, realpath3, SessionPermissionManager };
