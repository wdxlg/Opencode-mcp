// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/agentSessions/agentSessionsViewer.ts
import { Disposable, DisposableStore, MutableDisposable } from "./module-0012.mjs";
import { clearNode, h, isHTMLElement } from "./module-0075.mjs";
import { asCssVariable } from "./module-0226.mjs";
import { createPixelSpinner } from "./module-2010.mjs";
import { ThemeIcon, themeColorFromId } from "./module-0086.mjs";
import { Codicon } from "./module-0085.mjs";
import { Emitter } from "./module-0017.mjs";
import { ServiceCollection } from "./module-0440.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { MenuWorkbenchToolBar } from "./module-0519.mjs";
import { MenuId } from "./module-0092.mjs";
import { IconLabel } from "./module-0640.mjs";
import { AgentSessionProviders } from "./module-0982.mjs";
import { MarkdownString } from "./module-0462.mjs";
import { renderAsPlaintext } from "./module-0468.mjs";
import { createMatches } from "./module-0453.mjs";
import { ChatContextKeys } from "./module-0965.mjs";
import { localize } from "./module-0001.mjs";
import { autorun } from "./module-0052.mjs";
import { IChatSessionsService, isSessionInProgressStatus } from "./module-0960.mjs";
import { getAgentChangesSummary, hasValidDiff, isAgentSession, isAgentSessionSection, isAgentSessionShowLess, isAgentSessionShowMore, isAgentSessionsModel } from "./module-1463.mjs";
import { CancellationTokenSource } from "./module-0025.mjs";
import { allowedChatMarkdownHtmlTags } from "./module-2144.mjs";
import { fromNow, getDurationString } from "./module-0120.mjs";
import { IntervalTimer } from "./module-0036.mjs";
import { AgentSessionHoverWidget } from "./module-2753.mjs";
import { BugIndicatingError } from "./module-0004.mjs";
import { Button } from "./module-0546.mjs";
import { defaultButtonStyles } from "./module-0513.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IMarkdownRendererService } from "./module-0541.mjs";
import { IProductService } from "./module-0873.mjs";
import { IHoverService } from "./module-0520.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IAccessibilityService } from "./module-0104.mjs";
import { IVoicePlaybackService } from "./module-2073.mjs";
import { compareIgnoreCase } from "./module-0030.mjs";
import { NotSelectableGroupId } from "./module-0454.mjs";
import { coalesce } from "./module-0007.mjs";
import { fillEditorsDragData } from "./module-1381.mjs";


// src/vs/workbench/contrib/chat/browser/agentSessions/agentSessionsViewer.ts
var AgentSessionStatusIcon = class _AgentSessionStatusIcon extends Disposable {
  constructor(container3, getIcon, accessibilityService) {
    super();
    this.container = container3;
    this.getIcon = getIcon;
    this.accessibilityService = accessibilityService;
    this.spinner = this._register(new MutableDisposable());
    this._register(this.accessibilityService.onDidChangeReducedMotion(() => {
      if (this._lastSession) {
        this.render(this._lastSession);
      }
    }));
  }
  static {
    this.PIXEL_SPINNER_GRID_KEY = "__pixel_spinner_grid__";
  }
  static {
    this.PIXEL_SPINNER_RING_KEY = "__pixel_spinner_ring__";
  }
  setStatus(session) {
    this._lastSession = session;
    this.render(session);
  }
  reset() {
    this._currentCacheKey = void 0;
    this._lastSession = void 0;
    this.spinner.clear();
    clearNode(this.container);
  }
  render(session) {
    this.container.className = `agent-session-icon${session.status === 3 /* NeedsInput */ ? " needs-input" : ""}`;
    this.container.style.color = "";
    if ((session.status === 2 /* InProgress */ || session.status === 3 /* NeedsInput */) && !this.accessibilityService.isMotionReduced()) {
      const isNeedsInput = session.status === 3 /* NeedsInput */;
      const cacheKey3 = isNeedsInput ? _AgentSessionStatusIcon.PIXEL_SPINNER_RING_KEY : _AgentSessionStatusIcon.PIXEL_SPINNER_GRID_KEY;
      const color3 = isNeedsInput ? asCssVariable("list.warningForeground") : asCssVariable("textLink.foreground");
      if (this._currentCacheKey === cacheKey3) {
        this.updateActiveIconColor(color3);
        return;
      }
      this._currentCacheKey = cacheKey3;
      this.spinner.clear();
      clearNode(this.container);
      const spinner = createPixelSpinner(void 0, { variant: isNeedsInput ? "ring" : "grid" });
      this.spinner.value = spinner;
      spinner.element.style.color = color3;
      this.container.appendChild(spinner.element);
      return;
    }
    const icon2 = this.getIcon(session);
    const cacheKey2 = ThemeIcon.asCSSSelector(icon2);
    const color2 = icon2.color ? asCssVariable(icon2.color.id) : "";
    if (this._currentCacheKey === cacheKey2) {
      this.updateActiveIconColor(color2);
      return;
    }
    this._currentCacheKey = cacheKey2;
    this.spinner.clear();
    clearNode(this.container);
    const iconElement = h(`span${cacheKey2}`).root;
    iconElement.style.color = color2;
    this.container.appendChild(iconElement);
  }
  updateActiveIconColor(color2) {
    const activeIcon = this.container.firstElementChild;
    if (isHTMLElement(activeIcon)) {
      activeIcon.style.color = color2;
    }
  }
};

function getAgentSessionStatusIcon(session) {
  if (session.status === 2 /* InProgress */) {
    return { ...Codicon.sessionInProgress, color: themeColorFromId("textLink.foreground") };
  }
  if (session.status === 3 /* NeedsInput */) {
    return { ...Codicon.circleFilled, color: themeColorFromId("list.warningForeground") };
  }
  if (session.status === 0 /* Failed */) {
    return { ...Codicon.error, color: themeColorFromId("errorForeground") };
  }
  if (session.isArchived()) {
    return { ...Codicon.passFilled, color: themeColorFromId("agentSessionReadIndicator.foreground") };
  }
  if (!session.isRead()) {
    return { ...Codicon.circleFilled, color: themeColorFromId("textLink.foreground") };
  }
  return { ...Codicon.circleSmallFilled, color: themeColorFromId("agentSessionReadIndicator.foreground") };
}

var AgentSessionRenderer = class extends Disposable {
  constructor(options3, _approvalModel, _activeSessionResource, markdownRendererService, productService, hoverService, instantiationService, contextKeyService, chatSessionsService, accessibilityService, voicePlaybackService) {
    super();
    this.options = options3;
    this._approvalModel = _approvalModel;
    this._activeSessionResource = _activeSessionResource;
    this.markdownRendererService = markdownRendererService;
    this.productService = productService;
    this.hoverService = hoverService;
    this.instantiationService = instantiationService;
    this.contextKeyService = contextKeyService;
    this.chatSessionsService = chatSessionsService;
    this.accessibilityService = accessibilityService;
    this.voicePlaybackService = voicePlaybackService;
    this.templateId = AgentSessionRenderer.TEMPLATE_ID;
    this.sessionHover = this._register(new MutableDisposable());
    this._onDidChangeItemHeight = this._register(new Emitter());
    this.onDidChangeItemHeight = this._onDidChangeItemHeight.event;
  }
  static {
    this.TEMPLATE_ID = "agent-session";
  }
  static {
    this.APPROVAL_ROW_MAX_LINES = 3;
  }
  static {
    this._APPROVAL_ROW_LINE_HEIGHT = 18;
  }
  static {
    this._APPROVAL_ROW_OVERHEAD = 14;
  }
  // 4px margin-top + 4px padding-top + 4px padding-bottom + 2px border
  static getApprovalRowHeight(label3) {
    const lineCount = Math.min(label3.split(/\r?\n/).length, AgentSessionRenderer.APPROVAL_ROW_MAX_LINES);
    return lineCount * AgentSessionRenderer._APPROVAL_ROW_LINE_HEIGHT + AgentSessionRenderer._APPROVAL_ROW_OVERHEAD;
  }
  renderTemplate(container3) {
    const disposables = new DisposableStore();
    const elementDisposable = disposables.add(new DisposableStore());
    container3.closest(".monaco-list-row")?.classList.add("agent-session-list-row", "agent-session-item-row");
    const elements = h(
      "div.agent-session-item@item",
      [
        h("div.agent-session-icon-col", [
          h("div.agent-session-icon@icon")
        ]),
        h("div.agent-session-main-col", [
          h("div.agent-session-title-row", [
            h("div.agent-session-title@title"),
            h("div.agent-session-pinned-indicator@pinnedIndicator"),
            h("div.agent-session-pending-voice-indicator@pendingVoiceIndicator"),
            h("div.agent-session-title-toolbar@titleToolbar")
          ]),
          h("div.agent-session-details-row", [
            h("div.agent-session-details-icon@detailsIcon"),
            h("div.agent-session-badge@badge"),
            h("span.agent-session-separator@separator"),
            h(
              "div.agent-session-diff-container@diffContainer",
              [
                h("span.agent-session-diff-added@addedSpan"),
                h("span.agent-session-diff-removed@removedSpan")
              ]
            ),
            h("div.agent-session-description@description"),
            h("div.agent-session-status@statusContainer", [
              h("span.agent-session-status-time@statusTime")
            ])
          ]),
          h("div.agent-session-approval-row@approvalRow", [
            h("span.agent-session-approval-label@approvalLabel"),
            h("div.agent-session-approval-button@approvalButtonContainer")
          ])
        ])
      ]
    );
    const contextKeyService = disposables.add(this.contextKeyService.createScoped(elements.item));
    const scopedInstantiationService = disposables.add(this.instantiationService.createChild(new ServiceCollection([IContextKeyService, contextKeyService])));
    const titleToolbar = disposables.add(scopedInstantiationService.createInstance(MenuWorkbenchToolBar, elements.titleToolbar, MenuId.AgentSessionItemToolbar, {
      menuOptions: { shouldForwardArgs: true }
    }));
    container3.appendChild(elements.item);
    return {
      element: elements.item,
      icon: elements.icon,
      statusIcon: disposables.add(new AgentSessionStatusIcon(elements.icon, (session) => this.getIcon(session), this.accessibilityService)),
      title: disposables.add(new IconLabel(elements.title, { supportHighlights: true, supportIcons: true })),
      pinnedIndicator: elements.pinnedIndicator,
      pendingVoiceIndicator: elements.pendingVoiceIndicator,
      titleToolbar,
      detailsIcon: elements.detailsIcon,
      badge: elements.badge,
      separator: elements.separator,
      diffContainer: elements.diffContainer,
      diffAddedSpan: elements.addedSpan,
      diffRemovedSpan: elements.removedSpan,
      description: elements.description,
      statusContainer: elements.statusContainer,
      statusTime: elements.statusTime,
      approvalRow: elements.approvalRow,
      approvalLabel: elements.approvalLabel,
      approvalButtonContainer: elements.approvalButtonContainer,
      contextKeyService,
      elementDisposable,
      disposables
    };
  }
  renderElement(session, index2, template2, details) {
    template2.elementDisposable.clear();
    template2.diffAddedSpan.textContent = "";
    template2.diffRemovedSpan.textContent = "";
    template2.badge.textContent = "";
    template2.description.textContent = "";
    template2.element.classList.toggle("archived", session.element.isArchived());
    if (this.options.isGroupedByRepository?.()) {
      const repoName = getRepositoryName(session.element);
      if (repoName) {
        template2.element.setAttribute("data-section-label", repoName);
      } else {
        template2.element.removeAttribute("data-section-label");
      }
    } else {
      template2.element.removeAttribute("data-section-label");
    }
    if (this.options.useStatusOnlyIcons) {
      template2.statusIcon.setStatus(session.element);
      if (session.element.providerType === AgentSessionProviders.Background) {
        template2.detailsIcon.className = "agent-session-details-icon";
      } else {
        template2.detailsIcon.className = `agent-session-details-icon ${ThemeIcon.asClassName(session.element.icon)}`;
        template2.detailsIcon.classList.add("visible");
      }
    } else {
      template2.statusIcon.setStatus(session.element);
      template2.detailsIcon.className = "agent-session-details-icon";
    }
    const markdownTitle = new MarkdownString(session.element.label);
    template2.title.setLabel(renderAsPlaintext(markdownTitle), void 0, { matches: createMatches(session.filterData) });
    ChatContextKeys.isArchivedAgentSession.bindTo(template2.contextKeyService).set(session.element.isArchived());
    ChatContextKeys.isPinnedAgentSession.bindTo(template2.contextKeyService).set(session.element.isPinned());
    ChatContextKeys.isReadAgentSession.bindTo(template2.contextKeyService).set(session.element.isRead());
    ChatContextKeys.agentSessionType.bindTo(template2.contextKeyService).set(session.element.providerType);
    template2.titleToolbar.context = session.element;
    const isPinned = session.element.isPinned();
    template2.pinnedIndicator.className = "agent-session-pinned-indicator " + ThemeIcon.asClassName(Codicon.pinned);
    template2.pinnedIndicator.classList.toggle("visible", isPinned);
    const sessionResource = session.element.resource;
    template2.pendingVoiceIndicator.className = "agent-session-pending-voice-indicator " + ThemeIcon.asClassName(Codicon.unmute);
    template2.pendingVoiceIndicator.title = localize(9184, null);
    const updatePendingVoice = () => {
      template2.pendingVoiceIndicator.classList.toggle("visible", this.voicePlaybackService.hasPendingResponse(sessionResource));
    };
    template2.elementDisposable.add(autorun((reader) => {
      this.voicePlaybackService.pendingResponseVersion.read(reader);
      updatePendingVoice();
    }));
    const hasBadge = this.renderBadge(session, template2);
    let hasDiff = false;
    const { changes: diff4 } = session.element;
    if (!isSessionInProgressStatus(session.element.status) && diff4 && hasValidDiff(diff4)) {
      if (this.renderDiff(session, template2)) {
        hasDiff = true;
      }
    }
    let hasAgentSessionChanges = false;
    if (session.element.providerType === AgentSessionProviders.Background || session.element.providerType === AgentSessionProviders.Cloud) {
      hasAgentSessionChanges = Array.isArray(diff4) && diff4.length > 0;
    } else {
      hasAgentSessionChanges = hasDiff;
    }
    ChatContextKeys.hasAgentSessionChanges.bindTo(template2.contextKeyService).set(hasAgentSessionChanges);
    const hasDescription = this.renderDescription(session, template2);
    const hasStatus = this.renderStatus(session, template2);
    const hideDetails = hasDescription && isSessionInProgressStatus(session.element.status);
    template2.badge.classList.toggle("has-badge", hasBadge && !hideDetails);
    template2.diffContainer.classList.toggle("has-diff", hasDiff && !hideDetails);
    template2.statusContainer.classList.toggle("hidden", hideDetails);
    template2.separator.classList.toggle("has-separator", !hideDetails && hasBadge && hasDiff);
    template2.description.classList.toggle("has-separator", hasDescription && !hideDetails && (hasBadge || hasDiff));
    template2.statusContainer.classList.toggle("has-separator", !hideDetails && hasStatus && (hasBadge || hasDiff || hasDescription));
    this.renderHover(session, template2);
    if (this._approvalModel) {
      this.renderApprovalRow(session, template2);
    }
    this.triggerResolve(session, template2);
  }
  triggerResolve(session, template2) {
    const cts = new CancellationTokenSource();
    template2.elementDisposable.add({ dispose() {
      cts.dispose(true);
    } });
    this.chatSessionsService.resolveChatSessionItem(session.element.providerType, session.element.resource, cts.token).catch(() => {
    });
  }
  renderBadge(session, template2) {
    if (this.options.hideSessionBadge) {
      return false;
    }
    const badge = session.element.badge;
    if (!badge) {
      return false;
    }
    if (this.options.isGroupedByRepository?.() && !session.element.isArchived() && !session.element.isPinned()) {
      const raw = typeof badge === "string" ? badge : badge.value;
      const match2 = raw.match(/^\$\((?:repo|folder|worktree)\)\s*(.+)/);
      if (match2) {
        const badgeName = match2[1].trim();
        const repoName = getRepositoryName(session.element);
        if (badgeName === repoName) {
          return false;
        }
      }
    }
    const normalisedBadge = this.stripCodicons(badge);
    const badgeValue = typeof normalisedBadge === "string" ? normalisedBadge : normalisedBadge.value;
    if (!badgeValue) {
      return false;
    }
    this.renderMarkdownOrText(normalisedBadge, template2.badge, template2.elementDisposable);
    return true;
  }
  stripCodicons(content2) {
    const raw = typeof content2 === "string" ? content2 : content2.value;
    const stripped = raw.replace(/\$\([a-z0-9\-]+\)\s*/gi, "").trim();
    if (typeof content2 === "string") {
      return stripped;
    }
    return MarkdownString.lift({ ...content2, value: stripped });
  }
  renderMarkdownOrText(content2, container3, disposables) {
    if (typeof content2 === "string") {
      container3.textContent = content2;
    } else {
      disposables.add(this.markdownRendererService.render(content2, {
        sanitizerConfig: {
          replaceWithPlaintext: true,
          allowedTags: {
            override: allowedChatMarkdownHtmlTags
          },
          allowedLinkSchemes: { augment: [this.productService.urlProtocol] }
        }
      }, container3));
    }
  }
  renderDiff(session, template2) {
    const diff4 = getAgentChangesSummary(session.element.changes);
    if (!diff4) {
      return false;
    }
    if (diff4.insertions === 0 && diff4.deletions === 0) {
      return false;
    }
    if (diff4.insertions >= 0) {
      template2.diffAddedSpan.textContent = `+${diff4.insertions}`;
    }
    if (diff4.deletions >= 0) {
      template2.diffRemovedSpan.textContent = `-${diff4.deletions}`;
    }
    return true;
  }
  getIcon(session) {
    return getAgentSessionStatusIcon(session);
  }
  renderDescription(session, template2) {
    const description = session.element.description;
    if (description) {
      this.renderMarkdownOrText(description, template2.description, template2.elementDisposable);
      return true;
    }
    if (session.element.status === 2 /* InProgress */) {
      template2.description.textContent = localize(9178, null);
      return true;
    } else if (session.element.status === 3 /* NeedsInput */) {
      template2.description.textContent = localize(9179, null);
      return true;
    } else if (session.element.status === 0 /* Failed */) {
      template2.description.textContent = localize(9177, null);
      return true;
    }
    template2.description.textContent = "";
    return false;
  }
  toDuration(startTime, endTime, useFullTimeWords, disallowNow) {
    const elapsed = Math.max(
      Math.round((endTime - startTime) / 1e3) * 1e3,
      1e3
      /* clamp to 1s */
    );
    if (!disallowNow && elapsed < 6e4) {
      return localize(9185, null);
    }
    return getDurationString(elapsed, useFullTimeWords);
  }
  renderStatus(session, template2) {
    const repoPrefix = session.element.isPinned() && this.options.isGroupedByRepository?.() ? getRepositoryName(session.element) : void 0;
    const getStatusText = (session2) => {
      let timeLabel;
      if (session2.status === 2 /* InProgress */ && session2.timing.lastRequestStarted) {
        timeLabel = this.toDuration(session2.timing.lastRequestStarted, Date.now(), false, false);
      }
      if (!timeLabel) {
        const date = this.options.isSortedByUpdated?.() ? session2.timing.lastRequestEnded ?? session2.timing.created : session2.timing.created;
        const seconds = Math.round(((/* @__PURE__ */ new Date()).getTime() - date) / 1e3);
        if (seconds < 60) {
          timeLabel = localize(9185, null);
        } else {
          timeLabel = sessionDateFromNow(date, true);
        }
      }
      return repoPrefix ? `${repoPrefix} \xB7 ${timeLabel}` : timeLabel;
    };
    template2.statusTime.textContent = getStatusText(session.element);
    const timer = template2.elementDisposable.add(new IntervalTimer());
    timer.cancelAndSet(
      () => template2.statusTime.textContent = getStatusText(session.element),
      session.element.status === 2 /* InProgress */ ? 1e3 : 60 * 1e3
      /* every minute */
    );
    return true;
  }
  renderHover(session, template2) {
    if (this.options.disableHover) {
      return;
    }
    if (!isSessionInProgressStatus(session.element.status) && session.element.isRead()) {
      return;
    }
    const reducedDelay = session.element.status === 3 /* NeedsInput */;
    template2.elementDisposable.add(
      this.hoverService.setupDelayedHover(template2.element, () => this.buildHoverContent(session.element), { groupId: "agent.sessions", reducedDelay })
    );
  }
  buildHoverContent(session) {
    if (this.sessionHover.value?.session.resource.toString() !== session.resource.toString()) {
      this.sessionHover.value = this.instantiationService.createInstance(AgentSessionHoverWidget, session);
    }
    const widget = this.sessionHover.value;
    let pauseDisposable;
    return {
      id: `agent.session.hover.${session.resource.toString()}`,
      content: widget.domNode,
      style: 1 /* Pointer */,
      onDidShow: () => {
        const previousPauseDisposable = pauseDisposable;
        pauseDisposable = this.options.pauseSessionUpdates?.();
        previousPauseDisposable?.dispose();
        widget.onRendered();
      },
      onDidHide: () => {
        widget.onHidden();
        pauseDisposable?.dispose();
        pauseDisposable = void 0;
      },
      position: {
        hoverPosition: this.options.getHoverPosition()
      }
    };
  }
  renderApprovalRow(session, template2) {
    if (this._approvalModel === void 0) {
      throw new BugIndicatingError("Approval model is required to render approval row");
    }
    const approvalModel = this._approvalModel;
    const initialInfo = approvalModel.getApproval(session.element.resource).get();
    let wasVisible = !!initialInfo;
    template2.approvalRow.classList.toggle("visible", wasVisible);
    const buttonStore = template2.elementDisposable.add(new DisposableStore());
    template2.elementDisposable.add(autorun((reader) => {
      buttonStore.clear();
      const info = approvalModel.getApproval(session.element.resource).read(reader);
      const visible = !!info;
      template2.approvalRow.classList.toggle("visible", visible);
      if (info) {
        const lines = info.label.split("\n");
        const maxLines = AgentSessionRenderer.APPROVAL_ROW_MAX_LINES;
        const visibleLines = lines.slice(0, maxLines);
        if (lines.length > maxLines) {
          visibleLines[maxLines - 1] = `${visibleLines[maxLines - 1]} \u2026`;
        }
        const langId = info.languageId ?? "json";
        const labelContent = new MarkdownString();
        for (const line of visibleLines) {
          labelContent.appendCodeblock(langId, line);
        }
        this.renderMarkdownOrText(labelContent, template2.approvalLabel, buttonStore);
        const fullContent = new MarkdownString().appendCodeblock(info.languageId ?? "json", info.label);
        buttonStore.add(this.hoverService.setupDelayedHover(template2.approvalLabel, {
          content: fullContent,
          style: 1 /* Pointer */,
          position: { hoverPosition: 2 /* BELOW */ }
        }));
        template2.approvalButtonContainer.textContent = "";
        const isActive2 = this._activeSessionResource.read(reader)?.toString() === session.element.resource.toString();
        const button = buttonStore.add(new Button(template2.approvalButtonContainer, {
          title: localize(9176, null),
          secondary: isActive2,
          ...defaultButtonStyles
        }));
        button.label = localize(9175, null);
        buttonStore.add(button.onDidClick(() => info.confirm()));
      }
      if (wasVisible !== visible) {
        wasVisible = visible;
        this._onDidChangeItemHeight.fire(session.element);
      }
    }));
  }
  renderCompressedElements(node, index2, templateData, details) {
    throw new Error("Should never happen since session is incompressible");
  }
  disposeElement(element, index2, template2, details) {
    template2.elementDisposable.clear();
  }
  disposeTemplate(templateData) {
    templateData.disposables.dispose();
  }
};

AgentSessionRenderer = __decorateClass([
  __decorateParam(3, IMarkdownRendererService),
  __decorateParam(4, IProductService),
  __decorateParam(5, IHoverService),
  __decorateParam(6, IInstantiationService),
  __decorateParam(7, IContextKeyService),
  __decorateParam(8, IChatSessionsService),
  __decorateParam(9, IAccessibilityService),
  __decorateParam(10, IVoicePlaybackService)
], AgentSessionRenderer);

function toStatusLabel(status2) {
  let statusLabel;
  switch (status2) {
    case 3 /* NeedsInput */:
      statusLabel = localize(9157, null);
      break;
    case 2 /* InProgress */:
      statusLabel = localize(9155, null);
      break;
    case 0 /* Failed */:
      statusLabel = localize(9154, null);
      break;
    default:
      statusLabel = localize(9153, null);
  }
  return statusLabel;
}

var AgentSessionSectionRenderer = class {
  constructor(sectionOptions, instantiationService, contextKeyService) {
    this.sectionOptions = sectionOptions;
    this.instantiationService = instantiationService;
    this.contextKeyService = contextKeyService;
    this.templateId = AgentSessionSectionRenderer.TEMPLATE_ID;
  }
  static {
    this.TEMPLATE_ID = "agent-session-section";
  }
  renderTemplate(container3) {
    const disposables = new DisposableStore();
    container3.closest(".monaco-list-row")?.classList.add("agent-session-list-row", "agent-session-section-row");
    const elements = h(
      "div.agent-session-section@container",
      [
        h("span.agent-session-section-label@label"),
        h("span.agent-session-section-count@count"),
        h("div.agent-session-section-toolbar@toolbar")
      ]
    );
    const contextKeyService = disposables.add(this.contextKeyService.createScoped(elements.container));
    const scopedInstantiationService = disposables.add(this.instantiationService.createChild(new ServiceCollection([IContextKeyService, contextKeyService])));
    const toolbar = disposables.add(scopedInstantiationService.createInstance(MenuWorkbenchToolBar, elements.toolbar, MenuId.AgentSessionSectionToolbar, {
      menuOptions: { shouldForwardArgs: true }
    }));
    container3.appendChild(elements.container);
    return {
      container: elements.container,
      label: elements.label,
      count: elements.count,
      toolbar,
      contextKeyService,
      disposables
    };
  }
  renderElement(element, index2, template2, details) {
    template2.label.textContent = element.element.label;
    if (this.sectionOptions.hideSectionCount) {
      template2.count.textContent = "";
    } else {
      template2.count.textContent = String(element.element.sessions.length);
    }
    ChatContextKeys.agentSessionSection.bindTo(template2.contextKeyService).set(element.element.section);
    template2.toolbar.context = element.element;
  }
  renderCompressedElements(node, index2, templateData, details) {
    throw new Error("Should never happen since section header is incompressible");
  }
  disposeElement(element, index2, template2, details) {
  }
  disposeTemplate(templateData) {
    templateData.disposables.dispose();
  }
};

AgentSessionSectionRenderer = __decorateClass([
  __decorateParam(1, IInstantiationService),
  __decorateParam(2, IContextKeyService)
], AgentSessionSectionRenderer);

var AgentSessionShowMoreRenderer = class _AgentSessionShowMoreRenderer {
  constructor(options3) {
    this.options = options3;
    this.templateId = _AgentSessionShowMoreRenderer.TEMPLATE_ID;
  }
  static {
    this.TEMPLATE_ID = "agent-session-show-more";
  }
  static {
    this.HEIGHT = 26;
  }
  static {
    this.COLLAPSED_HEIGHT = 1;
  }
  renderTemplate(container3) {
    const disposables = new DisposableStore();
    const elements = h(
      "div.agent-session-show-more@container",
      [h("span.agent-session-show-more-label@label")]
    );
    container3.appendChild(elements.container);
    return {
      container: elements.container,
      label: elements.label,
      disposables
    };
  }
  renderElement(element, _index, template2) {
    template2.label.textContent = this.options?.compactLabel ? localize(9167, null, element.element.remainingCount) : localize(9166, null, element.element.remainingCount);
    template2.container.setAttribute("data-section-label", element.element.sectionLabel);
  }
  renderCompressedElements() {
    throw new Error("Should never happen since show-more is incompressible");
  }
  disposeElement() {
  }
  disposeTemplate(templateData) {
    templateData.disposables.dispose();
  }
};

var AgentSessionShowLessRenderer = class _AgentSessionShowLessRenderer {
  constructor() {
    this.templateId = _AgentSessionShowLessRenderer.TEMPLATE_ID;
  }
  static {
    this.TEMPLATE_ID = "agent-session-show-less";
  }
  static {
    this.HEIGHT = AgentSessionShowMoreRenderer.HEIGHT;
  }
  renderTemplate(container3) {
    const disposables = new DisposableStore();
    const elements = h(
      "div.agent-session-show-more@container",
      [h("span.agent-session-show-more-label@label")]
    );
    container3.appendChild(elements.container);
    return {
      container: elements.container,
      label: elements.label,
      disposables
    };
  }
  renderElement(element, _index, template2) {
    template2.label.textContent = localize(9165, null);
    template2.container.setAttribute("data-section-label", element.element.sectionLabel);
  }
  renderCompressedElements() {
    throw new Error("Should never happen since show-less is incompressible");
  }
  disposeElement() {
  }
  disposeTemplate(templateData) {
    templateData.disposables.dispose();
  }
};

var AgentSessionsListDelegate = class _AgentSessionsListDelegate {
  constructor(_approvalModel, _compactShowMore, _getItemHeight = () => _AgentSessionsListDelegate.ITEM_HEIGHT, _getSectionHeight = () => _AgentSessionsListDelegate.SECTION_HEIGHT) {
    this._approvalModel = _approvalModel;
    this._compactShowMore = _compactShowMore;
    this._getItemHeight = _getItemHeight;
    this._getSectionHeight = _getSectionHeight;
  }
  static {
    this.ITEM_HEIGHT = 54;
  }
  static {
    this.COMPACT_ITEM_HEIGHT = 52;
  }
  static {
    this.SECTION_HEIGHT = 26;
  }
  static {
    this.SPACED_SECTION_HEIGHT = 30;
  }
  getHeight(element) {
    if (isAgentSessionSection(element)) {
      return this._getSectionHeight();
    }
    if (isAgentSessionShowMore(element) || isAgentSessionShowLess(element)) {
      return this._compactShowMore ? AgentSessionShowMoreRenderer.COLLAPSED_HEIGHT : AgentSessionShowMoreRenderer.HEIGHT;
    }
    let height = this._getItemHeight();
    const approval = this._approvalModel?.getApproval(element.resource).get();
    if (approval) {
      height += AgentSessionRenderer.getApprovalRowHeight(approval.label);
    }
    return height;
  }
  hasDynamicHeight(element) {
    if (isAgentSessionShowMore(element) || isAgentSessionShowLess(element)) {
      return true;
    }
    return !!this._approvalModel && isAgentSession(element);
  }
  getTemplateId(element) {
    if (isAgentSessionSection(element)) {
      return AgentSessionSectionRenderer.TEMPLATE_ID;
    }
    if (isAgentSessionShowMore(element)) {
      return AgentSessionShowMoreRenderer.TEMPLATE_ID;
    }
    if (isAgentSessionShowLess(element)) {
      return AgentSessionShowLessRenderer.TEMPLATE_ID;
    }
    return AgentSessionRenderer.TEMPLATE_ID;
  }
};

var AgentSessionsAccessibilityProvider = class {
  getWidgetRole() {
    return "list";
  }
  getRole(element) {
    return "listitem";
  }
  getWidgetAriaLabel() {
    return localize(9158, null);
  }
  getAriaLabel(element) {
    if (isAgentSessionSection(element)) {
      const count2 = element.sessions.length;
      if (count2 === 1) {
        return localize(9172, null, element.label, count2);
      }
      return localize(9171, null, element.label, count2);
    }
    if (isAgentSessionShowMore(element)) {
      return localize(9174, null, element.remainingCount);
    }
    if (isAgentSessionShowLess(element)) {
      return localize(9173, null);
    }
    return localize(9156, null, element.providerLabel, element.label, toStatusLabel(element.status), new Date(element.timing.created).toLocaleString());
  }
};

var AgentSessionsDataSource = class _AgentSessionsDataSource extends Disposable {
  constructor(filter2, sorter3, repositoryGroupLimit) {
    super();
    this.filter = filter2;
    this.sorter = sorter3;
    this.repositoryGroupLimit = repositoryGroupLimit;
    this._onDidGetChildren = this._register(new Emitter());
    this.onDidGetChildren = this._onDidGetChildren.event;
    this._onDidExpandRepositoryGroup = this._register(new Emitter());
    this.onDidExpandRepositoryGroup = this._onDidExpandRepositoryGroup.event;
    this.expandedRepositoryGroups = /* @__PURE__ */ new Set();
    if (this.filter) {
      let previousCapped = this.filter.getExcludes().repositoryGroupCapped;
      this._register(this.filter.onDidChange(() => {
        const currentCapped = this.filter.getExcludes().repositoryGroupCapped;
        if (currentCapped && !previousCapped) {
          this.expandedRepositoryGroups.clear();
        }
        previousCapped = currentCapped;
      }));
    }
  }
  static {
    this.CAPPED_SESSIONS_LIMIT = 3;
  }
  static {
    this.REPOSITORY_GROUP_LIMIT = 5;
  }
  expandRepositoryGroup(sectionLabel) {
    this.expandedRepositoryGroups.add(sectionLabel);
    this._onDidExpandRepositoryGroup.fire();
  }
  collapseRepositoryGroup(sectionLabel) {
    this.expandedRepositoryGroups.delete(sectionLabel);
    this._onDidExpandRepositoryGroup.fire();
  }
  hasChildren(element) {
    if (isAgentSessionsModel(element)) {
      return true;
    } else if (isAgentSessionSection(element)) {
      return element.sessions.length > 0;
    } else {
      return false;
    }
  }
  getChildren(element) {
    if (isAgentSessionsModel(element)) {
      let filteredSessions = element.sessions.filter((session) => !this.filter?.exclude(session));
      const limitResultsCount = this.filter?.limitResults?.();
      if (!this.filter?.groupResults?.() || typeof limitResultsCount === "number") {
        filteredSessions.sort(this.sorter.compare.bind(this.sorter));
      }
      if (typeof limitResultsCount === "number") {
        filteredSessions = filteredSessions.slice(0, limitResultsCount);
      }
      this.filter?.notifyResults?.(filteredSessions.length);
      this._onDidGetChildren.fire(filteredSessions.length);
      if (this.filter?.groupResults?.()) {
        return this.groupSessionsIntoSections(filteredSessions);
      }
      return filteredSessions;
    } else if (isAgentSessionSection(element)) {
      const isCappingEnabled = this.repositoryGroupLimit && this.filter?.getExcludes().repositoryGroupCapped;
      if (isCappingEnabled && element.section === "repository" /* Repository */ && element.sessions.length > this.repositoryGroupLimit) {
        if (!this.expandedRepositoryGroups.has(element.label)) {
          const visible = element.sessions.slice(0, this.repositoryGroupLimit);
          const remainingCount = element.sessions.length - this.repositoryGroupLimit;
          return [...visible, { showMore: true, sectionLabel: element.label, remainingCount }];
        } else {
          return [...element.sessions, { showLess: true, sectionLabel: element.label }];
        }
      }
      return element.sessions;
    } else {
      return [];
    }
  }
  groupSessionsIntoSections(sessions) {
    const isCapped = this.filter?.groupResults?.() === "capped" /* Capped */;
    const sorter3 = this.sorter;
    const sortedSessions = sorter3 instanceof AgentSessionsSorter ? sessions.sort((a, b) => sorter3.compare(
      a,
      b,
      true
      /* prioritize active sessions to keep in-progress/needs-input ones top within each group */
    )) : sessions.sort(sorter3.compare.bind(sorter3));
    if (isCapped) {
      if (this.filter?.getExcludes().read) {
        return sortedSessions;
      }
      return this.groupSessionsCapped(sortedSessions);
    } else if (this.filter?.groupResults?.() === "repository" /* Repository */) {
      return this.groupSessionsByRepository(sortedSessions);
    } else {
      return this.groupSessionsByDate(sortedSessions);
    }
  }
  groupSessionsCapped(sortedSessions) {
    const result = [];
    const firstArchivedIndex = sortedSessions.findIndex((session) => session.isArchived());
    const nonArchivedCount = firstArchivedIndex === -1 ? sortedSessions.length : firstArchivedIndex;
    const nonArchivedSessions = sortedSessions.slice(0, nonArchivedCount);
    const archivedSessions = sortedSessions.slice(nonArchivedCount);
    const pinnedSessions = nonArchivedSessions.filter((session) => session.isPinned());
    const unpinnedSessions = nonArchivedSessions.filter((session) => !session.isPinned());
    const topUnpinned = unpinnedSessions.slice(0, _AgentSessionsDataSource.CAPPED_SESSIONS_LIMIT);
    const remainingUnpinned = unpinnedSessions.slice(_AgentSessionsDataSource.CAPPED_SESSIONS_LIMIT);
    result.push(...pinnedSessions, ...topUnpinned);
    const othersSessions = [...remainingUnpinned, ...archivedSessions];
    if (othersSessions.length > 0) {
      result.push({
        section: "more" /* More */,
        label: AgentSessionSectionLabels["more" /* More */],
        sessions: othersSessions
      });
    }
    return result;
  }
  groupSessionsByDate(sortedSessions) {
    const result = [];
    const sortBy = this.filter?.sortResults?.();
    const groupedSessions = groupAgentSessionsByDate(sortedSessions, sortBy);
    for (const { sessions, section, label: label3 } of groupedSessions.values()) {
      if (sessions.length === 0) {
        continue;
      }
      result.push({ section, label: label3, sessions });
    }
    return result;
  }
  groupSessionsByRepository(sortedSessions) {
    const repoMap = /* @__PURE__ */ new Map();
    const pinnedSessions = [];
    const archivedSessions = [];
    const otherSessions = [];
    for (const session of sortedSessions) {
      if (session.isArchived()) {
        archivedSessions.push(session);
        continue;
      }
      if (session.isPinned()) {
        pinnedSessions.push(session);
        continue;
      }
      const repoName = getRepositoryName(session);
      if (repoName) {
        let group2 = repoMap.get(repoName);
        if (!group2) {
          group2 = { label: repoName, sessions: [] };
          repoMap.set(repoName, group2);
        }
        group2.sessions.push(session);
      } else {
        otherSessions.push(session);
      }
    }
    const result = [];
    result.push(...pinnedSessions);
    const sortedRepoGroups = [...repoMap.values()].sort((a, b) => compareIgnoreCase(a.label, b.label));
    for (const { label: label3, sessions } of sortedRepoGroups) {
      result.push({
        section: "repository" /* Repository */,
        label: label3,
        sessions
      });
    }
    if (otherSessions.length > 0) {
      result.push({
        section: "repository" /* Repository */,
        label: AgentSessionSectionLabels["repository" /* Repository */],
        sessions: otherSessions
      });
    }
    if (archivedSessions.length > 0) {
      result.push({
        section: "archived" /* Archived */,
        label: AgentSessionSectionLabels["archived" /* Archived */],
        sessions: archivedSessions
      });
    }
    return result;
  }
};

function getRepositoryName(session) {
  const metadata = session.metadata;
  if (metadata) {
    const remoteAgentHost = metadata.remoteAgentHost;
    if (remoteAgentHost) {
      const workingDir = metadata.workingDirectoryPath;
      if (workingDir) {
        const folderName = extractRepoNameFromPath(workingDir);
        if (folderName) {
          return `${folderName} [${remoteAgentHost}]`;
        }
      }
      return remoteAgentHost;
    }
    const owner = metadata.owner;
    const name = metadata.name;
    if (owner && name) {
      return name;
    }
    const nwo = metadata.repositoryNwo;
    if (nwo && nwo.includes("/")) {
      return nwo.split("/").pop();
    }
    const repository = metadata.repository;
    if (repository) {
      const repoName = parseRepositoryName(repository);
      if (repoName) {
        return repoName;
      }
    }
    const repositoryUrl = metadata.repositoryUrl;
    if (repositoryUrl) {
      const repoName = parseRepositoryName(repositoryUrl);
      if (repoName) {
        return repoName;
      }
    }
    const repositoryPath = metadata.repositoryPath;
    if (repositoryPath) {
      const repoName = extractRepoNameFromPath(repositoryPath);
      if (repoName) {
        return repoName;
      }
    }
    const worktreePath = metadata.worktreePath;
    if (worktreePath) {
      const repoName = extractRepoNameFromPath(worktreePath);
      if (repoName) {
        return repoName;
      }
    }
    const workingDirectoryPath = metadata.workingDirectoryPath;
    if (workingDirectoryPath) {
      const repoName = extractRepoNameFromPath(workingDirectoryPath);
      if (repoName) {
        return repoName;
      }
    }
  }
  const badge = session.badge;
  if (badge) {
    const raw = typeof badge === "string" ? badge : badge.value;
    const badgeMatch = raw.match(/\$\((?:repo|folder|worktree)\)\s*(.+)/);
    if (badgeMatch) {
      return badgeMatch[1].trim();
    }
  }
  return void 0;
}

function parseRepositoryName(value2) {
  if (value2.includes("/") && !value2.includes("://") && !value2.startsWith("git@")) {
    let repoSegment = value2.split("/").filter(Boolean).pop();
    if (repoSegment?.endsWith(".git")) {
      repoSegment = repoSegment.slice(0, -4);
    }
    return repoSegment || void 0;
  }
  try {
    const url = new URL(value2);
    const parts = url.pathname.split("/").filter(Boolean);
    if (parts.length >= 2) {
      let repoSegment = parts[1];
      if (repoSegment.endsWith(".git")) {
        repoSegment = repoSegment.slice(0, -4);
      }
      return repoSegment || void 0;
    }
  } catch {
  }
  if (value2.startsWith("git@")) {
    const colonIndex = value2.indexOf(":");
    if (colonIndex !== -1 && colonIndex < value2.length - 1) {
      const pathPart = value2.substring(colonIndex + 1);
      let repoSegment = pathPart.split("/").filter(Boolean).pop();
      if (repoSegment?.endsWith(".git")) {
        repoSegment = repoSegment.slice(0, -4);
      }
      return repoSegment || void 0;
    }
  }
  return void 0;
}

function extractRepoNameFromPath(dirPath) {
  const segments = dirPath.split(/[/\\]/).filter(Boolean);
  if (segments.length < 2) {
    return segments[0];
  }
  const parent = segments[segments.length - 2];
  if (parent.endsWith(".worktrees")) {
    return parent.slice(0, -".worktrees".length) || void 0;
  }
  return segments[segments.length - 1];
}

var AgentSessionSectionLabels = {
  ["pinned" /* Pinned */]: localize(9164, null),
  ["today" /* Today */]: localize(9168, null),
  ["yesterday" /* Yesterday */]: localize(9170, null),
  ["week" /* Week */]: localize(9169, null),
  ["older" /* Older */]: localize(9163, null),
  ["archived" /* Archived */]: localize(9159, null),
  ["more" /* More */]: localize(9161, null),
  ["repository" /* Repository */]: localize(9162, null)
};

var DAY_THRESHOLD = 24 * 60 * 60 * 1e3;

var WEEK_THRESHOLD = 7 * DAY_THRESHOLD;

function groupAgentSessionsByDate(sessions, sortBy) {
  const now = Date.now();
  const startOfToday = new Date(now).setHours(0, 0, 0, 0);
  const startOfYesterday = startOfToday - DAY_THRESHOLD;
  const weekThreshold = now - WEEK_THRESHOLD;
  const pinnedSessions = [];
  const todaySessions = [];
  const yesterdaySessions = [];
  const weekSessions = [];
  const olderSessions = [];
  const archivedSessions = [];
  for (const session of sessions) {
    if (session.isArchived()) {
      archivedSessions.push(session);
    } else if (session.isPinned()) {
      pinnedSessions.push(session);
    } else {
      const sessionTime = sortBy === "updated" /* Updated */ ? session.timing.lastRequestEnded ?? session.timing.created : session.timing.created;
      if (sessionTime >= startOfToday) {
        todaySessions.push(session);
      } else if (sessionTime >= startOfYesterday) {
        yesterdaySessions.push(session);
      } else if (sessionTime >= weekThreshold) {
        weekSessions.push(session);
      } else {
        olderSessions.push(session);
      }
    }
  }
  return /* @__PURE__ */ new Map([
    ["pinned" /* Pinned */, { section: "pinned" /* Pinned */, label: AgentSessionSectionLabels["pinned" /* Pinned */], sessions: pinnedSessions }],
    ["today" /* Today */, { section: "today" /* Today */, label: AgentSessionSectionLabels["today" /* Today */], sessions: todaySessions }],
    ["yesterday" /* Yesterday */, { section: "yesterday" /* Yesterday */, label: AgentSessionSectionLabels["yesterday" /* Yesterday */], sessions: yesterdaySessions }],
    ["week" /* Week */, { section: "week" /* Week */, label: AgentSessionSectionLabels["week" /* Week */], sessions: weekSessions }],
    ["older" /* Older */, { section: "older" /* Older */, label: AgentSessionSectionLabels["older" /* Older */], sessions: olderSessions }],
    ["archived" /* Archived */, { section: "archived" /* Archived */, label: AgentSessionSectionLabels["archived" /* Archived */], sessions: archivedSessions }]
  ]);
}

function sessionDateFromNow(sessionTime, appendAgoLabel) {
  const now = Date.now();
  const startOfToday = new Date(now).setHours(0, 0, 0, 0);
  const startOfYesterday = startOfToday - DAY_THRESHOLD;
  const startOfTwoDaysAgo = startOfYesterday - DAY_THRESHOLD;
  if (sessionTime < startOfToday && sessionTime >= startOfYesterday) {
    return appendAgoLabel ? localize(9183, null) : localize(9182, null);
  }
  if (sessionTime < startOfYesterday && sessionTime >= startOfTwoDaysAgo) {
    return appendAgoLabel ? localize(9181, null) : localize(9180, null);
  }
  return fromNow(sessionTime, appendAgoLabel);
}

var AgentSessionsIdentityProvider = class {
  getId(element) {
    if (isAgentSessionSection(element)) {
      return `section-${element.section}-${element.label}`;
    }
    if (isAgentSessionShowMore(element)) {
      return `show-more-${element.sectionLabel}`;
    }
    if (isAgentSessionShowLess(element)) {
      return `show-less-${element.sectionLabel}`;
    }
    if (isAgentSession(element)) {
      return element.resource.toString();
    }
    return "agent-sessions-id";
  }
  getGroupId(element) {
    if (isAgentSessionSection(element) || isAgentSessionsModel(element)) {
      return NotSelectableGroupId;
    }
    return 1;
  }
};

var AgentSessionsCompressionDelegate = class {
  isIncompressible(element) {
    return true;
  }
};

var AgentSessionsSorter = class {
  constructor(getSortBy) {
    this.getSortBy = getSortBy ?? (() => "created" /* Created */);
  }
  compare(sessionA, sessionB, prioritizeActiveSessions = false) {
    if (prioritizeActiveSessions) {
      const aNeedsInput = sessionA.status === 3 /* NeedsInput */;
      const bNeedsInput = sessionB.status === 3 /* NeedsInput */;
      if (aNeedsInput && !bNeedsInput) {
        return -1;
      }
      if (!aNeedsInput && bNeedsInput) {
        return 1;
      }
    }
    const aArchived = sessionA.isArchived();
    const bArchived = sessionB.isArchived();
    if (!aArchived && bArchived) {
      return -1;
    }
    if (aArchived && !bArchived) {
      return 1;
    }
    const aPinned = !aArchived && sessionA.isPinned();
    const bPinned = !bArchived && sessionB.isPinned();
    if (aPinned && !bPinned) {
      return -1;
    }
    if (!aPinned && bPinned) {
      return 1;
    }
    const sortBy = this.getSortBy();
    const timeA = sortBy === "updated" /* Updated */ ? prioritizeActiveSessions ? sessionA.timing.lastRequestStarted ?? sessionA.timing.created : sessionA.timing.lastRequestEnded ?? sessionA.timing.created : sessionA.timing.created;
    const timeB = sortBy === "updated" /* Updated */ ? prioritizeActiveSessions ? sessionB.timing.lastRequestStarted ?? sessionB.timing.created : sessionB.timing.lastRequestEnded ?? sessionB.timing.created : sessionB.timing.created;
    return timeB - timeA;
  }
};

var AgentSessionsKeyboardNavigationLabelProvider = class {
  getKeyboardNavigationLabel(element) {
    if (isAgentSessionSection(element)) {
      return element.label;
    }
    if (isAgentSessionShowMore(element)) {
      return element.sectionLabel;
    }
    if (isAgentSessionShowLess(element)) {
      return element.sectionLabel;
    }
    return element.label;
  }
  getCompressedNodeKeyboardNavigationLabel(elements) {
    return void 0;
  }
};

var AgentSessionsDragAndDrop = class extends Disposable {
  constructor(instantiationService) {
    super();
    this.instantiationService = instantiationService;
  }
  onDragStart(data, originalEvent) {
    const elements = data.getData().filter((e) => isAgentSession(e));
    const uris = coalesce(elements.map((e) => e.resource));
    this.instantiationService.invokeFunction((accessor) => fillEditorsDragData(accessor, uris, originalEvent));
  }
  getDragURI(element) {
    if (isAgentSessionSection(element) || isAgentSessionShowMore(element) || isAgentSessionShowLess(element)) {
      return null;
    }
    return element.resource.toString();
  }
  getDragLabel(elements, originalEvent) {
    const sessions = elements.filter((e) => isAgentSession(e));
    if (sessions.length === 1) {
      return sessions[0].label;
    }
    return localize(9160, null, sessions.length);
  }
  onDragOver(data, targetElement, targetIndex, targetSector, originalEvent) {
    return false;
  }
  drop(data, targetElement, targetIndex, targetSector, originalEvent) {
  }
};

AgentSessionsDragAndDrop = __decorateClass([
  __decorateParam(0, IInstantiationService)
], AgentSessionsDragAndDrop);
export { getAgentSessionStatusIcon, toStatusLabel, getRepositoryName, parseRepositoryName, extractRepoNameFromPath, groupAgentSessionsByDate, sessionDateFromNow, AgentSessionStatusIcon, AgentSessionRenderer, AgentSessionSectionRenderer, AgentSessionShowMoreRenderer, AgentSessionShowLessRenderer, AgentSessionsListDelegate, AgentSessionsAccessibilityProvider, AgentSessionsDataSource, AgentSessionSectionLabels, DAY_THRESHOLD, WEEK_THRESHOLD, AgentSessionsIdentityProvider, AgentSessionsCompressionDelegate, AgentSessionsSorter, AgentSessionsKeyboardNavigationLabelProvider, AgentSessionsDragAndDrop };
