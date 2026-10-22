// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/contrib/middleScroll/browser/middleScrollController.ts
import { Disposable, DisposableStore } from "./module-0012.mjs";
import { observableCodeEditor } from "./module-0493.mjs";
import { autorun } from "./module-0052.mjs";
import { disposableObservableValue, observableValue } from "./module-0048.mjs";
import { Point } from "./module-0492.mjs";
import { addDisposableListener, getWindow, n } from "./module-0075.mjs";
import { AnimationFrameScheduler2 } from "./module-0717.mjs";
import { derived } from "./module-0054.mjs";
import { appendRemoveOnDispose } from "./module-0478.mjs";


// src/vs/editor/contrib/middleScroll/browser/middleScrollController.ts
var MiddleScrollController = class _MiddleScrollController extends Disposable {
  constructor(_editor) {
    super();
    this._editor = _editor;
    const obsEditor = observableCodeEditor(this._editor);
    const scrollOnMiddleClick = obsEditor.getOption(171 /* scrollOnMiddleClick */);
    this._register(autorun((reader) => {
      if (!scrollOnMiddleClick.read(reader)) {
        return;
      }
      const editorDomNode = obsEditor.domNode.read(reader);
      if (!editorDomNode) {
        return;
      }
      const scrollingSession = reader.store.add(
        disposableObservableValue(
          "scrollingSession",
          void 0
        )
      );
      reader.store.add(this._editor.onMouseDown((e4) => {
        const session = scrollingSession.read(void 0);
        if (session) {
          scrollingSession.set(void 0, void 0);
          return;
        }
        if (!e4.event.middleButton) {
          return;
        }
        e4.event.stopPropagation();
        e4.event.preventDefault();
        const store = new DisposableStore();
        const initialPos = new Point(e4.event.posx, e4.event.posy);
        const mousePos = observeWindowMousePos(getWindow(editorDomNode), initialPos, store);
        const mouseDeltaAfterThreshold = mousePos.map((v2) => v2.subtract(initialPos).withThreshold(5));
        const editorDomNodeRect = editorDomNode.getBoundingClientRect();
        const initialMousePosInEditor = new Point(initialPos.x - editorDomNodeRect.left, initialPos.y - editorDomNodeRect.top);
        scrollingSession.set({
          mouseDeltaAfterThreshold,
          initialMousePosInEditor,
          didScroll: false,
          dispose: () => store.dispose()
        }, void 0);
        store.add(this._editor.onMouseUp((e5) => {
          const session2 = scrollingSession.read(void 0);
          if (session2 && session2.didScroll) {
            scrollingSession.set(void 0, void 0);
          }
        }));
        store.add(this._editor.onKeyDown((e5) => {
          scrollingSession.set(void 0, void 0);
        }));
      }));
      reader.store.add(autorun((reader2) => {
        const session = scrollingSession.read(reader2);
        if (!session) {
          return;
        }
        let lastTime = Date.now();
        reader2.store.add(autorun((reader3) => {
          AnimationFrameScheduler2.instance.invalidateOnNextAnimationFrame(reader3);
          const curTime = Date.now();
          const frameDurationMs = curTime - lastTime;
          lastTime = curTime;
          const mouseDelta = session.mouseDeltaAfterThreshold.read(void 0);
          const factor2 = frameDurationMs / 32;
          const scrollDelta = mouseDelta.scale(factor2);
          const scrollPos = new Point(this._editor.getScrollLeft(), this._editor.getScrollTop());
          this._editor.setScrollPosition(toScrollPosition(scrollPos.add(scrollDelta)));
          if (!scrollDelta.isZero()) {
            session.didScroll = true;
          }
        }));
        const directionAttr = derived((reader3) => {
          const delta2 = session.mouseDeltaAfterThreshold.read(reader3);
          let direction = "";
          direction += delta2.y < 0 ? "n" : delta2.y > 0 ? "s" : "";
          direction += delta2.x < 0 ? "w" : delta2.x > 0 ? "e" : "";
          return direction;
        });
        reader2.store.add(autorun((reader3) => {
          editorDomNode.setAttribute("data-scroll-direction", directionAttr.read(reader3));
        }));
      }));
      const dotDomElem = reader.store.add(n.div({
        class: ["scroll-editor-on-middle-click-dot", scrollingSession.map((session) => session ? "" : "hidden")],
        style: {
          left: scrollingSession.map((session) => session ? session.initialMousePosInEditor.x : 0),
          top: scrollingSession.map((session) => session ? session.initialMousePosInEditor.y : 0)
        }
      }).toDisposableLiveElement());
      reader.store.add(appendRemoveOnDispose(editorDomNode, dotDomElem.element));
      reader.store.add(autorun((reader2) => {
        const session = scrollingSession.read(reader2);
        editorDomNode.classList.toggle("scroll-editor-on-middle-click-editor", !!session);
      }));
    }));
  }
  static {
    this.ID = "editor.contrib.middleScroll";
  }
  static get(editor) {
    return editor.getContribution(_MiddleScrollController.ID);
  }
};

function observeWindowMousePos(window2, initialPos, store) {
  const val = observableValue("pos", initialPos);
  store.add(addDisposableListener(window2, "mousemove", (e4) => {
    val.set(new Point(e4.pageX, e4.pageY), void 0);
  }));
  return val;
}

function toScrollPosition(p) {
  return {
    scrollLeft: p.x,
    scrollTop: p.y
  };
}
export { observeWindowMousePos, toScrollPosition, MiddleScrollController };
