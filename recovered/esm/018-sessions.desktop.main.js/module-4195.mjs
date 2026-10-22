// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/browserView/electron-browser/features/browserEditorEmulationFeatures.ts
import { ContextKeyExpr, IContextKeyService, RawContextKey } from "./module-0089.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { Disposable } from "./module-0012.mjs";
import { $, EventType, addDisposableListener, getWindow } from "./module-0075.mjs";
import { Action } from "./module-0082.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { Codicon } from "./module-0085.mjs";
import { ActionBar } from "./module-0477.mjs";
import { SelectBox } from "./module-0475.mjs";
import { defaultInputBoxStyles, defaultSelectBoxStyles } from "./module-0513.mjs";
import { InputBox } from "./module-0600.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IContextViewService } from "./module-0488.mjs";
import { IHoverService, WorkbenchHoverDelegate } from "./module-0520.mjs";
import { BROWSER_EDITOR_ACTIVE, BrowserActionCategory, BrowserEditor, BrowserEditorContribution } from "./module-4159.mjs";
import { Emitter } from "./module-0017.mjs";
import { MenuWorkbenchToolBar } from "./module-0519.mjs";
import { Action2, MenuId, MenuRegistry, registerAction2 } from "./module-0092.mjs";
import { Sash } from "./module-0496.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IEditorService } from "./module-0935.mjs";
import { IQuickInputService } from "./module-0536.mjs";


// src/vs/workbench/contrib/browserView/electron-browser/features/browserEditorEmulationFeatures.ts
var CONTEXT_BROWSER_EMULATION_TOOLBAR_VISIBLE = new RawContextKey(
  "browserEmulationToolbarVisible",
  false,
  localize(8070, null)
);

var CONTEXT_BROWSER_EMULATION_IS_MOBILE = new RawContextKey(
  "browserEmulationIsMobile",
  false,
  localize(8064, null)
);

var CONTEXT_BROWSER_EMULATION_HAS_USER_AGENT = new RawContextKey(
  "browserEmulationHasUserAgent",
  false,
  localize(8063, null)
);

var lastSettings = {
  device: void 0,
  scale: void 0
};

var BrowserEmulationToolbar = class extends Disposable {
  constructor(_feature, actionsContainer, hoverDelegate, contextViewService, hoverService) {
    super();
    this._feature = _feature;
    this._suppressChange = false;
    this._autoFitScale = 1;
    this.element = $(".browser-emulation-toolbar");
    this.element.style.display = "none";
    this._groupWrapper = $(".browser-emulation-toolbar-groups");
    this.element.appendChild(this._groupWrapper);
    const dimensions = this._appendGroup("dimensions");
    const dimensionsLabel = $("span.browser-emulation-toolbar-label");
    dimensionsLabel.textContent = localize(8050, null);
    dimensions.appendChild(dimensionsLabel);
    this._widthInput = this._createNumberInput(dimensions, contextViewService, localize(8058, null), 1, 9999);
    const swapDimensionsLabel = localize(8057, null);
    this._swapDimensionsAction = this._register(new Action(
      "browser.device.swapDimensions",
      swapDimensionsLabel,
      ThemeIcon.asClassName(Codicon.arrowSwap),
      false,
      async () => this._feature.swapDimensions()
    ));
    const swapDimensionsBar = this._register(new ActionBar(dimensions, { hoverDelegate }));
    swapDimensionsBar.push(this._swapDimensionsAction, { icon: true, label: false });
    this._heightInput = this._createNumberInput(dimensions, contextViewService, localize(8054, null), 1, 9999);
    const dprGroup = this._appendGroup("dpr");
    const dprLabel = $("span.browser-emulation-toolbar-label");
    dprLabel.textContent = localize(8052, null);
    this._register(hoverService.setupManagedHover(hoverDelegate, dprLabel, localize(8053, null)));
    dprGroup.appendChild(dprLabel);
    this._dprInput = this._createNumberInput(dprGroup, contextViewService, localize(8051, null), 0, 8, "decimal");
    const zoomGroup = this._appendGroup("zoom");
    const zoomLabel = $("span.browser-emulation-toolbar-label");
    zoomLabel.textContent = localize(8056, null);
    zoomGroup.appendChild(zoomLabel);
    this._zoom = this._register(new SelectBox(
      this._buildZoomOptions(),
      BrowserEmulationToolbar.AUTO_INDEX,
      contextViewService,
      defaultSelectBoxStyles,
      { ariaLabel: localize(8059, null) }
    ));
    this._zoom.render(zoomGroup);
    this.element.appendChild($(".browser-emulation-toolbar-spacer"));
    this.element.appendChild(actionsContainer);
    this._registerEvents();
  }
  static {
    this.ZOOM_PRESETS = [0.5, 0.75, 1, 1.25, 1.5, 2];
  }
  static {
    this.AUTO_INDEX = 0;
  }
  _registerEvents() {
    const commitDims = () => this._onDimensionInput();
    const onEnterDims = (e4) => {
      if (e4.keyCode === 3 /* Enter */) {
        this._onDimensionInput();
      }
    };
    this._register(addDisposableListener(this._widthInput.inputElement, EventType.CHANGE, commitDims));
    this._register(addDisposableListener(this._heightInput.inputElement, EventType.CHANGE, commitDims));
    this._register(addDisposableListener(this._widthInput.inputElement, EventType.KEY_DOWN, onEnterDims));
    this._register(addDisposableListener(this._heightInput.inputElement, EventType.KEY_DOWN, onEnterDims));
    this._register(addDisposableListener(this._dprInput.inputElement, EventType.CHANGE, () => this._onDprInput()));
    this._register(addDisposableListener(this._dprInput.inputElement, EventType.KEY_DOWN, (e4) => {
      if (e4.keyCode === 3 /* Enter */) {
        this._onDprInput();
      }
    }));
    this._register(this._zoom.onDidSelect((e4) => {
      const model = this._feature.model;
      if (this._suppressChange || !model?.device) {
        return;
      }
      const scale = e4.index === BrowserEmulationToolbar.AUTO_INDEX ? void 0 : BrowserEmulationToolbar.ZOOM_PRESETS[e4.index - 1];
      if (scale === this._feature.scale) {
        return;
      }
      this._feature.setScale(scale);
    }));
  }
  get isVisible() {
    return this.element.style.display !== "none";
  }
  show() {
    this.element.style.display = "";
  }
  hide() {
    this.element.style.display = "none";
  }
  setAutoFitScale(scale) {
    if (this._autoFitScale === scale) {
      return;
    }
    const oldPercent = Math.round(this._autoFitScale * 100);
    this._autoFitScale = scale;
    const newPercent = Math.round(scale * 100);
    if (oldPercent !== newPercent) {
      const wasSuppressed = this._suppressChange;
      this._suppressChange = true;
      try {
        this._zoom.setOptions(this._buildZoomOptions(), this._currentZoomIndex());
      } finally {
        this._suppressChange = wasSuppressed;
      }
    }
  }
  refresh() {
    this._writeInputs(this._feature.model?.device);
    this._updateZoom();
  }
  _writeInputs(device) {
    const width2 = device?.width;
    const height = device?.height;
    this._suppressChange = true;
    try {
      this._widthInput.value = width2 ? String(width2) : "";
      this._heightInput.value = height ? String(height) : "";
      this._dprInput.value = device?.deviceScaleFactor ? String(device.deviceScaleFactor) : "";
    } finally {
      this._suppressChange = false;
    }
    this._swapDimensionsAction.enabled = !!width2 || !!height;
  }
  _appendGroup(name) {
    const group2 = $(`.browser-emulation-toolbar-group.browser-emulation-toolbar-${name}`);
    this._groupWrapper.appendChild(group2);
    return group2;
  }
  _buildZoomOptions() {
    return [
      { text: localize(8060, null, Math.round(this._autoFitScale * 100)) },
      ...BrowserEmulationToolbar.ZOOM_PRESETS.map((z) => ({ text: `${Math.round(z * 100)}%` }))
    ];
  }
  _currentZoomIndex() {
    const scale = this._feature.scale;
    if (scale === void 0) {
      return BrowserEmulationToolbar.AUTO_INDEX;
    }
    const idx = BrowserEmulationToolbar.ZOOM_PRESETS.findIndex((p) => Math.abs(p - scale) < 5e-3);
    return idx >= 0 ? idx + 1 : BrowserEmulationToolbar.AUTO_INDEX;
  }
  _updateZoom() {
    const wasSuppressed = this._suppressChange;
    this._suppressChange = true;
    try {
      this._zoom.select(this._currentZoomIndex());
      this._zoom.setEnabled(!!this._feature.model?.device);
    } finally {
      this._suppressChange = wasSuppressed;
    }
  }
  _onDimensionInput() {
    const model = this._feature.model;
    if (this._suppressChange || !model?.device) {
      return;
    }
    const parse14 = (raw) => {
      const trimmed = raw.trim();
      if (trimmed === "") {
        return void 0;
      }
      const n2 = Math.floor(Number(trimmed));
      if (!n2 || n2 <= 0) {
        return void 0;
      }
      return Math.max(1, Math.min(9999, n2));
    };
    const width2 = parse14(this._widthInput.value);
    const height = parse14(this._heightInput.value);
    const device = model.device;
    if (device.width === width2 && device.height === height) {
      return;
    }
    void model.setDevice({ ...device, width: width2, height });
  }
  _onDprInput() {
    const model = this._feature.model;
    if (this._suppressChange || !model?.device) {
      return;
    }
    const device = model.device;
    const raw = this._dprInput.value.trim();
    const next = raw === "" ? void 0 : Math.max(0, Math.min(8, Number(raw) || 0)) || void 0;
    if (device.deviceScaleFactor === next) {
      return;
    }
    void model.setDevice({ ...device, deviceScaleFactor: next });
  }
  _createNumberInput(parent, contextViewService, ariaLabel, min, max, inputMode = "numeric") {
    const container2 = $(".browser-emulation-toolbar-input");
    parent.appendChild(container2);
    const input = this._register(new InputBox(container2, contextViewService, {
      type: "number",
      ariaLabel,
      placeholder: localize(8055, null),
      inputBoxStyles: defaultInputBoxStyles
    }));
    input.inputElement.min = String(min);
    input.inputElement.max = String(max);
    input.inputElement.inputMode = inputMode;
    if (inputMode === "decimal") {
      input.inputElement.step = "0.5";
    }
    return input;
  }
};

BrowserEmulationToolbar = __decorateClass([
  __decorateParam(3, IContextViewService),
  __decorateParam(4, IHoverService)
], BrowserEmulationToolbar);

var BrowserEditorEmulationSupport = class extends BrowserEditorContribution {
  constructor(editor, contextKeyService, instantiationService) {
    super(editor);
    /** Scale Auto-fit would produce for the current device + pane. Drives the toolbar's "Auto (X%)" label. */
    this._autoFitScale = 1;
    this._onDidChangeScale = this._register(new Emitter());
    this._onDidChangeAutoFitScale = this._register(new Emitter());
    this._toolbarVisible = CONTEXT_BROWSER_EMULATION_TOOLBAR_VISIBLE.bindTo(contextKeyService);
    this._isMobile = CONTEXT_BROWSER_EMULATION_IS_MOBILE.bindTo(contextKeyService);
    this._hasUserAgent = CONTEXT_BROWSER_EMULATION_HAS_USER_AGENT.bindTo(contextKeyService);
    const actionsContainer = $(".browser-emulation-toolbar-actions");
    const hoverDelegate = this._register(instantiationService.createInstance(
      WorkbenchHoverDelegate,
      "element",
      void 0,
      { position: { hoverPosition: 3 /* ABOVE */ } }
    ));
    const actionsToolbar = this._register(instantiationService.createInstance(
      MenuWorkbenchToolBar,
      actionsContainer,
      MenuId.BrowserEmulationToolbar,
      {
        hoverDelegate,
        highlightToggledItems: true,
        toolbarOptions: { primaryGroup: () => true },
        menuOptions: { shouldForwardArgs: true }
      }
    ));
    actionsToolbar.context = editor;
    this._toolbar = this._register(instantiationService.createInstance(BrowserEmulationToolbar, this, actionsContainer, hoverDelegate));
    this._register(this._onDidChangeScale.event(() => {
      this._toolbar.refresh();
      this.editor.layoutBrowserContainer();
    }));
    this._register(this._onDidChangeAutoFitScale.event((scale) => this._toolbar.setAutoFitScale(scale)));
  }
  // -- BrowserEditorContribution hooks ------------------------------------
  get widgets() {
    return [{ location: "toolbar" /* Toolbar */, element: this._toolbar.element, order: 0 }];
  }
  onContainerCreated(container2) {
    this._createResizeSashes(container2);
    const observer = new (getWindow(container2)).ResizeObserver(() => {
      this._eastSash?.layout();
      this._southSash?.layout();
    });
    observer.observe(container2);
    this._register({ dispose: () => observer.disconnect() });
  }
  beforeContainerLayout() {
    if (!this.editor.model?.device) {
      return void 0;
    }
    return {
      // Reserve space for the east + south resize sashes that sit just outside the container.
      padding: { right: 16, bottom: 16 },
      compute: (_current, pane) => this._computeLayout(pane.width, pane.height),
      priority: 0
    };
  }
  _computeLayout(paneWidth, paneHeight) {
    const device = this.editor.model?.device;
    const width2 = device?.width;
    const height = device?.height;
    const fitScale = paneWidth > 0 && paneHeight > 0 ? Math.min(width2 ? paneWidth / width2 : 1, height ? paneHeight / height : 1, 1) : 1;
    if (this._autoFitScale !== fitScale) {
      this._autoFitScale = fitScale;
      this._onDidChangeAutoFitScale.fire(fitScale);
    }
    const scale = this._scale ?? fitScale;
    const layoutWidth = width2 ? Math.min(width2 * scale, paneWidth) : paneWidth;
    const layoutHeight = height ? Math.min(height * scale, paneHeight) : paneHeight;
    return {
      width: layoutWidth,
      height: layoutHeight,
      // Center the device within the available pane (the sash reservation
      // is already accounted for via padding).
      left: Math.max(0, (paneWidth - layoutWidth) / 2),
      top: Math.max(0, (paneHeight - layoutHeight) / 2),
      emulation: { scale }
    };
  }
  onModelAttached(model, store) {
    this._toolbar.refresh();
    this._syncContextKeys(model.device);
    this._updateSashState();
    this._setToolbarVisible(!!model.device);
    store.add(model.onDidChangeDevice((device) => {
      this._updateSashState();
      if (!device && this._scale !== void 0) {
        this.setScale(void 0);
      }
      if (device) {
        lastSettings.device = device;
      }
      this._toolbar.refresh();
      this._syncContextKeys(device);
      this._setToolbarVisible(!!device);
      this.editor.layoutBrowserContainer();
    }));
  }
  onModelDetached() {
    this._scale = void 0;
    this._toolbar.refresh();
    this._syncContextKeys(void 0);
    this._setToolbarVisible(false);
  }
  // -- Public API consumed by toolbar + actions --------------------------
  /** Current renderer-side scale; undefined = auto-fit. */
  get scale() {
    return this._scale;
  }
  /** Convenience accessor for the toolbar — proxies the editor's model. */
  get model() {
    return this.editor.model;
  }
  setScale(scale) {
    if (this._scale === scale) {
      return;
    }
    lastSettings.scale = scale;
    this._scale = scale;
    this._onDidChangeScale.fire(scale);
  }
  get isVisible() {
    return this._toolbar.isVisible;
  }
  /**
   * Toggle the toolbar. Entering toolbar mode engages device emulation
   * (responsive viewport, default device); exiting disables it.
   */
  setVisible(visible) {
    if (visible === this._toolbar.isVisible) {
      return;
    }
    const model = this.editor.model;
    if (visible) {
      if (model && !model.device) {
        void model.setDevice({ ...lastSettings.device });
        this.setScale(lastSettings.scale);
      }
      this._setToolbarVisible(true);
    } else {
      void model?.setDevice(void 0);
      this._setToolbarVisible(false);
    }
  }
  /** Apply a preset onto the current emulation, preserving the current scale. */
  applyPreset(preset) {
    const model = this.editor.model;
    if (!model) {
      return;
    }
    void model.setDevice(preset.device ?? {});
  }
  /** Reset all device + scale overrides to defaults while keeping emulation engaged. */
  resetAll() {
    const model = this.editor.model;
    if (!model) {
      return;
    }
    void model.setDevice({});
    this.setScale(void 0);
  }
  /** Set the user agent on the current device. Empty / undefined = default. Engages emulation if not already active. */
  setUserAgent(userAgent3) {
    const model = this.editor.model;
    if (!model) {
      return;
    }
    const next = userAgent3 ? userAgent3 : void 0;
    const device = model.device;
    if (device?.userAgent === next) {
      return;
    }
    void model.setDevice({ ...device ?? {}, userAgent: next });
  }
  /** The current device's user agent, if any. */
  get userAgent() {
    return this.editor.model?.device?.userAgent;
  }
  /** Swap the current viewport's width and height. No-op without any fixed dim. */
  swapDimensions() {
    const model = this.editor.model;
    const device = model?.device;
    if (!model || !device || !device.width && !device.height) {
      return;
    }
    void model.setDevice({ ...device, width: device.height, height: device.width });
  }
  /** Flip the mobile flag on the current device (drives touch + pointer media). Engages emulation if not already active. */
  toggleMobile() {
    const model = this.editor.model;
    if (!model) {
      return;
    }
    const device = model.device;
    void model.setDevice({ ...device ?? {}, mobile: !device?.mobile });
  }
  // -- Internal helpers ---------------------------------------------------
  _syncContextKeys(device) {
    this._isMobile.set(!!device?.mobile);
    this._hasUserAgent.set(!!device?.userAgent);
  }
  _setToolbarVisible(visible) {
    if (visible === this._toolbar.isVisible) {
      return;
    }
    if (visible) {
      this._toolbar.show();
    } else {
      this._toolbar.hide();
    }
    this._toolbarVisible.set(visible);
    this.editor.layoutBrowserContainer();
  }
  _updateSashState() {
    const state = this.editor.model?.device ? 3 /* Enabled */ : 0 /* Disabled */;
    if (this._eastSash) {
      this._eastSash.state = state;
    }
    if (this._southSash) {
      this._southSash.state = state;
    }
  }
  /**
   * Create east + south resize sashes (with an auto-managed south-east corner)
   * that drag the container to set explicit device dimensions. The container is
   * centered in the wrapper, so a pointer delta of N px equals 2*N px of growth.
   */
  _createResizeSashes(container2) {
    const SASH_OFFSET = 6;
    const eastSash = this._register(new Sash(container2, {
      getVerticalSashLeft: () => container2.clientWidth + SASH_OFFSET,
      getVerticalSashTop: () => 0,
      getVerticalSashHeight: () => container2.clientHeight
    }, { orientation: 0 /* VERTICAL */, orthogonalEdge: "south" /* South */ }));
    const southSash = this._register(new Sash(container2, {
      getHorizontalSashTop: () => container2.clientHeight + SASH_OFFSET,
      getHorizontalSashLeft: () => 0,
      getHorizontalSashWidth: () => container2.clientWidth
    }, { orientation: 1 /* HORIZONTAL */, orthogonalEdge: "east" /* East */ }));
    southSash.orthogonalEndSash = eastSash;
    eastSash.orthogonalEndSash = southSash;
    this._eastSash = eastSash;
    this._southSash = southSash;
    this._updateSashState();
    let drag;
    const onStart = () => {
      const model = this.editor.model;
      if (!model || !model.device) {
        return;
      }
      const device = model.device;
      container2.classList.add("browser-container--dragging");
      const pane = this.editor.paneSize;
      const containerRect = container2.getBoundingClientRect();
      const fitScale = pane.width > 0 && pane.height > 0 ? Math.min(device.width ? pane.width / device.width : 1, device.height ? pane.height / device.height : 1, 1) : 1;
      const startScale = this._scale ?? fitScale;
      drag = {
        startContainerW: containerRect.width,
        startContainerH: containerRect.height,
        scale: Math.max(0.01, startScale),
        paneW: pane.width,
        paneH: pane.height
      };
    };
    const onChange = (axis, evt) => {
      if (!drag) {
        return;
      }
      const device = this.editor.model?.device ?? {};
      if (axis === "x") {
        const w = Math.max(50, Math.min(drag.paneW, drag.startContainerW + (evt.currentX - evt.startX) * 2));
        void this.editor.model?.setDevice({ ...device, width: Math.max(50, Math.round(w / drag.scale)) });
      } else {
        const h3 = Math.max(50, Math.min(drag.paneH, drag.startContainerH + (evt.currentY - evt.startY) * 2));
        void this.editor.model?.setDevice({ ...device, height: Math.max(50, Math.round(h3 / drag.scale)) });
      }
    };
    const onEnd = () => {
      if (!drag) {
        return;
      }
      container2.classList.remove("browser-container--dragging");
      drag = void 0;
    };
    this._register(eastSash.onDidStart(onStart));
    this._register(southSash.onDidStart(onStart));
    this._register(eastSash.onDidChange((evt) => onChange("x", evt)));
    this._register(southSash.onDidChange((evt) => onChange("y", evt)));
    this._register(eastSash.onDidEnd(onEnd));
    this._register(southSash.onDidEnd(onEnd));
    this._register(eastSash.onDidReset(() => this._resetAxis("x")));
    this._register(southSash.onDidReset(() => this._resetAxis("y")));
  }
  _resetAxis(axis) {
    const model = this.editor.model;
    if (!model?.device) {
      return;
    }
    const device = model.device;
    void model.setDevice(axis === "x" ? { ...device, width: void 0 } : { ...device, height: void 0 });
  }
};

BrowserEditorEmulationSupport = __decorateClass([
  __decorateParam(1, IContextKeyService),
  __decorateParam(2, IInstantiationService)
], BrowserEditorEmulationSupport);

BrowserEditor.registerContribution(BrowserEditorEmulationSupport);

var ToggleBrowserEmulationAction = class _ToggleBrowserEmulationAction extends Action2 {
  static {
    this.ID = "workbench.action.browser.toggleDeviceEmulation";
  }
  constructor() {
    super({
      id: _ToggleBrowserEmulationAction.ID,
      title: localize2(8074, "Device Emulation"),
      category: BrowserActionCategory,
      icon: Codicon.deviceMobile,
      f1: true,
      toggled: CONTEXT_BROWSER_EMULATION_TOOLBAR_VISIBLE,
      precondition: BROWSER_EDITOR_ACTIVE,
      menu: {
        id: MenuId.BrowserActionsToolbar,
        group: "3_tools" /* Tools */,
        order: 3,
        isHiddenByDefault: true
      }
    });
  }
  run(accessor, browserEditor = accessor.get(IEditorService).activeEditorPane) {
    if (browserEditor instanceof BrowserEditor) {
      const support = browserEditor.getContribution(BrowserEditorEmulationSupport);
      support?.setVisible(!support.isVisible);
    }
  }
};

MenuRegistry.appendMenuItem(MenuId.BrowserEmulationToolbar, {
  command: {
    id: ToggleBrowserEmulationAction.ID,
    title: localize(8065, null),
    icon: Codicon.close
  },
  order: 100
});

var ToggleBrowserMobileEmulationAction = class _ToggleBrowserMobileEmulationAction extends Action2 {
  static {
    this.ID = "workbench.action.browser.toggleMobileEmulation";
  }
  constructor() {
    super({
      id: _ToggleBrowserMobileEmulationAction.ID,
      title: localize2(8075, "Toggle Mobile Emulation"),
      category: BrowserActionCategory,
      icon: Codicon.deviceMobile,
      f1: true,
      toggled: CONTEXT_BROWSER_EMULATION_IS_MOBILE,
      precondition: BROWSER_EDITOR_ACTIVE
    });
  }
  run(accessor, browserEditor = accessor.get(IEditorService).activeEditorPane) {
    if (browserEditor instanceof BrowserEditor) {
      browserEditor.getContribution(BrowserEditorEmulationSupport)?.toggleMobile();
    }
  }
};

MenuRegistry.appendMenuItem(MenuId.BrowserEmulationToolbar, {
  command: {
    id: ToggleBrowserMobileEmulationAction.ID,
    title: localize(8066, null),
    icon: Codicon.deviceMobile,
    toggled: CONTEXT_BROWSER_EMULATION_IS_MOBILE
  },
  order: 20
});

var DEFAULT_BROWSER_DEVICE_PRESETS = [
  {
    name: "iPhone 15 Pro",
    device: { width: 393, height: 852, mobile: true, deviceScaleFactor: 3, userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1" }
  },
  {
    name: "iPhone SE",
    device: { width: 375, height: 667, mobile: true, deviceScaleFactor: 2, userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1" }
  },
  {
    name: "Pixel 8",
    device: { width: 412, height: 915, mobile: true, deviceScaleFactor: 2.625, userAgent: "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36" }
  },
  {
    name: "iPad Mini",
    device: { width: 768, height: 1024, mobile: true, deviceScaleFactor: 2, userAgent: "Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1" }
  }
];

var PickBrowserDevicePresetAction = class _PickBrowserDevicePresetAction extends Action2 {
  static {
    this.ID = "workbench.action.browser.pickDevicePreset";
  }
  constructor() {
    super({
      id: _PickBrowserDevicePresetAction.ID,
      title: localize2(8071, "Emulate Device..."),
      category: BrowserActionCategory,
      icon: Codicon.library,
      f1: true,
      precondition: BROWSER_EDITOR_ACTIVE
    });
  }
  async run(accessor, browserEditor = accessor.get(IEditorService).activeEditorPane) {
    if (!(browserEditor instanceof BrowserEditor)) {
      return;
    }
    const support = browserEditor.getContribution(BrowserEditorEmulationSupport);
    if (!support) {
      return;
    }
    const quickInputService = accessor.get(IQuickInputService);
    const items = DEFAULT_BROWSER_DEVICE_PRESETS.map((p) => ({
      label: p.name,
      description: p.device?.width && p.device?.height ? `${p.device.width}\xD7${p.device.height}${p.device?.mobile ? ` \u2022 ${localize(8061, null)}` : ""}` : void 0,
      preset: p
    }));
    const picked = await quickInputService.pick(items, {
      placeHolder: localize(8062, null),
      matchOnDescription: true
    });
    if (picked) {
      support.applyPreset(picked.preset);
    }
  }
};

MenuRegistry.appendMenuItem(MenuId.BrowserEmulationToolbar, {
  command: {
    id: PickBrowserDevicePresetAction.ID,
    title: localize(8067, null),
    icon: Codicon.library
  },
  order: 5
});

var SetBrowserUserAgentAction = class _SetBrowserUserAgentAction extends Action2 {
  static {
    this.ID = "workbench.action.browser.setUserAgent";
  }
  constructor() {
    super({
      id: _SetBrowserUserAgentAction.ID,
      title: localize2(8073, "Emulate User Agent..."),
      category: BrowserActionCategory,
      icon: Codicon.tag,
      f1: true,
      toggled: CONTEXT_BROWSER_EMULATION_HAS_USER_AGENT,
      precondition: BROWSER_EDITOR_ACTIVE
    });
  }
  async run(accessor, browserEditor = accessor.get(IEditorService).activeEditorPane) {
    if (!(browserEditor instanceof BrowserEditor)) {
      return;
    }
    const support = browserEditor.getContribution(BrowserEditorEmulationSupport);
    if (!support) {
      return;
    }
    const quickInputService = accessor.get(IQuickInputService);
    const value2 = await quickInputService.input({
      prompt: localize(8076, null),
      value: support.userAgent ?? ""
    });
    if (value2 === void 0) {
      return;
    }
    support.setUserAgent(value2.trim() || void 0);
  }
};

MenuRegistry.appendMenuItem(MenuId.BrowserEmulationToolbar, {
  command: {
    id: SetBrowserUserAgentAction.ID,
    title: localize(8069, null),
    icon: Codicon.tag,
    toggled: CONTEXT_BROWSER_EMULATION_HAS_USER_AGENT
  },
  order: 6
});

var ResetBrowserEmulationAction = class _ResetBrowserEmulationAction extends Action2 {
  static {
    this.ID = "workbench.action.browser.resetEmulation";
  }
  constructor() {
    super({
      id: _ResetBrowserEmulationAction.ID,
      title: localize2(8072, "Reset Emulation"),
      category: BrowserActionCategory,
      icon: Codicon.discard,
      f1: true,
      precondition: ContextKeyExpr.and(BROWSER_EDITOR_ACTIVE, CONTEXT_BROWSER_EMULATION_TOOLBAR_VISIBLE)
    });
  }
  run(accessor, browserEditor = accessor.get(IEditorService).activeEditorPane) {
    if (browserEditor instanceof BrowserEditor) {
      browserEditor.getContribution(BrowserEditorEmulationSupport)?.resetAll();
    }
  }
};

MenuRegistry.appendMenuItem(MenuId.BrowserEmulationToolbar, {
  command: {
    id: ResetBrowserEmulationAction.ID,
    title: localize(8068, null),
    icon: Codicon.discard
  },
  order: 90
});

registerAction2(ToggleBrowserEmulationAction);

registerAction2(PickBrowserDevicePresetAction);

registerAction2(SetBrowserUserAgentAction);

registerAction2(ToggleBrowserMobileEmulationAction);

registerAction2(ResetBrowserEmulationAction);
export { CONTEXT_BROWSER_EMULATION_TOOLBAR_VISIBLE, CONTEXT_BROWSER_EMULATION_IS_MOBILE, CONTEXT_BROWSER_EMULATION_HAS_USER_AGENT, lastSettings, BrowserEmulationToolbar, BrowserEditorEmulationSupport, ToggleBrowserEmulationAction, ToggleBrowserMobileEmulationAction, DEFAULT_BROWSER_DEVICE_PRESETS, PickBrowserDevicePresetAction, SetBrowserUserAgentAction, ResetBrowserEmulationAction };
