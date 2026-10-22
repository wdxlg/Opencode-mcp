// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/github/common/githubScheduler.ts
import { toDisposable } from "./module-0010.mjs";


// src/vs/platform/github/common/githubScheduler.ts
var systemGitHubScheduler = {
  now: () => Date.now(),
  schedule: (callback, delay) => {
    const handle = setTimeout(callback, delay);
    return toDisposable(() => clearTimeout(handle));
  },
  jitter: (maximum) => Math.floor(Math.random() * (Math.max(0, maximum) + 1))
};

function schedulerDelay(scheduler, delay, signal) {
  if (signal.aborted) {
    return Promise.reject(signal.reason);
  }
  return new Promise((resolve3, reject) => {
    const scheduled = {};
    let completedSynchronously = false;
    const onAbort = () => {
      scheduled.value?.dispose();
      abortListener.dispose();
      reject(signal.reason);
    };
    const abortListener = toDisposable(() => signal.removeEventListener("abort", onAbort));
    signal.addEventListener("abort", onAbort, { once: true });
    scheduled.value = scheduler.schedule(() => {
      completedSynchronously = true;
      scheduled.value?.dispose();
      abortListener.dispose();
      resolve3();
    }, Math.max(0, delay));
    if (completedSynchronously) {
      scheduled.value.dispose();
    }
  });
}
export { schedulerDelay, systemGitHubScheduler };
