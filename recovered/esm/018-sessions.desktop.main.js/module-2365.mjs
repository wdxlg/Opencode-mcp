// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/widget/input/chatInputTipPresenter.ts
import { Disposable, DisposableStore, MutableDisposable, toDisposable } from "./module-0012.mjs";
import { setChatInputStackSlot } from "./module-2033.mjs";
import { ChatContentMarkdownRenderer } from "./module-2117.mjs";
import { ChatTipContentPart } from "./module-2364.mjs";
import { clearNode } from "./module-0075.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { IChatTipService } from "./module-2363.mjs";


// src/vs/workbench/contrib/chat/browser/widget/input/chatInputTipPresenter.ts
var ChatInputTipPresenter = class extends Disposable {
  constructor(_options, _noticeHost, _instantiationService, _contextKeyService, _chatTipService) {
    super();
    this._options = _options;
    this._noticeHost = _noticeHost;
    this._instantiationService = _instantiationService;
    this._contextKeyService = _contextKeyService;
    this._chatTipService = _chatTipService;
    this._part = this._register(new MutableDisposable());
    this._lease = this._register(new MutableDisposable());
    this._leading = false;
    this._register(toDisposable(() => this._clearContent()));
    this.update();
  }
  /** The rendered tip, when one is showing. */
  get current() {
    return this._partRef;
  }
  /**
   * Re-evaluate whether this surface wants a tip at all. Claiming the tip lane is
   * all this does: whether the tip is actually on screen is the notice host's
   * answer, delivered through `onDidChangeLeading`, so the tip yields to a higher
   * lane and comes back once that content goes away without polling for it.
   */
  update() {
    this._options.onBeforeUpdate?.();
    if (!this._options.isEligible()) {
      this.clear();
      return;
    }
    if (!this._lease.value) {
      this._lease.value = this._noticeHost.occupy(2 /* Tip */, {
        focusTarget: {
          hasFocus: () => this._partRef?.hasFocus() ?? false,
          focus: () => this._partRef?.focus(),
          // The lane is claimed while this surface wants a tip, but there is
          // only something to focus once one is actually rendered.
          canFocus: () => !!this._partRef
        },
        onDidChangeLeading: (leading) => this._setLeading(leading)
      });
    } else if (this._leading) {
      this._render();
    }
  }
  _setLeading(leading) {
    this._leading = leading;
    if (leading) {
      this._render();
    } else {
      this._clearContent();
    }
  }
  /**
   * Build the tip that should be showing. Never touches the claim, so rendering
   * cannot feed back into the arbitration that asked for it.
   */
  _render() {
    const tip = this._chatTipService.getWelcomeTip(this._contextKeyService);
    if (!tip) {
      this._clearContent();
      return;
    }
    if (this._part.value) {
      setChatInputStackSlot(this._options.container, 1 /* Docked */);
      return;
    }
    const store = new DisposableStore();
    const renderer = this._instantiationService.createInstance(ChatContentMarkdownRenderer);
    const tipPart = store.add(this._instantiationService.createInstance(ChatTipContentPart, tip, renderer));
    store.add(tipPart.onDidHide(() => {
      this.clear();
      this._options.focusInput();
    }));
    this._part.value = store;
    this._partRef = tipPart;
    clearNode(this._options.container);
    this._options.container.appendChild(tipPart.domNode);
    setChatInputStackSlot(this._options.container, 1 /* Docked */);
  }
  /** Take the tip off screen and give up the lane. */
  clear() {
    this._leading = false;
    this._lease.clear();
    this._clearContent();
  }
  _clearContent() {
    this._partRef = void 0;
    this._part.clear();
    clearNode(this._options.container);
    setChatInputStackSlot(this._options.container, 0 /* Empty */);
  }
};

ChatInputTipPresenter = __decorateClass([
  __decorateParam(2, IInstantiationService),
  __decorateParam(3, IContextKeyService),
  __decorateParam(4, IChatTipService)
], ChatInputTipPresenter);
export { ChatInputTipPresenter };
