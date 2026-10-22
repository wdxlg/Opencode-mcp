// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/platform/github/common/githubRateLimitCoordinator.ts
import { Disposable } from "./module-0012.mjs";
import { GitHubRequestQueue } from "./module-1789.mjs";
import { schedulerDelay } from "./module-1787.mjs";


// src/vs/platform/github/common/githubRateLimitCoordinator.ts
var unhintedRateLimitCooldown = 6e4;

var GitHubRateLimitCoordinator = class extends Disposable {
  constructor(_scheduler) {
    super();
    this._scheduler = _scheduler;
    this._states = /* @__PURE__ */ new Map();
    this._accountBlockedUntil = /* @__PURE__ */ new Map();
  }
  getState(account, resource) {
    return this._states.get(this._key(account, resource));
  }
  getDelay(account, resource) {
    const accountKey = GitHubRequestQueue.accountKey(account);
    const state = this._states.get(this._key(account, resource));
    const resourceBlockedUntil = state?.blockedUntil ?? (state?.remaining === 0 ? state.resetAt : void 0);
    const accountBlockedUntil = this._accountBlockedUntil.get(accountKey);
    const blockedUntil = resourceBlockedUntil === void 0 ? accountBlockedUntil : accountBlockedUntil === void 0 ? resourceBlockedUntil : Math.max(resourceBlockedUntil, accountBlockedUntil);
    return blockedUntil === void 0 ? 0 : Math.max(0, blockedUntil - this._scheduler.now());
  }
  async wait(account, resource, signal) {
    const delay = this.getDelay(account, resource);
    if (delay > 0) {
      await schedulerDelay(this._scheduler, delay, signal);
    }
  }
  updateFromResponse(account, response, responseBody) {
    const resource = response.headers.get("x-ratelimit-resource") ?? "core";
    const key3 = this._key(account, resource);
    const previous = this._states.get(key3);
    const now = this._scheduler.now();
    const retryAfter = parseSeconds(response.headers.get("retry-after"), now);
    const resetSeconds = parseNumber(response.headers.get("x-ratelimit-reset"));
    const remaining = parseNumber(response.headers.get("x-ratelimit-remaining"));
    const rateLimited = isRateLimited(response.status, responseBody);
    const secondaryLimited = rateLimited && isSecondaryRateLimit(responseBody);
    const hinted = retryAfter !== void 0 ? now + retryAfter * 1e3 : remaining === 0 && resetSeconds !== void 0 ? resetSeconds * 1e3 : void 0;
    const refusedUntil = hinted !== void 0 && hinted > now ? hinted : now + unhintedRateLimitCooldown;
    const blockedUntil = secondaryLimited ? void 0 : rateLimited ? refusedUntil : retryAfter !== void 0 ? now + retryAfter * 1e3 : void 0;
    if (secondaryLimited) {
      const accountKey = GitHubRequestQueue.accountKey(account);
      this._accountBlockedUntil.set(accountKey, Math.max(refusedUntil, this._accountBlockedUntil.get(accountKey) ?? 0));
    }
    this._states.set(key3, {
      limit: parseNumber(response.headers.get("x-ratelimit-limit")) ?? previous?.limit,
      remaining: remaining ?? previous?.remaining,
      used: parseNumber(response.headers.get("x-ratelimit-used")) ?? previous?.used,
      resetAt: resetSeconds !== void 0 ? resetSeconds * 1e3 : previous?.resetAt,
      blockedUntil
    });
  }
  updateFromGraphQL(account, rateLimit) {
    if (!rateLimit) {
      return;
    }
    const resetAt = typeof rateLimit.resetAt === "string" ? Date.parse(rateLimit.resetAt) : void 0;
    this._states.set(this._key(account, "graphql"), {
      limit: rateLimit.limit,
      remaining: rateLimit.remaining,
      used: rateLimit.used,
      resetAt: resetAt !== void 0 && Number.isFinite(resetAt) ? resetAt : void 0
    });
  }
  markGraphQLRateLimited(account) {
    const key3 = this._key(account, "graphql");
    const previous = this._states.get(key3);
    const now = this._scheduler.now();
    this._states.set(key3, {
      ...previous,
      remaining: 0,
      // The retained reset can belong to a window that has already closed,
      // and a refusal must park the caller rather than retry at once.
      blockedUntil: previous?.resetAt !== void 0 && previous.resetAt > now ? previous.resetAt : now + unhintedRateLimitCooldown
    });
  }
  clearAccount(account) {
    const accountKey = GitHubRequestQueue.accountKey(account);
    const prefix = `${accountKey}\0`;
    for (const key3 of this._states.keys()) {
      if (key3.startsWith(prefix)) {
        this._states.delete(key3);
      }
    }
    this._accountBlockedUntil.delete(accountKey);
  }
  dispose() {
    this._states.clear();
    this._accountBlockedUntil.clear();
    super.dispose();
  }
  _key(account, resource) {
    return `${GitHubRequestQueue.accountKey(account)}\0${resource}`;
  }
};

function parseNumber(value2) {
  if (value2 === null) {
    return void 0;
  }
  const parsed = Number(value2);
  return Number.isFinite(parsed) ? parsed : void 0;
}

function parseSeconds(value2, now) {
  const parsed = parseNumber(value2);
  if (parsed !== void 0) {
    return Math.max(0, parsed);
  }
  if (value2 === null) {
    return void 0;
  }
  const date = Date.parse(value2);
  return Number.isFinite(date) ? Math.max(0, Math.ceil((date - now) / 1e3)) : void 0;
}

function isRateLimited(status2, body) {
  if (status2 === 429) {
    return true;
  }
  return status2 === 403 && (body?.toLowerCase().includes("rate limit") ?? false);
}

function isSecondaryRateLimit(body) {
  return body?.toLowerCase().includes("secondary rate limit") ?? false;
}
export { parseNumber, parseSeconds, isRateLimited, isSecondaryRateLimit, unhintedRateLimitCooldown, GitHubRateLimitCoordinator };
