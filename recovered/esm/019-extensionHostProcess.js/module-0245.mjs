// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/node/extensionHostProcess.js
// Original module marker: src/vs/workbench/api/common/extHostTypeConverters.ts
import { Position2 } from "./module-0232.mjs";
import { Selection } from "./module-0238.mjs";
import { Range2 } from "./module-0233.mjs";
import { Location2 } from "./module-0236.mjs";
import { URI, isUriComponents } from "./module-0025.mjs";
import { asArray, coalesce, isNonEmptyArray } from "./module-0006.mjs";
import { isDefined, isEmptyObject, isNumber, isString, isUndefinedOrNull } from "./module-0009.mjs";
import { Diagnostic, DiagnosticRelatedInformation } from "./module-0235.mjs";
import { ACTIVE_GROUP, SIDE_GROUP } from "./module-0226.mjs";
import { MarkdownString2 } from "./module-0231.mjs";
import { marked } from "./module-0087.mjs";
import { isMarkdownString, parseHrefAndDimensions } from "./module-0086.mjs";
import { parse2, revive } from "./module-0036.mjs";
import { cloneAndChange } from "./module-0042.mjs";
import { TextEdit } from "./module-0242.mjs";
import { WorkspaceEdit } from "./module-0243.mjs";
import { ResourceMap, ResourceSet } from "./module-0007.mjs";
import { VSBuffer, decodeBase64, encodeBase64 } from "./module-0031.mjs";
import { SnippetTextEdit } from "./module-0240.mjs";
import { SnippetString } from "./module-0239.mjs";
import { SymbolInformation } from "./module-0241.mjs";
import { BranchCoverage, CallHierarchyIncomingCall, CallHierarchyItem, CallHierarchyOutgoingCall, ChatQuestion, ChatReferenceBinaryData, ChatReferenceDiagnostic, ChatResponseAnchorPart, ChatResponseAutoModeResolutionPart, ChatResponseCodeCitationPart, ChatResponseCodeblockUriPart, ChatResponseCommandButtonPart, ChatResponseConfirmationPart, ChatResponseExtensionsPart, ChatResponseFileTreePart, ChatResponseHookPart, ChatResponseInfoPart, ChatResponseMarkdownPart, ChatResponseMarkdownWithVulnerabilitiesPart, ChatResponseMovePart, ChatResponseMultiDiffPart, ChatResponseNotebookEditPart, ChatResponseProgressPart, ChatResponsePullRequestPart, ChatResponseQuestionCarouselPart, ChatResponseReferencePart, ChatResponseTextEditPart, ChatResponseThinkingProgressPart, ChatResponseVoiceProgressPart, ChatResponseWarningPart, ChatResponseWorkspaceEditPart, ChatSessionCustomizationType, ChatSubagentToolInvocationData, ChatToolInvocationPart, Color, ColorPresentation, CompletionItem, DataTransfer, DataTransferFile, DeclarationCoverage, DocumentHighlight, DocumentLink, DocumentSymbol, EvaluatableExpression, FileCoverage, InlayHint, InlayHintLabelPart, InlineValueContext, InlineValueEvaluatableExpression, InlineValueText, InlineValueVariableLookup, InternalDataTransferItem, InternalFileDataTransferItem, LanguageModelChatMessage, LanguageModelChatMessage2, LanguageModelDataPart, LanguageModelPromptTsxPart, LanguageModelTextPart, LanguageModelThinkingPart, LanguageModelToolCallPart, LanguageModelToolExtensionSource, LanguageModelToolMCPSource, LanguageModelToolResult, LanguageModelToolResultPart, McpHttpServerDefinition, McpStdioServerDefinition, MultiDocumentHighlight, NotebookRendererScript, RelativePattern, SelectionRange, StatementCoverage, TestMessage, TestTag, TypeHierarchyItem, VerboseHover, validateTestCoverageCount } from "./module-0244.mjs";
import { Range } from "./module-0091.mjs";
import { Command, FoldingRangeKind } from "./module-0093.mjs";
import { DEFAULT_EDITOR_ASSOCIATION } from "./module-0099.mjs";
import { NotebookCellData, NotebookCellOutput, NotebookCellOutputItem, NotebookData, NotebookRange } from "./module-0237.mjs";
import { denamespaceTestTag, namespaceTestTag } from "./module-0223.mjs";
import { getPrivateApiFor } from "./module-0228.mjs";
import { TestId } from "./module-0222.mjs";
import { WellDefinedPrefixTree } from "./module-0089.mjs";
import { createSingleCallFunction } from "./module-0004.mjs";
import { Mimes } from "./module-0088.mjs";
import { generateUuid } from "./module-0040.mjs";
import { UriList } from "./module-0078.mjs";
import { basename2 } from "./module-0027.mjs";
import { ToolDataSource } from "./module-0191.mjs";
import { ThemeIcon } from "./module-0084.mjs";
import { LocalChatSessionUri } from "./module-0102.mjs";
import { checkProposedApiEnabled, isProposedApiEnabled } from "./module-0173.mjs";
import { isElementVariableEntry, isImageVariableEntry, isPromptFileVariableEntry, isPromptTextVariableEntry } from "./module-0103.mjs";
import { coerceImageBuffer } from "./module-0197.mjs";
import { SerializableObjectWithBuffers } from "./module-0053.mjs";
import { McpServerLaunch } from "./module-0220.mjs";
import { resolveEffectiveCommand } from "./module-0204.mjs";
import { OS } from "./module-0014.mjs";


// src/vs/workbench/api/common/extHostTypeConverters.ts
var Selection2;

((Selection4) => {
  function to(selection) {
    const { selectionStartLineNumber, selectionStartColumn, positionLineNumber, positionColumn } = selection;
    const start = new Position2(selectionStartLineNumber - 1, selectionStartColumn - 1);
    const end = new Position2(positionLineNumber - 1, positionColumn - 1);
    return new Selection(start, end);
  }
  Selection4.to = to;
  function from(selection) {
    const { anchor, active } = selection;
    return {
      selectionStartLineNumber: anchor.line + 1,
      selectionStartColumn: anchor.character + 1,
      positionLineNumber: active.line + 1,
      positionColumn: active.character + 1
    };
  }
  Selection4.from = from;
})(Selection2 || (Selection2 = {}));

var Range3;

((Range7) => {
  function from(range) {
    if (!range) {
      return void 0;
    }
    const { start, end } = range;
    return {
      startLineNumber: start.line + 1,
      startColumn: start.character + 1,
      endLineNumber: end.line + 1,
      endColumn: end.character + 1
    };
  }
  Range7.from = from;
  function to(range) {
    if (!range) {
      return void 0;
    }
    const { startLineNumber, startColumn, endLineNumber, endColumn } = range;
    return new Range2(startLineNumber - 1, startColumn - 1, endLineNumber - 1, endColumn - 1);
  }
  Range7.to = to;
})(Range3 || (Range3 = {}));

var Location3;

((Location4) => {
  function from(location2) {
    return {
      uri: location2.uri,
      range: Range3.from(location2.range)
    };
  }
  Location4.from = from;
  function to(location2) {
    return new Location2(URI.revive(location2.uri), Range3.to(location2.range));
  }
  Location4.to = to;
})(Location3 || (Location3 = {}));

var TokenType2;

((TokenType3) => {
  function to(type) {
    switch (type) {
      case 1 /* Comment */:
        return 1 /* Comment */;
      case 0 /* Other */:
        return 0 /* Other */;
      case 3 /* RegEx */:
        return 3 /* RegEx */;
      case 2 /* String */:
        return 2 /* String */;
    }
  }
  TokenType3.to = to;
})(TokenType2 || (TokenType2 = {}));

var Position3;

((Position6) => {
  function to(position) {
    return new Position2(position.lineNumber - 1, position.column - 1);
  }
  Position6.to = to;
  function from(position) {
    return { lineNumber: position.line + 1, column: position.character + 1 };
  }
  Position6.from = from;
})(Position3 || (Position3 = {}));

var DocumentSelector;

((DocumentSelector2) => {
  function from(value, uriTransformer, extension) {
    return coalesce(asArray(value).map((sel) => _doTransformDocumentSelector(sel, uriTransformer, extension)));
  }
  DocumentSelector2.from = from;
  function _doTransformDocumentSelector(selector, uriTransformer, extension) {
    if (typeof selector === "string") {
      return {
        $serialized: true,
        language: selector,
        isBuiltin: extension?.isBuiltin
      };
    }
    if (selector) {
      return {
        $serialized: true,
        language: selector.language,
        scheme: _transformScheme(selector.scheme, uriTransformer),
        pattern: GlobPattern.from(selector.pattern) ?? void 0,
        exclusive: selector.exclusive,
        notebookType: selector.notebookType,
        isBuiltin: extension?.isBuiltin
      };
    }
    return void 0;
  }
  function _transformScheme(scheme, uriTransformer) {
    if (uriTransformer && typeof scheme === "string") {
      return uriTransformer.transformOutgoingScheme(scheme);
    }
    return scheme;
  }
})(DocumentSelector || (DocumentSelector = {}));

var TabSelector;

((TabSelector2) => {
  function isViewTypeSelector(value) {
    return value.viewType !== void 0;
  }
  function from(value, uriTransformer, extension) {
    if (isViewTypeSelector(value)) {
      return { viewType: value.viewType };
    }
    return { uri: DocumentSelector.from(value.uri, uriTransformer, extension) };
  }
  TabSelector2.from = from;
})(TabSelector || (TabSelector = {}));

var DiagnosticTag2;

((DiagnosticTag3) => {
  function from(value) {
    switch (value) {
      case 1 /* Unnecessary */:
        return 1 /* Unnecessary */;
      case 2 /* Deprecated */:
        return 2 /* Deprecated */;
    }
    return void 0;
  }
  DiagnosticTag3.from = from;
  function to(value) {
    switch (value) {
      case 1 /* Unnecessary */:
        return 1 /* Unnecessary */;
      case 2 /* Deprecated */:
        return 2 /* Deprecated */;
      default:
        return void 0;
    }
  }
  DiagnosticTag3.to = to;
})(DiagnosticTag2 || (DiagnosticTag2 = {}));

var Diagnostic2;

((Diagnostic3) => {
  function from(value) {
    let code;
    if (value.code) {
      if (isString(value.code) || isNumber(value.code)) {
        code = String(value.code);
      } else {
        code = {
          value: String(value.code.value),
          target: value.code.target
        };
      }
    }
    return {
      ...Range3.from(value.range),
      message: value.message,
      source: value.source,
      code,
      severity: DiagnosticSeverity2.from(value.severity),
      relatedInformation: value.relatedInformation && value.relatedInformation.map(DiagnosticRelatedInformation2.from),
      tags: Array.isArray(value.tags) ? coalesce(value.tags.map(DiagnosticTag2.from)) : void 0
    };
  }
  Diagnostic3.from = from;
  function to(value) {
    const res = new Diagnostic(Range3.to(value), value.message, DiagnosticSeverity2.to(value.severity));
    res.source = value.source;
    res.code = isString(value.code) ? value.code : value.code?.value;
    res.relatedInformation = value.relatedInformation && value.relatedInformation.map(DiagnosticRelatedInformation2.to);
    res.tags = value.tags && coalesce(value.tags.map(DiagnosticTag2.to));
    return res;
  }
  Diagnostic3.to = to;
})(Diagnostic2 || (Diagnostic2 = {}));

var DiagnosticRelatedInformation2;

((DiagnosticRelatedInformation3) => {
  function from(value) {
    return {
      ...Range3.from(value.location.range),
      message: value.message,
      resource: value.location.uri
    };
  }
  DiagnosticRelatedInformation3.from = from;
  function to(value) {
    return new DiagnosticRelatedInformation(new Location2(value.resource, Range3.to(value)), value.message);
  }
  DiagnosticRelatedInformation3.to = to;
})(DiagnosticRelatedInformation2 || (DiagnosticRelatedInformation2 = {}));

var DiagnosticSeverity2;

((DiagnosticSeverity3) => {
  function from(value) {
    switch (value) {
      case 0 /* Error */:
        return 8 /* Error */;
      case 1 /* Warning */:
        return 4 /* Warning */;
      case 2 /* Information */:
        return 2 /* Info */;
      case 3 /* Hint */:
        return 1 /* Hint */;
    }
    return 8 /* Error */;
  }
  DiagnosticSeverity3.from = from;
  function to(value) {
    switch (value) {
      case 2 /* Info */:
        return 2 /* Information */;
      case 4 /* Warning */:
        return 1 /* Warning */;
      case 8 /* Error */:
        return 0 /* Error */;
      case 1 /* Hint */:
        return 3 /* Hint */;
      default:
        return 0 /* Error */;
    }
  }
  DiagnosticSeverity3.to = to;
})(DiagnosticSeverity2 || (DiagnosticSeverity2 = {}));

var ViewColumn2;

((ViewColumn3) => {
  function from(column) {
    if (typeof column === "number" && column >= 1 /* One */) {
      return column - 1;
    }
    if (column === -2 /* Beside */) {
      return SIDE_GROUP;
    }
    return ACTIVE_GROUP;
  }
  ViewColumn3.from = from;
  function to(position) {
    if (typeof position === "number" && position >= 0) {
      return position + 1;
    }
    throw new Error(`invalid 'EditorGroupColumn'`);
  }
  ViewColumn3.to = to;
})(ViewColumn2 || (ViewColumn2 = {}));

function isDecorationOptions(something) {
  return typeof something.range !== "undefined";
}

function isDecorationOptionsArr(something) {
  if (something.length === 0) {
    return true;
  }
  return isDecorationOptions(something[0]) ? true : false;
}

var MarkdownString3;

((MarkdownString4) => {
  function fromMany(markup) {
    return markup.map(MarkdownString4.from);
  }
  MarkdownString4.fromMany = fromMany;
  function isCodeblock(thing) {
    return thing && typeof thing === "object" && typeof thing.language === "string" && typeof thing.value === "string";
  }
  function from(markup) {
    let res;
    if (isCodeblock(markup)) {
      const { language: language2, value } = markup;
      res = { value: "```" + language2 + "\n" + value + "\n```\n" };
    } else if (MarkdownString2.isMarkdownString(markup)) {
      res = { value: markup.value, isTrusted: markup.isTrusted, supportThemeIcons: markup.supportThemeIcons, supportHtml: markup.supportHtml, supportAlertSyntax: markup.supportAlertSyntax, baseUri: markup.baseUri };
    } else if (typeof markup === "string") {
      res = { value: markup };
    } else {
      res = { value: "" };
    }
    const resUris = /* @__PURE__ */ Object.create(null);
    res.uris = resUris;
    const collectUri = ({ href }) => {
      try {
        let uri2 = URI.parse(href, true);
        uri2 = uri2.with({ query: _uriMassage(uri2.query, resUris) });
        resUris[href] = uri2;
      } catch (e) {
      }
      return "";
    };
    marked.walkTokens(marked.lexer(res.value), (token) => {
      if (token.type === "link") {
        collectUri({ href: token.href });
      } else if (token.type === "image") {
        if (typeof token.href === "string") {
          collectUri(parseHrefAndDimensions(token.href));
        }
      }
    });
    return res;
  }
  MarkdownString4.from = from;
  function _uriMassage(part, bucket) {
    if (!part) {
      return part;
    }
    let data;
    try {
      data = parse2(part);
    } catch (e) {
    }
    if (!data) {
      return part;
    }
    let changed = false;
    data = cloneAndChange(data, (value) => {
      if (URI.isUri(value)) {
        const key = `__uri_${Math.random().toString(16).slice(2, 8)}`;
        bucket[key] = value;
        changed = true;
        return key;
      } else {
        return void 0;
      }
    });
    if (!changed) {
      return part;
    }
    return JSON.stringify(data);
  }
  function to(value) {
    const result = new MarkdownString2(value.value, value.supportThemeIcons);
    result.isTrusted = value.isTrusted;
    result.supportHtml = value.supportHtml;
    result.supportAlertSyntax = value.supportAlertSyntax;
    result.baseUri = value.baseUri ? URI.from(value.baseUri) : void 0;
    return result;
  }
  MarkdownString4.to = to;
  function fromStrict(value) {
    if (!value) {
      return void 0;
    }
    return typeof value === "string" ? value : MarkdownString4.from(value);
  }
  MarkdownString4.fromStrict = fromStrict;
})(MarkdownString3 || (MarkdownString3 = {}));

function fromRangeOrRangeWithMessage(ranges) {
  if (isDecorationOptionsArr(ranges)) {
    return ranges.map((r2) => {
      return {
        range: Range3.from(r2.range),
        hoverMessage: Array.isArray(r2.hoverMessage) ? MarkdownString3.fromMany(r2.hoverMessage) : r2.hoverMessage ? MarkdownString3.from(r2.hoverMessage) : void 0,
        // eslint-disable-next-line local/code-no-any-casts
        renderOptions: (
          /* URI vs Uri */
          r2.renderOptions
        )
      };
    });
  } else {
    return ranges.map((r2) => {
      return {
        range: Range3.from(r2)
      };
    });
  }
}

function pathOrURIToURI(value) {
  if (typeof value === "undefined") {
    return value;
  }
  if (typeof value === "string") {
    return URI.file(value);
  } else {
    return value;
  }
}

var ThemableDecorationAttachmentRenderOptions;

((ThemableDecorationAttachmentRenderOptions2) => {
  function from(options2) {
    if (typeof options2 === "undefined") {
      return options2;
    }
    return {
      contentText: options2.contentText,
      contentIconPath: options2.contentIconPath ? pathOrURIToURI(options2.contentIconPath) : void 0,
      border: options2.border,
      borderColor: options2.borderColor,
      fontStyle: options2.fontStyle,
      fontWeight: options2.fontWeight,
      textDecoration: options2.textDecoration,
      color: options2.color,
      backgroundColor: options2.backgroundColor,
      margin: options2.margin,
      width: options2.width,
      height: options2.height
    };
  }
  ThemableDecorationAttachmentRenderOptions2.from = from;
})(ThemableDecorationAttachmentRenderOptions || (ThemableDecorationAttachmentRenderOptions = {}));

var ThemableDecorationRenderOptions;

((ThemableDecorationRenderOptions2) => {
  function from(options2) {
    if (typeof options2 === "undefined") {
      return options2;
    }
    return {
      backgroundColor: options2.backgroundColor,
      outline: options2.outline,
      outlineColor: options2.outlineColor,
      outlineStyle: options2.outlineStyle,
      outlineWidth: options2.outlineWidth,
      border: options2.border,
      borderColor: options2.borderColor,
      borderRadius: options2.borderRadius,
      borderSpacing: options2.borderSpacing,
      borderStyle: options2.borderStyle,
      borderWidth: options2.borderWidth,
      fontStyle: options2.fontStyle,
      fontWeight: options2.fontWeight,
      textDecoration: options2.textDecoration,
      cursor: options2.cursor,
      color: options2.color,
      opacity: options2.opacity,
      letterSpacing: options2.letterSpacing,
      gutterIconPath: options2.gutterIconPath ? pathOrURIToURI(options2.gutterIconPath) : void 0,
      gutterIconSize: options2.gutterIconSize,
      overviewRulerColor: options2.overviewRulerColor,
      before: options2.before ? ThemableDecorationAttachmentRenderOptions.from(options2.before) : void 0,
      after: options2.after ? ThemableDecorationAttachmentRenderOptions.from(options2.after) : void 0
    };
  }
  ThemableDecorationRenderOptions2.from = from;
})(ThemableDecorationRenderOptions || (ThemableDecorationRenderOptions = {}));

var DecorationRangeBehavior2;

((DecorationRangeBehavior3) => {
  function from(value) {
    if (typeof value === "undefined") {
      return value;
    }
    switch (value) {
      case 0 /* OpenOpen */:
        return 0 /* AlwaysGrowsWhenTypingAtEdges */;
      case 1 /* ClosedClosed */:
        return 1 /* NeverGrowsWhenTypingAtEdges */;
      case 2 /* OpenClosed */:
        return 2 /* GrowsOnlyWhenTypingBefore */;
      case 3 /* ClosedOpen */:
        return 3 /* GrowsOnlyWhenTypingAfter */;
    }
  }
  DecorationRangeBehavior3.from = from;
})(DecorationRangeBehavior2 || (DecorationRangeBehavior2 = {}));

var DecorationRenderOptions;

((DecorationRenderOptions2) => {
  function from(options2) {
    return {
      isWholeLine: options2.isWholeLine,
      rangeBehavior: options2.rangeBehavior ? DecorationRangeBehavior2.from(options2.rangeBehavior) : void 0,
      overviewRulerLane: options2.overviewRulerLane,
      light: options2.light ? ThemableDecorationRenderOptions.from(options2.light) : void 0,
      dark: options2.dark ? ThemableDecorationRenderOptions.from(options2.dark) : void 0,
      backgroundColor: options2.backgroundColor,
      outline: options2.outline,
      outlineColor: options2.outlineColor,
      outlineStyle: options2.outlineStyle,
      outlineWidth: options2.outlineWidth,
      border: options2.border,
      borderColor: options2.borderColor,
      borderRadius: options2.borderRadius,
      borderSpacing: options2.borderSpacing,
      borderStyle: options2.borderStyle,
      borderWidth: options2.borderWidth,
      fontStyle: options2.fontStyle,
      fontWeight: options2.fontWeight,
      textDecoration: options2.textDecoration,
      cursor: options2.cursor,
      color: options2.color,
      opacity: options2.opacity,
      letterSpacing: options2.letterSpacing,
      gutterIconPath: options2.gutterIconPath ? pathOrURIToURI(options2.gutterIconPath) : void 0,
      gutterIconSize: options2.gutterIconSize,
      overviewRulerColor: options2.overviewRulerColor,
      before: options2.before ? ThemableDecorationAttachmentRenderOptions.from(options2.before) : void 0,
      after: options2.after ? ThemableDecorationAttachmentRenderOptions.from(options2.after) : void 0
    };
  }
  DecorationRenderOptions2.from = from;
})(DecorationRenderOptions || (DecorationRenderOptions = {}));

var TextEdit2;

((TextEdit3) => {
  function from(edit2) {
    return {
      text: edit2.newText,
      eol: edit2.newEol && EndOfLine2.from(edit2.newEol),
      range: Range3.from(edit2.range)
    };
  }
  TextEdit3.from = from;
  function to(edit2) {
    const result = new TextEdit(Range3.to(edit2.range), edit2.text);
    result.newEol = typeof edit2.eol === "undefined" ? void 0 : EndOfLine2.to(edit2.eol);
    return result;
  }
  TextEdit3.to = to;
})(TextEdit2 || (TextEdit2 = {}));

var WorkspaceEdit2;

((WorkspaceEdit3) => {
  function from(value, versionInfo) {
    const result = {
      edits: []
    };
    if (value instanceof WorkspaceEdit) {
      const toCreate = new ResourceSet();
      for (const entry of value._allEntries()) {
        if (entry._type === 1 /* File */ && URI.isUri(entry.to) && entry.from === void 0) {
          toCreate.add(entry.to);
        }
      }
      for (const entry of value._allEntries()) {
        if (entry._type === 1 /* File */) {
          let contents;
          if (entry.options?.contents) {
            if (ArrayBuffer.isView(entry.options.contents)) {
              contents = { type: "base64", value: encodeBase64(VSBuffer.wrap(entry.options.contents)) };
            } else {
              contents = { type: "dataTransferItem", id: entry.options.contents._itemId };
            }
          }
          result.edits.push({
            oldResource: entry.from,
            newResource: entry.to,
            options: { ...entry.options, contents },
            metadata: entry.metadata
          });
        } else if (entry._type === 2 /* Text */) {
          result.edits.push({
            resource: entry.uri,
            textEdit: TextEdit2.from(entry.edit),
            versionId: !toCreate.has(entry.uri) ? versionInfo?.getTextDocumentVersion(entry.uri) : void 0,
            metadata: entry.metadata
          });
        } else if (entry._type === 6 /* Snippet */) {
          result.edits.push({
            resource: entry.uri,
            textEdit: {
              range: Range3.from(entry.range),
              text: entry.edit.value,
              insertAsSnippet: true,
              keepWhitespace: entry.keepWhitespace
            },
            versionId: !toCreate.has(entry.uri) ? versionInfo?.getTextDocumentVersion(entry.uri) : void 0,
            metadata: entry.metadata
          });
        } else if (entry._type === 3 /* Cell */) {
          result.edits.push({
            metadata: entry.metadata,
            resource: entry.uri,
            cellEdit: entry.edit,
            notebookVersionId: versionInfo?.getNotebookDocumentVersion(entry.uri)
          });
        } else if (entry._type === 5 /* CellReplace */) {
          result.edits.push({
            metadata: entry.metadata,
            resource: entry.uri,
            notebookVersionId: versionInfo?.getNotebookDocumentVersion(entry.uri),
            cellEdit: {
              editType: 1 /* Replace */,
              index: entry.index,
              count: entry.count,
              cells: entry.cells.map(NotebookCellData2.from)
            }
          });
        }
      }
    }
    return result;
  }
  WorkspaceEdit3.from = from;
  function to(value) {
    const result = new WorkspaceEdit();
    const edits = new ResourceMap();
    for (const edit2 of value.edits) {
      if (edit2.textEdit) {
        const item = edit2;
        const uri2 = URI.revive(item.resource);
        const range = Range3.to(item.textEdit.range);
        const text = item.textEdit.text;
        const isSnippet = item.textEdit.insertAsSnippet;
        let editOrSnippetTest;
        if (isSnippet) {
          editOrSnippetTest = SnippetTextEdit.replace(range, new SnippetString(text));
        } else {
          editOrSnippetTest = TextEdit.replace(range, text);
        }
        const array = edits.get(uri2);
        if (!array) {
          edits.set(uri2, [editOrSnippetTest]);
        } else {
          array.push(editOrSnippetTest);
        }
      } else {
        result.renameFile(
          URI.revive(edit2.oldResource),
          URI.revive(edit2.newResource),
          edit2.options
        );
      }
    }
    for (const [uri2, array] of edits) {
      result.set(uri2, array);
    }
    return result;
  }
  WorkspaceEdit3.to = to;
})(WorkspaceEdit2 || (WorkspaceEdit2 = {}));

var SymbolKind4;

((SymbolKind5) => {
  const _fromMapping = /* @__PURE__ */ Object.create(null);
  _fromMapping[0 /* File */] = 0 /* File */;
  _fromMapping[1 /* Module */] = 1 /* Module */;
  _fromMapping[2 /* Namespace */] = 2 /* Namespace */;
  _fromMapping[3 /* Package */] = 3 /* Package */;
  _fromMapping[4 /* Class */] = 4 /* Class */;
  _fromMapping[5 /* Method */] = 5 /* Method */;
  _fromMapping[6 /* Property */] = 6 /* Property */;
  _fromMapping[7 /* Field */] = 7 /* Field */;
  _fromMapping[8 /* Constructor */] = 8 /* Constructor */;
  _fromMapping[9 /* Enum */] = 9 /* Enum */;
  _fromMapping[10 /* Interface */] = 10 /* Interface */;
  _fromMapping[11 /* Function */] = 11 /* Function */;
  _fromMapping[12 /* Variable */] = 12 /* Variable */;
  _fromMapping[13 /* Constant */] = 13 /* Constant */;
  _fromMapping[14 /* String */] = 14 /* String */;
  _fromMapping[15 /* Number */] = 15 /* Number */;
  _fromMapping[16 /* Boolean */] = 16 /* Boolean */;
  _fromMapping[17 /* Array */] = 17 /* Array */;
  _fromMapping[18 /* Object */] = 18 /* Object */;
  _fromMapping[19 /* Key */] = 19 /* Key */;
  _fromMapping[20 /* Null */] = 20 /* Null */;
  _fromMapping[21 /* EnumMember */] = 21 /* EnumMember */;
  _fromMapping[22 /* Struct */] = 22 /* Struct */;
  _fromMapping[23 /* Event */] = 23 /* Event */;
  _fromMapping[24 /* Operator */] = 24 /* Operator */;
  _fromMapping[25 /* TypeParameter */] = 25 /* TypeParameter */;
  function from(kind) {
    return typeof _fromMapping[kind] === "number" ? _fromMapping[kind] : 6 /* Property */;
  }
  SymbolKind5.from = from;
  function to(kind) {
    for (const k in _fromMapping) {
      if (_fromMapping[k] === kind) {
        return Number(k);
      }
    }
    return 6 /* Property */;
  }
  SymbolKind5.to = to;
})(SymbolKind4 || (SymbolKind4 = {}));

var SymbolTag3;

((SymbolTag4) => {
  function from(kind) {
    switch (kind) {
      case 1 /* Deprecated */:
        return 1 /* Deprecated */;
    }
  }
  SymbolTag4.from = from;
  function to(kind) {
    switch (kind) {
      case 1 /* Deprecated */:
        return 1 /* Deprecated */;
    }
  }
  SymbolTag4.to = to;
})(SymbolTag3 || (SymbolTag3 = {}));

var WorkspaceSymbol;

((WorkspaceSymbol2) => {
  function from(info) {
    return {
      name: info.name,
      kind: SymbolKind4.from(info.kind),
      tags: info.tags && info.tags.map(SymbolTag3.from),
      containerName: info.containerName,
      location: location.from(info.location)
    };
  }
  WorkspaceSymbol2.from = from;
  function to(info) {
    const result = new SymbolInformation(
      info.name,
      SymbolKind4.to(info.kind),
      info.containerName,
      location.to(info.location)
    );
    result.tags = info.tags && info.tags.map(SymbolTag3.to);
    return result;
  }
  WorkspaceSymbol2.to = to;
})(WorkspaceSymbol || (WorkspaceSymbol = {}));

var DocumentSymbol2;

((DocumentSymbol3) => {
  function from(info) {
    const result = {
      name: info.name || "!!MISSING: name!!",
      detail: info.detail,
      range: Range3.from(info.range),
      selectionRange: Range3.from(info.selectionRange),
      kind: SymbolKind4.from(info.kind),
      tags: info.tags?.map(SymbolTag3.from) ?? []
    };
    if (info.children) {
      result.children = info.children.map(from);
    }
    return result;
  }
  DocumentSymbol3.from = from;
  function to(info) {
    const result = new DocumentSymbol(
      info.name,
      info.detail,
      SymbolKind4.to(info.kind),
      Range3.to(info.range),
      Range3.to(info.selectionRange)
    );
    if (isNonEmptyArray(info.tags)) {
      result.tags = info.tags.map(SymbolTag3.to);
    }
    if (info.children) {
      result.children = info.children.map(to);
    }
    return result;
  }
  DocumentSymbol3.to = to;
})(DocumentSymbol2 || (DocumentSymbol2 = {}));

var CallHierarchyItem2;

((CallHierarchyItem3) => {
  function to(item) {
    const result = new CallHierarchyItem(
      SymbolKind4.to(item.kind),
      item.name,
      item.detail || "",
      URI.revive(item.uri),
      Range3.to(item.range),
      Range3.to(item.selectionRange)
    );
    result._sessionId = item._sessionId;
    result._itemId = item._itemId;
    return result;
  }
  CallHierarchyItem3.to = to;
  function from(item, sessionId, itemId) {
    sessionId = sessionId ?? item._sessionId;
    itemId = itemId ?? item._itemId;
    if (sessionId === void 0 || itemId === void 0) {
      throw new Error("invalid item");
    }
    return {
      _sessionId: sessionId,
      _itemId: itemId,
      name: item.name,
      detail: item.detail,
      kind: SymbolKind4.from(item.kind),
      uri: item.uri,
      range: Range3.from(item.range),
      selectionRange: Range3.from(item.selectionRange),
      tags: item.tags?.map(SymbolTag3.from)
    };
  }
  CallHierarchyItem3.from = from;
})(CallHierarchyItem2 || (CallHierarchyItem2 = {}));

var CallHierarchyIncomingCall2;

((CallHierarchyIncomingCall3) => {
  function to(item) {
    return new CallHierarchyIncomingCall(
      CallHierarchyItem2.to(item.from),
      item.fromRanges.map((r2) => Range3.to(r2))
    );
  }
  CallHierarchyIncomingCall3.to = to;
})(CallHierarchyIncomingCall2 || (CallHierarchyIncomingCall2 = {}));

var CallHierarchyOutgoingCall2;

((CallHierarchyOutgoingCall3) => {
  function to(item) {
    return new CallHierarchyOutgoingCall(
      CallHierarchyItem2.to(item.to),
      item.fromRanges.map((r2) => Range3.to(r2))
    );
  }
  CallHierarchyOutgoingCall3.to = to;
})(CallHierarchyOutgoingCall2 || (CallHierarchyOutgoingCall2 = {}));

var location;

((location2) => {
  function from(value) {
    return {
      range: value.range && Range3.from(value.range),
      uri: value.uri
    };
  }
  location2.from = from;
  function to(value) {
    return new Location2(URI.revive(value.uri), Range3.to(value.range));
  }
  location2.to = to;
})(location || (location = {}));

var DefinitionLink;

((DefinitionLink2) => {
  function from(value) {
    const definitionLink = value;
    const location2 = value;
    return {
      originSelectionRange: definitionLink.originSelectionRange ? Range3.from(definitionLink.originSelectionRange) : void 0,
      uri: definitionLink.targetUri ? definitionLink.targetUri : location2.uri,
      range: Range3.from(definitionLink.targetRange ? definitionLink.targetRange : location2.range),
      targetSelectionRange: definitionLink.targetSelectionRange ? Range3.from(definitionLink.targetSelectionRange) : void 0
    };
  }
  DefinitionLink2.from = from;
  function to(value) {
    return {
      targetUri: URI.revive(value.uri),
      targetRange: Range3.to(value.range),
      targetSelectionRange: value.targetSelectionRange ? Range3.to(value.targetSelectionRange) : void 0,
      originSelectionRange: value.originSelectionRange ? Range3.to(value.originSelectionRange) : void 0
    };
  }
  DefinitionLink2.to = to;
})(DefinitionLink || (DefinitionLink = {}));

var Hover2;

((Hover3) => {
  function from(hover) {
    const convertedHover = {
      range: Range3.from(hover.range),
      contents: MarkdownString3.fromMany(hover.contents),
      canIncreaseVerbosity: hover.canIncreaseVerbosity,
      canDecreaseVerbosity: hover.canDecreaseVerbosity
    };
    return convertedHover;
  }
  Hover3.from = from;
  function to(info) {
    const contents = info.contents.map(MarkdownString3.to);
    const range = Range3.to(info.range);
    const canIncreaseVerbosity = info.canIncreaseVerbosity;
    const canDecreaseVerbosity = info.canDecreaseVerbosity;
    return new VerboseHover(contents, range, canIncreaseVerbosity, canDecreaseVerbosity);
  }
  Hover3.to = to;
})(Hover2 || (Hover2 = {}));

var EvaluatableExpression2;

((EvaluatableExpression3) => {
  function from(expression) {
    return {
      range: Range3.from(expression.range),
      expression: expression.expression
    };
  }
  EvaluatableExpression3.from = from;
  function to(info) {
    return new EvaluatableExpression(Range3.to(info.range), info.expression);
  }
  EvaluatableExpression3.to = to;
})(EvaluatableExpression2 || (EvaluatableExpression2 = {}));

var InlineValue;

((InlineValue2) => {
  function from(inlineValue) {
    if (inlineValue instanceof InlineValueText) {
      return {
        type: "text",
        range: Range3.from(inlineValue.range),
        text: inlineValue.text
      };
    } else if (inlineValue instanceof InlineValueVariableLookup) {
      return {
        type: "variable",
        range: Range3.from(inlineValue.range),
        variableName: inlineValue.variableName,
        caseSensitiveLookup: inlineValue.caseSensitiveLookup
      };
    } else if (inlineValue instanceof InlineValueEvaluatableExpression) {
      return {
        type: "expression",
        range: Range3.from(inlineValue.range),
        expression: inlineValue.expression
      };
    } else {
      throw new Error(`Unknown 'InlineValue' type`);
    }
  }
  InlineValue2.from = from;
  function to(inlineValue) {
    switch (inlineValue.type) {
      case "text":
        return {
          range: Range3.to(inlineValue.range),
          text: inlineValue.text
        };
      case "variable":
        return {
          range: Range3.to(inlineValue.range),
          variableName: inlineValue.variableName,
          caseSensitiveLookup: inlineValue.caseSensitiveLookup
        };
      case "expression":
        return {
          range: Range3.to(inlineValue.range),
          expression: inlineValue.expression
        };
    }
  }
  InlineValue2.to = to;
})(InlineValue || (InlineValue = {}));

var InlineValueContext2;

((InlineValueContext3) => {
  function from(inlineValueContext) {
    return {
      frameId: inlineValueContext.frameId,
      stoppedLocation: Range3.from(inlineValueContext.stoppedLocation)
    };
  }
  InlineValueContext3.from = from;
  function to(inlineValueContext) {
    return new InlineValueContext(inlineValueContext.frameId, Range3.to(inlineValueContext.stoppedLocation));
  }
  InlineValueContext3.to = to;
})(InlineValueContext2 || (InlineValueContext2 = {}));

var DocumentHighlight2;

((DocumentHighlight3) => {
  function from(documentHighlight) {
    return {
      range: Range3.from(documentHighlight.range),
      kind: documentHighlight.kind
    };
  }
  DocumentHighlight3.from = from;
  function to(occurrence) {
    return new DocumentHighlight(Range3.to(occurrence.range), occurrence.kind);
  }
  DocumentHighlight3.to = to;
})(DocumentHighlight2 || (DocumentHighlight2 = {}));

var MultiDocumentHighlight2;

((MultiDocumentHighlight3) => {
  function from(multiDocumentHighlight) {
    return {
      uri: multiDocumentHighlight.uri,
      highlights: multiDocumentHighlight.highlights.map(DocumentHighlight2.from)
    };
  }
  MultiDocumentHighlight3.from = from;
  function to(multiDocumentHighlight) {
    return new MultiDocumentHighlight(URI.revive(multiDocumentHighlight.uri), multiDocumentHighlight.highlights.map(DocumentHighlight2.to));
  }
  MultiDocumentHighlight3.to = to;
})(MultiDocumentHighlight2 || (MultiDocumentHighlight2 = {}));

var CompletionTriggerKind3;

((CompletionTriggerKind4) => {
  function to(kind) {
    switch (kind) {
      case 1 /* TriggerCharacter */:
        return 1 /* TriggerCharacter */;
      case 2 /* TriggerForIncompleteCompletions */:
        return 2 /* TriggerForIncompleteCompletions */;
      case 0 /* Invoke */:
      default:
        return 0 /* Invoke */;
    }
  }
  CompletionTriggerKind4.to = to;
})(CompletionTriggerKind3 || (CompletionTriggerKind3 = {}));

var CompletionContext;

((CompletionContext2) => {
  function to(context) {
    return {
      triggerKind: CompletionTriggerKind3.to(context.triggerKind),
      triggerCharacter: context.triggerCharacter
    };
  }
  CompletionContext2.to = to;
})(CompletionContext || (CompletionContext = {}));

var CompletionItemTag3;

((CompletionItemTag4) => {
  function from(kind) {
    switch (kind) {
      case 1 /* Deprecated */:
        return 1 /* Deprecated */;
    }
  }
  CompletionItemTag4.from = from;
  function to(kind) {
    switch (kind) {
      case 1 /* Deprecated */:
        return 1 /* Deprecated */;
    }
  }
  CompletionItemTag4.to = to;
})(CompletionItemTag3 || (CompletionItemTag3 = {}));

var CompletionCommand;

((CompletionCommand2) => {
  function from(c, converter, disposables) {
    if ("icon" in c && "command" in c) {
      return {
        command: converter.toInternal(c.command, disposables),
        icon: IconPath.fromThemeIcon(c.icon)
      };
    }
    return { command: converter.toInternal(c, disposables) };
  }
  CompletionCommand2.from = from;
})(CompletionCommand || (CompletionCommand = {}));

var CompletionItemKind3;

((CompletionItemKind4) => {
  const _from = /* @__PURE__ */ new Map([
    [1 /* Method */, 0 /* Method */],
    [2 /* Function */, 1 /* Function */],
    [3 /* Constructor */, 2 /* Constructor */],
    [4 /* Field */, 3 /* Field */],
    [5 /* Variable */, 4 /* Variable */],
    [6 /* Class */, 5 /* Class */],
    [7 /* Interface */, 7 /* Interface */],
    [21 /* Struct */, 6 /* Struct */],
    [8 /* Module */, 8 /* Module */],
    [9 /* Property */, 9 /* Property */],
    [10 /* Unit */, 12 /* Unit */],
    [11 /* Value */, 13 /* Value */],
    [20 /* Constant */, 14 /* Constant */],
    [12 /* Enum */, 15 /* Enum */],
    [19 /* EnumMember */, 16 /* EnumMember */],
    [13 /* Keyword */, 17 /* Keyword */],
    [14 /* Snippet */, 28 /* Snippet */],
    [0 /* Text */, 18 /* Text */],
    [15 /* Color */, 19 /* Color */],
    [16 /* File */, 20 /* File */],
    [17 /* Reference */, 21 /* Reference */],
    [18 /* Folder */, 23 /* Folder */],
    [22 /* Event */, 10 /* Event */],
    [23 /* Operator */, 11 /* Operator */],
    [24 /* TypeParameter */, 24 /* TypeParameter */],
    [26 /* Issue */, 26 /* Issue */],
    [25 /* User */, 25 /* User */]
  ]);
  function from(kind) {
    return _from.get(kind) ?? 9 /* Property */;
  }
  CompletionItemKind4.from = from;
  const _to = /* @__PURE__ */ new Map([
    [0 /* Method */, 1 /* Method */],
    [1 /* Function */, 2 /* Function */],
    [2 /* Constructor */, 3 /* Constructor */],
    [3 /* Field */, 4 /* Field */],
    [4 /* Variable */, 5 /* Variable */],
    [5 /* Class */, 6 /* Class */],
    [7 /* Interface */, 7 /* Interface */],
    [6 /* Struct */, 21 /* Struct */],
    [8 /* Module */, 8 /* Module */],
    [9 /* Property */, 9 /* Property */],
    [12 /* Unit */, 10 /* Unit */],
    [13 /* Value */, 11 /* Value */],
    [14 /* Constant */, 20 /* Constant */],
    [15 /* Enum */, 12 /* Enum */],
    [16 /* EnumMember */, 19 /* EnumMember */],
    [17 /* Keyword */, 13 /* Keyword */],
    [28 /* Snippet */, 14 /* Snippet */],
    [18 /* Text */, 0 /* Text */],
    [19 /* Color */, 15 /* Color */],
    [20 /* File */, 16 /* File */],
    [21 /* Reference */, 17 /* Reference */],
    [23 /* Folder */, 18 /* Folder */],
    [10 /* Event */, 22 /* Event */],
    [11 /* Operator */, 23 /* Operator */],
    [24 /* TypeParameter */, 24 /* TypeParameter */],
    [25 /* User */, 25 /* User */],
    [26 /* Issue */, 26 /* Issue */]
  ]);
  function to(kind) {
    return _to.get(kind) ?? 9 /* Property */;
  }
  CompletionItemKind4.to = to;
})(CompletionItemKind3 || (CompletionItemKind3 = {}));

var CompletionItem2;

((CompletionItem3) => {
  function to(suggestion, converter) {
    const result = new CompletionItem(suggestion.label);
    result.insertText = suggestion.insertText;
    result.kind = CompletionItemKind3.to(suggestion.kind);
    result.tags = suggestion.tags?.map(CompletionItemTag3.to);
    result.detail = suggestion.detail;
    result.documentation = isMarkdownString(suggestion.documentation) ? MarkdownString3.to(suggestion.documentation) : suggestion.documentation;
    result.sortText = suggestion.sortText;
    result.filterText = suggestion.filterText;
    result.preselect = suggestion.preselect;
    result.commitCharacters = suggestion.commitCharacters;
    if (Range.isIRange(suggestion.range)) {
      result.range = Range3.to(suggestion.range);
    } else if (typeof suggestion.range === "object") {
      result.range = { inserting: Range3.to(suggestion.range.insert), replacing: Range3.to(suggestion.range.replace) };
    }
    result.keepWhitespace = typeof suggestion.insertTextRules === "undefined" ? false : Boolean(suggestion.insertTextRules & 1 /* KeepWhitespace */);
    if (typeof suggestion.insertTextRules !== "undefined" && suggestion.insertTextRules & 4 /* InsertAsSnippet */) {
      result.insertText = new SnippetString(suggestion.insertText);
    } else {
      result.insertText = suggestion.insertText;
      result.textEdit = result.range instanceof Range2 ? new TextEdit(result.range, result.insertText) : void 0;
    }
    if (suggestion.additionalTextEdits && suggestion.additionalTextEdits.length > 0) {
      result.additionalTextEdits = suggestion.additionalTextEdits.map((e) => TextEdit2.to(e));
    }
    result.command = converter && suggestion.command ? converter.fromInternal(suggestion.command) : void 0;
    return result;
  }
  CompletionItem3.to = to;
})(CompletionItem2 || (CompletionItem2 = {}));

var ParameterInformation2;

((ParameterInformation3) => {
  function from(info) {
    if (typeof info.label !== "string" && !Array.isArray(info.label)) {
      throw new TypeError("Invalid label");
    }
    return {
      label: info.label,
      documentation: MarkdownString3.fromStrict(info.documentation)
    };
  }
  ParameterInformation3.from = from;
  function to(info) {
    return {
      label: info.label,
      documentation: isMarkdownString(info.documentation) ? MarkdownString3.to(info.documentation) : info.documentation
    };
  }
  ParameterInformation3.to = to;
})(ParameterInformation2 || (ParameterInformation2 = {}));

var SignatureInformation2;

((SignatureInformation3) => {
  function from(info) {
    return {
      label: info.label,
      documentation: MarkdownString3.fromStrict(info.documentation),
      parameters: Array.isArray(info.parameters) ? info.parameters.map(ParameterInformation2.from) : [],
      activeParameter: info.activeParameter
    };
  }
  SignatureInformation3.from = from;
  function to(info) {
    return {
      label: info.label,
      documentation: isMarkdownString(info.documentation) ? MarkdownString3.to(info.documentation) : info.documentation,
      parameters: Array.isArray(info.parameters) ? info.parameters.map(ParameterInformation2.to) : [],
      activeParameter: info.activeParameter
    };
  }
  SignatureInformation3.to = to;
})(SignatureInformation2 || (SignatureInformation2 = {}));

var SignatureHelp2;

((SignatureHelp3) => {
  function from(help) {
    return {
      activeSignature: help.activeSignature,
      activeParameter: help.activeParameter,
      signatures: Array.isArray(help.signatures) ? help.signatures.map(SignatureInformation2.from) : []
    };
  }
  SignatureHelp3.from = from;
  function to(help) {
    return {
      activeSignature: help.activeSignature,
      activeParameter: help.activeParameter,
      signatures: Array.isArray(help.signatures) ? help.signatures.map(SignatureInformation2.to) : []
    };
  }
  SignatureHelp3.to = to;
})(SignatureHelp2 || (SignatureHelp2 = {}));

var InlayHint2;

((InlayHint3) => {
  function to(converter, hint) {
    const res = new InlayHint(
      Position3.to(hint.position),
      typeof hint.label === "string" ? hint.label : hint.label.map(InlayHintLabelPart2.to.bind(void 0, converter)),
      hint.kind && InlayHintKind2.to(hint.kind)
    );
    res.textEdits = hint.textEdits && hint.textEdits.map(TextEdit2.to);
    res.tooltip = isMarkdownString(hint.tooltip) ? MarkdownString3.to(hint.tooltip) : hint.tooltip;
    res.paddingLeft = hint.paddingLeft;
    res.paddingRight = hint.paddingRight;
    return res;
  }
  InlayHint3.to = to;
})(InlayHint2 || (InlayHint2 = {}));

var InlayHintLabelPart2;

((InlayHintLabelPart3) => {
  function to(converter, part) {
    const result = new InlayHintLabelPart(part.label);
    result.tooltip = isMarkdownString(part.tooltip) ? MarkdownString3.to(part.tooltip) : part.tooltip;
    if (Command.is(part.command)) {
      result.command = converter.fromInternal(part.command);
    }
    if (part.location) {
      result.location = location.to(part.location);
    }
    return result;
  }
  InlayHintLabelPart3.to = to;
})(InlayHintLabelPart2 || (InlayHintLabelPart2 = {}));

var InlayHintKind2;

((InlayHintKind3) => {
  function from(kind) {
    return kind;
  }
  InlayHintKind3.from = from;
  function to(kind) {
    return kind;
  }
  InlayHintKind3.to = to;
})(InlayHintKind2 || (InlayHintKind2 = {}));

var DocumentLink2;

((DocumentLink3) => {
  function from(link2) {
    return {
      range: Range3.from(link2.range),
      url: link2.target,
      tooltip: link2.tooltip
    };
  }
  DocumentLink3.from = from;
  function to(link2) {
    let target = void 0;
    if (link2.url) {
      try {
        target = typeof link2.url === "string" ? URI.parse(link2.url, true) : URI.revive(link2.url);
      } catch (err) {
      }
    }
    const result = new DocumentLink(Range3.to(link2.range), target);
    result.tooltip = link2.tooltip;
    return result;
  }
  DocumentLink3.to = to;
})(DocumentLink2 || (DocumentLink2 = {}));

var ColorPresentation2;

((ColorPresentation3) => {
  function to(colorPresentation) {
    const cp7 = new ColorPresentation(colorPresentation.label);
    if (colorPresentation.textEdit) {
      cp7.textEdit = TextEdit2.to(colorPresentation.textEdit);
    }
    if (colorPresentation.additionalTextEdits) {
      cp7.additionalTextEdits = colorPresentation.additionalTextEdits.map((value) => TextEdit2.to(value));
    }
    return cp7;
  }
  ColorPresentation3.to = to;
  function from(colorPresentation) {
    return {
      label: colorPresentation.label,
      textEdit: colorPresentation.textEdit ? TextEdit2.from(colorPresentation.textEdit) : void 0,
      additionalTextEdits: colorPresentation.additionalTextEdits ? colorPresentation.additionalTextEdits.map((value) => TextEdit2.from(value)) : void 0
    };
  }
  ColorPresentation3.from = from;
})(ColorPresentation2 || (ColorPresentation2 = {}));

var Color2;

((Color3) => {
  function to(c) {
    return new Color(c[0], c[1], c[2], c[3]);
  }
  Color3.to = to;
  function from(color2) {
    return [color2.red, color2.green, color2.blue, color2.alpha];
  }
  Color3.from = from;
})(Color2 || (Color2 = {}));

var SelectionRange2;

((SelectionRange3) => {
  function from(obj) {
    return { range: Range3.from(obj.range) };
  }
  SelectionRange3.from = from;
  function to(obj) {
    return new SelectionRange(Range3.to(obj.range));
  }
  SelectionRange3.to = to;
})(SelectionRange2 || (SelectionRange2 = {}));

var TextDocumentSaveReason2;

((TextDocumentSaveReason3) => {
  function to(reason) {
    switch (reason) {
      case 2 /* AUTO */:
        return 2 /* AfterDelay */;
      case 1 /* EXPLICIT */:
        return 1 /* Manual */;
      case 3 /* FOCUS_CHANGE */:
      case 4 /* WINDOW_CHANGE */:
        return 3 /* FocusOut */;
    }
  }
  TextDocumentSaveReason3.to = to;
})(TextDocumentSaveReason2 || (TextDocumentSaveReason2 = {}));

var TextEditorLineNumbersStyle2;

((TextEditorLineNumbersStyle4) => {
  function from(style) {
    switch (style) {
      case 0 /* Off */:
        return 0 /* Off */;
      case 2 /* Relative */:
        return 2 /* Relative */;
      case 3 /* Interval */:
        return 3 /* Interval */;
      case 1 /* On */:
      default:
        return 1 /* On */;
    }
  }
  TextEditorLineNumbersStyle4.from = from;
  function to(style) {
    switch (style) {
      case 0 /* Off */:
        return 0 /* Off */;
      case 2 /* Relative */:
        return 2 /* Relative */;
      case 3 /* Interval */:
        return 3 /* Interval */;
      case 1 /* On */:
      default:
        return 1 /* On */;
    }
  }
  TextEditorLineNumbersStyle4.to = to;
})(TextEditorLineNumbersStyle2 || (TextEditorLineNumbersStyle2 = {}));

var EndOfLine2;

((EndOfLine3) => {
  function from(eol) {
    if (eol === 2 /* CRLF */) {
      return 1 /* CRLF */;
    } else if (eol === 1 /* LF */) {
      return 0 /* LF */;
    }
    return void 0;
  }
  EndOfLine3.from = from;
  function to(eol) {
    if (eol === 1 /* CRLF */) {
      return 2 /* CRLF */;
    } else if (eol === 0 /* LF */) {
      return 1 /* LF */;
    }
    return void 0;
  }
  EndOfLine3.to = to;
})(EndOfLine2 || (EndOfLine2 = {}));

var ProgressLocation3;

((ProgressLocation4) => {
  function from(loc) {
    if (typeof loc === "object") {
      return loc.viewId;
    }
    switch (loc) {
      case 1 /* SourceControl */:
        return 3 /* Scm */;
      case 10 /* Window */:
        return 10 /* Window */;
      case 15 /* Notification */:
        return 15 /* Notification */;
    }
    throw new Error(`Unknown 'ProgressLocation'`);
  }
  ProgressLocation4.from = from;
})(ProgressLocation3 || (ProgressLocation3 = {}));

var FoldingRange2;

((FoldingRange3) => {
  function from(r2) {
    const range = { start: r2.start + 1, end: r2.end + 1 };
    if (r2.kind) {
      range.kind = FoldingRangeKind3.from(r2.kind);
    }
    return range;
  }
  FoldingRange3.from = from;
  function to(r2) {
    const range = { start: r2.start - 1, end: r2.end - 1 };
    if (r2.kind) {
      range.kind = FoldingRangeKind3.to(r2.kind);
    }
    return range;
  }
  FoldingRange3.to = to;
})(FoldingRange2 || (FoldingRange2 = {}));

var FoldingRangeKind3;

((FoldingRangeKind4) => {
  function from(kind) {
    if (kind) {
      switch (kind) {
        case 1 /* Comment */:
          return FoldingRangeKind.Comment;
        case 2 /* Imports */:
          return FoldingRangeKind.Imports;
        case 3 /* Region */:
          return FoldingRangeKind.Region;
      }
    }
    return void 0;
  }
  FoldingRangeKind4.from = from;
  function to(kind) {
    if (kind) {
      switch (kind.value) {
        case FoldingRangeKind.Comment.value:
          return 1 /* Comment */;
        case FoldingRangeKind.Imports.value:
          return 2 /* Imports */;
        case FoldingRangeKind.Region.value:
          return 3 /* Region */;
      }
    }
    return void 0;
  }
  FoldingRangeKind4.to = to;
})(FoldingRangeKind3 || (FoldingRangeKind3 = {}));

var TextEditorOpenOptions;

((TextEditorOpenOptions2) => {
  function from(options2) {
    if (options2) {
      return {
        pinned: typeof options2.preview === "boolean" ? !options2.preview : void 0,
        inactive: options2.background,
        preserveFocus: options2.preserveFocus,
        selection: typeof options2.selection === "object" ? Range3.from(options2.selection) : void 0,
        override: typeof options2.override === "boolean" ? DEFAULT_EDITOR_ASSOCIATION.id : void 0
      };
    }
    return void 0;
  }
  TextEditorOpenOptions2.from = from;
})(TextEditorOpenOptions || (TextEditorOpenOptions = {}));

var GlobPattern;

((GlobPattern3) => {
  function from(pattern) {
    if (pattern instanceof RelativePattern) {
      return pattern.toJSON();
    }
    if (typeof pattern === "string") {
      return pattern;
    }
    if (isRelativePatternShape(pattern) || isLegacyRelativePatternShape(pattern)) {
      return new RelativePattern(pattern.baseUri ?? pattern.base, pattern.pattern).toJSON();
    }
    return pattern;
  }
  GlobPattern3.from = from;
  function isRelativePatternShape(obj) {
    const rp = obj;
    if (!rp) {
      return false;
    }
    return URI.isUri(rp.baseUri) && typeof rp.pattern === "string";
  }
  function isLegacyRelativePatternShape(obj) {
    const rp = obj;
    if (!rp) {
      return false;
    }
    return typeof rp.base === "string" && typeof rp.pattern === "string";
  }
  function to(pattern) {
    if (typeof pattern === "string") {
      return pattern;
    }
    return new RelativePattern(URI.revive(pattern.baseUri), pattern.pattern);
  }
  GlobPattern3.to = to;
})(GlobPattern || (GlobPattern = {}));

var LanguageSelector;

((LanguageSelector2) => {
  function from(selector) {
    if (!selector) {
      return void 0;
    } else if (Array.isArray(selector)) {
      return selector.map(from);
    } else if (typeof selector === "string") {
      return selector;
    } else {
      const filter2 = selector;
      return {
        language: filter2.language,
        scheme: filter2.scheme,
        pattern: GlobPattern.from(filter2.pattern) ?? void 0,
        exclusive: filter2.exclusive,
        notebookType: filter2.notebookType
      };
    }
  }
  LanguageSelector2.from = from;
})(LanguageSelector || (LanguageSelector = {}));

var NotebookRange2;

((NotebookRange3) => {
  function from(range) {
    return { start: range.start, end: range.end };
  }
  NotebookRange3.from = from;
  function to(range) {
    return new NotebookRange(range.start, range.end);
  }
  NotebookRange3.to = to;
})(NotebookRange2 || (NotebookRange2 = {}));

var NotebookCellExecutionSummary;

((NotebookCellExecutionSummary2) => {
  function to(data) {
    return {
      timing: typeof data.runStartTime === "number" && typeof data.runEndTime === "number" ? { startTime: data.runStartTime, endTime: data.runEndTime } : void 0,
      executionOrder: data.executionOrder,
      success: data.lastRunSuccess
    };
  }
  NotebookCellExecutionSummary2.to = to;
  function from(data) {
    return {
      lastRunSuccess: data.success,
      runStartTime: data.timing?.startTime,
      runEndTime: data.timing?.endTime,
      executionOrder: data.executionOrder
    };
  }
  NotebookCellExecutionSummary2.from = from;
})(NotebookCellExecutionSummary || (NotebookCellExecutionSummary = {}));

var NotebookCellKind2;

((NotebookCellKind3) => {
  function from(data) {
    switch (data) {
      case 1 /* Markup */:
        return 1 /* Markup */;
      case 2 /* Code */:
      default:
        return 2 /* Code */;
    }
  }
  NotebookCellKind3.from = from;
  function to(data) {
    switch (data) {
      case 1 /* Markup */:
        return 1 /* Markup */;
      case 2 /* Code */:
      default:
        return 2 /* Code */;
    }
  }
  NotebookCellKind3.to = to;
})(NotebookCellKind2 || (NotebookCellKind2 = {}));

var NotebookData2;

((NotebookData3) => {
  function from(data) {
    const res = {
      metadata: data.metadata ?? /* @__PURE__ */ Object.create(null),
      cells: []
    };
    for (const cell of data.cells) {
      NotebookCellData.validate(cell);
      res.cells.push(NotebookCellData2.from(cell));
    }
    return res;
  }
  NotebookData3.from = from;
  function to(data) {
    const res = new NotebookData(
      data.cells.map(NotebookCellData2.to)
    );
    if (!isEmptyObject(data.metadata)) {
      res.metadata = data.metadata;
    }
    return res;
  }
  NotebookData3.to = to;
})(NotebookData2 || (NotebookData2 = {}));

var NotebookCellData2;

((NotebookCellData3) => {
  function from(data) {
    return {
      cellKind: NotebookCellKind2.from(data.kind),
      language: data.languageId,
      mime: data.mime,
      source: data.value,
      metadata: data.metadata,
      internalMetadata: NotebookCellExecutionSummary.from(data.executionSummary ?? {}),
      outputs: data.outputs ? data.outputs.map(NotebookCellOutput2.from) : []
    };
  }
  NotebookCellData3.from = from;
  function to(data) {
    return new NotebookCellData(
      NotebookCellKind2.to(data.cellKind),
      data.source,
      data.language,
      data.mime,
      data.outputs ? data.outputs.map(NotebookCellOutput2.to) : void 0,
      data.metadata,
      data.internalMetadata ? NotebookCellExecutionSummary.to(data.internalMetadata) : void 0
    );
  }
  NotebookCellData3.to = to;
})(NotebookCellData2 || (NotebookCellData2 = {}));

var NotebookCellOutputItem2;

((NotebookCellOutputItem3) => {
  function from(item) {
    return {
      mime: item.mime,
      valueBytes: VSBuffer.wrap(item.data)
    };
  }
  NotebookCellOutputItem3.from = from;
  function to(item) {
    return new NotebookCellOutputItem(item.valueBytes.buffer, item.mime);
  }
  NotebookCellOutputItem3.to = to;
})(NotebookCellOutputItem2 || (NotebookCellOutputItem2 = {}));

var NotebookCellOutput2;

((NotebookCellOutput3) => {
  function from(output) {
    return {
      outputId: output.id,
      items: output.items.map(NotebookCellOutputItem2.from),
      metadata: output.metadata
    };
  }
  NotebookCellOutput3.from = from;
  function to(output) {
    const items = output.items.map(NotebookCellOutputItem2.to);
    return new NotebookCellOutput(items, output.outputId, output.metadata);
  }
  NotebookCellOutput3.to = to;
})(NotebookCellOutput2 || (NotebookCellOutput2 = {}));

var NotebookExclusiveDocumentPattern;

((NotebookExclusiveDocumentPattern2) => {
  function from(pattern) {
    if (isExclusivePattern(pattern)) {
      return {
        include: GlobPattern.from(pattern.include) ?? void 0,
        exclude: GlobPattern.from(pattern.exclude) ?? void 0
      };
    }
    return GlobPattern.from(pattern) ?? void 0;
  }
  NotebookExclusiveDocumentPattern2.from = from;
  function to(pattern) {
    if (isExclusivePattern(pattern)) {
      return {
        include: GlobPattern.to(pattern.include),
        exclude: GlobPattern.to(pattern.exclude)
      };
    }
    return GlobPattern.to(pattern);
  }
  NotebookExclusiveDocumentPattern2.to = to;
  function isExclusivePattern(obj) {
    const ep = obj;
    if (!ep) {
      return false;
    }
    return !isUndefinedOrNull(ep.include) && !isUndefinedOrNull(ep.exclude);
  }
})(NotebookExclusiveDocumentPattern || (NotebookExclusiveDocumentPattern = {}));

var NotebookStatusBarItem;

((NotebookStatusBarItem2) => {
  function from(item, commandsConverter, disposables) {
    const command = typeof item.command === "string" ? { title: "", command: item.command } : item.command;
    return {
      alignment: item.alignment === 1 /* Left */ ? 1 /* Left */ : 2 /* Right */,
      command: commandsConverter.toInternal(command, disposables),
      // TODO@roblou
      text: item.text,
      tooltip: item.tooltip,
      accessibilityInformation: item.accessibilityInformation,
      priority: item.priority
    };
  }
  NotebookStatusBarItem2.from = from;
})(NotebookStatusBarItem || (NotebookStatusBarItem = {}));

var NotebookKernelSourceAction2;

((NotebookKernelSourceAction3) => {
  function from(item, commandsConverter, disposables) {
    const command = typeof item.command === "string" ? { title: "", command: item.command } : item.command;
    return {
      command: commandsConverter.toInternal(command, disposables),
      label: item.label,
      description: item.description,
      detail: item.detail,
      documentation: item.documentation
    };
  }
  NotebookKernelSourceAction3.from = from;
})(NotebookKernelSourceAction2 || (NotebookKernelSourceAction2 = {}));

var NotebookDocumentContentOptions;

((NotebookDocumentContentOptions2) => {
  function from(options2) {
    return {
      transientOutputs: options2?.transientOutputs ?? false,
      transientCellMetadata: options2?.transientCellMetadata ?? {},
      transientDocumentMetadata: options2?.transientDocumentMetadata ?? {},
      cellContentMetadata: options2?.cellContentMetadata ?? {}
    };
  }
  NotebookDocumentContentOptions2.from = from;
})(NotebookDocumentContentOptions || (NotebookDocumentContentOptions = {}));

var NotebookRendererScript2;

((NotebookRendererScript3) => {
  function from(preload) {
    return {
      uri: preload.uri,
      provides: preload.provides
    };
  }
  NotebookRendererScript3.from = from;
  function to(preload) {
    return new NotebookRendererScript(URI.revive(preload.uri), preload.provides);
  }
  NotebookRendererScript3.to = to;
})(NotebookRendererScript2 || (NotebookRendererScript2 = {}));

var TestMessage2;

((TestMessage3) => {
  function from(message) {
    return {
      message: MarkdownString3.fromStrict(message.message) || "",
      type: 0 /* Error */,
      expected: message.expectedOutput,
      actual: message.actualOutput,
      contextValue: message.contextValue,
      location: message.location && { range: Range3.from(message.location.range), uri: message.location.uri },
      stackTrace: message.stackTrace?.map((s) => ({
        label: s.label,
        position: s.position && Position3.from(s.position),
        uri: s.uri && URI.revive(s.uri).toJSON()
      }))
    };
  }
  TestMessage3.from = from;
  function to(item) {
    const message = new TestMessage(typeof item.message === "string" ? item.message : MarkdownString3.to(item.message));
    message.actualOutput = item.actual;
    message.expectedOutput = item.expected;
    message.contextValue = item.contextValue;
    message.location = item.location ? location.to(item.location) : void 0;
    return message;
  }
  TestMessage3.to = to;
})(TestMessage2 || (TestMessage2 = {}));

var TestTag2;

((TestTag3) => {
  TestTag3.namespace = namespaceTestTag;
  TestTag3.denamespace = denamespaceTestTag;
})(TestTag2 || (TestTag2 = {}));

var TestRunProfile;

((TestRunProfile2) => {
  function from(item) {
    return {
      controllerId: item.controllerId,
      profileId: item.profileId,
      group: TestRunProfileKind2.from(item.kind)
    };
  }
  TestRunProfile2.from = from;
})(TestRunProfile || (TestRunProfile = {}));

var TestRunProfileKind2;

((TestRunProfileKind3) => {
  const profileGroupToBitset = {
    [3 /* Coverage */]: 8 /* Coverage */,
    [2 /* Debug */]: 4 /* Debug */,
    [1 /* Run */]: 2 /* Run */
  };
  function from(kind) {
    return profileGroupToBitset.hasOwnProperty(kind) ? profileGroupToBitset[kind] : 2 /* Run */;
  }
  TestRunProfileKind3.from = from;
})(TestRunProfileKind2 || (TestRunProfileKind2 = {}));

var TestItem;

((TestItem2) => {
  function from(item) {
    const ctrlId = getPrivateApiFor(item).controllerId;
    return {
      extId: TestId.fromExtHostTestItem(item, ctrlId).toString(),
      label: item.label,
      uri: URI.revive(item.uri),
      busy: item.busy,
      tags: item.tags.map((t) => TestTag2.namespace(ctrlId, t.id)),
      range: Range.lift(Range3.from(item.range)),
      description: item.description || null,
      sortText: item.sortText || null,
      error: item.error ? MarkdownString3.fromStrict(item.error) || null : null
    };
  }
  TestItem2.from = from;
  function toPlain(item) {
    return {
      parent: void 0,
      error: void 0,
      id: TestId.fromString(item.extId).localId,
      label: item.label,
      uri: URI.revive(item.uri),
      tags: (item.tags || []).map((t) => {
        const { tagId } = TestTag2.denamespace(t);
        return new TestTag(tagId);
      }),
      children: {
        add: () => {
        },
        delete: () => {
        },
        forEach: () => {
        },
        *[Symbol.iterator]() {
        },
        get: () => void 0,
        replace: () => {
        },
        size: 0
      },
      range: Range3.to(item.range || void 0),
      canResolveChildren: false,
      busy: item.busy,
      description: item.description || void 0,
      sortText: item.sortText || void 0
    };
  }
  TestItem2.toPlain = toPlain;
})(TestItem || (TestItem = {}));

((TestTag3) => {
  function from(tag2) {
    return { id: tag2.id };
  }
  TestTag3.from = from;
  function to(tag2) {
    return new TestTag(tag2.id);
  }
  TestTag3.to = to;
})(TestTag2 || (TestTag2 = {}));

var TestResults;

((TestResults2) => {
  const convertTestResultItem = (node, parent) => {
    const item = node.value;
    if (!item) {
      return void 0;
    }
    const snapshot = {
      ...TestItem.toPlain(item.item),
      parent,
      taskStates: item.tasks.map((t) => ({
        state: t.state,
        duration: t.duration,
        messages: t.messages.filter((m) => m.type === 0 /* Error */).map(TestMessage2.to)
      })),
      children: []
    };
    if (node.children) {
      for (const child of node.children.values()) {
        const c = convertTestResultItem(child, snapshot);
        if (c) {
          snapshot.children.push(c);
        }
      }
    }
    return snapshot;
  };
  function to(serialized) {
    const tree = new WellDefinedPrefixTree();
    for (const item of serialized.items) {
      tree.insert(TestId.fromString(item.item.extId).path, item);
    }
    const queue = [tree.nodes];
    const roots = [];
    while (queue.length) {
      for (const node of queue.pop()) {
        if (node.value) {
          roots.push(node);
        } else if (node.children) {
          queue.push(node.children.values());
        }
      }
    }
    return {
      completedAt: serialized.completedAt,
      results: roots.map((r2) => convertTestResultItem(r2)).filter(isDefined)
    };
  }
  TestResults2.to = to;
})(TestResults || (TestResults = {}));

var TestCoverage;

((TestCoverage2) => {
  function fromCoverageCount(count2) {
    return { covered: count2.covered, total: count2.total };
  }
  function fromLocation(location2) {
    return "line" in location2 ? Position3.from(location2) : Range3.from(location2);
  }
  function toLocation(location2) {
    if (!location2) {
      return void 0;
    }
    return "endLineNumber" in location2 ? Range3.to(location2) : Position3.to(location2);
  }
  function to(serialized) {
    if (serialized.type === 1 /* Statement */) {
      const branches = [];
      if (serialized.branches) {
        for (const branch of serialized.branches) {
          branches.push({
            executed: branch.count,
            location: toLocation(branch.location),
            label: branch.label
          });
        }
      }
      return new StatementCoverage(
        serialized.count,
        toLocation(serialized.location),
        serialized.branches?.map((b) => new BranchCoverage(
          b.count,
          toLocation(b.location),
          b.label
        ))
      );
    } else {
      return new DeclarationCoverage(
        serialized.name,
        serialized.count,
        toLocation(serialized.location)
      );
    }
  }
  TestCoverage2.to = to;
  function fromDetails(coverage) {
    if (typeof coverage.executed === "number" && coverage.executed < 0) {
      throw new Error(`Invalid coverage count ${coverage.executed}`);
    }
    if ("branches" in coverage) {
      return {
        count: coverage.executed,
        location: fromLocation(coverage.location),
        type: 1 /* Statement */,
        branches: coverage.branches.length ? coverage.branches.map((b) => ({ count: b.executed, location: b.location && fromLocation(b.location), label: b.label })) : void 0
      };
    } else {
      return {
        type: 0 /* Declaration */,
        name: coverage.name,
        count: coverage.executed,
        location: fromLocation(coverage.location)
      };
    }
  }
  TestCoverage2.fromDetails = fromDetails;
  function fromFile(controllerId, id2, coverage) {
    validateTestCoverageCount(coverage.statementCoverage);
    validateTestCoverageCount(coverage.branchCoverage);
    validateTestCoverageCount(coverage.declarationCoverage);
    return {
      id: id2,
      uri: coverage.uri,
      statement: fromCoverageCount(coverage.statementCoverage),
      branch: coverage.branchCoverage && fromCoverageCount(coverage.branchCoverage),
      declaration: coverage.declarationCoverage && fromCoverageCount(coverage.declarationCoverage),
      testIds: coverage instanceof FileCoverage && coverage.includesTests.length ? coverage.includesTests.map((t) => TestId.fromExtHostTestItem(t, controllerId).toString()) : void 0
    };
  }
  TestCoverage2.fromFile = fromFile;
})(TestCoverage || (TestCoverage = {}));

var CodeActionTriggerKind2;

((CodeActionTriggerKind3) => {
  function to(value) {
    switch (value) {
      case 1 /* Invoke */:
        return 1 /* Invoke */;
      case 2 /* Auto */:
        return 2 /* Automatic */;
    }
  }
  CodeActionTriggerKind3.to = to;
})(CodeActionTriggerKind2 || (CodeActionTriggerKind2 = {}));

var TypeHierarchyItem2;

((TypeHierarchyItem3) => {
  function to(item) {
    const result = new TypeHierarchyItem(
      SymbolKind4.to(item.kind),
      item.name,
      item.detail || "",
      URI.revive(item.uri),
      Range3.to(item.range),
      Range3.to(item.selectionRange)
    );
    result._sessionId = item._sessionId;
    result._itemId = item._itemId;
    return result;
  }
  TypeHierarchyItem3.to = to;
  function from(item, sessionId, itemId) {
    sessionId = sessionId ?? item._sessionId;
    itemId = itemId ?? item._itemId;
    if (sessionId === void 0 || itemId === void 0) {
      throw new Error("invalid item");
    }
    return {
      _sessionId: sessionId,
      _itemId: itemId,
      kind: SymbolKind4.from(item.kind),
      name: item.name,
      detail: item.detail ?? "",
      uri: item.uri,
      range: Range3.from(item.range),
      selectionRange: Range3.from(item.selectionRange),
      tags: item.tags?.map(SymbolTag3.from)
    };
  }
  TypeHierarchyItem3.from = from;
})(TypeHierarchyItem2 || (TypeHierarchyItem2 = {}));

var ViewBadge2;

((ViewBadge3) => {
  function from(badge) {
    if (!badge) {
      return void 0;
    }
    return {
      value: badge.value,
      tooltip: badge.tooltip
    };
  }
  ViewBadge3.from = from;
})(ViewBadge2 || (ViewBadge2 = {}));

var DataTransferItem2;

((DataTransferItem3) => {
  function to(mime, item, resolveFileData) {
    const file = item.fileData;
    if (file) {
      return new InternalFileDataTransferItem(
        new DataTransferFile(file.name, URI.revive(file.uri), file.id, createSingleCallFunction(() => resolveFileData(file.id)))
      );
    }
    if (mime === Mimes.uriList && item.uriListData) {
      return new InternalDataTransferItem(reviveUriList(item.uriListData));
    }
    return new InternalDataTransferItem(item.asString);
  }
  DataTransferItem3.to = to;
  async function from(mime, item, id2 = generateUuid()) {
    const stringValue = await item.asString();
    if (mime === Mimes.uriList) {
      return {
        id: id2,
        asString: stringValue,
        fileData: void 0,
        uriListData: serializeUriList(stringValue)
      };
    }
    const fileValue = item.asFile();
    return {
      id: id2,
      asString: stringValue,
      fileData: fileValue ? {
        name: fileValue.name,
        uri: fileValue.uri,
        id: fileValue._itemId ?? fileValue.id
      } : void 0
    };
  }
  DataTransferItem3.from = from;
  function serializeUriList(stringValue) {
    return UriList.split(stringValue).map((part) => {
      if (part.startsWith("#")) {
        return part;
      }
      try {
        return URI.parse(part);
      } catch {
      }
      return part;
    });
  }
  function reviveUriList(parts) {
    return UriList.create(parts.map((part) => {
      return typeof part === "string" ? part : URI.revive(part);
    }));
  }
})(DataTransferItem2 || (DataTransferItem2 = {}));

var DataTransfer2;

((DataTransfer3) => {
  function toDataTransfer(value, resolveFileData) {
    const init = value.items.map(([type, item]) => {
      return [type, DataTransferItem2.to(type, item, resolveFileData)];
    });
    return new DataTransfer(init);
  }
  DataTransfer3.toDataTransfer = toDataTransfer;
  async function from(dataTransfer) {
    const items = await Promise.all(Array.from(dataTransfer, async ([mime, value]) => {
      return [mime, await DataTransferItem2.from(mime, value)];
    }));
    return { items };
  }
  DataTransfer3.from = from;
  async function fromList(dataTransfer) {
    const items = await Promise.all(Array.from(dataTransfer, async ([mime, value]) => {
      return [mime, await DataTransferItem2.from(mime, value, value.id)];
    }));
    return { items };
  }
  DataTransfer3.fromList = fromList;
})(DataTransfer2 || (DataTransfer2 = {}));

var ChatFollowup;

((ChatFollowup2) => {
  function from(followup, request) {
    return {
      kind: "reply",
      agentId: followup.participant ?? request?.agentId ?? "",
      subCommand: followup.command ?? request?.command,
      message: followup.prompt,
      title: followup.label
    };
  }
  ChatFollowup2.from = from;
  function to(followup) {
    return {
      prompt: followup.message,
      label: followup.title,
      participant: followup.agentId,
      command: followup.subCommand
    };
  }
  ChatFollowup2.to = to;
})(ChatFollowup || (ChatFollowup = {}));

var LanguageModelChatMessageRole2;

((LanguageModelChatMessageRole3) => {
  function to(role) {
    switch (role) {
      case 0 /* System */:
        return 3 /* System */;
      case 1 /* User */:
        return 1 /* User */;
      case 2 /* Assistant */:
        return 2 /* Assistant */;
    }
  }
  LanguageModelChatMessageRole3.to = to;
  function from(role) {
    switch (role) {
      case 3 /* System */:
        return 0 /* System */;
      case 1 /* User */:
        return 1 /* User */;
      case 2 /* Assistant */:
        return 2 /* Assistant */;
    }
    return 1 /* User */;
  }
  LanguageModelChatMessageRole3.from = from;
})(LanguageModelChatMessageRole2 || (LanguageModelChatMessageRole2 = {}));

var LanguageModelChatMessage3;

((LanguageModelChatMessage4) => {
  function to(message) {
    const content = message.content.map((c) => {
      if (c.type === "text") {
        return new LanguageModelTextPart(c.value, c.audience);
      } else if (c.type === "tool_result") {
        const content2 = coalesce(c.value.map((part) => {
          if (part.type === "text") {
            return new LanguageModelTextPart(part.value, part.audience);
          } else if (part.type === "data") {
            return new LanguageModelDataPart(part.data.buffer, part.mimeType);
          } else if (part.type === "prompt_tsx") {
            return new LanguageModelPromptTsxPart(part.value);
          } else {
            return void 0;
          }
        }));
        return new LanguageModelToolResultPart(c.toolCallId, content2, c.isError);
      } else if (c.type === "image_url") {
        return new LanguageModelDataPart(c.value.data.buffer, c.value.mimeType);
      } else if (c.type === "data") {
        return new LanguageModelDataPart(c.data.buffer, c.mimeType);
      } else if (c.type === "tool_use") {
        return new LanguageModelToolCallPart(c.toolCallId, c.name, c.parameters);
      }
      return void 0;
    }).filter((c) => c !== void 0);
    const role = LanguageModelChatMessageRole2.to(message.role);
    const result = new LanguageModelChatMessage(role, content, message.name);
    return result;
  }
  LanguageModelChatMessage4.to = to;
  function from(message) {
    const role = LanguageModelChatMessageRole2.from(message.role);
    const name = message.name;
    let messageContent = message.content;
    if (typeof messageContent === "string") {
      messageContent = [new LanguageModelTextPart(messageContent)];
    }
    const content = messageContent.map((c) => {
      if (c instanceof LanguageModelToolResultPart) {
        return {
          type: "tool_result",
          toolCallId: c.callId,
          value: coalesce(c.content.map((part) => {
            if (part instanceof LanguageModelTextPart) {
              return {
                type: "text",
                value: part.value,
                audience: part.audience
              };
            } else if (part instanceof LanguageModelPromptTsxPart) {
              return {
                type: "prompt_tsx",
                value: part.value
              };
            } else if (part instanceof LanguageModelDataPart) {
              return {
                type: "data",
                mimeType: part.mimeType,
                data: VSBuffer.wrap(part.data),
                audience: part.audience
              };
            } else {
              return void 0;
            }
          })),
          isError: c.isError
        };
      } else if (c instanceof LanguageModelDataPart) {
        if (isImageDataPart(c)) {
          const value = {
            mimeType: c.mimeType,
            data: VSBuffer.wrap(c.data)
          };
          return {
            type: "image_url",
            value
          };
        } else {
          return {
            type: "data",
            mimeType: c.mimeType,
            data: VSBuffer.wrap(c.data),
            audience: c.audience
          };
        }
      } else if (c instanceof LanguageModelToolCallPart) {
        return {
          type: "tool_use",
          toolCallId: c.callId,
          name: c.name,
          parameters: c.input
        };
      } else if (c instanceof LanguageModelTextPart) {
        return {
          type: "text",
          value: c.value
        };
      } else {
        if (typeof c !== "string") {
          throw new Error("Unexpected chat message content type");
        }
        return {
          type: "text",
          value: c
        };
      }
    });
    return {
      role,
      name,
      content
    };
  }
  LanguageModelChatMessage4.from = from;
})(LanguageModelChatMessage3 || (LanguageModelChatMessage3 = {}));

var LanguageModelChatMessage22;

((LanguageModelChatMessage23) => {
  function to(message) {
    const content = message.content.map((c) => {
      if (c.type === "text") {
        return new LanguageModelTextPart(c.value, c.audience);
      } else if (c.type === "tool_result") {
        const content2 = c.value.map((part) => {
          if (part.type === "text") {
            return new LanguageModelTextPart(part.value, part.audience);
          } else if (part.type === "data") {
            return new LanguageModelDataPart(part.data.buffer, part.mimeType);
          } else {
            return new LanguageModelPromptTsxPart(part.value);
          }
        });
        return new LanguageModelToolResultPart(c.toolCallId, content2, c.isError);
      } else if (c.type === "image_url") {
        return new LanguageModelDataPart(c.value.data.buffer, c.value.mimeType);
      } else if (c.type === "data") {
        return new LanguageModelDataPart(c.data.buffer, c.mimeType);
      } else if (c.type === "thinking") {
        return new LanguageModelThinkingPart(c.value, c.id, c.metadata);
      } else {
        return new LanguageModelToolCallPart(c.toolCallId, c.name, c.parameters);
      }
    });
    const role = LanguageModelChatMessageRole2.to(message.role);
    const result = new LanguageModelChatMessage2(role, content, message.name);
    return result;
  }
  LanguageModelChatMessage23.to = to;
  function from(message) {
    const role = LanguageModelChatMessageRole2.from(message.role);
    const name = message.name;
    let messageContent = message.content;
    if (typeof messageContent === "string") {
      messageContent = [new LanguageModelTextPart(messageContent)];
    }
    const content = messageContent.map((c) => {
      if (c instanceof LanguageModelToolResultPart) {
        return {
          type: "tool_result",
          toolCallId: c.callId,
          value: coalesce(c.content.map((part) => {
            if (part instanceof LanguageModelTextPart) {
              return {
                type: "text",
                value: part.value,
                audience: part.audience
              };
            } else if (part instanceof LanguageModelPromptTsxPart) {
              return {
                type: "prompt_tsx",
                value: part.value
              };
            } else if (part instanceof LanguageModelDataPart) {
              return {
                type: "data",
                mimeType: part.mimeType,
                data: VSBuffer.wrap(part.data),
                audience: part.audience
              };
            } else {
              return void 0;
            }
          })),
          isError: c.isError
        };
      } else if (c instanceof LanguageModelDataPart) {
        if (isImageDataPart(c)) {
          const value = {
            mimeType: c.mimeType,
            data: VSBuffer.wrap(c.data)
          };
          return {
            type: "image_url",
            value
          };
        } else {
          return {
            type: "data",
            mimeType: c.mimeType,
            data: VSBuffer.wrap(c.data),
            audience: c.audience
          };
        }
      } else if (c instanceof LanguageModelToolCallPart) {
        return {
          type: "tool_use",
          toolCallId: c.callId,
          name: c.name,
          parameters: c.input
        };
      } else if (c instanceof LanguageModelTextPart) {
        return {
          type: "text",
          value: c.value
        };
      } else if (c instanceof LanguageModelThinkingPart) {
        return {
          type: "thinking",
          value: c.value,
          id: c.id,
          metadata: c.metadata
        };
      } else {
        if (typeof c !== "string") {
          throw new Error("Unexpected chat message content type llm 2");
        }
        return {
          type: "text",
          value: c
        };
      }
    });
    return {
      role,
      name,
      content
    };
  }
  LanguageModelChatMessage23.from = from;
})(LanguageModelChatMessage22 || (LanguageModelChatMessage22 = {}));

function isImageDataPart(part) {
  const mime = typeof part.mimeType === "string" ? part.mimeType.toLowerCase() : "";
  switch (mime) {
    case "image/png":
    case "image/jpeg":
    case "image/jpg":
    case "image/gif":
    case "image/webp":
    case "image/bmp":
      return true;
    default:
      return false;
  }
}

var ChatResponseMarkdownPart2;

((ChatResponseMarkdownPart3) => {
  function from(part) {
    return {
      kind: "markdownContent",
      content: MarkdownString3.from(part.value)
    };
  }
  ChatResponseMarkdownPart3.from = from;
  function to(part) {
    return new ChatResponseMarkdownPart(MarkdownString3.to(part.content));
  }
  ChatResponseMarkdownPart3.to = to;
})(ChatResponseMarkdownPart2 || (ChatResponseMarkdownPart2 = {}));

var ChatResponseCodeblockUriPart2;

((ChatResponseCodeblockUriPart3) => {
  function from(part) {
    return {
      kind: "codeblockUri",
      uri: part.value,
      isEdit: part.isEdit,
      undoStopId: part.undoStopId
    };
  }
  ChatResponseCodeblockUriPart3.from = from;
  function to(part) {
    return new ChatResponseCodeblockUriPart(URI.revive(part.uri), part.isEdit, part.undoStopId);
  }
  ChatResponseCodeblockUriPart3.to = to;
})(ChatResponseCodeblockUriPart2 || (ChatResponseCodeblockUriPart2 = {}));

var ChatResponseMarkdownWithVulnerabilitiesPart2;

((ChatResponseMarkdownWithVulnerabilitiesPart3) => {
  function from(part) {
    return {
      kind: "markdownVuln",
      content: MarkdownString3.from(part.value),
      vulnerabilities: part.vulnerabilities
    };
  }
  ChatResponseMarkdownWithVulnerabilitiesPart3.from = from;
  function to(part) {
    return new ChatResponseMarkdownWithVulnerabilitiesPart(MarkdownString3.to(part.content), part.vulnerabilities);
  }
  ChatResponseMarkdownWithVulnerabilitiesPart3.to = to;
})(ChatResponseMarkdownWithVulnerabilitiesPart2 || (ChatResponseMarkdownWithVulnerabilitiesPart2 = {}));

var ChatResponseConfirmationPart2;

((ChatResponseConfirmationPart3) => {
  function from(part) {
    return {
      kind: "confirmation",
      title: part.title,
      message: MarkdownString3.from(part.message),
      data: part.data,
      buttons: part.buttons
    };
  }
  ChatResponseConfirmationPart3.from = from;
})(ChatResponseConfirmationPart2 || (ChatResponseConfirmationPart2 = {}));

var ChatResponseQuestionCarouselPart2;

((ChatResponseQuestionCarouselPart3) => {
  function questionTypeToString(type) {
    switch (type) {
      case 1 /* Text */:
        return "text";
      case 2 /* SingleSelect */:
        return "singleSelect";
      case 3 /* MultiSelect */:
        return "multiSelect";
      default:
        return "text";
    }
  }
  function stringToQuestionType(type) {
    switch (type) {
      case "text":
        return 1 /* Text */;
      case "singleSelect":
        return 2 /* SingleSelect */;
      case "multiSelect":
        return 3 /* MultiSelect */;
      default:
        return 1 /* Text */;
    }
  }
  function from(part) {
    return {
      kind: "questionCarousel",
      questions: part.questions.map((q) => ({
        id: q.id,
        type: questionTypeToString(q.type),
        title: q.title,
        message: q.message ? MarkdownString3.from(q.message) : void 0,
        options: q.options?.map((opt) => ({ id: opt.id, label: opt.label, value: String(opt.value) })),
        defaultValue: q.defaultValue,
        allowFreeformInput: q.allowFreeformInput
      })),
      allowSkip: part.allowSkip
    };
  }
  ChatResponseQuestionCarouselPart3.from = from;
  function to(part) {
    const questions = part.questions.map((q) => new ChatQuestion(
      q.id,
      stringToQuestionType(q.type),
      q.title,
      {
        message: q.message ? typeof q.message === "string" ? new MarkdownString2(q.message) : MarkdownString3.to(q.message) : void 0,
        options: q.options?.map((opt) => ({
          id: opt.id,
          label: opt.label,
          value: opt.value
        })),
        defaultValue: q.defaultValue,
        allowFreeformInput: q.allowFreeformInput
      }
    ));
    return new ChatResponseQuestionCarouselPart(questions, part.allowSkip);
  }
  ChatResponseQuestionCarouselPart3.to = to;
})(ChatResponseQuestionCarouselPart2 || (ChatResponseQuestionCarouselPart2 = {}));

var ChatResponseFilesPart;

((ChatResponseFilesPart2) => {
  function from(part) {
    const { value, baseUri } = part;
    function convert(items, baseUri2) {
      return items.map((item) => {
        const myUri = URI.joinPath(baseUri2, item.name);
        return {
          label: item.name,
          uri: myUri,
          children: item.children && convert(item.children, myUri)
        };
      });
    }
    return {
      kind: "treeData",
      treeData: {
        label: basename2(baseUri),
        uri: baseUri,
        children: convert(value, baseUri)
      }
    };
  }
  ChatResponseFilesPart2.from = from;
  function to(part) {
    const treeData = revive(part.treeData);
    function convert(items2) {
      return items2.map((item) => {
        return {
          name: item.label,
          children: item.children && convert(item.children)
        };
      });
    }
    const baseUri = treeData.uri;
    const items = treeData.children ? convert(treeData.children) : [];
    return new ChatResponseFileTreePart(items, baseUri);
  }
  ChatResponseFilesPart2.to = to;
})(ChatResponseFilesPart || (ChatResponseFilesPart = {}));

var ChatResponseMultiDiffPart2;

((ChatResponseMultiDiffPart3) => {
  function from(part) {
    return {
      kind: "multiDiffData",
      multiDiffData: {
        title: part.title,
        resources: part.value.map((entry) => ({
          originalUri: entry.originalUri,
          modifiedUri: entry.modifiedUri,
          goToFileUri: entry.goToFileUri,
          added: entry.added,
          removed: entry.removed
        }))
      },
      readOnly: part.readOnly
    };
  }
  ChatResponseMultiDiffPart3.from = from;
  function to(part) {
    const resources = part.multiDiffData.resources.map((resource) => ({
      originalUri: resource.originalUri ? URI.revive(resource.originalUri) : void 0,
      modifiedUri: resource.modifiedUri ? URI.revive(resource.modifiedUri) : void 0,
      goToFileUri: resource.goToFileUri ? URI.revive(resource.goToFileUri) : void 0,
      added: resource.added,
      removed: resource.removed
    }));
    return new ChatResponseMultiDiffPart(resources, part.multiDiffData.title, part.readOnly);
  }
  ChatResponseMultiDiffPart3.to = to;
})(ChatResponseMultiDiffPart2 || (ChatResponseMultiDiffPart2 = {}));

var ChatResponseAnchorPart2;

((ChatResponseAnchorPart3) => {
  function from(part) {
    const isUri3 = (thing) => URI.isUri(thing);
    const isSymbolInformation = (thing) => "name" in thing;
    return {
      kind: "inlineReference",
      name: part.title,
      inlineReference: isUri3(part.value) ? part.value : isSymbolInformation(part.value) ? WorkspaceSymbol.from(part.value) : Location3.from(part.value)
    };
  }
  ChatResponseAnchorPart3.from = from;
  function to(part) {
    const value = revive(part);
    return new ChatResponseAnchorPart(
      URI.isUri(value.inlineReference) ? value.inlineReference : "location" in value.inlineReference ? WorkspaceSymbol.to(value.inlineReference) : Location3.to(value.inlineReference),
      part.name
    );
  }
  ChatResponseAnchorPart3.to = to;
})(ChatResponseAnchorPart2 || (ChatResponseAnchorPart2 = {}));

var ChatResponseProgressPart3;

((ChatResponseProgressPart4) => {
  function from(part) {
    return {
      kind: "progressMessage",
      content: MarkdownString3.from(part.value)
    };
  }
  ChatResponseProgressPart4.from = from;
  function to(part) {
    return new ChatResponseProgressPart(part.content.value);
  }
  ChatResponseProgressPart4.to = to;
})(ChatResponseProgressPart3 || (ChatResponseProgressPart3 = {}));

var ChatResponseThinkingProgressPart2;

((ChatResponseThinkingProgressPart3) => {
  function from(part) {
    return {
      kind: "thinking",
      value: part.value,
      id: part.id,
      metadata: part.metadata
    };
  }
  ChatResponseThinkingProgressPart3.from = from;
  function to(part) {
    return new ChatResponseThinkingProgressPart(part.value ?? "", part.id, part.metadata);
  }
  ChatResponseThinkingProgressPart3.to = to;
})(ChatResponseThinkingProgressPart2 || (ChatResponseThinkingProgressPart2 = {}));

var ChatResponseHookPart2;

((ChatResponseHookPart3) => {
  function from(part) {
    return {
      kind: "hook",
      hookType: part.hookType,
      stopReason: part.stopReason,
      systemMessage: part.systemMessage,
      metadata: part.metadata
    };
  }
  ChatResponseHookPart3.from = from;
  function to(part) {
    return new ChatResponseHookPart(part.hookType, part.stopReason, part.systemMessage, part.metadata);
  }
  ChatResponseHookPart3.to = to;
})(ChatResponseHookPart2 || (ChatResponseHookPart2 = {}));

var ChatResponseVoiceProgressPart2;

((ChatResponseVoiceProgressPart3) => {
  function from(part) {
    return {
      kind: "voiceProgress",
      id: part.id,
      value: part.value
    };
  }
  ChatResponseVoiceProgressPart3.from = from;
})(ChatResponseVoiceProgressPart2 || (ChatResponseVoiceProgressPart2 = {}));

var ChatResponseAutoModeResolutionPart2;

((ChatResponseAutoModeResolutionPart3) => {
  function from(part) {
    return {
      kind: "autoModeResolution",
      resolved: part.resolvedModel
    };
  }
  ChatResponseAutoModeResolutionPart3.from = from;
  function to(part) {
    return new ChatResponseAutoModeResolutionPart(part.resolved);
  }
  ChatResponseAutoModeResolutionPart3.to = to;
})(ChatResponseAutoModeResolutionPart2 || (ChatResponseAutoModeResolutionPart2 = {}));

var ChatResponseWarningPart2;

((ChatResponseWarningPart3) => {
  function from(part) {
    return {
      kind: "warning",
      content: MarkdownString3.from(part.value)
    };
  }
  ChatResponseWarningPart3.from = from;
  function to(part) {
    return new ChatResponseWarningPart(part.content.value);
  }
  ChatResponseWarningPart3.to = to;
})(ChatResponseWarningPart2 || (ChatResponseWarningPart2 = {}));

var ChatResponseInfoPart2;

((ChatResponseInfoPart3) => {
  function from(part) {
    return {
      kind: "info",
      content: MarkdownString3.from(part.value)
    };
  }
  ChatResponseInfoPart3.from = from;
  function to(part) {
    return new ChatResponseInfoPart(part.content.value);
  }
  ChatResponseInfoPart3.to = to;
})(ChatResponseInfoPart2 || (ChatResponseInfoPart2 = {}));

var ChatResponseExtensionsPart2;

((ChatResponseExtensionsPart3) => {
  function from(part) {
    return {
      kind: "extensions",
      extensions: part.extensions
    };
  }
  ChatResponseExtensionsPart3.from = from;
})(ChatResponseExtensionsPart2 || (ChatResponseExtensionsPart2 = {}));

var ChatResponsePullRequestPart2;

((ChatResponsePullRequestPart3) => {
  function from(part, commandsConverter, commandDisposables) {
    let command;
    if (!part.command) {
      if (!part.uri) {
        throw new Error("Pull request part must have a command if URI is provided");
      }
      command = {
        title: "Open Pull Request",
        id: "vscode.open",
        arguments: [part.uri]
      };
    } else {
      command = commandsConverter.toInternal(part.command, commandDisposables);
    }
    return {
      kind: "pullRequest",
      author: part.author,
      title: part.title,
      description: part.description,
      uri: part.uri,
      linkTag: part.linkTag,
      command
    };
  }
  ChatResponsePullRequestPart3.from = from;
})(ChatResponsePullRequestPart2 || (ChatResponsePullRequestPart2 = {}));

var ChatResponseMovePart2;

((ChatResponseMovePart3) => {
  function from(part) {
    return {
      kind: "move",
      uri: part.uri,
      range: Range3.from(part.range)
    };
  }
  ChatResponseMovePart3.from = from;
  function to(part) {
    return new ChatResponseMovePart(URI.revive(part.uri), Range3.to(part.range));
  }
  ChatResponseMovePart3.to = to;
})(ChatResponseMovePart2 || (ChatResponseMovePart2 = {}));

var ChatToolInvocationPart2;

((ChatToolInvocationPart3) => {
  function from(part) {
    let resultDetails;
    let toolSpecificData;
    if (part.toolSpecificData && isChatMcpToolInvocationData(part.toolSpecificData)) {
      resultDetails = convertMcpToResultDetails(part.toolSpecificData, part.isError);
      toolSpecificData = void 0;
    } else {
      toolSpecificData = part.toolSpecificData ? convertToolSpecificData(part.toolSpecificData) : void 0;
    }
    const presentation = part.presentation === "hidden" ? "hidden" /* Hidden */ : part.presentation === "hiddenAfterComplete" ? "hiddenAfterComplete" /* HiddenAfterComplete */ : void 0;
    if (part.enablePartialUpdate) {
      return {
        kind: "externalToolInvocationUpdate",
        toolCallId: part.toolCallId,
        toolName: part.toolName,
        isComplete: !!part.isComplete,
        invocationMessage: part.invocationMessage ? MarkdownString3.from(part.invocationMessage) : void 0,
        pastTenseMessage: part.pastTenseMessage ? MarkdownString3.from(part.pastTenseMessage) : void 0,
        toolSpecificData,
        subagentInvocationId: part.subAgentInvocationId,
        resultDetails
      };
    }
    return {
      kind: "toolInvocationSerialized",
      toolCallId: part.toolCallId,
      toolId: part.toolName,
      invocationMessage: part.invocationMessage ? MarkdownString3.from(part.invocationMessage) : part.toolName,
      originMessage: part.originMessage ? MarkdownString3.from(part.originMessage) : void 0,
      pastTenseMessage: part.pastTenseMessage ? MarkdownString3.from(part.pastTenseMessage) : void 0,
      isConfirmed: part.isConfirmed,
      isComplete: true,
      source: ToolDataSource.External,
      // isError: part.isError ?? false,
      toolSpecificData,
      resultDetails,
      presentation,
      subAgentInvocationId: part.subAgentInvocationId
    };
  }
  ChatToolInvocationPart3.from = from;
  function isChatMcpToolInvocationData(data) {
    return data !== null && typeof data === "object" && "input" in data && typeof data.input === "string" && "output" in data && Array.isArray(data.output);
  }
  function convertMcpToResultDetails(data, isError) {
    return {
      input: data.input,
      output: data.output.map((o) => {
        const isText = o.mimeType.startsWith("text/");
        return {
          type: "embed",
          mimeType: o.mimeType,
          value: isText ? VSBuffer.wrap(o.data).toString() : encodeBase64(VSBuffer.wrap(o.data)),
          isText
        };
      }),
      isError: isError ?? false
    };
  }
  function convertToolSpecificData(data) {
    if ("command" in data && "language" in data) {
      return {
        kind: "terminal",
        command: data.command,
        language: data.language
      };
    } else if ("commandLine" in data && "language" in data) {
      const presentationOverrides = data.presentationOverrides && typeof data.presentationOverrides.commandLine === "string" ? {
        commandLine: data.presentationOverrides.commandLine,
        language: data.presentationOverrides.language
      } : void 0;
      const result = {
        kind: "terminal",
        presentationOverrides,
        commandLine: data.commandLine,
        language: data.language,
        terminalCommandOutput: typeof data.output?.text === "string" ? {
          text: data.output.text
        } : void 0,
        terminalCommandState: data.state ? {
          exitCode: data.state.exitCode,
          duration: data.state.duration
        } : void 0
      };
      return result;
    } else if ("todoList" in data && Array.isArray(data.todoList)) {
      return {
        kind: "todoList",
        todoList: data.todoList.map((todo) => ({
          id: String(todo.id),
          title: todo.title,
          status: todoStatusEnumToString(todo.status)
        }))
      };
    } else if ("input" in data && "output" in data && !Array.isArray(data.output)) {
      return {
        kind: "simpleToolInvocation",
        input: typeof data.input === "string" ? data.input : "",
        output: typeof data.output === "string" ? data.output : "",
        presentationStyle: data.presentationStyle === "opencode" ? "opencode" : void 0,
        presentationKind: ["files", "search", "edit", "terminal", "diagnostics", "lsp", "generic"].includes(data.presentationKind) ? data.presentationKind : void 0,
        isError: typeof data.isError === "boolean" ? data.isError : void 0,
        durationMs: typeof data.durationMs === "number" ? data.durationMs : void 0,
        terminalId: typeof data.terminalId === "string" ? data.terminalId : void 0,
        diff: typeof data.diff === "string" ? data.diff : void 0,
        diffPreview: Array.isArray(data.diffPreview) ? data.diffPreview.map((file) => ({
          path: typeof file?.path === "string" ? file.path : "",
          truncated: typeof file?.truncated === "boolean" ? file.truncated : void 0,
          hunks: Array.isArray(file?.hunks) ? file.hunks.map((hunk) => ({
            truncated: typeof hunk?.truncated === "boolean" ? hunk.truncated : void 0,
            lines: Array.isArray(hunk?.lines) ? hunk.lines.map((line) => ({
              kind: ["context", "add", "delete"].includes(line?.kind) ? line.kind : "context",
              oldLine: typeof line?.oldLine === "number" ? line.oldLine : void 0,
              newLine: typeof line?.newLine === "number" ? line.newLine : void 0,
              text: typeof line?.text === "string" ? line.text : ""
            })) : []
          })) : []
        })).filter((file) => file.path) : void 0,
        summary: typeof data.summary === "string" ? data.summary : void 0,
        detailsLabel: typeof data.detailsLabel === "string" ? data.detailsLabel : void 0,
        items: Array.isArray(data.items) ? data.items.map((item) => ({
          label: typeof item?.label === "string" ? item.label : "",
          description: typeof item?.description === "string" ? item.description : void 0,
          resource: item?.resource instanceof Location2 ? Location3.from(item.resource) : item?.resource ? URI.revive(item.resource) : void 0,
          added: typeof item?.added === "number" ? item.added : void 0,
          removed: typeof item?.removed === "number" ? item.removed : void 0
        })).filter((item) => item.label) : void 0,
        metrics: Array.isArray(data.metrics) ? data.metrics.map((metric) => ({
          label: typeof metric?.label === "string" ? metric.label : "",
          value: typeof metric?.value === "string" ? metric.value : ""
        })).filter((metric) => metric.label && metric.value) : void 0
      };
    } else if (data && "values" in data && Array.isArray(data.values)) {
      return {
        kind: "resources",
        values: data.values.map((v) => {
          if (v instanceof Location2) {
            return Location3.from(v);
          } else {
            return URI.revive(v);
          }
        })
      };
    } else if (data instanceof ChatSubagentToolInvocationData) {
      return {
        kind: "subagent",
        description: data.description,
        agentName: data.agentName,
        prompt: data.prompt,
        result: data.result,
        modelName: data.modelName
      };
    }
    return data;
  }
  function todoStatusEnumToString(status) {
    switch (status) {
      case 1 /* NotStarted */:
        return "not-started";
      case 2 /* InProgress */:
        return "in-progress";
      case 3 /* Completed */:
        return "completed";
      default:
        return "not-started";
    }
  }
  function todoStatusStringToEnum(status) {
    switch (status) {
      case "not-started":
        return 1 /* NotStarted */;
      case "in-progress":
        return 2 /* InProgress */;
      case "completed":
        return 3 /* Completed */;
      default:
        return 1 /* NotStarted */;
    }
  }
  function to(part) {
    const toolInvocation = new ChatToolInvocationPart(
      part.toolId || part.toolName,
      part.toolCallId,
      part.errorMessage
    );
    if (part.invocationMessage) {
      toolInvocation.invocationMessage = part.invocationMessage;
    }
    if (part.originMessage) {
      toolInvocation.originMessage = part.originMessage;
    }
    if (part.pastTenseMessage) {
      toolInvocation.pastTenseMessage = part.pastTenseMessage;
    }
    if (part.isConfirmed !== void 0) {
      toolInvocation.isConfirmed = part.isConfirmed;
    }
    if (part.isComplete !== void 0) {
      toolInvocation.isComplete = part.isComplete;
    }
    if (part.toolSpecificData) {
      toolInvocation.toolSpecificData = convertFromInternalToolSpecificData(part.toolSpecificData);
    }
    toolInvocation.subAgentInvocationId = part.subAgentInvocationId;
    toolInvocation.subAgentName = part.subAgentName;
    return toolInvocation;
  }
  ChatToolInvocationPart3.to = to;
  function convertFromInternalToolSpecificData(data) {
    if (data.kind === "terminal") {
      if (data.commandLine) {
        const result = {
          commandLine: data.commandLine,
          language: data.language
        };
        if (data.terminalCommandOutput) {
          result.output = {
            text: data.terminalCommandOutput.text,
            truncated: data.terminalCommandOutput.truncated,
            lineCount: data.terminalCommandOutput.lineCount
          };
        }
        if (data.terminalCommandState) {
          result.state = {
            exitCode: data.terminalCommandState.exitCode,
            duration: data.terminalCommandState.duration
          };
        }
        return result;
      } else {
        return {
          command: data.command,
          language: data.language
        };
      }
    } else if (data.kind === "terminal2") {
      return {
        commandLine: data.commandLine,
        language: data.language
      };
    } else if (data.kind === "todoList") {
      return {
        todoList: data.todoList.map((todo, index) => {
          const parsed = Number(todo.id);
          const id2 = Number.isFinite(parsed) ? parsed : index;
          return {
            id: id2,
            title: todo.title,
            status: todoStatusStringToEnum(todo.status)
          };
        })
      };
    }
    return data;
  }
})(ChatToolInvocationPart2 || (ChatToolInvocationPart2 = {}));

var ChatTask;

((ChatTask2) => {
  function from(part) {
    return {
      kind: "progressTask",
      content: MarkdownString3.from(part.value)
    };
  }
  ChatTask2.from = from;
})(ChatTask || (ChatTask = {}));

var ChatTaskResult;

((ChatTaskResult2) => {
  function from(part) {
    return {
      kind: "progressTaskResult",
      content: typeof part === "string" ? MarkdownString3.from(part) : void 0
    };
  }
  ChatTaskResult2.from = from;
})(ChatTaskResult || (ChatTaskResult = {}));

var ChatResponseCommandButtonPart2;

((ChatResponseCommandButtonPart3) => {
  function from(part, commandsConverter, commandDisposables) {
    const command = commandsConverter.toInternal(part.value, commandDisposables) ?? { command: part.value.command, title: part.value.title };
    return {
      kind: "command",
      command
    };
  }
  ChatResponseCommandButtonPart3.from = from;
  function to(part, commandsConverter) {
    return new ChatResponseCommandButtonPart(commandsConverter.fromInternal(part.command) ?? { command: part.command.id, title: part.command.title });
  }
  ChatResponseCommandButtonPart3.to = to;
})(ChatResponseCommandButtonPart2 || (ChatResponseCommandButtonPart2 = {}));

var ChatResponseTextEditPart2;

((ChatResponseTextEditPart3) => {
  function from(part) {
    return {
      kind: "textEdit",
      uri: part.uri,
      edits: part.edits.map((e) => TextEdit2.from(e)),
      done: part.isDone
    };
  }
  ChatResponseTextEditPart3.from = from;
  function to(part) {
    const result = new ChatResponseTextEditPart(URI.revive(part.uri), part.edits.map((e) => TextEdit2.to(e)));
    result.isDone = part.done;
    return result;
  }
  ChatResponseTextEditPart3.to = to;
})(ChatResponseTextEditPart2 || (ChatResponseTextEditPart2 = {}));

var NotebookEdit2;

((NotebookEdit3) => {
  function from(edit2) {
    if (edit2.newCellMetadata) {
      return {
        editType: 3 /* Metadata */,
        index: edit2.range.start,
        metadata: edit2.newCellMetadata
      };
    } else if (edit2.newNotebookMetadata) {
      return {
        editType: 5 /* DocumentMetadata */,
        metadata: edit2.newNotebookMetadata
      };
    } else {
      return {
        editType: 1 /* Replace */,
        index: edit2.range.start,
        count: edit2.range.end - edit2.range.start,
        cells: edit2.newCells.map(NotebookCellData2.from)
      };
    }
  }
  NotebookEdit3.from = from;
})(NotebookEdit2 || (NotebookEdit2 = {}));

var ChatResponseNotebookEditPart2;

((ChatResponseNotebookEditPart3) => {
  function from(part) {
    return {
      kind: "notebookEdit",
      uri: part.uri,
      edits: part.edits.map(NotebookEdit2.from),
      done: part.isDone
    };
  }
  ChatResponseNotebookEditPart3.from = from;
})(ChatResponseNotebookEditPart2 || (ChatResponseNotebookEditPart2 = {}));

var ChatResponseWorkspaceEditPart2;

((ChatResponseWorkspaceEditPart3) => {
  function from(part) {
    return {
      kind: "workspaceEdit",
      edits: part.edits.map((e) => ({
        oldResource: e.oldResource,
        newResource: e.newResource
      }))
    };
  }
  ChatResponseWorkspaceEditPart3.from = from;
})(ChatResponseWorkspaceEditPart2 || (ChatResponseWorkspaceEditPart2 = {}));

var ChatResponseReferencePart2;

((ChatResponseReferencePart3) => {
  function from(part) {
    const iconPath = ThemeIcon.isThemeIcon(part.iconPath) ? part.iconPath : URI.isUri(part.iconPath) ? { light: URI.revive(part.iconPath) } : part.iconPath && "light" in part.iconPath && "dark" in part.iconPath && URI.isUri(part.iconPath.light) && URI.isUri(part.iconPath.dark) ? { light: URI.revive(part.iconPath.light), dark: URI.revive(part.iconPath.dark) } : void 0;
    if (typeof part.value === "object" && "variableName" in part.value) {
      return {
        kind: "reference",
        reference: {
          variableName: part.value.variableName,
          value: URI.isUri(part.value.value) || !part.value.value ? part.value.value : Location3.from(part.value.value)
        },
        iconPath,
        options: part.options
      };
    }
    return {
      kind: "reference",
      reference: URI.isUri(part.value) || typeof part.value === "string" ? part.value : Location3.from(part.value),
      iconPath,
      options: part.options
    };
  }
  ChatResponseReferencePart3.from = from;
  function to(part) {
    const value = revive(part);
    const mapValue = (value2) => URI.isUri(value2) ? value2 : Location3.to(value2);
    return new ChatResponseReferencePart(
      typeof value.reference === "string" ? value.reference : "variableName" in value.reference ? {
        variableName: value.reference.variableName,
        value: value.reference.value && mapValue(value.reference.value)
      } : mapValue(value.reference)
    );
  }
  ChatResponseReferencePart3.to = to;
})(ChatResponseReferencePart2 || (ChatResponseReferencePart2 = {}));

var ChatResponseCodeCitationPart2;

((ChatResponseCodeCitationPart3) => {
  function from(part) {
    return {
      kind: "codeCitation",
      value: part.value,
      license: part.license,
      snippet: part.snippet
    };
  }
  ChatResponseCodeCitationPart3.from = from;
})(ChatResponseCodeCitationPart2 || (ChatResponseCodeCitationPart2 = {}));

var ChatResponsePart;

((ChatResponsePart2) => {
  function from(part, commandsConverter, commandDisposables) {
    if (part instanceof ChatResponseMarkdownPart) {
      return ChatResponseMarkdownPart2.from(part);
    } else if (part instanceof ChatResponseAnchorPart) {
      return ChatResponseAnchorPart2.from(part);
    } else if (part instanceof ChatResponseReferencePart) {
      return ChatResponseReferencePart2.from(part);
    } else if (part instanceof ChatResponseProgressPart) {
      return ChatResponseProgressPart3.from(part);
    } else if (part instanceof ChatResponseThinkingProgressPart) {
      return ChatResponseThinkingProgressPart2.from(part);
    } else if (part instanceof ChatResponseHookPart) {
      return ChatResponseHookPart2.from(part);
    } else if (part instanceof ChatResponseVoiceProgressPart) {
      return ChatResponseVoiceProgressPart2.from(part);
    } else if (part instanceof ChatResponseFileTreePart) {
      return ChatResponseFilesPart.from(part);
    } else if (part instanceof ChatResponseMultiDiffPart) {
      return ChatResponseMultiDiffPart2.from(part);
    } else if (part instanceof ChatResponseCommandButtonPart) {
      return ChatResponseCommandButtonPart2.from(part, commandsConverter, commandDisposables);
    } else if (part instanceof ChatResponseTextEditPart) {
      return ChatResponseTextEditPart2.from(part);
    } else if (part instanceof ChatResponseNotebookEditPart) {
      return ChatResponseNotebookEditPart2.from(part);
    } else if (part instanceof ChatResponseMarkdownWithVulnerabilitiesPart) {
      return ChatResponseMarkdownWithVulnerabilitiesPart2.from(part);
    } else if (part instanceof ChatResponseCodeblockUriPart) {
      return ChatResponseCodeblockUriPart2.from(part);
    } else if (part instanceof ChatResponseWarningPart) {
      return ChatResponseWarningPart2.from(part);
    } else if (part instanceof ChatResponseInfoPart) {
      return ChatResponseInfoPart2.from(part);
    } else if (part instanceof ChatResponseConfirmationPart) {
      return ChatResponseConfirmationPart2.from(part);
    } else if (part instanceof ChatResponseQuestionCarouselPart) {
      return ChatResponseQuestionCarouselPart2.from(part);
    } else if (part instanceof ChatResponseCodeCitationPart) {
      return ChatResponseCodeCitationPart2.from(part);
    } else if (part instanceof ChatResponseMovePart) {
      return ChatResponseMovePart2.from(part);
    } else if (part instanceof ChatResponseExtensionsPart) {
      return ChatResponseExtensionsPart2.from(part);
    } else if (part instanceof ChatResponsePullRequestPart) {
      return ChatResponsePullRequestPart2.from(part, commandsConverter, commandDisposables);
    } else if (part instanceof ChatToolInvocationPart) {
      return ChatToolInvocationPart2.from(part);
    } else if (part instanceof ChatResponseWorkspaceEditPart) {
      return ChatResponseWorkspaceEditPart2.from(part);
    } else if (part instanceof ChatResponseAutoModeResolutionPart) {
      return ChatResponseAutoModeResolutionPart2.from(part);
    }
    return {
      kind: "markdownContent",
      content: MarkdownString3.from("")
    };
  }
  ChatResponsePart2.from = from;
  function to(part, commandsConverter) {
    switch (part.kind) {
      case "reference":
        return ChatResponseReferencePart2.to(part);
      case "markdownContent":
      case "inlineReference":
      case "progressMessage":
      case "treeData":
      case "command":
        return toContent(part, commandsConverter);
    }
    return void 0;
  }
  ChatResponsePart2.to = to;
  function toContent(part, commandsConverter) {
    switch (part.kind) {
      case "markdownContent":
        return ChatResponseMarkdownPart2.to(part);
      case "inlineReference":
        return ChatResponseAnchorPart2.to(part);
      case "progressMessage":
        return void 0;
      case "treeData":
        return ChatResponseFilesPart.to(part);
      case "command":
        return ChatResponseCommandButtonPart2.to(part, commandsConverter);
    }
    return void 0;
  }
  ChatResponsePart2.toContent = toContent;
})(ChatResponsePart || (ChatResponsePart = {}));

var ChatAgentRequest;

((ChatAgentRequest2) => {
  function to(request, location2, model, modelConfiguration, diagnostics, tools, extension, logService) {
    const toolReferences = [];
    const variableReferences = [];
    for (const v of request.variables.variables) {
      if (v.kind === "tool") {
        toolReferences.push(v);
      } else if (v.kind === "toolset") {
        toolReferences.push(...v.value);
      } else {
        variableReferences.push(v);
      }
    }
    const sessionId = LocalChatSessionUri.parseLocalSessionId(request.sessionResource) ?? request.sessionResource.toString();
    const requestWithAllProps = {
      id: request.requestId,
      prompt: request.message,
      command: request.command,
      attempt: request.attempt ?? 0,
      enableCommandDetection: request.enableCommandDetection ?? true,
      isParticipantDetected: request.isParticipantDetected ?? false,
      isVoiceModeInput: request.isVoiceModeInput,
      sessionId,
      sessionResource: request.sessionResource,
      references: variableReferences.flatMap((v) => ChatPromptReference.toReferences(v, diagnostics, logService)),
      toolReferences: toolReferences.map(ChatLanguageModelToolReference.to),
      location: ChatLocation2.to(request.location),
      acceptedConfirmationData: request.acceptedConfirmationData,
      rejectedConfirmationData: request.rejectedConfirmationData,
      location2,
      toolInvocationToken: Object.freeze({ sessionResource: request.sessionResource, workingDirectory: URI.revive(request.workingDirectory) }),
      tools,
      model,
      modelConfiguration,
      editedFileEvents: request.editedFileEvents,
      modeInstructions: request.modeInstructions?.content,
      modeInstructions2: ChatRequestModeInstructions.to(request.modeInstructions),
      permissionLevel: request.permissionLevel,
      subAgentInvocationId: request.subAgentInvocationId,
      subAgentName: request.subAgentName,
      parentRequestId: request.parentRequestId,
      hasHooksEnabled: request.hasHooksEnabled ?? false,
      hooks: request.hooks ? ChatRequestHooksConverter.to(request.hooks) : void 0,
      isSystemInitiated: request.isSystemInitiated,
      openCodeBranchIntent: request.openCodeBranchIntent
    };
    if (!isProposedApiEnabled(extension, "chatParticipantPrivate")) {
      delete requestWithAllProps.id;
      delete requestWithAllProps.attempt;
      delete requestWithAllProps.enableCommandDetection;
      delete requestWithAllProps.isParticipantDetected;
      delete requestWithAllProps.isVoiceModeInput;
      delete requestWithAllProps.location;
      delete requestWithAllProps.location2;
      delete requestWithAllProps.editedFileEvents;
      delete requestWithAllProps.sessionId;
      delete requestWithAllProps.subAgentInvocationId;
      delete requestWithAllProps.subAgentName;
      delete requestWithAllProps.parentRequestId;
      delete requestWithAllProps.hasHooksEnabled;
      delete requestWithAllProps.hooks;
      delete requestWithAllProps.openCodeBranchIntent;
    }
    if (!isProposedApiEnabled(extension, "chatParticipantAdditions")) {
      delete requestWithAllProps.acceptedConfirmationData;
      delete requestWithAllProps.rejectedConfirmationData;
      delete requestWithAllProps.tools;
    }
    return requestWithAllProps;
  }
  ChatAgentRequest2.to = to;
})(ChatAgentRequest || (ChatAgentRequest = {}));

var ChatLocation2;

((ChatLocation3) => {
  function to(loc) {
    switch (loc) {
      case "notebook" /* Notebook */:
        return 3 /* Notebook */;
      case "terminal" /* Terminal */:
        return 2 /* Terminal */;
      case "panel" /* Chat */:
        return 1 /* Panel */;
      case "editor" /* EditorInline */:
        return 4 /* Editor */;
    }
  }
  ChatLocation3.to = to;
  function from(loc) {
    switch (loc) {
      case 3 /* Notebook */:
        return "notebook" /* Notebook */;
      case 2 /* Terminal */:
        return "terminal" /* Terminal */;
      case 1 /* Panel */:
        return "panel" /* Chat */;
      case 4 /* Editor */:
        return "editor" /* EditorInline */;
    }
  }
  ChatLocation3.from = from;
})(ChatLocation2 || (ChatLocation2 = {}));

var ChatSessionCustomizationType2;

((ChatSessionCustomizationType3) => {
  function from(type) {
    return type.id;
  }
  ChatSessionCustomizationType3.from = from;
  function to(id2) {
    switch (id2) {
      case "agent":
        return ChatSessionCustomizationType.Agent;
      case "skill":
        return ChatSessionCustomizationType.Skill;
      case "instructions":
        return ChatSessionCustomizationType.Instructions;
      case "prompt":
        return ChatSessionCustomizationType.Prompt;
      case "hook":
        return ChatSessionCustomizationType.Hook;
      case "plugins":
        return ChatSessionCustomizationType.Plugins;
      default:
        return new ChatSessionCustomizationType(id2);
    }
  }
  ChatSessionCustomizationType3.to = to;
})(ChatSessionCustomizationType2 || (ChatSessionCustomizationType2 = {}));

var ChatPromptReference;

((ChatPromptReference2) => {
  function toReferences(variable, diagnostics, logService) {
    const reference = to(variable, diagnostics, logService);
    if (!reference) {
      return [];
    }
    const element = isElementVariableEntry(variable) ? variable : void 0;
    if (!element) {
      return [reference];
    }
    const imageData = coerceImageBuffer(element.imageData);
    if (!imageData) {
      return [reference];
    }
    return [
      reference,
      {
        id: `${variable.id}-screenshot`,
        name: `${variable.name} screenshot`,
        value: new ChatReferenceBinaryData(
          element.imageMimeType ?? "image/png",
          () => Promise.resolve(imageData)
        )
      }
    ];
  }
  ChatPromptReference2.toReferences = toReferences;
  function to(variable, diagnostics, logService) {
    let value = variable.value;
    if (!value) {
      let varStr;
      try {
        varStr = JSON.stringify(variable);
      } catch {
        varStr = `kind=${variable.kind}, id=${variable.id}, name=${variable.name}`;
      }
      logService.error(`[ChatPromptReference] Ignoring invalid reference in variable: ${varStr}`);
      return void 0;
    }
    if (isUriComponents(value)) {
      value = URI.revive(value);
    } else if (value && typeof value === "object" && "uri" in value && "range" in value && isUriComponents(value.uri)) {
      value = Location3.to(revive(value));
    } else if (isImageVariableEntry(variable)) {
      const ref = variable.references?.[0]?.reference;
      value = new ChatReferenceBinaryData(
        variable.mimeType ?? "image/png",
        () => Promise.resolve(new Uint8Array(Object.values(variable.value))),
        ref && URI.isUri(ref) ? ref : void 0,
        variable.isPasted,
        variable.isURL
      );
    } else if (variable.kind === "diagnostic") {
      const filterSeverity = variable.filterSeverity && DiagnosticSeverity2.to(variable.filterSeverity);
      const filterUri = variable.filterUri && URI.revive(variable.filterUri).toString();
      value = new ChatReferenceDiagnostic(diagnostics.map(([uri2, d]) => {
        if (variable.filterUri && uri2.toString() !== filterUri) {
          return [uri2, []];
        }
        return [uri2, d.filter((d2) => {
          if (filterSeverity && d2.severity > filterSeverity) {
            return false;
          }
          if (variable.filterRange && !Range.areIntersectingOrTouching(variable.filterRange, Range3.from(d2.range))) {
            return false;
          }
          return true;
        })];
      }).filter(([, d]) => d.length > 0));
    }
    let toolReferences;
    if (isPromptFileVariableEntry(variable) || isPromptTextVariableEntry(variable)) {
      if (variable.toolReferences) {
        toolReferences = ChatLanguageModelToolReferences.to(variable.toolReferences);
      }
    }
    return {
      id: variable.id,
      name: variable.name,
      range: variable.range && [variable.range.start, variable.range.endExclusive],
      toolReferences,
      value,
      modelDescription: variable.modelDescription
    };
  }
  ChatPromptReference2.to = to;
})(ChatPromptReference || (ChatPromptReference = {}));

var ChatLanguageModelToolReference;

((ChatLanguageModelToolReference2) => {
  function to(variable) {
    const value = variable.value;
    if (value) {
      throw new Error("Invalid tool reference");
    }
    return {
      name: variable.id,
      range: variable.range && [variable.range.start, variable.range.endExclusive]
    };
  }
  ChatLanguageModelToolReference2.to = to;
})(ChatLanguageModelToolReference || (ChatLanguageModelToolReference = {}));

var ChatLanguageModelToolReferences;

((ChatLanguageModelToolReferences2) => {
  function to(variables) {
    const toolReferences = [];
    for (const v of variables) {
      if (v.kind === "tool") {
        toolReferences.push(ChatLanguageModelToolReference.to(v));
      } else if (v.kind === "toolset") {
        toolReferences.push(...v.value.map(ChatLanguageModelToolReference.to));
      } else {
        throw new Error("Invalid tool reference in prompt variables");
      }
    }
    return toolReferences;
  }
  ChatLanguageModelToolReferences2.to = to;
})(ChatLanguageModelToolReferences || (ChatLanguageModelToolReferences = {}));

var ChatRequestModeInstructions;

((ChatRequestModeInstructions2) => {
  function to(mode) {
    if (mode) {
      return {
        uri: URI.revive(mode.uri),
        name: mode.name,
        content: mode.content,
        toolReferences: ChatLanguageModelToolReferences.to(revive(mode.toolReferences)),
        allowedSubagents: mode.allowedSubagents,
        metadata: mode.metadata,
        isBuiltin: mode.isBuiltin
      };
    }
    return void 0;
  }
  ChatRequestModeInstructions2.to = to;
  function from(mode) {
    if (mode) {
      return {
        uri: mode.uri,
        name: mode.name,
        content: mode.content,
        toolReferences: mode.toolReferences?.map((ref) => ({
          kind: "tool",
          id: ref.name,
          name: ref.name,
          value: void 0,
          range: ref.range ? { start: ref.range[0], endExclusive: ref.range[1] } : void 0
        })) ?? [],
        allowedSubagents: mode.allowedSubagents,
        metadata: mode.metadata,
        isBuiltin: mode.isBuiltin
      };
    }
    return void 0;
  }
  ChatRequestModeInstructions2.from = from;
})(ChatRequestModeInstructions || (ChatRequestModeInstructions = {}));

var ChatAgentCompletionItem;

((ChatAgentCompletionItem2) => {
  function from(item, commandsConverter, disposables) {
    return {
      id: item.id,
      label: item.label,
      fullName: item.fullName,
      icon: item.icon?.id,
      value: item.values[0].value,
      insertText: item.insertText,
      detail: item.detail,
      documentation: item.documentation,
      command: commandsConverter.toInternal(item.command, disposables)
    };
  }
  ChatAgentCompletionItem2.from = from;
})(ChatAgentCompletionItem || (ChatAgentCompletionItem = {}));

var ChatAgentResult;

((ChatAgentResult2) => {
  function to(result) {
    return {
      errorDetails: result.errorDetails,
      metadata: reviveMetadata(result.metadata),
      nextQuestion: result.nextQuestion,
      details: result.details
    };
  }
  ChatAgentResult2.to = to;
  function from(result) {
    return {
      errorDetails: result.errorDetails,
      metadata: result.metadata,
      nextQuestion: result.nextQuestion,
      details: result.details
    };
  }
  ChatAgentResult2.from = from;
  function reviveMetadata(metadata) {
    return cloneAndChange(metadata, (value) => {
      if (value.$mid === 20 /* LanguageModelToolResult */) {
        return new LanguageModelToolResult(cloneAndChange(value.content, reviveMetadata));
      } else if (value.$mid === 21 /* LanguageModelTextPart */) {
        return new LanguageModelTextPart(value.value);
      } else if (value.$mid === 22 /* LanguageModelThinkingPart */) {
        return new LanguageModelThinkingPart(value.value, value.id, value.metadata);
      } else if (value.$mid === 23 /* LanguageModelPromptTsxPart */) {
        return new LanguageModelPromptTsxPart(value.value);
      } else if (value.$mid === 24 /* LanguageModelDataPart */) {
        let buffer;
        if (value.data && typeof value.data === "object" && value.data.type === "Buffer" && Array.isArray(value.data.data)) {
          buffer = new Uint8Array(value.data.data);
        } else if (typeof value.data === "string") {
          try {
            buffer = decodeBase64(value.data).buffer;
          } catch {
            buffer = new Uint8Array(0);
          }
        } else {
          buffer = new Uint8Array(0);
        }
        return new LanguageModelDataPart(buffer, value.mimeType, value.audience);
      }
      return void 0;
    });
  }
})(ChatAgentResult || (ChatAgentResult = {}));

var ChatAgentUserActionEvent;

((ChatAgentUserActionEvent2) => {
  function to(result, event, commandsConverter) {
    if (event.action.kind === "vote") {
      return;
    }
    const ehResult = ChatAgentResult.to(result);
    if (event.action.kind === "command") {
      const command = event.action.commandButton.command;
      const commandButton = {
        command: commandsConverter.fromInternal(command) ?? { command: command.id, title: command.title }
      };
      const commandAction = { kind: "command", commandButton };
      return { action: commandAction, result: ehResult };
    } else if (event.action.kind === "followUp") {
      const followupAction = { kind: "followUp", followup: ChatFollowup.to(event.action.followup) };
      return { action: followupAction, result: ehResult };
    } else if (event.action.kind === "inlineChat") {
      return { action: { kind: "editor", accepted: event.action.action === "accepted" }, result: ehResult };
    } else if (event.action.kind === "chatEditingSessionAction") {
      const outcomes = /* @__PURE__ */ new Map([
        ["accepted", 1 /* Accepted */],
        ["rejected", 2 /* Rejected */],
        ["saved", 3 /* Saved */]
      ]);
      return {
        action: {
          kind: "chatEditingSessionAction",
          outcome: outcomes.get(event.action.outcome) ?? 2 /* Rejected */,
          uri: URI.revive(event.action.uri),
          hasRemainingEdits: event.action.hasRemainingEdits
        },
        result: ehResult
      };
    } else if (event.action.kind === "chatEditingHunkAction") {
      const outcomes = /* @__PURE__ */ new Map([
        ["accepted", 1 /* Accepted */],
        ["rejected", 2 /* Rejected */]
      ]);
      return {
        action: {
          kind: "chatEditingHunkAction",
          outcome: outcomes.get(event.action.outcome) ?? 2 /* Rejected */,
          uri: URI.revive(event.action.uri),
          hasRemainingEdits: event.action.hasRemainingEdits,
          lineCount: event.action.lineCount,
          linesAdded: event.action.linesAdded,
          linesRemoved: event.action.linesRemoved
        },
        result: ehResult
      };
    } else {
      return { action: event.action, result: ehResult };
    }
  }
  ChatAgentUserActionEvent2.to = to;
})(ChatAgentUserActionEvent || (ChatAgentUserActionEvent = {}));

var TerminalQuickFix;

((TerminalQuickFix2) => {
  function from(quickFix, converter, disposables) {
    if ("terminalCommand" in quickFix) {
      return { terminalCommand: quickFix.terminalCommand, shouldExecute: quickFix.shouldExecute };
    }
    if ("uri" in quickFix) {
      return { uri: quickFix.uri };
    }
    return converter.toInternal(quickFix, disposables);
  }
  TerminalQuickFix2.from = from;
})(TerminalQuickFix || (TerminalQuickFix = {}));

var TerminalCompletionItemDto;

((TerminalCompletionItemDto2) => {
  function from(item) {
    return {
      ...item,
      documentation: MarkdownString3.fromStrict(item.documentation)
    };
  }
  TerminalCompletionItemDto2.from = from;
})(TerminalCompletionItemDto || (TerminalCompletionItemDto = {}));

var TerminalCompletionList2;

((TerminalCompletionList3) => {
  function from(completions, pathSeparator) {
    if (Array.isArray(completions)) {
      return {
        items: completions.map((i) => TerminalCompletionItemDto.from(i))
      };
    }
    return {
      items: completions.items.map((i) => TerminalCompletionItemDto.from(i)),
      resourceOptions: completions.resourceOptions ? TerminalCompletionResourceOptions.from(completions.resourceOptions, pathSeparator) : void 0
    };
  }
  TerminalCompletionList3.from = from;
})(TerminalCompletionList2 || (TerminalCompletionList2 = {}));

var TerminalCompletionResourceOptions;

((TerminalCompletionResourceOptions2) => {
  function from(resourceOptions, pathSeparator) {
    return {
      ...resourceOptions,
      pathSeparator,
      cwd: resourceOptions.cwd,
      globPattern: GlobPattern.from(resourceOptions.globPattern) ?? void 0
    };
  }
  TerminalCompletionResourceOptions2.from = from;
})(TerminalCompletionResourceOptions || (TerminalCompletionResourceOptions = {}));

var PartialAcceptInfo;

((PartialAcceptInfo2) => {
  function to(info) {
    return {
      kind: PartialAcceptTriggerKind3.to(info.kind),
      acceptedLength: info.acceptedLength
    };
  }
  PartialAcceptInfo2.to = to;
})(PartialAcceptInfo || (PartialAcceptInfo = {}));

var PartialAcceptTriggerKind3;

((PartialAcceptTriggerKind4) => {
  function to(kind) {
    switch (kind) {
      case 0 /* Word */:
        return 1 /* Word */;
      case 1 /* Line */:
        return 2 /* Line */;
      case 2 /* Suggest */:
        return 3 /* Suggest */;
      default:
        return 0 /* Unknown */;
    }
  }
  PartialAcceptTriggerKind4.to = to;
})(PartialAcceptTriggerKind3 || (PartialAcceptTriggerKind3 = {}));

var InlineCompletionEndOfLifeReason;

((InlineCompletionEndOfLifeReason2) => {
  function to(reason, convertFn) {
    if (reason.kind === 2 /* Ignored */) {
      const supersededBy = reason.supersededBy ? convertFn(reason.supersededBy) : void 0;
      return {
        kind: 2 /* Ignored */,
        supersededBy,
        userTypingDisagreed: reason.userTypingDisagreed
      };
    } else if (reason.kind === 0 /* Accepted */) {
      return {
        kind: 0 /* Accepted */
      };
    }
    return {
      kind: 1 /* Rejected */
    };
  }
  InlineCompletionEndOfLifeReason2.to = to;
})(InlineCompletionEndOfLifeReason || (InlineCompletionEndOfLifeReason = {}));

var InlineCompletionHintStyle2;

((InlineCompletionHintStyle3) => {
  function from(value) {
    if (value === 2 /* Label */) {
      return 2 /* Label */;
    } else {
      return 1 /* Code */;
    }
  }
  InlineCompletionHintStyle3.from = from;
  function to(kind) {
    switch (kind) {
      case 2 /* Label */:
        return 2 /* Label */;
      default:
        return 1 /* Code */;
    }
  }
  InlineCompletionHintStyle3.to = to;
})(InlineCompletionHintStyle2 || (InlineCompletionHintStyle2 = {}));

var DebugTreeItem;

((DebugTreeItem2) => {
  function from(item, id2) {
    return {
      id: id2,
      label: item.label,
      description: item.description,
      canEdit: item.canEdit,
      collapsibleState: item.collapsibleState || 0 /* None */,
      contextValue: item.contextValue
    };
  }
  DebugTreeItem2.from = from;
})(DebugTreeItem || (DebugTreeItem = {}));

var LanguageModelToolSource;

((LanguageModelToolSource2) => {
  function to(source) {
    if (source.type === "mcp") {
      return new LanguageModelToolMCPSource(source.label, source.serverLabel || source.label, source.instructions);
    } else if (source.type === "extension") {
      return new LanguageModelToolExtensionSource(source.extensionId.value, source.label);
    } else {
      return void 0;
    }
  }
  LanguageModelToolSource2.to = to;
})(LanguageModelToolSource || (LanguageModelToolSource = {}));

var LanguageModelToolResult3;

((LanguageModelToolResult4) => {
  function to(result) {
    const toolResult = new LanguageModelToolResult(result.content.map((item) => {
      if (item.kind === "text") {
        return new LanguageModelTextPart(item.value, item.audience);
      } else if (item.kind === "data") {
        return new LanguageModelDataPart(item.value.data.buffer, item.value.mimeType, item.audience);
      } else {
        return new LanguageModelPromptTsxPart(item.value);
      }
    }));
    if (result.toolMetadata !== void 0) {
      toolResult.toolMetadata = result.toolMetadata;
    }
    if (result.toolResultError) {
      toolResult.hasError = !!result.toolResultError;
    }
    return toolResult;
  }
  LanguageModelToolResult4.to = to;
  function from(result, extension) {
    if (result.toolResultMessage) {
      checkProposedApiEnabled(extension, "chatParticipantPrivate");
    }
    const checkAudienceApi = (item) => {
      if (item.audience) {
        checkProposedApiEnabled(extension, "languageModelToolResultAudience");
      }
    };
    let hasBuffers = false;
    let detailsDto = void 0;
    if (Array.isArray(result.toolResultDetails)) {
      detailsDto = result.toolResultDetails?.map((detail) => {
        return URI.isUri(detail) ? detail : Location3.from(detail);
      });
    } else {
      if (result.toolResultDetails2) {
        detailsDto = {
          output: {
            type: "data",
            mimeType: result.toolResultDetails2.mime,
            value: VSBuffer.wrap(result.toolResultDetails2.value)
          }
        };
        hasBuffers = true;
      }
    }
    const dto = {
      content: result.content.map((item) => {
        if (item instanceof LanguageModelTextPart) {
          checkAudienceApi(item);
          return {
            kind: "text",
            value: item.value,
            audience: item.audience
          };
        } else if (item instanceof LanguageModelPromptTsxPart) {
          return {
            kind: "promptTsx",
            value: item.value
          };
        } else if (item instanceof LanguageModelDataPart) {
          checkAudienceApi(item);
          hasBuffers = true;
          return {
            kind: "data",
            value: {
              mimeType: item.mimeType,
              data: VSBuffer.wrap(item.data)
            },
            audience: item.audience
          };
        } else {
          throw new Error("Unknown LanguageModelToolResult part type");
        }
      }),
      toolResultMessage: MarkdownString3.fromStrict(result.toolResultMessage),
      toolResultDetails: detailsDto,
      toolMetadata: result.toolMetadata,
      toolResultError: result.hasError
    };
    return hasBuffers ? new SerializableObjectWithBuffers(dto) : dto;
  }
  LanguageModelToolResult4.from = from;
})(LanguageModelToolResult3 || (LanguageModelToolResult3 = {}));

var IconPath;

((IconPath2) => {
  function fromThemeIcon(iconPath) {
    return iconPath;
  }
  IconPath2.fromThemeIcon = fromThemeIcon;
  function from(value) {
    if (!value) {
      return void 0;
    } else if (ThemeIcon.isThemeIcon(value)) {
      return value;
    } else if (URI.isUri(value)) {
      return value;
    } else if (typeof value === "string") {
      return URI.file(value);
    } else if (typeof value === "object" && value !== null && "dark" in value) {
      const dark = typeof value.dark === "string" ? URI.file(value.dark) : value.dark;
      const light = typeof value.light === "string" ? URI.file(value.light) : value.light;
      return !dark ? void 0 : { dark, light: light ?? dark };
    } else {
      return void 0;
    }
  }
  IconPath2.from = from;
  function to(value) {
    if (!value) {
      return void 0;
    } else if (ThemeIcon.isThemeIcon(value)) {
      return value;
    } else if (isUriComponents(value)) {
      return URI.revive(value);
    } else {
      const icon = value;
      return {
        light: URI.revive(icon.light),
        dark: URI.revive(icon.dark)
      };
    }
  }
  IconPath2.to = to;
})(IconPath || (IconPath = {}));

var AiSettingsSearch;

((AiSettingsSearch2) => {
  function fromSettingsSearchResult(result) {
    return {
      query: result.query,
      kind: fromSettingsSearchResultKind(result.kind),
      settings: result.settings
    };
  }
  AiSettingsSearch2.fromSettingsSearchResult = fromSettingsSearchResult;
  function fromSettingsSearchResultKind(kind) {
    switch (kind) {
      case 1 /* EMBEDDED */:
        return 1 /* EMBEDDED */;
      case 2 /* LLM_RANKED */:
        return 2 /* LLM_RANKED */;
      case 3 /* CANCELED */:
        return 3 /* CANCELED */;
      default:
        throw new Error("Unknown AiSettingsSearchResultKind");
    }
  }
})(AiSettingsSearch || (AiSettingsSearch = {}));

var McpServerDefinition2;

((McpServerDefinition4) => {
  function isHttpConfig(candidate) {
    return !!candidate.uri;
  }
  function from(item) {
    return McpServerLaunch.toSerialized(
      isHttpConfig(item) ? {
        type: 2 /* HTTP */,
        uri: item.uri,
        headers: Object.entries(item.headers),
        authentication: item.authentication ? {
          providerId: item.authentication.providerId,
          scopes: item.authentication.scopes
        } : void 0
      } : {
        type: 1 /* Stdio */,
        cwd: item.cwd?.fsPath,
        args: item.args,
        command: item.command,
        env: item.env,
        envFile: void 0,
        sandbox: void 0
      }
    );
  }
  McpServerDefinition4.from = from;
  function to(dto) {
    const launch = McpServerLaunch.fromSerialized(dto.launch);
    if (launch.type === 2 /* HTTP */) {
      return new McpHttpServerDefinition(
        dto.label,
        launch.uri,
        Object.fromEntries(launch.headers),
        dto.cacheNonce === "$$NONE" ? void 0 : dto.cacheNonce
      );
    } else {
      const result = new McpStdioServerDefinition(
        dto.label,
        launch.command,
        [...launch.args],
        Object.fromEntries(Object.entries(launch.env).map(([key, value]) => [key, value === null ? null : String(value)])),
        dto.cacheNonce === "$$NONE" ? void 0 : dto.cacheNonce
      );
      if (launch.cwd) {
        result.cwd = URI.file(launch.cwd);
      }
      return result;
    }
  }
  McpServerDefinition4.to = to;
})(McpServerDefinition2 || (McpServerDefinition2 = {}));

var SourceControlInputBoxValidationType2;

((SourceControlInputBoxValidationType3) => {
  function from(type) {
    switch (type) {
      case 0 /* Error */:
        return 0 /* Error */;
      case 1 /* Warning */:
        return 1 /* Warning */;
      case 2 /* Information */:
        return 2 /* Information */;
      default:
        throw new Error("Unknown SourceControlInputBoxValidationType");
    }
  }
  SourceControlInputBoxValidationType3.from = from;
})(SourceControlInputBoxValidationType2 || (SourceControlInputBoxValidationType2 = {}));

var ChatRequestHooksConverter;

((ChatRequestHooksConverter2) => {
  function to(hooks) {
    const result = {};
    for (const [hookType, commands] of Object.entries(hooks)) {
      if (!commands || commands.length === 0) {
        continue;
      }
      const converted = [];
      for (const cmd of commands) {
        const resolved = ChatHookCommand.to(cmd);
        if (resolved) {
          converted.push(resolved);
        }
      }
      if (converted.length > 0) {
        result[hookType] = converted;
      }
    }
    return result;
  }
  ChatRequestHooksConverter2.to = to;
})(ChatRequestHooksConverter || (ChatRequestHooksConverter = {}));

var ChatHookCommand;

((ChatHookCommand2) => {
  function to(hook) {
    const command = resolveEffectiveCommand(hook, OS);
    if (!command) {
      return void 0;
    }
    return {
      command,
      cwd: hook.cwd,
      env: hook.env,
      timeout: hook.timeout
    };
  }
  ChatHookCommand2.to = to;
})(ChatHookCommand || (ChatHookCommand = {}));

var ChatSessionItem;

((ChatSessionItem2) => {
  function convertStatus(status) {
    if (status === void 0) {
      return void 0;
    }
    switch (status) {
      case 0:
        return 0 /* Failed */;
      case 1:
        return 1 /* Completed */;
      case 2:
        return 2 /* InProgress */;
      case 3:
        return 3 /* NeedsInput */;
      default:
        return void 0;
    }
  }
  function from(sessionContent) {
    const timing = sessionContent.timing;
    const created = timing?.created ?? timing?.startTime ?? 0;
    const lastRequestStarted = timing?.lastRequestStarted ?? timing?.startTime;
    const lastRequestEnded = timing?.lastRequestEnded ?? timing?.endTime;
    return {
      resource: sessionContent.resource,
      label: sessionContent.label,
      description: sessionContent.description ? MarkdownString3.from(sessionContent.description) : void 0,
      badge: sessionContent.badge ? MarkdownString3.from(sessionContent.badge) : void 0,
      status: convertStatus(sessionContent.status),
      archived: sessionContent.archived,
      tooltip: MarkdownString3.fromStrict(sessionContent.tooltip),
      timing: {
        created,
        lastRequestStarted,
        lastRequestEnded
      },
      changes: sessionContent.changes instanceof Array ? sessionContent.changes : void 0,
      metadata: sessionContent.metadata,
      legacyResource: sessionContent.legacyResource
    };
  }
  ChatSessionItem2.from = from;
})(ChatSessionItem || (ChatSessionItem = {}));
export { isDecorationOptions, isDecorationOptionsArr, fromRangeOrRangeWithMessage, pathOrURIToURI, isImageDataPart, Selection2, Range3, Location3, TokenType2, Position3, DocumentSelector, TabSelector, DiagnosticTag2, Diagnostic2, DiagnosticRelatedInformation2, DiagnosticSeverity2, ViewColumn2, MarkdownString3, ThemableDecorationAttachmentRenderOptions, ThemableDecorationRenderOptions, DecorationRangeBehavior2, DecorationRenderOptions, TextEdit2, WorkspaceEdit2, SymbolKind4, SymbolTag3, WorkspaceSymbol, DocumentSymbol2, CallHierarchyItem2, CallHierarchyIncomingCall2, CallHierarchyOutgoingCall2, location, DefinitionLink, Hover2, EvaluatableExpression2, InlineValue, InlineValueContext2, DocumentHighlight2, MultiDocumentHighlight2, CompletionTriggerKind3, CompletionContext, CompletionItemTag3, CompletionCommand, CompletionItemKind3, CompletionItem2, ParameterInformation2, SignatureInformation2, SignatureHelp2, InlayHint2, InlayHintLabelPart2, InlayHintKind2, DocumentLink2, ColorPresentation2, Color2, SelectionRange2, TextDocumentSaveReason2, TextEditorLineNumbersStyle2, EndOfLine2, ProgressLocation3, FoldingRange2, FoldingRangeKind3, TextEditorOpenOptions, GlobPattern, LanguageSelector, NotebookRange2, NotebookCellExecutionSummary, NotebookCellKind2, NotebookData2, NotebookCellData2, NotebookCellOutputItem2, NotebookCellOutput2, NotebookExclusiveDocumentPattern, NotebookStatusBarItem, NotebookKernelSourceAction2, NotebookDocumentContentOptions, NotebookRendererScript2, TestMessage2, TestTag2, TestRunProfile, TestRunProfileKind2, TestItem, TestResults, TestCoverage, CodeActionTriggerKind2, TypeHierarchyItem2, ViewBadge2, DataTransferItem2, DataTransfer2, ChatFollowup, LanguageModelChatMessageRole2, LanguageModelChatMessage3, LanguageModelChatMessage22, ChatResponseMarkdownPart2, ChatResponseCodeblockUriPart2, ChatResponseMarkdownWithVulnerabilitiesPart2, ChatResponseConfirmationPart2, ChatResponseQuestionCarouselPart2, ChatResponseFilesPart, ChatResponseMultiDiffPart2, ChatResponseAnchorPart2, ChatResponseProgressPart3, ChatResponseThinkingProgressPart2, ChatResponseHookPart2, ChatResponseVoiceProgressPart2, ChatResponseAutoModeResolutionPart2, ChatResponseWarningPart2, ChatResponseInfoPart2, ChatResponseExtensionsPart2, ChatResponsePullRequestPart2, ChatResponseMovePart2, ChatToolInvocationPart2, ChatTask, ChatTaskResult, ChatResponseCommandButtonPart2, ChatResponseTextEditPart2, NotebookEdit2, ChatResponseNotebookEditPart2, ChatResponseWorkspaceEditPart2, ChatResponseReferencePart2, ChatResponseCodeCitationPart2, ChatResponsePart, ChatAgentRequest, ChatLocation2, ChatSessionCustomizationType2, ChatPromptReference, ChatLanguageModelToolReference, ChatLanguageModelToolReferences, ChatRequestModeInstructions, ChatAgentCompletionItem, ChatAgentResult, ChatAgentUserActionEvent, TerminalQuickFix, TerminalCompletionItemDto, TerminalCompletionList2, TerminalCompletionResourceOptions, PartialAcceptInfo, PartialAcceptTriggerKind3, InlineCompletionEndOfLifeReason, InlineCompletionHintStyle2, DebugTreeItem, LanguageModelToolSource, LanguageModelToolResult3, IconPath, AiSettingsSearch, McpServerDefinition2, SourceControlInputBoxValidationType2, ChatRequestHooksConverter, ChatHookCommand, ChatSessionItem };
