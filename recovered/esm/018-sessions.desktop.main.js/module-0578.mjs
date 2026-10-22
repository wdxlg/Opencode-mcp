// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/contrib/colorPicker/browser/colorDetector.ts
import { Disposable, DisposableStore, toDisposable } from "./module-0012.mjs";
import { DynamicCssRules } from "./module-0237.mjs";
import { TimeoutTimer, createCancelablePromise } from "./module-0036.mjs";
import { StopWatch } from "./module-0016.mjs";
import { getColors } from "./module-0577.mjs";
import { onUnexpectedError } from "./module-0004.mjs";
import { ModelDecorationOptions } from "./module-0423.mjs";
import { RGBA } from "./module-0197.mjs";
import { noBreakWhitespace } from "./module-0030.mjs";
import { Range2 } from "./module-0106.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { ILanguageFeaturesService } from "./module-0205.mjs";
import { ILanguageFeatureDebounceService } from "./module-0572.mjs";
import { Emitter } from "./module-0017.mjs";


// src/vs/editor/contrib/colorPicker/browser/colorDetector.ts
var ColorDecorationInjectedTextMarker = /* @__PURE__ */ Object.create({});

var ColorDetector = class extends Disposable {
  constructor(_editor, _configurationService, _languageFeaturesService, languageFeatureDebounceService) {
    super();
    this._editor = _editor;
    this._configurationService = _configurationService;
    this._languageFeaturesService = _languageFeaturesService;
    // ms
    this._localToDispose = this._register(new DisposableStore());
    this._decorationsIds = [];
    this._colorDatas = /* @__PURE__ */ new Map();
    this._decoratorLimitReporter = this._register(new DecoratorLimitReporter());
    this._colorDecorationClassRefs = this._register(new DisposableStore());
    this._colorDecoratorIds = this._editor.createDecorationsCollection();
    this._ruleFactory = this._register(new DynamicCssRules(this._editor));
    const editorDomNode = this._editor.getContainerDomNode();
    editorDomNode.style.setProperty("--vscode-colorPicker-colorDecoratorWidth", `${ColorDetector.colorDecoratorInnerWidthInEm}em`);
    editorDomNode.style.setProperty("--vscode-colorPicker-colorDecoratorMargin", `${ColorDetector.colorDecoratorMarginInEm}em`);
    this._register(toDisposable(() => {
      editorDomNode.style.removeProperty("--vscode-colorPicker-colorDecoratorWidth");
      editorDomNode.style.removeProperty("--vscode-colorPicker-colorDecoratorMargin");
    }));
    this._debounceInformation = languageFeatureDebounceService.for(_languageFeaturesService.colorProvider, "Document Colors", { min: ColorDetector.RECOMPUTE_TIME });
    this._register(_editor.onDidChangeModel(() => {
      this._isColorDecoratorsEnabled = this.isEnabled();
      this.updateColors();
    }));
    this._register(_editor.onDidChangeModelLanguage(() => this.updateColors()));
    this._register(_languageFeaturesService.colorProvider.onDidChange(() => this.updateColors()));
    this._register(_editor.onDidChangeConfiguration((e4) => {
      const prevIsEnabled = this._isColorDecoratorsEnabled;
      this._isColorDecoratorsEnabled = this.isEnabled();
      this._defaultColorDecoratorsEnablement = this._editor.getOption(167 /* defaultColorDecorators */);
      const updatedColorDecoratorsSetting = prevIsEnabled !== this._isColorDecoratorsEnabled || e4.hasChanged(27 /* colorDecoratorsLimit */);
      const updatedDefaultColorDecoratorsSetting = e4.hasChanged(167 /* defaultColorDecorators */);
      if (updatedColorDecoratorsSetting || updatedDefaultColorDecoratorsSetting) {
        if (this._isColorDecoratorsEnabled) {
          this.updateColors();
        } else {
          this.removeAllDecorations();
        }
      }
    }));
    this._timeoutTimer = null;
    this._computePromise = null;
    this._isColorDecoratorsEnabled = this.isEnabled();
    this._defaultColorDecoratorsEnablement = this._editor.getOption(167 /* defaultColorDecorators */);
    this.updateColors();
  }
  static {
    this.ID = "editor.contrib.colorDetector";
  }
  static {
    this.RECOMPUTE_TIME = 1e3;
  }
  static {
    this.colorDecoratorInnerWidthInEm = 0.8;
  }
  static {
    this.colorDecoratorMarginInEm = 0.2;
  }
  isEnabled() {
    const model = this._editor.getModel();
    if (!model) {
      return false;
    }
    const languageId = model.getLanguageId();
    const deprecatedConfig = this._configurationService.getValue(languageId);
    if (deprecatedConfig && typeof deprecatedConfig === "object") {
      const colorDecorators = deprecatedConfig["colorDecorators"];
      if (colorDecorators && colorDecorators["enable"] !== void 0 && !colorDecorators["enable"]) {
        return colorDecorators["enable"];
      }
    }
    return this._editor.getOption(26 /* colorDecorators */);
  }
  get limitReporter() {
    return this._decoratorLimitReporter;
  }
  static get(editor) {
    return editor.getContribution(this.ID);
  }
  dispose() {
    this.stop();
    this.removeAllDecorations();
    super.dispose();
  }
  updateColors() {
    this.stop();
    if (!this._isColorDecoratorsEnabled) {
      this.removeAllDecorations();
      return;
    }
    const model = this._editor.getModel();
    if (!model || !this._languageFeaturesService.colorProvider.has(model)) {
      return;
    }
    this._localToDispose.add(this._editor.onDidChangeModelContent(() => {
      if (!this._timeoutTimer) {
        this._timeoutTimer = new TimeoutTimer();
        this._timeoutTimer.cancelAndSet(() => {
          this._timeoutTimer = null;
          this.beginCompute();
        }, this._debounceInformation.get(model));
      }
    }));
    this.beginCompute();
  }
  async beginCompute() {
    this._computePromise = createCancelablePromise(async (token) => {
      const model = this._editor.getModel();
      if (!model) {
        return [];
      }
      const sw = new StopWatch(false);
      const colors = await getColors(this._languageFeaturesService.colorProvider, model, token, this._defaultColorDecoratorsEnablement);
      this._debounceInformation.update(model, sw.elapsed());
      return colors;
    });
    try {
      const colors = await this._computePromise;
      this.updateDecorations(colors);
      this.updateColorDecorators(colors);
      this._computePromise = null;
    } catch (e4) {
      onUnexpectedError(e4);
    }
  }
  stop() {
    if (this._timeoutTimer) {
      this._timeoutTimer.cancel();
      this._timeoutTimer = null;
    }
    if (this._computePromise) {
      this._computePromise.cancel();
      this._computePromise = null;
    }
    this._localToDispose.clear();
  }
  updateDecorations(colorDatas) {
    const decorations = colorDatas.map((c) => ({
      range: {
        startLineNumber: c.colorInfo.range.startLineNumber,
        startColumn: c.colorInfo.range.startColumn,
        endLineNumber: c.colorInfo.range.endLineNumber,
        endColumn: c.colorInfo.range.endColumn
      },
      options: ModelDecorationOptions.EMPTY
    }));
    this._editor.changeDecorations((changeAccessor) => {
      this._decorationsIds = changeAccessor.deltaDecorations(this._decorationsIds, decorations);
      this._colorDatas = /* @__PURE__ */ new Map();
      this._decorationsIds.forEach((id2, i2) => this._colorDatas.set(id2, colorDatas[i2]));
    });
  }
  updateColorDecorators(colorData) {
    this._colorDecorationClassRefs.clear();
    const decorations = [];
    const widthInEm = ColorDetector.colorDecoratorInnerWidthInEm + 2 * ColorDetector.colorDecoratorMarginInEm;
    const limit = this._editor.getOption(27 /* colorDecoratorsLimit */);
    for (let i2 = 0; i2 < colorData.length && decorations.length < limit; i2++) {
      const { red, green, blue, alpha } = colorData[i2].colorInfo.color;
      const rgba = new RGBA(Math.round(red * 255), Math.round(green * 255), Math.round(blue * 255), alpha);
      const color2 = `rgba(${rgba.r}, ${rgba.g}, ${rgba.b}, ${rgba.a})`;
      const ref = this._colorDecorationClassRefs.add(
        this._ruleFactory.createClassNameRef({
          backgroundColor: color2
        })
      );
      decorations.push({
        range: {
          startLineNumber: colorData[i2].colorInfo.range.startLineNumber,
          startColumn: colorData[i2].colorInfo.range.startColumn,
          endLineNumber: colorData[i2].colorInfo.range.endLineNumber,
          endColumn: colorData[i2].colorInfo.range.endColumn
        },
        options: {
          description: "colorDetector",
          before: {
            content: noBreakWhitespace,
            inlineClassName: `${ref.className} colorpicker-color-decoration`,
            inlineClassNameAffectsLetterSpacing: true,
            attachedData: ColorDecorationInjectedTextMarker,
            widthInEm
          }
        }
      });
    }
    const limited = limit < colorData.length ? limit : false;
    this._decoratorLimitReporter.update(colorData.length, limited);
    this._colorDecoratorIds.set(decorations);
  }
  removeAllDecorations() {
    this._editor.removeDecorations(this._decorationsIds);
    this._decorationsIds = [];
    this._colorDecoratorIds.clear();
    this._colorDecorationClassRefs.clear();
  }
  getColorData(position2) {
    const model = this._editor.getModel();
    if (!model) {
      return null;
    }
    const decorations = model.getDecorationsInRange(Range2.fromPositions(position2, position2)).filter((d) => this._colorDatas.has(d.id));
    if (decorations.length === 0) {
      return null;
    }
    return this._colorDatas.get(decorations[0].id);
  }
  isColorDecoration(decoration3) {
    return this._colorDecoratorIds.has(decoration3);
  }
};

ColorDetector = __decorateClass([
  __decorateParam(1, IConfigurationService),
  __decorateParam(2, ILanguageFeaturesService),
  __decorateParam(3, ILanguageFeatureDebounceService)
], ColorDetector);

var DecoratorLimitReporter = class extends Disposable {
  constructor() {
    super(...arguments);
    this._onDidChange = this._register(new Emitter());
    this.onDidChange = this._onDidChange.event;
    this._computed = 0;
    this._limited = false;
  }
  get computed() {
    return this._computed;
  }
  get limited() {
    return this._limited;
  }
  update(computed, limited) {
    if (computed !== this._computed || limited !== this._limited) {
      this._computed = computed;
      this._limited = limited;
      this._onDidChange.fire();
    }
  }
};
export { ColorDecorationInjectedTextMarker, ColorDetector, DecoratorLimitReporter };
