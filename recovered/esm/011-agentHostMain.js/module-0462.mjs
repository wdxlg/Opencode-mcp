// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/github/common/githubTransport.ts
import { Disposable } from "./module-0010.mjs";
import { schedulerDelay, systemGitHubScheduler } from "./module-0458.mjs";
import { LRUCache } from "./module-0006.mjs";
import { GitHubRequestQueue } from "./module-0460.mjs";
import { GitHubRateLimitCoordinator } from "./module-0461.mjs";
import { hasKey } from "./module-0008.mjs";


// src/vs/platform/github/common/githubTransport.ts
var GitHubRequestError = class extends Error {
  constructor(message, kind, statusCode, responseBody, graphQLErrors) {
    super(message);
    this.kind = kind;
    this.statusCode = statusCode;
    this.responseBody = responseBody;
    this.graphQLErrors = graphQLErrors;
    this.name = "GitHubRequestError";
  }
};

var defaultApiVersion = "2022-11-28";

var maximumErrorBodyLength = 500;

var maximumRedirects = 5;

var GitHubTransport = class extends Disposable {
  constructor(fetchFn, _scheduler = systemGitHubScheduler, _allowInsecureLoopbackDownloads = false, _logService) {
    super();
    this._scheduler = _scheduler;
    this._allowInsecureLoopbackDownloads = _allowInsecureLoopbackDownloads;
    this._logService = _logService;
    this._restCache = new LRUCache(500);
    this._redirects = /* @__PURE__ */ new Map();
    this._inFlight = /* @__PURE__ */ new Map();
    this._graphQlInFlight = /* @__PURE__ */ new Map();
    this._fetch = fetchFn ?? ((input, init) => globalThis.fetch(input, init));
    this._queue = this._register(new GitHubRequestQueue());
    this._rateLimits = this._register(new GitHubRateLimitCoordinator(_scheduler));
  }
  get rateLimits() {
    return this._rateLimits;
  }
  async rest(account, token, request, signal) {
    const finalUrl = this._redirects.get(request.url) ?? request.url;
    const cacheKey = this._restCacheKey(account, request, finalUrl);
    if (request.method !== "GET") {
      return this._executeRest(account, token, request, signal, cacheKey);
    }
    const coalescingKey = this._restCoalescingKey(account, request, finalUrl);
    let shared = this._inFlight.get(coalescingKey);
    if (!shared) {
      const controller = new AbortController();
      const promise = this._executeRest(account, token, request, controller.signal, cacheKey);
      shared = { controller, promise, waiters: 0 };
      this._inFlight.set(coalescingKey, shared);
      const created = shared;
      void promise.then(
        () => this._deleteRestRequest(coalescingKey, created),
        () => this._deleteRestRequest(coalescingKey, created)
      );
    } else {
      this._logService?.trace(`[GitHubTransport] Reusing REST ${formatRequestUrl(finalUrl)} (waiters: ${shared.waiters + 1})`);
    }
    shared.waiters++;
    try {
      return await this._waitForShared(shared, signal);
    } finally {
      shared.waiters--;
      if (shared.waiters === 0 && this._inFlight.get(coalescingKey) === shared) {
        this._inFlight.delete(coalescingKey);
        this._logService?.trace(`[GitHubTransport] Cancelling REST ${formatRequestUrl(finalUrl)} because all waiters detached`);
        shared.controller.abort(new Error("All GitHub request waiters cancelled"));
      }
    }
  }
  async graphql(account, token, url2, query, variables, signal, priority = "interactive") {
    if (/^\s*mutation\b/i.test(query)) {
      return this._executeGraphQL(account, token, url2, query, variables, signal, priority);
    }
    return this._graphqlRead(account, token, url2, query, variables, signal, priority);
  }
  async download(account, token, request, signal) {
    const priority = request.priority ?? "interactive";
    return this._logRequest("download", formatDownloadUrl(request.url), account, priority, signal, () => this._enqueueWithRateLimit(account, "core", priority, signal, async () => {
      const controller = new AbortController();
      const timeout2 = this._scheduler.schedule(
        () => controller.abort(new GitHubRequestError("GitHub download timed out", "network")),
        Math.max(0, request.timeout)
      );
      const combinedSignal = AbortSignal.any([signal, controller.signal]);
      try {
        const initialOrigin = new URL(request.url).origin;
        let url2 = request.url;
        let authenticated = true;
        for (let redirectCount = 0; redirectCount <= maximumRedirects; redirectCount++) {
          const headers = {
            "Accept": "text/plain, application/octet-stream",
            "Cache-Control": "no-store",
            "X-GitHub-Api-Version": defaultApiVersion
          };
          if (authenticated) {
            headers["Authorization"] = `Bearer ${token}`;
          }
          let response;
          try {
            response = await this._fetch(url2, {
              method: "GET",
              cache: "no-store",
              headers,
              signal: combinedSignal,
              redirect: "manual"
            });
          } catch (error) {
            if (combinedSignal.aborted) {
              throw combinedSignal.reason ?? error;
            }
            throw new GitHubRequestError(`GitHub download network request failed: ${String(error)}`, "network");
          }
          this._logService?.trace(`[GitHubTransport] Download request returned HTTP ${response.status}`);
          if (authenticated) {
            this._rateLimits.updateFromResponse(account, response);
          }
          if ([301, 302, 307, 308].includes(response.status)) {
            const location = response.headers.get("location");
            if (!location) {
              throw new GitHubRequestError("GitHub download redirect was missing a Location header", "malformedResponse", response.status);
            }
            const redirected = new URL(location, url2);
            validateDownloadUrl(redirected, this._allowInsecureLoopbackDownloads);
            authenticated = redirected.origin === initialOrigin;
            this._logService?.trace(`[GitHubTransport] Following download redirect to ${formatDownloadUrl(redirected.href)} (authenticated: ${authenticated})`);
            url2 = redirected.href;
            continue;
          }
          if (!response.ok) {
            const body2 = await response.text();
            throw this._httpError("GitHub download failed", response, body2);
          }
          const body = await readBoundedResponse(response, request.maximumBytes, combinedSignal);
          this._logService?.trace(`[GitHubTransport] Downloaded ${body.bytes.byteLength} byte(s) (truncated: ${body.truncated})`);
          return {
            text: new TextDecoder().decode(body.bytes),
            truncated: body.truncated,
            sourceUrl: url2,
            contentType: response.headers.get("content-type") ?? void 0
          };
        }
        throw new GitHubRequestError("GitHub download exceeded the redirect limit", "unknown");
      } finally {
        timeout2.dispose();
      }
    }));
  }
  async _graphqlRead(account, token, url2, query, variables, signal, priority) {
    const key = `${GitHubRequestQueue.accountKey(account)}\0${url2}\0${query}\0${canonicalJson(variables)}`;
    let shared = this._graphQlInFlight.get(key);
    if (!shared) {
      const controller = new AbortController();
      const promise = this._executeGraphQL(account, token, url2, query, variables, controller.signal, priority);
      shared = { controller, promise, waiters: 0 };
      this._graphQlInFlight.set(key, shared);
      const created = shared;
      void promise.then(
        () => this._deleteGraphQLRequest(key, created),
        () => this._deleteGraphQLRequest(key, created)
      );
    } else {
      this._logService?.trace(`[GitHubTransport] Reusing GraphQL ${graphQLOperationName(query)} (waiters: ${shared.waiters + 1})`);
    }
    shared.waiters++;
    try {
      return await this._waitForSharedGraphQL(shared, signal);
    } finally {
      shared.waiters--;
      if (shared.waiters === 0 && this._graphQlInFlight.get(key) === shared) {
        this._graphQlInFlight.delete(key);
        this._logService?.trace(`[GitHubTransport] Cancelling GraphQL ${graphQLOperationName(query)} because all waiters detached`);
        shared.controller.abort(new Error("All GitHub GraphQL request waiters cancelled"));
      }
    }
  }
  async _executeGraphQL(account, token, url2, query, variables, signal, priority) {
    const operation = graphQLOperationName(query);
    return this._logRequest("GraphQL", operation, account, priority, signal, () => this._enqueueWithRateLimit(account, "graphql", priority, signal, async () => {
      const response = await this._fetchWithRetry(url2, {
        method: "POST",
        cache: "no-store",
        headers: {
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`,
          "Cache-Control": "no-store",
          "Content-Type": "application/json",
          "X-GitHub-Api-Version": defaultApiVersion
        },
        body: JSON.stringify({ query, variables }),
        signal,
        redirect: "manual"
      }, !/^\s*mutation\b/i.test(query));
      this._logService?.trace(`[GitHubTransport] GraphQL ${operation} returned HTTP ${response.status}`);
      const body = response.status === 204 ? "" : await response.text();
      this._rateLimits.updateFromResponse(account, response, body);
      if (!response.ok) {
        throw this._httpError("GitHub GraphQL request failed", response, body);
      }
      const json = this._parseJson(body, "GitHub GraphQL response was not valid JSON");
      const errors = Array.isArray(json.errors) ? json.errors : [];
      const rateLimit = readGraphQLRateLimit(json.data);
      this._rateLimits.updateFromGraphQL(account, rateLimit);
      if (errors.some((error) => error.type === "RATE_LIMITED")) {
        this._rateLimits.markGraphQLRateLimited(account);
      }
      this._logRateLimit(account, "graphql");
      this._logService?.trace(`[GitHubTransport] GraphQL ${operation} returned ${errors.length} error(s)`);
      return { data: json.data, errors, observedAt: this._scheduler.now() };
    }));
  }
  invalidateAccount(account, reason) {
    const accountKey = GitHubRequestQueue.accountKey(account);
    const restRequests = [...this._inFlight.keys()].filter((key) => key.startsWith(`${accountKey}\0`)).length;
    const graphQlRequests = [...this._graphQlInFlight.keys()].filter((key) => key.startsWith(`${accountKey}\0`)).length;
    this._logService?.debug(`[GitHubTransport] Invalidating state for ${account.host} (REST requests: ${restRequests}, GraphQL requests: ${graphQlRequests})`);
    this._queue.cancelAccount(account, reason);
    this._rateLimits.clearAccount(account);
    const cacheKeys = [];
    for (const [key, entry] of this._restCache) {
      if (entry.accountKey === accountKey) {
        cacheKeys.push(key);
      }
    }
    for (const key of cacheKeys) {
      this._restCache.delete(key);
    }
    for (const [key, request] of this._inFlight) {
      if (key.startsWith(`${accountKey}\0`)) {
        this._inFlight.delete(key);
        request.controller.abort(reason);
      }
    }
    for (const [key, request] of this._graphQlInFlight) {
      if (key.startsWith(`${accountKey}\0`)) {
        this._graphQlInFlight.delete(key);
        request.controller.abort(reason);
      }
    }
  }
  clear() {
    this._logService?.debug(`[GitHubTransport] Clearing transport state (cache: ${this._restCache.size}, REST requests: ${this._inFlight.size}, GraphQL requests: ${this._graphQlInFlight.size})`);
    this._restCache.clear();
    this._redirects.clear();
    for (const request of this._inFlight.values()) {
      request.controller.abort(new Error("GitHub transport state was cleared"));
    }
    this._inFlight.clear();
    for (const request of this._graphQlInFlight.values()) {
      request.controller.abort(new Error("GitHub transport state was cleared"));
    }
    this._graphQlInFlight.clear();
  }
  dispose() {
    this.clear();
    super.dispose();
  }
  async _executeRest(account, token, request, signal, cacheKey) {
    const priority = request.priority ?? (request.method === "GET" ? "interactive" : "mutation");
    const operation = `${request.method} ${formatRequestUrl(request.url)}`;
    return this._logRequest("REST", operation, account, priority, signal, () => this._enqueueWithRateLimit(account, "core", priority, signal, async () => {
      const cached = request.etag !== false && !request.unconditional ? this._restCache.get(cacheKey) : void 0;
      if (cached) {
        this._logService?.trace(`[GitHubTransport] Using cached ETag for ${operation}`);
      }
      const headers = {
        "Accept": request.accept ?? "application/vnd.github+json",
        "Authorization": `Bearer ${token}`,
        "Cache-Control": "no-store",
        "X-GitHub-Api-Version": request.apiVersion ?? defaultApiVersion
      };
      if (cached) {
        headers["If-None-Match"] = cached.etag;
      }
      if (request.body !== void 0) {
        headers["Content-Type"] = "application/json";
      }
      const response = await this._fetchRestWithRedirects(account, request.url, {
        method: request.method,
        cache: "no-store",
        headers,
        body: request.body === void 0 ? void 0 : JSON.stringify(request.body),
        signal,
        redirect: "manual"
      }, request.method === "GET");
      this._logService?.trace(`[GitHubTransport] REST ${operation} returned HTTP ${response.status}`);
      const finalUrl = response.url || this._redirects.get(request.url) || request.url;
      const body = response.status === 204 || response.status === 304 ? "" : await response.text();
      this._rateLimits.updateFromResponse(account, response, body);
      this._logRateLimit(account, response.headers.get("x-ratelimit-resource") ?? "core");
      if (response.status === 304) {
        if (!cached) {
          throw new GitHubRequestError("GitHub returned 304 without a cached representation", "malformedResponse", 304);
        }
        const revalidatedEtag = response.headers.get("etag") ?? cached.etag;
        const revalidatedLink = response.headers.get("link") ?? cached.link;
        if (revalidatedEtag !== cached.etag) {
          this._logService?.trace(`[GitHubTransport] Adopting reissued validator for ${operation}`);
        }
        this._restCache.set(cacheKey, {
          ...cached,
          etag: revalidatedEtag,
          link: revalidatedLink,
          fetchedAt: this._scheduler.now()
        });
        this._logService?.trace(`[GitHubTransport] Reused cached representation for ${operation}`);
        return {
          data: this._parseJson(cached.body, "Cached GitHub response was not valid JSON"),
          statusCode: 304,
          etag: revalidatedEtag,
          finalUrl: cached.finalUrl,
          link: revalidatedLink,
          observedAt: this._scheduler.now()
        };
      }
      if (!response.ok) {
        const requestUrl = new URL(request.url);
        const route = `${requestUrl.pathname.replace(/^\//, "")}${requestUrl.search}`;
        throw this._httpError(`GitHub API request failed: ${request.method} ${route}`, response, body);
      }
      const responseEtag = response.headers.get("etag") ?? void 0;
      const representationVersion = request.representationVersion ?? 1;
      const finalCacheKey = this._restCacheKey(account, request, finalUrl);
      if (request.method === "GET" && request.etag !== false) {
        if (responseEtag) {
          const entry = {
            accountKey: GitHubRequestQueue.accountKey(account),
            etag: responseEtag,
            body,
            finalUrl,
            fetchedAt: this._scheduler.now(),
            link: response.headers.get("link") ?? void 0,
            representationVersion
          };
          this._restCache.set(finalCacheKey, entry);
          this._logService?.trace(`[GitHubTransport] Cached ETag for ${operation}`);
          if (finalCacheKey !== cacheKey) {
            this._restCache.delete(cacheKey);
            this._redirects.set(request.url, finalUrl);
          }
        } else {
          this._restCache.delete(cacheKey);
          this._restCache.delete(finalCacheKey);
        }
      }
      return {
        data: body ? this._parseJson(body, "GitHub response was not valid JSON") : void 0,
        statusCode: response.status,
        etag: responseEtag,
        finalUrl,
        link: response.headers.get("link") ?? void 0,
        observedAt: this._scheduler.now()
      };
    }));
  }
  async _enqueueWithRateLimit(account, resource, priority, signal, task) {
    while (true) {
      const delay = this._rateLimits.getDelay(account, resource);
      if (delay > 0) {
        this._logService?.debug(`[GitHubTransport] Waiting ${delay}ms for ${resource} rate limit on ${account.host}`);
        await this._rateLimits.wait(account, resource, signal);
      }
      const result = await this._queue.enqueue(account, priority, signal, async () => {
        if (this._rateLimits.getDelay(account, resource) > 0) {
          this._logService?.trace(`[GitHubTransport] Requeueing ${resource} request because its rate limit changed`);
          return { blocked: true };
        }
        return { blocked: false, value: await task() };
      });
      if (!result.blocked) {
        return result.value;
      }
    }
  }
  async _fetchRestWithRedirects(account, initialUrl, init, retry2) {
    let url2 = this._redirects.get(initialUrl) ?? initialUrl;
    const initialOrigin = new URL(url2).origin;
    for (let redirectCount = 0; redirectCount <= maximumRedirects; redirectCount++) {
      const response = await this._fetchWithRetry(url2, init, retry2);
      if (![301, 302, 307, 308].includes(response.status)) {
        if (url2 !== initialUrl) {
          this._redirects.set(initialUrl, url2);
        }
        return response;
      }
      const location = response.headers.get("location");
      if (!location) {
        throw new GitHubRequestError("GitHub redirect was missing a Location header", "malformedResponse", response.status);
      }
      url2 = new URL(location, url2).href;
      if (new URL(url2).origin !== initialOrigin) {
        throw new GitHubRequestError("GitHub redirect changed origin", "authorization", response.status);
      }
      this._logService?.trace(`[GitHubTransport] Following REST redirect to ${formatRequestUrl(url2)}`);
    }
    throw new GitHubRequestError("GitHub API request exceeded the redirect limit", "unknown");
  }
  async _fetchWithRetry(url2, init, retry2) {
    let failure;
    for (let attempt = 0; attempt < (retry2 ? 2 : 1); attempt++) {
      try {
        const response = await this._fetch(url2, init);
        if (retry2 && attempt === 0 && response.status >= 500) {
          this._logService?.debug(`[GitHubTransport] Retrying ${formatRequestUrl(url2)} after HTTP ${response.status}`);
          await schedulerDelay(this._scheduler, 100 + this._scheduler.jitter(200), init.signal);
          continue;
        }
        return response;
      } catch (error) {
        if (init.signal.aborted) {
          throw error;
        }
        failure = error;
        if (attempt === 0 && retry2) {
          this._logService?.debug(`[GitHubTransport] Retrying ${formatRequestUrl(url2)} after a network failure`);
          await schedulerDelay(this._scheduler, 100 + this._scheduler.jitter(200), init.signal);
        }
      }
    }
    throw new GitHubRequestError(`GitHub network request failed: ${String(failure)}`, "network");
  }
  _restCacheKey(account, request, url2) {
    return [
      GitHubRequestQueue.accountKey(account),
      request.method,
      url2,
      request.accept ?? "application/vnd.github+json",
      request.apiVersion ?? defaultApiVersion,
      request.representationVersion ?? 1
    ].join("\0");
  }
  _restCoalescingKey(account, request, url2) {
    return [
      this._restCacheKey(account, request, url2),
      request.etag === false ? "etag-disabled" : "etag-enabled",
      request.unconditional === true ? "unconditional" : "conditional"
    ].join("\0");
  }
  _deleteRestRequest(key, request) {
    if (this._inFlight.get(key) === request) {
      this._inFlight.delete(key);
    }
  }
  _deleteGraphQLRequest(key, request) {
    if (this._graphQlInFlight.get(key) === request) {
      this._graphQlInFlight.delete(key);
    }
  }
  _httpError(prefix, response, body) {
    const detail = formatErrorBody(body);
    const message = `${prefix} - ${response.status} ${response.statusText}${detail ? ` - ${detail}` : ""}`;
    return new GitHubRequestError(message, classifyHttpError(response.status, body), response.status, body);
  }
  _parseJson(body, message) {
    try {
      return JSON.parse(body);
    } catch {
      throw new GitHubRequestError(message, "malformedResponse");
    }
  }
  async _logRequest(kind, operation, account, priority, signal, task) {
    const startedAt = this._scheduler.now();
    this._logService?.trace(`[GitHubTransport] ${kind} ${operation} started on ${account.host} (priority: ${priority})`);
    try {
      const result = await task();
      this._logService?.trace(`[GitHubTransport] ${kind} ${operation} completed in ${this._scheduler.now() - startedAt}ms`);
      return result;
    } catch (error) {
      const outcome = signal.aborted ? "cancelled" : "failed";
      this._logService?.debug(`[GitHubTransport] ${kind} ${operation} ${outcome} after ${this._scheduler.now() - startedAt}ms (${transportErrorKind(error)})`);
      throw error;
    }
  }
  _logRateLimit(account, resource) {
    const state = this._rateLimits.getState(account, resource);
    if (state) {
      this._logService?.trace(`[GitHubTransport] Rate limit ${resource} on ${account.host}: remaining=${state.remaining ?? "unknown"}, limit=${state.limit ?? "unknown"}, resetAt=${state.resetAt ?? "unknown"}, blockedUntil=${state.blockedUntil ?? "none"}`);
    }
  }
  _waitForShared(shared, signal) {
    if (signal.aborted) {
      return Promise.reject(signal.reason);
    }
    return new Promise((resolve3, reject) => {
      const onAbort = () => reject(signal.reason);
      signal.addEventListener("abort", onAbort, { once: true });
      void shared.promise.then(
        (response) => {
          signal.removeEventListener("abort", onAbort);
          resolve3(response);
        },
        (error) => {
          signal.removeEventListener("abort", onAbort);
          reject(error);
        }
      );
    });
  }
  _waitForSharedGraphQL(shared, signal) {
    if (signal.aborted) {
      return Promise.reject(signal.reason);
    }
    return new Promise((resolve3, reject) => {
      const onAbort = () => reject(signal.reason);
      signal.addEventListener("abort", onAbort, { once: true });
      void shared.promise.then(
        (response) => {
          signal.removeEventListener("abort", onAbort);
          resolve3(response);
        },
        (error) => {
          signal.removeEventListener("abort", onAbort);
          reject(error);
        }
      );
    });
  }
};

function classifyHttpError(statusCode, body) {
  switch (statusCode) {
    case 401:
      return "authentication";
    case 403:
      return body.toLowerCase().includes("rate limit") ? "rateLimit" : "authorization";
    case 404:
      return "notFound";
    case 422:
      return "validation";
    case 429:
      return "rateLimit";
    default:
      return statusCode >= 500 ? "server" : "unknown";
  }
}

function formatErrorBody(body) {
  const normalized = body.replace(/\s+/g, " ").trim();
  if (!normalized) {
    return void 0;
  }
  return normalized.length > maximumErrorBodyLength ? `${normalized.substring(0, maximumErrorBodyLength)}...` : normalized;
}

function readGraphQLRateLimit(data) {
  if (!data || typeof data !== "object" || !hasKey(data, { rateLimit: true })) {
    return void 0;
  }
  const rateLimit = Reflect.get(data, "rateLimit");
  if (!rateLimit || typeof rateLimit !== "object") {
    return void 0;
  }
  return {
    limit: readNumber(rateLimit, "limit"),
    remaining: readNumber(rateLimit, "remaining"),
    used: readNumber(rateLimit, "used"),
    resetAt: readString2(rateLimit, "resetAt")
  };
}

function readNumber(value, key) {
  const property = Reflect.get(value, key);
  return typeof property === "number" ? property : void 0;
}

function readString2(value, key) {
  const property = Reflect.get(value, key);
  return typeof property === "string" ? property : void 0;
}

function canonicalJson(value) {
  if (Array.isArray(value)) {
    return `[${value.map(canonicalJson).join(",")}]`;
  }
  if (value && typeof value === "object") {
    return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonicalJson(Reflect.get(value, key))}`).join(",")}}`;
  }
  return JSON.stringify(value) ?? "undefined";
}

function formatRequestUrl(value) {
  try {
    const url2 = new URL(value);
    return `${url2.host}${url2.pathname}`;
  } catch {
    return "<invalid-url>";
  }
}

function formatDownloadUrl(value) {
  try {
    return new URL(value).host;
  } catch {
    return "<invalid-url>";
  }
}

function graphQLOperationName(query) {
  return /\b(?:query|mutation)\s+(?<name>[_A-Za-z][_0-9A-Za-z]*)/.exec(query)?.groups?.name ?? "<anonymous>";
}

function transportErrorKind(error) {
  if (error instanceof GitHubRequestError) {
    return `${error.kind}${error.statusCode === void 0 ? "" : `:${error.statusCode}`}`;
  }
  return error instanceof Error ? error.name : typeof error;
}

function validateDownloadUrl(url2, allowInsecureLoopback) {
  if (url2.protocol === "https:") {
    return;
  }
  if (allowInsecureLoopback && url2.protocol === "http:" && (url2.hostname === "127.0.0.1" || url2.hostname === "localhost" || url2.hostname === "[::1]")) {
    return;
  }
  throw new GitHubRequestError("GitHub download redirect used an unsafe target", "authorization");
}

async function readBoundedResponse(response, maximumBytes, signal) {
  const limit = Math.max(0, maximumBytes);
  if (!response.body) {
    return { bytes: new Uint8Array(), truncated: false };
  }
  const reader = response.body.getReader();
  const chunks = [];
  let length = 0;
  try {
    while (true) {
      if (signal.aborted) {
        throw signal.reason;
      }
      const result = await reader.read();
      if (result.done) {
        break;
      }
      if (length + result.value.byteLength > limit) {
        const remaining = Math.max(0, limit - length);
        if (remaining > 0) {
          chunks.push(result.value.slice(0, remaining));
          length += remaining;
        }
        await reader.cancel();
        return { bytes: concatenateBytes(chunks, length), truncated: true };
      }
      chunks.push(result.value);
      length += result.value.byteLength;
    }
    return { bytes: concatenateBytes(chunks, length), truncated: false };
  } finally {
    reader.releaseLock();
  }
}

function concatenateBytes(chunks, length) {
  const result = new Uint8Array(length);
  let offset = 0;
  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return result;
}
export { classifyHttpError, formatErrorBody, readGraphQLRateLimit, readNumber, readString2, canonicalJson, formatRequestUrl, formatDownloadUrl, graphQLOperationName, transportErrorKind, validateDownloadUrl, readBoundedResponse, concatenateBytes, GitHubRequestError, defaultApiVersion, maximumErrorBodyLength, maximumRedirects, GitHubTransport };
