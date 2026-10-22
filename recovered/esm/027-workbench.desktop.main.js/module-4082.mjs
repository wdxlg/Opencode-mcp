// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/browserView/electron-browser/features/browserEditorZoomFeature.ts
import { ContextKeyExpr, IContextKeyService, RawContextKey } from "./module-0089.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { Disposable, MutableDisposable } from "./module-0012.mjs";
import { $ } from "./module-0075.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { Codicon } from "./module-0085.mjs";
import { disposableTimeout } from "./module-0036.mjs";
import { BROWSER_EDITOR_ACTIVE, BrowserActionCategory, BrowserEditor, BrowserEditorContribution, CONTEXT_BROWSER_FOCUSED, CONTEXT_BROWSER_HAS_ERROR, CONTEXT_BROWSER_HAS_URL } from "./module-4048.mjs";
import { browserZoomAccessibilityLabel, browserZoomFactors, browserZoomLabel } from "./module-1237.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { BrowserZoomService, IBrowserZoomService, MATCH_WINDOW_ZOOM_LABEL } from "./module-1242.mjs";
import { IAccessibilityService } from "./module-0104.mjs";
import { Action2, MenuId, registerAction2 } from "./module-0092.mjs";
import { IEditorService } from "./module-0934.mjs";
import { zoomLevelToZoomFactor } from "./module-0515.mjs";
import { getZoomLevel, onDidChangeZoomLevel } from "./module-0018.mjs";
import { mainWindow } from "./module-0002.mjs";
import { WorkbenchPhase, registerWorkbenchContribution2 } from "./module-0870.mjs";
import { registerSingleton } from "./module-0135.mjs";
import { Registry } from "./module-0090.mjs";
import { Extensions4 } from "./module-0140.mjs";
import { workbenchConfigurationNodeBase } from "./module-1112.mjs";


// src/vs/workbench/contrib/browserView/electron-browser/features/browserEditorZoomFeature.ts
var CONTEXT_BROWSER_CAN_ZOOM_IN = new RawContextKey("browserCanZoomIn", true, localize(8103, null));

var CONTEXT_BROWSER_CAN_ZOOM_OUT = new RawContextKey("browserCanZoomOut", true, localize(8104, null));

var BrowserZoomPill = class extends Disposable {
  constructor() {
    super();
    this._timeout = this._register(new MutableDisposable());
    this.element = $(".browser-zoom-pill");
    this.element.setAttribute("aria-hidden", "true");
    this._icon = $("span");
    this._label = $("span");
    this.element.appendChild(this._icon);
    this.element.appendChild(this._label);
  }
  /**
   * Briefly show the zoom level, then auto-hide after 750 ms.
   */
  show(zoomLabel, isAtOrAboveDefault) {
    this._icon.className = ThemeIcon.asClassName(isAtOrAboveDefault ? Codicon.zoomIn : Codicon.zoomOut);
    this._label.textContent = zoomLabel;
    this.element.classList.add("visible");
    this._timeout.value = disposableTimeout(() => {
      this.element.classList.remove("visible");
    }, 750);
  }
};

var BrowserEditorZoomSupport = class extends BrowserEditorContribution {
  constructor(editor, contextKeyService, browserZoomService, accessibilityService) {
    super(editor);
    this.browserZoomService = browserZoomService;
    this.accessibilityService = accessibilityService;
    this._canZoomInContext = CONTEXT_BROWSER_CAN_ZOOM_IN.bindTo(contextKeyService);
    this._canZoomOutContext = CONTEXT_BROWSER_CAN_ZOOM_OUT.bindTo(contextKeyService);
    this._zoomPill = this._register(new BrowserZoomPill());
  }
  get widgets() {
    return [{ location: "postUrl" /* PostUrl */, element: this._zoomPill.element, order: 0 }];
  }
  onModelAttached(model, store) {
    this._updateZoomContext(model);
    store.add(model.onDidChangeZoom(() => {
      this._updateZoomContext(model);
    }));
  }
  onModelDetached() {
    this._canZoomInContext.reset();
    this._canZoomOutContext.reset();
  }
  async zoomIn() {
    await this.editor.model?.zoomIn();
    this._showZoomPill();
  }
  async zoomOut() {
    await this.editor.model?.zoomOut();
    this._showZoomPill();
  }
  async resetZoom() {
    await this.editor.model?.resetZoom();
    this._showZoomPill();
  }
  _updateZoomContext(model) {
    this._canZoomInContext.set(model.canZoomIn);
    this._canZoomOutContext.set(model.canZoomOut);
  }
  _showZoomPill() {
    const model = this.editor.model;
    if (!model) {
      return;
    }
    const defaultIndex = this.browserZoomService.getEffectiveZoomIndex(void 0, false);
    const defaultFactor = browserZoomFactors[defaultIndex];
    const currentFactor = model.zoomFactor;
    const label3 = browserZoomLabel(currentFactor);
    this._zoomPill.show(label3, currentFactor >= defaultFactor);
    this.accessibilityService.status(browserZoomAccessibilityLabel(currentFactor));
  }
};

BrowserEditorZoomSupport = __decorateClass([
  __decorateParam(1, IContextKeyService),
  __decorateParam(2, IBrowserZoomService),
  __decorateParam(3, IAccessibilityService)
], BrowserEditorZoomSupport);

BrowserEditor.registerContribution(BrowserEditorZoomSupport);

var ZoomInAction2 = class _ZoomInAction extends Action2 {
  static {
    this.ID = "workbench.action.browser.zoomIn";
  }
  constructor() {
    super({
      id: _ZoomInAction.ID,
      title: localize2(8108, "Zoom In"),
      category: BrowserActionCategory,
      icon: Codicon.zoomIn,
      f1: true,
      precondition: ContextKeyExpr.and(BROWSER_EDITOR_ACTIVE, CONTEXT_BROWSER_HAS_URL, CONTEXT_BROWSER_HAS_ERROR.negate()),
      menu: {
        id: MenuId.BrowserActionsToolbar,
        group: "2_zoom" /* Zoom */,
        order: 1,
        when: CONTEXT_BROWSER_CAN_ZOOM_IN,
        isHiddenByDefault: true
      },
      keybinding: {
        when: CONTEXT_BROWSER_FOCUSED,
        weight: 200 /* WorkbenchContrib */ + 75,
        // Same shortcuts as 'workbench.action.zoomIn'
        primary: 2048 /* CtrlCmd */ | 86 /* Equal */,
        secondary: [2048 /* CtrlCmd */ | 1024 /* Shift */ | 86 /* Equal */, 2048 /* CtrlCmd */ | 109 /* NumpadAdd */]
      }
    });
  }
  async run(accessor, browserEditor = accessor.get(IEditorService).activeEditorPane) {
    if (browserEditor instanceof BrowserEditor) {
      await browserEditor.getContribution(BrowserEditorZoomSupport)?.zoomIn();
    }
  }
};

var ZoomOutAction2 = class _ZoomOutAction extends Action2 {
  static {
    this.ID = "workbench.action.browser.zoomOut";
  }
  constructor() {
    super({
      id: _ZoomOutAction.ID,
      title: localize2(8109, "Zoom Out"),
      category: BrowserActionCategory,
      icon: Codicon.zoomOut,
      f1: true,
      precondition: ContextKeyExpr.and(BROWSER_EDITOR_ACTIVE, CONTEXT_BROWSER_HAS_URL, CONTEXT_BROWSER_HAS_ERROR.negate()),
      menu: {
        id: MenuId.BrowserActionsToolbar,
        group: "2_zoom" /* Zoom */,
        order: 2,
        when: CONTEXT_BROWSER_CAN_ZOOM_OUT,
        isHiddenByDefault: true
      },
      keybinding: {
        when: CONTEXT_BROWSER_FOCUSED,
        weight: 200 /* WorkbenchContrib */ + 75,
        // Same shortcuts as 'workbench.action.zoomOut'
        primary: 2048 /* CtrlCmd */ | 88 /* Minus */,
        secondary: [2048 /* CtrlCmd */ | 1024 /* Shift */ | 88 /* Minus */, 2048 /* CtrlCmd */ | 111 /* NumpadSubtract */],
        linux: {
          primary: 2048 /* CtrlCmd */ | 88 /* Minus */,
          secondary: [2048 /* CtrlCmd */ | 111 /* NumpadSubtract */]
        }
      }
    });
  }
  async run(accessor, browserEditor = accessor.get(IEditorService).activeEditorPane) {
    if (browserEditor instanceof BrowserEditor) {
      await browserEditor.getContribution(BrowserEditorZoomSupport)?.zoomOut();
    }
  }
};

var ResetZoomAction = class _ResetZoomAction extends Action2 {
  static {
    this.ID = "workbench.action.browser.resetZoom";
  }
  constructor() {
    super({
      id: _ResetZoomAction.ID,
      title: localize2(8107, "Reset Zoom"),
      category: BrowserActionCategory,
      icon: Codicon.screenNormal,
      f1: true,
      precondition: ContextKeyExpr.and(BROWSER_EDITOR_ACTIVE, CONTEXT_BROWSER_HAS_URL, CONTEXT_BROWSER_HAS_ERROR.negate()),
      menu: {
        id: MenuId.BrowserActionsToolbar,
        group: "2_zoom" /* Zoom */,
        order: 3,
        isHiddenByDefault: true
      },
      keybinding: {
        when: CONTEXT_BROWSER_FOCUSED,
        weight: 200 /* WorkbenchContrib */ + 75,
        // Same shortcuts as 'workbench.action.zoomReset'
        // (note: both workbench and here use Numpad0 instead of Digit0 to avoid conflicts with keybinding to focus sidebar.)
        primary: 2048 /* CtrlCmd */ | 98 /* Numpad0 */
      }
    });
  }
  async run(accessor, browserEditor = accessor.get(IEditorService).activeEditorPane) {
    if (browserEditor instanceof BrowserEditor) {
      await browserEditor.getContribution(BrowserEditorZoomSupport)?.resetZoom();
    }
  }
};

registerAction2(ZoomInAction2);

registerAction2(ZoomOutAction2);

registerAction2(ResetZoomAction);

var WindowZoomSynchronizer = class extends Disposable {
  static {
    this.ID = "workbench.contrib.browserView.windowZoomSynchronizer";
  }
  constructor(browserZoomService) {
    super();
    browserZoomService.notifyWindowZoomChanged(zoomLevelToZoomFactor(getZoomLevel(mainWindow)));
    this._register(onDidChangeZoomLevel(() => {
      browserZoomService.notifyWindowZoomChanged(zoomLevelToZoomFactor(getZoomLevel(mainWindow)));
    }));
  }
};

WindowZoomSynchronizer = __decorateClass([
  __decorateParam(0, IBrowserZoomService)
], WindowZoomSynchronizer);

registerWorkbenchContribution2(WindowZoomSynchronizer.ID, WindowZoomSynchronizer, WorkbenchPhase.BlockRestore);

registerSingleton(IBrowserZoomService, BrowserZoomService, 1 /* Delayed */);

Registry.as(Extensions4.Configuration).registerConfiguration({
  ...workbenchConfigurationNodeBase,
  properties: {
    "workbench.browser.pageZoom": {
      type: "string",
      enum: [MATCH_WINDOW_ZOOM_LABEL, ...browserZoomFactors.map((f) => `${Math.round(f * 100)}%`)],
      markdownEnumDescriptions: [
        localize(
          8105,
          null
        ),
        ...browserZoomFactors.map(() => "")
      ],
      default: MATCH_WINDOW_ZOOM_LABEL,
      markdownDescription: localize(
        8106,
        null
      ),
      // Zoom can change from machine to machine, so we don't need the workspace-level nor syncing that WINDOW has.
      scope: 2 /* MACHINE */
    }
  }
});
export { CONTEXT_BROWSER_CAN_ZOOM_IN, CONTEXT_BROWSER_CAN_ZOOM_OUT, BrowserZoomPill, BrowserEditorZoomSupport, ZoomInAction2, ZoomOutAction2, ResetZoomAction, WindowZoomSynchronizer };
