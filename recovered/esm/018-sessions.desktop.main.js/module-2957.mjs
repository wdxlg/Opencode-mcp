// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/scm/browser/quickDiffDecorator.ts
import { ContextKeyFalseExpr, ContextKeyTrueExpr, IContextKeyService, RawContextKey } from "./module-0089.mjs";
import { Disposable, DisposableMap, DisposableStore } from "./module-0012.mjs";
import { localize } from "./module-0001.mjs";
import { IQuickDiffService, getChangeType, minimapGutterAddedBackground, minimapGutterDeletedBackground, minimapGutterModifiedBackground, overviewRulerAddedForeground, overviewRulerDeletedForeground, overviewRulerModifiedForeground } from "./module-1080.mjs";
import { Event2 } from "./module-0017.mjs";
import { themeColorFromId2 } from "./module-0287.mjs";
import { ModelDecorationOptions } from "./module-0423.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { ResourceMap } from "./module-0008.mjs";
import { createStyleSheet } from "./module-0224.mjs";
import { observableFromEvent } from "./module-0057.mjs";
import { autorun } from "./module-0052.mjs";
import { isCodeEditor } from "./module-0223.mjs";
import { Action2, MenuId, registerAction2 } from "./module-0092.mjs";
import { IEditorService } from "./module-0935.mjs";
import { IQuickDiffModelService } from "./module-1083.mjs";
import { IUriIdentityService } from "./module-0510.mjs";


// src/vs/workbench/contrib/scm/browser/quickDiffDecorator.ts
var quickDiffDecorationCount = new RawContextKey("quickDiffDecorationCount", 0);

var QuickDiffDecorator = class extends Disposable {
  constructor(codeEditor, quickDiffModelRef, configurationService, quickDiffService) {
    super();
    this.codeEditor = codeEditor;
    this.quickDiffModelRef = quickDiffModelRef;
    this.configurationService = configurationService;
    this.quickDiffService = quickDiffService;
    const decorations = configurationService.getValue("scm.diffDecorations");
    const gutter = decorations === "all" || decorations === "gutter";
    const overview = decorations === "all" || decorations === "overview";
    const minimap = decorations === "all" || decorations === "minimap";
    const diffAdded = localize(18744, null);
    const diffAddedOptions = {
      gutter,
      overview: { active: overview, color: overviewRulerAddedForeground },
      minimap: { active: minimap, color: minimapGutterAddedBackground },
      isWholeLine: true
    };
    this.addedOptions = QuickDiffDecorator.createDecoration("dirty-diff-added primary", diffAdded, diffAddedOptions);
    this.addedPatternOptions = QuickDiffDecorator.createDecoration("dirty-diff-added primary pattern", diffAdded, diffAddedOptions);
    this.addedSecondaryOptions = QuickDiffDecorator.createDecoration("dirty-diff-added secondary", diffAdded, diffAddedOptions);
    this.addedSecondaryPatternOptions = QuickDiffDecorator.createDecoration("dirty-diff-added secondary pattern", diffAdded, diffAddedOptions);
    const diffModified = localize(18746, null);
    const diffModifiedOptions = {
      gutter,
      overview: { active: overview, color: overviewRulerModifiedForeground },
      minimap: { active: minimap, color: minimapGutterModifiedBackground },
      isWholeLine: true
    };
    this.modifiedOptions = QuickDiffDecorator.createDecoration("dirty-diff-modified primary", diffModified, diffModifiedOptions);
    this.modifiedPatternOptions = QuickDiffDecorator.createDecoration("dirty-diff-modified primary pattern", diffModified, diffModifiedOptions);
    this.modifiedSecondaryOptions = QuickDiffDecorator.createDecoration("dirty-diff-modified secondary", diffModified, diffModifiedOptions);
    this.modifiedSecondaryPatternOptions = QuickDiffDecorator.createDecoration("dirty-diff-modified secondary pattern", diffModified, diffModifiedOptions);
    const diffDeleted = localize(18745, null);
    const diffDeletedOptions = {
      gutter,
      overview: { active: overview, color: overviewRulerDeletedForeground },
      minimap: { active: minimap, color: minimapGutterDeletedBackground },
      isWholeLine: false
    };
    this.deletedOptions = QuickDiffDecorator.createDecoration("dirty-diff-deleted primary", diffDeleted, diffDeletedOptions);
    this.deletedSecondaryOptions = QuickDiffDecorator.createDecoration("dirty-diff-deleted secondary", diffDeleted, diffDeletedOptions);
    this._register(configurationService.onDidChangeConfiguration((e4) => {
      if (e4.affectsConfiguration("scm.diffDecorationsGutterPattern")) {
        this.onDidChange();
      }
    }));
    this._register(Event2.runAndSubscribe(this.quickDiffModelRef.object.onDidChange, () => this.onDidChange()));
  }
  static createDecoration(className2, tooltip, options3) {
    const decorationOptions = {
      description: "dirty-diff-decoration",
      isWholeLine: options3.isWholeLine
    };
    if (options3.gutter) {
      decorationOptions.linesDecorationsClassName = `dirty-diff-glyph ${className2}`;
      decorationOptions.linesDecorationsTooltip = tooltip;
    }
    if (options3.overview.active) {
      decorationOptions.overviewRuler = {
        color: themeColorFromId2(options3.overview.color),
        position: 1 /* Left */
      };
    }
    if (options3.minimap.active) {
      decorationOptions.minimap = {
        color: themeColorFromId2(options3.minimap.color),
        position: 2 /* Gutter */
      };
    }
    return ModelDecorationOptions.createDynamic(decorationOptions);
  }
  onDidChange() {
    if (!this.codeEditor.hasModel()) {
      return;
    }
    const pattern = this.configurationService.getValue("scm.diffDecorationsGutterPattern");
    const primaryQuickDiff = this.quickDiffModelRef.object.quickDiffs.find((quickDiff) => quickDiff.kind === "primary");
    const primaryQuickDiffChanges = this.quickDiffModelRef.object.changes.filter((change) => change.providerId === primaryQuickDiff?.id);
    const decorations = [];
    for (const change of this.quickDiffModelRef.object.changes) {
      const quickDiff = this.quickDiffModelRef.object.quickDiffs.find((quickDiff2) => quickDiff2.id === change.providerId);
      if (!quickDiff || !this.quickDiffService.isQuickDiffProviderVisible(quickDiff.id)) {
        continue;
      }
      if (quickDiff.kind !== "primary" && primaryQuickDiffChanges.some((c) => c.change2.modified.intersectsOrTouches(change.change2.modified))) {
        continue;
      }
      const changeType = getChangeType(change.change);
      const startLineNumber = change.change.modifiedStartLineNumber;
      const endLineNumber = change.change.modifiedEndLineNumber || startLineNumber;
      switch (changeType) {
        case 1 /* Add */:
          decorations.push({
            range: {
              startLineNumber,
              startColumn: 1,
              endLineNumber,
              endColumn: 1
            },
            options: quickDiff.kind === "primary" || quickDiff.kind === "contributed" ? pattern.added ? this.addedPatternOptions : this.addedOptions : pattern.added ? this.addedSecondaryPatternOptions : this.addedSecondaryOptions
          });
          break;
        case 2 /* Delete */:
          decorations.push({
            range: {
              startLineNumber,
              startColumn: Number.MAX_VALUE,
              endLineNumber: startLineNumber,
              endColumn: Number.MAX_VALUE
            },
            options: quickDiff.kind === "primary" || quickDiff.kind === "contributed" ? this.deletedOptions : this.deletedSecondaryOptions
          });
          break;
        case 0 /* Modify */:
          decorations.push({
            range: {
              startLineNumber,
              startColumn: 1,
              endLineNumber,
              endColumn: 1
            },
            options: quickDiff.kind === "primary" || quickDiff.kind === "contributed" ? pattern.modified ? this.modifiedPatternOptions : this.modifiedOptions : pattern.modified ? this.modifiedSecondaryPatternOptions : this.modifiedSecondaryOptions
          });
          break;
      }
    }
    if (!this.decorationsCollection) {
      this.decorationsCollection = this.codeEditor.createDecorationsCollection(decorations);
    } else {
      this.decorationsCollection.set(decorations);
    }
  }
  dispose() {
    if (this.decorationsCollection) {
      this.decorationsCollection.clear();
    }
    this.decorationsCollection = void 0;
    this.quickDiffModelRef.dispose();
    super.dispose();
  }
};

QuickDiffDecorator = __decorateClass([
  __decorateParam(2, IConfigurationService),
  __decorateParam(3, IQuickDiffService)
], QuickDiffDecorator);

var QuickDiffWorkbenchController = class extends Disposable {
  constructor(editorService, configurationService, quickDiffModelService, quickDiffService, uriIdentityService, contextKeyService) {
    super();
    this.editorService = editorService;
    this.configurationService = configurationService;
    this.quickDiffModelService = quickDiffModelService;
    this.quickDiffService = quickDiffService;
    this.uriIdentityService = uriIdentityService;
    this.enabled = false;
    // Resource URI -> Code Editor Id -> Decoration (Disposable)
    this.decorators = new ResourceMap();
    this.viewState = { width: 3, visibility: "always" };
    this.transientDisposables = this._register(new DisposableStore());
    this.stylesheet = createStyleSheet(void 0, void 0, this._store);
    this.quickDiffDecorationCount = quickDiffDecorationCount.bindTo(contextKeyService);
    this.activeEditor = observableFromEvent(
      this,
      this.editorService.onDidActiveEditorChange,
      () => this.editorService.activeEditor
    );
    this.quickDiffProviders = observableFromEvent(
      this,
      this.quickDiffService.onDidChangeQuickDiffProviders,
      () => this.quickDiffService.providers
    );
    const onDidChangeConfiguration = Event2.filter(configurationService.onDidChangeConfiguration, (e4) => e4.affectsConfiguration("scm.diffDecorations"));
    this._register(onDidChangeConfiguration(this.onDidChangeConfiguration, this));
    this.onDidChangeConfiguration();
    const onDidChangeDiffWidthConfiguration = Event2.filter(configurationService.onDidChangeConfiguration, (e4) => e4.affectsConfiguration("scm.diffDecorationsGutterWidth"));
    this._register(onDidChangeDiffWidthConfiguration(this.onDidChangeDiffWidthConfiguration, this));
    this.onDidChangeDiffWidthConfiguration();
    const onDidChangeDiffVisibilityConfiguration = Event2.filter(configurationService.onDidChangeConfiguration, (e4) => e4.affectsConfiguration("scm.diffDecorationsGutterVisibility"));
    this._register(onDidChangeDiffVisibilityConfiguration(this.onDidChangeDiffVisibilityConfiguration, this));
    this.onDidChangeDiffVisibilityConfiguration();
  }
  onDidChangeConfiguration() {
    const enabled = this.configurationService.getValue("scm.diffDecorations") !== "none";
    if (enabled) {
      this.enable();
    } else {
      this.disable();
    }
  }
  onDidChangeDiffWidthConfiguration() {
    let width2 = this.configurationService.getValue("scm.diffDecorationsGutterWidth");
    if (isNaN(width2) || width2 <= 0 || width2 > 5) {
      width2 = 3;
    }
    this.setViewState({ ...this.viewState, width: width2 });
  }
  onDidChangeDiffVisibilityConfiguration() {
    const visibility = this.configurationService.getValue("scm.diffDecorationsGutterVisibility");
    this.setViewState({ ...this.viewState, visibility });
  }
  setViewState(state) {
    this.viewState = state;
    this.stylesheet.textContent = `
			.monaco-editor .dirty-diff-added,
			.monaco-editor .dirty-diff-modified {
				border-left-width:${state.width}px;
			}
			.monaco-editor .dirty-diff-added.pattern,
			.monaco-editor .dirty-diff-added.pattern:before,
			.monaco-editor .dirty-diff-modified.pattern,
			.monaco-editor .dirty-diff-modified.pattern:before {
				background-size: ${state.width}px ${state.width}px;
			}
			.monaco-editor .dirty-diff-added,
			.monaco-editor .dirty-diff-modified,
			.monaco-editor .dirty-diff-deleted {
				opacity: ${state.visibility === "always" ? 1 : 0};
			}
		`;
  }
  enable() {
    if (this.enabled) {
      this.disable();
    }
    this.transientDisposables.add(Event2.any(this.editorService.onDidCloseEditor, this.editorService.onDidVisibleEditorsChange)(() => this.onEditorsChanged()));
    this.onEditorsChanged();
    this.onDidActiveEditorChange();
    this.onDidChangeQuickDiffProviders();
    this.enabled = true;
  }
  disable() {
    if (!this.enabled) {
      return;
    }
    this.transientDisposables.clear();
    this.quickDiffDecorationCount.set(0);
    for (const [uri4, decoratorMap] of this.decorators.entries()) {
      decoratorMap.dispose();
      this.decorators.delete(uri4);
    }
    this.enabled = false;
  }
  onDidActiveEditorChange() {
    this.transientDisposables.add(autorun((reader) => {
      const activeEditor = this.activeEditor.read(reader);
      const activeTextEditorControl = this.editorService.activeTextEditorControl;
      if (!isCodeEditor(activeTextEditorControl) || !activeEditor?.resource) {
        this.quickDiffDecorationCount.set(0);
        return;
      }
      const quickDiffModelRef = this.quickDiffModelService.createQuickDiffModelReference(activeEditor.resource);
      if (!quickDiffModelRef) {
        this.quickDiffDecorationCount.set(0);
        return;
      }
      reader.store.add(quickDiffModelRef);
      const visibleDecorationCount = observableFromEvent(
        this,
        quickDiffModelRef.object.onDidChange,
        () => {
          const visibleQuickDiffs = quickDiffModelRef.object.quickDiffs.filter((quickDiff) => this.quickDiffService.isQuickDiffProviderVisible(quickDiff.id));
          return quickDiffModelRef.object.changes.filter((change) => visibleQuickDiffs.some((quickDiff) => quickDiff.id === change.providerId)).length;
        }
      );
      reader.store.add(autorun((reader2) => {
        const count2 = visibleDecorationCount.read(reader2);
        this.quickDiffDecorationCount.set(count2);
      }));
    }));
  }
  onDidChangeQuickDiffProviders() {
    this.transientDisposables.add(autorun((reader) => {
      const providers2 = this.quickDiffProviders.read(reader);
      const labels = [];
      for (let index2 = 0; index2 < providers2.length; index2++) {
        const provider = providers2[index2];
        if (labels.includes(provider.label)) {
          continue;
        }
        const visible = this.quickDiffService.isQuickDiffProviderVisible(provider.id);
        const group2 = provider.kind !== "contributed" ? "0_scm" : "1_contributed";
        const order = index2 + 1;
        reader.store.add(registerAction2(class extends Action2 {
          constructor() {
            super({
              id: `workbench.scm.action.toggleQuickDiffVisibility.${provider.id}`,
              title: provider.label,
              toggled: visible ? ContextKeyTrueExpr.INSTANCE : ContextKeyFalseExpr.INSTANCE,
              menu: {
                id: MenuId.SCMQuickDiffDecorations,
                group: group2,
                order
              },
              f1: false
            });
          }
          run(accessor) {
            const quickDiffService = accessor.get(IQuickDiffService);
            quickDiffService.toggleQuickDiffProviderVisibility(provider.id);
          }
        }));
        labels.push(provider.label);
      }
    }));
  }
  onEditorsChanged() {
    for (const editor of this.editorService.visibleTextEditorControls) {
      if (!isCodeEditor(editor)) {
        continue;
      }
      const textModel = editor.getModel();
      if (!textModel) {
        continue;
      }
      const editorId = editor.getId();
      if (this.decorators.get(textModel.uri)?.has(editorId)) {
        continue;
      }
      const quickDiffModelRef = this.quickDiffModelService.createQuickDiffModelReference(textModel.uri);
      if (!quickDiffModelRef) {
        continue;
      }
      if (!this.decorators.has(textModel.uri)) {
        this.decorators.set(textModel.uri, new DisposableMap());
      }
      this.decorators.get(textModel.uri).set(editorId, new QuickDiffDecorator(editor, quickDiffModelRef, this.configurationService, this.quickDiffService));
    }
    for (const [uri4, decoratorMap] of this.decorators.entries()) {
      for (const editorId of decoratorMap.keys()) {
        const codeEditor = this.editorService.visibleTextEditorControls.find((editor) => isCodeEditor(editor) && editor.getId() === editorId && this.uriIdentityService.extUri.isEqual(editor.getModel()?.uri, uri4));
        if (!codeEditor) {
          decoratorMap.deleteAndDispose(editorId);
        }
      }
      if (decoratorMap.size === 0) {
        decoratorMap.dispose();
        this.decorators.delete(uri4);
      }
    }
  }
  dispose() {
    this.disable();
    super.dispose();
  }
};

QuickDiffWorkbenchController = __decorateClass([
  __decorateParam(0, IEditorService),
  __decorateParam(1, IConfigurationService),
  __decorateParam(2, IQuickDiffModelService),
  __decorateParam(3, IQuickDiffService),
  __decorateParam(4, IUriIdentityService),
  __decorateParam(5, IContextKeyService)
], QuickDiffWorkbenchController);
export { quickDiffDecorationCount, QuickDiffDecorator, QuickDiffWorkbenchController };
