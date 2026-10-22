// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/widget/chatContentParts/chatRichLink.ts
import { Disposable } from "./module-0012.mjs";
import { autorun } from "./module-0052.mjs";
import { getDefaultHoverDelegate } from "./module-0448.mjs";
import { URI } from "./module-0032.mjs";
import { createPixelSpinner } from "./module-2010.mjs";
import { localize } from "./module-0001.mjs";


// src/vs/workbench/contrib/chat/browser/widget/chatContentParts/chatRichLink.ts
var ChatRichLink = class _ChatRichLink {
  constructor(element, authoredLabel) {
    this.element = element;
    this.authoredLabel = authoredLabel;
    const document2 = element.ownerDocument;
    this._icon = document2.createElement("span");
    this._icon.className = "chat-rich-link-icon codicon";
    this._icon.setAttribute("aria-hidden", "true");
    this._title = document2.createElement("span");
    this._title.className = "chat-rich-link-title";
    this._detail = document2.createElement("span");
    this._detail.className = "chat-rich-link-detail";
    this._reference = document2.createElement("span");
    this._reference.className = "chat-rich-link-reference";
    this._changes = createRichLinkChangesDom(document2);
    this._status = createRichLinkStatusDom(document2, "chat-rich-link-primary-status");
    this._secondaryStatus = createRichLinkStatusDom(document2, "chat-rich-link-secondary-status");
    this.authoredLabel.className = "chat-rich-link-label";
    this.element.classList.add("chat-rich-link");
    this._setDefaultOrder();
  }
  static mount(element, authoredLabel) {
    return new _ChatRichLink(element, authoredLabel);
  }
  update(presentation2) {
    this.element.dataset.chatRichLinkKind = presentation2.kind;
    this.element.classList.toggle("chat-rich-link-loading", presentation2.isLoading === true);
    this.element.setAttribute("aria-busy", String(presentation2.isLoading === true));
    this._icon.className = `chat-rich-link-icon codicon codicon-${richLinkIcons[presentation2.kind]}`;
    this.authoredLabel.hidden = Boolean(presentation2.title);
    this._title.textContent = presentation2.title ?? "";
    this._title.hidden = !presentation2.title;
    this._detail.textContent = presentation2.detail ?? "";
    this._detail.hidden = !presentation2.detail;
    this._reference.textContent = presentation2.reference ?? "";
    this._reference.hidden = !presentation2.reference;
    updateRichLinkChanges(this._changes, presentation2.changes);
    updateRichLinkStatus(this.element, presentation2.kind, this._status, presentation2.status, "chatRichLinkStatus");
    updateRichLinkStatus(this.element, presentation2.kind, this._secondaryStatus, presentation2.secondaryStatus, "chatRichLinkSecondaryStatus");
    patchDomNodes(this.element, hasLeadingLifecycleStatus(presentation2) ? [this._status.root, this.authoredLabel, this._title, this._detail, this._reference, this._changes.root, this._secondaryStatus.root] : [this._icon, this.authoredLabel, this._title, this._detail, this._reference, this._changes.root, this._status.root, this._secondaryStatus.root]);
    if (presentation2.ariaLabel) {
      this.element.setAttribute("aria-label", presentation2.ariaLabel);
    } else {
      this.element.removeAttribute("aria-label");
    }
    this.element.removeAttribute("title");
  }
  dispose() {
    disposeRichLinkStatus(this._status);
    disposeRichLinkStatus(this._secondaryStatus);
  }
  _setDefaultOrder() {
    patchDomNodes(this.element, [
      this._icon,
      this.authoredLabel,
      this._title,
      this._detail,
      this._reference,
      this._changes.root,
      this._status.root,
      this._secondaryStatus.root
    ]);
  }
};

var ChatRichLinkDecorator = class extends Disposable {
  constructor(_linkPresentationService, _hoverService, _sessionSummaryHoverService) {
    super();
    this._linkPresentationService = _linkPresentationService;
    this._hoverService = _hoverService;
    this._sessionSummaryHoverService = _sessionSummaryHoverService;
  }
  decorate(anchor, href, store) {
    const watcher = this._getLinkPresentationWatcher(href);
    if (watcher) {
      store.add(watcher);
      return this._decorate(anchor, href, store, (reader) => watcher.presentation.read(reader) ?? createLoadingLinkPresentation(anchor.textContent || href, href));
    }
    return false;
  }
  _decorate(anchor, href, store, readPresentation) {
    const authoredLabel = anchor.ownerDocument.createElement("span");
    authoredLabel.textContent = anchor.textContent || href;
    const richLink = store.add(ChatRichLink.mount(anchor, authoredLabel));
    let tooltip = href;
    let kind;
    store.add(autorun((reader) => {
      const presentation2 = readPresentation(reader);
      tooltip = presentation2.tooltip ?? href;
      kind = presentation2.kind;
      richLink.update(presentation2);
    }));
    store.add(this._hoverService.setupManagedHover(getDefaultHoverDelegate("element"), anchor, () => {
      if (kind !== "session" && kind !== "chat") {
        return tooltip;
      }
      return {
        element: async (token) => await this._createSessionHoverElement(href, token) ?? plainTooltipElement(anchor.ownerDocument, tooltip)
      };
    }));
    return true;
  }
  async _createSessionHoverElement(href, token) {
    let resource;
    try {
      resource = URI.parse(href);
    } catch {
      return void 0;
    }
    return this._sessionSummaryHoverService.createHoverElement(resource, token);
  }
  _getLinkPresentationWatcher(href) {
    let resource;
    try {
      resource = URI.parse(href);
    } catch {
      return void 0;
    }
    const rule = this._linkPresentationService.getLinkPresentationRule(resource);
    return rule ? this._linkPresentationService.createLinkPresentationWatcher(rule.id, resource) : void 0;
  }
};

function plainTooltipElement(document2, tooltip) {
  const element = document2.createElement("div");
  element.className = "chat-rich-link-plain-hover";
  element.textContent = tooltip;
  return element;
}

var richLinkIcons = {
  resource: "link",
  issue: "issues",
  pullRequest: "git-pull-request",
  commit: "git-commit",
  file: "file",
  folder: "folder-compact",
  session: "agent",
  chat: "comment-discussion",
  repository: "repo-compact",
  branch: "git-branch-compact"
};

function createRichLinkStatusDom(document2, className2) {
  const root = document2.createElement("span");
  root.className = `chat-rich-link-status ${className2}`;
  const icon2 = document2.createElement("span");
  icon2.className = "chat-rich-link-status-icon codicon";
  icon2.setAttribute("aria-hidden", "true");
  const label3 = document2.createElement("span");
  label3.className = "chat-rich-link-status-label";
  root.append(icon2, label3);
  return { root, icon: icon2, label: label3 };
}

function createRichLinkChangesDom(document2) {
  const root = document2.createElement("span");
  root.className = "chat-rich-link-changes";
  const insertions = document2.createElement("span");
  insertions.className = "chat-rich-link-insertions";
  const deletions = document2.createElement("span");
  deletions.className = "chat-rich-link-deletions";
  root.append(insertions, deletions);
  return { root, insertions, deletions };
}

function updateRichLinkChanges(dom, changes) {
  if (!changes) {
    dom.insertions.textContent = "";
    dom.deletions.textContent = "";
    dom.root.hidden = true;
    return;
  }
  dom.insertions.textContent = `+${changes.insertions}`;
  dom.deletions.textContent = `-${changes.deletions}`;
  dom.root.hidden = false;
}

function updateRichLinkStatus(element, presentationKind, dom, status2, dataKey) {
  if (!status2) {
    delete element.dataset[dataKey];
    resetRichLinkStatus(dom);
    return;
  }
  element.dataset[dataKey] = status2.kind;
  const spinnerVariant = getSessionSpinnerVariant(presentationKind, status2.kind);
  dom.icon.className = `chat-rich-link-status-icon codicon codicon-${getRichLinkStatusIcon(presentationKind, status2.kind)}`;
  dom.icon.hidden = spinnerVariant !== void 0;
  if (spinnerVariant && spinnerVariant !== dom.spinnerVariant) {
    disposePixelSpinner(dom);
    dom.pixelSpinner = createPixelSpinner(void 0, { variant: spinnerVariant });
    dom.spinnerVariant = spinnerVariant;
    dom.label.before(dom.pixelSpinner.element);
  } else if (!spinnerVariant) {
    disposePixelSpinner(dom);
  }
  dom.label.textContent = status2.label;
  dom.root.hidden = false;
}

function resetRichLinkStatus(dom) {
  dom.icon.hidden = false;
  disposePixelSpinner(dom);
  dom.label.textContent = "";
  dom.root.hidden = true;
}

function disposeRichLinkStatus(dom) {
  disposePixelSpinner(dom);
}

function disposePixelSpinner(dom) {
  dom.pixelSpinner?.element.remove();
  dom.pixelSpinner?.dispose();
  dom.pixelSpinner = void 0;
  dom.spinnerVariant = void 0;
}

function getSessionSpinnerVariant(presentationKind, statusKind) {
  if (presentationKind !== "session") {
    return void 0;
  }
  switch (statusKind) {
    case "pending":
      return "grid";
    case "warning":
      return "ring";
    default:
      return void 0;
  }
}

function hasLeadingLifecycleStatus(presentation2) {
  const statusKind = presentation2.status?.kind;
  switch (presentation2.kind) {
    case "issue":
      return statusKind === "open" || statusKind === "closed" || statusKind === "notPlanned";
    case "pullRequest":
      return statusKind === "open" || statusKind === "closed" || statusKind === "merged" || statusKind === "draft";
    default:
      return false;
  }
}

function getRichLinkStatusIcon(presentationKind, statusKind) {
  if (presentationKind === "session") {
    switch (statusKind) {
      case "pending":
      case "warning":
      case "success":
      case "neutral":
        return "comment-discussion";
      case "error":
        return "error-compact";
    }
  }
  switch (statusKind) {
    case "open":
      return presentationKind === "pullRequest" ? "git-pull-request" : "issue-opened";
    case "closed":
      return presentationKind === "pullRequest" ? "git-pull-request-closed" : "issue-closed";
    case "merged":
      return "git-merge";
    case "draft":
      return "git-pull-request-draft";
    case "notPlanned":
      return "circle-slash-compact";
    case "pending":
      return "circle-filled-compact";
    case "success":
      return "pass-filled-compact";
    case "warning":
      return "warning-compact";
    case "error":
      return "error-compact";
    case "neutral":
      return "circle-outline";
  }
}

function createLoadingLinkPresentation(authoredLabel, href) {
  const loading = localize(12065, null);
  return {
    kind: "resource",
    status: { kind: "pending", label: loading },
    tooltip: href,
    ariaLabel: localize(12066, null, authoredLabel, loading)
  };
}

function patchDomNodes(parent, nodes) {
  let domCursor = parent.firstChild;
  let index2 = 0;
  for (; index2 < nodes.length; index2++) {
    if (domCursor !== nodes[index2]) {
      break;
    }
    domCursor = domCursor.nextSibling;
  }
  if (index2 === nodes.length && domCursor === null) {
    return;
  }
  for (; index2 < nodes.length; index2++) {
    const node = nodes[index2];
    if (domCursor === node) {
      domCursor = node.nextSibling;
    } else {
      parent.insertBefore(node, domCursor);
    }
  }
  while (domCursor) {
    const toRemove = domCursor;
    domCursor = domCursor.nextSibling;
    parent.removeChild(toRemove);
  }
}
export { plainTooltipElement, createRichLinkStatusDom, createRichLinkChangesDom, updateRichLinkChanges, updateRichLinkStatus, resetRichLinkStatus, disposeRichLinkStatus, disposePixelSpinner, getSessionSpinnerVariant, hasLeadingLifecycleStatus, getRichLinkStatusIcon, createLoadingLinkPresentation, patchDomNodes, ChatRichLink, ChatRichLinkDecorator, richLinkIcons };
