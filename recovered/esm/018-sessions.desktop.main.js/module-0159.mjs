// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/base/common/worker/webWorker.ts
import { isWeb } from "./module-0014.mjs";
import { Emitter } from "./module-0017.mjs";
import { onUnexpectedError, transformErrorForSerialization } from "./module-0004.mjs";
import { Disposable } from "./module-0012.mjs";
import { isUpperAsciiLetter } from "./module-0030.mjs";


// src/vs/base/common/worker/webWorker.ts
var DEFAULT_CHANNEL = "default";

var INITIALIZE = "$initialize";

var webWorkerWarningLogged = false;

function logOnceWebWorkerWarning(err) {
  if (!isWeb) {
    return;
  }
  if (!webWorkerWarningLogged) {
    webWorkerWarningLogged = true;
    console.warn("Could not create web worker(s). Falling back to loading web worker code in main thread, which might cause UI freezes. Please see https://github.com/microsoft/monaco-editor#faq");
  }
  console.warn(err.message);
}

var RequestMessage = class {
  constructor(vsWorker, req, channel, method, args2) {
    this.vsWorker = vsWorker;
    this.req = req;
    this.channel = channel;
    this.method = method;
    this.args = args2;
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
  async sendMessage(channel, method, args2) {
    const req = String(++this._lastSentReq);
    return new Promise((resolve3, reject) => {
      this._pendingReplies[req] = {
        resolve: resolve3,
        reject
      };
      this._send(new RequestMessage(this._workerId, req, channel, method, args2));
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
    result.then((r2) => {
      this._send(new ReplyMessage(this._workerId, req, r2, void 0));
    }, (e4) => {
      if (e4.detail instanceof Error) {
        e4.detail = transformErrorForSerialization(e4.detail);
      }
      this._send(new ReplyMessage(this._workerId, req, void 0, transformErrorForSerialization(e4)));
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
      for (let i2 = 0; i2 < msg.args.length; i2++) {
        const arg = msg.args[i2];
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

var WebWorkerClient = class extends Disposable {
  constructor(worker) {
    super();
    this._localChannels = /* @__PURE__ */ new Map();
    this._remoteChannels = /* @__PURE__ */ new Map();
    this._worker = this._register(worker);
    this._register(this._worker.onMessage((msg) => {
      this._protocol.handleMessage(msg);
    }));
    this._register(this._worker.onError((err) => {
      logOnceWebWorkerWarning(err);
      onUnexpectedError(err);
    }));
    this._protocol = new WebWorkerProtocol({
      sendMessage: (msg, transfer) => {
        this._worker.postMessage(msg, transfer);
      },
      handleMessage: (channel, method, args2) => {
        return this._handleMessage(channel, method, args2);
      },
      handleEvent: (channel, eventName, arg) => {
        return this._handleEvent(channel, eventName, arg);
      }
    });
    this._protocol.setWorkerId(this._worker.getId());
    this._onModuleLoaded = this._protocol.sendMessage(DEFAULT_CHANNEL, INITIALIZE, [
      this._worker.getId()
    ]).then(() => {
    });
    this.proxy = this._protocol.createProxyToRemoteChannel(DEFAULT_CHANNEL, async () => {
      await this._onModuleLoaded;
    });
    this._onModuleLoaded.catch((e4) => {
      this._onError("Worker failed to load ", e4);
    });
  }
  _handleMessage(channelName, method, args2) {
    const channel = this._localChannels.get(channelName);
    if (!channel) {
      return Promise.reject(new Error(`Missing channel ${channelName} on main thread`));
    }
    const fn = channel[method];
    if (typeof fn !== "function") {
      return Promise.reject(new Error(`Missing method ${method} on main thread channel ${channelName}`));
    }
    try {
      return Promise.resolve(fn.apply(channel, args2));
    } catch (e4) {
      return Promise.reject(e4);
    }
  }
  _handleEvent(channelName, eventName, arg) {
    const channel = this._localChannels.get(channelName);
    if (!channel) {
      throw new Error(`Missing channel ${channelName} on main thread`);
    }
    if (propertyIsDynamicEvent(eventName)) {
      const fn = channel[eventName];
      if (typeof fn !== "function") {
        throw new Error(`Missing dynamic event ${eventName} on main thread channel ${channelName}.`);
      }
      const event = fn.call(channel, arg);
      if (typeof event !== "function") {
        throw new Error(`Missing dynamic event ${eventName} on main thread channel ${channelName}.`);
      }
      return event;
    }
    if (propertyIsEvent(eventName)) {
      const event = channel[eventName];
      if (typeof event !== "function") {
        throw new Error(`Missing event ${eventName} on main thread channel ${channelName}.`);
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
      inst = this._protocol.createProxyToRemoteChannel(channel, async () => {
        await this._onModuleLoaded;
      });
      this._remoteChannels.set(channel, inst);
    }
    return inst;
  }
  _onError(message, error) {
    console.error(message);
    console.info(error);
  }
};

function propertyIsEvent(name) {
  return name[0] === "o" && name[1] === "n" && isUpperAsciiLetter(name.charCodeAt(2));
}

function propertyIsDynamicEvent(name) {
  return /^onDynamic/.test(name) && isUpperAsciiLetter(name.charCodeAt(9));
}
export { logOnceWebWorkerWarning, propertyIsEvent, propertyIsDynamicEvent, DEFAULT_CHANNEL, INITIALIZE, webWorkerWarningLogged, RequestMessage, ReplyMessage, SubscribeEventMessage, EventMessage, UnsubscribeEventMessage, WebWorkerProtocol, WebWorkerClient };
