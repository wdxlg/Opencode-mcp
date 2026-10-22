// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/code/electron-utility/sharedProcess/sharedProcessMain.js
// Original module marker: src/vs/platform/profiling/node/profilingService.ts
import { startProfiling } from "./module-0208.mjs";
import { generateUuid } from "./module-0082.mjs";


// src/vs/platform/profiling/node/profilingService.ts
var InspectProfilingService = class {
  constructor() {
    this._sessions = /* @__PURE__ */ new Map();
  }
  async startProfiling(options) {
    const session = await startProfiling({ host: options.host, port: options.port, checkForPaused: true });
    const id2 = generateUuid();
    this._sessions.set(id2, session);
    return id2;
  }
  async stopProfiling(sessionId) {
    const session = this._sessions.get(sessionId);
    if (!session) {
      throw new Error(`UNKNOWN session '${sessionId}'`);
    }
    const result = await session.stop();
    this._sessions.delete(sessionId);
    return result.profile;
  }
};
export { InspectProfilingService };
