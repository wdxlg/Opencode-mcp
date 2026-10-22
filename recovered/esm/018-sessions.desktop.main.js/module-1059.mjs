// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/debug/common/abstractDebugAdapter.ts
import { Emitter } from "./module-0017.mjs";
import { localize } from "./module-0001.mjs";
import { timeout } from "./module-0036.mjs";


// src/vs/workbench/contrib/debug/common/abstractDebugAdapter.ts
var AbstractDebugAdapter = class {
  constructor() {
    this.pendingRequests = /* @__PURE__ */ new Map();
    this.pendingRequestTimers = /* @__PURE__ */ new Map();
    this.queue = [];
    this._onError = new Emitter();
    this._onExit = new Emitter();
    this.sequence = 1;
  }
  get onError() {
    return this._onError.event;
  }
  get onExit() {
    return this._onExit.event;
  }
  onMessage(callback) {
    if (this.messageCallback) {
      this._onError.fire(new Error(`attempt to set more than one 'Message' callback`));
    }
    this.messageCallback = callback;
  }
  onEvent(callback) {
    if (this.eventCallback) {
      this._onError.fire(new Error(`attempt to set more than one 'Event' callback`));
    }
    this.eventCallback = callback;
  }
  onRequest(callback) {
    if (this.requestCallback) {
      this._onError.fire(new Error(`attempt to set more than one 'Request' callback`));
    }
    this.requestCallback = callback;
  }
  sendResponse(response) {
    if (response.seq > 0) {
      this._onError.fire(new Error(`attempt to send more than one response for command ${response.command}`));
    } else {
      this.internalSend("response", response);
    }
  }
  sendRequest(command4, args2, clb, timeout2) {
    const request2 = {
      command: command4
    };
    if (args2 && Object.keys(args2).length > 0) {
      request2.arguments = args2;
    }
    this.internalSend("request", request2);
    if (typeof timeout2 === "number") {
      const timer = setTimeout(() => {
        this.pendingRequestTimers.delete(request2.seq);
        const clb2 = this.pendingRequests.get(request2.seq);
        if (clb2) {
          this.pendingRequests.delete(request2.seq);
          const err = {
            type: "response",
            seq: 0,
            request_seq: request2.seq,
            success: false,
            command: command4,
            message: localize(14729, null, timeout2, command4)
          };
          clb2(err);
        }
      }, timeout2);
      this.pendingRequestTimers.set(request2.seq, timer);
    }
    if (clb) {
      this.pendingRequests.set(request2.seq, clb);
    }
    return request2.seq;
  }
  acceptMessage(message) {
    if (this.messageCallback) {
      this.messageCallback(message);
    } else {
      this.queue.push(message);
      if (this.queue.length === 1) {
        this.processQueue();
      }
    }
  }
  /**
   * Returns whether we should insert a timeout between processing messageA
   * and messageB. Artificially queueing protocol messages guarantees that any
   * microtasks for previous message finish before next message is processed.
   * This is essential ordering when using promises anywhere along the call path.
   *
   * For example, take the following, where `chooseAndSendGreeting` returns
   * a person name and then emits a greeting event:
   *
   * ```
   * let person: string;
   * adapter.onGreeting(() => console.log('hello', person));
   * person = await adapter.chooseAndSendGreeting();
   * ```
   *
   * Because the event is dispatched synchronously, it may fire before person
   * is assigned if they're processed in the same task. Inserting a task
   * boundary avoids this issue.
   */
  needsTaskBoundaryBetween(messageA, messageB) {
    return messageA.type !== "event" || messageB.type !== "event";
  }
  /**
   * Reads and dispatches items from the queue until it is empty.
   */
  async processQueue() {
    let message;
    while (this.queue.length) {
      if (!message || this.needsTaskBoundaryBetween(this.queue[0], message)) {
        await timeout(0);
      }
      message = this.queue.shift();
      if (!message) {
        return;
      }
      switch (message.type) {
        case "event":
          this.eventCallback?.(message);
          break;
        case "request":
          this.requestCallback?.(message);
          break;
        case "response": {
          const response = message;
          const clb = this.pendingRequests.get(response.request_seq);
          if (clb) {
            this.pendingRequests.delete(response.request_seq);
            this.clearPendingRequestTimer(response.request_seq);
            clb(response);
          }
          break;
        }
      }
    }
  }
  internalSend(typ, message) {
    message.type = typ;
    message.seq = this.sequence++;
    this.sendMessage(message);
  }
  async cancelPendingRequests() {
    if (this.pendingRequests.size === 0) {
      return Promise.resolve();
    }
    const pending = /* @__PURE__ */ new Map();
    this.pendingRequests.forEach((value2, key3) => pending.set(key3, value2));
    await timeout(500);
    pending.forEach((callback, request_seq) => {
      const err = {
        type: "response",
        seq: 0,
        request_seq,
        success: false,
        command: "canceled",
        message: "canceled"
      };
      callback(err);
      this.pendingRequests.delete(request_seq);
      this.clearPendingRequestTimer(request_seq);
    });
  }
  clearPendingRequestTimer(requestSeq) {
    clearTimeout(this.pendingRequestTimers.get(requestSeq));
    this.pendingRequestTimers.delete(requestSeq);
  }
  getPendingRequestIds() {
    return Array.from(this.pendingRequests.keys());
  }
  dispose() {
    for (const timer of this.pendingRequestTimers.values()) {
      clearTimeout(timer);
    }
    this.pendingRequestTimers.clear();
    this._onError.dispose();
    this._onExit.dispose();
    this.queue = [];
  }
};
export { AbstractDebugAdapter };
