// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/widget/chatPendingDragAndDrop.ts
import { Disposable, toDisposable } from "./module-0012.mjs";
import { $, DragAndDropObserver, EventType, addDisposableListener } from "./module-0075.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IChatService } from "./module-0972.mjs";


// src/vs/workbench/contrib/chat/browser/widget/chatPendingDragAndDrop.ts
var PENDING_REQUEST_ID_ATTR = "data-pending-request-id";

var PENDING_KIND_ATTR = "data-pending-kind";

var DRAGGING_CLASS2 = "chat-pending-dragging";

var ChatPendingDragController = class extends Disposable {
  constructor(listContainer, _getViewModel, _chatService) {
    super();
    this._getViewModel = _getViewModel;
    this._chatService = _chatService;
    this._insertIndicator = $(".chat-pending-insert-indicator");
    listContainer.append(this._insertIndicator);
    this._register(toDisposable(() => this._insertIndicator.remove()));
    this._register(new DragAndDropObserver(listContainer, {
      onDragOver: (e) => this._onDragOver(e),
      onDragLeave: () => this._hideIndicator(),
      onDragEnd: () => this._onDragEnd(),
      onDrop: (e) => this._onDrop(e)
    }));
  }
  /**
   * Called by the renderer to wire up a drag handle for a pending request row.
   */
  attachDragHandle(element, handleEl, rowContainer, disposables) {
    handleEl.setAttribute("draggable", "true");
    disposables.add(addDisposableListener(handleEl, EventType.DRAG_START, (e) => {
      if (!e.dataTransfer || !element.pendingKind) {
        return;
      }
      this._dragState = { element, pendingKind: element.pendingKind };
      rowContainer.classList.add(DRAGGING_CLASS2);
      e.dataTransfer.setDragImage(rowContainer, 0, 0);
      e.dataTransfer.effectAllowed = "move";
    }));
    disposables.add(addDisposableListener(handleEl, EventType.DRAG_END, () => {
      rowContainer.classList.remove(DRAGGING_CLASS2);
      this._onDragEnd();
    }));
  }
  // --- drag event handlers (delegated on the container) ---
  _onDragOver(e) {
    if (!this._dragState) {
      return;
    }
    const target = this._findDropTarget(e);
    if (!target) {
      this._hideIndicator();
      return;
    }
    e.preventDefault();
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = "move";
    }
    const rect = target.row.getBoundingClientRect();
    const midY = rect.top + rect.height / 2;
    const before = e.clientY < midY;
    this._showIndicator(target.row, before);
  }
  _onDrop(e) {
    this._hideIndicator();
    if (!this._dragState) {
      return;
    }
    const target = this._findDropTarget(e);
    if (!target) {
      return;
    }
    e.preventDefault();
    const rect = target.row.getBoundingClientRect();
    const midY = rect.top + rect.height / 2;
    const insertBefore = e.clientY < midY;
    this._reorder(this._dragState.element, target.requestId, insertBefore);
    this._dragState = void 0;
  }
  _onDragEnd() {
    this._hideIndicator();
    this._dragState = void 0;
  }
  // --- indicator positioning ---
  _showIndicator(targetRow, before) {
    const rect = targetRow.getBoundingClientRect();
    const parentRect = this._insertIndicator.parentElement.getBoundingClientRect();
    this._insertIndicator.style.display = "block";
    this._insertIndicator.style.left = `${rect.left - parentRect.left}px`;
    this._insertIndicator.style.width = `${rect.width}px`;
    this._insertIndicator.style.top = before ? `${rect.top - parentRect.top}px` : `${rect.bottom - parentRect.top}px`;
  }
  _hideIndicator() {
    this._insertIndicator.style.display = "none";
  }
  // --- target resolution ---
  _findDropTarget(e) {
    if (!this._dragState) {
      return void 0;
    }
    const target = e.target?.closest?.(`[${PENDING_REQUEST_ID_ATTR}]`);
    if (!target) {
      return void 0;
    }
    const requestId = target.getAttribute(PENDING_REQUEST_ID_ATTR);
    const kind = target.getAttribute(PENDING_KIND_ATTR);
    if (kind !== this._dragState.pendingKind || requestId === this._dragState.element.id) {
      return void 0;
    }
    return { row: target, requestId };
  }
  // --- reorder logic ---
  _reorder(draggedElement, targetId, insertBefore) {
    const viewModel = this._getViewModel();
    if (!viewModel) {
      return;
    }
    const pendingRequests = viewModel.model.getPendingRequests();
    const draggedKind = draggedElement.pendingKind;
    const group2 = [];
    const rest = [];
    for (const p of pendingRequests) {
      (p.kind === draggedKind ? group2 : rest).push(p);
    }
    const draggedIdx = group2.findIndex((p) => p.request.id === draggedElement.id);
    if (draggedIdx === -1) {
      return;
    }
    const [dragged] = group2.splice(draggedIdx, 1);
    let targetIdx = group2.findIndex((p) => p.request.id === targetId);
    if (targetIdx === -1) {
      return;
    }
    if (!insertBefore) {
      targetIdx++;
    }
    group2.splice(targetIdx, 0, dragged);
    const reordered = (draggedKind === "steering" /* Steering */ ? [...group2, ...rest] : [...rest, ...group2]).map((p) => ({ requestId: p.request.id, kind: p.kind }));
    this._chatService.setPendingRequests(viewModel.sessionResource, reordered);
  }
};

ChatPendingDragController = __decorateClass([
  __decorateParam(2, IChatService)
], ChatPendingDragController);
export { PENDING_REQUEST_ID_ATTR, PENDING_KIND_ATTR, DRAGGING_CLASS2, ChatPendingDragController };
