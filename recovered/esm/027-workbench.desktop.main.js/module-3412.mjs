// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/terminal/browser/widgets/terminalHoverWidget.ts
import { $, addDisposableListener } from "./module-0075.mjs";
import { Disposable, toDisposable } from "./module-0012.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IHoverService } from "./module-0520.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { Widget } from "./module-0252.mjs";


// src/vs/workbench/contrib/terminal/browser/widgets/terminalHoverWidget.ts
var $108 = $;

var TerminalHover = class extends Disposable {
  constructor(_targetOptions, _text, _actions, _linkHandler, _hoverService, _configurationService) {
    super();
    this._targetOptions = _targetOptions;
    this._text = _text;
    this._actions = _actions;
    this._linkHandler = _linkHandler;
    this._hoverService = _hoverService;
    this._configurationService = _configurationService;
    this.id = "hover";
  }
  attach(container3) {
    const showLinkHover = this._configurationService.getValue("terminal.integrated.showLinkHover" /* ShowLinkHover */);
    if (!showLinkHover) {
      return;
    }
    const target = new CellHoverTarget(container3, this._targetOptions);
    const hover = this._hoverService.showInstantHover({
      target,
      content: this._text,
      actions: this._actions,
      linkHandler: this._linkHandler,
      // .xterm-hover lets xterm know that the hover is part of a link
      additionalClasses: ["xterm-hover"]
    });
    if (hover) {
      this._register(hover);
    }
  }
};

TerminalHover = __decorateClass([
  __decorateParam(4, IHoverService),
  __decorateParam(5, IConfigurationService)
], TerminalHover);

var CellHoverTarget = class extends Widget {
  constructor(container3, _options) {
    super();
    this._options = _options;
    this._targetElements = [];
    this._domNode = $108("div.terminal-hover-targets.xterm-hover");
    const rowCount = this._options.viewportRange.end.y - this._options.viewportRange.start.y + 1;
    const width2 = (this._options.viewportRange.end.y > this._options.viewportRange.start.y ? this._options.terminalDimensions.width - this._options.viewportRange.start.x : this._options.viewportRange.end.x - this._options.viewportRange.start.x + 1) * this._options.cellDimensions.width;
    const topTarget = $108("div.terminal-hover-target.hoverHighlight");
    topTarget.style.left = `${this._options.viewportRange.start.x * this._options.cellDimensions.width}px`;
    topTarget.style.bottom = `${(this._options.terminalDimensions.height - this._options.viewportRange.start.y - 1) * this._options.cellDimensions.height}px`;
    topTarget.style.width = `${width2}px`;
    topTarget.style.height = `${this._options.cellDimensions.height}px`;
    this._targetElements.push(this._domNode.appendChild(topTarget));
    if (rowCount > 2) {
      const middleTarget = $108("div.terminal-hover-target.hoverHighlight");
      middleTarget.style.left = `0px`;
      middleTarget.style.bottom = `${(this._options.terminalDimensions.height - this._options.viewportRange.start.y - 1 - (rowCount - 2)) * this._options.cellDimensions.height}px`;
      middleTarget.style.width = `${this._options.terminalDimensions.width * this._options.cellDimensions.width}px`;
      middleTarget.style.height = `${(rowCount - 2) * this._options.cellDimensions.height}px`;
      this._targetElements.push(this._domNode.appendChild(middleTarget));
    }
    if (rowCount > 1) {
      const bottomTarget = $108("div.terminal-hover-target.hoverHighlight");
      bottomTarget.style.left = `0px`;
      bottomTarget.style.bottom = `${(this._options.terminalDimensions.height - this._options.viewportRange.end.y - 1) * this._options.cellDimensions.height}px`;
      bottomTarget.style.width = `${(this._options.viewportRange.end.x + 1) * this._options.cellDimensions.width}px`;
      bottomTarget.style.height = `${this._options.cellDimensions.height}px`;
      this._targetElements.push(this._domNode.appendChild(bottomTarget));
    }
    if (this._options.modifierDownCallback && this._options.modifierUpCallback) {
      let down = false;
      this._register(addDisposableListener(container3.ownerDocument, "keydown", (e) => {
        if (e.ctrlKey && !down) {
          down = true;
          this._options.modifierDownCallback();
        }
      }));
      this._register(addDisposableListener(container3.ownerDocument, "keyup", (e) => {
        if (!e.ctrlKey) {
          down = false;
          this._options.modifierUpCallback();
        }
      }));
    }
    container3.appendChild(this._domNode);
    this._register(toDisposable(() => this._domNode?.remove()));
  }
  get targetElements() {
    return this._targetElements;
  }
};
export { $108, TerminalHover, CellHoverTarget };
