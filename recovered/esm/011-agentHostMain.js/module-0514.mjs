// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/node/agentHostCommitOperationHandler.ts
import { parseChangesetUri } from "./module-0097.mjs";
import { AHP_AUTH_REQUIRED, AHP_SESSION_NOT_FOUND, ProtocolError } from "./module-0056.mjs";
import { JsonRpcErrorCodes } from "./module-0055.mjs";
import { URI } from "./module-0023.mjs";
import { readSessionGitState } from "./module-0047.mjs";
import { localize } from "./module-0012.mjs";
import { basename2 } from "./module-0025.mjs";
import { CopilotApiError, ICopilotApiService } from "./module-0168.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IAgentHostAuthenticationService } from "./module-0201.mjs";
import { IAgentHostGitHubEndpointService } from "./module-0161.mjs";
import { IAgentHostGitService } from "./module-0162.mjs";
import { ILogService } from "./module-0084.mjs";


// src/vs/platform/agentHost/node/agentHostCommitOperationHandler.ts
var MAX_CHANGE_SUMMARY_PROMPT_CHARS = 2e4;

var AgentHostCommitOperationHandler = class {
  constructor(_getSessionState, _onCommitted, _authenticationService, _gitHubEndpointService, _gitService, _copilotApiService, _logService) {
    this._getSessionState = _getSessionState;
    this._onCommitted = _onCommitted;
    this._authenticationService = _authenticationService;
    this._gitHubEndpointService = _gitHubEndpointService;
    this._gitService = _gitService;
    this._copilotApiService = _copilotApiService;
    this._logService = _logService;
  }
  static {
    this.OPERATION_COMMIT = "commit";
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
      throw new ProtocolError(JsonRpcErrorCodes.InvalidParams, `Not an uncommitted changeset URI: ${params.channel}`);
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
    const workingDirectory = URI.parse(workingDirectoryStr);
    const gitState = readSessionGitState(sessionState._meta);
    if (!gitState) {
      throw new ProtocolError(JsonRpcErrorCodes.InternalError, `Session's working directory is not a git repo: ${sessionUri}`);
    }
    const hasUncommitted = await this._gitService.hasUncommittedChanges(workingDirectory);
    if (!hasUncommitted) {
      return { message: { markdown: localize(2218, null) } };
    }
    this._throwIfCancelled(token);
    const copilotResource = this._gitHubEndpointService.getCopilotResource();
    const authToken = this._authenticationService.getAuthToken({
      resource: copilotResource.resource,
      scopes: copilotResource.scopes_supported
    });
    if (!authToken) {
      throw new ProtocolError(
        AHP_AUTH_REQUIRED,
        localize(2213, null),
        [copilotResource]
      );
    }
    const diffs = await this._gitService.computeSessionFileDiffs(workingDirectory, { sessionUri });
    if (!diffs || diffs.length === 0) {
      throw new ProtocolError(JsonRpcErrorCodes.InternalError, localize(2216, null));
    }
    this._throwIfCancelled(token);
    let message;
    try {
      message = this._cleanCommitMessage(await this._copilotApiService.utilityChatCompletion(authToken, {
        messages: this._buildCommitMessagePrompt(workingDirectory, gitState.branchName, diffs)
      }, { signal }));
    } catch (err) {
      this._throwIfCancelled(token);
      if (this._isAuthFailure(err)) {
        throw new ProtocolError(
          AHP_AUTH_REQUIRED,
          localize(2212, null),
          [copilotResource]
        );
      }
      throw err;
    }
    if (!message) {
      throw new ProtocolError(JsonRpcErrorCodes.InternalError, localize(2217, null));
    }
    this._throwIfCancelled(token);
    this._logService.info(`[AgentHostCommitOperationHandler] Committing uncommitted changes for session ${sessionUri}`);
    try {
      await this._gitService.commitAll(workingDirectory, message);
    } catch (err) {
      this._throwIfCancelled(token);
      throw new ProtocolError(JsonRpcErrorCodes.InternalError, `Failed to commit changes: ${err instanceof Error ? err.message : String(err)}`);
    }
    try {
      await this._onCommitted(sessionUri);
    } catch (err) {
      this._logService.warn(`[AgentHostCommitOperationHandler] Post-commit refresh failed for session ${sessionUri}: ${err instanceof Error ? err.message : String(err)}`);
    }
    return { message: { markdown: localize(2215, null, message.split("\n")[0]) } };
  }
  _buildCommitMessagePrompt(workingDirectory, branchName, diffs) {
    const changeSummary = this._summarizeDiffsForPrompt(diffs);
    return [
      {
        role: "system",
        content: [
          "You generate concise Git commit messages.",
          "Return only the commit message text, with no markdown or code fences.",
          "Use imperative mood. Keep the subject line under 72 characters.",
          "Add a body only when it helps explain multiple related changes."
        ].join(" ")
      },
      {
        role: "user",
        content: [
          `Repository: ${basename2(workingDirectory)}`,
          `Branch: ${branchName ?? "unknown"}`,
          "Changed files:",
          changeSummary
        ].join("\n")
      }
    ];
  }
  _summarizeDiffsForPrompt(diffs) {
    const lines = [];
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
      lines.push(`- ${kind}: ${this._displayUri(path)} (+${diff.diff?.added ?? 0} -${diff.diff?.removed ?? 0})`);
      if (lines.join("\n").length > MAX_CHANGE_SUMMARY_PROMPT_CHARS) {
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
  _cleanCommitMessage(raw) {
    let text = raw.trim().replace(/\r\n/g, "\n");
    const fenced = /^```(?:text|gitcommit)?\s*([\s\S]*?)\s*```$/i.exec(text);
    if (fenced) {
      text = fenced[1].trim();
    }
    return text;
  }
  _isAuthFailure(err) {
    if (err instanceof CopilotApiError) {
      return err.status === 401 || err.status === 403;
    }
    const message = err instanceof Error ? err.message : String(err);
    return /\b(401|403)\b/.test(message) && /\b(auth|authorization|unauthorized|forbidden|token|copilot endpoint discovery)\b/i.test(message);
  }
  _throwIfCancelled(token) {
    if (token.isCancellationRequested) {
      throw new ProtocolError(JsonRpcErrorCodes.InternalError, localize(2214, null));
    }
  }
};

AgentHostCommitOperationHandler = __decorateClass([
  __decorateParam(2, IAgentHostAuthenticationService),
  __decorateParam(3, IAgentHostGitHubEndpointService),
  __decorateParam(4, IAgentHostGitService),
  __decorateParam(5, ICopilotApiService),
  __decorateParam(6, ILogService)
], AgentHostCommitOperationHandler);
export { MAX_CHANGE_SUMMARY_PROMPT_CHARS, AgentHostCommitOperationHandler };
