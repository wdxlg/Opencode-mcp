// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/code/electron-utility/sharedProcess/sharedProcessMain.js
// Original module marker: src/vs/base/parts/ipc/node/ipc.net.ts
import { onUnexpectedError } from "./module-0003.mjs";
import { SocketDiagnostics } from "./module-0198.mjs";
import { VSBuffer } from "./module-0031.mjs";


// src/vs/base/parts/ipc/node/ipc.net.ts
import { createHash as createHash4 } from "crypto";

import { createConnection, createServer as createServer2 } from "net";

import { tmpdir as tmpdir2 } from "os";

import { createDeflateRaw, createInflateRaw } from "zlib";


// src/vs/base/parts/ipc/node/ipc.net.ts
var socketEndTimeoutMs = 3e4;

var NodeSocket = class {
  constructor(socket, debugLabel = "") {
    this._canWrite = true;
    this.debugLabel = debugLabel;
    this.socket = socket;
    this.traceSocketEvent("created" /* Created */, { type: "NodeSocket" });
    this._errorListener = (err) => {
      this.traceSocketEvent("error" /* Error */, { code: err?.code, message: err?.message });
      if (err) {
        if (err.code === "EPIPE") {
          return;
        }
        onUnexpectedError(err);
      }
    };
    this.socket.on("error", this._errorListener);
    this._closeListener = (hadError) => {
      this.traceSocketEvent("close" /* Close */, { hadError });
      this._canWrite = false;
      if (this._endTimeoutHandle) {
        clearTimeout(this._endTimeoutHandle);
      }
    };
    this.socket.on("close", this._closeListener);
    this._endListener = () => {
      this.traceSocketEvent("nodeEndReceived" /* NodeEndReceived */);
      this._canWrite = false;
      this._endTimeoutHandle = setTimeout(() => socket.destroy(), socketEndTimeoutMs);
    };
    this.socket.on("end", this._endListener);
  }
  traceSocketEvent(type2, data) {
    SocketDiagnostics.traceSocketEvent(this.socket, this.debugLabel, type2, data);
  }
  dispose(destroySocket = true) {
    if (this._endTimeoutHandle) {
      clearTimeout(this._endTimeoutHandle);
      this._endTimeoutHandle = void 0;
    }
    this.socket.off("error", this._errorListener);
    this.socket.off("close", this._closeListener);
    this.socket.off("end", this._endListener);
    if (destroySocket) {
      this.socket.destroy();
    }
  }
  onData(_listener) {
    const listener = (buff) => {
      this.traceSocketEvent("read" /* Read */, buff);
      _listener(VSBuffer.wrap(buff));
    };
    this.socket.on("data", listener);
    return {
      dispose: () => this.socket.off("data", listener)
    };
  }
  onClose(listener) {
    const adapter = (hadError) => {
      listener({
        type: 0 /* NodeSocketCloseEvent */,
        hadError,
        error: void 0
      });
    };
    this.socket.on("close", adapter);
    return {
      dispose: () => this.socket.off("close", adapter)
    };
  }
  onEnd(listener) {
    const adapter = () => {
      listener();
    };
    this.socket.on("end", adapter);
    return {
      dispose: () => this.socket.off("end", adapter)
    };
  }
  write(buffer2) {
    if (this.socket.destroyed || !this._canWrite) {
      return;
    }
    try {
      this.traceSocketEvent("write" /* Write */, buffer2);
      this.socket.write(buffer2.buffer, (err) => {
        if (err) {
          if (err.code === "EPIPE") {
            return;
          }
          onUnexpectedError(err);
        }
      });
    } catch (err) {
      if (err.code === "EPIPE") {
        return;
      }
      onUnexpectedError(err);
    }
  }
  end() {
    this.traceSocketEvent("nodeEndSent" /* NodeEndSent */);
    this.socket.end();
  }
  drain() {
    this.traceSocketEvent("nodeDrainBegin" /* NodeDrainBegin */);
    return new Promise((resolve3, reject) => {
      if (this.socket.bufferSize === 0) {
        this.traceSocketEvent("nodeDrainEnd" /* NodeDrainEnd */);
        resolve3();
        return;
      }
      const finished = () => {
        this.socket.off("close", finished);
        this.socket.off("end", finished);
        this.socket.off("error", finished);
        this.socket.off("timeout", finished);
        this.socket.off("drain", finished);
        this.traceSocketEvent("nodeDrainEnd" /* NodeDrainEnd */);
        resolve3();
      };
      this.socket.on("close", finished);
      this.socket.on("end", finished);
      this.socket.on("error", finished);
      this.socket.on("timeout", finished);
      this.socket.on("drain", finished);
    });
  }
};

var XDG_RUNTIME_DIR = process.env["XDG_RUNTIME_DIR"];

var safeIpcPathLengths = {
  [2 /* Linux */]: 107,
  [1 /* Mac */]: 103
};
export { createHash4, createConnection, createServer2, tmpdir2, createDeflateRaw, createInflateRaw, socketEndTimeoutMs, NodeSocket, XDG_RUNTIME_DIR, safeIpcPathLengths };
