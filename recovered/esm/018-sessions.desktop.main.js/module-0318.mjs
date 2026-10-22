// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/browser/viewParts/overviewRuler/overviewRuler.ts
import { ViewEventHandler } from "./module-0238.mjs";
import { createFastDomNode } from "./module-0212.mjs";
import { OverviewZoneManager } from "./module-0317.mjs";


// src/vs/editor/browser/viewParts/overviewRuler/overviewRuler.ts
var OverviewRuler = class extends ViewEventHandler {
  constructor(context2, cssClassName) {
    super();
    this._context = context2;
    const options3 = this._context.configuration.options;
    this._domNode = createFastDomNode(document.createElement("canvas"));
    this._domNode.setClassName(cssClassName);
    this._domNode.setPosition("absolute");
    this._domNode.setLayerHinting(true);
    this._domNode.setContain("strict");
    this._zoneManager = new OverviewZoneManager((lineNumber) => this._context.viewLayout.getVerticalOffsetForLineNumber(lineNumber));
    this._zoneManager.setDOMWidth(0);
    this._zoneManager.setDOMHeight(0);
    this._zoneManager.setOuterHeight(this._context.viewLayout.getScrollHeight());
    this._zoneManager.setLineHeight(options3.get(75 /* lineHeight */));
    this._zoneManager.setPixelRatio(options3.get(163 /* pixelRatio */));
    this._context.addEventHandler(this);
  }
  dispose() {
    this._context.removeEventHandler(this);
    super.dispose();
  }
  // ---- begin view event handlers
  onConfigurationChanged(e4) {
    const options3 = this._context.configuration.options;
    if (e4.hasChanged(75 /* lineHeight */)) {
      this._zoneManager.setLineHeight(options3.get(75 /* lineHeight */));
      this._render();
    }
    if (e4.hasChanged(163 /* pixelRatio */)) {
      this._zoneManager.setPixelRatio(options3.get(163 /* pixelRatio */));
      this._domNode.setWidth(this._zoneManager.getDOMWidth());
      this._domNode.setHeight(this._zoneManager.getDOMHeight());
      this._domNode.domNode.width = this._zoneManager.getCanvasWidth();
      this._domNode.domNode.height = this._zoneManager.getCanvasHeight();
      this._render();
    }
    return true;
  }
  onFlushed(e4) {
    this._render();
    return true;
  }
  onScrollChanged(e4) {
    if (e4.scrollHeightChanged) {
      this._zoneManager.setOuterHeight(e4.scrollHeight);
      this._render();
    }
    return true;
  }
  onZonesChanged(e4) {
    this._render();
    return true;
  }
  // ---- end view event handlers
  getDomNode() {
    return this._domNode.domNode;
  }
  setLayout(position2) {
    this._domNode.setTop(position2.top);
    this._domNode.setRight(position2.right);
    let hasChanged = false;
    hasChanged = this._zoneManager.setDOMWidth(position2.width) || hasChanged;
    hasChanged = this._zoneManager.setDOMHeight(position2.height) || hasChanged;
    if (hasChanged) {
      this._domNode.setWidth(this._zoneManager.getDOMWidth());
      this._domNode.setHeight(this._zoneManager.getDOMHeight());
      this._domNode.domNode.width = this._zoneManager.getCanvasWidth();
      this._domNode.domNode.height = this._zoneManager.getCanvasHeight();
      this._render();
    }
  }
  setZones(zones) {
    this._zoneManager.setZones(zones);
    this._render();
  }
  _render() {
    if (this._zoneManager.getOuterHeight() === 0) {
      return false;
    }
    const width2 = this._zoneManager.getCanvasWidth();
    const height = this._zoneManager.getCanvasHeight();
    const colorZones = this._zoneManager.resolveColorZones();
    const id2Color = this._zoneManager.getId2Color();
    const ctx = this._domNode.domNode.getContext("2d");
    ctx.clearRect(0, 0, width2, height);
    if (colorZones.length > 0) {
      this._renderOneLane(ctx, colorZones, id2Color, width2);
    }
    return true;
  }
  _renderOneLane(ctx, colorZones, id2Color, width2) {
    let currentColorId = 0;
    let currentFrom = 0;
    let currentTo = 0;
    for (const zone of colorZones) {
      const zoneColorId = zone.colorId;
      const zoneFrom = zone.from;
      const zoneTo = zone.to;
      if (zoneColorId !== currentColorId) {
        if (currentColorId !== 0) {
          ctx.fillRect(0, currentFrom, width2, currentTo - currentFrom);
        }
        currentColorId = zoneColorId;
        ctx.fillStyle = id2Color[currentColorId];
        currentFrom = zoneFrom;
        currentTo = zoneTo;
      } else {
        if (currentTo >= zoneFrom) {
          currentTo = Math.max(currentTo, zoneTo);
        } else {
          ctx.fillRect(0, currentFrom, width2, currentTo - currentFrom);
          currentFrom = zoneFrom;
          currentTo = zoneTo;
        }
      }
    }
    ctx.fillRect(0, currentFrom, width2, currentTo - currentFrom);
  }
};
export { OverviewRuler };
