// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/browserView/electron-browser/features/browserAutoReloadFeatures.ts
import { URI } from "./module-0032.mjs";
import { Schemas } from "./module-0033.mjs";
import { createDecorator } from "./module-0077.mjs";
import { Disposable, DisposableStore, MutableDisposable } from "./module-0012.mjs";
import { RunOnceScheduler } from "./module-0036.mjs";
import { onUnexpectedError } from "./module-0004.mjs";
import { Emitter } from "./module-0017.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IBrowserViewWorkbenchService } from "./module-1243.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IFileService } from "./module-0269.mjs";
import { BrowserEditor, BrowserEditorContribution } from "./module-4048.mjs";
import { BrowserViewCommandId } from "./module-1237.mjs";
import { MenuItemAction } from "./module-0092.mjs";
import { Codicon } from "./module-0085.mjs";
import { localize } from "./module-0001.mjs";
import { DropdownWithPrimaryActionViewItem } from "./module-1932.mjs";
import { toAction } from "./module-0082.mjs";
import { registerSingleton } from "./module-0135.mjs";
import { WorkbenchPhase, registerWorkbenchContribution2 } from "./module-0870.mjs";
import { Registry } from "./module-0090.mjs";
import { Extensions4 } from "./module-0140.mjs";
import { workbenchConfigurationNodeBase } from "./module-1112.mjs";


// src/vs/workbench/contrib/browserView/electron-browser/features/browserAutoReloadFeatures.ts
var BrowserAutoReloadOnFileChangeSettingId = "workbench.browser.autoReloadOnFileChange";

function getFileUri(url) {
  if (!url) {
    return void 0;
  }
  const uri5 = URI.parse(url);
  return uri5.scheme === Schemas.file ? uri5.with({ query: null, fragment: null }) : void 0;
}

var IBrowserAutoReloadService = createDecorator("browserAutoReloadService");

var BrowserAutoReloadWatcher = class extends Disposable {
  constructor(input, enabled, _fileService) {
    super();
    this._fileService = _fileService;
    this._watcher = this._register(new MutableDisposable());
    this._modelListeners = this._register(new MutableDisposable());
    this._hasPendingChange = false;
    this._enabled = enabled;
    this._register(input.onceModelResolves((model) => this._attachModel(model)));
  }
  setEnabled(enabled) {
    if (this._enabled === enabled) {
      return;
    }
    this._enabled = enabled;
    this._hasPendingChange = false;
    this._updateWatcher();
  }
  _attachModel(model) {
    const listeners = new DisposableStore();
    this._modelListeners.value = listeners;
    this._model = model;
    listeners.add(model.onDidNavigate(() => {
      this._hasPendingChange = false;
      this._updateWatcher();
    }));
    listeners.add(model.onDidChangeVisibility(() => this._reloadPendingChange()));
    listeners.add(model.onWillDispose(() => {
      if (this._model === model) {
        this._model = void 0;
        this._hasPendingChange = false;
        this._watcher.clear();
      }
    }));
    this._updateWatcher();
  }
  _updateWatcher() {
    this._watcher.clear();
    const model = this._model;
    if (!this._enabled || !model) {
      return;
    }
    const uri5 = getFileUri(model.url);
    if (!uri5) {
      return;
    }
    const store = new DisposableStore();
    const scheduler = store.add(new RunOnceScheduler(() => {
      this._hasPendingChange = true;
      this._reloadPendingChange();
    }, 300));
    const watcher = store.add(this._fileService.createWatcher(uri5, { recursive: false, excludes: [] }));
    store.add(watcher.onDidChange((event) => {
      if (event.contains(uri5, 0 /* UPDATED */) || event.contains(uri5, 1 /* ADDED */)) {
        scheduler.schedule();
      }
    }));
    this._watcher.value = store;
  }
  _reloadPendingChange() {
    if (!this._enabled || !this._hasPendingChange || !this._model?.visible) {
      return;
    }
    this._hasPendingChange = false;
    this._model.reload().catch(onUnexpectedError);
  }
};

var BrowserAutoReloadService = class extends Disposable {
  constructor(_browserViewWorkbenchService, _configurationService, _fileService) {
    super();
    this._browserViewWorkbenchService = _browserViewWorkbenchService;
    this._configurationService = _configurationService;
    this._fileService = _fileService;
    this._onDidChangeState = this._register(new Emitter());
    this.onDidChangeState = this._onDidChangeState.event;
    this._watchers = /* @__PURE__ */ new Map();
    this._overrides = /* @__PURE__ */ new Map();
    this._register(this._browserViewWorkbenchService.onDidChangeBrowserViews(() => this._updateBrowserViews()));
    this._register(this._configurationService.onDidChangeConfiguration((event) => {
      if (event.affectsConfiguration(BrowserAutoReloadOnFileChangeSettingId)) {
        this._updateDefault();
      }
    }));
    this._updateBrowserViews();
  }
  isEnabled(browserId) {
    return this._overrides.get(browserId) ?? this._configurationService.getValue(BrowserAutoReloadOnFileChangeSettingId);
  }
  setEnabled(browserId, enabled) {
    if (this.isEnabled(browserId) === enabled) {
      return;
    }
    this._overrides.set(browserId, enabled);
    this._watchers.get(browserId)?.watcher.setEnabled(enabled);
    this._onDidChangeState.fire({ browserId, enabled });
  }
  _updateBrowserViews() {
    const browserViews = this._browserViewWorkbenchService.getKnownBrowserViews();
    for (const [browserId, entry] of this._watchers) {
      const input = browserViews.get(browserId);
      if (input !== entry.input) {
        entry.watcher.dispose();
        this._watchers.delete(browserId);
        if (!input) {
          this._overrides.delete(browserId);
        }
      }
    }
    for (const [browserId, input] of browserViews) {
      if (!this._watchers.has(browserId)) {
        const watcher = new BrowserAutoReloadWatcher(input, this.isEnabled(browserId), this._fileService);
        this._watchers.set(browserId, { input, watcher });
      }
    }
  }
  _updateDefault() {
    for (const [browserId, entry] of this._watchers) {
      if (!this._overrides.has(browserId)) {
        const enabled = this.isEnabled(browserId);
        entry.watcher.setEnabled(enabled);
        this._onDidChangeState.fire({ browserId, enabled });
      }
    }
  }
  dispose() {
    for (const { watcher } of this._watchers.values()) {
      watcher.dispose();
    }
    this._watchers.clear();
    super.dispose();
  }
};

BrowserAutoReloadService = __decorateClass([
  __decorateParam(0, IBrowserViewWorkbenchService),
  __decorateParam(1, IConfigurationService),
  __decorateParam(2, IFileService)
], BrowserAutoReloadService);

var BrowserAutoReloadWorkbenchContribution = class {
  static {
    this.ID = "workbench.contrib.browserAutoReload";
  }
  constructor(_browserAutoReloadService) {
  }
};

BrowserAutoReloadWorkbenchContribution = __decorateClass([
  __decorateParam(0, IBrowserAutoReloadService)
], BrowserAutoReloadWorkbenchContribution);

var BrowserEditorAutoReloadContribution = class extends BrowserEditorContribution {
  constructor(editor, _browserAutoReloadService) {
    super(editor);
    this._browserAutoReloadService = _browserAutoReloadService;
    this._onDidChangeActionViewItems = this._register(new Emitter());
    this.onDidChangeActionViewItems = this._onDidChangeActionViewItems.event;
    this._actionViewItemsUpdateScheduler = this._register(new RunOnceScheduler(() => this._onDidChangeActionViewItems.fire(), 0));
    this._register(this._browserAutoReloadService.onDidChangeState((event) => {
      if (event.browserId === this._model?.id) {
        this._actionViewItemsUpdateScheduler.schedule();
      }
    }));
  }
  get isLiveReloadEnabled() {
    return this.isFile && this._browserAutoReloadService.isEnabled(this._model.id);
  }
  get isFile() {
    return !!this._model && !!getFileUri(this._model.url);
  }
  getActionViewItem(action, options3, instantiationService) {
    if (action.id !== BrowserViewCommandId.Reload || !(action instanceof MenuItemAction) || !this.isFile) {
      return void 0;
    }
    const primaryAction = this.isLiveReloadEnabled ? instantiationService.createInstance(
      MenuItemAction,
      {
        ...action.item,
        icon: Codicon.sync,
        title: localize(7995, null)
      },
      action.alt?.item,
      { shouldForwardArgs: true },
      action.hideActions,
      action.menuKeybinding
    ) : action;
    return instantiationService.createInstance(
      DropdownWithPrimaryActionViewItem,
      primaryAction,
      toAction({
        id: "workbench.browser.reloadMenu",
        label: localize(7996, null),
        run: () => {
        }
      }),
      this._getLiveReloadMenuActions(),
      "",
      { hoverDelegate: options3.hoverDelegate }
    );
  }
  onModelAttached(model, store) {
    this._model = model;
    this._onDidChangeActionViewItems.fire();
    store.add(model.onDidNavigate(() => {
      this._onDidChangeActionViewItems.fire();
    }));
  }
  onModelDetached() {
    this._model = void 0;
    this._onDidChangeActionViewItems.fire();
  }
  _getLiveReloadMenuActions() {
    const contribution = this;
    const toggleAction = {
      id: "workbench.browser.toggleAutoReload",
      label: localize(7994, null),
      tooltip: "",
      class: void 0,
      get enabled() {
        return contribution.isFile;
      },
      get checked() {
        return contribution.isLiveReloadEnabled;
      },
      run: () => {
        const model = this._model;
        if (model) {
          this._browserAutoReloadService.setEnabled(model.id, !this.isLiveReloadEnabled);
        }
      }
    };
    return [toggleAction];
  }
};

BrowserEditorAutoReloadContribution = __decorateClass([
  __decorateParam(1, IBrowserAutoReloadService)
], BrowserEditorAutoReloadContribution);

registerSingleton(IBrowserAutoReloadService, BrowserAutoReloadService, 1 /* Delayed */);

registerWorkbenchContribution2(BrowserAutoReloadWorkbenchContribution.ID, BrowserAutoReloadWorkbenchContribution, WorkbenchPhase.AfterRestored);

BrowserEditor.registerContribution(BrowserEditorAutoReloadContribution);

Registry.as(Extensions4.Configuration).registerConfiguration({
  ...workbenchConfigurationNodeBase,
  properties: {
    [BrowserAutoReloadOnFileChangeSettingId]: {
      type: "boolean",
      default: true,
      markdownDescription: localize(
        7993,
        null
      )
    }
  }
});
export { getFileUri, BrowserAutoReloadOnFileChangeSettingId, IBrowserAutoReloadService, BrowserAutoReloadWatcher, BrowserAutoReloadService, BrowserAutoReloadWorkbenchContribution, BrowserEditorAutoReloadContribution };
