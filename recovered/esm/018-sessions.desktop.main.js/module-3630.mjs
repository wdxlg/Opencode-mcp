// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/chat/browser/responseSelectionSideChatController.ts
import { registerThemingParticipant } from "./module-0287.mjs";
import { editorSelectionBackground, editorSelectionForeground } from "./module-0229.mjs";
import { Disposable, MutableDisposable, toDisposable } from "./module-0012.mjs";
import { FeedbackInputWidget } from "./module-3627.mjs";
import { localize } from "./module-0001.mjs";
import { Codicon } from "./module-0085.mjs";
import { addDisposableListener, addStandardDisposableListener, getWindow, isAncestorOfActiveElement } from "./module-0075.mjs";
import { resolveResponseSelection } from "./module-3628.mjs";
import { clamp } from "./module-0040.mjs";
import { createAndSendSideChat } from "./module-3629.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ISessionsManagementService } from "./module-1766.mjs";
import { ISessionsService } from "./module-1783.mjs";
import { ISessionsPartService } from "./module-1771.mjs";
import { ILogService } from "./module-0095.mjs";
import { INotificationService } from "./module-0336.mjs";


// src/vs/sessions/contrib/chat/browser/responseSelectionSideChatController.ts
var selectionHighlightName = "chat-response-selection";

registerThemingParticipant((theme, collector) => {
  const background = theme.getColor(editorSelectionBackground);
  if (!background) {
    return;
  }
  const foreground2 = theme.getColor(editorSelectionForeground);
  collector.addRule(`::highlight(${selectionHighlightName}) {
		background-color: ${background};
		${foreground2 ? `color: ${foreground2};` : ""}
	}`);
});

function getSelectionHighlight(targetWindow) {
  const registry4 = targetWindow.CSS?.highlights;
  if (!registry4) {
    return void 0;
  }
  let highlight = registry4.get(selectionHighlightName);
  if (!highlight) {
    highlight = new targetWindow.Highlight();
    registry4.set(selectionHighlightName, highlight);
  }
  return highlight;
}

function getVisibleBoundingRect(range2) {
  let top2 = Number.POSITIVE_INFINITY;
  let bottom = Number.NEGATIVE_INFINITY;
  let left = Number.POSITIVE_INFINITY;
  for (const rect of range2.getClientRects()) {
    if (rect.width === 0 || rect.height === 0) {
      continue;
    }
    top2 = Math.min(top2, rect.top);
    bottom = Math.max(bottom, rect.bottom);
    left = Math.min(left, rect.left);
  }
  if (bottom === Number.NEGATIVE_INFINITY) {
    const fallback2 = range2.getBoundingClientRect();
    return fallback2.width || fallback2.height ? fallback2 : void 0;
  }
  return { top: top2, bottom, left };
}

var ResponseSelectionSideChatController = class extends Disposable {
  constructor(_widget, _sessionsManagementService, _sessionsService, _sessionsPartService, _logService, _notificationService) {
    super();
    this._widget = _widget;
    this._sessionsManagementService = _sessionsManagementService;
    this._sessionsService = _sessionsService;
    this._sessionsPartService = _sessionsPartService;
    this._logService = _logService;
    this._notificationService = _notificationService;
    /** Pins the transcript while a selection or the question input is active. */
    this._autoScrollHold = this._register(new MutableDisposable());
    /** Bumped on a genuine chat navigation/force-dismiss so a stale submission's completion/error handler can no-op. */
    this._generation = 0;
    this._input = this._register(new FeedbackInputWidget({
      placeholder: localize(4508, null),
      ariaLabel: localize(4503, null),
      getMaxContentWidth: () => this._widget.domNode.clientWidth,
      primaryAction: {
        label: localize(4504, null),
        icon: Codicon.arrowUpCompact,
        keybindingLabel: localize(4507, null)
      }
    }));
    this._widget.domNode.appendChild(this._input.domNode);
    this._register(this._input.onDidTriggerPrimary(() => this._submit()));
    this._register(addStandardDisposableListener(this._input.inputElement, "keydown", (e4) => {
      if (e4.keyCode === 9 /* Escape */) {
        e4.preventDefault();
        e4.stopPropagation();
        this._dismiss();
        return;
      }
      if (e4.keyCode === 3 /* Enter */) {
        if (e4.browserEvent.isComposing || e4.shiftKey) {
          return;
        }
        e4.preventDefault();
        e4.stopPropagation();
        this._submit();
      }
    }));
    this._register(addStandardDisposableListener(this._input.inputElement, "keypress", (e4) => {
      e4.stopPropagation();
    }));
    this._register(addStandardDisposableListener(this._input.inputElement, "input", () => {
      this._input.autoSize();
      this._input.updateActionEnabled();
    }));
    const window2 = getWindow(this._widget.domNode);
    this._register(addDisposableListener(window2.document, "selectionchange", () => this._onSelectionChange()));
    this._register(this._widget.onDidScroll(() => this._reposition()));
    this._register(addDisposableListener(this._widget.domNode, "scroll", () => this._reposition(), true));
    this._register(toDisposable(() => this._paintHighlight(void 0)));
  }
  /**
   * Tracks which chat the current transcript belongs to, for side-chat
   * creation. `ChatView` re-invokes this for the same chat on unrelated
   * observable changes, so only force-dismiss on a genuine resource change.
   */
  setChat(chat) {
    const changedChat = !this._chat || this._chat.resource.toString() !== chat.resource.toString();
    this._chat = chat;
    if (changedChat) {
      this._dismiss(true);
    }
  }
  _onSelectionChange() {
    this._updateAutoScrollHold();
    if (isAncestorOfActiveElement(this._input.domNode)) {
      this._syncHighlight();
      return;
    }
    if (this._input.isBusy) {
      this._syncHighlight();
      return;
    }
    const resolved = resolveResponseSelection(this._widget);
    if (!resolved) {
      this._dismiss();
      return;
    }
    this._resolved = resolved;
    this._showFor();
  }
  /**
   * Pins the transcript while the user is working with a selection: a growing
   * response that scrolls itself to the bottom would otherwise drag the text
   * out from under the selection (and the affordance anchored to it). Covers
   * any selection in the transcript, not just ones that resolve to a single
   * response, since auto-scrolling mid-drag is disruptive either way.
   */
  _updateAutoScrollHold() {
    const shouldHold = !!this._resolved || this._hasTranscriptSelection();
    if (shouldHold) {
      this._autoScrollHold.value ??= this._widget.holdAutoScroll();
    } else {
      this._autoScrollHold.clear();
    }
  }
  _hasTranscriptSelection() {
    const selection = getWindow(this._widget.domNode).getSelection();
    if (!selection || selection.isCollapsed || !selection.rangeCount || !selection.toString().trim()) {
      return false;
    }
    const range2 = selection.getRangeAt(0);
    return this._widget.transcriptDomNode.contains(range2.commonAncestorContainer);
  }
  /**
   * Keeps the captured selection visible. The native selection disappears as
   * soon as focus moves into the "Ask Question" input, so a CSS custom
   * highlight takes over painting the range for as long as the affordance is
   * open; while the native selection still covers it the browser paints it
   * and the highlight stays off so the two never stack.
   */
  _syncHighlight() {
    const range2 = this._resolved?.range;
    const nativeSelection = getWindow(this._widget.domNode).getSelection();
    const paintedNatively = !!nativeSelection && !nativeSelection.isCollapsed && !!nativeSelection.toString().trim();
    this._paintHighlight(range2 && !paintedNatively ? range2 : void 0);
  }
  _paintHighlight(range2) {
    if (this._paintedRange === range2) {
      return;
    }
    const highlight = getSelectionHighlight(getWindow(this._widget.domNode));
    if (!highlight) {
      return;
    }
    if (this._paintedRange) {
      highlight.delete(this._paintedRange);
    }
    if (range2) {
      highlight.add(range2);
    }
    this._paintedRange = range2;
  }
  _showFor() {
    this._input.show();
    this._input.autoSize();
    this._input.updateActionEnabled();
    this._syncHighlight();
    this._reposition();
  }
  /**
   * Re-anchors the input to the (live) selection range. Called on every
   * transcript scroll so the overlay tracks the text it belongs to instead of
   * staying pinned where the selection used to be.
   */
  _reposition() {
    const resolved = this._resolved;
    if (!resolved) {
      return;
    }
    const selectionRect = getVisibleBoundingRect(resolved.range);
    if (!selectionRect) {
      this._dismiss();
      return;
    }
    this._input.show();
    const originRect = this._widget.domNode.getBoundingClientRect();
    const bounds = this._transcriptBounds();
    const gap = 4;
    const inputWidth = this._input.domNode.offsetWidth;
    const inputHeight = this._input.domNode.offsetHeight;
    const minLeft = bounds.left - originRect.left;
    const maxLeft = Math.max(minLeft, minLeft + bounds.width - inputWidth);
    const left = clamp(selectionRect.left - originRect.left, minLeft, maxLeft);
    const minTop = bounds.top - originRect.top;
    const maxTop = Math.max(minTop, minTop + bounds.height - inputHeight);
    let top2 = selectionRect.bottom - originRect.top + gap;
    if (top2 > maxTop) {
      const aboveTop = selectionRect.top - originRect.top - inputHeight - gap;
      top2 = aboveTop >= minTop ? aboveTop : maxTop;
    }
    top2 = clamp(top2, minTop, maxTop);
    this._input.domNode.style.top = `${top2}px`;
    this._input.domNode.style.left = `${left}px`;
  }
  /**
   * Box the overlay is confined to, in viewport coordinates: the scrollable
   * transcript, further clipped to the window so it can never render out of
   * sight on a small window.
   */
  _transcriptBounds() {
    const rect = this._widget.transcriptDomNode.getBoundingClientRect();
    const viewport = getWindow(this._widget.domNode);
    const top2 = Math.max(rect.top, 0);
    const left = Math.max(rect.left, 0);
    const bottom = Math.min(rect.top + rect.height, viewport.innerHeight);
    const right = Math.min(rect.left + rect.width, viewport.innerWidth);
    return { top: top2, left, width: Math.max(0, right - left), height: Math.max(0, bottom - top2) };
  }
  /**
   * Dismisses the input. While a submission is pending (`_input.isBusy`),
   * only a genuine view change (`force`, from {@link setChat}) may dismiss
   * it — outside interactions like Escape or selection invalidation must not
   * race the in-flight create/open/send.
   */
  _dismiss(force = false) {
    if (!force && this._input.isBusy) {
      return;
    }
    if (force) {
      this._generation++;
    }
    const hadFocus = isAncestorOfActiveElement(this._input.domNode);
    this._resolved = void 0;
    this._paintHighlight(void 0);
    this._updateAutoScrollHold();
    this._input.setBusy(false);
    this._input.hide();
    this._input.clearInput();
    if (hadFocus) {
      this._widget.focusResponseItem(true);
    }
  }
  _submit() {
    const resolved = this._resolved;
    const chat = this._chat;
    const query = this._input.inputElement.value.trim();
    if (!resolved || !chat || !query || this._input.isBusy) {
      return;
    }
    const found = this._sessionsManagementService.getSessionForChatResource(chat.resource);
    if (!found) {
      this._notificationService.warn(localize(4509, null));
      return;
    }
    const { session } = found;
    if (session.status.get() === 0 /* Untitled */ || session.isArchived.get() || !session.capabilities.get().supportsSideChat) {
      this._notificationService.warn(localize(4510, null));
      return;
    }
    this._input.setBusy(true, localize(4505, null));
    const generation = this._generation;
    createAndSendSideChat(this._sessionsManagementService, this._sessionsService, this._sessionsPartService, session, chat.resource, resolved.response.requestId, { query }, { text: resolved.text }).then(() => {
      if (this._generation !== generation) {
        return;
      }
      this._input.setBusy(false);
    }).catch((err) => {
      this._logService.error("[selectionSideChat] Failed to create side chat", err);
      if (this._generation !== generation) {
        return;
      }
      this._notificationService.error(localize(4506, null));
      this._input.setBusy(false);
      this._input.inputElement.value = query;
      this._input.autoSize();
      this._input.updateActionEnabled();
      this._input.inputElement.focus();
    });
  }
};

ResponseSelectionSideChatController = __decorateClass([
  __decorateParam(1, ISessionsManagementService),
  __decorateParam(2, ISessionsService),
  __decorateParam(3, ISessionsPartService),
  __decorateParam(4, ILogService),
  __decorateParam(5, INotificationService)
], ResponseSelectionSideChatController);
export { getSelectionHighlight, getVisibleBoundingRect, selectionHighlightName, ResponseSelectionSideChatController };
