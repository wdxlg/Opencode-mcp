// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/node/agentMergeTools.ts
import { classifyAgentMergeRequiredChecks, isAgentMergeFeedbackAuthor } from "./module-0116.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IGitHubService } from "./module-0472.mjs";
import { ILogService } from "./module-0084.mjs";


// src/vs/platform/agentHost/node/agentMergeTools.ts
var AgentMergeTools = class {
  constructor(_isFeatureEnabled, _getTurnContext, _gitHubService, _logService) {
    this._isFeatureEnabled = _isFeatureEnabled;
    this._getTurnContext = _getTurnContext;
    this._gitHubService = _gitHubService;
    this._logService = _logService;
  }
  isEnabled() {
    return this._isFeatureEnabled();
  }
  async readFailedCI(session) {
    const context = this._requireTurnAction(session, "fixCI");
    const checks = context.snapshot.checks.value ? classifyAgentMergeRequiredChecks(context.snapshot.checks.value) : void 0;
    const failedChecks = checks?.kind === "ready" ? checks.failed : [];
    const runIds = failedRequiredRunIds(context.snapshot);
    this._logService.info(`[AgentMergeTools] Reading failed required CI: session=${session}, turn=${context.turnId}, failedChecks=${failedChecks.length}, workflowRuns=${runIds.length}`);
    const sections = [];
    for (const check of failedChecks) {
      const annotations = check.type === "checkRun" ? await this._gitHubService.mutations.listCheckAnnotations(context.ref, check.id, context.signal) : [];
      sections.push(JSON.stringify({
        check: {
          id: check.id,
          name: check.name,
          status: check.status,
          conclusion: check.conclusion,
          detailsUrl: check.detailsUrl,
          workflowName: check.workflowName
        },
        annotations
      }));
    }
    for (const runId of runIds) {
      const jobs = await this._gitHubService.mutations.listWorkflowJobs(context.ref, runId, context.signal);
      for (const job of jobs.filter((job2) => isFailedConclusion(job2.conclusion))) {
        const log4 = await this._gitHubService.mutations.downloadWorkflowJobLog(context.ref, job.id, context.signal);
        sections.push(JSON.stringify({
          runId,
          job,
          log: log4.text.slice(0, 1e5),
          logTruncated: log4.truncated || log4.text.length > 1e5
        }));
      }
    }
    this._logService.info(`[AgentMergeTools] Finished reading failed required CI: session=${session}, turn=${context.turnId}, resultSections=${sections.length}`);
    return sections.length > 0 ? sections.join("\n\n") : "No failed required CI details are available.";
  }
  async replyToReviewThread(session, threadId, body, resolve3) {
    const context = this._requireTurnAction(session, "addressReviews");
    const thread = context.snapshot.reviewThreads.value?.find((candidate) => candidate.id === threadId);
    if (!thread || thread.isResolved || !thread.comments.some((comment) => isAgentMergeFeedbackAuthor(comment.author))) {
      throw new Error("The review thread is not an unresolved thread authorized for this Agent Merge turn.");
    }
    const attributedBody = context.configuration.replyAttribution ? `${body}

> [!NOTE]
> Automated reply by VS Code Agent Merge.` : body;
    this._logService.info(`[AgentMergeTools] Replying to authorized review thread: session=${session}, turn=${context.turnId}, resolve=${resolve3}, attribution=${context.configuration.replyAttribution}`);
    const result = await this._gitHubService.mutations.replyAndResolveThread(context.ref, {
      operationId: `agent-merge:${context.turnId}:${threadId}`,
      threadId,
      body: attributedBody,
      resolve: resolve3
    }, context.signal);
    this._logService.info(`[AgentMergeTools] Review thread reply completed: session=${session}, turn=${context.turnId}, replyOutcome=${result.reply.outcome}, resolved=${result.resolved}`);
    return JSON.stringify({ reply: result.reply.outcome, resolved: result.resolved, resolveError: result.resolveError });
  }
  async rerunFailedWorkflow(session, runId, failedJobsOnly) {
    const context = this._requireTurnAction(session, "fixCI");
    if (!failedRequiredRunIds(context.snapshot).includes(runId)) {
      throw new Error("The workflow run is not associated with a failed required check in this Agent Merge turn.");
    }
    const runs = await this._gitHubService.mutations.listWorkflowRuns(context.ref, context.headSha, context.signal);
    const run2 = runs.find((candidate) => candidate.id === runId && isFailedConclusion(candidate.conclusion));
    if (!run2) {
      throw new Error("The failed workflow run is no longer available for rerun.");
    }
    this._logService.info(`[AgentMergeTools] Rerunning failed workflow: session=${session}, turn=${context.turnId}, failedJobsOnly=${failedJobsOnly}, currentAttempt=${run2.runAttempt}`);
    const result = await this._gitHubService.mutations.rerunWorkflow(context.ref, {
      operationId: `agent-merge:${context.turnId}:rerun:${runId}`,
      runId,
      expectedRunAttempt: run2.runAttempt,
      failedJobsOnly
    }, context.signal);
    this._logService.info(`[AgentMergeTools] Workflow rerun requested: session=${session}, turn=${context.turnId}, outcome=${result.outcome}`);
    return JSON.stringify({ outcome: result.outcome, run: result.value });
  }
  _requireTurnAction(session, action) {
    const context = this._getTurnContext(session);
    if (!context || !context.actions.includes(action)) {
      this._logService.warn(`[AgentMergeTools] Rejected unauthorized tool call: session=${session}, action=${action}, hasActiveAgentMergeTurn=${context !== void 0}`);
      throw new Error(`Agent Merge action '${action}' is not authorized for the active turn.`);
    }
    return context;
  }
};

AgentMergeTools = __decorateClass([
  __decorateParam(2, IGitHubService),
  __decorateParam(3, ILogService)
], AgentMergeTools);

function failedRequiredRunIds(snapshot) {
  const ids = /* @__PURE__ */ new Set();
  const checks = snapshot.checks.value ? classifyAgentMergeRequiredChecks(snapshot.checks.value) : void 0;
  for (const check of checks?.kind === "ready" ? checks.failed : []) {
    const match2 = /\/actions\/runs\/(?<runId>\d+)/.exec(check.detailsUrl ?? "");
    if (match2?.groups?.runId) {
      ids.add(match2.groups.runId);
    }
  }
  return [...ids];
}

function isFailedConclusion(conclusion) {
  return !!conclusion && !["SUCCESS", "NEUTRAL", "SKIPPED"].includes(conclusion.toUpperCase());
}
export { failedRequiredRunIds, isFailedConclusion, AgentMergeTools };
