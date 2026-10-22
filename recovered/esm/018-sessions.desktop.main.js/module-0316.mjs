// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/browser/viewParts/overviewRuler/decorationsOverviewRuler.ts
import { editorCursorForeground, editorMultiCursorPrimaryForeground, editorMultiCursorSecondaryForeground, editorOverviewRulerBackground, editorOverviewRulerBorder } from "./module-0288.mjs";
import { TokenizationRegistry2 } from "./module-0164.mjs";
import { Color } from "./module-0197.mjs";
import { ViewPart } from "./module-0239.mjs";
import { createFastDomNode } from "./module-0212.mjs";
import { Position } from "./module-0079.mjs";
import { OverviewRulerDecorationsGroup } from "./module-0315.mjs";
import { equals } from "./module-0007.mjs";


// src/vs/editor/browser/viewParts/overviewRuler/decorationsOverviewRuler.ts
var Settings = class {
  constructor(config, theme) {
    const options3 = config.options;
    this.lineHeight = options3.get(75 /* lineHeight */);
    this.pixelRatio = options3.get(163 /* pixelRatio */);
    this.overviewRulerLanes = options3.get(95 /* overviewRulerLanes */);
    this.renderBorder = options3.get(94 /* overviewRulerBorder */);
    const borderColor = theme.getColor(editorOverviewRulerBorder);
    this.borderColor = borderColor ? borderColor.toString() : null;
    this.hideCursor = options3.get(68 /* hideCursorInOverviewRuler */);
    const cursorColorSingle = theme.getColor(editorCursorForeground);
    this.cursorColorSingle = cursorColorSingle ? cursorColorSingle.transparent(0.7).toString() : null;
    const cursorColorPrimary = theme.getColor(editorMultiCursorPrimaryForeground);
    this.cursorColorPrimary = cursorColorPrimary ? cursorColorPrimary.transparent(0.7).toString() : null;
    const cursorColorSecondary = theme.getColor(editorMultiCursorSecondaryForeground);
    this.cursorColorSecondary = cursorColorSecondary ? cursorColorSecondary.transparent(0.7).toString() : null;
    this.themeType = theme.type;
    const minimapOpts = options3.get(81 /* minimap */);
    const minimapEnabled = minimapOpts.enabled;
    const minimapSide = minimapOpts.side;
    const themeColor = theme.getColor(editorOverviewRulerBackground);
    const defaultBackground = TokenizationRegistry2.getDefaultBackground();
    if (themeColor) {
      this.backgroundColor = themeColor;
    } else if (minimapEnabled && minimapSide === "right") {
      this.backgroundColor = defaultBackground;
    } else {
      this.backgroundColor = null;
    }
    const layoutInfo = options3.get(165 /* layoutInfo */);
    const position2 = layoutInfo.overviewRuler;
    this.top = position2.top;
    this.right = position2.right;
    this.domWidth = position2.width;
    this.domHeight = position2.height;
    if (this.overviewRulerLanes === 0) {
      this.canvasWidth = 0;
      this.canvasHeight = 0;
    } else {
      this.canvasWidth = this.domWidth * this.pixelRatio | 0;
      this.canvasHeight = this.domHeight * this.pixelRatio | 0;
    }
    const [x, w] = this._initLanes(1, this.canvasWidth, this.overviewRulerLanes);
    this.x = x;
    this.w = w;
  }
  _initLanes(canvasLeftOffset, canvasWidth, laneCount) {
    const remainingWidth = canvasWidth - canvasLeftOffset;
    if (laneCount >= 3) {
      const leftWidth = Math.floor(remainingWidth / 3);
      const rightWidth = Math.floor(remainingWidth / 3);
      const centerWidth = remainingWidth - leftWidth - rightWidth;
      const leftOffset = canvasLeftOffset;
      const centerOffset = leftOffset + leftWidth;
      const rightOffset = leftOffset + leftWidth + centerWidth;
      return [
        [
          0,
          leftOffset,
          // Left
          centerOffset,
          // Center
          leftOffset,
          // Left | Center
          rightOffset,
          // Right
          leftOffset,
          // Left | Right
          centerOffset,
          // Center | Right
          leftOffset
          // Left | Center | Right
        ],
        [
          0,
          leftWidth,
          // Left
          centerWidth,
          // Center
          leftWidth + centerWidth,
          // Left | Center
          rightWidth,
          // Right
          leftWidth + centerWidth + rightWidth,
          // Left | Right
          centerWidth + rightWidth,
          // Center | Right
          leftWidth + centerWidth + rightWidth
          // Left | Center | Right
        ]
      ];
    } else if (laneCount === 2) {
      const leftWidth = Math.floor(remainingWidth / 2);
      const rightWidth = remainingWidth - leftWidth;
      const leftOffset = canvasLeftOffset;
      const rightOffset = leftOffset + leftWidth;
      return [
        [
          0,
          leftOffset,
          // Left
          leftOffset,
          // Center
          leftOffset,
          // Left | Center
          rightOffset,
          // Right
          leftOffset,
          // Left | Right
          leftOffset,
          // Center | Right
          leftOffset
          // Left | Center | Right
        ],
        [
          0,
          leftWidth,
          // Left
          leftWidth,
          // Center
          leftWidth,
          // Left | Center
          rightWidth,
          // Right
          leftWidth + rightWidth,
          // Left | Right
          leftWidth + rightWidth,
          // Center | Right
          leftWidth + rightWidth
          // Left | Center | Right
        ]
      ];
    } else {
      const offset = canvasLeftOffset;
      const width2 = remainingWidth;
      return [
        [
          0,
          offset,
          // Left
          offset,
          // Center
          offset,
          // Left | Center
          offset,
          // Right
          offset,
          // Left | Right
          offset,
          // Center | Right
          offset
          // Left | Center | Right
        ],
        [
          0,
          width2,
          // Left
          width2,
          // Center
          width2,
          // Left | Center
          width2,
          // Right
          width2,
          // Left | Right
          width2,
          // Center | Right
          width2
          // Left | Center | Right
        ]
      ];
    }
  }
  equals(other) {
    return this.lineHeight === other.lineHeight && this.pixelRatio === other.pixelRatio && this.overviewRulerLanes === other.overviewRulerLanes && this.renderBorder === other.renderBorder && this.borderColor === other.borderColor && this.hideCursor === other.hideCursor && this.cursorColorSingle === other.cursorColorSingle && this.cursorColorPrimary === other.cursorColorPrimary && this.cursorColorSecondary === other.cursorColorSecondary && this.themeType === other.themeType && Color.equals(this.backgroundColor, other.backgroundColor) && this.top === other.top && this.right === other.right && this.domWidth === other.domWidth && this.domHeight === other.domHeight && this.canvasWidth === other.canvasWidth && this.canvasHeight === other.canvasHeight;
  }
};

var DecorationsOverviewRuler = class extends ViewPart {
  constructor(context2) {
    super(context2);
    this._actualShouldRender = 0 /* NotNeeded */;
    this._renderedDecorations = [];
    this._renderedCursorPositions = [];
    this._domNode = createFastDomNode(document.createElement("canvas"));
    this._domNode.setClassName("decorationsOverviewRuler");
    this._domNode.setPosition("absolute");
    this._domNode.setLayerHinting(true);
    this._domNode.setContain("strict");
    this._domNode.setAttribute("aria-hidden", "true");
    this._updateSettings(false);
    this._tokensColorTrackerListener = TokenizationRegistry2.onDidChange((e4) => {
      if (e4.changedColorMap) {
        this._updateSettings(true);
      }
    });
    this._cursorPositions = [{ position: new Position(1, 1), color: this._settings.cursorColorSingle }];
  }
  dispose() {
    super.dispose();
    this._tokensColorTrackerListener.dispose();
  }
  _updateSettings(renderNow) {
    const newSettings = new Settings(this._context.configuration, this._context.theme);
    if (this._settings && this._settings.equals(newSettings)) {
      return false;
    }
    this._settings = newSettings;
    this._domNode.setTop(this._settings.top);
    this._domNode.setRight(this._settings.right);
    this._domNode.setWidth(this._settings.domWidth);
    this._domNode.setHeight(this._settings.domHeight);
    this._domNode.domNode.width = this._settings.canvasWidth;
    this._domNode.domNode.height = this._settings.canvasHeight;
    if (renderNow) {
      this._render();
    }
    return true;
  }
  // ---- begin view event handlers
  _markRenderingIsNeeded() {
    this._actualShouldRender = 2 /* Needed */;
    return true;
  }
  _markRenderingIsMaybeNeeded() {
    this._actualShouldRender = 1 /* Maybe */;
    return true;
  }
  onConfigurationChanged(e4) {
    return this._updateSettings(false) ? this._markRenderingIsNeeded() : false;
  }
  onCursorStateChanged(e4) {
    this._cursorPositions = [];
    for (let i2 = 0, len = e4.selections.length; i2 < len; i2++) {
      let color2 = this._settings.cursorColorSingle;
      if (len > 1) {
        color2 = i2 === 0 ? this._settings.cursorColorPrimary : this._settings.cursorColorSecondary;
      }
      this._cursorPositions.push({ position: e4.selections[i2].getPosition(), color: color2 });
    }
    this._cursorPositions.sort((a, b) => Position.compare(a.position, b.position));
    return this._markRenderingIsMaybeNeeded();
  }
  onDecorationsChanged(e4) {
    if (e4.affectsOverviewRuler) {
      return this._markRenderingIsMaybeNeeded();
    }
    return false;
  }
  onFlushed(e4) {
    return this._markRenderingIsNeeded();
  }
  onScrollChanged(e4) {
    return e4.scrollHeightChanged ? this._markRenderingIsNeeded() : false;
  }
  onZonesChanged(e4) {
    return this._markRenderingIsNeeded();
  }
  onThemeChanged(e4) {
    return this._updateSettings(false) ? this._markRenderingIsNeeded() : false;
  }
  // ---- end view event handlers
  getDomNode() {
    return this._domNode.domNode;
  }
  prepareRender(ctx) {
  }
  render(editorCtx) {
    this._render();
    this._actualShouldRender = 0 /* NotNeeded */;
  }
  _render() {
    const backgroundColor = this._settings.backgroundColor;
    if (this._settings.overviewRulerLanes === 0) {
      this._domNode.setBackgroundColor(backgroundColor ? Color.Format.CSS.formatHexA(backgroundColor) : "");
      this._domNode.setDisplay("none");
      return;
    }
    const decorations = this._context.viewModel.getAllOverviewRulerDecorations(this._context.theme);
    decorations.sort(OverviewRulerDecorationsGroup.compareByRenderingProps);
    if (this._actualShouldRender === 1 /* Maybe */ && !OverviewRulerDecorationsGroup.equalsArr(this._renderedDecorations, decorations)) {
      this._actualShouldRender = 2 /* Needed */;
    }
    if (this._actualShouldRender === 1 /* Maybe */ && !equals(this._renderedCursorPositions, this._cursorPositions, (a, b) => a.position.lineNumber === b.position.lineNumber && a.color === b.color)) {
      this._actualShouldRender = 2 /* Needed */;
    }
    if (this._actualShouldRender === 1 /* Maybe */) {
      return;
    }
    this._renderedDecorations = decorations;
    this._renderedCursorPositions = this._cursorPositions;
    this._domNode.setDisplay("block");
    const canvasWidth = this._settings.canvasWidth;
    const canvasHeight = this._settings.canvasHeight;
    const lineHeight = this._settings.lineHeight;
    const viewLayout = this._context.viewLayout;
    const outerHeight = this._context.viewLayout.getScrollHeight();
    const heightRatio = canvasHeight / outerHeight;
    const minDecorationHeight = 6 /* MIN_DECORATION_HEIGHT */ * this._settings.pixelRatio | 0;
    const halfMinDecorationHeight = minDecorationHeight / 2 | 0;
    const canvasCtx = this._domNode.domNode.getContext("2d");
    if (backgroundColor) {
      if (backgroundColor.isOpaque()) {
        canvasCtx.fillStyle = Color.Format.CSS.formatHexA(backgroundColor);
        canvasCtx.fillRect(0, 0, canvasWidth, canvasHeight);
      } else {
        canvasCtx.clearRect(0, 0, canvasWidth, canvasHeight);
        canvasCtx.fillStyle = Color.Format.CSS.formatHexA(backgroundColor);
        canvasCtx.fillRect(0, 0, canvasWidth, canvasHeight);
      }
    } else {
      canvasCtx.clearRect(0, 0, canvasWidth, canvasHeight);
    }
    const x = this._settings.x;
    const w = this._settings.w;
    for (const decorationGroup of decorations) {
      const color2 = decorationGroup.color;
      const decorationGroupData = decorationGroup.data;
      canvasCtx.fillStyle = color2;
      let prevLane = 0;
      let prevY1 = 0;
      let prevY2 = 0;
      for (let i2 = 0, len = decorationGroupData.length / 3; i2 < len; i2++) {
        const lane = decorationGroupData[3 * i2];
        const startLineNumber = decorationGroupData[3 * i2 + 1];
        const endLineNumber = decorationGroupData[3 * i2 + 2];
        let y1 = viewLayout.getVerticalOffsetForLineNumber(startLineNumber) * heightRatio | 0;
        let y2 = (viewLayout.getVerticalOffsetForLineNumber(endLineNumber) + lineHeight) * heightRatio | 0;
        const height = y2 - y1;
        if (height < minDecorationHeight) {
          let yCenter = (y1 + y2) / 2 | 0;
          if (yCenter < halfMinDecorationHeight) {
            yCenter = halfMinDecorationHeight;
          } else if (yCenter + halfMinDecorationHeight > canvasHeight) {
            yCenter = canvasHeight - halfMinDecorationHeight;
          }
          y1 = yCenter - halfMinDecorationHeight;
          y2 = yCenter + halfMinDecorationHeight;
        }
        if (y1 > prevY2 + 1 || lane !== prevLane) {
          if (i2 !== 0) {
            canvasCtx.fillRect(x[prevLane], prevY1, w[prevLane], prevY2 - prevY1);
          }
          prevLane = lane;
          prevY1 = y1;
          prevY2 = y2;
        } else {
          if (y2 > prevY2) {
            prevY2 = y2;
          }
        }
      }
      canvasCtx.fillRect(x[prevLane], prevY1, w[prevLane], prevY2 - prevY1);
    }
    if (!this._settings.hideCursor) {
      const cursorHeight = 2 * this._settings.pixelRatio | 0;
      const halfCursorHeight = cursorHeight / 2 | 0;
      const cursorX = this._settings.x[7 /* Full */];
      const cursorW = this._settings.w[7 /* Full */];
      let prevY1 = -100;
      let prevY2 = -100;
      let prevColor = null;
      for (let i2 = 0, len = this._cursorPositions.length; i2 < len; i2++) {
        const color2 = this._cursorPositions[i2].color;
        if (!color2) {
          continue;
        }
        const cursor = this._cursorPositions[i2].position;
        let yCenter = viewLayout.getVerticalOffsetForLineNumber(cursor.lineNumber) * heightRatio | 0;
        if (yCenter < halfCursorHeight) {
          yCenter = halfCursorHeight;
        } else if (yCenter + halfCursorHeight > canvasHeight) {
          yCenter = canvasHeight - halfCursorHeight;
        }
        const y1 = yCenter - halfCursorHeight;
        const y2 = y1 + cursorHeight;
        if (y1 > prevY2 + 1 || color2 !== prevColor) {
          if (i2 !== 0 && prevColor) {
            canvasCtx.fillRect(cursorX, prevY1, cursorW, prevY2 - prevY1);
          }
          prevY1 = y1;
          prevY2 = y2;
        } else {
          if (y2 > prevY2) {
            prevY2 = y2;
          }
        }
        prevColor = color2;
        canvasCtx.fillStyle = color2;
      }
      if (prevColor) {
        canvasCtx.fillRect(cursorX, prevY1, cursorW, prevY2 - prevY1);
      }
    }
    if (this._settings.renderBorder && this._settings.borderColor && this._settings.overviewRulerLanes > 0) {
      canvasCtx.beginPath();
      canvasCtx.lineWidth = 1;
      canvasCtx.strokeStyle = this._settings.borderColor;
      canvasCtx.moveTo(0, 0);
      canvasCtx.lineTo(0, canvasHeight);
      canvasCtx.moveTo(1, 0);
      canvasCtx.lineTo(canvasWidth, 0);
      canvasCtx.stroke();
    }
  }
};
export { Settings, DecorationsOverviewRuler };
