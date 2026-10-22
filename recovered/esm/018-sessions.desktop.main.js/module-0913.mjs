// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/api/common/extHostTypes.ts
import { __decorateClass, __privateAdd, __privateGet, __privateMethod, __privateSet } from "./module-0000.mjs";
import { es5ClassCompat } from "./module-0897.mjs";
import { ExtensionIdentifier } from "./module-0688.mjs";
import { URI, isUriComponents } from "./module-0032.mjs";
import { illegalArgument } from "./module-0004.mjs";
import { Range4 } from "./module-0900.mjs";
import { generateUuid } from "./module-0190.mjs";
import { isNumber, isObject, isString } from "./module-0010.mjs";
import { MarkdownString2 } from "./module-0898.mjs";
import { markAsFileSystemProviderError } from "./module-0269.mjs";
import { asArray } from "./module-0007.mjs";
import { VSBuffer, encodeBase64 } from "./module-0038.mjs";
import { Mimes } from "./module-0136.mjs";


// src/vs/workbench/api/common/extHostTypes.ts
var _callOnDispose;

var Disposable3 = class {
  constructor(callOnDispose) {
    __privateAdd(this, _callOnDispose);
    __privateSet(this, _callOnDispose, callOnDispose);
  }
  static from(...inDisposables) {
    let disposables = inDisposables;
    return new Disposable3(function() {
      if (disposables) {
        for (const disposable of disposables) {
          if (disposable && typeof disposable.dispose === "function") {
            disposable.dispose();
          }
        }
        disposables = void 0;
      }
    });
  }
  dispose() {
    if (typeof __privateGet(this, _callOnDispose) === "function") {
      __privateGet(this, _callOnDispose).call(this);
      __privateSet(this, _callOnDispose, void 0);
    }
  }
};

_callOnDispose = new WeakMap();

Disposable3 = __decorateClass([
  es5ClassCompat
], Disposable3);

var Hover2 = class {
  constructor(contents, range2) {
    if (!contents) {
      throw new Error("Illegal argument, contents must be defined");
    }
    if (Array.isArray(contents)) {
      this.contents = contents;
    } else {
      this.contents = [contents];
    }
    this.range = range2;
  }
};

Hover2 = __decorateClass([
  es5ClassCompat
], Hover2);

var VerboseHover = class extends Hover2 {
  constructor(contents, range2, canIncreaseVerbosity, canDecreaseVerbosity) {
    super(contents, range2);
    this.canIncreaseVerbosity = canIncreaseVerbosity;
    this.canDecreaseVerbosity = canDecreaseVerbosity;
  }
};

VerboseHover = __decorateClass([
  es5ClassCompat
], VerboseHover);

var DocumentHighlightKind2 = /* @__PURE__ */ ((DocumentHighlightKind3) => {
  DocumentHighlightKind3[DocumentHighlightKind3["Text"] = 0] = "Text";
  DocumentHighlightKind3[DocumentHighlightKind3["Read"] = 1] = "Read";
  DocumentHighlightKind3[DocumentHighlightKind3["Write"] = 2] = "Write";
  return DocumentHighlightKind3;
})(DocumentHighlightKind2 || {});

var DocumentHighlight2 = class {
  constructor(range2, kind = 0 /* Text */) {
    this.range = range2;
    this.kind = kind;
  }
  toJSON() {
    return {
      range: this.range,
      kind: DocumentHighlightKind2[this.kind]
    };
  }
};

DocumentHighlight2 = __decorateClass([
  es5ClassCompat
], DocumentHighlight2);

var MultiDocumentHighlight = class {
  constructor(uri4, highlights) {
    this.uri = uri4;
    this.highlights = highlights;
  }
  toJSON() {
    return {
      uri: this.uri,
      highlights: this.highlights.map((h3) => h3.toJSON())
    };
  }
};

MultiDocumentHighlight = __decorateClass([
  es5ClassCompat
], MultiDocumentHighlight);

var DocumentSymbol = class {
  static validate(candidate) {
    if (!candidate.name) {
      throw new Error("name must not be falsy");
    }
    if (!candidate.range.contains(candidate.selectionRange)) {
      throw new Error("selectionRange must be contained in fullRange");
    }
    candidate.children?.forEach(DocumentSymbol.validate);
  }
  constructor(name, detail2, kind, range2, selectionRange) {
    this.name = name;
    this.detail = detail2;
    this.kind = kind;
    this.range = range2;
    this.selectionRange = selectionRange;
    this.children = [];
    DocumentSymbol.validate(this);
  }
};

DocumentSymbol = __decorateClass([
  es5ClassCompat
], DocumentSymbol);

var CodeAction = class {
  constructor(title, kind) {
    this.title = title;
    this.kind = kind;
  }
};

CodeAction = __decorateClass([
  es5ClassCompat
], CodeAction);

var SelectionRange = class {
  constructor(range2, parent) {
    this.range = range2;
    this.parent = parent;
    if (parent && !parent.range.contains(this.range)) {
      throw new Error("Invalid argument: parent must contain this range");
    }
  }
};

SelectionRange = __decorateClass([
  es5ClassCompat
], SelectionRange);

var CallHierarchyItem = class {
  constructor(kind, name, detail2, uri4, range2, selectionRange) {
    this.kind = kind;
    this.name = name;
    this.detail = detail2;
    this.uri = uri4;
    this.range = range2;
    this.selectionRange = selectionRange;
  }
};

var CallHierarchyIncomingCall = class {
  constructor(item, fromRanges) {
    this.fromRanges = fromRanges;
    this.from = item;
  }
};

var CallHierarchyOutgoingCall = class {
  constructor(item, fromRanges) {
    this.fromRanges = fromRanges;
    this.to = item;
  }
};

var CodeLens = class {
  constructor(range2, command4) {
    this.range = range2;
    this.command = command4;
  }
  get isResolved() {
    return !!this.command;
  }
};

CodeLens = __decorateClass([
  es5ClassCompat
], CodeLens);

var ParameterInformation = class {
  constructor(label3, documentation) {
    this.label = label3;
    this.documentation = documentation;
  }
};

ParameterInformation = __decorateClass([
  es5ClassCompat
], ParameterInformation);

var SignatureInformation = class {
  constructor(label3, documentation) {
    this.label = label3;
    this.documentation = documentation;
    this.parameters = [];
  }
};

SignatureInformation = __decorateClass([
  es5ClassCompat
], SignatureInformation);

var SignatureHelp = class {
  constructor() {
    this.activeSignature = 0;
    this.activeParameter = 0;
    this.signatures = [];
  }
};

SignatureHelp = __decorateClass([
  es5ClassCompat
], SignatureHelp);

var InlayHintLabelPart = class {
  constructor(value2) {
    this.value = value2;
  }
};

InlayHintLabelPart = __decorateClass([
  es5ClassCompat
], InlayHintLabelPart);

var InlayHint = class {
  constructor(position2, label3, kind) {
    this.position = position2;
    this.label = label3;
    this.kind = kind;
  }
};

InlayHint = __decorateClass([
  es5ClassCompat
], InlayHint);

var CompletionItemKind4 = /* @__PURE__ */ ((CompletionItemKind7) => {
  CompletionItemKind7[CompletionItemKind7["Text"] = 0] = "Text";
  CompletionItemKind7[CompletionItemKind7["Method"] = 1] = "Method";
  CompletionItemKind7[CompletionItemKind7["Function"] = 2] = "Function";
  CompletionItemKind7[CompletionItemKind7["Constructor"] = 3] = "Constructor";
  CompletionItemKind7[CompletionItemKind7["Field"] = 4] = "Field";
  CompletionItemKind7[CompletionItemKind7["Variable"] = 5] = "Variable";
  CompletionItemKind7[CompletionItemKind7["Class"] = 6] = "Class";
  CompletionItemKind7[CompletionItemKind7["Interface"] = 7] = "Interface";
  CompletionItemKind7[CompletionItemKind7["Module"] = 8] = "Module";
  CompletionItemKind7[CompletionItemKind7["Property"] = 9] = "Property";
  CompletionItemKind7[CompletionItemKind7["Unit"] = 10] = "Unit";
  CompletionItemKind7[CompletionItemKind7["Value"] = 11] = "Value";
  CompletionItemKind7[CompletionItemKind7["Enum"] = 12] = "Enum";
  CompletionItemKind7[CompletionItemKind7["Keyword"] = 13] = "Keyword";
  CompletionItemKind7[CompletionItemKind7["Snippet"] = 14] = "Snippet";
  CompletionItemKind7[CompletionItemKind7["Color"] = 15] = "Color";
  CompletionItemKind7[CompletionItemKind7["File"] = 16] = "File";
  CompletionItemKind7[CompletionItemKind7["Reference"] = 17] = "Reference";
  CompletionItemKind7[CompletionItemKind7["Folder"] = 18] = "Folder";
  CompletionItemKind7[CompletionItemKind7["EnumMember"] = 19] = "EnumMember";
  CompletionItemKind7[CompletionItemKind7["Constant"] = 20] = "Constant";
  CompletionItemKind7[CompletionItemKind7["Struct"] = 21] = "Struct";
  CompletionItemKind7[CompletionItemKind7["Event"] = 22] = "Event";
  CompletionItemKind7[CompletionItemKind7["Operator"] = 23] = "Operator";
  CompletionItemKind7[CompletionItemKind7["TypeParameter"] = 24] = "TypeParameter";
  CompletionItemKind7[CompletionItemKind7["User"] = 25] = "User";
  CompletionItemKind7[CompletionItemKind7["Issue"] = 26] = "Issue";
  return CompletionItemKind7;
})(CompletionItemKind4 || {});

var CompletionItem8 = class {
  constructor(label3, kind) {
    this.label = label3;
    this.kind = kind;
  }
  toJSON() {
    return {
      label: this.label,
      kind: this.kind && CompletionItemKind4[this.kind],
      detail: this.detail,
      documentation: this.documentation,
      sortText: this.sortText,
      filterText: this.filterText,
      preselect: this.preselect,
      insertText: this.insertText,
      textEdit: this.textEdit
    };
  }
};

CompletionItem8 = __decorateClass([
  es5ClassCompat
], CompletionItem8);

var CompletionList = class {
  constructor(items = [], isIncomplete = false) {
    this.items = items;
    this.isIncomplete = isIncomplete;
  }
};

CompletionList = __decorateClass([
  es5ClassCompat
], CompletionList);

var InlineSuggestion = class {
  constructor(insertText, range2, command4) {
    this.insertText = insertText;
    this.range = range2;
    this.command = command4;
  }
};

InlineSuggestion = __decorateClass([
  es5ClassCompat
], InlineSuggestion);

var InlineSuggestionList3 = class {
  constructor(items) {
    this.commands = void 0;
    this.suppressSuggestions = void 0;
    this.items = items;
  }
};

InlineSuggestionList3 = __decorateClass([
  es5ClassCompat
], InlineSuggestionList3);

function asStatusBarItemIdentifier(extension, id2) {
  return `${ExtensionIdentifier.toKey(extension)}.${id2}`;
}

var TextEditorSelectionChangeKind = /* @__PURE__ */ ((TextEditorSelectionChangeKind2) => {
  TextEditorSelectionChangeKind2[TextEditorSelectionChangeKind2["Keyboard"] = 1] = "Keyboard";
  TextEditorSelectionChangeKind2[TextEditorSelectionChangeKind2["Mouse"] = 2] = "Mouse";
  TextEditorSelectionChangeKind2[TextEditorSelectionChangeKind2["Command"] = 3] = "Command";
  return TextEditorSelectionChangeKind2;
})(TextEditorSelectionChangeKind || {});

((TextEditorSelectionChangeKind2) => {
  function fromValue(s) {
    switch (s) {
      case "keyboard":
        return 1 /* Keyboard */;
      case "mouse":
        return 2 /* Mouse */;
      case "api" /* PROGRAMMATIC */:
      case "code.jump" /* JUMP */:
      case "code.navigation" /* NAVIGATION */:
        return 3 /* Command */;
    }
    return void 0;
  }
  TextEditorSelectionChangeKind2.fromValue = fromValue;
})(TextEditorSelectionChangeKind || (TextEditorSelectionChangeKind = {}));

var SyntaxTokenType = /* @__PURE__ */ ((SyntaxTokenType2) => {
  SyntaxTokenType2[SyntaxTokenType2["Other"] = 0] = "Other";
  SyntaxTokenType2[SyntaxTokenType2["Comment"] = 1] = "Comment";
  SyntaxTokenType2[SyntaxTokenType2["String"] = 2] = "String";
  SyntaxTokenType2[SyntaxTokenType2["RegEx"] = 3] = "RegEx";
  return SyntaxTokenType2;
})(SyntaxTokenType || {});

((SyntaxTokenType2) => {
  function toString(v2) {
    switch (v2) {
      case 0 /* Other */:
        return "other";
      case 1 /* Comment */:
        return "comment";
      case 2 /* String */:
        return "string";
      case 3 /* RegEx */:
        return "regex";
    }
    return "other";
  }
  SyntaxTokenType2.toString = toString;
})(SyntaxTokenType || (SyntaxTokenType = {}));

var DocumentLink = class {
  constructor(range2, target) {
    if (target && !URI.isUri(target)) {
      throw illegalArgument("target");
    }
    if (!Range4.isRange(range2) || range2.isEmpty) {
      throw illegalArgument("range");
    }
    this.range = range2;
    this.target = target;
  }
};

DocumentLink = __decorateClass([
  es5ClassCompat
], DocumentLink);

var Color2 = class {
  constructor(red, green, blue, alpha) {
    this.red = red;
    this.green = green;
    this.blue = blue;
    this.alpha = alpha;
  }
};

Color2 = __decorateClass([
  es5ClassCompat
], Color2);

var ColorInformation = class {
  constructor(range2, color2) {
    if (color2 && !(color2 instanceof Color2)) {
      throw illegalArgument("color");
    }
    if (!Range4.isRange(range2) || range2.isEmpty) {
      throw illegalArgument("range");
    }
    this.range = range2;
    this.color = color2;
  }
};

ColorInformation = __decorateClass([
  es5ClassCompat
], ColorInformation);

var ColorPresentation = class {
  constructor(label3) {
    if (!label3 || typeof label3 !== "string") {
      throw illegalArgument("label");
    }
    this.label = label3;
  }
};

ColorPresentation = __decorateClass([
  es5ClassCompat
], ColorPresentation);

var TaskGroup = class {
  constructor(id2, label3) {
    this.label = label3;
    if (typeof id2 !== "string") {
      throw illegalArgument("name");
    }
    if (typeof label3 !== "string") {
      throw illegalArgument("name");
    }
    this._id = id2;
  }
  static from(value2) {
    switch (value2) {
      case "clean":
        return TaskGroup.Clean;
      case "build":
        return TaskGroup.Build;
      case "rebuild":
        return TaskGroup.Rebuild;
      case "test":
        return TaskGroup.Test;
      default:
        return void 0;
    }
  }
  get id() {
    return this._id;
  }
};

TaskGroup.Clean = new TaskGroup("clean", "Clean");

TaskGroup.Build = new TaskGroup("build", "Build");

TaskGroup.Rebuild = new TaskGroup("rebuild", "Rebuild");

TaskGroup.Test = new TaskGroup("test", "Test");

TaskGroup = __decorateClass([
  es5ClassCompat
], TaskGroup);

function computeTaskExecutionId(values) {
  let id2 = "";
  for (let i2 = 0; i2 < values.length; i2++) {
    id2 += values[i2].replace(/,/g, ",,") + ",";
  }
  return id2;
}

var ProcessExecution = class {
  constructor(process3, varg1, varg2) {
    if (typeof process3 !== "string") {
      throw illegalArgument("process");
    }
    this._args = [];
    this._process = process3;
    if (varg1 !== void 0) {
      if (Array.isArray(varg1)) {
        this._args = varg1;
        this._options = varg2;
      } else {
        this._options = varg1;
      }
    }
  }
  get process() {
    return this._process;
  }
  set process(value2) {
    if (typeof value2 !== "string") {
      throw illegalArgument("process");
    }
    this._process = value2;
  }
  get args() {
    return this._args;
  }
  set args(value2) {
    if (!Array.isArray(value2)) {
      value2 = [];
    }
    this._args = value2;
  }
  get options() {
    return this._options;
  }
  set options(value2) {
    this._options = value2;
  }
  computeId() {
    const props = [];
    props.push("process");
    if (this._process !== void 0) {
      props.push(this._process);
    }
    if (this._args && this._args.length > 0) {
      for (const arg of this._args) {
        props.push(arg);
      }
    }
    return computeTaskExecutionId(props);
  }
};

ProcessExecution = __decorateClass([
  es5ClassCompat
], ProcessExecution);

var ShellExecution = class {
  constructor(arg0, arg1, arg2) {
    this._args = [];
    if (Array.isArray(arg1)) {
      if (!arg0) {
        throw illegalArgument("command can't be undefined or null");
      }
      if (typeof arg0 !== "string" && typeof arg0.value !== "string") {
        throw illegalArgument("command");
      }
      this._command = arg0;
      if (arg1) {
        this._args = arg1;
      }
      this._options = arg2;
    } else {
      if (typeof arg0 !== "string") {
        throw illegalArgument("commandLine");
      }
      this._commandLine = arg0;
      this._options = arg1;
    }
  }
  get commandLine() {
    return this._commandLine;
  }
  set commandLine(value2) {
    if (typeof value2 !== "string") {
      throw illegalArgument("commandLine");
    }
    this._commandLine = value2;
  }
  get command() {
    return this._command ? this._command : "";
  }
  set command(value2) {
    if (typeof value2 !== "string" && typeof value2.value !== "string") {
      throw illegalArgument("command");
    }
    this._command = value2;
  }
  get args() {
    return this._args;
  }
  set args(value2) {
    this._args = value2 || [];
  }
  get options() {
    return this._options;
  }
  set options(value2) {
    this._options = value2;
  }
  computeId() {
    const props = [];
    props.push("shell");
    if (this._commandLine !== void 0) {
      props.push(this._commandLine);
    }
    if (this._command !== void 0) {
      props.push(typeof this._command === "string" ? this._command : this._command.value);
    }
    if (this._args && this._args.length > 0) {
      for (const arg of this._args) {
        props.push(typeof arg === "string" ? arg : arg.value);
      }
    }
    return computeTaskExecutionId(props);
  }
};

ShellExecution = __decorateClass([
  es5ClassCompat
], ShellExecution);

var CustomExecution = class {
  constructor(callback) {
    this._callback = callback;
  }
  computeId() {
    return "customExecution" + generateUuid();
  }
  set callback(value2) {
    this._callback = value2;
  }
  get callback() {
    return this._callback;
  }
};

var Task = class {
  constructor(definition, arg2, arg3, arg4, arg5, arg6) {
    this.__deprecated = false;
    this._definition = this.definition = definition;
    let problemMatchers;
    if (typeof arg2 === "string") {
      this._name = this.name = arg2;
      this._source = this.source = arg3;
      this.execution = arg4;
      problemMatchers = arg5;
      this.__deprecated = true;
    } else if (arg2 === 1 /* Global */ || arg2 === 2 /* Workspace */) {
      this.target = arg2;
      this._name = this.name = arg3;
      this._source = this.source = arg4;
      this.execution = arg5;
      problemMatchers = arg6;
    } else {
      this.target = arg2;
      this._name = this.name = arg3;
      this._source = this.source = arg4;
      this.execution = arg5;
      problemMatchers = arg6;
    }
    if (typeof problemMatchers === "string") {
      this._problemMatchers = [problemMatchers];
      this._hasDefinedMatchers = true;
    } else if (Array.isArray(problemMatchers)) {
      this._problemMatchers = problemMatchers;
      this._hasDefinedMatchers = true;
    } else {
      this._problemMatchers = [];
      this._hasDefinedMatchers = false;
    }
    this._isBackground = false;
    this._presentationOptions = /* @__PURE__ */ Object.create(null);
    this._runOptions = /* @__PURE__ */ Object.create(null);
  }
  get _id() {
    return this.__id;
  }
  set _id(value2) {
    this.__id = value2;
  }
  get _deprecated() {
    return this.__deprecated;
  }
  clear() {
    if (this.__id === void 0) {
      return;
    }
    this.__id = void 0;
    this._scope = void 0;
    this.computeDefinitionBasedOnExecution();
  }
  computeDefinitionBasedOnExecution() {
    if (this._execution instanceof ProcessExecution) {
      this._definition = {
        type: Task.ProcessType,
        id: this._execution.computeId()
      };
    } else if (this._execution instanceof ShellExecution) {
      this._definition = {
        type: Task.ShellType,
        id: this._execution.computeId()
      };
    } else if (this._execution instanceof CustomExecution) {
      this._definition = {
        type: Task.ExtensionCallbackType,
        id: this._execution.computeId()
      };
    } else {
      this._definition = {
        type: Task.EmptyType,
        id: generateUuid()
      };
    }
  }
  get definition() {
    return this._definition;
  }
  set definition(value2) {
    if (value2 === void 0 || value2 === null) {
      throw illegalArgument("Kind can't be undefined or null");
    }
    this.clear();
    this._definition = value2;
  }
  get scope() {
    return this._scope;
  }
  set target(value2) {
    this.clear();
    this._scope = value2;
  }
  get name() {
    return this._name;
  }
  set name(value2) {
    if (typeof value2 !== "string") {
      throw illegalArgument("name");
    }
    this.clear();
    this._name = value2;
  }
  get execution() {
    return this._execution;
  }
  set execution(value2) {
    if (value2 === null) {
      value2 = void 0;
    }
    this.clear();
    this._execution = value2;
    const type = this._definition.type;
    if (Task.EmptyType === type || Task.ProcessType === type || Task.ShellType === type || Task.ExtensionCallbackType === type) {
      this.computeDefinitionBasedOnExecution();
    }
  }
  get problemMatchers() {
    return this._problemMatchers;
  }
  set problemMatchers(value2) {
    if (!Array.isArray(value2)) {
      this.clear();
      this._problemMatchers = [];
      this._hasDefinedMatchers = false;
      return;
    } else {
      this.clear();
      this._problemMatchers = value2;
      this._hasDefinedMatchers = true;
    }
  }
  get hasDefinedMatchers() {
    return this._hasDefinedMatchers;
  }
  get isBackground() {
    return this._isBackground;
  }
  set isBackground(value2) {
    if (value2 !== true && value2 !== false) {
      value2 = false;
    }
    this.clear();
    this._isBackground = value2;
  }
  get source() {
    return this._source;
  }
  set source(value2) {
    if (typeof value2 !== "string" || value2.length === 0) {
      throw illegalArgument("source must be a string of length > 0");
    }
    this.clear();
    this._source = value2;
  }
  get group() {
    return this._group;
  }
  set group(value2) {
    if (value2 === null) {
      value2 = void 0;
    }
    this.clear();
    this._group = value2;
  }
  get detail() {
    return this._detail;
  }
  set detail(value2) {
    if (value2 === null) {
      value2 = void 0;
    }
    this._detail = value2;
  }
  get presentationOptions() {
    return this._presentationOptions;
  }
  set presentationOptions(value2) {
    if (value2 === null || value2 === void 0) {
      value2 = /* @__PURE__ */ Object.create(null);
    }
    this.clear();
    this._presentationOptions = value2;
  }
  get runOptions() {
    return this._runOptions;
  }
  set runOptions(value2) {
    if (value2 === null || value2 === void 0) {
      value2 = /* @__PURE__ */ Object.create(null);
    }
    this.clear();
    this._runOptions = value2;
  }
};

Task.ExtensionCallbackType = "customExecution";

Task.ProcessType = "process";

Task.ShellType = "shell";

Task.EmptyType = "$empty";

Task = __decorateClass([
  es5ClassCompat
], Task);

var ViewBadge;

((ViewBadge3) => {
  function isViewBadge(thing) {
    const viewBadgeThing = thing;
    if (!isNumber(viewBadgeThing.value)) {
      console.log("INVALID view badge, invalid value", viewBadgeThing.value);
      return false;
    }
    if (viewBadgeThing.tooltip && !isString(viewBadgeThing.tooltip)) {
      console.log("INVALID view badge, invalid tooltip", viewBadgeThing.tooltip);
      return false;
    }
    return true;
  }
  ViewBadge3.isViewBadge = isViewBadge;
})(ViewBadge || (ViewBadge = {}));

var TreeItem = class {
  constructor(arg1, collapsibleState = 0 /* None */) {
    this.collapsibleState = collapsibleState;
    if (URI.isUri(arg1)) {
      this.resourceUri = arg1;
    } else {
      this.label = arg1;
    }
  }
  static isTreeItem(thing, extension) {
    const treeItemThing = thing;
    if (treeItemThing.checkboxState !== void 0) {
      const checkbox = isNumber(treeItemThing.checkboxState) ? treeItemThing.checkboxState : isObject(treeItemThing.checkboxState) && isNumber(treeItemThing.checkboxState.state) ? treeItemThing.checkboxState.state : void 0;
      const tooltip = !isNumber(treeItemThing.checkboxState) && isObject(treeItemThing.checkboxState) ? treeItemThing.checkboxState.tooltip : void 0;
      if (checkbox === void 0 || checkbox !== 1 /* Checked */ && checkbox !== 0 /* Unchecked */ || tooltip !== void 0 && !isString(tooltip)) {
        console.log("INVALID tree item, invalid checkboxState", treeItemThing.checkboxState);
        return false;
      }
    }
    if (thing instanceof TreeItem) {
      return true;
    }
    if (treeItemThing.label !== void 0 && !isString(treeItemThing.label) && !treeItemThing.label?.label) {
      console.log("INVALID tree item, invalid label", treeItemThing.label);
      return false;
    }
    if (treeItemThing.id !== void 0 && !isString(treeItemThing.id)) {
      console.log("INVALID tree item, invalid id", treeItemThing.id);
      return false;
    }
    if (treeItemThing.iconPath !== void 0 && !isString(treeItemThing.iconPath) && !URI.isUri(treeItemThing.iconPath) && (!treeItemThing.iconPath || !isString(treeItemThing.iconPath.id))) {
      const asLightAndDarkThing = treeItemThing.iconPath;
      if (!asLightAndDarkThing || !isString(asLightAndDarkThing.light) && !URI.isUri(asLightAndDarkThing.light) && !isString(asLightAndDarkThing.dark) && !URI.isUri(asLightAndDarkThing.dark)) {
        console.log("INVALID tree item, invalid iconPath", treeItemThing.iconPath);
        return false;
      }
    }
    if (treeItemThing.description !== void 0 && !isString(treeItemThing.description) && typeof treeItemThing.description !== "boolean") {
      console.log("INVALID tree item, invalid description", treeItemThing.description);
      return false;
    }
    if (treeItemThing.resourceUri !== void 0 && !URI.isUri(treeItemThing.resourceUri)) {
      console.log("INVALID tree item, invalid resourceUri", treeItemThing.resourceUri);
      return false;
    }
    if (treeItemThing.tooltip !== void 0 && !isString(treeItemThing.tooltip) && !(treeItemThing.tooltip instanceof MarkdownString2)) {
      console.log("INVALID tree item, invalid tooltip", treeItemThing.tooltip);
      return false;
    }
    if (treeItemThing.command !== void 0 && !treeItemThing.command.command) {
      console.log("INVALID tree item, invalid command", treeItemThing.command);
      return false;
    }
    if (treeItemThing.collapsibleState !== void 0 && treeItemThing.collapsibleState < 0 /* None */ && treeItemThing.collapsibleState > 2 /* Expanded */) {
      console.log("INVALID tree item, invalid collapsibleState", treeItemThing.collapsibleState);
      return false;
    }
    if (treeItemThing.contextValue !== void 0 && !isString(treeItemThing.contextValue)) {
      console.log("INVALID tree item, invalid contextValue", treeItemThing.contextValue);
      return false;
    }
    if (treeItemThing.accessibilityInformation !== void 0 && !treeItemThing.accessibilityInformation?.label) {
      console.log("INVALID tree item, invalid accessibilityInformation", treeItemThing.accessibilityInformation);
      return false;
    }
    return true;
  }
};

TreeItem = __decorateClass([
  es5ClassCompat
], TreeItem);

var DataTransferItem = class {
  constructor(value2) {
    this.value = value2;
  }
  async asString() {
    return typeof this.value === "string" ? this.value : JSON.stringify(this.value);
  }
  asFile() {
    return void 0;
  }
};

DataTransferItem = __decorateClass([
  es5ClassCompat
], DataTransferItem);

var InternalDataTransferItem = class extends DataTransferItem {
};

var InternalFileDataTransferItem = class extends InternalDataTransferItem {
  #file;
  constructor(file) {
    super("");
    this.#file = file;
  }
  asFile() {
    return this.#file;
  }
};

var DataTransferFile = class {
  constructor(name, uri4, itemId, getData) {
    this.name = name;
    this.uri = uri4;
    this._itemId = itemId;
    this._getData = getData;
  }
  data() {
    return this._getData();
  }
};

var _items, _DataTransfer_instances, normalizeMime_fn;

var DataTransfer = class {
  constructor(init) {
    __privateAdd(this, _DataTransfer_instances);
    __privateAdd(this, _items, /* @__PURE__ */ new Map());
    for (const [mime, item] of init ?? []) {
      const existing = __privateGet(this, _items).get(__privateMethod(this, _DataTransfer_instances, normalizeMime_fn).call(this, mime));
      if (existing) {
        existing.push(item);
      } else {
        __privateGet(this, _items).set(__privateMethod(this, _DataTransfer_instances, normalizeMime_fn).call(this, mime), [item]);
      }
    }
  }
  get(mimeType) {
    return __privateGet(this, _items).get(__privateMethod(this, _DataTransfer_instances, normalizeMime_fn).call(this, mimeType))?.[0];
  }
  set(mimeType, value2) {
    __privateGet(this, _items).set(__privateMethod(this, _DataTransfer_instances, normalizeMime_fn).call(this, mimeType), [value2]);
  }
  forEach(callbackfn, thisArg) {
    for (const [mime, items] of __privateGet(this, _items)) {
      for (const item of items) {
        callbackfn.call(thisArg, item, mime, this);
      }
    }
  }
  *[Symbol.iterator]() {
    for (const [mime, items] of __privateGet(this, _items)) {
      for (const item of items) {
        yield [mime, item];
      }
    }
  }
};

_items = new WeakMap();

_DataTransfer_instances = new WeakSet();

normalizeMime_fn = function(mimeType) {
  return mimeType.toLowerCase();
};

DataTransfer = __decorateClass([
  es5ClassCompat
], DataTransfer);

var DocumentDropEdit = class {
  constructor(insertText, title, kind) {
    this.insertText = insertText;
    this.title = title;
    this.kind = kind;
  }
};

DocumentDropEdit = __decorateClass([
  es5ClassCompat
], DocumentDropEdit);

var DocumentDropOrPasteEditKind = class _DocumentDropOrPasteEditKind {
  constructor(value2) {
    this.value = value2;
  }
  static {
    this.sep = ".";
  }
  append(...parts) {
    return new _DocumentDropOrPasteEditKind((this.value ? [this.value, ...parts] : parts).join(_DocumentDropOrPasteEditKind.sep));
  }
  intersects(other) {
    return this.contains(other) || other.contains(this);
  }
  contains(other) {
    return this.value === other.value || other.value.startsWith(this.value + _DocumentDropOrPasteEditKind.sep);
  }
};

DocumentDropOrPasteEditKind.Empty = new DocumentDropOrPasteEditKind("");

DocumentDropOrPasteEditKind.Text = new DocumentDropOrPasteEditKind("text");

DocumentDropOrPasteEditKind.TextUpdateImports = DocumentDropOrPasteEditKind.Text.append("updateImports");

var ThemeIcon2 = class {
  constructor(id2, color2) {
    this.id = id2;
    this.color = color2;
  }
  static isThemeIcon(thing) {
    if (typeof thing.id !== "string") {
      console.log("INVALID ThemeIcon, invalid id", thing.id);
      return false;
    }
    return true;
  }
};

ThemeIcon2 = __decorateClass([
  es5ClassCompat
], ThemeIcon2);

ThemeIcon2.File = new ThemeIcon2("file");

ThemeIcon2.Folder = new ThemeIcon2("folder");

var ThemeColor2 = class {
  constructor(id2) {
    this.id = id2;
  }
};

ThemeColor2 = __decorateClass([
  es5ClassCompat
], ThemeColor2);

var RelativePattern = class {
  get base() {
    return this._base;
  }
  set base(base) {
    this._base = base;
    this._baseUri = URI.file(base);
  }
  get baseUri() {
    return this._baseUri;
  }
  set baseUri(baseUri) {
    this._baseUri = baseUri;
    this._base = baseUri.fsPath;
  }
  constructor(base, pattern) {
    if (typeof base !== "string") {
      if (!base || !URI.isUri(base) && !URI.isUri(base.uri)) {
        throw illegalArgument("base");
      }
    }
    if (typeof pattern !== "string") {
      throw illegalArgument("pattern");
    }
    if (typeof base === "string") {
      this.baseUri = URI.file(base);
    } else if (URI.isUri(base)) {
      this.baseUri = base;
    } else {
      this.baseUri = base.uri;
    }
    this.pattern = pattern;
  }
  toJSON() {
    return {
      pattern: this.pattern,
      base: this.base,
      baseUri: this.baseUri.toJSON()
    };
  }
};

RelativePattern = __decorateClass([
  es5ClassCompat
], RelativePattern);

var breakpointIds = /* @__PURE__ */ new WeakMap();

var Breakpoint = class {
  constructor(enabled, condition, hitCondition, logMessage, mode) {
    this.enabled = typeof enabled === "boolean" ? enabled : true;
    if (typeof condition === "string") {
      this.condition = condition;
    }
    if (typeof hitCondition === "string") {
      this.hitCondition = hitCondition;
    }
    if (typeof logMessage === "string") {
      this.logMessage = logMessage;
    }
    if (typeof mode === "string") {
      this.mode = mode;
    }
  }
  get id() {
    if (!this._id) {
      this._id = breakpointIds.get(this) ?? generateUuid();
    }
    return this._id;
  }
};

Breakpoint = __decorateClass([
  es5ClassCompat
], Breakpoint);

var SourceBreakpoint = class extends Breakpoint {
  constructor(location2, enabled, condition, hitCondition, logMessage, mode) {
    super(enabled, condition, hitCondition, logMessage, mode);
    if (location2 === null) {
      throw illegalArgument("location");
    }
    this.location = location2;
  }
};

SourceBreakpoint = __decorateClass([
  es5ClassCompat
], SourceBreakpoint);

var FunctionBreakpoint = class extends Breakpoint {
  constructor(functionName, enabled, condition, hitCondition, logMessage, mode) {
    super(enabled, condition, hitCondition, logMessage, mode);
    this.functionName = functionName;
  }
};

FunctionBreakpoint = __decorateClass([
  es5ClassCompat
], FunctionBreakpoint);

var DataBreakpoint = class extends Breakpoint {
  constructor(label3, dataId, canPersist, enabled, condition, hitCondition, logMessage, mode) {
    super(enabled, condition, hitCondition, logMessage, mode);
    if (!dataId) {
      throw illegalArgument("dataId");
    }
    this.label = label3;
    this.dataId = dataId;
    this.canPersist = canPersist;
  }
};

DataBreakpoint = __decorateClass([
  es5ClassCompat
], DataBreakpoint);

var DebugAdapterExecutable = class {
  constructor(command4, args2, options3) {
    this.command = command4;
    this.args = args2 || [];
    this.options = options3;
  }
};

DebugAdapterExecutable = __decorateClass([
  es5ClassCompat
], DebugAdapterExecutable);

var DebugAdapterServer = class {
  constructor(port, host) {
    this.port = port;
    this.host = host;
  }
};

DebugAdapterServer = __decorateClass([
  es5ClassCompat
], DebugAdapterServer);

var DebugAdapterNamedPipeServer = class {
  constructor(path) {
    this.path = path;
  }
};

DebugAdapterNamedPipeServer = __decorateClass([
  es5ClassCompat
], DebugAdapterNamedPipeServer);

var DebugAdapterInlineImplementation = class {
  constructor(impl) {
    this.implementation = impl;
  }
};

DebugAdapterInlineImplementation = __decorateClass([
  es5ClassCompat
], DebugAdapterInlineImplementation);

var EvaluatableExpression = class {
  constructor(range2, expression) {
    this.range = range2;
    this.expression = expression;
  }
};

EvaluatableExpression = __decorateClass([
  es5ClassCompat
], EvaluatableExpression);

var InlineValueText = class {
  constructor(range2, text2) {
    this.range = range2;
    this.text = text2;
  }
};

InlineValueText = __decorateClass([
  es5ClassCompat
], InlineValueText);

var InlineValueVariableLookup = class {
  constructor(range2, variableName, caseSensitiveLookup = true) {
    this.range = range2;
    this.variableName = variableName;
    this.caseSensitiveLookup = caseSensitiveLookup;
  }
};

InlineValueVariableLookup = __decorateClass([
  es5ClassCompat
], InlineValueVariableLookup);

var InlineValueEvaluatableExpression = class {
  constructor(range2, expression) {
    this.range = range2;
    this.expression = expression;
  }
};

InlineValueEvaluatableExpression = __decorateClass([
  es5ClassCompat
], InlineValueEvaluatableExpression);

var InlineValueContext = class {
  constructor(frameId, range2) {
    this.frameId = frameId;
    this.stoppedLocation = range2;
  }
};

InlineValueContext = __decorateClass([
  es5ClassCompat
], InlineValueContext);

var FileSystemError = class extends Error {
  static FileExists(messageOrUri) {
    return new FileSystemError(messageOrUri, "EntryExists" /* FileExists */, FileSystemError.FileExists);
  }
  static FileNotFound(messageOrUri) {
    return new FileSystemError(messageOrUri, "EntryNotFound" /* FileNotFound */, FileSystemError.FileNotFound);
  }
  static FileNotADirectory(messageOrUri) {
    return new FileSystemError(messageOrUri, "EntryNotADirectory" /* FileNotADirectory */, FileSystemError.FileNotADirectory);
  }
  static FileIsADirectory(messageOrUri) {
    return new FileSystemError(messageOrUri, "EntryIsADirectory" /* FileIsADirectory */, FileSystemError.FileIsADirectory);
  }
  static NoPermissions(messageOrUri) {
    return new FileSystemError(messageOrUri, "NoPermissions" /* NoPermissions */, FileSystemError.NoPermissions);
  }
  static Unavailable(messageOrUri) {
    return new FileSystemError(messageOrUri, "Unavailable" /* Unavailable */, FileSystemError.Unavailable);
  }
  constructor(uriOrMessage, code = "Unknown" /* Unknown */, terminator) {
    super(URI.isUri(uriOrMessage) ? uriOrMessage.toString(true) : uriOrMessage);
    this.code = terminator?.name ?? "Unknown";
    markAsFileSystemProviderError(this, code);
    Object.setPrototypeOf(this, FileSystemError.prototype);
    if (typeof Error.captureStackTrace === "function" && typeof terminator === "function") {
      Error.captureStackTrace(this, terminator);
    }
  }
};

FileSystemError = __decorateClass([
  es5ClassCompat
], FileSystemError);

var FoldingRange2 = class {
  constructor(start, end, kind) {
    this.start = start;
    this.end = end;
    this.kind = kind;
  }
};

FoldingRange2 = __decorateClass([
  es5ClassCompat
], FoldingRange2);

var QuickInputButtons = class {
  constructor() {
  }
};

QuickInputButtons.Back = { iconPath: new ThemeIcon2("arrow-left") };

QuickInputButtons = __decorateClass([
  es5ClassCompat
], QuickInputButtons);

var ColorTheme = class {
  constructor(kind) {
    this.kind = kind;
  }
};

ColorTheme = __decorateClass([
  es5ClassCompat
], ColorTheme);

var NotebookRendererScript = class {
  constructor(uri4, provides = []) {
    this.uri = uri4;
    this.provides = asArray(provides);
  }
};

var TimelineItem = class {
  constructor(label3, timestamp) {
    this.label = label3;
    this.timestamp = timestamp;
  }
};

TimelineItem = __decorateClass([
  es5ClassCompat
], TimelineItem);

var TestRunRequest = class {
  constructor(include = void 0, exclude = void 0, profile = void 0, continuous = false, preserveFocus = true) {
    this.include = include;
    this.exclude = exclude;
    this.profile = profile;
    this.continuous = continuous;
    this.preserveFocus = preserveFocus;
  }
};

TestRunRequest = __decorateClass([
  es5ClassCompat
], TestRunRequest);

var TestMessage = class {
  constructor(message) {
    this.message = message;
  }
  static diff(message, expected, actual) {
    const msg = new TestMessage(message);
    msg.expectedOutput = expected;
    msg.actualOutput = actual;
    return msg;
  }
};

TestMessage = __decorateClass([
  es5ClassCompat
], TestMessage);

var TestTag = class {
  constructor(id2) {
    this.id = id2;
  }
};

TestTag = __decorateClass([
  es5ClassCompat
], TestTag);

var TestCoverageCount = class {
  constructor(covered, total) {
    this.covered = covered;
    this.total = total;
    validateTestCoverageCount(this);
  }
};

function validateTestCoverageCount(cc) {
  if (!cc) {
    return;
  }
  if (cc.covered > cc.total) {
    throw new Error(`The total number of covered items (${cc.covered}) cannot be greater than the total (${cc.total})`);
  }
  if (cc.total < 0) {
    throw new Error(`The number of covered items (${cc.total}) cannot be negative`);
  }
}

var FileCoverage = class _FileCoverage {
  constructor(uri4, statementCoverage, branchCoverage, declarationCoverage, includesTests = []) {
    this.uri = uri4;
    this.statementCoverage = statementCoverage;
    this.branchCoverage = branchCoverage;
    this.declarationCoverage = declarationCoverage;
    this.includesTests = includesTests;
  }
  static fromDetails(uri4, details) {
    const statements = new TestCoverageCount(0, 0);
    const branches = new TestCoverageCount(0, 0);
    const decl = new TestCoverageCount(0, 0);
    for (const detail2 of details) {
      if ("branches" in detail2) {
        statements.total += 1;
        statements.covered += detail2.executed ? 1 : 0;
        for (const branch of detail2.branches) {
          branches.total += 1;
          branches.covered += branch.executed ? 1 : 0;
        }
      } else {
        decl.total += 1;
        decl.covered += detail2.executed ? 1 : 0;
      }
    }
    const coverage = new _FileCoverage(
      uri4,
      statements,
      branches.total > 0 ? branches : void 0,
      decl.total > 0 ? decl : void 0
    );
    coverage.detailedCoverage = details;
    return coverage;
  }
};

var StatementCoverage = class {
  constructor(executed, location2, branches = []) {
    this.executed = executed;
    this.location = location2;
    this.branches = branches;
  }
  // back compat until finalization:
  get executionCount() {
    return +this.executed;
  }
  set executionCount(n2) {
    this.executed = n2;
  }
};

var BranchCoverage = class {
  constructor(executed, location2, label3) {
    this.executed = executed;
    this.location = location2;
    this.label = label3;
  }
  // back compat until finalization:
  get executionCount() {
    return +this.executed;
  }
  set executionCount(n2) {
    this.executed = n2;
  }
};

var DeclarationCoverage = class {
  constructor(name, executed, location2) {
    this.name = name;
    this.executed = executed;
    this.location = location2;
  }
  // back compat until finalization:
  get executionCount() {
    return +this.executed;
  }
  set executionCount(n2) {
    this.executed = n2;
  }
};

var TypeHierarchyItem = class {
  constructor(kind, name, detail2, uri4, range2, selectionRange) {
    this.kind = kind;
    this.name = name;
    this.detail = detail2;
    this.uri = uri4;
    this.range = range2;
    this.selectionRange = selectionRange;
  }
};

var ChatResponseMarkdownPart = class {
  constructor(value2) {
    if (typeof value2 !== "string" && value2.isTrusted === true) {
      throw new Error("The boolean form of MarkdownString.isTrusted is NOT supported for chat participants.");
    }
    this.value = typeof value2 === "string" ? new MarkdownString2(value2) : value2;
  }
};

var ChatResponseMarkdownWithVulnerabilitiesPart = class {
  constructor(value2, vulnerabilities) {
    if (typeof value2 !== "string" && value2.isTrusted === true) {
      throw new Error("The boolean form of MarkdownString.isTrusted is NOT supported for chat participants.");
    }
    this.value = typeof value2 === "string" ? new MarkdownString2(value2) : value2;
    this.vulnerabilities = vulnerabilities;
  }
};

var ChatResponseConfirmationPart = class {
  constructor(title, message, data, buttons) {
    this.title = title;
    this.message = message;
    this.data = data;
    this.buttons = buttons;
  }
};

var ChatResponseFileTreePart = class {
  constructor(value2, baseUri) {
    this.value = value2;
    this.baseUri = baseUri;
  }
};

var ChatResponseMultiDiffPart = class {
  constructor(value2, title, readOnly) {
    this.value = value2;
    this.title = title;
    this.readOnly = readOnly;
  }
};

var ChatSubagentToolInvocationData = class {
  constructor(description, agentName, prompt, result) {
    this.description = description;
    this.agentName = agentName;
    this.prompt = prompt;
    this.result = result;
  }
};

var ChatResponseAnchorPart = class {
  constructor(value2, title) {
    this.value = value2;
    this.value2 = value2;
    this.title = title;
  }
};

var ChatResponseProgressPart = class {
  constructor(value2) {
    this.value = value2;
  }
};

var ChatResponseThinkingProgressPart = class {
  constructor(value2, id2, metadata) {
    this.value = value2;
    this.id = id2;
    this.metadata = metadata;
  }
};

var ChatResponseHookPart = class {
  constructor(hookType, stopReason, systemMessage, metadata) {
    this.hookType = hookType;
    this.stopReason = stopReason;
    this.systemMessage = systemMessage;
    this.metadata = metadata;
  }
};

var ChatResponseVoiceProgressPart = class {
  constructor(id2, value2) {
    this.id = id2;
    this.value = value2;
  }
};

var ChatResponseAutoModeResolutionPart = class {
  constructor(resolvedModel) {
    this.resolvedModel = resolvedModel;
  }
};

var ChatResponseWarningPart = class {
  constructor(value2) {
    if (typeof value2 !== "string" && value2.isTrusted === true) {
      throw new Error("The boolean form of MarkdownString.isTrusted is NOT supported for chat participants.");
    }
    this.value = typeof value2 === "string" ? new MarkdownString2(value2) : value2;
  }
};

var ChatResponseInfoPart = class {
  constructor(value2) {
    if (typeof value2 !== "string" && value2.isTrusted === true) {
      throw new Error("The boolean form of MarkdownString.isTrusted is NOT supported for chat participants.");
    }
    this.value = typeof value2 === "string" ? new MarkdownString2(value2) : value2;
  }
};

var ChatResponseCommandButtonPart = class {
  constructor(value2) {
    this.value = value2;
  }
};

var ChatResponseReferencePart = class {
  constructor(value2, iconPath, options3) {
    this.value = value2;
    this.iconPath = iconPath;
    this.options = options3;
  }
};

var ChatResponseCodeblockUriPart = class {
  constructor(value2, isEdit, undoStopId) {
    this.value = value2;
    this.isEdit = isEdit;
    this.undoStopId = undoStopId;
  }
};

var ChatResponseCodeCitationPart = class {
  constructor(value2, license, snippet) {
    this.value = value2;
    this.license = license;
    this.snippet = snippet;
  }
};

var ChatResponseMovePart = class {
  constructor(uri4, range2) {
    this.uri = uri4;
    this.range = range2;
  }
};

var ChatResponseExtensionsPart = class {
  constructor(extensions) {
    this.extensions = extensions;
  }
};

var ChatResponsePullRequestPart = class {
  constructor(uriOrCommand, title, description, author, linkTag) {
    this.title = title;
    this.description = description;
    this.author = author;
    this.linkTag = linkTag;
    if (isUriComponents(uriOrCommand)) {
      this.uri = uriOrCommand;
      this.command = {
        title: "Open Pull Request",
        command: "vscode.open",
        arguments: [uriOrCommand]
      };
    } else {
      this.command = uriOrCommand;
    }
  }
  toJSON() {
    return {
      $mid: 26 /* ChatResponsePullRequestPart */,
      uri: this.uri,
      title: this.title,
      description: this.description,
      author: this.author
    };
  }
};

var ChatQuestion = class {
  constructor(id2, type, title, options3) {
    this.id = id2;
    this.type = type;
    this.title = title;
    this.message = options3?.message;
    this.options = options3?.options;
    this.defaultValue = options3?.defaultValue;
    this.allowFreeformInput = options3?.allowFreeformInput;
  }
};

var ChatResponseQuestionCarouselPart = class {
  constructor(questions, allowSkip = true) {
    this.questions = questions;
    this.allowSkip = allowSkip;
  }
};

var ChatResponseTextEditPart = class {
  constructor(uri4, editsOrDone) {
    this.uri = uri4;
    if (editsOrDone === true) {
      this.isDone = true;
      this.edits = [];
    } else {
      this.edits = Array.isArray(editsOrDone) ? editsOrDone : [editsOrDone];
    }
  }
};

var ChatResponseNotebookEditPart = class {
  constructor(uri4, editsOrDone) {
    this.uri = uri4;
    if (editsOrDone === true) {
      this.isDone = true;
      this.edits = [];
    } else {
      this.edits = Array.isArray(editsOrDone) ? editsOrDone : [editsOrDone];
    }
  }
};

var ChatResponseWorkspaceEditPart = class {
  constructor(edits) {
    this.edits = edits;
  }
};

var ChatToolInvocationPart = class {
  constructor(toolName, toolCallId, errorMessage) {
    this.toolName = toolName;
    this.toolCallId = toolCallId;
    this.errorMessage = errorMessage;
  }
};

var ChatSessionCustomizationType = class _ChatSessionCustomizationType {
  constructor(id2) {
    this.id = id2;
  }
  static {
    this.Agent = new _ChatSessionCustomizationType("agent");
  }
  static {
    this.Skill = new _ChatSessionCustomizationType("skill");
  }
  static {
    this.Instructions = new _ChatSessionCustomizationType("instructions");
  }
  static {
    this.Prompt = new _ChatSessionCustomizationType("prompt");
  }
  static {
    this.Hook = new _ChatSessionCustomizationType("hook");
  }
  static {
    this.Plugins = new _ChatSessionCustomizationType("plugins");
  }
};

var ChatReferenceBinaryData = class {
  constructor(mimeType, data, reference, isPasted, isURL) {
    this.mimeType = mimeType;
    this.data = data;
    this.reference = reference;
    this.isPasted = isPasted;
    this.isURL = isURL;
  }
};

var ChatReferenceDiagnostic = class {
  constructor(diagnostics) {
    this.diagnostics = diagnostics;
  }
};

var LanguageModelToolResultPart = class {
  constructor(callId, content, isError) {
    this.callId = callId;
    this.content = content;
    this.isError = isError ?? false;
  }
};

var LanguageModelChatMessage = class _LanguageModelChatMessage {
  constructor(role, content, name) {
    this._content = [];
    this.role = role;
    this.content = content;
    this.name = name;
  }
  static User(content, name) {
    return new _LanguageModelChatMessage(1 /* User */, content, name);
  }
  static Assistant(content, name) {
    return new _LanguageModelChatMessage(2 /* Assistant */, content, name);
  }
  set content(value2) {
    if (typeof value2 === "string") {
      this._content = [new LanguageModelTextPart(value2)];
    } else {
      this._content = value2;
    }
  }
  get content() {
    return this._content;
  }
};

var LanguageModelChatMessage2 = class _LanguageModelChatMessage2 {
  constructor(role, content, name) {
    this._content = [];
    this.role = role;
    this.content = content;
    this.name = name;
  }
  static User(content, name) {
    return new _LanguageModelChatMessage2(1 /* User */, content, name);
  }
  static Assistant(content, name) {
    return new _LanguageModelChatMessage2(2 /* Assistant */, content, name);
  }
  set content(value2) {
    if (typeof value2 === "string") {
      this._content = [new LanguageModelTextPart(value2)];
    } else {
      this._content = value2;
    }
  }
  get content() {
    return this._content;
  }
  // Temp to avoid breaking changes
  set content2(value2) {
    if (value2) {
      this.content = value2.map((part) => {
        if (typeof part === "string") {
          return new LanguageModelTextPart(part);
        }
        return part;
      });
    }
  }
  get content2() {
    return this.content.map((part) => {
      if (part instanceof LanguageModelTextPart) {
        return part.value;
      }
      return part;
    });
  }
};

var LanguageModelToolCallPart = class {
  constructor(callId, name, input) {
    this.callId = callId;
    this.name = name;
    this.input = input;
  }
};

var LanguageModelTextPart = class {
  constructor(value2, audience) {
    this.value = value2;
    audience = audience;
  }
  toJSON() {
    return {
      $mid: 21 /* LanguageModelTextPart */,
      value: this.value,
      audience: this.audience
    };
  }
};

var LanguageModelDataPart = class _LanguageModelDataPart {
  constructor(data, mimeType, audience) {
    this.mimeType = mimeType;
    this.data = data;
    this.audience = audience;
  }
  static image(data, mimeType) {
    return new _LanguageModelDataPart(data, mimeType);
  }
  static json(value2, mime = "text/x-json") {
    const rawStr = JSON.stringify(value2, void 0, "	");
    return new _LanguageModelDataPart(VSBuffer.fromString(rawStr).buffer, mime);
  }
  static text(value2, mime = Mimes.text) {
    return new _LanguageModelDataPart(VSBuffer.fromString(value2).buffer, mime);
  }
  toJSON() {
    return {
      $mid: 24 /* LanguageModelDataPart */,
      mimeType: this.mimeType,
      data: encodeBase64(VSBuffer.wrap(this.data)),
      audience: this.audience
    };
  }
};

var LanguageModelThinkingPart = class {
  constructor(value2, id2, metadata) {
    this.value = value2;
    this.id = id2;
    this.metadata = metadata;
  }
  toJSON() {
    return {
      $mid: 22 /* LanguageModelThinkingPart */,
      value: this.value,
      id: this.id,
      metadata: this.metadata
    };
  }
};

var LanguageModelPromptTsxPart = class {
  constructor(value2) {
    this.value = value2;
  }
  toJSON() {
    return {
      $mid: 23 /* LanguageModelPromptTsxPart */,
      value: this.value
    };
  }
};

var LanguageModelError = class _LanguageModelError extends Error {
  static #name = "LanguageModelError";
  static NotFound(message) {
    return new _LanguageModelError(message, _LanguageModelError.NotFound.name);
  }
  static NoPermissions(message) {
    return new _LanguageModelError(message, _LanguageModelError.NoPermissions.name);
  }
  static Blocked(message) {
    return new _LanguageModelError(message, _LanguageModelError.Blocked.name);
  }
  static tryDeserialize(data) {
    if (data.name !== _LanguageModelError.#name) {
      return void 0;
    }
    return new _LanguageModelError(data.message, data.code, data.cause);
  }
  constructor(message, code, cause) {
    super(message, { cause });
    this.name = _LanguageModelError.#name;
    this.code = code ?? "";
  }
};

var LanguageModelToolResult = class {
  constructor(content) {
    this.content = content;
  }
  toJSON() {
    return {
      $mid: 20 /* LanguageModelToolResult */,
      content: this.content
    };
  }
};

var LanguageModelToolExtensionSource = class {
  constructor(id2, label3) {
    this.id = id2;
    this.label = label3;
  }
};

var LanguageModelToolMCPSource = class {
  constructor(label3, name, instructions) {
    this.label = label3;
    this.name = name;
    this.instructions = instructions;
  }
};

var McpStdioServerDefinition = class {
  constructor(label3, command4, args2, env2 = {}, version2, metadata) {
    this.label = label3;
    this.command = command4;
    this.args = args2;
    this.env = env2;
    this.version = version2;
    this.metadata = metadata;
  }
};

var McpHttpServerDefinition = class {
  constructor(label3, uri4, headers = {}, version2, metadata, authentication) {
    this.label = label3;
    this.uri = uri4;
    this.headers = headers;
    this.version = version2;
    this.metadata = metadata;
    this.authentication = authentication;
  }
};
export { asStatusBarItemIdentifier, computeTaskExecutionId, validateTestCoverageCount, _callOnDispose, Disposable3, Hover2, VerboseHover, DocumentHighlightKind2, DocumentHighlight2, MultiDocumentHighlight, DocumentSymbol, CodeAction, SelectionRange, CallHierarchyItem, CallHierarchyIncomingCall, CallHierarchyOutgoingCall, CodeLens, ParameterInformation, SignatureInformation, SignatureHelp, InlayHintLabelPart, InlayHint, CompletionItemKind4, CompletionItem8, CompletionList, InlineSuggestion, InlineSuggestionList3, TextEditorSelectionChangeKind, SyntaxTokenType, DocumentLink, Color2, ColorInformation, ColorPresentation, TaskGroup, ProcessExecution, ShellExecution, CustomExecution, Task, ViewBadge, TreeItem, DataTransferItem, InternalDataTransferItem, InternalFileDataTransferItem, DataTransferFile, _items, _DataTransfer_instances, normalizeMime_fn, DataTransfer, DocumentDropEdit, DocumentDropOrPasteEditKind, ThemeIcon2, ThemeColor2, RelativePattern, breakpointIds, Breakpoint, SourceBreakpoint, FunctionBreakpoint, DataBreakpoint, DebugAdapterExecutable, DebugAdapterServer, DebugAdapterNamedPipeServer, DebugAdapterInlineImplementation, EvaluatableExpression, InlineValueText, InlineValueVariableLookup, InlineValueEvaluatableExpression, InlineValueContext, FileSystemError, FoldingRange2, QuickInputButtons, ColorTheme, NotebookRendererScript, TimelineItem, TestRunRequest, TestMessage, TestTag, TestCoverageCount, FileCoverage, StatementCoverage, BranchCoverage, DeclarationCoverage, TypeHierarchyItem, ChatResponseMarkdownPart, ChatResponseMarkdownWithVulnerabilitiesPart, ChatResponseConfirmationPart, ChatResponseFileTreePart, ChatResponseMultiDiffPart, ChatSubagentToolInvocationData, ChatResponseAnchorPart, ChatResponseProgressPart, ChatResponseThinkingProgressPart, ChatResponseHookPart, ChatResponseVoiceProgressPart, ChatResponseAutoModeResolutionPart, ChatResponseWarningPart, ChatResponseInfoPart, ChatResponseCommandButtonPart, ChatResponseReferencePart, ChatResponseCodeblockUriPart, ChatResponseCodeCitationPart, ChatResponseMovePart, ChatResponseExtensionsPart, ChatResponsePullRequestPart, ChatQuestion, ChatResponseQuestionCarouselPart, ChatResponseTextEditPart, ChatResponseNotebookEditPart, ChatResponseWorkspaceEditPart, ChatToolInvocationPart, ChatSessionCustomizationType, ChatReferenceBinaryData, ChatReferenceDiagnostic, LanguageModelToolResultPart, LanguageModelChatMessage, LanguageModelChatMessage2, LanguageModelToolCallPart, LanguageModelTextPart, LanguageModelDataPart, LanguageModelThinkingPart, LanguageModelPromptTsxPart, LanguageModelError, LanguageModelToolResult, LanguageModelToolExtensionSource, LanguageModelToolMCPSource, McpStdioServerDefinition, McpHttpServerDefinition };
