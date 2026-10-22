// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/worker/extensionHostWorkerMain.js
// Original module marker: src/vs/editor/common/config/editorOptions.ts
import { equals } from "./module-0004.mjs";
import { localize } from "./module-0015.mjs";
import { isChrome, isEdge, isLinux, isMacintosh, isNative } from "./module-0016.mjs";
import { EDITOR_FONT_DEFAULTS, FONT_VARIATION_OFF, FONT_VARIATION_TRANSLATE, FontInfo } from "./module-0078.mjs";
import { equals3 } from "./module-0055.mjs";
import { EDITOR_MODEL_DEFAULTS } from "./module-0079.mjs";
import { USUAL_WORD_SEPARATORS } from "./module-0080.mjs";


// src/vs/editor/common/config/editorOptions.ts
var MINIMAP_GUTTER_WIDTH = 8;

var ComputeOptionsMemory = class {
  constructor() {
    this.stableMinimapLayoutInput = null;
    this.stableFitMaxMinimapScale = 0;
    this.stableFitRemainingWidth = 0;
  }
};

var BaseEditorOption = class {
  constructor(id2, name2, defaultValue, schema2) {
    this.id = id2;
    this.name = name2;
    this.defaultValue = defaultValue;
    this.schema = schema2;
  }
  applyUpdate(value, update) {
    return applyUpdate(value, update);
  }
  compute(env2, options2, value) {
    return value;
  }
};

var ApplyUpdateResult = class {
  constructor(newValue, didChange) {
    this.newValue = newValue;
    this.didChange = didChange;
  }
};

function applyUpdate(value, update) {
  if (typeof value !== "object" || typeof update !== "object" || !value || !update) {
    return new ApplyUpdateResult(update, value !== update);
  }
  if (Array.isArray(value) || Array.isArray(update)) {
    const arrayEquals2 = Array.isArray(value) && Array.isArray(update) && equals(value, update);
    return new ApplyUpdateResult(update, !arrayEquals2);
  }
  let didChange = false;
  for (const key in update) {
    if (update.hasOwnProperty(key)) {
      const result = applyUpdate(value[key], update[key]);
      if (result.didChange) {
        value[key] = result.newValue;
        didChange = true;
      }
    }
  }
  return new ApplyUpdateResult(value, didChange);
}

var ComputedEditorOption = class {
  constructor(id2, defaultValue) {
    this.schema = void 0;
    this.id = id2;
    this.name = "_never_";
    this.defaultValue = defaultValue;
  }
  applyUpdate(value, update) {
    return applyUpdate(value, update);
  }
  validate(input) {
    return this.defaultValue;
  }
};

var SimpleEditorOption = class {
  constructor(id2, name2, defaultValue, schema2) {
    this.id = id2;
    this.name = name2;
    this.defaultValue = defaultValue;
    this.schema = schema2;
  }
  applyUpdate(value, update) {
    return applyUpdate(value, update);
  }
  compute(env2, options2, value) {
    return value;
  }
};

function boolean(value, defaultValue) {
  if (typeof value === "undefined") {
    return defaultValue;
  }
  if (value === "false") {
    return false;
  }
  return Boolean(value);
}

var EditorBooleanOption = class extends SimpleEditorOption {
  constructor(id2, name2, defaultValue, schema2 = void 0) {
    if (typeof schema2 !== "undefined") {
      schema2.type = "boolean";
      schema2.default = defaultValue;
    }
    super(id2, name2, defaultValue, schema2);
  }
  validate(input) {
    return boolean(input, this.defaultValue);
  }
};

function clampedInt(value, defaultValue, minimum, maximum) {
  if (typeof value === "string") {
    value = parseInt(value, 10);
  }
  if (typeof value !== "number" || isNaN(value)) {
    return defaultValue;
  }
  let r2 = value;
  r2 = Math.max(minimum, r2);
  r2 = Math.min(maximum, r2);
  return r2 | 0;
}

var EditorIntOption = class _EditorIntOption extends SimpleEditorOption {
  static clampedInt(value, defaultValue, minimum, maximum) {
    return clampedInt(value, defaultValue, minimum, maximum);
  }
  constructor(id2, name2, defaultValue, minimum, maximum, schema2 = void 0) {
    if (typeof schema2 !== "undefined") {
      schema2.type = "integer";
      schema2.default = defaultValue;
      schema2.minimum = minimum;
      schema2.maximum = maximum;
    }
    super(id2, name2, defaultValue, schema2);
    this.minimum = minimum;
    this.maximum = maximum;
  }
  validate(input) {
    return _EditorIntOption.clampedInt(input, this.defaultValue, this.minimum, this.maximum);
  }
};

var EditorFloatOption = class _EditorFloatOption extends SimpleEditorOption {
  static clamp(n, min, max) {
    if (n < min) {
      return min;
    }
    if (n > max) {
      return max;
    }
    return n;
  }
  static float(value, defaultValue) {
    if (typeof value === "string") {
      value = parseFloat(value);
    }
    if (typeof value !== "number" || isNaN(value)) {
      return defaultValue;
    }
    return value;
  }
  constructor(id2, name2, defaultValue, validationFn, schema2, minimum, maximum) {
    if (typeof schema2 !== "undefined") {
      schema2.type = "number";
      schema2.default = defaultValue;
      schema2.minimum = minimum;
      schema2.maximum = maximum;
    }
    super(id2, name2, defaultValue, schema2);
    this.validationFn = validationFn;
    this.minimum = minimum;
    this.maximum = maximum;
  }
  validate(input) {
    return this.validationFn(_EditorFloatOption.float(input, this.defaultValue));
  }
};

var EditorStringOption = class _EditorStringOption extends SimpleEditorOption {
  static string(value, defaultValue) {
    if (typeof value !== "string") {
      return defaultValue;
    }
    return value;
  }
  constructor(id2, name2, defaultValue, schema2 = void 0) {
    if (typeof schema2 !== "undefined") {
      schema2.type = "string";
      schema2.default = defaultValue;
    }
    super(id2, name2, defaultValue, schema2);
  }
  validate(input) {
    return _EditorStringOption.string(input, this.defaultValue);
  }
};

function stringSet(value, defaultValue, allowedValues, renamedValues) {
  if (typeof value !== "string") {
    return defaultValue;
  }
  if (renamedValues && value in renamedValues) {
    return renamedValues[value];
  }
  if (allowedValues.indexOf(value) === -1) {
    return defaultValue;
  }
  return value;
}

var EditorStringEnumOption = class extends SimpleEditorOption {
  constructor(id2, name2, defaultValue, allowedValues, schema2 = void 0) {
    if (typeof schema2 !== "undefined") {
      schema2.type = "string";
      schema2.enum = allowedValues.slice(0);
      schema2.default = defaultValue;
    }
    super(id2, name2, defaultValue, schema2);
    this._allowedValues = allowedValues;
  }
  validate(input) {
    return stringSet(input, this.defaultValue, this._allowedValues);
  }
};

var EditorEnumOption = class extends BaseEditorOption {
  constructor(id2, name2, defaultValue, defaultStringValue, allowedValues, convert, schema2 = void 0) {
    if (typeof schema2 !== "undefined") {
      schema2.type = "string";
      schema2.enum = allowedValues;
      schema2.default = defaultStringValue;
    }
    super(id2, name2, defaultValue, schema2);
    this._allowedValues = allowedValues;
    this._convert = convert;
  }
  validate(input) {
    if (typeof input !== "string") {
      return this.defaultValue;
    }
    if (this._allowedValues.indexOf(input) === -1) {
      return this.defaultValue;
    }
    return this._convert(input);
  }
};

function _autoIndentFromString(autoIndent) {
  switch (autoIndent) {
    case "none":
      return 0 /* None */;
    case "keep":
      return 1 /* Keep */;
    case "brackets":
      return 2 /* Brackets */;
    case "advanced":
      return 3 /* Advanced */;
    case "full":
      return 4 /* Full */;
  }
}

var EditorAccessibilitySupport = class extends BaseEditorOption {
  constructor() {
    super(
      2 /* accessibilitySupport */,
      "accessibilitySupport",
      0 /* Unknown */,
      {
        type: "string",
        enum: ["auto", "on", "off"],
        enumDescriptions: [
          localize(329, null),
          localize(331, null),
          localize(330, null)
        ],
        default: "auto",
        tags: ["accessibility"],
        description: localize(328, null)
      }
    );
  }
  validate(input) {
    switch (input) {
      case "auto":
        return 0 /* Unknown */;
      case "off":
        return 1 /* Disabled */;
      case "on":
        return 2 /* Enabled */;
    }
    return this.defaultValue;
  }
  compute(env2, options2, value) {
    if (value === 0 /* Unknown */) {
      return env2.accessibilitySupport;
    }
    return value;
  }
};

var EditorComments = class extends BaseEditorOption {
  constructor() {
    const defaults = {
      insertSpace: true,
      ignoreEmptyLines: true
    };
    super(
      29 /* comments */,
      "comments",
      defaults,
      {
        "editor.comments.insertSpace": {
          type: "boolean",
          default: defaults.insertSpace,
          description: localize(359, null)
        },
        "editor.comments.ignoreEmptyLines": {
          type: "boolean",
          default: defaults.ignoreEmptyLines,
          description: localize(358, null)
        }
      }
    );
  }
  validate(_input) {
    if (!_input || typeof _input !== "object") {
      return this.defaultValue;
    }
    const input = _input;
    return {
      insertSpace: boolean(input.insertSpace, this.defaultValue.insertSpace),
      ignoreEmptyLines: boolean(input.ignoreEmptyLines, this.defaultValue.ignoreEmptyLines)
    };
  }
};

function cursorBlinkingStyleFromString(cursorBlinkingStyle) {
  switch (cursorBlinkingStyle) {
    case "blink":
      return 1 /* Blink */;
    case "smooth":
      return 2 /* Smooth */;
    case "phase":
      return 3 /* Phase */;
    case "expand":
      return 4 /* Expand */;
    case "solid":
      return 5 /* Solid */;
  }
}

var TextEditorCursorStyle = /* @__PURE__ */ ((TextEditorCursorStyle2) => {
  TextEditorCursorStyle2[TextEditorCursorStyle2["Line"] = 1] = "Line";
  TextEditorCursorStyle2[TextEditorCursorStyle2["Block"] = 2] = "Block";
  TextEditorCursorStyle2[TextEditorCursorStyle2["Underline"] = 3] = "Underline";
  TextEditorCursorStyle2[TextEditorCursorStyle2["LineThin"] = 4] = "LineThin";
  TextEditorCursorStyle2[TextEditorCursorStyle2["BlockOutline"] = 5] = "BlockOutline";
  TextEditorCursorStyle2[TextEditorCursorStyle2["UnderlineThin"] = 6] = "UnderlineThin";
  return TextEditorCursorStyle2;
})(TextEditorCursorStyle || {});

function cursorStyleFromString(cursorStyle) {
  switch (cursorStyle) {
    case "line":
      return 1 /* Line */;
    case "block":
      return 2 /* Block */;
    case "underline":
      return 3 /* Underline */;
    case "line-thin":
      return 4 /* LineThin */;
    case "block-outline":
      return 5 /* BlockOutline */;
    case "underline-thin":
      return 6 /* UnderlineThin */;
  }
}

var EditorClassName = class extends ComputedEditorOption {
  constructor() {
    super(162 /* editorClassName */, "");
  }
  compute(env2, options2, _) {
    const classNames = ["monaco-editor"];
    if (options2.get(48 /* extraEditorClassName */)) {
      classNames.push(options2.get(48 /* extraEditorClassName */));
    }
    if (env2.extraEditorClassName) {
      classNames.push(env2.extraEditorClassName);
    }
    if (options2.get(82 /* mouseStyle */) === "default") {
      classNames.push("mouse-default");
    } else if (options2.get(82 /* mouseStyle */) === "copy") {
      classNames.push("mouse-copy");
    }
    if (options2.get(127 /* showUnused */)) {
      classNames.push("showUnused");
    }
    if (options2.get(157 /* showDeprecated */)) {
      classNames.push("showDeprecated");
    }
    return classNames.join(" ");
  }
};

var EditorEmptySelectionClipboard = class extends EditorBooleanOption {
  constructor() {
    super(
      45 /* emptySelectionClipboard */,
      "emptySelectionClipboard",
      true,
      { description: localize(482, null) }
    );
  }
  compute(env2, options2, value) {
    return value && env2.emptySelectionClipboard;
  }
};

var EditorFind = class extends BaseEditorOption {
  constructor() {
    const defaults = {
      cursorMoveOnType: true,
      findOnType: true,
      seedSearchStringFromSelection: "always",
      autoFindInSelection: "never",
      globalFindClipboard: false,
      addExtraSpaceOnTop: true,
      loop: true,
      closeOnResult: false,
      history: "workspace",
      replaceHistory: "workspace"
    };
    super(
      50 /* find */,
      "find",
      defaults,
      {
        "editor.find.cursorMoveOnType": {
          type: "boolean",
          default: defaults.cursorMoveOnType,
          description: localize(495, null)
        },
        "editor.find.seedSearchStringFromSelection": {
          type: "string",
          enum: ["never", "always", "selection"],
          default: defaults.seedSearchStringFromSelection,
          enumDescriptions: [
            localize(418, null),
            localize(417, null),
            localize(419, null)
          ],
          description: localize(501, null)
        },
        "editor.find.autoFindInSelection": {
          type: "string",
          enum: ["never", "always", "multiline"],
          default: defaults.autoFindInSelection,
          enumDescriptions: [
            localize(412, null),
            localize(410, null),
            localize(411, null)
          ],
          description: localize(493, null)
        },
        "editor.find.globalFindClipboard": {
          type: "boolean",
          default: defaults.globalFindClipboard,
          description: localize(497, null),
          included: isMacintosh
        },
        "editor.find.addExtraSpaceOnTop": {
          type: "boolean",
          default: defaults.addExtraSpaceOnTop,
          description: localize(492, null)
        },
        "editor.find.loop": {
          type: "boolean",
          default: defaults.loop,
          description: localize(499, null)
        },
        "editor.find.closeOnResult": {
          type: "boolean",
          default: defaults.closeOnResult,
          description: localize(494, null)
        },
        "editor.find.history": {
          type: "string",
          enum: ["never", "workspace"],
          default: "workspace",
          enumDescriptions: [
            localize(413, null),
            localize(414, null)
          ],
          description: localize(498, null)
        },
        "editor.find.replaceHistory": {
          type: "string",
          enum: ["never", "workspace"],
          default: "workspace",
          enumDescriptions: [
            localize(415, null),
            localize(416, null)
          ],
          description: localize(500, null)
        },
        "editor.find.findOnType": {
          type: "boolean",
          default: defaults.findOnType,
          description: localize(496, null)
        }
      }
    );
  }
  validate(_input) {
    if (!_input || typeof _input !== "object") {
      return this.defaultValue;
    }
    const input = _input;
    return {
      cursorMoveOnType: boolean(input.cursorMoveOnType, this.defaultValue.cursorMoveOnType),
      findOnType: boolean(input.findOnType, this.defaultValue.findOnType),
      seedSearchStringFromSelection: typeof input.seedSearchStringFromSelection === "boolean" ? input.seedSearchStringFromSelection ? "always" : "never" : stringSet(input.seedSearchStringFromSelection, this.defaultValue.seedSearchStringFromSelection, ["never", "always", "selection"]),
      autoFindInSelection: typeof input.autoFindInSelection === "boolean" ? input.autoFindInSelection ? "always" : "never" : stringSet(input.autoFindInSelection, this.defaultValue.autoFindInSelection, ["never", "always", "multiline"]),
      globalFindClipboard: boolean(input.globalFindClipboard, this.defaultValue.globalFindClipboard),
      addExtraSpaceOnTop: boolean(input.addExtraSpaceOnTop, this.defaultValue.addExtraSpaceOnTop),
      loop: boolean(input.loop, this.defaultValue.loop),
      closeOnResult: boolean(input.closeOnResult, this.defaultValue.closeOnResult),
      history: stringSet(input.history, this.defaultValue.history, ["never", "workspace"]),
      replaceHistory: stringSet(input.replaceHistory, this.defaultValue.replaceHistory, ["never", "workspace"])
    };
  }
};

var EditorFontLigatures = class _EditorFontLigatures extends BaseEditorOption {
  static {
    this.OFF = '"liga" off, "calt" off';
  }
  static {
    this.ON = '"liga" on, "calt" on';
  }
  constructor() {
    super(
      60 /* fontLigatures */,
      "fontLigatures",
      _EditorFontLigatures.OFF,
      {
        anyOf: [
          {
            type: "boolean",
            description: localize(511, null)
          },
          {
            type: "string",
            description: localize(510, null)
          }
        ],
        description: localize(512, null),
        default: false
      }
    );
  }
  validate(input) {
    if (typeof input === "undefined") {
      return this.defaultValue;
    }
    if (typeof input === "string") {
      if (input === "false" || input.length === 0) {
        return _EditorFontLigatures.OFF;
      }
      if (input === "true") {
        return _EditorFontLigatures.ON;
      }
      return input;
    }
    if (Boolean(input)) {
      return _EditorFontLigatures.ON;
    }
    return _EditorFontLigatures.OFF;
  }
};

var EditorFontVariations = class _EditorFontVariations extends BaseEditorOption {
  static {
    // Text is laid out using default settings.
    this.OFF = FONT_VARIATION_OFF;
  }
  static {
    // Translate `fontWeight` config to the `font-variation-settings` CSS property.
    this.TRANSLATE = FONT_VARIATION_TRANSLATE;
  }
  constructor() {
    super(
      63 /* fontVariations */,
      "fontVariations",
      _EditorFontVariations.OFF,
      {
        anyOf: [
          {
            type: "boolean",
            description: localize(514, null)
          },
          {
            type: "string",
            description: localize(515, null)
          }
        ],
        description: localize(516, null),
        default: false
      }
    );
  }
  validate(input) {
    if (typeof input === "undefined") {
      return this.defaultValue;
    }
    if (typeof input === "string") {
      if (input === "false") {
        return _EditorFontVariations.OFF;
      }
      if (input === "true") {
        return _EditorFontVariations.TRANSLATE;
      }
      return input;
    }
    if (Boolean(input)) {
      return _EditorFontVariations.TRANSLATE;
    }
    return _EditorFontVariations.OFF;
  }
  compute(env2, options2, value) {
    return env2.fontInfo.fontVariationSettings;
  }
};

var EditorFontInfo = class extends ComputedEditorOption {
  constructor() {
    super(59 /* fontInfo */, new FontInfo({
      pixelRatio: 0,
      fontFamily: "",
      fontWeight: "",
      fontSize: 0,
      fontFeatureSettings: "",
      fontVariationSettings: "",
      lineHeight: 0,
      letterSpacing: 0,
      isMonospace: false,
      typicalHalfwidthCharacterWidth: 0,
      typicalFullwidthCharacterWidth: 0,
      canUseHalfwidthRightwardsArrow: false,
      spaceWidth: 0,
      middotWidth: 0,
      wsmiddotWidth: 0,
      maxDigitWidth: 0
    }, false));
  }
  compute(env2, options2, _) {
    return env2.fontInfo;
  }
};

var EffectiveCursorStyle = class extends ComputedEditorOption {
  constructor() {
    super(161 /* effectiveCursorStyle */, 1 /* Line */);
  }
  compute(env2, options2, _) {
    return env2.inputMode === "overtype" ? options2.get(92 /* overtypeCursorStyle */) : options2.get(34 /* cursorStyle */);
  }
};

var EffectiveEditContextEnabled = class extends ComputedEditorOption {
  constructor() {
    super(170 /* effectiveEditContext */, false);
  }
  compute(env2, options2) {
    return env2.editContextSupported && options2.get(44 /* editContext */);
  }
};

var EffectiveAllowVariableFonts = class extends ComputedEditorOption {
  constructor() {
    super(172 /* effectiveAllowVariableFonts */, false);
  }
  compute(env2, options2) {
    const accessibilitySupport = env2.accessibilitySupport;
    if (accessibilitySupport === 2 /* Enabled */) {
      return options2.get(7 /* allowVariableFontsInAccessibilityMode */);
    } else {
      return options2.get(6 /* allowVariableFonts */);
    }
  }
};

var EditorFontSize = class extends SimpleEditorOption {
  constructor() {
    super(
      61 /* fontSize */,
      "fontSize",
      EDITOR_FONT_DEFAULTS.fontSize,
      {
        type: "number",
        minimum: 6,
        maximum: 100,
        default: EDITOR_FONT_DEFAULTS.fontSize,
        description: localize(513, null)
      }
    );
  }
  validate(input) {
    const r2 = EditorFloatOption.float(input, this.defaultValue);
    if (r2 === 0) {
      return EDITOR_FONT_DEFAULTS.fontSize;
    }
    return EditorFloatOption.clamp(r2, 6, 100);
  }
  compute(env2, options2, value) {
    return env2.fontInfo.fontSize;
  }
};

var EditorFontWeight = class _EditorFontWeight extends BaseEditorOption {
  static {
    this.SUGGESTION_VALUES = ["normal", "bold", "100", "200", "300", "400", "500", "600", "700", "800", "900"];
  }
  static {
    this.MINIMUM_VALUE = 1;
  }
  static {
    this.MAXIMUM_VALUE = 1e3;
  }
  constructor() {
    super(
      62 /* fontWeight */,
      "fontWeight",
      EDITOR_FONT_DEFAULTS.fontWeight,
      {
        anyOf: [
          {
            type: "number",
            minimum: _EditorFontWeight.MINIMUM_VALUE,
            maximum: _EditorFontWeight.MAXIMUM_VALUE,
            errorMessage: localize(518, null)
          },
          {
            type: "string",
            pattern: "^(normal|bold|1000|[1-9][0-9]{0,2})$"
          },
          {
            enum: _EditorFontWeight.SUGGESTION_VALUES
          }
        ],
        default: EDITOR_FONT_DEFAULTS.fontWeight,
        description: localize(517, null)
      }
    );
  }
  validate(input) {
    if (input === "normal" || input === "bold") {
      return input;
    }
    return String(EditorIntOption.clampedInt(input, EDITOR_FONT_DEFAULTS.fontWeight, _EditorFontWeight.MINIMUM_VALUE, _EditorFontWeight.MAXIMUM_VALUE));
  }
};

var EditorGoToLocation = class extends BaseEditorOption {
  constructor() {
    const defaults = {
      multiple: "peek",
      multipleDefinitions: "peek",
      multipleTypeDefinitions: "peek",
      multipleDeclarations: "peek",
      multipleImplementations: "peek",
      multipleReferences: "peek",
      multipleTests: "peek",
      alternativeDefinitionCommand: "editor.action.goToReferences",
      alternativeTypeDefinitionCommand: "editor.action.goToReferences",
      alternativeDeclarationCommand: "editor.action.goToReferences",
      alternativeImplementationCommand: "",
      alternativeReferenceCommand: "",
      alternativeTestsCommand: ""
    };
    const jsonSubset = {
      type: "string",
      enum: ["peek", "gotoAndPeek", "goto"],
      default: defaults.multiple,
      enumDescriptions: [
        localize(423, null),
        localize(422, null),
        localize(421, null)
      ]
    };
    const alternativeCommandOptions = ["", "editor.action.referenceSearch.trigger", "editor.action.goToReferences", "editor.action.peekImplementation", "editor.action.goToImplementation", "editor.action.peekTypeDefinition", "editor.action.goToTypeDefinition", "editor.action.peekDeclaration", "editor.action.revealDeclaration", "editor.action.peekDefinition", "editor.action.revealDefinitionAside", "editor.action.revealDefinition"];
    super(
      67 /* gotoLocation */,
      "gotoLocation",
      defaults,
      {
        "editor.gotoLocation.multiple": {
          deprecationMessage: localize(420, null)
        },
        "editor.gotoLocation.multipleDefinitions": {
          description: localize(406, null),
          ...jsonSubset
        },
        "editor.gotoLocation.multipleTypeDefinitions": {
          description: localize(409, null),
          ...jsonSubset
        },
        "editor.gotoLocation.multipleDeclarations": {
          description: localize(405, null),
          ...jsonSubset
        },
        "editor.gotoLocation.multipleImplementations": {
          description: localize(407, null),
          ...jsonSubset
        },
        "editor.gotoLocation.multipleReferences": {
          description: localize(408, null),
          ...jsonSubset
        },
        "editor.gotoLocation.alternativeDefinitionCommand": {
          type: "string",
          default: defaults.alternativeDefinitionCommand,
          enum: alternativeCommandOptions,
          description: localize(336, null)
        },
        "editor.gotoLocation.alternativeTypeDefinitionCommand": {
          type: "string",
          default: defaults.alternativeTypeDefinitionCommand,
          enum: alternativeCommandOptions,
          description: localize(339, null)
        },
        "editor.gotoLocation.alternativeDeclarationCommand": {
          type: "string",
          default: defaults.alternativeDeclarationCommand,
          enum: alternativeCommandOptions,
          description: localize(335, null)
        },
        "editor.gotoLocation.alternativeImplementationCommand": {
          type: "string",
          default: defaults.alternativeImplementationCommand,
          enum: alternativeCommandOptions,
          description: localize(337, null)
        },
        "editor.gotoLocation.alternativeReferenceCommand": {
          type: "string",
          default: defaults.alternativeReferenceCommand,
          enum: alternativeCommandOptions,
          description: localize(338, null)
        }
      }
    );
  }
  validate(_input) {
    if (!_input || typeof _input !== "object") {
      return this.defaultValue;
    }
    const input = _input;
    return {
      multiple: stringSet(input.multiple, this.defaultValue.multiple, ["peek", "gotoAndPeek", "goto"]),
      multipleDefinitions: stringSet(input.multipleDefinitions, "peek", ["peek", "gotoAndPeek", "goto"]),
      multipleTypeDefinitions: stringSet(input.multipleTypeDefinitions, "peek", ["peek", "gotoAndPeek", "goto"]),
      multipleDeclarations: stringSet(input.multipleDeclarations, "peek", ["peek", "gotoAndPeek", "goto"]),
      multipleImplementations: stringSet(input.multipleImplementations, "peek", ["peek", "gotoAndPeek", "goto"]),
      multipleReferences: stringSet(input.multipleReferences, "peek", ["peek", "gotoAndPeek", "goto"]),
      multipleTests: stringSet(input.multipleTests, "peek", ["peek", "gotoAndPeek", "goto"]),
      alternativeDefinitionCommand: EditorStringOption.string(input.alternativeDefinitionCommand, this.defaultValue.alternativeDefinitionCommand),
      alternativeTypeDefinitionCommand: EditorStringOption.string(input.alternativeTypeDefinitionCommand, this.defaultValue.alternativeTypeDefinitionCommand),
      alternativeDeclarationCommand: EditorStringOption.string(input.alternativeDeclarationCommand, this.defaultValue.alternativeDeclarationCommand),
      alternativeImplementationCommand: EditorStringOption.string(input.alternativeImplementationCommand, this.defaultValue.alternativeImplementationCommand),
      alternativeReferenceCommand: EditorStringOption.string(input.alternativeReferenceCommand, this.defaultValue.alternativeReferenceCommand),
      alternativeTestsCommand: EditorStringOption.string(input.alternativeTestsCommand, this.defaultValue.alternativeTestsCommand)
    };
  }
};

var EditorHover = class extends BaseEditorOption {
  constructor() {
    const defaults = {
      enabled: "on",
      delay: 300,
      hidingDelay: 300,
      sticky: true,
      above: true,
      showLongLineWarning: true
    };
    super(
      69 /* hover */,
      "hover",
      defaults,
      {
        "editor.hover.enabled": {
          type: "string",
          enum: ["on", "off", "onKeyboardModifier"],
          default: defaults.enabled,
          markdownEnumDescriptions: [
            localize(527, null),
            localize(526, null),
            localize(528, null, isMacintosh ? `Command` : `Control`)
          ],
          description: localize(525, null),
          keywords: ["hint", "info", "tooltip"]
        },
        "editor.hover.delay": {
          type: "number",
          default: defaults.delay,
          minimum: 0,
          maximum: 1e4,
          description: localize(524, null)
        },
        "editor.hover.sticky": {
          type: "boolean",
          default: defaults.sticky,
          description: localize(531, null)
        },
        "editor.hover.hidingDelay": {
          type: "integer",
          minimum: 0,
          default: defaults.hidingDelay,
          markdownDescription: localize(529, null)
        },
        "editor.hover.above": {
          type: "boolean",
          default: defaults.above,
          description: localize(523, null)
        },
        "editor.hover.showLongLineWarning": {
          type: "boolean",
          default: defaults.showLongLineWarning,
          description: localize(530, null)
        }
      }
    );
  }
  validate(_input) {
    if (!_input || typeof _input !== "object") {
      return this.defaultValue;
    }
    const input = _input;
    return {
      enabled: stringSet(input.enabled, this.defaultValue.enabled, ["on", "off", "onKeyboardModifier"]),
      delay: EditorIntOption.clampedInt(input.delay, this.defaultValue.delay, 0, 1e4),
      sticky: boolean(input.sticky, this.defaultValue.sticky),
      hidingDelay: EditorIntOption.clampedInt(input.hidingDelay, this.defaultValue.hidingDelay, 0, 6e5),
      above: boolean(input.above, this.defaultValue.above),
      showLongLineWarning: boolean(input.showLongLineWarning, this.defaultValue.showLongLineWarning)
    };
  }
};

var EditorLayoutInfoComputer = class _EditorLayoutInfoComputer extends ComputedEditorOption {
  constructor() {
    super(165 /* layoutInfo */, {
      width: 0,
      height: 0,
      glyphMarginLeft: 0,
      glyphMarginWidth: 0,
      glyphMarginDecorationLaneCount: 0,
      lineNumbersLeft: 0,
      lineNumbersWidth: 0,
      decorationsLeft: 0,
      decorationsWidth: 0,
      contentLeft: 0,
      contentWidth: 0,
      minimap: {
        renderMinimap: 0 /* None */,
        minimapLeft: 0,
        minimapWidth: 0,
        minimapHeightIsEditorHeight: false,
        minimapIsSampling: false,
        minimapScale: 1,
        minimapLineHeight: 1,
        minimapCanvasInnerWidth: 0,
        minimapCanvasInnerHeight: 0,
        minimapCanvasOuterWidth: 0,
        minimapCanvasOuterHeight: 0
      },
      viewportColumn: 0,
      isWordWrapMinified: false,
      isViewportWrapping: false,
      wrappingColumn: -1,
      verticalScrollbarWidth: 0,
      horizontalScrollbarHeight: 0,
      overviewRuler: {
        top: 0,
        width: 0,
        height: 0,
        right: 0
      }
    });
  }
  compute(env2, options2, _) {
    return _EditorLayoutInfoComputer.computeLayout(options2, {
      memory: env2.memory,
      outerWidth: env2.outerWidth,
      outerHeight: env2.outerHeight,
      isDominatedByLongLines: env2.isDominatedByLongLines,
      lineHeight: env2.fontInfo.lineHeight,
      viewLineCount: env2.viewLineCount,
      lineNumbersDigitCount: env2.lineNumbersDigitCount,
      typicalHalfwidthCharacterWidth: env2.fontInfo.typicalHalfwidthCharacterWidth,
      maxDigitWidth: env2.fontInfo.maxDigitWidth,
      pixelRatio: env2.pixelRatio,
      glyphMarginDecorationLaneCount: env2.glyphMarginDecorationLaneCount
    });
  }
  static computeContainedMinimapLineCount(input) {
    const typicalViewportLineCount = input.height / input.lineHeight;
    const extraLinesBeforeFirstLine = Math.floor(input.paddingTop / input.lineHeight);
    let extraLinesBeyondLastLine = Math.floor(input.paddingBottom / input.lineHeight);
    if (input.scrollBeyondLastLine) {
      extraLinesBeyondLastLine = Math.max(extraLinesBeyondLastLine, typicalViewportLineCount - 1);
    }
    const desiredRatio = (extraLinesBeforeFirstLine + input.viewLineCount + extraLinesBeyondLastLine) / (input.pixelRatio * input.height);
    const minimapLineCount = Math.floor(input.viewLineCount / desiredRatio);
    return { typicalViewportLineCount, extraLinesBeforeFirstLine, extraLinesBeyondLastLine, desiredRatio, minimapLineCount };
  }
  static _computeMinimapLayout(input, memory) {
    const outerWidth = input.outerWidth;
    const outerHeight = input.outerHeight;
    const pixelRatio = input.pixelRatio;
    if (!input.minimap.enabled) {
      return {
        renderMinimap: 0 /* None */,
        minimapLeft: 0,
        minimapWidth: 0,
        minimapHeightIsEditorHeight: false,
        minimapIsSampling: false,
        minimapScale: 1,
        minimapLineHeight: 1,
        minimapCanvasInnerWidth: 0,
        minimapCanvasInnerHeight: Math.floor(pixelRatio * outerHeight),
        minimapCanvasOuterWidth: 0,
        minimapCanvasOuterHeight: outerHeight
      };
    }
    const stableMinimapLayoutInput = memory.stableMinimapLayoutInput;
    const couldUseMemory = stableMinimapLayoutInput && input.outerHeight === stableMinimapLayoutInput.outerHeight && input.lineHeight === stableMinimapLayoutInput.lineHeight && input.typicalHalfwidthCharacterWidth === stableMinimapLayoutInput.typicalHalfwidthCharacterWidth && input.pixelRatio === stableMinimapLayoutInput.pixelRatio && input.scrollBeyondLastLine === stableMinimapLayoutInput.scrollBeyondLastLine && input.paddingTop === stableMinimapLayoutInput.paddingTop && input.paddingBottom === stableMinimapLayoutInput.paddingBottom && input.minimap.enabled === stableMinimapLayoutInput.minimap.enabled && input.minimap.side === stableMinimapLayoutInput.minimap.side && input.minimap.size === stableMinimapLayoutInput.minimap.size && input.minimap.showSlider === stableMinimapLayoutInput.minimap.showSlider && input.minimap.renderCharacters === stableMinimapLayoutInput.minimap.renderCharacters && input.minimap.maxColumn === stableMinimapLayoutInput.minimap.maxColumn && input.minimap.scale === stableMinimapLayoutInput.minimap.scale && input.verticalScrollbarWidth === stableMinimapLayoutInput.verticalScrollbarWidth && input.isViewportWrapping === stableMinimapLayoutInput.isViewportWrapping;
    const lineHeight = input.lineHeight;
    const typicalHalfwidthCharacterWidth = input.typicalHalfwidthCharacterWidth;
    const scrollBeyondLastLine = input.scrollBeyondLastLine;
    const minimapRenderCharacters = input.minimap.renderCharacters;
    let minimapScale = pixelRatio >= 2 ? Math.round(input.minimap.scale * 2) : input.minimap.scale;
    const minimapMaxColumn = input.minimap.maxColumn;
    const minimapSize = input.minimap.size;
    const minimapSide = input.minimap.side;
    const verticalScrollbarWidth = input.verticalScrollbarWidth;
    const viewLineCount = input.viewLineCount;
    const remainingWidth = input.remainingWidth;
    const isViewportWrapping = input.isViewportWrapping;
    const baseCharHeight = minimapRenderCharacters ? 2 : 3;
    let minimapCanvasInnerHeight = Math.floor(pixelRatio * outerHeight);
    const minimapCanvasOuterHeight = minimapCanvasInnerHeight / pixelRatio;
    let minimapHeightIsEditorHeight = false;
    let minimapIsSampling = false;
    let minimapLineHeight = baseCharHeight * minimapScale;
    let minimapCharWidth = minimapScale / pixelRatio;
    let minimapWidthMultiplier = 1;
    if (minimapSize === "fill" || minimapSize === "fit") {
      const { typicalViewportLineCount, extraLinesBeforeFirstLine, extraLinesBeyondLastLine, desiredRatio, minimapLineCount } = _EditorLayoutInfoComputer.computeContainedMinimapLineCount({
        viewLineCount,
        scrollBeyondLastLine,
        paddingTop: input.paddingTop,
        paddingBottom: input.paddingBottom,
        height: outerHeight,
        lineHeight,
        pixelRatio
      });
      const ratio = viewLineCount / minimapLineCount;
      if (ratio > 1) {
        minimapHeightIsEditorHeight = true;
        minimapIsSampling = true;
        minimapScale = 1;
        minimapLineHeight = 1;
        minimapCharWidth = minimapScale / pixelRatio;
      } else {
        let fitBecomesFill = false;
        let maxMinimapScale = minimapScale + 1;
        if (minimapSize === "fit") {
          const effectiveMinimapHeight = Math.ceil((extraLinesBeforeFirstLine + viewLineCount + extraLinesBeyondLastLine) * minimapLineHeight);
          if (isViewportWrapping && couldUseMemory && remainingWidth <= memory.stableFitRemainingWidth) {
            fitBecomesFill = true;
            maxMinimapScale = memory.stableFitMaxMinimapScale;
          } else {
            fitBecomesFill = effectiveMinimapHeight > minimapCanvasInnerHeight;
          }
        }
        if (minimapSize === "fill" || fitBecomesFill) {
          minimapHeightIsEditorHeight = true;
          const configuredMinimapScale = minimapScale;
          minimapLineHeight = Math.min(lineHeight * pixelRatio, Math.max(1, Math.floor(1 / desiredRatio)));
          if (isViewportWrapping && couldUseMemory && remainingWidth <= memory.stableFitRemainingWidth) {
            maxMinimapScale = memory.stableFitMaxMinimapScale;
          }
          minimapScale = Math.min(maxMinimapScale, Math.max(1, Math.floor(minimapLineHeight / baseCharHeight)));
          if (minimapScale > configuredMinimapScale) {
            minimapWidthMultiplier = Math.min(2, minimapScale / configuredMinimapScale);
          }
          minimapCharWidth = minimapScale / pixelRatio / minimapWidthMultiplier;
          minimapCanvasInnerHeight = Math.ceil(Math.max(typicalViewportLineCount, extraLinesBeforeFirstLine + viewLineCount + extraLinesBeyondLastLine) * minimapLineHeight);
          if (isViewportWrapping) {
            memory.stableMinimapLayoutInput = input;
            memory.stableFitRemainingWidth = remainingWidth;
            memory.stableFitMaxMinimapScale = minimapScale;
          } else {
            memory.stableMinimapLayoutInput = null;
            memory.stableFitRemainingWidth = 0;
          }
        }
      }
    }
    const minimapMaxWidth = Math.floor(minimapMaxColumn * minimapCharWidth);
    const minimapWidth = Math.min(minimapMaxWidth, Math.max(0, Math.floor((remainingWidth - verticalScrollbarWidth - 2) * minimapCharWidth / (typicalHalfwidthCharacterWidth + minimapCharWidth))) + MINIMAP_GUTTER_WIDTH);
    let minimapCanvasInnerWidth = Math.floor(pixelRatio * minimapWidth);
    const minimapCanvasOuterWidth = minimapCanvasInnerWidth / pixelRatio;
    minimapCanvasInnerWidth = Math.floor(minimapCanvasInnerWidth * minimapWidthMultiplier);
    const renderMinimap = minimapRenderCharacters ? 1 /* Text */ : 2 /* Blocks */;
    const minimapLeft = minimapSide === "left" ? 0 : outerWidth - minimapWidth - verticalScrollbarWidth;
    return {
      renderMinimap,
      minimapLeft,
      minimapWidth,
      minimapHeightIsEditorHeight,
      minimapIsSampling,
      minimapScale,
      minimapLineHeight,
      minimapCanvasInnerWidth,
      minimapCanvasInnerHeight,
      minimapCanvasOuterWidth,
      minimapCanvasOuterHeight
    };
  }
  static computeLayout(options2, env2) {
    const outerWidth = env2.outerWidth | 0;
    const outerHeight = env2.outerHeight | 0;
    const lineHeight = env2.lineHeight | 0;
    const lineNumbersDigitCount = env2.lineNumbersDigitCount | 0;
    const typicalHalfwidthCharacterWidth = env2.typicalHalfwidthCharacterWidth;
    const maxDigitWidth = env2.maxDigitWidth;
    const pixelRatio = env2.pixelRatio;
    const viewLineCount = env2.viewLineCount;
    const wordWrapOverride2 = options2.get(154 /* wordWrapOverride2 */);
    const wordWrapOverride1 = wordWrapOverride2 === "inherit" ? options2.get(153 /* wordWrapOverride1 */) : wordWrapOverride2;
    const wordWrap = wordWrapOverride1 === "inherit" ? options2.get(149 /* wordWrap */) : wordWrapOverride1;
    const wordWrapColumn = options2.get(152 /* wordWrapColumn */);
    const isDominatedByLongLines = env2.isDominatedByLongLines;
    const showGlyphMargin = options2.get(66 /* glyphMargin */);
    const showLineNumbers = options2.get(76 /* lineNumbers */).renderType !== 0 /* Off */;
    const lineNumbersMinChars = options2.get(77 /* lineNumbersMinChars */);
    const scrollBeyondLastLine = options2.get(119 /* scrollBeyondLastLine */);
    const padding = options2.get(96 /* padding */);
    const minimap = options2.get(81 /* minimap */);
    const scrollbar = options2.get(117 /* scrollbar */);
    const verticalScrollbarWidth = scrollbar.verticalScrollbarSize;
    const verticalScrollbarHasArrows = scrollbar.verticalHasArrows;
    const scrollbarArrowSize = scrollbar.arrowSize;
    const horizontalScrollbarHeight = scrollbar.horizontalScrollbarSize;
    const folding = options2.get(52 /* folding */);
    const showFoldingDecoration = options2.get(126 /* showFoldingControls */) !== "never";
    let lineDecorationsWidth = options2.get(74 /* lineDecorationsWidth */);
    if (folding && showFoldingDecoration) {
      lineDecorationsWidth += 16;
    }
    let lineNumbersWidth = 0;
    if (showLineNumbers) {
      const digitCount = Math.max(lineNumbersDigitCount, lineNumbersMinChars);
      lineNumbersWidth = Math.round(digitCount * maxDigitWidth);
    }
    let glyphMarginWidth = 0;
    if (showGlyphMargin) {
      glyphMarginWidth = lineHeight * env2.glyphMarginDecorationLaneCount;
    }
    let glyphMarginLeft = 0;
    let lineNumbersLeft = glyphMarginLeft + glyphMarginWidth;
    let decorationsLeft = lineNumbersLeft + lineNumbersWidth;
    let contentLeft = decorationsLeft + lineDecorationsWidth;
    const remainingWidth = outerWidth - glyphMarginWidth - lineNumbersWidth - lineDecorationsWidth;
    let isWordWrapMinified = false;
    let isViewportWrapping = false;
    let wrappingColumn = -1;
    if (options2.get(2 /* accessibilitySupport */) === 2 /* Enabled */ && wordWrapOverride1 === "inherit" && isDominatedByLongLines) {
      isWordWrapMinified = true;
      isViewportWrapping = true;
    } else if (wordWrap === "on" || wordWrap === "bounded") {
      isViewportWrapping = true;
    } else if (wordWrap === "wordWrapColumn") {
      wrappingColumn = wordWrapColumn;
    }
    const minimapLayout = _EditorLayoutInfoComputer._computeMinimapLayout({
      outerWidth,
      outerHeight,
      lineHeight,
      typicalHalfwidthCharacterWidth,
      pixelRatio,
      scrollBeyondLastLine,
      paddingTop: padding.top,
      paddingBottom: padding.bottom,
      minimap,
      verticalScrollbarWidth,
      viewLineCount,
      remainingWidth,
      isViewportWrapping
    }, env2.memory || new ComputeOptionsMemory());
    if (minimapLayout.renderMinimap !== 0 /* None */ && minimapLayout.minimapLeft === 0) {
      glyphMarginLeft += minimapLayout.minimapWidth;
      lineNumbersLeft += minimapLayout.minimapWidth;
      decorationsLeft += minimapLayout.minimapWidth;
      contentLeft += minimapLayout.minimapWidth;
    }
    const contentWidth = remainingWidth - minimapLayout.minimapWidth;
    const viewportColumn = Math.max(1, Math.floor((contentWidth - verticalScrollbarWidth - 2) / typicalHalfwidthCharacterWidth));
    const verticalArrowSize = verticalScrollbarHasArrows ? scrollbarArrowSize : 0;
    if (isViewportWrapping) {
      wrappingColumn = Math.max(1, viewportColumn);
      if (wordWrap === "bounded") {
        wrappingColumn = Math.min(wrappingColumn, wordWrapColumn);
      }
    }
    return {
      width: outerWidth,
      height: outerHeight,
      glyphMarginLeft,
      glyphMarginWidth,
      glyphMarginDecorationLaneCount: env2.glyphMarginDecorationLaneCount,
      lineNumbersLeft,
      lineNumbersWidth,
      decorationsLeft,
      decorationsWidth: lineDecorationsWidth,
      contentLeft,
      contentWidth,
      minimap: minimapLayout,
      viewportColumn,
      isWordWrapMinified,
      isViewportWrapping,
      wrappingColumn,
      verticalScrollbarWidth,
      horizontalScrollbarHeight,
      overviewRuler: {
        top: verticalArrowSize,
        width: verticalScrollbarWidth,
        height: outerHeight - 2 * verticalArrowSize,
        right: 0
      }
    };
  }
};

var WrappingStrategy = class extends BaseEditorOption {
  constructor() {
    super(
      156 /* wrappingStrategy */,
      "wrappingStrategy",
      "simple",
      {
        "editor.wrappingStrategy": {
          enumDescriptions: [
            localize(744, null),
            localize(743, null)
          ],
          type: "string",
          enum: ["simple", "advanced"],
          default: "simple",
          description: localize(742, null)
        }
      }
    );
  }
  validate(input) {
    return stringSet(input, "simple", ["simple", "advanced"]);
  }
  compute(env2, options2, value) {
    const accessibilitySupport = options2.get(2 /* accessibilitySupport */);
    if (accessibilitySupport === 2 /* Enabled */) {
      return "advanced";
    }
    return value;
  }
};

var EditorLightbulb = class extends BaseEditorOption {
  constructor() {
    const defaults = { enabled: "onCode" /* OnCode */ };
    super(
      73 /* lightbulb */,
      "lightbulb",
      defaults,
      {
        "editor.lightbulb.enabled": {
          type: "string",
          enum: ["off" /* Off */, "onCode" /* OnCode */, "on" /* On */],
          default: defaults.enabled,
          enumDescriptions: [
            localize(444, null),
            localize(446, null),
            localize(445, null)
          ],
          description: localize(483, null)
        }
      }
    );
  }
  validate(_input) {
    if (!_input || typeof _input !== "object") {
      return this.defaultValue;
    }
    const input = _input;
    return {
      enabled: stringSet(input.enabled, this.defaultValue.enabled, ["off" /* Off */, "onCode" /* OnCode */, "on" /* On */])
    };
  }
};

var EditorStickyScroll = class extends BaseEditorOption {
  constructor() {
    const defaults = { enabled: true, maxLineCount: 5, defaultModel: "outlineModel", scrollWithEditor: true };
    super(
      131 /* stickyScroll */,
      "stickyScroll",
      defaults,
      {
        "editor.stickyScroll.enabled": {
          type: "boolean",
          default: defaults.enabled,
          description: localize(448, null)
        },
        "editor.stickyScroll.maxLineCount": {
          type: "number",
          default: defaults.maxLineCount,
          minimum: 1,
          maximum: 20,
          description: localize(449, null)
        },
        "editor.stickyScroll.defaultModel": {
          type: "string",
          enum: ["outlineModel", "foldingProviderModel", "indentationModel"],
          default: defaults.defaultModel,
          description: localize(447, null)
        },
        "editor.stickyScroll.scrollWithEditor": {
          type: "boolean",
          default: defaults.scrollWithEditor,
          description: localize(450, null)
        }
      }
    );
  }
  validate(_input) {
    if (!_input || typeof _input !== "object") {
      return this.defaultValue;
    }
    const input = _input;
    return {
      enabled: boolean(input.enabled, this.defaultValue.enabled),
      maxLineCount: EditorIntOption.clampedInt(input.maxLineCount, this.defaultValue.maxLineCount, 1, 20),
      defaultModel: stringSet(input.defaultModel, this.defaultValue.defaultModel, ["outlineModel", "foldingProviderModel", "indentationModel"]),
      scrollWithEditor: boolean(input.scrollWithEditor, this.defaultValue.scrollWithEditor)
    };
  }
};

var EditorInlayHints = class extends BaseEditorOption {
  constructor() {
    const defaults = { enabled: "on", fontSize: 0, fontFamily: "", padding: false, maximumLength: 43 };
    super(
      159 /* inlayHints */,
      "inlayHints",
      defaults,
      {
        "editor.inlayHints.enabled": {
          type: "string",
          default: defaults.enabled,
          description: localize(533, null),
          enum: ["on", "onUnlessPressed", "offUnlessPressed", "off"],
          markdownEnumDescriptions: [
            localize(440, null),
            localize(441, null, isMacintosh ? `Ctrl+Option` : `Ctrl+Alt`),
            localize(439, null, isMacintosh ? `Ctrl+Option` : `Ctrl+Alt`),
            localize(438, null)
          ]
        },
        "editor.inlayHints.fontSize": {
          type: "number",
          default: defaults.fontSize,
          markdownDescription: localize(535, null, "`#editor.fontSize#`", "`5`")
        },
        "editor.inlayHints.fontFamily": {
          type: "string",
          default: defaults.fontFamily,
          markdownDescription: localize(534, null, "`#editor.fontFamily#`")
        },
        "editor.inlayHints.padding": {
          type: "boolean",
          default: defaults.padding,
          description: localize(537, null)
        },
        "editor.inlayHints.maximumLength": {
          type: "number",
          default: defaults.maximumLength,
          markdownDescription: localize(536, null)
        }
      }
    );
  }
  validate(_input) {
    if (!_input || typeof _input !== "object") {
      return this.defaultValue;
    }
    const input = _input;
    if (typeof input.enabled === "boolean") {
      input.enabled = input.enabled ? "on" : "off";
    }
    return {
      enabled: stringSet(input.enabled, this.defaultValue.enabled, ["on", "off", "offUnlessPressed", "onUnlessPressed"]),
      fontSize: EditorIntOption.clampedInt(input.fontSize, this.defaultValue.fontSize, 0, 100),
      fontFamily: EditorStringOption.string(input.fontFamily, this.defaultValue.fontFamily),
      padding: boolean(input.padding, this.defaultValue.padding),
      maximumLength: EditorIntOption.clampedInt(input.maximumLength, this.defaultValue.maximumLength, 0, Number.MAX_SAFE_INTEGER)
    };
  }
};

var EditorLineDecorationsWidth = class extends BaseEditorOption {
  constructor() {
    super(74 /* lineDecorationsWidth */, "lineDecorationsWidth", 10);
  }
  validate(input) {
    if (typeof input === "string" && /^\d+(\.\d+)?ch$/.test(input)) {
      const multiple = parseFloat(input.substring(0, input.length - 2));
      return -multiple;
    } else {
      return EditorIntOption.clampedInt(input, this.defaultValue, 0, 1e3);
    }
  }
  compute(env2, options2, value) {
    if (value < 0) {
      return EditorIntOption.clampedInt(-value * env2.fontInfo.typicalHalfwidthCharacterWidth, this.defaultValue, 0, 1e3);
    } else {
      return value;
    }
  }
};

var EditorLineHeight = class extends EditorFloatOption {
  constructor() {
    super(
      75 /* lineHeight */,
      "lineHeight",
      EDITOR_FONT_DEFAULTS.lineHeight,
      (x) => EditorFloatOption.clamp(x, 0, 150),
      { markdownDescription: localize(560, null) },
      0,
      150
    );
  }
  compute(env2, options2, value) {
    return env2.fontInfo.lineHeight;
  }
};

var EditorMinimap = class extends BaseEditorOption {
  constructor() {
    const defaults = {
      enabled: true,
      size: "proportional",
      side: "right",
      showSlider: "mouseover",
      autohide: "none",
      renderCharacters: true,
      maxColumn: 120,
      scale: 1,
      showRegionSectionHeaders: true,
      showMarkSectionHeaders: true,
      markSectionHeaderRegex: "\\bMARK:\\s*(?<separator>-?)\\s*(?<label>.*)$",
      sectionHeaderFontSize: 9,
      sectionHeaderLetterSpacing: 1
    };
    super(
      81 /* minimap */,
      "minimap",
      defaults,
      {
        "editor.minimap.enabled": {
          type: "boolean",
          default: defaults.enabled,
          description: localize(573, null)
        },
        "editor.minimap.autohide": {
          type: "string",
          enum: ["none", "mouseover", "scroll"],
          enumDescriptions: [
            localize(571, null),
            localize(570, null),
            localize(572, null)
          ],
          default: defaults.autohide,
          description: localize(569, null)
        },
        "editor.minimap.size": {
          type: "string",
          enum: ["proportional", "fill", "fit"],
          enumDescriptions: [
            localize(587, null),
            localize(585, null),
            localize(586, null)
          ],
          default: defaults.size,
          description: localize(584, null)
        },
        "editor.minimap.side": {
          type: "string",
          enum: ["left", "right"],
          default: defaults.side,
          description: localize(583, null)
        },
        "editor.minimap.showSlider": {
          type: "string",
          enum: ["always", "mouseover"],
          default: defaults.showSlider,
          description: localize(582, null)
        },
        "editor.minimap.scale": {
          type: "number",
          default: defaults.scale,
          minimum: 1,
          maximum: 3,
          enum: [1, 2, 3],
          description: localize(577, null)
        },
        "editor.minimap.renderCharacters": {
          type: "boolean",
          default: defaults.renderCharacters,
          description: localize(576, null)
        },
        "editor.minimap.maxColumn": {
          type: "number",
          default: defaults.maxColumn,
          description: localize(575, null)
        },
        "editor.minimap.showRegionSectionHeaders": {
          type: "boolean",
          default: defaults.showRegionSectionHeaders,
          description: localize(581, null)
        },
        "editor.minimap.showMarkSectionHeaders": {
          type: "boolean",
          default: defaults.showMarkSectionHeaders,
          description: localize(580, null)
        },
        "editor.minimap.markSectionHeaderRegex": {
          type: "string",
          default: defaults.markSectionHeaderRegex,
          description: localize(574, null)
        },
        "editor.minimap.sectionHeaderFontSize": {
          type: "number",
          default: defaults.sectionHeaderFontSize,
          description: localize(578, null)
        },
        "editor.minimap.sectionHeaderLetterSpacing": {
          type: "number",
          default: defaults.sectionHeaderLetterSpacing,
          description: localize(579, null)
        }
      }
    );
  }
  validate(_input) {
    if (!_input || typeof _input !== "object") {
      return this.defaultValue;
    }
    const input = _input;
    let markSectionHeaderRegex = this.defaultValue.markSectionHeaderRegex;
    const inputRegex = input.markSectionHeaderRegex;
    if (typeof inputRegex === "string") {
      try {
        new RegExp(inputRegex, "d");
        markSectionHeaderRegex = inputRegex;
      } catch {
      }
    }
    return {
      enabled: boolean(input.enabled, this.defaultValue.enabled),
      autohide: stringSet(input.autohide, this.defaultValue.autohide, ["none", "mouseover", "scroll"]),
      size: stringSet(input.size, this.defaultValue.size, ["proportional", "fill", "fit"]),
      side: stringSet(input.side, this.defaultValue.side, ["right", "left"]),
      showSlider: stringSet(input.showSlider, this.defaultValue.showSlider, ["always", "mouseover"]),
      renderCharacters: boolean(input.renderCharacters, this.defaultValue.renderCharacters),
      scale: EditorIntOption.clampedInt(input.scale, 1, 1, 3),
      maxColumn: EditorIntOption.clampedInt(input.maxColumn, this.defaultValue.maxColumn, 1, 1e4),
      showRegionSectionHeaders: boolean(input.showRegionSectionHeaders, this.defaultValue.showRegionSectionHeaders),
      showMarkSectionHeaders: boolean(input.showMarkSectionHeaders, this.defaultValue.showMarkSectionHeaders),
      markSectionHeaderRegex,
      sectionHeaderFontSize: EditorFloatOption.clamp(EditorFloatOption.float(input.sectionHeaderFontSize, this.defaultValue.sectionHeaderFontSize), 4, 32),
      sectionHeaderLetterSpacing: EditorFloatOption.clamp(EditorFloatOption.float(input.sectionHeaderLetterSpacing, this.defaultValue.sectionHeaderLetterSpacing), 0, 5)
    };
  }
};

function _multiCursorModifierFromString(multiCursorModifier) {
  if (multiCursorModifier === "ctrlCmd") {
    return isMacintosh ? "metaKey" : "ctrlKey";
  }
  return "altKey";
}

var EditorPadding = class extends BaseEditorOption {
  constructor() {
    super(
      96 /* padding */,
      "padding",
      { top: 0, bottom: 0 },
      {
        "editor.padding.top": {
          type: "number",
          default: 0,
          minimum: 0,
          maximum: 1e3,
          description: localize(612, null)
        },
        "editor.padding.bottom": {
          type: "number",
          default: 0,
          minimum: 0,
          maximum: 1e3,
          description: localize(611, null)
        }
      }
    );
  }
  validate(_input) {
    if (!_input || typeof _input !== "object") {
      return this.defaultValue;
    }
    const input = _input;
    return {
      top: EditorIntOption.clampedInt(input.top, 0, 0, 1e3),
      bottom: EditorIntOption.clampedInt(input.bottom, 0, 0, 1e3)
    };
  }
};

var EditorParameterHints = class extends BaseEditorOption {
  constructor() {
    const defaults = {
      enabled: true,
      cycle: true
    };
    super(
      98 /* parameterHints */,
      "parameterHints",
      defaults,
      {
        "editor.parameterHints.enabled": {
          type: "boolean",
          default: defaults.enabled,
          description: localize(614, null)
        },
        "editor.parameterHints.cycle": {
          type: "boolean",
          default: defaults.cycle,
          description: localize(613, null)
        }
      }
    );
  }
  validate(_input) {
    if (!_input || typeof _input !== "object") {
      return this.defaultValue;
    }
    const input = _input;
    return {
      enabled: boolean(input.enabled, this.defaultValue.enabled),
      cycle: boolean(input.cycle, this.defaultValue.cycle)
    };
  }
};

var EditorPixelRatio = class extends ComputedEditorOption {
  constructor() {
    super(163 /* pixelRatio */, 1);
  }
  compute(env2, options2, _) {
    return env2.pixelRatio;
  }
};

var PlaceholderOption = class extends BaseEditorOption {
  constructor() {
    super(100 /* placeholder */, "placeholder", void 0);
  }
  validate(input) {
    if (typeof input === "undefined") {
      return this.defaultValue;
    }
    if (typeof input === "string") {
      return input;
    }
    return this.defaultValue;
  }
};

var EditorQuickSuggestions = class extends BaseEditorOption {
  constructor() {
    const defaults = {
      other: "offWhenInlineCompletions",
      comments: "off",
      strings: "off"
    };
    const types = [
      { type: "boolean" },
      {
        type: "string",
        enum: ["on", "inline", "off", "offWhenInlineCompletions"],
        enumDescriptions: [localize(607, null), localize(538, null), localize(605, null), localize(606, null)]
      }
    ];
    super(102 /* quickSuggestions */, "quickSuggestions", defaults, {
      anyOf: [
        { type: "boolean" },
        {
          type: "string",
          enum: ["on", "inline", "off", "offWhenInlineCompletions"],
          enumDescriptions: [localize(629, null), localize(626, null), localize(627, null), localize(628, null)]
        },
        {
          type: "object",
          additionalProperties: false,
          properties: {
            strings: {
              anyOf: types,
              default: defaults.strings,
              description: localize(625, null)
            },
            comments: {
              anyOf: types,
              default: defaults.comments,
              description: localize(623, null)
            },
            other: {
              anyOf: types,
              default: defaults.other,
              description: localize(624, null)
            }
          }
        }
      ],
      default: defaults,
      markdownDescription: localize(622, null, "`#editor.suggestOnTriggerCharacters#`"),
      experiment: {
        mode: "auto"
      }
    });
    this.defaultValue = defaults;
  }
  validate(input) {
    if (typeof input === "boolean") {
      const value = input ? "on" : "off";
      return { comments: value, strings: value, other: value };
    }
    if (typeof input === "string") {
      const allowedValues2 = ["on", "inline", "off", "offWhenInlineCompletions"];
      const validated = stringSet(input, this.defaultValue.other, allowedValues2);
      return { comments: validated, strings: validated, other: validated };
    }
    if (!input || typeof input !== "object") {
      return this.defaultValue;
    }
    const { other, comments, strings } = input;
    const allowedValues = ["on", "inline", "off", "offWhenInlineCompletions"];
    let validatedOther;
    let validatedComments;
    let validatedStrings;
    if (typeof other === "boolean") {
      validatedOther = other ? "on" : "off";
    } else {
      validatedOther = stringSet(other, this.defaultValue.other, allowedValues);
    }
    if (typeof comments === "boolean") {
      validatedComments = comments ? "on" : "off";
    } else {
      validatedComments = stringSet(comments, this.defaultValue.comments, allowedValues);
    }
    if (typeof strings === "boolean") {
      validatedStrings = strings ? "on" : "off";
    } else {
      validatedStrings = stringSet(strings, this.defaultValue.strings, allowedValues);
    }
    return {
      other: validatedOther,
      comments: validatedComments,
      strings: validatedStrings
    };
  }
};

var EditorRenderLineNumbersOption = class extends BaseEditorOption {
  constructor() {
    super(
      76 /* lineNumbers */,
      "lineNumbers",
      { renderType: 1 /* On */, renderFn: null },
      {
        type: "string",
        enum: ["off", "on", "relative", "interval"],
        enumDescriptions: [
          localize(563, null),
          localize(564, null),
          localize(565, null),
          localize(562, null)
        ],
        default: "on",
        description: localize(561, null)
      }
    );
  }
  validate(lineNumbers) {
    let renderType = this.defaultValue.renderType;
    let renderFn = this.defaultValue.renderFn;
    if (typeof lineNumbers !== "undefined") {
      if (typeof lineNumbers === "function") {
        renderType = 4 /* Custom */;
        renderFn = lineNumbers;
      } else if (lineNumbers === "interval") {
        renderType = 3 /* Interval */;
      } else if (lineNumbers === "relative") {
        renderType = 2 /* Relative */;
      } else if (lineNumbers === "on") {
        renderType = 1 /* On */;
      } else {
        renderType = 0 /* Off */;
      }
    }
    return {
      renderType,
      renderFn
    };
  }
};

var EditorRulers = class extends BaseEditorOption {
  constructor() {
    const defaults = [];
    const columnSchema = { type: "number", description: localize(646, null) };
    super(
      116 /* rulers */,
      "rulers",
      defaults,
      {
        type: "array",
        items: {
          anyOf: [
            columnSchema,
            {
              type: [
                "object"
              ],
              properties: {
                column: columnSchema,
                color: {
                  type: "string",
                  description: localize(645, null),
                  format: "color-hex"
                }
              }
            }
          ]
        },
        default: defaults,
        description: localize(644, null)
      }
    );
  }
  validate(input) {
    if (Array.isArray(input)) {
      const rulers = [];
      for (const _element of input) {
        if (typeof _element === "number") {
          rulers.push({
            column: EditorIntOption.clampedInt(_element, 0, 0, 1e4),
            color: null
          });
        } else if (_element && typeof _element === "object") {
          const element = _element;
          rulers.push({
            column: EditorIntOption.clampedInt(element.column, 0, 0, 1e4),
            color: element.color
          });
        }
      }
      rulers.sort((a, b) => a.column - b.column);
      return rulers;
    }
    return this.defaultValue;
  }
};

var ReadonlyMessage = class extends BaseEditorOption {
  constructor() {
    const defaults = void 0;
    super(
      105 /* readOnlyMessage */,
      "readOnlyMessage",
      defaults
    );
  }
  validate(_input) {
    if (!_input || typeof _input !== "object") {
      return this.defaultValue;
    }
    return _input;
  }
};

function _scrollbarVisibilityFromString(visibility, defaultValue) {
  if (typeof visibility !== "string") {
    return defaultValue;
  }
  switch (visibility) {
    case "hidden":
      return 2 /* Hidden */;
    case "visible":
      return 3 /* Visible */;
    default:
      return 1 /* Auto */;
  }
}

var EditorScrollbar = class extends BaseEditorOption {
  constructor() {
    const defaults = {
      vertical: 1 /* Auto */,
      horizontal: 1 /* Auto */,
      arrowSize: 11,
      useShadows: true,
      verticalHasArrows: false,
      horizontalHasArrows: false,
      horizontalScrollbarSize: 12,
      horizontalSliderSize: 12,
      verticalScrollbarSize: 14,
      verticalSliderSize: 14,
      handleMouseWheel: true,
      alwaysConsumeMouseWheel: true,
      scrollByPage: false,
      ignoreHorizontalScrollbarInContentHeight: false
    };
    super(
      117 /* scrollbar */,
      "scrollbar",
      defaults,
      {
        "editor.scrollbar.vertical": {
          type: "string",
          enum: ["auto", "visible", "hidden"],
          enumDescriptions: [
            localize(656, null),
            localize(658, null),
            localize(657, null)
          ],
          default: "auto",
          description: localize(655, null)
        },
        "editor.scrollbar.horizontal": {
          type: "string",
          enum: ["auto", "visible", "hidden"],
          enumDescriptions: [
            localize(649, null),
            localize(651, null),
            localize(650, null)
          ],
          default: "auto",
          description: localize(648, null)
        },
        "editor.scrollbar.verticalScrollbarSize": {
          type: "number",
          default: defaults.verticalScrollbarSize,
          description: localize(659, null)
        },
        "editor.scrollbar.horizontalScrollbarSize": {
          type: "number",
          default: defaults.horizontalScrollbarSize,
          description: localize(652, null)
        },
        "editor.scrollbar.scrollByPage": {
          type: "boolean",
          default: defaults.scrollByPage,
          description: localize(654, null)
        },
        "editor.scrollbar.ignoreHorizontalScrollbarInContentHeight": {
          type: "boolean",
          default: defaults.ignoreHorizontalScrollbarInContentHeight,
          description: localize(653, null)
        }
      }
    );
  }
  validate(_input) {
    if (!_input || typeof _input !== "object") {
      return this.defaultValue;
    }
    const input = _input;
    const horizontalScrollbarSize = EditorIntOption.clampedInt(input.horizontalScrollbarSize, this.defaultValue.horizontalScrollbarSize, 0, 1e3);
    const verticalScrollbarSize = EditorIntOption.clampedInt(input.verticalScrollbarSize, this.defaultValue.verticalScrollbarSize, 0, 1e3);
    return {
      arrowSize: EditorIntOption.clampedInt(input.arrowSize, this.defaultValue.arrowSize, 0, 1e3),
      vertical: _scrollbarVisibilityFromString(input.vertical, this.defaultValue.vertical),
      horizontal: _scrollbarVisibilityFromString(input.horizontal, this.defaultValue.horizontal),
      useShadows: boolean(input.useShadows, this.defaultValue.useShadows),
      verticalHasArrows: boolean(input.verticalHasArrows, this.defaultValue.verticalHasArrows),
      horizontalHasArrows: boolean(input.horizontalHasArrows, this.defaultValue.horizontalHasArrows),
      handleMouseWheel: boolean(input.handleMouseWheel, this.defaultValue.handleMouseWheel),
      alwaysConsumeMouseWheel: boolean(input.alwaysConsumeMouseWheel, this.defaultValue.alwaysConsumeMouseWheel),
      horizontalScrollbarSize,
      horizontalSliderSize: EditorIntOption.clampedInt(input.horizontalSliderSize, horizontalScrollbarSize, 0, 1e3),
      verticalScrollbarSize,
      verticalSliderSize: EditorIntOption.clampedInt(input.verticalSliderSize, verticalScrollbarSize, 0, 1e3),
      scrollByPage: boolean(input.scrollByPage, this.defaultValue.scrollByPage),
      ignoreHorizontalScrollbarInContentHeight: boolean(input.ignoreHorizontalScrollbarInContentHeight, this.defaultValue.ignoreHorizontalScrollbarInContentHeight)
    };
  }
};

var inUntrustedWorkspace = "inUntrustedWorkspace";

var unicodeHighlightConfigKeys = {
  allowedCharacters: "editor.unicodeHighlight.allowedCharacters",
  invisibleCharacters: "editor.unicodeHighlight.invisibleCharacters",
  nonBasicASCII: "editor.unicodeHighlight.nonBasicASCII",
  ambiguousCharacters: "editor.unicodeHighlight.ambiguousCharacters",
  includeComments: "editor.unicodeHighlight.includeComments",
  includeStrings: "editor.unicodeHighlight.includeStrings",
  allowedLocales: "editor.unicodeHighlight.allowedLocales"
};

var UnicodeHighlight = class extends BaseEditorOption {
  constructor() {
    const defaults = {
      nonBasicASCII: inUntrustedWorkspace,
      invisibleCharacters: true,
      ambiguousCharacters: true,
      includeComments: inUntrustedWorkspace,
      includeStrings: true,
      allowedCharacters: {},
      allowedLocales: { _os: true, _vscode: true }
    };
    super(
      142 /* unicodeHighlighting */,
      "unicodeHighlight",
      defaults,
      {
        [unicodeHighlightConfigKeys.nonBasicASCII]: {
          restricted: true,
          type: ["boolean", "string"],
          enum: [true, false, inUntrustedWorkspace],
          default: defaults.nonBasicASCII,
          description: localize(719, null)
        },
        [unicodeHighlightConfigKeys.invisibleCharacters]: {
          restricted: true,
          type: "boolean",
          default: defaults.invisibleCharacters,
          description: localize(718, null)
        },
        [unicodeHighlightConfigKeys.ambiguousCharacters]: {
          restricted: true,
          type: "boolean",
          default: defaults.ambiguousCharacters,
          description: localize(715, null)
        },
        [unicodeHighlightConfigKeys.includeComments]: {
          restricted: true,
          type: ["boolean", "string"],
          enum: [true, false, inUntrustedWorkspace],
          default: defaults.includeComments,
          description: localize(716, null)
        },
        [unicodeHighlightConfigKeys.includeStrings]: {
          restricted: true,
          type: ["boolean", "string"],
          enum: [true, false, inUntrustedWorkspace],
          default: defaults.includeStrings,
          description: localize(717, null)
        },
        [unicodeHighlightConfigKeys.allowedCharacters]: {
          restricted: true,
          type: "object",
          default: defaults.allowedCharacters,
          description: localize(713, null),
          additionalProperties: {
            type: "boolean"
          }
        },
        [unicodeHighlightConfigKeys.allowedLocales]: {
          restricted: true,
          type: "object",
          additionalProperties: {
            type: "boolean"
          },
          default: defaults.allowedLocales,
          description: localize(714, null)
        }
      }
    );
  }
  applyUpdate(value, update) {
    let didChange = false;
    if (update.allowedCharacters && value) {
      if (!equals3(value.allowedCharacters, update.allowedCharacters)) {
        value = { ...value, allowedCharacters: update.allowedCharacters };
        didChange = true;
      }
    }
    if (update.allowedLocales && value) {
      if (!equals3(value.allowedLocales, update.allowedLocales)) {
        value = { ...value, allowedLocales: update.allowedLocales };
        didChange = true;
      }
    }
    const result = super.applyUpdate(value, update);
    if (didChange) {
      return new ApplyUpdateResult(result.newValue, true);
    }
    return result;
  }
  validate(_input) {
    if (!_input || typeof _input !== "object") {
      return this.defaultValue;
    }
    const input = _input;
    return {
      nonBasicASCII: primitiveSet(input.nonBasicASCII, inUntrustedWorkspace, [true, false, inUntrustedWorkspace]),
      invisibleCharacters: boolean(input.invisibleCharacters, this.defaultValue.invisibleCharacters),
      ambiguousCharacters: boolean(input.ambiguousCharacters, this.defaultValue.ambiguousCharacters),
      includeComments: primitiveSet(input.includeComments, inUntrustedWorkspace, [true, false, inUntrustedWorkspace]),
      includeStrings: primitiveSet(input.includeStrings, inUntrustedWorkspace, [true, false, inUntrustedWorkspace]),
      allowedCharacters: this.validateBooleanMap(input.allowedCharacters, this.defaultValue.allowedCharacters),
      allowedLocales: this.validateBooleanMap(input.allowedLocales, this.defaultValue.allowedLocales)
    };
  }
  validateBooleanMap(map, defaultValue) {
    if (typeof map !== "object" || !map) {
      return defaultValue;
    }
    const result = {};
    for (const [key, value] of Object.entries(map)) {
      if (value === true) {
        result[key] = true;
      }
    }
    return result;
  }
};

var InlineEditorSuggest = class extends BaseEditorOption {
  constructor() {
    const defaults = {
      enabled: true,
      mode: "subwordSmart",
      showToolbar: "onHover",
      suppressSuggestions: false,
      keepOnBlur: false,
      fontFamily: "default",
      syntaxHighlightingEnabled: true,
      minShowDelay: 0,
      suppressInSnippetMode: true,
      edits: {
        enabled: true,
        showCollapsed: false,
        renderSideBySide: "auto",
        allowCodeShifting: "always",
        showLongDistanceHint: true,
        longDistanceHintContextLineCount: 0
      },
      triggerCommandOnProviderChange: false,
      experimental: {
        suppressInlineSuggestions: "",
        showOnSuggestConflict: "never",
        emptyResponseInformation: true
      }
    };
    super(
      71 /* inlineSuggest */,
      "inlineSuggest",
      defaults,
      {
        "editor.inlineSuggest.enabled": {
          type: "boolean",
          default: defaults.enabled,
          description: localize(546, null)
        },
        "editor.inlineSuggest.showToolbar": {
          type: "string",
          default: defaults.showToolbar,
          enum: ["always", "onHover", "never"],
          enumDescriptions: [
            localize(551, null),
            localize(553, null),
            localize(552, null)
          ],
          description: localize(550, null)
        },
        "editor.inlineSuggest.syntaxHighlightingEnabled": {
          type: "boolean",
          default: defaults.syntaxHighlightingEnabled,
          description: localize(557, null)
        },
        "editor.inlineSuggest.suppressSuggestions": {
          type: "boolean",
          default: defaults.suppressSuggestions,
          description: localize(556, null)
        },
        "editor.inlineSuggest.suppressInSnippetMode": {
          type: "boolean",
          default: defaults.suppressInSnippetMode,
          description: localize(555, null)
        },
        "editor.inlineSuggest.minShowDelay": {
          type: "number",
          default: 0,
          minimum: 0,
          maximum: 1e4,
          description: localize(548, null)
        },
        "editor.inlineSuggest.experimental.suppressInlineSuggestions": {
          type: "string",
          default: defaults.experimental.suppressInlineSuggestions,
          tags: ["experimental"],
          description: localize(554, null),
          experiment: {
            mode: "auto"
          }
        },
        "editor.inlineSuggest.experimental.emptyResponseInformation": {
          type: "boolean",
          default: defaults.experimental.emptyResponseInformation,
          tags: ["experimental"],
          description: localize(545, null),
          experiment: {
            mode: "auto"
          }
        },
        "editor.inlineSuggest.triggerCommandOnProviderChange": {
          type: "boolean",
          default: defaults.triggerCommandOnProviderChange,
          tags: ["experimental"],
          description: localize(558, null),
          experiment: {
            mode: "auto"
          }
        },
        "editor.inlineSuggest.experimental.showOnSuggestConflict": {
          type: "string",
          default: defaults.experimental.showOnSuggestConflict,
          tags: ["experimental"],
          enum: ["always", "never", "whenSuggestListIsIncomplete"],
          description: localize(549, null),
          experiment: {
            mode: "auto"
          }
        },
        "editor.inlineSuggest.fontFamily": {
          type: "string",
          default: defaults.fontFamily,
          description: localize(547, null)
        },
        "editor.inlineSuggest.edits.allowCodeShifting": {
          type: "string",
          default: defaults.edits.allowCodeShifting,
          description: localize(540, null),
          enum: ["always", "horizontal", "never"],
          tags: ["nextEditSuggestions"]
        },
        "editor.inlineSuggest.edits.showLongDistanceHint": {
          type: "boolean",
          default: defaults.edits.showLongDistanceHint,
          description: localize(544, null),
          tags: ["nextEditSuggestions", "experimental"]
        },
        "editor.inlineSuggest.edits.longDistanceHintContextLineCount": {
          type: "number",
          default: defaults.edits.longDistanceHintContextLineCount,
          minimum: 0,
          maximum: 10,
          description: localize(541, null),
          tags: ["nextEditSuggestions", "experimental"],
          experiment: {
            mode: "auto"
          }
        },
        "editor.inlineSuggest.edits.renderSideBySide": {
          type: "string",
          default: defaults.edits.renderSideBySide,
          description: localize(542, null),
          enum: ["auto", "never"],
          enumDescriptions: [
            localize(442, null),
            localize(443, null)
          ],
          tags: ["nextEditSuggestions"]
        },
        "editor.inlineSuggest.edits.showCollapsed": {
          type: "boolean",
          default: defaults.edits.showCollapsed,
          description: localize(543, null),
          tags: ["nextEditSuggestions"]
        }
      }
    );
  }
  validate(_input) {
    if (!_input || typeof _input !== "object") {
      return this.defaultValue;
    }
    const input = _input;
    return {
      enabled: boolean(input.enabled, this.defaultValue.enabled),
      mode: stringSet(input.mode, this.defaultValue.mode, ["prefix", "subword", "subwordSmart"]),
      showToolbar: stringSet(input.showToolbar, this.defaultValue.showToolbar, ["always", "onHover", "never"]),
      suppressSuggestions: boolean(input.suppressSuggestions, this.defaultValue.suppressSuggestions),
      keepOnBlur: boolean(input.keepOnBlur, this.defaultValue.keepOnBlur),
      fontFamily: EditorStringOption.string(input.fontFamily, this.defaultValue.fontFamily),
      syntaxHighlightingEnabled: boolean(input.syntaxHighlightingEnabled, this.defaultValue.syntaxHighlightingEnabled),
      minShowDelay: EditorIntOption.clampedInt(input.minShowDelay, 0, 0, 1e4),
      suppressInSnippetMode: boolean(input.suppressInSnippetMode, this.defaultValue.suppressInSnippetMode),
      edits: this._validateEdits(input.edits),
      triggerCommandOnProviderChange: boolean(input.triggerCommandOnProviderChange, this.defaultValue.triggerCommandOnProviderChange),
      experimental: this._validateExperimental(input.experimental)
    };
  }
  _validateEdits(_input) {
    if (!_input || typeof _input !== "object") {
      return this.defaultValue.edits;
    }
    const input = _input;
    return {
      enabled: boolean(input.enabled, this.defaultValue.edits.enabled),
      showCollapsed: boolean(input.showCollapsed, this.defaultValue.edits.showCollapsed),
      allowCodeShifting: stringSet(input.allowCodeShifting, this.defaultValue.edits.allowCodeShifting, ["always", "horizontal", "never"]),
      showLongDistanceHint: boolean(input.showLongDistanceHint, this.defaultValue.edits.showLongDistanceHint),
      longDistanceHintContextLineCount: EditorIntOption.clampedInt(input.longDistanceHintContextLineCount, this.defaultValue.edits.longDistanceHintContextLineCount, 0, 10),
      renderSideBySide: stringSet(input.renderSideBySide, this.defaultValue.edits.renderSideBySide, ["never", "auto"])
    };
  }
  _validateExperimental(_input) {
    if (!_input || typeof _input !== "object") {
      return this.defaultValue.experimental;
    }
    const input = _input;
    return {
      suppressInlineSuggestions: EditorStringOption.string(input.suppressInlineSuggestions, this.defaultValue.experimental.suppressInlineSuggestions),
      showOnSuggestConflict: stringSet(input.showOnSuggestConflict, this.defaultValue.experimental.showOnSuggestConflict, ["always", "never", "whenSuggestListIsIncomplete"]),
      emptyResponseInformation: boolean(input.emptyResponseInformation, this.defaultValue.experimental.emptyResponseInformation)
    };
  }
};

var BracketPairColorization = class extends BaseEditorOption {
  constructor() {
    const defaults = {
      enabled: EDITOR_MODEL_DEFAULTS.bracketPairColorizationOptions.enabled,
      independentColorPoolPerBracketType: EDITOR_MODEL_DEFAULTS.bracketPairColorizationOptions.independentColorPoolPerBracketType
    };
    super(
      21 /* bracketPairColorization */,
      "bracketPairColorization",
      defaults,
      {
        "editor.bracketPairColorization.enabled": {
          type: "boolean",
          default: defaults.enabled,
          markdownDescription: localize(349, null, "`#workbench.colorCustomizations#`")
        },
        "editor.bracketPairColorization.independentColorPoolPerBracketType": {
          type: "boolean",
          default: defaults.independentColorPoolPerBracketType,
          description: localize(350, null)
        }
      }
    );
  }
  validate(_input) {
    if (!_input || typeof _input !== "object") {
      return this.defaultValue;
    }
    const input = _input;
    return {
      enabled: boolean(input.enabled, this.defaultValue.enabled),
      independentColorPoolPerBracketType: boolean(input.independentColorPoolPerBracketType, this.defaultValue.independentColorPoolPerBracketType)
    };
  }
};

var GuideOptions = class extends BaseEditorOption {
  constructor() {
    const defaults = {
      bracketPairs: false,
      bracketPairsHorizontal: "active",
      highlightActiveBracketPair: true,
      indentation: true,
      highlightActiveIndentation: true
    };
    super(
      22 /* guides */,
      "guides",
      defaults,
      {
        "editor.guides.bracketPairs": {
          type: ["boolean", "string"],
          enum: [true, "active", false],
          enumDescriptions: [
            localize(427, null),
            localize(425, null),
            localize(426, null)
          ],
          default: defaults.bracketPairs,
          description: localize(424, null)
        },
        "editor.guides.bracketPairsHorizontal": {
          type: ["boolean", "string"],
          enum: [true, "active", false],
          enumDescriptions: [
            localize(431, null),
            localize(429, null),
            localize(430, null)
          ],
          default: defaults.bracketPairsHorizontal,
          description: localize(428, null)
        },
        "editor.guides.highlightActiveBracketPair": {
          type: "boolean",
          default: defaults.highlightActiveBracketPair,
          description: localize(432, null)
        },
        "editor.guides.indentation": {
          type: "boolean",
          default: defaults.indentation,
          description: localize(437, null)
        },
        "editor.guides.highlightActiveIndentation": {
          type: ["boolean", "string"],
          enum: [true, "always", false],
          enumDescriptions: [
            localize(436, null),
            localize(434, null),
            localize(435, null)
          ],
          default: defaults.highlightActiveIndentation,
          description: localize(433, null)
        }
      }
    );
  }
  validate(_input) {
    if (!_input || typeof _input !== "object") {
      return this.defaultValue;
    }
    const input = _input;
    return {
      bracketPairs: primitiveSet(input.bracketPairs, this.defaultValue.bracketPairs, [true, false, "active"]),
      bracketPairsHorizontal: primitiveSet(input.bracketPairsHorizontal, this.defaultValue.bracketPairsHorizontal, [true, false, "active"]),
      highlightActiveBracketPair: boolean(input.highlightActiveBracketPair, this.defaultValue.highlightActiveBracketPair),
      indentation: boolean(input.indentation, this.defaultValue.indentation),
      highlightActiveIndentation: primitiveSet(input.highlightActiveIndentation, this.defaultValue.highlightActiveIndentation, [true, false, "always"])
    };
  }
};

function primitiveSet(value, defaultValue, allowedValues) {
  const idx = allowedValues.indexOf(value);
  if (idx === -1) {
    return defaultValue;
  }
  return allowedValues[idx];
}

var EditorSuggest = class extends BaseEditorOption {
  constructor() {
    const defaults = {
      insertMode: "insert",
      filterGraceful: true,
      snippetsPreventQuickSuggestions: false,
      localityBonus: false,
      shareSuggestSelections: false,
      selectionMode: "always",
      showIcons: true,
      showStatusBar: false,
      preview: false,
      previewMode: "subwordSmart",
      showInlineDetails: true,
      fitWidthToDetails: false,
      showMethods: true,
      showFunctions: true,
      showConstructors: true,
      showDeprecated: true,
      matchOnWordStartOnly: true,
      showFields: true,
      showVariables: true,
      showClasses: true,
      showStructs: true,
      showInterfaces: true,
      showModules: true,
      showProperties: true,
      showEvents: true,
      showOperators: true,
      showUnits: true,
      showValues: true,
      showConstants: true,
      showEnums: true,
      showEnumMembers: true,
      showKeywords: true,
      showWords: true,
      showColors: true,
      showFiles: true,
      showReferences: true,
      showFolders: true,
      showTypeParameters: true,
      showSnippets: true,
      showUsers: true,
      showIssues: true
    };
    super(
      134 /* suggest */,
      "suggest",
      defaults,
      {
        "editor.suggest.insertMode": {
          type: "string",
          enum: ["insert", "replace"],
          enumDescriptions: [
            localize(686, null),
            localize(688, null)
          ],
          default: defaults.insertMode,
          description: localize(684, null)
        },
        "editor.suggest.filterGraceful": {
          type: "boolean",
          default: defaults.filterGraceful,
          description: localize(683, null)
        },
        "editor.suggest.localityBonus": {
          type: "boolean",
          default: defaults.localityBonus,
          description: localize(691, null)
        },
        "editor.suggest.shareSuggestSelections": {
          type: "boolean",
          default: defaults.shareSuggestSelections,
          markdownDescription: localize(694, null)
        },
        "editor.suggest.selectionMode": {
          type: "string",
          enum: ["always", "never", "whenTriggerCharacter", "whenQuickSuggestion"],
          enumDescriptions: [
            localize(685, null),
            localize(687, null),
            localize(690, null),
            localize(689, null)
          ],
          default: defaults.selectionMode,
          markdownDescription: localize(693, null, "`#editor.quickSuggestions#`", "`#editor.suggestOnTriggerCharacters#`")
        },
        "editor.suggest.snippetsPreventQuickSuggestions": {
          type: "boolean",
          default: defaults.snippetsPreventQuickSuggestions,
          description: localize(698, null)
        },
        "editor.suggest.showIcons": {
          type: "boolean",
          default: defaults.showIcons,
          description: localize(695, null)
        },
        "editor.suggest.showStatusBar": {
          type: "boolean",
          default: defaults.showStatusBar,
          description: localize(697, null)
        },
        "editor.suggest.preview": {
          type: "boolean",
          default: defaults.preview,
          description: localize(692, null)
        },
        "editor.suggest.showInlineDetails": {
          type: "boolean",
          default: defaults.showInlineDetails,
          description: localize(696, null)
        },
        "editor.suggest.filteredTypes": {
          type: "object",
          deprecationMessage: localize(375, null)
        },
        "editor.suggest.showMethods": {
          type: "boolean",
          default: true,
          markdownDescription: localize(468, null)
        },
        "editor.suggest.showFunctions": {
          type: "boolean",
          default: true,
          markdownDescription: localize(464, null)
        },
        "editor.suggest.showConstructors": {
          type: "boolean",
          default: true,
          markdownDescription: localize(455, null)
        },
        "editor.suggest.showDeprecated": {
          type: "boolean",
          default: true,
          markdownDescription: localize(457, null)
        },
        "editor.suggest.matchOnWordStartOnly": {
          type: "boolean",
          default: true,
          markdownDescription: localize(451, null)
        },
        "editor.suggest.showFields": {
          type: "boolean",
          default: true,
          markdownDescription: localize(461, null)
        },
        "editor.suggest.showVariables": {
          type: "boolean",
          default: true,
          markdownDescription: localize(480, null)
        },
        "editor.suggest.showClasses": {
          type: "boolean",
          default: true,
          markdownDescription: localize(452, null)
        },
        "editor.suggest.showStructs": {
          type: "boolean",
          default: true,
          markdownDescription: localize(474, null)
        },
        "editor.suggest.showInterfaces": {
          type: "boolean",
          default: true,
          markdownDescription: localize(465, null)
        },
        "editor.suggest.showModules": {
          type: "boolean",
          default: true,
          markdownDescription: localize(469, null)
        },
        "editor.suggest.showProperties": {
          type: "boolean",
          default: true,
          markdownDescription: localize(471, null)
        },
        "editor.suggest.showEvents": {
          type: "boolean",
          default: true,
          markdownDescription: localize(460, null)
        },
        "editor.suggest.showOperators": {
          type: "boolean",
          default: true,
          markdownDescription: localize(470, null)
        },
        "editor.suggest.showUnits": {
          type: "boolean",
          default: true,
          markdownDescription: localize(477, null)
        },
        "editor.suggest.showValues": {
          type: "boolean",
          default: true,
          markdownDescription: localize(479, null)
        },
        "editor.suggest.showConstants": {
          type: "boolean",
          default: true,
          markdownDescription: localize(454, null)
        },
        "editor.suggest.showEnums": {
          type: "boolean",
          default: true,
          markdownDescription: localize(459, null)
        },
        "editor.suggest.showEnumMembers": {
          type: "boolean",
          default: true,
          markdownDescription: localize(458, null)
        },
        "editor.suggest.showKeywords": {
          type: "boolean",
          default: true,
          markdownDescription: localize(467, null)
        },
        "editor.suggest.showWords": {
          type: "boolean",
          default: true,
          markdownDescription: localize(475, null)
        },
        "editor.suggest.showColors": {
          type: "boolean",
          default: true,
          markdownDescription: localize(453, null)
        },
        "editor.suggest.showFiles": {
          type: "boolean",
          default: true,
          markdownDescription: localize(462, null)
        },
        "editor.suggest.showReferences": {
          type: "boolean",
          default: true,
          markdownDescription: localize(472, null)
        },
        "editor.suggest.showCustomcolors": {
          type: "boolean",
          default: true,
          markdownDescription: localize(456, null)
        },
        "editor.suggest.showFolders": {
          type: "boolean",
          default: true,
          markdownDescription: localize(463, null)
        },
        "editor.suggest.showTypeParameters": {
          type: "boolean",
          default: true,
          markdownDescription: localize(476, null)
        },
        "editor.suggest.showSnippets": {
          type: "boolean",
          default: true,
          markdownDescription: localize(473, null)
        },
        "editor.suggest.showUsers": {
          type: "boolean",
          default: true,
          markdownDescription: localize(478, null)
        },
        "editor.suggest.showIssues": {
          type: "boolean",
          default: true,
          markdownDescription: localize(466, null)
        }
      }
    );
  }
  validate(_input) {
    if (!_input || typeof _input !== "object") {
      return this.defaultValue;
    }
    const input = _input;
    return {
      insertMode: stringSet(input.insertMode, this.defaultValue.insertMode, ["insert", "replace"]),
      filterGraceful: boolean(input.filterGraceful, this.defaultValue.filterGraceful),
      snippetsPreventQuickSuggestions: boolean(input.snippetsPreventQuickSuggestions, this.defaultValue.filterGraceful),
      localityBonus: boolean(input.localityBonus, this.defaultValue.localityBonus),
      shareSuggestSelections: boolean(input.shareSuggestSelections, this.defaultValue.shareSuggestSelections),
      selectionMode: stringSet(input.selectionMode, this.defaultValue.selectionMode, ["always", "never", "whenQuickSuggestion", "whenTriggerCharacter"]),
      showIcons: boolean(input.showIcons, this.defaultValue.showIcons),
      showStatusBar: boolean(input.showStatusBar, this.defaultValue.showStatusBar),
      preview: boolean(input.preview, this.defaultValue.preview),
      previewMode: stringSet(input.previewMode, this.defaultValue.previewMode, ["prefix", "subword", "subwordSmart"]),
      showInlineDetails: boolean(input.showInlineDetails, this.defaultValue.showInlineDetails),
      fitWidthToDetails: boolean(input.fitWidthToDetails, this.defaultValue.fitWidthToDetails),
      showMethods: boolean(input.showMethods, this.defaultValue.showMethods),
      showFunctions: boolean(input.showFunctions, this.defaultValue.showFunctions),
      showConstructors: boolean(input.showConstructors, this.defaultValue.showConstructors),
      showDeprecated: boolean(input.showDeprecated, this.defaultValue.showDeprecated),
      matchOnWordStartOnly: boolean(input.matchOnWordStartOnly, this.defaultValue.matchOnWordStartOnly),
      showFields: boolean(input.showFields, this.defaultValue.showFields),
      showVariables: boolean(input.showVariables, this.defaultValue.showVariables),
      showClasses: boolean(input.showClasses, this.defaultValue.showClasses),
      showStructs: boolean(input.showStructs, this.defaultValue.showStructs),
      showInterfaces: boolean(input.showInterfaces, this.defaultValue.showInterfaces),
      showModules: boolean(input.showModules, this.defaultValue.showModules),
      showProperties: boolean(input.showProperties, this.defaultValue.showProperties),
      showEvents: boolean(input.showEvents, this.defaultValue.showEvents),
      showOperators: boolean(input.showOperators, this.defaultValue.showOperators),
      showUnits: boolean(input.showUnits, this.defaultValue.showUnits),
      showValues: boolean(input.showValues, this.defaultValue.showValues),
      showConstants: boolean(input.showConstants, this.defaultValue.showConstants),
      showEnums: boolean(input.showEnums, this.defaultValue.showEnums),
      showEnumMembers: boolean(input.showEnumMembers, this.defaultValue.showEnumMembers),
      showKeywords: boolean(input.showKeywords, this.defaultValue.showKeywords),
      showWords: boolean(input.showWords, this.defaultValue.showWords),
      showColors: boolean(input.showColors, this.defaultValue.showColors),
      showFiles: boolean(input.showFiles, this.defaultValue.showFiles),
      showReferences: boolean(input.showReferences, this.defaultValue.showReferences),
      showFolders: boolean(input.showFolders, this.defaultValue.showFolders),
      showTypeParameters: boolean(input.showTypeParameters, this.defaultValue.showTypeParameters),
      showSnippets: boolean(input.showSnippets, this.defaultValue.showSnippets),
      showUsers: boolean(input.showUsers, this.defaultValue.showUsers),
      showIssues: boolean(input.showIssues, this.defaultValue.showIssues)
    };
  }
};

var SmartSelect = class extends BaseEditorOption {
  constructor() {
    super(
      129 /* smartSelect */,
      "smartSelect",
      {
        selectLeadingAndTrailingWhitespace: true,
        selectSubwords: true
      },
      {
        "editor.smartSelect.selectLeadingAndTrailingWhitespace": {
          description: localize(668, null),
          default: true,
          type: "boolean"
        },
        "editor.smartSelect.selectSubwords": {
          description: localize(669, null),
          default: true,
          type: "boolean"
        }
      }
    );
  }
  validate(input) {
    if (!input || typeof input !== "object") {
      return this.defaultValue;
    }
    return {
      selectLeadingAndTrailingWhitespace: boolean(input.selectLeadingAndTrailingWhitespace, this.defaultValue.selectLeadingAndTrailingWhitespace),
      selectSubwords: boolean(input.selectSubwords, this.defaultValue.selectSubwords)
    };
  }
};

var WordSegmenterLocales = class extends BaseEditorOption {
  constructor() {
    const defaults = [];
    super(
      147 /* wordSegmenterLocales */,
      "wordSegmenterLocales",
      defaults,
      {
        anyOf: [
          {
            type: "string"
          },
          {
            type: "array",
            items: {
              type: "string"
            }
          }
        ],
        description: localize(728, null),
        type: "array",
        items: {
          type: "string"
        },
        default: defaults
      }
    );
  }
  validate(input) {
    if (typeof input === "string") {
      input = [input];
    }
    if (Array.isArray(input)) {
      const validLocales = [];
      for (const locale of input) {
        if (typeof locale === "string") {
          try {
            if (Intl.Segmenter.supportedLocalesOf(locale).length > 0) {
              validLocales.push(locale);
            }
          } catch {
          }
        }
      }
      return validLocales;
    }
    return this.defaultValue;
  }
};

var WrappingIndentOption = class extends BaseEditorOption {
  constructor() {
    super(
      155 /* wrappingIndent */,
      "wrappingIndent",
      1 /* Same */,
      {
        "editor.wrappingIndent": {
          type: "string",
          enum: ["none", "same", "indent", "deepIndent"],
          enumDescriptions: [
            localize(740, null),
            localize(741, null),
            localize(739, null),
            localize(738, null)
          ],
          description: localize(737, null),
          default: "same"
        }
      }
    );
  }
  validate(input) {
    switch (input) {
      case "none":
        return 0 /* None */;
      case "same":
        return 1 /* Same */;
      case "indent":
        return 2 /* Indent */;
      case "deepIndent":
        return 3 /* DeepIndent */;
    }
    return 1 /* Same */;
  }
  compute(env2, options2, value) {
    const accessibilitySupport = options2.get(2 /* accessibilitySupport */);
    if (accessibilitySupport === 2 /* Enabled */) {
      return 0 /* None */;
    }
    return value;
  }
};

var EditorWrappingInfoComputer = class extends ComputedEditorOption {
  constructor() {
    super(166 /* wrappingInfo */, {
      isDominatedByLongLines: false,
      isWordWrapMinified: false,
      isViewportWrapping: false,
      wrappingColumn: -1
    });
  }
  compute(env2, options2, _) {
    const layoutInfo = options2.get(165 /* layoutInfo */);
    return {
      isDominatedByLongLines: env2.isDominatedByLongLines,
      isWordWrapMinified: layoutInfo.isWordWrapMinified,
      isViewportWrapping: layoutInfo.isViewportWrapping,
      wrappingColumn: layoutInfo.wrappingColumn
    };
  }
};

var EditorDropIntoEditor = class extends BaseEditorOption {
  constructor() {
    const defaults = { enabled: true, showDropSelector: "afterDrop" };
    super(
      43 /* dropIntoEditor */,
      "dropIntoEditor",
      defaults,
      {
        "editor.dropIntoEditor.enabled": {
          type: "boolean",
          default: defaults.enabled,
          markdownDescription: localize(378, null)
        },
        "editor.dropIntoEditor.showDropSelector": {
          type: "string",
          markdownDescription: localize(379, null),
          enum: [
            "afterDrop",
            "never"
          ],
          enumDescriptions: [
            localize(380, null),
            localize(381, null)
          ],
          default: "afterDrop"
        }
      }
    );
  }
  validate(_input) {
    if (!_input || typeof _input !== "object") {
      return this.defaultValue;
    }
    const input = _input;
    return {
      enabled: boolean(input.enabled, this.defaultValue.enabled),
      showDropSelector: stringSet(input.showDropSelector, this.defaultValue.showDropSelector, ["afterDrop", "never"])
    };
  }
};

var EditorPasteAs = class extends BaseEditorOption {
  constructor() {
    const defaults = { enabled: true, showPasteSelector: "afterPaste" };
    super(
      97 /* pasteAs */,
      "pasteAs",
      defaults,
      {
        "editor.pasteAs.enabled": {
          type: "boolean",
          default: defaults.enabled,
          markdownDescription: localize(615, null)
        },
        "editor.pasteAs.showPasteSelector": {
          type: "string",
          markdownDescription: localize(616, null),
          enum: [
            "afterPaste",
            "never"
          ],
          enumDescriptions: [
            localize(617, null),
            localize(618, null)
          ],
          default: "afterPaste"
        }
      }
    );
  }
  validate(_input) {
    if (!_input || typeof _input !== "object") {
      return this.defaultValue;
    }
    const input = _input;
    return {
      enabled: boolean(input.enabled, this.defaultValue.enabled),
      showPasteSelector: stringSet(input.showPasteSelector, this.defaultValue.showPasteSelector, ["afterPaste", "never"])
    };
  }
};

var editorOptionsRegistry = [];

function register2(option) {
  editorOptionsRegistry[option.id] = option;
  return option;
}

var EditorOptions = {
  acceptSuggestionOnCommitCharacter: register2(new EditorBooleanOption(
    0 /* acceptSuggestionOnCommitCharacter */,
    "acceptSuggestionOnCommitCharacter",
    true,
    { markdownDescription: localize(324, null) }
  )),
  acceptSuggestionOnEnter: register2(new EditorStringEnumOption(
    1 /* acceptSuggestionOnEnter */,
    "acceptSuggestionOnEnter",
    "on",
    ["on", "smart", "off"],
    {
      markdownEnumDescriptions: [
        "",
        localize(326, null),
        ""
      ],
      markdownDescription: localize(325, null)
    }
  )),
  accessibilitySupport: register2(new EditorAccessibilitySupport()),
  accessibilityPageSize: register2(new EditorIntOption(
    3 /* accessibilityPageSize */,
    "accessibilityPageSize",
    500,
    1,
    1073741824 /* MAX_SAFE_SMALL_INTEGER */,
    {
      description: localize(327, null),
      tags: ["accessibility"]
    }
  )),
  allowOverflow: register2(new EditorBooleanOption(
    4 /* allowOverflow */,
    "allowOverflow",
    true
  )),
  allowVariableLineHeights: register2(new EditorBooleanOption(
    5 /* allowVariableLineHeights */,
    "allowVariableLineHeights",
    true,
    {
      description: localize(334, null)
    }
  )),
  allowVariableFonts: register2(new EditorBooleanOption(
    6 /* allowVariableFonts */,
    "allowVariableFonts",
    true,
    {
      description: localize(332, null)
    }
  )),
  allowVariableFontsInAccessibilityMode: register2(new EditorBooleanOption(
    7 /* allowVariableFontsInAccessibilityMode */,
    "allowVariableFontsInAccessibilityMode",
    false,
    {
      description: localize(333, null),
      tags: ["accessibility"]
    }
  )),
  ariaLabel: register2(new EditorStringOption(
    8 /* ariaLabel */,
    "ariaLabel",
    localize(481, null)
  )),
  ariaRequired: register2(new EditorBooleanOption(
    9 /* ariaRequired */,
    "ariaRequired",
    false,
    void 0
  )),
  screenReaderAnnounceInlineSuggestion: register2(new EditorBooleanOption(
    12 /* screenReaderAnnounceInlineSuggestion */,
    "screenReaderAnnounceInlineSuggestion",
    true,
    {
      description: localize(647, null),
      tags: ["accessibility"]
    }
  )),
  autoClosingBrackets: register2(new EditorStringEnumOption(
    10 /* autoClosingBrackets */,
    "autoClosingBrackets",
    "languageDefined",
    ["always", "languageDefined", "beforeWhitespace", "never"],
    {
      enumDescriptions: [
        "",
        localize(384, null),
        localize(383, null),
        ""
      ],
      description: localize(340, null)
    }
  )),
  autoClosingComments: register2(new EditorStringEnumOption(
    11 /* autoClosingComments */,
    "autoClosingComments",
    "languageDefined",
    ["always", "languageDefined", "beforeWhitespace", "never"],
    {
      enumDescriptions: [
        "",
        localize(386, null),
        localize(385, null),
        ""
      ],
      description: localize(341, null)
    }
  )),
  autoClosingDelete: register2(new EditorStringEnumOption(
    13 /* autoClosingDelete */,
    "autoClosingDelete",
    "auto",
    ["always", "auto", "never"],
    {
      enumDescriptions: [
        "",
        localize(387, null),
        ""
      ],
      description: localize(342, null)
    }
  )),
  autoClosingOvertype: register2(new EditorStringEnumOption(
    14 /* autoClosingOvertype */,
    "autoClosingOvertype",
    "auto",
    ["always", "auto", "never"],
    {
      enumDescriptions: [
        "",
        localize(388, null),
        ""
      ],
      description: localize(343, null)
    }
  )),
  autoClosingQuotes: register2(new EditorStringEnumOption(
    15 /* autoClosingQuotes */,
    "autoClosingQuotes",
    "languageDefined",
    ["always", "languageDefined", "beforeWhitespace", "never"],
    {
      enumDescriptions: [
        "",
        localize(390, null),
        localize(389, null),
        ""
      ],
      description: localize(344, null)
    }
  )),
  autoIndent: register2(new EditorEnumOption(
    16 /* autoIndent */,
    "autoIndent",
    4 /* Full */,
    "full",
    ["none", "keep", "brackets", "advanced", "full"],
    _autoIndentFromString,
    {
      enumDescriptions: [
        localize(395, null),
        localize(394, null),
        localize(392, null),
        localize(391, null),
        localize(393, null)
      ],
      description: localize(345, null)
    }
  )),
  autoIndentOnPaste: register2(new EditorBooleanOption(
    17 /* autoIndentOnPaste */,
    "autoIndentOnPaste",
    false,
    { description: localize(346, null) }
  )),
  autoIndentOnPasteWithinString: register2(new EditorBooleanOption(
    18 /* autoIndentOnPasteWithinString */,
    "autoIndentOnPasteWithinString",
    true,
    { description: localize(347, null) }
  )),
  automaticLayout: register2(new EditorBooleanOption(
    19 /* automaticLayout */,
    "automaticLayout",
    false
  )),
  autoSurround: register2(new EditorStringEnumOption(
    20 /* autoSurround */,
    "autoSurround",
    "languageDefined",
    ["languageDefined", "quotes", "brackets", "never"],
    {
      enumDescriptions: [
        localize(397, null),
        localize(398, null),
        localize(396, null),
        ""
      ],
      description: localize(348, null)
    }
  )),
  bracketPairColorization: register2(new BracketPairColorization()),
  bracketPairGuides: register2(new GuideOptions()),
  stickyTabStops: register2(new EditorBooleanOption(
    132 /* stickyTabStops */,
    "stickyTabStops",
    false,
    { description: localize(682, null) }
  )),
  codeLens: register2(new EditorBooleanOption(
    23 /* codeLens */,
    "codeLens",
    true,
    { description: localize(351, null) }
  )),
  codeLensFontFamily: register2(new EditorStringOption(
    24 /* codeLensFontFamily */,
    "codeLensFontFamily",
    "",
    { description: localize(352, null) }
  )),
  codeLensFontSize: register2(new EditorIntOption(25 /* codeLensFontSize */, "codeLensFontSize", 0, 0, 100, {
    type: "number",
    default: 0,
    minimum: 0,
    maximum: 100,
    markdownDescription: localize(353, null)
  })),
  colorDecorators: register2(new EditorBooleanOption(
    26 /* colorDecorators */,
    "colorDecorators",
    true,
    { description: localize(355, null) }
  )),
  colorDecoratorActivatedOn: register2(new EditorStringEnumOption(168 /* colorDecoratorsActivatedOn */, "colorDecoratorsActivatedOn", "clickAndHover", ["clickAndHover", "hover", "click"], {
    enumDescriptions: [
      localize(400, null),
      localize(401, null),
      localize(399, null)
    ],
    description: localize(354, null)
  })),
  colorDecoratorsLimit: register2(new EditorIntOption(
    27 /* colorDecoratorsLimit */,
    "colorDecoratorsLimit",
    500,
    1,
    1e6,
    {
      markdownDescription: localize(356, null)
    }
  )),
  columnSelection: register2(new EditorBooleanOption(
    28 /* columnSelection */,
    "columnSelection",
    false,
    { description: localize(357, null) }
  )),
  comments: register2(new EditorComments()),
  contextmenu: register2(new EditorBooleanOption(
    30 /* contextmenu */,
    "contextmenu",
    true
  )),
  copyWithSyntaxHighlighting: register2(new EditorBooleanOption(
    31 /* copyWithSyntaxHighlighting */,
    "copyWithSyntaxHighlighting",
    true,
    { description: localize(360, null) }
  )),
  cursorBlinking: register2(new EditorEnumOption(
    32 /* cursorBlinking */,
    "cursorBlinking",
    1 /* Blink */,
    "blink",
    ["blink", "smooth", "phase", "expand", "solid"],
    cursorBlinkingStyleFromString,
    { description: localize(361, null) }
  )),
  cursorSmoothCaretAnimation: register2(new EditorStringEnumOption(
    33 /* cursorSmoothCaretAnimation */,
    "cursorSmoothCaretAnimation",
    "off",
    ["off", "explicit", "on"],
    {
      enumDescriptions: [
        localize(365, null),
        localize(364, null),
        localize(366, null)
      ],
      description: localize(363, null)
    }
  )),
  cursorStyle: register2(new EditorEnumOption(
    34 /* cursorStyle */,
    "cursorStyle",
    1 /* Line */,
    "line",
    ["line", "block", "underline", "line-thin", "block-outline", "underline-thin"],
    cursorStyleFromString,
    { description: localize(367, null) }
  )),
  overtypeCursorStyle: register2(new EditorEnumOption(
    92 /* overtypeCursorStyle */,
    "overtypeCursorStyle",
    2 /* Block */,
    "block",
    ["line", "block", "underline", "line-thin", "block-outline", "underline-thin"],
    cursorStyleFromString,
    { description: localize(608, null) }
  )),
  cursorSurroundingLines: register2(new EditorIntOption(
    35 /* cursorSurroundingLines */,
    "cursorSurroundingLines",
    0,
    0,
    1073741824 /* MAX_SAFE_SMALL_INTEGER */,
    { description: localize(368, null) }
  )),
  cursorSurroundingLinesStyle: register2(new EditorStringEnumOption(
    36 /* cursorSurroundingLinesStyle */,
    "cursorSurroundingLinesStyle",
    "default",
    ["default", "all"],
    {
      enumDescriptions: [
        localize(371, null),
        localize(370, null)
      ],
      markdownDescription: localize(369, null)
    }
  )),
  cursorWidth: register2(new EditorIntOption(
    37 /* cursorWidth */,
    "cursorWidth",
    0,
    0,
    1073741824 /* MAX_SAFE_SMALL_INTEGER */,
    { markdownDescription: localize(372, null) }
  )),
  cursorHeight: register2(new EditorIntOption(
    38 /* cursorHeight */,
    "cursorHeight",
    0,
    0,
    1073741824 /* MAX_SAFE_SMALL_INTEGER */,
    { markdownDescription: localize(362, null) }
  )),
  disableLayerHinting: register2(new EditorBooleanOption(
    39 /* disableLayerHinting */,
    "disableLayerHinting",
    false
  )),
  disableMonospaceOptimizations: register2(new EditorBooleanOption(
    40 /* disableMonospaceOptimizations */,
    "disableMonospaceOptimizations",
    false
  )),
  domReadOnly: register2(new EditorBooleanOption(
    41 /* domReadOnly */,
    "domReadOnly",
    false
  )),
  doubleClickSelectsBlock: register2(new EditorBooleanOption(
    173 /* doubleClickSelectsBlock */,
    "doubleClickSelectsBlock",
    true,
    { description: localize(376, null) }
  )),
  dragAndDrop: register2(new EditorBooleanOption(
    42 /* dragAndDrop */,
    "dragAndDrop",
    true,
    { description: localize(377, null) }
  )),
  emptySelectionClipboard: register2(new EditorEmptySelectionClipboard()),
  dropIntoEditor: register2(new EditorDropIntoEditor()),
  editContext: register2(new EditorBooleanOption(
    44 /* editContext */,
    "editContext",
    true,
    {
      description: localize(382, null),
      included: isChrome || isEdge || isNative
    }
  )),
  renderRichScreenReaderContent: register2(new EditorBooleanOption(
    107 /* renderRichScreenReaderContent */,
    "renderRichScreenReaderContent",
    false,
    {
      markdownDescription: localize(638, null)
    }
  )),
  stickyScroll: register2(new EditorStickyScroll()),
  experimentalGpuAcceleration: register2(new EditorStringEnumOption(
    46 /* experimentalGpuAcceleration */,
    "experimentalGpuAcceleration",
    "off",
    ["off", "on"],
    {
      tags: ["experimental"],
      enumDescriptions: [
        localize(485, null),
        localize(486, null)
      ],
      description: localize(484, null)
    }
  )),
  experimentalWhitespaceRendering: register2(new EditorStringEnumOption(
    47 /* experimentalWhitespaceRendering */,
    "experimentalWhitespaceRendering",
    "svg",
    ["svg", "font", "off"],
    {
      enumDescriptions: [
        localize(490, null),
        localize(488, null),
        localize(489, null)
      ],
      description: localize(487, null)
    }
  )),
  extraEditorClassName: register2(new EditorStringOption(
    48 /* extraEditorClassName */,
    "extraEditorClassName",
    ""
  )),
  fastScrollSensitivity: register2(new EditorFloatOption(
    49 /* fastScrollSensitivity */,
    "fastScrollSensitivity",
    5,
    (x) => x <= 0 ? 5 : x,
    { markdownDescription: localize(491, null) }
  )),
  find: register2(new EditorFind()),
  fixedOverflowWidgets: register2(new EditorBooleanOption(
    51 /* fixedOverflowWidgets */,
    "fixedOverflowWidgets",
    false
  )),
  folding: register2(new EditorBooleanOption(
    52 /* folding */,
    "folding",
    true,
    { description: localize(502, null) }
  )),
  foldingStrategy: register2(new EditorStringEnumOption(
    53 /* foldingStrategy */,
    "foldingStrategy",
    "auto",
    ["auto", "indentation"],
    {
      enumDescriptions: [
        localize(507, null),
        localize(508, null)
      ],
      description: localize(506, null)
    }
  )),
  foldingHighlight: register2(new EditorBooleanOption(
    54 /* foldingHighlight */,
    "foldingHighlight",
    true,
    { description: localize(503, null) }
  )),
  foldingImportsByDefault: register2(new EditorBooleanOption(
    55 /* foldingImportsByDefault */,
    "foldingImportsByDefault",
    false,
    { description: localize(504, null) }
  )),
  foldingMaximumRegions: register2(new EditorIntOption(
    56 /* foldingMaximumRegions */,
    "foldingMaximumRegions",
    5e3,
    10,
    65e3,
    // limit must be less than foldingRanges MAX_FOLDING_REGIONS
    { description: localize(505, null) }
  )),
  unfoldOnClickAfterEndOfLine: register2(new EditorBooleanOption(
    57 /* unfoldOnClickAfterEndOfLine */,
    "unfoldOnClickAfterEndOfLine",
    false,
    { description: localize(712, null) }
  )),
  fontFamily: register2(new EditorStringOption(
    58 /* fontFamily */,
    "fontFamily",
    EDITOR_FONT_DEFAULTS.fontFamily,
    { description: localize(509, null) }
  )),
  fontInfo: register2(new EditorFontInfo()),
  fontLigatures2: register2(new EditorFontLigatures()),
  fontSize: register2(new EditorFontSize()),
  fontWeight: register2(new EditorFontWeight()),
  fontVariations: register2(new EditorFontVariations()),
  formatOnPaste: register2(new EditorBooleanOption(
    64 /* formatOnPaste */,
    "formatOnPaste",
    false,
    { description: localize(519, null) }
  )),
  formatOnType: register2(new EditorBooleanOption(
    65 /* formatOnType */,
    "formatOnType",
    false,
    { description: localize(520, null) }
  )),
  glyphMargin: register2(new EditorBooleanOption(
    66 /* glyphMargin */,
    "glyphMargin",
    true,
    { description: localize(521, null) }
  )),
  gotoLocation: register2(new EditorGoToLocation()),
  hideCursorInOverviewRuler: register2(new EditorBooleanOption(
    68 /* hideCursorInOverviewRuler */,
    "hideCursorInOverviewRuler",
    false,
    { description: localize(522, null) }
  )),
  hover: register2(new EditorHover()),
  inDiffEditor: register2(new EditorBooleanOption(
    70 /* inDiffEditor */,
    "inDiffEditor",
    false
  )),
  inertialScroll: register2(new EditorBooleanOption(
    158 /* inertialScroll */,
    "inertialScroll",
    false,
    { description: localize(532, null) }
  )),
  letterSpacing: register2(new EditorFloatOption(
    72 /* letterSpacing */,
    "letterSpacing",
    EDITOR_FONT_DEFAULTS.letterSpacing,
    (x) => EditorFloatOption.clamp(x, -5, 20),
    { description: localize(559, null) }
  )),
  lightbulb: register2(new EditorLightbulb()),
  lineDecorationsWidth: register2(new EditorLineDecorationsWidth()),
  lineHeight: register2(new EditorLineHeight()),
  lineNumbers: register2(new EditorRenderLineNumbersOption()),
  lineNumbersMinChars: register2(new EditorIntOption(
    77 /* lineNumbersMinChars */,
    "lineNumbersMinChars",
    5,
    1,
    300
  )),
  linkedEditing: register2(new EditorBooleanOption(
    78 /* linkedEditing */,
    "linkedEditing",
    false,
    { description: localize(566, null) }
  )),
  links: register2(new EditorBooleanOption(
    79 /* links */,
    "links",
    true,
    { description: localize(567, null) }
  )),
  matchBrackets: register2(new EditorStringEnumOption(
    80 /* matchBrackets */,
    "matchBrackets",
    "always",
    ["always", "near", "never"],
    { description: localize(568, null) }
  )),
  minimap: register2(new EditorMinimap()),
  mouseStyle: register2(new EditorStringEnumOption(
    82 /* mouseStyle */,
    "mouseStyle",
    "text",
    ["text", "default", "copy"]
  )),
  mouseWheelScrollSensitivity: register2(new EditorFloatOption(
    83 /* mouseWheelScrollSensitivity */,
    "mouseWheelScrollSensitivity",
    1,
    (x) => x === 0 ? 1 : x,
    { markdownDescription: localize(589, null) }
  )),
  mouseWheelZoom: register2(new EditorBooleanOption(
    84 /* mouseWheelZoom */,
    "mouseWheelZoom",
    false,
    {
      markdownDescription: isMacintosh ? localize(591, null) : localize(590, null)
    }
  )),
  multiCursorMergeOverlapping: register2(new EditorBooleanOption(
    85 /* multiCursorMergeOverlapping */,
    "multiCursorMergeOverlapping",
    true,
    { description: localize(593, null) }
  )),
  multiCursorModifier: register2(new EditorEnumOption(
    86 /* multiCursorModifier */,
    "multiCursorModifier",
    "altKey",
    "alt",
    ["ctrlCmd", "alt"],
    _multiCursorModifierFromString,
    {
      markdownEnumDescriptions: [
        localize(596, null),
        localize(595, null)
      ],
      markdownDescription: localize(594, null)
    }
  )),
  mouseMiddleClickAction: register2(new EditorStringEnumOption(
    87 /* mouseMiddleClickAction */,
    "mouseMiddleClickAction",
    "default",
    ["default", "openLink", "ctrlLeftClick"],
    { description: localize(588, null) }
  )),
  multiCursorPaste: register2(new EditorStringEnumOption(
    88 /* multiCursorPaste */,
    "multiCursorPaste",
    "spread",
    ["spread", "full"],
    {
      markdownEnumDescriptions: [
        localize(599, null),
        localize(598, null)
      ],
      markdownDescription: localize(597, null)
    }
  )),
  multiCursorLimit: register2(new EditorIntOption(
    89 /* multiCursorLimit */,
    "multiCursorLimit",
    1e4,
    1,
    1e5,
    {
      markdownDescription: localize(592, null)
    }
  )),
  occurrencesHighlight: register2(new EditorStringEnumOption(
    90 /* occurrencesHighlight */,
    "occurrencesHighlight",
    "singleFile",
    ["off", "singleFile", "multiFile"],
    {
      markdownEnumDescriptions: [
        localize(602, null),
        localize(603, null),
        localize(601, null)
      ],
      markdownDescription: localize(600, null)
    }
  )),
  occurrencesHighlightDelay: register2(new EditorIntOption(
    91 /* occurrencesHighlightDelay */,
    "occurrencesHighlightDelay",
    0,
    0,
    2e3,
    {
      description: localize(604, null),
      tags: ["preview"]
    }
  )),
  overtypeOnPaste: register2(new EditorBooleanOption(
    93 /* overtypeOnPaste */,
    "overtypeOnPaste",
    true,
    { description: localize(609, null) }
  )),
  overviewRulerBorder: register2(new EditorBooleanOption(
    94 /* overviewRulerBorder */,
    "overviewRulerBorder",
    true,
    { description: localize(610, null) }
  )),
  overviewRulerLanes: register2(new EditorIntOption(
    95 /* overviewRulerLanes */,
    "overviewRulerLanes",
    3,
    0,
    3
  )),
  padding: register2(new EditorPadding()),
  pasteAs: register2(new EditorPasteAs()),
  parameterHints: register2(new EditorParameterHints()),
  peekWidgetDefaultFocus: register2(new EditorStringEnumOption(
    99 /* peekWidgetDefaultFocus */,
    "peekWidgetDefaultFocus",
    "tree",
    ["tree", "editor"],
    {
      enumDescriptions: [
        localize(621, null),
        localize(620, null)
      ],
      description: localize(619, null)
    }
  )),
  placeholder: register2(new PlaceholderOption()),
  definitionLinkOpensInPeek: register2(new EditorBooleanOption(
    101 /* definitionLinkOpensInPeek */,
    "definitionLinkOpensInPeek",
    false,
    { description: localize(374, null) }
  )),
  quickSuggestions: register2(new EditorQuickSuggestions()),
  quickSuggestionsDelay: register2(new EditorIntOption(
    103 /* quickSuggestionsDelay */,
    "quickSuggestionsDelay",
    10,
    0,
    1073741824 /* MAX_SAFE_SMALL_INTEGER */,
    {
      description: localize(630, null),
      experiment: {
        mode: "auto"
      }
    }
  )),
  readOnly: register2(new EditorBooleanOption(
    104 /* readOnly */,
    "readOnly",
    false
  )),
  readOnlyMessage: register2(new ReadonlyMessage()),
  renameOnType: register2(new EditorBooleanOption(
    106 /* renameOnType */,
    "renameOnType",
    false,
    { description: localize(631, null), markdownDeprecationMessage: localize(632, null) }
  )),
  renderControlCharacters: register2(new EditorBooleanOption(
    108 /* renderControlCharacters */,
    "renderControlCharacters",
    true,
    { description: localize(633, null), restricted: true }
  )),
  renderFinalNewline: register2(new EditorStringEnumOption(
    109 /* renderFinalNewline */,
    "renderFinalNewline",
    isLinux ? "dimmed" : "on",
    ["off", "on", "dimmed"],
    { description: localize(634, null) }
  )),
  renderLineHighlight: register2(new EditorStringEnumOption(
    110 /* renderLineHighlight */,
    "renderLineHighlight",
    "line",
    ["none", "gutter", "line", "all"],
    {
      enumDescriptions: [
        "",
        "",
        "",
        localize(636, null)
      ],
      description: localize(635, null)
    }
  )),
  renderLineHighlightOnlyWhenFocus: register2(new EditorBooleanOption(
    111 /* renderLineHighlightOnlyWhenFocus */,
    "renderLineHighlightOnlyWhenFocus",
    false,
    { description: localize(637, null) }
  )),
  renderValidationDecorations: register2(new EditorStringEnumOption(
    112 /* renderValidationDecorations */,
    "renderValidationDecorations",
    "editable",
    ["editable", "on", "off"]
  )),
  renderWhitespace: register2(new EditorStringEnumOption(
    113 /* renderWhitespace */,
    "renderWhitespace",
    "selection",
    ["none", "boundary", "selection", "trailing", "all"],
    {
      enumDescriptions: [
        "",
        localize(640, null),
        localize(641, null),
        localize(642, null),
        ""
      ],
      description: localize(639, null)
    }
  )),
  revealHorizontalRightPadding: register2(new EditorIntOption(
    114 /* revealHorizontalRightPadding */,
    "revealHorizontalRightPadding",
    15,
    0,
    1e3
  )),
  roundedSelection: register2(new EditorBooleanOption(
    115 /* roundedSelection */,
    "roundedSelection",
    true,
    { description: localize(643, null) }
  )),
  rulers: register2(new EditorRulers()),
  scrollbar: register2(new EditorScrollbar()),
  scrollBeyondLastColumn: register2(new EditorIntOption(
    118 /* scrollBeyondLastColumn */,
    "scrollBeyondLastColumn",
    4,
    0,
    1073741824 /* MAX_SAFE_SMALL_INTEGER */,
    { description: localize(660, null) }
  )),
  scrollBeyondLastLine: register2(new EditorBooleanOption(
    119 /* scrollBeyondLastLine */,
    "scrollBeyondLastLine",
    true,
    { description: localize(661, null) }
  )),
  scrollOnMiddleClick: register2(new EditorBooleanOption(
    171 /* scrollOnMiddleClick */,
    "scrollOnMiddleClick",
    false,
    { description: localize(662, null) }
  )),
  scrollPredominantAxis: register2(new EditorBooleanOption(
    120 /* scrollPredominantAxis */,
    "scrollPredominantAxis",
    true,
    { description: localize(663, null) }
  )),
  selectionClipboard: register2(new EditorBooleanOption(
    121 /* selectionClipboard */,
    "selectionClipboard",
    true,
    {
      description: localize(664, null),
      included: isLinux
    }
  )),
  selectionHighlight: register2(new EditorBooleanOption(
    122 /* selectionHighlight */,
    "selectionHighlight",
    true,
    { description: localize(665, null) }
  )),
  selectionHighlightMaxLength: register2(new EditorIntOption(
    123 /* selectionHighlightMaxLength */,
    "selectionHighlightMaxLength",
    200,
    0,
    1073741824 /* MAX_SAFE_SMALL_INTEGER */,
    { description: localize(666, null) }
  )),
  selectionHighlightMultiline: register2(new EditorBooleanOption(
    124 /* selectionHighlightMultiline */,
    "selectionHighlightMultiline",
    false,
    { description: localize(667, null) }
  )),
  selectOnLineNumbers: register2(new EditorBooleanOption(
    125 /* selectOnLineNumbers */,
    "selectOnLineNumbers",
    true
  )),
  showFoldingControls: register2(new EditorStringEnumOption(
    126 /* showFoldingControls */,
    "showFoldingControls",
    "mouseover",
    ["always", "never", "mouseover"],
    {
      enumDescriptions: [
        localize(672, null),
        localize(674, null),
        localize(673, null)
      ],
      description: localize(671, null)
    }
  )),
  showUnused: register2(new EditorBooleanOption(
    127 /* showUnused */,
    "showUnused",
    true,
    { description: localize(675, null) }
  )),
  showDeprecated: register2(new EditorBooleanOption(
    157 /* showDeprecated */,
    "showDeprecated",
    true,
    { description: localize(670, null) }
  )),
  inlayHints: register2(new EditorInlayHints()),
  snippetSuggestions: register2(new EditorStringEnumOption(
    128 /* snippetSuggestions */,
    "snippetSuggestions",
    "inline",
    ["top", "bottom", "inline", "none"],
    {
      enumDescriptions: [
        localize(681, null),
        localize(678, null),
        localize(679, null),
        localize(680, null)
      ],
      description: localize(677, null)
    }
  )),
  smartSelect: register2(new SmartSelect()),
  smoothScrolling: register2(new EditorBooleanOption(
    130 /* smoothScrolling */,
    "smoothScrolling",
    false,
    { description: localize(676, null) }
  )),
  stopRenderingLineAfter: register2(new EditorIntOption(
    133 /* stopRenderingLineAfter */,
    "stopRenderingLineAfter",
    1e4,
    -1,
    1073741824 /* MAX_SAFE_SMALL_INTEGER */
  )),
  suggest: register2(new EditorSuggest()),
  inlineSuggest: register2(new InlineEditorSuggest()),
  inlineCompletionsAccessibilityVerbose: register2(new EditorBooleanOption(
    169 /* inlineCompletionsAccessibilityVerbose */,
    "inlineCompletionsAccessibilityVerbose",
    false,
    { description: localize(539, null) }
  )),
  suggestFontSize: register2(new EditorIntOption(
    135 /* suggestFontSize */,
    "suggestFontSize",
    0,
    0,
    1e3,
    { markdownDescription: localize(699, null, "`0`", "`#editor.fontSize#`") }
  )),
  suggestLineHeight: register2(new EditorIntOption(
    136 /* suggestLineHeight */,
    "suggestLineHeight",
    0,
    0,
    1e3,
    { markdownDescription: localize(700, null, "`0`", "`#editor.lineHeight#`") }
  )),
  suggestOnTriggerCharacters: register2(new EditorBooleanOption(
    137 /* suggestOnTriggerCharacters */,
    "suggestOnTriggerCharacters",
    true,
    { description: localize(701, null) }
  )),
  suggestSelection: register2(new EditorStringEnumOption(
    138 /* suggestSelection */,
    "suggestSelection",
    "first",
    ["first", "recentlyUsed", "recentlyUsedByPrefix"],
    {
      markdownEnumDescriptions: [
        localize(703, null),
        localize(704, null),
        localize(705, null)
      ],
      description: localize(702, null)
    }
  )),
  tabCompletion: register2(new EditorStringEnumOption(
    139 /* tabCompletion */,
    "tabCompletion",
    "off",
    ["on", "off", "onlySnippets"],
    {
      enumDescriptions: [
        localize(708, null),
        localize(707, null),
        localize(709, null)
      ],
      description: localize(706, null)
    }
  )),
  tabIndex: register2(new EditorIntOption(
    140 /* tabIndex */,
    "tabIndex",
    0,
    -1,
    1073741824 /* MAX_SAFE_SMALL_INTEGER */
  )),
  trimWhitespaceOnDelete: register2(new EditorBooleanOption(
    141 /* trimWhitespaceOnDelete */,
    "trimWhitespaceOnDelete",
    false,
    { description: localize(711, null) }
  )),
  unicodeHighlight: register2(new UnicodeHighlight()),
  unusualLineTerminators: register2(new EditorStringEnumOption(
    143 /* unusualLineTerminators */,
    "unusualLineTerminators",
    "prompt",
    ["auto", "off", "prompt"],
    {
      enumDescriptions: [
        localize(721, null),
        localize(722, null),
        localize(723, null)
      ],
      description: localize(720, null)
    }
  )),
  useShadowDOM: register2(new EditorBooleanOption(
    144 /* useShadowDOM */,
    "useShadowDOM",
    true
  )),
  useTabStops: register2(new EditorBooleanOption(
    145 /* useTabStops */,
    "useTabStops",
    true,
    { description: localize(724, null) }
  )),
  wordBreak: register2(new EditorStringEnumOption(
    146 /* wordBreak */,
    "wordBreak",
    "normal",
    ["normal", "keepAll"],
    {
      markdownEnumDescriptions: [
        localize(727, null),
        localize(726, null)
      ],
      description: localize(725, null)
    }
  )),
  wordSegmenterLocales: register2(new WordSegmenterLocales()),
  wordSeparators: register2(new EditorStringOption(
    148 /* wordSeparators */,
    "wordSeparators",
    USUAL_WORD_SEPARATORS,
    { description: localize(729, null) }
  )),
  wordWrap: register2(new EditorStringEnumOption(
    149 /* wordWrap */,
    "wordWrap",
    "off",
    ["off", "on", "wordWrapColumn", "bounded"],
    {
      markdownEnumDescriptions: [
        localize(732, null),
        localize(733, null),
        localize(734, null),
        localize(731, null)
      ],
      description: localize(730, null)
    }
  )),
  wordWrapBreakAfterCharacters: register2(new EditorStringOption(
    150 /* wordWrapBreakAfterCharacters */,
    "wordWrapBreakAfterCharacters",
    // allow-any-unicode-next-line
    " 	})]?|/&.,;\xA2\xB0\u2032\u2033\u2030\u2103\u3001\u3002\uFF61\uFF64\uFFE0\uFF0C\uFF0E\uFF1A\uFF1B\uFF1F\uFF01\uFF05\u30FB\uFF65\u309D\u309E\u30FD\u30FE\u30FC\u30A1\u30A3\u30A5\u30A7\u30A9\u30C3\u30E3\u30E5\u30E7\u30EE\u30F5\u30F6\u3041\u3043\u3045\u3047\u3049\u3063\u3083\u3085\u3087\u308E\u3095\u3096\u31F0\u31F1\u31F2\u31F3\u31F4\u31F5\u31F6\u31F7\u31F8\u31F9\u31FA\u31FB\u31FC\u31FD\u31FE\u31FF\u3005\u303B\uFF67\uFF68\uFF69\uFF6A\uFF6B\uFF6C\uFF6D\uFF6E\uFF6F\uFF70\u201D\u3009\u300B\u300D\u300F\u3011\u3015\uFF09\uFF3D\uFF5D\uFF63"
  )),
  wordWrapBreakBeforeCharacters: register2(new EditorStringOption(
    151 /* wordWrapBreakBeforeCharacters */,
    "wordWrapBreakBeforeCharacters",
    // allow-any-unicode-next-line
    "([{\u2018\u201C\u3008\u300A\u300C\u300E\u3010\u3014\uFF08\uFF3B\uFF5B\uFF62\xA3\xA5\uFF04\uFFE1\uFFE5+\uFF0B"
  )),
  wordWrapColumn: register2(new EditorIntOption(
    152 /* wordWrapColumn */,
    "wordWrapColumn",
    80,
    1,
    1073741824 /* MAX_SAFE_SMALL_INTEGER */,
    {
      markdownDescription: localize(735, null)
    }
  )),
  wordWrapOverride1: register2(new EditorStringEnumOption(
    153 /* wordWrapOverride1 */,
    "wordWrapOverride1",
    "inherit",
    ["off", "on", "inherit"]
  )),
  wordWrapOverride2: register2(new EditorStringEnumOption(
    154 /* wordWrapOverride2 */,
    "wordWrapOverride2",
    "inherit",
    ["off", "on", "inherit"]
  )),
  wrapOnEscapedLineFeeds: register2(new EditorBooleanOption(
    160 /* wrapOnEscapedLineFeeds */,
    "wrapOnEscapedLineFeeds",
    false,
    { markdownDescription: localize(736, null) }
  )),
  // Leave these at the end (because they have dependencies!)
  effectiveCursorStyle: register2(new EffectiveCursorStyle()),
  editorClassName: register2(new EditorClassName()),
  defaultColorDecorators: register2(new EditorStringEnumOption(
    167 /* defaultColorDecorators */,
    "defaultColorDecorators",
    "auto",
    ["auto", "always", "never"],
    {
      enumDescriptions: [
        localize(403, null),
        localize(402, null),
        localize(404, null)
      ],
      description: localize(373, null)
    }
  )),
  pixelRatio: register2(new EditorPixelRatio()),
  tabFocusMode: register2(new EditorBooleanOption(
    164 /* tabFocusMode */,
    "tabFocusMode",
    false,
    { markdownDescription: localize(710, null) }
  )),
  layoutInfo: register2(new EditorLayoutInfoComputer()),
  wrappingInfo: register2(new EditorWrappingInfoComputer()),
  wrappingIndent: register2(new WrappingIndentOption()),
  wrappingStrategy: register2(new WrappingStrategy()),
  effectiveEditContextEnabled: register2(new EffectiveEditContextEnabled()),
  effectiveAllowVariableFonts: register2(new EffectiveAllowVariableFonts())
};
export { applyUpdate, boolean, clampedInt, stringSet, _autoIndentFromString, cursorBlinkingStyleFromString, cursorStyleFromString, _multiCursorModifierFromString, _scrollbarVisibilityFromString, primitiveSet, register2, MINIMAP_GUTTER_WIDTH, ComputeOptionsMemory, BaseEditorOption, ApplyUpdateResult, ComputedEditorOption, SimpleEditorOption, EditorBooleanOption, EditorIntOption, EditorFloatOption, EditorStringOption, EditorStringEnumOption, EditorEnumOption, EditorAccessibilitySupport, EditorComments, TextEditorCursorStyle, EditorClassName, EditorEmptySelectionClipboard, EditorFind, EditorFontLigatures, EditorFontVariations, EditorFontInfo, EffectiveCursorStyle, EffectiveEditContextEnabled, EffectiveAllowVariableFonts, EditorFontSize, EditorFontWeight, EditorGoToLocation, EditorHover, EditorLayoutInfoComputer, WrappingStrategy, EditorLightbulb, EditorStickyScroll, EditorInlayHints, EditorLineDecorationsWidth, EditorLineHeight, EditorMinimap, EditorPadding, EditorParameterHints, EditorPixelRatio, PlaceholderOption, EditorQuickSuggestions, EditorRenderLineNumbersOption, EditorRulers, ReadonlyMessage, EditorScrollbar, inUntrustedWorkspace, unicodeHighlightConfigKeys, UnicodeHighlight, InlineEditorSuggest, BracketPairColorization, GuideOptions, EditorSuggest, SmartSelect, WordSegmenterLocales, WrappingIndentOption, EditorWrappingInfoComputer, EditorDropIntoEditor, EditorPasteAs, editorOptionsRegistry, EditorOptions };
