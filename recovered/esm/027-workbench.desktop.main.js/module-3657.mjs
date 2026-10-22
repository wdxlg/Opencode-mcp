// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/accessibilitySignals/browser/commands.ts
import { Action2 } from "./module-0092.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { AccessibilitySignal, AcknowledgeDocCommentsToken, IAccessibilitySignalService } from "./module-0445.mjs";
import { IQuickInputService } from "./module-0536.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IAccessibilityService } from "./module-0104.mjs";
import { IPreferencesService } from "./module-1294.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { Codicon } from "./module-0085.mjs";
import { DisposableStore } from "./module-0012.mjs";


// src/vs/workbench/contrib/accessibilitySignals/browser/commands.ts
var ShowSignalSoundHelp = class _ShowSignalSoundHelp extends Action2 {
  static {
    this.ID = "signals.sounds.help";
  }
  constructor() {
    super({
      id: _ShowSignalSoundHelp.ID,
      title: localize2(7805, "Help: List Signal Sounds"),
      f1: true,
      metadata: {
        description: localize(7801, null)
      }
    });
  }
  async run(accessor) {
    const accessibilitySignalService = accessor.get(IAccessibilitySignalService);
    const quickInputService = accessor.get(IQuickInputService);
    const configurationService = accessor.get(IConfigurationService);
    const accessibilityService = accessor.get(IAccessibilityService);
    const preferencesService = accessor.get(IPreferencesService);
    const userGestureSignals = [AccessibilitySignal.save, AccessibilitySignal.format];
    const items = AccessibilitySignal.allAccessibilitySignals.map((signal, idx) => ({
      label: userGestureSignals.includes(signal) ? `${signal.name} (${configurationService.getValue(signal.settingsKey + ".sound")})` : signal.name,
      signal,
      buttons: userGestureSignals.includes(signal) ? [{
        iconClass: ThemeIcon.asClassName(Codicon.settingsGear),
        tooltip: localize(7807, null),
        alwaysVisible: true
      }] : []
    })).sort((a, b) => a.label.localeCompare(b.label));
    const disposables = new DisposableStore();
    const qp = disposables.add(quickInputService.createQuickPick());
    qp.items = items;
    qp.selectedItems = items.filter((i2) => accessibilitySignalService.isSoundEnabled(i2.signal) || userGestureSignals.includes(i2.signal) && configurationService.getValue(i2.signal.settingsKey + ".sound") !== "never");
    disposables.add(qp.onDidAccept(() => {
      const enabledSounds = qp.selectedItems.map((i2) => i2.signal);
      const disabledSounds = qp.items.map((i2) => i2.signal).filter((i2) => !enabledSounds.includes(i2));
      for (const signal of enabledSounds) {
        let { sound, announcement } = configurationService.getValue(signal.settingsKey);
        sound = userGestureSignals.includes(signal) ? "userGesture" : accessibilityService.isScreenReaderOptimized() ? "auto" : "on";
        if (announcement) {
          configurationService.updateValue(signal.settingsKey, { sound, announcement });
        } else {
          configurationService.updateValue(signal.settingsKey, { sound });
        }
      }
      for (const signal of disabledSounds) {
        const announcement = configurationService.getValue(signal.settingsKey + ".announcement");
        const sound = getDisabledSettingValue(userGestureSignals.includes(signal), accessibilityService.isScreenReaderOptimized());
        const value2 = announcement ? { sound, announcement } : { sound };
        configurationService.updateValue(signal.settingsKey, value2);
      }
      qp.hide();
    }));
    disposables.add(qp.onDidTriggerItemButton((e) => {
      preferencesService.openUserSettings({ jsonEditor: true, revealSetting: { key: e.item.signal.settingsKey, edit: true } });
    }));
    disposables.add(qp.onDidChangeActive(() => {
      accessibilitySignalService.playSound(qp.activeItems[0].signal.sound.getSound(true), true, AcknowledgeDocCommentsToken);
    }));
    disposables.add(qp.onDidHide(() => disposables.dispose()));
    qp.placeholder = localize(7806, null);
    qp.canSelectMany = true;
    await qp.show();
  }
};

function getDisabledSettingValue(isUserGestureSignal, isScreenReaderOptimized) {
  return isScreenReaderOptimized ? isUserGestureSignal ? "never" : "off" : isUserGestureSignal ? "never" : "auto";
}

var ShowAccessibilityAnnouncementHelp = class _ShowAccessibilityAnnouncementHelp extends Action2 {
  static {
    this.ID = "accessibility.announcement.help";
  }
  constructor() {
    super({
      id: _ShowAccessibilityAnnouncementHelp.ID,
      title: localize2(7799, "Help: List Signal Announcements"),
      f1: true,
      metadata: {
        description: localize(7800, null)
      }
    });
  }
  async run(accessor) {
    const accessibilitySignalService = accessor.get(IAccessibilitySignalService);
    const quickInputService = accessor.get(IQuickInputService);
    const configurationService = accessor.get(IConfigurationService);
    const accessibilityService = accessor.get(IAccessibilityService);
    const preferencesService = accessor.get(IPreferencesService);
    const userGestureSignals = [AccessibilitySignal.save, AccessibilitySignal.format];
    const items = AccessibilitySignal.allAccessibilitySignals.filter((c) => !!c.legacyAnnouncementSettingsKey).map((signal, idx) => ({
      label: userGestureSignals.includes(signal) ? `${signal.name} (${configurationService.getValue(signal.settingsKey + ".announcement")})` : signal.name,
      signal,
      buttons: userGestureSignals.includes(signal) ? [{
        iconClass: ThemeIcon.asClassName(Codicon.settingsGear),
        tooltip: localize(7804, null),
        alwaysVisible: true
      }] : []
    })).sort((a, b) => a.label.localeCompare(b.label));
    const disposables = new DisposableStore();
    const qp = disposables.add(quickInputService.createQuickPick());
    qp.items = items;
    qp.selectedItems = items.filter((i2) => accessibilitySignalService.isAnnouncementEnabled(i2.signal) || userGestureSignals.includes(i2.signal) && configurationService.getValue(i2.signal.settingsKey + ".announcement") !== "never");
    const screenReaderOptimized = accessibilityService.isScreenReaderOptimized();
    disposables.add(qp.onDidAccept(() => {
      if (!screenReaderOptimized) {
        qp.hide();
        return;
      }
      const enabledAnnouncements = qp.selectedItems.map((i2) => i2.signal);
      const disabledAnnouncements = AccessibilitySignal.allAccessibilitySignals.filter((cue) => !!cue.legacyAnnouncementSettingsKey && !enabledAnnouncements.includes(cue));
      for (const signal of enabledAnnouncements) {
        let { sound, announcement } = configurationService.getValue(signal.settingsKey);
        announcement = userGestureSignals.includes(signal) ? "userGesture" : signal.announcementMessage && accessibilityService.isScreenReaderOptimized() ? "auto" : void 0;
        configurationService.updateValue(signal.settingsKey, { sound, announcement });
      }
      for (const signal of disabledAnnouncements) {
        const announcement = getDisabledSettingValue(userGestureSignals.includes(signal), true);
        const sound = configurationService.getValue(signal.settingsKey + ".sound");
        const value2 = announcement ? { sound, announcement } : { sound };
        configurationService.updateValue(signal.settingsKey, value2);
      }
      qp.hide();
    }));
    disposables.add(qp.onDidTriggerItemButton((e) => {
      preferencesService.openUserSettings({ jsonEditor: true, revealSetting: { key: e.item.signal.settingsKey, edit: true } });
    }));
    disposables.add(qp.onDidHide(() => disposables.dispose()));
    qp.placeholder = screenReaderOptimized ? localize(7802, null) : localize(7803, null);
    qp.canSelectMany = true;
    await qp.show();
  }
};
export { getDisabledSettingValue, ShowSignalSoundHelp, ShowAccessibilityAnnouncementHelp };
