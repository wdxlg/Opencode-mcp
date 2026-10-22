// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/widget/input/chatInputNoticeHost.ts
import { Disposable, DisposableMap, DisposableStore, toDisposable } from "./module-0012.mjs";
import { getActiveWindow, isAncestorOfActiveElement, trackFocus } from "./module-0075.mjs";


// src/vs/workbench/contrib/chat/browser/widget/input/chatInputNoticeHost.ts
var LANE_COUNT = 3;

function trackChatInputRecency(surface) {
  const store = new DisposableStore();
  const focusTracker = store.add(trackFocus(surface.focusRoot));
  store.add(focusTracker.onDidFocus(() => surface.lastFocused = Date.now()));
  return store;
}

function pickActiveChatInput(surfaces, isEligible) {
  const activeDocument = getActiveWindow().document;
  let mostRecent;
  for (const surface of surfaces) {
    const focusRoot = surface.focusRoot;
    if (focusRoot.ownerDocument !== activeDocument || !focusRoot.isConnected || focusRoot.getClientRects().length === 0) {
      continue;
    }
    if (isEligible && !isEligible(surface)) {
      continue;
    }
    if (isAncestorOfActiveElement(focusRoot)) {
      return surface;
    }
    if (!mostRecent || surface.lastFocused > mostRecent.lastFocused) {
      mostRecent = surface;
    }
  }
  return mostRecent;
}

var ChatInputNoticeHost = class extends Disposable {
  constructor(_focusInput) {
    super();
    this._focusInput = _focusInput;
    this._claims = Array.from({ length: LANE_COUNT }, () => []);
    this._leases = this._register(new DisposableMap());
    this._notifying = false;
    this._isDisposed = false;
    /** Identifies the current `setOccupied` call, so stale leases are not stored. */
    this._leaseToken = 0;
  }
  /**
   * Claim `lane` until the returned disposable is disposed. Claims are counted,
   * so producers sharing a lane do not release each other.
   */
  occupy(lane, options3) {
    if (this._isDisposed) {
      return Disposable.None;
    }
    const claim = options3 ?? {};
    this._claims[lane].push(claim);
    this._notifyLeading();
    let released = false;
    return toDisposable(() => {
      if (released) {
        return;
      }
      released = true;
      const claims = this._claims[lane];
      const index2 = claims.indexOf(claim);
      if (index2 !== -1) {
        claims.splice(index2, 1);
      }
      this._notifyLeading();
    });
  }
  /** Claim or release `lane` on behalf of a producer that reports visibility. */
  setOccupied(lane, occupied, focusTarget) {
    const token = ++this._leaseToken;
    if (!occupied) {
      this._leases.deleteAndLeak(lane)?.dispose();
      return;
    }
    const lease = this.occupy(lane, { focusTarget });
    if (this._isDisposed || this._leaseToken !== token) {
      lease.dispose();
      return;
    }
    this._leases.set(lane, lease);
  }
  /**
   * Moves focus into the notice currently showing, or back to the input when it
   * already has focus. Returns false when there is nothing to focus.
   */
  toggleFocus() {
    if (!this.hasFocusableNotice()) {
      return false;
    }
    const focusTarget = this._leadingClaim.focusTarget;
    if (focusTarget.hasFocus()) {
      this._focusInput();
    } else {
      focusTarget.focus();
    }
    return true;
  }
  /**
   * Whether focus can actually be moved into the notice leading here, so a
   * caller choosing between hosts never settles on one that would do nothing.
   * Only the leading claim counts, so focus can never land on a notice that
   * something else has put away.
   */
  hasFocusableNotice() {
    const focusTarget = this._leadingClaim?.focusTarget;
    return !!focusTarget && (focusTarget.canFocus?.() ?? true);
  }
  /**
   * Brings the announced leader in line with the claims actually held.
   *
   * Standing down is a real side effect - it moves focus and hides DOM - so a
   * callback can change who owns the space while this is still running. State
   * is therefore re-read after every single notification rather than captured
   * up front, so a leader that has since been replaced is never announced.
   */
  _notifyLeading() {
    if (this._notifying) {
      return;
    }
    this._notifying = true;
    try {
      while (!this._isDisposed) {
        const lane = this._claims.findIndex((claims) => claims.length > 0);
        const leading = lane === -1 ? void 0 : this._claims[lane].at(-1);
        if (leading === this._leadingClaim) {
          return;
        }
        if (this._leadingClaim) {
          const previous = this._leadingClaim;
          this._leadingClaim = void 0;
          this._standDown(previous);
        } else {
          this._leadingClaim = leading;
          leading?.onDidChangeLeading?.(true);
        }
      }
    } finally {
      this._notifying = false;
    }
  }
  /**
   * Tells `claim` it is no longer the notice on screen, and keeps keyboard focus
   * out of the void.
   *
   * Standing down is not the producer's decision - the space is being taken for
   * something else - so a producer that had focus is about to hide content that
   * holds it. Leaving focus on `<body>` would also drop the context keys the chat
   * keybindings depend on, so it returns to the input here rather than in every
   * producer that can be displaced. The incoming notice is announced, not focused,
   * so the input is always the right destination.
   */
  _standDown(claim) {
    const hadFocus = claim.focusTarget?.hasFocus() ?? false;
    claim.onDidChangeLeading?.(false);
    if (hadFocus && !this._isDisposed) {
      this._focusInput();
    }
  }
  dispose() {
    this._isDisposed = true;
    const leading = this._leadingClaim;
    this._leadingClaim = void 0;
    for (const claims of this._claims) {
      claims.length = 0;
    }
    leading?.onDidChangeLeading?.(false);
    super.dispose();
  }
};
export { trackChatInputRecency, pickActiveChatInput, LANE_COUNT, ChatInputNoticeHost };
