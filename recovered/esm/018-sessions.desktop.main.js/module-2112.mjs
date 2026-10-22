// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/chatPetService.ts
import { RawContextKey } from "./module-0089.mjs";
import { localize } from "./module-0001.mjs";
import { createDecorator } from "./module-0077.mjs";
import { Disposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { observableValue } from "./module-0048.mjs";
import { product_default } from "./module-0139.mjs";
import { ChatPetAchievementIds, allChatPetAchievements, chatPetAchievements, getChatPetAchievementForAccessory, isChatPetAccessoryId, isChatPetAchievementEnabled, isChatPetAchievementId } from "./module-2111.mjs";
import { status } from "./module-0076.mjs";
import { transaction } from "./module-0045.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IStorageService } from "./module-0512.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { ILogService } from "./module-0095.mjs";


// src/vs/workbench/contrib/chat/browser/chatPetService.ts
var CHAT_PET_ENABLED_STORAGE_KEY = "chat.vscodePet.enabled";

var CHAT_PET_VARIANT_STORAGE_KEY = "chat.vscodePet.variant";

var CHAT_PET_ON_THE_RUN_STORAGE_KEY = "chat.vscodePet.onTheRun";

var CHAT_PET_ACCESSORY_STORAGE_KEY = "chat.vscodePet.accessory";

var CHAT_PET_ACHIEVEMENT_SEEN_STORAGE_PREFIX = "chat.vscodePet.achievementSeen.";

var CHAT_PET_ACHIEVEMENT_CATALOG_VERSION_STORAGE_KEY = "chat.vscodePet.achievementCatalogVersion";

var CHAT_PET_ACHIEVEMENT_CATALOG_VERSION = 4;

var CHAT_PET_LOCAL_ACHIEVEMENT_MIGRATION_VERSION_STORAGE_KEY = "chat.vscodePet.localAchievementMigrationVersion";

var CHAT_PET_LOCAL_ACHIEVEMENT_MIGRATION_VERSION = 1;

var CHAT_PET_SCALE_STORAGE_KEY = "chat.vscodePet.scale";

var CHAT_PET_HORIZONTAL_POSITION_STORAGE_KEY = "chat.vscodePet.horizontalPosition";

var CHAT_PET_DEFAULT_SCALE = 1;

var ChatPetContextKeys = {
  enabled: new RawContextKey("chatPetEnabled", false, localize(11044, null))
};

function getChatPetVariant(configuredVariant, productQuality) {
  if (configuredVariant === "stable" || configuredVariant === "insiders") {
    return configuredVariant;
  }
  return productQuality === "stable" ? "stable" : "insiders";
}

function getChatPetScale(storedScale) {
  const scale = storedScale === void 0 ? Number.NaN : Number.parseFloat(storedScale);
  return Number.isFinite(scale) && scale > 0 ? scale : CHAT_PET_DEFAULT_SCALE;
}

function getChatPetHorizontalPosition(storedPosition) {
  const position2 = storedPosition === void 0 ? Number.NaN : Number.parseFloat(storedPosition);
  return Number.isFinite(position2) ? Math.max(0, Math.min(1, position2)) : void 0;
}

var IChatPetService = createDecorator("chatPetService");

var ChatPetService = class extends Disposable {
  constructor(storageService, telemetryService, logService) {
    super();
    this.storageService = storageService;
    this.telemetryService = telemetryService;
    this.logService = logService;
    this._onDidUnlockAchievement = this._register(new Emitter());
    this.onDidUnlockAchievement = this._onDidUnlockAchievement.event;
    this.locallyUnlockingAchievement = false;
    this._migrateAchievementStorage();
    this._enabled = observableValue(this, this.storageService.getBoolean(CHAT_PET_ENABLED_STORAGE_KEY, -1 /* APPLICATION */, false));
    this.enabled = this._enabled;
    this._variant = observableValue(this, getChatPetVariant(this.storageService.get(CHAT_PET_VARIANT_STORAGE_KEY, -1 /* APPLICATION */), product_default.quality));
    this.variant = this._variant;
    this._onTheRun = observableValue(this, this.storageService.getBoolean(CHAT_PET_ON_THE_RUN_STORAGE_KEY, -1 /* APPLICATION */, false));
    this.onTheRun = this._onTheRun;
    this._scale = observableValue(this, getChatPetScale(this.storageService.get(CHAT_PET_SCALE_STORAGE_KEY, -1 /* APPLICATION */)));
    this.scale = this._scale;
    this._unlockedAchievements = observableValue(this, this._readUnlockedAchievements());
    this.unlockedAchievements = this._unlockedAchievements;
    this._unseenAchievements = observableValue(this, this._readUnseenAchievements());
    this.unseenAchievements = this._unseenAchievements;
    this._selectedAccessory = observableValue(this, this._readSelectedAccessory());
    this.selectedAccessory = this._selectedAccessory;
    this._horizontalPosition = observableValue(this, getChatPetHorizontalPosition(this.storageService.get(CHAT_PET_HORIZONTAL_POSITION_STORAGE_KEY, -1 /* APPLICATION */)));
    this.horizontalPosition = this._horizontalPosition;
    this._register(this.storageService.onDidChangeValue(-1 /* APPLICATION */, CHAT_PET_ENABLED_STORAGE_KEY, this._store)(() => {
      this._setEnabled(this.storageService.getBoolean(CHAT_PET_ENABLED_STORAGE_KEY, -1 /* APPLICATION */, false));
    }));
    this._register(this.storageService.onDidChangeValue(-1 /* APPLICATION */, CHAT_PET_VARIANT_STORAGE_KEY, this._store)(() => {
      this._variant.set(getChatPetVariant(this.storageService.get(CHAT_PET_VARIANT_STORAGE_KEY, -1 /* APPLICATION */), product_default.quality), void 0);
    }));
    this._register(this.storageService.onDidChangeValue(-1 /* APPLICATION */, CHAT_PET_ON_THE_RUN_STORAGE_KEY, this._store)(() => {
      this._onTheRun.set(this.storageService.getBoolean(CHAT_PET_ON_THE_RUN_STORAGE_KEY, -1 /* APPLICATION */, false), void 0);
    }));
    for (const achievement of allChatPetAchievements) {
      this._register(this.storageService.onDidChangeValue(-2 /* APPLICATION_SHARED */, this._getAchievementStorageKey(achievement.id), this._store)(() => {
        this._refreshAchievementState(!this.locallyUnlockingAchievement);
      }));
      this._register(this.storageService.onDidChangeValue(-2 /* APPLICATION_SHARED */, this._getAchievementSeenStorageKey(achievement.id), this._store)(() => {
        this._refreshUnseenAchievementState();
      }));
    }
    this._register(this.storageService.onDidChangeValue(-2 /* APPLICATION_SHARED */, CHAT_PET_ACCESSORY_STORAGE_KEY, this._store)(() => {
      this._refreshSelectedAccessory();
    }));
    this._register(this.storageService.onDidChangeValue(-1 /* APPLICATION */, CHAT_PET_SCALE_STORAGE_KEY, this._store)(() => {
      this._scale.set(getChatPetScale(this.storageService.get(CHAT_PET_SCALE_STORAGE_KEY, -1 /* APPLICATION */)), void 0);
    }));
    this._register(this.storageService.onDidChangeValue(-1 /* APPLICATION */, CHAT_PET_HORIZONTAL_POSITION_STORAGE_KEY, this._store)(() => {
      this._horizontalPosition.set(getChatPetHorizontalPosition(this.storageService.get(CHAT_PET_HORIZONTAL_POSITION_STORAGE_KEY, -1 /* APPLICATION */)), void 0);
    }));
    this._logEnablement(this._enabled.get(), "startup");
  }
  toggle() {
    const enabled = !this._enabled.get();
    this._setEnabled(enabled);
    this.storageService.store(CHAT_PET_ENABLED_STORAGE_KEY, enabled, -1 /* APPLICATION */, 0 /* USER */);
    status(enabled ? localize(11046, null) : localize(11045, null));
    return enabled;
  }
  _setEnabled(enabled) {
    if (enabled === this._enabled.get()) {
      return;
    }
    this._enabled.set(enabled, void 0);
    this._logEnablement(enabled, "change");
  }
  _logEnablement(enabled, source) {
    this.telemetryService.publicLog2("chatPetEnablement", { enabled, source });
  }
  setVariant(variant) {
    this._variant.set(variant, void 0);
    this.storageService.store(CHAT_PET_VARIANT_STORAGE_KEY, variant, -1 /* APPLICATION */, 0 /* USER */);
    status(variant === "stable" ? localize(11050, null) : localize(11049, null));
  }
  setOnTheRun(onTheRun) {
    this._onTheRun.set(onTheRun, void 0);
    this.storageService.store(CHAT_PET_ON_THE_RUN_STORAGE_KEY, onTheRun, -1 /* APPLICATION */, 0 /* USER */);
    status(onTheRun ? localize(11047, null) : localize(11048, null));
  }
  setScale(scale) {
    this._scale.set(scale, void 0);
    this.storageService.store(CHAT_PET_SCALE_STORAGE_KEY, scale, -1 /* APPLICATION */, 0 /* USER */);
  }
  resetScale() {
    this._scale.set(CHAT_PET_DEFAULT_SCALE, void 0);
    this.storageService.remove(CHAT_PET_SCALE_STORAGE_KEY, -1 /* APPLICATION */);
  }
  setHorizontalPosition(position2) {
    const normalizedPosition = Math.max(0, Math.min(1, position2));
    this._horizontalPosition.set(normalizedPosition, void 0);
    this.storageService.store(CHAT_PET_HORIZONTAL_POSITION_STORAGE_KEY, normalizedPosition, -1 /* APPLICATION */, 1 /* MACHINE */);
  }
  unlockAchievement(id2) {
    if (!isChatPetAchievementId(id2)) {
      throw new Error(`Unknown chat pet achievement: ${id2}`);
    }
    if (!isChatPetAchievementEnabled(id2)) {
      return false;
    }
    if (!this._enabled.get()) {
      return false;
    }
    if (this._isAchievementStored(id2)) {
      this._refreshAchievementState();
      return false;
    }
    this.locallyUnlockingAchievement = true;
    try {
      this.storageService.store(this._getAchievementStorageKey(id2), true, -2 /* APPLICATION_SHARED */, 0 /* USER */);
    } finally {
      this.locallyUnlockingAchievement = false;
    }
    this._refreshAchievementState();
    this._onDidUnlockAchievement.fire(id2);
    return true;
  }
  markAchievementSeen(id2) {
    if (!this._unseenAchievements.get().includes(id2)) {
      return false;
    }
    this.storageService.store(this._getAchievementSeenStorageKey(id2), true, -2 /* APPLICATION_SHARED */, 0 /* USER */);
    this._refreshUnseenAchievementState();
    return true;
  }
  setAccessory(id2) {
    if (id2 !== void 0) {
      if (!isChatPetAccessoryId(id2)) {
        throw new Error(`Unknown chat pet accessory: ${id2}`);
      }
      const achievement = getChatPetAchievementForAccessory(id2);
      if (!achievement.enabled) {
        throw new Error(`Chat pet accessory is disabled: ${id2}`);
      }
      if (!this._unlockedAchievements.get().includes(achievement.id)) {
        throw new Error(`Chat pet accessory is locked: ${id2}`);
      }
      this.storageService.store(CHAT_PET_ACCESSORY_STORAGE_KEY, id2, -2 /* APPLICATION_SHARED */, 0 /* USER */);
    } else {
      this.storageService.remove(CHAT_PET_ACCESSORY_STORAGE_KEY, -2 /* APPLICATION_SHARED */);
      this.storageService.remove(CHAT_PET_ACCESSORY_STORAGE_KEY, -1 /* APPLICATION */);
    }
    this.lastInvalidStoredAccessory = void 0;
    this._selectedAccessory.set(id2, void 0);
  }
  resetAchievements() {
    this.locallyUnlockingAchievement = true;
    try {
      for (const achievement of allChatPetAchievements) {
        const key3 = this._getAchievementStorageKey(achievement.id);
        this.storageService.remove(key3, -2 /* APPLICATION_SHARED */);
        this.storageService.remove(key3, -1 /* APPLICATION */);
        const seenKey = this._getAchievementSeenStorageKey(achievement.id);
        this.storageService.remove(seenKey, -2 /* APPLICATION_SHARED */);
        this.storageService.remove(seenKey, -1 /* APPLICATION */);
      }
      this.storageService.remove("chat.vscodePet.achievement.checkpointRestore", -2 /* APPLICATION_SHARED */);
      this.storageService.remove("chat.vscodePet.achievement.checkpointRestore", -1 /* APPLICATION */);
      this.storageService.remove("chat.vscodePet.achievement.integratedBrowserOpened", -2 /* APPLICATION_SHARED */);
      this.storageService.remove("chat.vscodePet.achievement.integratedBrowserOpened", -1 /* APPLICATION */);
      this.storageService.remove("chat.vscodePet.achievement.chatFork", -2 /* APPLICATION_SHARED */);
      this.storageService.remove("chat.vscodePet.achievement.chatFork", -1 /* APPLICATION */);
      this.storageService.remove(CHAT_PET_ACCESSORY_STORAGE_KEY, -2 /* APPLICATION_SHARED */);
      this.storageService.remove(CHAT_PET_ACCESSORY_STORAGE_KEY, -1 /* APPLICATION */);
    } finally {
      this.locallyUnlockingAchievement = false;
    }
    transaction((tx) => {
      this._unlockedAchievements.set([], tx);
      this._unseenAchievements.set([], tx);
      this._selectedAccessory.set(void 0, tx);
    });
  }
  _getAchievementStorageKey(id2) {
    return `chat.vscodePet.achievement.${id2}`;
  }
  _getAchievementSeenStorageKey(id2) {
    return `${CHAT_PET_ACHIEVEMENT_SEEN_STORAGE_PREFIX}${id2}`;
  }
  _migrateAchievementStorage() {
    this._migrateLocalAchievementStorage();
    const version2 = this.storageService.getNumber(CHAT_PET_ACHIEVEMENT_CATALOG_VERSION_STORAGE_KEY, -2 /* APPLICATION_SHARED */, 0);
    if (version2 >= CHAT_PET_ACHIEVEMENT_CATALOG_VERSION) {
      return;
    }
    const wasUnlocked = (id2) => this.storageService.getBoolean(`chat.vscodePet.achievement.${id2}`, -2 /* APPLICATION_SHARED */, false);
    this._storeLegacyAchievementRewards(
      wasUnlocked("checkpointRestore"),
      wasUnlocked("chatFork"),
      wasUnlocked(ChatPetAchievementIds.RequestRevision),
      wasUnlocked(ChatPetAchievementIds.ModelSwitch)
    );
    this.storageService.store(CHAT_PET_ACHIEVEMENT_CATALOG_VERSION_STORAGE_KEY, CHAT_PET_ACHIEVEMENT_CATALOG_VERSION, -2 /* APPLICATION_SHARED */, 0 /* USER */);
  }
  _migrateLocalAchievementStorage() {
    const version2 = this.storageService.getNumber(CHAT_PET_LOCAL_ACHIEVEMENT_MIGRATION_VERSION_STORAGE_KEY, -1 /* APPLICATION */, 0);
    if (version2 >= CHAT_PET_LOCAL_ACHIEVEMENT_MIGRATION_VERSION) {
      return;
    }
    const localUnlockedAchievements = allChatPetAchievements.filter((achievement) => this.storageService.getBoolean(this._getAchievementStorageKey(achievement.id), -1 /* APPLICATION */, false)).map((achievement) => achievement.id);
    const checkpointRestoreUnlocked = this.storageService.getBoolean("chat.vscodePet.achievement.checkpointRestore", -1 /* APPLICATION */, false);
    const chatForkUnlocked = this.storageService.getBoolean("chat.vscodePet.achievement.chatFork", -1 /* APPLICATION */, false);
    const localAccessory = this.storageService.get(CHAT_PET_ACCESSORY_STORAGE_KEY, -1 /* APPLICATION */);
    for (const id2 of localUnlockedAchievements) {
      this.storageService.store(this._getAchievementStorageKey(id2), true, -2 /* APPLICATION_SHARED */, 0 /* USER */);
    }
    this._storeLegacyAchievementRewards(
      checkpointRestoreUnlocked,
      chatForkUnlocked,
      localUnlockedAchievements.includes(ChatPetAchievementIds.RequestRevision),
      localUnlockedAchievements.includes(ChatPetAchievementIds.ModelSwitch)
    );
    if (localAccessory !== void 0 && this.storageService.get(CHAT_PET_ACCESSORY_STORAGE_KEY, -2 /* APPLICATION_SHARED */) === void 0) {
      this.storageService.store(CHAT_PET_ACCESSORY_STORAGE_KEY, localAccessory, -2 /* APPLICATION_SHARED */, 0 /* USER */);
    }
    this.storageService.store(CHAT_PET_LOCAL_ACHIEVEMENT_MIGRATION_VERSION_STORAGE_KEY, CHAT_PET_LOCAL_ACHIEVEMENT_MIGRATION_VERSION, -1 /* APPLICATION */, 0 /* USER */);
  }
  _storeLegacyAchievementRewards(checkpointRestoreUnlocked, chatForkUnlocked, requestRevisionUnlocked, modelSwitchUnlocked) {
    if (checkpointRestoreUnlocked || chatForkUnlocked) {
      this.storageService.store(this._getAchievementStorageKey(ChatPetAchievementIds.FirstChatMessage), true, -2 /* APPLICATION_SHARED */, 0 /* USER */);
    }
    if (requestRevisionUnlocked) {
      this.storageService.store(this._getAchievementStorageKey(ChatPetAchievementIds.ChatOutputCopied), true, -2 /* APPLICATION_SHARED */, 0 /* USER */);
    }
    if (modelSwitchUnlocked) {
      this.storageService.store(this._getAchievementStorageKey(ChatPetAchievementIds.QueueOrSteeringMessage), true, -2 /* APPLICATION_SHARED */, 0 /* USER */);
    }
  }
  _readUnlockedAchievements() {
    return chatPetAchievements.filter((achievement) => this._isAchievementStored(achievement.id)).map((achievement) => achievement.id);
  }
  _isAchievementStored(id2) {
    const achievementKey = this._getAchievementStorageKey(id2);
    return this.storageService.getBoolean(achievementKey, -2 /* APPLICATION_SHARED */, false) || this.storageService.getBoolean(achievementKey, -1 /* APPLICATION */, false);
  }
  _refreshAchievementState(fireUnlockEvents = false) {
    const previousAchievements = this._unlockedAchievements.get();
    const unlockedAchievements = this._readUnlockedAchievements();
    if (!this._haveSameAchievements(previousAchievements, unlockedAchievements)) {
      this._unlockedAchievements.set(unlockedAchievements, void 0);
      if (fireUnlockEvents) {
        const previous = new Set(previousAchievements);
        for (const id2 of unlockedAchievements) {
          if (!previous.has(id2)) {
            this._onDidUnlockAchievement.fire(id2);
          }
        }
      }
    }
    this._refreshUnseenAchievementState();
    this._refreshSelectedAccessory();
  }
  _readUnseenAchievements() {
    const unlocked = new Set(this._unlockedAchievements.get());
    return chatPetAchievements.filter((achievement) => unlocked.has(achievement.id) && !this.storageService.getBoolean(this._getAchievementSeenStorageKey(achievement.id), -2 /* APPLICATION_SHARED */, false)).map((achievement) => achievement.id);
  }
  _refreshUnseenAchievementState() {
    const unseenAchievements = this._readUnseenAchievements();
    if (!this._haveSameAchievements(this._unseenAchievements.get(), unseenAchievements)) {
      this._unseenAchievements.set(unseenAchievements, void 0);
    }
  }
  _haveSameAchievements(first2, second) {
    return first2.length === second.length && first2.every((id2, index2) => id2 === second[index2]);
  }
  _refreshSelectedAccessory() {
    this._selectedAccessory.set(this._readSelectedAccessory(), void 0);
  }
  _readSelectedAccessory() {
    const storedAccessory = this.storageService.get(CHAT_PET_ACCESSORY_STORAGE_KEY, -2 /* APPLICATION_SHARED */) ?? this.storageService.get(CHAT_PET_ACCESSORY_STORAGE_KEY, -1 /* APPLICATION */);
    if (storedAccessory === void 0) {
      this.lastInvalidStoredAccessory = void 0;
      return void 0;
    }
    if (isChatPetAccessoryId(storedAccessory)) {
      const achievement = getChatPetAchievementForAccessory(storedAccessory);
      if (this._unlockedAchievements.get().includes(achievement.id)) {
        this.lastInvalidStoredAccessory = void 0;
        return storedAccessory;
      }
    }
    if (this.lastInvalidStoredAccessory !== storedAccessory) {
      this.lastInvalidStoredAccessory = storedAccessory;
      this.logService.warn(`[ChatPetService] Ignoring unknown or locked stored accessory: ${storedAccessory}`);
    }
    return void 0;
  }
};

ChatPetService = __decorateClass([
  __decorateParam(0, IStorageService),
  __decorateParam(1, ITelemetryService),
  __decorateParam(2, ILogService)
], ChatPetService);
export { getChatPetVariant, getChatPetScale, getChatPetHorizontalPosition, CHAT_PET_ENABLED_STORAGE_KEY, CHAT_PET_VARIANT_STORAGE_KEY, CHAT_PET_ON_THE_RUN_STORAGE_KEY, CHAT_PET_ACCESSORY_STORAGE_KEY, CHAT_PET_ACHIEVEMENT_SEEN_STORAGE_PREFIX, CHAT_PET_ACHIEVEMENT_CATALOG_VERSION_STORAGE_KEY, CHAT_PET_ACHIEVEMENT_CATALOG_VERSION, CHAT_PET_LOCAL_ACHIEVEMENT_MIGRATION_VERSION_STORAGE_KEY, CHAT_PET_LOCAL_ACHIEVEMENT_MIGRATION_VERSION, CHAT_PET_SCALE_STORAGE_KEY, CHAT_PET_HORIZONTAL_POSITION_STORAGE_KEY, CHAT_PET_DEFAULT_SCALE, ChatPetContextKeys, IChatPetService, ChatPetService };
