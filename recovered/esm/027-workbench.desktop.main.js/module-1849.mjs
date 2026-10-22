// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/preferences/browser/settingsEditorSettingIndicators.ts
import { $, EventType, addDisposableListener, append } from "./module-0075.mjs";
import { DisposableStore, MutableDisposable } from "./module-0012.mjs";
import { SimpleIconLabel } from "./module-1553.mjs";
import { localize } from "./module-0001.mjs";
import { ADVANCED_INDICATOR_DESCRIPTION, EXPERIMENTAL_INDICATOR_DESCRIPTION, POLICY_SETTING_TAG, PREVIEW_INDICATOR_DESCRIPTION } from "./module-1831.mjs";
import { StandardKeyboardEvent } from "./module-0022.mjs";
import { MarkdownString, createMarkdownLink } from "./module-0462.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IWorkbenchConfigurationService } from "./module-1198.mjs";
import { IHoverService } from "./module-0520.mjs";
import { IUserDataSyncEnablementService } from "./module-1696.mjs";
import { ILanguageService } from "./module-0133.mjs";
import { ICommandService } from "./module-0087.mjs";
import { URI } from "./module-0032.mjs";
import { Schemas } from "./module-0033.mjs";


// src/vs/workbench/contrib/preferences/browser/settingsEditorSettingIndicators.ts
var $25 = $;

var cachedSyncIgnoredSettingsSet = /* @__PURE__ */ new Set();

var cachedSyncIgnoredSettings = [];

var SettingsTreeIndicatorsLabel = class {
  constructor(container3, configurationService, hoverService, userDataSyncEnablementService, languageService, commandService) {
    this.configurationService = configurationService;
    this.hoverService = hoverService;
    this.userDataSyncEnablementService = userDataSyncEnablementService;
    this.languageService = languageService;
    this.commandService = commandService;
    /** Indicators that each have their own square container at the top-right of the setting */
    this.isolatedIndicators = [];
    this.keybindingListeners = new DisposableStore();
    this.previewHover = new MutableDisposable();
    this.focusedIndex = 0;
    this.defaultHoverOptions = {
      trapFocus: true,
      style: 1 /* Pointer */,
      position: {
        hoverPosition: 2 /* BELOW */
      }
    };
    this.indicatorsContainerElement = append(container3, $25(".setting-indicators-container"));
    this.indicatorsContainerElement.style.display = "inline";
    this.previewIndicator = this.createPreviewIndicator();
    this.advancedIndicator = this.createAdvancedIndicator();
    this.isolatedIndicators = [this.previewIndicator, this.advancedIndicator];
    this.workspaceTrustIndicator = this.createWorkspaceTrustIndicator();
    this.scopeOverridesIndicator = this.createScopeOverridesIndicator();
    this.syncIgnoredIndicator = this.createSyncIgnoredIndicator();
    this.defaultOverrideIndicator = this.createDefaultOverrideIndicator();
    this.parenthesizedIndicators = [this.workspaceTrustIndicator, this.scopeOverridesIndicator, this.syncIgnoredIndicator, this.defaultOverrideIndicator];
  }
  createWorkspaceTrustIndicator() {
    const disposables = new DisposableStore();
    const workspaceTrustElement = $25("span.setting-indicator.setting-item-workspace-trust");
    const workspaceTrustLabel = disposables.add(new SimpleIconLabel(workspaceTrustElement));
    workspaceTrustLabel.text = "$(shield) " + localize(18241, null);
    const content2 = localize(18237, null);
    disposables.add(this.hoverService.setupDelayedHover(workspaceTrustElement, () => ({
      ...this.defaultHoverOptions,
      content: content2,
      actions: [{
        label: localize(18223, null),
        commandId: "workbench.trust.manage",
        run: (target) => {
          this.commandService.executeCommand("workbench.trust.manage");
        }
      }]
    }), { setupKeyboardEvents: true }));
    return {
      element: workspaceTrustElement,
      label: workspaceTrustLabel,
      disposables
    };
  }
  createScopeOverridesIndicator() {
    const disposables = new DisposableStore();
    const otherOverridesElement = $25("span.setting-item-overrides");
    const otherOverridesLabel = disposables.add(new SimpleIconLabel(otherOverridesElement));
    return {
      element: otherOverridesElement,
      label: otherOverridesLabel,
      disposables
    };
  }
  createSyncIgnoredIndicator() {
    const disposables = new DisposableStore();
    const syncIgnoredElement = $25("span.setting-indicator.setting-item-ignored");
    const syncIgnoredLabel = disposables.add(new SimpleIconLabel(syncIgnoredElement));
    syncIgnoredLabel.text = localize(18221, null);
    const syncIgnoredHoverContent = localize(18236, null);
    disposables.add(this.hoverService.setupDelayedHover(syncIgnoredElement, {
      ...this.defaultHoverOptions,
      content: syncIgnoredHoverContent
    }, { setupKeyboardEvents: true }));
    return {
      element: syncIgnoredElement,
      label: syncIgnoredLabel,
      disposables
    };
  }
  createDefaultOverrideIndicator() {
    const disposables = new DisposableStore();
    const defaultOverrideIndicator = $25("span.setting-indicator.setting-item-default-overridden");
    const defaultOverrideLabel = disposables.add(new SimpleIconLabel(defaultOverrideIndicator));
    defaultOverrideLabel.text = localize(18218, null);
    return {
      element: defaultOverrideIndicator,
      label: defaultOverrideLabel,
      disposables
    };
  }
  createPreviewIndicator() {
    const disposables = new DisposableStore();
    const previewIndicator = $25("span.setting-indicator.setting-item-preview");
    const previewLabel = disposables.add(new SimpleIconLabel(previewIndicator));
    return {
      element: previewIndicator,
      label: previewLabel,
      disposables
    };
  }
  createAdvancedIndicator() {
    const disposables = new DisposableStore();
    const advancedIndicator = $25("span.setting-indicator.setting-item-preview");
    const advancedLabel = disposables.add(new SimpleIconLabel(advancedIndicator));
    advancedLabel.text = localize(18204, null);
    disposables.add(this.hoverService.setupDelayedHover(advancedIndicator, {
      ...this.defaultHoverOptions,
      content: ADVANCED_INDICATOR_DESCRIPTION
    }, { setupKeyboardEvents: true }));
    return {
      element: advancedIndicator,
      label: advancedLabel,
      disposables
    };
  }
  render() {
    this.indicatorsContainerElement.innerText = "";
    this.indicatorsContainerElement.style.display = "none";
    const isolatedIndicatorsToShow = this.isolatedIndicators.filter((indicator) => {
      return indicator.element.style.display !== "none";
    });
    if (isolatedIndicatorsToShow.length) {
      this.indicatorsContainerElement.style.display = "inline";
      for (let i2 = 0; i2 < isolatedIndicatorsToShow.length; i2++) {
        append(this.indicatorsContainerElement, isolatedIndicatorsToShow[i2].element);
      }
    }
    const parenthesizedIndicatorsToShow = this.parenthesizedIndicators.filter((indicator) => {
      return indicator.element.style.display !== "none";
    });
    if (parenthesizedIndicatorsToShow.length) {
      this.indicatorsContainerElement.style.display = "inline";
      append(this.indicatorsContainerElement, $25("span", void 0, "("));
      for (let i2 = 0; i2 < parenthesizedIndicatorsToShow.length - 1; i2++) {
        append(this.indicatorsContainerElement, parenthesizedIndicatorsToShow[i2].element);
        append(this.indicatorsContainerElement, $25("span.comma", void 0, " \u2022 "));
      }
      append(this.indicatorsContainerElement, parenthesizedIndicatorsToShow[parenthesizedIndicatorsToShow.length - 1].element);
      append(this.indicatorsContainerElement, $25("span", void 0, ")"));
    }
    this.resetIndicatorNavigationKeyBindings([...isolatedIndicatorsToShow, ...parenthesizedIndicatorsToShow]);
  }
  resetIndicatorNavigationKeyBindings(indicators) {
    this.keybindingListeners.clear();
    this.indicatorsContainerElement.role = indicators.length >= 1 ? "toolbar" : "button";
    if (!indicators.length) {
      return;
    }
    const firstElement = indicators[0].focusElement ?? indicators[0].element;
    firstElement.tabIndex = 0;
    this.keybindingListeners.add(addDisposableListener(this.indicatorsContainerElement, "keydown", (e) => {
      const ev = new StandardKeyboardEvent(e);
      let handled = true;
      if (ev.equals(14 /* Home */)) {
        this.focusIndicatorAt(indicators, 0);
      } else if (ev.equals(13 /* End */)) {
        this.focusIndicatorAt(indicators, indicators.length - 1);
      } else if (ev.equals(17 /* RightArrow */)) {
        const indexToFocus = (this.focusedIndex + 1) % indicators.length;
        this.focusIndicatorAt(indicators, indexToFocus);
      } else if (ev.equals(15 /* LeftArrow */)) {
        const indexToFocus = this.focusedIndex ? this.focusedIndex - 1 : indicators.length - 1;
        this.focusIndicatorAt(indicators, indexToFocus);
      } else {
        handled = false;
      }
      if (handled) {
        e.preventDefault();
        e.stopPropagation();
      }
    }));
  }
  focusIndicatorAt(indicators, index2) {
    if (index2 === this.focusedIndex) {
      return;
    }
    const indicator = indicators[index2];
    const elementToFocus = indicator.focusElement ?? indicator.element;
    elementToFocus.tabIndex = 0;
    elementToFocus.focus();
    const currentlyFocusedIndicator = indicators[this.focusedIndex];
    const previousFocusedElement = currentlyFocusedIndicator.focusElement ?? currentlyFocusedIndicator.element;
    previousFocusedElement.tabIndex = -1;
    this.focusedIndex = index2;
  }
  updateWorkspaceTrust(element) {
    this.workspaceTrustIndicator.element.style.display = element.isUntrusted ? "inline" : "none";
    this.render();
  }
  updateSyncIgnored(element, ignoredSettings) {
    this.syncIgnoredIndicator.element.style.display = this.userDataSyncEnablementService.isEnabled() && ignoredSettings.includes(element.setting.key) ? "inline" : "none";
    this.render();
    if (cachedSyncIgnoredSettings !== ignoredSettings) {
      cachedSyncIgnoredSettings = ignoredSettings;
      cachedSyncIgnoredSettingsSet = new Set(cachedSyncIgnoredSettings);
    }
  }
  updatePreviewIndicator(element) {
    const isPreviewSetting = element.tags?.has("preview");
    const isExperimentalSetting = element.tags?.has("experimental");
    this.previewIndicator.element.style.display = isPreviewSetting || isExperimentalSetting ? "inline" : "none";
    this.previewIndicator.label.text = isPreviewSetting ? localize(18233, null) : localize(18220, null);
    const content2 = isPreviewSetting ? PREVIEW_INDICATOR_DESCRIPTION : EXPERIMENTAL_INDICATOR_DESCRIPTION;
    this.previewHover.value = this.hoverService.setupDelayedHover(this.previewIndicator.element, {
      ...this.defaultHoverOptions,
      content: content2
    }, { setupKeyboardEvents: true });
    this.render();
  }
  updateAdvancedIndicator(element) {
    const isAdvancedSetting = element.tags?.has("advanced");
    this.advancedIndicator.element.style.display = isAdvancedSetting ? "inline" : "none";
    this.render();
  }
  getInlineScopeDisplayText(completeScope) {
    const [scope, language2] = completeScope.split(":");
    const localizedScope = scope === "user" ? localize(18238, null) : scope === "workspace" ? localize(18239, null) : localize(18234, null);
    if (language2) {
      return `${this.languageService.getLanguageName(language2)} > ${localizedScope}`;
    }
    return localizedScope;
  }
  dispose() {
    this.keybindingListeners.dispose();
    this.previewHover.dispose();
    for (const indicator of this.isolatedIndicators) {
      indicator.disposables.dispose();
    }
    for (const indicator of this.parenthesizedIndicators) {
      indicator.disposables.dispose();
    }
  }
  updateScopeOverrides(element, onDidClickOverrideElement, onApplyFilter) {
    this.scopeOverridesIndicator.disposables.clear();
    this.scopeOverridesIndicator.element.innerText = "";
    this.scopeOverridesIndicator.element.style.display = "none";
    this.scopeOverridesIndicator.focusElement = this.scopeOverridesIndicator.element;
    if (element.hasPolicyValue) {
      this.scopeOverridesIndicator.element.style.display = "inline";
      this.scopeOverridesIndicator.element.classList.add("setting-indicator");
      this.scopeOverridesIndicator.label.text = "$(briefcase) " + localize(18232, null);
      const content2 = localize(18229, null);
      this.scopeOverridesIndicator.disposables.add(this.hoverService.setupDelayedHover(this.scopeOverridesIndicator.element, () => ({
        ...this.defaultHoverOptions,
        content: content2,
        actions: [{
          label: localize(18231, null),
          commandId: "_settings.action.viewPolicySettings",
          run: (_) => {
            onApplyFilter.fire(`@${POLICY_SETTING_TAG}`);
          }
        }]
      }), { setupKeyboardEvents: true }));
    } else if (element.isAgentsWindowReadOnly) {
      this.scopeOverridesIndicator.element.style.display = "inline";
      this.scopeOverridesIndicator.element.classList.add("setting-indicator");
      this.scopeOverridesIndicator.label.text = "$(lock) " + localize(18207, null);
      const content2 = localize(18206, null);
      this.scopeOverridesIndicator.disposables.add(this.hoverService.setupDelayedHover(this.scopeOverridesIndicator.element, {
        ...this.defaultHoverOptions,
        content: content2
      }, { setupKeyboardEvents: true }));
    } else if (element.settingsTarget === 3 /* USER_LOCAL */ && this.configurationService.isSettingAppliedForAllProfiles(element.setting.key)) {
      this.scopeOverridesIndicator.element.style.display = "inline";
      this.scopeOverridesIndicator.element.classList.add("setting-indicator");
      this.scopeOverridesIndicator.label.text = localize(18211, null);
      const content2 = localize(18212, null);
      this.scopeOverridesIndicator.disposables.add(this.hoverService.setupDelayedHover(this.scopeOverridesIndicator.element, {
        ...this.defaultHoverOptions,
        content: content2
      }, { setupKeyboardEvents: true }));
    } else if (element.overriddenScopeList.length || element.overriddenDefaultsLanguageList.length) {
      if (element.overriddenScopeList.length === 1 && !element.overriddenDefaultsLanguageList.length) {
        this.scopeOverridesIndicator.element.style.display = "inline";
        this.scopeOverridesIndicator.element.classList.remove("setting-indicator");
        const prefaceText = element.isConfigured ? localize(18209, null) : localize(18215, null);
        this.scopeOverridesIndicator.label.text = `${prefaceText} `;
        const overriddenScope = element.overriddenScopeList[0];
        const view = append(this.scopeOverridesIndicator.element, $25("a.modified-scope", void 0, this.getInlineScopeDisplayText(overriddenScope)));
        view.tabIndex = -1;
        this.scopeOverridesIndicator.focusElement = view;
        const onClickOrKeydown = (e) => {
          const [scope, language2] = overriddenScope.split(":");
          onDidClickOverrideElement.fire({
            settingKey: element.setting.key,
            scope,
            language: language2
          });
          e.preventDefault();
          e.stopPropagation();
        };
        this.scopeOverridesIndicator.disposables.add(addDisposableListener(view, EventType.CLICK, (e) => {
          onClickOrKeydown(e);
        }));
        this.scopeOverridesIndicator.disposables.add(addDisposableListener(view, EventType.KEY_DOWN, (e) => {
          const ev = new StandardKeyboardEvent(e);
          if (ev.equals(10 /* Space */) || ev.equals(3 /* Enter */)) {
            onClickOrKeydown(e);
          }
        }));
      } else {
        this.scopeOverridesIndicator.element.style.display = "inline";
        this.scopeOverridesIndicator.element.classList.add("setting-indicator");
        const scopeOverridesLabelText = element.isConfigured ? localize(18208, null) : localize(18214, null);
        this.scopeOverridesIndicator.label.text = scopeOverridesLabelText;
        let contentMarkdownString = "";
        if (element.overriddenScopeList.length) {
          const prefaceText = element.isConfigured ? localize(18210, null) : localize(18226, null);
          contentMarkdownString = prefaceText;
          for (const scope of element.overriddenScopeList) {
            const scopeDisplayText = this.getInlineScopeDisplayText(scope);
            contentMarkdownString += "\n- " + createMarkdownLink(scopeDisplayText, SettingScopeLink.create(scope).toString(), getAccessibleScopeDisplayText(scope, this.languageService));
          }
        }
        if (element.overriddenDefaultsLanguageList.length) {
          if (contentMarkdownString) {
            contentMarkdownString += `

`;
          }
          const prefaceText = localize(18222, null);
          contentMarkdownString += prefaceText;
          for (const language2 of element.overriddenDefaultsLanguageList) {
            const scopeDisplayText = this.languageService.getLanguageName(language2);
            contentMarkdownString += "\n- " + createMarkdownLink(scopeDisplayText ?? language2, SettingScopeLink.create(`default:${language2}`).toString());
          }
        }
        const content2 = {
          value: contentMarkdownString,
          isTrusted: false,
          supportHtml: false
        };
        this.scopeOverridesIndicator.disposables.add(this.hoverService.setupDelayedHover(this.scopeOverridesIndicator.element, () => ({
          ...this.defaultHoverOptions,
          content: content2,
          linkHandler: (url) => {
            const [scope, language2] = SettingScopeLink.parse(url).split(":");
            onDidClickOverrideElement.fire({
              settingKey: element.setting.key,
              scope,
              language: language2
            });
          }
        }), { setupKeyboardEvents: true }));
      }
    }
    this.render();
  }
  updateDefaultOverrideIndicator(element) {
    this.defaultOverrideIndicator.element.style.display = "none";
    let sourceToDisplay = getDefaultValueSourceToDisplay(element);
    if (sourceToDisplay !== void 0) {
      this.defaultOverrideIndicator.element.style.display = "inline";
      this.defaultOverrideIndicator.disposables.clear();
      if (Array.isArray(sourceToDisplay) && sourceToDisplay.length === 1) {
        sourceToDisplay = sourceToDisplay[0];
      }
      let defaultOverrideHoverContent;
      if (!Array.isArray(sourceToDisplay)) {
        defaultOverrideHoverContent = localize(18216, null, sourceToDisplay);
      } else {
        sourceToDisplay = sourceToDisplay.map((source) => `\`${source}\``);
        defaultOverrideHoverContent = localize(18227, null, sourceToDisplay.slice(0, -1).join(", ") + " & " + sourceToDisplay.slice(-1));
      }
      this.defaultOverrideIndicator.disposables.add(this.hoverService.setupDelayedHover(this.defaultOverrideIndicator.element, () => ({
        content: new MarkdownString().appendMarkdown(defaultOverrideHoverContent),
        style: 1 /* Pointer */,
        position: {
          hoverPosition: 2 /* BELOW */
        }
      }), { setupKeyboardEvents: true }));
    }
    this.render();
  }
};

SettingsTreeIndicatorsLabel = __decorateClass([
  __decorateParam(1, IWorkbenchConfigurationService),
  __decorateParam(2, IHoverService),
  __decorateParam(3, IUserDataSyncEnablementService),
  __decorateParam(4, ILanguageService),
  __decorateParam(5, ICommandService)
], SettingsTreeIndicatorsLabel);

function getDefaultValueSourceToDisplay(element) {
  let sourceToDisplay;
  const defaultValueSource = element.defaultValueSource;
  if (defaultValueSource) {
    if (defaultValueSource instanceof Map) {
      sourceToDisplay = [];
      for (const [, value2] of defaultValueSource) {
        const newValue = typeof value2 !== "string" ? value2.displayName ?? value2.id : value2;
        if (!sourceToDisplay.includes(newValue)) {
          sourceToDisplay.push(newValue);
        }
      }
    } else if (typeof defaultValueSource === "string") {
      sourceToDisplay = defaultValueSource;
    } else {
      sourceToDisplay = defaultValueSource.displayName ?? defaultValueSource.id;
    }
  }
  return sourceToDisplay;
}

function getAccessibleScopeDisplayText(completeScope, languageService) {
  const [scope, language2] = completeScope.split(":");
  const localizedScope = scope === "user" ? localize(18238, null) : scope === "workspace" ? localize(18239, null) : localize(18234, null);
  if (language2) {
    return localize(18224, null, localizedScope, languageService.getLanguageName(language2));
  }
  return localizedScope;
}

function getAccessibleScopeDisplayMidSentenceText(completeScope, languageService) {
  const [scope, language2] = completeScope.split(":");
  const localizedScope = scope === "user" ? localize(18238, null) : scope === "workspace" ? localize(18239, null) : localize(18234, null);
  if (language2) {
    return localize(18225, null, localizedScope.toLowerCase(), languageService.getLanguageName(language2));
  }
  return localizedScope;
}

function getIndicatorsLabelAriaLabel(element, configurationService, userDataProfilesService, languageService) {
  const ariaLabelSections = [];
  if (element.tags?.has("preview")) {
    ariaLabelSections.push(localize(18233, null));
  } else if (element.tags?.has("experimental")) {
    ariaLabelSections.push(localize(18220, null));
  }
  if (element.tags?.has("advanced")) {
    ariaLabelSections.push(localize(18204, null));
  }
  if (element.isUntrusted) {
    ariaLabelSections.push(localize(18240, null));
  }
  if (element.hasPolicyValue) {
    ariaLabelSections.push(localize(18230, null));
  } else if (element.isAgentsWindowReadOnly) {
    ariaLabelSections.push(localize(18205, null));
  } else if (element.settingsTarget === 3 /* USER_LOCAL */ && configurationService.isSettingAppliedForAllProfiles(element.setting.key)) {
    ariaLabelSections.push(localize(18213, null));
  } else {
    const otherOverridesStart = element.isConfigured ? localize(18209, null) : localize(18215, null);
    const otherOverridesList = element.overriddenScopeList.map((scope) => getAccessibleScopeDisplayMidSentenceText(scope, languageService)).join(", ");
    if (element.overriddenScopeList.length) {
      ariaLabelSections.push(`${otherOverridesStart} ${otherOverridesList}`);
    }
  }
  if (cachedSyncIgnoredSettingsSet.has(element.setting.key)) {
    ariaLabelSections.push(localize(18235, null));
  }
  let sourceToDisplay = getDefaultValueSourceToDisplay(element);
  if (sourceToDisplay !== void 0) {
    if (Array.isArray(sourceToDisplay) && sourceToDisplay.length === 1) {
      sourceToDisplay = sourceToDisplay[0];
    }
    let overriddenDetailsText;
    if (!Array.isArray(sourceToDisplay)) {
      overriddenDetailsText = localize(18217, null, sourceToDisplay);
    } else {
      overriddenDetailsText = localize(18228, null, sourceToDisplay.slice(0, -1).join(", ") + " & " + sourceToDisplay.slice(-1));
    }
    ariaLabelSections.push(overriddenDetailsText);
  }
  const otherLanguageOverridesList = element.overriddenDefaultsLanguageList.map((language2) => languageService.getLanguageName(language2)).join(", ");
  if (element.overriddenDefaultsLanguageList.length) {
    const otherLanguageOverridesText = localize(18219, null, otherLanguageOverridesList);
    ariaLabelSections.push(otherLanguageOverridesText);
  }
  const ariaLabel = ariaLabelSections.join(". ");
  return ariaLabel;
}

var SettingScopeLink;

((SettingScopeLink2) => {
  function create2(scope) {
    return URI.from({
      scheme: Schemas.internal,
      path: "/",
      query: encodeURIComponent(scope)
    });
  }
  SettingScopeLink2.create = create2;
  function parse14(link2) {
    const uri5 = URI.parse(link2);
    return decodeURIComponent(uri5.query);
  }
  SettingScopeLink2.parse = parse14;
})(SettingScopeLink || (SettingScopeLink = {}));
export { getDefaultValueSourceToDisplay, getAccessibleScopeDisplayText, getAccessibleScopeDisplayMidSentenceText, getIndicatorsLabelAriaLabel, $25, cachedSyncIgnoredSettingsSet, cachedSyncIgnoredSettings, SettingsTreeIndicatorsLabel, SettingScopeLink };
