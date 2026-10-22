// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/changes/browser/sessionChangesEditor.ts
import { ResourceLabel } from "./module-1322.mjs";
import { getChangesEditorFileStats } from "./module-3730.mjs";
import { MenuItemAction } from "./module-0092.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ICommandService } from "./module-0087.mjs";
import { IChangesViewService } from "./module-3645.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { Disposable, DisposableStore, MutableDisposable } from "./module-0012.mjs";
import { observableValue } from "./module-0048.mjs";
import { $, Dimension, append } from "./module-0075.mjs";
import { autorun } from "./module-0052.mjs";
import { localize } from "./module-0001.mjs";
import { AbstractEditorWithViewState } from "./module-1091.mjs";
import { derivedObservableWithCache } from "./module-0059.mjs";
import { isEqual2 } from "./module-0034.mjs";
import { MultiDiffEditorLogger } from "./module-2439.mjs";
import { SessionChangesEditorInput } from "./module-3586.mjs";
import { bindContextKey } from "./module-0444.mjs";
import { ActiveSessionContextKeys } from "./module-3620.mjs";
import { ChatContextKeys } from "./module-0966.mjs";
import { ServiceCollection } from "./module-0440.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { MultiDiffEditorWidget } from "./module-2441.mjs";
import { MenuWorkbenchToolBar } from "./module-0519.mjs";
import { Menus } from "./module-3437.mjs";
import { ChangesActionsBar } from "./module-3737.mjs";
import { Range2 } from "./module-0106.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { IThemeService } from "./module-0287.mjs";
import { IStorageService } from "./module-0512.mjs";
import { ITextResourceConfigurationService } from "./module-0204.mjs";
import { IEditorService } from "./module-0935.mjs";
import { IEditorGroupsService } from "./module-0934.mjs";
import { IAgentWorkbenchLayoutService } from "./module-3474.mjs";
import { ISessionChangesService } from "./module-3646.mjs";
import { IDiffEditorOptionsService } from "./module-3738.mjs";
import { ILogService } from "./module-0095.mjs";
import { CheckboxActionViewItem } from "./module-0549.mjs";
import { defaultCheckboxStyles } from "./module-0513.mjs";


// src/vs/sessions/contrib/changes/browser/sessionChangesEditor.ts
var HEADER_HEIGHT3 = 35;

var CHANGES_DIFF_EDITOR_OPTIONS = {
  hideOriginalLineNumbers: true,
  folding: false,
  lineNumbersMinChars: 3
};

var SessionChangesUIElementFactory = class {
  constructor(changesObs, commandService, changesViewService, instantiationService) {
    this.changesObs = changesObs;
    this.commandService = commandService;
    this.changesViewService = changesViewService;
    this.instantiationService = instantiationService;
    this.headerClickToCollapse = true;
  }
  createResourceLabel(element, kind) {
    const label3 = this.instantiationService.createInstance(ResourceLabel, element, {});
    const showDiffStats = kind === "primary" /* Primary */;
    return new SessionChangesResourceLabel(label3, element, showDiffStats, this.changesObs);
  }
  handleHeaderMiddleClick(resource) {
    if (this.changesViewService.activeSessionChangesetObs.get()?.capabilities?.review !== true) {
      return false;
    }
    if (!getChangesEditorFileStats(resource, this.changesViewService.activeSessionChangesObs.get())) {
      return false;
    }
    void this.commandService.executeCommand(CHANGESET_REVIEW_ACTION_ID, resource);
    return true;
  }
  createToolbarActionViewItem(action, options3) {
    if (action.id === CHANGESET_REVIEW_ACTION_ID && action instanceof MenuItemAction) {
      return this.instantiationService.createInstance(ChangesetReviewActionViewItem, action, options3);
    }
    return void 0;
  }
};

SessionChangesUIElementFactory = __decorateClass([
  __decorateParam(1, ICommandService),
  __decorateParam(2, IChangesViewService),
  __decorateParam(3, IInstantiationService)
], SessionChangesUIElementFactory);

var SessionChangesResourceLabel = class extends Disposable {
  constructor(label3, element, showDiffStats, changesObs) {
    super();
    this.label = label3;
    this.resource = observableValue(this, void 0);
    this._register(label3);
    if (showDiffStats) {
      const statsContainer = append(element, $(".session-changes-file-stats"));
      const added = append(statsContainer, $(".working-set-lines-added"));
      const removed = append(statsContainer, $(".working-set-lines-removed"));
      added.setAttribute("aria-hidden", "true");
      removed.setAttribute("aria-hidden", "true");
      this._register(autorun((reader) => {
        const resource = this.resource.read(reader);
        const stats = resource ? getChangesEditorFileStats(resource, changesObs.read(reader)) : void 0;
        statsContainer.style.display = stats ? "" : "none";
        if (stats) {
          added.textContent = `+${stats.insertions}`;
          removed.textContent = `-${stats.deletions}`;
          statsContainer.setAttribute("aria-label", localize(4301, null, stats.insertions, stats.deletions));
        } else {
          added.textContent = "";
          removed.textContent = "";
          statsContainer.removeAttribute("aria-label");
        }
      }));
    }
  }
  setUri(uri4, options3 = {}) {
    if (!uri4) {
      this.label.element.clear();
    } else {
      this.label.element.setFile(uri4, { strikethrough: options3.strikethrough });
    }
    this.resource.set(uri4, void 0);
  }
};

var SessionChangesEditor = class extends AbstractEditorWithViewState {
  constructor(group2, telemetryService, themeService, storageService, instantiationService, textResourceConfigurationService, editorService, editorGroupService, contextKeyService, changesViewService, layoutService, sessionChangesService, diffEditorOptionsService, logService) {
    super(
      SessionChangesEditor.ID,
      group2,
      "sessionChangesEditorViewState",
      telemetryService,
      instantiationService,
      storageService,
      textResourceConfigurationService,
      themeService,
      editorService,
      editorGroupService
    );
    this.contextKeyService = contextKeyService;
    this.changesViewService = changesViewService;
    this.layoutService = layoutService;
    this.sessionChangesService = sessionChangesService;
    this.diffEditorOptionsService = diffEditorOptionsService;
    this._singlePane = false;
    /** Session whose changes this editor is currently showing (from its input). */
    this._inputSessionResource = observableValue(this, void 0);
    /**
     * Changes for this editor's own session, scoped so a stale row does not pick
     * up the counts of a different (globally active) session during a switch.
     */
    this._scopedChangesObs = derivedObservableWithCache(this, (reader, lastValue) => {
      const editorSession = this._inputSessionResource.read(reader);
      const activeSession = this.changesViewService.activeSessionResourceObs.read(reader);
      if (!editorSession || !activeSession || !isEqual2(editorSession, activeSession)) {
        return lastValue ?? [];
      }
      return this.changesViewService.activeSessionChangesObs.read(reader);
    });
    /** Deferred focus request awaiting the active diff editor to be rendered. */
    this._pendingFocus = this._register(new MutableDisposable());
    this._logger = this._register(new MultiDiffEditorLogger(logService));
  }
  static {
    this.ID = SessionChangesEditorInput.EDITOR_ID;
  }
  createEditor(parent) {
    const root = append(parent, $(".session-changes-editor"));
    const scopedContextKeyService = this._register(this.contextKeyService.createScoped(root));
    this._register(bindContextKey(ActiveSessionContextKeys.HasGitRepository, scopedContextKeyService, (reader) => this.changesViewService.activeSessionHasGitRepositoryObs.read(reader)));
    this._register(bindContextKey(ChatContextKeys.hasAgentSessionChanges, scopedContextKeyService, (reader) => this.changesViewService.activeSessionChangesObs.read(reader).length > 0));
    const scopedInstantiationService = this._register(this.instantiationService.createChild(
      new ServiceCollection([IContextKeyService, scopedContextKeyService])
    ));
    this._scopedInstantiationService = scopedInstantiationService;
    this._singlePane = this.layoutService.isSinglePaneLayoutEnabled;
    if (!this._singlePane) {
      const header2 = append(root, $(".session-changes-editor-header"));
      const left = append(header2, $(".session-changes-editor-header-left"));
      const right = append(header2, $(".session-changes-editor-header-right"));
      this._register(this._buildHeaderToolbars(left, right, scopedInstantiationService));
    }
    this.bodyContainer = append(root, $(".session-changes-editor-body"));
    const paneInstantiationService = this._register(this.instantiationService.createChild(
      new ServiceCollection([IContextKeyService, this.contextKeyService])
    ));
    this.widget = this._register(paneInstantiationService.createInstance(
      MultiDiffEditorWidget,
      this.bodyContainer,
      paneInstantiationService.createInstance(SessionChangesUIElementFactory, this._scopedChangesObs),
      CHANGES_DIFF_EDITOR_OPTIONS
    ));
    this._register(autorun((reader) => {
      this.widget?.setRenderSideBySide(this.diffEditorOptionsService.renderSideBySide.read(reader), { useInlineViewWhenSpaceIsLimited: true });
    }));
  }
  /**
   * Resolves the diff editor and code editor showing the given file, mirroring
   * {@link MultiDiffEditor.tryGetCodeEditor} so file-toolbar actions can operate
   * on this editor and the plain multi-diff editor uniformly.
   */
  tryGetCodeEditor(resource) {
    return this.widget?.tryGetCodeEditor(resource);
  }
  getLayoutDebugState() {
    return this.widget.getLayoutDebugState();
  }
  /** Creates the classic (non-single-pane) internal header toolbars. */
  _buildHeaderToolbars(left, right, instantiationService) {
    const store = new DisposableStore();
    store.add(instantiationService.createInstance(MenuWorkbenchToolBar, left, Menus.SessionsEditorHeaderPrimary, {
      menuOptions: { shouldForwardArgs: true }
    }));
    store.add(instantiationService.createInstance(ChangesActionsBar, right));
    return store;
  }
  get scopedInstantiationService() {
    return this._singlePane ? this._scopedInstantiationService : void 0;
  }
  async setInput(input, options3, context2, token) {
    await super.setInput(input, options3, context2, token);
    const sessionResource = this.sessionChangesService.getSessionResource(input.multiDiffSource);
    this._inputSessionResource.set(sessionResource, void 0);
    const viewModel = await input.getViewModel();
    if (token.isCancellationRequested) {
      return;
    }
    this.viewModel = viewModel;
    const viewState = this.loadEditorViewState(input, context2);
    this._logger.log("changes editor set input", {
      session: sessionResource,
      preserveFocus: !!options3?.preserveFocus,
      hasPersistedViewState: !!viewState
    });
    this.widget?.setViewModel(viewModel, { preserveFocus: options3?.preserveFocus, viewState });
    this._applyOptions(options3);
  }
  setEditorVisible(visible) {
    if (!visible) {
      this._pendingFocus.clear();
      this._logger.log("changes editor hidden, saving view state");
      this.saveCurrentEditorViewState();
    }
    super.setEditorVisible(visible);
  }
  computeEditorViewState(_resource) {
    if (!this.viewModel) {
      this._logger.log("skipped computing view state, no view model loaded");
      return void 0;
    }
    return this.widget?.getViewState();
  }
  tracksEditorViewState(input) {
    return input instanceof SessionChangesEditorInput;
  }
  tracksDisposedEditorViewState() {
    return true;
  }
  toEditorViewStateResource(input) {
    return input instanceof SessionChangesEditorInput ? input.multiDiffSource : void 0;
  }
  collapseAllDiffs() {
    this.viewModel?.collapseAll();
  }
  expandAllDiffs() {
    this.viewModel?.expandAll();
  }
  collapse(resource) {
    const item = this.viewModel?.items.read(void 0).find((i2) => isEqual2(i2.modifiedUri, resource) || isEqual2(i2.originalUri, resource));
    if (!item) {
      return;
    }
    this.viewModel?.collapse(item);
  }
  expand(resource) {
    const item = this.viewModel?.items.read(void 0).find((i2) => isEqual2(i2.modifiedUri, resource) || isEqual2(i2.originalUri, resource));
    if (!item) {
      return;
    }
    this.viewModel?.expand(item);
  }
  setOptions(options3) {
    this._applyOptions(options3);
  }
  _applyOptions(options3) {
    const revealData = options3?.viewState?.revealData;
    if (!revealData) {
      return;
    }
    this.widget?.reveal(revealData.resource, {
      range: revealData.range ? Range2.lift(revealData.range) : void 0,
      highlight: true
    });
  }
  clearInput() {
    const input = this.input;
    this._pendingFocus.clear();
    this._logger.log("changes editor clear input");
    super.clearInput();
    this.viewModel = void 0;
    this.widget?.setViewModel(void 0);
    if (input instanceof SessionChangesEditorInput) {
      input.clear();
    }
  }
  focus() {
    super.focus();
    this._pendingFocus.clear();
    const widget = this.widget;
    if (!widget) {
      return;
    }
    const control = widget.getActiveControl();
    if (control) {
      control.focus();
      return;
    }
    this._pendingFocus.value = widget.onDidChangeActiveControl(() => {
      const activeControl = widget.getActiveControl();
      if (activeControl) {
        this._pendingFocus.clear();
        activeControl.focus();
      }
    });
  }
  layout(dimension) {
    const bodyHeight = this._singlePane ? dimension.height : Math.max(0, dimension.height - HEADER_HEIGHT3);
    this.widget?.layout(new Dimension(dimension.width, bodyHeight));
  }
};

SessionChangesEditor = __decorateClass([
  __decorateParam(1, ITelemetryService),
  __decorateParam(2, IThemeService),
  __decorateParam(3, IStorageService),
  __decorateParam(4, IInstantiationService),
  __decorateParam(5, ITextResourceConfigurationService),
  __decorateParam(6, IEditorService),
  __decorateParam(7, IEditorGroupsService),
  __decorateParam(8, IContextKeyService),
  __decorateParam(9, IChangesViewService),
  __decorateParam(10, IAgentWorkbenchLayoutService),
  __decorateParam(11, ISessionChangesService),
  __decorateParam(12, IDiffEditorOptionsService),
  __decorateParam(13, ILogService)
], SessionChangesEditor);

var CHANGESET_REVIEW_ACTION_ID = "changeset.review";

var ChangesetReviewActionViewItem = class extends CheckboxActionViewItem {
  constructor(action, options3) {
    super(void 0, action, { ...options3, label: true, checkboxStyles: { ...defaultCheckboxStyles, size: 14 } });
  }
  render(container2) {
    super.render(container2);
    container2.classList.add("changeset-review-action");
  }
  updateChecked() {
    super.updateChecked();
    this.updateAriaLabel();
    this.updateTooltip();
  }
  getTooltip() {
    return this.action.checked ? localize(4300, null) : localize(4299, null);
  }
};
export { HEADER_HEIGHT3, CHANGES_DIFF_EDITOR_OPTIONS, SessionChangesUIElementFactory, SessionChangesResourceLabel, SessionChangesEditor, CHANGESET_REVIEW_ACTION_ID, ChangesetReviewActionViewItem };
