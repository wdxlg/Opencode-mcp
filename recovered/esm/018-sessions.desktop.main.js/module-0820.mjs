// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/contrib/linkedEditing/browser/linkedEditing.ts
import { ContextKeyExpr, IContextKeyService, RawContextKey } from "./module-0089.mjs";
import { Disposable, DisposableStore } from "./module-0012.mjs";
import { ModelDecorationOptions } from "./module-0423.mjs";
import { Event2 } from "./module-0017.mjs";
import { Delayer, first } from "./module-0036.mjs";
import { commonPrefixLength2, commonSuffixLength } from "./module-0030.mjs";
import { Range2 } from "./module-0106.mjs";
import { CancellationToken, CancellationTokenSource } from "./module-0025.mjs";
import { StopWatch } from "./module-0016.mjs";
import { isCancellationError, onUnexpectedError, onUnexpectedExternalError } from "./module-0004.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ILanguageFeaturesService } from "./module-0205.mjs";
import { ILanguageConfigurationService } from "./module-0143.mjs";
import { ILanguageFeatureDebounceService } from "./module-0572.mjs";
import { EditorAction, EditorCommand, registerEditorAction, registerEditorCommand, registerEditorContribution, registerModelAndPositionCommand } from "./module-0097.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { EditorContextKeys } from "./module-0154.mjs";
import { ICodeEditorService } from "./module-0078.mjs";
import { URI } from "./module-0032.mjs";
import { Position } from "./module-0079.mjs";
import { isNonEmptyArray } from "./module-0007.mjs";
import { registerColor } from "./module-0226.mjs";
import { Color } from "./module-0197.mjs";


// src/vs/editor/contrib/linkedEditing/browser/linkedEditing.ts
var CONTEXT_ONTYPE_RENAME_INPUT_VISIBLE = new RawContextKey("LinkedEditingInputVisible", false);

var DECORATION_CLASS_NAME2 = "linked-editing-decoration";

var LinkedEditingContribution = class extends Disposable {
  constructor(editor, contextKeyService, languageFeaturesService, languageConfigurationService, languageFeatureDebounceService) {
    super();
    this.languageConfigurationService = languageConfigurationService;
    // The one at index 0 is the reference one
    this._syncRangesToken = 0;
    this._localToDispose = this._register(new DisposableStore());
    this._editor = editor;
    this._providers = languageFeaturesService.linkedEditingRangeProvider;
    this._enabled = false;
    this._visibleContextKey = CONTEXT_ONTYPE_RENAME_INPUT_VISIBLE.bindTo(contextKeyService);
    this._debounceInformation = languageFeatureDebounceService.for(this._providers, "Linked Editing", { max: 200 });
    this._currentDecorations = this._editor.createDecorationsCollection();
    this._languageWordPattern = null;
    this._currentWordPattern = null;
    this._ignoreChangeEvent = false;
    this._localToDispose = this._register(new DisposableStore());
    this._rangeUpdateTriggerPromise = null;
    this._rangeSyncTriggerPromise = null;
    this._currentRequestCts = null;
    this._currentRequestPosition = null;
    this._currentRequestModelVersion = null;
    this._register(this._editor.onDidChangeModel(() => this.reinitialize(true)));
    this._register(this._editor.onDidChangeConfiguration((e4) => {
      if (e4.hasChanged(78 /* linkedEditing */) || e4.hasChanged(106 /* renameOnType */)) {
        this.reinitialize(false);
      }
    }));
    this._register(this._providers.onDidChange(() => this.reinitialize(false)));
    this._register(this._editor.onDidChangeModelLanguage(() => this.reinitialize(true)));
    this.reinitialize(true);
  }
  static {
    this.ID = "editor.contrib.linkedEditing";
  }
  static {
    this.DECORATION = ModelDecorationOptions.register({
      description: "linked-editing",
      stickiness: 0 /* AlwaysGrowsWhenTypingAtEdges */,
      className: DECORATION_CLASS_NAME2
    });
  }
  static get(editor) {
    return editor.getContribution(LinkedEditingContribution.ID);
  }
  reinitialize(forceRefresh) {
    const model = this._editor.getModel();
    const isEnabled = model !== null && (this._editor.getOption(78 /* linkedEditing */) || this._editor.getOption(106 /* renameOnType */)) && this._providers.has(model);
    if (isEnabled === this._enabled && !forceRefresh) {
      return;
    }
    this._enabled = isEnabled;
    this.clearRanges();
    this._localToDispose.clear();
    if (!isEnabled || model === null) {
      return;
    }
    this._localToDispose.add(
      Event2.runAndSubscribe(
        model.onDidChangeLanguageConfiguration,
        () => {
          this._languageWordPattern = this.languageConfigurationService.getLanguageConfiguration(model.getLanguageId()).getWordDefinition();
        }
      )
    );
    const rangeUpdateScheduler = new Delayer(this._debounceInformation.get(model));
    const triggerRangeUpdate = () => {
      this._rangeUpdateTriggerPromise = rangeUpdateScheduler.trigger(() => this.updateRanges(), this._debounceDuration ?? this._debounceInformation.get(model));
    };
    const rangeSyncScheduler = new Delayer(0);
    const triggerRangeSync = (token) => {
      this._rangeSyncTriggerPromise = rangeSyncScheduler.trigger(() => this._syncRanges(token));
    };
    this._localToDispose.add(this._editor.onDidChangeCursorPosition(() => {
      triggerRangeUpdate();
    }));
    this._localToDispose.add(this._editor.onDidChangeModelContent((e4) => {
      if (!this._ignoreChangeEvent) {
        if (this._currentDecorations.length > 0) {
          const referenceRange = this._currentDecorations.getRange(0);
          if (referenceRange && e4.changes.every((c) => referenceRange.intersectRanges(c.range))) {
            triggerRangeSync(this._syncRangesToken);
            return;
          }
        }
      }
      triggerRangeUpdate();
    }));
    this._localToDispose.add({
      dispose: () => {
        rangeUpdateScheduler.dispose();
        rangeSyncScheduler.dispose();
      }
    });
    this.updateRanges();
  }
  _syncRanges(token) {
    if (!this._editor.hasModel() || token !== this._syncRangesToken || this._currentDecorations.length === 0) {
      return;
    }
    const model = this._editor.getModel();
    const referenceRange = this._currentDecorations.getRange(0);
    if (!referenceRange || referenceRange.startLineNumber !== referenceRange.endLineNumber) {
      return this.clearRanges();
    }
    const referenceValue = model.getValueInRange(referenceRange);
    if (this._currentWordPattern) {
      const match2 = referenceValue.match(this._currentWordPattern);
      const matchLength = match2 ? match2[0].length : 0;
      if (matchLength !== referenceValue.length) {
        return this.clearRanges();
      }
    }
    const edits = [];
    for (let i2 = 1, len = this._currentDecorations.length; i2 < len; i2++) {
      const mirrorRange = this._currentDecorations.getRange(i2);
      if (!mirrorRange) {
        continue;
      }
      if (mirrorRange.startLineNumber !== mirrorRange.endLineNumber) {
        edits.push({
          range: mirrorRange,
          text: referenceValue
        });
      } else {
        let oldValue = model.getValueInRange(mirrorRange);
        let newValue = referenceValue;
        let rangeStartColumn = mirrorRange.startColumn;
        let rangeEndColumn = mirrorRange.endColumn;
        const commonPrefixLength3 = commonPrefixLength2(oldValue, newValue);
        rangeStartColumn += commonPrefixLength3;
        oldValue = oldValue.substr(commonPrefixLength3);
        newValue = newValue.substr(commonPrefixLength3);
        const commonSuffixLength2 = commonSuffixLength(oldValue, newValue);
        rangeEndColumn -= commonSuffixLength2;
        oldValue = oldValue.substr(0, oldValue.length - commonSuffixLength2);
        newValue = newValue.substr(0, newValue.length - commonSuffixLength2);
        if (rangeStartColumn !== rangeEndColumn || newValue.length !== 0) {
          edits.push({
            range: new Range2(mirrorRange.startLineNumber, rangeStartColumn, mirrorRange.endLineNumber, rangeEndColumn),
            text: newValue
          });
        }
      }
    }
    if (edits.length === 0) {
      return;
    }
    try {
      this._editor.popUndoStop();
      this._ignoreChangeEvent = true;
      const prevEditOperationType = this._editor._getViewModel().getPrevEditOperationType();
      this._editor.executeEdits("linkedEditing", edits);
      this._editor._getViewModel().setPrevEditOperationType(prevEditOperationType);
    } finally {
      this._ignoreChangeEvent = false;
    }
  }
  dispose() {
    this.clearRanges();
    super.dispose();
  }
  clearRanges() {
    this._visibleContextKey.set(false);
    this._currentDecorations.clear();
    if (this._currentRequestCts) {
      this._currentRequestCts.cancel();
      this._currentRequestCts = null;
      this._currentRequestPosition = null;
    }
  }
  get currentUpdateTriggerPromise() {
    return this._rangeUpdateTriggerPromise || Promise.resolve();
  }
  get currentSyncTriggerPromise() {
    return this._rangeSyncTriggerPromise || Promise.resolve();
  }
  async updateRanges(force = false) {
    if (!this._editor.hasModel()) {
      this.clearRanges();
      return;
    }
    const position2 = this._editor.getPosition();
    if (!this._enabled && !force || this._editor.getSelections().length > 1) {
      this.clearRanges();
      return;
    }
    const model = this._editor.getModel();
    const modelVersionId = model.getVersionId();
    if (this._currentRequestPosition && this._currentRequestModelVersion === modelVersionId) {
      if (position2.equals(this._currentRequestPosition)) {
        return;
      }
      if (this._currentDecorations.length > 0) {
        const range2 = this._currentDecorations.getRange(0);
        if (range2 && range2.containsPosition(position2)) {
          return;
        }
      }
    }
    if (!this._currentRequestPosition?.equals(position2)) {
      const currentRange = this._currentDecorations.getRange(0);
      if (!currentRange?.containsPosition(position2)) {
        this.clearRanges();
      }
    }
    this._currentRequestPosition = position2;
    this._currentRequestModelVersion = modelVersionId;
    const currentRequestCts = this._currentRequestCts = new CancellationTokenSource();
    try {
      const sw = new StopWatch(false);
      const response = await getLinkedEditingRanges(this._providers, model, position2, currentRequestCts.token);
      this._debounceInformation.update(model, sw.elapsed());
      if (currentRequestCts !== this._currentRequestCts) {
        return;
      }
      this._currentRequestCts = null;
      if (modelVersionId !== model.getVersionId()) {
        return;
      }
      let ranges = [];
      if (response?.ranges) {
        ranges = response.ranges;
      }
      this._currentWordPattern = response?.wordPattern || this._languageWordPattern;
      let foundReferenceRange = false;
      for (let i2 = 0, len = ranges.length; i2 < len; i2++) {
        if (Range2.containsPosition(ranges[i2], position2)) {
          foundReferenceRange = true;
          if (i2 !== 0) {
            const referenceRange = ranges[i2];
            ranges.splice(i2, 1);
            ranges.unshift(referenceRange);
          }
          break;
        }
      }
      if (!foundReferenceRange) {
        this.clearRanges();
        return;
      }
      const decorations = ranges.map((range2) => ({ range: range2, options: LinkedEditingContribution.DECORATION }));
      this._visibleContextKey.set(true);
      this._currentDecorations.set(decorations);
      this._syncRangesToken++;
    } catch (err) {
      if (!isCancellationError(err)) {
        onUnexpectedError(err);
      }
      if (this._currentRequestCts === currentRequestCts || !this._currentRequestCts) {
        this.clearRanges();
      }
    }
  }
  // for testing
  setDebounceDuration(timeInMS) {
    this._debounceDuration = timeInMS;
  }
  // private printDecorators(model: ITextModel) {
  // 	return this._currentDecorations.map(d => {
  // 		const range = model.getDecorationRange(d);
  // 		if (range) {
  // 			return this.printRange(range);
  // 		}
  // 		return 'invalid';
  // 	}).join(',');
  // }
  // private printChanges(changes: IModelContentChange[]) {
  // 	return changes.map(c => {
  // 		return `${this.printRange(c.range)} - ${c.text}`;
  // 	}
  // 	).join(',');
  // }
  // private printRange(range: IRange) {
  // 	return `${range.startLineNumber},${range.startColumn}/${range.endLineNumber},${range.endColumn}`;
  // }
};

LinkedEditingContribution = __decorateClass([
  __decorateParam(1, IContextKeyService),
  __decorateParam(2, ILanguageFeaturesService),
  __decorateParam(3, ILanguageConfigurationService),
  __decorateParam(4, ILanguageFeatureDebounceService)
], LinkedEditingContribution);

var LinkedEditingAction = class extends EditorAction {
  constructor() {
    super({
      id: "editor.action.linkedEditing",
      label: localize2(1461, "Start Linked Editing"),
      precondition: ContextKeyExpr.and(EditorContextKeys.writable, EditorContextKeys.hasRenameProvider),
      kbOpts: {
        kbExpr: EditorContextKeys.editorTextFocus,
        primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 60 /* F2 */,
        weight: 100 /* EditorContrib */
      }
    });
  }
  runCommand(accessor, args2) {
    const editorService = accessor.get(ICodeEditorService);
    const [uri4, pos] = Array.isArray(args2) && args2 || [void 0, void 0];
    if (URI.isUri(uri4) && Position.isIPosition(pos)) {
      return editorService.openCodeEditor({ resource: uri4 }, editorService.getActiveCodeEditor()).then((editor) => {
        if (!editor) {
          return;
        }
        editor.setPosition(pos);
        editor.invokeWithinContext((accessor2) => {
          this.reportTelemetry(accessor2, editor);
          return this.run(accessor2, editor);
        });
      }, onUnexpectedError);
    }
    return super.runCommand(accessor, args2);
  }
  run(_accessor, editor) {
    const controller = LinkedEditingContribution.get(editor);
    if (controller) {
      return Promise.resolve(controller.updateRanges(true));
    }
    return Promise.resolve();
  }
};

var LinkedEditingCommand = EditorCommand.bindToContribution(LinkedEditingContribution.get);

registerEditorCommand(new LinkedEditingCommand({
  id: "cancelLinkedEditingInput",
  precondition: CONTEXT_ONTYPE_RENAME_INPUT_VISIBLE,
  handler: (x) => x.clearRanges(),
  kbOpts: {
    kbExpr: EditorContextKeys.editorTextFocus,
    weight: 100 /* EditorContrib */ + 99,
    primary: 9 /* Escape */,
    secondary: [1024 /* Shift */ | 9 /* Escape */]
  }
}));

function getLinkedEditingRanges(providers2, model, position2, token) {
  const orderedByScore = providers2.ordered(model);
  return first(orderedByScore.map((provider) => async () => {
    try {
      return await provider.provideLinkedEditingRanges(model, position2, token);
    } catch (e4) {
      onUnexpectedExternalError(e4);
      return void 0;
    }
  }), (result) => !!result && isNonEmptyArray(result?.ranges));
}

var editorLinkedEditingBackground = registerColor("editor.linkedEditingBackground", { dark: Color.fromHex("#f00").transparent(0.3), light: Color.fromHex("#f00").transparent(0.3), hcDark: Color.fromHex("#f00").transparent(0.3), hcLight: Color.white }, localize(1460, null));

registerModelAndPositionCommand("_executeLinkedEditingProvider", (_accessor, model, position2) => {
  const { linkedEditingRangeProvider } = _accessor.get(ILanguageFeaturesService);
  return getLinkedEditingRanges(linkedEditingRangeProvider, model, position2, CancellationToken.None);
});

registerEditorContribution(LinkedEditingContribution.ID, LinkedEditingContribution, 1 /* AfterFirstRender */);

registerEditorAction(LinkedEditingAction);
export { getLinkedEditingRanges, CONTEXT_ONTYPE_RENAME_INPUT_VISIBLE, DECORATION_CLASS_NAME2, LinkedEditingContribution, LinkedEditingAction, LinkedEditingCommand, editorLinkedEditingBackground };
