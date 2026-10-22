// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/testing/browser/codeCoverageDecorations.ts
import { localize, localize2 } from "./module-0001.mjs";
import { Disposable, DisposableStore, MutableDisposable, toDisposable } from "./module-0012.mjs";
import { observableValue } from "./module-0048.mjs";
import { Lazy } from "./module-0028.mjs";
import { observableFromEvent } from "./module-0057.mjs";
import { derived } from "./module-0054.mjs";
import { bindContextKey, observableConfigValue } from "./module-0444.mjs";
import { TestingContextKeys } from "./module-1428.mjs";
import { autorun } from "./module-0052.mjs";
import { Range2 } from "./module-0106.mjs";
import { mapFindFirst } from "./module-0006.mjs";
import { Position } from "./module-0079.mjs";
import { themeColorFromId2 } from "./module-0287.mjs";
import { testingCoveredMinimapBackground, testingUncoveredMinimapBackground } from "./module-3038.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { testingCoverageMissingBranch, testingCoverageReport, testingFilterIcon, testingRerunIcon } from "./module-3039.mjs";
import { CancellationTokenSource } from "./module-0025.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { ITestCoverageService } from "./module-3024.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { ILogService } from "./module-0095.mjs";
import { ContextKeyExpr, IContextKeyService } from "./module-0089.mjs";
import { MarkdownString } from "./module-0462.mjs";
import { assert, assertNever } from "./module-0009.mjs";
import { EventType, addStandardDisposableListener, h, reset } from "./module-0075.mjs";
import { ManagedTestCoverageBars } from "./module-3040.mjs";
import { ActionBar } from "./module-0477.mjs";
import { ActionViewItem } from "./module-0476.mjs";
import { Action2, MenuId, registerAction2 } from "./module-0092.mjs";
import { Codicon } from "./module-0085.mjs";
import { getLabelForItem, labels } from "./module-3037.mjs";
import { IContextMenuService } from "./module-0488.mjs";
import { ITestService } from "./module-1435.mjs";
import { IKeybindingService } from "./module-0352.mjs";
import { ICommandService } from "./module-0087.mjs";
import { Categories } from "./module-0847.mjs";
import { KeyChord } from "./module-0019.mjs";
import { getTestingConfiguration } from "./module-3023.mjs";
import { ActiveEditorContext } from "./module-0949.mjs";
import { TEXT_FILE_EDITOR_ID } from "./module-1542.mjs";
import { IQuickInputService } from "./module-0536.mjs";
import { isCodeEditor } from "./module-0223.mjs";
import { ICodeEditorService } from "./module-0078.mjs";
import { FileCoverage2 } from "./module-1425.mjs";
import { URI, isUriComponents } from "./module-0032.mjs";
import { TestId } from "./module-1207.mjs";
import { Action } from "./module-0082.mjs";
import { renderIcon } from "./module-0467.mjs";


// src/vs/workbench/contrib/testing/browser/codeCoverageDecorations.ts
var CLASS_HIT = "coverage-deco-hit";

var CLASS_MISS = "coverage-deco-miss";

var TOGGLE_INLINE_COMMAND_TEXT = localize(21011, null);

var TOGGLE_INLINE_COMMAND_ID = "testing.toggleInlineCoverage";

var BRANCH_MISS_INDICATOR_CHARS = 4;

var GO_TO_NEXT_MISSED_LINE_TITLE = localize2(21001, "Go to Next Uncovered Line");

var GO_TO_PREVIOUS_MISSED_LINE_TITLE = localize2(21003, "Go to Previous Uncovered Line");

var CodeCoverageDecorations = class extends Disposable {
  constructor(editor, instantiationService, coverage, configurationService, log4, contextKeyService) {
    super();
    this.editor = editor;
    this.coverage = coverage;
    this.log = log4;
    this.displayedStore = this._register(new DisposableStore());
    this.hoveredStore = this._register(new DisposableStore());
    this.decorationIds = /* @__PURE__ */ new Map();
    this.hasInlineCoverageDetails = observableValue("hasInlineCoverageDetails", false);
    this.summaryWidget = new Lazy(() => this._register(instantiationService.createInstance(CoverageToolbarWidget, this.editor)));
    const modelObs = observableFromEvent(this, editor.onDidChangeModel, () => editor.getModel());
    const configObs = observableFromEvent(this, editor.onDidChangeConfiguration, (i2) => i2);
    const fileCoverage = derived((reader) => {
      const report = coverage.selected.read(reader);
      if (!report) {
        return;
      }
      const model = modelObs.read(reader);
      if (!model) {
        return;
      }
      const file = report.getUri(model.uri);
      if (!file) {
        return;
      }
      report.didAddCoverage.read(reader);
      return { file, testId: coverage.filterToTest.read(reader) };
    });
    this._register(bindContextKey(
      TestingContextKeys.hasPerTestCoverage,
      contextKeyService,
      (reader) => !!fileCoverage.read(reader)?.file.perTestData?.size
    ));
    this._register(bindContextKey(
      TestingContextKeys.hasCoverageInFile,
      contextKeyService,
      (reader) => !!fileCoverage.read(reader)?.file
    ));
    this._register(bindContextKey(
      TestingContextKeys.hasInlineCoverageDetails,
      contextKeyService,
      (reader) => this.hasInlineCoverageDetails.read(reader)
    ));
    const minimapEnabled = observableConfigValue("testing.coverageMinimapEnabled" /* CoverageMinimapEnabled */, true, configurationService);
    this._register(autorun((reader) => {
      const c = fileCoverage.read(reader);
      if (c) {
        this.apply(editor.getModel(), c.file, c.testId, coverage.showInline.read(reader), minimapEnabled.read(reader));
      } else {
        this.clear();
      }
    }));
    const toolbarEnabled = observableConfigValue("testing.coverageToolbarEnabled" /* CoverageToolbarEnabled */, true, configurationService);
    this._register(autorun((reader) => {
      const c = fileCoverage.read(reader);
      if (c && toolbarEnabled.read(reader)) {
        this.summaryWidget.value.setCoverage(c.file, c.testId);
      } else {
        this.summaryWidget.rawValue?.clearCoverage();
      }
    }));
    this._register(autorun((reader) => {
      const c = fileCoverage.read(reader);
      if (c) {
        const evt = configObs.read(reader);
        if (evt?.hasChanged(75 /* lineHeight */) !== false) {
          this.updateEditorStyles();
        }
      }
    }));
    this._register(editor.onMouseMove((e) => {
      const model = editor.getModel();
      if (e.target.type === 3 /* GUTTER_LINE_NUMBERS */ && model) {
        this.hoverLineNumber(editor.getModel());
      } else if (coverage.showInline.get() && e.target.type === 6 /* CONTENT_TEXT */ && model) {
        this.hoverInlineDecoration(model, e.target.position);
      } else {
        this.hoveredStore.clear();
      }
    }));
    this._register(editor.onWillChangeModel(() => {
      const model = editor.getModel();
      if (!this.details || !model) {
        return;
      }
      for (const decoration3 of model.getAllDecorations()) {
        const own = this.decorationIds.get(decoration3.id);
        if (own) {
          own.detail.range = decoration3.range;
        }
      }
    }));
  }
  static {
    this.ID = "editor.contrib.coverageDecorations" /* CoverageDecorationsContributionId */;
  }
  updateEditorStyles() {
    const lineHeight = this.editor.getOption(75 /* lineHeight */);
    const { style } = this.editor.getContainerDomNode();
    style.setProperty("--vscode-testing-coverage-lineHeight", `${lineHeight}px`);
  }
  hoverInlineDecoration(model, position2) {
    const allDecorations = model.getDecorationsInRange(Range2.fromPositions(position2));
    const decoration3 = mapFindFirst(allDecorations, ({ id: id2 }) => this.decorationIds.has(id2) ? { id: id2, deco: this.decorationIds.get(id2) } : void 0);
    if (decoration3 === this.hoveredSubject) {
      return;
    }
    this.hoveredStore.clear();
    this.hoveredSubject = decoration3;
    if (!decoration3) {
      return;
    }
    model.changeDecorations((e) => {
      e.changeDecorationOptions(decoration3.id, {
        ...decoration3.deco.options,
        className: `${decoration3.deco.options.className} coverage-deco-hovered`
      });
    });
    this.hoveredStore.add(toDisposable(() => {
      this.hoveredSubject = void 0;
      model.changeDecorations((e) => {
        e.changeDecorationOptions(decoration3.id, decoration3.deco.options);
      });
    }));
  }
  hoverLineNumber(model) {
    if (this.hoveredSubject === "lineNo" || !this.details || this.coverage.showInline.get()) {
      return;
    }
    this.hoveredStore.clear();
    this.hoveredSubject = "lineNo";
    model.changeDecorations((e) => {
      for (const [id2, decoration3] of this.decorationIds) {
        const { applyHoverOptions, options: options3 } = decoration3;
        const dup = { ...options3 };
        applyHoverOptions(dup);
        e.changeDecorationOptions(id2, dup);
      }
    });
    this.hoveredStore.add(this.editor.onMouseLeave(() => {
      this.hoveredStore.clear();
    }));
    this.hoveredStore.add(toDisposable(() => {
      this.hoveredSubject = void 0;
      model.changeDecorations((e) => {
        for (const [id2, decoration3] of this.decorationIds) {
          e.changeDecorationOptions(id2, decoration3.options);
        }
      });
    }));
  }
  /**
   * Navigate to the next missed (uncovered) line from the current cursor position.
   * @returns true if navigation occurred, false if no missed line was found
   */
  goToNextMissedLine() {
    return this.navigateToMissedLine(true);
  }
  /**
   * Navigate to the previous missed (uncovered) line from the current cursor position.
   * @returns true if navigation occurred, false if no missed line was found
   */
  goToPreviousMissedLine() {
    return this.navigateToMissedLine(false);
  }
  navigateToMissedLine(next) {
    const model = this.editor.getModel();
    const position2 = this.editor.getPosition();
    if (!model || !position2 || !this.details) {
      return false;
    }
    const currentLine = position2.lineNumber;
    let closestBefore;
    let closestAfter;
    let firstMissed;
    let lastMissed;
    for (const [, { detail: detail2, options: options3 }] of this.decorationIds) {
      if (options3.lineNumberClassName?.includes(CLASS_MISS)) {
        const range2 = detail2.range;
        if (range2.isEmpty()) {
          continue;
        }
        const lineNumber = range2.startLineNumber;
        const missedLine = { lineNumber, range: range2 };
        if (!firstMissed || lineNumber < firstMissed.lineNumber) {
          firstMissed = missedLine;
        }
        if (!lastMissed || lineNumber > lastMissed.lineNumber) {
          lastMissed = missedLine;
        }
        if (lineNumber < currentLine) {
          if (!closestBefore || lineNumber > closestBefore.lineNumber) {
            closestBefore = missedLine;
          }
        } else if (lineNumber > currentLine) {
          if (!closestAfter || lineNumber < closestAfter.lineNumber) {
            closestAfter = missedLine;
          }
        }
      }
    }
    const targetLine = next ? closestAfter || firstMissed : closestBefore || lastMissed;
    if (targetLine) {
      this.editor.setPosition(new Position(targetLine.lineNumber, 1));
      this.editor.revealLineInCenter(targetLine.lineNumber);
      return true;
    }
    return false;
  }
  async apply(model, coverage, testId, showInlineByDefault, showMinimap) {
    const details = this.details = await this.loadDetails(coverage, testId, model);
    if (!details) {
      this.hasInlineCoverageDetails.set(false, void 0);
      return this.clear();
    }
    this.hasInlineCoverageDetails.set(details.ranges.length > 0, void 0);
    this.displayedStore.clear();
    model.changeDecorations((e) => {
      for (const detailRange of details.ranges) {
        const { metadata: { detail: detail2, description }, range: range2, primary } = detailRange;
        if (detail2.type === 2 /* Branch */) {
          const hits = detail2.detail.branches[detail2.branch].count;
          const cls = hits ? CLASS_HIT : CLASS_MISS;
          const showMissIndicator = !hits && range2.isEmpty() && detail2.detail.branches.some((b) => b.count);
          const options3 = {
            showIfCollapsed: showMissIndicator,
            // only avoid collapsing if we want to show the miss indicator
            description: "coverage-gutter",
            lineNumberClassName: `coverage-deco-gutter ${cls}`,
            minimap: showMinimap ? {
              color: themeColorFromId2(hits ? testingCoveredMinimapBackground : testingUncoveredMinimapBackground),
              position: 2 /* Gutter */
            } : void 0
          };
          const applyHoverOptions = (target) => {
            target.hoverMessage = description;
            if (showMissIndicator) {
              target.after = {
                content: "\xA0".repeat(BRANCH_MISS_INDICATOR_CHARS),
                // nbsp
                inlineClassName: `coverage-deco-branch-miss-indicator ${ThemeIcon.asClassName(testingCoverageMissingBranch)}`,
                inlineClassNameAffectsLetterSpacing: true,
                cursorStops: 3 /* None */
              };
            } else {
              target.className = `coverage-deco-inline ${cls}`;
              if (primary && typeof hits === "number") {
                target.before = countBadge(hits);
              }
            }
          };
          if (showInlineByDefault) {
            applyHoverOptions(options3);
          }
          this.decorationIds.set(e.addDecoration(range2, options3), { options: options3, applyHoverOptions, detail: detailRange });
        } else if (detail2.type === 1 /* Statement */) {
          const cls = detail2.count ? CLASS_HIT : CLASS_MISS;
          const options3 = {
            showIfCollapsed: false,
            description: "coverage-inline",
            lineNumberClassName: `coverage-deco-gutter ${cls}`,
            minimap: showMinimap ? {
              color: themeColorFromId2(detail2.count ? testingCoveredMinimapBackground : testingUncoveredMinimapBackground),
              position: 2 /* Gutter */
            } : void 0
          };
          const applyHoverOptions = (target) => {
            target.className = `coverage-deco-inline ${cls}`;
            target.hoverMessage = description;
            if (primary && typeof detail2.count === "number") {
              target.before = countBadge(detail2.count);
            }
          };
          if (showInlineByDefault) {
            applyHoverOptions(options3);
          }
          this.decorationIds.set(e.addDecoration(range2, options3), { options: options3, applyHoverOptions, detail: detailRange });
        }
      }
    });
    this.displayedStore.add(toDisposable(() => {
      model.changeDecorations((e) => {
        for (const decoration3 of this.decorationIds.keys()) {
          e.removeDecoration(decoration3);
        }
        this.decorationIds.clear();
      });
    }));
  }
  clear() {
    this.loadingCancellation?.cancel();
    this.loadingCancellation = void 0;
    this.displayedStore.clear();
    this.hoveredStore.clear();
    this.hasInlineCoverageDetails.set(false, void 0);
  }
  async loadDetails(coverage, testId, textModel) {
    const cts = this.loadingCancellation = new CancellationTokenSource();
    this.displayedStore.add(this.loadingCancellation);
    try {
      const details = testId ? await coverage.detailsForTest(testId, this.loadingCancellation.token) : await coverage.details(this.loadingCancellation.token);
      if (cts.token.isCancellationRequested) {
        return;
      }
      return new CoverageDetailsModel(details, textModel);
    } catch (e) {
      this.log.error("Error loading coverage details", e);
    }
    return void 0;
  }
};

CodeCoverageDecorations = __decorateClass([
  __decorateParam(1, IInstantiationService),
  __decorateParam(2, ITestCoverageService),
  __decorateParam(3, IConfigurationService),
  __decorateParam(4, ILogService),
  __decorateParam(5, IContextKeyService)
], CodeCoverageDecorations);

var countBadge = (count2) => {
  if (count2 === 0) {
    return void 0;
  }
  return {
    content: `${count2 > 99 ? "99+" : count2}x`,
    cursorStops: 3 /* None */,
    inlineClassName: `coverage-deco-inline-count`,
    inlineClassNameAffectsLetterSpacing: true
  };
};

var CoverageDetailsModel = class {
  constructor(details, textModel) {
    this.details = details;
    this.ranges = [];
    const detailRanges = details.map((detail2) => ({
      range: tidyLocation(detail2.location),
      primary: true,
      metadata: { detail: detail2, description: this.describe(detail2, textModel) }
    }));
    for (const { range: range2, metadata: { detail: detail2 } } of detailRanges) {
      if (detail2.type === 1 /* Statement */ && detail2.branches) {
        for (let i2 = 0; i2 < detail2.branches.length; i2++) {
          const branch = { type: 2 /* Branch */, branch: i2, detail: detail2 };
          detailRanges.push({
            range: tidyLocation(detail2.branches[i2].location || Range2.fromPositions(range2.getEndPosition())),
            primary: true,
            metadata: {
              detail: branch,
              description: this.describe(branch, textModel)
            }
          });
        }
      }
    }
    detailRanges.sort((a, b) => Range2.compareRangesUsingStarts(a.range, b.range) || a.metadata.detail.type - b.metadata.detail.type);
    const stack = [];
    const result = this.ranges = [];
    const pop = () => {
      const next = stack.pop();
      const prev = stack[stack.length - 1];
      if (prev) {
        prev.range = prev.range.setStartPosition(next.range.endLineNumber, next.range.endColumn);
      }
      result.push(next);
    };
    for (const item of detailRanges) {
      const start = item.range.getStartPosition();
      while (stack[stack.length - 1]?.range.containsPosition(start) === false) {
        pop();
      }
      if (item.range.isEmpty()) {
        result.push(item);
        continue;
      }
      const prev = stack[stack.length - 1];
      if (prev) {
        const primary = prev.primary;
        const si = prev.range.setEndPosition(start.lineNumber, start.column);
        prev.range = prev.range.setStartPosition(item.range.endLineNumber, item.range.endColumn);
        prev.primary = false;
        if (prev.range.isEmpty()) {
          stack.pop();
        }
        result.push({ range: si, primary, metadata: prev.metadata });
      }
      stack.push(item);
    }
    while (stack.length) {
      pop();
    }
  }
  /** Gets the markdown description for the given detail */
  describe(detail2, model) {
    if (detail2.type === 0 /* Declaration */) {
      return namedDetailLabel(detail2.name, detail2);
    } else if (detail2.type === 1 /* Statement */) {
      const text2 = wrapName(model.getValueInRange(tidyLocation(detail2.location)).trim() || `<empty statement>`);
      if (detail2.branches?.length) {
        const covered = detail2.branches.filter((b) => !!b.count).length;
        return new MarkdownString().appendMarkdown(localize(20992, null, covered, detail2.branches.length, text2));
      } else {
        return namedDetailLabel(text2, detail2);
      }
    } else if (detail2.type === 2 /* Branch */) {
      const text2 = wrapName(model.getValueInRange(tidyLocation(detail2.detail.location)).trim() || `<empty statement>`);
      const { count: count2, label: label3 } = detail2.detail.branches[detail2.branch];
      const label22 = label3 ? wrapInBackticks(label3) : `#${detail2.branch + 1}`;
      if (!count2) {
        return new MarkdownString().appendMarkdown(localize(20993, null, label22, text2));
      } else if (count2 === true) {
        return new MarkdownString().appendMarkdown(localize(20991, null, label22, text2));
      } else {
        return new MarkdownString().appendMarkdown(localize(20990, null, label22, text2, count2));
      }
    }
    assertNever(detail2);
  }
};

function namedDetailLabel(name, detail2) {
  return new MarkdownString().appendMarkdown(
    !detail2.count ? localize(20995, null, name) : typeof detail2.count === "number" ? localize(20994, null, name, detail2.count) : localize(20996, null, name)
  );
}

function tidyLocation(location2) {
  if (location2 instanceof Position) {
    return Range2.fromPositions(location2, new Position(location2.lineNumber, 2147483647));
  }
  return location2;
}

function wrapInBackticks(str) {
  return "`" + str.replace(/[\n\r`]/g, "") + "`";
}

function wrapName(functionNameOrCode) {
  if (functionNameOrCode.length > 50) {
    functionNameOrCode = functionNameOrCode.slice(0, 40) + "...";
  }
  return wrapInBackticks(functionNameOrCode);
}

var CoverageToolbarWidget = class extends Disposable {
  constructor(editor, configurationService, contextMenuService, testService, keybindingService, commandService, coverage, instaService) {
    super();
    this.editor = editor;
    this.configurationService = configurationService;
    this.contextMenuService = contextMenuService;
    this.testService = testService;
    this.keybindingService = keybindingService;
    this.commandService = commandService;
    this.coverage = coverage;
    this.registered = false;
    this.isRunning = false;
    this.showStore = this._register(new DisposableStore());
    this._domNode = h("div.coverage-summary-widget", [
      h("div", [
        h("span.bars@bars"),
        h("span.toolbar@toolbar")
      ])
    ]);
    this.bars = this._register(instaService.createInstance(ManagedTestCoverageBars, {
      compact: false,
      overall: false,
      container: this._domNode.bars
    }));
    this.actionBar = this._register(instaService.createInstance(ActionBar, this._domNode.toolbar, {
      orientation: 0 /* HORIZONTAL */,
      actionViewItemProvider: (action, options3) => {
        if (action instanceof ActionWithIcon) {
          if (action.iconOnly) {
            action.class = ThemeIcon.asClassName(action.icon);
            return new ActionViewItem(void 0, action, { ...options3, label: false, icon: true });
          }
          const vm = new CodiconActionViewItem2(void 0, action, options3);
          vm.themeIcon = action.icon;
          return vm;
        }
        return void 0;
      }
    }));
    this._register(autorun((reader) => {
      coverage.showInline.read(reader);
      this.setActions();
    }));
    this._register(addStandardDisposableListener(this._domNode.root, EventType.CONTEXT_MENU, (e) => {
      this.contextMenuService.showContextMenu({
        menuId: MenuId.StickyScrollContext,
        getAnchor: () => e
      });
    }));
  }
  /** @inheritdoc */
  getId() {
    return "coverage-summary-widget";
  }
  /** @inheritdoc */
  getDomNode() {
    return this._domNode.root;
  }
  /** @inheritdoc */
  getPosition() {
    return {
      preference: 2 /* TOP_CENTER */,
      stackOrdinal: 9
    };
  }
  clearCoverage() {
    this.current = void 0;
    this.bars.setCoverageInfo(void 0);
    this.hide();
  }
  setCoverage(coverage, testId) {
    this.current = { coverage, testId };
    this.bars.setCoverageInfo(coverage);
    if (!coverage) {
      this.hide();
    } else {
      this.setActions();
      this.show();
    }
  }
  setActions() {
    this.actionBar.clear();
    const current = this.current;
    if (!current) {
      return;
    }
    const toggleAction = new ActionWithIcon(
      "toggleInline",
      this.coverage.showInline.get() ? localize(21006, null) : localize(21008, null),
      testingCoverageReport,
      void 0,
      () => this.coverage.showInline.set(!this.coverage.showInline.get(), void 0)
    );
    toggleAction.tooltip = this.keybindingService.appendKeybinding(TOGGLE_INLINE_COMMAND_TEXT, TOGGLE_INLINE_COMMAND_ID);
    const hasUncoveredStmt = current.coverage.statement.covered < current.coverage.statement.total;
    this.actionBar.push(new ActionWithIcon(
      "goToPreviousMissed",
      GO_TO_PREVIOUS_MISSED_LINE_TITLE.value,
      Codicon.arrowUp,
      hasUncoveredStmt,
      () => this.commandService.executeCommand("testing.coverage.goToPreviousMissedLine" /* CoverageGoToPreviousMissedLine */),
      true
    ));
    this.actionBar.push(new ActionWithIcon(
      "goToNextMissed",
      GO_TO_NEXT_MISSED_LINE_TITLE.value,
      Codicon.arrowDown,
      hasUncoveredStmt,
      () => this.commandService.executeCommand("testing.coverage.goToNextMissedLine" /* CoverageGoToNextMissedLine */),
      true
    ));
    this.actionBar.push(toggleAction);
    if (current.testId) {
      const testItem = current.coverage.fromResult.getTestById(current.testId.toString());
      assert(!!testItem, "got coverage for an unreported test");
      this.actionBar.push(new ActionWithIcon(
        "perTestFilter",
        labels.showingFilterFor(testItem.label),
        testingFilterIcon,
        void 0,
        () => this.commandService.executeCommand("testing.coverageFilterToTestInEditor" /* CoverageFilterToTestInEditor */, this.current, this.editor)
      ));
    } else if (current.coverage.perTestData?.size) {
      this.actionBar.push(new ActionWithIcon(
        "perTestFilter",
        localize(20999, null, current.coverage.perTestData.size),
        testingFilterIcon,
        void 0,
        () => this.commandService.executeCommand("testing.coverageFilterToTestInEditor" /* CoverageFilterToTestInEditor */, this.current, this.editor)
      ));
    }
    this.actionBar.push(new ActionWithIcon(
      "rerun",
      localize(21007, null),
      testingRerunIcon,
      !this.isRunning,
      () => this.rerunTest()
    ));
  }
  show() {
    if (this.registered) {
      return;
    }
    this.registered = true;
    let viewZoneId;
    const ds = this.showStore;
    this.editor.addOverlayWidget(this);
    this.editor.changeViewZones((accessor) => {
      viewZoneId = accessor.addZone({
        // make space for the widget
        afterLineNumber: 0,
        afterColumn: 0,
        domNode: document.createElement("div"),
        heightInPx: 30,
        ordinal: -1
        // show before code lenses
      });
    });
    ds.add(toDisposable(() => {
      this.registered = false;
      this.editor.removeOverlayWidget(this);
      this.editor.changeViewZones((accessor) => {
        accessor.removeZone(viewZoneId);
      });
    }));
    ds.add(this.configurationService.onDidChangeConfiguration((e) => {
      if (this.current && (e.affectsConfiguration("testing.coverageBarThresholds" /* CoverageBarThresholds */) || e.affectsConfiguration("testing.displayedCoveragePercent" /* CoveragePercent */))) {
        this.setCoverage(this.current.coverage, this.current.testId);
      }
    }));
  }
  rerunTest() {
    const current = this.current;
    if (current) {
      this.isRunning = true;
      this.setActions();
      this.testService.runResolvedTests(current.coverage.fromResult.request).finally(() => {
        this.isRunning = false;
        this.setActions();
      });
    }
  }
  hide() {
    this.showStore.clear();
  }
};

CoverageToolbarWidget = __decorateClass([
  __decorateParam(1, IConfigurationService),
  __decorateParam(2, IContextMenuService),
  __decorateParam(3, ITestService),
  __decorateParam(4, IKeybindingService),
  __decorateParam(5, ICommandService),
  __decorateParam(6, ITestCoverageService),
  __decorateParam(7, IInstantiationService)
], CoverageToolbarWidget);

registerAction2(class ToggleInlineCoverage extends Action2 {
  constructor() {
    super({
      id: TOGGLE_INLINE_COMMAND_ID,
      // note: ideally this would be "show inline", but the command palette does
      // not use the 'toggled' titles, so we need to make this generic.
      title: localize2(20998, "Toggle Inline Coverage"),
      category: Categories.Test,
      keybinding: {
        weight: 200 /* WorkbenchContrib */,
        primary: KeyChord(2048 /* CtrlCmd */ | 85 /* Semicolon */, 2048 /* CtrlCmd */ | 1024 /* Shift */ | 39 /* KeyI */)
      },
      toggled: {
        condition: TestingContextKeys.inlineCoverageEnabled,
        title: localize(20997, null)
      },
      icon: testingCoverageReport,
      menu: [
        { id: MenuId.CommandPalette, when: TestingContextKeys.isTestCoverageOpen },
        { id: MenuId.EditorTitle, when: ContextKeyExpr.and(TestingContextKeys.hasInlineCoverageDetails, TestingContextKeys.coverageToolbarEnabled.notEqualsTo(true)), group: "navigation" }
      ]
    });
  }
  run(accessor) {
    const coverage = accessor.get(ITestCoverageService);
    coverage.showInline.set(!coverage.showInline.get(), void 0);
  }
});

registerAction2(class ToggleCoverageToolbar extends Action2 {
  constructor() {
    super({
      id: "testing.coverageToggleToolbar" /* CoverageToggleToolbar */,
      title: localize2(21013, "Show Test Coverage Toolbar"),
      metadata: {
        description: localize2(21012, "Toggle the sticky coverage bar in the editor.")
      },
      category: Categories.Test,
      toggled: {
        condition: TestingContextKeys.coverageToolbarEnabled
      },
      menu: [
        { id: MenuId.CommandPalette, when: TestingContextKeys.isTestCoverageOpen },
        { id: MenuId.StickyScrollContext, when: TestingContextKeys.isTestCoverageOpen },
        { id: MenuId.EditorTitle, when: TestingContextKeys.hasCoverageInFile, group: "coverage", order: 1 }
      ]
    });
  }
  run(accessor) {
    const config = accessor.get(IConfigurationService);
    const value2 = getTestingConfiguration(config, "testing.coverageToolbarEnabled" /* CoverageToolbarEnabled */);
    config.updateValue("testing.coverageToolbarEnabled" /* CoverageToolbarEnabled */, !value2);
  }
});

registerAction2(class FilterCoverageToTestInEditor extends Action2 {
  constructor() {
    super({
      id: "testing.coverageFilterToTestInEditor" /* CoverageFilterToTestInEditor */,
      title: localize2(21000, "Filter Coverage to Test"),
      category: Categories.Test,
      icon: Codicon.filter,
      toggled: {
        icon: Codicon.filterFilled,
        condition: TestingContextKeys.isCoverageFilteredToTest
      },
      menu: [
        {
          id: MenuId.EditorTitle,
          when: ContextKeyExpr.and(
            TestingContextKeys.hasCoverageInFile,
            TestingContextKeys.coverageToolbarEnabled.notEqualsTo(true),
            TestingContextKeys.hasPerTestCoverage,
            ActiveEditorContext.isEqualTo(TEXT_FILE_EDITOR_ID)
          ),
          group: "navigation"
        }
      ]
    });
  }
  run(accessor, coverageOrUri, editor) {
    const testCoverageService = accessor.get(ITestCoverageService);
    const quickInputService = accessor.get(IQuickInputService);
    const commandService = accessor.get(ICommandService);
    const activeEditor = isCodeEditor(editor) ? editor : accessor.get(ICodeEditorService).getActiveCodeEditor();
    let coverage;
    if (coverageOrUri instanceof FileCoverage2) {
      coverage = coverageOrUri;
    } else if (isUriComponents(coverageOrUri)) {
      coverage = testCoverageService.selected.get()?.getUri(URI.from(coverageOrUri));
    } else {
      const uri5 = activeEditor?.getModel()?.uri;
      coverage = uri5 && testCoverageService.selected.get()?.getUri(uri5);
    }
    if (!coverage || !coverage.perTestData?.size) {
      return;
    }
    const tests = [...coverage.perTestData].map(TestId.fromString);
    const commonPrefix = TestId.getLengthOfCommonPrefix(tests.length, (i2) => tests[i2]);
    const result = coverage.fromResult;
    const previousSelection = testCoverageService.filterToTest.get();
    const buttons = [{
      iconClass: "codicon-go-to-file",
      tooltip: "Go to Test"
    }];
    const items = [
      { label: labels.allTests, testId: void 0 },
      { type: "separator" },
      ...tests.map((id2) => ({ ...getLabelForItem(result, id2, commonPrefix), testId: id2, buttons }))
    ];
    const scrollTop = activeEditor?.getScrollTop() || 0;
    const revealScrollCts = new MutableDisposable();
    quickInputService.pick(items, {
      activeItem: items.find((item) => "testId" in item && item.testId?.toString() === previousSelection?.toString()),
      placeHolder: labels.pickShowCoverage,
      onDidTriggerItemButton: (context2) => {
        commandService.executeCommand("vscode.revealTest", context2.item.testId?.toString());
      },
      onDidFocus: (entry) => {
        if (!entry.testId) {
          revealScrollCts.clear();
          activeEditor?.setScrollTop(scrollTop);
          testCoverageService.filterToTest.set(void 0, void 0);
        } else {
          const cts = revealScrollCts.value = new CancellationTokenSource();
          coverage.detailsForTest(entry.testId, cts.token).then(
            (details) => {
              const first2 = details.find((d) => d.type === 1 /* Statement */);
              if (!cts.token.isCancellationRequested && first2) {
                activeEditor?.revealLineNearTop(first2.location instanceof Position ? first2.location.lineNumber : first2.location.startLineNumber);
              }
            },
            () => {
            }
          );
          testCoverageService.filterToTest.set(entry.testId, void 0);
        }
      }
    }).then((selected) => {
      if (!selected) {
        activeEditor?.setScrollTop(scrollTop);
      }
      revealScrollCts.dispose();
      testCoverageService.filterToTest.set(selected ? selected.testId : previousSelection, void 0);
    });
  }
});

registerAction2(class ToggleCoverageInExplorer extends Action2 {
  constructor() {
    super({
      id: "testing.toggleCoverageInExplorer" /* CoverageToggleInExplorer */,
      title: localize2(21010, "Toggle Coverage in Explorer"),
      metadata: {
        description: localize2(21009, "Toggle the display of test coverage in the File Explorer view.")
      },
      category: Categories.Test,
      toggled: {
        condition: ContextKeyExpr.equals("config.testing.showCoverageInExplorer", true),
        title: localize(21005, null)
      },
      menu: [
        { id: MenuId.CommandPalette, when: TestingContextKeys.isTestCoverageOpen }
      ]
    });
  }
  run(accessor) {
    const config = accessor.get(IConfigurationService);
    const value2 = getTestingConfiguration(config, "testing.showCoverageInExplorer" /* ShowCoverageInExplorer */);
    config.updateValue("testing.showCoverageInExplorer" /* ShowCoverageInExplorer */, !value2);
  }
});

registerAction2(class GoToNextMissedCoverageLine extends Action2 {
  constructor() {
    super({
      id: "testing.coverage.goToNextMissedLine" /* CoverageGoToNextMissedLine */,
      title: GO_TO_NEXT_MISSED_LINE_TITLE,
      metadata: {
        description: localize2(21002, "Navigate to the next line that is not covered by tests.")
      },
      category: Categories.Test,
      icon: Codicon.arrowDown,
      precondition: TestingContextKeys.hasCoverageInFile,
      keybinding: {
        when: ActiveEditorContext,
        weight: 100 /* EditorContrib */,
        primary: 512 /* Alt */ | 67 /* F9 */
      },
      menu: [
        { id: MenuId.CommandPalette, when: TestingContextKeys.isTestCoverageOpen },
        { id: MenuId.EditorTitle, when: TestingContextKeys.hasCoverageInFile, group: "coverage", order: 2 }
      ]
    });
  }
  run(accessor) {
    const codeEditorService = accessor.get(ICodeEditorService);
    const activeEditor = codeEditorService.getActiveCodeEditor();
    if (!activeEditor) {
      return;
    }
    const contribution = activeEditor.getContribution(CodeCoverageDecorations.ID);
    contribution?.goToNextMissedLine();
  }
});

registerAction2(class GoToPreviousMissedCoverageLine extends Action2 {
  constructor() {
    super({
      id: "testing.coverage.goToPreviousMissedLine" /* CoverageGoToPreviousMissedLine */,
      title: GO_TO_PREVIOUS_MISSED_LINE_TITLE,
      metadata: {
        description: localize2(21004, "Navigate to the previous line that is not covered by tests.")
      },
      category: Categories.Test,
      icon: Codicon.arrowUp,
      precondition: TestingContextKeys.hasCoverageInFile,
      keybinding: {
        when: ActiveEditorContext,
        weight: 100 /* EditorContrib */,
        primary: 512 /* Alt */ | 1024 /* Shift */ | 67 /* F9 */
      },
      menu: [
        { id: MenuId.CommandPalette, when: TestingContextKeys.isTestCoverageOpen },
        { id: MenuId.EditorTitle, when: TestingContextKeys.hasCoverageInFile, group: "coverage", order: 3 }
      ]
    });
  }
  run(accessor) {
    const codeEditorService = accessor.get(ICodeEditorService);
    const activeEditor = codeEditorService.getActiveCodeEditor();
    if (!activeEditor) {
      return;
    }
    const contribution = activeEditor.getContribution(CodeCoverageDecorations.ID);
    contribution?.goToPreviousMissedLine();
  }
});

var ActionWithIcon = class extends Action {
  constructor(id2, title, icon2, enabled, run, iconOnly = false) {
    super(id2, title, void 0, enabled, run);
    this.icon = icon2;
    this.iconOnly = iconOnly;
  }
};

var CodiconActionViewItem2 = class extends ActionViewItem {
  updateLabel() {
    if (this.options.label && this.label && this.themeIcon) {
      reset(this.label, renderIcon(this.themeIcon), this.action.label);
    }
  }
};
export { namedDetailLabel, tidyLocation, wrapInBackticks, wrapName, CLASS_HIT, CLASS_MISS, TOGGLE_INLINE_COMMAND_TEXT, TOGGLE_INLINE_COMMAND_ID, BRANCH_MISS_INDICATOR_CHARS, GO_TO_NEXT_MISSED_LINE_TITLE, GO_TO_PREVIOUS_MISSED_LINE_TITLE, CodeCoverageDecorations, countBadge, CoverageDetailsModel, CoverageToolbarWidget, ActionWithIcon, CodiconActionViewItem2 };
