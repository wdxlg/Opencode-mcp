// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/promptTimeline/promptTimelineCard.ts
import { Disposable, DisposableStore } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { $, EventType, addDisposableListener, append, clearNode } from "./module-0075.mjs";
import { localize } from "./module-0001.mjs";


// src/vs/workbench/contrib/chat/browser/promptTimeline/promptTimelineCard.ts
var PromptTimelineCard = class extends Disposable {
  constructor(_container) {
    super();
    this._container = _container;
    this._contentDisposables = this._register(new DisposableStore());
    this._hovered = false;
    this._filesProvider = () => [];
    this._onDidReview = this._register(new Emitter());
    this.onDidReview = this._onDidReview.event;
    this._onDidReviewFile = this._register(new Emitter());
    this.onDidReviewFile = this._onDidReviewFile.event;
    this._element = append(this._container, $(".prompt-timeline-card"));
    this._element.classList.add("hidden");
    this._register(addDisposableListener(this._element, EventType.MOUSE_ENTER, () => {
      this._hovered = true;
    }));
    this._register(addDisposableListener(this._element, EventType.MOUSE_LEAVE, () => {
      this._hovered = false;
      this.scheduleHide();
    }));
  }
  setFilesProvider(provider) {
    this._filesProvider = provider;
  }
  /** Builds the card for a tick and positions it centered on `anchorCenterY` (relative to the container). */
  show(tick, anchorCenterY) {
    if (this._hideTimer !== void 0) {
      clearTimeout(this._hideTimer);
      this._hideTimer = void 0;
    }
    this._contentDisposables.clear();
    clearNode(this._element);
    const head = append(this._element, $(".prompt-timeline-card-head"));
    append(head, $(".prompt-timeline-card-text")).textContent = tick.text;
    if (tick.count > 1) {
      append(head, $(".prompt-timeline-card-meta")).textContent = localize(11577, null, tick.count);
    }
    const files = tick.stat ? this._filesProvider(tick) : [];
    if (tick.stat) {
      const diffAction = append(head, $("button.prompt-timeline-card-diff-action"));
      diffAction.setAttribute("aria-label", localize(
        11581,
        null,
        tick.text
      ));
      this._renderStat(append(diffAction, $("span.prompt-timeline-card-stat")), tick.stat.added, tick.stat.removed);
      append(diffAction, $("span")).textContent = tick.stat.fileCount === 1 ? localize(11580, null) : localize(11578, null, tick.stat.fileCount);
      append(diffAction, $("span.prompt-timeline-card-diff-action-chevron")).textContent = "\u203A";
      this._contentDisposables.add(addDisposableListener(diffAction, EventType.CLICK, () => {
        this._onDidReview.fire(tick);
        this.hide();
      }));
    } else {
      append(head, $("div.prompt-timeline-card-no-edits")).textContent = localize(11579, null);
    }
    if (files.length > 0) {
      const list2 = append(this._element, $(".prompt-timeline-card-files"));
      for (const file of files) {
        const row = append(list2, $("button.prompt-timeline-card-file"));
        row.title = file.name;
        append(row, $(".prompt-timeline-card-fname")).textContent = file.name;
        this._renderStat(append(row, $(".prompt-timeline-card-fstat")), file.added, file.removed);
        this._contentDisposables.add(addDisposableListener(row, EventType.CLICK, () => {
          this._onDidReviewFile.fire({ tick, file: file.modifiedURI });
          this.hide();
        }));
      }
    }
    this._element.classList.remove("hidden");
    const top2 = anchorCenterY - this._element.offsetHeight / 2;
    const clampedTop = Math.max(4, Math.min(top2, this._container.clientHeight - this._element.offsetHeight - 4));
    this._element.style.top = `${clampedTop}px`;
  }
  _renderStat(container2, added, removed) {
    append(container2, $("span.added")).textContent = `+${added}`;
    append(container2, $("span.removed")).textContent = `\u2212${removed}`;
  }
  /** Hides the card shortly, unless it (or a mark) is re-hovered first. */
  scheduleHide() {
    if (this._hideTimer !== void 0) {
      clearTimeout(this._hideTimer);
    }
    this._hideTimer = setTimeout(() => {
      this._hideTimer = void 0;
      if (!this._hovered) {
        this.hide();
      }
    }, 200);
  }
  hide() {
    this._hovered = false;
    this._contentDisposables.clear();
    this._element.classList.add("hidden");
  }
  dispose() {
    if (this._hideTimer !== void 0) {
      clearTimeout(this._hideTimer);
    }
    super.dispose();
  }
};
export { PromptTimelineCard };
