// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/mergeEditor/browser/view/fixedZoneWidget.ts
import { Disposable } from "./module-0012.mjs";
import { h } from "./module-0075.mjs";
import { Event2 } from "./module-0017.mjs";


// src/vs/workbench/contrib/mergeEditor/browser/view/fixedZoneWidget.ts
var FixedZoneWidget = class _FixedZoneWidget extends Disposable {
  constructor(editor, viewZoneAccessor, afterLineNumber, height, viewZoneIdsToCleanUp) {
    super();
    this.editor = editor;
    this.overlayWidgetId = `fixedZoneWidget-${_FixedZoneWidget.counter++}`;
    this.widgetDomNode = h("div.fixed-zone-widget").root;
    this.overlayWidget = {
      getId: () => this.overlayWidgetId,
      getDomNode: () => this.widgetDomNode,
      getPosition: () => null
    };
    this.viewZoneId = viewZoneAccessor.addZone({
      domNode: document.createElement("div"),
      afterLineNumber,
      heightInPx: height,
      ordinal: 5e4 + 1,
      onComputedHeight: (height2) => {
        this.widgetDomNode.style.height = `${height2}px`;
      },
      onDomNodeTop: (top2) => {
        this.widgetDomNode.style.top = `${top2}px`;
      }
    });
    viewZoneIdsToCleanUp.push(this.viewZoneId);
    this._register(Event2.runAndSubscribe(this.editor.onDidLayoutChange, () => {
      this.widgetDomNode.style.left = this.editor.getLayoutInfo().contentLeft + "px";
    }));
    this.editor.addOverlayWidget(this.overlayWidget);
    this._register({
      dispose: () => {
        this.editor.removeOverlayWidget(this.overlayWidget);
      }
    });
  }
  static {
    this.counter = 0;
  }
};
export { FixedZoneWidget };
