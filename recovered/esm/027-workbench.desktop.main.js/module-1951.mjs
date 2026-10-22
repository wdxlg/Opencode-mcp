// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/notebook/browser/notebookOptions.ts
import { Disposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { observableValue } from "./module-0048.mjs";
import { NotebookSetting } from "./module-0909.mjs";
import { isObject } from "./module-0010.mjs";
import { createBareFontInfoFromRawSettings } from "./module-0220.mjs";
import { PixelRatio } from "./module-0215.mjs";
import { FontMeasurements } from "./module-0217.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { INotebookExecutionStateService } from "./module-1387.mjs";
import { ICodeEditorService } from "./module-0078.mjs";


// src/vs/workbench/contrib/notebook/browser/notebookOptions.ts
var SCROLLABLE_ELEMENT_PADDING_TOP = 18;

var OutputInnerContainerTopPadding = 4;

var defaultConfigConstants = Object.freeze({
  codeCellLeftMargin: 28,
  cellRunGutter: 32,
  markdownCellTopMargin: 8,
  markdownCellBottomMargin: 8,
  markdownCellLeftMargin: 0,
  markdownCellGutter: 32,
  focusIndicatorLeftMargin: 4
});

var compactConfigConstants = Object.freeze({
  codeCellLeftMargin: 8,
  cellRunGutter: 36,
  markdownCellTopMargin: 6,
  markdownCellBottomMargin: 6,
  markdownCellLeftMargin: 8,
  markdownCellGutter: 36,
  focusIndicatorLeftMargin: 4
});

var NotebookOptions = class extends Disposable {
  constructor(targetWindow, isReadonly, overrides, configurationService, notebookExecutionStateService, codeEditorService) {
    super();
    this.targetWindow = targetWindow;
    this.isReadonly = isReadonly;
    this.overrides = overrides;
    this.configurationService = configurationService;
    this.notebookExecutionStateService = notebookExecutionStateService;
    this.codeEditorService = codeEditorService;
    this._onDidChangeOptions = this._register(new Emitter());
    this.onDidChangeOptions = this._onDidChangeOptions.event;
    this._editorTopPadding = 12;
    this.previousModelToCompare = observableValue("previousModelToCompare", void 0);
    const showCellStatusBar = this.configurationService.getValue(NotebookSetting.showCellStatusBar);
    const globalToolbar = overrides?.globalToolbar ?? this.configurationService.getValue(NotebookSetting.globalToolbar) ?? true;
    const stickyScrollEnabled = overrides?.stickyScrollEnabled ?? this.configurationService.getValue(NotebookSetting.stickyScrollEnabled) ?? false;
    const stickyScrollMode = this._computeStickyScrollModeOption();
    const consolidatedOutputButton = this.configurationService.getValue(NotebookSetting.consolidatedOutputButton) ?? true;
    const consolidatedRunButton = this.configurationService.getValue(NotebookSetting.consolidatedRunButton) ?? false;
    const dragAndDropEnabled = overrides?.dragAndDropEnabled ?? this.configurationService.getValue(NotebookSetting.dragAndDropEnabled) ?? true;
    const cellToolbarLocation = this.configurationService.getValue(NotebookSetting.cellToolbarLocation) ?? { "default": "right" };
    const cellToolbarInteraction = overrides?.cellToolbarInteraction ?? this.configurationService.getValue(NotebookSetting.cellToolbarVisibility);
    const compactView = this.configurationService.getValue(NotebookSetting.compactView) ?? true;
    const focusIndicator = this._computeFocusIndicatorOption();
    const insertToolbarPosition = this._computeInsertToolbarPositionOption(this.isReadonly);
    const insertToolbarAlignment = this._computeInsertToolbarAlignmentOption();
    const showFoldingControls = this._computeShowFoldingControlsOption();
    const fontSize = this.configurationService.getValue("editor.fontSize");
    const markupFontSize = this.configurationService.getValue(NotebookSetting.markupFontSize);
    const markdownLineHeight = this.configurationService.getValue(NotebookSetting.markdownLineHeight);
    let editorOptionsCustomizations = this.configurationService.getValue(NotebookSetting.cellEditorOptionsCustomizations) ?? {};
    editorOptionsCustomizations = isObject(editorOptionsCustomizations) ? editorOptionsCustomizations : {};
    const interactiveWindowCollapseCodeCells = this.configurationService.getValue(NotebookSetting.interactiveWindowCollapseCodeCells);
    const outputLineHeightSettingValue = this.configurationService.getValue(NotebookSetting.outputLineHeight);
    const outputFontSize = this.configurationService.getValue(NotebookSetting.outputFontSize) || fontSize;
    const outputFontFamily = this.configurationService.getValue(NotebookSetting.outputFontFamily);
    const outputScrolling = this.configurationService.getValue(NotebookSetting.outputScrolling);
    const outputLineHeight = this._computeOutputLineHeight(outputLineHeightSettingValue, outputFontSize);
    const outputWordWrap = this.configurationService.getValue(NotebookSetting.outputWordWrap);
    const outputLineLimit = this.configurationService.getValue(NotebookSetting.textOutputLineLimit) ?? 30;
    const linkifyFilePaths = this.configurationService.getValue(NotebookSetting.LinkifyOutputFilePaths) ?? true;
    const minimalErrors = this.configurationService.getValue(NotebookSetting.minimalErrorRendering);
    const markupFontFamily = this.configurationService.getValue(NotebookSetting.markupFontFamily);
    const editorTopPadding = this._computeEditorTopPadding();
    this._layoutConfiguration = {
      ...compactView ? compactConfigConstants : defaultConfigConstants,
      cellTopMargin: 6,
      cellBottomMargin: 6,
      cellRightMargin: 16,
      cellStatusBarHeight: 22,
      cellOutputPadding: 8,
      markdownPreviewPadding: 8,
      // bottomToolbarHeight: bottomToolbarHeight,
      // bottomToolbarGap: bottomToolbarGap,
      editorToolbarHeight: 0,
      editorTopPadding,
      editorBottomPadding: 4,
      editorBottomPaddingWithoutStatusBar: 12,
      collapsedIndicatorHeight: 28,
      showCellStatusBar,
      globalToolbar,
      stickyScrollEnabled,
      stickyScrollMode,
      consolidatedOutputButton,
      consolidatedRunButton,
      dragAndDropEnabled,
      cellToolbarLocation,
      cellToolbarInteraction,
      compactView,
      focusIndicator,
      insertToolbarPosition,
      insertToolbarAlignment,
      showFoldingControls,
      fontSize,
      outputFontSize,
      outputFontFamily,
      outputLineHeight,
      markupFontSize,
      markdownLineHeight,
      editorOptionsCustomizations,
      focusIndicatorGap: 3,
      interactiveWindowCollapseCodeCells,
      markdownFoldHintHeight: 22,
      outputScrolling,
      outputWordWrap,
      outputLineLimit,
      outputLinkifyFilePaths: linkifyFilePaths,
      outputMinimalError: minimalErrors,
      markupFontFamily,
      disableRulers: overrides?.disableRulers
    };
    this._register(this.configurationService.onDidChangeConfiguration((e) => {
      this._updateConfiguration(e);
    }));
  }
  updateOptions(isReadonly) {
    if (this.isReadonly !== isReadonly) {
      this.isReadonly = isReadonly;
      this._updateConfiguration({
        affectsConfiguration(configuration2) {
          return configuration2 === NotebookSetting.insertToolbarLocation;
        },
        source: 7 /* DEFAULT */,
        affectedKeys: /* @__PURE__ */ new Set([NotebookSetting.insertToolbarLocation]),
        change: { keys: [NotebookSetting.insertToolbarLocation], overrides: [] }
      });
    }
  }
  _computeEditorTopPadding() {
    let decorationTriggeredAdjustment = false;
    const updateEditorTopPadding = (top2) => {
      this._editorTopPadding = top2;
      const configuration2 = Object.assign({}, this._layoutConfiguration);
      configuration2.editorTopPadding = this._editorTopPadding;
      this._layoutConfiguration = configuration2;
      this._onDidChangeOptions.fire({ editorTopPadding: true });
    };
    const decorationCheckSet = /* @__PURE__ */ new Set();
    const onDidAddDecorationType = (e) => {
      if (decorationTriggeredAdjustment) {
        return;
      }
      if (decorationCheckSet.has(e)) {
        return;
      }
      try {
        const options3 = this.codeEditorService.resolveDecorationOptions(e, true);
        if (options3.afterContentClassName || options3.beforeContentClassName) {
          const cssRules = this.codeEditorService.resolveDecorationCSSRules(e);
          if (cssRules !== null) {
            for (let i2 = 0; i2 < cssRules.length; i2++) {
              if ((cssRules[i2].selectorText.endsWith("::after") || cssRules[i2].selectorText.endsWith("::after")) && cssRules[i2].cssText.indexOf("top:") > -1) {
                const editorOptions2 = this.configurationService.getValue("editor");
                updateEditorTopPadding(createBareFontInfoFromRawSettings(editorOptions2, PixelRatio.getInstance(this.targetWindow).value).lineHeight + 2);
                decorationTriggeredAdjustment = true;
                break;
              }
            }
          }
        }
        decorationCheckSet.add(e);
      } catch (_ex) {
      }
    };
    this._register(this.codeEditorService.onDecorationTypeRegistered(onDidAddDecorationType));
    this.codeEditorService.listDecorationTypes().forEach(onDidAddDecorationType);
    return this._editorTopPadding;
  }
  _computeOutputLineHeight(lineHeight, outputFontSize) {
    const minimumLineHeight = 9;
    if (lineHeight === 0) {
      const editorOptions2 = this.configurationService.getValue("editor");
      const fontInfo = FontMeasurements.readFontInfo(this.targetWindow, createBareFontInfoFromRawSettings(editorOptions2, PixelRatio.getInstance(this.targetWindow).value));
      lineHeight = fontInfo.lineHeight;
    } else if (lineHeight < minimumLineHeight) {
      let fontSize = outputFontSize;
      if (fontSize === 0) {
        fontSize = this.configurationService.getValue("editor.fontSize");
      }
      lineHeight = lineHeight * fontSize;
    }
    lineHeight = Math.round(lineHeight);
    if (lineHeight < minimumLineHeight) {
      lineHeight = minimumLineHeight;
    }
    return lineHeight;
  }
  _updateConfiguration(e) {
    const cellStatusBarVisibility = e.affectsConfiguration(NotebookSetting.showCellStatusBar);
    const cellToolbarLocation = e.affectsConfiguration(NotebookSetting.cellToolbarLocation);
    const cellToolbarInteraction = e.affectsConfiguration(NotebookSetting.cellToolbarVisibility);
    const compactView = e.affectsConfiguration(NotebookSetting.compactView);
    const focusIndicator = e.affectsConfiguration(NotebookSetting.focusIndicator);
    const insertToolbarPosition = e.affectsConfiguration(NotebookSetting.insertToolbarLocation);
    const insertToolbarAlignment = e.affectsConfiguration(NotebookSetting.experimentalInsertToolbarAlignment);
    const globalToolbar = e.affectsConfiguration(NotebookSetting.globalToolbar);
    const stickyScrollEnabled = e.affectsConfiguration(NotebookSetting.stickyScrollEnabled);
    const stickyScrollMode = e.affectsConfiguration(NotebookSetting.stickyScrollMode);
    const consolidatedOutputButton = e.affectsConfiguration(NotebookSetting.consolidatedOutputButton);
    const consolidatedRunButton = e.affectsConfiguration(NotebookSetting.consolidatedRunButton);
    const showFoldingControls = e.affectsConfiguration(NotebookSetting.showFoldingControls);
    const dragAndDropEnabled = e.affectsConfiguration(NotebookSetting.dragAndDropEnabled);
    const fontSize = e.affectsConfiguration("editor.fontSize");
    const outputFontSize = e.affectsConfiguration(NotebookSetting.outputFontSize);
    const markupFontSize = e.affectsConfiguration(NotebookSetting.markupFontSize);
    const markdownLineHeight = e.affectsConfiguration(NotebookSetting.markdownLineHeight);
    const fontFamily = e.affectsConfiguration("editor.fontFamily");
    const outputFontFamily = e.affectsConfiguration(NotebookSetting.outputFontFamily);
    const editorOptionsCustomizations = e.affectsConfiguration(NotebookSetting.cellEditorOptionsCustomizations);
    const interactiveWindowCollapseCodeCells = e.affectsConfiguration(NotebookSetting.interactiveWindowCollapseCodeCells);
    const outputLineHeight = e.affectsConfiguration(NotebookSetting.outputLineHeight);
    const outputScrolling = e.affectsConfiguration(NotebookSetting.outputScrolling);
    const outputWordWrap = e.affectsConfiguration(NotebookSetting.outputWordWrap);
    const outputLinkifyFilePaths = e.affectsConfiguration(NotebookSetting.LinkifyOutputFilePaths);
    const minimalError = e.affectsConfiguration(NotebookSetting.minimalErrorRendering);
    const markupFontFamily = e.affectsConfiguration(NotebookSetting.markupFontFamily);
    if (!cellStatusBarVisibility && !cellToolbarLocation && !cellToolbarInteraction && !compactView && !focusIndicator && !insertToolbarPosition && !insertToolbarAlignment && !globalToolbar && !stickyScrollEnabled && !stickyScrollMode && !consolidatedOutputButton && !consolidatedRunButton && !showFoldingControls && !dragAndDropEnabled && !fontSize && !outputFontSize && !markupFontSize && !markdownLineHeight && !fontFamily && !outputFontFamily && !editorOptionsCustomizations && !interactiveWindowCollapseCodeCells && !outputLineHeight && !outputScrolling && !outputWordWrap && !outputLinkifyFilePaths && !minimalError && !markupFontFamily) {
      return;
    }
    let configuration2 = Object.assign({}, this._layoutConfiguration);
    if (cellStatusBarVisibility) {
      configuration2.showCellStatusBar = this.configurationService.getValue(NotebookSetting.showCellStatusBar);
    }
    if (cellToolbarLocation) {
      configuration2.cellToolbarLocation = this.configurationService.getValue(NotebookSetting.cellToolbarLocation) ?? { "default": "right" };
    }
    if (cellToolbarInteraction && !this.overrides?.cellToolbarInteraction) {
      configuration2.cellToolbarInteraction = this.configurationService.getValue(NotebookSetting.cellToolbarVisibility);
    }
    if (focusIndicator) {
      configuration2.focusIndicator = this._computeFocusIndicatorOption();
    }
    if (compactView) {
      const compactViewValue = this.configurationService.getValue(NotebookSetting.compactView) ?? true;
      configuration2 = Object.assign(configuration2, {
        ...compactViewValue ? compactConfigConstants : defaultConfigConstants
      });
      configuration2.compactView = compactViewValue;
    }
    if (insertToolbarAlignment) {
      configuration2.insertToolbarAlignment = this._computeInsertToolbarAlignmentOption();
    }
    if (insertToolbarPosition) {
      configuration2.insertToolbarPosition = this._computeInsertToolbarPositionOption(this.isReadonly);
    }
    if (globalToolbar && this.overrides?.globalToolbar === void 0) {
      configuration2.globalToolbar = this.configurationService.getValue(NotebookSetting.globalToolbar) ?? true;
    }
    if (stickyScrollEnabled && this.overrides?.stickyScrollEnabled === void 0) {
      configuration2.stickyScrollEnabled = this.configurationService.getValue(NotebookSetting.stickyScrollEnabled) ?? false;
    }
    if (stickyScrollMode) {
      configuration2.stickyScrollMode = this.configurationService.getValue(NotebookSetting.stickyScrollMode) ?? "flat";
    }
    if (consolidatedOutputButton) {
      configuration2.consolidatedOutputButton = this.configurationService.getValue(NotebookSetting.consolidatedOutputButton) ?? true;
    }
    if (consolidatedRunButton) {
      configuration2.consolidatedRunButton = this.configurationService.getValue(NotebookSetting.consolidatedRunButton) ?? true;
    }
    if (showFoldingControls) {
      configuration2.showFoldingControls = this._computeShowFoldingControlsOption();
    }
    if (dragAndDropEnabled) {
      configuration2.dragAndDropEnabled = this.configurationService.getValue(NotebookSetting.dragAndDropEnabled) ?? true;
    }
    if (fontSize) {
      configuration2.fontSize = this.configurationService.getValue("editor.fontSize");
    }
    if (outputFontSize || fontSize) {
      configuration2.outputFontSize = this.configurationService.getValue(NotebookSetting.outputFontSize) || configuration2.fontSize;
    }
    if (markupFontSize) {
      configuration2.markupFontSize = this.configurationService.getValue(NotebookSetting.markupFontSize);
    }
    if (markdownLineHeight) {
      configuration2.markdownLineHeight = this.configurationService.getValue(NotebookSetting.markdownLineHeight);
    }
    if (outputFontFamily) {
      configuration2.outputFontFamily = this.configurationService.getValue(NotebookSetting.outputFontFamily);
    }
    if (editorOptionsCustomizations) {
      configuration2.editorOptionsCustomizations = this.configurationService.getValue(NotebookSetting.cellEditorOptionsCustomizations);
    }
    if (interactiveWindowCollapseCodeCells) {
      configuration2.interactiveWindowCollapseCodeCells = this.configurationService.getValue(NotebookSetting.interactiveWindowCollapseCodeCells);
    }
    if (outputLineHeight || fontSize || outputFontSize) {
      const lineHeight = this.configurationService.getValue(NotebookSetting.outputLineHeight);
      configuration2.outputLineHeight = this._computeOutputLineHeight(lineHeight, configuration2.outputFontSize);
    }
    if (outputWordWrap) {
      configuration2.outputWordWrap = this.configurationService.getValue(NotebookSetting.outputWordWrap);
    }
    if (outputScrolling) {
      configuration2.outputScrolling = this.configurationService.getValue(NotebookSetting.outputScrolling);
    }
    if (outputLinkifyFilePaths) {
      configuration2.outputLinkifyFilePaths = this.configurationService.getValue(NotebookSetting.LinkifyOutputFilePaths);
    }
    if (minimalError) {
      configuration2.outputMinimalError = this.configurationService.getValue(NotebookSetting.minimalErrorRendering);
    }
    if (markupFontFamily) {
      configuration2.markupFontFamily = this.configurationService.getValue(NotebookSetting.markupFontFamily);
    }
    this._layoutConfiguration = Object.freeze(configuration2);
    this._onDidChangeOptions.fire({
      cellStatusBarVisibility,
      cellToolbarLocation,
      cellToolbarInteraction,
      compactView,
      focusIndicator,
      insertToolbarPosition,
      insertToolbarAlignment,
      globalToolbar,
      stickyScrollEnabled,
      stickyScrollMode,
      showFoldingControls,
      consolidatedOutputButton,
      consolidatedRunButton,
      dragAndDropEnabled,
      fontSize,
      outputFontSize,
      markupFontSize,
      markdownLineHeight,
      fontFamily,
      outputFontFamily,
      editorOptionsCustomizations,
      interactiveWindowCollapseCodeCells,
      outputLineHeight,
      outputScrolling,
      outputWordWrap,
      outputLinkifyFilePaths,
      minimalError,
      markupFontFamily
    });
  }
  _computeInsertToolbarPositionOption(isReadOnly2) {
    return isReadOnly2 ? "hidden" : this.configurationService.getValue(NotebookSetting.insertToolbarLocation) ?? "both";
  }
  _computeInsertToolbarAlignmentOption() {
    return this.configurationService.getValue(NotebookSetting.experimentalInsertToolbarAlignment) ?? "center";
  }
  _computeShowFoldingControlsOption() {
    return this.configurationService.getValue(NotebookSetting.showFoldingControls) ?? "mouseover";
  }
  _computeFocusIndicatorOption() {
    return this.configurationService.getValue(NotebookSetting.focusIndicator) ?? "gutter";
  }
  _computeStickyScrollModeOption() {
    return this.configurationService.getValue(NotebookSetting.stickyScrollMode) ?? "flat";
  }
  getCellCollapseDefault() {
    return this._layoutConfiguration.interactiveWindowCollapseCodeCells === "never" ? {
      codeCell: {
        inputCollapsed: false
      }
    } : {
      codeCell: {
        inputCollapsed: true
      }
    };
  }
  getLayoutConfiguration() {
    return this._layoutConfiguration;
  }
  getDisplayOptions() {
    return this._layoutConfiguration;
  }
  getCellEditorContainerLeftMargin() {
    const {
      codeCellLeftMargin,
      cellRunGutter
    } = this._layoutConfiguration;
    return codeCellLeftMargin + cellRunGutter;
  }
  computeCollapsedMarkdownCellHeight(viewType) {
    const { bottomToolbarGap } = this.computeBottomToolbarDimensions(viewType);
    return this._layoutConfiguration.markdownCellTopMargin + this._layoutConfiguration.collapsedIndicatorHeight + bottomToolbarGap + this._layoutConfiguration.markdownCellBottomMargin;
  }
  computeBottomToolbarOffset(totalHeight, viewType) {
    const { bottomToolbarGap, bottomToolbarHeight } = this.computeBottomToolbarDimensions(viewType);
    return totalHeight - bottomToolbarGap - bottomToolbarHeight / 2;
  }
  computeCodeCellEditorWidth(outerWidth) {
    return outerWidth - (this._layoutConfiguration.codeCellLeftMargin + this._layoutConfiguration.cellRunGutter + this._layoutConfiguration.cellRightMargin);
  }
  computeMarkdownCellEditorWidth(outerWidth) {
    return outerWidth - this._layoutConfiguration.markdownCellGutter - this._layoutConfiguration.markdownCellLeftMargin - this._layoutConfiguration.cellRightMargin;
  }
  computeStatusBarHeight() {
    return this._layoutConfiguration.cellStatusBarHeight;
  }
  _computeBottomToolbarDimensions(compactView, insertToolbarPosition, insertToolbarAlignment, cellToolbar) {
    if (insertToolbarAlignment === "left" || cellToolbar !== "hidden") {
      return {
        bottomToolbarGap: 18,
        bottomToolbarHeight: 18
      };
    }
    if (insertToolbarPosition === "betweenCells" || insertToolbarPosition === "both") {
      return compactView ? {
        bottomToolbarGap: 12,
        bottomToolbarHeight: 20
      } : {
        bottomToolbarGap: 20,
        bottomToolbarHeight: 20
      };
    } else {
      return {
        bottomToolbarGap: 0,
        bottomToolbarHeight: 0
      };
    }
  }
  computeBottomToolbarDimensions(viewType) {
    const configuration2 = this._layoutConfiguration;
    const cellToolbarPosition = this.computeCellToolbarLocation(viewType);
    const { bottomToolbarGap, bottomToolbarHeight } = this._computeBottomToolbarDimensions(configuration2.compactView, configuration2.insertToolbarPosition, configuration2.insertToolbarAlignment, cellToolbarPosition);
    return {
      bottomToolbarGap,
      bottomToolbarHeight
    };
  }
  computeCellToolbarLocation(viewType) {
    const cellToolbarLocation = this._layoutConfiguration.cellToolbarLocation;
    if (typeof cellToolbarLocation === "string") {
      if (cellToolbarLocation === "left" || cellToolbarLocation === "right" || cellToolbarLocation === "hidden") {
        return cellToolbarLocation;
      }
    } else {
      if (viewType) {
        const notebookSpecificSetting = cellToolbarLocation[viewType] ?? cellToolbarLocation["default"];
        let cellToolbarLocationForCurrentView = "right";
        switch (notebookSpecificSetting) {
          case "left":
            cellToolbarLocationForCurrentView = "left";
            break;
          case "right":
            cellToolbarLocationForCurrentView = "right";
            break;
          case "hidden":
            cellToolbarLocationForCurrentView = "hidden";
            break;
          default:
            cellToolbarLocationForCurrentView = "right";
            break;
        }
        return cellToolbarLocationForCurrentView;
      }
    }
    return "right";
  }
  computeTopInsertToolbarHeight(viewType) {
    if (this._layoutConfiguration.insertToolbarPosition === "betweenCells" || this._layoutConfiguration.insertToolbarPosition === "both") {
      return SCROLLABLE_ELEMENT_PADDING_TOP;
    }
    const cellToolbarLocation = this.computeCellToolbarLocation(viewType);
    if (cellToolbarLocation === "left" || cellToolbarLocation === "right") {
      return SCROLLABLE_ELEMENT_PADDING_TOP;
    }
    return 0;
  }
  computeEditorPadding(internalMetadata, cellUri) {
    return {
      top: this._editorTopPadding,
      bottom: this.statusBarIsVisible(internalMetadata, cellUri) ? this._layoutConfiguration.editorBottomPadding : this._layoutConfiguration.editorBottomPaddingWithoutStatusBar
    };
  }
  computeEditorStatusbarHeight(internalMetadata, cellUri) {
    return this.statusBarIsVisible(internalMetadata, cellUri) ? this.computeStatusBarHeight() : 0;
  }
  statusBarIsVisible(internalMetadata, cellUri) {
    const exe = this.notebookExecutionStateService.getCellExecution(cellUri);
    if (this._layoutConfiguration.showCellStatusBar === "visible") {
      return true;
    } else if (this._layoutConfiguration.showCellStatusBar === "visibleAfterExecute") {
      return typeof internalMetadata.lastRunSuccess === "boolean" || exe !== void 0;
    } else {
      return false;
    }
  }
  computeWebviewOptions() {
    return {
      outputNodePadding: this._layoutConfiguration.cellOutputPadding,
      outputNodeLeftPadding: this._layoutConfiguration.cellOutputPadding,
      previewNodePadding: this._layoutConfiguration.markdownPreviewPadding,
      markdownLeftMargin: this._layoutConfiguration.markdownCellGutter + this._layoutConfiguration.markdownCellLeftMargin,
      leftMargin: this._layoutConfiguration.codeCellLeftMargin,
      rightMargin: this._layoutConfiguration.cellRightMargin,
      runGutter: this._layoutConfiguration.cellRunGutter,
      dragAndDropEnabled: this._layoutConfiguration.dragAndDropEnabled,
      fontSize: this._layoutConfiguration.fontSize,
      outputFontSize: this._layoutConfiguration.outputFontSize,
      outputFontFamily: this._layoutConfiguration.outputFontFamily,
      markupFontSize: this._layoutConfiguration.markupFontSize,
      markdownLineHeight: this._layoutConfiguration.markdownLineHeight,
      outputLineHeight: this._layoutConfiguration.outputLineHeight,
      outputScrolling: this._layoutConfiguration.outputScrolling,
      outputWordWrap: this._layoutConfiguration.outputWordWrap,
      outputLineLimit: this._layoutConfiguration.outputLineLimit,
      outputLinkifyFilePaths: this._layoutConfiguration.outputLinkifyFilePaths,
      minimalError: this._layoutConfiguration.outputMinimalError,
      markupFontFamily: this._layoutConfiguration.markupFontFamily
    };
  }
  computeDiffWebviewOptions() {
    return {
      outputNodePadding: this._layoutConfiguration.cellOutputPadding,
      outputNodeLeftPadding: 0,
      previewNodePadding: this._layoutConfiguration.markdownPreviewPadding,
      markdownLeftMargin: 0,
      leftMargin: 32,
      rightMargin: 0,
      runGutter: 0,
      dragAndDropEnabled: false,
      fontSize: this._layoutConfiguration.fontSize,
      outputFontSize: this._layoutConfiguration.outputFontSize,
      outputFontFamily: this._layoutConfiguration.outputFontFamily,
      markupFontSize: this._layoutConfiguration.markupFontSize,
      markdownLineHeight: this._layoutConfiguration.markdownLineHeight,
      outputLineHeight: this._layoutConfiguration.outputLineHeight,
      outputScrolling: this._layoutConfiguration.outputScrolling,
      outputWordWrap: this._layoutConfiguration.outputWordWrap,
      outputLineLimit: this._layoutConfiguration.outputLineLimit,
      outputLinkifyFilePaths: false,
      minimalError: false,
      markupFontFamily: this._layoutConfiguration.markupFontFamily
    };
  }
  computeIndicatorPosition(totalHeight, foldHintHeight, viewType) {
    const { bottomToolbarGap } = this.computeBottomToolbarDimensions(viewType);
    return {
      bottomIndicatorTop: totalHeight - bottomToolbarGap - this._layoutConfiguration.cellBottomMargin - foldHintHeight,
      verticalIndicatorHeight: totalHeight - bottomToolbarGap - foldHintHeight
    };
  }
};

NotebookOptions = __decorateClass([
  __decorateParam(3, IConfigurationService),
  __decorateParam(4, INotebookExecutionStateService),
  __decorateParam(5, ICodeEditorService)
], NotebookOptions);
export { SCROLLABLE_ELEMENT_PADDING_TOP, OutputInnerContainerTopPadding, defaultConfigConstants, compactConfigConstants, NotebookOptions };
