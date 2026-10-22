// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/browser/services/abstractCodeEditorService.ts
import { Disposable, DisposableMap, DisposableStore, toDisposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { LinkedList } from "./module-0013.mjs";
import { createCSSRule, createStyleSheet, removeCSSRulesContainingSelector } from "./module-0224.mjs";
import { isInShadowDOM } from "./module-0075.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IThemeService } from "./module-0287.mjs";
import { format2 } from "./module-0030.mjs";
import { asCSSUrl } from "./module-0449.mjs";
import { URI } from "./module-0032.mjs";
import { isThemeColor } from "./module-0153.mjs";


// src/vs/editor/browser/services/abstractCodeEditorService.ts
var AbstractCodeEditorService = class extends Disposable {
  constructor(_themeService) {
    super();
    this._themeService = _themeService;
    this._onWillCreateCodeEditor = this._register(new Emitter());
    this.onWillCreateCodeEditor = this._onWillCreateCodeEditor.event;
    this._onCodeEditorAdd = this._register(new Emitter());
    this.onCodeEditorAdd = this._onCodeEditorAdd.event;
    this._onCodeEditorRemove = this._register(new Emitter());
    this.onCodeEditorRemove = this._onCodeEditorRemove.event;
    this._onWillCreateDiffEditor = this._register(new Emitter());
    this.onWillCreateDiffEditor = this._onWillCreateDiffEditor.event;
    this._onDiffEditorAdd = this._register(new Emitter());
    this.onDiffEditorAdd = this._onDiffEditorAdd.event;
    this._onDiffEditorRemove = this._register(new Emitter());
    this.onDiffEditorRemove = this._onDiffEditorRemove.event;
    this._onDidChangeTransientModelProperty = this._register(new Emitter());
    this.onDidChangeTransientModelProperty = this._onDidChangeTransientModelProperty.event;
    this._onDecorationTypeRegistered = this._register(new Emitter());
    this.onDecorationTypeRegistered = this._onDecorationTypeRegistered.event;
    this._decorationOptionProviders = /* @__PURE__ */ new Map();
    this._editorStyleSheets = /* @__PURE__ */ new Map();
    this._codeEditorOpenHandlers = new LinkedList();
    this._transientWatchers = this._register(new DisposableMap());
    this._modelProperties = /* @__PURE__ */ new Map();
    this._codeEditors = /* @__PURE__ */ Object.create(null);
    this._diffEditors = /* @__PURE__ */ Object.create(null);
    this._globalStyleSheet = null;
  }
  willCreateCodeEditor() {
    this._onWillCreateCodeEditor.fire();
  }
  addCodeEditor(editor) {
    this._codeEditors[editor.getId()] = editor;
    this._onCodeEditorAdd.fire(editor);
  }
  removeCodeEditor(editor) {
    if (delete this._codeEditors[editor.getId()]) {
      this._onCodeEditorRemove.fire(editor);
    }
  }
  listCodeEditors() {
    return Object.keys(this._codeEditors).map((id2) => this._codeEditors[id2]);
  }
  willCreateDiffEditor() {
    this._onWillCreateDiffEditor.fire();
  }
  addDiffEditor(editor) {
    this._diffEditors[editor.getId()] = editor;
    this._onDiffEditorAdd.fire(editor);
  }
  removeDiffEditor(editor) {
    if (delete this._diffEditors[editor.getId()]) {
      this._onDiffEditorRemove.fire(editor);
    }
  }
  listDiffEditors() {
    return Object.keys(this._diffEditors).map((id2) => this._diffEditors[id2]);
  }
  getFocusedCodeEditor() {
    let editorWithWidgetFocus = null;
    const editors = this.listCodeEditors();
    for (const editor of editors) {
      if (editor.hasTextFocus()) {
        return editor;
      }
      if (editor.hasWidgetFocus()) {
        editorWithWidgetFocus = editor;
      }
    }
    return editorWithWidgetFocus;
  }
  _getOrCreateGlobalStyleSheet() {
    if (!this._globalStyleSheet) {
      this._globalStyleSheet = this._createGlobalStyleSheet();
    }
    return this._globalStyleSheet;
  }
  _createGlobalStyleSheet() {
    return new GlobalStyleSheet(createStyleSheet());
  }
  _getOrCreateStyleSheet(editor) {
    if (!editor) {
      return this._getOrCreateGlobalStyleSheet();
    }
    const domNode = editor.getContainerDomNode();
    if (!isInShadowDOM(domNode)) {
      return this._getOrCreateGlobalStyleSheet();
    }
    const editorId = editor.getId();
    if (!this._editorStyleSheets.has(editorId)) {
      const refCountedStyleSheet = new RefCountedStyleSheet(this, editorId, createStyleSheet(domNode));
      this._editorStyleSheets.set(editorId, refCountedStyleSheet);
    }
    return this._editorStyleSheets.get(editorId);
  }
  _removeEditorStyleSheets(editorId) {
    this._editorStyleSheets.delete(editorId);
  }
  registerDecorationType(description, key3, options3, parentTypeKey, editor) {
    let provider = this._decorationOptionProviders.get(key3);
    if (!provider) {
      const styleSheet = this._getOrCreateStyleSheet(editor);
      const providerArgs = {
        styleSheet,
        key: key3,
        parentTypeKey,
        options: options3 || /* @__PURE__ */ Object.create(null)
      };
      if (!parentTypeKey) {
        provider = new DecorationTypeOptionsProvider(description, this._themeService, styleSheet, providerArgs);
      } else {
        provider = new DecorationSubTypeOptionsProvider(this._themeService, styleSheet, providerArgs);
      }
      this._decorationOptionProviders.set(key3, provider);
      this._onDecorationTypeRegistered.fire(key3);
    }
    provider.refCount++;
    return {
      dispose: () => {
        this.removeDecorationType(key3);
      }
    };
  }
  listDecorationTypes() {
    return Array.from(this._decorationOptionProviders.keys());
  }
  removeDecorationType(key3) {
    const provider = this._decorationOptionProviders.get(key3);
    if (provider) {
      provider.refCount--;
      if (provider.refCount <= 0) {
        this._decorationOptionProviders.delete(key3);
        provider.dispose();
        this.listCodeEditors().forEach((ed) => ed.removeDecorationsByType(key3));
      }
    }
  }
  resolveDecorationOptions(decorationTypeKey, writable) {
    const provider = this._decorationOptionProviders.get(decorationTypeKey);
    if (!provider) {
      throw new Error("Unknown decoration type key: " + decorationTypeKey);
    }
    return provider.getOptions(this, writable);
  }
  resolveDecorationCSSRules(decorationTypeKey) {
    const provider = this._decorationOptionProviders.get(decorationTypeKey);
    if (!provider) {
      return null;
    }
    return provider.resolveDecorationCSSRules();
  }
  setModelProperty(resource, key3, value2) {
    const key1 = resource.toString();
    let dest;
    if (this._modelProperties.has(key1)) {
      dest = this._modelProperties.get(key1);
    } else {
      dest = /* @__PURE__ */ new Map();
      this._modelProperties.set(key1, dest);
    }
    dest.set(key3, value2);
  }
  getModelProperty(resource, key3) {
    const key1 = resource.toString();
    if (this._modelProperties.has(key1)) {
      const innerMap = this._modelProperties.get(key1);
      return innerMap.get(key3);
    }
    return void 0;
  }
  setTransientModelProperty(model, key3, value2) {
    const uri4 = model.uri.toString();
    let w = this._transientWatchers.get(uri4);
    if (!w) {
      w = new ModelTransientSettingWatcher(uri4, model, this);
      this._transientWatchers.set(uri4, w);
    }
    const previousValue = w.get(key3);
    if (previousValue !== value2) {
      w.set(key3, value2);
      this._onDidChangeTransientModelProperty.fire(model);
    }
  }
  getTransientModelProperty(model, key3) {
    const uri4 = model.uri.toString();
    const watcher = this._transientWatchers.get(uri4);
    if (!watcher) {
      return void 0;
    }
    return watcher.get(key3);
  }
  getTransientModelProperties(model) {
    const uri4 = model.uri.toString();
    const watcher = this._transientWatchers.get(uri4);
    if (!watcher) {
      return void 0;
    }
    return watcher.keys().map((key3) => [key3, watcher.get(key3)]);
  }
  _removeWatcher(w) {
    this._transientWatchers.deleteAndDispose(w.uri);
  }
  async openCodeEditor(input, source, sideBySide) {
    for (const handler of this._codeEditorOpenHandlers) {
      const candidate = await handler(input, source, sideBySide);
      if (candidate !== null) {
        return candidate;
      }
    }
    return null;
  }
  registerCodeEditorOpenHandler(handler) {
    const rm = this._codeEditorOpenHandlers.unshift(handler);
    return toDisposable(rm);
  }
};

AbstractCodeEditorService = __decorateClass([
  __decorateParam(0, IThemeService)
], AbstractCodeEditorService);

var ModelTransientSettingWatcher = class extends Disposable {
  constructor(uri4, model, owner) {
    super();
    this.uri = uri4;
    this._values = {};
    this._register(model.onWillDispose(() => owner._removeWatcher(this)));
  }
  set(key3, value2) {
    this._values[key3] = value2;
  }
  get(key3) {
    return this._values[key3];
  }
  keys() {
    return Object.keys(this._values);
  }
};

var RefCountedStyleSheet = class {
  get sheet() {
    return this._styleSheet.sheet;
  }
  constructor(parent, editorId, styleSheet) {
    this._parent = parent;
    this._editorId = editorId;
    this._styleSheet = styleSheet;
    this._refCount = 0;
  }
  ref() {
    this._refCount++;
  }
  unref() {
    this._refCount--;
    if (this._refCount === 0) {
      this._styleSheet.remove();
      this._parent._removeEditorStyleSheets(this._editorId);
    }
  }
  insertRule(selector, rule) {
    createCSSRule(selector, rule, this._styleSheet);
  }
  removeRulesContainingSelector(ruleName) {
    removeCSSRulesContainingSelector(ruleName, this._styleSheet);
  }
};

var GlobalStyleSheet = class {
  get sheet() {
    return this._styleSheet.sheet;
  }
  constructor(styleSheet) {
    this._styleSheet = styleSheet;
  }
  ref() {
  }
  unref() {
  }
  insertRule(selector, rule) {
    createCSSRule(selector, rule, this._styleSheet);
  }
  removeRulesContainingSelector(ruleName) {
    removeCSSRulesContainingSelector(ruleName, this._styleSheet);
  }
};

var DecorationSubTypeOptionsProvider = class {
  constructor(themeService, styleSheet, providerArgs) {
    this._styleSheet = styleSheet;
    this._styleSheet.ref();
    this._parentTypeKey = providerArgs.parentTypeKey;
    this.refCount = 0;
    this._beforeContentRules = new DecorationCSSRules(3 /* BeforeContentClassName */, providerArgs, themeService);
    this._afterContentRules = new DecorationCSSRules(4 /* AfterContentClassName */, providerArgs, themeService);
  }
  getOptions(codeEditorService, writable) {
    const options3 = codeEditorService.resolveDecorationOptions(this._parentTypeKey, true);
    if (this._beforeContentRules) {
      options3.beforeContentClassName = this._beforeContentRules.className;
    }
    if (this._afterContentRules) {
      options3.afterContentClassName = this._afterContentRules.className;
    }
    return options3;
  }
  resolveDecorationCSSRules() {
    return this._styleSheet.sheet.cssRules;
  }
  dispose() {
    if (this._beforeContentRules) {
      this._beforeContentRules.dispose();
      this._beforeContentRules = null;
    }
    if (this._afterContentRules) {
      this._afterContentRules.dispose();
      this._afterContentRules = null;
    }
    this._styleSheet.unref();
  }
};

var DecorationTypeOptionsProvider = class {
  constructor(description, themeService, styleSheet, providerArgs) {
    this._disposables = new DisposableStore();
    this.description = description;
    this._styleSheet = styleSheet;
    this._styleSheet.ref();
    this.refCount = 0;
    const createCSSRules = (type) => {
      const rules = new DecorationCSSRules(type, providerArgs, themeService);
      this._disposables.add(rules);
      if (rules.hasContent) {
        return rules.className;
      }
      return void 0;
    };
    const createInlineCSSRules = (type) => {
      const rules = new DecorationCSSRules(type, providerArgs, themeService);
      this._disposables.add(rules);
      if (rules.hasContent) {
        return { className: rules.className, hasLetterSpacing: rules.hasLetterSpacing };
      }
      return null;
    };
    this.className = createCSSRules(0 /* ClassName */);
    const inlineData = createInlineCSSRules(1 /* InlineClassName */);
    if (inlineData) {
      this.inlineClassName = inlineData.className;
      this.inlineClassNameAffectsLetterSpacing = inlineData.hasLetterSpacing;
    }
    this.beforeContentClassName = createCSSRules(3 /* BeforeContentClassName */);
    this.afterContentClassName = createCSSRules(4 /* AfterContentClassName */);
    if (providerArgs.options.beforeInjectedText && providerArgs.options.beforeInjectedText.contentText) {
      const beforeInlineData = createInlineCSSRules(5 /* BeforeInjectedTextClassName */);
      this.beforeInjectedText = {
        content: providerArgs.options.beforeInjectedText.contentText,
        inlineClassName: beforeInlineData?.className,
        inlineClassNameAffectsLetterSpacing: beforeInlineData?.hasLetterSpacing || providerArgs.options.beforeInjectedText.affectsLetterSpacing
      };
    }
    if (providerArgs.options.afterInjectedText && providerArgs.options.afterInjectedText.contentText) {
      const afterInlineData = createInlineCSSRules(6 /* AfterInjectedTextClassName */);
      this.afterInjectedText = {
        content: providerArgs.options.afterInjectedText.contentText,
        inlineClassName: afterInlineData?.className,
        inlineClassNameAffectsLetterSpacing: afterInlineData?.hasLetterSpacing || providerArgs.options.afterInjectedText.affectsLetterSpacing
      };
    }
    this.glyphMarginClassName = createCSSRules(2 /* GlyphMarginClassName */);
    const options3 = providerArgs.options;
    this.isWholeLine = Boolean(options3.isWholeLine);
    this.lineHeight = options3.lineHeight;
    this.fontFamily = options3.fontFamily;
    this.fontSize = options3.fontSize;
    this.fontWeight = options3.fontWeight;
    this.fontStyle = options3.fontStyle;
    this.stickiness = options3.rangeBehavior;
    const lightOverviewRulerColor = options3.light && options3.light.overviewRulerColor || options3.overviewRulerColor;
    const darkOverviewRulerColor = options3.dark && options3.dark.overviewRulerColor || options3.overviewRulerColor;
    if (typeof lightOverviewRulerColor !== "undefined" || typeof darkOverviewRulerColor !== "undefined") {
      this.overviewRuler = {
        color: lightOverviewRulerColor || darkOverviewRulerColor,
        darkColor: darkOverviewRulerColor || lightOverviewRulerColor,
        position: options3.overviewRulerLane || 2 /* Center */
      };
    }
  }
  getOptions(codeEditorService, writable) {
    if (!writable) {
      return this;
    }
    return {
      description: this.description,
      inlineClassName: this.inlineClassName,
      beforeContentClassName: this.beforeContentClassName,
      afterContentClassName: this.afterContentClassName,
      className: this.className,
      glyphMarginClassName: this.glyphMarginClassName,
      isWholeLine: this.isWholeLine,
      lineHeight: this.lineHeight,
      fontFamily: this.fontFamily,
      fontSize: this.fontSize,
      fontWeight: this.fontWeight,
      fontStyle: this.fontStyle,
      overviewRuler: this.overviewRuler,
      stickiness: this.stickiness,
      before: this.beforeInjectedText,
      after: this.afterInjectedText
    };
  }
  resolveDecorationCSSRules() {
    return this._styleSheet.sheet.rules;
  }
  dispose() {
    this._disposables.dispose();
    this._styleSheet.unref();
  }
};

var _CSS_MAP = {
  color: "color:{0} !important;",
  opacity: "opacity:{0};",
  backgroundColor: "background-color:{0};",
  outline: "outline:{0};",
  outlineColor: "outline-color:{0};",
  outlineStyle: "outline-style:{0};",
  outlineWidth: "outline-width:{0};",
  border: "border:{0};",
  borderColor: "border-color:{0};",
  borderRadius: "border-radius:{0};",
  borderSpacing: "border-spacing:{0};",
  borderStyle: "border-style:{0};",
  borderWidth: "border-width:{0};",
  fontStyle: "font-style:{0};",
  fontWeight: "font-weight:{0};",
  fontSize: "font-size:{0};",
  fontFamily: "font-family:{0};",
  textDecoration: "text-decoration:{0};",
  cursor: "cursor:{0};",
  letterSpacing: "letter-spacing:{0};",
  gutterIconPath: "background:{0} center center no-repeat;",
  gutterIconSize: "background-size:{0};",
  contentText: "content:'{0}';",
  contentIconPath: "content:{0};",
  margin: "margin:{0};",
  padding: "padding:{0};",
  width: "width:{0};",
  height: "height:{0};",
  verticalAlign: "vertical-align:{0};"
};

var DecorationCSSRules = class {
  constructor(ruleType, providerArgs, themeService) {
    this._theme = themeService.getColorTheme();
    this._ruleType = ruleType;
    this._providerArgs = providerArgs;
    this._usesThemeColors = false;
    this._hasContent = false;
    this._hasLetterSpacing = false;
    let className2 = CSSNameHelper.getClassName(this._providerArgs.key, ruleType);
    if (this._providerArgs.parentTypeKey) {
      className2 = className2 + " " + CSSNameHelper.getClassName(this._providerArgs.parentTypeKey, ruleType);
    }
    this._className = className2;
    this._unThemedSelector = CSSNameHelper.getSelector(this._providerArgs.key, this._providerArgs.parentTypeKey, ruleType);
    this._buildCSS();
    if (this._usesThemeColors) {
      this._themeListener = themeService.onDidColorThemeChange((theme) => {
        this._theme = themeService.getColorTheme();
        this._removeCSS();
        this._buildCSS();
      });
    } else {
      this._themeListener = null;
    }
  }
  dispose() {
    if (this._hasContent) {
      this._removeCSS();
      this._hasContent = false;
    }
    if (this._themeListener) {
      this._themeListener.dispose();
      this._themeListener = null;
    }
  }
  get hasContent() {
    return this._hasContent;
  }
  get hasLetterSpacing() {
    return this._hasLetterSpacing;
  }
  get className() {
    return this._className;
  }
  _buildCSS() {
    const options3 = this._providerArgs.options;
    let unthemedCSS, lightCSS, darkCSS;
    switch (this._ruleType) {
      case 0 /* ClassName */:
        unthemedCSS = this.getCSSTextForModelDecorationClassName(options3);
        lightCSS = this.getCSSTextForModelDecorationClassName(options3.light);
        darkCSS = this.getCSSTextForModelDecorationClassName(options3.dark);
        break;
      case 1 /* InlineClassName */:
        unthemedCSS = this.getCSSTextForModelDecorationInlineClassName(options3);
        lightCSS = this.getCSSTextForModelDecorationInlineClassName(options3.light);
        darkCSS = this.getCSSTextForModelDecorationInlineClassName(options3.dark);
        break;
      case 2 /* GlyphMarginClassName */:
        unthemedCSS = this.getCSSTextForModelDecorationGlyphMarginClassName(options3);
        lightCSS = this.getCSSTextForModelDecorationGlyphMarginClassName(options3.light);
        darkCSS = this.getCSSTextForModelDecorationGlyphMarginClassName(options3.dark);
        break;
      case 3 /* BeforeContentClassName */:
        unthemedCSS = this.getCSSTextForModelDecorationContentClassName(options3.before);
        lightCSS = this.getCSSTextForModelDecorationContentClassName(options3.light && options3.light.before);
        darkCSS = this.getCSSTextForModelDecorationContentClassName(options3.dark && options3.dark.before);
        break;
      case 4 /* AfterContentClassName */:
        unthemedCSS = this.getCSSTextForModelDecorationContentClassName(options3.after);
        lightCSS = this.getCSSTextForModelDecorationContentClassName(options3.light && options3.light.after);
        darkCSS = this.getCSSTextForModelDecorationContentClassName(options3.dark && options3.dark.after);
        break;
      case 5 /* BeforeInjectedTextClassName */:
        unthemedCSS = this.getCSSTextForModelDecorationContentClassName(options3.beforeInjectedText);
        lightCSS = this.getCSSTextForModelDecorationContentClassName(options3.light && options3.light.beforeInjectedText);
        darkCSS = this.getCSSTextForModelDecorationContentClassName(options3.dark && options3.dark.beforeInjectedText);
        break;
      case 6 /* AfterInjectedTextClassName */:
        unthemedCSS = this.getCSSTextForModelDecorationContentClassName(options3.afterInjectedText);
        lightCSS = this.getCSSTextForModelDecorationContentClassName(options3.light && options3.light.afterInjectedText);
        darkCSS = this.getCSSTextForModelDecorationContentClassName(options3.dark && options3.dark.afterInjectedText);
        break;
      default:
        throw new Error("Unknown rule type: " + this._ruleType);
    }
    const sheet = this._providerArgs.styleSheet;
    let hasContent = false;
    if (unthemedCSS.length > 0) {
      sheet.insertRule(this._unThemedSelector, unthemedCSS);
      hasContent = true;
    }
    if (lightCSS.length > 0) {
      sheet.insertRule(`.vs${this._unThemedSelector}, .hc-light${this._unThemedSelector}`, lightCSS);
      hasContent = true;
    }
    if (darkCSS.length > 0) {
      sheet.insertRule(`.vs-dark${this._unThemedSelector}, .hc-black${this._unThemedSelector}`, darkCSS);
      hasContent = true;
    }
    this._hasContent = hasContent;
  }
  _removeCSS() {
    this._providerArgs.styleSheet.removeRulesContainingSelector(this._unThemedSelector);
  }
  /**
   * Build the CSS for decorations styled via `className`.
   */
  getCSSTextForModelDecorationClassName(opts) {
    if (!opts) {
      return "";
    }
    const cssTextArr = [];
    this.collectCSSText(opts, ["backgroundColor"], cssTextArr);
    this.collectCSSText(opts, ["outline", "outlineColor", "outlineStyle", "outlineWidth"], cssTextArr);
    this.collectBorderSettingsCSSText(opts, cssTextArr);
    return cssTextArr.join("");
  }
  /**
   * Build the CSS for decorations styled via `inlineClassName`.
   */
  getCSSTextForModelDecorationInlineClassName(opts) {
    if (!opts) {
      return "";
    }
    const cssTextArr = [];
    this.collectCSSText(opts, ["fontStyle", "fontWeight", "fontFamily", "fontSize", "textDecoration", "cursor", "color", "opacity", "letterSpacing"], cssTextArr);
    if (opts.letterSpacing) {
      this._hasLetterSpacing = true;
    }
    return cssTextArr.join("");
  }
  /**
   * Build the CSS for decorations styled before or after content.
   */
  getCSSTextForModelDecorationContentClassName(opts) {
    if (!opts) {
      return "";
    }
    const cssTextArr = [];
    if (typeof opts !== "undefined") {
      this.collectBorderSettingsCSSText(opts, cssTextArr);
      if (typeof opts.contentIconPath !== "undefined") {
        cssTextArr.push(format2(_CSS_MAP.contentIconPath, asCSSUrl(URI.revive(opts.contentIconPath))));
      }
      if (typeof opts.contentText === "string") {
        const truncated = opts.contentText.match(/^.*$/m)[0];
        const escaped = truncated.replace(/['\\]/g, "\\$&");
        cssTextArr.push(format2(_CSS_MAP.contentText, escaped));
      }
      this.collectCSSText(opts, ["verticalAlign", "fontStyle", "fontWeight", "fontSize", "fontFamily", "textDecoration", "color", "opacity", "backgroundColor", "margin", "padding"], cssTextArr);
      if (this.collectCSSText(opts, ["width", "height"], cssTextArr)) {
        cssTextArr.push("display:inline-block;");
      }
    }
    return cssTextArr.join("");
  }
  /**
   * Build the CSS for decorations styled via `glyphMarginClassName`.
   */
  getCSSTextForModelDecorationGlyphMarginClassName(opts) {
    if (!opts) {
      return "";
    }
    const cssTextArr = [];
    if (typeof opts.gutterIconPath !== "undefined") {
      cssTextArr.push(format2(_CSS_MAP.gutterIconPath, asCSSUrl(URI.revive(opts.gutterIconPath))));
      if (typeof opts.gutterIconSize !== "undefined") {
        cssTextArr.push(format2(_CSS_MAP.gutterIconSize, opts.gutterIconSize));
      }
    }
    return cssTextArr.join("");
  }
  collectBorderSettingsCSSText(opts, cssTextArr) {
    if (this.collectCSSText(opts, ["border", "borderColor", "borderRadius", "borderSpacing", "borderStyle", "borderWidth"], cssTextArr)) {
      cssTextArr.push(format2("box-sizing: border-box;"));
      return true;
    }
    return false;
  }
  collectCSSText(opts, properties, cssTextArr) {
    const lenBefore = cssTextArr.length;
    for (const property of properties) {
      const value2 = this.resolveValue(opts[property]);
      if (typeof value2 === "string") {
        cssTextArr.push(format2(_CSS_MAP[property], value2));
      }
    }
    return cssTextArr.length !== lenBefore;
  }
  resolveValue(value2) {
    if (isThemeColor(value2)) {
      this._usesThemeColors = true;
      const color2 = this._theme.getColor(value2.id);
      if (color2) {
        return color2.toString();
      }
      return "transparent";
    }
    return value2;
  }
};

var CSSNameHelper = class {
  static getClassName(key3, type) {
    return "ced-" + key3 + "-" + type;
  }
  static getSelector(key3, parentKey, ruleType) {
    let selector = ".monaco-editor ." + this.getClassName(key3, ruleType);
    if (parentKey) {
      selector = selector + "." + this.getClassName(parentKey, ruleType);
    }
    if (ruleType === 3 /* BeforeContentClassName */) {
      selector += "::before";
    } else if (ruleType === 4 /* AfterContentClassName */) {
      selector += "::after";
    }
    return selector;
  }
};
export { AbstractCodeEditorService, ModelTransientSettingWatcher, RefCountedStyleSheet, GlobalStyleSheet, DecorationSubTypeOptionsProvider, DecorationTypeOptionsProvider, _CSS_MAP, DecorationCSSRules, CSSNameHelper };
