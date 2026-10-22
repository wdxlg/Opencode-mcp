// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/providers/remoteAgentHost/browser/cloudSandboxCredentialRefresh.ts
import { Disposable, MutableDisposable, toDisposable } from "./module-0012.mjs";
import { CancellationTokenSource } from "./module-0025.mjs";
import { disposableTimeout } from "./module-0036.mjs";
import { CancellationError, isCancellationError } from "./module-0004.mjs";
import { ICloudSandboxApiService, isRetryableCloudSandboxError } from "./module-3675.mjs";
import { toErrorMessage } from "./module-0094.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ICloudSandboxTelemetryService } from "./module-4281.mjs";
import { ILogService } from "./module-0095.mjs";


// src/vs/sessions/contrib/providers/remoteAgentHost/browser/cloudSandboxCredentialRefresh.ts
var LOG_PREFIX18 = "[CloudSandboxAgentHost]";

var CREDENTIAL_REFRESH_LEAD_MS = 6e4;

var MIN_CREDENTIAL_REFRESH_DELAY_MS = 3e4;

var MAX_CREDENTIAL_REFRESH_DELAY_MS = 55 * 6e4;

var CREDENTIAL_REFRESH_RETRY_MS = 3e4;

var MAX_CONSECUTIVE_CREDENTIAL_REFRESH_FAILURES = 10;

var CREDENTIAL_REFRESH_FALLBACK_MS = 15 * 6e4;

var MAX_WAKING_DELAY_MS = 3e4;

function credentialRefreshDelayMs(expiresAt, now = Date.now()) {
  const expiryMs = expiresAt ? Date.parse(expiresAt) : NaN;
  if (Number.isNaN(expiryMs)) {
    return void 0;
  }
  const delay = expiryMs - now - CREDENTIAL_REFRESH_LEAD_MS;
  return Math.min(MAX_CREDENTIAL_REFRESH_DELAY_MS, Math.max(MIN_CREDENTIAL_REFRESH_DELAY_MS, delay));
}

var CloudSandboxCredentialRefresher = class extends Disposable {
  constructor(_address, _request, _clientId, _creds, _apiService, _telemetry, _logService) {
    super();
    this._address = _address;
    this._request = _request;
    this._clientId = _clientId;
    this._creds = _creds;
    this._apiService = _apiService;
    this._telemetry = _telemetry;
    this._logService = _logService;
    this._timer = this._register(new MutableDisposable());
    /**
     * A `MutableDisposable` silently drops a value assigned after it is disposed, so a timeout armed
     * while a refresh was in flight — the connection can go away mid-request — would never be
     * cancelled and would keep calling `/reconnect` for the life of the window. Cancelling on
     * teardown both aborts the in-flight request and stops anything being armed afterwards.
     */
    this._cts = new CancellationTokenSource();
    /** Consecutive cycles that did not yield a healthy, long-lived token. */
    this._unhealthyCycles = 0;
    this._register(toDisposable(() => this._cts.dispose(true)));
    const initialDelayMs = credentialRefreshDelayMs(this._creds.token.expires_at);
    if (initialDelayMs === void 0) {
      this._armUnhealthy(CREDENTIAL_REFRESH_FALLBACK_MS, "unusableToken", `tokens kept arriving without a usable 'expires_at'`);
      return;
    }
    this._arm(initialDelayMs);
  }
  _stop(reason, detail2, error) {
    this._timer.clear();
    this._telemetry.reportCredentialRefreshStopped(reason, this._unhealthyCycles, error);
    this._logService.error(`${LOG_PREFIX18} Stopped refreshing credentials for ${this._address}: ${detail2}. The connection will drop when the current token expires.`);
  }
  _arm(delayMs) {
    if (this._cts.token.isCancellationRequested) {
      return;
    }
    this._timer.value = disposableTimeout(() => void this._refresh(), Math.max(MIN_CREDENTIAL_REFRESH_DELAY_MS, delayMs));
  }
  /** Re-arm after a cycle that produced no usable token, giving up once too many pile up. */
  _armUnhealthy(delayMs, reason, detail2) {
    if (++this._unhealthyCycles >= MAX_CONSECUTIVE_CREDENTIAL_REFRESH_FAILURES) {
      this._stop(reason, `${detail2} across ${this._unhealthyCycles} consecutive attempts`);
      return;
    }
    this._arm(delayMs);
  }
  async _refresh() {
    let result;
    try {
      result = await this._apiService.reconnect(this._request, this._clientId, this._cts.token);
    } catch (err) {
      if (this._cts.token.isCancellationRequested || isCancellationError(err) || err instanceof CancellationError) {
        return;
      }
      if (!isRetryableCloudSandboxError(err)) {
        this._stop("permanentError", toErrorMessage(err), err);
        return;
      }
      this._logService.warn(`${LOG_PREFIX18} Credential refresh failed for ${this._address}; retrying`, err);
      this._armUnhealthy(CREDENTIAL_REFRESH_RETRY_MS, "consecutiveFailures", "credential refresh kept failing");
      return;
    }
    if (this._cts.token.isCancellationRequested) {
      return;
    }
    if (result.kind === "waking") {
      this._armUnhealthy(Math.min(result.waking.retryAfterSeconds * 1e3, MAX_WAKING_DELAY_MS), "environmentWaking", "environment kept reporting waking");
      return;
    }
    this._creds.token = result.token.encrypted_github_token ? result.token : { ...result.token, encrypted_github_token: this._creds.token.encrypted_github_token, host_encryption_key: this._creds.token.host_encryption_key };
    this._logService.trace(`${LOG_PREFIX18} Refreshed Web PubSub credentials for ${this._address}`);
    const delayMs = credentialRefreshDelayMs(result.token.expires_at);
    if (delayMs === void 0) {
      this._armUnhealthy(CREDENTIAL_REFRESH_FALLBACK_MS, "unusableToken", `tokens kept arriving without a usable 'expires_at'`);
      return;
    }
    if (delayMs <= MIN_CREDENTIAL_REFRESH_DELAY_MS) {
      this._armUnhealthy(delayMs, "unusableToken", "refreshed tokens kept expiring immediately");
      return;
    }
    this._unhealthyCycles = 0;
    this._arm(delayMs);
  }
};

CloudSandboxCredentialRefresher = __decorateClass([
  __decorateParam(4, ICloudSandboxApiService),
  __decorateParam(5, ICloudSandboxTelemetryService),
  __decorateParam(6, ILogService)
], CloudSandboxCredentialRefresher);
export { credentialRefreshDelayMs, LOG_PREFIX18, CREDENTIAL_REFRESH_LEAD_MS, MIN_CREDENTIAL_REFRESH_DELAY_MS, MAX_CREDENTIAL_REFRESH_DELAY_MS, CREDENTIAL_REFRESH_RETRY_MS, MAX_CONSECUTIVE_CREDENTIAL_REFRESH_FAILURES, CREDENTIAL_REFRESH_FALLBACK_MS, MAX_WAKING_DELAY_MS, CloudSandboxCredentialRefresher };
