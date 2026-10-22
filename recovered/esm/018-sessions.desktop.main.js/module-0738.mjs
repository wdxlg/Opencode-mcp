// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/browser/services/inlineCompletionsService.ts
import { createDecorator } from "./module-0077.mjs";
import { ContextKeyExpr, IContextKeyService, RawContextKey } from "./module-0089.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { Disposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { TimeoutTimer } from "./module-0036.mjs";
import { BugIndicatingError } from "./module-0004.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { registerSingleton } from "./module-0135.mjs";
import { Action2 } from "./module-0092.mjs";
import { IQuickInputService } from "./module-0536.mjs";
import { IStorageService } from "./module-0512.mjs";


// src/vs/editor/browser/services/inlineCompletionsService.ts
var IInlineCompletionsService = createDecorator("IInlineCompletionsService");

var InlineCompletionsSnoozing = new RawContextKey("inlineCompletions.snoozed", false, localize(192, null));

var InlineCompletionsService = class extends Disposable {
  constructor(_contextKeyService, _telemetryService) {
    super();
    this._contextKeyService = _contextKeyService;
    this._telemetryService = _telemetryService;
    this._onDidChangeIsSnoozing = this._register(new Emitter());
    this.onDidChangeIsSnoozing = this._onDidChangeIsSnoozing.event;
    // 5 minutes
    this._snoozeTimeEnd = void 0;
    this._recentCompletionIds = [];
    this._timer = this._register(new TimeoutTimer());
    const inlineCompletionsSnoozing = InlineCompletionsSnoozing.bindTo(this._contextKeyService);
    this._register(this.onDidChangeIsSnoozing(() => inlineCompletionsSnoozing.set(this.isSnoozing())));
  }
  static {
    this.SNOOZE_DURATION = 3e5;
  }
  get snoozeTimeLeft() {
    if (this._snoozeTimeEnd === void 0) {
      return 0;
    }
    return Math.max(0, this._snoozeTimeEnd - Date.now());
  }
  snooze(durationMs = InlineCompletionsService.SNOOZE_DURATION) {
    this.setSnoozeDuration(durationMs + this.snoozeTimeLeft);
  }
  setSnoozeDuration(durationMs) {
    if (durationMs < 0) {
      throw new BugIndicatingError(`Invalid snooze duration: ${durationMs}. Duration must be non-negative.`);
    }
    if (durationMs === 0) {
      this.cancelSnooze();
      return;
    }
    const wasSnoozing = this.isSnoozing();
    const timeLeft = this.snoozeTimeLeft;
    this._snoozeTimeEnd = Date.now() + durationMs;
    if (!wasSnoozing) {
      this._onDidChangeIsSnoozing.fire(true);
    }
    this._timer.cancelAndSet(
      () => {
        if (!this.isSnoozing()) {
          this._onDidChangeIsSnoozing.fire(false);
        } else {
          throw new BugIndicatingError("Snooze timer did not fire as expected");
        }
      },
      this.snoozeTimeLeft + 1
    );
    this._reportSnooze(durationMs - timeLeft, durationMs);
  }
  isSnoozing() {
    return this.snoozeTimeLeft > 0;
  }
  cancelSnooze() {
    if (this.isSnoozing()) {
      this._reportSnooze(-this.snoozeTimeLeft, 0);
      this._snoozeTimeEnd = void 0;
      this._timer.cancel();
      this._onDidChangeIsSnoozing.fire(false);
    }
  }
  reportNewCompletion(requestUuid) {
    this._lastCompletionId = requestUuid;
    this._recentCompletionIds.unshift(requestUuid);
    if (this._recentCompletionIds.length > 5) {
      this._recentCompletionIds.pop();
    }
  }
  _reportSnooze(deltaMs, totalMs) {
    const deltaSeconds = Math.round(deltaMs / 1e3);
    const totalSeconds = Math.round(totalMs / 1e3);
    this._telemetryService.publicLog2("inlineCompletions.snooze", {
      deltaSeconds,
      totalSeconds,
      lastCompletionId: this._lastCompletionId,
      recentCompletionIds: this._recentCompletionIds
    });
  }
};

InlineCompletionsService = __decorateClass([
  __decorateParam(0, IContextKeyService),
  __decorateParam(1, ITelemetryService)
], InlineCompletionsService);

registerSingleton(IInlineCompletionsService, InlineCompletionsService, 1 /* Delayed */);

var snoozeInlineSuggestId = "editor.action.inlineSuggest.snooze";

var cancelSnoozeInlineSuggestId = "editor.action.inlineSuggest.cancelSnooze";

var LAST_SNOOZE_DURATION_KEY = "inlineCompletions.lastSnoozeDuration";

var SnoozeInlineCompletion = class _SnoozeInlineCompletion extends Action2 {
  static {
    this.ID = snoozeInlineSuggestId;
  }
  constructor() {
    super({
      id: _SnoozeInlineCompletion.ID,
      title: localize2(191, "Snooze Inline Suggestions"),
      precondition: ContextKeyExpr.true(),
      f1: true
    });
  }
  async run(accessor, ...args2) {
    const quickInputService = accessor.get(IQuickInputService);
    const inlineCompletionsService = accessor.get(IInlineCompletionsService);
    const storageService = accessor.get(IStorageService);
    let durationMs;
    if (args2.length > 0 && typeof args2[0] === "number") {
      durationMs = args2[0] * 6e4;
    }
    if (!durationMs) {
      durationMs = await this.getDurationFromUser(quickInputService, storageService);
    }
    if (durationMs) {
      inlineCompletionsService.setSnoozeDuration(durationMs);
    }
  }
  async getDurationFromUser(quickInputService, storageService) {
    const lastSelectedDuration = storageService.getNumber(LAST_SNOOZE_DURATION_KEY, 0 /* PROFILE */, 3e5);
    const predefinedItems = [
      { label: localize(195, null), id: "1", value: 6e4 },
      { label: localize(197, null), id: "5", value: 3e5 },
      { label: localize(193, null), id: "10", value: 6e5 },
      { label: localize(194, null), id: "15", value: 9e5 },
      { label: localize(196, null), id: "30", value: 18e5 },
      { label: localize(198, null), id: "60", value: 36e5 }
    ];
    let items = predefinedItems;
    if (lastSelectedDuration > 0 && !predefinedItems.some((item) => item.value === lastSelectedDuration)) {
      const minutes = lastSelectedDuration / 6e4;
      const customItem = {
        label: localize(203, null, minutes),
        id: "last-custom",
        value: lastSelectedDuration,
        description: localize(204, null)
      };
      const index2 = predefinedItems.findIndex((item) => item.value > lastSelectedDuration);
      if (index2 === -1) {
        items = [...predefinedItems, customItem];
      } else {
        items = [...predefinedItems.slice(0, index2), customItem, ...predefinedItems.slice(index2)];
      }
    }
    items.push({ label: localize(199, null), id: "custom", value: -1 });
    const picked = await quickInputService.pick(items, {
      placeHolder: localize(205, null),
      activeItem: items.find((item) => item.value === lastSelectedDuration)
    });
    if (picked) {
      if (picked.id === "custom") {
        return this.getCustomDurationFromUser(quickInputService, storageService);
      }
      storageService.store(LAST_SNOOZE_DURATION_KEY, picked.value, 0 /* PROFILE */, 0 /* USER */);
      return picked.value;
    }
    return void 0;
  }
  async getCustomDurationFromUser(quickInputService, storageService) {
    const customMinutes = await quickInputService.input({
      placeHolder: localize(200, null),
      prompt: localize(201, null),
      validateInput: async (value2) => {
        const n2 = Number(value2);
        if (isNaN(n2) || n2 <= 0 || !Number.isFinite(n2)) {
          return localize(202, null);
        }
        return void 0;
      }
    });
    if (customMinutes) {
      const ms = Number(customMinutes) * 6e4;
      storageService.store(LAST_SNOOZE_DURATION_KEY, ms, 0 /* PROFILE */, 0 /* USER */);
      return ms;
    }
    return void 0;
  }
};

var CancelSnoozeInlineCompletion = class _CancelSnoozeInlineCompletion extends Action2 {
  static {
    this.ID = cancelSnoozeInlineSuggestId;
  }
  constructor() {
    super({
      id: _CancelSnoozeInlineCompletion.ID,
      title: localize2(190, "Cancel Snooze Inline Suggestions"),
      precondition: InlineCompletionsSnoozing,
      f1: true
    });
  }
  async run(accessor) {
    accessor.get(IInlineCompletionsService).cancelSnooze();
  }
};
export { IInlineCompletionsService, InlineCompletionsSnoozing, InlineCompletionsService, snoozeInlineSuggestId, cancelSnoozeInlineSuggestId, LAST_SNOOZE_DURATION_KEY, SnoozeInlineCompletion, CancelSnoozeInlineCompletion };
