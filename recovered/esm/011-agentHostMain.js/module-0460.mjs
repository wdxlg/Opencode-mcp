// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/github/common/githubRequestQueue.ts
import { Disposable } from "./module-0010.mjs";


// src/vs/platform/github/common/githubRequestQueue.ts
var priorityOrder = {
  mutationReconciliation: 0,
  mutation: 1,
  interactive: 2,
  mergeGate: 3,
  visible: 4,
  background: 5,
  enrichment: 6
};

var GitHubRequestQueue = class _GitHubRequestQueue extends Disposable {
  constructor(_maximumConcurrency = 4, _maximumHostConcurrency = 2) {
    super();
    this._maximumConcurrency = _maximumConcurrency;
    this._maximumHostConcurrency = _maximumHostConcurrency;
    this._pending = [];
    this._activeAccounts = /* @__PURE__ */ new Set();
    this._activeHosts = /* @__PURE__ */ new Map();
    this._active = 0;
    this._sequence = 0;
  }
  enqueue(account, priority, signal, task) {
    if (signal.aborted) {
      return Promise.reject(signal.reason);
    }
    const accountKey = _GitHubRequestQueue.accountKey(account);
    return new Promise((resolve3, reject) => {
      const request = {
        accountKey,
        host: account.host,
        priority,
        sequence: this._sequence++,
        signal,
        run: async () => {
          try {
            resolve3(await task());
          } catch (error) {
            reject(error);
          }
        },
        reject
      };
      this._pending.push(request);
      signal.addEventListener("abort", () => {
        const index = this._pending.indexOf(request);
        if (index >= 0) {
          this._pending.splice(index, 1);
          reject(signal.reason);
        }
      }, { once: true });
      this._drain();
    });
  }
  cancelAccount(account, reason) {
    const accountKey = _GitHubRequestQueue.accountKey(account);
    for (let index = this._pending.length - 1; index >= 0; index--) {
      const request = this._pending[index];
      if (request.accountKey === accountKey) {
        this._pending.splice(index, 1);
        request.reject(reason ?? new Error("GitHub credential was invalidated"));
      }
    }
  }
  dispose() {
    for (const request of this._pending.splice(0)) {
      request.reject(new Error("GitHub request queue was disposed"));
    }
    super.dispose();
  }
  _drain() {
    while (this._active < this._maximumConcurrency) {
      const index = this._nextIndex();
      if (index < 0) {
        return;
      }
      const request = this._pending.splice(index, 1)[0];
      if (request.signal.aborted) {
        request.reject(request.signal.reason);
        continue;
      }
      this._active++;
      this._activeAccounts.add(request.accountKey);
      this._activeHosts.set(request.host, (this._activeHosts.get(request.host) ?? 0) + 1);
      void request.run().finally(() => {
        this._active--;
        this._activeAccounts.delete(request.accountKey);
        const hostActive = (this._activeHosts.get(request.host) ?? 1) - 1;
        if (hostActive === 0) {
          this._activeHosts.delete(request.host);
        } else {
          this._activeHosts.set(request.host, hostActive);
        }
        this._drain();
      });
    }
  }
  _nextIndex() {
    let selected = -1;
    for (let index = 0; index < this._pending.length; index++) {
      const candidate = this._pending[index];
      if (this._activeAccounts.has(candidate.accountKey) || (this._activeHosts.get(candidate.host) ?? 0) >= this._maximumHostConcurrency) {
        continue;
      }
      if (selected < 0 || this._compare(candidate, this._pending[selected]) < 0) {
        selected = index;
      }
    }
    return selected;
  }
  _compare(left, right) {
    return priorityOrder[left.priority] - priorityOrder[right.priority] || left.sequence - right.sequence;
  }
  static accountKey(account) {
    return `${account.host.toLowerCase()}\0${account.accountId}`;
  }
};
export { priorityOrder, GitHubRequestQueue };
