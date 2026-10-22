// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/services/host/browser/toasts.ts
import { DisposableStore, toDisposable } from "./module-0012.mjs";
import { CancellationTokenSource } from "./module-0025.mjs";
import { Emitter, Event2 } from "./module-0017.mjs";
import { addDisposableListener } from "./module-0075.mjs";


// src/vs/workbench/services/host/browser/toasts.ts
async function showBrowserToast(controller, options3, token) {
  const toast = await triggerBrowserToast(options3.title, {
    detail: options3.body,
    sticky: !options3.silent
  });
  if (!toast) {
    return { supported: false, clicked: false };
  }
  const disposables = new DisposableStore();
  controller.onDidCreateToast(toast);
  const cts = new CancellationTokenSource(token);
  disposables.add(toDisposable(() => {
    controller.onDidDisposeToast(toast);
    toast.dispose();
    cts.dispose(true);
  }));
  return new Promise((r2) => {
    const resolve3 = (result) => {
      r2(result);
      disposables.dispose();
    };
    disposables.add(cts.token.onCancellationRequested(() => resolve3({ supported: true, clicked: false })));
    disposables.add(Event2.once(toast.onClick)(() => resolve3({ supported: true, clicked: true })));
    disposables.add(Event2.once(toast.onClose)(() => resolve3({ supported: true, clicked: false })));
    disposables.add(Event2.once(toast.onError)(() => resolve3({ supported: false, clicked: false })));
  });
}

async function triggerBrowserToast(message, options3) {
  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    return;
  }
  const disposables = new DisposableStore();
  const notification = new Notification(message, {
    body: options3?.detail,
    requireInteraction: options3?.sticky
  });
  const onClick4 = disposables.add(new Emitter());
  const onClose = disposables.add(new Emitter());
  const onError = disposables.add(new Emitter());
  disposables.add(addDisposableListener(notification, "click", () => onClick4.fire()));
  disposables.add(addDisposableListener(notification, "close", () => onClose.fire()));
  disposables.add(addDisposableListener(notification, "error", () => onError.fire()));
  disposables.add(toDisposable(() => notification.close()));
  return {
    onClick: onClick4.event,
    onClose: onClose.event,
    onError: onError.event,
    dispose: () => disposables.dispose()
  };
}
export { showBrowserToast, triggerBrowserToast };
