// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/node/agentHostPullRequestOperationHandler.ts
import { parseChangesetUri } from "./module-0097.mjs";
import { AHP_AUTH_REQUIRED, AHP_SESSION_NOT_FOUND, ProtocolError } from "./module-0056.mjs";
import { JsonRpcErrorCodes } from "./module-0055.mjs";
import { readSessionGitHubState, readSessionGitState } from "./module-0047.mjs";
import { URI } from "./module-0023.mjs";
import { localize } from "./module-0012.mjs";
import { IAgentHostGitService, parseUpstreamBranchName } from "./module-0162.mjs";
import { buildConversationContext } from "./module-0486.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IAgentHostAuthenticationService } from "./module-0201.mjs";
import { IAgentHostOctoKitService } from "./module-0524.mjs";
import { IAgentHostGitHubEndpointService } from "./module-0161.mjs";
import { ICopilotApiService } from "./module-0168.mjs";
import { IAgentBranchNameGenerator } from "./module-0174.mjs";
import { ILogService } from "./module-0084.mjs";


// src/vs/platform/agentHost/node/agentHostPullRequestOperationHandler.ts
var MAX_PR_CONVERSATION_CONTEXT_CHARS = 12e3;

var MAX_PR_CHANGE_SUMMARY_CHARS = 4e3;

var AgentHostPullRequestOperationHandler = class {
  constructor(_draft, _autoMergeMethod, _getSessionState, _resolveBaseBranchName, _onPullRequestCreated, _authenticationService, _gitService, _octoKitService, _gitHubEndpointService, _copilotApiService, _branchNameGenerator, _logService) {
    this._draft = _draft;
    this._autoMergeMethod = _autoMergeMethod;
    this._getSessionState = _getSessionState;
    this._resolveBaseBranchName = _resolveBaseBranchName;
    this._onPullRequestCreated = _onPullRequestCreated;
    this._authenticationService = _authenticationService;
    this._gitService = _gitService;
    this._octoKitService = _octoKitService;
    this._gitHubEndpointService = _gitHubEndpointService;
    this._copilotApiService = _copilotApiService;
    this._branchNameGenerator = _branchNameGenerator;
    this._logService = _logService;
  }
  static {
    this.OPERATION_CREATE_PR = "create-pr";
  }
  static {
    this.OPERATION_CREATE_DRAFT_PR = "create-draft-pr";
  }
  static {
    this.OPERATION_CREATE_PR_AUTO_MERGE = "create-pr-auto-merge";
  }
  static {
    this.OPERATION_CREATE_PR_AUTO_SQUASH = "create-pr-auto-squash";
  }
  static {
    this.OPERATION_CREATE_PR_AUTO_REBASE = "create-pr-auto-rebase";
  }
  async invoke(params, token) {
    const abortController = new AbortController();
    if (token.isCancellationRequested) {
      abortController.abort();
    }
    const cancellationListener = token.onCancellationRequested(() => abortController.abort());
    try {
      return await this._invoke(params, token, abortController.signal);
    } finally {
      cancellationListener.dispose();
    }
  }
  async _invoke(params, token, signal) {
    const parsed = parseChangesetUri(params.channel);
    if (!parsed) {
      throw new ProtocolError(JsonRpcErrorCodes.InvalidParams, `Not a changeset URI: ${params.channel}`);
    }
    this._throwIfCancelled(token);
    const sessionUri = parsed.sessionUri;
    const sessionState = this._getSessionState(sessionUri);
    if (!sessionState) {
      throw new ProtocolError(AHP_SESSION_NOT_FOUND, `Session not found: ${sessionUri}`);
    }
    const workingDirectoryStr = sessionState.workingDirectories?.[0];
    if (!workingDirectoryStr) {
      throw new ProtocolError(JsonRpcErrorCodes.InternalError, `Session has no working directory: ${sessionUri}`);
    }
    const gitHubState = readSessionGitHubState(sessionState._meta);
    if (!gitHubState?.owner || !gitHubState?.repo) {
      throw new ProtocolError(
        JsonRpcErrorCodes.InternalError,
        `Session's working directory is not a GitHub-backed git repo: ${sessionUri}`
      );
    }
    const workingDirectory = URI.parse(workingDirectoryStr);
    const storedGitState = readSessionGitState(sessionState._meta);
    const effectiveBaseBranch = await this._resolveBaseBranchName(sessionUri);
    let gitState = await this._gitService.getSessionGitState(workingDirectory, effectiveBaseBranch) ?? storedGitState;
    let branchName = gitState?.branchName ?? await this._gitService.getCurrentBranch(workingDirectory);
    if (!branchName) {
      throw new ProtocolError(JsonRpcErrorCodes.InternalError, `Could not determine current branch for ${workingDirectory}`);
    }
    const defaultBranch = await this._gitService.getDefaultBranch(workingDirectory);
    const baseBranchName = effectiveBaseBranch ?? gitState?.baseBranchName ?? defaultBranch?.name;
    if (!baseBranchName) {
      throw new ProtocolError(JsonRpcErrorCodes.InternalError, `Could not determine base branch for ${workingDirectory}`);
    }
    const repoResource = this._gitHubEndpointService.getRepoResource();
    const authToken = this._authenticationService.getAuthToken({
      resource: repoResource.resource,
      scopes: repoResource.scopes_supported
    });
    if (!authToken) {
      throw new ProtocolError(
        AHP_AUTH_REQUIRED,
        localize(2254, null),
        [repoResource]
      );
    }
    const hasUncommitted = await this._gitService.hasUncommittedChanges(workingDirectory);
    if (hasUncommitted && branchName === baseBranchName) {
      const branchPrefix = sessionState.config?.values["worktreeBranchPrefix" /* WorktreeBranchPrefix */];
      try {
        const generatedBranchName = await this._branchNameGenerator.generateBranchName({
          sessionId: URI.parse(sessionUri).path.split("/").filter(Boolean).pop() ?? sessionUri,
          message: sessionState.turns.find((turn) => turn.message.text.trim())?.message.text,
          githubToken: authToken,
          signal,
          branchPrefix: typeof branchPrefix === "string" ? branchPrefix : void 0,
          branchNameCollides: (candidate) => this._gitService.branchExists(workingDirectory, candidate).catch(() => true)
        });
        this._throwIfCancelled(token);
        this._logService.info(`[AgentHostPullRequestOperationHandler] Creating branch ${generatedBranchName} for session ${sessionUri}`);
        await this._gitService.createBranch(workingDirectory, generatedBranchName, { checkout: true });
        branchName = generatedBranchName;
        gitState = await this._gitService.getSessionGitState(workingDirectory, effectiveBaseBranch);
      } catch (err) {
        this._throwIfCancelled(token);
        throw new ProtocolError(JsonRpcErrorCodes.InternalError, `Failed to create a branch before creating a pull request: ${err instanceof Error ? err.message : String(err)}`);
      }
    }
    if (hasUncommitted) {
      this._throwIfCancelled(token);
      this._logService.info(`[AgentHostPullRequestOperationHandler] Committing uncommitted changes for session ${sessionUri}`);
      try {
        await this._gitService.commitAll(workingDirectory, this._formatCommitMessage(branchName));
      } catch (err) {
        this._throwIfCancelled(token);
        throw new ProtocolError(JsonRpcErrorCodes.InternalError, `Failed to commit changes before creating a pull request: ${err instanceof Error ? err.message : String(err)}`);
      }
    }
    this._throwIfCancelled(token);
    const branchChanges = await this._gitService.computeSessionFileDiffs(workingDirectory, { sessionUri, baseBranch: baseBranchName });
    if (branchChanges === void 0) {
      throw new ProtocolError(JsonRpcErrorCodes.InternalError, localize(2262, null));
    }
    if (branchChanges !== void 0 && branchChanges.length === 0) {
      throw new ProtocolError(JsonRpcErrorCodes.InternalError, localize(2270, null));
    }
    this._throwIfCancelled(token);
    const githubHeadOwner = gitState?.githubHeadOwner;
    const upstreamBranch = githubHeadOwner ? parseUpstreamBranchName(gitState?.upstreamBranchName) : void 0;
    const headOwner = upstreamBranch && githubHeadOwner ? githubHeadOwner : gitHubState.owner;
    const headBranch = upstreamBranch?.branch ?? branchName;
    const pushRef = headBranch === branchName ? branchName : `${branchName}:${headBranch}`;
    const createHead = headOwner === gitHubState.owner ? headBranch : `${headOwner}:${headBranch}`;
    this._logService.info(`[AgentHostPullRequestOperationHandler] Pushing branch ${branchName} to ${upstreamBranch?.remote ?? "origin"} for session ${sessionUri}`);
    const upstreamPresent = await this._gitService.hasUpstream(workingDirectory, branchName);
    this._throwIfCancelled(token);
    try {
      await this._gitService.push(workingDirectory, { remote: upstreamBranch?.remote, ref: pushRef, setUpstream: !upstreamPresent });
    } catch (err) {
      this._throwIfCancelled(token);
      throw new ProtocolError(JsonRpcErrorCodes.InternalError, `Failed to push branch '${branchName}': ${err instanceof Error ? err.message : String(err)}`);
    }
    this._throwIfCancelled(token);
    const existing = await this._octoKitService.findPullRequestByHeadBranch(gitHubState.owner, gitHubState.repo, headBranch, authToken, signal, headOwner);
    if (existing) {
      this._throwIfCancelled(token);
      return await this._finalize(existing, true, sessionUri, gitHubState.owner, gitHubState.repo, branchName, authToken, signal, token);
    }
    this._throwIfCancelled(token);
    const generated = await this._generateTitleAndDescription(sessionState, branchName, baseBranchName, branchChanges, signal, token);
    const title = generated?.title ?? this._formatTitle(branchName);
    const body = generated?.description ?? this._formatBody(branchName, baseBranchName);
    this._throwIfCancelled(token);
    this._logService.info(`[AgentHostPullRequestOperationHandler] Creating ${this._draft ? "draft " : ""}PR ${gitHubState.owner}/${gitHubState.repo} ${createHead} -> ${baseBranchName}`);
    let created;
    try {
      created = await this._octoKitService.createPullRequest(
        gitHubState.owner,
        gitHubState.repo,
        title,
        body,
        createHead,
        baseBranchName,
        this._draft,
        authToken,
        signal
      );
    } catch (err) {
      this._throwIfCancelled(token);
      let foundAfterFailure;
      try {
        foundAfterFailure = await this._octoKitService.findPullRequestByHeadBranch(gitHubState.owner, gitHubState.repo, headBranch, authToken, signal, headOwner);
      } catch {
        this._throwIfCancelled(token);
        throw err;
      }
      if (foundAfterFailure) {
        this._throwIfCancelled(token);
        return await this._finalize(foundAfterFailure, true, sessionUri, gitHubState.owner, gitHubState.repo, branchName, authToken, signal, token);
      }
      throw err;
    }
    this._throwIfCancelled(token);
    return await this._finalize(created, false, sessionUri, gitHubState.owner, gitHubState.repo, branchName, authToken, signal, token);
  }
  /**
   * Notifies listeners that the pull request now exists, optionally enables
   * auto-merge with the configured {@link AutoMergeMethod} (best-effort: a
   * failure to enable auto-merge does not fail the operation), and builds the
   * result message describing what happened.
   */
  async _finalize(pr, isExisting, sessionUri, owner, repo, branchName, authToken, signal, token) {
    if (!this._autoMergeMethod) {
      this._onPullRequestCreated({ sessionKey: sessionUri, pullRequestUrl: pr.url, branchName });
      return this._createResult(pr, this._buildMessage(pr, isExisting, "none", void 0));
    }
    let autoMergeError;
    let autoMergeOutcome = "none";
    if (pr.nodeId) {
      try {
        await this._octoKitService.enablePullRequestAutoMerge(pr.nodeId, this._autoMergeMethod, authToken, signal);
        autoMergeOutcome = "enabled";
      } catch (err) {
        this._throwIfCancelled(token);
        autoMergeError = err instanceof Error ? err.message : String(err);
        autoMergeOutcome = "failed";
        this._logService.warn(`[AgentHostPullRequestOperationHandler] Failed to enable auto-merge for ${owner}/${repo}#${pr.number}: ${autoMergeError}`);
      }
    } else {
      autoMergeError = localize(2256, null);
      autoMergeOutcome = "failed";
      this._logService.warn(`[AgentHostPullRequestOperationHandler] Cannot enable auto-merge for ${owner}/${repo}#${pr.number}: missing pull request node id`);
    }
    this._onPullRequestCreated({ sessionKey: sessionUri, pullRequestUrl: pr.url, branchName });
    return this._createResult(pr, this._buildMessage(pr, isExisting, autoMergeOutcome, autoMergeError));
  }
  _buildMessage(pr, isExisting, autoMergeOutcome, autoMergeError) {
    let mergeMethodLabel;
    switch (this._autoMergeMethod) {
      case "SQUASH":
        mergeMethodLabel = localize(2258, null);
        break;
      case "REBASE":
        mergeMethodLabel = localize(2257, null);
        break;
      default:
        mergeMethodLabel = localize(2255, null);
        break;
    }
    if (isExisting) {
      switch (autoMergeOutcome) {
        case "enabled":
          return localize(2268, null, pr.number, pr.url, mergeMethodLabel);
        case "failed":
          return localize(2269, null, pr.number, pr.url, autoMergeError ?? "");
        default:
          return localize(2267, null, pr.number, pr.url);
      }
    }
    switch (autoMergeOutcome) {
      case "enabled":
        return localize(2264, null, pr.number, pr.url, mergeMethodLabel);
      case "failed":
        return localize(2265, null, pr.number, pr.url, autoMergeError ?? "");
      default:
        return this._draft ? localize(2266, null, pr.number, pr.url) : localize(2263, null, pr.number, pr.url);
    }
  }
  _throwIfCancelled(token) {
    if (token.isCancellationRequested) {
      throw new ProtocolError(JsonRpcErrorCodes.InternalError, localize(2260, null));
    }
  }
  _formatTitle(branchName) {
    const idx = branchName.indexOf("/");
    if (idx > 0 && idx < branchName.length - 1) {
      const prefix = branchName.substring(0, idx);
      const rest = branchName.substring(idx + 1).replace(/[-_]+/g, " ");
      return `${prefix}: ${rest}`;
    }
    return branchName.replace(/[-_]+/g, " ");
  }
  _formatCommitMessage(branchName) {
    return localize(2261, null, branchName);
  }
  _formatBody(branchName, baseBranchName) {
    return localize(2259, null, branchName, baseBranchName);
  }
  /**
   * Best-effort generation of a PR title and description using the utility
   * model. The model is given the main session conversation (only the
   * markdown text of user requests and agent responses — tool calls,
   * subagents, and reasoning are excluded and the text is character-bounded)
   * along with a summary of the changed files. Returns `undefined` when no
   * Copilot OAuth credential is available or generation fails, so the caller can fall
   * back to the branch-name based title/description. PR creation must never
   * fail just because the model is unavailable.
   */
  async _generateTitleAndDescription(sessionState, branchName, base, branchChanges, signal, token) {
    const copilotResource = this._gitHubEndpointService.getCopilotResource();
    const authToken = this._authenticationService.getAuthToken({
      resource: copilotResource.resource,
      scopes: copilotResource.scopes_supported
    });
    if (!authToken) {
      return void 0;
    }
    const conversation = buildConversationContext(sessionState.turns, { maxChars: MAX_PR_CONVERSATION_CONTEXT_CHARS });
    const changeSummary = this._summarizeDiffsForPrompt(branchChanges);
    if (!conversation && !changeSummary) {
      return void 0;
    }
    try {
      const raw = await this._copilotApiService.utilityChatCompletion(authToken, {
        messages: this._buildTitleAndDescriptionPrompt(branchName, base, conversation, changeSummary)
      }, { signal });
      this._throwIfCancelled(token);
      return this._parseTitleAndDescription(raw);
    } catch (err) {
      if (token.isCancellationRequested) {
        return void 0;
      }
      this._logService.warn(`[AgentHostPullRequestOperationHandler] Failed to generate PR title and description: ${err instanceof Error ? err.message : String(err)}`);
      return void 0;
    }
  }
  _buildTitleAndDescriptionPrompt(branchName, base, conversation, changeSummary) {
    const userSections = [
      `Branch: ${branchName}`,
      `Base branch: ${base}`
    ];
    if (changeSummary) {
      userSections.push(`Changed files:
${changeSummary}`);
    }
    if (conversation) {
      userSections.push(`Conversation (the request that produced these changes):
${conversation}`);
    }
    return [
      {
        role: "system",
        content: [
          "You write clear, concise GitHub pull request titles and descriptions.",
          'The first line of your reply is the PR title: a short imperative summary under 72 characters, with no "Title:" prefix, no surrounding quotes, and no markdown heading.',
          "After the title, add one blank line, then write the PR description in GitHub-flavored markdown.",
          "Summarize what changed and why, grounded in the conversation and changed files. Use a short paragraph and/or bullet points.",
          "Do not invent changes that are not supported by the provided context, and do not wrap the whole reply in code fences."
        ].join(" ")
      },
      {
        role: "user",
        content: userSections.join("\n\n")
      }
    ];
  }
  _summarizeDiffsForPrompt(diffs) {
    const lines = [];
    let length = 0;
    for (const diff of diffs) {
      const before = diff.before?.uri;
      const after = diff.after?.uri;
      const path = after ?? before ?? "(unknown)";
      let kind = "Edit";
      if (!before && after) {
        kind = "Create";
      } else if (before && !after) {
        kind = "Delete";
      } else if (before && after && before !== after) {
        kind = "Rename";
      }
      const line = `- ${kind}: ${this._displayUri(path)} (+${diff.diff?.added ?? 0} -${diff.diff?.removed ?? 0})`;
      lines.push(line);
      length += line.length + (lines.length > 1 ? 1 : 0);
      if (length > MAX_PR_CHANGE_SUMMARY_CHARS) {
        lines.push("[file list truncated]");
        break;
      }
    }
    return lines.join("\n");
  }
  _displayUri(uri) {
    try {
      const parsed = URI.parse(uri);
      return parsed.scheme === "file" ? parsed.fsPath : parsed.path || uri;
    } catch {
      return uri;
    }
  }
  _parseTitleAndDescription(raw) {
    let text = raw.trim().replace(/\r\n/g, "\n");
    const fenced = /^```(?:markdown|md|text)?\s*([\s\S]*?)\s*```$/i.exec(text);
    if (fenced) {
      text = fenced[1].trim();
    }
    if (!text) {
      return void 0;
    }
    const lines = text.split("\n");
    let i = 0;
    while (i < lines.length && lines[i].trim().length === 0) {
      i++;
    }
    if (i >= lines.length) {
      return void 0;
    }
    const title = lines[i].trim().replace(/^#+\s*/, "").replace(/^title:\s*/i, "").trim().replace(/^"(?<inner>.+)"$/, (_match, inner) => inner).trim();
    if (!title) {
      return void 0;
    }
    const description = lines.slice(i + 1).join("\n").trim().replace(/^description:\s*/i, "").trim();
    return { title, description };
  }
  _createResult(created, message) {
    const followUp = {
      content: { uri: created.url, contentType: "text/html" },
      external: true
    };
    return { message: { markdown: message }, followUp };
  }
};

AgentHostPullRequestOperationHandler = __decorateClass([
  __decorateParam(5, IAgentHostAuthenticationService),
  __decorateParam(6, IAgentHostGitService),
  __decorateParam(7, IAgentHostOctoKitService),
  __decorateParam(8, IAgentHostGitHubEndpointService),
  __decorateParam(9, ICopilotApiService),
  __decorateParam(10, IAgentBranchNameGenerator),
  __decorateParam(11, ILogService)
], AgentHostPullRequestOperationHandler);
export { MAX_PR_CONVERSATION_CONTEXT_CHARS, MAX_PR_CHANGE_SUMMARY_CHARS, AgentHostPullRequestOperationHandler };
