// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/providers/remoteAgentHost/browser/cloudSandboxApiService.ts
import { GITHUB_DOT_COM_COPILOT_API_BASE_URI, deriveGitHubEndpoints } from "./module-3590.mjs";
import { Disposable } from "./module-0012.mjs";
import { toErrorMessage } from "./module-0094.mjs";
import { Limiter, timeout } from "./module-0036.mjs";
import { COPILOT_INTEGRATION_ID } from "./module-4285.mjs";
import { CLOUD_SANDBOX_AGENT_SLUG, CLOUD_SANDBOX_ON_DEMAND_ENVIRONMENT_ID, CloudSandboxAuthenticationRequiredError, CloudSandboxRequestError } from "./module-3675.mjs";
import { IRequestService, asText } from "./module-0947.mjs";
import { CancellationToken } from "./module-0025.mjs";
import { TaskEventReplayError, parseTaskEventsResponse, replayTaskAhpEvents } from "./module-4284.mjs";
import { ICloudSandboxTelemetryService, requestOutcomeForStatus } from "./module-4281.mjs";
import { isCancellationError } from "./module-0004.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IAuthenticationService } from "./module-0952.mjs";
import { IProductService } from "./module-0875.mjs";
import { ILogService } from "./module-0095.mjs";


// src/vs/sessions/contrib/providers/remoteAgentHost/browser/cloudSandboxApiService.ts
var LOG_PREFIX20 = "[CloudSandboxApi]";

var GITHUB_DOT_COM_API_BASE_URI = deriveGitHubEndpoints(void 0).apiBaseUri;

var REQUEST_TIMEOUT_MS = 1e4;

var DISCOVERY_TIMEOUT_MS = 3e4;

var CREATE_TIMEOUT_MS = 6e4;

var DEFAULT_WAKING_RETRY_AFTER_SECONDS = 5;

var DIAGNOSTIC_RESPONSE_HEADERS = ["x-github-request-id", "x-request-id", "x-sweagentd-retry", "retry-after"];

var DISCOVERY_TASK_SCAN_LIMIT = 100;

var DISCOVERY_TASK_PAGE_LIMIT = 10;

var DISCOVERY_TASK_FETCH_CONCURRENCY = 5;

var HTTP_TOO_MANY_REQUESTS = 429;

var RATE_LIMIT_MAX_RETRIES = 3;

var RATE_LIMIT_BASE_DELAY_MS = 1e3;

var RATE_LIMIT_MAX_BACKOFF_MS = 8e3;

var RATE_LIMIT_WAIT_BUDGET_MS = 15e3;

var FALLBACK_SCOPES = ["read:user", "user:email", "repo", "workflow"];

var CloudSandboxApiService = class extends Disposable {
  constructor(_requestService, _authenticationService, _productService, _logService, _telemetry) {
    super();
    this._requestService = _requestService;
    this._authenticationService = _authenticationService;
    this._productService = _productService;
    this._logService = _logService;
    this._telemetry = _telemetry;
    /** Resolved (or in-flight) repository names, keyed by numeric repository id. */
    this._repositoryNames = /* @__PURE__ */ new Map();
  }
  async connect(request2, token) {
    return this._connectRequest("connect", request2.environmentId, token, {
      ...request2.sessionId && { session_id: request2.sessionId }
    });
  }
  async reconnect(request2, clientId, token) {
    return this._connectRequest("reconnect", request2.environmentId, token, {
      client_id: clientId,
      ...request2.sessionId && { session_id: request2.sessionId }
    });
  }
  async getEnvironment(environmentId, token) {
    const context2 = await this._sendEnvironment("get", environmentId, token);
    if (!isSuccess2(context2)) {
      await this._throwForStatus("get", context2);
    }
    const environment = await this._readJson(context2);
    if (!environment?.status) {
      throw new Error("Mission Control get returned an incomplete environment response");
    }
    this._logService.trace(`${LOG_PREFIX20} Environment ${environmentId}: status=${environment.status}, ahp=${environment.capabilities?.ahp_version ?? "unknown"}`);
    return environment;
  }
  /**
   * Enumerate sandbox-backed cloud sessions by scanning recent tasks and resolving each one's
   * Mission Control environment binding.
   *
   * Only a `complete` result may be reconciled against: a partial or truncated scan is missing
   * entries that still exist.
   */
  async listSessions(token) {
    const tasks2 = [];
    let truncated = false;
    for (let page = 1; page <= DISCOVERY_TASK_PAGE_LIMIT; page++) {
      let batch;
      let hasNextPage;
      try {
        const context2 = await this._sendTask(`${this._tasksBaseUrl()}/tasks?per_page=${DISCOVERY_TASK_SCAN_LIMIT}&page=${page}`, "list", token);
        const response = await this._readJson(context2);
        if (!response?.tasks) {
          if (page === 1) {
            return { kind: "failed", reason: `listTasks returned no 'tasks' array` };
          }
          truncated = true;
          break;
        }
        batch = response.tasks;
        hasNextPage = hasNextLink(context2.res.headers?.["link"]);
      } catch (error) {
        if (page === 1) {
          return { kind: "failed", reason: `listTasks failed: ${toErrorMessage(error)}` };
        }
        this._logService.warn(`${LOG_PREFIX20} Discovery page ${page} failed: ${toErrorMessage(error)}`);
        truncated = true;
        break;
      }
      tasks2.push(...batch);
      if (!hasNextPage) {
        break;
      }
      if (page === DISCOVERY_TASK_PAGE_LIMIT) {
        truncated = true;
      }
      if (token.isCancellationRequested) {
        truncated = true;
        break;
      }
    }
    const sandboxTasks = tasks2.filter((task) => !task.archived_at && isCloudSandboxTask(task));
    let unresolved = 0;
    const limiter = new Limiter(DISCOVERY_TASK_FETCH_CONCURRENCY);
    let discovered;
    try {
      discovered = await Promise.all(sandboxTasks.map((task) => limiter.queue(async () => {
        try {
          const context2 = await this._sendTask(`${this._tasksBaseUrl()}/tasks/${encodeURIComponent(task.id)}`, "get", token);
          const full = await this._readJson(context2);
          if (!full) {
            unresolved++;
            return void 0;
          }
          const binding = getTaskEnvironmentBinding(full);
          if (!binding) {
            return void 0;
          }
          const repositoryId = full.repository?.id ?? task.repository?.id;
          const repoName = repositoryId !== void 0 ? await this._resolveRepositoryName(repositoryId, token) : void 0;
          return {
            environmentId: binding.environmentId,
            sessionId: binding.sessionId,
            taskId: task.id,
            name: full.name ?? task.name ?? `Sandbox ${task.id}`,
            repoName,
            updatedAt: full.updated_at ?? task.updated_at
          };
        } catch (error) {
          this._logService.warn(`${LOG_PREFIX20} Discovery getTask ${task.id} failed: ${toErrorMessage(error)}`);
          unresolved++;
          return void 0;
        }
      })));
    } finally {
      limiter.dispose();
    }
    const sessions = discovered.filter((session) => session !== void 0);
    const unnamed = sessions.filter((session) => !session.repoName).length;
    this._logService.info(`${LOG_PREFIX20} Discovery found ${sessions.length} sandbox session(s) from ${sandboxTasks.length} sandbox task(s) out of ${tasks2.length} scanned${truncated ? " (scan truncated)" : ""}${unresolved > 0 ? `; ${unresolved} unresolved` : ""}${unnamed > 0 ? `; ${unnamed} without a repository name (they group under "Unknown")` : ""}.`);
    return { kind: unresolved > 0 || truncated ? "partial" : "complete", sessions };
  }
  /**
   * Provision a sandbox task bound to an on-demand environment. Mission Control provisions a VM
   * and binds a session but starts no run, so the caller sends the first turn over the relay.
   * The environment on the returned session is the real VM, not the sentinel.
   */
  async createSession(request2, token) {
    const repository = parseNwo(request2.repoNwo);
    const context2 = await this._request(`${this._tasksBaseUrl()}/tasks`, "mc.taskClient.create", "createTask", {
      "Accept": "application/json",
      "Copilot-Integration-Id": COPILOT_INTEGRATION_ID
    }, token, CREATE_TIMEOUT_MS, {
      environment_id: CLOUD_SANDBOX_ON_DEMAND_ENVIRONMENT_ID,
      // Persisted for display, so replayed history shows the prompt no run was started for.
      prompt: request2.prompt,
      ...repository && { repositories: [repository] }
    });
    if (!isSuccess2(context2)) {
      const failureBody = await asText(context2).catch(() => "") ?? "";
      this._logService.error(`${LOG_PREFIX20} Task create failed. ${this._describeResponse(context2, failureBody)}`);
      const orphanedTaskId = this._taskIdFromFailure(failureBody);
      if (orphanedTaskId) {
        await this._deleteTaskBestEffort(orphanedTaskId);
      } else {
        this._logService.warn(`${LOG_PREFIX20} Task create failed (HTTP ${context2.res.statusCode ?? "unknown"}) without reporting a task id. Mission Control may have recorded a task before failing; such a task is orphaned and can only be removed server-side.`);
      }
      await this._throwForStatus("task create", context2, failureBody);
    }
    const task = await this._readJson(context2);
    const taskId = task?.id;
    if (!taskId) {
      throw new CloudSandboxRequestError(context2.res.statusCode, "Mission Control task create returned no task id");
    }
    const binding = task && getTaskEnvironmentBinding(task);
    if (!binding) {
      await this._deleteTaskBestEffort(taskId);
      throw new CloudSandboxRequestError(context2.res.statusCode, `Mission Control bound no sandbox session to task ${taskId}`);
    }
    this._logService.info(`${LOG_PREFIX20} Provisioned sandbox task ${taskId} (session ${binding.sessionId}) on environment ${binding.environmentId}.`);
    return { taskId, sessionId: binding.sessionId, environmentId: binding.environmentId };
  }
  /**
   * Delete a task we created but cannot use. Best-effort: the caller is already failing, and a
   * failed cleanup must not replace the error that explains why.
   *
   * Only covers tasks whose id we learned. Mission Control writes the task record before it
   * provisions compute, so any failure after that point (an authorization rejection, or a
   * provisioning error such as HTTP 500 `failed to create agent compute`) leaves a task behind.
   * When the failure response omits the id, that orphan can only be cleaned up server-side.
   */
  async _deleteTaskBestEffort(taskId) {
    try {
      const context2 = await this._request(`${this._tasksBaseUrl()}/tasks/${encodeURIComponent(taskId)}`, "mc.taskClient.delete", "deleteTask", {
        "Accept": "application/json",
        "Copilot-Integration-Id": COPILOT_INTEGRATION_ID
      }, CancellationToken.None, REQUEST_TIMEOUT_MS, void 0, "DELETE");
      if (!isSuccess2(context2)) {
        this._logService.warn(`${LOG_PREFIX20} Could not clean up sandbox task ${taskId}: HTTP ${context2.res.statusCode ?? "none"}. It remains and can only be removed server-side.`);
        return;
      }
      this._logService.info(`${LOG_PREFIX20} Cleaned up unusable sandbox task ${taskId}: HTTP ${context2.res.statusCode ?? "none"}`);
    } catch (error) {
      this._logService.warn(`${LOG_PREFIX20} Could not clean up sandbox task ${taskId}: ${toErrorMessage(error)}`);
    }
  }
  /**
   * Read a task's persisted AHP history and fold it into session/chat state.
   *
   * The only history path that survives the sandbox: `/events` is served by Mission Control's
   * mirror, not the environment. The `vnd.github.ahp+json` media type selects the raw relayed
   * frames rather than the cloud-task event summaries the endpoint serves by default.
   */
  async getSessionHistory(taskId, token) {
    const url = `${this._tasksBaseUrl()}/tasks/${encodeURIComponent(taskId)}/events`;
    const context2 = await this._request(url, "mc.taskClient.events", "getTaskEvents", {
      "Accept": "application/vnd.github.ahp+json",
      "Copilot-Integration-Id": COPILOT_INTEGRATION_ID
    }, token, DISCOVERY_TIMEOUT_MS);
    if (!isSuccess2(context2)) {
      await this._throwForStatus("task events", context2);
    }
    const body = await this._readJson(context2);
    if (body === void 0) {
      throw new TaskEventReplayError("Task AHP history response was empty or not JSON.");
    }
    return replayTaskAhpEvents(parseTaskEventsResponse(body));
  }
  /**
   * Resolve a numeric repository id to its `owner/name`, memoized for the life of the service.
   * A task names its repository nowhere — `repository` carries an id, and the session's
   * `event_url` / `base_ref` are empty for tasks created through the tasks API.
   *
   * The cached promise must never reject: every task in a pass shares it, and a rejection would
   * count each one as unresolved (forcing the scan `partial`) and drop those sessions from the
   * listing entirely. A miss is evicted so the next pass retries.
   */
  _resolveRepositoryName(repositoryId, token) {
    const cached = this._repositoryNames.get(repositoryId);
    if (cached) {
      return cached;
    }
    const pending = (async () => {
      try {
        const url = `${GITHUB_DOT_COM_API_BASE_URI}/repositories/${repositoryId}`;
        const context2 = await this._retryWhileRateLimited("repository get", token, () => this._request(url, "mc.repositoryClient.get", "getRepository", {
          "Accept": "application/vnd.github.v3+json"
        }, token, DISCOVERY_TIMEOUT_MS));
        if (!isSuccess2(context2)) {
          throw new CloudSandboxRequestError(context2.res.statusCode, `HTTP ${context2.res.statusCode ?? "none"}`);
        }
        const body = await this._readJson(context2);
        return body?.full_name;
      } catch (error) {
        this._logService.warn(`${LOG_PREFIX20} Repository ${repositoryId} lookup failed: ${toErrorMessage(error)}`);
        return void 0;
      }
    })();
    this._repositoryNames.set(repositoryId, pending);
    pending.then((name) => {
      if (!name && this._repositoryNames.get(repositoryId) === pending) {
        this._repositoryNames.delete(repositoryId);
      }
    });
    return pending;
  }
  /** Shared handler for the `connect`/`reconnect` endpoints (200 token or 202 waking). */
  async _connectRequest(action, environmentId, token, searchParams) {
    const context2 = await this._sendEnvironment(action, environmentId, token, searchParams);
    if (context2.res.statusCode === 202) {
      const retryAfterSeconds2 = parseRetryAfter(context2.res.headers?.["retry-after"]);
      this._logService.debug(`${LOG_PREFIX20} ${action}: environment waking, retry after ${retryAfterSeconds2}s`);
      return { kind: "waking", waking: { retryAfterSeconds: retryAfterSeconds2 } };
    }
    if (!isSuccess2(context2)) {
      await this._throwForStatus(action, context2);
    }
    const clientToken = await this._readJson(context2);
    if (!clientToken?.access_token || !clientToken?.wps_endpoint || !clientToken?.client_id || !clientToken?.groups) {
      throw new Error(`Mission Control ${action} returned an incomplete token response`);
    }
    return { kind: "token", token: clientToken };
  }
  /**
   * Issue an agent-environment request and return the raw response. The caller owns status
   * handling, since the meaning of a status is endpoint-specific (notably HTTP 202 = "waking",
   * which is neither an error nor a result).
   */
  async _sendEnvironment(action, environmentId, token, searchParams) {
    const path = action === "get" ? "" : `/${action}`;
    const url = `${GITHUB_DOT_COM_COPILOT_API_BASE_URI}/agents/environments/${encodeURIComponent(environmentId)}${path}${toQuery(searchParams)}`;
    return this._request(url, `mc.environmentClient.${action}`, action === "get" ? "getEnvironment" : action, {
      "Copilot-Integration-Id": COPILOT_INTEGRATION_ID
    }, token);
  }
  /** Issue a task API request, throwing on a non-success status. */
  async _sendTask(url, action, token) {
    const context2 = await this._retryWhileRateLimited(`task ${action}`, token, () => this._request(url, `mc.taskClient.${action}`, action === "list" ? "listTasks" : "getTask", {
      "Accept": "application/json",
      "Copilot-Integration-Id": COPILOT_INTEGRATION_ID
    }, token, DISCOVERY_TIMEOUT_MS));
    if (!isSuccess2(context2)) {
      await this._throwForStatus(`task ${action}`, context2);
    }
    return context2;
  }
  /**
   * Re-issue a discovery read that came back rate-limited, waiting for `Retry-After` when the
   * response names one and backing off exponentially when it does not.
   *
   * Discovery reads the API far harder than any other sandbox call, so it is the one path that
   * routinely trips the limit. Reporting a 429 rather than retrying it loses the session being
   * resolved for the rest of the window, because nothing re-runs a pass that otherwise succeeded.
   */
  async _retryWhileRateLimited(action, token, send) {
    let waited = 0;
    for (let attempt = 0; ; attempt++) {
      const context2 = await send();
      if (context2.res.statusCode !== HTTP_TOO_MANY_REQUESTS || attempt >= RATE_LIMIT_MAX_RETRIES || token.isCancellationRequested) {
        return context2;
      }
      const delay = rateLimitDelay(context2.res.headers?.["retry-after"], attempt);
      if (waited + delay > RATE_LIMIT_WAIT_BUDGET_MS) {
        this._logService.warn(`${LOG_PREFIX20} ${action} was rate limited and asks for another ${delay}ms, beyond what is left of its ${RATE_LIMIT_WAIT_BUDGET_MS}ms budget; giving up so the pass stays bounded. A later pass retries it.`);
        return context2;
      }
      await asText(context2).catch(() => void 0);
      this._logService.warn(`${LOG_PREFIX20} ${action} was rate limited; retrying in ${delay}ms (attempt ${attempt + 1} of ${RATE_LIMIT_MAX_RETRIES}).`);
      await timeout(delay, token);
      waited += delay;
    }
  }
  async _request(url, callSite, action, headers, token, timeoutMs = REQUEST_TIMEOUT_MS, body, method) {
    const accessToken = await this._resolveGitHubToken();
    if (!accessToken) {
      throw new CloudSandboxAuthenticationRequiredError();
    }
    const started = Date.now();
    const requestMethod = method ?? (body === void 0 ? "GET" : "POST");
    try {
      const context2 = await this._requestService.request({
        type: requestMethod,
        url,
        headers: {
          ...headers,
          // `fetch` labels a string body `text/plain` unless told otherwise.
          ...body === void 0 ? void 0 : { ["Content-Type"]: "application/json" },
          ["Authorization"]: `Bearer ${accessToken}`
        },
        ...body === void 0 ? void 0 : { data: JSON.stringify(body) },
        timeout: timeoutMs,
        callSite
      }, token);
      this._telemetry.reportRequest(action, requestOutcomeForStatus(context2.res.statusCode));
      this._logService.trace(`${LOG_PREFIX20} ${action} -> HTTP ${context2.res.statusCode ?? "none"} in ${Date.now() - started}ms (budget ${timeoutMs}ms)${context2.res.headers?.["retry-after"] ? `, Retry-After: ${context2.res.headers["retry-after"]}` : ""}`);
      return context2;
    } catch (error) {
      if (!isCancellationError(error) && !token.isCancellationRequested) {
        this._telemetry.reportRequest(action, "networkError");
      }
      this._logService.trace(`${LOG_PREFIX20} ${action} -> failed after ${Date.now() - started}ms (budget ${timeoutMs}ms)`);
      this._logService.error(`${LOG_PREFIX20} ${requestMethod} ${url} failed: ${toErrorMessage(error)}`);
      throw error;
    }
  }
  /**
   * Mission Control task API base. Uses the Copilot API host: `api.github.com/agents/*` omits
   * CORS headers on authenticated responses, so a renderer `fetch` receives the reply and discards it.
   */
  _tasksBaseUrl() {
    return `${GITHUB_DOT_COM_COPILOT_API_BASE_URI}/agents`;
  }
  async _readJson(context2) {
    const body = await asText(context2);
    if (!body) {
      return void 0;
    }
    try {
      return JSON.parse(body);
    } catch {
      return void 0;
    }
  }
  /**
   * Throw a diagnosable error for a non-success response. Pass `prereadBody` when the caller has
   * already consumed the stream, since reading it twice yields nothing.
   */
  async _throwForStatus(action, context2, prereadBody) {
    const body = prereadBody ?? await asText(context2).catch(() => "");
    const status2 = context2.res.statusCode;
    throw new CloudSandboxRequestError(
      status2,
      `Mission Control ${action} failed: HTTP ${status2 ?? "unknown"} - ${(body ?? "").slice(0, 200)}`
    );
  }
  /**
   * Describe a response verbatim for a support escalation: status, the server-side request id,
   * and the body as received.
   */
  _describeResponse(context2, body) {
    const headers = context2.res.headers ?? {};
    const parts = [`HTTP ${context2.res.statusCode ?? "none"}`];
    for (const name of DIAGNOSTIC_RESPONSE_HEADERS) {
      const value2 = headers[name];
      if (value2 !== void 0) {
        parts.push(`${name}: ${Array.isArray(value2) ? value2.join(", ") : value2}`);
      }
    }
    parts.push(`body: ${body || "<empty>"}`);
    return parts.join(" | ");
  }
  /** The task id from a failed create, when the response names the task it already recorded. */
  _taskIdFromFailure(body) {
    if (!body) {
      return void 0;
    }
    try {
      const parsed = JSON.parse(body);
      for (const candidate of [parsed?.id, parsed?.task_id]) {
        if (typeof candidate === "string" && candidate.length > 0) {
          return candidate;
        }
      }
    } catch {
    }
    return void 0;
  }
  /** A GitHub session carrying at least the configured chat provider scopes. */
  async _resolveGitHubToken() {
    const providerId = this._productService.defaultChatAgent?.provider?.default?.id ?? "github";
    const scopes = this._productService.defaultChatAgent?.providerScopes?.[0] ?? FALLBACK_SCOPES;
    let exact;
    try {
      exact = await this._authenticationService.getSessions(providerId, [...scopes], void 0, true);
    } catch (error) {
      this._logService.warn(`${LOG_PREFIX20} getSessions('${providerId}') failed: ${toErrorMessage(error)}`);
      return void 0;
    }
    if (exact.length > 0) {
      return exact[0].accessToken;
    }
    const all = await this._authenticationService.getSessions(providerId, void 0, void 0, true);
    const required = new Set(scopes);
    let best;
    for (const session of all) {
      const granted = new Set(session.scopes);
      if ([...required].every((scope) => granted.has(scope))) {
        const extra = granted.size - required.size;
        if (!best || extra < best.extra) {
          best = { token: session.accessToken, extra };
        }
      }
    }
    if (!best) {
      this._logService.warn(`${LOG_PREFIX20} No '${providerId}' session with scopes [${scopes.join(", ")}]`);
    }
    return best?.token;
  }
};

CloudSandboxApiService = __decorateClass([
  __decorateParam(0, IRequestService),
  __decorateParam(1, IAuthenticationService),
  __decorateParam(2, IProductService),
  __decorateParam(3, ILogService),
  __decorateParam(4, ICloudSandboxTelemetryService)
], CloudSandboxApiService);

function isSuccess2(context2) {
  const status2 = context2.res.statusCode ?? 0;
  return status2 >= 200 && status2 < 300;
}

function toQuery(searchParams) {
  if (!searchParams) {
    return "";
  }
  const search2 = new URLSearchParams(searchParams).toString();
  return search2 ? `?${search2}` : "";
}

function retryAfterSeconds(value2) {
  const raw = Array.isArray(value2) ? value2[0] : value2;
  if (raw) {
    const seconds = Number.parseInt(raw, 10);
    if (Number.isFinite(seconds) && seconds > 0) {
      return seconds;
    }
  }
  return void 0;
}

function parseRetryAfter(value2) {
  return retryAfterSeconds(value2) ?? DEFAULT_WAKING_RETRY_AFTER_SECONDS;
}

function rateLimitDelay(retryAfter, attempt) {
  const seconds = retryAfterSeconds(retryAfter);
  return seconds !== void 0 ? seconds * 1e3 : Math.min(RATE_LIMIT_BASE_DELAY_MS * Math.pow(2, attempt), RATE_LIMIT_MAX_BACKOFF_MS);
}

function isCloudSandboxTask(task) {
  const isCloudCodingAgent = task.agent_collaborators?.some((c) => c.slug === CLOUD_SANDBOX_AGENT_SLUG) ?? false;
  return isCloudCodingAgent && task.compute?.provider === "sandboxes";
}

function hasNextLink(value2) {
  const raw = Array.isArray(value2) ? value2.join(",") : value2;
  return raw ? /rel="?next"?/.test(raw) : false;
}

function parseNwo(nwo) {
  const separator2 = nwo?.indexOf("/") ?? -1;
  if (!nwo || separator2 <= 0 || separator2 === nwo.length - 1) {
    return void 0;
  }
  return { owner: nwo.slice(0, separator2), name: nwo.slice(separator2 + 1) };
}

function getTaskEnvironmentBinding(task) {
  for (const session of task.sessions ?? []) {
    if (session.environment_id && session.environment_id.length > 0 && session.id.length > 0) {
      return { environmentId: session.environment_id, sessionId: session.id };
    }
  }
  return void 0;
}
export { isSuccess2, toQuery, retryAfterSeconds, parseRetryAfter, rateLimitDelay, isCloudSandboxTask, hasNextLink, parseNwo, getTaskEnvironmentBinding, LOG_PREFIX20, GITHUB_DOT_COM_API_BASE_URI, REQUEST_TIMEOUT_MS, DISCOVERY_TIMEOUT_MS, CREATE_TIMEOUT_MS, DEFAULT_WAKING_RETRY_AFTER_SECONDS, DIAGNOSTIC_RESPONSE_HEADERS, DISCOVERY_TASK_SCAN_LIMIT, DISCOVERY_TASK_PAGE_LIMIT, DISCOVERY_TASK_FETCH_CONCURRENCY, HTTP_TOO_MANY_REQUESTS, RATE_LIMIT_MAX_RETRIES, RATE_LIMIT_BASE_DELAY_MS, RATE_LIMIT_MAX_BACKOFF_MS, RATE_LIMIT_WAIT_BUDGET_MS, FALLBACK_SCOPES, CloudSandboxApiService };
