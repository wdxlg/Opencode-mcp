// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/browser/parts/mobile/mobileSessionFilterChips.ts
import { $, EventType, addDisposableListener, append, clearNode } from "./module-0075.mjs";
import { Disposable, DisposableStore } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { localize } from "./module-0001.mjs";
import { EventType2, Gesture } from "./module-0251.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { Codicon } from "./module-0085.mjs";


// src/vs/sessions/browser/parts/mobile/mobileSessionFilterChips.ts
var $113 = $;

var MobileSessionFilterChips = class _MobileSessionFilterChips extends Disposable {
  constructor(parent, host) {
    super();
    this.host = host;
    this.chipElements = /* @__PURE__ */ new Map();
    this.chipDisposables = this._register(new DisposableStore());
    this._onDidRequestSortGroup = this._register(new Emitter());
    /**
     * Fired when the user taps the "Sort" chip. The argument is
     * the chip's DOM element so the host can anchor a sheet/menu to it.
     */
    this.onDidRequestSortGroup = this._onDidRequestSortGroup.event;
    this._onDidRequestFind = this._register(new Emitter());
    /**
     * Fired when the user taps the "Find" chip. The host should open the
     * sessions find widget.
     */
    this.onDidRequestFind = this._onDidRequestFind.event;
    this.container = append(parent, $113(".mobile-session-filter-chips"));
    this.container.setAttribute("role", "toolbar");
    this.container.setAttribute("aria-label", localize(3824, null));
    this.scrollContainer = append(this.container, $113(".mobile-session-filter-chips-scroll"));
    this.renderChips();
    this._register(this.host.onDidUpdate(() => this.syncActiveStates()));
  }
  static {
    this.CHIP_DEFS = [
      {
        label: localize(3821, null),
        statuses: [3 /* Completed */]
      },
      {
        label: localize(3823, null),
        statuses: [1 /* InProgress */, 2 /* NeedsInput */]
      },
      {
        label: localize(3822, null),
        statuses: [4 /* Error */]
      }
    ];
  }
  renderChips() {
    this.chipDisposables.clear();
    this.chipElements.clear();
    clearNode(this.scrollContainer);
    for (const child of Array.from(this.container.children)) {
      if (child !== this.scrollContainer) {
        child.remove();
      }
    }
    for (const def2 of _MobileSessionFilterChips.CHIP_DEFS) {
      this.createStatusChip(def2);
    }
    this.createSortGroupChip();
    this.createFindChip();
    this.syncActiveStates();
  }
  createStatusChip(def2) {
    const chip = append(this.scrollContainer, $113(".mobile-session-filter-chip"));
    chip.setAttribute("role", "button");
    chip.setAttribute("tabindex", "0");
    chip.setAttribute("aria-pressed", "false");
    const label3 = append(chip, $113("span.chip-label"));
    label3.textContent = def2.label;
    this.chipElements.set(def2.label, chip);
    this.chipDisposables.add(Gesture.addTarget(chip));
    this.chipDisposables.add(addDisposableListener(chip, EventType.CLICK, (e4) => {
      e4.preventDefault();
      this.toggleStatusChip(def2);
    }));
    this.chipDisposables.add(addDisposableListener(chip, EventType2.Tap, () => {
      this.toggleStatusChip(def2);
    }));
    this.chipDisposables.add(addDisposableListener(chip, EventType.KEY_DOWN, (e4) => {
      if (e4.key === "Enter" || e4.key === " ") {
        e4.preventDefault();
        this.toggleStatusChip(def2);
      }
    }));
  }
  createSortGroupChip() {
    const chip = append(this.scrollContainer, $113(".mobile-session-filter-chip.mobile-session-filter-chip-action"));
    chip.setAttribute("role", "button");
    chip.setAttribute("tabindex", "0");
    chip.setAttribute("aria-label", localize(3827, null));
    const icon2 = append(chip, $113("span.chip-icon"));
    icon2.classList.add(...ThemeIcon.asClassNameArray(Codicon.listFilter));
    const label3 = append(chip, $113("span.chip-label"));
    label3.textContent = localize(3826, null);
    const fire = () => this._onDidRequestSortGroup.fire(chip);
    this.chipDisposables.add(Gesture.addTarget(chip));
    this.chipDisposables.add(addDisposableListener(chip, EventType.CLICK, (e4) => {
      e4.preventDefault();
      fire();
    }));
    this.chipDisposables.add(addDisposableListener(chip, EventType2.Tap, () => {
      fire();
    }));
    this.chipDisposables.add(addDisposableListener(chip, EventType.KEY_DOWN, (e4) => {
      if (e4.key === "Enter" || e4.key === " ") {
        e4.preventDefault();
        fire();
      }
    }));
  }
  createFindChip() {
    const chip = append(this.container, $113(".mobile-session-filter-chip.mobile-session-filter-chip-action.icon-only"));
    chip.setAttribute("role", "button");
    chip.setAttribute("tabindex", "0");
    chip.setAttribute("aria-label", localize(3825, null));
    const icon2 = append(chip, $113("span.chip-icon"));
    icon2.classList.add(...ThemeIcon.asClassNameArray(Codicon.search));
    const fire = () => this._onDidRequestFind.fire();
    this.chipDisposables.add(Gesture.addTarget(chip));
    this.chipDisposables.add(addDisposableListener(chip, EventType.CLICK, (e4) => {
      e4.preventDefault();
      fire();
    }));
    this.chipDisposables.add(addDisposableListener(chip, EventType2.Tap, () => {
      fire();
    }));
    this.chipDisposables.add(addDisposableListener(chip, EventType.KEY_DOWN, (e4) => {
      if (e4.key === "Enter" || e4.key === " ") {
        e4.preventDefault();
        fire();
      }
    }));
  }
  /**
   * Toggle a status filter chip. The chip applies an _inclusive_ filter:
   *
   * - When a chip is activated, only sessions matching the chip's statuses
   *   are shown (all other statuses become excluded).
   * - Tapping the same chip again deactivates it, restoring the default
   *   (no status exclusions).
   * - When multiple chips are active, sessions matching ANY active chip
   *   are shown.
   */
  toggleStatusChip(def2) {
    const isCurrentlyActive = this.isChipActive(def2);
    if (isCurrentlyActive) {
      for (const chipDef of _MobileSessionFilterChips.CHIP_DEFS) {
        for (const status2 of chipDef.statuses) {
          this.host.setStatusExcluded(status2, false);
        }
      }
    } else {
      const willBeActive = /* @__PURE__ */ new Set();
      willBeActive.add(def2);
      for (const otherDef of _MobileSessionFilterChips.CHIP_DEFS) {
        if (otherDef !== def2 && this.isChipActive(otherDef)) {
          willBeActive.add(otherDef);
        }
      }
      const includedStatuses = /* @__PURE__ */ new Set();
      for (const activeDef of willBeActive) {
        for (const status2 of activeDef.statuses) {
          includedStatuses.add(status2);
        }
      }
      for (const chipDef of _MobileSessionFilterChips.CHIP_DEFS) {
        for (const status2 of chipDef.statuses) {
          this.host.setStatusExcluded(status2, !includedStatuses.has(status2));
        }
      }
    }
    this.syncActiveStates();
  }
  /**
   * A chip is considered "active" when ALL of its statuses are NOT excluded
   * AND at least one other status IS excluded (meaning the user is
   * filtering).
   */
  isChipActive(def2) {
    const allStatuses = _MobileSessionFilterChips.CHIP_DEFS.flatMap((d) => [...d.statuses]);
    const hasAnyExclusion = allStatuses.some((s) => this.host.isStatusExcluded(s));
    if (!hasAnyExclusion) {
      return false;
    }
    return def2.statuses.every((s) => !this.host.isStatusExcluded(s));
  }
  syncActiveStates() {
    for (const def2 of _MobileSessionFilterChips.CHIP_DEFS) {
      const chip = this.chipElements.get(def2.label);
      if (chip) {
        const active = this.isChipActive(def2);
        chip.classList.toggle("active", active);
        chip.setAttribute("aria-pressed", String(active));
      }
    }
  }
  get element() {
    return this.container;
  }
};
export { $113, MobileSessionFilterChips };
