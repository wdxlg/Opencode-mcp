// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/platform/quickinput/browser/pickerQuickAccess.ts
import { Disposable, DisposableStore, MutableDisposable } from "./module-0012.mjs";
import { CancellationTokenSource } from "./module-0025.mjs";
import { isFunction } from "./module-0010.mjs";
import { timeout } from "./module-0036.mjs";
import { isKeyModified } from "./module-0536.mjs";


// src/vs/platform/quickinput/browser/pickerQuickAccess.ts
function isPicksWithActive(obj) {
  const candidate = obj;
  return Array.isArray(candidate.items);
}

function isFastAndSlowPicks(obj) {
  const candidate = obj;
  return !!candidate.picks && candidate.additionalPicks instanceof Promise;
}

var PickerQuickAccessProvider = class extends Disposable {
  constructor(prefix, options3) {
    super();
    this.prefix = prefix;
    this.options = options3;
  }
  provide(picker, token, runOptions2) {
    const disposables = new DisposableStore();
    picker.canAcceptInBackground = !!this.options?.canAcceptInBackground;
    picker.matchOnLabel = picker.matchOnDescription = picker.matchOnDetail = picker.sortByLabel = false;
    let picksCts = void 0;
    const picksDisposable = disposables.add(new MutableDisposable());
    const updatePickerItems = async () => {
      picksCts?.dispose(true);
      picker.busy = false;
      const picksDisposables = picksDisposable.value = new DisposableStore();
      picksCts = picksDisposables.add(new CancellationTokenSource(token));
      const picksToken = picksCts.token;
      let picksFilter = picker.value.substring(this.prefix.length);
      if (!this.options?.shouldSkipTrimPickFilter) {
        picksFilter = picksFilter.trim();
      }
      const providedPicks = this._getPicks(picksFilter, picksDisposables, picksToken, runOptions2);
      const applyPicks = (picks, skipEmpty) => {
        let items;
        let activeItem = void 0;
        if (isPicksWithActive(picks)) {
          items = picks.items;
          activeItem = picks.active;
        } else {
          items = picks;
        }
        if (items.length === 0) {
          if (skipEmpty) {
            return false;
          }
          if ((picksFilter.length > 0 || picker.hideInput) && this.options?.noResultsPick) {
            if (isFunction(this.options.noResultsPick)) {
              items = [this.options.noResultsPick(picksFilter)];
            } else {
              items = [this.options.noResultsPick];
            }
          }
        }
        picker.items = items;
        if (activeItem) {
          picker.activeItems = [activeItem];
        }
        return true;
      };
      const applyFastAndSlowPicks = async (fastAndSlowPicks) => {
        let fastPicksApplied = false;
        let slowPicksApplied = false;
        await Promise.all([
          // Fast Picks: if `mergeDelay` is configured, in order to reduce
          // amount of flicker, we race against the slow picks over some delay
          // and then set the fast picks.
          // If the slow picks are faster, we reduce the flicker by only
          // setting the items once.
          (async () => {
            if (typeof fastAndSlowPicks.mergeDelay === "number") {
              await timeout(fastAndSlowPicks.mergeDelay);
              if (picksToken.isCancellationRequested) {
                return;
              }
            }
            if (!slowPicksApplied) {
              fastPicksApplied = applyPicks(
                fastAndSlowPicks.picks,
                true
                /* skip over empty to reduce flicker */
              );
            }
          })(),
          // Slow Picks: we await the slow picks and then set them at
          // once together with the fast picks, but only if we actually
          // have additional results.
          (async () => {
            picker.busy = true;
            try {
              const awaitedAdditionalPicks = await fastAndSlowPicks.additionalPicks;
              if (picksToken.isCancellationRequested) {
                return;
              }
              let picks;
              let activePick = void 0;
              if (isPicksWithActive(fastAndSlowPicks.picks)) {
                picks = fastAndSlowPicks.picks.items;
                activePick = fastAndSlowPicks.picks.active;
              } else {
                picks = fastAndSlowPicks.picks;
              }
              let additionalPicks;
              let additionalActivePick = void 0;
              if (isPicksWithActive(awaitedAdditionalPicks)) {
                additionalPicks = awaitedAdditionalPicks.items;
                additionalActivePick = awaitedAdditionalPicks.active;
              } else {
                additionalPicks = awaitedAdditionalPicks;
              }
              if (additionalPicks.length > 0 || !fastPicksApplied) {
                let fallbackActivePick = void 0;
                if (!activePick && !additionalActivePick) {
                  const fallbackActivePickCandidate = picker.activeItems[0];
                  if (fallbackActivePickCandidate && picks.indexOf(fallbackActivePickCandidate) !== -1) {
                    fallbackActivePick = fallbackActivePickCandidate;
                  }
                }
                applyPicks({
                  items: [...picks, ...additionalPicks],
                  active: activePick || additionalActivePick || fallbackActivePick
                });
              }
            } finally {
              if (!picksToken.isCancellationRequested) {
                picker.busy = false;
              }
              slowPicksApplied = true;
            }
          })()
        ]);
      };
      if (providedPicks === null) {
      } else if (isFastAndSlowPicks(providedPicks)) {
        await applyFastAndSlowPicks(providedPicks);
      } else if (!(providedPicks instanceof Promise)) {
        applyPicks(providedPicks);
      } else {
        picker.busy = true;
        try {
          const awaitedPicks = await providedPicks;
          if (picksToken.isCancellationRequested) {
            return;
          }
          if (isFastAndSlowPicks(awaitedPicks)) {
            await applyFastAndSlowPicks(awaitedPicks);
          } else {
            applyPicks(awaitedPicks);
          }
        } finally {
          if (!picksToken.isCancellationRequested) {
            picker.busy = false;
          }
        }
      }
    };
    disposables.add(picker.onDidChangeValue(() => updatePickerItems()));
    updatePickerItems();
    disposables.add(picker.onDidAccept((event) => {
      if (runOptions2?.handleAccept) {
        if (!event.inBackground) {
          picker.hide();
        }
        runOptions2.handleAccept?.(picker.activeItems[0], event.inBackground);
        return;
      }
      const [item] = picker.selectedItems;
      if (typeof item?.accept === "function") {
        const isAttachAction = isKeyModified(picker.keyMods) && !!item.attach;
        if (isAttachAction) {
          item.attach(picker.keyMods, event);
          return;
        }
        if (!event.inBackground) {
          picker.hide();
        }
        item.accept(picker.keyMods, event);
      }
    }));
    const buttonTrigger = async (button, item) => {
      if (typeof item.trigger !== "function") {
        return;
      }
      const buttonIndex = item.buttons?.indexOf(button) ?? -1;
      if (buttonIndex >= 0) {
        const result = item.trigger(buttonIndex, picker.keyMods);
        const action = typeof result === "number" ? result : await result;
        if (token.isCancellationRequested) {
          return;
        }
        switch (action) {
          case 0 /* NO_ACTION */:
            break;
          case 1 /* CLOSE_PICKER */:
            picker.hide();
            break;
          case 2 /* REFRESH_PICKER */:
            updatePickerItems();
            break;
          case 3 /* REMOVE_ITEM */: {
            const index2 = picker.items.indexOf(item);
            if (index2 !== -1) {
              const items = picker.items.slice();
              const removed = items.splice(index2, 1);
              const activeItems = picker.activeItems.filter((activeItem) => activeItem !== removed[0]);
              const keepScrollPositionBefore = picker.keepScrollPosition;
              picker.keepScrollPosition = true;
              picker.items = items;
              if (activeItems) {
                picker.activeItems = activeItems;
              }
              picker.keepScrollPosition = keepScrollPositionBefore;
            }
            break;
          }
        }
      }
    };
    disposables.add(picker.onDidTriggerItemButton(({ button, item }) => buttonTrigger(button, item)));
    disposables.add(picker.onDidTriggerSeparatorButton(({ button, separator: separator2 }) => buttonTrigger(button, separator2)));
    return disposables;
  }
};
export { isPicksWithActive, isFastAndSlowPicks, PickerQuickAccessProvider };
