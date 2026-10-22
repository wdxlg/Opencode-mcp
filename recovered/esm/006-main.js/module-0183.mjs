// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/main.js
// Original module marker: src/vs/base/parts/ipc/node/ipc.cp.ts
import { __esm } from "./module-0000.mjs";
import { Delayer, createCancelablePromise, init_async } from "./module-0034.mjs";
import { VSBuffer, init_buffer } from "./module-0050.mjs";
import { CancellationToken, init_cancellation } from "./module-0022.mjs";
import { init_console, isRemoteConsoleLog, log2 } from "./module-0182.mjs";
import { canceled, init_errors } from "./module-0010.mjs";
import { Emitter, Event, init_event } from "./module-0021.mjs";
import { dispose, init_lifecycle, toDisposable } from "./module-0018.mjs";
import { deepClone, init_objects } from "./module-0121.mjs";
import { createQueuedSender, init_processes2 } from "./module-0165.mjs";
import { init_processes, removeDangerousEnvVariables } from "./module-0131.mjs";
import { ChannelClient, init_ipc } from "./module-0054.mjs";


// src/vs/base/parts/ipc/node/ipc.cp.ts
import { fork } from "child_process";

var Client4;

var init_ipc_cp = __esm({
  "src/vs/base/parts/ipc/node/ipc.cp.ts"() {
    init_async();
    init_buffer();
    init_cancellation();
    init_console();
    init_errors();
    init_event();
    init_lifecycle();
    init_objects();
    init_processes2();
    init_processes();
    init_ipc();
    Client4 = class {
      constructor(modulePath, options) {
        this.modulePath = modulePath;
        this.options = options;
        this.activeRequests = /* @__PURE__ */ new Set();
        this.channels = /* @__PURE__ */ new Map();
        this._onDidProcessExit = new Emitter();
        this.onDidProcessExit = this._onDidProcessExit.event;
        const timeout2 = options.timeout || 6e4;
        this.disposeDelayer = new Delayer(timeout2);
        this.child = null;
        this._client = null;
      }
      getChannel(channelName) {
        const that = this;
        return {
          call(command, arg, cancellationToken) {
            return that.requestPromise(channelName, command, arg, cancellationToken);
          },
          listen(event, arg) {
            return that.requestEvent(channelName, event, arg);
          }
        };
      }
      requestPromise(channelName, name, arg, cancellationToken = CancellationToken.None) {
        if (!this.disposeDelayer) {
          return Promise.reject(new Error("disposed"));
        }
        if (cancellationToken.isCancellationRequested) {
          return Promise.reject(canceled());
        }
        this.disposeDelayer.cancel();
        const channel = this.getCachedChannel(channelName);
        const result = createCancelablePromise((token) => channel.call(name, arg, token));
        const cancellationTokenListener = cancellationToken.onCancellationRequested(() => result.cancel());
        const disposable = toDisposable(() => result.cancel());
        this.activeRequests.add(disposable);
        const cleanup = () => {
          cancellationTokenListener.dispose();
          this.activeRequests.delete(disposable);
          if (this.activeRequests.size === 0 && this.disposeDelayer) {
            this.disposeDelayer.trigger(() => this.disposeClient());
          }
        };
        result.then(cleanup, cleanup);
        return result;
      }
      requestEvent(channelName, name, arg) {
        if (!this.disposeDelayer) {
          return Event.None;
        }
        this.disposeDelayer.cancel();
        let listener;
        const emitter = new Emitter({
          onWillAddFirstListener: () => {
            const channel = this.getCachedChannel(channelName);
            const event = channel.listen(name, arg);
            listener = event(emitter.fire, emitter);
            this.activeRequests.add(listener);
          },
          onDidRemoveLastListener: () => {
            this.activeRequests.delete(listener);
            listener.dispose();
            if (this.activeRequests.size === 0 && this.disposeDelayer) {
              this.disposeDelayer.trigger(() => this.disposeClient());
            }
          }
        });
        return emitter.event;
      }
      get client() {
        if (!this._client) {
          const args2 = this.options.args || [];
          const forkOpts = /* @__PURE__ */ Object.create(null);
          forkOpts.env = { ...deepClone(process.env), "VSCODE_PARENT_PID": String(process.pid) };
          if (this.options.env) {
            forkOpts.env = { ...forkOpts.env, ...this.options.env };
          }
          if (this.options.freshExecArgv) {
            forkOpts.execArgv = [];
          }
          if (typeof this.options.debug === "number") {
            forkOpts.execArgv = ["--nolazy", "--inspect=" + this.options.debug];
          }
          if (typeof this.options.debugBrk === "number") {
            forkOpts.execArgv = ["--nolazy", "--inspect-brk=" + this.options.debugBrk];
          }
          if (forkOpts.execArgv === void 0) {
            forkOpts.execArgv = process.execArgv.filter((a) => !/^--inspect(-brk)?=/.test(a)).filter((a) => !a.startsWith("--vscode-"));
          }
          removeDangerousEnvVariables(forkOpts.env);
          this.child = fork(this.modulePath, args2, forkOpts);
          const onMessageEmitter = new Emitter();
          const onRawMessage = Event.fromNodeEventEmitter(this.child, "message", (msg) => msg);
          const rawMessageDisposable = onRawMessage((msg) => {
            if (isRemoteConsoleLog(msg)) {
              log2(msg, `IPC Library: ${this.options.serverName}`);
              return;
            }
            onMessageEmitter.fire(VSBuffer.wrap(Buffer.from(msg, "base64")));
          });
          const sender = this.options.useQueue ? createQueuedSender(this.child) : this.child;
          const send = (r) => this.child?.connected && sender.send(r.buffer.toString("base64"));
          const onMessage = onMessageEmitter.event;
          const protocol4 = { send, onMessage };
          this._client = new ChannelClient(protocol4);
          const onExit = () => this.disposeClient();
          process.once("exit", onExit);
          this.child.on("error", (err) => console.warn('IPC "' + this.options.serverName + '" errored with ' + err));
          this.child.on("exit", (code2, signal) => {
            process.removeListener("exit", onExit);
            rawMessageDisposable.dispose();
            this.activeRequests.forEach((r) => dispose(r));
            this.activeRequests.clear();
            if (code2 !== 0 && signal !== "SIGTERM") {
              console.warn('IPC "' + this.options.serverName + '" crashed with exit code ' + code2 + " and signal " + signal);
            }
            this.disposeDelayer?.cancel();
            this.disposeClient();
            this._onDidProcessExit.fire({ code: code2, signal });
          });
        }
        return this._client;
      }
      getCachedChannel(name) {
        let channel = this.channels.get(name);
        if (!channel) {
          channel = this.client.getChannel(name);
          this.channels.set(name, channel);
        }
        return channel;
      }
      disposeClient() {
        if (this._client) {
          if (this.child) {
            this.child.kill();
            this.child = null;
          }
          this._client = null;
          this.channels.clear();
        }
      }
      dispose() {
        this._onDidProcessExit.dispose();
        this.disposeDelayer?.cancel();
        this.disposeDelayer = void 0;
        this.disposeClient();
        this.activeRequests.clear();
      }
    };
  }
});
export { fork, Client4, init_ipc_cp };
