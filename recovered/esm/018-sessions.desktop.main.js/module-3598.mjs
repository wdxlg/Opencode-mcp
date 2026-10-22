// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/github/browser/fetchers/githubPRCIFetcher.ts



// src/vs/sessions/contrib/github/browser/fetchers/githubPRCIFetcher.ts
var GitHubPRCIFetcher = class {
  constructor(_apiClient) {
    this._apiClient = _apiClient;
  }
  async getCheckRuns(owner, repo, ref, etag2) {
    const response = await this._apiClient.request(
      "GET",
      `/repos/${e2(owner)}/${e2(repo)}/commits/${e2(ref)}/check-runs`,
      "githubApi.getCheckRuns",
      { etag: etag2 }
    );
    return {
      ...response,
      data: response.data ? response.data.check_runs.map(mapCheckRun) : void 0
    };
  }
  /**
   * Rerun failed jobs in a GitHub Actions workflow run.
   */
  async rerunFailedJobs(owner, repo, runId) {
    await this._apiClient.request(
      "POST",
      `/repos/${e2(owner)}/${e2(repo)}/actions/runs/${runId}/rerun-failed-jobs`,
      "githubApi.rerunFailedJobs"
    );
  }
  /**
   * Get logs/output for a specific check run.
   *
   * Tries multiple sources in order:
   * 1. The check run's own output fields (title, summary, text) — set by the
   *    check run creator via the Checks API.
   * 2. Annotations attached to the check run.
   * 3. GitHub Actions job logs (only works for GitHub Actions workflows).
   */
  async getCheckRunAnnotations(owner, repo, checkRunId) {
    const sections = [];
    try {
      const detailResponse = await this._apiClient.request(
        "GET",
        `/repos/${e2(owner)}/${e2(repo)}/check-runs/${checkRunId}`,
        "githubApi.getCheckRunAnnotations"
      );
      const output = detailResponse.data?.output;
      if (output?.title) {
        sections.push(`# ${output.title}`);
      }
      if (output?.summary) {
        sections.push(output.summary);
      }
      if (output?.text) {
        sections.push(output.text);
      }
    } catch {
    }
    try {
      const annotationsResponse = await this._apiClient.request(
        "GET",
        `/repos/${e2(owner)}/${e2(repo)}/check-runs/${checkRunId}/annotations`,
        "githubApi.getCheckRunAnnotations.annotations"
      );
      const annotations = annotationsResponse.data;
      if (annotations && annotations.length > 0) {
        sections.push(
          annotations.map(
            (a) => `[${a.annotation_level}] ${a.path}:${a.start_line}${a.end_line !== a.start_line ? `-${a.end_line}` : ""} ${a.title ? `(${a.title}) ` : ""}${a.message}`
          ).join("\n")
        );
      }
    } catch {
    }
    if (sections.length > 0) {
      return sections.join("\n\n");
    }
    return "No output available for this check run.";
  }
};

function e2(value2) {
  return encodeURIComponent(value2);
}

function mapCheckRun(data) {
  return {
    id: data.id,
    name: data.name,
    status: mapCheckStatus(data.status),
    conclusion: data.conclusion ? mapCheckConclusion(data.conclusion) : void 0,
    startedAt: data.started_at ?? void 0,
    completedAt: data.completed_at ?? void 0,
    detailsUrl: data.details_url ?? void 0
  };
}

function mapCheckStatus(status2) {
  switch (status2) {
    case "queued":
      return "queued" /* Queued */;
    case "in_progress":
      return "in_progress" /* InProgress */;
    case "completed":
      return "completed" /* Completed */;
    default:
      return "queued" /* Queued */;
  }
}

function mapCheckConclusion(conclusion) {
  switch (conclusion) {
    case "success":
      return "success" /* Success */;
    case "failure":
      return "failure" /* Failure */;
    case "neutral":
      return "neutral" /* Neutral */;
    case "cancelled":
      return "cancelled" /* Cancelled */;
    case "skipped":
      return "skipped" /* Skipped */;
    case "timed_out":
      return "timed_out" /* TimedOut */;
    case "action_required":
      return "action_required" /* ActionRequired */;
    case "stale":
      return "stale" /* Stale */;
    default:
      return "neutral" /* Neutral */;
  }
}

function computeOverallCIStatus(checks) {
  if (checks.length === 0) {
    return "neutral" /* Neutral */;
  }
  let hasFailure = false;
  let hasPending = false;
  for (const check of checks) {
    if (check.status !== "completed" /* Completed */) {
      hasPending = true;
      continue;
    }
    if (check.conclusion === "failure" /* Failure */ || check.conclusion === "timed_out" /* TimedOut */ || check.conclusion === "action_required" /* ActionRequired */) {
      hasFailure = true;
    }
  }
  if (hasFailure) {
    return "failure" /* Failure */;
  }
  if (hasPending) {
    return "pending" /* Pending */;
  }
  return "success" /* Success */;
}
export { e2, mapCheckRun, mapCheckStatus, mapCheckConclusion, computeOverallCIStatus, GitHubPRCIFetcher };
