// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/contrib/inlineCompletions/browser/view/inlineEdits/inlineEditsViews/debugVisualization.ts
import { derived } from "./module-0054.mjs";


// src/vs/editor/contrib/inlineCompletions/browser/view/inlineEdits/inlineEditsViews/debugVisualization.ts
function setVisualization(data, visualization) {
  data["$$visualization"] = visualization;
}

function debugLogRects(rects, elem) {
  if (Array.isArray(rects)) {
    const record = {};
    rects.forEach((rect, index2) => {
      record[index2.toString()] = rect;
    });
    rects = record;
  }
  setVisualization(rects, new ManyRectVisualizer(rects, elem));
  return rects;
}

var ManyRectVisualizer = class {
  constructor(_rects, _elem) {
    this._rects = _rects;
    this._elem = _elem;
  }
  visualize() {
    const d = [];
    for (const key3 in this._rects) {
      const v2 = new HtmlRectVisualizer(this._rects[key3], this._elem, key3);
      d.push(v2.visualize());
    }
    return {
      dispose: () => {
        d.forEach((d2) => d2.dispose());
      }
    };
  }
};

var HtmlRectVisualizer = class {
  constructor(_rect, _elem, _name) {
    this._rect = _rect;
    this._elem = _elem;
    this._name = _name;
  }
  visualize() {
    const div = document.createElement("div");
    div.style.position = "fixed";
    div.style.border = "1px solid red";
    div.style.boxSizing = "border-box";
    div.style.pointerEvents = "none";
    div.style.zIndex = "100000";
    const label3 = document.createElement("div");
    label3.textContent = this._name;
    label3.style.position = "absolute";
    label3.style.top = "-20px";
    label3.style.left = "0";
    label3.style.color = "red";
    label3.style.fontSize = "12px";
    label3.style.backgroundColor = "rgba(255, 255, 255, 0.7)";
    div.appendChild(label3);
    const updatePosition = () => {
      const elemRect = this._elem.getBoundingClientRect();
      console.log(elemRect);
      div.style.left = elemRect.left + this._rect.left + "px";
      div.style.top = elemRect.top + this._rect.top + "px";
      div.style.width = this._rect.width + "px";
      div.style.height = this._rect.height + "px";
    };
    document.body.appendChild(div);
    updatePosition();
    const observer = new ResizeObserver(updatePosition);
    observer.observe(this._elem);
    return {
      dispose: () => {
        observer.disconnect();
        div.remove();
      }
    };
  }
};

function debugView(value2, reader) {
  if (typeof value2 === "object" && value2 && "$$visualization" in value2) {
    const vis = value2["$$visualization"];
    debugReadDisposable(vis.visualize(), reader);
  }
}

function debugReadDisposable(d, reader) {
  derived({ name: "debugReadDisposable" }, (_reader) => {
    _reader.store.add(d);
    return void 0;
  }).read(reader);
}
export { setVisualization, debugLogRects, debugView, debugReadDisposable, ManyRectVisualizer, HtmlRectVisualizer };
