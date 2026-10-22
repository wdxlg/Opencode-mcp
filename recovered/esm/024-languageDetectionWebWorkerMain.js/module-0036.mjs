// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/services/languageDetection/browser/languageDetectionWebWorkerMain.js
// Original module marker: src/vs/base/common/worker/webWorker.ts
import { Emitter } from "./module-0014.mjs";
import { transformErrorForSerialization } from "./module-0001.mjs";
import { isUpperAsciiLetter } from "./module-0019.mjs";


// src/vs/base/common/worker/webWorker.ts
var DEFAULT_CHANNEL = "default";

var INITIALIZE = "$initialize";

var RequestMessage = class {
  constructor(vsWorker, req, channel, method, args) {
    this.vsWorker = vsWorker;
    this.req = req;
    this.channel = channel;
    this.method = method;
    this.args = args;
    this.type = 0 /* Request */;
  }
};

var ReplyMessage = class {
  constructor(vsWorker, seq, res, err) {
    this.vsWorker = vsWorker;
    this.seq = seq;
    this.res = res;
    this.err = err;
    this.type = 1 /* Reply */;
  }
};

var SubscribeEventMessage = class {
  constructor(vsWorker, req, channel, eventName, arg) {
    this.vsWorker = vsWorker;
    this.req = req;
    this.channel = channel;
    this.eventName = eventName;
    this.arg = arg;
    this.type = 2 /* SubscribeEvent */;
  }
};

var EventMessage = class {
  constructor(vsWorker, req, event) {
    this.vsWorker = vsWorker;
    this.req = req;
    this.event = event;
    this.type = 3 /* Event */;
  }
};

var UnsubscribeEventMessage = class {
  constructor(vsWorker, req) {
    this.vsWorker = vsWorker;
    this.req = req;
    this.type = 4 /* UnsubscribeEvent */;
  }
};

var WebWorkerProtocol = class {
  constructor(handler) {
    this._workerId = -1;
    this._handler = handler;
    this._lastSentReq = 0;
    this._pendingReplies = /* @__PURE__ */ Object.create(null);
    this._pendingEmitters = /* @__PURE__ */ new Map();
    this._pendingEvents = /* @__PURE__ */ new Map();
  }
  setWorkerId(workerId) {
    this._workerId = workerId;
  }
  async sendMessage(channel, method, args) {
    const req = String(++this._lastSentReq);
    return new Promise((resolve2, reject) => {
      this._pendingReplies[req] = {
        resolve: resolve2,
        reject
      };
      this._send(new RequestMessage(this._workerId, req, channel, method, args));
    });
  }
  listen(channel, eventName, arg) {
    let req = null;
    const emitter = new Emitter({
      onWillAddFirstListener: () => {
        req = String(++this._lastSentReq);
        this._pendingEmitters.set(req, emitter);
        this._send(new SubscribeEventMessage(this._workerId, req, channel, eventName, arg));
      },
      onDidRemoveLastListener: () => {
        this._pendingEmitters.delete(req);
        this._send(new UnsubscribeEventMessage(this._workerId, req));
        req = null;
      }
    });
    return emitter.event;
  }
  handleMessage(message) {
    if (!message || !message.vsWorker) {
      return;
    }
    if (this._workerId !== -1 && message.vsWorker !== this._workerId) {
      return;
    }
    this._handleMessage(message);
  }
  createProxyToRemoteChannel(channel, sendMessageBarrier) {
    const handler = {
      get: (target, name) => {
        if (typeof name === "string" && !target[name]) {
          if (propertyIsDynamicEvent(name)) {
            target[name] = (arg) => {
              return this.listen(channel, name, arg);
            };
          } else if (propertyIsEvent(name)) {
            target[name] = this.listen(channel, name, void 0);
          } else if (name.charCodeAt(0) === 36 /* DollarSign */) {
            target[name] = async (...myArgs) => {
              await sendMessageBarrier?.();
              return this.sendMessage(channel, name, myArgs);
            };
          }
        }
        return target[name];
      }
    };
    return new Proxy(/* @__PURE__ */ Object.create(null), handler);
  }
  _handleMessage(msg) {
    switch (msg.type) {
      case 1 /* Reply */:
        return this._handleReplyMessage(msg);
      case 0 /* Request */:
        return this._handleRequestMessage(msg);
      case 2 /* SubscribeEvent */:
        return this._handleSubscribeEventMessage(msg);
      case 3 /* Event */:
        return this._handleEventMessage(msg);
      case 4 /* UnsubscribeEvent */:
        return this._handleUnsubscribeEventMessage(msg);
    }
  }
  _handleReplyMessage(replyMessage) {
    if (!this._pendingReplies[replyMessage.seq]) {
      console.warn("Got reply to unknown seq");
      return;
    }
    const reply = this._pendingReplies[replyMessage.seq];
    delete this._pendingReplies[replyMessage.seq];
    if (replyMessage.err) {
      let err = replyMessage.err;
      if (replyMessage.err.$isError) {
        const newErr = new Error();
        newErr.name = replyMessage.err.name;
        newErr.message = replyMessage.err.message;
        newErr.stack = replyMessage.err.stack;
        err = newErr;
      }
      reply.reject(err);
      return;
    }
    reply.resolve(replyMessage.res);
  }
  _handleRequestMessage(requestMessage) {
    const req = requestMessage.req;
    const result = this._handler.handleMessage(requestMessage.channel, requestMessage.method, requestMessage.args);
    result.then((r) => {
      this._send(new ReplyMessage(this._workerId, req, r, void 0));
    }, (e) => {
      if (e.detail instanceof Error) {
        e.detail = transformErrorForSerialization(e.detail);
      }
      this._send(new ReplyMessage(this._workerId, req, void 0, transformErrorForSerialization(e)));
    });
  }
  _handleSubscribeEventMessage(msg) {
    const req = msg.req;
    const disposable = this._handler.handleEvent(msg.channel, msg.eventName, msg.arg)((event) => {
      this._send(new EventMessage(this._workerId, req, event));
    });
    this._pendingEvents.set(req, disposable);
  }
  _handleEventMessage(msg) {
    const emitter = this._pendingEmitters.get(msg.req);
    if (emitter === void 0) {
      console.warn("Got event for unknown req");
      return;
    }
    emitter.fire(msg.event);
  }
  _handleUnsubscribeEventMessage(msg) {
    const event = this._pendingEvents.get(msg.req);
    if (event === void 0) {
      console.warn("Got unsubscribe for unknown req");
      return;
    }
    event.dispose();
    this._pendingEvents.delete(msg.req);
  }
  _send(msg) {
    const transfer = [];
    if (msg.type === 0 /* Request */) {
      for (let i = 0; i < msg.args.length; i++) {
        const arg = msg.args[i];
        if (arg instanceof ArrayBuffer) {
          transfer.push(arg);
        }
      }
    } else if (msg.type === 1 /* Reply */) {
      if (msg.res instanceof ArrayBuffer) {
        transfer.push(msg.res);
      }
    }
    this._handler.sendMessage(msg, transfer);
  }
};

function propertyIsEvent(name) {
  return name[0] === "o" && name[1] === "n" && isUpperAsciiLetter(name.charCodeAt(2));
}

function propertyIsDynamicEvent(name) {
  return /^onDynamic/.test(name) && isUpperAsciiLetter(name.charCodeAt(9));
}

var WebWorkerServer = class {
  constructor(postMessage, requestHandlerFactory) {
    this._localChannels = /* @__PURE__ */ new Map();
    this._remoteChannels = /* @__PURE__ */ new Map();
    this._protocol = new WebWorkerProtocol({
      sendMessage: (msg, transfer) => {
        postMessage(msg, transfer);
      },
      handleMessage: (channel, method, args) => this._handleMessage(channel, method, args),
      handleEvent: (channel, eventName, arg) => this._handleEvent(channel, eventName, arg)
    });
    this.requestHandler = requestHandlerFactory(this);
  }
  onmessage(msg) {
    this._protocol.handleMessage(msg);
  }
  _handleMessage(channel, method, args) {
    if (channel === DEFAULT_CHANNEL && method === INITIALIZE) {
      return this.initialize(args[0]);
    }
    const requestHandler = channel === DEFAULT_CHANNEL ? this.requestHandler : this._localChannels.get(channel);
    if (!requestHandler) {
      return Promise.reject(new Error(`Missing channel ${channel} on worker thread`));
    }
    const fn = requestHandler[method];
    if (typeof fn !== "function") {
      return Promise.reject(new Error(`Missing method ${method} on worker thread channel ${channel}`));
    }
    try {
      return Promise.resolve(fn.apply(requestHandler, args));
    } catch (e) {
      return Promise.reject(e);
    }
  }
  _handleEvent(channel, eventName, arg) {
    const requestHandler = channel === DEFAULT_CHANNEL ? this.requestHandler : this._localChannels.get(channel);
    if (!requestHandler) {
      throw new Error(`Missing channel ${channel} on worker thread`);
    }
    if (propertyIsDynamicEvent(eventName)) {
      const fn = requestHandler[eventName];
      if (typeof fn !== "function") {
        throw new Error(`Missing dynamic event ${eventName} on request handler.`);
      }
      const event = fn.call(requestHandler, arg);
      if (typeof event !== "function") {
        throw new Error(`Missing dynamic event ${eventName} on request handler.`);
      }
      return event;
    }
    if (propertyIsEvent(eventName)) {
      const event = requestHandler[eventName];
      if (typeof event !== "function") {
        throw new Error(`Missing event ${eventName} on request handler.`);
      }
      return event;
    }
    throw new Error(`Malformed event name ${eventName}`);
  }
  setChannel(channel, handler) {
    this._localChannels.set(channel, handler);
  }
  getChannel(channel) {
    let inst = this._remoteChannels.get(channel);
    if (inst === void 0) {
      inst = this._protocol.createProxyToRemoteChannel(channel);
      this._remoteChannels.set(channel, inst);
    }
    return inst;
  }
  async initialize(workerId) {
    this._protocol.setWorkerId(workerId);
  }
};
export { propertyIsEvent, propertyIsDynamicEvent, DEFAULT_CHANNEL, INITIALIZE, RequestMessage, ReplyMessage, SubscribeEventMessage, EventMessage, UnsubscribeEventMessage, WebWorkerProtocol, WebWorkerServer };
