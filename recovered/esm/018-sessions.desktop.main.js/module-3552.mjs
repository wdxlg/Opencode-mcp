// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/browser/parts/chatView.ts
import { Disposable } from "./module-0012.mjs";
import { $, size } from "./module-0075.mjs";
import { Emitter, Event2 } from "./module-0017.mjs";
import { ProgressBar } from "./module-1330.mjs";
import { defaultProgressBarStyles } from "./module-0513.mjs";
import { ScopedProgressIndicator } from "./module-1331.mjs";


// src/vs/sessions/browser/parts/chatView.ts
var AbstractChatView = class extends Disposable {
  constructor() {
    super(...arguments);
    this.element = $(".chat-view");
    this.minimumWidth = 200;
    this.maximumWidth = Number.POSITIVE_INFINITY;
    this.minimumHeight = 200;
    this.maximumHeight = Number.POSITIVE_INFINITY;
    this._onDidChange = this._register(new Emitter());
    this.onDidChange = this._onDidChange.event;
  }
  /**
   * Show the given chat in this view. The default implementation is a
   * no-op; subclasses that host a chat widget (e.g. `ChatView`) override
   * this to load the chat model and feed it into the widget.
   */
  setChat(_chat, _historyKey, _session) {
  }
  /**
   * Select a workspace folder in this view's workspace picker. The default
   * implementation is a no-op; subclasses that host a workspace picker
   * (e.g. `NewChatView`) override this to forward the selection.
   */
  selectWorkspace(_folderUri, _providerId) {
  }
  /**
   * Prefill the input with the given text. The default implementation is
   * a no-op; subclasses that host an input widget (e.g. `NewChatView`)
   * override this.
   */
  prefillInput(_text) {
  }
  /**
   * Submit the given text as a chat query. The default implementation is
   * a no-op; subclasses that host an input widget (e.g. `NewChatView`)
   * override this.
   */
  sendQuery(_text) {
  }
  /** Submit the current composer input, returning whether it was sent. */
  submitInput() {
    return Promise.resolve(false);
  }
  /**
   * Attach the given resources as context to this view's chat input. The
   * default implementation is a no-op; subclasses that host a chat widget
   * (e.g. `ChatView`) override this to add the attachments to the widget.
   */
  attach(_uris) {
  }
  /**
   * Notifies the view whether it is the currently active session in the
   * sessions grid. Subclasses may use this to adjust their visual styling
   * (e.g. the chat list's background color). The default implementation
   * is a no-op.
   */
  setActive(_active2) {
  }
  /**
   * Notifies the view whether it is currently shown. Unlike {@link setActive},
   * inactive sessions displayed side by side are still visible.
   */
  setVisible(_visible) {
  }
  /**
   * Shows an indeterminate progress bar at the top of this leaf while the
   * given promise is pending, mirroring how each editor group surfaces
   * progress on its own {@link ProgressBar} (see `EditorGroupView` /
   * `ScopedProgressIndicator`). The bar is scoped to this view, so concurrent
   * loads in other grid leaves are unaffected. Overlapping loads on this leaf
   * are joined by the indicator so the bar only hides once all have settled.
   * The optional `delay` avoids flashing the bar for fast (e.g. cached) loads.
   */
  showProgressWhile(promise, delay) {
    if (!this._progressIndicator) {
      const progressBar = this._register(new ProgressBar(this.element, defaultProgressBarStyles));
      progressBar.hide();
      const scope = { isActive: true, onDidChangeActive: Event2.None };
      this._progressIndicator = this._register(new ScopedProgressIndicator(progressBar, scope));
    }
    this._progressIndicator.showWhile(promise, delay);
  }
  /**
   * Called by the workbench grid to size this leaf. Sizes {@link element}
   * to the allocated dimensions and then delegates to {@link doLayout} so
   * subclasses can forward sizing to their hosted widget.
   */
  layout(width2, height, top2, left) {
    size(this.element, width2, height);
    this.doLayout(width2, height, top2, left);
  }
};
export { AbstractChatView };
