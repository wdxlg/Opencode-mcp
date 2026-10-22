// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/automations/browser/automationLeaderElection.ts
import { Disposable, toDisposable } from "./module-0012.mjs";
import { IntervalTimer } from "./module-0036.mjs";
import { generateUuid } from "./module-0190.mjs";
import { observableValue } from "./module-0048.mjs";


// src/vs/sessions/contrib/automations/browser/automationLeaderElection.ts
var LEADER_KEY = "chat.automations.leader";

var DEFAULT_HEARTBEAT_INTERVAL_MS = 3e4;

var DEFAULT_STALE_AFTER_MS = 9e4;

var AutomationLeaderElection = class extends Disposable {
  constructor(storageService, logService, options3 = {}) {
    super();
    this.storageService = storageService;
    this.logService = logService;
    this._timer = this._register(new IntervalTimer());
    this._instanceId = options3.instanceId ?? generateUuid();
    this._heartbeatIntervalMs = options3.heartbeatIntervalMs ?? DEFAULT_HEARTBEAT_INTERVAL_MS;
    this._staleAfterMs = options3.staleAfterMs ?? DEFAULT_STALE_AFTER_MS;
    this._now = options3.now ?? Date.now;
    this._isLeader = observableValue(this, false);
    this.isLeader = this._isLeader;
    this._register(toDisposable(() => this.releaseIfLeader()));
    this.evaluate();
    this._timer.cancelAndSet(() => this.evaluate(), this._heartbeatIntervalMs);
  }
  get instanceId() {
    return this._instanceId;
  }
  /** Test-only: drive the evaluation cycle synchronously. */
  evaluateForTesting() {
    this.evaluate();
  }
  evaluate() {
    const now = this._now();
    const current = this.readLeader();
    const claimable = !current || current.instanceId === this._instanceId || current.instanceId === "" || now - current.heartbeatAt > this._staleAfterMs;
    if (!claimable) {
      if (this._isLeader.get()) {
        this.logService.info(`[AutomationLeaderElection] window ${this._instanceId} stood down for ${current.instanceId}.`);
      }
      this._isLeader.set(false, void 0);
      return;
    }
    const nonce = generateUuid();
    const writeOk = this.writeLeader({ instanceId: this._instanceId, heartbeatAt: now, nonce });
    if (!writeOk) {
      this._isLeader.set(false, void 0);
      return;
    }
    const verify = this.readLeader();
    if (verify?.instanceId === this._instanceId && verify.nonce === nonce) {
      if (!this._isLeader.get()) {
        this.logService.info(`[AutomationLeaderElection] window ${this._instanceId} claimed leader slot.`);
      }
      this._isLeader.set(true, void 0);
    } else {
      if (this._isLeader.get()) {
        this.logService.info(`[AutomationLeaderElection] window ${this._instanceId} lost leader race to ${verify?.instanceId ?? "<none>"}.`);
      }
      this._isLeader.set(false, void 0);
    }
  }
  readLeader() {
    let raw;
    try {
      raw = this.storageService.get(LEADER_KEY, -1 /* APPLICATION */);
    } catch (err) {
      this.logService.warn("[AutomationLeaderElection] storage read failed", err);
      return void 0;
    }
    if (!raw) {
      return void 0;
    }
    try {
      const parsed = JSON.parse(raw);
      if (typeof parsed?.instanceId !== "string" || typeof parsed?.heartbeatAt !== "number") {
        return void 0;
      }
      return { instanceId: parsed.instanceId, heartbeatAt: parsed.heartbeatAt, nonce: typeof parsed.nonce === "string" ? parsed.nonce : "" };
    } catch {
      return void 0;
    }
  }
  /** Returns true if the write succeeded, false if storage threw. */
  writeLeader(record) {
    try {
      this.storageService.store(LEADER_KEY, JSON.stringify(record), -1 /* APPLICATION */, 1 /* MACHINE */);
      return true;
    } catch (err) {
      this.logService.warn("[AutomationLeaderElection] storage write failed", err);
      return false;
    }
  }
  // Write a tombstone on clean shutdown so the next window can claim immediately.
  releaseIfLeader() {
    const current = this.readLeader();
    if (current?.instanceId !== this._instanceId) {
      return;
    }
    this.writeLeader({ instanceId: "", heartbeatAt: 0, nonce: "" });
  }
};
export { LEADER_KEY, DEFAULT_HEARTBEAT_INTERVAL_MS, DEFAULT_STALE_AFTER_MS, AutomationLeaderElection };
