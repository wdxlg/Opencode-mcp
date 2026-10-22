// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/chatPetAchievementsWidget.ts
import { Disposable, DisposableStore } from "./module-0012.mjs";
import { $, EventType, addDisposableListener, append, clearNode, getActiveElement, isHTMLElement } from "./module-0075.mjs";
import { DomScrollableElement } from "./module-0259.mjs";
import { observableSignalFromEvent } from "./module-0062.mjs";
import { autorun } from "./module-0052.mjs";
import { localize } from "./module-0001.mjs";
import { chatPetAchievements, getChatPetAccessory, getChatPetAchievementPresentation } from "./module-2138.mjs";
import { Button } from "./module-0546.mjs";
import { CHAT_PET_ACHIEVEMENT_PREVIEW_SIZE, renderChatPetAchievementPreview } from "./module-2767.mjs";
import { status } from "./module-0076.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IChatPetService } from "./module-2139.mjs";
import { IThemeService } from "./module-0287.mjs";
import { ILogService } from "./module-0095.mjs";


// src/vs/workbench/contrib/chat/browser/chatPetAchievementsWidget.ts
var ChatPetAchievementsWidget = class extends Disposable {
  constructor(parent, onDidRequestClose, chatPetService, themeService, logService) {
    super();
    this.onDidRequestClose = onDidRequestClose;
    this.chatPetService = chatPetService;
    this.themeService = themeService;
    this.logService = logService;
    this.renderDisposables = this._register(new DisposableStore());
    this.accessoryCards = /* @__PURE__ */ new Map();
    this.unseenAchievementIds = /* @__PURE__ */ new Set();
    this.container = append(parent, $(".chat-pet-achievements-widget"));
    this.content = $(".chat-pet-achievements-content");
    this.scrollable = this._register(new DomScrollableElement(this.content, {
      horizontal: 2 /* Hidden */,
      vertical: 1 /* Auto */
    }));
    this.container.appendChild(this.scrollable.getDomNode());
    this._register(addDisposableListener(this.content, EventType.SCROLL, () => {
      const scrollTop = this.content.scrollTop;
      if (scrollTop !== this.scrollable.getScrollPosition().scrollTop) {
        this.scrollable.setScrollPosition({ scrollTop });
      }
    }, { passive: true }));
    const themeChanged = observableSignalFromEvent(this, this.themeService.onDidColorThemeChange);
    this._register(autorun((reader) => {
      const unlockedAchievements = this.chatPetService.unlockedAchievements.read(reader);
      const variant = this.chatPetService.variant.read(reader);
      themeChanged.read(reader);
      this.render(unlockedAchievements, this.chatPetService.selectedAccessory.read(void 0), variant);
    }));
    this._register(autorun((reader) => {
      this.updateSelectedAccessory(this.chatPetService.selectedAccessory.read(reader));
    }));
    this._register(autorun((reader) => {
      this.updateNewAchievements(this.chatPetService.unseenAchievements.read(reader));
    }));
  }
  layout(dimension) {
    if (dimension) {
      this.lastDimension = dimension;
      this.container.style.width = `${dimension.width}px`;
      this.container.style.height = `${dimension.height}px`;
    }
    const width2 = dimension?.width ?? this.container.clientWidth;
    const height = dimension?.height ?? this.container.clientHeight;
    this.container.classList.toggle("narrow", width2 < 560);
    this.content.style.width = `${width2}px`;
    this.content.style.height = `${height}px`;
    const scrollableNode = this.scrollable.getDomNode();
    scrollableNode.style.width = `${width2}px`;
    scrollableNode.style.height = `${height}px`;
    this.scrollable.scanDomNode();
  }
  focus() {
    this.focusTarget?.();
  }
  render(unlockedAchievements, selectedAccessory, variant) {
    const activeElement = getActiveElement();
    const restoreFocusId = isHTMLElement(activeElement) ? activeElement.closest(".chat-pet-achievement-card")?.dataset.accessoryId : void 0;
    this.renderDisposables.clear();
    clearNode(this.content);
    this.accessoryCards.clear();
    this.focusTarget = void 0;
    const inner = append(this.content, $(".chat-pet-achievements-inner"));
    append(inner, $("h1")).textContent = localize(11043, null);
    append(inner, $("p.chat-pet-achievements-intro")).textContent = localize(11034, null);
    const unlockedSet = new Set(unlockedAchievements);
    const collection = append(inner, $("section.chat-pet-achievements-collection"));
    collection.setAttribute("role", "region");
    collection.setAttribute("aria-label", localize(
      11029,
      null,
      unlockedAchievements.length,
      chatPetAchievements.length
    ));
    const collectionHeader = append(collection, $(".chat-pet-achievements-collection-header"));
    append(collectionHeader, $("h2")).textContent = localize(11028, null);
    append(collectionHeader, $("span.chat-pet-achievements-count")).textContent = localize(
      11030,
      null,
      unlockedAchievements.length,
      chatPetAchievements.length
    );
    const list2 = append(collection, $("ul.chat-pet-achievements-list"));
    const cards = /* @__PURE__ */ new Map();
    const noHatId = "none";
    const noHatItem = append(list2, $("li.chat-pet-achievements-list-item"));
    const noHatSelected = selectedAccessory === void 0;
    const noHatCard = this.renderDisposables.add(new Button(noHatItem, {
      secondary: true,
      ariaLabel: noHatSelected ? localize(11023, null) : localize(11022, null)
    }));
    noHatCard.element.classList.add("chat-pet-achievement-card", "no-hat");
    noHatCard.element.dataset.accessoryId = noHatId;
    noHatCard.element.setAttribute("aria-pressed", String(noHatSelected));
    noHatCard.element.classList.toggle("wearing", noHatSelected);
    const noHatPreviews = append(noHatCard.element, $(".chat-pet-achievement-previews"));
    this.renderCardPreview(noHatPreviews, void 0, true, variant);
    const noHatContent = append(noHatCard.element, $(".chat-pet-achievement-card-content"));
    append(noHatContent, $("h3")).textContent = localize(11035, null);
    const noHatState = append(noHatContent, $("span.chat-pet-achievement-state"));
    noHatState.textContent = noHatSelected ? localize(11027, null) : localize(11025, null);
    this.renderDisposables.add(noHatCard.onDidClick(() => this.selectAccessory(void 0)));
    this.renderDisposables.add(noHatCard.onDidEscape(() => this.onDidRequestClose()));
    this.accessoryCards.set(noHatId, {
      button: noHatCard,
      state: noHatState,
      defaultState: localize(11025, null),
      selectedAriaLabel: localize(11023, null),
      defaultAriaLabel: localize(11022, null)
    });
    cards.set(noHatId, noHatCard);
    for (const achievement of chatPetAchievements) {
      const unlocked = unlockedSet.has(achievement.id);
      const presentation2 = getChatPetAchievementPresentation(achievement, unlocked);
      const wearing = unlocked && achievement.accessories.some((accessory) => selectedAccessory === accessory.id);
      const item = append(list2, $("li.chat-pet-achievements-list-item"));
      const accessoryId = achievement.accessories[0].id;
      const card = this.renderDisposables.add(new Button(item, {
        secondary: true,
        ariaLabel: presentation2.locked ? localize(11020, null, presentation2.hint, presentation2.rewardLabels.join(", ")) : localize(11016, null, presentation2.title, presentation2.accessories[0].label, wearing ? localize(11027, null) : localize(11026, null))
      }));
      card.element.classList.add("chat-pet-achievement-card");
      card.element.dataset.accessoryId = accessoryId;
      card.element.classList.toggle("locked", !unlocked);
      card.element.classList.toggle("wearing", wearing);
      card.element.setAttribute("aria-pressed", String(wearing));
      card.enabled = unlocked;
      const newBadge = append(card.element, $("span.chat-pet-achievement-new-badge.hidden"));
      newBadge.textContent = localize(11021, null);
      newBadge.setAttribute("aria-hidden", "true");
      const previews = append(card.element, $(".chat-pet-achievement-previews"));
      const previewAccessories = unlocked ? achievement.accessories : [achievement.accessories[0]];
      for (const accessory of previewAccessories) {
        this.renderCardPreview(previews, accessory, unlocked, variant);
      }
      const cardContent = append(card.element, $(".chat-pet-achievement-card-content"));
      if (!presentation2.locked) {
        append(cardContent, $("h3")).textContent = presentation2.title;
        const state = append(cardContent, $("span.chat-pet-achievement-state"));
        state.textContent = wearing ? localize(11027, null) : localize(11026, null);
        append(cardContent, $("p.chat-pet-achievement-description")).textContent = presentation2.description;
        append(cardContent, $("p.chat-pet-achievement-reward")).textContent = localize(11024, null, presentation2.accessories.map((accessory) => accessory.label).join(", "));
        this.accessoryCards.set(accessoryId, {
          button: card,
          state,
          defaultState: localize(11026, null),
          selectedAriaLabel: localize(11016, null, achievement.title, achievement.accessories[0].label, localize(11027, null)),
          defaultAriaLabel: localize(11016, null, achievement.title, achievement.accessories[0].label, localize(11026, null)),
          achievementId: achievement.id,
          newBadge
        });
      } else {
        append(cardContent, $("h3")).textContent = localize(11019, null);
        append(cardContent, $("span.chat-pet-achievement-state")).textContent = localize(11018, null);
        append(cardContent, $("p.chat-pet-achievement-description")).textContent = presentation2.hint;
        append(cardContent, $("p.chat-pet-achievement-reward")).textContent = localize(11024, null, presentation2.rewardLabels.join(", "));
      }
      this.renderDisposables.add(card.onDidClick(() => this.selectAccessory(accessoryId, achievement.id)));
      this.renderDisposables.add(card.onDidEscape(() => this.onDidRequestClose()));
      cards.set(accessoryId, card);
    }
    const roadmapItem = append(list2, $("li.chat-pet-achievements-list-item"));
    const roadmapCard = append(roadmapItem, $("article.chat-pet-achievement-card.chat-pet-achievement-roadmap"));
    const roadmapPreview = append(roadmapCard, $(".chat-pet-achievement-roadmap-preview"));
    roadmapPreview.textContent = localize(11040, null);
    const roadmapContent = append(roadmapCard, $(".chat-pet-achievement-card-content"));
    append(roadmapContent, $("h3")).textContent = localize(11042, null);
    append(roadmapContent, $("span.chat-pet-achievement-state")).textContent = localize(11041, null);
    const roadmapIntro = append(roadmapContent, $("p.chat-pet-achievement-description"));
    roadmapIntro.textContent = localize(11037, null);
    const roadmapList = append(roadmapContent, $("ul.chat-pet-achievement-roadmap-list"));
    for (const item of [
      localize(11039, null),
      localize(11038, null),
      localize(11036, null)
    ]) {
      append(roadmapList, $("li")).textContent = item;
    }
    const experimentalNote = append(inner, $("p.chat-pet-achievements-experimental"));
    experimentalNote.textContent = localize(11031, null);
    this.scrollable.scanDomNode();
    this.layout(this.lastDimension);
    this.updateNewAchievements(this.chatPetService.unseenAchievements.read(void 0));
    const selectedCardId = selectedAccessory ?? noHatId;
    this.focusTarget = () => cards.get(selectedCardId)?.focus();
    if (restoreFocusId) {
      queueMicrotask(() => {
        if (!this._store.isDisposed) {
          cards.get(restoreFocusId)?.focus();
        }
      });
    }
  }
  renderCardPreview(previews, accessory, unlocked, variant) {
    const preview = append(previews, $("canvas.chat-pet-achievement-preview"));
    preview.width = CHAT_PET_ACHIEVEMENT_PREVIEW_SIZE;
    preview.height = CHAT_PET_ACHIEVEMENT_PREVIEW_SIZE;
    preview.setAttribute("aria-hidden", "true");
    this.renderDisposables.add(renderChatPetAchievementPreview(preview, accessory, unlocked, variant, this.themeService, this.logService));
  }
  selectAccessory(accessoryId, achievementId) {
    if (achievementId) {
      this.chatPetService.markAchievementSeen(achievementId);
    }
    if (accessoryId === this.chatPetService.selectedAccessory.get()) {
      return;
    }
    this.chatPetService.setAccessory(accessoryId);
    status(accessoryId === void 0 ? localize(11032, null) : localize(11033, null, getChatPetAccessory(accessoryId).label));
  }
  updateSelectedAccessory(accessoryId) {
    const selectedId = accessoryId ?? "none";
    for (const [id2, card] of this.accessoryCards) {
      const wearing = id2 === selectedId;
      card.button.element.classList.toggle("wearing", wearing);
      card.button.element.setAttribute("aria-pressed", String(wearing));
      const baseAriaLabel = wearing ? card.selectedAriaLabel : card.defaultAriaLabel;
      card.button.setAriaLabel(card.achievementId && this.unseenAchievementIds.has(card.achievementId) ? localize(11017, null, baseAriaLabel) : baseAriaLabel);
      card.state.textContent = wearing ? localize(11027, null) : card.defaultState;
    }
    this.focusTarget = () => this.accessoryCards.get(selectedId)?.button.focus();
  }
  updateNewAchievements(achievementIds) {
    this.unseenAchievementIds = new Set(achievementIds);
    for (const card of this.accessoryCards.values()) {
      card.newBadge?.classList.toggle("hidden", !card.achievementId || !this.unseenAchievementIds.has(card.achievementId));
    }
    this.updateSelectedAccessory(this.chatPetService.selectedAccessory.read(void 0));
  }
};

ChatPetAchievementsWidget = __decorateClass([
  __decorateParam(2, IChatPetService),
  __decorateParam(3, IThemeService),
  __decorateParam(4, ILogService)
], ChatPetAchievementsWidget);
export { ChatPetAchievementsWidget };
