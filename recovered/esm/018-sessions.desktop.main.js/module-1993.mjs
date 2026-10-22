// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/platform/editor/browser/editor.ts
import { DisposableStore } from "./module-0012.mjs";
import { EventHelper, EventType, addDisposableListener, getWindow } from "./module-0075.mjs";
import { StandardMouseEvent } from "./module-0024.mjs";
import { StandardKeyboardEvent } from "./module-0022.mjs";
import { isMacintosh } from "./module-0014.mjs";


// src/vs/platform/editor/browser/editor.ts
function registerOpenEditorListeners(element, onOpenEditor) {
  const disposables = new DisposableStore();
  disposables.add(addDisposableListener(element, EventType.CLICK, (e4) => {
    if (e4.detail === 2) {
      return;
    }
    EventHelper.stop(e4, true);
    onOpenEditor(toOpenEditorOptions(new StandardMouseEvent(getWindow(element), e4)));
  }));
  disposables.add(addDisposableListener(element, EventType.DBLCLICK, (e4) => {
    EventHelper.stop(e4, true);
    onOpenEditor(toOpenEditorOptions(new StandardMouseEvent(getWindow(element), e4), true));
  }));
  disposables.add(addDisposableListener(element, EventType.KEY_DOWN, (e4) => {
    const options3 = toOpenEditorOptions(new StandardKeyboardEvent(e4));
    if (!options3) {
      return;
    }
    EventHelper.stop(e4, true);
    onOpenEditor(options3);
  }));
  return disposables;
}

function toOpenEditorOptions(event, isDoubleClick) {
  if (event instanceof StandardKeyboardEvent) {
    let preserveFocus = void 0;
    if (event.equals(3 /* Enter */) || isMacintosh && event.equals(2048 /* CtrlCmd */ | 18 /* DownArrow */)) {
      preserveFocus = false;
    } else if (event.equals(10 /* Space */)) {
      preserveFocus = true;
    }
    if (typeof preserveFocus === "undefined") {
      return;
    }
    return { editorOptions: { preserveFocus, pinned: !preserveFocus }, openToSide: false };
  } else {
    return { editorOptions: { preserveFocus: !isDoubleClick, pinned: isDoubleClick || event.middleButton }, openToSide: event.ctrlKey || event.metaKey || event.altKey };
  }
}
export { registerOpenEditorListeners, toOpenEditorOptions };
