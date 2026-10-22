// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/main.js
// Original module marker: src/vs/platform/agentHost/node/agentHostService.ts
import { __decorateClass, __decorateParam, __esm } from "./module-0000.mjs";
import { init_async, raceTimeout } from "./module-0034.mjs";
import { Disposable, MutableDisposable, init_lifecycle } from "./module-0018.mjs";
import { ILogService, ILoggerService, init_log } from "./module-0075.mjs";
import { RemoteLoggerChannelClient, init_logIpc2 } from "./module-0274.mjs";
import { ITelemetryService, init_telemetry } from "./module-0104.mjs";
import { AgentHostStartError, init_agent } from "./module-0316.mjs";
import { init_agentHostProcessTelemetry, reportAgentHostProcessError } from "./module-0336.mjs";
import { init_agentHostTelemetry } from "./module-0318.mjs";
import { init_agentService } from "./module-0320.mjs";


// src/vs/platform/agentHost/node/agentHostService.ts
function isExpectedWindowsShutdownExit(platform5, code2) {
  return platform5 === "win32" && WINDOWS_EXPECTED_SHUTDOWN_EXIT_CODES.has(code2 >>> 0);
}

var WINDOWS_EXPECTED_SHUTDOWN_EXIT_CODES, AgentHostProcessManager;

var init_agentHostService = __esm({
  "src/vs/platform/agentHost/node/agentHostService.ts"() {
    init_async();
    init_lifecycle();
    init_log();
    init_logIpc2();
    init_telemetry();
    init_agent();
    init_agentHostProcessTelemetry();
    init_agentHostTelemetry();
    init_agentService();
    WINDOWS_EXPECTED_SHUTDOWN_EXIT_CODES = /* @__PURE__ */ new Set([
      3221226091,
      // STATUS_DLL_INIT_FAILED_LOGOFF
      1073807364
      // DBG_TERMINATE_PROCESS
    ]);
    AgentHostProcessManager = class extends Disposable {
      constructor(_starter, _platform2 = process.platform, _logService, _loggerService, _telemetryService) {
        super();
        this._starter = _starter;
        this._platform = _platform2;
        this._logService = _logService;
        this._loggerService = _loggerService;
        this._telemetryService = _telemetryService;
        this._wasQuitRequested = false;
        this._restartCount = 0;
        this._restartLimitReached = false;
        this._connectionStore = this._register(new MutableDisposable());
        this._register(this._starter);
        if (this._starter.onRequestConnection) {
          this._register(this._starter.onRequestConnection((request) => request.waitUntil(this._ensureStarted())));
        }
        if (this._starter.onRequestRestart) {
          this._register(this._starter.onRequestRestart(() => {
            this.restart().catch((error) => this._logService.error("AgentHostProcessManager: failed to restart agent host", error));
          }));
        }
        if (this._starter.onWillShutdown) {
          this._register(this._starter.onWillShutdown((request) => {
            this._wasQuitRequested = true;
            request.join(this._shutdown().finally(() => this.dispose()));
          }));
        }
      }
      _ensureStarted() {
        if (this._wasQuitRequested || this._store.isDisposed) {
          return Promise.reject(new Error("Agent Host process manager is shutting down."));
        }
        if (this._restartLimitReached) {
          return Promise.reject(new AgentHostStartError(`Agent Host process stopped after ${5 /* MaxRestarts */} restarts.`, true));
        }
        if (this._connection) {
          return Promise.resolve();
        }
        if (!this._startPromise) {
          return this._setStartPromise(this._start());
        }
        return this._startPromise;
      }
      /**
       * Explicitly restarts the agent host process, discarding the current connection
       * and resetting crash recovery bookkeeping.
       */
      restart() {
        if (this._wasQuitRequested || this._store.isDisposed) {
          return Promise.reject(new Error("Agent Host process manager is shutting down."));
        }
        this._restartCount = 0;
        this._restartLimitReached = false;
        const pendingStart = this._startPromise;
        const restartPromise = (async () => {
          if (pendingStart) {
            try {
              await pendingStart;
            } catch {
            }
          }
          if (this._wasQuitRequested || this._store.isDisposed) {
            return;
          }
          this._logService.info("AgentHostProcessManager: explicitly restarting agent host");
          const connection = this._connection;
          if (connection) {
            this._connection = void 0;
            try {
              await raceTimeout(connection.shutdown(), 6e3 /* ShutdownTimeoutMs */, () => {
                this._logService.warn(`AgentHostProcessManager: agent host did not shut down before restart within ${6e3 /* ShutdownTimeoutMs */}ms; terminating it`);
              });
            } catch (error) {
              this._logService.error("AgentHostProcessManager: failed to shut down agent host gracefully before restart", error);
            } finally {
              this._clearConnection(connection);
            }
          }
          await this._start();
        })();
        this._setStartPromise(restartPromise);
        return restartPromise;
      }
      _setStartPromise(startPromise) {
        this._startPromise = startPromise;
        void startPromise.then(
          () => {
            if (this._startPromise === startPromise) {
              this._startPromise = void 0;
            }
          },
          () => {
            if (this._startPromise === startPromise) {
              this._startPromise = void 0;
            }
          }
        );
        return startPromise;
      }
      async _start() {
        let connection;
        try {
          const startedConnection = await this._starter.start();
          connection = startedConnection;
          if (this._store.isDisposed || this._wasQuitRequested) {
            startedConnection.store.dispose();
            throw new Error("Agent Host process manager disposed during startup.");
          }
          this._connection = startedConnection;
          this._connectionStore.value = startedConnection.store;
          this._logService.info("AgentHostProcessManager: agent host started");
          startedConnection.store.add(new RemoteLoggerChannelClient(this._loggerService, startedConnection.client.getChannel("agentHostLogger" /* Logger */)));
          startedConnection.store.add(startedConnection.onDidProcessExit((e) => this._handleProcessExit(startedConnection, e.code)));
        } catch (error) {
          this._clearConnection(connection);
          if (!this._store.isDisposed && !this._wasQuitRequested) {
            this._logService.error("AgentHostProcessManager: failed to start agent host", error);
            reportAgentHostProcessError(this._telemetryService, {
              hostLaunchKind: "vscode_main_process" /* VSCodeMainProcess */,
              kind: "startFailed",
              restartCount: this._restartCount,
              willRestart: false
            }, error);
          }
          throw error;
        }
      }
      /**
       * Drops the given connection, disposing it exactly once regardless of whether it is
       * still the connection tracked by {@link _connectionStore}.
       */
      _clearConnection(connection) {
        if (this._connection === connection) {
          this._connection = void 0;
        }
        if (!connection) {
          return;
        }
        if (this._connectionStore.value === connection.store) {
          this._connectionStore.clear();
        } else {
          connection.store.dispose();
        }
      }
      _handleProcessExit(connection, code2) {
        if (this._connection !== connection) {
          return;
        }
        this._clearConnection(connection);
        if (this._wasQuitRequested || this._store.isDisposed) {
          return;
        }
        if (isExpectedWindowsShutdownExit(this._platform, code2)) {
          this._logService.info(`AgentHostProcessManager: agent host terminated with expected Windows shutdown code ${code2}`);
          return;
        }
        const willRestart = this._restartCount < 5 /* MaxRestarts */;
        reportAgentHostProcessError(this._telemetryService, {
          hostLaunchKind: "vscode_main_process" /* VSCodeMainProcess */,
          kind: "unexpectedExit",
          code: code2,
          restartCount: this._restartCount,
          willRestart
        });
        if (willRestart) {
          this._logService.error(`AgentHostProcessManager: agent host terminated unexpectedly with code ${code2}`);
          this._restartCount++;
          const pendingLifecycle = this._startPromise;
          const restart = () => {
            if (!this._connection && !this._wasQuitRequested && !this._store.isDisposed) {
              void this._ensureStarted().catch((error) => this._logService.trace("AgentHostProcessManager: automatic restart failed", error));
            }
          };
          if (pendingLifecycle) {
            void pendingLifecycle.then(restart, restart);
          } else {
            restart();
          }
        } else {
          this._restartLimitReached = true;
          this._logService.error(`AgentHostProcessManager: agent host terminated with code ${code2}, giving up after ${5 /* MaxRestarts */} restarts`);
        }
      }
      async _shutdown() {
        try {
          await raceTimeout(this._shutdownGracefully(), 6e3 /* ShutdownTimeoutMs */, () => {
            this._logService.warn(`AgentHostProcessManager: agent host did not shut down within ${6e3 /* ShutdownTimeoutMs */}ms; terminating it`);
          });
        } catch (error) {
          this._logService.error("AgentHostProcessManager: failed to shut down agent host gracefully", error);
        } finally {
          this._clearConnection(this._connection);
        }
      }
      async _shutdownGracefully() {
        try {
          await this._startPromise;
        } catch (error) {
          this._logService.trace("AgentHostProcessManager: startup did not complete before shutdown", error);
          return;
        }
        await this._connection?.shutdown();
      }
    };
    AgentHostProcessManager = __decorateClass([
      __decorateParam(2, ILogService),
      __decorateParam(3, ILoggerService),
      __decorateParam(4, ITelemetryService)
    ], AgentHostProcessManager);
  }
});
export { isExpectedWindowsShutdownExit, WINDOWS_EXPECTED_SHUTDOWN_EXIT_CODES, AgentHostProcessManager, init_agentHostService };
