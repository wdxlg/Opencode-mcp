// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/main.js
// Original module marker: src/vs/platform/terminal/common/requestStore.ts
import { __decorateClass, __decorateParam, __esm } from "./module-0000.mjs";
import { init_async, timeout } from "./module-0034.mjs";
import { CancellationTokenSource, init_cancellation } from "./module-0022.mjs";
import { Emitter, init_event } from "./module-0021.mjs";
import { Disposable, dispose, init_lifecycle, toDisposable } from "./module-0018.mjs";
import { ILogService, init_log } from "./module-0075.mjs";


// src/vs/platform/terminal/common/requestStore.ts
var RequestStore;

var init_requestStore = __esm({
  "src/vs/platform/terminal/common/requestStore.ts"() {
    init_async();
    init_cancellation();
    init_event();
    init_lifecycle();
    init_log();
    RequestStore = class extends Disposable {
      /**
       * @param timeout How long in ms to allow requests to go unanswered for, undefined will use the
       * default (15 seconds).
       */
      constructor(timeout2, _logService) {
        super();
        this._logService = _logService;
        this._lastRequestId = 0;
        this._pendingRequests = /* @__PURE__ */ new Map();
        this._pendingRequestDisposables = /* @__PURE__ */ new Map();
        this._onCreateRequest = this._register(new Emitter());
        this.onCreateRequest = this._onCreateRequest.event;
        this._timeout = timeout2 === void 0 ? 15e3 : timeout2;
        this._register(toDisposable(() => {
          for (const d of this._pendingRequestDisposables.values()) {
            dispose(d);
          }
        }));
      }
      /**
       * Creates a request.
       * @param args The arguments to pass to the onCreateRequest event.
       */
      createRequest(args2) {
        return new Promise((resolve3, reject) => {
          const requestId = ++this._lastRequestId;
          this._pendingRequests.set(requestId, resolve3);
          this._onCreateRequest.fire({ requestId, ...args2 });
          const tokenSource = new CancellationTokenSource();
          timeout(this._timeout, tokenSource.token).then(() => reject(`Request ${requestId} timed out (${this._timeout}ms)`));
          this._pendingRequestDisposables.set(requestId, [toDisposable(() => tokenSource.cancel())]);
        });
      }
      /**
       * Accept a reply to a request.
       * @param requestId The request ID originating from the onCreateRequest event.
       * @param data The reply data.
       */
      acceptReply(requestId, data) {
        const resolveRequest = this._pendingRequests.get(requestId);
        if (resolveRequest) {
          this._pendingRequests.delete(requestId);
          dispose(this._pendingRequestDisposables.get(requestId) || []);
          this._pendingRequestDisposables.delete(requestId);
          resolveRequest(data);
        } else {
          this._logService.warn(`RequestStore#acceptReply was called without receiving a matching request ${requestId}`);
        }
      }
    };
    RequestStore = __decorateClass([
      __decorateParam(1, ILogService)
    ], RequestStore);
  }
});
export { RequestStore, init_requestStore };
