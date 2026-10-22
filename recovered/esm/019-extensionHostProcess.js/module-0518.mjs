// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/node/extensionHostProcess.js
// Original module marker: src/vs/workbench/contrib/mcp/node/mcpStdioStateHandler.ts
import { TimeoutTimer } from "./module-0029.mjs";
import { isWindows } from "./module-0014.mjs";
import { killTree } from "./module-0334.mjs";


// src/vs/workbench/contrib/mcp/node/mcpStdioStateHandler.ts
var McpStdioStateHandler = class _McpStdioStateHandler {
  constructor(_child, _graceTimeMs = _McpStdioStateHandler.GRACE_TIME_MS) {
    this._child = _child;
    this._graceTimeMs = _graceTimeMs;
    this._procState = 0 /* Running */;
  }
  static {
    this.GRACE_TIME_MS = 1e4;
  }
  get stopped() {
    return this._procState !== 0 /* Running */;
  }
  /**
   * Initiates graceful shutdown. If called while shutdown is already in progress,
   * forces immediate termination.
   */
  stop() {
    if (this._procState === 0 /* Running */) {
      let graceTime = this._graceTimeMs;
      try {
        this._child.stdin.end();
      } catch (error) {
        graceTime = 1;
      }
      this._procState = 1 /* StdinEnded */;
      this._nextTimeout = new TimeoutTimer(() => this.killPolite(), graceTime);
    } else {
      this._nextTimeout?.dispose();
      this.killForceful();
    }
  }
  async killPolite() {
    this._procState = 2 /* KilledPolite */;
    this._nextTimeout = new TimeoutTimer(() => this.killForceful(), this._graceTimeMs);
    if (this._child.pid) {
      if (!isWindows) {
        await killTree(this._child.pid, false).catch(() => {
          this._child.kill("SIGTERM");
        });
      }
    } else {
      this._child.kill("SIGTERM");
    }
  }
  async killForceful() {
    this._procState = 3 /* KilledForceful */;
    if (this._child.pid) {
      await killTree(this._child.pid, true).catch(() => {
        this._child.kill("SIGKILL");
      });
    } else {
      this._child.kill();
    }
  }
  write(message) {
    if (!this.stopped) {
      this._child.stdin.write(message + "\n");
    }
  }
  dispose() {
    this._nextTimeout?.dispose();
  }
};
export { McpStdioStateHandler };
