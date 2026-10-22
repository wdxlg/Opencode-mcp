// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/chat/browser/branchPicker.ts
import { Disposable, DisposableStore, toDisposable } from "./module-0012.mjs";
import { localize } from "./module-0001.mjs";
import { CheckboxChip } from "./module-3703.mjs";
import { $, EventHelper, EventType, addDisposableListener, append, clearNode } from "./module-0075.mjs";
import { EventType2, Gesture } from "./module-0251.mjs";
import { Codicon } from "./module-0085.mjs";
import { renderIcon } from "./module-0467.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IActionWidgetService } from "./module-0553.mjs";


// src/vs/sessions/contrib/chat/browser/branchPicker.ts
var FILTER_THRESHOLD3 = 10;

var descriptionIdPool = 0;

var BranchPicker = class extends Disposable {
  constructor(_options, _actionWidgetService) {
    super();
    this._options = _options;
    this._actionWidgetService = _actionWidgetService;
    this._renderDisposables = this._register(new DisposableStore());
    this._state = {
      label: localize(4330, null),
      branches: [],
      status: "empty",
      canOpen: false
    };
    this._isOpen = false;
    this._register(toDisposable(() => {
      if (this._isOpen) {
        this._actionWidgetService.hide(true);
      }
    }));
  }
  _renderIsolation(container2) {
    const isolation = this._options.isolation;
    if (!isolation) {
      return;
    }
    const chip = this._renderDisposables.add(new CheckboxChip({
      label: isolation.label,
      ariaLabel: isolation.ariaLabel,
      onToggle: isolation.onToggle,
      // Kept alongside the shared chip class so existing styling and selectors still match.
      slotClassName: "sessions-chat-isolation-checkbox",
      markTarget: isolation.markTarget
    }));
    this._isolationChip = chip;
    chip.render(container2);
    this._updateIsolation();
  }
  _updateIsolation() {
    this._isolationChip?.update(this._isolationState ?? { checked: false, state: "disabled" });
  }
  render(container2) {
    if (this._isOpen) {
      this._actionWidgetService.hide(true);
    }
    this._renderDisposables.clear();
    const renderTarget = this._options.isolation ? append(container2, $("span.sessions-chat-branch-picker-group")) : container2;
    if (renderTarget !== container2) {
      this._renderDisposables.add({ dispose: () => renderTarget.remove() });
    }
    this._renderIsolation(renderTarget);
    const slot = append(renderTarget, $(".sessions-chat-picker-slot"));
    if (this._options.slotClassName) {
      slot.classList.add(this._options.slotClassName);
    }
    this._slotElement = slot;
    this._renderDisposables.add({ dispose: () => slot.remove() });
    const trigger = append(slot, $("a.action-label"));
    if (this._options.triggerClassName) {
      trigger.classList.add(this._options.triggerClassName);
    }
    trigger.role = "button";
    trigger.setAttribute("aria-haspopup", "listbox");
    trigger.setAttribute("aria-expanded", "false");
    if (this._options.ariaLive) {
      trigger.setAttribute("aria-live", this._options.ariaLive);
    }
    this._triggerElement = trigger;
    const description = append(slot, $("span.branch-picker-description"));
    if (this._options.descriptionClassName) {
      description.classList.add(this._options.descriptionClassName);
    }
    description.id = `branch-picker-description-${++descriptionIdPool}`;
    trigger.setAttribute("aria-describedby", description.id);
    this._descriptionElement = description;
    this._updateTrigger();
    this._renderDisposables.add(Gesture.addTarget(trigger));
    for (const eventType of [EventType.CLICK, EventType2.Tap]) {
      this._renderDisposables.add(addDisposableListener(trigger, eventType, (e4) => {
        EventHelper.stop(e4, true);
        this.showPicker();
      }));
    }
    this._renderDisposables.add(addDisposableListener(trigger, EventType.KEY_DOWN, (e4) => {
      if (e4.key === "Enter" || e4.key === " ") {
        EventHelper.stop(e4, true);
        this.showPicker();
      }
    }));
  }
  update(state) {
    this._state = state;
    this._isolationState = state.isolation;
    this._updateTrigger();
    this._updateIsolation();
    if (this._isOpen) {
      if (!state.canOpen) {
        this._actionWidgetService.hide(true);
      } else {
        this._actionWidgetService.updateItems(this._getItems());
      }
    }
  }
  showPicker(anchor = this._triggerElement) {
    if (!anchor || this._actionWidgetService.isVisible || !this._state.canOpen) {
      return;
    }
    const trigger = this._triggerElement;
    const delegate = {
      onSelect: (item) => {
        this._actionWidgetService.hide();
        if (item.kind === "retry") {
          this._options.onRetry?.();
        } else if (item.name) {
          this._options.onSelectBranch(item.name);
        }
      },
      onHide: () => {
        this._isOpen = false;
        trigger?.setAttribute("aria-expanded", "false");
        if (trigger?.isConnected) {
          trigger.focus();
        }
      }
    };
    this._isOpen = true;
    trigger?.setAttribute("aria-expanded", "true");
    const items = this._getItems();
    const branchCount = items.filter((item) => item.item?.kind === "branch" && !item.item.unavailable).length;
    this._actionWidgetService.show(
      this._options.user,
      false,
      items,
      delegate,
      anchor,
      void 0,
      [],
      {
        getAriaLabel: (item) => {
          const label3 = item.label ?? "";
          return item.item?.unavailable ? localize(4333, null, label3) : label3;
        },
        getWidgetAriaLabel: () => localize(4324, null)
      },
      branchCount > FILTER_THRESHOLD3 ? { showFilter: true, filterPlaceholder: localize(4327, null) } : void 0
    );
  }
  _getItems() {
    switch (this._state.status) {
      case "loading":
        return [{
          kind: "action" /* Action */,
          label: localize(4328, null),
          disabled: true,
          item: { kind: "branch" }
        }];
      case "error":
        return [{
          kind: "action" /* Action */,
          label: localize(4329, null),
          group: { title: "", icon: Codicon.refresh },
          disabled: !this._options.onRetry,
          item: { kind: "retry" }
        }];
      case "empty":
        return [{
          kind: "action" /* Action */,
          label: localize(4326, null),
          disabled: true,
          item: { kind: "branch" }
        }];
      case "ready":
        return this._state.branches.map((branch) => ({
          kind: "action" /* Action */,
          label: branch.name,
          detail: branch.unavailable ? localize(4332, null) : void 0,
          group: { title: "", icon: branch.unavailable ? Codicon.warning : Codicon.gitBranch },
          item: {
            kind: "branch",
            name: branch.name,
            checked: branch.selected || void 0,
            unavailable: branch.unavailable
          }
        }));
    }
  }
  _updateTrigger() {
    if (!this._triggerElement || !this._slotElement || !this._descriptionElement) {
      return;
    }
    clearNode(this._triggerElement);
    const icon2 = append(this._triggerElement, renderIcon(Codicon.gitBranch));
    icon2.setAttribute("aria-hidden", "true");
    const label3 = append(this._triggerElement, $("span.sessions-chat-dropdown-label"));
    if (this._options.labelClassName) {
      label3.classList.add(this._options.labelClassName);
    }
    label3.textContent = this._state.label;
    if (this._state.showChevron !== false) {
      const chevron = append(this._triggerElement, renderIcon(Codicon.chevronDown));
      chevron.setAttribute("aria-hidden", "true");
    }
    const disabled = !this._state.canOpen;
    const renderAsStatic = disabled && this._options.renderDisabledAsStatic === true;
    const reason = this._state.disabledReason;
    this._triggerElement.setAttribute("aria-label", disabled && reason ? localize(4325, null, this._state.label, reason) : localize(4331, null, this._state.label));
    this._triggerElement.setAttribute("aria-disabled", String(disabled));
    this._triggerElement.setAttribute("aria-busy", String(this._state.status === "loading"));
    this._triggerElement.tabIndex = !disabled || this._options.keepDisabledFocusable && !renderAsStatic ? 0 : -1;
    if (renderAsStatic) {
      this._triggerElement.removeAttribute("role");
      this._triggerElement.removeAttribute("aria-haspopup");
      this._triggerElement.removeAttribute("aria-expanded");
    } else {
      this._triggerElement.setAttribute("role", "button");
      this._triggerElement.setAttribute("aria-haspopup", "listbox");
      this._triggerElement.setAttribute("aria-expanded", String(this._isOpen));
    }
    this._triggerElement.title = disabled && reason ? reason : this._state.label;
    this._descriptionElement.textContent = reason ?? "";
    this._slotElement.classList.toggle("disabled", disabled);
    this._triggerElement.classList.toggle("branch-picker-disabled", disabled);
    this._triggerElement.classList.toggle("branch-picker-missing", this._state.missing === true);
  }
};

BranchPicker = __decorateClass([
  __decorateParam(1, IActionWidgetService)
], BranchPicker);
export { FILTER_THRESHOLD3, descriptionIdPool, BranchPicker };
