// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/codeEditor/browser/find/simpleFindWidget.ts
import { localize } from "./module-0001.mjs";
import { Widget } from "./module-0252.mjs";
import { FindReplaceState } from "./module-0674.mjs";
import { ContextScopedFindInput } from "./module-0603.mjs";
import { showHistoryKeybindingHint } from "./module-0604.mjs";
import { defaultInputBoxStyles, defaultToggleStyles } from "./module-0513.mjs";
import { Delayer, disposableTimeout } from "./module-0036.mjs";
import { NLS_MATCHES_LOCATION, NLS_NO_RESULTS, SimpleButton, findNextMatchIcon, findPreviousMatchIcon } from "./module-0605.mjs";
import { widgetClose } from "./module-0479.mjs";
import { addDisposableListener, getComputedStyle, trackFocus } from "./module-0075.mjs";
import { Sash } from "./module-0496.mjs";
import { format2 } from "./module-0030.mjs";
import { status } from "./module-0076.mjs";
import { registerColor } from "./module-0226.mjs";
import { registerThemingParticipant } from "./module-0287.mjs";


// src/vs/workbench/contrib/codeEditor/browser/find/simpleFindWidget.ts
var NLS_FIND_INPUT_LABEL2 = localize(13795, null);

var NLS_FIND_INPUT_PLACEHOLDER2 = localize(13798, null);

var NLS_PREVIOUS_MATCH_BTN_LABEL2 = localize(13797, null);

var NLS_NEXT_MATCH_BTN_LABEL2 = localize(13796, null);

var NLS_CLOSE_BTN_LABEL2 = localize(13794, null);

var SIMPLE_FIND_WIDGET_INITIAL_WIDTH = 310;

var MATCHES_COUNT_WIDTH = 73;

var SimpleFindWidget = class extends Widget {
  constructor(options3, contextViewService, contextKeyService, hoverService, _keybindingService, _configurationService, _accessibilityService) {
    super();
    this._keybindingService = _keybindingService;
    this._configurationService = _configurationService;
    this._accessibilityService = _accessibilityService;
    this._isVisible = false;
    this._foundMatch = false;
    this._width = 0;
    /**
     * Tracks whether the accessibility help hint has been announced in the ARIA label.
     * Reset to false when the widget is hidden, allowing the hint to be announced again
     * on the next reveal.
     */
    this._accessibilityHelpHintAnnounced = false;
    this.state = this._register(new FindReplaceState());
    this._matchesLimit = options3.matchesLimit ?? Number.MAX_SAFE_INTEGER;
    this._findInput = this._register(new ContextScopedFindInput(null, contextViewService, {
      label: NLS_FIND_INPUT_LABEL2,
      placeholder: NLS_FIND_INPUT_PLACEHOLDER2,
      validation: (value2) => {
        if (value2.length === 0 || !this._findInput.getRegex()) {
          return null;
        }
        try {
          new RegExp(value2);
          return null;
        } catch (e) {
          this._foundMatch = false;
          this.updateButtons(this._foundMatch);
          return { content: e.message };
        }
      },
      showCommonFindToggles: options3.showCommonFindToggles,
      appendCaseSensitiveLabel: options3.appendCaseSensitiveActionId ? this._getKeybinding(options3.appendCaseSensitiveActionId) : void 0,
      appendRegexLabel: options3.appendRegexActionId ? this._getKeybinding(options3.appendRegexActionId) : void 0,
      appendWholeWordsLabel: options3.appendWholeWordsActionId ? this._getKeybinding(options3.appendWholeWordsActionId) : void 0,
      showHistoryHint: () => showHistoryKeybindingHint(_keybindingService),
      inputBoxStyles: defaultInputBoxStyles,
      toggleStyles: defaultToggleStyles
    }, contextKeyService));
    this._updateHistoryDelayer = this._register(new Delayer(500));
    this._register(this._findInput.onInput(async (e) => {
      if (!options3.checkImeCompletionState || !this._findInput.isImeSessionInProgress) {
        this._foundMatch = this._onInputChanged();
        if (options3.showResultCount) {
          await this.updateResultCount();
        }
        this.updateButtons(this._foundMatch);
        this.focusFindBox();
        this._delayedUpdateHistory();
      }
    }));
    this._findInput.setRegex(!!this.state.isRegex);
    this._findInput.setCaseSensitive(!!this.state.matchCase);
    this._findInput.setWholeWords(!!this.state.wholeWord);
    this._register(this._findInput.onDidOptionChange(() => {
      this.state.change({
        isRegex: this._findInput.getRegex(),
        wholeWord: this._findInput.getWholeWords(),
        matchCase: this._findInput.getCaseSensitive()
      }, true);
    }));
    this._register(this.state.onFindReplaceStateChange(() => {
      this._findInput.setRegex(this.state.isRegex);
      this._findInput.setWholeWords(this.state.wholeWord);
      this._findInput.setCaseSensitive(this.state.matchCase);
      this.findFirst();
    }));
    const hoverLifecycleOptions2 = { groupId: "simple-find-widget" };
    this.prevBtn = this._register(new SimpleButton({
      label: NLS_PREVIOUS_MATCH_BTN_LABEL2 + (options3.previousMatchActionId ? this._getKeybinding(options3.previousMatchActionId) : ""),
      icon: findPreviousMatchIcon,
      hoverLifecycleOptions: hoverLifecycleOptions2,
      onTrigger: () => {
        this.find(true);
      }
    }, hoverService));
    this.nextBtn = this._register(new SimpleButton({
      label: NLS_NEXT_MATCH_BTN_LABEL2 + (options3.nextMatchActionId ? this._getKeybinding(options3.nextMatchActionId) : ""),
      icon: findNextMatchIcon,
      hoverLifecycleOptions: hoverLifecycleOptions2,
      onTrigger: () => {
        this.find(false);
      }
    }, hoverService));
    const closeBtn = this._register(new SimpleButton({
      label: NLS_CLOSE_BTN_LABEL2 + (options3.closeWidgetActionId ? this._getKeybinding(options3.closeWidgetActionId) : ""),
      icon: widgetClose,
      hoverLifecycleOptions: hoverLifecycleOptions2,
      onTrigger: () => {
        this.hide();
      }
    }, hoverService));
    this._innerDomNode = document.createElement("div");
    this._innerDomNode.classList.add("simple-find-part");
    this._innerDomNode.appendChild(this._findInput.domNode);
    this._innerDomNode.appendChild(this.prevBtn.domNode);
    this._innerDomNode.appendChild(this.nextBtn.domNode);
    this._innerDomNode.appendChild(closeBtn.domNode);
    this._domNode = document.createElement("div");
    this._domNode.classList.add("simple-find-part-wrapper");
    this._domNode.appendChild(this._innerDomNode);
    this.onkeyup(this._innerDomNode, (e) => {
      if (e.equals(9 /* Escape */)) {
        this.hide();
        e.preventDefault();
        return;
      }
    });
    this._focusTracker = this._register(trackFocus(this._innerDomNode));
    this._register(this._focusTracker.onDidFocus(this._onFocusTrackerFocus.bind(this)));
    this._register(this._focusTracker.onDidBlur(this._onFocusTrackerBlur.bind(this)));
    this._findInputFocusTracker = this._register(trackFocus(this._findInput.domNode));
    this._register(this._findInputFocusTracker.onDidFocus(this._onFindInputFocusTrackerFocus.bind(this)));
    this._register(this._findInputFocusTracker.onDidBlur(this._onFindInputFocusTrackerBlur.bind(this)));
    this._register(addDisposableListener(this._innerDomNode, "click", (event) => {
      event.stopPropagation();
    }));
    if (options3?.showResultCount) {
      this._domNode.classList.add("result-count");
      this._matchesCount = document.createElement("div");
      this._matchesCount.className = "matchesCount";
      this._findInput.domNode.insertAdjacentElement("afterend", this._matchesCount);
      this._register(this._findInput.onDidChange(async () => {
        await this.updateResultCount();
      }));
      this._register(this._findInput.onDidOptionChange(async () => {
        this._foundMatch = this._onInputChanged();
        await this.updateResultCount();
        this.focusFindBox();
        this._delayedUpdateHistory();
      }));
    }
    let initialMinWidth = options3?.initialWidth;
    if (initialMinWidth) {
      initialMinWidth = initialMinWidth < SIMPLE_FIND_WIDGET_INITIAL_WIDTH ? SIMPLE_FIND_WIDGET_INITIAL_WIDTH : initialMinWidth;
      this._domNode.style.width = `${initialMinWidth}px`;
    }
    if (options3?.enableSash) {
      const _initialMinWidth = initialMinWidth ?? SIMPLE_FIND_WIDGET_INITIAL_WIDTH;
      let originalWidth = _initialMinWidth;
      const resizeSash = this._register(new Sash(this._innerDomNode, this, { orientation: 0 /* VERTICAL */, size: 1 }));
      this._register(resizeSash.onDidStart(() => {
        originalWidth = parseFloat(getComputedStyle(this._domNode).width);
      }));
      this._register(resizeSash.onDidChange((e) => {
        const width2 = originalWidth + e.startX - e.currentX;
        if (width2 < _initialMinWidth) {
          return;
        }
        this._domNode.style.width = `${width2}px`;
      }));
      this._register(resizeSash.onDidReset((e) => {
        const currentWidth = parseFloat(getComputedStyle(this._domNode).width);
        if (currentWidth === _initialMinWidth) {
          this._domNode.style.width = "100%";
        } else {
          this._domNode.style.width = `${_initialMinWidth}px`;
        }
      }));
    }
  }
  getVerticalSashLeft(_sash) {
    return 0;
  }
  get inputValue() {
    return this._findInput.getValue();
  }
  get focusTracker() {
    return this._focusTracker;
  }
  _getKeybinding(actionId) {
    return this._keybindingService.appendKeybinding("", actionId);
  }
  dispose() {
    super.dispose();
    this._domNode?.remove();
  }
  isVisible() {
    return this._isVisible;
  }
  getDomNode() {
    return this._domNode;
  }
  getFindInputDomNode() {
    return this._findInput.domNode;
  }
  reveal(initialInput, animated = true) {
    if (initialInput) {
      this._findInput.setValue(initialInput);
    }
    if (this._isVisible) {
      this._findInput.select();
      return;
    }
    this._isVisible = true;
    this._updateFindInputAriaLabel();
    this.updateResultCount();
    this.layout();
    setTimeout(() => {
      this._innerDomNode.classList.toggle("suppress-transition", !animated);
      this._innerDomNode.classList.add("visible", "visible-transition");
      this._innerDomNode.setAttribute("aria-hidden", "false");
      this._findInput.select();
      if (!animated) {
        setTimeout(() => {
          this._innerDomNode.classList.remove("suppress-transition");
        }, 0);
      }
    }, 0);
  }
  show(initialInput) {
    if (initialInput && !this._isVisible) {
      this._findInput.setValue(initialInput);
    }
    this._isVisible = true;
    this.layout();
    setTimeout(() => {
      this._innerDomNode.classList.add("visible", "visible-transition");
      this._innerDomNode.setAttribute("aria-hidden", "false");
    }, 0);
  }
  hide(animated = true) {
    if (this._isVisible) {
      this._accessibilityHelpHintAnnounced = false;
      this._innerDomNode.classList.toggle("suppress-transition", !animated);
      this._innerDomNode.classList.remove("visible-transition");
      this._innerDomNode.setAttribute("aria-hidden", "true");
      setTimeout(() => {
        this._isVisible = false;
        this.updateButtons(this._foundMatch);
        this._innerDomNode.classList.remove("visible", "suppress-transition");
      }, animated ? 200 : 0);
    }
  }
  layout(width2 = this._width) {
    this._width = width2;
    if (!this._isVisible) {
      return;
    }
    if (this._matchesCount) {
      let reducedFindWidget = false;
      if (SIMPLE_FIND_WIDGET_INITIAL_WIDTH + MATCHES_COUNT_WIDTH + 28 >= width2) {
        reducedFindWidget = true;
      }
      this._innerDomNode.classList.toggle("reduced-find-widget", reducedFindWidget);
    }
  }
  _delayedUpdateHistory() {
    this._updateHistoryDelayer.trigger(this._updateHistory.bind(this));
  }
  _updateHistory() {
    this._findInput.inputBox.addToHistory();
  }
  _getRegexValue() {
    return this._findInput.getRegex();
  }
  _getWholeWordValue() {
    return this._findInput.getWholeWords();
  }
  _getCaseSensitiveValue() {
    return this._findInput.getCaseSensitive();
  }
  updateButtons(foundMatch) {
    const hasInput = this.inputValue.length > 0;
    this.prevBtn.setEnabled(this._isVisible && hasInput && foundMatch);
    this.nextBtn.setEnabled(this._isVisible && hasInput && foundMatch);
  }
  focusFindBox() {
    this.nextBtn.focus();
    this._findInput.inputBox.focus();
  }
  async updateResultCount() {
    if (!this._matchesCount) {
      this.updateButtons(this._foundMatch);
      return;
    }
    const count2 = await this._getResultCount();
    this._matchesCount.textContent = "";
    const showRedOutline = this.inputValue.length > 0 && count2?.resultCount === 0;
    this._matchesCount.classList.toggle("no-results", showRedOutline);
    let label3 = "";
    if (count2?.resultCount) {
      let matchesCount = String(count2.resultCount);
      if (count2.resultCount >= this._matchesLimit) {
        matchesCount += "+";
      }
      let matchesPosition = String(count2.resultIndex + 1);
      if (matchesPosition === "0") {
        matchesPosition = "?";
      }
      label3 = format2(NLS_MATCHES_LOCATION, matchesPosition, matchesCount);
    } else {
      label3 = NLS_NO_RESULTS;
    }
    status(this._announceSearchResults(label3, this.inputValue));
    this._matchesCount.appendChild(document.createTextNode(label3));
    this._foundMatch = !!count2 && count2.resultCount > 0;
    this.updateButtons(this._foundMatch);
  }
  changeState(state) {
    this.state.change(state, false);
  }
  /**
   * Updates the ARIA label of the find input box.
   * When a screen reader is active and the accessibility verbosity setting is enabled,
   * includes a hint about pressing Alt+F1 for accessibility help on first reveal.
   * The hint is only announced once per show/hide cycle to prevent double-speak.
   */
  _updateFindInputAriaLabel() {
    let findLabel = NLS_FIND_INPUT_LABEL2;
    if (!this._accessibilityHelpHintAnnounced && this._configurationService.getValue("accessibility.verbosity.find") && this._accessibilityService.isScreenReaderOptimized()) {
      const keybinding = this._keybindingService.lookupKeybinding("editor.action.accessibilityHelp")?.getAriaLabel();
      if (keybinding) {
        findLabel += ", " + localize(13789, null, keybinding);
        this._accessibilityHelpHintAnnounced = true;
        this._labelResetTimeout?.dispose();
        this._labelResetTimeout = disposableTimeout(() => {
          if (this._isVisible) {
            this._findInput.inputBox.setAriaLabel(NLS_FIND_INPUT_LABEL2);
          }
        }, 1e3);
      }
    }
    this._findInput.inputBox.setAriaLabel(findLabel);
  }
  _announceSearchResults(label3, searchString) {
    if (!searchString) {
      return localize(13790, null);
    }
    if (label3 === NLS_NO_RESULTS) {
      return searchString === "" ? localize(13792, null, label3) : localize(13791, null, label3, searchString);
    }
    return localize(13793, null, label3, searchString);
  }
};

var simpleFindWidgetSashBorder = registerColor("simpleFindWidget.sashBorder", { dark: "#454545", light: "#C8C8C8", hcDark: "#6FC3DF", hcLight: "#0F4A85" }, localize(13799, null));

registerThemingParticipant((theme, collector) => {
  const resizeBorderBackground = theme.getColor(simpleFindWidgetSashBorder);
  collector.addRule(`.monaco-workbench .simple-find-part .monaco-sash { background-color: ${resizeBorderBackground}; border-color: ${resizeBorderBackground} }`);
});
export { NLS_FIND_INPUT_LABEL2, NLS_FIND_INPUT_PLACEHOLDER2, NLS_PREVIOUS_MATCH_BTN_LABEL2, NLS_NEXT_MATCH_BTN_LABEL2, NLS_CLOSE_BTN_LABEL2, SIMPLE_FIND_WIDGET_INITIAL_WIDTH, MATCHES_COUNT_WIDTH, SimpleFindWidget, simpleFindWidgetSashBorder };
