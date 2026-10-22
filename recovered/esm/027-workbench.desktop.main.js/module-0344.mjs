// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/browser/gpu/viewGpuContext.ts
import { Disposable } from "./module-0012.mjs";
import { createFastDomNode } from "./module-0212.mjs";
import { Event2 } from "./module-0017.mjs";
import { ensureNonNullable, observeDevicePixelDimensions } from "./module-0329.mjs";
import { GPULifecycle } from "./module-0337.mjs";
import { localize } from "./module-0001.mjs";
import { INotificationService, Severity2 } from "./module-0336.mjs";
import { TextureAtlas } from "./module-0335.mjs";
import { observableValue } from "./module-0048.mjs";
import { addDisposableListener, getActiveWindow } from "./module-0075.mjs";
import { runOnChange } from "./module-0064.mjs";
import { RectangleRenderer } from "./module-0341.mjs";
import { DecorationCssRuleExtractor } from "./module-0342.mjs";
import { DecorationStyleCache } from "./module-0343.mjs";
import { BugIndicatingError } from "./module-0004.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IThemeService } from "./module-0287.mjs";
import { Color } from "./module-0197.mjs";


// src/vs/editor/browser/gpu/viewGpuContext.ts
var ViewGpuContext = class extends Disposable {
  constructor(context2, _instantiationService, _notificationService, configurationService, _themeService) {
    super();
    this._instantiationService = _instantiationService;
    this._notificationService = _notificationService;
    this.configurationService = configurationService;
    this._themeService = _themeService;
    /**
     * The hard cap for line columns rendered by the GPU renderer.
     */
    this.maxGpuCols = 2e3;
    this.canvas = createFastDomNode(document.createElement("canvas"));
    this.canvas.setClassName("editorCanvas");
    this._register(Event2.runAndSubscribe(configurationService.onDidChangeConfiguration, (e) => {
      if (!e || e.affectsConfiguration("editor.scrollbar.verticalScrollbarSize")) {
        const verticalScrollbarSize = configurationService.getValue("editor").scrollbar?.verticalScrollbarSize ?? 14;
        this.canvas.domNode.style.boxSizing = "border-box";
        this.canvas.domNode.style.paddingRight = `${verticalScrollbarSize}px`;
      }
    }));
    this.ctx = ensureNonNullable(this.canvas.domNode.getContext("webgpu"));
    if (!ViewGpuContext.device) {
      ViewGpuContext.device = GPULifecycle.requestDevice((message) => {
        const choices = [{
          label: localize(189, null),
          run: () => this.configurationService.updateValue("editor.experimentalGpuAcceleration", "off")
        }];
        this._notificationService.prompt(Severity2.Warning, message, choices);
      }).then((ref) => {
        ViewGpuContext.deviceSync = ref.object;
        if (!ViewGpuContext._atlas) {
          ViewGpuContext._atlas = this._instantiationService.createInstance(TextureAtlas, ref.object.limits.maxTextureDimension2D, void 0, ViewGpuContext.decorationStyleCache);
        }
        return ref.object;
      });
    }
    const dprObs = observableValue(this, getActiveWindow().devicePixelRatio);
    this._register(addDisposableListener(getActiveWindow(), "resize", () => {
      dprObs.set(getActiveWindow().devicePixelRatio, void 0);
    }));
    this.devicePixelRatio = dprObs;
    this._register(runOnChange(this.devicePixelRatio, () => ViewGpuContext.atlas?.clear()));
    this._register(this._themeService.onDidColorThemeChange(() => {
      ViewGpuContext.decorationCssRuleExtractor.clear();
      ViewGpuContext.atlas?.clear();
    }));
    const canvasDevicePixelDimensions = observableValue(this, { width: this.canvas.domNode.width, height: this.canvas.domNode.height });
    this._register(observeDevicePixelDimensions(
      this.canvas.domNode,
      getActiveWindow(),
      (width2, height) => {
        this.canvas.domNode.width = width2;
        this.canvas.domNode.height = height;
        canvasDevicePixelDimensions.set({ width: width2, height }, void 0);
      }
    ));
    this.canvasDevicePixelDimensions = canvasDevicePixelDimensions;
    const contentLeft = observableValue(this, 0);
    this._register(this.configurationService.onDidChangeConfiguration((e) => {
      contentLeft.set(context2.configuration.options.get(165 /* layoutInfo */).contentLeft, void 0);
    }));
    this.contentLeft = contentLeft;
    this.rectangleRenderer = this._register(this._instantiationService.createInstance(RectangleRenderer, context2, this.contentLeft, this.devicePixelRatio, this.canvas.domNode, this.ctx, ViewGpuContext.device));
  }
  static {
    this._decorationCssRuleExtractor = new DecorationCssRuleExtractor();
  }
  static get decorationCssRuleExtractor() {
    return ViewGpuContext._decorationCssRuleExtractor;
  }
  static {
    this._decorationStyleCache = new DecorationStyleCache();
  }
  static get decorationStyleCache() {
    return ViewGpuContext._decorationStyleCache;
  }
  /**
   * The shared texture atlas to use across all views.
   *
   * @throws if called before the GPU device is resolved
   */
  static get atlas() {
    if (!ViewGpuContext._atlas) {
      throw new BugIndicatingError("Cannot call ViewGpuContext.textureAtlas before device is resolved");
    }
    return ViewGpuContext._atlas;
  }
  /**
   * The shared texture atlas to use across all views. This is a convenience alias for
   * {@link ViewGpuContext.atlas}.
   *
   * @throws if called before the GPU device is resolved
   */
  get atlas() {
    return ViewGpuContext.atlas;
  }
  /**
   * This method determines which lines can be and are allowed to be rendered using the GPU
   * renderer. Eventually this should trend all lines, except maybe exceptional cases like
   * decorations that use class names.
   */
  canRender(options3, viewportData, lineNumber) {
    const data = viewportData.getViewLineRenderingData(lineNumber);
    if (data.containsRTL || data.maxColumn > this.maxGpuCols) {
      return false;
    }
    if (data.inlineDecorations.length > 0) {
      let supported3 = true;
      for (const decoration3 of data.inlineDecorations) {
        if (decoration3.type !== 0 /* Regular */) {
          supported3 = false;
          break;
        }
        const styleRules = ViewGpuContext._decorationCssRuleExtractor.getStyleRules(this.canvas.domNode, decoration3.inlineClassName);
        supported3 &&= styleRules.every((rule) => {
          if (rule.selectorText.includes(":")) {
            return false;
          }
          for (const r2 of rule.style) {
            if (!supportsCssRule(r2, rule.style)) {
              return false;
            }
          }
          return true;
        });
        if (!supported3) {
          break;
        }
      }
      return supported3;
    }
    return true;
  }
  /**
   * Like {@link canRender} but returns detailed information about why the line cannot be rendered.
   */
  canRenderDetailed(options3, viewportData, lineNumber) {
    const data = viewportData.getViewLineRenderingData(lineNumber);
    const reasons = [];
    if (data.containsRTL) {
      reasons.push("containsRTL");
    }
    if (data.maxColumn > this.maxGpuCols) {
      reasons.push("maxColumn > maxGpuCols");
    }
    if (data.inlineDecorations.length > 0) {
      let supported3 = true;
      const problemTypes = [];
      const problemSelectors = [];
      const problemRules = [];
      for (const decoration3 of data.inlineDecorations) {
        if (decoration3.type !== 0 /* Regular */) {
          problemTypes.push(decoration3.type);
          supported3 = false;
          continue;
        }
        const styleRules = ViewGpuContext._decorationCssRuleExtractor.getStyleRules(this.canvas.domNode, decoration3.inlineClassName);
        supported3 &&= styleRules.every((rule) => {
          if (rule.selectorText.includes(":")) {
            problemSelectors.push(rule.selectorText);
            return false;
          }
          for (const r2 of rule.style) {
            if (!supportsCssRule(r2, rule.style)) {
              problemRules.push(`${r2}: ${rule.style[r2]}`);
              return false;
            }
          }
          return true;
        });
        if (!supported3) {
          continue;
        }
      }
      if (problemTypes.length > 0) {
        reasons.push(`inlineDecorations with unsupported types (${problemTypes.map((e) => `\`${e}\``).join(", ")})`);
      }
      if (problemRules.length > 0) {
        reasons.push(`inlineDecorations with unsupported CSS rules (${problemRules.map((e) => `\`${e}\``).join(", ")})`);
      }
      if (problemSelectors.length > 0) {
        reasons.push(`inlineDecorations with unsupported CSS selectors (${problemSelectors.map((e) => `\`${e}\``).join(", ")})`);
      }
    }
    return reasons;
  }
};

ViewGpuContext = __decorateClass([
  __decorateParam(1, IInstantiationService),
  __decorateParam(2, INotificationService),
  __decorateParam(3, IConfigurationService),
  __decorateParam(4, IThemeService)
], ViewGpuContext);

var gpuSupportedDecorationCssRules = [
  "color",
  "font-weight",
  "opacity",
  "text-decoration",
  "text-decoration-color",
  "text-decoration-line",
  "text-decoration-style",
  "text-decoration-thickness"
];

function supportsCssRule(rule, style) {
  if (!gpuSupportedDecorationCssRules.includes(rule)) {
    return false;
  }
  switch (rule) {
    case "text-decoration":
    case "text-decoration-line": {
      const value2 = style.getPropertyValue(rule);
      return value2 === "line-through";
    }
    case "text-decoration-color": {
      const value2 = style.getPropertyValue(rule);
      if (/^var\(--[^,]+,\s*(?:initial|inherit)\)$/.test(value2)) {
        return true;
      }
      return Color.Format.CSS.parse(value2) !== null;
    }
    case "text-decoration-style": {
      const value2 = style.getPropertyValue(rule);
      return value2 === "initial";
    }
    case "text-decoration-thickness": {
      const value2 = style.getPropertyValue(rule);
      return value2 === "initial" || /^\d+(\.\d+)?px$/.test(value2);
    }
    default:
      return true;
  }
}
export { supportsCssRule, ViewGpuContext, gpuSupportedDecorationCssRules };
