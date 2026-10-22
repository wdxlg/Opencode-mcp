// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/browser/parts/mobile/mobileChipLaneScroll.ts
import { DisposableStore } from "./module-0012.mjs";
import { EventType, addDisposableListener, getWindow } from "./module-0075.mjs";
import { isPhoneLayout } from "./module-3445.mjs";


// src/vs/sessions/browser/parts/mobile/mobileChipLaneScroll.ts
var TAP_THRESHOLD_PX = 6;

function installMobileChipLaneScroll(lane, layoutService) {
  const store = new DisposableStore();
  let pointerId;
  let startX = 0;
  let startScrollLeft = 0;
  let didDrag = false;
  store.add(addDisposableListener(lane, EventType.POINTER_DOWN, (e4) => {
    if (!isPhoneLayout(layoutService)) {
      return;
    }
    if (!e4.isPrimary || e4.pointerType !== "touch" && e4.pointerType !== "mouse") {
      return;
    }
    pointerId = e4.pointerId;
    startX = e4.clientX;
    startScrollLeft = lane.scrollLeft;
    didDrag = false;
  }));
  store.add(addDisposableListener(lane, EventType.POINTER_MOVE, (e4) => {
    if (pointerId !== e4.pointerId) {
      return;
    }
    const deltaX = e4.clientX - startX;
    if (!didDrag && Math.abs(deltaX) < TAP_THRESHOLD_PX) {
      return;
    }
    if (!didDrag) {
      didDrag = true;
      try {
        lane.setPointerCapture(e4.pointerId);
      } catch {
      }
    }
    lane.scrollLeft = startScrollLeft - deltaX;
    e4.preventDefault();
  }));
  const endDrag = (e4) => {
    if (pointerId !== e4.pointerId) {
      return;
    }
    pointerId = void 0;
    if (!didDrag) {
      return;
    }
    try {
      lane.releasePointerCapture(e4.pointerId);
    } catch {
    }
    const swallow = (clickEvent) => {
      clickEvent.preventDefault();
      clickEvent.stopPropagation();
      lane.removeEventListener("click", swallow, true);
    };
    lane.addEventListener("click", swallow, true);
    getWindow(lane).setTimeout(() => lane.removeEventListener("click", swallow, true), 0);
  };
  store.add(addDisposableListener(lane, EventType.POINTER_UP, endDrag));
  store.add(addDisposableListener(lane, "pointercancel", endDrag));
  return store;
}
export { installMobileChipLaneScroll, TAP_THRESHOLD_PX };
