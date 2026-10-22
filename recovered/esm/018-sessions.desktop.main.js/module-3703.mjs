// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/chat/browser/checkboxChip.ts
import { Disposable, DisposableStore, toDisposable } from "./module-0012.mjs";
import { $, EventHelper, EventType, addDisposableListener, append } from "./module-0075.mjs";
import { Checkbox } from "./module-0549.mjs";
import { defaultCheckboxStyles } from "./module-0513.mjs";
import { EventType2, Gesture } from "./module-0251.mjs";


// src/vs/sessions/contrib/chat/browser/checkboxChip.ts
var CheckboxChip = class extends Disposable {
  constructor(_options) {
    super();
    this._options = _options;
    this._renderDisposables = this._register(new DisposableStore());
    this._state = { checked: false, state: "disabled" };
  }
  /** The rendered slot, or `undefined` before the first {@link render}. */
  get element() {
    return this._slot;
  }
  render(container2) {
    this._renderDisposables.clear();
    const slot = append(container2, $(".sessions-chat-picker-slot.sessions-chat-checkbox-chip"));
    if (this._options.slotClassName) {
      slot.classList.add(this._options.slotClassName);
    }
    this._slot = slot;
    this._renderDisposables.add(toDisposable(() => {
      slot.remove();
      if (this._slot === slot) {
        this._slot = void 0;
      }
    }));
    if (this._options.markTarget) {
      this._renderDisposables.add(this._options.markTarget(slot));
    }
    const row = append(slot, $(".action-label"));
    row.setAttribute("aria-label", this._options.ariaLabel);
    this._row = row;
    const checkbox = this._renderDisposables.add(new Checkbox(this._options.label, this._state.checked, { ...defaultCheckboxStyles, size: 14 }));
    this._checkbox = checkbox;
    append(row, checkbox.domNode);
    const label3 = append(row, $("span.sessions-chat-dropdown-label"));
    label3.textContent = this._options.label;
    this._renderDisposables.add(checkbox.onChange(() => this._options.onToggle(checkbox.checked)));
    this._renderDisposables.add(Gesture.addTarget(row));
    for (const eventType of [EventType.CLICK, EventType2.Tap]) {
      this._renderDisposables.add(addDisposableListener(row, eventType, (e4) => {
        if (!checkbox.enabled) {
          return;
        }
        EventHelper.stop(e4, true);
        checkbox.checked = !checkbox.checked;
        this._options.onToggle(checkbox.checked);
      }));
    }
    this._apply();
    return slot;
  }
  update(state) {
    this._state = state;
    this._apply();
  }
  _apply() {
    const checkbox = this._checkbox;
    const slot = this._slot;
    if (!checkbox || !slot) {
      return;
    }
    const { checked, state, disabledReason } = this._state;
    checkbox.checked = checked;
    if (state === "enabled") {
      checkbox.enable();
    } else {
      checkbox.disable();
      checkbox.domNode.tabIndex = 0;
    }
    slot.classList.toggle("disabled", state === "disabled");
    slot.classList.toggle("hidden", state === "hidden");
    if (this._row) {
      if (state === "disabled" && disabledReason) {
        this._row.title = disabledReason;
      } else {
        this._row.removeAttribute("title");
      }
    }
  }
};
export { CheckboxChip };
