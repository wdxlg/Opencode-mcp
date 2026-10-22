// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/browserView/electron-browser/features/browserPermissionsFeature.ts
import { BROWSER_EDITOR_ACTIVE, BrowserActionCategory, BrowserEditor, BrowserEditorContribution, CONTEXT_BROWSER_HAS_URL } from "./module-4159.mjs";
import { DisposableStore, toDisposable } from "./module-0012.mjs";
import { ALL_PERMISSION_CATEGORIES, PERMISSION_CATEGORY_DESCRIPTORS, toOriginKey } from "./module-1236.mjs";
import { INotificationService, Severity2 } from "./module-0336.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IQuickInputService } from "./module-0536.mjs";
import { IDialogService } from "./module-0267.mjs";
import { assertNever } from "./module-0009.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { Codicon } from "./module-0085.mjs";
import { Action2, MenuId, registerAction2 } from "./module-0092.mjs";
import { BrowserViewCommandId } from "./module-1237.mjs";
import { ContextKeyExpr } from "./module-0089.mjs";
import { IEditorService } from "./module-0935.mjs";


// src/vs/workbench/contrib/browserView/electron-browser/features/browserPermissionsFeature.ts
var BrowserPermissionsFeature = class extends BrowserEditorContribution {
  constructor(editor, _quickInputService, _notificationService, _dialogService) {
    super(editor);
    this._quickInputService = _quickInputService;
    this._notificationService = _notificationService;
    this._dialogService = _dialogService;
    this._modelDisposables = this._register(new DisposableStore());
    /** Open device choosers keyed by request id, so updates reach the right one. */
    this._devicePickers = /* @__PURE__ */ new Map();
  }
  onModelAttached() {
    this._modelDisposables.clear();
    this._model = this.editor.model;
    this._permissions = this._model.permissions;
    this._modelDisposables.add(this._model.onDidRequestPermission((e4) => {
      if (e4.device) {
        this._onDidRequestDevice(e4.origin, e4.device);
      } else {
        void this._onDidRequestPermission(e4.origin, e4.category);
      }
    }));
    this._modelDisposables.add(toDisposable(() => this._closeDevicePickers()));
  }
  onModelDetached() {
    this._modelDisposables.clear();
    this._model = void 0;
    this._permissions = void 0;
  }
  _closeDevicePickers() {
    for (const picker of [...this._devicePickers.values()]) {
      picker.dispose();
    }
    this._devicePickers.clear();
  }
  _onDidRequestDevice(origin, request2) {
    const existing = this._devicePickers.get(request2.requestId);
    if (existing) {
      existing.update(request2);
      return;
    }
    const model = this._model;
    if (!model) {
      return;
    }
    const handle2 = showDevicePicker(this._quickInputService, model, origin, request2, () => this._devicePickers.delete(request2.requestId));
    this._devicePickers.set(request2.requestId, handle2);
  }
  async _onDidRequestPermission(origin, category9) {
    const model = this._model;
    if (!model) {
      return;
    }
    const descriptor = PERMISSION_CATEGORY_DESCRIPTORS[category9];
    const { result } = await this._dialogService.prompt({
      type: Severity2.Info,
      message: localize(8151, null, displayOrigin(origin), descriptor.label),
      detail: `\u2022 ${descriptor.description}`,
      buttons: [
        {
          label: localize(8147, null),
          run: () => "allow"
        },
        {
          label: localize(8148, null),
          run: () => "deny"
        }
      ],
      // Dismissing leaves the request undecided. The main process settles
      // the page's request on navigation / teardown (or a timeout), so a
      // late answer here is harmless.
      cancelButton: true
    });
    if (result === "allow" || result === "deny") {
      void model.setPermissions(origin, [{ category: category9, state: result }]);
    } else {
      void model.setPermissions(origin, [{ category: category9, state: null }]);
    }
  }
  showManagementPicker() {
    const model = this._model;
    const permissions = this._permissions;
    if (!model || !permissions) {
      return;
    }
    const origin = toOriginKey(model.url);
    if (!origin) {
      this._notificationService.info(localize(8149, null));
      return;
    }
    showPermissionsPicker(this._quickInputService, model, permissions, origin);
  }
};

BrowserPermissionsFeature = __decorateClass([
  __decorateParam(1, IQuickInputService),
  __decorateParam(2, INotificationService),
  __decorateParam(3, IDialogService)
], BrowserPermissionsFeature);

BrowserEditor.registerContribution(BrowserPermissionsFeature);

function deviceTypeLabel(deviceType) {
  switch (deviceType) {
    case "usb":
      return localize(8143, null);
    case "serial":
      return localize(8142, null);
    case "hid":
      return localize(8141, null);
    case "bluetooth":
      return localize(8140, null);
    default:
      assertNever(deviceType);
  }
}

function showDevicePicker(quickInputService, model, origin, request2, onDone) {
  const disposables = new DisposableStore();
  const picker = disposables.add(quickInputService.createQuickPick());
  picker.title = localize(8145, null, displayOrigin(origin), deviceTypeLabel(request2.deviceType));
  picker.placeholder = localize(8144, null);
  picker.matchOnDescription = true;
  picker.ignoreFocusOut = true;
  picker.busy = true;
  let resolved = false;
  let finished = false;
  const finish = () => {
    if (finished) {
      return;
    }
    finished = true;
    disposables.dispose();
    onDone();
  };
  const resolve3 = (deviceId) => {
    if (resolved) {
      return;
    }
    resolved = true;
    void model.selectDevice(request2.requestId, deviceId);
  };
  const setDevices = (devices) => {
    const activeId = picker.activeItems[0]?.deviceId;
    const items = devices.map((device) => ({ label: device.label, description: device.detail, deviceId: device.deviceId }));
    picker.items = items;
    if (activeId !== void 0) {
      const active = items.find((item) => item.deviceId === activeId);
      if (active) {
        picker.activeItems = [active];
      }
    }
  };
  setDevices(request2.devices);
  disposables.add(picker.onDidAccept(() => {
    const pick = picker.selectedItems[0];
    if (!pick) {
      return;
    }
    resolve3(pick.deviceId);
    finish();
  }));
  disposables.add(picker.onDidHide(() => {
    resolve3(null);
    finish();
  }));
  picker.show();
  return {
    update: (next) => {
      setDevices(next.devices);
    },
    dispose: () => {
      resolve3(null);
      finish();
    }
  };
}

function showPermissionsPicker(quickInputService, model, permissions, origin) {
  const disposables = new DisposableStore();
  const picker = disposables.add(quickInputService.createQuickPick());
  picker.title = localize(8158, null, displayOrigin(origin));
  picker.placeholder = localize(8150, null);
  picker.sortByLabel = false;
  picker.ignoreFocusOut = true;
  const edits = /* @__PURE__ */ new Map();
  const storedDecision = (category9) => {
    return permissions.getDecision(origin, category9) ?? null;
  };
  const pendingDecision = (category9) => edits.has(category9) ? edits.get(category9) : storedDecision(category9);
  const setPendingDecision = (category9, decision) => {
    if (decision === storedDecision(category9)) {
      edits.delete(category9);
    } else {
      edits.set(category9, decision);
    }
    rebuild();
  };
  const rebuild = () => {
    const activeCategory = picker.activeItems[0]?.category;
    const items = buildItems();
    picker.items = items;
    if (activeCategory !== void 0) {
      const active = items.find((item) => item.category === activeCategory);
      if (active) {
        picker.activeItems = [active];
      }
    }
    picker.customButton = edits.size > 0;
    picker.customLabel = edits.size === 1 ? localize(8153, null) : localize(8152, null, edits.size);
  };
  rebuild();
  disposables.add(picker.onDidTriggerItemButton(({ button, item }) => {
    const { kind } = button;
    if (kind === "allow") {
      setPendingDecision(item.category, "allow");
    } else if (kind === "deny") {
      setPendingDecision(item.category, "deny");
    } else {
      setPendingDecision(item.category, null);
    }
  }));
  disposables.add(picker.onDidCustom(() => {
    if (edits.size === 0) {
      return;
    }
    const grants = [...edits].map(([category9, state]) => ({ category: category9, state }));
    void model.setPermissions(origin, grants);
    picker.hide();
  }));
  disposables.add(permissions.onDidChange(rebuild));
  disposables.add(picker.onDidHide(() => disposables.dispose()));
  picker.show();
  function buildItems() {
    return ALL_PERMISSION_CATEGORIES.map(buildItem);
  }
  function buildItem(category9) {
    const descriptor = PERMISSION_CATEGORY_DESCRIPTORS[category9];
    const override = pendingDecision(category9);
    const hasOverride = !!override;
    const effective = hasOverride ? override : permissions.defaultStateFor(category9);
    const stateLabel = effective === "allow" ? localize(8154, null) : effective === "deny" ? localize(8156, null) : localize(8155, null);
    const description = hasOverride ? stateLabel : localize(8157, null, stateLabel);
    const buttons = [];
    if (effective !== "allow") {
      buttons.push({
        kind: "allow",
        iconClass: ThemeIcon.asClassName(Codicon.check),
        tooltip: localize(8147, null)
      });
    }
    if (effective !== "deny") {
      buttons.push({
        kind: "deny",
        iconClass: ThemeIcon.asClassName(Codicon.circleSlash),
        tooltip: localize(8148, null)
      });
    }
    if (effective !== "ask") {
      buttons.push({
        kind: hasOverride ? "reset" : effective === "allow" ? "allow" : "deny",
        iconClass: ThemeIcon.asClassName(effective === "allow" ? Codicon.check : Codicon.circleSlash),
        alwaysVisible: true,
        toggle: { checked: hasOverride },
        tooltip: description
      });
    }
    return {
      category: category9,
      label: descriptor.label,
      detail: descriptor.description,
      iconClass: ThemeIcon.asClassName(descriptor.icon),
      buttons
    };
  }
}

function displayOrigin(origin) {
  try {
    return new URL(origin).host || origin;
  } catch {
    return origin;
  }
}

var ManageBrowserPermissionsAction = class _ManageBrowserPermissionsAction extends Action2 {
  static {
    this.ID = BrowserViewCommandId.ManagePermissions;
  }
  constructor() {
    const when = ContextKeyExpr.and(BROWSER_EDITOR_ACTIVE, CONTEXT_BROWSER_HAS_URL);
    super({
      id: _ManageBrowserPermissionsAction.ID,
      title: localize2(8146, "Site Permissions"),
      category: BrowserActionCategory,
      icon: Codicon.shield,
      f1: true,
      precondition: when,
      menu: {
        id: MenuId.BrowserActionsToolbar,
        group: "4_data" /* Data */,
        order: 10,
        when,
        isHiddenByDefault: true
      }
    });
  }
  async run(accessor, browserEditor = accessor.get(IEditorService).activeEditorPane) {
    if (browserEditor instanceof BrowserEditor) {
      browserEditor.getContribution(BrowserPermissionsFeature)?.showManagementPicker();
    }
  }
};

registerAction2(ManageBrowserPermissionsAction);
export { deviceTypeLabel, showDevicePicker, showPermissionsPicker, displayOrigin, BrowserPermissionsFeature, ManageBrowserPermissionsAction };
