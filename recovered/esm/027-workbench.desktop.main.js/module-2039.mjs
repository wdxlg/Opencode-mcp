// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/widget/input/chatInputOnboarding.ts
import { Disposable, DisposableStore, MutableDisposable, toDisposable } from "./module-0012.mjs";
import { pickActiveChatInput, trackChatInputRecency } from "./module-1468.mjs";
import { setChatInputStackSlot } from "./module-2038.mjs";
import { onUnexpectedError } from "./module-0004.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IStorageService } from "./module-0512.mjs";


// src/vs/workbench/contrib/chat/browser/widget/input/chatInputOnboarding.ts
var ChatInputOnboarding = class extends Disposable {
  constructor(options3, storageService) {
    super();
    this.options = options3;
    this.storageService = storageService;
    this.hosts = /* @__PURE__ */ new Set();
    /** The built card, kept alive while standing down so its state survives. */
    this.currentOnboarding = this._register(new MutableDisposable());
    this.leading = false;
    /** Identifies the current request, so claims left on other inputs are ignored. */
    this.generation = 0;
    this._register(toDisposable(() => {
      const claim = this.claim;
      this.claim = void 0;
      claim?.dispose();
    }));
  }
  /** Whether a card is built and on screen. */
  get isVisible() {
    return !!this.currentOnboarding.value && this.leading;
  }
  registerHost(options3) {
    const host = { ...options3, lastFocused: 0 };
    this.hosts.add(host);
    const store = new DisposableStore();
    store.add(trackChatInputRecency(host));
    store.add(toDisposable(() => {
      this.hosts.delete(host);
      if (this.activeHost === host) {
        this.hide(false);
      }
    }));
    return store;
  }
  /**
   * Show the card the first time the feature is used. Nothing is built until
   * the space is actually available, so a card never spends its one showing -
   * or reports itself shown - somewhere the user would not have seen it.
   */
  showIfNeeded(createOnboarding) {
    if (this.wanted) {
      return true;
    }
    if (this.storageService.getBoolean(this.options.storageKey, -1 /* APPLICATION */, false)) {
      return false;
    }
    return this.request(createOnboarding);
  }
  /** Show the card again regardless of whether it has already been seen. */
  show(createOnboarding) {
    return this.request(createOnboarding);
  }
  request(createOnboarding) {
    const host = this.getActiveHost();
    if (!host) {
      return false;
    }
    const previousClaim = this.claim;
    this.claim = void 0;
    this.hideCard(false);
    const generation = ++this.generation;
    this.activeHost = host;
    this.wanted = createOnboarding;
    if (!host.claimNotice) {
      previousClaim?.dispose();
      this.setLeading(true);
      return true;
    }
    const claim = host.claimNotice({
      focusTarget: {
        hasFocus: () => this.activeBanner?.hasFocus() ?? false,
        focus: () => this.activeBanner?.focus(),
        // The claim is held from here on, but the card is only built once it
        // leads - so until then there is nothing for focus to land on.
        canFocus: () => !!this.activeBanner
      },
      // Scoped to this request: the card can move to another input, and the
      // claim left behind on the old one still reports standing down when it
      // is released. Acting on that would put the new card away.
      onDidChangeLeading: (leading) => {
        if (this.generation === generation) {
          this.setLeading(leading);
        }
      }
    });
    if (this.wanted === createOnboarding) {
      this.claim = claim;
    } else {
      claim.dispose();
    }
    previousClaim?.dispose();
    return true;
  }
  setLeading(leading) {
    if (this.leading === leading || !this.wanted) {
      return;
    }
    this.leading = leading;
    if (leading) {
      this.build();
    } else {
      this.standDown();
    }
  }
  /** Put the card away for whatever now owns the space, without losing it. */
  standDown() {
    const host = this.activeHost;
    if (!host || !this.currentOnboarding.value) {
      return;
    }
    this.activeBanner?.setVisible?.(false);
    setChatInputStackSlot(host.container, 0 /* Empty */);
  }
  build() {
    const host = this.activeHost;
    const createOnboarding = this.wanted;
    if (!host || !createOnboarding) {
      return;
    }
    if (this.currentOnboarding.value) {
      setChatInputStackSlot(host.container, 2 /* Standalone */);
      this.activeBanner?.setVisible?.(true);
      return;
    }
    const onboardingStore = new DisposableStore();
    let banner;
    try {
      banner = createOnboarding({
        container: host.container,
        dismiss: (restoreFocus = true) => this.hide(restoreFocus)
      });
      onboardingStore.add(banner);
    } catch (error) {
      onboardingStore.dispose();
      this.hide(false);
      onUnexpectedError(error);
      return;
    }
    if (this.activeHost !== host || this.wanted !== createOnboarding || !this.leading) {
      onboardingStore.dispose();
      return;
    }
    this.currentOnboarding.value = onboardingStore;
    this.activeBanner = banner;
    setChatInputStackSlot(host.container, 2 /* Standalone */);
    this.storageService.store(this.options.storageKey, true, -1 /* APPLICATION */, 0 /* USER */);
    banner.announce();
  }
  getActiveHost() {
    return pickActiveChatInput(this.hosts, (host) => host.container.isConnected);
  }
  hide(restoreFocus) {
    const claim = this.claim;
    this.claim = void 0;
    this.hideCard(restoreFocus);
    claim?.dispose();
  }
  /** Take the card down without giving up the space it stands on. */
  hideCard(restoreFocus) {
    const host = this.activeHost;
    const wasVisible = this.isVisible;
    this.activeHost = void 0;
    this.activeBanner = void 0;
    this.wanted = void 0;
    this.leading = false;
    this.currentOnboarding.clear();
    if (host) {
      setChatInputStackSlot(host.container, 0 /* Empty */);
    }
    if (wasVisible && restoreFocus) {
      host?.focus?.();
    }
  }
};

ChatInputOnboarding = __decorateClass([
  __decorateParam(1, IStorageService)
], ChatInputOnboarding);
export { ChatInputOnboarding };
