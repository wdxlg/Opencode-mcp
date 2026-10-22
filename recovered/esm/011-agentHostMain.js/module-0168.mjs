// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/node/shared/copilotApiService.ts
import { createDecorator } from "./module-0044.mjs";
import { generateUuid } from "./module-0042.mjs";
import { getDevDeviceId, getMachineId } from "./module-0169.mjs";
import { COPILOT_LICENSE_AGREEMENT } from "./module-0172.mjs";
import { getInternalOrg, isInternalAccount } from "./module-0171.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ILogService } from "./module-0084.mjs";
import { IProductService } from "./module-0173.mjs";
import { IAgentHostGitHubEndpointService } from "./module-0161.mjs";


// src/vs/platform/agentHost/node/shared/copilotApiService.ts
import { CAPIClient, RequestType } from "@vscode/copilot-api";


// src/vs/platform/agentHost/node/shared/copilotApiService.ts
var COPILOT_API_ERROR_STATUS_STREAMING = 520;

var CAPI_CONTEXT_REFRESH_BUFFER_SECONDS = 5 * 60;

var CAPI_CONTEXT_TTL_SECONDS = 30 * 60;

var USER_API_VERSION = "2025-04-01";

var CAPI_URL_OVERRIDE_ENV = "VSCODE_AGENT_HOST_CAPI_URL_OVERRIDE";

var CAPI_URL_OVERRIDE_SMOKE_TEST_HOST = "vscode-smoke.test";

var CAPI_URL_OVERRIDE_SMOKE_TEST_ENV = "VSCODE_SMOKE_TEST_PROXY_HEADER";

function isLoopbackUrl(url2) {
  let hostname2;
  try {
    hostname2 = new URL(url2).hostname;
  } catch {
    return false;
  }
  const host = hostname2.replace(/^\[|\]$/g, "").toLowerCase();
  return host === "localhost" || host === "::1" || /^127(?:\.\d{1,3}){3}$/.test(host);
}

function isAllowedCapiUrlOverride(url2) {
  if (isLoopbackUrl(url2)) {
    return true;
  }
  if (!process.env[CAPI_URL_OVERRIDE_SMOKE_TEST_ENV]) {
    return false;
  }
  try {
    return new URL(url2).hostname.toLowerCase() === CAPI_URL_OVERRIDE_SMOKE_TEST_HOST;
  } catch {
    return false;
  }
}

var UTILITY_DEFAULT_MODEL_FAMILY = "gpt-4o-mini";

var UTILITY_DEFAULT_TEMPERATURE = 0.1;

var UTILITY_DEFAULT_TOP_P = 1;

var UTILITY_INTENT = "conversation-background";

var CopilotApiError = class extends Error {
  /**
   * @param status HTTP status from the originating CAPI response, or
   *   {@link COPILOT_API_ERROR_STATUS_STREAMING} for mid-stream SSE errors.
   * @param envelope Anthropic-format error envelope. For HTTP errors with a
   *   non-conforming body (plain text, malformed JSON, missing fields) this
   *   is synthesized; for conforming bodies and SSE frames it is the
   *   server's envelope verbatim.
   * @param message Optional override for `Error.message`. Defaults to
   *   `envelope.error.message`. **Never includes auth tokens.**
   */
  constructor(status, envelope, message) {
    super(message ?? envelope.error.message);
    this.status = status;
    this.envelope = envelope;
    this.name = "CopilotApiError";
  }
};

function buildCopilotApiHttpError(status, statusText, bodyText, prefix = "CAPI request failed") {
  let envelope;
  if (bodyText) {
    try {
      const parsed = JSON.parse(bodyText);
      if (parsed && typeof parsed === "object" && parsed.type === "error") {
        const err = parsed.error;
        if (err && typeof err === "object" && typeof err.type === "string" && typeof err.message === "string") {
          envelope = parsed;
        }
      }
    } catch {
    }
  }
  if (!envelope) {
    envelope = {
      type: "error",
      error: {
        type: "api_error",
        message: bodyText || `${status} ${statusText}`
      },
      request_id: null
    };
  }
  return new CopilotApiError(
    status,
    envelope,
    `${prefix}: ${status} ${statusText} \u2014 ${envelope.error.message}`
  );
}

var ICopilotApiService = createDecorator("copilotApiService");

var CopilotApiService = class {
  constructor(fetchFn, _logService, _productService, _gitHubEndpointService) {
    this._logService = _logService;
    this._productService = _productService;
    this._gitHubEndpointService = _gitHubEndpointService;
    this._capiBasePromise = null;
    this._clientsByToken = /* @__PURE__ */ new Map();
    this._fetch = fetchFn ?? globalThis.fetch;
  }
  messages(githubToken, request, options) {
    if (request.stream) {
      return this._messagesStreaming(githubToken, request, options);
    }
    return this._messagesNonStreaming(githubToken, request, options);
  }
  async countTokens(_githubToken, _req, _options) {
    throw new Error("countTokens not supported by CAPI");
  }
  async models(githubToken, options) {
    const capiClient = await this._getClientForToken(githubToken);
    this._logService.debug("[CopilotApiService] GET models");
    const response = await capiClient.makeRequest(
      {
        method: "GET",
        headers: {
          ...options?.headers,
          "Authorization": `Bearer ${githubToken}`
        },
        // Opt-in per request — see
        // `ICopilotApiServiceRequestOptions.suppressIntegrationId`.
        suppressIntegrationId: options?.suppressIntegrationId,
        signal: options?.signal
      },
      { type: RequestType.Models }
    );
    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        this._invalidateClientForToken(githubToken);
      }
      const text = await response.text().catch(() => "");
      throw buildCopilotApiHttpError(response.status, response.statusText, text, "CAPI models request failed");
    }
    const json = await response.json();
    return json.data ?? [];
  }
  async responses(githubToken, body, options) {
    const capiClient = await this._getClientForToken(githubToken);
    const requestId = generateUuid();
    let requestModel = "<unknown>";
    try {
      const parsed = JSON.parse(body);
      requestModel = parsed.model ?? "<none>";
    } catch {
    }
    this._logService.info(`[CopilotApiService] POST responses: requestId=${requestId}, model=${requestModel}`);
    const response = await capiClient.makeRequest(
      {
        method: "POST",
        headers: {
          ...options?.headers,
          "Content-Type": "application/json",
          "Authorization": `Bearer ${githubToken}`,
          "X-Request-Id": requestId,
          "OpenAI-Intent": "conversation"
        },
        // Opt-in per request — see
        // `ICopilotApiServiceRequestOptions.suppressIntegrationId`.
        suppressIntegrationId: options?.suppressIntegrationId,
        body,
        signal: options?.signal
      },
      { type: RequestType.ChatResponses }
    );
    this._logService.info(`[CopilotApiService] responses status=${response.status}, requestId=${requestId}`);
    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        this._invalidateClientForToken(githubToken);
      }
      const text = await response.text().catch(() => "");
      throw buildCopilotApiHttpError(response.status, response.statusText, text, "CAPI responses request failed");
    }
    return response;
  }
  async utilityChatCompletion(githubToken, request, options) {
    const capiClient = await this._getClientForToken(githubToken);
    const modelId = await this._resolveUtilityModelId(githubToken, UTILITY_DEFAULT_MODEL_FAMILY);
    const requestId = generateUuid();
    this._logService.debug("[CopilotApiService] POST chat completions", `model=${modelId} requestId=${requestId}`);
    const body = JSON.stringify({
      model: modelId,
      messages: request.messages.map((m) => ({ role: m.role, content: m.content })),
      stream: false,
      temperature: request.temperature ?? UTILITY_DEFAULT_TEMPERATURE,
      top_p: UTILITY_DEFAULT_TOP_P,
      max_tokens: request.maxTokens
    });
    const response = await capiClient.makeRequest(
      {
        method: "POST",
        headers: {
          ...options?.headers,
          "Content-Type": "application/json",
          "Authorization": `Bearer ${githubToken}`,
          "X-Request-Id": requestId,
          "OpenAI-Intent": UTILITY_INTENT
        },
        body,
        signal: options?.signal
      },
      { type: RequestType.ChatCompletions }
    );
    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        this._invalidateClientForToken(githubToken);
      }
      const text = await response.text().catch(() => "");
      throw buildCopilotApiHttpError(response.status, response.statusText, text, "CAPI chat completion request failed");
    }
    const json = await response.json();
    const content = json?.choices?.[0]?.message?.content;
    if (typeof content !== "string") {
      throw new Error("CAPI chat completion returned no text content");
    }
    return content;
  }
  // #endregion
  // #region Lazy Init
  _getCapiBase() {
    if (!this._capiBasePromise) {
      this._capiBasePromise = this._buildCapiBase().catch((err) => {
        this._capiBasePromise = null;
        throw err;
      });
    }
    return this._capiBasePromise;
  }
  async _buildCapiBase() {
    const [machineId2, deviceId] = await Promise.all([
      getMachineId((err) => this._logService.warn("[CopilotApiService] getMachineId failed", err)),
      getDevDeviceId((err) => this._logService.warn("[CopilotApiService] getDevDeviceId failed", err))
    ]);
    const extensionInfo = {
      name: "agent-host",
      sessionId: generateUuid(),
      machineId: machineId2,
      deviceId,
      vscodeVersion: this._productService.version,
      version: this._productService.version,
      buildType: this._productService.quality === "stable" ? "prod" : "dev"
    };
    const userUrl = `${this._gitHubEndpointService.getApiBaseUri()}/copilot_internal/user`;
    return { extensionInfo, userUrl };
  }
  // #endregion
  // #region Streaming
  async *_messagesStreaming(githubToken, request, options) {
    const response = await this._sendRequest(githubToken, request, true, options);
    if (!response.body) {
      throw new Error("CAPI response has no body");
    }
    yield* this._readSSE(response.body);
  }
  // #endregion
  // #region Non-Streaming
  async _messagesNonStreaming(githubToken, request, options) {
    const response = await this._sendRequest(githubToken, request, false, options);
    return response.json();
  }
  // #endregion
  // #region Shared Request
  async _sendRequest(githubToken, request, stream, options) {
    const capiClient = await this._getClientForToken(githubToken);
    const requestId = generateUuid();
    this._logService.debug("[CopilotApiService] POST messages", `model=${request.model} stream=${stream} requestId=${requestId}`);
    const { system, ...rest } = request;
    const body = JSON.stringify({
      ...rest,
      stream,
      // CAPI requires system as a text-block array, not a raw string
      ...system !== void 0 ? { system: typeof system === "string" ? [{ type: "text", text: system }] : system } : {}
    });
    const response = await capiClient.makeRequest(
      {
        method: "POST",
        headers: {
          ...options?.headers,
          "Content-Type": "application/json",
          "Authorization": `Bearer ${githubToken}`,
          "X-Request-Id": requestId,
          "X-GitHub-Api-Version": "2026-01-09",
          // Should these be parameterized?
          "OpenAI-Intent": "messages-proxy",
          "X-Interaction-Type": "messages-proxy"
          // `X-Initiator` (user|agent) is intentionally omitted: the
          // user-vs-agent turn origin known to `ClaudeAgentSession` is not
          // plumbed across the SDK subprocess to this proxy, so a hardcoded
          // value would mislabel most agent-loop traffic. CAPI accepts the
          // request without it (the `responses()` and `utilityChatCompletion()`
          // paths already omit it). Thread a real per-turn initiator here if
          // that signal ever becomes available at the proxy boundary.
        },
        suppressIntegrationId: options?.suppressIntegrationId,
        body,
        signal: options?.signal
      },
      { type: RequestType.ChatMessages }
    );
    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        this._invalidateClientForToken(githubToken);
      }
      const text = await response.text().catch(() => "");
      throw buildCopilotApiHttpError(response.status, response.statusText, text);
    }
    return response;
  }
  // #endregion
  // #region Per-Token Client
  /**
   * Resolve a {@link CAPIClient} that has had its domains updated for the
   * supplied user. Concurrent callers for the same token share one
   * `/copilot_internal/user` discovery via the cache map; callers with
   * different tokens get their **own** `CAPIClient` instance, so the
   * `updateDomains` mutation for token A can never affect a request being
   * dispatched for token B.
   */
  _getClientForToken(githubToken) {
    return this._getEntryForToken(githubToken).then((entry) => entry.capiClient);
  }
  async resolveRestrictedTelemetryContext(githubToken) {
    const client = await this._getEntryForToken(githubToken);
    const telemetryEndpoint = client.restrictedTelemetryEnabled ? client.telemetryEndpoint : void 0;
    return {
      restrictedTelemetryEnabled: client.restrictedTelemetryEnabled,
      trackingId: client.trackingId,
      telemetryEndpoint,
      isInternal: client.isInternal,
      userName: client.login,
      isVscodeTeamMember: client.isVscodeTeamMember,
      copilotIgnoreEnabled: client.copilotIgnoreEnabled
    };
  }
  async resolveApiEndpoint(githubToken) {
    return (await this._getEntryForToken(githubToken)).apiEndpoint;
  }
  async resolveUserLogin(githubToken) {
    return (await this._getEntryForToken(githubToken)).login;
  }
  async resolveCopilotSku(githubToken) {
    return (await this._getEntryForToken(githubToken)).copilotSku;
  }
  _getEntryForToken(githubToken) {
    const nowSeconds = Date.now() / 1e3;
    const existing = this._clientsByToken.get(githubToken);
    if (existing) {
      return existing.then((entry) => {
        if (entry.expiresAt - nowSeconds > CAPI_CONTEXT_REFRESH_BUFFER_SECONDS) {
          return entry;
        }
        this._clientsByToken.delete(githubToken);
        return this._getEntryForToken(githubToken);
      }).catch((err) => {
        this._clientsByToken.delete(githubToken);
        throw err;
      });
    }
    const pending = this._buildClientForToken(githubToken).catch((err) => {
      this._clientsByToken.delete(githubToken);
      throw err;
    });
    this._clientsByToken.set(githubToken, pending);
    return pending;
  }
  _invalidateClientForToken(githubToken) {
    this._clientsByToken.delete(githubToken);
  }
  async _buildClientForToken(githubToken) {
    const { extensionInfo, userUrl } = await this._getCapiBase();
    const fetch2 = this._fetch;
    const capiClient = new CAPIClient(extensionInfo, COPILOT_LICENSE_AGREEMENT, {
      fetch: (url2, options) => fetch2(url2, {
        method: options.method ?? "GET",
        headers: options.headers,
        body: options.body,
        signal: options.signal
      })
    });
    this._logService.debug("[CopilotApiService] Discovering CAPI endpoints via /copilot_internal/user");
    const overrideApi = process.env[CAPI_URL_OVERRIDE_ENV];
    if (overrideApi) {
      if (isAllowedCapiUrlOverride(overrideApi)) {
        this._logService.info(`[CopilotApiService] Using CAPI URL override ${overrideApi}; skipping endpoint discovery`);
        capiClient.updateDomains({ endpoints: { api: overrideApi, proxy: overrideApi }, sku: "" }, void 0);
        return {
          capiClient,
          expiresAt: Date.now() / 1e3 + CAPI_CONTEXT_TTL_SECONDS,
          utilityModelIdsByFamily: /* @__PURE__ */ new Map(),
          apiEndpoint: overrideApi,
          restrictedTelemetryEnabled: false,
          isInternal: false,
          isVscodeTeamMember: false
        };
      }
      this._logService.warn(`[CopilotApiService] Ignoring non-loopback CAPI URL override ${overrideApi}; falling back to normal endpoint discovery`);
    }
    const response = await this._fetch(userUrl, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${githubToken}`,
        "Accept": "application/json",
        "X-GitHub-Api-Version": USER_API_VERSION
      }
    });
    if (!response.ok) {
      const text = await response.text().catch(() => "");
      throw buildCopilotApiHttpError(response.status, response.statusText, text, "Copilot endpoint discovery failed");
    }
    const envelope = await response.json();
    const internalOrganization = getInternalOrg(envelope.organization_login_list);
    capiClient.updateDomains(
      { endpoints: envelope.endpoints ?? {}, sku: envelope.access_type_sku ?? "" },
      // Enterprise base URI (e.g. `https://acme.ghe.com`), or `undefined` for
      // github.com. The package uses this when routing enterprise CAPI requests.
      this._gitHubEndpointService.getEnterpriseUri()
    );
    this._logService.debug("[CopilotApiService] CAPI endpoint discovered, api=", envelope.endpoints?.api);
    return {
      capiClient,
      expiresAt: Date.now() / 1e3 + CAPI_CONTEXT_TTL_SECONDS,
      utilityModelIdsByFamily: /* @__PURE__ */ new Map(),
      copilotSku: envelope.access_type_sku,
      login: envelope.login,
      telemetryEndpoint: envelope.endpoints?.telemetry,
      apiEndpoint: envelope.endpoints?.api,
      copilotIgnoreEnabled: envelope.copilotignore_enabled,
      restrictedTelemetryEnabled: envelope.restricted_telemetry === true,
      trackingId: envelope.analytics_tracking_id,
      isInternal: isInternalAccount(envelope.is_staff, envelope.organization_login_list),
      isVscodeTeamMember: internalOrganization === "vscode"
    };
  }
  /**
   * Resolve the concrete CAPI model id for the supplied family (e.g.
   * `gpt-4o-mini`). Cached with the per-GitHub-token CAPI client so
   * endpoint or authentication invalidation also clears the model id.
   */
  async _resolveUtilityModelId(githubToken, modelFamily) {
    const entry = await this._getEntryForToken(githubToken);
    const cached = entry.utilityModelIdsByFamily.get(modelFamily);
    if (cached) {
      return cached;
    }
    const models = await this.models(githubToken);
    const match2 = models.find((m) => m.capabilities?.family === modelFamily);
    if (!match2) {
      throw new Error(`No CAPI model available for family '${modelFamily}'`);
    }
    entry.utilityModelIdsByFamily.set(modelFamily, match2.id);
    return match2.id;
  }
  // #endregion
  // #region SSE Parsing
  async *_readSSE(body) {
    const reader = body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          break;
        }
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          const event = this._parseDataLine(line);
          if (event !== void 0) {
            yield event;
            if (event.type === "message_stop") {
              return;
            }
          }
        }
      }
      if (buffer.trim()) {
        const event = this._parseDataLine(buffer);
        if (event !== void 0) {
          yield event;
          if (event.type === "message_stop") {
            return;
          }
        }
      }
    } finally {
      try {
        await reader.cancel();
      } catch {
      }
      reader.releaseLock();
    }
  }
  /**
   * @returns the parsed stream event, or `undefined` to skip the line.
   * @throws on `error` events from the server.
   */
  _parseDataLine(line) {
    if (!line.startsWith("data: ")) {
      return void 0;
    }
    const data = line.slice("data: ".length).trim();
    let parsed;
    try {
      parsed = JSON.parse(data);
    } catch {
      this._logService.warn("[CopilotApiService] Failed to parse SSE data:", data);
      return void 0;
    }
    if (typeof parsed !== "object" || parsed === null) {
      return void 0;
    }
    const record = parsed;
    const type = record.type;
    if (typeof type !== "string") {
      return void 0;
    }
    if (type === "error") {
      const rawError = parsed.error;
      let envelope;
      if (rawError && typeof rawError === "object" && typeof rawError.type === "string" && typeof rawError.message === "string") {
        envelope = parsed;
      } else {
        let errorMessage3;
        if (typeof rawError === "string") {
          errorMessage3 = rawError;
        } else if (typeof rawError?.message === "string") {
          errorMessage3 = rawError.message;
        } else {
          errorMessage3 = "Unknown streaming error";
        }
        envelope = {
          type: "error",
          error: { type: "api_error", message: errorMessage3 },
          request_id: null
        };
      }
      throw new CopilotApiError(COPILOT_API_ERROR_STATUS_STREAMING, envelope);
    }
    if (!KNOWN_SSE_EVENT_TYPES.has(type)) {
      return void 0;
    }
    return parsed;
  }
  // #endregion
};

CopilotApiService = __decorateClass([
  __decorateParam(1, ILogService),
  __decorateParam(2, IProductService),
  __decorateParam(3, IAgentHostGitHubEndpointService)
], CopilotApiService);

var KNOWN_SSE_EVENT_TYPES = /* @__PURE__ */ new Set([
  "message_start",
  "message_delta",
  "message_stop",
  "content_block_start",
  "content_block_delta",
  "content_block_stop"
]);
export { isLoopbackUrl, isAllowedCapiUrlOverride, buildCopilotApiHttpError, CAPIClient, RequestType, COPILOT_API_ERROR_STATUS_STREAMING, CAPI_CONTEXT_REFRESH_BUFFER_SECONDS, CAPI_CONTEXT_TTL_SECONDS, USER_API_VERSION, CAPI_URL_OVERRIDE_ENV, CAPI_URL_OVERRIDE_SMOKE_TEST_HOST, CAPI_URL_OVERRIDE_SMOKE_TEST_ENV, UTILITY_DEFAULT_MODEL_FAMILY, UTILITY_DEFAULT_TEMPERATURE, UTILITY_DEFAULT_TOP_P, UTILITY_INTENT, CopilotApiError, ICopilotApiService, CopilotApiService, KNOWN_SSE_EVENT_TYPES };
