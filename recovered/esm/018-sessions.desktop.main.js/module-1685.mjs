// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/platform/quickinput/browser/quickInputService.ts
import { IThemeService, Themable } from "./module-0287.mjs";
import { observableValue } from "./module-0048.mjs";
import { Emitter } from "./module-0017.mjs";
import { QuickAccessController } from "./module-1672.mjs";
import { IOpenerService } from "./module-0272.mjs";
import { QuickInputHoverDelegate } from "./module-1560.mjs";
import { QuickInputController } from "./module-1684.mjs";
import { getWindow } from "./module-0075.mjs";
import { autorun } from "./module-0052.mjs";
import { IContextKeyService, RawContextKey } from "./module-0089.mjs";
import { CancellationToken } from "./module-0025.mjs";
import { asCssVariable } from "./module-0226.mjs";
import { pickerGroupBorder, pickerGroupForeground, quickInputBackground, quickInputForeground, quickInputListFocusBackground, quickInputListFocusForeground, quickInputListFocusIconForeground, quickInputTitleBackground } from "./module-0235.mjs";
import { widgetBorder, widgetShadow } from "./module-0229.mjs";
import { defaultButtonStyles, defaultCountBadgeStyles, defaultInputBoxStyles, defaultKeybindingLabelStyles, defaultProgressBarStyles, defaultToggleStyles, getListStyles } from "./module-0513.mjs";
import { activeContrastBorder } from "./module-0227.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { ILayoutService } from "./module-0551.mjs";
import { IConfigurationService } from "./module-0132.mjs";


// src/vs/platform/quickinput/browser/quickInputService.ts
var QuickInputService = class extends Themable {
  constructor(instantiationService, contextKeyService, themeService, layoutService, configurationService) {
    super(themeService);
    this.instantiationService = instantiationService;
    this.contextKeyService = contextKeyService;
    this.layoutService = layoutService;
    this.configurationService = configurationService;
    this._alignment = observableValue(this, "top");
    this.alignment = this._alignment;
    this._onShow = this._register(new Emitter());
    this.onShow = this._onShow.event;
    this._onHide = this._register(new Emitter());
    this.onHide = this._onHide.event;
    this.contexts = /* @__PURE__ */ new Map();
  }
  get backButton() {
    return this.controller.backButton;
  }
  get controller() {
    if (!this._controller) {
      this._controller = this._register(this.createController());
    }
    return this._controller;
  }
  get hasController() {
    return !!this._controller;
  }
  get currentQuickInput() {
    return this.controller.currentQuickInput;
  }
  get quickAccess() {
    if (!this._quickAccess) {
      this._quickAccess = this._register(this.instantiationService.createInstance(QuickAccessController));
    }
    return this._quickAccess;
  }
  createController(host = this.layoutService, options3) {
    const defaultOptions3 = {
      idPrefix: "quickInput_",
      container: host.activeContainer,
      ignoreFocusOut: () => false,
      backKeybindingLabel: () => void 0,
      setContextKey: (id2) => this.setContextKey(id2),
      linkOpenerDelegate: (content) => {
        this.instantiationService.invokeFunction((accessor) => {
          const openerService = accessor.get(IOpenerService);
          openerService.open(content, { allowCommands: true, fromUserGesture: true });
        });
      },
      returnFocus: () => host.focus(),
      styles: this.computeStyles(),
      hoverDelegate: this._register(this.instantiationService.createInstance(QuickInputHoverDelegate))
    };
    const controller = this._register(this.instantiationService.createInstance(
      QuickInputController,
      {
        ...defaultOptions3,
        ...options3
      }
    ));
    controller.layout(host.activeContainerDimension, host.activeContainerOffset.quickPickTop);
    this._register(host.onDidLayoutActiveContainer((dimension) => {
      if (getWindow(host.activeContainer) === getWindow(controller.container)) {
        controller.layout(dimension, host.activeContainerOffset.quickPickTop);
      }
    }));
    this._register(host.onDidChangeActiveContainer(() => {
      if (controller.isVisible()) {
        return;
      }
      controller.layout(host.activeContainerDimension, host.activeContainerOffset.quickPickTop);
    }));
    this._register(controller.onShow(() => {
      this.resetContextKeys();
      this._onShow.fire();
    }));
    this._register(controller.onHide(() => {
      this.resetContextKeys();
      this._onHide.fire();
    }));
    this._register(autorun((reader) => {
      this._alignment.set(controller.alignment.read(reader), void 0);
    }));
    return controller;
  }
  setContextKey(id2) {
    let key3;
    if (id2) {
      key3 = this.contexts.get(id2);
      if (!key3) {
        key3 = new RawContextKey(id2, false).bindTo(this.contextKeyService);
        this.contexts.set(id2, key3);
      }
    }
    if (key3 && key3.get()) {
      return;
    }
    this.resetContextKeys();
    key3?.set(true);
  }
  resetContextKeys() {
    this.contexts.forEach((context2) => {
      if (context2.get()) {
        context2.reset();
      }
    });
  }
  pick(picks, options3, token = CancellationToken.None) {
    return this.controller.pick(picks, options3, token);
  }
  input(options3 = {}, token = CancellationToken.None) {
    return this.controller.input(options3, token);
  }
  createQuickPick(options3 = { useSeparators: false }) {
    return this.controller.createQuickPick(options3);
  }
  createInputBox() {
    return this.controller.createInputBox();
  }
  createQuickWidget() {
    return this.controller.createQuickWidget();
  }
  createQuickTree() {
    return this.controller.createQuickTree();
  }
  focus() {
    this.controller.focus();
  }
  toggle() {
    this.controller.toggle();
  }
  navigate(next, quickNavigate) {
    this.controller.navigate(next, quickNavigate);
  }
  accept(keyMods) {
    return this.controller.accept(keyMods);
  }
  back() {
    return this.controller.back();
  }
  cancel(reason) {
    return this.controller.cancel(reason);
  }
  setAlignment(alignment) {
    this.controller.setAlignment(alignment);
  }
  toggleHover() {
    if (this.hasController) {
      this.controller.toggleHover();
    }
  }
  updateStyles() {
    if (this.hasController) {
      this.controller.applyStyles(this.computeStyles());
    }
  }
  computeStyles() {
    return {
      widget: {
        quickInputBackground: asCssVariable(quickInputBackground),
        quickInputForeground: asCssVariable(quickInputForeground),
        quickInputTitleBackground: asCssVariable(quickInputTitleBackground),
        widgetBorder: asCssVariable(widgetBorder),
        widgetShadow: asCssVariable(widgetShadow)
      },
      inputBox: defaultInputBoxStyles,
      toggle: defaultToggleStyles,
      countBadge: defaultCountBadgeStyles,
      button: defaultButtonStyles,
      progressBar: defaultProgressBarStyles,
      keybindingLabel: defaultKeybindingLabelStyles,
      list: getListStyles({
        listBackground: quickInputBackground,
        listFocusBackground: quickInputListFocusBackground,
        listFocusForeground: quickInputListFocusForeground,
        // Look like focused when inactive.
        listInactiveFocusForeground: quickInputListFocusForeground,
        listInactiveSelectionIconForeground: quickInputListFocusIconForeground,
        listInactiveFocusBackground: quickInputListFocusBackground,
        listInactiveSelectionBackground: quickInputListFocusBackground,
        listInactiveSelectionForeground: quickInputListFocusForeground,
        listFocusOutline: activeContrastBorder,
        listInactiveFocusOutline: activeContrastBorder,
        treeStickyScrollBackground: quickInputBackground
      }),
      pickerGroup: {
        pickerGroupBorder: asCssVariable(pickerGroupBorder),
        pickerGroupForeground: asCssVariable(pickerGroupForeground)
      }
    };
  }
};

QuickInputService = __decorateClass([
  __decorateParam(0, IInstantiationService),
  __decorateParam(1, IContextKeyService),
  __decorateParam(2, IThemeService),
  __decorateParam(3, ILayoutService),
  __decorateParam(4, IConfigurationService)
], QuickInputService);
export { QuickInputService };
