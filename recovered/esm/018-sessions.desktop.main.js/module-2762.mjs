// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/chatStatus/chatStatusDashboard.ts
import { product_default } from "./module-0139.mjs";
import { DomWidget } from "./module-2760.mjs";
import { $, EventHelper, EventType, addDisposableListener, append, disposableWindowInterval, getWindow } from "./module-0075.mjs";
import { safeIntl } from "./module-0120.mjs";
import { language } from "./module-0014.mjs";
import { cancelOnDispose } from "./module-0025.mjs";
import { IChatEntitlementService, getChatPlanName, getQuotaReset, getQuotaUsage } from "./module-0954.mjs";
import { toAction } from "./module-0082.mjs";
import { localize } from "./module-0001.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { Codicon } from "./module-0085.mjs";
import { URI } from "./module-0032.mjs";
import { GitHubPaths, IDefaultAccountService } from "./module-0741.mjs";
import { Button } from "./module-0546.mjs";
import { defaultButtonStyles, defaultCheckboxStyles, defaultSelectBoxStyles } from "./module-0513.mjs";
import { IHoverService, nativeHoverDelegate } from "./module-0520.mjs";
import { isCompletionsEnabled } from "./module-0207.mjs";
import { MarkdownString } from "./module-0462.mjs";
import { DisposableStore, MutableDisposable } from "./module-0012.mjs";
import { isNewUser } from "./module-2761.mjs";
import { SelectBox } from "./module-0475.mjs";
import { ActionBar } from "./module-0477.mjs";
import { parseLinkedText } from "./module-1328.mjs";
import { renderLabelWithIcons } from "./module-0467.mjs";
import { Link } from "./module-0550.mjs";
import { isObject } from "./module-0010.mjs";
import { Checkbox, TriStateCheckbox } from "./module-0549.mjs";
import { EventType2, Gesture } from "./module-0251.mjs";
import { Sequencer } from "./module-0036.mjs";
import { IConfigurationService, getConfigValueInTarget } from "./module-0132.mjs";
import { EditorResourceAccessor } from "./module-0926.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IChatStatusItemService } from "./module-1457.mjs";
import { ICommandService } from "./module-0087.mjs";
import { IEditorService } from "./module-0935.mjs";
import { ILanguageService } from "./module-0133.mjs";
import { IOpenerService } from "./module-0272.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { ITextResourceConfigurationService } from "./module-0204.mjs";
import { IInlineCompletionsService } from "./module-0738.mjs";
import { IMarkdownRendererService } from "./module-0541.mjs";
import { ILanguageFeaturesService } from "./module-0205.mjs";
import { IContextViewService } from "./module-0488.mjs";
import { IStorageService } from "./module-0512.mjs";
import { INotificationService } from "./module-0336.mjs";


// src/vs/workbench/contrib/chat/browser/chatStatus/chatStatusDashboard.ts
var defaultChat7 = product_default.defaultChatAgent;

var completionsConfigurationTargets = [
  6 /* WORKSPACE_FOLDER */,
  5 /* WORKSPACE */,
  4 /* USER_REMOTE */,
  3 /* USER_LOCAL */,
  1 /* APPLICATION */
];

var ChatStatusDashboard = class extends DomWidget {
  constructor(options3, chatEntitlementService, chatStatusItemService, commandService, configurationService, editorService, hoverService, languageService, openerService, telemetryService, textResourceConfigurationService, inlineCompletionsService, markdownRendererService, languageFeaturesService, contextViewService, storageService, defaultAccountService, notificationService) {
    super();
    this.options = options3;
    this.chatEntitlementService = chatEntitlementService;
    this.chatStatusItemService = chatStatusItemService;
    this.commandService = commandService;
    this.configurationService = configurationService;
    this.editorService = editorService;
    this.hoverService = hoverService;
    this.languageService = languageService;
    this.openerService = openerService;
    this.telemetryService = telemetryService;
    this.textResourceConfigurationService = textResourceConfigurationService;
    this.inlineCompletionsService = inlineCompletionsService;
    this.markdownRendererService = markdownRendererService;
    this.languageFeaturesService = languageFeaturesService;
    this.contextViewService = contextViewService;
    this.storageService = storageService;
    this.defaultAccountService = defaultAccountService;
    this.notificationService = notificationService;
    this.element = $("div.chat-status-bar-entry-tooltip");
    this.dateFormatter = safeIntl.DateTimeFormat(language, { month: "short", day: "numeric" });
    this.timeFormatter = safeIntl.DateTimeFormat(language, { hour: "numeric", minute: "numeric" });
    this.quotaPercentageFormatter = safeIntl.NumberFormat(void 0, { maximumFractionDigits: 0, minimumFractionDigits: 0 });
    this.quotaCreditsFormatter = safeIntl.NumberFormat(language, { maximumFractionDigits: 2, minimumFractionDigits: 0 });
    this.render();
  }
  static {
    this.QUICK_SETTINGS_COLLAPSED_KEY = "chatStatusDashboard.quickSettingsCollapsed";
  }
  render() {
    const token = cancelOnDispose(this._store);
    const { chat, premiumChat, completions } = this.chatEntitlementService.quotas;
    const hasQuotas = !!(chat || premiumChat);
    const isAnonymousWithSentiment = this.chatEntitlementService.anonymous && this.chatEntitlementService.sentiment.completed;
    const isPooledQuotaDepleted = premiumChat?.unlimited && premiumChat.hasQuota === false;
    const hasUsageSection = hasQuotas || isAnonymousWithSentiment;
    const hasVisibleUsageContent = chat?.unlimited === false || premiumChat?.unlimited === false || !this.options?.compactQuotaLayout && completions?.unlimited === false || isAnonymousWithSentiment || isPooledQuotaDepleted;
    const contributedEntries = [...this.chatStatusItemService.getEntries()];
    const hasQuickSettingsContent = !this.options?.disableInlineSuggestionsSettings || !this.options?.disableModelSelection || !this.options?.disableProviderOptions || !this.options?.disableCompletionsSnooze;
    let headerAdditionalSpendButton;
    let headerUpgradeButton;
    if (hasUsageSection && !this.options?.compactQuotaLayout) {
      const planName = getChatPlanName(this.chatEntitlementService.entitlement);
      const headerHost = this.options?.titleHeaderContainer ?? this.element;
      const header2 = this.renderHeader(headerHost, this._store, planName, toAction({
        id: "workbench.action.manageCopilot",
        label: localize(11257, null),
        tooltip: localize(11264, null),
        class: ThemeIcon.asClassName(Codicon.settings),
        run: () => this.runCommandAndClose(() => this.openerService.open(URI.parse(this.defaultAccountService.resolveGitHubUrl(GitHubPaths.copilotSettings))))
      }));
      const canConfigureAdditionalSpend = this.chatEntitlementService.entitlement === 10 /* EDU */ || this.chatEntitlementService.entitlement === 6 /* Pro */ || this.chatEntitlementService.entitlement === 7 /* ProPlus */ || this.chatEntitlementService.entitlement === 11 /* Max */;
      const showUpgrade = this.chatEntitlementService.quotas.canUpgradePlan ?? false;
      const actionBarElement = header2.lastElementChild;
      if (canConfigureAdditionalSpend) {
        headerAdditionalSpendButton = this._store.add(new Button(header2, { ...defaultButtonStyles, hoverDelegate: nativeHoverDelegate, secondary: true }));
        headerAdditionalSpendButton.element.classList.add("header-cta-button");
        headerAdditionalSpendButton.label = localize(11241, null);
        this._store.add(headerAdditionalSpendButton.onDidClick(() => {
          this.telemetryService.publicLog2("workbenchActionExecuted", { id: "workbench.action.chat.manageAdditionalSpend", from: "chat-status" });
          this.runCommandAndClose(() => this.openerService.open(URI.parse(this.defaultAccountService.resolveGitHubUrl(GitHubPaths.billingBudgets))));
        }));
        if (actionBarElement) {
          header2.insertBefore(headerAdditionalSpendButton.element, actionBarElement);
        }
      }
      if (showUpgrade) {
        headerUpgradeButton = this._store.add(new Button(header2, { ...defaultButtonStyles, hoverDelegate: nativeHoverDelegate }));
        headerUpgradeButton.element.classList.add("header-cta-button");
        headerUpgradeButton.label = localize(11277, null);
        this._store.add(headerUpgradeButton.onDidClick(() => this.runCommandAndClose("workbench.action.chat.upgradePlan")));
        if (actionBarElement) {
          header2.insertBefore(headerUpgradeButton.element, actionBarElement);
        }
      }
    }
    if (hasUsageSection && this.options?.compactQuotaLayout && this.options.ctaButtonsContainer) {
      const ctaContainer = this.options.ctaButtonsContainer;
      const canConfigureAdditionalSpend = this.chatEntitlementService.entitlement === 10 /* EDU */ || this.chatEntitlementService.entitlement === 6 /* Pro */ || this.chatEntitlementService.entitlement === 7 /* ProPlus */ || this.chatEntitlementService.entitlement === 11 /* Max */;
      const showUpgrade = this.chatEntitlementService.quotas.canUpgradePlan ?? false;
      if (canConfigureAdditionalSpend) {
        headerAdditionalSpendButton = this._store.add(new Button(ctaContainer, { ...defaultButtonStyles, hoverDelegate: nativeHoverDelegate, secondary: true }));
        headerAdditionalSpendButton.label = localize(11241, null);
        this._store.add(headerAdditionalSpendButton.onDidClick(() => {
          this.telemetryService.publicLog2("workbenchActionExecuted", { id: "workbench.action.chat.manageAdditionalSpend", from: "chat-status" });
          this.runCommandAndClose(() => this.openerService.open(URI.parse(this.defaultAccountService.resolveGitHubUrl(GitHubPaths.billingBudgets))));
        }));
      }
      if (showUpgrade) {
        headerUpgradeButton = this._store.add(new Button(ctaContainer, { ...defaultButtonStyles, hoverDelegate: nativeHoverDelegate }));
        headerUpgradeButton.label = localize(11277, null);
        this._store.add(headerUpgradeButton.onDidClick(() => this.runCommandAndClose("workbench.action.chat.upgradePlan")));
      }
    }
    if (this.options?.compactQuotaLayout) {
      this.element.classList.add("compact");
    }
    const updatePromise = this.chatEntitlementService.update(token);
    if (hasVisibleUsageContent) {
      this.renderUsageContent(this.element, token, headerAdditionalSpendButton, headerUpgradeButton, updatePromise);
    }
    const hasPremiumUnlimited = !!premiumChat?.unlimited;
    const premiumChatUsage = getQuotaUsage(premiumChat);
    if (premiumChatUsage?.kind === 1 /* CreditsUsed */) {
      this.createCreditsUsedIndicator(this.element, premiumChatUsage.creditsUsed, this.formatQuotaResetLabel(premiumChat));
    } else if (hasPremiumUnlimited) {
      const includedTitle = this.chatEntitlementService.quotas.usageBasedBilling ? localize(11236, null) : localize(11235, null);
      const getIncludedDescription = () => {
        if (isPooledQuotaDepleted) {
          return {
            compact: localize(11247, null, includedTitle),
            default: localize(11246, null)
          };
        }
        return {
          compact: localize(11245, null, includedTitle),
          default: localize(11244, null)
        };
      };
      const includedDescription = getIncludedDescription();
      const includedContainer = this.element.appendChild($("div.quota-indicator.included"));
      if (this.options?.compactQuotaLayout) {
        const planName = getChatPlanName(this.chatEntitlementService.entitlement);
        includedContainer.classList.add("compact");
        includedContainer.appendChild($("div.quota-title", void 0, planName));
        includedContainer.appendChild($("div.description", void 0, includedDescription.compact));
      } else {
        includedContainer.appendChild($("div.quota-title", void 0, includedTitle));
        includedContainer.appendChild($("div.description", void 0, includedDescription.default));
      }
    }
    if (hasQuickSettingsContent) {
      const hasContentAbove = hasUsageSection || hasVisibleUsageContent || hasPremiumUnlimited;
      this.renderInlineSuggestionsSection(hasContentAbove);
    }
    if (contributedEntries.length > 0) {
      this.renderContributedSections(contributedEntries);
    }
    this.renderSetupSection();
  }
  renderUsageContent(container2, token, headerAdditionalSpendButton, headerUpgradeButton, updatePromise) {
    const { chat: chatQuota, completions: completionsQuota, premiumChat: premiumChatQuota } = this.chatEntitlementService.quotas;
    const compact2 = !!this.options?.compactQuotaLayout;
    const planName = compact2 ? getChatPlanName(this.chatEntitlementService.entitlement) : void 0;
    if (chatQuota || premiumChatQuota || completionsQuota) {
      const globalCalloutUpdater = this.createGlobalQuotaCallout(container2);
      const { calloutVisible: initialCalloutVisible } = globalCalloutUpdater();
      if (headerAdditionalSpendButton) {
        headerAdditionalSpendButton.element.style.display = initialCalloutVisible ? "" : "none";
      }
      if (headerUpgradeButton) {
        headerUpgradeButton.element.style.display = headerAdditionalSpendButton && initialCalloutVisible ? "none" : "";
      }
      let chatQuotaIndicator;
      if (chatQuota && !chatQuota.unlimited && (!this.chatEntitlementService.quotas.usageBasedBilling || this.chatEntitlementService.entitlement === 5 /* Free */)) {
        const chatLabel = this.chatEntitlementService.quotas.usageBasedBilling && this.chatEntitlementService.entitlement === 5 /* Free */ ? localize(11227, null) : localize(11219, null);
        chatQuotaIndicator = this.createQuotaIndicator(container2, chatQuota, chatLabel, this.formatQuotaResetLabel(chatQuota), compact2 ? planName : void 0);
      }
      let premiumChatQuotaIndicator;
      if (premiumChatQuota && !premiumChatQuota.unlimited && premiumChatQuota.percentRemaining >= 0) {
        const isUBB = this.chatEntitlementService.quotas.usageBasedBilling;
        const premiumChatLabel = isUBB ? localize(11227, null) : this.chatEntitlementService.quotas.additionalUsageEnabled ? localize(11234, null) : localize(11243, null);
        premiumChatQuotaIndicator = this.createQuotaIndicator(container2, premiumChatQuota, premiumChatLabel, this.formatQuotaResetLabel(premiumChatQuota), compact2 ? planName : void 0);
      }
      let additionalBudgetIndicator;
      let additionalBudgetElement;
      const initialOverageEntitlement = this.chatEntitlementService.quotas.additionalUsageEntitlement ?? 0;
      if (initialOverageEntitlement > 0) {
        const overageCount = this.chatEntitlementService.quotas.additionalUsageCount ?? 0;
        const overagePercentRemaining = Math.max(0, Math.min(100, (initialOverageEntitlement - overageCount) / initialOverageEntitlement * 100));
        const overageSnapshot = {
          percentRemaining: overagePercentRemaining,
          unlimited: false,
          entitlement: initialOverageEntitlement,
          quotaRemaining: Math.max(0, initialOverageEntitlement - overageCount),
          resetAt: premiumChatQuota?.resetAt
        };
        const additionalBudgetLabel = localize(11217, null);
        additionalBudgetIndicator = this.createQuotaIndicator(container2, overageSnapshot, additionalBudgetLabel, this.formatQuotaResetLabel(overageSnapshot), compact2 ? additionalBudgetLabel : void 0);
        additionalBudgetElement = container2.lastElementChild;
        const isPremiumExhausted = premiumChatQuota && premiumChatQuota.percentRemaining <= 0;
        if (!isPremiumExhausted) {
          additionalBudgetElement.classList.add("muted");
        }
      }
      let completionsQuotaIndicator;
      const showCompletions = !compact2 && completionsQuota && !completionsQuota.unlimited && completionsQuota.percentRemaining >= 0 && (!this.chatEntitlementService.quotas.usageBasedBilling || this.chatEntitlementService.entitlement === 5 /* Free */);
      if (showCompletions) {
        completionsQuotaIndicator = this.createQuotaIndicator(container2, completionsQuota, localize(11226, null), this.formatQuotaResetLabel(completionsQuota), compact2 ? planName : void 0);
      }
      const updateIndicators = () => {
        const { chat: chatQuota2, premiumChat: premiumChatQuota2, completions: completionsQuota2 } = this.chatEntitlementService.quotas;
        if (chatQuota2) {
          chatQuotaIndicator?.(chatQuota2);
        }
        if (premiumChatQuota2) {
          premiumChatQuotaIndicator?.(premiumChatQuota2);
        }
        if (completionsQuota2) {
          completionsQuotaIndicator?.(completionsQuota2);
        }
        if (additionalBudgetIndicator && additionalBudgetElement) {
          const overageEntitlement = this.chatEntitlementService.quotas.additionalUsageEntitlement ?? 0;
          const overageCount = this.chatEntitlementService.quotas.additionalUsageCount ?? 0;
          if (overageEntitlement > 0) {
            const overagePercentRemaining = Math.max(0, Math.min(100, (overageEntitlement - overageCount) / overageEntitlement * 100));
            additionalBudgetIndicator({
              percentRemaining: overagePercentRemaining,
              unlimited: false,
              entitlement: overageEntitlement,
              quotaRemaining: Math.max(0, overageEntitlement - overageCount)
            });
          }
          const premiumExhausted = premiumChatQuota2 && premiumChatQuota2.percentRemaining <= 0;
          additionalBudgetElement.classList.toggle("muted", !premiumExhausted);
        }
        const { calloutVisible } = globalCalloutUpdater();
        if (headerAdditionalSpendButton) {
          headerAdditionalSpendButton.element.style.display = calloutVisible ? "" : "none";
          headerAdditionalSpendButton.label = localize(11241, null);
        }
        if (headerUpgradeButton) {
          headerUpgradeButton.element.style.display = headerAdditionalSpendButton && calloutVisible ? "none" : "";
        }
      };
      (async () => {
        await updatePromise;
        if (token.isCancellationRequested) {
          return;
        }
        updateIndicators();
      })();
      this._store.add(this.chatEntitlementService.onDidChangeQuotaRemaining(() => updateIndicators()));
      this._store.add(this.chatEntitlementService.onDidChangeQuotaExceeded(() => updateIndicators()));
    } else if (this.chatEntitlementService.anonymous && this.chatEntitlementService.sentiment.completed) {
      this.createQuotaIndicator(container2, localize(11259, null), localize(11219, null));
    }
  }
  renderInlineSuggestionsSection(hasContentAbove) {
    const nonCollapsible = !!this.options?.disableQuickSettingsCollapsible;
    const collapsed2 = !nonCollapsible && this.storageService.getBoolean(ChatStatusDashboard.QUICK_SETTINGS_COLLAPSED_KEY, 0 /* PROFILE */, true);
    const activeLanguageId = this.editorService.activeTextEditorLanguageId;
    const getStatusText = () => {
      if (!this.canUseChat()) {
        return localize(11237, null);
      }
      const enabled = activeLanguageId ? isCompletionsEnabled(this.configurationService, activeLanguageId) : isCompletionsEnabled(this.configurationService);
      return enabled ? localize(11238, null) : localize(11237, null);
    };
    let disclosureHeader;
    let chevron;
    let statusEl;
    if (!nonCollapsible) {
      disclosureHeader = this.element.appendChild($("button.collapsible-header"));
      if (!hasContentAbove) {
        disclosureHeader.classList.add("no-border");
      }
      disclosureHeader.setAttribute("aria-expanded", String(!collapsed2));
      disclosureHeader.appendChild($("span.collapsible-label", void 0, localize(11239, null)));
      chevron = disclosureHeader.appendChild($("span.collapsible-chevron"));
      chevron.classList.add(...ThemeIcon.asClassNameArray(collapsed2 ? Codicon.chevronRightCompact : Codicon.chevronDownCompact));
      statusEl = disclosureHeader.appendChild($("span.collapsible-status", void 0, getStatusText()));
    }
    const collapsibleContent = this.element.appendChild($("div.collapsible-content"));
    const collapsibleInner = collapsibleContent.appendChild($("div.collapsible-inner"));
    if (collapsed2) {
      collapsibleContent.classList.add("collapsed");
      collapsibleInner.inert = true;
    }
    if (disclosureHeader && chevron) {
      const toggle = () => {
        const isCollapsed = collapsibleContent.classList.toggle("collapsed");
        collapsibleInner.inert = isCollapsed;
        disclosureHeader.setAttribute("aria-expanded", String(!isCollapsed));
        chevron.className = "collapsible-chevron";
        chevron.classList.add(...ThemeIcon.asClassNameArray(isCollapsed ? Codicon.chevronRightCompact : Codicon.chevronDownCompact));
        this.storageService.store(ChatStatusDashboard.QUICK_SETTINGS_COLLAPSED_KEY, isCollapsed, 0 /* PROFILE */, 0 /* USER */);
      };
      this._store.add(addDisposableListener(disclosureHeader, EventType.CLICK, () => toggle()));
    }
    if (statusEl) {
      this._store.add(this.configurationService.onDidChangeConfiguration((e4) => {
        if (e4.affectsConfiguration(defaultChat7.completionsEnablementSetting)) {
          statusEl.textContent = getStatusText();
        }
      }));
    }
    this.renderInlineSuggestionsContent(collapsibleInner);
  }
  renderContributedSections(contributedEntries) {
    for (const item of contributedEntries) {
      const headerLabel = typeof item.label === "string" ? item.label : item.label.label;
      let headerLink = typeof item.label === "string" ? void 0 : item.label.link;
      let linkDescription = typeof item.label === "string" ? void 0 : item.label.helpText;
      const section = this.element.appendChild($("div.contributed-section"));
      const header2 = section.appendChild($("div.collapsible-header.non-collapsible"));
      header2.appendChild($("span.collapsible-label", void 0, headerLabel));
      if (linkDescription || headerLink) {
        const infoIcon2 = header2.appendChild($("span.contributed-info-icon"));
        infoIcon2.classList.add(...ThemeIcon.asClassNameArray(Codicon.info));
        this._store.add(this.hoverService.setupDelayedHover(infoIcon2, () => {
          const hoverContent2 = new MarkdownString("", { isTrusted: true });
          if (linkDescription) {
            hoverContent2.appendText(linkDescription);
          }
          if (headerLink) {
            if (linkDescription) {
              hoverContent2.appendText(" ");
            }
            hoverContent2.appendMarkdown(`[${localize(11240, null)}](${headerLink})`);
          }
          return { content: hoverContent2 };
        }, { reducedDelay: true }));
      }
      const statusEl = header2.appendChild($("span.collapsible-status"));
      const statusDisposables = this._store.add(new MutableDisposable());
      const renderStatus = (text2) => {
        const newStore = new DisposableStore();
        statusDisposables.value = newStore;
        this.renderTextPlus(statusEl, text2, newStore);
      };
      renderStatus(item.description);
      let currentTooltip = item.tooltip;
      if (currentTooltip) {
        this._store.add(this.hoverService.setupDelayedHover(statusEl, () => ({
          content: currentTooltip ?? ""
        }), { reducedDelay: true }));
      }
      const sectionDisposables = this._store.add(new MutableDisposable());
      const sectionStore = new DisposableStore();
      sectionDisposables.value = sectionStore;
      let detailEl;
      if (item.detail) {
        detailEl = section.appendChild($("div.contributed-detail"));
        this.renderTextPlus(detailEl, item.detail, sectionStore);
      }
      this._store.add(this.chatStatusItemService.onDidChange((e4) => {
        if (e4.entry.id === item.id) {
          statusEl.textContent = "";
          renderStatus(e4.entry.description);
          currentTooltip = e4.entry.tooltip;
          headerLink = typeof e4.entry.label === "string" ? void 0 : e4.entry.label.link;
          linkDescription = typeof e4.entry.label === "string" ? void 0 : e4.entry.label.helpText;
          const newStore = new DisposableStore();
          sectionDisposables.value = newStore;
          if (detailEl) {
            if (e4.entry.detail) {
              detailEl.textContent = "";
              this.renderTextPlus(detailEl, e4.entry.detail, newStore);
            } else {
              detailEl.remove();
              detailEl = void 0;
            }
          } else if (e4.entry.detail) {
            detailEl = section.appendChild($("div.contributed-detail"));
            this.renderTextPlus(detailEl, e4.entry.detail, newStore);
          }
        }
      }));
    }
  }
  renderSetupSection() {
    const hasByokModels = this.chatEntitlementService.hasByokModels;
    const newUser = isNewUser(this.chatEntitlementService) && !hasByokModels;
    const anonymousUser = this.chatEntitlementService.anonymous;
    const disabled = this.chatEntitlementService.sentiment.disabled || this.chatEntitlementService.sentiment.untrusted;
    const signedOut = this.chatEntitlementService.entitlement === 1 /* Unknown */;
    if (!(newUser || signedOut || disabled)) {
      return;
    }
    this.element.appendChild($("hr"));
    let descriptionText;
    let descriptionClass = ".description";
    if (newUser && anonymousUser) {
      descriptionText = new MarkdownString(localize(11216, null, defaultChat7.provider.default.name, defaultChat7.provider.default.name, defaultChat7.termsStatementUrl, defaultChat7.privacyStatementUrl), { isTrusted: true });
      descriptionClass = `${descriptionClass}.terms`;
    } else if (newUser) {
      descriptionText = localize(11215, null);
    } else if (anonymousUser) {
      descriptionText = localize(11233, null);
    } else if (disabled) {
      descriptionText = localize(11231, null);
    } else {
      descriptionText = localize(11275, null);
    }
    let buttonLabel;
    if (newUser) {
      buttonLabel = localize(11229, null);
    } else if (anonymousUser) {
      buttonLabel = localize(11232, null);
    } else if (disabled) {
      buttonLabel = localize(11230, null);
    } else {
      buttonLabel = localize(11276, null);
    }
    let commandId;
    if (newUser && anonymousUser) {
      commandId = "workbench.action.chat.triggerSetupAnonymousWithoutDialog";
    } else {
      commandId = "workbench.action.chat.triggerSetup";
    }
    if (typeof descriptionText === "string") {
      this.element.appendChild($(`div${descriptionClass}`, void 0, descriptionText));
    } else {
      this.element.appendChild($(`div${descriptionClass}`, void 0, this._store.add(this.markdownRendererService.render(descriptionText)).element));
    }
    const button = this._store.add(new Button(this.element, { ...defaultButtonStyles, hoverDelegate: nativeHoverDelegate }));
    button.label = buttonLabel;
    this._store.add(button.onDidClick(() => this.runCommandAndClose(commandId)));
  }
  renderInlineSuggestionsContent(container2) {
    if (!this.options?.disableInlineSuggestionsSettings) {
      this.createSettings(container2);
    }
    const providers2 = !this.options?.disableModelSelection || !this.options?.disableProviderOptions ? this.languageFeaturesService.inlineCompletionsProvider.allNoModel() : void 0;
    if (!this.options?.disableModelSelection && providers2) {
      const provider = providers2.find((p) => p.modelInfo && p.modelInfo.models.length > 0);
      if (provider) {
        const modelInfo = provider.modelInfo;
        const currentModel = modelInfo.models.find((m) => m.id === modelInfo.currentModelId);
        if (currentModel) {
          const modelContainer = container2.appendChild($("div.model-selection"));
          modelContainer.appendChild($("span.model-text", void 0, localize(11242, null)));
          const selectOptions = modelInfo.models.map((m) => ({ text: m.name }));
          const selectedIndex = modelInfo.models.findIndex((m) => m.id === modelInfo.currentModelId);
          const selectBox = this._store.add(new SelectBox(selectOptions, Math.max(0, selectedIndex), this.contextViewService, defaultSelectBoxStyles, { ariaLabel: localize(11268, null), optionsAsChildren: true }));
          const selectContainer = modelContainer.appendChild($("div.model-select-container"));
          selectBox.render(selectContainer);
          this._store.add(selectBox.onDidSelect(async (e4) => {
            const selectedModel = modelInfo.models[e4.index];
            if (selectedModel && selectedModel.id !== modelInfo.currentModelId && provider.setModelId) {
              await provider.setModelId(selectedModel.id);
            }
          }));
        }
      }
    }
    if (!this.options?.disableProviderOptions && providers2) {
      for (const provider of providers2) {
        if (provider.providerOptions && provider.providerOptions.length > 0) {
          for (const option2 of provider.providerOptions) {
            const currentValue = option2.values.find((v2) => v2.id === option2.currentValueId);
            if (currentValue) {
              const optionContainer = container2.appendChild($("div.suggest-option-selection"));
              optionContainer.appendChild($("span.suggest-option-text", void 0, option2.label));
              const selectOptions = option2.values.map((v2) => ({ text: v2.label }));
              const selectedIndex = option2.values.findIndex((v2) => v2.id === option2.currentValueId);
              const selectBox = this._store.add(new SelectBox(selectOptions, Math.max(0, selectedIndex), this.contextViewService, defaultSelectBoxStyles, { ariaLabel: localize(11269, null, option2.label), optionsAsChildren: true }));
              const selectContainer = optionContainer.appendChild($("div.suggest-option-select-container"));
              selectBox.render(selectContainer);
              this._store.add(selectBox.onDidSelect(async (e4) => {
                const selectedValue = option2.values[e4.index];
                if (selectedValue && selectedValue.id !== option2.currentValueId && provider.setProviderOption) {
                  await provider.setProviderOption(option2.id, selectedValue.id);
                }
              }));
            }
          }
        }
      }
    }
    if (!this.options?.disableCompletionsSnooze && this.canUseChat()) {
      const snooze = append(container2, $("div.snooze-completions"));
      this.createCompletionsSnooze(snooze, localize(11274, null));
    }
  }
  canUseChat() {
    if (!this.chatEntitlementService.sentiment.completed || this.chatEntitlementService.sentiment.disabled || this.chatEntitlementService.sentiment.untrusted) {
      return false;
    }
    if (this.chatEntitlementService.entitlement === 1 /* Unknown */ || this.chatEntitlementService.entitlement === 3 /* Available */) {
      return this.chatEntitlementService.anonymous;
    }
    if (this.chatEntitlementService.entitlement === 5 /* Free */ && this.chatEntitlementService.quotas.chat?.percentRemaining === 0 && this.chatEntitlementService.quotas.completions?.percentRemaining === 0) {
      return false;
    }
    return true;
  }
  renderHeader(container2, disposables, label3, action) {
    const header2 = container2.appendChild($("div.header"));
    header2.appendChild($("span.header-label", void 0, label3));
    if (action) {
      const toolbar = disposables.add(new ActionBar(header2, { hoverDelegate: nativeHoverDelegate }));
      toolbar.push([action], { icon: true, label: false });
    }
    return header2;
  }
  renderTextPlus(target, text2, store) {
    for (const node of parseLinkedText(text2).nodes) {
      if (typeof node === "string") {
        const parts = renderLabelWithIcons(node);
        target.append(...parts);
      } else {
        store.add(new Link(target, node, void 0, this.hoverService, this.openerService));
      }
    }
  }
  runCommandAndClose(commandOrFn, ...args2) {
    if (typeof commandOrFn === "function") {
      commandOrFn(...args2);
    } else {
      this.telemetryService.publicLog2("workbenchActionExecuted", { id: commandOrFn, from: "chat-status" });
      this.commandService.executeCommand(commandOrFn, ...args2);
    }
    this.hoverService.hideHover(true);
  }
  formatQuotaResetLabel(quota) {
    const reset2 = getQuotaReset(quota, this.chatEntitlementService.quotas);
    if (!reset2) {
      return void 0;
    }
    return reset2.hasTime ? localize(11263, null, this.dateFormatter.value.format(reset2.date), this.timeFormatter.value.format(reset2.date)) : localize(11262, null, this.dateFormatter.value.format(reset2.date));
  }
  createCreditsUsedIndicator(container2, creditsUsed, resetLabel) {
    const isCompact = !!this.options?.compactQuotaLayout;
    const resetValue = $("span.quota-reset");
    if (resetLabel) {
      resetValue.textContent = resetLabel;
    }
    const quotaPercentage = $(
      "div.quota-percentage",
      void 0,
      $("span.quota-value", void 0, this.quotaCreditsFormatter.value.format(creditsUsed)),
      $("span.quota-value-suffix", void 0, isCompact ? localize(11258, null, localize(11227, null)) : localize(11228, null))
    );
    const indicatorElement = $(
      "div.quota-indicator.included.credits-used",
      void 0,
      ...isCompact ? [$("div.quota-title", void 0, getChatPlanName(this.chatEntitlementService.entitlement))] : [],
      $(
        "div.quota-details",
        void 0,
        quotaPercentage,
        resetValue
      )
    );
    if (isCompact) {
      indicatorElement.classList.add("compact");
    }
    container2.appendChild(indicatorElement);
  }
  createQuotaIndicator(container2, quota, label3, resetLabel, compactTitle) {
    const isCompact = !!compactTitle;
    const quotaValue = $("span.quota-value");
    const quotaValueText = isCompact ? quotaValue.appendChild($("span.quota-value-text")) : quotaValue;
    const quotaValueSuffix = $("span.quota-value-suffix");
    const quotaBit = $("div.quota-bit");
    const resetValue = $("span.quota-reset");
    if (resetLabel) {
      resetValue.textContent = resetLabel;
    }
    const quotaPercentage = $(
      "div.quota-percentage",
      void 0,
      quotaValue,
      quotaValueSuffix
    );
    quotaPercentage.tabIndex = isCompact ? -1 : 0;
    const indicatorElement = $(
      "div.quota-indicator",
      void 0,
      $(
        "div.quota-title",
        void 0,
        $("span", void 0, isCompact ? compactTitle : label3),
        ...isCompact ? [] : [resetValue]
      ),
      $(
        "div.quota-details",
        void 0,
        quotaPercentage,
        ...isCompact ? [resetValue] : []
      ),
      ...isCompact ? [] : [$("div.quota-bar", void 0, quotaBit)]
    );
    if (isCompact) {
      indicatorElement.classList.add("compact");
    }
    container2.appendChild(indicatorElement);
    let currentQuota = quota;
    let isHovered = false;
    const showPercentage = () => {
      if (typeof currentQuota === "string") {
        quotaValueText.textContent = currentQuota;
        quotaValueSuffix.textContent = "";
      } else {
        const usedPercentage = Math.max(0, 100 - currentQuota.percentRemaining);
        quotaValueText.textContent = localize(11256, null, this.quotaPercentageFormatter.value.format(Math.floor(usedPercentage)));
        quotaValueSuffix.textContent = isCompact ? localize(11258, null, label3) : ` ${localize(11265, null)}`;
      }
    };
    const showCredits = () => {
      if (typeof currentQuota === "string") {
        return;
      }
      const usage = getQuotaUsage(currentQuota);
      if (usage?.kind !== 0 /* Percentage */ || usage.used === void 0 || usage.total === void 0) {
        return;
      }
      const usedFormatted = this.quotaCreditsFormatter.value.format(usage.used);
      const totalFormatted = this.quotaCreditsFormatter.value.format(usage.total);
      quotaValueText.textContent = localize(11255, null, usedFormatted, totalFormatted);
      quotaValueSuffix.textContent = isCompact ? localize(11258, null, label3) : ` ${localize(11265, null)}`;
    };
    const hoverTarget = isCompact ? quotaValueText : quotaPercentage;
    this._store.add(addDisposableListener(hoverTarget, EventType.MOUSE_ENTER, () => {
      isHovered = true;
      showCredits();
    }));
    this._store.add(addDisposableListener(hoverTarget, EventType.MOUSE_LEAVE, () => {
      isHovered = false;
      showPercentage();
    }));
    this._store.add(addDisposableListener(hoverTarget, EventType.FOCUS, () => {
      isHovered = true;
      showCredits();
    }));
    this._store.add(addDisposableListener(hoverTarget, EventType.BLUR, () => {
      isHovered = false;
      showPercentage();
    }));
    const update = (quota2) => {
      currentQuota = quota2;
      let usedPercentage;
      if (typeof quota2 === "string") {
        usedPercentage = 0;
      } else {
        usedPercentage = Math.max(0, 100 - quota2.percentRemaining);
      }
      if (isHovered) {
        showCredits();
      } else {
        showPercentage();
      }
      quotaBit.style.width = `${usedPercentage}%`;
    };
    update(quota);
    return update;
  }
  createGlobalQuotaCallout(container2) {
    const calloutIcon = $("span.callout-icon");
    const calloutText = $("span.callout-text");
    const quotaCallout = container2.appendChild($("div.quota-callout", void 0, calloutIcon, calloutText));
    quotaCallout.style.display = "none";
    const update = () => {
      const quotas = this.chatEntitlementService.quotas;
      const additionalUsageEnabled = quotas.additionalUsageEnabled ?? false;
      const isEnterpriseUser = this.chatEntitlementService.entitlement === 9 /* Enterprise */ || this.chatEntitlementService.entitlement === 8 /* Business */;
      const isUsageBasedBilling = quotas.usageBasedBilling === true;
      const allQuotas = [];
      if (quotas.chat && !quotas.chat.unlimited) {
        allQuotas.push(quotas.chat);
      }
      if (quotas.premiumChat && !quotas.premiumChat.unlimited) {
        allQuotas.push(quotas.premiumChat);
      }
      const maxUsedPercentage = allQuotas.length > 0 ? Math.max(...allQuotas.map((q) => Math.max(0, 100 - q.percentRemaining))) : 0;
      const isPooledQuotaExhausted = quotas.premiumChat?.unlimited && quotas.premiumChat.hasQuota === false;
      if (isEnterpriseUser && isPooledQuotaExhausted) {
        quotaCallout.style.display = "";
        quotaCallout.className = "quota-callout info";
        calloutIcon.className = `callout-icon ${ThemeIcon.asClassName(Codicon.info)}`;
        calloutText.textContent = localize(11254, null);
      } else if (maxUsedPercentage >= 100 && additionalUsageEnabled) {
        quotaCallout.style.display = "";
        quotaCallout.className = "quota-callout info";
        calloutIcon.className = `callout-icon ${ThemeIcon.asClassName(Codicon.info)}`;
        calloutText.textContent = isEnterpriseUser ? localize(11249, null) : isUsageBasedBilling ? localize(11248, null) : localize(11252, null);
      } else if (maxUsedPercentage >= 75 && maxUsedPercentage < 100 && additionalUsageEnabled) {
        quotaCallout.style.display = "";
        quotaCallout.className = "quota-callout info";
        calloutIcon.className = `callout-icon ${ThemeIcon.asClassName(Codicon.info)}`;
        calloutText.textContent = isEnterpriseUser ? localize(11251, null) : isUsageBasedBilling ? localize(11250, null) : localize(11253, null);
      } else if ((maxUsedPercentage >= 100 || isPooledQuotaExhausted) && !additionalUsageEnabled) {
        quotaCallout.style.display = "";
        quotaCallout.className = "quota-callout info";
        calloutIcon.className = `callout-icon ${ThemeIcon.asClassName(Codicon.info)}`;
        calloutText.textContent = isEnterpriseUser ? localize(11261, null) : localize(11260, null);
      } else if (maxUsedPercentage >= 75 && !additionalUsageEnabled) {
        quotaCallout.style.display = "";
        quotaCallout.className = "quota-callout info";
        calloutIcon.className = `callout-icon ${ThemeIcon.asClassName(Codicon.info)}`;
        calloutText.textContent = isEnterpriseUser ? localize(11267, null) : localize(11266, null);
      } else {
        quotaCallout.style.display = "none";
      }
      return { calloutVisible: quotaCallout.style.display !== "none", additionalUsageEnabled };
    };
    update();
    return update;
  }
  createSettings(container2) {
    const modeId = this.editorService.activeTextEditorLanguageId;
    const settings = container2.appendChild($("div.settings"));
    {
      const globalSetting = append(settings, $("div.setting"));
      this.createInlineSuggestionsSetting(globalSetting, localize(11270, null), "*");
      const overriddenHint = globalSetting.appendChild($("span.setting-overridden"));
      const updateOverriddenHint = () => {
        const obj = this.configurationService.getValue(defaultChat7.completionsEnablementSetting);
        const configuredValue = modeId ? this.findConfiguredCompletionsValue(modeId) : void 0;
        const hasOverride = modeId && configuredValue && isObject(obj) && Boolean(configuredValue.value[modeId]) !== Boolean(obj["*"]);
        overriddenHint.textContent = hasOverride ? localize(11273, null) : "";
      };
      updateOverriddenHint();
      if (modeId) {
        const languageSetting = append(settings, $("div.setting"));
        const languageName = this.languageService.getLanguageName(modeId) ?? modeId;
        this.createTriStateLanguageSetting(languageSetting, localize(11271, null, languageName), modeId, updateOverriddenHint);
      }
    }
    {
      const setting = append(settings, $("div.setting"));
      this.createNextEditSuggestionsSetting(setting, localize(11272, null), this.getCompletionsSettingAccessor(modeId));
    }
  }
  createSetting(container2, settingIdsToReEvaluate, label3, accessor) {
    const checkbox = this._store.add(new Checkbox(label3, Boolean(accessor.readSetting()), { ...defaultCheckboxStyles }));
    container2.appendChild(checkbox.domNode);
    const settingLabel = append(container2, $("span.setting-label", void 0, label3));
    this._store.add(Gesture.addTarget(settingLabel));
    [EventType.CLICK, EventType2.Tap].forEach((eventType) => {
      this._store.add(addDisposableListener(settingLabel, eventType, (e4) => {
        if (checkbox?.enabled) {
          EventHelper.stop(e4, true);
          checkbox.checked = !checkbox.checked;
          accessor.writeSetting(checkbox.checked);
          checkbox.focus();
        }
      }));
    });
    this._store.add(checkbox.onChange(() => {
      accessor.writeSetting(checkbox.checked);
    }));
    this._store.add(this.configurationService.onDidChangeConfiguration((e4) => {
      if (settingIdsToReEvaluate.some((id2) => e4.affectsConfiguration(id2))) {
        checkbox.checked = Boolean(accessor.readSetting());
      }
    }));
    if (!this.canUseChat()) {
      container2.classList.add("disabled");
      checkbox.disable();
      checkbox.checked = false;
    }
    return checkbox;
  }
  createInlineSuggestionsSetting(container2, label3, modeId) {
    this.createSetting(container2, [defaultChat7.completionsEnablementSetting], label3, this.getCompletionsSettingAccessor(modeId));
  }
  createTriStateLanguageSetting(container2, label3, modeId, onStateChange) {
    const settingId = defaultChat7.completionsEnablementSetting;
    const getState = () => {
      const configuredValue = this.findConfiguredCompletionsValue(modeId);
      return configuredValue ? Boolean(configuredValue.value[modeId]) : "mixed";
    };
    let requestedState = getState();
    let pendingWrites = 0;
    const checkbox = this._store.add(new TriStateCheckbox(label3, requestedState, { ...defaultCheckboxStyles }));
    container2.appendChild(checkbox.domNode);
    const settingLabel = append(container2, $("span.setting-label", void 0, label3));
    this._store.add(Gesture.addTarget(settingLabel));
    const writeSequencer = new Sequencer();
    const renderState = (state) => {
      requestedState = state;
      checkbox.checked = state;
      checkbox.domNode.setAttribute("aria-checked", state === "mixed" ? "mixed" : String(state));
    };
    const getNextState = () => requestedState === true ? false : requestedState === false ? "mixed" : true;
    const writeState = async (state) => {
      const configuredValue = this.findConfiguredCompletionsValue(modeId) ?? this.findConfiguredCompletionsValue();
      if (state === "mixed") {
        for (const configuredValue2 of this.findConfiguredCompletionsValues(modeId)) {
          const { [modeId]: _, ...rest } = configuredValue2.value;
          await this.configurationService.updateValue(settingId, rest, configuredValue2.target);
        }
      } else {
        const value2 = { ...configuredValue?.value, [modeId]: state };
        if (configuredValue) {
          await this.configurationService.updateValue(settingId, value2, configuredValue.target);
        } else {
          await this.configurationService.updateValue(settingId, value2);
        }
      }
      const enabled = isCompletionsEnabled(this.configurationService, modeId);
      this.telemetryService.publicLog2("chatStatus.settingChanged", {
        settingIdentifier: settingId,
        settingMode: modeId,
        settingEnablement: enabled ? "enabled" : "disabled"
      });
    };
    const requestStateChange = () => {
      const state = getNextState();
      renderState(state);
      pendingWrites++;
      void writeSequencer.queue(async () => {
        try {
          await writeState(state);
        } finally {
          pendingWrites--;
        }
      }).catch((error) => {
        if (pendingWrites === 0) {
          renderState(getState());
          onStateChange();
        }
        this.notificationService.error(error);
      });
    };
    renderState(requestedState);
    [EventType.CLICK, EventType2.Tap].forEach((eventType) => {
      this._store.add(addDisposableListener(settingLabel, eventType, (e4) => {
        if (checkbox?.enabled) {
          EventHelper.stop(e4, true);
          requestStateChange();
          checkbox.focus();
        }
      }));
    });
    this._store.add(checkbox.onChange(() => {
      renderState(requestedState);
      requestStateChange();
    }));
    this._store.add(this.configurationService.onDidChangeConfiguration((e4) => {
      if (e4.affectsConfiguration(settingId)) {
        const state = getState();
        if (pendingWrites === 0 || state === requestedState) {
          renderState(state);
          onStateChange();
        }
      }
    }));
    if (!this.canUseChat()) {
      container2.classList.add("disabled");
      checkbox.disable();
      checkbox.checked = false;
    }
  }
  findConfiguredCompletionsValue(modeId) {
    return this.findConfiguredCompletionsValues(modeId)[0];
  }
  findConfiguredCompletionsValues(modeId) {
    const inspected = this.configurationService.inspect(defaultChat7.completionsEnablementSetting);
    const result = [];
    for (const target of completionsConfigurationTargets) {
      const value2 = getConfigValueInTarget(inspected, target);
      if (isObject(value2) && (!modeId || Object.prototype.hasOwnProperty.call(value2, modeId))) {
        result.push({ target, value: value2 });
      }
    }
    return result;
  }
  getCompletionsSettingAccessor(modeId = "*") {
    const settingId = defaultChat7.completionsEnablementSetting;
    return {
      readSetting: () => isCompletionsEnabled(this.configurationService, modeId),
      writeSetting: (value2) => {
        this.telemetryService.publicLog2("chatStatus.settingChanged", {
          settingIdentifier: settingId,
          settingMode: modeId,
          settingEnablement: value2 ? "enabled" : "disabled"
        });
        let result = this.configurationService.getValue(settingId);
        if (!isObject(result)) {
          result = /* @__PURE__ */ Object.create(null);
        }
        return this.configurationService.updateValue(settingId, { ...result, [modeId]: value2 });
      }
    };
  }
  createNextEditSuggestionsSetting(container2, label3, completionsSettingAccessor) {
    const nesSettingId = defaultChat7.nextEditSuggestionsSetting;
    const completionsSettingId = defaultChat7.completionsEnablementSetting;
    const resource = EditorResourceAccessor.getOriginalUri(this.editorService.activeEditor, { supportSideBySide: 1 /* PRIMARY */ });
    const checkbox = this.createSetting(container2, [nesSettingId, completionsSettingId], label3, {
      readSetting: () => completionsSettingAccessor.readSetting() && this.textResourceConfigurationService.getValue(resource, nesSettingId),
      writeSetting: (value2) => {
        this.telemetryService.publicLog2("chatStatus.settingChanged", {
          settingIdentifier: nesSettingId,
          settingEnablement: value2 ? "enabled" : "disabled"
        });
        return this.textResourceConfigurationService.updateValue(resource, nesSettingId, value2);
      }
    });
    if (!completionsSettingAccessor.readSetting()) {
      container2.classList.add("disabled");
      checkbox.disable();
    }
    this._store.add(this.configurationService.onDidChangeConfiguration((e4) => {
      if (e4.affectsConfiguration(completionsSettingId)) {
        if (completionsSettingAccessor.readSetting() && this.canUseChat()) {
          checkbox.enable();
          container2.classList.remove("disabled");
        } else {
          checkbox.disable();
          container2.classList.add("disabled");
        }
      }
    }));
  }
  createCompletionsSnooze(container2, label3) {
    const isEnabled = () => {
      const completionsEnabled = isCompletionsEnabled(this.configurationService);
      const completionsEnabledActiveLanguage = isCompletionsEnabled(this.configurationService, this.editorService.activeTextEditorLanguageId);
      return completionsEnabled || completionsEnabledActiveLanguage;
    };
    const button = this._store.add(new Button(container2, { disabled: !isEnabled(), ...defaultButtonStyles, hoverDelegate: nativeHoverDelegate, secondary: true }));
    const timerDisplay = container2.appendChild($("span.snooze-label"));
    const actionBar3 = container2.appendChild($("div.snooze-action-bar"));
    const toolbar = this._store.add(new ActionBar(actionBar3, { hoverDelegate: nativeHoverDelegate }));
    const cancelAction = toAction({
      id: "workbench.action.cancelSnoozeStatusBarLink",
      label: localize(11218, null),
      run: () => this.inlineCompletionsService.cancelSnooze(),
      class: ThemeIcon.asClassName(Codicon.stopCircle)
    });
    const update = (isEnabled2) => {
      container2.classList.toggle("disabled", !isEnabled2);
      toolbar.clear();
      const timeLeftMs = this.inlineCompletionsService.snoozeTimeLeft;
      if (!isEnabled2 || timeLeftMs <= 0) {
        timerDisplay.textContent = localize(11223, null);
        timerDisplay.title = "";
        button.label = label3;
        button.setTitle(localize(11222, null));
        return true;
      }
      const timeLeftSeconds = Math.ceil(timeLeftMs / 1e3);
      const minutes = Math.floor(timeLeftSeconds / 60);
      const seconds = timeLeftSeconds % 60;
      timerDisplay.textContent = `${minutes}:${seconds < 10 ? "0" : ""}${seconds} ${localize(11221, null)}`;
      timerDisplay.title = localize(11225, null);
      button.label = localize(11220, null);
      button.setTitle(localize(11224, null));
      toolbar.push([cancelAction], { icon: true, label: false });
      return false;
    };
    const timerDisposables = this._store.add(new DisposableStore());
    function updateIntervalTimer() {
      timerDisposables.clear();
      const enabled = isEnabled();
      if (update(enabled)) {
        return;
      }
      timerDisposables.add(disposableWindowInterval(
        getWindow(container2),
        () => update(enabled),
        1e3
      ));
    }
    updateIntervalTimer();
    this._store.add(button.onDidClick(() => {
      this.inlineCompletionsService.snooze();
      update(isEnabled());
    }));
    this._store.add(this.configurationService.onDidChangeConfiguration((e4) => {
      if (e4.affectsConfiguration(defaultChat7.completionsEnablementSetting)) {
        button.enabled = isEnabled();
      }
      updateIntervalTimer();
    }));
    this._store.add(this.inlineCompletionsService.onDidChangeIsSnoozing(() => {
      updateIntervalTimer();
    }));
  }
};

ChatStatusDashboard = __decorateClass([
  __decorateParam(1, IChatEntitlementService),
  __decorateParam(2, IChatStatusItemService),
  __decorateParam(3, ICommandService),
  __decorateParam(4, IConfigurationService),
  __decorateParam(5, IEditorService),
  __decorateParam(6, IHoverService),
  __decorateParam(7, ILanguageService),
  __decorateParam(8, IOpenerService),
  __decorateParam(9, ITelemetryService),
  __decorateParam(10, ITextResourceConfigurationService),
  __decorateParam(11, IInlineCompletionsService),
  __decorateParam(12, IMarkdownRendererService),
  __decorateParam(13, ILanguageFeaturesService),
  __decorateParam(14, IContextViewService),
  __decorateParam(15, IStorageService),
  __decorateParam(16, IDefaultAccountService),
  __decorateParam(17, INotificationService)
], ChatStatusDashboard);
export { defaultChat7, completionsConfigurationTargets, ChatStatusDashboard };
