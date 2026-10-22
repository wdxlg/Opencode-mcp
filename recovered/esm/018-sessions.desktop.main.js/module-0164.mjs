// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/common/languages.ts
import { Codicon } from "./module-0085.mjs";
import { localize } from "./module-0001.mjs";
import { Range2 } from "./module-0106.mjs";
import { URI } from "./module-0032.mjs";
import { EditOperation } from "./module-0162.mjs";
import { TokenizationRegistry } from "./module-0163.mjs";


// src/vs/editor/common/languages.ts
var Token2 = class {
  constructor(offset, type, language2) {
    this.offset = offset;
    this.type = type;
    this.language = language2;
    this._tokenBrand = void 0;
  }
  toString() {
    return "(" + this.offset + ", " + this.type + ")";
  }
};

var EncodedTokenizationResult = class {
  constructor(tokens, fontInfo, endState) {
    this.tokens = tokens;
    this.fontInfo = fontInfo;
    this.endState = endState;
    this._encodedTokenizationResultBrand = void 0;
  }
};

var CompletionItemKinds;

((CompletionItemKinds2) => {
  const byKind = /* @__PURE__ */ new Map();
  byKind.set(0 /* Method */, Codicon.symbolMethod);
  byKind.set(1 /* Function */, Codicon.symbolFunction);
  byKind.set(2 /* Constructor */, Codicon.symbolConstructor);
  byKind.set(3 /* Field */, Codicon.symbolField);
  byKind.set(4 /* Variable */, Codicon.symbolVariable);
  byKind.set(5 /* Class */, Codicon.symbolClass);
  byKind.set(6 /* Struct */, Codicon.symbolStruct);
  byKind.set(7 /* Interface */, Codicon.symbolInterface);
  byKind.set(8 /* Module */, Codicon.symbolModule);
  byKind.set(9 /* Property */, Codicon.symbolProperty);
  byKind.set(10 /* Event */, Codicon.symbolEvent);
  byKind.set(11 /* Operator */, Codicon.symbolOperator);
  byKind.set(12 /* Unit */, Codicon.symbolUnit);
  byKind.set(13 /* Value */, Codicon.symbolValue);
  byKind.set(15 /* Enum */, Codicon.symbolEnum);
  byKind.set(14 /* Constant */, Codicon.symbolConstant);
  byKind.set(16 /* EnumMember */, Codicon.symbolEnumMember);
  byKind.set(17 /* Keyword */, Codicon.symbolKeyword);
  byKind.set(28 /* Snippet */, Codicon.symbolSnippet);
  byKind.set(18 /* Text */, Codicon.symbolText);
  byKind.set(19 /* Color */, Codicon.symbolColor);
  byKind.set(20 /* File */, Codicon.symbolFile);
  byKind.set(21 /* Reference */, Codicon.symbolReference);
  byKind.set(22 /* Customcolor */, Codicon.symbolCustomColor);
  byKind.set(23 /* Folder */, Codicon.symbolFolder);
  byKind.set(24 /* TypeParameter */, Codicon.symbolTypeParameter);
  byKind.set(25 /* User */, Codicon.account);
  byKind.set(26 /* Issue */, Codicon.issues);
  byKind.set(27 /* Tool */, Codicon.tools);
  function toIcon(kind) {
    let codicon = byKind.get(kind);
    if (!codicon) {
      console.info("No codicon found for CompletionItemKind " + kind);
      codicon = Codicon.symbolProperty;
    }
    return codicon;
  }
  CompletionItemKinds2.toIcon = toIcon;
  function toLabel(kind) {
    switch (kind) {
      case 0 /* Method */:
        return localize(907, null);
      case 1 /* Function */:
        return localize(903, null);
      case 2 /* Constructor */:
        return localize(895, null);
      case 3 /* Field */:
        return localize(900, null);
      case 4 /* Variable */:
        return localize(920, null);
      case 5 /* Class */:
        return localize(892, null);
      case 6 /* Struct */:
        return localize(913, null);
      case 7 /* Interface */:
        return localize(904, null);
      case 8 /* Module */:
        return localize(908, null);
      case 9 /* Property */:
        return localize(910, null);
      case 10 /* Event */:
        return localize(899, null);
      case 11 /* Operator */:
        return localize(909, null);
      case 12 /* Unit */:
        return localize(917, null);
      case 13 /* Value */:
        return localize(919, null);
      case 14 /* Constant */:
        return localize(894, null);
      case 15 /* Enum */:
        return localize(897, null);
      case 16 /* EnumMember */:
        return localize(898, null);
      case 17 /* Keyword */:
        return localize(906, null);
      case 18 /* Text */:
        return localize(914, null);
      case 19 /* Color */:
        return localize(893, null);
      case 20 /* File */:
        return localize(901, null);
      case 21 /* Reference */:
        return localize(911, null);
      case 22 /* Customcolor */:
        return localize(896, null);
      case 23 /* Folder */:
        return localize(902, null);
      case 24 /* TypeParameter */:
        return localize(916, null);
      case 25 /* User */:
        return localize(918, null);
      case 26 /* Issue */:
        return localize(905, null);
      case 27 /* Tool */:
        return localize(915, null);
      case 28 /* Snippet */:
        return localize(912, null);
      default:
        return "";
    }
  }
  CompletionItemKinds2.toLabel = toLabel;
  const data = /* @__PURE__ */ new Map();
  data.set("method", 0 /* Method */);
  data.set("function", 1 /* Function */);
  data.set("constructor", 2 /* Constructor */);
  data.set("field", 3 /* Field */);
  data.set("variable", 4 /* Variable */);
  data.set("class", 5 /* Class */);
  data.set("struct", 6 /* Struct */);
  data.set("interface", 7 /* Interface */);
  data.set("module", 8 /* Module */);
  data.set("property", 9 /* Property */);
  data.set("event", 10 /* Event */);
  data.set("operator", 11 /* Operator */);
  data.set("unit", 12 /* Unit */);
  data.set("value", 13 /* Value */);
  data.set("constant", 14 /* Constant */);
  data.set("enum", 15 /* Enum */);
  data.set("enum-member", 16 /* EnumMember */);
  data.set("enumMember", 16 /* EnumMember */);
  data.set("keyword", 17 /* Keyword */);
  data.set("snippet", 28 /* Snippet */);
  data.set("text", 18 /* Text */);
  data.set("color", 19 /* Color */);
  data.set("file", 20 /* File */);
  data.set("reference", 21 /* Reference */);
  data.set("customcolor", 22 /* Customcolor */);
  data.set("folder", 23 /* Folder */);
  data.set("type-parameter", 24 /* TypeParameter */);
  data.set("typeParameter", 24 /* TypeParameter */);
  data.set("account", 25 /* User */);
  data.set("issue", 26 /* Issue */);
  data.set("tool", 27 /* Tool */);
  function fromString(value2, strict) {
    let res = data.get(value2);
    if (typeof res === "undefined" && !strict) {
      res = 9 /* Property */;
    }
    return res;
  }
  CompletionItemKinds2.fromString = fromString;
})(CompletionItemKinds || (CompletionItemKinds = {}));

var SelectedSuggestionInfo = class {
  constructor(range2, text2, completionKind, isSnippetText) {
    this.range = range2;
    this.text = text2;
    this.completionKind = completionKind;
    this.isSnippetText = isSnippetText;
  }
  equals(other) {
    return Range2.lift(this.range).equalsRange(other.range) && this.text === other.text && this.completionKind === other.completionKind && this.isSnippetText === other.isSnippetText;
  }
};

var ProviderId = class _ProviderId {
  constructor(extensionId, extensionVersion, providerId) {
    this.extensionId = extensionId;
    this.extensionVersion = extensionVersion;
    this.providerId = providerId;
  }
  static fromExtensionId(extensionId) {
    return new _ProviderId(extensionId, void 0, void 0);
  }
  toString() {
    let result = "";
    if (this.extensionId) {
      result += this.extensionId;
    }
    if (this.extensionVersion) {
      result += `@${this.extensionVersion}`;
    }
    if (this.providerId) {
      result += `:${this.providerId}`;
    }
    if (result.length === 0) {
      result = "unknown";
    }
    return result;
  }
  toStringWithoutVersion() {
    let result = "";
    if (this.extensionId) {
      result += this.extensionId;
    }
    if (this.providerId) {
      result += `:${this.providerId}`;
    }
    return result;
  }
};

var VersionedExtensionId = class _VersionedExtensionId {
  constructor(extensionId, version2) {
    this.extensionId = extensionId;
    this.version = version2;
  }
  static tryCreate(extensionId, version2) {
    if (!extensionId || !version2) {
      return void 0;
    }
    return new _VersionedExtensionId(extensionId, version2);
  }
  toString() {
    return `${this.extensionId}@${this.version}`;
  }
};

function isLocationLink(thing) {
  return !!thing && URI.isUri(thing.uri) && Range2.isIRange(thing.range) && (Range2.isIRange(thing.originSelectionRange) || Range2.isIRange(thing.targetSelectionRange));
}

function isLocation(thing) {
  return !!thing && URI.isUri(thing.uri) && Range2.isIRange(thing.range);
}

var symbolKindNames = {
  [17 /* Array */]: localize(868, null),
  [16 /* Boolean */]: localize(869, null),
  [4 /* Class */]: localize(870, null),
  [13 /* Constant */]: localize(871, null),
  [8 /* Constructor */]: localize(872, null),
  [9 /* Enum */]: localize(873, null),
  [21 /* EnumMember */]: localize(874, null),
  [23 /* Event */]: localize(875, null),
  [7 /* Field */]: localize(876, null),
  [0 /* File */]: localize(877, null),
  [11 /* Function */]: localize(878, null),
  [10 /* Interface */]: localize(879, null),
  [19 /* Key */]: localize(880, null),
  [5 /* Method */]: localize(881, null),
  [1 /* Module */]: localize(882, null),
  [2 /* Namespace */]: localize(883, null),
  [20 /* Null */]: localize(884, null),
  [15 /* Number */]: localize(885, null),
  [18 /* Object */]: localize(886, null),
  [24 /* Operator */]: localize(887, null),
  [3 /* Package */]: localize(888, null),
  [6 /* Property */]: localize(889, null),
  [14 /* String */]: localize(890, null),
  [22 /* Struct */]: localize(891, null),
  [25 /* TypeParameter */]: localize(922, null),
  [12 /* Variable */]: localize(923, null)
};

function getAriaLabelForSymbol(symbolName, kind) {
  return localize(921, null, symbolName, symbolKindNames[kind]);
}

var SymbolKinds;

((SymbolKinds2) => {
  const byKind = /* @__PURE__ */ new Map();
  byKind.set(0 /* File */, Codicon.symbolFile);
  byKind.set(1 /* Module */, Codicon.symbolModule);
  byKind.set(2 /* Namespace */, Codicon.symbolNamespace);
  byKind.set(3 /* Package */, Codicon.symbolPackage);
  byKind.set(4 /* Class */, Codicon.symbolClass);
  byKind.set(5 /* Method */, Codicon.symbolMethod);
  byKind.set(6 /* Property */, Codicon.symbolProperty);
  byKind.set(7 /* Field */, Codicon.symbolField);
  byKind.set(8 /* Constructor */, Codicon.symbolConstructor);
  byKind.set(9 /* Enum */, Codicon.symbolEnum);
  byKind.set(10 /* Interface */, Codicon.symbolInterface);
  byKind.set(11 /* Function */, Codicon.symbolFunction);
  byKind.set(12 /* Variable */, Codicon.symbolVariable);
  byKind.set(13 /* Constant */, Codicon.symbolConstant);
  byKind.set(14 /* String */, Codicon.symbolString);
  byKind.set(15 /* Number */, Codicon.symbolNumber);
  byKind.set(16 /* Boolean */, Codicon.symbolBoolean);
  byKind.set(17 /* Array */, Codicon.symbolArray);
  byKind.set(18 /* Object */, Codicon.symbolObject);
  byKind.set(19 /* Key */, Codicon.symbolKey);
  byKind.set(20 /* Null */, Codicon.symbolNull);
  byKind.set(21 /* EnumMember */, Codicon.symbolEnumMember);
  byKind.set(22 /* Struct */, Codicon.symbolStruct);
  byKind.set(23 /* Event */, Codicon.symbolEvent);
  byKind.set(24 /* Operator */, Codicon.symbolOperator);
  byKind.set(25 /* TypeParameter */, Codicon.symbolTypeParameter);
  function toIcon(kind) {
    let icon2 = byKind.get(kind);
    if (!icon2) {
      console.info("No codicon found for SymbolKind " + kind);
      icon2 = Codicon.symbolProperty;
    }
    return icon2;
  }
  SymbolKinds2.toIcon = toIcon;
  const byCompletionKind = /* @__PURE__ */ new Map();
  byCompletionKind.set(0 /* File */, 20 /* File */);
  byCompletionKind.set(1 /* Module */, 8 /* Module */);
  byCompletionKind.set(2 /* Namespace */, 8 /* Module */);
  byCompletionKind.set(3 /* Package */, 8 /* Module */);
  byCompletionKind.set(4 /* Class */, 5 /* Class */);
  byCompletionKind.set(5 /* Method */, 0 /* Method */);
  byCompletionKind.set(6 /* Property */, 9 /* Property */);
  byCompletionKind.set(7 /* Field */, 3 /* Field */);
  byCompletionKind.set(8 /* Constructor */, 2 /* Constructor */);
  byCompletionKind.set(9 /* Enum */, 15 /* Enum */);
  byCompletionKind.set(10 /* Interface */, 7 /* Interface */);
  byCompletionKind.set(11 /* Function */, 1 /* Function */);
  byCompletionKind.set(12 /* Variable */, 4 /* Variable */);
  byCompletionKind.set(13 /* Constant */, 14 /* Constant */);
  byCompletionKind.set(14 /* String */, 18 /* Text */);
  byCompletionKind.set(15 /* Number */, 13 /* Value */);
  byCompletionKind.set(16 /* Boolean */, 13 /* Value */);
  byCompletionKind.set(17 /* Array */, 13 /* Value */);
  byCompletionKind.set(18 /* Object */, 13 /* Value */);
  byCompletionKind.set(19 /* Key */, 17 /* Keyword */);
  byCompletionKind.set(20 /* Null */, 13 /* Value */);
  byCompletionKind.set(21 /* EnumMember */, 16 /* EnumMember */);
  byCompletionKind.set(22 /* Struct */, 6 /* Struct */);
  byCompletionKind.set(23 /* Event */, 10 /* Event */);
  byCompletionKind.set(24 /* Operator */, 11 /* Operator */);
  byCompletionKind.set(25 /* TypeParameter */, 24 /* TypeParameter */);
  function toCompletionKind(kind) {
    let completionKind = byCompletionKind.get(kind);
    if (completionKind === void 0) {
      console.info("No completion kind found for SymbolKind " + kind);
      completionKind = 20 /* File */;
    }
    return completionKind;
  }
  SymbolKinds2.toCompletionKind = toCompletionKind;
})(SymbolKinds || (SymbolKinds = {}));

var TextEdit = class {
  static asEditOperation(edit3) {
    const range2 = Range2.lift(edit3.range);
    return range2.isEmpty() ? EditOperation.insert(range2.getStartPosition(), edit3.text) : EditOperation.replace(range2, edit3.text);
  }
  static isTextEdit(thing) {
    const possibleTextEdit = thing;
    return typeof possibleTextEdit.text === "string" && Range2.isIRange(possibleTextEdit.range);
  }
};

var FoldingRangeKind = class _FoldingRangeKind {
  /**
   * Creates a new {@link FoldingRangeKind}.
   *
   * @param value of the kind.
   */
  constructor(value2) {
    this.value = value2;
  }
  static {
    /**
     * Kind for folding range representing a comment. The value of the kind is 'comment'.
     */
    this.Comment = new _FoldingRangeKind("comment");
  }
  static {
    /**
     * Kind for folding range representing a import. The value of the kind is 'imports'.
     */
    this.Imports = new _FoldingRangeKind("imports");
  }
  static {
    /**
     * Kind for folding range representing regions (for example marked by `#region`, `#endregion`).
     * The value of the kind is 'region'.
     */
    this.Region = new _FoldingRangeKind("region");
  }
  /**
   * Returns a {@link FoldingRangeKind} for the given value.
   *
   * @param value of the kind.
   */
  static fromValue(value2) {
    switch (value2) {
      case "comment":
        return _FoldingRangeKind.Comment;
      case "imports":
        return _FoldingRangeKind.Imports;
      case "region":
        return _FoldingRangeKind.Region;
    }
    return new _FoldingRangeKind(value2);
  }
};

var Command2;

((Command9) => {
  function is(obj) {
    if (!obj || typeof obj !== "object") {
      return false;
    }
    return typeof obj.id === "string" && typeof obj.title === "string";
  }
  Command9.is = is;
})(Command2 || (Command2 = {}));

var LazyTokenizationSupport = class {
  constructor(createSupport) {
    this.createSupport = createSupport;
    this._tokenizationSupport = null;
  }
  dispose() {
    if (this._tokenizationSupport) {
      this._tokenizationSupport.then((support) => {
        if (support) {
          support.dispose();
        }
      });
    }
  }
  get tokenizationSupport() {
    if (!this._tokenizationSupport) {
      this._tokenizationSupport = this.createSupport();
    }
    return this._tokenizationSupport;
  }
};

var TokenizationRegistry2 = new TokenizationRegistry();
export { isLocationLink, isLocation, getAriaLabelForSymbol, Token2, EncodedTokenizationResult, CompletionItemKinds, SelectedSuggestionInfo, ProviderId, VersionedExtensionId, symbolKindNames, SymbolKinds, TextEdit, FoldingRangeKind, Command2, LazyTokenizationSupport, TokenizationRegistry2 };
