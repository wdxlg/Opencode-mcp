// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/debug/browser/breakpointEditorContribution.ts
import { $, EventType, addDisposableListener, getWindow } from "./module-0075.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { allBreakpoints, breakpoint, debugBreakpointHint, debugBreakpointUnsupported, debugStackframe, debugStackframeFocused } from "./module-1891.mjs";
import { MarkdownString } from "./module-0462.mjs";
import { localize } from "./module-0001.mjs";
import { Range2 } from "./module-0106.mjs";
import { BREAKPOINT_EDITOR_CONTRIBUTION_ID, CONTEXT_BREAKPOINT_WIDGET_VISIBLE, IDebugService } from "./module-1057.mjs";
import { ILanguageService } from "./module-0133.mjs";
import { ILabelService } from "./module-0641.mjs";
import { getBreakpointMessageAndIcon } from "./module-2404.mjs";
import { registerThemingParticipant, themeColorFromId2 } from "./module-0287.mjs";
import { noBreakWhitespace } from "./module-0030.mjs";
import { distinct } from "./module-0007.mjs";
import { RunOnceScheduler, timeout } from "./module-0036.mjs";
import { isLinux, isMacintosh } from "./module-0014.mjs";
import { severity_default } from "./module-0266.mjs";
import { BrowserFeatures } from "./module-0020.mjs";
import { isSafari2 } from "./module-0018.mjs";
import { Separator, SubmenuAction, toAction } from "./module-0082.mjs";
import { onUnexpectedError } from "./module-0004.mjs";
import { BreakpointWidget } from "./module-2449.mjs";
import { dispose, disposeIfDisposable } from "./module-0012.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IContextMenuService } from "./module-0488.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { IDialogService } from "./module-0267.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { GutterActionsRegistry } from "./module-2448.mjs";
import { StandardMouseEvent } from "./module-0024.mjs";
import { generateUuid } from "./module-0190.mjs";
import { memoize } from "./module-0250.mjs";
import { registerColor } from "./module-0226.mjs";


// src/vs/workbench/contrib/debug/browser/breakpointEditorContribution.ts
var $65 = $;

var breakpointHelperDecoration = {
  description: "breakpoint-helper-decoration",
  glyphMarginClassName: ThemeIcon.asClassName(debugBreakpointHint),
  glyphMargin: { position: 3 /* Right */ },
  glyphMarginHoverMessage: new MarkdownString().appendText(localize(14109, null)),
  stickiness: 1 /* NeverGrowsWhenTypingAtEdges */
};

function createBreakpointDecorations(accessor, model, breakpoints, state, breakpointsActivated, showBreakpointsInOverviewRuler) {
  const result = [];
  breakpoints.forEach((breakpoint2) => {
    if (breakpoint2.lineNumber > model.getLineCount()) {
      return;
    }
    const hasOtherBreakpointsOnLine = breakpoints.some((bp) => bp !== breakpoint2 && bp.lineNumber === breakpoint2.lineNumber);
    const column = model.getLineFirstNonWhitespaceColumn(breakpoint2.lineNumber);
    const range2 = model.validateRange(
      breakpoint2.column ? new Range2(breakpoint2.lineNumber, breakpoint2.column, breakpoint2.lineNumber, breakpoint2.column + 1) : new Range2(breakpoint2.lineNumber, column, breakpoint2.lineNumber, column + 1)
      // Decoration has to have a width #20688
    );
    result.push({
      options: getBreakpointDecorationOptions(accessor, model, breakpoint2, state, breakpointsActivated, showBreakpointsInOverviewRuler, hasOtherBreakpointsOnLine),
      range: range2
    });
  });
  return result;
}

function getBreakpointDecorationOptions(accessor, model, breakpoint2, state, breakpointsActivated, showBreakpointsInOverviewRuler, hasOtherBreakpointsOnLine) {
  const debugService = accessor.get(IDebugService);
  const languageService = accessor.get(ILanguageService);
  const labelService = accessor.get(ILabelService);
  const { icon: icon2, message, showAdapterUnverifiedMessage } = getBreakpointMessageAndIcon(state, breakpointsActivated, breakpoint2, labelService, debugService.getModel());
  let glyphMarginHoverMessage;
  let unverifiedMessage;
  if (showAdapterUnverifiedMessage) {
    let langId;
    unverifiedMessage = debugService.getModel().getSessions().map((s) => {
      const dbg = debugService.getAdapterManager().getDebugger(s.configuration.type);
      const message2 = dbg?.strings?.["unverifiedBreakpoints" /* UnverifiedBreakpoints */];
      if (message2) {
        if (!langId) {
          langId = languageService.guessLanguageIdByFilepathOrFirstLine(breakpoint2.uri) ?? void 0;
        }
        return langId && dbg.interestedInLanguage(langId) ? message2 : void 0;
      }
      return void 0;
    }).find((messages) => !!messages);
  }
  if (message) {
    glyphMarginHoverMessage = new MarkdownString(void 0, { isTrusted: true, supportThemeIcons: true });
    if (breakpoint2.condition || breakpoint2.hitCondition) {
      const languageId = model.getLanguageId();
      glyphMarginHoverMessage.appendCodeblock(languageId, message);
      if (unverifiedMessage) {
        glyphMarginHoverMessage.appendMarkdown("$(warning) " + unverifiedMessage);
      }
    } else {
      glyphMarginHoverMessage.appendText(message);
      if (unverifiedMessage) {
        glyphMarginHoverMessage.appendMarkdown("\n\n$(warning) " + unverifiedMessage);
      }
    }
  } else if (unverifiedMessage) {
    glyphMarginHoverMessage = new MarkdownString(void 0, { isTrusted: true, supportThemeIcons: true }).appendMarkdown(unverifiedMessage);
  }
  let overviewRulerDecoration = null;
  if (showBreakpointsInOverviewRuler) {
    overviewRulerDecoration = {
      color: themeColorFromId2(debugIconBreakpointForeground),
      position: 1 /* Left */
    };
  }
  const renderInline = breakpoint2.column && (hasOtherBreakpointsOnLine || breakpoint2.column > model.getLineFirstNonWhitespaceColumn(breakpoint2.lineNumber));
  return {
    description: "breakpoint-decoration",
    glyphMargin: { position: 3 /* Right */ },
    glyphMarginClassName: ThemeIcon.asClassName(icon2),
    glyphMarginHoverMessage,
    stickiness: 1 /* NeverGrowsWhenTypingAtEdges */,
    before: renderInline ? {
      content: noBreakWhitespace,
      inlineClassName: `debug-breakpoint-placeholder`,
      inlineClassNameAffectsLetterSpacing: true,
      widthInEm: 0.9
    } : void 0,
    overviewRuler: overviewRulerDecoration,
    zIndex: 9999
  };
}

async function requestBreakpointCandidateLocations(model, lineNumbers, session) {
  if (!session.capabilities.supportsBreakpointLocationsRequest) {
    return [];
  }
  return await Promise.all(distinct(lineNumbers, (l) => l).map(async (lineNumber) => {
    try {
      return { lineNumber, positions: await session.breakpointsLocations(model.uri, lineNumber) };
    } catch {
      return { lineNumber, positions: [] };
    }
  }));
}

function createCandidateDecorations(model, breakpointDecorations, lineBreakpoints) {
  const result = [];
  for (const { positions, lineNumber } of lineBreakpoints) {
    if (positions.length === 0) {
      continue;
    }
    const firstColumn = model.getLineFirstNonWhitespaceColumn(lineNumber);
    const lastColumn = model.getLineLastNonWhitespaceColumn(lineNumber);
    positions.forEach((p) => {
      const range2 = new Range2(p.lineNumber, p.column, p.lineNumber, p.column + 1);
      if (p.column <= firstColumn && !breakpointDecorations.some((bp) => bp.range.startColumn > firstColumn && bp.range.startLineNumber === p.lineNumber) || p.column > lastColumn) {
        return;
      }
      const breakpointAtPosition = breakpointDecorations.find((bpd) => bpd.range.equalsRange(range2));
      if (breakpointAtPosition && breakpointAtPosition.inlineWidget) {
        return;
      }
      result.push({
        range: range2,
        options: {
          description: "breakpoint-placeholder-decoration",
          stickiness: 1 /* NeverGrowsWhenTypingAtEdges */,
          before: breakpointAtPosition ? void 0 : {
            content: noBreakWhitespace,
            inlineClassName: `debug-breakpoint-placeholder`,
            inlineClassNameAffectsLetterSpacing: true,
            widthInEm: 0.9
          }
        },
        breakpoint: breakpointAtPosition ? breakpointAtPosition.breakpoint : void 0
      });
    });
  }
  return result;
}

var BreakpointEditorContribution = class {
  constructor(editor, debugService, contextMenuService, instantiationService, contextKeyService, dialogService, configurationService, labelService) {
    this.editor = editor;
    this.debugService = debugService;
    this.contextMenuService = contextMenuService;
    this.instantiationService = instantiationService;
    this.dialogService = dialogService;
    this.configurationService = configurationService;
    this.labelService = labelService;
    this.breakpointHintDecoration = null;
    this.toDispose = [];
    this.ignoreDecorationsChangedEvent = false;
    this.ignoreBreakpointsChangeEvent = false;
    this.breakpointDecorations = [];
    this.candidateDecorations = [];
    this.breakpointWidgetVisible = CONTEXT_BREAKPOINT_WIDGET_VISIBLE.bindTo(contextKeyService);
    this.setDecorationsScheduler = new RunOnceScheduler(() => this.setDecorations(), 30);
    this.setDecorationsScheduler.schedule();
    this.registerListeners();
  }
  /**
   * Returns context menu actions at the line number if breakpoints can be
   * set. This is used by the {@link TestingDecorations} to allow breakpoint
   * setting on lines where breakpoint "run" actions are present.
   */
  getContextMenuActionsAtPosition(lineNumber, model) {
    if (!this.debugService.getAdapterManager().hasEnabledDebuggers()) {
      return [];
    }
    if (!this.debugService.canSetBreakpointsIn(model)) {
      return [];
    }
    const breakpoints = this.debugService.getModel().getBreakpoints({ lineNumber, uri: model.uri });
    return this.getContextMenuActions(breakpoints, model.uri, lineNumber);
  }
  registerListeners() {
    this.toDispose.push(this.editor.onMouseDown(async (e) => {
      if (!this.debugService.getAdapterManager().hasEnabledDebuggers()) {
        return;
      }
      const model = this.editor.getModel();
      if (!e.target.position || !model || e.target.type !== 2 /* GUTTER_GLYPH_MARGIN */ || e.target.detail.isAfterLines || !this.marginFreeFromNonDebugDecorations(e.target.position.lineNumber) && !e.target.element?.className.includes("breakpoint")) {
        return;
      }
      const canSetBreakpoints = this.debugService.canSetBreakpointsIn(model);
      const lineNumber = e.target.position.lineNumber;
      const uri5 = model.uri;
      if (e.event.rightButton || isMacintosh && e.event.leftButton && e.event.ctrlKey) {
        return;
      } else {
        const breakpoints = this.debugService.getModel().getBreakpoints({ uri: uri5, lineNumber });
        if (breakpoints.length) {
          const isShiftPressed = e.event.shiftKey;
          const isAltPressed = e.event.altKey;
          const enabled = breakpoints.some((bp) => bp.enabled);
          if (isAltPressed) {
            this.showBreakpointWidget(breakpoints[0].lineNumber, breakpoints[0].column);
          } else if (isShiftPressed) {
            breakpoints.forEach((bp) => this.debugService.enableOrDisableBreakpoints(!enabled, bp));
          } else if (!isLinux && breakpoints.some((bp) => !!bp.condition || !!bp.logMessage || !!bp.hitCondition || !!bp.triggeredBy)) {
            const logPoint = breakpoints.every((bp) => !!bp.logMessage);
            const breakpointType = logPoint ? localize(14130, null) : localize(14106, null);
            const disabledBreakpointDialogMessage = localize(
              14107,
              null,
              breakpointType.toLowerCase(),
              logPoint ? localize(14131, null) : localize(14110, null)
            );
            const enabledBreakpointDialogMessage = localize(
              14108,
              null,
              breakpointType.toLowerCase(),
              logPoint ? localize(14131, null) : localize(14110, null)
            );
            await this.dialogService.prompt({
              type: severity_default.Info,
              message: enabled ? enabledBreakpointDialogMessage : disabledBreakpointDialogMessage,
              buttons: [
                {
                  label: localize(14136, null, breakpointType),
                  run: () => breakpoints.forEach((bp) => this.debugService.removeBreakpoints(bp.getId()))
                },
                {
                  label: localize(14120, null, enabled ? localize(14116, null) : localize(14125, null), breakpointType),
                  run: () => breakpoints.forEach((bp) => this.debugService.enableOrDisableBreakpoints(!enabled, bp))
                }
              ],
              cancelButton: true
            });
          } else {
            if (!enabled) {
              breakpoints.forEach((bp) => this.debugService.enableOrDisableBreakpoints(!enabled, bp));
            } else {
              breakpoints.forEach((bp) => this.debugService.removeBreakpoints(bp.getId()));
            }
          }
        } else if (canSetBreakpoints) {
          if (e.event.altKey) {
            this.showBreakpointWidget(lineNumber, void 0, 0 /* CONDITION */);
          } else if (e.event.middleButton) {
            const action = this.configurationService.getValue("debug").gutterMiddleClickAction;
            if (action !== "none") {
              let context2;
              switch (action) {
                case "logpoint":
                  context2 = 2 /* LOG_MESSAGE */;
                  break;
                case "conditionalBreakpoint":
                  context2 = 0 /* CONDITION */;
                  break;
                case "triggeredBreakpoint":
                  context2 = 3 /* TRIGGER_POINT */;
              }
              this.showBreakpointWidget(lineNumber, void 0, context2);
            }
          } else {
            this.debugService.addBreakpoints(uri5, [{ lineNumber }]);
          }
        }
      }
    }));
    if (!(BrowserFeatures.pointerEvents && isSafari2)) {
      this.toDispose.push(this.editor.onMouseMove((e) => {
        if (!this.debugService.getAdapterManager().hasEnabledDebuggers()) {
          return;
        }
        let showBreakpointHintAtLineNumber = -1;
        const model = this.editor.getModel();
        if (model && e.target.position && (e.target.type === 2 /* GUTTER_GLYPH_MARGIN */ || e.target.type === 3 /* GUTTER_LINE_NUMBERS */) && this.debugService.canSetBreakpointsIn(model) && this.marginFreeFromNonDebugDecorations(e.target.position.lineNumber)) {
          const data = e.target.detail;
          if (!data.isAfterLines) {
            showBreakpointHintAtLineNumber = e.target.position.lineNumber;
          }
        }
        this.ensureBreakpointHintDecoration(showBreakpointHintAtLineNumber);
      }));
      this.toDispose.push(this.editor.onMouseLeave(() => {
        this.ensureBreakpointHintDecoration(-1);
      }));
    }
    this.toDispose.push(this.editor.onDidChangeModel(async () => {
      this.closeBreakpointWidget();
      await this.setDecorations();
    }));
    this.toDispose.push(this.debugService.getModel().onDidChangeBreakpoints(() => {
      if (!this.ignoreBreakpointsChangeEvent && !this.setDecorationsScheduler.isScheduled()) {
        this.setDecorationsScheduler.schedule();
      }
    }));
    this.toDispose.push(this.debugService.onDidChangeState(() => {
      if (!this.setDecorationsScheduler.isScheduled()) {
        this.setDecorationsScheduler.schedule();
      }
    }));
    this.toDispose.push(this.editor.onDidChangeModelDecorations(() => this.onModelDecorationsChanged()));
    this.toDispose.push(this.configurationService.onDidChangeConfiguration(async (e) => {
      if (e.affectsConfiguration("debug.showBreakpointsInOverviewRuler") || e.affectsConfiguration("debug.showInlineBreakpointCandidates")) {
        await this.setDecorations();
      }
    }));
  }
  getContextMenuActions(breakpoints, uri5, lineNumber, column) {
    const actions = [];
    if (breakpoints.length === 1) {
      const breakpointType = breakpoints[0].logMessage ? localize(14130, null) : localize(14106, null);
      actions.push(toAction({
        id: "debug.removeBreakpoint",
        label: localize(14132, null, breakpointType),
        enabled: true,
        run: async () => {
          await this.debugService.removeBreakpoints(breakpoints[0].getId());
        }
      }));
      actions.push(toAction({
        id: "workbench.debug.action.editBreakpointAction",
        label: localize(14121, null, breakpointType),
        enabled: true,
        run: () => Promise.resolve(this.showBreakpointWidget(breakpoints[0].lineNumber, breakpoints[0].column))
      }));
      actions.push(toAction({
        id: `workbench.debug.viewlet.action.toggleBreakpoint`,
        label: breakpoints[0].enabled ? localize(14117, null, breakpointType) : localize(14126, null, breakpointType),
        enabled: true,
        run: () => this.debugService.enableOrDisableBreakpoints(!breakpoints[0].enabled, breakpoints[0])
      }));
    } else if (breakpoints.length > 1) {
      const sorted = breakpoints.slice().sort((first2, second) => first2.column && second.column ? first2.column - second.column : 1);
      actions.push(new SubmenuAction("debug.removeBreakpoints", localize(14133, null), sorted.map((bp) => toAction({
        id: "removeInlineBreakpoint",
        label: bp.column ? localize(14134, null, bp.column) : localize(14135, null),
        enabled: true,
        run: () => this.debugService.removeBreakpoints(bp.getId())
      }))));
      actions.push(new SubmenuAction("debug.editBreakpoints", localize(14122, null), sorted.map(
        (bp) => toAction({
          id: "editBreakpoint",
          label: bp.column ? localize(14123, null, bp.column) : localize(14124, null),
          enabled: true,
          run: () => Promise.resolve(this.showBreakpointWidget(bp.lineNumber, bp.column))
        })
      )));
      actions.push(new SubmenuAction("debug.enableDisableBreakpoints", localize(14129, null), sorted.map((bp) => toAction({
        id: bp.enabled ? "disableColumnBreakpoint" : "enableColumnBreakpoint",
        label: bp.enabled ? bp.column ? localize(14119, null, bp.column) : localize(14118, null) : bp.column ? localize(14128, null, bp.column) : localize(14127, null),
        enabled: true,
        run: () => this.debugService.enableOrDisableBreakpoints(!bp.enabled, bp)
      }))));
    } else {
      actions.push(toAction({
        id: "addBreakpoint",
        label: localize(14102, null),
        enabled: true,
        run: () => this.debugService.addBreakpoints(uri5, [{ lineNumber, column }])
      }));
      actions.push(toAction({
        id: "addConditionalBreakpoint",
        label: localize(14103, null),
        enabled: true,
        run: () => Promise.resolve(this.showBreakpointWidget(lineNumber, column, 0 /* CONDITION */))
      }));
      actions.push(toAction({
        id: "addLogPoint",
        label: localize(14104, null),
        enabled: true,
        run: () => Promise.resolve(this.showBreakpointWidget(lineNumber, column, 2 /* LOG_MESSAGE */))
      }));
      actions.push(toAction({
        id: "addTriggeredBreakpoint",
        label: localize(14105, null),
        enabled: true,
        run: () => Promise.resolve(this.showBreakpointWidget(lineNumber, column, 3 /* TRIGGER_POINT */))
      }));
    }
    if (this.debugService.state === 2 /* Stopped */) {
      actions.push(new Separator());
      actions.push(toAction({
        id: "runToLine",
        label: localize(14137, null),
        enabled: true,
        run: () => this.debugService.runTo(uri5, lineNumber).catch(onUnexpectedError)
      }));
    }
    return actions;
  }
  marginFreeFromNonDebugDecorations(line) {
    const decorations = this.editor.getLineDecorations(line);
    if (decorations) {
      for (const { options: options3 } of decorations) {
        const clz = options3.glyphMarginClassName;
        if (!clz) {
          continue;
        }
        const hasSomeActionableCodicon = !(clz.includes("codicon-") || clz.startsWith("coverage-deco-")) || clz.includes("codicon-testing-") || clz.includes("codicon-merge-") || clz.includes("codicon-arrow-") || clz.includes("codicon-loading") || clz.includes("codicon-fold") || clz.includes("codicon-gutter-lightbulb") || clz.includes("codicon-lightbulb-sparkle");
        if (hasSomeActionableCodicon) {
          return false;
        }
      }
    }
    return true;
  }
  ensureBreakpointHintDecoration(showBreakpointHintAtLineNumber) {
    this.editor.changeDecorations((accessor) => {
      if (this.breakpointHintDecoration) {
        accessor.removeDecoration(this.breakpointHintDecoration);
        this.breakpointHintDecoration = null;
      }
      if (showBreakpointHintAtLineNumber !== -1) {
        this.breakpointHintDecoration = accessor.addDecoration(
          {
            startLineNumber: showBreakpointHintAtLineNumber,
            startColumn: 1,
            endLineNumber: showBreakpointHintAtLineNumber,
            endColumn: 1
          },
          breakpointHelperDecoration
        );
      }
    });
  }
  async setDecorations() {
    if (!this.editor.hasModel()) {
      return;
    }
    const setCandidateDecorations = (changeAccessor, desiredCandidatePositions2) => {
      const desiredCandidateDecorations = createCandidateDecorations(model, this.breakpointDecorations, desiredCandidatePositions2);
      const candidateDecorationIds = changeAccessor.deltaDecorations(this.candidateDecorations.map((c) => c.decorationId), desiredCandidateDecorations);
      this.candidateDecorations.forEach((candidate) => {
        candidate.inlineWidget.dispose();
      });
      this.candidateDecorations = candidateDecorationIds.map((decorationId, index2) => {
        const candidate = desiredCandidateDecorations[index2];
        const icon2 = candidate.breakpoint ? getBreakpointMessageAndIcon(this.debugService.state, this.debugService.getModel().areBreakpointsActivated(), candidate.breakpoint, this.labelService, this.debugService.getModel()).icon : breakpoint.disabled;
        const contextMenuActions = () => this.getContextMenuActions(candidate.breakpoint ? [candidate.breakpoint] : [], activeCodeEditor.getModel().uri, candidate.range.startLineNumber, candidate.range.startColumn);
        const inlineWidget = new InlineBreakpointWidget(activeCodeEditor, decorationId, ThemeIcon.asClassName(icon2), candidate.breakpoint, this.debugService, this.contextMenuService, contextMenuActions);
        return {
          decorationId,
          inlineWidget
        };
      });
    };
    const activeCodeEditor = this.editor;
    const model = activeCodeEditor.getModel();
    const breakpoints = this.debugService.getModel().getBreakpoints({ uri: model.uri });
    const debugSettings = this.configurationService.getValue("debug");
    const desiredBreakpointDecorations = this.instantiationService.invokeFunction((accessor) => createBreakpointDecorations(accessor, model, breakpoints, this.debugService.state, this.debugService.getModel().areBreakpointsActivated(), debugSettings.showBreakpointsInOverviewRuler));
    const session = this.debugService.getViewModel().focusedSession;
    const desiredCandidatePositions = debugSettings.showInlineBreakpointCandidates && session ? requestBreakpointCandidateLocations(this.editor.getModel(), desiredBreakpointDecorations.map((bp) => bp.range.startLineNumber), session) : Promise.resolve([]);
    const desiredCandidatePositionsRaced = await Promise.race([desiredCandidatePositions, timeout(500).then(() => void 0)]);
    if (desiredCandidatePositionsRaced === void 0) {
      desiredCandidatePositions.then((v2) => activeCodeEditor.changeDecorations((d) => setCandidateDecorations(d, v2)));
    }
    try {
      this.ignoreDecorationsChangedEvent = true;
      activeCodeEditor.changeDecorations((changeAccessor) => {
        const decorationIds = changeAccessor.deltaDecorations(this.breakpointDecorations.map((bpd) => bpd.decorationId), desiredBreakpointDecorations);
        this.breakpointDecorations.forEach((bpd) => {
          bpd.inlineWidget?.dispose();
        });
        this.breakpointDecorations = decorationIds.map((decorationId, index2) => {
          let inlineWidget = void 0;
          const breakpoint2 = breakpoints[index2];
          if (desiredBreakpointDecorations[index2].options.before) {
            const contextMenuActions = () => this.getContextMenuActions([breakpoint2], activeCodeEditor.getModel().uri, breakpoint2.lineNumber, breakpoint2.column);
            inlineWidget = new InlineBreakpointWidget(activeCodeEditor, decorationId, desiredBreakpointDecorations[index2].options.glyphMarginClassName, breakpoint2, this.debugService, this.contextMenuService, contextMenuActions);
          }
          return {
            decorationId,
            breakpoint: breakpoint2,
            range: desiredBreakpointDecorations[index2].range,
            inlineWidget
          };
        });
        if (desiredCandidatePositionsRaced) {
          setCandidateDecorations(changeAccessor, desiredCandidatePositionsRaced);
        }
      });
    } finally {
      this.ignoreDecorationsChangedEvent = false;
    }
    for (const d of this.breakpointDecorations) {
      if (d.inlineWidget) {
        this.editor.layoutContentWidget(d.inlineWidget);
      }
    }
  }
  async onModelDecorationsChanged() {
    if (this.breakpointDecorations.length === 0 || this.ignoreDecorationsChangedEvent || !this.editor.hasModel()) {
      return;
    }
    let somethingChanged = false;
    const model = this.editor.getModel();
    this.breakpointDecorations.forEach((breakpointDecoration) => {
      if (somethingChanged) {
        return;
      }
      const newBreakpointRange = model.getDecorationRange(breakpointDecoration.decorationId);
      if (newBreakpointRange && !breakpointDecoration.range.equalsRange(newBreakpointRange)) {
        somethingChanged = true;
        breakpointDecoration.range = newBreakpointRange;
      }
    });
    if (!somethingChanged) {
      return;
    }
    const data = /* @__PURE__ */ new Map();
    for (let i2 = 0, len = this.breakpointDecorations.length; i2 < len; i2++) {
      const breakpointDecoration = this.breakpointDecorations[i2];
      const decorationRange = model.getDecorationRange(breakpointDecoration.decorationId);
      if (decorationRange) {
        if (breakpointDecoration.breakpoint) {
          data.set(breakpointDecoration.breakpoint.getId(), {
            lineNumber: decorationRange.startLineNumber,
            column: breakpointDecoration.breakpoint.column ? decorationRange.startColumn : void 0
          });
        }
      }
    }
    try {
      this.ignoreBreakpointsChangeEvent = true;
      await this.debugService.updateBreakpoints(model.uri, data, true);
    } finally {
      this.ignoreBreakpointsChangeEvent = false;
    }
  }
  // breakpoint widget
  showBreakpointWidget(lineNumber, column, context2) {
    this.breakpointWidget?.dispose();
    this.breakpointWidget = this.instantiationService.createInstance(BreakpointWidget, this.editor, lineNumber, column, context2);
    this.breakpointWidget.show({ lineNumber, column: 1 });
    this.breakpointWidgetVisible.set(true);
  }
  closeBreakpointWidget() {
    if (this.breakpointWidget) {
      this.breakpointWidget.dispose();
      this.breakpointWidget = void 0;
      this.breakpointWidgetVisible.reset();
      this.editor.focus();
    }
  }
  dispose() {
    this.breakpointWidget?.dispose();
    this.setDecorationsScheduler.dispose();
    this.editor.removeDecorations(this.breakpointDecorations.map((bpd) => bpd.decorationId));
    dispose(this.toDispose);
  }
};

BreakpointEditorContribution = __decorateClass([
  __decorateParam(1, IDebugService),
  __decorateParam(2, IContextMenuService),
  __decorateParam(3, IInstantiationService),
  __decorateParam(4, IContextKeyService),
  __decorateParam(5, IDialogService),
  __decorateParam(6, IConfigurationService),
  __decorateParam(7, ILabelService)
], BreakpointEditorContribution);

GutterActionsRegistry.registerGutterActionsGenerator(({ lineNumber, editor, accessor }, result) => {
  const model = editor.getModel();
  const debugService = accessor.get(IDebugService);
  if (!model || !debugService.getAdapterManager().hasEnabledDebuggers() || !debugService.canSetBreakpointsIn(model)) {
    return;
  }
  const breakpointEditorContribution = editor.getContribution(BREAKPOINT_EDITOR_CONTRIBUTION_ID);
  if (!breakpointEditorContribution) {
    return;
  }
  const actions = breakpointEditorContribution.getContextMenuActionsAtPosition(lineNumber, model);
  for (const action of actions) {
    result.push(action, "2_debug");
  }
});

var InlineBreakpointWidget = class {
  constructor(editor, decorationId, cssClass, breakpoint2, debugService, contextMenuService, getContextMenuActions4) {
    this.editor = editor;
    this.decorationId = decorationId;
    this.breakpoint = breakpoint2;
    this.debugService = debugService;
    this.contextMenuService = contextMenuService;
    this.getContextMenuActions = getContextMenuActions4;
    // editor.IContentWidget.allowEditorOverflow
    this.allowEditorOverflow = false;
    this.suppressMouseDown = true;
    this.toDispose = [];
    this.range = this.editor.getModel().getDecorationRange(decorationId);
    this.toDispose.push(this.editor.onDidChangeModelDecorations(() => {
      const model = this.editor.getModel();
      const range2 = model.getDecorationRange(this.decorationId);
      if (this.range && !this.range.equalsRange(range2)) {
        this.range = range2;
        this.editor.layoutContentWidget(this);
        this.updateSize();
      }
    }));
    this.create(cssClass);
    this.editor.addContentWidget(this);
    this.editor.layoutContentWidget(this);
  }
  create(cssClass) {
    this.domNode = $65(".inline-breakpoint-widget");
    if (cssClass) {
      this.domNode.classList.add(...cssClass.split(" "));
    }
    this.toDispose.push(addDisposableListener(this.domNode, EventType.CLICK, async (e) => {
      switch (this.breakpoint?.enabled) {
        case void 0:
          await this.debugService.addBreakpoints(this.editor.getModel().uri, [{ lineNumber: this.range.startLineNumber, column: this.range.startColumn }]);
          break;
        case true:
          await this.debugService.removeBreakpoints(this.breakpoint.getId());
          break;
        case false:
          this.debugService.enableOrDisableBreakpoints(true, this.breakpoint);
          break;
      }
    }));
    this.toDispose.push(addDisposableListener(this.domNode, EventType.CONTEXT_MENU, (e) => {
      const event = new StandardMouseEvent(getWindow(this.domNode), e);
      const actions = this.getContextMenuActions();
      this.contextMenuService.showContextMenu({
        getAnchor: () => event,
        getActions: () => actions,
        getActionsContext: () => this.breakpoint,
        onHide: () => disposeIfDisposable(actions)
      });
    }));
    this.updateSize();
    this.toDispose.push(this.editor.onDidChangeConfiguration((c) => {
      if (c.hasChanged(61 /* fontSize */) || c.hasChanged(75 /* lineHeight */)) {
        this.updateSize();
      }
    }));
  }
  updateSize() {
    const lineHeight = this.range ? this.editor.getLineHeightForPosition(this.range.getStartPosition()) : this.editor.getOption(75 /* lineHeight */);
    this.domNode.style.height = `${lineHeight}px`;
    this.domNode.style.width = `${Math.ceil(0.8 * lineHeight)}px`;
    this.domNode.style.marginLeft = `4px`;
  }
  getId() {
    return generateUuid();
  }
  getDomNode() {
    return this.domNode;
  }
  getPosition() {
    if (!this.range) {
      return null;
    }
    this.domNode.classList.toggle("line-start", this.range.startColumn === 1);
    return {
      position: { lineNumber: this.range.startLineNumber, column: this.range.startColumn - 1 },
      preference: [0 /* EXACT */]
    };
  }
  dispose() {
    this.editor.removeContentWidget(this);
    dispose(this.toDispose);
  }
};

__decorateClass([
  memoize
], InlineBreakpointWidget.prototype, "getId", 1);

registerThemingParticipant((theme, collector) => {
  const scope = ".monaco-editor .glyph-margin-widgets, .monaco-workbench .debug-breakpoints, .monaco-workbench .disassembly-view, .monaco-editor .contentWidgets";
  const debugIconBreakpointColor = theme.getColor(debugIconBreakpointForeground);
  if (debugIconBreakpointColor) {
    collector.addRule(`${scope} {
			${allBreakpoints.map((b) => `${ThemeIcon.asCSSSelector(b.regular)}`).join(",\n		")},
			${ThemeIcon.asCSSSelector(debugBreakpointUnsupported)},
			${ThemeIcon.asCSSSelector(debugBreakpointHint)}:not([class*='codicon-debug-breakpoint']):not([class*='codicon-debug-stackframe']),
			${ThemeIcon.asCSSSelector(breakpoint.regular)}${ThemeIcon.asCSSSelector(debugStackframeFocused)}::after,
			${ThemeIcon.asCSSSelector(breakpoint.regular)}${ThemeIcon.asCSSSelector(debugStackframe)}::after {
				color: ${debugIconBreakpointColor} !important;
			}
		}`);
    collector.addRule(`${scope} {
			${ThemeIcon.asCSSSelector(breakpoint.pending)} {
				color: ${debugIconBreakpointColor} !important;
				font-size: 12px !important;
			}
		}`);
  }
  const debugIconBreakpointDisabledColor = theme.getColor(debugIconBreakpointDisabledForeground);
  if (debugIconBreakpointDisabledColor) {
    collector.addRule(`${scope} {
			${allBreakpoints.map((b) => ThemeIcon.asCSSSelector(b.disabled)).join(",\n		")} {
				color: ${debugIconBreakpointDisabledColor};
			}
		}`);
  }
  const debugIconBreakpointUnverifiedColor = theme.getColor(debugIconBreakpointUnverifiedForeground);
  if (debugIconBreakpointUnverifiedColor) {
    collector.addRule(`${scope} {
			${allBreakpoints.map((b) => ThemeIcon.asCSSSelector(b.unverified)).join(",\n		")} {
				color: ${debugIconBreakpointUnverifiedColor};
			}
		}`);
  }
  const debugIconBreakpointCurrentStackframeForegroundColor = theme.getColor(debugIconBreakpointCurrentStackframeForeground);
  if (debugIconBreakpointCurrentStackframeForegroundColor) {
    collector.addRule(`
		.monaco-editor .debug-top-stack-frame-column {
			color: ${debugIconBreakpointCurrentStackframeForegroundColor} !important;
		}
		${scope} {
			${ThemeIcon.asCSSSelector(debugStackframe)} {
				color: ${debugIconBreakpointCurrentStackframeForegroundColor} !important;
			}
		}
		`);
  }
  const debugIconBreakpointStackframeFocusedColor = theme.getColor(debugIconBreakpointStackframeForeground);
  if (debugIconBreakpointStackframeFocusedColor) {
    collector.addRule(`${scope} {
			${ThemeIcon.asCSSSelector(debugStackframeFocused)} {
				color: ${debugIconBreakpointStackframeFocusedColor} !important;
			}
		}`);
  }
});

var debugIconBreakpointForeground = registerColor("debugIcon.breakpointForeground", "#E51400", localize(14113, null));

var debugIconBreakpointDisabledForeground = registerColor("debugIcon.breakpointDisabledForeground", "#848484", localize(14112, null));

var debugIconBreakpointUnverifiedForeground = registerColor("debugIcon.breakpointUnverifiedForeground", "#848484", localize(14115, null));

var debugIconBreakpointCurrentStackframeForeground = registerColor("debugIcon.breakpointCurrentStackframeForeground", { dark: "#FFCC00", light: "#BE8700", hcDark: "#FFCC00", hcLight: "#BE8700" }, localize(14111, null));

var debugIconBreakpointStackframeForeground = registerColor("debugIcon.breakpointStackframeForeground", "#89D185", localize(14114, null));
export { createBreakpointDecorations, getBreakpointDecorationOptions, requestBreakpointCandidateLocations, createCandidateDecorations, $65, breakpointHelperDecoration, BreakpointEditorContribution, InlineBreakpointWidget, debugIconBreakpointForeground, debugIconBreakpointDisabledForeground, debugIconBreakpointUnverifiedForeground, debugIconBreakpointCurrentStackframeForeground, debugIconBreakpointStackframeForeground };
