// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/node/extensionHostProcess.js
// Original module marker: src/vs/workbench/api/common/extHostTypes.ts
import { __decorateClass, __privateAdd, __privateGet, __privateMethod, __privateSet } from "./module-0000.mjs";
import { es5ClassCompat } from "./module-0230.mjs";
import { illegalArgument } from "./module-0003.mjs";
import { ExtensionIdentifier } from "./module-0059.mjs";
import { URI, isUriComponents } from "./module-0025.mjs";
import { Range2 } from "./module-0233.mjs";
import { generateUuid } from "./module-0040.mjs";
import { isNumber, isObject, isString, isStringArray } from "./module-0009.mjs";
import { MarkdownString2 } from "./module-0231.mjs";
import { markAsFileSystemProviderError } from "./module-0073.mjs";
import { nextCharLength } from "./module-0023.mjs";
import { asArray } from "./module-0006.mjs";
import { VSBuffer, encodeBase64 } from "./module-0031.mjs";
import { Mimes } from "./module-0088.mjs";


// src/vs/workbench/api/common/extHostTypes.ts
var TerminalOutputAnchor = /* @__PURE__ */ ((TerminalOutputAnchor2) => {
  TerminalOutputAnchor2[TerminalOutputAnchor2["Top"] = 0] = "Top";
  TerminalOutputAnchor2[TerminalOutputAnchor2["Bottom"] = 1] = "Bottom";
  return TerminalOutputAnchor2;
})(TerminalOutputAnchor || {});

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

var validateConnectionToken = (connectionToken) => {
  if (typeof connectionToken !== "string" || connectionToken.length === 0 || !/^[0-9A-Za-z_\-]+$/.test(connectionToken)) {
    throw illegalArgument("connectionToken");
  }
};

var ResolvedAuthority = class {
  static isResolvedAuthority(resolvedAuthority) {
    return resolvedAuthority && typeof resolvedAuthority === "object" && typeof resolvedAuthority.host === "string" && typeof resolvedAuthority.port === "number" && (resolvedAuthority.connectionToken === void 0 || typeof resolvedAuthority.connectionToken === "string");
  }
  constructor(host, port, connectionToken) {
    if (typeof host !== "string" || host.length === 0) {
      throw illegalArgument("host");
    }
    if (typeof port !== "number" || port === 0 || Math.round(port) !== port) {
      throw illegalArgument("port");
    }
    if (typeof connectionToken !== "undefined") {
      validateConnectionToken(connectionToken);
    }
    this.host = host;
    this.port = Math.round(port);
    this.connectionToken = connectionToken;
  }
};

var ManagedResolvedAuthority = class {
  constructor(makeConnection, connectionToken) {
    this.makeConnection = makeConnection;
    this.connectionToken = connectionToken;
    if (typeof connectionToken !== "undefined") {
      validateConnectionToken(connectionToken);
    }
  }
  static isManagedResolvedAuthority(resolvedAuthority) {
    return resolvedAuthority && typeof resolvedAuthority === "object" && typeof resolvedAuthority.makeConnection === "function" && (resolvedAuthority.connectionToken === void 0 || typeof resolvedAuthority.connectionToken === "string");
  }
};

var RemoteAuthorityResolverError2 = class _RemoteAuthorityResolverError extends Error {
  static NotAvailable(message, handled) {
    return new _RemoteAuthorityResolverError(message, "NotAvailable" /* NotAvailable */, handled);
  }
  static TemporarilyNotAvailable(message) {
    return new _RemoteAuthorityResolverError(message, "TemporarilyNotAvailable" /* TemporarilyNotAvailable */);
  }
  constructor(message, code = "Unknown" /* Unknown */, detail) {
    super(message);
    this._message = message;
    this._code = code;
    this._detail = detail;
    Object.setPrototypeOf(this, _RemoteAuthorityResolverError.prototype);
  }
};

var EnvironmentVariableMutatorType = /* @__PURE__ */ ((EnvironmentVariableMutatorType2) => {
  EnvironmentVariableMutatorType2[EnvironmentVariableMutatorType2["Replace"] = 1] = "Replace";
  EnvironmentVariableMutatorType2[EnvironmentVariableMutatorType2["Append"] = 2] = "Append";
  EnvironmentVariableMutatorType2[EnvironmentVariableMutatorType2["Prepend"] = 3] = "Prepend";
  return EnvironmentVariableMutatorType2;
})(EnvironmentVariableMutatorType || {});

var Hover = class {
  constructor(contents, range) {
    if (!contents) {
      throw new Error("Illegal argument, contents must be defined");
    }
    if (Array.isArray(contents)) {
      this.contents = contents;
    } else {
      this.contents = [contents];
    }
    this.range = range;
  }
};

Hover = __decorateClass([
  es5ClassCompat
], Hover);

var VerboseHover = class extends Hover {
  constructor(contents, range, canIncreaseVerbosity, canDecreaseVerbosity) {
    super(contents, range);
    this.canIncreaseVerbosity = canIncreaseVerbosity;
    this.canDecreaseVerbosity = canDecreaseVerbosity;
  }
};

VerboseHover = __decorateClass([
  es5ClassCompat
], VerboseHover);

var HoverVerbosityAction = /* @__PURE__ */ ((HoverVerbosityAction2) => {
  HoverVerbosityAction2[HoverVerbosityAction2["Increase"] = 0] = "Increase";
  HoverVerbosityAction2[HoverVerbosityAction2["Decrease"] = 1] = "Decrease";
  return HoverVerbosityAction2;
})(HoverVerbosityAction || {});

var DocumentHighlightKind = /* @__PURE__ */ ((DocumentHighlightKind2) => {
  DocumentHighlightKind2[DocumentHighlightKind2["Text"] = 0] = "Text";
  DocumentHighlightKind2[DocumentHighlightKind2["Read"] = 1] = "Read";
  DocumentHighlightKind2[DocumentHighlightKind2["Write"] = 2] = "Write";
  return DocumentHighlightKind2;
})(DocumentHighlightKind || {});

var DocumentHighlight = class {
  constructor(range, kind = 0 /* Text */) {
    this.range = range;
    this.kind = kind;
  }
  toJSON() {
    return {
      range: this.range,
      kind: DocumentHighlightKind[this.kind]
    };
  }
};

DocumentHighlight = __decorateClass([
  es5ClassCompat
], DocumentHighlight);

var MultiDocumentHighlight = class {
  constructor(uri2, highlights) {
    this.uri = uri2;
    this.highlights = highlights;
  }
  toJSON() {
    return {
      uri: this.uri,
      highlights: this.highlights.map((h) => h.toJSON())
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
  constructor(name, detail, kind, range, selectionRange) {
    this.name = name;
    this.detail = detail;
    this.kind = kind;
    this.range = range;
    this.selectionRange = selectionRange;
    this.children = [];
    DocumentSymbol.validate(this);
  }
};

DocumentSymbol = __decorateClass([
  es5ClassCompat
], DocumentSymbol);

var CodeActionTriggerKind = /* @__PURE__ */ ((CodeActionTriggerKind3) => {
  CodeActionTriggerKind3[CodeActionTriggerKind3["Invoke"] = 1] = "Invoke";
  CodeActionTriggerKind3[CodeActionTriggerKind3["Automatic"] = 2] = "Automatic";
  return CodeActionTriggerKind3;
})(CodeActionTriggerKind || {});

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
  constructor(range, parent) {
    this.range = range;
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
  constructor(kind, name, detail, uri2, range, selectionRange) {
    this.kind = kind;
    this.name = name;
    this.detail = detail;
    this.uri = uri2;
    this.range = range;
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

var LanguageStatusSeverity = /* @__PURE__ */ ((LanguageStatusSeverity2) => {
  LanguageStatusSeverity2[LanguageStatusSeverity2["Information"] = 0] = "Information";
  LanguageStatusSeverity2[LanguageStatusSeverity2["Warning"] = 1] = "Warning";
  LanguageStatusSeverity2[LanguageStatusSeverity2["Error"] = 2] = "Error";
  return LanguageStatusSeverity2;
})(LanguageStatusSeverity || {});

var CodeLens = class {
  constructor(range, command) {
    this.range = range;
    this.command = command;
  }
  get isResolved() {
    return !!this.command;
  }
};

CodeLens = __decorateClass([
  es5ClassCompat
], CodeLens);

var ParameterInformation = class {
  constructor(label, documentation) {
    this.label = label;
    this.documentation = documentation;
  }
};

ParameterInformation = __decorateClass([
  es5ClassCompat
], ParameterInformation);

var SignatureInformation = class {
  constructor(label, documentation) {
    this.label = label;
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

var SignatureHelpTriggerKind = /* @__PURE__ */ ((SignatureHelpTriggerKind2) => {
  SignatureHelpTriggerKind2[SignatureHelpTriggerKind2["Invoke"] = 1] = "Invoke";
  SignatureHelpTriggerKind2[SignatureHelpTriggerKind2["TriggerCharacter"] = 2] = "TriggerCharacter";
  SignatureHelpTriggerKind2[SignatureHelpTriggerKind2["ContentChange"] = 3] = "ContentChange";
  return SignatureHelpTriggerKind2;
})(SignatureHelpTriggerKind || {});

var InlayHintKind = /* @__PURE__ */ ((InlayHintKind3) => {
  InlayHintKind3[InlayHintKind3["Type"] = 1] = "Type";
  InlayHintKind3[InlayHintKind3["Parameter"] = 2] = "Parameter";
  return InlayHintKind3;
})(InlayHintKind || {});

var InlayHintLabelPart = class {
  constructor(value) {
    this.value = value;
  }
};

InlayHintLabelPart = __decorateClass([
  es5ClassCompat
], InlayHintLabelPart);

var InlayHint = class {
  constructor(position, label, kind) {
    this.position = position;
    this.label = label;
    this.kind = kind;
  }
};

InlayHint = __decorateClass([
  es5ClassCompat
], InlayHint);

var CompletionTriggerKind = /* @__PURE__ */ ((CompletionTriggerKind4) => {
  CompletionTriggerKind4[CompletionTriggerKind4["Invoke"] = 0] = "Invoke";
  CompletionTriggerKind4[CompletionTriggerKind4["TriggerCharacter"] = 1] = "TriggerCharacter";
  CompletionTriggerKind4[CompletionTriggerKind4["TriggerForIncompleteCompletions"] = 2] = "TriggerForIncompleteCompletions";
  return CompletionTriggerKind4;
})(CompletionTriggerKind || {});

var CompletionItemKind = /* @__PURE__ */ ((CompletionItemKind4) => {
  CompletionItemKind4[CompletionItemKind4["Text"] = 0] = "Text";
  CompletionItemKind4[CompletionItemKind4["Method"] = 1] = "Method";
  CompletionItemKind4[CompletionItemKind4["Function"] = 2] = "Function";
  CompletionItemKind4[CompletionItemKind4["Constructor"] = 3] = "Constructor";
  CompletionItemKind4[CompletionItemKind4["Field"] = 4] = "Field";
  CompletionItemKind4[CompletionItemKind4["Variable"] = 5] = "Variable";
  CompletionItemKind4[CompletionItemKind4["Class"] = 6] = "Class";
  CompletionItemKind4[CompletionItemKind4["Interface"] = 7] = "Interface";
  CompletionItemKind4[CompletionItemKind4["Module"] = 8] = "Module";
  CompletionItemKind4[CompletionItemKind4["Property"] = 9] = "Property";
  CompletionItemKind4[CompletionItemKind4["Unit"] = 10] = "Unit";
  CompletionItemKind4[CompletionItemKind4["Value"] = 11] = "Value";
  CompletionItemKind4[CompletionItemKind4["Enum"] = 12] = "Enum";
  CompletionItemKind4[CompletionItemKind4["Keyword"] = 13] = "Keyword";
  CompletionItemKind4[CompletionItemKind4["Snippet"] = 14] = "Snippet";
  CompletionItemKind4[CompletionItemKind4["Color"] = 15] = "Color";
  CompletionItemKind4[CompletionItemKind4["File"] = 16] = "File";
  CompletionItemKind4[CompletionItemKind4["Reference"] = 17] = "Reference";
  CompletionItemKind4[CompletionItemKind4["Folder"] = 18] = "Folder";
  CompletionItemKind4[CompletionItemKind4["EnumMember"] = 19] = "EnumMember";
  CompletionItemKind4[CompletionItemKind4["Constant"] = 20] = "Constant";
  CompletionItemKind4[CompletionItemKind4["Struct"] = 21] = "Struct";
  CompletionItemKind4[CompletionItemKind4["Event"] = 22] = "Event";
  CompletionItemKind4[CompletionItemKind4["Operator"] = 23] = "Operator";
  CompletionItemKind4[CompletionItemKind4["TypeParameter"] = 24] = "TypeParameter";
  CompletionItemKind4[CompletionItemKind4["User"] = 25] = "User";
  CompletionItemKind4[CompletionItemKind4["Issue"] = 26] = "Issue";
  return CompletionItemKind4;
})(CompletionItemKind || {});

var CompletionItemTag = /* @__PURE__ */ ((CompletionItemTag4) => {
  CompletionItemTag4[CompletionItemTag4["Deprecated"] = 1] = "Deprecated";
  return CompletionItemTag4;
})(CompletionItemTag || {});

var CompletionItem = class {
  constructor(label, kind) {
    this.label = label;
    this.kind = kind;
  }
  toJSON() {
    return {
      label: this.label,
      kind: this.kind && CompletionItemKind[this.kind],
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

CompletionItem = __decorateClass([
  es5ClassCompat
], CompletionItem);

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
  constructor(insertText, range, command) {
    this.insertText = insertText;
    this.range = range;
    this.command = command;
  }
};

InlineSuggestion = __decorateClass([
  es5ClassCompat
], InlineSuggestion);

var InlineSuggestionList = class {
  constructor(items) {
    this.commands = void 0;
    this.suppressSuggestions = void 0;
    this.items = items;
  }
};

InlineSuggestionList = __decorateClass([
  es5ClassCompat
], InlineSuggestionList);

var PartialAcceptTriggerKind = /* @__PURE__ */ ((PartialAcceptTriggerKind4) => {
  PartialAcceptTriggerKind4[PartialAcceptTriggerKind4["Unknown"] = 0] = "Unknown";
  PartialAcceptTriggerKind4[PartialAcceptTriggerKind4["Word"] = 1] = "Word";
  PartialAcceptTriggerKind4[PartialAcceptTriggerKind4["Line"] = 2] = "Line";
  PartialAcceptTriggerKind4[PartialAcceptTriggerKind4["Suggest"] = 3] = "Suggest";
  return PartialAcceptTriggerKind4;
})(PartialAcceptTriggerKind || {});

var InlineCompletionEndOfLifeReasonKind = /* @__PURE__ */ ((InlineCompletionEndOfLifeReasonKind3) => {
  InlineCompletionEndOfLifeReasonKind3[InlineCompletionEndOfLifeReasonKind3["Accepted"] = 0] = "Accepted";
  InlineCompletionEndOfLifeReasonKind3[InlineCompletionEndOfLifeReasonKind3["Rejected"] = 1] = "Rejected";
  InlineCompletionEndOfLifeReasonKind3[InlineCompletionEndOfLifeReasonKind3["Ignored"] = 2] = "Ignored";
  return InlineCompletionEndOfLifeReasonKind3;
})(InlineCompletionEndOfLifeReasonKind || {});

var InlineCompletionDisplayLocationKind = /* @__PURE__ */ ((InlineCompletionDisplayLocationKind2) => {
  InlineCompletionDisplayLocationKind2[InlineCompletionDisplayLocationKind2["Code"] = 1] = "Code";
  InlineCompletionDisplayLocationKind2[InlineCompletionDisplayLocationKind2["Label"] = 2] = "Label";
  return InlineCompletionDisplayLocationKind2;
})(InlineCompletionDisplayLocationKind || {});

var ViewColumn = /* @__PURE__ */ ((ViewColumn3) => {
  ViewColumn3[ViewColumn3["Active"] = -1] = "Active";
  ViewColumn3[ViewColumn3["Beside"] = -2] = "Beside";
  ViewColumn3[ViewColumn3["One"] = 1] = "One";
  ViewColumn3[ViewColumn3["Two"] = 2] = "Two";
  ViewColumn3[ViewColumn3["Three"] = 3] = "Three";
  ViewColumn3[ViewColumn3["Four"] = 4] = "Four";
  ViewColumn3[ViewColumn3["Five"] = 5] = "Five";
  ViewColumn3[ViewColumn3["Six"] = 6] = "Six";
  ViewColumn3[ViewColumn3["Seven"] = 7] = "Seven";
  ViewColumn3[ViewColumn3["Eight"] = 8] = "Eight";
  ViewColumn3[ViewColumn3["Nine"] = 9] = "Nine";
  return ViewColumn3;
})(ViewColumn || {});

var StatusBarAlignment = /* @__PURE__ */ ((StatusBarAlignment2) => {
  StatusBarAlignment2[StatusBarAlignment2["Left"] = 1] = "Left";
  StatusBarAlignment2[StatusBarAlignment2["Right"] = 2] = "Right";
  return StatusBarAlignment2;
})(StatusBarAlignment || {});

function asStatusBarItemIdentifier(extension, id2) {
  return `${ExtensionIdentifier.toKey(extension)}.${id2}`;
}

var TextEditorLineNumbersStyle = /* @__PURE__ */ ((TextEditorLineNumbersStyle4) => {
  TextEditorLineNumbersStyle4[TextEditorLineNumbersStyle4["Off"] = 0] = "Off";
  TextEditorLineNumbersStyle4[TextEditorLineNumbersStyle4["On"] = 1] = "On";
  TextEditorLineNumbersStyle4[TextEditorLineNumbersStyle4["Relative"] = 2] = "Relative";
  TextEditorLineNumbersStyle4[TextEditorLineNumbersStyle4["Interval"] = 3] = "Interval";
  return TextEditorLineNumbersStyle4;
})(TextEditorLineNumbersStyle || {});

var TextDocumentSaveReason = /* @__PURE__ */ ((TextDocumentSaveReason3) => {
  TextDocumentSaveReason3[TextDocumentSaveReason3["Manual"] = 1] = "Manual";
  TextDocumentSaveReason3[TextDocumentSaveReason3["AfterDelay"] = 2] = "AfterDelay";
  TextDocumentSaveReason3[TextDocumentSaveReason3["FocusOut"] = 3] = "FocusOut";
  return TextDocumentSaveReason3;
})(TextDocumentSaveReason || {});

var TextEditorRevealType = /* @__PURE__ */ ((TextEditorRevealType2) => {
  TextEditorRevealType2[TextEditorRevealType2["Default"] = 0] = "Default";
  TextEditorRevealType2[TextEditorRevealType2["InCenter"] = 1] = "InCenter";
  TextEditorRevealType2[TextEditorRevealType2["InCenterIfOutsideViewport"] = 2] = "InCenterIfOutsideViewport";
  TextEditorRevealType2[TextEditorRevealType2["AtTop"] = 3] = "AtTop";
  return TextEditorRevealType2;
})(TextEditorRevealType || {});

var TextEditorSelectionChangeKind = /* @__PURE__ */ ((TextEditorSelectionChangeKind2) => {
  TextEditorSelectionChangeKind2[TextEditorSelectionChangeKind2["Keyboard"] = 1] = "Keyboard";
  TextEditorSelectionChangeKind2[TextEditorSelectionChangeKind2["Mouse"] = 2] = "Mouse";
  TextEditorSelectionChangeKind2[TextEditorSelectionChangeKind2["Command"] = 3] = "Command";
  return TextEditorSelectionChangeKind2;
})(TextEditorSelectionChangeKind || {});

var TextEditorChangeKind = /* @__PURE__ */ ((TextEditorChangeKind2) => {
  TextEditorChangeKind2[TextEditorChangeKind2["Addition"] = 1] = "Addition";
  TextEditorChangeKind2[TextEditorChangeKind2["Deletion"] = 2] = "Deletion";
  TextEditorChangeKind2[TextEditorChangeKind2["Modification"] = 3] = "Modification";
  return TextEditorChangeKind2;
})(TextEditorChangeKind || {});

var TextDocumentChangeReason = /* @__PURE__ */ ((TextDocumentChangeReason2) => {
  TextDocumentChangeReason2[TextDocumentChangeReason2["Undo"] = 1] = "Undo";
  TextDocumentChangeReason2[TextDocumentChangeReason2["Redo"] = 2] = "Redo";
  return TextDocumentChangeReason2;
})(TextDocumentChangeReason || {});

var DecorationRangeBehavior = /* @__PURE__ */ ((DecorationRangeBehavior3) => {
  DecorationRangeBehavior3[DecorationRangeBehavior3["OpenOpen"] = 0] = "OpenOpen";
  DecorationRangeBehavior3[DecorationRangeBehavior3["ClosedClosed"] = 1] = "ClosedClosed";
  DecorationRangeBehavior3[DecorationRangeBehavior3["OpenClosed"] = 2] = "OpenClosed";
  DecorationRangeBehavior3[DecorationRangeBehavior3["ClosedOpen"] = 3] = "ClosedOpen";
  return DecorationRangeBehavior3;
})(DecorationRangeBehavior || {});

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
  function toString(v) {
    switch (v) {
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
  constructor(range, target) {
    if (target && !URI.isUri(target)) {
      throw illegalArgument("target");
    }
    if (!Range2.isRange(range) || range.isEmpty) {
      throw illegalArgument("range");
    }
    this.range = range;
    this.target = target;
  }
};

DocumentLink = __decorateClass([
  es5ClassCompat
], DocumentLink);

var Color = class {
  constructor(red, green, blue, alpha) {
    this.red = red;
    this.green = green;
    this.blue = blue;
    this.alpha = alpha;
  }
};

Color = __decorateClass([
  es5ClassCompat
], Color);

var ColorInformation = class {
  constructor(range, color2) {
    if (color2 && !(color2 instanceof Color)) {
      throw illegalArgument("color");
    }
    if (!Range2.isRange(range) || range.isEmpty) {
      throw illegalArgument("range");
    }
    this.range = range;
    this.color = color2;
  }
};

ColorInformation = __decorateClass([
  es5ClassCompat
], ColorInformation);

var ColorPresentation = class {
  constructor(label) {
    if (!label || typeof label !== "string") {
      throw illegalArgument("label");
    }
    this.label = label;
  }
};

ColorPresentation = __decorateClass([
  es5ClassCompat
], ColorPresentation);

var SourceControlInputBoxValidationType = /* @__PURE__ */ ((SourceControlInputBoxValidationType3) => {
  SourceControlInputBoxValidationType3[SourceControlInputBoxValidationType3["Error"] = 0] = "Error";
  SourceControlInputBoxValidationType3[SourceControlInputBoxValidationType3["Warning"] = 1] = "Warning";
  SourceControlInputBoxValidationType3[SourceControlInputBoxValidationType3["Information"] = 2] = "Information";
  return SourceControlInputBoxValidationType3;
})(SourceControlInputBoxValidationType || {});

var TerminalExitReason = /* @__PURE__ */ ((TerminalExitReason3) => {
  TerminalExitReason3[TerminalExitReason3["Unknown"] = 0] = "Unknown";
  TerminalExitReason3[TerminalExitReason3["Shutdown"] = 1] = "Shutdown";
  TerminalExitReason3[TerminalExitReason3["Process"] = 2] = "Process";
  TerminalExitReason3[TerminalExitReason3["User"] = 3] = "User";
  TerminalExitReason3[TerminalExitReason3["Extension"] = 4] = "Extension";
  return TerminalExitReason3;
})(TerminalExitReason || {});

var TerminalShellExecutionCommandLineConfidence = /* @__PURE__ */ ((TerminalShellExecutionCommandLineConfidence2) => {
  TerminalShellExecutionCommandLineConfidence2[TerminalShellExecutionCommandLineConfidence2["Low"] = 0] = "Low";
  TerminalShellExecutionCommandLineConfidence2[TerminalShellExecutionCommandLineConfidence2["Medium"] = 1] = "Medium";
  TerminalShellExecutionCommandLineConfidence2[TerminalShellExecutionCommandLineConfidence2["High"] = 2] = "High";
  return TerminalShellExecutionCommandLineConfidence2;
})(TerminalShellExecutionCommandLineConfidence || {});

var TerminalShellType = /* @__PURE__ */ ((TerminalShellType3) => {
  TerminalShellType3[TerminalShellType3["Sh"] = 1] = "Sh";
  TerminalShellType3[TerminalShellType3["Bash"] = 2] = "Bash";
  TerminalShellType3[TerminalShellType3["Fish"] = 3] = "Fish";
  TerminalShellType3[TerminalShellType3["Csh"] = 4] = "Csh";
  TerminalShellType3[TerminalShellType3["Ksh"] = 5] = "Ksh";
  TerminalShellType3[TerminalShellType3["Zsh"] = 6] = "Zsh";
  TerminalShellType3[TerminalShellType3["CommandPrompt"] = 7] = "CommandPrompt";
  TerminalShellType3[TerminalShellType3["GitBash"] = 8] = "GitBash";
  TerminalShellType3[TerminalShellType3["PowerShell"] = 9] = "PowerShell";
  TerminalShellType3[TerminalShellType3["Python"] = 10] = "Python";
  TerminalShellType3[TerminalShellType3["Julia"] = 11] = "Julia";
  TerminalShellType3[TerminalShellType3["NuShell"] = 12] = "NuShell";
  TerminalShellType3[TerminalShellType3["Node"] = 13] = "Node";
  TerminalShellType3[TerminalShellType3["Xonsh"] = 14] = "Xonsh";
  return TerminalShellType3;
})(TerminalShellType || {});

var TerminalLink = class {
  constructor(startIndex, length, tooltip) {
    this.startIndex = startIndex;
    this.length = length;
    this.tooltip = tooltip;
    if (typeof startIndex !== "number" || startIndex < 0) {
      throw illegalArgument("startIndex");
    }
    if (typeof length !== "number" || length < 1) {
      throw illegalArgument("length");
    }
    if (tooltip !== void 0 && typeof tooltip !== "string") {
      throw illegalArgument("tooltip");
    }
  }
};

var TerminalQuickFixOpener = class {
  constructor(uri2) {
    this.uri = uri2;
  }
};

var TerminalQuickFixCommand = class {
  constructor(terminalCommand) {
    this.terminalCommand = terminalCommand;
  }
};

var TerminalLocation = /* @__PURE__ */ ((TerminalLocation3) => {
  TerminalLocation3[TerminalLocation3["Panel"] = 1] = "Panel";
  TerminalLocation3[TerminalLocation3["Editor"] = 2] = "Editor";
  return TerminalLocation3;
})(TerminalLocation || {});

var TerminalProfile = class {
  constructor(options2) {
    this.options = options2;
    if (typeof options2 !== "object") {
      throw illegalArgument("options");
    }
  }
};

var TerminalCompletionItemKind = /* @__PURE__ */ ((TerminalCompletionItemKind2) => {
  TerminalCompletionItemKind2[TerminalCompletionItemKind2["File"] = 0] = "File";
  TerminalCompletionItemKind2[TerminalCompletionItemKind2["Folder"] = 1] = "Folder";
  TerminalCompletionItemKind2[TerminalCompletionItemKind2["Method"] = 2] = "Method";
  TerminalCompletionItemKind2[TerminalCompletionItemKind2["Alias"] = 3] = "Alias";
  TerminalCompletionItemKind2[TerminalCompletionItemKind2["Argument"] = 4] = "Argument";
  TerminalCompletionItemKind2[TerminalCompletionItemKind2["Option"] = 5] = "Option";
  TerminalCompletionItemKind2[TerminalCompletionItemKind2["OptionValue"] = 6] = "OptionValue";
  TerminalCompletionItemKind2[TerminalCompletionItemKind2["Flag"] = 7] = "Flag";
  TerminalCompletionItemKind2[TerminalCompletionItemKind2["SymbolicLinkFile"] = 8] = "SymbolicLinkFile";
  TerminalCompletionItemKind2[TerminalCompletionItemKind2["SymbolicLinkFolder"] = 9] = "SymbolicLinkFolder";
  TerminalCompletionItemKind2[TerminalCompletionItemKind2["ScmCommit"] = 10] = "ScmCommit";
  TerminalCompletionItemKind2[TerminalCompletionItemKind2["ScmBranch"] = 11] = "ScmBranch";
  TerminalCompletionItemKind2[TerminalCompletionItemKind2["ScmTag"] = 12] = "ScmTag";
  TerminalCompletionItemKind2[TerminalCompletionItemKind2["ScmStash"] = 13] = "ScmStash";
  TerminalCompletionItemKind2[TerminalCompletionItemKind2["ScmRemote"] = 14] = "ScmRemote";
  TerminalCompletionItemKind2[TerminalCompletionItemKind2["PullRequest"] = 15] = "PullRequest";
  TerminalCompletionItemKind2[TerminalCompletionItemKind2["PullRequestDone"] = 16] = "PullRequestDone";
  return TerminalCompletionItemKind2;
})(TerminalCompletionItemKind || {});

var TerminalCompletionItem = class {
  constructor(label, replacementRange, kind, detail, documentation, isFile, isDirectory, isKeyword) {
    this.label = label;
    this.replacementRange = replacementRange;
    this.kind = kind;
    this.detail = detail;
    this.documentation = documentation;
    this.isFile = isFile;
    this.isDirectory = isDirectory;
    this.isKeyword = isKeyword;
  }
};

var TerminalCompletionList = class {
  /**
   * Creates a new completion list.
   *
   * @param items The completion items.
   * @param isIncomplete The list is not complete.
   */
  constructor(items, resourceOptions) {
    this.items = items ?? [];
    this.resourceOptions = resourceOptions;
  }
};

var TaskRevealKind = /* @__PURE__ */ ((TaskRevealKind2) => {
  TaskRevealKind2[TaskRevealKind2["Always"] = 1] = "Always";
  TaskRevealKind2[TaskRevealKind2["Silent"] = 2] = "Silent";
  TaskRevealKind2[TaskRevealKind2["Never"] = 3] = "Never";
  return TaskRevealKind2;
})(TaskRevealKind || {});

var TaskEventKind = /* @__PURE__ */ ((TaskEventKind2) => {
  TaskEventKind2["Changed"] = "changed";
  TaskEventKind2["ProcessStarted"] = "processStarted";
  TaskEventKind2["ProcessEnded"] = "processEnded";
  TaskEventKind2["Terminated"] = "terminated";
  TaskEventKind2["Start"] = "start";
  TaskEventKind2["AcquiredInput"] = "acquiredInput";
  TaskEventKind2["DependsOnStarted"] = "dependsOnStarted";
  TaskEventKind2["Active"] = "active";
  TaskEventKind2["Inactive"] = "inactive";
  TaskEventKind2["End"] = "end";
  TaskEventKind2["ProblemMatcherStarted"] = "problemMatcherStarted";
  TaskEventKind2["ProblemMatcherEnded"] = "problemMatcherEnded";
  TaskEventKind2["ProblemMatcherFoundErrors"] = "problemMatcherFoundErrors";
  return TaskEventKind2;
})(TaskEventKind || {});

var TaskPanelKind = /* @__PURE__ */ ((TaskPanelKind2) => {
  TaskPanelKind2[TaskPanelKind2["Shared"] = 1] = "Shared";
  TaskPanelKind2[TaskPanelKind2["Dedicated"] = 2] = "Dedicated";
  TaskPanelKind2[TaskPanelKind2["New"] = 3] = "New";
  return TaskPanelKind2;
})(TaskPanelKind || {});

var TaskGroup = class {
  constructor(id2, label) {
    this.label = label;
    if (typeof id2 !== "string") {
      throw illegalArgument("name");
    }
    if (typeof label !== "string") {
      throw illegalArgument("name");
    }
    this._id = id2;
  }
  static from(value) {
    switch (value) {
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
  for (let i = 0; i < values.length; i++) {
    id2 += values[i].replace(/,/g, ",,") + ",";
  }
  return id2;
}

var ProcessExecution = class {
  constructor(process2, varg1, varg2) {
    if (typeof process2 !== "string") {
      throw illegalArgument("process");
    }
    this._args = [];
    this._process = process2;
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
  set process(value) {
    if (typeof value !== "string") {
      throw illegalArgument("process");
    }
    this._process = value;
  }
  get args() {
    return this._args;
  }
  set args(value) {
    if (!Array.isArray(value)) {
      value = [];
    }
    this._args = value;
  }
  get options() {
    return this._options;
  }
  set options(value) {
    this._options = value;
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
  set commandLine(value) {
    if (typeof value !== "string") {
      throw illegalArgument("commandLine");
    }
    this._commandLine = value;
  }
  get command() {
    return this._command ? this._command : "";
  }
  set command(value) {
    if (typeof value !== "string" && typeof value.value !== "string") {
      throw illegalArgument("command");
    }
    this._command = value;
  }
  get args() {
    return this._args;
  }
  set args(value) {
    this._args = value || [];
  }
  get options() {
    return this._options;
  }
  set options(value) {
    this._options = value;
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

var ShellQuoting = /* @__PURE__ */ ((ShellQuoting3) => {
  ShellQuoting3[ShellQuoting3["Escape"] = 1] = "Escape";
  ShellQuoting3[ShellQuoting3["Strong"] = 2] = "Strong";
  ShellQuoting3[ShellQuoting3["Weak"] = 3] = "Weak";
  return ShellQuoting3;
})(ShellQuoting || {});

var TaskScope = /* @__PURE__ */ ((TaskScope2) => {
  TaskScope2[TaskScope2["Global"] = 1] = "Global";
  TaskScope2[TaskScope2["Workspace"] = 2] = "Workspace";
  return TaskScope2;
})(TaskScope || {});

var TaskRunOn = /* @__PURE__ */ ((TaskRunOn2) => {
  TaskRunOn2[TaskRunOn2["Default"] = 1] = "Default";
  TaskRunOn2[TaskRunOn2["FolderOpen"] = 2] = "FolderOpen";
  TaskRunOn2[TaskRunOn2["WorktreeCreated"] = 3] = "WorktreeCreated";
  return TaskRunOn2;
})(TaskRunOn || {});

var CustomExecution = class {
  constructor(callback) {
    this._callback = callback;
  }
  computeId() {
    return "customExecution" + generateUuid();
  }
  set callback(value) {
    this._callback = value;
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
  set _id(value) {
    this.__id = value;
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
  set definition(value) {
    if (value === void 0 || value === null) {
      throw illegalArgument("Kind can't be undefined or null");
    }
    this.clear();
    this._definition = value;
  }
  get scope() {
    return this._scope;
  }
  set target(value) {
    this.clear();
    this._scope = value;
  }
  get name() {
    return this._name;
  }
  set name(value) {
    if (typeof value !== "string") {
      throw illegalArgument("name");
    }
    this.clear();
    this._name = value;
  }
  get execution() {
    return this._execution;
  }
  set execution(value) {
    if (value === null) {
      value = void 0;
    }
    this.clear();
    this._execution = value;
    const type = this._definition.type;
    if (Task.EmptyType === type || Task.ProcessType === type || Task.ShellType === type || Task.ExtensionCallbackType === type) {
      this.computeDefinitionBasedOnExecution();
    }
  }
  get problemMatchers() {
    return this._problemMatchers;
  }
  set problemMatchers(value) {
    if (!Array.isArray(value)) {
      this.clear();
      this._problemMatchers = [];
      this._hasDefinedMatchers = false;
      return;
    } else {
      this.clear();
      this._problemMatchers = value;
      this._hasDefinedMatchers = true;
    }
  }
  get hasDefinedMatchers() {
    return this._hasDefinedMatchers;
  }
  get isBackground() {
    return this._isBackground;
  }
  set isBackground(value) {
    if (value !== true && value !== false) {
      value = false;
    }
    this.clear();
    this._isBackground = value;
  }
  get source() {
    return this._source;
  }
  set source(value) {
    if (typeof value !== "string" || value.length === 0) {
      throw illegalArgument("source must be a string of length > 0");
    }
    this.clear();
    this._source = value;
  }
  get group() {
    return this._group;
  }
  set group(value) {
    if (value === null) {
      value = void 0;
    }
    this.clear();
    this._group = value;
  }
  get detail() {
    return this._detail;
  }
  set detail(value) {
    if (value === null) {
      value = void 0;
    }
    this._detail = value;
  }
  get presentationOptions() {
    return this._presentationOptions;
  }
  set presentationOptions(value) {
    if (value === null || value === void 0) {
      value = /* @__PURE__ */ Object.create(null);
    }
    this.clear();
    this._presentationOptions = value;
  }
  get runOptions() {
    return this._runOptions;
  }
  set runOptions(value) {
    if (value === null || value === void 0) {
      value = /* @__PURE__ */ Object.create(null);
    }
    this.clear();
    this._runOptions = value;
  }
};

Task.ExtensionCallbackType = "customExecution";

Task.ProcessType = "process";

Task.ShellType = "shell";

Task.EmptyType = "$empty";

Task = __decorateClass([
  es5ClassCompat
], Task);

var ProgressLocation = /* @__PURE__ */ ((ProgressLocation4) => {
  ProgressLocation4[ProgressLocation4["SourceControl"] = 1] = "SourceControl";
  ProgressLocation4[ProgressLocation4["Window"] = 10] = "Window";
  ProgressLocation4[ProgressLocation4["Notification"] = 15] = "Notification";
  return ProgressLocation4;
})(ProgressLocation || {});

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

var TreeItemCollapsibleState = /* @__PURE__ */ ((TreeItemCollapsibleState2) => {
  TreeItemCollapsibleState2[TreeItemCollapsibleState2["None"] = 0] = "None";
  TreeItemCollapsibleState2[TreeItemCollapsibleState2["Collapsed"] = 1] = "Collapsed";
  TreeItemCollapsibleState2[TreeItemCollapsibleState2["Expanded"] = 2] = "Expanded";
  return TreeItemCollapsibleState2;
})(TreeItemCollapsibleState || {});

var TreeItemCheckboxState = /* @__PURE__ */ ((TreeItemCheckboxState2) => {
  TreeItemCheckboxState2[TreeItemCheckboxState2["Unchecked"] = 0] = "Unchecked";
  TreeItemCheckboxState2[TreeItemCheckboxState2["Checked"] = 1] = "Checked";
  return TreeItemCheckboxState2;
})(TreeItemCheckboxState || {});

var DataTransferItem = class {
  constructor(value) {
    this.value = value;
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
  constructor(name, uri2, itemId, getData) {
    this.name = name;
    this.uri = uri2;
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
  set(mimeType, value) {
    __privateGet(this, _items).set(__privateMethod(this, _DataTransfer_instances, normalizeMime_fn).call(this, mimeType), [value]);
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

var DocumentPasteTriggerKind = /* @__PURE__ */ ((DocumentPasteTriggerKind2) => {
  DocumentPasteTriggerKind2[DocumentPasteTriggerKind2["Automatic"] = 0] = "Automatic";
  DocumentPasteTriggerKind2[DocumentPasteTriggerKind2["PasteAs"] = 1] = "PasteAs";
  return DocumentPasteTriggerKind2;
})(DocumentPasteTriggerKind || {});

var DocumentDropOrPasteEditKind = class _DocumentDropOrPasteEditKind {
  constructor(value) {
    this.value = value;
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

var DocumentPasteEdit = class {
  constructor(insertText, title, kind) {
    this.title = title;
    this.insertText = insertText;
    this.kind = kind;
  }
};

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

var ConfigurationTarget2 = /* @__PURE__ */ ((ConfigurationTarget5) => {
  ConfigurationTarget5[ConfigurationTarget5["Global"] = 1] = "Global";
  ConfigurationTarget5[ConfigurationTarget5["Workspace"] = 2] = "Workspace";
  ConfigurationTarget5[ConfigurationTarget5["WorkspaceFolder"] = 3] = "WorkspaceFolder";
  return ConfigurationTarget5;
})(ConfigurationTarget2 || {});

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

function setBreakpointId(bp, id2) {
  breakpointIds.set(bp, id2);
}

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
  constructor(label, dataId, canPersist, enabled, condition, hitCondition, logMessage, mode) {
    super(enabled, condition, hitCondition, logMessage, mode);
    if (!dataId) {
      throw illegalArgument("dataId");
    }
    this.label = label;
    this.dataId = dataId;
    this.canPersist = canPersist;
  }
};

DataBreakpoint = __decorateClass([
  es5ClassCompat
], DataBreakpoint);

var DebugAdapterExecutable = class {
  constructor(command, args2, options2) {
    this.command = command;
    this.args = args2 || [];
    this.options = options2;
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

var DebugStackFrame = class {
  constructor(session, threadId, frameId) {
    this.session = session;
    this.threadId = threadId;
    this.frameId = frameId;
  }
};

var DebugThread = class {
  constructor(session, threadId) {
    this.session = session;
    this.threadId = threadId;
  }
};

var EvaluatableExpression = class {
  constructor(range, expression) {
    this.range = range;
    this.expression = expression;
  }
};

EvaluatableExpression = __decorateClass([
  es5ClassCompat
], EvaluatableExpression);

var InlineCompletionTriggerKind = /* @__PURE__ */ ((InlineCompletionTriggerKind3) => {
  InlineCompletionTriggerKind3[InlineCompletionTriggerKind3["Invoke"] = 0] = "Invoke";
  InlineCompletionTriggerKind3[InlineCompletionTriggerKind3["Automatic"] = 1] = "Automatic";
  return InlineCompletionTriggerKind3;
})(InlineCompletionTriggerKind || {});

var InlineCompletionsDisposeReasonKind = /* @__PURE__ */ ((InlineCompletionsDisposeReasonKind2) => {
  InlineCompletionsDisposeReasonKind2[InlineCompletionsDisposeReasonKind2["Other"] = 0] = "Other";
  InlineCompletionsDisposeReasonKind2[InlineCompletionsDisposeReasonKind2["Empty"] = 1] = "Empty";
  InlineCompletionsDisposeReasonKind2[InlineCompletionsDisposeReasonKind2["TokenCancellation"] = 2] = "TokenCancellation";
  InlineCompletionsDisposeReasonKind2[InlineCompletionsDisposeReasonKind2["LostRace"] = 3] = "LostRace";
  InlineCompletionsDisposeReasonKind2[InlineCompletionsDisposeReasonKind2["NotTaken"] = 4] = "NotTaken";
  return InlineCompletionsDisposeReasonKind2;
})(InlineCompletionsDisposeReasonKind || {});

var InlineValueText = class {
  constructor(range, text) {
    this.range = range;
    this.text = text;
  }
};

InlineValueText = __decorateClass([
  es5ClassCompat
], InlineValueText);

var InlineValueVariableLookup = class {
  constructor(range, variableName, caseSensitiveLookup = true) {
    this.range = range;
    this.variableName = variableName;
    this.caseSensitiveLookup = caseSensitiveLookup;
  }
};

InlineValueVariableLookup = __decorateClass([
  es5ClassCompat
], InlineValueVariableLookup);

var InlineValueEvaluatableExpression = class {
  constructor(range, expression) {
    this.range = range;
    this.expression = expression;
  }
};

InlineValueEvaluatableExpression = __decorateClass([
  es5ClassCompat
], InlineValueEvaluatableExpression);

var InlineValueContext = class {
  constructor(frameId, range) {
    this.frameId = frameId;
    this.stoppedLocation = range;
  }
};

InlineValueContext = __decorateClass([
  es5ClassCompat
], InlineValueContext);

var NewSymbolNameTag = /* @__PURE__ */ ((NewSymbolNameTag2) => {
  NewSymbolNameTag2[NewSymbolNameTag2["AIGenerated"] = 1] = "AIGenerated";
  return NewSymbolNameTag2;
})(NewSymbolNameTag || {});

var NewSymbolNameTriggerKind = /* @__PURE__ */ ((NewSymbolNameTriggerKind3) => {
  NewSymbolNameTriggerKind3[NewSymbolNameTriggerKind3["Invoke"] = 0] = "Invoke";
  NewSymbolNameTriggerKind3[NewSymbolNameTriggerKind3["Automatic"] = 1] = "Automatic";
  return NewSymbolNameTriggerKind3;
})(NewSymbolNameTriggerKind || {});

var NewSymbolName = class {
  constructor(newSymbolName, tags) {
    this.newSymbolName = newSymbolName;
    this.tags = tags;
  }
};

var FileChangeType = /* @__PURE__ */ ((FileChangeType3) => {
  FileChangeType3[FileChangeType3["Changed"] = 1] = "Changed";
  FileChangeType3[FileChangeType3["Created"] = 2] = "Created";
  FileChangeType3[FileChangeType3["Deleted"] = 3] = "Deleted";
  return FileChangeType3;
})(FileChangeType || {});

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

var FoldingRange = class {
  constructor(start, end, kind) {
    this.start = start;
    this.end = end;
    this.kind = kind;
  }
};

FoldingRange = __decorateClass([
  es5ClassCompat
], FoldingRange);

var FoldingRangeKind2 = /* @__PURE__ */ ((FoldingRangeKind4) => {
  FoldingRangeKind4[FoldingRangeKind4["Comment"] = 1] = "Comment";
  FoldingRangeKind4[FoldingRangeKind4["Imports"] = 2] = "Imports";
  FoldingRangeKind4[FoldingRangeKind4["Region"] = 3] = "Region";
  return FoldingRangeKind4;
})(FoldingRangeKind2 || {});

var CommentThreadCollapsibleState = /* @__PURE__ */ ((CommentThreadCollapsibleState3) => {
  CommentThreadCollapsibleState3[CommentThreadCollapsibleState3["Collapsed"] = 0] = "Collapsed";
  CommentThreadCollapsibleState3[CommentThreadCollapsibleState3["Expanded"] = 1] = "Expanded";
  return CommentThreadCollapsibleState3;
})(CommentThreadCollapsibleState || {});

var CommentMode = /* @__PURE__ */ ((CommentMode2) => {
  CommentMode2[CommentMode2["Editing"] = 0] = "Editing";
  CommentMode2[CommentMode2["Preview"] = 1] = "Preview";
  return CommentMode2;
})(CommentMode || {});

var CommentState = /* @__PURE__ */ ((CommentState2) => {
  CommentState2[CommentState2["Published"] = 0] = "Published";
  CommentState2[CommentState2["Draft"] = 1] = "Draft";
  return CommentState2;
})(CommentState || {});

var CommentThreadState = /* @__PURE__ */ ((CommentThreadState3) => {
  CommentThreadState3[CommentThreadState3["Unresolved"] = 0] = "Unresolved";
  CommentThreadState3[CommentThreadState3["Resolved"] = 1] = "Resolved";
  return CommentThreadState3;
})(CommentThreadState || {});

var CommentThreadApplicability = /* @__PURE__ */ ((CommentThreadApplicability3) => {
  CommentThreadApplicability3[CommentThreadApplicability3["Current"] = 0] = "Current";
  CommentThreadApplicability3[CommentThreadApplicability3["Outdated"] = 1] = "Outdated";
  return CommentThreadApplicability3;
})(CommentThreadApplicability || {});

var CommentThreadFocus = /* @__PURE__ */ ((CommentThreadFocus2) => {
  CommentThreadFocus2[CommentThreadFocus2["Reply"] = 1] = "Reply";
  CommentThreadFocus2[CommentThreadFocus2["Comment"] = 2] = "Comment";
  return CommentThreadFocus2;
})(CommentThreadFocus || {});

var SemanticTokensLegend = class {
  constructor(tokenTypes, tokenModifiers = []) {
    this.tokenTypes = tokenTypes;
    this.tokenModifiers = tokenModifiers;
  }
};

function isStrArrayOrUndefined(arg) {
  return typeof arg === "undefined" || isStringArray(arg);
}

var SemanticTokensBuilder = class _SemanticTokensBuilder {
  constructor(legend) {
    this._prevLine = 0;
    this._prevChar = 0;
    this._dataIsSortedAndDeltaEncoded = true;
    this._data = [];
    this._dataLen = 0;
    this._tokenTypeStrToInt = /* @__PURE__ */ new Map();
    this._tokenModifierStrToInt = /* @__PURE__ */ new Map();
    this._hasLegend = false;
    if (legend) {
      this._hasLegend = true;
      for (let i = 0, len = legend.tokenTypes.length; i < len; i++) {
        this._tokenTypeStrToInt.set(legend.tokenTypes[i], i);
      }
      for (let i = 0, len = legend.tokenModifiers.length; i < len; i++) {
        this._tokenModifierStrToInt.set(legend.tokenModifiers[i], i);
      }
    }
  }
  push(arg0, arg1, arg2, arg3, arg4) {
    if (typeof arg0 === "number" && typeof arg1 === "number" && typeof arg2 === "number" && typeof arg3 === "number" && (typeof arg4 === "number" || typeof arg4 === "undefined")) {
      if (typeof arg4 === "undefined") {
        arg4 = 0;
      }
      return this._pushEncoded(arg0, arg1, arg2, arg3, arg4);
    }
    if (Range2.isRange(arg0) && typeof arg1 === "string" && isStrArrayOrUndefined(arg2)) {
      return this._push(arg0, arg1, arg2);
    }
    throw illegalArgument();
  }
  _push(range, tokenType, tokenModifiers) {
    if (!this._hasLegend) {
      throw new Error("Legend must be provided in constructor");
    }
    if (range.start.line !== range.end.line) {
      throw new Error("`range` cannot span multiple lines");
    }
    if (!this._tokenTypeStrToInt.has(tokenType)) {
      throw new Error("`tokenType` is not in the provided legend");
    }
    const line = range.start.line;
    const char = range.start.character;
    const length = range.end.character - range.start.character;
    const nTokenType = this._tokenTypeStrToInt.get(tokenType);
    let nTokenModifiers = 0;
    if (tokenModifiers) {
      for (const tokenModifier of tokenModifiers) {
        if (!this._tokenModifierStrToInt.has(tokenModifier)) {
          throw new Error("`tokenModifier` is not in the provided legend");
        }
        const nTokenModifier = this._tokenModifierStrToInt.get(tokenModifier);
        nTokenModifiers |= 1 << nTokenModifier >>> 0;
      }
    }
    this._pushEncoded(line, char, length, nTokenType, nTokenModifiers);
  }
  _pushEncoded(line, char, length, tokenType, tokenModifiers) {
    if (this._dataIsSortedAndDeltaEncoded && (line < this._prevLine || line === this._prevLine && char < this._prevChar)) {
      this._dataIsSortedAndDeltaEncoded = false;
      const tokenCount = this._data.length / 5 | 0;
      let prevLine = 0;
      let prevChar = 0;
      for (let i = 0; i < tokenCount; i++) {
        let line2 = this._data[5 * i];
        let char2 = this._data[5 * i + 1];
        if (line2 === 0) {
          line2 = prevLine;
          char2 += prevChar;
        } else {
          line2 += prevLine;
        }
        this._data[5 * i] = line2;
        this._data[5 * i + 1] = char2;
        prevLine = line2;
        prevChar = char2;
      }
    }
    let pushLine = line;
    let pushChar = char;
    if (this._dataIsSortedAndDeltaEncoded && this._dataLen > 0) {
      pushLine -= this._prevLine;
      if (pushLine === 0) {
        pushChar -= this._prevChar;
      }
    }
    this._data[this._dataLen++] = pushLine;
    this._data[this._dataLen++] = pushChar;
    this._data[this._dataLen++] = length;
    this._data[this._dataLen++] = tokenType;
    this._data[this._dataLen++] = tokenModifiers;
    this._prevLine = line;
    this._prevChar = char;
  }
  static _sortAndDeltaEncode(data) {
    const pos = [];
    const tokenCount = data.length / 5 | 0;
    for (let i = 0; i < tokenCount; i++) {
      pos[i] = i;
    }
    pos.sort((a, b) => {
      const aLine = data[5 * a];
      const bLine = data[5 * b];
      if (aLine === bLine) {
        const aChar = data[5 * a + 1];
        const bChar = data[5 * b + 1];
        return aChar - bChar;
      }
      return aLine - bLine;
    });
    const result = new Uint32Array(data.length);
    let prevLine = 0;
    let prevChar = 0;
    for (let i = 0; i < tokenCount; i++) {
      const srcOffset = 5 * pos[i];
      const line = data[srcOffset + 0];
      const char = data[srcOffset + 1];
      const length = data[srcOffset + 2];
      const tokenType = data[srcOffset + 3];
      const tokenModifiers = data[srcOffset + 4];
      const pushLine = line - prevLine;
      const pushChar = pushLine === 0 ? char - prevChar : char;
      const dstOffset = 5 * i;
      result[dstOffset + 0] = pushLine;
      result[dstOffset + 1] = pushChar;
      result[dstOffset + 2] = length;
      result[dstOffset + 3] = tokenType;
      result[dstOffset + 4] = tokenModifiers;
      prevLine = line;
      prevChar = char;
    }
    return result;
  }
  build(resultId) {
    if (!this._dataIsSortedAndDeltaEncoded) {
      return new SemanticTokens(_SemanticTokensBuilder._sortAndDeltaEncode(this._data), resultId);
    }
    return new SemanticTokens(new Uint32Array(this._data), resultId);
  }
};

var SemanticTokens = class {
  constructor(data, resultId) {
    this.resultId = resultId;
    this.data = data;
  }
};

var SemanticTokensEdit = class {
  constructor(start, deleteCount, data) {
    this.start = start;
    this.deleteCount = deleteCount;
    this.data = data;
  }
};

var SemanticTokensEdits = class {
  constructor(edits, resultId) {
    this.resultId = resultId;
    this.edits = edits;
  }
};

var DebugConsoleMode = /* @__PURE__ */ ((DebugConsoleMode2) => {
  DebugConsoleMode2[DebugConsoleMode2["Separate"] = 0] = "Separate";
  DebugConsoleMode2[DebugConsoleMode2["MergeWithParent"] = 1] = "MergeWithParent";
  return DebugConsoleMode2;
})(DebugConsoleMode || {});

var DebugVisualization = class {
  constructor(name) {
    this.name = name;
  }
};

var QuickInputButtonLocation = /* @__PURE__ */ ((QuickInputButtonLocation2) => {
  QuickInputButtonLocation2[QuickInputButtonLocation2["Title"] = 1] = "Title";
  QuickInputButtonLocation2[QuickInputButtonLocation2["Inline"] = 2] = "Inline";
  QuickInputButtonLocation2[QuickInputButtonLocation2["Input"] = 3] = "Input";
  return QuickInputButtonLocation2;
})(QuickInputButtonLocation || {});

var QuickInputButtons = class {
  constructor() {
  }
};

QuickInputButtons.Back = { iconPath: new ThemeIcon2("arrow-left") };

QuickInputButtons = __decorateClass([
  es5ClassCompat
], QuickInputButtons);

var QuickPickItemKind = /* @__PURE__ */ ((QuickPickItemKind2) => {
  QuickPickItemKind2[QuickPickItemKind2["Separator"] = -1] = "Separator";
  QuickPickItemKind2[QuickPickItemKind2["Default"] = 0] = "Default";
  return QuickPickItemKind2;
})(QuickPickItemKind || {});

var InputBoxValidationSeverity = /* @__PURE__ */ ((InputBoxValidationSeverity2) => {
  InputBoxValidationSeverity2[InputBoxValidationSeverity2["Info"] = 1] = "Info";
  InputBoxValidationSeverity2[InputBoxValidationSeverity2["Warning"] = 2] = "Warning";
  InputBoxValidationSeverity2[InputBoxValidationSeverity2["Error"] = 3] = "Error";
  return InputBoxValidationSeverity2;
})(InputBoxValidationSeverity || {});

var ExtensionKind = /* @__PURE__ */ ((ExtensionKind2) => {
  ExtensionKind2[ExtensionKind2["UI"] = 1] = "UI";
  ExtensionKind2[ExtensionKind2["Workspace"] = 2] = "Workspace";
  return ExtensionKind2;
})(ExtensionKind || {});

var FileDecoration = class {
  static validate(d) {
    if (typeof d.badge === "string") {
      let len = nextCharLength(d.badge, 0);
      if (len < d.badge.length) {
        len += nextCharLength(d.badge, len);
      }
      if (d.badge.length > len) {
        throw new Error(`The 'badge'-property must be undefined or a short character`);
      }
    } else if (d.badge) {
      if (!ThemeIcon2.isThemeIcon(d.badge)) {
        throw new Error(`The 'badge'-property is not a valid ThemeIcon`);
      }
    }
    if (!d.color && !d.badge && !d.tooltip) {
      throw new Error(`The decoration is empty`);
    }
    return true;
  }
  constructor(badge, tooltip, color2) {
    this.badge = badge;
    this.tooltip = tooltip;
    this.color = color2;
  }
};

var ColorTheme = class {
  constructor(kind) {
    this.kind = kind;
  }
};

ColorTheme = __decorateClass([
  es5ClassCompat
], ColorTheme);

var ColorThemeKind = /* @__PURE__ */ ((ColorThemeKind2) => {
  ColorThemeKind2[ColorThemeKind2["Light"] = 1] = "Light";
  ColorThemeKind2[ColorThemeKind2["Dark"] = 2] = "Dark";
  ColorThemeKind2[ColorThemeKind2["HighContrast"] = 3] = "HighContrast";
  ColorThemeKind2[ColorThemeKind2["HighContrastLight"] = 4] = "HighContrastLight";
  return ColorThemeKind2;
})(ColorThemeKind || {});

var CellErrorStackFrame = class {
  /**
   * @param label The name of the stack frame
   * @param file The file URI of the stack frame
   * @param position The position of the stack frame within the file
   */
  constructor(label, uri2, position) {
    this.label = label;
    this.uri = uri2;
    this.position = position;
  }
};

var NotebookCellExecutionState = /* @__PURE__ */ ((NotebookCellExecutionState2) => {
  NotebookCellExecutionState2[NotebookCellExecutionState2["Idle"] = 1] = "Idle";
  NotebookCellExecutionState2[NotebookCellExecutionState2["Pending"] = 2] = "Pending";
  NotebookCellExecutionState2[NotebookCellExecutionState2["Executing"] = 3] = "Executing";
  return NotebookCellExecutionState2;
})(NotebookCellExecutionState || {});

var NotebookCellStatusBarAlignment = /* @__PURE__ */ ((NotebookCellStatusBarAlignment2) => {
  NotebookCellStatusBarAlignment2[NotebookCellStatusBarAlignment2["Left"] = 1] = "Left";
  NotebookCellStatusBarAlignment2[NotebookCellStatusBarAlignment2["Right"] = 2] = "Right";
  return NotebookCellStatusBarAlignment2;
})(NotebookCellStatusBarAlignment || {});

var NotebookEditorRevealType = /* @__PURE__ */ ((NotebookEditorRevealType2) => {
  NotebookEditorRevealType2[NotebookEditorRevealType2["Default"] = 0] = "Default";
  NotebookEditorRevealType2[NotebookEditorRevealType2["InCenter"] = 1] = "InCenter";
  NotebookEditorRevealType2[NotebookEditorRevealType2["InCenterIfOutsideViewport"] = 2] = "InCenterIfOutsideViewport";
  NotebookEditorRevealType2[NotebookEditorRevealType2["AtTop"] = 3] = "AtTop";
  return NotebookEditorRevealType2;
})(NotebookEditorRevealType || {});

var NotebookCellStatusBarItem = class {
  constructor(text, alignment) {
    this.text = text;
    this.alignment = alignment;
  }
};

var NotebookControllerAffinity = /* @__PURE__ */ ((NotebookControllerAffinity3) => {
  NotebookControllerAffinity3[NotebookControllerAffinity3["Default"] = 1] = "Default";
  NotebookControllerAffinity3[NotebookControllerAffinity3["Preferred"] = 2] = "Preferred";
  return NotebookControllerAffinity3;
})(NotebookControllerAffinity || {});

var NotebookControllerAffinity2 = /* @__PURE__ */ ((NotebookControllerAffinity22) => {
  NotebookControllerAffinity22[NotebookControllerAffinity22["Default"] = 1] = "Default";
  NotebookControllerAffinity22[NotebookControllerAffinity22["Preferred"] = 2] = "Preferred";
  NotebookControllerAffinity22[NotebookControllerAffinity22["Hidden"] = -1] = "Hidden";
  return NotebookControllerAffinity22;
})(NotebookControllerAffinity2 || {});

var NotebookRendererScript = class {
  constructor(uri2, provides = []) {
    this.uri = uri2;
    this.provides = asArray(provides);
  }
};

var NotebookKernelSourceAction = class {
  constructor(label) {
    this.label = label;
  }
};

var NotebookVariablesRequestKind = /* @__PURE__ */ ((NotebookVariablesRequestKind2) => {
  NotebookVariablesRequestKind2[NotebookVariablesRequestKind2["Named"] = 1] = "Named";
  NotebookVariablesRequestKind2[NotebookVariablesRequestKind2["Indexed"] = 2] = "Indexed";
  return NotebookVariablesRequestKind2;
})(NotebookVariablesRequestKind || {});

var TimelineItem = class {
  constructor(label, timestamp) {
    this.label = label;
    this.timestamp = timestamp;
  }
};

TimelineItem = __decorateClass([
  es5ClassCompat
], TimelineItem);

var ExtensionMode = /* @__PURE__ */ ((ExtensionMode2) => {
  ExtensionMode2[ExtensionMode2["Production"] = 1] = "Production";
  ExtensionMode2[ExtensionMode2["Development"] = 2] = "Development";
  ExtensionMode2[ExtensionMode2["Test"] = 3] = "Test";
  return ExtensionMode2;
})(ExtensionMode || {});

var ExtensionRuntime = /* @__PURE__ */ ((ExtensionRuntime3) => {
  ExtensionRuntime3[ExtensionRuntime3["Node"] = 1] = "Node";
  ExtensionRuntime3[ExtensionRuntime3["Webworker"] = 2] = "Webworker";
  return ExtensionRuntime3;
})(ExtensionRuntime || {});

var StandardTokenType = /* @__PURE__ */ ((StandardTokenType3) => {
  StandardTokenType3[StandardTokenType3["Other"] = 0] = "Other";
  StandardTokenType3[StandardTokenType3["Comment"] = 1] = "Comment";
  StandardTokenType3[StandardTokenType3["String"] = 2] = "String";
  StandardTokenType3[StandardTokenType3["RegEx"] = 3] = "RegEx";
  return StandardTokenType3;
})(StandardTokenType || {});

var SyntaxHighlightingTokenFontStyle = /* @__PURE__ */ ((SyntaxHighlightingTokenFontStyle2) => {
  SyntaxHighlightingTokenFontStyle2[SyntaxHighlightingTokenFontStyle2["None"] = 0] = "None";
  SyntaxHighlightingTokenFontStyle2[SyntaxHighlightingTokenFontStyle2["Italic"] = 1] = "Italic";
  SyntaxHighlightingTokenFontStyle2[SyntaxHighlightingTokenFontStyle2["Bold"] = 2] = "Bold";
  SyntaxHighlightingTokenFontStyle2[SyntaxHighlightingTokenFontStyle2["Underline"] = 4] = "Underline";
  SyntaxHighlightingTokenFontStyle2[SyntaxHighlightingTokenFontStyle2["Strikethrough"] = 8] = "Strikethrough";
  return SyntaxHighlightingTokenFontStyle2;
})(SyntaxHighlightingTokenFontStyle || {});

var LinkedEditingRanges = class {
  constructor(ranges, wordPattern) {
    this.ranges = ranges;
    this.wordPattern = wordPattern;
  }
};

var PortAttributes = class {
  constructor(autoForwardAction) {
    this._autoForwardAction = autoForwardAction;
  }
  get autoForwardAction() {
    return this._autoForwardAction;
  }
};

var TestResultState = /* @__PURE__ */ ((TestResultState3) => {
  TestResultState3[TestResultState3["Queued"] = 1] = "Queued";
  TestResultState3[TestResultState3["Running"] = 2] = "Running";
  TestResultState3[TestResultState3["Passed"] = 3] = "Passed";
  TestResultState3[TestResultState3["Failed"] = 4] = "Failed";
  TestResultState3[TestResultState3["Skipped"] = 5] = "Skipped";
  TestResultState3[TestResultState3["Errored"] = 6] = "Errored";
  return TestResultState3;
})(TestResultState || {});

var TestRunProfileKind = /* @__PURE__ */ ((TestRunProfileKind3) => {
  TestRunProfileKind3[TestRunProfileKind3["Run"] = 1] = "Run";
  TestRunProfileKind3[TestRunProfileKind3["Debug"] = 2] = "Debug";
  TestRunProfileKind3[TestRunProfileKind3["Coverage"] = 3] = "Coverage";
  return TestRunProfileKind3;
})(TestRunProfileKind || {});

var TestRunProfileBase = class {
  constructor(controllerId, profileId, kind) {
    this.controllerId = controllerId;
    this.profileId = profileId;
    this.kind = kind;
  }
};

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

var TestMessageStackFrame = class {
  /**
   * @param label The name of the stack frame
   * @param file The file URI of the stack frame
   * @param position The position of the stack frame within the file
   */
  constructor(label, uri2, position) {
    this.label = label;
    this.uri = uri2;
    this.position = position;
  }
};

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
  constructor(uri2, statementCoverage, branchCoverage, declarationCoverage, includesTests = []) {
    this.uri = uri2;
    this.statementCoverage = statementCoverage;
    this.branchCoverage = branchCoverage;
    this.declarationCoverage = declarationCoverage;
    this.includesTests = includesTests;
  }
  static fromDetails(uri2, details) {
    const statements = new TestCoverageCount(0, 0);
    const branches = new TestCoverageCount(0, 0);
    const decl = new TestCoverageCount(0, 0);
    for (const detail of details) {
      if ("branches" in detail) {
        statements.total += 1;
        statements.covered += detail.executed ? 1 : 0;
        for (const branch of detail.branches) {
          branches.total += 1;
          branches.covered += branch.executed ? 1 : 0;
        }
      } else {
        decl.total += 1;
        decl.covered += detail.executed ? 1 : 0;
      }
    }
    const coverage = new _FileCoverage(
      uri2,
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
  set executionCount(n) {
    this.executed = n;
  }
};

var BranchCoverage = class {
  constructor(executed, location2, label) {
    this.executed = executed;
    this.location = location2;
    this.label = label;
  }
  // back compat until finalization:
  get executionCount() {
    return +this.executed;
  }
  set executionCount(n) {
    this.executed = n;
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
  set executionCount(n) {
    this.executed = n;
  }
};

var ExternalUriOpenerPriority = /* @__PURE__ */ ((ExternalUriOpenerPriority2) => {
  ExternalUriOpenerPriority2[ExternalUriOpenerPriority2["None"] = 0] = "None";
  ExternalUriOpenerPriority2[ExternalUriOpenerPriority2["Option"] = 1] = "Option";
  ExternalUriOpenerPriority2[ExternalUriOpenerPriority2["Default"] = 2] = "Default";
  ExternalUriOpenerPriority2[ExternalUriOpenerPriority2["Preferred"] = 3] = "Preferred";
  return ExternalUriOpenerPriority2;
})(ExternalUriOpenerPriority || {});

var WorkspaceTrustState = /* @__PURE__ */ ((WorkspaceTrustState2) => {
  WorkspaceTrustState2[WorkspaceTrustState2["Untrusted"] = 0] = "Untrusted";
  WorkspaceTrustState2[WorkspaceTrustState2["Trusted"] = 1] = "Trusted";
  WorkspaceTrustState2[WorkspaceTrustState2["Unspecified"] = 2] = "Unspecified";
  return WorkspaceTrustState2;
})(WorkspaceTrustState || {});

var PortAutoForwardAction = /* @__PURE__ */ ((PortAutoForwardAction2) => {
  PortAutoForwardAction2[PortAutoForwardAction2["Notify"] = 1] = "Notify";
  PortAutoForwardAction2[PortAutoForwardAction2["OpenBrowser"] = 2] = "OpenBrowser";
  PortAutoForwardAction2[PortAutoForwardAction2["OpenPreview"] = 3] = "OpenPreview";
  PortAutoForwardAction2[PortAutoForwardAction2["Silent"] = 4] = "Silent";
  PortAutoForwardAction2[PortAutoForwardAction2["Ignore"] = 5] = "Ignore";
  PortAutoForwardAction2[PortAutoForwardAction2["OpenBrowserOnce"] = 6] = "OpenBrowserOnce";
  return PortAutoForwardAction2;
})(PortAutoForwardAction || {});

var TypeHierarchyItem = class {
  constructor(kind, name, detail, uri2, range, selectionRange) {
    this.kind = kind;
    this.name = name;
    this.detail = detail;
    this.uri = uri2;
    this.range = range;
    this.selectionRange = selectionRange;
  }
};

var TextTabInput = class {
  constructor(uri2) {
    this.uri = uri2;
  }
};

var TextDiffTabInput = class {
  constructor(original, modified) {
    this.original = original;
    this.modified = modified;
  }
};

var TextMergeTabInput = class {
  constructor(base, input1, input2, result) {
    this.base = base;
    this.input1 = input1;
    this.input2 = input2;
    this.result = result;
  }
};

var CustomEditorTabInput = class {
  constructor(uri2, viewType) {
    this.uri = uri2;
    this.viewType = viewType;
  }
};

var WebviewEditorTabInput = class {
  constructor(viewType) {
    this.viewType = viewType;
  }
};

var NotebookEditorTabInput = class {
  constructor(uri2, notebookType) {
    this.uri = uri2;
    this.notebookType = notebookType;
  }
};

var NotebookDiffEditorTabInput = class {
  constructor(original, modified, notebookType) {
    this.original = original;
    this.modified = modified;
    this.notebookType = notebookType;
  }
};

var TerminalEditorTabInput = class {
  constructor() {
  }
};

var InteractiveWindowInput = class {
  constructor(uri2, inputBoxUri) {
    this.uri = uri2;
    this.inputBoxUri = inputBoxUri;
  }
};

var ChatEditorTabInput = class {
  constructor() {
  }
};

var TextMultiDiffTabInput = class {
  constructor(textDiffs) {
    this.textDiffs = textDiffs;
  }
};

var InteractiveSessionVoteDirection = /* @__PURE__ */ ((InteractiveSessionVoteDirection2) => {
  InteractiveSessionVoteDirection2[InteractiveSessionVoteDirection2["Down"] = 0] = "Down";
  InteractiveSessionVoteDirection2[InteractiveSessionVoteDirection2["Up"] = 1] = "Up";
  return InteractiveSessionVoteDirection2;
})(InteractiveSessionVoteDirection || {});

var ChatCopyKind = /* @__PURE__ */ ((ChatCopyKind2) => {
  ChatCopyKind2[ChatCopyKind2["Action"] = 1] = "Action";
  ChatCopyKind2[ChatCopyKind2["Toolbar"] = 2] = "Toolbar";
  return ChatCopyKind2;
})(ChatCopyKind || {});

var ChatVariableLevel = /* @__PURE__ */ ((ChatVariableLevel2) => {
  ChatVariableLevel2[ChatVariableLevel2["Short"] = 1] = "Short";
  ChatVariableLevel2[ChatVariableLevel2["Medium"] = 2] = "Medium";
  ChatVariableLevel2[ChatVariableLevel2["Full"] = 3] = "Full";
  return ChatVariableLevel2;
})(ChatVariableLevel || {});

var ChatCompletionItem = class {
  constructor(id2, label, values) {
    this.id = id2;
    this.label = label;
    this.values = values;
  }
};

var ChatEditingSessionActionOutcome = /* @__PURE__ */ ((ChatEditingSessionActionOutcome2) => {
  ChatEditingSessionActionOutcome2[ChatEditingSessionActionOutcome2["Accepted"] = 1] = "Accepted";
  ChatEditingSessionActionOutcome2[ChatEditingSessionActionOutcome2["Rejected"] = 2] = "Rejected";
  ChatEditingSessionActionOutcome2[ChatEditingSessionActionOutcome2["Saved"] = 3] = "Saved";
  return ChatEditingSessionActionOutcome2;
})(ChatEditingSessionActionOutcome || {});

var ChatRequestEditedFileEventKind = /* @__PURE__ */ ((ChatRequestEditedFileEventKind2) => {
  ChatRequestEditedFileEventKind2[ChatRequestEditedFileEventKind2["Keep"] = 1] = "Keep";
  ChatRequestEditedFileEventKind2[ChatRequestEditedFileEventKind2["Undo"] = 2] = "Undo";
  ChatRequestEditedFileEventKind2[ChatRequestEditedFileEventKind2["UserModification"] = 3] = "UserModification";
  return ChatRequestEditedFileEventKind2;
})(ChatRequestEditedFileEventKind || {});

var InteractiveEditorResponseFeedbackKind = /* @__PURE__ */ ((InteractiveEditorResponseFeedbackKind2) => {
  InteractiveEditorResponseFeedbackKind2[InteractiveEditorResponseFeedbackKind2["Unhelpful"] = 0] = "Unhelpful";
  InteractiveEditorResponseFeedbackKind2[InteractiveEditorResponseFeedbackKind2["Helpful"] = 1] = "Helpful";
  InteractiveEditorResponseFeedbackKind2[InteractiveEditorResponseFeedbackKind2["Undone"] = 2] = "Undone";
  InteractiveEditorResponseFeedbackKind2[InteractiveEditorResponseFeedbackKind2["Accepted"] = 3] = "Accepted";
  InteractiveEditorResponseFeedbackKind2[InteractiveEditorResponseFeedbackKind2["Bug"] = 4] = "Bug";
  return InteractiveEditorResponseFeedbackKind2;
})(InteractiveEditorResponseFeedbackKind || {});

var ChatResultFeedbackKind = /* @__PURE__ */ ((ChatResultFeedbackKind2) => {
  ChatResultFeedbackKind2[ChatResultFeedbackKind2["Unhelpful"] = 0] = "Unhelpful";
  ChatResultFeedbackKind2[ChatResultFeedbackKind2["Helpful"] = 1] = "Helpful";
  return ChatResultFeedbackKind2;
})(ChatResultFeedbackKind || {});

var ChatResponseMarkdownPart = class {
  constructor(value) {
    if (typeof value !== "string" && value.isTrusted === true) {
      throw new Error("The boolean form of MarkdownString.isTrusted is NOT supported for chat participants.");
    }
    this.value = typeof value === "string" ? new MarkdownString2(value) : value;
  }
};

var ChatResponseMarkdownWithVulnerabilitiesPart = class {
  constructor(value, vulnerabilities) {
    if (typeof value !== "string" && value.isTrusted === true) {
      throw new Error("The boolean form of MarkdownString.isTrusted is NOT supported for chat participants.");
    }
    this.value = typeof value === "string" ? new MarkdownString2(value) : value;
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
  constructor(value, baseUri) {
    this.value = value;
    this.baseUri = baseUri;
  }
};

var ChatResponseMultiDiffPart = class {
  constructor(value, title, readOnly) {
    this.value = value;
    this.title = title;
    this.readOnly = readOnly;
  }
};

var McpToolInvocationContentData = class {
  constructor(data, mimeType) {
    this.data = data;
    this.mimeType = mimeType;
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

var ChatResponseExternalEditPart = class {
  constructor(uris, callback) {
    this.uris = uris;
    this.callback = callback;
    this.applied = new Promise((resolve2) => {
      this.didGetApplied = resolve2;
    });
  }
};

var ChatResponseAnchorPart = class {
  constructor(value, title) {
    this.value = value;
    this.value2 = value;
    this.title = title;
  }
};

var ChatResponseProgressPart = class {
  constructor(value) {
    this.value = value;
  }
};

var ChatResponseProgressPart2 = class {
  constructor(value, task) {
    this.value = value;
    this.task = task;
  }
};

var ChatResponseThinkingProgressPart = class {
  constructor(value, id2, metadata) {
    this.value = value;
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
  constructor(id2, value) {
    this.id = id2;
    this.value = value;
  }
};

var ChatResponseAutoModeResolutionPart = class {
  constructor(resolvedModel) {
    this.resolvedModel = resolvedModel;
  }
};

var ChatResponseWarningPart = class {
  constructor(value) {
    if (typeof value !== "string" && value.isTrusted === true) {
      throw new Error("The boolean form of MarkdownString.isTrusted is NOT supported for chat participants.");
    }
    this.value = typeof value === "string" ? new MarkdownString2(value) : value;
  }
};

var ChatResponseInfoPart = class {
  constructor(value) {
    if (typeof value !== "string" && value.isTrusted === true) {
      throw new Error("The boolean form of MarkdownString.isTrusted is NOT supported for chat participants.");
    }
    this.value = typeof value === "string" ? new MarkdownString2(value) : value;
  }
};

var ChatResponseCommandButtonPart = class {
  constructor(value) {
    this.value = value;
  }
};

var ChatResponseReferencePart = class {
  constructor(value, iconPath, options2) {
    this.value = value;
    this.iconPath = iconPath;
    this.options = options2;
  }
};

var ChatResponseCodeblockUriPart = class {
  constructor(value, isEdit, undoStopId) {
    this.value = value;
    this.isEdit = isEdit;
    this.undoStopId = undoStopId;
  }
};

var ChatResponseCodeCitationPart = class {
  constructor(value, license, snippet) {
    this.value = value;
    this.license = license;
    this.snippet = snippet;
  }
};

var ChatResponseMovePart = class {
  constructor(uri2, range) {
    this.uri = uri2;
    this.range = range;
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

var ChatQuestionType = /* @__PURE__ */ ((ChatQuestionType2) => {
  ChatQuestionType2[ChatQuestionType2["Text"] = 1] = "Text";
  ChatQuestionType2[ChatQuestionType2["SingleSelect"] = 2] = "SingleSelect";
  ChatQuestionType2[ChatQuestionType2["MultiSelect"] = 3] = "MultiSelect";
  return ChatQuestionType2;
})(ChatQuestionType || {});

var ChatQuestion = class {
  constructor(id2, type, title, options2) {
    this.id = id2;
    this.type = type;
    this.title = title;
    this.message = options2?.message;
    this.options = options2?.options;
    this.defaultValue = options2?.defaultValue;
    this.allowFreeformInput = options2?.allowFreeformInput;
  }
};

var ChatResponseQuestionCarouselPart = class {
  constructor(questions, allowSkip = true) {
    this.questions = questions;
    this.allowSkip = allowSkip;
  }
};

var ChatResponseTextEditPart = class {
  constructor(uri2, editsOrDone) {
    this.uri = uri2;
    if (editsOrDone === true) {
      this.isDone = true;
      this.edits = [];
    } else {
      this.edits = Array.isArray(editsOrDone) ? editsOrDone : [editsOrDone];
    }
  }
};

var ChatResponseNotebookEditPart = class {
  constructor(uri2, editsOrDone) {
    this.uri = uri2;
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

var ChatTodoStatus = /* @__PURE__ */ ((ChatTodoStatus2) => {
  ChatTodoStatus2[ChatTodoStatus2["NotStarted"] = 1] = "NotStarted";
  ChatTodoStatus2[ChatTodoStatus2["InProgress"] = 2] = "InProgress";
  ChatTodoStatus2[ChatTodoStatus2["Completed"] = 3] = "Completed";
  return ChatTodoStatus2;
})(ChatTodoStatus || {});

var ChatDebugSubagentStatus = /* @__PURE__ */ ((ChatDebugSubagentStatus2) => {
  ChatDebugSubagentStatus2[ChatDebugSubagentStatus2["Running"] = 0] = "Running";
  ChatDebugSubagentStatus2[ChatDebugSubagentStatus2["Completed"] = 1] = "Completed";
  ChatDebugSubagentStatus2[ChatDebugSubagentStatus2["Failed"] = 2] = "Failed";
  return ChatDebugSubagentStatus2;
})(ChatDebugSubagentStatus || {});

var ChatToolInvocationPart = class {
  constructor(toolName, toolCallId, errorMessage) {
    this.toolName = toolName;
    this.toolCallId = toolCallId;
    this.errorMessage = errorMessage;
  }
};

var ChatRequestTurn = class {
  constructor(prompt, command, references, participant, toolReferences, editedFileEvents, id2, modelId, modeInstructions2, openCodeBranchIntent) {
    this.prompt = prompt;
    this.command = command;
    this.references = references;
    this.participant = participant;
    this.toolReferences = toolReferences;
    this.editedFileEvents = editedFileEvents;
    this.id = id2;
    this.modelId = modelId;
    this.modeInstructions2 = modeInstructions2;
    this.openCodeBranchIntent = openCodeBranchIntent;
  }
};

var ChatResponseTurn = class {
  constructor(response, result, participant, command) {
    this.response = response;
    this.result = result;
    this.participant = participant;
    this.command = command;
  }
};

var ChatResponseTurn2 = class {
  constructor(response, result, participant, command) {
    this.response = response;
    this.result = result;
    this.participant = participant;
    this.command = command;
  }
};

var ChatLocation = /* @__PURE__ */ ((ChatLocation3) => {
  ChatLocation3[ChatLocation3["Panel"] = 1] = "Panel";
  ChatLocation3[ChatLocation3["Terminal"] = 2] = "Terminal";
  ChatLocation3[ChatLocation3["Notebook"] = 3] = "Notebook";
  ChatLocation3[ChatLocation3["Editor"] = 4] = "Editor";
  return ChatLocation3;
})(ChatLocation || {});

var ChatSessionStatus = /* @__PURE__ */ ((ChatSessionStatus3) => {
  ChatSessionStatus3[ChatSessionStatus3["Failed"] = 0] = "Failed";
  ChatSessionStatus3[ChatSessionStatus3["Completed"] = 1] = "Completed";
  ChatSessionStatus3[ChatSessionStatus3["InProgress"] = 2] = "InProgress";
  ChatSessionStatus3[ChatSessionStatus3["NeedsInput"] = 3] = "NeedsInput";
  return ChatSessionStatus3;
})(ChatSessionStatus || {});

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

var ChatDebugLogLevel = /* @__PURE__ */ ((ChatDebugLogLevel3) => {
  ChatDebugLogLevel3[ChatDebugLogLevel3["Trace"] = 0] = "Trace";
  ChatDebugLogLevel3[ChatDebugLogLevel3["Info"] = 1] = "Info";
  ChatDebugLogLevel3[ChatDebugLogLevel3["Warning"] = 2] = "Warning";
  ChatDebugLogLevel3[ChatDebugLogLevel3["Error"] = 3] = "Error";
  return ChatDebugLogLevel3;
})(ChatDebugLogLevel || {});

var ChatDebugToolCallResult = /* @__PURE__ */ ((ChatDebugToolCallResult2) => {
  ChatDebugToolCallResult2[ChatDebugToolCallResult2["Success"] = 0] = "Success";
  ChatDebugToolCallResult2[ChatDebugToolCallResult2["Error"] = 1] = "Error";
  return ChatDebugToolCallResult2;
})(ChatDebugToolCallResult || {});

var ChatDebugHookResult = /* @__PURE__ */ ((ChatDebugHookResult2) => {
  ChatDebugHookResult2[ChatDebugHookResult2["Success"] = 0] = "Success";
  ChatDebugHookResult2[ChatDebugHookResult2["Error"] = 1] = "Error";
  ChatDebugHookResult2[ChatDebugHookResult2["NonBlockingError"] = 2] = "NonBlockingError";
  return ChatDebugHookResult2;
})(ChatDebugHookResult || {});

var ChatDebugToolCallEvent = class {
  constructor(toolName, created) {
    this._kind = "toolCall";
    this.toolName = toolName;
    this.created = created;
  }
};

var ChatDebugModelTurnEvent = class {
  constructor(created) {
    this._kind = "modelTurn";
    this.created = created;
  }
};

var ChatDebugGenericEvent = class {
  constructor(name, level, created) {
    this._kind = "generic";
    this.name = name;
    this.level = level;
    this.created = created;
  }
};

var ChatDebugSubagentInvocationEvent = class {
  constructor(agentName, created) {
    this._kind = "subagentInvocation";
    this.agentName = agentName;
    this.created = created;
  }
};

var ChatDebugMessageSection = class {
  constructor(name, content) {
    this.name = name;
    this.content = content;
  }
};

var ChatDebugUserMessageEvent = class {
  constructor(message, created) {
    this._kind = "userMessage";
    this.message = message;
    this.created = created;
    this.sections = [];
  }
};

var ChatDebugAgentResponseEvent = class {
  constructor(message, created) {
    this._kind = "agentResponse";
    this.message = message;
    this.created = created;
    this.sections = [];
  }
};

var ChatDebugEventTextContent = class {
  constructor(value) {
    this._kind = "text";
    this.value = value;
  }
};

var ChatDebugMessageContentType = /* @__PURE__ */ ((ChatDebugMessageContentType2) => {
  ChatDebugMessageContentType2[ChatDebugMessageContentType2["User"] = 0] = "User";
  ChatDebugMessageContentType2[ChatDebugMessageContentType2["Agent"] = 1] = "Agent";
  return ChatDebugMessageContentType2;
})(ChatDebugMessageContentType || {});

var ChatDebugEventMessageContent = class {
  constructor(type, message, sections) {
    this._kind = "messageContent";
    this.type = type;
    this.message = message;
    this.sections = sections;
  }
};

var ChatDebugEventToolCallContent = class {
  constructor(toolName) {
    this._kind = "toolCallContent";
    this.toolName = toolName;
  }
};

var ChatDebugEventModelTurnContent = class {
  constructor(requestName) {
    this._kind = "modelTurnContent";
    this.requestName = requestName;
  }
};

var ChatDebugEventHookContent = class {
  constructor(hookType) {
    this._kind = "hookContent";
    this.hookType = hookType;
  }
};

var ChatSessionChangedFile = class {
  constructor(uri2, originalUri, modifiedUri, insertions, deletions) {
    this.uri = uri2;
    this.originalUri = originalUri;
    this.modifiedUri = modifiedUri;
    this.insertions = insertions;
    this.deletions = deletions;
  }
};

var ChatResponseReferencePartStatusKind = /* @__PURE__ */ ((ChatResponseReferencePartStatusKind2) => {
  ChatResponseReferencePartStatusKind2[ChatResponseReferencePartStatusKind2["Complete"] = 1] = "Complete";
  ChatResponseReferencePartStatusKind2[ChatResponseReferencePartStatusKind2["Partial"] = 2] = "Partial";
  ChatResponseReferencePartStatusKind2[ChatResponseReferencePartStatusKind2["Omitted"] = 3] = "Omitted";
  return ChatResponseReferencePartStatusKind2;
})(ChatResponseReferencePartStatusKind || {});

var ChatResponseClearToPreviousToolInvocationReason2 = /* @__PURE__ */ ((ChatResponseClearToPreviousToolInvocationReason3) => {
  ChatResponseClearToPreviousToolInvocationReason3[ChatResponseClearToPreviousToolInvocationReason3["NoReason"] = 0] = "NoReason";
  ChatResponseClearToPreviousToolInvocationReason3[ChatResponseClearToPreviousToolInvocationReason3["FilteredContentRetry"] = 1] = "FilteredContentRetry";
  ChatResponseClearToPreviousToolInvocationReason3[ChatResponseClearToPreviousToolInvocationReason3["CopyrightContentRetry"] = 2] = "CopyrightContentRetry";
  return ChatResponseClearToPreviousToolInvocationReason3;
})(ChatResponseClearToPreviousToolInvocationReason2 || {});

var ChatRequestEditorData = class {
  constructor(editor, document2, selection, wholeRange) {
    this.editor = editor;
    this.document = document2;
    this.selection = selection;
    this.wholeRange = wholeRange;
  }
};

var ChatRequestNotebookData = class {
  constructor(cell) {
    this.cell = cell;
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

var LanguageModelChatMessageRole = /* @__PURE__ */ ((LanguageModelChatMessageRole3) => {
  LanguageModelChatMessageRole3[LanguageModelChatMessageRole3["User"] = 1] = "User";
  LanguageModelChatMessageRole3[LanguageModelChatMessageRole3["Assistant"] = 2] = "Assistant";
  LanguageModelChatMessageRole3[LanguageModelChatMessageRole3["System"] = 3] = "System";
  return LanguageModelChatMessageRole3;
})(LanguageModelChatMessageRole || {});

var LanguageModelToolResultPart = class {
  constructor(callId, content, isError) {
    this.callId = callId;
    this.content = content;
    this.isError = isError ?? false;
  }
};

var ChatErrorLevel = /* @__PURE__ */ ((ChatErrorLevel2) => {
  ChatErrorLevel2[ChatErrorLevel2["Info"] = 0] = "Info";
  ChatErrorLevel2[ChatErrorLevel2["Warning"] = 1] = "Warning";
  ChatErrorLevel2[ChatErrorLevel2["Error"] = 2] = "Error";
  return ChatErrorLevel2;
})(ChatErrorLevel || {});

var ChatInputNotificationSeverity = /* @__PURE__ */ ((ChatInputNotificationSeverity2) => {
  ChatInputNotificationSeverity2[ChatInputNotificationSeverity2["Info"] = 0] = "Info";
  ChatInputNotificationSeverity2[ChatInputNotificationSeverity2["Warning"] = 1] = "Warning";
  ChatInputNotificationSeverity2[ChatInputNotificationSeverity2["Error"] = 2] = "Error";
  return ChatInputNotificationSeverity2;
})(ChatInputNotificationSeverity || {});

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
  set content(value) {
    if (typeof value === "string") {
      this._content = [new LanguageModelTextPart(value)];
    } else {
      this._content = value;
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
  set content(value) {
    if (typeof value === "string") {
      this._content = [new LanguageModelTextPart(value)];
    } else {
      this._content = value;
    }
  }
  get content() {
    return this._content;
  }
  // Temp to avoid breaking changes
  set content2(value) {
    if (value) {
      this.content = value.map((part) => {
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

var LanguageModelPartAudience = /* @__PURE__ */ ((LanguageModelPartAudience2) => {
  LanguageModelPartAudience2[LanguageModelPartAudience2["Assistant"] = 0] = "Assistant";
  LanguageModelPartAudience2[LanguageModelPartAudience2["User"] = 1] = "User";
  LanguageModelPartAudience2[LanguageModelPartAudience2["Extension"] = 2] = "Extension";
  return LanguageModelPartAudience2;
})(LanguageModelPartAudience || {});

var LanguageModelTextPart = class {
  constructor(value, audience) {
    this.value = value;
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
  static json(value, mime = "text/x-json") {
    const rawStr = JSON.stringify(value, void 0, "	");
    return new _LanguageModelDataPart(VSBuffer.fromString(rawStr).buffer, mime);
  }
  static text(value, mime = Mimes.text) {
    return new _LanguageModelDataPart(VSBuffer.fromString(value).buffer, mime);
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

var ChatImageMimeType = /* @__PURE__ */ ((ChatImageMimeType2) => {
  ChatImageMimeType2["PNG"] = "image/png";
  ChatImageMimeType2["JPEG"] = "image/jpeg";
  ChatImageMimeType2["GIF"] = "image/gif";
  ChatImageMimeType2["WEBP"] = "image/webp";
  ChatImageMimeType2["BMP"] = "image/bmp";
  return ChatImageMimeType2;
})(ChatImageMimeType || {});

var LanguageModelThinkingPart = class {
  constructor(value, id2, metadata) {
    this.value = value;
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
  constructor(value) {
    this.value = value;
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

var LanguageModelToolResult2 = class {
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

var ExtendedLanguageModelToolResult = class extends LanguageModelToolResult {
};

var LanguageModelChatToolMode = /* @__PURE__ */ ((LanguageModelChatToolMode2) => {
  LanguageModelChatToolMode2[LanguageModelChatToolMode2["Auto"] = 1] = "Auto";
  LanguageModelChatToolMode2[LanguageModelChatToolMode2["Required"] = 2] = "Required";
  return LanguageModelChatToolMode2;
})(LanguageModelChatToolMode || {});

var LanguageModelToolExtensionSource = class {
  constructor(id2, label) {
    this.id = id2;
    this.label = label;
  }
};

var LanguageModelToolMCPSource = class {
  constructor(label, name, instructions) {
    this.label = label;
    this.name = name;
    this.instructions = instructions;
  }
};

var RelatedInformationType = /* @__PURE__ */ ((RelatedInformationType2) => {
  RelatedInformationType2[RelatedInformationType2["SymbolInformation"] = 1] = "SymbolInformation";
  RelatedInformationType2[RelatedInformationType2["CommandInformation"] = 2] = "CommandInformation";
  RelatedInformationType2[RelatedInformationType2["SearchInformation"] = 3] = "SearchInformation";
  RelatedInformationType2[RelatedInformationType2["SettingInformation"] = 4] = "SettingInformation";
  return RelatedInformationType2;
})(RelatedInformationType || {});

var SettingsSearchResultKind = /* @__PURE__ */ ((SettingsSearchResultKind2) => {
  SettingsSearchResultKind2[SettingsSearchResultKind2["EMBEDDED"] = 1] = "EMBEDDED";
  SettingsSearchResultKind2[SettingsSearchResultKind2["LLM_RANKED"] = 2] = "LLM_RANKED";
  SettingsSearchResultKind2[SettingsSearchResultKind2["CANCELED"] = 3] = "CANCELED";
  return SettingsSearchResultKind2;
})(SettingsSearchResultKind || {});

var SpeechToTextStatus = /* @__PURE__ */ ((SpeechToTextStatus2) => {
  SpeechToTextStatus2[SpeechToTextStatus2["Started"] = 1] = "Started";
  SpeechToTextStatus2[SpeechToTextStatus2["Recognizing"] = 2] = "Recognizing";
  SpeechToTextStatus2[SpeechToTextStatus2["Recognized"] = 3] = "Recognized";
  SpeechToTextStatus2[SpeechToTextStatus2["Stopped"] = 4] = "Stopped";
  SpeechToTextStatus2[SpeechToTextStatus2["Error"] = 5] = "Error";
  return SpeechToTextStatus2;
})(SpeechToTextStatus || {});

var TextToSpeechStatus = /* @__PURE__ */ ((TextToSpeechStatus2) => {
  TextToSpeechStatus2[TextToSpeechStatus2["Started"] = 1] = "Started";
  TextToSpeechStatus2[TextToSpeechStatus2["Stopped"] = 2] = "Stopped";
  TextToSpeechStatus2[TextToSpeechStatus2["Error"] = 3] = "Error";
  return TextToSpeechStatus2;
})(TextToSpeechStatus || {});

var KeywordRecognitionStatus = /* @__PURE__ */ ((KeywordRecognitionStatus2) => {
  KeywordRecognitionStatus2[KeywordRecognitionStatus2["Recognized"] = 1] = "Recognized";
  KeywordRecognitionStatus2[KeywordRecognitionStatus2["Stopped"] = 2] = "Stopped";
  return KeywordRecognitionStatus2;
})(KeywordRecognitionStatus || {});

var McpToolAvailability = /* @__PURE__ */ ((McpToolAvailability2) => {
  McpToolAvailability2[McpToolAvailability2["Initial"] = 0] = "Initial";
  McpToolAvailability2[McpToolAvailability2["Dynamic"] = 1] = "Dynamic";
  return McpToolAvailability2;
})(McpToolAvailability || {});

var McpStdioServerDefinition = class {
  constructor(label, command, args2, env2 = {}, version, metadata) {
    this.label = label;
    this.command = command;
    this.args = args2;
    this.env = env2;
    this.version = version;
    this.metadata = metadata;
  }
};

var McpHttpServerDefinition = class {
  constructor(label, uri2, headers = {}, version, metadata, authentication) {
    this.label = label;
    this.uri = uri2;
    this.headers = headers;
    this.version = version;
    this.metadata = metadata;
    this.authentication = authentication;
  }
};
export { asStatusBarItemIdentifier, computeTaskExecutionId, setBreakpointId, isStrArrayOrUndefined, validateTestCoverageCount, TerminalOutputAnchor, _callOnDispose, Disposable3, validateConnectionToken, ResolvedAuthority, ManagedResolvedAuthority, RemoteAuthorityResolverError2, EnvironmentVariableMutatorType, Hover, VerboseHover, HoverVerbosityAction, DocumentHighlightKind, DocumentHighlight, MultiDocumentHighlight, DocumentSymbol, CodeActionTriggerKind, CodeAction, SelectionRange, CallHierarchyItem, CallHierarchyIncomingCall, CallHierarchyOutgoingCall, LanguageStatusSeverity, CodeLens, ParameterInformation, SignatureInformation, SignatureHelp, SignatureHelpTriggerKind, InlayHintKind, InlayHintLabelPart, InlayHint, CompletionTriggerKind, CompletionItemKind, CompletionItemTag, CompletionItem, CompletionList, InlineSuggestion, InlineSuggestionList, PartialAcceptTriggerKind, InlineCompletionEndOfLifeReasonKind, InlineCompletionDisplayLocationKind, ViewColumn, StatusBarAlignment, TextEditorLineNumbersStyle, TextDocumentSaveReason, TextEditorRevealType, TextEditorSelectionChangeKind, TextEditorChangeKind, TextDocumentChangeReason, DecorationRangeBehavior, SyntaxTokenType, DocumentLink, Color, ColorInformation, ColorPresentation, SourceControlInputBoxValidationType, TerminalExitReason, TerminalShellExecutionCommandLineConfidence, TerminalShellType, TerminalLink, TerminalQuickFixOpener, TerminalQuickFixCommand, TerminalLocation, TerminalProfile, TerminalCompletionItemKind, TerminalCompletionItem, TerminalCompletionList, TaskRevealKind, TaskEventKind, TaskPanelKind, TaskGroup, ProcessExecution, ShellExecution, ShellQuoting, TaskScope, TaskRunOn, CustomExecution, Task, ProgressLocation, ViewBadge, TreeItem, TreeItemCollapsibleState, TreeItemCheckboxState, DataTransferItem, InternalDataTransferItem, InternalFileDataTransferItem, DataTransferFile, _items, _DataTransfer_instances, normalizeMime_fn, DataTransfer, DocumentDropEdit, DocumentPasteTriggerKind, DocumentDropOrPasteEditKind, DocumentPasteEdit, ThemeIcon2, ThemeColor2, ConfigurationTarget2, RelativePattern, breakpointIds, Breakpoint, SourceBreakpoint, FunctionBreakpoint, DataBreakpoint, DebugAdapterExecutable, DebugAdapterServer, DebugAdapterNamedPipeServer, DebugAdapterInlineImplementation, DebugStackFrame, DebugThread, EvaluatableExpression, InlineCompletionTriggerKind, InlineCompletionsDisposeReasonKind, InlineValueText, InlineValueVariableLookup, InlineValueEvaluatableExpression, InlineValueContext, NewSymbolNameTag, NewSymbolNameTriggerKind, NewSymbolName, FileChangeType, FileSystemError, FoldingRange, FoldingRangeKind2, CommentThreadCollapsibleState, CommentMode, CommentState, CommentThreadState, CommentThreadApplicability, CommentThreadFocus, SemanticTokensLegend, SemanticTokensBuilder, SemanticTokens, SemanticTokensEdit, SemanticTokensEdits, DebugConsoleMode, DebugVisualization, QuickInputButtonLocation, QuickInputButtons, QuickPickItemKind, InputBoxValidationSeverity, ExtensionKind, FileDecoration, ColorTheme, ColorThemeKind, CellErrorStackFrame, NotebookCellExecutionState, NotebookCellStatusBarAlignment, NotebookEditorRevealType, NotebookCellStatusBarItem, NotebookControllerAffinity, NotebookControllerAffinity2, NotebookRendererScript, NotebookKernelSourceAction, NotebookVariablesRequestKind, TimelineItem, ExtensionMode, ExtensionRuntime, StandardTokenType, SyntaxHighlightingTokenFontStyle, LinkedEditingRanges, PortAttributes, TestResultState, TestRunProfileKind, TestRunProfileBase, TestRunRequest, TestMessage, TestTag, TestMessageStackFrame, TestCoverageCount, FileCoverage, StatementCoverage, BranchCoverage, DeclarationCoverage, ExternalUriOpenerPriority, WorkspaceTrustState, PortAutoForwardAction, TypeHierarchyItem, TextTabInput, TextDiffTabInput, TextMergeTabInput, CustomEditorTabInput, WebviewEditorTabInput, NotebookEditorTabInput, NotebookDiffEditorTabInput, TerminalEditorTabInput, InteractiveWindowInput, ChatEditorTabInput, TextMultiDiffTabInput, InteractiveSessionVoteDirection, ChatCopyKind, ChatVariableLevel, ChatCompletionItem, ChatEditingSessionActionOutcome, ChatRequestEditedFileEventKind, InteractiveEditorResponseFeedbackKind, ChatResultFeedbackKind, ChatResponseMarkdownPart, ChatResponseMarkdownWithVulnerabilitiesPart, ChatResponseConfirmationPart, ChatResponseFileTreePart, ChatResponseMultiDiffPart, McpToolInvocationContentData, ChatSubagentToolInvocationData, ChatResponseExternalEditPart, ChatResponseAnchorPart, ChatResponseProgressPart, ChatResponseProgressPart2, ChatResponseThinkingProgressPart, ChatResponseHookPart, ChatResponseVoiceProgressPart, ChatResponseAutoModeResolutionPart, ChatResponseWarningPart, ChatResponseInfoPart, ChatResponseCommandButtonPart, ChatResponseReferencePart, ChatResponseCodeblockUriPart, ChatResponseCodeCitationPart, ChatResponseMovePart, ChatResponseExtensionsPart, ChatResponsePullRequestPart, ChatQuestionType, ChatQuestion, ChatResponseQuestionCarouselPart, ChatResponseTextEditPart, ChatResponseNotebookEditPart, ChatResponseWorkspaceEditPart, ChatTodoStatus, ChatDebugSubagentStatus, ChatToolInvocationPart, ChatRequestTurn, ChatResponseTurn, ChatResponseTurn2, ChatLocation, ChatSessionStatus, ChatSessionCustomizationType, ChatDebugLogLevel, ChatDebugToolCallResult, ChatDebugHookResult, ChatDebugToolCallEvent, ChatDebugModelTurnEvent, ChatDebugGenericEvent, ChatDebugSubagentInvocationEvent, ChatDebugMessageSection, ChatDebugUserMessageEvent, ChatDebugAgentResponseEvent, ChatDebugEventTextContent, ChatDebugMessageContentType, ChatDebugEventMessageContent, ChatDebugEventToolCallContent, ChatDebugEventModelTurnContent, ChatDebugEventHookContent, ChatSessionChangedFile, ChatResponseReferencePartStatusKind, ChatResponseClearToPreviousToolInvocationReason2, ChatRequestEditorData, ChatRequestNotebookData, ChatReferenceBinaryData, ChatReferenceDiagnostic, LanguageModelChatMessageRole, LanguageModelToolResultPart, ChatErrorLevel, ChatInputNotificationSeverity, LanguageModelChatMessage, LanguageModelChatMessage2, LanguageModelToolCallPart, LanguageModelPartAudience, LanguageModelTextPart, LanguageModelDataPart, ChatImageMimeType, LanguageModelThinkingPart, LanguageModelPromptTsxPart, LanguageModelError, LanguageModelToolResult, LanguageModelToolResult2, ExtendedLanguageModelToolResult, LanguageModelChatToolMode, LanguageModelToolExtensionSource, LanguageModelToolMCPSource, RelatedInformationType, SettingsSearchResultKind, SpeechToTextStatus, TextToSpeechStatus, KeywordRecognitionStatus, McpToolAvailability, McpStdioServerDefinition, McpHttpServerDefinition };
