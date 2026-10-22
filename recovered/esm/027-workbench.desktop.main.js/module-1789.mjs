// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/platform/github/common/githubRequestQueue.ts
import { Disposable } from "./module-0012.mjs";


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
      const request2 = {
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
      this._pending.push(request2);
      signal.addEventListener("abort", () => {
        const index2 = this._pending.indexOf(request2);
        if (index2 >= 0) {
          this._pending.splice(index2, 1);
          reject(signal.reason);
        }
      }, { once: true });
      this._drain();
    });
  }
  cancelAccount(account, reason) {
    const accountKey = _GitHubRequestQueue.accountKey(account);
    for (let index2 = this._pending.length - 1; index2 >= 0; index2--) {
      const request2 = this._pending[index2];
      if (request2.accountKey === accountKey) {
        this._pending.splice(index2, 1);
        request2.reject(reason ?? new Error("GitHub credential was invalidated"));
      }
    }
  }
  dispose() {
    for (const request2 of this._pending.splice(0)) {
      request2.reject(new Error("GitHub request queue was disposed"));
    }
    super.dispose();
  }
  _drain() {
    while (this._active < this._maximumConcurrency) {
      const index2 = this._nextIndex();
      if (index2 < 0) {
        return;
      }
      const request2 = this._pending.splice(index2, 1)[0];
      if (request2.signal.aborted) {
        request2.reject(request2.signal.reason);
        continue;
      }
      this._active++;
      this._activeAccounts.add(request2.accountKey);
      this._activeHosts.set(request2.host, (this._activeHosts.get(request2.host) ?? 0) + 1);
      void request2.run().finally(() => {
        this._active--;
        this._activeAccounts.delete(request2.accountKey);
        const hostActive = (this._activeHosts.get(request2.host) ?? 1) - 1;
        if (hostActive === 0) {
          this._activeHosts.delete(request2.host);
        } else {
          this._activeHosts.set(request2.host, hostActive);
        }
        this._drain();
      });
    }
  }
  _nextIndex() {
    let selected = -1;
    for (let index2 = 0; index2 < this._pending.length; index2++) {
      const candidate = this._pending[index2];
      if (this._activeAccounts.has(candidate.accountKey) || (this._activeHosts.get(candidate.host) ?? 0) >= this._maximumHostConcurrency) {
        continue;
      }
      if (selected < 0 || this._compare(candidate, this._pending[selected]) < 0) {
        selected = index2;
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
