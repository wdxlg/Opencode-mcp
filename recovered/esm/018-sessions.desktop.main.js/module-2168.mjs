// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/widget/input/modelPicker/modelPickerActionItem.ts
import { BaseActionViewItem } from "./module-0476.mjs";
import { MutableDisposable } from "./module-0012.mjs";
import { ModelPickerWidget } from "./module-2167.mjs";
import { autorun } from "./module-0052.mjs";
import { getActiveWindow } from "./module-0075.mjs";
import { getBaseLayerHoverDelegate } from "./module-0472.mjs";
import { getDefaultHoverDelegate } from "./module-0448.mjs";
import { localize } from "./module-0001.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { IKeybindingService } from "./module-0352.mjs";


// src/vs/workbench/contrib/chat/browser/widget/input/modelPicker/modelPickerActionItem.ts
var ModelPickerActionItem = class extends BaseActionViewItem {
  constructor(action, delegate, pickerOptions, instantiationService, _contextKeyService, keybindingService) {
    super(void 0, action);
    this.pickerOptions = pickerOptions;
    this._contextKeyService = _contextKeyService;
    this.keybindingService = keybindingService;
    this._managedHover = this._register(new MutableDisposable());
    this._pickerWidget = this._register(instantiationService.createInstance(ModelPickerWidget, delegate));
    this._pickerWidget.setSelectedModel(delegate.currentModel.get());
    this._pickerWidget.setCompact(pickerOptions.compact);
    this._register(autorun((t2) => {
      const model = delegate.currentModel.read(t2);
      this._pickerWidget.setSelectedModel(model);
      this._updateTooltip();
    }));
    this._register(this._pickerWidget.onDidChangeSelection((model) => delegate.setModel(model)));
  }
  render(container2) {
    this._pickerWidget.render(container2);
    this.element = this._pickerWidget.domNode;
    this._updateTooltip();
    container2.classList.add("chat-input-picker-item");
  }
  _getAnchorElement() {
    if (this.element && getActiveWindow().document.contains(this.element)) {
      return this.element;
    }
    return this.pickerOptions.getOverflowAnchor?.() ?? this.element;
  }
  openModelPicker() {
    this._showPicker();
  }
  show(anchor) {
    this._pickerWidget.show(anchor ?? this._getAnchorElement());
  }
  setEnabled(enabled) {
    this._pickerWidget.setEnabled(enabled);
  }
  /**
   * Whether the picker has no usable model because the workspace is untrusted
   * (Restricted Mode). Lets a host (e.g. the sessions picker) keep the picker
   * visible to surface the "Models" placeholder and Trust Workspace action
   * instead of hiding it as an empty/no-model picker.
   */
  isRestrictedMode() {
    return this._pickerWidget.isRestrictedMode();
  }
  /**
   * Whether the picker has no usable model because Chat still needs sign-in /
   * setup. Like {@link isRestrictedMode}, lets a host keep the picker visible to
   * surface the "Models" placeholder and Sign In action.
   */
  isSetupRequired() {
    return this._pickerWidget.isSetupRequired();
  }
  _showPicker() {
    this._pickerWidget.show(this._getAnchorElement());
  }
  _updateTooltip() {
    const target = this._pickerWidget.nameButton;
    if (!target) {
      return;
    }
    this._managedHover.value = getBaseLayerHoverDelegate().setupManagedHover(
      getDefaultHoverDelegate("mouse"),
      target,
      () => this._getHoverContents()
    );
  }
  _getHoverContents() {
    let label3 = localize(12549, null);
    const keybindingLabel2 = this.keybindingService.lookupKeybinding(this._action.id, this._contextKeyService)?.getLabel();
    if (keybindingLabel2) {
      label3 += ` (${keybindingLabel2})`;
    }
    if (this._pickerWidget.isRestrictedMode()) {
      return localize(12550, null, label3);
    }
    if (this._pickerWidget.isSetupRequired()) {
      return localize(12551, null, label3);
    }
    const { statusIcon, tooltip } = this._pickerWidget.selectedModel?.metadata || {};
    return statusIcon && tooltip ? `${label3} \u2022 ${tooltip}` : label3;
  }
};

ModelPickerActionItem = __decorateClass([
  __decorateParam(3, IInstantiationService),
  __decorateParam(4, IContextKeyService),
  __decorateParam(5, IKeybindingService)
], ModelPickerActionItem);
export { ModelPickerActionItem };
