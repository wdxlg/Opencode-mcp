// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/terminal/browser/terminalConfigurationService.ts
import { Disposable, toDisposable } from "./module-0012.mjs";
import { DEFAULT_BOLD_FONT_WEIGHT, DEFAULT_COMMANDS_TO_SKIP_SHELL, DEFAULT_FONT_WEIGHT, DEFAULT_LETTER_SPACING, DEFAULT_LINE_HEIGHT, MAXIMUM_FONT_WEIGHT, MINIMUM_FONT_WEIGHT, MINIMUM_LETTER_SPACING, TERMINAL_CONFIG_SECTION } from "./module-1173.mjs";
import { Emitter, Event2 } from "./module-0017.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { EDITOR_FONT_DEFAULTS } from "./module-0101.mjs";
import { isMacintosh } from "./module-0014.mjs";
import { isString } from "./module-0010.mjs";
import { clamp } from "./module-0040.mjs";


// src/vs/workbench/contrib/terminal/browser/terminalConfigurationService.ts
var TerminalConfigurationService = class extends Disposable {
  constructor(_configurationService) {
    super();
    this._configurationService = _configurationService;
    this._skipTerminalCommands = new Set(DEFAULT_COMMANDS_TO_SKIP_SHELL);
    this._onConfigChanged = this._register(new Emitter());
    this._fontMetrics = this._register(new TerminalFontMetrics(this, this._configurationService));
    this._register(Event2.runAndSubscribe(this._configurationService.onDidChangeConfiguration, (e) => {
      if (!e || e.affectsConfiguration(TERMINAL_CONFIG_SECTION)) {
        this._updateConfig();
      }
    }));
  }
  get config() {
    return this._config;
  }
  get defaultLocation() {
    if (this.config.defaultLocation === "editor" /* Editor */) {
      return 2 /* Editor */;
    }
    return 1 /* Panel */;
  }
  get onConfigChanged() {
    return this._onConfigChanged.event;
  }
  setPanelContainer(panelContainer) {
    return this._fontMetrics.setPanelContainer(panelContainer);
  }
  configFontIsMonospace() {
    return this._fontMetrics.configFontIsMonospace();
  }
  getFont(w, xtermCore, excludeDimensions) {
    return this._fontMetrics.getFont(w, xtermCore, excludeDimensions);
  }
  shouldCommandSkipShell(commandId) {
    return this._skipTerminalCommands.has(commandId);
  }
  _updateConfig() {
    const configValues = { ...this._configurationService.getValue(TERMINAL_CONFIG_SECTION) };
    configValues.fontWeight = this._normalizeFontWeight(configValues.fontWeight, DEFAULT_FONT_WEIGHT);
    configValues.fontWeightBold = this._normalizeFontWeight(configValues.fontWeightBold, DEFAULT_BOLD_FONT_WEIGHT);
    this._config = configValues;
    const skipTerminalCommands = new Set(DEFAULT_COMMANDS_TO_SKIP_SHELL);
    const commandsToSkipShell = configValues.commandsToSkipShell ?? [];
    for (let i2 = 0; i2 < commandsToSkipShell.length; i2++) {
      const command4 = commandsToSkipShell[i2];
      if (command4[0] === "-") {
        skipTerminalCommands.delete(command4.slice(1));
        continue;
      }
      skipTerminalCommands.add(command4);
    }
    this._skipTerminalCommands = skipTerminalCommands;
    this._onConfigChanged.fire();
  }
  _normalizeFontWeight(input, defaultWeight) {
    if (input === "normal" || input === "bold") {
      return input;
    }
    return clampInt(input, MINIMUM_FONT_WEIGHT, MAXIMUM_FONT_WEIGHT, defaultWeight);
  }
};

TerminalConfigurationService = __decorateClass([
  __decorateParam(0, IConfigurationService)
], TerminalConfigurationService);

var TerminalFontMetrics = class extends Disposable {
  constructor(_terminalConfigurationService, _configurationService) {
    super();
    this._terminalConfigurationService = _terminalConfigurationService;
    this._configurationService = _configurationService;
    this.linuxDistro = 1 /* Unknown */;
    this._register(toDisposable(() => this._charMeasureElement?.remove()));
  }
  setPanelContainer(panelContainer) {
    this._panelContainer = panelContainer;
  }
  configFontIsMonospace() {
    const fontSize = 15;
    const fontFamily = this._terminalConfigurationService.config.fontFamily || this._configurationService.getValue("editor").fontFamily || EDITOR_FONT_DEFAULTS.fontFamily;
    const iRect = this._getBoundingRectFor("i", fontFamily, fontSize);
    const wRect = this._getBoundingRectFor("w", fontFamily, fontSize);
    if (!iRect || !wRect || !iRect.width || !wRect.width) {
      return true;
    }
    return iRect.width === wRect.width;
  }
  /**
   * Gets the font information based on the terminal.integrated.fontFamily
   * terminal.integrated.fontSize, terminal.integrated.lineHeight configuration properties
   */
  getFont(w, xtermCore, excludeDimensions) {
    const editorConfig = this._configurationService.getValue("editor");
    let fontFamily = this._terminalConfigurationService.config.fontFamily || editorConfig.fontFamily || EDITOR_FONT_DEFAULTS.fontFamily || "monospace";
    let fontSize = clampInt(this._terminalConfigurationService.config.fontSize, 6 /* MinimumFontSize */, 100 /* MaximumFontSize */, EDITOR_FONT_DEFAULTS.fontSize);
    if (!this._terminalConfigurationService.config.fontFamily) {
      if (this.linuxDistro === 2 /* Fedora */) {
        fontFamily = "'DejaVu Sans Mono'";
      }
      if (this.linuxDistro === 3 /* Ubuntu */) {
        fontFamily = "'Ubuntu Mono'";
        fontSize = clampInt(fontSize + 2, 6 /* MinimumFontSize */, 100 /* MaximumFontSize */, EDITOR_FONT_DEFAULTS.fontSize);
      }
    }
    fontFamily += ", monospace";
    if (isMacintosh) {
      fontFamily += ", AppleBraille";
    }
    const letterSpacing = this._terminalConfigurationService.config.letterSpacing ? Math.max(Math.floor(this._terminalConfigurationService.config.letterSpacing), MINIMUM_LETTER_SPACING) : DEFAULT_LETTER_SPACING;
    const lineHeight = this._terminalConfigurationService.config.lineHeight ? Math.max(this._terminalConfigurationService.config.lineHeight, 1) : DEFAULT_LINE_HEIGHT;
    if (excludeDimensions) {
      return {
        fontFamily,
        fontSize,
        letterSpacing,
        lineHeight
      };
    }
    if (xtermCore?._renderService?._renderer.value) {
      const cellDims = xtermCore._renderService.dimensions.css.cell;
      if (cellDims?.width && cellDims?.height) {
        return {
          fontFamily,
          fontSize,
          letterSpacing,
          lineHeight,
          charHeight: cellDims.height / lineHeight,
          charWidth: cellDims.width - Math.round(letterSpacing) / w.devicePixelRatio
        };
      }
    }
    return this._measureFont(w, fontFamily, fontSize, letterSpacing, lineHeight);
  }
  _createCharMeasureElementIfNecessary() {
    if (!this._panelContainer) {
      throw new Error("Cannot measure element when terminal is not attached");
    }
    if (!this._charMeasureElement || !this._charMeasureElement.parentElement) {
      this._charMeasureElement = document.createElement("div");
      this._panelContainer.appendChild(this._charMeasureElement);
    }
    return this._charMeasureElement;
  }
  _getBoundingRectFor(char, fontFamily, fontSize) {
    let charMeasureElement;
    try {
      charMeasureElement = this._createCharMeasureElementIfNecessary();
    } catch {
      return void 0;
    }
    const style = charMeasureElement.style;
    style.display = "inline-block";
    style.fontFamily = fontFamily;
    style.fontSize = fontSize + "px";
    style.lineHeight = "normal";
    charMeasureElement.innerText = char;
    const rect = charMeasureElement.getBoundingClientRect();
    style.display = "none";
    return rect;
  }
  _measureFont(w, fontFamily, fontSize, letterSpacing, lineHeight) {
    const rect = this._getBoundingRectFor("X", fontFamily, fontSize);
    if (this._lastFontMeasurement && (!rect || !rect.width || !rect.height)) {
      return this._lastFontMeasurement;
    }
    this._lastFontMeasurement = {
      fontFamily,
      fontSize,
      letterSpacing,
      lineHeight,
      charWidth: 0,
      charHeight: 0
    };
    if (rect && rect.width && rect.height) {
      this._lastFontMeasurement.charHeight = Math.ceil(rect.height);
      if (this._terminalConfigurationService.config.gpuAcceleration === "off") {
        this._lastFontMeasurement.charWidth = rect.width;
      } else {
        const deviceCharWidth = Math.floor(rect.width * w.devicePixelRatio);
        const deviceCellWidth = deviceCharWidth + Math.round(letterSpacing);
        const cssCellWidth = deviceCellWidth / w.devicePixelRatio;
        this._lastFontMeasurement.charWidth = cssCellWidth - Math.round(letterSpacing) / w.devicePixelRatio;
      }
    }
    return this._lastFontMeasurement;
  }
};

function clampInt(source, minimum, maximum, fallback2) {
  if (source === null || source === void 0) {
    return fallback2;
  }
  const r2 = isString(source) ? parseInt(source, 10) : source;
  if (isNaN(r2)) {
    return fallback2;
  }
  return clamp(r2, minimum, maximum);
}
export { clampInt, TerminalConfigurationService, TerminalFontMetrics };
