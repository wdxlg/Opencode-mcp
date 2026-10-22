// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/notebook/browser/viewParts/notebookHorizontalTracker.ts
import { Disposable } from "./module-0012.mjs";
import { EventType, addDisposableListener, getWindow } from "./module-0075.mjs";
import { isChrome, isMacintosh } from "./module-0014.mjs";


// src/vs/workbench/contrib/notebook/browser/viewParts/notebookHorizontalTracker.ts
var NotebookHorizontalTracker = class extends Disposable {
  constructor(_notebookEditor, _listViewScrollablement) {
    super();
    this._notebookEditor = _notebookEditor;
    this._listViewScrollablement = _listViewScrollablement;
    this._register(addDisposableListener(this._listViewScrollablement, EventType.MOUSE_WHEEL, (event) => {
      let deltaX = event.deltaX;
      let deltaY = event.deltaY;
      let wheelDeltaX = event.wheelDeltaX;
      let wheelDeltaY = event.wheelDeltaY;
      const wheelDelta = event.wheelDelta;
      const shiftConvert = !isMacintosh && event.shiftKey;
      if (shiftConvert && !deltaX) {
        deltaX = deltaY;
        deltaY = 0;
        wheelDeltaX = wheelDeltaY;
        wheelDeltaY = 0;
      }
      if (deltaX === 0) {
        return;
      }
      const hoveringOnEditor = this._notebookEditor.codeEditors.find((editor) => {
        const editorLayout = editor[1].getLayoutInfo();
        if (editorLayout.contentWidth === editorLayout.width) {
          return false;
        }
        const editorDOM = editor[1].getDomNode();
        if (editorDOM && editorDOM.contains(event.target)) {
          return true;
        }
        return false;
      });
      if (!hoveringOnEditor) {
        return;
      }
      const targetWindow = getWindow(event);
      const evt = {
        deltaMode: event.deltaMode,
        deltaX,
        deltaY: 0,
        deltaZ: 0,
        wheelDelta: wheelDelta && isChrome ? wheelDelta / targetWindow.devicePixelRatio : wheelDelta,
        wheelDeltaX: wheelDeltaX && isChrome ? wheelDeltaX / targetWindow.devicePixelRatio : wheelDeltaX,
        wheelDeltaY: 0,
        detail: event.detail,
        shiftKey: event.shiftKey,
        type: event.type,
        defaultPrevented: false,
        preventDefault: () => {
        },
        stopPropagation: () => {
        }
      };
      hoveringOnEditor[1].delegateScrollFromMouseWheelEvent(evt);
    }));
  }
};
export { NotebookHorizontalTracker };
