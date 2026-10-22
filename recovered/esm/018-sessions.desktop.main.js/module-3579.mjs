// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/chat/browser/promptTypingAnimation.ts
import { DisposableStore, MutableDisposable } from "./module-0012.mjs";
import { DeferredPromise } from "./module-0036.mjs";


// src/vs/sessions/contrib/chat/browser/promptTypingAnimation.ts
function animatePromptTyping(target, text2, durationMs, scheduler) {
  if (!text2 || target.getValue()) {
    return {
      result: Promise.resolve({ outcome: "skipped", didWrite: false }),
      complete: () => void 0,
      dispose: () => void 0
    };
  }
  const store = new DisposableStore();
  const pendingFrame = store.add(new MutableDisposable());
  const result = new DeferredPromise();
  let expectedValue = "";
  let stopped = false;
  let didWrite = false;
  const write = (value2) => {
    expectedValue = value2;
    didWrite = true;
    target.setValue(value2);
  };
  const stop = (outcome, completeText) => {
    if (stopped) {
      return;
    }
    if (completeText && target.getValue() === expectedValue && expectedValue !== text2) {
      write(text2);
    }
    stopped = true;
    store.dispose();
    result.complete({ outcome, didWrite });
  };
  store.add(target.onDidChange(() => {
    if (target.getValue() !== expectedValue) {
      stop("interrupted", false);
    }
  }));
  const animation = {
    result: result.p,
    complete: () => stop("completed", true),
    dispose: () => stop("cancelled", false)
  };
  if (durationMs <= 0) {
    write(text2);
    stop("completed", false);
    return animation;
  }
  const startTime = scheduler.now();
  const step = () => {
    if (stopped) {
      return;
    }
    const progress = Math.min(1, Math.max(0, (scheduler.now() - startTime) / durationMs));
    const characterCount = Math.min(text2.length, Math.max(1, Math.ceil(text2.length * progress)));
    if (characterCount > expectedValue.length) {
      write(text2.slice(0, characterCount));
    }
    if (characterCount < text2.length) {
      pendingFrame.value = scheduler.schedule(step);
    } else {
      stop("completed", false);
    }
  };
  pendingFrame.value = scheduler.schedule(step);
  return animation;
}
export { animatePromptTyping };
