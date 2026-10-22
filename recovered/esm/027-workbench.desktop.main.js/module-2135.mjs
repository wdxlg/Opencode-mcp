// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/widget/input/chatPhoneInputPresenter.ts
import { createDecorator } from "./module-0077.mjs";
import { Disposable, DisposableStore, toDisposable } from "./module-0012.mjs";
import { observableValue } from "./module-0048.mjs";
import { derived } from "./module-0054.mjs";
import { registerSingleton } from "./module-0135.mjs";
import { BaseActionViewItem } from "./module-0476.mjs";
import { $, EventHelper, EventType, addDisposableListener, append, clearNode } from "./module-0075.mjs";
import { EventType2, Gesture } from "./module-0251.mjs";
import { autorun } from "./module-0052.mjs";
import { renderIcon } from "./module-0467.mjs";
import { getModelProviderIcon } from "./module-2134.mjs";
import { localize } from "./module-0001.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";


// src/vs/workbench/contrib/chat/browser/widget/input/chatPhoneInputPresenter.ts
var IChatPhoneInputPresenter = createDecorator("chatPhoneInputPresenter");

var ChatPhoneInputPresenterService = class extends Disposable {
  constructor() {
    super(...arguments);
    this._impl = observableValue(this, void 0);
    this.enabled = derived(this, (reader) => {
      const impl = this._impl.read(reader);
      return impl ? impl.enabled.read(reader) : false;
    });
  }
  showCombinedModeAndModelSheet(target, request2) {
    const impl = this._impl.get();
    return impl ? impl.showCombinedModeAndModelSheet(target, request2) : Promise.resolve();
  }
  setImpl(impl) {
    this._impl.set(impl, void 0);
    return toDisposable(() => {
      if (this._impl.get() === impl) {
        this._impl.set(void 0, void 0);
      }
    });
  }
};

registerSingleton(IChatPhoneInputPresenter, ChatPhoneInputPresenterService, 1 /* Delayed */);

var MobileChatInputCombinedPickerActionItem = class extends BaseActionViewItem {
  constructor(action, _modeDelegate, _modelDelegate, _presenter) {
    super(void 0, action);
    this._modeDelegate = _modeDelegate;
    this._modelDelegate = _modelDelegate;
    this._presenter = _presenter;
    this._renderDisposables = this._register(new DisposableStore());
  }
  render(container3) {
    this.element = container3;
    container3.classList.add("chat-input-picker-item");
    this._renderDisposables.clear();
    const trigger = append(container3, $("a.action-label.chat-phone-input-chip"));
    trigger.tabIndex = 0;
    trigger.role = "button";
    this._triggerElement = trigger;
    this._renderDisposables.add(Gesture.addTarget(trigger));
    for (const eventType of [EventType.CLICK, EventType2.Tap]) {
      this._renderDisposables.add(addDisposableListener(trigger, eventType, (e) => {
        EventHelper.stop(e, true);
        this._showSheet();
      }));
    }
    this._renderDisposables.add(addDisposableListener(trigger, EventType.KEY_DOWN, (e) => {
      if (e.key === "Enter" || e.key === " ") {
        EventHelper.stop(e, true);
        this._showSheet();
      }
    }));
    this._renderDisposables.add(autorun((reader) => {
      const currentMode = this._modeDelegate.currentMode.read(reader);
      currentMode.label.read(reader);
      currentMode.icon.read(reader);
      this._modelDelegate.currentModel.read(reader);
      this._updateTrigger();
    }));
  }
  _updateTrigger() {
    const trigger = this._triggerElement;
    if (!trigger) {
      return;
    }
    clearNode(trigger);
    const currentMode = this._modeDelegate.currentMode.get();
    const modeIcon = currentMode.icon.get();
    if (modeIcon) {
      append(trigger, renderIcon(modeIcon));
    }
    const currentModel = this._modelDelegate.currentModel.get();
    if (currentModel && this._modelDelegate.getPresentationOptions().showModelIcon) {
      append(trigger, renderIcon(getModelProviderIcon(currentModel)));
    }
    const labelText = currentModel?.metadata.name ?? localize(12502, null);
    const labelSpan = append(trigger, $("span.chat-input-picker-label"));
    labelSpan.textContent = labelText;
    const ariaParts = [];
    const modeLabel = currentMode.label.get();
    if (modeLabel) {
      ariaParts.push(modeLabel);
    }
    ariaParts.push(labelText);
    trigger.ariaLabel = localize(
      12503,
      null,
      ariaParts.join(", ")
    );
  }
  /** Belt-and-braces: keep the action's `run()` suppressed even if `super.render` is reintroduced. */
  onClick() {
  }
  async _showSheet() {
    const trigger = this._triggerElement;
    if (!trigger) {
      return;
    }
    trigger.setAttribute("aria-expanded", "true");
    try {
      await this._presenter.showCombinedModeAndModelSheet(trigger, {
        kind: "delegates",
        modeDelegate: this._modeDelegate,
        modelDelegate: this._modelDelegate
      });
    } finally {
      trigger.setAttribute("aria-expanded", "false");
      trigger.focus();
    }
  }
};

MobileChatInputCombinedPickerActionItem = __decorateClass([
  __decorateParam(3, IChatPhoneInputPresenter)
], MobileChatInputCombinedPickerActionItem);
export { IChatPhoneInputPresenter, ChatPhoneInputPresenterService, MobileChatInputCombinedPickerActionItem };
