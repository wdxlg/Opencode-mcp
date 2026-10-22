// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/contrib/snippet/browser/snippetSession.ts
import { groupBy2 } from "./module-0007.mjs";
import { Choice, Placeholder, SnippetParser, Text, TextmateSnippet, Variable } from "./module-0544.mjs";
import { ModelDecorationOptions } from "./module-0423.mjs";
import { Range2 } from "./module-0106.mjs";
import { EditOperation } from "./module-0162.mjs";
import { Selection } from "./module-0107.mjs";
import { getLeadingWhitespace } from "./module-0030.mjs";
import { IWorkspaceContextService } from "./module-0509.mjs";
import { ClipboardBasedVariableResolver, CommentBasedVariableResolver, CompositeSnippetVariableResolver, ModelBasedVariableResolver, RandomBasedVariableResolver, SelectionBasedVariableResolver, TimeBasedVariableResolver, WorkspaceBasedVariableResolver } from "./module-0712.mjs";
import { ILabelService } from "./module-0641.mjs";
import { dispose } from "./module-0012.mjs";
import { EditSources } from "./module-0377.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ILanguageConfigurationService } from "./module-0143.mjs";


// src/vs/editor/contrib/snippet/browser/snippetSession.ts
var OneSnippet = class _OneSnippet {
  constructor(_editor, _snippet, _snippetLineLeadingWhitespace) {
    this._editor = _editor;
    this._snippet = _snippet;
    this._snippetLineLeadingWhitespace = _snippetLineLeadingWhitespace;
    this._offset = -1;
    this._nestingLevel = 1;
    this._placeholderGroups = groupBy2(_snippet.placeholders, Placeholder.compareByIndex);
    this._placeholderGroupsIdx = -1;
  }
  static {
    this._decor = {
      active: ModelDecorationOptions.register({ description: "snippet-placeholder-1", stickiness: 0 /* AlwaysGrowsWhenTypingAtEdges */, className: "snippet-placeholder" }),
      inactive: ModelDecorationOptions.register({ description: "snippet-placeholder-2", stickiness: 1 /* NeverGrowsWhenTypingAtEdges */, className: "snippet-placeholder" }),
      activeFinal: ModelDecorationOptions.register({ description: "snippet-placeholder-3", stickiness: 1 /* NeverGrowsWhenTypingAtEdges */, className: "finish-snippet-placeholder" }),
      inactiveFinal: ModelDecorationOptions.register({ description: "snippet-placeholder-4", stickiness: 1 /* NeverGrowsWhenTypingAtEdges */, className: "finish-snippet-placeholder" })
    };
  }
  initialize(textChange) {
    this._offset = textChange.newPosition;
  }
  dispose() {
    if (this._placeholderDecorations) {
      this._editor.removeDecorations([...this._placeholderDecorations.values()]);
    }
    this._placeholderGroups.length = 0;
  }
  _initDecorations() {
    if (this._offset === -1) {
      throw new Error(`Snippet not initialized!`);
    }
    if (this._placeholderDecorations) {
      return;
    }
    this._placeholderDecorations = /* @__PURE__ */ new Map();
    const model = this._editor.getModel();
    this._editor.changeDecorations((accessor) => {
      for (const placeholder of this._snippet.placeholders) {
        const placeholderOffset = this._snippet.offset(placeholder);
        const placeholderLen = this._snippet.fullLen(placeholder);
        const range2 = Range2.fromPositions(
          model.getPositionAt(this._offset + placeholderOffset),
          model.getPositionAt(this._offset + placeholderOffset + placeholderLen)
        );
        const options3 = placeholder.isFinalTabstop ? _OneSnippet._decor.inactiveFinal : _OneSnippet._decor.inactive;
        const handle2 = accessor.addDecoration(range2, options3);
        this._placeholderDecorations.set(placeholder, handle2);
      }
    });
  }
  move(fwd) {
    if (!this._editor.hasModel()) {
      return [];
    }
    this._initDecorations();
    const model = this._editor.getModel();
    if (this._placeholderGroupsIdx >= 0) {
      const operations = [];
      for (const placeholder of this._placeholderGroups[this._placeholderGroupsIdx]) {
        if (placeholder.transform) {
          const id2 = this._placeholderDecorations.get(placeholder);
          const range2 = id2 ? model.getDecorationRange(id2) : null;
          if (range2) {
            const currentValue = model.getValueInRange(range2);
            const transformedValueLines = placeholder.transform.resolve(currentValue).split(/\r\n|\r|\n/);
            for (let i2 = 1; i2 < transformedValueLines.length; i2++) {
              transformedValueLines[i2] = model.normalizeIndentation(this._snippetLineLeadingWhitespace + transformedValueLines[i2]);
            }
            operations.push(EditOperation.replace(range2, transformedValueLines.join(model.getEOL())));
          }
        }
      }
      if (operations.length > 0) {
        this._editor.executeEdits("snippet.placeholderTransform", operations);
      }
    }
    let couldSkipThisPlaceholder = false;
    if (fwd === true && this._placeholderGroupsIdx < this._placeholderGroups.length - 1) {
      this._placeholderGroupsIdx += 1;
      couldSkipThisPlaceholder = true;
    } else if (fwd === false && this._placeholderGroupsIdx > 0) {
      this._placeholderGroupsIdx -= 1;
      couldSkipThisPlaceholder = true;
    } else {
    }
    const newSelections = model.changeDecorations((accessor) => {
      const activePlaceholders = /* @__PURE__ */ new Set();
      const selections = [];
      for (const placeholder of this._placeholderGroups[this._placeholderGroupsIdx]) {
        const id2 = this._placeholderDecorations.get(placeholder);
        const range2 = id2 ? model.getDecorationRange(id2) : null;
        couldSkipThisPlaceholder = couldSkipThisPlaceholder && this._hasPlaceholderBeenCollapsed(placeholder);
        if (!id2 || !range2) {
          continue;
        }
        selections.push(new Selection(range2.startLineNumber, range2.startColumn, range2.endLineNumber, range2.endColumn));
        accessor.changeDecorationOptions(id2, placeholder.isFinalTabstop ? _OneSnippet._decor.activeFinal : _OneSnippet._decor.active);
        activePlaceholders.add(placeholder);
        for (const enclosingPlaceholder of this._snippet.enclosingPlaceholders(placeholder)) {
          const id3 = this._placeholderDecorations.get(enclosingPlaceholder);
          if (id3) {
            accessor.changeDecorationOptions(id3, enclosingPlaceholder.isFinalTabstop ? _OneSnippet._decor.activeFinal : _OneSnippet._decor.active);
            activePlaceholders.add(enclosingPlaceholder);
          }
        }
      }
      for (const [placeholder, id2] of this._placeholderDecorations) {
        if (!activePlaceholders.has(placeholder)) {
          accessor.changeDecorationOptions(id2, placeholder.isFinalTabstop ? _OneSnippet._decor.inactiveFinal : _OneSnippet._decor.inactive);
        }
      }
      return selections;
    });
    return !couldSkipThisPlaceholder ? newSelections ?? [] : this.move(fwd);
  }
  _hasPlaceholderBeenCollapsed(placeholder) {
    const model = this._editor.getModel();
    let marker = placeholder;
    while (marker) {
      if (marker instanceof Placeholder) {
        const id2 = this._placeholderDecorations.get(marker);
        const range2 = id2 ? model.getDecorationRange(id2) : null;
        if ((!range2 || range2.isEmpty()) && marker.toString().length > 0) {
          return true;
        }
      }
      marker = marker.parent;
    }
    return false;
  }
  get isAtFirstPlaceholder() {
    return this._placeholderGroupsIdx <= 0 || this._placeholderGroups.length === 0;
  }
  get isAtLastPlaceholder() {
    return this._placeholderGroupsIdx === this._placeholderGroups.length - 1;
  }
  get hasPlaceholder() {
    return this._snippet.placeholders.length > 0;
  }
  /**
   * A snippet is trivial when it has no placeholder or only a final placeholder at
   * its very end
   */
  get isTrivialSnippet() {
    if (this._snippet.placeholders.length === 0) {
      return true;
    }
    if (this._snippet.placeholders.length === 1) {
      const [placeholder] = this._snippet.placeholders;
      if (placeholder.isFinalTabstop) {
        if (this._snippet.rightMostDescendant === placeholder) {
          return true;
        }
      }
    }
    return false;
  }
  computePossibleSelections() {
    const result = /* @__PURE__ */ new Map();
    for (const placeholdersWithEqualIndex of this._placeholderGroups) {
      let ranges;
      for (const placeholder of placeholdersWithEqualIndex) {
        if (placeholder.isFinalTabstop) {
          break;
        }
        if (!ranges) {
          ranges = [];
          result.set(placeholder.index, ranges);
        }
        const id2 = this._placeholderDecorations.get(placeholder);
        const range2 = this._editor.getModel().getDecorationRange(id2);
        if (!range2) {
          result.delete(placeholder.index);
          break;
        }
        ranges.push(range2);
      }
    }
    return result;
  }
  get activeChoice() {
    if (!this._placeholderDecorations) {
      return void 0;
    }
    const placeholder = this._placeholderGroups[this._placeholderGroupsIdx][0];
    if (!placeholder?.choice) {
      return void 0;
    }
    const id2 = this._placeholderDecorations.get(placeholder);
    if (!id2) {
      return void 0;
    }
    const range2 = this._editor.getModel().getDecorationRange(id2);
    if (!range2) {
      return void 0;
    }
    return { range: range2, choice: placeholder.choice };
  }
  get hasChoice() {
    let result = false;
    this._snippet.walk((marker) => {
      result = marker instanceof Choice;
      return !result;
    });
    return result;
  }
  get activePlaceholderCount() {
    return this._placeholderGroupsIdx < 0 ? 0 : this._placeholderGroups[this._placeholderGroupsIdx].length;
  }
  merge(others) {
    const model = this._editor.getModel();
    this._nestingLevel *= 10;
    this._editor.changeDecorations((accessor) => {
      for (const placeholder of this._placeholderGroups[this._placeholderGroupsIdx]) {
        const nested = others.shift();
        console.assert(nested._offset !== -1);
        console.assert(!nested._placeholderDecorations);
        const indexLastPlaceholder = nested._snippet.placeholderInfo.last.index;
        for (const nestedPlaceholder of nested._snippet.placeholderInfo.all) {
          if (nestedPlaceholder.isFinalTabstop) {
            nestedPlaceholder.index = placeholder.index + (indexLastPlaceholder + 1) / this._nestingLevel;
          } else {
            nestedPlaceholder.index = placeholder.index + nestedPlaceholder.index / this._nestingLevel;
          }
        }
        this._snippet.replace(placeholder, nested._snippet.children);
        const id2 = this._placeholderDecorations.get(placeholder);
        accessor.removeDecoration(id2);
        this._placeholderDecorations.delete(placeholder);
        for (const placeholder2 of nested._snippet.placeholders) {
          const placeholderOffset = nested._snippet.offset(placeholder2);
          const placeholderLen = nested._snippet.fullLen(placeholder2);
          const range2 = Range2.fromPositions(
            model.getPositionAt(nested._offset + placeholderOffset),
            model.getPositionAt(nested._offset + placeholderOffset + placeholderLen)
          );
          const handle2 = accessor.addDecoration(range2, _OneSnippet._decor.inactive);
          this._placeholderDecorations.set(placeholder2, handle2);
        }
      }
      this._renormalizePlaceholderIndices();
      this._placeholderGroups = groupBy2(this._snippet.placeholders, Placeholder.compareByIndex);
    });
  }
  _renormalizePlaceholderIndices() {
    const placeholders = this._snippet.placeholders;
    const uniqueIndices = /* @__PURE__ */ new Set();
    for (const placeholder of placeholders) {
      if (!placeholder.isFinalTabstop) {
        uniqueIndices.add(placeholder.index);
      }
    }
    const sorted = [...uniqueIndices].sort((a, b) => a - b);
    const remap = /* @__PURE__ */ new Map();
    for (let i2 = 0; i2 < sorted.length; i2++) {
      remap.set(sorted[i2], i2 + 1);
    }
    for (const placeholder of placeholders) {
      if (!placeholder.isFinalTabstop) {
        placeholder.index = remap.get(placeholder.index);
      }
    }
    this._nestingLevel = 1;
  }
  getEnclosingRange() {
    let result;
    const model = this._editor.getModel();
    for (const decorationId of this._placeholderDecorations.values()) {
      const placeholderRange = model.getDecorationRange(decorationId) ?? void 0;
      if (!result) {
        result = placeholderRange;
      } else {
        result = result.plusRange(placeholderRange);
      }
    }
    return result;
  }
};

var _defaultOptions = {
  overwriteBefore: 0,
  overwriteAfter: 0,
  adjustWhitespace: true,
  clipboardText: void 0,
  overtypingCapturer: void 0
};

var SnippetSession = class {
  constructor(_editor, _template, _options = _defaultOptions, _languageConfigurationService) {
    this._editor = _editor;
    this._template = _template;
    this._options = _options;
    this._languageConfigurationService = _languageConfigurationService;
    this._templateMerges = [];
    this._snippets = [];
  }
  static adjustWhitespace(model, position2, adjustIndentation, snippet, filter2) {
    const line = model.getLineContent(position2.lineNumber);
    const lineLeadingWhitespace = getLeadingWhitespace(line, 0, position2.column - 1);
    let snippetTextString;
    snippet.walk((marker) => {
      if (!(marker instanceof Text) || marker.parent instanceof Choice) {
        return true;
      }
      if (filter2 && !filter2.has(marker)) {
        return true;
      }
      const lines = marker.value.split(/\r\n|\r|\n/);
      if (adjustIndentation) {
        const offset = snippet.offset(marker);
        if (offset === 0) {
          lines[0] = model.normalizeIndentation(lines[0]);
        } else {
          snippetTextString = snippetTextString ?? snippet.toString();
          const prevChar = snippetTextString.charCodeAt(offset - 1);
          if (prevChar === 10 /* LineFeed */ || prevChar === 13 /* CarriageReturn */) {
            lines[0] = model.normalizeIndentation(lineLeadingWhitespace + lines[0]);
          }
        }
        for (let i2 = 1; i2 < lines.length; i2++) {
          lines[i2] = model.normalizeIndentation(lineLeadingWhitespace + lines[i2]);
        }
      }
      const newValue = lines.join(model.getEOL());
      if (newValue !== marker.value) {
        marker.parent.replace(marker, [new Text(newValue)]);
        snippetTextString = void 0;
      }
      return true;
    });
    return lineLeadingWhitespace;
  }
  static adjustSelection(model, selection, overwriteBefore, overwriteAfter) {
    if (overwriteBefore !== 0 || overwriteAfter !== 0) {
      const { positionLineNumber, positionColumn } = selection;
      const positionColumnBefore = positionColumn - overwriteBefore;
      const positionColumnAfter = positionColumn + overwriteAfter;
      const range2 = model.validateRange({
        startLineNumber: positionLineNumber,
        startColumn: positionColumnBefore,
        endLineNumber: positionLineNumber,
        endColumn: positionColumnAfter
      });
      selection = Selection.createWithDirection(
        range2.startLineNumber,
        range2.startColumn,
        range2.endLineNumber,
        range2.endColumn,
        selection.getDirection()
      );
    }
    return selection;
  }
  static createEditsAndSnippetsFromSelections(editor, template2, overwriteBefore, overwriteAfter, enforceFinalTabstop, adjustWhitespace, clipboardText, overtypingCapturer, languageConfigurationService) {
    const edits = [];
    const snippets = [];
    if (!editor.hasModel()) {
      return { edits, snippets };
    }
    const model = editor.getModel();
    const workspaceService = editor.invokeWithinContext((accessor) => accessor.get(IWorkspaceContextService));
    const modelBasedVariableResolver = editor.invokeWithinContext((accessor) => new ModelBasedVariableResolver(accessor.get(ILabelService), model));
    const readClipboardText = () => clipboardText;
    const firstBeforeText = model.getValueInRange(SnippetSession.adjustSelection(model, editor.getSelection(), overwriteBefore, 0));
    const firstAfterText = model.getValueInRange(SnippetSession.adjustSelection(model, editor.getSelection(), 0, overwriteAfter));
    const firstLineFirstNonWhitespace = model.getLineFirstNonWhitespaceColumn(editor.getSelection().positionLineNumber);
    const indexedSelections = editor.getSelections().map((selection, idx) => ({ selection, idx })).sort((a, b) => Range2.compareRangesUsingStarts(a.selection, b.selection));
    for (const { selection, idx } of indexedSelections) {
      let extensionBefore = SnippetSession.adjustSelection(model, selection, overwriteBefore, 0);
      let extensionAfter = SnippetSession.adjustSelection(model, selection, 0, overwriteAfter);
      if (firstBeforeText !== model.getValueInRange(extensionBefore)) {
        extensionBefore = selection;
      }
      if (firstAfterText !== model.getValueInRange(extensionAfter)) {
        extensionAfter = selection;
      }
      const snippetSelection = selection.setStartPosition(extensionBefore.startLineNumber, extensionBefore.startColumn).setEndPosition(extensionAfter.endLineNumber, extensionAfter.endColumn);
      const snippet = new SnippetParser().parse(template2, true, enforceFinalTabstop);
      const start = snippetSelection.getStartPosition();
      const snippetLineLeadingWhitespace = SnippetSession.adjustWhitespace(
        model,
        start,
        adjustWhitespace || idx > 0 && firstLineFirstNonWhitespace !== model.getLineFirstNonWhitespaceColumn(selection.positionLineNumber),
        snippet
      );
      snippet.resolveVariables(new CompositeSnippetVariableResolver([
        modelBasedVariableResolver,
        new ClipboardBasedVariableResolver(readClipboardText, idx, indexedSelections.length, editor.getOption(88 /* multiCursorPaste */) === "spread"),
        new SelectionBasedVariableResolver(model, selection, idx, overtypingCapturer),
        new CommentBasedVariableResolver(model, selection, languageConfigurationService),
        new TimeBasedVariableResolver(),
        new WorkspaceBasedVariableResolver(workspaceService),
        new RandomBasedVariableResolver()
      ]));
      edits[idx] = EditOperation.replace(snippetSelection, snippet.toString());
      edits[idx].identifier = { major: idx, minor: 0 };
      edits[idx]._isTracked = true;
      snippets[idx] = new OneSnippet(editor, snippet, snippetLineLeadingWhitespace);
    }
    return { edits, snippets };
  }
  static createEditsAndSnippetsFromEdits(editor, snippetEdits, enforceFinalTabstop, adjustWhitespace, clipboardText, overtypingCapturer, languageConfigurationService) {
    if (!editor.hasModel() || snippetEdits.length === 0) {
      return { edits: [], snippets: [] };
    }
    const edits = [];
    const model = editor.getModel();
    const parser2 = new SnippetParser();
    const snippet = new TextmateSnippet();
    const modelBasedVariableResolver = editor.invokeWithinContext((accessor) => new ModelBasedVariableResolver(accessor.get(ILabelService), model));
    const timeBasedVariableResolver = new TimeBasedVariableResolver();
    const workspaceBasedVariableResolver = new WorkspaceBasedVariableResolver(editor.invokeWithinContext((accessor) => accessor.get(IWorkspaceContextService)));
    const randomBasedVariableResolver = new RandomBasedVariableResolver();
    const readClipboardText = () => clipboardText;
    const clipboardSpread = editor.getOption(88 /* multiCursorPaste */) === "spread";
    const indexedSnippetEdits = snippetEdits.map((edit3, idx) => ({ edit: edit3, idx })).sort((a, b) => Range2.compareRangesUsingStarts(a.edit.range, b.edit.range));
    let offset = 0;
    for (let i2 = 0; i2 < indexedSnippetEdits.length; i2++) {
      const { edit: { range: range2, template: template2, keepWhitespace }, idx } = indexedSnippetEdits[i2];
      if (i2 > 0) {
        const lastRange = indexedSnippetEdits[i2 - 1].edit.range;
        const textRange = Range2.fromPositions(lastRange.getEndPosition(), range2.getStartPosition());
        const textNode = new Text(model.getValueInRange(textRange));
        snippet.appendChild(textNode);
        offset += textNode.value.length;
      }
      const preExistingVariables = /* @__PURE__ */ new Set();
      snippet.walk((marker) => {
        if (marker instanceof Variable) {
          preExistingVariables.add(marker);
        }
        return true;
      });
      const newNodes = parser2.parseFragment(template2, snippet);
      SnippetSession.adjustWhitespace(model, range2.getStartPosition(), keepWhitespace !== void 0 ? !keepWhitespace : adjustWhitespace, snippet, new Set(newNodes));
      const editSelection = Selection.fromRange(range2, 0 /* LTR */);
      const editResolver = new CompositeSnippetVariableResolver([
        modelBasedVariableResolver,
        new ClipboardBasedVariableResolver(readClipboardText, idx, indexedSnippetEdits.length, clipboardSpread),
        new SelectionBasedVariableResolver(model, editSelection, idx, overtypingCapturer),
        new CommentBasedVariableResolver(model, editSelection, languageConfigurationService),
        timeBasedVariableResolver,
        workspaceBasedVariableResolver,
        randomBasedVariableResolver
      ]);
      snippet.walk((marker) => {
        if (marker instanceof Variable && !preExistingVariables.has(marker)) {
          marker.resolve(editResolver);
        }
        return true;
      });
      const snippetText = snippet.toString();
      const snippetFragmentText = snippetText.slice(offset);
      offset = snippetText.length;
      const edit3 = EditOperation.replace(range2, snippetFragmentText);
      edit3.identifier = { major: i2, minor: 0 };
      edit3._isTracked = true;
      edits.push(edit3);
    }
    parser2.ensureFinalTabstop(snippet, enforceFinalTabstop, true);
    return {
      edits,
      snippets: [new OneSnippet(editor, snippet, "")]
    };
  }
  dispose() {
    dispose(this._snippets);
  }
  _logInfo() {
    return `template="${this._template}", merged_templates="${this._templateMerges.join(" -> ")}"`;
  }
  insert(editReason) {
    if (!this._editor.hasModel()) {
      return;
    }
    const { edits, snippets } = typeof this._template === "string" ? SnippetSession.createEditsAndSnippetsFromSelections(this._editor, this._template, this._options.overwriteBefore, this._options.overwriteAfter, false, this._options.adjustWhitespace, this._options.clipboardText, this._options.overtypingCapturer, this._languageConfigurationService) : SnippetSession.createEditsAndSnippetsFromEdits(this._editor, this._template, false, this._options.adjustWhitespace, this._options.clipboardText, this._options.overtypingCapturer, this._languageConfigurationService);
    this._snippets = snippets;
    this._editor.executeEdits(editReason ?? EditSources.snippet(), edits, (_undoEdits) => {
      const undoEdits = _undoEdits.filter((edit3) => !!edit3.identifier);
      for (let idx = 0; idx < snippets.length; idx++) {
        snippets[idx].initialize(undoEdits[idx].textChange);
      }
      if (this._snippets[0].hasPlaceholder) {
        return this._move(true);
      } else {
        return undoEdits.map((edit3) => Selection.fromPositions(edit3.range.getEndPosition()));
      }
    });
    this._editor.revealRange(this._editor.getSelections()[0]);
  }
  merge(template2, options3 = _defaultOptions) {
    if (!this._editor.hasModel()) {
      return;
    }
    this._templateMerges.push([this._snippets[0]._nestingLevel, this._snippets[0]._placeholderGroupsIdx, template2]);
    const { edits, snippets } = SnippetSession.createEditsAndSnippetsFromSelections(this._editor, template2, options3.overwriteBefore, options3.overwriteAfter, true, options3.adjustWhitespace, options3.clipboardText, options3.overtypingCapturer, this._languageConfigurationService);
    this._editor.executeEdits("snippet", edits, (_undoEdits) => {
      const undoEdits = _undoEdits.filter((edit3) => !!edit3.identifier);
      for (let idx = 0; idx < snippets.length; idx++) {
        snippets[idx].initialize(undoEdits[idx].textChange);
      }
      const isTrivialSnippet = snippets[0].isTrivialSnippet;
      const canMergeSnippets = snippets.length === this._snippets.reduce((count2, snippet) => count2 + snippet.activePlaceholderCount, 0);
      if (!isTrivialSnippet && canMergeSnippets) {
        for (const snippet of this._snippets) {
          snippet.merge(snippets);
        }
        console.assert(snippets.length === 0);
      }
      if (this._snippets[0].hasPlaceholder && !isTrivialSnippet && canMergeSnippets) {
        return this._move(void 0);
      } else {
        return undoEdits.map((edit3) => Selection.fromPositions(edit3.range.getEndPosition()));
      }
    });
  }
  next() {
    const newSelections = this._move(true);
    if (newSelections.length > 0) {
      this._editor.setSelections(newSelections);
      this._editor.revealPositionInCenterIfOutsideViewport(newSelections[0].getPosition());
    }
  }
  prev() {
    const newSelections = this._move(false);
    if (newSelections.length > 0) {
      this._editor.setSelections(newSelections);
      this._editor.revealPositionInCenterIfOutsideViewport(newSelections[0].getPosition());
    }
  }
  _move(fwd) {
    const selections = [];
    for (const snippet of this._snippets) {
      const oneSelection = snippet.move(fwd);
      selections.push(...oneSelection);
    }
    return selections;
  }
  get isAtFirstPlaceholder() {
    return this._snippets[0].isAtFirstPlaceholder;
  }
  get isAtLastPlaceholder() {
    return this._snippets[0].isAtLastPlaceholder;
  }
  get hasPlaceholder() {
    return this._snippets[0].hasPlaceholder;
  }
  get hasChoice() {
    return this._snippets[0].hasChoice;
  }
  get activeChoice() {
    return this._snippets[0].activeChoice;
  }
  isSelectionWithinPlaceholders() {
    if (!this.hasPlaceholder) {
      return false;
    }
    const selections = this._editor.getSelections();
    if (selections.length < this._snippets.length) {
      return false;
    }
    const allPossibleSelections = /* @__PURE__ */ new Map();
    for (const snippet of this._snippets) {
      const possibleSelections = snippet.computePossibleSelections();
      if (allPossibleSelections.size === 0) {
        for (const [index2, ranges] of possibleSelections) {
          ranges.sort(Range2.compareRangesUsingStarts);
          for (const selection of selections) {
            if (ranges[0].containsRange(selection)) {
              allPossibleSelections.set(index2, []);
              break;
            }
          }
        }
      }
      if (allPossibleSelections.size === 0) {
        return false;
      }
      allPossibleSelections.forEach((array3, index2) => {
        array3.push(...possibleSelections.get(index2));
      });
    }
    selections.sort(Range2.compareRangesUsingStarts);
    for (const [index2, ranges] of allPossibleSelections) {
      if (ranges.length !== selections.length) {
        allPossibleSelections.delete(index2);
        continue;
      }
      ranges.sort(Range2.compareRangesUsingStarts);
      for (let i2 = 0; i2 < ranges.length; i2++) {
        if (!ranges[i2].containsRange(selections[i2])) {
          allPossibleSelections.delete(index2);
          continue;
        }
      }
    }
    return allPossibleSelections.size > 0;
  }
  getEnclosingRange() {
    let result;
    for (const snippet of this._snippets) {
      const snippetRange = snippet.getEnclosingRange();
      if (!result) {
        result = snippetRange;
      } else {
        result = result.plusRange(snippetRange);
      }
    }
    return result;
  }
};

SnippetSession = __decorateClass([
  __decorateParam(3, ILanguageConfigurationService)
], SnippetSession);
export { OneSnippet, _defaultOptions, SnippetSession };
