// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/debug/browser/exceptionWidget.ts
import { $, append, isAncestorOfActiveElement } from "./module-0075.mjs";
import { registerColor } from "./module-0226.mjs";
import { localize } from "./module-0001.mjs";
import { ZoneWidget } from "./module-0622.mjs";
import { RunOnceScheduler } from "./module-0036.mjs";
import { ActionBar } from "./module-0477.mjs";
import { Action } from "./module-0082.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { Codicon } from "./module-0085.mjs";
import { widgetClose } from "./module-0479.mjs";
import { EDITOR_CONTRIBUTION_ID } from "./module-1058.mjs";
import { LinkDetector2 } from "./module-2382.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IThemeService } from "./module-0287.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IClipboardService } from "./module-0487.mjs";


// src/vs/workbench/contrib/debug/browser/exceptionWidget.ts
var $62 = $;

var debugExceptionWidgetBorder = registerColor("debugExceptionWidget.border", "#a31515", localize(14604, null));

var debugExceptionWidgetBackground = registerColor("debugExceptionWidget.background", { dark: "#420b0d", light: "#f1dfde", hcDark: "#420b0d", hcLight: "#f1dfde" }, localize(14603, null));

var ExceptionWidget = class extends ZoneWidget {
  constructor(editor, exceptionInfo, debugSession, shouldScroll, themeService, instantiationService, clipboardService) {
    super(editor, { showFrame: true, showArrow: true, isAccessible: true, frameWidth: 1, className: "exception-widget-container" });
    this.exceptionInfo = exceptionInfo;
    this.debugSession = debugSession;
    this.shouldScroll = shouldScroll;
    this.instantiationService = instantiationService;
    this.clipboardService = clipboardService;
    this.applyTheme(themeService.getColorTheme());
    this._disposables.add(themeService.onDidColorThemeChange(this.applyTheme.bind(this)));
    this.create();
    const onDidLayoutChangeScheduler = new RunOnceScheduler(() => this._doLayout(void 0, void 0), 50);
    this._disposables.add(this.editor.onDidLayoutChange(() => onDidLayoutChangeScheduler.schedule()));
    this._disposables.add(onDidLayoutChangeScheduler);
  }
  applyTheme(theme) {
    this.backgroundColor = theme.getColor(debugExceptionWidgetBackground);
    const frameColor = theme.getColor(debugExceptionWidgetBorder);
    this.style({
      arrowColor: frameColor,
      frameColor
    });
  }
  _applyStyles() {
    if (this.container) {
      this.container.style.backgroundColor = this.backgroundColor ? this.backgroundColor.toString() : "";
    }
    super._applyStyles();
  }
  _fillContainer(container2) {
    this.setCssClass("exception-widget");
    const fontInfo = this.editor.getOption(59 /* fontInfo */);
    container2.style.fontSize = `${fontInfo.fontSize}px`;
    container2.style.lineHeight = `${fontInfo.lineHeight}px`;
    container2.tabIndex = 0;
    const title = $62(".title");
    const label3 = $62(".label");
    append(title, label3);
    const actions = $62(".actions");
    append(title, actions);
    label3.textContent = this.exceptionInfo.id ? localize(14606, null, this.exceptionInfo.id) : localize(14605, null);
    let ariaLabel = label3.textContent;
    const actionBar3 = this._disposables.add(new ActionBar(actions));
    actionBar3.push(new Action("editor.copyExceptionInfo", localize(14602, null), ThemeIcon.asClassName(Codicon.copy), true, async () => {
      const clipboardText = this.buildExceptionText();
      await this.clipboardService.writeText(clipboardText);
    }), { label: false, icon: true });
    actionBar3.push(new Action("editor.closeExceptionWidget", localize(14601, null), ThemeIcon.asClassName(widgetClose), true, async () => {
      const contribution = this.editor.getContribution(EDITOR_CONTRIBUTION_ID);
      contribution?.closeExceptionWidget();
    }), { label: false, icon: true });
    append(container2, title);
    if (this.exceptionInfo.description) {
      const description = $62(".description");
      description.textContent = this.exceptionInfo.description;
      ariaLabel += ", " + this.exceptionInfo.description;
      append(container2, description);
    }
    if (this.exceptionInfo.details && this.exceptionInfo.details.stackTrace) {
      const stackTrace = $62(".stack-trace");
      const linkDetector = this.instantiationService.createInstance(LinkDetector2);
      const hoverBehaviour = {
        store: this._disposables,
        type: 0 /* Rich */
      };
      const linkedStackTrace = linkDetector.linkify(this.exceptionInfo.details.stackTrace, hoverBehaviour, true, this.debugSession ? this.debugSession.root : void 0, void 0);
      stackTrace.appendChild(linkedStackTrace);
      append(container2, stackTrace);
      ariaLabel += ", " + this.exceptionInfo.details.stackTrace;
    }
    container2.setAttribute("aria-label", ariaLabel);
  }
  _doLayout(_heightInPixel, _widthInPixel) {
    this.container.style.height = "initial";
    const lineHeight = this.editor.getOption(75 /* lineHeight */);
    const arrowHeight = Math.round(lineHeight / 3);
    const computedLinesNumber = Math.ceil((this.container.offsetHeight + arrowHeight) / lineHeight);
    this._relayout(computedLinesNumber);
  }
  revealRange(range2, isLastLine) {
    if (this.shouldScroll()) {
      super.revealRange(range2, isLastLine);
    }
  }
  buildExceptionText() {
    const parts = [];
    if (this.exceptionInfo.id) {
      parts.push(localize(14606, null, this.exceptionInfo.id));
    } else {
      parts.push(localize(14605, null));
    }
    if (this.exceptionInfo.description) {
      parts.push(this.exceptionInfo.description);
    }
    if (this.exceptionInfo.details?.stackTrace) {
      parts.push(this.exceptionInfo.details.stackTrace);
    }
    return parts.join("\n");
  }
  focus() {
    this.container?.focus();
  }
  hasFocus() {
    if (!this.container) {
      return false;
    }
    return isAncestorOfActiveElement(this.container);
  }
  getWhitespaceHeight() {
    if (!this._viewZone || !this._viewZone.id) {
      return 0;
    }
    const whitespaces = this.editor.getWhitespaces();
    const whitespace = whitespaces.find((ws) => ws.id === this._viewZone.id);
    return whitespace ? whitespace.height : 0;
  }
};

ExceptionWidget = __decorateClass([
  __decorateParam(4, IThemeService),
  __decorateParam(5, IInstantiationService),
  __decorateParam(6, IClipboardService)
], ExceptionWidget);
export { $62, debugExceptionWidgetBorder, debugExceptionWidgetBackground, ExceptionWidget };
