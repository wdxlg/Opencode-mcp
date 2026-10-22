// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/providers/remoteAgentHost/browser/cloudSandboxSessionsProvider.ts
import { RemoteAgentHostSessionsProvider } from "./module-3684.mjs";
import { AgentSession } from "./module-1107.mjs";


// src/vs/sessions/contrib/providers/remoteAgentHost/browser/cloudSandboxSessionsProvider.ts
var CloudSandboxSessionsProvider = class _CloudSandboxSessionsProvider extends RemoteAgentHostSessionsProvider {
  constructor() {
    super(...arguments);
    /**
     * Provisional sessions kept out of {@link getSessions} because the caller is still showing a
     * placeholder row for them. They stay reachable by resource, so opening one still works.
     */
    this._withheldSessions = /* @__PURE__ */ new Set();
    /**
     * Raw id → deadline after which eviction resumes, or `undefined` while the clock has not
     * started. It starts when a connected host first omits the session, not at seed time, because
     * waking a sandbox can take minutes.
     */
    this._provisionalSessions = /* @__PURE__ */ new Map();
  }
  static {
    /** How long a provisional session resists eviction after the host first omits it. */
    this.PROVISIONAL_GRACE_MS = 2 * 6e4;
  }
  /**
   * Seed a session this client just provisioned. It is cached so a later discovery pass
   * reconciles against it rather than adding a second entry, but stays out of the sessions list
   * until {@link publishWithheldSession} and resists eviction until the host lists it.
   */
  seedProvisionalSession(rawMeta) {
    const meta = this._adoptSessionMeta(rawMeta);
    const rawId = AgentSession.id(meta.session);
    if (this._sessionCache.has(rawId)) {
      return;
    }
    this._sessionCache.set(rawId, this.createAdapter(meta));
    this._withheldSessions.add(rawId);
    this._provisionalSessions.set(rawId, void 0);
  }
  /**
   * Reveal a session seeded by {@link seedProvisionalSession}, so {@link getSessions} returns it.
   *
   * Pass `announce: false` when the caller immediately fires its own change event covering this
   * session: the list re-reads {@link getSessions} on any change, so a single event can both drop
   * a placeholder row and reveal this one.
   */
  publishWithheldSession(rawId, options3) {
    if (!this._withheldSessions.delete(rawId)) {
      return;
    }
    const session = this._sessionCache.get(rawId);
    if (session && options3?.announce !== false) {
      this._onDidChangeSessions.fire({ added: [session], removed: [], changed: [] });
    }
  }
  /**
   * Look up a cached session by raw id, **including** ones withheld from {@link getSessions},
   * which callers that seeded a session need before it is listed.
   */
  getCachedSession(rawId) {
    return this._sessionCache.get(rawId);
  }
  getSessions() {
    const sessions = super.getSessions();
    return this._withheldSessions.size === 0 ? sessions : sessions.filter((session) => !this._withheldSessions.has(AgentSession.id(session.resource)));
  }
  _isSessionEvictable(rawId) {
    if (!this._provisionalSessions.has(rawId)) {
      return true;
    }
    const deadline = this._provisionalSessions.get(rawId);
    if (deadline === void 0 || Date.now() < deadline) {
      return false;
    }
    this._provisionalSessions.delete(rawId);
    return true;
  }
  _onHostListedSessions(rawIds) {
    if (this._provisionalSessions.size === 0) {
      return;
    }
    for (const [rawId, deadline] of [...this._provisionalSessions]) {
      if (rawIds.has(rawId)) {
        this._provisionalSessions.delete(rawId);
      } else if (deadline === void 0) {
        this._provisionalSessions.set(rawId, Date.now() + _CloudSandboxSessionsProvider.PROVISIONAL_GRACE_MS);
      }
    }
  }
};
export { CloudSandboxSessionsProvider };
