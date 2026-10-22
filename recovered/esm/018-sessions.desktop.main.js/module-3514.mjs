// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/accountMenu/browser/chatPetAchievementBadges.ts
import { chatPetAchievements } from "./module-2111.mjs";
import { Disposable, DisposableStore } from "./module-0012.mjs";
import { $, append, clearNode, getActiveElement } from "./module-0075.mjs";
import { observableSignalFromEvent } from "./module-0062.mjs";
import { autorun } from "./module-0052.mjs";
import { localize } from "./module-0001.mjs";
import { CHAT_PET_ACHIEVEMENT_PREVIEW_SIZE, renderChatPetAchievementPreview } from "./module-2742.mjs";
import { getDefaultHoverDelegate } from "./module-0448.mjs";
import { Button } from "./module-0546.mjs";
import { defaultButtonStyles } from "./module-0513.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IChatPetService } from "./module-2112.mjs";
import { IThemeService } from "./module-0287.mjs";
import { IHoverService } from "./module-0520.mjs";
import { ILogService } from "./module-0095.mjs";


// src/vs/sessions/contrib/accountMenu/browser/chatPetAchievementBadges.ts
function getSessionsChatPetAchievementBadges(enabled, unlockedAchievements) {
  if (!enabled) {
    return void 0;
  }
  const unlocked = new Set(unlockedAchievements);
  const badges = chatPetAchievements.map((achievement) => ({ achievement, unlocked: unlocked.has(achievement.id) }));
  return [
    ...badges.filter((badge) => badge.unlocked),
    ...badges.filter((badge) => !badge.unlocked)
  ];
}

var SessionsChatPetAchievementBadges = class extends Disposable {
  constructor(parent, onOpenAchievements, chatPetService, themeService, hoverService, logService) {
    super();
    this.onOpenAchievements = onOpenAchievements;
    this.chatPetService = chatPetService;
    this.themeService = themeService;
    this.hoverService = hoverService;
    this.logService = logService;
    this.renderDisposables = this._register(new DisposableStore());
    this.element = append(parent, $("section.sessions-chat-pet-achievement-badges"));
    const themeChanged = observableSignalFromEvent(this, this.themeService.onDidColorThemeChange);
    this._register(autorun((reader) => {
      const badges = getSessionsChatPetAchievementBadges(
        this.chatPetService.enabled.read(reader),
        this.chatPetService.unlockedAchievements.read(reader)
      );
      const variant = this.chatPetService.variant.read(reader);
      themeChanged.read(reader);
      this.render(badges, variant);
    }));
  }
  render(badges, variant) {
    const restoreListFocus = this.badgesList === getActiveElement();
    this.renderDisposables.clear();
    clearNode(this.element);
    this.badgesList = void 0;
    this.element.classList.toggle("hidden", badges === void 0);
    if (!badges) {
      return;
    }
    this.element.setAttribute("aria-label", localize(4032, null));
    const header2 = append(this.element, $(".sessions-chat-pet-achievement-badges-header"));
    append(header2, $("h2.sessions-chat-pet-achievement-badges-title")).textContent = localize(4033, null);
    const unlockedCount = badges.filter((badge) => badge.unlocked).length;
    append(header2, $("span.sessions-chat-pet-achievement-badges-count")).textContent = localize(4030, null, unlockedCount, badges.length);
    const list2 = this.badgesList = append(this.element, $("ul.sessions-chat-pet-achievement-badges-list"));
    list2.tabIndex = 0;
    list2.setAttribute("aria-label", localize(4031, null, unlockedCount, badges.length));
    for (const badge of badges) {
      const { achievement, unlocked } = badge;
      const accessory = achievement.accessories[0];
      const item = append(list2, $("li.sessions-chat-pet-achievement-badge"));
      item.classList.toggle("locked", !unlocked);
      item.setAttribute("aria-label", unlocked ? localize(4027, null, achievement.title, accessory.label) : localize(4029, null));
      const canvas = append(item, $("canvas.sessions-chat-pet-achievement-badge-preview"));
      canvas.width = CHAT_PET_ACHIEVEMENT_PREVIEW_SIZE;
      canvas.height = CHAT_PET_ACHIEVEMENT_PREVIEW_SIZE;
      canvas.setAttribute("aria-hidden", "true");
      this.renderDisposables.add(renderChatPetAchievementPreview(canvas, accessory, unlocked, variant, this.themeService, this.logService));
      this.renderDisposables.add(this.hoverService.setupManagedHover(getDefaultHoverDelegate("mouse"), item, unlocked ? achievement.title : localize(4028, null)));
    }
    const actions = append(this.element, $(".sessions-chat-pet-achievement-badges-actions"));
    const viewAchievements = this.renderDisposables.add(new Button(actions, {
      ...defaultButtonStyles,
      secondary: true,
      ariaLabel: localize(4035, null)
    }));
    viewAchievements.label = localize(4034, null);
    this.renderDisposables.add(viewAchievements.onDidClick(() => this.onOpenAchievements()));
    if (restoreListFocus) {
      queueMicrotask(() => {
        if (!this._store.isDisposed && list2.isConnected) {
          list2.focus();
        }
      });
    }
  }
};

SessionsChatPetAchievementBadges = __decorateClass([
  __decorateParam(2, IChatPetService),
  __decorateParam(3, IThemeService),
  __decorateParam(4, IHoverService),
  __decorateParam(5, ILogService)
], SessionsChatPetAchievementBadges);
export { getSessionsChatPetAchievementBadges, SessionsChatPetAchievementBadges };
