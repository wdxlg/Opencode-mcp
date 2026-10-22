// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/aiCustomization/aiCustomizationWelcomePagePromptLaunchers.ts
import { $, DisposableResizeObserver, addDisposableListener, append, clearNode } from "./module-0075.mjs";
import { Disposable, DisposableStore } from "./module-0012.mjs";
import { AICustomizationManagementSection } from "./module-0996.mjs";
import { localizeBridge } from "./module-2621.mjs";
import { Codicon } from "./module-0085.mjs";
import { localize } from "./module-0001.mjs";
import { localizeMultiModel } from "./module-2649.mjs";
import { agentIcon, hookIcon, instructionsIcon, pluginIcon, skillIcon, toolsIcon } from "./module-2615.mjs";
import { CONFIGURE_DICTATION_INSTRUCTIONS_ACTION_ID, CONFIGURE_VOICE_INSTRUCTIONS_ACTION_ID } from "./module-2032.mjs";
import { DomScrollableElement } from "./module-0259.mjs";
import { getDefaultHoverDelegate } from "./module-0448.mjs";
import { ThemeIcon } from "./module-0086.mjs";


// src/vs/workbench/contrib/chat/browser/aiCustomization/aiCustomizationWelcomePagePromptLaunchers.ts
var $93 = $;

var PromptLaunchersAICustomizationWelcomePage = class extends Disposable {
  constructor(parent, welcomePageFeatures, callbacks, commandService, workspaceService, hoverService, harnessLabel) {
    super();
    this.welcomePageFeatures = welcomePageFeatures;
    this.callbacks = callbacks;
    this.commandService = commandService;
    this.workspaceService = workspaceService;
    this.hoverService = hoverService;
    this.harnessLabel = harnessLabel;
    this.cardDisposables = this._register(new DisposableStore());
    this.visibleSectionIds = /* @__PURE__ */ new Set();
    this.categoryDescriptions = [
      {
        id: AICustomizationManagementSection.Bridge,
        label: localizeBridge("opencodeBridge.navigationLabel", "Bridge"),
        icon: Codicon.radioTower,
        description: localizeBridge("opencodeBridge.navigationDescription", "Expose OpenCode tools as a remote Streamable HTTP MCP endpoint."),
        settingsOnly: true
      },
      {
        id: AICustomizationManagementSection.Models,
        label: localizeBridge("apiProvider", "API Provider"),
        icon: Codicon.vm,
        description: localize(9532, null),
        settingsOnly: true
      },
      {
        id: AICustomizationManagementSection.Codex,
        label: localize(9535, null),
        icon: Codicon.account,
        description: localize(9536, null),
        settingsOnly: true
      },
      {
        id: AICustomizationManagementSection.MultiModel,
        label: localizeMultiModel("opencodeMultiModel.navigationLabel", "Multi-Model Rounds"),
        icon: Codicon.gitMerge,
        description: localizeMultiModel("opencodeMultiModel.navigationDescription", "Merge model, read-only verification, and branch limits for multi-model rounds."),
        settingsOnly: true
      },
      {
        id: AICustomizationManagementSection.Agents,
        label: localize(9530, null),
        icon: agentIcon,
        description: localize(9531, null),
        promptType: "agent" /* agent */
      },
      {
        id: AICustomizationManagementSection.Skills,
        label: localize(9560, null),
        icon: skillIcon,
        description: localize(9561, null),
        promptType: "skill" /* skill */
      },
      {
        id: AICustomizationManagementSection.Instructions,
        label: localize(9547, null),
        icon: instructionsIcon,
        description: localize(9548, null),
        promptType: "instructions" /* instructions */
      },
      {
        id: AICustomizationManagementSection.Hooks,
        label: localize(9545, null),
        icon: hookIcon,
        description: localize(9546, null),
        promptType: "hook" /* hook */
      },
      {
        id: AICustomizationManagementSection.McpServers,
        label: localize(9549, null),
        icon: Codicon.server,
        description: localize(9550, null)
      },
      {
        id: AICustomizationManagementSection.Plugins,
        label: localize(9554, null),
        icon: pluginIcon,
        description: localize(9555, null)
      },
      {
        id: AICustomizationManagementSection.Tools,
        label: localize(9562, null),
        icon: toolsIcon,
        description: localize(9563, null)
      }
    ];
    this.standaloneCustomizations = [
      {
        label: localize(9564, null),
        icon: Codicon.voiceMode,
        description: localize(9565, null),
        commandId: CONFIGURE_VOICE_INSTRUCTIONS_ACTION_ID
      },
      {
        label: localize(9541, null),
        icon: Codicon.mic,
        description: localize(9542, null),
        commandId: CONFIGURE_DICTATION_INSTRUCTIONS_ACTION_ID
      }
    ];
    this.container = $93(".welcome-prompts-content-container");
    this.scrollable = this._register(new DomScrollableElement(this.container, {
      horizontal: 2 /* Hidden */,
      vertical: 1 /* Auto */,
      useShadows: false
    }));
    const scrollableNode = this.scrollable.getDomNode();
    scrollableNode.classList.add("welcome-prompts-scrollable");
    parent.appendChild(scrollableNode);
    const resizeObserver = this._register(new DisposableResizeObserver("AICustomizationWelcomePagePromptLaunchers.scrollable", () => this.scrollable.scanDomNode()));
    this._register(resizeObserver.observe(scrollableNode));
    const welcomeInner = append(this.container, $93(".welcome-prompts-inner"));
    this.heading = append(welcomeInner, $93("h2.welcome-prompts-heading"));
    this.updateHeading();
    const subtitle = append(welcomeInner, $93("p.welcome-prompts-subtitle"));
    subtitle.textContent = localize(9567, null);
    if (this.welcomePageFeatures?.showGettingStartedBanner !== false) {
      const gettingStarted = append(welcomeInner, $93(".welcome-prompts-primary"));
      const header2 = append(gettingStarted, $93(".welcome-prompts-section-label"));
      const icon2 = append(header2, $93("span.welcome-prompts-section-label-icon.codicon.codicon-sparkle"));
      icon2.setAttribute("aria-hidden", "true");
      const title = append(header2, $93("span"));
      title.textContent = localize(9544, null);
      const description = append(gettingStarted, $93("p.welcome-prompts-input-helper"));
      description.textContent = localize(9543, null);
      const inputRow = append(gettingStarted, $93(".welcome-prompts-input-row"));
      this.inputRow = inputRow;
      this.inputElement = append(inputRow, $93("input.welcome-prompts-input"));
      this.inputElement.type = "text";
      this.inputElement.placeholder = localize(9569, null);
      this.inputElement.setAttribute("aria-label", localize(9568, null));
      const submitBtn = append(inputRow, $93("button.welcome-prompts-input-submit"));
      this.submitBtn = submitBtn;
      submitBtn.setAttribute("aria-label", localize(9570, null));
      this._register(this.hoverService.setupManagedHover(getDefaultHoverDelegate("element"), submitBtn, localize(9571, null)));
      const chevron = append(submitBtn, $93("span.codicon.codicon-arrow-up"));
      chevron.setAttribute("aria-hidden", "true");
      const updateSubmitState = () => {
        const hasValue = !!this.inputElement?.value?.trim();
        submitBtn.disabled = !hasValue;
        submitBtn.classList.toggle("welcome-prompts-input-submit-disabled", !hasValue);
      };
      const submit = () => {
        const value2 = this.inputElement?.value?.trim();
        if (!value2) {
          return;
        }
        let query;
        if (this.workspaceService.isSessionsWindow) {
          query = `Generate agent customizations. ${value2}`;
        } else {
          query = `/init ${value2}`;
        }
        if (this.inputElement) {
          this.inputElement.value = "";
        }
        updateSubmitState();
        inputRow.classList.add("sent");
        submitBtn.style.display = "none";
        if (this.sentLabel) {
          this.sentLabel.remove();
        }
        this.sentLabel = append(inputRow, $93("span.welcome-prompts-sent-label"));
        this.sentLabel.textContent = localize(9559, null);
        this.callbacks.prefillChat(query, { isPartialQuery: false, newChat: true });
      };
      this._register(addDisposableListener(submitBtn, "click", (e4) => {
        e4.stopPropagation();
        submit();
      }));
      this._register(addDisposableListener(this.inputElement, "keydown", (e4) => {
        if (e4.key === "Enter") {
          e4.preventDefault();
          submit();
        }
      }));
      this._register(addDisposableListener(this.inputElement, "input", () => {
        updateSubmitState();
        this._clearSentState();
      }));
      updateSubmitState();
    }
    this.cardsContainer = append(welcomeInner, $93(".welcome-prompts-cards"));
  }
  _clearSentState() {
    if (this.sentLabel) {
      this.sentLabel.remove();
      this.sentLabel = void 0;
    }
    if (this.submitBtn) {
      this.submitBtn.style.display = "";
    }
    if (this.inputRow) {
      this.inputRow.classList.remove("sent");
    }
  }
  reset() {
    this._clearSentState();
  }
  rebuildCards(visibleSectionIds) {
    if (!this.cardsContainer) {
      return;
    }
    this.visibleSectionIds = new Set(visibleSectionIds);
    this.cardDisposables.clear();
    clearNode(this.cardsContainer);
    this.firstCard = void 0;
    for (const category9 of this.categoryDescriptions) {
      if (!visibleSectionIds.has(category9.id)) {
        continue;
      }
      const card = append(this.cardsContainer, $93(".welcome-prompts-card"));
      card.setAttribute("tabindex", "0");
      card.setAttribute("role", "button");
      if (!this.firstCard) {
        this.firstCard = card;
      }
      const cardHeader = append(card, $93(".welcome-prompts-card-header"));
      const iconEl = append(cardHeader, $93(".welcome-prompts-card-icon"));
      iconEl.classList.add(...ThemeIcon.asClassNameArray(category9.icon));
      const labelEl = append(cardHeader, $93("span.welcome-prompts-card-label"));
      labelEl.textContent = category9.label;
      const descEl = append(card, $93("p.welcome-prompts-card-description"));
      descEl.textContent = category9.description;
      const footer = append(card, $93(".welcome-prompts-card-footer"));
      if (category9.settingsOnly) {
        footer.remove();
      } else if (category9.promptType) {
        const generateBtn = append(footer, $93("button.welcome-prompts-card-action"));
        generateBtn.textContent = localize(9552, null);
        generateBtn.setAttribute("aria-label", localize(9553, null, category9.label));
        this.cardDisposables.add(addDisposableListener(generateBtn, "click", (e4) => {
          e4.stopPropagation();
          this.callbacks.closeEditor();
          if (this.workspaceService.isSessionsWindow) {
            const typeLabel = category9.label.toLowerCase().replace(/s$/, "");
            this.callbacks.prefillChat(`Create me a custom ${typeLabel} that `, { isPartialQuery: true, newChat: true });
          } else {
            this.workspaceService.generateCustomization(category9.promptType);
          }
        }));
      } else {
        const browseBtn = append(footer, $93("button.welcome-prompts-card-action"));
        browseBtn.textContent = localize(9533, null);
        browseBtn.setAttribute("aria-label", localize(9534, null, category9.label));
        this.cardDisposables.add(addDisposableListener(browseBtn, "click", (e4) => {
          e4.stopPropagation();
          this.callbacks.selectSectionWithMarketplace(category9.id);
        }));
      }
      this.cardDisposables.add(addDisposableListener(card, "click", () => {
        this.callbacks.selectSection(category9.id);
      }));
      this.cardDisposables.add(addDisposableListener(card, "keydown", (e4) => {
        if (e4.key === "Enter" || e4.key === " ") {
          e4.preventDefault();
          this.callbacks.selectSection(category9.id);
        }
      }));
    }
    if (!this.workspaceService.isSessionsWindow) {
      for (const customization of this.standaloneCustomizations) {
        this.renderStandaloneCustomization(customization);
      }
    }
    if (this.promptMigrationInfo) {
      this.renderPromptMigrationCard();
    }
    this.scrollable.scanDomNode();
  }
  renderStandaloneCustomization(customization) {
    if (!this.cardsContainer) {
      return;
    }
    const card = append(this.cardsContainer, $93(".welcome-prompts-card"));
    card.setAttribute("tabindex", "0");
    card.setAttribute("role", "button");
    if (!this.firstCard) {
      this.firstCard = card;
    }
    const cardHeader = append(card, $93(".welcome-prompts-card-header"));
    const iconEl = append(cardHeader, $93(".welcome-prompts-card-icon"));
    iconEl.classList.add(...ThemeIcon.asClassNameArray(customization.icon));
    const labelEl = append(cardHeader, $93("span.welcome-prompts-card-label"));
    labelEl.textContent = customization.label;
    const descEl = append(card, $93("p.welcome-prompts-card-description"));
    descEl.textContent = customization.description;
    const footer = append(card, $93(".welcome-prompts-card-footer"));
    const configureButton2 = append(footer, $93("button.welcome-prompts-card-action"));
    configureButton2.textContent = localize(9537, null);
    configureButton2.setAttribute("aria-label", localize(9538, null, customization.label));
    const configure = () => {
      void this.commandService.executeCommand(customization.commandId);
    };
    this.cardDisposables.add(addDisposableListener(configureButton2, "click", (e4) => {
      e4.stopPropagation();
      configure();
    }));
    this.cardDisposables.add(addDisposableListener(card, "click", configure));
    this.cardDisposables.add(addDisposableListener(card, "keydown", (e4) => {
      if (e4.key === "Enter" || e4.key === " ") {
        e4.preventDefault();
        configure();
      }
    }));
  }
  setPromptMigrationInfo(info) {
    const didChange = this.promptMigrationInfo?.totalPromptCount !== info?.totalPromptCount || this.promptMigrationInfo?.workspacePromptCount !== info?.workspacePromptCount || this.promptMigrationInfo?.userPromptCount !== info?.userPromptCount;
    this.promptMigrationInfo = info;
    if (didChange) {
      this.rebuildCards(this.visibleSectionIds);
    }
  }
  setHarnessLabel(label3) {
    if (this.harnessLabel === label3) {
      return;
    }
    this.harnessLabel = label3;
    this.updateHeading();
  }
  updateHeading() {
    if (this.heading) {
      this.heading.textContent = localize(9566, null, this.harnessLabel);
    }
  }
  renderPromptMigrationCard() {
    if (!this.cardsContainer || !this.promptMigrationInfo) {
      return;
    }
    const migrationCard = append(this.cardsContainer, $93(".welcome-prompts-card.welcome-prompts-migration-card"));
    migrationCard.setAttribute("tabindex", "0");
    migrationCard.setAttribute("role", "button");
    if (!this.firstCard) {
      this.firstCard = migrationCard;
    }
    const cardHeader = append(migrationCard, $93(".welcome-prompts-card-header"));
    const iconEl = append(cardHeader, $93(".welcome-prompts-card-icon"));
    iconEl.classList.add(...ThemeIcon.asClassNameArray(Codicon.sync));
    const labelEl = append(cardHeader, $93("span.welcome-prompts-card-label"));
    labelEl.textContent = localize(9551, null);
    const descEl = append(migrationCard, $93("p.welcome-prompts-card-description"));
    descEl.textContent = this.getPromptMigrationDescription();
    const footer = append(migrationCard, $93(".welcome-prompts-card-footer"));
    const migrateBtn = append(footer, $93("button.welcome-prompts-card-action"));
    migrateBtn.textContent = localize(9540, null);
    migrateBtn.setAttribute("aria-label", localize(9539, null));
    this.cardDisposables.add(addDisposableListener(migrateBtn, "click", (e4) => {
      e4.stopPropagation();
      this.callbacks.migratePromptFiles();
    }));
    this.cardDisposables.add(addDisposableListener(migrationCard, "click", () => {
      this.callbacks.migratePromptFiles();
    }));
    this.cardDisposables.add(addDisposableListener(migrationCard, "keydown", (e4) => {
      if (e4.key === "Enter" || e4.key === " ") {
        e4.preventDefault();
        this.callbacks.migratePromptFiles();
      }
    }));
  }
  getPromptMigrationDescription() {
    if (!this.promptMigrationInfo) {
      return "";
    }
    const { workspacePromptCount, userPromptCount, totalPromptCount } = this.promptMigrationInfo;
    if (workspacePromptCount > 0 && userPromptCount > 0) {
      return localize(
        9558,
        null,
        totalPromptCount,
        workspacePromptCount,
        userPromptCount,
        this.harnessLabel
      );
    }
    if (workspacePromptCount > 0) {
      return localize(
        9557,
        null,
        workspacePromptCount,
        this.harnessLabel
      );
    }
    return localize(
      9556,
      null,
      userPromptCount,
      this.harnessLabel
    );
  }
  focus() {
    if (this.inputElement) {
      this.inputElement.focus();
      return;
    }
    this.firstCard?.focus();
  }
};
export { $93, PromptLaunchersAICustomizationWelcomePage };
